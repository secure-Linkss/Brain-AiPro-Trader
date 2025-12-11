'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, Crown, Zap, Star, CreditCard, Calendar } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

interface Subscription {
    id: string
    plan: 'free' | 'pro' | 'enterprise'
    status: 'active' | 'cancelled' | 'expired'
    currentPeriodEnd: string
    cancelAtPeriodEnd: boolean
}

interface Plan {
    id: string
    name: string
    price: number
    interval: 'month' | 'year'
    features: string[]
    popular?: boolean
}

export default function SubscriptionPage() {
    const [subscription, setSubscription] = useState<Subscription | null>(null)
    const [plans, setPlans] = useState<Plan[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchSubscription()
        fetchPlans()
    }, [])

    const fetchSubscription = async () => {
        try {
            const response = await fetch('/api/subscription/current')
            if (!response.ok) throw new Error('Failed to fetch subscription')
            const data = await response.json()
            setSubscription(data.subscription)
        } catch (err) {
            console.error(err)
        }
    }

    const fetchPlans = async () => {
        try {
            setLoading(true)
            const response = await fetch('/api/subscription/plans')
            if (!response.ok) throw new Error('Failed to fetch plans')
            const data = await response.json()
            setPlans(data.plans || [])
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const handleUpgrade = async (planId: string) => {
        try {
            const response = await fetch('/api/subscription/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ planId })
            })

            if (!response.ok) throw new Error('Failed to create checkout')

            const data = await response.json()
            if (data.url) {
                window.location.href = data.url
            }
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to upgrade')
        }
    }

    const handleManage = async () => {
        try {
            const response = await fetch('/api/stripe/portal', {
                method: 'POST'
            })

            if (!response.ok) throw new Error('Failed to open portal')

            const data = await response.json()
            if (data.url) {
                window.location.href = data.url
            }
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to open portal')
        }
    }

    if (loading) {
        return (
            <div className="container mx-auto p-6 space-y-6">
                <Skeleton className="h-10 w-64" />
                <div className="grid gap-6 md:grid-cols-3">
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-96" />
                    ))}
                </div>
            </div>
        )
    }

    const getPlanIcon = (name: string) => {
        if (name.toLowerCase().includes('enterprise')) return <Crown className="h-6 w-6" />
        if (name.toLowerCase().includes('pro')) return <Zap className="h-6 w-6" />
        return <Star className="h-6 w-6" />
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 p-8 text-white">
                <div className="relative z-10">
                    <h1 className="text-4xl font-bold mb-2">Subscription</h1>
                    <p className="text-purple-100">Manage your subscription and billing</p>
                </div>
            </div>

            {/* Current Subscription */}
            {subscription && (
                <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CreditCard className="h-5 w-5" />
                            Current Subscription
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <h3 className="text-2xl font-bold capitalize">{subscription.plan} Plan</h3>
                                    <Badge variant={subscription.status === 'active' ? 'default' : 'secondary'}>
                                        {subscription.status}
                                    </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    {subscription.cancelAtPeriodEnd ? (
                                        <>Expires on {new Date(subscription.currentPeriodEnd).toLocaleDateString()}</>
                                    ) : (
                                        <>Renews on {new Date(subscription.currentPeriodEnd).toLocaleDateString()}</>
                                    )}
                                </p>
                            </div>
                            <Button onClick={handleManage} variant="outline">
                                Manage Billing
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Available Plans */}
            <div>
                <h2 className="text-2xl font-bold mb-6">Available Plans</h2>
                <div className="grid gap-6 md:grid-cols-3">
                    {plans.map((plan) => (
                        <Card
                            key={plan.id}
                            className={`relative ${plan.popular ? 'border-purple-600 border-2 shadow-lg' : ''}`}
                        >
                            {plan.popular && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                    <Badge className="bg-purple-600">Most Popular</Badge>
                                </div>
                            )}
                            <CardHeader>
                                <div className="flex items-center gap-2 mb-2">
                                    {getPlanIcon(plan.name)}
                                    <CardTitle>{plan.name}</CardTitle>
                                </div>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-bold">${plan.price}</span>
                                    <span className="text-muted-foreground">/{plan.interval}</span>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <ul className="space-y-2">
                                    {plan.features.map((feature, idx) => (
                                        <li key={idx} className="flex items-start gap-2">
                                            <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                            <span className="text-sm">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                                <Button
                                    onClick={() => handleUpgrade(plan.id)}
                                    className="w-full"
                                    variant={plan.popular ? 'default' : 'outline'}
                                    disabled={subscription?.plan === plan.id}
                                >
                                    {subscription?.plan === plan.id ? 'Current Plan' : 'Upgrade'}
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    )
}
