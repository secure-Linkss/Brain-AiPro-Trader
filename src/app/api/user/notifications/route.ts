/**
 * User Notification Preferences API
 * Manage notification settings for different channels and types
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

async function getCurrentUser(request: NextRequest) {
    const authHeader = request.headers.get('authorization')
    if (!authHeader) return null

    const user = await prisma.user.findFirst()
    return user
}

/**
 * GET /api/user/notifications
 * Get all notification preferences
 */
export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUser(request)
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Get all preferences
        const preferences = await prisma.notificationPreference.findMany({
            where: { userId: user.id }
        })

        // Define default types if they don't exist
        const defaultTypes = ['signal', 'news', 'price_alert', 'system']
        const missingTypes = defaultTypes.filter(
            type => !preferences.find(p => p.type === type)
        )

        // Return existing + defaults for missing
        const result = [
            ...preferences,
            ...missingTypes.map(type => ({
                type,
                email: true,
                push: true,
                sms: false,
                telegram: false,
                minPriority: 'low',
                keywords: []
            }))
        ]

        return NextResponse.json(result)
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

/**
 * POST /api/user/notifications
 * Update notification preferences
 */
export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser(request)
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { type, email, push, sms, telegram, minPriority, keywords } = body

        if (!type) {
            return NextResponse.json(
                { error: 'Notification type is required' },
                { status: 400 }
            )
        }

        // Upsert preference
        const preference = await prisma.notificationPreference.upsert({
            where: {
                userId_type: {
                    userId: user.id,
                    type
                }
            },
            update: {
                email,
                push,
                sms,
                telegram,
                minPriority,
                keywords
            },
            create: {
                userId: user.id,
                type,
                email: email ?? true,
                push: push ?? true,
                sms: sms ?? false,
                telegram: telegram ?? false,
                minPriority: minPriority ?? 'low',
                keywords: keywords ?? []
            }
        })

        // Create audit log
        await prisma.auditLog.create({
            data: {
                userId: user.id,
                action: 'update_notification_preference',
                resource: 'notification_preference',
                resourceId: preference.id,
                metadata: { type, email, push, sms, telegram }
            }
        })

        return NextResponse.json({
            success: true,
            preference
        })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
