import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Trigger automated backtesting cycle via Python service
        const pythonServiceUrl = process.env.PYTHON_BACKTEST_URL || 'http://localhost:8003'

        const response = await fetch(`${pythonServiceUrl}/backtest/trigger-cycle`, {
            method: 'POST'
        })

        if (!response.ok) {
            throw new Error('Failed to trigger backtesting cycle')
        }

        const result = await response.json()

        return NextResponse.json({
            status: 'triggered',
            message: 'Automated backtesting cycle started',
            details: result
        })
    } catch (error) {
        console.error('Failed to trigger cycle:', error)
        return NextResponse.json({
            error: 'Failed to trigger backtesting cycle',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 })
    }
}
