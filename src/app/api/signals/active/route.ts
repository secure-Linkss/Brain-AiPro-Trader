import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const session = await getServerSession();

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Fetch user
        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Fetch active signals from database
        const signals = await prisma.signal.findMany({
            where: {
                userId: user.id,
                status: 'ACTIVE'
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: 10
        });

        // Transform to frontend format
        const formattedSignals = signals.map(signal => ({
            id: signal.id,
            symbol: signal.symbol,
            type: signal.type,
            strength: signal.confidence,
            strategy: signal.strategy,
            entryPrice: signal.entryPrice,
            stopLoss: signal.stopLoss,
            takeProfit: signal.takeProfit,
            status: signal.status,
            timestamp: getRelativeTime(signal.createdAt)
        }));

        return NextResponse.json(formattedSignals);
    } catch (error) {
        console.error('Error fetching signals:', error);
        return NextResponse.json({ error: 'Failed to fetch signals' }, { status: 500 });
    }
}

function getRelativeTime(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} mins ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hours ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} days ago`;
}
