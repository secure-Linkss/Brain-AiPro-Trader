"""
Breakout Detector
Detects support/resistance breakouts with volume confirmation
"""

import numpy as np
from typing import List, Dict
from dataclasses import dataclass


@dataclass
class Breakout:
    type: str  # 'support' or 'resistance'
    direction: str  # 'bullish' or 'bearish'
    level: float
    index: int
    confidence: float
    volume_confirmed: bool


class BreakoutDetector:
    """Detects support and resistance breakouts"""
    
    def detect(self, candles: List[Dict], min_confidence: float = 70) -> List[Breakout]:
        """Detect breakouts"""
        if len(candles) < 20:
            return []
        
        breakouts = []
        
        # Find support and resistance levels
        support_levels = self.find_support_levels(candles)
        resistance_levels = self.find_resistance_levels(candles)
        
        # Check for breakouts
        for i in range(10, len(candles)):
            current_close = candles[i]['close']
            current_volume = candles[i]['volume']
            avg_volume = np.mean([c['volume'] for c in candles[max(0, i-20):i]])
            
            volume_confirmed = current_volume > avg_volume * 1.5
            
            # Check resistance breakouts
            for level in resistance_levels:
                if candles[i-1]['close'] < level and current_close > level:
                    confidence = 80.0 if volume_confirmed else 60.0
                    
                    if confidence >= min_confidence:
                        breakouts.append(Breakout(
                            type='resistance',
                            direction='bullish',
                            level=level,
                            index=i,
                            confidence=confidence,
                            volume_confirmed=volume_confirmed
                        ))
            
            # Check support breakouts
            for level in support_levels:
                if candles[i-1]['close'] > level and current_close < level:
                    confidence = 80.0 if volume_confirmed else 60.0
                    
                    if confidence >= min_confidence:
                        breakouts.append(Breakout(
                            type='support',
                            direction='bearish',
                            level=level,
                            index=i,
                            confidence=confidence,
                            volume_confirmed=volume_confirmed
                        ))
        
        return breakouts
    
    def find_support_levels(self, candles: List[Dict]) -> List[float]:
        """Find support levels"""
        lows = [c['low'] for c in candles]
        levels = []
        
        for i in range(5, len(lows) - 5):
            if lows[i] == min(lows[i-5:i+5]):
                levels.append(lows[i])
        
        return levels
    
    def find_resistance_levels(self, candles: List[Dict]) -> List[float]:
        """Find resistance levels"""
        highs = [c['high'] for c in candles]
        levels = []
        
        for i in range(5, len(highs) - 5):
            if highs[i] == max(highs[i-5:i+5]):
                levels.append(highs[i])
        
        return levels
    
    def to_dict(self, breakout: Breakout) -> Dict:
        """Convert to dictionary"""
        return {
            'type': breakout.type,
            'direction': breakout.direction,
            'level': breakout.level,
            'index': breakout.index,
            'confidence': breakout.confidence,
            'volume_confirmed': breakout.volume_confirmed
        }
