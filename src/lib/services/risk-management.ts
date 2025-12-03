/**
 * Advanced Risk Management System
 * Calculates optimal lot sizes, position sizing, and risk metrics
 */

export interface TradingAccount {
    capital: number // Total account balance
    currency: string // Account currency (USD, GBP, EUR, etc.)
    leverage: number // Account leverage (1, 10, 50, 100, etc.)
    riskPercentage: number // Risk per trade (1%, 2%, etc.)
    maxOpenTrades: number // Maximum concurrent trades
}

export interface TradeSetup {
    symbol: string
    entryPrice: number
    stopLoss: number
    takeProfit: number
    direction: 'BUY' | 'SELL'
    confidence: number // 0-100
}

export interface RiskCalculation {
    recommendedLotSize: number
    positionSize: number // In base currency
    riskAmount: number // Amount at risk
    riskPercentage: number
    potentialProfit: number
    potentialLoss: number
    riskRewardRatio: number
    marginRequired: number
    pipValue: number
    stopLossPips: number
    takeProfitPips: number
    maxLotSize: number
    minLotSize: number
    suggestions: string[]
    warnings: string[]
}

export interface PortfolioRisk {
    totalCapital: number
    totalRiskAmount: number
    totalRiskPercentage: number
    availableCapital: number
    usedMargin: number
    freeMargin: number
    marginLevel: number // Percentage
    openTrades: number
    maxDrawdown: number
    currentDrawdown: number
    recommendations: string[]
}

export class RiskManagementCalculator {
    private readonly MIN_LOT_SIZE = 0.01
    private readonly MAX_LOT_SIZE = 100
    private readonly SAFE_MARGIN_LEVEL = 200 // 200%
    private readonly WARNING_MARGIN_LEVEL = 150 // 150%
    private readonly CRITICAL_MARGIN_LEVEL = 120 // 120%

    /**
     * Calculate optimal lot size based on account and trade setup
     */
    calculateLotSize(account: TradingAccount, trade: TradeSetup): RiskCalculation {
        const suggestions: string[] = []
        const warnings: string[] = []

        // Calculate pip value and stop loss in pips
        const { pipValue, stopLossPips, takeProfitPips } = this.calculatePips(trade)

        // Calculate risk amount
        const riskAmount = (account.capital * account.riskPercentage) / 100

        // Calculate lot size based on risk
        let lotSize = riskAmount / (stopLossPips * pipValue)

        // Adjust for confidence level
        if (trade.confidence < 70) {
            lotSize *= 0.5
            suggestions.push(`Reduced lot size by 50% due to low confidence (${trade.confidence}%)`)
        } else if (trade.confidence > 85) {
            lotSize *= 1.2
            suggestions.push(`Increased lot size by 20% due to high confidence (${trade.confidence}%)`)
        }

        // Round to standard lot sizes
        lotSize = this.roundLotSize(lotSize)

        // Apply limits
        const maxLotSize = this.calculateMaxLotSize(account, trade)
        const minLotSize = this.MIN_LOT_SIZE

        if (lotSize > maxLotSize) {
            warnings.push(`Lot size exceeds maximum (${maxLotSize}). Using maximum instead.`)
            lotSize = maxLotSize
        }

        if (lotSize < minLotSize) {
            warnings.push(`Lot size below minimum (${minLotSize}). Using minimum instead.`)
            lotSize = minLotSize
        }

        // Calculate position size
        const positionSize = lotSize * 100000 // Standard lot = 100,000 units

        // Calculate margin required
        const marginRequired = (positionSize * trade.entryPrice) / account.leverage

        // Calculate potential profit and loss
        const potentialLoss = stopLossPips * pipValue * lotSize
        const potentialProfit = takeProfitPips * pipValue * lotSize

        // Calculate risk-reward ratio
        const riskRewardRatio = potentialProfit / potentialLoss

        // Add suggestions based on risk-reward
        if (riskRewardRatio < 1.5) {
            warnings.push(`Low risk-reward ratio (${riskRewardRatio.toFixed(2)}). Consider better entry or targets.`)
        } else if (riskRewardRatio > 3) {
            suggestions.push(`Excellent risk-reward ratio (${riskRewardRatio.toFixed(2)})!`)
        }

        // Check margin requirements
        const marginLevel = (account.capital / marginRequired) * 100
        if (marginLevel < this.WARNING_MARGIN_LEVEL) {
            warnings.push(`Margin level is low (${marginLevel.toFixed(0)}%). Consider reducing lot size.`)
        }

        return {
            recommendedLotSize: lotSize,
            positionSize,
            riskAmount: potentialLoss,
            riskPercentage: (potentialLoss / account.capital) * 100,
            potentialProfit,
            potentialLoss,
            riskRewardRatio,
            marginRequired,
            pipValue,
            stopLossPips,
            takeProfitPips,
            maxLotSize,
            minLotSize,
            suggestions,
            warnings
        }
    }

    /**
     * Calculate portfolio-wide risk metrics
     */
    calculatePortfolioRisk(
        account: TradingAccount,
        openTrades: Array<{ lotSize: number; marginRequired: number; currentPL: number }>
    ): PortfolioRisk {
        const recommendations: string[] = []

        // Calculate total used margin
        const usedMargin = openTrades.reduce((sum, trade) => sum + trade.marginRequired, 0)
        const freeMargin = account.capital - usedMargin
        const marginLevel = (account.capital / usedMargin) * 100

        // Calculate total risk
        const totalRiskAmount = openTrades.length * (account.capital * account.riskPercentage) / 100
        const totalRiskPercentage = (totalRiskAmount / account.capital) * 100

        // Calculate current drawdown
        const currentPL = openTrades.reduce((sum, trade) => sum + trade.currentPL, 0)
        const currentDrawdown = currentPL < 0 ? Math.abs(currentPL) : 0

        // Add recommendations
        if (openTrades.length >= account.maxOpenTrades) {
            recommendations.push('Maximum number of trades reached. Close some positions before opening new ones.')
        }

        if (totalRiskPercentage > 10) {
            recommendations.push(`Total portfolio risk is high (${totalRiskPercentage.toFixed(1)}%). Consider reducing exposure.`)
        }

        if (marginLevel < this.CRITICAL_MARGIN_LEVEL) {
            recommendations.push('⚠️ CRITICAL: Margin level is dangerously low! Close positions immediately.')
        } else if (marginLevel < this.WARNING_MARGIN_LEVEL) {
            recommendations.push('⚠️ WARNING: Margin level is low. Monitor closely and consider closing losing positions.')
        }

        if (currentDrawdown > account.capital * 0.1) {
            recommendations.push(`Current drawdown is ${((currentDrawdown / account.capital) * 100).toFixed(1)}%. Consider taking a break.`)
        }

        return {
            totalCapital: account.capital,
            totalRiskAmount,
            totalRiskPercentage,
            availableCapital: freeMargin,
            usedMargin,
            freeMargin,
            marginLevel,
            openTrades: openTrades.length,
            maxDrawdown: account.capital * 0.2, // 20% max drawdown threshold
            currentDrawdown,
            recommendations
        }
    }

    /**
     * Suggest position sizing strategy based on capital
     */
    suggestPositionStrategy(capital: number): Array<{
        strategy: string
        lotSize: number
        numberOfTrades: number
        riskPerTrade: number
        description: string
    }> {
        const strategies = []

        if (capital >= 100 && capital < 500) {
            strategies.push(
                {
                    strategy: 'Conservative',
                    lotSize: 0.01,
                    numberOfTrades: 1,
                    riskPerTrade: 1,
                    description: 'Single micro lot trade with 1% risk - safest for small accounts'
                },
                {
                    strategy: 'Moderate',
                    lotSize: 0.02,
                    numberOfTrades: 2,
                    riskPerTrade: 1,
                    description: 'Two micro lot trades with 1% risk each - balanced approach'
                }
            )
        } else if (capital >= 500 && capital < 1000) {
            strategies.push(
                {
                    strategy: 'Conservative',
                    lotSize: 0.02,
                    numberOfTrades: 2,
                    riskPerTrade: 1,
                    description: 'Two micro lots with 1% risk each'
                },
                {
                    strategy: 'Moderate',
                    lotSize: 0.05,
                    numberOfTrades: 3,
                    riskPerTrade: 1.5,
                    description: 'Three trades at 0.05 lots with 1.5% risk each'
                },
                {
                    strategy: 'Aggressive',
                    lotSize: 0.10,
                    numberOfTrades: 2,
                    riskPerTrade: 2,
                    description: 'Two trades at 0.10 lots with 2% risk each'
                }
            )
        } else if (capital >= 1000 && capital < 5000) {
            strategies.push(
                {
                    strategy: 'Conservative',
                    lotSize: 0.05,
                    numberOfTrades: 3,
                    riskPerTrade: 1,
                    description: 'Three trades at 0.05 lots with 1% risk each'
                },
                {
                    strategy: 'Moderate',
                    lotSize: 0.10,
                    numberOfTrades: 5,
                    riskPerTrade: 1.5,
                    description: 'Five trades at 0.10 lots with 1.5% risk each'
                },
                {
                    strategy: 'Aggressive',
                    lotSize: 0.20,
                    numberOfTrades: 3,
                    riskPerTrade: 2,
                    description: 'Three trades at 0.20 lots with 2% risk each'
                }
            )
        } else if (capital >= 5000) {
            strategies.push(
                {
                    strategy: 'Conservative',
                    lotSize: 0.10,
                    numberOfTrades: 5,
                    riskPerTrade: 1,
                    description: 'Five trades at 0.10 lots with 1% risk each'
                },
                {
                    strategy: 'Moderate',
                    lotSize: 0.50,
                    numberOfTrades: 5,
                    riskPerTrade: 1.5,
                    description: 'Five trades at 0.50 lots with 1.5% risk each'
                },
                {
                    strategy: 'Aggressive',
                    lotSize: 1.00,
                    numberOfTrades: 5,
                    riskPerTrade: 2,
                    description: 'Five trades at 1.00 lot with 2% risk each'
                }
            )
        }

        return strategies
    }

    /**
     * Calculate pips and pip value
     */
    private calculatePips(trade: TradeSetup): {
        pipValue: number
        stopLossPips: number
        takeProfitPips: number
    } {
        // Determine pip size based on symbol
        const pipSize = this.getPipSize(trade.symbol)

        // Calculate stop loss and take profit in pips
        const stopLossPips = Math.abs(trade.entryPrice - trade.stopLoss) / pipSize
        const takeProfitPips = Math.abs(trade.takeProfit - trade.entryPrice) / pipSize

        // Calculate pip value (for 1 standard lot)
        // This is simplified - in production, use actual pip values from broker
        const pipValue = pipSize * 100000 // Standard lot

        return {
            pipValue,
            stopLossPips,
            takeProfitPips
        }
    }

    /**
     * Get pip size for symbol
     */
    private getPipSize(symbol: string): number {
        // JPY pairs have different pip size
        if (symbol.includes('JPY')) {
            return 0.01
        }
        // Most forex pairs
        return 0.0001
    }

    /**
     * Calculate maximum lot size based on available margin
     */
    private calculateMaxLotSize(account: TradingAccount, trade: TradeSetup): number {
        const availableMargin = account.capital * 0.5 // Use max 50% of capital
        const pricePerLot = (100000 * trade.entryPrice) / account.leverage
        const maxLots = availableMargin / pricePerLot
        return this.roundLotSize(Math.min(maxLots, this.MAX_LOT_SIZE))
    }

    /**
     * Round lot size to standard increments
     */
    private roundLotSize(lotSize: number): number {
        if (lotSize < 0.1) {
            return Math.round(lotSize * 100) / 100 // Round to 0.01
        } else if (lotSize < 1) {
            return Math.round(lotSize * 10) / 10 // Round to 0.1
        } else {
            return Math.round(lotSize) // Round to 1
        }
    }
}

// Singleton instance
export const riskCalculator = new RiskManagementCalculator()
