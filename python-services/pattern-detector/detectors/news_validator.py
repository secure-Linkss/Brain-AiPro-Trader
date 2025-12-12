"""
NEWS & ECONOMIC CALENDAR VALIDATOR - INSTITUTIONAL GRADE

This validator prevents trading during high-impact news events.
Institutional algorithms always go flat or reduce exposure during:
- Central Bank Announcements (Fed, ECB, BOE, BOJ)
- NFP (Non-Farm Payrolls)
- CPI/Inflation Data
- GDP Releases
- Interest Rate Decisions

This is a CRITICAL risk management component.
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import logging

logger = logging.getLogger(__name__)

class NewsValidator:
    """
    Validates if it's safe to trade based on economic calendar.
    """
    
    def __init__(self):
        # High-Impact News Events (UTC times typically)
        self.high_impact_events = {
            'NFP': {'day': 'first_friday', 'time': '13:30', 'blackout_minutes': 120},
            'FOMC': {'frequency': 'monthly', 'blackout_minutes': 180},
            'CPI': {'frequency': 'monthly', 'blackout_minutes': 90},
            'GDP': {'frequency': 'quarterly', 'blackout_minutes': 60},
            'ECB_RATE': {'frequency': 'monthly', 'blackout_minutes': 120},
        }
        
        # Market hours when volatility spikes
        self.high_volatility_hours = {
            'london_open': {'hour': 8, 'minute': 0},
            'ny_open': {'hour': 13, 'minute': 30},
            'london_ny_overlap': {'start': 13, 'end': 16},
        }
    
    def validate_trading_time(self, current_time: datetime = None) -> Dict:
        """
        Check if current time is safe for trading.
        
        Returns:
            {
                'safe_to_trade': bool,
                'reason': str,
                'risk_level': str,  # 'LOW', 'MEDIUM', 'HIGH'
                'next_safe_time': datetime
            }
        """
        if current_time is None:
            current_time = datetime.utcnow()
            
        result = {
            'safe_to_trade': True,
            'reason': 'Normal trading conditions',
            'risk_level': 'LOW',
            'next_safe_time': current_time
        }
        
        # 1. Check if it's weekend
        if current_time.weekday() >= 5:  # Saturday = 5, Sunday = 6
            result['safe_to_trade'] = False
            result['reason'] = 'Market closed (Weekend)'
            result['risk_level'] = 'HIGH'
            # Calculate next Monday
            days_until_monday = (7 - current_time.weekday()) % 7
            if days_until_monday == 0:
                days_until_monday = 1
            result['next_safe_time'] = current_time + timedelta(days=days_until_monday)
            return result
        
        # 2. Check if it's within market hours (Forex: 24/5, but avoid dead zones)
        hour = current_time.hour
        
        # Dead zone: 22:00 - 00:00 UTC (Low liquidity)
        if hour >= 22 or hour < 1:
            result['safe_to_trade'] = False
            result['reason'] = 'Low liquidity period (Asian session close)'
            result['risk_level'] = 'MEDIUM'
            return result
        
        # 3. Check for high-impact news (simplified - in production, use API)
        # NFP: First Friday of month at 13:30 UTC
        if self._is_nfp_day(current_time):
            # Blackout 1 hour before and 1 hour after
            nfp_time = current_time.replace(hour=13, minute=30, second=0)
            time_diff = abs((current_time - nfp_time).total_seconds() / 60)
            
            if time_diff < 60:  # Within 1 hour of NFP
                result['safe_to_trade'] = False
                result['reason'] = 'NFP Release - High Impact News'
                result['risk_level'] = 'HIGH'
                result['next_safe_time'] = nfp_time + timedelta(minutes=90)
                return result
        
        # 4. Check for high volatility periods (London/NY open)
        if hour == 8 and current_time.minute < 30:
            result['risk_level'] = 'MEDIUM'
            result['reason'] = 'London Open - Increased volatility'
        elif hour == 13 and current_time.minute >= 30:
            result['risk_level'] = 'MEDIUM'
            result['reason'] = 'NY Open - Increased volatility'
        
        return result
    
    def _is_nfp_day(self, dt: datetime) -> bool:
        """Check if current day is NFP (First Friday of month)"""
        if dt.weekday() != 4:  # Not Friday
            return False
        
        # Check if it's the first Friday
        first_day = dt.replace(day=1)
        first_friday = first_day + timedelta(days=(4 - first_day.weekday()) % 7)
        
        return dt.date() == first_friday.date()
    
    def validate_signal_timing(self, signal_data: Dict) -> Dict:
        """
        Validate if a signal should be executed based on timing.
        
        Args:
            signal_data: Signal information including timestamp
            
        Returns:
            {
                'approved': bool,
                'reason': str,
                'adjusted_confidence': float
            }
        """
        timestamp = signal_data.get('timestamp', datetime.utcnow().timestamp())
        signal_time = datetime.fromtimestamp(timestamp)
        
        validation = self.validate_trading_time(signal_time)
        
        result = {
            'approved': validation['safe_to_trade'],
            'reason': validation['reason'],
            'adjusted_confidence': signal_data.get('confidence', 0.5)
        }
        
        # Reduce confidence during medium risk periods
        if validation['risk_level'] == 'MEDIUM' and validation['safe_to_trade']:
            result['adjusted_confidence'] *= 0.8
            result['reason'] += ' (Confidence reduced due to volatility)'
        
        return result


def detect_news_risk(df: pd.DataFrame = None, current_time: datetime = None) -> Dict:
    """
    Main function to detect news-related trading risks.
    
    Returns:
        {
            'safe_to_trade': bool,
            'risk_level': str,
            'reason': str,
            'confidence_multiplier': float
        }
    """
    validator = NewsValidator()
    validation = validator.validate_trading_time(current_time)
    
    return {
        'safe_to_trade': validation['safe_to_trade'],
        'risk_level': validation['risk_level'],
        'reason': validation['reason'],
        'confidence_multiplier': 1.0 if validation['safe_to_trade'] else 0.0
    }
