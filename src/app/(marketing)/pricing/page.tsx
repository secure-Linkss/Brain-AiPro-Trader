import Navigation from '@/components/layout/Navigation'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'
import { Check, X } from 'lucide-react'

export default function PricingPage() {
    const plans = [
        {
            name: 'Free',
            price: '$0',
            period: 'forever',
            description: 'Perfect for getting started with AI trading',
            features: [
                '10 signals per day',
                'Basic pattern detection',
                '3 watchlists',
                '5 symbols per watchlist',
                'Email notifications',
                'Community support'
            ],
            notIncluded: [
                'Advanced harmonic patterns',
                'Real-time alerts',
                'Priority support',
                'API access'
            ],
            cta: 'Get Started',
            href: '/register',
            popular: false
        },
        {
            name: 'Pro',
            price: '$49',
            period: 'per month',
            description: 'For serious traders who need advanced features',
            features: [
                '100 signals per day',
                'All pattern types',
                '10 watchlists',
                '20 symbols per watchlist',
                'Real-time SMS + Email alerts',
                'Advanced indicators',
                'Backtesting engine',
                'Multi-timeframe analysis',
                'Priority support',
                'API access'
            ],
            notIncluded: [],
            cta: 'Start Pro',
            href: '/register?plan=pro',
            popular: true
        },
        {
            name: 'Enterprise',
            price: '$199',
            period: 'per month',
            description: 'For professional traders and institutions',
            features: [
                'Unlimited signals',
                'All Pro features',
                'Unlimited watchlists',
                'Unlimited symbols',
                'Telegram integration',
                'Custom strategies',
                'Dedicated account manager',
                'White-label options',
                '24/7 priority support',
                'Advanced API access',
                'Custom integrations'
            ],
            notIncluded: [],
            cta: 'Contact Sales',
            href: '/contact',
            popular: false
        }
    ]

    return (
        <div className="min-h-screen bg-primary-900">
            <Navigation />

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-4">
                <div className="container mx-auto text-center">
                    <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
                        Simple, Transparent Pricing
                    </h1>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-12">
                        Choose the plan that fits your trading needs. No hidden fees, cancel anytime.
                    </p>
                </div>
            </section>

            {/* Pricing Cards */}
            <section className="pb-20 px-4">
                <div className="container mx-auto">
                    <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {plans.map((plan, index) => (
                            <div
                                key={index}
                                className={`relative p-8 rounded-2xl border transition-all hover:-translate-y-2 ${plan.popular
                                        ? 'bg-gradient-to-b from-blue-600/20 to-purple-600/20 border-blue-500'
                                        : 'bg-primary-800/60 border-white/10 hover:border-white/20'
                                    }`}
                            >
                                {plan.popular && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-semibold rounded-full">
                                        Most Popular
                                    </div>
                                )}

                                <div className="text-center mb-8">
                                    <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                                    <p className="text-gray-400 text-sm mb-4">{plan.description}</p>
                                    <div className="flex items-baseline justify-center gap-2">
                                        <span className="text-5xl font-bold text-white">{plan.price}</span>
                                        <span className="text-gray-400">/ {plan.period}</span>
                                    </div>
                                </div>

                                <Link
                                    href={plan.href}
                                    className={`block w-full py-3 text-center font-semibold rounded-lg mb-8 transition-all ${plan.popular
                                            ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-lg hover:shadow-blue-500/50'
                                            : 'bg-white/5 border border-white/20 text-white hover:bg-white/10'
                                        }`}
                                >
                                    {plan.cta}
                                </Link>

                                <div className="space-y-4">
                                    <p className="text-sm font-semibold text-gray-300 uppercase tracking-wide">What's included:</p>
                                    {plan.features.map((feature, i) => (
                                        <div key={i} className="flex items-start gap-3">
                                            <Check className="text-green-500 flex-shrink-0 mt-0.5" size={20} />
                                            <span className="text-gray-300">{feature}</span>
                                        </div>
                                    ))}
                                    {plan.notIncluded.length > 0 && (
                                        <>
                                            <p className="text-sm font-semibold text-gray-400 uppercase tracking-wide mt-6">Not included:</p>
                                            {plan.notIncluded.map((feature, i) => (
                                                <div key={i} className="flex items-start gap-3">
                                                    <X className="text-gray-600 flex-shrink-0 mt-0.5" size={20} />
                                                    <span className="text-gray-500">{feature}</span>
                                                </div>
                                            ))}
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-20 px-4 bg-primary-800/50">
                <div className="container mx-auto max-w-3xl">
                    <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-12">
                        Frequently Asked Questions
                    </h2>
                    <div className="space-y-6">
                        {[
                            {
                                q: 'Can I change plans later?',
                                a: 'Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.'
                            },
                            {
                                q: 'What payment methods do you accept?',
                                a: 'We accept all major credit cards, PayPal, and cryptocurrency payments.'
                            },
                            {
                                q: 'Is there a refund policy?',
                                a: 'Yes, we offer a 30-day money-back guarantee if you\'re not satisfied with our service.'
                            },
                            {
                                q: 'Do you offer discounts for annual billing?',
                                a: 'Yes, save 20% when you choose annual billing instead of monthly.'
                            }
                        ].map((faq, index) => (
                            <div key={index} className="p-6 bg-primary-800/60 border border-white/10 rounded-xl">
                                <h3 className="text-lg font-semibold text-white mb-2">{faq.q}</h3>
                                <p className="text-gray-400">{faq.a}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    )
}
