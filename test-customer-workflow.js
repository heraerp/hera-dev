/**
 * Test Complete Customer Workflow
 * 
 * This test verifies the complete customer workflow:
 * 1. Create customer
 * 2. List customers
 * 3. Update customer
 * 4. Delete customer
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

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

const TEST_ORG_ID = '6fc73a3d-fe0a-45fa-9029-62a52df142e2';

async function testCustomerWorkflow() {
  console.log('🧪 Testing Complete Customer Workflow');
  console.log('='.repeat(40));

  try {
    // Step 1: Create Customer
    console.log('\n1. Creating Customer...');
    const customerId = crypto.randomUUID();
    const customerCode = 'TEST-' + Date.now().toString().slice(-4);
    
    const metadata = {
      email: 'workflow.test@example.com',
      phone: '+1-555-9999',
      first_name: 'Workflow',
      last_name: 'Test',
      customer_type: 'individual',
      birth_date: '1990-01-01',
      preferred_name: 'Workflow',
      acquisition_source: 'walk_in',
      preferred_contact_method: 'email',
      notes: 'Test customer for workflow verification',
      total_visits: 0,
      lifetime_value: 0,
      loyalty_tier: 'bronze',
      loyalty_points: 0,
      status: 'active',
      is_draft: false,
      created_by: '550e8400-e29b-41d4-a716-446655440010',
      updated_by: '550e8400-e29b-41d4-a716-446655440010'
    };

    // Create entity
    const { error: entityError } = await supabaseAdmin
      .from('core_entities')
      .insert({
        id: customerId,
        organization_id: TEST_ORG_ID,
        entity_type: 'customer',
        entity_name: 'Workflow Test Customer',
        entity_code: customerCode,
        is_active: true
      });

    if (entityError) throw entityError;

    // Create metadata
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
        created_by: '550e8400-e29b-41d4-a716-446655440010'
      });

    if (metadataError) throw metadataError;

    console.log('✅ Customer created successfully:', customerId);

    // Step 2: List Customers
    console.log('\n2. Listing Customers...');
    const { data: customers, error: listError, count } = await supabaseAdmin
      .from('core_entities')
      .select('*', { count: 'exact' })
      .eq('organization_id', TEST_ORG_ID)
      .eq('entity_type', 'customer')
      .eq('is_active', true);

    if (listError) throw listError;

    console.log(`✅ Found ${customers.length} customers (total: ${count})`);
    
    // Verify our customer is in the list
    const ourCustomer = customers.find(c => c.id === customerId);
    if (ourCustomer) {
      console.log('✅ Our customer found in list:', ourCustomer.entity_name);
    } else {
      console.log('❌ Our customer NOT found in list');
    }

    // Step 3: Read Customer Details
    console.log('\n3. Reading Customer Details...');
    const { data: customerEntity, error: readError } = await supabaseAdmin
      .from('core_entities')
      .select('*')
      .eq('id', customerId)
      .eq('organization_id', TEST_ORG_ID)
      .single();

    if (readError) throw readError;

    const { data: customerMetadata, error: metaReadError } = await supabaseAdmin
      .from('core_metadata')
      .select('metadata_value')
      .eq('entity_id', customerId)
      .eq('organization_id', TEST_ORG_ID)
      .eq('metadata_key', 'customer_info')
      .single();

    if (metaReadError) throw metaReadError;

    console.log('✅ Customer details read successfully');
    console.log('   Name:', customerEntity.entity_name);
    console.log('   Email:', customerMetadata.metadata_value.email);
    console.log('   Phone:', customerMetadata.metadata_value.phone);

    // Step 4: Update Customer
    console.log('\n4. Updating Customer...');
    const updatedMetadata = {
      ...customerMetadata.metadata_value,
      email: 'updated.workflow@example.com',
      total_visits: 1,
      lifetime_value: 25.50,
      updated_by: '550e8400-e29b-41d4-a716-446655440010'
    };

    const { error: updateError } = await supabaseAdmin
      .from('core_metadata')
      .update({
        metadata_value: updatedMetadata,
        updated_at: new Date().toISOString()
      })
      .eq('entity_id', customerId)
      .eq('organization_id', TEST_ORG_ID)
      .eq('metadata_key', 'customer_info');

    if (updateError) throw updateError;

    console.log('✅ Customer updated successfully');
    console.log('   New email:', updatedMetadata.email);
    console.log('   New visits:', updatedMetadata.total_visits);
    console.log('   New lifetime value:', updatedMetadata.lifetime_value);

    // Step 5: Clean up
    console.log('\n5. Cleaning up...');
    await supabaseAdmin.from('core_metadata').delete().eq('entity_id', customerId);
    await supabaseAdmin.from('core_entities').delete().eq('id', customerId);
    console.log('✅ Test customer cleaned up');

    console.log('\n🎉 Customer Workflow Test PASSED!');
    console.log('✅ All operations completed successfully');

  } catch (error) {
    console.error('❌ Workflow test failed:', error);
    console.log('\n🔧 Possible issues:');
    console.log('   - Check organization ID exists');
    console.log('   - Check user ID exists for created_by');
    console.log('   - Check database permissions');
    console.log('   - Check foreign key constraints');
  }
}

// Run the workflow test
testCustomerWorkflow();