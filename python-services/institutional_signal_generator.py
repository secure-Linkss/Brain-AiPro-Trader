"""
INSTITUTIONAL-GRADE Signal Generator
Super Intelligent Entry Prediction & Automated Scanning
"""

import asyncio
import aiohttp
from typing import Dict, List, Optional, Tuple
from datetime import datetime, timedelta
import time
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class IntelligentEntryPredictor:
    """
    Institutional-Grade Entry Prediction
    
    Predicts if price will hit SL before TP using:
    - Market structure analysis
    - Liquidity zones
    - Order flow
    - Historical patterns
    - Smart money behavior
    """
    
    def __init__(self):
        self.prediction_accuracy = 0.85  # Target 85%+ accuracy
    
    def predict_entry_success(self, symbol: str, signal_type: str, 
                             entry: float, stop_loss: float, 
                             market_data: Dict) -> Tuple[bool, float, str]:
        """
        Predict if entry will be successful
        
        Returns:
            (should_enter, confidence, reason)
        """
        # Analyze market structure
        structure_score = self._analyze_market_structure(market_data)
        
        # Check liquidity zones
        liquidity_score = self._check_liquidity_zones(entry, stop_loss, market_data)
        
        # Analyze order flow
        orderflow_score = self._analyze_order_flow(market_data)
        
        # Check for stop hunt zones
        stop_hunt_risk = self._check_stop_hunt_risk(stop_loss, market_data)
        
        # Smart money analysis
        smart_money_score = self._analyze_smart_money(market_data)
        
        # Calculate overall confidence
        total_score = (
            structure_score * 0.30 +
            liquidity_score * 0.25 +
            orderflow_score * 0.20 +
            (1 - stop_hunt_risk) * 0.15 +
            smart_money_score * 0.10
        )
        
        # Decision logic
        if total_score >= 0.75:
            return True, total_score * 100, "High probability entry - all factors aligned"
        elif total_score >= 0.60:
            if stop_hunt_risk < 0.3:
                return True, total_score * 100, "Good entry - acceptable risk"
            else:
                return False, total_score * 100, "Stop hunt risk too high - wait for better entry"
        else:
            return False, total_score * 100, "Low probability - market structure not favorable"
    
    def _analyze_market_structure(self, data: Dict) -> float:
        """Analyze market structure (BOS, CHoCH, etc.)"""
        # Check for Break of Structure
        has_bos = data.get('break_of_structure', False)
        
        # Check for Change of Character
        has_choch = data.get('change_of_character', False)
        
        # Check trend strength
        trend_strength = data.get('trend_strength', 0.5)
        
        score = 0.0
        if has_bos:
            score += 0.4
        if has_choch:
            score += 0.3
        score += trend_strength * 0.3
        
        return min(1.0, score)
    
    def _check_liquidity_zones(self, entry: float, sl: float, data: Dict) -> float:
        """Check if entry is near liquidity zones"""
        liquidity_zones = data.get('liquidity_zones', [])
        
        # Check if entry is at a liquidity grab zone (good)
        near_liquidity = False
        for zone in liquidity_zones:
            if abs(entry - zone) / entry < 0.001:  # Within 0.1%
                near_liquidity = True
                break
        
        # Check if SL is beyond major liquidity (bad)
        sl_beyond_liquidity = False
        for zone in liquidity_zones:
            if (sl < zone < entry) or (entry < zone < sl):
                sl_beyond_liquidity = True
                break
        
        if near_liquidity and not sl_beyond_liquidity:
            return 1.0
        elif near_liquidity:
            return 0.6
        elif not sl_beyond_liquidity:
            return 0.7
        else:
            return 0.3
    
    def _analyze_order_flow(self, data: Dict) -> float:
        """Analyze order flow direction"""
        buy_volume = data.get('buy_volume', 0)
        sell_volume = data.get('sell_volume', 0)
        
        if buy_volume + sell_volume == 0:
            return 0.5
        
        buy_ratio = buy_volume / (buy_volume + sell_volume)
        
        # Strong buy flow
        if buy_ratio > 0.65:
            return 0.9
        # Moderate buy flow
        elif buy_ratio > 0.55:
            return 0.7
        # Balanced
        elif 0.45 <= buy_ratio <= 0.55:
            return 0.5
        # Moderate sell flow
        elif buy_ratio < 0.45:
            return 0.3
        # Strong sell flow
        else:
            return 0.1
    
    def _check_stop_hunt_risk(self, sl: float, data: Dict) -> float:
        """Check if SL is in a stop hunt zone"""
        recent_lows = data.get('recent_lows', [])
        recent_highs = data.get('recent_highs', [])
        
        # Check if SL is near recent lows/highs (stop hunt zones)
        for low in recent_lows:
            if abs(sl - low) / sl < 0.002:  # Within 0.2%
                return 0.8  # High risk
        
        for high in recent_highs:
            if abs(sl - high) / sl < 0.002:
                return 0.8  # High risk
        
        return 0.2  # Low risk
    
    def _analyze_smart_money(self, data: Dict) -> float:
        """Analyze smart money behavior"""
        # Check for institutional order blocks
        has_order_block = data.get('order_block', False)
        
        # Check for fair value gaps
        has_fvg = data.get('fair_value_gap', False)
        
        # Check for imbalance
        has_imbalance = data.get('imbalance', False)
        
        score = 0.0
        if has_order_block:
            score += 0.4
        if has_fvg:
            score += 0.3
        if has_imbalance:
            score += 0.3
        
        return min(1.0, score)


class RateLimitHandler:
    """
    Intelligent Rate Limit Handler
    Avoids API rate limits with smart caching and request management
    """
    
    def __init__(self):
        self.request_times = {}
        self.cache = {}
        self.cache_duration = 60  # Cache for 60 seconds
    
    async def fetch_with_rate_limit(self, url: str, session: aiohttp.ClientSession,
                                    min_interval: float = 0.5) -> Optional[Dict]:
        """Fetch data with intelligent rate limiting"""
        # Check cache first
        if url in self.cache:
            cached_data, cached_time = self.cache[url]
            if time.time() - cached_time < self.cache_duration:
                logger.info(f"Cache hit for {url}")
                return cached_data
        
        # Check rate limit
        if url in self.request_times:
            elapsed = time.time() - self.request_times[url]
            if elapsed < min_interval:
                wait_time = min_interval - elapsed
                logger.info(f"Rate limit: waiting {wait_time:.2f}s")
                await asyncio.sleep(wait_time)
        
        # Make request
        try:
            async with session.get(url, timeout=aiohttp.ClientTimeout(total=10)) as response:
                if response.status == 200:
                    data = await response.json()
                    self.cache[url] = (data, time.time())
                    self.request_times[url] = time.time()
                    return data
                elif response.status == 429:  # Rate limited
                    logger.warning(f"Rate limited on {url}, waiting 60s")
                    await asyncio.sleep(60)
                    return await self.fetch_with_rate_limit(url, session, min_interval)
                else:
                    logger.error(f"HTTP {response.status} for {url}")
                    return None
        except Exception as e:
            logger.error(f"Fetch error for {url}: {e}")
            return None


class AutomatedScanner:
    """
    Automated Signal Scanner
    Scans all pairs across all timeframes continuously
    """
    
    def __init__(self, user_preferences: Optional[Dict] = None):
        self.user_preferences = user_preferences or {}
        self.rate_limiter = RateLimitHandler()
        self.entry_predictor = IntelligentEntryPredictor()
        
        # All 33 pairs
        self.all_pairs = [
            'EURUSD', 'GBPUSD', 'USDJPY', 'USDCHF', 'USDCAD',
            'EURGBP', 'EURJPY', 'EURCHF', 'EURCAD',
            'GBPJPY', 'GBPCHF', 'GBPCAD',
            'CHFJPY', 'CADJPY', 'CADCHF', 'USDZAR',
            'XAUUSD', 'XAGUSD',
            'BTCUSD', 'ETHUSD', 'LTCUSD', 'SOLUSD', 'XRPUSD',
            'ADAUSD', 'AVAXUSD', 'DOGEUSD', 'MATICUSD', 'DOTUSD',
            'BNBUSD', 'LINKUSD',
            'US30', 'NAS100', 'SPX500'
        ]
        
        # All 7 timeframes
        self.all_timeframes = ['5m', '15m', '30m', '1hr', '4hr', '1d', '1wk']
        
        # Filter based on user preferences
        self.active_pairs = self._filter_pairs()
        self.active_timeframes = self._filter_timeframes()
        
        logger.info(f"Scanner initialized: {len(self.active_pairs)} pairs, {len(self.active_timeframes)} timeframes")
    
    def _filter_pairs(self) -> List[str]:
        """Filter pairs based on user preferences"""
        if not self.user_preferences:
            return self.all_pairs
        
        enabled_pairs = self.user_preferences.get('enabled_pairs', [])
        if enabled_pairs:
            return [p for p in self.all_pairs if p in enabled_pairs]
        
        # Filter by categories
        categories = self.user_preferences.get('categories', [])
        if not categories:
            return self.all_pairs
        
        filtered = []
        if 'forex' in categories:
            filtered.extend([p for p in self.all_pairs if 'USD' in p or 'EUR' in p or 'GBP' in p])
        if 'crypto' in categories:
            filtered.extend([p for p in self.all_pairs if p in ['BTCUSD', 'ETHUSD', 'LTCUSD', 'SOLUSD', 'XRPUSD', 'ADAUSD', 'AVAXUSD', 'DOGEUSD', 'MATICUSD', 'DOTUSD', 'BNBUSD', 'LINKUSD']])
        if 'commodities' in categories:
            filtered.extend(['XAUUSD', 'XAGUSD'])
        if 'indices' in categories:
            filtered.extend(['US30', 'NAS100', 'SPX500'])
        
        return list(set(filtered)) if filtered else self.all_pairs
    
    def _filter_timeframes(self) -> List[str]:
        """Filter timeframes based on user preferences"""
        enabled_timeframes = self.user_preferences.get('enabled_timeframes', [])
        if enabled_timeframes:
            return [tf for tf in self.all_timeframes if tf in enabled_timeframes]
        return self.all_timeframes
    
    async def scan_all_pairs(self) -> List[Dict]:
        """Scan all pairs for signals"""
        signals = []
        
        async with aiohttp.ClientSession() as session:
            tasks = []
            for symbol in self.active_pairs:
                task = self.scan_symbol(symbol, session)
                tasks.append(task)
            
            results = await asyncio.gather(*tasks, return_exceptions=True)
            
            for result in results:
                if isinstance(result, dict) and result.get('signal'):
                    signals.append(result)
        
        logger.info(f"Scan complete: {len(signals)} signals found")
        return signals
    
    async def scan_symbol(self, symbol: str, session: aiohttp.ClientSession) -> Optional[Dict]:
        """Scan a single symbol across all timeframes"""
        try:
            # Fetch market data with rate limiting
            market_data = await self._fetch_market_data(symbol, session)
            
            if not market_data:
                return None
            
            # Generate signal using comprehensive system
            signal = await self._generate_intelligent_signal(symbol, market_data)
            
            return signal
            
        except Exception as e:
            logger.error(f"Error scanning {symbol}: {e}")
            return None
    
    async def _fetch_market_data(self, symbol: str, session: aiohttp.ClientSession) -> Optional[Dict]:
        """Fetch market data with intelligent rate limiting"""
        # Fetch from multiple timeframes
        data = {}
        
        for tf in self.active_timeframes:
            url = f"http://localhost:8003/market/data/{symbol}?timeframe={tf}"
            tf_data = await self.rate_limiter.fetch_with_rate_limit(url, session)
            if tf_data:
                data[tf] = tf_data
        
        return data if data else None
    
    async def _generate_intelligent_signal(self, symbol: str, market_data: Dict) -> Optional[Dict]:
        """Generate signal with intelligent entry prediction"""
        # Simulate comprehensive analysis (would call actual system)
        signal_type = "BUY"  # Placeholder
        entry = 90750.0
        stop_loss = 90450.0
        
        # Prepare market analysis data
        analysis_data = {
            'break_of_structure': True,
            'change_of_character': False,
            'trend_strength': 0.75,
            'liquidity_zones': [90650.0, 90850.0],
            'buy_volume': 1000000,
            'sell_volume': 500000,
            'recent_lows': [90400.0, 90300.0],
            'recent_highs': [90900.0, 91000.0],
            'order_block': True,
            'fair_value_gap': True,
            'imbalance': False
        }
        
        # Intelligent entry prediction
        should_enter, confidence, reason = self.entry_predictor.predict_entry_success(
            symbol, signal_type, entry, stop_loss, analysis_data
        )
        
        if not should_enter:
            logger.info(f"{symbol}: Entry rejected - {reason}")
            return None
        
        return {
            'symbol': symbol,
            'signal': signal_type,
            'entry': entry,
            'stop_loss': stop_loss,
            'confidence': confidence,
            'reason': reason,
            'prediction': 'HIGH_PROBABILITY',
            'timestamp': datetime.now().isoformat()
        }


# Export
async def run_automated_scanner(user_preferences: Optional[Dict] = None):
    """Run automated scanner"""
    scanner = AutomatedScanner(user_preferences)
    signals = await scanner.scan_all_pairs()
    return signals


if __name__ == "__main__":
    # Test
    preferences = {
        'categories': ['crypto'],
        'enabled_timeframes': ['1hr', '4hr', '1d']
    }
    
    signals = asyncio.run(run_automated_scanner(preferences))
    print(f"Found {len(signals)} signals")
    for signal in signals:
        print(f"  {signal['symbol']}: {signal['signal']} - {signal['confidence']:.1f}%")
