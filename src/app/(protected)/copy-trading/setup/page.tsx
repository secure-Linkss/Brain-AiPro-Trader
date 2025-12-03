"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, AlertCircle, Download, Copy, Check } from 'lucide-react'

export default function CopyTradingSetup() {
    const router = useRouter()
    const [step, setStep] = useState(1)
    const [platform, setPlatform] = useState<'MT4' | 'MT5'>('MT4')
    const [accountNumber, setAccountNumber] = useState('')
    const [deviceName, setDeviceName] = useState('')
    const [brokerName, setBrokerName] = useState('')
    const [brokerServer, setBrokerServer] = useState('')
    const [apiKey, setApiKey] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [copied, setCopied] = useState(false)

    const handleCreateConnection = async () => {
        try {
            setLoading(true)
            setError('')

            // Generate device fingerprint
            const deviceFingerprint = {
                pc_name: deviceName || 'Unknown',
                mac_address_hash: crypto.randomUUID(), // In production, get real MAC hash
                os: navigator.platform,
                mt4_version: platform === 'MT4' ? '4.00' : '5.00'
            }

            const response = await fetch('/api/mt4/connection/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    device_fingerprint: deviceFingerprint,
                    account_number: accountNumber,
                    platform,
                    device_name: deviceName,
                    broker_name: brokerName,
                    broker_server: brokerServer
                })
            })

            const data = await response.json()

            if (!response.ok) {
                if (data.upgrade_required) {
                    setError(data.error + ' Please upgrade your plan to continue.')
                } else {
                    setError(data.error || 'Failed to create connection')
                }
                return
            }

            setApiKey(data.connection.api_key)
            setStep(3)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create connection')
        } finally {
            setLoading(false)
        }
    }

    const copyApiKey = () => {
        navigator.clipboard.writeText(apiKey)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const downloadEA = () => {
        // In production, this would download the actual EA file
        window.open(`/api/mt4/download/${platform.toLowerCase()}`, '_blank')
    }

    return (
        <div className="container mx-auto p-6 max-w-4xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Connect MT4/MT5 Account</h1>
                <p className="text-muted-foreground">
                    Follow these steps to connect your trading account
                </p>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center justify-between mb-8">
                {[1, 2, 3, 4].map((s) => (
                    <div key={s} className="flex items-center flex-1">
                        <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${step >= s ? 'border-primary bg-primary text-primary-foreground' : 'border-muted'
                            }`}>
                            {step > s ? <CheckCircle2 className="h-5 w-5" /> : s}
                        </div>
                        {s < 4 && <div className={`flex-1 h-0.5 mx-2 ${step > s ? 'bg-primary' : 'bg-muted'}`} />}
                    </div>
                ))}
            </div>

            {error && (
                <Alert variant="destructive" className="mb-6">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {/* Step 1: Platform Selection */}
            {step === 1 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Step 1: Select Platform</CardTitle>
                        <CardDescription>Choose your trading platform</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <Card
                                className={`cursor-pointer transition-all ${platform === 'MT4' ? 'border-primary ring-2 ring-primary' : ''}`}
                                onClick={() => setPlatform('MT4')}
                            >
                                <CardContent className="flex flex-col items-center justify-center p-6">
                                    <h3 className="text-2xl font-bold mb-2">MT4</h3>
                                    <p className="text-sm text-muted-foreground text-center">MetaTrader 4</p>
                                    {platform === 'MT4' && <CheckCircle2 className="h-6 w-6 text-primary mt-4" />}
                                </CardContent>
                            </Card>

                            <Card
                                className={`cursor-pointer transition-all ${platform === 'MT5' ? 'border-primary ring-2 ring-primary' : ''}`}
                                onClick={() => setPlatform('MT5')}
                            >
                                <CardContent className="flex flex-col items-center justify-center p-6">
                                    <h3 className="text-2xl font-bold mb-2">MT5</h3>
                                    <p className="text-sm text-muted-foreground text-center">MetaTrader 5</p>
                                    {platform === 'MT5' && <CheckCircle2 className="h-6 w-6 text-primary mt-4" />}
                                </CardContent>
                            </Card>
                        </div>

                        <Button onClick={() => setStep(2)} className="w-full">
                            Continue
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Step 2: Account Details */}
            {step === 2 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Step 2: Account Details</CardTitle>
                        <CardDescription>Enter your {platform} account information</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="accountNumber">Account Number *</Label>
                            <Input
                                id="accountNumber"
                                type="number"
                                placeholder="12345678"
                                value={accountNumber}
                                onChange={(e) => setAccountNumber(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="deviceName">Device Name *</Label>
                            <Input
                                id="deviceName"
                                placeholder="My Trading PC"
                                value={deviceName}
                                onChange={(e) => setDeviceName(e.target.value)}
                                required
                            />
                            <p className="text-xs text-muted-foreground">
                                Give this connection a friendly name
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="brokerName">Broker Name</Label>
                            <Input
                                id="brokerName"
                                placeholder="e.g., IC Markets, Pepperstone"
                                value={brokerName}
                                onChange={(e) => setBrokerName(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="brokerServer">Broker Server</Label>
                            <Input
                                id="brokerServer"
                                placeholder="e.g., ICMarkets-Demo"
                                value={brokerServer}
                                onChange={(e) => setBrokerServer(e.target.value)}
                            />
                        </div>

                        <div className="flex gap-2">
                            <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                                Back
                            </Button>
                            <Button
                                onClick={handleCreateConnection}
                                disabled={!accountNumber || !deviceName || loading}
                                className="flex-1"
                            >
                                {loading ? 'Creating...' : 'Create Connection'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Step 3: Download EA & API Key */}
            {step === 3 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Step 3: Download EA & Get API Key</CardTitle>
                        <CardDescription>Download the connector and save your API key</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* API Key */}
                        <div className="space-y-2">
                            <Label>Your API Key</Label>
                            <div className="flex gap-2">
                                <Input value={apiKey} readOnly className="font-mono" />
                                <Button variant="outline" size="icon" onClick={copyApiKey}>
                                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                </Button>
                            </div>
                            <Alert>
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>
                                    Save this API key securely. You'll need it to configure the EA.
                                </AlertDescription>
                            </Alert>
                        </div>

                        {/* Download EA */}
                        <div className="space-y-2">
                            <Label>Download {platform} Connector</Label>
                            <Button onClick={downloadEA} className="w-full" size="lg">
                                <Download className="mr-2 h-4 w-4" />
                                Download {platform} Connector EA
                            </Button>
                        </div>

                        <Button onClick={() => setStep(4)} className="w-full">
                            Continue to Installation
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Step 4: Installation Instructions */}
            {step === 4 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Step 4: Install & Configure</CardTitle>
                        <CardDescription>Follow these steps to complete setup</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <Tabs defaultValue="install">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="install">Installation</TabsTrigger>
                                <TabsTrigger value="config">Configuration</TabsTrigger>
                            </TabsList>

                            <TabsContent value="install" className="space-y-4">
                                <ol className="space-y-4 list-decimal list-inside">
                                    <li className="text-sm">
                                        <strong>Open {platform}</strong>
                                        <p className="ml-6 text-muted-foreground">Launch your {platform} terminal</p>
                                    </li>
                                    <li className="text-sm">
                                        <strong>Open Data Folder</strong>
                                        <p className="ml-6 text-muted-foreground">File → Open Data Folder</p>
                                    </li>
                                    <li className="text-sm">
                                        <strong>Navigate to Experts Folder</strong>
                                        <p className="ml-6 text-muted-foreground">
                                            MQL{platform === 'MT4' ? '4' : '5'} → Experts
                                        </p>
                                    </li>
                                    <li className="text-sm">
                                        <strong>Copy EA File</strong>
                                        <p className="ml-6 text-muted-foreground">
                                            Paste the downloaded .ex{platform === 'MT4' ? '4' : '5'} file here
                                        </p>
                                    </li>
                                    <li className="text-sm">
                                        <strong>Restart {platform}</strong>
                                        <p className="ml-6 text-muted-foreground">Close and reopen {platform}</p>
                                    </li>
                                </ol>
                            </TabsContent>

                            <TabsContent value="config" className="space-y-4">
                                <ol className="space-y-4 list-decimal list-inside">
                                    <li className="text-sm">
                                        <strong>Drag EA to Chart</strong>
                                        <p className="ml-6 text-muted-foreground">
                                            Find "Brain_AiPro_Connector" in Navigator → Expert Advisors
                                        </p>
                                    </li>
                                    <li className="text-sm">
                                        <strong>Enable AutoTrading</strong>
                                        <p className="ml-6 text-muted-foreground">
                                            Click the "AutoTrading" button in toolbar (should be green)
                                        </p>
                                    </li>
                                    <li className="text-sm">
                                        <strong>Enter API Key</strong>
                                        <p className="ml-6 text-muted-foreground">
                                            In EA settings, paste your API key: <code className="text-xs bg-muted px-1 py-0.5 rounded">{apiKey}</code>
                                        </p>
                                    </li>
                                    <li className="text-sm">
                                        <strong>Enable WebRequest</strong>
                                        <p className="ml-6 text-muted-foreground">
                                            Tools → Options → Expert Advisors → Allow WebRequest for URL:
                                            <code className="text-xs bg-muted px-1 py-0.5 rounded ml-1">
                                                {typeof window !== 'undefined' ? window.location.origin : 'https://yourdomain.com'}
                                            </code>
                                        </p>
                                    </li>
                                    <li className="text-sm">
                                        <strong>Click OK</strong>
                                        <p className="ml-6 text-muted-foreground">
                                            The EA should start and show "Connected" in the chart corner
                                        </p>
                                    </li>
                                </ol>

                                <Alert>
                                    <CheckCircle2 className="h-4 w-4" />
                                    <AlertDescription>
                                        Once connected, you'll see your account appear online in the dashboard within 30 seconds.
                                    </AlertDescription>
                                </Alert>
                            </TabsContent>
                        </Tabs>

                        <Button onClick={() => router.push('/copy-trading')} className="w-full" size="lg">
                            Go to Dashboard
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
