"""
Chart Pattern Detector
Detects classic chart patterns: Head & Shoulders, Double Top/Bottom, Triangles, etc.
"""

import numpy as np
from typing import List, Dict, Optional
from dataclasses import dataclass


@dataclass
class ChartPattern:
    name: str
    type: str
    start_index: int
    end_index: int
    confidence: float
    entry: float
    stop_loss: float
    target: float


class ChartPatternDetector:
    """Detects classic chart patterns"""
    
    def detect(self, candles: List[Dict], min_confidence: float = 70) -> List[ChartPattern]:
        """Detect all chart patterns"""
        patterns = []
        
        patterns.extend(self.detect_head_and_shoulders(candles, min_confidence))
        patterns.extend(self.detect_double_top_bottom(candles, min_confidence))
        patterns.extend(self.detect_triangles(candles, min_confidence))
        
        return patterns
    
    def detect_head_and_shoulders(self, candles: List[Dict], min_confidence: float) -> List[ChartPattern]:
        """Detect Head and Shoulders patterns"""
        if len(candles) < 50:
            return []
        
        highs = np.array([c['high'] for c in candles])
        lows = np.array([c['low'] for c in candles])
        patterns = []
        
        # Find potential patterns
        for i in range(20, len(candles) - 20):
            # Look for 3 peaks
            left_shoulder = highs[i-15:i-5]
            head = highs[i-5:i+5]
            right_shoulder = highs[i+5:i+15]
            
            if len(left_shoulder) > 0 and len(head) > 0 and len(right_shoulder) > 0:
                ls_peak = np.max(left_shoulder)
                h_peak = np.max(head)
                rs_peak = np.max(right_shoulder)
                
                # Head should be higher than shoulders
                if h_peak > ls_peak and h_peak > rs_peak:
                    # Shoulders should be roughly equal
                    shoulder_diff = abs(ls_peak - rs_peak) / h_peak
                    
                    if shoulder_diff < 0.05:  # 5% tolerance
                        confidence = max(0, 100 * (1 - shoulder_diff / 0.05))
                        
                        if confidence >= min_confidence:
                            # Find neckline
                            neckline = np.min(lows[i-15:i+15])
                            
                            patterns.append(ChartPattern(
                                name='Head and Shoulders',
                                type='bearish',
                                start_index=i-15,
                                end_index=i+15,
                                confidence=confidence,
                                entry=neckline,
                                stop_loss=h_peak,
                                target=neckline - (h_peak - neckline)
                            ))
        
        return patterns
    
    def detect_double_top_bottom(self, candles: List[Dict], min_confidence: float) -> List[ChartPattern]:
        """Detect Double Top and Double Bottom patterns"""
        patterns = []
        highs = np.array([c['high'] for c in candles])
        lows = np.array([c['low'] for c in candles])
        
        # Double Top
        for i in range(10, len(candles) - 10):
            peak1 = highs[i-10:i]
            peak2 = highs[i:i+10]
            
            if len(peak1) > 0 and len(peak2) > 0:
                p1 = np.max(peak1)
                p2 = np.max(peak2)
                
                diff = abs(p1 - p2) / max(p1, p2)
                
                if diff < 0.03:  # 3% tolerance
                    confidence = max(0, 100 * (1 - diff / 0.03))
                    
                    if confidence >= min_confidence:
                        neckline = np.min(lows[i-10:i+10])
                        
                        patterns.append(ChartPattern(
                            name='Double Top',
                            type='bearish',
                            start_index=i-10,
                            end_index=i+10,
                            confidence=confidence,
                            entry=neckline,
                            stop_loss=max(p1, p2),
                            target=neckline - (max(p1, p2) - neckline)
                        ))
        
        return patterns
    
    def detect_triangles(self, candles: List[Dict], min_confidence: float) -> List[ChartPattern]:
        """Detect Triangle patterns (Ascending, Descending, Symmetrical)"""
        patterns = []
        
        if len(candles) < 30:
            return patterns
        
        highs = np.array([c['high'] for c in candles])
        lows = np.array([c['low'] for c in candles])
        
        for i in range(15, len(candles) - 15):
            window_highs = highs[i-15:i+15]
            window_lows = lows[i-15:i+15]
            
            # Calculate trendlines
            high_slope = self.calculate_slope(window_highs)
            low_slope = self.calculate_slope(window_lows)
            
            # Ascending Triangle: flat top, rising bottom
            if abs(high_slope) < 0.001 and low_slope > 0.001:
                patterns.append(ChartPattern(
                    name='Ascending Triangle',
                    type='bullish',
                    start_index=i-15,
                    end_index=i+15,
                    confidence=75.0,
                    entry=np.max(window_highs),
                    stop_loss=np.min(window_lows),
                    target=np.max(window_highs) + (np.max(window_highs) - np.min(window_lows))
                ))
        
        return patterns
    
    def calculate_slope(self, data: np.ndarray) -> float:
        """Calculate slope of data using linear regression"""
        if len(data) < 2:
            return 0.0
        
        x = np.arange(len(data))
        coeffs = np.polyfit(x, data, 1)
        return coeffs[0]
    
    def to_dict(self, pattern: ChartPattern) -> Dict:
        """Convert to dictionary"""
        return {
            'name': pattern.name,
            'type': pattern.type,
            'start_index': pattern.start_index,
            'end_index': pattern.end_index,
            'confidence': pattern.confidence,
            'entry': pattern.entry,
            'stop_loss': pattern.stop_loss,
            'target': pattern.target
        }
