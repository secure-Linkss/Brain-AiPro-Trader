"use client"

import { Play, TrendingUp } from 'lucide-react'
import { useState } from 'react'

export default function AdminBacktestingPage() {
    const [results, setResults] = useState<any>(null)

    const runBacktest = () => {
        setResults({
            totalTrades: 156,
            winRate: 76.8,
            profit: 12847.50,
            sharpeRatio: 2.34
        })
    }

    return (
        <div className="min-h-screen bg-primary-900 p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold text-white mb-8">Backtesting Engine</h1>

                <div className="grid lg:grid-cols-2 gap-8">
                    <div className="bg-primary-800/60 border border-white/10 rounded-xl p-6">
                        <h2 className="text-xl font-semibold text-white mb-6">Configuration</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Strategy</label>
                                <select className="w-full px-4 py-3 bg-primary-900/50 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500">
                                    <option>MACD Divergence</option>
                                    <option>RSI + Bollinger</option>
                                    <option>Harmonic Patterns</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Date Range</label>
                                <input
                                    type="date"
                                    className="w-full px-4 py-3 bg-primary-900/50 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
                                />
                            </div>
                            <button
                                onClick={runBacktest}
                                className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-blue-500/50 transition-all flex items-center justify-center gap-2"
                            >
                                <Play size={20} />
                                Run Backtest
                            </button>
                        </div>
                    </div>

                    {results && (
                        <div className="bg-primary-800/60 border border-white/10 rounded-xl p-6">
                            <h2 className="text-xl font-semibold text-white mb-6">Results</h2>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center p-4 bg-primary-900/50 rounded-lg">
                                    <span className="text-gray-400">Total Trades</span>
                                    <span className="text-white font-bold">{results.totalTrades}</span>
                                </div>
                                <div className="flex justify-between items-center p-4 bg-primary-900/50 rounded-lg">
                                    <span className="text-gray-400">Win Rate</span>
                                    <span className="text-green-400 font-bold">{results.winRate}%</span>
                                </div>
                                <div className="flex justify-between items-center p-4 bg-primary-900/50 rounded-lg">
                                    <span className="text-gray-400">Total Profit</span>
                                    <span className="text-white font-bold">${results.profit.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center p-4 bg-primary-900/50 rounded-lg">
                                    <span className="text-gray-400">Sharpe Ratio</span>
                                    <span className="text-blue-400 font-bold">{results.sharpeRatio}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
