"use client"

import React, { useEffect, useRef, memo } from 'react';

type TickerTapeProps = {
    symbols?: { proName: string; title: string }[];
    theme?: 'light' | 'dark';
    displayMode?: 'adaptive' | 'regular' | 'compact';
    locale?: string;
};

function TickerTapeComponent({
    symbols = [
        { proName: "FOREXCOM:SPXUSD", title: "S&P 500" },
        { proName: "FOREXCOM:NSXUSD", title: "US 100" },
        { proName: "FX_IDC:EURUSD", title: "EUR/USD" },
        { proName: "BITSTAMP:BTCUSD", title: "Bitcoin" },
        { proName: "BITSTAMP:ETHUSD", title: "Ethereum" }
    ],
    theme = "dark",
    displayMode = "adaptive",
    locale = "en"
}: TickerTapeProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        // Clear previous
        containerRef.current.innerHTML = "";

        const script = document.createElement("script");
        script.src = "https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js";
        script.type = "text/javascript";
        script.async = true;
        script.innerHTML = JSON.stringify({
            "symbols": symbols,
            "showSymbolLogo": true,
            "colorTheme": theme,
            "isTransparent": false,
            "displayMode": displayMode,
            "locale": locale
        });

        containerRef.current.appendChild(script);
    }, [symbols, theme, displayMode, locale]);

    return (
        <div className="tradingview-widget-container w-full">
            <div className="tradingview-widget-container__widget" ref={containerRef}></div>
        </div>
    );
}

export const TickerTape = memo(TickerTapeComponent);
