import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import Stripe from 'stripe'

export async function POST(req: Request) {
    if (!stripe) {
        return new NextResponse('Stripe not configured', { status: 503 })
    }

    const body = await req.text()
    const headerStore = await headers()
    const signature = headerStore.get('Stripe-Signature') as string

    let event: Stripe.Event

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        )
    } catch (error: any) {
        return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 })
    }

    const session = event.data.object as Stripe.Checkout.Session

    if (event.type === 'checkout.session.completed') {
        const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
        )

        if (!session?.metadata?.userId) {
            return new NextResponse('User ID is missing from metadata', { status: 400 })
        }

        // Find or create the plan in DB
        // In production, you'd seed these plans first
        const planName = session.metadata.planName || 'Pro'
        let plan = await prisma.subscriptionPlan.findFirst({
            where: { stripePriceId: subscription.items.data[0].price.id }
        })

        if (!plan) {
            plan = await prisma.subscriptionPlan.create({
                data: {
                    name: planName,
                    stripePriceId: subscription.items.data[0].price.id,
                    amount: (subscription.items.data[0].price.unit_amount || 0) / 100,
                    interval: subscription.items.data[0].price.recurring?.interval || 'month',
                    features: []
                }
            })
        }

        await prisma.subscription.create({
            data: {
                userId: session.metadata.userId,
                planId: plan.id,
                stripeSubscriptionId: subscription.id,
                stripeCustomerId: subscription.customer as string,
                stripePriceId: subscription.items.data[0].price.id,
                status: subscription.status,
                currentPeriodStart: new Date(subscription.current_period_start * 1000),
                currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            },
        })
    }

    if (event.type === 'invoice.payment_succeeded') {
        const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
        )

        await prisma.subscription.update({
            where: {
                stripeSubscriptionId: subscription.id,
            },
            data: {
                status: subscription.status,
                currentPeriodStart: new Date(subscription.current_period_start * 1000),
                currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            },
        })

        // Record payment
        const invoice = event.data.object as Stripe.Invoice
        const user = await prisma.user.findFirst({
            where: { stripeCustomerId: invoice.customer as string }
        })

        if (user) {
            await prisma.payment.create({
                data: {
                    userId: user.id,
                    amount: (invoice.amount_paid || 0) / 100,
                    currency: invoice.currency || 'usd',
                    status: 'completed',
                    provider: 'stripe',
                    transactionId: invoice.id,
                    metadata: {
                        subscriptionId: subscription.id,
                        invoiceUrl: invoice.hosted_invoice_url
                    }
                }
            })
        }
    }

    return new NextResponse(null, { status: 200 })
}
