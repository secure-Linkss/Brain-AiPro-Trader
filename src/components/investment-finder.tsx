"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { TrendingUp, DollarSign, Clock, Shield, Target } from "lucide-react"
import { LoadingAnimation } from "./loading-animation"
import { Badge } from "@/components/ui/badge"

export function InvestmentFinder() {
    const [loading, setLoading] = useState(false)
    const [opportunities, setOpportunities] = useState<any[]>([])

    const [formData, setFormData] = useState({
        capital: '',
        timeHorizon: 'medium',
        riskTolerance: 'medium',
        preferredMarkets: ['crypto', 'forex'],
        goals: ''
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const res = await fetch('/api/investment-finder', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            const data = await res.json()
            setOpportunities(data.opportunities || [])
        } catch (error) {
            console.error('Failed to find opportunities', error)
        } finally {
            setLoading(false)
        }
    }

    const toggleMarket = (market: string) => {
        setFormData(prev => ({
            ...prev,
            preferredMarkets: prev.preferredMarkets.includes(market)
                ? prev.preferredMarkets.filter(m => m !== market)
                : [...prev.preferredMarkets, market]
        }))
    }

    return (
        <div className="space-y-6">
            <Card className="bg-slate-900 border-slate-800">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5 text-blue-500" />
                        AI Investment Opportunity Finder
                    </CardTitle>
                    <CardDescription>
                        Let our AI find the best investment opportunities based on your profile
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="capital">Investment Capital ($)</Label>
                                <Input
                                    id="capital"
                                    type="number"
                                    placeholder="10000"
                                    value={formData.capital}
                                    onChange={(e) => setFormData({ ...formData, capital: e.target.value })}
                                    className="bg-slate-800 border-slate-700"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="timeHorizon">Time Horizon</Label>
                                <Select
                                    value={formData.timeHorizon}
                                    onValueChange={(value) => setFormData({ ...formData, timeHorizon: value })}
                                >
                                    <SelectTrigger className="bg-slate-800 border-slate-700">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-slate-900 border-slate-800">
                                        <SelectItem value="short">Short Term (Days)</SelectItem>
                                        <SelectItem value="medium">Medium Term (Weeks)</SelectItem>
                                        <SelectItem value="long">Long Term (Months)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="riskTolerance">Risk Tolerance</Label>
                                <Select
                                    value={formData.riskTolerance}
                                    onValueChange={(value) => setFormData({ ...formData, riskTolerance: value })}
                                >
                                    <SelectTrigger className="bg-slate-800 border-slate-700">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-slate-900 border-slate-800">
                                        <SelectItem value="low">Low (Conservative)</SelectItem>
                                        <SelectItem value="medium">Medium (Balanced)</SelectItem>
                                        <SelectItem value="high">High (Aggressive)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Preferred Markets</Label>
                                <div className="grid grid-cols-2 gap-2">
                                    {['crypto', 'forex', 'stocks', 'commodities'].map(market => (
                                        <div key={market} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={market}
                                                checked={formData.preferredMarkets.includes(market)}
                                                onCheckedChange={() => toggleMarket(market)}
                                            />
                                            <label htmlFor={market} className="text-sm capitalize cursor-pointer">
                                                {market}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="goals">Investment Goals (Optional)</Label>
                            <Textarea
                                id="goals"
                                placeholder="E.g., Steady income, capital appreciation, portfolio diversification..."
                                value={formData.goals}
                                onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
                                className="bg-slate-800 border-slate-700"
                            />
                        </div>

                        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
                            {loading ? <LoadingAnimation /> : 'Find Opportunities'}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {opportunities.length > 0 && (
                <div className="space-y-4">
                    <h3 className="text-xl font-bold">Recommended Opportunities</h3>
                    <div className="grid gap-4 md:grid-cols-2">
                        {opportunities.map((opp, i) => (
                            <Card key={i} className="bg-slate-900 border-slate-800 hover:border-blue-500/50 transition-all">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-lg">{opp.symbol}</CardTitle>
                                        <Badge variant={opp.riskLevel === 'low' ? 'default' : opp.riskLevel === 'high' ? 'destructive' : 'secondary'}>
                                            {opp.riskLevel} risk
                                        </Badge>
                                    </div>
                                    <CardDescription className="capitalize">{opp.market} • {opp.strategy}</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div className="flex items-center gap-2">
                                            <DollarSign className="h-4 w-4 text-green-500" />
                                            <div>
                                                <p className="text-slate-400">Allocation</p>
                                                <p className="font-bold">{opp.recommendedAllocation.toFixed(1)}%</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <TrendingUp className="h-4 w-4 text-blue-500" />
                                            <div>
                                                <p className="text-slate-400">Expected Return</p>
                                                <p className="font-bold text-green-500">+{opp.expectedReturn.toFixed(1)}%</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Target className="h-4 w-4 text-purple-500" />
                                            <div>
                                                <p className="text-slate-400">Entry</p>
                                                <p className="font-bold">${opp.entryPrice.toFixed(2)}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Shield className="h-4 w-4 text-yellow-500" />
                                            <div>
                                                <p className="text-slate-400">Confidence</p>
                                                <p className="font-bold">{opp.confidence}%</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="pt-2 border-t border-slate-800">
                                        <p className="text-xs text-slate-400 mb-1">AI Analysis:</p>
                                        <p className="text-sm text-slate-300">{opp.reasoning}</p>
                                    </div>
                                    <Button className="w-full bg-blue-600 hover:bg-blue-700 h-9">
                                        View Details
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
