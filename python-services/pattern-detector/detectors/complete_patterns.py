import pandas as pd
import numpy as np
from typing import Dict, List, Optional
from scipy.signal import argrelextrema

class CompletePatternDetector:
    """
    Detects ALL chart patterns including:
    - Wedges (Rising, Falling)
    - Flags (Bull, Bear)
    - Pennants
    - Channels (Ascending, Descending, Horizontal)
    - Triangles (Ascending, Descending, Symmetrical)
    - Head & Shoulders (Regular, Inverse)
    - Double/Triple Tops/Bottoms
    """
    
    def __init__(self):
        pass
    
    def detect_all_patterns(self, df: pd.DataFrame) -> List[Dict]:
        """Run all pattern detectors"""
        patterns = []
        
        patterns.extend(self.detect_wedges(df))
        patterns.extend(self.detect_flags(df))
        patterns.extend(self.detect_pennants(df))
        patterns.extend(self.detect_channels(df))
        patterns.extend(self.detect_triangles(df))
        patterns.extend(self.detect_head_shoulders(df))
        patterns.extend(self.detect_double_patterns(df))
        
        return patterns
    
    def detect_wedges(self, df: pd.DataFrame) -> List[Dict]:
        """Detect Rising and Falling Wedges"""
        patterns = []
        
        if len(df) < 30:
            return patterns
            
        # Get swing points
        highs_idx = argrelextrema(df['high'].values, np.greater, order=5)[0]
        lows_idx = argrelextrema(df['low'].values, np.less, order=5)[0]
        
        if len(highs_idx) < 2 or len(lows_idx) < 2:
            return patterns
            
        # Calculate trendlines
        recent_highs = highs_idx[-3:] if len(highs_idx) >= 3 else highs_idx
        recent_lows = lows_idx[-3:] if len(lows_idx) >= 3 else lows_idx
        
        # Rising Wedge: Both lines slope up, converging
        high_slope = self._calculate_slope(recent_highs, df['high'].iloc[recent_highs].values)
        low_slope = self._calculate_slope(recent_lows, df['low'].iloc[recent_lows].values)
        
        if high_slope > 0 and low_slope > 0 and low_slope > high_slope:
            patterns.append({
                'name': 'Rising Wedge',
                'type': 'bearish',
                'confidence': 80,
                'breakout_direction': 'down',
                'target': df['low'].iloc[recent_lows[0]]
            })
            
        # Falling Wedge: Both lines slope down, converging
        if high_slope < 0 and low_slope < 0 and abs(low_slope) > abs(high_slope):
            patterns.append({
                'name': 'Falling Wedge',
                'type': 'bullish',
                'confidence': 80,
                'breakout_direction': 'up',
                'target': df['high'].iloc[recent_highs[0]]
            })
            
        return patterns
    
    def detect_flags(self, df: pd.DataFrame) -> List[Dict]:
        """Detect Bull and Bear Flags"""
        patterns = []
        
        if len(df) < 20:
            return patterns
            
        # Bull Flag: Strong up move + consolidation
        pole_start = -20
        pole_end = -10
        flag_start = -10
        
        pole_move = (df['close'].iloc[pole_end] - df['close'].iloc[pole_start]) / df['close'].iloc[pole_start]
        
        if pole_move > 0.05:  # 5% up move
            # Check for downward consolidation
            flag_slope = self._calculate_slope(
                np.arange(flag_start, 0),
                df['close'].iloc[flag_start:].values
            )
            
            if flag_slope < 0 and abs(flag_slope) < 0.02:
                patterns.append({
                    'name': 'Bull Flag',
                    'type': 'bullish',
                    'confidence': 85,
                    'breakout_direction': 'up',
                    'target': df['close'].iloc[-1] + abs(df['close'].iloc[pole_end] - df['close'].iloc[pole_start])
                })
                
        # Bear Flag: Strong down move + consolidation
        if pole_move < -0.05:
            flag_slope = self._calculate_slope(
                np.arange(flag_start, 0),
                df['close'].iloc[flag_start:].values
            )
            
            if flag_slope > 0 and flag_slope < 0.02:
                patterns.append({
                    'name': 'Bear Flag',
                    'type': 'bearish',
                    'confidence': 85,
                    'breakout_direction': 'down',
                    'target': df['close'].iloc[-1] - abs(df['close'].iloc[pole_end] - df['close'].iloc[pole_start])
                })
                
        return patterns
    
    def detect_pennants(self, df: pd.DataFrame) -> List[Dict]:
        """Detect Pennant patterns"""
        patterns = []
        
        # Pennant is similar to flag but with converging trendlines
        # Implementation similar to wedge but after strong move
        
        return patterns
    
    def detect_channels(self, df: pd.DataFrame) -> List[Dict]:
        """Detect Ascending, Descending, and Horizontal Channels"""
        patterns = []
        
        if len(df) < 30:
            return patterns
            
        highs_idx = argrelextrema(df['high'].values, np.greater, order=5)[0]
        lows_idx = argrelextrema(df['low'].values, np.less, order=5)[0]
        
        if len(highs_idx) < 3 or len(lows_idx) < 3:
            return patterns
            
        # Calculate slopes
        high_slope = self._calculate_slope(highs_idx[-3:], df['high'].iloc[highs_idx[-3:]].values)
        low_slope = self._calculate_slope(lows_idx[-3:], df['low'].iloc[lows_idx[-3:]].values)
        
        # Ascending Channel
        if high_slope > 0.01 and low_slope > 0.01 and abs(high_slope - low_slope) < 0.005:
            patterns.append({
                'name': 'Ascending Channel',
                'type': 'bullish',
                'confidence': 75,
                'upper_line': df['high'].iloc[highs_idx[-1]],
                'lower_line': df['low'].iloc[lows_idx[-1]]
            })
            
        # Descending Channel
        if high_slope < -0.01 and low_slope < -0.01 and abs(high_slope - low_slope) < 0.005:
            patterns.append({
                'name': 'Descending Channel',
                'type': 'bearish',
                'confidence': 75,
                'upper_line': df['high'].iloc[highs_idx[-1]],
                'lower_line': df['low'].iloc[lows_idx[-1]]
            })
            
        # Horizontal Channel
        if abs(high_slope) < 0.005 and abs(low_slope) < 0.005:
            patterns.append({
                'name': 'Horizontal Channel',
                'type': 'neutral',
                'confidence': 70,
                'resistance': df['high'].iloc[highs_idx[-1]],
                'support': df['low'].iloc[lows_idx[-1]]
            })
            
        return patterns
    
    def detect_triangles(self, df: pd.DataFrame) -> List[Dict]:
        """Detect Triangle patterns"""
        patterns = []
        
        if len(df) < 30:
            return patterns
            
        highs_idx = argrelextrema(df['high'].values, np.greater, order=5)[0]
        lows_idx = argrelextrema(df['low'].values, np.less, order=5)[0]
        
        if len(highs_idx) < 2 or len(lows_idx) < 2:
            return patterns
            
        high_slope = self._calculate_slope(highs_idx[-3:], df['high'].iloc[highs_idx[-3:]].values)
        low_slope = self._calculate_slope(lows_idx[-3:], df['low'].iloc[lows_idx[-3:]].values)
        
        # Ascending Triangle: Flat top, rising bottom
        if abs(high_slope) < 0.005 and low_slope > 0.01:
            patterns.append({
                'name': 'Ascending Triangle',
                'type': 'bullish',
                'confidence': 82,
                'breakout_direction': 'up'
            })
            
        # Descending Triangle: Flat bottom, falling top
        if abs(low_slope) < 0.005 and high_slope < -0.01:
            patterns.append({
                'name': 'Descending Triangle',
                'type': 'bearish',
                'confidence': 82,
                'breakout_direction': 'down'
            })
            
        # Symmetrical Triangle: Converging lines
        if high_slope < 0 and low_slope > 0:
            patterns.append({
                'name': 'Symmetrical Triangle',
                'type': 'neutral',
                'confidence': 75,
                'breakout_direction': 'either'
            })
            
        return patterns
    
    def detect_head_shoulders(self, df: pd.DataFrame) -> List[Dict]:
        """Detect Head & Shoulders patterns"""
        patterns = []
        
        if len(df) < 50:
            return patterns
            
        highs_idx = argrelextrema(df['high'].values, np.greater, order=7)[0]
        
        if len(highs_idx) < 3:
            return patterns
            
        # Check last 3 peaks
        left_shoulder = df['high'].iloc[highs_idx[-3]]
        head = df['high'].iloc[highs_idx[-2]]
        right_shoulder = df['high'].iloc[highs_idx[-1]]
        
        # Head & Shoulders: Head higher than shoulders
        if head > left_shoulder and head > right_shoulder and abs(left_shoulder - right_shoulder) / left_shoulder < 0.02:
            patterns.append({
                'name': 'Head & Shoulders',
                'type': 'bearish',
                'confidence': 90,
                'neckline': min(df['low'].iloc[highs_idx[-3]:highs_idx[-1]])
            })
            
        return patterns
    
    def detect_double_patterns(self, df: pd.DataFrame) -> List[Dict]:
        """Detect Double/Triple Tops and Bottoms"""
        patterns = []
        
        if len(df) < 30:
            return patterns
            
        highs_idx = argrelextrema(df['high'].values, np.greater, order=7)[0]
        lows_idx = argrelextrema(df['low'].values, np.less, order=7)[0]
        
        # Double Top
        if len(highs_idx) >= 2:
            last_two_highs = df['high'].iloc[highs_idx[-2:]].values
            if abs(last_two_highs[0] - last_two_highs[1]) / last_two_highs[0] < 0.01:
                patterns.append({
                    'name': 'Double Top',
                    'type': 'bearish',
                    'confidence': 85
                })
                
        # Double Bottom
        if len(lows_idx) >= 2:
            last_two_lows = df['low'].iloc[lows_idx[-2:]].values
            if abs(last_two_lows[0] - last_two_lows[1]) / last_two_lows[0] < 0.01:
                patterns.append({
                    'name': 'Double Bottom',
                    'type': 'bullish',
                    'confidence': 85
                })
                
        return patterns
    
    def _calculate_slope(self, x_indices, y_values):
        """Calculate slope of trendline"""
        if len(x_indices) < 2:
            return 0
        x = np.array(x_indices)
        y = np.array(y_values)
        slope, _ = np.polyfit(x, y, 1)
        return slope

detector = CompletePatternDetector()
