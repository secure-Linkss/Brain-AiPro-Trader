"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Bell, X, TrendingUp, TrendingDown, AlertTriangle, Info, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Notification {
    id: string
    type: 'signal' | 'alert' | 'info' | 'success' | 'warning'
    title: string
    message: string
    timestamp: Date
    read: boolean
    data?: any
}

export function RealTimeNotifications() {
    const { data: session } = useSession()
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [isOpen, setIsOpen] = useState(false)
    const [unreadCount, setUnreadCount] = useState(0)
    const [ws, setWs] = useState<WebSocket | null>(null)

    useEffect(() => {
        if (!session?.user?.id) return

        // Connect to WebSocket
        const websocket = new WebSocket(
            `${process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001'}/notifications?userId=${session.user.id}`
        )

        websocket.onopen = () => {
            console.log('[Notifications] WebSocket connected')
        }

        websocket.onmessage = (event) => {
            const notification = JSON.parse(event.data)
            handleNewNotification(notification)
        }

        websocket.onerror = (error) => {
            console.error('[Notifications] WebSocket error:', error)
        }

        websocket.onclose = () => {
            console.log('[Notifications] WebSocket disconnected')
            // Attempt reconnection after 5 seconds
            setTimeout(() => {
                if (session?.user?.id) {
                    setWs(null)
                }
            }, 5000)
        }

        setWs(websocket)

        // Fetch existing notifications
        fetchNotifications()

        return () => {
            websocket.close()
        }
    }, [session?.user?.id])

    const fetchNotifications = async () => {
        try {
            const res = await fetch('/api/notifications')
            const data = await res.json()
            setNotifications(data.notifications || [])
            setUnreadCount(data.notifications?.filter((n: Notification) => !n.read).length || 0)
        } catch (error) {
            console.error('Failed to fetch notifications:', error)
        }
    }

    const handleNewNotification = (notification: Notification) => {
        setNotifications(prev => [notification, ...prev])
        setUnreadCount(prev => prev + 1)

        // Show browser notification
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(notification.title, {
                body: notification.message,
                icon: '/logo.png',
                badge: '/logo.png'
            })
        }

        // Play sound
        playNotificationSound(notification.type)
    }

    const playNotificationSound = (type: string) => {
        const audio = new Audio(
            type === 'signal' ? '/sounds/signal.mp3' : '/sounds/notification.mp3'
        )
        audio.volume = 0.5
        audio.play().catch(e => console.log('Audio play failed:', e))
    }

    const markAsRead = async (id: string) => {
        try {
            await fetch(`/api/notifications/${id}/read`, { method: 'POST' })
            setNotifications(prev =>
                prev.map(n => n.id === id ? { ...n, read: true } : n)
            )
            setUnreadCount(prev => Math.max(0, prev - 1))
        } catch (error) {
            console.error('Failed to mark notification as read:', error)
        }
    }

    const markAllAsRead = async () => {
        try {
            await fetch('/api/notifications/read-all', { method: 'POST' })
            setNotifications(prev => prev.map(n => ({ ...n, read: true })))
            setUnreadCount(0)
        } catch (error) {
            console.error('Failed to mark all as read:', error)
        }
    }

    const clearAll = async () => {
        try {
            await fetch('/api/notifications/clear', { method: 'DELETE' })
            setNotifications([])
            setUnreadCount(0)
        } catch (error) {
            console.error('Failed to clear notifications:', error)
        }
    }

    const getIcon = (type: string) => {
        switch (type) {
            case 'signal':
                return <TrendingUp className="h-5 w-5 text-blue-500" />
            case 'alert':
                return <AlertTriangle className="h-5 w-5 text-yellow-500" />
            case 'warning':
                return <TrendingDown className="h-5 w-5 text-red-500" />
            case 'success':
                return <CheckCircle className="h-5 w-5 text-green-500" />
            default:
                return <Info className="h-5 w-5 text-gray-500" />
        }
    }

    return (
        <div className="relative">
            <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(!isOpen)}
                className="relative"
            >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                    <Badge
                        variant="destructive"
                        className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                    >
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </Badge>
                )}
            </Button>

            {isOpen && (
                <Card className="absolute right-0 top-12 w-96 max-h-[600px] bg-slate-900 border-slate-800 shadow-2xl z-50">
                    <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                        <h3 className="font-semibold text-lg">Notifications</h3>
                        <div className="flex gap-2">
                            {unreadCount > 0 && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={markAllAsRead}
                                    className="text-xs"
                                >
                                    Mark all read
                                </Button>
                            )}
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setIsOpen(false)}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    <ScrollArea className="h-[500px]">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center text-slate-400">
                                <Bell className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                <p>No notifications yet</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-800">
                                {notifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        className={`p-4 hover:bg-slate-800/50 cursor-pointer transition-colors ${!notification.read ? 'bg-blue-500/5' : ''
                                            }`}
                                        onClick={() => markAsRead(notification.id)}
                                    >
                                        <div className="flex gap-3">
                                            <div className="flex-shrink-0 mt-1">
                                                {getIcon(notification.type)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-1">
                                                    <h4 className="font-medium text-sm truncate">
                                                        {notification.title}
                                                    </h4>
                                                    {!notification.read && (
                                                        <div className="h-2 w-2 bg-blue-500 rounded-full flex-shrink-0 ml-2" />
                                                    )}
                                                </div>
                                                <p className="text-sm text-slate-400 line-clamp-2">
                                                    {notification.message}
                                                </p>
                                                <p className="text-xs text-slate-500 mt-1">
                                                    {new Date(notification.timestamp).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </ScrollArea>

                    {notifications.length > 0 && (
                        <div className="p-3 border-t border-slate-800">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={clearAll}
                                className="w-full text-xs text-slate-400 hover:text-white"
                            >
                                Clear all notifications
                            </Button>
                        </div>
                    )}
                </Card>
            )}
        </div>
    )
}
