/**
 * Multi-Agent Trading System
 * Intelligent sub-agents that work in sequence to analyze different markets
 */

import { llmService } from './llm-service'
import { prisma } from '@/lib/prisma'

export interface AgentTask {
    id: string
    type: 'market_analysis' | 'pattern_detection' | 'news_analysis' | 'risk_assessment' | 'signal_generation'
    market: 'forex' | 'crypto' | 'stocks' | 'commodities' | 'indices'
    symbols: string[]
    timeframe: string
    priority: number
    status: 'pending' | 'running' | 'completed' | 'failed'
    result?: any
    error?: string
    startedAt?: Date
    completedAt?: Date
}

export interface AgentResult {
    agentId: string
    agentName: string
    market: string
    symbols: string[]
    findings: Array<{
        symbol: string
        signal: 'BUY' | 'SELL' | 'HOLD'
        confidence: number
        reasoning: string
        strategies: string[]
        entryPrice: number
        stopLoss: number
        takeProfit1: number
        takeProfit2?: number
        takeProfit3?: number
        indicators: Record<string, any>
    }>
    summary: string
    timestamp: Date
}

export class TradingAgent {
    constructor(
        public id: string,
        public name: string,
        public specialization: string,
        public markets: string[]
    ) { }

    /**
   * Advanced Sub-Agent Coordination
   * Each agent analyzes independently then collaborates
   */
    async analyzeWithSubAgents(task: AnalysisTask): Promise<SubAgentResult[]> {
        const results: SubAgentResult[] = []

        // Phase 1: Independent Analysis
        console.log(`[Multi-Agent] Starting independent analysis for ${task.symbol}`)

        for (const agent of this.agents) {
            try {
                const result = await this.runSubAgent(agent, task)
                if (result) {
                    results.push(result)
                }
            } catch (error) {
                console.error(`[${agent.name}] Analysis failed:`, error)
            }
        }

        // Phase 2: Cross-Validation
        const validatedResults = await this.crossValidateResults(results, task)

        // Phase 3: Consensus Building
        const consensus = await this.buildConsensus(validatedResults)

        // Phase 4: Backtesting Validation
        if (consensus.confidence >= 80) {
            const backtestScore = await this.validateWithBacktest(consensus, task)
            consensus.confidence = (consensus.confidence + backtestScore) / 2
        }

        return validatedResults
    }

    /**
     * Run individual sub-agent with full context
     */
    private async runSubAgent(agent: Agent, task: AnalysisTask): Promise<SubAgentResult | null> {
        const startTime = Date.now()

        // Get market context
        const marketContext = await this.getMarketContext(task.symbol)

        // Get historical performance of this agent
        const agentPerformance = await this.getAgentPerformance(agent.name, task.symbol)

        // Build comprehensive prompt
        const prompt = `
You are ${agent.name}, a specialized ${agent.specialty} analyst.

MARKET: ${task.symbol}
TIMEFRAME: ${task.timeframe}
CURRENT PRICE: ${marketContext.currentPrice}

YOUR SPECIALIZATION: ${agent.specialty}
YOUR HISTORICAL WIN RATE: ${agentPerformance.winRate}%
YOUR AVERAGE CONFIDENCE: ${agentPerformance.avgConfidence}%

MARKET DATA:
- 24h Change: ${marketContext.change24h}%
- Volume: ${marketContext.volume}
- High/Low: ${marketContext.high24h} / ${marketContext.low24h}

TECHNICAL INDICATORS:
${JSON.stringify(marketContext.indicators, null, 2)}

RECENT PATTERNS DETECTED:
${JSON.stringify(marketContext.patterns, null, 2)}

TASK: Provide a detailed trading analysis including:
1. Market Structure Assessment
2. Entry/Exit Levels
3. Risk Assessment
4. Confidence Score (0-100)
5. Reasoning (detailed)

Format as JSON:
{
  "signal": "BUY|SELL|NEUTRAL",
  "confidence": number,
  "entryPrice": number,
  "stopLoss": number,
  "takeProfit": number,
  "reasoning": "detailed explanation",
  "riskLevel": "low|medium|high",
  "timeframe": "string"
}
`

        try {
            const response = await llmService.generateCompletion(prompt, agent.name)
            const analysis = JSON.parse(response)

            const executionTime = Date.now() - startTime

            return {
                agentName: agent.name,
                signal: analysis.signal,
                confidence: analysis.confidence,
                reasoning: analysis.reasoning,
                entryPrice: analysis.entryPrice,
                stopLoss: analysis.stopLoss,
                takeProfit: analysis.takeProfit,
                riskLevel: analysis.riskLevel,
                executionTime,
                metadata: {
                    historicalWinRate: agentPerformance.winRate,
                    marketCondition: marketContext.condition
                }
            }
        } catch (error) {
            console.error(`[${agent.name}] Failed to analyze:`, error)
            return null
        }
    }

    /**
     * Cross-validate results between agents
     */
    private async crossValidateResults(results: SubAgentResult[], task: AnalysisTask): Promise<SubAgentResult[]> {
        // Check for consensus
        const buySignals = results.filter(r => r.signal === 'BUY')
        const sellSignals = results.filter(r => r.signal === 'SELL')

        // If strong disagreement, reduce confidence
        if (buySignals.length > 0 && sellSignals.length > 0) {
            const disagreementPenalty = 0.2
            results.forEach(r => {
                r.confidence *= (1 - disagreementPenalty)
            })
        }

        // Boost confidence if multiple high-performing agents agree
        const highConfidenceAgents = results.filter(r => r.confidence >= 85)
        if (highConfidenceAgents.length >= 3) {
            highConfidenceAgents.forEach(r => {
                r.confidence = Math.min(95, r.confidence * 1.1)
            })
        }

        return results
    }

    /**
     * Build consensus from all agent results
     */
    /**
     * Build consensus from all agent results
     * Implements "Strict Consensus" logic for guru-level accuracy
     */
    private async buildConsensus(results: SubAgentResult[]): Promise<SubAgentResult> {
        const buyVotes = results.filter(r => r.signal === 'BUY')
        const sellVotes = results.filter(r => r.signal === 'SELL')
        const totalAgents = results.length

        // 1. Majority Vote Requirement (60%+)
        let signal: 'BUY' | 'SELL' | 'NEUTRAL' = 'NEUTRAL'
        if (buyVotes.length >= totalAgents * 0.6) signal = 'BUY'
        else if (sellVotes.length >= totalAgents * 0.6) signal = 'SELL'

        const relevantResults = signal === 'BUY' ? buyVotes : sellVotes

        // 2. Risk Veto: If ANY agent flags "high" risk, kill the trade
        const highRiskAlerts = results.filter(r => r.riskLevel === 'high')
        if (highRiskAlerts.length > 0) {
            console.log(`[Consensus] Trade vetoed due to high risk flag from ${highRiskAlerts.length} agents`)
            signal = 'NEUTRAL'
        }

        if (signal === 'NEUTRAL' || relevantResults.length === 0) {
            return {
                agentName: 'Consensus',
                signal: 'NEUTRAL',
                confidence: 0,
                reasoning: 'No clear consensus or high risk detected',
                entryPrice: 0,
                stopLoss: 0,
                takeProfit: 0,
                riskLevel: 'high',
                executionTime: 0
            }
        }

        // 3. Weighted Confidence Calculation
        const totalWeight = relevantResults.reduce((sum, r) => sum + (r.metadata?.historicalWinRate || 50), 0)
        const weightedConfidence = relevantResults.reduce((sum, r) => {
            const weight = (r.metadata?.historicalWinRate || 50) / totalWeight
            return sum + (r.confidence * weight)
        }, 0)

        // 4. System Threshold Check (fetched dynamically in real-time, defaulting to 75% here)
        // Note: The caller (analyze) will filter against the DB setting, but we enforce a hard floor here.
        if (weightedConfidence < 75) {
            return {
                agentName: 'Consensus',
                signal: 'NEUTRAL',
                confidence: weightedConfidence,
                reasoning: `Confidence ${weightedConfidence.toFixed(1)}% below guru threshold (75%)`,
                entryPrice: 0,
                stopLoss: 0,
                takeProfit: 0,
                riskLevel: 'medium',
                executionTime: 0
            }
        }

        return {
            agentName: 'Consensus',
            signal,
            confidence: weightedConfidence,
            reasoning: `${relevantResults.length}/${totalAgents} agents agree on ${signal} with ${weightedConfidence.toFixed(1)}% confidence`,
            entryPrice: relevantResults[0].entryPrice, // Use primary agent's levels
            stopLoss: relevantResults[0].stopLoss,
            takeProfit: relevantResults[0].takeProfit,
            riskLevel: this.calculateOverallRisk(relevantResults),
            executionTime: 0,
            metadata: {
                agentCount: relevantResults.length,
                totalAgents: totalAgents,
                voteRatio: relevantResults.length / totalAgents
            }
        }
    }

    /**
     * Validate signal with backtesting
     */
    private async validateWithBacktest(consensus: SubAgentResult, task: AnalysisTask): Promise<number> {
        // Check if similar setups have worked in the past
        const historicalPerformance = await prisma.backtestResult.findMany({
            where: {
                symbol: task.symbol,
                strategyName: { contains: consensus.agentName }
            },
            orderBy: { createdAt: 'desc' },
            take: 10
        })

        if (historicalPerformance.length === 0) return consensus.confidence

        const avgWinRate = historicalPerformance.reduce((sum, r) => sum + r.winRate, 0) / historicalPerformance.length

        // Adjust confidence based on historical performance
        return (consensus.confidence + avgWinRate) / 2
    }

    private async getMarketContext(symbol: string) {
        // Fetch real-time market data
        const pair = await prisma.tradingPair.findUnique({ where: { symbol } })
        if (!pair) throw new Error('Trading pair not found')

        // Get latest price data
        const latestPrice = await prisma.priceData.findFirst({
            where: { tradingPairId: pair.id },
            orderBy: { timestamp: 'desc' }
        })

        return {
            currentPrice: latestPrice?.close || 0,
            change24h: 0, // Calculate from historical data
            volume: latestPrice?.volume || 0,
            high24h: latestPrice?.high || 0,
            low24h: latestPrice?.low || 0,
            indicators: {},
            patterns: [],
            condition: 'normal'
        }
    }

    private async getAgentPerformance(agentName: string, symbol: string) {
        const results = await prisma.backtestResult.findMany({
            where: {
                strategyName: { contains: agentName },
                symbol
            },
            take: 20
        })

        if (results.length === 0) {
            return { winRate: 50, avgConfidence: 70 }
        }

        const avgWinRate = results.reduce((sum, r) => sum + r.winRate, 0) / results.length

        return {
            winRate: avgWinRate,
            avgConfidence: 75
        }
    }

    private calculateOverallRisk(results: SubAgentResult[]): 'low' | 'medium' | 'high' {
        const riskScores = results.map(r => {
            switch (r.riskLevel) {
                case 'low': return 1
                case 'medium': return 2
                case 'high': return 3
                default: return 2
            }
        })

        const avgRisk = riskScores.reduce((a, b) => a + b, 0) / riskScores.length

        if (avgRisk < 1.5) return 'low'
        if (avgRisk < 2.5) return 'medium'
        return 'high'
    }

    /**
     * Analyze market and generate signals
     */
    async analyze(task: AgentTask): Promise<AgentResult> {
        console.log(`[${this.name}] Starting analysis for ${task.symbols.join(', ')}`)

        const findings = []

        for (const symbol of task.symbols) {
            try {
                // Get latest price data
                const priceData = await this.getPriceData(symbol, task.timeframe)

                // Get technical indicators
                const indicators = await this.calculateIndicators(priceData)

                // Get pattern detection results
                const patterns = await this.detectPatterns(priceData, indicators)

                // Get news sentiment
                const newsSentiment = await this.analyzeNews(symbol)

                // Generate signal using LLM
                const signal = await this.generateSignal(
                    symbol,
                    priceData,
                    indicators,
                    patterns,
                    newsSentiment
                )

                if (signal) {
                    findings.push(signal)
                }
            } catch (error) {
                console.error(`[${this.name}] Error analyzing ${symbol}:`, error)
            }
        }

        // Generate summary using LLM
        const summary = await this.generateSummary(findings)

        return {
            agentId: this.id,
            agentName: this.name,
            market: task.market,
            symbols: task.symbols,
            findings,
            summary,
            timestamp: new Date()
        }
    }

    /**
     * Get price data from database
     */
    private async getPriceData(symbol: string, timeframe: string) {
        const tradingPair = await prisma.tradingPair.findFirst({
            where: { symbol },
            include: {
                priceData: {
                    where: { timeframe },
                    orderBy: { timestamp: 'desc' },
                    take: 500
                }
            }
        })

        if (!tradingPair || tradingPair.priceData.length === 0) {
            throw new Error(`No price data found for ${symbol}`)
        }

        return tradingPair.priceData
    }

    /**
     * Calculate technical indicators
     */
    private async calculateIndicators(priceData: any[]) {
        try {
            // Call Python pattern detector service
            const response = await fetch(`${process.env.PYTHON_PATTERN_DETECTOR_URL}/indicators`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    candles: priceData.map(p => ({
                        timestamp: p.timestamp,
                        open: p.open,
                        high: p.high,
                        low: p.low,
                        close: p.close,
                        volume: p.volume
                    }))
                })
            })

            if (!response.ok) {
                throw new Error('Failed to calculate indicators')
            }

            return await response.json()
        } catch (error) {
            console.warn("Python Pattern Detector service unavailable. Returning empty indicators.", error)
            // Return empty structure to prevent crash
            return {
                atr: [],
                rsi: [],
                macd: { macd: [], signal: [], histogram: [] },
                adx: [],
                obv: [],
                ema_ribbon: [],
                vwap: []
            }
        }
    }

    /**
     * Detect patterns
     */
    private async detectPatterns(priceData: any[], indicators: any) {
        try {
            // Fetch system settings for confidence threshold
            const settings = await prisma.systemSettings.findFirst()
            const minConfidence = settings?.minSignalConfidence || 75

            const response = await fetch(`${process.env.PYTHON_PATTERN_DETECTOR_URL}/detect`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    symbol: "UNKNOWN", // Fallback if not available
                    timeframe: "1h",
                    candles: priceData.map(p => ({
                        timestamp: p.timestamp,
                        open: p.open,
                        high: p.high,
                        low: p.low,
                        close: p.close,
                        volume: p.volume
                    })),
                    min_confidence: minConfidence, // Use configurable threshold
                    require_volume_confirmation: true
                })
            })

            if (!response.ok) {
                throw new Error('Failed to detect patterns')
            }

            return await response.json()
        } catch (error) {
            console.warn("Python Pattern Detector service unavailable. Returning empty patterns.", error)
            return { patterns: [], ensemble_signal: "NEUTRAL", ensemble_confidence: 0 }
        }
    }

    /**
     * Analyze news sentiment
     */
    private async analyzeNews(symbol: string) {
        const recentNews = await prisma.newsArticle.findMany({
            where: {
                affectedSymbols: {
                    has: symbol
                },
                publishedAt: {
                    gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
                }
            },
            orderBy: { publishedAt: 'desc' },
            take: 10
        })

        if (recentNews.length === 0) {
            return { sentiment: 0, impact: 0, summary: 'No recent news' }
        }

        const avgSentiment = recentNews.reduce((sum, n) => sum + (n.sentiment || 0), 0) / recentNews.length
        const avgImpact = recentNews.reduce((sum, n) => sum + (n.impactScore || 0), 0) / recentNews.length

        return {
            sentiment: avgSentiment,
            impact: avgImpact,
            summary: recentNews.map(n => n.title).join('; ')
        }
    }

    /**
     * Generate trading signal using LLM
     */
    private async generateSignal(
        symbol: string,
        priceData: any[],
        indicators: any,
        patterns: any,
        newsSentiment: any
    ) {
        const latestPrice = priceData[0]

        const prompt = `
You are an expert trading analyst. Analyze the following data and provide a trading signal.

Symbol: ${symbol}
Current Price: ${latestPrice.close}
Timeframe: ${latestPrice.timeframe}

Technical Indicators:
${JSON.stringify(indicators, null, 2)}

Detected Patterns:
${JSON.stringify(patterns.patterns || [], null, 2)}

News Sentiment:
${JSON.stringify(newsSentiment, null, 2)}

Based on this analysis, provide:
1. Signal: BUY, SELL, or HOLD
2. Confidence: 0-100
3. Entry Price
4. Stop Loss
5. Take Profit levels (TP1, TP2, TP3)
6. Reasoning (detailed explanation)
7. Strategies used (list of strategies that confirm this signal)

Respond in JSON format:
{
  "signal": "BUY|SELL|HOLD",
  "confidence": 75,
  "entryPrice": 1.2345,
  "stopLoss": 1.2300,
  "takeProfit1": 1.2400,
  "takeProfit2": 1.2450,
  "takeProfit3": 1.2500,
  "reasoning": "Detailed explanation...",
  "strategies": ["head_shoulders", "rsi_divergence", "volume_confirmation"]
}
`

        try {
            const response = await llmService.generateCompletion({
                prompt,
                systemPrompt: 'You are a professional trading analyst. Always respond with valid JSON only.',
                temperature: 0.3,
                maxTokens: 1000
            })

            // Parse JSON response
            const jsonMatch = response.content.match(/\{[\s\S]*\}/)
            if (!jsonMatch) {
                throw new Error('Invalid JSON response from LLM')
            }

            const signal = JSON.parse(jsonMatch[0])

            // Validate signal
            if (!signal.signal || !['BUY', 'SELL', 'HOLD'].includes(signal.signal)) {
                throw new Error('Invalid signal type')
            }

            if (signal.signal === 'HOLD') {
                return null // Skip HOLD signals
            }

            return {
                symbol,
                signal: signal.signal,
                confidence: signal.confidence,
                reasoning: signal.reasoning,
                strategies: signal.strategies || [],
                entryPrice: signal.entryPrice,
                stopLoss: signal.stopLoss,
                takeProfit1: signal.takeProfit1,
                takeProfit2: signal.takeProfit2,
                takeProfit3: signal.takeProfit3,
                indicators
            }
        } catch (error) {
            console.error(`Error generating signal for ${symbol}:`, error)
            return null
        }
    }

    /**
     * Generate summary of findings
     */
    private async generateSummary(findings: any[]): Promise<string> {
        if (findings.length === 0) {
            return 'No trading opportunities found in this analysis.'
        }

        const prompt = `
Summarize the following trading signals in 2-3 sentences:

${findings.map((f, i) => `
${i + 1}. ${f.symbol}: ${f.signal} signal with ${f.confidence}% confidence
   Reasoning: ${f.reasoning}
`).join('\n')}

Provide a concise summary highlighting the most important opportunities.
`

        const response = await llmService.generateCompletion({
            prompt,
            systemPrompt: 'You are a professional trading analyst. Be concise and clear.',
            temperature: 0.5,
            maxTokens: 200
        })

        return response.content
    }
}

/**
 * Multi-Agent Coordinator
 * Manages multiple agents working in sequence
 */
export class MultiAgentCoordinator {
    private agents: TradingAgent[]
    private taskQueue: AgentTask[]
    private isRunning: boolean = false

    constructor() {
        this.agents = this.initializeAgents()
        this.taskQueue = []
    }

    /**
     * Initialize specialized agents
     */
    private initializeAgents(): TradingAgent[] {
        return [
            new TradingAgent(
                'forex-analyst',
                'Forex Market Analyst',
                'Major and minor forex pairs analysis',
                ['forex']
            ),
            new TradingAgent(
                'crypto-analyst',
                'Cryptocurrency Analyst',
                'Bitcoin, Ethereum, and altcoin analysis',
                ['crypto']
            ),
            new TradingAgent(
                'stock-analyst',
                'Stock Market Analyst',
                'US and international stocks analysis',
                ['stocks']
            ),
            new TradingAgent(
                'commodity-analyst',
                'Commodities Analyst',
                'Gold, silver, oil, and other commodities',
                ['commodities']
            ),
            new TradingAgent(
                'index-analyst',
                'Indices Analyst',
                'Major stock indices analysis',
                ['indices']
            )
        ]
    }

    /**
     * Add task to queue
     */
    addTask(task: AgentTask) {
        this.taskQueue.push(task)
        this.taskQueue.sort((a, b) => b.priority - a.priority)
    }

    /**
     * Start processing tasks
     */
    async start() {
        if (this.isRunning) {
            console.log('Multi-agent system is already running')
            return
        }

        this.isRunning = true
        console.log('Multi-agent system started')

        while (this.isRunning) {
            if (this.taskQueue.length === 0) {
                await this.sleep(5000) // Wait 5 seconds
                continue
            }

            const task = this.taskQueue.shift()!
            await this.processTask(task)
        }
    }

    /**
     * Stop processing tasks
     */
    stop() {
        this.isRunning = false
        console.log('Multi-agent system stopped')
    }

    /**
     * Process a single task
     */
    private async processTask(task: AgentTask) {
        task.status = 'running'
        task.startedAt = new Date()

        try {
            // Find appropriate agent
            const agent = this.agents.find(a => a.markets.includes(task.market))

            if (!agent) {
                throw new Error(`No agent available for market: ${task.market}`)
            }

            // Run analysis
            const result = await agent.analyze(task)

            // Save results to database
            await this.saveResults(result)

            task.status = 'completed'
            task.result = result
            task.completedAt = new Date()

            console.log(`Task ${task.id} completed by ${agent.name}`)
        } catch (error: any) {
            task.status = 'failed'
            task.error = error.message
            task.completedAt = new Date()

            console.error(`Task ${task.id} failed:`, error)
        }
    }

    /**
     * Save agent results to database
     */
    private async saveResults(result: AgentResult) {
        // Fetch system settings for confidence threshold
        const settings = await prisma.systemSettings.findFirst()
        const minConfidence = settings?.minSignalConfidence || 75
        const maxConfidence = settings?.maxSignalConfidence || 95

        for (const finding of result.findings) {
            try {
                // Filter signals below minimum confidence
                if (finding.confidence < minConfidence) {
                    console.log(`Signal for ${finding.symbol} filtered out (confidence: ${finding.confidence}% < ${minConfidence}%)`)
                    continue
                }

                // Cap confidence at maximum
                const cappedConfidence = Math.min(finding.confidence, maxConfidence)

                // Find trading pair
                const tradingPair = await prisma.tradingPair.findFirst({
                    where: { symbol: finding.symbol }
                })

                if (!tradingPair) continue

                // Create signal
                await prisma.signal.create({
                    data: {
                        userId: 'system', // System-generated signal
                        tradingPairId: tradingPair.id,
                        type: finding.signal,
                        strength: cappedConfidence, // Use capped confidence
                        strategy: finding.strategies.join(', '),
                        entryPrice: finding.entryPrice,
                        stopLoss: finding.stopLoss,
                        takeProfit1: finding.takeProfit1,
                        takeProfit2: finding.takeProfit2,
                        takeProfit3: finding.takeProfit3,
                        reason: finding.reasoning,
                        confirmations: finding.strategies.length,
                        fibonacci: finding.indicators.fibonacci || null,
                        isConfirmed: cappedConfidence >= 70
                    }
                })

                console.log(`Signal saved for ${finding.symbol} (confidence: ${cappedConfidence}%)`)
            } catch (error) {
                console.error(`Error saving signal for ${finding.symbol}:`, error)
            }
        }
    }

    /**
     * Get agent statistics
     */
    getStats() {
        return {
            agents: this.agents.map(a => ({
                id: a.id,
                name: a.name,
                specialization: a.specialization,
                markets: a.markets
            })),
            queueLength: this.taskQueue.length,
            isRunning: this.isRunning
        }
    }

    private sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms))
    }
}

// Singleton instance
export const multiAgentCoordinator = new MultiAgentCoordinator()
