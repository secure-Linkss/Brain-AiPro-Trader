import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

// GET /api/mt4/trailing/logs/[tradeId]
export async function GET(
    req: Request,
    { params }: { params: { tradeId: string } }
) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const tradeId = params.tradeId

        // Get trade and verify ownership
        const trade = await db.mT4Trade.findUnique({
            where: { id: tradeId },
            include: {
                connection: true,
                trailingLogs: {
                    orderBy: { timestamp: 'desc' }
                }
            }
        })

        if (!trade) {
            return NextResponse.json({ error: 'Trade not found' }, { status: 404 })
        }

        if (trade.connection.userId !== session.user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        // Format logs with additional context
        const formattedLogs = trade.trailingLogs.map(log => {
            const slMovePips = trade.symbol.toUpperCase().includes('JPY')
                ? Math.abs(log.newSL - log.oldSL) * 100
                : Math.abs(log.newSL - log.oldSL) * 10000

            return {
                id: log.id,
                timestamp: log.timestamp,
                oldSL: log.oldSL,
                newSL: log.newSL,
                slMovePips: parseFloat(slMovePips.toFixed(2)),
                reason: log.reason,
                atrValue: log.atrValue,
                rMultiple: log.rMultiple,
                structureType: log.structureType,
                pullbackPercent: log.pullbackPercent
            }
        })

        return NextResponse.json({
            trade: {
                ticket: trade.ticket.toString(),
                symbol: trade.symbol,
                type: trade.type,
                entryPrice: trade.entryPrice,
                currentSL: trade.stopLoss,
                trailCount: trade.trailCount,
                trailingActive: trade.trailingActive
            },
            logs: formattedLogs,
            totalLogs: formattedLogs.length
        })
    } catch (error) {
        console.error('Get trailing logs error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
