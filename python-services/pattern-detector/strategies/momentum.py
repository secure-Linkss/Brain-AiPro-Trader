import pandas as pd
import pandas_ta as ta
from .base_strategy import BaseStrategy
from typing import Optional, Dict

class MACDDivergenceStrategy(BaseStrategy):
    def __init__(self):
        super().__init__("MACD Divergence")

    def analyze(self, df: pd.DataFrame) -> Optional[Dict]:
        # Calculate MACD
        macd = df.ta.macd(fast=12, slow=26, signal=9)
        if macd is None: return None
        
        df = pd.concat([df, macd], axis=1)
        
        # Columns: MACD_12_26_9, MACDh_12_26_9, MACDs_12_26_9
        macd_line = df['MACD_12_26_9']
        signal_line = df['MACDs_12_26_9']
        hist = df['MACDh_12_26_9']
        
        current_hist = hist.iloc[-1]
        prev_hist = hist.iloc[-2]
        
        # Bullish Divergence Logic (Simplified for speed: Crossover + Histogram flip)
        # Real divergence requires comparing price lows vs indicator lows
        
        # Bullish Crossover
        if macd_line.iloc[-2] < signal_line.iloc[-2] and macd_line.iloc[-1] > signal_line.iloc[-1]:
            atr = self.get_atr(df)
            close = df['close'].iloc[-1]
            return {
                'strategy': self.name,
                'signal': 'BUY',
                'confidence': 80,
                'stop_loss': close - (2 * atr),
                'take_profit': close + (3 * atr),
                'reason': 'MACD Bullish Crossover'
            }
            
        # Bearish Crossover
        if macd_line.iloc[-2] > signal_line.iloc[-2] and macd_line.iloc[-1] < signal_line.iloc[-1]:
            atr = self.get_atr(df)
            close = df['close'].iloc[-1]
            return {
                'strategy': self.name,
                'signal': 'SELL',
                'confidence': 80,
                'stop_loss': close + (2 * atr),
                'take_profit': close - (3 * atr),
                'reason': 'MACD Bearish Crossover'
            }
            
        return None

class RSIBollingerStrategy(BaseStrategy):
    def __init__(self):
        super().__init__("RSI + Bollinger")

    def analyze(self, df: pd.DataFrame) -> Optional[Dict]:
        rsi = df.ta.rsi(length=14)
        bb = df.ta.bbands(length=20, std=2)
        
        if rsi is None or bb is None: return None
        
        current_rsi = rsi.iloc[-1]
        close = df['close'].iloc[-1]
        lower_band = bb['BBL_20_2.0'].iloc[-1]
        upper_band = bb['BBU_20_2.0'].iloc[-1]
        
        # Buy: RSI < 30 AND Price touches Lower Band
        if current_rsi < 30 and close <= lower_band * 1.01:
            atr = self.get_atr(df)
            return {
                'strategy': self.name,
                'signal': 'BUY',
                'confidence': 85,
                'stop_loss': close - (1.5 * atr),
                'take_profit': close + (2 * atr),
                'reason': 'Oversold RSI + Bollinger Lower Band Touch'
            }

        # Sell: RSI > 70 AND Price touches Upper Band
        if current_rsi > 70 and close >= upper_band * 0.99:
            atr = self.get_atr(df)
            return {
                'strategy': self.name,
                'signal': 'SELL',
                'confidence': 85,
                'stop_loss': close + (1.5 * atr),
                'take_profit': close - (2 * atr),
                'reason': 'Overbought RSI + Bollinger Upper Band Touch'
            }
            
        return None

class StochasticEMAStrategy(BaseStrategy):
    def __init__(self):
        super().__init__("Stochastic + EMA")

    def analyze(self, df: pd.DataFrame) -> Optional[Dict]:
        stoch = df.ta.stoch(k=14, d=3, smooth_k=3)
        ema200 = df.ta.ema(length=200)
        
        if stoch is None or ema200 is None: return None
        
        k = stoch['STOCHk_14_3_3'].iloc[-1]
        d = stoch['STOCHd_14_3_3'].iloc[-1]
        prev_k = stoch['STOCHk_14_3_3'].iloc[-2]
        prev_d = stoch['STOCHd_14_3_3'].iloc[-2]
        
        close = df['close'].iloc[-1]
        trend = "UP" if close > ema200.iloc[-1] else "DOWN"
        
        # Buy: Uptrend + Stoch Cross Up from Oversold
        if trend == "UP" and prev_k < 20 and k > d and k > prev_k:
            atr = self.get_atr(df)
            return {
                'strategy': self.name,
                'signal': 'BUY',
                'confidence': 75,
                'stop_loss': close - (2 * atr),
                'take_profit': close + (3 * atr),
                'reason': 'Stochastic Cross Up in Uptrend'
            }
            
        # Sell: Downtrend + Stoch Cross Down from Overbought
        if trend == "DOWN" and prev_k > 80 and k < d and k < prev_k:
            atr = self.get_atr(df)
            return {
                'strategy': self.name,
                'signal': 'SELL',
                'confidence': 75,
                'stop_loss': close + (2 * atr),
                'take_profit': close - (3 * atr),
                'reason': 'Stochastic Cross Down in Downtrend'
            }
            
        return None

class CCIStrategy(BaseStrategy):
    def __init__(self):
        super().__init__("CCI Reversal")

    def analyze(self, df: pd.DataFrame) -> Optional[Dict]:
        cci = df.ta.cci(length=20)
        if cci is None: return None
        
        current_cci = cci.iloc[-1]
        prev_cci = cci.iloc[-2]
        close = df['close'].iloc[-1]
        
        # Buy: CCI crosses above -100
        if prev_cci < -100 and current_cci > -100:
            atr = self.get_atr(df)
            return {
                'strategy': self.name,
                'signal': 'BUY',
                'confidence': 70,
                'stop_loss': close - (2 * atr),
                'take_profit': close + (2 * atr),
                'reason': 'CCI Bullish Reversal (-100 Cross)'
            }
            
        # Sell: CCI crosses below 100
        if prev_cci > 100 and current_cci < 100:
            atr = self.get_atr(df)
            return {
                'strategy': self.name,
                'signal': 'SELL',
                'confidence': 70,
                'stop_loss': close + (2 * atr),
                'take_profit': close - (2 * atr),
                'reason': 'CCI Bearish Reversal (100 Cross)'
            }
            
        return None

class WilliamsRStrategy(BaseStrategy):
    def __init__(self):
        super().__init__("Williams %R + SMA")

    def analyze(self, df: pd.DataFrame) -> Optional[Dict]:
        willr = df.ta.willr(length=14)
        sma50 = df.ta.sma(length=50)
        
        if willr is None or sma50 is None: return None
        
        current_w = willr.iloc[-1]
        prev_w = willr.iloc[-2]
        close = df['close'].iloc[-1]
        trend_sma = sma50.iloc[-1]
        
        # Buy: Price > SMA50 (Uptrend) AND Williams %R crosses above -80
        if close > trend_sma and prev_w < -80 and current_w > -80:
            atr = self.get_atr(df)
            return {
                'strategy': self.name,
                'signal': 'BUY',
                'confidence': 75,
                'stop_loss': close - (1.5 * atr),
                'take_profit': close + (2.5 * atr),
                'reason': 'Williams %R Oversold Recovery in Uptrend'
            }
            
        # Sell: Price < SMA50 (Downtrend) AND Williams %R crosses below -20
        if close < trend_sma and prev_w > -20 and current_w < -20:
            atr = self.get_atr(df)
            return {
                'strategy': self.name,
                'signal': 'SELL',
                'confidence': 75,
                'stop_loss': close + (1.5 * atr),
                'take_profit': close - (2.5 * atr),
                'reason': 'Williams %R Overbought Reversal in Downtrend'
            }
            
        return None
