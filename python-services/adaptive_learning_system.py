"""
ADAPTIVE LEARNING SYSTEM
Machine Learning-Based Weight Optimization

This system learns from historical performance and automatically
adjusts agent weights to maximize signal accuracy.

Features:
- Tracks performance of each agent combination
- Identifies which agents are most accurate
- Automatically adjusts weights based on results
- Continuous improvement over time
"""

import json
import numpy as np
from typing import Dict, List, Tuple
from datetime import datetime, timedelta
from pathlib import Path
import pandas as pd


class AdaptiveLearningEngine:
    """
    ML-Based Adaptive Learning System
    
    Learns from:
    - Historical signal performance
    - Agent voting patterns
    - Market conditions
    - Win/loss outcomes
    
    Optimizes:
    - Agent weights
    - Confidence thresholds
    - Strategy combinations
    """
    
    def __init__(self, data_dir: str = "./data/learning"):
        self.data_dir = Path(data_dir)
        self.data_dir.mkdir(parents=True, exist_ok=True)
        
        # Performance tracking
        self.performance_db = self.data_dir / "performance.json"
        self.weights_db = self.data_dir / "optimized_weights.json"
        
        # Load existing data
        self.performance_history = self._load_performance_history()
        self.current_weights = self._load_current_weights()
        
        # Learning parameters
        self.learning_rate = 0.05  # How fast to adapt (5%)
        self.min_samples = 50  # Minimum trades before adjusting
        self.lookback_days = 30  # Consider last 30 days
        
        print("✅ Adaptive Learning Engine initialized")
        print(f"   Performance records: {len(self.performance_history)}")
        print(f"   Learning rate: {self.learning_rate*100}%")
        print(f"   Min samples: {self.min_samples}")
    
    def _load_performance_history(self) -> List[Dict]:
        """Load historical performance data"""
        if self.performance_db.exists():
            with open(self.performance_db, 'r') as f:
                return json.load(f)
        return []
    
    def _load_current_weights(self) -> Dict:
        """Load current optimized weights"""
        if self.weights_db.exists():
            with open(self.weights_db, 'r') as f:
                return json.load(f)
        
        # Default weights
        return {
            'layer1': {
                'trend': 0.30,
                'momentum': 0.25,
                'volatility': 0.20,
                'pattern': 0.15,
                'volume': 0.10
            },
            'layer2': {
                'risk': 0.25,
                'timing': 0.35,
                'context': 0.40
            }
        }
    
    def record_signal_outcome(self, signal_id: str, signal_data: Dict, 
                             outcome: str, profit_pips: float):
        """
        Record the outcome of a signal
        
        Args:
            signal_id: Unique signal identifier
            signal_data: Original signal with agent votes
            outcome: 'WIN', 'LOSS', or 'BREAKEVEN'
            profit_pips: Profit/loss in pips
        """
        record = {
            'signal_id': signal_id,
            'timestamp': datetime.now().isoformat(),
            'symbol': signal_data.get('symbol'),
            'signal_type': signal_data.get('signal'),
            'outcome': outcome,
            'profit_pips': profit_pips,
            'layer1_votes': signal_data.get('layer1_votes', {}),
            'layer2_votes': signal_data.get('layer2_votes', {}),
            'confidence': signal_data.get('confidence', 0)
        }
        
        self.performance_history.append(record)
        
        # Save to disk
        with open(self.performance_db, 'w') as f:
            json.dump(self.performance_history, f, indent=2)
        
        print(f"✅ Recorded outcome: {outcome} ({profit_pips:+.1f} pips)")
        
        # Check if we should optimize weights
        if len(self.performance_history) % 10 == 0:  # Every 10 trades
            self.optimize_weights()
    
    def optimize_weights(self):
        """
        Optimize agent weights based on historical performance
        
        Uses gradient descent to find optimal weights that
        maximize win rate and profit factor.
        """
        print(f"\n{'='*80}")
        print(f"🧠 ADAPTIVE LEARNING: Optimizing Weights")
        print(f"{'='*80}")
        
        # Filter recent performance
        recent_records = self._get_recent_records()
        
        if len(recent_records) < self.min_samples:
            print(f"⚠️  Insufficient data ({len(recent_records)}/{self.min_samples})")
            print(f"   Need {self.min_samples - len(recent_records)} more trades")
            return
        
        print(f"📊 Analyzing {len(recent_records)} recent trades...")
        
        # Analyze Layer 1 (Technical Agents)
        layer1_performance = self._analyze_layer1_performance(recent_records)
        new_layer1_weights = self._optimize_layer1_weights(layer1_performance)
        
        # Analyze Layer 2 (Meta Agents)
        layer2_performance = self._analyze_layer2_performance(recent_records)
        new_layer2_weights = self._optimize_layer2_weights(layer2_performance)
        
        # Update weights
        old_weights = self.current_weights.copy()
        self.current_weights['layer1'] = new_layer1_weights
        self.current_weights['layer2'] = new_layer2_weights
        
        # Save optimized weights
        with open(self.weights_db, 'w') as f:
            json.dump(self.current_weights, f, indent=2)
        
        # Show changes
        print(f"\n📈 WEIGHT OPTIMIZATION COMPLETE:")
        print(f"\n   Layer 1 (Technical Agents):")
        for agent, weight in new_layer1_weights.items():
            old_weight = old_weights['layer1'].get(agent, 0)
            change = weight - old_weight
            arrow = "↑" if change > 0 else "↓" if change < 0 else "→"
            print(f"      {agent.capitalize()}: {old_weight:.3f} {arrow} {weight:.3f} ({change:+.3f})")
        
        print(f"\n   Layer 2 (Meta Agents):")
        for agent, weight in new_layer2_weights.items():
            old_weight = old_weights['layer2'].get(agent, 0)
            change = weight - old_weight
            arrow = "↑" if change > 0 else "↓" if change < 0 else "→"
            print(f"      {agent.capitalize()}: {old_weight:.3f} {arrow} {weight:.3f} ({change:+.3f})")
        
        print(f"\n{'='*80}\n")
    
    def _get_recent_records(self) -> List[Dict]:
        """Get records from last N days"""
        cutoff_date = datetime.now() - timedelta(days=self.lookback_days)
        
        recent = []
        for record in self.performance_history:
            record_date = datetime.fromisoformat(record['timestamp'])
            if record_date >= cutoff_date:
                recent.append(record)
        
        return recent
    
    def _analyze_layer1_performance(self, records: List[Dict]) -> Dict:
        """
        Analyze which Layer 1 agents are most accurate
        
        Returns:
            {
                'trend': {'win_rate': 0.75, 'avg_profit': 25.5},
                'momentum': {'win_rate': 0.68, 'avg_profit': 18.2},
                ...
            }
        """
        agent_stats = {
            'trend': {'wins': 0, 'losses': 0, 'total_profit': 0},
            'momentum': {'wins': 0, 'losses': 0, 'total_profit': 0},
            'volatility': {'wins': 0, 'losses': 0, 'total_profit': 0},
            'pattern': {'wins': 0, 'losses': 0, 'total_profit': 0},
            'volume': {'wins': 0, 'losses': 0, 'total_profit': 0}
        }
        
        for record in records:
            outcome = record['outcome']
            profit = record['profit_pips']
            layer1_votes = record.get('layer1_votes', {})
            
            # For each agent that voted for this signal
            for agent, vote_data in layer1_votes.items():
                if vote_data.get('vote') == record['signal_type']:
                    if outcome == 'WIN':
                        agent_stats[agent]['wins'] += 1
                        agent_stats[agent]['total_profit'] += profit
                    elif outcome == 'LOSS':
                        agent_stats[agent]['losses'] += 1
                        agent_stats[agent]['total_profit'] += profit
        
        # Calculate performance metrics
        performance = {}
        for agent, stats in agent_stats.items():
            total_trades = stats['wins'] + stats['losses']
            if total_trades > 0:
                win_rate = stats['wins'] / total_trades
                avg_profit = stats['total_profit'] / total_trades
                performance[agent] = {
                    'win_rate': win_rate,
                    'avg_profit': avg_profit,
                    'total_trades': total_trades
                }
            else:
                performance[agent] = {
                    'win_rate': 0.5,
                    'avg_profit': 0,
                    'total_trades': 0
                }
        
        return performance
    
    def _optimize_layer1_weights(self, performance: Dict) -> Dict:
        """
        Optimize Layer 1 weights based on performance
        
        Uses performance-weighted allocation:
        - Higher win rate = higher weight
        - Higher avg profit = higher weight
        """
        # Calculate performance scores
        scores = {}
        for agent, perf in performance.items():
            # Score = (win_rate * 0.6) + (normalized_profit * 0.4)
            win_rate_score = perf['win_rate']
            
            # Normalize profit (assume max profit is 50 pips)
            profit_score = min(1.0, max(0, perf['avg_profit'] / 50))
            
            scores[agent] = (win_rate_score * 0.6) + (profit_score * 0.4)
        
        # Normalize scores to sum to 1.0
        total_score = sum(scores.values())
        if total_score > 0:
            new_weights = {agent: score / total_score for agent, score in scores.items()}
        else:
            # Fallback to equal weights
            new_weights = {agent: 0.20 for agent in scores.keys()}
        
        # Apply learning rate (gradual adjustment)
        current_weights = self.current_weights['layer1']
        adjusted_weights = {}
        for agent in new_weights.keys():
            current = current_weights.get(agent, 0.20)
            target = new_weights[agent]
            adjusted = current + (target - current) * self.learning_rate
            adjusted_weights[agent] = adjusted
        
        # Ensure weights sum to 1.0
        total = sum(adjusted_weights.values())
        adjusted_weights = {k: v/total for k, v in adjusted_weights.items()}
        
        return adjusted_weights
    
    def _analyze_layer2_performance(self, records: List[Dict]) -> Dict:
        """Analyze Layer 2 meta-agent performance"""
        agent_stats = {
            'risk': {'wins': 0, 'losses': 0, 'total_profit': 0},
            'timing': {'wins': 0, 'losses': 0, 'total_profit': 0},
            'context': {'wins': 0, 'losses': 0, 'total_profit': 0}
        }
        
        for record in records:
            outcome = record['outcome']
            profit = record['profit_pips']
            layer2_votes = record.get('layer2_votes', {})
            
            for agent, vote_data in layer2_votes.items():
                if vote_data.get('vote') == 'APPROVE':
                    if outcome == 'WIN':
                        agent_stats[agent]['wins'] += 1
                        agent_stats[agent]['total_profit'] += profit
                    elif outcome == 'LOSS':
                        agent_stats[agent]['losses'] += 1
                        agent_stats[agent]['total_profit'] += profit
        
        # Calculate performance metrics
        performance = {}
        for agent, stats in agent_stats.items():
            total_trades = stats['wins'] + stats['losses']
            if total_trades > 0:
                win_rate = stats['wins'] / total_trades
                avg_profit = stats['total_profit'] / total_trades
                performance[agent] = {
                    'win_rate': win_rate,
                    'avg_profit': avg_profit,
                    'total_trades': total_trades
                }
            else:
                performance[agent] = {
                    'win_rate': 0.5,
                    'avg_profit': 0,
                    'total_trades': 0
                }
        
        return performance
    
    def _optimize_layer2_weights(self, performance: Dict) -> Dict:
        """Optimize Layer 2 weights"""
        # Same logic as Layer 1
        scores = {}
        for agent, perf in performance.items():
            win_rate_score = perf['win_rate']
            profit_score = min(1.0, max(0, perf['avg_profit'] / 50))
            scores[agent] = (win_rate_score * 0.6) + (profit_score * 0.4)
        
        total_score = sum(scores.values())
        if total_score > 0:
            new_weights = {agent: score / total_score for agent, score in scores.items()}
        else:
            new_weights = {agent: 0.33 for agent in scores.keys()}
        
        # Apply learning rate
        current_weights = self.current_weights['layer2']
        adjusted_weights = {}
        for agent in new_weights.keys():
            current = current_weights.get(agent, 0.33)
            target = new_weights[agent]
            adjusted = current + (target - current) * self.learning_rate
            adjusted_weights[agent] = adjusted
        
        # Normalize
        total = sum(adjusted_weights.values())
        adjusted_weights = {k: v/total for k, v in adjusted_weights.items()}
        
        return adjusted_weights
    
    def get_current_weights(self) -> Dict:
        """Get current optimized weights"""
        return self.current_weights
    
    def get_performance_stats(self) -> Dict:
        """Get overall performance statistics"""
        recent_records = self._get_recent_records()
        
        if not recent_records:
            return {
                'total_trades': 0,
                'win_rate': 0,
                'avg_profit': 0,
                'profit_factor': 0
            }
        
        wins = sum(1 for r in recent_records if r['outcome'] == 'WIN')
        losses = sum(1 for r in recent_records if r['outcome'] == 'LOSS')
        total_profit = sum(r['profit_pips'] for r in recent_records)
        
        gross_profit = sum(r['profit_pips'] for r in recent_records if r['outcome'] == 'WIN')
        gross_loss = abs(sum(r['profit_pips'] for r in recent_records if r['outcome'] == 'LOSS'))
        
        win_rate = wins / len(recent_records) if recent_records else 0
        avg_profit = total_profit / len(recent_records) if recent_records else 0
        profit_factor = gross_profit / gross_loss if gross_loss > 0 else 0
        
        return {
            'total_trades': len(recent_records),
            'wins': wins,
            'losses': losses,
            'win_rate': win_rate,
            'avg_profit': avg_profit,
            'profit_factor': profit_factor,
            'total_profit': total_profit
        }


# Export
__all__ = ['AdaptiveLearningEngine']
