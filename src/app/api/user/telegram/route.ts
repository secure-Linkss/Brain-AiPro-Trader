import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const config = await prisma.telegramConfig.findUnique({
            where: { userId: session.user.id }
        })

        return NextResponse.json(config || { isConnected: false })
    } catch (error) {
        console.error('Failed to fetch Telegram config:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { verificationCode } = await req.json()

        // Find the verification token
        const token = await prisma.verificationToken.findFirst({
            where: {
                token: verificationCode,
                expires: { gt: new Date() }
            }
        })

        if (!token) {
            return NextResponse.json({ error: 'Invalid or expired code' }, { status: 400 })
        }

        // Parse the identifier (chatId)
        const chatId = token.identifier

        // Create or update Telegram config
        await prisma.telegramConfig.upsert({
            where: { userId: session.user.id },
            create: {
                userId: session.user.id,
                chatId,
                username: 'User', // We might want to fetch this from Telegram API
                isActive: true
            },
            update: {
                chatId,
                isActive: true
            }
        })

        // Delete the used token
        await prisma.verificationToken.delete({
            where: { identifier_token: { identifier: chatId, token: verificationCode } }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Failed to link Telegram:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function DELETE(req: Request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        await prisma.telegramConfig.delete({
            where: { userId: session.user.id }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Failed to unlink Telegram:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
