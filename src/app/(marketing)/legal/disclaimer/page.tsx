import Link from "next/link"
import { Footer } from "@/components/footer"
import { AlertTriangle } from "lucide-react"

export default function RiskDisclaimerPage() {
    return (
        <div className="flex flex-col min-h-screen bg-slate-950 text-white">
            <header className="px-4 lg:px-6 h-16 flex items-center border-b border-slate-800">
                <Link className="font-bold text-xl bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent" href="/">
                    Brain AiPro Trader
                </Link>
                <nav className="ml-auto flex gap-4 sm:gap-6">
                    <Link className="text-sm font-medium hover:text-blue-400 transition-colors" href="/">Home</Link>
                    <Link className="text-sm font-medium hover:text-blue-400 transition-colors" href="/contact">Contact</Link>
                </nav>
            </header>

            <main className="flex-1 py-12 md:py-16 container px-4 md:px-6 max-w-4xl mx-auto">
                <div className="flex items-center gap-3 mb-6">
                    <AlertTriangle className="h-10 w-10 text-red-500" />
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
                        Risk Disclaimer
                    </h1>
                </div>
                <p className="text-slate-400 mb-8">Effective Date: November 30, 2025</p>

                <div className="bg-red-900/20 border-2 border-red-500 p-6 rounded-lg mb-8">
                    <p className="text-red-200 font-bold text-lg mb-2">⚠️ IMPORTANT WARNING</p>
                    <p className="text-red-300 leading-relaxed">
                        Trading financial instruments, including forex, cryptocurrencies, stocks, commodities, and derivatives, carries a high level of risk and may result in the loss of all your invested capital. You should not invest money that you cannot afford to lose.
                    </p>
                </div>

                <div className="prose prose-invert max-w-none space-y-8">
                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-white">1. No Guarantee of Profit</h2>
                        <p className="text-slate-300 leading-relaxed">
                            Brain AiPro Trader provides trading signals, market analysis, and educational content powered by artificial intelligence and algorithmic systems. However:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-slate-300 ml-4">
                            <li>We do NOT guarantee profits or specific results</li>
                            <li>Past performance is NOT indicative of future results</li>
                            <li>Advertised performance metrics are based on backtesting and simulated trading, not live trading</li>
                            <li>Individual results will vary based on market conditions, execution timing, broker spreads, and personal trading decisions</li>
                            <li>AI algorithms can and do make errors, experience bugs, or fail to adapt to unprecedented market conditions</li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-white">2. Substantial Risk of Loss</h2>
                        <p className="text-slate-300 leading-relaxed">
                            Trading involves significant risks, including but not limited to:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-slate-300 ml-4">
                            <li><strong>Market Risk:</strong> Prices can move rapidly and unpredictably against your position</li>
                            <li><strong>Leverage Risk:</strong> Leveraged trading can amplify losses beyond your initial investment</li>
                            <li><strong>Liquidity Risk:</strong> You may not be able to exit positions at desired prices during volatile markets</li>
                            <li><strong>Gap Risk:</strong> Markets can gap over weekends or news events, bypassing stop-loss orders</li>
                            <li><strong>Technology Risk:</strong> Platform outages, internet connectivity issues, or execution delays can result in losses</li>
                            <li><strong>Counterparty Risk:</strong> Your broker or exchange could experience financial difficulties or insolvency</li>
                            <li><strong>Regulatory Risk:</strong> Changes in laws or regulations could impact your ability to trade certain assets</li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-white">3. AI and Algorithm Limitations</h2>
                        <p className="text-slate-300 leading-relaxed">
                            Our platform uses advanced AI and machine learning models. You should understand that:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-slate-300 ml-4">
                            <li>AI models are trained on historical data and may not predict unprecedented events ("black swan" events)</li>
                            <li>Algorithms can experience bugs, errors, or unexpected behavior</li>
                            <li>AI predictions have inherent uncertainty and margin of error</li>
                            <li>Model performance can degrade over time as market dynamics change</li>
                            <li>Overfitting to historical data can lead to poor live performance</li>
                            <li>Signal delays or execution slippage can significantly impact profitability</li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-white">4. Not Investment Advice</h2>
                        <p className="text-slate-300 leading-relaxed">
                            Brain AiPro Trader is an informational service and does NOT provide:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-slate-300 ml-4">
                            <li>Personalized investment advice</li>
                            <li>Financial planning or portfolio management</li>
                            <li>Tax, legal, or accounting advice</li>
                            <li>Recommendations tailored to your individual circumstances</li>
                        </ul>
                        <p className="text-slate-300 leading-relaxed mt-4">
                            All content is for educational and informational purposes only. You are solely responsible for evaluating signals, conducting your own research, and making your own trading decisions.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-white">5. Forex Trading Risks</h2>
                        <p className="text-slate-300 leading-relaxed">
                            Foreign exchange (forex) trading involves specific risks:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-slate-300 ml-4">
                            <li>Currency pairs can be highly volatile, especially during economic releases</li>
                            <li>Forex trading is typically highly leveraged (up to 1:500), magnifying both gains and losses</li>
                            <li>Interest rate differentials (carry trades) expose you to swap/rollover fees</li>
                            <li>Currency markets can be influenced by geopolitical events beyond predictive modeling</li>
                            <li>Retail forex traders statistically lose money more often than institutional traders</li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-white">6. Cryptocurrency Trading Risks</h2>
                        <p className="text-slate-300 leading-relaxed">
                            Cryptocurrency trading involves extreme risks:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-slate-300 ml-4">
                            <li>Cryptocurrencies are highly volatile and can lose significant value rapidly</li>
                            <li>Crypto markets operate 24/7 with no circuit breakers, allowing unlimited downside</li>
                            <li>Exchanges can be hacked, experience outages, or become insolvent</li>
                            <li>Regulatory changes can impact crypto values overnight</li>
                            <li>Many cryptocurrencies have low liquidity and can be susceptible to manipulation</li>
                            <li>Blockchain technology is still evolving and may have undiscovered vulnerabilities</li>
                            <li>Lost private keys result in permanent, irrecoverable loss of funds</li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-white">7. Stock and Commodities Trading Risks</h2>
                        <p className="text-slate-300 leading-relaxed">
                            Trading equities and commodities carries significant risks:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-slate-300 ml-4">
                            <li>Individual stocks can become worthless if companies go bankrupt</li>
                            <li>Commodities can experience supply/demand shocks from weather, geopolitics, or disasters</li>
                            <li>After-hours and pre-market trading have lower liquidity and wider spreads</li>
                            <li>Corporate actions (splits, dividends, mergers) can impact positions unexpectedly</li>
                            <li>Options and futures can expire worthless, resulting in total loss of premium</li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-white">8. Broker and Execution Risks</h2>
                        <p className="text-slate-300 leading-relaxed">
                            Your choice of broker and order execution can significantly impact results:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-slate-300 ml-4">
                            <li>Different brokers have different spreads, commissions, and execution speeds</li>
                            <li>Slippage (difference between expected and actual execution price) can occur, especially during volatile markets</li>
                            <li>Stop-loss orders are not guaranteed and may be filled at worse prices than expected</li>
                            <li>Broker platforms can experience technical issues or downtime</li>
                            <li>Not all brokers are equally regulated or reputable</li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-white">9. Testimonials and Performance Claims</h2>
                        <p className="text-slate-300 leading-relaxed">
                            Any testimonials or performance statistics featured on our platform:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-slate-300 ml-4">
                            <li>Represent individual experiences and may not be typical</li>
                            <li>Are not verified or audited by third parties</li>
                            <li>May include simulated or backtested results, not live trading</li>
                            <li>Do not account for varying trading capital, risk tolerance, or execution quality</li>
                            <li>Should not be construed as a promise or guarantee of similar results</li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-white">10. Suitability and Sophistication</h2>
                        <p className="text-slate-300 leading-relaxed">
                            Trading may not be suitable for everyone. Before trading, consider:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-slate-300 ml-4">
                            <li>Your investment objectives and financial goals</li>
                            <li>Your level of trading experience and market knowledge</li>
                            <li>Your risk tolerance and ability to sustain losses</li>
                            <li>Whether you can afford to lose your entire investment</li>
                            <li>Your time availability to monitor positions and markets</li>
                        </ul>
                        <p className="text-slate-300 leading-relaxed mt-4">
                            If you are unsure whether trading is appropriate for you, consult an independent financial advisor.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-white">11. No Liability for Losses</h2>
                        <p className="text-slate-300 leading-relaxed">
                            Brain AiPro Trader and its affiliates, employees, and partners:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-slate-300 ml-4">
                            <li>Are NOT liable for any trading losses you incur</li>
                            <li>Do NOT take responsibility for decisions made based on our signals or analysis</li>
                            <li>Are NOT responsible for errors, omissions, or delays in our services</li>
                            <li>Are NOT responsible for third-party integrations (brokers, data providers)</li>
                            <li>Provide services on an "as is" basis without warranties of any kind</li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-white">12. Regulatory Disclosure</h2>
                        <p className="text-slate-300 leading-relaxed">
                            Important regulatory information:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-slate-300 ml-4">
                            <li>Brain AiPro Trader is NOT a registered investment advisor (RIA) or broker-dealer</li>
                            <li>We do NOT hold or manage customer funds</li>
                            <li>We are NOT regulated by the SEC, FINRA, CFTC, FCA, or any financial regulatory body</li>
                            <li>We do NOT provide services in jurisdictions where such services would be illegal</li>
                            <li>Users are responsible for complying with their local laws and regulations</li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-white">13. Acknowledgment of Risk</h2>
                        <div className="bg-red-900/20 border border-red-500 p-6 rounded-lg">
                            <p className="text-red-200 leading-relaxed font-semibold">
                                BY USING BRAIN AIPRO TRADER, YOU ACKNOWLEDGE AND ACCEPT THAT:
                            </p>
                            <ul className="list-disc list-inside space-y-2 text-red-200 ml-4 mt-4">
                                <li>You understand the substantial risks involved in trading</li>
                                <li>You can afford to lose your entire investment</li>
                                <li>You are solely responsible for your trading decisions and outcomes</li>
                                <li>You will not hold Brain AiPro Trader liable for any losses</li>
                                <li>You have read and understood this Risk Disclaimer</li>
                            </ul>
                        </div>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-white">14. Further Information</h2>
                        <p className="text-slate-300 leading-relaxed">
                            For educational resources on trading risks and risk management, we recommend:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-slate-300 ml-4">
                            <li>SEC Investor Education: <a href="https://www.investor.gov" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">www.investor.gov</a></li>
                            <li>CFTC Education Center: <a href="https://www.cftc.gov/ConsumerProtection" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">www.cftc.gov</a></li>
                            <li>FINRA Investor Alerts: <a href="https://www.finra.org/investors" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">www.finra.org</a></li>
                        </ul>
                    </section>

                    <div className="mt-8 p-6 bg-slate-900 border border-slate-700 rounded-lg">
                        <p className="text-slate-300 text-sm">
                            <strong className="text-white">Questions?</strong> If you have any questions about these risks or need clarification, please contact us at{" "}
                            <a href="mailto:risk@brainai.com" className="text-blue-400 hover:underline">risk@brainai.com</a>
                        </p>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}
