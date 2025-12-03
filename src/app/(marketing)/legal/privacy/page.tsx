import Link from "next/link"
import { Footer } from "@/components/footer"

export default function PrivacyPolicyPage() {
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
                    Privacy Policy
                </h1>
                <p className="text-slate-400 mb-8">Last updated: November 29, 2025</p>

                <div className="prose prose-invert max-w-none space-y-8">
                    {/* Introduction */}
                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-white">Introduction</h2>
                        <p className="text-slate-300 leading-relaxed">
                            Brain AiPro Trader ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our AI-powered trading platform and related services (collectively, the "Services").
                        </p>
                        <p className="text-slate-300 leading-relaxed">
                            By accessing or using our Services, you acknowledge that you have read, understood, and agree to be bound by this Privacy Policy. If you do not agree with the terms of this Privacy Policy, please do not access or use the Services.
                        </p>
                    </section>

                    {/* Information We Collect */}
                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-white">1. Information We Collect</h2>

                        <h3 className="text-xl font-semibold text-white">1.1 Personal Information</h3>
                        <p className="text-slate-300 leading-relaxed">
                            We collect personal information that you provide directly to us, including:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-slate-300 ml-4">
                            <li><strong>Account Information:</strong> Name, email address, username, password, and profile information</li>
                            <li><strong>Payment Information:</strong> Credit card details, billing address (processed securely via Stripe)</li>
                            <li><strong>Identity Verification:</strong> Government-issued ID, proof of address (for KYC/AML compliance)</li>
                            <li><strong>Contact Information:</strong> Phone number, mailing address, Telegram username</li>
                            <li><strong>Trading Information:</strong> Broker API keys, account balances, trading history</li>
                        </ul>

                        <h3 className="text-xl font-semibold text-white mt-6">1.2 Automatically Collected Information</h3>
                        <ul className="list-disc list-inside space-y-2 text-slate-300 ml-4">
                            <li><strong>Device Information:</strong> IP address, browser type, operating system, device identifiers</li>
                            <li><strong>Usage Data:</strong> Pages viewed, time spent on pages, click patterns, features used</li>
                            <li><strong>Cookies and Tracking:</strong> Session cookies, analytics cookies, preference cookies</li>
                            <li><strong>Location Data:</strong> Approximate geographic location based on IP address</li>
                        </ul>

                        <h3 className="text-xl font-semibold text-white mt-6">1.3 Third-Party Data</h3>
                        <p className="text-slate-300 leading-relaxed">
                            We may receive information about you from third-party services, including:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-slate-300 ml-4">
                            <li>Market data providers (Alpha Vantage, Binance, Finnhub)</li>
                            <li>Payment processors (Stripe)</li>
                            <li>Analytics services (Google Analytics, Mixpanel)</li>
                            <li>Social media platforms (if you connect your account)</li>
                        </ul>
                    </section>

                    {/* How We Use Your Information */}
                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-white">2. How We Use Your Information</h2>
                        <p className="text-slate-300 leading-relaxed">
                            We use the information we collect for the following purposes:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-slate-300 ml-4">
                            <li><strong>Service Delivery:</strong> Provide, maintain, and improve our trading signals and analysis</li>
                            <li><strong>Personalization:</strong> Customize your experience based on trading preferences and performance</li>
                            <li><strong>Communication:</strong> Send trading alerts, platform updates, marketing communications (opt-out available)</li>
                            <li><strong>Payment Processing:</strong> Process subscription payments and manage billing</li>
                            <li><strong>Security:</strong> Detect fraud, prevent abuse, and protect our platform</li>
                            <li><strong>Analytics:</strong> Analyze usage patterns to improve our services and develop new features</li>
                            <li><strong>Compliance:</strong> Meet legal and regulatory requirements (KYC/AML, tax reporting)</li>
                            <li><strong>Customer Support:</strong> Respond to inquiries and provide technical assistance</li>
                        </ul>
                    </section>

                    {/* Information Sharing */}
                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-white">3. How We Share Your Information</h2>
                        <p className="text-slate-300 leading-relaxed">
                            We do not sell your personal information. We may share your information in the following circumstances:
                        </p>

                        <h3 className="text-xl font-semibold text-white">3.1 Service Providers</h3>
                        <p className="text-slate-300 leading-relaxed">
                            We share information with trusted third parties who perform services on our behalf:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-slate-300 ml-4">
                            <li>Cloud hosting providers (Vercel, AWS)</li>
                            <li>Payment processors (Stripe)</li>
                            <li>Email services (SendGrid, Mailgun)</li>
                            <li>Analytics providers (Google Analytics)</li>
                            <li>Customer support tools (Intercom, Zendesk)</li>
                        </ul>

                        <h3 className="text-xl font-semibold text-white mt-6">3.2 Legal Requirements</h3>
                        <p className="text-slate-300 leading-relaxed">
                            We may disclose your information if required by law or in response to:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-slate-300 ml-4">
                            <li>Court orders, subpoenas, or legal process</li>
                            <li>Government requests or regulatory investigations</li>
                            <li>Protecting our rights, property, or safety</li>
                            <li>Enforcing our Terms of Service</li>
                        </ul>

                        <h3 className="text-xl font-semibold text-white mt-6">3.3 Business Transfers</h3>
                        <p className="text-slate-300 leading-relaxed">
                            In the event of a merger, acquisition, or sale of assets, your information may be transferred to the acquiring entity. You will be notified of any such change.
                        </p>
                    </section>

                    {/* Data Security */}
                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-white">4. Data Security</h2>
                        <p className="text-slate-300 leading-relaxed">
                            We implement industry-standard security measures to protect your information:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-slate-300 ml-4">
                            <li><strong>Encryption:</strong> All data transmitted via HTTPS/TLS encryption</li>
                            <li><strong>Database Security:</strong> Encrypted at rest using AES-256</li>
                            <li><strong>Access Controls:</strong> Multi-factor authentication, role-based access</li>
                            <li><strong>Regular Audits:</strong> Third-party security audits and penetration testing</li>
                            <li><strong>API Key Protection:</strong> Encrypted storage, never logged in plain text</li>
                            <li><strong>Monitoring:</strong> Real-time intrusion detection and automated alerts</li>
                        </ul>
                        <p className="text-slate-400 text-sm mt-4">
                            <em>Note: While we strive to protect your information, no method of transmission over the Internet or electronic storage is 100% secure. We cannot guarantee absolute security.</em>
                        </p>
                    </section>

                    {/* Data Retention */}
                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-white">5. Data Retention</h2>
                        <p className="text-slate-300 leading-relaxed">
                            We retain your information for as long as necessary to:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-slate-300 ml-4">
                            <li>Provide our Services to you</li>
                            <li>Comply with legal, tax, and accounting obligations (typically 7 years)</li>
                            <li>Resolve disputes and enforce agreements</li>
                            <li>Maintain business records for legitimate purposes</li>
                        </ul>
                        <p className="text-slate-300 leading-relaxed mt-4">
                            Upon account deletion, we will delete or anonymize your personal information within 90 days, except where retention is required by law.
                        </p>
                    </section>

                    {/* Your Rights */}
                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-white">6. Your Privacy Rights</h2>
                        <p className="text-slate-300 leading-relaxed">
                            Depending on your location, you may have the following rights:
                        </p>

                        <h3 className="text-xl font-semibold text-white">6.1 General Rights</h3>
                        <ul className="list-disc list-inside space-y-2 text-slate-300 ml-4">
                            <li><strong>Access:</strong> Request a copy of your personal information</li>
                            <li><strong>Correction:</strong> Update inaccurate or incomplete information</li>
                            <li><strong>Deletion:</strong> Request deletion of your account and data</li>
                            <li><strong>Data Portability:</strong> Receive your data in a machine-readable format</li>
                            <li><strong>Opt-Out:</strong> Unsubscribe from marketing communications</li>
                        </ul>

                        <h3 className="text-xl font-semibold text-white mt-6">6.2 GDPR Rights (EU/EEA Users)</h3>
                        <ul className="list-disc list-inside space-y-2 text-slate-300 ml-4">
                            <li>Right to restrict processing</li>
                            <li>Right to object to processing</li>
                            <li>Right to withdraw consent</li>
                            <li>Right to lodge a complaint with a supervisory authority</li>
                        </ul>

                        <h3 className="text-xl font-semibold text-white mt-6">6.3 CCPA Rights (California Users)</h3>
                        <ul className="list-disc list-inside space-y-2 text-slate-300 ml-4">
                            <li>Right to know what personal information is collected</li>
                            <li>Right to know if personal information is sold or shared</li>
                            <li>Right to opt-out of sale of personal information</li>
                            <li>Right to non-discrimination for exercising privacy rights</li>
                        </ul>

                        <p className="text-slate-300 leading-relaxed mt-4">
                            To exercise any of these rights, please contact us at <a href="mailto:privacy@brainai.com" className="text-blue-400 hover:underline">privacy@brainai.com</a> or use the settings in your account dashboard.
                        </p>
                    </section>

                    {/* Cookies */}
                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-white">7. Cookies and Tracking Technologies</h2>
                        <p className="text-slate-300 leading-relaxed">
                            We use cookies and similar technologies to:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-slate-300 ml-4">
                            <li><strong>Essential Cookies:</strong> Required for platform functionality (authentication, session management)</li>
                            <li><strong>Analytics Cookies:</strong> Track usage patterns and performance</li>
                            <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
                            <li><strong>Marketing Cookies:</strong> Deliver personalized advertisements</li>
                        </ul>
                        <p className="text-slate-300 leading-relaxed mt-4">
                            You can control cookies through your browser settings. Disabling certain cookies may limit platform functionality. See our <Link href="/legal/cookies" className="text-blue-400 hover:underline">Cookie Policy</Link> for details.
                        </p>
                    </section>

                    {/* Third-Party Links */}
                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-white">8. Third-Party Links and Services</h2>
                        <p className="text-slate-300 leading-relaxed">
                            Our platform may contain links to third-party websites, brokers, and services. We are not responsible for the privacy practices of these third parties. We encourage you to review their privacy policies before providing any personal information.
                        </p>
                        <p className="text-slate-300 leading-relaxed">
                            <strong>Broker Integrations:</strong> When you connect your broker account (e.g., MetaTrader 4/5), you are subject to that broker's privacy policy. We only access the data necessary to provide our Services.
                        </p>
                    </section>

                    {/* Children's Privacy */}
                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-white">9. Children's Privacy</h2>
                        <p className="text-slate-300 leading-relaxed">
                            Our Services are not intended for individuals under 18 years of age. We do not knowingly collect personal information from children. If we discover that we have collected information from a child, we will delete it immediately. Parents or guardians who believe we may have collected information from a child should contact us at <a href="mailto:privacy@brainai.com" className="text-blue-400 hover:underline">privacy@brainai.com</a>.
                        </p>
                    </section>

                    {/* International Transfers */}
                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-white">10. International Data Transfers</h2>
                        <p className="text-slate-300 leading-relaxed">
                            Your information may be transferred to and processed in countries other than your country of residence. These countries may have different data protection laws. We ensure that such transfers comply with applicable laws through:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-slate-300 ml-4">
                            <li>Standard Contractual Clauses (SCCs) approved by the European Commission</li>
                            <li>Privacy Shield (for US transfers, where applicable)</li>
                            <li>Adequate safeguards as required by GDPR and other regulations</li>
                        </ul>
                    </section>

                    {/* Changes to Policy */}
                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-white">11. Changes to This Privacy Policy</h2>
                        <p className="text-slate-300 leading-relaxed">
                            We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. We will notify you of material changes by:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-slate-300 ml-4">
                            <li>Posting the updated policy on this page</li>
                            <li>Updating the "Last Updated" date</li>
                            <li>Sending an email notification (for significant changes)</li>
                            <li>Displaying a prominent notice on our platform</li>
                        </ul>
                        <p className="text-slate-300 leading-relaxed mt-4">
                            Your continued use of the Services after the effective date of the updated Privacy Policy constitutes acceptance of the changes.
                        </p>
                    </section>

                    {/* Contact */}
                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-white">12. Contact Us</h2>
                        <p className="text-slate-300 leading-relaxed">
                            If you have questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:
                        </p>
                        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 mt-4">
                            <p className="text-white font-semibold mb-2">Brain AiPro Trader</p>
                            <p className="text-slate-300 text-sm mb-1"><strong>Email:</strong> <a href="mailto:privacy@brainai.com" className="text-blue-400 hover:underline">privacy@brainai.com</a></p>
                            <p className="text-slate-300 text-sm mb-1"><strong>Data Protection Officer:</strong> <a href="mailto:dpo@brainai.com" className="text-blue-400 hover:underline">dpo@brainai.com</a></p>
                            <p className="text-slate-300 text-sm mb-1"><strong>Address:</strong> 123 Trading Plaza, New York, NY 10005, USA</p>
                            <p className="text-slate-300 text-sm"><strong>Phone:</strong> +1 (555) 123-4567</p>
                        </div>
                    </section>

                    {/* Consent */}
                    <section className="space-y-4 mt-8 p-6 bg-blue-900/20 border border-blue-900/50 rounded-lg">
                        <p className="text-blue-200 text-sm leading-relaxed">
                            <strong>By using Brain AiPro Trader, you acknowledge that you have read and understood this Privacy Policy and agree to the collection, use, and disclosure of your information as described herein.</strong>
                        </p>
                    </section>
                </div>
            </main>

            <Footer />
        </div>
    )
}
