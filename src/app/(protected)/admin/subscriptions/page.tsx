'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { DollarSign, TrendingUp, Users, CreditCard } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

interface SubscriptionData {
    id: string
    userName: string
    userEmail: string
    plan: string
    status: string
    amount: number
    currentPeriodEnd: string
    cancelAtPeriodEnd: boolean
}

export default function AdminSubscriptionsPage() {
    const [subscriptions, setSubscriptions] = useState<SubscriptionData[]>([])
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState({
        totalRevenue: 0,
        activeSubscriptions: 0,
        mrr: 0
    })

    useEffect(() => {
        fetchSubscriptions()
    }, [])

    const fetchSubscriptions = async () => {
        try {
            setLoading(true)
            const response = await fetch('/api/admin/subscriptions')
            if (!response.ok) throw new Error('Failed to fetch')
            const data = await response.json()
            setSubscriptions(data.subscriptions || [])
            setStats(data.stats || stats)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
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
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Subscription Management</h1>
                <p className="text-muted-foreground">Monitor and manage user subscriptions</p>
            </div>

            {/* Stats */}
            <div className="grid gap-6 md:grid-cols-3">
                <Card className="border-green-200 bg-gradient-to-br from-green-50 to-white">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-green-600">Total Revenue</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-green-600">
                            ${(stats.totalRevenue / 1000).toFixed(1)}K
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-blue-600">Active Subscriptions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-blue-600">
                            {stats.activeSubscriptions}
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-white">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-purple-600">MRR</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-purple-600">
                            ${(stats.mrr / 1000).toFixed(1)}K
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Table */}
            <Card>
                <CardHeader>
                    <CardTitle>All Subscriptions ({subscriptions.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead>Plan</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Period End</TableHead>
                                <TableHead>Auto-Renew</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {subscriptions.map((sub) => (
                                <TableRow key={sub.id}>
                                    <TableCell>
                                        <div>
                                            <div className="font-medium">{sub.userName}</div>
                                            <div className="text-sm text-muted-foreground">{sub.userEmail}</div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="secondary" className="capitalize">{sub.plan}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={sub.status === 'active' ? 'default' : 'secondary'}>
                                            {sub.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="font-semibold">${sub.amount}</TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                        {new Date(sub.currentPeriodEnd).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={sub.cancelAtPeriodEnd ? 'destructive' : 'default'}>
                                            {sub.cancelAtPeriodEnd ? 'No' : 'Yes'}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
