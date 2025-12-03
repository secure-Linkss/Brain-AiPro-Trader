import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { searchParams } = new URL(req.url)
        const symbols = searchParams.get("symbols")?.split(",") || []

        if (symbols.length === 0) {
            return NextResponse.json({ prices: {} })
        }

        const pythonBackendUrl = process.env.PYTHON_BACKEND_URL || "http://localhost:8003"
        const prices: Record<string, number> = {}

        await Promise.all(symbols.map(async (symbol) => {
            try {
                // Fetch 1m candle to get latest close
                const res = await fetch(`${pythonBackendUrl}/market/ohlcv/${symbol}?timeframe=1m&limit=1`)
                if (res.ok) {
                    const data = await res.json()
                    if (data && data.length > 0) {
                        prices[symbol] = data[data.length - 1].close
                    }
                }
            } catch (e) {
                console.error(`Failed to fetch price for ${symbol}`, e)
            }
        }))

        return NextResponse.json({ prices })

    } catch (error) {
        console.error("Prices fetch error:", error)
        return NextResponse.json({ error: "Failed to fetch prices" }, { status: 500 })
    }
}
