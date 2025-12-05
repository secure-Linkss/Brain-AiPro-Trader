"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { DollarSign, Percent, Shield, Save } from 'lucide-react'

export default function CopyTradingSetupPage() {
    const router = useRouter()
    const [settings, setSettings] = useState({
        maxInvestment: 1000,
        riskPerTrade: 2,
        maxOpenTrades: 5,
        stopCopyingOnLoss: 10,
        autoReinvest: true
    })

    const handleSave = () => {
        // Save settings via API
        router.push('/copy-trading')
    }

    return (
        <div className="min-h-screen bg-primary-900 p-4 md:p-8">
            <div className="max-w-3xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Copy Trading Setup</h1>
                    <p className="text-gray-400">Configure your copy trading parameters</p>
                </div>

                <div className="bg-primary-800/60 border border-white/10 rounded-xl p-8">
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                <div className="flex items-center gap-2 mb-2">
                                    <DollarSign size={18} />
                                    Maximum Investment per Trader ($)
                                </div>
                            </label>
                            <input
                                type="number"
                                value={settings.maxInvestment}
                                onChange={(e) => setSettings({ ...settings, maxInvestment: Number(e.target.value) })}
                                className="w-full px-4 py-3 bg-primary-900/50 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
                            />
                            <p className="text-xs text-gray-500 mt-2">Maximum amount to allocate per trader</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                <div className="flex items-center gap-2 mb-2">
                                    <Percent size={18} />
                                    Risk per Trade (%)
                                </div>
                            </label>
                            <input
                                type="number"
                                step="0.1"
                                value={settings.riskPerTrade}
                                onChange={(e) => setSettings({ ...settings, riskPerTrade: Number(e.target.value) })}
                                className="w-full px-4 py-3 bg-primary-900/50 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
                            />
                            <p className="text-xs text-gray-500 mt-2">Percentage of investment to risk per trade</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Maximum Concurrent Trades
                            </label>
                            <input
                                type="number"
                                value={settings.maxOpenTrades}
                                onChange={(e) => setSettings({ ...settings, maxOpenTrades: Number(e.target.value) })}
                                className="w-full px-4 py-3 bg-primary-900/50 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
                            />
                            <p className="text-xs text-gray-500 mt-2">Maximum number of trades to copy simultaneously</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                <div className="flex items-center gap-2 mb-2">
                                    <Shield size={18} />
                                    Stop Copying on Loss (%)
                                </div>
                            </label>
                            <input
                                type="number"
                                value={settings.stopCopyingOnLoss}
                                onChange={(e) => setSettings({ ...settings, stopCopyingOnLoss: Number(e.target.value) })}
                                className="w-full px-4 py-3 bg-primary-900/50 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
                            />
                            <p className="text-xs text-gray-500 mt-2">Automatically stop copying if loss exceeds this percentage</p>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-primary-900/50 rounded-lg">
                            <div>
                                <p className="text-white font-medium">Auto-Reinvest Profits</p>
                                <p className="text-xs text-gray-500 mt-1">Automatically reinvest profits to compound returns</p>
                            </div>
                            <input
                                type="checkbox"
                                checked={settings.autoReinvest}
                                onChange={(e) => setSettings({ ...settings, autoReinvest: e.target.checked })}
                                className="w-5 h-5 rounded border-white/20 bg-primary-900/50 text-blue-500"
                            />
                        </div>

                        <button
                            onClick={handleSave}
                            className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-blue-500/50 transition-all flex items-center justify-center gap-2"
                        >
                            <Save size={20} />
                            Save Settings
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
