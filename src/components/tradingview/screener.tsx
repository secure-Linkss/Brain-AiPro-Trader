"use client"

import React, { useEffect, useRef, memo } from 'react';

type ScreenerProps = {
    defaultColumn?: 'overview' | 'performance' | 'oscillators' | 'moving_averages';
    defaultScreen?: 'general' | 'top_gainers' | 'top_losers' | 'most_active';
    market?: 'forex' | 'crypto' | 'america';
    theme?: 'light' | 'dark';
    locale?: string;
    height?: number | string;
};

function ScreenerComponent({
    defaultColumn = "overview",
    defaultScreen = "general",
    market = "crypto",
    theme = "dark",
    locale = "en",
    height = 600
}: ScreenerProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        containerRef.current.innerHTML = "";

        const script = document.createElement("script");
        script.src = "https://s3.tradingview.com/external-embedding/embed-widget-screener.js";
        script.type = "text/javascript";
        script.async = true;
        script.innerHTML = JSON.stringify({
            "width": "100%",
            "height": "100%",
            "defaultColumn": defaultColumn,
            "defaultScreen": defaultScreen,
            "market": market,
            "showToolbar": true,
            "colorTheme": theme,
            "locale": locale
        });

        containerRef.current.appendChild(script);
    }, [defaultColumn, defaultScreen, market, theme, locale]);

    return (
        <div className="tradingview-widget-container w-full" style={{ height: height }}>
            <div className="tradingview-widget-container__widget" ref={containerRef} style={{ height: "100%" }}></div>
        </div>
    );
}

export const Screener = memo(ScreenerComponent);
