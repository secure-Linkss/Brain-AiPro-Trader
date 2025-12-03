import { NextApiRequest, NextApiResponse } from "next"
import { Server as ServerIO } from "socket.io"

interface PriceData {
  symbol: string
  price: number
  change: number
  volume: number
  timestamp: string
}

const SYMBOLS = [
  "BTCUSD", "ETHUSD", "EURUSD", "GBPUSD", "AAPL", "GOOGL", "MSFT", "TSLA"
]

const generatePriceUpdate = (symbol: string): PriceData => {
  const basePrices: { [key: string]: number } = {
    "BTCUSD": 43000,
    "ETHUSD": 2200,
    "EURUSD": 1.085,
    "GBPUSD": 1.274,
    "AAPL": 175.20,
    "GOOGL": 142.50,
    "MSFT": 378.85,
    "TSLA": 245.60
  }

  const basePrice = basePrices[symbol] || 100
  const change = (Math.random() - 0.5) * basePrice * 0.002 // Small price movements
  const newPrice = basePrice + change
  const changePercent = (change / basePrice) * 100

  return {
    symbol,
    price: Math.round(newPrice * 100) / 100,
    change: Math.round(changePercent * 100) / 100,
    volume: Math.floor(Math.random() * 10000000) + 1000000,
    timestamp: new Date().toISOString()
  }
}

export default function PriceFeedHandler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  const { io } = (req.socket as any).server

  if (!io) {
    return res.status(500).json({ error: "Socket.io not initialized" })
  }

  // Start price feed updates
  const interval = setInterval(() => {
    SYMBOLS.forEach(symbol => {
      const priceUpdate = generatePriceUpdate(symbol)
      
      // Emit to all clients subscribed to this symbol
      io.to(`symbol-${symbol}`).emit("price-update", priceUpdate)
      
      // Also emit to all clients for general updates
      io.emit("market-update", priceUpdate)
    })
  }, 2000) // Update every 2 seconds

  // Clean up interval after 5 minutes (in production, you might want this to run indefinitely)
  setTimeout(() => {
    clearInterval(interval)
  }, 5 * 60 * 1000)

  res.status(200).json({ message: "Price feed started" })
}