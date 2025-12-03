"""
Live Market Data Service
Fetches real-time OHLCV data from Yahoo Finance (yfinance)
Replaces all mock data providers for production use.
"""

import yfinance as yf
import pandas as pd
import asyncio
from typing import Optional, List
from datetime import datetime, timedelta

class LiveDataProvider:
    """
    Production-grade data provider fetching real-time market data.
    Supports: Stocks, Crypto, Forex, Indices
    """
    
    def __init__(self):
        self.cache = {}
        self.cache_expiry = {}
        
    async def get_ohlcv(
        self, 
        symbol: str, 
        timeframe: str = "1h", 
        limit: int = 500
    ) -> Optional[pd.DataFrame]:
        """
        Fetch OHLCV data from Yahoo Finance
        
        Args:
            symbol: Ticker symbol (e.g., "BTC-USD", "EURUSD=X", "AAPL")
            timeframe: Interval (1m, 5m, 15m, 30m, 1h, 1d, 1wk, 1mo)
            limit: Number of candles to fetch
            
        Returns:
            DataFrame with Open, High, Low, Close, Volume
        """
        # Map generic timeframes to yfinance format
        tf_map = {
            "1m": "1m", "5m": "5m", "15m": "15m", "30m": "30m",
            "1h": "1h", "4h": "1h", # yfinance doesn't support 4h, need to resample
            "1d": "1d", "1w": "1wk", "1M": "1mo"
        }
        
        yf_interval = tf_map.get(timeframe, "1h")
        
        # Determine period based on limit and timeframe
        period = "1mo" # Default
        if timeframe in ["1m", "5m"]: period = "5d"
        elif timeframe in ["15m", "30m"]: period = "1mo"
        elif timeframe == "1h": period = "2y"
        elif timeframe == "1d": period = "5y"
        elif timeframe == "1w": period = "10y"
        
        try:
            # Run blocking yfinance call in thread pool
            loop = asyncio.get_event_loop()
            df = await loop.run_in_executor(None, self._fetch_yf, symbol, period, yf_interval)
            
            if df is None or df.empty:
                return None
                
            # Rename columns to standard lowercase
            df.columns = [c.lower() for c in df.columns]
            
            # Handle 4H resampling if needed
            if timeframe == "4h":
                df = self._resample_to_4h(df)
                
            # Limit rows
            df = df.tail(limit)
            
            return df
            
        except Exception as e:
            print(f"[DATA ERROR] Failed to fetch {symbol}: {str(e)}")
            return None
            
    def _fetch_yf(self, symbol: str, period: str, interval: str) -> pd.DataFrame:
        """Helper to fetch data synchronously"""
        ticker = yf.Ticker(symbol)
        return ticker.history(period=period, interval=interval)
        
    def _resample_to_4h(self, df: pd.DataFrame) -> pd.DataFrame:
        """Resample 1H data to 4H candles"""
        agg_dict = {
            'open': 'first',
            'high': 'max',
            'low': 'min',
            'close': 'last',
            'volume': 'sum'
        }
        return df.resample('4H').agg(agg_dict).dropna()

    async def get_current_price(self, symbol: str) -> float:
        """Get real-time current price"""
        df = await self.get_ohlcv(symbol, timeframe="1m", limit=1)
        if df is not None and not df.empty:
            return df['close'].iloc[-1]
        return 0.0

# Export singleton
live_data = LiveDataProvider()
