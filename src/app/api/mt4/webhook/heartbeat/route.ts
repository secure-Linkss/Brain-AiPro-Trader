import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// POST /api/mt4/webhook/heartbeat
export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { api_key, account_id, platform, timestamp, ea_version, status } = body

        // Validate API key
        const connection = await db.mT4Connection.findUnique({
            where: { apiKey: api_key }
        })

        if (!connection) {
            return NextResponse.json({ error: 'Invalid API key' }, { status: 401 })
        }

        // Check if connection is active
        if (connection.status !== 'active' && connection.status !== 'pending') {
            return NextResponse.json({ error: 'Connection suspended' }, { status: 403 })
        }

        // Update connection status
        await db.mT4Connection.update({
            where: { id: connection.id },
            data: {
                lastHeartbeat: new Date(),
                isOnline: true,
                eaVersion: ea_version,
                connectionQuality: status === 'online' ? 'excellent' : 'poor',
                status: connection.status === 'pending' ? 'active' : connection.status
            }
        })

        return NextResponse.json({ success: true, message: 'Heartbeat received' })
    } catch (error) {
        console.error('Heartbeat error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
