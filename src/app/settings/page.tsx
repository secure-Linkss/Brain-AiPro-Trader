"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import {
  User,
  Settings,
  Bell,
  Shield,
  CreditCard,
  MessageCircle,
  LogOut,
  Camera,
  CheckCircle,
  AlertTriangle,
  Crown
} from "lucide-react"

interface UserProfile {
  id: string
  email: string
  name: string
  avatar?: string
  role: string
  subscriptionExpires?: Date
  telegramBotId?: string
  telegramChatId?: string
  telegramEnabled: boolean
  stripeCustomerId?: string
  createdAt: Date
}

interface SubscriptionPlan {
  id: string
  name: string
  amount: number
  interval: string
  features: string[]
  isCurrent: boolean
}

export default function SettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [saveMessage, setSaveMessage] = useState("")
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([])

  // Form states
  const [name, setName] = useState("")
  const [telegramBotId, setTelegramBotId] = useState("")
  const [telegramChatId, setTelegramChatId] = useState("")
  const [telegramEnabled, setTelegramEnabled] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
      return
    }

    if (session?.user) {
      fetchUserData()
      fetchSubscriptionPlans()
    }
  }, [session, status, router])

  const fetchUserData = async () => {
    try {
      const response = await fetch("/api/user/profile")
      const data = await response.json()

      if (data.success) {
        setProfile(data.user)
        setName(data.user.name || "")
        setTelegramBotId(data.user.telegramBotId || "")
        setTelegramChatId(data.user.telegramChatId || "")
        setTelegramEnabled(data.user.telegramEnabled || false)
      }
    } catch (error) {
      console.error("Error fetching user data:", error)
    }
  }

  const fetchSubscriptionPlans = async () => {
    try {
      const response = await fetch("/api/subscription/plans")
      const data = await response.json()

      if (data.success) {
        setSubscriptionPlans(data.plans)
      }
    } catch (error) {
      console.error("Error fetching subscription plans:", error)
    }
  }

  const handleSaveProfile = async () => {
    setLoading(true)
    setSaveMessage("")

    try {
      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          telegramBotId,
          telegramChatId,
          telegramEnabled
        }),
      })

      const data = await response.json()

      if (data.success) {
        setSaveMessage("Profile updated successfully!")
        setProfile(data.user)
      } else {
        setSaveMessage(data.error || "Failed to update profile")
      }
    } catch (error) {
      setSaveMessage("An error occurred while updating profile")
    } finally {
      setLoading(false)
      setTimeout(() => setSaveMessage(""), 3000)
    }
  }

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setLoading(true)

    try {
      const formData = new FormData()
      formData.append("avatar", file)

      const response = await fetch("/api/user/avatar", {
        method: "POST",
        body: formData
      })

      const data = await response.json()

      if (data.success) {
        setSaveMessage("Avatar updated successfully!")
        if (profile) {
          setProfile({ ...profile, avatar: data.avatarUrl })
        }
      } else {
        setSaveMessage(data.error || "Failed to update avatar")
      }
    } catch (error) {
      setSaveMessage("An error occurred while updating avatar")
    } finally {
      setLoading(false)
      setTimeout(() => setSaveMessage(""), 3000)
    }
  }

  const handleSubscribe = async (planId: string) => {
    try {
      const response = await fetch("/api/subscription/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ planId }),
      })

      const data = await response.json()

      if (data.success && data.checkoutUrl) {
        window.location.href = data.checkoutUrl
      } else {
        setSaveMessage(data.error || "Failed to create checkout session")
      }
    } catch (error) {
      setSaveMessage("An error occurred while processing subscription")
    }
  }

  const handleLogout = async () => {
    await router.push("/api/auth/signout")
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin": return "bg-purple-500"
      case "premium": return "bg-yellow-500"
      default: return "bg-blue-500"
    }
  }

  const getSubscriptionStatus = () => {
    if (!profile?.subscriptionExpires) return { text: "Free", color: "text-gray-400" }
    if (new Date(profile.subscriptionExpires) > new Date()) {
      return { text: "Active", color: "text-green-400" }
    }
    return { text: "Expired", color: "text-red-400" }
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white">Loading profile...</div>
      </div>
    )
  }

  const subscriptionStatus = getSubscriptionStatus()

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-800/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => router.push("/dashboard")}
              className="text-slate-300 hover:text-white"
            >
              ← Back to Dashboard
            </Button>
            <h1 className="text-xl font-bold text-white">Settings</h1>
          </div>
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="text-slate-300 hover:text-white"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Section */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs defaultValue="profile" className="space-y-6">
              <TabsList className="bg-slate-800 border-slate-700">
                <TabsTrigger value="profile" className="text-slate-300">Profile</TabsTrigger>
                <TabsTrigger value="telegram" className="text-slate-300">Telegram</TabsTrigger>
                <TabsTrigger value="subscription" className="text-slate-300">Subscription</TabsTrigger>
              </TabsList>

              <TabsContent value="profile" className="space-y-6">
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <User className="w-5 h-5 mr-2 text-purple-400" />
                      Profile Information
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                      Manage your personal information and account settings
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Avatar Upload */}
                    <div className="flex items-center space-x-4">
                      <Avatar className="w-20 h-20">
                        {profile.avatar ? (
                          <img src={profile.avatar} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          <AvatarFallback className="bg-purple-500 text-white text-lg">
                            {profile.name?.charAt(0) || profile.email.charAt(0)}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div className="flex-1">
                        <Label htmlFor="avatar" className="text-slate-300">Profile Avatar</Label>
                        <Input
                          id="avatar"
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarUpload}
                          className="bg-slate-700 border-slate-600 text-white"
                        />
                      </div>
                    </div>

                    {/* Basic Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name" className="text-slate-300">Full Name</Label>
                        <Input
                          id="name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="bg-slate-700 border-slate-600 text-white"
                        />
                      </div>
                      <div>
                        <Label htmlFor="email" className="text-slate-300">Email Address</Label>
                        <Input
                          id="email"
                          value={profile.email}
                          disabled
                          className="bg-slate-700 border-slate-600 text-white"
                        />
                      </div>
                    </div>

                    {/* Account Status */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-slate-300">Account Type</Label>
                        <Badge className={getRoleBadge(profile.role)}>
                          {profile.role === "admin" ? "Administrator" :
                            profile.role === "premium" ? "Premium" : "Standard"}
                        </Badge>
                      </div>
                      <div>
                        <Label className="text-slate-300">Member Since</Label>
                        <div className="text-white">
                          {new Date(profile.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    {/* Save Button */}
                    <div className="flex items-center justify-between">
                      {saveMessage && (
                        <div className={`text-sm ${saveMessage.includes("success") ? "text-green-400" : "text-red-400"
                          }`}>
                          {saveMessage}
                        </div>
                      )}
                      <Button
                        onClick={handleSaveProfile}
                        disabled={loading}
                        className="bg-purple-500 hover:bg-purple-600"
                      >
                        {loading ? "Saving..." : "Save Changes"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="telegram" className="space-y-6">
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <MessageCircle className="w-5 h-5 mr-2 text-blue-400" />
                      Telegram Configuration
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                      Set up Telegram notifications to receive trading signals instantly
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="telegramEnabled" className="text-slate-300">Enable Telegram Notifications</Label>
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="telegramEnabled"
                            checked={telegramEnabled}
                            onCheckedChange={setTelegramEnabled}
                          />
                          <span className="text-slate-400">
                            {telegramEnabled ? "Enabled" : "Disabled"}
                          </span>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="telegramBotId" className="text-slate-300">Telegram Bot ID</Label>
                        <Input
                          id="telegramBotId"
                          value={telegramBotId}
                          onChange={(e) => setTelegramBotId(e.target.value)}
                          placeholder="Enter your Telegram bot ID"
                          className="bg-slate-700 border-slate-600 text-white"
                        />
                      </div>

                      <div>
                        <Label htmlFor="telegramChatId" className="text-slate-300">Telegram Chat ID</Label>
                        <Input
                          id="telegramChatId"
                          value={telegramChatId}
                          onChange={(e) => setTelegramChatId(e.target.value)}
                          placeholder="Enter your Telegram chat ID"
                          className="bg-slate-700 border-slate-600 text-white"
                        />
                      </div>
                    </div>

                    <div className="bg-slate-700/50 rounded-lg p-4">
                      <h4 className="font-semibold text-white mb-2">How to get Telegram Bot ID:</h4>
                      <ol className="text-sm text-slate-300 space-y-1 list-decimal list-inside">
                        <li>Search for "@BotFather" on Telegram</li>
                        <li>Send /newbot to create a new bot</li>
                        <li>Copy the bot token and chat ID</li>
                        <li>Start your bot to get the chat ID</li>
                      </ol>
                    </div>

                    <Button
                      onClick={handleSaveProfile}
                      disabled={loading}
                      className="bg-blue-500 hover:bg-blue-600"
                    >
                      {loading ? "Saving..." : "Save Telegram Settings"}
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="security" className="space-y-6">
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <Shield className="w-5 h-5 mr-2 text-red-400" />
                      Security Settings
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                      Manage your password and account security
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-white">Change Password</h3>
                      <div>
                        <Label htmlFor="currentPassword" className="text-slate-300">Current Password</Label>
                        <Input
                          id="currentPassword"
                          type="password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="bg-slate-700 border-slate-600 text-white"
                        />
                      </div>
                      <div>
                        <Label htmlFor="newPassword" className="text-slate-300">New Password</Label>
                        <Input
                          id="newPassword"
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="bg-slate-700 border-slate-600 text-white"
                        />
                      </div>
                      <div>
                        <Label htmlFor="confirmPassword" className="text-slate-300">Confirm New Password</Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="bg-slate-700 border-slate-600 text-white"
                        />
                      </div>

                      <Button
                        onClick={handlePasswordChange}
                        disabled={loading}
                        className="bg-red-500 hover:bg-red-600"
                      >
                        {loading ? "Updating..." : "Update Password"}
                      </Button>
                    </div>

                    <div className="pt-6 border-t border-slate-700">
                      <h3 className="text-lg font-medium text-white mb-4">Two-Factor Authentication</h3>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-slate-300">Protect your account with 2FA</p>
                          <p className="text-xs text-slate-500">Adds an extra layer of security to your account</p>
                        </div>
                        <Button variant="outline" disabled className="border-slate-600 text-slate-400">
                          Coming Soon
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="subscription" className="space-y-6">
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <Crown className="w-5 h-5 mr-2 text-yellow-400" />
                      Subscription Plans
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                      Upgrade to premium for advanced features and unlimited signals
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Current Subscription Status */}
                    <div className="bg-slate-700/50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-white">Current Status</h4>
                          <p className={`text-sm ${subscriptionStatus.color}`}>
                            {subscriptionStatus.text}
                          </p>
                          {profile.subscriptionExpires && (
                            <p className="text-xs text-slate-400">
                              Expires: {new Date(profile.subscriptionExpires).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        <Badge className={getRoleBadge(profile.role)}>
                          {profile.role === "admin" ? "Administrator" :
                            profile.role === "premium" ? "Premium" : "Standard"}
                        </Badge>
                      </div>
                    </div>

                    {/* Subscription Plans */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {subscriptionPlans.map((plan) => (
                        <Card
                          key={plan.id}
                          className={`bg-slate-700/50 border ${plan.isCurrent ? 'border-purple-500' : 'border-slate-600'
                            }`}
                        >
                          <CardHeader>
                            <CardTitle className="text-white">{plan.name}</CardTitle>
                            <CardDescription className="text-slate-400">
                              ${plan.amount}/{plan.interval}
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <ul className="space-y-2 text-sm text-slate-300">
                              {plan.features.map((feature, index) => (
                                <li key={index} className="flex items-center">
                                  <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
                                  {feature}
                                </li>
                              ))}
                            </ul>
                            <Button
                              onClick={() => handleSubscribe(plan.id)}
                              disabled={plan.isCurrent || loading}
                              className={`w-full mt-4 ${plan.isCurrent
                                  ? 'bg-gray-600 cursor-not-allowed'
                                  : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
                                }`}
                            >
                              {plan.isCurrent ? 'Current Plan' : 'Subscribe Now'}
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  variant="outline"
                  className="w-full border-slate-600 text-white hover:bg-slate-700"
                  onClick={() => router.push("/dashboard")}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-slate-600 text-white hover:bg-slate-700"
                  onClick={() => window.open("mailto:support@tradeai.pro")}
                >
                  <Bell className="w-4 h-4 mr-2" />
                  Contact Support
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-slate-600 text-white hover:bg-slate-700"
                  onClick={() => router.push("/about")}
                >
                  <Shield className="w-4 h-4 mr-2" />
                  About
                </Button>
              </CardContent>
            </Card>

            {/* Account Security */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Security</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Two-Factor Authentication</span>
                  <Badge variant="outline" className="border-yellow-500 text-yellow-400">
                    Coming Soon
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">API Access</span>
                  <Badge variant="outline" className="border-blue-500 text-blue-400">
                    {profile.role === "premium" ? "Enabled" : "Premium Only"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}