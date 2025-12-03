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

        // Fetch closed trades from database
        const trades = await prisma.trade.findMany({
            where: {
                userId: user.id,
                status: 'CLOSED'
            },
            orderBy: {
                closedAt: 'desc'
            },
            take: 100 // Last 100 trades
        });

        // Calculate return percentage for each trade
        const tradesWithReturns = trades.map(trade => {
            const returnPct = trade.exitPrice && trade.entryPrice
                ? ((trade.exitPrice - trade.entryPrice) / trade.entryPrice) * 100 * (trade.type === 'SELL' ? -1 : 1)
                : 0;

            return {
                return_pct: returnPct
            };
        });

        return NextResponse.json(tradesWithReturns);
    } catch (error) {
        console.error('Error fetching trades:', error);
        return NextResponse.json({ error: 'Failed to fetch trades' }, { status: 500 });
    }
}
