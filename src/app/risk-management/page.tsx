"use client"

import { useState } from 'react'
import { Calculator, Shield, AlertTriangle, DollarSign } from 'lucide-react'

export default function RiskManagementPage() {
    const [calculator, setCalculator] = useState({
        accountBalance: 10000,
        riskPercentage: 2,
        entryPrice: 1.0875,
        stopLoss: 1.0825,
        lotSize: 0
    })

    const [results, setResults] = useState({
        riskAmount: 0,
        positionSize: 0,
        potentialLoss: 0,
        lotsToTrade: 0
    })

    const calculateRisk = () => {
        const riskAmount = (calculator.accountBalance * calculator.riskPercentage) / 100
        const pipValue = 10 // Standard for forex
        const pips = Math.abs(calculator.entryPrice - calculator.stopLoss) * 10000
        const positionSize = riskAmount / (pips * pipValue)

        setResults({
            riskAmount,
            positionSize,
            potentialLoss: riskAmount,
            lotsToTrade: positionSize
        })
    }

    const riskLevels = [
        { level: 'Conservative', percentage: 1, description: 'Low risk, steady growth', color: 'green' },
        { level: 'Moderate', percentage: 2, description: 'Balanced risk/reward', color: 'blue' },
        { level: 'Aggressive', percentage: 3, description: 'Higher risk, higher reward', color: 'yellow' },
        { level: 'Very Aggressive', percentage: 5, description: 'Maximum risk', color: 'red' }
    ]

    return (
        <div className="min-h-screen bg-primary-900 p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Risk Management</h1>
                    <p className="text-gray-400">Calculate position sizes and manage your trading risk</p>
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Position Size Calculator */}
                    <div className="bg-primary-800/60 border border-white/10 rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <Calculator className="text-blue-500" size={24} />
                            <h2 className="text-xl font-semibold text-white">Position Size Calculator</h2>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Account Balance ($)</label>
                                <input
                                    type="number"
                                    value={calculator.accountBalance}
                                    onChange={(e) => setCalculator({ ...calculator, accountBalance: Number(e.target.value) })}
                                    className="w-full px-4 py-3 bg-primary-900/50 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Risk Per Trade (%)</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={calculator.riskPercentage}
                                    onChange={(e) => setCalculator({ ...calculator, riskPercentage: Number(e.target.value) })}
                                    className="w-full px-4 py-3 bg-primary-900/50 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Entry Price</label>
                                <input
                                    type="number"
                                    step="0.0001"
                                    value={calculator.entryPrice}
                                    onChange={(e) => setCalculator({ ...calculator, entryPrice: Number(e.target.value) })}
                                    className="w-full px-4 py-3 bg-primary-900/50 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Stop Loss</label>
                                <input
                                    type="number"
                                    step="0.0001"
                                    value={calculator.stopLoss}
                                    onChange={(e) => setCalculator({ ...calculator, stopLoss: Number(e.target.value) })}
                                    className="w-full px-4 py-3 bg-primary-900/50 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
                                />
                            </div>

                            <button
                                onClick={calculateRisk}
                                className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-blue-500/50 transition-all"
                            >
                                Calculate Position Size
                            </button>
                        </div>

                        {/* Results */}
                        {results.riskAmount > 0 && (
                            <div className="mt-6 p-4 bg-primary-900/50 rounded-lg space-y-3">
                                <h3 className="text-sm font-semibold text-white mb-3">Results</h3>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400">Risk Amount:</span>
                                    <span className="text-white font-semibold">${results.riskAmount.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400">Position Size:</span>
                                    <span className="text-white font-semibold">{results.lotsToTrade.toFixed(2)} lots</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400">Potential Loss:</span>
                                    <span className="text-red-400 font-semibold">${results.potentialLoss.toFixed(2)}</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Risk Levels Guide */}
                    <div className="space-y-6">
                        <div className="bg-primary-800/60 border border-white/10 rounded-xl p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <Shield className="text-blue-500" size={24} />
                                <h2 className="text-xl font-semibold text-white">Risk Levels</h2>
                            </div>

                            <div className="space-y-4">
                                {riskLevels.map((level, index) => (
                                    <div key={index} className="p-4 bg-primary-900/50 rounded-lg">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="font-semibold text-white">{level.level}</span>
                                            <span className={`text-${level.color}-400 font-bold`}>{level.percentage}%</span>
                                        </div>
                                        <p className="text-sm text-gray-400">{level.description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Risk Warning */}
                        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6">
                            <div className="flex items-start gap-3">
                                <AlertTriangle className="text-yellow-500 flex-shrink-0 mt-1" size={24} />
                                <div>
                                    <h3 className="text-lg font-semibold text-yellow-400 mb-2">Risk Warning</h3>
                                    <p className="text-yellow-200/80 text-sm">
                                        Never risk more than you can afford to lose. Proper risk management is essential for long-term trading success.
                                        Always use stop losses and never risk more than 2-3% of your account on a single trade.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="bg-primary-800/60 border border-white/10 rounded-xl p-6">
                            <h3 className="text-lg font-semibold text-white mb-4">Risk Statistics</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400">Recommended Risk:</span>
                                    <span className="text-green-400 font-semibold">1-2%</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400">Max Risk:</span>
                                    <span className="text-red-400 font-semibold">5%</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400">Optimal Win Rate:</span>
                                    <span className="text-blue-400 font-semibold">60%+</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
