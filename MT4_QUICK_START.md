# 🚀 MT4/MT5 COPY TRADING - QUICK START GUIDE

## For Users

### Step 1: Upgrade Your Plan
- Starter plan: ❌ No copy trading
- **Pro plan (£119/month):** ✅ 1 MT4/MT5 account
- **Elite plan (£319/month):** ✅ 5 MT4/MT5 accounts

### Step 2: Connect Your Account
1. Go to `/copy-trading`
2. Click "Add Connection"
3. Select MT4 or MT5
4. Enter your account number
5. Give it a name (e.g., "My Trading PC")
6. Click "Create Connection"
7. **Save your API key!**

### Step 3: Download & Install EA
1. Download the EA file (MT4 or MT5)
2. Open MT4/MT5 → File → Open Data Folder
3. Go to MQL4/Experts (or MQL5/Experts)
4. Copy the EA file there
5. Restart MT4/MT5

### Step 4: Configure EA
1. Drag EA onto any chart
2. In settings, paste your API key
3. Update WEBHOOK_URL to your domain
4. Enable "Allow WebRequest" in Tools → Options
5. Click OK

### Step 5: Verify Connection
- EA should show "Connected" in chart corner
- Dashboard should show account as "Online"
- Balance and equity should update

### Step 6: Configure Trailing Stops (Optional)
1. Go to connection details
2. Click "Trailing Stop" tab
3. Enable trailing stop
4. Choose mode (Hybrid recommended)
5. Adjust settings as needed
6. Save

---

## For Developers

### Database Migration
```bash
cd ai-trading-platform
npx prisma migrate dev --name mt4_copy_trading
npx prisma generate
```

### Environment Variables
```env
# .env
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
CRON_SECRET=your_secret_for_cron_jobs
```

### Setup Cron Job
```bash
# Run every 60 seconds
* * * * * curl -H "Authorization: Bearer YOUR_CRON_SECRET" https://yourdomain.com/api/mt4/monitor/run
```

### Update EA Files
In `ea/Brain_AiPro_Connector.mq4` and `.mq5`:
```mql4
input string WEBHOOK_URL = "https://yourdomain.com/api/mt4";
```

### Compile EAs
1. Open MetaEditor (F4 in MT4/MT5)
2. Open `Brain_AiPro_Connector.mq4`
3. Click Compile (F7)
4. Repeat for `.mq5`
5. Copy `.ex4` and `.ex5` to `public/ea/`

### Deploy
```bash
npm run build
npm run start
```

---

## API Endpoints Reference

### Webhooks (MT4/MT5 → Server)
- `POST /api/mt4/webhook/heartbeat` - Every 10s
- `POST /api/mt4/webhook/account-update` - Every 30s
- `POST /api/mt4/webhook/trade-update` - Every tick
- `POST /api/mt4/webhook/error` - On errors

### Polling (MT4/MT5 ← Server)
- `GET /api/mt4/poll/instructions?api_key=XXX` - Every 5s

### Management
- `POST /api/mt4/connection/create` - Create connection
- `GET /api/mt4/connection/list` - List connections
- `DELETE /api/mt4/connection/[id]` - Revoke
- `PATCH /api/mt4/connection/[id]` - Update settings

### Trailing
- `GET /api/mt4/trailing/config/[connectionId]`
- `PATCH /api/mt4/trailing/config/[connectionId]`
- `GET /api/mt4/trailing/logs/[tradeId]`

### Monitoring
- `GET /api/mt4/monitor/run` - Cron endpoint

---

## Trailing Stop Modes

### 1. ATR-Based
- Adapts to volatility
- Tightens in low volatility
- Widens in high volatility
- **Best for:** Trending markets

### 2. Market Structure
- Follows higher lows (buy)
- Follows lower highs (sell)
- Respects market context
- **Best for:** Swing trading

### 3. R-Multiple
- Trails every 0.5R, 1R, etc.
- Institutional approach
- Predictable progression
- **Best for:** Systematic trading

### 4. Hybrid (Recommended)
- Combines all 3 methods
- Uses tightest SL
- Maximum protection
- **Best for:** Most traders

---

## Troubleshooting

### EA Not Connecting
1. Check API key is correct
2. Verify WEBHOOK_URL is updated
3. Enable WebRequest in MT4/MT5 options
4. Check AutoTrading is enabled (green button)
5. Look for errors in Experts tab

### No Trades Executing
1. Verify plan allows copy trading
2. Check risk settings (not too restrictive)
3. Ensure daily loss limit not reached
4. Check max open trades not exceeded
5. Verify direction allowed (buy/sell)

### Trailing Not Working
1. Enable trailing stop in settings
2. Check mode is selected
3. Verify min trail distance not too large
4. Ensure delay between mods not too long
5. Check Telegram alerts for trail events

### Connection Shows Offline
1. Check MT4/MT5 is running
2. Verify EA is on chart
3. Check internet connection
4. Look for errors in MT4/MT5
5. Try restarting EA

---

## Best Practices

### Risk Management
- Start with 1% risk per trade
- Set daily loss limit to 5%
- Max 3 open trades initially
- Use breakeven after 1R

### Trailing Stops
- Use Hybrid mode for best results
- Set min trail distance to 10 pips
- Enable TP-hit tighter trailing
- Send Telegram alerts

### Monitoring
- Check dashboard daily
- Review trailing logs weekly
- Monitor win rate monthly
- Adjust settings based on performance

### Security
- Never share API keys
- Use strong passwords
- Enable 2FA on account
- Monitor for suspicious activity

---

## Support

### Documentation
- Full implementation: `MT4_IMPLEMENTATION_COMPLETE.md`
- Pricing strategy: `PRICING_STRATEGY_UK_GBP.md`
- Gap analysis: `COMPETITIVE_GAP_ANALYSIS.md`

### Contact
- Dashboard: `/copy-trading`
- Settings: `/copy-trading/connections/[id]`
- Support: `/contact`

---

**Ready to trade? Connect your MT4/MT5 account now!** 🚀
