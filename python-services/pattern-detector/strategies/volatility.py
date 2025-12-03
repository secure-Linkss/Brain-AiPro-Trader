import pandas as pd
import pandas_ta as ta
from .base_strategy import BaseStrategy
from typing import Optional, Dict

class VWAPStrategy(BaseStrategy):
    def __init__(self):
        super().__init__("VWAP Reversion")

    def analyze(self, df: pd.DataFrame) -> Optional[Dict]:
        # VWAP requires volume
        if 'volume' not in df.columns: return None
        
        vwap = df.ta.vwap()
        if vwap is None: return None
        
        curr_vwap = vwap.iloc[-1]
        close = df['close'].iloc[-1]
        prev_close = df['close'].iloc[-2]
        
        # Buy: Price crosses above VWAP
        if prev_close < curr_vwap and close > curr_vwap:
            atr = self.get_atr(df)
            return {
                'strategy': self.name,
                'signal': 'BUY',
                'confidence': 75,
                'stop_loss': close - (1.5 * atr),
                'take_profit': close + (2 * atr),
                'reason': 'Price crossed above VWAP'
            }
            
        # Sell: Price crosses below VWAP
        if prev_close > curr_vwap and close < curr_vwap:
            atr = self.get_atr(df)
            return {
                'strategy': self.name,
                'signal': 'SELL',
                'confidence': 75,
                'stop_loss': close + (1.5 * atr),
                'take_profit': close - (2 * atr),
                'reason': 'Price crossed below VWAP'
            }
            
        return None

class ParabolicSARStrategy(BaseStrategy):
    def __init__(self):
        super().__init__("Parabolic SAR")

    def analyze(self, df: pd.DataFrame) -> Optional[Dict]:
        psar = df.ta.psar()
        if psar is None: return None
        
        # PSARl_0.02_0.2, PSARs_0.02_0.2, PSARaf_0.02_0.2, PSARr_0.02_0.2
        # PSARr is reversal column (1 if reversal)
        
        # Simplified: Check if close is above/below SAR
        # Usually pandas_ta returns separate long/short columns, combined is tricky
        # Let's check the reversal column if available, or infer
        
        # Assuming standard columns
        long_sar = psar['PSARl_0.02_0.2']
        short_sar = psar['PSARs_0.02_0.2']
        
        close = df['close'].iloc[-1]
        
        # Buy Reversal: Short SAR was active, now Long SAR is active
        if not pd.isna(short_sar.iloc[-2]) and not pd.isna(long_sar.iloc[-1]):
            atr = self.get_atr(df)
            return {
                'strategy': self.name,
                'signal': 'BUY',
                'confidence': 70,
                'stop_loss': long_sar.iloc[-1],
                'take_profit': close + (3 * atr),
                'reason': 'Parabolic SAR Bullish Reversal'
            }
            
        # Sell Reversal: Long SAR was active, now Short SAR is active
        if not pd.isna(long_sar.iloc[-2]) and not pd.isna(short_sar.iloc[-1]):
            atr = self.get_atr(df)
            return {
                'strategy': self.name,
                'signal': 'SELL',
                'confidence': 70,
                'stop_loss': short_sar.iloc[-1],
                'take_profit': close - (3 * atr),
                'reason': 'Parabolic SAR Bearish Reversal'
            }
            
        return None

class FibonacciRetracementStrategy(BaseStrategy):
    def __init__(self):
        super().__init__("Fibonacci Retracement")

    def analyze(self, df: pd.DataFrame) -> Optional[Dict]:
        # Find recent swing high/low (last 50 candles)
        high = df['high'].rolling(50).max().iloc[-1]
        low = df['low'].rolling(50).min().iloc[-1]
        close = df['close'].iloc[-1]
        
        diff = high - low
        fib618 = high - (diff * 0.618)
        fib50 = high - (diff * 0.5)
        
        # Buy: Price retraces to 0.618 level in uptrend (simplified)
        # We need trend context. Assume uptrend if close > SMA200
        sma200 = df.ta.sma(length=200)
        if sma200 is None: return None
        
        if close > sma200.iloc[-1]:
            # Check if near 0.618
            if abs(close - fib618) < (diff * 0.02): # 2% tolerance
                atr = self.get_atr(df)
                return {
                    'strategy': self.name,
                    'signal': 'BUY',
                    'confidence': 75,
                    'stop_loss': low,
                    'take_profit': high,
                    'reason': 'Bounce off 0.618 Fibonacci Level'
                }
                
        return None

class ATRBreakoutStrategy(BaseStrategy):
    def __init__(self):
        super().__init__("ATR Breakout")

    def analyze(self, df: pd.DataFrame) -> Optional[Dict]:
        atr = df.ta.atr(length=14)
        if atr is None: return None
        
        curr_atr = atr.iloc[-1]
        avg_atr = atr.rolling(20).mean().iloc[-1]
        
        close = df['close'].iloc[-1]
        open_price = df['open'].iloc[-1]
        
        # Breakout: Current candle range > 2x Average ATR
        candle_range = df['high'].iloc[-1] - df['low'].iloc[-1]
        
        if candle_range > (avg_atr * 2):
            if close > open_price: # Bullish Explosion
                return {
                    'strategy': self.name,
                    'signal': 'BUY',
                    'confidence': 80,
                    'stop_loss': df['low'].iloc[-1],
                    'take_profit': close + (candle_range * 1.5),
                    'reason': 'Volatility Expansion Breakout (Long)'
                }
            else: # Bearish Explosion
                return {
                    'strategy': self.name,
                    'signal': 'SELL',
                    'confidence': 80,
                    'stop_loss': df['high'].iloc[-1],
                    'take_profit': close - (candle_range * 1.5),
                    'reason': 'Volatility Expansion Breakout (Short)'
                }
                
        return None

class EngulfingVolumeStrategy(BaseStrategy):
    def __init__(self):
        super().__init__("Engulfing + Volume")

    def analyze(self, df: pd.DataFrame) -> Optional[Dict]:
        # Check volume spike
        vol = df['volume']
        avg_vol = vol.rolling(20).mean()
        
        if vol.iloc[-1] < (avg_vol.iloc[-1] * 1.5): return None # Need 1.5x volume
        
        open_curr = df['open'].iloc[-1]
        close_curr = df['close'].iloc[-1]
        open_prev = df['open'].iloc[-2]
        close_prev = df['close'].iloc[-2]
        
        # Bullish Engulfing
        if close_curr > open_curr and close_prev < open_prev: # Green after Red
            if close_curr > open_prev and open_curr < close_prev: # Engulfs body
                atr = self.get_atr(df)
                return {
                    'strategy': self.name,
                    'signal': 'BUY',
                    'confidence': 85,
                    'stop_loss': df['low'].iloc[-1],
                    'take_profit': close_curr + (2 * atr),
                    'reason': 'Bullish Engulfing with High Volume'
                }
                
        # Bearish Engulfing
        if close_curr < open_curr and close_prev > open_prev: # Red after Green
            if close_curr < open_prev and open_curr > close_prev:
                atr = self.get_atr(df)
                return {
                    'strategy': self.name,
                    'signal': 'SELL',
                    'confidence': 85,
                    'stop_loss': df['high'].iloc[-1],
                    'take_profit': close_curr - (2 * atr),
                    'reason': 'Bearish Engulfing with High Volume'
                }
                
        return None
