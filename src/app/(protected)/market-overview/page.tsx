import {
    TickerTape,
    MarketOverview,
    CryptoHeatmap,
    StockHeatmap,
    TopStories,
    Screener
} from '@/components/tradingview';

export default function MarketOverviewPage() {
    return (
        <div className="space-y-6 p-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Market Overview</h1>
                <p className="text-muted-foreground">
                    Global market data, heatmaps, and real-time news.
                </p>
            </div>

            {/* Ticker Tape at the top */}
            <div className="w-full overflow-hidden rounded-lg border bg-card">
                <TickerTape />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Market Overview Sidebar */}
                <div className="lg:col-span-1 h-[600px] rounded-lg border bg-card overflow-hidden">
                    <MarketOverview height="100%" />
                </div>

                {/* Main Heatmap Area */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="h-[600px] rounded-lg border bg-card overflow-hidden">
                        <h2 className="p-4 text-lg font-semibold border-b">Crypto Market Heatmap</h2>
                        <CryptoHeatmap height="100%" />
                    </div>
                </div>
            </div>

            {/* Stock Heatmap */}
            <div className="h-[600px] rounded-lg border bg-card overflow-hidden">
                <h2 className="p-4 text-lg font-semibold border-b">Stock Market Heatmap (S&P 500)</h2>
                <StockHeatmap height="100%" />
            </div>

            {/* Screener and News */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="h-[600px] rounded-lg border bg-card overflow-hidden">
                    <h2 className="p-4 text-lg font-semibold border-b">Market Screener</h2>
                    <Screener height="100%" />
                </div>
                <div className="h-[600px] rounded-lg border bg-card overflow-hidden">
                    <h2 className="p-4 text-lg font-semibold border-b">Top Stories</h2>
                    <TopStories height="100%" />
                </div>
            </div>
        </div>
    );
}
