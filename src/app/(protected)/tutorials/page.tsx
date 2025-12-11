'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PlayCircle, FileText, Download, Clock } from 'lucide-react'

export default function TutorialsPage() {
    const tutorials = [
        {
            id: 1,
            title: "Platform Overview & Setup",
            type: "video",
            duration: "12 min",
            description: "Complete walkthrough of the platform features and initial setup",
            level: "Beginner"
        },
        {
            id: 2,
            title: "Understanding AI Signals",
            type: "video",
            duration: "18 min",
            description: "Learn how to interpret and act on AI-generated trading signals",
            level: "Beginner"
        },
        {
            id: 3,
            title: "Risk Management Strategies",
            type: "pdf",
            duration: "15 pages",
            description: "Comprehensive guide to managing risk in AI trading",
            level: "Intermediate"
        },
        {
            id: 4,
            title: "Advanced Pattern Recognition",
            type: "video",
            duration: "25 min",
            description: "Deep dive into harmonic patterns and Elliott waves",
            level: "Advanced"
        },
        {
            id: 5,
            title: "Copy Trading Best Practices",
            type: "pdf",
            duration: "10 pages",
            description: "How to select and follow top traders effectively",
            level: "Intermediate"
        },
        {
            id: 6,
            title: "API Integration Guide",
            type: "pdf",
            duration: "20 pages",
            description: "Technical documentation for API integration",
            level: "Expert"
        }
    ]

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">Learning Center</h1>
                <p className="text-gray-400">Master AI trading with our comprehensive tutorials</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tutorials.map((tutorial) => (
                    <Card key={tutorial.id} className="border-white/10 bg-slate-900/50 hover:border-blue-500/50 transition-all hover:-translate-y-1 group cursor-pointer">
                        <CardHeader>
                            <div className="flex items-start justify-between mb-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${tutorial.type === 'video' ? 'bg-blue-500/20' : 'bg-green-500/20'
                                    }`}>
                                    {tutorial.type === 'video' ? (
                                        <PlayCircle className="h-6 w-6 text-blue-400" />
                                    ) : (
                                        <FileText className="h-6 w-6 text-green-400" />
                                    )}
                                </div>
                                <span className={`text-xs px-2 py-1 rounded border ${tutorial.level === 'Beginner' ? 'border-green-500/30 text-green-400 bg-green-500/10' :
                                        tutorial.level === 'Intermediate' ? 'border-yellow-500/30 text-yellow-400 bg-yellow-500/10' :
                                            tutorial.level === 'Advanced' ? 'border-orange-500/30 text-orange-400 bg-orange-500/10' :
                                                'border-red-500/30 text-red-400 bg-red-500/10'
                                    }`}>
                                    {tutorial.level}
                                </span>
                            </div>
                            <CardTitle className="text-lg text-white group-hover:text-blue-400 transition-colors">
                                {tutorial.title}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-gray-400 mb-4">{tutorial.description}</p>
                            <div className="flex items-center justify-between text-xs text-gray-500">
                                <div className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    <span>{tutorial.duration}</span>
                                </div>
                                <button className="flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors">
                                    <Download className="h-3 w-3" />
                                    <span>Access</span>
                                </button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card className="border-white/10 bg-gradient-to-r from-blue-900/20 to-purple-900/20 p-6">
                <div className="text-center">
                    <h3 className="text-xl font-bold text-white mb-2">Need More Help?</h3>
                    <p className="text-gray-300 mb-4">Contact our support team for personalized training</p>
                    <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                        Contact Support
                    </button>
                </div>
            </Card>
        </div>
    )
}
