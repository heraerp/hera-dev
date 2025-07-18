#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🧪 HERA Universal - Restaurant Setup E2E Test${NC}"
echo "=============================================="

# Check if local development server is running
echo -e "${YELLOW}🔍 Checking if development server is running on localhost:3000...${NC}"
if curl -s http://localhost:3000 > /dev/null; then
    echo -e "${GREEN}✅ Development server is running${NC}"
else
    echo -e "${RED}❌ Development server is not running on localhost:3000${NC}"
    echo -e "${YELLOW}💡 Please start the development server with: npm run dev${NC}"
    exit 1
fi

# Check if Playwright is installed
echo -e "${YELLOW}🔍 Checking Playwright installation...${NC}"
if npx playwright --version > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Playwright is installed${NC}"
else
    echo -e "${RED}❌ Playwright is not installed${NC}"
    echo -e "${YELLOW}💡 Installing Playwright...${NC}"
    npx playwright install
fi

# Run the restaurant setup test
echo -e "${BLUE}🚀 Running Restaurant Setup E2E Tests...${NC}"
echo ""

# Run specific test file
npx playwright test tests/restaurant-setup.spec.ts --headed --reporter=line

# Check test results
if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ Restaurant Setup E2E Tests PASSED!${NC}"
    echo -e "${GREEN}🎉 All restaurant setup functionality is working correctly${NC}"
else
    echo ""
    echo -e "${RED}❌ Restaurant Setup E2E Tests FAILED!${NC}"
    echo -e "${YELLOW}💡 Check the test output above for details${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}📊 Test Summary:${NC}"
echo "• Multi-step form navigation ✅"
echo "• Form validation ✅" 
echo "• Supabase integration ✅"
echo "• Error handling ✅"
echo "• Complete workflow ✅"
echo ""
echo -e "${GREEN}🎯 Restaurant setup page is ready for production!${NC}"