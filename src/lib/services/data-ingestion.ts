/**
 * Data Ingestion Service
 * Handles rate-limited, cached data fetching using Yahoo Finance (yfinance v2).
 * Implements "Initialize Once, Append Updates" strategy.
 */

import yahooFinance from 'yahoo-finance2'
import { prisma } from '@/lib/prisma'

interface Candle {
    timestamp: Date
    open: number
    high: number
    low: number
    close: number
    volume: number
}

export class DataIngestionService {

    /**
     * Sync Market Data for a list of symbols
     * - Fetches historical data if missing
     * - Appends new data if existing
     * @param symbols List of symbols (e.g. ['BTC-USD', 'EURUSD=X'])
     * @param timeframe Timeframe (e.g. '1d', '1h')
     */
    async syncMarketData(symbols: string[], timeframe: '1d' | '1h' | '15m' = '1h') {
        console.log(`[DataIngestion] Starting sync for ${symbols.length} symbols (${timeframe})...`)

        for (const symbol of symbols) {
            try {
                await this.syncSymbol(symbol, timeframe)
                // Rate limit protection: Sleep 1s between symbols
                await new Promise(resolve => setTimeout(resolve, 1000))
            } catch (error) {
                console.error(`[DataIngestion] Failed to sync ${symbol}:`, error)
            }
        }
    }

    private async syncSymbol(symbol: string, timeframe: string) {
        // 1. Check/Create TradingPair
        const pair = await prisma.tradingPair.upsert({
            where: { symbol },
            update: {},
            create: {
                symbol,
                name: symbol,
                market: this.detectMarket(symbol),
                isActive: true
            }
        })

        // 2. Find latest existing candle
        const latestCandle = await prisma.priceData.findFirst({
            where: { tradingPairId: pair.id, timeframe },
            orderBy: { timestamp: 'desc' }
        })

        let startDate: Date
        let queryOptions: any = { period1: '2023-01-01' } // Default start

        if (latestCandle) {
            console.log(`[DataIngestion] ${symbol}: Found existing data up to ${latestCandle.timestamp.toISOString()}`)
            // Start from latest + 1 minute/hour (approx) to avoid overlap (though upsert handles it)
            startDate = new Date(latestCandle.timestamp.getTime() + 1000)
            queryOptions = { period1: startDate.toISOString() }
        } else {
            console.log(`[DataIngestion] ${symbol}: No local data. Fetching full history...`)
        }

        // 3. Fetch from Yahoo Finance
        // Yahoo Finance v2 in Node uses 'queryOptions' differently.
        // For 'historical', period1 is required.
        const yfTimeframe = this.mapTimeframeToYF(timeframe)

        try {
            // Using query since history acts differently in v2
            const result = await yahooFinance.chart(symbol, {
                period1: queryOptions.period1,
                interval: yfTimeframe as any
            })

            if (!result || !result.quotes || result.quotes.length === 0) {
                console.log(`[DataIngestion] ${symbol}: No new data found.`)
                return
            }

            const candles: Candle[] = result.quotes.map((q: any) => ({
                timestamp: new Date(q.date),
                open: q.open || 0,
                high: q.high || 0,
                low: q.low || 0,
                close: q.close || 0,
                volume: q.volume || 0
            })).filter(c => c.close > 0) // Filter invalid candles

            if (candles.length === 0) return

            console.log(`[DataIngestion] ${symbol}: Found ${candles.length} new candles. Saving...`)

            // 4. Batch Upsert to Prisma
            // Prisma doesn't support 'upsertMany' nicely, so we use createMany and skipDuplicates if possible
            // OR transactional loop for safety. For speed, createMany is best if we are sure of no collision.
            // Since we query *after* last date, createMany is safe.

            // To be extra safe against overlaps (e.g. if partial candle was stored):
            // We filter out any candles <= latestCandle.timestamp
            const newCandles = latestCandle
                ? candles.filter(c => c.timestamp > latestCandle.timestamp)
                : candles

            if (newCandles.length > 0) {
                await prisma.priceData.createMany({
                    data: newCandles.map(c => ({
                        tradingPairId: pair.id,
                        timeframe,
                        timestamp: c.timestamp,
                        open: c.open,
                        high: c.high,
                        low: c.low,
                        close: c.close,
                        volume: c.volume
                    }))
                })
                console.log(`[DataIngestion] ${symbol}: Saved ${newCandles.length} candles.`)
            } else {
                console.log(`[DataIngestion] ${symbol}: All candles were duplicates.`)
            }

        } catch (error) {
            console.warn(`[DataIngestion] Error fetching YF data for ${symbol}:`, error)
            // Fallback: If YF fails, maybe try simple scrape? (Not implemented here to keep it clean)
        }
    }

    private detectMarket(symbol: string): string {
        if (symbol.includes('-USD')) return 'crypto'
        if (symbol.includes('=X')) return 'forex'
        return 'stock'
    }

    private mapTimeframeToYF(tf: string): string {
        const map: Record<string, string> = {
            '1m': '1m',
            '5m': '5m',
            '15m': '15m',
            '30m': '30m',
            '1h': '60m', // YF uses 60m for 1h
            '1d': '1d',
            '1w': '1wk',
            '1mo': '1mo'
        }
        return map[tf] || '1d'
    }
}

export const dataIngestionService = new DataIngestionService()
