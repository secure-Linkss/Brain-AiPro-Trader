'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { User, Bell, MessageSquare, Shield, Palette, Globe, Save, CheckCircle2, AlertCircle } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

interface UserSettings {
    profile: {
        name: string
        email: string
        timezone: string
        language: string
    }
    notifications: {
        emailNotifications: boolean
        pushNotifications: boolean
        tradingAlerts: boolean
        systemUpdates: boolean
        weeklyReports: boolean
    }
    telegram: {
        enabled: boolean
        botToken: string
        chatId: string
        verified: boolean
        notifications: {
            signals: boolean
            priceAlerts: boolean
            systemAlerts: boolean
            dailySummary: boolean
        }
    }
    trading: {
        defaultRiskPercent: number
        autoTrading: boolean
        maxDailyTrades: number
        preferredTimeframe: string
        tradingHours: {
            start: string
            end: string
        }
    }
    display: {
        theme: 'light' | 'dark' | 'system'
        compactMode: boolean
        showAdvancedMetrics: boolean
        chartType: 'candlestick' | 'line' | 'area'
    }
}

export default function SettingsPage() {
    const [settings, setSettings] = useState<UserSettings | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [verifyingTelegram, setVerifyingTelegram] = useState(false)
    const [saveSuccess, setSaveSuccess] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        fetchSettings()
    }, [])

    const fetchSettings = async () => {
        try {
            setLoading(true)
            const response = await fetch('/api/user/settings')
            if (!response.ok) throw new Error('Failed to fetch settings')
            const data = await response.json()
            setSettings(data.settings)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred')
        } finally {
            setLoading(false)
        }
    }

    const saveSettings = async () => {
        try {
            setSaving(true)
            setSaveSuccess(false)
            const response = await fetch('/api/user/settings', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings)
            })

            if (!response.ok) throw new Error('Failed to save settings')

            setSaveSuccess(true)
            setTimeout(() => setSaveSuccess(false), 3000)
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to save settings')
        } finally {
            setSaving(false)
        }
    }

    const verifyTelegram = async () => {
        if (!settings?.telegram.botToken || !settings?.telegram.chatId) {
            alert('Please enter both Bot Token and Chat ID')
            return
        }

        try {
            setVerifyingTelegram(true)
            const response = await fetch('/api/telegram/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    botToken: settings.telegram.botToken,
                    chatId: settings.telegram.chatId
                })
            })

            if (!response.ok) throw new Error('Telegram verification failed')

            const data = await response.json()

            if (data.verified) {
                setSettings({
                    ...settings,
                    telegram: { ...settings.telegram, verified: true }
                })
                alert('Telegram verified successfully! You will now receive notifications.')
            } else {
                throw new Error('Verification failed. Please check your credentials.')
            }
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Verification failed')
        } finally {
            setVerifyingTelegram(false)
        }
    }

    const updateSetting = (section: keyof UserSettings, key: string, value: any) => {
        if (!settings) return
        setSettings({
            ...settings,
            [section]: {
                ...settings[section],
                [key]: value
            }
        })
    }

    const updateNestedSetting = (section: keyof UserSettings, subsection: string, key: string, value: any) => {
        if (!settings) return
        setSettings({
            ...settings,
            [section]: {
                ...settings[section],
                [subsection]: {
                    ...(settings[section] as any)[subsection],
                    [key]: value
                }
            }
        })
    }

    if (loading) {
        return (
            <div className="container mx-auto p-6 space-y-6">
                <Skeleton className="h-10 w-64" />
                <Skeleton className="h-96" />
            </div>
        )
    }

    if (error || !settings) {
        return (
            <div className="container mx-auto p-6">
                <Card className="border-red-200 bg-red-50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-red-600">
                            <AlertCircle className="h-5 w-5" />
                            Error Loading Settings
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-red-600">{error}</p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                    <p className="text-muted-foreground">
                        Manage your account preferences and configurations
                    </p>
                </div>
                <Button onClick={saveSettings} disabled={saving} size="lg">
                    {saveSuccess ? (
                        <>
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Saved!
                        </>
                    ) : (
                        <>
                            <Save className="h-4 w-4 mr-2" />
                            {saving ? 'Saving...' : 'Save Changes'}
                        </>
                    )}
                </Button>
            </div>

            {/* Settings Tabs */}
            <Tabs defaultValue="profile" className="space-y-6">
                <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="profile">
                        <User className="h-4 w-4 mr-2" />
                        Profile
                    </TabsTrigger>
                    <TabsTrigger value="notifications">
                        <Bell className="h-4 w-4 mr-2" />
                        Notifications
                    </TabsTrigger>
                    <TabsTrigger value="telegram">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Telegram
                    </TabsTrigger>
                    <TabsTrigger value="trading">
                        <Shield className="h-4 w-4 mr-2" />
                        Trading
                    </TabsTrigger>
                    <TabsTrigger value="display">
                        <Palette className="h-4 w-4 mr-2" />
                        Display
                    </TabsTrigger>
                </TabsList>

                {/* Profile Tab */}
                <TabsContent value="profile" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Profile Information</CardTitle>
                            <CardDescription>Update your personal information</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input
                                    id="name"
                                    value={settings.profile.name}
                                    onChange={(e) => updateSetting('profile', 'name', e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={settings.profile.email}
                                    onChange={(e) => updateSetting('profile', 'email', e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="timezone">Timezone</Label>
                                <Select
                                    value={settings.profile.timezone}
                                    onValueChange={(value) => updateSetting('profile', 'timezone', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="UTC">UTC</SelectItem>
                                        <SelectItem value="America/New_York">Eastern Time</SelectItem>
                                        <SelectItem value="America/Chicago">Central Time</SelectItem>
                                        <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                                        <SelectItem value="Europe/London">London</SelectItem>
                                        <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                                        <SelectItem value="Asia/Dubai">Dubai</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="language">Language</Label>
                                <Select
                                    value={settings.profile.language}
                                    onValueChange={(value) => updateSetting('profile', 'language', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="en">English</SelectItem>
                                        <SelectItem value="es">Spanish</SelectItem>
                                        <SelectItem value="fr">French</SelectItem>
                                        <SelectItem value="de">German</SelectItem>
                                        <SelectItem value="ja">Japanese</SelectItem>
                                        <SelectItem value="zh">Chinese</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Notifications Tab */}
                <TabsContent value="notifications" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Notification Preferences</CardTitle>
                            <CardDescription>Choose how you want to be notified</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Email Notifications</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Receive notifications via email
                                    </p>
                                </div>
                                <Switch
                                    checked={settings.notifications.emailNotifications}
                                    onCheckedChange={(checked) => updateSetting('notifications', 'emailNotifications', checked)}
                                />
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Push Notifications</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Receive browser push notifications
                                    </p>
                                </div>
                                <Switch
                                    checked={settings.notifications.pushNotifications}
                                    onCheckedChange={(checked) => updateSetting('notifications', 'pushNotifications', checked)}
                                />
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Trading Alerts</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Get notified about new trading signals
                                    </p>
                                </div>
                                <Switch
                                    checked={settings.notifications.tradingAlerts}
                                    onCheckedChange={(checked) => updateSetting('notifications', 'tradingAlerts', checked)}
                                />
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>System Updates</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Important system announcements
                                    </p>
                                </div>
                                <Switch
                                    checked={settings.notifications.systemUpdates}
                                    onCheckedChange={(checked) => updateSetting('notifications', 'systemUpdates', checked)}
                                />
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Weekly Reports</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Weekly performance summary emails
                                    </p>
                                </div>
                                <Switch
                                    checked={settings.notifications.weeklyReports}
                                    onCheckedChange={(checked) => updateSetting('notifications', 'weeklyReports', checked)}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Telegram Tab */}
                <TabsContent value="telegram" className="space-y-6">
                    <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        <MessageSquare className="h-5 w-5 text-blue-600" />
                                        Telegram Integration
                                    </CardTitle>
                                    <CardDescription>
                                        Receive trading signals directly in Telegram
                                    </CardDescription>
                                </div>
                                {settings.telegram.verified && (
                                    <Badge className="bg-green-600">
                                        <CheckCircle2 className="h-3 w-3 mr-1" />
                                        Verified
                                    </Badge>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Enable Telegram */}
                            <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Enable Telegram Notifications</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Turn on to receive signals via Telegram
                                    </p>
                                </div>
                                <Switch
                                    checked={settings.telegram.enabled}
                                    onCheckedChange={(checked) => updateSetting('telegram', 'enabled', checked)}
                                />
                            </div>

                            {settings.telegram.enabled && (
                                <>
                                    {/* Setup Instructions */}
                                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                        <h4 className="font-semibold mb-2 text-blue-900">Setup Instructions:</h4>
                                        <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
                                            <li>Open Telegram and search for <code className="bg-blue-100 px-2 py-1 rounded">@BotFather</code></li>
                                            <li>Send <code className="bg-blue-100 px-2 py-1 rounded">/newbot</code> and follow instructions</li>
                                            <li>Copy the Bot Token provided by BotFather</li>
                                            <li>Search for <code className="bg-blue-100 px-2 py-1 rounded">@userinfobot</code> to get your Chat ID</li>
                                            <li>Paste both values below and click Verify</li>
                                        </ol>
                                    </div>

                                    {/* Bot Token */}
                                    <div className="space-y-2">
                                        <Label htmlFor="botToken">Bot Token</Label>
                                        <Input
                                            id="botToken"
                                            type="password"
                                            placeholder="1234567890:ABCdefGHIjklMNOpqrsTUVwxyz"
                                            value={settings.telegram.botToken}
                                            onChange={(e) => updateSetting('telegram', 'botToken', e.target.value)}
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Get this from @BotFather on Telegram
                                        </p>
                                    </div>

                                    {/* Chat ID */}
                                    <div className="space-y-2">
                                        <Label htmlFor="chatId">Chat ID</Label>
                                        <Input
                                            id="chatId"
                                            placeholder="123456789"
                                            value={settings.telegram.chatId}
                                            onChange={(e) => updateSetting('telegram', 'chatId', e.target.value)}
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Get this from @userinfobot on Telegram
                                        </p>
                                    </div>

                                    {/* Verify Button */}
                                    <Button
                                        onClick={verifyTelegram}
                                        disabled={verifyingTelegram || !settings.telegram.botToken || !settings.telegram.chatId}
                                        className="w-full"
                                        variant={settings.telegram.verified ? 'outline' : 'default'}
                                    >
                                        {verifyingTelegram ? 'Verifying...' : settings.telegram.verified ? 'Re-verify Connection' : 'Verify Telegram'}
                                    </Button>

                                    {settings.telegram.verified && (
                                        <>
                                            <Separator />

                                            {/* Notification Types */}
                                            <div className="space-y-4">
                                                <h4 className="font-semibold">Notification Types</h4>

                                                <div className="flex items-center justify-between">
                                                    <div className="space-y-0.5">
                                                        <Label>Trading Signals</Label>
                                                        <p className="text-sm text-muted-foreground">
                                                            New BUY/SELL signals
                                                        </p>
                                                    </div>
                                                    <Switch
                                                        checked={settings.telegram.notifications.signals}
                                                        onCheckedChange={(checked) => updateNestedSetting('telegram', 'notifications', 'signals', checked)}
                                                    />
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <div className="space-y-0.5">
                                                        <Label>Price Alerts</Label>
                                                        <p className="text-sm text-muted-foreground">
                                                            Watchlist price alerts
                                                        </p>
                                                    </div>
                                                    <Switch
                                                        checked={settings.telegram.notifications.priceAlerts}
                                                        onCheckedChange={(checked) => updateNestedSetting('telegram', 'notifications', 'priceAlerts', checked)}
                                                    />
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <div className="space-y-0.5">
                                                        <Label>System Alerts</Label>
                                                        <p className="text-sm text-muted-foreground">
                                                            Important system notifications
                                                        </p>
                                                    </div>
                                                    <Switch
                                                        checked={settings.telegram.notifications.systemAlerts}
                                                        onCheckedChange={(checked) => updateNestedSetting('telegram', 'notifications', 'systemAlerts', checked)}
                                                    />
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <div className="space-y-0.5">
                                                        <Label>Daily Summary</Label>
                                                        <p className="text-sm text-muted-foreground">
                                                            Daily performance report
                                                        </p>
                                                    </div>
                                                    <Switch
                                                        checked={settings.telegram.notifications.dailySummary}
                                                        onCheckedChange={(checked) => updateNestedSetting('telegram', 'notifications', 'dailySummary', checked)}
                                                    />
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Trading Tab */}
                <TabsContent value="trading" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Trading Preferences</CardTitle>
                            <CardDescription>Configure your trading parameters</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="riskPercent">Default Risk Per Trade (%)</Label>
                                <Input
                                    id="riskPercent"
                                    type="number"
                                    min="0.1"
                                    max="10"
                                    step="0.1"
                                    value={settings.trading.defaultRiskPercent}
                                    onChange={(e) => updateSetting('trading', 'defaultRiskPercent', parseFloat(e.target.value))}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Recommended: 1-2% per trade
                                </p>
                            </div>

                            <Separator />

                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Auto Trading</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Automatically execute signals via MT4/MT5
                                    </p>
                                </div>
                                <Switch
                                    checked={settings.trading.autoTrading}
                                    onCheckedChange={(checked) => updateSetting('trading', 'autoTrading', checked)}
                                />
                            </div>

                            <Separator />

                            <div className="space-y-2">
                                <Label htmlFor="maxTrades">Maximum Daily Trades</Label>
                                <Input
                                    id="maxTrades"
                                    type="number"
                                    min="1"
                                    max="20"
                                    value={settings.trading.maxDailyTrades}
                                    onChange={(e) => updateSetting('trading', 'maxDailyTrades', parseInt(e.target.value))}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="timeframe">Preferred Timeframe</Label>
                                <Select
                                    value={settings.trading.preferredTimeframe}
                                    onValueChange={(value) => updateSetting('trading', 'preferredTimeframe', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="15m">15 Minutes</SelectItem>
                                        <SelectItem value="1h">1 Hour</SelectItem>
                                        <SelectItem value="4h">4 Hours</SelectItem>
                                        <SelectItem value="1d">1 Day</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <Separator />

                            <div className="space-y-4">
                                <Label>Trading Hours</Label>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="startTime" className="text-sm">Start Time</Label>
                                        <Input
                                            id="startTime"
                                            type="time"
                                            value={settings.trading.tradingHours.start}
                                            onChange={(e) => updateNestedSetting('trading', 'tradingHours', 'start', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="endTime" className="text-sm">End Time</Label>
                                        <Input
                                            id="endTime"
                                            type="time"
                                            value={settings.trading.tradingHours.end}
                                            onChange={(e) => updateNestedSetting('trading', 'tradingHours', 'end', e.target.value)}
                                        />
                                    </div>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Only receive signals during these hours
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Display Tab */}
                <TabsContent value="display" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Display Preferences</CardTitle>
                            <CardDescription>Customize your interface</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="theme">Theme</Label>
                                <Select
                                    value={settings.display.theme}
                                    onValueChange={(value: 'light' | 'dark' | 'system') => updateSetting('display', 'theme', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="light">Light</SelectItem>
                                        <SelectItem value="dark">Dark</SelectItem>
                                        <SelectItem value="system">System</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <Separator />

                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Compact Mode</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Reduce spacing for more content
                                    </p>
                                </div>
                                <Switch
                                    checked={settings.display.compactMode}
                                    onCheckedChange={(checked) => updateSetting('display', 'compactMode', checked)}
                                />
                            </div>

                            <Separator />

                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Show Advanced Metrics</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Display technical indicators and advanced stats
                                    </p>
                                </div>
                                <Switch
                                    checked={settings.display.showAdvancedMetrics}
                                    onCheckedChange={(checked) => updateSetting('display', 'showAdvancedMetrics', checked)}
                                />
                            </div>

                            <Separator />

                            <div className="space-y-2">
                                <Label htmlFor="chartType">Default Chart Type</Label>
                                <Select
                                    value={settings.display.chartType}
                                    onValueChange={(value: 'candlestick' | 'line' | 'area') => updateSetting('display', 'chartType', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="candlestick">Candlestick</SelectItem>
                                        <SelectItem value="line">Line</SelectItem>
                                        <SelectItem value="area">Area</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
