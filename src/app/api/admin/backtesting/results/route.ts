import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(req.url)
        const limit = parseInt(searchParams.get('limit') || '20')

        // Fetch backtest results from database
        const results = await prisma.backtestResult.findMany({
            take: limit,
            orderBy: { createdAt: 'desc' }
        })

        // Transform results to match frontend interface
        const transformedResults = results.map(result => ({
            id: result.id,
            strategy_name: result.strategyName,
            asset_class: result.symbol.includes('USD') ? 'forex' : result.symbol.includes('USDT') ? 'crypto' : 'stocks',
            metrics: {
                sharpe_ratio: result.sharpeRatio,
                win_rate: result.winRate,
                total_return: result.netProfit / 10000, // Assuming initial capital of 10000
                max_drawdown: result.maxDrawdown,
                total_trades: result.totalTrades
            },
            analysis: {
                performance_grade: calculateGrade(result.sharpeRatio, result.winRate),
                deployment_ready: result.sharpeRatio > 1.5 && result.winRate > 0.5 && result.maxDrawdown < 0.25,
                risk_assessment: result.maxDrawdown < 0.15 ? 'Low' : result.maxDrawdown < 0.25 ? 'Medium' : 'High'
            },
            created_at: result.createdAt.toISOString()
        }))

        return NextResponse.json({ results: transformedResults })
    } catch (error) {
        console.error('Failed to fetch backtest results:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

function calculateGrade(sharpe: number, winRate: number): string {
    if (sharpe > 2.5 && winRate > 0.6) return 'A+'
    if (sharpe > 2.0 && winRate > 0.55) return 'A'
    if (sharpe > 1.5 && winRate > 0.5) return 'B'
    if (sharpe > 1.0) return 'C'
    return 'D'
}
