'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Bell, Check, Trash2, Filter, AlertCircle, MessageSquare, Mail, Smartphone } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

interface Notification {
    id: string
    type: 'signal' | 'alert' | 'system' | 'trade'
    title: string
    message: string
    timestamp: string
    read: boolean
    priority: 'low' | 'medium' | 'high'
    data?: any
}

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState<'all' | 'unread' | 'signal' | 'alert' | 'system'>('all')

    useEffect(() => {
        fetchNotifications()
    }, [])

    const fetchNotifications = async () => {
        try {
            setLoading(true)
            const response = await fetch('/api/notifications')
            if (!response.ok) throw new Error('Failed to fetch notifications')
            const data = await response.json()
            setNotifications(data.notifications || [])
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const markAsRead = async (id: string) => {
        try {
            const response = await fetch(`/api/notifications/${id}/read`, {
                method: 'POST'
            })
            if (!response.ok) throw new Error('Failed to mark as read')
            await fetchNotifications()
        } catch (err) {
            console.error(err)
        }
    }

    const markAllAsRead = async () => {
        try {
            const response = await fetch('/api/notifications/read-all', {
                method: 'POST'
            })
            if (!response.ok) throw new Error('Failed to mark all as read')
            await fetchNotifications()
        } catch (err) {
            console.error(err)
        }
    }

    const deleteNotification = async (id: string) => {
        try {
            const response = await fetch(`/api/notifications/${id}`, {
                method: 'DELETE'
            })
            if (!response.ok) throw new Error('Failed to delete')
            await fetchNotifications()
        } catch (err) {
            console.error(err)
        }
    }

    const clearAll = async () => {
        try {
            const response = await fetch('/api/notifications/clear', {
                method: 'DELETE'
            })
            if (!response.ok) throw new Error('Failed to clear')
            await fetchNotifications()
        } catch (err) {
            console.error(err)
        }
    }

    const filteredNotifications = notifications.filter(n => {
        if (filter === 'unread') return !n.read
        if (filter === 'all') return true
        return n.type === filter
    })

    const unreadCount = notifications.filter(n => !n.read).length

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'signal': return <MessageSquare className="h-4 w-4" />
            case 'alert': return <AlertCircle className="h-4 w-4" />
            case 'system': return <Bell className="h-4 w-4" />
            case 'trade': return <Mail className="h-4 w-4" />
            default: return <Bell className="h-4 w-4" />
        }
    }

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return 'border-red-200 bg-red-50'
            case 'medium': return 'border-yellow-200 bg-yellow-50'
            default: return 'border-gray-200 bg-white'
        }
    }

    if (loading) {
        return (
            <div className="container mx-auto p-6 space-y-6">
                <Skeleton className="h-10 w-64" />
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-24" />
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                        <Bell className="h-8 w-8" />
                        Notifications
                    </h1>
                    <p className="text-muted-foreground">
                        {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                    </p>
                </div>
                <div className="flex gap-2">
                    {unreadCount > 0 && (
                        <Button onClick={markAllAsRead} variant="outline">
                            <Check className="h-4 w-4 mr-2" />
                            Mark All Read
                        </Button>
                    )}
                    {notifications.length > 0 && (
                        <Button onClick={clearAll} variant="outline">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Clear All
                        </Button>
                    )}
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-2">
                <Badge
                    variant={filter === 'all' ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => setFilter('all')}
                >
                    All ({notifications.length})
                </Badge>
                <Badge
                    variant={filter === 'unread' ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => setFilter('unread')}
                >
                    Unread ({unreadCount})
                </Badge>
                <Badge
                    variant={filter === 'signal' ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => setFilter('signal')}
                >
                    Signals ({notifications.filter(n => n.type === 'signal').length})
                </Badge>
                <Badge
                    variant={filter === 'alert' ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => setFilter('alert')}
                >
                    Alerts ({notifications.filter(n => n.type === 'alert').length})
                </Badge>
                <Badge
                    variant={filter === 'system' ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => setFilter('system')}
                >
                    System ({notifications.filter(n => n.type === 'system').length})
                </Badge>
            </div>

            {/* Notifications List */}
            {filteredNotifications.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <Bell className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No Notifications</h3>
                        <p className="text-muted-foreground text-center max-w-md">
                            You're all caught up! No {filter !== 'all' ? filter : ''} notifications to display.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {filteredNotifications.map((notification) => (
                        <Card
                            key={notification.id}
                            className={`${getPriorityColor(notification.priority)} ${!notification.read ? 'border-l-4 border-l-blue-600' : ''}`}
                        >
                            <CardContent className="pt-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-4 flex-1">
                                        <div className={`p-2 rounded-lg ${notification.type === 'signal' ? 'bg-blue-100 text-blue-600' :
                                                notification.type === 'alert' ? 'bg-red-100 text-red-600' :
                                                    notification.type === 'system' ? 'bg-purple-100 text-purple-600' :
                                                        'bg-gray-100 text-gray-600'
                                            }`}>
                                            {getTypeIcon(notification.type)}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-semibold">{notification.title}</h3>
                                                {!notification.read && (
                                                    <Badge variant="default" className="text-xs">New</Badge>
                                                )}
                                                {notification.priority === 'high' && (
                                                    <Badge variant="destructive" className="text-xs">High Priority</Badge>
                                                )}
                                            </div>
                                            <p className="text-sm text-muted-foreground mb-2">
                                                {notification.message}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {new Date(notification.timestamp).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        {!notification.read && (
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => markAsRead(notification.id)}
                                            >
                                                <Check className="h-4 w-4" />
                                            </Button>
                                        )}
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => deleteNotification(notification.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
