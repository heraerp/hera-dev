/**
 * Debug the exact auth flow that useRestaurantManagement uses
 */

const { createClient } = require('@supabase/supabase-js');

// Setup environment (same as frontend)
const supabase = createClient(
  'https://yslviohidtyqjmyslekz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlzbHZpb2hpZHR5cWpteXNsZWt6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4OTM1MjEsImV4cCI6MjA2NzQ2OTUyMX0.n2PsZnXJoK2Db78nKqQq2qIcB7rq3GdxUhTM6oXhOMk'
);

// Service role client (for RLS bypass)
const supabaseAdmin = createClient(
  'https://yslviohidtyqjmyslekz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlzbHZpb2hpZHR5cWpteXNsZWt6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTg5MzUyMSwiZXhwIjoyMDY3NDY5NTIxfQ.VQtaWocR7DBq4mMI0eqhd1caB3HU0pGbSB1rbkB0iUI'
);

async function debugAuthFlow() {
  console.log('🔍 Debugging auth flow for useRestaurantManagement...');
  
  try {
    // Step 1: Check if there are ANY auth users
    console.log('\n🔐 Step 1: Checking auth.users...');
    const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (authError) {
      console.error('❌ Failed to list auth users:', authError.message);
      return;
    }
    
    console.log(`✅ Found ${authUsers.users.length} auth users`);
    authUsers.users.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.email} (ID: ${user.id})`);
    });
    
    if (authUsers.users.length === 0) {
      console.log('❌ No auth users found. This explains why the component shows "Loading restaurant data..."');
      console.log('   You need to sign up or sign in to the application first.');
      return;
    }
    
    // Take the first user for testing
    const testUser = authUsers.users[0];
    console.log(`\n🎯 Testing with user: ${testUser.email} (${testUser.id})`);
    
    // Step 2: Find core_users record for this auth user
    console.log('\n🔍 Step 2: Finding core_users record...');
    const { data: coreUser, error: coreUserError } = await supabase
      .from('core_users')
      .select('id')
      .eq('auth_user_id', testUser.id)
      .single();
    
    if (coreUserError) {
      console.error('❌ Core user query error:', coreUserError.message);
      
      // Check if ANY core_users exist with auth_user_id
      const { data: allCoreUsers } = await supabase
        .from('core_users')
        .select('id, email, auth_user_id')
        .limit(10);
      
      console.log('\n📊 Sample core_users records:');
      allCoreUsers?.forEach((user, index) => {
        console.log(`   ${index + 1}. Email: ${user.email}, Auth ID: ${user.auth_user_id}`);
      });
      
      console.log('\n💡 SOLUTION: The auth user needs a corresponding core_users record.');
      console.log('   This usually happens during signup. Check the signup flow.');
      return;
    }
    
    console.log(`✅ Found core user: ${coreUser.id}`);
    
    // Step 3: Find user_organizations for this core user
    console.log('\n🔍 Step 3: Finding user_organizations...');
    const { data: userOrgLinks, error: userOrgError } = await supabase
      .from('user_organizations')
      .select('organization_id, role, is_active, created_at')
      .eq('user_id', coreUser.id);
    
    if (userOrgError) {
      console.error('❌ User organizations query error:', userOrgError.message);
      return;
    }
    
    console.log(`✅ Found ${userOrgLinks?.length || 0} organization links`);
    userOrgLinks?.forEach((link, index) => {
      console.log(`   ${index + 1}. Org: ${link.organization_id}, Role: ${link.role}, Active: ${link.is_active}`);
    });
    
    if (!userOrgLinks || userOrgLinks.length === 0) {
      console.log('\n💡 SOLUTION: This user needs to be linked to an organization.');
      console.log('   Go to: http://localhost:3001/setup/restaurant');
      return;
    }
    
    // Step 4: Get organization details
    console.log('\n🔍 Step 4: Getting organization details...');
    const organizationIds = userOrgLinks.map(link => link.organization_id);
    
    const { data: organizations, error: orgsError } = await supabaseAdmin
      .from('core_organizations')
      .select('id, org_name, org_code, industry, client_id, country, currency, is_active, created_at')
      .in('id', organizationIds);
    
    if (orgsError) {
      console.error('❌ Organizations query error:', orgsError.message);
      return;
    }
    
    console.log(`✅ Found ${organizations?.length || 0} organizations`);
    organizations?.forEach((org, index) => {
      console.log(`   ${index + 1}. ${org.org_name} (${org.industry}) - Active: ${org.is_active}`);
    });
    
    // Filter for restaurants
    const restaurants = organizations?.filter(org => org.industry === 'restaurant' && org.is_active) || [];
    console.log(`\n🍽️ Found ${restaurants.length} active restaurants`);
    
    if (restaurants.length === 0) {
      console.log('\n💡 SOLUTION: This user needs an active restaurant organization.');
      console.log('   Either set up a new restaurant or activate an existing one.');
      return;
    }
    
    console.log('\n🎉 AUTH FLOW SUCCESS!');
    console.log('✅ User has valid authentication and restaurant access');
    console.log('✅ The component should load properly');
    console.log('');
    console.log('🔍 If the component still shows "Loading...", check:');
    console.log('1. Browser localStorage for this user ID');
    console.log('2. Network requests in browser dev tools');
    console.log('3. Console logs in the useRestaurantManagement hook');
    
    // Show the data that should be loaded
    console.log('\n📊 Expected restaurant data:');
    restaurants.forEach((restaurant, index) => {
      const userLink = userOrgLinks.find(link => link.organization_id === restaurant.id);
      console.log(`   ${index + 1}. ${restaurant.org_name}`);
      console.log(`      - Organization ID: ${restaurant.id}`);
      console.log(`      - User Role: ${userLink?.role}`);
      console.log(`      - Industry: ${restaurant.industry}`);
    });
    
  } catch (error) {
    console.error('❌ Failed to debug auth flow:', error.message);
  }
}

debugAuthFlow().then(() => process.exit(0));
