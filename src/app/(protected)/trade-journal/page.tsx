'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BookOpen, TrendingUp, TrendingDown, DollarSign, Calendar, Filter } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

interface Trade {
    id: string
    symbol: string
    type: 'BUY' | 'SELL'
    entry: number
    exit: number
    profit: number
    profitPercent: number
    date: string
    notes: string
    tags: string[]
}

export default function TradeJournalPage() {
    const [trades, setTrades] = useState<Trade[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState<'all' | 'wins' | 'losses'>('all')

    useEffect(() => {
        fetchTrades()
    }, [])

    const fetchTrades = async () => {
        try {
            setLoading(true)
            const response = await fetch('/api/trade-journal')
            if (!response.ok) throw new Error('Failed to fetch trades')
            const data = await response.json()
            setTrades(data.trades || [])
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const filteredTrades = trades.filter(trade => {
        if (filter === 'wins') return trade.profit > 0
        if (filter === 'losses') return trade.profit < 0
        return true
    })

    const totalProfit = trades.reduce((sum, t) => sum + t.profit, 0)
    const winningTrades = trades.filter(t => t.profit > 0).length
    const winRate = trades.length > 0 ? (winningTrades / trades.length) * 100 : 0

    if (loading) {
        return (
            <div className="container mx-auto p-6 space-y-6">
                <Skeleton className="h-10 w-64" />
                <div className="grid gap-6 md:grid-cols-3">
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-24" />
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-8 text-white">
                <div className="relative z-10">
                    <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                        <BookOpen className="h-10 w-10" />
                        Trade Journal
                    </h1>
                    <p className="text-indigo-100">Track and analyze your trading performance</p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid gap-6 md:grid-cols-3">
                <Card className="border-green-200 bg-gradient-to-br from-green-50 to-white">
                    <CardHeader>
                        <CardTitle className="text-green-600">Total Profit</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className={`text-4xl font-bold ${totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            ${totalProfit.toFixed(2)}
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white">
                    <CardHeader>
                        <CardTitle className="text-blue-600">Win Rate</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold text-blue-600">
                            {winRate.toFixed(1)}%
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">
                            {winningTrades} / {trades.length} trades
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-white">
                    <CardHeader>
                        <CardTitle className="text-purple-600">Total Trades</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold text-purple-600">
                            {trades.length}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filter */}
            <div className="flex gap-2">
                <Button
                    variant={filter === 'all' ? 'default' : 'outline'}
                    onClick={() => setFilter('all')}
                >
                    All Trades
                </Button>
                <Button
                    variant={filter === 'wins' ? 'default' : 'outline'}
                    onClick={() => setFilter('wins')}
                    className="text-green-600"
                >
                    Wins Only
                </Button>
                <Button
                    variant={filter === 'losses' ? 'default' : 'outline'}
                    onClick={() => setFilter('losses')}
                    className="text-red-600"
                >
                    Losses Only
                </Button>
            </div>

            {/* Trades List */}
            <div className="space-y-4">
                {filteredTrades.map((trade) => (
                    <Card key={trade.id} className="hover:shadow-lg transition-shadow">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div>
                                        <h3 className="text-xl font-bold">{trade.symbol}</h3>
                                        <p className="text-sm text-muted-foreground">
                                            {new Date(trade.date).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <Badge variant={trade.type === 'BUY' ? 'default' : 'destructive'}>
                                        {trade.type}
                                    </Badge>
                                </div>
                                <div className="text-right">
                                    <div className={`text-2xl font-bold ${trade.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {trade.profit >= 0 ? '+' : ''}${trade.profit.toFixed(2)}
                                    </div>
                                    <div className={`text-sm ${trade.profitPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {trade.profitPercent >= 0 ? '+' : ''}{trade.profitPercent.toFixed(2)}%
                                    </div>
                                </div>
                            </div>
                            <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-muted-foreground">Entry:</span>
                                    <span className="ml-2 font-semibold">${trade.entry.toFixed(2)}</span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Exit:</span>
                                    <span className="ml-2 font-semibold">${trade.exit.toFixed(2)}</span>
                                </div>
                            </div>
                            {trade.notes && (
                                <div className="mt-4 p-3 bg-muted rounded-lg">
                                    <p className="text-sm">{trade.notes}</p>
                                </div>
                            )}
                            {trade.tags.length > 0 && (
                                <div className="mt-3 flex gap-2">
                                    {trade.tags.map((tag, idx) => (
                                        <Badge key={idx} variant="outline">{tag}</Badge>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
