"""
COMPREHENSIVE Market Regime Detection - GURU LEVEL

Implements ALL market regime detection strategies:
1. Trend vs Range Classifier
2. Volatile vs Low-Volatility Regime
3. Directional Bias Detection
4. Strength of Trend (ADX-based + custom)
5. Regime Shifts & Phase Detection
6. ATR Expansion Phases
7. Compression → Explosion (TTM Squeeze logic)
8. Market Cycle Detection (Accumulation, Markup, Distribution, Markdown)
"""

import pandas as pd
import numpy as np
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
from enum import Enum


class MarketRegime(Enum):
    """Market regime types"""
    TRENDING_UP = "trending_up"
    TRENDING_DOWN = "trending_down"
    RANGING = "ranging"
    VOLATILE = "volatile"
    LOW_VOLATILITY = "low_volatility"
    COMPRESSION = "compression"
    EXPANSION = "expansion"
    ACCUMULATION = "accumulation"
    MARKUP = "markup"
    DISTRIBUTION = "distribution"
    MARKDOWN = "markdown"


@dataclass
class RegimeSignal:
    regime_type: MarketRegime
    confidence: float  # 0-100
    strength: float  # 0-100 (for trends)
    volatility_level: str  # 'low', 'normal', 'high', 'extreme'
    directional_bias: str  # 'bullish', 'bearish', 'neutral'
    phase: str  # Current market phase
    indicators: Dict  # Supporting indicator values
    description: str
    trading_recommendation: str


class MarketRegimeDetector:
    """GURU-LEVEL Market Regime Detection System"""
    
    def __init__(self):
        self.atr_period = 14
        self.adx_period = 14
        self.bb_period = 20
        self.bb_std = 2
    
    def detect_all(self, df: pd.DataFrame) -> Dict[str, RegimeSignal]:
        """Detect ALL market regimes and return comprehensive analysis"""
        # Calculate all required indicators
        df = self._calculate_indicators(df)
        
        return {
            'trend_vs_range': self.detect_trend_vs_range(df),
            'volatility_regime': self.detect_volatility_regime(df),
            'directional_bias': self.detect_directional_bias(df),
            'trend_strength': self.detect_trend_strength(df),
            'regime_shift': self.detect_regime_shift(df),
            'atr_phase': self.detect_atr_phase(df),
            'compression_expansion': self.detect_compression_expansion(df),
            'market_cycle': self.detect_market_cycle(df)
        }
    
    # ============ TREND VS RANGE CLASSIFIER ============
    
    def detect_trend_vs_range(self, df: pd.DataFrame) -> RegimeSignal:
        """
        Classify market as Trending or Ranging
        
        Uses multiple methods:
        - ADX (trend strength)
        - Price action (HH/HL or LH/LL)
        - Bollinger Band width
        - Linear regression slope
        """
        if len(df) < 50:
            return self._create_neutral_signal()
        
        # Method 1: ADX
        adx = df['adx'].iloc[-1] if 'adx' in df.columns else 0
        
        # Method 2: Price action structure
        structure = self._analyze_structure(df)
        
        # Method 3: Bollinger Band width (volatility proxy)
        bb_width = (df['bb_upper'].iloc[-1] - df['bb_lower'].iloc[-1]) / df['bb_middle'].iloc[-1]
        avg_bb_width = ((df['bb_upper'] - df['bb_lower']) / df['bb_middle']).rolling(50).mean().iloc[-1]
        
        # Method 4: Linear regression slope
        prices = df['close'].iloc[-50:].values
        x = np.arange(len(prices))
        slope, _ = np.polyfit(x, prices, 1)
        slope_angle = np.degrees(np.arctan(slope / prices[-1]))
        
        # Combine methods
        trending_score = 0
        ranging_score = 0
        
        # ADX contribution
        if adx > 25:
            trending_score += 30
        elif adx < 20:
            ranging_score += 30
        else:
            trending_score += 15
            ranging_score += 15
        
        # Structure contribution
        if structure in ['HH_HL', 'LH_LL']:
            trending_score += 25
        else:
            ranging_score += 25
        
        # BB width contribution
        if bb_width > avg_bb_width * 1.2:
            trending_score += 20
        elif bb_width < avg_bb_width * 0.8:
            ranging_score += 20
        
        # Slope contribution
        if abs(slope_angle) > 15:
            trending_score += 25
        elif abs(slope_angle) < 5:
            ranging_score += 25
        
        # Determine regime
        if trending_score > ranging_score * 1.3:
            if slope_angle > 0:
                regime = MarketRegime.TRENDING_UP
                bias = 'bullish'
            else:
                regime = MarketRegime.TRENDING_DOWN
                bias = 'bearish'
            
            confidence = min(95, (trending_score / (trending_score + ranging_score)) * 100)
            
            return RegimeSignal(
                regime_type=regime,
                confidence=confidence,
                strength=adx,
                volatility_level=self._classify_volatility(df),
                directional_bias=bias,
                phase='trending',
                indicators={
                    'adx': adx,
                    'structure': structure,
                    'bb_width': bb_width,
                    'slope_angle': slope_angle,
                    'trending_score': trending_score,
                    'ranging_score': ranging_score
                },
                description=f'TRENDING MARKET ({bias}): ADX={adx:.1f}, Slope={slope_angle:.1f}°. Clear directional movement.',
                trading_recommendation=f'Trade {bias} breakouts and pullbacks. Avoid counter-trend trades.'
            )
        
        else:
            confidence = min(95, (ranging_score / (trending_score + ranging_score)) * 100)
            
            return RegimeSignal(
                regime_type=MarketRegime.RANGING,
                confidence=confidence,
                strength=20.0,
                volatility_level=self._classify_volatility(df),
                directional_bias='neutral',
                phase='ranging',
                indicators={
                    'adx': adx,
                    'structure': structure,
                    'bb_width': bb_width,
                    'slope_angle': slope_angle,
                    'trending_score': trending_score,
                    'ranging_score': ranging_score
                },
                description=f'RANGING MARKET: ADX={adx:.1f}, Slope={slope_angle:.1f}°. Price consolidating.',
                trading_recommendation='Trade mean reversion. Buy support, sell resistance. Avoid breakout trades.'
            )
    
    # ============ VOLATILITY REGIME ============
    
    def detect_volatility_regime(self, df: pd.DataFrame) -> RegimeSignal:
        """
        Classify volatility regime: Low, Normal, High, Extreme
        
        Uses ATR, Bollinger Band width, and price range
        """
        if len(df) < 50:
            return self._create_neutral_signal()
        
        # Calculate current ATR
        current_atr = df['atr'].iloc[-1] if 'atr' in df.columns else 0
        avg_atr = df['atr'].rolling(50).mean().iloc[-1] if 'atr' in df.columns else 0
        
        # ATR percentile
        atr_percentile = (df['atr'].iloc[-1] / df['atr'].rolling(100).max().iloc[-1]) * 100 if 'atr' in df.columns else 50
        
        # Bollinger Band width
        bb_width = (df['bb_upper'].iloc[-1] - df['bb_lower'].iloc[-1]) / df['bb_middle'].iloc[-1]
        avg_bb_width = ((df['bb_upper'] - df['bb_lower']) / df['bb_middle']).rolling(50).mean().iloc[-1]
        
        # Price range volatility
        recent_range = df['high'].iloc[-20:].max() - df['low'].iloc[-20:].min()
        avg_range = (df['high'].rolling(20).max() - df['low'].rolling(20).min()).rolling(50).mean().iloc[-1]
        
        # Classify volatility
        if current_atr > avg_atr * 1.5 or atr_percentile > 80:
            volatility_level = 'extreme'
            regime = MarketRegime.VOLATILE
            confidence = 90.0
            recommendation = 'Widen stops. Reduce position size. High risk/reward opportunities.'
        
        elif current_atr > avg_atr * 1.2 or atr_percentile > 60:
            volatility_level = 'high'
            regime = MarketRegime.VOLATILE
            confidence = 80.0
            recommendation = 'Increased volatility. Adjust stops accordingly. Good for breakout trades.'
        
        elif current_atr < avg_atr * 0.7 or atr_percentile < 30:
            volatility_level = 'low'
            regime = MarketRegime.LOW_VOLATILITY
            confidence = 85.0
            recommendation = 'Low volatility. Tighten stops. Expect breakout soon. Compression phase.'
        
        else:
            volatility_level = 'normal'
            regime = MarketRegime.RANGING
            confidence = 70.0
            recommendation = 'Normal volatility. Standard risk management applies.'
        
        return RegimeSignal(
            regime_type=regime,
            confidence=confidence,
            strength=atr_percentile,
            volatility_level=volatility_level,
            directional_bias='neutral',
            phase='volatility_analysis',
            indicators={
                'current_atr': current_atr,
                'avg_atr': avg_atr,
                'atr_percentile': atr_percentile,
                'bb_width': bb_width,
                'avg_bb_width': avg_bb_width
            },
            description=f'{volatility_level.upper()} VOLATILITY: ATR={current_atr:.5f} ({atr_percentile:.0f}th percentile)',
            trading_recommendation=recommendation
        )
    
    # ============ DIRECTIONAL BIAS ============
    
    def detect_directional_bias(self, df: pd.DataFrame) -> RegimeSignal:
        """
        Detect directional bias using multiple EMAs and price action
        
        Strong Bullish: Price > EMA9 > EMA21 > EMA50 > EMA200
        Strong Bearish: Price < EMA9 < EMA21 < EMA50 < EMA200
        """
        if len(df) < 200:
            return self._create_neutral_signal()
        
        current_price = df['close'].iloc[-1]
        ema_9 = df['ema_9'].iloc[-1]
        ema_21 = df['ema_21'].iloc[-1]
        ema_50 = df['ema_50'].iloc[-1]
        ema_200 = df['ema_200'].iloc[-1]
        
        # Check EMA alignment
        bullish_alignment = (current_price > ema_9 > ema_21 > ema_50 > ema_200)
        bearish_alignment = (current_price < ema_9 < ema_21 < ema_50 < ema_200)
        
        # Calculate bias score
        if bullish_alignment:
            bias = 'bullish'
            confidence = 95.0
            strength = 90.0
            description = 'STRONG BULLISH BIAS: Perfect EMA alignment. All timeframes bullish.'
            recommendation = 'Trade only long setups. Avoid shorts.'
        
        elif bearish_alignment:
            bias = 'bearish'
            confidence = 95.0
            strength = 90.0
            description = 'STRONG BEARISH BIAS: Perfect EMA alignment. All timeframes bearish.'
            recommendation = 'Trade only short setups. Avoid longs.'
        
        elif current_price > ema_50:
            bias = 'bullish'
            confidence = 70.0
            strength = 60.0
            description = 'BULLISH BIAS: Price above key EMAs. Uptrend likely.'
            recommendation = 'Favor long setups. Be cautious with shorts.'
        
        elif current_price < ema_50:
            bias = 'bearish'
            confidence = 70.0
            strength = 60.0
            description = 'BEARISH BIAS: Price below key EMAs. Downtrend likely.'
            recommendation = 'Favor short setups. Be cautious with longs.'
        
        else:
            bias = 'neutral'
            confidence = 60.0
            strength = 40.0
            description = 'NEUTRAL BIAS: Mixed signals. No clear direction.'
            recommendation = 'Wait for clearer setup. Trade both directions with caution.'
        
        return RegimeSignal(
            regime_type=MarketRegime.TRENDING_UP if bias == 'bullish' else MarketRegime.TRENDING_DOWN if bias == 'bearish' else MarketRegime.RANGING,
            confidence=confidence,
            strength=strength,
            volatility_level=self._classify_volatility(df),
            directional_bias=bias,
            phase='bias_analysis',
            indicators={
                'price': current_price,
                'ema_9': ema_9,
                'ema_21': ema_21,
                'ema_50': ema_50,
                'ema_200': ema_200
            },
            description=description,
            trading_recommendation=recommendation
        )
    
    # ============ TREND STRENGTH ============
    
    def detect_trend_strength(self, df: pd.DataFrame) -> RegimeSignal:
        """
        Measure trend strength using ADX + custom metrics
        
        ADX > 50: Very strong trend
        ADX 25-50: Strong trend
        ADX < 25: Weak/no trend
        """
        if len(df) < 50:
            return self._create_neutral_signal()
        
        adx = df['adx'].iloc[-1] if 'adx' in df.columns else 0
        plus_di = df['plus_di'].iloc[-1] if 'plus_di' in df.columns else 0
        minus_di = df['minus_di'].iloc[-1] if 'minus_di' in df.columns else 0
        
        # Determine direction
        if plus_di > minus_di:
            direction = 'bullish'
        else:
            direction = 'bearish'
        
        # Classify strength
        if adx > 50:
            strength_label = 'very_strong'
            confidence = 95.0
            description = f'VERY STRONG {direction.upper()} TREND: ADX={adx:.1f}. Powerful directional movement.'
            recommendation = f'High confidence {direction} trades. Trail stops aggressively.'
        
        elif adx > 25:
            strength_label = 'strong'
            confidence = 85.0
            description = f'STRONG {direction.upper()} TREND: ADX={adx:.1f}. Clear directional bias.'
            recommendation = f'Trade {direction} setups. Trend continuation likely.'
        
        elif adx > 20:
            strength_label = 'moderate'
            confidence = 70.0
            description = f'MODERATE {direction.upper()} TREND: ADX={adx:.1f}. Developing trend.'
            recommendation = f'Cautious {direction} trades. Watch for reversal signs.'
        
        else:
            strength_label = 'weak'
            confidence = 60.0
            description = f'WEAK/NO TREND: ADX={adx:.1f}. Ranging market.'
            recommendation = 'Avoid trend-following strategies. Trade mean reversion.'
        
        return RegimeSignal(
            regime_type=MarketRegime.TRENDING_UP if direction == 'bullish' else MarketRegime.TRENDING_DOWN,
            confidence=confidence,
            strength=adx,
            volatility_level=self._classify_volatility(df),
            directional_bias=direction,
            phase=strength_label,
            indicators={
                'adx': adx,
                'plus_di': plus_di,
                'minus_di': minus_di
            },
            description=description,
            trading_recommendation=recommendation
        )
    
    # ============ REGIME SHIFT DETECTION ============
    
    def detect_regime_shift(self, df: pd.DataFrame) -> RegimeSignal:
        """
        Detect regime shifts (trend → range, range → trend, etc.)
        
        Early detection of market phase changes
        """
        if len(df) < 100:
            return self._create_neutral_signal()
        
        # Compare current regime to recent history
        current_adx = df['adx'].iloc[-1] if 'adx' in df.columns else 0
        prev_adx = df['adx'].iloc[-20:-1].mean() if 'adx' in df.columns else 0
        
        # Detect shifts
        if current_adx > 25 and prev_adx < 20:
            shift_type = 'range_to_trend'
            confidence = 85.0
            description = 'REGIME SHIFT: Range → Trend. ADX rising. Breakout phase starting.'
            recommendation = 'Prepare for trend-following trades. Breakout setups favored.'
        
        elif current_adx < 20 and prev_adx > 25:
            shift_type = 'trend_to_range'
            confidence = 85.0
            description = 'REGIME SHIFT: Trend → Range. ADX falling. Consolidation phase starting.'
            recommendation = 'Switch to mean reversion. Avoid breakout trades.'
        
        else:
            shift_type = 'stable'
            confidence = 70.0
            description = 'STABLE REGIME: No significant shift detected.'
            recommendation = 'Continue current strategy.'
        
        return RegimeSignal(
            regime_type=MarketRegime.RANGING,
            confidence=confidence,
            strength=current_adx,
            volatility_level=self._classify_volatility(df),
            directional_bias='neutral',
            phase=shift_type,
            indicators={
                'current_adx': current_adx,
                'prev_adx': prev_adx,
                'shift_magnitude': abs(current_adx - prev_adx)
            },
            description=description,
            trading_recommendation=recommendation
        )
    
    # ============ ATR EXPANSION PHASE ============
    
    def detect_atr_phase(self, df: pd.DataFrame) -> RegimeSignal:
        """
        Detect ATR expansion/contraction phases
        
        Expansion: Volatility increasing
        Contraction: Volatility decreasing
        """
        if len(df) < 50:
            return self._create_neutral_signal()
        
        current_atr = df['atr'].iloc[-1] if 'atr' in df.columns else 0
        prev_atr = df['atr'].iloc[-20:-1].mean() if 'atr' in df.columns else 0
        
        atr_change = (current_atr - prev_atr) / prev_atr if prev_atr > 0 else 0
        
        if atr_change > 0.2:  # 20% increase
            phase = 'expansion'
            regime = MarketRegime.EXPANSION
            confidence = 85.0
            description = f'ATR EXPANSION: Volatility increasing {atr_change*100:.1f}%. Breakout phase.'
            recommendation = 'Widen stops. Expect larger moves. Good for breakout trades.'
        
        elif atr_change < -0.2:  # 20% decrease
            phase = 'contraction'
            regime = MarketRegime.COMPRESSION
            confidence = 85.0
            description = f'ATR CONTRACTION: Volatility decreasing {abs(atr_change)*100:.1f}%. Compression phase.'
            recommendation = 'Tighten stops. Expect breakout soon. Prepare for expansion.'
        
        else:
            phase = 'stable'
            regime = MarketRegime.RANGING
            confidence = 70.0
            description = 'ATR STABLE: Normal volatility. No significant change.'
            recommendation = 'Standard risk management.'
        
        return RegimeSignal(
            regime_type=regime,
            confidence=confidence,
            strength=abs(atr_change) * 100,
            volatility_level=self._classify_volatility(df),
            directional_bias='neutral',
            phase=phase,
            indicators={
                'current_atr': current_atr,
                'prev_atr': prev_atr,
                'atr_change': atr_change
            },
            description=description,
            trading_recommendation=recommendation
        )
    
    # ============ COMPRESSION → EXPLOSION ============
    
    def detect_compression_explosion(self, df: pd.DataFrame) -> RegimeSignal:
        """
        Detect compression → explosion pattern (TTM Squeeze logic)
        
        Compression: BB inside KC (squeeze)
        Explosion: BB breaks out of KC (fire)
        """
        if len(df) < 30:
            return self._create_neutral_signal()
        
        # Check if squeeze is on
        squeeze_on = df['squeeze_on'].iloc[-1] if 'squeeze_on' in df.columns else False
        prev_squeeze = df['squeeze_on'].iloc[-2] if 'squeeze_on' in df.columns else False
        
        # Check momentum
        momentum = df['momentum'].iloc[-1] if 'momentum' in df.columns else 0
        
        if not squeeze_on and prev_squeeze:
            # Squeeze just fired!
            direction = 'bullish' if momentum > 0 else 'bearish'
            regime = MarketRegime.EXPANSION
            confidence = 90.0
            description = f'EXPLOSION! Squeeze fired {direction}. Volatility expansion starting.'
            recommendation = f'High probability {direction} breakout. Enter immediately.'
        
        elif squeeze_on:
            regime = MarketRegime.COMPRESSION
            confidence = 80.0
            description = 'COMPRESSION: Squeeze active. Volatility contracting. Breakout imminent.'
            recommendation = 'Wait for squeeze fire. Prepare for breakout in either direction.'
        
        else:
            regime = MarketRegime.RANGING
            confidence = 60.0
            description = 'NORMAL: No squeeze pattern. Standard market conditions.'
            recommendation = 'Trade normally.'
        
        return RegimeSignal(
            regime_type=regime,
            confidence=confidence,
            strength=abs(momentum) if momentum else 50.0,
            volatility_level=self._classify_volatility(df),
            directional_bias='bullish' if momentum > 0 else 'bearish' if momentum < 0 else 'neutral',
            phase='compression' if squeeze_on else 'explosion' if not squeeze_on and prev_squeeze else 'normal',
            indicators={
                'squeeze_on': squeeze_on,
                'momentum': momentum
            },
            description=description,
            trading_recommendation=recommendation
        )
    
    # ============ MARKET CYCLE DETECTION ============
    
    def detect_market_cycle(self, df: pd.DataFrame) -> RegimeSignal:
        """
        Detect Wyckoff market cycle phases:
        1. Accumulation (smart money buying)
        2. Markup (uptrend)
        3. Distribution (smart money selling)
        4. Markdown (downtrend)
        """
        if len(df) < 100:
            return self._create_neutral_signal()
        
        # Simplified cycle detection
        # In production, would use more sophisticated Wyckoff analysis
        
        # Use volume + price action
        volume_trend = self._analyze_volume_trend(df)
        price_trend = self._analyze_structure(df)
        
        # Classify cycle phase
        if price_trend == 'ranging' and volume_trend == 'increasing':
            phase = 'accumulation'
            regime = MarketRegime.ACCUMULATION
            confidence = 75.0
            description = 'ACCUMULATION PHASE: Smart money buying. Range-bound with increasing volume.'
            recommendation = 'Prepare for markup. Accumulate on dips.'

            # --- GURU UPGRADE: WYCKOFF SPRING DETECTION ---
            # Check for Spring: Break below support range followed by reclaim with specific volume
            recent_lows = df['low'].iloc[-20:].min()
            current_low = df['low'].iloc[-1]
            current_close = df['close'].iloc[-1]
            
            # If we pierced the low but closed back inside/above (Hammer/Pinbar logic)
            # Find support level (approximate min of last 50 bars excluding last 5)
            support_level = df['low'].iloc[-50:-5].min()
            
            if df['low'].iloc[-1] < support_level and df['close'].iloc[-1] > support_level:
                # We have a potential spring (dip below support and reclaim)
                
                # Volume Signature Check
                current_vol = df['volume'].iloc[-1] if 'volume' in df.columns else 0
                avg_vol = df['volume'].iloc[-20:].mean() if 'volume' in df.columns else 0
                
                # Spring Type #3 (Low Volume Test) - Best for trading
                if current_vol < avg_vol * 0.8:
                     description = 'WYCKOFF SPRING (Type 3): Low volume test of support. Supply exhausted.'
                     recommendation = 'STRONG ACCUMULATION SIGNAL. Enter Long with stop below low.'
                     confidence = 92.0
                     phase = 'spring'
                
                # Shakeout (High Volume Absorption)
                elif current_vol > avg_vol * 1.5:
                     description = 'WYCKOFF SHAKEOUT: High volume rejection of lows. Absorption occurring.'
                     recommendation = 'Enter Long on break of high. Volatile bottom.'
                     confidence = 88.0
                     phase = 'shakeout'

        elif price_trend == 'HH_HL':
            phase = 'markup'
            regime = MarketRegime.MARKUP
            confidence = 85.0
            description = 'MARKUP PHASE: Uptrend in progress. Higher highs and higher lows.'
            recommendation = 'Trade long. Ride the trend. Trail stops.'
        
        elif price_trend == 'ranging' and volume_trend == 'decreasing':
            phase = 'distribution'
            regime = MarketRegime.DISTRIBUTION
            confidence = 75.0
            description = 'DISTRIBUTION PHASE: Smart money selling. Range-bound with decreasing volume.'
            recommendation = 'Prepare for markdown. Reduce longs. Consider shorts.'
            
            # --- GURU UPGRADE: UPTHRUST (UTAD) ---
            resistance_level = df['high'].iloc[-50:-5].max()
            if df['high'].iloc[-1] > resistance_level and df['close'].iloc[-1] < resistance_level:
                 description = 'WYCKOFF UPTHRUST (UTAD): False breakout above resistance.'
                 recommendation = 'STRONG DISTRIBUTION SIGNAL. Enter Short with stop above high.'
                 confidence = 92.0
                 phase = 'upthrust'
        
        elif price_trend == 'LH_LL':
            phase = 'markdown'
            regime = MarketRegime.MARKDOWN
            confidence = 85.0
            description = 'MARKDOWN PHASE: Downtrend in progress. Lower highs and lower lows.'
            recommendation = 'Trade short. Ride the downtrend. Trail stops.'
        
        else:
            phase = 'transition'
            regime = MarketRegime.RANGING
            confidence = 60.0
            description = 'TRANSITION PHASE: Between cycles. Unclear direction.'
            recommendation = 'Wait for clearer phase. Reduce position size.'
        
        return RegimeSignal(
            regime_type=regime,
            confidence=confidence,
            strength=70.0,
            volatility_level=self._classify_volatility(df),
            directional_bias='bullish' if phase in ['accumulation', 'markup', 'spring', 'shakeout'] else 'bearish' if phase in ['distribution', 'markdown', 'upthrust'] else 'neutral',
            phase=phase,
            indicators={
                'volume_trend': volume_trend,
                'price_trend': price_trend
            },
            description=description,
            trading_recommendation=recommendation
        )
    
    # ============ HELPER METHODS ============
    
    def _calculate_indicators(self, df: pd.DataFrame) -> pd.DataFrame:
        """Calculate all required indicators"""
        # EMAs
        for period in [9, 21, 50, 200]:
            if f'ema_{period}' not in df.columns:
                df[f'ema_{period}'] = df['close'].ewm(span=period, adjust=False).mean()
        
        # ATR
        if 'atr' not in df.columns:
            df['tr'] = np.maximum(
                df['high'] - df['low'],
                np.maximum(
                    abs(df['high'] - df['close'].shift(1)),
                    abs(df['low'] - df['close'].shift(1))
                )
            )
            df['atr'] = df['tr'].rolling(self.atr_period).mean()
        
        # Bollinger Bands
        if 'bb_middle' not in df.columns:
            df['bb_middle'] = df['close'].rolling(self.bb_period).mean()
            df['bb_std'] = df['close'].rolling(self.bb_period).std()
            df['bb_upper'] = df['bb_middle'] + (self.bb_std * df['bb_std'])
            df['bb_lower'] = df['bb_middle'] - (self.bb_std * df['bb_std'])
        
        # ADX (simplified - would use full ADX calculation in production)
        if 'adx' not in df.columns:
            df['adx'] = 25.0  # Placeholder
            df['plus_di'] = 25.0
            df['minus_di'] = 25.0
        
        # TTM Squeeze indicators
        if 'squeeze_on' not in df.columns:
            df['squeeze_on'] = False
            df['momentum'] = 0.0
        
        return df
    
    def _analyze_structure(self, df: pd.DataFrame) -> str:
        """Analyze market structure"""
        if len(df) < 20:
            return 'ranging'
        
        from scipy.signal import argrelextrema
        
        highs = df['high'].values
        lows = df['low'].values
        
        swing_highs_idx = argrelextrema(highs, np.greater, order=5)[0]
        swing_lows_idx = argrelextrema(lows, np.less, order=5)[0]
        
        if len(swing_highs_idx) >= 2 and len(swing_lows_idx) >= 2:
            if highs[swing_highs_idx[-1]] > highs[swing_highs_idx[-2]] and lows[swing_lows_idx[-1]] > lows[swing_lows_idx[-2]]:
                return 'HH_HL'  # Uptrend
            elif highs[swing_highs_idx[-1]] < highs[swing_highs_idx[-2]] and lows[swing_lows_idx[-1]] < lows[swing_lows_idx[-2]]:
                return 'LH_LL'  # Downtrend
        
        return 'ranging'
    
    def _analyze_volume_trend(self, df: pd.DataFrame) -> str:
        """Analyze volume trend"""
        if 'volume' not in df.columns or len(df) < 20:
            return 'stable'
        
        recent_volume = df['volume'].iloc[-10:].mean()
        prev_volume = df['volume'].iloc[-30:-10].mean()
        
        if recent_volume > prev_volume * 1.2:
            return 'increasing'
        elif recent_volume < prev_volume * 0.8:
            return 'decreasing'
        
        return 'stable'
    
    def _classify_volatility(self, df: pd.DataFrame) -> str:
        """Classify current volatility level"""
        if 'atr' not in df.columns or len(df) < 50:
            return 'normal'
        
        current_atr = df['atr'].iloc[-1]
        avg_atr = df['atr'].rolling(50).mean().iloc[-1]
        
        if current_atr > avg_atr * 1.5:
            return 'extreme'
        elif current_atr > avg_atr * 1.2:
            return 'high'
        elif current_atr < avg_atr * 0.7:
            return 'low'
        
        return 'normal'
    
    def _create_neutral_signal(self) -> RegimeSignal:
        """Create neutral signal for insufficient data"""
        return RegimeSignal(
            regime_type=MarketRegime.RANGING,
            confidence=50.0,
            strength=50.0,
            volatility_level='normal',
            directional_bias='neutral',
            phase='insufficient_data',
            indicators={},
            description='Insufficient data for regime analysis.',
            trading_recommendation='Wait for more data.'
        )
    
    def to_dict(self, signal: RegimeSignal) -> Dict:
        """Convert to dictionary"""
        return {
            'regime_type': signal.regime_type.value,
            'confidence': signal.confidence,
            'strength': signal.strength,
            'volatility_level': signal.volatility_level,
            'directional_bias': signal.directional_bias,
            'phase': signal.phase,
            'indicators': signal.indicators,
            'description': signal.description,
            'trading_recommendation': signal.trading_recommendation
        }


# Export
def detect_market_regime(df: pd.DataFrame) -> Dict[str, Dict]:
    """Main function to detect market regime"""
    detector = MarketRegimeDetector()
    all_regimes = detector.detect_all(df)
    
    return {
        category: detector.to_dict(signal)
        for category, signal in all_regimes.items()
    }
