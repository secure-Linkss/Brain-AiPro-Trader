# 🧠 Brain AiPro Trader - Institutional AI Trading Platform

**Version**: 2.0.0 (Production Ready)
**Status**: Audit Compliant (No Placeholders, Live Data)

## 🚀 Project Overview
Brain AiPro Trader is an advanced, institutional-grade trading platform powered by multi-agent AI systems. It integrates real-time market data, multi-timeframe confluence analysis, smart money concepts (SMC), and AI-driven sentiment analysis into a unified dashboard.

## 🌟 Key Features

### 1. Advanced Trading Intelligence
*   **Multi-Timeframe Confluence**: Analyzes 8 timeframes (M1-W1) simultaneously to find high-probability setups.
*   **Smart Money Concepts (SMC)**: Automatically detects Order Blocks, Fair Value Gaps (FVG), and Liquidity Sweeps using vector-optimized algorithms.
*   **AI Sentiment Analysis**: Multi-provider architecture (Gemini, OpenAI, Claude) with automatic fallback to local NLP (VADER/TextBlob) for free usage.

### 2. Real-Time Data & News
*   **Live Market Data**: Direct integration with `yfinance` for real-time OHLCV data (Stocks, Crypto, Forex). **No mock data.**
*   **Smart Economic Calendar**: Fuses official government data (FRED API) with visual schedules (TradingView) for verified high-impact alerts.
*   **Global News Feed**: Integrated real-time financial news streams.

### 3. Institutional Security
*   **2FA Authentication**: TOTP (Google Authenticator) support with backup codes.
*   **Brute Force Protection**: Rate limiting, IP banning, and intelligent threat detection.
*   **Audit Logging**: Comprehensive security logs for all sensitive actions.

### 4. Professional Visualization
*   **TradingView Integration**: Full suite of advanced widgets (Charts, Heatmaps, Screeners, Ticker Tapes).
*   **Bloomberg-Style Terminals**: Dark-mode optimized dashboards for deep analysis.

## 🛠️ Tech Stack

*   **Frontend**: Next.js 14, TypeScript, TailwindCSS, Shadcn/UI, Framer Motion.
*   **Backend**: Python FastAPI, Pandas, NumPy, Scikit-learn.
*   **Database**: PostgreSQL (via Prisma ORM).
*   **AI/ML**: Google Gemini Flash 2.5, VADER, TextBlob.

## ⚡ Quick Start

### 1. Prerequisites
*   Node.js 18+
*   Python 3.10+
*   PostgreSQL

### 2. Installation
```bash
# Install Frontend Dependencies
npm install

# Install Backend Dependencies
pip install -r python-services/requirements.txt
```

### 3. Database Setup
```bash
npx prisma migrate dev --name init_advanced
npx prisma generate
```

### 4. Running the System
**Backend (Python):**
```bash
cd python-services
python -m uvicorn backtesting_engine.main:app --reload --port 8003
```

**Frontend (Next.js):**
```bash
npm run dev
```

## 🔍 Audit Verification
Refer to `AUDIT_READINESS_REPORT.md` and `FINAL_AUDIT_INSTRUCTIONS.md` for detailed steps to verify the removal of all placeholders and the implementation of live data feeds.

---
*Built with ❤️ by the Brain AiPro Team*