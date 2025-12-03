"use client"

import React, { useEffect, useRef, memo } from 'react';

type AdvancedChartProps = {
    symbol?: string;
    theme?: 'light' | 'dark';
    autosize?: boolean;
    interval?: string;
    timezone?: string;
    style?: string;
    locale?: string;
    toolbar_bg?: string;
    enable_publishing?: boolean;
    hide_side_toolbar?: boolean;
    allow_symbol_change?: boolean;
    container_id?: string;
};

function AdvancedChartComponent({
    symbol = "NASDAQ:AAPL",
    theme = "dark",
    autosize = true,
    interval = "D",
    timezone = "Etc/UTC",
    style = "1",
    locale = "en",
    toolbar_bg = "#f1f3f6",
    enable_publishing = false,
    hide_side_toolbar = false,
    allow_symbol_change = true,
    container_id = "tradingview_advanced_chart"
}: AdvancedChartProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        // Clear previous content
        containerRef.current.innerHTML = "";

        const script = document.createElement("script");
        script.src = "https://s3.tradingview.com/tv.js";
        script.type = "text/javascript";
        script.async = true;
        script.onload = () => {
            if (window.TradingView) {
                new window.TradingView.widget({
                    "width": "100%",
                    "height": "100%",
                    "symbol": symbol,
                    "interval": interval,
                    "timezone": timezone,
                    "theme": theme,
                    "style": style,
                    "locale": locale,
                    "toolbar_bg": toolbar_bg,
                    "enable_publishing": enable_publishing,
                    "hide_side_toolbar": hide_side_toolbar,
                    "allow_symbol_change": allow_symbol_change,
                    "container_id": container_id
                });
            }
        };
        containerRef.current.appendChild(script);
    }, [symbol, theme, interval, timezone, style, locale, toolbar_bg, enable_publishing, hide_side_toolbar, allow_symbol_change, container_id]);

    return (
        <div className="tradingview-widget-container w-full h-full" style={{ height: "100%", minHeight: "500px" }}>
            <div id={container_id} ref={containerRef} className="h-full w-full" />
        </div>
    );
}

export const AdvancedChart = memo(AdvancedChartComponent);

// Add type definition for window.TradingView
declare global {
    interface Window {
        TradingView: any;
    }
}
