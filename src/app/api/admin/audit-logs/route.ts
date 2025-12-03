/**
 * Admin Audit Logs API
 * View and filter audit logs
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
 * GET /api/admin/audit-logs
 * Get audit logs with filters
 */
export async function GET(request: NextRequest) {
    try {
        const admin = await verifyAdmin(request)
        if (!admin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '50')
        const userId = searchParams.get('userId')
        const action = searchParams.get('action')
        const resource = searchParams.get('resource')
        const status = searchParams.get('status')
        const startDate = searchParams.get('startDate')
        const endDate = searchParams.get('endDate')

        const skip = (page - 1) * limit

        // Build where clause
        const where: any = {}

        if (userId) {
            where.userId = userId
        }

        if (action) {
            where.action = action
        }

        if (resource) {
            where.resource = resource
        }

        if (status) {
            where.status = status
        }

        if (startDate || endDate) {
            where.timestamp = {}
            if (startDate) {
                where.timestamp.gte = new Date(startDate)
            }
            if (endDate) {
                where.timestamp.lte = new Date(endDate)
            }
        }

        const [logs, total] = await Promise.all([
            prisma.auditLog.findMany({
                where,
                skip,
                take: limit,
                orderBy: { timestamp: 'desc' },
                include: {
                    user: {
                        select: {
                            id: true,
                            email: true,
                            name: true,
                            role: true
                        }
                    }
                }
            }),
            prisma.auditLog.count({ where })
        ])

        // Get action statistics
        const actionStats = await prisma.auditLog.groupBy({
            by: ['action'],
            _count: {
                action: true
            },
            where: startDate || endDate ? { timestamp: where.timestamp } : undefined
        })

        return NextResponse.json({
            logs,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            },
            statistics: {
                actions: actionStats.map(stat => ({
                    action: stat.action,
                    count: stat._count.action
                }))
            }
        })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

/**
 * DELETE /api/admin/audit-logs
 * Clear old audit logs
 */
export async function DELETE(request: NextRequest) {
    try {
        const admin = await verifyAdmin(request)
        if (!admin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const daysToKeep = parseInt(searchParams.get('daysToKeep') || '90')

        const cutoffDate = new Date()
        cutoffDate.setDate(cutoffDate.getDate() - daysToKeep)

        const result = await prisma.auditLog.deleteMany({
            where: {
                timestamp: {
                    lt: cutoffDate
                }
            }
        })

        // Log this action
        await prisma.auditLog.create({
            data: {
                userId: admin.id,
                action: 'clear_audit_logs',
                resource: 'audit_log',
                metadata: {
                    daysToKeep,
                    deletedCount: result.count
                }
            }
        })

        return NextResponse.json({
            success: true,
            deletedCount: result.count
        })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
