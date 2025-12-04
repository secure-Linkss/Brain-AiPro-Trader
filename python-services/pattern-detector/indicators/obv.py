"""OBV (On Balance Volume) Indicator"""
import numpy as np
from typing import List, Dict

def calculate(candles: List[Dict]) -> List[float]:
    """Calculate On Balance Volume"""
    if len(candles) < 2:
        return [0.0] * len(candles)
    
    closes = np.array([c['close'] for c in candles])
    volumes = np.array([c['volume'] for c in candles])
    
    obv = np.zeros(len(candles))
    obv[0] = volumes[0]
    
    for i in range(1, len(candles)):
        if closes[i] > closes[i-1]:
            obv[i] = obv[i-1] + volumes[i]
        elif closes[i] < closes[i-1]:
            obv[i] = obv[i-1] - volumes[i]
        else:
            obv[i] = obv[i-1]
    
    return obv.tolist()
