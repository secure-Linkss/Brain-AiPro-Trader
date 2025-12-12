from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict
from datetime import datetime, timedelta
import asyncio
import aiohttp
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
from textblob import TextBlob
import logging
import os
from collections import defaultdict
import hashlib

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="News Sentiment Analysis Service",
    description="Real-time news aggregation and sentiment analysis for trading signals",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize sentiment analyzers
vader_analyzer = SentimentIntensityAnalyzer()

# In-memory cache for news articles
news_cache: Dict[str, List[Dict]] = defaultdict(list)
sentiment_cache: Dict[str, Dict] = {}

# Configuration
NEWS_API_KEY = os.getenv("NEWS_API_KEY", "")
CACHE_DURATION = 300  # 5 minutes

# Pydantic models
class NewsArticle(BaseModel):
    title: str
    description: Optional[str]
    url: str
    source: str
    publishedAt: datetime
    sentiment_score: Optional[float] = None
    sentiment_label: Optional[str] = None

class SentimentAnalysisRequest(BaseModel):
    text: str

class SentimentAnalysisResponse(BaseModel):
    text: str
    vader_score: float
    textblob_score: float
    combined_score: float
    sentiment_label: str
    confidence: float

class MarketSentimentResponse(BaseModel):
    symbol: str
    overall_sentiment: float
    sentiment_label: str
    positive_count: int
    negative_count: int
    neutral_count: int
    total_articles: int
    trending_topics: List[str]
    last_updated: datetime

# Helper functions
def get_cache_key(symbol: str) -> str:
    """Generate cache key for symbol"""
    return f"news_{symbol.upper()}"

def calculate_sentiment(text: str) -> Dict:
    """Calculate sentiment using Local LLM with VADER/TextBlob fallback"""
    
    # 1. Local LLM Analysis (Primary)
    try:
        from llm_engine import llm_engine
        llm_result = llm_engine.analyze_sentiment(text)
        llm_score = llm_result['score'] # -1.0 to 1.0
    except Exception as e:
        logger.warning(f"Local LLM failed, falling back to heuristics: {e}")
        llm_score = 0.0

    # 2. VADER sentiment (Secondary/Validation)
    vader_scores = vader_analyzer.polarity_scores(text)
    vader_compound = vader_scores['compound']
    
    # 3. TextBlob sentiment (Tertiary)
    blob = TextBlob(text)
    textblob_score = blob.sentiment.polarity
    
    # Combined score (Unknown/LLM weighted heavily)
    # Weight: LLM 60%, VADER 25%, TextBlob 15%
    # If LLM failed (0.0), rebalance weights
    
    if llm_score != 0.0:
        combined_score = (llm_score * 0.6) + (vader_compound * 0.25) + (textblob_score * 0.15)
    else:
        combined_score = (vader_compound * 0.6) + (textblob_score * 0.4)
    
    # Determine sentiment label
    if combined_score >= 0.1: # Slightly higher threshold
        label = "positive"
    elif combined_score <= -0.1:
        label = "negative"
    else:
        label = "neutral"
    
    return {
        "vader_score": vader_compound,
        "textblob_score": textblob_score,
        "llm_score": llm_score,
        "combined_score": combined_score,
        "sentiment_label": label,
        "confidence": abs(combined_score)
    }


async def fetch_news_from_newsapi(symbol: str, limit: int = 20) -> List[Dict]:
    """Fetch news from NewsAPI"""
    if not NEWS_API_KEY:
        logger.warning("NEWS_API_KEY not set, using mock data")
        return generate_mock_news(symbol, limit)
    
    try:
        query = f"{symbol} OR cryptocurrency OR bitcoin" if symbol.upper() in ["BTC", "ETH"] else symbol
        url = f"https://newsapi.org/v2/everything?q={query}&language=en&sortBy=publishedAt&pageSize={limit}&apiKey={NEWS_API_KEY}"
        
        async with aiohttp.ClientSession() as session:
            async with session.get(url, timeout=aiohttp.ClientTimeout(total=10)) as response:
                if response.status == 200:
                    data = await response.json()
                    return data.get('articles', [])
                else:
                    logger.error(f"NewsAPI error: {response.status}")
                    return generate_mock_news(symbol, limit)
    except Exception as e:
        logger.error(f"Error fetching news: {e}")
        return generate_mock_news(symbol, limit)

def generate_mock_news(symbol: str, limit: int) -> List[Dict]:
    """
    DEPRECATED: Replaced by Real News Scraper.
    Fetches real live data from RSS feeds if API key is missing.
    """
    try:
        from scraper import news_scraper
        logger.info(f"Using RSS Scraper for {symbol}...")
        articles = news_scraper.fetch_latest_news(symbol, limit)
        if articles:
            return articles
            
        logger.warning(f"Scraper found no news for {symbol}, returning empty list.")
        return []
    except Exception as e:
        logger.error(f"Scraper failed: {e}")
        return []


async def analyze_news_sentiment(articles: List[Dict]) -> List[NewsArticle]:
    """Analyze sentiment for each article"""
    analyzed_articles = []
    
    for article in articles:
        try:
            # Combine title and description for analysis
            text = f"{article.get('title', '')} {article.get('description', '')}"
            
            if not text.strip():
                continue
            
            # Calculate sentiment
            sentiment = calculate_sentiment(text)
            
            # Create NewsArticle object
            news_article = NewsArticle(
                title=article.get('title', ''),
                description=article.get('description', ''),
                url=article.get('url', ''),
                source=article.get('source', {}).get('name', 'Unknown'),
                publishedAt=datetime.fromisoformat(article.get('publishedAt', datetime.now().isoformat()).replace('Z', '+00:00')),
                sentiment_score=sentiment['combined_score'],
                sentiment_label=sentiment['sentiment_label']
            )
            
            analyzed_articles.append(news_article)
        except Exception as e:
            logger.error(f"Error analyzing article: {e}")
            continue
    
    return analyzed_articles

# API Endpoints
@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "service": "News Sentiment Analysis API",
        "version": "1.0.0",
        "status": "operational"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "service": "news-agent",
        "cache_size": len(news_cache)
    }

@app.post("/analyze", response_model=SentimentAnalysisResponse)
async def analyze_text(request: SentimentAnalysisRequest):
    """Analyze sentiment of provided text"""
    try:
        sentiment = calculate_sentiment(request.text)
        return SentimentAnalysisResponse(
            text=request.text[:100] + "..." if len(request.text) > 100 else request.text,
            **sentiment
        )
    except Exception as e:
        logger.error(f"Error in sentiment analysis: {e}")
        raise HTTPException(status_code=500, detail=str(e))

class LLMRequest(BaseModel):
    prompt: str
    symbol: Optional[str] = None # Optional context hint
    max_tokens: int = 150
    temperature: float = 0.7

@app.post("/llm/generate")
async def generate_text(request: LLMRequest):
    """
    Generate text using the Local LLM with REAL-TIME Market Data Injection.
    """
    try:
        from llm_engine import llm_engine
        from market_data import market_fetcher
        
        if llm_engine._model is None:
            try:
                llm_engine.load_model()
            except Exception as e:
                logger.warning(f"Could not load LLM model: {e}. Proceeding without LLM.")
                # We can return early or just let market_context be empty if that's acceptable
                # For this specific endpoint, if LLM is down, we can't generate text at all.
                # However, the user asked to not crash. 
                # If LLM load fails, we should probably raise an error or return a fallback. 
                # But let's assume we want to TRY loading.
                raise HTTPException(status_code=503, detail="Local LLM is unavailable.")
            
        # 1. Fetch Live Context if symbol provided or auto-detected in prompt
        market_context = ""
        target_symbol = request.symbol
        
        # Simple auto-detection if not provided
        if not target_symbol:
            words = request.prompt.split()
            for w in words:
                clean_w = w.strip(".,!?").upper()
                if clean_w in ['BTC', 'ETH', 'EURUSD', 'GBPUSD', 'AAPL', 'TSLA', 'NVDA', 'SOL']:
                    target_symbol = clean_w
                    break
        
        if target_symbol:
            data = market_fetcher.get_live_data(target_symbol)
            market_context = data.get("context", "")
            
        # 2. Construct Augmented Prompt
        system_prompt = "You are an elite financial analyst suitable for professional trading."
        user_prompt = request.prompt
        
        if market_context:
            system_prompt += f" {market_context} Use this live data for your analysis."
            
        full_prompt = f"<|system|>{system_prompt}<|user|>{user_prompt}<|assistant|>"
            
        output = llm_engine._model(
            full_prompt,
            max_tokens=request.max_tokens,
            stop=["</s>"],
            echo=False,
            temperature=request.temperature
        )
        return {
            "text": output['choices'][0]['text'].strip(),
            "market_data_used": bool(market_context)
        }
    except Exception as e:
        logger.error(f"LLM Generation failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))



@app.get("/news/{symbol}", response_model=List[NewsArticle])
async def get_news(
    symbol: str,
    limit: int = 20,
    force_refresh: bool = False
):
    """Get news articles with sentiment analysis for a symbol"""
    try:
        cache_key = get_cache_key(symbol)
        
        # Check cache
        if not force_refresh and cache_key in news_cache:
            cached_data = news_cache[cache_key]
            if cached_data and (datetime.now() - cached_data[0].publishedAt).seconds < CACHE_DURATION:
                logger.info(f"Returning cached news for {symbol}")
                return cached_data
        
        # Fetch fresh news
        logger.info(f"Fetching fresh news for {symbol}")
        articles = await fetch_news_from_newsapi(symbol, limit)
        
        # Analyze sentiment
        analyzed_articles = await analyze_news_sentiment(articles)
        
        # Update cache
        news_cache[cache_key] = analyzed_articles
        
        return analyzed_articles
    except Exception as e:
        logger.error(f"Error fetching news: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/sentiment/{symbol}", response_model=MarketSentimentResponse)
async def get_market_sentiment(symbol: str, limit: int = 50):
    """Get aggregated market sentiment for a symbol"""
    try:
        # Get news articles
        articles = await get_news(symbol, limit=limit)
        
        if not articles:
            raise HTTPException(status_code=404, detail="No news articles found")
        
        # Calculate aggregate sentiment
        positive_count = sum(1 for a in articles if a.sentiment_label == "positive")
        negative_count = sum(1 for a in articles if a.sentiment_label == "negative")
        neutral_count = sum(1 for a in articles if a.sentiment_label == "neutral")
        
        # Calculate overall sentiment
        total_sentiment = sum(a.sentiment_score for a in articles if a.sentiment_score)
        overall_sentiment = total_sentiment / len(articles) if articles else 0
        
        # Determine overall label
        if overall_sentiment >= 0.1:
            sentiment_label = "bullish"
        elif overall_sentiment <= -0.1:
            sentiment_label = "bearish"
        else:
            sentiment_label = "neutral"
        
        # Extract trending topics (simplified)
        trending_topics = [
            "technical analysis",
            "market momentum",
            "trading volume"
        ]
        
        return MarketSentimentResponse(
            symbol=symbol.upper(),
            overall_sentiment=overall_sentiment,
            sentiment_label=sentiment_label,
            positive_count=positive_count,
            negative_count=negative_count,
            neutral_count=neutral_count,
            total_articles=len(articles),
            trending_topics=trending_topics,
            last_updated=datetime.now()
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error calculating market sentiment: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/cache/{symbol}")
async def clear_cache(symbol: str):
    """Clear cache for a specific symbol"""
    cache_key = get_cache_key(symbol)
    if cache_key in news_cache:
        del news_cache[cache_key]
        return {"message": f"Cache cleared for {symbol}"}
    return {"message": f"No cache found for {symbol}"}

@app.delete("/cache")
async def clear_all_cache():
    """Clear all cached data"""
    news_cache.clear()
    sentiment_cache.clear()
    return {"message": "All cache cleared"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002)
