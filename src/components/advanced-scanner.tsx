"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { 
  Loader2, 
  Radar, 
  TrendingUp, 
  TrendingDown, 
  Filter,
  Play,
  Pause,
  RefreshCw,
  Target,
  Clock
} from "lucide-react"

interface ScannerResult {
  id: string
  symbol: string
  signal: string
  confidence: number
  confirmations: number
  timeframes: string[]
  entryPrice?: number
  stopLoss?: number
  takeProfit1?: number
  timestamp: string
}

interface ScannerConfig {
  pairType: string
  timeframes: string[]
  strategies: string[]
  minConfidence: number
  autoScan: boolean
  scanInterval: number
}

const FOREX_PAIRS = [
  "EURUSD", "GBPUSD", "USDJPY", "USDCHF", "USDCAD", "AUDUSD", "NZDUSD",
  "EURGBP", "EURJPY", "GBPJPY", "EURCHF", "EURAUD", "GBPCHF", "EURNZD"
]

const CRYPTO_PAIRS = [
  "BTCUSD", "ETHUSD", "BNBUSD", "ADAUSD", "SOLUSD", "XRPUSD", "DOTUSD",
  "DOGEUSD", "AVAXUSD", "MATICUSD", "LINKUSD", "UNIUSD", "LTCUSD"
]

const STOCK_SYMBOLS = [
  "AAPL", "GOOGL", "MSFT", "AMZN", "TSLA", "META", "NVDA", "NFLX"
]

const ADVANCED_STRATEGIES = [
  { id: "price_action_candlestick", name: "Advanced Candlestick", category: "Price Action" },
  { id: "price_action_reversal", name: "Reversal Patterns", category: "Price Action" },
  { id: "harmonic_gartley", name: "Gartley Pattern", category: "Harmonics" },
  { id: "harmonic_butterfly", name: "Butterfly Pattern", category: "Harmonics" },
  { id: "harmonic_bat", name: "Bat Pattern", category: "Harmonics" },
  { id: "harmonic_crab", name: "Crab Pattern", category: "Harmonics" },
  { id: "elliott_wave", name: "Elliott Wave", category: "Wave Analysis" },
  { id: "indicators_ema_cloud", name: "EMA Cloud", category: "Indicators" },
  { id: "indicators_rsi_divergence", name: "RSI Divergence", category: "Indicators" },
  { id: "support_resistance_fibonacci", name: "Fibonacci S&R", category: "S&R" },
  { id: "market_structure_bos", name: "Break of Structure", category: "Market Structure" }
]

const TIMEFRAMES = [
  { value: "M1", label: "1 Minute" },
  { value: "M5", label: "5 Minutes" },
  { value: "M15", label: "15 Minutes" },
  { value: "M30", label: "30 Minutes" },
  { value: "H1", label: "1 Hour" },
  { value: "H4", label: "4 Hours" },
  { value: "D1", label: "Daily" }
]

export default function AdvancedScanner() {
  const [config, setConfig] = useState<ScannerConfig>({
    pairType: "forex",
    timeframes: ["M15", "H1", "H4"],
    strategies: ["price_action_candlestick", "harmonic_gartley", "support_resistance_fibonacci"],
    minConfidence: 75,
    autoScan: false,
    scanInterval: 60
  })

  const [scanResults, setScanResults] = useState<ScannerResult[]>([])
  const [isScanning, setIsScanning] = useState(false)
  const [scanProgress, setScanProgress] = useState(0)
  const [lastScan, setLastScan] = useState<Date | null>(null)

  const runScan = async () => {
    setIsScanning(true)
    setScanProgress(0)
    
    try {
      const response = await fetch("/api/scanner", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(config),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Scan failed")
      }

      setScanResults(data.scanResults || [])
      setLastScan(new Date())
      
    } catch (error: any) {
      console.error("Scan error:", error)
    } finally {
      setIsScanning(false)
      setScanProgress(100)
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
    if (confidence >= 90) return "text-green-400"
    if (confidence >= 80) return "text-blue-400"
    if (confidence >= 70) return "text-yellow-400"
    return "text-red-400"
  }

  const formatPrice = (price: number, symbol: string) => {
    if (symbol.includes("JPY")) {
      return price.toFixed(3)
    }
    if (symbol.includes("USD") && !symbol.includes("BTC") && !symbol.includes("ETH")) {
      return price.toFixed(5)
    }
    return price.toFixed(2)
  }

  const calculatePips = (entry: number, stopLoss: number, symbol: string) => {
    const diff = Math.abs(entry - stopLoss)
    const multiplier = symbol.includes("JPY") ? 100 : 10000
    return Math.round(diff * multiplier)
  }

  useEffect(() => {
    let interval: NodeJS.Timeout
    
    if (config.autoScan && !isScanning) {
      interval = setInterval(() => {
        runScan()
      }, config.scanInterval * 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [config.autoScan, config.scanInterval, isScanning])

  return (
    <div className="space-y-6">
      {/* Scanner Configuration */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Radar className="w-5 h-5 mr-2 text-purple-400" />
            Advanced Market Scanner
          </CardTitle>
          <CardDescription className="text-slate-400">
            Multi-timeframe, multi-strategy scanner for high-probability setups
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Pair Type Selection */}
            <div>
              <label className="text-sm font-medium text-white mb-2 block">Market Type</label>
              <Select value={config.pairType} onValueChange={(value) => setConfig(prev => ({ ...prev, pairType: value }))}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  <SelectItem value="forex">Forex Pairs ({FOREX_PAIRS.length})</SelectItem>
                  <SelectItem value="crypto">Crypto Pairs ({CRYPTO_PAIRS.length})</SelectItem>
                  <SelectItem value="stocks">Stocks ({STOCK_SYMBOLS.length})</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Timeframe Selection */}
            <div>
              <label className="text-sm font-medium text-white mb-2 block">Timeframes</label>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {TIMEFRAMES.map((tf) => (
                  <div key={tf.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={tf.value}
                      checked={config.timeframes.includes(tf.value)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setConfig(prev => ({ ...prev, timeframes: [...prev.timeframes, tf.value] }))
                        } else {
                          setConfig(prev => ({ ...prev, timeframes: prev.timeframes.filter(t => t !== tf.value) }))
                        }
                      }}
                    />
                    <label htmlFor={tf.value} className="text-sm text-slate-300">{tf.label}</label>
                  </div>
                ))}
              </div>
            </div>

            {/* Strategy Selection */}
            <div>
              <label className="text-sm font-medium text-white mb-2 block">Strategies</label>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {ADVANCED_STRATEGIES.map((strategy) => (
                  <div key={strategy.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={strategy.id}
                      checked={config.strategies.includes(strategy.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setConfig(prev => ({ ...prev, strategies: [...prev.strategies, strategy.id] }))
                        } else {
                          setConfig(prev => ({ ...prev, strategies: prev.strategies.filter(s => s !== strategy.id) }))
                        }
                      }}
                    />
                    <label htmlFor={strategy.id} className="text-sm text-slate-300">
                      {strategy.name} ({strategy.category})
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Confidence Threshold */}
            <div>
              <label className="text-sm font-medium text-white mb-2 block">
                Min Confidence: {config.minConfidence}%
              </label>
              <Slider
                value={[config.minConfidence]}
                onValueChange={([value]) => setConfig(prev => ({ ...prev, minConfidence: value }))}
                max={100}
                min={50}
                step={5}
                className="mt-2"
              />
            </div>

            {/* Auto Scan */}
            <div>
              <label className="text-sm font-medium text-white mb-2 block">Auto Scan</label>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="autoScan"
                  checked={config.autoScan}
                  onCheckedChange={(checked) => setConfig(prev => ({ ...prev, autoScan: checked as boolean }))}
                />
                <label htmlFor="autoScan" className="text-sm text-slate-300">Enable automatic scanning</label>
              </div>
              {config.autoScan && (
                <div className="mt-2">
                  <label className="text-xs text-slate-400">
                    Interval: {config.scanInterval} seconds
                  </label>
                  <Slider
                    value={[config.scanInterval]}
                    onValueChange={([value]) => setConfig(prev => ({ ...prev, scanInterval: value }))}
                    max={300}
                    min={30}
                    step={30}
                    className="mt-1"
                  />
                </div>
              )}
            </div>

            {/* Scan Controls */}
            <div className="flex items-end space-x-2">
              <Button
                onClick={runScan}
                disabled={isScanning}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                {isScanning ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Scanning...
                  </>
                ) : (
                  <>
                    <Radar className="w-4 h-4 mr-2" />
                    Start Scan
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => setScanResults([])}
                className="border-slate-600 text-white hover:bg-slate-700"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Scan Progress */}
          {isScanning && (
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm text-slate-400 mb-1">
                <span>Scanning markets...</span>
                <span>{scanProgress}%</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${scanProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Last Scan Info */}
          {lastScan && (
            <div className="mt-4 text-sm text-slate-400">
              Last scan: {lastScan.toLocaleTimeString()} - Found {scanResults.length} setups
            </div>
          )}
        </CardContent>
      </Card>

      {/* Scan Results */}
      {scanResults.length > 0 && (
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center justify-between">
              <span className="flex items-center">
                <Target className="w-5 h-5 mr-2 text-green-400" />
                High-Probability Setups ({scanResults.length})
              </span>
              <Badge className="bg-green-500 text-white">
                {scanResults.filter(r => r.signal === "BUY").length} BUY / {scanResults.filter(r => r.signal === "SELL").length} SELL
              </Badge>
            </CardTitle>
            <CardDescription className="text-slate-400">
              Signals with {config.minConfidence}%+ confidence across multiple timeframes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {scanResults.map((result) => (
                <div key={result.id} className="border border-slate-600 rounded-lg p-4 bg-slate-700/30">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <Badge className={`${getSignalColor(result.signal)} text-white`}>
                        {result.signal}
                      </Badge>
                      <span className="font-semibold text-lg text-white">{result.symbol}</span>
                      <Badge variant="outline" className="border-purple-500 text-purple-400">
                        <Clock className="w-3 h-3 mr-1" />
                        {result.timeframes.join(", ")}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <div className={`font-semibold ${getConfidenceColor(result.confidence)}`}>
                        {result.confidence}% Confidence
                      </div>
                      <div className="text-sm text-slate-400">
                        {result.confirmations} confirmations
                      </div>
                    </div>
                  </div>

                  {result.entryPrice && (
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                      <div>
                        <span className="text-slate-400">Entry:</span>
                        <div className="font-medium text-white">
                          {formatPrice(result.entryPrice, result.symbol)}
                        </div>
                      </div>
                      {result.stopLoss && (
                        <div>
                          <span className="text-slate-400">Stop Loss:</span>
                          <div className="font-medium text-red-400">
                            {formatPrice(result.stopLoss, result.symbol)}
                            <span className="text-xs ml-1">
                              ({calculatePips(result.entryPrice, result.stopLoss, result.symbol)} pips)
                            </span>
                          </div>
                        </div>
                      )}
                      {result.takeProfit1 && (
                        <div>
                          <span className="text-slate-400">TP1:</span>
                          <div className="font-medium text-green-400">
                            {formatPrice(result.takeProfit1, result.symbol)}
                          </div>
                        </div>
                      )}
                      <div>
                        <span className="text-slate-400">Risk:Reward:</span>
                        <div className="font-medium text-white">1:3.2</div>
                      </div>
                      <div>
                        <span className="text-slate-400">Time:</span>
                        <div className="font-medium text-white">
                          {new Date(result.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!isScanning && scanResults.length === 0 && (
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="text-center py-12">
            <Radar className="w-16 h-16 mx-auto mb-4 text-slate-500" />
            <h3 className="text-lg font-semibold text-white mb-2">No Active Signals</h3>
            <p className="text-slate-400 mb-4">
              Configure your scanner settings and run a scan to find high-probability trading setups
            </p>
            <Button onClick={runScan} className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
              <Radar className="w-4 h-4 mr-2" />
              Start Scanner
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}