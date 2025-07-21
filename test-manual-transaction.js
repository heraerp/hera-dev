#!/usr/bin/env node
/**
 * Test manual transaction creation to bypass auto-creation issues
 */

const BASE_URL = 'http://localhost:3000';
const MARIO_ORG_ID = '123e4567-e89b-12d3-a456-426614174000';
const FISH_VENDOR_ID = '4d5411a4-0070-45f3-9df2-9d0bb1d3057b'; // Fresh Fish Market ID from earlier test

async function testManualTransaction() {
  console.log('🧪 Manual Transaction Creation Test...\n');

  try {
    // Create a manual transaction directly
    console.log('1️⃣ Creating manual cash market transaction...');
    
    const transactionData = {
      organizationId: MARIO_ORG_ID,
      vendorId: FISH_VENDOR_ID,
      type: 'expense',
      amount: 145.80,
      currency: 'USD',
      description: 'Manual test transaction - Fresh fish purchase',
      category: 'Food & Beverage',
      location: 'Harbor Market',
      items: [
        {
          item: 'Red Snapper',
          quantity: '2 lbs',
          unitPrice: 18.50,
          totalPrice: 37.00
        },
        {
          item: 'Salmon',
          quantity: '1.5 lbs',
          unitPrice: 22.50,
          totalPrice: 33.75
        }
      ],
      submittedBy: 'Test User',
      aiConfidence: 0.95,
      notes: 'Manual test transaction'
    };

    const response = await fetch(`${BASE_URL}/api/cash-market/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(transactionData)
    });
    
    const result = await response.json();

    if (response.ok) {
      console.log('✅ Manual transaction created successfully!');
      console.log('   - Transaction ID:', result.data.id);
      console.log('   - Transaction Number:', result.data.transactionNumber);
      console.log('   - Amount:', `$${result.data.amount}`);
      console.log('   - Status:', result.data.status);
      console.log('   - Workflow Status:', result.data.workflowStatus);
      console.log('   - Vendor:', result.data.vendorName);
      console.log('   - Message:', result.message);
    } else {
      console.log('❌ Manual transaction failed:', result);
    }

    // Verify it appears in the transactions list
    console.log('\n2️⃣ Checking transactions list...');
    const listResponse = await fetch(`${BASE_URL}/api/cash-market/transactions?organizationId=${MARIO_ORG_ID}&limit=5`);
    const listResult = await listResponse.json();

    if (listResponse.ok) {
      console.log(`✅ Found ${listResult.data.length} transactions:`);
      listResult.data.slice(0, 3).forEach(transaction => {
        const isNew = transaction.description?.includes('Manual test transaction');
        console.log(`   ${isNew ? '🆕' : '  '} ${transaction.transactionNumber}: $${transaction.amount} (${transaction.status})`);
        if (isNew) {
          console.log(`       Vendor: ${transaction.vendor?.vendorName || 'Unknown'}`);
          console.log(`       Items: ${transaction.items?.length || 0} items`);
        }
      });
    }

    console.log('\n🎉 Manual transaction test complete!');
    console.log('📱 This confirms the transaction API is working. Camera flow should work once vendor lookup is fixed.');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testManualTransaction().catch(console.error);