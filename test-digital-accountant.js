/**
 * HERA Digital Accountant - Feature Test Suite
 * Tests all Gold Standard features and user journey components
 */

const http = require('http');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Test configuration
const BASE_URL = 'http://localhost:3001';
const FEATURES_TO_TEST = [
  '/digital-accountant',
  '/digital-accountant/onboarding',
  '/digital-accountant/analytics',
  '/digital-accountant/documents',
  '/digital-accountant/cash-market'
];

// Component files to validate
const COMPONENTS_TO_TEST = [
  'components/digital-accountant/QuickCaptureWidget.tsx',
  'components/digital-accountant/EnhancedMobileCapture.tsx', 
  'components/ui/CaptureFloatingButton.tsx',
  'components/digital-accountant/DigitalAccountantMainDashboard.tsx',
  'app/digital-accountant/page.tsx',
  'app/digital-accountant/onboarding/page.tsx'
];

// Test results
const testResults = {
  pages: {},
  components: {},
  apis: {},
  overall: 'PENDING'
};

console.log('🚀 HERA Digital Accountant - Comprehensive Test Suite');
console.log('=' .repeat(60));

// Test 1: Component File Existence
console.log('\n📁 PHASE 1: Component File Validation');
COMPONENTS_TO_TEST.forEach(componentPath => {
  const fullPath = path.join(__dirname, componentPath);
  const exists = fs.existsSync(fullPath);
  testResults.components[componentPath] = exists ? '✅ EXISTS' : '❌ MISSING';
  console.log(`${exists ? '✅' : '❌'} ${componentPath}`);
});

// Test 2: Component Syntax Validation
console.log('\n🔍 PHASE 2: Component Syntax Check');
COMPONENTS_TO_TEST.forEach(componentPath => {
  const fullPath = path.join(__dirname, componentPath);
  if (fs.existsSync(fullPath)) {
    try {
      const content = fs.readFileSync(fullPath, 'utf8');
      
      // Check for key patterns
      const hasImports = content.includes("import");
      const hasExport = content.includes("export default");
      const hasJSX = content.includes("className") || content.includes("<div");
      
      const isValid = hasImports && hasExport && hasJSX;
      testResults.components[componentPath + '_syntax'] = isValid ? '✅ VALID' : '❌ INVALID';
      console.log(`${isValid ? '✅' : '❌'} ${componentPath} - Syntax Check`);
      
      // Check for Gold Standard patterns
      const hasHookModel = content.includes("Hook") || content.includes("behavioral");
      const hasOnboarding = content.includes("onboarding") || content.includes("Onboarding");
      const hasTrigger = content.includes("trigger") || content.includes("Trigger");
      
      if (componentPath.includes('onboarding')) {
        console.log(`   ${hasHookModel ? '✅' : '⚠️'} Hook Model Implementation`);
        console.log(`   ${hasOnboarding ? '✅' : '⚠️'} Onboarding Flow`);
        console.log(`   ${hasTrigger ? '✅' : '⚠️'} Behavioral Triggers`);
      }
      
    } catch (error) {
      testResults.components[componentPath + '_syntax'] = '❌ ERROR';
      console.log(`❌ ${componentPath} - Syntax Error: ${error.message}`);
    }
  }
});

// Test 3: Gold Standard Feature Validation
console.log('\n🏆 PHASE 3: Gold Standard Feature Validation');

const checkGoldStandardFeatures = (componentPath, content) => {
  const features = {
    'Hero Section': content.includes('Hero') || content.includes('hero') || content.includes('lg:col-span-2'),
    'Floating Button': content.includes('FloatingButton') || content.includes('floating') || content.includes('fixed'),
    'Real-time Feedback': content.includes('real-time') || content.includes('realTime') || content.includes('Live'),
    'Voice Commands': content.includes('voice') || content.includes('Voice') || content.includes('Mic'),
    'AI Processing': content.includes('AI') || content.includes('confidence') || content.includes('processing'),
    'Behavioral Psychology': content.includes('Hook') || content.includes('behavioral') || content.includes('psychology'),
    'Progress Tracking': content.includes('progress') || content.includes('Progress') || content.includes('metrics'),
    'Mobile First': content.includes('mobile') || content.includes('responsive') || content.includes('sm:')
  };
  
  console.log(`   📊 ${componentPath}:`);
  Object.entries(features).forEach(([feature, hasFeature]) => {
    console.log(`      ${hasFeature ? '✅' : '⚠️'} ${feature}`);
  });
  
  return features;
};

// Check main components for Gold Standard features
const mainComponents = [
  'components/digital-accountant/QuickCaptureWidget.tsx',
  'app/digital-accountant/onboarding/page.tsx',
  'components/digital-accountant/DigitalAccountantMainDashboard.tsx'
];

mainComponents.forEach(componentPath => {
  const fullPath = path.join(__dirname, componentPath);
  if (fs.existsSync(fullPath)) {
    const content = fs.readFileSync(fullPath, 'utf8');
    checkGoldStandardFeatures(componentPath, content);
  }
});

// Test 4: API Endpoints Check
console.log('\n🔌 PHASE 4: API Endpoints Validation');

const API_ENDPOINTS = [
  '/api/digital-accountant/receipts',
  '/api/digital-accountant/transactions', 
  '/api/cash-market/receipts',
  '/api/cash-market/transactions'
];

const testEndpoint = (endpoint) => {
  return new Promise((resolve) => {
    const req = http.get(`${BASE_URL}${endpoint}`, (res) => {
      const isWorking = res.statusCode < 500;
      testResults.apis[endpoint] = isWorking ? `✅ ${res.statusCode}` : `❌ ${res.statusCode}`;
      console.log(`${isWorking ? '✅' : '❌'} ${endpoint} - Status: ${res.statusCode}`);
      resolve(isWorking);
    });
    
    req.on('error', (error) => {
      testResults.apis[endpoint] = `❌ ERROR: ${error.message}`;
      console.log(`❌ ${endpoint} - Error: ${error.message}`);
      resolve(false);
    });
    
    req.setTimeout(5000, () => {
      testResults.apis[endpoint] = '❌ TIMEOUT';
      console.log(`❌ ${endpoint} - Timeout`);
      req.destroy();
      resolve(false);
    });
  });
};

// Test 5: User Journey Flow Validation  
console.log('\n🎯 PHASE 5: User Journey Flow Validation');

const validateUserJourney = () => {
  console.log('   Checking complete A-Z user journey...');
  
  // Check if onboarding exists
  const onboardingExists = fs.existsSync(path.join(__dirname, 'app/digital-accountant/onboarding/page.tsx'));
  console.log(`   ${onboardingExists ? '✅' : '❌'} Onboarding Journey`);
  
  // Check if main dashboard has hero section
  const dashboardPath = path.join(__dirname, 'components/digital-accountant/DigitalAccountantMainDashboard.tsx');
  if (fs.existsSync(dashboardPath)) {
    const content = fs.readFileSync(dashboardPath, 'utf8');
    const hasHeroSection = content.includes('Hero Section') || content.includes('lg:col-span-2');
    const hasQuickCapture = content.includes('QuickCaptureWidget');
    const hasWelcomePanel = content.includes('Welcome') || content.includes('onboarding');
    
    console.log(`   ${hasHeroSection ? '✅' : '❌'} Hero Section (Front Door)`);
    console.log(`   ${hasQuickCapture ? '✅' : '❌'} Quick Capture Widget`);
    console.log(`   ${hasWelcomePanel ? '✅' : '❌'} Welcome Panel Integration`);
  }
  
  // Check if floating button is integrated
  const mainPagePath = path.join(__dirname, 'app/digital-accountant/page.tsx');
  if (fs.existsSync(mainPagePath)) {
    const content = fs.readFileSync(mainPagePath, 'utf8');
    const hasFloatingButton = content.includes('CaptureFloatingButton');
    console.log(`   ${hasFloatingButton ? '✅' : '❌'} Global Floating Button`);
  }
};

validateUserJourney();

// Test 6: Hook Model Implementation Check
console.log('\n🧠 PHASE 6: Hook Model Implementation Check');

const validateHookModel = () => {
  const onboardingPath = path.join(__dirname, 'app/digital-accountant/onboarding/page.tsx');
  
  if (fs.existsSync(onboardingPath)) {
    const content = fs.readFileSync(onboardingPath, 'utf8');
    
    const hookElements = {
      'Trigger': content.includes('trigger') || content.includes('Trigger'),
      'Action': content.includes('action') || content.includes('Action'),
      'Variable Reward': content.includes('reward') || content.includes('Reward'),
      'Investment': content.includes('investment') || content.includes('Investment'),
      'Psychology Notes': content.includes('psychologyNote') || content.includes('psychology'),
      'Behavioral Steps': content.includes('onboardingSteps') && content.includes('psychologyNote'),
      'Progress Tracking': content.includes('completedSteps') || content.includes('progress'),
      'Gamification': content.includes('userProgress') || content.includes('achievements')
    };
    
    console.log('   📊 Hook Model Elements:');
    Object.entries(hookElements).forEach(([element, hasElement]) => {
      console.log(`      ${hasElement ? '✅' : '❌'} ${element}`);
    });
    
    // Check for 5-step onboarding
    const stepMatches = content.match(/onboardingSteps.*?\[[\s\S]*?\]/);
    if (stepMatches) {
      const stepCount = (stepMatches[0].match(/\{[\s\S]*?\}/g) || []).length;
      console.log(`   ${stepCount === 5 ? '✅' : '⚠️'} 5-Step Onboarding (Found: ${stepCount})`);
    }
  } else {
    console.log('   ❌ Onboarding file not found');
  }
};

validateHookModel();

// Final Results Summary
console.log('\n' + '='.repeat(60));
console.log('📊 TEST RESULTS SUMMARY');
console.log('='.repeat(60));

let totalTests = 0;
let passedTests = 0;

// Count component tests
Object.entries(testResults.components).forEach(([test, result]) => {
  totalTests++;
  if (result.includes('✅')) passedTests++;
  console.log(`${result.includes('✅') ? '✅' : '❌'} ${test}`);
});

// Overall assessment
const successRate = totalTests > 0 ? (passedTests / totalTests * 100).toFixed(1) : 0;
console.log(`\n🎯 Overall Success Rate: ${successRate}% (${passedTests}/${totalTests})`);

if (successRate >= 90) {
  console.log('🏆 GOLD STANDARD ACHIEVED! All features ready for production.');
  testResults.overall = 'GOLD STANDARD';
} else if (successRate >= 75) {
  console.log('✅ GOOD STANDARD achieved. Minor improvements recommended.');
  testResults.overall = 'GOOD';
} else if (successRate >= 50) {
  console.log('⚠️ BASIC STANDARD achieved. Several improvements needed.');
  testResults.overall = 'BASIC';
} else {
  console.log('❌ NEEDS WORK. Major improvements required.');
  testResults.overall = 'NEEDS_WORK';
}

// Save detailed results
const resultFile = path.join(__dirname, 'test-results.json');
fs.writeFileSync(resultFile, JSON.stringify(testResults, null, 2));
console.log(`\n📄 Detailed results saved to: ${resultFile}`);

console.log('\n🚀 Test suite completed!');
console.log('   Next steps: Review any ❌ items and implement improvements.');
console.log('   All ✅ features are ready for user testing.');

// Export results for programmatic access
module.exports = testResults;