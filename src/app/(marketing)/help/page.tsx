'use client'

import Navigation from '@/components/layout/Navigation'
import Footer from '@/components/layout/Footer'
import { Search, User, CreditCard, BarChart2, Laptop, MessageCircle, ChevronRight } from 'lucide-react'

export default function HelpPage() {
    const categories = [
        {
            icon: User,
            title: "Account & Security",
            desc: "Manage your profile, 2FA, and login issues.",
            articles: ["How to reset password", "Setting up 2FA", "Account verification"]
        },
        {
            icon: CreditCard,
            title: "Billing & Subscriptions",
            desc: "Invoices, plans, and payment methods.",
            articles: ["Upgrade to Pro", "Refund Policy", "Download Invoice"]
        },
        {
            icon: BarChart2,
            title: "Trading Features",
            desc: "Signals, charts, and analysis tools.",
            articles: ["Understanding Signals", "Pattern Detection Guide", "Backtesting Tutorial"]
        },
        {
            icon: Laptop,
            title: "Technical Support",
            desc: "API integration and platform troubleshooting.",
            articles: ["API Rate Limits", "Browser Compatibility", "WebSocket Errors"]
        }
    ]

    return (
        <div className="min-h-screen bg-slate-950">
            <Navigation />

            {/* Hero Search */}
            <div className="bg-slate-900 border-b border-white/10 pt-40 pb-20 px-4">
                <div className="container mx-auto max-w-3xl text-center">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">How can we help you?</h1>
                    <div className="relative max-w-xl mx-auto">
                        <input
                            type="text"
                            placeholder="Search for articles..."
                            className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:bg-white/5 transition-all"
                        />
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    </div>
                </div>
            </div>

            {/* Categories */}
            <section className="py-20 px-4">
                <div className="container mx-auto max-w-6xl">
                    <div className="grid md:grid-cols-2 gap-8">
                        {categories.map((cat, idx) => (
                            <div key={idx} className="bg-slate-900/50 border border-white/10 rounded-2xl p-8 hover:border-blue-500/30 transition-all hover:-translate-y-1 group">
                                <div className="flex items-start gap-6">
                                    <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                                        <cat.icon size={24} />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-xl font-bold text-white mb-2">{cat.title}</h3>
                                        <p className="text-gray-400 text-sm mb-6">{cat.desc}</p>
                                        <ul className="space-y-3">
                                            {cat.articles.map((art, aIdx) => (
                                                <li key={aIdx}>
                                                    <a href="#" className="flex items-center text-sm text-gray-300 hover:text-blue-400 transition-colors">
                                                        <ChevronRight size={14} className="mr-2 text-gray-600" />
                                                        {art}
                                                    </a>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Contact Support */}
                    <div className="mt-20 text-center bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-white/10 rounded-2xl p-12">
                        <MessageCircle className="mx-auto text-blue-400 mb-6" size={48} />
                        <h2 className="text-3xl font-bold text-white mb-4">Still need help?</h2>
                        <p className="text-gray-300 mb-8 max-w-xl mx-auto">
                            Our support team is available 24/7 to assist with any issues you may encounter.
                        </p>
                        <button className="px-8 py-3 bg-white text-slate-900 font-bold rounded-lg hover:bg-gray-200 transition-colors">
                            Contact Support
                        </button>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    )
}
