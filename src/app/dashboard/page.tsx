"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import TradingChart from "@/components/trading-chart"
import AdvancedScanner from "@/components/advanced-scanner"
import SuccessRateCalculator from "@/components/success-rate-calculator"
import TradingStrategies from "@/components/trading-strategies"
import {
  TrendingUp,
  TrendingDown,
  Search,
  Bell,
  Settings,
  LogOut,
  Brain,
  Activity,
  Target,
  BarChart3,
  Shield,
  Star
} from "lucide-react"
import { signOut } from "next-auth/react"

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSymbol, setSelectedSymbol] = useState("BTCUSD")
  const [signals, setSignals] = useState<any[]>([])
  const [watchlist, setWatchlist] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  // Fetch signals and watchlist
  useEffect(() => {
    if (status === "authenticated") {
      fetchSignals()
      fetchWatchlist()
    }
  }, [status])

  const fetchSignals = async () => {
    try {
      const response = await fetch('/api/signals/active')
      if (response.ok) {
        const data = await response.json()
        setSignals(data)
      }
    } catch (error) {
      console.error('Error fetching signals:', error)
      setSignals([])
    } finally {
      setLoading(false)
    }
  }

  const fetchWatchlist = async () => {
    try {
      const response = await fetch('/api/watchlist')
      if (response.ok) {
        const data = await response.json()
        setWatchlist(data)
      }
    } catch (error) {
      console.error('Error fetching watchlist:', error)
      setWatchlist([])
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-800/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg"></div>
                <span className="text-xl font-bold">TradeAI Pro</span>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search symbols..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-slate-700 border-slate-600 text-white placeholder-slate-400 w-64"
                />
              </div>
              <Select value={selectedSymbol} onValueChange={setSelectedSymbol}>
                <SelectTrigger className="w-32 bg-slate-700 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  <SelectItem value="BTCUSD">BTC/USD</SelectItem>
                  <SelectItem value="ETHUSD">ETH/USD</SelectItem>
                  <SelectItem value="EURUSD">EUR/USD</SelectItem>
                  <SelectItem value="GBPUSD">GBP/USD</SelectItem>
                  <SelectItem value="AAPL">AAPL</SelectItem>
                  <SelectItem value="GOOGL">GOOGL</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                className="text-slate-300 hover:text-white"
                onClick={() => router.push("/settings")}
              >
                <Settings className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-slate-300 hover:text-white"
                onClick={() => router.push("/about")}
              >
                <Shield className="w-4 h-4" />
              </Button>
              {session?.user?.role === "admin" && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-slate-300 hover:text-white"
                  onClick={() => router.push("/admin")}
                >
                  <BarChart3 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 border-r border-slate-700 bg-slate-800/30 min-h-screen">
          <nav className="p-4 space-y-2">
            <Button
              variant="ghost"
              className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-700"
              onClick={() => setSelectedSymbol("BTCUSD")}
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Charts
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-700"
            >
              <Activity className="w-4 h-4 mr-2" />
              Signals
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-700"
            >
              <Star className="w-4 h-4 mr-2" />
              Watchlist
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-700"
            >
              <Brain className="w-4 h-4 mr-2" />
              AI Analysis
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-700"
            >
              <Target className="w-4 h-4 mr-2" />
              Strategies
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-700"
            >
              <Shield className="w-4 h-4 mr-2" />
              Portfolio
            </Button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">Trading Dashboard</h1>
            <p className="text-slate-400">AI-powered trading signals and analysis</p>
          </div>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="bg-slate-800 border-slate-700">
              <TabsTrigger value="overview" className="text-slate-300">Overview</TabsTrigger>
              <TabsTrigger value="scanner" className="text-slate-300">Scanner</TabsTrigger>
              <TabsTrigger value="strategies" className="text-slate-300">Strategies</TabsTrigger>
              <TabsTrigger value="signals" className="text-slate-300">Active Signals</TabsTrigger>
              <TabsTrigger value="watchlist" className="text-slate-300">Watchlist</TabsTrigger>
              <TabsTrigger value="performance" className="text-slate-300">Performance</TabsTrigger>
              <TabsTrigger value="analysis" className="text-slate-300">AI Analysis</TabsTrigger>
            </TabsList>

            <TabsContent value="scanner" className="space-y-6">
              <AdvancedScanner />
            </TabsContent>

            <TabsContent value="strategies" className="space-y-6">
              <TradingStrategies symbol={selectedSymbol} />
            </TabsContent>

            <TabsContent value="performance" className="space-y-6">
              <SuccessRateCalculator />
            </TabsContent>

            <TabsContent value="overview" className="space-y-6">
              {/* Trading Chart */}
              <TradingChart symbol={selectedSymbol} height={400} />

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-slate-400">Active Signals</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-400">12</div>
                    <p className="text-xs text-slate-400">+3 from yesterday</p>
                  </CardContent>
                </Card>
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-slate-400">Win Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-400">87.5%</div>
                    <p className="text-xs text-slate-400">Last 30 days</p>
                  </CardContent>
                </Card>
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-slate-400">Total P&L</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-400">+12.4%</div>
                    <p className="text-xs text-slate-400">This month</p>
                  </CardContent>
                </Card>
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-slate-400">AI Accuracy</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-purple-400">94.2%</div>
                    <p className="text-xs text-slate-400">All strategies</p>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Signals */}
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Recent Signals</CardTitle>
                  <CardDescription className="text-slate-400">
                    Latest AI-generated trading signals
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {signals.slice(0, 3).map((signal) => (
                      <div key={signal.id} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Badge
                            variant={signal.type === "BUY" ? "default" : "destructive"}
                            className={signal.type === "BUY" ? "bg-green-500" : "bg-red-500"}
                          >
                            {signal.type}
                          </Badge>
                          <div>
                            <div className="font-medium">{signal.symbol}</div>
                            <div className="text-sm text-slate-400">{signal.strategy}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">${signal.entryPrice.toLocaleString()}</div>
                          <div className="text-sm text-slate-400">{signal.timestamp}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="signals" className="space-y-6">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Active Trading Signals</CardTitle>
                  <CardDescription className="text-slate-400">
                    Real-time AI-powered trading opportunities with TP1-TP4 levels
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {signals.map((signal) => (
                      <div key={signal.id} className="border border-slate-600 rounded-lg p-4 bg-slate-700/30">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <Badge
                              variant={signal.type === "BUY" ? "default" : "destructive"}
                              className={signal.type === "BUY" ? "bg-green-500" : "bg-red-500"}
                            >
                              {signal.type}
                            </Badge>
                            <span className="font-semibold text-lg">{signal.symbol}</span>
                            <Badge variant="outline" className="border-purple-500 text-purple-400">
                              <Brain className="w-3 h-3 mr-1" />
                              {signal.strength}% Confidence
                            </Badge>
                          </div>
                          <span className="text-sm text-slate-400">{signal.timestamp}</span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                          <div>
                            <span className="text-slate-400">Entry:</span>
                            <div className="font-medium">${signal.entryPrice?.toLocaleString()}</div>
                          </div>
                          <div>
                            <span className="text-slate-400">Stop Loss:</span>
                            <div className="font-medium text-red-400">${signal.stopLoss?.toLocaleString()}</div>
                          </div>
                          <div>
                            <span className="text-slate-400">TP1 (80 pips):</span>
                            <div className="font-medium text-green-400">${signal.takeProfit?.toLocaleString()}</div>
                          </div>
                          <div>
                            <span className="text-slate-400">TP2:</span>
                            <div className="font-medium text-green-400">${(signal.takeProfit! * 1.5).toLocaleString()}</div>
                          </div>
                          <div>
                            <span className="text-slate-400">TP3:</span>
                            <div className="font-medium text-green-400">${(signal.takeProfit! * 2).toLocaleString()}</div>
                          </div>
                        </div>
                        <div className="mt-2 text-sm text-slate-400">
                          <strong>Strategy:</strong> {signal.strategy} | <strong>Risk:Reward:</strong> 1:3.2
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="watchlist" className="space-y-6">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Watchlist</CardTitle>
                  <CardDescription className="text-slate-400">
                    Track your favorite trading pairs
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {watchlist.map((item) => (
                      <div key={item.symbol} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="font-medium">{item.symbol}</div>
                          <div className="text-sm text-slate-400">Vol: {item.volume}</div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="text-right">
                            <div className="font-medium">${item.price.toLocaleString()}</div>
                            <div className={`text-sm ${item.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {item.change >= 0 ? '+' : ''}{item.change}%
                            </div>
                          </div>
                          {item.change >= 0 ? (
                            <TrendingUp className="w-4 h-4 text-green-400" />
                          ) : (
                            <TrendingDown className="w-4 h-4 text-red-400" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analysis" className="space-y-6">
              <TradingStrategies symbol={selectedSymbol} />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  )
}