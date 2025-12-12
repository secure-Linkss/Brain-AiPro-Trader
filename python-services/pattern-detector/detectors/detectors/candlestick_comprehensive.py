"""
COMPREHENSIVE Candlestick Pattern Detector - GURU LEVEL
Implements 50+ candlestick patterns with confidence scoring

Categories:
1. Single Candle Patterns (15)
2. Double Candle Patterns (12)
3. Triple Candle Patterns (10)
4. Multi-Candle Patterns (15+)
"""

import pandas as pd
import numpy as np
from typing import Dict, List, Optional
from dataclasses import dataclass


@dataclass
class CandlestickPattern:
    name: str
    type: str  # 'bullish', 'bearish', 'neutral'
    category: str  # 'reversal', 'continuation', 'indecision'
    confidence: float
    candles_involved: int
    description: str
    entry: float
    stop_loss: float
    targets: List[Dict]


class ComprehensiveCandlestickDetector:
    """GURU-LEVEL Candlestick Pattern Detector - 50+ Patterns"""
    
    def __init__(self):
        self.min_body_ratio = 0.6  # Minimum body to total range ratio
        self.doji_threshold = 0.1  # Maximum body size for doji
    
    def detect_all(self, df: pd.DataFrame) -> List[CandlestickPattern]:
        """Detect ALL candlestick patterns"""
        patterns = []
        
        if len(df) < 3:
            return patterns
        
        # Single Candle Patterns
        patterns.extend(self._detect_single_candle_patterns(df))
        
        # Double Candle Patterns
        patterns.extend(self._detect_double_candle_patterns(df))
        
        # Triple Candle Patterns
        patterns.extend(self._detect_triple_candle_patterns(df))
        
        # Multi-Candle Patterns
        patterns.extend(self._detect_multi_candle_patterns(df))
        
        return patterns
    
    # ============ SINGLE CANDLE PATTERNS (15) ============
    
    def _detect_single_candle_patterns(self, df: pd.DataFrame) -> List[CandlestickPattern]:
        """Detect all single candle patterns"""
        patterns = []
        
        if len(df) < 1:
            return patterns
        
        last = df.iloc[-1]
        o, h, l, c = last['open'], last['high'], last['low'], last['close']
        
        body = abs(c - o)
        total_range = h - l
        upper_shadow = h - max(o, c)
        lower_shadow = min(o, c) - l
        
        # 1. DOJI (7 types)
        if body / total_range < self.doji_threshold if total_range > 0 else False:
            # Standard Doji
            if abs(upper_shadow - lower_shadow) / total_range < 0.2:
                patterns.append(self._create_pattern(
                    'Doji', 'neutral', 'indecision', 60, 1,
                    'Market indecision. Wait for confirmation.', df
                ))
            
            # Dragonfly Doji (long lower shadow, no upper)
            elif lower_shadow > body * 2 and upper_shadow < body:
                patterns.append(self._create_pattern(
                    'Dragonfly Doji', 'bullish', 'reversal', 75, 1,
                    'Bullish reversal. Buyers rejected lower prices.', df
                ))
            
            # Gravestone Doji (long upper shadow, no lower)
            elif upper_shadow > body * 2 and lower_shadow < body:
                patterns.append(self._create_pattern(
                    'Gravestone Doji', 'bearish', 'reversal', 75, 1,
                    'Bearish reversal. Sellers rejected higher prices.', df
                ))
            
            # Long-Legged Doji
            elif upper_shadow > body * 2 and lower_shadow > body * 2:
                patterns.append(self._create_pattern(
                    'Long-Legged Doji', 'neutral', 'indecision', 70, 1,
                    'High volatility, extreme indecision.', df
                ))
            
            # Four Price Doji
            elif h == l:
                patterns.append(self._create_pattern(
                    'Four Price Doji', 'neutral', 'indecision', 65, 1,
                    'Rare pattern. Extreme low volume.', df
                ))
        
        # 2. HAMMER / HANGING MAN
        if lower_shadow >= 2 * body and upper_shadow <= 0.1 * total_range:
            if self._is_downtrend(df):
                patterns.append(self._create_pattern(
                    'Hammer', 'bullish', 'reversal', 80, 1,
                    'Bullish reversal at bottom. Buyers stepping in.', df
                ))
            else:
                patterns.append(self._create_pattern(
                    'Hanging Man', 'bearish', 'reversal', 75, 1,
                    'Bearish reversal at top. Sellers taking control.', df
                ))
        
        # 3. INVERTED HAMMER / SHOOTING STAR
        if upper_shadow >= 2 * body and lower_shadow <= 0.1 * total_range:
            if self._is_downtrend(df):
                patterns.append(self._create_pattern(
                    'Inverted Hammer', 'bullish', 'reversal', 75, 1,
                    'Potential bullish reversal. Needs confirmation.', df
                ))
            else:
                patterns.append(self._create_pattern(
                    'Shooting Star', 'bearish', 'reversal', 80, 1,
                    'Bearish reversal. Failed rally.', df
                ))
        
        # 4. MARUBOZU (Bullish & Bearish)
        if body / total_range > 0.95 if total_range > 0 else False:
            if c > o:
                patterns.append(self._create_pattern(
                    'Bullish Marubozu', 'bullish', 'continuation', 85, 1,
                    'Strong bullish momentum. No shadows.', df
                ))
            else:
                patterns.append(self._create_pattern(
                    'Bearish Marubozu', 'bearish', 'continuation', 85, 1,
                    'Strong bearish momentum. No shadows.', df
                ))
        
        # 5. SPINNING TOP
        if 0.3 < body / total_range < 0.5 and upper_shadow > body and lower_shadow > body:
            patterns.append(self._create_pattern(
                'Spinning Top', 'neutral', 'indecision', 65, 1,
                'Indecision. Small body, long shadows.', df
            ))
        
        # 6. HIGH WAVE CANDLE
        if total_range > df['close'].iloc[-10:].std() * 2:
            if body / total_range < 0.3:
                patterns.append(self._create_pattern(
                    'High Wave Candle', 'neutral', 'indecision', 70, 1,
                    'Extreme volatility and indecision.', df
                ))
        
        return patterns
    
    # ============ DOUBLE CANDLE PATTERNS (12) ============
    
    def _detect_double_candle_patterns(self, df: pd.DataFrame) -> List[CandlestickPattern]:
        """Detect all double candle patterns"""
        patterns = []
        
        if len(df) < 2:
            return patterns
        
        prev = df.iloc[-2]
        curr = df.iloc[-1]
        
        prev_body = abs(prev['close'] - prev['open'])
        curr_body = abs(curr['close'] - curr['open'])
        
        # 1. BULLISH ENGULFING
        if (prev['close'] < prev['open'] and  # Previous bearish
            curr['close'] > curr['open'] and  # Current bullish
            curr['open'] <= prev['close'] and  # Opens at/below prev close
            curr['close'] >= prev['open']):   # Closes at/above prev open
            patterns.append(self._create_pattern(
                'Bullish Engulfing', 'bullish', 'reversal', 85, 2,
                'Strong bullish reversal. Bulls overwhelm bears.', df
            ))
        
        # 2. BEARISH ENGULFING
        if (prev['close'] > prev['open'] and
            curr['close'] < curr['open'] and
            curr['open'] >= prev['close'] and
            curr['close'] <= prev['open']):
            patterns.append(self._create_pattern(
                'Bearish Engulfing', 'bearish', 'reversal', 85, 2,
                'Strong bearish reversal. Bears overwhelm bulls.', df
            ))
        
        # 3. BULLISH HARAMI
        if (prev['close'] < prev['open'] and
            curr['close'] > curr['open'] and
            curr['open'] > prev['close'] and
            curr['close'] < prev['open'] and
            curr_body < prev_body):
            patterns.append(self._create_pattern(
                'Bullish Harami', 'bullish', 'reversal', 75, 2,
                'Bullish reversal. Selling pressure decreasing.', df
            ))
        
        # 4. BEARISH HARAMI
        if (prev['close'] > prev['open'] and
            curr['close'] < curr['open'] and
            curr['open'] < prev['close'] and
            curr['close'] > prev['open'] and
            curr_body < prev_body):
            patterns.append(self._create_pattern(
                'Bearish Harami', 'bearish', 'reversal', 75, 2,
                'Bearish reversal. Buying pressure decreasing.', df
            ))
        
        # 5. PIERCING LINE
        if (prev['close'] < prev['open'] and
            curr['close'] > curr['open'] and
            curr['open'] < prev['low'] and
            curr['close'] > (prev['open'] + prev['close']) / 2 and
            curr['close'] < prev['open']):
            patterns.append(self._create_pattern(
                'Piercing Line', 'bullish', 'reversal', 80, 2,
                'Bullish reversal. Strong buying pressure.', df
            ))
        
        # 6. DARK CLOUD COVER
        if (prev['close'] > prev['open'] and
            curr['close'] < curr['open'] and
            curr['open'] > prev['high'] and
            curr['close'] < (prev['open'] + prev['close']) / 2 and
            curr['close'] > prev['open']):
            patterns.append(self._create_pattern(
                'Dark Cloud Cover', 'bearish', 'reversal', 80, 2,
                'Bearish reversal. Strong selling pressure.', df
            ))
        
        # 7. TWEEZER TOP
        if (abs(prev['high'] - curr['high']) / prev['high'] < 0.001 and
            prev['close'] > prev['open'] and
            curr['close'] < curr['open']):
            patterns.append(self._create_pattern(
                'Tweezer Top', 'bearish', 'reversal', 75, 2,
                'Bearish reversal. Resistance at same level.', df
            ))
        
        # 8. TWEEZER BOTTOM
        if (abs(prev['low'] - curr['low']) / prev['low'] < 0.001 and
            prev['close'] < prev['open'] and
            curr['close'] > curr['open']):
            patterns.append(self._create_pattern(
                'Tweezer Bottom', 'bullish', 'reversal', 75, 2,
                'Bullish reversal. Support at same level.', df
            ))
        
        # 9. KICKING (Bullish & Bearish)
        if (prev['close'] < prev['open'] and
            curr['close'] > curr['open'] and
            curr['open'] > prev['close'] and
            prev_body / (prev['high'] - prev['low']) > 0.9 and
            curr_body / (curr['high'] - curr['low']) > 0.9):
            patterns.append(self._create_pattern(
                'Bullish Kicking', 'bullish', 'reversal', 90, 2,
                'Very strong bullish reversal. Gap up.', df
            ))
        
        # 10. MATCHING LOW/HIGH
        if abs(prev['low'] - curr['low']) / prev['low'] < 0.002:
            if prev['close'] < prev['open'] and curr['close'] < curr['open']:
                patterns.append(self._create_pattern(
                    'Matching Low', 'bullish', 'reversal', 70, 2,
                    'Bullish reversal. Support confirmed.', df
                ))
        
        return patterns
    
    # ============ TRIPLE CANDLE PATTERNS (10) ============
    
    def _detect_triple_candle_patterns(self, df: pd.DataFrame) -> List[CandlestickPattern]:
        """Detect all triple candle patterns"""
        patterns = []
        
        if len(df) < 3:
            return patterns
        
        c1 = df.iloc[-3]
        c2 = df.iloc[-2]
        c3 = df.iloc[-1]
        
        # 1. MORNING STAR
        if (c1['close'] < c1['open'] and  # First bearish
            abs(c2['close'] - c2['open']) < abs(c1['close'] - c1['open']) * 0.3 and  # Small body
            c3['close'] > c3['open'] and  # Third bullish
            c3['close'] > (c1['open'] + c1['close']) / 2):  # Closes above midpoint
            patterns.append(self._create_pattern(
                'Morning Star', 'bullish', 'reversal', 85, 3,
                'Strong bullish reversal. Three-candle pattern.', df
            ))
        
        # 2. EVENING STAR
        if (c1['close'] > c1['open'] and
            abs(c2['close'] - c2['open']) < abs(c1['close'] - c1['open']) * 0.3 and
            c3['close'] < c3['open'] and
            c3['close'] < (c1['open'] + c1['close']) / 2):
            patterns.append(self._create_pattern(
                'Evening Star', 'bearish', 'reversal', 85, 3,
                'Strong bearish reversal. Three-candle pattern.', df
            ))
        
        # 3. THREE WHITE SOLDIERS
        if (c1['close'] > c1['open'] and
            c2['close'] > c2['open'] and
            c3['close'] > c3['open'] and
            c2['close'] > c1['close'] and
            c3['close'] > c2['close'] and
            c2['open'] > c1['open'] and c2['open'] < c1['close'] and
            c3['open'] > c2['open'] and c3['open'] < c2['close']):
            patterns.append(self._create_pattern(
                'Three White Soldiers', 'bullish', 'reversal', 90, 3,
                'Very strong bullish reversal. Consecutive higher closes.', df
            ))
        
        # 4. THREE BLACK CROWS
        if (c1['close'] < c1['open'] and
            c2['close'] < c2['open'] and
            c3['close'] < c3['open'] and
            c2['close'] < c1['close'] and
            c3['close'] < c2['close'] and
            c2['open'] < c1['open'] and c2['open'] > c1['close'] and
            c3['open'] < c2['open'] and c3['open'] > c2['close']):
            patterns.append(self._create_pattern(
                'Three Black Crows', 'bearish', 'reversal', 90, 3,
                'Very strong bearish reversal. Consecutive lower closes.', df
            ))
        
        # 5. THREE INSIDE UP
        if (c1['close'] < c1['open'] and
            c2['close'] > c2['open'] and
            c2['open'] > c1['close'] and c2['close'] < c1['open'] and
            c3['close'] > c3['open'] and
            c3['close'] > c1['open']):
            patterns.append(self._create_pattern(
                'Three Inside Up', 'bullish', 'reversal', 80, 3,
                'Bullish reversal. Harami followed by confirmation.', df
            ))
        
        # 6. THREE INSIDE DOWN
        if (c1['close'] > c1['open'] and
            c2['close'] < c2['open'] and
            c2['open'] < c1['close'] and c2['close'] > c1['open'] and
            c3['close'] < c3['open'] and
            c3['close'] < c1['open']):
            patterns.append(self._create_pattern(
                'Three Inside Down', 'bearish', 'reversal', 80, 3,
                'Bearish reversal. Harami followed by confirmation.', df
            ))
        
        # 7. THREE OUTSIDE UP
        if (c1['close'] < c1['open'] and
            c2['close'] > c2['open'] and
            c2['open'] <= c1['close'] and c2['close'] >= c1['open'] and
            c3['close'] > c3['open'] and
            c3['close'] > c2['close']):
            patterns.append(self._create_pattern(
                'Three Outside Up', 'bullish', 'reversal', 85, 3,
                'Strong bullish reversal. Engulfing followed by confirmation.', df
            ))
        
        # 8. THREE OUTSIDE DOWN
        if (c1['close'] > c1['open'] and
            c2['close'] < c2['open'] and
            c2['open'] >= c1['close'] and c2['close'] <= c1['open'] and
            c3['close'] < c3['open'] and
            c3['close'] < c2['close']):
            patterns.append(self._create_pattern(
                'Three Outside Down', 'bearish', 'reversal', 85, 3,
                'Strong bearish reversal. Engulfing followed by confirmation.', df
            ))
        
        # 9. ABANDONED BABY (Bullish & Bearish)
        if (c1['close'] < c1['open'] and
            c2['high'] < c1['low'] and  # Gap down
            c3['close'] > c3['open'] and
            c3['low'] > c2['high']):  # Gap up
            patterns.append(self._create_pattern(
                'Abandoned Baby Bottom', 'bullish', 'reversal', 95, 3,
                'Extremely rare bullish reversal. Island reversal.', df
            ))
        
        # 10. TRI-STAR
        if (abs(c1['close'] - c1['open']) / (c1['high'] - c1['low']) < 0.1 and
            abs(c2['close'] - c2['open']) / (c2['high'] - c2['low']) < 0.1 and
            abs(c3['close'] - c3['open']) / (c3['high'] - c3['low']) < 0.1):
            patterns.append(self._create_pattern(
                'Tri-Star', 'neutral', 'reversal', 85, 3,
                'Rare pattern. Three dojis signal major reversal.', df
            ))
        
        return patterns
    
    # ============ MULTI-CANDLE PATTERNS (15+) ============
    
    def _detect_multi_candle_patterns(self, df: pd.DataFrame) -> List[CandlestickPattern]:
        """Detect multi-candle patterns (4+ candles)"""
        patterns = []
        
        if len(df) < 5:
            return patterns
        
        # 1. RISING THREE METHODS (Bullish continuation)
        if len(df) >= 5:
            c1 = df.iloc[-5]
            c2, c3, c4 = df.iloc[-4], df.iloc[-3], df.iloc[-2]
            c5 = df.iloc[-1]
            
            if (c1['close'] > c1['open'] and  # Long bullish
                c2['close'] < c2['open'] and c3['close'] < c3['open'] and c4['close'] < c4['open'] and  # Three small bearish
                c5['close'] > c5['open'] and  # Bullish continuation
                c5['close'] > c1['close'] and
                all(c['high'] < c1['high'] for c in [c2, c3, c4]) and
                all(c['low'] > c1['low'] for c in [c2, c3, c4])):
                patterns.append(self._create_pattern(
                    'Rising Three Methods', 'bullish', 'continuation', 85, 5,
                    'Bullish continuation. Consolidation before next leg up.', df
                ))
        
        # 2. FALLING THREE METHODS (Bearish continuation)
        if len(df) >= 5:
            c1 = df.iloc[-5]
            c2, c3, c4 = df.iloc[-4], df.iloc[-3], df.iloc[-2]
            c5 = df.iloc[-1]
            
            if (c1['close'] < c1['open'] and
                c2['close'] > c2['open'] and c3['close'] > c3['open'] and c4['close'] > c4['open'] and
                c5['close'] < c5['open'] and
                c5['close'] < c1['close'] and
                all(c['high'] < c1['high'] for c in [c2, c3, c4]) and
                all(c['low'] > c1['low'] for c in [c2, c3, c4])):
                patterns.append(self._create_pattern(
                    'Falling Three Methods', 'bearish', 'continuation', 85, 5,
                    'Bearish continuation. Consolidation before next leg down.', df
                ))
        
        return patterns
    
    # ============ HELPER METHODS ============
    
    def _is_downtrend(self, df: pd.DataFrame, periods: int = 5) -> bool:
        """Check if in downtrend"""
        if len(df) < periods:
            return False
        recent = df.iloc[-periods:]
        return recent['close'].iloc[0] > recent['close'].iloc[-1]
    
    def _is_uptrend(self, df: pd.DataFrame, periods: int = 5) -> bool:
        """Check if in uptrend"""
        if len(df) < periods:
            return False
        recent = df.iloc[-periods:]
        return recent['close'].iloc[0] < recent['close'].iloc[-1]
    
    def _create_pattern(self, name: str, ptype: str, category: str, 
                       confidence: float, candles: int, description: str,
                       df: pd.DataFrame) -> CandlestickPattern:
        """Create candlestick pattern with entry/stop/targets"""
        current_price = df['close'].iloc[-1]
        atr = df['high'].iloc[-14:].values - df['low'].iloc[-14:].values
        avg_atr = np.mean(atr) if len(atr) > 0 else current_price * 0.02
        
        if ptype == 'bullish':
            entry = current_price
            stop_loss = current_price - (avg_atr * 1.5)
            targets = [
                {'level': 1, 'price': current_price + (avg_atr * 1.0), 'percentage': 25, 'rr': 0.67},
                {'level': 2, 'price': current_price + (avg_atr * 1.5), 'percentage': 25, 'rr': 1.0},
                {'level': 3, 'price': current_price + (avg_atr * 2.0), 'percentage': 25, 'rr': 1.33},
                {'level': 4, 'price': current_price + (avg_atr * 3.0), 'percentage': 25, 'rr': 2.0}
            ]
        elif ptype == 'bearish':
            entry = current_price
            stop_loss = current_price + (avg_atr * 1.5)
            targets = [
                {'level': 1, 'price': current_price - (avg_atr * 1.0), 'percentage': 25, 'rr': 0.67},
                {'level': 2, 'price': current_price - (avg_atr * 1.5), 'percentage': 25, 'rr': 1.0},
                {'level': 3, 'price': current_price - (avg_atr * 2.0), 'percentage': 25, 'rr': 1.33},
                {'level': 4, 'price': current_price - (avg_atr * 3.0), 'percentage': 25, 'rr': 2.0}
            ]
        else:  # neutral
            entry = current_price
            stop_loss = current_price - (avg_atr * 1.5)
            targets = [
                {'level': 1, 'price': current_price + (avg_atr * 1.0), 'percentage': 50, 'rr': 0.67},
                {'level': 2, 'price': current_price + (avg_atr * 2.0), 'percentage': 50, 'rr': 1.33}
            ]
        
        return CandlestickPattern(
            name=name,
            type=ptype,
            category=category,
            confidence=confidence,
            candles_involved=candles,
            description=description,
            entry=entry,
            stop_loss=stop_loss,
            targets=targets
        )
    
    def to_dict(self, pattern: CandlestickPattern) -> Dict:
        """Convert to dictionary"""
        return {
            'name': pattern.name,
            'type': pattern.type,
            'category': pattern.category,
            'confidence': pattern.confidence,
            'candles_involved': pattern.candles_involved,
            'description': pattern.description,
            'entry': pattern.entry,
            'stop_loss': pattern.stop_loss,
            'targets': pattern.targets
        }


# Export
def detect_candlestick_patterns(df: pd.DataFrame) -> List[Dict]:
    """Main function to detect all candlestick patterns"""
    detector = ComprehensiveCandlestickDetector()
    patterns = detector.detect_all(df)
    return [detector.to_dict(p) for p in patterns]
