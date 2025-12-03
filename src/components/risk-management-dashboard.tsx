"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
    Calculator,
    TrendingUp,
    AlertTriangle,
    CheckCircle,
    DollarSign,
    Percent,
    Target,
    Shield
} from 'lucide-react'
import { riskCalculator, TradingAccount, TradeSetup } from '@/lib/services/risk-management'

export default function RiskManagementDashboard() {
    // Account state
    const [account, setAccount] = useState<TradingAccount>({
        capital: 1000,
        currency: 'USD',
        leverage: 100,
        riskPercentage: 1,
        maxOpenTrades: 5
    })

    // Trade setup state
    const [tradeSetup, setTradeSetup] = useState<TradeSetup>({
        symbol: 'EURUSD',
        entryPrice: 1.1000,
        stopLoss: 1.0950,
        takeProfit: 1.1100,
        direction: 'BUY',
        confidence: 75
    })

    // Calculation results
    const [riskCalc, setRiskCalc] = useState<any>(null)
    const [strategies, setStrategies] = useState<any[]>([])

    // Calculate on mount and when inputs change
    useEffect(() => {
        calculateRisk()
        loadStrategies()
    }, [account, tradeSetup])

    const calculateRisk = () => {
        const result = riskCalculator.calculateLotSize(account, tradeSetup)
        setRiskCalc(result)
    }

    const loadStrategies = () => {
        const strategyList = riskCalculator.suggestPositionStrategy(account.capital)
        setStrategies(strategyList)
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-white">Risk Management</h2>
                    <p className="text-slate-400 mt-1">
                        Calculate optimal lot sizes and manage your trading risk
                    </p>
                </div>
                <Badge className="bg-blue-500 text-white">
                    <Shield className="w-4 h-4 mr-1" />
                    Protected Trading
                </Badge>
            </div>

            <Tabs defaultValue="calculator" className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-slate-800">
                    <TabsTrigger value="calculator">Risk Calculator</TabsTrigger>
                    <TabsTrigger value="strategies">Position Strategies</TabsTrigger>
                    <TabsTrigger value="portfolio">Portfolio Risk</TabsTrigger>
                </TabsList>

                {/* Risk Calculator Tab */}
                <TabsContent value="calculator" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Account Settings */}
                        <Card className="bg-slate-800 border-slate-700">
                            <CardHeader>
                                <CardTitle className="text-white flex items-center">
                                    <DollarSign className="w-5 h-5 mr-2" />
                                    Account Settings
                                </CardTitle>
                                <CardDescription>Configure your trading account parameters</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="capital" className="text-slate-300">
                                        Account Capital ({account.currency})
                                    </Label>
                                    <Input
                                        id="capital"
                                        type="number"
                                        value={account.capital}
                                        onChange={(e) => setAccount({ ...account, capital: parseFloat(e.target.value) || 0 })}
                                        className="bg-slate-700 border-slate-600 text-white"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="currency" className="text-slate-300">
                                        Currency
                                    </Label>
                                    <Select
                                        value={account.currency}
                                        onValueChange={(value) => setAccount({ ...account, currency: value })}
                                    >
                                        <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-slate-700 border-slate-600">
                                            <SelectItem value="USD">USD</SelectItem>
                                            <SelectItem value="GBP">GBP</SelectItem>
                                            <SelectItem value="EUR">EUR</SelectItem>
                                            <SelectItem value="JPY">JPY</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="leverage" className="text-slate-300">
                                        Leverage: 1:{account.leverage}
                                    </Label>
                                    <Slider
                                        id="leverage"
                                        value={[account.leverage]}
                                        onValueChange={(values) => setAccount({ ...account, leverage: values[0] })}
                                        min={1}
                                        max={500}
                                        step={1}
                                        className="py-4"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="risk" className="text-slate-300">
                                        Risk Per Trade: {account.riskPercentage}%
                                    </Label>
                                    <Slider
                                        id="risk"
                                        value={[account.riskPercentage]}
                                        onValueChange={(values) => setAccount({ ...account, riskPercentage: values[0] })}
                                        min={0.5}
                                        max={5}
                                        step={0.5}
                                        className="py-4"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="maxTrades" className="text-slate-300">
                                        Max Open Trades
                                    </Label>
                                    <Input
                                        id="maxTrades"
                                        type="number"
                                        value={account.maxOpenTrades}
                                        onChange={(e) => setAccount({ ...account, maxOpenTrades: parseInt(e.target.value) || 1 })}
                                        className="bg-slate-700 border-slate-600 text-white"
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Trade Setup */}
                        <Card className="bg-slate-800 border-slate-700">
                            <CardHeader>
                                <CardTitle className="text-white flex items-center">
                                    <Target className="w-5 h-5 mr-2" />
                                    Trade Setup
                                </CardTitle>
                                <CardDescription>Enter your trade parameters</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="symbol" className="text-slate-300">Symbol</Label>
                                    <Input
                                        id="symbol"
                                        value={tradeSetup.symbol}
                                        onChange={(e) => setTradeSetup({ ...tradeSetup, symbol: e.target.value })}
                                        className="bg-slate-700 border-slate-600 text-white"
                                        placeholder="EURUSD"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="direction" className="text-slate-300">Direction</Label>
                                    <Select
                                        value={tradeSetup.direction}
                                        onValueChange={(value: 'BUY' | 'SELL') => setTradeSetup({ ...tradeSetup, direction: value })}
                                    >
                                        <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-slate-700 border-slate-600">
                                            <SelectItem value="BUY">BUY</SelectItem>
                                            <SelectItem value="SELL">SELL</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="entry" className="text-slate-300">Entry Price</Label>
                                    <Input
                                        id="entry"
                                        type="number"
                                        step="0.00001"
                                        value={tradeSetup.entryPrice}
                                        onChange={(e) => setTradeSetup({ ...tradeSetup, entryPrice: parseFloat(e.target.value) || 0 })}
                                        className="bg-slate-700 border-slate-600 text-white"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="sl" className="text-slate-300">Stop Loss</Label>
                                    <Input
                                        id="sl"
                                        type="number"
                                        step="0.00001"
                                        value={tradeSetup.stopLoss}
                                        onChange={(e) => setTradeSetup({ ...tradeSetup, stopLoss: parseFloat(e.target.value) || 0 })}
                                        className="bg-slate-700 border-slate-600 text-white"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="tp" className="text-slate-300">Take Profit</Label>
                                    <Input
                                        id="tp"
                                        type="number"
                                        step="0.00001"
                                        value={tradeSetup.takeProfit}
                                        onChange={(e) => setTradeSetup({ ...tradeSetup, takeProfit: parseFloat(e.target.value) || 0 })}
                                        className="bg-slate-700 border-slate-600 text-white"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="confidence" className="text-slate-300">
                                        Signal Confidence: {tradeSetup.confidence}%
                                    </Label>
                                    <Slider
                                        id="confidence"
                                        value={[tradeSetup.confidence]}
                                        onValueChange={(values) => setTradeSetup({ ...tradeSetup, confidence: values[0] })}
                                        min={0}
                                        max={100}
                                        step={5}
                                        className="py-4"
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Results */}
                    {riskCalc && (
                        <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700">
                            <CardHeader>
                                <CardTitle className="text-white flex items-center">
                                    <Calculator className="w-5 h-5 mr-2" />
                                    Risk Calculation Results
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Main Results */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="bg-blue-500/20 p-4 rounded-lg border border-blue-500/30">
                                        <p className="text-sm text-slate-400">Recommended Lot Size</p>
                                        <p className="text-3xl font-bold text-blue-400">
                                            {riskCalc.recommendedLotSize.toFixed(2)}
                                        </p>
                                    </div>

                                    <div className="bg-green-500/20 p-4 rounded-lg border border-green-500/30">
                                        <p className="text-sm text-slate-400">Potential Profit</p>
                                        <p className="text-3xl font-bold text-green-400">
                                            ${riskCalc.potentialProfit.toFixed(2)}
                                        </p>
                                    </div>

                                    <div className="bg-red-500/20 p-4 rounded-lg border border-red-500/30">
                                        <p className="text-sm text-slate-400">Potential Loss</p>
                                        <p className="text-3xl font-bold text-red-400">
                                            ${riskCalc.potentialLoss.toFixed(2)}
                                        </p>
                                    </div>

                                    <div className="bg-purple-500/20 p-4 rounded-lg border border-purple-500/30">
                                        <p className="text-sm text-slate-400">Risk/Reward</p>
                                        <p className="text-3xl font-bold text-purple-400">
                                            1:{riskCalc.riskRewardRatio.toFixed(2)}
                                        </p>
                                    </div>
                                </div>

                                {/* Detailed Metrics */}
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                                    <div>
                                        <p className="text-slate-400">Position Size</p>
                                        <p className="text-white font-semibold">{riskCalc.positionSize.toLocaleString()} units</p>
                                    </div>
                                    <div>
                                        <p className="text-slate-400">Margin Required</p>
                                        <p className="text-white font-semibold">${riskCalc.marginRequired.toFixed(2)}</p>
                                    </div>
                                    <div>
                                        <p className="text-slate-400">Risk Percentage</p>
                                        <p className="text-white font-semibold">{riskCalc.riskPercentage.toFixed(2)}%</p>
                                    </div>
                                    <div>
                                        <p className="text-slate-400">Stop Loss (Pips)</p>
                                        <p className="text-white font-semibold">{riskCalc.stopLossPips.toFixed(1)}</p>
                                    </div>
                                    <div>
                                        <p className="text-slate-400">Take Profit (Pips)</p>
                                        <p className="text-white font-semibold">{riskCalc.takeProfitPips.toFixed(1)}</p>
                                    </div>
                                    <div>
                                        <p className="text-slate-400">Pip Value</p>
                                        <p className="text-white font-semibold">${riskCalc.pipValue.toFixed(4)}</p>
                                    </div>
                                </div>

                                {/* Suggestions */}
                                {riskCalc.suggestions.length > 0 && (
                                    <div className="space-y-2">
                                        <h4 className="text-sm font-semibold text-green-400 flex items-center">
                                            <CheckCircle className="w-4 h-4 mr-2" />
                                            Suggestions
                                        </h4>
                                        {riskCalc.suggestions.map((suggestion: string, i: number) => (
                                            <Alert key={i} className="bg-green-500/10 border-green-500/30">
                                                <AlertDescription className="text-green-300 text-sm">
                                                    {suggestion}
                                                </AlertDescription>
                                            </Alert>
                                        ))}
                                    </div>
                                )}

                                {/* Warnings */}
                                {riskCalc.warnings.length > 0 && (
                                    <div className="space-y-2">
                                        <h4 className="text-sm font-semibold text-yellow-400 flex items-center">
                                            <AlertTriangle className="w-4 h-4 mr-2" />
                                            Warnings
                                        </h4>
                                        {riskCalc.warnings.map((warning: string, i: number) => (
                                            <Alert key={i} className="bg-yellow-500/10 border-yellow-500/30">
                                                <AlertDescription className="text-yellow-300 text-sm">
                                                    {warning}
                                                </AlertDescription>
                                            </Alert>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                {/* Position Strategies Tab */}
                <TabsContent value="strategies" className="space-y-4">
                    <Card className="bg-slate-800 border-slate-700">
                        <CardHeader>
                            <CardTitle className="text-white">Recommended Position Strategies</CardTitle>
                            <CardDescription>
                                Based on your capital of {account.currency} {account.capital.toLocaleString()}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {strategies.map((strategy, i) => (
                                    <Card key={i} className="bg-slate-700 border-slate-600">
                                        <CardHeader>
                                            <CardTitle className="text-lg text-white">{strategy.strategy}</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            <div className="flex justify-between">
                                                <span className="text-slate-400">Lot Size:</span>
                                                <span className="text-white font-semibold">{strategy.lotSize}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-400">Number of Trades:</span>
                                                <span className="text-white font-semibold">{strategy.numberOfTrades}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-400">Risk Per Trade:</span>
                                                <span className="text-white font-semibold">{strategy.riskPerTrade}%</span>
                                            </div>
                                            <p className="text-sm text-slate-300 mt-3 pt-3 border-t border-slate-600">
                                                {strategy.description}
                                            </p>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Portfolio Risk Tab */}
                <TabsContent value="portfolio">
                    <Card className="bg-slate-800 border-slate-700">
                        <CardHeader>
                            <CardTitle className="text-white">Portfolio Risk Overview</CardTitle>
                            <CardDescription>Monitor your overall portfolio risk and exposure</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-slate-400">
                                Portfolio risk monitoring will be displayed here once you have open trades.
                            </p>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
