import Navigation from '@/components/layout/Navigation'
import Footer from '@/components/layout/Footer'

export default function CookiePolicyPage() {
    return (
        <div className="min-h-screen bg-primary-900">
            <Navigation />

            <section className="pt-32 pb-20 px-4">
                <div className="container mx-auto max-w-4xl">
                    <h1 className="text-5xl font-bold text-white mb-8">Cookie Policy</h1>
                    <p className="text-gray-400 mb-8">Last updated: December 4, 2025</p>

                    <div className="space-y-8 text-gray-300">
                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">What Are Cookies</h2>
                            <p>
                                Cookies are small text files that are placed on your computer or mobile device when you visit our website. They are widely used to make websites work more efficiently and provide information to the owners of the site.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">How We Use Cookies</h2>
                            <p className="mb-4">We use cookies for the following purposes:</p>
                            <ul className="space-y-2 ml-6">
                                <li className="flex items-start gap-2">
                                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                                    <span><strong className="text-white">Essential Cookies:</strong> Required for the website to function properly (authentication, security)</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                                    <span><strong className="text-white">Analytics Cookies:</strong> Help us understand how visitors interact with our website</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                                    <span><strong className="text-white">Preference Cookies:</strong> Remember your settings and preferences</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                                    <span><strong className="text-white">Marketing Cookies:</strong> Track your activity to deliver relevant advertisements</span>
                                </li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">Types of Cookies We Use</h2>
                            <div className="space-y-4">
                                <div className="p-4 bg-primary-800/60 border border-white/10 rounded-lg">
                                    <h3 className="font-semibold text-white mb-2">Session Cookies</h3>
                                    <p className="text-sm">Temporary cookies that expire when you close your browser</p>
                                </div>
                                <div className="p-4 bg-primary-800/60 border border-white/10 rounded-lg">
                                    <h3 className="font-semibold text-white mb-2">Persistent Cookies</h3>
                                    <p className="text-sm">Remain on your device until deleted or expired</p>
                                </div>
                                <div className="p-4 bg-primary-800/60 border border-white/10 rounded-lg">
                                    <h3 className="font-semibold text-white mb-2">First-Party Cookies</h3>
                                    <p className="text-sm">Set by our website directly</p>
                                </div>
                                <div className="p-4 bg-primary-800/60 border border-white/10 rounded-lg">
                                    <h3 className="font-semibold text-white mb-2">Third-Party Cookies</h3>
                                    <p className="text-sm">Set by external services we use (analytics, advertising)</p>
                                </div>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">Managing Cookies</h2>
                            <p className="mb-4">
                                You can control and manage cookies in various ways. Please note that removing or blocking cookies can impact your user experience and some features may no longer be available.
                            </p>
                            <p>
                                Most browsers allow you to refuse cookies or delete cookies. The methods for doing so vary from browser to browser. Please visit your browser's help menu for instructions.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">Contact Us</h2>
                            <p>
                                If you have any questions about our use of cookies, please contact us at{' '}
                                <a href="mailto:privacy@brainaipro.com" className="text-blue-400 hover:text-blue-300">
                                    privacy@brainaipro.com
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
