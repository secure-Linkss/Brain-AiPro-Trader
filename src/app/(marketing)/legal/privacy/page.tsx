'use client'

import Navigation from '@/components/layout/Navigation'
import Footer from '@/components/layout/Footer'

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-slate-950">
            <Navigation />

            <section className="pt-32 pb-20 px-4">
                <div className="container mx-auto max-w-4xl text-gray-300">
                    <h1 className="text-4xl font-bold text-white mb-8">Privacy Policy</h1>
                    <p className="mb-4 text-sm text-gray-500">Last Updated: December 9, 2025</p>

                    <div className="space-y-8">
                        <div className="bg-slate-900/50 p-8 rounded-xl border border-white/10">
                            <h2 className="text-2xl font-bold text-white mb-4">1. Introduction</h2>
                            <p className="mb-4">
                                Brain AiPro Trader ("we", "our", or "us") respects your privacy and is committed to protecting your personal data.
                                This privacy policy will inform you as to how we look after your personal data when you visit our website
                                and tell you about your privacy rights and how the law protects you.
                            </p>
                        </div>

                        <div className="bg-slate-900/50 p-8 rounded-xl border border-white/10">
                            <h2 className="text-2xl font-bold text-white mb-4">2. Data We Collect</h2>
                            <p className="mb-4">We may collect, use, store and transfer different kinds of personal data about you which we have grouped together follows:</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li><strong>Identity Data:</strong> includes first name, last name, username or similar identifier.</li>
                                <li><strong>Contact Data:</strong> includes email address and telephone numbers.</li>
                                <li><strong>Financial Data:</strong> includes bank account and payment card details (processed securely by third-party providers).</li>
                                <li><strong>Transaction Data:</strong> includes details about payments to and from you and other details of products and services you have purchased from us.</li>
                                <li><strong>Technical Data:</strong> includes internet protocol (IP) address, your login data, browser type and version, time zone setting and location, browser plug-in types and versions, operating system and platform.</li>
                            </ul>
                        </div>

                        <div className="bg-slate-900/50 p-8 rounded-xl border border-white/10">
                            <h2 className="text-2xl font-bold text-white mb-4">3. How We Use Your Data</h2>
                            <p className="mb-4">We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Where we need to perform the contract we are about to enter into or have entered into with you.</li>
                                <li>Where it is necessary for our legitimate interests (or those of a third party) and your interests and fundamental rights do not override those interests.</li>
                                <li>Where we need to comply with a legal or regulatory obligation.</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    )
}
