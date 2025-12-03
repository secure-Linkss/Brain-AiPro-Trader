/**
 * Scanner API
 * Trigger market scans and retrieve opportunities
 */

import { NextRequest, NextResponse } from 'next/server'
import { scannerService } from '@/lib/services/scanner-service'
import { prisma } from '@/lib/prisma'

async function verifyAdmin(request: NextRequest) {
    const authHeader = request.headers.get('authorization')
    if (!authHeader) return null

    const user = await prisma.user.findFirst({
        where: { role: 'admin' }
    })

    return user
}

/**
 * POST /api/scanner/run
 * Trigger a market scan
 */
export async function POST(request: NextRequest) {
    try {
        const admin = await verifyAdmin(request)
        if (!admin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { market } = body

        if (!market) {
            return NextResponse.json({ error: 'Market required' }, { status: 400 })
        }

        const result = await scannerService.runScan(market)

        // Log action
        await prisma.auditLog.create({
            data: {
                userId: admin.id,
                action: 'run_scanner',
                resource: 'scanner',
                metadata: { market, result }
            }
        })

        return NextResponse.json({ success: true, ...result })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

/**
 * GET /api/scanner/opportunities
 * Get high probability opportunities
 */
export async function GET(request: NextRequest) {
    try {
        // Public endpoint (or protected for subscribers)
        const { searchParams } = new URL(request.url)
        const minConfidence = parseInt(searchParams.get('minConfidence') || '70')

        const opportunities = await scannerService.getOpportunities(minConfidence)

        return NextResponse.json({ opportunities })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
