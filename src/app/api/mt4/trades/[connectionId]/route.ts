import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

// GET /api/mt4/trades/[connectionId]
export async function GET(
    req: Request,
    { params }: { params: { connectionId: string } }
) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const connectionId = params.connectionId
        const { searchParams } = new URL(req.url)
        const status = searchParams.get('status') || 'open'

        // Verify ownership
        const connection = await db.mT4Connection.findUnique({
            where: { id: connectionId }
        })

        if (!connection) {
            return NextResponse.json({ error: 'Connection not found' }, { status: 404 })
        }

        if (connection.userId !== session.user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        // Get trades
        const trades = await db.mT4Trade.findMany({
            where: {
                connectionId,
                status: status === 'all' ? undefined : status
            },
            orderBy: {
                openTime: 'desc'
            },
            take: 100 // Limit to last 100 trades
        })

        // Calculate additional metrics
        const formattedTrades = trades.map(trade => {
            const pips = trade.symbol.toUpperCase().includes('JPY')
                ? Math.abs(trade.currentPrice || trade.entryPrice - trade.entryPrice) * 100
                : Math.abs((trade.currentPrice || trade.entryPrice) - trade.entryPrice) * 10000

            const profitPips = trade.type === 'buy'
                ? pips * (trade.currentPrice && trade.currentPrice > trade.entryPrice ? 1 : -1)
                : pips * (trade.currentPrice && trade.currentPrice < trade.entryPrice ? 1 : -1)

            // Calculate R-multiple if trade is closed
            let rMultiple = null
            if (trade.status === 'closed' && trade.stopLoss) {
                const riskPips = Math.abs(trade.entryPrice - trade.stopLoss) *
                    (trade.symbol.toUpperCase().includes('JPY') ? 100 : 10000)
                rMultiple = riskPips > 0 ? profitPips / riskPips : 0
            }

            return {
                id: trade.id,
                ticket: trade.ticket.toString(),
                symbol: trade.symbol,
                type: trade.type,
                lots: trade.lots,
                entryPrice: trade.entryPrice,
                currentPrice: trade.currentPrice,
                stopLoss: trade.stopLoss,
                takeProfit: trade.takeProfit,
                tp1: trade.tp1,
                tp2: trade.tp2,
                tp3: trade.tp3,
                tp4: trade.tp4,
                tp1Hit: trade.tp1Hit,
                tp2Hit: trade.tp2Hit,
                tp3Hit: trade.tp3Hit,
                tp4Hit: trade.tp4Hit,
                profit: trade.profit,
                profitPips: parseFloat(profitPips.toFixed(2)),
                rMultiple: rMultiple ? parseFloat(rMultiple.toFixed(2)) : null,
                status: trade.status,
                openTime: trade.openTime,
                closeTime: trade.closeTime,
                closePrice: trade.closePrice,
                closeReason: trade.closeReason,
                trailingActive: trade.trailingActive,
                trailCount: trade.trailCount,
                breakEvenHit: trade.breakEvenHit,
                maxProfit: trade.maxProfit,
                maxDrawdown: trade.maxDrawdown
            }
        })

        // Calculate summary stats
        const openTrades = formattedTrades.filter(t => t.status === 'open')
        const closedTrades = formattedTrades.filter(t => t.status === 'closed')

        const totalProfit = formattedTrades.reduce((sum, t) => sum + t.profit, 0)
        const totalProfitPips = formattedTrades.reduce((sum, t) => sum + t.profitPips, 0)

        const winningTrades = closedTrades.filter(t => t.profit > 0).length
        const losingTrades = closedTrades.filter(t => t.profit < 0).length
        const winRate = closedTrades.length > 0
            ? (winningTrades / closedTrades.length) * 100
            : 0

        return NextResponse.json({
            trades: formattedTrades,
            summary: {
                total: formattedTrades.length,
                open: openTrades.length,
                closed: closedTrades.length,
                totalProfit: parseFloat(totalProfit.toFixed(2)),
                totalProfitPips: parseFloat(totalProfitPips.toFixed(2)),
                winningTrades,
                losingTrades,
                winRate: parseFloat(winRate.toFixed(2))
            }
        })
    } catch (error) {
        console.error('Get trades error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
