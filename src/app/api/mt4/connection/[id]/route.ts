import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

// GET /api/mt4/connection/[id]
export async function GET(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const connectionId = params.id

        const connection = await db.mT4Connection.findUnique({
            where: { id: connectionId }
        })

        if (!connection) {
            return NextResponse.json({ error: 'Connection not found' }, { status: 404 })
        }

        if (connection.userId !== session.user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        // Return connection with BigInt converted to string
        return NextResponse.json({
            connection: {
                ...connection,
                accountNumber: connection.accountNumber.toString(),
                ticket: undefined // Don't expose internal ticket if any
            }
        })
    } catch (error) {
        console.error('Get connection error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// DELETE /api/mt4/connection/[id]
export async function DELETE(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const connectionId = params.id

        // Verify ownership
        const connection = await db.mT4Connection.findUnique({
            where: { id: connectionId },
            include: {
                trades: {
                    where: { status: 'open' }
                }
            }
        })

        if (!connection) {
            return NextResponse.json({ error: 'Connection not found' }, { status: 404 })
        }

        if (connection.userId !== session.user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        // Check for open trades
        if (connection.trades.length > 0) {
            return NextResponse.json({
                error: 'Cannot delete connection with open trades. Close all trades first.',
                open_trades: connection.trades.length
            }, { status: 400 })
        }

        // Revoke connection (soft delete - change status)
        await db.mT4Connection.update({
            where: { id: connectionId },
            data: {
                status: 'revoked',
                isOnline: false
            }
        })

        // Create audit log
        await db.auditLog.create({
            data: {
                userId: session.user.id,
                action: 'mt4_connection_revoked',
                resource: 'mt4_connection',
                resourceId: connectionId,
                metadata: {
                    account_number: connection.accountNumber.toString(),
                    platform: connection.platform
                }
            }
        })

        return NextResponse.json({
            success: true,
            message: 'Connection revoked successfully'
        })
    } catch (error) {
        console.error('Revoke connection error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// PATCH /api/mt4/connection/[id] - Update risk settings
export async function PATCH(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const connectionId = params.id
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

        // Update risk settings
        const updateData: any = {}

        if (body.riskPercent !== undefined) updateData.riskPercent = parseFloat(body.riskPercent)
        if (body.maxLot !== undefined) updateData.maxLot = parseFloat(body.maxLot)
        if (body.maxOpenTrades !== undefined) updateData.maxOpenTrades = parseInt(body.maxOpenTrades)
        if (body.dailyLossLimit !== undefined) updateData.dailyLossLimit = parseFloat(body.dailyLossLimit)
        if (body.allowBuy !== undefined) updateData.allowBuy = body.allowBuy
        if (body.allowSell !== undefined) updateData.allowSell = body.allowSell
        if (body.stopAfterMaxLoss !== undefined) updateData.stopAfterMaxLoss = body.stopAfterMaxLoss
        if (body.breakEvenEnabled !== undefined) updateData.breakEvenEnabled = body.breakEvenEnabled
        if (body.breakEvenTriggerR !== undefined) updateData.breakEvenTriggerR = parseFloat(body.breakEvenTriggerR)
        if (body.breakEvenPadding !== undefined) updateData.breakEvenPadding = parseFloat(body.breakEvenPadding)
        if (body.tp1Enabled !== undefined) updateData.tp1Enabled = body.tp1Enabled
        if (body.tp2Enabled !== undefined) updateData.tp2Enabled = body.tp2Enabled
        if (body.tp3Enabled !== undefined) updateData.tp3Enabled = body.tp3Enabled
        if (body.tp4Enabled !== undefined) updateData.tp4Enabled = body.tp4Enabled
        if (body.partialCloseTP1 !== undefined) updateData.partialCloseTP1 = parseFloat(body.partialCloseTP1)
        if (body.partialCloseTP2 !== undefined) updateData.partialCloseTP2 = parseFloat(body.partialCloseTP2)
        if (body.partialCloseTP3 !== undefined) updateData.partialCloseTP3 = parseFloat(body.partialCloseTP3)
        if (body.partialCloseTP4 !== undefined) updateData.partialCloseTP4 = parseFloat(body.partialCloseTP4)

        const updated = await db.mT4Connection.update({
            where: { id: connectionId },
            data: updateData
        })

        return NextResponse.json({
            success: true,
            connection: {
                id: updated.id,
                riskPercent: updated.riskPercent,
                maxLot: updated.maxLot,
                maxOpenTrades: updated.maxOpenTrades,
                dailyLossLimit: updated.dailyLossLimit,
                breakEvenEnabled: updated.breakEvenEnabled
            }
        })
    } catch (error) {
        console.error('Update connection error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
