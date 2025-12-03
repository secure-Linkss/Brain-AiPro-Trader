import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/mt4/poll/instructions?api_key=xxx
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const api_key = searchParams.get('api_key')

        if (!api_key) {
            return NextResponse.json({ error: 'API key required' }, { status: 400 })
        }

        // Validate API key and get connection
        const connection = await db.mT4Connection.findUnique({
            where: { apiKey: api_key },
            include: {
                user: {
                    include: {
                        subscription: {
                            include: { plan: true }
                        }
                    }
                },
                trailingConfig: true
            }
        })

        if (!connection) {
            return NextResponse.json({ error: 'Invalid API key' }, { status: 401 })
        }

        if (connection.status !== 'active') {
            return NextResponse.json({ error: 'Connection not active' }, { status: 403 })
        }

        // Get pending instructions for this connection
        const pendingInstructions = await db.tradeInstruction.findMany({
            where: {
                connectionId: connection.id,
                status: 'pending'
            },
            orderBy: {
                priority: 'desc'
            },
            take: 1 // Get highest priority instruction
        })

        if (pendingInstructions.length === 0) {
            // No pending instructions
            return NextResponse.json({ action: 'none' })
        }

        const instruction = pendingInstructions[0]

        // Mark as sent
        await db.tradeInstruction.update({
            where: { id: instruction.id },
            data: {
                status: 'sent',
                sentAt: new Date()
            }
        })

        // Build response based on action type
        const response: any = {
            action: instruction.action,
            instruction_id: instruction.id
        }

        if (instruction.action === 'open') {
            response.symbol = instruction.symbol
            response.type = instruction.type
            response.lot = instruction.lot
            response.stop_loss = instruction.stopLoss
            response.take_profit = instruction.takeProfit
            response.tp1 = instruction.tp1
            response.tp2 = instruction.tp2
            response.tp3 = instruction.tp3
            response.tp4 = instruction.tp4
        } else if (instruction.action === 'close') {
            response.ticket = instruction.ticket?.toString()
        } else if (instruction.action === 'modify') {
            response.ticket = instruction.ticket?.toString()
            response.stop_loss = instruction.stopLoss
            response.take_profit = instruction.takeProfit
        } else if (instruction.action === 'breakeven') {
            response.ticket = instruction.ticket?.toString()
            response.stop_loss = instruction.stopLoss // Breakeven price
        } else if (instruction.action === 'trail') {
            response.ticket = instruction.ticket?.toString()
            response.stop_loss = instruction.stopLoss // New trailing SL
            response.reason = 'trailing_stop'
        }

        return NextResponse.json(response)
    } catch (error) {
        console.error('Poll instructions error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
