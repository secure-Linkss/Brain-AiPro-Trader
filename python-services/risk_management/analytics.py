import numpy as np
import pandas as pd
from typing import List, Dict, Union, Optional
from enum import Enum

class AssetClass(Enum):
    FOREX = "forex"
    CRYPTO = "crypto"
    STOCK = "stock"
    INDICES = "indices"

class PositionSizer:
    """
    Advanced Position Sizing Calculator for Institutional Risk Management.
    """
    
    @staticmethod
    def calculate_position_size(
        account_balance: float,
        risk_percentage: float,
        stop_loss_pips: float,
        asset_class: AssetClass,
        pair: str,
        price: float,
        contract_size: float = 100000  # Standard Lot for Forex
    ) -> Dict[str, float]:
        """
        Calculate optimal position size based on risk parameters.
        """
        risk_amount = account_balance * (risk_percentage / 100)
        
        position_size = 0.0
        lot_size = 0.0
        
        if asset_class == AssetClass.FOREX:
            # Forex Calculation: Risk / (SL * Pip Value)
            # Simplified: Assuming USD quote currency for now or handling conversion
            # Pip value per standard lot approx $10 for EURUSD
            
            # Advanced formula: Position Size = Risk Amount / (Stop Loss Distance * Value per Point)
            if stop_loss_pips <= 0:
                raise ValueError("Stop loss must be positive")
                
            # Value per pip per unit
            pip_value_per_unit = 0.0001 # For most pairs
            if "JPY" in pair:
                pip_value_per_unit = 0.01
                
            # Risk = Units * SL_pips * Pip_Value_Per_Unit
            # Units = Risk / (SL_pips * Pip_Value_Per_Unit)
            # Note: SL_pips here is actual price difference for calculation
            
            sl_price_diff = stop_loss_pips * pip_value_per_unit
            if "JPY" in pair: # JPY pairs are different
                 sl_price_diff = stop_loss_pips * 0.01
            else:
                 sl_price_diff = stop_loss_pips * 0.0001

            # Re-evaluating standard formula for robustness
            # Units = RiskAmount / (StopLossPriceDistance)
            # StopLossPriceDistance = Entry - SL
            
            # Let's use the direct pip value approach which is standard in trading
            # Standard Lot (100k) pip value ~ $10 USD (for XXX/USD)
            
            pip_value_standard = 10.0 
            if "JPY" in pair:
                pip_value_standard = 9.0 # Approx, varies with USDJPY rate
            
            # Risk = Lots * SL_Pips * Pip_Value_Standard
            lot_size = risk_amount / (stop_loss_pips * pip_value_standard)
            position_size = lot_size * contract_size

        elif asset_class == AssetClass.CRYPTO:
            # Crypto: Risk / (Entry - SL)
            # Stop Loss here is price distance
            if stop_loss_pips <= 0: raise ValueError("Stop loss distance must be positive")
            position_size = risk_amount / stop_loss_pips
            lot_size = position_size # Crypto is usually units

        elif asset_class == AssetClass.STOCK:
            # Stock: Risk / (Entry - SL)
            if stop_loss_pips <= 0: raise ValueError("Stop loss distance must be positive")
            position_size = risk_amount / stop_loss_pips
            lot_size = position_size

        return {
            "risk_amount": round(risk_amount, 2),
            "position_size_units": round(position_size, 4),
            "lot_size": round(lot_size, 2),
            "leverage_required": round((position_size * price) / account_balance, 2)
        }

class PortfolioAnalytics:
    """
    Institutional Grade Portfolio Performance Analytics.
    """
    
    @staticmethod
    def calculate_metrics(trades: List[Dict[str, float]]) -> Dict[str, float]:
        """
        Calculate Sharpe, Sortino, Drawdown, etc. from a list of trade returns (%).
        """
        if not trades:
            return {}
            
        df = pd.DataFrame(trades)
        if 'return_pct' not in df.columns:
            return {"error": "Missing return_pct in trade data"}
            
        returns = df['return_pct']
        
        # 1. Win Rate
        wins = returns[returns > 0].count()
        total = returns.count()
        win_rate = (wins / total) * 100 if total > 0 else 0
        
        # 2. Profit Factor
        gross_profit = returns[returns > 0].sum()
        gross_loss = abs(returns[returns < 0].sum())
        profit_factor = gross_profit / gross_loss if gross_loss != 0 else 99.99
        
        # 3. Max Drawdown
        # Construct equity curve starting at 100
        equity = (1 + returns/100).cumprod()
        peak = equity.cummax()
        drawdown = (equity - peak) / peak
        max_drawdown = drawdown.min() * 100
        
        # 4. Sharpe Ratio (Assuming risk-free rate = 0 for simplicity in crypto/trading)
        # Annualized (assuming daily trades, 252 days)
        mean_return = returns.mean()
        std_return = returns.std()
        sharpe = (mean_return / std_return) * np.sqrt(252) if std_return != 0 else 0
        
        # 5. Sortino Ratio (Downside deviation only)
        downside_returns = returns[returns < 0]
        downside_std = downside_returns.std()
        sortino = (mean_return / downside_std) * np.sqrt(252) if downside_std != 0 else 0
        
        return {
            "win_rate": round(win_rate, 2),
            "profit_factor": round(profit_factor, 2),
            "max_drawdown": round(max_drawdown, 2),
            "sharpe_ratio": round(sharpe, 2),
            "sortino_ratio": round(sortino, 2),
            "total_trades": int(total),
            "expectancy": round(returns.mean(), 2)
        }
