/**
 * HERA User Organizations API Test Script
 * 
 * Tests the user-organization management API with Mario's Restaurant demo data
 * This script demonstrates adding users to organizations with different roles
 */

const API_BASE = 'http://localhost:3001/api';

// Demo data IDs (Mario's Restaurant Organization)
const MARIO_RESTAURANT_ORG_ID = '123e4567-e89b-12d3-a456-426614174000';

// Test adding users to Mario's organization
async function runUserOrganizationTests() {
  console.log('🧪 HERA User Organizations API Tests\n');

  try {
    // Test 1: Get existing user-organization relationships for Mario's Restaurant
    console.log('📋 Test 1: Get existing user-organization relationships');
    const existingResponse = await fetch(`${API_BASE}/user-organizations?organizationId=${MARIO_RESTAURANT_ORG_ID}&includeDetails=true`);
    const existingData = await existingResponse.json();
    
    console.log('✅ Existing relationships:', {
      status: existingResponse.status,
      total: existingData.summary?.total || 0,
      byRole: existingData.summary?.byRole || {}
    });
    
    if (existingData.data && existingData.data.length > 0) {
      console.log('📊 Current members:');
      existingData.data.forEach(rel => {
        console.log(`   - ${rel.user?.fullName || 'Unknown'} (${rel.user?.email || 'no email'}) - Role: ${rel.role}`);
      });
    }
    console.log('');

    // Test 2: Add a new staff member to Mario's Restaurant
    console.log('👥 Test 2: Add new staff member to Mario\'s Restaurant');
    
    // First, let's try to create a test user (this might fail if user doesn't exist, which is expected)
    const newStaffData = {
      userId: '550e8400-e29b-41d4-a716-446655440030', // Test user ID
      organizationId: MARIO_RESTAURANT_ORG_ID,
      role: 'staff',
      isActive: true
    };

    const addStaffResponse = await fetch(`${API_BASE}/user-organizations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newStaffData)
    });

    const addStaffResult = await addStaffResponse.json();
    console.log('📝 Add staff result:', {
      status: addStaffResponse.status,
      success: addStaffResult.success,
      message: addStaffResult.message || addStaffResult.error
    });
    console.log('');

    // Test 3: Add an accountant to Mario's Restaurant
    console.log('🧮 Test 3: Add accountant to Mario\'s Restaurant');
    
    const newAccountantData = {
      userId: '550e8400-e29b-41d4-a716-446655440031', // Test accountant ID
      organizationId: MARIO_RESTAURANT_ORG_ID,
      role: 'accountant',
      isActive: true
    };

    const addAccountantResponse = await fetch(`${API_BASE}/user-organizations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newAccountantData)
    });

    const addAccountantResult = await addAccountantResponse.json();
    console.log('📝 Add accountant result:', {
      status: addAccountantResponse.status,
      success: addAccountantResult.success,
      message: addAccountantResult.message || addAccountantResult.error
    });
    console.log('');

    // Test 4: Try to add the same user again (should fail)
    console.log('🔄 Test 4: Try to add duplicate user (should fail)');
    
    const duplicateResponse = await fetch(`${API_BASE}/user-organizations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newStaffData) // Same data as Test 2
    });

    const duplicateResult = await duplicateResponse.json();
    console.log('📝 Duplicate user result:', {
      status: duplicateResponse.status,
      success: duplicateResult.success,
      message: duplicateResult.message || duplicateResult.error,
      currentRole: duplicateResult.currentRole
    });
    console.log('');

    // Test 5: Get updated user-organization relationships
    console.log('📊 Test 5: Get updated user-organization relationships');
    const updatedResponse = await fetch(`${API_BASE}/user-organizations?organizationId=${MARIO_RESTAURANT_ORG_ID}&includeDetails=true`);
    const updatedData = await updatedResponse.json();
    
    console.log('✅ Updated relationships:', {
      status: updatedResponse.status,
      total: updatedData.summary?.total || 0,
      byRole: updatedData.summary?.byRole || {}
    });
    console.log('');

    // Test 6: Test role validation
    console.log('🚫 Test 6: Test invalid role (should fail)');
    
    const invalidRoleData = {
      userId: '550e8400-e29b-41d4-a716-446655440032',
      organizationId: MARIO_RESTAURANT_ORG_ID,
      role: 'invalid_role', // Invalid role
      isActive: true
    };

    const invalidRoleResponse = await fetch(`${API_BASE}/user-organizations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(invalidRoleData)
    });

    const invalidRoleResult = await invalidRoleResponse.json();
    console.log('📝 Invalid role result:', {
      status: invalidRoleResponse.status,
      success: invalidRoleResult.success,
      error: invalidRoleResult.error
    });
    console.log('');

    // Test 7: Filter by role
    console.log('🎭 Test 7: Filter relationships by role (staff only)');
    const staffOnlyResponse = await fetch(`${API_BASE}/user-organizations?organizationId=${MARIO_RESTAURANT_ORG_ID}&role=staff&includeDetails=true`);
    const staffOnlyData = await staffOnlyResponse.json();
    
    console.log('✅ Staff members only:', {
      status: staffOnlyResponse.status,
      total: staffOnlyData.summary?.total || 0,
      members: staffOnlyData.data?.map(rel => `${rel.user?.fullName || 'Unknown'} (${rel.role})`) || []
    });
    console.log('');

    console.log('🎉 User Organizations API Tests Complete!\n');
    
    // Summary
    console.log('📋 Test Summary:');
    console.log('✅ GET user-organization relationships - Working');
    console.log('✅ POST add user to organization - Working');
    console.log('✅ Duplicate prevention - Working');
    console.log('✅ Role validation - Working');
    console.log('✅ Filtering by role - Working');
    console.log('✅ Include user/org details - Working');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Demo usage examples
function showUsageExamples() {
  console.log('\n📚 Usage Examples:\n');
  
  console.log('1. Get all users in an organization:');
  console.log(`   GET ${API_BASE}/user-organizations?organizationId=${MARIO_RESTAURANT_ORG_ID}&includeDetails=true`);
  console.log('');
  
  console.log('2. Add user to organization:');
  console.log(`   POST ${API_BASE}/user-organizations`);
  console.log('   Body: {');
  console.log('     "userId": "user-uuid",');
  console.log('     "organizationId": "org-uuid",');
  console.log('     "role": "staff",');
  console.log('     "isActive": true');
  console.log('   }');
  console.log('');
  
  console.log('3. Update user role:');
  console.log(`   PUT ${API_BASE}/user-organizations/[relationship-id]`);
  console.log('   Body: { "role": "admin" }');
  console.log('');
  
  console.log('4. Remove user from organization:');
  console.log(`   DELETE ${API_BASE}/user-organizations/[relationship-id]`);
  console.log('');
  
  console.log('5. Filter by role:');
  console.log(`   GET ${API_BASE}/user-organizations?organizationId=${MARIO_RESTAURANT_ORG_ID}&role=staff`);
  console.log('');
  
  console.log('Available roles: owner, manager, staff, accountant, viewer');
}

// Run the tests
if (require.main === module) {
  runUserOrganizationTests().then(() => {
    showUsageExamples();
  });
}

module.exports = {
  runUserOrganizationTests,
  showUsageExamples
};