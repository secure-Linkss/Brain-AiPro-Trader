import Navigation from '@/components/layout/Navigation'
import Footer from '@/components/layout/Footer'
import { Brain, TrendingUp, Shield, Zap, BarChart3, Target, Bell, Code, Lock, Cpu, LineChart, Users } from 'lucide-react'

export default function FeaturesPage() {
    const features = [
        {
            icon: Brain,
            title: 'Advanced AI Analysis',
            description: 'Machine learning algorithms trained on millions of market patterns for accurate predictions',
            details: ['Neural network pattern recognition', 'Sentiment analysis', 'Predictive modeling']
        },
        {
            icon: TrendingUp,
            title: 'Harmonic Patterns',
            description: '9 advanced harmonic patterns including Gartley, Butterfly, Bat, Crab, and more',
            details: ['Fibonacci validation', 'Confidence scoring', 'Entry/Stop/Target calculations']
        },
        {
            icon: BarChart3,
            title: 'Technical Indicators',
            description: '20+ professional indicators with advanced implementations',
            details: ['RSI with divergence', 'MACD crossovers', 'ATR bands', 'ADX trend strength']
        },
        {
            icon: Shield,
            title: 'Risk Management',
            description: 'Built-in risk controls to protect your capital',
            details: ['Auto stop-loss calculation', 'Position sizing', 'Risk/reward ratios']
        },
        {
            icon: Zap,
            title: 'Real-Time Signals',
            description: 'Lightning-fast analysis with sub-second response times',
            details: ['WebSocket updates', 'Optimized Python backend', 'Instant notifications']
        },
        {
            icon: Target,
            title: 'Multi-Strategy',
            description: 'Ensemble voting system combining 20+ proven strategies',
            details: ['Momentum strategies', 'Trend following', 'Mean reversion']
        },
        {
            icon: Bell,
            title: 'Smart Alerts',
            description: 'Get notified instantly when opportunities arise',
            details: ['Email notifications', 'SMS alerts', 'Telegram integration']
        },
        {
            icon: Code,
            title: 'API Access',
            description: 'Full REST API for custom integrations',
            details: ['Complete documentation', 'Rate limiting', 'Webhook support']
        },
        {
            icon: Lock,
            title: 'Enterprise Security',
            description: 'Bank-level security for your data',
            details: ['End-to-end encryption', 'SOC 2 compliant', '2FA authentication']
        },
        {
            icon: Cpu,
            title: 'Backtesting Engine',
            description: 'Test strategies on historical data',
            details: ['10+ years of data', 'Walk-forward analysis', 'Performance metrics']
        },
        {
            icon: LineChart,
            title: 'Multi-Timeframe',
            description: 'Analyze from 1-minute to monthly charts',
            details: ['Timeframe alignment', 'Trend confirmation', 'Support/resistance levels']
        },
        {
            icon: Users,
            title: 'Copy Trading',
            description: 'Follow successful traders automatically',
            details: ['Real-time copying', 'Risk controls', 'Performance tracking']
        }
    ]

    return (
        <div className="min-h-screen bg-primary-900">
            <Navigation />

            {/* Hero */}
            <section className="pt-32 pb-20 px-4">
                <div className="container mx-auto text-center">
                    <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
                        Powerful Features for
                        <span className="block bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
                            Professional Trading
                        </span>
                    </h1>
                    <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                        Everything you need to analyze markets, identify opportunities, and execute trades with confidence
                    </p>
                </div>
            </section>

            {/* Features Grid */}
            <section className="pb-20 px-4">
                <div className="container mx-auto">
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
                                <p className="text-gray-400 mb-4">{feature.description}</p>
                                <ul className="space-y-2">
                                    {feature.details.map((detail, i) => (
                                        <li key={i} className="text-sm text-gray-500 flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                                            {detail}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    )
}
