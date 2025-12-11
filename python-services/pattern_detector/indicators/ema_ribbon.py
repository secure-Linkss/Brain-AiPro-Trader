"""EMA Ribbon Indicator"""
import numpy as np
from typing import List, Dict

def calculate(candles: List[Dict], periods: List[int] = [8, 13, 21, 34, 55, 89]) -> Dict:
    """Calculate EMA Ribbon with multiple periods"""
    if not candles:
        return {f'ema_{p}': [] for p in periods}
    
    closes = np.array([c['close'] for c in candles])
    result = {}
    
    for period in periods:
        ema = calculate_ema(closes, period)
        result[f'ema_{period}'] = ema.tolist()
    
    return result

def calculate_ema(data: np.ndarray, period: int) -> np.ndarray:
    """Calculate EMA"""
    ema = np.zeros(len(data))
    multiplier = 2 / (period + 1)
    ema[period-1] = np.mean(data[:period])
    for i in range(period, len(data)):
        ema[i] = (data[i] - ema[i-1]) * multiplier + ema[i-1]
    return ema
