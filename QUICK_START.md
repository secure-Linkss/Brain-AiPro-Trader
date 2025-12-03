# Quick Start Guide - AI Trading Platform

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Python 3.9+
- PostgreSQL (or SQLite for development)
- Git

### 1. Clone and Install

```bash
# Clone the repository
cd /Users/rasheedsalau/Documents/augment-projects/brain/ai-trading-platform

# Install Node dependencies
npm install
npm install --save-dev @types/node

# Install Python dependencies
pip install -r requirements.txt
```

### 2. Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev --name initial_setup

# (Optional) Seed database
npx prisma db seed
```

### 3. Environment Configuration

Create `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/trading_platform"
# Or for development:
# DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# LLM Providers
OPENAI_API_KEY="sk-..."
ANTHROPIC_API_KEY="sk-ant-..."
GOOGLE_API_KEY="..."

# Market Data
ALPHA_VANTAGE_API_KEY="..."
FINNHUB_API_KEY="..."
FMP_API_KEY="..."

# Notifications
TELEGRAM_BOT_TOKEN="..."
TELEGRAM_BOT_USERNAME="..."
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Python Services
PYTHON_SERVICE_URL="http://localhost:8001"
PYTHON_NEWS_URL="http://localhost:8002"
PYTHON_BACKTEST_URL="http://localhost:8003"

# WebSocket
NEXT_PUBLIC_WS_URL="ws://localhost:3000"
```

### 4. Start Services

Open **4 separate terminals**:

#### Terminal 1: Frontend (Next.js)
```bash
npm run dev
# Runs on http://localhost:3000
```

#### Terminal 2: Pattern Detector Service
```bash
cd python-services/pattern-detector
python main.py
# Runs on http://localhost:8001
```

#### Terminal 3: News Agent Service
```bash
cd python-services/news-agent
python main.py
# Runs on http://localhost:8002
```

#### Terminal 4: Backtesting Engine
```bash
cd python-services/backtesting-engine
python main.py
# Runs on http://localhost:8003
```

### 5. Access the Platform

- **Main App**: http://localhost:3000
- **Admin Panel**: http://localhost:3000/admin
- **API Docs**: http://localhost:3000/api

### 6. Create Admin User

```bash
# Using Prisma Studio
npx prisma studio

# Or via SQL
# UPDATE User SET role = 'admin' WHERE email = 'your-email@example.com';
```

## 📱 Key Features to Test

### User Features
1. **Sign Up/Login** - http://localhost:3000/register
2. **Dashboard** - http://localhost:3000/dashboard
3. **Scanner** - Real-time signal generation
4. **Investment Finder** - AI-powered recommendations
5. **Trade Journal** - Performance tracking
6. **Settings** - Notification preferences

### Admin Features
1. **Overview** - http://localhost:3000/admin/dashboard
2. **User Management** - http://localhost:3000/admin/users
3. **Backtesting** - http://localhost:3000/admin/backtesting
4. **Messages** - http://localhost:3000/admin/messages
5. **Analytics** - Performance metrics

## 🧪 Testing

### Manual Testing Checklist
- [ ] User registration and login
- [ ] Signal generation for different pairs
- [ ] Backtest execution (manual)
- [ ] Notification delivery (email, Telegram)
- [ ] Admin user management
- [ ] Subscription flow (Stripe test mode)
- [ ] Real-time updates (WebSocket)

### API Testing
```bash
# Test Pattern Detector
curl http://localhost:8001/

# Test News Agent
curl http://localhost:8002/

# Test Backtesting Engine
curl http://localhost:8003/

# Test Next.js API
curl http://localhost:3000/api/health
```

## 🐛 Troubleshooting

### Common Issues

**1. Module not found errors**
```bash
npm install
npm install --save-dev @types/node
```

**2. Prisma client errors**
```bash
npx prisma generate
npx prisma migrate dev
```

**3. Python service errors**
```bash
pip install -r requirements.txt
# Or for specific service:
cd python-services/pattern-detector
pip install fastapi uvicorn pandas numpy ta-lib scipy
```

**4. Database connection errors**
- Check DATABASE_URL in .env
- Ensure PostgreSQL is running
- Or use SQLite: `DATABASE_URL="file:./dev.db"`

**5. Port already in use**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 npm run dev
```

## 📊 Production Build

### Build Frontend
```bash
# Increase Node memory if needed
NODE_OPTIONS="--max-old-space-size=4096" npm run build

# Start production server
npm start
```

### Deploy Python Services
```bash
# Each service can be deployed separately
cd python-services/pattern-detector
uvicorn main:app --host 0.0.0.0 --port 8001

# Or use Docker
docker build -t pattern-detector .
docker run -p 8001:8001 pattern-detector
```

## 🔐 Security Checklist

Before production:
- [ ] Change all default secrets
- [ ] Enable HTTPS
- [ ] Configure CORS properly
- [ ] Set up rate limiting
- [ ] Enable database backups
- [ ] Configure monitoring
- [ ] Set up error tracking (Sentry)
- [ ] Review environment variables
- [ ] Enable 2FA for admin accounts
- [ ] Set up firewall rules

## 📚 Additional Resources

- **Full Documentation**: See PROJECT_STATUS.md
- **Backtesting Guide**: See BACKTESTING_IMPLEMENTATION.md
- **Feature List**: See ULTIMATE_FEATURES.md
- **Audit Report**: See FINAL_AUDIT.md

## 🆘 Support

For issues or questions:
1. Check documentation files
2. Review error logs
3. Check GitHub issues
4. Contact support

---

**Happy Trading!** 📈🚀
