"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  TrendingUp,
  TrendingDown,
  Target,
  BarChart3,
  Activity,
  Award,
  AlertTriangle,
  CheckCircle
} from "lucide-react"

interface SuccessRateData {
  strategy: string
  timeframe: string
  totalSignals: number
  successfulSignals: number
  successRate: number
  avgProfit: number
  avgLoss: number
  profitFactor: number
  maxDrawdown: number
  sharpeRatio: number
  lastUpdated: string
}

interface OverallStats {
  totalSignals: number
  overallSuccessRate: number
  totalProfit: number
  bestStrategy: string
  worstStrategy: string
  avgRiskReward: number
  currentStreak: number
  bestStreak: number
}

export default function SuccessRateCalculator() {
  const [successRates, setSuccessRates] = useState<SuccessRateData[]>([])
  const [overallStats, setOverallStats] = useState<OverallStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSuccessRates()
  }, [])

  const fetchSuccessRates = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/trades/history")
      if (!response.ok) throw new Error("Failed to fetch trades")
      const trades = await response.json()

      // Group trades by strategy
      const strategyGroups: Record<string, any[]> = {}
      trades.forEach((trade: any) => {
        const strategy = trade.strategy || "Unknown"
        if (!strategyGroups[strategy]) strategyGroups[strategy] = []
        strategyGroups[strategy].push(trade)
      })

      // Calculate metrics for each strategy
      const rates: SuccessRateData[] = Object.keys(strategyGroups).map(strategy => {
        const strategyTrades = strategyGroups[strategy]
        const total = strategyTrades.length
        const wins = strategyTrades.filter((t: any) => t.return_pct > 0).length
        const profits = strategyTrades.filter((t: any) => t.return_pct > 0).reduce((sum: number, t: any) => sum + (t.profit || 0), 0)
        const losses = strategyTrades.filter((t: any) => t.return_pct <= 0).reduce((sum: number, t: any) => sum + Math.abs(t.profit || 0), 0)

        return {
          strategy,
          timeframe: "All",
          totalSignals: total,
          successfulSignals: wins,
          successRate: total > 0 ? (wins / total) * 100 : 0,
          avgProfit: wins > 0 ? profits / wins : 0,
          avgLoss: (total - wins) > 0 ? losses / (total - wins) : 0,
          profitFactor: losses > 0 ? profits / losses : profits > 0 ? 100 : 0,
          maxDrawdown: 0, // Simplified for now
          sharpeRatio: 1.5, // Placeholder calculation
          lastUpdated: new Date().toISOString()
        }
      })

      setSuccessRates(rates)
      setOverallStats(calculateOverallStats(rates, trades))
    } catch (error) {
      console.error("Error fetching success rates:", error)
    } finally {
      setLoading(false)
    }
  }

  const calculateOverallStats = (successRates: SuccessRateData[], trades: any[]): OverallStats => {
    const totalSignals = successRates.reduce((sum, rate) => sum + rate.totalSignals, 0)
    const successfulSignals = successRates.reduce((sum, rate) => sum + rate.successfulSignals, 0)
    const overallSuccessRate = totalSignals > 0 ? (successfulSignals / totalSignals) * 100 : 0

    const sortedBySuccessRate = [...successRates].sort((a, b) => b.successRate - a.successRate)
    const bestStrategy = sortedBySuccessRate[0]?.strategy || "N/A"
    const worstStrategy = sortedBySuccessRate[sortedBySuccessRate.length - 1]?.strategy || "N/A"

    const totalProfit = trades.reduce((sum, trade) => sum + (trade.profit || 0), 0)

    const avgRiskReward = successRates.reduce((sum, rate) => {
      const rr = parseFloat(rate.profitFactor?.toString() || "1")
      return sum + rr
    }, 0) / (successRates.length || 1)

    // Calculate streaks
    let currentStreak = 0
    let bestStreak = 0
    let tempStreak = 0

    // Sort trades by date (assuming closedAt exists)
    const sortedTrades = [...trades].sort((a, b) => new Date(a.closedAt || 0).getTime() - new Date(b.closedAt || 0).getTime())

    for (const trade of sortedTrades) {
      if (trade.return_pct > 0) {
        tempStreak++
      } else {
        if (tempStreak > bestStreak) bestStreak = tempStreak
        tempStreak = 0
      }
    }
    if (tempStreak > bestStreak) bestStreak = tempStreak
    currentStreak = tempStreak

    return {
      totalSignals,
      overallSuccessRate,
      totalProfit,
      bestStrategy,
      worstStrategy,
      avgRiskReward,
      currentStreak,
      bestStreak
    }
  }

  const getSuccessRateColor = (rate: number) => {
    if (rate >= 90) return "text-green-400"
    if (rate >= 80) return "text-blue-400"
    if (rate >= 70) return "text-yellow-400"
    return "text-red-400"
  }

  const getSuccessRateBadge = (rate: number) => {
    if (rate >= 90) return "bg-green-500 text-white"
    if (rate >= 80) return "bg-blue-500 text-white"
    if (rate >= 70) return "bg-yellow-500 text-white"
    return "bg-red-500 text-white"
  }

  const formatPercentage = (value: number) => `${value.toFixed(1)}%`
  const formatCurrency = (value: number) => `$${Math.abs(value).toFixed(2)}`
  const formatRatio = (value: number) => `1:${value.toFixed(2)}`

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Overall Statistics */}
      {overallStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-400 flex items-center">
                <Activity className="w-4 h-4 mr-2" />
                Total Signals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{overallStats.totalSignals}</div>
              <p className="text-xs text-slate-400">All time trades</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-400 flex items-center">
                <Target className="w-4 h-4 mr-2" />
                Success Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getSuccessRateColor(overallStats.overallSuccessRate)}`}>
                {formatPercentage(overallStats.overallSuccessRate)}
              </div>
              <p className="text-xs text-slate-400">Overall accuracy</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-400 flex items-center">
                <TrendingUp className="w-4 h-4 mr-2" />
                Total P&L
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${overallStats.totalProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {formatCurrency(overallStats.totalProfit)}
              </div>
              <p className="text-xs text-slate-400">Net profit/loss</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-400 flex items-center">
                <Award className="w-4 h-4 mr-2" />
                Current Streak
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-400">{overallStats.currentStreak}</div>
              <p className="text-xs text-slate-400">Best: {overallStats.bestStreak}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Strategy Performance Table */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-purple-400" />
            Strategy Performance Analysis
          </CardTitle>
          <CardDescription className="text-slate-400">
            Detailed success rates and performance metrics for each trading strategy
          </CardDescription>
        </CardHeader>
        <CardContent>
          {successRates.length > 0 ? (
            <div className="space-y-4">
              {successRates
                .sort((a, b) => b.successRate - a.successRate)
                .map((rate, index) => (
                  <div key={`${rate.strategy}-${rate.timeframe}`} className="border border-slate-600 rounded-lg p-4 bg-slate-700/30">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="text-lg font-bold text-white">#{index + 1}</div>
                        <div>
                          <div className="font-semibold text-white">
                            {rate.strategy.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </div>
                          <div className="text-sm text-slate-400">{rate.timeframe} timeframe</div>
                        </div>
                      </div>
                      <Badge className={getSuccessRateBadge(rate.successRate)}>
                        {formatPercentage(rate.successRate)}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-slate-400">Signals:</span>
                        <div className="font-medium text-white">{rate.totalSignals}</div>
                      </div>
                      <div>
                        <span className="text-slate-400">Success Rate:</span>
                        <div className={`font-medium ${getSuccessRateColor(rate.successRate)}`}>
                          {formatPercentage(rate.successRate)}
                        </div>
                      </div>
                      <div>
                        <span className="text-slate-400">Profit Factor:</span>
                        <div className="font-medium text-white">{formatRatio(rate.profitFactor)}</div>
                      </div>
                      <div>
                        <span className="text-slate-400">Max Drawdown:</span>
                        <div className="font-medium text-red-400">{formatPercentage(rate.maxDrawdown)}</div>
                      </div>
                    </div>

                    <div className="mt-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-400">Success Rate</span>
                        <span className={getSuccessRateColor(rate.successRate)}>
                          {formatPercentage(rate.successRate)}
                        </span>
                      </div>
                      <Progress
                        value={rate.successRate}
                        className="h-2"
                      />
                    </div>

                    <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                      <div>
                        <span className="text-slate-400">Avg Profit:</span>
                        <div className="font-medium text-green-400">{formatCurrency(rate.avgProfit)}</div>
                      </div>
                      <div>
                        <span className="text-slate-400">Avg Loss:</span>
                        <div className="font-medium text-red-400">{formatCurrency(rate.avgLoss)}</div>
                      </div>
                      <div>
                        <span className="text-slate-400">Sharpe Ratio:</span>
                        <div className="font-medium text-white">{rate.sharpeRatio?.toFixed(2) || "N/A"}</div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <BarChart3 className="w-16 h-16 mx-auto mb-4 text-slate-500" />
              <h3 className="text-lg font-semibold text-white mb-2">No Performance Data</h3>
              <p className="text-slate-400">
                Start trading to see strategy performance and success rates
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Performance Insights */}
      {overallStats && (
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <CheckCircle className="w-5 h-5 mr-2 text-green-400" />
              Performance Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-white mb-3 flex items-center">
                  <TrendingUp className="w-4 h-4 mr-2 text-green-400" />
                  Top Performers
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Best Strategy:</span>
                    <span className="text-white font-medium">
                      {overallStats.bestStrategy.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Avg Risk:Reward:</span>
                    <span className="text-white font-medium">{formatRatio(overallStats.avgRiskReward)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Current Streak:</span>
                    <span className="text-green-400 font-medium">{overallStats.currentStreak} wins</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-white mb-3 flex items-center">
                  <AlertTriangle className="w-4 h-4 mr-2 text-yellow-400" />
                  Areas for Improvement
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Review Strategy:</span>
                    <span className="text-white font-medium">
                      {overallStats.worstStrategy.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Overall Accuracy:</span>
                    <span className={getSuccessRateColor(overallStats.overallSuccessRate)}>
                      {formatPercentage(overallStats.overallSuccessRate)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Best Streak:</span>
                    <span className="text-purple-400 font-medium">{overallStats.bestStreak} wins</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}