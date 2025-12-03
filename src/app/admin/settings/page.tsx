"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Save, Settings as SettingsIcon, TrendingUp, Zap, Shield, Database } from "lucide-react"

interface SystemSettings {
    id: string
    minSignalConfidence: number
    maxSignalConfidence: number
    backtestConfidenceMin: number
    backtestConfidenceMax: number
    apiRateLimitPerMinute: number
    apiRateLimitPerHour: number
    priceCacheTTL: number
    signalCacheTTL: number
    userSessionTTL: number
    wsMaxConnections: number
    wsHeartbeatInterval: number
    enableRedisCache: boolean
    enableCDN: boolean
    enableLoadBalancing: boolean
    enableVolumeProfile: boolean
    enableOrderFlow: boolean
    enableAdvancedRisk: boolean
}

export default function AdminSettingsPage() {
    const { data: session } = useSession()
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")
    const [settings, setSettings] = useState<SystemSettings | null>(null)

    useEffect(() => {
        if (session?.user?.role !== "admin") {
            router.push("/dashboard")
            return
        }
        fetchSettings()
    }, [session, router])

    const fetchSettings = async () => {
        try {
            const response = await fetch("/api/admin/settings")
            const data = await response.json()

            if (data.success) {
                setSettings(data.settings)
            } else {
                setError(data.error || "Failed to load settings")
            }
        } catch (err) {
            setError("Failed to load settings")
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async () => {
        if (!settings) return

        setSaving(true)
        setError("")
        setSuccess("")

        try {
            const response = await fetch("/api/admin/settings", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(settings)
            })

            const data = await response.json()

            if (data.success) {
                setSuccess("Settings saved successfully!")
                setSettings(data.settings)
            } else {
                setError(data.error || "Failed to save settings")
            }
        } catch (err) {
            setError("Failed to save settings")
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
            </div>
        )
    }

    if (!settings) {
        return (
            <div className="p-6">
                <Alert variant="destructive">
                    <AlertDescription>Failed to load settings</AlertDescription>
                </Alert>
            </div>
        )
    }

    return (
        <div className="p-6 space-y-6 bg-slate-950 min-h-screen">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                        <SettingsIcon className="h-8 w-8 text-purple-400" />
                        System Settings
                    </h1>
                    <p className="text-slate-400 mt-1">Configure platform parameters and features</p>
                </div>
                <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-purple-600 hover:bg-purple-700"
                >
                    {saving ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                        </>
                    ) : (
                        <>
                            <Save className="mr-2 h-4 w-4" />
                            Save Changes
                        </>
                    )}
                </Button>
            </div>

            {error && (
                <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {success && (
                <Alert className="bg-green-500/10 border-green-500 text-green-500">
                    <AlertDescription>{success}</AlertDescription>
                </Alert>
            )}

            <Tabs defaultValue="signals" className="space-y-6">
                <TabsList className="bg-slate-800 border-slate-700">
                    <TabsTrigger value="signals" className="text-slate-300">
                        <TrendingUp className="h-4 w-4 mr-2" />
                        Signal Settings
                    </TabsTrigger>
                    <TabsTrigger value="performance" className="text-slate-300">
                        <Zap className="h-4 w-4 mr-2" />
                        Performance
                    </TabsTrigger>
                    <TabsTrigger value="security" className="text-slate-300">
                        <Shield className="h-4 w-4 mr-2" />
                        Security
                    </TabsTrigger>
                    <TabsTrigger value="features" className="text-slate-300">
                        <Database className="h-4 w-4 mr-2" />
                        Features
                    </TabsTrigger>
                </TabsList>

                {/* Signal Settings Tab */}
                <TabsContent value="signals" className="space-y-6">
                    <Card className="bg-slate-800 border-slate-700">
                        <CardHeader>
                            <CardTitle className="text-white">Signal Confidence Thresholds</CardTitle>
                            <CardDescription className="text-slate-400">
                                Configure minimum and maximum confidence levels for signal generation
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-4">
                                <div>
                                    <Label className="text-white">
                                        Minimum Signal Confidence: {settings.minSignalConfidence}%
                                    </Label>
                                    <p className="text-sm text-slate-400 mb-2">
                                        Signals below this threshold will be filtered out
                                    </p>
                                    <Slider
                                        value={[settings.minSignalConfidence]}
                                        onValueChange={(value) => setSettings({ ...settings, minSignalConfidence: value[0] })}
                                        min={50}
                                        max={95}
                                        step={5}
                                        className="mt-2"
                                    />
                                    <div className="flex justify-between text-xs text-slate-500 mt-1">
                                        <span>50%</span>
                                        <span>95%</span>
                                    </div>
                                </div>

                                <div>
                                    <Label className="text-white">
                                        Maximum Signal Confidence: {settings.maxSignalConfidence}%
                                    </Label>
                                    <p className="text-sm text-slate-400 mb-2">
                                        Cap for signal confidence scores
                                    </p>
                                    <Slider
                                        value={[settings.maxSignalConfidence]}
                                        onValueChange={(value) => setSettings({ ...settings, maxSignalConfidence: value[0] })}
                                        min={75}
                                        max={100}
                                        step={5}
                                        className="mt-2"
                                    />
                                    <div className="flex justify-between text-xs text-slate-500 mt-1">
                                        <span>75%</span>
                                        <span>100%</span>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-700">
                                <h3 className="text-white font-semibold mb-4">Backtesting Configuration</h3>
                                <div className="space-y-4">
                                    <div>
                                        <Label className="text-white">
                                            Backtest Min Confidence: {settings.backtestConfidenceMin}%
                                        </Label>
                                        <Slider
                                            value={[settings.backtestConfidenceMin]}
                                            onValueChange={(value) => setSettings({ ...settings, backtestConfidenceMin: value[0] })}
                                            min={50}
                                            max={95}
                                            step={5}
                                            className="mt-2"
                                        />
                                    </div>

                                    <div>
                                        <Label className="text-white">
                                            Backtest Max Confidence: {settings.backtestConfidenceMax}%
                                        </Label>
                                        <Slider
                                            value={[settings.backtestConfidenceMax]}
                                            onValueChange={(value) => setSettings({ ...settings, backtestConfidenceMax: value[0] })}
                                            min={75}
                                            max={100}
                                            step={5}
                                            className="mt-2"
                                        />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Performance Tab */}
                <TabsContent value="performance" className="space-y-6">
                    <Card className="bg-slate-800 border-slate-700">
                        <CardHeader>
                            <CardTitle className="text-white">Cache Settings</CardTitle>
                            <CardDescription className="text-slate-400">
                                Configure cache TTL (Time To Live) in seconds
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <Label className="text-white">Price Cache TTL (seconds)</Label>
                                    <Input
                                        type="number"
                                        value={settings.priceCacheTTL}
                                        onChange={(e) => setSettings({ ...settings, priceCacheTTL: parseInt(e.target.value) })}
                                        className="bg-slate-900 border-slate-700 text-white mt-2"
                                    />
                                </div>

                                <div>
                                    <Label className="text-white">Signal Cache TTL (seconds)</Label>
                                    <Input
                                        type="number"
                                        value={settings.signalCacheTTL}
                                        onChange={(e) => setSettings({ ...settings, signalCacheTTL: parseInt(e.target.value) })}
                                        className="bg-slate-900 border-slate-700 text-white mt-2"
                                    />
                                </div>

                                <div>
                                    <Label className="text-white">Session TTL (seconds)</Label>
                                    <Input
                                        type="number"
                                        value={settings.userSessionTTL}
                                        onChange={(e) => setSettings({ ...settings, userSessionTTL: parseInt(e.target.value) })}
                                        className="bg-slate-900 border-slate-700 text-white mt-2"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-slate-700">
                                <div>
                                    <Label className="text-white">Enable Redis Cache</Label>
                                    <p className="text-sm text-slate-400">Use Redis for caching (recommended)</p>
                                </div>
                                <Switch
                                    checked={settings.enableRedisCache}
                                    onCheckedChange={(checked) => setSettings({ ...settings, enableRedisCache: checked })}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <Label className="text-white">Enable CDN</Label>
                                    <p className="text-sm text-slate-400">Use CDN for static assets</p>
                                </div>
                                <Switch
                                    checked={settings.enableCDN}
                                    onCheckedChange={(checked) => setSettings({ ...settings, enableCDN: checked })}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <Label className="text-white">Enable Load Balancing</Label>
                                    <p className="text-sm text-slate-400">Distribute traffic across servers</p>
                                </div>
                                <Switch
                                    checked={settings.enableLoadBalancing}
                                    onCheckedChange={(checked) => setSettings({ ...settings, enableLoadBalancing: checked })}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-800 border-slate-700">
                        <CardHeader>
                            <CardTitle className="text-white">WebSocket Settings</CardTitle>
                            <CardDescription className="text-slate-400">
                                Configure real-time connection parameters
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-white">Max Connections</Label>
                                    <Input
                                        type="number"
                                        value={settings.wsMaxConnections}
                                        onChange={(e) => setSettings({ ...settings, wsMaxConnections: parseInt(e.target.value) })}
                                        className="bg-slate-900 border-slate-700 text-white mt-2"
                                    />
                                </div>

                                <div>
                                    <Label className="text-white">Heartbeat Interval (seconds)</Label>
                                    <Input
                                        type="number"
                                        value={settings.wsHeartbeatInterval}
                                        onChange={(e) => setSettings({ ...settings, wsHeartbeatInterval: parseInt(e.target.value) })}
                                        className="bg-slate-900 border-slate-700 text-white mt-2"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Security Tab */}
                <TabsContent value="security" className="space-y-6">
                    <Card className="bg-slate-800 border-slate-700">
                        <CardHeader>
                            <CardTitle className="text-white">Rate Limiting</CardTitle>
                            <CardDescription className="text-slate-400">
                                Configure API rate limits to prevent abuse
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-white">Requests Per Minute</Label>
                                    <Input
                                        type="number"
                                        value={settings.apiRateLimitPerMinute}
                                        onChange={(e) => setSettings({ ...settings, apiRateLimitPerMinute: parseInt(e.target.value) })}
                                        className="bg-slate-900 border-slate-700 text-white mt-2"
                                    />
                                </div>

                                <div>
                                    <Label className="text-white">Requests Per Hour</Label>
                                    <Input
                                        type="number"
                                        value={settings.apiRateLimitPerHour}
                                        onChange={(e) => setSettings({ ...settings, apiRateLimitPerHour: parseInt(e.target.value) })}
                                        className="bg-slate-900 border-slate-700 text-white mt-2"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Features Tab */}
                <TabsContent value="features" className="space-y-6">
                    <Card className="bg-slate-800 border-slate-700">
                        <CardHeader>
                            <CardTitle className="text-white">Advanced Features</CardTitle>
                            <CardDescription className="text-slate-400">
                                Enable or disable advanced trading features
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <Label className="text-white">Volume Profile Analysis</Label>
                                    <p className="text-sm text-slate-400">POC, VAH, VAL detection</p>
                                </div>
                                <Switch
                                    checked={settings.enableVolumeProfile}
                                    onCheckedChange={(checked) => setSettings({ ...settings, enableVolumeProfile: checked })}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <Label className="text-white">Order Flow Analysis</Label>
                                    <p className="text-sm text-slate-400">Delta, cumulative delta, imbalance</p>
                                </div>
                                <Switch
                                    checked={settings.enableOrderFlow}
                                    onCheckedChange={(checked) => setSettings({ ...settings, enableOrderFlow: checked })}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <Label className="text-white">Advanced Risk Management</Label>
                                    <p className="text-sm text-slate-400">VaR, Monte Carlo, correlation matrix</p>
                                </div>
                                <Switch
                                    checked={settings.enableAdvancedRisk}
                                    onCheckedChange={(checked) => setSettings({ ...settings, enableAdvancedRisk: checked })}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
