/**
 * Scanner Service
 * Orchestrates market scanning across multiple timeframes and symbols
 */

import { prisma } from '@/lib/prisma'
import { multiAgentCoordinator } from './multi-agent-system'
import { sniperEntryService } from './sniper-entry'

export class ScannerService {

    /**
     * Run a full market scan
     */
    async runScan(market: 'forex' | 'crypto' | 'stocks' | 'commodities' | 'indices') {
        console.log(`Starting scan for ${market}...`)

        // 1. Get active symbols for this market
        const symbols = await this.getSymbolsForMarket(market)

        // 2. Create tasks for multi-agent system
        // We batch them to avoid overloading
        const batchSize = 5
        for (let i = 0; i < symbols.length; i += batchSize) {
            const batch = symbols.slice(i, i + batchSize)

            multiAgentCoordinator.addTask({
                id: `scan-${market}-${Date.now()}-${i}`,
                type: 'signal_generation',
                market,
                symbols: batch,
                timeframe: 'H1', // Default scanning timeframe
                priority: 1,
                status: 'pending'
            })
        }

        return {
            message: `Scan initiated for ${symbols.length} symbols`,
            batchCount: Math.ceil(symbols.length / batchSize)
        }
    }

    /**
     * Get high probability opportunities
     * Filters signals through Sniper Entry validation
     */
    async getOpportunities(minConfidence: number = 70) {
        // Get recent signals
        const signals = await prisma.signal.findMany({
            where: {
                createdAt: {
                    gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
                },
                status: 'PENDING',
                strength: {
                    gte: minConfidence
                }
            },
            include: {
                tradingPair: true
            },
            orderBy: {
                strength: 'desc'
            }
        })

        // Validate each with Sniper Entry logic
        const opportunities = []

        for (const signal of signals) {
            const validation = await sniperEntryService.validateEntry(
                signal.tradingPair.symbol,
                signal.entryPrice,
                signal.type as 'BUY' | 'SELL',
                signal.timeframe
            )

            if (validation.isValid) {
                opportunities.push({
                    ...signal,
                    sniperScore: validation.score,
                    validationDetails: validation.details
                })
            }
        }

        return opportunities.sort((a, b) => b.sniperScore - a.sniperScore)
    }

    private async getSymbolsForMarket(market: string): Promise<string[]> {
        // In a real app, fetch from DB or config
        // For now, return hardcoded lists
        switch (market) {
            case 'forex':
                return ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD', 'USDCHF', 'NZDUSD']
            case 'crypto':
                return ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT', 'XRPUSDT', 'ADAUSDT']
            case 'stocks':
                return ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA', 'META']
            case 'commodities':
                return ['XAUUSD', 'XAGUSD', 'WTI', 'BRENT']
            case 'indices':
                return ['US30', 'NAS100', 'SPX500', 'GER40', 'UK100']
            default:
                return []
        }
    }
}

export const scannerService = new ScannerService()
