"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Check, X, Zap, Crown, Rocket, Building2, TrendingUp } from "lucide-react"
import { Badge } from "@/components/ui/badge"

const plans = [
    {
        id: "starter",
        name: "Starter",
        monthlyPrice: 39,
        annualPrice: 375,
        priceId: "price_starter_monthly",
        annualPriceId: "price_starter_annual",
        icon: Zap,
        description: "Perfect for beginners",
        features: [
            "20 AI Signals per day",
            "Forex + Basic Crypto coverage",
            "Advanced AI risk calculator",
            "Email + Push notifications",
            "8 proven trading strategies",
            "Mobile app access",
            "Trading journal with analytics",
            "Success rate tracking",
            "Community support (48h response)"
        ],
        limitations: [
            "No advanced crypto/stocks",
            "No Telegram instant alerts",
            "No AI opportunity finder",
            "Limited to 8 strategies"
        ],
        color: "blue",
        savings: 93
    },
    {
        id: "pro",
        name: "Pro Trader",
        monthlyPrice: 119,
        annualPrice: 1143,
        priceId: "price_pro_monthly",
        annualPriceId: "price_pro_annual",
        icon: Crown,
        description: "Most popular for serious traders",
        popular: true,
        features: [
            "UNLIMITED AI Signals",
            "ALL Markets (Forex, Crypto, Stocks, Commodities, Indices)",
            "Instant Telegram alerts (< 1 second)",
            "AI Opportunity Finder (500+ assets)",
            "25+ Advanced strategies (SMC, Harmonics, Elliott Wave)",
            "Auto pattern detection",
            "Sniper entry validation",
            "Multi-timeframe analysis (15m-Monthly)",
            "Advanced risk management",
            "Priority support (12h response)",
            "Advanced trading journal with P&L",
            "Portfolio tracking",
            "Backtesting access (10+ years)",
            "Unlimited watchlists",
            "Economic calendar integration"
        ],
        limitations: [],
        color: "purple",
        savings: 285
    },
    {
        id: "elite",
        name: "Elite",
        monthlyPrice: 319,
        annualPrice: 3063,
        priceId: "price_elite_monthly",
        annualPriceId: "price_elite_annual",
        icon: Rocket,
        description: "For institutional traders",
        features: [
            "Everything in Pro Trader",
            "Full API Access (REST + WebSocket)",
            "Custom strategy builder (no-code)",
            "1-on-1 consultation (monthly 60-min)",
            "Portfolio management tools",
            "Multi-account support (5 accounts)",
            "White-label options",
            "Dedicated account manager",
            "Custom integrations (MT4/MT5, TradingView)",
            "Advanced backtesting (tick-by-tick)",
            "Custom alerts & automations",
            "VIP support (2h response)",
            "Early access to features",
            "Custom reporting dashboards",
            "Team collaboration (3 users)"
        ],
        limitations: [],
        color: "gold",
        savings: 765
    },
    {
        id: "enterprise",
        name: "Enterprise",
        monthlyPrice: null,
        annualPrice: null,
        priceId: "enterprise",
        annualPriceId: "enterprise",
        icon: Building2,
        description: "Custom solutions for organizations",
        features: [
            "Everything in Elite",
            "Unlimited team members",
            "Custom AI model training",
            "Dedicated infrastructure",
            "SLA guarantees (99.9% uptime)",
            "Custom data feeds",
            "On-premise deployment option",
            "Quarterly business reviews",
            "Custom feature development",
            "Advanced compliance & reporting",
            "24/7 premium support",
            "Full white-labeling & branding"
        ],
        limitations: [],
        color: "slate",
        isEnterprise: true,
        startingPrice: "£1,500"
    }
]

export default function PricingPage() {
    const router = useRouter()
    const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly")

    const handleSelectPlan = (planId: string) => {
        if (planId === "enterprise") {
            router.push("/contact?subject=Enterprise Plan Inquiry")
        } else {
            router.push(`/register?plan=${planId}&cycle=${billingCycle}`)
        }
    }

    return (
        <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
            <header className="px-4 lg:px-6 h-16 flex items-center border-b border-slate-800 backdrop-blur-sm bg-slate-950/50 sticky top-0 z-50">
                <Link className="font-bold text-xl flex items-center gap-2" href="/">
                    <TrendingUp className="h-6 w-6 text-blue-500" />
                    Brain AiPro Trader
                </Link>
                <nav className="ml-auto flex gap-4 sm:gap-6">
                    <Link className="text-sm font-medium hover:text-blue-400 transition-colors" href="/">Home</Link>
                    <Link className="text-sm font-medium hover:text-blue-400 transition-colors" href="/features">Features</Link>
                    <Link className="text-sm font-medium hover:text-blue-400 transition-colors" href="/about">About</Link>
                </nav>
                <div className="ml-4 flex gap-2">
                    <Link href="/login">
                        <Button variant="ghost" className="text-white hover:text-blue-400">Log In</Button>
                    </Link>
                    <Link href="/register">
                        <Button className="bg-blue-600 hover:bg-blue-700">Get Started</Button>
                    </Link>
                </div>
            </header>

            <main className="flex-1 py-12 md:py-24">
                <div className="container px-4 md:px-6">
                    {/* Header */}
                    <div className="flex flex-col items-center space-y-4 text-center mb-12">
                        <Badge className="mb-2 bg-blue-600 text-white">UK Pricing in GBP (£)</Badge>
                        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                            Choose Your Trading Edge
                        </h1>
                        <p className="mx-auto max-w-[700px] text-slate-400 md:text-xl">
                            Better value than Learn2Trade, WOLFX, and Binance Killers combined.
                        </p>
                        <p className="text-sm text-slate-500">
                            🇬🇧 Transparent UK pricing • No hidden fees • 7-day free trial • Cancel anytime
                        </p>
                    </div>

                    {/* Billing Toggle */}
                    <div className="flex justify-center mb-12">
                        <div className="inline-flex items-center gap-4 p-1 bg-slate-900 rounded-lg border border-slate-800">
                            <Button
                                variant={billingCycle === "monthly" ? "default" : "ghost"}
                                onClick={() => setBillingCycle("monthly")}
                                className="relative"
                            >
                                Monthly
                            </Button>
                            <Button
                                variant={billingCycle === "annual" ? "default" : "ghost"}
                                onClick={() => setBillingCycle("annual")}
                                className="relative"
                            >
                                Annual
                                <Badge className="absolute -top-2 -right-2 bg-green-600 text-xs">
                                    Save 20%
                                </Badge>
                            </Button>
                        </div>
                    </div>

                    {/* Pricing Cards */}
                    <div className="grid gap-8 lg:grid-cols-4 max-w-7xl mx-auto mb-16">
                        {plans.map((plan) => {
                            const Icon = plan.icon
                            const price = billingCycle === "monthly" ? plan.monthlyPrice : plan.annualPrice

                            return (
                                <div
                                    key={plan.id}
                                    className={`relative flex flex-col p-8 bg-slate-900 rounded-2xl border-2 transition-all hover:scale-105 ${plan.popular
                                            ? 'border-purple-600 shadow-2xl shadow-purple-900/20 lg:scale-105'
                                            : 'border-slate-800 hover:border-slate-700'
                                        }`}
                                >
                                    {plan.popular && (
                                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs font-bold px-4 py-1 rounded-full">
                                            ⭐ BEST VALUE
                                        </div>
                                    )}

                                    <div className="flex items-center gap-3 mb-4">
                                        <div className={`p-2 rounded-lg bg-${plan.color}-500/10`}>
                                            <Icon className={`h-6 w-6 text-${plan.color}-500`} />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-bold">{plan.name}</h3>
                                            <p className="text-sm text-slate-400">{plan.description}</p>
                                        </div>
                                    </div>

                                    <div className="mb-6">
                                        {plan.isEnterprise ? (
                                            <div>
                                                <span className="text-3xl font-bold">Custom</span>
                                                <p className="text-sm text-slate-400 mt-1">From {plan.startingPrice}/month</p>
                                            </div>
                                        ) : (
                                            <div>
                                                <span className="text-5xl font-bold">£{price}</span>
                                                <span className="text-slate-400">
                                                    /{billingCycle === "monthly" ? "month" : "year"}
                                                </span>
                                                {billingCycle === "annual" && plan.savings && (
                                                    <p className="text-sm text-green-500 mt-2 font-medium">
                                                        💰 Save £{plan.savings}/year (20% off)
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    <ul className="space-y-3 mb-8 flex-1">
                                        {plan.features.map((feature, i) => (
                                            <li key={i} className="flex items-start gap-2 text-slate-300">
                                                <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                                                <span className="text-sm">{feature}</span>
                                            </li>
                                        ))}
                                        {plan.limitations.map((limitation, i) => (
                                            <li key={i} className="flex items-start gap-2 text-slate-500">
                                                <X className="h-5 w-5 flex-shrink-0 mt-0.5" />
                                                <span className="text-sm">{limitation}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    <Button
                                        onClick={() => handleSelectPlan(plan.id)}
                                        className={`w-full h-12 text-base font-semibold ${plan.popular
                                                ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700'
                                                : plan.isEnterprise
                                                    ? 'bg-slate-700 hover:bg-slate-600'
                                                    : 'bg-slate-800 hover:bg-slate-700'
                                            }`}
                                    >
                                        {plan.isEnterprise ? 'Contact Sales' : `Get ${plan.name}`}
                                    </Button>
                                </div>
                            )
                        })}
                    </div>

                    {/* Comparison Table */}
                    <div className="mt-24 max-w-5xl mx-auto">
                        <h2 className="text-3xl font-bold text-center mb-8">Why We're Better Than Competitors</h2>
                        <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
                            <table className="w-full">
                                <thead className="bg-slate-800">
                                    <tr>
                                        <th className="p-4 text-left">Feature</th>
                                        <th className="p-4 text-center">Learn2Trade</th>
                                        <th className="p-4 text-center">WOLFX</th>
                                        <th className="p-4 text-center bg-purple-900/20">Brain AiPro</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-t border-slate-800">
                                        <td className="p-4">Price (Monthly)</td>
                                        <td className="p-4 text-center">£39</td>
                                        <td className="p-4 text-center">£110</td>
                                        <td className="p-4 text-center bg-purple-900/10 font-bold text-green-500">£119</td>
                                    </tr>
                                    <tr className="border-t border-slate-800">
                                        <td className="p-4">Markets Covered</td>
                                        <td className="p-4 text-center">Forex only</td>
                                        <td className="p-4 text-center">Forex + Crypto</td>
                                        <td className="p-4 text-center bg-purple-900/10 font-bold text-green-500">All Markets</td>
                                    </tr>
                                    <tr className="border-t border-slate-800">
                                        <td className="p-4">Daily Signals</td>
                                        <td className="p-4 text-center">10</td>
                                        <td className="p-4 text-center">15</td>
                                        <td className="p-4 text-center bg-purple-900/10 font-bold text-green-500">Unlimited</td>
                                    </tr>
                                    <tr className="border-t border-slate-800">
                                        <td className="p-4">Strategies</td>
                                        <td className="p-4 text-center">5</td>
                                        <td className="p-4 text-center">8</td>
                                        <td className="p-4 text-center bg-purple-900/10 font-bold text-green-500">25+</td>
                                    </tr>
                                    <tr className="border-t border-slate-800">
                                        <td className="p-4">API Access</td>
                                        <td className="p-4 text-center text-red-500">✗</td>
                                        <td className="p-4 text-center text-red-500">✗</td>
                                        <td className="p-4 text-center bg-purple-900/10 text-green-500">✓ (Elite)</td>
                                    </tr>
                                    <tr className="border-t border-slate-800">
                                        <td className="p-4">Backtesting</td>
                                        <td className="p-4 text-center text-red-500">✗</td>
                                        <td className="p-4 text-center text-red-500">✗</td>
                                        <td className="p-4 text-center bg-purple-900/10 text-green-500">✓ (Pro+)</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Trust Badges */}
                    <div className="mt-16 text-center space-y-6">
                        <p className="text-slate-400 text-lg font-medium">Trusted by 500+ UK traders</p>
                        <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-slate-500">
                            <div className="flex items-center gap-2">
                                <Check className="h-5 w-5 text-green-500" />
                                <span>7-day free trial</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Check className="h-5 w-5 text-green-500" />
                                <span>No credit card required</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Check className="h-5 w-5 text-green-500" />
                                <span>Cancel anytime</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Check className="h-5 w-5 text-green-500" />
                                <span>14-day money-back guarantee</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Check className="h-5 w-5 text-green-500" />
                                <span>Secure payment via Stripe</span>
                            </div>
                        </div>
                    </div>

                    {/* FAQ Section */}
                    <div className="mt-24 max-w-3xl mx-auto">
                        <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
                        <div className="space-y-6">
                            <div className="p-6 bg-slate-900 rounded-lg border border-slate-800">
                                <h3 className="font-bold mb-2">Why are you cheaper than competitors?</h3>
                                <p className="text-slate-400">We use AI automation to reduce costs and pass savings to you. Our competitors rely on manual analysis teams.</p>
                            </div>
                            <div className="p-6 bg-slate-900 rounded-lg border border-slate-800">
                                <h3 className="font-bold mb-2">Can I change plans later?</h3>
                                <p className="text-slate-400">Yes! Upgrade or downgrade anytime. Changes take effect immediately with pro-rated billing.</p>
                            </div>
                            <div className="p-6 bg-slate-900 rounded-lg border border-slate-800">
                                <h3 className="font-bold mb-2">Do you offer refunds?</h3>
                                <p className="text-slate-400">Yes, 14-day money-back guarantee on all plans. No questions asked.</p>
                            </div>
                            <div className="p-6 bg-slate-900 rounded-lg border border-slate-800">
                                <h3 className="font-bold mb-2">What makes you better than Learn2Trade?</h3>
                                <p className="text-slate-400">We cover ALL markets (not just Forex), offer unlimited signals (vs 10/day), and use advanced AI with 25+ strategies (vs 5).</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <footer className="border-t border-slate-800 py-8">
                <div className="container px-4 md:px-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <p className="text-sm text-slate-500">© 2025 Brain AiPro Trader. All rights reserved. UK Company.</p>
                        <nav className="flex gap-6">
                            <Link className="text-sm hover:underline text-slate-500 hover:text-slate-300" href="/legal/terms">
                                Terms
                            </Link>
                            <Link className="text-sm hover:underline text-slate-500 hover:text-slate-300" href="/legal/privacy">
                                Privacy
                            </Link>
                            <Link className="text-sm hover:underline text-slate-500 hover:text-slate-300" href="/contact">
                                Contact
                            </Link>
                        </nav>
                    </div>
                </div>
            </footer>
        </div>
    )
}
