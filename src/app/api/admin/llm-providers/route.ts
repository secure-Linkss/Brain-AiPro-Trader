import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const providers = await prisma.lLMProvider.findMany({
            orderBy: { name: 'asc' }
        })

        return NextResponse.json(providers)
    } catch (error) {
        console.error('Failed to fetch LLM providers:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await req.json()
        const { name, provider, apiKey, model, isActive } = body

        const newProvider = await prisma.lLMProvider.create({
            data: {
                name,
                provider,
                apiKey,
                model,
                isActive: isActive ?? true
            }
        })

        return NextResponse.json(newProvider)
    } catch (error) {
        console.error('Failed to create LLM provider:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function PUT(req: Request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await req.json()
        const { id, ...data } = body

        const updatedProvider = await prisma.lLMProvider.update({
            where: { id },
            data
        })

        return NextResponse.json(updatedProvider)
    } catch (error) {
        console.error('Failed to update LLM provider:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function DELETE(req: Request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(req.url)
        const id = searchParams.get('id')

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 })
        }

        await prisma.lLMProvider.delete({
            where: { id }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Failed to delete LLM provider:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
