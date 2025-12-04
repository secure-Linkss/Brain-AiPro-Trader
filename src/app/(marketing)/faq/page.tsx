"use client"

import Navigation from '@/components/layout/Footer'
import Footer from '@/components/layout/Footer'
import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

export default function FAQPage() {
    const [openIndex, setOpenIndex] = useState<number | null>(0)

    const faqs = [
        {
            category: 'General',
            questions: [
                {
                    q: 'What is Brain AiPro Trader?',
                    a: 'Brain AiPro Trader is an AI-powered trading analysis platform that provides real-time signals, pattern detection, and market insights to help traders make better decisions.'
                },
                {
                    q: 'Do I need trading experience to use this platform?',
                    a: 'While our platform is designed to be user-friendly, we recommend having basic knowledge of trading concepts. We provide educational resources to help beginners get started.'
                },
                {
                    q: 'What markets do you support?',
                    a: 'We support Forex, Cryptocurrencies, Stocks, and Commodities. Our AI analyzes all major trading pairs and assets.'
                }
            ]
        },
        {
            category: 'Features',
            questions: [
                {
                    q: 'How accurate are the trading signals?',
                    a: 'Our backtested strategies show a 75%+ win rate. However, past performance does not guarantee future results. Always use proper risk management.'
                },
                {
                    q: 'What harmonic patterns do you detect?',
                    a: 'We detect 9 major harmonic patterns: Gartley, Butterfly, Bat, Crab, Cypher, Shark, 5-0, AB=CD, and Three Drives, all with Fibonacci validation.'
                },
                {
                    q: 'Can I backtest my own strategies?',
                    a: 'Yes, Pro and Enterprise plans include access to our backtesting engine with 10+ years of historical data.'
                }
            ]
        },
        {
            category: 'Pricing & Billing',
            questions: [
                {
                    q: 'Is there a free trial?',
                    a: 'We offer a free plan with limited features. You can upgrade to Pro or Enterprise at any time to unlock advanced features.'
                },
                {
                    q: 'Can I cancel anytime?',
                    a: 'Yes, you can cancel your subscription at any time. There are no long-term contracts or cancellation fees.'
                },
                {
                    q: 'Do you offer refunds?',
                    a: 'Yes, we offer a 30-day money-back guarantee if you\'re not satisfied with our service.'
                }
            ]
        },
        {
            category: 'Technical',
            questions: [
                {
                    q: 'Do you have an API?',
                    a: 'Yes, Pro and Enterprise plans include API access. Our REST API allows you to integrate our signals into your own applications.'
                },
                {
                    q: 'How fast are the signals?',
                    a: 'Our platform provides sub-second analysis with real-time WebSocket updates for instant notifications.'
                },
                {
                    q: 'Is my data secure?',
                    a: 'Yes, we use bank-level encryption, SOC 2 compliance, and industry-standard security practices to protect your data.'
                }
            ]
        }
    ]

    return (
        <div className="min-h-screen bg-primary-900">
            <Navigation />

            <section className="pt-32 pb-20 px-4">
                <div className="container mx-auto max-w-4xl">
                    <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 text-center">
                        Frequently Asked Questions
                    </h1>
                    <p className="text-xl text-gray-400 text-center mb-12">
                        Find answers to common questions about our platform
                    </p>

                    <div className="space-y-8">
                        {faqs.map((category, catIndex) => (
                            <div key={catIndex}>
                                <h2 className="text-2xl font-bold text-white mb-4">{category.category}</h2>
                                <div className="space-y-4">
                                    {category.questions.map((faq, qIndex) => {
                                        const globalIndex = catIndex * 100 + qIndex
                                        const isOpen = openIndex === globalIndex

                                        return (
                                            <div
                                                key={qIndex}
                                                className="bg-primary-800/60 border border-white/10 rounded-xl overflow-hidden"
                                            >
                                                <button
                                                    onClick={() => setOpenIndex(isOpen ? null : globalIndex)}
                                                    className="w-full p-6 text-left flex items-center justify-between hover:bg-white/5 transition-colors"
                                                >
                                                    <span className="text-lg font-semibold text-white pr-8">{faq.q}</span>
                                                    <ChevronDown
                                                        className={`text-gray-400 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''
                                                            }`}
                                                        size={24}
                                                    />
                                                </button>
                                                {isOpen && (
                                                    <div className="px-6 pb-6">
                                                        <p className="text-gray-300">{faq.a}</p>
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    })}
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
