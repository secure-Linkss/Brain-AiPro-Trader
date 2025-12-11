'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Users, DollarSign, Activity, TrendingUp, AlertCircle, BarChart3, Shield } from 'lucide-react'
import Link from 'next/link'

interface AdminStats {
    totalUsers: number
    activeUsers: number
    totalRevenue: number
    monthlyRevenue: number
    totalSignals: number
    activeSignals: number
    systemHealth: number
    backtestingQueue: number
}

export default function AdminDashboardPage() {
    const [stats, setStats] = useState<AdminStats | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        fetchAdminStats()
    }, [])

    const fetchAdminStats = async () => {
        try {
            setLoading(true)
            const response = await fetch('/api/admin/stats')

            if (!response.ok) throw new Error('Failed to fetch admin stats')

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
                <Skeleton className="h-10 w-64 bg-slate-800" />
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {[1, 2, 3, 4].map((i) => (
                        <Skeleton key={i} className="h-32 bg-slate-800" />
                    ))}
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="container mx-auto p-6">
                <Card className="border-red-500/30 bg-red-900/10">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-red-500">
                            <AlertCircle className="h-5 w-5" />
                            Error Loading Admin Dashboard
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-red-400">{error}</p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Header with Gradient */}
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-purple-900 via-pink-900 to-indigo-900 p-8 text-white border border-white/10">
                <div className="relative z-10">
                    <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
                    <p className="text-purple-200">System overview and management</p>
                </div>
                <div className="absolute inset-0 bg-black/20"></div>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {/* Total Users */}
                <Card className="border-white/10 bg-slate-900/50 backdrop-blur-sm hover:bg-slate-900/80 transition-colors">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-400">Total Users</CardTitle>
                        <Users className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-white mb-1">{stats?.totalUsers || 0}</div>
                        <p className="text-xs text-blue-400">
                            {stats?.activeUsers || 0} active this month
                        </p>
                        <div className="mt-3 h-1 bg-blue-900/30 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-blue-500 rounded-full"
                                style={{ width: `${((stats?.activeUsers || 0) / (stats?.totalUsers || 1)) * 100}%` }}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Revenue */}
                <Card className="border-white/10 bg-slate-900/50 backdrop-blur-sm hover:bg-slate-900/80 transition-colors">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-400">Total Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-white mb-1">
                            ${((stats?.totalRevenue || 0) / 1000).toFixed(1)}K
                        </div>
                        <p className="text-xs text-green-400">
                            ${((stats?.monthlyRevenue || 0) / 1000).toFixed(1)}K this month
                        </p>
                        <div className="mt-3 h-1 bg-green-900/30 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-green-500 rounded-full"
                                style={{ width: `${((stats?.monthlyRevenue || 0) / (stats?.totalRevenue || 1)) * 100}%` }}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Signals */}
                <Card className="border-white/10 bg-slate-900/50 backdrop-blur-sm hover:bg-slate-900/80 transition-colors">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-400">Total Signals</CardTitle>
                        <Activity className="h-4 w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-white mb-1">{stats?.totalSignals || 0}</div>
                        <p className="text-xs text-purple-400">
                            {stats?.activeSignals || 0} currently active
                        </p>
                        <div className="mt-3 h-1 bg-purple-900/30 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-purple-500 rounded-full"
                                style={{ width: `${((stats?.activeSignals || 0) / (stats?.totalSignals || 1)) * 100}%` }}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* System Health */}
                <Card className="border-white/10 bg-slate-900/50 backdrop-blur-sm hover:bg-slate-900/80 transition-colors">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-400">System Health</CardTitle>
                        <Shield className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-white mb-1">
                            {stats?.systemHealth || 0}%
                        </div>
                        <p className="text-xs text-yellow-400">
                            All systems operational
                        </p>
                        <div className="mt-3 h-1 bg-yellow-900/30 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-yellow-500 rounded-full"
                                style={{ width: `${stats?.systemHealth || 0}%` }}
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <h2 className="text-lg font-semibold text-white">Management Consoles</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Link href="/admin/users">
                    <Card className="hover:border-blue-500/50 transition-all hover:-translate-y-1 cursor-pointer border-white/10 bg-slate-900/50 group">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-white group-hover:text-blue-400 transition-colors">
                                <Users className="h-5 w-5 text-blue-500" />
                                User Management
                            </CardTitle>
                            <CardDescription className="text-gray-400">
                                Manage users, roles, and permissions
                            </CardDescription>
                        </CardHeader>
                    </Card>
                </Link>

                <Link href="/admin/backtesting">
                    <Card className="hover:border-purple-500/50 transition-all hover:-translate-y-1 cursor-pointer border-white/10 bg-slate-900/50 group">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-white group-hover:text-purple-400 transition-colors">
                                <BarChart3 className="h-5 w-5 text-purple-500" />
                                Backtesting System
                            </CardTitle>
                            <CardDescription className="text-gray-400">
                                Monitor and manage strategy backtests
                            </CardDescription>
                        </CardHeader>
                        {stats && stats.backtestingQueue > 0 && (
                            <CardContent>
                                <Badge variant="secondary" className="bg-purple-500/20 text-purple-300">
                                    {stats.backtestingQueue} in queue
                                </Badge>
                            </CardContent>
                        )}
                    </Card>
                </Link>

                <Link href="/admin/analytics">
                    <Card className="hover:border-green-500/50 transition-all hover:-translate-y-1 cursor-pointer border-white/10 bg-slate-900/50 group">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-white group-hover:text-green-400 transition-colors">
                                <TrendingUp className="h-5 w-5 text-green-500" />
                                Analytics
                            </CardTitle>
                            <CardDescription className="text-gray-400">
                                View detailed analytics and reports
                            </CardDescription>
                        </CardHeader>
                    </Card>
                </Link>

                <Link href="/admin/system-health">
                    <Card className="hover:border-yellow-500/50 transition-all hover:-translate-y-1 cursor-pointer border-white/10 bg-slate-900/50 group">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-white group-hover:text-yellow-400 transition-colors">
                                <Shield className="h-5 w-5 text-yellow-500" />
                                System Health
                            </CardTitle>
                            <CardDescription className="text-gray-400">
                                Monitor system performance and uptime
                            </CardDescription>
                        </CardHeader>
                    </Card>
                </Link>

                <Link href="/admin/subscriptions">
                    <Card className="hover:border-pink-500/50 transition-all hover:-translate-y-1 cursor-pointer border-white/10 bg-slate-900/50 group">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-white group-hover:text-pink-400 transition-colors">
                                <DollarSign className="h-5 w-5 text-pink-500" />
                                Subscriptions
                            </CardTitle>
                            <CardDescription className="text-gray-400">
                                Manage user subscriptions and billing
                            </CardDescription>
                        </CardHeader>
                    </Card>
                </Link>

                <Link href="/admin/settings">
                    <Card className="hover:border-white/30 transition-all hover:-translate-y-1 cursor-pointer border-white/10 bg-slate-900/50 group">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-white group-hover:text-gray-300 transition-colors">
                                <Activity className="h-5 w-5 text-gray-500" />
                                System Settings
                            </CardTitle>
                            <CardDescription className="text-gray-400">
                                Configure system-wide settings
                            </CardDescription>
                        </CardHeader>
                    </Card>
                </Link>
            </div>
        </div>
    )
}
