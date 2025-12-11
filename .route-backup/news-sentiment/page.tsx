"use client"

import { useState } from 'react'
import { TrendingUp, TrendingDown, Newspaper, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react'

export default function NewsSentimentPage() {
    const [expandedNews, setExpandedNews] = useState<number | null>(null)
    const [selectedSentiment, setSelectedSentiment] = useState('all')

    const newsItems = [
        {
            id: 1,
            title: 'Federal Reserve Signals Potential Rate Cuts in 2024',
            source: 'Reuters',
            time: '15 minutes ago',
            sentiment: 'bullish',
            score: 85,
            impact: 'high',
            affectedAssets: ['EUR/USD', 'GBP/USD', 'GOLD'],
            summary: 'The Federal Reserve has indicated a potential shift in monetary policy, suggesting rate cuts may be on the horizon. This dovish stance has strengthened risk assets and weakened the dollar.',
            url: '#'
        },
        {
            id: 2,
            title: 'Bitcoin ETF Approval Boosts Crypto Market',
            source: 'Bloomberg',
            time: '1 hour ago',
            sentiment: 'bullish',
            score: 92,
            impact: 'high',
            affectedAssets: ['BTC/USD', 'ETH/USD', 'Crypto Market'],
            summary: 'SEC approval of spot Bitcoin ETFs has triggered a massive rally in cryptocurrency markets. Institutional adoption is expected to accelerate.',
            url: '#'
        },
        {
            id: 3,
            title: 'Tech Earnings Disappoint, NASDAQ Under Pressure',
            source: 'CNBC',
            time: '2 hours ago',
            sentiment: 'bearish',
            score: 78,
            impact: 'medium',
            affectedAssets: ['NASDAQ', 'AAPL', 'MSFT', 'GOOGL'],
            summary: 'Major tech companies reported earnings below expectations, leading to sell-offs in technology stocks. Market participants are reassessing valuations.',
            url: '#'
        },
        {
            id: 4,
            title: 'Oil Prices Surge on Middle East Tensions',
            source: 'Financial Times',
            time: '3 hours ago',
            sentiment: 'bullish',
            score: 81,
            impact: 'high',
            affectedAssets: ['OIL', 'Energy Stocks'],
            summary: 'Geopolitical tensions in the Middle East have pushed crude oil prices higher. Energy sector stocks are benefiting from the rally.',
            url: '#'
        },
        {
            id: 5,
            title: 'European Central Bank Maintains Hawkish Stance',
            source: 'Wall Street Journal',
            time: '4 hours ago',
            sentiment: 'neutral',
            score: 55,
            impact: 'medium',
            affectedAssets: ['EUR/USD', 'European Indices'],
            summary: 'ECB officials reiterated commitment to fighting inflation, maintaining current interest rate levels despite economic slowdown concerns.',
            url: '#'
        }
    ]

    const filteredNews = selectedSentiment === 'all'
        ? newsItems
        : newsItems.filter(item => item.sentiment === selectedSentiment)

    const getSentimentColor = (sentiment: string) => {
        switch (sentiment) {
            case 'bullish': return 'text-green-400 bg-green-500/20'
            case 'bearish': return 'text-red-400 bg-red-500/20'
            default: return 'text-gray-400 bg-gray-500/20'
        }
    }

    const getImpactColor = (impact: string) => {
        switch (impact) {
            case 'high': return 'text-red-400'
            case 'medium': return 'text-yellow-400'
            default: return 'text-green-400'
        }
    }

    return (
        <div className="min-h-screen bg-primary-900 p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">News Sentiment Analysis</h1>
                    <p className="text-gray-400">AI-powered market sentiment from global news sources</p>
                </div>

                {/* Sentiment Filter */}
                <div className="flex gap-3 mb-6">
                    {[
                        { id: 'all', label: 'All News', icon: Newspaper },
                        { id: 'bullish', label: 'Bullish', icon: TrendingUp },
                        { id: 'bearish', label: 'Bearish', icon: TrendingDown }
                    ].map((filter) => (
                        <button
                            key={filter.id}
                            onClick={() => setSelectedSentiment(filter.id)}
                            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${selectedSentiment === filter.id
                                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                                    : 'bg-primary-800/60 text-gray-400 hover:text-white border border-white/10'
                                }`}
                        >
                            <filter.icon size={20} />
                            {filter.label}
                        </button>
                    ))}
                </div>

                {/* News List */}
                <div className="space-y-4">
                    {filteredNews.map((news) => (
                        <div key={news.id} className="bg-primary-800/60 border border-white/10 rounded-xl overflow-hidden hover:border-blue-500/50 transition-all">
                            <button
                                onClick={() => setExpandedNews(expandedNews === news.id ? null : news.id)}
                                className="w-full p-6 text-left hover:bg-white/5 transition-colors"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className={`px-3 py-1 rounded-lg text-xs font-semibold uppercase ${getSentimentColor(news.sentiment)}`}>
                                                {news.sentiment}
                                            </span>
                                            <span className={`text-xs font-semibold uppercase ${getImpactColor(news.impact)}`}>
                                                {news.impact} Impact
                                            </span>
                                            <div className="flex items-center gap-2 ml-auto">
                                                <span className="text-xs text-gray-500">{news.source}</span>
                                                <span className="text-xs text-gray-600">•</span>
                                                <span className="text-xs text-gray-500">{news.time}</span>
                                            </div>
                                        </div>

                                        <h3 className="text-lg font-semibold text-white mb-2">{news.title}</h3>

                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-gray-400">Sentiment Score:</span>
                                            <div className="flex items-center gap-2">
                                                <div className="w-24 h-2 bg-white/10 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full ${news.sentiment === 'bullish' ? 'bg-green-500' :
                                                                news.sentiment === 'bearish' ? 'bg-red-500' : 'bg-gray-500'
                                                            }`}
                                                        style={{ width: `${news.score}%` }}
                                                    />
                                                </div>
                                                <span className="text-white text-sm font-medium">{news.score}%</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        {expandedNews === news.id ? (
                                            <ChevronUp className="text-gray-400" size={20} />
                                        ) : (
                                            <ChevronDown className="text-gray-400" size={20} />
                                        )}
                                    </div>
                                </div>
                            </button>

                            {expandedNews === news.id && (
                                <div className="px-6 pb-6 bg-primary-900/50 animate-fadeIn">
                                    <div className="pt-4 space-y-4">
                                        <div>
                                            <h4 className="text-sm font-semibold text-white mb-2">Summary</h4>
                                            <p className="text-gray-300">{news.summary}</p>
                                        </div>

                                        <div>
                                            <h4 className="text-sm font-semibold text-white mb-2">Affected Assets</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {news.affectedAssets.map((asset, i) => (
                                                    <span key={i} className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-lg text-sm">
                                                        {asset}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        <a
                                            href={news.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 text-white rounded-lg hover:bg-white/10 transition-colors"
                                        >
                                            Read Full Article
                                            <ExternalLink size={16} />
                                        </a>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
