"""
Ensemble Detector
Combines multiple pattern detectors with voting system
"""

import numpy as np
from typing import List, Dict
from .harmonics import HarmonicDetector
from .chart_patterns import ChartPatternDetector
from .breakouts import BreakoutDetector


class EnsembleDetector:
    """
    Ensemble pattern detector that combines multiple detection methods
    Uses weighted voting to generate high-confidence signals
    """
    
    def __init__(self):
        self.harmonic_detector = HarmonicDetector()
        self.chart_detector = ChartPatternDetector()
        self.breakout_detector = BreakoutDetector()
        
        # Weights for each detector
        self.weights = {
            'harmonic': 0.4,
            'chart': 0.3,
            'breakout': 0.3
        }
    
    def detect(self, candles: List[Dict], min_confidence: float = 75) -> Dict:
        """
        Detect patterns using ensemble method
        
        Returns:
            Dict with ensemble_signal, confidence, and individual detector results
        """
        if len(candles) < 50:
            return {
                'ensemble_signal': 'NEUTRAL',
                'ensemble_confidence': 0,
                'harmonic_patterns': [],
                'chart_patterns': [],
                'breakouts': []
            }
        
        # Get detections from each detector
        harmonic_patterns = self.harmonic_detector.detect(candles, min_confidence=70)
        chart_patterns = self.chart_detector.detect(candles, min_confidence=70)
        breakouts = self.breakout_detector.detect(candles, min_confidence=70)
        
        # Calculate weighted votes
        bullish_score = 0
        bearish_score = 0
        
        # Harmonic patterns
        for pattern in harmonic_patterns:
            weight = self.weights['harmonic'] * (pattern.confidence / 100)
            if pattern.type == 'bullish':
                bullish_score += weight
            else:
                bearish_score += weight
        
        # Chart patterns
        for pattern in chart_patterns:
            weight = self.weights['chart'] * (pattern.confidence / 100)
            if pattern.type == 'bullish':
                bullish_score += weight
            else:
                bearish_score += weight
        
        # Breakouts
        for breakout in breakouts:
            weight = self.weights['breakout'] * (breakout.confidence / 100)
            if breakout.direction == 'bullish':
                bullish_score += weight
            else:
                bearish_score += weight
        
        # Determine ensemble signal
        total_score = bullish_score + bearish_score
        
        if total_score == 0:
            ensemble_signal = 'NEUTRAL'
            ensemble_confidence = 0
        elif bullish_score > bearish_score:
            ensemble_signal = 'BUY'
            ensemble_confidence = min(100, (bullish_score / total_score) * 100)
        else:
            ensemble_signal = 'SELL'
            ensemble_confidence = min(100, (bearish_score / total_score) * 100)
        
        # Require minimum agreement
        if ensemble_confidence < min_confidence:
            ensemble_signal = 'NEUTRAL'
        
        return {
            'ensemble_signal': ensemble_signal,
            'ensemble_confidence': ensemble_confidence,
            'bullish_score': bullish_score,
            'bearish_score': bearish_score,
            'harmonic_patterns': [self.harmonic_detector.to_dict(p) for p in harmonic_patterns],
            'chart_patterns': [self.chart_detector.to_dict(p) for p in chart_patterns],
            'breakouts': [self.breakout_detector.to_dict(b) for b in breakouts]
        }
