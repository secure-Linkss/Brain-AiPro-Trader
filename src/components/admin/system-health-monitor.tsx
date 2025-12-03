"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Activity, Server, Shield, Database, Cpu, Wifi } from "lucide-react"

interface SystemStatus {
    status: 'healthy' | 'degraded' | 'critical'
    uptime: number
    cpu_usage: number
    memory_usage: number
    active_agents: number
    db_latency: number
    redis_status: boolean
    last_updated: string
}

export function SystemHealthMonitor() {
    const [status, setStatus] = useState<SystemStatus>({
        status: 'healthy',
        uptime: 0,
        cpu_usage: 0,
        memory_usage: 0,
        active_agents: 5,
        db_latency: 0,
        redis_status: true,
        last_updated: new Date().toISOString()
    })

    useEffect(() => {
        const fetchHealth = async () => {
            try {
                const res = await fetch('/api/admin/system-health')
                if (res.ok) {
                    const data = await res.json()
                    setStatus(data)
                }
            } catch (error) {
                console.error("Failed to fetch system health", error)
                setStatus(prev => ({ ...prev, status: 'critical' }))
            }
        }

        // Initial fetch
        fetchHealth()

        // Poll every 10 seconds
        const interval = setInterval(fetchHealth, 10000)

        return () => clearInterval(interval)
    }, [])

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'healthy': return 'bg-green-500'
            case 'degraded': return 'bg-yellow-500'
            case 'critical': return 'bg-red-500'
            default: return 'bg-gray-500'
        }
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="bg-slate-900 border-slate-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-slate-400">System Status</CardTitle>
                    <Activity className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-2">
                        <div className={`h-3 w-3 rounded-full ${getStatusColor(status.status)}`} />
                        <div className="text-2xl font-bold capitalize">{status.status}</div>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                        Last updated: {new Date(status.last_updated).toLocaleTimeString()}
                    </p>
                </CardContent>
            </Card>

            <Card className="bg-slate-900 border-slate-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-slate-400">Active Agents</CardTitle>
                    <Cpu className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{status.active_agents}</div>
                    <p className="text-xs text-slate-500 mt-1">
                        Forex, Crypto, Stocks, Commodities, Indices
                    </p>
                </CardContent>
            </Card>

            <Card className="bg-slate-900 border-slate-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-slate-400">Database Latency</CardTitle>
                    <Database className="h-4 w-4 text-purple-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{status.db_latency}ms</div>
                    <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs border-green-500 text-green-500">Optimal</Badge>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-slate-900 border-slate-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-slate-400">Security Shield</CardTitle>
                    <Shield className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">Active</div>
                    <p className="text-xs text-slate-500 mt-1">
                        Rate Limiting & WAF Enabled
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
