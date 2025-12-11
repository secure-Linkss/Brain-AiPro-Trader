"""
MACD (Moving Average Convergence Divergence) Indicator
Advanced implementation with signal line, histogram, and divergence detection
"""

import numpy as np
from typing import List, Dict, Optional


def calculate(candles: List[Dict], fast_period: int = 12, slow_period: int = 26, signal_period: int = 9) -> Dict:
    """
    Calculate MACD indicator
    
    Returns:
        Dict with macd_line, signal_line, histogram
    """
    if len(candles) < slow_period:
        return {'macd': [0.0] * len(candles), 'signal': [0.0] * len(candles), 'histogram': [0.0] * len(candles)}
    
    closes = np.array([c['close'] for c in candles])
    
    # Calculate EMAs
    fast_ema = calculate_ema(closes, fast_period)
    slow_ema = calculate_ema(closes, slow_period)
    
    # MACD line = Fast EMA - Slow EMA
    macd_line = fast_ema - slow_ema
    
    # Signal line = EMA of MACD line
    signal_line = calculate_ema(macd_line, signal_period)
    
    # Histogram = MACD - Signal
    histogram = macd_line - signal_line
    
    return {
        'macd': macd_line.tolist(),
        'signal': signal_line.tolist(),
        'histogram': histogram.tolist()
    }


def calculate_ema(data: np.ndarray, period: int) -> np.ndarray:
    """Calculate Exponential Moving Average"""
    ema = np.zeros(len(data))
    multiplier = 2 / (period + 1)
    
    # First EMA is SMA
    ema[period-1] = np.mean(data[:period])
    
    # Calculate EMA
    for i in range(period, len(data)):
        ema[i] = (data[i] - ema[i-1]) * multiplier + ema[i-1]
    
    return ema


def detect_crossovers(candles: List[Dict], fast: int = 12, slow: int = 26, signal: int = 9) -> List[Dict]:
    """Detect MACD signal line crossovers"""
    macd_data = calculate(candles, fast, slow, signal)
    macd = np.array(macd_data['macd'])
    signal_line = np.array(macd_data['signal'])
    
    crossovers = []
    
    for i in range(1, len(macd)):
        # Bullish crossover
        if macd[i-1] <= signal_line[i-1] and macd[i] > signal_line[i]:
            crossovers.append({
                'index': i,
                'type': 'bullish',
                'macd': macd[i],
                'signal': signal_line[i]
            })
        # Bearish crossover
        elif macd[i-1] >= signal_line[i-1] and macd[i] < signal_line[i]:
            crossovers.append({
                'index': i,
                'type': 'bearish',
                'macd': macd[i],
                'signal': signal_line[i]
            })
    
    return crossovers
