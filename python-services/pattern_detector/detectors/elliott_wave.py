"""
Advanced Elliott Wave Detector
Implements comprehensive Elliott Wave pattern recognition
"""

import numpy as np
import pandas as pd
from typing import Dict, List, Optional, Tuple
from scipy.signal import find_peaks, argrelextrema


class ElliottWaveDetector:
    """
    Advanced Elliott Wave pattern detector
    Identifies impulse and corrective wave patterns
    """
    
    def __init__(self):
        self.name = "Elliott Wave Detector"
        self.min_wave_length = 5
        
    def analyze(self, df: pd.DataFrame) -> Optional[Dict]:
        """
        Main analysis method to detect Elliott Wave patterns
        """
        if len(df) < 50:
            return None
            
        # Find significant pivot points
        pivots = self._find_pivots(df)
        
        if len(pivots) < 5:
            return None
            
        # Detect impulse waves (5-wave pattern)
        impulse_wave = self._detect_impulse_wave(df, pivots)
        
        # Detect corrective waves (3-wave pattern)
        corrective_wave = self._detect_corrective_wave(df, pivots)
        
        if impulse_wave or corrective_wave:
            signal = self._generate_signal(df, impulse_wave, corrective_wave)
            return signal
            
        return None
    
    def _find_pivots(self, df: pd.DataFrame) -> List[Dict]:
        """
        Find significant pivot points (swing highs and lows)
        """
        prices = df['close'].values
        
        # Find local maxima and minima
        order = 5  # Number of points on each side to compare
        
        maxima_idx = argrelextrema(prices, np.greater, order=order)[0]
        minima_idx = argrelextrema(prices, np.less, order=order)[0]
        
        pivots = []
        
        # Add maxima
        for idx in maxima_idx:
            pivots.append({
                'index': idx,
                'price': prices[idx],
                'type': 'high',
                'timestamp': df.iloc[idx]['timestamp'] if 'timestamp' in df.columns else idx
            })
        
        # Add minima
        for idx in minima_idx:
            pivots.append({
                'index': idx,
                'price': prices[idx],
                'type': 'low',
                'timestamp': df.iloc[idx]['timestamp'] if 'timestamp' in df.columns else idx
            })
        
        # Sort by index
        pivots.sort(key=lambda x: x['index'])
        
        return pivots
    
    def _detect_impulse_wave(self, df: pd.DataFrame, pivots: List[Dict]) -> Optional[Dict]:
        """
        Detect 5-wave impulse pattern (1-2-3-4-5)
        
        Rules:
        - Wave 2 never retraces more than 100% of wave 1
        - Wave 3 is never the shortest
        - Wave 4 does not overlap wave 1
        """
        if len(pivots) < 6:
            return None
            
        # Try to find 5-wave pattern in recent pivots
        for i in range(len(pivots) - 5):
            wave_pivots = pivots[i:i+6]
            
            # Check if pattern alternates between highs and lows
            if not self._alternates_high_low(wave_pivots):
                continue
                
            # Extract wave measurements
            waves = self._measure_waves(wave_pivots)
            
            # Validate Elliott Wave rules (Structure, Alternation, Time)
            if (self._validate_impulse_rules(waves) and 
                self._validate_alternation(waves) and 
                self._validate_time_fibonacci(waves)):
                return {
                    'type': 'impulse',
                    'direction': 'bullish' if wave_pivots[0]['type'] == 'low' else 'bearish',
                    'waves': waves,
                    'pivots': wave_pivots,
                    'confidence': self._calculate_wave_confidence(waves, 'impulse')
                }
        
        return None
    
    def _detect_corrective_wave(self, df: pd.DataFrame, pivots: List[Dict]) -> Optional[Dict]:
        """
        Detect 3-wave corrective pattern (A-B-C)
        
        Common corrective patterns:
        - Zigzag (5-3-5)
        - Flat (3-3-5)
        - Triangle (3-3-3-3-3)
        """
        if len(pivots) < 4:
            return None
            
        # Try to find 3-wave pattern
        for i in range(len(pivots) - 3):
            wave_pivots = pivots[i:i+4]
            
            if not self._alternates_high_low(wave_pivots):
                continue
                
            waves = self._measure_waves(wave_pivots)
            
            if self._validate_corrective_rules(waves):
                return {
                    'type': 'corrective',
                    'pattern': self._identify_corrective_pattern(waves),
                    'waves': waves,
                    'pivots': wave_pivots,
                    'confidence': self._calculate_wave_confidence(waves, 'corrective')
                }
        
        return None
    
    def _alternates_high_low(self, pivots: List[Dict]) -> bool:
        """Check if pivots alternate between highs and lows"""
        for i in range(len(pivots) - 1):
            if pivots[i]['type'] == pivots[i+1]['type']:
                return False
        return True
    
    def _measure_waves(self, pivots: List[Dict]) -> List[Dict]:
        """Measure wave lengths and retracements"""
        waves = []
        
        for i in range(len(pivots) - 1):
            start = pivots[i]
            end = pivots[i+1]
            
            wave_length = abs(end['price'] - start['price'])
            wave_percent = (end['price'] - start['price']) / start['price']
            
            waves.append({
                'number': i + 1,
                'start_price': start['price'],
                'end_price': end['price'],
                'length': wave_length,
                'percent': wave_percent,
                'direction': 'up' if end['price'] > start['price'] else 'down',
                'start_index': start['index'],
                'end_index': end['index']
            })
        
        return waves
    
    def _validate_impulse_rules(self, waves: List[Dict]) -> bool:
        """
        Validate Elliott Wave impulse rules
        """
        if len(waves) < 5:
            return False
            
        # Rule 1: Wave 2 never retraces more than 100% of wave 1
        if waves[0]['direction'] == 'up':
            wave2_retracement = abs(waves[1]['length']) / waves[0]['length']
            if wave2_retracement > 1.0:
                return False
        
        # Rule 2: Wave 3 is never the shortest
        if len(waves) >= 5:
            wave_lengths = [waves[0]['length'], waves[2]['length'], waves[4]['length']]
            if waves[2]['length'] == min(wave_lengths):
                return False
        
        # Rule 3: Wave 4 does not overlap wave 1 price territory
        if len(waves) >= 4:
            if waves[0]['direction'] == 'up':
                if waves[3]['end_price'] < waves[0]['end_price']:
                    return False
            else:
                if waves[3]['end_price'] > waves[0]['end_price']:
                    return False
        
        return True

    # --- GURU UPGRADE: RULE OF ALTERNATION & TIME ---
    def _validate_alternation(self, waves: List[Dict]) -> bool:
        """
        Rule of Alternation:
        If Wave 2 is a sharp correction, Wave 4 tends to be sideways/complex (and vice-versa).
        This upgrade ensures we don't label two similar corrections as 2 and 4.
        """
        if len(waves) < 5: return True
        
        # Wave 2 Metrics
        w2_price_change = abs(waves[1]['end_price'] - waves[1]['start_price'])
        w2_time = abs(waves[1]['end_index'] - waves[1]['start_index'])
        w2_slope = w2_price_change / w2_time if w2_time > 0 else 0
        
        # Wave 4 Metrics
        w4_price_change = abs(waves[3]['end_price'] - waves[3]['start_price'])
        w4_time = abs(waves[3]['end_index'] - waves[3]['start_index'])
        w4_slope = w4_price_change / w4_time if w4_time > 0 else 0
        
        # If slopes are too similar (within 20%), it violates alternation
        # Alternation means one is typically steep (sharp) and one is flat (sideways)
        if w2_slope > 0 and w4_slope > 0:
            similarity = min(w2_slope, w4_slope) / max(w2_slope, w4_slope)
            if similarity > 0.8: # Too similar
                return False
                
        return True

    def _validate_time_fibonacci(self, waves: List[Dict]) -> bool:
        """
        Fibonacci Time Zones:
        Impulse waves often relate in time by Fib ratios (1.382, 1.618).
        """
        if len(waves) < 5: return True
        
        w1_time = waves[0]['end_index'] - waves[0]['start_index']
        w3_time = waves[2]['end_index'] - waves[2]['start_index']
        
        # Wave 3 should rarely be shorter in time than Wave 1
        if w3_time < w1_time * 0.618:
            return False
            
        return True
    
    def _validate_corrective_rules(self, waves: List[Dict]) -> bool:
        """
        Validate corrective wave patterns
        """
        if len(waves) < 3:
            return False
            
        # Basic validation: corrective waves should show retracement
        # Wave B should retrace part of wave A
        # Wave C should extend beyond wave A
        
        if len(waves) >= 3:
            wave_a = waves[0]
            wave_b = waves[1]
            wave_c = waves[2]
            
            # Wave B should retrace 38-78% of wave A
            retracement = abs(wave_b['length']) / abs(wave_a['length'])
            if not (0.38 <= retracement <= 0.78):
                return False
                
        return True
    
    def _identify_corrective_pattern(self, waves: List[Dict]) -> str:
        """
        Identify specific corrective pattern type
        """
        if len(waves) < 3:
            return 'unknown'
            
        wave_a = waves[0]
        wave_b = waves[1]
        wave_c = waves[2]
        
        retracement_b = abs(wave_b['length']) / abs(wave_a['length'])
        extension_c = abs(wave_c['length']) / abs(wave_a['length'])
        
        # Zigzag: Wave C extends beyond A, B retraces 38-78% of A
        if 0.38 <= retracement_b <= 0.78 and extension_c > 0.9:
            return 'zigzag'
        
        # Flat: Wave B retraces 90-100% of A, C approximately equal to A
        elif 0.9 <= retracement_b <= 1.1 and 0.9 <= extension_c <= 1.1:
            return 'flat'
        
        # Triangle: Converging pattern
        elif retracement_b > 0.6 and extension_c < 0.8:
            return 'triangle'
        
        return 'complex'
    
    def _calculate_wave_confidence(self, waves: List[Dict], wave_type: str) -> float:
        """
        Calculate confidence score for wave pattern
        """
        confidence = 50.0  # Base confidence
        
        if wave_type == 'impulse':
            # Check Fibonacci relationships
            if len(waves) >= 5:
                # Wave 3 often extends to 1.618 of wave 1
                wave3_to_wave1 = waves[2]['length'] / waves[0]['length']
                if 1.5 <= wave3_to_wave1 <= 1.8:
                    confidence += 20
                
                # Wave 5 often equals wave 1 or 0.618 of wave 1-3
                wave5_to_wave1 = waves[4]['length'] / waves[0]['length']
                if 0.5 <= wave5_to_wave1 <= 1.2:
                    confidence += 15
        
        elif wave_type == 'corrective':
            # Check corrective wave proportions
            if len(waves) >= 3:
                retracement = abs(waves[1]['length']) / abs(waves[0]['length'])
                # Ideal retracement is 61.8%
                if 0.55 <= retracement <= 0.68:
                    confidence += 25
        
        return min(confidence, 95.0)
    
    def _generate_signal(
        self, 
        df: pd.DataFrame, 
        impulse_wave: Optional[Dict],
        corrective_wave: Optional[Dict]
    ) -> Dict:
        """
        Generate trading signal based on wave analysis
        """
        current_price = df['close'].iloc[-1]
        
        if impulse_wave:
            # If we detected a complete 5-wave impulse, expect correction
            if len(impulse_wave['waves']) == 5:
                direction = impulse_wave['direction']
                
                if direction == 'bullish':
                    # Expect bearish correction
                    signal_type = 'SELL'
                    confidence = impulse_wave['confidence']
                    
                    # Set targets based on Fibonacci retracements
                    wave_5_end = impulse_wave['waves'][4]['end_price']
                    wave_1_start = impulse_wave['waves'][0]['start_price']
                    total_move = wave_5_end - wave_1_start
                    
                    entry_price = current_price
                    take_profit = wave_5_end - (total_move * 0.382)  # 38.2% retracement
                    stop_loss = wave_5_end + (total_move * 0.1)
                    
                else:
                    signal_type = 'BUY'
                    confidence = impulse_wave['confidence']
                    
                    wave_5_end = impulse_wave['waves'][4]['end_price']
                    wave_1_start = impulse_wave['waves'][0]['start_price']
                    total_move = wave_1_start - wave_5_end
                    
                    entry_price = current_price
                    take_profit = wave_5_end + (total_move * 0.382)
                    stop_loss = wave_5_end - (total_move * 0.1)
                
                return {
                    'signal': signal_type,
                    'strategy': self.name,
                    'confidence': confidence,
                    'entry_price': entry_price,
                    'take_profit': take_profit,
                    'stop_loss': stop_loss,
                    'reason': f"Complete {direction} impulse wave detected, expecting correction",
                    'wave_data': impulse_wave
                }
        
        if corrective_wave:
            # If we detected a corrective wave, expect new impulse
            pattern = corrective_wave['pattern']
            
            # Determine direction based on corrective pattern
            last_wave = corrective_wave['waves'][-1]
            
            if last_wave['direction'] == 'down':
                signal_type = 'BUY'
                entry_price = current_price
                take_profit = entry_price * 1.05
                stop_loss = entry_price * 0.98
            else:
                signal_type = 'SELL'
                entry_price = current_price
                take_profit = entry_price * 0.95
                stop_loss = entry_price * 1.02
            
            return {
                'signal': signal_type,
                'strategy': self.name,
                'confidence': corrective_wave['confidence'],
                'entry_price': entry_price,
                'take_profit': take_profit,
                'stop_loss': stop_loss,
                'reason': f"{pattern.capitalize()} corrective pattern complete, expecting new impulse",
                'wave_data': corrective_wave
            }
        
        return None


# Export
__all__ = ['ElliottWaveDetector']
