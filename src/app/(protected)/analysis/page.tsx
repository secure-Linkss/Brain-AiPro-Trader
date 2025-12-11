'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TrendingUp, TrendingDown, BarChart3, Activity, Brain, AlertCircle } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

interface AdvancedAnalysis {
    symbol: string
    timestamp: string
    technicalScore: number
    fundamentalScore: number
    sentimentScore: number
    overallScore: number
    recommendation: 'STRONG_BUY' | 'BUY' | 'HOLD' | 'SELL' | 'STRONG_SELL'
    technical: {
        trend: string
        support: number[]
        resistance: number[]
        indicators: {
            rsi: number
            macd: { value: number; signal: number }
            bollingerBands: { upper: number; middle: number; lower: number }
            adx: number
        }
        patterns: string[]
    }
    aiInsights: {
        marketRegime: string
        volatility: string
        momentum: string
        keyLevels: string[]
        riskFactors: string[]
        opportunities: string[]
    }
    priceTargets: {
        bullish: number[]
        bearish: number[]
        neutral: number
    }
}

export default function AnalysisPage() {
    const [analysis, setAnalysis] = useState<AdvancedAnalysis | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [symbol, setSymbol] = useState('BTCUSD')

    const fetchAnalysis = async () => {
        try {
            setLoading(true)
            setError(null)

            const response = await fetch(`/api/analysis/advanced?symbol=${symbol}`)

            if (!response.ok) throw new Error('Failed to fetch analysis')

            const data = await response.json()
            setAnalysis(data.analysis)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchAnalysis()
    }, [])

    if (loading) {
        return (
            <div className="container mx-auto p-6 space-y-6">
                <Skeleton className="h-10 w-64" />
                <div className="grid gap-6 md:grid-cols-3">
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-32" />
                    ))}
                </div>
                <Skeleton className="h-96" />
            </div>
        )
    }

    if (error) {
        return (
            <div className="container mx-auto p-6">
                <Card className="border-red-200 bg-red-50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-red-600">
                            <AlertCircle className="h-5 w-5" />
                            Error Loading Analysis
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-red-600">{error}</p>
                        <Button onClick={fetchAnalysis} className="mt-4">Try Again</Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (!analysis) return null

    const getRecommendationColor = (rec: string) => {
        switch (rec) {
            case 'STRONG_BUY': return 'bg-green-600'
            case 'BUY': return 'bg-green-500'
            case 'HOLD': return 'bg-yellow-500'
            case 'SELL': return 'bg-red-500'
            case 'STRONG_SELL': return 'bg-red-600'
            default: return 'bg-gray-500'
        }
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Header with Gradient */}
            <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 p-8 text-white">
                <div className="relative z-10">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl font-bold mb-2">{analysis.symbol}</h1>
                            <p className="text-blue-100">Advanced AI-Powered Analysis</p>
                        </div>
                        <div className="text-right">
                            <div className="text-sm opacity-80 mb-1">Overall Score</div>
                            <div className="text-5xl font-bold">{analysis.overallScore.toFixed(0)}</div>
                            <Badge className={`mt-2 ${getRecommendationColor(analysis.recommendation)}`}>
                                {analysis.recommendation.replace('_', ' ')}
                            </Badge>
                        </div>
                    </div>
                </div>
                <div className="absolute inset-0 bg-black/10"></div>
            </div>

            {/* Score Cards */}
            <div className="grid gap-6 md:grid-cols-3">
                <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-blue-600">
                            <BarChart3 className="h-5 w-5" />
                            Technical Score
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold text-blue-600">
                            {analysis.technicalScore.toFixed(0)}
                        </div>
                        <div className="mt-2 h-2 bg-blue-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-blue-600 transition-all duration-500"
                                style={{ width: `${analysis.technicalScore}%` }}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-white">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-purple-600">
                            <Activity className="h-5 w-5" />
                            Fundamental Score
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold text-purple-600">
                            {analysis.fundamentalScore.toFixed(0)}
                        </div>
                        <div className="mt-2 h-2 bg-purple-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-purple-600 transition-all duration-500"
                                style={{ width: `${analysis.fundamentalScore}%` }}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-pink-200 bg-gradient-to-br from-pink-50 to-white">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-pink-600">
                            <Brain className="h-5 w-5" />
                            Sentiment Score
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold text-pink-600">
                            {analysis.sentimentScore.toFixed(0)}
                        </div>
                        <div className="mt-2 h-2 bg-pink-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-pink-600 transition-all duration-500"
                                style={{ width: `${analysis.sentimentScore}%` }}
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Detailed Analysis Tabs */}
            <Tabs defaultValue="technical" className="space-y-6">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="technical">Technical Analysis</TabsTrigger>
                    <TabsTrigger value="ai">AI Insights</TabsTrigger>
                    <TabsTrigger value="targets">Price Targets</TabsTrigger>
                </TabsList>

                {/* Technical Analysis Tab */}
                <TabsContent value="technical" className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Indicators */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Technical Indicators</CardTitle>
                                <CardDescription>Key technical metrics and signals</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium">RSI (14)</span>
                                    <Badge variant={
                                        analysis.technical.indicators.rsi > 70 ? 'destructive' :
                                            analysis.technical.indicators.rsi < 30 ? 'default' :
                                                'secondary'
                                    }>
                                        {analysis.technical.indicators.rsi.toFixed(2)}
                                    </Badge>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium">ADX</span>
                                    <Badge variant="outline">
                                        {analysis.technical.indicators.adx.toFixed(2)}
                                    </Badge>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium">MACD</span>
                                    <div className="text-right">
                                        <div className="text-sm font-semibold">
                                            {analysis.technical.indicators.macd.value.toFixed(4)}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            Signal: {analysis.technical.indicators.macd.signal.toFixed(4)}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Support & Resistance */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Key Levels</CardTitle>
                                <CardDescription>Support and resistance zones</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <div className="text-sm font-medium mb-2 text-green-600">Support Levels</div>
                                    <div className="space-y-1">
                                        {analysis.technical.support.map((level, idx) => (
                                            <div key={idx} className="flex justify-between text-sm">
                                                <span>S{idx + 1}</span>
                                                <span className="font-mono">${level.toFixed(2)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-sm font-medium mb-2 text-red-600">Resistance Levels</div>
                                    <div className="space-y-1">
                                        {analysis.technical.resistance.map((level, idx) => (
                                            <div key={idx} className="flex justify-between text-sm">
                                                <span>R{idx + 1}</span>
                                                <span className="font-mono">${level.toFixed(2)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Patterns */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Detected Patterns</CardTitle>
                            <CardDescription>Chart patterns identified by our AI</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2">
                                {analysis.technical.patterns.map((pattern, idx) => (
                                    <Badge key={idx} variant="outline" className="text-sm">
                                        {pattern}
                                    </Badge>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* AI Insights Tab */}
                <TabsContent value="ai" className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        <Card className="bg-gradient-to-br from-blue-50 to-white">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Brain className="h-5 w-5 text-blue-600" />
                                    Market Intelligence
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <div className="text-sm font-medium text-muted-foreground mb-1">Market Regime</div>
                                    <div className="text-lg font-semibold">{analysis.aiInsights.marketRegime}</div>
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-muted-foreground mb-1">Volatility</div>
                                    <div className="text-lg font-semibold">{analysis.aiInsights.volatility}</div>
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-muted-foreground mb-1">Momentum</div>
                                    <div className="text-lg font-semibold">{analysis.aiInsights.momentum}</div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-br from-purple-50 to-white">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-purple-600">
                                    <Activity className="h-5 w-5" />
                                    Key Levels
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {analysis.aiInsights.keyLevels.map((level, idx) => (
                                        <div key={idx} className="flex items-center gap-2">
                                            <div className="h-2 w-2 rounded-full bg-purple-600" />
                                            <span className="text-sm">{level}</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                        <Card className="border-red-200">
                            <CardHeader>
                                <CardTitle className="text-red-600">Risk Factors</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2">
                                    {analysis.aiInsights.riskFactors.map((risk, idx) => (
                                        <li key={idx} className="flex items-start gap-2">
                                            <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                                            <span className="text-sm">{risk}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>

                        <Card className="border-green-200">
                            <CardHeader>
                                <CardTitle className="text-green-600">Opportunities</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2">
                                    {analysis.aiInsights.opportunities.map((opp, idx) => (
                                        <li key={idx} className="flex items-start gap-2">
                                            <TrendingUp className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                            <span className="text-sm">{opp}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Price Targets Tab */}
                <TabsContent value="targets" className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-3">
                        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-white">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-green-600">
                                    <TrendingUp className="h-5 w-5" />
                                    Bullish Targets
                                </CardTitle>
                                <CardDescription>Upside price projections</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {analysis.priceTargets.bullish.map((target, idx) => (
                                        <div key={idx} className="flex justify-between items-center">
                                            <span className="text-sm font-medium">Target {idx + 1}</span>
                                            <span className="text-lg font-bold text-green-600">
                                                ${target.toFixed(2)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-yellow-200 bg-gradient-to-br from-yellow-50 to-white">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-yellow-600">
                                    <Activity className="h-5 w-5" />
                                    Neutral Target
                                </CardTitle>
                                <CardDescription>Fair value estimate</CardDescription>
                            </CardHeader>
                            <CardContent className="flex items-center justify-center py-8">
                                <div className="text-center">
                                    <div className="text-4xl font-bold text-yellow-600">
                                        ${analysis.priceTargets.neutral.toFixed(2)}
                                    </div>
                                    <div className="text-sm text-muted-foreground mt-2">
                                        Fair Value
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-red-200 bg-gradient-to-br from-red-50 to-white">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-red-600">
                                    <TrendingDown className="h-5 w-5" />
                                    Bearish Targets
                                </CardTitle>
                                <CardDescription>Downside price projections</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {analysis.priceTargets.bearish.map((target, idx) => (
                                        <div key={idx} className="flex justify-between items-center">
                                            <span className="text-sm font-medium">Target {idx + 1}</span>
                                            <span className="text-lg font-bold text-red-600">
                                                ${target.toFixed(2)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}
