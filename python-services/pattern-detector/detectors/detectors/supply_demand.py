"""
Supply & Demand Zones + Support & Resistance Detector - GURU LEVEL

This module detects:
1. Supply Zones (areas where selling pressure is strong)
2. Demand Zones (areas where buying pressure is strong)
3. Support Levels (price floors)
4. Resistance Levels (price ceilings)
5. Order Blocks (institutional footprints)
6. Fair Value Gaps (imbalance zones)
"""

import numpy as np
from typing import List, Dict, Tuple
from dataclasses import dataclass


@dataclass
class Zone:
    type: str  # 'supply', 'demand', 'support', 'resistance', 'order_block', 'fvg'
    strength: float  # 0-100
    top: float
    bottom: float
    touches: int
    last_touch_index: int
    created_index: int
    description: str


class SupplyDemandDetector:
    """GURU-LEVEL Supply & Demand + Support & Resistance Detector"""
    
    def __init__(self, min_strength: float = 60.0):
        self.min_strength = min_strength
    
    def detect_all(self, candles: List[Dict]) -> Dict[str, List[Zone]]:
        """Detect all zones and levels"""
        return {
            'supply_zones': self.detect_supply_zones(candles),
            'demand_zones': self.detect_demand_zones(candles),
            'support_levels': self.detect_support_levels(candles),
            'resistance_levels': self.detect_resistance_levels(candles),
            'order_blocks': self.detect_order_blocks(candles),
            'fair_value_gaps': self.detect_fair_value_gaps(candles)
        }
    
    # ============ SUPPLY & DEMAND ZONES ============
    
    def detect_supply_zones(self, candles: List[Dict]) -> List[Zone]:
        """
        Supply Zones: Areas where strong selling occurred
        Identified by: Sharp drop from consolidation
        """
        zones = []
        
        if len(candles) < 20:
            return zones
        
        highs = np.array([c['high'] for c in candles])
        lows = np.array([c['low'] for c in candles])
        closes = np.array([c['close'] for c in candles])
        volumes = np.array([c.get('volume', 1) for c in candles])
        
        for i in range(10, len(candles) - 5):
            # Look for consolidation followed by sharp drop
            consolidation = closes[i-10:i]
            drop_candles = closes[i:i+5]
            
            # Check for consolidation (low volatility)
            cons_range = np.max(consolidation) - np.min(consolidation)
            cons_avg = np.mean(consolidation)
            
            if cons_range / cons_avg < 0.03:  # Less than 3% range
                # Check for sharp drop
                drop = (closes[i] - closes[i+4]) / closes[i]
                
                if drop > 0.03:  # More than 3% drop
                    # This is a supply zone
                    zone_top = np.max(highs[i-10:i])
                    zone_bottom = np.min(lows[i-10:i])
                    
                    # Calculate strength based on drop magnitude and volume
                    avg_volume = np.mean(volumes)
                    drop_volume = np.mean(volumes[i:i+5])
                    volume_factor = min(2.0, drop_volume / avg_volume) if avg_volume > 0 else 1.0
                    
                    strength = min(100, (drop * 1000) * volume_factor)
                    
                    # Count touches
                    touches = self._count_touches(highs, lows, zone_top, zone_bottom, i)
                    
                    if strength >= self.min_strength:
                        zones.append(Zone(
                            type='supply',
                            strength=strength,
                            top=zone_top,
                            bottom=zone_bottom,
                            touches=touches,
                            last_touch_index=i,
                            created_index=i,
                            description=f'Supply zone created by {drop*100:.1f}% drop. Strong selling pressure.'
                        ))
        
        return self._merge_overlapping_zones(zones)
    
    def detect_demand_zones(self, candles: List[Dict]) -> List[Zone]:
        """
        Demand Zones: Areas where strong buying occurred
        Identified by: Sharp rally from consolidation
        """
        zones = []
        
        if len(candles) < 20:
            return zones
        
        highs = np.array([c['high'] for c in candles])
        lows = np.array([c['low'] for c in candles])
        closes = np.array([c['close'] for c in candles])
        volumes = np.array([c.get('volume', 1) for c in candles])
        
        for i in range(10, len(candles) - 5):
            # Look for consolidation followed by sharp rally
            consolidation = closes[i-10:i]
            rally_candles = closes[i:i+5]
            
            cons_range = np.max(consolidation) - np.min(consolidation)
            cons_avg = np.mean(consolidation)
            
            if cons_range / cons_avg < 0.03:
                # Check for sharp rally
                rally = (closes[i+4] - closes[i]) / closes[i]
                
                if rally > 0.03:  # More than 3% rally
                    zone_top = np.max(highs[i-10:i])
                    zone_bottom = np.min(lows[i-10:i])
                    
                    avg_volume = np.mean(volumes)
                    rally_volume = np.mean(volumes[i:i+5])
                    volume_factor = min(2.0, rally_volume / avg_volume) if avg_volume > 0 else 1.0
                    
                    strength = min(100, (rally * 1000) * volume_factor)
                    touches = self._count_touches(highs, lows, zone_top, zone_bottom, i)
                    
                    if strength >= self.min_strength:
                        zones.append(Zone(
                            type='demand',
                            strength=strength,
                            top=zone_top,
                            bottom=zone_bottom,
                            touches=touches,
                            last_touch_index=i,
                            created_index=i,
                            description=f'Demand zone created by {rally*100:.1f}% rally. Strong buying pressure.'
                        ))
        
        return self._merge_overlapping_zones(zones)
    
    # ============ SUPPORT & RESISTANCE ============
    
    def detect_support_levels(self, candles: List[Dict]) -> List[Zone]:
        """
        Support Levels: Price floors where buying interest is strong
        Identified by: Multiple bounces from same level
        """
        levels = []
        
        if len(candles) < 30:
            return levels
        
        lows = np.array([c['low'] for c in candles])
        highs = np.array([c['high'] for c in candles])
        
        # Find significant lows
        from scipy.signal import find_peaks
        troughs, _ = find_peaks(-lows, distance=5, prominence=lows.std()*0.5)
        
        # Group similar levels
        level_groups = self._group_similar_levels(lows[troughs], tolerance=0.005)
        
        for level, indices in level_groups.items():
            if len(indices) >= 2:  # At least 2 touches
                touches = len(indices)
                
                # Calculate strength based on touches and time span
                time_span = max(indices) - min(indices)
                strength = min(100, (touches * 20) + (time_span / len(candles) * 30))
                
                if strength >= self.min_strength:
                    # Support zone has small range
                    zone_bottom = level * 0.995
                    zone_top = level * 1.005
                    
                    levels.append(Zone(
                        type='support',
                        strength=strength,
                        top=zone_top,
                        bottom=zone_bottom,
                        touches=touches,
                        last_touch_index=max(indices),
                        created_index=min(indices),
                        description=f'Support level at {level:.4f}. {touches} bounces detected.'
                    ))
        
        return levels
    
    def detect_resistance_levels(self, candles: List[Dict]) -> List[Zone]:
        """
        Resistance Levels: Price ceilings where selling interest is strong
        Identified by: Multiple rejections from same level
        """
        levels = []
        
        if len(candles) < 30:
            return levels
        
        highs = np.array([c['high'] for c in candles])
        lows = np.array([c['low'] for c in candles])
        
        # Find significant highs
        from scipy.signal import find_peaks
        peaks, _ = find_peaks(highs, distance=5, prominence=highs.std()*0.5)
        
        # Group similar levels
        level_groups = self._group_similar_levels(highs[peaks], tolerance=0.005)
        
        for level, indices in level_groups.items():
            if len(indices) >= 2:
                touches = len(indices)
                time_span = max(indices) - min(indices)
                strength = min(100, (touches * 20) + (time_span / len(candles) * 30))
                
                if strength >= self.min_strength:
                    zone_bottom = level * 0.995
                    zone_top = level * 1.005
                    
                    levels.append(Zone(
                        type='resistance',
                        strength=strength,
                        top=zone_top,
                        bottom=zone_bottom,
                        touches=touches,
                        last_touch_index=max(indices),
                        created_index=min(indices),
                        description=f'Resistance level at {level:.4f}. {touches} rejections detected.'
                    ))
        
        return levels
    
    # ============ ORDER BLOCKS ============
    
    def detect_order_blocks(self, candles: List[Dict]) -> List[Zone]:
        """
        Order Blocks: Last opposite-colored candle before strong move
        Institutional footprints where large orders were placed
        """
        blocks = []
        
        if len(candles) < 10:
            return blocks
        
        for i in range(5, len(candles) - 5):
            current = candles[i]
            next_candles = candles[i+1:i+6]
            
            # Bullish Order Block: Last red candle before strong green move
            if current['close'] < current['open']:  # Red candle
                # Check for strong upward move after
                rally = sum(1 for c in next_candles if c['close'] > c['open'])
                total_move = (candles[i+5]['close'] - current['close']) / current['close']
                
                if rally >= 4 and total_move > 0.02:  # 4+ green candles, 2%+ move
                    strength = min(100, total_move * 1000)
                    
                    blocks.append(Zone(
                        type='order_block',
                        strength=strength,
                        top=current['high'],
                        bottom=current['low'],
                        touches=1,
                        last_touch_index=i,
                        created_index=i,
                        description=f'Bullish order block. Institutional buying zone.'
                    ))
            
            # Bearish Order Block: Last green candle before strong red move
            elif current['close'] > current['open']:  # Green candle
                drop = sum(1 for c in next_candles if c['close'] < c['open'])
                total_move = (current['close'] - candles[i+5]['close']) / current['close']
                
                if drop >= 4 and total_move > 0.02:
                    strength = min(100, total_move * 1000)
                    
                    blocks.append(Zone(
                        type='order_block',
                        strength=strength,
                        top=current['high'],
                        bottom=current['low'],
                        touches=1,
                        last_touch_index=i,
                        created_index=i,
                        description=f'Bearish order block. Institutional selling zone.'
                    ))
        
        return blocks
    
    # ============ FAIR VALUE GAPS ============
    
    def detect_fair_value_gaps(self, candles: List[Dict]) -> List[Zone]:
        """
        Fair Value Gaps (FVG): Price imbalances that often get filled
        Identified by: Gap between candle 1 high and candle 3 low (or vice versa)
        """
        gaps = []
        
        if len(candles) < 3:
            return gaps
        
        for i in range(len(candles) - 2):
            c1 = candles[i]
            c2 = candles[i+1]
            c3 = candles[i+2]
            
            # Bullish FVG: Gap up (c1 high < c3 low)
            if c1['high'] < c3['low']:
                gap_size = c3['low'] - c1['high']
                gap_percent = gap_size / c1['high']
                
                if gap_percent > 0.001:  # At least 0.1% gap
                    strength = min(100, gap_percent * 5000)
                    
                    gaps.append(Zone(
                        type='fvg',
                        strength=strength,
                        top=c3['low'],
                        bottom=c1['high'],
                        touches=0,
                        last_touch_index=i+2,
                        created_index=i,
                        description=f'Bullish Fair Value Gap. {gap_percent*100:.2f}% imbalance. Likely to be filled.'
                    ))
            
            # Bearish FVG: Gap down (c1 low > c3 high)
            elif c1['low'] > c3['high']:
                gap_size = c1['low'] - c3['high']
                gap_percent = gap_size / c1['low']
                
                if gap_percent > 0.001:
                    strength = min(100, gap_percent * 5000)
                    
                    gaps.append(Zone(
                        type='fvg',
                        strength=strength,
                        top=c1['low'],
                        bottom=c3['high'],
                        touches=0,
                        last_touch_index=i+2,
                        created_index=i,
                        description=f'Bearish Fair Value Gap. {gap_percent*100:.2f}% imbalance. Likely to be filled.'
                    ))
        
        return gaps
    
    # ============ HELPER METHODS ============
    
    def _count_touches(self, highs: np.ndarray, lows: np.ndarray, 
                      zone_top: float, zone_bottom: float, start_idx: int) -> int:
        """Count how many times price touched the zone"""
        touches = 0
        for i in range(start_idx, len(highs)):
            # Price touched zone if it overlaps
            if lows[i] <= zone_top and highs[i] >= zone_bottom:
                touches += 1
        return touches
    
    def _group_similar_levels(self, levels: np.ndarray, tolerance: float = 0.005) -> Dict[float, List[int]]:
        """Group similar price levels together"""
        groups = {}
        
        for idx, level in enumerate(levels):
            # Find if this level belongs to existing group
            found_group = False
            for group_level in groups.keys():
                if abs(level - group_level) / group_level < tolerance:
                    groups[group_level].append(idx)
                    found_group = True
                    break
            
            if not found_group:
                groups[level] = [idx]
        
        return groups
    
    def _merge_overlapping_zones(self, zones: List[Zone]) -> List[Zone]:
        """Merge overlapping zones"""
        if not zones:
            return zones
        
        # Sort by bottom price
        sorted_zones = sorted(zones, key=lambda z: z.bottom)
        merged = [sorted_zones[0]]
        
        for current in sorted_zones[1:]:
            last = merged[-1]
            
            # Check if zones overlap
            if current.bottom <= last.top:
                # Merge zones
                merged[-1] = Zone(
                    type=last.type,
                    strength=max(last.strength, current.strength),
                    top=max(last.top, current.top),
                    bottom=min(last.bottom, current.bottom),
                    touches=last.touches + current.touches,
                    last_touch_index=max(last.last_touch_index, current.last_touch_index),
                    created_index=min(last.created_index, current.created_index),
                    description=last.description
                )
            else:
                merged.append(current)
        
        return merged
    
    def to_dict(self, zone: Zone) -> Dict:
        """Convert zone to dictionary"""
        return {
            'type': zone.type,
            'strength': zone.strength,
            'top': zone.top,
            'bottom': zone.bottom,
            'touches': zone.touches,
            'description': zone.description
        }


def detect_supply_demand(candles: List[Dict]) -> Dict[str, List[Dict]]:
    """
    Main function to detect all supply/demand zones and support/resistance levels
    
    Returns:
        Dictionary with all detected zones and levels
    """
    detector = SupplyDemandDetector()
    all_zones = detector.detect_all(candles)
    
    # Convert to dict format
    return {
        'supply_zones': [detector.to_dict(z) for z in all_zones['supply_zones']],
        'demand_zones': [detector.to_dict(z) for z in all_zones['demand_zones']],
        'support_levels': [detector.to_dict(z) for z in all_zones['support_levels']],
        'resistance_levels': [detector.to_dict(z) for z in all_zones['resistance_levels']],
        'order_blocks': [detector.to_dict(z) for z in all_zones['order_blocks']],
        'fair_value_gaps': [detector.to_dict(z) for z in all_zones['fair_value_gaps']]
    }
