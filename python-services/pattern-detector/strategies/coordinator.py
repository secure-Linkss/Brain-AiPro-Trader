"""
Strategy Coordinator
Runs all 15 strategies and aggregates signals with success rate tracking
"""

import pandas as pd
from typing import List, Dict, Optional
from .momentum import (
    MACDDivergenceStrategy,
    RSIBollingerStrategy,
    StochasticEMAStrategy,
    CCIStrategy,
    WilliamsRStrategy
)
from .trend import (
    GoldenCrossStrategy,
    IchimokuStrategy,
    ADXTrendStrategy,
    SuperTrendStrategy,
    TripleEMAStrategy
)
from .volatility import (
    VWAPStrategy,
    ParabolicSARStrategy,
    FibonacciRetracementStrategy,
    ATRBreakoutStrategy,
    EngulfingVolumeStrategy
)
from .advanced_price_action import (
    SupplyDemandStrategy,
    LiquiditySweepStrategy,
    TrendlineStrategy,
    EMACloudStrategy
)
from ..detectors.elliott_wave import ElliottWaveDetector

class StrategyCoordinator:
    def __init__(self):
        self.strategies = [
            # Momentum (5)
            MACDDivergenceStrategy(),
            RSIBollingerStrategy(),
            StochasticEMAStrategy(),
            CCIStrategy(),
            WilliamsRStrategy(),
            # Trend (5)
            GoldenCrossStrategy(),
            IchimokuStrategy(),
            ADXTrendStrategy(),
            SuperTrendStrategy(),
            TripleEMAStrategy(),
            # Volatility & Price Action (5)
            VWAPStrategy(),
            ParabolicSARStrategy(),
            FibonacciRetracementStrategy(),
            ATRBreakoutStrategy(),
            EngulfingVolumeStrategy(),
            # Advanced Price Action (4)
            SupplyDemandStrategy(),
            LiquiditySweepStrategy(),
            TrendlineStrategy(),
            EMACloudStrategy(),
            # Patterns
            ElliottWaveDetector()
        ]
        
    def analyze_all(self, df: pd.DataFrame) -> List[Dict]:
        """
        Run all strategies and return signals
        """
        signals = []
        
        for strategy in self.strategies:
            try:
                result = strategy.analyze(df)
                if result:
                    signals.append(result)
            except Exception as e:
                print(f"Error in {strategy.name}: {str(e)}")
                continue
                
        return signals
    
    def get_consensus_signal(self, df: pd.DataFrame) -> Optional[Dict]:
        """
        Get consensus signal from multiple strategies
        Returns the strongest signal with highest confidence
        """
        signals = self.analyze_all(df)
        
        if not signals:
            return None
            
        # Count BUY vs SELL
        buy_signals = [s for s in signals if s['signal'] == 'BUY']
        sell_signals = [s for s in signals if s['signal'] == 'SELL']
        
        # Calculate weighted confidence
        if len(buy_signals) > len(sell_signals):
            avg_confidence = sum(s['confidence'] for s in buy_signals) / len(buy_signals)
            strategies_used = [s['strategy'] for s in buy_signals]
            
            return {
                'signal': 'BUY',
                'confidence': avg_confidence,
                'strategy_count': len(buy_signals),
                'strategies': strategies_used,
                'stop_loss': min(s['stop_loss'] for s in buy_signals),
                'take_profit': max(s['take_profit'] for s in buy_signals),
                'reason': f"{len(buy_signals)}/{len(signals)} strategies agree on BUY"
            }
        elif len(sell_signals) > len(buy_signals):
            avg_confidence = sum(s['confidence'] for s in sell_signals) / len(sell_signals)
            strategies_used = [s['strategy'] for s in sell_signals]
            
            return {
                'signal': 'SELL',
                'confidence': avg_confidence,
                'strategy_count': len(sell_signals),
                'strategies': strategies_used,
                'stop_loss': max(s['stop_loss'] for s in sell_signals),
                'take_profit': min(s['take_profit'] for s in sell_signals),
                'reason': f"{len(sell_signals)}/{len(signals)} strategies agree on SELL"
            }
        else:
            return None  # No consensus

coordinator = StrategyCoordinator()
