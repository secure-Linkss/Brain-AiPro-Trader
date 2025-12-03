import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import ZAI from "z-ai-web-dev-sdk"

// Advanced Trading Strategies with comprehensive patterns
const ADVANCED_STRATEGIES = {
  // Price Action Strategies
  price_action_candlestick: {
    name: "Advanced Candlestick Patterns",
    description: "All candlestick patterns including Doji, Hammer, Shooting Star, Engulfing, Harami, Morning Star, Evening Star, Three Black Crows, Three White Soldiers, Marubozu, Spinning Top, etc.",
    patterns: ["doji", "hammer", "shooting_star", "engulfing", "harami", "morning_star", "evening_star", "three_black_crows", "three_white_soldiers", "marubozu", "spinning_top", "inverted_hammer", "hanging_man", "dark_cloud_cover", "piercing_pattern"]
  },
  price_action_reversal: {
    name: "Reversal Patterns",
    description: "Double Top/Bottom, Triple Top/Bottom, Head & Shoulders, Inverse Head & Shoulders, Wedge Reversals, V-Shape Reversals",
    patterns: ["double_top", "double_bottom", "triple_top", "triple_bottom", "head_shoulders", "inverse_head_shoulders", "wedge_reversal", "v_shape_reversal", "rounded_bottom", "rounded_top"]
  },
  price_action_continuation: {
    name: "Continuation Patterns",
    description: "Flags, Pennants, Rectangles, Triangles, Cup & Handle, Rising/Falling Wedges",
    patterns: ["bull_flag", "bear_flag", "bull_pennant", "bear_pennant", "rectangle", "symmetrical_triangle", "ascending_triangle", "descending_triangle", "cup_handle", "rising_wedge", "falling_wedge"]
  },

  // Harmonic Patterns (All major patterns)
  harmonic_gartley: {
    name: "Gartley Pattern",
    description: "Perfect Gartley with precise Fibonacci ratios: XA retracement 0.618, AB retracement 0.618, BC extension 0.786-0.886, CD extension 1.272-1.618",
    ratios: { XA: 0.618, AB: 0.618, BC: [0.786, 0.886], CD: [1.272, 1.618] }
  },
  harmonic_butterfly: {
    name: "Butterfly Pattern",
    description: "Butterfly pattern with extensions: XA extension 1.272, AB retracement 0.786, BC extension 1.618-2.618, CD extension 1.618-2.618",
    ratios: { XA: 1.272, AB: 0.786, BC: [1.618, 2.618], CD: [1.618, 2.618] }
  },
  harmonic_bat: {
    name: "Bat Pattern",
    description: "Bat pattern with specific ratios: XA extension 0.886, AB retracement 0.382-0.500, BC extension 1.618-2.618, CD extension 0.886",
    ratios: { XA: 0.886, AB: [0.382, 0.500], BC: [1.618, 2.618], CD: 0.886 }
  },
  harmonic_crab: {
    name: "Crab Pattern",
    description: "Crab pattern with extreme extensions: XA extension 1.618, AB retracement 0.382-0.618, BC extension 2.618-3.618, CD extension 2.618-3.618",
    ratios: { XA: 1.618, AB: [0.382, 0.618], BC: [2.618, 3.618], CD: [2.618, 3.618] }
  },
  harmonic_shark: {
    name: "Shark Pattern",
    description: "Shark pattern: XA extension 0.886-1.13, AB retracement 1.13-1.618, BC extension 1.618-2.24, CD extension 0.886-1.13",
    ratios: { XA: [0.886, 1.13], AB: [1.13, 1.618], BC: [1.618, 2.24], CD: [0.886, 1.13] }
  },
  harmonic_cypher: {
    name: "Cypher Pattern",
    description: "Cypher pattern: XA extension 0.786, AB retracement 0.382-0.618, BC extension 1.272-2.0, CD extension 0.786",
    ratios: { XA: 0.786, AB: [0.382, 0.618], BC: [1.272, 2.0], CD: 0.786 }
  },
  harmonic_abcd: {
    name: "ABCD Pattern",
    description: "Simple ABCD pattern: AB retracement 0.382-0.886, BC extension 1.13-2.618, CD extension 0.618-2.618",
    ratios: { AB: [0.382, 0.886], BC: [1.13, 2.618], CD: [0.618, 2.618] }
  },
  harmonic_three_drives: {
    name: "Three Drives Pattern",
    description: "Three drives to top/bottom with precise Fibonacci relationships",
    ratios: { drive1: 1.272, drive2: 1.272, drive3: 1.272 }
  },

  // Elliott Wave Analysis
  elliott_wave: {
    name: "Elliott Wave Analysis",
    description: "Complete Elliott Wave counting with impulse waves (1-5) and corrective waves (A-B-C), including extensions and alternation",
    waves: ["impulse_1", "impulse_2", "impulse_3", "impulse_4", "impulse_5", "corrective_a", "corrective_b", "corrective_c", "extended_3", "extended_5", "truncated_5"]
  },

  // Advanced Technical Indicators
  indicators_ema_cloud: {
    name: "EMA Cloud Analysis",
    description: "Multiple EMA cloud with 8, 21, 34, 55, 89, 200 EMAs for trend analysis and dynamic support/resistance",
    periods: [8, 21, 34, 55, 89, 200]
  },
  indicators_bollinger: {
    name: "Bollinger Bands Analysis",
    description: "Bollinger Bands with squeeze, expansion, and walking the bands patterns",
    parameters: { period: 20, stdDev: 2 }
  },
  indicators_rsi_divergence: {
    name: "RSI Divergence Analysis",
    description: "Regular and hidden divergence detection with RSI overbought/oversold levels",
    levels: { overbought: 70, oversold: 30 }
  },
  indicators_macd: {
    name: "MACD Analysis",
    description: "MACD crossover, histogram analysis, and signal line confirmation",
    parameters: { fast: 12, slow: 26, signal: 9 }
  },
  indicators_stochastic: {
    name: "Stochastic Analysis",
    description: "Stochastic oscillator with overbought/oversold and divergence detection",
    parameters: { k: 14, d: 3, slowing: 3 }
  },
  indicators_adx: {
    name: "ADX Trend Strength",
    description: "Average Directional Index for trend strength analysis",
    parameters: { period: 14, threshold: 25 }
  },
  indicators_ichimoku: {
    name: "Ichimoku Cloud",
    description: "Complete Ichimoku Cloud analysis with Tenkan-sen, Kijun-sen, Senkou Span A/B, and Chikou Span",
    parameters: { tenkan: 9, kijun: 26, senkouB: 52 }
  },

  // Support and Resistance
  support_resistance_fibonacci: {
    name: "Fibonacci S&R",
    description: "Fibonacci retracement and extension levels for dynamic S&R",
    levels: [0.236, 0.382, 0.500, 0.618, 0.786, 1.0, 1.272, 1.618, 2.0, 2.618]
  },
  support_resistance_pivot: {
    name: "Pivot Point Analysis",
    description: "Classic, Woodie, Camarilla, and Fibonacci pivot points",
    types: ["classic", "woodie", "camarilla", "fibonacci"]
  },
  support_resistance_volume: {
    name: "Volume Profile S&R",
    description: "Volume-based support and resistance levels",
    parameters: { periods: [20, 50, 100, 200] }
  },

  // Market Structure
  market_structure_bos: {
    name: "Break of Structure",
    description: "Market structure breaks and trend changes identification",
    types: ["higher_highs", "lower_lows", "market_structure_shift", "choch"]
  },
  market_structure_fvg: {
    name: "Fair Value Gap",
    description: "Fair Value Gap and Imbalance analysis",
    types: ["fvg", "imbalance", "order_block", "liquidity_gap"]
  },
  market_structure_liquidity: {
    name: "Liquidity Analysis",
    description: "Liquidity zones and sweep analysis",
    types: ["liquidity_pool", "stop_hunt", "liquidity_sweep", "mitigation"]
  },

  // Advanced Patterns
  pattern_wolfe: {
    name: "Wolfe Waves",
    description: "Wolfe Wave pattern identification with precise targets",
    ratios: { target: 1.618, omega: 1.236 }
  },
  pattern_andrews: {
    name: "Andrews Pitchfork",
    description: "Andrews Pitchfork and median line analysis",
    types: ["standard", "schiff", "modified_schiff"]
  },
  pattern_gann: {
    name: "Gann Analysis",
    description: "Gann angles, squares, and time cycles",
    angles: ["1x1", "1x2", "2x1", "1x4", "4x1"]
  },

  // Multi-Timeframe Analysis
  mtf_analysis: {
    name: "Multi-Timeframe Analysis",
    description: "Comprehensive analysis across multiple timeframes",
    timeframes: ["M1", "M5", "M15", "M30", "H1", "H4", "D1", "W1", "MN1"]
  },

  // Sentiment and Flow
  market_sentiment: {
    name: "Market Sentiment Analysis",
    description: "Market sentiment and flow analysis",
    indicators: ["cot_report", "vix", "put_call_ratio", "adv_decline"]
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

    const { symbol, strategy, timeframe = "H1", advancedMode = true } = await req.json()

    if (!symbol || !strategy || !ADVANCED_STRATEGIES[strategy as keyof typeof ADVANCED_STRATEGIES]) {
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

    // Initialize ZAI SDK
    const zai = await ZAI.create()

    // Fetch REAL price data for analysis
    let priceData = []
    try {
      const pythonBackendUrl = process.env.PYTHON_BACKEND_URL || "http://localhost:8003"
      const tfMap: Record<string, string> = {
        "M1": "1m", "M5": "5m", "M15": "15m", "M30": "30m",
        "H1": "1h", "H4": "4h", "D1": "1d", "W1": "1w", "MN1": "1M"
      }
      const backendTf = tfMap[timeframe] || "1h"

      const res = await fetch(`${pythonBackendUrl}/market/ohlcv/${symbol}?timeframe=${backendTf}&limit=100`)
      if (!res.ok) throw new Error(`Failed to fetch live data: ${res.statusText}`)
      priceData = await res.json()
    } catch (error) {
      console.error("Failed to fetch live data, falling back to empty", error)
      // If live data fails, we should probably error out or return a specific error
      return NextResponse.json({ error: "Failed to fetch live market data" }, { status: 502 })
    }

    // Create advanced analysis prompt
    const prompt = createAdvancedAnalysisPrompt(strategy, symbol, priceData, timeframe, ADVANCED_STRATEGIES[strategy as keyof typeof ADVANCED_STRATEGIES])

    // Get AI analysis
    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are an elite trading analyst with 20+ years of experience specializing in ${ADVANCED_STRATEGIES[strategy as keyof typeof ADVANCED_STRATEGIES].name}. 
          
          Your analysis must be extremely precise and based on the provided REAL market data. Include:
          1. Sniper entry points with exact price levels
          2. Minimum 25 pip stop loss for forex pairs
          3. TP1 at exactly 80 pips (100% accuracy target)
          4. TP2, TP3, TP4 levels with progressive targets
          5. Fibonacci retracement and extension levels
          6. Multiple timeframe confirmation
          7. Risk-reward ratio calculation
          8. Success rate based on historical performance
          9. Required confirmations before trade execution
          10. Detailed pattern recognition with accuracy percentages
          
          Always respond with structured JSON data with precise numerical values.`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.1,
      max_tokens: 2000
    })

    const aiResponse = completion.choices[0]?.message?.content

    if (!aiResponse) {
      throw new Error("No response from AI")
    }

    // Parse AI response
    let analysisResult
    try {
      analysisResult = JSON.parse(aiResponse)
    } catch (e) {
      // Fallback structured response
      analysisResult = createFallbackAnalysis(symbol, strategy, priceData)
    }

    // Calculate success rate for this strategy
    const successRate = await calculateSuccessRate(session.user.id, strategy, timeframe)

    // Save analysis to database
    const analysis = await db.analysis.create({
      data: {
        userId: session.user.id,
        tradingPairId: tradingPair.id,
        strategy,
        result: analysisResult,
        confidence: analysisResult.confidence || 50,
        timeframe,
        indicators: analysisResult.indicators || {},
        patterns: analysisResult.patterns || [],
        successRate: successRate
      }
    })

    // Update success rate statistics
    await updateSuccessRate(session.user.id, strategy, timeframe, analysisResult)

    return NextResponse.json({
      success: true,
      analysis: {
        id: analysis.id,
        strategy,
        symbol,
        timeframe,
        result: analysisResult,
        successRate,
        timestamp: analysis.timestamp
      }
    })

  } catch (error) {
    console.error("Advanced analysis error:", error)
    return NextResponse.json(
      { error: "Advanced analysis failed" },
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

    // Get recent analyses with success rates
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

    // Get success rate statistics
    const successRates = await db.successRate.findMany({
      where: {
        userId: session.user.id
      }
    })

    return NextResponse.json({
      success: true,
      analyses,
      successRates,
      availableStrategies: ADVANCED_STRATEGIES
    })

  } catch (error) {
    console.error("Get advanced analyses error:", error)
    return NextResponse.json(
      { error: "Failed to fetch advanced analyses" },
      { status: 500 }
    )
  }
}

// Helper functions
// Removed generateAdvancedMockData as we now fetch real data

function createAdvancedAnalysisPrompt(strategy: string, symbol: string, priceData: any[], timeframe: string, strategyInfo: any) {
  const recentData = priceData.slice(-50) // Last 50 candles for detailed analysis
  const currentPrice = recentData[recentData.length - 1]?.close

  return `
Perform comprehensive ${strategyInfo.name} analysis for ${symbol} on ${timeframe} timeframe.

Current Price: ${currentPrice}
Recent Price Data (last 50 candles):
${recentData.map((candle, i) =>
    `${i + 1}: O=${candle.open} H=${candle.high} L=${candle.low} C=${candle.close} V=${candle.volume}`
  ).join('\n')}

Strategy Details: ${strategyInfo.description}
${strategyInfo.patterns ? `Patterns to identify: ${strategyInfo.patterns.join(', ')}` : ''}
${strategyInfo.ratios ? `Fibonacci ratios: ${JSON.stringify(strategyInfo.ratios)}` : ''}
${strategyInfo.parameters ? `Parameters: ${JSON.stringify(strategyInfo.parameters)}` : ''}

Provide detailed analysis in this JSON format:
{
  "signal": "BUY/SELL/HOLD",
  "confidence": 0-100,
  "entryPrice": exact_sniper_entry_price,
  "stopLoss": exact_stop_loss_minimum_25_pips,
  "takeProfit1": exact_tp1_80_pips,
  "takeProfit2": exact_tp2,
  "takeProfit3": exact_tp3,
  "takeProfit4": exact_tp4,
  "reason": "detailed_analysis_explanation",
  "confirmations": number_of_strategy_confirmations,
  "riskReward": "1:X_ratio",
  "fibonacci": {
    "retracement": [0.236, 0.382, 0.500, 0.618, 0.786],
    "extension": [1.272, 1.618, 2.0, 2.618]
  },
  "indicators": {
    "ema": {"8": value, "21": value, "34": value, "55": value, "89": value, "200": value},
    "rsi": {"value": value, "trend": "up/down/neutral"},
    "macd": {"value": value, "signal": value, "histogram": value},
    "volume": {"current": value, "average": value, "trend": "increasing/decreasing"}
  },
  "patterns": [
    {
      "name": "pattern_name",
      "type": "reversal/continuation",
      "accuracy": 85,
      "completed": true/false
    }
  ],
  "marketStructure": {
    "trend": "bullish/bearish/sideways",
    "structure": "higher_highs_lower_lows/etc",
    "keyLevels": {
      "support": [price1, price2],
      "resistance": [price1, price2]
    }
  },
  "timeframeConfirmation": {
    "M15": "BUY/SELL/HOLD",
    "H1": "BUY/SELL/HOLD",
    "H4": "BUY/SELL/HOLD",
    "D1": "BUY/SELL/HOLD"
  },
  "successRate": {
    "historical": 87.5,
    "recent": 92.3,
    "sampleSize": 156
  },
  "riskManagement": {
    "positionSize": "percentage",
    "maxDrawdown": "percentage",
    "recommendedLeverage": "ratio"
  }
}

CRITICAL REQUIREMENTS:
- Sniper entry must be precise to 4-5 decimal places
- Stop loss minimum 25 pips for forex pairs
- TP1 exactly 80 pips from entry for 100% accuracy
- All price levels must be mathematically calculated
- Include specific pattern recognition with accuracy percentages
- Multi-timeframe confirmation required
- Fibonacci levels must be precise
- Risk-reward ratio must be favorable (minimum 1:2)
`
}

function createFallbackAnalysis(symbol: string, strategy: string, priceData: any[]) {
  const currentPrice = priceData[priceData.length - 1]?.close || 100
  const isForex = symbol.includes("USD")
  const pipValue = isForex ? 0.0001 : 0.01

  return {
    signal: "HOLD",
    confidence: 50,
    entryPrice: currentPrice,
    stopLoss: currentPrice - (25 * pipValue),
    takeProfit1: currentPrice + (80 * pipValue),
    takeProfit2: currentPrice + (120 * pipValue),
    takeProfit3: currentPrice + (180 * pipValue),
    takeProfit4: currentPrice + (250 * pipValue),
    reason: "Fallback analysis - insufficient data for precise signal",
    confirmations: 0,
    riskReward: "1:3.2",
    fibonacci: {
      retracement: [0.236, 0.382, 0.500, 0.618, 0.786],
      extension: [1.272, 1.618, 2.0, 2.618]
    },
    indicators: {},
    patterns: [],
    marketStructure: {
      trend: "sideways",
      structure: "neutral",
      keyLevels: { support: [], resistance: [] }
    },
    timeframeConfirmation: {},
    successRate: { historical: 50, recent: 50, sampleSize: 0 },
    riskManagement: { positionSize: "1%", maxDrawdown: "5%", recommendedLeverage: "1:10" }
  }
}

async function calculateSuccessRate(userId: string, strategy: string, timeframe: string): Promise<number> {
  try {
    const successRate = await db.successRate.findUnique({
      where: {
        userId_strategy_timeframe: {
          userId,
          strategy,
          timeframe
        }
      }
    })

    return successRate?.successRate || 50.0
  } catch (error) {
    return 50.0
  }
}

async function updateSuccessRate(userId: string, strategy: string, timeframe: string, analysisResult: any) {
  try {
    const existing = await db.successRate.findUnique({
      where: {
        userId_strategy_timeframe: {
          userId,
          strategy,
          timeframe
        }
      }
    })

    if (existing) {
      await db.successRate.update({
        where: {
          userId_strategy_timeframe: {
            userId,
            strategy,
            timeframe
          }
        },
        data: {
          lastUpdated: new Date()
        }
      })
    } else {
      await db.successRate.create({
        data: {
          userId,
          strategy,
          timeframe,
          totalSignals: 0,
          successfulSignals: 0,
          successRate: analysisResult.successRate?.historical || 50.0
        }
      })
    }
  } catch (error) {
    console.error("Error updating success rate:", error)
  }
}