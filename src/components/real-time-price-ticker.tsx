"use client"

import { useEffect, useState } from "react"
import { useSocket, PriceUpdate } from "@/lib/socket"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown } from "lucide-react"

interface RealTimePriceTickerProps {
  symbols?: string[]
  userId?: string
}

export default function RealTimePriceTicker({ symbols = ["BTCUSD", "ETHUSD", "EURUSD"], userId }: RealTimePriceTickerProps) {
  const socket = useSocket()
  const [prices, setPrices] = useState<{ [key: string]: PriceUpdate }>({})
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    if (!socket) return

    setConnected(socket.isConnected())

    const handleConnect = () => setConnected(true)
    const handleDisconnect = () => setConnected(false)
    
    const handlePriceUpdate = (data: PriceUpdate) => {
      setPrices(prev => ({
        ...prev,
        [data.symbol]: data
      }))
    }

    // Listen for connection events
    socket.on("connect", handleConnect)
    socket.on("disconnect", handleDisconnect)
    socket.on("price-update", handlePriceUpdate)

    // Join user room if userId is provided
    if (userId) {
      socket.joinUserRoom(userId)
    }

    // Subscribe to symbols
    symbols.forEach(symbol => {
      socket.subscribeSymbol(symbol, userId || "anonymous")
    })

    // Start price feed
    fetch("/api/price-feed", { method: "POST" }).catch(console.error)

    return () => {
      socket.off("connect", handleConnect)
      socket.off("disconnect", handleDisconnect)
      socket.off("price-update", handlePriceUpdate)
      
      // Unsubscribe from symbols
      symbols.forEach(symbol => {
        socket.unsubscribeSymbol(symbol, userId || "anonymous")
      })
    }
  }, [socket, symbols, userId])

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-white">Live Prices</h3>
        <Badge variant={connected ? "default" : "destructive"} className="text-xs">
          {connected ? "Connected" : "Disconnected"}
        </Badge>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {symbols.map(symbol => {
          const price = prices[symbol]
          return (
            <div key={symbol} className="bg-slate-700/50 rounded p-2">
              <div className="text-xs text-slate-400 mb-1">{symbol}</div>
              <div className="text-sm font-medium text-white">
                {price ? `$${price.price.toLocaleString()}` : "Loading..."}
              </div>
              {price && (
                <div className={`flex items-center text-xs ${
                  price.change >= 0 ? "text-green-400" : "text-red-400"
                }`}>
                  {price.change >= 0 ? (
                    <TrendingUp className="w-3 h-3 mr-1" />
                  ) : (
                    <TrendingDown className="w-3 h-3 mr-1" />
                  )}
                  {price.change >= 0 ? "+" : ""}{price.change.toFixed(2)}%
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}