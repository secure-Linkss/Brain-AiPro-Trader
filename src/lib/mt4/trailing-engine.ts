// Advanced Trailing Stop Engine

import { db } from '@/lib/db'
import { calculatePips } from './risk-calculator'

export interface TrailingConfig {
    enabled: boolean
    mode: string
    atrPeriod: number
    atrMultiplier: number
    atrSmoothing: boolean
    structureSensitivity: string
    structureMinSwingPips: number
    structureIgnoreWicks: boolean
    breakEvenR: number
    breakEvenPadding: number
    breakEvenAutoEnable: boolean
    trailRStep: number
    minTrailDistancePips: number
    maxPullbackPercent: number
    volatilityFilterEnabled: boolean
    volatilityThreshold: number
    onlyTrailOnCandleClose: boolean
    delayBetweenModsSec: number
    ignoreNoiseUnderPips: number
    tpHitTighterTrailing: boolean
    tighterTrailMultiplier: number
}

export interface TradeData {
    ticket: bigint
    symbol: string
    type: string
    entryPrice: number
    currentPrice: number
    stopLoss: number | null
    originalSL: number | null
    trailCount: number
    lastTrailTime: Date | null
    tp1Hit: boolean
    tp2Hit: boolean
    tp3Hit: boolean
    tp4Hit: boolean
}

export interface PriceData {
    high: number
    low: number
    close: number
    atr?: number
}

/**
 * Calculate ATR-based trailing stop
 */
export function calculateATRTrail(
    trade: TradeData,
    config: TrailingConfig,
    currentATR: number,
    currentPrice: number
): number | null {
    const multiplier = config.atrMultiplier

    // Apply tighter trailing if TP hit
    const effectiveMultiplier = (trade.tp1Hit && config.tpHitTighterTrailing)
        ? multiplier * config.tighterTrailMultiplier
        : multiplier

    const atrDistance = currentATR * effectiveMultiplier

    let newSL: number

    if (trade.type === 'buy') {
        newSL = currentPrice - atrDistance
    } else {
        newSL = currentPrice + atrDistance
    }

    return newSL
}

/**
 * Detect market structure (Higher Lows for buy, Lower Highs for sell)
 */
export function detectStructureLevel(
    trade: TradeData,
    recentCandles: PriceData[],
    config: TrailingConfig
): number | null {
    if (recentCandles.length < 3) return null

    const minSwingPips = config.structureMinSwingPips
    const ignoreWicks = config.structureIgnoreWicks

    if (trade.type === 'buy') {
        // Find most recent higher low
        let lastLow = ignoreWicks ? recentCandles[0].close : recentCandles[0].low

        for (let i = 1; i < recentCandles.length; i++) {
            const candleLow = ignoreWicks ? recentCandles[i].close : recentCandles[i].low

            // Check if this is a higher low
            if (candleLow > lastLow) {
                const pips = calculatePips(trade.symbol, candleLow, lastLow)
                if (pips >= minSwingPips) {
                    return candleLow
                }
            }

            lastLow = Math.min(lastLow, candleLow)
        }
    } else {
        // Find most recent lower high
        let lastHigh = ignoreWicks ? recentCandles[0].close : recentCandles[0].high

        for (let i = 1; i < recentCandles.length; i++) {
            const candleHigh = ignoreWicks ? recentCandles[i].close : recentCandles[i].high

            // Check if this is a lower high
            if (candleHigh < lastHigh) {
                const pips = calculatePips(trade.symbol, candleHigh, lastHigh)
                if (pips >= minSwingPips) {
                    return candleHigh
                }
            }

            lastHigh = Math.max(lastHigh, candleHigh)
        }
    }

    return null
}

/**
 * Calculate R-multiple based trailing stop
 */
export function calculateRMultipleTrail(
    trade: TradeData,
    config: TrailingConfig,
    currentPrice: number
): number | null {
    if (!trade.originalSL) return null

    const riskDistance = Math.abs(trade.entryPrice - trade.originalSL)
    const currentProfit = trade.type === 'buy'
        ? currentPrice - trade.entryPrice
        : trade.entryPrice - currentPrice

    const currentR = currentProfit / riskDistance

    // Calculate how many R-steps have been achieved
    const rSteps = Math.floor(currentR / config.trailRStep)

    if (rSteps <= 0) return null

    // New SL = Entry + (rSteps * trailRStep * riskDistance)
    let newSL: number

    if (trade.type === 'buy') {
        newSL = trade.entryPrice + (rSteps * config.trailRStep * riskDistance)
    } else {
        newSL = trade.entryPrice - (rSteps * config.trailRStep * riskDistance)
    }

    return newSL
}

/**
 * Calculate breakeven stop loss
 */
export function calculateBreakevenSL(
    trade: TradeData,
    config: TrailingConfig
): number {
    const pipSize = trade.symbol.toUpperCase().includes('JPY') ? 0.01 : 0.0001
    const paddingDistance = config.breakEvenPadding * pipSize

    if (trade.type === 'buy') {
        return trade.entryPrice + paddingDistance
    } else {
        return trade.entryPrice - paddingDistance
    }
}

/**
 * Check if pullback protection should prevent trailing
 */
export function checkPullbackProtection(
    trade: TradeData,
    currentPrice: number,
    config: TrailingConfig
): boolean {
    if (!trade.stopLoss) return false

    const maxProfit = trade.type === 'buy'
        ? Math.max(currentPrice, trade.entryPrice) - trade.entryPrice
        : trade.entryPrice - Math.min(currentPrice, trade.entryPrice)

    const currentProfit = trade.type === 'buy'
        ? currentPrice - trade.entryPrice
        : trade.entryPrice - currentPrice

    if (maxProfit === 0) return false

    const pullbackPercent = ((maxProfit - currentProfit) / maxProfit) * 100

    return pullbackPercent > config.maxPullbackPercent
}

/**
 * Check if volatility filter should prevent trailing
 */
export function checkVolatilityFilter(
    currentATR: number,
    averageATR: number,
    config: TrailingConfig
): boolean {
    if (!config.volatilityFilterEnabled) return false

    const atrSpike = currentATR / averageATR
    return atrSpike > config.volatilityThreshold
}

/**
 * Validate if SL should move
 */
export function validateSLMove(
    trade: TradeData,
    newSL: number,
    config: TrailingConfig
): { allowed: boolean; reason?: string } {
    if (!trade.stopLoss) {
        return { allowed: true }
    }

    // Rule 1: SL must only tighten
    if (trade.type === 'buy') {
        if (newSL <= trade.stopLoss) {
            return { allowed: false, reason: 'SL would not tighten (buy)' }
        }
    } else {
        if (newSL >= trade.stopLoss) {
            return { allowed: false, reason: 'SL would not tighten (sell)' }
        }
    }

    // Rule 2: Respect minimum step size
    const slMovePips = calculatePips(trade.symbol, newSL, trade.stopLoss)
    if (slMovePips < config.minTrailDistancePips) {
        return { allowed: false, reason: `Move too small (${slMovePips.toFixed(1)} pips < ${config.minTrailDistancePips})` }
    }

    // Rule 3: Respect delay between modifications
    if (trade.lastTrailTime) {
        const secondsSinceLastTrail = (Date.now() - trade.lastTrailTime.getTime()) / 1000
        if (secondsSinceLastTrail < config.delayBetweenModsSec) {
            return { allowed: false, reason: `Too soon (${secondsSinceLastTrail.toFixed(0)}s < ${config.delayBetweenModsSec}s)` }
        }
    }

    // Rule 4: Ignore noise
    const moveFromEntry = calculatePips(trade.symbol, newSL, trade.entryPrice)
    if (moveFromEntry < config.ignoreNoiseUnderPips) {
        return { allowed: false, reason: `Noise filter (${moveFromEntry.toFixed(1)} pips < ${config.ignoreNoiseUnderPips})` }
    }

    return { allowed: true }
}

/**
 * Main trailing stop calculation (hybrid mode)
 */
export async function calculateTrailingStop(
    tradeId: string,
    currentPrice: number,
    currentATR: number,
    averageATR: number,
    recentCandles: PriceData[]
): Promise<{ newSL: number | null; reason: string }> {
    // Get trade and config
    const trade = await db.mT4Trade.findUnique({
        where: { id: tradeId },
        include: {
            connection: {
                include: { trailingConfig: true }
            }
        }
    })

    if (!trade || !trade.connection.trailingConfig) {
        return { newSL: null, reason: 'No config found' }
    }

    const config = trade.connection.trailingConfig

    if (!config.enabled) {
        return { newSL: null, reason: 'Trailing disabled' }
    }

    // Check pullback protection
    if (checkPullbackProtection(trade, currentPrice, config)) {
        return { newSL: null, reason: 'Pullback protection active' }
    }

    // Check volatility filter
    if (checkVolatilityFilter(currentATR, averageATR, config)) {
        return { newSL: null, reason: 'Volatility spike detected' }
    }

    let candidates: { sl: number; mode: string }[] = []

    // Calculate based on mode
    if (config.mode === 'atr' || config.mode === 'hybrid') {
        const atrSL = calculateATRTrail(trade, config, currentATR, currentPrice)
        if (atrSL) candidates.push({ sl: atrSL, mode: 'atr' })
    }

    if (config.mode === 'structure' || config.mode === 'hybrid') {
        const structureSL = detectStructureLevel(trade, recentCandles, config)
        if (structureSL) candidates.push({ sl: structureSL, mode: 'structure' })
    }

    if (config.mode === 'r_multiple' || config.mode === 'hybrid') {
        const rMultipleSL = calculateRMultipleTrail(trade, config, currentPrice)
        if (rMultipleSL) candidates.push({ sl: rMultipleSL, mode: 'r_multiple' })
    }

    if (candidates.length === 0) {
        return { newSL: null, reason: 'No trailing candidates' }
    }

    // In hybrid mode, use the tightest (most conservative) SL
    let bestSL = candidates[0]

    if (config.mode === 'hybrid') {
        for (const candidate of candidates) {
            if (trade.type === 'buy') {
                if (candidate.sl > bestSL.sl) {
                    bestSL = candidate
                }
            } else {
                if (candidate.sl < bestSL.sl) {
                    bestSL = candidate
                }
            }
        }
    }

    // Validate the move
    const validation = validateSLMove(trade, bestSL.sl, config)

    if (!validation.allowed) {
        return { newSL: null, reason: validation.reason || 'Validation failed' }
    }

    return { newSL: bestSL.sl, reason: bestSL.mode }
}
