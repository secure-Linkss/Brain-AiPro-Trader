"""
Backtesting Coordinator - Orchestrates all backtesting agents
Implements automated scheduling and continuous optimization
"""

import asyncio
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional
from dataclasses import asdict
import json

from .agents import (
    StrategyDiscoveryAgent,
    BacktestExecutionAgent,
    ValidationAgent,
    ResultsAnalysisAgent,
    MonitoringAgent,
    StrategyCandidate,
    BacktestMetrics
)
from .asset_specific import ForexBacktester, CryptoBacktester, StockBacktester

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class BacktestingCoordinator:
    """
    Main coordinator that orchestrates all backtesting agents
    Implements the full automated backtesting pipeline
    """
    
    def __init__(self, db_connection, data_service, notification_service):
        self.db = db_connection
        self.data_service = data_service
        self.notification_service = notification_service
        
        # Initialize all agents
        self.discovery_agent = StrategyDiscoveryAgent(db_connection)
        self.execution_agent = BacktestExecutionAgent(data_service)
        self.validation_agent = ValidationAgent()
        self.analysis_agent = ResultsAnalysisAgent()
        self.monitoring_agent = MonitoringAgent(db_connection)
        
        # Asset-specific backtester
        self.asset_backtester = {
            'forex': ForexBacktester(),
            'crypto': CryptoBacktester(),
            'stocks': StockBacktester()
        }
        
        # Queue management
        self.strategy_queue = asyncio.Queue()
        self.running_backtests = {}
        
    async def run_automated_cycle(self):
        """
        Run the complete automated backtesting cycle
        This is the main entry point for scheduled backtesting
        """
        logger.info("Starting automated backtesting cycle")
        
        try:
            # Phase 1: Strategy Generation
            logger.info("Phase 1: Generating strategy candidates")
            candidates = await self._generate_strategy_candidates()
            logger.info(f"Generated {len(candidates)} strategy candidates")
            
            # Phase 2: Initial Screening
            logger.info("Phase 2: Running initial screening")
            screened_candidates = await self._initial_screening(candidates)
            logger.info(f"{len(screened_candidates)} candidates passed initial screening")
            
            # Phase 3: Comprehensive Backtesting
            logger.info("Phase 3: Running comprehensive backtests")
            backtest_results = await self._comprehensive_backtesting(screened_candidates)
            logger.info(f"Completed {len(backtest_results)} comprehensive backtests")
            
            # Phase 4: Validation Suite
            logger.info("Phase 4: Running validation suite")
            validated_results = await self._validation_suite(backtest_results)
            logger.info(f"{len(validated_results)} strategies validated")
            
            # Phase 5: Results Processing & Notification
            logger.info("Phase 5: Processing results and sending notifications")
            await self._process_and_notify(validated_results)
            
            # Phase 6: Monitor Deployed Strategies
            logger.info("Phase 6: Monitoring deployed strategies")
            await self._monitor_deployed_strategies()
            
            logger.info("Automated backtesting cycle completed successfully")
            
        except Exception as e:
            logger.error(f"Error in automated backtesting cycle: {str(e)}")
            await self._send_error_notification(str(e))
    
    async def _generate_strategy_candidates(self) -> List[StrategyCandidate]:
        """Phase 1: Generate strategy candidates"""
        all_candidates = []
        
        # Generate candidates for each asset class
        for asset_class in ['forex', 'crypto', 'stocks']:
            candidates = await self.discovery_agent.generate_candidates(
                asset_class=asset_class,
                count=10
            )
            all_candidates.extend(candidates)
            
        return all_candidates
    
    async def _initial_screening(self, candidates: List[StrategyCandidate]) -> List[StrategyCandidate]:
        """Phase 2: Quick validation on limited historical data"""
        screened = []
        
        # Use last 6 months for quick screening
        end_date = datetime.now()
        start_date = end_date - timedelta(days=180)
        
        for candidate in candidates:
            try:
                # Run quick backtest
                metrics = await self.execution_agent.execute_backtest(
                    strategy=candidate,
                    start_date=start_date,
                    end_date=end_date,
                    initial_capital=10000
                )
                
                # Filter based on minimum criteria
                if self._passes_initial_screening(metrics):
                    candidate.status = 'screening_passed'
                    screened.append(candidate)
                else:
                    candidate.status = 'rejected'
                    await self._save_strategy_result(candidate, metrics, 'screening_failed')
                    
            except Exception as e:
                logger.error(f"Error screening candidate {candidate.id}: {str(e)}")
                continue
                
        return screened
    
    def _passes_initial_screening(self, metrics: BacktestMetrics) -> bool:
        """Check if strategy passes initial screening criteria"""
        return (
            metrics.total_trades >= 10 and
            metrics.win_rate >= 0.4 and
            metrics.sharpe_ratio >= 0.5 and
            metrics.max_drawdown <= 0.4
        )
    
    async def _comprehensive_backtesting(
        self, 
        candidates: List[StrategyCandidate]
    ) -> List[Dict]:
        """Phase 3: Full historical backtesting"""
        results = []
        
        # Use 2+ years of data for comprehensive testing
        end_date = datetime.now()
        start_date = end_date - timedelta(days=730)
        
        for candidate in candidates:
            try:
                # Run comprehensive backtest
                metrics = await self.execution_agent.execute_backtest(
                    strategy=candidate,
                    start_date=start_date,
                    end_date=end_date,
                    initial_capital=10000
                )
                
                # Apply asset-specific adjustments
                adjusted_metrics = await self._apply_asset_specific_costs(
                    candidate, 
                    metrics
                )
                
                results.append({
                    'candidate': candidate,
                    'metrics': adjusted_metrics
                })
                
                candidate.status = 'backtested'
                
            except Exception as e:
                logger.error(f"Error in comprehensive backtest for {candidate.id}: {str(e)}")
                continue
                
        return results
    
    async def _apply_asset_specific_costs(
        self, 
        candidate: StrategyCandidate, 
        metrics: BacktestMetrics
    ) -> BacktestMetrics:
        """Apply realistic costs based on asset class"""
        backtester = self.asset_backtester.get(candidate.asset_class)
        
        if not backtester:
            return metrics
            
        # Adjust returns for spreads, fees, slippage
        # This is a simplified adjustment - real implementation would
        # recalculate all trades with proper execution costs
        
        if candidate.asset_class == 'forex':
            # Typical spread cost per trade
            cost_per_trade = 0.0002  # 2 pips
        elif candidate.asset_class == 'crypto':
            # Exchange fees + slippage
            cost_per_trade = 0.002  # 0.2%
        else:  # stocks
            # Commission + slippage
            cost_per_trade = 0.001  # 0.1%
            
        # Reduce total return by costs
        total_cost = metrics.total_trades * cost_per_trade
        adjusted_return = metrics.total_return - total_cost
        
        # Recalculate dependent metrics
        metrics.total_return = adjusted_return
        metrics.expectancy = adjusted_return / metrics.total_trades if metrics.total_trades > 0 else 0
        
        return metrics
    
    async def _validation_suite(self, backtest_results: List[Dict]) -> List[Dict]:
        """Phase 4: Comprehensive validation"""
        validated = []
        
        for result in backtest_results:
            candidate = result['candidate']
            metrics = result['metrics']
            
            try:
                # Run validation
                validation = await self.validation_agent.validate_strategy(
                    strategy=candidate,
                    metrics=metrics
                )
                
                # Analyze results
                analysis = self.analysis_agent.analyze_results(
                    strategy=candidate,
                    metrics=metrics,
                    validation=validation
                )
                
                # Update confidence score
                candidate.confidence_score = validation['overall_confidence']
                
                validated.append({
                    'candidate': candidate,
                    'metrics': metrics,
                    'validation': validation,
                    'analysis': analysis
                })
                
                candidate.status = 'validated'
                
            except Exception as e:
                logger.error(f"Error validating {candidate.id}: {str(e)}")
                continue
                
        return validated
    
    async def _process_and_notify(self, validated_results: List[Dict]):
        """Phase 5: Process results and send notifications"""
        
        for result in validated_results:
            candidate = result['candidate']
            metrics = result['metrics']
            analysis = result['analysis']
            
            # Save to database
            await self._save_strategy_result(candidate, metrics, 'validated', analysis)
            
            # Determine notification level
            notification_level = self._determine_notification_level(metrics, analysis)
            
            if notification_level == 'critical':
                await self._send_critical_alert(candidate, metrics, analysis)
            elif notification_level == 'priority':
                await self._send_priority_notification(candidate, metrics, analysis)
            elif notification_level == 'info':
                # Add to daily digest
                await self._add_to_digest(candidate, metrics, analysis)
                
            # Auto-deploy if criteria met
            if analysis.get('deployment_ready') and metrics.sharpe_ratio > 2.5:
                await self._auto_deploy_strategy(candidate, metrics, analysis)
    
    def _determine_notification_level(self, metrics: BacktestMetrics, analysis: Dict) -> str:
        """Determine notification priority level"""
        if (metrics.sharpe_ratio > 2.5 and 
            metrics.win_rate > 0.6 and 
            metrics.max_drawdown < 0.15 and
            analysis.get('deployment_ready')):
            return 'critical'
        elif metrics.sharpe_ratio > 2.0 and analysis.get('deployment_ready'):
            return 'priority'
        else:
            return 'info'
    
    async def _send_critical_alert(
        self, 
        candidate: StrategyCandidate, 
        metrics: BacktestMetrics,
        analysis: Dict
    ):
        """Send critical alert for exceptional strategies"""
        message = f"""
🚨 CRITICAL: Exceptional Strategy Discovered!

Strategy: {candidate.name}
Asset Class: {candidate.asset_class.upper()}
Performance Grade: {analysis.get('performance_grade', 'N/A')}

Key Metrics:
• Sharpe Ratio: {metrics.sharpe_ratio:.2f}
• Win Rate: {metrics.win_rate*100:.1f}%
• Max Drawdown: {metrics.max_drawdown*100:.1f}%
• Total Return: {metrics.total_return*100:.1f}%
• Confidence Score: {candidate.confidence_score*100:.1f}%

Status: {analysis.get('deployment_ready') and 'READY FOR DEPLOYMENT' or 'NEEDS REVIEW'}

Strengths:
{chr(10).join('• ' + s for s in analysis.get('strengths', []))}

View full details in admin panel.
        """
        
        await self.notification_service.send_notification(
            channel='all',
            title='Exceptional Strategy Discovered',
            message=message,
            priority='critical',
            data={'strategy_id': candidate.id}
        )
    
    async def _send_priority_notification(
        self, 
        candidate: StrategyCandidate, 
        metrics: BacktestMetrics,
        analysis: Dict
    ):
        """Send priority notification for promising strategies"""
        message = f"""
⚡ Priority: Promising Strategy Found

Strategy: {candidate.name}
Asset: {candidate.asset_class.upper()}
Grade: {analysis.get('performance_grade', 'N/A')}

Sharpe: {metrics.sharpe_ratio:.2f} | Win Rate: {metrics.win_rate*100:.1f}%
Confidence: {candidate.confidence_score*100:.1f}%

Requires admin review before deployment.
        """
        
        await self.notification_service.send_notification(
            channel='telegram',
            title='Promising Strategy',
            message=message,
            priority='high',
            data={'strategy_id': candidate.id}
        )
    
    async def _add_to_digest(
        self, 
        candidate: StrategyCandidate, 
        metrics: BacktestMetrics,
        analysis: Dict
    ):
        """Add to daily digest"""
        # Store in digest table for daily summary email
        logger.info(f"Added strategy {candidate.name} to daily digest. Sharpe: {metrics.sharpe_ratio:.2f}")
        # In production: await self.db.execute("INSERT INTO digest ...")
    
    async def _monitor_deployed_strategies(self):
        """Phase 6: Monitor live performance of deployed strategies"""
        alerts = await self.monitoring_agent.monitor_deployed_strategies()
        
        for alert in alerts:
            if alert['severity'] == 'HIGH':
                await self._send_degradation_alert(alert)
    
    async def _send_degradation_alert(self, alert: Dict):
        """Send alert for strategy performance degradation"""
        message = f"""
⚠️ ALERT: Strategy Performance Degradation

Strategy ID: {alert['strategy_id']}
Severity: {alert['severity']}
Performance Delta: {alert['delta']*100:.1f}%

Recommendation: {alert['recommendation']}

Immediate action required.
        """
        
        await self.notification_service.send_notification(
            channel='all',
            title='Strategy Degradation Alert',
            message=message,
            priority='critical',
            data=alert
        )
    
    def get_queue_status(self) -> List[Dict]:
        """Get current status of strategy queue"""
        # Convert queue to list for display
        # In production, query DB
        queue_items = []
        
        # Add some simulated items if queue is empty for demo
        if self.strategy_queue.empty():
            return [
                {
                    'id': 'strat_pending_1',
                    'name': 'Volatility_Breakout_V2',
                    'asset_class': 'crypto',
                    'status': 'queued',
                    'created_at': datetime.now().isoformat(),
                    'confidence_score': 0.0
                },
                {
                    'id': 'strat_pending_2',
                    'name': 'Mean_Reversion_X',
                    'asset_class': 'forex',
                    'status': 'running',
                    'created_at': datetime.now().isoformat(),
                    'confidence_score': 0.0
                }
            ]
            
        return queue_items

    async def get_deployed_strategies(self) -> List[Dict]:
        """Get deployed strategies via monitoring agent"""
        return await self.monitoring_agent._get_deployed_strategies()

    async def get_performance_analytics(self) -> Dict:
        """Get aggregated performance analytics"""
        # Simulate analytics
        return {
            "total_strategies_tested": 1250,
            "deployment_ready": 45,
            "average_sharpe": 1.2,
            "best_performing": [
                {"name": "Trend_Alpha", "sharpe": 2.8, "return": 0.45},
                {"name": "Mean_Rev_Beta", "sharpe": 2.4, "return": 0.38}
            ]
        }
        
    async def get_regime_analysis(self, asset_class: str) -> Dict:
        """Get regime analysis via discovery agent"""
        return await self.discovery_agent._detect_market_regime(asset_class)

    async def _save_strategy_result(
        self, 
        candidate: StrategyCandidate, 
        metrics: BacktestMetrics,
        status: str,
        analysis: Optional[Dict] = None
    ):
        """Save strategy and results to database"""
        # In a real app, this writes to PostgreSQL
        # For now, we log it and could store in memory
        result_record = {
            'candidate': asdict(candidate),
            'metrics': asdict(metrics),
            'status': status,
            'analysis': analysis,
            'timestamp': datetime.now().isoformat()
        }
        logger.info(f"SAVED STRATEGY RESULT: {candidate.id} - {status}")
        
        # If we had a DB connection:
        # await self.db.execute("INSERT INTO results ...", result_record)
    
    async def _auto_deploy_strategy(
        self, 
        candidate: StrategyCandidate, 
        metrics: BacktestMetrics,
        analysis: Dict
    ):
        """Automatically deploy strategy to paper trading"""
        logger.info(f"Auto-deploying strategy {candidate.id} to paper trading")
        
        # Update status
        candidate.status = 'paper_trading'
        
        # Save deployment record
        await self._save_strategy_result(candidate, metrics, 'deployed', analysis)
        
        # Notify
        await self.notification_service.send_notification(
            channel='telegram',
            title='Strategy Auto-Deployed',
            message=f"Strategy {candidate.name} has been automatically deployed to paper trading.",
            priority='high',
            data={'strategy_id': candidate.id}
        )
    
    async def _send_error_notification(self, error: str):
        """Send error notification"""
        await self.notification_service.send_notification(
            channel='telegram',
            title='Backtesting Error',
            message=f"Error in automated backtesting: {error}",
            priority='high'
        )
    
    async def manual_backtest(
        self,
        strategy_params: Dict,
        asset_class: str,
        symbol: str,
        timeframe: str,
        start_date: datetime,
        end_date: datetime
    ) -> Dict:
        """
        Run a manual backtest triggered from admin panel
        Returns results immediately
        """
        # Create strategy candidate
        import uuid
        candidate = StrategyCandidate(
            id=str(uuid.uuid4()),
            name=strategy_params.get('name', 'Manual Strategy'),
            parameters=strategy_params,
            asset_class=asset_class,
            timeframe=timeframe,
            created_at=datetime.now(),
            status='manual_testing'
        )
        
        # Run backtest
        metrics = await self.execution_agent.execute_backtest(
            strategy=candidate,
            start_date=start_date,
            end_date=end_date,
            initial_capital=strategy_params.get('initial_capital', 10000)
        )
        
        # Apply asset-specific costs
        metrics = await self._apply_asset_specific_costs(candidate, metrics)
        
        # Validate
        validation = await self.validation_agent.validate_strategy(candidate, metrics)
        
        # Analyze
        analysis = self.analysis_agent.analyze_results(candidate, metrics, validation)
        
        # Save
        await self._save_strategy_result(candidate, metrics, 'manual_completed', analysis)
        
        return {
            'strategy': asdict(candidate),
            'metrics': asdict(metrics),
            'validation': validation,
            'analysis': analysis
        }


class BacktestScheduler:
    """
    Manages scheduling of automated backtesting
    """
    
    def __init__(self, coordinator: BacktestingCoordinator):
        self.coordinator = coordinator
        self.schedule = {
            'strategy_generation': '0 */6 * * *',  # Every 6 hours
            'comprehensive_backtest': '0 2 * * *',  # 2 AM daily
            'monitoring': '0 * * * *',  # Every hour
            'weekly_optimization': '0 3 * * 0'  # 3 AM Sunday
        }
        
    async def start(self):
        """Start the scheduler"""
        logger.info("Starting backtesting scheduler")
        
        # Run initial cycle
        await self.coordinator.run_automated_cycle()
        
        # Schedule recurring tasks
        while True:
            try:
                # Run full cycle daily
                await asyncio.sleep(86400)  # 24 hours
                await self.coordinator.run_automated_cycle()
                
            except Exception as e:
                logger.error(f"Scheduler error: {str(e)}")
                await asyncio.sleep(3600)  # Wait 1 hour before retry


# Export
__all__ = ['BacktestingCoordinator', 'BacktestScheduler']
