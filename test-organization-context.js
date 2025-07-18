/**
 * Test which organization ID the orders page will use
 */

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://yslviohidtyqjmyslekz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlzbHZpb2hpZHR5cWpteXNsZWt6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTg5MzUyMSwiZXhwIjoyMDY3NDY5NTIxfQ.VQtaWocR7DBq4mMI0eqhd1caB3HU0pGbSB1rbkB0iUI'
);

async function testOrganizationContext() {
  console.log('🔍 Testing organization context for orders page...');
  
  try {
    // The useRestaurantManagement hook checks:
    // 1. auth.users -> core_users -> user_organizations -> core_organizations
    
    // Check if we have any user_organizations links
    const { data: userOrgs, error: userOrgsError } = await supabase
      .from('user_organizations')
      .select(`
        id,
        user_id,
        organization_id,
        role,
        is_active,
        core_organizations (
          id,
          org_name,
          industry
        )
      `)
      .eq('is_active', true);
    
    if (userOrgsError) {
      console.error('❌ Failed to query user_organizations:', userOrgsError.message);
      return;
    }
    
    console.log(`\n📋 Found ${userOrgs.length} active user-organization links:`);
    userOrgs.forEach((link, index) => {
      console.log(`${index + 1}. User ${link.user_id} -> ${link.core_organizations?.org_name}`);
      console.log(`   Organization ID: ${link.organization_id}`);
      console.log(`   Role: ${link.role}`);
      console.log('');
    });
    
    if (userOrgs.length > 0) {
      const testOrgId = userOrgs[0].organization_id;
      console.log(`🎯 Testing products for organization: ${testOrgId}`);
      
      // Check if products exist for this organization
      const { data: products, error: productsError } = await supabase
        .from('core_entities')
        .select('id, entity_name')
        .eq('organization_id', testOrgId)
        .eq('entity_type', 'product')
        .eq('is_active', true);
      
      if (productsError) {
        console.error('❌ Failed to query products:', productsError.message);
      } else {
        console.log(`✅ Found ${products.length} products for this organization:`);
        products.forEach(p => console.log(`   - ${p.entity_name}`));
        
        if (products.length === 0) {
          console.log(`\n📝 No products found for organization ${testOrgId}.`);
          console.log('   Products were added to organization: 7cc09b11-34c5-4299-b392-01a54ff84092 (Demo Bakery)');
          console.log('   You may need to create a user-organization link for Demo Bakery.');
        }
      }
    } else {
      console.log('❌ No user-organization links found.');
      console.log('   The orders page needs a user to be linked to an organization.');
      console.log('   Visit: http://localhost:3000/setup/restaurant to create the link.');
    }
    
  } catch (error) {
    console.error('❌ Failed to test organization context:', error.message);
  }
}

testOrganizationContext().then(() => process.exit(0));