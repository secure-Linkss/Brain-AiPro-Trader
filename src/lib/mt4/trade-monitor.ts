// MT4 Trade Monitor - Background Service
// This monitors all active trades and triggers trailing stops, breakeven, TP checks

import { db } from '@/lib/db'
import { calculateTrailingStop } from './trailing-engine'
import { processBreakeven, processTrailingStop, checkTPHits } from './signal-processor'
import {
    sendTrailingUpdateNotification,
    sendBreakevenNotification,
    sendTPHitNotification,
    sendConnectionStatusNotification
} from './telegram-notifications'
import { shouldTriggerBreakeven } from './risk-calculator'

/**
 * Monitor all active trades and process trailing stops
 */
export async function monitorActiveTrades(): Promise<void> {
    try {
        // Get all active connections
        const connections = await db.mT4Connection.findMany({
            where: {
                status: 'active',
                isOnline: true
            },
            include: {
                trades: {
                    where: { status: 'open' }
                },
                trailingConfig: true
            }
        })

        console.log(`Monitoring ${connections.length} active connections`)

        for (const connection of connections) {
            for (const trade of connection.trades) {
                try {
                    // Get current price (from latest price data)
                    const latestPrice = await db.priceData.findFirst({
                        where: { tradingPairId: trade.symbol },
                        orderBy: { timestamp: 'desc' }
                    })

                    if (!latestPrice) {
                        console.log(`No price data for ${trade.symbol}`)
                        continue
                    }

                    const currentPrice = latestPrice.close

                    // Check TP hits
                    await checkTPHits(trade.id, currentPrice)

                    // Check breakeven trigger
                    if (connection.breakEvenEnabled && !trade.breakEvenHit && trade.stopLoss) {
                        const shouldBE = shouldTriggerBreakeven(
                            currentPrice,
                            trade.entryPrice,
                            trade.stopLoss,
                            trade.type as 'buy' | 'sell',
                            connection.breakEvenTriggerR
                        )

                        if (shouldBE) {
                            await processBreakeven(trade.id)
                            await sendBreakevenNotification(trade.id)
                        }
                    }

                    // Check trailing stop
                    if (connection.trailingConfig?.enabled) {
                        // Get recent candles for structure detection
                        const recentCandles = await db.priceData.findMany({
                            where: { tradingPairId: trade.symbol },
                            orderBy: { timestamp: 'desc' },
                            take: 20
                        })

                        if (recentCandles.length < 3) continue

                        // Calculate ATR
                        const atrValues = recentCandles.map(c => {
                            const high = c.high
                            const low = c.low
                            const prevClose = c.close
                            return Math.max(
                                high - low,
                                Math.abs(high - prevClose),
                                Math.abs(low - prevClose)
                            )
                        })

                        const currentATR = atrValues[0]
                        const averageATR = atrValues.reduce((a, b) => a + b, 0) / atrValues.length

                        // Calculate trailing stop
                        const result = await calculateTrailingStop(
                            trade.id,
                            currentPrice,
                            currentATR,
                            averageATR,
                            recentCandles.map(c => ({
                                high: c.high,
                                low: c.low,
                                close: c.close,
                                atr: currentATR
                            }))
                        )

                        if (result.newSL) {
                            const oldSL = trade.stopLoss || 0
                            await processTrailingStop(trade.id, result.newSL, result.reason)
                            await sendTrailingUpdateNotification(trade.id, oldSL, result.newSL, result.reason)
                        }
                    }
                } catch (error) {
                    console.error(`Error monitoring trade ${trade.ticket}:`, error)
                }
            }
        }
    } catch (error) {
        console.error('Monitor active trades error:', error)
    }
}

/**
 * Check connection health and mark offline connections
 */
export async function monitorConnectionHealth(): Promise<void> {
    try {
        const connections = await db.mT4Connection.findMany({
            where: {
                status: 'active'
            }
        })

        const now = new Date()

        for (const connection of connections) {
            if (!connection.lastHeartbeat) continue

            const minutesSinceHeartbeat = Math.floor(
                (now.getTime() - connection.lastHeartbeat.getTime()) / 1000 / 60
            )

            // Mark as offline if no heartbeat for 5 minutes
            if (minutesSinceHeartbeat > 5 && connection.isOnline) {
                await db.mT4Connection.update({
                    where: { id: connection.id },
                    data: {
                        isOnline: false,
                        connectionQuality: 'offline'
                    }
                })

                await sendConnectionStatusNotification(connection.id, 'disconnected')
                console.log(`Connection ${connection.id} marked offline`)
            }

            // Update connection quality
            let quality = 'offline'
            if (minutesSinceHeartbeat < 1) quality = 'excellent'
            else if (minutesSinceHeartbeat < 3) quality = 'good'
            else if (minutesSinceHeartbeat < 5) quality = 'poor'

            if (quality !== connection.connectionQuality) {
                await db.mT4Connection.update({
                    where: { id: connection.id },
                    data: { connectionQuality: quality }
                })
            }
        }
    } catch (error) {
        console.error('Monitor connection health error:', error)
    }
}

/**
 * Clean up old completed instructions
 */
export async function cleanupOldInstructions(): Promise<void> {
    try {
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)

        const deleted = await db.tradeInstruction.deleteMany({
            where: {
                status: {
                    in: ['executed', 'failed', 'cancelled']
                },
                createdAt: {
                    lt: oneDayAgo
                }
            }
        })

        console.log(`Cleaned up ${deleted.count} old instructions`)
    } catch (error) {
        console.error('Cleanup instructions error:', error)
    }
}

/**
 * Main monitor function - call this from a cron job
 */
export async function runMonitor(): Promise<void> {
    console.log('=== MT4 Monitor Started ===', new Date().toISOString())

    await Promise.all([
        monitorActiveTrades(),
        monitorConnectionHealth(),
        cleanupOldInstructions()
    ])

    console.log('=== MT4 Monitor Completed ===', new Date().toISOString())
}
