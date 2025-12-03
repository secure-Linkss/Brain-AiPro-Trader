import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

// GET /api/mt4/connection/list
export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const connections = await db.mT4Connection.findMany({
            where: {
                userId: session.user.id
            },
            include: {
                trades: {
                    where: { status: 'open' },
                    select: {
                        id: true,
                        ticket: true,
                        symbol: true,
                        type: true,
                        lots: true,
                        profit: true
                    }
                },
                errors: {
                    where: {
                        timestamp: {
                            gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
                        }
                    },
                    orderBy: { timestamp: 'desc' },
                    take: 5
                },
                trailingConfig: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        // Calculate connection health
        const connectionsWithHealth = connections.map(conn => {
            const lastHeartbeat = conn.lastHeartbeat
            const minutesSinceHeartbeat = lastHeartbeat
                ? Math.floor((Date.now() - lastHeartbeat.getTime()) / 1000 / 60)
                : 999

            let connectionQuality = 'offline'
            if (minutesSinceHeartbeat < 1) connectionQuality = 'excellent'
            else if (minutesSinceHeartbeat < 5) connectionQuality = 'good'
            else if (minutesSinceHeartbeat < 15) connectionQuality = 'poor'

            return {
                id: conn.id,
                deviceName: conn.deviceName,
                accountNumber: conn.accountNumber.toString(),
                platform: conn.platform,
                brokerName: conn.brokerName,
                status: conn.status,
                isOnline: conn.isOnline && minutesSinceHeartbeat < 5,
                connectionQuality,
                lastHeartbeat: conn.lastHeartbeat,
                balance: conn.balance,
                equity: conn.equity,
                profit: conn.profit,
                freeMargin: conn.freeMargin,
                marginLevel: conn.marginLevel,
                leverage: conn.leverage,
                openTrades: conn.trades.length,
                recentErrors: conn.errors.length,
                trailingEnabled: conn.trailingConfig?.enabled || false,
                createdAt: conn.createdAt
            }
        })

        return NextResponse.json({
            connections: connectionsWithHealth,
            total: connections.length
        })
    } catch (error) {
        console.error('List connections error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
