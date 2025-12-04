import Navigation from '@/components/layout/Navigation'
import Footer from '@/components/layout/Footer'
import { AlertTriangle } from 'lucide-react'

export default function DisclaimerPage() {
    return (
        <div className="min-h-screen bg-primary-900">
            <Navigation />

            <section className="pt-32 pb-20 px-4">
                <div className="container mx-auto max-w-4xl">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-16 h-16 bg-yellow-500/20 border border-yellow-500/50 rounded-xl flex items-center justify-center">
                            <AlertTriangle className="text-yellow-500" size={32} />
                        </div>
                        <div>
                            <h1 className="text-5xl font-bold text-white">Risk Disclaimer</h1>
                            <p className="text-gray-400 mt-2">Last updated: December 4, 2025</p>
                        </div>
                    </div>

                    <div className="p-6 bg-yellow-500/10 border border-yellow-500/30 rounded-xl mb-8">
                        <p className="text-yellow-200 font-semibold">
                            ⚠️ IMPORTANT: Trading involves substantial risk of loss and is not suitable for every investor. Please read this disclaimer carefully.
                        </p>
                    </div>

                    <div className="space-y-8 text-gray-300">
                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">1. General Risk Warning</h2>
                            <p className="mb-4">
                                Trading in financial markets carries a high level of risk and may not be suitable for all investors. The high degree of leverage can work against you as well as for you. Before deciding to trade, you should carefully consider your investment objectives, level of experience, and risk appetite.
                            </p>
                            <p>
                                <strong className="text-white">You should be aware of all the risks associated with trading and seek advice from an independent financial advisor if you have any doubts.</strong>
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">2. No Investment Advice</h2>
                            <p className="mb-4">
                                Brain AiPro Trader provides analysis tools, signals, and market insights for informational and educational purposes only. <strong className="text-white">We do not provide investment advice, financial advice, trading advice, or any other sort of advice.</strong>
                            </p>
                            <p>
                                All content and signals provided through our Service should not be construed as a recommendation to buy or sell any financial instrument. You should not rely solely on our signals or analysis to make trading decisions.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">3. Past Performance</h2>
                            <p>
                                <strong className="text-white">Past performance is not indicative of future results.</strong> Historical data, backtesting results, and performance statistics presented on our platform are for informational purposes only and do not guarantee future performance.
                            </p>
                            <p className="mt-4">
                                Hypothetical or simulated performance results have certain limitations. Unlike actual performance records, simulated results do not represent actual trading and may not reflect the impact of market conditions, liquidity, or other real-world factors.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">4. Risk of Loss</h2>
                            <p className="mb-4">
                                <strong className="text-white">You can lose some or all of your investment.</strong> Key risks include:
                            </p>
                            <ul className="space-y-2 ml-6">
                                <li className="flex items-start gap-2">
                                    <span className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                                    <span><strong className="text-white">Market Risk:</strong> Prices can move against your position</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                                    <span><strong className="text-white">Leverage Risk:</strong> Magnifies both gains and losses</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                                    <span><strong className="text-white">Liquidity Risk:</strong> Inability to exit positions at desired prices</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                                    <span><strong className="text-white">Volatility Risk:</strong> Rapid and unpredictable price movements</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                                    <span><strong className="text-white">Technology Risk:</strong> System failures or connectivity issues</span>
                                </li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">5. Accuracy of Information</h2>
                            <p>
                                While we strive to provide accurate and timely information, we make no warranties or representations regarding the accuracy, completeness, or timeliness of any information provided through our Service. Market data, signals, and analysis may contain errors or delays.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">6. No Guaranteed Returns</h2>
                            <p>
                                <strong className="text-white">We do not guarantee any specific returns or profits.</strong> Any claims of potential returns or win rates are based on historical backtesting and do not guarantee future performance. Individual results may vary significantly.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">7. Regulatory Compliance</h2>
                            <p className="mb-4">
                                Brain AiPro Trader is a technology platform providing analysis tools. We are not:
                            </p>
                            <ul className="space-y-2 ml-6">
                                <li className="flex items-start gap-2">
                                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                                    <span>A registered investment advisor</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                                    <span>A broker-dealer</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                                    <span>A financial institution</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                                    <span>Regulated by any financial authority</span>
                                </li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">8. User Responsibility</h2>
                            <p className="mb-4">
                                By using our Service, you acknowledge and agree that:
                            </p>
                            <ul className="space-y-2 ml-6">
                                <li className="flex items-start gap-2">
                                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                                    <span>You are solely responsible for your trading decisions</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                                    <span>You understand the risks involved in trading</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                                    <span>You will not hold us liable for any losses</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                                    <span>You will conduct your own due diligence</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                                    <span>You will comply with all applicable laws and regulations</span>
                                </li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">9. Jurisdictional Restrictions</h2>
                            <p>
                                Our Service may not be available in all jurisdictions. It is your responsibility to ensure that your use of our Service complies with local laws and regulations. We do not make any representation that our Service is appropriate or available for use in all locations.
                            </p>
                        </section>

                        <section className="p-6 bg-red-500/10 border border-red-500/30 rounded-xl">
                            <h2 className="text-2xl font-bold text-white mb-4">⚠️ Final Warning</h2>
                            <p className="text-red-200">
                                <strong>Only risk capital you can afford to lose.</strong> Trading with money you cannot afford to lose can lead to severe financial hardship. Never invest money needed for living expenses, retirement, or emergency funds.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">10. Contact</h2>
                            <p>
                                For questions about this disclaimer, contact us at{' '}
                                <a href="mailto:legal@brainaipro.com" className="text-blue-400 hover:text-blue-300">
                                    legal@brainaipro.com
                                </a>
                            </p>
                        </section>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    )
}
