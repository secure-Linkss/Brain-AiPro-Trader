"use client"

import { useSession } from "next-auth/react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Shield, ArrowLeftRight } from "lucide-react"

export function DashboardSwitcher() {
    const { data: session } = useSession()
    const pathname = usePathname()

    const isAdmin = session?.user?.role === 'admin'
    const isOnAdminPanel = pathname?.startsWith('/admin')

    if (!isAdmin) return null

    return (
        <div className="fixed bottom-6 right-6 z-50">
            <Link href={isOnAdminPanel ? '/dashboard' : '/admin/dashboard'}>
                <Button
                    size="lg"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all"
                >
                    <ArrowLeftRight className="mr-2 h-5 w-5" />
                    {isOnAdminPanel ? (
                        <>
                            <LayoutDashboard className="mr-2 h-5 w-5" />
                            User Dashboard
                        </>
                    ) : (
                        <>
                            <Shield className="mr-2 h-5 w-5" />
                            Admin Panel
                        </>
                    )}
                </Button>
            </Link>
        </div>
    )
}
