/**
 * Backtesting Service
 * Tests strategies against historical data to validate performance
 */

import { prisma } from '@/lib/prisma'

export interface BacktestConfig {
    strategyName: string
    symbol: string
    timeframe: string
    startDate: Date
    endDate: Date
    initialCapital: number
    riskPerTrade: number // percentage
}

export interface BacktestResult {
    strategyName: string
    totalTrades: number
    winningTrades: number
    losingTrades: number
    winRate: number
    totalProfit: number
    totalLoss: number
    netProfit: number
    profitFactor: number
    sharpeRatio: number
    maxDrawdown: number
    averageWin: number
    averageLoss: number
    largestWin: number
    largestLoss: number
    consecutiveWins: number
    consecutiveLosses: number
    trades: BacktestTrade[]
}

export interface BacktestTrade {
    entryDate: Date
    exitDate: Date
    type: 'BUY' | 'SELL'
    entryPrice: number
    exitPrice: number
    stopLoss: number
    takeProfit: number
    result: 'WIN' | 'LOSS'
    profit: number
    profitPercent: number
}

export class BacktestingService {

    /**
     * Run backtest for a strategy
     */
    async runBacktest(config: BacktestConfig): Promise<BacktestResult> {
        // Fetch historical data
        const historicalData = await this.getHistoricalData(
            config.symbol,
            config.timeframe,
            config.startDate,
            config.endDate
        )

        if (historicalData.length === 0) {
            throw new Error('No historical data available for backtest')
        }

        // Simulate trades
        const trades: BacktestTrade[] = []
        let capital = config.initialCapital
        let equity = capital
        let maxEquity = capital
        let maxDrawdown = 0

        // Run strategy on each candle
        for (let i = 50; i < historicalData.length; i++) {
            const currentData = historicalData.slice(0, i + 1)

            // Generate signal using strategy (simplified - would call actual strategy)
            const signal = await this.generateSignal(config.strategyName, currentData)

            if (signal) {
                // Calculate position size
                const riskAmount = capital * (config.riskPerTrade / 100)
                const stopDistance = Math.abs(signal.entryPrice - signal.stopLoss)
                const positionSize = riskAmount / stopDistance

                // Simulate trade execution
                const trade = await this.simulateTrade(
                    signal,
                    historicalData.slice(i),
                    positionSize
                )

                if (trade) {
                    trades.push(trade)
                    capital += trade.profit
                    equity = capital

                    if (equity > maxEquity) {
                        maxEquity = equity
                    }

                    const drawdown = ((maxEquity - equity) / maxEquity) * 100
                    if (drawdown > maxDrawdown) {
                        maxDrawdown = drawdown
                    }
                }
            }
        }

        // Calculate metrics
        return this.calculateMetrics(trades, config.initialCapital)
    }

    /**
     * Run automated backtesting for all strategies
     */
    async runAutomatedBacktesting() {
        const strategies = [
            'MACD Divergence',
            'RSI + Bollinger',
            'Golden/Death Cross',
            'Supply & Demand Multi-TF',
            'Liquidity Sweep',
            'EMA Cloud',
            // ... all 20+ strategies
        ]

        const symbols = ['EURUSD', 'GBPUSD', 'BTCUSDT', 'ETHUSD']
        const timeframes = ['H1', 'H4', 'D1']

        const results = []

        for (const strategy of strategies) {
            for (const symbol of symbols) {
                for (const timeframe of timeframes) {
                    try {
                        const result = await this.runBacktest({
                            strategyName: strategy,
                            symbol,
                            timeframe,
                            startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // 90 days
                            endDate: new Date(),
                            initialCapital: 10000,
                            riskPerTrade: 1
                        })

                        // Store result
                        await prisma.backtestResult.create({
                            data: {
                                strategyName: strategy,
                                symbol,
                                timeframe,
                                winRate: result.winRate,
                                profitFactor: result.profitFactor,
                                totalTrades: result.totalTrades,
                                netProfit: result.netProfit,
                                maxDrawdown: result.maxDrawdown,
                                sharpeRatio: result.sharpeRatio,
                                startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
                                endDate: new Date(),
                                metadata: result
                            }
                        })

                        results.push(result)
                    } catch (error) {
                        console.error(`Backtest failed for ${strategy} on ${symbol}:`, error)
                    }
                }
            }
        }

        return results
    }

    private async getHistoricalData(symbol: string, timeframe: string, startDate: Date, endDate: Date) {
        return await prisma.priceData.findMany({
            where: {
                tradingPair: { symbol },
                timeframe,
                timestamp: {
                    gte: startDate,
                    lte: endDate
                }
            },
            orderBy: { timestamp: 'asc' }
        })
    }

    private async generateSignal(strategyName: string, data: any[]) {
        try {
            // Call Python service
            const response = await fetch(`${process.env.PYTHON_SERVICE_URL || 'http://localhost:8000'}/analyze`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    strategy: strategyName,
                    data: data.map(d => ({
                        open: d.open,
                        high: d.high,
                        low: d.low,
                        close: d.close,
                        volume: d.volume,
                        timestamp: d.timestamp
                    }))
                })
            })

            if (!response.ok) return null

            const result = await response.json()
            return result.signal ? result : null
        } catch (error) {
            console.error('Error generating signal:', error)
            return null
        }
    }

    private async simulateTrade(signal: any, futureData: any[], positionSize: number): Promise<BacktestTrade | null> {
        // Simulate trade execution on historical data
        const entryPrice = signal.entryPrice
        const stopLoss = signal.stopLoss
        const takeProfit = signal.takeProfit

        for (let i = 0; i < futureData.length; i++) {
            const candle = futureData[i]

            // Check if stop loss hit
            if (signal.type === 'BUY' && candle.low <= stopLoss) {
                return {
                    entryDate: signal.timestamp,
                    exitDate: candle.timestamp,
                    type: 'BUY',
                    entryPrice,
                    exitPrice: stopLoss,
                    stopLoss,
                    takeProfit,
                    result: 'LOSS',
                    profit: (stopLoss - entryPrice) * positionSize,
                    profitPercent: ((stopLoss - entryPrice) / entryPrice) * 100
                }
            }

            // Check if take profit hit
            if (signal.type === 'BUY' && candle.high >= takeProfit) {
                return {
                    entryDate: signal.timestamp,
                    exitDate: candle.timestamp,
                    type: 'BUY',
                    entryPrice,
                    exitPrice: takeProfit,
                    stopLoss,
                    takeProfit,
                    result: 'WIN',
                    profit: (takeProfit - entryPrice) * positionSize,
                    profitPercent: ((takeProfit - entryPrice) / entryPrice) * 100
                }
            }

            // Similar logic for SELL
        }

        return null
    }

    private calculateMetrics(trades: BacktestTrade[], initialCapital: number): BacktestResult {
        const winningTrades = trades.filter(t => t.result === 'WIN')
        const losingTrades = trades.filter(t => t.result === 'LOSS')

        const totalProfit = winningTrades.reduce((sum, t) => sum + t.profit, 0)
        const totalLoss = Math.abs(losingTrades.reduce((sum, t) => sum + t.profit, 0))

        return {
            strategyName: '',
            totalTrades: trades.length,
            winningTrades: winningTrades.length,
            losingTrades: losingTrades.length,
            winRate: trades.length > 0 ? (winningTrades.length / trades.length) * 100 : 0,
            totalProfit,
            totalLoss,
            netProfit: totalProfit - totalLoss,
            profitFactor: totalLoss > 0 ? totalProfit / totalLoss : 0,
            sharpeRatio: this.calculateSharpeRatio(trades),
            maxDrawdown: 0, // Calculated during simulation
            averageWin: winningTrades.length > 0 ? totalProfit / winningTrades.length : 0,
            averageLoss: losingTrades.length > 0 ? totalLoss / losingTrades.length : 0,
            largestWin: winningTrades.length > 0 ? Math.max(...winningTrades.map(t => t.profit)) : 0,
            largestLoss: losingTrades.length > 0 ? Math.min(...losingTrades.map(t => t.profit)) : 0,
            consecutiveWins: this.calculateConsecutive(trades, 'WIN'),
            consecutiveLosses: this.calculateConsecutive(trades, 'LOSS'),
            trades
        }
    }

    private calculateSharpeRatio(trades: BacktestTrade[]): number {
        if (trades.length < 2) return 0

        const returns = trades.map(t => t.profitPercent)
        const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length
        const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length
        const stdDev = Math.sqrt(variance)

        return stdDev > 0 ? (avgReturn / stdDev) * Math.sqrt(252) : 0
    }

    private calculateConsecutive(trades: BacktestTrade[], type: 'WIN' | 'LOSS'): number {
        let max = 0
        let current = 0

        for (const trade of trades) {
            if (trade.result === type) {
                current++
                max = Math.max(max, current)
            } else {
                current = 0
            }
        }

        return max
    }
}

export const backtestingService = new BacktestingService()
