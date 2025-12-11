'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown, Activity, DollarSign, AlertCircle, BarChart3 } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import Link from 'next/link'

interface DashboardStats {
    totalSignals: number
    activeSignals: number
    winRate: number
    totalProfit: number
    todaySignals: number
    weeklyPerformance: number
}

export default function DashboardPage() {
    const [stats, setStats] = useState<DashboardStats | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        fetchDashboardStats()
    }, [])

    const fetchDashboardStats = async () => {
        try {
            setLoading(true)
            const response = await fetch('/api/dashboard/stats')

            if (!response.ok) {
                throw new Error('Failed to fetch dashboard stats')
            }

            const data = await response.json()
            setStats(data)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred')
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="container mx-auto p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <Skeleton className="h-10 w-64" />
                    <Skeleton className="h-10 w-32" />
                </div>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {[1, 2, 3, 4].map((i) => (
                        <Skeleton key={i} className="h-32" />
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
                            Error Loading Dashboard
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
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-muted-foreground">
                        Welcome back! Here's your trading overview.
                    </p>
                </div>
                <Link
                    href="/signals"
                    className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                >
                    View Signals
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {/* Total Signals */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Signals
                        </CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.totalSignals || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            {stats?.todaySignals || 0} today
                        </p>
                    </CardContent>
                </Card>

                {/* Active Signals */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Active Signals
                        </CardTitle>
                        <TrendingUp className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.activeSignals || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            Currently running
                        </p>
                    </CardContent>
                </Card>

                {/* Win Rate */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Win Rate
                        </CardTitle>
                        <BarChart3 className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {stats?.winRate ? `${stats.winRate.toFixed(1)}%` : '0%'}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            All time performance
                        </p>
                    </CardContent>
                </Card>

                {/* Total Profit */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Weekly Performance
                        </CardTitle>
                        <DollarSign className="h-4 w-4 text-yellow-600" />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${(stats?.weeklyPerformance || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {stats?.weeklyPerformance ? `${stats.weeklyPerformance > 0 ? '+' : ''}${stats.weeklyPerformance.toFixed(2)}%` : '0%'}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Last 7 days
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Links */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Link href="/signals">
                    <Card className="hover:bg-accent transition-colors cursor-pointer">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Activity className="h-5 w-5" />
                                Trading Signals
                            </CardTitle>
                            <CardDescription>
                                View and manage your trading signals
                            </CardDescription>
                        </CardHeader>
                    </Card>
                </Link>

                <Link href="/scanner">
                    <Card className="hover:bg-accent transition-colors cursor-pointer">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BarChart3 className="h-5 w-5" />
                                Market Scanner
                            </CardTitle>
                            <CardDescription>
                                Scan markets for trading opportunities
                            </CardDescription>
                        </CardHeader>
                    </Card>
                </Link>

                <div className="hover:bg-accent transition-colors cursor-pointer rounded-xl border bg-card text-card-foreground shadow">
                    <div className="p-6">
                        <h3 className="flex items-center gap-2 text-2xl font-semibold leading-none tracking-tight">
                            <Activity className="h-5 w-5 text-blue-500" />
                            EA Bridge
                        </h3>
                        <p className="text-sm text-muted-foreground mt-2">
                            Download MetaTrader Expert Advisors for Auto-Trading
                        </p>
                        <div className="mt-4 flex gap-2">
                            <a
                                href="/downloads/BrainAI_Bridge.mq5"
                                download
                                className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors flex-1"
                            >
                                Download MT5
                            </a>
                            <a
                                href="/downloads/BrainAI_Bridge.mq4"
                                download
                                className="inline-flex items-center justify-center rounded-md bg-slate-700 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 transition-colors flex-1"
                            >
                                Download MT4
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
