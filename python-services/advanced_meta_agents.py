"""
LAYER 2: META-AGENTS SYSTEM
Advanced Risk, Timing, and Context Analysis

This is the SECOND layer of validation that runs AFTER technical agents.
Only signals that pass Layer 1 (technical agents) reach Layer 2.
"""

from typing import Dict, List, Optional, Tuple
from datetime import datetime, time as dt_time
import pandas as pd
import numpy as np


class RiskAssessmentAgent:
    """
    Meta-Agent 1: Risk Assessment
    
    Evaluates:
    - Current portfolio exposure
    - Correlation with open trades
    - Position sizing appropriateness
    - Maximum drawdown limits
    - Risk/Reward ratio validation
    """
    
    def __init__(self, max_risk_per_trade: float = 0.02, max_total_exposure: float = 0.10):
        self.max_risk_per_trade = max_risk_per_trade  # 2% per trade
        self.max_total_exposure = max_total_exposure  # 10% total
        self.weight = 0.25  # 25% voting weight
    
    def assess(self, signal: Dict, portfolio_state: Dict) -> Tuple[str, float, str]:
        """
        Assess risk for the proposed signal
        
        Returns:
            (vote, confidence, reason)
        """
        score = 0.0
        reasons = []
        
        # 1. Check current exposure
        current_exposure = portfolio_state.get('total_exposure', 0)
        if current_exposure < self.max_total_exposure * 0.5:
            score += 0.3
            reasons.append("Low portfolio exposure (safe to add)")
        elif current_exposure < self.max_total_exposure:
            score += 0.15
            reasons.append("Moderate exposure (acceptable)")
        else:
            score += 0.0
            reasons.append("⚠️ High exposure (at limit)")
        
        # 2. Check correlation with open trades
        open_symbols = portfolio_state.get('open_symbols', [])
        signal_symbol = signal.get('symbol', '')
        
        # Check if same symbol already open
        if signal_symbol in open_symbols:
            score += 0.0
            reasons.append("⚠️ Same symbol already in portfolio")
        else:
            # Check correlation (e.g., EURUSD and GBPUSD are correlated)
            correlated = self._check_correlation(signal_symbol, open_symbols)
            if correlated:
                score += 0.1
                reasons.append("Correlated position exists (reduced score)")
            else:
                score += 0.3
                reasons.append("No correlation with open trades")
        
        # 3. Validate Risk/Reward ratio
        entry = signal.get('entry', 0)
        stop_loss = signal.get('stop_loss', 0)
        take_profit = signal.get('targets', [0])[0]
        
        if entry and stop_loss and take_profit:
            risk = abs(entry - stop_loss)
            reward = abs(take_profit - entry)
            rr_ratio = reward / risk if risk > 0 else 0
            
            if rr_ratio >= 2.0:
                score += 0.4
                reasons.append(f"Excellent R:R ratio (1:{rr_ratio:.1f})")
            elif rr_ratio >= 1.5:
                score += 0.25
                reasons.append(f"Good R:R ratio (1:{rr_ratio:.1f})")
            else:
                score += 0.0
                reasons.append(f"⚠️ Low R:R ratio (1:{rr_ratio:.1f})")
        
        # Determine vote
        if score >= 0.7:
            vote = "APPROVE"
            confidence = min(95, score * 100)
        elif score >= 0.5:
            vote = "APPROVE"
            confidence = min(75, score * 100)
        else:
            vote = "REJECT"
            confidence = score * 100
        
        reason = " | ".join(reasons)
        
        return vote, confidence, reason
    
    def _check_correlation(self, symbol: str, open_symbols: List[str]) -> bool:
        """Check if symbol is correlated with any open positions"""
        # Define correlation groups
        correlations = {
            'EUR': ['EURUSD', 'EURGBP', 'EURJPY', 'EURCHF', 'EURCAD'],
            'GBP': ['GBPUSD', 'EURGBP', 'GBPJPY', 'GBPCHF', 'GBPCAD'],
            'USD': ['EURUSD', 'GBPUSD', 'USDJPY', 'USDCHF', 'USDCAD'],
            'JPY': ['USDJPY', 'EURJPY', 'GBPJPY', 'CHFJPY', 'CADJPY'],
            'BTC': ['BTCUSD', 'ETHUSD'],  # Crypto correlation
            'GOLD': ['XAUUSD', 'XAGUSD']  # Precious metals
        }
        
        for currency, group in correlations.items():
            if symbol in group:
                for open_sym in open_symbols:
                    if open_sym in group and open_sym != symbol:
                        return True
        
        return False


class TimingAnalysisAgent:
    """
    Meta-Agent 2: Timing Analysis
    
    Evaluates:
    - Market session (London, NY, Asian)
    - Volume patterns
    - Time of day appropriateness
    - Avoid low liquidity periods
    - News event proximity
    """
    
    def __init__(self):
        self.weight = 0.35  # 35% voting weight (most important!)
    
    def assess(self, signal: Dict, market_data: Dict) -> Tuple[str, float, str]:
        """
        Assess timing for the proposed signal
        
        Returns:
            (vote, confidence, reason)
        """
        score = 0.0
        reasons = []
        
        # 1. Check market session
        current_time = datetime.now().time()
        session = self._get_market_session(current_time)
        
        if session in ['London', 'New York', 'Overlap']:
            score += 0.35
            reasons.append(f"✅ {session} session (high liquidity)")
        elif session == 'Asian':
            score += 0.15
            reasons.append(f"⚠️ {session} session (lower liquidity)")
        else:
            score += 0.05
            reasons.append(f"⚠️ Off-hours trading (low liquidity)")
        
        # 2. Check volume
        current_volume = market_data.get('current_volume', 0)
        avg_volume = market_data.get('avg_volume', 1)
        
        volume_ratio = current_volume / avg_volume if avg_volume > 0 else 0
        
        if volume_ratio >= 1.2:
            score += 0.25
            reasons.append(f"✅ High volume ({volume_ratio:.1f}x average)")
        elif volume_ratio >= 0.8:
            score += 0.15
            reasons.append(f"Normal volume ({volume_ratio:.1f}x average)")
        else:
            score += 0.0
            reasons.append(f"⚠️ Low volume ({volume_ratio:.1f}x average)")
        
        # 3. Check recent price action
        recent_volatility = market_data.get('recent_volatility', 0)
        avg_volatility = market_data.get('avg_volatility', 1)
        
        volatility_ratio = recent_volatility / avg_volatility if avg_volatility > 0 else 0
        
        if 0.8 <= volatility_ratio <= 1.5:
            score += 0.25
            reasons.append("✅ Normal volatility (ideal)")
        elif volatility_ratio > 2.0:
            score += 0.0
            reasons.append("⚠️ Extreme volatility (risky)")
        else:
            score += 0.15
            reasons.append("Low volatility (acceptable)")
        
        # 4. Check for upcoming news events
        has_news_soon = market_data.get('news_in_next_hour', False)
        
        if has_news_soon:
            score += 0.0
            reasons.append("⚠️ Major news event upcoming (avoid)")
        else:
            score += 0.15
            reasons.append("✅ No major news events")
        
        # Determine vote
        if score >= 0.7:
            vote = "APPROVE"
            confidence = min(95, score * 100)
        elif score >= 0.5:
            vote = "APPROVE"
            confidence = min(75, score * 100)
        else:
            vote = "REJECT"
            confidence = score * 100
        
        reason = " | ".join(reasons)
        
        return vote, confidence, reason
    
    def _get_market_session(self, current_time: dt_time) -> str:
        """Determine current market session"""
        # Times in UTC
        asian_open = dt_time(0, 0)
        asian_close = dt_time(9, 0)
        london_open = dt_time(8, 0)
        london_close = dt_time(17, 0)
        ny_open = dt_time(13, 0)
        ny_close = dt_time(22, 0)
        
        if asian_open <= current_time < asian_close:
            return "Asian"
        elif london_open <= current_time < london_close:
            if ny_open <= current_time < london_close:
                return "Overlap"  # London-NY overlap (best time!)
            return "London"
        elif ny_open <= current_time < ny_close:
            return "New York"
        else:
            return "Off-hours"


class MarketContextAgent:
    """
    Meta-Agent 3: Market Context Analysis
    
    Evaluates:
    - Overall market trend alignment
    - Support/Resistance zones
    - Market regime (trending vs ranging)
    - Sentiment indicators
    - Economic calendar impact
    """
    
    def __init__(self):
        self.weight = 0.40  # 40% voting weight (critical!)
    
    def assess(self, signal: Dict, market_data: Dict) -> Tuple[str, float, str]:
        """
        Assess market context for the proposed signal
        
        Returns:
            (vote, confidence, reason)
        """
        score = 0.0
        reasons = []
        
        # 1. Check trend alignment
        signal_direction = signal.get('signal', '')
        higher_tf_trend = market_data.get('higher_timeframe_trend', 'neutral')
        
        if signal_direction.upper() == higher_tf_trend.upper():
            score += 0.35
            reasons.append(f"✅ Aligned with {higher_tf_trend} higher TF trend")
        elif higher_tf_trend == 'neutral':
            score += 0.15
            reasons.append("Neutral higher TF trend")
        else:
            score += 0.0
            reasons.append(f"⚠️ Against {higher_tf_trend} higher TF trend")
        
        # 2. Check support/resistance proximity
        entry = signal.get('entry', 0)
        nearest_support = market_data.get('nearest_support', 0)
        nearest_resistance = market_data.get('nearest_resistance', 0)
        
        if signal_direction == 'BUY':
            distance_to_support = abs(entry - nearest_support) / entry if entry > 0 else 1
            if distance_to_support < 0.005:  # Within 0.5%
                score += 0.25
                reasons.append("✅ Near strong support level")
            else:
                score += 0.10
                reasons.append("Acceptable distance from support")
        
        elif signal_direction == 'SELL':
            distance_to_resistance = abs(entry - nearest_resistance) / entry if entry > 0 else 1
            if distance_to_resistance < 0.005:  # Within 0.5%
                score += 0.25
                reasons.append("✅ Near strong resistance level")
            else:
                score += 0.10
                reasons.append("Acceptable distance from resistance")
        
        # 3. Check market regime
        regime = market_data.get('market_regime', 'unknown')
        
        if regime == 'trending':
            score += 0.25
            reasons.append("✅ Trending market (favorable)")
        elif regime == 'ranging':
            score += 0.10
            reasons.append("⚠️ Ranging market (less favorable)")
        else:
            score += 0.15
            reasons.append("Transitional market regime")
        
        # 4. Check sentiment
        sentiment = market_data.get('sentiment', 0)  # -1 to 1
        
        if signal_direction == 'BUY' and sentiment > 0.3:
            score += 0.15
            reasons.append("✅ Bullish sentiment supports BUY")
        elif signal_direction == 'SELL' and sentiment < -0.3:
            score += 0.15
            reasons.append("✅ Bearish sentiment supports SELL")
        else:
            score += 0.05
            reasons.append("Neutral sentiment")
        
        # Determine vote
        if score >= 0.7:
            vote = "APPROVE"
            confidence = min(95, score * 100)
        elif score >= 0.5:
            vote = "APPROVE"
            confidence = min(75, score * 100)
        else:
            vote = "REJECT"
            confidence = score * 100
        
        reason = " | ".join(reasons)
        
        return vote, confidence, reason


class MetaAgentOrchestrator:
    """
    Orchestrates all 3 meta-agents (Layer 2)
    
    This runs AFTER Layer 1 (technical agents) approves a signal.
    Provides final validation before signal is published.
    """
    
    def __init__(self):
        self.risk_agent = RiskAssessmentAgent()
        self.timing_agent = TimingAnalysisAgent()
        self.context_agent = MarketContextAgent()
        
        print("✅ Meta-Agent Layer 2 initialized")
        print(f"   Risk Agent: {self.risk_agent.weight*100}% weight")
        print(f"   Timing Agent: {self.timing_agent.weight*100}% weight")
        print(f"   Context Agent: {self.context_agent.weight*100}% weight")
    
    def validate_signal(self, signal: Dict, portfolio_state: Dict, 
                       market_data: Dict) -> Dict:
        """
        Run all meta-agents on the signal
        
        Returns:
            {
                'approved': bool,
                'confidence': float,
                'meta_agent_votes': dict,
                'final_reason': str
            }
        """
        print(f"\n{'='*80}")
        print(f"🔍 LAYER 2: Meta-Agent Validation")
        print(f"{'='*80}")
        
        # Run each meta-agent
        risk_vote, risk_conf, risk_reason = self.risk_agent.assess(signal, portfolio_state)
        timing_vote, timing_conf, timing_reason = self.timing_agent.assess(signal, market_data)
        context_vote, context_conf, context_reason = self.context_agent.assess(signal, market_data)
        
        print(f"\n📊 Risk Agent: {risk_vote} ({risk_conf:.1f}%)")
        print(f"   {risk_reason}")
        print(f"\n⏰ Timing Agent: {timing_vote} ({timing_conf:.1f}%)")
        print(f"   {timing_reason}")
        print(f"\n🌍 Context Agent: {context_vote} ({context_conf:.1f}%)")
        print(f"   {context_reason}")
        
        # Calculate weighted score
        total_score = (
            (risk_conf / 100 * self.risk_agent.weight) +
            (timing_conf / 100 * self.timing_agent.weight) +
            (context_conf / 100 * self.context_agent.weight)
        )
        
        # Count approvals
        approvals = sum([
            1 if risk_vote == "APPROVE" else 0,
            1 if timing_vote == "APPROVE" else 0,
            1 if context_vote == "APPROVE" else 0
        ])
        
        # Decision: Need at least 2/3 approvals AND 60%+ weighted score
        approved = approvals >= 2 and total_score >= 0.60
        
        print(f"\n{'='*80}")
        print(f"📊 LAYER 2 RESULT:")
        print(f"   Approvals: {approvals}/3")
        print(f"   Weighted Score: {total_score*100:.1f}%")
        print(f"   Decision: {'✅ APPROVED' if approved else '❌ REJECTED'}")
        print(f"{'='*80}\n")
        
        return {
            'approved': approved,
            'confidence': total_score * 100,
            'approvals': approvals,
            'meta_agent_votes': {
                'risk': {
                    'vote': risk_vote,
                    'confidence': risk_conf,
                    'reason': risk_reason,
                    'weight': self.risk_agent.weight
                },
                'timing': {
                    'vote': timing_vote,
                    'confidence': timing_conf,
                    'reason': timing_reason,
                    'weight': self.timing_agent.weight
                },
                'context': {
                    'vote': context_vote,
                    'confidence': context_conf,
                    'reason': context_reason,
                    'weight': self.context_agent.weight
                }
            },
            'final_reason': self._generate_final_reason(
                approved, risk_reason, timing_reason, context_reason
            )
        }
    
    def _generate_final_reason(self, approved: bool, risk_reason: str, 
                              timing_reason: str, context_reason: str) -> str:
        """Generate human-readable final reason"""
        if approved:
            return f"Signal approved by meta-agents. {risk_reason} {timing_reason} {context_reason}"
        else:
            return f"Signal rejected by meta-agents. {risk_reason} {timing_reason} {context_reason}"


# Export
__all__ = ['MetaAgentOrchestrator', 'RiskAssessmentAgent', 'TimingAnalysisAgent', 'MarketContextAgent']
