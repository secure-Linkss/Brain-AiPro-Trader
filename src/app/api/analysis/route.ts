import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import ZAI from "z-ai-web-dev-sdk"

const STRATEGIES = {
  price_action: {
    name: "Price Action Analysis",
    description: "Analyzes candlestick patterns, price movements, and market momentum"
  },
  chart_patterns: {
    name: "Chart Pattern Recognition",
    description: "Identifies head & shoulders, triangles, flags, and other technical patterns"
  },
  harmonics: {
    name: "Harmonic Pattern Analysis",
    description: "Detects Gartley, Butterfly, Crab patterns with Fibonacci ratios"
  },
  support_resistance: {
    name: "Support & Resistance Levels",
    description: "Identifies key price levels and historical support/resistance zones"
  },
  supply_demand: {
    name: "Supply & Demand Zones",
    description: "Finds institutional buying and selling zones"
  },
  elliot_wave: {
    name: "Elliott Wave Analysis",
    description: "Performs wave counting and cycle analysis"
  },
  break_of_structure: {
    name: "Break of Structure",
    description: "Identifies market structure breaks and trend changes"
  },
  range_analysis: {
    name: "Range Analysis",
    description: "Analyzes ranging markets and breakout potential"
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

    const { symbol, strategy, timeframe = "1h" } = await req.json()

    if (!symbol || !strategy) {
      return NextResponse.json(
        { error: "Invalid parameters" },
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

    const pythonBackendUrl = process.env.PYTHON_BACKEND_URL || "http://localhost:8003"
    let analysisResult

    try {
      if (strategy === 'smc' || strategy === 'smart_money_concepts') {
        // Call SMC Endpoint
        const res = await fetch(`${pythonBackendUrl}/analysis/smc?symbol=${symbol}&timeframe=${timeframe}`, {
          method: 'POST'
        })

        if (!res.ok) throw new Error(`SMC Analysis failed: ${res.statusText}`)
        const smcData = await res.json()

        // Process SMC data to determine signal
        // If price is in a bullish OB, signal BUY. If in bearish OB, signal SELL.
        let signal = "HOLD"
        let confidence = 50
        const currentPrice = smcData.current_price

        // Check Order Blocks
        if (smcData.order_blocks) {
          for (const ob of smcData.order_blocks) {
            if (currentPrice >= ob.low && currentPrice <= ob.high) {
              if (ob.type === 'bullish') {
                signal = "BUY"
                confidence = ob.strength || 80
              } else if (ob.type === 'bearish') {
                signal = "SELL"
                confidence = ob.strength || 80
              }
            }
          }
        }

        analysisResult = {
          ...smcData,
          signal,
          confidence,
          reason: "SMC Analysis: " + (signal !== "HOLD" ? `Price in ${signal} Order Block` : "No immediate setup")
        }

      } else {
        // Use Confluence Analysis for all other strategies
        const res = await fetch(`${pythonBackendUrl}/analysis/confluence`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ symbol, timeframes: [timeframe] })
        })

        if (!res.ok) throw new Error(`Confluence Analysis failed: ${res.statusText}`)
        const data = await res.json()

        analysisResult = {
          ...data,
          signal: data.primary_trend === 'bullish' ? 'BUY' : data.primary_trend === 'bearish' ? 'SELL' : 'HOLD',
          confidence: data.score,
          reason: `Confluence Score: ${data.score}. Trend: ${data.primary_trend}`
        }
      }

      // Save analysis to database
      const analysis = await db.analysis.create({
        data: {
          userId: session.user.id,
          tradingPairId: tradingPair.id,
          strategy,
          result: analysisResult,
          confidence: analysisResult.confidence || 50
        }
      })

      // If signal is strong enough, create a trading signal
      if (analysisResult.signal && analysisResult.signal !== "HOLD" && analysisResult.confidence > 70) {
        await db.signal.create({
          data: {
            userId: session.user.id,
            tradingPairId: tradingPair.id,
            type: analysisResult.signal,
            strength: analysisResult.confidence,
            strategy,
            // entryPrice: analysisResult.current_price, // Optional
            reason: analysisResult.reason
          }
        })
      }

      return NextResponse.json({
        success: true,
        analysis: {
          id: analysis.id,
          strategy,
          symbol,
          timeframe,
          result: analysisResult,
          timestamp: analysis.timestamp
        }
      })

    } catch (backendError) {
      console.error("Backend analysis error:", backendError)
      return NextResponse.json(
        { error: "Failed to perform analysis" },
        { status: 502 }
      )
    }

  } catch (error) {
    console.error("Analysis error:", error)
    return NextResponse.json(
      { error: "Analysis failed" },
      { status: 500 }
    )
  }
}

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
    const strategy = searchParams.get("strategy")

    // Get recent analyses
    const analyses = await db.analysis.findMany({
      where: {
        userId: session.user.id,
        ...(symbol && {
          tradingPair: { symbol }
        }),
        ...(strategy && { strategy })
      },
      include: {
        tradingPair: true
      },
      orderBy: {
        timestamp: 'desc'
      },
      take: 50
    })

    return NextResponse.json({
      success: true,
      analyses
    })

  } catch (error) {
    console.error("Get analyses error:", error)
    return NextResponse.json(
      { error: "Failed to fetch analyses" },
      { status: 500 }
    )
  }
}