// Risk Management and Trade Calculation Library

export interface RiskSettings {
    riskPercent: number
    maxLot: number
    maxOpenTrades: number
    dailyLossLimit: number
    allowBuy: boolean
    allowSell: boolean
    stopAfterMaxLoss: boolean
}

export interface TradeParams {
    symbol: string
    type: 'buy' | 'sell'
    entryPrice: number
    stopLoss: number
    takeProfit?: number
    equity: number
    riskSettings: RiskSettings
}

export interface CalculatedTrade {
    lot: number
    stopLoss: number
    takeProfit?: number
    tp1?: number
    tp2?: number
    tp3?: number
    tp4?: number
    riskAmount: number
    potentialProfit: number
    riskRewardRatio: number
}

// Symbol pip values (for major pairs)
const PIP_VALUES: Record<string, number> = {
    // Forex majors
    'EURUSD': 10,
    'GBPUSD': 10,
    'USDJPY': 9.09,
    'USDCHF': 10,
    'AUDUSD': 10,
    'NZDUSD': 10,
    'USDCAD': 7.69,
    // Forex crosses
    'EURJPY': 9.09,
    'GBPJPY': 9.09,
    'EURGBP': 12.5,
    // Crypto
    'BTCUSD': 1,
    'ETHUSD': 1,
    'XRPUSD': 1,
    // Commodities
    'XAUUSD': 1, // Gold
    'XAGUSD': 50, // Silver
    'USOIL': 10,
    'UKOIL': 10
}

/**
 * Get pip value for a symbol
 */
export function getPipValue(symbol: string): number {
    const cleanSymbol = symbol.toUpperCase().replace(/[^A-Z]/g, '')
    return PIP_VALUES[cleanSymbol] || 10 // Default to 10
}

/**
 * Calculate number of pips between two prices
 */
export function calculatePips(symbol: string, price1: number, price2: number): number {
    const cleanSymbol = symbol.toUpperCase()
    const diff = Math.abs(price1 - price2)

    // For JPY pairs, 1 pip = 0.01
    if (cleanSymbol.includes('JPY')) {
        return diff * 100
    }

    // For most pairs, 1 pip = 0.0001
    return diff * 10000
}

/**
 * Calculate lot size based on risk percentage
 */
export function calculateLotSize(params: TradeParams): number {
    const { equity, entryPrice, stopLoss, riskSettings, symbol } = params

    // Calculate risk amount in account currency
    const riskAmount = (equity * riskSettings.riskPercent) / 100

    // Calculate stop loss in pips
    const slPips = calculatePips(symbol, entryPrice, stopLoss)

    if (slPips === 0) return 0.01 // Minimum lot

    // Get pip value
    const pipValue = getPipValue(symbol)

    // Calculate lot size: Risk Amount / (SL in pips * pip value per lot)
    let lotSize = riskAmount / (slPips * pipValue)

    // Round to 2 decimal places
    lotSize = Math.round(lotSize * 100) / 100

    // Apply max lot limit
    if (lotSize > riskSettings.maxLot) {
        lotSize = riskSettings.maxLot
    }

    // Ensure minimum lot
    if (lotSize < 0.01) {
        lotSize = 0.01
    }

    return lotSize
}

/**
 * Calculate TP levels (TP1, TP2, TP3, TP4)
 */
export function calculateTPLevels(
    entryPrice: number,
    stopLoss: number,
    type: 'buy' | 'sell',
    symbol: string
): { tp1: number; tp2: number; tp3: number; tp4: number } {
    const slPips = calculatePips(symbol, entryPrice, stopLoss)

    // TP levels based on R-multiples
    // TP1 = 1R, TP2 = 2R, TP3 = 3R, TP4 = 5R
    const rMultiples = [1, 2, 3, 5]

    const pipSize = symbol.toUpperCase().includes('JPY') ? 0.01 : 0.0001

    const tpLevels = rMultiples.map(r => {
        const tpPips = slPips * r
        const tpDistance = tpPips * pipSize

        if (type === 'buy') {
            return entryPrice + tpDistance
        } else {
            return entryPrice - tpDistance
        }
    })

    return {
        tp1: Math.round(tpLevels[0] * 100000) / 100000,
        tp2: Math.round(tpLevels[1] * 100000) / 100000,
        tp3: Math.round(tpLevels[2] * 100000) / 100000,
        tp4: Math.round(tpLevels[3] * 100000) / 100000
    }
}

/**
 * Calculate full trade parameters
 */
export function calculateTrade(params: TradeParams): CalculatedTrade {
    const { symbol, type, entryPrice, stopLoss, takeProfit, equity, riskSettings } = params

    // Calculate lot size
    const lot = calculateLotSize(params)

    // Calculate TP levels
    const tpLevels = calculateTPLevels(entryPrice, stopLoss, type, symbol)

    // Calculate risk amount
    const slPips = calculatePips(symbol, entryPrice, stopLoss)
    const pipValue = getPipValue(symbol)
    const riskAmount = slPips * pipValue * lot

    // Calculate potential profit (using TP4 or provided TP)
    const finalTP = takeProfit || tpLevels.tp4
    const tpPips = calculatePips(symbol, entryPrice, finalTP)
    const potentialProfit = tpPips * pipValue * lot

    // Calculate risk-reward ratio
    const riskRewardRatio = potentialProfit / riskAmount

    return {
        lot,
        stopLoss,
        takeProfit: finalTP,
        tp1: tpLevels.tp1,
        tp2: tpLevels.tp2,
        tp3: tpLevels.tp3,
        tp4: tpLevels.tp4,
        riskAmount,
        potentialProfit,
        riskRewardRatio: Math.round(riskRewardRatio * 100) / 100
    }
}

/**
 * Validate if trade is allowed based on risk settings
 */
export function validateTrade(
    type: 'buy' | 'sell',
    riskSettings: RiskSettings,
    currentOpenTrades: number,
    dailyLoss: number
): { allowed: boolean; reason?: string } {
    // Check direction
    if (type === 'buy' && !riskSettings.allowBuy) {
        return { allowed: false, reason: 'Buy trades are disabled' }
    }

    if (type === 'sell' && !riskSettings.allowSell) {
        return { allowed: false, reason: 'Sell trades are disabled' }
    }

    // Check max open trades
    if (currentOpenTrades >= riskSettings.maxOpenTrades) {
        return { allowed: false, reason: `Maximum ${riskSettings.maxOpenTrades} open trades reached` }
    }

    // Check daily loss limit
    if (riskSettings.stopAfterMaxLoss && dailyLoss >= riskSettings.dailyLossLimit) {
        return { allowed: false, reason: `Daily loss limit of ${riskSettings.dailyLossLimit}% reached` }
    }

    return { allowed: true }
}

/**
 * Calculate breakeven price
 */
export function calculateBreakeven(
    entryPrice: number,
    type: 'buy' | 'sell',
    padding: number,
    symbol: string
): number {
    const pipSize = symbol.toUpperCase().includes('JPY') ? 0.01 : 0.0001
    const paddingDistance = padding * pipSize

    if (type === 'buy') {
        return entryPrice + paddingDistance
    } else {
        return entryPrice - paddingDistance
    }
}

/**
 * Check if breakeven should trigger
 */
export function shouldTriggerBreakeven(
    currentPrice: number,
    entryPrice: number,
    stopLoss: number,
    type: 'buy' | 'sell',
    triggerR: number
): boolean {
    const slDistance = Math.abs(entryPrice - stopLoss)
    const requiredDistance = slDistance * triggerR

    if (type === 'buy') {
        return currentPrice >= entryPrice + requiredDistance
    } else {
        return currentPrice <= entryPrice - requiredDistance
    }
}
