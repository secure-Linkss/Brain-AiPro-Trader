/**
 * Admin Analytics Dashboard API
 * Comprehensive analytics and metrics
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
 * GET /api/admin/analytics
 * Get comprehensive analytics
 */
export async function GET(request: NextRequest) {
    try {
        const admin = await verifyAdmin(request)
        if (!admin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const period = searchParams.get('period') || '30' // days

        const startDate = new Date()
        startDate.setDate(startDate.getDate() - parseInt(period))

        // User Statistics
        const [
            totalUsers,
            activeUsers,
            newUsers,
            usersByRole
        ] = await Promise.all([
            prisma.user.count(),
            prisma.user.count({
                where: {
                    auditLogs: {
                        some: {
                            timestamp: {
                                gte: startDate
                            }
                        }
                    }
                }
            }),
            prisma.user.count({
                where: {
                    createdAt: {
                        gte: startDate
                    }
                }
            }),
            prisma.user.groupBy({
                by: ['role'],
                _count: {
                    role: true
                }
            })
        ])

        // Subscription Statistics
        const [
            totalSubscriptions,
            activeSubscriptions,
            subscriptionsByPlan,
            mrr
        ] = await Promise.all([
            prisma.subscription.count(),
            prisma.subscription.count({
                where: {
                    status: 'active'
                }
            }),
            prisma.subscription.groupBy({
                by: ['planId'],
                _count: {
                    planId: true
                },
                where: {
                    status: 'active'
                }
            }),
            prisma.subscription.findMany({
                where: {
                    status: 'active'
                },
                include: {
                    plan: true
                }
            }).then(subs =>
                subs.reduce((sum, sub) => {
                    const amount = sub.plan.interval === 'year'
                        ? sub.plan.amount / 12
                        : sub.plan.amount
                    return sum + amount
                }, 0)
            )
        ])

        // Signal Statistics
        const [
            totalSignals,
            signalsByType,
            signalsByStrategy,
            signalSuccessRate
        ] = await Promise.all([
            prisma.signal.count({
                where: {
                    createdAt: {
                        gte: startDate
                    }
                }
            }),
            prisma.signal.groupBy({
                by: ['type'],
                _count: {
                    type: true
                },
                where: {
                    createdAt: {
                        gte: startDate
                    }
                }
            }),
            prisma.signal.groupBy({
                by: ['strategy'],
                _count: {
                    strategy: true
                },
                where: {
                    createdAt: {
                        gte: startDate
                    }
                },
                take: 10,
                orderBy: {
                    _count: {
                        strategy: 'desc'
                    }
                }
            }),
            prisma.signal.aggregate({
                _avg: {
                    strength: true
                },
                where: {
                    createdAt: {
                        gte: startDate
                    }
                }
            })
        ])

        // Pattern Detection Statistics
        const patternStats = await prisma.patternDetection.groupBy({
            by: ['patternType'],
            _count: {
                patternType: true
            },
            _avg: {
                confidence: true
            },
            where: {
                detectedAt: {
                    gte: startDate
                }
            },
            orderBy: {
                _count: {
                    patternType: 'desc'
                }
            },
            take: 10
        })

        // System Health
        const systemHealth = await prisma.systemHealth.findMany({
            where: {
                timestamp: {
                    gte: new Date(Date.now() - 3600000) // Last hour
                }
            },
            orderBy: {
                timestamp: 'desc'
            },
            take: 100
        })

        const healthByComponent = systemHealth.reduce((acc: any, health) => {
            if (!acc[health.component]) {
                acc[health.component] = {
                    healthy: 0,
                    degraded: 0,
                    down: 0,
                    avgResponseTime: 0,
                    totalResponseTime: 0,
                    count: 0
                }
            }

            acc[health.component][health.status]++
            if (health.responseTime) {
                acc[health.component].totalResponseTime += health.responseTime
                acc[health.component].count++
            }

            return acc
        }, {})

        // Calculate average response times
        Object.keys(healthByComponent).forEach(component => {
            const comp = healthByComponent[component]
            if (comp.count > 0) {
                comp.avgResponseTime = comp.totalResponseTime / comp.count
            }
            delete comp.totalResponseTime
            delete comp.count
        })

        // Revenue Statistics
        const payments = await prisma.payment.findMany({
            where: {
                createdAt: {
                    gte: startDate
                },
                status: 'completed'
            }
        })

        const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0)
        const revenueByDay = payments.reduce((acc: any, payment) => {
            const day = payment.createdAt.toISOString().split('T')[0]
            acc[day] = (acc[day] || 0) + payment.amount
            return acc
        }, {})

        // News Statistics
        const newsStats = await prisma.newsArticle.aggregate({
            _count: {
                id: true
            },
            _avg: {
                sentiment: true,
                impactScore: true
            },
            where: {
                publishedAt: {
                    gte: startDate
                }
            }
        })

        return NextResponse.json({
            users: {
                total: totalUsers,
                active: activeUsers,
                new: newUsers,
                byRole: usersByRole.map(r => ({
                    role: r.role,
                    count: r._count.role
                }))
            },
            subscriptions: {
                total: totalSubscriptions,
                active: activeSubscriptions,
                byPlan: subscriptionsByPlan.map(p => ({
                    planId: p.planId,
                    count: p._count.planId
                })),
                mrr: Math.round(mrr * 100) / 100
            },
            signals: {
                total: totalSignals,
                byType: signalsByType.map(s => ({
                    type: s.type,
                    count: s._count.type
                })),
                topStrategies: signalsByStrategy.map(s => ({
                    strategy: s.strategy,
                    count: s._count.strategy
                })),
                avgStrength: signalSuccessRate._avg.strength || 0
            },
            patterns: {
                topPatterns: patternStats.map(p => ({
                    type: p.patternType,
                    count: p._count.patternType,
                    avgConfidence: p._avg.confidence || 0
                }))
            },
            systemHealth: healthByComponent,
            revenue: {
                total: Math.round(totalRevenue * 100) / 100,
                byDay: revenueByDay
            },
            news: {
                total: newsStats._count.id,
                avgSentiment: newsStats._avg.sentiment || 0,
                avgImpact: newsStats._avg.impactScore || 0
            },
            period: parseInt(period)
        })
    } catch (error: any) {
        console.error('Analytics error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
