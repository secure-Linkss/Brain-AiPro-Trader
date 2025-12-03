/**
 * Telegram Verification API
 * Generate verification codes to link Telegram accounts
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { randomBytes } from 'crypto'

async function getCurrentUser(request: NextRequest) {
    const authHeader = request.headers.get('authorization')
    if (!authHeader) return null

    const user = await prisma.user.findFirst()
    return user
}

/**
 * POST /api/telegram/verify
 * Generate a verification code
 */
export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser(request)
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Generate a unique code
        const code = randomBytes(4).toString('hex').toUpperCase()

        // Store code temporarily (in Redis or DB)
        // For now, we'll return it directly and assume the user enters it in the bot
        // In a real implementation, you'd store this code with the userId and expiry

        // Construct the deep link to the bot
        const botUsername = process.env.TELEGRAM_BOT_USERNAME || 'BrainAiProBot'
        const link = `https://t.me/${botUsername}?start=${code}`

        return NextResponse.json({
            code,
            link,
            expiresIn: 300 // 5 minutes
        })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
