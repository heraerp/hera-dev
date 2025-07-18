/**
 * Create a test user for orders page testing
 * Toyota Method: Simple solution to get orders page working
 */

const { createClient } = require('@supabase/supabase-js');
const { randomUUID } = require('crypto');

// Service role client
const supabase = createClient(
  'https://yslviohidtyqjmyslekz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlzbHZpb2hpZHR5cWpteXNsZWt6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTg5MzUyMSwiZXhwIjoyMDY3NDY5NTIxfQ.VQtaWocR7DBq4mMI0eqhd1caB3HU0pGbSB1rbkB0iUI'
);

async function createTestUser() {
  console.log('🏭 Toyota Method: Creating test user for orders page...');
  
  const testEmail = 'test@orders.com';
  const testPassword = 'test123456';
  
  try {
    // Step 1: Create auth user
    console.log('\n🔐 Step 1: Creating auth user...');
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true
    });
    
    if (authError) {
      if (authError.message.includes('already registered')) {
        console.log('✅ Auth user already exists');
        // Get existing auth user
        const { data: existingUsers } = await supabase.auth.admin.listUsers();
        const existingUser = existingUsers.users.find(u => u.email === testEmail);
        if (existingUser) {
          console.log('📧 Found existing auth user:', existingUser.id);
          await linkUserToOrganization(existingUser.id, testEmail);
          return;
        }
      }
      throw authError;
    }
    
    console.log('✅ Auth user created:', authUser.user.id);
    
    await linkUserToOrganization(authUser.user.id, testEmail);
    
  } catch (error) {
    console.error('❌ Failed to create test user:', error.message);
  }
}

async function linkUserToOrganization(authUserId, email) {
  console.log('\n🔗 Step 2: Creating core user...');
  
  const coreUserId = randomUUID();
  
  // Create core user
  const { error: coreUserError } = await supabase
    .from('core_users')
    .insert({
      id: coreUserId,
      email: email,
      full_name: 'Test User',
      auth_user_id: authUserId,
      user_role: 'owner',
      is_active: true
    });
  
  if (coreUserError) {
    if (coreUserError.message.includes('duplicate')) {
      console.log('✅ Core user already exists');
      // Find existing core user
      const { data: existingCore } = await supabase
        .from('core_users')
        .select('id')
        .eq('auth_user_id', authUserId)
        .single();
      
      if (existingCore) {
        await linkToOrganization(existingCore.id);
        return;
      }
    }
    throw coreUserError;
  }
  
  console.log('✅ Core user created:', coreUserId);
  
  await linkToOrganization(coreUserId);
}

async function linkToOrganization(coreUserId) {
  console.log('\n🏢 Step 3: Linking to Demo Bakery...');
  
  const organizationId = '7cc09b11-34c5-4299-b392-01a54ff84092'; // Demo Bakery
  
  // Check if link exists
  const { data: existing } = await supabase
    .from('user_organizations')
    .select('id')
    .eq('user_id', coreUserId)
    .eq('organization_id', organizationId)
    .single();
  
  if (existing) {
    console.log('✅ User-organization link already exists');
  } else {
    // Create link
    const { error: linkError } = await supabase
      .from('user_organizations')
      .insert({
        id: randomUUID(),
        user_id: coreUserId,
        organization_id: organizationId,
        role: 'owner',
        is_active: true
      });
    
    if (linkError) {
      throw linkError;
    }
    
    console.log('✅ User linked to Demo Bakery');
  }
  
  console.log('\n🎉 Test user setup complete!');
  console.log('\n📍 To test orders page:');
  console.log('1. Go to: http://localhost:3001/restaurant/signin');
  console.log('2. Sign in with: test@orders.com / test123456');
  console.log('3. Navigate to: http://localhost:3001/restaurant/orders');
  console.log('4. You should see Demo Bakery with 10 products');
}

createTestUser().then(() => process.exit(0));
