import { NextResponse } from 'next/server'
import { dataIngestionService } from '@/lib/services/data-ingestion'

export const maxDuration = 300 // 5 minutes timeout for cron

export async function GET(req: Request) {
    try {
        const authHeader = req.headers.get('authorization')
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            // Optional: Add simple secret protection
            // return new NextResponse('Unauthorized', { status: 401 })
        }

        // Standard pair list to track
        const symbols = [
            'BTC-USD', 'ETH-USD', 'SOL-USD', // Crypto
            'EURUSD=X', 'GBPUSD=X', 'USDJPY=X', // Forex
            'NVDA', 'TSLA', 'AAPL', 'MSFT', 'AMD' // Stocks
        ]

        await dataIngestionService.syncMarketData(symbols, '1h')

        // Also sync daily for long-term trends
        await dataIngestionService.syncMarketData(symbols, '1d')

        return NextResponse.json({ success: true, message: 'Market data synced successfully' })
    } catch (error) {
        console.error('Data Sync Cron Failed:', error)
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 })
    }
}
