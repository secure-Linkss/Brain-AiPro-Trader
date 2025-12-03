import Link from "next/link"
import { Footer } from "@/components/footer"

export default function TermsOfServicePage() {
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
                <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    Terms of Service
                </h1>
                <p className="text-slate-400 mb-8">Last updated: November 29, 2025</p>

                <div className="prose prose-invert max-w-none space-y-8">
                    {/* Introduction */}
                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-white">1. Agreement to Terms</h2>
                        <p className="text-slate-300 leading-relaxed">
                            These Terms of Service ("Terms") govern your access to and use of Brain AiPro Trader's website, platform, and services (collectively, the "Services"). By accessing or using the Services, you agree to be bound by these Terms and our <Link href="/legal/privacy" className="text-blue-400 hover:underline">Privacy Policy</Link>.
                        </p>
                        <p className="text-slate-300 leading-relaxed">
                            IF YOU DO NOT AGREE TO THESE TERMS, DO NOT ACCESS OR USE THE SERVICES.
                        </p>
                    </section>

                    {/* Eligibility */}
                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-white">2. Eligibility</h2>
                        <p className="text-slate-300 leading-relaxed">
                            To use our Services, you must:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-slate-300 ml-4">
                            <li>Be at least 18 years old</li>
                            <li>Have the legal capacity to enter into binding contracts</li>
                            <li>Not be prohibited from using the Services under applicable law</li>
                            <li>Reside in a jurisdiction where our Services are legally available</li>
                            <li>Comply with all local laws and regulations related to trading and financial services</li>
                        </ul>
                        <p className="text-slate-300 leading-relaxed mt-4">
                            We reserve the right to verify your identity and may request documentation to confirm compliance with these requirements.
                        </p>
                    </section>

                    {/* Account Registration */}
                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-white">3. Account Registration and Security</h2>

                        <h3 className="text-xl font-semibold text-white">3.1 Account Creation</h3>
                        <p className="text-slate-300 leading-relaxed">
                            To access certain features, you must register for an account. You agree to:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-slate-300 ml-4">
                            <li>Provide accurate, current, and complete information</li>
                            <li>Maintain and update your information to keep it accurate</li>
                            <li>Maintain the security and confidentiality of your password</li>
                            <li>Notify us immediately of any unauthorized access</li>
                            <li>Be responsible for all activities under your account</li>
                        </ul>

                        <h3 className="text-xl font-semibold text-white mt-6">3.2 Account Suspension and Termination</h3>
                        <p className="text-slate-300 leading-relaxed">
                            We reserve the right to suspend or terminate your account at any time for:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-slate-300 ml-4">
                            <li>Violation of these Terms</li>
                            <li>Fraudulent or illegal activity</li>
                            <li>Non-payment of subscription fees</li>
                            <li>Abuse of the platform or other users</li>
                            <li>Any reason at our sole discretion with or without notice</li>
                        </ul>
                    </section>

                    {/* Subscription and Payment */}
                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-white">4. Subscription Plans and Payment</h2>

                        <h3 className="text-xl font-semibold text-white">4.1 Subscription Fees</h3>
                        <p className="text-slate-300 leading-relaxed">
                            Access to certain features requires a paid subscription. By subscribing, you agree to:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-slate-300 ml-4">
                            <li>Pay all applicable subscription fees</li>
                            <li>Provide valid payment information</li>
                            <li>Authorize automatic recurring billing</li>
                            <li>Pay all taxes and transaction fees</li>
                        </ul>

                        <h3 className="text-xl font-semibold text-white mt-6">4.2 Billing and Renewal</h3>
                        <p className="text-slate-300 leading-relaxed">
                            Subscriptions automatically renew at the end of each billing period unless cancelled. You will be charged the then-current subscription rate. We will notify you of price changes at least 30 days in advance.
                        </p>

                        <h3 className="text-xl font-semibold text-white mt-6">4.3 Cancellation and Refunds</h3>
                        <ul className="list-disc list-inside space-y-2 text-slate-300 ml-4">
                            <li><strong>Cancellation:</strong> You may cancel your subscription at any time from your account settings. Cancellation takes effect at the end of the current billing period.</li>
                            <li><strong>Refunds:</strong> We offer a 7-day money-back guarantee for new subscriptions. After 7 days, no refunds will be provided for partial months or unused portions of the subscription.</li>
                            <li><strong>Exceptions:</strong> Refunds may be considered on a case-by-case basis for technical issues that prevent use of the Services.</li>
                        </ul>

                        <h3 className="text-xl font-semibold text-white mt-6">4.4 Free Trials</h3>
                        <p className="text-slate-300 leading-relaxed">
                            Free trials are offered at our discretion and limited to one per user. You must provide payment information to start a free trial. If you do not cancel before the trial ends, you will be charged for a full subscription.
                        </p>
                    </section>

                    {/* Use of Services */}
                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-white">5. Acceptable Use</h2>

                        <h3 className="text-xl font-semibold text-white">5.1 Permitted Use</h3>
                        <p className="text-slate-300 leading-relaxed">
                            You may use the Services for:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-slate-300 ml-4">
                            <li>Personal trading analysis and decision-making</li>
                            <li>Receiving trading signals and market insights</li>
                            <li>Accessing educational resources and tools</li>
                            <li>Participating in community discussions</li>
                        </ul>

                        <h3 className="text-xl font-semibold text-white mt-6">5.2 Prohibited Activities</h3>
                        <p className="text-slate-300 leading-relaxed">
                            You agree NOT to:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-slate-300 ml-4">
                            <li>Violate any applicable laws or regulations</li>
                            <li>Infringe on intellectual property rights</li>
                            <li>Share your account credentials with others</li>
                            <li>Reverse engineer, decompile, or disassemble the platform</li>
                            <li>Use automated systems (bots, scrapers) without permission</li>
                            <li>Attempt to gain unauthorized access to our systems</li>
                            <li>Distribute malware or malicious code</li>
                            <li>Manipulate or interfere with the proper functioning of the Services</li>
                            <li>Resell or redistribute our signals, analysis, or content</li>
                            <li>Use the Services for money laundering or terrorist financing</li>
                            <li>Engage in market manipulation or illegal trading practices</li>
                        </ul>
                    </section>

                    {/* Trading Risks */}
                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-white">6. Trading Risks and Disclaimers</h2>

                        <h3 className="text-xl font-semibold text-white">6.1 No Investment Advice</h3>
                        <div className="bg-red-900/20 border border-red-900/50 p-6 rounded-lg">
                            <p className="text-red-200 leading-relaxed font-semibold">
                                BRAIN AIPRO TRADER DOES NOT PROVIDE INVESTMENT, FINANCIAL, TAX, OR LEGAL ADVICE. OUR SERVICES ARE FOR INFORMATIONAL AND EDUCATIONAL PURPOSES ONLY. ALL TRADING SIGNALS AND ANALYSIS ARE AUTOMATED OUTPUTS FROM AI ALGORITHMS AND DO NOT CONSTITUTE PERSONALIZED RECOMMENDATIONS.
                            </p>
                        </div>

                        <h3 className="text-xl font-semibold text-white mt-6">6.2 Risk Warning</h3>
                        <p className="text-slate-300 leading-relaxed">
                            Trading financial instruments involves substantial risk of loss and may not be suitable for all investors. You acknowledge and agree that:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-slate-300 ml-4">
                            <li>You can lose some or all of your invested capital</li>
                            <li>Past performance is not indicative of future results</li>
                            <li>Leverage can amplify both profits and losses</li>
                            <li>Market volatility can result in rapid and significant losses</li>
                            <li>AI algorithms are not infallible and can make incorrect predictions</li>
                            <li>You are solely responsible for your trading decisions</li>
                            <li>You should only trade with money you can afford to lose</li>
                        </ul>

                        <h3 className="text-xl font-semibold text-white mt-6">6.3 Performance Claims</h3>
                        <p className="text-slate-300 leading-relaxed">
                            Any performance statistics, win rates, or profitability claims are:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-slate-300 ml-4">
                            <li>Based on historical backtesting and simulated trading</li>
                            <li>Not guaranteed to continue or be replicated in live trading</li>
                            <li>Subject to change without notice</li>
                            <li>For illustrative purposes only</li>
                        </ul>
                    </section>

                    {/* Intellectual Property */}
                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-white">7. Intellectual Property Rights</h2>

                        <h3 className="text-xl font-semibold text-white">7.1 Our IP</h3>
                        <p className="text-slate-300 leading-relaxed">
                            All content, features, and functionality of the Services, including but not limited to:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-slate-300 ml-4">
                            <li>Software, algorithms, and AI models</li>
                            <li>Trading signals and analysis</li>
                            <li>Text, graphics, logos, and images</li>
                            <li>Databases and compilations</li>
                            <li>Trademarks and branding</li>
                        </ul>
                        <p className="text-slate-300 leading-relaxed mt-4">
                            ...are owned by or licensed to Brain AiPro Trader and protected by copyright, trademark, patent, and other intellectual property laws. Unauthorized use is strictly prohibited.
                        </p>

                        <h3 className="text-xl font-semibold text-white mt-6">7.2 Limited License</h3>
                        <p className="text-slate-300 leading-relaxed">
                            We grant you a limited, non-exclusive, non-transferable, revocable license to access and use the Services for personal, non-commercial purposes in accordance with these Terms. This license does not permit you to:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-slate-300 ml-4">
                            <li>Modify, copy, or create derivative works</li>
                            <li>Distribute, sell, rent, or lease the Services</li>
                            <li>Use our IP for commercial purposes without written permission</li>
                        </ul>

                        <h3 className="text-xl font-semibold text-white mt-6">7.3 User Content</h3>
                        <p className="text-slate-300 leading-relaxed">
                            If you submit content (comments, feedback, suggestions), you grant us a worldwide, royalty-free, perpetual license to use, reproduce, and distribute such content for improving the Services.
                        </p>
                    </section>

                    {/* Limitation of Liability */}
                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-white">8. Limitation of Liability</h2>
                        <div className="bg-yellow-900/20 border border-yellow-900/50 p-6 rounded-lg">
                            <p className="text-yellow-200 leading-relaxed">
                                TO THE MAXIMUM EXTENT PERMITTED BY LAW, BRAIN AIPRO TRADER AND ITS AFFILIATES, OFFICERS, DIRECTORS, EMPLOYEES, AND AGENTS SHALL NOT BE LIABLE FOR:
                            </p>
                            <ul className="list-disc list-inside space-y-2 text-yellow-200 ml-4 mt-4">
                                <li>ANY INDIRECT, INCIDENTAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES</li>
                                <li>LOSS OF PROFITS, REVENUE, DATA, OR USE</li>
                                <li>TRADING LOSSES OR INVESTMENT DECISIONS BASED ON OUR SERVICES</li>
                                <li>UNAUTHORIZED ACCESS TO OR ALTERATION OF YOUR DATA</li>
                                <li>THIRD-PARTY CONTENT OR CONDUCT</li>
                                <li>INTERRUPTION OR TERMINATION OF THE SERVICES</li>
                            </ul>
                            <p className="text-yellow-200 leading-relaxed mt-4">
                                OUR TOTAL LIABILITY SHALL NOT EXCEED THE AMOUNT YOU PAID US IN THE 12 MONTHS PRECEDING THE CLAIM, OR $100 USD, WHICHEVER IS GREATER.
                            </p>
                        </div>
                    </section>

                    {/* Indemnification */}
                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-white">9. Indemnification</h2>
                        <p className="text-slate-300 leading-relaxed">
                            You agree to indemnify, defend, and hold harmless Brain AiPro Trader and its affiliates from any claims, liabilities, damages, losses, and expenses (including legal fees) arising from:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-slate-300 ml-4">
                            <li>Your use or misuse of the Services</li>
                            <li>Violation of these Terms</li>
                            <li>Violation of any third-party rights</li>
                            <li>Your trading activities and decisions</li>
                            <li>Any content you submit or transmit</li>
                        </ul>
                    </section>

                    {/* Disclaimers */}
                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-white">10. Disclaimers</h2>
                        <p className="text-slate-300 leading-relaxed">
                            THE SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-slate-300 ml-4">
                            <li>Merchantability, fitness for a particular purpose, or non-infringement</li>
                            <li>Accuracy, reliability, or completeness of signals or analysis</li>
                            <li>Uninterrupted, secure, or error-free operation</li>
                            <li>Compatibility with your devices or software</li>
                        </ul>
                    </section>

                    {/* Modifications */}
                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-white">11. Modifications to Services and Terms</h2>

                        <h3 className="text-xl font-semibold text-white">11.1 Service Changes</h3>
                        <p className="text-slate-300 leading-relaxed">
                            We reserve the right to modify, suspend, or discontinue any aspect of the Services at any time without notice or liability. This includes:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-slate-300 ml-4">
                            <li>Adding or removing features</li>
                            <li>Changing pricing or subscription plans</li>
                            <li>Updating algorithms or methodologies</li>
                            <li>Terminating support for certain assets or markets</li>
                        </ul>

                        <h3 className="text-xl font-semibold text-white mt-6">11.2 Terms Updates</h3>
                        <p className="text-slate-300 leading-relaxed">
                            We may update these Terms from time to time. Material changes will be communicated via email or platform notification. Continued use of the Services constitutes acceptance of the updated Terms.
                        </p>
                    </section>

                    {/* Dispute Resolution */}
                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-white">12. Dispute Resolution</h2>

                        <h3 className="text-xl font-semibold text-white">12.1 Informal Negotiation</h3>
                        <p className="text-slate-300 leading-relaxed">
                            Before filing a claim, you agree to contact us at <a href="mailto:legal@brainai.com" className="text-blue-400 hover:underline">legal@brainai.com</a> to attempt to resolve the dispute informally for at least 30 days.
                        </p>

                        <h3 className="text-xl font-semibold text-white mt-6">12.2 Arbitration</h3>
                        <p className="text-slate-300 leading-relaxed">
                            Any disputes arising from these Terms or the Services shall be resolved through binding arbitration in accordance with the rules of the American Arbitration Association. The arbitration shall take place in New York, NY, USA. You waive your right to a jury trial and to participate in class actions.
                        </p>

                        <h3 className="text-xl font-semibold text-white mt-6">12.3 Exceptions</h3>
                        <p className="text-slate-300 leading-relaxed">
                            Either party may seek injunctive relief in court to prevent infringement of intellectual property rights or unauthorized access to the Services.
                        </p>
                    </section>

                    {/* General Provisions */}
                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-white">13. General Provisions</h2>

                        <h3 className="text-xl font-semibold text-white">13.1 Governing Law</h3>
                        <p className="text-slate-300 leading-relaxed">
                            These Terms are governed by the laws of the State of New York, USA, without regard to conflict of law principles.
                        </p>

                        <h3 className="text-xl font-semibold text-white mt-4">13.2 Entire Agreement</h3>
                        <p className="text-slate-300 leading-relaxed">
                            These Terms, together with our Privacy Policy and any other referenced documents, constitute the entire agreement between you and Brain AiPro Trader.
                        </p>

                        <h3 className="text-xl font-semibold text-white mt-4">13.3 Severability</h3>
                        <p className="text-slate-300 leading-relaxed">
                            If any provision is found invalid or unenforceable, the remaining provisions shall remain in full effect.
                        </p>

                        <h3 className="text-xl font-semibold text-white mt-4">13.4 Waiver</h3>
                        <p className="text-slate-300 leading-relaxed">
                            Our failure to enforce any right or provision shall not constitute a waiver of that right or provision.
                        </p>

                        <h3 className="text-xl font-semibold text-white mt-4">13.5 Assignment</h3>
                        <p className="text-slate-300 leading-relaxed">
                            You may not assign or transfer these Terms without our written consent. We may assign our rights and obligations without restriction.
                        </p>
                    </section>

                    {/* Contact */}
                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-white">14. Contact Information</h2>
                        <p className="text-slate-300 leading-relaxed">
                            For questions about these Terms, please contact us:
                        </p>
                        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 mt-4">
                            <p className="text-white font-semibold mb-2">Brain AiPro Trader</p>
                            <p className="text-slate-300 text-sm mb-1"><strong>Email:</strong> <a href="mailto:legal@brainai.com" className="text-blue-400 hover:underline">legal@brainai.com</a></p>
                            <p className="text-slate-300 text-sm mb-1"><strong>Support:</strong> <a href="mailto:support@brainai.com" className="text-blue-400 hover:underline">support@brainai.com</a></p>
                            <p className="text-slate-300 text-sm mb-1"><strong>Address:</strong> 123 Trading Plaza, New York, NY 10005, USA</p>
                            <p className="text-slate-300 text-sm"><strong>Phone:</strong> +1 (555) 123-4567</p>
                        </div>
                    </section>

                    {/* Acknowledgment */}
                    <section className="space-y-4 mt-8 p-6 bg-blue-900/20 border border-blue-900/50 rounded-lg">
                        <p className="text-blue-200 leading-relaxed">
                            <strong>BY CLICKING "I AGREE" OR BY ACCESSING OR USING THE SERVICES, YOU ACKNOWLEDGE THAT YOU HAVE READ, UNDERSTOOD, AND AGREE TO BE BOUND BY THESE TERMS OF SERVICE.</strong>
                        </p>
                    </section>
                </div>
            </main>

            <Footer />
        </div>
    )
}
