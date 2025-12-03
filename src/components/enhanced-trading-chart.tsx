"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import {
    createChart,
    IChartApi,
    ISeriesApi,
    Time,
    LineStyle,
    CrosshairMode,
    ColorType
} from "lightweight-charts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import {
    RefreshCw,
    TrendingUp,
    TrendingDown,
    ZoomIn,
    ZoomOut,
    Maximize2,
    Filter,
    Eye,
    EyeOff
} from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// ============================================================================
// Types & Interfaces
// ============================================================================

interface TradingChartProps {
    symbol?: string
    height?: number
    onSignalClick?: (signal: DetectedSignal) => void
    onPatternClick?: (pattern: DetectedPattern) => void
}

interface PriceData {
    time: Time
    open: number
    high: number
    low: number
    close: number
    volume: number
}

interface DetectedSignal {
    id: string
    type: "BUY" | "SELL" | "HOLD"
    price: number
    time: Time
    stopLoss?: number
    takeProfit1?: number
    takeProfit2?: number
    takeProfit3?: number
    takeProfit4?: number
    confidence: number
    strategy: string
    explanation: string
    outcome?: "tp_hit" | "sl_hit" | "pending"
}

interface DetectedPattern {
    id: string
    type: string // "head_shoulders", "double_top", etc.
    confidence: number
    coordinates: Array<{ time: Time; price: number; label: string }>
    explanation: string
    indicators: Record<string, any>
}

interface PriceLine {
    id: string
    price: number
    color: string
    label: string
    lineStyle: LineStyle
}

// ============================================================================
// Enhanced Trading Chart Component
// ============================================================================

export default function EnhancedTradingChart({
    symbol = "BTCUSD",
    height = 600,
    onSignalClick,
    onPatternClick
}: TradingChartProps) {
    // Refs
    const chartContainerRef = useRef<HTMLDivElement>(null)
    const chartRef = useRef<IChartApi | null>(null)
    const candlestickSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null)
    const lineSeriesRef = useRef<ISeriesApi<"Line"> | null>(null)
    const volumeSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null)

    // State
    const [chartType, setChartType] = useState<"candlestick" | "line">("candlestick")
    const [timeframe, setTimeframe] = useState("1h")
    const [priceData, setPriceData] = useState<PriceData[]>([])
    const [currentPrice, setCurrentPrice] = useState(0)
    const [priceChange, setPriceChange] = useState(0)
    const [loading, setLoading] = useState(false)
    const [signals, setSignals] = useState<DetectedSignal[]>([])
    const [patterns, setPatterns] = useState<DetectedPattern[]>([])
    const [priceLines, setPriceLines] = useState<PriceLine[]>([])

    // Filter state
    const [showSignals, setShowSignals] = useState(true)
    const [showPatterns, setShowPatterns] = useState(true)
    const [showPriceLines, setShowPriceLines] = useState(true)
    const [minConfidence, setMinConfidence] = useState(60)
    const [signalTypeFilter, setSignalTypeFilter] = useState<string>("all")

    // ============================================================================
    // Mock Data Generation
    // ============================================================================

    // ============================================================================
    // Data Loading
    // ============================================================================

    // ============================================================================
    // Data Loading
    // ============================================================================

    const loadChartData = useCallback(async () => {
        setLoading(true)
        try {
            // 1. Fetch OHLCV Data
            const tfMap: Record<string, string> = {
                "1m": "1m", "5m": "5m", "15m": "15m", "1h": "1h", "4h": "1h", "1d": "1d"
            }
            const backendTf = tfMap[timeframe] || "1d"

            const priceResponse = await fetch(`http://localhost:8003/market/ohlcv/${symbol}?timeframe=${backendTf}&limit=200`)
            if (!priceResponse.ok) throw new Error('Failed to fetch price data')
            const rawPriceData = await priceResponse.json()

            const data: PriceData[] = rawPriceData.map((item: any) => ({
                time: (new Date(item.time).getTime() / 1000) as Time,
                open: item.open,
                high: item.high,
                low: item.low,
                close: item.close,
                volume: item.volume
            }))

            setPriceData(data)

            if (data.length > 0) {
                const lastPrice = data[data.length - 1].close
                const lastTime = data[data.length - 1].time
                setCurrentPrice(lastPrice)
                setPriceChange(((lastPrice - data[0].open) / data[0].open) * 100)

                // 2. Fetch Signals (Confluence)
                try {
                    const signalsResponse = await fetch('http://localhost:8003/analysis/confluence', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ symbol, timeframes: [backendTf] })
                    })

                    if (signalsResponse.ok) {
                        const signalsData = await signalsResponse.json()
                        const newSignals: DetectedSignal[] = []

                        // Assuming signalsData.signals is a list of signals from backend
                        // If backend returns a single result for the symbol, we might need to adapt
                        // Based on analyzer.py, it seems to return a ConfluenceResult object

                        if (signalsData && signalsData.score) {
                            // Create a signal based on the overall confluence score
                            const direction = signalsData.primary_trend === 'bullish' ? 'BUY' :
                                signalsData.primary_trend === 'bearish' ? 'SELL' : 'HOLD';

                            if (direction !== 'HOLD') {
                                newSignals.push({
                                    id: `sig-${Date.now()}`,
                                    type: direction,
                                    price: lastPrice,
                                    time: lastTime,
                                    confidence: signalsData.score,
                                    strategy: "Multi-Timeframe Confluence",
                                    explanation: `Confluence Score: ${signalsData.score}/100. Trend: ${signalsData.primary_trend}`,
                                    outcome: "pending"
                                })
                            }
                        }
                        setSignals(newSignals)
                    }
                } catch (err) {
                    console.error("Failed to fetch signals", err)
                }

                // 3. Fetch Patterns (SMC)
                try {
                    const smcResponse = await fetch(`http://localhost:8003/analysis/smc?symbol=${symbol}&timeframe=${backendTf}`, {
                        method: 'POST'
                    })

                    if (smcResponse.ok) {
                        const smcData = await smcResponse.json()
                        const newPatterns: DetectedPattern[] = []

                        // Map Order Blocks
                        if (smcData.order_blocks) {
                            smcData.order_blocks.forEach((ob: any, i: number) => {
                                newPatterns.push({
                                    id: `ob-${i}`,
                                    type: ob.type === 'bullish' ? 'Bullish Order Block' : 'Bearish Order Block',
                                    confidence: ob.strength ? ob.strength * 100 : 80,
                                    coordinates: [], // Coordinates would need more complex mapping
                                    explanation: `Order Block at ${ob.price_level}`,
                                    indicators: {}
                                })
                            })
                        }
                        setPatterns(newPatterns)
                    }
                } catch (err) {
                    console.error("Failed to fetch patterns", err)
                }

                // Set Current Price Line
                setPriceLines([
                    {
                        id: "current",
                        price: lastPrice,
                        color: "#3b82f6",
                        label: "Current Price",
                        lineStyle: LineStyle.Solid
                    }
                ])
            }
        } catch (error) {
            console.error("Error loading chart data:", error)
        } finally {
            setLoading(false)
        }
    }, [symbol, timeframe])

    // ============================================================================
    // Chart Initialization
    // ============================================================================

    useEffect(() => {
        if (!chartContainerRef.current) return

        const chart = createChart(chartContainerRef.current, {
            width: chartContainerRef.current.clientWidth,
            height: height,
            layout: {
                background: { type: ColorType.Solid, color: "#0f172a" },
                textColor: "#94a3b8",
            },
            grid: {
                vertLines: { color: "#1e293b" },
                horzLines: { color: "#1e293b" },
            },
            crosshair: {
                mode: CrosshairMode.Normal,
                vertLine: {
                    width: 1,
                    color: "#64748b",
                    style: LineStyle.Dashed,
                },
                horzLine: {
                    width: 1,
                    color: "#64748b",
                    style: LineStyle.Dashed,
                },
            },
            rightPriceScale: {
                borderColor: "#1e293b",
                scaleMargins: {
                    top: 0.1,
                    bottom: 0.2,
                },
            },
            timeScale: {
                borderColor: "#1e293b",
                timeVisible: true,
                secondsVisible: false,
            },
            handleScroll: {
                mouseWheel: true,
                pressedMouseMove: true,
                horzTouchDrag: true,
                vertTouchDrag: true,
            },
            handleScale: {
                axisPressedMouseMove: true,
                mouseWheel: true,
                pinch: true,
            },
        })

        // Add candlestick series
        const candlestickSeries = chart.addCandlestickSeries({
            upColor: "#10b981",
            downColor: "#ef4444",
            borderDownColor: "#ef4444",
            borderUpColor: "#10b981",
            wickDownColor: "#ef4444",
            wickUpColor: "#10b981",
        })

        // Add line series (initially hidden)
        const lineSeries = chart.addLineSeries({
            color: "#3b82f6",
            lineWidth: 2,
            visible: false,
        })

        // Add volume series
        const volumeSeries = chart.addHistogramSeries({
            color: "#6366f1",
            priceFormat: {
                type: "volume",
            },
            priceScaleId: "volume",
            scaleMargins: {
                top: 0.85,
                bottom: 0,
            },
        })

        chartRef.current = chart
        candlestickSeriesRef.current = candlestickSeries
        lineSeriesRef.current = lineSeries
        volumeSeriesRef.current = volumeSeries

        // Handle resize
        const handleResize = () => {
            if (chartContainerRef.current && chartRef.current) {
                chartRef.current.applyOptions({
                    width: chartContainerRef.current.clientWidth,
                })
            }
        }

        window.addEventListener("resize", handleResize)

        return () => {
            window.removeEventListener("resize", handleResize)
            if (chartRef.current) {
                chartRef.current.remove()
            }
        }
    }, [height])

    // ============================================================================
    // Update Chart Data
    // ============================================================================

    useEffect(() => {
        if (!candlestickSeriesRef.current || !lineSeriesRef.current || !volumeSeriesRef.current) return
        if (priceData.length === 0) return

        if (chartType === "candlestick") {
            candlestickSeriesRef.current.setData(priceData)
            candlestickSeriesRef.current.applyOptions({ visible: true })
            lineSeriesRef.current.applyOptions({ visible: false })
        } else {
            const lineData = priceData.map(item => ({
                time: item.time,
                value: item.close
            }))
            lineSeriesRef.current.setData(lineData)
            lineSeriesRef.current.applyOptions({ visible: true })
            candlestickSeriesRef.current.applyOptions({ visible: false })
        }

        const volumeData = priceData.map(item => ({
            time: item.time,
            value: item.volume,
            color: item.close >= item.open ? "#10b98166" : "#ef444466"
        }))

        volumeSeriesRef.current.setData(volumeData)
    }, [priceData, chartType])

    // ============================================================================
    // Add Markers for Signals
    // ============================================================================

    useEffect(() => {
        if (!candlestickSeriesRef.current || !showSignals) return

        const filteredSignals = signals.filter(signal => {
            if (signal.confidence < minConfidence) return false
            if (signalTypeFilter !== "all" && signal.type !== signalTypeFilter) return false
            return true
        })

        const markers = filteredSignals.map(signal => ({
            time: signal.time,
            position: signal.type === "BUY" ? "belowBar" as const : "aboveBar" as const,
            color: signal.type === "BUY" ? "#10b981" : "#ef4444",
            shape: signal.type === "BUY" ? "arrowUp" as const : "arrowDown" as const,
            text: `${signal.type} ${signal.confidence.toFixed(0)}%`,
            size: 1,
        }))

        candlestickSeriesRef.current.setMarkers(markers)
    }, [signals, showSignals, minConfidence, signalTypeFilter])

    // ============================================================================
    // Load Data on Mount
    // ============================================================================

    useEffect(() => {
        loadChartData()
    }, [loadChartData])

    // ============================================================================
    // Filtered Data
    // ============================================================================

    const filteredSignals = signals.filter(signal => {
        if (signal.confidence < minConfidence) return false
        if (signalTypeFilter !== "all" && signal.type !== signalTypeFilter) return false
        return true
    })

    const filteredPatterns = patterns.filter(pattern => pattern.confidence >= minConfidence)

    // ============================================================================
    // Render
    // ============================================================================

    return (
        <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-4">
                    {/* Title and Price */}
                    <div className="flex items-center space-x-4">
                        <CardTitle className="text-white">{symbol} Chart</CardTitle>
                        <div className="flex items-center space-x-2">
                            <span className="text-2xl font-bold text-white">
                                ${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                            {priceChange >= 0 ? (
                                <Badge className="bg-green-500 text-white">
                                    <TrendingUp className="w-3 h-3 mr-1" />
                                    +{priceChange.toFixed(2)}%
                                </Badge>
                            ) : (
                                <Badge className="bg-red-500 text-white">
                                    <TrendingDown className="w-3 h-3 mr-1" />
                                    {priceChange.toFixed(2)}%
                                </Badge>
                            )}
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center space-x-2 flex-wrap gap-2">
                        {/* Chart Type Toggle */}
                        <div className="flex items-center space-x-2 bg-slate-700 rounded-md p-1">
                            <Button
                                variant={chartType === "candlestick" ? "default" : "ghost"}
                                size="sm"
                                onClick={() => setChartType("candlestick")}
                                className="h-8"
                            >
                                Candles
                            </Button>
                            <Button
                                variant={chartType === "line" ? "default" : "ghost"}
                                size="sm"
                                onClick={() => setChartType("line")}
                                className="h-8"
                            >
                                Line
                            </Button>
                        </div>

                        {/* Timeframe Selector */}
                        <Select value={timeframe} onValueChange={setTimeframe}>
                            <SelectTrigger className="w-20 bg-slate-700 border-slate-600 text-white">
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

                        {/* Refresh Button */}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={loadChartData}
                            disabled={loading}
                            className="border-slate-600 text-white hover:bg-slate-700"
                        >
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        </Button>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex items-center space-x-4 mt-4 flex-wrap gap-4">
                    {/* Show/Hide Toggles */}
                    <div className="flex items-center space-x-2">
                        <Switch
                            id="show-signals"
                            checked={showSignals}
                            onCheckedChange={setShowSignals}
                        />
                        <Label htmlFor="show-signals" className="text-sm text-slate-300">
                            Signals ({filteredSignals.length})
                        </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Switch
                            id="show-patterns"
                            checked={showPatterns}
                            onCheckedChange={setShowPatterns}
                        />
                        <Label htmlFor="show-patterns" className="text-sm text-slate-300">
                            Patterns ({filteredPatterns.length})
                        </Label>
                    </div>

                    {/* Signal Type Filter */}
                    <Select value={signalTypeFilter} onValueChange={setSignalTypeFilter}>
                        <SelectTrigger className="w-32 bg-slate-700 border-slate-600 text-white text-sm">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-700 border-slate-600">
                            <SelectItem value="all">All Signals</SelectItem>
                            <SelectItem value="BUY">Buy Only</SelectItem>
                            <SelectItem value="SELL">Sell Only</SelectItem>
                        </SelectContent>
                    </Select>

                    {/* Confidence Filter */}
                    <div className="flex items-center space-x-2">
                        <Label className="text-sm text-slate-300 whitespace-nowrap">
                            Min Confidence: {minConfidence}%
                        </Label>
                        <Slider
                            value={[minConfidence]}
                            onValueChange={(values) => setMinConfidence(values[0])}
                            min={0}
                            max={100}
                            step={5}
                            className="w-32"
                        />
                    </div>
                </div>
            </CardHeader>

            <CardContent>
                <div ref={chartContainerRef} className="w-full" />

                {/* Signal List */}
                {showSignals && filteredSignals.length > 0 && (
                    <div className="mt-4 space-y-2">
                        <h3 className="text-sm font-semibold text-slate-300">Recent Signals</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                            {filteredSignals.slice(0, 6).map(signal => (
                                <div
                                    key={signal.id}
                                    className="bg-slate-700 p-3 rounded-md cursor-pointer hover:bg-slate-600 transition-colors"
                                    onClick={() => onSignalClick?.(signal)}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <Badge className={signal.type === "BUY" ? "bg-green-500" : "bg-red-500"}>
                                            {signal.type}
                                        </Badge>
                                        <span className="text-xs text-slate-400">{signal.confidence.toFixed(1)}%</span>
                                    </div>
                                    <div className="text-sm text-white font-mono">
                                        ${signal.price.toFixed(2)}
                                    </div>
                                    <div className="text-xs text-slate-400 mt-1">
                                        {signal.strategy}
                                    </div>
                                    {signal.outcome && (
                                        <Badge
                                            className={`mt-2 text-xs ${signal.outcome === "tp_hit" ? "bg-green-600" :
                                                signal.outcome === "sl_hit" ? "bg-red-600" :
                                                    "bg-yellow-600"
                                                }`}
                                        >
                                            {signal.outcome.replace("_", " ").toUpperCase()}
                                        </Badge>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
