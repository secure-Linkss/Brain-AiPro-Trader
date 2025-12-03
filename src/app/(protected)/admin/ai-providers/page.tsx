"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Check, X, RefreshCw, Plus, Trash2, Eye, EyeOff,
    Zap, AlertCircle, CheckCircle2, Activity
} from "lucide-react"

interface AIProvider {
    id: string
    name: string
    displayName: string
    apiKey: string
    isActive: boolean
    isValidated: boolean
    lastValidated: string | null
    requestCount: number
    successRate: number
    avgResponseTime: number
}

const PROVIDERS = [
    { value: "gemini", label: "Gemini Flash 2.5", endpoint: "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent" },
    { value: "openai", label: "ChatGPT-4 Turbo", endpoint: "https://api.openai.com/v1/chat/completions" },
    { value: "claude", label: "Claude 3.5 Sonnet", endpoint: "https://api.anthropic.com/v1/messages" },
    { value: "openrouter", label: "OpenRouter", endpoint: "https://openrouter.ai/api/v1/chat/completions" },
]

export default function AIProvidersPage() {
    const { toast } = useToast()
    const [providers, setProviders] = useState<AIProvider[]>([])
    const [loading, setLoading] = useState(true)
    const [showApiKey, setShowApiKey] = useState<Record<string, boolean>>({})
    const [validating, setValidating] = useState<Record<string, boolean>>({})

    // New provider form
    const [newProvider, setNewProvider] = useState({
        name: "gemini",
        apiKey: ""
    })

    useEffect(() => {
        fetchProviders()
    }, [])

    const fetchProviders = async () => {
        try {
            const res = await fetch('/api/admin/ai-providers')
            const data = await res.json()
            setProviders(data)
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to fetch AI providers",
                variant: "destructive"
            })
        } finally {
            setLoading(false)
        }
    }

    const addProvider = async () => {
        if (!newProvider.apiKey) {
            toast({
                title: "Error",
                description: "Please enter an API key",
                variant: "destructive"
            })
            return
        }

        try {
            const res = await fetch('/api/admin/ai-providers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newProvider)
            })

            if (!res.ok) throw new Error('Failed to add provider')

            const data = await res.json()

            toast({
                title: "Success",
                description: "AI provider added. Validating..."
            })

            // Auto-validate
            await validateProvider(data.id)

            setNewProvider({ name: "gemini", apiKey: "" })
            fetchProviders()
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to add provider",
                variant: "destructive"
            })
        }
    }

    const validateProvider = async (providerId: string) => {
        setValidating(prev => ({ ...prev, [providerId]: true }))

        try {
            const res = await fetch(`/api/admin/ai-providers/${providerId}/validate`, {
                method: 'POST'
            })

            const data = await res.json()

            if (data.valid) {
                toast({
                    title: "Validation Success",
                    description: `${data.provider} is working correctly! Response time: ${data.responseTime}ms`
                })
            } else {
                toast({
                    title: "Validation Failed",
                    description: data.error || "Invalid API key",
                    variant: "destructive"
                })
            }

            fetchProviders()
        } catch (error) {
            toast({
                title: "Error",
                description: "Validation failed",
                variant: "destructive"
            })
        } finally {
            setValidating(prev => ({ ...prev, [providerId]: false }))
        }
    }

    const deleteProvider = async (providerId: string) => {
        if (!confirm("Are you sure you want to delete this AI provider?")) return

        try {
            const res = await fetch(`/api/admin/ai-providers/${providerId}`, {
                method: 'DELETE'
            })

            if (!res.ok) throw new Error('Failed to delete')

            toast({
                title: "Success",
                description: "Provider deleted"
            })

            fetchProviders()
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to delete provider",
                variant: "destructive"
            })
        }
    }

    const toggleProvider = async (providerId: string, isActive: boolean) => {
        try {
            const res = await fetch(`/api/admin/ai-providers/${providerId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isActive })
            })

            if (!res.ok) throw new Error('Failed to update')

            toast({
                title: "Success",
                description: `Provider ${isActive ? 'enabled' : 'disabled'}`
            })

            fetchProviders()
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to update provider",
                variant: "destructive"
            })
        }
    }

    const testProvider = async (providerId: string) => {
        setValidating(prev => ({ ...prev, [providerId]: true }))

        try {
            const res = await fetch(`/api/admin/ai-providers/${providerId}/test`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: "Analyze the sentiment of this text: 'Bitcoin surged 5% today on strong buying pressure.'"
                })
            })

            const data = await res.json()

            if (data.success) {
                toast({
                    title: "Test Successful",
                    description: `Sentiment: ${data.sentiment} (${data.responseTime}ms)`
                })
            } else {
                toast({
                    title: "Test Failed",
                    description: data.error,
                    variant: "destructive"
                })
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Test failed",
                variant: "destructive"
            })
        } finally {
            setValidating(prev => ({ ...prev, [providerId]: false }))
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">AI Provider Management</h1>
                    <p className="text-slate-400 mt-1">
                        Configure and validate AI sentiment analysis providers
                    </p>
                </div>
                <Badge variant="outline" className="text-lg px-4 py-2">
                    <Activity className="h-4 w-4 mr-2" />
                    {providers.filter(p => p.isActive).length} / {providers.length} Active
                </Badge>
            </div>

            <Tabs defaultValue="providers">
                <TabsList>
                    <TabsTrigger value="providers">Providers</TabsTrigger>
                    <TabsTrigger value="add">Add New</TabsTrigger>
                    <TabsTrigger value="stats">Statistics</TabsTrigger>
                </TabsList>

                {/* Provider List */}
                <TabsContent value="providers" className="space-y-4">
                    {providers.length === 0 ? (
                        <Card className="bg-slate-900 border-slate-800">
                            <CardContent className="p-12 text-center">
                                <AlertCircle className="h-12 w-12 text-slate-500 mx-auto mb-4" />
                                <p className="text-slate-400">No AI providers configured</p>
                                <Button className="mt-4" onClick={() => document.querySelector('[value="add"]')?.click()}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Your First Provider
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        providers.map((provider) => (
                            <Card key={provider.id} className={`bg-slate-900 border-slate-800 ${provider.isActive ? 'border-l-4 border-l-green-500' : ''}`}>
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle className="flex items-center gap-2">
                                                {provider.displayName}
                                                {provider.isValidated ? (
                                                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                                                ) : (
                                                    <AlertCircle className="h-5 w-5 text-yellow-500" />
                                                )}
                                            </CardTitle>
                                            <CardDescription>{provider.name}</CardDescription>
                                        </div>
                                        <div className="flex gap-2">
                                            <Badge variant={provider.isActive ? "default" : "secondary"}>
                                                {provider.isActive ? "Active" : "Inactive"}
                                            </Badge>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* API Key */}
                                    <div>
                                        <Label className="text-xs text-slate-400">API Key</Label>
                                        <div className="flex gap-2 mt-1">
                                            <Input
                                                type={showApiKey[provider.id] ? "text" : "password"}
                                                value={provider.apiKey}
                                                readOnly
                                                className="bg-slate-950 border-slate-700 font-mono text-sm"
                                            />
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                onClick={() => setShowApiKey(prev => ({ ...prev, [provider.id]: !prev[provider.id] }))}
                                            >
                                                {showApiKey[provider.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Stats */}
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="bg-slate-950 p-3 rounded-lg">
                                            <div className="text-xs text-slate-400">Requests</div>
                                            <div className="text-lg font-bold text-white">{provider.requestCount.toLocaleString()}</div>
                                        </div>
                                        <div className="bg-slate-950 p-3 rounded-lg">
                                            <div className="text-xs text-slate-400">Success Rate</div>
                                            <div className="text-lg font-bold text-green-500">{provider.successRate.toFixed(1)}%</div>
                                        </div>
                                        <div className="bg-slate-950 p-3 rounded-lg">
                                            <div className="text-xs text-slate-400">Avg Response</div>
                                            <div className="text-lg font-bold text-blue-500">{provider.avgResponseTime}ms</div>
                                        </div>
                                    </div>

                                    {/* Last Validated */}
                                    {provider.lastValidated && (
                                        <div className="text-xs text-slate-500">
                                            Last validated: {new Date(provider.lastValidated).toLocaleString()}
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div className="flex gap-2 flex-wrap">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => validateProvider(provider.id)}
                                            disabled={validating[provider.id]}
                                        >
                                            {validating[provider.id] ? (
                                                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                            ) : (
                                                <CheckCircle2 className="h-4 w-4 mr-2" />
                                            )}
                                            Validate
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => testProvider(provider.id)}
                                            disabled={validating[provider.id]}
                                        >
                                            <Zap className="h-4 w-4 mr-2" />
                                            Test
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant={provider.isActive ? "destructive" : "default"}
                                            onClick={() => toggleProvider(provider.id, !provider.isActive)}
                                        >
                                            {provider.isActive ? "Disable" : "Enable"}
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => deleteProvider(provider.id)}
                                            className="ml-auto"
                                        >
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            Delete
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </TabsContent>

                {/* Add New Provider */}
                <TabsContent value="add">
                    <Card className="bg-slate-900 border-slate-800">
                        <CardHeader>
                            <CardTitle>Add New AI Provider</CardTitle>
                            <CardDescription>
                                Configure a new AI provider for sentiment analysis
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="provider-select">Provider</Label>
                                <select
                                    id="provider-select"
                                    value={newProvider.name}
                                    onChange={(e) => setNewProvider({ ...newProvider, name: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                                >
                                    {PROVIDERS.map((p) => (
                                        <option key={p.value} value={p.value}>{p.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="api-key">API Key</Label>
                                <Input
                                    id="api-key"
                                    type="password"
                                    placeholder="Enter your API key..."
                                    value={newProvider.apiKey}
                                    onChange={(e) => setNewProvider({ ...newProvider, apiKey: e.target.value })}
                                    className="bg-slate-950 border-slate-700"
                                />
                            </div>

                            <div className="bg-blue-900/20 border border-blue-900/50 p-4 rounded-lg">
                                <p className="text-sm text-blue-200">
                                    <strong>Note:</strong> The API key will be validated immediately after adding.
                                    Make sure it has the necessary permissions for the selected provider.
                                </p>
                            </div>

                            <Button onClick={addProvider} className="w-full">
                                <Plus className="h-4 w-4 mr-2" />
                                Add Provider
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Statistics */}
                <TabsContent value="stats">
                    <Card className="bg-slate-900 border-slate-800">
                        <CardHeader>
                            <CardTitle>Provider Statistics</CardTitle>
                            <CardDescription>Performance metrics across all providers</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="bg-slate-950 p-6 rounded-lg">
                                    <div className="text-slate-400 text-sm mb-2">Total Providers</div>
                                    <div className="text-3xl font-bold text-white">{providers.length}</div>
                                </div>
                                <div className="bg-slate-950 p-6 rounded-lg">
                                    <div className="text-slate-400 text-sm mb-2">Active</div>
                                    <div className="text-3xl font-bold text-green-500">{providers.filter(p => p.isActive).length}</div>
                                </div>
                                <div className="bg-slate-950 p-6 rounded-lg">
                                    <div className="text-slate-400 text-sm mb-2">Validated</div>
                                    <div className="text-3xl font-bold text-blue-500">{providers.filter(p => p.isValidated).length}</div>
                                </div>
                                <div className="bg-slate-950 p-6 rounded-lg">
                                    <div className="text-slate-400 text-sm mb-2">Avg Success Rate</div>
                                    <div className="text-3xl font-bold text-purple-500">
                                        {providers.length > 0 ? (providers.reduce((sum, p) => sum + p.successRate, 0) / providers.length).toFixed(1) : 0}%
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
