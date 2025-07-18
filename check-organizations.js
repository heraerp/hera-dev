const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Check what organizations exist in the database
async function checkOrganizations() {
  console.log('🔍 Checking Available Organizations...\n');
  
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY;
  
  const supabaseAdmin = createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    },
    global: {
      headers: {
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`
      }
    }
  });
  
  console.log('🧪 Checking core_organizations table...');
  try {
    const { data: organizations, error: orgError } = await supabaseAdmin
      .from('core_organizations')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (orgError) {
      console.error('❌ Error reading organizations:', orgError);
    } else {
      console.log(`✅ Found ${organizations.length} organizations:`);
      organizations.forEach((org, index) => {
        console.log(`   ${index + 1}. ID: ${org.id}`);
        console.log(`      Name: ${org.org_name || org.name || 'N/A'}`);
        console.log(`      Type: ${org.industry || org.type || 'N/A'}`);
        console.log(`      Created: ${org.created_at}`);
        console.log('');
      });
      
      if (organizations.length > 0) {
        const firstOrg = organizations[0];
        console.log(`🎯 Most recent organization to use: ${firstOrg.id}`);
        
        // Test product creation with valid organization ID
        console.log('\n🧪 Testing product creation with valid organization ID...');
        const testProductId = crypto.randomUUID();
        
        const { data: entityData, error: entityError } = await supabaseAdmin
          .from('core_entities')
          .insert({
            id: testProductId,
            organization_id: firstOrg.id,
            entity_type: 'product',
            entity_name: 'Test Valid Org Product',
            entity_code: 'TEST-VALID-001',
            is_active: true
          })
          .select();
        
        if (entityError) {
          console.error('❌ Still failed with valid org ID:', {
            message: entityError.message,
            code: entityError.code
          });
        } else {
          console.log('✅ Success with valid org ID!', entityData[0]);
          
          // Test metadata creation
          const { data: metaData, error: metaError } = await supabaseAdmin
            .from('core_metadata')
            .insert({
              organization_id: firstOrg.id,
              entity_type: 'product',
              entity_id: testProductId,
              metadata_type: 'product_details',
              metadata_category: 'catalog',
              metadata_key: 'product_info',
              metadata_value: JSON.stringify({ test: 'data' }),
              is_system_generated: false,
              created_by: firstOrg.id
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
          console.log('✅ Test cleanup complete');
        }
      } else {
        console.log('❌ No organizations found! Products cannot be created without a valid organization.');
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkOrganizations();