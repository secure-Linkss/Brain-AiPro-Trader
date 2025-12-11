import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// optimize for EA polling (lightweight)
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const symbol = searchParams.get('symbol')

        // 1. Fetch latest ACTIVE signals
        const whereClause: any = {
            status: 'ACTIVE',
            createdAt: {
                gte: new Date(Date.now() - 15 * 60 * 1000) // Only signals from last 15 mins
            }
        }

        if (symbol) {
            whereClause.symbol = symbol
        }

        const signals = await prisma.signal.findMany({
            where: whereClause,
            orderBy: { createdAt: 'desc' },
            take: 10
        })

        // 2. Format based on request type
        // MT4/MT5 struggle with JSON without libraries, so we offer a simple CSV format
        // Format: ID,SYMBOL,TYPE,ENTRY,SL,TP,CONFIDENCE (Lines separated by ;)
        const format = searchParams.get('format')

        if (format === 'csv') {
            const csv = signals.map(s =>
                `${s.id},${s.symbol},${s.type},${s.entryPrice},${s.stopLoss || 0},${s.takeProfit || 0},${s.confidence}`
            ).join(';')

            return new NextResponse(csv, {
                headers: { 'Content-Type': 'text/plain' }
            })
        }

        const formatted = signals.map(s => ({
            id: s.id,
            symbol: s.symbol,
            type: s.type, // BUY or SELL
            entry: s.entryPrice,
            sl: s.stopLoss,
            tp: s.takeProfit,
            confidence: s.confidence
        }))

        return NextResponse.json({
            count: formatted.length,
            signals: formatted
        })

    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch signals' }, { status: 500 })
    }
}
