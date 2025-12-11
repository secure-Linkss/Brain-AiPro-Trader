"""VWAP (Volume Weighted Average Price) Indicator"""
import numpy as np
from typing import List, Dict

def calculate(candles: List[Dict]) -> List[float]:
    """Calculate VWAP"""
    if not candles:
        return []
    
    typical_prices = np.array([(c['high'] + c['low'] + c['close']) / 3 for c in candles])
    volumes = np.array([c['volume'] for c in candles])
    
    cumulative_tp_volume = np.cumsum(typical_prices * volumes)
    cumulative_volume = np.cumsum(volumes)
    
    vwap = np.where(cumulative_volume != 0, cumulative_tp_volume / cumulative_volume, typical_prices)
    
    return vwap.tolist()
