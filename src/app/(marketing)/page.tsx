import Navigation from '@/components/layout/Navigation'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'
import { ArrowRight, Brain, TrendingUp, Shield, Zap, BarChart3, Target, Users } from 'lucide-react'

export default function HomePage() {
    const features = [
        {
            icon: Brain,
            title: 'AI-Powered Analysis',
            description: 'Advanced machine learning algorithms analyze market patterns with institutional-grade accuracy'
        },
        {
            icon: TrendingUp,
            title: 'Real-Time Signals',
            description: 'Get instant trading signals based on 20+ proven strategies and harmonic patterns'
        },
        {
            icon: Shield,
            title: 'Risk Management',
            description: 'Built-in stop-loss and take-profit calculations to protect your capital'
        },
        {
            icon: Zap,
            title: 'Lightning Fast',
            description: 'Sub-second analysis powered by optimized Python microservices'
        },
        {
            icon: BarChart3,
            title: 'Multi-Timeframe',
            description: 'Analyze from 1-minute to daily charts for complete market perspective'
        },
        {
            icon: Target,
            title: '75%+ Win Rate',
            description: 'Backtested strategies with proven performance across multiple markets'
        }
    ]

    const stats = [
        { value: '10,000+', label: 'Active Traders' },
        { value: '75%+', label: 'Win Rate' },
        { value: '24/7', label: 'Market Coverage' },
        { value: '20+', label: 'Strategies' }
    ]

    return (
        <div className="min-h-screen bg-primary-900">
            <Navigation />

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 px-4 overflow-hidden">
                {/* Background Effects */}
                <div className="absolute inset-0 bg-gradient-to-b from-primary-900 via-primary-800 to-primary-900" />
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500 rounded-full blur-3xl" />
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600 rounded-full blur-3xl" />
                </div>

                <div className="container mx-auto relative z-10">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full mb-8 animate-fadeIn">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            <span className="text-sm text-gray-300">AI Trading Intelligence Platform</span>
                        </div>

                        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
                            Trade Smarter with
                            <span className="block bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
                                AI-Powered Insights
                            </span>
                        </h1>

                        <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
                            Advanced pattern recognition, real-time signals, and institutional-grade analysis.
                            Make data-driven trading decisions with confidence.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                href="/register"
                                className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-lg font-semibold rounded-lg hover:shadow-lg hover:shadow-blue-500/50 transition-all hover:-translate-y-1 inline-flex items-center justify-center gap-2"
                            >
                                Get Started Free
                                <ArrowRight size={20} />
                            </Link>
                            <Link
                                href="/features"
                                className="px-8 py-4 bg-white/5 border border-white/20 text-white text-lg font-semibold rounded-lg hover:bg-white/10 transition-all inline-flex items-center justify-center gap-2"
                            >
                                Explore Features
                            </Link>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16">
                            {stats.map((stat, index) => (
                                <div key={index} className="text-center">
                                    <div className="text-3xl md:text-4xl font-bold text-white mb-2">{stat.value}</div>
                                    <div className="text-sm text-gray-400">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 px-4 bg-primary-800/50">
                <div className="container mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                            Everything You Need to Trade Successfully
                        </h2>
                        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                            Powerful tools and features designed for both beginners and professional traders
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className="p-8 bg-primary-800/60 border border-white/10 rounded-2xl hover:border-blue-500/50 transition-all hover:-translate-y-1 group"
                            >
                                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <feature.icon className="text-white" size={28} />
                                </div>
                                <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                                <p className="text-gray-400">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-4">
                <div className="container mx-auto">
                    <div className="max-w-4xl mx-auto bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 text-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-black/20" />
                        <div className="relative z-10">
                            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                                Ready to Transform Your Trading?
                            </h2>
                            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                                Join thousands of traders using AI-powered analysis to make smarter decisions
                            </p>
                            <Link
                                href="/register"
                                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 text-lg font-semibold rounded-lg hover:bg-gray-100 transition-all hover:-translate-y-1"
                            >
                                Start Trading Smarter
                                <ArrowRight size={20} />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    )
}
