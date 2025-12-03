"use client"

import React, { useEffect, useRef, memo } from 'react';

type TopStoriesProps = {
    feedMode?: 'all_symbols' | 'market' | 'symbol';
    symbol?: string;
    theme?: 'light' | 'dark';
    locale?: string;
    height?: number | string;
};

function TopStoriesComponent({
    feedMode = "all_symbols",
    symbol = "NASDAQ:AAPL",
    theme = "dark",
    locale = "en",
    height = 500
}: TopStoriesProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        containerRef.current.innerHTML = "";

        const script = document.createElement("script");
        script.src = "https://s3.tradingview.com/external-embedding/embed-widget-timeline.js";
        script.type = "text/javascript";
        script.async = true;
        script.innerHTML = JSON.stringify({
            "feedMode": feedMode,
            "symbol": symbol,
            "colorTheme": theme,
            "isTransparent": false,
            "displayMode": "regular",
            "width": "100%",
            "height": "100%",
            "locale": locale
        });

        containerRef.current.appendChild(script);
    }, [feedMode, symbol, theme, locale]);

    return (
        <div className="tradingview-widget-container w-full" style={{ height: height }}>
            <div className="tradingview-widget-container__widget" ref={containerRef} style={{ height: "100%" }}></div>
        </div>
    );
}

export const TopStories = memo(TopStoriesComponent);
