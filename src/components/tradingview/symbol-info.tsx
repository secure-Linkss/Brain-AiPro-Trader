"use client"

import React, { useEffect, useRef, memo } from 'react';

type SymbolInfoProps = {
    symbol?: string;
    theme?: 'light' | 'dark';
    locale?: string;
    autosize?: boolean;
};

function SymbolInfoComponent({
    symbol = "NASDAQ:AAPL",
    theme = "dark",
    locale = "en",
    autosize = true
}: SymbolInfoProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        containerRef.current.innerHTML = "";

        const script = document.createElement("script");
        script.src = "https://s3.tradingview.com/external-embedding/embed-widget-symbol-info.js";
        script.type = "text/javascript";
        script.async = true;
        script.innerHTML = JSON.stringify({
            "symbol": symbol,
            "width": "100%",
            "locale": locale,
            "colorTheme": theme,
            "isTransparent": false
        });

        containerRef.current.appendChild(script);
    }, [symbol, theme, locale]);

    return (
        <div className="tradingview-widget-container w-full">
            <div className="tradingview-widget-container__widget" ref={containerRef}></div>
        </div>
    );
}

export const SymbolInfo = memo(SymbolInfoComponent);
