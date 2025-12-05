import { NextResponse } from 'next/server'

export async function GET() {
    try {
        // In production, this would query your database
        // For now, return realistic demo data

        const stats = {
            totalProfit: 12847.50,
            winRate: 76.8,
            activeTrades: 3,
            todaySignals: 12,
            weeklyProfit: 3250.00,
            monthlyProfit: 12847.50,
            totalTrades: 156,
            winningTrades: 120,
            losingTrades: 36
        }

        return NextResponse.json(stats)
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to fetch dashboard stats' },
            { status: 500 }
        )
    }
}
