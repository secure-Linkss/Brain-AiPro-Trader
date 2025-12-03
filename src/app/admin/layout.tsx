import { redirect } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { LayoutDashboard, Users, CreditCard, Settings, Activity, Shield, Mail, BarChart3 } from 'lucide-react'
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'admin') {
        redirect('/login')
    }

    return (
        <div className="flex min-h-screen bg-slate-950">
            {/* Sidebar */}
            <aside className="w-64 border-r border-slate-800 p-6 hidden md:block">
                <div className="flex items-center gap-2 mb-8">
                    <Shield className="h-8 w-8 text-blue-500" />
                    <span className="font-bold text-xl">Brain Admin</span>
                </div>

                <nav className="space-y-2">
                    <Link href="/admin/dashboard" className="flex items-center gap-3 px-3 py-2 text-slate-300 hover:bg-slate-800 rounded-md transition-colors">
                        <LayoutDashboard className="h-5 w-5" />
                        Overview
                    </Link>
                    <Link href="/admin/users" className="flex items-center gap-3 px-3 py-2 text-slate-300 hover:bg-slate-800 rounded-md transition-colors">
                        <Users className="h-5 w-5" />
                        Users
                    </Link>
                    <Link href="/admin/messages" className="flex items-center gap-3 px-3 py-2 text-slate-300 hover:bg-slate-800 rounded-md transition-colors">
                        <Mail className="h-5 w-5" />
                        Messages
                    </Link>
                    <Link href="/admin/backtesting" className="flex items-center gap-3 px-3 py-2 text-slate-300 hover:bg-slate-800 rounded-md transition-colors">
                        <BarChart3 className="h-5 w-5" />
                        Backtesting
                    </Link>
                    <Link href="/admin/subscriptions" className="flex items-center gap-3 px-3 py-2 text-slate-300 hover:bg-slate-800 rounded-md transition-colors">
                        <CreditCard className="h-5 w-5" />
                        Subscriptions
                    </Link>
                    <Link href="/admin/audit-logs" className="flex items-center gap-3 px-3 py-2 text-slate-300 hover:bg-slate-800 rounded-md transition-colors">
                        <Activity className="h-5 w-5" />
                        Audit Logs
                    </Link>
                    <Link href="/admin/settings" className="flex items-center gap-3 px-3 py-2 text-slate-300 hover:bg-slate-800 rounded-md transition-colors">
                        <Settings className="h-5 w-5" />
                        Settings
                    </Link>
                </nav>

                <div className="mt-auto pt-8 border-t border-slate-800">
                    <div className="flex items-center gap-3 px-3">
                        <div className="h-8 w-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500 font-bold">
                            A
                        </div>
                        <div className="text-sm">
                            <div className="font-medium">{session.user.name || 'Admin'}</div>
                            <div className="text-slate-500 text-xs">Administrator</div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-y-auto">
                {children}
            </main>
        </div>
    )
}
