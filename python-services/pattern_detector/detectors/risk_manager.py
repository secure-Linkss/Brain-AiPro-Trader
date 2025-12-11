"""
INSTITUTIONAL RISK MANAGER - POSITION SIZING & EXPOSURE CONTROL

This module implements institutional-grade risk management:
1. Kelly Criterion for optimal position sizing
2. Max correlation exposure limits
3. Daily drawdown circuit breakers
4. Volatility-adjusted position sizing
"""

import pandas as pd
import numpy as np
from typing import Dict, List, Optional
from dataclasses import dataclass
import logging

logger = logging.getLogger(__name__)

@dataclass
class RiskParameters:
    """Risk management parameters"""
    max_risk_per_trade: float = 0.01  # 1% of account
    max_daily_loss: float = 0.03  # 3% daily loss limit
    max_open_positions: int = 5
    max_correlated_exposure: float = 0.05  # 5% max on correlated pairs
    min_risk_reward: float = 1.5
    volatility_scalar: float = 1.0  # Adjust position size based on volatility

class InstitutionalRiskManager:
    """
    Manages position sizing and risk exposure like institutional desks.
    """
    
    def __init__(self, account_balance: float = 10000, params: RiskParameters = None):
        self.account_balance = account_balance
        self.params = params or RiskParameters()
        self.daily_pnl = 0.0
        self.open_positions = []
        self.daily_trades = 0
        
    def calculate_position_size(self, signal: Dict, df: pd.DataFrame) -> Dict:
        """
        Calculate optimal position size using institutional methods.
        
        Args:
            signal: Trading signal with entry, SL, TP
            df: Price data for volatility calculation
            
        Returns:
            {
                'position_size': float,  # Lot size or units
                'risk_amount': float,    # Dollar risk
                'approved': bool,
                'reason': str
            }
        """
        result = {
            'position_size': 0.0,
            'risk_amount': 0.0,
            'approved': False,
            'reason': ''
        }
        
        # 1. Check Daily Loss Limit (Circuit Breaker)
        if self.daily_pnl < -(self.account_balance * self.params.max_daily_loss):
            result['reason'] = f"Daily loss limit reached: ${abs(self.daily_pnl):.2f}"
            logger.warning(result['reason'])
            return result
        
        # 2. Check Max Open Positions
        if len(self.open_positions) >= self.params.max_open_positions:
            result['reason'] = f"Max open positions reached: {len(self.open_positions)}"
            return result
        
        # 3. Extract Signal Data
        entry = signal.get('entry', 0)
        stop_loss = signal.get('stop_loss', 0)
        targets = signal.get('targets', [])
        confidence = signal.get('final_confidence', 0.5)
        
        if not entry or not stop_loss:
            result['reason'] = "Invalid entry or stop loss"
            return result
        
        # 4. Calculate Risk Per Trade
        risk_pips = abs(entry - stop_loss)
        if risk_pips == 0:
            result['reason'] = "Zero risk (invalid SL)"
            return result
        
        # 5. Calculate Reward
        if not targets:
            result['reason'] = "No targets defined"
            return result
        
        reward_pips = abs(targets[-1].get('price', entry) - entry)
        risk_reward = reward_pips / risk_pips if risk_pips > 0 else 0
        
        if risk_reward < self.params.min_risk_reward:
            result['reason'] = f"R:R too low: {risk_reward:.2f} (min: {self.params.min_risk_reward})"
            return result
        
        # 6. Volatility Adjustment
        atr = self._calculate_atr(df)
        volatility_multiplier = self._get_volatility_multiplier(atr, risk_pips)
        
        # 7. Kelly Criterion (Simplified)
        # Kelly = (Win% * Avg Win - Loss% * Avg Loss) / Avg Win
        # Simplified: Use confidence as win probability
        win_prob = confidence
        kelly_fraction = (win_prob * risk_reward - (1 - win_prob)) / risk_reward
        kelly_fraction = max(0, min(kelly_fraction, 0.25))  # Cap at 25% (half-Kelly)
        
        # 8. Calculate Position Size
        base_risk = self.account_balance * self.params.max_risk_per_trade
        adjusted_risk = base_risk * kelly_fraction * volatility_multiplier
        
        # Position size = Risk Amount / Risk in Pips
        # For Forex: Lot size = Risk / (Pip Value * Stop Loss Pips)
        # Simplified: Assume 1 pip = $10 for standard lot
        pip_value = 10  # This should be calculated based on pair and account currency
        position_size = adjusted_risk / (risk_pips * pip_value)
        
        # 9. Final Checks
        if position_size <= 0:
            result['reason'] = "Calculated position size is zero or negative"
            return result
        
        result['position_size'] = round(position_size, 2)
        result['risk_amount'] = adjusted_risk
        result['approved'] = True
        result['reason'] = f"Position approved: {position_size:.2f} lots, Risk: ${adjusted_risk:.2f}, R:R: {risk_reward:.2f}"
        result['kelly_fraction'] = kelly_fraction
        result['volatility_multiplier'] = volatility_multiplier
        
        logger.info(result['reason'])
        return result
    
    def _calculate_atr(self, df: pd.DataFrame, period: int = 14) -> float:
        """Calculate Average True Range"""
        if len(df) < period:
            return 0.0
        
        high = df['high'].values
        low = df['low'].values
        close = df['close'].values
        
        tr_list = []
        for i in range(1, len(df)):
            tr = max(
                high[i] - low[i],
                abs(high[i] - close[i-1]),
                abs(low[i] - close[i-1])
            )
            tr_list.append(tr)
        
        atr = np.mean(tr_list[-period:]) if len(tr_list) >= period else 0.0
        return atr
    
    def _get_volatility_multiplier(self, atr: float, stop_loss_pips: float) -> float:
        """
        Adjust position size based on volatility.
        High volatility = smaller position.
        """
        if atr == 0 or stop_loss_pips == 0:
            return 1.0
        
        # If stop loss is tight relative to ATR, reduce size
        ratio = stop_loss_pips / atr
        
        if ratio < 0.5:  # Very tight stop
            return 0.5  # Reduce position by 50%
        elif ratio < 1.0:  # Tight stop
            return 0.75
        elif ratio > 2.0:  # Wide stop
            return 1.25
        else:
            return 1.0
    
    def check_correlation_exposure(self, new_signal: Dict) -> Dict:
        """
        Check if adding this position would exceed correlation limits.
        
        For example, don't trade EURUSD and GBPUSD simultaneously (highly correlated).
        """
        symbol = new_signal.get('symbol', '')
        direction = new_signal.get('decision', '')
        
        # Correlation groups (simplified)
        correlation_groups = {
            'EUR_PAIRS': ['EURUSD', 'EURGBP', 'EURJPY', 'EURCHF'],
            'USD_PAIRS': ['EURUSD', 'GBPUSD', 'USDJPY', 'USDCHF'],
            'COMMODITY': ['XAUUSD', 'XAGUSD', 'USOIL'],
        }
        
        # Find which group this symbol belongs to
        symbol_group = None
        for group_name, symbols in correlation_groups.items():
            if symbol in symbols:
                symbol_group = group_name
                break
        
        if not symbol_group:
            return {'approved': True, 'reason': 'No correlation group'}
        
        # Check existing positions in same group
        correlated_exposure = 0.0
        for pos in self.open_positions:
            if pos['symbol'] in correlation_groups[symbol_group]:
                if pos['direction'] == direction:  # Same direction
                    correlated_exposure += pos.get('risk_amount', 0)
        
        max_correlated = self.account_balance * self.params.max_correlated_exposure
        
        if correlated_exposure >= max_correlated:
            return {
                'approved': False,
                'reason': f"Correlation limit reached for {symbol_group}: ${correlated_exposure:.2f}"
            }
        
        return {'approved': True, 'reason': 'Correlation check passed'}
    
    def update_daily_pnl(self, pnl: float):
        """Update daily P&L tracker"""
        self.daily_pnl += pnl
        logger.info(f"Daily P&L updated: ${self.daily_pnl:.2f}")
    
    def add_position(self, position: Dict):
        """Track open position"""
        self.open_positions.append(position)
        self.daily_trades += 1
    
    def remove_position(self, position_id: str):
        """Remove closed position"""
        self.open_positions = [p for p in self.open_positions if p.get('id') != position_id]
    
    def reset_daily_stats(self):
        """Reset daily counters (call at start of new trading day)"""
        self.daily_pnl = 0.0
        self.daily_trades = 0
        logger.info("Daily stats reset")


def calculate_position_size(signal: Dict, df: pd.DataFrame, account_balance: float = 10000) -> Dict:
    """
    Convenience function for position sizing.
    
    Returns:
        {
            'position_size': float,
            'risk_amount': float,
            'approved': bool,
            'reason': str
        }
    """
    risk_manager = InstitutionalRiskManager(account_balance=account_balance)
    return risk_manager.calculate_position_size(signal, df)
