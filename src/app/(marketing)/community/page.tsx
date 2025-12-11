'use client'

import Navigation from '@/components/layout/Navigation'
import Footer from '@/components/layout/Footer'
import { Users, MessageSquare, Twitter, Globe, Award } from 'lucide-react'

export default function CommunityPage() {
    const channels = [
        {
            name: "Discord",
            desc: "Technical discussions, setup help, and dev updates.",
            members: "5.2k Members",
            icon: Users,
            color: "bg-indigo-500",
            link: "#"
        },
        {
            name: "Telegram",
            desc: "Real-time signal alerts and market chat.",
            members: "12.8k Subscribers",
            icon: MessageSquare,
            color: "bg-blue-500",
            link: "#"
        },
        {
            name: "Twitter",
            desc: "Latest news and market analysis bites.",
            members: "25k Followers",
            icon: Twitter,
            color: "bg-sky-500",
            link: "#"
        }
    ]

    return (
        <div className="min-h-screen bg-slate-950">
            <Navigation />

            <section className="pt-32 pb-20 px-4 text-center">
                <div className="container mx-auto max-w-4xl">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full mb-6 text-purple-400">
                        <Globe size={16} />
                        <span className="text-sm font-semibold">Global Trading Community</span>
                    </div>
                    <h1 className="text-5xl font-bold text-white mb-6">Join 50,000+ Traders</h1>
                    <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
                        Connect with professional traders, share strategies, and get real-time insights from the Brain AiPro community.
                    </p>

                    <div className="grid md:grid-cols-3 gap-6 mb-20">
                        {channels.map((channel, idx) => (
                            <a href={channel.link} key={idx} className="bg-slate-900/50 border border-white/10 rounded-2xl p-8 hover:border-white/20 transition-all hover:-translate-y-2 group block">
                                <div className={`w-16 h-16 ${channel.color} rounded-2xl mx-auto flex items-center justify-center text-white mb-6 shadow-lg shadow-${channel.color}/20 group-hover:scale-110 transition-transform`}>
                                    <channel.icon size={32} />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">{channel.name}</h3>
                                <p className="text-gray-400 text-sm mb-4">{channel.desc}</p>
                                <div className="text-sm font-semibold text-white bg-white/5 py-2 px-4 rounded-full inline-block">
                                    {channel.members}
                                </div>
                            </a>
                        ))}
                    </div>

                    {/* Leaderboard Preview */}
                    <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-white/10 rounded-2xl p-8 max-w-3xl mx-auto">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                <Award className="text-yellow-500" />
                                Top Contributors
                            </h2>
                            <button className="text-sm text-blue-400 hover:text-white transition-colors">View All</button>
                        </div>
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-gray-700 rounded-full" />
                                        <div className="text-left">
                                            <div className="text-white font-semibold">TraderUser{i}99</div>
                                            <div className="text-xs text-gray-500">Tier: PRO • 500+ Signals</div>
                                        </div>
                                    </div>
                                    <div className="text-green-400 font-bold text-sm">+340%</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    )
}
