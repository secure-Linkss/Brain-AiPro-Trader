import { NextResponse } from 'next/server';
import { newsAgent } from '@/lib/agents/news-agent';

export async function GET() {
    try {
        const events = await newsAgent.getEconomicCalendar();
        return NextResponse.json(events);
    } catch (error) {
        console.error("Calendar API Error:", error);
        return NextResponse.json({ error: 'Failed to fetch calendar' }, { status: 500 });
    }
}
