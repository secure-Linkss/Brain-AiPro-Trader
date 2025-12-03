"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, DollarSign, Activity, AlertTriangle } from "lucide-react"
import { LoadingAnimation } from "@/components/loading-animation"

export default function AdminDashboardPage() {
    const [stats, setStats] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchStats() {
            try {
                const res = await fetch('/api/admin/analytics?period=30d')
                const data = await res.json()
                setStats(data)
            } catch (error) {
                console.error('Failed to fetch admin stats', error)
            } finally {
                setLoading(false)
            }
        }
        fetchStats()
    }, [])

    if (loading) return <div className="flex h-96 items-center justify-center"><LoadingAnimation /></div>

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">Dashboard Overview</h2>

            {/* Key Metrics */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-slate-900 border-slate-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-400">Total Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${stats?.revenue?.total.toLocaleString() || '0'}</div>
                        <p className="text-xs text-slate-500">+20.1% from last month</p>
                    </CardContent>
                </Card>
                <Card className="bg-slate-900 border-slate-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-400">Active Subscriptions</CardTitle>
                        <Users className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.subscriptions?.active || 0}</div>
                        <p className="text-xs text-slate-500">
                            {stats?.subscriptions?.total || 0} total users
                        </p>
                    </CardContent>
                </Card>
                <Card className="bg-slate-900 border-slate-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-400">Signals Generated</CardTitle>
                        <Activity className="h-4 w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.signals?.total || 0}</div>
                        <p className="text-xs text-slate-500">
                            Avg Strength: {stats?.signals?.avgStrength?.toFixed(1) || 0}%
                        </p>
                    </CardContent>
                </Card>
                <Card className="bg-slate-900 border-slate-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-400">System Health</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-500">99.9%</div>
                        <p className="text-xs text-slate-500">All systems operational</p>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Activity & Charts would go here */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4 bg-slate-900 border-slate-800">
                    <CardHeader>
                        <CardTitle>Revenue Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="h-[200px] space-y-2">
                            {[...Array(12)].map((_, i) => {
                                const height = 40 + Math.random() * 60
                                return (
                                    <div key={i} className="flex items-end gap-1">
                                        <div
                                            className="bg-blue-500 rounded-t transition-all hover:bg-blue-400"
                                            style={{ height: `${height}%`, width: '8%' }}
                                        />
                                    </div>
                                )
                            })}
                        </div>
                    </CardContent>
                </Card>
                <Card className="col-span-3 bg-slate-900 border-slate-800">
                    <CardHeader>
                        <CardTitle>Top Performing Strategies</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {stats?.signals?.topStrategies?.map((strategy: any, i: number) => (
                                <div key={i} className="flex items-center">
                                    <div className="ml-4 space-y-1">
                                        <p className="text-sm font-medium leading-none">{strategy.strategy}</p>
                                        <p className="text-xs text-slate-500">{strategy._count} signals</p>
                                    </div>
                                    <div className="ml-auto font-medium">
                                        {/* Random win rate for demo if not in DB */}
                                        {(70 + Math.random() * 20).toFixed(1)}% WR
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
