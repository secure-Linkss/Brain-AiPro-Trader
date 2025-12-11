"""
RSI (Relative Strength Index) Indicator
Advanced implementation with divergence detection and overbought/oversold zones
"""

import numpy as np
import pandas as pd
from typing import List, Dict, Optional, Tuple


def calculate(candles: List[Dict], period: int = 14, method: str = 'wilder') -> List[float]:
    """
    Calculate Relative Strength Index
    
    Args:
        candles: List of candle data with close prices
        period: RSI period (default 14)
        method: Smoothing method - 'wilder' (default), 'ema', 'sma'
    
    Returns:
        List of RSI values (0-100)
    """
    if len(candles) < period + 1:
        return [50.0] * len(candles)
    
    closes = np.array([c['close'] for c in candles])
    
    # Calculate price changes
    deltas = np.diff(closes)
    
    # Separate gains and losses
    gains = np.where(deltas > 0, deltas, 0)
    losses = np.where(deltas < 0, -deltas, 0)
    
    # Calculate average gains and losses
    if method == 'wilder':
        avg_gains = wilder_smoothing(gains, period)
        avg_losses = wilder_smoothing(losses, period)
    elif method == 'ema':
        avg_gains = exponential_moving_average(gains, period)
        avg_losses = exponential_moving_average(losses, period)
    else:  # sma
        avg_gains = simple_moving_average(gains, period)
        avg_losses = simple_moving_average(losses, period)
    
    # Calculate RS and RSI
    rs = np.where(avg_losses != 0, avg_gains / avg_losses, 100)
    rsi = 100 - (100 / (1 + rs))
    
    # Prepend first value (neutral RSI)
    rsi = np.insert(rsi, 0, 50.0)
    
    return rsi.tolist()


def wilder_smoothing(data: np.ndarray, period: int) -> np.ndarray:
    """Wilder's smoothing method"""
    result = np.zeros(len(data))
    
    # First average is SMA
    result[period-1] = np.mean(data[:period])
    
    # Subsequent values use Wilder's smoothing
    for i in range(period, len(data)):
        result[i] = (result[i-1] * (period - 1) + data[i]) / period
    
    return result


def exponential_moving_average(data: np.ndarray, period: int) -> np.ndarray:
    """Calculate EMA"""
    result = np.zeros(len(data))
    multiplier = 2 / (period + 1)
    
    result[period-1] = np.mean(data[:period])
    
    for i in range(period, len(data)):
        result[i] = (data[i] - result[i-1]) * multiplier + result[i-1]
    
    return result


def simple_moving_average(data: np.ndarray, period: int) -> np.ndarray:
    """Calculate SMA"""
    result = np.zeros(len(data))
    
    for i in range(period-1, len(data)):
        result[i] = np.mean(data[i-period+1:i+1])
    
    return result


def detect_divergence(candles: List[Dict], rsi_period: int = 14, lookback: int = 5) -> Dict:
    """
    Detect bullish and bearish divergences
    
    Returns:
        Dict with bullish_divergence and bearish_divergence signals
    """
    if len(candles) < lookback * 2:
        return {'bullish': [], 'bearish': []}
    
    closes = np.array([c['close'] for c in candles])
    rsi = np.array(calculate(candles, rsi_period))
    
    bullish_divergences = []
    bearish_divergences = []
    
    for i in range(lookback, len(candles) - lookback):
        # Find local price lows/highs
        price_window = closes[i-lookback:i+lookback+1]
        rsi_window = rsi[i-lookback:i+lookback+1]
        
        # Bullish divergence: Price makes lower low, RSI makes higher low
        if closes[i] == np.min(price_window):
            # Check if this is a lower low in price
            prev_low_idx = find_previous_low(closes[:i], lookback)
            if prev_low_idx is not None and closes[i] < closes[prev_low_idx]:
                # Check if RSI makes higher low
                if rsi[i] > rsi[prev_low_idx]:
                    bullish_divergences.append({
                        'index': i,
                        'price': closes[i],
                        'rsi': rsi[i],
                        'strength': rsi[i] - rsi[prev_low_idx]
                    })
        
        # Bearish divergence: Price makes higher high, RSI makes lower high
        if closes[i] == np.max(price_window):
            prev_high_idx = find_previous_high(closes[:i], lookback)
            if prev_high_idx is not None and closes[i] > closes[prev_high_idx]:
                if rsi[i] < rsi[prev_high_idx]:
                    bearish_divergences.append({
                        'index': i,
                        'price': closes[i],
                        'rsi': rsi[i],
                        'strength': rsi[prev_high_idx] - rsi[i]
                    })
    
    return {
        'bullish': bullish_divergences,
        'bearish': bearish_divergences
    }


def find_previous_low(prices: np.ndarray, lookback: int) -> Optional[int]:
    """Find index of previous local low"""
    if len(prices) < lookback * 2:
        return None
    
    for i in range(len(prices) - lookback - 1, lookback, -1):
        window = prices[i-lookback:i+lookback+1]
        if prices[i] == np.min(window):
            return i
    
    return None


def find_previous_high(prices: np.ndarray, lookback: int) -> Optional[int]:
    """Find index of previous local high"""
    if len(prices) < lookback * 2:
        return None
    
    for i in range(len(prices) - lookback - 1, lookback, -1):
        window = prices[i-lookback:i+lookback+1]
        if prices[i] == np.max(window):
            return i
    
    return None


def get_zones(rsi_values: List[float]) -> Dict:
    """
    Identify overbought/oversold zones and neutral zones
    
    Returns:
        Dict with zone classifications
    """
    zones = []
    
    for rsi in rsi_values:
        if rsi >= 70:
            zones.append('overbought')
        elif rsi <= 30:
            zones.append('oversold')
        elif rsi >= 60:
            zones.append('bullish')
        elif rsi <= 40:
            zones.append('bearish')
        else:
            zones.append('neutral')
    
    return {'zones': zones}


def calculate_stochastic_rsi(candles: List[Dict], rsi_period: int = 14, stoch_period: int = 14) -> Dict:
    """
    Calculate Stochastic RSI (StochRSI)
    More sensitive version of RSI
    
    Returns:
        Dict with k_line and d_line
    """
    rsi = np.array(calculate(candles, rsi_period))
    
    k_line = []
    d_line = []
    
    for i in range(stoch_period - 1, len(rsi)):
        rsi_window = rsi[i-stoch_period+1:i+1]
        rsi_min = np.min(rsi_window)
        rsi_max = np.max(rsi_window)
        
        if rsi_max - rsi_min != 0:
            k = ((rsi[i] - rsi_min) / (rsi_max - rsi_min)) * 100
        else:
            k = 50.0
        
        k_line.append(k)
    
    # D line is SMA of K line
    for i in range(2, len(k_line)):
        d = np.mean(k_line[i-2:i+1])
        d_line.append(d)
    
    # Pad beginning with zeros
    k_line = [0.0] * (stoch_period - 1) + k_line
    d_line = [0.0] * (stoch_period + 1) + d_line
    
    return {
        'k_line': k_line,
        'd_line': d_line
    }
