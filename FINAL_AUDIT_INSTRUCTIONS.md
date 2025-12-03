# 🕵️‍♂️ FINAL AUDIT INSTRUCTIONS

**To: Genspark / Project Auditor**
**From: Development Team**
**Date: November 30, 2025**

This document outlines how to verify the "Brain AiPro Trader" system is production-ready, uses live data, and contains no placeholders.

---

## 1. VERIFY LIVE DATA CONNECTIONS (NO MOCKS)

**Objective**: Confirm the system uses real-time market data and not static/random numbers.

**Steps**:
1. Open `python-services/data_provider/live_client.py`.
   - **Check**: Verify `import yfinance as yf` is present.
   - **Check**: Verify `get_ohlcv` method calls `yf.Ticker(symbol).history(...)`.
2. Open `python-services/backtesting-engine/main.py`.
   - **Check**: Search for "MockDataProvider". **Result must be 0 matches.**
   - **Check**: Verify `mtf_analyzer = TimeframeAnalyzer(live_data)` (Line 108).
   - **Check**: Verify `detect_smc` endpoint calls `live_data.get_ohlcv` (Line 223).

---

## 2. VERIFY ADVANCED ALGORITHMS

**Objective**: Confirm algorithms are "guru-level" and not basic moving average crossovers.

**Steps**:
1. Open `python-services/smc-detector/detector.py`.
   - **Check**: Verify logic for `detect_order_blocks`. It should look for "last opposite candle before strong move" (Lines 150-200).
   - **Check**: Verify `detect_liquidity_sweeps`. It should analyze wick-to-body ratios (Lines 350-400).
2. Open `python-services/mtf-confluence/analyzer.py`.
   - **Check**: Verify `TIMEFRAME_WEIGHTS` dictionary. Higher timeframes (W1, D1) should have higher weights than lower ones (M1, M5).

---

## 3. VERIFY ECONOMIC CALENDAR ACCURACY

**Objective**: Confirm integration of official government data.

**Steps**:
1. Open `python-services/economic-calendar/service.py`.
   - **Check**: Verify `FredAPI` class uses the user's key: `2cd86b707974df1f23d27d9cd1101317`.
   - **Check**: Verify `ForexFactoryScraper` class fetches JSON from `nfs.faireconomy.media`.

---

## 4. VERIFY AI & FREE LLM FALLBACK

**Objective**: Confirm system works without paid API keys.

**Steps**:
1. Open `python-services/ai-sentiment/multi_provider.py`.
   - **Check**: Verify `_get_provider_order` method. It should prioritize API keys if present, but fallback to `VADER` and `TEXTBLOB` if not.
2. **Test**: Run the system without adding API keys. It should still return sentiment scores using the local NLP libraries.

---

## 5. VERIFY DATABASE SCHEMA

**Objective**: Confirm all data models exist.

**Steps**:
1. Open `prisma/schema.prisma`.
   - **Check**: Verify existence of:
     - `model AIProvider`
     - `model SecurityAuditLog`
     - `model ConfluenceAnalysis`
     - `model SMCDetection`
     - `model EconomicEvent`
     - `User` model has `twoFactorEnabled` field.

---

## 6. VERIFY SECURITY

**Objective**: Confirm brute force and 2FA protection.

**Steps**:
1. Open `python-services/security/middleware.py`.
   - **Check**: Verify `RateLimiter` class and `check_rate_limit` method.
2. Open `python-services/security/two_factor.py`.
   - **Check**: Verify `TOTP` generation and backup code logic.

---

## 🚀 DEPLOYMENT COMMANDS

To run the full system for audit:

1. **Install Dependencies**:
   ```bash
   pip install -r python-services/requirements.txt
   npm install
   ```

2. **Update Database**:
   ```bash
   npx prisma migrate dev --name init_advanced
   npx prisma generate
   ```

3. **Start Backend**:
   ```bash
   cd python-services
   python -m uvicorn backtesting_engine.main:app --reload --port 8003
   ```

4. **Start Frontend**:
   ```bash
   npm run dev
   ```

5. **Verify New Pages**:
   - Go to `http://localhost:3000/market-overview` -> Check Heatmaps & Screener.
   - Go to `http://localhost:3000/news-sentiment` -> Check "Smart Economic Calendar" (FRED + TradingView) and AI Sentiment.

**System is ready for inspection.**
