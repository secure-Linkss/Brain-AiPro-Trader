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
import { Shield, MessageSquare, Database, Bell, Zap, Server, Lock, CheckCircle2, AlertCircle, Activity } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

interface AdminSettings {
    system: {
        maintenanceMode: boolean
        allowNewRegistrations: boolean
        maxUsersPerPlan: {
            free: number
            pro: number
            enterprise: number
        }
        sessionTimeout: number
        apiRateLimit: number
    }
    telegram: {
        enabled: boolean
        botToken: string
        adminChatId: string
        verified: boolean
        notifications: {
            securityAlerts: boolean
            systemErrors: boolean
            newUserRegistrations: boolean
            subscriptionChanges: boolean
            backtestingResults: boolean
            performanceAlerts: boolean
            databaseBackups: boolean
            apiErrors: boolean
        }
        alertThresholds: {
            errorRate: number
            responseTime: number
            cpuUsage: number
            memoryUsage: number
        }
    }
    database: {
        autoBackup: boolean
        backupFrequency: string
        retentionDays: number
        backupLocation: string
    }
    security: {
        twoFactorRequired: boolean
        passwordMinLength: number
        passwordRequireSpecialChars: boolean
        maxLoginAttempts: number
        ipWhitelist: string[]
        suspiciousActivityDetection: boolean
    }
    notifications: {
        emailAlerts: boolean
        slackWebhook: string
        discordWebhook: string
    }
    performance: {
        enableCaching: boolean
        cacheTimeout: number
        enableCompression: boolean
        maxConcurrentRequests: number
    }
}

export default function AdminSettingsPage() {
    const [settings, setSettings] = useState<AdminSettings | null>(null)
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
            const response = await fetch('/api/admin/settings')
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
            const response = await fetch('/api/admin/settings', {
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
        if (!settings?.telegram.botToken || !settings?.telegram.adminChatId) {
            alert('Please enter both Bot Token and Admin Chat ID')
            return
        }

        try {
            setVerifyingTelegram(true)
            const response = await fetch('/api/admin/telegram/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    botToken: settings.telegram.botToken,
                    chatId: settings.telegram.adminChatId
                })
            })

            if (!response.ok) throw new Error('Telegram verification failed')

            const data = await response.json()

            if (data.verified) {
                setSettings({
                    ...settings,
                    telegram: { ...settings.telegram, verified: true }
                })
                alert('Admin Telegram verified! System alerts will be sent to this chat.')
            } else {
                throw new Error('Verification failed. Please check your credentials.')
            }
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Verification failed')
        } finally {
            setVerifyingTelegram(false)
        }
    }

    const testTelegramAlert = async () => {
        try {
            const response = await fetch('/api/admin/telegram/test', {
                method: 'POST'
            })
            if (!response.ok) throw new Error('Failed to send test alert')
            alert('Test alert sent! Check your Telegram.')
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to send test')
        }
    }

    const updateSetting = (section: keyof AdminSettings, key: string, value: any) => {
        if (!settings) return
        setSettings({
            ...settings,
            [section]: {
                ...settings[section],
                [key]: value
            }
        })
    }

    const updateNestedSetting = (section: keyof AdminSettings, subsection: string, key: string, value: any) => {
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
                            Error Loading Admin Settings
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
            <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 p-8 text-white">
                <div className="relative z-10 flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                            <Shield className="h-10 w-10" />
                            Admin Settings
                        </h1>
                        <p className="text-red-100">System-wide configuration and security</p>
                    </div>
                    <Button onClick={saveSettings} disabled={saving} size="lg" variant="secondary">
                        {saveSuccess ? (
                            <>
                                <CheckCircle2 className="h-4 w-4 mr-2" />
                                Saved!
                            </>
                        ) : (
                            <>
                                <Shield className="h-4 w-4 mr-2" />
                                {saving ? 'Saving...' : 'Save Settings'}
                            </>
                        )}
                    </Button>
                </div>
            </div>

            {/* Settings Tabs */}
            <Tabs defaultValue="system" className="space-y-6">
                <TabsList className="grid w-full grid-cols-6">
                    <TabsTrigger value="system">
                        <Server className="h-4 w-4 mr-2" />
                        System
                    </TabsTrigger>
                    <TabsTrigger value="telegram">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Telegram
                    </TabsTrigger>
                    <TabsTrigger value="security">
                        <Lock className="h-4 w-4 mr-2" />
                        Security
                    </TabsTrigger>
                    <TabsTrigger value="database">
                        <Database className="h-4 w-4 mr-2" />
                        Database
                    </TabsTrigger>
                    <TabsTrigger value="notifications">
                        <Bell className="h-4 w-4 mr-2" />
                        Alerts
                    </TabsTrigger>
                    <TabsTrigger value="performance">
                        <Zap className="h-4 w-4 mr-2" />
                        Performance
                    </TabsTrigger>
                </TabsList>

                {/* System Tab */}
                <TabsContent value="system" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>System Configuration</CardTitle>
                            <CardDescription>Core system settings</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg">
                                <div className="space-y-0.5">
                                    <Label className="text-base text-red-900">Maintenance Mode</Label>
                                    <p className="text-sm text-red-700">
                                        Disable user access for system maintenance
                                    </p>
                                </div>
                                <Switch
                                    checked={settings.system.maintenanceMode}
                                    onCheckedChange={(checked) => updateSetting('system', 'maintenanceMode', checked)}
                                />
                            </div>

                            <Separator />

                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Allow New Registrations</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Enable new user sign-ups
                                    </p>
                                </div>
                                <Switch
                                    checked={settings.system.allowNewRegistrations}
                                    onCheckedChange={(checked) => updateSetting('system', 'allowNewRegistrations', checked)}
                                />
                            </div>

                            <Separator />

                            <div className="space-y-4">
                                <Label>Maximum Users Per Plan</Label>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="maxFree" className="text-sm">Free Plan</Label>
                                        <Input
                                            id="maxFree"
                                            type="number"
                                            value={settings.system.maxUsersPerPlan.free}
                                            onChange={(e) => updateNestedSetting('system', 'maxUsersPerPlan', 'free', parseInt(e.target.value))}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="maxPro" className="text-sm">Pro Plan</Label>
                                        <Input
                                            id="maxPro"
                                            type="number"
                                            value={settings.system.maxUsersPerPlan.pro}
                                            onChange={(e) => updateNestedSetting('system', 'maxUsersPerPlan', 'pro', parseInt(e.target.value))}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="maxEnterprise" className="text-sm">Enterprise</Label>
                                        <Input
                                            id="maxEnterprise"
                                            type="number"
                                            value={settings.system.maxUsersPerPlan.enterprise}
                                            onChange={(e) => updateNestedSetting('system', 'maxUsersPerPlan', 'enterprise', parseInt(e.target.value))}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                                <Input
                                    id="sessionTimeout"
                                    type="number"
                                    value={settings.system.sessionTimeout}
                                    onChange={(e) => updateSetting('system', 'sessionTimeout', parseInt(e.target.value))}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="apiRateLimit">API Rate Limit (requests/minute)</Label>
                                <Input
                                    id="apiRateLimit"
                                    type="number"
                                    value={settings.system.apiRateLimit}
                                    onChange={(e) => updateSetting('system', 'apiRateLimit', parseInt(e.target.value))}
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
                                        Admin Telegram Integration
                                    </CardTitle>
                                    <CardDescription>
                                        Receive critical system alerts and monitoring updates
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
                                    <Label className="text-base">Enable Admin Telegram Alerts</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Receive system monitoring and security alerts
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
                                        <h4 className="font-semibold mb-2 text-blue-900">Admin Setup:</h4>
                                        <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
                                            <li>Create a dedicated admin bot via <code className="bg-blue-100 px-2 py-1 rounded">@BotFather</code></li>
                                            <li>Get the Bot Token from BotFather</li>
                                            <li>Create a private admin group/channel in Telegram</li>
                                            <li>Add your bot to the group and make it admin</li>
                                            <li>Get the Chat ID using <code className="bg-blue-100 px-2 py-1 rounded">@userinfobot</code></li>
                                            <li>Configure alert thresholds below</li>
                                        </ol>
                                    </div>

                                    {/* Bot Token */}
                                    <div className="space-y-2">
                                        <Label htmlFor="adminBotToken">Admin Bot Token</Label>
                                        <Input
                                            id="adminBotToken"
                                            type="password"
                                            placeholder="1234567890:ABCdefGHIjklMNOpqrsTUVwxyz"
                                            value={settings.telegram.botToken}
                                            onChange={(e) => updateSetting('telegram', 'botToken', e.target.value)}
                                        />
                                    </div>

                                    {/* Admin Chat ID */}
                                    <div className="space-y-2">
                                        <Label htmlFor="adminChatId">Admin Chat/Group ID</Label>
                                        <Input
                                            id="adminChatId"
                                            placeholder="-1001234567890"
                                            value={settings.telegram.adminChatId}
                                            onChange={(e) => updateSetting('telegram', 'adminChatId', e.target.value)}
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Use negative number for groups/channels
                                        </p>
                                    </div>

                                    {/* Verify & Test Buttons */}
                                    <div className="flex gap-4">
                                        <Button
                                            onClick={verifyTelegram}
                                            disabled={verifyingTelegram}
                                            className="flex-1"
                                            variant={settings.telegram.verified ? 'outline' : 'default'}
                                        >
                                            {verifyingTelegram ? 'Verifying...' : settings.telegram.verified ? 'Re-verify' : 'Verify Connection'}
                                        </Button>
                                        {settings.telegram.verified && (
                                            <Button onClick={testTelegramAlert} variant="outline" className="flex-1">
                                                <Activity className="h-4 w-4 mr-2" />
                                                Send Test Alert
                                            </Button>
                                        )}
                                    </div>

                                    {settings.telegram.verified && (
                                        <>
                                            <Separator />

                                            {/* Alert Types */}
                                            <div className="space-y-4">
                                                <h4 className="font-semibold">Alert Types</h4>

                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                                                        <Label className="text-sm">Security Alerts</Label>
                                                        <Switch
                                                            checked={settings.telegram.notifications.securityAlerts}
                                                            onCheckedChange={(checked) => updateNestedSetting('telegram', 'notifications', 'securityAlerts', checked)}
                                                        />
                                                    </div>

                                                    <div className="flex items-center justify-between p-3 bg-orange-50 border border-orange-200 rounded-lg">
                                                        <Label className="text-sm">System Errors</Label>
                                                        <Switch
                                                            checked={settings.telegram.notifications.systemErrors}
                                                            onCheckedChange={(checked) => updateNestedSetting('telegram', 'notifications', 'systemErrors', checked)}
                                                        />
                                                    </div>

                                                    <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                                        <Label className="text-sm">New Users</Label>
                                                        <Switch
                                                            checked={settings.telegram.notifications.newUserRegistrations}
                                                            onCheckedChange={(checked) => updateNestedSetting('telegram', 'notifications', 'newUserRegistrations', checked)}
                                                        />
                                                    </div>

                                                    <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                                                        <Label className="text-sm">Subscriptions</Label>
                                                        <Switch
                                                            checked={settings.telegram.notifications.subscriptionChanges}
                                                            onCheckedChange={(checked) => updateNestedSetting('telegram', 'notifications', 'subscriptionChanges', checked)}
                                                        />
                                                    </div>

                                                    <div className="flex items-center justify-between p-3 bg-purple-50 border border-purple-200 rounded-lg">
                                                        <Label className="text-sm">Backtest Results</Label>
                                                        <Switch
                                                            checked={settings.telegram.notifications.backtestingResults}
                                                            onCheckedChange={(checked) => updateNestedSetting('telegram', 'notifications', 'backtestingResults', checked)}
                                                        />
                                                    </div>

                                                    <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                                        <Label className="text-sm">Performance</Label>
                                                        <Switch
                                                            checked={settings.telegram.notifications.performanceAlerts}
                                                            onCheckedChange={(checked) => updateNestedSetting('telegram', 'notifications', 'performanceAlerts', checked)}
                                                        />
                                                    </div>

                                                    <div className="flex items-center justify-between p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
                                                        <Label className="text-sm">DB Backups</Label>
                                                        <Switch
                                                            checked={settings.telegram.notifications.databaseBackups}
                                                            onCheckedChange={(checked) => updateNestedSetting('telegram', 'notifications', 'databaseBackups', checked)}
                                                        />
                                                    </div>

                                                    <div className="flex items-center justify-between p-3 bg-pink-50 border border-pink-200 rounded-lg">
                                                        <Label className="text-sm">API Errors</Label>
                                                        <Switch
                                                            checked={settings.telegram.notifications.apiErrors}
                                                            onCheckedChange={(checked) => updateNestedSetting('telegram', 'notifications', 'apiErrors', checked)}
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <Separator />

                                            {/* Alert Thresholds */}
                                            <div className="space-y-4">
                                                <h4 className="font-semibold">Alert Thresholds</h4>
                                                <p className="text-sm text-muted-foreground">
                                                    Receive alerts when these thresholds are exceeded
                                                </p>

                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="errorRate">Error Rate (%)</Label>
                                                        <Input
                                                            id="errorRate"
                                                            type="number"
                                                            min="0"
                                                            max="100"
                                                            value={settings.telegram.alertThresholds.errorRate}
                                                            onChange={(e) => updateNestedSetting('telegram', 'alertThresholds', 'errorRate', parseFloat(e.target.value))}
                                                        />
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label htmlFor="responseTime">Response Time (ms)</Label>
                                                        <Input
                                                            id="responseTime"
                                                            type="number"
                                                            value={settings.telegram.alertThresholds.responseTime}
                                                            onChange={(e) => updateNestedSetting('telegram', 'alertThresholds', 'responseTime', parseInt(e.target.value))}
                                                        />
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label htmlFor="cpuUsage">CPU Usage (%)</Label>
                                                        <Input
                                                            id="cpuUsage"
                                                            type="number"
                                                            min="0"
                                                            max="100"
                                                            value={settings.telegram.alertThresholds.cpuUsage}
                                                            onChange={(e) => updateNestedSetting('telegram', 'alertThresholds', 'cpuUsage', parseFloat(e.target.value))}
                                                        />
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label htmlFor="memoryUsage">Memory Usage (%)</Label>
                                                        <Input
                                                            id="memoryUsage"
                                                            type="number"
                                                            min="0"
                                                            max="100"
                                                            value={settings.telegram.alertThresholds.memoryUsage}
                                                            onChange={(e) => updateNestedSetting('telegram', 'alertThresholds', 'memoryUsage', parseFloat(e.target.value))}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Security Tab */}
                <TabsContent value="security" className="space-y-6">
                    <Card className="border-red-200">
                        <CardHeader>
                            <CardTitle className="text-red-600">Security Settings</CardTitle>
                            <CardDescription>Configure system security policies</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg">
                                <div className="space-y-0.5">
                                    <Label className="text-base text-red-900">Require 2FA for All Users</Label>
                                    <p className="text-sm text-red-700">
                                        Enforce two-factor authentication
                                    </p>
                                </div>
                                <Switch
                                    checked={settings.security.twoFactorRequired}
                                    onCheckedChange={(checked) => updateSetting('security', 'twoFactorRequired', checked)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="passwordMinLength">Minimum Password Length</Label>
                                <Input
                                    id="passwordMinLength"
                                    type="number"
                                    min="8"
                                    max="32"
                                    value={settings.security.passwordMinLength}
                                    onChange={(e) => updateSetting('security', 'passwordMinLength', parseInt(e.target.value))}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Require Special Characters</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Passwords must contain special characters
                                    </p>
                                </div>
                                <Switch
                                    checked={settings.security.passwordRequireSpecialChars}
                                    onCheckedChange={(checked) => updateSetting('security', 'passwordRequireSpecialChars', checked)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
                                <Input
                                    id="maxLoginAttempts"
                                    type="number"
                                    min="3"
                                    max="10"
                                    value={settings.security.maxLoginAttempts}
                                    onChange={(e) => updateSetting('security', 'maxLoginAttempts', parseInt(e.target.value))}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Suspicious Activity Detection</Label>
                                    <p className="text-sm text-muted-foreground">
                                        AI-powered threat detection
                                    </p>
                                </div>
                                <Switch
                                    checked={settings.security.suspiciousActivityDetection}
                                    onCheckedChange={(checked) => updateSetting('security', 'suspiciousActivityDetection', checked)}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Database Tab */}
                <TabsContent value="database" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Database Configuration</CardTitle>
                            <CardDescription>Backup and maintenance settings</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Automatic Backups</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Enable scheduled database backups
                                    </p>
                                </div>
                                <Switch
                                    checked={settings.database.autoBackup}
                                    onCheckedChange={(checked) => updateSetting('database', 'autoBackup', checked)}
                                />
                            </div>

                            {settings.database.autoBackup && (
                                <>
                                    <div className="space-y-2">
                                        <Label htmlFor="backupFrequency">Backup Frequency</Label>
                                        <Select
                                            value={settings.database.backupFrequency}
                                            onValueChange={(value) => updateSetting('database', 'backupFrequency', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="hourly">Hourly</SelectItem>
                                                <SelectItem value="daily">Daily</SelectItem>
                                                <SelectItem value="weekly">Weekly</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="retentionDays">Retention Period (days)</Label>
                                        <Input
                                            id="retentionDays"
                                            type="number"
                                            min="7"
                                            max="365"
                                            value={settings.database.retentionDays}
                                            onChange={(e) => updateSetting('database', 'retentionDays', parseInt(e.target.value))}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="backupLocation">Backup Location</Label>
                                        <Input
                                            id="backupLocation"
                                            placeholder="s3://bucket-name/backups"
                                            value={settings.database.backupLocation}
                                            onChange={(e) => updateSetting('database', 'backupLocation', e.target.value)}
                                        />
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Notifications Tab */}
                <TabsContent value="notifications" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Additional Alert Channels</CardTitle>
                            <CardDescription>Configure alternative notification methods</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Email Alerts</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Send critical alerts via email
                                    </p>
                                </div>
                                <Switch
                                    checked={settings.notifications.emailAlerts}
                                    onCheckedChange={(checked) => updateSetting('notifications', 'emailAlerts', checked)}
                                />
                            </div>

                            <Separator />

                            <div className="space-y-2">
                                <Label htmlFor="slackWebhook">Slack Webhook URL</Label>
                                <Input
                                    id="slackWebhook"
                                    type="url"
                                    placeholder="https://hooks.slack.com/services/..."
                                    value={settings.notifications.slackWebhook}
                                    onChange={(e) => updateSetting('notifications', 'slackWebhook', e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="discordWebhook">Discord Webhook URL</Label>
                                <Input
                                    id="discordWebhook"
                                    type="url"
                                    placeholder="https://discord.com/api/webhooks/..."
                                    value={settings.notifications.discordWebhook}
                                    onChange={(e) => updateSetting('notifications', 'discordWebhook', e.target.value)}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Performance Tab */}
                <TabsContent value="performance" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Performance Optimization</CardTitle>
                            <CardDescription>Configure system performance settings</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Enable Caching</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Cache API responses for faster performance
                                    </p>
                                </div>
                                <Switch
                                    checked={settings.performance.enableCaching}
                                    onCheckedChange={(checked) => updateSetting('performance', 'enableCaching', checked)}
                                />
                            </div>

                            {settings.performance.enableCaching && (
                                <div className="space-y-2">
                                    <Label htmlFor="cacheTimeout">Cache Timeout (seconds)</Label>
                                    <Input
                                        id="cacheTimeout"
                                        type="number"
                                        value={settings.performance.cacheTimeout}
                                        onChange={(e) => updateSetting('performance', 'cacheTimeout', parseInt(e.target.value))}
                                    />
                                </div>
                            )}

                            <Separator />

                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Enable Compression</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Compress API responses (gzip)
                                    </p>
                                </div>
                                <Switch
                                    checked={settings.performance.enableCompression}
                                    onCheckedChange={(checked) => updateSetting('performance', 'enableCompression', checked)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="maxConcurrent">Max Concurrent Requests</Label>
                                <Input
                                    id="maxConcurrent"
                                    type="number"
                                    value={settings.performance.maxConcurrentRequests}
                                    onChange={(e) => updateSetting('performance', 'maxConcurrentRequests', parseInt(e.target.value))}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
