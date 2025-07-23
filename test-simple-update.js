/**
 * Test Simple Database Update
 * 
 * Test if we can update just the status field
 */

const testSimpleUpdate = async () => {
  console.log('🔧 Testing Simple Database Update\n');

  const baseURL = 'http://localhost:3000';
  const organizationId = '123e4567-e89b-12d3-a456-426614174000';
  
  try {
    // Create a simple test endpoint to just update the status
    console.log('1️⃣ Testing direct status update...');
    
    const testData = {
      test: true,
      poId: '6812afe7-3614-4aab-9bde-2ad5d9719b89',
      organizationId: organizationId,
      action: 'approve',
      approverId: 'test-user'
    };

    const response = await fetch(`${baseURL}/api/purchasing/purchase-orders/approve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    const responseText = await response.text();
    console.log(`   Status: ${response.status}`);
    console.log(`   Response: ${responseText}`);

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
  }
};

// Run the test
testSimpleUpdate();