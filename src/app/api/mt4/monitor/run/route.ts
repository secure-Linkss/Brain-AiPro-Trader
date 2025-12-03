import { NextResponse } from 'next/server'
import { runMonitor } from '@/lib/mt4/trade-monitor'

// GET /api/mt4/monitor/run
// This should be called by a cron job every 30-60 seconds
export async function GET(req: Request) {
    try {
        // Verify cron secret to prevent unauthorized access
        const authHeader = req.headers.get('authorization')
        const cronSecret = process.env.CRON_SECRET || 'your-secret-key'

        if (authHeader !== `Bearer ${cronSecret}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Run the monitor
        await runMonitor()

        return NextResponse.json({
            success: true,
            timestamp: new Date().toISOString(),
            message: 'Monitor completed successfully'
        })
    } catch (error) {
        console.error('Monitor run error:', error)
        return NextResponse.json(
            { error: 'Monitor failed', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        )
    }
}
