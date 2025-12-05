"use client"

import { Users, Activity, DollarSign, TrendingUp, Settings, Database } from 'lucide-react'
import Link from 'next/link'

export default function AdminDashboardPage() {
  const stats = [
    { title: 'Total Users', value: '12,458', change: '+12.5%', icon: Users, color: 'blue' },
    { title: 'Active Trades', value: '3,245', change: '+8.3%', icon: Activity, color: 'green' },
    { title: 'Revenue (MTD)', value: '$45,230', change: '+15.2%', icon: DollarSign, color: 'purple' },
    { title: 'System Health', value: '99.8%', change: 'Excellent', icon: TrendingUp, color: 'green' }
  ]

  const quickLinks = [
    { title: 'User Management', href: '/admin/users', icon: Users },
    { title: 'System Settings', href: '/admin/settings', icon: Settings },
    { title: 'Backtesting', href: '/admin/backtesting', icon: Activity },
    { title: 'Messages', href: '/admin/messages', icon: Database },
    { title: 'AI Providers', href: '/admin/ai-providers', icon: TrendingUp }
  ]

  return (
    <div className="min-h-screen bg-primary-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Admin Dashboard</h1>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-primary-800/60 border border-white/10 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <stat.icon className={`text-${stat.color}-500`} size={24} />
                <span className="text-green-400 text-sm font-medium">{stat.change}</span>
              </div>
              <p className="text-gray-400 text-sm mb-1">{stat.title}</p>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quickLinks.map((link, index) => (
            <Link
              key={index}
              href={link.href}
              className="p-6 bg-primary-800/60 border border-white/10 rounded-xl hover:border-blue-500/50 transition-all group"
            >
              <link.icon className="text-blue-500 mb-4" size={32} />
              <h3 className="text-lg font-semibold text-white">{link.title}</h3>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}