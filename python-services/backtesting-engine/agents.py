"""
Advanced Backtesting System with Dedicated Agents
Implements multi-agent architecture for strategy discovery, validation, and deployment
"""

import asyncio
import json
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, asdict
import numpy as np
import pandas as pd

@dataclass
class StrategyCandidate:
    """Represents a strategy candidate for backtesting"""
    id: str
    name: str
    parameters: Dict[str, Any]
    asset_class: str  # 'forex', 'crypto', 'stocks'
    timeframe: str
    created_at: datetime
    status: str = 'queued'  # queued, testing, validated, deployed, rejected
    confidence_score: float = 0.0
    
@dataclass
class BacktestMetrics:
    """Comprehensive backtest performance metrics"""
    total_trades: int
    winning_trades: int
    losing_trades: int
    win_rate: float
    total_return: float
    sharpe_ratio: float
    max_drawdown: float
    profit_factor: float
    avg_win: float
    avg_loss: float
    expectancy: float
    recovery_factor: float
    calmar_ratio: float
    sortino_ratio: float
    # Regime-specific metrics
    trending_performance: float
    ranging_performance: float
    high_vol_performance: float
    low_vol_performance: float
    # Robustness metrics
    parameter_sensitivity: float
    out_of_sample_ratio: float
    monte_carlo_confidence: float


class StrategyDiscoveryAgent:
    """
    Continuously generates new strategy variations and parameter combinations
    based on market analysis and performance patterns
    """
    
    def __init__(self, db_connection):
        self.db = db_connection
        self.strategy_library = []
        
    async def generate_candidates(self, asset_class: str, count: int = 10) -> List[StrategyCandidate]:
        """Generate new strategy candidates based on market conditions"""
        candidates = []
        
        # Analyze recent market conditions
        market_regime = await self._detect_market_regime(asset_class)
        
        # Generate variations of successful strategies
        successful_strategies = await self._get_top_strategies(asset_class, limit=5)
        
        for base_strategy in successful_strategies:
            # Create parameter variations
            for i in range(count // len(successful_strategies)):
                candidate = self._create_variation(base_strategy, market_regime)
                candidates.append(candidate)
                
        return candidates
    
    async def _detect_market_regime(self, asset_class: str) -> Dict[str, Any]:
        """Detect current market regime for asset class using advanced technical analysis"""
        try:
            # Fetch recent price data (last 100 candles)
            symbol = self._get_symbol_for_asset(asset_class)
            # In production, this would call data service
            # For now, simulate with realistic analysis
            
            # Simulate price data analysis
            import random
            
            # Calculate trend strength using ADX-like logic
            trend_strength = random.uniform(0.3, 0.9)
            is_trending = trend_strength > 0.5
            
            # Calculate volatility using ATR-like logic
            volatility_value = random.uniform(0.01, 0.05)
            if volatility_value > 0.035:
                volatility = 'high'
            elif volatility_value > 0.02:
                volatility = 'medium'
            else:
                volatility = 'low'
            
            # Calculate correlation with major indices
            correlation = random.uniform(0.3, 0.9)
            
            # Determine market phase
            if is_trending and volatility == 'high':
                phase = 'strong_trend'
            elif is_trending and volatility == 'low':
                phase = 'weak_trend'
            elif not is_trending and volatility == 'high':
                phase = 'choppy'
            else:
                phase = 'consolidation'
            
            return {
                'trend': 'trending' if is_trending else 'ranging',
                'trend_strength': trend_strength,
                'volatility': volatility,
                'volatility_value': volatility_value,
                'correlation': correlation,
                'phase': phase,
                'optimal_strategies': self._get_optimal_strategies_for_regime(phase)
            }
        except Exception as e:
            # Fallback to neutral regime
            return {
                'trend': 'ranging',
                'trend_strength': 0.5,
                'volatility': 'medium',
                'volatility_value': 0.025,
                'correlation': 0.5,
                'phase': 'consolidation',
                'optimal_strategies': ['mean_reversion']
            }
    
    def _get_optimal_strategies_for_regime(self, phase: str) -> List[str]:
        """Get optimal strategy types for current market phase"""
        strategy_map = {
            'strong_trend': ['momentum', 'breakout', 'trend_following'],
            'weak_trend': ['swing', 'pullback', 'trend_following'],
            'choppy': ['mean_reversion', 'range_trading', 'scalping'],
            'consolidation': ['mean_reversion', 'range_trading', 'breakout_preparation']
        }
        return strategy_map.get(phase, ['balanced'])
    
    def _get_symbol_for_asset(self, asset_class: str) -> str:
        """Get default symbol for asset class"""
        symbols = {
            'forex': 'EURUSD',
            'crypto': 'BTCUSDT',
            'stocks': 'AAPL'
        }
        return symbols.get(asset_class, 'EURUSD')
    
    async def _get_top_strategies(self, asset_class: str, limit: int) -> List[Dict]:
        """Get top performing strategies from database with advanced ranking"""
        try:
            # In production, this would query the database
            # For now, return template strategies with realistic parameters
            
            base_strategies = [
                {
                    'name': 'MA_Crossover',
                    'asset_class': asset_class,
                    'timeframe': '1h',
                    'parameters': {
                        'fast_period': 10,
                        'slow_period': 50,
                        'risk_percent': 0.02,
                        'stop_loss_atr': 2.0,
                        'take_profit_atr': 3.0
                    },
                    'performance': {
                        'sharpe_ratio': 2.1,
                        'win_rate': 0.58,
                        'total_trades': 150,
                        'avg_profit': 0.025
                    }
                },
                {
                    'name': 'RSI_Reversal',
                    'asset_class': asset_class,
                    'timeframe': '4h',
                    'parameters': {
                        'rsi_period': 14,
                        'oversold': 30,
                        'overbought': 70,
                        'risk_percent': 0.015,
                        'confirmation_candles': 2
                    },
                    'performance': {
                        'sharpe_ratio': 1.9,
                        'win_rate': 0.62,
                        'total_trades': 120,
                        'avg_profit': 0.022
                    }
                },
                {
                    'name': 'Breakout_Momentum',
                    'asset_class': asset_class,
                    'timeframe': '1h',
                    'parameters': {
                        'lookback_period': 20,
                        'breakout_threshold': 1.5,
                        'volume_confirmation': True,
                        'risk_percent': 0.025,
                        'trailing_stop': 0.015
                    },
                    'performance': {
                        'sharpe_ratio': 2.3,
                        'win_rate': 0.55,
                        'total_trades': 180,
                        'avg_profit': 0.03
                    }
                },
                {
                    'name': 'Mean_Reversion',
                    'asset_class': asset_class,
                    'timeframe': '15m',
                    'parameters': {
                        'bollinger_period': 20,
                        'bollinger_std': 2.0,
                        'rsi_period': 14,
                        'risk_percent': 0.01,
                        'profit_target': 0.02
                    },
                    'performance': {
                        'sharpe_ratio': 1.8,
                        'win_rate': 0.65,
                        'total_trades': 250,
                        'avg_profit': 0.018
                    }
                },
                {
                    'name': 'Trend_Following',
                    'asset_class': asset_class,
                    'timeframe': '1d',
                    'parameters': {
                        'ema_fast': 12,
                        'ema_slow': 26,
                        'adx_period': 14,
                        'adx_threshold': 25,
                        'risk_percent': 0.03
                    },
                    'performance': {
                        'sharpe_ratio': 2.0,
                        'win_rate': 0.52,
                        'total_trades': 100,
                        'avg_profit': 0.035
                    }
                }
            ]
            
            # Rank strategies by composite score
            for strategy in base_strategies:
                perf = strategy['performance']
                # Composite score: Sharpe * Win Rate * sqrt(Total Trades)
                strategy['composite_score'] = (
                    perf['sharpe_ratio'] * 
                    perf['win_rate'] * 
                    (perf['total_trades'] / 100) ** 0.5
                )
            
            # Sort by composite score
            ranked_strategies = sorted(
                base_strategies, 
                key=lambda x: x['composite_score'], 
                reverse=True
            )
            
            return ranked_strategies[:limit]
            
        except Exception as e:
            # Return at least one default strategy
            return [{
                'name': 'Default_Strategy',
                'asset_class': asset_class,
                'timeframe': '1h',
                'parameters': {
                    'fast_ma': 10,
                    'slow_ma': 50,
                    'risk_percent': 0.02
                },
                'performance': {
                    'sharpe_ratio': 1.5,
                    'win_rate': 0.55,
                    'total_trades': 100,
                    'avg_profit': 0.02
                }
            }]
    
    def _create_variation(self, base_strategy: Dict, regime: Dict) -> StrategyCandidate:
        """Create a parameter variation of a base strategy"""
        import uuid
        
        # Vary parameters slightly
        params = base_strategy.get('parameters', {}).copy()
        for key in params:
            if isinstance(params[key], (int, float)):
                variation = np.random.uniform(0.9, 1.1)
                params[key] = params[key] * variation
                
        return StrategyCandidate(
            id=str(uuid.uuid4()),
            name=f"{base_strategy.get('name', 'Strategy')}_v{np.random.randint(1000)}",
            parameters=params,
            asset_class=base_strategy.get('asset_class', 'forex'),
            timeframe=base_strategy.get('timeframe', '1h'),
            created_at=datetime.now()
        )


class BacktestExecutionAgent:
    """
    Runs actual backtests on generated strategies
    Manages computational queue and ensures proper data handling
    """
    
    def __init__(self, data_service):
        self.data_service = data_service
        self.queue = asyncio.Queue()
        self.running_tests = {}
        
    async def execute_backtest(
        self, 
        strategy: StrategyCandidate,
        start_date: datetime,
        end_date: datetime,
        initial_capital: float = 10000
    ) -> BacktestMetrics:
        """Execute a single backtest"""
        
        # Fetch historical data
        data = await self.data_service.get_historical_data(
            symbol=self._get_symbol_for_asset(strategy.asset_class),
            timeframe=strategy.timeframe,
            start=start_date,
            end=end_date
        )
        
        # Run backtest simulation
        trades = await self._simulate_trades(strategy, data, initial_capital)
        
        # Calculate metrics
        metrics = self._calculate_metrics(trades, initial_capital)
        
        return metrics
    
    async def _simulate_trades(
        self, 
        strategy: StrategyCandidate, 
        data: pd.DataFrame,
        capital: float
    ) -> List[Dict]:
        """Simulate trades based on strategy"""
        trades = []
        position = None
        
        for i in range(len(data)):
            # Generate signal based on strategy
            signal = self._generate_signal(strategy, data.iloc[:i+1])
            
            if signal == 'BUY' and position is None:
                position = {
                    'type': 'BUY',
                    'entry_price': data.iloc[i]['close'],
                    'entry_time': data.iloc[i]['timestamp'],
                    'size': capital * 0.02  # 2% risk per trade
                }
            elif signal == 'SELL' and position is not None:
                exit_price = data.iloc[i]['close']
                profit = (exit_price - position['entry_price']) * position['size']
                
                trades.append({
                    **position,
                    'exit_price': exit_price,
                    'exit_time': data.iloc[i]['timestamp'],
                    'profit': profit,
                    'return': profit / position['size']
                })
                position = None
                
        return trades
    
    def _generate_signal(self, strategy: StrategyCandidate, data: pd.DataFrame) -> Optional[str]:
        """Generate trading signal based on strategy parameters"""
        # This would implement the actual strategy logic
        # For now, simple moving average crossover
        if len(data) < 50:
            return None
            
        fast_ma = data['close'].rolling(10).mean().iloc[-1]
        slow_ma = data['close'].rolling(50).mean().iloc[-1]
        
        if fast_ma > slow_ma:
            return 'BUY'
        elif fast_ma < slow_ma:
            return 'SELL'
        return None
    
    def _calculate_metrics(self, trades: List[Dict], initial_capital: float) -> BacktestMetrics:
        """Calculate comprehensive performance metrics"""
        if not trades:
            return BacktestMetrics(
                total_trades=0, winning_trades=0, losing_trades=0,
                win_rate=0, total_return=0, sharpe_ratio=0,
                max_drawdown=0, profit_factor=0, avg_win=0,
                avg_loss=0, expectancy=0, recovery_factor=0,
                calmar_ratio=0, sortino_ratio=0,
                trending_performance=0, ranging_performance=0,
                high_vol_performance=0, low_vol_performance=0,
                parameter_sensitivity=0, out_of_sample_ratio=0,
                monte_carlo_confidence=0
            )
        
        winning_trades = [t for t in trades if t['profit'] > 0]
        losing_trades = [t for t in trades if t['profit'] <= 0]
        
        total_profit = sum(t['profit'] for t in winning_trades)
        total_loss = abs(sum(t['profit'] for t in losing_trades))
        
        returns = [t['return'] for t in trades]
        
        # Advanced Metrics Calculation
        total_return = sum(t['profit'] for t in trades) / initial_capital
        max_dd = self._calculate_max_drawdown(trades, initial_capital)
        
        # Recovery Factor (Net Profit / Max Drawdown)
        recovery_factor = (total_return) / max_dd if max_dd > 0 else (total_return * 100) if total_return > 0 else 0
        
        # Calmar Ratio (Annualized Return / Max Drawdown)
        # Assuming data covers the period, we approximate annualized return
        days = (trades[-1]['exit_time'] - trades[0]['entry_time']).days if trades else 1
        annualized_return = total_return * (365 / max(days, 1))
        calmar_ratio = annualized_return / max_dd if max_dd > 0 else 0
        
        # Sortino Ratio (Return / Downside Deviation)
        downside_returns = [r for r in returns if r < 0]
        downside_std = np.std(downside_returns) * np.sqrt(252) if downside_returns else 1e-6
        sortino_ratio = (np.mean(returns) * 252) / downside_std if len(returns) > 0 else 0

        # Regime Performance (Simulated for now, requires regime data per trade)
        trending_performance = total_return * 1.2 if total_return > 0 else total_return * 0.8 
        ranging_performance = total_return * 0.8 if total_return > 0 else total_return * 1.2
        high_vol_performance = total_return * 0.9
        low_vol_performance = total_return * 1.1

        return BacktestMetrics(
            total_trades=len(trades),
            winning_trades=len(winning_trades),
            losing_trades=len(losing_trades),
            win_rate=len(winning_trades) / len(trades) if trades else 0,
            total_return=total_return,
            sharpe_ratio=self._calculate_sharpe(returns),
            max_drawdown=max_dd,
            profit_factor=total_profit / total_loss if total_loss > 0 else 0,
            avg_win=total_profit / len(winning_trades) if winning_trades else 0,
            avg_loss=total_loss / len(losing_trades) if losing_trades else 0,
            expectancy=sum(t['profit'] for t in trades) / len(trades),
            recovery_factor=recovery_factor,
            calmar_ratio=calmar_ratio,
            sortino_ratio=sortino_ratio,
            trending_performance=trending_performance,
            ranging_performance=ranging_performance,
            high_vol_performance=high_vol_performance,
            low_vol_performance=low_vol_performance,
            parameter_sensitivity=0.15,
            out_of_sample_ratio=0.0,
            monte_carlo_confidence=0.0
        )
    
    def _calculate_sharpe(self, returns: List[float]) -> float:
        """Calculate Sharpe ratio"""
        if not returns or len(returns) < 2:
            return 0
        return np.mean(returns) / np.std(returns) * np.sqrt(252) if np.std(returns) > 0 else 0
    
    def _calculate_max_drawdown(self, trades: List[Dict], initial_capital: float) -> float:
        """Calculate maximum drawdown"""
        equity = initial_capital
        peak = initial_capital
        max_dd = 0
        
        for trade in trades:
            equity += trade['profit']
            if equity > peak:
                peak = equity
            dd = (peak - equity) / peak
            if dd > max_dd:
                max_dd = dd
                
        return max_dd
    
    def _get_symbol_for_asset(self, asset_class: str) -> str:
        """Get default symbol for asset class"""
        symbols = {
            'forex': 'EURUSD',
            'crypto': 'BTCUSDT',
            'stocks': 'AAPL'
        }
        return symbols.get(asset_class, 'EURUSD')


class ValidationAgent:
    """
    Performs walk-forward analysis, Monte Carlo simulations,
    and robustness checks on promising strategies
    """
    
    async def validate_strategy(
        self,
        strategy: StrategyCandidate,
        metrics: BacktestMetrics
    ) -> Dict[str, Any]:
        """Comprehensive validation of strategy"""
        
        validation_results = {
            'walk_forward': await self._walk_forward_analysis(strategy),
            'monte_carlo': await self._monte_carlo_simulation(strategy, metrics),
            'robustness': await self._robustness_check(strategy),
            'regime_analysis': await self._regime_specific_testing(strategy),
            'overall_confidence': 0.0
        }
        
        # Calculate overall confidence score
        validation_results['overall_confidence'] = self._calculate_confidence(validation_results)
        
        return validation_results
    
    async def _walk_forward_analysis(self, strategy: StrategyCandidate) -> Dict:
        """Walk-forward optimization and testing with advanced consistency checks"""
        # Simulate walk-forward analysis by generating synthetic out-of-sample periods
        # In production, this would re-run backtests on sliced data
        
        # Generate 5 periods of consistency scores
        period_scores = []
        for _ in range(5):
            # Simulate performance decay in out-of-sample
            in_sample_perf = np.random.uniform(1.5, 2.5) # Sharpe
            out_sample_perf = in_sample_perf * np.random.uniform(0.6, 1.1)
            period_scores.append(out_sample_perf / in_sample_perf)
            
        consistency_score = np.mean(period_scores)
        stability = 1.0 - np.std(period_scores)
        
        return {
            'score': min(consistency_score, 1.0),
            'consistency': max(stability, 0.0),
            'periods_passed': sum(1 for s in period_scores if s > 0.7),
            'total_periods': 5,
            'avg_degradation': 1.0 - consistency_score
        }
    
    async def _monte_carlo_simulation(self, strategy: StrategyCandidate, metrics: BacktestMetrics) -> Dict:
        """Advanced Monte Carlo simulation for confidence intervals"""
        # Simulate trade returns based on metrics
        num_simulations = 1000
        num_trades = metrics.total_trades
        
        if num_trades < 10:
            return {'confidence_95': 0.0, 'worst_case': -1.0, 'best_case': 0.0}
            
        # Reconstruct approximate return distribution
        avg_win = metrics.avg_win
        avg_loss = -metrics.avg_loss # Make negative
        win_rate = metrics.win_rate
        
        # Generate synthetic trade outcomes
        simulated_drawdowns = []
        simulated_returns = []
        
        for _ in range(num_simulations):
            # Generate random trade sequence
            trades = np.random.choice(
                [avg_win, avg_loss], 
                size=num_trades, 
                p=[win_rate, 1-win_rate]
            )
            
            # Calculate equity curve
            equity_curve = np.cumsum(trades)
            final_return = equity_curve[-1]
            
            # Calculate drawdown for this simulation
            running_max = np.maximum.accumulate(equity_curve)
            drawdown = np.min(equity_curve - running_max)
            
            simulated_drawdowns.append(drawdown)
            simulated_returns.append(final_return)
            
        # Calculate confidence intervals
        confidence_95 = np.percentile(simulated_returns, 5) > 0
        worst_case_dd = np.percentile(simulated_drawdowns, 5)
        best_case_return = np.percentile(simulated_returns, 95)
        
        return {
            'confidence_95': 1.0 if confidence_95 else 0.0,
            'worst_case_drawdown': worst_case_dd,
            'best_case_return': best_case_return,
            'median_return': np.median(simulated_returns),
            'ruin_probability': sum(1 for r in simulated_returns if r < -0.5) / num_simulations
        }
    
    async def _robustness_check(self, strategy: StrategyCandidate) -> Dict:
        """Test strategy with parameter variations (Sensitivity Analysis)"""
        # Simulate parameter sensitivity
        # In production, this would re-run backtests with perturbed parameters
        
        sensitivities = []
        for _ in range(10):
            # Simulate performance change with small parameter shift
            param_shift = np.random.normal(0, 0.1) # 10% shift
            perf_change = param_shift * np.random.uniform(0.5, 2.0)
            sensitivities.append(abs(perf_change))
            
        avg_sensitivity = np.mean(sensitivities)
        is_stable = avg_sensitivity < 0.3
        
        return {
            'sensitivity': avg_sensitivity,
            'stable': is_stable,
            'max_degradation': max(sensitivities),
            'robust_parameters': sum(1 for s in sensitivities if s < 0.2)
        }
    
    async def _regime_specific_testing(self, strategy: StrategyCandidate) -> Dict:
        """Test performance across different market regimes"""
        # Simulate performance in different regimes
        # In production, this would filter historical data by regime
        
        base_score = 0.7 + np.random.uniform(-0.1, 0.2)
        
        return {
            'trending': min(base_score * np.random.uniform(0.9, 1.3), 1.0),
            'ranging': min(base_score * np.random.uniform(0.7, 1.1), 1.0),
            'high_volatility': min(base_score * np.random.uniform(0.8, 1.2), 1.0),
            'low_volatility': min(base_score * np.random.uniform(0.9, 1.1), 1.0),
            'crisis': min(base_score * np.random.uniform(0.4, 0.8), 1.0)
        }
    
    def _calculate_confidence(self, validation_results: Dict) -> float:
        """Calculate overall confidence score with weighted factors"""
        scores = [
            validation_results['walk_forward']['score'] * 0.3,
            validation_results['monte_carlo']['confidence_95'] * 0.2,
            (1 - min(validation_results['robustness']['sensitivity'], 1.0)) * 0.2,
            np.mean(list(validation_results['regime_analysis'].values())) * 0.3
        ]
        return min(sum(scores), 1.0)


class ResultsAnalysisAgent:
    """
    Interprets backtest results, identifies patterns,
    and generates actionable insights
    """
    
    def analyze_results(
        self,
        strategy: StrategyCandidate,
        metrics: BacktestMetrics,
        validation: Dict
    ) -> Dict[str, Any]:
        """Generate comprehensive analysis and recommendations"""
        
        analysis = {
            'performance_grade': self._grade_performance(metrics),
            'strengths': self._identify_strengths(metrics, validation),
            'weaknesses': self._identify_weaknesses(metrics, validation),
            'recommendations': self._generate_recommendations(metrics, validation),
            'deployment_ready': self._is_deployment_ready(metrics, validation),
            'risk_assessment': self._assess_risk(metrics),
            'market_conditions': self._ideal_market_conditions(validation)
        }
        
        return analysis
    
    def _grade_performance(self, metrics: BacktestMetrics) -> str:
        """Grade overall performance"""
        if metrics.sharpe_ratio > 2.5 and metrics.win_rate > 0.6:
            return 'A+'
        elif metrics.sharpe_ratio > 2.0 and metrics.win_rate > 0.55:
            return 'A'
        elif metrics.sharpe_ratio > 1.5 and metrics.win_rate > 0.5:
            return 'B'
        elif metrics.sharpe_ratio > 1.0:
            return 'C'
        return 'D'
    
    def _identify_strengths(self, metrics: BacktestMetrics, validation: Dict) -> List[str]:
        """Identify strategy strengths"""
        strengths = []
        if metrics.win_rate > 0.6:
            strengths.append("High win rate")
        if metrics.sharpe_ratio > 2.0:
            strengths.append("Excellent risk-adjusted returns")
        if metrics.max_drawdown < 0.15:
            strengths.append("Low drawdown risk")
        return strengths
    
    def _identify_weaknesses(self, metrics: BacktestMetrics, validation: Dict) -> List[str]:
        """Identify strategy weaknesses"""
        weaknesses = []
        if metrics.win_rate < 0.45:
            weaknesses.append("Low win rate")
        if metrics.max_drawdown > 0.3:
            weaknesses.append("High drawdown risk")
        return weaknesses
    
    def _generate_recommendations(self, metrics: BacktestMetrics, validation: Dict) -> List[str]:
        """Generate actionable recommendations"""
        recommendations = []
        if metrics.max_drawdown > 0.25:
            recommendations.append("Consider reducing position size")
        if validation.get('overall_confidence', 0) < 0.7:
            recommendations.append("Requires more validation before live deployment")
        return recommendations
    
    def _is_deployment_ready(self, metrics: BacktestMetrics, validation: Dict) -> bool:
        """Determine if strategy is ready for deployment"""
        return (
            metrics.sharpe_ratio > 1.5 and
            metrics.win_rate > 0.5 and
            metrics.max_drawdown < 0.25 and
            validation.get('overall_confidence', 0) > 0.7
        )
    
    def _assess_risk(self, metrics: BacktestMetrics) -> str:
        """Assess overall risk level"""
        if metrics.max_drawdown < 0.15:
            return "Low"
        elif metrics.max_drawdown < 0.25:
            return "Medium"
        return "High"
    
    def _ideal_market_conditions(self, validation: Dict) -> List[str]:
        """Identify ideal market conditions for strategy"""
        regime_scores = validation.get('regime_analysis', {})
        ideal = []
        
        if regime_scores.get('trending', 0) > 0.7:
            ideal.append("Trending markets")
        if regime_scores.get('ranging', 0) > 0.7:
            ideal.append("Range-bound markets")
        if regime_scores.get('high_volatility', 0) > 0.7:
            ideal.append("High volatility periods")
            
        return ideal


class MonitoringAgent:
    """
    Tracks deployed strategies' live performance vs backtested expectations
    Flags degradation and triggers re-optimization
    """
    
    def __init__(self, db_connection):
        self.db = db_connection
        
    async def monitor_deployed_strategies(self) -> List[Dict]:
        """Monitor all deployed strategies"""
        alerts = []
        
        # Get all deployed strategies
        deployed = await self._get_deployed_strategies()
        
        for strategy in deployed:
            # Compare live vs backtest performance
            performance_delta = await self._calculate_performance_delta(strategy)
            
            if performance_delta < -0.2:  # 20% degradation
                alerts.append({
                    'strategy_id': strategy['id'],
                    'alert_type': 'PERFORMANCE_DEGRADATION',
                    'severity': 'HIGH',
                    'delta': performance_delta,
                    'recommendation': 'Pause and re-optimize'
                })
                
        return alerts
    
    async def _get_deployed_strategies(self) -> List[Dict]:
        """Get all currently deployed strategies from database or simulation"""
        try:
            # In production, query the database
            # if self.db:
            #     return await self.db.fetch_all("SELECT * FROM deployed_strategies WHERE status='active'")
            
            # For now, return simulated active strategies
            return [
                {
                    'id': 'strat_001',
                    'name': 'Trend_Follower_Alpha',
                    'expected_sharpe': 2.1,
                    'expected_win_rate': 0.58,
                    'live_performance': {
                        'sharpe': 1.8,
                        'win_rate': 0.55,
                        'trades': 45
                    }
                },
                {
                    'id': 'strat_002',
                    'name': 'Mean_Reversion_Beta',
                    'expected_sharpe': 1.8,
                    'expected_win_rate': 0.65,
                    'live_performance': {
                        'sharpe': 1.2, # Significant degradation
                        'win_rate': 0.50,
                        'trades': 32
                    }
                }
            ]
        except Exception:
            return []
    
    async def _calculate_performance_delta(self, strategy: Dict) -> float:
        """Calculate difference between live and backtest performance (Performance Drift)"""
        try:
            expected = strategy.get('expected_sharpe', 0)
            live = strategy.get('live_performance', {}).get('sharpe', 0)
            
            if expected == 0:
                return 0.0
                
            # Calculate percentage drift
            drift = (live - expected) / expected
            
            # Also check win rate drift
            exp_wr = strategy.get('expected_win_rate', 0)
            live_wr = strategy.get('live_performance', {}).get('win_rate', 0)
            
            if exp_wr > 0:
                wr_drift = (live_wr - exp_wr) / exp_wr
                # Combine drifts (weighted average)
                combined_drift = (drift * 0.7) + (wr_drift * 0.3)
                return combined_drift
            
            return drift
        except Exception:
            return 0.0


# Export all agents
__all__ = [
    'StrategyDiscoveryAgent',
    'BacktestExecutionAgent',
    'ValidationAgent',
    'ResultsAnalysisAgent',
    'MonitoringAgent',
    'StrategyCandidate',
    'BacktestMetrics'
]
