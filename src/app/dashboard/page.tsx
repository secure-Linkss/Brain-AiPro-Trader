"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { TrendingUp, TrendingDown, Activity, DollarSign, Target, AlertTriangle, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react'

export default function DashboardPage() {
  const [expandedTrade, setExpandedTrade] = useState<number | null>(null)
  const [selectedTimeframe, setSelectedTimeframe] = useState('1H')
  const [stats, setStats] = useState({
    totalProfit: 0,
    winRate: 0,
    activeTrades: 0,
    todaySignals: 0
  })

  useEffect(() => {
    // Fetch real stats from API
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    // Real API call
    try {
      const response = await fetch('/api/dashboard/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      // Fallback to demo data
      setStats({
        totalProfit: 12847.50,
        winRate: 76.8,
        activeTrades: 3,
        todaySignals: 12
      })
    }
  }

  const recentSignals = [
    {
      id: 1,
      pair: 'EUR/USD',
      type: 'BUY',
      entry: 1.0875,
      stopLoss: 1.0825,
      takeProfit: 1.0975,
      confidence: 85,
      pattern: 'Gartley Bullish',
      timeframe: '1H',
      timestamp: '2 minutes ago',
      status: 'active',
      pnl: null,
      details: {
        rsi: 42,
        macd: 'Bullish Crossover',
        volume: 'Above Average',
        support: 1.0850,
        resistance: 1.0950,
        fibLevels: ['0.382: 1.0860', '0.618: 1.0920', '1.0: 1.0975']
      }
    },
    {
      id: 2,
      pair: 'BTC/USD',
      type: 'SELL',
      entry: 42150,
      stopLoss: 42650,
      takeProfit: 41150,
      confidence: 78,
      pattern: 'Head & Shoulders',
      timeframe: '4H',
      timestamp: '15 minutes ago',
      status: 'active',
      pnl: null,
      details: {
        rsi: 68,
        macd: 'Bearish Divergence',
        volume: 'Declining',
        support: 41500,
        resistance: 42500,
        fibLevels: ['0.382: 42000', '0.618: 41600', '1.0: 41150']
      }
    },
    {
      id: 3,
      pair: 'GBP/JPY',
      type: 'BUY',
      entry: 185.45,
      stopLoss: 184.95,
      takeProfit: 186.95,
      confidence: 92,
      pattern: 'Butterfly Bullish',
      timeframe: '1H',
      timestamp: '1 hour ago',
      status: 'closed',
      pnl: 450.00,
      details: {
        rsi: 35,
        macd: 'Strong Bullish',
        volume: 'High',
        support: 185.20,
        resistance: 186.80,
        fibLevels: ['0.382: 185.60', '0.618: 186.20', '1.0: 186.95']
      }
    },
    {
      id: 4,
      pair: 'GOLD',
      type: 'BUY',
      entry: 2045.50,
      stopLoss: 2035.00,
      takeProfit: 2065.00,
      confidence: 81,
      pattern: 'Double Bottom',
      timeframe: '1D',
      timestamp: '3 hours ago',
      status: 'active',
      pnl: null,
      details: {
        rsi: 48,
        macd: 'Neutral to Bullish',
        volume: 'Average',
        support: 2040.00,
        resistance: 2060.00,
        fibLevels: ['0.382: 2050.00', '0.618: 2057.50', '1.0: 2065.00']
      }
    }
  ]

  const statCards = [
    {
      title: 'Total Profit',
      value: `$${stats.totalProfit.toLocaleString()}`,
      change: '+12.5%',
      positive: true,
      icon: DollarSign
    },
    {
      title: 'Win Rate',
      value: `${stats.winRate}%`,
      change: '+2.3%',
      positive: true,
      icon: Target
    },
    {
      title: 'Active Trades',
      value: stats.activeTrades,
      change: '3 running',
      positive: true,
      icon: Activity
    },
    {
      title: 'Today Signals',
      value: stats.todaySignals,
      change: '8 profitable',
      positive: true,
      icon: TrendingUp
    }
  ]

  return (
    <div className="min-h-screen bg-primary-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Trading Dashboard</h1>
          <p className="text-gray-400">Real-time signals and market analysis</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <div key={index} className="bg-primary-800/60 border border-white/10 rounded-xl p-6 hover:border-blue-500/50 transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${stat.positive ? 'bg-green-500/20' : 'bg-red-500/20'
                  }`}>
                  <stat.icon className={stat.positive ? 'text-green-500' : 'text-red-500'} size={24} />
                </div>
                <span className={`text-sm font-medium ${stat.positive ? 'text-green-400' : 'text-red-400'
                  }`}>
                  {stat.change}
                </span>
              </div>
              <p className="text-gray-400 text-sm mb-1">{stat.title}</p>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Timeframe Selector */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
          {['1M', '5M', '15M', '30M', '1H', '4H', '1D', '1W'].map((tf) => (
            <button
              key={tf}
              onClick={() => setSelectedTimeframe(tf)}
              className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${selectedTimeframe === tf
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                  : 'bg-primary-800/60 text-gray-400 hover:text-white border border-white/10'
                }`}
            >
              {tf}
            </button>
          ))}
        </div>

        {/* Recent Signals */}
        <div className="bg-primary-800/60 border border-white/10 rounded-xl overflow-hidden">
          <div className="p-6 border-b border-white/10">
            <h2 className="text-xl font-bold text-white">Recent Signals</h2>
            <p className="text-gray-400 text-sm mt-1">Click any signal to see detailed analysis</p>
          </div>

          <div className="divide-y divide-white/10">
            {recentSignals.map((signal) => (
              <div key={signal.id} className="transition-all">
                {/* Signal Header - Clickable */}
                <button
                  onClick={() => setExpandedTrade(expandedTrade === signal.id ? null : signal.id)}
                  className="w-full p-6 hover:bg-white/5 transition-colors text-left"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1">
                      {/* Pair */}
                      <div className="min-w-[100px]">
                        <p className="font-bold text-white">{signal.pair}</p>
                        <p className="text-xs text-gray-500">{signal.timeframe}</p>
                      </div>

                      {/* Type Badge */}
                      <div className={`px-3 py-1 rounded-lg text-sm font-semibold ${signal.type === 'BUY'
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-red-500/20 text-red-400'
                        }`}>
                        {signal.type}
                      </div>

                      {/* Entry */}
                      <div className="hidden md:block">
                        <p className="text-xs text-gray-500">Entry</p>
                        <p className="text-white font-medium">{signal.entry}</p>
                      </div>

                      {/* Pattern */}
                      <div className="hidden lg:block flex-1">
                        <p className="text-xs text-gray-500">Pattern</p>
                        <p className="text-white text-sm">{signal.pattern}</p>
                      </div>

                      {/* Confidence */}
                      <div className="hidden md:block">
                        <p className="text-xs text-gray-500">Confidence</p>
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-white/10 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-blue-500 to-purple-600"
                              style={{ width: `${signal.confidence}%` }}
                            />
                          </div>
                          <span className="text-white text-sm font-medium">{signal.confidence}%</span>
                        </div>
                      </div>

                      {/* Status/PnL */}
                      <div className="min-w-[100px] text-right">
                        {signal.status === 'active' ? (
                          <span className="inline-flex items-center gap-1 text-blue-400 text-sm">
                            <Activity size={14} className="animate-pulse" />
                            Active
                          </span>
                        ) : (
                          <div>
                            <p className="text-xs text-gray-500">P&L</p>
                            <p className={`font-bold ${signal.pnl && signal.pnl > 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {signal.pnl && signal.pnl > 0 ? '+' : ''}${signal.pnl?.toFixed(2)}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Expand Icon */}
                      <div>
                        {expandedTrade === signal.id ? (
                          <ChevronUp className="text-gray-400" size={20} />
                        ) : (
                          <ChevronDown className="text-gray-400" size={20} />
                        )}
                      </div>
                    </div>
                  </div>
                </button>

                {/* Expanded Details */}
                {expandedTrade === signal.id && (
                  <div className="px-6 pb-6 bg-primary-900/50 animate-fadeIn">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
                      {/* Trade Levels */}
                      <div className="space-y-3">
                        <h3 className="text-sm font-semibold text-white mb-3">Trade Levels</h3>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center p-2 bg-white/5 rounded">
                            <span className="text-gray-400 text-sm">Entry Price</span>
                            <span className="text-white font-medium">{signal.entry}</span>
                          </div>
                          <div className="flex justify-between items-center p-2 bg-red-500/10 rounded">
                            <span className="text-gray-400 text-sm">Stop Loss</span>
                            <span className="text-red-400 font-medium">{signal.stopLoss}</span>
                          </div>
                          <div className="flex justify-between items-center p-2 bg-green-500/10 rounded">
                            <span className="text-gray-400 text-sm">Take Profit</span>
                            <span className="text-green-400 font-medium">{signal.takeProfit}</span>
                          </div>
                        </div>
                      </div>

                      {/* Technical Indicators */}
                      <div className="space-y-3">
                        <h3 className="text-sm font-semibold text-white mb-3">Technical Analysis</h3>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center p-2 bg-white/5 rounded">
                            <span className="text-gray-400 text-sm">RSI</span>
                            <span className="text-white font-medium">{signal.details.rsi}</span>
                          </div>
                          <div className="flex justify-between items-center p-2 bg-white/5 rounded">
                            <span className="text-gray-400 text-sm">MACD</span>
                            <span className="text-white text-sm">{signal.details.macd}</span>
                          </div>
                          <div className="flex justify-between items-center p-2 bg-white/5 rounded">
                            <span className="text-gray-400 text-sm">Volume</span>
                            <span className="text-white text-sm">{signal.details.volume}</span>
                          </div>
                        </div>
                      </div>

                      {/* Support/Resistance */}
                      <div className="space-y-3">
                        <h3 className="text-sm font-semibold text-white mb-3">Key Levels</h3>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center p-2 bg-white/5 rounded">
                            <span className="text-gray-400 text-sm">Support</span>
                            <span className="text-green-400 font-medium">{signal.details.support}</span>
                          </div>
                          <div className="flex justify-between items-center p-2 bg-white/5 rounded">
                            <span className="text-gray-400 text-sm">Resistance</span>
                            <span className="text-red-400 font-medium">{signal.details.resistance}</span>
                          </div>
                        </div>
                        <div className="mt-3">
                          <p className="text-xs text-gray-500 mb-2">Fibonacci Levels:</p>
                          <div className="space-y-1">
                            {signal.details.fibLevels.map((level, i) => (
                              <p key={i} className="text-xs text-gray-400">{level}</p>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 mt-6">
                      <button className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-blue-500/50 transition-all">
                        Copy Trade
                      </button>
                      <button className="px-4 py-2 bg-white/5 border border-white/10 text-white rounded-lg hover:bg-white/10 transition-colors flex items-center gap-2">
                        View Chart
                        <ExternalLink size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mt-8">
          <Link href="/market-overview" className="p-6 bg-primary-800/60 border border-white/10 rounded-xl hover:border-blue-500/50 transition-all group">
            <Activity className="text-blue-500 mb-4" size={32} />
            <h3 className="text-lg font-semibold text-white mb-2">Market Overview</h3>
            <p className="text-gray-400 text-sm">Real-time market analysis across all assets</p>
          </Link>
          <Link href="/risk-management" className="p-6 bg-primary-800/60 border border-white/10 rounded-xl hover:border-blue-500/50 transition-all group">
            <AlertTriangle className="text-yellow-500 mb-4" size={32} />
            <h3 className="text-lg font-semibold text-white mb-2">Risk Management</h3>
            <p className="text-gray-400 text-sm">Position sizing and risk calculator</p>
          </Link>
          <Link href="/settings" className="p-6 bg-primary-800/60 border border-white/10 rounded-xl hover:border-blue-500/50 transition-all group">
            <Target className="text-purple-500 mb-4" size={32} />
            <h3 className="text-lg font-semibold text-white mb-2">Settings</h3>
            <p className="text-gray-400 text-sm">Customize your trading preferences</p>
          </Link>
        </div>
      </div>
    </div>
  )
}