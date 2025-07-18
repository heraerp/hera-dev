const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://yslviohidtyqjmyslekz.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlzbHZpb2hpZHR5cWpteXNsZWt6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTg5MzUyMSwiZXhwIjoyMDY3NDY5NTIxfQ.VQtaWocR7DBq4mMI0eqhd1caB3HU0pGbSB1rbkB0iUI');

async function testUserFlow() {
  console.log('🔍 Testing user flow for santhoshlal@gmail.com...');
  const authUserId = 'e78b82f2-f3bf-430e-915b-9cb22a76dfb6';
  
  // Step 1: Get core user
  const { data: coreUser } = await supabase
    .from('core_users')
    .select('id')
    .eq('auth_user_id', authUserId)
    .single();
  
  if (!coreUser) { 
    console.log('❌ No core user found'); 
    return; 
  }
  
  console.log('✅ Core user ID:', coreUser.id);
  
  // Step 2: Get user organizations  
  const { data: userOrgs } = await supabase
    .from('user_organizations')
    .select('organization_id, role, is_active')
    .eq('user_id', coreUser.id);
  
  console.log('📋 User organizations:', userOrgs?.length || 0);
  userOrgs?.forEach(org => {
    console.log(`   - ${org.organization_id} (${org.role}) - Active: ${org.is_active}`);
  });
  
  if (userOrgs?.length > 0) {
    // Step 3: Get organization details
    const orgIds = userOrgs.map(o => o.organization_id);
    const { data: orgs } = await supabase
      .from('core_organizations')
      .select('id, org_name, industry, is_active')
      .in('id', orgIds);
    
    console.log('🏢 Organizations:');
    orgs?.forEach(org => {
      console.log(`   - ${org.org_name} (${org.industry}) - Active: ${org.is_active}`);
    });
    
    // Step 4: Filter for restaurants
    const restaurants = orgs?.filter(org => org.industry === 'restaurant' && org.is_active) || [];
    console.log(`🍽️ Active restaurants: ${restaurants.length}`);
    
    if (restaurants.length > 0) {
      console.log('✅ This user should have working restaurant access!');
      console.log('🎯 Expected organization ID:', restaurants[0].id);
    } else {
      console.log('❌ No active restaurants found for this user');
    }
  } else {
    console.log('❌ No organization links found');
  }
}

testUserFlow().then(() => process.exit(0));
