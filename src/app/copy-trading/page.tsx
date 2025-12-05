"use client"

import { useState } from 'react'
import Link from 'next/link'
import { Users, TrendingUp, Star, Settings } from 'lucide-react'

export default function CopyTradingPage() {
    const traders = [
        {
            id: 1,
            name: 'Alex Chen',
            avatar: '👨‍💼',
            winRate: 78.5,
            totalProfit: 45230,
            followers: 1250,
            trades: 342,
            riskLevel: 'Moderate',
            verified: true,
            monthlyReturn: 12.5
        },
        {
            id: 2,
            name: 'Sarah Johnson',
            avatar: '👩‍💼',
            winRate: 82.3,
            totalProfit: 67890,
            followers: 2100,
            trades: 456,
            riskLevel: 'Conservative',
            verified: true,
            monthlyReturn: 9.8
        },
        {
            id: 3,
            name: 'Mike Rodriguez',
            avatar: '👨',
            winRate: 75.2,
            totalProfit: 38450,
            followers: 890,
            trades: 289,
            riskLevel: 'Aggressive',
            verified: true,
            monthlyReturn: 15.3
        }
    ]

    return (
        <div className="min-h-screen bg-primary-900 p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Copy Trading</h1>
                        <p className="text-gray-400">Follow and copy successful traders automatically</p>
                    </div>
                    <Link
                        href="/copy-trading/setup"
                        className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-blue-500/50 transition-all flex items-center gap-2"
                    >
                        <Settings size={20} />
                        Setup Copy Trading
                    </Link>
                </div>

                {/* Top Traders */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {traders.map((trader) => (
                        <div key={trader.id} className="bg-primary-800/60 border border-white/10 rounded-xl p-6 hover:border-blue-500/50 transition-all">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-2xl">
                                        {trader.avatar}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-semibold text-white">{trader.name}</h3>
                                            {trader.verified && (
                                                <Star className="text-yellow-500 fill-yellow-500" size={16} />
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-400">{trader.followers} followers</p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div className="p-3 bg-primary-900/50 rounded-lg">
                                    <p className="text-xs text-gray-400 mb-1">Win Rate</p>
                                    <p className="text-lg font-bold text-green-400">{trader.winRate}%</p>
                                </div>
                                <div className="p-3 bg-primary-900/50 rounded-lg">
                                    <p className="text-xs text-gray-400 mb-1">Total Profit</p>
                                    <p className="text-lg font-bold text-white">${trader.totalProfit.toLocaleString()}</p>
                                </div>
                                <div className="p-3 bg-primary-900/50 rounded-lg">
                                    <p className="text-xs text-gray-400 mb-1">Monthly Return</p>
                                    <p className="text-lg font-bold text-blue-400">{trader.monthlyReturn}%</p>
                                </div>
                                <div className="p-3 bg-primary-900/50 rounded-lg">
                                    <p className="text-xs text-gray-400 mb-1">Total Trades</p>
                                    <p className="text-lg font-bold text-white">{trader.trades}</p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between mb-4">
                                <span className="text-sm text-gray-400">Risk Level:</span>
                                <span className={`px-3 py-1 rounded-lg text-sm font-semibold ${trader.riskLevel === 'Conservative' ? 'bg-green-500/20 text-green-400' :
                                        trader.riskLevel === 'Moderate' ? 'bg-blue-500/20 text-blue-400' :
                                            'bg-yellow-500/20 text-yellow-400'
                                    }`}>
                                    {trader.riskLevel}
                                </span>
                            </div>

                            <button className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-blue-500/50 transition-all">
                                Start Copying
                            </button>
                        </div>
                    ))}
                </div>

                {/* How It Works */}
                <div className="mt-12 bg-primary-800/60 border border-white/10 rounded-xl p-8">
                    <h2 className="text-2xl font-bold text-white mb-6">How Copy Trading Works</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Users className="text-blue-500" size={32} />
                            </div>
                            <h3 className="text-lg font-semibold text-white mb-2">1. Choose a Trader</h3>
                            <p className="text-gray-400 text-sm">Select from our verified top performers based on their track record</p>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Settings className="text-purple-500" size={32} />
                            </div>
                            <h3 className="text-lg font-semibold text-white mb-2">2. Set Your Parameters</h3>
                            <p className="text-gray-400 text-sm">Configure risk limits, position sizes, and trading preferences</p>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <TrendingUp className="text-green-500" size={32} />
                            </div>
                            <h3 className="text-lg font-semibold text-white mb-2">3. Auto-Copy Trades</h3>
                            <p className="text-gray-400 text-sm">Trades are automatically copied to your account in real-time</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
