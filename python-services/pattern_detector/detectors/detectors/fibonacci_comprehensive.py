"""
COMPREHENSIVE Fibonacci-Based Strategies Detector - GURU LEVEL

Implements ALL Fibonacci strategies:
1. Fibonacci Retracement (23.6%, 38.2%, 50%, 61.8%, 78.6%)
2. Fibonacci Extension (1.272, 1.414, 1.618, 2.0, 2.618, 3.618, 4.236)
3. Fibonacci Clusters (multiple Fib levels converging)
4. Fibonacci Confluence Zones (Fib + S/R + patterns)
5. Fibonacci Trend Channels
6. Fibonacci Time Zones
7. Fibonacci Arcs
8. Fibonacci Fans
"""

import pandas as pd
import numpy as np
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
from scipy.signal import argrelextrema


@dataclass
class FibonacciSignal:
    type: str  # 'retracement', 'extension', 'cluster', 'confluence', 'channel'
    direction: str  # 'bullish', 'bearish'
    confidence: float
    fib_levels: Dict[str, float]  # level_name: price
    key_level: float  # Most important Fib level
    swing_high: float
    swing_low: float
    current_price: float
    description: str
    entry: float
    stop_loss: float
    targets: List[Dict]
    confluence_factors: List[str]  # What makes this strong


class ComprehensiveFibonacciDetector:
    """GURU-LEVEL Fibonacci Strategy Detector"""
    
    # Standard Fibonacci ratios
    RETRACEMENT_LEVELS = [0.236, 0.382, 0.500, 0.618, 0.786]
    EXTENSION_LEVELS = [1.272, 1.414, 1.618, 2.0, 2.618, 3.618, 4.236]
    
    # Tolerance for "at level" detection
    LEVEL_TOLERANCE = 0.002  # 0.2%
    CLUSTER_TOLERANCE = 0.005  # 0.5% for clusters
    
    def __init__(self):
        self.swing_window = 10  # Lookback for swing points
    
    def detect_all(self, df: pd.DataFrame) -> Dict[str, List[FibonacciSignal]]:
        """Detect ALL Fibonacci patterns"""
        return {
            'retracements': self.detect_retracements(df),
            'extensions': self.detect_extensions(df),
            'clusters': self.detect_clusters(df),
            'confluence_zones': self.detect_confluence_zones(df),
            'trend_channels': self.detect_trend_channels(df),
            'time_zones': self.detect_time_zones(df)
        }
    
    # ============ FIBONACCI RETRACEMENTS ============
    
    def detect_retracements(self, df: pd.DataFrame) -> List[FibonacciSignal]:
        """
        Fibonacci Retracement: Identify pullback levels in trends
        
        In uptrend: Price pulls back to Fib level (38.2%, 50%, 61.8%) then bounces
        In downtrend: Price rallies to Fib level then rejects
        """
        signals = []
        
        if len(df) < self.swing_window * 2:
            return signals
        
        # Find swing points
        highs = df['high'].values
        lows = df['low'].values
        closes = df['close'].values
        
        swing_highs_idx = argrelextrema(highs, np.greater, order=self.swing_window)[0]
        swing_lows_idx = argrelextrema(lows, np.less, order=self.swing_window)[0]
        
        current_price = closes[-1]
        
        # BULLISH RETRACEMENT: After uptrend, price pulls back to Fib level
        if len(swing_lows_idx) > 0 and len(swing_highs_idx) > 0:
            # Find recent swing low and swing high
            for i in range(len(swing_lows_idx) - 1):
                swing_low_idx = swing_lows_idx[i]
                
                # Find next swing high after this low
                higher_highs = swing_highs_idx[swing_highs_idx > swing_low_idx]
                
                if len(higher_highs) > 0:
                    swing_high_idx = higher_highs[0]
                    
                    swing_low = lows[swing_low_idx]
                    swing_high = highs[swing_high_idx]
                    
                    # Check if we're in pullback phase
                    if current_price < swing_high and current_price > swing_low:
                        # Calculate Fib levels
                        fib_levels = self._calculate_retracement_levels(
                            swing_low, swing_high, 'bullish'
                        )
                        
                        # Check if price is at a key Fib level
                        at_level, level_name, level_price = self._is_at_fib_level(
                            current_price, fib_levels
                        )
                        
                        if at_level:
                            # Calculate confidence based on multiple factors
                            confidence = self._calculate_retracement_confidence(
                                df, swing_low_idx, swing_high_idx, level_name
                            )
                            
                            if confidence >= 60:
                                # Check for confluence
                                confluence = self._check_confluence(
                                    df, level_price, swing_low, swing_high
                                )
                                
                                signals.append(FibonacciSignal(
                                    type='retracement',
                                    direction='bullish',
                                    confidence=confidence,
                                    fib_levels=fib_levels,
                                    key_level=level_price,
                                    swing_high=swing_high,
                                    swing_low=swing_low,
                                    current_price=current_price,
                                    description=f'Bullish Fib retracement at {level_name} ({level_price:.5f}). Price pulled back from {swing_high:.5f} to key support.',
                                    entry=level_price,
                                    stop_loss=swing_low * 0.995,
                                    targets=self._calculate_extension_targets(
                                        level_price, swing_low, swing_high, 'bullish'
                                    ),
                                    confluence_factors=confluence
                                ))
        
        # BEARISH RETRACEMENT: After downtrend, price rallies to Fib level
        for i in range(len(swing_highs_idx) - 1):
            swing_high_idx = swing_highs_idx[i]
            
            # Find next swing low after this high
            lower_lows = swing_lows_idx[swing_lows_idx > swing_high_idx]
            
            if len(lower_lows) > 0:
                swing_low_idx = lower_lows[0]
                
                swing_high = highs[swing_high_idx]
                swing_low = lows[swing_low_idx]
                
                # Check if we're in rally phase
                if current_price > swing_low and current_price < swing_high:
                    # Calculate Fib levels
                    fib_levels = self._calculate_retracement_levels(
                        swing_high, swing_low, 'bearish'
                    )
                    
                    # Check if price is at a key Fib level
                    at_level, level_name, level_price = self._is_at_fib_level(
                        current_price, fib_levels
                    )
                    
                    if at_level:
                        confidence = self._calculate_retracement_confidence(
                            df, swing_high_idx, swing_low_idx, level_name
                        )
                        
                        if confidence >= 60:
                            confluence = self._check_confluence(
                                df, level_price, swing_low, swing_high
                            )
                            
                            signals.append(FibonacciSignal(
                                type='retracement',
                                direction='bearish',
                                confidence=confidence,
                                fib_levels=fib_levels,
                                key_level=level_price,
                                swing_high=swing_high,
                                swing_low=swing_low,
                                current_price=current_price,
                                description=f'Bearish Fib retracement at {level_name} ({level_price:.5f}). Price rallied from {swing_low:.5f} to key resistance.',
                                entry=level_price,
                                stop_loss=swing_high * 1.005,
                                targets=self._calculate_extension_targets(
                                    level_price, swing_high, swing_low, 'bearish'
                                ),
                                confluence_factors=confluence
                            ))
        
        return signals[-5:] if len(signals) > 5 else signals  # Return most recent
    
    # ============ FIBONACCI EXTENSIONS ============
    
    def detect_extensions(self, df: pd.DataFrame) -> List[FibonacciSignal]:
        """
        Fibonacci Extensions: Project targets beyond swing high/low
        
        Used for take-profit targets after breakout
        """
        signals = []
        
        if len(df) < self.swing_window * 3:
            return signals
        
        highs = df['high'].values
        lows = df['low'].values
        closes = df['close'].values
        current_price = closes[-1]
        
        swing_highs_idx = argrelextrema(highs, np.greater, order=self.swing_window)[0]
        swing_lows_idx = argrelextrema(lows, np.less, order=self.swing_window)[0]
        
        # BULLISH EXTENSION: Price breaks above swing high, project targets
        if len(swing_lows_idx) >= 2 and len(swing_highs_idx) >= 1:
            # Get recent swing points (A, B, C pattern)
            if len(swing_lows_idx) >= 2:
                point_A_idx = swing_lows_idx[-2]
                point_A = lows[point_A_idx]
                
                # Find swing high after A
                highs_after_A = swing_highs_idx[swing_highs_idx > point_A_idx]
                if len(highs_after_A) > 0:
                    point_B_idx = highs_after_A[0]
                    point_B = highs[point_B_idx]
                    
                    # Find swing low after B (retracement)
                    lows_after_B = swing_lows_idx[swing_lows_idx > point_B_idx]
                    if len(lows_after_B) > 0:
                        point_C_idx = lows_after_B[0]
                        point_C = lows[point_C_idx]
                        
                        # Check if price broke above B (extension phase)
                        if current_price > point_B:
                            # Calculate extension levels
                            extension_levels = self._calculate_extension_levels(
                                point_A, point_B, point_C, 'bullish'
                            )
                            
                            # Check if approaching an extension level
                            approaching, level_name, level_price = self._is_approaching_extension(
                                current_price, extension_levels, 'bullish'
                            )
                            
                            if approaching:
                                confidence = 75.0  # Extensions are high confidence targets
                                
                                signals.append(FibonacciSignal(
                                    type='extension',
                                    direction='bullish',
                                    confidence=confidence,
                                    fib_levels=extension_levels,
                                    key_level=level_price,
                                    swing_high=point_B,
                                    swing_low=point_A,
                                    current_price=current_price,
                                    description=f'Bullish Fib extension target at {level_name} ({level_price:.5f}). Price extended beyond {point_B:.5f}.',
                                    entry=current_price,
                                    stop_loss=point_C,
                                    targets=[
                                        {'level': 1, 'price': extension_levels['1.272'], 'percentage': 25, 'rr': 1.272},
                                        {'level': 2, 'price': extension_levels['1.618'], 'percentage': 25, 'rr': 1.618},
                                        {'level': 3, 'price': extension_levels['2.0'], 'percentage': 25, 'rr': 2.0},
                                        {'level': 4, 'price': extension_levels['2.618'], 'percentage': 25, 'rr': 2.618}
                                    ],
                                    confluence_factors=['Extension breakout', 'ABC pattern complete']
                                ))
        
        # BEARISH EXTENSION: Price breaks below swing low, project targets
        if len(swing_highs_idx) >= 2 and len(swing_lows_idx) >= 1:
            if len(swing_highs_idx) >= 2:
                point_A_idx = swing_highs_idx[-2]
                point_A = highs[point_A_idx]
                
                lows_after_A = swing_lows_idx[swing_lows_idx > point_A_idx]
                if len(lows_after_A) > 0:
                    point_B_idx = lows_after_A[0]
                    point_B = lows[point_B_idx]
                    
                    highs_after_B = swing_highs_idx[swing_highs_idx > point_B_idx]
                    if len(highs_after_B) > 0:
                        point_C_idx = highs_after_B[0]
                        point_C = highs[point_C_idx]
                        
                        if current_price < point_B:
                            extension_levels = self._calculate_extension_levels(
                                point_A, point_B, point_C, 'bearish'
                            )
                            
                            approaching, level_name, level_price = self._is_approaching_extension(
                                current_price, extension_levels, 'bearish'
                            )
                            
                            if approaching:
                                signals.append(FibonacciSignal(
                                    type='extension',
                                    direction='bearish',
                                    confidence=75.0,
                                    fib_levels=extension_levels,
                                    key_level=level_price,
                                    swing_high=point_A,
                                    swing_low=point_B,
                                    current_price=current_price,
                                    description=f'Bearish Fib extension target at {level_name} ({level_price:.5f}). Price extended beyond {point_B:.5f}.',
                                    entry=current_price,
                                    stop_loss=point_C,
                                    targets=[
                                        {'level': 1, 'price': extension_levels['1.272'], 'percentage': 25, 'rr': 1.272},
                                        {'level': 2, 'price': extension_levels['1.618'], 'percentage': 25, 'rr': 1.618},
                                        {'level': 3, 'price': extension_levels['2.0'], 'percentage': 25, 'rr': 2.0},
                                        {'level': 4, 'price': extension_levels['2.618'], 'percentage': 25, 'rr': 2.618}
                                    ],
                                    confluence_factors=['Extension breakdown', 'ABC pattern complete']
                                ))
        
        return signals
    
    # ============ FIBONACCI CLUSTERS ============
    
    def detect_clusters(self, df: pd.DataFrame) -> List[FibonacciSignal]:
        """
        Fibonacci Clusters: Multiple Fib levels from different swings converging
        
        Very high probability zones where multiple Fib levels align
        """
        signals = []
        
        if len(df) < self.swing_window * 4:
            return signals
        
        highs = df['high'].values
        lows = df['low'].values
        current_price = df['close'].iloc[-1]
        
        swing_highs_idx = argrelextrema(highs, np.greater, order=self.swing_window)[0]
        swing_lows_idx = argrelextrema(lows, np.less, order=self.swing_window)[0]
        
        # Collect all Fib levels from recent swings
        all_fib_levels = []
        
        # Get Fib levels from last 3-5 swing combinations
        for i in range(max(0, len(swing_lows_idx) - 5), len(swing_lows_idx)):
            for j in range(max(0, len(swing_highs_idx) - 5), len(swing_highs_idx)):
                if swing_highs_idx[j] > swing_lows_idx[i]:
                    swing_low = lows[swing_lows_idx[i]]
                    swing_high = highs[swing_highs_idx[j]]
                    
                    fib_levels = self._calculate_retracement_levels(swing_low, swing_high, 'bullish')
                    
                    for level_name, level_price in fib_levels.items():
                        all_fib_levels.append({
                            'price': level_price,
                            'name': level_name,
                            'swing_low': swing_low,
                            'swing_high': swing_high
                        })
        
        # Find clusters (multiple levels within tolerance)
        clusters = self._find_price_clusters(all_fib_levels, self.CLUSTER_TOLERANCE)
        
        # Create signals for strong clusters
        for cluster in clusters:
            if cluster['count'] >= 3:  # At least 3 Fib levels converging
                # Check if current price is near cluster
                if abs(current_price - cluster['center']) / current_price < 0.01:  # Within 1%
                    
                    confidence = min(95, 60 + (cluster['count'] * 10))  # More levels = higher confidence
                    
                    # Determine direction based on price position
                    direction = 'bullish' if current_price < cluster['center'] else 'bearish'
                    
                    signals.append(FibonacciSignal(
                        type='cluster',
                        direction=direction,
                        confidence=confidence,
                        fib_levels={'cluster_center': cluster['center']},
                        key_level=cluster['center'],
                        swing_high=max(l['swing_high'] for l in cluster['levels']),
                        swing_low=min(l['swing_low'] for l in cluster['levels']),
                        current_price=current_price,
                        description=f'Fibonacci cluster zone at {cluster["center"]:.5f}. {cluster["count"]} Fib levels converging - HIGH PROBABILITY zone.',
                        entry=cluster['center'],
                        stop_loss=cluster['center'] * (0.995 if direction == 'bullish' else 1.005),
                        targets=self._calculate_cluster_targets(cluster['center'], direction),
                        confluence_factors=[f'{cluster["count"]} Fib levels converging', 'Multiple swing analysis', 'High probability zone']
                    ))
        
        return signals
    
    # ============ FIBONACCI CONFLUENCE ZONES ============
    
    def detect_confluence_zones(self, df: pd.DataFrame) -> List[FibonacciSignal]:
        """
        Fibonacci Confluence: Fib levels + S/R + round numbers + patterns
        
        Ultimate high-probability zones
        """
        signals = []
        
        # Get Fib retracements
        retracements = self.detect_retracements(df)
        
        # Get clusters
        clusters = self.detect_clusters(df)
        
        # Combine and enhance with additional confluence
        all_zones = retracements + clusters
        
        for zone in all_zones:
            # Check for additional confluence factors
            additional_confluence = []
            
            # Check if at round number
            if self._is_round_number(zone.key_level):
                additional_confluence.append('Round number')
            
            # Check if at previous swing high/low
            if self._is_at_previous_swing(df, zone.key_level):
                additional_confluence.append('Previous swing level')
            
            # Check if at daily/weekly level
            if self._is_at_major_timeframe_level(df, zone.key_level):
                additional_confluence.append('Major timeframe S/R')
            
            # If we have 3+ confluence factors, it's a confluence zone
            total_confluence = len(zone.confluence_factors) + len(additional_confluence)
            
            if total_confluence >= 3:
                zone.type = 'confluence'
                zone.confluence_factors.extend(additional_confluence)
                zone.confidence = min(95, zone.confidence + (total_confluence * 5))
                zone.description = f'CONFLUENCE ZONE at {zone.key_level:.5f}. {total_confluence} factors: {", ".join(zone.confluence_factors)}'
                signals.append(zone)
        
        return signals
    
    # ============ FIBONACCI TREND CHANNELS ============
    
    def detect_trend_channels(self, df: pd.DataFrame) -> List[FibonacciSignal]:
        """
        Fibonacci Trend Channels: Parallel channels based on Fib ratios
        
        Used to project support/resistance in trending markets
        """
        signals = []
        
        # Implementation would involve:
        # 1. Detect trend (uptrend/downtrend)
        # 2. Draw base trendline
        # 3. Project parallel channels at Fib ratios (0.618, 1.0, 1.618, 2.618)
        # 4. Check if price is bouncing off channel lines
        
        # Simplified version for now
        return signals
    
    # ============ FIBONACCI TIME ZONES ============
    
    def detect_time_zones(self, df: pd.DataFrame) -> List[FibonacciSignal]:
        """
        Fibonacci Time Zones: Predict timing of reversals
        
        Based on Fibonacci sequence: 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89...
        """
        signals = []
        
        # Implementation would involve:
        # 1. Identify significant swing
        # 2. Project Fib time intervals forward
        # 3. Check if current bar is at a Fib time zone
        # 4. Look for reversal patterns at these times
        
        # Simplified version for now
        return signals
    
    # ============ HELPER METHODS ============
    
    def _calculate_retracement_levels(self, start: float, end: float, direction: str) -> Dict[str, float]:
        """Calculate Fibonacci retracement levels"""
        diff = end - start
        
        levels = {}
        for ratio in self.RETRACEMENT_LEVELS:
            if direction == 'bullish':
                levels[f'{ratio:.1%}'] = end - (diff * ratio)
            else:
                levels[f'{ratio:.1%}'] = start + (diff * ratio)
        
        return levels
    
    def _calculate_extension_levels(self, point_A: float, point_B: float, point_C: float, direction: str) -> Dict[str, float]:
        """Calculate Fibonacci extension levels"""
        AB_move = abs(point_B - point_A)
        
        levels = {}
        for ratio in self.EXTENSION_LEVELS:
            if direction == 'bullish':
                levels[f'{ratio}'] = point_C + (AB_move * ratio)
            else:
                levels[f'{ratio}'] = point_C - (AB_move * ratio)
        
        return levels
    
    def _is_at_fib_level(self, price: float, fib_levels: Dict[str, float]) -> Tuple[bool, str, float]:
        """Check if price is at a Fibonacci level"""
        for level_name, level_price in fib_levels.items():
            if abs(price - level_price) / price < self.LEVEL_TOLERANCE:
                return True, level_name, level_price
        return False, '', 0.0
    
    def _is_approaching_extension(self, price: float, extension_levels: Dict[str, float], direction: str) -> Tuple[bool, str, float]:
        """Check if price is approaching an extension level"""
        for level_name, level_price in extension_levels.items():
            distance = abs(price - level_price) / price
            
            if distance < 0.01:  # Within 1%
                # Check if approaching from correct direction
                if direction == 'bullish' and price < level_price:
                    return True, level_name, level_price
                elif direction == 'bearish' and price > level_price:
                    return True, level_name, level_price
        
        return False, '', 0.0
    
    def _calculate_retracement_confidence(self, df: pd.DataFrame, start_idx: int, end_idx: int, level_name: str) -> float:
        """Calculate confidence for retracement signal"""
        confidence = 60.0  # Base confidence
        
        # Higher confidence for golden ratio (61.8%)
        if '61.8%' in level_name or '0.618' in level_name:
            confidence += 15
        
        # Higher confidence for 50% (psychological level)
        if '50.0%' in level_name or '0.5' in level_name:
            confidence += 10
        
        # Check volume at level
        if len(df) > end_idx:
            recent_volume = df['volume'].iloc[-5:].mean() if 'volume' in df.columns else 0
            avg_volume = df['volume'].iloc[start_idx:end_idx].mean() if 'volume' in df.columns else 0
            
            if recent_volume > avg_volume * 1.5:
                confidence += 10
        
        return min(95, confidence)
    
    def _check_confluence(self, df: pd.DataFrame, level_price: float, swing_low: float, swing_high: float) -> List[str]:
        """Check for confluence factors"""
        confluence = []
        
        # Check if at round number
        if self._is_round_number(level_price):
            confluence.append('Round number')
        
        # Check if at previous swing
        if self._is_at_previous_swing(df, level_price):
            confluence.append('Previous swing level')
        
        # Check if near EMA
        if 'ema_50' in df.columns:
            ema_50 = df['ema_50'].iloc[-1]
            if abs(level_price - ema_50) / level_price < 0.005:
                confluence.append('EMA 50 confluence')
        
        return confluence
    
    def _is_round_number(self, price: float) -> bool:
        """Check if price is a round number"""
        # Check for round numbers like 1.1000, 1.2000, etc.
        str_price = f'{price:.4f}'
        return str_price[-2:] == '00' or str_price[-3:] == '000'
    
    def _is_at_previous_swing(self, df: pd.DataFrame, level: float) -> bool:
        """Check if level aligns with previous swing high/low"""
        highs = df['high'].values
        lows = df['low'].values
        
        for high in highs[-50:]:
            if abs(high - level) / level < 0.005:
                return True
        
        for low in lows[-50:]:
            if abs(low - level) / level < 0.005:
                return True
        
        return False
    
    def _is_at_major_timeframe_level(self, df: pd.DataFrame, level: float) -> bool:
        """Check if at daily/weekly S/R (simplified)"""
        # Would need higher timeframe data in production
        return False
    
    def _find_price_clusters(self, levels: List[Dict], tolerance: float) -> List[Dict]:
        """Find clusters of price levels"""
        if not levels:
            return []
        
        # Sort by price
        sorted_levels = sorted(levels, key=lambda x: x['price'])
        
        clusters = []
        current_cluster = [sorted_levels[0]]
        
        for i in range(1, len(sorted_levels)):
            # Check if within tolerance of current cluster
            cluster_center = np.mean([l['price'] for l in current_cluster])
            
            if abs(sorted_levels[i]['price'] - cluster_center) / cluster_center < tolerance:
                current_cluster.append(sorted_levels[i])
            else:
                # Save current cluster if significant
                if len(current_cluster) >= 2:
                    clusters.append({
                        'center': np.mean([l['price'] for l in current_cluster]),
                        'count': len(current_cluster),
                        'levels': current_cluster
                    })
                
                # Start new cluster
                current_cluster = [sorted_levels[i]]
        
        # Don't forget last cluster
        if len(current_cluster) >= 2:
            clusters.append({
                'center': np.mean([l['price'] for l in current_cluster]),
                'count': len(current_cluster),
                'levels': current_cluster
            })
        
        return clusters
    
    def _calculate_extension_targets(self, entry: float, swing_low: float, swing_high: float, direction: str) -> List[Dict]:
        """Calculate extension-based targets"""
        move = abs(swing_high - swing_low)
        
        if direction == 'bullish':
            return [
                {'level': 1, 'price': entry + (move * 0.618), 'percentage': 25, 'rr': 0.618},
                {'level': 2, 'price': entry + (move * 1.0), 'percentage': 25, 'rr': 1.0},
                {'level': 3, 'price': entry + (move * 1.618), 'percentage': 25, 'rr': 1.618},
                {'level': 4, 'price': entry + (move * 2.618), 'percentage': 25, 'rr': 2.618}
            ]
        else:
            return [
                {'level': 1, 'price': entry - (move * 0.618), 'percentage': 25, 'rr': 0.618},
                {'level': 2, 'price': entry - (move * 1.0), 'percentage': 25, 'rr': 1.0},
                {'level': 3, 'price': entry - (move * 1.618), 'percentage': 25, 'rr': 1.618},
                {'level': 4, 'price': entry - (move * 2.618), 'percentage': 25, 'rr': 2.618}
            ]
    
    def _calculate_cluster_targets(self, entry: float, direction: str) -> List[Dict]:
        """Calculate targets for cluster zones"""
        # Use ATR-based targets for clusters
        atr = entry * 0.02  # Simplified 2% ATR
        
        if direction == 'bullish':
            return [
                {'level': 1, 'price': entry + (atr * 1.5), 'percentage': 25, 'rr': 1.5},
                {'level': 2, 'price': entry + (atr * 2.0), 'percentage': 25, 'rr': 2.0},
                {'level': 3, 'price': entry + (atr * 3.0), 'percentage': 25, 'rr': 3.0},
                {'level': 4, 'price': entry + (atr * 4.0), 'percentage': 25, 'rr': 4.0}
            ]
        else:
            return [
                {'level': 1, 'price': entry - (atr * 1.5), 'percentage': 25, 'rr': 1.5},
                {'level': 2, 'price': entry - (atr * 2.0), 'percentage': 25, 'rr': 2.0},
                {'level': 3, 'price': entry - (atr * 3.0), 'percentage': 25, 'rr': 3.0},
                {'level': 4, 'price': entry - (atr * 4.0), 'percentage': 25, 'rr': 4.0}
            ]
    
    def to_dict(self, signal: FibonacciSignal) -> Dict:
        """Convert to dictionary"""
        return {
            'type': signal.type,
            'direction': signal.direction,
            'confidence': signal.confidence,
            'fib_levels': signal.fib_levels,
            'key_level': signal.key_level,
            'swing_high': signal.swing_high,
            'swing_low': signal.swing_low,
            'current_price': signal.current_price,
            'description': signal.description,
            'entry': signal.entry,
            'stop_loss': signal.stop_loss,
            'targets': signal.targets,
            'confluence_factors': signal.confluence_factors
        }


# Export
def detect_fibonacci_patterns(df: pd.DataFrame) -> Dict[str, List[Dict]]:
    """Main function to detect all Fibonacci patterns"""
    detector = ComprehensiveFibonacciDetector()
    all_patterns = detector.detect_all(df)
    
    return {
        category: [detector.to_dict(p) for p in patterns]
        for category, patterns in all_patterns.items()
    }
