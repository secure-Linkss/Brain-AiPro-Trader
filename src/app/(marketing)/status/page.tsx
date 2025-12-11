'use client'

import Navigation from '@/components/layout/Navigation'
import Footer from '@/components/layout/Footer'
import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react'

export default function StatusPage() {
    const systems = [
        { name: 'Signal Engine', status: 'operational', uptime: '99.99%' },
        { name: 'API Gateway', status: 'operational', uptime: '99.95%' },
        { name: 'Web Dashboard', status: 'operational', uptime: '100%' },
        { name: 'Database Clusters', status: 'operational', uptime: '99.99%' },
        { name: 'Notification Service', status: 'operational', uptime: '99.98%' },
    ]

    return (
        <div className="min-h-screen bg-slate-950">
            <Navigation />

            <section className="pt-32 pb-20 px-4">
                <div className="container mx-auto max-w-3xl">
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full mb-6 text-green-400">
                            <CheckCircle size={16} />
                            <span className="text-sm font-semibold">All Systems Operational</span>
                        </div>
                        <h1 className="text-5xl font-bold text-white mb-6">System Status</h1>
                        <p className="text-xl text-gray-400">
                            Current status of Brain AiPro Trader services.
                        </p>
                    </div>

                    <div className="space-y-4">
                        {systems.map((sys, idx) => (
                            <div key={idx} className="bg-slate-900/50 border border-white/10 rounded-xl p-6 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                                    <span className="text-white font-medium text-lg">{sys.name}</span>
                                </div>
                                <div className="text-right">
                                    <div className="text-green-400 font-bold mb-1">Operational</div>
                                    <div className="text-xs text-gray-500">Uptime: {sys.uptime}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-12 p-6 bg-white/5 border border-white/10 rounded-xl">
                        <h3 className="text-white font-bold mb-2">Past Incidents</h3>
                        <p className="text-gray-400 text-sm">No incidents reported in the last 30 days.</p>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    )
}
