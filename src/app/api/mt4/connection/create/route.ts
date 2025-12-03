import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import crypto from 'crypto'

// Plan limits for MT4 connections
const PLAN_LIMITS: Record<string, { maxAccounts: number; maxDevices: number; enabled: boolean }> = {
    starter: { maxAccounts: 0, maxDevices: 0, enabled: false },
    pro: { maxAccounts: 1, maxDevices: 1, enabled: true },
    'pro trader': { maxAccounts: 1, maxDevices: 1, enabled: true },
    elite: { maxAccounts: 5, maxDevices: 3, enabled: true },
    enterprise: { maxAccounts: 999, maxDevices: 10, enabled: true }
}

// POST /api/mt4/connection/create
export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await req.json()
        const {
            device_fingerprint,
            account_number,
            platform,
            device_name,
            broker_name,
            broker_server
        } = body

        // Get user with subscription
        const user = await db.user.findUnique({
            where: { id: session.user.id },
            include: {
                subscription: {
                    include: { plan: true }
                },
                mt4Connections: {
                    where: { status: 'active' }
                }
            }
        })

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        // Check plan limits
        const planName = user.subscription?.plan?.name?.toLowerCase() || 'starter'
        const limits = PLAN_LIMITS[planName] || PLAN_LIMITS.starter

        if (!limits.enabled) {
            return NextResponse.json({
                error: 'Copy trading not available on your plan. Upgrade to Pro or Elite.',
                upgrade_required: true
            }, { status: 403 })
        }

        const activeConnections = user.mt4Connections.length

        if (activeConnections >= limits.maxAccounts) {
            return NextResponse.json({
                error: `Maximum ${limits.maxAccounts} account(s) allowed on ${planName} plan. Upgrade to Elite for more.`,
                upgrade_required: true,
                current_limit: limits.maxAccounts
            }, { status: 403 })
        }

        // Generate device ID hash
        const deviceId = crypto
            .createHash('sha256')
            .update(JSON.stringify(device_fingerprint))
            .digest('hex')

        // Check if device already exists
        const existingDevice = await db.mT4Connection.findUnique({
            where: { deviceId }
        })

        if (existingDevice) {
            return NextResponse.json({
                error: 'This device is already connected to an account',
                existing_connection: true
            }, { status: 409 })
        }

        // Generate API key
        const randomPart = crypto.randomBytes(8).toString('hex')
        const deviceHash = deviceId.substring(0, 8)
        const apiKey = `BRN-${platform}-${session.user.id.substring(0, 8)}-${deviceHash}-${randomPart}`.toUpperCase()

        // Create connection
        const connection = await db.mT4Connection.create({
            data: {
                userId: session.user.id,
                apiKey,
                deviceId,
                deviceName: device_name || 'My Trading PC',
                accountNumber: BigInt(account_number),
                platform,
                brokerName: broker_name,
                brokerServer: broker_server,
                status: 'pending' // Will become 'active' on first heartbeat
            }
        })

        // Create audit log
        await db.auditLog.create({
            data: {
                userId: session.user.id,
                action: 'mt4_connection_created',
                resource: 'mt4_connection',
                resourceId: connection.id,
                metadata: {
                    platform,
                    account_number,
                    device_name
                }
            }
        })

        return NextResponse.json({
            success: true,
            connection: {
                id: connection.id,
                api_key: apiKey,
                device_id: deviceId,
                platform,
                status: 'pending',
                message: 'Connection created. Install EA and enter API key to activate.'
            }
        })
    } catch (error) {
        console.error('Create connection error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
