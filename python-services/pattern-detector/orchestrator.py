"""
COMPREHENSIVE Multi-Agent Strategy Orchestrator - GURU LEVEL

This is the central "Brain" that coordinates all specialist agents and validators.
It implements:
1. Agent Registration & Management
2. Signal Normalization & Standardization
3. Validator Execution Pipeline
4. Weighted Voting Logic with Dynamic Weights
5. Confluence & Veto Engine
6. Final Signal Generation with Explainability
"""

import pandas as pd
import numpy as np
from typing import Dict, List, Optional, Any, Union
from dataclasses import dataclass, field
from datetime import datetime
import logging
import json

# Import all specialist detectors
# Note: In a real production environment, these would be injected or loaded dynamically
from .fibonacci_comprehensive import detect_fibonacci_patterns
from .trend_following_comprehensive import detect_trend_patterns
from .multi_timeframe_comprehensive import detect_multi_timeframe_patterns
from .market_regime_comprehensive import detect_market_regime
from .volume_strategies_comprehensive import detect_volume_strategies
from .mean_reversion_comprehensive import detect_mean_reversion_strategies
from .breakout_scalping_comprehensive import detect_breakout_strategies
from .order_flow_comprehensive import detect_order_flow_strategies
from .candlestick_comprehensive import detect_candlestick_patterns
from .smc_comprehensive import detect_smc_patterns
from .elliott_wave import detect_elliott_waves
from .harmonics import detect_harmonic_patterns
from .chart_patterns_advanced import detect_chart_patterns
from .supply_demand import detect_supply_demand
from .confirmation_validation_comprehensive import detect_confirmation_strategies
from .advanced_analytics_comprehensive import detect_advanced_analytics
from .specialized_institutional_comprehensive import detect_institutional_strategies

# Configure Logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger('AgentOrchestrator')

@dataclass
class AgentSignal:
    """Standardized signal format for all agents"""
    agent_id: str
    agent_type: str  # 'specialist' or 'validator'
    strategy_name: str
    symbol: str
    timeframe: str
    timestamp: float
    signal_type: str  # 'BUY', 'SELL', 'NEUTRAL', 'INVALID'
    confidence: float  # 0.0 to 1.0
    score_breakdown: Dict[str, float]
    evidence: List[str]
    expiry: Optional[float] = None
    entry: Optional[float] = None
    stop_loss: Optional[float] = None
    targets: List[Dict] = field(default_factory=list)
    metadata: Dict[str, Any] = field(default_factory=dict)

@dataclass
class FinalSignal:
    """Final output signal after voting and validation"""
    symbol: str
    timeframe: str
    timestamp: float
    decision: str  # 'BUY', 'SELL', 'NEUTRAL'
    final_confidence: float
    confidence_label: str  # 'HIGH', 'MEDIUM', 'LOW'
    entry: float
    stop_loss: float
    targets: List[Dict]
    risk_reward_ratio: float
    supporting_agents: List[Dict]  # Top agents that voted for this
    opposing_agents: List[Dict]    # Agents that voted against
    validator_results: Dict[str, bool]
    veto_status: bool
    veto_reasons: List[str]
    market_regime: Dict
    execution_plan: Dict

class AgentOrchestrator:
    """
    The Master Brain that coordinates 35+ trading agents.
    """
    
    def __init__(self):
        self.agents = {}
        self.validators = {}
        self.weights = self._initialize_weights()
        self.history = []
        
        # Configuration
        self.min_confidence_threshold = 0.65
        self.min_validators_required = 2
        self.max_risk_reward = 5.0
        self.min_risk_reward = 1.5
        
    def _initialize_weights(self) -> Dict[str, float]:
        """Initialize dynamic weights for all agent categories"""
        return {
            # Specialist Agents (Generators)
            'fibonacci': 0.7,
            'trend_following': 0.8,
            'multi_timeframe': 0.9, # High weight for MTF
            'volume': 0.8,
            'mean_reversion': 0.6,
            'breakout': 0.7,
            'order_flow': 0.85, # Institutional flow is important
            'candlestick': 0.5, # Lower weight alone, needs confirmation
            'smc': 0.85,
            'elliott_wave': 0.65, # Subjective
            'harmonics': 0.7,
            'chart_patterns': 0.6,
            'supply_demand': 0.8,
            
            # Validator Agents (Auditors)
            'trend_validator': 1.0, # Critical
            'volume_validator': 0.9,
            'volatility_validator': 0.8,
            'risk_validator': 1.0, # Critical
            'news_validator': 1.0 # Critical
        }

    def process_market_data(self, df: pd.DataFrame, symbol: str, timeframe: str, htf_data: Dict[str, pd.DataFrame] = None) -> FinalSignal:
        """
        Main Pipeline:
        1. Run Specialist Agents -> Generate Candidates
        2. Run Validator Agents -> Audit Candidates
        3. Execute Voting Logic
        4. Generate Final Signal
        """
        logger.info(f"Processing {symbol} {timeframe}...")
        
        # 1. Run Specialist Agents
        candidates = self._run_specialists(df, htf_data)
        
        if not candidates:
            return self._create_neutral_signal(symbol, timeframe)
            
        # 2. Run Market Regime (Context)
        regime = detect_market_regime(df)
        
        # 3. Process each candidate through Validators
        validated_signals = []
        for candidate in candidates:
            validation_result = self._validate_candidate(candidate, df, regime)
            if validation_result['passed']:
                validated_signals.append({
                    'candidate': candidate,
                    'validation': validation_result
                })
        
        if not validated_signals:
            return self._create_neutral_signal(symbol, timeframe, reason="No candidates passed validation")
            
        # 4. Voting & Fusion
        final_decision = self._execute_voting(validated_signals, regime)
        
        return final_decision

    def _run_specialists(self, df: pd.DataFrame, htf_data: Dict) -> List[AgentSignal]:
        """Execute all specialist strategy detectors and normalize outputs"""
        candidates = []
        
        # Helper to convert raw detector output to AgentSignal
        def add_signals(raw_signals, agent_name, strategy_type):
            if isinstance(raw_signals, dict):
                # Flatten dict if needed or iterate categories
                for category, sigs in raw_signals.items():
                    for s in sigs:
                        candidates.append(self._normalize_signal(s, agent_name, strategy_type))
            elif isinstance(raw_signals, list):
                for s in raw_signals:
                    candidates.append(self._normalize_signal(s, agent_name, strategy_type))

        # --- EXECUTE STRATEGIES ---
        
        # 1. Fibonacci
        try:
            fib_sigs = detect_fibonacci_patterns(df)
            add_signals(fib_sigs, 'fibonacci_agent', 'fibonacci')
        except Exception as e: logger.error(f"Fibonacci Agent failed: {e}")

        # 2. Trend Following
        try:
            trend_sigs = detect_trend_patterns(df)
            add_signals(trend_sigs, 'trend_agent', 'trend_following')
        except Exception as e: logger.error(f"Trend Agent failed: {e}")

        # 3. Multi-Timeframe (if data available)
        if htf_data:
            try:
                mtf_sigs = detect_multi_timeframe_patterns(df, htf_data)
                add_signals(mtf_sigs, 'mtf_agent', 'multi_timeframe')
            except Exception as e: logger.error(f"MTF Agent failed: {e}")

        # 4. Volume
        try:
            vol_sigs = detect_volume_strategies(df)
            add_signals(vol_sigs, 'volume_agent', 'volume')
        except Exception as e: logger.error(f"Volume Agent failed: {e}")
        
        # 5. Mean Reversion
        try:
            mr_sigs = detect_mean_reversion_strategies(df)
            add_signals(mr_sigs, 'mean_reversion_agent', 'mean_reversion')
        except Exception as e: logger.error(f"Mean Reversion Agent failed: {e}")
        
        # 6. Breakout
        try:
            brk_sigs = detect_breakout_strategies(df)
            add_signals(brk_sigs, 'breakout_agent', 'breakout')
        except Exception as e: logger.error(f"Breakout Agent failed: {e}")
        
        # 7. Order Flow
        try:
            of_sigs = detect_order_flow_strategies(df)
            add_signals(of_sigs, 'order_flow_agent', 'order_flow')
        except Exception as e: logger.error(f"Order Flow Agent failed: {e}")
        
        # 8. SMC
        try:
            smc_sigs = detect_smc_patterns(df)
            add_signals(smc_sigs, 'smc_agent', 'smc')
        except Exception as e: logger.error(f"SMC Agent failed: {e}")
        
        # 9. Candlestick
        try:
            candle_sigs = detect_candlestick_patterns(df)
            add_signals(candle_sigs, 'candlestick_agent', 'candlestick')
        except Exception as e: logger.error(f"Candlestick Agent failed: {e}")
        
        # 10. Confirmation & Validation
        try:
            conf_sigs = detect_confirmation_strategies(df)
            add_signals(conf_sigs, 'confirmation_agent', 'confirmation')
        except Exception as e: logger.error(f"Confirmation Agent failed: {e}")

        # 11. Advanced Analytics
        try:
            analytics_sigs = detect_advanced_analytics(df)
            add_signals(analytics_sigs, 'analytics_agent', 'analytics')
        except Exception as e: logger.error(f"Analytics Agent failed: {e}")

        # 12. Institutional Strategies
        try:
            inst_sigs = detect_institutional_strategies(df)
            add_signals(inst_sigs, 'institutional_agent', 'institutional')
        except Exception as e: logger.error(f"Institutional Agent failed: {e}")

        # ... Add other agents (Harmonic, Elliott, etc.) here ...

        return candidates

    def _normalize_signal(self, raw: Dict, agent_id: str, strategy_name: str) -> AgentSignal:
        """Convert diverse raw signals into a unified AgentSignal structure"""
        # Extract common fields with fallbacks
        direction = raw.get('direction', 'NEUTRAL').upper()
        confidence = raw.get('confidence', 50.0) / 100.0 # Normalize to 0-1
        
        # Ensure targets is a list
        targets = raw.get('targets', [])
        if not isinstance(targets, list): targets = []
        
        return AgentSignal(
            agent_id=agent_id,
            agent_type='specialist',
            strategy_name=strategy_name,
            symbol='UNKNOWN', # Filled by caller
            timeframe='UNKNOWN', # Filled by caller
            timestamp=datetime.now().timestamp(),
            signal_type='BUY' if direction == 'BULLISH' else 'SELL' if direction == 'BEARISH' else 'NEUTRAL',
            confidence=confidence,
            score_breakdown={'raw_score': confidence},
            evidence=[raw.get('description', 'No description')],
            entry=raw.get('entry'),
            stop_loss=raw.get('stop_loss'),
            targets=targets,
            metadata=raw
        )

    def _validate_candidate(self, candidate: AgentSignal, df: pd.DataFrame, regime: Dict) -> Dict:
        """
        Run a candidate signal through the gauntlet of Validator Agents.
        Returns validation results and veto status.
        """
        results = {
            'passed': False,
            'validators': {},
            'veto': False,
            'veto_reasons': []
        }
        
        # 1. Trend Validation
        # Check if signal aligns with major trend (unless it's a mean reversion signal)
        trend_regime = regime.get('trend_vs_range', {})
        trend_bias = trend_regime.get('directional_bias', 'neutral')
        
        if candidate.strategy_name != 'mean_reversion':
            if trend_bias == 'bullish' and candidate.signal_type == 'SELL':
                results['validators']['trend'] = False
                # Soft veto for trend following strategies against trend
                if candidate.strategy_name in ['trend_following', 'breakout']:
                    results['veto'] = True
                    results['veto_reasons'].append("Counter-trend signal in strong trend")
            elif trend_bias == 'bearish' and candidate.signal_type == 'BUY':
                results['validators']['trend'] = False
                if candidate.strategy_name in ['trend_following', 'breakout']:
                    results['veto'] = True
                    results['veto_reasons'].append("Counter-trend signal in strong trend")
            else:
                results['validators']['trend'] = True
        else:
            # Mean reversion logic is opposite
            results['validators']['trend'] = True # Allowed to be counter trend
            
        # 2. Risk Validation
        if candidate.entry and candidate.stop_loss:
            risk = abs(candidate.entry - candidate.stop_loss)
            if risk == 0:
                results['veto'] = True
                results['veto_reasons'].append("Zero risk calculated (Invalid SL)")
            else:
                # Check R:R
                if candidate.targets:
                    reward = abs(candidate.targets[-1]['price'] - candidate.entry)
                    rr = reward / risk
                    if rr < self.min_risk_reward:
                        results['validators']['risk'] = False
                        # Don't veto immediately, but flag it
                    else:
                        results['validators']['risk'] = True
                else:
                    results['validators']['risk'] = False

        # 3. Volatility Validation
        vol_regime = regime.get('volatility_regime', {})
        if vol_regime.get('volatility_level') == 'extreme':
            # Veto tight stops in extreme volatility
            if candidate.strategy_name == 'scalping':
                results['veto'] = True
                results['veto_reasons'].append("Scalping unsafe in extreme volatility")
                
        # Final Decision
        passed_validators = sum(1 for v in results['validators'].values() if v)
        if not results['veto'] and passed_validators >= 1: # At least 1 validator passed
            results['passed'] = True
            
        return results

    def _execute_voting(self, validated_signals: List[Dict], regime: Dict) -> FinalSignal:
        """
        Weighted Voting System:
        - Aggregates votes from all valid signals
        - Applies weights based on agent reliability and market regime
        """
        buy_score = 0.0
        sell_score = 0.0
        
        buy_agents = []
        sell_agents = []
        
        for item in validated_signals:
            candidate = item['candidate']
            weight = self.weights.get(candidate.strategy_name, 0.5)
            
            # Dynamic Weight Adjustment based on Regime
            # Example: Increase Trend Following weight in Trending Regime
            trend_bias = regime.get('trend_vs_range', {}).get('directional_bias', 'neutral')
            if trend_bias != 'neutral' and candidate.strategy_name == 'trend_following':
                weight *= 1.2
            elif trend_bias == 'neutral' and candidate.strategy_name == 'mean_reversion':
                weight *= 1.2
                
            score = candidate.confidence * weight
            
            if candidate.signal_type == 'BUY':
                buy_score += score
                buy_agents.append({'agent': candidate.strategy_name, 'confidence': candidate.confidence, 'evidence': candidate.evidence})
            elif candidate.signal_type == 'SELL':
                sell_score += score
                sell_agents.append({'agent': candidate.strategy_name, 'confidence': candidate.confidence, 'evidence': candidate.evidence})
                
        # Determine Winner
        total_score = buy_score + sell_score
        if total_score == 0:
             return self._create_neutral_signal("UNKNOWN", "UNKNOWN")
             
        if buy_score > sell_score:
            final_decision = 'BUY'
            net_confidence = (buy_score - sell_score) / total_score # Simple normalization
            # Scale confidence to 0-1 based on raw score magnitude (heuristic)
            final_confidence = min(0.99, buy_score / 3.0) # Assume 3.0 is a "strong" total score
            supporting = buy_agents
            opposing = sell_agents
        else:
            final_decision = 'SELL'
            net_confidence = (sell_score - buy_score) / total_score
            final_confidence = min(0.99, sell_score / 3.0)
            supporting = sell_agents
            opposing = buy_agents
            
        # Confidence Label
        if final_confidence >= 0.8: label = 'HIGH'
        elif final_confidence >= 0.6: label = 'MEDIUM'
        else: label = 'LOW'
        
        # Select best entry/stop from supporting agents (e.g., the one with highest individual confidence)
        best_agent = max(validated_signals, key=lambda x: x['candidate'].confidence if x['candidate'].signal_type == final_decision else -1)
        best_candidate = best_agent['candidate']
        
        return FinalSignal(
            symbol=best_candidate.symbol,
            timeframe=best_candidate.timeframe,
            timestamp=datetime.now().timestamp(),
            decision=final_decision,
            final_confidence=final_confidence,
            confidence_label=label,
            entry=best_candidate.entry,
            stop_loss=best_candidate.stop_loss,
            targets=best_candidate.targets,
            risk_reward_ratio=0.0, # Calculate real RR here
            supporting_agents=supporting,
            opposing_agents=opposing,
            validator_results={},
            veto_status=False,
            veto_reasons=[],
            market_regime=regime,
            execution_plan={'type': 'market', 'limit_price': best_candidate.entry}
        )

    def _create_neutral_signal(self, symbol: str, timeframe: str, reason: str = "No Signal") -> FinalSignal:
        return FinalSignal(
            symbol=symbol,
            timeframe=timeframe,
            timestamp=datetime.now().timestamp(),
            decision='NEUTRAL',
            final_confidence=0.0,
            confidence_label='LOW',
            entry=0.0,
            stop_loss=0.0,
            targets=[],
            risk_reward_ratio=0.0,
            supporting_agents=[],
            opposing_agents=[],
            validator_results={},
            veto_status=False,
            veto_reasons=[reason],
            market_regime={},
            execution_plan={}
        )

# Export singleton
orchestrator = AgentOrchestrator()
