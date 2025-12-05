"use client"

import { Mail, Trash } from 'lucide-react'

export default function AdminMessagesPage() {
    const messages = [
        { id: 1, from: 'john@example.com', subject: 'Question about Pro plan', date: '2024-12-04', status: 'unread' },
        { id: 2, from: 'jane@example.com', subject: 'API access request', date: '2024-12-03', status: 'read' },
        { id: 3, from: 'bob@example.com', subject: 'Feature request', date: '2024-12-02', status: 'read' }
    ]

    return (
        <div className="min-h-screen bg-primary-900 p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold text-white mb-8">Messages</h1>

                <div className="bg-primary-800/60 border border-white/10 rounded-xl overflow-hidden">
                    <div className="divide-y divide-white/10">
                        {messages.map((message) => (
                            <div key={message.id} className="p-6 hover:bg-white/5 transition-colors">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <Mail className="text-blue-500" size={20} />
                                            <span className="font-semibold text-white">{message.from}</span>
                                            {message.status === 'unread' && (
                                                <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">New</span>
                                            )}
                                        </div>
                                        <p className="text-white mb-1">{message.subject}</p>
                                        <p className="text-sm text-gray-400">{message.date}</p>
                                    </div>
                                    <button className="p-2 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30">
                                        <Trash size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
