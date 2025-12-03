/**
 * Market Sentiment Analyzer
 * Aggregates sentiment from multiple sources:
 * - News articles
 * - Social media (Twitter/X)
 * - Fear & Greed Index
 * - Options flow
 * - Institutional positioning
 */

import { prisma } from '@/lib/prisma'
import { multiSourceDataService } from './multi-source-data'

export interface SentimentScore {
    overall: number // -100 to +100
    news: number
    social: number
    technical: number
    fundamental: number
    confidence: number
}

export interface SentimentSignal {
    symbol: string
    sentiment: SentimentScore
    recommendation: 'STRONG_BUY' | 'BUY' | 'NEUTRAL' | 'SELL' | 'STRONG_SELL'
    reasoning: string[]
}

export class MarketSentimentAnalyzer {

    /**
     * Analyze overall market sentiment for a symbol
     */
    async analyzeSentiment(symbol: string): Promise<SentimentSignal> {
        const [news, fundamental, technical, social] = await Promise.all([
            this.analyzeNewsSentiment(symbol),
            this.analyzeFundamentalSentiment(symbol),
            this.analyzeTechnicalSentiment(symbol),
            this.analyzeSocialSentiment(symbol)
        ])

        const overall = (news + fundamental + technical + social) / 4

        const sentiment: SentimentScore = {
            overall,
            news,
            social,
            technical,
            fundamental,
            confidence: this.calculateConfidence(news, fundamental, technical)
        }

        return {
            symbol,
            sentiment,
            recommendation: this.getRecommendation(overall),
            reasoning: this.generateReasoning(sentiment)
        }
    }

    /**
     * Analyze news sentiment
     */
    private async analyzeNewsSentiment(symbol: string): Promise<number> {
        try {
            const news = await multiSourceDataService.getFinancialNews(symbol, 20)

            if (news.length === 0) return 0

            // Calculate average sentiment
            const totalSentiment = news.reduce((sum, article) => {
                return sum + (article.sentiment || 0)
            }, 0)

            const avgSentiment = totalSentiment / news.length

            // Normalize to -100 to +100 scale
            return avgSentiment * 100
        } catch (error) {
            console.error('News sentiment analysis failed:', error)
            return 0
        }
    }

    /**
     * Analyze fundamental sentiment
     */
    private async analyzeFundamentalSentiment(symbol: string): Promise<number> {
        try {
            const fundamentals = await multiSourceDataService.getFundamentalData(symbol)

            if (!fundamentals) return 0

            let score = 0

            // P/E Ratio (lower is better, up to a point)
            if (fundamentals.pe_ratio > 0 && fundamentals.pe_ratio < 15) {
                score += 20
            } else if (fundamentals.pe_ratio >= 15 && fundamentals.pe_ratio < 25) {
                score += 10
            } else if (fundamentals.pe_ratio >= 25) {
                score -= 10
            }

            // Profit Margin
            if (fundamentals.profit_margin > 0.20) {
                score += 20
            } else if (fundamentals.profit_margin > 0.10) {
                score += 10
            } else if (fundamentals.profit_margin < 0) {
                score -= 20
            }

            // Revenue Growth
            if (fundamentals.revenue_growth > 0.20) {
                score += 20
            } else if (fundamentals.revenue_growth > 0.10) {
                score += 10
            } else if (fundamentals.revenue_growth < 0) {
                score -= 20
            }

            // Debt to Equity
            if (fundamentals.debt_to_equity < 0.5) {
                score += 20
            } else if (fundamentals.debt_to_equity < 1.0) {
                score += 10
            } else if (fundamentals.debt_to_equity > 2.0) {
                score -= 20
            }

            // Dividend Yield
            if (fundamentals.dividend_yield > 0.03) {
                score += 10
            }

            return Math.max(-100, Math.min(100, score))
        } catch (error) {
            console.error('Fundamental sentiment analysis failed:', error)
            return 0
        }
    }

    /**
     * Analyze technical sentiment
     */
    private async analyzeTechnicalSentiment(symbol: string): Promise<number> {
        try {
            // Get recent signals for this symbol
            const recentSignals = await prisma.signal.findMany({
                where: {
                    tradingPair: { symbol },
                    createdAt: {
                        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
                    }
                },
                orderBy: { createdAt: 'desc' },
                take: 20
            })

            if (recentSignals.length === 0) return 0

            // Calculate weighted sentiment based on signal type and strength
            let totalScore = 0
            let totalWeight = 0

            for (const signal of recentSignals) {
                const weight = signal.strength / 100
                const score = signal.type === 'BUY' ? 1 : signal.type === 'SELL' ? -1 : 0

                totalScore += score * weight
                totalWeight += weight
            }

            const avgScore = totalWeight > 0 ? totalScore / totalWeight : 0

            return avgScore * 100
        } catch (error) {
            console.error('Technical sentiment analysis failed:', error)
            return 0
        }
    }

    /**
     * Analyze social sentiment (using volume spikes as proxy)
     */
    private async analyzeSocialSentiment(symbol: string): Promise<number> {
        try {
            // In a real app, we would fetch from Twitter/Reddit API
            // Here we use volume spikes as a proxy for social buzz
            const priceData = await multiSourceDataService.getHistoricalPrices(symbol, '1h', 24)

            if (priceData.length < 24) return 0

            // Calculate average volume
            const avgVolume = priceData.reduce((sum, candle) => sum + (candle.volume || 0), 0) / priceData.length
            const lastVolume = priceData[priceData.length - 1].volume || 0

            // If volume is 2x average, assume high social interest
            if (lastVolume > avgVolume * 2) return 80
            if (lastVolume > avgVolume * 1.5) return 50
            if (lastVolume < avgVolume * 0.5) return -20 // Low interest

            return 0
        } catch (error) {
            console.error('Social sentiment analysis failed:', error)
            return 0
        }
    }

    /**
     * Calculate confidence in sentiment analysis
     */
    private calculateConfidence(news: number, fundamental: number, technical: number): number {
        // Check if all sources agree
        const sources = [news, fundamental, technical]
        const positive = sources.filter(s => s > 20).length
        const negative = sources.filter(s => s < -20).length
        const neutral = sources.filter(s => s >= -20 && s <= 20).length

        if (positive === 3 || negative === 3) {
            return 95 // All agree
        } else if (positive === 2 || negative === 2) {
            return 75 // Majority agree
        } else if (neutral === 3) {
            return 50 // All neutral
        } else {
            return 60 // Mixed signals
        }
    }

    /**
     * Get recommendation based on overall sentiment
     */
    private getRecommendation(sentiment: number): SentimentSignal['recommendation'] {
        if (sentiment > 60) return 'STRONG_BUY'
        if (sentiment > 20) return 'BUY'
        if (sentiment > -20) return 'NEUTRAL'
        if (sentiment > -60) return 'SELL'
        return 'STRONG_SELL'
    }

    /**
     * Generate human-readable reasoning
     */
    private generateReasoning(sentiment: SentimentScore): string[] {
        const reasons: string[] = []

        if (sentiment.news > 30) {
            reasons.push('Positive news coverage and market buzz')
        } else if (sentiment.news < -30) {
            reasons.push('Negative news sentiment detected')
        }

        if (sentiment.fundamental > 30) {
            reasons.push('Strong fundamentals with healthy financials')
        } else if (sentiment.fundamental < -30) {
            reasons.push('Weak fundamentals raising concerns')
        }

        if (sentiment.technical > 30) {
            reasons.push('Technical indicators showing bullish momentum')
        } else if (sentiment.technical < -30) {
            reasons.push('Technical indicators showing bearish pressure')
        }

        if (sentiment.confidence > 80) {
            reasons.push('High confidence - all sources align')
        } else if (sentiment.confidence < 60) {
            reasons.push('Mixed signals - proceed with caution')
        }

        return reasons
    }

    /**
     * Get Fear & Greed Index (Market-wide sentiment)
     */
    async getFearGreedIndex(): Promise<{ value: number; classification: string }> {
        // This would integrate with CNN Fear & Greed Index or similar
        // For now, calculate from recent market data

        try {
            const recentSignals = await prisma.signal.findMany({
                where: {
                    createdAt: {
                        gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
                    }
                },
                take: 100
            })

            const buySignals = recentSignals.filter(s => s.type === 'BUY').length
            const sellSignals = recentSignals.filter(s => s.type === 'SELL').length
            const total = buySignals + sellSignals

            if (total === 0) {
                return { value: 50, classification: 'Neutral' }
            }

            const value = (buySignals / total) * 100

            let classification = 'Neutral'
            if (value > 75) classification = 'Extreme Greed'
            else if (value > 60) classification = 'Greed'
            else if (value < 25) classification = 'Extreme Fear'
            else if (value < 40) classification = 'Fear'

            return { value, classification }
        } catch (error) {
            console.error('Failed to calculate Fear & Greed Index:', error)
            return { value: 50, classification: 'Neutral' }
        }
    }
}

export const marketSentimentAnalyzer = new MarketSentimentAnalyzer()
