import { createClient } from '@/lib/supabase/client';
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Test product metadata creation specifically
async function testProductMetadata() {
  console.log('🔍 Testing Product Metadata Creation...\n');
  
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
  
  const testOrganizationId = 'f47ac10b-58cc-4372-a567-0e02b2c3d479'; // Sample org ID from the service
  const testProductId = crypto.randomUUID();
  
  console.log('🧪 Test 1: Creating a test product entity first...');
  try {
    const { data: entityData, error: entityError } = await supabaseAdmin
      .from('core_entities')
      .insert({
        id: testProductId,
        organization_id: testOrganizationId,
        entity_type: 'product',
        entity_name: 'Test Premium Jasmine Green Tea',
        entity_code: 'TEST-TEA-001',
        is_active: true
      })
      .select();
    
    if (entityError) {
      console.error('❌ Test 1 failed - Entity creation:', {
        message: entityError.message,
        code: entityError.code,
        details: entityError.details,
        hint: entityError.hint
      });
      return;
    }
    
    console.log('✅ Test 1 successful! Product entity created:', entityData[0]);
    
    // Test 2: Creating product metadata
    console.log('\n🧪 Test 2: Creating product metadata...');
    
    const sampleMetadata = {
      category: 'tea',
      description: 'Premium jasmine-scented green tea with delicate floral notes',
      product_type: 'finished_good',
      price: 4.50,
      cost_per_unit: 1.75,
      inventory_count: 100,
      minimum_stock: 10,
      unit_type: 'servings',
      preparation_time_minutes: 3,
      serving_temperature: 'Hot (70-80°C)',
      caffeine_level: 'Medium',
      calories: 2,
      allergens: 'None',
      origin: 'Fujian Province, China',
      supplier_name: 'Dragon Well Tea Co.',
      storage_requirements: 'Cool, dry place away from strong odors',
      shelf_life_days: 730,
      status: 'in_stock',
      is_draft: false,
      created_by: testOrganizationId,
      updated_by: testOrganizationId
    };
    
    const { data: metadataData, error: metadataError } = await supabaseAdmin
      .from('core_metadata')
      .insert({
        organization_id: testOrganizationId,
        entity_type: 'product',
        entity_id: testProductId,
        metadata_type: 'product_details',
        metadata_category: 'catalog',
        metadata_key: 'product_info',
        metadata_value: JSON.stringify(sampleMetadata),
        is_system_generated: false,
        created_by: testOrganizationId
      })
      .select();
    
    if (metadataError) {
      console.error('❌ Test 2 failed - Metadata creation:', {
        message: metadataError.message,
        code: metadataError.code,
        details: metadataError.details,
        hint: metadataError.hint
      });
    } else {
      console.log('✅ Test 2 successful! Metadata created:', metadataData[0]);
    }
    
    // Clean up
    console.log('\n🧹 Cleaning up test data...');
    await supabaseAdmin.from('core_metadata').delete().eq('entity_id', testProductId);
    await supabaseAdmin.from('core_entities').delete().eq('id', testProductId);
    console.log('✅ Cleanup complete');
    
  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

testProductMetadata();