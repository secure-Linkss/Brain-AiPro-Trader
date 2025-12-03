import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/admin/settings - Fetch system settings
export async function GET() {
    try {
        const session = await getServerSession(authOptions)

        if (!session || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Get or create system settings
        let settings = await prisma.systemSettings.findFirst()

        if (!settings) {
            // Create default settings if none exist
            settings = await prisma.systemSettings.create({
                data: {
                    minSignalConfidence: 75,
                    maxSignalConfidence: 95,
                    backtestConfidenceMin: 75,
                    backtestConfidenceMax: 95,
                    apiRateLimitPerMinute: 100,
                    apiRateLimitPerHour: 1000,
                    priceCacheTTL: 5,
                    signalCacheTTL: 30,
                    userSessionTTL: 1800,
                    wsMaxConnections: 5000,
                    wsHeartbeatInterval: 30,
                    enableRedisCache: true,
                    enableCDN: false,
                    enableLoadBalancing: false,
                    enableVolumeProfile: false,
                    enableOrderFlow: false,
                    enableAdvancedRisk: false,
                }
            })
        }

        return NextResponse.json({ success: true, settings })
    } catch (error) {
        console.error('Error fetching settings:', error)
        return NextResponse.json(
            { error: 'Failed to fetch settings' },
            { status: 500 }
        )
    }
}

// PUT /api/admin/settings - Update system settings
export async function PUT(request: Request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()

        // Validate confidence ranges
        if (body.minSignalConfidence !== undefined) {
            if (body.minSignalConfidence < 50 || body.minSignalConfidence > 95) {
                return NextResponse.json(
                    { error: 'Minimum signal confidence must be between 50% and 95%' },
                    { status: 400 }
                )
            }
        }

        if (body.maxSignalConfidence !== undefined) {
            if (body.maxSignalConfidence < 75 || body.maxSignalConfidence > 100) {
                return NextResponse.json(
                    { error: 'Maximum signal confidence must be between 75% and 100%' },
                    { status: 400 }
                )
            }
        }

        // Ensure min < max
        const minConf = body.minSignalConfidence || 75
        const maxConf = body.maxSignalConfidence || 95

        if (minConf >= maxConf) {
            return NextResponse.json(
                { error: 'Minimum confidence must be less than maximum confidence' },
                { status: 400 }
            )
        }

        // Get existing settings
        let settings = await prisma.systemSettings.findFirst()

        if (!settings) {
            // Create if doesn't exist
            settings = await prisma.systemSettings.create({
                data: {
                    ...body,
                    updatedBy: session.user.id
                }
            })
        } else {
            // Update existing
            settings = await prisma.systemSettings.update({
                where: { id: settings.id },
                data: {
                    ...body,
                    updatedBy: session.user.id
                }
            })
        }

        return NextResponse.json({ success: true, settings })
    } catch (error) {
        console.error('Error updating settings:', error)
        return NextResponse.json(
            { error: 'Failed to update settings' },
            { status: 500 }
        )
    }
}
