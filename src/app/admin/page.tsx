"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Users,
  TrendingUp,
  DollarSign,
  Activity,
  Settings,
  LogOut,
  Shield,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Eye,
  Calendar
} from "lucide-react"
import { SystemHealthMonitor } from "@/components/admin/system-health-monitor"

interface AdminStats {
  totalUsers: number
  activeUsers: number
  premiumUsers: number
  totalRevenue: number
  monthlyRevenue: number
  totalSignals: number
  successRate: number
  systemHealth: "healthy" | "warning" | "critical"
}

interface User {
  id: string
  email: string
  name: string
  role: string
  subscriptionExpires?: Date
  telegramEnabled: boolean
  createdAt: Date
  lastActive: Date
}

export default function AdminPanel() {
  const { data: session } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session?.user?.role !== "admin") {
      router.push("/dashboard")
      return
    }
    fetchAdminData()
  }, [session, router])

  const fetchAdminData = async () => {
    try {
      const [statsRes, usersRes] = await Promise.all([
        fetch("/api/admin/stats"),
        fetch("/api/admin/users")
      ])

      const statsData = await statsRes.json()
      const usersData = await usersRes.json()

      if (statsData.success) setStats(statsData.stats)
      if (usersData.success) setUsers(usersData.users)
    } catch (error) {
      console.error("Error fetching admin data:", error)
    } finally {
      setLoading(false)
    }
  }

  const getHealthColor = (health: string) => {
    switch (health) {
      case "healthy": return "text-green-400"
      case "warning": return "text-yellow-400"
      case "critical": return "text-red-400"
      default: return "text-gray-400"
    }
  }

  const getHealthBadge = (health: string) => {
    switch (health) {
      case "healthy": return "bg-green-500"
      case "warning": return "bg-yellow-500"
      case "critical": return "bg-red-500"
      default: return "bg-gray-500"
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin": return "bg-purple-500"
      case "premium": return "bg-yellow-500"
      default: return "bg-blue-500"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Admin Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Shield className="w-6 h-6 text-purple-500" />
              <span className="text-xl font-bold text-white">Mission Control</span>
            </div>
            <Badge className={getHealthBadge(stats?.systemHealth || "healthy")}>
              System: {stats?.systemHealth || "Unknown"}
            </Badge>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
              <Settings className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-400 hover:text-white"
              onClick={() => router.push("/dashboard")}
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 space-y-8">

        {/* System Health Monitor - Mission Control */}
        <section>
          <h2 className="text-xl font-bold text-white mb-4 flex items-center">
            <Activity className="mr-2 h-5 w-5 text-purple-500" />
            Real-Time System Status
          </h2>
          <SystemHealthMonitor />
        </section>

        {/* Overview Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-slate-400 flex items-center">
                  <Users className="w-4 h-4 mr-2" />
                  Total Users
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{stats.totalUsers.toLocaleString()}</div>
                <p className="text-xs text-slate-500">+{stats.activeUsers} active this month</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-900 border-slate-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-slate-400 flex items-center">
                  <DollarSign className="w-4 h-4 mr-2" />
                  Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-400">${stats.totalRevenue.toLocaleString()}</div>
                <p className="text-xs text-slate-500">${stats.monthlyRevenue} this month</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-900 border-slate-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-slate-400 flex items-center">
                  <Activity className="w-4 h-4 mr-2" />
                  Signals Generated
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{stats.totalSignals.toLocaleString()}</div>
                <p className="text-xs text-slate-500">{stats.successRate}% success rate</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-900 border-slate-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-slate-400 flex items-center">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Premium Users
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-400">{stats.premiumUsers.toLocaleString()}</div>
                <p className="text-xs text-slate-500">Active subscriptions</p>
              </CardContent>
            </Card>
          </div>
        )}

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="bg-slate-900 border-slate-800">
            <TabsTrigger value="users" className="text-slate-400 data-[state=active]:text-white data-[state=active]:bg-slate-800">Users</TabsTrigger>
            <TabsTrigger value="analytics" className="text-slate-400 data-[state=active]:text-white data-[state=active]:bg-slate-800">Analytics</TabsTrigger>
            <TabsTrigger value="system" className="text-slate-400 data-[state=active]:text-white data-[state=active]:bg-slate-800">System Logs</TabsTrigger>
            <TabsTrigger value="settings" className="text-slate-400 data-[state=active]:text-white data-[state=active]:bg-slate-800">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-6">
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Users className="w-5 h-5 mr-2 text-purple-500" />
                  User Management
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Manage all registered users and their subscriptions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors">
                      <div className="flex items-center space-x-4">
                        <Avatar className="w-10 h-10 border border-slate-600">
                          <AvatarFallback className="bg-slate-800 text-purple-400 font-bold">
                            {user.name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-white">{user.name || "Unknown"}</div>
                          <div className="text-sm text-slate-400">{user.email}</div>
                        </div>
                        <Badge className={getRoleBadge(user.role)}>
                          {user.role}
                        </Badge>
                        {user.telegramEnabled && (
                          <Badge variant="outline" className="border-blue-500 text-blue-400">
                            Telegram Active
                          </Badge>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-slate-400">
                          Joined: {new Date(user.createdAt).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-slate-400">
                          Last Active: {new Date(user.lastActive).toLocaleDateString()}
                        </div>
                        {user.subscriptionExpires && (
                          <div className="text-sm text-yellow-500 mt-1">
                            Expires: {new Date(user.subscriptionExpires).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2 text-purple-500" />
                  Analytics Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <BarChart3 className="w-16 h-16 mx-auto mb-4 text-slate-600" />
                  <h3 className="text-lg font-semibold text-white mb-2">Analytics Dashboard</h3>
                  <p className="text-slate-400 max-w-md mx-auto">
                    Detailed analytics, user retention metrics, and revenue forecasting modules are currently being aggregated.
                  </p>
                  <Button className="mt-6 bg-purple-600 hover:bg-purple-700">
                    View Raw Data
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="system" className="space-y-6">
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Settings className="w-5 h-5 mr-2 text-purple-500" />
                  System Logs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-slate-950 rounded border border-slate-800 font-mono text-sm text-slate-400">
                    <div className="flex justify-between border-b border-slate-800 pb-2 mb-2">
                      <span>TIMESTAMP</span>
                      <span>LEVEL</span>
                      <span>MESSAGE</span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-green-400">
                        <span>{new Date().toISOString()}</span>
                        <span>INFO</span>
                        <span>System health check passed</span>
                      </div>
                      <div className="flex justify-between text-blue-400">
                        <span>{new Date(Date.now() - 5000).toISOString()}</span>
                        <span>DEBUG</span>
                        <span>Agent consensus reached: BUY EURUSD</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>{new Date(Date.now() - 15000).toISOString()}</span>
                        <span>INFO</span>
                        <span>Database backup completed</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Settings className="w-5 h-5 mr-2 text-purple-500" />
                  Admin Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Settings className="w-16 h-16 mx-auto mb-4 text-slate-600" />
                  <h3 className="text-lg font-semibold text-white mb-2">System Configuration</h3>
                  <p className="text-slate-400 mb-6">
                    Manage global system parameters, API keys, and feature flags.
                  </p>
                  <Button onClick={() => router.push('/admin/settings')} className="bg-purple-600 hover:bg-purple-700">
                    Go to Settings Dashboard
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}