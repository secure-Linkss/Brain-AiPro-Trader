"""
ADVANCED Harmonic Pattern Detector
Implements 9 major harmonic patterns with Fibonacci validation
"""

import numpy as np
from typing import List, Dict, Optional, Tuple
from dataclasses import dataclass


@dataclass
class HarmonicPattern:
    """Harmonic pattern data structure"""
    name: str
    type: str  # 'bullish' or 'bearish'
    points: Dict[str, Dict]  # X, A, B, C, D points
    ratios: Dict[str, float]  # Fibonacci ratios
    confidence: float
    entry: float
    stop_loss: float
    targets: List[float]


class HarmonicDetector:
    """
    Advanced Harmonic Pattern Detector
    Detects: Gartley, Butterfly, Bat, Crab, Cypher, Shark, 5-0, AB=CD, Three Drives
    """
    
    def __init__(self, tolerance: float = 0.02):
        """
        Args:
            tolerance: Fibonacci ratio tolerance (default 2%)
        """
        self.tolerance = tolerance
        
        # Define Fibonacci ratios for each pattern
        self.patterns = {
            'Gartley': {
                'XA_AB': (0.618, 0.618),
                'AB_BC': (0.382, 0.886),
                'BC_CD': (1.13, 1.618),
                'XA_AD': (0.786, 0.786)
            },
            'Butterfly': {
                'XA_AB': (0.786, 0.786),
                'AB_BC': (0.382, 0.886),
                'BC_CD': (1.618, 2.618),
                'XA_AD': (1.27, 1.618)
            },
            'Bat': {
                'XA_AB': (0.382, 0.5),
                'AB_BC': (0.382, 0.886),
                'BC_CD': (1.618, 2.618),
                'XA_AD': (0.886, 0.886)
            },
            'Crab': {
                'XA_AB': (0.382, 0.618),
                'AB_BC': (0.382, 0.886),
                'BC_CD': (2.618, 3.618),
                'XA_AD': (1.618, 1.618)
            },
            'Cypher': {
                'XA_AB': (0.382, 0.618),
                'AB_BC': (1.13, 1.414),
                'BC_CD': (0.786, 0.786),
                'XC': (0.786, 0.786)  # Special: C retraces XA
            },
            'Shark': {
                'XA_AB': (0.382, 0.618),
                'AB_BC': (1.13, 1.618),
                'BC_CD': (1.618, 2.24),
                'XA_AD': (0.886, 1.13)
            },
            '5-0': {
                'XA_AB': (1.13, 1.618),
                'AB_BC': (1.618, 2.24),
                'BC_CD': (0.5, 0.5),
                'XA_AD': (0.886, 0.886)
            },
            'AB=CD': {
                'AB_CD': (1.0, 1.0),  # AB equals CD
                'BC_CD': (0.382, 0.886)
            },
            'Three_Drives': {
                'Drive1_Drive2': (0.618, 0.786),
                'Drive2_Drive3': (1.27, 1.618)
            }
        }
    
    def detect(self, candles: List[Dict], min_confidence: float = 75) -> List[HarmonicPattern]:
        """
        Detect all harmonic patterns in the given candles
        
        Args:
            candles: List of candle data
            min_confidence: Minimum confidence threshold (0-100)
        
        Returns:
            List of detected harmonic patterns
        """
        if len(candles) < 50:
            return []
        
        patterns = []
        
        # Find pivot points (swing highs and lows)
        pivots = self.find_pivots(candles)
        
        if len(pivots) < 5:
            return []
        
        # Check for each pattern type
        for i in range(len(pivots) - 4):
            # Get 5 consecutive pivots (X, A, B, C, D)
            X, A, B, C, D = pivots[i:i+5]
            
            # Check all pattern types
            for pattern_name in self.patterns.keys():
                pattern = self.validate_pattern(pattern_name, X, A, B, C, D, candles)
                
                if pattern and pattern.confidence >= min_confidence:
                    patterns.append(pattern)
        
        return patterns
    
    def find_pivots(self, candles: List[Dict], window: int = 5) -> List[Dict]:
        """
        Find pivot points (swing highs and lows)
        
        Returns:
            List of pivot points with index, price, and type
        """
        highs = np.array([c['high'] for c in candles])
        lows = np.array([c['low'] for c in candles])
        
        pivots = []
        
        for i in range(window, len(candles) - window):
            # Check for swing high
            if highs[i] == np.max(highs[i-window:i+window+1]):
                pivots.append({
                    'index': i,
                    'price': highs[i],
                    'type': 'high',
                    'timestamp': candles[i].get('timestamp', i)
                })
            
            # Check for swing low
            elif lows[i] == np.min(lows[i-window:i+window+1]):
                pivots.append({
                    'index': i,
                    'price': lows[i],
                    'type': 'low',
                    'timestamp': candles[i].get('timestamp', i)
                })
        
        return pivots
    
    def validate_pattern(self, pattern_name: str, X: Dict, A: Dict, B: Dict, C: Dict, D: Dict, candles: List[Dict]) -> Optional[HarmonicPattern]:
        """
        Validate if the 5 points form a valid harmonic pattern
        
        Returns:
            HarmonicPattern if valid, None otherwise
        """
        # Check if points alternate between highs and lows
        if not self.validate_structure(X, A, B, C, D):
            return None
        
        # Calculate Fibonacci ratios
        XA = abs(A['price'] - X['price'])
        AB = abs(B['price'] - A['price'])
        BC = abs(C['price'] - B['price'])
        CD = abs(D['price'] - C['price'])
        AD = abs(D['price'] - A['price'])
        XD = abs(D['price'] - X['price'])
        
        # Get pattern requirements
        requirements = self.patterns[pattern_name]
        
        # Validate ratios
        confidence_scores = []
        
        for ratio_name, (min_ratio, max_ratio) in requirements.items():
            if ratio_name == 'XA_AB':
                actual_ratio = AB / XA if XA != 0 else 0
            elif ratio_name == 'AB_BC':
                actual_ratio = BC / AB if AB != 0 else 0
            elif ratio_name == 'BC_CD':
                actual_ratio = CD / BC if BC != 0 else 0
            elif ratio_name == 'XA_AD':
                actual_ratio = AD / XA if XA != 0 else 0
            elif ratio_name == 'AB_CD':
                actual_ratio = CD / AB if AB != 0 else 0
            elif ratio_name == 'XC':
                XC = abs(C['price'] - X['price'])
                actual_ratio = XC / XA if XA != 0 else 0
            else:
                continue
            
            # Check if ratio is within tolerance
            if min_ratio * (1 - self.tolerance) <= actual_ratio <= max_ratio * (1 + self.tolerance):
                # Calculate confidence based on how close to ideal ratio
                ideal_ratio = (min_ratio + max_ratio) / 2
                deviation = abs(actual_ratio - ideal_ratio) / ideal_ratio
                confidence = max(0, 100 * (1 - deviation / self.tolerance))
                confidence_scores.append(confidence)
            else:
                return None  # Pattern invalid
        
        # Calculate overall confidence
        overall_confidence = np.mean(confidence_scores) if confidence_scores else 0
        
        if overall_confidence < 50:
            return None
        
        # --- GURU UPGRADE: POTENTIAL REVERSAL ZONE (PRZ) ---
        # Instead of trusting one point 'D', we calculate the cluster of confluence
        # 1. Primary Retracement (XA)
        # 2. Secondary Projection (BC)
        # 3. AB=CD Completion
        
        prz_levels = []
        
        # 1. XA Retracement Target
        xa_target = 0
        if pattern_name == 'Gartley': xa_target = 0.786
        elif pattern_name == 'Bat': xa_target = 0.886
        elif pattern_name == 'Butterfly': xa_target = 1.27
        elif pattern_name == 'Crab': xa_target = 1.618
        
        if D['type'] == 'low': # Bullish Pattern
            prz_levels.append(X['price'] + (A['price'] - X['price']) * (1 - xa_target) if xa_target > 0 else D['price']) # Approx
            # Actually X to A is down for bearish, up for bullish.
            # Simplified: Just project from X.
            # Bullish: X is Low. D is Low. D is roughly X + (XA * ratio)? No.
            # Bullish: X=Low, A=High. XA is Range.
            # D = A - (XA * ratio)? No, D is Retracement of XA leg relative to X?
            # Standard: D is at Fib Level relative to XA range.
            # Retracement: D = A - (XA_range * Ratio) (If Bullish Pattern? No, Bullish ends Low)
            # Bullish: X(Low)->A(High). D is Low. D = A - (A-X)*Ratio. Correct.
            pass
        
        # Recalculate precise PRZ Levels
        xa_range = abs(A['price'] - X['price'])
        bc_range = abs(C['price'] - B['price'])
        ab_range = abs(B['price'] - A['price'])
        
        # Level 1: XA Retracement/Extension
        lvl_xa = 0
        if D['type'] == 'low': # Bullish (Ends Low)
             req_ratio = requirements.get('XA_AD', (0,0))
             avg_ratio = (req_ratio[0] + req_ratio[1]) / 2
             lvl_xa = A['price'] - (xa_range * avg_ratio) # From A down
        else: # Bearish (Ends High)
             req_ratio = requirements.get('XA_AD', (0,0))
             avg_ratio = (req_ratio[0] + req_ratio[1]) / 2
             lvl_xa = A['price'] + (xa_range * avg_ratio)
             
        # Level 2: BC Projection
        lvl_bc = 0
        if D['type'] == 'low':
             req_ratio = requirements.get('BC_CD', (0,0))
             avg_ratio = (req_ratio[0] + req_ratio[1]) / 2
             lvl_bc = C['price'] - (bc_range * avg_ratio)
        else:
             req_ratio = requirements.get('BC_CD', (0,0))
             avg_ratio = (req_ratio[0] + req_ratio[1]) / 2
             lvl_bc = C['price'] + (bc_range * avg_ratio)
             
        # Level 3: AB=CD
        lvl_abcd = 0
        if D['type'] == 'low':
             lvl_abcd = C['price'] - ab_range
        else:
             lvl_abcd = C['price'] + ab_range
             
        prz_levels = [lvl_xa, lvl_bc, lvl_abcd]
        prz_levels = [l for l in prz_levels if l != 0]
        
        if not prz_levels:
             prz_min, prz_max = D['price'] * 0.999, D['price'] * 1.001
        else:
             prz_min = min(prz_levels)
             prz_max = max(prz_levels)
             
        # Check tightness of PRZ (Guru Validation)
        prz_width_pct = (prz_max - prz_min) / prz_min
        if prz_width_pct > 0.015: # If PRZ is wider than 1.5%, it's too loose
             return None
             
        # Check if Price actually visited the PRZ
        # D['price'] is the pivot. It should be INSIDE or very close to PRZ.
        if D['price'] < prz_min * 0.99 or D['price'] > prz_max * 1.01:
             # Allowed slightly outside for "stop run" (wick)
             pass 
        
        # Determine pattern type (bullish or bearish)
        pattern_type = 'bullish' if D['type'] == 'low' else 'bearish'
        
        # Calculate entry, stop loss, and targets
        entry = (prz_min + prz_max) / 2 # Entry at center of PRZ
        
        if pattern_type == 'bullish':
            stop_loss = prz_min - (XA * 0.15)  # Stop below PRZ
            targets = [
                entry + (CD * 0.382),  # Target 1
                entry + (CD * 0.618),  # Target 2
                entry + (CD * 1.0)     # Target 3
            ]
        else:
            stop_loss = prz_max + (XA * 0.15)  # Stop above PRZ
            targets = [
                entry - (CD * 0.382),
                entry - (CD * 0.618),
                entry - (CD * 1.0)
            ]
        
        return HarmonicPattern(
            name=pattern_name,
            type=pattern_type,
            points={'X': X, 'A': A, 'B': B, 'C': C, 'D': D},
            ratios={
                'XA_AB': AB / XA if XA != 0 else 0,
                'AB_BC': BC / AB if AB != 0 else 0,
                'BC_CD': CD / BC if BC != 0 else 0,
                'XA_AD': AD / XA if XA != 0 else 0,
                'PRZ_Width': prz_width_pct # Added metric
            },
            confidence=overall_confidence, # Could boost this if PRZ is tight
            entry=entry,
            stop_loss=stop_loss,
            targets=targets
        )
    
    def validate_structure(self, X: Dict, A: Dict, B: Dict, C: Dict, D: Dict) -> bool:
        """
        Validate that points alternate between highs and lows
        """
        # For bullish pattern: X(low), A(high), B(low), C(high), D(low)
        # For bearish pattern: X(high), A(low), B(high), C(low), D(high)
        
        if X['type'] == 'low':
            return (A['type'] == 'high' and B['type'] == 'low' and 
                    C['type'] == 'high' and D['type'] == 'low')
        else:
            return (A['type'] == 'low' and B['type'] == 'high' and 
                    C['type'] == 'low' and D['type'] == 'high')
    
    def to_dict(self, pattern: HarmonicPattern) -> Dict:
        """Convert HarmonicPattern to dictionary for JSON serialization"""
        return {
            'name': pattern.name,
            'type': pattern.type,
            'points': pattern.points,
            'ratios': pattern.ratios,
            'confidence': pattern.confidence,
            'entry': pattern.entry,
            'stop_loss': pattern.stop_loss,
            'targets': pattern.targets
        }
