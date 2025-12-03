"""
Brain AiPro Trader - Central API Gateway
Integrates all advanced trading services into a single production-ready FastAPI application.

Services:
1. Backtesting Engine
2. Multi-Timeframe Confluence
3. AI Sentiment Analysis (Multi-Provider)
4. Smart Money Concepts Detection
5. Economic Calendar (FRED + ForexFactory)
6. Security & Authentication
7. Live Market Data (Yahoo Finance)
"""

import uvicorn
import asyncio
from fastapi import FastAPI, HTTPException, BackgroundTasks, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, List, Optional
from datetime import datetime

# --- Import Services ---
from backtesting_engine.coordinator import BacktestingCoordinator, BacktestScheduler
from backtesting_engine.agents import StrategyCandidate, BacktestMetrics

from mtf_confluence.analyzer import TimeframeAnalyzer, Timeframe, ConfluenceResult
from ai_sentiment.multi_provider import MultiAIProvider, AIProvider
from smc_detector.detector import SMCDetector
from economic_calendar.service import calendar_service, EconomicEvent
from security.middleware import SecurityMiddleware, require_security_check
from security.two_factor import TwoFactorService
from data_provider.live_client import live_data
from risk_management.analytics import PositionSizer, PortfolioAnalytics, AssetClass

# --- Configuration ---
app = FastAPI(
    title="Brain AiPro Trader API",
    version="2.0.0",
    description="Advanced Institutional Trading Platform API"
)

# --- Security Middleware ---
# Apply global security middleware (Rate limiting, Malware detection, etc.)
app.add_middleware(SecurityMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure for production domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Service Instances ---
coordinator: Optional[BacktestingCoordinator] = None
scheduler: Optional[BacktestScheduler] = None
sentiment_provider: Optional[MultiAIProvider] = None
smc_detector: Optional[SMCDetector] = None
mtf_analyzer: Optional[TimeframeAnalyzer] = None

# --- Data Models ---
class SentimentRequest(BaseModel):
    text: str
    provider: Optional[str] = None

class AnalysisRequest(BaseModel):
    symbol: str
    timeframes: Optional[List[str]] = None

class ManualBacktestRequest(BaseModel):
    strategy_name: str
    parameters: Dict
    asset_class: str
    symbol: str
    timeframe: str
    start_date: datetime
    end_date: datetime
    initial_capital: float = 10000

class PositionSizeRequest(BaseModel):
    account_balance: float
    risk_percentage: float
    stop_loss_pips: float
    asset_class: str
    pair: str
    price: float
    contract_size: Optional[float] = 100000

class PortfolioAnalyticsRequest(BaseModel):
    trades: List[Dict[str, float]]

# --- Startup Event ---
@app.on_event("startup")
async def startup_event():
    """Initialize all advanced services"""
    global coordinator, scheduler, sentiment_provider, smc_detector, mtf_analyzer
    
    print("[SYSTEM] Initializing Advanced Services...")
    
    # 1. Backtesting Service
    coordinator = BacktestingCoordinator(
        db_connection=None, # Inject real DB
        data_service=live_data, # Use Live Data
        notification_service=None
    )
    scheduler = BacktestScheduler(coordinator)
    
    # 2. AI Sentiment Service
    # Initialize with empty keys - will default to Free LLMs (VADER/TextBlob/Rule-Based)
    # Admin can add keys later via API
    sentiment_provider = MultiAIProvider(api_keys={})
    print("[AI] Sentiment Service initialized (Free LLM mode active)")
    
    # 3. SMC Detector
    smc_detector = SMCDetector(min_ob_strength=0.5)
    print("[SMC] Smart Money Concepts Detector initialized")
    
    # 4. MTF Analyzer
    # Injecting REAL LiveDataProvider
    mtf_analyzer = TimeframeAnalyzer(live_data)
    print("[MTF] Multi-Timeframe Analyzer initialized with LIVE DATA")
    
    print("[SYSTEM] All systems go. Connected to Live Markets.")

# --- Endpoints ---

@app.get("/")
async def root():
    return {
        "service": "Brain AiPro Trader API",
        "status": "operational",
        "version": "2.0.0",
        "data_source": "Live Market Data (yfinance)",
        "features": [
            "Backtesting",
            "MTF Confluence",
            "AI Sentiment",
            "SMC Detection",
            "Economic Calendar",
            "Security"
        ]
    }

# --- 1. Economic Calendar Endpoints ---

@app.get("/calendar/upcoming", dependencies=[Depends(require_security_check)])
async def get_upcoming_events(days: int = 7):
    """Get upcoming economic events (FRED + ForexFactory)"""
    try:
        events = await calendar_service.get_upcoming_events(days)
        return events
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/calendar/alert")
async def check_calendar_alert():
    """Check for immediate high-impact event alerts"""
    alert = await calendar_service.check_impact_alert()
    return {"alert": alert}

# --- 2. AI Sentiment Endpoints ---

@app.post("/sentiment/analyze", dependencies=[Depends(require_security_check)])
async def analyze_sentiment(request: SentimentRequest):
    """
    Analyze sentiment of text using Multi-Provider AI
    Falls back to free LLMs if no API keys configured
    """
    if not sentiment_provider:
        raise HTTPException(status_code=503, detail="Service not initialized")
        
    try:
        # Convert string provider to Enum if provided
        provider_enum = None
        if request.provider:
            try:
                provider_enum = AIProvider(request.provider)
            except ValueError:
                pass
                
        result = await sentiment_provider.analyze_sentiment(
            text=request.text,
            preferred_provider=provider_enum
        )
        
        return {
            "sentiment": result.sentiment.value,
            "score": result.numeric_score,
            "confidence": result.confidence,
            "provider": result.provider.value,
            "keywords": result.keywords_extracted,
            "processing_time_ms": result.processing_time_ms
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/admin/ai-keys", dependencies=[Depends(require_security_check)])
async def update_ai_keys(keys: Dict[str, str]):
    """Update API keys for AI providers (Admin only)"""
    if not sentiment_provider:
        raise HTTPException(status_code=503, detail="Service not initialized")
        
    sentiment_provider.api_keys.update(keys)
    return {"status": "updated", "active_providers": list(sentiment_provider.api_keys.keys())}

# --- 3. MTF Confluence Endpoints ---

@app.post("/analysis/confluence", dependencies=[Depends(require_security_check)])
async def analyze_confluence(request: AnalysisRequest):
    """Run Multi-Timeframe Confluence Analysis on LIVE DATA"""
    if not mtf_analyzer:
        raise HTTPException(status_code=503, detail="Service not initialized")
        
    try:
        # Convert string timeframes to Enum
        tfs = None
        if request.timeframes:
            tfs = [Timeframe(tf) for tf in request.timeframes]
            
        result = await mtf_analyzer.analyze_symbol(request.symbol, tfs)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- 4. SMC Detection Endpoints ---

@app.post("/analysis/smc", dependencies=[Depends(require_security_check)])
async def detect_smc(symbol: str, timeframe: str = "1h"):
    """Detect Smart Money Concepts (OB, FVG, Liquidity) on LIVE DATA"""
    if not smc_detector:
        raise HTTPException(status_code=503, detail="Service not initialized")
        
    try:
        # Fetch REAL data from LiveDataProvider
        df = await live_data.get_ohlcv(symbol, timeframe=timeframe, limit=200)
        
        if df is None or df.empty:
            raise HTTPException(status_code=404, detail=f"No data found for {symbol}")
        
        return {
            "symbol": symbol,
            "timeframe": timeframe,
            "current_price": df['close'].iloc[-1],
            "order_blocks": smc_detector.detect_order_blocks(df),
            "fair_value_gaps": smc_detector.detect_fair_value_gaps(df),
            "liquidity_sweeps": smc_detector.detect_liquidity_sweeps(df),
            "break_of_structure": smc_detector.detect_break_of_structure(df),
            "change_of_character": smc_detector.detect_change_of_character(df)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- 5. Risk Management Endpoints ---

@app.post("/risk/position-size", dependencies=[Depends(require_security_check)])
async def calculate_position_size(request: PositionSizeRequest):
    """Calculate optimal position size based on risk parameters"""
    try:
        asset_class_enum = AssetClass(request.asset_class.lower())
        result = PositionSizer.calculate_position_size(
            account_balance=request.account_balance,
            risk_percentage=request.risk_percentage,
            stop_loss_pips=request.stop_loss_pips,
            asset_class=asset_class_enum,
            pair=request.pair,
            price=request.price,
            contract_size=request.contract_size
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/risk/portfolio-analytics", dependencies=[Depends(require_security_check)])
async def analyze_portfolio(request: PortfolioAnalyticsRequest):
    """Calculate comprehensive portfolio metrics"""
    try:
        metrics = PortfolioAnalytics.calculate_metrics(request.trades)
        return metrics
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- 6. Market Data Endpoints ---

@app.get("/market/price/{symbol}")
async def get_market_price(symbol: str):
    """Get current market price and statistics for a symbol"""
    try:
        # Fetch current data
        df = await live_data.get_ohlcv(symbol, timeframe="1d", limit=2)
        
        if df is None or df.empty:
            raise HTTPException(status_code=404, detail=f"No data found for {symbol}")
        
        current_price = df['close'].iloc[-1]
        previous_price = df['close'].iloc[-2] if len(df) > 1 else current_price
        
        # Calculate change
        change_pct = ((current_price - previous_price) / previous_price) * 100 if previous_price != 0 else 0
        
        # Format volume
        volume = df['volume'].iloc[-1]
        if volume >= 1_000_000_000:
            volume_str = f"{volume / 1_000_000_000:.1f}B"
        elif volume >= 1_000_000:
            volume_str = f"{volume / 1_000_000:.0f}M"
        elif volume >= 1_000:
            volume_str = f"{volume / 1_000:.0f}K"
        else:
            volume_str = str(int(volume))
        
        return {
            "symbol": symbol,
            "price": round(current_price, 2),
            "change_pct": round(change_pct, 2),
            "volume": volume_str,
            "high": round(df['high'].iloc[-1], 2),
            "low": round(df['low'].iloc[-1], 2),
            "open": round(df['open'].iloc[-1], 2)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/market/ohlcv/{symbol}")
async def get_market_ohlcv(symbol: str, timeframe: str = "1d", limit: int = 100):
    """Get historical OHLCV data for a symbol"""
    try:
        df = await live_data.get_ohlcv(symbol, timeframe=timeframe, limit=limit)
        
        if df is None or df.empty:
            raise HTTPException(status_code=404, detail=f"No data found for {symbol}")
        
        # Convert DataFrame to list of dictionaries
        data = []
        for index, row in df.iterrows():
            data.append({
                "time": index.strftime("%Y-%m-%d") if timeframe == "1d" else index.strftime("%Y-%m-%d %H:%M"),
                "open": row['open'],
                "high": row['high'],
                "low": row['low'],
                "close": row['close'],
                "volume": row['volume']
            })
            
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- 7. Backtesting Endpoints (Existing) ---

@app.post("/backtest/manual")
async def run_manual_backtest(request: ManualBacktestRequest):
    if not coordinator:
        raise HTTPException(status_code=503, detail="Coordinator not initialized")
    return await coordinator.manual_backtest(
        strategy_params={'name': request.strategy_name, **request.parameters},
        asset_class=request.asset_class,
        symbol=request.symbol,
        timeframe=request.timeframe,
        start_date=request.start_date,
        end_date=request.end_date
    )

@app.get("/strategies/queue")
async def get_strategy_queue():
    if not coordinator:
        raise HTTPException(status_code=503, detail="Coordinator not initialized")
    return coordinator.get_queue_status()

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8003)
