import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// POST /api/mt4/webhook/account-update
export async function POST(req: Request) {
    try {
        const body = await req.json()
        const {
            api_key,
            account_currency,
            balance,
            equity,
            leverage,
            free_margin,
            margin_level
        } = body

        // Validate API key
        const connection = await db.mT4Connection.findUnique({
            where: { apiKey: api_key }
        })

        if (!connection) {
            return NextResponse.json({ error: 'Invalid API key' }, { status: 401 })
        }

        if (connection.status !== 'active') {
            return NextResponse.json({ error: 'Connection not active' }, { status: 403 })
        }

        // Update account metrics
        await db.mT4Connection.update({
            where: { id: connection.id },
            data: {
                accountCurrency: account_currency,
                balance: parseFloat(balance),
                equity: parseFloat(equity),
                leverage: parseInt(leverage),
                freeMargin: parseFloat(free_margin),
                marginLevel: parseFloat(margin_level),
                lastAccountUpdate: new Date()
            }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Account update error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
