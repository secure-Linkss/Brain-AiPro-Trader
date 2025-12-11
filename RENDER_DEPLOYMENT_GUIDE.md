# 🚀 RENDER DEPLOYMENT GUIDE - API TOKEN METHOD

## Step 1: Get Your Render API Key

### Option A: Via Render Dashboard (Recommended)
1. Go to https://dashboard.render.com
2. Click on your profile icon (top right)
3. Select **"Account Settings"**
4. In the left sidebar, click **"API Keys"**
5. Click **"Create API Key"**
6. Give it a name: `AI Trading Platform Deployment`
7. Click **"Create"**
8. **COPY THE KEY IMMEDIATELY** (you won't see it again)

### Option B: Direct Link
Go directly to: https://dashboard.render.com/u/settings/api-keys

---

## Step 2: Install Render CLI (Optional but Recommended)

```bash
# Install Render CLI
npm install -g @render/cli

# Or with Homebrew (macOS)
brew tap render-oss/render
brew install render

# Verify installation
render --version
```

---

## Step 3: Authenticate with Your API Key

```bash
# Set your API key as environment variable
export RENDER_API_KEY="your-api-key-here"

# Or authenticate via CLI
render login
# Then paste your API key when prompted
```

---

## Step 4: Deploy Using CLI

### Method 1: Using render.yaml Blueprint
```bash
# Navigate to project directory
cd /path/to/ai-trading-platform

# Deploy using blueprint
render blueprint launch

# Or specify the file explicitly
render blueprint launch --file render.yaml
```

### Method 2: Using API Directly
```bash
# Create services via API
curl -X POST https://api.render.com/v1/blueprints \
  -H "Authorization: Bearer $RENDER_API_KEY" \
  -H "Content-Type: application/json" \
  -d @render.yaml
```

---

## Step 5: Set Environment Variables

After deployment starts, you need to add the DATABASE_URL:

```bash
# Get your service ID (from dashboard or CLI)
render services list

# Set environment variable
render env set DATABASE_URL="postgresql://neondb_owner:npg_0y9XMKzHCBsN@ep-blue-resonance-add39g5q-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require" \
  --service-id=<your-service-id>
```

---

## Alternative: Manual Deployment (If CLI Doesn't Work)

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Production-ready institutional trading platform"
git push origin main
```

### Step 2: Create Services in Render Dashboard

#### Service 1: Frontend
1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository
3. Configure:
   - **Name:** `ai-trading-frontend`
   - **Branch:** `main`
   - **Root Directory:** `.`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Environment Variables:**
     ```
     DATABASE_URL=postgresql://neondb_owner:npg_0y9XMKzHCBsN@ep-blue-resonance-add39g5q-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require
     NEXTAUTH_SECRET=your-random-secret-here
     NEXTAUTH_URL=https://your-app.onrender.com
     ```

#### Service 2: Pattern Detector API
1. Click **"New +"** → **"Web Service"**
2. Connect same repository
3. Configure:
   - **Name:** `pattern-detector-api`
   - **Branch:** `main`
   - **Root Directory:** `python-services/pattern-detector`
   - **Docker:** Enable (will use Dockerfile)
   - **Port:** `8001`

#### Service 3: Backend Gateway
1. Click **"New +"** → **"Web Service"**
2. Connect same repository
3. Configure:
   - **Name:** `backend-gateway`
   - **Branch:** `main`
   - **Root Directory:** `python-services`
   - **Docker:** Enable
   - **Port:** `8003`

---

## 📋 Pre-Deployment Checklist

- ✅ Temporary files removed (.bak, .log, dev.db)
- ✅ .env file has correct DATABASE_URL
- ✅ render.yaml is configured
- ✅ All code committed to Git
- ✅ Pushed to GitHub
- ✅ Render API key obtained

---

## 🔐 Security Best Practices

### Never Commit These Files:
```bash
# Already in .gitignore, but verify:
.env
.env.local
dev.db
*.log
*.bak
```

### Generate Secure Secrets:
```bash
# For NEXTAUTH_SECRET
openssl rand -base64 32

# For JWT_SECRET
openssl rand -base64 32
```

---

## 🧪 Post-Deployment Testing

### Test Frontend
```bash
curl https://your-app.onrender.com/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2025-12-09T...",
  "database": "connected",
  "message": "AI Trading Platform API is running"
}
```

### Test Pattern Detector
```bash
curl https://pattern-detector-api.onrender.com/health
```

### Test Signal Generation
```bash
curl -X POST https://pattern-detector-api.onrender.com/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "EURUSD",
    "timeframe": "1h"
  }'
```

---

## 🐛 Troubleshooting

### Issue: "API Key Invalid"
**Solution:** Regenerate the API key in Render dashboard and update your environment variable.

### Issue: "Blueprint Not Found"
**Solution:** Ensure render.yaml is in the project root and properly formatted.

### Issue: "Database Connection Failed"
**Solution:** Verify DATABASE_URL is set correctly in environment variables.

### Issue: "Build Failed"
**Solution:** Check Render logs:
```bash
render logs --service-id=<your-service-id>
```

---

## 📞 What to Share With Me

Once you have your Render API key, share:
1. ✅ The API key (I'll use it securely)
2. ✅ Your GitHub repository URL
3. ✅ Preferred service names (or use defaults)

I can then deploy everything for you automatically!

---

## 🎯 Quick Start Commands

```bash
# 1. Clean up (already done)
# 2. Commit changes
git add .
git commit -m "Ready for deployment"
git push origin main

# 3. Get API key from Render dashboard
# 4. Share with me, and I'll deploy!
```

---

**Estimated Deployment Time:** 5-10 minutes  
**Services:** 3 (Frontend, Pattern Detector, Gateway)  
**Database:** Neon PostgreSQL (already configured)

**Status:** 🟢 Ready to Deploy
