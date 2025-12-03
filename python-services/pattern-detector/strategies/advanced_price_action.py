import pandas as pd
import numpy as np
from .base_strategy import BaseStrategy
from typing import Optional, Dict, List

class SupplyDemandStrategy(BaseStrategy):
    """
    Multi-timeframe Supply & Demand Strategy
    Analyzes HTF (15-30min) for zones, then LTF (1-5min) for precise entry
    """
    def __init__(self):
        super().__init__("Supply & Demand Multi-TF")
        
    def analyze(self, df: pd.DataFrame) -> Optional[Dict]:
        # This requires multi-timeframe data
        # For now, we'll identify zones on current TF
        zones = self.identify_supply_demand_zones(df)
        
        if not zones:
            return None
            
        current_price = df['close'].iloc[-1]
        
        # Check if price is near a zone
        for zone in zones:
            if zone['type'] == 'demand' and abs(current_price - zone['level']) / current_price < 0.002:
                # Look for BOS (Break of Structure) on lower TF
                bos = self.detect_break_of_structure(df, 'bullish')
                if bos:
                    imbalance = self.find_imbalance(df)
                    if imbalance:
                        atr = self.get_atr(df)
                        return {
                            'strategy': self.name,
                            'signal': 'BUY',
                            'confidence': 95,
                            'stop_loss': current_price - (5 * 0.0001),  # 5 pips
                            'take_profit': current_price + (atr * 3),
                            'reason': f'Demand zone + BOS + Imbalance detected. Entry: {current_price}'
                        }
                        
            elif zone['type'] == 'supply' and abs(current_price - zone['level']) / current_price < 0.002:
                bos = self.detect_break_of_structure(df, 'bearish')
                if bos:
                    imbalance = self.find_imbalance(df)
                    if imbalance:
                        atr = self.get_atr(df)
                        return {
                            'strategy': self.name,
                            'signal': 'SELL',
                            'confidence': 95,
                            'stop_loss': current_price + (5 * 0.0001),
                            'take_profit': current_price - (atr * 3),
                            'reason': f'Supply zone + BOS + Imbalance detected. Entry: {current_price}'
                        }
        
        return None
    
    def identify_supply_demand_zones(self, df: pd.DataFrame) -> List[Dict]:
        """Identify supply and demand zones"""
        zones = []
        
        # Look for strong moves (>2% in single candle)
        for i in range(10, len(df) - 5):
            candle_move = abs(df['close'].iloc[i] - df['open'].iloc[i]) / df['open'].iloc[i]
            
            if candle_move > 0.02:  # 2% move
                # Demand zone (strong up move)
                if df['close'].iloc[i] > df['open'].iloc[i]:
                    zones.append({
                        'type': 'demand',
                        'level': df['low'].iloc[i-1],
                        'strength': candle_move * 100
                    })
                # Supply zone (strong down move)
                else:
                    zones.append({
                        'type': 'supply',
                        'level': df['high'].iloc[i-1],
                        'strength': candle_move * 100
                    })
        
        return zones
    
    def detect_break_of_structure(self, df: pd.DataFrame, direction: str) -> bool:
        """Detect Break of Structure (BOS)"""
        # Find recent swing high/low
        highs = df['high'].rolling(5).max()
        lows = df['low'].rolling(5).min()
        
        if direction == 'bullish':
            # Price breaks above recent swing high
            recent_high = highs.iloc[-6]
            current_high = df['high'].iloc[-1]
            return current_high > recent_high
        else:
            # Price breaks below recent swing low
            recent_low = lows.iloc[-6]
            current_low = df['low'].iloc[-1]
            return current_low < recent_low
    
    def find_imbalance(self, df: pd.DataFrame) -> bool:
        """Find Fair Value Gap (Imbalance)"""
        # Check last 3 candles for gap
        if len(df) < 3:
            return False
            
        # Bullish imbalance: candle[0].low > candle[2].high
        if df['low'].iloc[-3] > df['high'].iloc[-1]:
            return True
            
        # Bearish imbalance: candle[0].high < candle[2].low
        if df['high'].iloc[-3] < df['low'].iloc[-1]:
            return True
            
        return False


class LiquiditySweepStrategy(BaseStrategy):
    """
    Liquidity Sweep Strategy (from Image 1)
    Detects when price sweeps liquidity before reversing
    """
    def __init__(self):
        super().__init__("Liquidity Sweep")
        
    def analyze(self, df: pd.DataFrame) -> Optional[Dict]:
        sweep = self.detect_liquidity_sweep(df)
        
        if not sweep:
            return None
            
        current_price = df['close'].iloc[-1]
        atr = self.get_atr(df)
        
        if sweep['type'] == 'bullish':
            return {
                'strategy': self.name,
                'signal': 'BUY',
                'confidence': 90,
                'stop_loss': sweep['sweep_low'] - (atr * 0.5),
                'take_profit': current_price + (atr * 3),
                'reason': f'Bullish liquidity sweep detected at {sweep["sweep_low"]}'
            }
        else:
            return {
                'strategy': self.name,
                'signal': 'SELL',
                'confidence': 90,
                'stop_loss': sweep['sweep_high'] + (atr * 0.5),
                'take_profit': current_price - (atr * 3),
                'reason': f'Bearish liquidity sweep detected at {sweep["sweep_high"]}'
            }
    
    def detect_liquidity_sweep(self, df: pd.DataFrame) -> Optional[Dict]:
        """
        Detect liquidity sweep:
        - Price wicks below recent low then reverses (bullish)
        - Price wicks above recent high then reverses (bearish)
        """
        if len(df) < 20:
            return None
            
        # Find recent swing low/high
        swing_low = df['low'].rolling(10).min().iloc[-11]
        swing_high = df['high'].rolling(10).max().iloc[-11]
        
        recent_low = df['low'].iloc[-1]
        recent_high = df['high'].iloc[-1]
        recent_close = df['close'].iloc[-1]
        
        # Bullish sweep: Wick below swing low, close above
        if recent_low < swing_low and recent_close > swing_low:
            return {
                'type': 'bullish',
                'sweep_low': recent_low
            }
            
        # Bearish sweep: Wick above swing high, close below
        if recent_high > swing_high and recent_close < swing_high:
            return {
                'type': 'bearish',
                'sweep_high': recent_high
            }
            
        return None


class TrendlineStrategy(BaseStrategy):
    """
    Trendline & Channel Detection (from Image 2)
    """
    def __init__(self):
        super().__init__("Trendline Breakout")
        
    def analyze(self, df: pd.DataFrame) -> Optional[Dict]:
        trendline = self.detect_trendline_break(df)
        
        if not trendline:
            return None
            
        current_price = df['close'].iloc[-1]
        atr = self.get_atr(df)
        
        if trendline['type'] == 'support_break':
            return {
                'strategy': self.name,
                'signal': 'SELL',
                'confidence': 85,
                'stop_loss': trendline['line_value'] + (atr * 1.5),
                'take_profit': current_price - (atr * 3),
                'reason': 'Support trendline broken'
            }
        else:
            return {
                'strategy': self.name,
                'signal': 'BUY',
                'confidence': 85,
                'stop_loss': trendline['line_value'] - (atr * 1.5),
                'take_profit': current_price + (atr * 3),
                'reason': 'Resistance trendline broken'
            }
    
    def detect_trendline_break(self, df: pd.DataFrame) -> Optional[Dict]:
        """Detect trendline breakout"""
        # Simplified: Use linear regression on recent lows/highs
        if len(df) < 20:
            return None
            
        # Support trendline (connect lows)
        lows = df['low'].iloc[-20:].values
        x = np.arange(len(lows))
        slope_low, intercept_low = np.polyfit(x, lows, 1)
        trendline_value = slope_low * len(lows) + intercept_low
        
        # Check if price broke below
        if df['close'].iloc[-1] < trendline_value and df['close'].iloc[-2] > trendline_value:
            return {
                'type': 'support_break',
                'line_value': trendline_value
            }
            
        # Resistance trendline (connect highs)
        highs = df['high'].iloc[-20:].values
        slope_high, intercept_high = np.polyfit(x, highs, 1)
        trendline_value_high = slope_high * len(highs) + intercept_high
        
        # Check if price broke above
        if df['close'].iloc[-1] > trendline_value_high and df['close'].iloc[-2] < trendline_value_high:
            return {
                'type': 'resistance_break',
                'line_value': trendline_value_high
            }
            
        return None


class EMACloudStrategy(BaseStrategy):
    """
    EMA Cloud Strategy
    Uses 8, 21, 55 EMA cloud for trend confirmation
    """
    def __init__(self):
        super().__init__("EMA Cloud")
        
    def analyze(self, df: pd.DataFrame) -> Optional[Dict]:
        import pandas_ta as ta
        
        ema8 = df.ta.ema(length=8)
        ema21 = df.ta.ema(length=21)
        ema55 = df.ta.ema(length=55)
        
        if ema8 is None or ema21 is None or ema55 is None:
            return None
            
        current_price = df['close'].iloc[-1]
        
        # Bullish cloud: 8 > 21 > 55 and price above cloud
        if (ema8.iloc[-1] > ema21.iloc[-1] > ema55.iloc[-1] and 
            current_price > ema8.iloc[-1] and
            ema8.iloc[-2] < ema21.iloc[-2]):  # Just crossed
            
            atr = self.get_atr(df)
            return {
                'strategy': self.name,
                'signal': 'BUY',
                'confidence': 88,
                'stop_loss': ema55.iloc[-1],
                'take_profit': current_price + (atr * 3),
                'reason': 'Bullish EMA cloud formation + price above cloud'
            }
            
        # Bearish cloud: 8 < 21 < 55 and price below cloud
        if (ema8.iloc[-1] < ema21.iloc[-1] < ema55.iloc[-1] and 
            current_price < ema8.iloc[-1] and
            ema8.iloc[-2] > ema21.iloc[-2]):
            
            atr = self.get_atr(df)
            return {
                'strategy': self.name,
                'signal': 'SELL',
                'confidence': 88,
                'stop_loss': ema55.iloc[-1],
                'take_profit': current_price - (atr * 3),
                'reason': 'Bearish EMA cloud formation + price below cloud'
            }
            
        return None
