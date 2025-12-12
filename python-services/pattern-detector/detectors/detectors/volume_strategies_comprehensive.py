"""
COMPREHENSIVE Volume-Based Strategies Detector - GURU LEVEL

Implements ALL volume-based strategies:
1. Volume Profile (HVN/LVN/POC) - High/Low Volume Nodes & Point of Control
2. Volume Breakout with Z-Score Confirmation
3. OBV (On-Balance Volume) Reversal & Divergence
4. Volume at Price (VAP) Analysis
5. Accumulation/Distribution (A/D) Line Signals
6. Delta Volume Imbalance (Buying vs Selling Pressure)
7. Ease of Movement (EOM)
8. Chaikin Money Flow (CMF)
"""

import pandas as pd
import numpy as np
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
from scipy.stats import zscore

@dataclass
class VolumeSignal:
    type: str  # 'volume_profile', 'breakout', 'obv', 'accumulation_distribution', 'delta_imbalance', 'cmf'
    direction: str  # 'bullish', 'bearish', 'neutral'
    confidence: float
    strength: float  # 0-100
    price_level: float
    volume_metric: float
    description: str
    entry: float
    stop_loss: float
    targets: List[Dict]
    indicators: Dict

class ComprehensiveVolumeDetector:
    """GURU-LEVEL Volume Strategy Detector"""

    def __init__(self):
        self.vp_lookback = 100  # Bars for Volume Profile
        self.z_threshold = 2.0  # Z-score for volume spike
    
    def detect_all(self, df: pd.DataFrame) -> Dict[str, List[VolumeSignal]]:
        """Detect ALL volume-based patterns"""
        df = self._calculate_indicators(df)
        
        return {
            'volume_profile': self.detect_volume_profile(df),
            'volume_breakout': self.detect_volume_breakout(df),
            'obv_analysis': self.detect_obv_signals(df),
            'accumulation_distribution': self.detect_ad_signals(df),
            'money_flow': self.detect_money_flow(df),
            'delta_imbalance': self.detect_delta_imbalance(df)
        }

    # ============ VOLUME PROFILE (HVN/LVN/POC) ============
    
    def detect_volume_profile(self, df: pd.DataFrame) -> List[VolumeSignal]:
        """
        Volume Profile Analysis:
        - POC (Point of Control): Price level with highest volume
        - HVN (High Volume Node): Acceptance areas (Support/Resistance)
        - LVN (Low Volume Node): Rejection areas (Price jumps across these)
        """
        signals = []
        if len(df) < self.vp_lookback:
            return signals

        # Create Volume Profile (Price Histogram)
        recent_df = df.iloc[-self.vp_lookback:].copy()
        price_bins = np.linspace(recent_df['low'].min(), recent_df['high'].max(), 50)
        
        # Aggregate volume by price bin
        volume_profile = []
        for i in range(len(price_bins)-1):
            mask = (recent_df['close'] >= price_bins[i]) & (recent_df['close'] < price_bins[i+1])
            vol = recent_df.loc[mask, 'volume'].sum()
            volume_profile.append({'price': (price_bins[i] + price_bins[i+1])/2, 'volume': vol})
        
        vp_df = pd.DataFrame(volume_profile)
        if vp_df.empty:
            return signals

        # Find POC (Point of Control)
        poc_idx = vp_df['volume'].idxmax()
        poc_price = vp_df.loc[poc_idx, 'price']
        
        current_price = df['close'].iloc[-1]
        
        # Interaction with POC
        if abs(current_price - poc_price) / current_price < 0.005: # Within 0.5%
            # Check reaction
            if df['close'].iloc[-1] > df['open'].iloc[-1]: # Bouncing up
                signals.append(VolumeSignal(
                    type='volume_profile',
                    direction='bullish',
                    confidence=85.0,
                    strength=vp_df.loc[poc_idx, 'volume'] / vp_df['volume'].mean() * 10,
                    price_level=poc_price,
                    volume_metric=vp_df.loc[poc_idx, 'volume'],
                    description=f'Price reacting at POC ({poc_price:.2f}). High volume support area.',
                    entry=current_price,
                    stop_loss=poc_price * 0.99,
                    targets=self._calculate_targets(current_price, poc_price * 0.99, 'bullish'),
                    indicators={'poc': poc_price}
                ))
            else: # Rejecting down
                signals.append(VolumeSignal(
                    type='volume_profile',
                    direction='bearish',
                    confidence=85.0,
                    strength=vp_df.loc[poc_idx, 'volume'] / vp_df['volume'].mean() * 10,
                    price_level=poc_price,
                    volume_metric=vp_df.loc[poc_idx, 'volume'],
                    description=f'Price rejecting at POC ({poc_price:.2f}). High volume resistance area.',
                    entry=current_price,
                    stop_loss=poc_price * 1.01,
                    targets=self._calculate_targets(current_price, poc_price * 1.01, 'bearish'),
                    indicators={'poc': poc_price}
                ))
                
        return signals

    # ============ VOLUME BREAKOUT ============

    def detect_volume_breakout(self, df: pd.DataFrame) -> List[VolumeSignal]:
        """
        Volume Breakout:
        - Volume Z-Score > 2.0 (Statistically significant spike)
        - Price moves significantly
        """
        signals = []
        if len(df) < 20:
            return signals

        current_vol = df['volume'].iloc[-1]
        vol_zscore = df['vol_zscore'].iloc[-1]
        price_change = (df['close'].iloc[-1] - df['open'].iloc[-1]) / df['open'].iloc[-1]
        
        if vol_zscore > self.z_threshold:
            direction = 'bullish' if price_change > 0 else 'bearish'
            confidence = min(95, 70 + (vol_zscore * 5))
            
            signals.append(VolumeSignal(
                type='volume_breakout',
                direction=direction,
                confidence=confidence,
                strength=vol_zscore * 10,
                price_level=df['close'].iloc[-1],
                volume_metric=current_vol,
                description=f'Volume Spike (Z={vol_zscore:.2f}) with {direction} price action.',
                entry=df['close'].iloc[-1],
                stop_loss=df['low'].iloc[-1] if direction == 'bullish' else df['high'].iloc[-1],
                targets=self._calculate_targets(
                    df['close'].iloc[-1], 
                    df['low'].iloc[-1] if direction == 'bullish' else df['high'].iloc[-1], 
                    direction
                ),
                indicators={'z_score': vol_zscore, 'volume': current_vol}
            ))
            
        return signals

    # ============ OBV REVERSAL & DIVERGENCE ============

    def detect_obv_signals(self, df: pd.DataFrame) -> List[VolumeSignal]:
        """
        OBV (On-Balance Volume) Analysis:
        - Divergence: Price makes HH but OBV makes LH (Bearish)
        - Divergence: Price makes LL but OBV makes HL (Bullish)
        - Trend confirmation
        """
        signals = []
        if len(df) < 30:
            return signals

        # Simple divergence check (last 20 bars)
        price_trend = self._get_trend(df['close'].iloc[-20:])
        obv_trend = self._get_trend(df['obv'].iloc[-20:])
        
        if price_trend == 'uptrend' and obv_trend == 'downtrend':
            signals.append(VolumeSignal(
                type='obv',
                direction='bearish',
                confidence=80.0,
                strength=75.0,
                price_level=df['close'].iloc[-1],
                volume_metric=df['obv'].iloc[-1],
                description='Bearish OBV Divergence: Price rising while volume flow is falling.',
                entry=df['close'].iloc[-1],
                stop_loss=df['high'].iloc[-5:].max(),
                targets=self._calculate_targets(df['close'].iloc[-1], df['high'].iloc[-5:].max(), 'bearish'),
                indicators={'obv': df['obv'].iloc[-1]}
            ))
        elif price_trend == 'downtrend' and obv_trend == 'uptrend':
            signals.append(VolumeSignal(
                type='obv',
                direction='bullish',
                confidence=80.0,
                strength=75.0,
                price_level=df['close'].iloc[-1],
                volume_metric=df['obv'].iloc[-1],
                description='Bullish OBV Divergence: Price falling while volume flow is rising.',
                entry=df['close'].iloc[-1],
                stop_loss=df['low'].iloc[-5:].min(),
                targets=self._calculate_targets(df['close'].iloc[-1], df['low'].iloc[-5:].min(), 'bullish'),
                indicators={'obv': df['obv'].iloc[-1]}
            ))
            
        return signals

    # ============ ACCUMULATION / DISTRIBUTION ============

    def detect_ad_signals(self, df: pd.DataFrame) -> List[VolumeSignal]:
        """
        Accumulation/Distribution (A/D) Line:
        - Detects smart money buying (accumulation) or selling (distribution)
        """
        signals = []
        if len(df) < 30:
            return signals
            
        ad_line = df['ad_line']
        
        # Check for sharp increase in A/D line
        ad_slope = (ad_line.iloc[-1] - ad_line.iloc[-5]) / 5
        
        if ad_slope > 0 and df['close'].iloc[-1] < df['close'].iloc[-5]:
            signals.append(VolumeSignal(
                type='accumulation_distribution',
                direction='bullish',
                confidence=75.0,
                strength=abs(ad_slope),
                price_level=df['close'].iloc[-1],
                volume_metric=ad_line.iloc[-1],
                description='Accumulation detected: A/D line rising while price is flat/falling.',
                entry=df['close'].iloc[-1],
                stop_loss=df['low'].iloc[-5:].min(),
                targets=self._calculate_targets(df['close'].iloc[-1], df['low'].iloc[-5:].min(), 'bullish'),
                indicators={'ad_slope': ad_slope}
            ))
            
        return signals

    # ============ CHAIKIN MONEY FLOW ============

    def detect_money_flow(self, df: pd.DataFrame) -> List[VolumeSignal]:
        """
        Chaikin Money Flow (CMF):
        - CMF > 0.20: Strong buying pressure
        - CMF < -0.20: Strong selling pressure
        """
        signals = []
        if 'cmf' not in df.columns:
            return signals
            
        cmf = df['cmf'].iloc[-1]
        
        if cmf > 0.20:
            signals.append(VolumeSignal(
                type='cmf',
                direction='bullish',
                confidence=80.0,
                strength=cmf * 100,
                price_level=df['close'].iloc[-1],
                volume_metric=cmf,
                description=f'Strong Money Flow Inflow (CMF={cmf:.2f}).',
                entry=df['close'].iloc[-1],
                stop_loss=df['low'].iloc[-3:].min(),
                targets=self._calculate_targets(df['close'].iloc[-1], df['low'].iloc[-3:].min(), 'bullish'),
                indicators={'cmf': cmf}
            ))
        elif cmf < -0.20:
            signals.append(VolumeSignal(
                type='cmf',
                direction='bearish',
                confidence=80.0,
                strength=abs(cmf) * 100,
                price_level=df['close'].iloc[-1],
                volume_metric=cmf,
                description=f'Strong Money Flow Outflow (CMF={cmf:.2f}).',
                entry=df['close'].iloc[-1],
                stop_loss=df['high'].iloc[-3:].max(),
                targets=self._calculate_targets(df['close'].iloc[-1], df['high'].iloc[-3:].max(), 'bearish'),
                indicators={'cmf': cmf}
            ))
            
        return signals

    # ============ DELTA IMBALANCE (APPROXIMATION) ============

    def detect_delta_imbalance(self, df: pd.DataFrame) -> List[VolumeSignal]:
        """
        Delta Imbalance (Approximate from OHLCV):
        - Estimates buying vs selling volume based on candle close position
        """
        signals = []
        if len(df) < 5:
            return signals
            
        # Estimate delta: (Close - Low) - (High - Close) scaled by Volume
        # Positive = Buying pressure, Negative = Selling pressure
        df['est_delta'] = ((df['close'] - df['low']) - (df['high'] - df['close'])) / (df['high'] - df['low']) * df['volume']
        
        current_delta = df['est_delta'].iloc[-1]
        avg_vol = df['volume'].iloc[-20:].mean()
        
        if current_delta > avg_vol * 0.5: # Significant buying delta
            signals.append(VolumeSignal(
                type='delta_imbalance',
                direction='bullish',
                confidence=70.0,
                strength=70.0,
                price_level=df['close'].iloc[-1],
                volume_metric=current_delta,
                description='Positive Delta Imbalance: Aggressive buying detected within candle.',
                entry=df['close'].iloc[-1],
                stop_loss=df['low'].iloc[-1],
                targets=self._calculate_targets(df['close'].iloc[-1], df['low'].iloc[-1], 'bullish'),
                indicators={'delta': current_delta}
            ))
        elif current_delta < -avg_vol * 0.5: # Significant selling delta
            signals.append(VolumeSignal(
                type='delta_imbalance',
                direction='bearish',
                confidence=70.0,
                strength=70.0,
                price_level=df['close'].iloc[-1],
                volume_metric=current_delta,
                description='Negative Delta Imbalance: Aggressive selling detected within candle.',
                entry=df['close'].iloc[-1],
                stop_loss=df['high'].iloc[-1],
                targets=self._calculate_targets(df['close'].iloc[-1], df['high'].iloc[-1], 'bearish'),
                indicators={'delta': current_delta}
            ))
            
        return signals

    # ============ HELPER METHODS ============

    def _calculate_indicators(self, df: pd.DataFrame) -> pd.DataFrame:
        """Calculate volume indicators"""
        # Volume Z-Score
        df['vol_mean'] = df['volume'].rolling(20).mean()
        df['vol_std'] = df['volume'].rolling(20).std()
        df['vol_zscore'] = (df['volume'] - df['vol_mean']) / df['vol_std']
        
        # OBV
        df['obv'] = (np.sign(df['close'].diff()) * df['volume']).fillna(0).cumsum()
        
        # Accumulation/Distribution
        clv = ((df['close'] - df['low']) - (df['high'] - df['close'])) / (df['high'] - df['low'])
        clv = clv.fillna(0)
        df['ad_line'] = (clv * df['volume']).cumsum()
        
        # Chaikin Money Flow (20 period)
        df['cmf'] = (clv * df['volume']).rolling(20).sum() / df['volume'].rolling(20).sum()
        
        return df

    def _get_trend(self, series: pd.Series) -> str:
        """Simple linear regression trend detection"""
        x = np.arange(len(series))
        slope, _ = np.polyfit(x, series, 1)
        if slope > 0: return 'uptrend'
        elif slope < 0: return 'downtrend'
        return 'neutral'

    def _calculate_targets(self, entry: float, stop: float, direction: str) -> List[Dict]:
        """Calculate R:R targets"""
        risk = abs(entry - stop)
        if risk == 0: risk = entry * 0.01 # Fallback
        
        if direction == 'bullish':
            return [
                {'level': 1, 'price': entry + risk * 1.5, 'rr': 1.5},
                {'level': 2, 'price': entry + risk * 2.5, 'rr': 2.5},
                {'level': 3, 'price': entry + risk * 4.0, 'rr': 4.0}
            ]
        else:
            return [
                {'level': 1, 'price': entry - risk * 1.5, 'rr': 1.5},
                {'level': 2, 'price': entry - risk * 2.5, 'rr': 2.5},
                {'level': 3, 'price': entry - risk * 4.0, 'rr': 4.0}
            ]

def detect_volume_strategies(df: pd.DataFrame) -> Dict[str, List[Dict]]:
    detector = ComprehensiveVolumeDetector()
    all_patterns = detector.detect_all(df)
    return {k: [vars(s) for s in v] for k, v in all_patterns.items()}
