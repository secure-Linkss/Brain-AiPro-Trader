import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await req.json()
        const {
            strategy_name,
            parameters = {}, // Default to empty object if not provided
            asset_class,
            symbol,
            timeframe,
            start_date,
            end_date,
            initial_capital
        } = body

        // Call Python backtesting service
        const pythonServiceUrl = process.env.PYTHON_BACKTEST_URL || 'http://localhost:8003'

        const response = await fetch(`${pythonServiceUrl}/backtest/manual`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                strategy_name,
                parameters, // Pass actual parameters
                asset_class,
                symbol,
                timeframe,
                start_date,
                end_date,
                initial_capital
            })
        })

        if (!response.ok) {
            throw new Error('Backtesting service error')
        }

        const result = await response.json()

        return NextResponse.json(result)
    } catch (error) {
        console.error('Failed to run manual backtest:', error)
        return NextResponse.json({
            error: 'Failed to run backtest',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 })
    }
}
