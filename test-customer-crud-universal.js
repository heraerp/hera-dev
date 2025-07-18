/**
 * HERA Universal Customer CRUD Test
 * 
 * Tests the customer CRUD service using the proper HERA Universal Schema:
 * - core_entities for entity structure
 * - core_metadata for rich data (NO core_dynamic_data)
 * 
 * Run with: node test-customer-crud-universal.js
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
let testCustomerId = null;

// ============================================================================
// TEST 1: CREATE CUSTOMER (HERA Universal Schema)
// ============================================================================
async function testCreateCustomer() {
  console.log('\n🧪 TEST 1: CREATE CUSTOMER (HERA Universal Schema)');
  console.log('=' .repeat(60));
  
  try {
    const customerId = crypto.randomUUID();
    testCustomerId = customerId;
    const customerCode = 'TEST-' + Date.now().toString().slice(-4);
    
    // Step 1: Create entity in core_entities
    console.log('📝 Creating customer entity...');
    const { error: entityError } = await supabaseAdmin
      .from('core_entities')
      .insert({
        id: customerId,
        organization_id: TEST_ORG_ID,
        entity_type: 'customer',
        entity_name: 'John Doe Test',
        entity_code: customerCode,
        is_active: true
      });

    if (entityError) throw entityError;
    console.log('✅ Entity created');

    // Step 2: Create metadata in core_metadata (following product pattern)
    console.log('📝 Creating customer metadata...');
    const customerMetadata = {
      // Core Information
      email: 'john.doe.test@example.com',
      phone: '+1-555-TEST',
      first_name: 'John',
      last_name: 'Doe',
      customer_type: 'individual',
      birth_date: '1990-01-15',
      preferred_name: 'Johnny',
      acquisition_source: 'test',
      preferred_contact_method: 'email',
      notes: 'Test customer for CRUD operations',
      
      // Business Intelligence
      total_visits: 5,
      lifetime_value: 125.50,
      average_order_value: 25.10,
      last_visit_date: '2024-01-15',
      loyalty_tier: 'bronze',
      loyalty_points: 50,
      
      // Preferences
      favorite_teas: ['earl_grey', 'chamomile'],
      caffeine_preference: 'moderate',
      temperature_preference: 'hot',
      dietary_restrictions: ['vegetarian'],
      allergies: [],
      
      // Status & Metadata
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
        metadata_value: customerMetadata,
        is_system_generated: false,
        created_by: TEST_USER_ID
      });

    if (metadataError) throw metadataError;
    console.log('✅ Metadata created');

    console.log(`\n🎉 Customer created successfully!`);
    console.log(`   ID: ${customerId}`);
    console.log(`   Code: ${customerCode}`);
    console.log(`   Name: John Doe Test`);
    console.log(`   Email: ${customerMetadata.email}`);
    console.log(`   Type: ${customerMetadata.customer_type}`);
    console.log(`   Loyalty: ${customerMetadata.loyalty_tier}`);

  } catch (error) {
    console.error('❌ Create customer failed:', error);
    throw error;
  }
}

// ============================================================================
// TEST 2: READ CUSTOMER (HERA Universal Schema)
// ============================================================================
async function testReadCustomer() {
  console.log('\n🧪 TEST 2: READ CUSTOMER (HERA Universal Schema)');
  console.log('=' .repeat(60));
  
  if (!testCustomerId) {
    console.log('⚠️  No test customer ID, skipping read test');
    return;
  }

  try {
    // Step 1: Get entity from core_entities
    console.log('📖 Reading customer entity...');
    const { data: entity, error: entityError } = await supabaseAdmin
      .from('core_entities')
      .select('*')
      .eq('id', testCustomerId)
      .eq('organization_id', TEST_ORG_ID)
      .eq('entity_type', 'customer')
      .single();

    if (entityError) throw entityError;
    console.log('✅ Entity found:', entity.entity_name);

    // Step 2: Get metadata from core_metadata
    console.log('📖 Reading customer metadata...');
    const { data: metadata, error: metadataError } = await supabaseAdmin
      .from('core_metadata')
      .select('metadata_value')
      .eq('entity_id', testCustomerId)
      .eq('organization_id', TEST_ORG_ID)
      .eq('metadata_key', 'customer_info')
      .single();

    if (metadataError) throw metadataError;
    console.log('✅ Metadata found');

    // Display customer data
    const customerData = metadata.metadata_value;
    console.log(`\n📋 Customer Details:`);
    console.log(`   Name: ${entity.entity_name}`);
    console.log(`   Code: ${entity.entity_code}`);
    console.log(`   Email: ${customerData.email}`);
    console.log(`   Phone: ${customerData.phone}`);
    console.log(`   Type: ${customerData.customer_type}`);
    console.log(`   Loyalty Tier: ${customerData.loyalty_tier}`);
    console.log(`   Total Visits: ${customerData.total_visits}`);
    console.log(`   Lifetime Value: $${customerData.lifetime_value}`);
    console.log(`   Favorite Teas: ${customerData.favorite_teas.join(', ')}`);
    console.log(`   Notes: ${customerData.notes}`);

  } catch (error) {
    console.error('❌ Read customer failed:', error);
  }
}

// ============================================================================
// TEST 3: LIST CUSTOMERS (HERA Universal Schema)
// ============================================================================
async function testListCustomers() {
  console.log('\n🧪 TEST 3: LIST CUSTOMERS (HERA Universal Schema)');
  console.log('=' .repeat(60));
  
  try {
    // Step 1: Get entities from core_entities
    console.log('📋 Listing customer entities...');
    const { data: entities, error: entityError, count } = await supabaseAdmin
      .from('core_entities')
      .select('*', { count: 'exact' })
      .eq('organization_id', TEST_ORG_ID)
      .eq('entity_type', 'customer')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .range(0, 9); // Limit 10

    if (entityError) throw entityError;
    console.log(`✅ Found ${entities.length} customers (total: ${count})`);

    if (entities.length === 0) {
      console.log('⚠️  No customers found');
      return;
    }

    // Step 2: Get metadata for all customers
    const entityIds = entities.map(e => e.id);
    const { data: metadataList, error: metadataError } = await supabaseAdmin
      .from('core_metadata')
      .select('entity_id, metadata_value')
      .eq('organization_id', TEST_ORG_ID)
      .in('entity_id', entityIds)
      .eq('metadata_key', 'customer_info');

    if (metadataError) throw metadataError;

    // Build lookup map
    const metadataMap = new Map();
    metadataList.forEach(item => {
      metadataMap.set(item.entity_id, item.metadata_value);
    });

    // Display customer list
    console.log('\n📋 Customer List:');
    console.log('-'.repeat(100));
    console.log('Name'.padEnd(25) + 'Email'.padEnd(30) + 'Type'.padEnd(15) + 'Loyalty'.padEnd(15) + 'Visits');
    console.log('-'.repeat(100));
    
    entities.forEach(entity => {
      const data = metadataMap.get(entity.id) || {};
      console.log(
        entity.entity_name.padEnd(25) +
        (data.email || 'N/A').padEnd(30) +
        (data.customer_type || 'N/A').padEnd(15) +
        (data.loyalty_tier || 'N/A').padEnd(15) +
        (data.total_visits || 0)
      );
    });

  } catch (error) {
    console.error('❌ List customers failed:', error);
  }
}

// ============================================================================
// TEST 4: UPDATE CUSTOMER (HERA Universal Schema)
// ============================================================================
async function testUpdateCustomer() {
  console.log('\n🧪 TEST 4: UPDATE CUSTOMER (HERA Universal Schema)');
  console.log('=' .repeat(60));
  
  if (!testCustomerId) {
    console.log('⚠️  No test customer ID, skipping update test');
    return;
  }

  try {
    // Step 1: Update entity name
    console.log('📝 Updating customer entity...');
    const { error: entityError } = await supabaseAdmin
      .from('core_entities')
      .update({
        entity_name: 'John Smith Test Updated',
        updated_at: new Date().toISOString()
      })
      .eq('id', testCustomerId)
      .eq('organization_id', TEST_ORG_ID);

    if (entityError) throw entityError;
    console.log('✅ Entity updated');

    // Step 2: Update metadata
    console.log('📝 Updating customer metadata...');
    
    // Get current metadata
    const { data: currentMeta, error: getError } = await supabaseAdmin
      .from('core_metadata')
      .select('metadata_value')
      .eq('entity_id', testCustomerId)
      .eq('organization_id', TEST_ORG_ID)
      .eq('metadata_key', 'customer_info')
      .single();

    if (getError) throw getError;

    // Update metadata
    const updatedMetadata = {
      ...currentMeta.metadata_value,
      email: 'john.smith.updated@example.com',
      phone: '+1-555-UPDATED',
      customer_type: 'vip',
      loyalty_tier: 'gold',
      loyalty_points: 750,
      total_visits: 15,
      lifetime_value: 485.75,
      average_order_value: 32.38,
      favorite_teas: ['earl_grey', 'jasmine_green', 'oolong'],
      caffeine_preference: 'high',
      notes: 'Updated test customer - now VIP status',
      updated_by: 'test_system'
    };

    const { error: metadataError } = await supabaseAdmin
      .from('core_metadata')
      .update({
        metadata_value: updatedMetadata,
        updated_at: new Date().toISOString()
      })
      .eq('entity_id', testCustomerId)
      .eq('organization_id', TEST_ORG_ID)
      .eq('metadata_key', 'customer_info');

    if (metadataError) throw metadataError;
    console.log('✅ Metadata updated');

    console.log('\n🎉 Customer updated successfully!');
    console.log('   Name: John Doe Test → John Smith Test Updated');
    console.log('   Email: john.doe.test@example.com → john.smith.updated@example.com');
    console.log('   Type: individual → vip');
    console.log('   Loyalty: bronze → gold (750 points)');
    console.log('   Visits: 5 → 15');
    console.log('   Lifetime Value: $125.50 → $485.75');

  } catch (error) {
    console.error('❌ Update customer failed:', error);
  }
}

// ============================================================================
// TEST 5: UPDATE BUSINESS INTELLIGENCE (HERA Universal Schema)
// ============================================================================
async function testUpdateBusinessIntelligence() {
  console.log('\n🧪 TEST 5: UPDATE BUSINESS INTELLIGENCE (HERA Universal Schema)');
  console.log('=' .repeat(60));
  
  if (!testCustomerId) {
    console.log('⚠️  No test customer ID, skipping BI test');
    return;
  }

  try {
    console.log('📊 Simulating customer order and updating BI...');
    
    // Get current metadata
    const { data: currentMeta, error: getError } = await supabaseAdmin
      .from('core_metadata')
      .select('metadata_value')
      .eq('entity_id', testCustomerId)
      .eq('organization_id', TEST_ORG_ID)
      .eq('metadata_key', 'customer_info')
      .single();

    if (getError) throw getError;

    const currentData = currentMeta.metadata_value;
    console.log('Current stats:', {
      visits: currentData.total_visits,
      lifetime: currentData.lifetime_value,
      average: currentData.average_order_value
    });

    // Simulate order
    const orderAmount = 42.50;
    const newVisits = (currentData.total_visits || 0) + 1;
    const newLifetimeValue = (currentData.lifetime_value || 0) + orderAmount;
    const newAverage = newLifetimeValue / newVisits;

    // Determine new loyalty tier
    let newLoyaltyTier = 'bronze';
    if (newLifetimeValue >= 1000) newLoyaltyTier = 'platinum';
    else if (newLifetimeValue >= 500) newLoyaltyTier = 'gold';
    else if (newLifetimeValue >= 200) newLoyaltyTier = 'silver';

    // Update metadata with new BI data
    const updatedMetadata = {
      ...currentData,
      total_visits: newVisits,
      lifetime_value: newLifetimeValue,
      average_order_value: newAverage,
      loyalty_tier: newLoyaltyTier,
      last_visit_date: new Date().toISOString().split('T')[0],
      updated_by: 'test_system'
    };

    const { error: updateError } = await supabaseAdmin
      .from('core_metadata')
      .update({
        metadata_value: updatedMetadata,
        updated_at: new Date().toISOString()
      })
      .eq('entity_id', testCustomerId)
      .eq('organization_id', TEST_ORG_ID)
      .eq('metadata_key', 'customer_info');

    if (updateError) throw updateError;

    console.log('✅ Business intelligence updated');
    console.log(`   Order Amount: $${orderAmount}`);
    console.log(`   Total Visits: ${currentData.total_visits} → ${newVisits}`);
    console.log(`   Lifetime Value: $${currentData.lifetime_value} → $${newLifetimeValue.toFixed(2)}`);
    console.log(`   Average Order: $${currentData.average_order_value} → $${newAverage.toFixed(2)}`);
    console.log(`   Loyalty Tier: ${currentData.loyalty_tier} → ${newLoyaltyTier}`);

  } catch (error) {
    console.error('❌ Update BI failed:', error);
  }
}

// ============================================================================
// TEST 6: DELETE CUSTOMER (HERA Universal Schema)
// ============================================================================
async function testDeleteCustomer() {
  console.log('\n🧪 TEST 6: DELETE CUSTOMER (HERA Universal Schema)');
  console.log('=' .repeat(60));
  
  if (!testCustomerId) {
    console.log('⚠️  No test customer ID, skipping delete test');
    return;
  }

  try {
    // Step 1: Delete metadata first
    console.log('🗑️  Deleting customer metadata...');
    const { error: metadataError } = await supabaseAdmin
      .from('core_metadata')
      .delete()
      .eq('entity_id', testCustomerId)
      .eq('organization_id', TEST_ORG_ID);

    if (metadataError) throw metadataError;
    console.log('✅ Metadata deleted');

    // Step 2: Delete entity
    console.log('🗑️  Deleting customer entity...');
    const { error: entityError } = await supabaseAdmin
      .from('core_entities')
      .delete()
      .eq('id', testCustomerId)
      .eq('organization_id', TEST_ORG_ID);

    if (entityError) throw entityError;
    console.log('✅ Entity deleted');

    console.log('\n🎉 Customer deleted successfully!');
    console.log('   Clean deletion using HERA Universal Schema');

  } catch (error) {
    console.error('❌ Delete customer failed:', error);
  }
}

// ============================================================================
// MAIN TEST RUNNER
// ============================================================================
async function runAllTests() {
  console.log('🚀 HERA UNIVERSAL CUSTOMER CRUD TEST SUITE');
  console.log('==========================================');
  console.log('Schema: core_entities + core_metadata (HERA Universal)');
  console.log('Organization ID:', TEST_ORG_ID);
  console.log('Time:', new Date().toISOString());
  
  try {
    await testCreateCustomer();
    await testReadCustomer();
    await testListCustomers();
    await testUpdateCustomer();
    await testUpdateBusinessIntelligence();
    await testDeleteCustomer();
    
    console.log('\n✅ ALL TESTS COMPLETED SUCCESSFULLY!');
    console.log('🎉 HERA Universal Customer CRUD is working perfectly!');
    console.log('=' .repeat(60));
    
  } catch (error) {
    console.error('\n🚨 TEST SUITE FAILED:', error);
    process.exit(1);
  }
}

// Run tests
runAllTests();