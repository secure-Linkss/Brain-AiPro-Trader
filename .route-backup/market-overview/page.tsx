"use client"

import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, Activity, Search } from 'lucide-react'

export default function MarketOverviewPage() {
    const [selectedMarket, setSelectedMarket] = useState('all')
    const [searchQuery, setSearchQuery] = useState('')

    const markets = [
        { id: 'all', name: 'All Markets', count: 156 },
        { id: 'forex', name: 'Forex', count: 45 },
        { id: 'crypto', name: 'Crypto', count: 38 },
        { id: 'stocks', name: 'Stocks', count: 52 },
        { id: 'commodities', name: 'Commodities', count: 21 }
    ]

    const assets = [
        { symbol: 'EUR/USD', price: 1.0875, change: 0.45, volume: '2.5B', signal: 'BUY', confidence: 85, type: 'forex' },
        { symbol: 'GBP/USD', price: 1.2650, change: -0.23, volume: '1.8B', signal: 'SELL', confidence: 72, type: 'forex' },
        { symbol: 'USD/JPY', price: 149.85, change: 0.67, volume: '2.1B', signal: 'BUY', confidence: 78, type: 'forex' },
        { symbol: 'BTC/USD', price: 42150, change: 2.34, volume: '850M', signal: 'BUY', confidence: 88, type: 'crypto' },
        { symbol: 'ETH/USD', price: 2245, change: 1.89, volume: '420M', signal: 'BUY', confidence: 81, type: 'crypto' },
        { symbol: 'XRP/USD', price: 0.6234, change: -1.45, volume: '180M', signal: 'NEUTRAL', confidence: 55, type: 'crypto' },
        { symbol: 'AAPL', price: 195.45, change: 1.23, volume: '65M', signal: 'BUY', confidence: 76, type: 'stocks' },
        { symbol: 'TSLA', price: 238.72, change: -0.89, volume: '120M', signal: 'SELL', confidence: 69, type: 'stocks' },
        { symbol: 'NVDA', price: 495.20, change: 3.45, volume: '85M', signal: 'BUY', confidence: 92, type: 'stocks' },
        { symbol: 'GOLD', price: 2045.50, change: 0.78, volume: '45M', signal: 'BUY', confidence: 83, type: 'commodities' },
        { symbol: 'SILVER', price: 24.35, change: -0.34, volume: '28M', signal: 'NEUTRAL', confidence: 58, type: 'commodities' },
        { symbol: 'OIL', price: 78.90, change: 1.56, volume: '95M', signal: 'BUY', confidence: 74, type: 'commodities' }
    ]

    const filteredAssets = assets.filter(asset => {
        const matchesMarket = selectedMarket === 'all' || asset.type === selectedMarket
        const matchesSearch = asset.symbol.toLowerCase().includes(searchQuery.toLowerCase())
        return matchesMarket && matchesSearch
    })

    return (
        <div className="min-h-screen bg-primary-900 p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Market Overview</h1>
                    <p className="text-gray-400">Real-time analysis across all markets</p>
                </div>

                {/* Market Tabs */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                    {markets.map((market) => (
                        <button
                            key={market.id}
                            onClick={() => setSelectedMarket(market.id)}
                            className={`px-6 py-3 rounded-lg font-medium whitespace-nowrap transition-all ${selectedMarket === market.id
                                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                                    : 'bg-primary-800/60 text-gray-400 hover:text-white border border-white/10'
                                }`}
                        >
                            {market.name}
                            <span className="ml-2 text-xs opacity-75">({market.count})</span>
                        </button>
                    ))}
                </div>

                {/* Search */}
                <div className="mb-6">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search symbols..."
                            className="w-full pl-12 pr-4 py-3 bg-primary-800/60 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                        />
                    </div>
                </div>

                {/* Assets Table */}
                <div className="bg-primary-800/60 border border-white/10 rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-primary-900/50 border-b border-white/10">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Symbol</th>
                                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-300">Price</th>
                                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-300">Change</th>
                                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-300">Volume</th>
                                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-300">Signal</th>
                                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-300">Confidence</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/10">
                                {filteredAssets.map((asset, index) => (
                                    <tr key={index} className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-semibold text-white">{asset.symbol}</p>
                                                <p className="text-xs text-gray-500 capitalize">{asset.type}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right text-white font-medium">
                                            ${asset.price.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className={`inline-flex items-center gap-1 ${asset.change > 0 ? 'text-green-400' : 'text-red-400'
                                                }`}>
                                                {asset.change > 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                                                {asset.change > 0 ? '+' : ''}{asset.change}%
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right text-gray-400">{asset.volume}</td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-block px-3 py-1 rounded-lg text-sm font-semibold ${asset.signal === 'BUY' ? 'bg-green-500/20 text-green-400' :
                                                    asset.signal === 'SELL' ? 'bg-red-500/20 text-red-400' :
                                                        'bg-gray-500/20 text-gray-400'
                                                }`}>
                                                {asset.signal}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <div className="w-20 h-2 bg-white/10 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-gradient-to-r from-blue-500 to-purple-600"
                                                        style={{ width: `${asset.confidence}%` }}
                                                    />
                                                </div>
                                                <span className="text-white text-sm font-medium w-10 text-right">{asset.confidence}%</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}
