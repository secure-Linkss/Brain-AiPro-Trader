"""
Multi-Timeframe Confluence Analysis System
Advanced implementation for determining signal strength across multiple timeframes
"""

import pandas as pd
import numpy as np
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
from datetime import datetime
from enum import Enum


class Timeframe(Enum):
    """Supported timeframes for analysis"""
    M1 = "1m"
    M5 = "5m"
    M15 = "15m"
    M30 = "30m"
    H1 = "1h"
    H4 = "4h"
    D1 = "1d"
    W1 = "1w"


class TrendDirection(Enum):
    """Trend direction classification"""
    STRONG_BULLISH = "strong_bullish"
    BULLISH = "bullish"
    NEUTRAL = "neutral"
    BEARISH = "bearish"
    STRONG_BEARISH = "strong_bearish"


@dataclass
class TimeframeAnalysis:
    """Analysis results for a single timeframe"""
    timeframe: Timeframe
    trend: TrendDirection
    strength: float  # 0-100
    price: float
    sma_20: float
    sma_50: float
    sma_200: float
    rsi: float
    macd_histogram: float
    volume_ratio: float  # Current volume vs average
    support_level: Optional[float]
    resistance_level: Optional[float]
    timestamp: datetime


@dataclass
class ConfluenceResult:
    """Final confluence analysis result"""
    symbol: str
    overall_trend: TrendDirection
    confluence_score: float  # 0-100 (100 = perfect alignment)
    timeframes_analyzed: int
    bullish_timeframes: int
    bearish_timeframes: int
    neutral_timeframes: int
    dominant_timeframe: Timeframe
    signal_strength: str  # "weak", "moderate", "strong", "very_strong"
    recommended_action: str  # "buy", "sell", "hold"
    detailed_analysis: List[TimeframeAnalysis]
    entry_price: float
    stop_loss: float
    take_profit_1: float
    take_profit_2: float
    take_profit_3: float
    risk_reward_ratio: float
    timestamp: datetime


class TimeframeAnalyzer:
    """
    Advanced multi-timeframe analysis engine
    Analyzes price action, trends, and technical indicators across multiple timeframes
    """
    
    # Timeframe weights for confluence scoring (higher timeframes = more weight)
    TIMEFRAME_WEIGHTS = {
        Timeframe.M1: 0.5,
        Timeframe.M5: 0.7,
        Timeframe.M15: 1.0,
        Timeframe.M30: 1.2,
        Timeframe.H1: 1.5,
        Timeframe.H4: 2.0,
        Timeframe.D1: 2.5,
        Timeframe.W1: 3.0
    }
    
    def __init__(self, data_provider):
        """
        Initialize the timeframe analyzer
        
        Args:
            data_provider: Service that provides OHLCV data for different timeframes
        """
        self.data_provider = data_provider
        
    async def analyze_symbol(
        self,
        symbol: str,
        timeframes: List[Timeframe] = None
    ) -> ConfluenceResult:
        """
        Perform comprehensive multi-timeframe analysis on a symbol
        
        Args:
            symbol: Trading pair (e.g., "EURUSD", "BTCUSDT")
            timeframes: List of timeframes to analyze (defaults to H1, H4, D1, W1)
            
        Returns:
            ConfluenceResult with complete analysis
        """
        if timeframes is None:
            timeframes = [Timeframe.H1, Timeframe.H4, Timeframe.D1, Timeframe.W1]
            
        # Analyze each timeframe
        analyses = []
        for tf in timeframes:
            analysis = await self._analyze_single_timeframe(symbol, tf)
            if analysis:
                analyses.append(analysis)
                
        if not analyses:
            raise ValueError(f"No data available for {symbol}")
            
        # Calculate confluence
        confluence = self._calculate_confluence(symbol, analyses)
        
        return confluence
    
    async def _analyze_single_timeframe(
        self,
        symbol: str,
        timeframe: Timeframe
    ) -> Optional[TimeframeAnalysis]:
        """
        Analyze a single timeframe for trend and strength
        
        Returns:
            TimeframeAnalysis or None if data unavailable
        """
        try:
            # Fetch OHLCV data (last 500 candles for indicators)
            df = await self.data_provider.get_ohlcv(
                symbol=symbol,
                timeframe=timeframe.value,
                limit=500
            )
            
            if df is None or len(df) < 200:
                return None
                
            # Calculate technical indicators
            df = self._add_indicators(df)
            
            # Get latest values
            latest = df.iloc[-1]
            price = latest['close']
            
            # Determine trend
            trend = self._determine_trend(df)
            
            # Calculate trend strength
            strength = self._calculate_trend_strength(df, trend)
            
            # Find support and resistance
            support, resistance = self._find_support_resistance(df)
            
            return TimeframeAnalysis(
                timeframe=timeframe,
                trend=trend,
                strength=strength,
                price=price,
                sma_20=latest['sma_20'],
                sma_50=latest['sma_50'],
                sma_200=latest['sma_200'],
                rsi=latest['rsi'],
                macd_histogram=latest['macd_histogram'],
                volume_ratio=latest['volume'] / latest['volume_avg'],
                support_level=support,
                resistance_level=resistance,
                timestamp=datetime.now()
            )
            
        except Exception as e:
            print(f"Error analyzing {symbol} on {timeframe.value}: {str(e)}")
            return None
    
    def _add_indicators(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Add all technical indicators to the dataframe
        
        Uses vectorized pandas operations for performance
        """
        # Moving Averages
        df['sma_20'] = df['close'].rolling(window=20).mean()
        df['sma_50'] = df['close'].rolling(window=50).mean()
        df['sma_200'] = df['close'].rolling(window=200).mean()
        df['ema_12'] = df['close'].ewm(span=12, adjust=False).mean()
        df['ema_26'] = df['close'].ewm(span=26, adjust=False).mean()
        
        # RSI
        delta = df['close'].diff()
        gain = (delta.where(delta > 0, 0)).rolling(window=14).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
        rs = gain / loss
        df['rsi'] = 100 - (100 / (1 + rs))
        
        # MACD
        df['macd'] = df['ema_12'] - df['ema_26']
        df['macd_signal'] = df['macd'].ewm(span=9, adjust=False).mean()
        df['macd_histogram'] = df['macd'] - df['macd_signal']
        
        # Bollinger Bands
        df['bb_middle'] = df['close'].rolling(window=20).mean()
        bb_std = df['close'].rolling(window=20).std()
        df['bb_upper'] = df['bb_middle'] + (2 * bb_std)
        df['bb_lower'] = df['bb_middle'] - (2 * bb_std)
        
        # ATR (Average True Range)
        high_low = df['high'] - df['low']
        high_close = np.abs(df['high'] - df['close'].shift())
        low_close = np.abs(df['low'] - df['close'].shift())
        ranges = pd.concat([high_low, high_close, low_close], axis=1)
        true_range = ranges.max(axis=1)
        df['atr'] = true_range.rolling(14).mean()
        
        # Volume analysis
        df['volume_avg'] = df['volume'].rolling(window=20).mean()
        
        return df
    
    def _determine_trend(self, df: pd.DataFrame) -> TrendDirection:
        """
        Determine the trend direction using multiple confirmations
        
        Uses:
        - SMA crossovers (20, 50, 200)
        - Price position relative to SMAs
        - MACD direction
        - RSI levels
        """
        latest = df.iloc[-1]
        price = latest['close']
        sma_20 = latest['sma_20']
        sma_50 = latest['sma_50']
        sma_200 = latest['sma_200']
        macd_hist = latest['macd_histogram']
        rsi = latest['rsi']
        
        bullish_signals = 0
        bearish_signals = 0
        
        # SMA alignment
        if sma_20 > sma_50 > sma_200:
            bullish_signals += 2
        elif sma_20 < sma_50 < sma_200:
            bearish_signals += 2
            
        # Price vs SMAs
        if price > sma_20:
            bullish_signals += 1
        else:
            bearish_signals += 1
            
        if price > sma_50:
            bullish_signals += 1
        else:
            bearish_signals += 1
            
        # MACD
        if macd_hist > 0:
            bullish_signals += 1
        else:
            bearish_signals += 1
            
        # RSI
        if rsi > 60:
            bullish_signals += 1
        elif rsi < 40:
            bearish_signals += 1
            
        # Determine trend
        if bullish_signals >= 5:
            return TrendDirection.STRONG_BULLISH
        elif bullish_signals >= 3:
            return TrendDirection.BULLISH
        elif bearish_signals >= 5:
            return TrendDirection.STRONG_BEARISH
        elif bearish_signals >= 3:
            return TrendDirection.BEARISH
        else:
            return TrendDirection.NEUTRAL
    
    def _calculate_trend_strength(
        self,
        df: pd.DataFrame,
        trend: TrendDirection
    ) -> float:
        """
        Calculate trend strength (0-100)
        
        Based on:
        - ADX (trend strength indicator)
        - Distance from moving averages
        - MACD histogram magnitude
        - Volume confirmation
        """
        latest = df.iloc[-1]
        
        # Simplified ADX calculation (directional movement)
        plus_dm = (df['high'] - df['high'].shift()).clip(lower=0)
        minus_dm = (df['low'].shift() - df['low']).clip(lower=0)
        
        plus_di = 100 * (plus_dm.rolling(14).mean() / latest['atr'])
        minus_di = 100 * (minus_dm.rolling(14).mean() / latest['atr'])
        
        dx = 100 * np.abs(plus_di - minus_di) / (plus_di + minus_di)
        adx = dx.rolling(14).mean().iloc[-1]
        
        # Normalize ADX to 0-100
        strength = min(adx, 100)
        
        # Adjust based on volume
        if latest['volume'] > latest['volume_avg']:
            strength *= 1.1  # Boost if volume confirms
        else:
            strength *= 0.9  # Reduce if volume doesn't confirm
            
        return min(strength, 100)
    
    def _find_support_resistance(
        self,
        df: pd.DataFrame
    ) -> Tuple[Optional[float], Optional[float]]:
        """
        Find nearest support and resistance levels
        
        Uses:
        - Recent swing highs/lows
        - Bollinger Bands
        - Round numbers
        """
        recent_data = df.tail(50)
        current_price = df.iloc[-1]['close']
        
        # Find swing lows (support candidates)
        swing_lows = recent_data[
            (recent_data['low'] < recent_data['low'].shift(1)) &
            (recent_data['low'] < recent_data['low'].shift(-1))
        ]['low']
        
        support = swing_lows[swing_lows < current_price].max() if len(swing_lows) > 0 else None
        
        # Find swing highs (resistance candidates)
        swing_highs = recent_data[
            (recent_data['high'] > recent_data['high'].shift(1)) &
            (recent_data['high'] > recent_data['high'].shift(-1))
        ]['high']
        
        resistance = swing_highs[swing_highs > current_price].min() if len(swing_highs) > 0 else None
        
        # Fallback to Bollinger Bands
        if support is None:
            support = df.iloc[-1]['bb_lower']
        if resistance is None:
            resistance = df.iloc[-1]['bb_upper']
            
        return support, resistance
    
    def _calculate_confluence(
        self,
        symbol: str,
        analyses: List[TimeframeAnalysis]
    ) -> ConfluenceResult:
        """
        Calculate overall confluence across all timeframes
        
        Uses weighted voting system where higher timeframes have more influence
        """
        # Count trends
        bullish_count = sum(1 for a in analyses if a.trend in [TrendDirection.BULLISH, TrendDirection.STRONG_BULLISH])
        bearish_count = sum(1 for a in analyses if a.trend in [TrendDirection.BEARISH, TrendDirection.STRONG_BEARISH])
        neutral_count = sum(1 for a in analyses if a.trend == TrendDirection.NEUTRAL)
        
        # Calculate weighted score
        total_weight = 0
        weighted_score = 0
        
        for analysis in analyses:
            weight = self.TIMEFRAME_WEIGHTS[analysis.timeframe]
            total_weight += weight
            
            if analysis.trend in [TrendDirection.STRONG_BULLISH, TrendDirection.BULLISH]:
                weighted_score += weight * (analysis.strength / 100)
            elif analysis.trend in [TrendDirection.STRONG_BEARISH, TrendDirection.BEARISH]:
                weighted_score -= weight * (analysis.strength / 100)
                
        # Normalize to 0-100
        normalized_score = ((weighted_score / total_weight) + 1) * 50
        
        # Determine overall trend
        if normalized_score >= 70:
            overall_trend = TrendDirection.STRONG_BULLISH
        elif normalized_score >= 55:
            overall_trend = TrendDirection.BULLISH
        elif normalized_score <= 30:
            overall_trend = TrendDirection.STRONG_BEARISH
        elif normalized_score <= 45:
            overall_trend = TrendDirection.BEARISH
        else:
            overall_trend = TrendDirection.NEUTRAL
            
        # Find dominant timeframe (highest weight with strongest trend)
        dominant = max(analyses, key=lambda a: self.TIMEFRAME_WEIGHTS[a.timeframe] * a.strength)
        
        # Determine signal strength
        if abs(normalized_score - 50) >= 30:
            signal_strength = "very_strong"
        elif abs(normalized_score - 50) >= 20:
            signal_strength = "strong"
        elif abs(normalized_score - 50) >= 10:
            signal_strength = "moderate"
        else:
            signal_strength = "weak"
            
        # Determine recommended action
        if normalized_score >= 65 and signal_strength in ["strong", "very_strong"]:
            action = "buy"
        elif normalized_score <= 35 and signal_strength in ["strong", "very_strong"]:
            action = "sell"
        else:
            action = "hold"
            
        # Calculate entry/exit levels
        current_price = analyses[0].price
        atr = (current_price * 0.015)  # Approximate ATR as 1.5% of price
        
        if action == "buy":
            entry = current_price
            stop_loss = entry - (2 * atr)
            take_profit_1 = entry + (1.5 * atr)
            take_profit_2 = entry + (3 * atr)
            take_profit_3 = entry + (5 * atr)
        elif action == "sell":
            entry = current_price
            stop_loss = entry + (2 * atr)
            take_profit_1 = entry - (1.5 * atr)
            take_profit_2 = entry - (3 * atr)
            take_profit_3 = entry - (5 * atr)
        else:
            entry = current_price
            stop_loss = current_price
            take_profit_1 = current_price
            take_profit_2 = current_price
            take_profit_3 = current_price
            
        # Calculate R:R ratio
        risk = abs(entry - stop_loss)
        reward = abs(take_profit_1 - entry)
        risk_reward = reward / risk if risk > 0 else 0
        
        return ConfluenceResult(
            symbol=symbol,
            overall_trend=overall_trend,
            confluence_score=normalized_score,
            timeframes_analyzed=len(analyses),
            bullish_timeframes=bullish_count,
            bearish_timeframes=bearish_count,
            neutral_timeframes=neutral_count,
            dominant_timeframe=dominant.timeframe,
            signal_strength=signal_strength,
            recommended_action=action,
            detailed_analysis=analyses,
            entry_price=entry,
            stop_loss=stop_loss,
            take_profit_1=take_profit_1,
            take_profit_2=take_profit_2,
            take_profit_3=take_profit_3,
            risk_reward_ratio=risk_reward,
            timestamp=datetime.now()
        )


class ConfluenceScorer:
    """
    Utility class for scoring and ranking signals by confluence
    """
    
    @staticmethod
    def score_signal(result: ConfluenceResult) -> float:
        """
        Calculate a single score for ranking signals
        
        Returns:
            Score from 0-100 (higher = better signal)
        """
        # Base score from confluence
        score = result.confluence_score
        
        # Boost for alignment (all timeframes agree)
        if result.bullish_timeframes == result.timeframes_analyzed:
            score += 10
        elif result.bearish_timeframes == result.timeframes_analyzed:
            score += 10
            
        # Boost for strong signals
        if result.signal_strength == "very_strong":
            score += 15
        elif result.signal_strength == "strong":
            score += 10
        elif result.signal_strength == "moderate":
            score += 5
            
        # Boost for good R:R ratio
        if result.risk_reward_ratio >= 3:
            score += 10
        elif result.risk_reward_ratio >= 2:
            score += 5
            
        return min(score, 100)
    
    @staticmethod
    def filter_quality_signals(
        results: List[ConfluenceResult],
        min_confluence: float = 60,
        min_strength: str = "moderate"
    ) -> List[ConfluenceResult]:
        """
        Filter signals by quality criteria
        
        Args:
            results: List of confluence results
            min_confluence: Minimum confluence score (0-100)
            min_strength: Minimum signal strength
            
        Returns:
            Filtered list of quality signals
        """
        strength_order = ["weak", "moderate", "strong", "very_strong"]
        min_strength_idx = strength_order.index(min_strength)
        
        filtered = []
        for result in results:
            if result.confluence_score >= min_confluence:
                signal_idx = strength_order.index(result.signal_strength)
                if signal_idx >= min_strength_idx:
                    filtered.append(result)
                    
        return filtered


# Export all classes
__all__ = [
    'Timeframe',
    'TrendDirection',
    'TimeframeAnalysis',
    'ConfluenceResult',
    'TimeframeAnalyzer',
    'ConfluenceScorer'
]
