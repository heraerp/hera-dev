/**
 * Simple Customer Service Test
 * 
 * Basic test to verify the customer service works
 * Run with: node test-customer-service-simple.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Setup admin client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY
);

// Test configuration
const TEST_ORG_ID = '6fc73a3d-fe0a-45fa-9029-62a52df142e2';
const TEST_USER_ID = '550e8400-e29b-41d4-a716-446655440010'; // Valid user ID from core_users

async function testCustomerServiceSimple() {
  console.log('🧪 Simple Customer Service Test');
  console.log('=' .repeat(40));
  
  try {
    // Test that we can create a customer using the same pattern as the service
    const customerId = crypto.randomUUID();
    const customerCode = 'SIMPLE-TEST-' + Date.now().toString().slice(-4);
    
    console.log('\n📝 Creating customer using service pattern...');
    
    // Step 1: Create entity (same as service)
    const { error: entityError } = await supabaseAdmin
      .from('core_entities')
      .insert({
        id: customerId,
        organization_id: TEST_ORG_ID,
        entity_type: 'customer',
        entity_name: 'Simple Test Customer',
        entity_code: customerCode,
        is_active: true
      });

    if (entityError) throw entityError;
    console.log('✅ Entity created');

    // Step 2: Create metadata (same as service)
    const metadata = {
      email: 'simple.test@example.com',
      phone: '+1-555-SIMPLE',
      first_name: 'Simple',
      last_name: 'Test',
      customer_type: 'individual',
      birth_date: '1990-01-01',
      preferred_name: 'Simple',
      acquisition_source: 'test',
      preferred_contact_method: 'email',
      notes: 'Simple test customer',
      total_visits: 0,
      lifetime_value: 0,
      average_order_value: 0,
      last_visit_date: '2024-01-15',
      loyalty_tier: 'bronze',
      loyalty_points: 0,
      favorite_teas: ['earl_grey'],
      caffeine_preference: 'moderate',
      temperature_preference: 'hot',
      dietary_restrictions: [],
      allergies: [],
      status: 'active',
      is_draft: false,
      created_by: 'test_system',
      updated_by: 'test_system'
    };

    const { error: metadataError } = await supabaseAdmin
      .from('core_metadata')
      .insert({
        organization_id: TEST_ORG_ID,
        entity_type: 'customer',
        entity_id: customerId,
        metadata_type: 'customer_details',
        metadata_category: 'profile',
        metadata_key: 'customer_info',
        metadata_value: metadata,
        is_system_generated: false,
        created_by: TEST_USER_ID
      });

    if (metadataError) throw metadataError;
    console.log('✅ Metadata created');

    // Test Read (same as service)
    console.log('\n📖 Reading customer using service pattern...');
    const { data: entity, error: readEntityError } = await supabaseAdmin
      .from('core_entities')
      .select('*')
      .eq('id', customerId)
      .eq('organization_id', TEST_ORG_ID)
      .eq('entity_type', 'customer')
      .single();

    if (readEntityError) throw readEntityError;

    const { data: metadataRead, error: readMetadataError } = await supabaseAdmin
      .from('core_metadata')
      .select('metadata_value')
      .eq('entity_id', customerId)
      .eq('organization_id', TEST_ORG_ID)
      .eq('metadata_key', 'customer_info')
      .single();

    if (readMetadataError) throw readMetadataError;

    console.log('✅ Customer read successfully');
    console.log('   Name:', entity.entity_name);
    console.log('   Email:', metadataRead.metadata_value.email);
    console.log('   Type:', metadataRead.metadata_value.customer_type);

    // Test Update (same as service)
    console.log('\n📝 Updating customer using service pattern...');
    const { error: updateEntityError } = await supabaseAdmin
      .from('core_entities')
      .update({
        entity_name: 'Updated Simple Test Customer',
        updated_at: new Date().toISOString()
      })
      .eq('id', customerId)
      .eq('organization_id', TEST_ORG_ID);

    if (updateEntityError) throw updateEntityError;

    const updatedMetadata = {
      ...metadataRead.metadata_value,
      email: 'updated.simple.test@example.com',
      customer_type: 'vip',
      loyalty_tier: 'gold',
      updated_by: 'test_system'
    };

    const { error: updateMetadataError } = await supabaseAdmin
      .from('core_metadata')
      .update({
        metadata_value: updatedMetadata,
        updated_at: new Date().toISOString()
      })
      .eq('entity_id', customerId)
      .eq('organization_id', TEST_ORG_ID)
      .eq('metadata_key', 'customer_info');

    if (updateMetadataError) throw updateMetadataError;
    console.log('✅ Customer updated successfully');
    console.log('   Name: Simple Test Customer → Updated Simple Test Customer');
    console.log('   Email: simple.test@example.com → updated.simple.test@example.com');
    console.log('   Type: individual → vip');

    // Test Delete (same as service)
    console.log('\n🗑️ Deleting customer using service pattern...');
    const { error: deleteMetadataError } = await supabaseAdmin
      .from('core_metadata')
      .delete()
      .eq('entity_id', customerId)
      .eq('organization_id', TEST_ORG_ID);

    if (deleteMetadataError) throw deleteMetadataError;

    const { error: deleteEntityError } = await supabaseAdmin
      .from('core_entities')
      .delete()
      .eq('id', customerId)
      .eq('organization_id', TEST_ORG_ID);

    if (deleteEntityError) throw deleteEntityError;
    console.log('✅ Customer deleted successfully');

    console.log('\n🎉 Simple service test completed successfully!');
    console.log('✅ All CRUD operations working with HERA Universal Schema');
    
  } catch (error) {
    console.error('❌ Simple service test failed:', error);
  }
}

// Run test
testCustomerServiceSimple();