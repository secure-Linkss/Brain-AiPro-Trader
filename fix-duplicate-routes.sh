#!/bin/bash

# Fix Duplicate Routes Script
# This script removes duplicate route definitions that are causing build failures

echo "🔧 Fixing duplicate route definitions..."
echo ""

# Navigate to project directory
cd "$(dirname "$0")"

echo "📁 Current directory: $(pwd)"
echo ""

# Backup before deletion (optional safety measure)
echo "📦 Creating backup..."
mkdir -p .route-backup
cp -r src/app/copy-trading .route-backup/ 2>/dev/null || true
cp -r src/app/market-overview .route-backup/ 2>/dev/null || true
cp -r src/app/news-sentiment .route-backup/ 2>/dev/null || true
cp src/app/admin/ai-providers/page.tsx .route-backup/ 2>/dev/null || true
echo "✅ Backup created in .route-backup/"
echo ""

# Remove duplicate routes
echo "🗑️  Removing duplicate routes..."

if [ -d "src/app/copy-trading" ]; then
    rm -rf src/app/copy-trading
    echo "  ✅ Removed src/app/copy-trading"
else
    echo "  ℹ️  src/app/copy-trading not found (already removed?)"
fi

if [ -d "src/app/market-overview" ]; then
    rm -rf src/app/market-overview
    echo "  ✅ Removed src/app/market-overview"
else
    echo "  ℹ️  src/app/market-overview not found (already removed?)"
fi

if [ -d "src/app/news-sentiment" ]; then
    rm -rf src/app/news-sentiment
    echo "  ✅ Removed src/app/news-sentiment"
else
    echo "  ℹ️  src/app/news-sentiment not found (already removed?)"
fi

if [ -f "src/app/admin/ai-providers/page.tsx" ]; then
    rm src/app/admin/ai-providers/page.tsx
    echo "  ✅ Removed src/app/admin/ai-providers/page.tsx"
else
    echo "  ℹ️  src/app/admin/ai-providers/page.tsx not found (already removed?)"
fi

echo ""
echo "✅ Duplicate routes removed!"
echo ""

# Verify remaining structure
echo "📋 Verifying protected routes still exist..."
if [ -f "src/app/(protected)/copy-trading/page.tsx" ]; then
    echo "  ✅ src/app/(protected)/copy-trading/page.tsx exists"
else
    echo "  ❌ WARNING: src/app/(protected)/copy-trading/page.tsx NOT FOUND!"
fi

if [ -f "src/app/(protected)/market-overview/page.tsx" ]; then
    echo "  ✅ src/app/(protected)/market-overview/page.tsx exists"
else
    echo "  ❌ WARNING: src/app/(protected)/market-overview/page.tsx NOT FOUND!"
fi

if [ -f "src/app/(protected)/news-sentiment/page.tsx" ]; then
    echo "  ✅ src/app/(protected)/news-sentiment/page.tsx exists"
else
    echo "  ❌ WARNING: src/app/(protected)/news-sentiment/page.tsx NOT FOUND!"
fi

if [ -f "src/app/(protected)/admin/ai-providers/page.tsx" ]; then
    echo "  ✅ src/app/(protected)/admin/ai-providers/page.tsx exists"
else
    echo "  ❌ WARNING: src/app/(protected)/admin/ai-providers/page.tsx NOT FOUND!"
fi

echo ""
echo "🎉 Fix complete!"
echo ""
echo "Next steps:"
echo "  1. Run: npm run build"
echo "  2. If build succeeds, commit changes:"
echo "     git add ."
echo "     git commit -m 'fix: remove duplicate route definitions'"
echo "     git push"
echo ""
echo "If you need to restore the deleted files, they are in .route-backup/"
