'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Activity, Cpu, HardDrive, Zap, AlertCircle, CheckCircle2, Server } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

interface SystemHealth {
    status: 'healthy' | 'warning' | 'critical'
    uptime: number
    metrics: {
        cpu: number
        memory: number
        disk: number
        responseTime: number
    }
    services: {
        name: string
        status: 'online' | 'offline' | 'degraded'
        responseTime: number
    }[]
    recentErrors: {
        id: string
        message: string
        timestamp: string
        severity: 'low' | 'medium' | 'high'
    }[]
}

export default function AdminSystemHealthPage() {
    const [health, setHealth] = useState<SystemHealth | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchHealth()
        const interval = setInterval(fetchHealth, 30000) // Refresh every 30s
        return () => clearInterval(interval)
    }, [])

    const fetchHealth = async () => {
        try {
            setLoading(true)
            const response = await fetch('/api/admin/system-health')
            if (!response.ok) throw new Error('Failed to fetch health')
            const data = await response.json()
            setHealth(data.health)
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
                <Skeleton className="h-96" />
            </div>
        )
    }

    if (!health) return null

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'healthy':
            case 'online':
                return 'bg-green-600'
            case 'warning':
            case 'degraded':
                return 'bg-yellow-600'
            case 'critical':
            case 'offline':
                return 'bg-red-600'
            default:
                return 'bg-gray-600'
        }
    }

    const getMetricColor = (value: number, threshold: number) => {
        if (value < threshold * 0.7) return 'text-green-600'
        if (value < threshold * 0.9) return 'text-yellow-600'
        return 'text-red-600'
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
            <div className={`relative overflow-hidden rounded-lg p-8 text-white ${health.status === 'healthy' ? 'bg-gradient-to-r from-green-600 to-emerald-600' :
                    health.status === 'warning' ? 'bg-gradient-to-r from-yellow-600 to-orange-600' :
                        'bg-gradient-to-r from-red-600 to-pink-600'
                }`}>
                <div className="relative z-10 flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                            <Activity className="h-10 w-10" />
                            System Health
                        </h1>
                        <p className="opacity-90">Real-time system monitoring</p>
                    </div>
                    <Badge className={getStatusColor(health.status)} variant="default">
                        {health.status === 'healthy' && <CheckCircle2 className="h-4 w-4 mr-1" />}
                        {health.status !== 'healthy' && <AlertCircle className="h-4 w-4 mr-1" />}
                        {health.status.toUpperCase()}
                    </Badge>
                </div>
            </div>

            {/* System Metrics */}
            <div className="grid gap-6 md:grid-cols-4">
                <Card className="border-blue-200">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                            <Cpu className="h-4 w-4 text-blue-600" />
                            CPU Usage
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className={`text-4xl font-bold ${getMetricColor(health.metrics.cpu, 100)}`}>
                            {health.metrics.cpu.toFixed(1)}%
                        </div>
                        <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                                className={`h-full ${health.metrics.cpu < 70 ? 'bg-green-600' :
                                        health.metrics.cpu < 90 ? 'bg-yellow-600' :
                                            'bg-red-600'
                                    }`}
                                style={{ width: `${health.metrics.cpu}%` }}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-purple-200">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                            <HardDrive className="h-4 w-4 text-purple-600" />
                            Memory Usage
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className={`text-4xl font-bold ${getMetricColor(health.metrics.memory, 100)}`}>
                            {health.metrics.memory.toFixed(1)}%
                        </div>
                        <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                                className={`h-full ${health.metrics.memory < 70 ? 'bg-green-600' :
                                        health.metrics.memory < 90 ? 'bg-yellow-600' :
                                            'bg-red-600'
                                    }`}
                                style={{ width: `${health.metrics.memory}%` }}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-green-200">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                            <Server className="h-4 w-4 text-green-600" />
                            Disk Usage
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className={`text-4xl font-bold ${getMetricColor(health.metrics.disk, 100)}`}>
                            {health.metrics.disk.toFixed(1)}%
                        </div>
                        <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                                className={`h-full ${health.metrics.disk < 70 ? 'bg-green-600' :
                                        health.metrics.disk < 90 ? 'bg-yellow-600' :
                                            'bg-red-600'
                                    }`}
                                style={{ width: `${health.metrics.disk}%` }}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-yellow-200">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                            <Zap className="h-4 w-4 text-yellow-600" />
                            Response Time
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className={`text-4xl font-bold ${getMetricColor(health.metrics.responseTime, 1000)}`}>
                            {health.metrics.responseTime}ms
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                            Average API response
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Services Status */}
            <Card>
                <CardHeader>
                    <CardTitle>Services Status</CardTitle>
                    <CardDescription>Status of all system services</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {health.services.map((service, idx) => (
                            <div key={idx} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                                <div className="flex items-center gap-4">
                                    <div className={`w-3 h-3 rounded-full ${getStatusColor(service.status)}`} />
                                    <div>
                                        <div className="font-semibold">{service.name}</div>
                                        <div className="text-sm text-muted-foreground">
                                            Response: {service.responseTime}ms
                                        </div>
                                    </div>
                                </div>
                                <Badge variant={
                                    service.status === 'online' ? 'default' :
                                        service.status === 'degraded' ? 'secondary' :
                                            'destructive'
                                }>
                                    {service.status}
                                </Badge>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Recent Errors */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Errors</CardTitle>
                    <CardDescription>Latest system errors and warnings</CardDescription>
                </CardHeader>
                <CardContent>
                    {health.recentErrors.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <CheckCircle2 className="h-12 w-12 mx-auto mb-2 text-green-600" />
                            <p>No recent errors</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {health.recentErrors.map((error) => (
                                <div
                                    key={error.id}
                                    className={`p-4 rounded-lg border ${error.severity === 'high' ? 'border-red-200 bg-red-50' :
                                            error.severity === 'medium' ? 'border-yellow-200 bg-yellow-50' :
                                                'border-gray-200 bg-gray-50'
                                        }`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Badge variant={
                                                    error.severity === 'high' ? 'destructive' :
                                                        error.severity === 'medium' ? 'secondary' :
                                                            'outline'
                                                }>
                                                    {error.severity}
                                                </Badge>
                                                <span className="text-sm text-muted-foreground">
                                                    {new Date(error.timestamp).toLocaleString()}
                                                </span>
                                            </div>
                                            <p className="text-sm">{error.message}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Uptime */}
            <Card className="border-green-200 bg-gradient-to-br from-green-50 to-white">
                <CardHeader>
                    <CardTitle className="text-green-600">System Uptime</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-5xl font-bold text-green-600">
                        {Math.floor(health.uptime / 86400)}d {Math.floor((health.uptime % 86400) / 3600)}h
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                        {health.uptime.toLocaleString()} seconds
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
