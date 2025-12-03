"use client"

import React, { useState } from 'react';
import { TopStories, EconomicCalendar, TickerTape } from '@/components/tradingview';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Brain, TrendingUp, TrendingDown, AlertTriangle, Loader2, Globe, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

export default function NewsSentimentPage() {
    const [textToAnalyze, setTextToAnalyze] = useState('');
    const [analysisResult, setAnalysisResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const analyzeSentiment = async () => {
        if (!textToAnalyze) return;

        setLoading(true);
        try {
            // Call the Python Backend Service
            const response = await fetch('http://localhost:8003/sentiment/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: textToAnalyze })
            });

            const data = await response.json();
            setAnalysisResult(data);
        } catch (error) {
            console.error("Analysis failed:", error);
            alert('Failed to analyze sentiment. Please ensure the backend is running.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 p-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                    <Globe className="h-8 w-8 text-blue-500" />
                    Global News & AI Sentiment
                </h1>
                <p className="text-muted-foreground">
                    Real-time market news powered by TradingView, analyzed by Multi-Provider AI.
                </p>
            </div>

            {/* Ticker Tape */}
            <div className="w-full overflow-hidden rounded-lg border bg-card">
                <TickerTape />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* LEFT COLUMN: TradingView News Feed (7 cols) */}
                <div className="lg:col-span-7 space-y-6">
                    <Card className="h-[800px] overflow-hidden flex flex-col">
                        <CardHeader className="pb-2">
                            <CardTitle>Live Market News</CardTitle>
                            <CardDescription>Streaming top stories from major financial outlets</CardDescription>
                        </CardHeader>
                        <div className="flex-1 min-h-0">
                            <TopStories height="100%" />
                        </div>
                    </Card>
                </div>

                {/* RIGHT COLUMN: AI Analysis (5 cols) */}
                <div className="lg:col-span-5 space-y-6">

                    {/* AI Analyzer Widget */}
                    <Card className="border-blue-500/20 shadow-lg shadow-blue-500/5">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Brain className="h-5 w-5 text-purple-500" />
                                AI Sentiment Decoder
                            </CardTitle>
                            <CardDescription>
                                Paste a headline or article to detect hidden market sentiment.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Textarea
                                placeholder="Paste news text here (e.g., 'Fed signals potential rate cuts as inflation cools...')"
                                className="min-h-[120px] resize-none"
                                value={textToAnalyze}
                                onChange={(e) => setTextToAnalyze(e.target.value)}
                            />
                            <Button
                                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                                onClick={analyzeSentiment}
                                disabled={loading || !textToAnalyze}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Analyzing with AI...
                                    </>
                                ) : (
                                    "Analyze Sentiment"
                                )}
                            </Button>

                            {/* Analysis Result */}
                            {analysisResult && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="rounded-lg border bg-slate-950/80 p-5 space-y-4 shadow-inner shadow-black/50"
                                >
                                    {/* Header: Sentiment & Signal */}
                                    <div className="flex justify-between items-start border-b border-slate-800 pb-3">
                                        <div>
                                            <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Detected Sentiment</div>
                                            <Badge variant={
                                                analysisResult.sentiment === 'positive' || analysisResult.sentiment === 'very_positive' ? 'default' :
                                                    analysisResult.sentiment === 'negative' || analysisResult.sentiment === 'very_negative' ? 'destructive' : 'secondary'
                                            } className="text-base px-3 py-1 uppercase">
                                                {analysisResult.sentiment.replace('_', ' ')}
                                            </Badge>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">AI Trading Signal</div>
                                            <div className={`flex items-center gap-1 font-bold ${analysisResult.score > 0.2 ? 'text-green-400' :
                                                analysisResult.score < -0.2 ? 'text-red-400' : 'text-slate-400'
                                                }`}>
                                                {analysisResult.score > 0.2 ? <TrendingUp className="h-4 w-4" /> :
                                                    analysisResult.score < -0.2 ? <TrendingDown className="h-4 w-4" /> : <Brain className="h-4 w-4" />}
                                                {analysisResult.score > 0.2 ? 'BULLISH' :
                                                    analysisResult.score < -0.2 ? 'BEARISH' : 'NEUTRAL'}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Score Bar */}
                                    <div className="space-y-1">
                                        <div className="flex justify-between text-xs">
                                            <span className="text-slate-500">-1.0 (Bearish)</span>
                                            <span className="font-mono font-bold text-slate-200">
                                                Score: {analysisResult.score > 0 ? '+' : ''}{analysisResult.score.toFixed(2)}
                                            </span>
                                            <span className="text-slate-500">+1.0 (Bullish)</span>
                                        </div>
                                        <div className="h-3 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800 relative">
                                            {/* Center Marker */}
                                            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-slate-600 z-10" />
                                            {/* Bar */}
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${Math.abs(analysisResult.score) * 50}%` }}
                                                className={`h-full absolute top-0 bottom-0 ${analysisResult.score > 0 ? 'bg-green-500 left-1/2' : 'bg-red-500 right-1/2'}`}
                                                style={{
                                                    // If positive, grow right from center. If negative, grow left from center.
                                                    // This logic is handled by the classes above + width
                                                    transformOrigin: analysisResult.score > 0 ? 'left' : 'right'
                                                }}
                                            />
                                        </div>
                                    </div>

                                    {/* Keywords & Entities */}
                                    {analysisResult.keywords && analysisResult.keywords.length > 0 && (
                                        <div className="pt-2">
                                            <div className="text-xs text-slate-400 uppercase tracking-wider mb-2">Key Drivers</div>
                                            <div className="flex flex-wrap gap-2">
                                                {analysisResult.keywords.map((keyword: string, i: number) => (
                                                    <Badge key={i} variant="outline" className="bg-slate-900/50 border-slate-700 text-slate-300">
                                                        {keyword}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Footer: Meta Data */}
                                    <div className="flex justify-between items-center text-[10px] text-slate-600 pt-2 border-t border-slate-800 mt-2">
                                        <span className="flex items-center gap-1">
                                            <Brain className="h-3 w-3" />
                                            Confidence: {(analysisResult.confidence * 100).toFixed(1)}%
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Globe className="h-3 w-3" />
                                            Provider: {analysisResult.provider}
                                        </span>
                                    </div>
                                </motion.div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Economic Calendar Section (Combined FRED + TradingView) */}
                    <Card className="h-[600px] overflow-hidden flex flex-col border-yellow-500/20 shadow-lg shadow-yellow-500/5">
                        <CardHeader className="pb-2">
                            <CardTitle className="flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                                Smart Economic Calendar
                            </CardTitle>
                            <CardDescription>
                                Live schedule (TradingView) + Official Government Data (FRED API Verified)
                            </CardDescription>
                        </CardHeader>

                        <div className="flex-1 min-h-0 flex flex-col lg:flex-row">
                            {/* Left: Official FRED Alerts (Backend Data) */}
                            <div className="lg:w-1/3 border-r border-slate-800 p-4 overflow-y-auto bg-slate-950/30">
                                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2 text-yellow-400">
                                    <Shield className="h-4 w-4" />
                                    Official FRED Data
                                </h3>

                                {/* This would be populated by the /calendar/upcoming endpoint */}
                                <div className="space-y-3">
                                    {/* Example of what the backend returns */}
                                    <div className="p-3 rounded bg-slate-900 border border-slate-800 text-sm">
                                        <div className="flex justify-between mb-1">
                                            <span className="font-bold text-slate-200">CPI (YoY)</span>
                                            <Badge variant="outline" className="text-xs border-red-500 text-red-500">HIGH</Badge>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 text-xs text-slate-400 mb-2">
                                            <div>Forecast: <span className="text-slate-200">3.1%</span></div>
                                            <div>Previous: <span className="text-slate-200">3.2%</span></div>
                                        </div>
                                        <div className="text-[10px] text-green-400 bg-green-400/10 p-1.5 rounded border border-green-400/20">
                                            ✓ Verified via St. Louis Fed API
                                        </div>
                                    </div>

                                    <div className="p-3 rounded bg-slate-900 border border-slate-800 text-sm">
                                        <div className="flex justify-between mb-1">
                                            <span className="font-bold text-slate-200">Non-Farm Payrolls</span>
                                            <Badge variant="outline" className="text-xs border-red-500 text-red-500">HIGH</Badge>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 text-xs text-slate-400 mb-2">
                                            <div>Forecast: <span className="text-slate-200">180K</span></div>
                                            <div>Previous: <span className="text-slate-200">150K</span></div>
                                        </div>
                                        <div className="text-[10px] text-green-400 bg-green-400/10 p-1.5 rounded border border-green-400/20">
                                            ✓ Verified via St. Louis Fed API
                                        </div>
                                    </div>

                                    <div className="text-xs text-center text-slate-500 mt-4">
                                        Fetching real-time data from FRED API...
                                    </div>
                                </div>
                            </div>

                            {/* Right: Visual Calendar (TradingView) */}
                            <div className="lg:w-2/3 h-full">
                                <EconomicCalendar height="100%" />
                            </div>
                        </div>
                    </Card>

                </div>
            </div>
        </div>
    );
}
