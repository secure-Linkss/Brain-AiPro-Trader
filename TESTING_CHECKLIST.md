# Comprehensive Testing Checklist
## AI Trading Platform - Full Feature Verification

---

## Prerequisites

### 1. Start the Development Server
```bash
cd /Users/rasheedsalau/Documents/augment-projects/brain/ai-trading-platform
npx next dev -p 49235
```

**Expected Output:**
```
▲ Next.js 15.3.5
- Local:        http://localhost:49235
- Network:      http://192.168.20.246:49235

✓ Starting...
✓ Ready in 3s
```

### 2. Verify Environment Setup
- ✅ `.env.local` file created with proper configuration
- ✅ Database initialized (SQLite at `./dev.db`)
- ✅ Prisma client generated
- ✅ NextAuth configured for port 49235

---

## Phase 1: Authentication & User Management

### Test 1.1: Homepage & Landing Page
- [ ] Navigate to `http://localhost:49235`
- [ ] Verify homepage loads without CSRF errors
- [ ] Check hero section displays correctly
- [ ] Verify navigation menu is visible
- [ ] Test "Get Started" button functionality

### Test 1.2: User Registration
- [ ] Click "Sign Up" or "Get Started"
- [ ] Fill in registration form:
  - Email: `test@example.com`
  - Password: `Test123!@#`
  - Name: `Test User`
- [ ] Submit form
- [ ] Verify account creation success
- [ ] Check redirect to dashboard

### Test 1.3: User Login
- [ ] Navigate to `/login`
- [ ] Enter credentials
- [ ] Verify successful login
- [ ] Check session persistence
- [ ] Verify redirect to dashboard

### Test 1.4: User Profile
- [ ] Navigate to profile page
- [ ] Verify user information displays
- [ ] Test profile update functionality
- [ ] Check avatar/image upload (if implemented)

---

## Phase 2: Dashboard & Core Features

### Test 2.1: Main Dashboard
- [ ] Navigate to `/dashboard`
- [ ] Verify dashboard loads
- [ ] Check all widgets display:
  - [ ] Portfolio summary
  - [ ] Recent signals
  - [ ] Performance metrics
  - [ ] Quick actions
- [ ] Verify real-time data updates (if WebSocket enabled)

### Test 2.2: Trading Pairs Management
- [ ] Navigate to trading pairs section
- [ ] Add a new trading pair (e.g., `EURUSD`, `BTCUSD`)
- [ ] Verify pair appears in watchlist
- [ ] Test search/filter functionality
- [ ] Remove a trading pair
- [ ] Verify removal works

---

## Phase 3: Signal Generation & Analysis

### Test 3.1: Create New Signal
- [ ] Navigate to `/signals/new` or click "Create Signal"
- [ ] Select a trading pair (e.g., `EURUSD`)
- [ ] Choose timeframe (e.g., `H1`, `H4`, `D1`)
- [ ] Select signal type (`BUY` or `SELL`)
- [ ] Enter signal parameters:
  - [ ] Entry price
  - [ ] Stop loss
  - [ ] Take profit levels (TP1-TP4)
- [ ] Submit signal
- [ ] **Verify:**
  - [ ] Signal appears in signals list
  - [ ] Analysis data is fetched (not mocked)
  - [ ] Confluence score is calculated
  - [ ] SMC analysis is displayed

### Test 3.2: View Signal Details
- [ ] Click on a created signal
- [ ] Verify signal details page loads
- [ ] Check all information displays:
  - [ ] Entry, SL, TP levels
  - [ ] Risk/Reward ratio
  - [ ] Confluence analysis
  - [ ] SMC analysis
  - [ ] Chart visualization
- [ ] Verify chart renders correctly with:
  - [ ] Price action
  - [ ] Support/resistance levels
  - [ ] Entry/SL/TP markers

### Test 3.3: Signal List & Filtering
- [ ] Navigate to `/signals`
- [ ] Verify all signals display
- [ ] Test filters:
  - [ ] By trading pair
  - [ ] By status (active, closed, pending)
  - [ ] By timeframe
  - [ ] By date range
- [ ] Test sorting (newest, oldest, best performance)
- [ ] Verify pagination works (if many signals)

---

## Phase 4: Advanced Chart Features

### Test 4.1: Chart Rendering
- [ ] Open any signal or trading pair chart
- [ ] Verify chart loads using `lightweight-charts`
- [ ] Check candlestick data displays
- [ ] Verify timeframe selector works
- [ ] Test zoom in/out functionality
- [ ] Test pan/scroll functionality

### Test 4.2: Technical Indicators
- [ ] Add indicators to chart:
  - [ ] Moving averages (MA)
  - [ ] RSI
  - [ ] MACD
  - [ ] Bollinger Bands
- [ ] Verify indicators render correctly
- [ ] Test indicator customization (colors, periods)
- [ ] Remove indicators and verify cleanup

### Test 4.3: Drawing Tools
- [ ] Test drawing tools (if implemented):
  - [ ] Trend lines
  - [ ] Horizontal lines
  - [ ] Fibonacci retracements
  - [ ] Support/resistance zones
- [ ] Verify drawings persist
- [ ] Test delete/edit drawings

---

## Phase 5: MT4/MT5 Copy Trading

### Test 5.1: Copy Trading Dashboard
- [ ] Navigate to `/copy-trading`
- [ ] Verify dashboard loads
- [ ] Check for "Add Connection" button
- [ ] Verify empty state displays if no connections

### Test 5.2: Setup Wizard
- [ ] Click "Add Connection" or navigate to `/copy-trading/setup`
- [ ] Verify setup wizard loads
- [ ] Complete Step 1: Platform Selection
  - [ ] Select MT4 or MT5
  - [ ] Enter account number
  - [ ] Enter broker details
- [ ] Complete Step 2: Device Binding
  - [ ] Verify device fingerprint is generated
  - [ ] Enter device name
- [ ] Complete Step 3: API Key Generation
  - [ ] Verify API key is generated (format: `BRN-MT4-...`)
  - [ ] Copy API key
- [ ] Complete Step 4: EA Download
  - [ ] Download EA file
  - [ ] Verify file downloads correctly
- [ ] Verify connection is created in database

### Test 5.3: Connection Details Page
- [ ] Navigate to `/copy-trading/connections/[id]`
- [ ] Verify connection details display:
  - [ ] Account number
  - [ ] Platform (MT4/MT5)
  - [ ] Status (pending/active/offline)
  - [ ] Balance, equity, profit
  - [ ] Connection quality indicator

### Test 5.4: Trades Tab
- [ ] Click "Trades" tab
- [ ] Verify trade history table displays
- [ ] Check table columns:
  - [ ] Ticket number
  - [ ] Symbol
  - [ ] Type (BUY/SELL)
  - [ ] Lots
  - [ ] Entry price
  - [ ] Current price
  - [ ] SL/TP
  - [ ] Profit (USD and pips)
  - [ ] Status
- [ ] Verify "Refresh" button works
- [ ] Test empty state (no trades yet)

### Test 5.5: Trailing Stop Configuration
- [ ] Click "Trailing Stop" tab
- [ ] Test "Enable Trailing Stop" toggle
- [ ] When enabled, verify all settings display:
  - [ ] Mode selector (ATR, Structure, R-Multiple, Hybrid)
  - [ ] ATR Period input
  - [ ] ATR Multiplier input
  - [ ] Breakeven Trigger (R) input
  - [ ] Breakeven Padding (pips) input
  - [ ] Trail R Step input
  - [ ] Min Trail Distance (pips) input
  - [ ] Telegram Alerts toggle
- [ ] Change settings and verify they save
- [ ] Disable trailing stop and verify settings hide

### Test 5.6: Risk Settings Configuration
- [ ] Click "Risk Settings" tab
- [ ] Verify all risk settings display:
  - [ ] Risk Per Trade (%)
  - [ ] Max Lot Size
  - [ ] Max Open Trades
  - [ ] Daily Loss Limit (%)
- [ ] Test "Trading Permissions" toggles:
  - [ ] Allow Buy Trades
  - [ ] Allow Sell Trades
- [ ] Test "TP Management" section:
  - [ ] TP1 (1R) - Enable/Disable + % to close
  - [ ] TP2 (2R) - Enable/Disable + % to close
  - [ ] TP3 (3R) - Enable/Disable + % to close
  - [ ] TP4 (5R) - Enable/Disable + % to close
- [ ] Change settings and verify they save
- [ ] Verify inputs are disabled when TP is disabled

### Test 5.7: Delete Connection
- [ ] Click "Delete Connection" button
- [ ] Verify confirmation dialog appears
- [ ] Cancel deletion and verify connection remains
- [ ] Click delete again and confirm
- [ ] Verify connection is removed
- [ ] Verify redirect to dashboard

---

## Phase 6: API Endpoints Testing

### Test 6.1: Connection Management APIs
Test these endpoints using browser DevTools Network tab or Postman:

**Create Connection:**
```
POST /api/mt4/connection/create
Body: {
  "device_fingerprint": {...},
  "account_number": "12345678",
  "platform": "MT4",
  "device_name": "My PC",
  "broker_name": "Test Broker",
  "broker_server": "TestServer-Live"
}
```
- [ ] Verify 200 response
- [ ] Check API key is returned
- [ ] Verify connection is created in database

**List Connections:**
```
GET /api/mt4/connection/list
```
- [ ] Verify 200 response
- [ ] Check all connections are returned
- [ ] Verify data includes balance, equity, profit

**Get Connection Details:**
```
GET /api/mt4/connection/[id]
```
- [ ] Verify 200 response
- [ ] Check all connection fields are returned

**Update Risk Settings:**
```
PATCH /api/mt4/connection/[id]
Body: {
  "riskPercent": 2.0,
  "maxLot": 0.5,
  "maxOpenTrades": 5
}
```
- [ ] Verify 200 response
- [ ] Check settings are updated

**Delete Connection:**
```
DELETE /api/mt4/connection/[id]
```
- [ ] Verify 200 response
- [ ] Check connection status changes to "revoked"

### Test 6.2: Trailing Stop APIs

**Get Trailing Config:**
```
GET /api/mt4/trailing/config/[connectionId]
```
- [ ] Verify 200 response
- [ ] Check config is returned or created with defaults

**Update Trailing Config:**
```
PATCH /api/mt4/trailing/config/[connectionId]
Body: {
  "enabled": true,
  "mode": "hybrid",
  "atrPeriod": 14,
  "atrMultiplier": 1.5
}
```
- [ ] Verify 200 response
- [ ] Check config is updated

### Test 6.3: Trade APIs

**Get Trades:**
```
GET /api/mt4/trades/[connectionId]?status=all
```
- [ ] Verify 200 response
- [ ] Check trades array is returned
- [ ] Verify summary statistics are calculated

---

## Phase 7: Data Integrity & Live Data Verification

### Test 7.1: No Mock Data
- [ ] Open browser DevTools → Network tab
- [ ] Navigate through the application
- [ ] For each API call, verify:
  - [ ] Response data comes from database (not hardcoded)
  - [ ] No `null` or `0` values unless legitimately empty
  - [ ] Timestamps are real and recent
  - [ ] IDs are unique and valid

### Test 7.2: Database Verification
Open the SQLite database and verify:
```bash
npx prisma studio
```
- [ ] Open Prisma Studio at `http://localhost:5555`
- [ ] Check `User` table has test user
- [ ] Check `MT4Connection` table has connections
- [ ] Check `TrailingConfig` table has configs
- [ ] Check `Signal` table has signals
- [ ] Verify all relations are properly linked

### Test 7.3: Real-time Updates
- [ ] Create a signal
- [ ] Verify it appears in dashboard immediately
- [ ] Update a trailing config
- [ ] Verify changes reflect immediately
- [ ] Delete a connection
- [ ] Verify it's removed from list immediately

---

## Phase 8: Error Handling & Edge Cases

### Test 8.1: Form Validation
- [ ] Try to create signal with invalid data
- [ ] Verify error messages display
- [ ] Try to submit empty forms
- [ ] Verify required field validation works

### Test 8.2: Authentication Errors
- [ ] Try to access protected routes without login
- [ ] Verify redirect to login page
- [ ] Try invalid credentials
- [ ] Verify error message displays

### Test 8.3: API Error Handling
- [ ] Try to access non-existent connection
- [ ] Verify 404 error is handled gracefully
- [ ] Try to update with invalid data
- [ ] Verify 400 error with helpful message

### Test 8.4: Plan Limits
- [ ] Create connections up to plan limit
- [ ] Try to create one more
- [ ] Verify error message about upgrade
- [ ] Check upgrade prompt displays

---

## Phase 9: UI/UX & Responsiveness

### Test 9.1: Desktop View
- [ ] Test on full-screen desktop (1920x1080)
- [ ] Verify all elements are properly sized
- [ ] Check no horizontal scrolling
- [ ] Verify charts render at full width

### Test 9.2: Tablet View
- [ ] Resize browser to tablet size (768px)
- [ ] Verify responsive layout activates
- [ ] Check navigation menu adapts
- [ ] Verify tables are scrollable

### Test 9.3: Mobile View
- [ ] Resize browser to mobile size (375px)
- [ ] Verify mobile menu works
- [ ] Check all content is accessible
- [ ] Verify forms are usable

### Test 9.4: Dark Mode (if implemented)
- [ ] Toggle dark mode
- [ ] Verify all pages adapt
- [ ] Check chart colors adjust
- [ ] Verify readability

---

## Phase 10: Performance & Build

### Test 10.1: Development Build
- [ ] Verify dev server starts without errors
- [ ] Check hot reload works when editing files
- [ ] Verify no console errors in browser

### Test 10.2: Production Build
```bash
npm run build
```
- [ ] Verify build completes successfully
- [ ] Check for any build warnings
- [ ] Verify standalone output is created
- [ ] Test production server:
```bash
npm start
```
- [ ] Verify app runs in production mode
- [ ] Check performance is good

### Test 10.3: Lighthouse Audit
- [ ] Open Chrome DevTools → Lighthouse
- [ ] Run audit for:
  - [ ] Performance
  - [ ] Accessibility
  - [ ] Best Practices
  - [ ] SEO
- [ ] Verify scores are acceptable (>70)

---

## Phase 11: Advanced Features

### Test 11.1: Backtesting (if implemented)
- [ ] Navigate to backtesting section
- [ ] Select a strategy
- [ ] Run backtest
- [ ] Verify results display
- [ ] Check performance metrics

### Test 11.2: News Integration (if implemented)
- [ ] Navigate to news section
- [ ] Verify news articles load
- [ ] Check sentiment analysis
- [ ] Test filtering by symbol/date

### Test 11.3: Notifications
- [ ] Create a signal
- [ ] Verify notification appears (if in-app notifications)
- [ ] Check Telegram notification (if configured)
- [ ] Test notification settings

---

## Phase 12: Final Verification

### Test 12.1: Complete User Flow
Simulate a complete user journey:
1. [ ] Register new account
2. [ ] Complete onboarding (if any)
3. [ ] Add a trading pair to watchlist
4. [ ] Create a trading signal
5. [ ] Set up MT4 connection
6. [ ] Configure trailing stop
7. [ ] Configure risk settings
8. [ ] View dashboard with all data
9. [ ] Log out and log back in
10. [ ] Verify all data persists

### Test 12.2: Multi-User Testing
- [ ] Create second user account
- [ ] Verify users can't see each other's data
- [ ] Test concurrent usage
- [ ] Verify no data leakage

### Test 12.3: Browser Compatibility
Test on:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

---

## Success Criteria

✅ **All tests pass** - No critical bugs or errors
✅ **No mock data** - All data comes from database
✅ **No CSRF errors** - Authentication works correctly
✅ **Charts render** - All visualizations display properly
✅ **Forms work** - All CRUD operations function
✅ **API endpoints respond** - All backend routes work
✅ **Build succeeds** - Production build completes
✅ **Responsive design** - Works on all screen sizes
✅ **No console errors** - Clean browser console

---

## Reporting Issues

If you find any issues during testing, document them with:
1. **Test number** (e.g., Test 5.3)
2. **Steps to reproduce**
3. **Expected behavior**
4. **Actual behavior**
5. **Screenshots** (if applicable)
6. **Browser console errors** (if any)

---

## Next Steps After Testing

Once all tests pass:
1. ✅ Deploy to staging environment
2. ✅ Run tests again in staging
3. ✅ Deploy to production
4. ✅ Monitor for errors
5. ✅ Gather user feedback

---

**Happy Testing! 🚀**
