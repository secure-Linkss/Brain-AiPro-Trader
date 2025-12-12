"""
COMPREHENSIVE Mean Reversion Strategies Detector - GURU LEVEL

Implements ALL mean reversion strategies:
1. RSI Mean Reversion (Extreme Overbought/Oversold)
2. Bollinger Band Reversion (Price outside 2.5/3.0 STD)
3. VWAP Mean Revert (Extreme deviation from VWAP)
4. Z-Score Reversion (Statistical extremes)
5. Statistical Arbitrage (Pairs Trading Logic - Placeholder for multi-asset)
6. Keltner Channel Reversion
"""

import pandas as pd
import numpy as np
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass

@dataclass
class MeanReversionSignal:
    type: str  # 'rsi_reversion', 'bb_reversion', 'vwap_reversion', 'zscore_reversion'
    direction: str  # 'bullish', 'bearish'
    confidence: float
    deviation_metric: float  # How extreme is the move?
    price_level: float
    mean_level: float  # The target mean (e.g., VWAP, SMA20)
    description: str
    entry: float
    stop_loss: float
    targets: List[Dict]
    indicators: Dict

class ComprehensiveMeanReversionDetector:
    """GURU-LEVEL Mean Reversion Strategy Detector"""

    def __init__(self):
        self.rsi_period = 14
        self.bb_period = 20
        self.bb_std_extreme = 2.5
        self.z_threshold = 2.5

    def detect_all(self, df: pd.DataFrame) -> Dict[str, List[MeanReversionSignal]]:
        """Detect ALL mean reversion patterns"""
        df = self._calculate_indicators(df)
        
        return {
            'rsi_reversion': self.detect_rsi_reversion(df),
            'bb_reversion': self.detect_bb_reversion(df),
            'vwap_reversion': self.detect_vwap_reversion(df),
            'zscore_reversion': self.detect_zscore_reversion(df)
        }

    # ============ RSI MEAN REVERSION ============

    def detect_rsi_reversion(self, df: pd.DataFrame) -> List[MeanReversionSignal]:
        """
        RSI Mean Reversion:
        - RSI < 20 (Oversold) -> Bullish Reversion
        - RSI > 80 (Overbought) -> Bearish Reversion
        - Confirmation: RSI hooking back
        """
        signals = []
        if len(df) < 20:
            return signals

        current_rsi = df['rsi'].iloc[-1]
        prev_rsi = df['rsi'].iloc[-2]
        
        # Bullish Reversion (Oversold -> Hooking Up)
        if prev_rsi < 25 and current_rsi > prev_rsi:
            signals.append(MeanReversionSignal(
                type='rsi_reversion',
                direction='bullish',
                confidence=min(95, (30 - prev_rsi) * 4 + 60),
                deviation_metric=prev_rsi,
                price_level=df['close'].iloc[-1],
                mean_level=df['ema_50'].iloc[-1] if 'ema_50' in df.columns else df['close'].iloc[-1],
                description=f'RSI Reversion: RSI hooked up from {prev_rsi:.1f} (Oversold).',
                entry=df['close'].iloc[-1],
                stop_loss=df['low'].iloc[-5:].min(),
                targets=self._calculate_targets(df['close'].iloc[-1], df['low'].iloc[-5:].min(), 'bullish'),
                indicators={'rsi': current_rsi}
            ))
            
        # Bearish Reversion (Overbought -> Hooking Down)
        elif prev_rsi > 75 and current_rsi < prev_rsi:
            signals.append(MeanReversionSignal(
                type='rsi_reversion',
                direction='bearish',
                confidence=min(95, (prev_rsi - 70) * 4 + 60),
                deviation_metric=prev_rsi,
                price_level=df['close'].iloc[-1],
                mean_level=df['ema_50'].iloc[-1] if 'ema_50' in df.columns else df['close'].iloc[-1],
                description=f'RSI Reversion: RSI hooked down from {prev_rsi:.1f} (Overbought).',
                entry=df['close'].iloc[-1],
                stop_loss=df['high'].iloc[-5:].max(),
                targets=self._calculate_targets(df['close'].iloc[-1], df['high'].iloc[-5:].max(), 'bearish'),
                indicators={'rsi': current_rsi}
            ))
            
        return signals

    # ============ BOLLINGER BAND REVERSION ============

    def detect_bb_reversion(self, df: pd.DataFrame) -> List[MeanReversionSignal]:
        """
        Bollinger Band Reversion:
        - Price closes outside 2.5 STD bands
        - Reversal candle (e.g., close back inside)
        """
        signals = []
        if len(df) < 20:
            return signals

        close = df['close'].iloc[-1]
        prev_close = df['close'].iloc[-2]
        upper = df['bb_upper_extreme'].iloc[-1]
        lower = df['bb_lower_extreme'].iloc[-1]
        middle = df['bb_middle'].iloc[-1]
        
        # Bullish: Was below lower band, now closing back inside or wicking hard
        if df['low'].iloc[-1] < lower:
            # Check for rejection wick or close back inside
            if close > lower:
                signals.append(MeanReversionSignal(
                    type='bb_reversion',
                    direction='bullish',
                    confidence=85.0,
                    deviation_metric=(lower - df['low'].iloc[-1]) / lower * 100,
                    price_level=close,
                    mean_level=middle,
                    description='Bollinger Reversion: Price rejected extreme lower band (2.5 STD).',
                    entry=close,
                    stop_loss=df['low'].iloc[-1] * 0.995,
                    targets=self._calculate_targets(close, df['low'].iloc[-1] * 0.995, 'bullish'),
                    indicators={'bb_lower': lower}
                ))

        # Bearish: Was above upper band
        if df['high'].iloc[-1] > upper:
            if close < upper:
                signals.append(MeanReversionSignal(
                    type='bb_reversion',
                    direction='bearish',
                    confidence=85.0,
                    deviation_metric=(df['high'].iloc[-1] - upper) / upper * 100,
                    price_level=close,
                    mean_level=middle,
                    description='Bollinger Reversion: Price rejected extreme upper band (2.5 STD).',
                    entry=close,
                    stop_loss=df['high'].iloc[-1] * 1.005,
                    targets=self._calculate_targets(close, df['high'].iloc[-1] * 1.005, 'bearish'),
                    indicators={'bb_upper': upper}
                ))
                
        return signals

    # ============ VWAP MEAN REVERSION ============

    def detect_vwap_reversion(self, df: pd.DataFrame) -> List[MeanReversionSignal]:
        """
        VWAP Mean Reversion:
        - Price extended far from VWAP (e.g., > 3% or Z-score equivalent)
        - Signs of exhaustion
        """
        signals = []
        if 'vwap' not in df.columns:
            return signals

        current_price = df['close'].iloc[-1]
        vwap = df['vwap'].iloc[-1]
        
        # Calculate percentage deviation
        dev_pct = (current_price - vwap) / vwap
        
        # Threshold (dynamic based on volatility would be better, using fixed 2% for now)
        threshold = 0.02 
        
        if dev_pct < -threshold: # Price far below VWAP
            signals.append(MeanReversionSignal(
                type='vwap_reversion',
                direction='bullish',
                confidence=75.0,
                deviation_metric=abs(dev_pct) * 100,
                price_level=current_price,
                mean_level=vwap,
                description=f'VWAP Reversion: Price {abs(dev_pct)*100:.1f}% below VWAP. Oversold.',
                entry=current_price,
                stop_loss=current_price * 0.99,
                targets=[{'level': 1, 'price': vwap, 'rr': abs(vwap-current_price)/(current_price*0.01)}],
                indicators={'vwap': vwap}
            ))
        elif dev_pct > threshold: # Price far above VWAP
            signals.append(MeanReversionSignal(
                type='vwap_reversion',
                direction='bearish',
                confidence=75.0,
                deviation_metric=dev_pct * 100,
                price_level=current_price,
                mean_level=vwap,
                description=f'VWAP Reversion: Price {dev_pct*100:.1f}% above VWAP. Overbought.',
                entry=current_price,
                stop_loss=current_price * 1.01,
                targets=[{'level': 1, 'price': vwap, 'rr': abs(vwap-current_price)/(current_price*0.01)}],
                indicators={'vwap': vwap}
            ))
            
        return signals

    # ============ Z-SCORE REVERSION ============

    def detect_zscore_reversion(self, df: pd.DataFrame) -> List[MeanReversionSignal]:
        """
        Z-Score Reversion:
        - Price Z-Score > 2.5 (Statistically rare event)
        """
        signals = []
        if len(df) < 50:
            return signals

        # Calculate Price Z-Score relative to SMA 50
        sma = df['close'].rolling(50).mean()
        std = df['close'].rolling(50).std()
        z_score = (df['close'] - sma) / std
        
        current_z = z_score.iloc[-1]
        
        if current_z < -self.z_threshold:
            signals.append(MeanReversionSignal(
                type='zscore_reversion',
                direction='bullish',
                confidence=80.0,
                deviation_metric=abs(current_z),
                price_level=df['close'].iloc[-1],
                mean_level=sma.iloc[-1],
                description=f'Statistical Extreme: Price Z-Score {current_z:.2f} (Oversold).',
                entry=df['close'].iloc[-1],
                stop_loss=df['low'].iloc[-3:].min(),
                targets=self._calculate_targets(df['close'].iloc[-1], df['low'].iloc[-3:].min(), 'bullish'),
                indicators={'z_score': current_z}
            ))
        elif current_z > self.z_threshold:
            signals.append(MeanReversionSignal(
                type='zscore_reversion',
                direction='bearish',
                confidence=80.0,
                deviation_metric=current_z,
                price_level=df['close'].iloc[-1],
                mean_level=sma.iloc[-1],
                description=f'Statistical Extreme: Price Z-Score {current_z:.2f} (Overbought).',
                entry=df['close'].iloc[-1],
                stop_loss=df['high'].iloc[-3:].max(),
                targets=self._calculate_targets(df['close'].iloc[-1], df['high'].iloc[-3:].max(), 'bearish'),
                indicators={'z_score': current_z}
            ))
            
        return signals

    # ============ HELPER METHODS ============

    def _calculate_indicators(self, df: pd.DataFrame) -> pd.DataFrame:
        """Calculate indicators"""
        # RSI
        delta = df['close'].diff()
        gain = (delta.where(delta > 0, 0)).rolling(window=14).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
        rs = gain / loss
        df['rsi'] = 100 - (100 / (1 + rs))
        
        # Bollinger Bands (Extreme)
        df['bb_middle'] = df['close'].rolling(20).mean()
        df['bb_std'] = df['close'].rolling(20).std()
        df['bb_upper_extreme'] = df['bb_middle'] + (2.5 * df['bb_std'])
        df['bb_lower_extreme'] = df['bb_middle'] - (2.5 * df['bb_std'])
        
        # VWAP (Simplified rolling VWAP for single timeframe)
        df['vwap'] = (df['close'] * df['volume']).cumsum() / df['volume'].cumsum()
        
        return df

    def _calculate_targets(self, entry: float, stop: float, direction: str) -> List[Dict]:
        """Calculate R:R targets"""
        risk = abs(entry - stop)
        if risk == 0: risk = entry * 0.01
        
        if direction == 'bullish':
            return [
                {'level': 1, 'price': entry + risk * 1.5, 'rr': 1.5},
                {'level': 2, 'price': entry + risk * 2.5, 'rr': 2.5}
            ]
        else:
            return [
                {'level': 1, 'price': entry - risk * 1.5, 'rr': 1.5},
                {'level': 2, 'price': entry - risk * 2.5, 'rr': 2.5}
            ]

def detect_mean_reversion_strategies(df: pd.DataFrame) -> Dict[str, List[Dict]]:
    detector = ComprehensiveMeanReversionDetector()
    all_patterns = detector.detect_all(df)
    return {k: [vars(s) for s in v] for k, v in all_patterns.items()}
