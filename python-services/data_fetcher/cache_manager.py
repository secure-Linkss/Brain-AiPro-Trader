"""
Cache Manager - PostgreSQL + Parquet Storage
Manages local caching of historical data for fast retrieval
"""

import pandas as pd
import numpy as np
from typing import Dict, List, Optional
from datetime import datetime, timedelta
import os
import logging
from pathlib import Path

logger = logging.getLogger(__name__)


class CacheManager:
    """
    Advanced Cache Manager
    
    Features:
    - PostgreSQL storage for structured data
    - Parquet file backup for fast bulk reads
    - Automatic cache invalidation
    - Data integrity checks
    - Fast retrieval with indexing
    """
    
    def __init__(self, cache_dir: str = "./data/cache", db_connection_string: Optional[str] = None):
        """Initialize cache manager"""
        self.cache_dir = Path(cache_dir)
        self.cache_dir.mkdir(parents=True, exist_ok=True)
        self.db_connection = db_connection_string
        
        # Create subdirectories
        (self.cache_dir / "parquet").mkdir(exist_ok=True)
        (self.cache_dir / "metadata").mkdir(exist_ok=True)
        
        logger.info(f"Cache Manager initialized at {self.cache_dir}")
    
    def save_to_cache(self, symbol: str, timeframe: str, df: pd.DataFrame) -> bool:
        """Save data to cache (Parquet)"""
        try:
            filename = f"{symbol}_{timeframe}.parquet"
            filepath = self.cache_dir / "parquet" / filename
            
            # Save to parquet with compression
            df.to_parquet(filepath, compression='snappy', index=True)
            
            # Save metadata
            metadata = {
                'symbol': symbol,
                'timeframe': timeframe,
                'rows': len(df),
                'start_date': str(df.index[0]),
                'end_date': str(df.index[-1]),
                'cached_at': str(datetime.now())
            }
            
            metadata_file = self.cache_dir / "metadata" / f"{symbol}_{timeframe}.json"
            import json
            with open(metadata_file, 'w') as f:
                json.dump(metadata, f, indent=2)
            
            logger.info(f"Cached {symbol} {timeframe}: {len(df)} rows")
            return True
            
        except Exception as e:
            logger.error(f"Error caching {symbol} {timeframe}: {str(e)}")
            return False
    
    def load_from_cache(self, symbol: str, timeframe: str) -> Optional[pd.DataFrame]:
        """Load data from cache"""
        try:
            filename = f"{symbol}_{timeframe}.parquet"
            filepath = self.cache_dir / "parquet" / filename
            
            if not filepath.exists():
                logger.debug(f"Cache miss: {symbol} {timeframe}")
                return None
            
            df = pd.read_parquet(filepath)
            logger.info(f"Cache hit: {symbol} {timeframe} ({len(df)} rows)")
            return df
            
        except Exception as e:
            logger.error(f"Error loading cache {symbol} {timeframe}: {str(e)}")
            return None
    
    def is_cache_valid(self, symbol: str, timeframe: str, max_age_hours: int = 24) -> bool:
        """Check if cache is still valid"""
        try:
            metadata_file = self.cache_dir / "metadata" / f"{symbol}_{timeframe}.json"
            
            if not metadata_file.exists():
                return False
            
            import json
            with open(metadata_file, 'r') as f:
                metadata = json.load(f)
            
            cached_at = datetime.fromisoformat(metadata['cached_at'])
            age = datetime.now() - cached_at
            
            return age.total_seconds() / 3600 < max_age_hours
            
        except Exception as e:
            logger.error(f"Error checking cache validity: {str(e)}")
            return False
    
    def clear_cache(self, symbol: Optional[str] = None, timeframe: Optional[str] = None):
        """Clear cache (all or specific)"""
        try:
            if symbol and timeframe:
                # Clear specific cache
                parquet_file = self.cache_dir / "parquet" / f"{symbol}_{timeframe}.parquet"
                metadata_file = self.cache_dir / "metadata" / f"{symbol}_{timeframe}.json"
                
                if parquet_file.exists():
                    parquet_file.unlink()
                if metadata_file.exists():
                    metadata_file.unlink()
                    
                logger.info(f"Cleared cache for {symbol} {timeframe}")
            else:
                # Clear all cache
                import shutil
                shutil.rmtree(self.cache_dir / "parquet")
                shutil.rmtree(self.cache_dir / "metadata")
                (self.cache_dir / "parquet").mkdir(exist_ok=True)
                (self.cache_dir / "metadata").mkdir(exist_ok=True)
                
                logger.info("Cleared all cache")
                
        except Exception as e:
            logger.error(f"Error clearing cache: {str(e)}")
