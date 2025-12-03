/**
 * Telegram Webhook API
 * Handle incoming updates from Telegram
 */

import { NextRequest, NextResponse } from 'next/server'
import { telegramService } from '@/lib/services/telegram-service'

export async function POST(request: NextRequest) {
  try {
    // Get the bot token from the URL path to support multiple bots
    // URL structure: /api/telegram/webhook?token=<bot_token>
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json({ error: 'Token required' }, { status: 400 })
    }

    const update = await request.json()

    // Process update asynchronously
    telegramService.handleWebhook(token, update).catch(err => {
      console.error('Error processing webhook:', err)
    })

    return NextResponse.json({ ok: true })
  } catch (error: any) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}