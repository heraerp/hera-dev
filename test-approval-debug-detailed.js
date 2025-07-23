/**
 * Test Detailed Approval Debug
 * 
 * Debug the exact issue with approval updates
 */

const testDetailedApproval = async () => {
  console.log('🔍 Detailed Approval Debug\n');

  const baseURL = 'http://localhost:3000';
  const organizationId = '123e4567-e89b-12d3-a456-426614174000';
  
  try {
    // Get a pending PO
    console.log('1️⃣ Getting pending PO...');
    const getResponse = await fetch(`${baseURL}/api/purchasing/purchase-orders/approve?organizationId=${organizationId}&status=pending_approval`);
    const data = await getResponse.json();
    
    if (!data.data || data.data.length === 0) {
      console.log('   No pending POs found');
      return;
    }

    const testPO = data.data[0];
    console.log(`   Testing PO: ${testPO.poNumber} ($${testPO.amount})`);
    console.log(`   Current Status: ${testPO.status}`);
    console.log(`   Required Level: ${testPO.approvalLevel}`);

    // Test with Owner approval (tier_3)
    console.log('\n2️⃣ Testing with Owner approval...');
    
    const approvalData = {
      poId: testPO.id,
      organizationId: organizationId,
      action: 'approve',
      approverId: '00000001-0000-0000-0000-000000000004', // Antonio Rossi (Owner)
      approverName: 'Antonio Rossi (Debug Test)',
      notes: 'Final approval via debug test'
    };

    console.log('   Request:', JSON.stringify(approvalData, null, 2));

    const approvalResponse = await fetch(`${baseURL}/api/purchasing/purchase-orders/approve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(approvalData)
    });

    const responseText = await approvalResponse.text();
    console.log(`   Status: ${approvalResponse.status}`);
    console.log(`   Response: ${responseText}`);

    if (approvalResponse.ok) {
      const result = JSON.parse(responseText);
      console.log('\n✅ Success! Checking if status actually changed...');
      
      // Wait a moment then check the PO status
      setTimeout(async () => {
        try {
          const checkResponse = await fetch(`${baseURL}/api/purchasing/purchase-orders/approve?organizationId=${organizationId}&status=all`);
          const checkData = await checkResponse.json();
          const updatedPO = checkData.data.find(po => po.id === testPO.id);
          
          console.log(`   Updated PO Status: ${updatedPO?.status}`);
          console.log(`   Should be: approved`);
          console.log(`   Status Changed: ${updatedPO?.status === 'approved' ? '✅ YES' : '❌ NO'}`);
        } catch (error) {
          console.error('   Error checking updated status:', error.message);
        }
      }, 1000);
    } else {
      console.log('\n❌ Failed');
      try {
        const errorData = JSON.parse(responseText);
        console.log('   Error details:', errorData);
      } catch (e) {
        console.log('   Raw error:', responseText);
      }
    }

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
  }
};

// Run the test
testDetailedApproval();