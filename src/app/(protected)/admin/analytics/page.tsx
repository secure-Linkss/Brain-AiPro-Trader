'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BarChart3, TrendingUp, Users, Activity, DollarSign, Target } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

interface AnalyticsData {
    overview: {
        totalUsers: number
        activeUsers: number
        totalRevenue: number
        totalSignals: number
    }
    userGrowth: {
        date: string
        users: number
    }[]
    revenueByPlan: {
        plan: string
        revenue: number
        users: number
    }[]
    topPerformers: {
        userId: string
        userName: string
        totalReturn: number
        trades: number
    }[]
}

export default function AdminAnalyticsPage() {
    const [data, setData] = useState<AnalyticsData | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchAnalytics()
    }, [])

    const fetchAnalytics = async () => {
        try {
            setLoading(true)
            const response = await fetch('/api/admin/analytics')
            if (!response.ok) throw new Error('Failed to fetch analytics')
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
                <div className="grid gap-6 md:grid-cols-4">
                    {[1, 2, 3, 4].map((i) => (
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
            <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-8 text-white">
                <div className="relative z-10">
                    <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                        <BarChart3 className="h-10 w-10" />
                        Analytics Dashboard
                    </h1>
                    <p className="text-blue-100">Platform metrics and insights</p>
                </div>
            </div>

            {/* Overview Stats */}
            <div className="grid gap-6 md:grid-cols-4">
                <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-blue-600 flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            Total Users
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-blue-600">
                            {data.overview.totalUsers}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {data.overview.activeUsers} active
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-green-200 bg-gradient-to-br from-green-50 to-white">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-green-600 flex items-center gap-2">
                            <DollarSign className="h-4 w-4" />
                            Total Revenue
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-green-600">
                            ${(data.overview.totalRevenue / 1000).toFixed(1)}K
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-white">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-purple-600 flex items-center gap-2">
                            <Activity className="h-4 w-4" />
                            Total Signals
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-purple-600">
                            {data.overview.totalSignals}
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-yellow-200 bg-gradient-to-br from-yellow-50 to-white">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-yellow-600 flex items-center gap-2">
                            <TrendingUp className="h-4 w-4" />
                            Growth Rate
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-yellow-600">
                            +{((data.overview.activeUsers / data.overview.totalUsers) * 100).toFixed(1)}%
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Revenue by Plan */}
            <Card>
                <CardHeader>
                    <CardTitle>Revenue by Plan</CardTitle>
                    <CardDescription>Breakdown of revenue across subscription tiers</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {data.revenueByPlan.map((plan, idx) => (
                            <div key={idx} className="flex items-center justify-between">
                                <div className="flex items-center gap-4 flex-1">
                                    <Badge variant="secondary" className="capitalize w-24">
                                        {plan.plan}
                                    </Badge>
                                    <div className="flex-1">
                                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-blue-600 to-purple-600"
                                                style={{ width: `${(plan.revenue / data.overview.totalRevenue) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right ml-4">
                                    <div className="font-bold">${(plan.revenue / 1000).toFixed(1)}K</div>
                                    <div className="text-sm text-muted-foreground">{plan.users} users</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Top Performers */}
            <Card>
                <CardHeader>
                    <CardTitle>Top Performing Users</CardTitle>
                    <CardDescription>Users with highest returns</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {data.topPerformers.map((user, idx) => (
                            <div key={user.userId} className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-white rounded-lg border">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-600 text-white font-bold">
                                        #{idx + 1}
                                    </div>
                                    <div>
                                        <div className="font-semibold">{user.userName}</div>
                                        <div className="text-sm text-muted-foreground">{user.trades} trades</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-bold text-green-600">
                                        +{user.totalReturn.toFixed(2)}%
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
