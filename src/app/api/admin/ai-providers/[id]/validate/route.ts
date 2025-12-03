import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

// POST: Validate AI provider
export async function POST(
    req: Request,
    { params }: { params: { id: string } }
) {
    const session = await getServerSession(authOptions)
    if (session?.user?.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const provider = await prisma.aIProvider.findUnique({
            where: { id: params.id }
        })

        if (!provider) {
            return NextResponse.json({ error: 'Provider not found' }, { status: 404 })
        }

        // Validate the API key by making a test request
        const startTime = Date.now()
        const validation = await validateProviderKey(provider.name, provider.apiKey)
        const responseTime = Date.now() - startTime

        if (validation.valid) {
            // Update provider as validated
            await prisma.aIProvider.update({
                where: { id: params.id },
                data: {
                    isValidated: true,
                    isActive: true,
                    lastValidated: new Date(),
                    avgResponseTime: responseTime
                }
            })

            return NextResponse.json({
                valid: true,
                provider: provider.displayName,
                responseTime
            })
        } else {
            return NextResponse.json({
                valid: false,
                error: validation.error
            })
        }
    } catch (error) {
        console.error('Validation error:', error)
        return NextResponse.json({ error: 'Validation failed' }, { status: 500 })
    }
}

async function validateProviderKey(
    name: string,
    apiKey: string
): Promise<{ valid: boolean; error?: string }> {
    try {
        switch (name) {
            case 'gemini':
                return await validateGemini(apiKey)
            case 'openai':
                return await validateOpenAI(apiKey)
            case 'claude':
                return await validateClaude(apiKey)
            case 'openrouter':
                return await validateOpenRouter(apiKey)
            default:
                return { valid: false, error: 'Unknown provider' }
        }
    } catch (error) {
        return { valid: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
}

async function validateGemini(apiKey: string) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: "Test" }] }]
        })
    })

    if (response.status === 200) {
        return { valid: true }
    } else if (response.status === 400) {
        return { valid: false, error: 'Invalid API key' }
    } else if (response.status === 429) {
        return { valid: true } // Key is valid, just rate limited
    } else {
        return { valid: false, error: `HTTP ${response.status}` }
    }
}

async function validateOpenAI(apiKey: string) {
    const url = 'https://api.openai.com/v1/models'

    const response = await fetch(url, {
        headers: {
            'Authorization': `Bearer ${apiKey}`
        }
    })

    if (response.status === 200) {
        return { valid: true }
    } else if (response.status === 401) {
        return { valid: false, error: 'Invalid API key' }
    } else {
        return { valid: false, error: `HTTP ${response.status}` }
    }
}

async function validateClaude(apiKey: string) {
    const url = 'https://api.anthropic.com/v1/messages'

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: 'claude-3-sonnet-20240229',
            max_tokens: 10,
            messages: [{ role: 'user', content: 'Test' }]
        })
    })

    if (response.status === 200) {
        return { valid: true }
    } else if (response.status === 401) {
        return { valid: false, error: 'Invalid API key' }
    } else if (response.status === 429) {
        return { valid: true } // Valid, just rate limited
    } else {
        return { valid: false, error: `HTTP ${response.status}` }
    }
}

async function validateOpenRouter(apiKey: string) {
    const url = 'https://openrouter.ai/api/v1/models'

    const response = await fetch(url, {
        headers: {
            'Authorization': `Bearer ${apiKey}`
        }
    })

    if (response.status === 200) {
        return { valid: true }
    } else if (response.status === 401 || response.status === 403) {
        return { valid: false, error: 'Invalid API key' }
    } else {
        return { valid: false, error: `HTTP ${response.status}` }
    }
}
