"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
    Play, Pause, RefreshCw, TrendingUp, TrendingDown,
    Clock, CheckCircle, XCircle, AlertTriangle, BarChart3
} from "lucide-react"
import { LoadingAnimation } from "@/components/loading-animation"
import { useToast } from "@/components/ui/use-toast"

interface StrategyQueueItem {
    id: string
    name: string
    asset_class: string
    status: string
    created_at: string
    confidence_score: number
}

interface BacktestResult {
    id: string
    strategy_name: string
    asset_class: string
    metrics: {
        sharpe_ratio: number
        win_rate: number
        total_return: number
        max_drawdown: number
        total_trades: number
    }
    analysis: {
        performance_grade: string
        deployment_ready: boolean
        risk_assessment: string
    }
    created_at: string
}

export default function BacktestingDashboardPage() {
    const [loading, setLoading] = useState(true)
    const [queue, setQueue] = useState<StrategyQueueItem[]>([])
    const [results, setResults] = useState<BacktestResult[]>([])
    const [runningBacktest, setRunningBacktest] = useState(false)
    const { toast } = useToast()

    // Manual backtest form state
    const [manualBacktest, setManualBacktest] = useState({
        strategy_name: '',
        asset_class: 'forex',
        symbol: 'EURUSD',
        timeframe: '1h',
        start_date: '',
        end_date: '',
        initial_capital: 10000
    })

    useEffect(() => {
        fetchData()
        // Poll for updates every 30 seconds
        const interval = setInterval(fetchData, 30000)
        return () => clearInterval(interval)
    }, [])

    const fetchData = async () => {
        try {
            const [queueRes, resultsRes] = await Promise.all([
                fetch('/api/admin/backtesting/queue'),
                fetch('/api/admin/backtesting/results?limit=20')
            ])

            if (queueRes.ok) {
                const queueData = await queueRes.json()
                setQueue(queueData.queue || [])
            }

            if (resultsRes.ok) {
                const resultsData = await resultsRes.json()
                setResults(resultsData.results || [])
            }
        } catch (error) {
            console.error('Failed to fetch backtesting data:', error)
        } finally {
            setLoading(false)
        }
    }

    const triggerAutomatedCycle = async () => {
        try {
            const res = await fetch('/api/admin/backtesting/trigger-cycle', {
                method: 'POST'
            })

            if (res.ok) {
                toast({
                    title: "Success",
                    description: "Automated backtesting cycle started",
                })
                fetchData()
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to trigger backtesting cycle",
                variant: "destructive"
            })
        }
    }

    const runManualBacktest = async (e: React.FormEvent) => {
        e.preventDefault()
        setRunningBacktest(true)

        try {
            const res = await fetch('/api/admin/backtesting/manual', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(manualBacktest)
            })

            if (res.ok) {
                const result = await res.json()
                toast({
                    title: "Backtest Complete",
                    description: `Sharpe Ratio: ${result.metrics.sharpe_ratio.toFixed(2)} | Win Rate: ${(result.metrics.win_rate * 100).toFixed(1)}%`,
                })
                fetchData()
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to run backtest",
                variant: "destructive"
            })
        } finally {
            setRunningBacktest(false)
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'queued':
                return <Clock className="h-4 w-4 text-yellow-500" />
            case 'running':
                return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />
            case 'completed':
                return <CheckCircle className="h-4 w-4 text-green-500" />
            case 'failed':
                return <XCircle className="h-4 w-4 text-red-500" />
            default:
                return <AlertTriangle className="h-4 w-4 text-gray-500" />
        }
    }

    const getGradeColor = (grade: string) => {
        if (grade.startsWith('A')) return 'text-green-500'
        if (grade.startsWith('B')) return 'text-blue-500'
        if (grade.startsWith('C')) return 'text-yellow-500'
        return 'text-red-500'
    }

    if (loading) {
        return <div className="flex h-96 items-center justify-center"><LoadingAnimation /></div>
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Backtesting Dashboard</h2>
                    <p className="text-slate-400">Automated strategy discovery and validation</p>
                </div>
                <Button
                    onClick={triggerAutomatedCycle}
                    className="bg-blue-600 hover:bg-blue-700"
                >
                    <Play className="mr-2 h-4 w-4" />
                    Trigger Automated Cycle
                </Button>
            </div>

            {/* Stats Overview */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card className="bg-slate-900 border-slate-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-400">Queued Strategies</CardTitle>
                        <Clock className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{queue.filter(s => s.status === 'queued').length}</div>
                    </CardContent>
                </Card>

                <Card className="bg-slate-900 border-slate-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-400">Running Tests</CardTitle>
                        <RefreshCw className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{queue.filter(s => s.status === 'running').length}</div>
                    </CardContent>
                </Card>

                <Card className="bg-slate-900 border-slate-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-400">Deployment Ready</CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {results.filter(r => r.analysis.deployment_ready).length}
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-slate-900 border-slate-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-400">Avg Sharpe Ratio</CardTitle>
                        <BarChart3 className="h-4 w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {results.length > 0
                                ? (results.reduce((sum, r) => sum + r.metrics.sharpe_ratio, 0) / results.length).toFixed(2)
                                : '0.00'
                            }
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="manual" className="space-y-4">
                <TabsList className="bg-slate-900">
                    <TabsTrigger value="manual">Manual Backtest</TabsTrigger>
                    <TabsTrigger value="queue">Strategy Queue</TabsTrigger>
                    <TabsTrigger value="results">Results Library</TabsTrigger>
                    <TabsTrigger value="deployed">Deployed Strategies</TabsTrigger>
                </TabsList>

                <TabsContent value="manual" className="space-y-4">
                    <Card className="bg-slate-900 border-slate-800">
                        <CardHeader>
                            <CardTitle>Run Manual Backtest</CardTitle>
                            <CardDescription>Test custom strategy parameters immediately</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={runManualBacktest} className="space-y-4">
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Strategy Name</Label>
                                        <Input
                                            value={manualBacktest.strategy_name}
                                            onChange={(e) => setManualBacktest({ ...manualBacktest, strategy_name: e.target.value })}
                                            placeholder="My Custom Strategy"
                                            className="bg-slate-800 border-slate-700"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Asset Class</Label>
                                        <Select
                                            value={manualBacktest.asset_class}
                                            onValueChange={(value) => setManualBacktest({ ...manualBacktest, asset_class: value })}
                                        >
                                            <SelectTrigger className="bg-slate-800 border-slate-700">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="bg-slate-900 border-slate-800">
                                                <SelectItem value="forex">Forex</SelectItem>
                                                <SelectItem value="crypto">Crypto</SelectItem>
                                                <SelectItem value="stocks">Stocks</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Symbol</Label>
                                        <Input
                                            value={manualBacktest.symbol}
                                            onChange={(e) => setManualBacktest({ ...manualBacktest, symbol: e.target.value })}
                                            className="bg-slate-800 border-slate-700"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Timeframe</Label>
                                        <Select
                                            value={manualBacktest.timeframe}
                                            onValueChange={(value) => setManualBacktest({ ...manualBacktest, timeframe: value })}
                                        >
                                            <SelectTrigger className="bg-slate-800 border-slate-700">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="bg-slate-900 border-slate-800">
                                                <SelectItem value="5m">5 Minutes</SelectItem>
                                                <SelectItem value="15m">15 Minutes</SelectItem>
                                                <SelectItem value="1h">1 Hour</SelectItem>
                                                <SelectItem value="4h">4 Hours</SelectItem>
                                                <SelectItem value="1d">1 Day</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Start Date</Label>
                                        <Input
                                            type="date"
                                            value={manualBacktest.start_date}
                                            onChange={(e) => setManualBacktest({ ...manualBacktest, start_date: e.target.value })}
                                            className="bg-slate-800 border-slate-700"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>End Date</Label>
                                        <Input
                                            type="date"
                                            value={manualBacktest.end_date}
                                            onChange={(e) => setManualBacktest({ ...manualBacktest, end_date: e.target.value })}
                                            className="bg-slate-800 border-slate-700"
                                            required
                                        />
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full bg-blue-600 hover:bg-blue-700"
                                    disabled={runningBacktest}
                                >
                                    {runningBacktest ? <LoadingAnimation /> : 'Run Backtest'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="queue" className="space-y-4">
                    <Card className="bg-slate-900 border-slate-800">
                        <CardHeader>
                            <CardTitle>Strategy Queue</CardTitle>
                            <CardDescription>Strategies awaiting backtesting</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {queue.map((item) => (
                                    <div key={item.id} className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                                        <div className="flex items-center gap-4">
                                            {getStatusIcon(item.status)}
                                            <div>
                                                <p className="font-medium">{item.name}</p>
                                                <p className="text-sm text-slate-400 capitalize">{item.asset_class}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <Badge variant="outline">{item.status}</Badge>
                                            <span className="text-sm text-slate-400">
                                                {new Date(item.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                                {queue.length === 0 && (
                                    <p className="text-center text-slate-500 py-8">No strategies in queue</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="results" className="space-y-4">
                    <Card className="bg-slate-900 border-slate-800">
                        <CardHeader>
                            <CardTitle>Backtest Results</CardTitle>
                            <CardDescription>Historical backtest performance</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {results.map((result) => (
                                    <div key={result.id} className="p-4 bg-slate-800/50 rounded-lg space-y-2">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium">{result.strategy_name}</p>
                                                <p className="text-sm text-slate-400 capitalize">{result.asset_class}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge className={getGradeColor(result.analysis.performance_grade)}>
                                                    Grade: {result.analysis.performance_grade}
                                                </Badge>
                                                {result.analysis.deployment_ready && (
                                                    <Badge className="bg-green-500">Ready</Badge>
                                                )}
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-5 gap-4 text-sm">
                                            <div>
                                                <p className="text-slate-400">Sharpe</p>
                                                <p className="font-semibold">{result.metrics.sharpe_ratio.toFixed(2)}</p>
                                            </div>
                                            <div>
                                                <p className="text-slate-400">Win Rate</p>
                                                <p className="font-semibold">{(result.metrics.win_rate * 100).toFixed(1)}%</p>
                                            </div>
                                            <div>
                                                <p className="text-slate-400">Return</p>
                                                <p className={`font-semibold ${result.metrics.total_return > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                                    {(result.metrics.total_return * 100).toFixed(1)}%
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-slate-400">Max DD</p>
                                                <p className="font-semibold text-red-500">{(result.metrics.max_drawdown * 100).toFixed(1)}%</p>
                                            </div>
                                            <div>
                                                <p className="text-slate-400">Trades</p>
                                                <p className="font-semibold">{result.metrics.total_trades}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {results.length === 0 && (
                                    <p className="text-center text-slate-500 py-8">No backtest results yet</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="deployed" className="space-y-4">
                    <Card className="bg-slate-900 border-slate-800">
                        <CardHeader>
                            <CardTitle>Deployed Strategies</CardTitle>
                            <CardDescription>Live and paper trading strategies</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-center text-slate-500 py-8">No deployed strategies yet</p>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
