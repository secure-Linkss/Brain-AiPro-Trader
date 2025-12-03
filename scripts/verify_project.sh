#!/bin/bash

echo "🔍 BRAIN AIPRO TRADER - FINAL VERIFICATION"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PASS=0
FAIL=0

# Function to check status
check_status() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ PASS${NC}"
        ((PASS++))
    else
        echo -e "${RED}✗ FAIL${NC}"
        ((FAIL++))
    fi
}

echo "1️⃣  Checking Python Backend..."
echo "------------------------------"

# Check Python version
echo -n "Python 3.10+: "
python3 --version | grep -q "Python 3.1" && check_status || check_status

# Check Python syntax
echo -n "Python syntax validation: "
python3 scripts/audit_python.py > /dev/null 2>&1 && check_status || check_status

# Check Python dependencies
echo -n "Python dependencies: "
pip3 list | grep -q "fastapi" && pip3 list | grep -q "pandas" && check_status || check_status

echo ""
echo "2️⃣  Checking Frontend..."
echo "----------------------"

# Check Node version
echo -n "Node.js 18+: "
node --version | grep -q "v1[89]" && check_status || check_status

# Check package.json exists
echo -n "package.json exists: "
[ -f "package.json" ] && check_status || check_status

# Check if node_modules exists (dependencies installed)
echo -n "Dependencies installed: "
[ -d "node_modules" ] && check_status || check_status

echo ""
echo "3️⃣  Checking Database..."
echo "----------------------"

# Check Prisma schema
echo -n "Prisma schema exists: "
[ -f "prisma/schema.prisma" ] && check_status || check_status

# Count models
echo -n "Database models (34): "
MODEL_COUNT=$(grep "^model " prisma/schema.prisma | wc -l)
[ "$MODEL_COUNT" -eq 34 ] && check_status || check_status

echo ""
echo "4️⃣  Checking Services..."
echo "----------------------"

# Check all Python services exist
echo -n "MTF Confluence service: "
[ -f "python-services/mtf-confluence/analyzer.py" ] && check_status || check_status

echo -n "AI Sentiment service: "
[ -f "python-services/ai-sentiment/multi_provider.py" ] && check_status || check_status

echo -n "SMC Detector service: "
[ -f "python-services/smc-detector/detector.py" ] && check_status || check_status

echo -n "Economic Calendar service: "
[ -f "python-services/economic-calendar/service.py" ] && check_status || check_status

echo -n "Risk Management service: "
[ -f "python-services/risk_management/analytics.py" ] && check_status || check_status

echo -n "Security service: "
[ -f "python-services/security/middleware.py" ] && check_status || check_status

echo -n "Live Data Provider: "
[ -f "python-services/data_provider/live_client.py" ] && check_status || check_status

echo ""
echo "5️⃣  Checking Frontend Pages..."
echo "----------------------------"

# Check protected pages
echo -n "Market Overview page: "
[ -f "src/app/(protected)/market-overview/page.tsx" ] && check_status || check_status

echo -n "News & Sentiment page: "
[ -f "src/app/(protected)/news-sentiment/page.tsx" ] && check_status || check_status

echo -n "Risk Management page: "
[ -f "src/app/(protected)/risk-management/page.tsx" ] && check_status || check_status

echo -n "Admin panel: "
[ -f "src/app/(protected)/admin/ai-providers/page.tsx" ] && check_status || check_status

echo ""
echo "6️⃣  Checking TradingView Widgets..."
echo "----------------------------------"

WIDGET_COUNT=$(ls src/components/tradingview/*.tsx 2>/dev/null | wc -l)
echo -n "TradingView components (10): "
[ "$WIDGET_COUNT" -eq 10 ] && check_status || check_status

echo ""
echo "7️⃣  Checking Documentation..."
echo "----------------------------"

echo -n "README.md: "
[ -f "README.md" ] && check_status || check_status

echo -n "FINAL_AUDIT_REPORT.md: "
[ -f "FINAL_AUDIT_REPORT.md" ] && check_status || check_status

echo -n "DEPLOYMENT_GUIDE.md: "
[ -f "DEPLOYMENT_GUIDE.md" ] && check_status || check_status

echo -n "PROJECT_COMPLETION_SUMMARY.md: "
[ -f "PROJECT_COMPLETION_SUMMARY.md" ] && check_status || check_status

echo ""
echo "8️⃣  Checking Configuration Files..."
echo "----------------------------------"

echo -n "Python requirements.txt: "
[ -f "python-services/requirements.txt" ] && check_status || check_status

echo -n "Next.js config: "
[ -f "next.config.js" ] || [ -f "next.config.mjs" ] && check_status || check_status

echo -n "TypeScript config: "
[ -f "tsconfig.json" ] && check_status || check_status

echo ""
echo "=========================================="
echo "📊 VERIFICATION SUMMARY"
echo "=========================================="
echo -e "Passed: ${GREEN}$PASS${NC}"
echo -e "Failed: ${RED}$FAIL${NC}"
echo ""

if [ $FAIL -eq 0 ]; then
    echo -e "${GREEN}✅ ALL CHECKS PASSED!${NC}"
    echo ""
    echo "🎉 Your Brain AiPro Trader platform is ready for deployment!"
    echo ""
    echo "Next steps:"
    echo "1. Review FINAL_AUDIT_REPORT.md for detailed feature breakdown"
    echo "2. Follow DEPLOYMENT_GUIDE.md for production deployment"
    echo "3. Configure environment variables (.env file)"
    echo "4. Run: npm run build && npm run start"
    echo ""
    exit 0
else
    echo -e "${RED}⚠️  SOME CHECKS FAILED${NC}"
    echo ""
    echo "Please review the failed checks above and:"
    echo "1. Install missing dependencies"
    echo "2. Verify file locations"
    echo "3. Run this script again"
    echo ""
    exit 1
fi
