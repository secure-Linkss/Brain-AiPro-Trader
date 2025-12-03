"use client"

import React, { useEffect, useRef, memo } from 'react';

type TechnicalAnalysisProps = {
    symbol?: string;
    interval?: string;
    theme?: 'light' | 'dark';
    locale?: string;
    height?: number | string;
};

function TechnicalAnalysisComponent({
    symbol = "NASDAQ:AAPL",
    interval = "1m",
    theme = "dark",
    locale = "en",
    height = 450
}: TechnicalAnalysisProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        containerRef.current.innerHTML = "";

        const script = document.createElement("script");
        script.src = "https://s3.tradingview.com/external-embedding/embed-widget-technical-analysis.js";
        script.type = "text/javascript";
        script.async = true;
        script.innerHTML = JSON.stringify({
            "interval": interval,
            "width": "100%",
            "isTransparent": false,
            "height": "100%",
            "symbol": symbol,
            "showIntervalTabs": true,
            "displayMode": "single",
            "locale": locale,
            "colorTheme": theme
        });

        containerRef.current.appendChild(script);
    }, [symbol, interval, theme, locale]);

    return (
        <div className="tradingview-widget-container w-full" style={{ height: height }}>
            <div className="tradingview-widget-container__widget" ref={containerRef} style={{ height: "100%" }}></div>
        </div>
    );
}

export const TechnicalAnalysis = memo(TechnicalAnalysisComponent);
