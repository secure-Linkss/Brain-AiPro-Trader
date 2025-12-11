'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Brain, Plus, Trash2, CheckCircle2, AlertCircle, Zap } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

interface LLMProvider {
    id: string
    name: string
    provider: 'openai' | 'anthropic' | 'google' | 'custom'
    apiKey: string
    model: string
    enabled: boolean
    usageCount: number
    lastUsed: string
    config: {
        temperature: number
        maxTokens: number
        topP: number
    }
}

export default function AdminLLMProvidersPage() {
    const [providers, setProviders] = useState<LLMProvider[]>([])
    const [loading, setLoading] = useState(true)
    const [adding, setAdding] = useState(false)
    const [newProvider, setNewProvider] = useState({
        name: '',
        provider: 'openai' as const,
        apiKey: '',
        model: 'gpt-4',
        temperature: 0.7,
        maxTokens: 2000,
        topP: 1
    })

    useEffect(() => {
        fetchProviders()
    }, [])

    const fetchProviders = async () => {
        try {
            setLoading(true)
            const response = await fetch('/api/admin/llm-providers')
            if (!response.ok) throw new Error('Failed to fetch providers')
            const data = await response.json()
            setProviders(data.providers || [])
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const addProvider = async () => {
        try {
            const response = await fetch('/api/admin/llm-providers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newProvider)
            })
            if (!response.ok) throw new Error('Failed to add provider')
            await fetchProviders()
            setAdding(false)
            setNewProvider({
                name: '',
                provider: 'openai',
                apiKey: '',
                model: 'gpt-4',
                temperature: 0.7,
                maxTokens: 2000,
                topP: 1
            })
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to add')
        }
    }

    const toggleProvider = async (id: string, enabled: boolean) => {
        try {
            const response = await fetch(`/api/admin/llm-providers/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ enabled })
            })
            if (!response.ok) throw new Error('Failed to update')
            await fetchProviders()
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to update')
        }
    }

    const deleteProvider = async (id: string) => {
        if (!confirm('Are you sure you want to delete this provider?')) return
        try {
            const response = await fetch(`/api/admin/llm-providers/${id}`, {
                method: 'DELETE'
            })
            if (!response.ok) throw new Error('Failed to delete')
            await fetchProviders()
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to delete')
        }
    }

    if (loading) {
        return (
            <div className="container mx-auto p-6 space-y-6">
                <Skeleton className="h-10 w-64" />
                <Skeleton className="h-96" />
            </div>
        )
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                        <Brain className="h-8 w-8" />
                        LLM Providers
                    </h1>
                    <p className="text-muted-foreground">
                        Manage AI model providers and configurations
                    </p>
                </div>
                <Button onClick={() => setAdding(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Provider
                </Button>
            </div>

            {/* Add Provider Form */}
            {adding && (
                <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white">
                    <CardHeader>
                        <CardTitle>Add New LLM Provider</CardTitle>
                        <CardDescription>Configure a new AI model provider</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="name">Provider Name</Label>
                                <Input
                                    id="name"
                                    placeholder="e.g., OpenAI GPT-4"
                                    value={newProvider.name}
                                    onChange={(e) => setNewProvider({ ...newProvider, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="provider">Provider Type</Label>
                                <select
                                    id="provider"
                                    className="w-full px-3 py-2 border rounded-md"
                                    value={newProvider.provider}
                                    onChange={(e) => setNewProvider({ ...newProvider, provider: e.target.value as any })}
                                >
                                    <option value="openai">OpenAI</option>
                                    <option value="anthropic">Anthropic</option>
                                    <option value="google">Google</option>
                                    <option value="custom">Custom</option>
                                </select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="apiKey">API Key</Label>
                            <Input
                                id="apiKey"
                                type="password"
                                placeholder="sk-..."
                                value={newProvider.apiKey}
                                onChange={(e) => setNewProvider({ ...newProvider, apiKey: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="model">Model</Label>
                            <Input
                                id="model"
                                placeholder="gpt-4, claude-3, etc."
                                value={newProvider.model}
                                onChange={(e) => setNewProvider({ ...newProvider, model: e.target.value })}
                            />
                        </div>
                        <div className="grid gap-4 md:grid-cols-3">
                            <div className="space-y-2">
                                <Label htmlFor="temperature">Temperature</Label>
                                <Input
                                    id="temperature"
                                    type="number"
                                    min="0"
                                    max="2"
                                    step="0.1"
                                    value={newProvider.temperature}
                                    onChange={(e) => setNewProvider({ ...newProvider, temperature: parseFloat(e.target.value) })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="maxTokens">Max Tokens</Label>
                                <Input
                                    id="maxTokens"
                                    type="number"
                                    value={newProvider.maxTokens}
                                    onChange={(e) => setNewProvider({ ...newProvider, maxTokens: parseInt(e.target.value) })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="topP">Top P</Label>
                                <Input
                                    id="topP"
                                    type="number"
                                    min="0"
                                    max="1"
                                    step="0.1"
                                    value={newProvider.topP}
                                    onChange={(e) => setNewProvider({ ...newProvider, topP: parseFloat(e.target.value) })}
                                />
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button onClick={addProvider}>Add Provider</Button>
                            <Button variant="outline" onClick={() => setAdding(false)}>Cancel</Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Providers List */}
            <div className="grid gap-6">
                {providers.map((provider) => (
                    <Card key={provider.id} className={provider.enabled ? 'border-green-200' : 'border-gray-200'}>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        <Brain className="h-5 w-5" />
                                        {provider.name}
                                    </CardTitle>
                                    <CardDescription className="flex items-center gap-2 mt-1">
                                        <Badge variant="outline" className="capitalize">{provider.provider}</Badge>
                                        <Badge variant="secondary">{provider.model}</Badge>
                                    </CardDescription>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2">
                                        <Label htmlFor={`enabled-${provider.id}`}>Enabled</Label>
                                        <Switch
                                            id={`enabled-${provider.id}`}
                                            checked={provider.enabled}
                                            onCheckedChange={(checked) => toggleProvider(provider.id, checked)}
                                        />
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => deleteProvider(provider.id)}
                                    >
                                        <Trash2 className="h-4 w-4 text-red-600" />
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <h4 className="font-semibold mb-2">Configuration</h4>
                                    <div className="space-y-1 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Temperature:</span>
                                            <span className="font-medium">{provider.config.temperature}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Max Tokens:</span>
                                            <span className="font-medium">{provider.config.maxTokens}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Top P:</span>
                                            <span className="font-medium">{provider.config.topP}</span>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <h4 className="font-semibold mb-2">Usage Statistics</h4>
                                    <div className="space-y-1 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Total Requests:</span>
                                            <span className="font-medium">{provider.usageCount.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Last Used:</span>
                                            <span className="font-medium">
                                                {new Date(provider.lastUsed).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Status:</span>
                                            <Badge variant={provider.enabled ? 'default' : 'secondary'}>
                                                {provider.enabled ? (
                                                    <>
                                                        <CheckCircle2 className="h-3 w-3 mr-1" />
                                                        Active
                                                    </>
                                                ) : (
                                                    'Inactive'
                                                )}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {providers.length === 0 && !adding && (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <Brain className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No LLM Providers</h3>
                        <p className="text-muted-foreground text-center max-w-md mb-4">
                            Add your first AI model provider to enable intelligent features.
                        </p>
                        <Button onClick={() => setAdding(true)}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Provider
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
