'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown, DollarSign, BarChart3, Target, Award, Calendar } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

interface PerformanceData {
    overview: {
        totalReturn: number
        totalTrades: number
        winRate: number
        profitFactor: number
        sharpeRatio: number
        maxDrawdown: number
    }
    monthly: {
        month: string
        return: number
        trades: number
        winRate: number
    }[]
    byAsset: {
        asset: string
        return: number
        trades: number
        winRate: number
    }[]
    recentTrades: {
        id: string
        symbol: string
        type: string
        profit: number
        date: string
    }[]
}

export default function PerformancePage() {
    const [data, setData] = useState<PerformanceData | null>(null)
    const [loading, setLoading] = useState(true)
    const [timeframe, setTimeframe] = useState<'1M' | '3M' | '6M' | '1Y' | 'ALL'>('3M')

    useEffect(() => {
        fetchPerformance()
    }, [timeframe])

    const fetchPerformance = async () => {
        try {
            setLoading(true)
            const response = await fetch(`/api/performance?timeframe=${timeframe}`)
            if (!response.ok) throw new Error('Failed to fetch performance')
            const result = await response.json()
            setData(result.data)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="container mx-auto p-6 space-y-6">
                <Skeleton className="h-10 w-64" />
                <div className="grid gap-6 md:grid-cols-3">
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-32" />
                    ))}
                </div>
            </div>
        )
    }

    if (!data) return null

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 p-8 text-white">
                <div className="relative z-10">
                    <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                        <BarChart3 className="h-10 w-10" />
                        Performance Analytics
                    </h1>
                    <p className="text-green-100">Track your trading performance and statistics</p>
                </div>
            </div>

            {/* Timeframe Selector */}
            <div className="flex gap-2">
                {(['1M', '3M', '6M', '1Y', 'ALL'] as const).map((tf) => (
                    <Badge
                        key={tf}
                        variant={timeframe === tf ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => setTimeframe(tf)}
                    >
                        {tf}
                    </Badge>
                ))}
            </div>

            {/* Overview Stats */}
            <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-6">
                <Card className="border-green-200 bg-gradient-to-br from-green-50 to-white">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-green-600">Total Return</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className={`text-3xl font-bold ${data.overview.totalReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {data.overview.totalReturn > 0 ? '+' : ''}{data.overview.totalReturn.toFixed(2)}%
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-blue-600">Total Trades</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-blue-600">
                            {data.overview.totalTrades}
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-white">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-purple-600">Win Rate</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-purple-600">
                            {data.overview.winRate.toFixed(1)}%
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-yellow-200 bg-gradient-to-br from-yellow-50 to-white">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-yellow-600">Profit Factor</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-yellow-600">
                            {data.overview.profitFactor.toFixed(2)}
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-indigo-200 bg-gradient-to-br from-indigo-50 to-white">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-indigo-600">Sharpe Ratio</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-indigo-600">
                            {data.overview.sharpeRatio.toFixed(2)}
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-red-200 bg-gradient-to-br from-red-50 to-white">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-red-600">Max Drawdown</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-red-600">
                            {data.overview.maxDrawdown.toFixed(2)}%
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Detailed Tabs */}
            <Tabs defaultValue="monthly" className="space-y-6">
                <TabsList>
                    <TabsTrigger value="monthly">
                        <Calendar className="h-4 w-4 mr-2" />
                        Monthly
                    </TabsTrigger>
                    <TabsTrigger value="assets">
                        <Target className="h-4 w-4 mr-2" />
                        By Asset
                    </TabsTrigger>
                    <TabsTrigger value="recent">
                        <Award className="h-4 w-4 mr-2" />
                        Recent Trades
                    </TabsTrigger>
                </TabsList>

                {/* Monthly Performance */}
                <TabsContent value="monthly" className="space-y-4">
                    {data.monthly.map((month, idx) => (
                        <Card key={idx}>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-lg font-semibold">{month.month}</h3>
                                        <p className="text-sm text-muted-foreground">
                                            {month.trades} trades • {month.winRate.toFixed(1)}% win rate
                                        </p>
                                    </div>
                                    <div className={`text-3xl font-bold ${month.return >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {month.return > 0 ? '+' : ''}{month.return.toFixed(2)}%
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </TabsContent>

                {/* By Asset */}
                <TabsContent value="assets" className="space-y-4">
                    {data.byAsset.map((asset, idx) => (
                        <Card key={idx}>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-xl font-bold">{asset.asset}</h3>
                                        <p className="text-sm text-muted-foreground">
                                            {asset.trades} trades • {asset.winRate.toFixed(1)}% win rate
                                        </p>
                                    </div>
                                    <div className={`text-3xl font-bold ${asset.return >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {asset.return > 0 ? '+' : ''}{asset.return.toFixed(2)}%
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </TabsContent>

                {/* Recent Trades */}
                <TabsContent value="recent" className="space-y-4">
                    {data.recentTrades.map((trade) => (
                        <Card key={trade.id}>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div>
                                            <h3 className="text-lg font-semibold">{trade.symbol}</h3>
                                            <p className="text-sm text-muted-foreground">
                                                {new Date(trade.date).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <Badge variant={trade.type === 'BUY' ? 'default' : 'destructive'}>
                                            {trade.type}
                                        </Badge>
                                    </div>
                                    <div className={`text-2xl font-bold ${trade.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {trade.profit > 0 ? '+' : ''}${trade.profit.toFixed(2)}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </TabsContent>
            </Tabs>
        </div>
    )
}
