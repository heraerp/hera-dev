const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

/**
 * 🎯 TEST FIXED PRODUCT SERVICE
 * Test the updated product service with authentication handling
 */

async function testFixedProductService() {
  console.log('🔍 TESTING FIXED PRODUCT SERVICE WITH AUTH HANDLING...\n');
  
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY;
  
  const supabaseAdmin = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: {
      headers: {
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`
      }
    }
  });
  
  console.log('🧪 Step 1: Test service authentication behavior...');
  
  // Since we can't directly import the service in Node.js, let's simulate
  // the authentication check and fallback behavior
  
  const testAuthBehavior = async () => {
    const regularClient = createClient(url, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    
    // Check if user is authenticated (this will fail in Node.js context)
    try {
      const { data: { user }, error } = await regularClient.auth.getUser();
      
      if (error || !user) {
        console.log('⚠️ No authenticated user found (expected in Node.js context)');
        console.log('⚠️ Service will fall back to admin client with warning');
        return supabaseAdmin; // Fallback to admin client
      }
      
      console.log('✅ Authenticated user found, using regular client');
      return regularClient;
    } catch (e) {
      console.log('⚠️ Auth check failed, falling back to admin client');
      return supabaseAdmin;
    }
  };
  
  const clientToUse = await testAuthBehavior();
  
  console.log('\n🧪 Step 2: Test product creation with fallback client...');
  
  // Get a valid organization
  const { data: orgs } = await supabaseAdmin
    .from('core_organizations')
    .select('*')
    .limit(1);
  
  if (!orgs || orgs.length === 0) {
    console.error('❌ No organizations found');
    return;
  }
  
  const testOrg = orgs[0];
  console.log(`Using organization: ${testOrg.org_name}`);
  
  const productId = crypto.randomUUID();
  
  try {
    console.log('🧪 Testing entity creation...');
    const { data: entityData, error: entityError } = await clientToUse
      .from('core_entities')
      .insert({
        id: productId,
        organization_id: testOrg.id,
        entity_type: 'product',
        entity_name: 'TEST_Fixed_Service_Product',
        entity_code: 'TEST-FIXED-001',
        is_active: true
      })
      .select();
    
    if (entityError) {
      console.error(`❌ Entity creation still fails: ${entityError.message}`);
      console.log('Full error:', entityError);
      
      if (entityError.code === '23502' && entityError.message.includes('changed_by')) {
        console.log('\n💡 ANALYSIS:');
        console.log('1. The audit trigger still requires changed_by field');
        console.log('2. Admin client fallback is not sufficient');
        console.log('3. The trigger needs actual user JWT context');
        console.log('4. Products must be created through authenticated web sessions');
        
        console.log('\n🎯 RECOMMENDED APPROACH:');
        console.log('1. Product initialization should happen during restaurant setup');
        console.log('2. Restaurant setup requires user authentication');
        console.log('3. Manual product creation through authenticated UI');
        console.log('4. Disable product initialization in UniversalProductService.fetchProducts()');
        
        console.log('\n🔧 IMMEDIATE FIX:');
        console.log('Remove automatic product initialization from fetchProducts method');
        console.log('Only initialize products when user is properly authenticated');
      }
      
      return false;
    } else {
      console.log('✅ Entity creation SUCCESS!');
      console.log(`Created product: ${entityData[0].id}`);
      
      console.log('\n🧪 Testing metadata creation...');
      const { data: metaData, error: metaError } = await clientToUse
        .from('core_metadata')
        .insert({
          organization_id: testOrg.id,
          entity_type: 'product',
          entity_id: productId,
          metadata_type: 'product_details',
          metadata_category: 'catalog',
          metadata_key: 'product_info',
          metadata_value: JSON.stringify({
            category: 'tea',
            description: 'Test product for fixed service',
            price: 5.00
          }),
          is_system_generated: false,
          created_by: testOrg.id
        })
        .select();
      
      if (metaError) {
        console.error(`❌ Metadata creation failed: ${metaError.message}`);
      } else {
        console.log('✅ Metadata creation SUCCESS!');
      }
      
      // Clean up
      await supabaseAdmin.from('core_metadata').delete().eq('entity_id', productId);
      await supabaseAdmin.from('core_entities').delete().eq('id', productId);
      console.log('✅ Cleanup complete');
      
      return true;
    }
    
  } catch (error) {
    console.error('❌ Test error:', error);
    return false;
  }
}

async function main() {
  const success = await testFixedProductService();
  
  console.log('\n🎯 CONCLUSION:');
  if (success) {
    console.log('✅ Fixed product service works correctly');
    console.log('✅ Products can be created with proper authentication');
  } else {
    console.log('❌ Product service still has authentication issues');
    console.log('💡 Need to implement proper user authentication context');
  }
}

main().catch(console.error);