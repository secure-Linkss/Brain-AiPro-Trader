"use client"

import React, { useEffect, useRef, memo } from 'react';

type EconomicCalendarProps = {
    theme?: 'light' | 'dark';
    locale?: string;
    height?: number | string;
    importance?: string[]; // ["-1", "0", "1"]
};

function EconomicCalendarComponent({
    theme = "dark",
    locale = "en",
    height = 600,
    importance = ["0", "1"] // Medium and High importance by default
}: EconomicCalendarProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        containerRef.current.innerHTML = "";

        const script = document.createElement("script");
        script.src = "https://s3.tradingview.com/external-embedding/embed-widget-events.js";
        script.type = "text/javascript";
        script.async = true;
        script.innerHTML = JSON.stringify({
            "colorTheme": theme,
            "isTransparent": false,
            "width": "100%",
            "height": "100%",
            "locale": locale,
            "importanceFilter": importance,
            "currencyFilter": "USD,EUR,GBP,JPY,AUD,CAD,CHF,CNY"
        });

        containerRef.current.appendChild(script);
    }, [theme, locale, importance]);

    return (
        <div className="tradingview-widget-container w-full" style={{ height: height }}>
            <div className="tradingview-widget-container__widget" ref={containerRef} style={{ height: "100%" }}></div>
        </div>
    );
}

export const EconomicCalendar = memo(EconomicCalendarComponent);
