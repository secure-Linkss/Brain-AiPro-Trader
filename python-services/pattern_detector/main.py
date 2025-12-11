"""
AI Trading Platform - Pattern Detector Microservice
FastAPI service for detecting trading patterns using technical analysis
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
import uvicorn
import logging
import pandas as pd
from orchestrator import orchestrator

from detectors.harmonics import HarmonicDetector
from detectors.chart_patterns import ChartPatternDetector
from detectors.breakouts import BreakoutDetector
from detectors.ensemble import EnsembleDetector
from indicators import atr, rsi, macd, vwap, adx, obv, ema_ribbon

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="AI Trading Pattern Detector",
    description="Microservice for detecting trading patterns and generating signals",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure based on environment
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================================
# Models
# ============================================================================

class Candle(BaseModel):
    """OHLCV candle data"""
    timestamp: datetime
    open: float
    high: float
    low: float
    close: float
    volume: float


class DetectionRequest(BaseModel):
    """Request for pattern detection"""
    symbol: str
    timeframe: str
    candles: List[Candle] = Field(..., min_items=50)
    strategies: Optional[List[str]] = None  # If None, run all strategies
    min_confidence: float = Field(default=60.0, ge=0, le=100)
    require_volume_confirmation: bool = True
    require_htf_confirmation: bool = False
    htf_candles: Optional[List[Candle]] = None


class PatternPoint(BaseModel):
    """A point in a detected pattern"""
    timestamp: datetime
    price: float
    label: str  # e.g., "left_shoulder", "head", "right_shoulder"


class DetectedPattern(BaseModel):
    """A detected trading pattern"""
    strategy: str
    pattern_type: str  # "bullish", "bearish", "neutral"
    confidence: float
    entry_price: Optional[float] = None
    stop_loss: Optional[float] = None
    take_profit_1: Optional[float] = None
    take_profit_2: Optional[float] = None
    take_profit_3: Optional[float] = None
    take_profit_4: Optional[float] = None
    coordinates: List[PatternPoint]
    indicators: Dict[str, Any]
    explanation: str
    detected_at: datetime


class DetectionResponse(BaseModel):
    """Response from pattern detection"""
    symbol: str
    timeframe: str
    patterns: List[DetectedPattern]
    ensemble_signal: Optional[str] = None  # "BUY", "SELL", "HOLD"
    ensemble_confidence: Optional[float] = None
    ensemble_explanation: Optional[str] = None


# ============================================================================
# Initialize Detectors
# ============================================================================

harmonic_detector = HarmonicDetector()
chart_pattern_detector = ChartPatternDetector()
breakout_detector = BreakoutDetector()
ensemble_detector = EnsembleDetector()


# ============================================================================
# Health Check
# ============================================================================

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "pattern-detector",
        "timestamp": datetime.utcnow().isoformat()
    }


# ============================================================================
# Pattern Detection Endpoints
# ============================================================================

@app.post("/detect", response_model=DetectionResponse)
async def detect_patterns(request: DetectionRequest):
    """
    Detect trading patterns in the provided candle data
    
    This endpoint runs multiple pattern detection strategies and returns
    all detected patterns along with an ensemble signal if multiple
    strategies confirm.
    """
    try:
        logger.info(f"Detecting patterns for {request.symbol} on {request.timeframe}")
        
        # Convert candles to numpy arrays for faster processing
        candles_data = {
            'timestamp': [c.timestamp for c in request.candles],
            'open': [c.open for c in request.candles],
            'high': [c.high for c in request.candles],
            'low': [c.low for c in request.candles],
            'close': [c.close for c in request.candles],
            'volume': [c.volume for c in request.candles],
        }
        
        detected_patterns = []
        
        # Determine which strategies to run
        strategies_to_run = request.strategies or [
            'head_shoulders', 'inverse_head_shoulders',
            'double_top', 'double_bottom',
            'triple_top', 'triple_bottom',
            'ascending_triangle', 'descending_triangle', 'symmetrical_triangle',
            'rising_wedge', 'falling_wedge',
            'bull_flag', 'bear_flag', 'pennant',
            'rectangle',
            'gartley', 'bat', 'butterfly', 'crab', 'cypher', 'shark', 'abcd',
            'breakout_pullback',
            'ema_cross',
            'vwap_reversion',
            'order_block',
            'mean_reversion',
            'volume_profile',
            'market_structure'
        ]
        
        # Run chart pattern detection
        if any(s in strategies_to_run for s in [
            'head_shoulders', 'inverse_head_shoulders',
            'double_top', 'double_bottom', 'triple_top', 'triple_bottom',
            'ascending_triangle', 'descending_triangle', 'symmetrical_triangle',
            'rising_wedge', 'falling_wedge',
            'bull_flag', 'bear_flag', 'pennant', 'rectangle'
        ]):
            chart_patterns = chart_pattern_detector.detect(
                candles_data,
                strategies=strategies_to_run,
                min_confidence=request.min_confidence
            )
            detected_patterns.extend(chart_patterns)
        
        # Run harmonic pattern detection
        if any(s in strategies_to_run for s in [
            'gartley', 'bat', 'butterfly', 'crab', 'cypher', 'shark', 'abcd'
        ]):
            harmonic_patterns = harmonic_detector.detect(
                candles_data,
                strategies=strategies_to_run,
                min_confidence=request.min_confidence
            )
            detected_patterns.extend(harmonic_patterns)
        
        # Run breakout detection
        if any(s in strategies_to_run for s in [
            'breakout_pullback', 'order_block', 'market_structure'
        ]):
            breakout_patterns = breakout_detector.detect(
                candles_data,
                strategies=strategies_to_run,
                min_confidence=request.min_confidence,
                require_volume_confirmation=request.require_volume_confirmation
            )
            detected_patterns.extend(breakout_patterns)
        
        # Run ensemble analysis
        ensemble_result = ensemble_detector.analyze(
            detected_patterns,
            candles_data,
            min_strategies=2,  # Require at least 2 strategies to confirm
            require_volume_confirmation=request.require_volume_confirmation
        )
        
        return DetectionResponse(
            symbol=request.symbol,
            timeframe=request.timeframe,
            patterns=detected_patterns,
            ensemble_signal=ensemble_result.get('signal'),
            ensemble_confidence=ensemble_result.get('confidence'),
            ensemble_explanation=ensemble_result.get('explanation')
        )
        
    except Exception as e:
        logger.error(f"Error detecting patterns: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/indicators")
async def calculate_indicators(request: DetectionRequest):
    """
    Calculate technical indicators for the provided candle data
    """
    try:
        candles_data = {
            'high': [c.high for c in request.candles],
            'low': [c.low for c in request.candles],
            'close': [c.close for c in request.candles],
            'volume': [c.volume for c in request.candles],
        }
        
        indicators_result = {
            'atr': atr.calculate(candles_data['high'], candles_data['low'], candles_data['close']),
            'rsi': rsi.calculate(candles_data['close']),
            'macd': macd.calculate(candles_data['close']),
            'adx': adx.calculate(candles_data['high'], candles_data['low'], candles_data['close']),
            'obv': obv.calculate(candles_data['close'], candles_data['volume']),
            'ema_ribbon': ema_ribbon.calculate(candles_data['close']),
        }
        
        # VWAP requires typical price
        typical_price = [(h + l + c) / 3 for h, l, c in zip(
            candles_data['high'], candles_data['low'], candles_data['close']
        )]
        indicators_result['vwap'] = vwap.calculate(typical_price, candles_data['volume'])
        
        return indicators_result
        
    except Exception as e:
        logger.error(f"Error calculating indicators: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

class GuruAnalysisResponse(BaseModel):
    """Response from Guru-Level Analysis"""
    symbol: str
    timeframe: str
    decision: str
    confidence: float
    confidence_label: str
    entry: float
    stop_loss: float
    targets: List[Dict[str, Any]]
    supporting_agents: List[Dict[str, Any]]
    opposing_agents: List[Dict[str, Any]]
    market_regime: Dict[str, Any]
    veto_status: bool
    veto_reasons: List[str]
    timestamp: float

@app.post("/analyze/guru", response_model=GuruAnalysisResponse)
async def analyze_guru(request: DetectionRequest):
    """
    Run the full Guru-Level Multi-Agent Orchestrator
    """
    try:
        logger.info(f"Running Guru Analysis for {request.symbol} on {request.timeframe}")
        
        # Convert to DataFrame
        df = pd.DataFrame([c.dict() for c in request.candles])
        # Ensure timestamp is datetime
        if not pd.api.types.is_datetime64_any_dtype(df['timestamp']):
            df['timestamp'] = pd.to_datetime(df['timestamp'])
        df.set_index('timestamp', inplace=True)
        
        # Run Orchestrator
        # Note: HTF data would be passed here if available in request
        result = orchestrator.process_market_data(df, request.symbol, request.timeframe)
        
        return GuruAnalysisResponse(
            symbol=result.symbol,
            timeframe=result.timeframe,
            decision=result.decision,
            confidence=result.final_confidence,
            confidence_label=result.confidence_label,
            entry=result.entry or 0.0,
            stop_loss=result.stop_loss or 0.0,
            targets=result.targets,
            supporting_agents=result.supporting_agents,
            opposing_agents=result.opposing_agents,
            market_regime=result.market_regime,
            veto_status=result.veto_status,
            veto_reasons=result.veto_reasons,
            timestamp=result.timestamp
        )
        
    except Exception as e:
        logger.error(f"Error in Guru Analysis: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))
# ============================================================================
# Main
# ============================================================================

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8001,
        reload=True,
        log_level="info"
    )
