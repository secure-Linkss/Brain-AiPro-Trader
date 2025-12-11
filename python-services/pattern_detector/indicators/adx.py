"""ADX (Average Directional Index) Indicator"""
import numpy as np
from typing import List, Dict

def calculate(candles: List[Dict], period: int = 14) -> Dict:
    """Calculate ADX, +DI, -DI"""
    if len(candles) < period + 1:
        return {'adx': [0.0] * len(candles), 'plus_di': [0.0] * len(candles), 'minus_di': [0.0] * len(candles)}
    
    highs = np.array([c['high'] for c in candles])
    lows = np.array([c['low'] for c in candles])
    closes = np.array([c['close'] for c in candles])
    
    # Calculate +DM and -DM
    plus_dm = np.maximum(highs[1:] - highs[:-1], 0)
    minus_dm = np.maximum(lows[:-1] - lows[1:], 0)
    
    # Calculate TR
    tr = np.maximum(highs[1:] - lows[1:], np.maximum(abs(highs[1:] - closes[:-1]), abs(lows[1:] - closes[:-1])))
    
    # Smooth with Wilder's method
    atr = wilder_smooth(tr, period)
    plus_di = 100 * wilder_smooth(plus_dm, period) / atr
    minus_di = 100 * wilder_smooth(minus_dm, period) / atr
    
    # Calculate DX and ADX
    dx = 100 * np.abs(plus_di - minus_di) / (plus_di + minus_di + 1e-10)
    adx = wilder_smooth(dx, period)
    
    # Prepend zeros
    adx = np.insert(adx, 0, 0)
    plus_di = np.insert(plus_di, 0, 0)
    minus_di = np.insert(minus_di, 0, 0)
    
    return {'adx': adx.tolist(), 'plus_di': plus_di.tolist(), 'minus_di': minus_di.tolist()}

def wilder_smooth(data: np.ndarray, period: int) -> np.ndarray:
    """Wilder's smoothing"""
    result = np.zeros(len(data))
    result[period-1] = np.mean(data[:period])
    for i in range(period, len(data)):
        result[i] = (result[i-1] * (period - 1) + data[i]) / period
    return result
