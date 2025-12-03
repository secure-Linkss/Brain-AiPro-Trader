"""
Smart Money Concepts (SMC) Detection System
Guru-level implementation of institutional trading footprints

Implements:
- Order Blocks (OB)
- Fair Value Gaps (FVG)
- Liquidity Sweeps (Liquidity Grabs)
- Break of Structure (BOS)
- Change of Character (CHoCH)
- Market Structure Shifts
- Inducement Zones
- Optimal Trade Entry (OTE - 0.618-0.79 Fib retracement)
"""

import pandas as pd
import numpy as np
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
from datetime import datetime
from enum import Enum


class OrderBlockType(Enum):
    """Type of order block"""
    BULLISH = "bullish"  # Last bearish candle before uptrend
    BEARISH = "bearish"  # Last bullish candle before downtrend


class LiquidityType(Enum):
    """Type of liquidity"""
    BUY_SIDE = "buy_side"  # Above resistance (stops hunted upward)
    SELL_SIDE = "sell_side"  # Below support (stops hunted downward)


class StructureType(Enum):
    """Market structure types"""
    HIGHER_HIGH = "hh"
    HIGHER_LOW = "hl"
    LOWER_HIGH = "lh"
    LOWER_LOW = "ll"
    EQUAL_HIGH = "eh"
    EQUAL_LOW = "el"


@dataclass
class OrderBlock:
    """
    Order Block: The last opposite candle before a strong move
    Represents institutional accumulation/distribution zone
    """
    type: OrderBlockType
    open: float
    high: float
    low: float
    close: float
    entry_index: int  # Candle index where OB formed
    strength: float  # 0-100, based on effectiveness
    volume: float
    tested: bool = False  # Whether price returned to this zone
    held: bool = False  # Whether OB held on retest
    invalidated: bool = False  # Whether price closed through OB
    
    @property
    def zone_high(self) -> float:
        """Upper boundary of OB zone"""
        return self.high if self.type == OrderBlockType.BULLISH else max(self.open, self.close)
    
    @property
    def zone_low(self) -> float:
        """Lower boundary of OB zone"""
        return min(self.open, self.close) if self.type == OrderBlockType.BULLISH else self.low
    
    def is_price_in_zone(self, price: float) -> bool:
        """Check if price is within OB zone"""
        return self.zone_low <= price <= self.zone_high


@dataclass
class FairValueGap:
    """
    Fair Value Gap (FVG): Imbalance in market (unfilled orders)
    Gap between candle wicks indicating institutional fast move
    """
    start_index: int
    end_index: int
    gap_high: float  # Top of the gap
    gap_low: float  # Bottom of the gap
    direction: str  # "bullish" or "bearish"
    filled: bool = False
    fill_percentage: float = 0.0  # How much of gap has been filled
    
    @property
    def size(self) -> float:
        """Size of the gap"""
        return self.gap_high - self.gap_low
    
    def check_fill(self, current_low: float, current_high: float) -> float:
        """
        Check if gap has been filled
        Returns fill percentage (0-1)
        """
        if current_high >= self.gap_high and current_low <= self.gap_low:
            self.filled = True
            self.fill_percentage = 1.0
        elif current_low < self.gap_high and current_low > self.gap_low:
            # Partial fill from above
            self.fill_percentage = (self.gap_high - current_low) / self.size
        elif current_high > self.gap_low and current_high < self.gap_high:
            # Partial fill from below
            self.fill_percentage = (current_high - self.gap_low) / self.size
            
        return self.fill_percentage


@dataclass
class LiquiditySweep:
    """
    Liquidity Sweep: When price hunts stop losses then reverses
    Classic smart money manipulation tactic
    """
    type: LiquidityType
    sweep_index: int  # Candle that swept liquidity
    level_swept: float  # Price level where stops were
    reversal_confirmed: bool
    reversal_index: Optional[int] = None
    strength: float = 0.0  # Reversal strength after sweep


@dataclass
class BreakOfStructure:
    """
    Break of Structure (BOS): Continuation of existing trend
    Higher high in uptrend, lower low in downtrend
    """
    type: StructureType
    break_index: int
    previous_extreme: float  # Previous HH/LL that was broken
    new_extreme: float  # New HH/LL after break
    confirmed: bool = False


@dataclass
class ChangeOfCharacter:
    """
    Change of Character (CHoCH): Potential trend reversal
    Break of structure against the trend (HL broken in uptrend = CHoCH)
    """
    break_index: int
    previous_trend: str  # "bullish" or "bearish"
    broken_level: float
    reversal_confirmed: bool = False
    new_trend_established: bool = False


class SMCDetector:
    """
    Guru-level Smart Money Concepts detector
    Identifies institutional footprints in price action
    """
    
    def __init__(self, min_ob_strength: float = 0.5):
        """
        Initialize SMC detector
        
        Args:
            min_ob_strength: Minimum strength to consider an OB valid (0-1)
        """
        self.min_ob_strength = min_ob_strength
        
    def detect_order_blocks(
        self,
        df: pd.DataFrame,
        lookback: int = 50
    ) -> List[OrderBlock]:
        """
        Detect order blocks in price data
        
        An Order Block is the last opposite-colored candle before a strong impulsive move:
        - Bullish OB: Last bearish candle before strong uptrend
        - Bearish OB: Last bullish candle before strong downtrend
        
        Args:
            df: OHLCV dataframe
            lookback: How many candles to analyze
            
        Returns:
            List of detected order blocks
        """
        order_blocks = []
        recent_data = df.tail(lookback).copy()
        
        # Add candle direction
        recent_data['bullish'] = recent_data['close'] > recent_data['open']
        recent_data['body_size'] = abs(recent_data['close'] - recent_data['open'])
        recent_data['avg_body'] = recent_data['body_size'].rolling(20).mean()
        
        for i in range(3, len(recent_data) - 1):
            current_idx = recent_data.index[i]
            current = recent_data.iloc[i]
            next_candles = recent_data.iloc[i+1:min(i+6, len(recent_data))]
            
            if len(next_candles) < 3:
                continue
                
            # Check for bullish OB (bearish candle followed by strong bullish move)
            if not current['bullish']:
                # Next 3-5 candles should be strongly bullish
                bullish_count = next_candles['bullish'].sum()
                strong_moves = next_candles['body_size'] > current['avg_body']
                
                if bullish_count >= 3 and strong_moves.sum() >= 2:
                    # Calculate strength based on subsequent price action
                    price_gain = next_candles['high'].max() - current['close']
                    atr = current['avg_body'] * 2
                    strength = min(price_gain / atr, 1.0) if atr > 0 else 0
                    
                    if strength >= self.min_ob_strength:
                        ob = OrderBlock(
                            type=OrderBlockType.BULLISH,
                            open=current['open'],
                            high=current['high'],
                            low=current['low'],
                            close=current['close'],
                            entry_index=i,
                            strength=strength * 100,
                            volume=current.get('volume', 0)
                        )
                        order_blocks.append(ob)
            
            # Check for bearish OB (bullish candle followed by strong bearish move)
            elif current['bullish']:
                bearish_count = (~next_candles['bullish']).sum()
                strong_moves = next_candles['body_size'] > current['avg_body']
                
                if bearish_count >= 3 and strong_moves.sum() >= 2:
                    price_drop = current['close'] - next_candles['low'].min()
                    atr = current['avg_body'] * 2
                    strength = min(price_drop / atr, 1.0) if atr > 0 else 0
                    
                    if strength >= self.min_ob_strength:
                        ob = OrderBlock(
                            type=OrderBlockType.BEARISH,
                            open=current['open'],
                            high=current['high'],
                            low=current['low'],
                            close=current['close'],
                            entry_index=i,
                            strength=strength * 100,
                            volume=current.get('volume', 0)
                        )
                        order_blocks.append(ob)
        
        # Check if OBs have been retested and held
        self._check_ob_validity(recent_data, order_blocks)
        
        return order_blocks
    
    def _check_ob_validity(
        self,
        df: pd.DataFrame,
        order_blocks: List[OrderBlock]
    ):
        """
        Check if order blocks have been tested and whether they held
        OBs that hold on retest are stronger
        """
        for ob in order_blocks:
            # Check candles after OB formation
            future_candles = df.iloc[ob.entry_index + 1:]
            
            for idx, candle in future_candles.iterrows():
                # Check if price returned to OB zone
                if ob.is_price_in_zone(candle['low']) or ob.is_price_in_zone(candle['high']):
                    ob.tested = True
                    
                    # Check if OB held (price respected the zone)
                    if ob.type == OrderBlockType.BULLISH:
                        # Bullish OB holds if price doesn't close below zone
                        if candle['close'] >= ob.zone_low:
                            ob.held = True
                        else:
                            ob.invalidated = True
                            break
                    else:
                        # Bearish OB holds if price doesn't close above zone
                        if candle['close'] <= ob.zone_high:
                            ob.held = True
                        else:
                            ob.invalidated = True
                            break
    
    def detect_fair_value_gaps(
        self,
        df: pd.DataFrame,
        lookback: int = 100
    ) -> List[FairValueGap]:
        """
        Detect Fair Value Gaps (imbalances)
        
        FVG = Gap between candle 1 high/low and candle 3 low/high
        Indicates institutional fast move leaving unfilled orders
        
        Args:
            df: OHLCV dataframe
            lookback: Candles to analyze
            
        Returns:
            List of FVGs
        """
        fvgs = []
        recent_data = df.tail(lookback).copy()
        
        for i in range(2, len(recent_data)):
            candle_1 = recent_data.iloc[i-2]
            candle_2 = recent_data.iloc[i-1]  # Middle candle (the impulse)
            candle_3 = recent_data.iloc[i]
            
            # Bullish FVG: Gap between candle 1 high and candle 3 low
            if candle_1['high'] < candle_3['low']:
                # Verify candle 2 is a strong bullish impulse
                if candle_2['close'] > candle_2['open']:
                    fvg = FairValueGap(
                        start_index=i-2,
                        end_index=i,
                        gap_high=candle_3['low'],
                        gap_low=candle_1['high'],
                        direction="bullish"
                    )
                    
                    # Check if already filled by subsequent candles
                    future = recent_data.iloc[i+1:]
                    for _, future_candle in future.iterrows():
                        fvg.check_fill(future_candle['low'], future_candle['high'])
                        if fvg.filled:
                            break
                    
                    fvgs.append(fvg)
            
            # Bearish FVG: Gap between candle 1 low and candle 3 high
            elif candle_1['low'] > candle_3['high']:
                if candle_2['close'] < candle_2['open']:
                    fvg = FairValueGap(
                        start_index=i-2,
                        end_index=i,
                        gap_high=candle_1['low'],
                        gap_low=candle_3['high'],
                        direction="bearish"
                    )
                    
                    future = recent_data.iloc[i+1:]
                    for _, future_candle in future.iterrows():
                        fvg.check_fill(future_candle['low'], future_candle['high'])
                        if fvg.filled:
                            break
                    
                    fvgs.append(fvg)
        
        return fvgs
    
    def detect_liquidity_sweeps(
        self,
        df: pd.DataFrame,
        lookback: int = 50
    ) -> List[LiquiditySweep]:
        """
        Detect liquidity sweeps (stop hunts)
        
        Characteristics:
        1. Price breaks recent high/low (hunts stops)
        2. Long wick above/below (rejection)
        3. Strong reversal candle
        
        Args:
            df: OHLCV dataframe
            lookback: Candles to analyze
            
        Returns:
            List of liquidity sweeps
        """
        sweeps = []
        recent_data = df.tail(lookback).copy()
        
        # Calculate recent highs and lows (swing points)
        recent_data['swing_high'] = recent_data['high'].rolling(window=5, center=True).max()
        recent_data['swing_low'] = recent_data['low'].rolling(window=5, center=True).min()
        
        for i in range(10, len(recent_data) - 2):
            current = recent_data.iloc[i]
            previous = recent_data.iloc[:i]
            next_candles = recent_data.iloc[i+1:i+4]
            
            if len(next_candles) < 2:
                continue
            
            # Buy-side liquidity sweep (above resistance)
            recent_high = previous['high'].tail(20).max()
            if current['high'] > recent_high:
                # Check for rejection (long upper wick)
                body = abs(current['close'] - current['open'])
                upper_wick = current['high'] - max(current['open'], current['close'])
                
                if upper_wick > body * 1.5:  # Wick > 1.5x body
                    # Check for bearish reversal
                    bearish_next = (next_candles['close'] < next_candles['open']).sum()
                    
                    if bearish_next >= 2:
                        sweep = LiquiditySweep(
                            type=LiquidityType.BUY_SIDE,
                            sweep_index=i,
                            level_swept=current['high'],
                            reversal_confirmed=True,
                            reversal_index=i+2,
                            strength=min(upper_wick / body, 3.0) / 3.0  # Normalize to 0-1
                        )
                        sweeps.append(sweep)
            
            # Sell-side liquidity sweep (below support)
            recent_low = previous['low'].tail(20).min()
            if current['low'] < recent_low:
                body = abs(current['close'] - current['open'])
                lower_wick = min(current['open'], current['close']) - current['low']
                
                if lower_wick > body * 1.5:
                    bullish_next = (next_candles['close'] > next_candles['open']).sum()
                    
                    if bullish_next >= 2:
                        sweep = LiquiditySweep(
                            type=LiquidityType.SELL_SIDE,
                            sweep_index=i,
                            level_swept=current['low'],
                            reversal_confirmed=True,
                            reversal_index=i+2,
                            strength=min(lower_wick / body, 3.0) / 3.0
                        )
                        sweeps.append(sweep)
        
        return sweeps
    
    def detect_break_of_structure(
        self,
        df: pd.DataFrame,
        lookback: int = 100
    ) -> List[BreakOfStructure]:
        """
        Detect Break of Structure (BOS) - trend continuation
        
        BOS in uptrend: Price makes higher high
        BOS in downtrend: Price makes lower low
        
        Args:
            df: OHLCV dataframe
            lookback: Candles to analyze
            
        Returns:
            List of BOS events
        """
        bos_events = []
        recent_data = df.tail(lookback).copy()
        
        # Identify swing highs and lows
        swing_highs = []
        swing_lows = []
        
        for i in range(5, len(recent_data) - 5):
            current_high = recent_data.iloc[i]['high']
            current_low = recent_data.iloc[i]['low']
            
            # Swing high: Higher than 5 candles before and after
            window = recent_data.iloc[i-5:i+6]
            if current_high == window['high'].max():
                swing_highs.append((i, current_high))
                
            # Swing low: Lower than 5 candles before and after
            if current_low == window['low'].min():
                swing_lows.append((i, current_low))
        
        # Detect BOS in highs
        for i in range(1, len(swing_highs)):
            prev_idx, prev_high = swing_highs[i-1]
            curr_idx, curr_high = swing_highs[i]
            
            if curr_high > prev_high:
                bos = BreakOfStructure(
                    type=StructureType.HIGHER_HIGH,
                    break_index=curr_idx,
                    previous_extreme=prev_high,
                    new_extreme=curr_high,
                    confirmed=True
                )
                bos_events.append(bos)
        
        # Detect BOS in lows
        for i in range(1, len(swing_lows)):
            prev_idx, prev_low = swing_lows[i-1]
            curr_idx, curr_low = swing_lows[i]
            
            if curr_low < prev_low:
                bos = BreakOfStructure(
                    type=StructureType.LOWER_LOW,
                    break_index=curr_idx,
                    previous_extreme=prev_low,
                    new_extreme=curr_low,
                    confirmed=True
                )
                bos_events.append(bos)
        
        return bos_events
    
    def detect_change_of_character(
        self,
        df: pd.DataFrame,
        lookback: int = 100
    ) -> List[ChangeOfCharacter]:
        """
        Detect Change of Character (CHoCH) - potential reversal
        
        CHoCH = Break of structure AGAINST the trend
        In uptrend: Break of higher low (HL) indicates potential reversal
        In downtrend: Break of lower high (LH) indicates potential reversal
        
        Args:
            df: OHLCV dataframe
            lookback: Candles to analyze
            
        Returns:
            List of CHoCH events
        """
        choch_events = []
        recent_data = df.tail(lookback).copy()
        
        # First, determine current trend by analyzing structure
        swing_highs = []
        swing_lows = []
        
        for i in range(5, len(recent_data) - 5):
            window = recent_data.iloc[i-5:i+6]
            if recent_data.iloc[i]['high'] == window['high'].max():
                swing_highs.append((i, recent_data.iloc[i]['high']))
            if recent_data.iloc[i]['low'] == window['low'].min():
                swing_lows.append((i, recent_data.iloc[i]['low']))
        
        # Detect CHoCH (break of internal structure)
        # In uptrend: Price breaks below previous higher low
        if len(swing_lows) >= 2:
            for i in range(1, len(swing_lows)):
                prev_idx, prev_low = swing_lows[i-1]
                curr_idx, curr_low = swing_lows[i]
                
                # If previous low was higher (uptrend), and current breaks it = CHoCH
                if prev_low > swing_lows[0][1]:  # Was in uptrend
                    if curr_low < prev_low:  # Break of higher low
                        choch = ChangeOfCharacter(
                            break_index=curr_idx,
                            previous_trend="bullish",
                            broken_level=prev_low,
                            reversal_confirmed=True
                        )
                        choch_events.append(choch)
        
        # In downtrend: Price breaks above previous lower high
        if len(swing_highs) >= 2:
            for i in range(1, len(swing_highs)):
                prev_idx, prev_high = swing_highs[i-1]
                curr_idx, curr_high = swing_highs[i]
                
                # If previous high was lower (downtrend), and current breaks it = CHoCH
                if prev_high < swing_highs[0][1]:  # Was in downtrend
                    if curr_high > prev_high:  # Break of lower high
                        choch = ChangeOfCharacter(
                            break_index=curr_idx,
                            previous_trend="bearish",
                            broken_level=prev_high,
                            reversal_confirmed=True
                        )
                        choch_events.append(choch)
        
        return choch_events
    
    def calculate_optimal_trade_entry(
        self,
        df: pd.DataFrame,
        swing_high: float,
        swing_low: float
    ) -> Dict[str, float]:
        """
        Calculate Optimal Trade Entry (OTE) zones
        
        OTE is the 0.618-0.79 Fibonacci retracement of the swing
        This is where smart money typically enters after a pullback
        
        Args:
            df: OHLCV dataframe
            swing_high: Recent swing high
            swing_low: Recent swing low
            
        Returns:
            Dictionary with OTE levels
        """
        swing_range = swing_high - swing_low
        
        # Fibonacci levels
        fib_236 = swing_low + (swing_range * 0.236)
        fib_382 = swing_low + (swing_range * 0.382)
        fib_50 = swing_low + (swing_range * 0.5)
        fib_618 = swing_low + (swing_range * 0.618)
        fib_786 = swing_low + (swing_range * 0.786)
        
        return {
            'swing_high': swing_high,
            'swing_low': swing_low,
            'fib_0.236': fib_236,
            'fib_0.382': fib_382,
            'fib_0.5': fib_50,
            'ote_entry_zone_low': fib_618,  # Ideal entry zone starts here
            'ote_entry_zone_high': fib_786,  # Ideal entry zone ends here
            'optimal_entry': (fib_618 + fib_786) / 2  # Middle of OTE zone
        }


__all__ = [
    'OrderBlockType',
    'LiquidityType',
    'StructureType',
    'OrderBlock',
    'FairValueGap',
    'LiquiditySweep',
    'BreakOfStructure',
    'ChangeOfCharacter',
    'SMCDetector'
]
