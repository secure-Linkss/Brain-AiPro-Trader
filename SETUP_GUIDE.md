# 🚀 QUICK SETUP GUIDE

Follow these steps to get your advanced features running:

---

## 📦 1. Install Dependencies

### Frontend (Next.js)
```bash
cd /Users/rasheedsalau/Documents/augment-projects/brain/ai-trading-platform
npm install
```

###  Backend (Python)
```bash
cd /Users/rasheedsalau/Documents/augment-projects/brain/ai-trading-platform/python-services
pip install -r requirements.txt
```

---

## 🗄️ 2. Update Database Schema

### Step 1: Add Models to Prisma

Open `/prisma/schema.prisma` and add these models at the end:

```prisma
// AI Provider Management
model AIProvider {
  id               String   @id @default(cuid())
  name             String
  displayName      String
  apiKey           String
  isActive         Boolean  @default(false)
  isValidated      Boolean  @default(false)
  lastValidated    DateTime?
  requestCount     Int      @default(0)
  successCount     Int      @default(0)
  failureCount     Int      @default(0)
  successRate      Float    @default(0)
  avgResponseTime  Int      @default(0)
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
  
  @@index([name, isActive])
}
```

### Step 2: Add 2FA Fields to User Model

Find the `model User` block and add these fields:

```prisma
model User {
  // ... existing fields ...
  
  // Two-Factor Authentication
  twoFactorEnabled     Boolean   @default(false)
  twoFactorSecret      String?
  twoFactorBackupCodes String[]  @default([])
  twoFactorEnabledAt   DateTime?
  
  // ... rest of model ...
}
```

### Step 3: Run Migration

```bash
npx prisma migrate dev --name add_advanced_features
npx prisma generate
```

---

## 🧪 3. Test Advanced Features

### Test Multi-Timeframe Confluence

```python
# python-services/test_mtf.py
from mtf_confluence.analyzer import TimeframeAnalyzer, Timeframe

# Mock data provider (replace with real one)
class MockDataProvider:
    async def get_ohlcv(self, symbol, timeframe, limit):
        # Return your OHLCV data as pandas DataFrame
        pass

analyzer = TimeframeAnalyzer(MockDataProvider())
result = await analyzer.analyze_symbol("EURUSD")
print(f"Confluence Score: {result.confluence_score}")
print(f"Action: {result.recommended_action}")
```

### Test AI Sentiment

```python
# python-services/test_sentiment.py
from ai_sentiment.multi_provider import MultiAIProvider

# Add your API keys
api_keys = {
    "gemini": "YOUR_GEMINI_KEY",
    "openai": "YOUR_OPENAI_KEY",
    # ... others optional
}

provider = MultiAIProvider(api_keys)
result = await provider.analyze_sentiment("Bitcoin surged 5% today!")
print(f"Sentiment: {result.sentiment.value}")
print(f"Provider: {result.provider.value}")
```

### Test SMC Detection

```python
# python-services/test_smc.py
from smc_detector.detector import SMCDetector
import pandas as pd

detector = SMCDetector(min_ob_strength=0.5)

# Load your OHLCV data
df = pd.read_csv("your_data.csv")

order_blocks = detector.detect_order_blocks(df)
fvgs = detector.detect_fair_value_gaps(df)
liquidity_sweeps = detector.detect_liquidity_sweeps(df)

print(f"Found {len(order_blocks)} order blocks")
```

---

## 🔐 4. Test Security Features

### Test 2FA Setup

```python
from security.two_factor import TwoFactorAuth

tfa = TwoFactorAuth()
setup = tfa.setup_2fa("user@example.com")

print(f"Secret: {setup.secret}")
print(f"QR Code (base64): {setup.qr_code_base64[:50]}...")
print(f"Backup Codes: {setup.backup_codes}")

# Verify a token
current_token = tfa.generate_current_token(setup.secret)
is_valid = tfa.verify_token(setup.secret, current_token)
print(f"Token {current_token} is valid: {is_valid}")
```

### Test Brute Force Protection

Try logging in with wrong password 6 times - should get locked out for 15 minutes.

---

## 🎨 5. Test Frontend Features

### AI Provider Dashboard

1. Login as admin
2. Navigate to `/admin/ai-providers`
3. Click "Add New" tab
4. Add a Gemini API key
5. Click "Add Provider"
6. Click "Validate" - should show success
7. Click "Test" - should analyze sentiment

### Legal Pages

- Visit `/legal/privacy` - check comprehensive privacy policy
- Visit `/legal/terms` - check terms of service
- Visit `/legal/disclaimer` - check risk disclaimer

### Footer

- Scroll to bottom of homepage
- Click logo - should go to homepage
- Click all links - should work

---

## 🐛 6. Common Issues & Fixes

### Issue: Lint errors in VS Code
**Fix**: Run `npm install` to resolve TypeScript module errors

### Issue: Prisma client not found
**Fix**: Run `npx prisma generate`

### Issue: Python import errors
**Fix**: Make sure you're in the right directory and ran `pip install -r requirements.txt`

### Issue: 2FA not working
**Fix**: Install `pyotp` and `qrcode[pil]`

### Issue: Sentiment analysis failing
**Fix**: Check API keys, or let it fall back to rule-based (always works)

---

## 📊 7. Verify Everything Works

Run this checklist:

- [ ] `npm run dev` starts frontend
- [ ] Homepage shows footer
- [ ] Legal pages load
- [ ] Admin can add AI providers
- [ ] AI provider validation works
- [ ] MTF analysis runs without errors
- [ ] Sentiment analysis returns results
- [ ] SMC detection finds patterns
- [ ] 2FA setup generates QR code
- [ ] Security middleware blocks after 5 failed logins

---

## 🎯 8. Next: Build Frontend Components

Now that the backend is ready, build the frontend widgets:

1. **MTF Confluence Widget** - Show confluence score + chart
2. **Sentiment Dashboard** - Display news with sentiment scores
3. **SMC Chart Overlay** - Visual order blocks, FVGs on charts
4. **Economic Calendar** - Show upcoming events
5. **Position Sizer** - Calculate lot sizes

---

## 💡 Pro Tips

1. **Start Simple**: Test one feature at a time
2. **Check Logs**: Use `console.log()` (frontend) and `print()` (backend)
3. **Use Fallbacks**: Sentiment works without any API keys
4. **Test Security**: Try brute forcing yourself to confirm protection works
5. **Read Docs**: Check `FINAL_IMPLEMENTATION_SUMMARY.md` for full details

---

## 🆘 Need Help?

Check these files:
- `FINAL_IMPLEMENTATION_SUMMARY.md` - Complete overview
- `IMPLEMENTATION_COMPLETE_CHECKLIST.md` - Detailed checklist  
- ` PRISMA_SCHEMA_UPDATES.md` - Database schema changes
- `FINAL_STATUS_REPORT.md` - Technical details

---

## ✅ You're Ready!

Your advanced features are installed and ready to use. Time to integrate and deploy! 🚀
