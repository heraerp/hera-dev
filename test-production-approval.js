/**
 * Test Production Approval System
 * 
 * Tests the approval system on the production build (port 3010)
 */

const testProductionApproval = async () => {
  console.log('🧪 Testing Current Approval System (Port 3000)\n');

  const baseURL = 'http://localhost:3000';
  const organizationId = '123e4567-e89b-12d3-a456-426614174000';
  
  try {
    // Test 1: Get all purchase orders
    console.log('1️⃣ Testing GET endpoint for purchase orders...');
    const getResponse = await fetch(`${baseURL}/api/purchasing/purchase-orders/approve?organizationId=${organizationId}&status=all`);
    
    if (!getResponse.ok) {
      throw new Error(`GET request failed: ${getResponse.status}`);
    }

    const data = await getResponse.json();
    console.log(`   ✅ Found ${data.data?.length || 0} purchase orders`);
    
    // Check supplier name resolution
    let suppliersWithNames = 0;
    let suppliersUnknown = 0;
    
    if (data.data && data.data.length > 0) {
      data.data.forEach(po => {
        if (po.supplierInfo?.supplierName && po.supplierInfo.supplierName !== 'Unknown Supplier') {
          suppliersWithNames++;
        } else {
          suppliersUnknown++;
        }
      });
      
      console.log(`   📊 Supplier Resolution: ${suppliersWithNames} resolved, ${suppliersUnknown} unknown`);
      
      // Show first few POs with details
      console.log('\n📋 Sample Purchase Orders:');
      data.data.slice(0, 3).forEach((po, index) => {
        console.log(`   ${index + 1}. ${po.poNumber} - ${po.supplierInfo?.supplierName || 'Unknown'} - $${po.amount} (${po.status})`);
      });
    }

    // Test 2: Find a pending PO and test approval
    console.log('\n2️⃣ Looking for pending approvals to test...');
    const pendingPOs = data.data?.filter(po => po.status === 'pending_approval') || [];
    
    if (pendingPOs.length > 0) {
      const testPO = pendingPOs[0];
      console.log(`   Found pending PO: ${testPO.poNumber} ($${testPO.amount})`);
      console.log(`   Supplier: ${testPO.supplierInfo?.supplierName || 'Unknown'}`);
      
      // Test approval action
      console.log('\n3️⃣ Testing approval action...');
      const approvalData = {
        poId: testPO.id,
        organizationId: organizationId,
        action: 'approve',
        approverId: '00000001-0000-0000-0000-000000000002',
        approverName: 'Chef Mario (Production Test)',
        notes: 'Approved via production test script'
      };

      const approvalResponse = await fetch(`${baseURL}/api/purchasing/purchase-orders/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(approvalData)
      });

      console.log(`   Response status: ${approvalResponse.status}`);
      const approvalResult = await approvalResponse.json();
      
      if (approvalResponse.ok) {
        console.log('   ✅ Approval action successful!');
        console.log(`   Result: ${JSON.stringify(approvalResult, null, 2)}`);
      } else {
        console.log('   ❌ Approval action failed');
        console.log(`   Error: ${JSON.stringify(approvalResult, null, 2)}`);
      }
    } else {
      console.log('   No pending purchase orders found for testing');
    }

    // Test 3: Summary statistics
    console.log('\n4️⃣ Current System Summary:');
    console.log(`   🌐 Server: ${baseURL}`);
    console.log(`   📊 Total POs: ${data.data?.length || 0}`);
    console.log(`   ⏳ Pending: ${pendingPOs.length}`);
    console.log(`   ✅ Supplier Resolution Rate: ${suppliersWithNames}/${(suppliersWithNames + suppliersUnknown)} (${Math.round(suppliersWithNames / (suppliersWithNames + suppliersUnknown) * 100)}%)`);
    
    if (data.summary) {
      console.log(`   💰 Total Value: $${data.summary.totalValue?.toLocaleString() || 0}`);
    }

  } catch (error) {
    console.error('\n❌ Production test failed:', error.message);
    
    if (error.message.includes('fetch')) {
      console.log('\n💡 Make sure the production server is running:');
      console.log('   PORT=3010 npm start');
    }
  }
};

// Run the test
testProductionApproval();