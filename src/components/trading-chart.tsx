"use client"

import { useEffect, useRef, useState } from "react"
import { createChart, IChartApi, ISeriesApi, Time } from "lightweight-charts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { RefreshCw, TrendingUp, TrendingDown } from "lucide-react"

interface TradingChartProps {
  symbol?: string
  height?: number
}

interface PriceData {
  time: Time
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export default function TradingChart({ symbol = "BTCUSD", height = 400 }: TradingChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const candlestickSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null)
  const volumeSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null)
  const [timeframe, setTimeframe] = useState("1h")
  const [priceData, setPriceData] = useState<PriceData[]>([])
  const [currentPrice, setCurrentPrice] = useState(0)
  const [priceChange, setPriceChange] = useState(0)
  const [loading, setLoading] = useState(false)

  const loadChartData = async () => {
    setLoading(true)
    try {
      // Map frontend timeframe to backend timeframe
      const tfMap: Record<string, string> = {
        "1m": "1m", "5m": "5m", "15m": "15m", "1h": "1h", "4h": "1h", "1d": "1d"
      }
      const backendTf = tfMap[timeframe] || "1d"

      const response = await fetch(`http://localhost:8003/market/ohlcv/${symbol}?timeframe=${backendTf}&limit=200`)

      if (!response.ok) {
        throw new Error('Failed to fetch chart data')
      }

      const rawData = await response.json()

      // Convert to lightweight-charts format
      const data: PriceData[] = rawData.map((item: any) => ({
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
        const firstPrice = data[0].open
        setCurrentPrice(lastPrice)
        setPriceChange(((lastPrice - firstPrice) / firstPrice) * 100)
      }
    } catch (error) {
      console.error("Error loading chart data:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!chartContainerRef.current) return

    // Create chart
    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: height,
      layout: {
        background: { color: "#0f172a" },
        textColor: "#94a3b8",
      },
      grid: {
        vertLines: { color: "#1e293b" },
        horzLines: { color: "#1e293b" },
      },
      crosshair: {
        mode: 1,
      },
      rightPriceScale: {
        borderColor: "#1e293b",
      },
      timeScale: {
        borderColor: "#1e293b",
        timeVisible: true,
        secondsVisible: false,
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

  useEffect(() => {
    if (candlestickSeriesRef.current && volumeSeriesRef.current && priceData.length > 0) {
      candlestickSeriesRef.current.setData(priceData)

      const volumeData = priceData.map(item => ({
        time: item.time,
        value: item.volume,
        color: item.close >= item.open ? "#10b981" : "#ef4444"
      }))

      volumeSeriesRef.current.setData(volumeData)
    }
  }, [priceData])

  useEffect(() => {
    loadChartData()
  }, [symbol, timeframe])

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <CardTitle className="text-white">{symbol} Chart</CardTitle>
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-white">
                ${currentPrice.toLocaleString()}
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
          <div className="flex items-center space-x-2">
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
      </CardHeader>
      <CardContent>
        <div ref={chartContainerRef} className="w-full" />
      </CardContent>
    </Card>
  )
}