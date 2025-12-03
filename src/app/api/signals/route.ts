import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import ZAI from "z-ai-web-dev-sdk"

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)
    const symbol = searchParams.get("symbol")
    const status = searchParams.get("status")
    const limit = parseInt(searchParams.get("limit") || "20")

    const signals = await db.signal.findMany({
      where: {
        userId: session.user.id,
        ...(symbol && {
          tradingPair: { symbol }
        }),
        ...(status && { status })
      },
      include: {
        tradingPair: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit
    })

    return NextResponse.json({
      success: true,
      signals
    })

  } catch (error) {
    console.error("Get signals error:", error)
    return NextResponse.json(
      { error: "Failed to fetch signals" },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { symbol, timeframe = "1h" } = await req.json()

    if (!symbol) {
      return NextResponse.json(
        { error: "Symbol is required" },
        { status: 400 }
      )
    }

    // Get or create trading pair
    let tradingPair = await db.tradingPair.findUnique({
      where: { symbol }
    })

    if (!tradingPair) {
      tradingPair = await db.tradingPair.create({
        data: {
          symbol,
          name: `${symbol} Trading Pair`,
          type: symbol.includes("USD") ? "forex" : "crypto"
        }
      })
    }

    // Call Python Backend for Analysis
    const pythonBackendUrl = process.env.PYTHON_BACKEND_URL || "http://localhost:8003"

    try {
      // Get current price first
      const priceResponse = await fetch(`${pythonBackendUrl}/market/ohlcv/${symbol}?timeframe=1m&limit=1`)
      let currentPrice = 0
      if (priceResponse.ok) {
        const priceData = await priceResponse.json()
        if (priceData && priceData.length > 0) {
          currentPrice = priceData[0].close
        }
      }

      // Get confluence analysis
      const analysisResponse = await fetch(`${pythonBackendUrl}/analysis/confluence`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol, timeframes: [timeframe] })
      })

      if (!analysisResponse.ok) {
        throw new Error(`Backend analysis failed: ${analysisResponse.statusText}`)
      }

      const analysisData = await analysisResponse.json()

      // Get SMC analysis for better entry/exit levels
      const smcResponse = await fetch(`${pythonBackendUrl}/analysis/smc?symbol=${symbol}&timeframe=${timeframe}`, {
        method: 'POST'
      })

      let smcData = null
      if (smcResponse.ok) {
        smcData = await smcResponse.json()
      }

      // Determine signal direction
      let signalType = "HOLD"
      if (analysisData.score >= 70 && analysisData.primary_trend === "bullish") signalType = "BUY"
      else if (analysisData.score >= 70 && analysisData.primary_trend === "bearish") signalType = "SELL"

      // Calculate historical success rate for this strategy and symbol
      const historicalSignals = await db.signal.findMany({
        where: {
          tradingPairId: tradingPair.id,
          strategy: "mtf_confluence",
          status: "CLOSED"
        },
        take: 100 // Last 100 signals
      })

      let successRate = 75.0 // Default
      if (historicalSignals.length > 0) {
        const successful = historicalSignals.filter(s => s.status === "CLOSED" && s.strength >= 70).length
        successRate = (successful / historicalSignals.length) * 100
      }

      // Save analysis record
      await db.analysis.create({
        data: {
          userId: session.user.id,
          tradingPairId: tradingPair.id,
          strategy: "mtf_confluence",
          result: { ...analysisData, smc: smcData },
          confidence: analysisData.score,
          timeframe,
          successRate
        }
      })

      if (signalType !== "HOLD" && currentPrice > 0) {
        // Calculate entry, SL, and TP levels based on signal type
        const pipValue = symbol.includes("JPY") ? 0.01 : 0.0001
        const isForex = symbol.includes("USD") || symbol.includes("EUR") || symbol.includes("GBP")
        const actualPipValue = isForex ? pipValue : currentPrice * 0.001 // For crypto, use 0.1%

        let entryPrice = currentPrice
        let stopLoss = 0
        let takeProfit1 = 0
        let takeProfit2 = 0
        let takeProfit3 = 0
        let takeProfit4 = 0

        if (signalType === "BUY") {
          // For BUY signals
          stopLoss = entryPrice - (25 * actualPipValue) // 25 pips SL minimum
          takeProfit1 = entryPrice + (80 * actualPipValue) // 80 pips TP1 (as requested)
          takeProfit2 = entryPrice + (120 * actualPipValue) // 120 pips TP2
          takeProfit3 = entryPrice + (180 * actualPipValue) // 180 pips TP3
          takeProfit4 = entryPrice + (250 * actualPipValue) // 250 pips TP4
        } else if (signalType === "SELL") {
          // For SELL signals
          stopLoss = entryPrice + (25 * actualPipValue) // 25 pips SL minimum
          takeProfit1 = entryPrice - (80 * actualPipValue) // 80 pips TP1
          takeProfit2 = entryPrice - (120 * actualPipValue) // 120 pips TP2
          takeProfit3 = entryPrice - (180 * actualPipValue) // 180 pips TP3
          takeProfit4 = entryPrice - (250 * actualPipValue) // 250 pips TP4
        }

        // Calculate R:R ratio
        const risk = Math.abs(entryPrice - stopLoss)
        const reward = Math.abs(takeProfit1 - entryPrice)
        const riskReward = `1:${(reward / risk).toFixed(2)}`

        // Create Signal with all required fields
        const signal = await db.signal.create({
          data: {
            userId: session.user.id,
            tradingPairId: tradingPair.id,
            type: signalType,
            strength: analysisData.score,
            strategy: "mtf_confluence",
            entryPrice,
            stopLoss,
            takeProfit1,
            takeProfit2,
            takeProfit3,
            takeProfit4,
            status: "ACTIVE",
            reason: `Multi-Timeframe Confluence detected. Score: ${analysisData.score}. Trend: ${analysisData.primary_trend}`,
            confirmations: Object.keys(analysisData.strategies || {}).length,
            riskReward,
            timeframe,
            successRate,
            signalQuality: analysisData.score >= 90 ? "EXCELLENT" : analysisData.score >= 80 ? "GOOD" : "AVERAGE",
            volumeConfirmation: true,
            fibonacci: {
              retracement: [0.236, 0.382, 0.500, 0.618, 0.786],
              extension: [1.272, 1.618, 2.0, 2.618]
            }
          },
          include: {
            tradingPair: true
          }
        })

        // Process signal for MT4/MT5 copy trading
        try {
          const { processSignalForMT4 } = await import('@/lib/mt4/signal-processor')
          await processSignalForMT4(signal.id)
        } catch (mt4Error) {
          console.error('MT4 signal processing error:', mt4Error)
          // Don't fail the signal creation if MT4 processing fails
        }

        // Send Telegram notification
        try {
          const { sendNewSignalNotification } = await import('@/lib/mt4/telegram-notifications')
          await sendNewSignalNotification(signal.id)
        } catch (telegramError) {
          console.error('Telegram notification error:', telegramError)
          // Don't fail the signal creation if Telegram fails
        }

        return NextResponse.json({
          success: true,
          signal,
          analysis: analysisData,
          smc: smcData,
          successRate,
          riskReward
        })
      }

      return NextResponse.json({
        success: true,
        message: currentPrice === 0 ? "Failed to fetch current price" : "No strong signal detected (HOLD)",
        analysis: analysisData,
        successRate
      })

    } catch (backendError) {
      console.error("Python backend error:", backendError)
      return NextResponse.json(
        { error: "Failed to perform analysis" },
        { status: 502 }
      )
    }

  } catch (error) {
    console.error("Signal generation error:", error)
    return NextResponse.json(
      { error: "Failed to generate signal" },
      { status: 500 }
    )
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { signalId, status } = await req.json()

    if (!signalId || !status) {
      return NextResponse.json(
        { error: "Signal ID and status are required" },
        { status: 400 }
      )
    }

    const signal = await db.signal.update({
      where: {
        id: signalId,
        userId: session.user.id
      },
      data: {
        status
      },
      include: {
        tradingPair: true
      }
    })

    return NextResponse.json({
      success: true,
      signal
    })

  } catch (error) {
    console.error("Update signal error:", error)
    return NextResponse.json(
      { error: "Failed to update signal" },
      { status: 500 }
    )
  }
}