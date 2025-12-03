import { NextRequest, NextResponse } from 'next/server'
import { investmentFinderService } from '@/lib/services/investment-finder'
import { prisma } from '@/lib/prisma'

async function getUser(req: NextRequest) {
    const authHeader = req.headers.get('authorization')
    if (!authHeader) return null
    return await prisma.user.findFirst()
}

export async function POST(req: NextRequest) {
    try {
        const user = await getUser(req)
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await req.json()
        const { capital, timeHorizon, riskTolerance, preferredMarkets, goals } = body

        if (!capital || !timeHorizon || !riskTolerance) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            )
        }

        const opportunities = await investmentFinderService.findOpportunities({
            capital,
            timeHorizon,
            riskTolerance,
            preferredMarkets: preferredMarkets || ['crypto', 'forex', 'stocks'],
            goals: goals || 'capital appreciation'
        })

        // Log the request
        await prisma.auditLog.create({
            data: {
                userId: user.id,
                action: 'find_investments',
                resource: 'investment_finder',
                metadata: { capital, timeHorizon, riskTolerance, opportunitiesFound: opportunities.length }
            }
        })

        return NextResponse.json({ opportunities })
    } catch (error: any) {
        console.error('[INVESTMENT_FINDER]', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
