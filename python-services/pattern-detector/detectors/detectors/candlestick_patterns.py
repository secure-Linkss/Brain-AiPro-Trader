import pandas as pd
import talib
from typing import Dict, List

class CandlestickPatternDetector:
    def __init__(self):
        pass

    def analyze_all(self, df: pd.DataFrame) -> List[Dict]:
        """
        Detect all major candlestick patterns using TA-Lib
        """
        patterns = []
        
        open_price = df['open'].values
        high_price = df['high'].values
        low_price = df['low'].values
        close_price = df['close'].values
        
        # 1. Doji
        doji = talib.CDLDOJI(open_price, high_price, low_price, close_price)
        if doji[-1] != 0:
            patterns.append({
                'name': 'Doji',
                'type': 'indecision',
                'confidence': 60
            })
            
        # 2. Hammer
        hammer = talib.CDLHAMMER(open_price, high_price, low_price, close_price)
        if hammer[-1] != 0:
            patterns.append({
                'name': 'Hammer',
                'type': 'bullish',
                'confidence': 70
            })
            
        # 3. Shooting Star
        shooting_star = talib.CDLSHOOTINGSTAR(open_price, high_price, low_price, close_price)
        if shooting_star[-1] != 0:
            patterns.append({
                'name': 'Shooting Star',
                'type': 'bearish',
                'confidence': 70
            })
            
        # 4. Engulfing
        engulfing = talib.CDLENGULFING(open_price, high_price, low_price, close_price)
        if engulfing[-1] == 100:
            patterns.append({'name': 'Bullish Engulfing', 'type': 'bullish', 'confidence': 80})
        elif engulfing[-1] == -100:
            patterns.append({'name': 'Bearish Engulfing', 'type': 'bearish', 'confidence': 80})
            
        # 5. Morning Star
        morning_star = talib.CDLMORNINGSTAR(open_price, high_price, low_price, close_price)
        if morning_star[-1] != 0:
            patterns.append({'name': 'Morning Star', 'type': 'bullish', 'confidence': 85})
            
        # 6. Evening Star
        evening_star = talib.CDLEVENINGSTAR(open_price, high_price, low_price, close_price)
        if evening_star[-1] != 0:
            patterns.append({'name': 'Evening Star', 'type': 'bearish', 'confidence': 85})
            
        # ... add more patterns (Harami, Piercing, etc.)
        
        return patterns
