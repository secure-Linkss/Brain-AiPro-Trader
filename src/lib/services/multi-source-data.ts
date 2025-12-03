/**
 * Multi-Source Market Data Service
 * Uses multiple free data sources for accuracy and redundancy
 * - Alpha Vantage (Stocks, Forex, Crypto)
 * - Binance (Crypto)
 * - Financial Modeling Prep (Economic Calendar, News)
 * - Finnhub (News, Fundamentals)
 */

import { prisma } from '@/lib/prisma'

export interface MarketDataSource {
    name: string
    priority: number
    available: boolean
}

export interface EconomicEvent {
    date: Date
    time: string
    currency: string
    event: string
    impact: 'high' | 'medium' | 'low'
    forecast: string
    previous: string
    actual?: string
}

export interface FundamentalData {
    symbol: string
    pe_ratio: number
    eps: number
    market_cap: number
    dividend_yield: number
    revenue_growth: number
    profit_margin: number
    debt_to_equity: number
    sentiment_score: number
}

export class MultiSourceDataService {

    private sources: MarketDataSource[] = [
        { name: 'Alpha Vantage', priority: 1, available: !!process.env.ALPHA_VANTAGE_API_KEY },
        { name: 'Finnhub', priority: 2, available: !!process.env.FINNHUB_API_KEY },
        { name: 'Binance', priority: 3, available: true }, // Public API
        { name: 'Financial Modeling Prep', priority: 4, available: !!process.env.FMP_API_KEY }
    ]

    /**
     * Get price data with fallback sources
     */
    async getPrice(symbol: string, market: string): Promise<any> {
        // Try sources in priority order
        for (const source of this.sources.filter(s => s.available)) {
            try {
                switch (source.name) {
                    case 'Alpha Vantage':
                        return await this.getAlphaVantagePrice(symbol, market)
                    case 'Binance':
                        if (market === 'crypto') {
                            return await this.getBinancePrice(symbol)
                        }
                        break
                    case 'Finnhub':
                        return await this.getFinnhubPrice(symbol)
                }
            } catch (error) {
                console.error(`${source.name} failed for ${symbol}:`, error)
                continue
            }
        }

        throw new Error('All data sources failed')
    }

    /**
     * Alpha Vantage - Primary source for stocks/forex
     */
    private async getAlphaVantagePrice(symbol: string, market: string) {
        const apiKey = process.env.ALPHA_VANTAGE_API_KEY
        if (!apiKey) throw new Error('Alpha Vantage API key not configured')

        let endpoint = ''
        if (market === 'forex') {
            const [from, to] = this.splitForexPair(symbol)
            endpoint = `https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=${from}&to_currency=${to}&apikey=${apiKey}`
        } else if (market === 'crypto') {
            endpoint = `https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=${symbol}&to_currency=USD&apikey=${apiKey}`
        } else {
            endpoint = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`
        }

        const res = await fetch(endpoint)
        const data = await res.json()

        if (data['Error Message']) throw new Error(data['Error Message'])

        return this.normalizeAlphaVantageData(data, market)
    }

    /**
     * Binance - Crypto data
     */
    private async getBinancePrice(symbol: string) {
        const formattedSymbol = symbol.replace('/', '').toUpperCase()
        const res = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${formattedSymbol}`)

        if (!res.ok) throw new Error('Binance API error')

        const data = await res.json()

        return {
            symbol,
            price: parseFloat(data.lastPrice),
            change24h: parseFloat(data.priceChangePercent),
            volume: parseFloat(data.volume),
            high24h: parseFloat(data.highPrice),
            low24h: parseFloat(data.lowPrice),
            timestamp: Date.now(),
            source: 'Binance'
        }
    }

    /**
     * Finnhub - Alternative for stocks
     */
    private async getFinnhubPrice(symbol: string) {
        const apiKey = process.env.FINNHUB_API_KEY
        if (!apiKey) throw new Error('Finnhub API key not configured')

        const res = await fetch(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${apiKey}`)
        const data = await res.json()

        return {
            symbol,
            price: data.c,
            change24h: data.dp,
            high24h: data.h,
            low24h: data.l,
            timestamp: data.t * 1000,
            source: 'Finnhub'
        }
    }

    /**
     * Get Economic Calendar
     */
    async getEconomicCalendar(days: number = 7): Promise<EconomicEvent[]> {
        const apiKey = process.env.FMP_API_KEY || process.env.ALPHA_VANTAGE_API_KEY

        if (!apiKey) {
            console.warn('No API key for economic calendar')
            return []
        }

        try {
            // Using Financial Modeling Prep
            if (process.env.FMP_API_KEY) {
                const from = new Date().toISOString().split('T')[0]
                const to = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

                const res = await fetch(
                    `https://financialmodelingprep.com/api/v3/economic_calendar?from=${from}&to=${to}&apikey=${process.env.FMP_API_KEY}`
                )
                const data = await res.json()

                return data.map((event: any) => ({
                    date: new Date(event.date),
                    time: event.time || '00:00',
                    currency: event.country,
                    event: event.event,
                    impact: this.parseImpact(event.impact),
                    forecast: event.estimate || 'N/A',
                    previous: event.previous || 'N/A',
                    actual: event.actual
                }))
            }
        } catch (error) {
            console.error('Failed to fetch economic calendar:', error)
        }

        return []
    }

    /**
     * Get Fundamental Data for a symbol
     */
    async getFundamentalData(symbol: string): Promise<FundamentalData | null> {
        try {
            if (process.env.ALPHA_VANTAGE_API_KEY) {
                const res = await fetch(
                    `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${symbol}&apikey=${process.env.ALPHA_VANTAGE_API_KEY}`
                )
                const data = await res.json()

                if (data['Symbol']) {
                    return {
                        symbol: data['Symbol'],
                        pe_ratio: parseFloat(data['PERatio']) || 0,
                        eps: parseFloat(data['EPS']) || 0,
                        market_cap: parseFloat(data['MarketCapitalization']) || 0,
                        dividend_yield: parseFloat(data['DividendYield']) || 0,
                        revenue_growth: parseFloat(data['QuarterlyRevenueGrowthYOY']) || 0,
                        profit_margin: parseFloat(data['ProfitMargin']) || 0,
                        debt_to_equity: parseFloat(data['DebtToEquity']) || 0,
                        sentiment_score: this.calculateSentiment(data)
                    }
                }
            }
        } catch (error) {
            console.error('Failed to fetch fundamental data:', error)
        }

        return null
    }

    /**
     * Get latest financial news
     */
    async getFinancialNews(symbol?: string, limit: number = 10) {
        const news = []

        try {
            // Finnhub News
            if (process.env.FINNHUB_API_KEY) {
                const endpoint = symbol
                    ? `https://finnhub.io/api/v1/company-news?symbol=${symbol}&from=${this.getDateDaysAgo(7)}&to=${this.getToday()}&token=${process.env.FINNHUB_API_KEY}`
                    : `https://finnhub.io/api/v1/news?category=general&token=${process.env.FINNHUB_API_KEY}`

                const res = await fetch(endpoint)
                const data = await res.json()

                news.push(...data.slice(0, limit).map((article: any) => ({
                    title: article.headline,
                    summary: article.summary,
                    url: article.url,
                    source: article.source,
                    publishedAt: new Date(article.datetime * 1000),
                    sentiment: article.sentiment || 0,
                    symbols: [symbol].filter(Boolean)
                })))
            }
        } catch (error) {
            console.error('Failed to fetch news:', error)
        }

        return news
    }

    /**
     * Get historical price data
     */
    async getHistoricalPrices(symbol: string, timeframe: string, limit: number = 100) {
        try {
            // For crypto, use Binance
            if (symbol.includes('USDT') || symbol.includes('BTC')) {
                return await this.getBinanceHistoricalData(symbol, timeframe, limit)
            }

            // For forex/stocks, use Alpha Vantage
            return await this.getAlphaVantageHistoricalData(symbol, timeframe, limit)

        } catch (error) {
            console.error('Failed to fetch historical prices:', error)
            return []
        }
    }

    private async getBinanceHistoricalData(symbol: string, timeframe: string, limit: number) {
        const formattedSymbol = symbol.replace('/', '').toUpperCase()
        const interval = this.convertTimeframeToInterval(timeframe)

        const res = await fetch(
            `https://api.binance.com/api/v3/klines?symbol=${formattedSymbol}&interval=${interval}&limit=${limit}`
        )

        if (!res.ok) throw new Error('Binance API error')

        const data = await res.json()

        return data.map((candle: any) => ({
            timestamp: new Date(candle[0]),
            open: parseFloat(candle[1]),
            high: parseFloat(candle[2]),
            low: parseFloat(candle[3]),
            close: parseFloat(candle[4]),
            volume: parseFloat(candle[5])
        }))
    }

    private async getAlphaVantageHistoricalData(symbol: string, timeframe: string, limit: number) {
        const apiKey = process.env.ALPHA_VANTAGE_API_KEY
        if (!apiKey) throw new Error('Alpha Vantage API key not configured')

        // Use appropriate function based on timeframe
        const func = timeframe.includes('h') || timeframe.includes('m') ? 'TIME_SERIES_INTRADAY' : 'TIME_SERIES_DAILY'
        const interval = timeframe.includes('h') ? '60min' : '5min'

        const res = await fetch(
            `https://www.alphavantage.co/query?function=${func}&symbol=${symbol}&interval=${interval}&apikey=${apiKey}`
        )

        const data = await res.json()

        // Parse Alpha Vantage response
        const timeSeriesKey = Object.keys(data).find(key => key.includes('Time Series'))
        if (!timeSeriesKey) return []

        const timeSeries = data[timeSeriesKey]
        const candles = []

        for (const [timestamp, values] of Object.entries(timeSeries)) {
            candles.push({
                timestamp: new Date(timestamp),
                open: parseFloat((values as any)['1. open']),
                high: parseFloat((values as any)['2. high']),
                low: parseFloat((values as any)['3. low']),
                close: parseFloat((values as any)['4. close']),
                volume: parseFloat((values as any)['5. volume'] || '0')
            })

            if (candles.length >= limit) break
        }

        return candles.reverse()
    }

    private convertTimeframeToInterval(timeframe: string): string {
        const map: Record<string, string> = {
            '1m': '1m',
            '5m': '5m',
            '15m': '15m',
            '30m': '30m',
            '1h': '1h',
            '4h': '4h',
            '1d': '1d',
            '1w': '1w'
        }
        return map[timeframe] || '1h'
    }

    // Helper methods
    private normalizeAlphaVantageData(data: any, market: string) {
        if (market === 'forex' || market === 'crypto') {
            const rate = data['Realtime Currency Exchange Rate']
            return {
                symbol: `${rate['1. From_Currency Code']}${rate['3. To_Currency Code']}`,
                price: parseFloat(rate['5. Exchange Rate']),
                timestamp: new Date(rate['6. Last Refreshed']).getTime(),
                source: 'Alpha Vantage'
            }
        } else {
            const quote = data['Global Quote']
            return {
                symbol: quote['01. symbol'],
                price: parseFloat(quote['05. price']),
                change24h: parseFloat(quote['10. change percent'].replace('%', '')),
                high24h: parseFloat(quote['03. high']),
                low24h: parseFloat(quote['04. low']),
                volume: parseFloat(quote['06. volume']),
                timestamp: Date.now(),
                source: 'Alpha Vantage'
            }
        }
    }

    private splitForexPair(symbol: string): [string, string] {
        if (symbol.length === 6) {
            return [symbol.substring(0, 3), symbol.substring(3, 6)]
        }
        return ['USD', 'USD']
    }

    private parseImpact(impact: string): 'high' | 'medium' | 'low' {
        if (!impact) return 'low'
        const normalized = impact.toLowerCase()
        if (normalized.includes('high')) return 'high'
        if (normalized.includes('medium')) return 'medium'
        return 'low'
    }

    private calculateSentiment(data: any): number {
        // Simple sentiment calculation based on fundamentals
        let score = 50 // Neutral

        if (data['PERatio'] && parseFloat(data['PERatio']) < 15) score += 10
        if (data['ProfitMargin'] && parseFloat(data['ProfitMargin']) > 0.15) score += 10
        if (data['QuarterlyRevenueGrowthYOY'] && parseFloat(data['QuarterlyRevenueGrowthYOY']) > 0.1) score += 10
        if (data['DebtToEquity'] && parseFloat(data['DebtToEquity']) < 0.5) score += 10

        return Math.min(100, Math.max(0, score))
    }

    private getToday(): string {
        return new Date().toISOString().split('T')[0]
    }

    private getDateDaysAgo(days: number): string {
        const date = new Date()
        date.setDate(date.getDate() - days)
        return date.toISOString().split('T')[0]
    }
}

export const multiSourceDataService = new MultiSourceDataService()
