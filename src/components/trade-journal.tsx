"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    TrendingUp, TrendingDown, DollarSign, Target,
    Calendar, BarChart3, PieChart, Activity
} from "lucide-react"

interface TradeStats {
    totalTrades: number
    winningTrades: number
    losingTrades: number
    winRate: number
    totalProfit: number
    totalLoss: number
    netProfit: number
    profitFactor: number
    averageWin: number
    averageLoss: number
    largestWin: number
    largestLoss: number
    averageRR: number
    expectancy: number
}

interface Trade {
    id: string
    symbol: string
    type: 'BUY' | 'SELL'
    entryPrice: number
    exitPrice: number
    stopLoss: number
    takeProfit: number
    size: number
    profit: number
    profitPercent: number
    duration: string
    strategy: string
    notes?: string
    timestamp: Date
}

export function TradeJournal() {
    const [stats, setStats] = useState<TradeStats | null>(null)
    const [trades, setTrades] = useState<Trade[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchTradeData()
    }, [])

    const fetchTradeData = async () => {
        try {
            const res = await fetch('/api/trade-journal')
            const data = await res.json()
            setStats(data.stats)
            setTrades(data.trades)
        } catch (error) {
            console.error('Failed to fetch trade data:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return <div>Loading trade journal...</div>
    }

    return (
        <div className="space-y-6">
            {/* Performance Overview */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-slate-900 border-slate-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
                        <DollarSign className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${stats && stats.netProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            ${stats?.netProfit.toFixed(2) || '0.00'}
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                            {stats?.totalTrades || 0} total trades
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-slate-900 border-slate-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
                        <Target className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.winRate.toFixed(1) || '0.0'}%</div>
                        <p className="text-xs text-slate-400 mt-1">
                            {stats?.winningTrades || 0}W / {stats?.losingTrades || 0}L
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-slate-900 border-slate-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Profit Factor</CardTitle>
                        <BarChart3 className="h-4 w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.profitFactor.toFixed(2) || '0.00'}</div>
                        <p className="text-xs text-slate-400 mt-1">
                            Gross Profit / Gross Loss
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-slate-900 border-slate-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Expectancy</CardTitle>
                        <Activity className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${stats?.expectancy.toFixed(2) || '0.00'}</div>
                        <p className="text-xs text-slate-400 mt-1">
                            Average profit per trade
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Detailed Stats */}
            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList className="bg-slate-900">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="trades">Trade History</TabsTrigger>
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <Card className="bg-slate-900 border-slate-800">
                            <CardHeader>
                                <CardTitle className="text-lg">Winning Trades</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Average Win:</span>
                                    <span className="text-green-500 font-semibold">${stats?.averageWin.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Largest Win:</span>
                                    <span className="text-green-500 font-semibold">${stats?.largestWin.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Total Profit:</span>
                                    <span className="text-green-500 font-semibold">${stats?.totalProfit.toFixed(2)}</span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-slate-900 border-slate-800">
                            <CardHeader>
                                <CardTitle className="text-lg">Losing Trades</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Average Loss:</span>
                                    <span className="text-red-500 font-semibold">${stats?.averageLoss.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Largest Loss:</span>
                                    <span className="text-red-500 font-semibold">${stats?.largestLoss.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Total Loss:</span>
                                    <span className="text-red-500 font-semibold">${stats?.totalLoss.toFixed(2)}</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="trades" className="space-y-4">
                    <Card className="bg-slate-900 border-slate-800">
                        <CardHeader>
                            <CardTitle>Recent Trades</CardTitle>
                            <CardDescription>Your trading history</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {trades.map((trade) => (
                                    <div
                                        key={trade.id}
                                        className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg hover:bg-slate-800 transition-colors"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`p-2 rounded-lg ${trade.type === 'BUY' ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                                                {trade.type === 'BUY' ? (
                                                    <TrendingUp className="h-5 w-5 text-green-500" />
                                                ) : (
                                                    <TrendingDown className="h-5 w-5 text-red-500" />
                                                )}
                                            </div>
                                            <div>
                                                <div className="font-semibold">{trade.symbol}</div>
                                                <div className="text-sm text-slate-400">{trade.strategy}</div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className={`font-semibold ${trade.profit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                                {trade.profit >= 0 ? '+' : ''}{trade.profitPercent.toFixed(2)}%
                                            </div>
                                            <div className="text-sm text-slate-400">${Math.abs(trade.profit).toFixed(2)}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="analytics" className="space-y-4">
                    <Card className="bg-slate-900 border-slate-800">
                        <CardHeader>
                            <CardTitle>Performance Analytics</CardTitle>
                            <CardDescription>Advanced metrics and insights</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-400">Average Risk/Reward:</span>
                                    <Badge variant="outline">{stats?.averageRR.toFixed(2) || '0.00'}</Badge>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-400">Expectancy:</span>
                                    <Badge variant={stats && stats.expectancy > 0 ? 'default' : 'destructive'}>
                                        ${stats?.expectancy.toFixed(2) || '0.00'}
                                    </Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
