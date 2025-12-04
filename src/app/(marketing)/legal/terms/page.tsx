import Navigation from '@/components/layout/Navigation'
import Footer from '@/components/layout/Footer'

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-primary-900">
            <Navigation />

            <section className="pt-32 pb-20 px-4">
                <div className="container mx-auto max-w-4xl">
                    <h1 className="text-5xl font-bold text-white mb-8">Terms of Service</h1>
                    <p className="text-gray-400 mb-8">Last updated: December 4, 2025</p>

                    <div className="space-y-8 text-gray-300">
                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">1. Acceptance of Terms</h2>
                            <p>
                                By accessing and using Brain AiPro Trader ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to these Terms of Service, please do not use the Service.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">2. Description of Service</h2>
                            <p className="mb-4">
                                Brain AiPro Trader provides AI-powered trading analysis, signals, and market insights. Our services include but are not limited to:
                            </p>
                            <ul className="space-y-2 ml-6">
                                <li className="flex items-start gap-2">
                                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                                    <span>Real-time trading signals and pattern detection</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                                    <span>Technical analysis and market insights</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                                    <span>Backtesting and strategy optimization</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                                    <span>API access for automated trading systems</span>
                                </li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">3. User Accounts</h2>
                            <p className="mb-4">To access certain features, you must create an account. You agree to:</p>
                            <ul className="space-y-2 ml-6">
                                <li className="flex items-start gap-2">
                                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                                    <span>Provide accurate, current, and complete information</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                                    <span>Maintain the security of your password and account</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                                    <span>Promptly update account information to keep it accurate</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                                    <span>Accept responsibility for all activities under your account</span>
                                </li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">4. Subscription and Payment</h2>
                            <div className="space-y-4">
                                <p><strong className="text-white">4.1 Subscription Plans:</strong> We offer Free, Pro, and Enterprise subscription plans with varying features and limitations.</p>
                                <p><strong className="text-white">4.2 Payment:</strong> Paid subscriptions are billed in advance on a monthly or annual basis. All fees are non-refundable except as required by law or as explicitly stated in our refund policy.</p>
                                <p><strong className="text-white">4.3 Auto-Renewal:</strong> Subscriptions automatically renew unless cancelled before the renewal date.</p>
                                <p><strong className="text-white">4.4 Price Changes:</strong> We reserve the right to modify subscription fees with 30 days advance notice.</p>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">5. Acceptable Use</h2>
                            <p className="mb-4">You agree NOT to:</p>
                            <ul className="space-y-2 ml-6">
                                <li className="flex items-start gap-2">
                                    <span className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                                    <span>Use the Service for any illegal purpose</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                                    <span>Attempt to gain unauthorized access to our systems</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                                    <span>Reverse engineer, decompile, or disassemble the Service</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                                    <span>Share your account credentials with others</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                                    <span>Use automated systems to access the Service beyond API limits</span>
                                </li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">6. Intellectual Property</h2>
                            <p>
                                All content, features, and functionality of the Service are owned by Brain AiPro Trader and are protected by international copyright, trademark, and other intellectual property laws. You may not copy, modify, distribute, sell, or lease any part of our Service without explicit written permission.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">7. Limitation of Liability</h2>
                            <p className="mb-4">
                                TO THE MAXIMUM EXTENT PERMITTED BY LAW, BRAIN AIPRO TRADER SHALL NOT BE LIABLE FOR:
                            </p>
                            <ul className="space-y-2 ml-6">
                                <li className="flex items-start gap-2">
                                    <span className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0" />
                                    <span>Any trading losses or financial damages</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0" />
                                    <span>Indirect, incidental, or consequential damages</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0" />
                                    <span>Service interruptions or data loss</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0" />
                                    <span>Third-party actions or content</span>
                                </li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">8. Termination</h2>
                            <p>
                                We reserve the right to suspend or terminate your account at any time for violation of these Terms, fraudulent activity, or any other reason we deem necessary. You may cancel your account at any time through your account settings.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">9. Changes to Terms</h2>
                            <p>
                                We reserve the right to modify these Terms at any time. We will notify users of significant changes via email or through the Service. Continued use of the Service after changes constitutes acceptance of the modified Terms.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">10. Governing Law</h2>
                            <p>
                                These Terms shall be governed by and construed in accordance with the laws of the State of California, United States, without regard to its conflict of law provisions.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">11. Contact Information</h2>
                            <p>
                                For questions about these Terms, please contact us at{' '}
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
