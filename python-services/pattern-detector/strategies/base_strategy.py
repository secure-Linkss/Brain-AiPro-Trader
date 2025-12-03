from abc import ABC, abstractmethod
import pandas as pd
from typing import Dict, Optional

class BaseStrategy(ABC):
    def __init__(self, name: str):
        self.name = name

    @abstractmethod
    def analyze(self, df: pd.DataFrame) -> Optional[Dict]:
        """
        Analyze the dataframe and return a signal if found.
        Returns:
            {
                'strategy': str,
                'signal': 'BUY' | 'SELL',
                'confidence': float, # 0-100
                'stop_loss': float,
                'take_profit': float,
                'reason': str
            }
            or None if no signal.
        """
        pass

    def get_atr(self, df: pd.DataFrame, period: int = 14) -> float:
        """Helper to get current ATR"""
        import pandas_ta as ta
        atr = df.ta.atr(length=period)
        return atr.iloc[-1] if not atr.empty else 0.0
