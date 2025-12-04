"""
ATR (Average True Range) Indicator
Advanced implementation with multiple calculation methods
"""

import numpy as np
import pandas as pd
from typing import List, Dict, Optional


def calculate(candles: List[Dict], period: int = 14, method: str = 'wilder') -> List[float]:
    """
    Calculate Average True Range
    
    Args:
        candles: List of candle data with high, low, close
        period: ATR period (default 14)
        method: Calculation method - 'wilder' (default), 'ema', 'sma'
    
    Returns:
        List of ATR values
    """
    if len(candles) < period:
        return [0.0] * len(candles)
    
    # Extract price data
    highs = np.array([c['high'] for c in candles])
    lows = np.array([c['low'] for c in candles])
    closes = np.array([c['close'] for c in candles])
    
    # Calculate True Range
    tr = calculate_true_range(highs, lows, closes)
    
    # Calculate ATR based on method
    if method == 'wilder':
        atr = wilder_smoothing(tr, period)
    elif method == 'ema':
        atr = exponential_moving_average(tr, period)
    else:  # sma
        atr = simple_moving_average(tr, period)
    
    return atr.tolist()


def calculate_true_range(highs: np.ndarray, lows: np.ndarray, closes: np.ndarray) -> np.ndarray:
    """Calculate True Range for each candle"""
    tr = np.zeros(len(highs))
    
    for i in range(1, len(highs)):
        hl = highs[i] - lows[i]
        hc = abs(highs[i] - closes[i-1])
        lc = abs(lows[i] - closes[i-1])
        tr[i] = max(hl, hc, lc)
    
    # First TR is just high - low
    tr[0] = highs[0] - lows[0]
    
    return tr


def wilder_smoothing(data: np.ndarray, period: int) -> np.ndarray:
    """Wilder's smoothing method (original ATR calculation)"""
    result = np.zeros(len(data))
    
    # First ATR is SMA
    result[period-1] = np.mean(data[:period])
    
    # Subsequent ATRs use Wilder's smoothing
    for i in range(period, len(data)):
        result[i] = (result[i-1] * (period - 1) + data[i]) / period
    
    return result


def exponential_moving_average(data: np.ndarray, period: int) -> np.ndarray:
    """Calculate EMA"""
    result = np.zeros(len(data))
    multiplier = 2 / (period + 1)
    
    # First value is SMA
    result[period-1] = np.mean(data[:period])
    
    # Calculate EMA
    for i in range(period, len(data)):
        result[i] = (data[i] - result[i-1]) * multiplier + result[i-1]
    
    return result


def simple_moving_average(data: np.ndarray, period: int) -> np.ndarray:
    """Calculate SMA"""
    result = np.zeros(len(data))
    
    for i in range(period-1, len(data)):
        result[i] = np.mean(data[i-period+1:i+1])
    
    return result


def calculate_atr_bands(candles: List[Dict], period: int = 14, multiplier: float = 2.0) -> Dict:
    """
    Calculate ATR-based bands (similar to Bollinger Bands but using ATR)
    
    Returns:
        Dict with upper_band, lower_band, middle_band
    """
    atr = np.array(calculate(candles, period))
    closes = np.array([c['close'] for c in candles])
    
    middle_band = closes
    upper_band = closes + (atr * multiplier)
    lower_band = closes - (atr * multiplier)
    
    return {
        'upper_band': upper_band.tolist(),
        'middle_band': middle_band.tolist(),
        'lower_band': lower_band.tolist(),
        'atr': atr.tolist()
    }


def calculate_atr_percent(candles: List[Dict], period: int = 14) -> List[float]:
    """
    Calculate ATR as percentage of price
    Useful for comparing volatility across different price levels
    """
    atr = np.array(calculate(candles, period))
    closes = np.array([c['close'] for c in candles])
    
    # Avoid division by zero
    atr_percent = np.where(closes != 0, (atr / closes) * 100, 0)
    
    return atr_percent.tolist()
