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

        // Get strategy queue from Python service
        const pythonServiceUrl = process.env.PYTHON_BACKTEST_URL || 'http://localhost:8003'

        const response = await fetch(`${pythonServiceUrl}/strategies/queue`)

        if (!response.ok) {
            // Fallback to empty queue if service is down
            console.warn('Python service unreachable for queue')
            return NextResponse.json({ queue: [] })
        }

        const queue = await response.json()
        return NextResponse.json({ queue })
    } catch (error) {
        console.error('Failed to fetch backtest queue:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
