'use client'

import Navigation from '@/components/layout/Navigation'
import Footer from '@/components/layout/Footer'
import { AlertTriangle } from 'lucide-react'

export default function DisclaimerPage() {
    return (
        <div className="min-h-screen bg-slate-950">
            <Navigation />

            <section className="pt-32 pb-20 px-4">
                <div className="container mx-auto max-w-4xl text-gray-300">
                    <h1 className="text-4xl font-bold text-white mb-8">Risk Disclaimer</h1>
                    <p className="mb-4 text-sm text-gray-500">Last Updated: December 9, 2025</p>

                    <div className="bg-red-900/20 border border-red-500/30 rounded-2xl p-8 mb-8">
                        <div className="flex items-start gap-4">
                            <AlertTriangle className="text-red-500 flex-shrink-0" size={32} />
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-4">High Risk Investment Warning</h2>
                                <p className="text-gray-200 leading-relaxed">
                                    Trading foreign exchange (Forex) and cryptocurrencies on margin carries a high level of risk and may not be suitable for all investors. The high degree of leverage can work against you as well as for you. Before deciding to trade, you should carefully consider your investment objectives, level of experience, and risk appetite.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-8">
                        <div className="bg-slate-900/50 p-8 rounded-xl border border-white/10">
                            <h2 className="text-2xl font-bold text-white mb-4">Not Financial Advice</h2>
                            <p className="mb-4">
                                The information provided by Brain AiPro Trader is for educational and informational purposes only. It should not be considered as financial or investment advice. We do not guarantee any specific results or profits.
                            </p>
                        </div>

                        <div className="bg-slate-900/50 p-8 rounded-xl border border-white/10">
                            <h2 className="text-2xl font-bold text-white mb-4">No Guarantees</h2>
                            <p className="mb-4">
                                Past performance of any trading system or methodology is not necessarily indicative of future results. There is no guarantee that you will earn any money using the techniques and ideas in these materials.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    )
}
