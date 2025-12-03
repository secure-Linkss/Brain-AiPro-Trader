/**
 * Investment Opportunity Finder
 * AI-powered system to find investment opportunities based on user criteria
 */

import { prisma } from '@/lib/prisma'
import { llmService } from './llm-service'
import { marketDataService } from './market-data'

export interface InvestmentCriteria {
    capital: number
    timeHorizon: 'short' | 'medium' | 'long' // days, weeks, months
    riskTolerance: 'low' | 'medium' | 'high'
    preferredMarkets: string[] // ['crypto', 'forex', 'stocks', 'commodities']
    goals: string // e.g., "steady income", "capital appreciation", "hedging"
}

export interface InvestmentOpportunity {
    symbol: string
    market: string
    recommendedAllocation: number // percentage of capital
    expectedReturn: number // percentage
    riskLevel: string
    timeframe: string
    strategy: string
    reasoning: string
    entryPrice: number
    targetPrice: number
    stopLoss: number
    confidence: number
}

export class InvestmentFinderService {

    /**
     * Find investment opportunities based on user criteria
     */
    async findOpportunities(criteria: InvestmentCriteria): Promise<InvestmentOpportunity[]> {
        const opportunities: InvestmentOpportunity[] = []

        // 1. Get top performing signals from recent analysis
        const recentSignals = await this.getTopSignals(criteria.preferredMarkets)

        // 2. Filter by risk tolerance
        const filteredSignals = this.filterByRisk(recentSignals, criteria.riskTolerance)

        // 3. Use AI to analyze and recommend allocation
        for (const signal of filteredSignals.slice(0, 5)) { // Top 5
            const opportunity = await this.analyzeOpportunity(signal, criteria)
            if (opportunity) {
                opportunities.push(opportunity)
            }
        }

        // 4. Optimize portfolio allocation
        const optimized = this.optimizeAllocation(opportunities, criteria.capital)

        return optimized
    }

    private async getTopSignals(markets: string[]) {
        return await prisma.signal.findMany({
            where: {
                tradingPair: {
                    market: { in: markets }
                },
                status: 'PENDING',
                strength: { gte: 70 }
            },
            include: {
                tradingPair: true
            },
            orderBy: {
                strength: 'desc'
            },
            take: 20
        })
    }

    private filterByRisk(signals: any[], riskTolerance: string) {
        const riskMap = {
            'low': { minStrength: 85, maxVolatility: 0.02 },
            'medium': { minStrength: 75, maxVolatility: 0.05 },
            'high': { minStrength: 65, maxVolatility: 0.10 }
        }

        const threshold = riskMap[riskTolerance]

        return signals.filter(s => {
            const volatility = Math.abs(s.takeProfit1 - s.stopLoss) / s.entryPrice
            return s.strength >= threshold.minStrength && volatility <= threshold.maxVolatility
        })
    }

    private async analyzeOpportunity(signal: any, criteria: InvestmentCriteria): Promise<InvestmentOpportunity | null> {
        try {
            // Use LLM to provide detailed analysis
            const prompt = `
Analyze this trading opportunity for an investor:

Symbol: ${signal.tradingPair.symbol}
Market: ${signal.tradingPair.market}
Current Price: ${signal.entryPrice}
Signal Type: ${signal.type}
Target: ${signal.takeProfit1}
Stop Loss: ${signal.stopLoss}
Strategy: ${signal.strategy}
Confidence: ${signal.strength}%

Investor Profile:
- Capital: $${criteria.capital}
- Time Horizon: ${criteria.timeHorizon}
- Risk Tolerance: ${criteria.riskTolerance}
- Goals: ${criteria.goals}

Provide:
1. Recommended allocation (% of capital)
2. Expected return (%)
3. Risk assessment
4. Reasoning (2-3 sentences)

Format: JSON
{
  "allocation": number,
  "expectedReturn": number,
  "riskLevel": "low|medium|high",
  "reasoning": "string"
}
`

            const analysis = await llmService.generateCompletion(prompt, 'analysis')
            const parsed = JSON.parse(analysis)

            return {
                symbol: signal.tradingPair.symbol,
                market: signal.tradingPair.market,
                recommendedAllocation: parsed.allocation,
                expectedReturn: parsed.expectedReturn,
                riskLevel: parsed.riskLevel,
                timeframe: criteria.timeHorizon,
                strategy: signal.strategy,
                reasoning: parsed.reasoning,
                entryPrice: signal.entryPrice,
                targetPrice: signal.takeProfit1,
                stopLoss: signal.stopLoss,
                confidence: signal.strength
            }
        } catch (error) {
            console.error('Error analyzing opportunity:', error)
            return null
        }
    }

    private optimizeAllocation(opportunities: InvestmentOpportunity[], capital: number): InvestmentOpportunity[] {
        // Ensure total allocation doesn't exceed 100%
        const totalAllocation = opportunities.reduce((sum, opp) => sum + opp.recommendedAllocation, 0)

        if (totalAllocation > 100) {
            // Normalize allocations
            opportunities.forEach(opp => {
                opp.recommendedAllocation = (opp.recommendedAllocation / totalAllocation) * 100
            })
        }

        // Calculate actual dollar amounts
        opportunities.forEach(opp => {
            const amount = (capital * opp.recommendedAllocation) / 100
            // Add to metadata (you could add a new field)
        })

        return opportunities.sort((a, b) => b.confidence - a.confidence)
    }
}

export const investmentFinderService = new InvestmentFinderService()
