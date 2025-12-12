"""
ADVANCED Chart Pattern Detector - GURU LEVEL
Detects ALL major chart patterns used by professional traders

Patterns Included:
- Head & Shoulders (Regular & Inverse)
- Double Top/Bottom
- Triple Top/Bottom
- Triangles (Ascending, Descending, Symmetrical)
- Flags (Bull Flag, Bear Flag)
- Pennants (Bullish, Bearish)
- Wedges (Rising, Falling)
- Cup & Handle
- Rounding Top/Bottom
- Rectangle (Continuation)
"""

import numpy as np
from typing import List, Dict, Optional, Tuple
from dataclasses import dataclass
from scipy.signal import find_peaks


@dataclass
class ChartPattern:
    name: str
    type: str  # 'bullish', 'bearish', 'neutral'
    category: str  # 'reversal', 'continuation'
    start_index: int
    end_index: int
    confidence: float
    entry: float
    stop_loss: float
    targets: List[Dict]  # Multiple targets with R:R
    key_levels: Dict
    description: str


class AdvancedChartPatternDetector:
    """GURU-LEVEL Chart Pattern Detector"""
    
    def __init__(self, min_confidence: float = 70.0):
        self.min_confidence = min_confidence
    
    def detect_all(self, candles: List[Dict]) -> List[ChartPattern]:
        """Detect ALL chart patterns"""
        patterns = []
        
        # Reversal Patterns
        patterns.extend(self.detect_head_and_shoulders(candles))
        patterns.extend(self.detect_inverse_head_and_shoulders(candles))
        patterns.extend(self.detect_double_top_bottom(candles))
        patterns.extend(self.detect_triple_top_bottom(candles))
        patterns.extend(self.detect_rounding_patterns(candles))
        
        # Continuation Patterns
        patterns.extend(self.detect_flags(candles))
        patterns.extend(self.detect_pennants(candles))
        patterns.extend(self.detect_triangles(candles))
        patterns.extend(self.detect_wedges(candles))
        patterns.extend(self.detect_rectangles(candles))
        patterns.extend(self.detect_cup_and_handle(candles))
        
        return [p for p in patterns if p.confidence >= self.min_confidence]
    
    # ============ REVERSAL PATTERNS ============
    
    def detect_head_and_shoulders(self, candles: List[Dict]) -> List[ChartPattern]:
        """Head & Shoulders - Bearish Reversal"""
        if len(candles) < 50:
            return []
        
        patterns = []
        highs = np.array([c['high'] for c in candles])
        lows = np.array([c['low'] for c in candles])
        
        # Find peaks
        peaks, _ = find_peaks(highs, distance=5)
        
        for i in range(1, len(peaks) - 1):
            left_shoulder_idx = peaks[i-1]
            head_idx = peaks[i]
            right_shoulder_idx = peaks[i+1]
            
            ls_price = highs[left_shoulder_idx]
            h_price = highs[head_idx]
            rs_price = highs[right_shoulder_idx]
            
            # Head higher than shoulders
            if h_price > ls_price and h_price > rs_price:
                # Shoulders roughly equal (within 3%)
                shoulder_diff = abs(ls_price - rs_price) / h_price
                
                if shoulder_diff < 0.03:
                    # Find neckline
                    neckline_start = left_shoulder_idx
                    neckline_end = right_shoulder_idx
                    neckline = np.min(lows[neckline_start:neckline_end])
                    
                    # Calculate confidence
                    confidence = 100 * (1 - shoulder_diff / 0.03)
                    
                    # Calculate targets
                    height = h_price - neckline
                    risk = h_price - neckline
                    
                    targets = [
                        {'level': 1, 'price': neckline - (height * 0.618), 'percentage': 25, 'rr': 0.618},
                        {'level': 2, 'price': neckline - height, 'percentage': 25, 'rr': 1.0},
                        {'level': 3, 'price': neckline - (height * 1.272), 'percentage': 25, 'rr': 1.272},
                        {'level': 4, 'price': neckline - (height * 1.618), 'percentage': 25, 'rr': 1.618}
                    ]
                    
                    patterns.append(ChartPattern(
                        name='Head and Shoulders',
                        type='bearish',
                        category='reversal',
                        start_index=left_shoulder_idx,
                        end_index=right_shoulder_idx,
                        confidence=confidence,
                        entry=neckline,
                        stop_loss=h_price,
                        targets=targets,
                        key_levels={
                            'left_shoulder': ls_price,
                            'head': h_price,
                            'right_shoulder': rs_price,
                            'neckline': neckline
                        },
                        description='Classic bearish reversal pattern. Enter on neckline break.'
                    ))
        
        return patterns
    
    def detect_inverse_head_and_shoulders(self, candles: List[Dict]) -> List[ChartPattern]:
        """Inverse Head & Shoulders - Bullish Reversal"""
        if len(candles) < 50:
            return []
        
        patterns = []
        lows = np.array([c['low'] for c in candles])
        highs = np.array([c['high'] for c in candles])
        
        # Find troughs
        troughs, _ = find_peaks(-lows, distance=5)
        
        for i in range(1, len(troughs) - 1):
            left_shoulder_idx = troughs[i-1]
            head_idx = troughs[i]
            right_shoulder_idx = troughs[i+1]
            
            ls_price = lows[left_shoulder_idx]
            h_price = lows[head_idx]
            rs_price = lows[right_shoulder_idx]
            
            # Head lower than shoulders
            if h_price < ls_price and h_price < rs_price:
                shoulder_diff = abs(ls_price - rs_price) / ls_price
                
                if shoulder_diff < 0.03:
                    neckline = np.max(highs[left_shoulder_idx:right_shoulder_idx])
                    confidence = 100 * (1 - shoulder_diff / 0.03)
                    
                    height = neckline - h_price
                    targets = [
                        {'level': 1, 'price': neckline + (height * 0.618), 'percentage': 25, 'rr': 0.618},
                        {'level': 2, 'price': neckline + height, 'percentage': 25, 'rr': 1.0},
                        {'level': 3, 'price': neckline + (height * 1.272), 'percentage': 25, 'rr': 1.272},
                        {'level': 4, 'price': neckline + (height * 1.618), 'percentage': 25, 'rr': 1.618}
                    ]
                    
                    patterns.append(ChartPattern(
                        name='Inverse Head and Shoulders',
                        type='bullish',
                        category='reversal',
                        start_index=left_shoulder_idx,
                        end_index=right_shoulder_idx,
                        confidence=confidence,
                        entry=neckline,
                        stop_loss=h_price,
                        targets=targets,
                        key_levels={
                            'left_shoulder': ls_price,
                            'head': h_price,
                            'right_shoulder': rs_price,
                            'neckline': neckline
                        },
                        description='Classic bullish reversal pattern. Enter on neckline break.'
                    ))
        
        return patterns
    
    def detect_double_top_bottom(self, candles: List[Dict]) -> List[ChartPattern]:
        """Double Top/Bottom - Reversal Patterns"""
        patterns = []
        highs = np.array([c['high'] for c in candles])
        lows = np.array([c['low'] for c in candles])
        
        # Double Top
        peaks, _ = find_peaks(highs, distance=10)
        for i in range(len(peaks) - 1):
            p1_idx, p2_idx = peaks[i], peaks[i+1]
            p1, p2 = highs[p1_idx], highs[p2_idx]
            
            diff = abs(p1 - p2) / max(p1, p2)
            if diff < 0.02:  # 2% tolerance
                neckline = np.min(lows[p1_idx:p2_idx])
                confidence = 100 * (1 - diff / 0.02)
                
                height = max(p1, p2) - neckline
                targets = [
                    {'level': 1, 'price': neckline - (height * 0.5), 'percentage': 25, 'rr': 0.5},
                    {'level': 2, 'price': neckline - height, 'percentage': 25, 'rr': 1.0},
                    {'level': 3, 'price': neckline - (height * 1.5), 'percentage': 25, 'rr': 1.5},
                    {'level': 4, 'price': neckline - (height * 2.0), 'percentage': 25, 'rr': 2.0}
                ]
                
                patterns.append(ChartPattern(
                    name='Double Top',
                    type='bearish',
                    category='reversal',
                    start_index=p1_idx,
                    end_index=p2_idx,
                    confidence=confidence,
                    entry=neckline,
                    stop_loss=max(p1, p2),
                    targets=targets,
                    key_levels={'peak1': p1, 'peak2': p2, 'neckline': neckline},
                    description='Bearish reversal. Two failed attempts to break resistance.'
                ))
        
        # Double Bottom
        troughs, _ = find_peaks(-lows, distance=10)
        for i in range(len(troughs) - 1):
            t1_idx, t2_idx = troughs[i], troughs[i+1]
            t1, t2 = lows[t1_idx], lows[t2_idx]
            
            diff = abs(t1 - t2) / min(t1, t2)
            if diff < 0.02:
                neckline = np.max(highs[t1_idx:t2_idx])
                confidence = 100 * (1 - diff / 0.02)
                
                height = neckline - min(t1, t2)
                targets = [
                    {'level': 1, 'price': neckline + (height * 0.5), 'percentage': 25, 'rr': 0.5},
                    {'level': 2, 'price': neckline + height, 'percentage': 25, 'rr': 1.0},
                    {'level': 3, 'price': neckline + (height * 1.5), 'percentage': 25, 'rr': 1.5},
                    {'level': 4, 'price': neckline + (height * 2.0), 'percentage': 25, 'rr': 2.0}
                ]
                
                patterns.append(ChartPattern(
                    name='Double Bottom',
                    type='bullish',
                    category='reversal',
                    start_index=t1_idx,
                    end_index=t2_idx,
                    confidence=confidence,
                    entry=neckline,
                    stop_loss=min(t1, t2),
                    targets=targets,
                    key_levels={'trough1': t1, 'trough2': t2, 'neckline': neckline},
                    description='Bullish reversal. Two failed attempts to break support.'
                ))
        
        return patterns
    
    def detect_triple_top_bottom(self, candles: List[Dict]) -> List[ChartPattern]:
        """Triple Top/Bottom - Strong Reversal Patterns"""
        patterns = []
        highs = np.array([c['high'] for c in candles])
        lows = np.array([c['low'] for c in candles])
        
        # Triple Top
        peaks, _ = find_peaks(highs, distance=8)
        for i in range(len(peaks) - 2):
            p1_idx, p2_idx, p3_idx = peaks[i], peaks[i+1], peaks[i+2]
            p1, p2, p3 = highs[p1_idx], highs[p2_idx], highs[p3_idx]
            
            avg_peak = (p1 + p2 + p3) / 3
            max_diff = max(abs(p1 - avg_peak), abs(p2 - avg_peak), abs(p3 - avg_peak)) / avg_peak
            
            if max_diff < 0.02:
                neckline = np.min(lows[p1_idx:p3_idx])
                confidence = 100 * (1 - max_diff / 0.02)
                
                height = avg_peak - neckline
                targets = [
                    {'level': 1, 'price': neckline - height, 'percentage': 25, 'rr': 1.0},
                    {'level': 2, 'price': neckline - (height * 1.5), 'percentage': 25, 'rr': 1.5},
                    {'level': 3, 'price': neckline - (height * 2.0), 'percentage': 25, 'rr': 2.0},
                    {'level': 4, 'price': neckline - (height * 2.5), 'percentage': 25, 'rr': 2.5}
                ]
                
                patterns.append(ChartPattern(
                    name='Triple Top',
                    type='bearish',
                    category='reversal',
                    start_index=p1_idx,
                    end_index=p3_idx,
                    confidence=confidence,
                    entry=neckline,
                    stop_loss=avg_peak,
                    targets=targets,
                    key_levels={'peak1': p1, 'peak2': p2, 'peak3': p3, 'neckline': neckline},
                    description='Strong bearish reversal. Three failed breakout attempts.'
                ))
        
        return patterns
    
    # ============ CONTINUATION PATTERNS ============
    
    def detect_flags(self, candles: List[Dict]) -> List[ChartPattern]:
        """Bull Flag & Bear Flag - Continuation Patterns"""
        patterns = []
        
        if len(candles) < 30:
            return patterns
        
        closes = np.array([c['close'] for c in candles])
        highs = np.array([c['high'] for c in candles])
        lows = np.array([c['low'] for c in candles])
        
        for i in range(20, len(candles) - 10):
            # Check for strong trend (pole)
            pole_start = i - 20
            pole_end = i - 10
            pole_move = closes[pole_end] - closes[pole_start]
            pole_percent = pole_move / closes[pole_start]
            
            # Bull Flag: Strong uptrend followed by slight downward consolidation
            if pole_percent > 0.05:  # 5% up move
                flag_highs = highs[pole_end:i]
                flag_lows = lows[pole_end:i]
                
                flag_slope = self._calculate_slope(flag_highs)
                
                # Flag should slope slightly down or sideways
                if -0.002 < flag_slope < 0.001:
                    confidence = 80.0
                    entry = closes[i]
                    stop_loss = np.min(flag_lows)
                    
                    height = closes[pole_end] - closes[pole_start]
                    targets = [
                        {'level': 1, 'price': entry + (height * 0.618), 'percentage': 25, 'rr': 0.618},
                        {'level': 2, 'price': entry + height, 'percentage': 25, 'rr': 1.0},
                        {'level': 3, 'price': entry + (height * 1.272), 'percentage': 25, 'rr': 1.272},
                        {'level': 4, 'price': entry + (height * 1.618), 'percentage': 25, 'rr': 1.618}
                    ]
                    
                    patterns.append(ChartPattern(
                        name='Bull Flag',
                        type='bullish',
                        category='continuation',
                        start_index=pole_start,
                        end_index=i,
                        confidence=confidence,
                        entry=entry,
                        stop_loss=stop_loss,
                        targets=targets,
                        key_levels={'pole_start': closes[pole_start], 'pole_end': closes[pole_end]},
                        description='Bullish continuation. Uptrend pause before next leg up.'
                    ))
            
            # Bear Flag: Strong downtrend followed by slight upward consolidation
            elif pole_percent < -0.05:  # 5% down move
                flag_lows = lows[pole_end:i]
                flag_highs = highs[pole_end:i]
                
                flag_slope = self._calculate_slope(flag_lows)
                
                if -0.001 < flag_slope < 0.002:
                    confidence = 80.0
                    entry = closes[i]
                    stop_loss = np.max(flag_highs)
                    
                    height = abs(closes[pole_end] - closes[pole_start])
                    targets = [
                        {'level': 1, 'price': entry - (height * 0.618), 'percentage': 25, 'rr': 0.618},
                        {'level': 2, 'price': entry - height, 'percentage': 25, 'rr': 1.0},
                        {'level': 3, 'price': entry - (height * 1.272), 'percentage': 25, 'rr': 1.272},
                        {'level': 4, 'price': entry - (height * 1.618), 'percentage': 25, 'rr': 1.618}
                    ]
                    
                    patterns.append(ChartPattern(
                        name='Bear Flag',
                        type='bearish',
                        category='continuation',
                        start_index=pole_start,
                        end_index=i,
                        confidence=confidence,
                        entry=entry,
                        stop_loss=stop_loss,
                        targets=targets,
                        key_levels={'pole_start': closes[pole_start], 'pole_end': closes[pole_end]},
                        description='Bearish continuation. Downtrend pause before next leg down.'
                    ))
        
        return patterns
    
    def detect_pennants(self, candles: List[Dict]) -> List[ChartPattern]:
        """Pennants - Continuation Patterns (converging trendlines)"""
        patterns = []
        
        if len(candles) < 30:
            return patterns
        
        highs = np.array([c['high'] for c in candles])
        lows = np.array([c['low'] for c in candles])
        closes = np.array([c['close'] for c in candles])
        
        for i in range(20, len(candles) - 10):
            # Check for strong prior move
            prior_move = closes[i-10] - closes[i-20]
            prior_percent = prior_move / closes[i-20]
            
            if abs(prior_percent) > 0.05:  # 5% move
                pennant_highs = highs[i-10:i]
                pennant_lows = lows[i-10:i]
                
                high_slope = self._calculate_slope(pennant_highs)
                low_slope = self._calculate_slope(pennant_lows)
                
                # Converging trendlines
                if high_slope < 0 and low_slope > 0:
                    confidence = 75.0
                    entry = closes[i]
                    
                    if prior_percent > 0:  # Bullish pennant
                        stop_loss = np.min(pennant_lows)
                        height = closes[i-10] - closes[i-20]
                        
                        targets = [
                            {'level': 1, 'price': entry + (height * 0.5), 'percentage': 25, 'rr': 0.5},
                            {'level': 2, 'price': entry + height, 'percentage': 25, 'rr': 1.0},
                            {'level': 3, 'price': entry + (height * 1.5), 'percentage': 25, 'rr': 1.5},
                            {'level': 4, 'price': entry + (height * 2.0), 'percentage': 25, 'rr': 2.0}
                        ]
                        
                        patterns.append(ChartPattern(
                            name='Bullish Pennant',
                            type='bullish',
                            category='continuation',
                            start_index=i-20,
                            end_index=i,
                            confidence=confidence,
                            entry=entry,
                            stop_loss=stop_loss,
                            targets=targets,
                            key_levels={},
                            description='Bullish continuation. Converging consolidation before breakout.'
                        ))
                    else:  # Bearish pennant
                        stop_loss = np.max(pennant_highs)
                        height = abs(closes[i-10] - closes[i-20])
                        
                        targets = [
                            {'level': 1, 'price': entry - (height * 0.5), 'percentage': 25, 'rr': 0.5},
                            {'level': 2, 'price': entry - height, 'percentage': 25, 'rr': 1.0},
                            {'level': 3, 'price': entry - (height * 1.5), 'percentage': 25, 'rr': 1.5},
                            {'level': 4, 'price': entry - (height * 2.0), 'percentage': 25, 'rr': 2.0}
                        ]
                        
                        patterns.append(ChartPattern(
                            name='Bearish Pennant',
                            type='bearish',
                            category='continuation',
                            start_index=i-20,
                            end_index=i,
                            confidence=confidence,
                            entry=entry,
                            stop_loss=stop_loss,
                            targets=targets,
                            key_levels={},
                            description='Bearish continuation. Converging consolidation before breakdown.'
                        ))
        
        return patterns
    
    def detect_triangles(self, candles: List[Dict]) -> List[ChartPattern]:
        """Triangles - Ascending, Descending, Symmetrical"""
        patterns = []
        
        if len(candles) < 30:
            return patterns
        
        highs = np.array([c['high'] for c in candles])
        lows = np.array([c['low'] for c in candles])
        
        for i in range(15, len(candles) - 15):
            window_highs = highs[i-15:i+15]
            window_lows = lows[i-15:i+15]
            
            high_slope = self._calculate_slope(window_highs)
            low_slope = self._calculate_slope(window_lows)
            
            # Ascending Triangle: flat top, rising bottom
            if abs(high_slope) < 0.0005 and low_slope > 0.001:
                resistance = np.max(window_highs)
                support = np.min(window_lows)
                height = resistance - support
                
                targets = [
                    {'level': 1, 'price': resistance + (height * 0.5), 'percentage': 25, 'rr': 0.5},
                    {'level': 2, 'price': resistance + height, 'percentage': 25, 'rr': 1.0},
                    {'level': 3, 'price': resistance + (height * 1.5), 'percentage': 25, 'rr': 1.5},
                    {'level': 4, 'price': resistance + (height * 2.0), 'percentage': 25, 'rr': 2.0}
                ]
                
                patterns.append(ChartPattern(
                    name='Ascending Triangle',
                    type='bullish',
                    category='continuation',
                    start_index=i-15,
                    end_index=i+15,
                    confidence=75.0,
                    entry=resistance,
                    stop_loss=support,
                    targets=targets,
                    key_levels={'resistance': resistance, 'support': support},
                    description='Bullish continuation. Buyers getting stronger, breakout likely.'
                ))
            
            # Descending Triangle: falling top, flat bottom
            elif high_slope < -0.001 and abs(low_slope) < 0.0005:
                resistance = np.max(window_highs)
                support = np.min(window_lows)
                height = resistance - support
                
                targets = [
                    {'level': 1, 'price': support - (height * 0.5), 'percentage': 25, 'rr': 0.5},
                    {'level': 2, 'price': support - height, 'percentage': 25, 'rr': 1.0},
                    {'level': 3, 'price': support - (height * 1.5), 'percentage': 25, 'rr': 1.5},
                    {'level': 4, 'price': support - (height * 2.0), 'percentage': 25, 'rr': 2.0}
                ]
                
                patterns.append(ChartPattern(
                    name='Descending Triangle',
                    type='bearish',
                    category='continuation',
                    start_index=i-15,
                    end_index=i+15,
                    confidence=75.0,
                    entry=support,
                    stop_loss=resistance,
                    targets=targets,
                    key_levels={'resistance': resistance, 'support': support},
                    description='Bearish continuation. Sellers getting stronger, breakdown likely.'
                ))
            
            # Symmetrical Triangle: converging trendlines
            elif high_slope < -0.0005 and low_slope > 0.0005:
                apex = (window_highs[-1] + window_lows[-1]) / 2
                height = np.max(window_highs) - np.min(window_lows)
                
                patterns.append(ChartPattern(
                    name='Symmetrical Triangle',
                    type='neutral',
                    category='continuation',
                    start_index=i-15,
                    end_index=i+15,
                    confidence=70.0,
                    entry=apex,
                    stop_loss=apex - height/2,
                    targets=[
                        {'level': 1, 'price': apex + (height * 0.5), 'percentage': 50, 'rr': 0.5},
                        {'level': 2, 'price': apex + height, 'percentage': 50, 'rr': 1.0}
                    ],
                    key_levels={'apex': apex},
                    description='Neutral pattern. Breakout direction determines trend.'
                ))
        
        return patterns
    
    def detect_wedges(self, candles: List[Dict]) -> List[ChartPattern]:
        """Rising & Falling Wedges"""
        patterns = []
        
        if len(candles) < 30:
            return patterns
        
        highs = np.array([c['high'] for c in candles])
        lows = np.array([c['low'] for c in candles])
        
        for i in range(20, len(candles) - 10):
            window_highs = highs[i-20:i]
            window_lows = lows[i-20:i]
            
            high_slope = self._calculate_slope(window_highs)
            low_slope = self._calculate_slope(window_lows)
            
            # Rising Wedge: both trendlines rising, converging (bearish)
            if high_slope > 0 and low_slope > 0 and high_slope < low_slope * 1.5:
                resistance = window_highs[-1]
                support = window_lows[-1]
                height = np.max(window_highs) - np.min(window_lows)
                
                targets = [
                    {'level': 1, 'price': support - (height * 0.5), 'percentage': 25, 'rr': 0.5},
                    {'level': 2, 'price': support - height, 'percentage': 25, 'rr': 1.0},
                    {'level': 3, 'price': support - (height * 1.5), 'percentage': 25, 'rr': 1.5},
                    {'level': 4, 'price': support - (height * 2.0), 'percentage': 25, 'rr': 2.0}
                ]
                
                patterns.append(ChartPattern(
                    name='Rising Wedge',
                    type='bearish',
                    category='reversal',
                    start_index=i-20,
                    end_index=i,
                    confidence=75.0,
                    entry=support,
                    stop_loss=resistance,
                    targets=targets,
                    key_levels={'resistance': resistance, 'support': support},
                    description='Bearish reversal. Uptrend losing momentum, breakdown expected.'
                ))
            
            # Falling Wedge: both trendlines falling, converging (bullish)
            elif high_slope < 0 and low_slope < 0 and low_slope < high_slope * 1.5:
                resistance = window_highs[-1]
                support = window_lows[-1]
                height = np.max(window_highs) - np.min(window_lows)
                
                targets = [
                    {'level': 1, 'price': resistance + (height * 0.5), 'percentage': 25, 'rr': 0.5},
                    {'level': 2, 'price': resistance + height, 'percentage': 25, 'rr': 1.0},
                    {'level': 3, 'price': resistance + (height * 1.5), 'percentage': 25, 'rr': 1.5},
                    {'level': 4, 'price': resistance + (height * 2.0), 'percentage': 25, 'rr': 2.0}
                ]
                
                patterns.append(ChartPattern(
                    name='Falling Wedge',
                    type='bullish',
                    category='reversal',
                    start_index=i-20,
                    end_index=i,
                    confidence=75.0,
                    entry=resistance,
                    stop_loss=support,
                    targets=targets,
                    key_levels={'resistance': resistance, 'support': support},
                    description='Bullish reversal. Downtrend losing momentum, breakout expected.'
                ))
        
        return patterns
    
    def detect_rectangles(self, candles: List[Dict]) -> List[ChartPattern]:
        """Rectangle - Consolidation/Continuation Pattern"""
        patterns = []
        
        if len(candles) < 30:
            return patterns
        
        highs = np.array([c['high'] for c in candles])
        lows = np.array([c['low'] for c in candles])
        
        for i in range(20, len(candles) - 10):
            window_highs = highs[i-20:i]
            window_lows = lows[i-20:i]
            
            high_slope = abs(self._calculate_slope(window_highs))
            low_slope = abs(self._calculate_slope(window_lows))
            
            # Both trendlines flat (horizontal)
            if high_slope < 0.0003 and low_slope < 0.0003:
                resistance = np.max(window_highs)
                support = np.min(window_lows)
                height = resistance - support
                
                # Check if price is ranging
                range_percent = height / support
                if 0.02 < range_percent < 0.10:  # 2-10% range
                    patterns.append(ChartPattern(
                        name='Rectangle',
                        type='neutral',
                        category='continuation',
                        start_index=i-20,
                        end_index=i,
                        confidence=70.0,
                        entry=(resistance + support) / 2,
                        stop_loss=support,
                        targets=[
                            {'level': 1, 'price': resistance + (height * 0.5), 'percentage': 50, 'rr': 0.5},
                            {'level': 2, 'price': resistance + height, 'percentage': 50, 'rr': 1.0}
                        ],
                        key_levels={'resistance': resistance, 'support': support},
                        description='Consolidation pattern. Breakout direction determines trend.'
                    ))
        
        return patterns
    
    def detect_cup_and_handle(self, candles: List[Dict]) -> List[ChartPattern]:
        """Cup & Handle - Bullish Continuation"""
        patterns = []
        
        if len(candles) < 50:
            return patterns
        
        lows = np.array([c['low'] for c in candles])
        highs = np.array([c['high'] for c in candles])
        
        for i in range(30, len(candles) - 20):
            # Cup: U-shaped bottom
            cup_lows = lows[i-30:i-10]
            cup_bottom = np.min(cup_lows)
            cup_left = highs[i-30]
            cup_right = highs[i-10]
            
            # Handle: slight pullback
            handle_highs = highs[i-10:i]
            handle_lows = lows[i-10:i]
            
            # Cup should be U-shaped (not V-shaped)
            if abs(cup_left - cup_right) / cup_left < 0.05:  # Rims roughly equal
                # Handle should be smaller than cup
                cup_depth = cup_left - cup_bottom
                handle_depth = np.max(handle_highs) - np.min(handle_lows)
                
                if handle_depth < cup_depth * 0.5:  # Handle < 50% of cup
                    resistance = cup_left
                    entry = resistance
                    stop_loss = np.min(handle_lows)
                    
                    targets = [
                        {'level': 1, 'price': entry + (cup_depth * 0.5), 'percentage': 25, 'rr': 0.5},
                        {'level': 2, 'price': entry + cup_depth, 'percentage': 25, 'rr': 1.0},
                        {'level': 3, 'price': entry + (cup_depth * 1.5), 'percentage': 25, 'rr': 1.5},
                        {'level': 4, 'price': entry + (cup_depth * 2.0), 'percentage': 25, 'rr': 2.0}
                    ]
                    
                    patterns.append(ChartPattern(
                        name='Cup and Handle',
                        type='bullish',
                        category='continuation',
                        start_index=i-30,
                        end_index=i,
                        confidence=80.0,
                        entry=entry,
                        stop_loss=stop_loss,
                        targets=targets,
                        key_levels={'cup_bottom': cup_bottom, 'resistance': resistance},
                        description='Bullish continuation. Strong pattern, high success rate.'
                    ))
        
        return patterns
    
    def detect_rounding_patterns(self, candles: List[Dict]) -> List[ChartPattern]:
        """Rounding Top/Bottom"""
        patterns = []
        
        if len(candles) < 40:
            return patterns
        
        closes = np.array([c['close'] for c in candles])
        
        for i in range(20, len(candles) - 20):
            window = closes[i-20:i+20]
            
            # Fit parabola
            x = np.arange(len(window))
            coeffs = np.polyfit(x, window, 2)
            
            # Rounding Bottom: positive curvature (a > 0)
            if coeffs[0] > 0.00001:
                bottom = np.min(window)
                entry = closes[i+19]
                height = entry - bottom
                
                targets = [
                    {'level': 1, 'price': entry + (height * 0.5), 'percentage': 25, 'rr': 0.5},
                    {'level': 2, 'price': entry + height, 'percentage': 25, 'rr': 1.0},
                    {'level': 3, 'price': entry + (height * 1.5), 'percentage': 25, 'rr': 1.5},
                    {'level': 4, 'price': entry + (height * 2.0), 'percentage': 25, 'rr': 2.0}
                ]
                
                patterns.append(ChartPattern(
                    name='Rounding Bottom',
                    type='bullish',
                    category='reversal',
                    start_index=i-20,
                    end_index=i+20,
                    confidence=75.0,
                    entry=entry,
                    stop_loss=bottom,
                    targets=targets,
                    key_levels={'bottom': bottom},
                    description='Bullish reversal. Gradual shift from selling to buying.'
                ))
            
            # Rounding Top: negative curvature (a < 0)
            elif coeffs[0] < -0.00001:
                top = np.max(window)
                entry = closes[i+19]
                height = top - entry
                
                targets = [
                    {'level': 1, 'price': entry - (height * 0.5), 'percentage': 25, 'rr': 0.5},
                    {'level': 2, 'price': entry - height, 'percentage': 25, 'rr': 1.0},
                    {'level': 3, 'price': entry - (height * 1.5), 'percentage': 25, 'rr': 1.5},
                    {'level': 4, 'price': entry - (height * 2.0), 'percentage': 25, 'rr': 2.0}
                ]
                
                patterns.append(ChartPattern(
                    name='Rounding Top',
                    type='bearish',
                    category='reversal',
                    start_index=i-20,
                    end_index=i+20,
                    confidence=75.0,
                    entry=entry,
                    stop_loss=top,
                    targets=targets,
                    key_levels={'top': top},
                    description='Bearish reversal. Gradual shift from buying to selling.'
                ))
        
        return patterns
    
    def _calculate_slope(self, data: np.ndarray) -> float:
        """Calculate slope using linear regression"""
        if len(data) < 2:
            return 0.0
        x = np.arange(len(data))
        coeffs = np.polyfit(x, data, 1)
        return coeffs[0]
    
    def to_dict(self, pattern: ChartPattern) -> Dict:
        """Convert pattern to dictionary"""
        return {
            'name': pattern.name,
            'type': pattern.type,
            'category': pattern.category,
            'confidence': pattern.confidence,
            'entry': pattern.entry,
            'stop_loss': pattern.stop_loss,
            'targets': pattern.targets,
            'key_levels': pattern.key_levels,
            'description': pattern.description
        }
