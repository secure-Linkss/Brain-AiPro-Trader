"use client"

import React, { useEffect, useRef, memo } from 'react';

type MarketOverviewProps = {
    theme?: 'light' | 'dark';
    locale?: string;
    height?: number | string;
};

function MarketOverviewComponent({
    theme = "dark",
    locale = "en",
    height = 500
}: MarketOverviewProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        containerRef.current.innerHTML = "";

        const script = document.createElement("script");
        script.src = "https://s3.tradingview.com/external-embedding/embed-widget-market-overview.js";
        script.type = "text/javascript";
        script.async = true;
        script.innerHTML = JSON.stringify({
            "colorTheme": theme,
            "dateRange": "12M",
            "showChart": true,
            "locale": locale,
            "largeChartUrl": "",
            "isTransparent": false,
            "showSymbolLogo": true,
            "showFloatingTooltip": false,
            "width": "100%",
            "height": "100%",
            "plotLineColorGrowing": "rgba(41, 98, 255, 1)",
            "plotLineColorFalling": "rgba(41, 98, 255, 1)",
            "gridLineColor": "rgba(240, 243, 250, 0)",
            "scaleFontColor": "rgba(106, 109, 120, 1)",
            "belowLineFillColorGrowing": "rgba(41, 98, 255, 0.12)",
            "belowLineFillColorFalling": "rgba(41, 98, 255, 0.12)",
            "belowLineFillColorGrowingBottom": "rgba(41, 98, 255, 0)",
            "belowLineFillColorFallingBottom": "rgba(41, 98, 255, 0)",
            "symbolActiveColor": "rgba(41, 98, 255, 0.12)",
            "tabs": [
                {
                    "title": "Indices",
                    "symbols": [
                        { "s": "FOREXCOM:SPXUSD", "d": "S&P 500" },
                        { "s": "FOREXCOM:NSXUSD", "d": "US 100" },
                        { "s": "FOREXCOM:DJI", "d": "Dow 30" },
                        { "s": "INDEX:NKY", "d": "Nikkei 225" },
                        { "s": "INDEX:DEU40", "d": "DAX Index" },
                        { "s": "FOREXCOM:UKXGBP", "d": "UK 100" }
                    ],
                    "originalTitle": "Indices"
                },
                {
                    "title": "Futures",
                    "symbols": [
                        { "s": "CME_MINI:ES1!", "d": "S&P 500" },
                        { "s": "CME:6E1!", "d": "Euro" },
                        { "s": "COMEX:GC1!", "d": "Gold" },
                        { "s": "NYMEX:CL1!", "d": "Crude Oil" },
                        { "s": "NYMEX:NG1!", "d": "Natural Gas" },
                        { "s": "CBOT:ZC1!", "d": "Corn" }
                    ],
                    "originalTitle": "Futures"
                },
                {
                    "title": "Forex",
                    "symbols": [
                        { "s": "FX:EURUSD", "d": "EUR/USD" },
                        { "s": "FX:GBPUSD", "d": "GBP/USD" },
                        { "s": "FX:USDJPY", "d": "USD/JPY" },
                        { "s": "FX:USDCHF", "d": "USD/CHF" },
                        { "s": "FX:AUDUSD", "d": "AUD/USD" },
                        { "s": "FX:USDCAD", "d": "USD/CAD" }
                    ],
                    "originalTitle": "Forex"
                },
                {
                    "title": "Crypto",
                    "symbols": [
                        { "s": "BINANCE:BTCUSDT", "d": "Bitcoin" },
                        { "s": "BINANCE:ETHUSDT", "d": "Ethereum" },
                        { "s": "BINANCE:SOLUSDT", "d": "Solana" },
                        { "s": "BINANCE:BNBUSDT", "d": "Binance Coin" },
                        { "s": "BINANCE:ADAUSDT", "d": "Cardano" },
                        { "s": "BINANCE:XRPUSDT", "d": "XRP" }
                    ],
                    "originalTitle": "Crypto"
                }
            ]
        });

        containerRef.current.appendChild(script);
    }, [theme, locale]);

    return (
        <div className="tradingview-widget-container w-full" style={{ height: height }}>
            <div className="tradingview-widget-container__widget" ref={containerRef} style={{ height: "100%" }}></div>
        </div>
    );
}

export const MarketOverview = memo(MarketOverviewComponent);
