'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Search, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface ScanResult {
    symbol: string
    signal: 'BUY' | 'SELL' | 'NEUTRAL'
    score: number
    price: number
    change24h: number
    volume: number
    patterns: string[]
}

export default function ScannerPage() {
    const [results, setResults] = useState<ScanResult[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [assetClass, setAssetClass] = useState('crypto')
    const [timeframe, setTimeframe] = useState('1h')

    const runScan = async () => {
        try {
            setLoading(true)
            setError(null)

            const response = await fetch('/api/scanner/run', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ assetClass, timeframe })
            })

            if (!response.ok) throw new Error('Failed to run scanner')

            const data = await response.json()
            setResults(data.results || [])
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Market Scanner</h1>
                <p className="text-muted-foreground">
                    Scan markets for high-probability trading setups
                </p>
            </div>

            {/* Scanner Controls */}
            <Card>
                <CardHeader>
                    <CardTitle>Scanner Settings</CardTitle>
                    <CardDescription>Configure and run market scans</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-4 items-end">
                        <div className="flex-1">
                            <label className="text-sm font-medium mb-2 block">Asset Class</label>
                            <Select value={assetClass} onValueChange={setAssetClass}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="crypto">Cryptocurrency</SelectItem>
                                    <SelectItem value="forex">Forex</SelectItem>
                                    <SelectItem value="stocks">Stocks</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex-1">
                            <label className="text-sm font-medium mb-2 block">Timeframe</label>
                            <Select value={timeframe} onValueChange={setTimeframe}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="15m">15 Minutes</SelectItem>
                                    <SelectItem value="1h">1 Hour</SelectItem>
                                    <SelectItem value="4h">4 Hours</SelectItem>
                                    <SelectItem value="1d">1 Day</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <Button onClick={runScan} disabled={loading} className="px-8">
                            <Search className="h-4 w-4 mr-2" />
                            {loading ? 'Scanning...' : 'Run Scan'}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Error Display */}
            {error && (
                <Card className="border-red-200 bg-red-50">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-2 text-red-600">
                            <AlertCircle className="h-5 w-5" />
                            <p>{error}</p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Loading State */}
            {loading && (
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-24" />
                    ))}
                </div>
            )}

            {/* Results */}
            {!loading && results.length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold">Scan Results ({results.length})</h2>
                    {results.map((result, idx) => (
                        <Card key={idx}>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div>
                                            <h3 className="text-xl font-bold">{result.symbol}</h3>
                                            <p className="text-sm text-muted-foreground">
                                                ${result.price.toFixed(2)}
                                            </p>
                                        </div>
                                        <Badge variant={
                                            result.signal === 'BUY' ? 'default' :
                                                result.signal === 'SELL' ? 'destructive' :
                                                    'secondary'
                                        }>
                                            {result.signal === 'BUY' && <TrendingUp className="h-3 w-3 mr-1" />}
                                            {result.signal === 'SELL' && <TrendingDown className="h-3 w-3 mr-1" />}
                                            {result.signal}
                                        </Badge>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm text-muted-foreground">Score</div>
                                        <div className="text-2xl font-bold">{result.score.toFixed(1)}%</div>
                                    </div>
                                </div>
                                <div className="mt-4 grid grid-cols-3 gap-4">
                                    <div>
                                        <div className="text-sm text-muted-foreground">24h Change</div>
                                        <div className={`font-semibold ${result.change24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {result.change24h > 0 ? '+' : ''}{result.change24h.toFixed(2)}%
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-muted-foreground">Volume</div>
                                        <div className="font-semibold">${(result.volume / 1000000).toFixed(2)}M</div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-muted-foreground">Patterns</div>
                                        <div className="flex gap-1 flex-wrap">
                                            {result.patterns.map((pattern, i) => (
                                                <Badge key={i} variant="outline" className="text-xs">
                                                    {pattern}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Empty State */}
            {!loading && results.length === 0 && !error && (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <Search className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No Results Yet</h3>
                        <p className="text-muted-foreground text-center max-w-md">
                            Configure your scanner settings and click "Run Scan" to find trading opportunities.
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
