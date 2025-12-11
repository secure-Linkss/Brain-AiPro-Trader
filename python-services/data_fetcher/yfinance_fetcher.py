"""
SUPER ADVANCED YFinance Data Fetcher
Fetches historical OHLCV data for all 33 trading pairs across 7 timeframes
with retry logic, rate limiting, and comprehensive error handling
"""

import yfinance as yf
import pandas as pd
import numpy as np
from typing import Dict, List, Optional, Tuple
from datetime import datetime, timedelta
import time
import logging
from dataclasses import dataclass
import asyncio
from concurrent.futures import ThreadPoolExecutor, as_completed

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


from .cache_manager import CacheManager

@dataclass
class FetchConfig:
    """Configuration for data fetching"""
    max_retries: int = 3
    retry_delay: float = 2.0  # seconds
    rate_limit_delay: float = 0.5  # seconds between requests
    timeout: int = 30  # seconds
    validate_data: bool = True
    cache_results: bool = True


class YFinanceDataFetcher:
    """
    SUPER ADVANCED YFinance Data Fetcher
    
    Features:
    - Fetches all 33 trading pairs
    - Supports all 7 timeframes (5m, 15m, 30m, 1hr, 4hr, 1d, 1wk)
    - Automatic retry with exponential backoff
    - Rate limiting to avoid API blocks
    - Data validation and cleaning
    - Error recovery and logging
    - Parallel fetching for speed
    - Smart Caching (Incremental Updates)
    """
    
    # Trading pairs configuration (33 instruments)
    TRADING_PAIRS = {
        # Forex - USD Majors (5)
        'EURUSD': 'EURUSD=X',
        'GBPUSD': 'GBPUSD=X',
        'USDJPY': 'USDJPY=X',
        'USDCHF': 'USDCHF=X',
        'USDCAD': 'USDCAD=X',
        
        # Forex - EUR Crosses (4)
        'EURGBP': 'EURGBP=X',
        'EURJPY': 'EURJPY=X',
        'EURCHF': 'EURCHF=X',
        'EURCAD': 'EURCAD=X',
        
        # Forex - GBP Crosses (3)
        'GBPJPY': 'GBPJPY=X',
        'GBPCHF': 'GBPCHF=X',
        'GBPCAD': 'GBPCAD=X',
        
        # Forex - Other Crosses (3)
        'CHFJPY': 'CHFJPY=X',
        'CADJPY': 'CADJPY=X',
        'CADCHF': 'CADCHF=X',
        
        # High-Volatility Forex (1)
        'USDZAR': 'USDZAR=X',
        
        # Commodities (2)
        'XAUUSD': 'GC=F',  # Gold futures
        'XAGUSD': 'SI=F',  # Silver futures
        
        # Crypto (12)
        'BTCUSD': 'BTC-USD',
        'ETHUSD': 'ETH-USD',
        'LTCUSD': 'LTC-USD',
        'SOLUSD': 'SOL-USD',
        'XRPUSD': 'XRP-USD',
        'ADAUSD': 'ADA-USD',
        'AVAXUSD': 'AVAX-USD',
        'DOGEUSD': 'DOGE-USD',
        'MATICUSD': 'MATIC-USD',
        'DOTUSD': 'DOT-USD',
        'BNBUSD': 'BNB-USD',
        'LINKUSD': 'LINK-USD',
        
        # Indices (3)
        'US30': '^DJI',
        'NAS100': '^NDX',
        'SPX500': '^GSPC'
    }
    
    # Timeframe configuration (7 timeframes)
    TIMEFRAMES = {
        '5m': {'interval': '5m', 'period': '7d', 'lookback_days': 7},
        '15m': {'interval': '15m', 'period': '14d', 'lookback_days': 14},
        '30m': {'interval': '30m', 'period': '1mo', 'lookback_days': 30},
        '1hr': {'interval': '1h', 'period': '2mo', 'lookback_days': 60},
        '4hr': {'interval': '1h', 'period': '6mo', 'lookback_days': 180},  # Will resample
        '1d': {'interval': '1d', 'period': '1y', 'lookback_days': 365},
        '1wk': {'interval': '1wk', 'period': '2y', 'lookback_days': 730}
    }
    
    def __init__(self, config: Optional[FetchConfig] = None):
        """Initialize the fetcher"""
        self.config = config or FetchConfig()
        self.fetch_count = 0
        self.error_count = 0
        self.cache = {}
        self.cache_manager = CacheManager() # Initialize Cache Manager
        
        logger.info(f"YFinance Data Fetcher initialized with {len(self.TRADING_PAIRS)} pairs and {len(self.TIMEFRAMES)} timeframes")
    
    def fetch_all_data(self, symbols: Optional[List[str]] = None, 
                       timeframes: Optional[List[str]] = None) -> Dict[str, Dict[str, pd.DataFrame]]:
        """
        Fetch data for all symbols and timeframes
        
        Args:
            symbols: List of symbols to fetch (default: all 33)
            timeframes: List of timeframes to fetch (default: all 7)
        
        Returns:
            Dict[symbol][timeframe] = DataFrame
        """
        symbols = symbols or list(self.TRADING_PAIRS.keys())
        timeframes = timeframes or list(self.TIMEFRAMES.keys())
        
        logger.info(f"Starting data fetch for {len(symbols)} symbols across {len(timeframes)} timeframes")
        
        results = {}
        total_tasks = len(symbols) * len(timeframes)
        completed = 0
        
        # Use ThreadPoolExecutor for parallel fetching
        with ThreadPoolExecutor(max_workers=5) as executor:
            futures = {}
            
            for symbol in symbols:
                results[symbol] = {}
                for timeframe in timeframes:
                    future = executor.submit(
                        self.fetch_symbol_timeframe,
                        symbol,
                        timeframe
                    )
                    futures[future] = (symbol, timeframe)
            
            # Collect results
            for future in as_completed(futures):
                symbol, timeframe = futures[future]
                try:
                    df = future.result()
                    if df is not None and not df.empty:
                        results[symbol][timeframe] = df
                        completed += 1
                        logger.info(f"✅ [{completed}/{total_tasks}] {symbol} {timeframe}: {len(df)} candles")
                    else:
                        logger.warning(f"❌ [{completed}/{total_tasks}] {symbol} {timeframe}: No data")
                except Exception as e:
                    logger.error(f"❌ [{completed}/{total_tasks}] {symbol} {timeframe}: {str(e)}")
                    self.error_count += 1
        
        logger.info(f"Fetch complete: {completed}/{total_tasks} successful, {self.error_count} errors")
        return results
    
    def fetch_symbol_timeframe(self, symbol: str, timeframe: str) -> Optional[pd.DataFrame]:
        """
        Fetch data for a single symbol and timeframe with Smart Caching
        """
        if symbol not in self.TRADING_PAIRS:
            logger.error(f"Unknown symbol: {symbol}")
            return None
        
        if timeframe not in self.TIMEFRAMES:
            logger.error(f"Unknown timeframe: {timeframe}")
            return None
        
        yf_symbol = self.TRADING_PAIRS[symbol]
        tf_config = self.TIMEFRAMES[timeframe]
        
        # Check Cache
        cached_df = None
        if self.config.cache_results:
            cached_df = self.cache_manager.load_from_cache(symbol, timeframe)
            
        start_date = None
        if cached_df is not None and not cached_df.empty:
            last_dt = cached_df.index[-1]
            # yfinance start is inclusive, so we might get the last candle again (handled by deduplication)
            start_date = last_dt.strftime('%Y-%m-%d')
            logger.info(f"Incremental fetch for {symbol} {timeframe} starting from {start_date}")
        
        # Retry logic
        for attempt in range(self.config.max_retries):
            try:
                # Rate limiting
                time.sleep(self.config.rate_limit_delay)
                
                # Fetch data from yfinance
                ticker = yf.Ticker(yf_symbol)
                
                if start_date:
                    df = ticker.history(
                        start=start_date,
                        interval=tf_config['interval'],
                        timeout=self.config.timeout
                    )
                else:
                    df = ticker.history(
                        period=tf_config['period'],
                        interval=tf_config['interval'],
                        timeout=self.config.timeout
                    )
                
                # If no new data, return cache if available
                if df.empty:
                    if cached_df is not None:
                        logger.info(f"No new data for {symbol} {timeframe}, returning cached data")
                        return cached_df
                    
                    logger.warning(f"Empty data for {symbol} {timeframe} (attempt {attempt + 1})")
                    if attempt < self.config.max_retries - 1:
                        time.sleep(self.config.retry_delay * (attempt + 1))
                        continue
                    return None
                
                # Resample for 4hr if needed
                if timeframe == '4hr':
                    df = df.resample('4H').agg({
                        'Open': 'first',
                        'High': 'max',
                        'Low': 'min',
                        'Close': 'last',
                        'Volume': 'sum'
                    }).dropna()
                
                # Clean new data
                df = self._clean_data(df)
                
                # Merge with cache
                if cached_df is not None:
                    final_df = pd.concat([cached_df, df])
                    final_df = final_df[~final_df.index.duplicated(keep='last')]
                    final_df = final_df.sort_index()
                else:
                    final_df = df
                
                # Validate merged data
                if self.config.validate_data:
                    if not self._validate_data(final_df, symbol, timeframe):
                        logger.warning(f"Data validation failed for {symbol} {timeframe}")
                        if attempt < self.config.max_retries - 1:
                            time.sleep(self.config.retry_delay * (attempt + 1))
                            continue
                        return None
                
                # Add metadata
                final_df['symbol'] = symbol
                final_df['timeframe'] = timeframe
                
                # Save to cache
                if self.config.cache_results:
                    self.cache_manager.save_to_cache(symbol, timeframe, final_df)
                
                self.fetch_count += 1
                return final_df
                
            except Exception as e:
                logger.error(f"Error fetching {symbol} {timeframe} (attempt {attempt + 1}): {str(e)}")
                if attempt < self.config.max_retries - 1:
                    time.sleep(self.config.retry_delay * (attempt + 1))
                else:
                    self.error_count += 1
                    return cached_df if cached_df is not None else None
        
        return cached_df if cached_df is not None else None
    
    def fetch_latest_candle(self, symbol: str, timeframe: str) -> Optional[Dict]:
        """
        Fetch only the latest candle for real-time updates
        
        Args:
            symbol: Trading pair symbol
            timeframe: Timeframe
        
        Returns:
            Dict with latest OHLCV data
        """
        df = self.fetch_symbol_timeframe(symbol, timeframe)
        if df is None or df.empty:
            return None
        
        latest = df.iloc[-1]
        return {
            'timestamp': latest.name,
            'open': float(latest['Open']),
            'high': float(latest['High']),
            'low': float(latest['Low']),
            'close': float(latest['Close']),
            'volume': float(latest['Volume']) if 'Volume' in latest else 0,
            'symbol': symbol,
            'timeframe': timeframe
        }
    
    def _clean_data(self, df: pd.DataFrame) -> pd.DataFrame:
        """Clean and prepare data"""
        # Rename columns to lowercase
        df.columns = [col.lower() for col in df.columns]
        
        # Remove any NaN values
        df = df.dropna()
        
        # Ensure proper data types
        for col in ['open', 'high', 'low', 'close']:
            if col in df.columns:
                df[col] = pd.to_numeric(df[col], errors='coerce')
        
        if 'volume' in df.columns:
            df['volume'] = pd.to_numeric(df['volume'], errors='coerce').fillna(0)
        
        # Remove duplicates
        df = df[~df.index.duplicated(keep='last')]
        
        # Sort by timestamp
        df = df.sort_index()
        
        return df
    
    def _validate_data(self, df: pd.DataFrame, symbol: str, timeframe: str) -> bool:
        """Validate fetched data"""
        if df.empty:
            return False
        
        # Check required columns
        required_cols = ['open', 'high', 'low', 'close']
        if not all(col in df.columns for col in required_cols):
            logger.error(f"Missing required columns for {symbol} {timeframe}")
            return False
        
        # Check for reasonable values
        if (df[required_cols] <= 0).any().any():
            logger.error(f"Invalid price values (<=0) for {symbol} {timeframe}")
            return False
        
        # Check high >= low
        if (df['high'] < df['low']).any():
            logger.error(f"Invalid OHLC (high < low) for {symbol} {timeframe}")
            return False
        
        # Check high >= open, close
        if ((df['high'] < df['open']) | (df['high'] < df['close'])).any():
            logger.error(f"Invalid OHLC (high < open/close) for {symbol} {timeframe}")
            return False
        
        # Check low <= open, close
        if ((df['low'] > df['open']) | (df['low'] > df['close'])).any():
            logger.error(f"Invalid OHLC (low > open/close) for {symbol} {timeframe}")
            return False
        
        # Check minimum data points
        min_candles = {
            '5m': 50,
            '15m': 50,
            '30m': 50,
            '1hr': 50,
            '4hr': 50,
            '1d': 100,
            '1wk': 52
        }
        
        if len(df) < min_candles.get(timeframe, 50):
            logger.warning(f"Insufficient data for {symbol} {timeframe}: {len(df)} candles")
            return False
        
        return True
    
    def get_statistics(self) -> Dict:
        """Get fetcher statistics"""
        return {
            'total_fetches': self.fetch_count,
            'total_errors': self.error_count,
            'success_rate': (self.fetch_count / (self.fetch_count + self.error_count) * 100) if (self.fetch_count + self.error_count) > 0 else 0,
            'total_pairs': len(self.TRADING_PAIRS),
            'total_timeframes': len(self.TIMEFRAMES)
        }


# Convenience function
def fetch_market_data(symbols: Optional[List[str]] = None, 
                     timeframes: Optional[List[str]] = None) -> Dict[str, Dict[str, pd.DataFrame]]:
    """
    Convenience function to fetch market data
    
    Usage:
        data = fetch_market_data(['BTCUSD', 'ETHUSD'], ['1hr', '1d'])
    """
    fetcher = YFinanceDataFetcher()
    return fetcher.fetch_all_data(symbols, timeframes)


if __name__ == "__main__":
    # Test the fetcher
    print("Testing YFinance Data Fetcher...")
    
    # Test with a few symbols
    test_symbols = ['BTCUSD', 'ETHUSD', 'EURUSD']
    test_timeframes = ['1hr', '1d']
    
    fetcher = YFinanceDataFetcher()
    data = fetcher.fetch_all_data(test_symbols, test_timeframes)
    
    print("\nResults:")
    for symbol, timeframes in data.items():
        print(f"\n{symbol}:")
        for tf, df in timeframes.items():
            print(f"  {tf}: {len(df)} candles")
            if not df.empty:
                print(f"    Latest: {df.iloc[-1]['close']:.2f}")
    
    print(f"\nStatistics: {fetcher.get_statistics()}")
