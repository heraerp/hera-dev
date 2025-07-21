#!/usr/bin/env node
/**
 * Test vendor lookup to debug auto-transaction creation
 */

const BASE_URL = 'http://localhost:3000';
const MARIO_ORG_ID = '123e4567-e89b-12d3-a456-426614174000';

async function testVendorLookup() {
  console.log('🔍 Testing vendor lookup for auto-transaction...\n');

  try {
    // Get all vendors
    console.log('1️⃣ Getting all vendors...');
    const vendorsResponse = await fetch(`${BASE_URL}/api/cash-market/vendors?organizationId=${MARIO_ORG_ID}`);
    const vendorsData = await vendorsResponse.json();
    
    console.log('Available vendors:');
    vendorsData.data.forEach(vendor => {
      console.log(`   - ID: ${vendor.id}`);
      console.log(`     Name: "${vendor.name}"`);
      console.log(`     Code: ${vendor.code}`);
      console.log(`     Category: ${vendor.category || 'N/A'}`);
      console.log('');
    });

    // Test if "Fresh Fish Market" exists
    const targetVendor = vendorsData.data.find(v => v.name.toLowerCase().includes('fresh fish market'.toLowerCase()));
    if (targetVendor) {
      console.log('✅ Target vendor "Fresh Fish Market" found:', targetVendor.id);
    } else {
      console.log('❌ Target vendor "Fresh Fish Market" NOT found');
      console.log('Available vendor names:');
      vendorsData.data.forEach(vendor => {
        console.log(`   - "${vendor.name}"`);
      });
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testVendorLookup().catch(console.error);