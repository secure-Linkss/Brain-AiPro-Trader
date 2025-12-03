"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Brain, Activity, Target, BarChart3, Shield, TrendingUp, Eye } from "lucide-react"

interface Strategy {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  color: string
}

interface AnalysisResult {
  signal: string
  confidence: number
  entryPrice?: number
  stopLoss?: number
  takeProfit?: number
  reason: string
  keyLevels?: {
    support: number[]
    resistance: number[]
  }
  riskReward?: string
}

const STRATEGIES: Strategy[] = [
  {
    id: "price_action",
    name: "Price Action Analysis",
    description: "Analyzes candlestick patterns, price movements, and market momentum",
    icon: <Activity className="w-5 h-5" />,
    color: "bg-blue-500"
  },
  {
    id: "chart_patterns",
    name: "Chart Pattern Recognition",
    description: "Identifies head & shoulders, triangles, flags, and other technical patterns",
    icon: <BarChart3 className="w-5 h-5" />,
    color: "bg-green-500"
  },
  {
    id: "harmonics",
    name: "Harmonic Pattern Analysis",
    description: "Detects Gartley, Butterfly, Crab patterns with Fibonacci ratios",
    icon: <Target className="w-5 h-5" />,
    color: "bg-purple-500"
  },
  {
    id: "support_resistance",
    name: "Support & Resistance Levels",
    description: "Identifies key price levels and historical support/resistance zones",
    icon: <Shield className="w-5 h-5" />,
    color: "bg-red-500"
  },
  {
    id: "supply_demand",
    name: "Supply & Demand Zones",
    description: "Finds institutional buying and selling zones",
    icon: <TrendingUp className="w-5 h-5" />,
    color: "bg-yellow-500"
  },
  {
    id: "elliot_wave",
    name: "Elliott Wave Analysis",
    description: "Performs wave counting and cycle analysis",
    icon: <Brain className="w-5 h-5" />,
    color: "bg-pink-500"
  },
  {
    id: "break_of_structure",
    name: "Break of Structure",
    description: "Identifies market structure breaks and trend changes",
    icon: <Eye className="w-5 h-5" />,
    color: "bg-indigo-500"
  },
  {
    id: "range_analysis",
    name: "Range Analysis",
    description: "Analyzes ranging markets and breakout potential",
    icon: <BarChart3 className="w-5 h-5" />,
    color: "bg-orange-500"
  }
]

interface TradingStrategiesProps {
  symbol: string
}

export default function TradingStrategies({ symbol }: TradingStrategiesProps) {
  const [selectedStrategy, setSelectedStrategy] = useState<string>("")
  const [timeframe, setTimeframe] = useState("1h")
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<AnalysisResult[]>([])
  const [error, setError] = useState("")

  const runAnalysis = async (strategyId: string) => {
    setLoading(true)
    setError("")
    
    try {
      const response = await fetch("/api/analysis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          symbol,
          strategy: strategyId,
          timeframe
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Analysis failed")
      }

      setResults(prev => [data.analysis.result, ...prev.slice(0, 4)]) // Keep last 5 results
      
    } catch (error: any) {
      setError(error.message || "Failed to run analysis")
    } finally {
      setLoading(false)
    }
  }

  const runAllStrategies = async () => {
    setLoading(true)
    setError("")
    
    try {
      const response = await fetch("/api/signals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          symbol,
          timeframe
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Analysis failed")
      }

      if (data.signal) {
        setResults(prev => [data.signal, ...prev.slice(0, 4)])
      }
      
    } catch (error: any) {
      setError(error.message || "Failed to run comprehensive analysis")
    } finally {
      setLoading(false)
    }
  }

  const getSignalColor = (signal: string) => {
    switch (signal) {
      case "BUY": return "bg-green-500"
      case "SELL": return "bg-red-500"
      default: return "bg-gray-500"
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return "text-green-400"
    if (confidence >= 60) return "text-yellow-400"
    return "text-red-400"
  }

  return (
    <div className="space-y-6">
      {/* Strategy Selection */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Brain className="w-5 h-5 mr-2 text-purple-400" />
            AI Trading Strategies
          </CardTitle>
          <CardDescription className="text-slate-400">
            Select a strategy to analyze {symbol} or run comprehensive analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <Select value={timeframe} onValueChange={setTimeframe}>
              <SelectTrigger className="w-full sm:w-32 bg-slate-700 border-slate-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-700 border-slate-600">
                <SelectItem value="1m">1m</SelectItem>
                <SelectItem value="5m">5m</SelectItem>
                <SelectItem value="15m">15m</SelectItem>
                <SelectItem value="1h">1h</SelectItem>
                <SelectItem value="4h">4h</SelectItem>
                <SelectItem value="1d">1d</SelectItem>
              </SelectContent>
            </Select>
            
            <Button
              onClick={runAllStrategies}
              disabled={loading}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Running Analysis...
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4 mr-2" />
                  Run All Strategies
                </>
              )}
            </Button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300">
              {error}
            </div>
          )}

          {/* Strategy Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {STRATEGIES.map((strategy) => (
              <Card 
                key={strategy.id} 
                className="bg-slate-700/50 border-slate-600 hover:bg-slate-700/70 transition-colors cursor-pointer"
                onClick={() => runAnalysis(strategy.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 ${strategy.color} rounded-lg flex items-center justify-center`}>
                      {strategy.icon}
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-sm text-white">{strategy.name}</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-slate-400">{strategy.description}</p>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="mt-3 w-full border-slate-500 text-white hover:bg-slate-600"
                    disabled={loading}
                  >
                    {loading ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      "Run Analysis"
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {results.length > 0 && (
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Recent Analysis Results</CardTitle>
            <CardDescription className="text-slate-400">
              Latest AI-generated trading insights for {symbol}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {results.map((result, index) => (
                <div key={index} className="border border-slate-600 rounded-lg p-4 bg-slate-700/30">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <Badge className={`${getSignalColor(result.signal)} text-white`}>
                        {result.signal}
                      </Badge>
                      <span className={`font-semibold ${getConfidenceColor(result.confidence)}`}>
                        {result.confidence}% Confidence
                      </span>
                    </div>
                    <span className="text-sm text-slate-400">
                      {new Date().toLocaleTimeString()}
                    </span>
                  </div>
                  
                  {result.entryPrice && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3 text-sm">
                      <div>
                        <span className="text-slate-400">Entry:</span>
                        <div className="font-medium text-white">${result.entryPrice}</div>
                      </div>
                      {result.stopLoss && (
                        <div>
                          <span className="text-slate-400">Stop Loss:</span>
                          <div className="font-medium text-red-400">${result.stopLoss}</div>
                        </div>
                      )}
                      {result.takeProfit && (
                        <div>
                          <span className="text-slate-400">Take Profit:</span>
                          <div className="font-medium text-green-400">${result.takeProfit}</div>
                        </div>
                      )}
                      {result.riskReward && (
                        <div>
                          <span className="text-slate-400">R:R:</span>
                          <div className="font-medium text-white">{result.riskReward}</div>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="text-sm text-slate-300">
                    <strong>Analysis:</strong> {result.reason}
                  </div>
                  
                  {result.keyLevels && (
                    <div className="mt-3 text-sm">
                      <div className="flex flex-wrap gap-2">
                        {result.keyLevels.support.map((level, i) => (
                          <Badge key={i} variant="outline" className="border-green-500 text-green-400">
                            S: ${level}
                          </Badge>
                        ))}
                        {result.keyLevels.resistance.map((level, i) => (
                          <Badge key={i} variant="outline" className="border-red-500 text-red-400">
                            R: ${level}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}