"use client"

import { Search, Mail, Ban } from 'lucide-react'
import { useState } from 'react'

export default function AdminUsersPage() {
    const [searchQuery, setSearchQuery] = useState('')

    const users = [
        { id: 1, name: 'John Doe', email: 'john@example.com', plan: 'Pro', status: 'active', joined: '2024-01-15' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', plan: 'Enterprise', status: 'active', joined: '2024-02-20' },
        { id: 3, name: 'Bob Wilson', email: 'bob@example.com', plan: 'Free', status: 'active', joined: '2024-03-10' }
    ]

    return (
        <div className="min-h-screen bg-primary-900 p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-white mb-8">User Management</h1>

                <div className="mb-6">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search users..."
                            className="w-full pl-12 pr-4 py-3 bg-primary-800/60 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                        />
                    </div>
                </div>

                <div className="bg-primary-800/60 border border-white/10 rounded-xl overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-primary-900/50 border-b border-white/10">
                            <tr>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Name</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Email</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Plan</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Status</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                            {users.map((user) => (
                                <tr key={user.id} className="hover:bg-white/5">
                                    <td className="px-6 py-4 text-white">{user.name}</td>
                                    <td className="px-6 py-4 text-gray-400">{user.email}</td>
                                    <td className="px-6 py-4">
                                        <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-lg text-sm">
                                            {user.plan}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-lg text-sm">
                                            {user.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-2">
                                            <button className="p-2 bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30">
                                                <Mail size={16} />
                                            </button>
                                            <button className="p-2 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30">
                                                <Ban size={16} />
                                            </button>
                                        </div>
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
