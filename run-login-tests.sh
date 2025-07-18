#!/bin/bash

# HERA Universal - Login Test Runner
# Runs Playwright login tests with proper setup

echo "🧪 Running HERA Universal Login Tests..."
echo "========================================"

# Check if Playwright is installed
if ! command -v npx playwright &> /dev/null; then
    echo "❌ Playwright not found. Installing..."
    npm install -D @playwright/test
    npx playwright install
fi

# Ensure the application is running
echo "🚀 Starting application server..."
if ! curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo "⚠️ Application not running on localhost:3000"
    echo "Please start your development server with: npm run dev"
    exit 1
fi

echo "✅ Application server is running"

# Create auth directory if it doesn't exist
mkdir -p playwright/.auth

# Run the login tests
echo "🔐 Running login authentication tests..."
npx playwright test tests/e2e/login.spec.ts --headed

# Check if tests passed
if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 Login tests completed successfully!"
    echo ""
    echo "📋 Test Results:"
    echo "✅ User login flow tested"
    echo "✅ Authentication state saved to playwright/.auth/user.json"
    echo "✅ Session reuse verified"
    echo ""
    echo "💡 To use the saved session in other tests:"
    echo "   test.use({ storageState: 'playwright/.auth/user.json' })"
    echo ""
    echo "🔍 To view detailed test report:"
    echo "   npx playwright show-report"
else
    echo ""
    echo "❌ Login tests failed. Check the output above for details."
    echo ""
    echo "🛠️ Debugging tips:"
    echo "1. Check if the login page exists at /login"
    echo "2. Verify test credentials are correct"
    echo "3. Run with --debug flag for step-by-step debugging"
    echo "4. Check screenshots in test-results/ folder"
    echo ""
    echo "🔧 Debug command:"
    echo "   npx playwright test tests/e2e/login.spec.ts --debug"
fi