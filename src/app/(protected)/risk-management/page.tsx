"use client"

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calculator, TrendingUp, Shield, DollarSign, Percent, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function RiskManagementPage() {
    // Position Sizer State
    const [accountBalance, setAccountBalance] = useState('10000');
    const [riskPercentage, setRiskPercentage] = useState('1');
    const [stopLossPips, setStopLossPips] = useState('50');
    const [assetClass, setAssetClass] = useState('forex');
    const [pair, setPair] = useState('EURUSD');
    const [price, setPrice] = useState('1.0850');
    const [positionResult, setPositionResult] = useState<any>(null);
    const [calculating, setCalculating] = useState(false);

    // Portfolio Analytics State
    const [trades, setTrades] = useState<any[]>([]);
    const [portfolioMetrics, setPortfolioMetrics] = useState<any>(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [loadingTrades, setLoadingTrades] = useState(false);

    // Fetch trades on component mount
    useEffect(() => {
        fetchTrades();
    }, []);

    const fetchTrades = async () => {
        setLoadingTrades(true);
        try {
            const response = await fetch('/api/trades/history');
            if (response.ok) {
                const data = await response.json();
                setTrades(data);
            }
        } catch (error) {
            console.error('Error fetching trades:', error);
            setTrades([]);
        } finally {
            setLoadingTrades(false);
        }
    };

    const calculatePosition = async () => {
        setCalculating(true);
        try {
            const response = await fetch('http://localhost:8003/risk/position-size', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    account_balance: parseFloat(accountBalance),
                    risk_percentage: parseFloat(riskPercentage),
                    stop_loss_pips: parseFloat(stopLossPips),
                    asset_class: assetClass,
                    pair: pair,
                    price: parseFloat(price),
                    contract_size: 100000
                })
            });
            const data = await response.json();
            setPositionResult(data);
        } catch (error) {
            console.error('Position calculation failed:', error);
            alert('Failed to calculate position size. Please ensure the backend is running.');
        } finally {
            setCalculating(false);
        }
    };

    const analyzePortfolio = async () => {
        setAnalyzing(true);
        try {
            const response = await fetch('http://localhost:8003/risk/portfolio-analytics', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ trades: trades })
            });
            const data = await response.json();
            setPortfolioMetrics(data);
        } catch (error) {
            console.error('Portfolio analysis failed:', error);
            alert('Failed to analyze portfolio. Please ensure you have trade history and the backend is running.');
        } finally {
            setAnalyzing(false);
        }
    };

    return (
        <div className="space-y-6 p-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                    <Shield className="h-8 w-8 text-green-500" />
                    Risk Management Center
                </h1>
                <p className="text-muted-foreground">
                    Professional position sizing and portfolio analytics for institutional trading.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Position Sizer */}
                <Card className="border-green-500/20 shadow-lg shadow-green-500/5">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calculator className="h-5 w-5 text-green-500" />
                            Position Size Calculator
                        </CardTitle>
                        <CardDescription>
                            Calculate optimal position size based on your risk parameters
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="balance">Account Balance ($)</Label>
                                <Input
                                    id="balance"
                                    type="number"
                                    value={accountBalance}
                                    onChange={(e) => setAccountBalance(e.target.value)}
                                    placeholder="10000"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="risk">Risk Per Trade (%)</Label>
                                <Input
                                    id="risk"
                                    type="number"
                                    step="0.1"
                                    value={riskPercentage}
                                    onChange={(e) => setRiskPercentage(e.target.value)}
                                    placeholder="1"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="sl">Stop Loss (Pips/Points)</Label>
                                <Input
                                    id="sl"
                                    type="number"
                                    value={stopLossPips}
                                    onChange={(e) => setStopLossPips(e.target.value)}
                                    placeholder="50"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="asset">Asset Class</Label>
                                <Select value={assetClass} onValueChange={setAssetClass}>
                                    <SelectTrigger id="asset">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="forex">Forex</SelectItem>
                                        <SelectItem value="crypto">Crypto</SelectItem>
                                        <SelectItem value="stock">Stocks</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="pair">Symbol/Pair</Label>
                                <Input
                                    id="pair"
                                    value={pair}
                                    onChange={(e) => setPair(e.target.value)}
                                    placeholder="EURUSD"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="price">Current Price</Label>
                                <Input
                                    id="price"
                                    type="number"
                                    step="0.0001"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    placeholder="1.0850"
                                />
                            </div>
                        </div>

                        <Button
                            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                            onClick={calculatePosition}
                            disabled={calculating}
                        >
                            {calculating ? 'Calculating...' : 'Calculate Position Size'}
                        </Button>

                        {positionResult && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="rounded-lg border bg-slate-950/80 p-4 space-y-3"
                            >
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <div className="text-xs text-slate-400">Risk Amount</div>
                                        <div className="text-lg font-bold text-green-400">
                                            ${positionResult.risk_amount}
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-xs text-slate-400">Position Size</div>
                                        <div className="text-lg font-bold text-slate-200">
                                            {positionResult.position_size_units} units
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-xs text-slate-400">Lot Size</div>
                                        <div className="text-lg font-bold text-blue-400">
                                            {positionResult.lot_size}
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-xs text-slate-400">Leverage Required</div>
                                        <div className="text-lg font-bold text-yellow-400">
                                            {positionResult.leverage_required}x
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </CardContent>
                </Card>

                {/* Portfolio Analytics */}
                <Card className="border-blue-500/20 shadow-lg shadow-blue-500/5">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-blue-500" />
                            Portfolio Analytics
                        </CardTitle>
                        <CardDescription>
                            Comprehensive performance metrics for your trading portfolio
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="rounded-lg border bg-slate-950/30 p-4">
                            <div className="text-sm text-slate-400 mb-2">
                                {loadingTrades ? 'Loading trades...' : `Your Trade History (${trades.length} trades)`}
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {trades.map((trade, i) => (
                                    <Badge
                                        key={i}
                                        variant={trade.return_pct > 0 ? 'default' : 'destructive'}
                                        className="text-xs"
                                    >
                                        {trade.return_pct > 0 ? '+' : ''}{trade.return_pct}%
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        <Button
                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                            onClick={analyzePortfolio}
                            disabled={analyzing}
                        >
                            {analyzing ? 'Analyzing...' : 'Analyze Portfolio'}
                        </Button>

                        {portfolioMetrics && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-3"
                            >
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="rounded-lg border bg-slate-950/80 p-3">
                                        <div className="text-xs text-slate-400 mb-1">Win Rate</div>
                                        <div className="text-2xl font-bold text-green-400">
                                            {portfolioMetrics.win_rate}%
                                        </div>
                                    </div>
                                    <div className="rounded-lg border bg-slate-950/80 p-3">
                                        <div className="text-xs text-slate-400 mb-1">Profit Factor</div>
                                        <div className="text-2xl font-bold text-blue-400">
                                            {portfolioMetrics.profit_factor}
                                        </div>
                                    </div>
                                    <div className="rounded-lg border bg-slate-950/80 p-3">
                                        <div className="text-xs text-slate-400 mb-1">Sharpe Ratio</div>
                                        <div className="text-2xl font-bold text-purple-400">
                                            {portfolioMetrics.sharpe_ratio}
                                        </div>
                                    </div>
                                    <div className="rounded-lg border bg-slate-950/80 p-3">
                                        <div className="text-xs text-slate-400 mb-1">Sortino Ratio</div>
                                        <div className="text-2xl font-bold text-indigo-400">
                                            {portfolioMetrics.sortino_ratio}
                                        </div>
                                    </div>
                                    <div className="rounded-lg border bg-slate-950/80 p-3">
                                        <div className="text-xs text-slate-400 mb-1">Max Drawdown</div>
                                        <div className="text-2xl font-bold text-red-400">
                                            {portfolioMetrics.max_drawdown}%
                                        </div>
                                    </div>
                                    <div className="rounded-lg border bg-slate-950/80 p-3">
                                        <div className="text-xs text-slate-400 mb-1">Expectancy</div>
                                        <div className="text-2xl font-bold text-yellow-400">
                                            {portfolioMetrics.expectancy}%
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-lg border border-green-500/20 bg-green-500/5 p-3">
                                    <div className="flex items-start gap-2">
                                        <AlertCircle className="h-4 w-4 text-green-500 mt-0.5" />
                                        <div className="text-xs text-green-400">
                                            <strong>Performance Summary:</strong> Based on {portfolioMetrics.total_trades} trades,
                                            your strategy shows strong risk-adjusted returns with a Sharpe ratio of {portfolioMetrics.sharpe_ratio}.
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </CardContent>
                </Card>

            </div>
        </div>
    );
}
