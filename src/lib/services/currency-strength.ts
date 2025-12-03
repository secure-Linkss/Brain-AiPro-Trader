/**
 * Currency Strength Meter
 * Calculates relative strength of currencies (USD, EUR, GBP, JPY, etc.)
 */

import { prisma } from '@/lib/prisma'
import { marketDataService } from './market-data'

export interface CurrencyStrength {
    currency: string
    strength: number // -100 to +100
    trend: 'strong_bullish' | 'bullish' | 'neutral' | 'bearish' | 'strong_bearish'
    pairs: { [key: string]: number }
}

export class CurrencyStrengthService {

    private readonly currencies = ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'NZD']
    private readonly pairs = [
        'EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD', 'USDCHF', 'NZDUSD',
        'EURGBP', 'EURJPY', 'EURAUD', 'EURCAD', 'EURCHF', 'EURNZD',
        'GBPJPY', 'GBPAUD', 'GBPCAD', 'GBPCHF', 'GBPNZD',
        'AUDJPY', 'AUDCAD', 'AUDCHF', 'AUDNZD',
        'CADJPY', 'CADCHF',
        'CHFJPY',
        'NZDJPY'
    ]

    /**
     * Calculate strength for all major currencies
     */
    async calculateAllStrengths(): Promise<CurrencyStrength[]> {
        const strengths: { [key: string]: number } = {}
        const pairData: { [key: string]: { [key: string]: number } } = {}

        // Initialize
        this.currencies.forEach(curr => {
            strengths[curr] = 0
            pairData[curr] = {}
        })

        // Fetch recent price data for all pairs
        for (const pair of this.pairs) {
            try {
                const priceData = await this.getPairStrength(pair)
                if (priceData) {
                    const [base, quote] = this.splitPair(pair)

                    // Add to base currency strength
                    strengths[base] += priceData.change
                    pairData[base][pair] = priceData.change

                    // Subtract from quote currency strength
                    strengths[quote] -= priceData.change
                    pairData[quote][pair] = -priceData.change
                }
            } catch (error) {
                console.error(`Error fetching ${pair}:`, error)
            }
        }

        // Normalize strengths to -100 to +100 scale
        const maxStrength = Math.max(...Object.values(strengths).map(Math.abs))

        return this.currencies.map(currency => {
            const normalizedStrength = maxStrength > 0 ? (strengths[currency] / maxStrength) * 100 : 0

            return {
                currency,
                strength: normalizedStrength,
                trend: this.getTrend(normalizedStrength),
                pairs: pairData[currency]
            }
        }).sort((a, b) => b.strength - a.strength)
    }

    /**
     * Get best trading pairs based on strength divergence
     */
    async getBestPairs(): Promise<Array<{ pair: string, score: number, reason: string }>> {
        const strengths = await this.calculateAllStrengths()
        const recommendations = []

        // Find strongest vs weakest
        const strongest = strengths[0]
        const weakest = strengths[strengths.length - 1]

        // Check if they form a tradeable pair
        const pair1 = `${strongest.currency}${weakest.currency}`
        const pair2 = `${weakest.currency}${strongest.currency}`

        if (this.pairs.includes(pair1)) {
            recommendations.push({
                pair: pair1,
                score: Math.abs(strongest.strength - weakest.strength),
                reason: `${strongest.currency} is strongest (${strongest.strength.toFixed(1)}), ${weakest.currency} is weakest (${weakest.strength.toFixed(1)})`
            })
        } else if (this.pairs.includes(pair2)) {
            recommendations.push({
                pair: pair2,
                score: Math.abs(strongest.strength - weakest.strength),
                reason: `${weakest.currency} is weakest (${weakest.strength.toFixed(1)}), ${strongest.currency} is strongest (${strongest.strength.toFixed(1)})`
            })
        }

        // Find other high-divergence pairs
        for (let i = 0; i < Math.min(3, strengths.length); i++) {
            for (let j = strengths.length - 1; j >= Math.max(strengths.length - 3, 0); j--) {
                if (i === j) continue

                const strong = strengths[i]
                const weak = strengths[j]
                const divergence = Math.abs(strong.strength - weak.strength)

                if (divergence > 50) { // Significant divergence
                    const testPair1 = `${strong.currency}${weak.currency}`
                    const testPair2 = `${weak.currency}${strong.currency}`

                    if (this.pairs.includes(testPair1) && !recommendations.find(r => r.pair === testPair1)) {
                        recommendations.push({
                            pair: testPair1,
                            score: divergence,
                            reason: `High divergence: ${strong.currency} (+${strong.strength.toFixed(1)}) vs ${weak.currency} (${weak.strength.toFixed(1)})`
                        })
                    } else if (this.pairs.includes(testPair2) && !recommendations.find(r => r.pair === testPair2)) {
                        recommendations.push({
                            pair: testPair2,
                            score: divergence,
                            reason: `High divergence: ${weak.currency} (${weak.strength.toFixed(1)}) vs ${strong.currency} (+${strong.strength.toFixed(1)})`
                        })
                    }
                }
            }
        }

        return recommendations.sort((a, b) => b.score - a.score).slice(0, 5)
    }

    private async getPairStrength(pair: string): Promise<{ change: number } | null> {
        // Get 24h price change
        const data = await marketDataService.getPrice(pair, 'FOREX')
        if (!data) return null

        return {
            change: data.change24h
        }
    }

    private splitPair(pair: string): [string, string] {
        // Most pairs are 6 characters (EURUSD, GBPJPY, etc.)
        if (pair.length === 6) {
            return [pair.substring(0, 3), pair.substring(3, 6)]
        }
        // Handle special cases
        return ['USD', 'USD']
    }

    private getTrend(strength: number): CurrencyStrength['trend'] {
        if (strength > 60) return 'strong_bullish'
        if (strength > 20) return 'bullish'
        if (strength > -20) return 'neutral'
        if (strength > -60) return 'bearish'
        return 'strong_bearish'
    }
}

export const currencyStrengthService = new CurrencyStrengthService()
