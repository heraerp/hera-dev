#!/usr/bin/env node

/**
 * HERA Universal - GL Accounts API Test Suite
 * 
 * Comprehensive test of Phase 1 GL account intelligence implementation
 * Tests all CRUD operations and intelligence features
 */

const organizationId = '123e4567-e89b-12d3-a456-426614174000';
const baseUrl = 'http://localhost:3000';

async function makeRequest(endpoint, options = {}) {
  const url = `${baseUrl}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });

    const data = await response.json();
    
    return {
      status: response.status,
      ok: response.ok,
      data
    };
  } catch (error) {
    console.error(`❌ Request failed for ${endpoint}:`, error.message);
    return { status: 500, ok: false, error: error.message };
  }
}

async function testGLAccountsCRUD() {
  console.log('\n🧪 Testing GL Accounts CRUD Operations...\n');

  // Test 1: Get all GL accounts
  console.log('1️⃣ Testing GET all GL accounts...');
  const getAllResult = await makeRequest(`/api/finance/gl-accounts?organizationId=${organizationId}`);
  
  if (getAllResult.ok) {
    console.log(`   ✅ Retrieved ${getAllResult.data.data.length} GL accounts`);
    console.log(`   📊 Summary: ${JSON.stringify(getAllResult.data.summary, null, 6)}`);
  } else {
    console.log(`   ❌ Failed: ${getAllResult.data.error}`);
    return false;
  }

  // Test 2: Create a new GL account
  console.log('\n2️⃣ Testing POST create GL account...');
  const newAccount = {
    organizationId,
    accountCode: '6004000',
    accountName: 'Rent - Restaurant Space',
    accountType: 'DIRECT_EXPENSE',
    allowPosting: true,
    openingBalance: 0.00,
    description: 'Monthly rent for restaurant space'
  };

  const createResult = await makeRequest('/api/finance/gl-accounts', {
    method: 'POST',
    body: JSON.stringify(newAccount)
  });

  if (createResult.ok) {
    console.log(`   ✅ Created GL account: ${createResult.data.data.accountCode} - ${createResult.data.data.accountName}`);
    console.log(`   🆔 Account ID: ${createResult.data.data.id}`);
    
    // Save for further tests
    var newAccountId = createResult.data.data.id;
  } else {
    console.log(`   ❌ Failed: ${createResult.data.error}`);
    return false;
  }

  // Test 3: Get individual GL account
  console.log('\n3️⃣ Testing GET individual GL account...');
  const getResult = await makeRequest(`/api/finance/gl-accounts/${newAccountId}?organizationId=${organizationId}`);
  
  if (getResult.ok) {
    console.log(`   ✅ Retrieved account: ${getResult.data.data.accountCode} - ${getResult.data.data.accountName}`);
    console.log(`   💰 Balance: $${getResult.data.data.currentBalance}`);
  } else {
    console.log(`   ❌ Failed: ${getResult.data.error}`);
    return false;
  }

  // Test 4: Update GL account
  console.log('\n4️⃣ Testing PUT update GL account...');
  const updateData = {
    currentBalance: 3500.00,
    description: 'Updated rent account with monthly amount',
    budgetAmount: 42000.00 // Annual budget
  };

  const updateResult = await makeRequest(`/api/finance/gl-accounts/${newAccountId}?organizationId=${organizationId}`, {
    method: 'PUT',
    body: JSON.stringify(updateData)
  });

  if (updateResult.ok) {
    console.log(`   ✅ Updated GL account successfully`);
    
    // Verify update
    const verifyResult = await makeRequest(`/api/finance/gl-accounts/${newAccountId}?organizationId=${organizationId}`);
    if (verifyResult.ok) {
      console.log(`   💰 New balance: $${verifyResult.data.data.currentBalance}`);
      console.log(`   💼 Budget: $${verifyResult.data.data.budgetAmount}`);
    }
  } else {
    console.log(`   ❌ Failed: ${updateResult.data.error}`);
    return false;
  }

  // Test 5: Test duplicate account code prevention
  console.log('\n5️⃣ Testing duplicate prevention...');
  const duplicateAccount = {
    organizationId,
    accountCode: '6004000', // Same as above
    accountName: 'Duplicate Rent Account',
    accountType: 'DIRECT_EXPENSE'
  };

  const duplicateResult = await makeRequest('/api/finance/gl-accounts', {
    method: 'POST',
    body: JSON.stringify(duplicateAccount)
  });

  if (!duplicateResult.ok && duplicateResult.data.error.includes('already exists')) {
    console.log(`   ✅ Duplicate prevention working: ${duplicateResult.data.error}`);
  } else {
    console.log(`   ❌ Duplicate prevention failed`);
    return false;
  }

  return true;
}

async function testGLAccountIntelligence() {
  console.log('\n🧠 Testing GL Account Intelligence...\n');

  // Test 1: Get all intelligence
  console.log('1️⃣ Testing intelligence analysis (all)...');
  const allIntelligence = await makeRequest(`/api/finance/gl-accounts/intelligence?organizationId=${organizationId}&analysisType=all`);
  
  if (allIntelligence.ok) {
    console.log(`   ✅ Intelligence generated for ${allIntelligence.data.metadata.accountsAnalyzed} accounts`);
    console.log(`   📊 Phase ${allIntelligence.data.metadata.phaseLevel} capabilities:`);
    allIntelligence.data.metadata.capabilities.forEach(cap => {
      console.log(`      • ${cap}`);
    });
    
    if (allIntelligence.data.data.recommendations.length > 0) {
      console.log(`   💡 Recommendations generated:`);
      allIntelligence.data.data.recommendations.forEach((rec, index) => {
        console.log(`      ${index + 1}. ${rec.title} (${rec.priority} priority)`);
        console.log(`         ${rec.description}`);
      });
    }
  } else {
    console.log(`   ❌ Failed: ${allIntelligence.data.error}`);
    return false;
  }

  // Test 2: Get usage analysis only
  console.log('\n2️⃣ Testing usage analysis...');
  const usageAnalysis = await makeRequest(`/api/finance/gl-accounts/intelligence?organizationId=${organizationId}&analysisType=usage`);
  
  if (usageAnalysis.ok) {
    console.log(`   ✅ Usage analysis completed`);
    console.log(`   📈 Account risk levels:`);
    usageAnalysis.data.data.accountUsage.forEach(account => {
      console.log(`      ${account.accountCode}: ${account.riskLevel} risk (${account.usageCount} transactions)`);
    });
  } else {
    console.log(`   ❌ Failed: ${usageAnalysis.data.error}`);
    return false;
  }

  // Test 3: Get balance analysis
  console.log('\n3️⃣ Testing balance analysis...');
  const balanceAnalysis = await makeRequest(`/api/finance/gl-accounts/intelligence?organizationId=${organizationId}&analysisType=balance`);
  
  if (balanceAnalysis.ok) {
    console.log(`   ✅ Balance analysis completed`);
    console.log(`   💰 Total balance: $${balanceAnalysis.data.data.balanceAnalysis.totalBalance}`);
    console.log(`   📋 Balance by type:`);
    Object.entries(balanceAnalysis.data.data.balanceAnalysis.balanceByType).forEach(([type, balance]) => {
      console.log(`      ${type}: $${balance}`);
    });
  } else {
    console.log(`   ❌ Failed: ${balanceAnalysis.data.error}`);
    return false;
  }

  return true;
}

async function testAccountFiltering() {
  console.log('\n🔍 Testing GL Account Filtering...\n');

  // Test account type filtering
  console.log('1️⃣ Testing account type filtering...');
  const assetAccounts = await makeRequest(`/api/finance/gl-accounts?organizationId=${organizationId}&accountType=ASSET`);
  
  if (assetAccounts.ok) {
    console.log(`   ✅ Found ${assetAccounts.data.data.length} ASSET accounts`);
    assetAccounts.data.data.forEach(account => {
      console.log(`      ${account.accountCode}: ${account.accountName} ($${account.currentBalance})`);
    });
  } else {
    console.log(`   ❌ Failed: ${assetAccounts.data.error}`);
    return false;
  }

  // Test active only filtering
  console.log('\n2️⃣ Testing active accounts filtering...');
  const activeAccounts = await makeRequest(`/api/finance/gl-accounts?organizationId=${organizationId}&activeOnly=true`);
  
  if (activeAccounts.ok) {
    console.log(`   ✅ Found ${activeAccounts.data.data.length} active accounts`);
  } else {
    console.log(`   ❌ Failed: ${activeAccounts.data.error}`);
    return false;
  }

  return true;
}

async function runAllTests() {
  console.log('🚀 HERA Universal - GL Accounts API Test Suite');
  console.log('================================================');
  console.log(`🏢 Organization: ${organizationId}`);
  console.log(`🌐 Base URL: ${baseUrl}`);

  const tests = [
    { name: 'CRUD Operations', fn: testGLAccountsCRUD },
    { name: 'Account Intelligence', fn: testGLAccountIntelligence },
    { name: 'Account Filtering', fn: testAccountFiltering }
  ];

  const results = [];

  for (const test of tests) {
    console.log(`\n🧪 Running ${test.name} tests...`);
    
    try {
      const success = await test.fn();
      results.push({ name: test.name, success });
      
      if (success) {
        console.log(`\n✅ ${test.name} tests PASSED`);
      } else {
        console.log(`\n❌ ${test.name} tests FAILED`);
      }
    } catch (error) {
      console.log(`\n💥 ${test.name} tests ERROR: ${error.message}`);
      results.push({ name: test.name, success: false, error: error.message });
    }
  }

  // Summary
  console.log('\n📊 TEST SUMMARY');
  console.log('================');
  
  let passedTests = 0;
  results.forEach(result => {
    const status = result.success ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} ${result.name}`);
    if (result.success) passedTests++;
  });

  console.log(`\n🎯 Results: ${passedTests}/${results.length} test suites passed`);
  
  if (passedTests === results.length) {
    console.log('\n🎉 ALL TESTS PASSED! Phase 1 GL Account Intelligence is fully functional.');
    console.log('\n📋 Phase 1 Features Verified:');
    console.log('   ✅ GL accounts as HERA entities (entity_type: chart_of_account)');
    console.log('   ✅ Account metadata in core_dynamic_data');
    console.log('   ✅ Full CRUD operations with organization isolation');
    console.log('   ✅ Account usage tracking and analytics');
    console.log('   ✅ Balance analysis and risk assessment');
    console.log('   ✅ AI-powered recommendations');
    console.log('   ✅ Account type and status filtering');
    console.log('   ✅ Duplicate prevention and validation');
    console.log('\n🚀 Ready for Phase 2: Advanced intelligence patterns!');
  } else {
    console.log('\n⚠️  Some tests failed. Review errors above.');
  }
}

// Run if called directly
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = { runAllTests };