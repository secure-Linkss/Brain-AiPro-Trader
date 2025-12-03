import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

// GET /api/mt4/trailing/config/[connectionId]
export async function GET(
    req: Request,
    { params }: { params: { connectionId: string } }
) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const connectionId = params.connectionId

        // Verify ownership
        const connection = await db.mT4Connection.findUnique({
            where: { id: connectionId },
            include: { trailingConfig: true }
        })

        if (!connection) {
            return NextResponse.json({ error: 'Connection not found' }, { status: 404 })
        }

        if (connection.userId !== session.user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        // If no config exists, create default
        if (!connection.trailingConfig) {
            const defaultConfig = await db.trailingConfig.create({
                data: {
                    connectionId: connection.id,
                    enabled: false,
                    mode: 'hybrid'
                }
            })

            return NextResponse.json({ config: defaultConfig })
        }

        return NextResponse.json({ config: connection.trailingConfig })
    } catch (error) {
        console.error('Get trailing config error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// PATCH /api/mt4/trailing/config/[connectionId]
export async function PATCH(
    req: Request,
    { params }: { params: { connectionId: string } }
) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const connectionId = params.connectionId
        const body = await req.json()

        // Verify ownership
        const connection = await db.mT4Connection.findUnique({
            where: { id: connectionId }
        })

        if (!connection) {
            return NextResponse.json({ error: 'Connection not found' }, { status: 404 })
        }

        if (connection.userId !== session.user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        // Build update data
        const updateData: any = {}

        if (body.enabled !== undefined) updateData.enabled = body.enabled
        if (body.mode !== undefined) updateData.mode = body.mode
        if (body.atrPeriod !== undefined) updateData.atrPeriod = parseInt(body.atrPeriod)
        if (body.atrMultiplier !== undefined) updateData.atrMultiplier = parseFloat(body.atrMultiplier)
        if (body.atrSmoothing !== undefined) updateData.atrSmoothing = body.atrSmoothing
        if (body.structureSensitivity !== undefined) updateData.structureSensitivity = body.structureSensitivity
        if (body.structureMinSwingPips !== undefined) updateData.structureMinSwingPips = parseFloat(body.structureMinSwingPips)
        if (body.structureIgnoreWicks !== undefined) updateData.structureIgnoreWicks = body.structureIgnoreWicks
        if (body.breakEvenR !== undefined) updateData.breakEvenR = parseFloat(body.breakEvenR)
        if (body.breakEvenPadding !== undefined) updateData.breakEvenPadding = parseFloat(body.breakEvenPadding)
        if (body.breakEvenAutoEnable !== undefined) updateData.breakEvenAutoEnable = body.breakEvenAutoEnable
        if (body.trailRStep !== undefined) updateData.trailRStep = parseFloat(body.trailRStep)
        if (body.minTrailDistancePips !== undefined) updateData.minTrailDistancePips = parseFloat(body.minTrailDistancePips)
        if (body.maxPullbackPercent !== undefined) updateData.maxPullbackPercent = parseFloat(body.maxPullbackPercent)
        if (body.volatilityFilterEnabled !== undefined) updateData.volatilityFilterEnabled = body.volatilityFilterEnabled
        if (body.volatilityThreshold !== undefined) updateData.volatilityThreshold = parseFloat(body.volatilityThreshold)
        if (body.onlyTrailOnCandleClose !== undefined) updateData.onlyTrailOnCandleClose = body.onlyTrailOnCandleClose
        if (body.delayBetweenModsSec !== undefined) updateData.delayBetweenModsSec = parseInt(body.delayBetweenModsSec)
        if (body.ignoreNoiseUnderPips !== undefined) updateData.ignoreNoiseUnderPips = parseFloat(body.ignoreNoiseUnderPips)
        if (body.tpHitTighterTrailing !== undefined) updateData.tpHitTighterTrailing = body.tpHitTighterTrailing
        if (body.tighterTrailMultiplier !== undefined) updateData.tighterTrailMultiplier = parseFloat(body.tighterTrailMultiplier)
        if (body.sendTrailingAlerts !== undefined) updateData.sendTrailingAlerts = body.sendTrailingAlerts
        if (body.alertOnBreakEven !== undefined) updateData.alertOnBreakEven = body.alertOnBreakEven
        if (body.alertOnTrailMove !== undefined) updateData.alertOnTrailMove = body.alertOnTrailMove

        // Upsert config
        const config = await db.trailingConfig.upsert({
            where: { connectionId },
            create: {
                connectionId,
                ...updateData
            },
            update: updateData
        })

        return NextResponse.json({
            success: true,
            config
        })
    } catch (error) {
        console.error('Update trailing config error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
