import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id || session.user?.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 401 }
      )
    }

    // Get news articles
    const news = await db.news.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    })

    return NextResponse.json({
      success: true,
      news: news.map(article => ({
        id: article.id,
        title: article.title,
        summary: article.summary,
        content: article.content,
        category: article.category,
        impact: article.impact,
        publishedAt: article.publishedAt,
        author: article.author
      }))
    })

  } catch (error) {
    console.error("Get news error:", error)
    return NextResponse.json(
      { error: "Failed to fetch news" },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id || session.user?.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status:  401 }
      )
    }

    const { title, summary, content, category, impact } = await req.json()

    // AI analysis for market impact
    const zai = await ZAI.create()
    
    const analysisPrompt = `
    Analyze the following news content for market impact:
    
    Title: ${title}
    Summary: ${summary}
    Content: ${content.substring(0, 500)}...
    
    Category: ${category}
    
    Please analyze this news and provide:
    1. Market Impact Assessment: (High/Medium/Low)
    2. Trading Signal Recommendation: (Buy/Sell/Hold)
    3. Affected Pairs: (List specific forex/crypto pairs)
    4. Strategy Confidence: (0-100%)
    5. Key Levels: (Support/Resistance levels)
    
    Format your response as JSON with these fields.
    `

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a financial news analysis AI. Analyze the provided news content and determine its potential impact on trading markets."
        },
        {
          role: "user",
          content: analysisPrompt
        }
      ],
      temperature: 0.1,
      max_tokens: 1500
    })

    const aiResponse = completion.choices[0]?.message?.content

    let analysisResult
    try {
      analysisResult = JSON.parse(aiResponse)
    } catch (e) {
      analysisResult = {
        impact: "Medium",
        recommendation: "HOLD",
        affectedPairs: ["EURUSD", "GBPUSD"],
        strategy: "Risk Management",
        confidence: 75,
        keyLevels: {
          support: [1.0850, 1.0900],
          resistance: [1.0950, 1.1000]
        }
      }
    }

    // Save news article and AI analysis
    const newsArticle = await db.news.create({
      data: {
        title,
        summary,
        content,
        category,
        impact: analysisResult.impact,
        author: session.user.name || "TradeAI Pro Team",
        publishedAt: new Date(),
        aiAnalysis: analysisResult
      }
    })

    return NextResponse.json({
      success: true,
      newsArticle
    })

  } catch (error) {
    console.error("News analysis error:", error)
    return NextResponse.json(
      { error: "Failed to analyze news" },
      { status: 500 }
    )
  }
}