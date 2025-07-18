import { createClient } from '@/lib/supabase/client';
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Test product creation with the fixed service
async function testProductCreation() {
  console.log('🔍 Testing Product Creation with Admin Client...\n');
  
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
  
  const testOrganizationId = '00000000-0000-0000-0000-000000000000'; // Dummy org ID
  
  console.log('🧪 Test 1: Creating a test product entity...');
  try {
    const productId = crypto.randomUUID();
    const { data, error } = await supabaseAdmin
      .from('core_entities')
      .insert({
        id: productId,
        organization_id: testOrganizationId,
        entity_type: 'product',
        entity_name: 'Test Product',
        entity_code: 'TEST-PROD-001',
        is_active: true
      })
      .select();
    
    if (error) {
      console.error('❌ Test 1 failed:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
    } else {
      console.log('✅ Test 1 successful! Product entity created:', data[0]);
      
      // Test metadata creation
      console.log('\n🧪 Test 2: Creating product metadata...');
      const { data: metadataData, error: metadataError } = await supabaseAdmin
        .from('core_metadata')
        .insert({
          organization_id: testOrganizationId,
          entity_type: 'product',
          entity_id: productId,
          metadata_type: 'product_details',
          metadata_category: 'catalog',
          metadata_key: 'product_info',
          metadata_value: JSON.stringify({
            category: 'tea',
            description: 'Test product for verification',
            price: 10.99,
            inventory_count: 50
          }),
          is_system_generated: false,
          created_by: testOrganizationId
        })
        .select();
      
      if (metadataError) {
        console.error('❌ Test 2 failed:', {
          message: metadataError.message,
          code: metadataError.code,
          details: metadataError.details
        });
      } else {
        console.log('✅ Test 2 successful! Metadata created:', metadataData[0]);
      }
      
      // Clean up
      console.log('\n🧹 Cleaning up test data...');
      await supabaseAdmin.from('core_metadata').delete().eq('entity_id', productId);
      await supabaseAdmin.from('core_entities').delete().eq('id', productId);
      console.log('✅ Cleanup complete');
    }
    
  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

testProductCreation();