'use client'

import Navigation from '@/components/layout/Navigation'
import Footer from '@/components/layout/Footer'

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-slate-950">
            <Navigation />

            <section className="pt-32 pb-20 px-4">
                <div className="container mx-auto max-w-4xl text-gray-300">
                    <h1 className="text-4xl font-bold text-white mb-8">Terms of Service</h1>
                    <p className="mb-4 text-sm text-gray-500">Last Updated: December 9, 2025</p>

                    <div className="space-y-8">
                        <div className="bg-slate-900/50 p-8 rounded-xl border border-white/10">
                            <h2 className="text-2xl font-bold text-white mb-4">1. Acceptance of Terms</h2>
                            <p className="mb-4">
                                By accessing and using Brain AiPro Trader, you accept and agree to be bound by the terms and provision of this agreement. In addition, when using these particular services, you shall be subject to any posted guidelines or rules applicable to such services.
                            </p>
                        </div>

                        <div className="bg-slate-900/50 p-8 rounded-xl border border-white/10">
                            <h2 className="text-2xl font-bold text-white mb-4">2. Trading Risks</h2>
                            <p className="mb-4">
                                Trading cryptocurrencies and financial instruments involves a high degree of risk and may not be suitable for all investors. You should carefully consider your investment objectives, level of experience, and risk appetite before deciding to trade.
                            </p>
                            <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-lg text-red-200 text-sm">
                                <strong>Warning:</strong> You could sustain a loss of some or all of your initial investment and therefore you should not invest money that you cannot afford to lose.
                            </div>
                        </div>

                        <div className="bg-slate-900/50 p-8 rounded-xl border border-white/10">
                            <h2 className="text-2xl font-bold text-white mb-4">3. Use of Services</h2>
                            <p className="mb-4">
                                Our services are provided "as is" and "as available". We do not warrant that the service will be uninterrupted, timely, secure, or error-free. We reserve the right to modify or discontinue the service at any time.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    )
}
