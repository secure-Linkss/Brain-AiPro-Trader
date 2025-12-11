import { NextResponse } from 'next/server'

export async function GET() {
    try {
        // Return real initial state (Clean State)
        const stats = {
            totalProfit: 0.00,
            winRate: 0.0,
            activeTrades: 0,
            todaySignals: 0,
            weeklyProfit: 0.00,
            monthlyProfit: 0.00,
            totalTrades: 0,
            winningTrades: 0,
            losingTrades: 0
        }

        return NextResponse.json(stats)
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to fetch dashboard stats' },
            { status: 500 }
        )
    }
}
