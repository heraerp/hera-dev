/**
 * Test Customer Creation with Fixed Organization ID
 * 
 * This test verifies that customer creation works with the correct organization ID
 * and that the admin client is properly used for write operations.
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Setup admin client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    },
    global: {
      headers: {
        'apikey': process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY}`
      }
    }
  }
);

// Test with both organization IDs to verify which one works
const TEST_ORGS = [
  { id: '6fc73a3d-fe0a-45fa-9029-62a52df142e2', name: 'Old Org ID' },
  { id: '6b38ff1a-346b-4572-98ac-1bd64ddbc3de', name: 'New Org ID' }
];

async function testCustomerCreation() {
  console.log('🧪 Testing Customer Creation with Fixed Organization IDs');
  console.log('='.repeat(60));

  for (const testOrg of TEST_ORGS) {
    console.log(`\n🔍 Testing with ${testOrg.name}: ${testOrg.id}`);
    
    try {
      // Check if organization exists
      const { data: orgExists, error: orgError } = await supabaseAdmin
        .from('core_organizations')
        .select('id, org_name')
        .eq('id', testOrg.id)
        .single();

      if (orgError || !orgExists) {
        console.log(`❌ Organization ${testOrg.name} does not exist`);
        continue;
      }

      console.log(`✅ Organization exists: ${orgExists.org_name}`);

      // Test customer creation
      const testCustomerId = crypto.randomUUID();
      const testCustomerCode = 'TEST-' + Date.now().toString().slice(-4);

      console.log(`🚀 Creating test customer: ${testCustomerId}`);

      // Step 1: Create customer entity
      const { error: entityError } = await supabaseAdmin
        .from('core_entities')
        .insert({
          id: testCustomerId,
          organization_id: testOrg.id,
          entity_type: 'customer',
          entity_name: 'Test Customer for ' + testOrg.name,
          entity_code: testCustomerCode,
          is_active: true
        });

      if (entityError) {
        console.error(`❌ Failed to create customer entity:`, entityError);
        continue;
      }

      console.log(`✅ Customer entity created successfully`);

      // Step 2: Create customer metadata
      const metadata = {
        email: 'test@example.com',
        phone: '+1-555-0199',
        first_name: 'Test',
        last_name: 'Customer',
        customer_type: 'individual',
        birth_date: '1990-01-01',
        preferred_name: 'Test',
        acquisition_source: 'walk_in',
        preferred_contact_method: 'email',
        notes: 'Test customer for organization ID verification',
        total_visits: 0,
        lifetime_value: 0,
        average_order_value: 0,
        last_visit_date: new Date().toISOString().split('T')[0],
        loyalty_tier: 'bronze',
        loyalty_points: 0,
        favorite_teas: [],
        caffeine_preference: 'moderate',
        temperature_preference: 'both',
        dietary_restrictions: [],
        allergies: [],
        status: 'active',
        is_draft: false,
        created_by: 'test-system',
        updated_by: 'test-system'
      };

      const { error: metadataError } = await supabaseAdmin
        .from('core_metadata')
        .insert({
          organization_id: testOrg.id,
          entity_type: 'customer',
          entity_id: testCustomerId,
          metadata_type: 'customer_details',
          metadata_category: 'profile',
          metadata_key: 'customer_info',
          metadata_value: metadata,
          is_system_generated: false,
          created_by: '550e8400-e29b-41d4-a716-446655440010'
        });

      if (metadataError) {
        console.error(`❌ Failed to create customer metadata:`, metadataError);
        // Clean up the entity
        await supabaseAdmin.from('core_entities').delete().eq('id', testCustomerId);
        continue;
      }

      console.log(`✅ Customer metadata created successfully`);

      // Step 3: Verify customer was created
      const { data: createdCustomer, error: verifyError } = await supabaseAdmin
        .from('core_entities')
        .select('*')
        .eq('id', testCustomerId)
        .single();

      if (verifyError || !createdCustomer) {
        console.error(`❌ Failed to verify customer creation:`, verifyError);
        continue;
      }

      console.log(`✅ Customer verification successful: ${createdCustomer.entity_name}`);

      // Step 4: Test list customers
      const { data: customers, error: listError } = await supabaseAdmin
        .from('core_entities')
        .select('*')
        .eq('organization_id', testOrg.id)
        .eq('entity_type', 'customer');

      if (listError) {
        console.error(`❌ Failed to list customers:`, listError);
      } else {
        console.log(`✅ Customer list successful: ${customers.length} customers found`);
      }

      // Step 5: Clean up test customer
      await supabaseAdmin.from('core_metadata').delete().eq('entity_id', testCustomerId);
      await supabaseAdmin.from('core_entities').delete().eq('id', testCustomerId);
      console.log(`🧹 Test customer cleaned up`);

      console.log(`🎉 SUCCESS: Organization ${testOrg.name} works for customer creation!`);

    } catch (error) {
      console.error(`❌ Test failed for ${testOrg.name}:`, error);
    }
  }

  console.log('\n🎯 Test Summary:');
  console.log('If one organization works, use that ID in the frontend.');
  console.log('If both fail, check RLS policies and organization setup.');
}

// Run the test
testCustomerCreation().catch(console.error);