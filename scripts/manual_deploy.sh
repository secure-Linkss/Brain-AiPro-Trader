#!/bin/bash
echo "🚀 Starting Guru Manual Deployment..."

# 1. Git Push (Requires valid local git configuration)
echo "📦 Pushing code to GitHub..."
git add .
git commit -m "Guru Upgrade Implementation Complete"
git push origin master
if [ $? -eq 0 ]; then
    echo "✅ Git Push Successful"
else
    echo "❌ Git Push Failed - check your git credentials/config"
fi

# 2. Railway Deployment
echo "🚂 Deploying to Railway..."
# Try using local node_modules railway if available, else global
RAILWAY_BIN="./node_modules/.bin/railway"
if [ ! -f "$RAILWAY_BIN" ]; then
    RAILWAY_BIN="railway"
fi

echo "Using Railway Binary: $RAILWAY_BIN"

# Check if token needs to be passed
if [ -n "$1" ]; then
    export RAILWAY_TOKEN=$1
    echo "🔑 Using provided Railway Token"
fi

$RAILWAY_BIN up --detach
if [ $? -eq 0 ]; then
    echo "✅ Railway Deployment Triggered"
else
    echo "❌ Railway Deployment Failed - check your Token"
fi
