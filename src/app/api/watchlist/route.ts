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

    // Fetch watchlist from database
    const watchlistItems = await prisma.watchlist.findMany({
      where: {
        userId: user.id
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Fetch live prices from Python backend for each symbol
    const watchlistWithPrices = await Promise.all(
      watchlistItems.map(async (item) => {
        try {
          // Call Python backend to get current price
          const response = await fetch(`http://localhost:8003/market/price/${item.symbol}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
          });

          if (response.ok) {
            const priceData = await response.json();
            return {
              symbol: item.symbol,
              price: priceData.price,
              change: priceData.change_pct,
              volume: priceData.volume
            };
          }
        } catch (error) {
          console.error(`Error fetching price for ${item.symbol}:`, error);
        }

        // Fallback if price fetch fails
        return {
          symbol: item.symbol,
          price: 0,
          change: 0,
          volume: 'N/A'
        };
      })
    );

    return NextResponse.json(watchlistWithPrices);
  } catch (error) {
    console.error('Error fetching watchlist:', error);
    return NextResponse.json({ error: 'Failed to fetch watchlist' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { symbol } = await request.json();

    // Fetch user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Add to watchlist
    const watchlistItem = await prisma.watchlist.create({
      data: {
        userId: user.id,
        symbol: symbol
      }
    });

    return NextResponse.json(watchlistItem);
  } catch (error) {
    console.error('Error adding to watchlist:', error);
    return NextResponse.json({ error: 'Failed to add to watchlist' }, { status: 500 });
  }
}