import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'

async function getUser(req: NextRequest) {
    const authHeader = req.headers.get('authorization')
    if (!authHeader) return null
    return await prisma.user.findFirst()
}

export async function POST(req: NextRequest) {
    try {
        const user = await getUser(req)
        if (!user || !user.stripeCustomerId) {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        const stripeSession = await stripe.billingPortal.sessions.create({
            customer: user.stripeCustomerId,
            return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings`,
        })

        return NextResponse.json({ url: stripeSession.url })
    } catch (error: any) {
        console.error('[STRIPE_PORTAL]', error)
        return new NextResponse('Internal Error', { status: 500 })
    }
}
