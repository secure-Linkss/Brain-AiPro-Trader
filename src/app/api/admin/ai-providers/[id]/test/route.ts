import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

// POST: Test AI provider generation
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

        const startTime = Date.now()
        const result = await testProviderGeneration(provider.name, provider.apiKey)
        const responseTime = Date.now() - startTime

        if (result.success) {
            return NextResponse.json({
                success: true,
                response: result.response,
                responseTime
            })
        } else {
            return NextResponse.json({
                success: false,
                error: result.error
            })
        }
    } catch (error) {
        console.error('Test error:', error)
        return NextResponse.json({ error: 'Test failed' }, { status: 500 })
    }
}

async function testProviderGeneration(
    name: string,
    apiKey: string
): Promise<{ success: boolean; response?: string; error?: string }> {
    try {
        switch (name) {
            case 'gemini':
                return await testGemini(apiKey)
            case 'openai':
                return await testOpenAI(apiKey)
            case 'claude':
                return await testClaude(apiKey)
            case 'openrouter':
                return await testOpenRouter(apiKey)
            default:
                return { success: false, error: 'Unknown provider' }
        }
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
}

async function testGemini(apiKey: string) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: "Say 'Hello from Gemini' if you can hear me." }] }]
        })
    })

    const data = await response.json()

    if (response.status === 200) {
        return { success: true, response: data.candidates?.[0]?.content?.parts?.[0]?.text || "No response text" }
    } else {
        return { success: false, error: data.error?.message || `HTTP ${response.status}` }
    }
}

async function testOpenAI(apiKey: string) {
    const url = 'https://api.openai.com/v1/chat/completions'

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: "Say 'Hello from OpenAI' if you can hear me." }],
            max_tokens: 20
        })
    })

    const data = await response.json()

    if (response.status === 200) {
        return { success: true, response: data.choices?.[0]?.message?.content || "No response text" }
    } else {
        return { success: false, error: data.error?.message || `HTTP ${response.status}` }
    }
}

async function testClaude(apiKey: string) {
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
            max_tokens: 20,
            messages: [{ role: 'user', content: "Say 'Hello from Claude' if you can hear me." }]
        })
    })

    const data = await response.json()

    if (response.status === 200) {
        return { success: true, response: data.content?.[0]?.text || "No response text" }
    } else {
        return { success: false, error: data.error?.message || `HTTP ${response.status}` }
    }
}

async function testOpenRouter(apiKey: string) {
    const url = 'https://openrouter.ai/api/v1/chat/completions'

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: "openai/gpt-3.5-turbo",
            messages: [{ role: "user", content: "Say 'Hello from OpenRouter' if you can hear me." }],
            max_tokens: 20
        })
    })

    const data = await response.json()

    if (response.status === 200) {
        return { success: true, response: data.choices?.[0]?.message?.content || "No response text" }
    } else {
        return { success: false, error: data.error?.message || `HTTP ${response.status}` }
    }
}
