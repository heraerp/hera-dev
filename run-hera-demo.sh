#!/bin/bash

# 🏆 HERA Universal Restaurant Demo Test Runner
# Executes the complete HERA restaurant demonstration

echo "🚀 HERA UNIVERSAL RESTAURANT DEMO"
echo "=================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is available
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not available. Please install npm first."
    exit 1
fi

# Ensure we're in the frontend directory
if [[ ! -f "package.json" ]]; then
    echo "❌ Not in frontend directory. Please run from frontend/ folder."
    exit 1
fi

echo "📋 Pre-flight checks..."
echo "✅ Node.js: $(node --version)"
echo "✅ npm: $(npm --version)"
echo "✅ Current directory: $(pwd)"
echo ""

# Install Playwright if not already installed
echo "🎭 Setting up Playwright..."
if [[ ! -d "node_modules/@playwright" ]]; then
    echo "📦 Installing Playwright dependencies..."
    npm install @playwright/test
fi

# Install Playwright browsers
echo "🌐 Installing Playwright browsers..."
npx playwright install

echo ""
echo "🚀 Starting HERA Universal Restaurant Demo..."
echo "============================================="
echo ""

# Run the quick demo test
echo "📋 Executing comprehensive restaurant workflow demo..."
echo "   - Restaurant Setup (Universal Architecture)"
echo "   - Product Catalog (Universal Schema)"
echo "   - Order Processing (Universal Transactions)"
echo "   - Kitchen Operations (Real-time Updates)"
echo "   - Analytics Dashboard (AI Intelligence)"
echo ""

# Execute the demo test with detailed output
npx playwright test tests/demo-restaurant-quick.spec.ts \
  --headed \
  --reporter=list \
  --timeout=60000 \
  --project=chromium

# Check test results
if [[ $? -eq 0 ]]; then
    echo ""
    echo "🎉 HERA DEMO COMPLETED SUCCESSFULLY!"
    echo "===================================="
    echo ""
    echo "🏆 Revolutionary Features Demonstrated:"
    echo "   ✅ 2-minute restaurant ERP setup"
    echo "   ✅ Universal transaction architecture"
    echo "   ✅ Real-time multi-tenant operations"
    echo "   ✅ AI-powered business intelligence"
    echo "   ✅ Mobile-first design system"
    echo "   ✅ Zero schema mismatches"
    echo ""
    echo "📊 Check test-results/ folder for screenshots"
    echo "📋 View playwright-report/ for detailed results"
    echo ""
else
    echo ""
    echo "⚠️ Demo encountered some issues"
    echo "==============================="
    echo ""
    echo "🔍 Troubleshooting tips:"
    echo "   1. Ensure the development server is running: npm run dev"
    echo "   2. Check that the database is properly configured"
    echo "   3. Verify environment variables are set"
    echo "   4. Review playwright-report/ for detailed error information"
    echo ""
fi

echo "📝 To run additional demo tests:"
echo "   npm run test:e2e -- tests/hera-restaurant-demo-complete.spec.ts"
echo ""
echo "🎭 To run with browser UI:"
echo "   npm run test:e2e:ui"
echo ""
echo "🐛 To debug specific issues:"
echo "   npm run test:e2e:debug"
echo ""

# Show test report if available
if [[ -f "playwright-report/index.html" ]]; then
    echo "📊 Opening test report..."
    echo "   View detailed results at: file://$(pwd)/playwright-report/index.html"
fi

echo ""
echo "🚀 HERA Universal: The world's first truly intelligent ERP!"
echo "=========================================================="