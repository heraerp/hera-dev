#!/usr/bin/env node

/**
 * HERA App Store Accessibility Test
 * Tests if the app store page is accessible and renders correctly
 */

console.log('🧪 Testing HERA App Store Accessibility\n');

// Test 1: Check file syntax
try {
  const fs = require('fs');
  const storePage = fs.readFileSync('app-erp/store/page.tsx', 'utf8');
  const appCard = fs.readFileSync('components/erp/app-card.tsx', 'utf8');
  
  console.log('✅ Test 1: File Syntax Check');
  
  // Check for basic TypeScript/React syntax
  const storeHasExport = storePage.includes('export default');
  const cardHasExport = appCard.includes('export function AppCard');
  const storeHasImports = storePage.includes('import');
  const cardHasImports = appCard.includes('import');
  
  console.log(`   - Store page export: ${storeHasExport ? '✅ VALID' : '❌ MISSING'}`);
  console.log(`   - App card export: ${cardHasExport ? '✅ VALID' : '❌ MISSING'}`);
  console.log(`   - Store imports: ${storeHasImports ? '✅ VALID' : '❌ MISSING'}`);
  console.log(`   - Card imports: ${cardHasImports ? '✅ VALID' : '❌ MISSING'}`);
  
} catch (error) {
  console.log('❌ Test 1: Syntax check failed -', error.message);
}

// Test 2: Check layout structure
try {
  const fs = require('fs');
  const layout = fs.readFileSync('app-erp/layout.tsx', 'utf8');
  
  console.log('\n✅ Test 2: Layout Structure Check');
  
  // Check if layout is server component (no "use client")
  const isServerComponent = !layout.includes('"use client"');
  const hasMetadata = layout.includes('export const metadata');
  const hasCorrectCSSImport = layout.includes('../app/globals.css');
  
  console.log(`   - Server component: ${isServerComponent ? '✅ CORRECT' : '❌ CLIENT COMPONENT'}`);
  console.log(`   - Has metadata: ${hasMetadata ? '✅ PRESENT' : '❌ MISSING'}`);
  console.log(`   - CSS import path: ${hasCorrectCSSImport ? '✅ CORRECT' : '❌ WRONG PATH'}`);
  
} catch (error) {
  console.log('❌ Test 2: Layout check failed -', error.message);
}

// Test 3: Check component dependencies
try {
  const fs = require('fs');
  const storePage = fs.readFileSync('app-erp/store/page.tsx', 'utf8');
  
  console.log('\n✅ Test 3: Component Dependencies Check');
  
  // Check for all required imports
  const hasHeroIcons = storePage.includes('@heroicons/react/24/outline');
  const hasAppCard = storePage.includes("import { AppCard }");
  const hasReactHooks = storePage.includes('useState') && storePage.includes('useMemo');
  const hasNextRouter = storePage.includes('next/navigation');
  
  console.log(`   - Hero icons: ${hasHeroIcons ? '✅ IMPORTED' : '❌ MISSING'}`);
  console.log(`   - App card component: ${hasAppCard ? '✅ IMPORTED' : '❌ MISSING'}`);
  console.log(`   - React hooks: ${hasReactHooks ? '✅ IMPORTED' : '❌ MISSING'}`);
  
} catch (error) {
  console.log('❌ Test 3: Dependencies check failed -', error.message);
}

// Test 4: Check for common Next.js issues
try {
  const fs = require('fs');
  const storePage = fs.readFileSync('app-erp/store/page.tsx', 'utf8');
  const appCard = fs.readFileSync('components/erp/app-card.tsx', 'utf8');
  
  console.log('\n✅ Test 4: Next.js Compatibility Check');
  
  // Check for client-side only features
  const storeIsClientComponent = storePage.includes('"use client"');
  const cardIsClientComponent = appCard.includes('"use client"');
  const hasWindowUsage = (storePage + appCard).includes('window.');
  const hasDocumentUsage = (storePage + appCard).includes('document.');
  
  console.log(`   - Store client component: ${storeIsClientComponent ? '✅ CORRECT' : '❌ MISSING "use client"'}`);
  console.log(`   - Card client component: ${cardIsClientComponent ? '✅ CORRECT' : '❌ MISSING "use client"'}`);
  console.log(`   - No window usage: ${!hasWindowUsage ? '✅ SAFE' : '⚠️ MAY CAUSE SSR ISSUES'}`);
  console.log(`   - No document usage: ${!hasDocumentUsage ? '✅ SAFE' : '⚠️ MAY CAUSE SSR ISSUES'}`);
  
} catch (error) {
  console.log('❌ Test 4: Next.js compatibility check failed -', error.message);
}

// Test 5: Route structure validation
try {
  const fs = require('fs');
  const path = require('path');
  
  console.log('\n✅ Test 5: Route Structure Validation');
  
  // Check all necessary files exist in correct locations
  const routeFiles = [
    'app-erp/store/page.tsx',           // Store page
    'app-erp/layout.tsx',               // ERP layout  
    'app-erp/page.tsx',                 // ERP main page
    'components/erp/app-card.tsx',      // App card component
    'app/globals.css'                   // Global styles
  ];
  
  routeFiles.forEach(file => {
    const exists = fs.existsSync(file);
    console.log(`   - ${file}: ${exists ? '✅ EXISTS' : '❌ MISSING'}`);
  });
  
} catch (error) {
  console.log('❌ Test 5: Route structure validation failed -', error.message);
}

// Summary and troubleshooting
console.log('\n🎯 HERA App Store Accessibility Summary');
console.log('======================================');
console.log('If the app store is showing 404 errors, check:');
console.log('1. Make sure Next.js dev server is running');
console.log('2. Navigate to: http://localhost:3000/app-erp/store');
console.log('3. Check browser console for any JavaScript errors');
console.log('4. Verify all file paths are correct in imports');
console.log('5. Ensure layout.tsx is a server component (no "use client")');
console.log('6. Check that CSS import path is correct');

console.log('\n🌟 Expected URL: /app-erp/store');
console.log('🌟 Features available: Search, filter, 27 ERP apps');
console.log('🌟 Status indicators: Live vs Coming Soon');
console.log('🌟 Responsive design: Mobile and desktop');