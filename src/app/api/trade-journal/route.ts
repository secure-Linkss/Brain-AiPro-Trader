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

        // Fetch trades
        const trades = await prisma.trade.findMany({
            where: { userId: session.user.id },
            orderBy: { closedAt: 'desc' },
            take: 50
        })

        // Calculate stats
        const closedTrades = trades.filter(t => t.status === 'CLOSED' && t.profit !== null)
        const totalTrades = closedTrades.length
        const winningTrades = closedTrades.filter(t => t.profit! > 0).length
        const losingTrades = closedTrades.filter(t => t.profit! <= 0).length
        const totalProfit = closedTrades.reduce((sum, t) => sum + (t.profit! > 0 ? t.profit! : 0), 0)
        const totalLoss = closedTrades.reduce((sum, t) => sum + (t.profit! < 0 ? Math.abs(t.profit!) : 0), 0)
        const netProfit = totalProfit - totalLoss

        const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0
        const profitFactor = totalLoss > 0 ? totalProfit / totalLoss : totalProfit > 0 ? 999 : 0

        const averageWin = winningTrades > 0 ? totalProfit / winningTrades : 0
        const averageLoss = losingTrades > 0 ? totalLoss / losingTrades : 0

        const largestWin = Math.max(...closedTrades.map(t => t.profit || 0), 0)
        const largestLoss = Math.min(...closedTrades.map(t => t.profit || 0), 0) // Will be negative

        const averageRR = averageLoss > 0 ? averageWin / averageLoss : 0
        const expectancy = totalTrades > 0 ? netProfit / totalTrades : 0

        const stats = {
            totalTrades,
            winningTrades,
            losingTrades,
            winRate,
            totalProfit,
            totalLoss,
            netProfit,
            profitFactor,
            averageWin,
            averageLoss,
            largestWin,
            largestLoss: Math.abs(largestLoss),
            averageRR,
            expectancy
        }

        return NextResponse.json({
            stats,
            trades: trades.map(t => ({
                ...t,
                duration: t.closedAt && t.openedAt
                    ? formatDuration(new Date(t.closedAt).getTime() - new Date(t.openedAt).getTime())
                    : 'Open',
                timestamp: t.closedAt || t.openedAt
            }))
        })
    } catch (error) {
        console.error('Failed to fetch trade journal:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

function formatDuration(ms: number): string {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days}d ${hours % 24}h`
    if (hours > 0) return `${hours}h ${minutes % 60}m`
    if (minutes > 0) return `${minutes}m`
    return `${seconds}s`
}
