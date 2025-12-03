import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, BarChart2, Shield, Zap, Globe, Cpu, Users } from "lucide-react"

export const dynamic = 'force-dynamic'

export default function LandingPage() {
    return (
        <div className="flex flex-col min-h-screen bg-slate-950 text-white">
            {/* Navigation */}
            <header className="px-4 lg:px-6 h-16 flex items-center border-b border-slate-800">
                <Link className="flex items-center justify-center" href="/">
                    <Cpu className="h-6 w-6 text-blue-500 mr-2" />
                    <span className="font-bold text-xl">Brain AiPro Trader</span>
                </Link>
                <nav className="ml-auto flex gap-4 sm:gap-6">
                    <Link className="text-sm font-medium hover:text-blue-400 transition-colors" href="/features">
                        Features
                    </Link>
                    <Link className="text-sm font-medium hover:text-blue-400 transition-colors" href="/pricing">
                        Pricing
                    </Link>
                    <Link className="text-sm font-medium hover:text-blue-400 transition-colors" href="/about">
                        About
                    </Link>
                    <Link className="text-sm font-medium hover:text-blue-400 transition-colors" href="/contact">
                        Contact
                    </Link>
                </nav>
                <div className="ml-4 flex gap-2">
                    <Link href="/login">
                        <Button variant="ghost" className="text-white hover:text-blue-400">Log In</Button>
                    </Link>
                    <Link href="/signup">
                        <Button className="bg-blue-600 hover:bg-blue-700">Get Started</Button>
                    </Link>
                </div>
            </header>

            <main className="flex-1">
                {/* Hero Section */}
                <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-gradient-to-b from-slate-950 to-slate-900">
                    <div className="container px-4 md:px-6">
                        <div className="flex flex-col items-center space-y-4 text-center">
                            <div className="space-y-2">
                                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
                                    Trade Smarter with AI Precision
                                </h1>
                                <p className="mx-auto max-w-[700px] text-slate-400 md:text-xl">
                                    Advanced AI agents, sniper entries, and institutional-grade risk management.
                                    Stop guessing and start trading with the power of Brain AiPro.
                                </p>
                            </div>
                            <div className="space-x-4">
                                <Link href="/signup">
                                    <Button className="bg-blue-600 hover:bg-blue-700 h-11 px-8">
                                        Start Free Trial <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </Link>
                                <Link href="/features">
                                    <Button variant="outline" className="border-slate-700 text-white hover:bg-slate-800 h-11 px-8">
                                        Explore Features
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Grid */}
                <section className="w-full py-12 md:py-24 lg:py-32 bg-slate-950">
                    <div className="container px-4 md:px-6">
                        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
                            <div className="flex flex-col items-center space-y-4 text-center p-6 bg-slate-900 rounded-xl border border-slate-800 hover:border-blue-500/50 transition-all">
                                <div className="p-3 bg-blue-500/10 rounded-full">
                                    <Cpu className="h-8 w-8 text-blue-500" />
                                </div>
                                <h3 className="text-xl font-bold">Multi-Agent AI</h3>
                                <p className="text-slate-400">
                                    5 specialized AI agents analyze Forex, Crypto, Stocks, and Commodities 24/7 to find the best opportunities.
                                </p>
                            </div>
                            <div className="flex flex-col items-center space-y-4 text-center p-6 bg-slate-900 rounded-xl border border-slate-800 hover:border-purple-500/50 transition-all">
                                <div className="p-3 bg-purple-500/10 rounded-full">
                                    <Target className="h-8 w-8 text-purple-500" />
                                </div>
                                <h3 className="text-xl font-bold">Sniper Entries</h3>
                                <p className="text-slate-400">
                                    Precision entry points validated by volume, momentum, and market structure. No more drawdown.
                                </p>
                            </div>
                            <div className="flex flex-col items-center space-y-4 text-center p-6 bg-slate-900 rounded-xl border border-slate-800 hover:border-green-500/50 transition-all">
                                <div className="p-3 bg-green-500/10 rounded-full">
                                    <Shield className="h-8 w-8 text-green-500" />
                                </div>
                                <h3 className="text-xl font-bold">Smart Risk Management</h3>
                                <p className="text-slate-400">
                                    Capital-based lot sizing and dynamic position management to protect your account and maximize growth.
                                </p>
                            </div>
                            <div className="flex flex-col items-center space-y-4 text-center p-6 bg-slate-900 rounded-xl border border-slate-800 hover:border-yellow-500/50 transition-all">
                                <div className="p-3 bg-yellow-500/10 rounded-full">
                                    <Zap className="h-8 w-8 text-yellow-500" />
                                </div>
                                <h3 className="text-xl font-bold">Instant Alerts</h3>
                                <p className="text-slate-400">
                                    Get signals instantly via Telegram, SMS, or Email. Never miss a trade setup again.
                                </p>
                            </div>
                            <div className="flex flex-col items-center space-y-4 text-center p-6 bg-slate-900 rounded-xl border border-slate-800 hover:border-red-500/50 transition-all">
                                <div className="p-3 bg-red-500/10 rounded-full">
                                    <BarChart2 className="h-8 w-8 text-red-500" />
                                </div>
                                <h3 className="text-xl font-bold">Advanced Charting</h3>
                                <p className="text-slate-400">
                                    Professional charts with auto-detected patterns, support/resistance zones, and pivot points.
                                </p>
                            </div>
                            <div className="flex flex-col items-center space-y-4 text-center p-6 bg-slate-900 rounded-xl border border-slate-800 hover:border-cyan-500/50 transition-all">
                                <div className="p-3 bg-cyan-500/10 rounded-full">
                                    <Globe className="h-8 w-8 text-cyan-500" />
                                </div>
                                <h3 className="text-xl font-bold">Global Markets</h3>
                                <p className="text-slate-400">
                                    Trade everything from one platform. Forex, Crypto, Indices, Metals, and Energies.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="w-full py-12 md:py-24 lg:py-32 bg-blue-600">
                    <div className="container px-4 md:px-6">
                        <div className="flex flex-col items-center space-y-4 text-center text-white">
                            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                                Ready to Upgrade Your Trading?
                            </h2>
                            <p className="mx-auto max-w-[600px] text-blue-100 md:text-xl">
                                Join thousands of traders using Brain AiPro to consistently profit from the markets.
                            </p>
                            <Link href="/signup">
                                <Button className="bg-white text-blue-600 hover:bg-slate-100 h-11 px-8 font-bold">
                                    Get Started Now
                                </Button>
                            </Link>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t border-slate-800">
                <p className="text-xs text-slate-500">© 2025 Brain AiPro Trader. All rights reserved.</p>
                <nav className="sm:ml-auto flex gap-4 sm:gap-6">
                    <Link className="text-xs hover:underline underline-offset-4 text-slate-500 hover:text-slate-300" href="/legal/terms">
                        Terms of Service
                    </Link>
                    <Link className="text-xs hover:underline underline-offset-4 text-slate-500 hover:text-slate-300" href="/legal/privacy">
                        Privacy
                    </Link>
                </nav>
            </footer>
        </div>
    )
}

function Target(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="6" />
            <circle cx="12" cy="12" r="2" />
        </svg>
    )
}
