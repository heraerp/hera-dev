/**
 * Test Supabase Auth Configuration
 */

const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY;

console.log('Testing Supabase Auth Configuration...');
console.log('URL:', supabaseUrl);
console.log('Service Key:', supabaseServiceKey ? 'Found' : 'Missing');

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase configuration');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testAuth() {
  try {
    // Test 1: List existing users
    console.log('\n1. Testing admin.listUsers()...');
    const { data: users, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.error('❌ List users error:', listError.message);
    } else {
      console.log('✅ Can list users. Current count:', users?.users?.length || 0);
    }

    // Test 2: Try to create a test user
    console.log('\n2. Testing admin.createUser()...');
    const testEmail = `test-${Date.now()}@example.com`;
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: 'testpass123',
      email_confirm: true
    });

    if (createError) {
      console.error('❌ Create user error:', createError.message);
    } else {
      console.log('✅ Created test user:', newUser.user?.email);
      
      // Clean up - delete test user
      if (newUser.user?.id) {
        await supabase.auth.admin.deleteUser(newUser.user.id);
        console.log('✅ Cleaned up test user');
      }
    }

    // Test 3: Check if regular signUp works
    console.log('\n3. Testing regular signUp()...');
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: `signup-${Date.now()}@example.com`,
      password: 'testpass123'
    });

    if (signUpError) {
      console.error('❌ SignUp error:', signUpError.message);
    } else {
      console.log('✅ Regular signUp works:', signUpData.user?.email);
    }

    // Test 4: Check auth settings
    console.log('\n4. Checking database tables...');
    const { data: orgData, error: orgError } = await supabase
      .from('core_organizations')
      .select('count')
      .limit(1);

    if (orgError) {
      console.error('❌ Cannot access core_organizations:', orgError.message);
    } else {
      console.log('✅ Can access core_organizations table');
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

testAuth();