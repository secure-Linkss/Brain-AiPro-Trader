"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
    LayoutDashboard,
    TrendingUp,
    Users,
    BarChart3,
    Settings,
    Bell,
    Wallet,
    Shield,
    BookOpen,
    GraduationCap,
    LogOut,
} from "lucide-react"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar"
import { ThemeToggle } from "@/components/ThemeToggle"
import { LogoIcon } from "@/components/Logo"

const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
    { icon: TrendingUp, label: "Signals", href: "/signals" },
    { icon: Users, label: "Copy Trading", href: "/copy-trading" },
    { icon: BarChart3, label: "Analysis", href: "/analysis" },
    { icon: Wallet, label: "Performance", href: "/performance" },
    { icon: Bell, label: "Notifications", href: "/notifications" },
    { icon: GraduationCap, label: "Tutorials", href: "/tutorials" },
    { icon: Settings, label: "Settings", href: "/settings" },
]

const adminItems = [
    { icon: Shield, label: "Admin Panel", href: "/admin/dashboard" },
    { icon: BookOpen, label: "Blog Manager", href: "/admin/blog" },
]

export function AppSidebar() {
    const pathname = usePathname()
    const { state } = useSidebar()
    const isAdmin = true // TODO: Replace with actual auth check

    return (
        <Sidebar collapsible="icon">
            <SidebarHeader className="border-b border-white/10 p-4">
                <Link href="/dashboard" className="flex items-center gap-3">
                    <div className="w-10 h-10 flex-shrink-0">
                        <LogoIcon width={40} height={40} />
                    </div>
                    {state !== "collapsed" && (
                        <div className="flex flex-col">
                            <span className="text-white font-bold text-sm leading-none">
                                Brain AiPro Trader
                            </span>
                            <span className="text-blue-400 text-xs">AI Trading Platform</span>
                        </div>
                    )}
                </Link>
            </SidebarHeader>

            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Main Menu</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {menuItems.map((item) => (
                                <SidebarMenuItem key={item.href}>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={pathname === item.href}
                                        tooltip={item.label}
                                    >
                                        <Link href={item.href}>
                                            <item.icon className="h-4 w-4" />
                                            <span>{item.label}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                {isAdmin && (
                    <SidebarGroup>
                        <SidebarGroupLabel>Administration</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {adminItems.map((item) => (
                                    <SidebarMenuItem key={item.href}>
                                        <SidebarMenuButton
                                            asChild
                                            isActive={pathname.startsWith(item.href)}
                                            tooltip={item.label}
                                        >
                                            <Link href={item.href}>
                                                <item.icon className="h-4 w-4" />
                                                <span>{item.label}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                )}
            </SidebarContent>

            <SidebarFooter className="border-t border-white/10 p-4">
                <div className="flex items-center justify-between gap-2">
                    <ThemeToggle />
                    {state !== "collapsed" && (
                        <button className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
                            <LogOut className="h-4 w-4" />
                            <span>Logout</span>
                        </button>
                    )}
                </div>
            </SidebarFooter>
        </Sidebar>
    )
}
