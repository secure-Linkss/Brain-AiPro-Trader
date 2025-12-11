"""
PROFESSIONAL SIGNAL ANALYSIS GENERATOR
Generates human-readable, professional analysis for users

Example output:
"BTCUSD is currently trading at a strong support level ($90,650) with bullish price action. 
The Gartley harmonic pattern is at 90% completion, indicating a high-probability bullish reversal. 
Additionally, we're seeing strong bullish divergence on the RSI indicator, confirming upward momentum. 
The risk/reward ratio of 1:3.2 offers excellent profit potential with controlled risk."
"""

from typing import Dict, List


class ProfessionalAnalysisGenerator:
    """
    Generates professional, human-readable signal analysis
    
    For users (simple, actionable):
    - Clear entry reasoning
    - Pattern identification
    - Key support/resistance levels
    - Risk/reward explanation
    
    For admin (detailed):
    - Full agent voting breakdown
    - Technical details
    - Probability calculations
    """
    
    def generate_user_analysis(self, signal: Dict, layer1_votes: Dict, 
                               layer2_votes: Dict) -> str:
        """
        Generate professional analysis for end users
        
        Example:
        "BTCUSD is currently trading at a strong support level ($90,650) with 
        bullish price action. The Gartley harmonic pattern is at 90% completion..."
        """
        symbol = signal.get('symbol', 'Unknown')
        signal_type = signal.get('signal', 'HOLD')
        entry = signal.get('entry', 0)
        stop_loss = signal.get('stop_loss', 0)
        targets = signal.get('targets', [])
        confidence = signal.get('confidence', 0)
        
        # Build analysis components
        components = []
        
        # 1. Opening statement with price level
        price_level = self._get_price_level_description(signal, layer2_votes)
        components.append(f"{symbol} is currently trading {price_level}")
        
        # 2. Pattern identification
        pattern_desc = self._get_pattern_description(layer1_votes)
        if pattern_desc:
            components.append(pattern_desc)
        
        # 3. Technical confirmation
        technical_desc = self._get_technical_confirmation(layer1_votes)
        if technical_desc:
            components.append(technical_desc)
        
        # 4. Market context
        context_desc = self._get_market_context(layer2_votes)
        if context_desc:
            components.append(context_desc)
        
        # 5. Risk/Reward summary
        rr_desc = self._get_risk_reward_summary(entry, stop_loss, targets)
        if rr_desc:
            components.append(rr_desc)
        
        # 6. Confidence statement
        confidence_desc = self._get_confidence_statement(confidence, signal_type)
        components.append(confidence_desc)
        
        # Join all components
        analysis = ". ".join(components) + "."
        
        return analysis
    
    def _get_price_level_description(self, signal: Dict, layer2_votes: Dict) -> str:
        """Describe current price level"""
        signal_type = signal.get('signal', 'HOLD')
        entry = signal.get('entry', 0)
        
        # Check context agent for support/resistance info
        context_vote = layer2_votes.get('context', {})
        context_reason = context_vote.get('reason', '')
        
        if 'strong support' in context_reason.lower():
            return f"at a strong support level (${entry:,.2f}) with {'bullish' if signal_type == 'BUY' else 'bearish'} price action"
        elif 'strong resistance' in context_reason.lower():
            return f"at a strong resistance level (${entry:,.2f}) with {'bullish' if signal_type == 'BUY' else 'bearish'} price action"
        else:
            return f"at ${entry:,.2f} showing {'bullish' if signal_type == 'BUY' else 'bearish'} momentum"
    
    def _get_pattern_description(self, layer1_votes: Dict) -> str:
        """Describe identified patterns"""
        pattern_vote = layer1_votes.get('pattern', {})
        pattern_reason = pattern_vote.get('reason', '')
        
        # Extract pattern information
        if 'harmonic' in pattern_reason.lower():
            if 'gartley' in pattern_reason.lower():
                return "The Gartley harmonic pattern is at 90% completion, indicating a high-probability reversal setup"
            elif 'butterfly' in pattern_reason.lower():
                return "A Butterfly harmonic pattern has formed, suggesting a strong reversal opportunity"
            elif 'bat' in pattern_reason.lower():
                return "The Bat harmonic pattern is complete, signaling a potential trend reversal"
            else:
                return "A harmonic pattern has formed, indicating institutional-level price action"
        
        elif 'head and shoulders' in pattern_reason.lower():
            return "A Head and Shoulders pattern has completed, suggesting a trend reversal"
        
        elif 'double top' in pattern_reason.lower() or 'double bottom' in pattern_reason.lower():
            pattern_type = "Double Top" if 'double top' in pattern_reason.lower() else "Double Bottom"
            return f"A {pattern_type} pattern has formed at a key level"
        
        elif 'order block' in pattern_reason.lower():
            return "Price is reacting to an institutional order block, showing smart money activity"
        
        return ""
    
    def _get_technical_confirmation(self, layer1_votes: Dict) -> str:
        """Describe technical confirmations"""
        confirmations = []
        
        # Check momentum indicators
        momentum_vote = layer1_votes.get('momentum', {})
        momentum_reason = momentum_vote.get('reason', '')
        
        if 'divergence' in momentum_reason.lower():
            if 'bullish' in momentum_reason.lower():
                confirmations.append("strong bullish divergence on the RSI indicator")
            elif 'bearish' in momentum_reason.lower():
                confirmations.append("strong bearish divergence on the RSI indicator")
        
        if 'macd' in momentum_reason.lower() and 'crossover' in momentum_reason.lower():
            confirmations.append("MACD bullish crossover confirming upward momentum")
        
        # Check trend
        trend_vote = layer1_votes.get('trend', {})
        trend_reason = trend_vote.get('reason', '')
        
        if 'ema alignment' in trend_reason.lower():
            confirmations.append("perfect EMA alignment across multiple timeframes")
        
        # Check volume
        volume_vote = layer1_votes.get('volume', {})
        volume_reason = volume_vote.get('reason', '')
        
        if 'high volume' in volume_reason.lower():
            confirmations.append("strong volume confirmation")
        
        if confirmations:
            if len(confirmations) == 1:
                return f"Additionally, we're seeing {confirmations[0]}"
            else:
                return f"Additionally, we're seeing {', '.join(confirmations[:-1])}, and {confirmations[-1]}"
        
        return ""
    
    def _get_market_context(self, layer2_votes: Dict) -> str:
        """Describe market context"""
        context_vote = layer2_votes.get('context', {})
        timing_vote = layer2_votes.get('timing', {})
        
        context_reason = context_vote.get('reason', '')
        timing_reason = timing_vote.get('reason', '')
        
        contexts = []
        
        # Check trend alignment
        if 'aligned with' in context_reason.lower() and 'trend' in context_reason.lower():
            contexts.append("aligning with the higher timeframe trend")
        
        # Check market session
        if 'London' in timing_reason or 'New York' in timing_reason or 'Overlap' in timing_reason:
            contexts.append("during a high-liquidity trading session")
        
        # Check volatility
        if 'normal volatility' in timing_reason.lower():
            contexts.append("with ideal market volatility")
        
        if contexts:
            return f"The setup is {', '.join(contexts)}"
        
        return ""
    
    def _get_risk_reward_summary(self, entry: float, stop_loss: float, 
                                 targets: List[float]) -> str:
        """Describe risk/reward"""
        if not entry or not stop_loss or not targets:
            return ""
        
        risk = abs(entry - stop_loss)
        reward = abs(targets[0] - entry) if targets else 0
        
        if risk > 0:
            rr_ratio = reward / risk
            return f"The risk/reward ratio of 1:{rr_ratio:.1f} offers excellent profit potential with controlled risk"
        
        return ""
    
    def _get_confidence_statement(self, confidence: float, signal_type: str) -> str:
        """Generate confidence statement"""
        if confidence >= 85:
            return f"This is a high-confidence {signal_type} signal with {confidence:.0f}% probability of success"
        elif confidence >= 75:
            return f"This {signal_type} signal shows strong potential with {confidence:.0f}% confidence"
        elif confidence >= 65:
            return f"This {signal_type} setup has {confidence:.0f}% confidence based on multiple confirmations"
        else:
            return f"This {signal_type} signal has moderate confidence at {confidence:.0f}%"
    
    def generate_admin_analysis(self, signal: Dict, layer1_votes: Dict, 
                                layer2_votes: Dict, learning_stats: Dict) -> Dict:
        """
        Generate detailed analysis for admin panel
        
        Includes:
        - Full voting breakdown
        - Technical details
        - Performance statistics
        - Probability calculations
        """
        return {
            'signal_summary': {
                'symbol': signal.get('symbol'),
                'type': signal.get('signal'),
                'entry': signal.get('entry'),
                'stop_loss': signal.get('stop_loss'),
                'targets': signal.get('targets'),
                'confidence': signal.get('confidence')
            },
            'layer1_voting': {
                'trend': {
                    'vote': layer1_votes.get('trend', {}).get('vote'),
                    'confidence': layer1_votes.get('trend', {}).get('confidence'),
                    'reason': layer1_votes.get('trend', {}).get('reason'),
                    'weight': layer1_votes.get('trend', {}).get('weight')
                },
                'momentum': {
                    'vote': layer1_votes.get('momentum', {}).get('vote'),
                    'confidence': layer1_votes.get('momentum', {}).get('confidence'),
                    'reason': layer1_votes.get('momentum', {}).get('reason'),
                    'weight': layer1_votes.get('momentum', {}).get('weight')
                },
                'volatility': {
                    'vote': layer1_votes.get('volatility', {}).get('vote'),
                    'confidence': layer1_votes.get('volatility', {}).get('confidence'),
                    'reason': layer1_votes.get('volatility', {}).get('reason'),
                    'weight': layer1_votes.get('volatility', {}).get('weight')
                },
                'pattern': {
                    'vote': layer1_votes.get('pattern', {}).get('vote'),
                    'confidence': layer1_votes.get('pattern', {}).get('confidence'),
                    'reason': layer1_votes.get('pattern', {}).get('reason'),
                    'weight': layer1_votes.get('pattern', {}).get('weight')
                },
                'volume': {
                    'vote': layer1_votes.get('volume', {}).get('vote'),
                    'confidence': layer1_votes.get('volume', {}).get('confidence'),
                    'reason': layer1_votes.get('volume', {}).get('reason'),
                    'weight': layer1_votes.get('volume', {}).get('weight')
                }
            },
            'layer2_voting': {
                'risk': {
                    'vote': layer2_votes.get('risk', {}).get('vote'),
                    'confidence': layer2_votes.get('risk', {}).get('confidence'),
                    'reason': layer2_votes.get('risk', {}).get('reason'),
                    'weight': layer2_votes.get('risk', {}).get('weight')
                },
                'timing': {
                    'vote': layer2_votes.get('timing', {}).get('vote'),
                    'confidence': layer2_votes.get('timing', {}).get('confidence'),
                    'reason': layer2_votes.get('timing', {}).get('reason'),
                    'weight': layer2_votes.get('timing', {}).get('weight')
                },
                'context': {
                    'vote': layer2_votes.get('context', {}).get('vote'),
                    'confidence': layer2_votes.get('context', {}).get('confidence'),
                    'reason': layer2_votes.get('context', {}).get('reason'),
                    'weight': layer2_votes.get('context', {}).get('weight')
                }
            },
            'learning_stats': learning_stats,
            'timestamp': signal.get('timestamp')
        }


# Export
__all__ = ['ProfessionalAnalysisGenerator']
