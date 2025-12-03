import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// POST /api/mt4/webhook/trade-update
export async function POST(req: Request) {
    try {
        const body = await req.json()
        const {
            api_key,
            ticket,
            symbol,
            type,
            lots,
            entry_price,
            stop_loss,
            take_profit,
            profit,
            status,
            current_price
        } = body

        // Validate API key
        const connection = await db.mT4Connection.findUnique({
            where: { apiKey: api_key }
        })

        if (!connection) {
            return NextResponse.json({ error: 'Invalid API key' }, { status: 401 })
        }

        // Check if trade exists
        const existingTrade = await db.mT4Trade.findUnique({
            where: { ticket: BigInt(ticket) }
        })

        if (existingTrade) {
            // Update existing trade
            await db.mT4Trade.update({
                where: { ticket: BigInt(ticket) },
                data: {
                    currentPrice: parseFloat(current_price || entry_price),
                    stopLoss: stop_loss ? parseFloat(stop_loss) : null,
                    takeProfit: take_profit ? parseFloat(take_profit) : null,
                    profit: parseFloat(profit),
                    status: status,
                    closeTime: status === 'closed' ? new Date() : null,
                    closePrice: status === 'closed' ? parseFloat(current_price || entry_price) : null,
                    maxProfit: Math.max(existingTrade.maxProfit, parseFloat(profit)),
                    maxDrawdown: Math.min(existingTrade.maxDrawdown, parseFloat(profit))
                }
            })
        } else {
            // Create new trade
            await db.mT4Trade.create({
                data: {
                    connectionId: connection.id,
                    ticket: BigInt(ticket),
                    symbol,
                    type: type.toLowerCase(),
                    lots: parseFloat(lots),
                    entryPrice: parseFloat(entry_price),
                    currentPrice: parseFloat(current_price || entry_price),
                    stopLoss: stop_loss ? parseFloat(stop_loss) : null,
                    takeProfit: take_profit ? parseFloat(take_profit) : null,
                    profit: parseFloat(profit),
                    status: status
                }
            })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Trade update error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
