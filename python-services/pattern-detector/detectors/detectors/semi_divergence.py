"""
Semi-Divergence (Hidden Divergence) Detector

Semi-divergence is a continuation pattern that signals the trend will likely continue.
It's more reliable than regular divergence for trend trading.

Types:
1. Bullish Semi-Divergence: Price makes higher low, oscillator makes lower low (buy in uptrend)
2. Bearish Semi-Divergence: Price makes lower high, oscillator makes higher high (sell in downtrend)
"""

import pandas as pd
import numpy as np
from typing import List, Dict, Optional
from dataclasses import dataclass

@dataclass
class SemiDivergence:
    type: str  # 'bullish' or 'bearish'
    price_points: List[float]
    oscillator_points: List[float]
    strength: float  # 0-100
    timeframe: str
    entry: float
    stop_loss: float
    take_profits: List[Dict[str, float]]
    confidence: float

class SemiDivergenceDetector:
    """
    Advanced Semi-Divergence detector using multiple oscillators
    """
    
    def __init__(self, lookback_period: int = 50, min_strength: float = 60.0):
        self.lookback_period = lookback_period
        self.min_strength = min_strength
    
    def detect(self, df: pd.DataFrame, oscillator: str = 'rsi') -> List[SemiDivergence]:
        """
        Detect semi-divergences using specified oscillator
        
        Args:
            df: DataFrame with OHLCV data and oscillator values
            oscillator: 'rsi', 'macd', or 'stochastic'
        
        Returns:
            List of detected semi-divergences
        """
        divergences = []
        
        # Detect bullish semi-divergence
        bullish = self._detect_bullish_semi_divergence(df, oscillator)
        if bullish:
            divergences.extend(bullish)
        
        # Detect bearish semi-divergence
        bearish = self._detect_bearish_semi_divergence(df, oscillator)
        if bearish:
            divergences.extend(bearish)
        
        return divergences
    
    def _detect_bullish_semi_divergence(self, df: pd.DataFrame, oscillator: str) -> List[SemiDivergence]:
        """
        Bullish Semi-Divergence: Price makes higher low, oscillator makes lower low
        Signals uptrend continuation
        """
        divergences = []
        
        # Find swing lows in price
        price_lows = self._find_swing_lows(df['low'].values)
        
        # Find swing lows in oscillator
        osc_values = df[oscillator].values
        osc_lows = self._find_swing_lows(osc_values)
        
        # Check for semi-divergence pattern
        for i in range(len(price_lows) - 1):
            price_low1_idx, price_low1 = price_lows[i]
            price_low2_idx, price_low2 = price_lows[i + 1]
            
            # Price makes higher low
            if price_low2 > price_low1:
                # Find corresponding oscillator lows
                osc_low1 = self._get_nearest_low(osc_lows, price_low1_idx)
                osc_low2 = self._get_nearest_low(osc_lows, price_low2_idx)
                
                if osc_low1 and osc_low2:
                    # Oscillator makes lower low
                    if osc_low2[1] < osc_low1[1]:
                        # Calculate strength
                        strength = self._calculate_strength(
                            price_low1, price_low2,
                            osc_low1[1], osc_low2[1],
                            'bullish'
                        )
                        
                        if strength >= self.min_strength:
                            # Calculate trade setup
                            entry = df['close'].iloc[-1]
                            stop_loss = price_low2 * 0.98  # 2% below recent low
                            
                            # Multiple take profits
                            risk = entry - stop_loss
                            take_profits = [
                                {'level': 1, 'price': entry + (risk * 1.5), 'percentage': 25, 'rr': 1.5},
                                {'level': 2, 'price': entry + (risk * 2.0), 'percentage': 25, 'rr': 2.0},
                                {'level': 3, 'price': entry + (risk * 3.0), 'percentage': 25, 'rr': 3.0},
                                {'level': 4, 'price': entry + (risk * 4.0), 'percentage': 25, 'rr': 4.0}
                            ]
                            
                            divergence = SemiDivergence(
                                type='bullish',
                                price_points=[price_low1, price_low2],
                                oscillator_points=[osc_low1[1], osc_low2[1]],
                                strength=strength,
                                timeframe='current',
                                entry=entry,
                                stop_loss=stop_loss,
                                take_profits=take_profits,
                                confidence=strength
                            )
                            divergences.append(divergence)
        
        return divergences
    
    def _detect_bearish_semi_divergence(self, df: pd.DataFrame, oscillator: str) -> List[SemiDivergence]:
        """
        Bearish Semi-Divergence: Price makes lower high, oscillator makes higher high
        Signals downtrend continuation
        """
        divergences = []
        
        # Find swing highs in price
        price_highs = self._find_swing_highs(df['high'].values)
        
        # Find swing highs in oscillator
        osc_values = df[oscillator].values
        osc_highs = self._find_swing_highs(osc_values)
        
        # Check for semi-divergence pattern
        for i in range(len(price_highs) - 1):
            price_high1_idx, price_high1 = price_highs[i]
            price_high2_idx, price_high2 = price_highs[i + 1]
            
            # Price makes lower high
            if price_high2 < price_high1:
                # Find corresponding oscillator highs
                osc_high1 = self._get_nearest_high(osc_highs, price_high1_idx)
                osc_high2 = self._get_nearest_high(osc_highs, price_high2_idx)
                
                if osc_high1 and osc_high2:
                    # Oscillator makes higher high
                    if osc_high2[1] > osc_high1[1]:
                        # Calculate strength
                        strength = self._calculate_strength(
                            price_high1, price_high2,
                            osc_high1[1], osc_high2[1],
                            'bearish'
                        )
                        
                        if strength >= self.min_strength:
                            # Calculate trade setup
                            entry = df['close'].iloc[-1]
                            stop_loss = price_high2 * 1.02  # 2% above recent high
                            
                            # Multiple take profits
                            risk = stop_loss - entry
                            take_profits = [
                                {'level': 1, 'price': entry - (risk * 1.5), 'percentage': 25, 'rr': 1.5},
                                {'level': 2, 'price': entry - (risk * 2.0), 'percentage': 25, 'rr': 2.0},
                                {'level': 3, 'price': entry - (risk * 3.0), 'percentage': 25, 'rr': 3.0},
                                {'level': 4, 'price': entry - (risk * 4.0), 'percentage': 25, 'rr': 4.0}
                            ]
                            
                            divergence = SemiDivergence(
                                type='bearish',
                                price_points=[price_high1, price_high2],
                                oscillator_points=[osc_high1[1], osc_high2[1]],
                                strength=strength,
                                timeframe='current',
                                entry=entry,
                                stop_loss=stop_loss,
                                take_profits=take_profits,
                                confidence=strength
                            )
                            divergences.append(divergence)
        
        return divergences
    
    def _find_swing_lows(self, data: np.ndarray, order: int = 5) -> List[tuple]:
        """Find swing lows in data"""
        lows = []
        for i in range(order, len(data) - order):
            if all(data[i] <= data[i-j] for j in range(1, order+1)) and \
               all(data[i] <= data[i+j] for j in range(1, order+1)):
                lows.append((i, data[i]))
        return lows
    
    def _find_swing_highs(self, data: np.ndarray, order: int = 5) -> List[tuple]:
        """Find swing highs in data"""
        highs = []
        for i in range(order, len(data) - order):
            if all(data[i] >= data[i-j] for j in range(1, order+1)) and \
               all(data[i] >= data[i+j] for j in range(1, order+1)):
                highs.append((i, data[i]))
        return highs
    
    def _get_nearest_low(self, lows: List[tuple], target_idx: int, tolerance: int = 10) -> Optional[tuple]:
        """Get nearest low to target index"""
        for idx, value in lows:
            if abs(idx - target_idx) <= tolerance:
                return (idx, value)
        return None
    
    def _get_nearest_high(self, highs: List[tuple], target_idx: int, tolerance: int = 10) -> Optional[tuple]:
        """Get nearest high to target index"""
        for idx, value in highs:
            if abs(idx - target_idx) <= tolerance:
                return (idx, value)
        return None
    
    def _calculate_strength(self, price1: float, price2: float, 
                          osc1: float, osc2: float, div_type: str) -> float:
        """
        Calculate divergence strength (0-100)
        
        Higher strength = more reliable signal
        """
        # Price difference
        price_diff = abs(price2 - price1) / price1 * 100
        
        # Oscillator difference
        osc_diff = abs(osc2 - osc1) / abs(osc1) * 100 if osc1 != 0 else 0
        
        # Strength is combination of both
        # More price movement with less oscillator movement = stronger signal
        if div_type == 'bullish':
            strength = min(100, (price_diff * 2 + osc_diff) / 3 * 10)
        else:
            strength = min(100, (price_diff * 2 + osc_diff) / 3 * 10)
        
        return strength

def detect_semi_divergence(df: pd.DataFrame, oscillator: str = 'rsi') -> List[Dict]:
    """
    Main function to detect semi-divergences
    
    Args:
        df: DataFrame with OHLCV and oscillator data
        oscillator: Oscillator to use ('rsi', 'macd', 'stochastic')
    
    Returns:
        List of semi-divergence signals
    """
    detector = SemiDivergenceDetector()
    divergences = detector.detect(df, oscillator)
    
    # Convert to dict format
    return [
        {
            'type': div.type,
            'pattern': f'{div.type.capitalize()} Semi-Divergence',
            'strength': div.strength,
            'confidence': div.confidence,
            'entry': div.entry,
            'stop_loss': div.stop_loss,
            'take_profits': div.take_profits,
            'oscillator': oscillator,
            'description': f'Price makes {"higher low" if div.type == "bullish" else "lower high"}, {oscillator.upper()} makes {"lower low" if div.type == "bullish" else "higher high"}. Trend continuation signal.'
        }
        for div in divergences
    ]
