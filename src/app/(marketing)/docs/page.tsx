'use client'

import Navigation from '@/components/layout/Navigation'
import Footer from '@/components/layout/Footer'
import { FileText, Code, Lock, Server } from 'lucide-react'

export default function DocsPage() {
    return (
        <div className="min-h-screen bg-slate-950">
            <Navigation />

            <section className="pt-32 pb-20 px-4">
                <div className="container mx-auto max-w-4xl">
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full mb-6 text-blue-400">
                            <Code size={16} />
                            <span className="text-sm font-semibold">Developer API v2.0</span>
                        </div>
                        <h1 className="text-5xl font-bold text-white mb-6">API Documentation</h1>
                        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                            Integrate Brain AiPro Trader's powerful signals and analysis into your own applications.
                        </p>
                    </div>

                    <div className="space-y-12">
                        {/* Section 1: Intro */}
                        <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-8">
                            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                                <FileText className="text-blue-500" />
                                Introduction
                            </h2>
                            <p className="text-gray-300 mb-4">
                                The Brain AiPro Trader API allows programmatic access to our trading signals, pattern detection engine, and market analysis tools. All endpoints are RESTful and return JSON responses.
                            </p>
                            <div className="bg-black/50 rounded-lg p-4 font-mono text-sm text-gray-300 border border-white/5">
                                Base URL: https://api.brainaiprotrader.com/v2
                            </div>
                        </div>

                        {/* Section 2: Auth */}
                        <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-8">
                            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                                <Lock className="text-purple-500" />
                                Authentication
                            </h2>
                            <p className="text-gray-300 mb-4">
                                Authenticate requests by verifying your API key in the `Authorization` header.
                            </p>
                            <div className="bg-black/50 rounded-lg p-4 font-mono text-sm text-green-400 border border-white/5">
                                Authorization: Bearer YOUR_API_KEY
                            </div>
                        </div>

                        {/* Section 3: Endpoints */}
                        <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-8">
                            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                                <Server className="text-orange-500" />
                                Key Endpoints
                            </h2>
                            <div className="space-y-4">
                                <div className="p-4 bg-white/5 rounded-lg border border-white/5">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-bold rounded">GET</span>
                                        <code className="text-white font-mono">/signals/latest</code>
                                    </div>
                                    <p className="text-sm text-gray-400">Retrieve the latest trading signals with filters.</p>
                                </div>
                                <div className="p-4 bg-white/5 rounded-lg border border-white/5">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs font-bold rounded">POST</span>
                                        <code className="text-white font-mono">/analysis/sentiment</code>
                                    </div>
                                    <p className="text-sm text-gray-400">Analyze text for market sentiment using our AI models.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    )
}
