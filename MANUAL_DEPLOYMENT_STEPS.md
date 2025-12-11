# 🚀 MANUAL DEPLOYMENT INSTRUCTIONS

## ⚠️ Important: Git Configuration Required

Since Git command-line tools aren't configured on your system, you'll need to push the code to GitHub manually. Here's how:

---

## Step 1: Push Code to GitHub

### Option A: Using GitHub Desktop (Easiest)
1. Download GitHub Desktop: https://desktop.github.com
2. Open GitHub Desktop
3. Click "Add" → "Add Existing Repository"
4. Select: `/Users/rasheedsalau/Documents/augment-projects/brain/ai-trading-platform`
5. Click "Publish repository" or "Push origin"

### Option B: Fix Git Command Line
```bash
# Install Xcode Command Line Tools
xcode-select --install

# Then commit and push
cd /Users/rasheedsalau/Documents/augment-projects/brain/ai-trading-platform
git add .
git commit -m "Institutional-grade trading platform ready for deployment"
git push origin main
```

### Option C: Use VS Code
1. Open the project in VS Code
2. Click the Source Control icon (left sidebar)
3. Stage all changes (+ icon)
4. Enter commit message: "Ready for deployment"
5. Click ✓ Commit
6. Click "Sync Changes" or "Push"

---

## Step 2: Deploy to Render (Using Dashboard)

Once code is on GitHub, follow these steps:

### Service 1: Frontend

1. Go to https://dashboard.render.com
2. Click **"New +"** → **"Web Service"**
3. Click **"Connect GitHub"** (if not already connected)
4. Select your repository: `ai-trading-platform`
5. Configure:

```
Name: ai-trading-frontend
Branch: main
Root Directory: (leave empty)
Runtime: Node
Build Command: npm install && npm run build
Start Command: npm start
Plan: Starter ($7/month) or Free

Environment Variables:
DATABASE_URL=postgresql://neondb_owner:npg_0y9XMKzHCBsN@ep-blue-resonance-add39g5q-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require
NODE_ENV=production
NEXTAUTH_SECRET=guru-trading-platform-secret-key-2025-change-this
NEXTAUTH_URL=https://ai-trading-frontend.onrender.com
```

6. Click **"Create Web Service"**

---

### Service 2: Pattern Detector API

1. Click **"New +"** → **"Web Service"**
2. Select same repository
3. Configure:

```
Name: pattern-detector-api
Branch: main
Root Directory: python-services/pattern-detector
Runtime: Docker
Dockerfile Path: Dockerfile
Plan: Starter

Environment Variables:
PORT=8001
PYTHONUNBUFFERED=1
```

4. Click **"Create Web Service"**

---

### Service 3: Backend Gateway

1. Click **"New +"** → **"Web Service"**
2. Select same repository
3. Configure:

```
Name: backend-gateway
Branch: main
Root Directory: python-services
Runtime: Docker
Dockerfile Path: Dockerfile
Plan: Starter

Environment Variables:
PORT=8003
PYTHONUNBUFFERED=1
DATABASE_URL=postgresql://neondb_owner:npg_0y9XMKzHCBsN@ep-blue-resonance-add39g5q-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require
```

4. Click **"Create Web Service"**

---

## Step 3: Update Frontend Environment Variables

Once all services are deployed, update the frontend environment variables:

1. Go to frontend service settings
2. Add these additional variables:

```
NEXT_PUBLIC_API_URL=https://pattern-detector-api.onrender.com
PYTHON_PATTERN_DETECTOR_URL=https://pattern-detector-api.onrender.com
PYTHON_BACKEND_URL=https://backend-gateway.onrender.com
```

3. Click "Save Changes"
4. Service will auto-redeploy

---

## Step 4: Verify Deployment

### Test Frontend
```bash
curl https://ai-trading-frontend.onrender.com/api/health
```

Expected:
```json
{
  "status": "healthy",
  "database": "connected"
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
  -d '{"symbol": "EURUSD", "timeframe": "1h"}'
```

---

## 🎯 Alternative: Use Render CLI

If you prefer command line:

```bash
# Install Render CLI
npm install -g @render/cli

# Login with your API key
export RENDER_API_KEY="rnd_WgLO2dxlcsCsm4ynn2VzUBALDKXD"

# Deploy using blueprint (once code is on GitHub)
render blueprint launch
```

---

## 📊 Expected Deployment Timeline

- **Code Push to GitHub:** 2 minutes
- **Frontend Build:** 3-5 minutes
- **Pattern Detector Build:** 5-7 minutes
- **Backend Gateway Build:** 3-5 minutes
- **Total:** ~15-20 minutes

---

## 🐛 Troubleshooting

### "Repository not found"
- Make sure code is pushed to GitHub
- Verify repository is public or Render has access

### "Build failed"
- Check build logs in Render dashboard
- Verify Dockerfile paths are correct

### "Database connection failed"
- Verify DATABASE_URL is set correctly
- Check Neon database is accessible

---

## ✅ What You'll Have After Deployment

1. **Live Frontend:** https://ai-trading-frontend.onrender.com
2. **Pattern Detector API:** https://pattern-detector-api.onrender.com
3. **Backend Gateway:** https://backend-gateway.onrender.com

All with:
- ✅ Institutional-grade trading logic
- ✅ Pending/Active signal states
- ✅ News/Economic calendar blocking
- ✅ Volume validation
- ✅ Kelly Criterion position sizing
- ✅ Correlation limits
- ✅ Circuit breakers

---

## 📞 Need Help?

If you encounter any issues:
1. Check Render dashboard logs
2. Verify all environment variables are set
3. Ensure GitHub repository is accessible
4. Check that all Dockerfiles are in correct locations

---

**Status:** 🟡 Waiting for GitHub Push  
**Next Step:** Push code to GitHub, then deploy via Render dashboard

**Your API Key is Active:** ✅  
**Services Ready to Deploy:** ✅  
**Configuration Complete:** ✅
