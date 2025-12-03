import pandas as pd
import numpy as np
from typing import Dict, Optional

class OrderFlowAnalyzer:
    """
    Advanced Order Flow Analysis
    - Volume Profile
    - Delta Analysis (Buy vs Sell volume)
    - Cumulative Delta
    - Volume Imbalance
    - Absorption/Exhaustion
    """
    
    def __init__(self):
        pass
    
    def analyze_order_flow(self, df: pd.DataFrame) -> Optional[Dict]:
        """
        Comprehensive order flow analysis
        """
        if len(df) < 20:
            return None
        
        # Calculate volume metrics
        volume_profile = self.calculate_volume_profile(df)
        delta = self.calculate_delta(df)
        cumulative_delta = self.calculate_cumulative_delta(df)
        imbalance = self.detect_volume_imbalance(df)
        
        # Determine order flow bias
        bias = self.determine_bias(delta, cumulative_delta, imbalance)
        
        return {
            'volume_profile': volume_profile,
            'delta': delta,
            'cumulative_delta': cumulative_delta,
            'imbalance': imbalance,
            'bias': bias,
            'signal': self.generate_signal(bias, imbalance)
        }
    
    def calculate_volume_profile(self, df: pd.DataFrame) -> Dict:
        """
        Calculate Volume Profile (POC, VAH, VAL)
        """
        # Create price bins
        price_range = df['high'].max() - df['low'].min()
        num_bins = 50
        bin_size = price_range / num_bins
        
        # Aggregate volume by price level
        volume_by_price = {}
        
        for _, row in df.iterrows():
            # Distribute volume across price range
            low, high, volume = row['low'], row['high'], row.get('volume', 0)
            
            if volume == 0:
                continue
                
            price_levels = np.arange(low, high, bin_size)
            volume_per_level = volume / len(price_levels) if len(price_levels) > 0 else volume
            
            for price in price_levels:
                price_key = round(price / bin_size) * bin_size
                volume_by_price[price_key] = volume_by_price.get(price_key, 0) + volume_per_level
        
        if not volume_by_price:
            return {'poc': 0, 'vah': 0, 'val': 0}
        
        # Find Point of Control (POC) - price with highest volume
        poc = max(volume_by_price, key=volume_by_price.get)
        
        # Calculate Value Area (70% of volume)
        total_volume = sum(volume_by_price.values())
        target_volume = total_volume * 0.70
        
        sorted_prices = sorted(volume_by_price.items(), key=lambda x: x[1], reverse=True)
        
        value_area_volume = 0
        value_area_prices = []
        
        for price, vol in sorted_prices:
            value_area_prices.append(price)
            value_area_volume += vol
            if value_area_volume >= target_volume:
                break
        
        vah = max(value_area_prices) if value_area_prices else poc
        val = min(value_area_prices) if value_area_prices else poc
        
        return {
            'poc': poc,  # Point of Control
            'vah': vah,  # Value Area High
            'val': val   # Value Area Low
        }
    
    def calculate_delta(self, df: pd.DataFrame) -> float:
        """
        Calculate Delta (Buy Volume - Sell Volume)
        Approximation: Up candles = buy, Down candles = sell
        """
        if 'volume' not in df.columns:
            return 0
        
        buy_volume = df[df['close'] > df['open']]['volume'].sum()
        sell_volume = df[df['close'] < df['open']]['volume'].sum()
        
        delta = buy_volume - sell_volume
        
        return delta
    
    def calculate_cumulative_delta(self, df: pd.DataFrame) -> pd.Series:
        """
        Calculate Cumulative Delta over time
        """
        if 'volume' not in df.columns:
            return pd.Series([0] * len(df))
        
        delta_series = []
        
        for _, row in df.iterrows():
            if row['close'] > row['open']:
                delta_series.append(row['volume'])
            elif row['close'] < row['open']:
                delta_series.append(-row['volume'])
            else:
                delta_series.append(0)
        
        cumulative = pd.Series(delta_series).cumsum()
        
        return cumulative
    
    def detect_volume_imbalance(self, df: pd.DataFrame) -> Dict:
        """
        Detect volume imbalances (areas where one side dominates)
        """
        recent_candles = df.tail(10)
        
        if 'volume' not in recent_candles.columns:
            return {'detected': False}
        
        buy_candles = recent_candles[recent_candles['close'] > recent_candles['open']]
        sell_candles = recent_candles[recent_candles['close'] < recent_candles['open']]
        
        buy_volume = buy_candles['volume'].sum()
        sell_volume = sell_candles['volume'].sum()
        
        total_volume = buy_volume + sell_volume
        
        if total_volume == 0:
            return {'detected': False}
        
        buy_ratio = buy_volume / total_volume
        sell_ratio = sell_volume / total_volume
        
        # Imbalance if one side > 70%
        if buy_ratio > 0.70:
            return {
                'detected': True,
                'type': 'bullish',
                'ratio': buy_ratio,
                'strength': 'strong' if buy_ratio > 0.80 else 'moderate'
            }
        elif sell_ratio > 0.70:
            return {
                'detected': True,
                'type': 'bearish',
                'ratio': sell_ratio,
                'strength': 'strong' if sell_ratio > 0.80 else 'moderate'
            }
        
        return {'detected': False}
    
    def determine_bias(self, delta: float, cumulative_delta: pd.Series, imbalance: Dict) -> str:
        """
        Determine overall order flow bias
        """
        signals = []
        
        # Delta bias
        if delta > 0:
            signals.append('bullish')
        elif delta < 0:
            signals.append('bearish')
        
        # Cumulative delta trend
        if len(cumulative_delta) >= 2:
            if cumulative_delta.iloc[-1] > cumulative_delta.iloc[-10]:
                signals.append('bullish')
            else:
                signals.append('bearish')
        
        # Imbalance bias
        if imbalance.get('detected'):
            signals.append(imbalance['type'])
        
        # Majority vote
        bullish_count = signals.count('bullish')
        bearish_count = signals.count('bearish')
        
        if bullish_count > bearish_count:
            return 'bullish'
        elif bearish_count > bullish_count:
            return 'bearish'
        else:
            return 'neutral'
    
    def generate_signal(self, bias: str, imbalance: Dict) -> Optional[Dict]:
        """
        Generate trading signal from order flow
        """
        if bias == 'neutral':
            return None
        
        strength = imbalance.get('strength', 'moderate') if imbalance.get('detected') else 'weak'
        
        confidence_map = {
            'strong': 85,
            'moderate': 75,
            'weak': 65
        }
        
        return {
            'signal': 'BUY' if bias == 'bullish' else 'SELL',
            'confidence': confidence_map[strength],
            'reason': f'{bias.capitalize()} order flow detected with {strength} imbalance'
        }

analyzer = OrderFlowAnalyzer()
