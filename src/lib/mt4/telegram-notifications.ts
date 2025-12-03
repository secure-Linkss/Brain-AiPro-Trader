// Telegram Notification Service - PRODUCTION READY

import { db } from '@/lib/db'

interface TelegramMessage {
    userId: string
    message: string
    parseMode?: 'HTML' | 'Markdown'
    disablePreview?: boolean
}

/**
 * Send Telegram message to user
 */
async function sendTelegramMessage(params: TelegramMessage): Promise<boolean> {
    try {
        const user = await db.user.findUnique({
            where: { id: params.userId },
            select: {
                telegramChatId: true,
                telegramEnabled: true,
                telegramConfig: true
            }
        })

        if (!user?.telegramEnabled || !user.telegramChatId) {
            console.log(`Telegram not enabled for user ${params.userId}`)
            return false
        }

        const botToken = process.env.TELEGRAM_BOT_TOKEN
        if (!botToken) {
            console.error('TELEGRAM_BOT_TOKEN not configured')
            return false
        }

        const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: user.telegramChatId,
                text: params.message,
                parse_mode: params.parseMode || 'HTML',
                disable_web_page_preview: params.disablePreview !== false
            })
        })

        const data = await response.json()

        if (!data.ok) {
            console.error('Telegram API error:', data)
            return false
        }

        return true
    } catch (error) {
        console.error('Send Telegram message error:', error)
        return false
    }
}

/**
 * Send new signal notification
 */
export async function sendNewSignalNotification(signalId: string): Promise<void> {
    const signal = await db.signal.findUnique({
        where: { id: signalId },
        include: {
            tradingPair: true,
            user: true
        }
    })

    if (!signal) return

    const emoji = signal.type === 'BUY' ? '🟢' : '🔴'
    const direction = signal.type === 'BUY' ? '📈 LONG' : '📉 SHORT'

    const message = `
${emoji} <b>NEW ${direction} SIGNAL</b>

💱 <b>Pair:</b> ${signal.tradingPair.symbol}
📊 <b>Strategy:</b> ${signal.strategy.replace(/_/g, ' ').toUpperCase()}
💪 <b>Strength:</b> ${signal.strength.toFixed(1)}%

💰 <b>Entry:</b> ${signal.entryPrice?.toFixed(5) || 'Market'}
🛑 <b>Stop Loss:</b> ${signal.stopLoss?.toFixed(5) || 'N/A'}

🎯 <b>Take Profits:</b>
  TP1: ${signal.takeProfit1?.toFixed(5) || 'N/A'}
  TP2: ${signal.takeProfit2?.toFixed(5) || 'N/A'}
  TP3: ${signal.takeProfit3?.toFixed(5) || 'N/A'}
  TP4: ${signal.takeProfit4?.toFixed(5) || 'N/A'}

📈 <b>R:R Ratio:</b> ${signal.riskReward || 'Calculating...'}
⏰ <b>Timeframe:</b> ${signal.timeframe || 'Multiple'}

${signal.reason ? `\n💡 <b>Analysis:</b>\n${signal.reason}` : ''}

<i>Signal generated at ${new Date().toLocaleString('en-GB', { timeZone: 'Europe/London' })} GMT</i>
  `.trim()

    const sent = await sendTelegramMessage({
        userId: signal.userId,
        message,
        parseMode: 'HTML'
    })

    // Log notification
    await db.signalNotification.create({
        data: {
            userId: signal.userId,
            signalId: signal.id,
            type: 'new_signal',
            message,
            telegramSent: sent,
            telegramSentAt: sent ? new Date() : null,
            telegramError: sent ? null : 'Failed to send'
        }
    })
}

/**
 * Send trailing stop update notification
 */
export async function sendTrailingUpdateNotification(
    tradeId: string,
    oldSL: number,
    newSL: number,
    reason: string
): Promise<void> {
    const trade = await db.mT4Trade.findUnique({
        where: { id: tradeId },
        include: {
            connection: {
                include: {
                    user: true,
                    trailingConfig: true
                }
            }
        }
    })

    if (!trade || !trade.connection.trailingConfig?.sendTrailingAlerts) return

    const slMove = Math.abs(newSL - oldSL)
    const slMovePips = trade.symbol.toUpperCase().includes('JPY')
        ? slMove * 100
        : slMove * 10000

    const message = `
🔄 <b>TRAILING STOP UPDATED</b>

💱 <b>Pair:</b> ${trade.symbol}
🎫 <b>Ticket:</b> #${trade.ticket.toString()}
${trade.type === 'buy' ? '📈' : '📉'} <b>Type:</b> ${trade.type.toUpperCase()}

📊 <b>Stop Loss Moved:</b>
  Old SL: ${oldSL.toFixed(5)}
  New SL: ${newSL.toFixed(5)}
  Move: ${slMovePips.toFixed(1)} pips

🎯 <b>Reason:</b> ${reason.replace(/_/g, ' ').toUpperCase()}

💰 <b>Current Profit:</b> $${trade.profit.toFixed(2)}
📈 <b>Trail Count:</b> ${trade.trailCount + 1}

<i>Updated at ${new Date().toLocaleString('en-GB', { timeZone: 'Europe/London' })} GMT</i>
  `.trim()

    const sent = await sendTelegramMessage({
        userId: trade.connection.userId,
        message,
        parseMode: 'HTML'
    })

    await db.signalNotification.create({
        data: {
            userId: trade.connection.userId,
            tradeId: trade.id,
            type: 'trailing_update',
            message,
            telegramSent: sent,
            telegramSentAt: sent ? new Date() : null
        }
    })
}

/**
 * Send breakeven hit notification
 */
export async function sendBreakevenNotification(tradeId: string): Promise<void> {
    const trade = await db.mT4Trade.findUnique({
        where: { id: tradeId },
        include: {
            connection: {
                include: {
                    user: true,
                    trailingConfig: true
                }
            }
        }
    })

    if (!trade || !trade.connection.trailingConfig?.alertOnBreakEven) return

    const message = `
✅ <b>BREAKEVEN ACTIVATED</b>

💱 <b>Pair:</b> ${trade.symbol}
🎫 <b>Ticket:</b> #${trade.ticket.toString()}
${trade.type === 'buy' ? '📈' : '📉'} <b>Type:</b> ${trade.type.toUpperCase()}

🎯 <b>Stop Loss moved to Entry + Padding</b>
  Entry: ${trade.entryPrice.toFixed(5)}
  New SL: ${trade.stopLoss?.toFixed(5) || 'N/A'}

💰 <b>Current Profit:</b> $${trade.profit.toFixed(2)}

🔒 <b>Trade is now risk-free!</b>

<i>Activated at ${new Date().toLocaleString('en-GB', { timeZone: 'Europe/London' })} GMT</i>
  `.trim()

    const sent = await sendTelegramMessage({
        userId: trade.connection.userId,
        message,
        parseMode: 'HTML'
    })

    await db.signalNotification.create({
        data: {
            userId: trade.connection.userId,
            tradeId: trade.id,
            type: 'breakeven_hit',
            message,
            telegramSent: sent,
            telegramSentAt: sent ? new Date() : null
        }
    })
}

/**
 * Send TP hit notification
 */
export async function sendTPHitNotification(
    tradeId: string,
    tpLevel: number,
    price: number
): Promise<void> {
    const trade = await db.mT4Trade.findUnique({
        where: { id: tradeId },
        include: {
            connection: {
                include: { user: true }
            }
        }
    })

    if (!trade) return

    const message = `
🎯 <b>TAKE PROFIT ${tpLevel} HIT!</b>

💱 <b>Pair:</b> ${trade.symbol}
🎫 <b>Ticket:</b> #${trade.ticket.toString()}
${trade.type === 'buy' ? '📈' : '📉'} <b>Type:</b> ${trade.type.toUpperCase()}

💰 <b>TP${tpLevel} Price:</b> ${price.toFixed(5)}
📊 <b>Entry Price:</b> ${trade.entryPrice.toFixed(5)}

💵 <b>Current Profit:</b> $${trade.profit.toFixed(2)}
📈 <b>Lot Size:</b> ${trade.lots}

${tpLevel < 4 ? '🔄 <b>Remaining position still active</b>' : '✅ <b>Final TP reached!</b>'}

<i>Hit at ${new Date().toLocaleString('en-GB', { timeZone: 'Europe/London' })} GMT</i>
  `.trim()

    const sent = await sendTelegramMessage({
        userId: trade.connection.userId,
        message,
        parseMode: 'HTML'
    })

    await db.signalNotification.create({
        data: {
            userId: trade.connection.userId,
            tradeId: trade.id,
            type: 'tp_hit',
            message,
            telegramSent: sent,
            telegramSentAt: sent ? new Date() : null
        }
    })
}

/**
 * Send SL hit notification
 */
export async function sendSLHitNotification(tradeId: string): Promise<void> {
    const trade = await db.mT4Trade.findUnique({
        where: { id: tradeId },
        include: {
            connection: {
                include: { user: true }
            }
        }
    })

    if (!trade) return

    const wasTrailing = trade.trailingActive
    const profitLoss = trade.profit

    const message = `
${profitLoss >= 0 ? '✅' : '🛑'} <b>STOP LOSS HIT</b>

💱 <b>Pair:</b> ${trade.symbol}
🎫 <b>Ticket:</b> #${trade.ticket.toString()}
${trade.type === 'buy' ? '📈' : '📉'} <b>Type:</b> ${trade.type.toUpperCase()}

🛑 <b>SL Price:</b> ${trade.stopLoss?.toFixed(5) || 'N/A'}
📊 <b>Entry Price:</b> ${trade.entryPrice.toFixed(5)}
📊 <b>Close Price:</b> ${trade.closePrice?.toFixed(5) || 'N/A'}

💵 <b>Final P/L:</b> ${profitLoss >= 0 ? '+' : ''}$${profitLoss.toFixed(2)}
📈 <b>Lot Size:</b> ${trade.lots}

${wasTrailing ? '🔄 <b>Trailing Stop</b> - SL was moved ' + trade.trailCount + ' times' : ''}
${profitLoss >= 0 ? '✅ <b>Closed in profit!</b>' : '⚠️ <b>Loss taken</b>'}

<i>Closed at ${new Date().toLocaleString('en-GB', { timeZone: 'Europe/London' })} GMT</i>
  `.trim()

    const sent = await sendTelegramMessage({
        userId: trade.connection.userId,
        message,
        parseMode: 'HTML'
    })

    await db.signalNotification.create({
        data: {
            userId: trade.connection.userId,
            tradeId: trade.id,
            type: 'sl_hit',
            message,
            telegramSent: sent,
            telegramSentAt: sent ? new Date() : null
        }
    })
}

/**
 * Send connection status notification
 */
export async function sendConnectionStatusNotification(
    connectionId: string,
    status: 'connected' | 'disconnected' | 'error'
): Promise<void> {
    const connection = await db.mT4Connection.findUnique({
        where: { id: connectionId },
        include: { user: true }
    })

    if (!connection) return

    const emoji = status === 'connected' ? '✅' : status === 'disconnected' ? '⚠️' : '❌'
    const statusText = status === 'connected' ? 'CONNECTED' : status === 'disconnected' ? 'DISCONNECTED' : 'ERROR'

    const message = `
${emoji} <b>MT4/MT5 ${statusText}</b>

💻 <b>Account:</b> #${connection.accountNumber.toString()}
🖥️ <b>Platform:</b> ${connection.platform}
🏦 <b>Broker:</b> ${connection.brokerName || 'Unknown'}

${status === 'connected' ? `
✅ <b>Connection established</b>
💰 <b>Balance:</b> $${connection.balance.toFixed(2)}
📊 <b>Equity:</b> $${connection.equity.toFixed(2)}
` : status === 'disconnected' ? `
⚠️ <b>Connection lost</b>
Please check your MT4/MT5 terminal and EA
` : `
❌ <b>Connection error</b>
Please verify your API key and EA settings
`}

<i>${new Date().toLocaleString('en-GB', { timeZone: 'Europe/London' })} GMT</i>
  `.trim()

    await sendTelegramMessage({
        userId: connection.userId,
        message,
        parseMode: 'HTML'
    })
}
