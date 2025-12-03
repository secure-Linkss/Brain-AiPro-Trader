import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { signal, symbol, price, stopLoss, takeProfit } = await req.json()

    // Get user's Telegram settings
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        telegramBotId: true,
        telegramChatId: true,
        telegramEnabled: true
      }
    })

    if (!user?.telegramEnabled || !user?.telegramBotId || !user?.telegramChatId) {
      return NextResponse.json(
        { error: "Telegram notifications not configured" },
        { status: 400 }
      )
    }

    // Send Telegram notification
    const message = `🚀 *TradeAI Pro Signal*\\n\\n` +
      `📊 *Pair*: ${symbol}\\n` +
      `${signal === 'BUY' ? '📈' : '📉'} *Signal*: ${signal}\\n\\n` +
      `💰 *Entry*: $${price}\\n` +
      `🛡️ *Stop Loss*: $${stopLoss}\\n` +
      `🎯 *Take Profit*: $${takeProfit}\\n\\n` +
      `⏰ *Time*: ${new Date().toLocaleTimeString()}\\n\\n` +
      `🤖 *AI-Powered by TradeAI Pro*`

    const telegramUrl = `https://api.telegram.org/bot${user.telegramBotId}/sendMessage?chat_id=${user.telegramChatId}&text=${encodeURIComponent(message)}&parse_mode=Markdown`

    const response = await fetch(telegramUrl)
    
    if (!response.ok) {
      console.error("Telegram API error:", await response.text())
      return NextResponse.json(
        { error: "Failed to send Telegram notification" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Telegram notification sent"
    })

  } catch (error) {
    console.error("Telegram notification error:", error)
    return NextResponse.json(
      { error: "Failed to send notification" },
      { status: 500 }
    )
  }
}