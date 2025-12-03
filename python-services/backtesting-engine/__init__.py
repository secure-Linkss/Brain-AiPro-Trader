"""
Backtesting Engine Package
Advanced multi-agent backtesting system for trading strategies
"""

from .agents import (
    StrategyDiscoveryAgent,
    BacktestExecutionAgent,
    ValidationAgent,
    ResultsAnalysisAgent,
    MonitoringAgent,
    StrategyCandidate,
    BacktestMetrics
)

from .asset_specific import (
    ForexBacktester,
    CryptoBacktester,
    StockBacktester,
    RegimeDetector
)

from .coordinator import (
    BacktestingCoordinator,
    BacktestScheduler
)

__version__ = '1.0.0'

__all__ = [
    # Agents
    'StrategyDiscoveryAgent',
    'BacktestExecutionAgent',
    'ValidationAgent',
    'ResultsAnalysisAgent',
    'MonitoringAgent',
    'StrategyCandidate',
    'BacktestMetrics',
    # Asset-specific
    'ForexBacktester',
    'CryptoBacktester',
    'StockBacktester',
    'RegimeDetector',
    # Coordinator
    'BacktestingCoordinator',
    'BacktestScheduler',
]
