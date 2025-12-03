/**
 * Success Rate Tracking Service
 * Tracks signal performance and calculates win rates
 */

import { prisma } from '@/lib/prisma'

export interface PerformanceMetrics {
    totalSignals: number
    winningSignals: number
    losingSignals: number
    winRate: number
    avgProfit: number
    avgLoss: number
    profitFactor: number
    sharpeRatio: number
}

export class SuccessRateService {

    /**
     * Calculate success rate for a specific strategy
     */
    async calculateStrategySuccessRate(strategy: string, days: number = 30): Promise<PerformanceMetrics> {
        const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

        const signals = await prisma.signal.findMany({
            where: {
                strategy,
                createdAt: { gte: since },
                status: { in: ['HIT_TP', 'HIT_SL', 'CLOSED'] }
            }
        })

        const winning = signals.filter(s => s.status === 'HIT_TP')
        const losing = signals.filter(s => s.status === 'HIT_SL')

        const totalProfit = winning.reduce((sum, s) => {
            const profit = s.takeProfit1 - s.entryPrice
            return sum + (s.type === 'BUY' ? profit : -profit)
        }, 0)

        const totalLoss = losing.reduce((sum, s) => {
            const loss = s.entryPrice - s.stopLoss
            return sum + Math.abs(s.type === 'BUY' ? loss : -loss)
        }, 0)

        return {
            totalSignals: signals.length,
            winningSignals: winning.length,
            losingSignals: losing.length,
            winRate: signals.length > 0 ? (winning.length / signals.length) * 100 : 0,
            avgProfit: winning.length > 0 ? totalProfit / winning.length : 0,
            avgLoss: losing.length > 0 ? totalLoss / losing.length : 0,
            profitFactor: totalLoss > 0 ? totalProfit / totalLoss : 0,
            sharpeRatio: this.calculateSharpeRatio(signals)
        }
    }

    /**
     * Calculate overall platform success rate
     */
    async calculateOverallSuccessRate(days: number = 30): Promise<PerformanceMetrics> {
        const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

        const signals = await prisma.signal.findMany({
            where: {
                createdAt: { gte: since },
                status: { in: ['HIT_TP', 'HIT_SL', 'CLOSED'] }
            }
        })

        const winning = signals.filter(s => s.status === 'HIT_TP')
        const losing = signals.filter(s => s.status === 'HIT_SL')

        const totalProfit = winning.reduce((sum, s) => {
            const profit = s.takeProfit1 - s.entryPrice
            return sum + (s.type === 'BUY' ? profit : -profit)
        }, 0)

        const totalLoss = losing.reduce((sum, s) => {
            const loss = s.entryPrice - s.stopLoss
            return sum + Math.abs(s.type === 'BUY' ? loss : -loss)
        }, 0)

        return {
            totalSignals: signals.length,
            winningSignals: winning.length,
            losingSignals: losing.length,
            winRate: signals.length > 0 ? (winning.length / signals.length) * 100 : 0,
            avgProfit: winning.length > 0 ? totalProfit / winning.length : 0,
            avgLoss: losing.length > 0 ? totalLoss / losing.length : 0,
            profitFactor: totalLoss > 0 ? totalProfit / totalLoss : 0,
            sharpeRatio: this.calculateSharpeRatio(signals)
        }
    }

    /**
     * Get leaderboard of best performing strategies
     */
    async getStrategyLeaderboard(days: number = 30) {
        const strategies = await prisma.signal.findMany({
            where: {
                createdAt: { gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000) }
            },
            select: { strategy: true },
            distinct: ['strategy']
        })

        const leaderboard = await Promise.all(
            strategies.map(async ({ strategy }) => {
                const metrics = await this.calculateStrategySuccessRate(strategy, days)
                return {
                    strategy,
                    ...metrics
                }
            })
        )

        return leaderboard.sort((a, b) => b.winRate - a.winRate)
    }

    private calculateSharpeRatio(signals: any[]): number {
        if (signals.length < 2) return 0

        const returns = signals.map(s => {
            if (s.status === 'HIT_TP') {
                return (s.takeProfit1 - s.entryPrice) / s.entryPrice
            } else {
                return (s.stopLoss - s.entryPrice) / s.entryPrice
            }
        })

        const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length
        const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length
        const stdDev = Math.sqrt(variance)

        return stdDev > 0 ? (avgReturn / stdDev) * Math.sqrt(252) : 0 // Annualized
    }
}

export const successRateService = new SuccessRateService()
