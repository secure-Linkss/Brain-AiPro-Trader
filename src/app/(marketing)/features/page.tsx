import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Cpu, Shield, Zap, BarChart2, Globe, Target, Bell, Smartphone } from "lucide-react"

export default function FeaturesPage() {
    return (
        <div className="flex flex-col min-h-screen bg-slate-950 text-white">
            <header className="px-4 lg:px-6 h-16 flex items-center border-b border-slate-800">
                <Link className="font-bold text-xl" href="/">Brain AiPro Trader</Link>
                <nav className="ml-auto flex gap-4 sm:gap-6">
                    <Link className="text-sm font-medium hover:text-blue-400" href="/">Home</Link>
                    <Link className="text-sm font-medium hover:text-blue-400" href="/pricing">Pricing</Link>
                </nav>
            </header>

            <main className="flex-1 py-12 md:py-24">
                <div className="container px-4 md:px-6">
                    <div className="text-center mb-16">
                        <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-4">
                            Institutional-Grade Features
                        </h1>
                        <p className="text-slate-400 max-w-2xl mx-auto text-lg">
                            Built for traders who demand precision, speed, and reliability.
                        </p>
                    </div>

                    <div className="space-y-24">
                        {/* Feature 1: Multi-Agent AI */}
                        <div className="grid md:grid-cols-2 gap-12 items-center">
                            <div className="space-y-4">
                                <div className="inline-flex items-center rounded-lg bg-blue-900/30 px-3 py-1 text-sm font-medium text-blue-400">
                                    <Cpu className="mr-2 h-4 w-4" /> AI Powered
                                </div>
                                <h2 className="text-3xl font-bold">5 Specialized AI Agents</h2>
                                <p className="text-slate-400 text-lg">
                                    Our multi-agent system doesn't just look at price. It analyzes market structure, news sentiment, and technical indicators simultaneously.
                                </p>
                                <ul className="space-y-2">
                                    <li className="flex items-center text-slate-300"><div className="h-2 w-2 bg-blue-500 rounded-full mr-2" /> Forex Analyst Agent</li>
                                    <li className="flex items-center text-slate-300"><div className="h-2 w-2 bg-purple-500 rounded-full mr-2" /> Crypto Analyst Agent</li>
                                    <li className="flex items-center text-slate-300"><div className="h-2 w-2 bg-green-500 rounded-full mr-2" /> Stock Market Agent</li>
                                    <li className="flex items-center text-slate-300"><div className="h-2 w-2 bg-yellow-500 rounded-full mr-2" /> Commodities Agent</li>
                                </ul>
                            </div>
                            <div className="bg-slate-900 rounded-xl border border-slate-800 p-8 h-80 flex items-center justify-center relative overflow-hidden group">
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <Cpu className="h-32 w-32 text-slate-700 group-hover:text-blue-500 transition-colors duration-500" />
                            </div>
                        </div>

                        {/* Feature 2: Sniper Entries */}
                        <div className="grid md:grid-cols-2 gap-12 items-center md:flex-row-reverse">
                            <div className="order-2 md:order-1 bg-slate-900 rounded-xl border border-slate-800 p-8 h-80 flex items-center justify-center relative overflow-hidden group">
                                <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <Target className="h-32 w-32 text-slate-700 group-hover:text-red-500 transition-colors duration-500" />
                            </div>
                            <div className="space-y-4 order-1 md:order-2">
                                <div className="inline-flex items-center rounded-lg bg-red-900/30 px-3 py-1 text-sm font-medium text-red-400">
                                    <Target className="mr-2 h-4 w-4" /> Precision
                                </div>
                                <h2 className="text-3xl font-bold">Sniper Entry System</h2>
                                <p className="text-slate-400 text-lg">
                                    Stop entering trades too early or too late. Our Sniper Entry system validates every signal against 7 critical factors.
                                </p>
                                <ul className="space-y-2">
                                    <li className="flex items-center text-slate-300"><div className="h-2 w-2 bg-red-500 rounded-full mr-2" /> Support/Resistance Validation</li>
                                    <li className="flex items-center text-slate-300"><div className="h-2 w-2 bg-red-500 rounded-full mr-2" /> Volume Confirmation</li>
                                    <li className="flex items-center text-slate-300"><div className="h-2 w-2 bg-red-500 rounded-full mr-2" /> Momentum Alignment</li>
                                    <li className="flex items-center text-slate-300"><div className="h-2 w-2 bg-red-500 rounded-full mr-2" /> Time-of-Day Liquidity Check</li>
                                </ul>
                            </div>
                        </div>

                        {/* Feature 3: Risk Management */}
                        <div className="grid md:grid-cols-2 gap-12 items-center">
                            <div className="space-y-4">
                                <div className="inline-flex items-center rounded-lg bg-green-900/30 px-3 py-1 text-sm font-medium text-green-400">
                                    <Shield className="mr-2 h-4 w-4" /> Protection
                                </div>
                                <h2 className="text-3xl font-bold">Capital-Based Risk Management</h2>
                                <p className="text-slate-400 text-lg">
                                    Protect your capital like a pro. The system automatically calculates the perfect lot size based on your account balance and risk tolerance.
                                </p>
                                <ul className="space-y-2">
                                    <li className="flex items-center text-slate-300"><div className="h-2 w-2 bg-green-500 rounded-full mr-2" /> Auto Lot Size Calculation</li>
                                    <li className="flex items-center text-slate-300"><div className="h-2 w-2 bg-green-500 rounded-full mr-2" /> Dynamic Stop Loss Placement</li>
                                    <li className="flex items-center text-slate-300"><div className="h-2 w-2 bg-green-500 rounded-full mr-2" /> Portfolio Exposure Monitoring</li>
                                </ul>
                            </div>
                            <div className="bg-slate-900 rounded-xl border border-slate-800 p-8 h-80 flex items-center justify-center relative overflow-hidden group">
                                <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <Shield className="h-32 w-32 text-slate-700 group-hover:text-green-500 transition-colors duration-500" />
                            </div>
                        </div>
                    </div>

                    <div className="mt-24 text-center">
                        <h2 className="text-2xl font-bold mb-6">And much more...</h2>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="p-4 bg-slate-900 rounded-lg border border-slate-800">
                                <Bell className="h-8 w-8 text-yellow-500 mb-2 mx-auto" />
                                <h3 className="font-bold">Telegram Alerts</h3>
                            </div>
                            <div className="p-4 bg-slate-900 rounded-lg border border-slate-800">
                                <BarChart2 className="h-8 w-8 text-blue-500 mb-2 mx-auto" />
                                <h3 className="font-bold">Pattern Detection</h3>
                            </div>
                            <div className="p-4 bg-slate-900 rounded-lg border border-slate-800">
                                <Globe className="h-8 w-8 text-cyan-500 mb-2 mx-auto" />
                                <h3 className="font-bold">News Analysis</h3>
                            </div>
                            <div className="p-4 bg-slate-900 rounded-lg border border-slate-800">
                                <Smartphone className="h-8 w-8 text-purple-500 mb-2 mx-auto" />
                                <h3 className="font-bold">Mobile Friendly</h3>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
