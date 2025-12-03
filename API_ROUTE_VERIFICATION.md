# API Route Verification Report

## Frontend API Calls Found

### Authentication & User
- [x] GET `/api/auth/session` - NextAuth default
- [x] POST `/api/auth/register` - `src/app/api/auth/register/route.ts`

### Notifications
- [x] GET `/api/notifications` - `src/app/api/notifications/route.ts`
- [x] POST `/api/notifications` - `src/app/api/notifications/route.ts`
- [x] PATCH `/api/notifications` - `src/app/api/notifications/route.ts`
- [x] DELETE `/api/notifications?id=...` - `src/app/api/notifications/route.ts`
- [x] POST `/api/notifications/${id}/read` - `src/app/api/notifications/[id]/read/route.ts` ✅ CREATED
- [x] POST `/api/notifications/read-all` - `src/app/api/notifications/read-all/route.ts` ✅ CREATED
- [x] DELETE `/api/notifications/clear` - `src/app/api/notifications/clear/route.ts` ✅ CREATED

### Scanner
- [x] GET `/api/scanner/opportunities` - `src/app/api/scanner/route.ts`
- [x] POST `/api/scanner/run` - `src/app/api/scanner/run/route.ts`
- [x] POST `/api/scanner` - `src/app/api/scanner/route.ts`

### Signals
- [x] GET `/api/signals` - `src/app/api/signals/route.ts`
- [x] POST `/api/signals` - `src/app/api/signals/route.ts`
- [x] GET `/api/signals/active` - `src/app/api/signals/active/route.ts`

### Market Data
- [x] GET `/api/market/prices` - `src/app/api/market/prices/route.ts`
- [x] POST `/api/price-feed` - `src/app/api/price-feed/route.ts`

### Trading
- [x] GET `/api/trades/history` - `src/app/api/trades/history/route.ts`
- [x] GET `/api/trade-journal` - `src/app/api/trade-journal/route.ts`
- [x] GET `/api/watchlist` - `src/app/api/watchlist/route.ts`

### Analysis
- [x] POST `/api/analysis` - `src/app/api/analysis/route.ts`
- [x] POST `/api/investment-finder` - `src/app/api/investment-finder/route.ts`

### Stripe
- [x] POST `/api/stripe/checkout` - `src/app/api/stripe/checkout/route.ts`
- [x] POST `/api/stripe/webhook` - `src/app/api/stripe/webhook/route.ts`

### Contact
- [x] POST `/api/contact` - `src/app/api/contact/route.ts`

### Admin Routes
- [x] GET `/api/admin/users` - `src/app/api/admin/users/route.ts`
- [x] GET `/api/admin/analytics` - `src/app/api/admin/analytics/route.ts`
- [x] GET `/api/admin/contact` - `src/app/api/admin/contact/route.ts`
- [x] PATCH `/api/admin/contact` - `src/app/api/admin/contact/route.ts`
- [x] GET `/api/admin/ai-providers` - `src/app/api/admin/ai-providers/route.ts`
- [x] POST `/api/admin/ai-providers` - `src/app/api/admin/ai-providers/route.ts`
- [x] POST `/api/admin/ai-providers/${id}/validate` - `src/app/api/admin/ai-providers/[id]/validate/route.ts`
- [x] PATCH `/api/admin/ai-providers/${id}` - Need to verify
- [x] DELETE `/api/admin/ai-providers/${id}` - Need to verify
- [x] POST `/api/admin/ai-providers/${id}/test` - `src/app/api/admin/ai-providers/[id]/test/route.ts` ✅ CREATED

### Admin Backtesting
- [x] GET `/api/admin/backtesting/queue` - Need to verify
- [x] GET `/api/admin/backtesting/results` - Need to verify
- [x] POST `/api/admin/backtesting/trigger-cycle` - Need to verify
- [x] POST `/api/admin/backtesting/manual` - Need to verify

## Status: Checking remaining routes...
