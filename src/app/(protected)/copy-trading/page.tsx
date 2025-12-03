"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
    Plus,
    TrendingUp,
    TrendingDown,
    Activity,
    DollarSign,
    Wifi,
    WifiOff,
    Settings,
    Download,
    AlertCircle,
    CheckCircle2
} from 'lucide-react'
import Link from 'next/link'

interface Connection {
    id: string
    deviceName: string
    accountNumber: string
    platform: string
    brokerName: string | null
    status: string
    isOnline: boolean
    connectionQuality: string
    balance: number
    equity: number
    profit: number
    freeMargin: number
    marginLevel: number
    leverage: number
    openTrades: number
    recentErrors: number
    trailingEnabled: boolean
    lastHeartbeat: string | null
    createdAt: string
}

interface TradesSummary {
    total: number
    open: number
    closed: number
    totalProfit: number
    totalProfitPips: number
    winningTrades: number
    losingTrades: number
    winRate: number
}

export default function CopyTradingDashboard() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [connections, setConnections] = useState<Connection[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login')
        } else if (status === 'authenticated') {
            fetchConnections()
        }
    }, [status, router])

    const fetchConnections = async () => {
        try {
            setLoading(true)
            const response = await fetch('/api/mt4/connection/list')
            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch connections')
            }

            setConnections(data.connections || [])
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load connections')
        } finally {
            setLoading(false)
        }
    }

    const getConnectionStatusColor = (quality: string) => {
        switch (quality) {
            case 'excellent': return 'bg-green-500'
            case 'good': return 'bg-blue-500'
            case 'poor': return 'bg-yellow-500'
            default: return 'bg-gray-500'
        }
    }

    const getConnectionStatusIcon = (isOnline: boolean) => {
        return isOnline ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        )
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Copy Trading</h1>
                    <p className="text-muted-foreground">
                        Connect your MT4/MT5 accounts to receive automated signals
                    </p>
                </div>
                <div className="flex gap-2">
                    <Link href="/copy-trading/setup">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Connection
                        </Button>
                    </Link>
                </div>
            </div>

            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {/* No Connections State */}
            {connections.length === 0 && (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <Activity className="h-16 w-16 text-muted-foreground mb-4" />
                        <h3 className="text-xl font-semibold mb-2">No Connections Yet</h3>
                        <p className="text-muted-foreground text-center mb-6 max-w-md">
                            Connect your MT4 or MT5 account to start receiving automated trading signals
                        </p>
                        <Link href="/copy-trading/setup">
                            <Button size="lg">
                                <Plus className="mr-2 h-4 w-4" />
                                Connect MT4/MT5 Account
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            )}

            {/* Connections Grid */}
            {connections.length > 0 && (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {connections.map((connection) => (
                        <Card key={connection.id} className="relative">
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <CardTitle className="flex items-center gap-2">
                                            {connection.deviceName}
                                            {getConnectionStatusIcon(connection.isOnline)}
                                        </CardTitle>
                                        <CardDescription>
                                            {connection.platform} • #{connection.accountNumber}
                                        </CardDescription>
                                    </div>
                                    <div className={`h-3 w-3 rounded-full ${getConnectionStatusColor(connection.connectionQuality)}`} />
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Status */}
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Status</span>
                                    <Badge variant={connection.isOnline ? 'default' : 'secondary'}>
                                        {connection.isOnline ? 'Online' : 'Offline'}
                                    </Badge>
                                </div>

                                {/* Account Metrics */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">Balance</span>
                                        <span className="font-semibold">${connection.balance.toFixed(2)}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">Equity</span>
                                        <span className="font-semibold">${connection.equity.toFixed(2)}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">Profit</span>
                                        <span className={`font-semibold ${connection.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {connection.profit >= 0 ? '+' : ''}${connection.profit.toFixed(2)}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">Free Margin</span>
                                        <span className="text-sm">${connection.freeMargin.toFixed(2)}</span>
                                    </div>
                                </div>

                                {/* Trading Stats */}
                                <div className="pt-4 border-t">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm text-muted-foreground">Open Trades</span>
                                        <Badge variant="outline">{connection.openTrades}</Badge>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">Trailing Stop</span>
                                        <Badge variant={connection.trailingEnabled ? 'default' : 'secondary'}>
                                            {connection.trailingEnabled ? 'Enabled' : 'Disabled'}
                                        </Badge>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2 pt-4">
                                    <Link href={`/copy-trading/connections/${connection.id}`} className="flex-1">
                                        <Button variant="outline" className="w-full">
                                            <Activity className="mr-2 h-4 w-4" />
                                            View Details
                                        </Button>
                                    </Link>
                                    <Link href={`/copy-trading/connections/${connection.id}/settings`}>
                                        <Button variant="ghost" size="icon">
                                            <Settings className="h-4 w-4" />
                                        </Button>
                                    </Link>
                                </div>

                                {/* Warnings */}
                                {connection.recentErrors > 0 && (
                                    <Alert variant="destructive">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertDescription>
                                            {connection.recentErrors} error(s) in last 24h
                                        </AlertDescription>
                                    </Alert>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Quick Stats */}
            {connections.length > 0 && (
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Connections</CardTitle>
                            <Activity className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{connections.length}</div>
                            <p className="text-xs text-muted-foreground">
                                {connections.filter(c => c.isOnline).length} online
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Equity</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                ${connections.reduce((sum, c) => sum + c.equity, 0).toFixed(2)}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Across all accounts
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className={`text-2xl font-bold ${connections.reduce((sum, c) => sum + c.profit, 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {connections.reduce((sum, c) => sum + c.profit, 0) >= 0 ? '+' : ''}
                                ${connections.reduce((sum, c) => sum + c.profit, 0).toFixed(2)}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Combined P/L
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Open Trades</CardTitle>
                            <Activity className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {connections.reduce((sum, c) => sum + c.openTrades, 0)}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Active positions
                            </p>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    )
}
