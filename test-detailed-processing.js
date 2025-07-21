#!/usr/bin/env node
/**
 * Detailed test of receipt processing to debug auto-transaction creation
 */

const BASE_URL = 'http://localhost:3000';
const MARIO_ORG_ID = '123e4567-e89b-12d3-a456-426614174000';

async function testDetailedProcessing() {
  console.log('🧪 Detailed Receipt Processing Test...\n');

  try {
    // Create a receipt
    console.log('1️⃣ Creating test receipt...');
    const receiptData = {
      organizationId: MARIO_ORG_ID,
      filename: 'test_detailed_receipt.jpg',
      imageUrl: 'data:image/jpeg;base64,test', 
      uploadedBy: 'Test User',
      processingStatus: 'processing',
      notes: 'Test receipt for detailed processing'
    };

    const receiptResponse = await fetch(`${BASE_URL}/api/cash-market/receipts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(receiptData)
    });
    const receiptResult = await receiptResponse.json();

    if (!receiptResponse.ok) {
      console.log('❌ Receipt creation failed:', receiptResult);
      return;
    }

    console.log('✅ Receipt created:', receiptResult.data.id);
    const receiptId = receiptResult.data.id;

    // Process the receipt
    console.log('\n2️⃣ Processing receipt with AI...');
    const processResponse = await fetch(`${BASE_URL}/api/cash-market/receipts/${receiptId}/process`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        organizationId: MARIO_ORG_ID,
        forceReprocess: true
      })
    });
    const processResult = await processResponse.json();

    if (!processResponse.ok) {
      console.log('❌ Processing failed:', processResult);
      return;
    }

    console.log('✅ Processing complete:');
    console.log('   - Confidence:', processResult.data.confidence);
    console.log('   - Vendor:', processResult.data.aiResults?.vendor);
    console.log('   - Amount:', processResult.data.aiResults?.amount);
    console.log('   - Status:', processResult.data.processingStatus);
    console.log('   - Auto-transaction:', processResult.data.autoCreatedTransaction ? 'YES' : 'NO');

    if (processResult.data.autoCreatedTransaction) {
      console.log('   - Transaction ID:', processResult.data.autoCreatedTransaction.id);
      console.log('   - Transaction Number:', processResult.data.autoCreatedTransaction.number);
    } else {
      console.log('\n🔍 Analyzing why auto-transaction was NOT created...');
      console.log('   - Confidence > 0.85?', processResult.data.confidence > 0.85);
      console.log('   - Vendor found?', !!processResult.data.vendorId);
      console.log('   - Amount > 0?', (processResult.data.aiResults?.amount || 0) > 0);
      
      if (!processResult.data.vendorId) {
        console.log('   - Vendor lookup failed for:', processResult.data.aiResults?.vendor);
      }
    }

    // Check transactions to see if one was created
    console.log('\n3️⃣ Checking recent transactions...');
    const transactionsResponse = await fetch(`${BASE_URL}/api/cash-market/transactions?organizationId=${MARIO_ORG_ID}&limit=5`);
    const transactionsData = await transactionsResponse.json();

    if (transactionsResponse.ok) {
      console.log(`✅ Found ${transactionsData.data.length} recent transactions:`);
      const recentTransaction = transactionsData.data.find(t => 
        t.notes?.includes(receiptId) || t.receiptId === receiptId
      );
      
      if (recentTransaction) {
        console.log('   - Found matching transaction:', recentTransaction.transactionNumber);
      } else {
        console.log('   - No transaction found linked to this receipt');
      }
      
      transactionsData.data.slice(0, 3).forEach(transaction => {
        console.log(`   - ${transaction.transactionNumber}: $${transaction.amount} (${transaction.status})`);
      });
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testDetailedProcessing().catch(console.error);