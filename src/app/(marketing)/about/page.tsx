import Navigation from '@/components/layout/Navigation'
import Footer from '@/components/layout/Footer'

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-slate-950">
            <Navigation />

            <section className="pt-32 pb-20 px-4">
                <div className="container mx-auto max-w-4xl">
                    <h1 className="text-5xl md:text-6xl font-bold text-white mb-8">About Brain AiPro Trader</h1>

                    <div className="space-y-6 text-gray-300 text-lg">
                        <p>
                            Brain AiPro Trader is a cutting-edge AI-powered trading analysis platform designed to help traders make smarter, data-driven decisions in the financial markets.
                        </p>

                        <p>
                            Founded in 2024, our mission is to democratize access to institutional-grade trading intelligence by combining advanced machine learning, technical analysis, and real-time market data.
                        </p>

                        <h2 className="text-3xl font-bold text-white mt-12 mb-6">Our Technology</h2>
                        <p>
                            Our platform leverages state-of-the-art AI algorithms trained on millions of historical market patterns. We use advanced harmonic pattern detection, ensemble voting systems, and multi-strategy analysis to generate high-confidence trading signals.
                        </p>

                        <h2 className="text-3xl font-bold text-white mt-12 mb-6">Why Choose Us</h2>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3">
                                <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                                <span><strong className="text-white">Advanced AI:</strong> Machine learning models trained on decades of market data</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                                <span><strong className="text-white">Real-Time Analysis:</strong> Sub-second response times for instant insights</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                                <span><strong className="text-white">Proven Results:</strong> 75%+ win rate across backtested strategies</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                                <span><strong className="text-white">Enterprise Security:</strong> Bank-level encryption and SOC 2 compliance</span>
                            </li>
                        </ul>

                        <h2 className="text-3xl font-bold text-white mt-12 mb-6">Our Commitment</h2>
                        <p>
                            We're committed to continuous improvement and innovation. Our team of experienced traders, data scientists, and engineers work tirelessly to enhance our platform and provide you with the best possible trading experience.
                        </p>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    )
}
