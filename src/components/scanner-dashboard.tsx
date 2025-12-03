"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RefreshCw, Target, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react"
import { Progress } from "@/components/ui/progress"

interface Opportunity {
    id: string
    tradingPair: {
        symbol: string
    }
    type: "BUY" | "SELL"
    entryPrice: number
    stopLoss: number
    takeProfit1: number
    strength: number
    sniperScore: number
    validationDetails: string[]
    createdAt: string
}

export function ScannerDashboard() {
    const [opportunities, setOpportunities] = useState<Opportunity[]>([])
    const [loading, setLoading] = useState(false)
    const [scanning, setScanning] = useState(false)

    const fetchOpportunities = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/scanner/opportunities')
            const data = await res.json()
            setOpportunities(data.opportunities)
        } catch (error) {
            console.error('Failed to fetch opportunities', error)
        } finally {
            setLoading(false)
        }
    }

    const runScan = async (market: string) => {
        setScanning(true)
        try {
            await fetch('/api/scanner/run', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ market })
            })
            // Poll for results or wait a bit
            setTimeout(fetchOpportunities, 5000)
        } catch (error) {
            console.error('Failed to run scan', error)
        } finally {
            setScanning(false)
        }
    }

    useEffect(() => {
        fetchOpportunities()
    }, [])

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white">Market Scanner</h2>
                    <p className="text-slate-400">Real-time AI analysis with Sniper Entry validation</p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={() => runScan('forex')}
                        disabled={scanning}
                        className="border-slate-700 text-slate-300 hover:bg-slate-800"
                    >
                        {scanning ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Target className="mr-2 h-4 w-4" />}
                        Scan Forex
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => runScan('crypto')}
                        disabled={scanning}
                        className="border-slate-700 text-slate-300 hover:bg-slate-800"
                    >
                        {scanning ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Target className="mr-2 h-4 w-4" />}
                        Scan Crypto
                    </Button>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {opportunities.map((opp) => (
                    <Card key={opp.id} className="bg-slate-900 border-slate-800 hover:border-blue-500/50 transition-all">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-lg font-bold text-white">
                                {opp.tradingPair.symbol}
                            </CardTitle>
                            <Badge variant={opp.type === 'BUY' ? 'default' : 'destructive'} className={opp.type === 'BUY' ? 'bg-green-500' : 'bg-red-500'}>
                                {opp.type}
                            </Badge>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-400 text-sm">Entry</span>
                                    <span className="text-white font-mono">{opp.entryPrice}</span>
                                </div>

                                <div className="space-y-1">
                                    <div className="flex justify-between text-xs">
                                        <span className="text-slate-400">AI Confidence</span>
                                        <span className="text-blue-400">{opp.strength}%</span>
                                    </div>
                                    <Progress value={opp.strength} className="h-1.5 bg-slate-800" />
                                </div>

                                <div className="space-y-1">
                                    <div className="flex justify-between text-xs">
                                        <span className="text-slate-400">Sniper Score</span>
                                        <span className="text-purple-400">{opp.sniperScore}/100</span>
                                    </div>
                                    <Progress value={opp.sniperScore} className="h-1.5 bg-slate-800" />
                                </div>

                                <div className="pt-2 border-t border-slate-800">
                                    <p className="text-xs text-slate-500 mb-2">Validation:</p>
                                    <div className="space-y-1">
                                        {opp.validationDetails.slice(0, 3).map((detail, i) => (
                                            <div key={i} className="flex items-center text-xs text-slate-300">
                                                <div className="h-1.5 w-1.5 rounded-full bg-green-500 mr-2" />
                                                {detail}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <Button className="w-full bg-blue-600 hover:bg-blue-700 h-8 text-xs">
                                    View Analysis
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {opportunities.length === 0 && !loading && (
                    <div className="col-span-full flex flex-col items-center justify-center py-12 text-slate-500">
                        <Target className="h-12 w-12 mb-4 opacity-20" />
                        <p>No high-probability opportunities found.</p>
                        <p className="text-sm">Try running a scan.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
