#!/bin/bash

# AI Trading Platform - Comprehensive Audit Script
# This script checks for syntax errors, missing imports, and components

echo "🔍 Starting Comprehensive Project Audit..."
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counters
TOTAL_ERRORS=0
TOTAL_WARNINGS=0

# Function to print section header
print_section() {
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "📋 $1"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# 1. Check Node.js and npm
print_section "1. Checking Node.js and npm"
if command_exists node; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✓${NC} Node.js installed: $NODE_VERSION"
else
    echo -e "${RED}✗${NC} Node.js not found"
    TOTAL_ERRORS=$((TOTAL_ERRORS + 1))
fi

if command_exists npm; then
    NPM_VERSION=$(npm --version)
    echo -e "${GREEN}✓${NC} npm installed: $NPM_VERSION"
else
    echo -e "${RED}✗${NC} npm not found"
    TOTAL_ERRORS=$((TOTAL_ERRORS + 1))
fi

# 2. Check Python
print_section "2. Checking Python"
if command_exists python3; then
    PYTHON_VERSION=$(python3 --version)
    echo -e "${GREEN}✓${NC} Python installed: $PYTHON_VERSION"
else
    echo -e "${RED}✗${NC} Python not found"
    TOTAL_ERRORS=$((TOTAL_ERRORS + 1))
fi

# 3. Check package.json
print_section "3. Checking package.json"
if [ -f "package.json" ]; then
    echo -e "${GREEN}✓${NC} package.json exists"
    
    # Check for required dependencies
    REQUIRED_DEPS=("next" "react" "typescript" "prisma" "next-auth" "tailwindcss")
    for dep in "${REQUIRED_DEPS[@]}"; do
        if grep -q "\"$dep\"" package.json; then
            echo -e "${GREEN}  ✓${NC} $dep found"
        else
            echo -e "${RED}  ✗${NC} $dep missing"
            TOTAL_ERRORS=$((TOTAL_ERRORS + 1))
        fi
    done
else
    echo -e "${RED}✗${NC} package.json not found"
    TOTAL_ERRORS=$((TOTAL_ERRORS + 1))
fi

# 4. Check node_modules
print_section "4. Checking node_modules"
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✓${NC} node_modules exists"
    MODULE_COUNT=$(ls -1 node_modules | wc -l)
    echo -e "${GREEN}  ℹ${NC} $MODULE_COUNT modules installed"
else
    echo -e "${YELLOW}⚠${NC} node_modules not found - run 'npm install'"
    TOTAL_WARNINGS=$((TOTAL_WARNINGS + 1))
fi

# 5. Check TypeScript files for syntax errors
print_section "5. Checking TypeScript Syntax"
if command_exists npx; then
    echo "Running TypeScript compiler check..."
    
    # Create temporary tsconfig for checking
    if npx tsc --noEmit --skipLibCheck 2>&1 | tee /tmp/tsc-errors.txt; then
        echo -e "${GREEN}✓${NC} No TypeScript compilation errors"
    else
        ERROR_COUNT=$(grep -c "error TS" /tmp/tsc-errors.txt || echo "0")
        if [ "$ERROR_COUNT" -gt 0 ]; then
            echo -e "${RED}✗${NC} Found $ERROR_COUNT TypeScript errors"
            echo "First 10 errors:"
            head -20 /tmp/tsc-errors.txt
            TOTAL_ERRORS=$((TOTAL_ERRORS + ERROR_COUNT))
        fi
    fi
else
    echo -e "${YELLOW}⚠${NC} npx not available, skipping TypeScript check"
    TOTAL_WARNINGS=$((TOTAL_WARNINGS + 1))
fi

# 6. Check for missing imports in TypeScript files
print_section "6. Checking for Missing Imports"
echo "Scanning TypeScript/TSX files..."

MISSING_IMPORTS=0
find src -name "*.ts" -o -name "*.tsx" | while read -r file; do
    # Check for common missing imports
    if grep -q "useState\|useEffect\|useCallback" "$file" && ! grep -q "from ['\"]react['\"]" "$file"; then
        echo -e "${YELLOW}⚠${NC} Possible missing React import in: $file"
        MISSING_IMPORTS=$((MISSING_IMPORTS + 1))
    fi
    
    if grep -q "NextResponse\|NextRequest" "$file" && ! grep -q "from ['\"]next/server['\"]" "$file"; then
        echo -e "${YELLOW}⚠${NC} Possible missing next/server import in: $file"
        MISSING_IMPORTS=$((MISSING_IMPORTS + 1))
    fi
done

if [ $MISSING_IMPORTS -eq 0 ]; then
    echo -e "${GREEN}✓${NC} No obvious missing imports detected"
fi

# 7. Check Prisma schema
print_section "7. Checking Prisma Schema"
if [ -f "prisma/schema.prisma" ]; then
    echo -e "${GREEN}✓${NC} Prisma schema exists"
    
    # Count models
    MODEL_COUNT=$(grep -c "^model " prisma/schema.prisma)
    echo -e "${GREEN}  ℹ${NC} $MODEL_COUNT models defined"
    
    # Check for common issues
    if grep -q "@@map\|@@index" prisma/schema.prisma; then
        echo -e "${GREEN}  ✓${NC} Schema has indexes and mappings"
    fi
    
    # Validate schema
    if command_exists npx; then
        if npx prisma validate 2>&1 | grep -q "validated successfully"; then
            echo -e "${GREEN}  ✓${NC} Schema validation passed"
        else
            echo -e "${RED}  ✗${NC} Schema validation failed"
            TOTAL_ERRORS=$((TOTAL_ERRORS + 1))
        fi
    fi
else
    echo -e "${RED}✗${NC} Prisma schema not found"
    TOTAL_ERRORS=$((TOTAL_ERRORS + 1))
fi

# 8. Check Python files
print_section "8. Checking Python Files"
if command_exists python3; then
    echo "Checking Python syntax..."
    
    PYTHON_ERRORS=0
    find python-services -name "*.py" | while read -r file; do
        if python3 -m py_compile "$file" 2>/dev/null; then
            echo -e "${GREEN}✓${NC} $file"
        else
            echo -e "${RED}✗${NC} Syntax error in: $file"
            PYTHON_ERRORS=$((PYTHON_ERRORS + 1))
        fi
    done
    
    if [ $PYTHON_ERRORS -eq 0 ]; then
        echo -e "${GREEN}✓${NC} All Python files have valid syntax"
    else
        echo -e "${RED}✗${NC} Found $PYTHON_ERRORS Python files with errors"
        TOTAL_ERRORS=$((TOTAL_ERRORS + PYTHON_ERRORS))
    fi
fi

# 9. Check for required environment variables
print_section "9. Checking Environment Configuration"
if [ -f ".env" ]; then
    echo -e "${GREEN}✓${NC} .env file exists"
    
    REQUIRED_VARS=("DATABASE_URL" "NEXTAUTH_SECRET" "NEXTAUTH_URL")
    for var in "${REQUIRED_VARS[@]}"; do
        if grep -q "^$var=" .env; then
            echo -e "${GREEN}  ✓${NC} $var is set"
        else
            echo -e "${YELLOW}  ⚠${NC} $var not found in .env"
            TOTAL_WARNINGS=$((TOTAL_WARNINGS + 1))
        fi
    done
else
    echo -e "${YELLOW}⚠${NC} .env file not found - copy from env.example.txt"
    TOTAL_WARNINGS=$((TOTAL_WARNINGS + 1))
fi

# 10. Check API routes
print_section "10. Checking API Routes"
API_ROUTES=$(find src/app/api -name "route.ts" -o -name "route.tsx" 2>/dev/null | wc -l)
echo -e "${GREEN}ℹ${NC} Found $API_ROUTES API route files"

# List all API routes
echo "API Routes:"
find src/app/api -name "route.ts" -o -name "route.tsx" 2>/dev/null | while read -r route; do
    ROUTE_PATH=$(echo "$route" | sed 's|src/app/api/||' | sed 's|/route.ts.*||')
    echo -e "${GREEN}  ✓${NC} /api/$ROUTE_PATH"
done

# 11. Check UI Components
print_section "11. Checking UI Components"
if [ -d "src/components/ui" ]; then
    COMPONENT_COUNT=$(ls -1 src/components/ui/*.tsx 2>/dev/null | wc -l)
    echo -e "${GREEN}✓${NC} UI components directory exists"
    echo -e "${GREEN}  ℹ${NC} $COMPONENT_COUNT UI components found"
    
    # Check for essential components
    ESSENTIAL_COMPONENTS=("button.tsx" "card.tsx" "input.tsx" "toast.tsx" "use-toast.ts")
    for comp in "${ESSENTIAL_COMPONENTS[@]}"; do
        if [ -f "src/components/ui/$comp" ]; then
            echo -e "${GREEN}  ✓${NC} $comp exists"
        else
            echo -e "${YELLOW}  ⚠${NC} $comp missing"
            TOTAL_WARNINGS=$((TOTAL_WARNINGS + 1))
        fi
    done
else
    echo -e "${RED}✗${NC} UI components directory not found"
    TOTAL_ERRORS=$((TOTAL_ERRORS + 1))
fi

# 12. Check Python services structure
print_section "12. Checking Python Services"
SERVICES=("pattern-detector" "news-agent" "backtesting-engine")
for service in "${SERVICES[@]}"; do
    if [ -d "python-services/$service" ]; then
        echo -e "${GREEN}✓${NC} $service directory exists"
        
        if [ -f "python-services/$service/main.py" ]; then
            echo -e "${GREEN}  ✓${NC} main.py exists"
        else
            echo -e "${RED}  ✗${NC} main.py missing"
            TOTAL_ERRORS=$((TOTAL_ERRORS + 1))
        fi
    else
        echo -e "${RED}✗${NC} $service directory not found"
        TOTAL_ERRORS=$((TOTAL_ERRORS + 1))
    fi
done

# 13. Check for duplicate files
print_section "13. Checking for Duplicate Routes"
echo "Checking for duplicate route definitions..."

DUPLICATES=$(find src/app -name "page.tsx" -o -name "route.ts" | sed 's|/page.tsx||' | sed 's|/route.ts||' | sort | uniq -d)
if [ -z "$DUPLICATES" ]; then
    echo -e "${GREEN}✓${NC} No duplicate routes found"
else
    echo -e "${RED}✗${NC} Duplicate routes detected:"
    echo "$DUPLICATES"
    TOTAL_ERRORS=$((TOTAL_ERRORS + 1))
fi

# 14. Check for TODO and placeholder comments
print_section "14. Checking for TODOs and Placeholders"
TODO_COUNT=$(grep -r "TODO\|FIXME\|XXX" src --include="*.ts" --include="*.tsx" 2>/dev/null | wc -l)
PLACEHOLDER_COUNT=$(grep -r "placeholder" src --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v "placeholder=" | wc -l)

if [ "$TODO_COUNT" -gt 0 ]; then
    echo -e "${YELLOW}⚠${NC} Found $TODO_COUNT TODO comments"
    TOTAL_WARNINGS=$((TOTAL_WARNINGS + TODO_COUNT))
else
    echo -e "${GREEN}✓${NC} No TODO comments found"
fi

if [ "$PLACEHOLDER_COUNT" -gt 0 ]; then
    echo -e "${YELLOW}⚠${NC} Found $PLACEHOLDER_COUNT placeholder implementations"
    TOTAL_WARNINGS=$((TOTAL_WARNINGS + PLACEHOLDER_COUNT))
else
    echo -e "${GREEN}✓${NC} No placeholder implementations found"
fi

# 15. File structure check
print_section "15. Checking Project Structure"
REQUIRED_DIRS=("src/app" "src/components" "src/lib" "prisma" "python-services")
for dir in "${REQUIRED_DIRS[@]}"; do
    if [ -d "$dir" ]; then
        echo -e "${GREEN}✓${NC} $dir exists"
    else
        echo -e "${RED}✗${NC} $dir missing"
        TOTAL_ERRORS=$((TOTAL_ERRORS + 1))
    fi
done

# 16. Check documentation
print_section "16. Checking Documentation"
DOCS=("README.md" "FINAL_AUDIT.md" "PROJECT_STATUS.md" "QUICK_START.md")
for doc in "${DOCS[@]}"; do
    if [ -f "$doc" ]; then
        echo -e "${GREEN}✓${NC} $doc exists"
    else
        echo -e "${YELLOW}⚠${NC} $doc missing"
        TOTAL_WARNINGS=$((TOTAL_WARNINGS + 1))
    fi
done

# Final Summary
print_section "AUDIT SUMMARY"
echo ""
if [ $TOTAL_ERRORS -eq 0 ] && [ $TOTAL_WARNINGS -eq 0 ]; then
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}✓ AUDIT PASSED - NO ISSUES FOUND${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    exit 0
else
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${RED}Errors: $TOTAL_ERRORS${NC}"
    echo -e "${YELLOW}Warnings: $TOTAL_WARNINGS${NC}"
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo "Recommendations:"
    if [ $TOTAL_ERRORS -gt 0 ]; then
        echo -e "${RED}1. Fix critical errors before proceeding${NC}"
    fi
    if [ $TOTAL_WARNINGS -gt 0 ]; then
        echo -e "${YELLOW}2. Review warnings and address as needed${NC}"
    fi
    echo "3. Run 'npm install' if node_modules is missing"
    echo "4. Run 'npx prisma generate' to update Prisma client"
    echo "5. Configure .env file with required variables"
    exit 1
fi
