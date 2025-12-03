// Signal to Trade Instruction Converter

import { db } from '@/lib/db'
import { calculateTrade, validateTrade, type RiskSettings } from './risk-calculator'

export interface SignalData {
    id: string
    symbol: string
    type: string // "BUY" or "SELL"
    entryPrice: number | null
    stopLoss: number | null
    takeProfit1: number | null
    takeProfit2: number | null
    takeProfit3: number | null
    takeProfit4: number | null
}

/**
 * Process a signal and create trade instructions for all active MT4 connections
 */
export async function processSignalForMT4(signalId: string): Promise<void> {
    // Get signal
    const signal = await db.signal.findUnique({
        where: { id: signalId },
        include: {
            tradingPair: true
        }
    })

    if (!signal || !signal.entryPrice || !signal.stopLoss) {
        console.log('Signal missing required data:', signalId)
        return
    }

    // Get all active MT4 connections
    const connections = await db.mT4Connection.findMany({
        where: {
            status: 'active',
            isOnline: true
        },
        include: {
            user: {
                include: {
                    subscription: {
                        include: { plan: true }
                    }
                }
            },
            trades: {
                where: { status: 'open' }
            }
        }
    })

    console.log(`Processing signal ${signalId} for ${connections.length} connections`)

    for (const connection of connections) {
        try {
            // Build risk settings
            const riskSettings: RiskSettings = {
                riskPercent: connection.riskPercent,
                maxLot: connection.maxLot,
                maxOpenTrades: connection.maxOpenTrades,
                dailyLossLimit: connection.dailyLossLimit,
                allowBuy: connection.allowBuy,
                allowSell: connection.allowSell,
                stopAfterMaxLoss: connection.stopAfterMaxLoss
            }

            // Calculate daily loss
            const today = new Date()
            today.setHours(0, 0, 0, 0)

            const todayTrades = await db.mT4Trade.findMany({
                where: {
                    connectionId: connection.id,
                    closeTime: {
                        gte: today
                    },
                    status: 'closed'
                }
            })

            const dailyLoss = todayTrades.reduce((sum, trade) => {
                return sum + (trade.profit < 0 ? Math.abs(trade.profit) : 0)
            }, 0)

            const dailyLossPercent = (dailyLoss / connection.equity) * 100

            // Validate trade
            const validation = validateTrade(
                signal.type.toLowerCase() as 'buy' | 'sell',
                riskSettings,
                connection.trades.length,
                dailyLossPercent
            )

            if (!validation.allowed) {
                console.log(`Trade not allowed for connection ${connection.id}: ${validation.reason}`)
                continue
            }

            // Calculate trade parameters
            const calculatedTrade = calculateTrade({
                symbol: signal.tradingPair.symbol,
                type: signal.type.toLowerCase() as 'buy' | 'sell',
                entryPrice: signal.entryPrice,
                stopLoss: signal.stopLoss,
                takeProfit: signal.takeProfit1 || undefined,
                equity: connection.equity,
                riskSettings
            })

            // Use signal's TP levels if available, otherwise use calculated
            const tp1 = signal.takeProfit1 || calculatedTrade.tp1
            const tp2 = signal.takeProfit2 || calculatedTrade.tp2
            const tp3 = signal.takeProfit3 || calculatedTrade.tp3
            const tp4 = signal.takeProfit4 || calculatedTrade.tp4

            // Create trade instruction
            await db.tradeInstruction.create({
                data: {
                    userId: connection.userId,
                    connectionId: connection.id,
                    action: 'open',
                    symbol: signal.tradingPair.symbol,
                    type: signal.type.toLowerCase(),
                    lot: calculatedTrade.lot,
                    stopLoss: signal.stopLoss,
                    takeProfit: tp4, // Use TP4 as main TP
                    tp1: connection.tp1Enabled ? tp1 : null,
                    tp2: connection.tp2Enabled ? tp2 : null,
                    tp3: connection.tp3Enabled ? tp3 : null,
                    tp4: connection.tp4Enabled ? tp4 : null,
                    status: 'pending',
                    priority: 10 // High priority for new signals
                }
            })

            console.log(`Created trade instruction for connection ${connection.id}`)
        } catch (error) {
            console.error(`Error processing signal for connection ${connection.id}:`, error)
        }
    }
}

/**
 * Process breakeven for a trade
 */
export async function processBreakeven(tradeId: string): Promise<void> {
    const trade = await db.mT4Trade.findUnique({
        where: { id: tradeId },
        include: {
            connection: true
        }
    })

    if (!trade || trade.breakEvenHit || !trade.connection.breakEvenEnabled) {
        return
    }

    // Calculate breakeven SL
    const pipSize = trade.symbol.toUpperCase().includes('JPY') ? 0.01 : 0.0001
    const paddingDistance = trade.connection.breakEvenPadding * pipSize

    let breakEvenSL: number
    if (trade.type === 'buy') {
        breakEvenSL = trade.entryPrice + paddingDistance
    } else {
        breakEvenSL = trade.entryPrice - paddingDistance
    }

    // Create breakeven instruction
    await db.tradeInstruction.create({
        data: {
            userId: trade.connection.userId,
            connectionId: trade.connectionId,
            action: 'breakeven',
            ticket: trade.ticket,
            stopLoss: breakEvenSL,
            status: 'pending',
            priority: 15 // Higher priority than regular modifications
        }
    })

    // Mark trade as breakeven hit
    await db.mT4Trade.update({
        where: { id: tradeId },
        data: {
            breakEvenHit: true,
            breakEvenTime: new Date()
        }
    })

    console.log(`Breakeven instruction created for trade ${trade.ticket}`)
}

/**
 * Process trailing stop for a trade
 */
export async function processTrailingStop(
    tradeId: string,
    newSL: number,
    reason: string
): Promise<void> {
    const trade = await db.mT4Trade.findUnique({
        where: { id: tradeId },
        include: { connection: true }
    })

    if (!trade) return

    // Create trailing instruction
    await db.tradeInstruction.create({
        data: {
            userId: trade.connection.userId,
            connectionId: trade.connectionId,
            action: 'trail',
            ticket: trade.ticket,
            stopLoss: newSL,
            status: 'pending',
            priority: 12 // Medium-high priority
        }
    })

    // Log trailing event
    await db.trailingLog.create({
        data: {
            tradeId: trade.id,
            oldSL: trade.stopLoss || 0,
            newSL,
            reason,
            timestamp: new Date()
        }
    })

    // Update trade
    await db.mT4Trade.update({
        where: { id: tradeId },
        data: {
            stopLoss: newSL,
            trailCount: trade.trailCount + 1,
            lastTrailTime: new Date(),
            trailingActive: true
        }
    })

    console.log(`Trailing stop instruction created for trade ${trade.ticket}: ${reason}`)
}

/**
 * Check and process TP hits
 */
export async function checkTPHits(tradeId: string, currentPrice: number): Promise<void> {
    const trade = await db.mT4Trade.findUnique({
        where: { id: tradeId }
    })

    if (!trade) return

    const isBuy = trade.type === 'buy'
    let tpHit = false

    // Check TP1
    if (!trade.tp1Hit && trade.tp1) {
        if ((isBuy && currentPrice >= trade.tp1) || (!isBuy && currentPrice <= trade.tp1)) {
            await db.mT4Trade.update({
                where: { id: tradeId },
                data: { tp1Hit: true, tp1HitTime: new Date() }
            })
            tpHit = true
            console.log(`TP1 hit for trade ${trade.ticket}`)
        }
    }

    // Check TP2
    if (!trade.tp2Hit && trade.tp2) {
        if ((isBuy && currentPrice >= trade.tp2) || (!isBuy && currentPrice <= trade.tp2)) {
            await db.mT4Trade.update({
                where: { id: tradeId },
                data: { tp2Hit: true, tp2HitTime: new Date() }
            })
            tpHit = true
            console.log(`TP2 hit for trade ${trade.ticket}`)
        }
    }

    // Check TP3
    if (!trade.tp3Hit && trade.tp3) {
        if ((isBuy && currentPrice >= trade.tp3) || (!isBuy && currentPrice <= trade.tp3)) {
            await db.mT4Trade.update({
                where: { id: tradeId },
                data: { tp3Hit: true, tp3HitTime: new Date() }
            })
            tpHit = true
            console.log(`TP3 hit for trade ${trade.ticket}`)
        }
    }

    // Check TP4
    if (!trade.tp4Hit && trade.tp4) {
        if ((isBuy && currentPrice >= trade.tp4) || (!isBuy && currentPrice <= trade.tp4)) {
            await db.mT4Trade.update({
                where: { id: tradeId },
                data: { tp4Hit: true, tp4HitTime: new Date() }
            })
            tpHit = true
            console.log(`TP4 hit for trade ${trade.ticket}`)
        }
    }

    // If any TP hit and tighter trailing is enabled, trigger trailing recalculation
    if (tpHit) {
        // This will be picked up by the trailing stop monitor
        console.log(`TP hit detected, trailing will tighten on next check`)
    }
}
