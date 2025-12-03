"""
Asset-Specific Backtesting Modules
Handles unique characteristics of Forex, Crypto, and Stocks
"""

from datetime import datetime, time
from typing import Dict, List, Optional
import pandas as pd
import numpy as np


class ForexBacktester:
    """
    Forex-specific backtesting with session awareness and spread modeling
    """
    
    # Trading sessions (UTC)
    SESSIONS = {
        'sydney': (time(22, 0), time(7, 0)),
        'tokyo': (time(0, 0), time(9, 0)),
        'london': (time(8, 0), time(17, 0)),
        'new_york': (time(13, 0), time(22, 0))
    }
    
    # Typical spreads by session (in pips)
    SPREAD_PROFILES = {
        'EURUSD': {'london': 0.1, 'new_york': 0.2, 'tokyo': 0.5, 'sydney': 1.0},
        'GBPUSD': {'london': 0.2, 'new_york': 0.3, 'tokyo': 0.8, 'sydney': 1.5},
        'USDJPY': {'london': 0.2, 'new_york': 0.2, 'tokyo': 0.1, 'sydney': 0.5},
    }
    
    def __init__(self, pair: str = 'EURUSD'):
        self.pair = pair
        self.pip_value = 0.0001 if 'JPY' not in pair else 0.01
        
    def get_spread(self, timestamp: datetime) -> float:
        """Get realistic spread based on time and session"""
        session = self._get_active_session(timestamp)
        base_spread = self.SPREAD_PROFILES.get(self.pair, {}).get(session, 0.5)
        
        # Increase spread during low liquidity
        if session in ['sydney', 'tokyo']:
            base_spread *= 1.5
            
        return base_spread * self.pip_value
    
    def calculate_swap(self, position_type: str, days: int) -> float:
        """Calculate overnight swap/rollover charges based on interest rate differentials"""
        # Get interest rates for base and quote currencies
        base_currency = self.pair[:3]
        quote_currency = self.pair[3:]
        
        base_rate = self._get_interest_rate(base_currency)
        quote_rate = self._get_interest_rate(quote_currency)
        
        # Calculate differential
        # If Long Base/Short Quote: Earn Base Rate, Pay Quote Rate
        if position_type == 'BUY':
            rate_diff = base_rate - quote_rate
        else: # SELL (Short Base/Long Quote)
            rate_diff = quote_rate - base_rate
            
        # Broker markup (e.g., 0.5%)
        markup = 0.005
        
        # Final swap rate (annualized)
        final_rate = rate_diff - markup
        
        # Convert to daily swap points
        # Swap = (Price * (InterestDiff / 365) * Days)
        # Simplified to pips for this context
        swap_pips = (final_rate / 365) * days * 10000 # Approximate pip value scaling
        
        return swap_pips * self.pip_value

    def _get_interest_rate(self, currency: str) -> float:
        """Get central bank interest rate for currency"""
        # In production, fetch from economic calendar API
        rates = {
            'USD': 0.055, # Fed Funds
            'EUR': 0.045, # ECB
            'GBP': 0.0525, # BoE
            'JPY': -0.001, # BoJ
            'AUD': 0.0435, # RBA
            'CAD': 0.05, # BoC
            'CHF': 0.0175, # SNB
            'NZD': 0.055 # RBNZ
        }
        return rates.get(currency, 0.02)
    
    def adjust_for_weekend_gap(self, entry_time: datetime, exit_time: datetime, entry_price: float) -> float:
        """Model weekend gaps in price"""
        # Check if position held over weekend
        if entry_time.weekday() == 4 and exit_time.weekday() == 0:  # Friday to Monday
            # Simulate potential gap (typically small for major pairs)
            gap_percent = np.random.uniform(-0.002, 0.002)  # ±0.2%
            return entry_price * (1 + gap_percent)
        return entry_price
    
    def _get_active_session(self, timestamp: datetime) -> str:
        """Determine active trading session"""
        current_time = timestamp.time()
        
        for session, (start, end) in self.SESSIONS.items():
            if start <= current_time <= end:
                return session
                
        return 'sydney'  # Default
    
    def calculate_execution_price(
        self, 
        signal_price: float, 
        timestamp: datetime, 
        order_type: str,
        volatility: float = 0.0
    ) -> float:
        """Calculate realistic execution price with slippage"""
        spread = self.get_spread(timestamp)
        
        # Add volatility-based slippage
        slippage = spread + (volatility * 0.5)
        
        if order_type == 'BUY':
            return signal_price + slippage
        else:  # SELL
            return signal_price - slippage


class CryptoBacktester:
    """
    Crypto-specific backtesting with 24/7 trading and exchange-specific modeling
    """
    
    # Exchange fee structures
    EXCHANGE_FEES = {
        'binance': {'maker': 0.001, 'taker': 0.001},
        'coinbase': {'maker': 0.005, 'taker': 0.005},
        'kraken': {'maker': 0.0016, 'taker': 0.0026},
    }
    
    # Typical slippage by market cap
    SLIPPAGE_PROFILES = {
        'large_cap': 0.001,  # BTC, ETH
        'mid_cap': 0.003,    # Top 20
        'small_cap': 0.01,   # Others
    }
    
    def __init__(self, symbol: str = 'BTCUSDT', exchange: str = 'binance'):
        self.symbol = symbol
        self.exchange = exchange
        self.market_cap_tier = self._determine_market_cap_tier(symbol)
        
    def calculate_fees(self, trade_value: float, order_type: str = 'taker') -> float:
        """Calculate exchange fees"""
        fee_rate = self.EXCHANGE_FEES.get(self.exchange, {}).get(order_type, 0.001)
        return trade_value * fee_rate
    
    def calculate_slippage(
        self, 
        price: float, 
        order_size: float, 
        volatility: float,
        order_type: str
    ) -> float:
        """Calculate realistic slippage based on order size and volatility"""
        base_slippage = self.SLIPPAGE_PROFILES[self.market_cap_tier]
        
        # Increase slippage with volatility
        volatility_multiplier = 1 + (volatility * 2)
        
        # Increase slippage with order size (market impact)
        # Assume order size relative to average volume
        size_multiplier = 1 + (order_size / 10000)  # Simplified
        
        total_slippage = base_slippage * volatility_multiplier * size_multiplier
        
        if order_type == 'BUY':
            return price * (1 + total_slippage)
        else:
            return price * (1 - total_slippage)
    
    def model_exchange_downtime(self, timestamp: datetime) -> bool:
        """Model potential exchange downtime during high volatility"""
        # Simplified: random downtime during high volatility events
        # In reality, you'd use historical downtime data
        return np.random.random() < 0.001  # 0.1% chance
    
    def calculate_funding_rate(self, position_type: str, hours: int) -> float:
        """Calculate funding rate for perpetual futures"""
        # Typical funding rate: ±0.01% every 8 hours
        funding_rate = np.random.uniform(-0.0001, 0.0001)
        funding_periods = hours // 8
        
        if position_type == 'LONG':
            return funding_rate * funding_periods
        else:
            return -funding_rate * funding_periods
    
    def _determine_market_cap_tier(self, symbol: str) -> str:
        """Determine market cap tier for slippage calculation"""
        large_cap = ['BTC', 'ETH', 'BNB']
        
        for coin in large_cap:
            if coin in symbol:
                return 'large_cap'
                
        return 'mid_cap'  # Default
    
    def model_flash_crash(self, price: float, volatility: float) -> Optional[float]:
        """Model potential flash crash scenarios"""
        # Very rare event, but important for crypto
        if volatility > 0.05 and np.random.random() < 0.0001:  # 0.01% chance during high vol
            crash_magnitude = np.random.uniform(0.1, 0.3)  # 10-30% drop
            return price * (1 - crash_magnitude)
        return None


class StockBacktester:
    """
    Stock-specific backtesting with market hours and corporate actions
    """
    
    MARKET_HOURS = {
        'pre_market': (time(4, 0), time(9, 30)),
        'regular': (time(9, 30), time(16, 0)),
        'after_hours': (time(16, 0), time(20, 0))
    }
    
    def __init__(self, symbol: str = 'AAPL'):
        self.symbol = symbol
        
    def is_market_open(self, timestamp: datetime) -> bool:
        """Check if market is open"""
        # Check if weekend
        if timestamp.weekday() >= 5:
            return False
            
        current_time = timestamp.time()
        
        # Check if within any trading session
        for session, (start, end) in self.MARKET_HOURS.items():
            if start <= current_time <= end:
                return True
                
        return False
    
    def get_session_type(self, timestamp: datetime) -> str:
        """Determine trading session type"""
        current_time = timestamp.time()
        
        for session, (start, end) in self.MARKET_HOURS.items():
            if start <= current_time <= end:
                return session
                
        return 'closed'
    
    def calculate_slippage(
        self, 
        price: float, 
        volume: float, 
        avg_volume: float,
        session: str
    ) -> float:
        """Calculate slippage based on volume and session"""
        base_slippage = 0.0005  # 0.05% base
        
        # Increase slippage in pre/after market
        if session != 'regular':
            base_slippage *= 3
            
        # Increase slippage for low volume
        if volume < avg_volume * 0.5:
            base_slippage *= 2
            
        return price * base_slippage
    
    def model_gap(self, prev_close: float, next_open: float) -> Dict[str, float]:
        """Model overnight gaps"""
        gap_percent = (next_open - prev_close) / prev_close
        
        return {
            'gap_percent': gap_percent,
            'gap_type': 'gap_up' if gap_percent > 0.02 else 'gap_down' if gap_percent < -0.02 else 'no_gap'
        }
    
    def adjust_for_earnings(
        self, 
        timestamp: datetime, 
        earnings_dates: List[datetime],
        price: float
    ) -> float:
        """Adjust for earnings volatility"""
        # Check if near earnings date
        for earnings_date in earnings_dates:
            days_to_earnings = (earnings_date - timestamp).days
            
            if 0 <= days_to_earnings <= 2:
                # Increase volatility near earnings
                volatility_boost = np.random.uniform(0.02, 0.05)
                return price * (1 + np.random.choice([-1, 1]) * volatility_boost)
                
        return price
    
    def model_corporate_action(
        self, 
        action_type: str, 
        price: float,
        ratio: float = 2.0
    ) -> float:
        """Model corporate actions (splits, dividends, etc.)"""
        if action_type == 'split':
            return price / ratio
        elif action_type == 'reverse_split':
            return price * ratio
        elif action_type == 'dividend':
            # Price typically drops by dividend amount
            dividend_yield = 0.02  # 2% example
            return price * (1 - dividend_yield)
            
        return price


class RegimeDetector:
    """
    Detects market regimes for regime-specific backtesting
    """
    
    @staticmethod
    def detect_regime(data: pd.DataFrame) -> Dict[str, str]:
        """Detect current market regime"""
        # Calculate indicators
        returns = data['close'].pct_change()
        volatility = returns.rolling(20).std()
        
        # Trend detection
        sma_20 = data['close'].rolling(20).mean()
        sma_50 = data['close'].rolling(50).mean()
        
        is_trending = sma_20.iloc[-1] > sma_50.iloc[-1]
        
        # Volatility regime
        current_vol = volatility.iloc[-1]
        avg_vol = volatility.mean()
        
        vol_regime = 'high' if current_vol > avg_vol * 1.5 else 'low' if current_vol < avg_vol * 0.5 else 'medium'
        
        return {
            'trend': 'trending' if is_trending else 'ranging',
            'volatility': vol_regime,
            'direction': 'bullish' if returns.iloc[-20:].mean() > 0 else 'bearish'
        }
    
    @staticmethod
    def calculate_regime_metrics(data: pd.DataFrame, trades: List[Dict]) -> Dict[str, float]:
        """Calculate performance by regime with precise trade-time detection"""
        regime_performance = {
            'trending': [],
            'ranging': [],
            'high_vol': [],
            'low_vol': []
        }
        
        # Pre-calculate indicators for speed
        sma_20 = data['close'].rolling(20).mean()
        sma_50 = data['close'].rolling(50).mean()
        volatility = data['close'].pct_change().rolling(20).std()
        avg_vol = volatility.mean()
        
        # Create regime map
        # 1 = Trending, 0 = Ranging
        trend_map = (sma_20 > sma_50).astype(int) 
        # 1 = High Vol, -1 = Low Vol, 0 = Medium
        vol_map = pd.Series(0, index=data.index)
        vol_map[volatility > avg_vol * 1.5] = 1
        vol_map[volatility < avg_vol * 0.5] = -1
        
        for trade in trades:
            entry_time = trade.get('entry_time')
            if not entry_time:
                continue
                
            # Find closest timestamp in data
            # Assuming data is indexed by timestamp or has a timestamp column
            # If data has timestamp column:
            try:
                if 'timestamp' in data.columns:
                    idx = data[data['timestamp'] <= entry_time].index[-1]
                else:
                    idx = data.index.get_loc(entry_time, method='pad')
                
                # Determine regime at entry
                is_trending = trend_map.loc[idx] == 1
                vol_state = vol_map.loc[idx]
                
                profit = trade.get('profit', 0)
                
                if is_trending:
                    regime_performance['trending'].append(profit)
                else:
                    regime_performance['ranging'].append(profit)
                    
                if vol_state == 1:
                    regime_performance['high_vol'].append(profit)
                elif vol_state == -1:
                    regime_performance['low_vol'].append(profit)
                    
            except (KeyError, IndexError, ValueError):
                continue
        
        # Calculate average performance per regime
        return {
            regime: np.mean(profits) if profits else 0.0
            for regime, profits in regime_performance.items()
        }


# Export all classes
__all__ = [
    'ForexBacktester',
    'CryptoBacktester',
    'StockBacktester',
    'RegimeDetector'
]
