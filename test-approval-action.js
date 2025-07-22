/**
 * Test Purchase Order Approval Action
 * 
 * Tests the approval POST endpoint to see if it's working
 */

const testApprovalAction = async () => {
  console.log('🧪 Testing Purchase Order Approval Action\n');

  const baseURL = 'http://localhost:3005';
  const organizationId = '123e4567-e89b-12d3-a456-426614174000';
  
  try {
    // First, get pending POs to find one to test
    console.log('1️⃣ Getting pending approvals...');
    const getResponse = await fetch(`${baseURL}/api/purchasing/purchase-orders/approve?organizationId=${organizationId}&status=pending_approval`);
    
    if (!getResponse.ok) {
      throw new Error(`GET request failed: ${getResponse.status}`);
    }

    const pendingData = await getResponse.json();
    console.log('   Pending POs found:', pendingData.data?.length || 0);

    if (!pendingData.data || pendingData.data.length === 0) {
      console.log('   No pending POs found for testing');
      
      // Let's try to find ANY PO to test with
      console.log('\n🔍 Looking for any PO to test...');
      const allResponse = await fetch(`${baseURL}/api/purchasing/purchase-orders/approve?organizationId=${organizationId}&status=all`);
      const allData = await allResponse.json();
      
      if (allData.data && allData.data.length > 0) {
        const testPO = allData.data[0];
        console.log(`   Found PO for testing: ${testPO.poNumber} (Status: ${testPO.status})`);
        
        // Test with this PO
        await testApprovalEndpoint(baseURL, organizationId, testPO.id, testPO.poNumber);
      } else {
        console.log('   No POs found at all');
      }
      return;
    }

    const testPO = pendingData.data[0];
    console.log(`   Testing with PO: ${testPO.poNumber} ($${testPO.amount})`);
    console.log(`   Supplier: ${testPO.supplierInfo?.supplierName}`);
    console.log(`   Current Status: ${testPO.status}`);

    // Test the approval action
    await testApprovalEndpoint(baseURL, organizationId, testPO.id, testPO.poNumber);

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    
    if (error.message.includes('fetch')) {
      console.log('\n💡 Make sure the development server is running:');
      console.log('   npm run dev');
    }
  }
};

const testApprovalEndpoint = async (baseURL, organizationId, poId, poNumber) => {
  try {
    console.log(`\n2️⃣ Testing approval action for ${poNumber}...`);
    
    const approvalData = {
      poId: poId,
      organizationId: organizationId,
      action: 'approve',
      approverId: '00000001-0000-0000-0000-000000000002',
      approverName: 'Chef Mario',
      notes: 'Approved via test script'
    };

    console.log('   Request payload:', JSON.stringify(approvalData, null, 2));

    const postResponse = await fetch(`${baseURL}/api/purchasing/purchase-orders/approve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(approvalData)
    });

    console.log('   Response status:', postResponse.status);
    console.log('   Response headers:', Object.fromEntries(postResponse.headers.entries()));

    const responseText = await postResponse.text();
    console.log('   Response body:', responseText);

    if (postResponse.ok) {
      const result = JSON.parse(responseText);
      console.log('   ✅ Approval successful!');
      console.log('   Result:', result);
    } else {
      console.log('   ❌ Approval failed');
      console.log('   Status:', postResponse.status, postResponse.statusText);
      
      try {
        const errorData = JSON.parse(responseText);
        console.log('   Error details:', errorData);
      } catch (e) {
        console.log('   Raw error response:', responseText);
      }
    }

  } catch (error) {
    console.error('   ❌ Request failed:', error.message);
  }
};

// Run the test
testApprovalAction();