"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Mail, Reply, CheckCircle, Clock } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface Message {
    id: string
    name: string
    email: string
    subject: string
    message: string
    status: 'unread' | 'read' | 'replied'
    createdAt: string
    repliedAt?: string
    adminReply?: string
}

export default function AdminMessagesPage() {
    const { toast } = useToast()
    const [messages, setMessages] = useState<Message[]>([])
    const [loading, setLoading] = useState(true)
    const [replyText, setReplyText] = useState("")
    const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
    const [sending, setSending] = useState(false)

    useEffect(() => {
        fetchMessages()
    }, [])

    const fetchMessages = async () => {
        try {
            const res = await fetch('/api/admin/contact')
            const data = await res.json()
            setMessages(data)
        } catch (error) {
            console.error('Failed to fetch messages:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleReply = async () => {
        if (!selectedMessage || !replyText.trim()) return

        setSending(true)
        try {
            const res = await fetch('/api/admin/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messageId: selectedMessage.id,
                    reply: replyText
                })
            })

            if (!res.ok) throw new Error('Failed to send reply')

            toast({
                title: "Reply Sent",
                description: `Reply sent to ${selectedMessage.email}`,
            })

            // Update local state
            setMessages(prev => prev.map(m =>
                m.id === selectedMessage.id
                    ? { ...m, status: 'replied', adminReply: replyText, repliedAt: new Date().toISOString() }
                    : m
            ))

            setReplyText("")
            setSelectedMessage(null)
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to send reply",
                variant: "destructive"
            })
        } finally {
            setSending(false)
        }
    }

    if (loading) return <div>Loading messages...</div>

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Contact Messages</h1>
                <Badge variant="outline" className="text-lg px-4 py-1">
                    {messages.filter(m => m.status === 'unread').length} Unread
                </Badge>
            </div>

            <div className="grid gap-4">
                {messages.map((message) => (
                    <Card key={message.id} className={`bg-slate-900 border-slate-800 ${message.status === 'unread' ? 'border-l-4 border-l-blue-500' : ''}`}>
                        <CardContent className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center">
                                        <Mail className="h-5 w-5 text-slate-400" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-lg">{message.subject}</h3>
                                        <p className="text-sm text-slate-400">
                                            From: {message.name} ({message.email})
                                        </p>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <Badge variant={
                                        message.status === 'replied' ? 'default' :
                                            message.status === 'read' ? 'secondary' : 'destructive'
                                    }>
                                        {message.status.toUpperCase()}
                                    </Badge>
                                    <span className="text-xs text-slate-500">
                                        {new Date(message.createdAt).toLocaleString()}
                                    </span>
                                </div>
                            </div>

                            <div className="bg-slate-950/50 p-4 rounded-lg mb-4 text-slate-300">
                                {message.message}
                            </div>

                            {message.status === 'replied' && (
                                <div className="bg-blue-900/20 border border-blue-900/50 p-4 rounded-lg mb-4 ml-8">
                                    <div className="flex items-center gap-2 mb-2 text-blue-400 text-sm font-semibold">
                                        <Reply className="h-4 w-4" /> Admin Reply
                                    </div>
                                    <p className="text-slate-300">{message.adminReply}</p>
                                    <p className="text-xs text-slate-500 mt-2">
                                        Sent at {new Date(message.repliedAt!).toLocaleString()}
                                    </p>
                                </div>
                            )}

                            <div className="flex justify-end gap-2">
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button
                                            variant="outline"
                                            onClick={() => setSelectedMessage(message)}
                                            disabled={message.status === 'replied'}
                                        >
                                            <Reply className="mr-2 h-4 w-4" />
                                            {message.status === 'replied' ? 'Replied' : 'Reply'}
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="bg-slate-900 border-slate-800">
                                        <DialogHeader>
                                            <DialogTitle>Reply to {message.name}</DialogTitle>
                                        </DialogHeader>
                                        <div className="space-y-4 mt-4">
                                            <div className="bg-slate-950 p-3 rounded text-sm text-slate-400 max-h-32 overflow-y-auto">
                                                {message.message}
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">Your Reply (Sent via Email)</label>
                                                <Textarea
                                                    value={replyText}
                                                    onChange={(e) => setReplyText(e.target.value)}
                                                    placeholder="Type your response here..."
                                                    className="min-h-[150px] bg-slate-950 border-slate-800"
                                                />
                                            </div>
                                            <Button
                                                onClick={handleReply}
                                                className="w-full bg-blue-600 hover:bg-blue-700"
                                                disabled={sending || !replyText.trim()}
                                            >
                                                {sending ? 'Sending...' : 'Send Reply'}
                                            </Button>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
