"use client"

import React, { useEffect, useRef, memo } from 'react';

type CryptoHeatmapProps = {
    theme?: 'light' | 'dark';
    locale?: string;
    height?: number | string;
};

function CryptoHeatmapComponent({
    theme = "dark",
    locale = "en",
    height = 600
}: CryptoHeatmapProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        containerRef.current.innerHTML = "";

        const script = document.createElement("script");
        script.src = "https://s3.tradingview.com/external-embedding/embed-widget-crypto-coins-heatmap.js";
        script.type = "text/javascript";
        script.async = true;
        script.innerHTML = JSON.stringify({
            "dataSource": "Crypto",
            "blockSize": "market_cap_calc",
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
    }, [theme, locale]);

    return (
        <div className="tradingview-widget-container w-full" style={{ height: height }}>
            <div className="tradingview-widget-container__widget" ref={containerRef} style={{ height: "100%" }}></div>
        </div>
    );
}

export const CryptoHeatmap = memo(CryptoHeatmapComponent);
