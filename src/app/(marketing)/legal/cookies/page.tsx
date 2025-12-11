'use client'

import Navigation from '@/components/layout/Navigation'
import Footer from '@/components/layout/Footer'

export default function CookiesPage() {
    return (
        <div className="min-h-screen bg-slate-950">
            <Navigation />

            <section className="pt-32 pb-20 px-4">
                <div className="container mx-auto max-w-4xl text-gray-300">
                    <h1 className="text-4xl font-bold text-white mb-8">Cookie Policy</h1>
                    <p className="mb-4 text-sm text-gray-500">Last Updated: December 9, 2025</p>

                    <div className="space-y-8">
                        <div className="bg-slate-900/50 p-8 rounded-xl border border-white/10">
                            <h2 className="text-2xl font-bold text-white mb-4">What Are Cookies</h2>
                            <p className="mb-4">
                                Cookies are small text files that are placed on your computer or mobile device by websites that you visit. They are widely used in order to make websites work, or work more efficiently, as well as to provide information to the owners of the site.
                            </p>
                        </div>

                        <div className="bg-slate-900/50 p-8 rounded-xl border border-white/10">
                            <h2 className="text-2xl font-bold text-white mb-4">How We Use Cookies</h2>
                            <ul className="list-disc pl-6 space-y-2">
                                <li><strong>Essential Cookies:</strong> Necessary for the website to function (e.g., login sessions).</li>
                                <li><strong>Analytical Cookies:</strong> Help us understand how visitors interact with our website (e.g., Google Analytics).</li>
                                <li><strong>Functionality Cookies:</strong> Remember choices you make to improve your experience (e.g., language preference).</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    )
}
