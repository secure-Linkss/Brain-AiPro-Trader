/**
 * Admin Subscription Management API
 * Manage user subscriptions
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

async function verifyAdmin(request: NextRequest) {
    const authHeader = request.headers.get('authorization')
    if (!authHeader) return null

    const user = await prisma.user.findFirst({
        where: { role: 'admin' }
    })

    return user
}

/**
 * GET /api/admin/subscriptions
 * Get all subscriptions with filters
 */
export async function GET(request: NextRequest) {
    try {
        const admin = await verifyAdmin(request)
        if (!admin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '20')
        const status = searchParams.get('status')
        const planId = searchParams.get('planId')

        const skip = (page - 1) * limit

        const where: any = {}
        if (status) where.status = status
        if (planId) where.planId = planId

        const [subscriptions, total] = await Promise.all([
            prisma.subscription.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    user: {
                        select: {
                            id: true,
                            email: true,
                            name: true
                        }
                    },
                    plan: true
                }
            }),
            prisma.subscription.count({ where })
        ])

        return NextResponse.json({
            subscriptions,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

/**
 * PATCH /api/admin/subscriptions/:id
 * Update subscription
 */
export async function PATCH(request: NextRequest) {
    try {
        const admin = await verifyAdmin(request)
        if (!admin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { subscriptionId, updates } = body

        if (!subscriptionId) {
            return NextResponse.json(
                { error: 'Subscription ID required' },
                { status: 400 }
            )
        }

        const subscription = await prisma.subscription.update({
            where: { id: subscriptionId },
            data: updates,
            include: {
                user: true,
                plan: true
            }
        })

        // Create audit log
        await prisma.auditLog.create({
            data: {
                userId: admin.id,
                action: 'update_subscription',
                resource: 'subscription',
                resourceId: subscriptionId,
                metadata: { updates }
            }
        })

        return NextResponse.json({
            success: true,
            subscription
        })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

/**
 * POST /api/admin/subscriptions/cancel
 * Cancel subscription
 */
export async function POST(request: NextRequest) {
    try {
        const admin = await verifyAdmin(request)
        if (!admin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { subscriptionId, immediately } = body

        if (!subscriptionId) {
            return NextResponse.json(
                { error: 'Subscription ID required' },
                { status: 400 }
            )
        }

        const subscription = await prisma.subscription.update({
            where: { id: subscriptionId },
            data: immediately ? {
                status: 'cancelled',
                cancelledAt: new Date(),
                endedAt: new Date()
            } : {
                cancelAtPeriodEnd: true,
                cancelledAt: new Date()
            }
        })

        // Create audit log
        await prisma.auditLog.create({
            data: {
                userId: admin.id,
                action: 'cancel_subscription',
                resource: 'subscription',
                resourceId: subscriptionId,
                metadata: { immediately }
            }
        })

        return NextResponse.json({
            success: true,
            subscription
        })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
