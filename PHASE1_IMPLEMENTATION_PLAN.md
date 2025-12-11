# 🚀 Phase 1 Implementation Plan - Build Fix & Trading Pairs Update

**Date:** December 7, 2025  
**Status:** IN PROGRESS  
**Goal:** Fix all build issues + Update to 33-instrument master list + Verify all strategies

---

## ✅ COMPLETED TASKS

### 1. Fixed Duplicate Routes ✅
- Removed `src/app/copy-trading/`
- Removed `src/app/market-overview/`
- Removed `src/app/news-sentiment/`
- Removed `src/app/admin/ai-providers/page.tsx`
- Kept protected versions in `src/app/(protected)/`
- **Status:** COMPLETE

---

## 🔄 IN PROGRESS TASKS

### 2. Update Trading Pairs to 33-Instrument Master List

#### Current Pairs (8 pairs)
```typescript
// prisma/seed.ts - OLD
EURUSD, GBPUSD, USDJPY, BTCUSDT, ETHUSDT, AAPL, TSLA, XAUUSD
```

#### Target: 33 Instruments
**Forex – USD Majors (5)**
1. EUR/USD
2. GBP/USD
3. USD/JPY
4. USD/CHF
5. USD/CAD

**Forex – EUR Crosses (4)**
6. EUR/GBP
7. EUR/JPY
8. EUR/CHF
9. EUR/CAD

**Forex – GBP Crosses (3)**
10. GBP/JPY
11. GBP/CHF
12. GBP/CAD

**Forex – CHF/JPY/CAD Crosses (3)**
13. CHF/JPY
14. CAD/JPY
15. CAD/CHF

**High-Volatility Forex (1)**
16. USD/ZAR

**Commodities (2)**
17. XAU/USD (Gold)
18. XAG/USD (Silver)

**Crypto – Major + High Volatility (12)**
19. BTC/USD
20. ETH/USD
21. LTC/USD
22. SOL/USD
23. XRP/USD
24. ADA/USD
25. AVAX/USD
26. DOGE/USD
27. MATIC/USD
28. DOT/USD
29. BNB/USD
30. LINK/USD

**Indices (3)**
31. US30 (Dow Jones)
32. NAS100 (Nasdaq 100)
33. SPX500 (S&P 500)

### 3. Update Timeframes

#### Current Timeframes
```
M1, M5, M15, M30, H1, H4, D1, W1
```

#### Target Timeframes (7)
```
5m, 15m, 30m, 1hr, 4hr, 1d, 1wk
```

---

## 📋 NEXT TASKS

### 4. Verify All Strategies Implemented
- [ ] Check all 35+ strategies exist
- [ ] Verify advanced implementations (not basic)
- [ ] Test each strategy with sample data
- [ ] Document strategy capabilities

### 5. Build Verification
- [ ] Frontend build: `npm run build`
- [ ] Backend verification: Test Python services
- [ ] Database migration: Update schema if needed
- [ ] Integration test: Ensure all systems work together

### 6. Phase 2 Preparation
- [ ] Review historical data architecture
- [ ] Plan yfinance integration
- [ ] Design local cache structure
- [ ] Plan live price feed integration

---

## 🎯 Implementation Steps

### Step 1: Update Seed File with 33 Instruments
```typescript
// Update prisma/seed.ts
```

### Step 2: Update Timeframe Constants
```typescript
// Update timeframe definitions across codebase
```

### Step 3: Test Build
```bash
npm run build
```

### Step 4: Verify Python Services
```bash
cd python-services
# Test each service
```

### Step 5: Document Strategy Verification
```markdown
# Create STRATEGY_VERIFICATION.md
```

---

**Status:** Executing now...
