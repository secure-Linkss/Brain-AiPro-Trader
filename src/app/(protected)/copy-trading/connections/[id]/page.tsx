"use client"

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    Activity,
    TrendingUp,
    TrendingDown,
    Settings,
    Trash2,
    RefreshCw,
    CheckCircle2,
    XCircle,
    AlertCircle,
    ShieldAlert
} from 'lucide-react'

interface Trade {
    id: string
    ticket: string
    symbol: string
    type: string
    lots: number
    entryPrice: number
    currentPrice: number | null
    stopLoss: number | null
    takeProfit: number | null
    tp1: number | null
    tp2: number | null
    tp3: number | null
    tp4: number | null
    tp1Hit: boolean
    tp2Hit: boolean
    tp3Hit: boolean
    tp4Hit: boolean
    profit: number
    profitPips: number
    rMultiple: number | null
    status: string
    openTime: string
    trailingActive: boolean
    trailCount: number
    breakEvenHit: boolean
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

interface TrailingConfig {
    enabled: boolean
    mode: string
    atrPeriod: number
    atrMultiplier: number
    breakEvenR: number
    breakEvenPadding: number
    trailRStep: number
    minTrailDistancePips: number
    sendTrailingAlerts: boolean
}

interface ConnectionSettings {
    id: string
    riskPercent: number
    maxLot: number
    maxOpenTrades: number
    dailyLossLimit: number
    allowBuy: boolean
    allowSell: boolean
    stopAfterMaxLoss: boolean
    breakEvenEnabled: boolean
    breakEvenTriggerR: number
    breakEvenPadding: number
    tp1Enabled: boolean
    tp2Enabled: boolean
    tp3Enabled: boolean
    tp4Enabled: boolean
    partialCloseTP1: number
    partialCloseTP2: number
    partialCloseTP3: number
    partialCloseTP4: number
}

export default function ConnectionDetails() {
    const params = useParams()
    const router = useRouter()
    const connectionId = params.id as string

    const [trades, setTrades] = useState<Trade[]>([])
    const [summary, setSummary] = useState<TradesSummary | null>(null)
    const [trailingConfig, setTrailingConfig] = useState<TrailingConfig | null>(null)
    const [connectionSettings, setConnectionSettings] = useState<ConnectionSettings | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        fetchData()
    }, [connectionId])

    const fetchData = async () => {
        setLoading(true)
        await Promise.all([
            fetchTrades(),
            fetchTrailingConfig(),
            fetchConnectionSettings()
        ])
        setLoading(false)
    }

    const fetchTrades = async () => {
        try {
            const response = await fetch(`/api/mt4/trades/${connectionId}?status=all`)
            const data = await response.json()

            if (response.ok) {
                setTrades(data.trades || [])
                setSummary(data.summary)
            }
        } catch (err) {
            console.error('Failed to fetch trades:', err)
        }
    }

    const fetchTrailingConfig = async () => {
        try {
            const response = await fetch(`/api/mt4/trailing/config/${connectionId}`)
            const data = await response.json()

            if (response.ok) {
                setTrailingConfig(data.config)
            }
        } catch (err) {
            console.error('Failed to fetch trailing config:', err)
        }
    }

    const fetchConnectionSettings = async () => {
        try {
            const response = await fetch(`/api/mt4/connection/${connectionId}`)
            const data = await response.json()

            if (response.ok) {
                setConnectionSettings(data.connection)
            }
        } catch (err) {
            console.error('Failed to fetch connection settings:', err)
        }
    }

    const updateTrailingConfig = async (updates: Partial<TrailingConfig>) => {
        try {
            setSaving(true)
            const response = await fetch(`/api/mt4/trailing/config/${connectionId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            })

            if (response.ok) {
                const data = await response.json()
                setTrailingConfig(data.config)
            } else {
                setError('Failed to update trailing config')
            }
        } catch (err) {
            setError('Failed to update trailing config')
        } finally {
            setSaving(false)
        }
    }

    const updateConnectionSettings = async (updates: Partial<ConnectionSettings>) => {
        try {
            setSaving(true)
            const response = await fetch(`/api/mt4/connection/${connectionId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            })

            if (response.ok) {
                const data = await response.json()
                // Merge updates into current state to avoid full reload
                setConnectionSettings(prev => prev ? { ...prev, ...updates } : null)
            } else {
                setError('Failed to update connection settings')
            }
        } catch (err) {
            setError('Failed to update connection settings')
        } finally {
            setSaving(false)
        }
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
                    <Button variant="ghost" onClick={() => router.push('/copy-trading')}>
                        ← Back to Connections
                    </Button>
                    <h1 className="text-3xl font-bold mt-2">Connection Details</h1>
                </div>
                <Button
                    variant="destructive"
                    onClick={async () => {
                        if (confirm('Are you sure you want to delete this connection? This action cannot be undone.')) {
                            try {
                                const res = await fetch(`/api/mt4/connection/${connectionId}`, { method: 'DELETE' })
                                if (res.ok) {
                                    router.push('/copy-trading')
                                } else {
                                    const data = await res.json()
                                    setError(data.error || 'Failed to delete connection')
                                }
                            } catch (err) {
                                setError('Failed to delete connection')
                            }
                        }
                    }}
                >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Connection
                </Button>
            </div>


            {
                error && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )
            }

            {/* Summary Stats */}
            {
                summary && (
                    <div className="grid gap-4 md:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Trades</CardTitle>
                                <Activity className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{summary.total}</div>
                                <p className="text-xs text-muted-foreground">
                                    {summary.open} open, {summary.closed} closed
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
                                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className={`text-2xl font-bold ${summary.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {summary.totalProfit >= 0 ? '+' : ''}${summary.totalProfit.toFixed(2)}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {summary.totalProfitPips >= 0 ? '+' : ''}{summary.totalProfitPips.toFixed(1)} pips
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
                                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{summary.winRate.toFixed(1)}%</div>
                                <p className="text-xs text-muted-foreground">
                                    {summary.winningTrades}W / {summary.losingTrades}L
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Open Positions</CardTitle>
                                <Activity className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{summary.open}</div>
                                <p className="text-xs text-muted-foreground">
                                    Active trades
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                )
            }

            {/* Tabs */}
            <Tabs defaultValue="trades">
                <TabsList>
                    <TabsTrigger value="trades">Trades</TabsTrigger>
                    <TabsTrigger value="trailing">Trailing Stop</TabsTrigger>
                    <TabsTrigger value="risk">Risk Settings</TabsTrigger>
                </TabsList>

                {/* Trades Tab */}
                <TabsContent value="trades" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Trade History</CardTitle>
                                <Button variant="outline" size="sm" onClick={fetchTrades}>
                                    <RefreshCw className="h-4 w-4 mr-2" />
                                    Refresh
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Ticket</TableHead>
                                        <TableHead>Symbol</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Lots</TableHead>
                                        <TableHead>Entry</TableHead>
                                        <TableHead>Current</TableHead>
                                        <TableHead>SL</TableHead>
                                        <TableHead>TP</TableHead>
                                        <TableHead>Profit</TableHead>
                                        <TableHead>Pips</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {trades.map((trade) => (
                                        <TableRow key={trade.id}>
                                            <TableCell className="font-mono text-xs">#{trade.ticket}</TableCell>
                                            <TableCell className="font-semibold">{trade.symbol}</TableCell>
                                            <TableCell>
                                                <Badge variant={trade.type === 'buy' ? 'default' : 'destructive'}>
                                                    {trade.type.toUpperCase()}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{trade.lots}</TableCell>
                                            <TableCell className="text-xs">{trade.entryPrice.toFixed(5)}</TableCell>
                                            <TableCell className="text-xs">{trade.currentPrice?.toFixed(5) || '-'}</TableCell>
                                            <TableCell className="text-xs">{trade.stopLoss?.toFixed(5) || '-'}</TableCell>
                                            <TableCell className="text-xs">
                                                {trade.tp4 ? trade.tp4.toFixed(5) : '-'}
                                                {trade.tp1Hit && <CheckCircle2 className="h-3 w-3 text-green-600 inline ml-1" />}
                                            </TableCell>
                                            <TableCell className={trade.profit >= 0 ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                                                {trade.profit >= 0 ? '+' : ''}${trade.profit.toFixed(2)}
                                            </TableCell>
                                            <TableCell className={trade.profitPips >= 0 ? 'text-green-600' : 'text-red-600'}>
                                                {trade.profitPips >= 0 ? '+' : ''}{trade.profitPips.toFixed(1)}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={trade.status === 'open' ? 'default' : 'secondary'}>
                                                    {trade.status}
                                                </Badge>
                                                {trade.trailingActive && (
                                                    <Badge variant="outline" className="ml-1">
                                                        Trailing ({trade.trailCount})
                                                    </Badge>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>

                            {trades.length === 0 && (
                                <div className="text-center py-12 text-muted-foreground">
                                    No trades yet
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Trailing Stop Tab */}
                <TabsContent value="trailing" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Trailing Stop Configuration</CardTitle>
                            <CardDescription>
                                Configure advanced trailing stop settings for this connection
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {trailingConfig && (
                                <>
                                    {/* Enable/Disable */}
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label>Enable Trailing Stop</Label>
                                            <p className="text-sm text-muted-foreground">
                                                Automatically move stop loss as trade becomes profitable
                                            </p>
                                        </div>
                                        <Switch
                                            checked={trailingConfig.enabled}
                                            onCheckedChange={(enabled) => updateTrailingConfig({ enabled })}
                                            disabled={saving}
                                        />
                                    </div>

                                    {trailingConfig.enabled && (
                                        <>
                                            {/* Mode Selection */}
                                            <div className="space-y-2">
                                                <Label>Trailing Mode</Label>
                                                <Select
                                                    value={trailingConfig.mode}
                                                    onValueChange={(mode) => updateTrailingConfig({ mode })}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="atr">ATR-Based</SelectItem>
                                                        <SelectItem value="structure">Market Structure</SelectItem>
                                                        <SelectItem value="r_multiple">R-Multiple</SelectItem>
                                                        <SelectItem value="hybrid">Hybrid (Recommended)</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <p className="text-xs text-muted-foreground">
                                                    Hybrid mode uses the tightest SL from all methods
                                                </p>
                                            </div>

                                            {/* ATR Settings */}
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label>ATR Period</Label>
                                                    <Input
                                                        type="number"
                                                        value={trailingConfig.atrPeriod}
                                                        onChange={(e) => updateTrailingConfig({ atrPeriod: parseInt(e.target.value) })}
                                                        onBlur={() => fetchTrailingConfig()}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>ATR Multiplier</Label>
                                                    <Input
                                                        type="number"
                                                        step="0.1"
                                                        value={trailingConfig.atrMultiplier}
                                                        onChange={(e) => updateTrailingConfig({ atrMultiplier: parseFloat(e.target.value) })}
                                                        onBlur={() => fetchTrailingConfig()}
                                                    />
                                                </div>
                                            </div>

                                            {/* Breakeven Settings */}
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label>Breakeven Trigger (R)</Label>
                                                    <Input
                                                        type="number"
                                                        step="0.1"
                                                        value={trailingConfig.breakEvenR}
                                                        onChange={(e) => updateTrailingConfig({ breakEvenR: parseFloat(e.target.value) })}
                                                        onBlur={() => fetchTrailingConfig()}
                                                    />
                                                    <p className="text-xs text-muted-foreground">
                                                        Move to breakeven after this many R
                                                    </p>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Breakeven Padding (pips)</Label>
                                                    <Input
                                                        type="number"
                                                        step="0.1"
                                                        value={trailingConfig.breakEvenPadding}
                                                        onChange={(e) => updateTrailingConfig({ breakEvenPadding: parseFloat(e.target.value) })}
                                                        onBlur={() => fetchTrailingConfig()}
                                                    />
                                                </div>
                                            </div>

                                            {/* R-Multiple Settings */}
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label>Trail R Step</Label>
                                                    <Input
                                                        type="number"
                                                        step="0.1"
                                                        value={trailingConfig.trailRStep}
                                                        onChange={(e) => updateTrailingConfig({ trailRStep: parseFloat(e.target.value) })}
                                                        onBlur={() => fetchTrailingConfig()}
                                                    />
                                                    <p className="text-xs text-muted-foreground">
                                                        Trail every X R-multiples
                                                    </p>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Min Trail Distance (pips)</Label>
                                                    <Input
                                                        type="number"
                                                        step="0.1"
                                                        value={trailingConfig.minTrailDistancePips}
                                                        onChange={(e) => updateTrailingConfig({ minTrailDistancePips: parseFloat(e.target.value) })}
                                                        onBlur={() => fetchTrailingConfig()}
                                                    />
                                                </div>
                                            </div>

                                            {/* Telegram Alerts */}
                                            <div className="flex items-center justify-between">
                                                <div className="space-y-0.5">
                                                    <Label>Telegram Alerts</Label>
                                                    <p className="text-sm text-muted-foreground">
                                                        Send notifications when trailing stop moves
                                                    </p>
                                                </div>
                                                <Switch
                                                    checked={trailingConfig.sendTrailingAlerts}
                                                    onCheckedChange={(sendTrailingAlerts) => updateTrailingConfig({ sendTrailingAlerts })}
                                                    disabled={saving}
                                                />
                                            </div>
                                        </>
                                    )}
                                </>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Risk Settings Tab */}
                <TabsContent value="risk" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Risk Management Settings</CardTitle>
                            <CardDescription>
                                Configure risk parameters for this connection
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {connectionSettings && (
                                <>
                                    {/* Risk Per Trade */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Risk Per Trade (%)</Label>
                                            <Input
                                                type="number"
                                                step="0.1"
                                                value={connectionSettings.riskPercent}
                                                onChange={(e) => updateConnectionSettings({ riskPercent: parseFloat(e.target.value) })}
                                            />
                                            <p className="text-xs text-muted-foreground">
                                                Percentage of equity to risk per trade
                                            </p>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Max Lot Size</Label>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                value={connectionSettings.maxLot}
                                                onChange={(e) => updateConnectionSettings({ maxLot: parseFloat(e.target.value) })}
                                            />
                                            <p className="text-xs text-muted-foreground">
                                                Maximum lot size allowed per trade
                                            </p>
                                        </div>
                                    </div>

                                    {/* Limits */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Max Open Trades</Label>
                                            <Input
                                                type="number"
                                                value={connectionSettings.maxOpenTrades}
                                                onChange={(e) => updateConnectionSettings({ maxOpenTrades: parseInt(e.target.value) })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Daily Loss Limit (%)</Label>
                                            <Input
                                                type="number"
                                                step="0.1"
                                                value={connectionSettings.dailyLossLimit}
                                                onChange={(e) => updateConnectionSettings({ dailyLossLimit: parseFloat(e.target.value) })}
                                            />
                                            <p className="text-xs text-muted-foreground">
                                                Stop trading if daily loss exceeds this %
                                            </p>
                                        </div>
                                    </div>

                                    {/* Permissions */}
                                    <div className="flex flex-col gap-4 p-4 border rounded-lg">
                                        <h3 className="font-medium">Trading Permissions</h3>
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-0.5">
                                                <Label>Allow Buy Trades</Label>
                                            </div>
                                            <Switch
                                                checked={connectionSettings.allowBuy}
                                                onCheckedChange={(allowBuy) => updateConnectionSettings({ allowBuy })}
                                            />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-0.5">
                                                <Label>Allow Sell Trades</Label>
                                            </div>
                                            <Switch
                                                checked={connectionSettings.allowSell}
                                                onCheckedChange={(allowSell) => updateConnectionSettings({ allowSell })}
                                            />
                                        </div>
                                    </div>

                                    {/* TP Management */}
                                    <div className="space-y-4">
                                        <h3 className="font-medium">Take Profit Management</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <Label>TP1 (1R)</Label>
                                                    <Switch
                                                        checked={connectionSettings.tp1Enabled}
                                                        onCheckedChange={(tp1Enabled) => updateConnectionSettings({ tp1Enabled })}
                                                    />
                                                </div>
                                                <Input
                                                    type="number"
                                                    value={connectionSettings.partialCloseTP1}
                                                    onChange={(e) => updateConnectionSettings({ partialCloseTP1: parseFloat(e.target.value) })}
                                                    disabled={!connectionSettings.tp1Enabled}
                                                />
                                                <p className="text-xs text-muted-foreground">% to close</p>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <Label>TP2 (2R)</Label>
                                                    <Switch
                                                        checked={connectionSettings.tp2Enabled}
                                                        onCheckedChange={(tp2Enabled) => updateConnectionSettings({ tp2Enabled })}
                                                    />
                                                </div>
                                                <Input
                                                    type="number"
                                                    value={connectionSettings.partialCloseTP2}
                                                    onChange={(e) => updateConnectionSettings({ partialCloseTP2: parseFloat(e.target.value) })}
                                                    disabled={!connectionSettings.tp2Enabled}
                                                />
                                                <p className="text-xs text-muted-foreground">% to close</p>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <Label>TP3 (3R)</Label>
                                                    <Switch
                                                        checked={connectionSettings.tp3Enabled}
                                                        onCheckedChange={(tp3Enabled) => updateConnectionSettings({ tp3Enabled })}
                                                    />
                                                </div>
                                                <Input
                                                    type="number"
                                                    value={connectionSettings.partialCloseTP3}
                                                    onChange={(e) => updateConnectionSettings({ partialCloseTP3: parseFloat(e.target.value) })}
                                                    disabled={!connectionSettings.tp3Enabled}
                                                />
                                                <p className="text-xs text-muted-foreground">% to close</p>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <Label>TP4 (5R)</Label>
                                                    <Switch
                                                        checked={connectionSettings.tp4Enabled}
                                                        onCheckedChange={(tp4Enabled) => updateConnectionSettings({ tp4Enabled })}
                                                    />
                                                </div>
                                                <Input
                                                    type="number"
                                                    value={connectionSettings.partialCloseTP4}
                                                    onChange={(e) => updateConnectionSettings({ partialCloseTP4: parseFloat(e.target.value) })}
                                                    disabled={!connectionSettings.tp4Enabled}
                                                />
                                                <p className="text-xs text-muted-foreground">% to close</p>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div >
    )
}
