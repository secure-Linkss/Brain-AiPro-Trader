'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Star, Plus, Trash2, TrendingUp, TrendingDown, AlertCircle, Search } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

interface WatchlistItem {
    id: string
    symbol: string
    name: string
    price: number
    change24h: number
    volume: number
    marketCap: number
    alerts: {
        priceAbove?: number
        priceBelow?: number
    }
}

export default function WatchlistPage() {
    const [watchlist, setWatchlist] = useState<WatchlistItem[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [addingSymbol, setAddingSymbol] = useState(false)

    useEffect(() => {
        fetchWatchlist()
    }, [])

    const fetchWatchlist = async () => {
        try {
            setLoading(true)
            const response = await fetch('/api/watchlist')

            if (!response.ok) throw new Error('Failed to fetch watchlist')

            const data = await response.json()
            setWatchlist(data.watchlist || [])
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred')
        } finally {
            setLoading(false)
        }
    }

    const addToWatchlist = async () => {
        if (!searchQuery.trim()) return

        try {
            setAddingSymbol(true)
            const response = await fetch('/api/watchlist', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ symbol: searchQuery.toUpperCase() })
            })

            if (!response.ok) throw new Error('Failed to add symbol')

            await fetchWatchlist()
            setSearchQuery('')
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to add symbol')
        } finally {
            setAddingSymbol(false)
        }
    }

    const removeFromWatchlist = async (id: string) => {
        try {
            const response = await fetch(`/api/watchlist/${id}`, {
                method: 'DELETE'
            })

            if (!response.ok) throw new Error('Failed to remove symbol')

            await fetchWatchlist()
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to remove symbol')
        }
    }

    if (loading) {
        return (
            <div className="container mx-auto p-6 space-y-6">
                <Skeleton className="h-10 w-64" />
                <Skeleton className="h-16" />
                <div className="grid gap-4">
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-24" />
                    ))}
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="container mx-auto p-6">
                <Card className="border-red-200 bg-red-50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-red-600">
                            <AlertCircle className="h-5 w-5" />
                            Error Loading Watchlist
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-red-600">{error}</p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Watchlist</h1>
                    <p className="text-muted-foreground">
                        Track your favorite assets and set price alerts
                    </p>
                </div>
                <Badge variant="outline" className="text-lg px-4 py-2">
                    <Star className="h-4 w-4 mr-2 fill-yellow-400 text-yellow-400" />
                    {watchlist.length} Assets
                </Badge>
            </div>

            {/* Add Symbol */}
            <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
                <CardContent className="pt-6">
                    <div className="flex gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Enter symbol (e.g., BTCUSD, EURUSD, AAPL)"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && addToWatchlist()}
                                className="pl-10"
                            />
                        </div>
                        <Button onClick={addToWatchlist} disabled={addingSymbol || !searchQuery.trim()}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add to Watchlist
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Watchlist Items */}
            {watchlist.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <Star className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Your Watchlist is Empty</h3>
                        <p className="text-muted-foreground text-center max-w-md">
                            Add symbols to your watchlist to track their performance and set price alerts.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {watchlist.map((item) => (
                        <Card key={item.id} className="hover:shadow-lg transition-shadow">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4 flex-1">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="text-2xl font-bold">{item.symbol}</h3>
                                                <Badge variant="outline" className="text-xs">
                                                    {item.name}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                <span>Vol: ${(item.volume / 1000000).toFixed(2)}M</span>
                                                <span>MCap: ${(item.marketCap / 1000000000).toFixed(2)}B</span>
                                            </div>
                                        </div>

                                        <div className="text-right">
                                            <div className="text-3xl font-bold">
                                                ${item.price.toFixed(2)}
                                            </div>
                                            <div className={`flex items-center gap-1 justify-end ${item.change24h >= 0 ? 'text-green-600' : 'text-red-600'
                                                }`}>
                                                {item.change24h >= 0 ? (
                                                    <TrendingUp className="h-4 w-4" />
                                                ) : (
                                                    <TrendingDown className="h-4 w-4" />
                                                )}
                                                <span className="font-semibold">
                                                    {item.change24h > 0 ? '+' : ''}{item.change24h.toFixed(2)}%
                                                </span>
                                            </div>
                                        </div>

                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeFromWatchlist(item.id)}
                                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>

                                {/* Price Alerts */}
                                {(item.alerts.priceAbove || item.alerts.priceBelow) && (
                                    <div className="mt-4 pt-4 border-t flex gap-4">
                                        {item.alerts.priceAbove && (
                                            <Badge variant="outline" className="text-green-600">
                                                Alert Above: ${item.alerts.priceAbove.toFixed(2)}
                                            </Badge>
                                        )}
                                        {item.alerts.priceBelow && (
                                            <Badge variant="outline" className="text-red-600">
                                                Alert Below: ${item.alerts.priceBelow.toFixed(2)}
                                            </Badge>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
