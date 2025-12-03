"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import {
  Brain,
  TrendingUp,
  TrendingDown,
  X,
  Check,
  Clock,
  RefreshCw,
  Filter,
  Target,
  Shield
} from "lucide-react"

interface Signal {
  id: string
  symbol: string
  type: "BUY" | "SELL" | "HOLD"
  strength: number
  strategy: string
  entryPrice?: number
  stopLoss?: number
  takeProfit?: number
  status: "ACTIVE" | "CLOSED" | "CANCELLED"
  reason: string
  createdAt: string
  tradingPair: {
    symbol: string
    name: string
  }
}

interface SignalsManagerProps {
  symbol?: string
}

export default function SignalsManager({ symbol }: SignalsManagerProps) {
  const [signals, setSignals] = useState<Signal[]>([])
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPrices, setCurrentPrices] = useState<Record<string, number>>({})

  const fetchSignals = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (symbol) params.append("symbol", symbol)
      if (statusFilter !== "all") params.append("status", statusFilter)

      const response = await fetch(`/api/signals?${params.toString()}`)
      const data = await response.json()

      if (data.success) {
        setSignals(data.signals)
      }
    } catch (error) {
      console.error("Failed to fetch signals:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (signals.length > 0) {
      const symbols = Array.from(new Set(signals.map(s => s.symbol)))
      const fetchPrices = async () => {
        try {
          const res = await fetch(`/api/market/prices?symbols=${symbols.join(',')}`)
          const data = await res.json()
          if (data.prices) {
            setCurrentPrices(data.prices)
          }
        } catch (e) {
          console.error("Failed to fetch prices", e)
        }
      }
      fetchPrices()
      const interval = setInterval(fetchPrices, 10000)
      return () => clearInterval(interval)
    }
  }, [signals])

  const updateSignalStatus = async (signalId: string, status: string) => {
    try {
      const response = await fetch("/api/signals", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          signalId,
          status
        }),
      })

      const data = await response.json()

      if (data.success) {
        setSignals(prev =>
          prev.map(signal =>
            signal.id === signalId
              ? { ...signal, status: status as any }
              : signal
          )
        )
      }
    } catch (error) {
      console.error("Failed to update signal:", error)
    }
  }

  const generateNewSignal = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/signals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          symbol: symbol || "BTCUSD"
        }),
      })

      const data = await response.json()

      if (data.success) {
        fetchSignals() // Refresh signals
      }
    } catch (error) {
      console.error("Failed to generate signal:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSignals()
  }, [symbol, statusFilter])

  const filteredSignals = signals.filter(signal => {
    const matchesSearch = signal.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      signal.strategy.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filter === "all" ||
      (filter === "buy" && signal.type === "BUY") ||
      (filter === "sell" && signal.type === "SELL")

    return matchesSearch && matchesFilter
  })

  const getSignalColor = (type: string) => {
    switch (type) {
      case "BUY": return "bg-green-500"
      case "SELL": return "bg-red-500"
      default: return "bg-gray-500"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE": return "bg-blue-500"
      case "CLOSED": return "bg-green-500"
      case "CANCELLED": return "bg-gray-500"
      default: return "bg-gray-500"
    }
  }

  const getConfidenceColor = (strength: number) => {
    if (strength >= 80) return "text-green-400"
    if (strength >= 60) return "text-yellow-400"
    return "text-red-400"
  }

  const calculatePnL = (signal: Signal) => {
    if (!signal.entryPrice || signal.status !== "ACTIVE") return null

    const currentPrice = currentPrices[signal.symbol]
    if (!currentPrice) return null

    const pnl = signal.type === "BUY"
      ? currentPrice - signal.entryPrice
      : signal.entryPrice - currentPrice

    return {
      value: pnl,
      percentage: (pnl / signal.entryPrice) * 100
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white flex items-center">
                <Target className="w-5 h-5 mr-2 text-purple-400" />
                Trading Signals
              </CardTitle>
              <CardDescription className="text-slate-400">
                AI-powered trading signals and recommendations
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                onClick={generateNewSignal}
                disabled={loading}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Brain className="w-4 h-4" />
                )}
                Generate Signal
              </Button>
              <Button
                variant="outline"
                onClick={fetchSignals}
                disabled={loading}
                className="border-slate-600 text-white hover:bg-slate-700"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              placeholder="Search signals..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
            />
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-700 border-slate-600">
                <SelectItem value="all">All Signals</SelectItem>
                <SelectItem value="buy">Buy Signals</SelectItem>
                <SelectItem value="sell">Sell Signals</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-700 border-slate-600">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="CLOSED">Closed</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Signals List */}
      <div className="space-y-4">
        {filteredSignals.length === 0 ? (
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="text-center py-8">
              <Target className="w-12 h-12 mx-auto mb-4 text-slate-400" />
              <p className="text-slate-400">No signals found</p>
              <p className="text-sm text-slate-500 mt-2">
                Generate a new signal to get started
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredSignals.map((signal) => {
            const pnl = calculatePnL(signal)
            return (
              <Card key={signal.id} className="bg-slate-800 border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <Badge className={`${getSignalColor(signal.type)} text-white`}>
                        {signal.type}
                      </Badge>
                      <span className="font-semibold text-lg text-white">
                        {signal.symbol}
                      </span>
                      <Badge className={`${getStatusColor(signal.status)} text-white`}>
                        {signal.status}
                      </Badge>
                      <Badge variant="outline" className="border-purple-500 text-purple-400">
                        <Brain className="w-3 h-3 mr-1" />
                        {signal.strength}% Confidence
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-slate-400">
                        {new Date(signal.createdAt).toLocaleString()}
                      </span>
                      {signal.status === "ACTIVE" && (
                        <div className="flex space-x-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateSignalStatus(signal.id, "CLOSED")}
                            className="border-green-500 text-green-400 hover:bg-green-500/10"
                          >
                            <Check className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateSignalStatus(signal.id, "CANCELLED")}
                            className="border-red-500 text-red-400 hover:bg-red-500/10"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    {signal.entryPrice && (
                      <div>
                        <span className="text-slate-400 text-sm">Entry Price:</span>
                        <div className="font-medium text-white">${signal.entryPrice}</div>
                      </div>
                    )}
                    {signal.stopLoss && (
                      <div>
                        <span className="text-slate-400 text-sm">Stop Loss:</span>
                        <div className="font-medium text-red-400">${signal.stopLoss}</div>
                      </div>
                    )}
                    {signal.takeProfit && (
                      <div>
                        <span className="text-slate-400 text-sm">Take Profit:</span>
                        <div className="font-medium text-green-400">${signal.takeProfit}</div>
                      </div>
                    )}
                    <div>
                      <span className="text-slate-400 text-sm">Strategy:</span>
                      <div className="font-medium text-white">{signal.strategy}</div>
                    </div>
                  </div>

                  {pnl && (
                    <div className="mb-4 p-3 bg-slate-700/50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Unrealized P&L:</span>
                        <div className={`font-semibold ${pnl.value >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          ${Math.abs(pnl.value).toFixed(2)} ({pnl.percentage >= 0 ? '+' : ''}{pnl.percentage.toFixed(2)}%)
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="text-sm text-slate-300">
                    <strong>Analysis:</strong> {signal.reason}
                  </div>

                  {signal.entryPrice && signal.stopLoss && signal.takeProfit && (
                    <div className="mt-3 flex items-center space-x-4 text-sm">
                      <div className="flex items-center space-x-1">
                        <Shield className="w-4 h-4 text-blue-400" />
                        <span className="text-slate-400">Risk/Reward:</span>
                        <span className="text-white font-medium">
                          {Math.abs((signal.takeProfit - signal.entryPrice) / (signal.stopLoss - signal.entryPrice)).toFixed(2)}:1
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}