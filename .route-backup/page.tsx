"use client"

import { Brain, Check, X } from 'lucide-react'
import { useState } from 'react'

export default function AdminAIProvidersPage() {
    const [providers, setProviders] = useState([
        { id: 1, name: 'Ollama (Local)', enabled: true, priority: 0, apiKey: 'N/A' },
        { id: 2, name: 'Groq', enabled: true, priority: 1, apiKey: 'gsk_***' },
        { id: 3, name: 'OpenAI', enabled: false, priority: 5, apiKey: 'sk-***' },
        { id: 4, name: 'Anthropic', enabled: false, priority: 6, apiKey: 'sk-ant-***' }
    ])

    const toggleProvider = (id: number) => {
        setProviders(providers.map(p =>
            p.id === id ? { ...p, enabled: !p.enabled } : p
        ))
    }

    return (
        <div className="min-h-screen bg-primary-900 p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold text-white mb-8">AI Providers</h1>

                <div className="bg-primary-800/60 border border-white/10 rounded-xl overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-primary-900/50 border-b border-white/10">
                            <tr>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Provider</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Priority</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">API Key</th>
                                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-300">Status</th>
                                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-300">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                            {providers.map((provider) => (
                                <tr key={provider.id} className="hover:bg-white/5">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <Brain className="text-blue-500" size={20} />
                                            <span className="text-white font-medium">{provider.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-400">{provider.priority}</td>
                                    <td className="px-6 py-4 text-gray-400 font-mono text-sm">{provider.apiKey}</td>
                                    <td className="px-6 py-4 text-center">
                                        {provider.enabled ? (
                                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-500/20 text-green-400 rounded-lg text-sm">
                                                <Check size={14} />
                                                Enabled
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-500/20 text-gray-400 rounded-lg text-sm">
                                                <X size={14} />
                                                Disabled
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <button
                                            onClick={() => toggleProvider(provider.id)}
                                            className={`px-4 py-2 rounded-lg font-medium transition-all ${provider.enabled
                                                    ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                                                    : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                                                }`}
                                        >
                                            {provider.enabled ? 'Disable' : 'Enable'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
