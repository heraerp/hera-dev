const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Debug what the audit triggers actually need
async function debugAuditRequirements() {
  console.log('🔍 Debugging Audit Trigger Requirements...\n');
  
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
  
  console.log('🧪 Step 1: Check what users exist in core_users...');
  try {
    const { data: users, error: usersError } = await supabaseAdmin
      .from('core_users')
      .select('id, email, full_name')
      .limit(5);
    
    if (usersError) {
      console.error('❌ Error fetching users:', usersError);
    } else {
      console.log(`✅ Found ${users.length} users:`);
      users.forEach((user, index) => {
        console.log(`   ${index + 1}. ID: ${user.id}`);
        console.log(`      Email: ${user.email}`);
        console.log(`      Name: ${user.full_name}`);
        console.log('');
      });
      
      if (users.length > 0) {
        const testUser = users[0];
        console.log(`🎯 Using test user: ${testUser.email} (${testUser.id})`);
        
        // Get an organization
        const { data: orgs } = await supabaseAdmin
          .from('core_organizations')
          .select('*')
          .limit(1);
        
        if (orgs && orgs.length > 0) {
          const testOrg = orgs[0];
          console.log(`🎯 Using test org: ${testOrg.org_name} (${testOrg.id})`);
          
          console.log('\n🧪 Step 2: Test product creation with valid user ID...');
          const testProductId = crypto.randomUUID();
          
          // Try creating with changed_by as user ID
          const { data: entityData, error: entityError } = await supabaseAdmin
            .from('core_entities')
            .insert({
              id: testProductId,
              organization_id: testOrg.id,
              entity_type: 'product',
              entity_name: 'Test Audit Product',
              entity_code: 'TEST-AUDIT-001',
              is_active: true,
              changed_by: testUser.id // Use actual user ID
            })
            .select();
          
          if (entityError) {
            console.error('❌ Still failed with user ID:', {
              message: entityError.message,
              code: entityError.code,
              details: entityError.details
            });
            
            // Try without changed_by to see what happens
            console.log('\n🧪 Step 3: Try without changed_by field...');
            const testProductId2 = crypto.randomUUID();
            
            const { data: entityData2, error: entityError2 } = await supabaseAdmin
              .from('core_entities')
              .insert({
                id: testProductId2,
                organization_id: testOrg.id,
                entity_type: 'product',
                entity_name: 'Test No Audit Product',
                entity_code: 'TEST-NO-AUDIT-001',
                is_active: true
                // No changed_by field
              })
              .select();
            
            if (entityError2) {
              console.error('❌ Failed without changed_by too:', {
                message: entityError2.message,
                code: entityError2.code
              });
            } else {
              console.log('✅ Success without changed_by! Entity created:', entityData2[0]);
              
              // Clean up
              await supabaseAdmin.from('core_entities').delete().eq('id', testProductId2);
              console.log('✅ Cleanup complete');
            }
            
          } else {
            console.log('✅ Success with user ID! Entity created:', entityData[0]);
            
            // Test metadata creation
            console.log('\n🧪 Step 4: Test metadata creation with user ID...');
            const { data: metaData, error: metaError } = await supabaseAdmin
              .from('core_metadata')
              .insert({
                organization_id: testOrg.id,
                entity_type: 'product',
                entity_id: testProductId,
                metadata_type: 'product_details',
                metadata_category: 'catalog',
                metadata_key: 'product_info',
                metadata_value: JSON.stringify({ test: 'data' }),
                is_system_generated: false,
                created_by: testUser.id,
                changed_by: testUser.id // Use actual user ID
              })
              .select();
            
            if (metaError) {
              console.error('❌ Metadata failed:', metaError.message);
            } else {
              console.log('✅ Metadata success!', metaData[0]);
            }
            
            // Clean up
            await supabaseAdmin.from('core_metadata').delete().eq('entity_id', testProductId);
            await supabaseAdmin.from('core_entities').delete().eq('id', testProductId);
            console.log('✅ Cleanup complete');
          }
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

debugAuditRequirements();