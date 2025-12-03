import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateSchema = z.object({
    apiKey: z.string().min(10).optional(),
    isActive: z.boolean().optional()
})

// PATCH: Update AI provider
export async function PATCH(
    req: Request,
    { params }: { params: { id: string } }
) {
    const session = await getServerSession(authOptions)
    if (session?.user?.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const body = await req.json()
        const data = updateSchema.parse(body)

        const provider = await prisma.aIProvider.update({
            where: { id: params.id },
            data
        })

        return NextResponse.json({
            ...provider,
            apiKey: `****${provider.apiKey.slice(-4)}`
        })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.errors }, { status: 400 })
        }
        console.error('Failed to update provider:', error)
        return NextResponse.json({ error: 'Failed to update provider' }, { status: 500 })
    }
}

// DELETE: Delete AI provider
export async function DELETE(
    req: Request,
    { params }: { params: { id: string } }
) {
    const session = await getServerSession(authOptions)
    if (session?.user?.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        await prisma.aIProvider.delete({
            where: { id: params.id }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Failed to delete provider:', error)
        return NextResponse.json({ error: 'Failed to delete provider' }, { status: 500 })
    }
}
