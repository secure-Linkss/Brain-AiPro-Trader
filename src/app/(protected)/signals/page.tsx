'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { TrendingUp, TrendingDown, AlertCircle, RefreshCw } from 'lucide-react'

interface Signal {
    id: string
    symbol: string
    signal: 'BUY' | 'SELL' | 'HOLD'
    confidence: number
    entry: number
    stopLoss: number
    targets: number[]
    timestamp: string
    status: 'active' | 'closed' | 'pending'
    analysis: string
}

export default function SignalsPage() {
    const [signals, setSignals] = useState<Signal[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [refreshing, setRefreshing] = useState(false)

    useEffect(() => {
        fetchSignals()
    }, [])

    const fetchSignals = async () => {
        try {
            setLoading(true)
            const response = await fetch('/api/signals/active')

            if (!response.ok) {
                throw new Error('Failed to fetch signals')
            }

            const data = await response.json()
            setSignals(data.signals || [])
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred')
        } finally {
            setLoading(false)
        }
    }

    const handleRefresh = async () => {
        setRefreshing(true)
        await fetchSignals()
        setRefreshing(false)
    }

    if (loading) {
        return (
            <div className="container mx-auto p-6 space-y-6">
                <Skeleton className="h-10 w-64" />
                <div className="grid gap-6">
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-48" />
                    ))}
                </div>
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
                            Error Loading Signals
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-red-600">{error}</p>
                        <Button onClick={handleRefresh} className="mt-4">
                            Try Again
                        </Button>
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
                    <h1 className="text-3xl font-bold tracking-tight">Trading Signals</h1>
                    <p className="text-muted-foreground">
                        AI-powered trading signals from our advanced analysis system
                    </p>
                </div>
                <Button
                    onClick={handleRefresh}
                    disabled={refreshing}
                    variant="outline"
                >
                    <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>

            {/* Signals List */}
            {signals.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No Active Signals</h3>
                        <p className="text-muted-foreground text-center max-w-md">
                            There are currently no active trading signals. Our AI system is continuously analyzing markets and will generate signals when high-probability setups are identified.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-6">
                    {signals.map((signal) => (
                        <Card key={signal.id} className="overflow-hidden">
                            <CardHeader className={`${signal.signal === 'BUY' ? 'bg-green-50 border-b border-green-200' :
                                    signal.signal === 'SELL' ? 'bg-red-50 border-b border-red-200' :
                                        'bg-gray-50 border-b border-gray-200'
                                }`}>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div>
                                            <CardTitle className="text-2xl">{signal.symbol}</CardTitle>
                                            <CardDescription className="mt-1">
                                                {new Date(signal.timestamp).toLocaleString()}
                                            </CardDescription>
                                        </div>
                                        <Badge
                                            variant={signal.signal === 'BUY' ? 'default' : signal.signal === 'SELL' ? 'destructive' : 'secondary'}
                                            className="text-lg px-4 py-1"
                                        >
                                            {signal.signal === 'BUY' && <TrendingUp className="h-4 w-4 mr-1" />}
                                            {signal.signal === 'SELL' && <TrendingDown className="h-4 w-4 mr-1" />}
                                            {signal.signal}
                                        </Badge>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm text-muted-foreground">Confidence</div>
                                        <div className="text-2xl font-bold">{signal.confidence.toFixed(1)}%</div>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                                    <div>
                                        <div className="text-sm text-muted-foreground mb-1">Entry Price</div>
                                        <div className="text-lg font-semibold">${signal.entry.toFixed(2)}</div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-muted-foreground mb-1">Stop Loss</div>
                                        <div className="text-lg font-semibold text-red-600">${signal.stopLoss.toFixed(2)}</div>
                                    </div>
                                    <div className="col-span-2">
                                        <div className="text-sm text-muted-foreground mb-1">Take Profit Targets</div>
                                        <div className="flex gap-2 flex-wrap">
                                            {signal.targets.map((target, idx) => (
                                                <Badge key={idx} variant="outline" className="text-green-600">
                                                    TP{idx + 1}: ${target.toFixed(2)}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Analysis */}
                                <div className="border-t pt-4">
                                    <h4 className="font-semibold mb-2">Analysis</h4>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        {signal.analysis}
                                    </p>
                                </div>

                                {/* Status Badge */}
                                <div className="mt-4 flex items-center justify-between">
                                    <Badge variant={
                                        signal.status === 'active' ? 'default' :
                                            signal.status === 'closed' ? 'secondary' :
                                                'outline'
                                    }>
                                        {signal.status.toUpperCase()}
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
