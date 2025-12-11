import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Providers } from "@/components/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Brain AiPro Trader - Advanced Trading Analyst Platform",
  description: "AI-powered trading analysis platform with real-time signals, advanced charting, and multiple trading strategies including price action, harmonics, and Elliott wave analysis.",
  keywords: ["Trading", "AI", "Technical Analysis", "Trading Signals", "Charts", "Price Action", "Harmonics", "Elliott Wave"],
  authors: [{ name: "Brain AiPro Trader Team" }],
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    title: "Brain AiPro Trader - Advanced Trading Analyst Platform",
    description: "AI-powered trading analysis with real-time signals and advanced charting",
    url: "https://brainaiprotrader.com",
    siteName: "Brain AiPro Trader",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Brain AiPro Trader - Advanced Trading Analyst Platform",
    description: "AI-powered trading analysis with real-time signals and advanced charting",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
