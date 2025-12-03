import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// POST /api/mt4/webhook/error
export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { api_key, error_type, message, error_code, ticket, timestamp } = body

        // Validate API key
        const connection = await db.mT4Connection.findUnique({
            where: { apiKey: api_key }
        })

        if (!connection) {
            return NextResponse.json({ error: 'Invalid API key' }, { status: 401 })
        }

        // Log error
        await db.mT4Error.create({
            data: {
                connectionId: connection.id,
                errorType: error_type || 'UnknownError',
                errorCode: error_code ? parseInt(error_code) : null,
                message,
                ticket: ticket ? BigInt(ticket) : null,
                timestamp: timestamp ? new Date(timestamp) : new Date()
            }
        })

        // If critical error, update connection status
        const criticalErrors = ['ConnectionLost', 'AuthenticationFailed', 'AccountDisabled']
        if (criticalErrors.includes(error_type)) {
            await db.mT4Connection.update({
                where: { id: connection.id },
                data: {
                    isOnline: false,
                    connectionQuality: 'offline'
                }
            })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error logging error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
