#!/bin/bash

# 🚀 Quick HERA Restaurant Demo Launcher
echo "🏆 HERA UNIVERSAL RESTAURANT - DEMO STARTING..."
echo ""

# Ensure we're in the right directory
cd /Users/san/Documents/hera-erp/frontend

# Create test-results directory if it doesn't exist
mkdir -p test-results

echo "📋 Running HERA Restaurant Demo Test..."
echo "======================================"

# Run the quick demo test
npx playwright test tests/demo-restaurant-quick.spec.ts --headed --project=chromium --timeout=120000

echo ""
echo "🎉 Demo completed! Check test-results/ for screenshots."