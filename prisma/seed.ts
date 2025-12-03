import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Starting database seed...')

    // Create default admin user
    const hashedPassword = await bcrypt.hash('Mayflower1!!', 10)

    const admin = await prisma.user.upsert({
        where: { email: 'admin@brainai.com' },
        update: {},
        create: {
            email: 'admin@brainai.com',
            name: 'Brain Admin',
            password: hashedPassword,
            role: 'admin'
        }
    })

    console.log('✅ Created admin user:', admin.email)

    // Create subscription plans
    const plans = [
        {
            name: 'Starter',
            stripePriceId: 'price_starter_monthly',
            amount: 29,
            interval: 'month',
            features: [
                '10 Signals per day',
                'Basic Risk Calculator',
                'Email Notifications',
                'Forex Signals Only',
                'Community Support'
            ]
        },
        {
            name: 'Pro Trader',
            stripePriceId: 'price_pro_monthly',
            amount: 99,
            interval: 'month',
            features: [
                'Unlimited Signals',
                'All Markets',
                'Advanced Risk Management',
                'Telegram Alerts',
                'AI Opportunity Finder',
                '19 Advanced Strategies',
                'Pattern Detection',
                'Success Rate Tracking',
                'Priority Support'
            ]
        },
        {
            name: 'Elite',
            stripePriceId: 'price_elite_monthly',
            amount: 299,
            interval: 'month',
            features: [
                'Everything in Pro',
                'API Access',
                'Custom Strategy Builder',
                '1-on-1 Strategy Calls',
                'Portfolio Management',
                'Multi-Account Support',
                'Dedicated Account Manager'
            ]
        }
    ]

    for (const plan of plans) {
        await prisma.subscriptionPlan.upsert({
            where: { stripePriceId: plan.stripePriceId },
            update: {},
            create: plan
        })
        console.log(`✅ Created plan: ${plan.name}`)
    }

    // Create sample trading pairs
    const pairs = [
        { symbol: 'EURUSD', market: 'forex', name: 'Euro / US Dollar' },
        { symbol: 'GBPUSD', market: 'forex', name: 'British Pound / US Dollar' },
        { symbol: 'USDJPY', market: 'forex', name: 'US Dollar / Japanese Yen' },
        { symbol: 'BTCUSDT', market: 'crypto', name: 'Bitcoin / Tether' },
        { symbol: 'ETHUSDT', market: 'crypto', name: 'Ethereum / Tether' },
        { symbol: 'AAPL', market: 'stocks', name: 'Apple Inc.' },
        { symbol: 'TSLA', market: 'stocks', name: 'Tesla Inc.' },
        { symbol: 'XAUUSD', market: 'commodities', name: 'Gold / US Dollar' }
    ]

    for (const pair of pairs) {
        await prisma.tradingPair.upsert({
            where: { symbol: pair.symbol },
            update: {},
            create: pair
        })
    }

    console.log('✅ Created trading pairs')

    console.log('🎉 Database seed completed!')
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
