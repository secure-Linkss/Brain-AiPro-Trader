import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import ZAI from "z-ai-web-dev-sdk"

// Forex pairs for scanning
const FOREX_PAIRS = [
  "EURUSD", "GBPUSD", "USDJPY", "USDCHF", "USDCAD", "AUDUSD", "NZDUSD",
  "EURGBP", "EURJPY", "GBPJPY", "EURCHF", "EURAUD", "GBPCHF", "EURNZD",
  "AUDJPY", "CADJPY", "CHFJPY", "NZDJPY", "AUDCAD", "AUDCHF", "CADCHF",
  "EURCAD", "EURNOK", "EURSEK", "GBPNZD", "GBPAUD", "GBPCAD", "GBPJPY"
]

const CRYPTO_PAIRS = [
  "BTCUSD", "ETHUSD", "BNBUSD", "ADAUSD", "SOLUSD", "XRPUSD", "DOTUSD",
  "DOGEUSD", "AVAXUSD", "MATICUSD", "LINKUSD", "UNIUSD", "LTCUSD", "ATOMUSD"
]

const STOCK_SYMBOLS = [
  "AAPL", "GOOGL", "MSFT", "AMZN", "TSLA", "META", "NVDA", "NFLX",
  "AMD", "INTC", "BABA", "DIS", "PYPL", "SQ", "COIN", "PLTR"
]

const TIMEFRAMES = ["M1", "M5", "M15", "M30", "H1", "H4", "D1", "W1"]

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const {
      pairType = "forex",
      timeframes = ["1h"], // Default to 1h if not specified, matching backend format
      minConfidence = 75,
      scanType = "realtime"
    } = await req.json()

    // Select pairs based on type
    let pairsToScan = FOREX_PAIRS
    if (pairType === "crypto") pairsToScan = CRYPTO_PAIRS
    if (pairType === "stocks") pairsToScan = STOCK_SYMBOLS

    const pythonBackendUrl = process.env.PYTHON_BACKEND_URL || "http://localhost:8003"
    const scanResults = []
    let processedPairs = 0

    // Process pairs in parallel batches to avoid overwhelming backend but faster than sequential
    const BATCH_SIZE = 5
    for (let i = 0; i < pairsToScan.length; i += BATCH_SIZE) {
      const batch = pairsToScan.slice(i, i + BATCH_SIZE)
      const promises = batch.map(async (symbol) => {
        try {
          // Get or create trading pair
          let tradingPair = await db.tradingPair.findUnique({
            where: { symbol }
          })

          if (!tradingPair) {
            tradingPair = await db.tradingPair.create({
              data: {
                symbol,
                name: `${symbol} Trading Pair`,
                type: pairType
              }
            })
          }

          // Call Python Backend
          const res = await fetch(`${pythonBackendUrl}/analysis/confluence`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ symbol, timeframes })
          })

          if (!res.ok) return null
          const data = await res.json()

          if (data.score >= minConfidence) {
            const signal = data.primary_trend === 'bullish' ? 'BUY' :
              data.primary_trend === 'bearish' ? 'SELL' : 'HOLD'

            if (signal !== 'HOLD') {
              // Save result
              const scanResult = await db.scannerResult.create({
                data: {
                  userId: session.user.id,
                  tradingPairId: tradingPair.id,
                  timeframe: timeframes.join(","),
                  signal: signal,
                  strength: data.score,
                  strategies: data, // Store full analysis
                  price: 0 // Backend should ideally return current price
                }
              })

              return {
                id: scanResult.id,
                symbol,
                signal: signal,
                confidence: data.score,
                confirmations: Object.keys(data.strategies || {}).length,
                timeframes: timeframes,
                // entry/exit would come from data if available
                timestamp: scanResult.timestamp
              }
            }
          }
        } catch (e) {
          console.error(`Error scanning ${symbol}`, e)
        }
        return null
      })

      const results = await Promise.all(promises)
      results.forEach(r => {
        if (r) scanResults.push(r)
      })
      processedPairs += batch.length
    }

    // Sort by confidence
    scanResults.sort((a, b) => b.confidence - a.confidence)

    return NextResponse.json({
      success: true,
      scanResults,
      summary: {
        totalPairs: pairsToScan.length,
        scannedPairs: processedPairs,
        qualifiedSignals: scanResults.length,
        scanType,
        timeframes
      }
    })

  } catch (error) {
    console.error("Scanner error:", error)
    return NextResponse.json(
      { error: "Scanner failed" },
      { status: 500 }
    )
  }
}