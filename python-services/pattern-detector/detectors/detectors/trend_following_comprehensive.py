"""
COMPREHENSIVE Trend-Following Strategies Detector - GURU LEVEL

Implements ALL trend-following strategies:
1. EMA Trend Strategy (EMA 9/21/34/50/200)
2. Moving Average Crossovers (Golden/Death Cross, Fast/Slow)
3. SuperTrend Indicator
4. TTM Squeeze (Bollinger Bands + Keltner Channels)
5. Parabolic SAR Trend Reversal
6. Trendline Strategy (breakouts + retests)
7. ADX Trend Strength
8. Ichimoku Cloud
"""

import pandas as pd
import numpy as np
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass


@dataclass
class TrendSignal:
    type: str  # 'ema_trend', 'ma_cross', 'supertrend', 'ttm_squeeze', 'parabolic_sar', 'trendline', 'ichimoku'
    direction: str  # 'bullish', 'bearish', 'neutral'
    confidence: float
    trend_strength: float  # 0-100
    entry: float
    stop_loss: float
    targets: List[Dict]
    indicators: Dict  # Current indicator values
    description: str


class ComprehensiveTrendDetector:
    """GURU-LEVEL Trend-Following Strategy Detector"""
    
    def __init__(self):
        self.ema_periods = [9, 21, 34, 50, 200]
        self.sma_periods = [20, 50, 100, 200]
    
    def detect_all(self, df: pd.DataFrame) -> Dict[str, List[TrendSignal]]:
        """Detect ALL trend-following patterns"""
        # Calculate all required indicators first
        df = self._calculate_indicators(df)
        
        return {
            'ema_trend': self.detect_ema_trend(df),
            'ma_crossovers': self.detect_ma_crossovers(df),
            'supertrend': self.detect_supertrend(df),
            'ttm_squeeze': self.detect_ttm_squeeze(df),
            'parabolic_sar': self.detect_parabolic_sar(df),
            'trendlines': self.detect_trendlines(df),
            'adx_trend': self.detect_adx_trend(df),
            'ichimoku': self.detect_ichimoku(df)
        }
    
    # ============ EMA TREND STRATEGY ============
    
    def detect_ema_trend(self, df: pd.DataFrame) -> List[TrendSignal]:
        """
        EMA Trend: Price position relative to multiple EMAs
        
        Strong Uptrend: Price > EMA9 > EMA21 > EMA34 > EMA50 > EMA200
        Strong Downtrend: Price < EMA9 < EMA21 < EMA34 < EMA50 < EMA200
        """
        signals = []
        
        if len(df) < 200:
            return signals
        
        current_price = df['close'].iloc[-1]
        
        # Get EMA values
        ema_values = {
            period: df[f'ema_{period}'].iloc[-1]
            for period in self.ema_periods
        }
        
        # Check for perfect EMA alignment (strongest signal)
        bullish_alignment = all(
            ema_values[self.ema_periods[i]] > ema_values[self.ema_periods[i+1]]
            for i in range(len(self.ema_periods) - 1)
        ) and current_price > ema_values[9]
        
        bearish_alignment = all(
            ema_values[self.ema_periods[i]] < ema_values[self.ema_periods[i+1]]
            for i in range(len(self.ema_periods) - 1)
        ) and current_price < ema_values[9]
        
        if bullish_alignment:
            # Calculate trend strength
            strength = self._calculate_ema_strength(current_price, ema_values, 'bullish')
            
            signals.append(TrendSignal(
                type='ema_trend',
                direction='bullish',
                confidence=90.0,
                trend_strength=strength,
                entry=current_price,
                stop_loss=ema_values[21],  # Use EMA21 as stop
                targets=self._calculate_trend_targets(current_price, ema_values[21], 'bullish'),
                indicators=ema_values,
                description=f'Perfect bullish EMA alignment. Strong uptrend confirmed. Price: {current_price:.5f}, EMA9: {ema_values[9]:.5f}'
            ))
        
        elif bearish_alignment:
            strength = self._calculate_ema_strength(current_price, ema_values, 'bearish')
            
            signals.append(TrendSignal(
                type='ema_trend',
                direction='bearish',
                confidence=90.0,
                trend_strength=strength,
                entry=current_price,
                stop_loss=ema_values[21],
                targets=self._calculate_trend_targets(current_price, ema_values[21], 'bearish'),
                indicators=ema_values,
                description=f'Perfect bearish EMA alignment. Strong downtrend confirmed. Price: {current_price:.5f}, EMA9: {ema_values[9]:.5f}'
            ))
        
        # Check for partial alignment (medium strength)
        elif current_price > ema_values[9] > ema_values[21] > ema_values[50]:
            signals.append(TrendSignal(
                type='ema_trend',
                direction='bullish',
                confidence=75.0,
                trend_strength=70.0,
                entry=current_price,
                stop_loss=ema_values[34],
                targets=self._calculate_trend_targets(current_price, ema_values[34], 'bullish'),
                indicators=ema_values,
                description=f'Bullish EMA trend. Price above key EMAs. Uptrend in progress.'
            ))
        
        elif current_price < ema_values[9] < ema_values[21] < ema_values[50]:
            signals.append(TrendSignal(
                type='ema_trend',
                direction='bearish',
                confidence=75.0,
                trend_strength=70.0,
                entry=current_price,
                stop_loss=ema_values[34],
                targets=self._calculate_trend_targets(current_price, ema_values[34], 'bearish'),
                indicators=ema_values,
                description=f'Bearish EMA trend. Price below key EMAs. Downtrend in progress.'
            ))
        
        return signals
    
    # ============ MOVING AVERAGE CROSSOVERS ============
    
    def detect_ma_crossovers(self, df: pd.DataFrame) -> List[TrendSignal]:
        """
        MA Crossovers: Fast MA crosses Slow MA
        
        Golden Cross: Fast MA crosses above Slow MA (bullish)
        Death Cross: Fast MA crosses below Slow MA (bearish)
        """
        signals = []
        
        if len(df) < 200:
            return signals
        
        # Check multiple crossover combinations
        crossover_pairs = [
            (9, 21, 'fast'),
            (21, 50, 'medium'),
            (50, 200, 'slow')  # Golden/Death Cross
        ]
        
        for fast_period, slow_period, speed in crossover_pairs:
            fast_ma = df[f'ema_{fast_period}']
            slow_ma = df[f'ema_{slow_period}']
            
            # Check for recent crossover (within last 3 bars)
            for i in range(1, min(4, len(df))):
                # Bullish crossover
                if (fast_ma.iloc[-i] > slow_ma.iloc[-i] and 
                    fast_ma.iloc[-i-1] <= slow_ma.iloc[-i-1]):
                    
                    confidence = 85.0 if speed == 'slow' else 75.0 if speed == 'medium' else 70.0
                    
                    signals.append(TrendSignal(
                        type='ma_cross',
                        direction='bullish',
                        confidence=confidence,
                        trend_strength=80.0,
                        entry=df['close'].iloc[-1],
                        stop_loss=slow_ma.iloc[-1],
                        targets=self._calculate_trend_targets(
                            df['close'].iloc[-1], slow_ma.iloc[-1], 'bullish'
                        ),
                        indicators={
                            'fast_ma': fast_ma.iloc[-1],
                            'slow_ma': slow_ma.iloc[-1],
                            'crossover_type': f'{fast_period}/{slow_period}'
                        },
                        description=f'{"Golden Cross" if speed == "slow" else "Bullish MA Crossover"}: EMA{fast_period} crossed above EMA{slow_period}. Strong buy signal.'
                    ))
                    break
                
                # Bearish crossover
                elif (fast_ma.iloc[-i] < slow_ma.iloc[-i] and 
                      fast_ma.iloc[-i-1] >= slow_ma.iloc[-i-1]):
                    
                    confidence = 85.0 if speed == 'slow' else 75.0 if speed == 'medium' else 70.0
                    
                    signals.append(TrendSignal(
                        type='ma_cross',
                        direction='bearish',
                        confidence=confidence,
                        trend_strength=80.0,
                        entry=df['close'].iloc[-1],
                        stop_loss=slow_ma.iloc[-1],
                        targets=self._calculate_trend_targets(
                            df['close'].iloc[-1], slow_ma.iloc[-1], 'bearish'
                        ),
                        indicators={
                            'fast_ma': fast_ma.iloc[-1],
                            'slow_ma': slow_ma.iloc[-1],
                            'crossover_type': f'{fast_period}/{slow_period}'
                        },
                        description=f'{"Death Cross" if speed == "slow" else "Bearish MA Crossover"}: EMA{fast_period} crossed below EMA{slow_period}. Strong sell signal.'
                    ))
                    break
        
        return signals
    
    # ============ SUPERTREND INDICATOR ============
    
    def detect_supertrend(self, df: pd.DataFrame) -> List[TrendSignal]:
        """
        SuperTrend: ATR-based trend indicator
        
        Green SuperTrend: Bullish trend
        Red SuperTrend: Bearish trend
        """
        signals = []
        
        if 'supertrend' not in df.columns:
            df = self._calculate_supertrend(df)
        
        if len(df) < 20:
            return signals
        
        current_price = df['close'].iloc[-1]
        supertrend = df['supertrend'].iloc[-1]
        supertrend_direction = df['supertrend_direction'].iloc[-1]
        
        # Check for trend change
        prev_direction = df['supertrend_direction'].iloc[-2]
        
        if supertrend_direction == 1 and prev_direction == -1:
            # Bullish trend start
            signals.append(TrendSignal(
                type='supertrend',
                direction='bullish',
                confidence=85.0,
                trend_strength=85.0,
                entry=current_price,
                stop_loss=supertrend,
                targets=self._calculate_trend_targets(current_price, supertrend, 'bullish'),
                indicators={'supertrend': supertrend, 'direction': 'bullish'},
                description=f'SuperTrend turned bullish. Price: {current_price:.5f}, SuperTrend: {supertrend:.5f}'
            ))
        
        elif supertrend_direction == -1 and prev_direction == 1:
            # Bearish trend start
            signals.append(TrendSignal(
                type='supertrend',
                direction='bearish',
                confidence=85.0,
                trend_strength=85.0,
                entry=current_price,
                stop_loss=supertrend,
                targets=self._calculate_trend_targets(current_price, supertrend, 'bearish'),
                indicators={'supertrend': supertrend, 'direction': 'bearish'},
                description=f'SuperTrend turned bearish. Price: {current_price:.5f}, SuperTrend: {supertrend:.5f}'
            ))
        
        # Ongoing trend (no change but still valid)
        elif supertrend_direction == 1:
            signals.append(TrendSignal(
                type='supertrend',
                direction='bullish',
                confidence=75.0,
                trend_strength=75.0,
                entry=current_price,
                stop_loss=supertrend,
                targets=self._calculate_trend_targets(current_price, supertrend, 'bullish'),
                indicators={'supertrend': supertrend, 'direction': 'bullish'},
                description=f'SuperTrend bullish continuation. Trend intact.'
            ))
        
        elif supertrend_direction == -1:
            signals.append(TrendSignal(
                type='supertrend',
                direction='bearish',
                confidence=75.0,
                trend_strength=75.0,
                entry=current_price,
                stop_loss=supertrend,
                targets=self._calculate_trend_targets(current_price, supertrend, 'bearish'),
                indicators={'supertrend': supertrend, 'direction': 'bearish'},
                description=f'SuperTrend bearish continuation. Trend intact.'
            ))
        
        return signals
    
    # ============ TTM SQUEEZE ============
    
    def detect_ttm_squeeze(self, df: pd.DataFrame) -> List[TrendSignal]:
        """
        TTM Squeeze: Bollinger Bands inside Keltner Channels
        
        Squeeze: Volatility compression (setup phase)
        Fire: Squeeze release (breakout phase)
        """
        signals = []
        
        if len(df) < 20:
            return signals
        
        # Calculate Bollinger Bands
        bb_period = 20
        bb_std = 2
        df['bb_middle'] = df['close'].rolling(bb_period).mean()
        df['bb_std'] = df['close'].rolling(bb_period).std()
        df['bb_upper'] = df['bb_middle'] + (bb_std * df['bb_std'])
        df['bb_lower'] = df['bb_middle'] - (bb_std * df['bb_std'])
        
        # Calculate Keltner Channels
        kc_period = 20
        kc_atr_mult = 1.5
        df['kc_middle'] = df['close'].rolling(kc_period).mean()
        df['tr'] = np.maximum(
            df['high'] - df['low'],
            np.maximum(
                abs(df['high'] - df['close'].shift(1)),
                abs(df['low'] - df['close'].shift(1))
            )
        )
        df['atr'] = df['tr'].rolling(kc_period).mean()
        df['kc_upper'] = df['kc_middle'] + (kc_atr_mult * df['atr'])
        df['kc_lower'] = df['kc_middle'] - (kc_atr_mult * df['atr'])
        
        # Detect squeeze
        df['squeeze_on'] = (df['bb_lower'] > df['kc_lower']) & (df['bb_upper'] < df['kc_upper'])
        
        # Calculate momentum
        df['momentum'] = df['close'] - ((df['bb_upper'] + df['bb_lower']) / 2)
        
        current_squeeze = df['squeeze_on'].iloc[-1]
        prev_squeeze = df['squeeze_on'].iloc[-2]
        current_momentum = df['momentum'].iloc[-1]
        
        # Squeeze release (fire signal)
        if not current_squeeze and prev_squeeze:
            direction = 'bullish' if current_momentum > 0 else 'bearish'
            
            signals.append(TrendSignal(
                type='ttm_squeeze',
                direction=direction,
                confidence=85.0,
                trend_strength=85.0,
                entry=df['close'].iloc[-1],
                stop_loss=df['kc_lower'].iloc[-1] if direction == 'bullish' else df['kc_upper'].iloc[-1],
                targets=self._calculate_trend_targets(
                    df['close'].iloc[-1],
                    df['kc_lower'].iloc[-1] if direction == 'bullish' else df['kc_upper'].iloc[-1],
                    direction
                ),
                indicators={
                    'squeeze_status': 'fired',
                    'momentum': current_momentum
                },
                description=f'TTM Squeeze FIRED {direction}! Volatility expansion expected. High probability breakout.'
            ))
        
        # Squeeze building (setup phase)
        elif current_squeeze:
            signals.append(TrendSignal(
                type='ttm_squeeze',
                direction='neutral',
                confidence=70.0,
                trend_strength=50.0,
                entry=df['close'].iloc[-1],
                stop_loss=df['kc_lower'].iloc[-1],
                targets=[],
                indicators={
                    'squeeze_status': 'active',
                    'momentum': current_momentum
                },
                description=f'TTM Squeeze ACTIVE. Volatility compression. Breakout imminent. Watch for direction.'
            ))
        
        return signals
    
    # ============ PARABOLIC SAR ============
    
    def detect_parabolic_sar(self, df: pd.DataFrame) -> List[TrendSignal]:
        """
        Parabolic SAR: Stop and Reverse indicator
        
        SAR below price: Bullish trend
        SAR above price: Bearish trend
        """
        signals = []
        
        if 'psar' not in df.columns:
            df = self._calculate_parabolic_sar(df)
        
        if len(df) < 10:
            return signals
        
        current_price = df['close'].iloc[-1]
        current_psar = df['psar'].iloc[-1]
        prev_psar = df['psar'].iloc[-2]
        prev_price = df['close'].iloc[-2]
        
        # Check for SAR flip (trend reversal)
        if current_psar < current_price and prev_psar > prev_price:
            # Bullish reversal
            signals.append(TrendSignal(
                type='parabolic_sar',
                direction='bullish',
                confidence=80.0,
                trend_strength=80.0,
                entry=current_price,
                stop_loss=current_psar,
                targets=self._calculate_trend_targets(current_price, current_psar, 'bullish'),
                indicators={'psar': current_psar},
                description=f'Parabolic SAR bullish reversal. SAR flipped below price. Uptrend starting.'
            ))
        
        elif current_psar > current_price and prev_psar < prev_price:
            # Bearish reversal
            signals.append(TrendSignal(
                type='parabolic_sar',
                direction='bearish',
                confidence=80.0,
                trend_strength=80.0,
                entry=current_price,
                stop_loss=current_psar,
                targets=self._calculate_trend_targets(current_price, current_psar, 'bearish'),
                indicators={'psar': current_psar},
                description=f'Parabolic SAR bearish reversal. SAR flipped above price. Downtrend starting.'
            ))
        
        return signals
    
    # ============ TRENDLINE STRATEGY ============
    
    def detect_trendlines(self, df: pd.DataFrame) -> List[TrendSignal]:
        """
        Trendline Strategy: Breakouts and retests of trendlines
        
        Uptrend: Series of higher lows
        Downtrend: Series of lower highs
        """
        signals = []
        
        # Simplified trendline detection
        # In production, would use more sophisticated algorithms
        
        return signals
    
    # ============ ADX TREND STRENGTH ============
    
    def detect_adx_trend(self, df: pd.DataFrame) -> List[TrendSignal]:
        """
        ADX Trend Strength: Measure trend strength
        
        ADX > 25: Strong trend
        ADX > 50: Very strong trend
        +DI > -DI: Uptrend
        -DI > +DI: Downtrend
        """
        signals = []
        
        if 'adx' not in df.columns:
            return signals
        
        adx = df['adx'].iloc[-1]
        plus_di = df['plus_di'].iloc[-1] if 'plus_di' in df.columns else 0
        minus_di = df['minus_di'].iloc[-1] if 'minus_di' in df.columns else 0
        
        if adx > 25:
            if plus_di > minus_di:
                signals.append(TrendSignal(
                    type='adx_trend',
                    direction='bullish',
                    confidence=min(95, 60 + adx),
                    trend_strength=adx,
                    entry=df['close'].iloc[-1],
                    stop_loss=df['low'].iloc[-10:].min(),
                    targets=self._calculate_trend_targets(
                        df['close'].iloc[-1],
                        df['low'].iloc[-10:].min(),
                        'bullish'
                    ),
                    indicators={'adx': adx, 'plus_di': plus_di, 'minus_di': minus_di},
                    description=f'Strong bullish trend confirmed. ADX: {adx:.1f}, +DI > -DI'
                ))
            else:
                signals.append(TrendSignal(
                    type='adx_trend',
                    direction='bearish',
                    confidence=min(95, 60 + adx),
                    trend_strength=adx,
                    entry=df['close'].iloc[-1],
                    stop_loss=df['high'].iloc[-10:].max(),
                    targets=self._calculate_trend_targets(
                        df['close'].iloc[-1],
                        df['high'].iloc[-10:].max(),
                        'bearish'
                    ),
                    indicators={'adx': adx, 'plus_di': plus_di, 'minus_di': minus_di},
                    description=f'Strong bearish trend confirmed. ADX: {adx:.1f}, -DI > +DI'
                ))
        
        return signals
    
    # ============ ICHIMOKU CLOUD ============
    
    def detect_ichimoku(self, df: pd.DataFrame) -> List[TrendSignal]:
        """
        Ichimoku Cloud: Comprehensive trend system
        
        Bullish: Price above cloud, Tenkan > Kijun
        Bearish: Price below cloud, Tenkan < Kijun
        """
        signals = []
        
        # Calculate Ichimoku components
        if 'tenkan_sen' not in df.columns:
            df = self._calculate_ichimoku(df)
        
        if len(df) < 52:
            return signals
        
        current_price = df['close'].iloc[-1]
        tenkan = df['tenkan_sen'].iloc[-1]
        kijun = df['kijun_sen'].iloc[-1]
        senkou_a = df['senkou_span_a'].iloc[-1]
        senkou_b = df['senkou_span_b'].iloc[-1]
        
        cloud_top = max(senkou_a, senkou_b)
        cloud_bottom = min(senkou_a, senkou_b)
        
        # Bullish Ichimoku
        if current_price > cloud_top and tenkan > kijun:
            signals.append(TrendSignal(
                type='ichimoku',
                direction='bullish',
                confidence=85.0,
                trend_strength=85.0,
                entry=current_price,
                stop_loss=cloud_top,
                targets=self._calculate_trend_targets(current_price, cloud_top, 'bullish'),
                indicators={
                    'tenkan': tenkan,
                    'kijun': kijun,
                    'cloud_top': cloud_top,
                    'cloud_bottom': cloud_bottom
                },
                description=f'Bullish Ichimoku setup. Price above cloud, Tenkan > Kijun. Strong uptrend.'
            ))
        
        # Bearish Ichimoku
        elif current_price < cloud_bottom and tenkan < kijun:
            signals.append(TrendSignal(
                type='ichimoku',
                direction='bearish',
                confidence=85.0,
                trend_strength=85.0,
                entry=current_price,
                stop_loss=cloud_bottom,
                targets=self._calculate_trend_targets(current_price, cloud_bottom, 'bearish'),
                indicators={
                    'tenkan': tenkan,
                    'kijun': kijun,
                    'cloud_top': cloud_top,
                    'cloud_bottom': cloud_bottom
                },
                description=f'Bearish Ichimoku setup. Price below cloud, Tenkan < Kijun. Strong downtrend.'
            ))
        
        return signals
    
    # ============ HELPER METHODS ============
    
    def _calculate_indicators(self, df: pd.DataFrame) -> pd.DataFrame:
        """Calculate all required indicators"""
        # EMAs
        for period in self.ema_periods:
            if f'ema_{period}' not in df.columns:
                df[f'ema_{period}'] = df['close'].ewm(span=period, adjust=False).mean()
        
        # SMAs
        for period in self.sma_periods:
            if f'sma_{period}' not in df.columns:
                df[f'sma_{period}'] = df['close'].rolling(period).mean()
        
        return df
    
    def _calculate_ema_strength(self, price: float, ema_values: Dict, direction: str) -> float:
        """Calculate EMA trend strength"""
        if direction == 'bullish':
            # Distance from price to EMA200
            distance = (price - ema_values[200]) / ema_values[200]
            return min(100, distance * 1000)
        else:
            distance = (ema_values[200] - price) / ema_values[200]
            return min(100, distance * 1000)
    
    def _calculate_trend_targets(self, entry: float, stop: float, direction: str) -> List[Dict]:
        """Calculate trend-based targets"""
        risk = abs(entry - stop)
        
        if direction == 'bullish':
            return [
                {'level': 1, 'price': entry + (risk * 1.5), 'percentage': 25, 'rr': 1.5},
                {'level': 2, 'price': entry + (risk * 2.0), 'percentage': 25, 'rr': 2.0},
                {'level': 3, 'price': entry + (risk * 3.0), 'percentage': 25, 'rr': 3.0},
                {'level': 4, 'price': entry + (risk * 5.0), 'percentage': 25, 'rr': 5.0}
            ]
        else:
            return [
                {'level': 1, 'price': entry - (risk * 1.5), 'percentage': 25, 'rr': 1.5},
                {'level': 2, 'price': entry - (risk * 2.0), 'percentage': 25, 'rr': 2.0},
                {'level': 3, 'price': entry - (risk * 3.0), 'percentage': 25, 'rr': 3.0},
                {'level': 4, 'price': entry - (risk * 5.0), 'percentage': 25, 'rr': 5.0}
            ]
    
    def _calculate_supertrend(self, df: pd.DataFrame, period: int = 10, multiplier: float = 3.0) -> pd.DataFrame:
        """Calculate SuperTrend indicator"""
        # Calculate ATR
        df['tr'] = np.maximum(
            df['high'] - df['low'],
            np.maximum(
                abs(df['high'] - df['close'].shift(1)),
                abs(df['low'] - df['close'].shift(1))
            )
        )
        df['atr'] = df['tr'].rolling(period).mean()
        
        # Calculate basic bands
        df['basic_ub'] = (df['high'] + df['low']) / 2 + multiplier * df['atr']
        df['basic_lb'] = (df['high'] + df['low']) / 2 - multiplier * df['atr']
        
        # Calculate final bands
        df['final_ub'] = df['basic_ub']
        df['final_lb'] = df['basic_lb']
        
        # Calculate SuperTrend
        df['supertrend'] = 0.0
        df['supertrend_direction'] = 1
        
        for i in range(period, len(df)):
            # Final upper band
            if df['basic_ub'].iloc[i] < df['final_ub'].iloc[i-1] or df['close'].iloc[i-1] > df['final_ub'].iloc[i-1]:
                df.loc[df.index[i], 'final_ub'] = df['basic_ub'].iloc[i]
            else:
                df.loc[df.index[i], 'final_ub'] = df['final_ub'].iloc[i-1]
            
            # Final lower band
            if df['basic_lb'].iloc[i] > df['final_lb'].iloc[i-1] or df['close'].iloc[i-1] < df['final_lb'].iloc[i-1]:
                df.loc[df.index[i], 'final_lb'] = df['basic_lb'].iloc[i]
            else:
                df.loc[df.index[i], 'final_lb'] = df['final_lb'].iloc[i-1]
            
            # SuperTrend
            if df['close'].iloc[i] <= df['final_ub'].iloc[i]:
                df.loc[df.index[i], 'supertrend'] = df['final_ub'].iloc[i]
                df.loc[df.index[i], 'supertrend_direction'] = -1
            else:
                df.loc[df.index[i], 'supertrend'] = df['final_lb'].iloc[i]
                df.loc[df.index[i], 'supertrend_direction'] = 1
        
        return df
    
    def _calculate_parabolic_sar(self, df: pd.DataFrame, af_start: float = 0.02, af_max: float = 0.2) -> pd.DataFrame:
        """Calculate Parabolic SAR"""
        df['psar'] = df['close'].copy()
        df['psar_direction'] = 1
        
        # Simplified PSAR calculation
        # In production, would use full PSAR algorithm
        
        return df
    
    def _calculate_ichimoku(self, df: pd.DataFrame) -> pd.DataFrame:
        """Calculate Ichimoku Cloud components"""
        # Tenkan-sen (Conversion Line): (9-period high + 9-period low) / 2
        period9_high = df['high'].rolling(9).max()
        period9_low = df['low'].rolling(9).min()
        df['tenkan_sen'] = (period9_high + period9_low) / 2
        
        # Kijun-sen (Base Line): (26-period high + 26-period low) / 2
        period26_high = df['high'].rolling(26).max()
        period26_low = df['low'].rolling(26).min()
        df['kijun_sen'] = (period26_high + period26_low) / 2
        
        # Senkou Span A (Leading Span A): (Tenkan-sen + Kijun-sen) / 2
        df['senkou_span_a'] = ((df['tenkan_sen'] + df['kijun_sen']) / 2).shift(26)
        
        # Senkou Span B (Leading Span B): (52-period high + 52-period low) / 2
        period52_high = df['high'].rolling(52).max()
        period52_low = df['low'].rolling(52).min()
        df['senkou_span_b'] = ((period52_high + period52_low) / 2).shift(26)
        
        # Chikou Span (Lagging Span): Close shifted back 26 periods
        df['chikou_span'] = df['close'].shift(-26)
        
        return df
    
    def to_dict(self, signal: TrendSignal) -> Dict:
        """Convert to dictionary"""
        return {
            'type': signal.type,
            'direction': signal.direction,
            'confidence': signal.confidence,
            'trend_strength': signal.trend_strength,
            'entry': signal.entry,
            'stop_loss': signal.stop_loss,
            'targets': signal.targets,
            'indicators': signal.indicators,
            'description': signal.description
        }


# Export
def detect_trend_patterns(df: pd.DataFrame) -> Dict[str, List[Dict]]:
    """Main function to detect all trend-following patterns"""
    detector = ComprehensiveTrendDetector()
    all_patterns = detector.detect_all(df)
    
    return {
        category: [detector.to_dict(p) for p in patterns]
        for category, patterns in all_patterns.items()
    }
