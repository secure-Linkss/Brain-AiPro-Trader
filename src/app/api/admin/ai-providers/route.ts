import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const providerSchema = z.object({
    name: z.enum(['gemini', 'openai', 'claude', 'openrouter']),
    apiKey: z.string().min(10)
})

// GET: List all AI providers
export async function GET(req: Request) {
    const session = await getServerSession(authOptions)
    if (session?.user?.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const providers = await prisma.aIProvider.findMany({
            orderBy: { createdAt: 'desc' }
        })

        // Mask API keys (show only last 4 characters)
        const masked = providers.map(p => ({
            ...p,
            apiKey: `****${p.apiKey.slice(-4)}`
        }))

        return NextResponse.json(masked)
    } catch (error) {
        console.error('Failed to fetch providers:', error)
        return NextResponse.json({ error: 'Failed to fetch providers' }, { status: 500 })
    }
}

// POST: Add new AI provider
export async function POST(req: Request) {
    const session = await getServerSession(authOptions)
    if (session?.user?.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const body = await req.json()
        const { name, apiKey } = providerSchema.parse(body)

        // Check if provider already exists
        const existing = await prisma.aIProvider.findFirst({
            where: { name, isActive: true }
        })

        if (existing) {
            return NextResponse.json(
                { error: 'An active provider with this name already exists' },
                { status: 400 }
            )
        }

        // Create provider
        const provider = await prisma.aIProvider.create({
            data: {
                name,
                displayName: getDisplayName(name),
                apiKey,
                isActive: false, // Inactive until validated
                isValidated: false,
                requestCount: 0,
                successCount: 0,
                failureCount: 0,
                successRate: 0,
                avgResponseTime: 0
            }
        })

        return NextResponse.json({
            ...provider,
            apiKey: `****${provider.apiKey.slice(-4)}`
        })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.errors }, { status: 400 })
        }
        console.error('Failed to create provider:', error)
        return NextResponse.json({ error: 'Failed to create provider' }, { status: 500 })
    }
}

function getDisplayName(name: string): string {
    const names: Record<string, string> = {
        'gemini': 'Gemini Flash 2.5',
        'openai': 'ChatGPT-4 Turbo',
        'claude': 'Claude 3.5 Sonnet',
        'openrouter': 'OpenRouter'
    }
    return names[name] || name
}
