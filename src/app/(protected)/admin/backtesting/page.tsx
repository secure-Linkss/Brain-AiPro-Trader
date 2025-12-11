'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Play, Pause, TrendingUp, TrendingDown, AlertCircle, BarChart3, Activity } from 'lucide-react'

interface BacktestResult {
    id: string
    strategyName: string
    status: string
    confidence: number
    metrics: {
        totalTrades: number
        winRate: number
        sharpeRatio: number
        maxDrawdown: number
        totalReturn: number
        profitFactor: number
    }
    validation: {
        walkForward: { score: number }
        monteCarlo: { confidence_95: number }
        robustness: { sensitivity: number }
    }
    analysis: {
        performanceGrade: string
        deploymentReady: boolean
        riskAssessment: string
    }
}

interface QueueItem {
    id: string
    name: string
    assetClass: string
    status: string
    createdAt: string
}

export default function AdminBacktestingPage() {
    const [results, setResults] = useState<BacktestResult[]>([])
    const [queue, setQueue] = useState<QueueItem[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState('results')

    useEffect(() => {
        fetchBacktestingData()
    }, [])

    const fetchBacktestingData = async () => {
        try {
            setLoading(true)

            // Fetch results
            const resultsResponse = await fetch('/api/admin/backtesting/results')
            if (!resultsResponse.ok) throw new Error('Failed to fetch results')
            const resultsData = await resultsResponse.json()
            setResults(resultsData.results || [])

            // Fetch queue
            const queueResponse = await fetch('/api/admin/backtesting/queue')
            if (!queueResponse.ok) throw new Error('Failed to fetch queue')
            const queueData = await queueResponse.json()
            setQueue(queueData.queue || [])

        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred')
        } finally {
            setLoading(false)
        }
    }

    const triggerBacktestCycle = async () => {
        try {
            const response = await fetch('/api/admin/backtesting/trigger-cycle', {
                method: 'POST'
            })

            if (!response.ok) throw new Error('Failed to trigger backtest cycle')

            await fetchBacktestingData()
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to trigger cycle')
        }
    }

    if (loading) {
        return (
            <div className="container mx-auto p-6 space-y-6">
                <Skeleton className="h-10 w-64" />
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
                            Error Loading Backtesting Data
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-red-600">{error}</p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Backtesting System</h1>
                    <p className="text-muted-foreground">
                        Advanced multi-agent backtesting with walk-forward analysis
                    </p>
                </div>
                <Button onClick={triggerBacktestCycle}>
                    <Play className="h-4 w-4 mr-2" />
                    Trigger Backtest Cycle
                </Button>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                    <TabsTrigger value="results">
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Results ({results.length})
                    </TabsTrigger>
                    <TabsTrigger value="queue">
                        <Activity className="h-4 w-4 mr-2" />
                        Queue ({queue.length})
                    </TabsTrigger>
                </TabsList>

                {/* Results Tab */}
                <TabsContent value="results" className="space-y-6">
                    {results.length === 0 ? (
                        <Card>
                            <CardContent className="flex flex-col items-center justify-center py-12">
                                <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                                <h3 className="text-lg font-semibold mb-2">No Backtest Results</h3>
                                <p className="text-muted-foreground text-center max-w-md">
                                    No backtesting results available. Trigger a backtest cycle to generate results.
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-6">
                            {results.map((result) => (
                                <Card key={result.id}>
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <CardTitle>{result.strategyName}</CardTitle>
                                                <CardDescription>
                                                    Confidence: {result.confidence.toFixed(1)}%
                                                </CardDescription>
                                            </div>
                                            <div className="flex gap-2">
                                                <Badge variant={
                                                    result.analysis.performanceGrade === 'A+' || result.analysis.performanceGrade === 'A' ? 'default' :
                                                        result.analysis.performanceGrade === 'B' ? 'secondary' :
                                                            'outline'
                                                }>
                                                    Grade: {result.analysis.performanceGrade}
                                                </Badge>
                                                {result.analysis.deploymentReady && (
                                                    <Badge variant="default" className="bg-green-600">
                                                        Deployment Ready
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        {/* Performance Metrics */}
                                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
                                            <div>
                                                <div className="text-sm text-muted-foreground">Total Trades</div>
                                                <div className="text-xl font-bold">{result.metrics.totalTrades}</div>
                                            </div>
                                            <div>
                                                <div className="text-sm text-muted-foreground">Win Rate</div>
                                                <div className="text-xl font-bold text-green-600">
                                                    {(result.metrics.winRate * 100).toFixed(1)}%
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-sm text-muted-foreground">Sharpe Ratio</div>
                                                <div className="text-xl font-bold">{result.metrics.sharpeRatio.toFixed(2)}</div>
                                            </div>
                                            <div>
                                                <div className="text-sm text-muted-foreground">Max Drawdown</div>
                                                <div className="text-xl font-bold text-red-600">
                                                    {(result.metrics.maxDrawdown * 100).toFixed(1)}%
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-sm text-muted-foreground">Total Return</div>
                                                <div className={`text-xl font-bold ${result.metrics.totalReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                    {(result.metrics.totalReturn * 100).toFixed(1)}%
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-sm text-muted-foreground">Profit Factor</div>
                                                <div className="text-xl font-bold">{result.metrics.profitFactor.toFixed(2)}</div>
                                            </div>
                                        </div>

                                        {/* Validation Metrics */}
                                        <div className="border-t pt-4">
                                            <h4 className="font-semibold mb-3">Validation Results</h4>
                                            <div className="grid grid-cols-3 gap-4">
                                                <div>
                                                    <div className="text-sm text-muted-foreground">Walk-Forward</div>
                                                    <div className="text-lg font-semibold">
                                                        {(result.validation.walkForward.score * 100).toFixed(1)}%
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="text-sm text-muted-foreground">Monte Carlo (95%)</div>
                                                    <div className="text-lg font-semibold">
                                                        {result.validation.monteCarlo.confidence_95 === 1 ? 'Pass' : 'Fail'}
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="text-sm text-muted-foreground">Robustness</div>
                                                    <div className="text-lg font-semibold">
                                                        {(result.validation.robustness.sensitivity * 100).toFixed(1)}%
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Risk Assessment */}
                                        <div className="mt-4 flex items-center justify-between">
                                            <Badge variant={
                                                result.analysis.riskAssessment === 'Low' ? 'default' :
                                                    result.analysis.riskAssessment === 'Medium' ? 'secondary' :
                                                        'destructive'
                                            }>
                                                Risk: {result.analysis.riskAssessment}
                                            </Badge>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>

                {/* Queue Tab */}
                <TabsContent value="queue" className="space-y-4">
                    {queue.length === 0 ? (
                        <Card>
                            <CardContent className="flex flex-col items-center justify-center py-12">
                                <Activity className="h-12 w-12 text-muted-foreground mb-4" />
                                <h3 className="text-lg font-semibold mb-2">Queue Empty</h3>
                                <p className="text-muted-foreground text-center max-w-md">
                                    No strategies currently in the backtesting queue.
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-4">
                            {queue.map((item) => (
                                <Card key={item.id}>
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <CardTitle className="text-lg">{item.name}</CardTitle>
                                                <CardDescription>
                                                    {item.assetClass.toUpperCase()} • {new Date(item.createdAt).toLocaleString()}
                                                </CardDescription>
                                            </div>
                                            <Badge variant={
                                                item.status === 'running' ? 'default' :
                                                    item.status === 'queued' ? 'secondary' :
                                                        'outline'
                                            }>
                                                {item.status.toUpperCase()}
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    )
}
