'use client'

import Navigation from '@/components/layout/Navigation'
import Footer from '@/components/layout/Footer'
import { Calendar, User, ArrowRight } from 'lucide-react'

export default function BlogPage() {
    const posts = [
        {
            title: "Understanding AI Signals: How We Predict Trends",
            excerpt: "Dive deep into the machine learning algorithms that power our signal engine and how they filter market noise.",
            date: "Dec 8, 2025",
            author: "Dr. Sarah Chen",
            category: "Technology"
        },
        {
            title: "Risk Management 101 for Crypto Traders",
            excerpt: "Essential strategies to protect your capital while maximizing gains in volatile markets.",
            date: "Dec 5, 2025",
            author: "Mike Ross",
            category: "Education"
        },
        {
            title: "2025 Market Outlook: The Year of Institutional Adoption",
            excerpt: "Our analysts predict massive inflows into DeFi and classical crypto assets. Here is what you need to know.",
            date: "Nov 28, 2025",
            author: "Brain Team",
            category: "Market Analysis"
        }
    ]

    return (
        <div className="min-h-screen bg-slate-950">
            <Navigation />

            <section className="pt-32 pb-20 px-4">
                <div className="container mx-auto max-w-6xl">
                    <div className="text-center mb-16">
                        <h1 className="text-5xl font-bold text-white mb-6">Trading Insights</h1>
                        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                            The latest news, analysis, and educational content from the Brain AiPro Team.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {posts.map((post, idx) => (
                            <div key={idx} className="bg-slate-900/50 border border-white/10 rounded-2xl overflow-hidden hover:border-blue-500/50 transition-colors group">
                                <div className="h-48 bg-gradient-to-br from-blue-900/20 to-purple-900/20" />
                                <div className="p-8">
                                    <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                                        <span className="flex items-center gap-1"><Calendar size={12} /> {post.date}</span>
                                        <span className="px-2 py-1 bg-white/5 rounded text-blue-400">{post.category}</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors">{post.title}</h3>
                                    <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                                        {post.excerpt}
                                    </p>
                                    <button className="flex items-center gap-2 text-sm font-semibold text-white hover:text-blue-400 transition-colors">
                                        Read Article <ArrowRight size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    )
}
