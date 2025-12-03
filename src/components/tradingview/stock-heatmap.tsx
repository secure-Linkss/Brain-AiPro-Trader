"use client"

import React, { useEffect, useRef, memo } from 'react';

type StockHeatmapProps = {
    exchange?: string;
    theme?: 'light' | 'dark';
    locale?: string;
    height?: number | string;
};

function StockHeatmapComponent({
    exchange = "US",
    theme = "dark",
    locale = "en",
    height = 600
}: StockHeatmapProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        containerRef.current.innerHTML = "";

        const script = document.createElement("script");
        script.src = "https://s3.tradingview.com/external-embedding/embed-widget-stock-heatmap.js";
        script.type = "text/javascript";
        script.async = true;
        script.innerHTML = JSON.stringify({
            "exchanges": [],
            "dataSource": "SPX500",
            "grouping": "sector",
            "blockSize": "market_cap_basic",
            "blockColor": "change",
            "locale": locale,
            "symbolUrl": "",
            "colorTheme": theme,
            "hasTopBar": true,
            "isTransparent": false,
            "width": "100%",
            "height": "100%"
        });

        containerRef.current.appendChild(script);
    }, [exchange, theme, locale]);

    return (
        <div className="tradingview-widget-container w-full" style={{ height: height }}>
            <div className="tradingview-widget-container__widget" ref={containerRef} style={{ height: "100%" }}></div>
        </div>
    );
}

export const StockHeatmap = memo(StockHeatmapComponent);
