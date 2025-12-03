import pandas as pd
import pandas_ta as ta
from .base_strategy import BaseStrategy
from typing import Optional, Dict

class GoldenCrossStrategy(BaseStrategy):
    def __init__(self):
        super().__init__("Golden/Death Cross")

    def analyze(self, df: pd.DataFrame) -> Optional[Dict]:
        sma50 = df.ta.sma(length=50)
        sma200 = df.ta.sma(length=200)
        
        if sma50 is None or sma200 is None: return None
        
        curr_50 = sma50.iloc[-1]
        prev_50 = sma50.iloc[-2]
        curr_200 = sma200.iloc[-1]
        prev_200 = sma200.iloc[-2]
        
        close = df['close'].iloc[-1]
        
        # Golden Cross (50 crosses above 200)
        if prev_50 < prev_200 and curr_50 > curr_200:
            atr = self.get_atr(df)
            return {
                'strategy': self.name,
                'signal': 'BUY',
                'confidence': 90,
                'stop_loss': close - (3 * atr), # Wider stop for trend following
                'take_profit': close + (5 * atr),
                'reason': 'Golden Cross (SMA 50 > SMA 200)'
            }
            
        # Death Cross (50 crosses below 200)
        if prev_50 > prev_200 and curr_50 < curr_200:
            atr = self.get_atr(df)
            return {
                'strategy': self.name,
                'signal': 'SELL',
                'confidence': 90,
                'stop_loss': close + (3 * atr),
                'take_profit': close - (5 * atr),
                'reason': 'Death Cross (SMA 50 < SMA 200)'
            }
            
        return None

class IchimokuStrategy(BaseStrategy):
    def __init__(self):
        super().__init__("Ichimoku Cloud")

    def analyze(self, df: pd.DataFrame) -> Optional[Dict]:
        # Tenkan=9, Kijun=26, Senkou=52
        ichimoku = df.ta.ichimoku(tenkan=9, kijun=26, senkou=52)
        if ichimoku is None: return None
        
        # DataFrame columns are complex, usually:
        # ISA_9, ISB_26, ITS_9, IKS_26, ICS_26
        span_a = ichimoku[0]['ISA_9']
        span_b = ichimoku[0]['ISB_26']
        tenkan = ichimoku[0]['ITS_9']
        kijun = ichimoku[0]['IKS_26']
        
        close = df['close'].iloc[-1]
        curr_span_a = span_a.iloc[-1]
        curr_span_b = span_b.iloc[-1]
        
        # Buy: Price above Cloud AND Tenkan > Kijun
        if close > curr_span_a and close > curr_span_b and tenkan.iloc[-1] > kijun.iloc[-1]:
             atr = self.get_atr(df)
             return {
                'strategy': self.name,
                'signal': 'BUY',
                'confidence': 85,
                'stop_loss': min(curr_span_a, curr_span_b),
                'take_profit': close + (3 * atr),
                'reason': 'Price above Ichimoku Cloud + TK Cross'
            }
            
        # Sell: Price below Cloud AND Tenkan < Kijun
        if close < curr_span_a and close < curr_span_b and tenkan.iloc[-1] < kijun.iloc[-1]:
             atr = self.get_atr(df)
             return {
                'strategy': self.name,
                'signal': 'SELL',
                'confidence': 85,
                'stop_loss': max(curr_span_a, curr_span_b),
                'take_profit': close - (3 * atr),
                'reason': 'Price below Ichimoku Cloud + TK Cross'
            }
            
        return None

class ADXTrendStrategy(BaseStrategy):
    def __init__(self):
        super().__init__("ADX Trend Strength")

    def analyze(self, df: pd.DataFrame) -> Optional[Dict]:
        adx = df.ta.adx(length=14)
        if adx is None: return None
        
        # ADX_14, DMP_14, DMN_14
        curr_adx = adx['ADX_14'].iloc[-1]
        plus_di = adx['DMP_14'].iloc[-1]
        minus_di = adx['DMN_14'].iloc[-1]
        
        close = df['close'].iloc[-1]
        
        if curr_adx > 25: # Strong Trend
            atr = self.get_atr(df)
            
            if plus_di > minus_di and plus_di > 25:
                return {
                    'strategy': self.name,
                    'signal': 'BUY',
                    'confidence': 80,
                    'stop_loss': close - (2 * atr),
                    'take_profit': close + (3 * atr),
                    'reason': 'Strong Uptrend (ADX > 25, +DI > -DI)'
                }
            elif minus_di > plus_di and minus_di > 25:
                return {
                    'strategy': self.name,
                    'signal': 'SELL',
                    'confidence': 80,
                    'stop_loss': close + (2 * atr),
                    'take_profit': close - (3 * atr),
                    'reason': 'Strong Downtrend (ADX > 25, -DI > +DI)'
                }
                
        return None

class SuperTrendStrategy(BaseStrategy):
    def __init__(self):
        super().__init__("SuperTrend")

    def analyze(self, df: pd.DataFrame) -> Optional[Dict]:
        st = df.ta.supertrend(length=10, multiplier=3)
        if st is None: return None
        
        # SUPERT_7_3.0, SUPERTd_7_3.0, SUPERTl_7_3.0, SUPERTs_7_3.0
        # Direction: 1 (Up), -1 (Down)
        direction = st['SUPERTd_7_3.0']
        
        curr_dir = direction.iloc[-1]
        prev_dir = direction.iloc[-2]
        close = df['close'].iloc[-1]
        
        if prev_dir == -1 and curr_dir == 1:
            atr = self.get_atr(df)
            return {
                'strategy': self.name,
                'signal': 'BUY',
                'confidence': 80,
                'stop_loss': close - (2 * atr),
                'take_profit': close + (3 * atr),
                'reason': 'SuperTrend Flip to Bullish'
            }
            
        if prev_dir == 1 and curr_dir == -1:
            atr = self.get_atr(df)
            return {
                'strategy': self.name,
                'signal': 'SELL',
                'confidence': 80,
                'stop_loss': close + (2 * atr),
                'take_profit': close - (3 * atr),
                'reason': 'SuperTrend Flip to Bearish'
            }
            
        return None

class TripleEMAStrategy(BaseStrategy):
    def __init__(self):
        super().__init__("Triple EMA")

    def analyze(self, df: pd.DataFrame) -> Optional[Dict]:
        ema_short = df.ta.ema(length=9)
        ema_mid = df.ta.ema(length=21)
        ema_long = df.ta.ema(length=55)
        
        if ema_short is None or ema_long is None: return None
        
        s = ema_short.iloc[-1]
        m = ema_mid.iloc[-1]
        l = ema_long.iloc[-1]
        
        prev_s = ema_short.iloc[-2]
        prev_m = ema_mid.iloc[-2]
        
        close = df['close'].iloc[-1]
        
        # Buy: Short > Mid > Long (Alignment)
        if s > m and m > l and prev_s < prev_m: # Just crossed
            atr = self.get_atr(df)
            return {
                'strategy': self.name,
                'signal': 'BUY',
                'confidence': 85,
                'stop_loss': l,
                'take_profit': close + (3 * atr),
                'reason': 'Triple EMA Bullish Alignment'
            }
            
        # Sell: Short < Mid < Long
        if s < m and m < l and prev_s > prev_m:
            atr = self.get_atr(df)
            return {
                'strategy': self.name,
                'signal': 'SELL',
                'confidence': 85,
                'stop_loss': l,
                'take_profit': close - (3 * atr),
                'reason': 'Triple EMA Bearish Alignment'
            }
            
        return None
