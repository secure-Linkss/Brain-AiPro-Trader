"""
COMPLETE STRATEGY INTEGRATION SYSTEM
How All 35+ Strategies Analyze Historical Data

Data Flow:
1. Fetch historical data (yfinance) → Save to CSV/Parquet
2. Load data into pandas DataFrame
3. Run ALL 35+ strategies on the data
4. Aggregate results with multi-agent voting
5. Generate high-confidence signals
"""

import pandas as pd
import numpy as np
from pathlib import Path
from typing import Dict, List, Optional
import sys
import os

# Add strategy paths
sys.path.append(os.path.join(os.path.dirname(__file__), 'pattern-detector'))
sys.path.append(os.path.join(os.path.dirname(__file__), 'pattern-detector', 'detectors'))
sys.path.append(os.path.dirname(os.path.abspath(__file__)))


class HistoricalDataManager:
    """
    Manages historical data storage and retrieval
    Stores data in CSV/Parquet for fast access
    """
    
    def __init__(self, data_dir: str = "./data/historical"):
        self.data_dir = Path(data_dir)
        self.data_dir.mkdir(parents=True, exist_ok=True)
        
        # Create subdirectories
        (self.data_dir / "csv").mkdir(exist_ok=True)
        (self.data_dir / "parquet").mkdir(exist_ok=True)
    
    def save_historical_data(self, symbol: str, timeframe: str, df: pd.DataFrame):
        """Save historical data to both CSV and Parquet"""
        # CSV for human readability
        csv_path = self.data_dir / "csv" / f"{symbol}_{timeframe}.csv"
        df.to_csv(csv_path, index=True)
        
        # Parquet for fast loading
        parquet_path = self.data_dir / "parquet" / f"{symbol}_{timeframe}.parquet"
        df.to_parquet(parquet_path, compression='snappy', index=True)
        
        print(f"✅ Saved {symbol} {timeframe}: {len(df)} candles")
        print(f"   CSV: {csv_path}")
        print(f"   Parquet: {parquet_path}")
    
    def load_historical_data(self, symbol: str, timeframe: str) -> Optional[pd.DataFrame]:
        """Load historical data (prefers Parquet for speed)"""
        # Try Parquet first (faster)
        parquet_path = self.data_dir / "parquet" / f"{symbol}_{timeframe}.parquet"
        if parquet_path.exists():
            df = pd.read_parquet(parquet_path)
            print(f"✅ Loaded {symbol} {timeframe} from Parquet: {len(df)} candles")
            return df
        
        # Fallback to CSV
        csv_path = self.data_dir / "csv" / f"{symbol}_{timeframe}.csv"
        if csv_path.exists():
            df = pd.read_csv(csv_path, index_col=0, parse_dates=True)
            print(f"✅ Loaded {symbol} {timeframe} from CSV: {len(df)} candles")
            return df
        
        print(f"❌ No data found for {symbol} {timeframe}")
        return None


class StrategyOrchestrator:
    """
    Orchestrates ALL 35+ strategies on historical data
    
    Strategy Categories:
    1. Trend Following (10 strategies)
    2. Smart Money Concepts (8 strategies)
    3. Multi-Timeframe (5 strategies)
    4. Market Regime (4 strategies)
    5. Fibonacci (3 strategies)
    6. Chart Patterns (5 strategies)
    7. Volume (3 strategies)
    8. Candlestick (4 strategies)
    9. Order Flow (3 strategies)
    10. Institutional (2 strategies)
    
    Total: 47 individual strategies!
    """
    
    def __init__(self):
        self.strategies = self._load_all_strategies()
        print(f"✅ Loaded {len(self.strategies)} comprehensive strategy modules")
    
    def _load_all_strategies(self) -> Dict:
        """Load all comprehensive strategy modules"""
        strategies = {}
        
        # Import all comprehensive detectors
        try:
            from detectors import trend_following_comprehensive
            strategies['trend_following'] = trend_following_comprehensive
            print("  ✓ Trend Following Comprehensive (10 strategies)")
        except ImportError as e:
            print(f"  ✗ Trend Following: {e}")
        
        try:
            from detectors import smc_comprehensive
            strategies['smc'] = smc_comprehensive
            print("  ✓ Smart Money Concepts (8 strategies)")
        except ImportError as e:
            print(f"  ✗ SMC: {e}")
        
        try:
            from detectors import multi_timeframe_comprehensive
            strategies['multi_timeframe'] = multi_timeframe_comprehensive
            print("  ✓ Multi-Timeframe (5 strategies)")
        except ImportError as e:
            print(f"  ✗ Multi-TF: {e}")
        
        try:
            from detectors import market_regime_comprehensive
            strategies['market_regime'] = market_regime_comprehensive
            print("  ✓ Market Regime (4 strategies)")
        except ImportError as e:
            print(f"  ✗ Market Regime: {e}")
        
        try:
            from detectors import fibonacci_comprehensive
            strategies['fibonacci'] = fibonacci_comprehensive
            print("  ✓ Fibonacci (3 strategies)")
        except ImportError as e:
            print(f"  ✗ Fibonacci: {e}")
        
        try:
            from detectors import chart_patterns_advanced
            strategies['chart_patterns'] = chart_patterns_advanced
            print("  ✓ Chart Patterns (5 strategies)")
        except ImportError as e:
            print(f"  ✗ Chart Patterns: {e}")
        
        try:
            from detectors import volume_strategies_comprehensive
            strategies['volume'] = volume_strategies_comprehensive
            print("  ✓ Volume Strategies (3 strategies)")
        except ImportError as e:
            print(f"  ✗ Volume: {e}")
        
        try:
            from detectors import candlestick_comprehensive
            strategies['candlestick'] = candlestick_comprehensive
            print("  ✓ Candlestick Patterns (4 strategies)")
        except ImportError as e:
            print(f"  ✗ Candlestick: {e}")
        
        try:
            from detectors import order_flow_comprehensive
            strategies['order_flow'] = order_flow_comprehensive
            print("  ✓ Order Flow (3 strategies)")
        except ImportError as e:
            print(f"  ✗ Order Flow: {e}")
        
        try:
            from detectors import specialized_institutional_comprehensive
            strategies['institutional'] = specialized_institutional_comprehensive
            print("  ✓ Institutional (2 strategies)")
        except ImportError as e:
            print(f"  ✗ Institutional: {e}")
        
        return strategies
    
    def analyze_with_all_strategies(self, df: pd.DataFrame, symbol: str, timeframe: str) -> Dict:
        """
        Run ALL strategies on historical data
        
        Process:
        1. Load historical data from CSV/Parquet
        2. Run each strategy module
        3. Collect all signals
        4. Aggregate with multi-agent voting
        5. Return comprehensive analysis
        """
        print(f"\n{'='*80}")
        print(f"🔍 Analyzing {symbol} {timeframe} with ALL {len(self.strategies)} strategy modules")
        print(f"{'='*80}")
        
        all_signals = []
        strategy_results = {}
        
        # Run each strategy module
        for strategy_name, strategy_module in self.strategies.items():
            try:
                print(f"\n📊 Running {strategy_name}...")
                
                # Each comprehensive module has a detect_all() or similar function
                if hasattr(strategy_module, 'detect_trend_patterns'):
                    results = strategy_module.detect_trend_patterns(df)
                elif hasattr(strategy_module, 'detect_all'):
                    detector = strategy_module.ComprehensiveTrendDetector()
                    results = detector.detect_all(df)
                else:
                    print(f"  ⚠️  No detect function found")
                    continue
                
                # Collect signals
                if results:
                    strategy_results[strategy_name] = results
                    
                    # Count signals
                    total_signals = sum(len(signals) for signals in results.values())
                    print(f"  ✅ Found {total_signals} signals")
                    
                    # Add to all_signals
                    for category, signals in results.items():
                        for signal in signals:
                            all_signals.append({
                                'strategy': strategy_name,
                                'category': category,
                                'signal': signal
                            })
                else:
                    print(f"  ℹ️  No signals")
                    
            except Exception as e:
                print(f"  ❌ Error: {e}")
                continue
        
        print(f"\n{'='*80}")
        print(f"✅ Analysis Complete: {len(all_signals)} total signals from {len(strategy_results)} strategies")
        print(f"{'='*80}")
        
        return {
            'symbol': symbol,
            'timeframe': timeframe,
            'total_signals': len(all_signals),
            'strategies_used': len(strategy_results),
            'all_signals': all_signals,
            'strategy_results': strategy_results
        }


class ComprehensiveAnalysisEngine:
    """
    Complete Analysis Engine
    
    Workflow:
    1. Fetch historical data (yfinance)
    2. Save to CSV/Parquet
    3. Load data
    4. Run ALL 35+ strategies
    5. Multi-agent voting
    6. Generate final signal
    """
    
    def __init__(self):
        self.data_manager = HistoricalDataManager()
        self.orchestrator = StrategyOrchestrator()
    
    def fetch_and_analyze(self, symbol: str, timeframe: str) -> Dict:
        """Complete workflow: Fetch → Save → Analyze"""
        print(f"\n{'='*80}")
        print(f"🚀 COMPLETE ANALYSIS: {symbol} {timeframe}")
        print(f"{'='*80}")
        
        # Step 1: Fetch historical data
        print(f"\n📡 Step 1: Fetching historical data from yfinance...")
        from data_fetcher.yfinance_fetcher import YFinanceDataFetcher
        
        fetcher = YFinanceDataFetcher()
        df = fetcher.fetch_symbol_timeframe(symbol, timeframe)
        
        if df is None or df.empty:
            print(f"❌ Failed to fetch data")
            return None
        
        print(f"✅ Fetched {len(df)} candles")
        
        # Step 2: Save to CSV/Parquet
        print(f"\n💾 Step 2: Saving to CSV/Parquet...")
        self.data_manager.save_historical_data(symbol, timeframe, df)
        
        # Step 3: Load data (to verify)
        print(f"\n📂 Step 3: Loading from storage...")
        df_loaded = self.data_manager.load_historical_data(symbol, timeframe)
        
        if df_loaded is None:
            print(f"❌ Failed to load data")
            return None
        
        # Step 4: Run ALL strategies
        print(f"\n🔬 Step 4: Running ALL {len(self.orchestrator.strategies)} strategy modules...")
        analysis = self.orchestrator.analyze_with_all_strategies(df_loaded, symbol, timeframe)
        
        # Step 5: Multi-agent voting (if signals found)
        if analysis['total_signals'] > 0:
            print(f"\n🗳️  Step 5: Multi-agent voting...")
            final_signal = self._multi_agent_vote(analysis['all_signals'])
            analysis['final_signal'] = final_signal
        else:
            print(f"\n⚠️  No signals found - no trade setup")
            analysis['final_signal'] = None
        
        return analysis
    
    def _multi_agent_vote(self, all_signals: List[Dict]) -> Optional[Dict]:
        """Multi-agent voting on all signals"""
        if not all_signals:
            return None
        
        # Count BUY vs SELL signals
        buy_count = sum(1 for s in all_signals if s['signal'].get('direction') == 'bullish')
        sell_count = sum(1 for s in all_signals if s['signal'].get('direction') == 'bearish')
        
        # Calculate average confidence
        confidences = [s['signal'].get('confidence', 0) for s in all_signals]
        avg_confidence = sum(confidences) / len(confidences) if confidences else 0
        
        # Determine final signal
        if buy_count > sell_count and avg_confidence >= 70:
            return {
                'signal': 'BUY',
                'confidence': avg_confidence,
                'buy_votes': buy_count,
                'sell_votes': sell_count,
                'total_strategies': len(all_signals)
            }
        elif sell_count > buy_count and avg_confidence >= 70:
            return {
                'signal': 'SELL',
                'confidence': avg_confidence,
                'buy_votes': buy_count,
                'sell_votes': sell_count,
                'total_strategies': len(all_signals)
            }
        else:
            return {
                'signal': 'HOLD',
                'confidence': avg_confidence,
                'buy_votes': buy_count,
                'sell_votes': sell_count,
                'total_strategies': len(all_signals),
                'reason': 'No clear consensus or confidence too low'
            }


def main():
    """Test the complete system"""
    print("\n" + "="*80)
    print("🚀 COMPREHENSIVE STRATEGY ANALYSIS SYSTEM")
    print("="*80)
    print("\nThis system:")
    print("1. ✅ Fetches historical data from yfinance")
    print("2. ✅ Saves to CSV (human-readable) and Parquet (fast)")
    print("3. ✅ Loads data from storage")
    print("4. ✅ Runs ALL 35+ strategies on the data")
    print("5. ✅ Aggregates results with multi-agent voting")
    print("6. ✅ Generates final high-confidence signal")
    print("\n" + "="*80)
    
    # Initialize engine
    engine = ComprehensiveAnalysisEngine()
    
    # Test with BTC
    print("\n🧪 Testing with BTCUSD 1hr...")
    result = engine.fetch_and_analyze('BTCUSD', '1hr')
    
    if result and result.get('final_signal'):
        signal = result['final_signal']
        print(f"\n{'='*80}")
        print(f"🎯 FINAL SIGNAL")
        print(f"{'='*80}")
        print(f"Signal: {signal['signal']}")
        print(f"Confidence: {signal['confidence']:.1f}%")
        print(f"BUY votes: {signal['buy_votes']}")
        print(f"SELL votes: {signal['sell_votes']}")
        print(f"Total strategies: {signal['total_strategies']}")
        print(f"{'='*80}\n")
    else:
        print(f"\n⚠️  No final signal generated")


if __name__ == "__main__":
    main()
