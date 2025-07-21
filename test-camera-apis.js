#!/usr/bin/env node
/**
 * Test script for cash market camera APIs
 * Tests the full flow: vendors -> receipts -> AI processing -> transactions
 */

const BASE_URL = 'http://localhost:3000';
const MARIO_ORG_ID = '123e4567-e89b-12d3-a456-426614174000';

async function testAPIFlow() {
  console.log('🧪 Testing Cash Market Camera API Flow...\n');

  try {
    // Test 1: Get existing vendors
    console.log('1️⃣ Testing GET /api/cash-market/vendors...');
    const vendorsResponse = await fetch(`${BASE_URL}/api/cash-market/vendors?organizationId=${MARIO_ORG_ID}`);
    const vendorsData = await vendorsResponse.json();
    
    if (vendorsResponse.ok) {
      console.log(`✅ Found ${vendorsData.data.length} vendors:`);
      vendorsData.data.forEach(vendor => {
        console.log(`   - ${vendor.name} (${vendor.category || 'No category'})`);
      });
    } else {
      console.log('❌ Vendors API failed:', vendorsData);
      return;
    }

    // Test 2: Create a test receipt
    console.log('\n2️⃣ Testing POST /api/cash-market/receipts...');
    const receiptData = {
      organizationId: MARIO_ORG_ID,
      filename: 'test_receipt_camera.jpg',
      imageUrl: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/vQBUVRVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV/9k=', // Minimal test image
      uploadedBy: 'Test User',
      processingStatus: 'processing',
      notes: 'Test receipt from camera API flow'
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

    // Test 3: Process the receipt with AI
    console.log('\n3️⃣ Testing POST /api/cash-market/receipts/[id]/process...');
    const processResponse = await fetch(`${BASE_URL}/api/cash-market/receipts/${receiptResult.data.id}/process`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        organizationId: MARIO_ORG_ID
      })
    });
    const processResult = await processResponse.json();

    if (!processResponse.ok) {
      console.log('❌ Receipt processing failed:', processResult);
      return;
    }

    console.log('✅ Receipt processed:', {
      confidence: processResult.data.confidence,
      vendor: processResult.data.aiResults?.vendor,
      amount: processResult.data.aiResults?.amount,
      autoCreated: processResult.data.autoCreatedTransaction ? 'YES' : 'NO'
    });

    // Test 4: Get transactions to verify auto-creation
    console.log('\n4️⃣ Testing GET /api/cash-market/transactions...');
    const transactionsResponse = await fetch(`${BASE_URL}/api/cash-market/transactions?organizationId=${MARIO_ORG_ID}&limit=5`);
    const transactionsData = await transactionsResponse.json();

    if (transactionsResponse.ok) {
      console.log(`✅ Found ${transactionsData.data.length} recent transactions:`);
      transactionsData.data.slice(0, 3).forEach(transaction => {
        console.log(`   - ${transaction.transactionNumber}: $${transaction.amount} (${transaction.status})`);
      });
    } else {
      console.log('❌ Transactions API failed:', transactionsData);
    }

    console.log('\n🎉 Camera API Flow Test Complete!');
    console.log('\n📱 Ready to test camera capture in browser at: http://localhost:3000/digital-accountant/cash-market');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testAPIFlow().catch(console.error);