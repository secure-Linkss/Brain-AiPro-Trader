'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Edit, Trash2, Eye } from 'lucide-react'

interface BlogPost {
    id: string
    title: string
    excerpt: string
    content: string
    author: string
    publishedAt: string
    status: 'draft' | 'published'
}

export default function AdminBlogPage() {
    const [posts, setPosts] = useState<BlogPost[]>([
        {
            id: '1',
            title: 'Getting Started with AI Trading',
            excerpt: 'Learn the basics of AI-powered trading strategies...',
            content: 'Full content here...',
            author: 'Admin',
            publishedAt: '2025-01-15',
            status: 'published'
        }
    ])

    const [isCreating, setIsCreating] = useState(false)
    const [editingPost, setEditingPost] = useState<BlogPost | null>(null)

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">Blog Manager</h1>
                    <p className="text-gray-400 mt-1">Create and manage blog posts</p>
                </div>
                <Button
                    onClick={() => setIsCreating(true)}
                    className="bg-blue-600 hover:bg-blue-700"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    New Post
                </Button>
            </div>

            {isCreating && (
                <Card className="border-white/10 bg-slate-900/50">
                    <CardHeader>
                        <CardTitle className="text-white">Create New Post</CardTitle>
                        <CardDescription>Fill in the details for your new blog post</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-gray-300 mb-2 block">Title</label>
                            <Input
                                placeholder="Enter post title..."
                                className="bg-slate-950 border-white/10 text-white"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-300 mb-2 block">Excerpt</label>
                            <Textarea
                                placeholder="Brief summary..."
                                className="bg-slate-950 border-white/10 text-white"
                                rows={3}
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-300 mb-2 block">Content</label>
                            <Textarea
                                placeholder="Full post content..."
                                className="bg-slate-950 border-white/10 text-white"
                                rows={10}
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button className="bg-green-600 hover:bg-green-700">
                                Publish
                            </Button>
                            <Button variant="outline" className="border-white/10">
                                Save Draft
                            </Button>
                            <Button
                                variant="ghost"
                                onClick={() => setIsCreating(false)}
                                className="text-gray-400"
                            >
                                Cancel
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className="grid gap-4">
                {posts.map((post) => (
                    <Card key={post.id} className="border-white/10 bg-slate-900/50 hover:bg-slate-900/80 transition-colors">
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <CardTitle className="text-white mb-2">{post.title}</CardTitle>
                                    <CardDescription>{post.excerpt}</CardDescription>
                                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                                        <span>By {post.author}</span>
                                        <span>•</span>
                                        <span>{post.publishedAt}</span>
                                        <span>•</span>
                                        <span className={`px-2 py-1 rounded ${post.status === 'published'
                                                ? 'bg-green-500/20 text-green-400'
                                                : 'bg-yellow-500/20 text-yellow-400'
                                            }`}>
                                            {post.status}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button size="sm" variant="ghost" className="text-blue-400 hover:text-blue-300">
                                        <Eye className="h-4 w-4" />
                                    </Button>
                                    <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button size="sm" variant="ghost" className="text-red-400 hover:text-red-300">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                    </Card>
                ))}
            </div>
        </div>
    )
}
