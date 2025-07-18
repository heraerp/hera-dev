/**
 * Complete Customer CRUD Test Suite
 * Tests all CRUD operations using direct Supabase SQL
 * 
 * Run with: node test-customer-crud-complete.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Setup admin client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY
);

// Test configuration
const TEST_ORG_ID = '6fc73a3d-fe0a-45fa-9029-62a52df142e2'; // Your test organization ID
let testCustomerId = null;

// Utility functions
function generateCustomerCode(name) {
  const baseCode = name.replace(/[^A-Z0-9]/gi, '').toUpperCase().slice(0, 8);
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `CUST-${baseCode}-${random}`;
}

// ============================================================================
// TEST 1: CREATE CUSTOMER
// ============================================================================
async function testCreateCustomer() {
  console.log('\n🧪 TEST 1: CREATE CUSTOMER');
  console.log('=' .repeat(50));
  
  try {
    const customerId = crypto.randomUUID();
    testCustomerId = customerId; // Save for other tests
    const customerCode = generateCustomerCode('John Doe');
    
    // Step 1: Create entity
    console.log('📝 Creating customer entity...');
    const { error: entityError } = await supabaseAdmin
      .from('core_entities')
      .insert({
        id: customerId,
        organization_id: TEST_ORG_ID,
        entity_type: 'customer',
        entity_name: 'John Doe',
        entity_code: customerCode,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (entityError) throw entityError;
    console.log('✅ Entity created');

    // Step 2: Create dynamic data
    console.log('📝 Creating dynamic data...');
    const dynamicData = [
      { field_name: 'email', field_value: 'john.doe@example.com', field_type: 'email' },
      { field_name: 'phone', field_value: '+1-555-1234', field_type: 'phone' },
      { field_name: 'first_name', field_value: 'John', field_type: 'text' },
      { field_name: 'last_name', field_value: 'Doe', field_type: 'text' },
      { field_name: 'customer_type', field_value: 'individual', field_type: 'text' },
      { field_name: 'birth_date', field_value: '1990-01-15', field_type: 'date' },
      { field_name: 'preferred_name', field_value: 'Johnny', field_type: 'text' },
      { field_name: 'acquisition_source', field_value: 'referral', field_type: 'text' },
      { field_name: 'preferred_contact_method', field_value: 'email', field_type: 'text' },
      { field_name: 'notes', field_value: 'VIP customer, loves Earl Grey', field_type: 'text' },
      { field_name: 'total_visits', field_value: '0', field_type: 'number' },
      { field_name: 'lifetime_value', field_value: '0.00', field_type: 'number' },
      { field_name: 'loyalty_tier', field_value: 'bronze', field_type: 'text' },
      { field_name: 'loyalty_points', field_value: '0', field_type: 'number' }
    ];

    const { error: dataError } = await supabaseAdmin
      .from('core_dynamic_data')
      .insert(dynamicData.map(item => ({
        entity_id: customerId,
        ...item
      })));

    if (dataError) throw dataError;
    console.log('✅ Dynamic data created');

    // Step 3: Create metadata
    console.log('📝 Creating preferences metadata...');
    const preferences = {
      favorite_teas: ['earl_grey', 'english_breakfast', 'chamomile'],
      caffeine_preference: 'moderate',
      temperature_preference: 'hot',
      dietary_restrictions: ['gluten_free'],
      allergies: []
    };

    const { error: metaError } = await supabaseAdmin
      .from('core_metadata')
      .insert({
        organization_id: TEST_ORG_ID,
        entity_type: 'customer',
        entity_id: customerId,
        metadata_type: 'customer_preferences',
        metadata_category: 'preferences',
        metadata_key: 'taste_preferences',
        metadata_value: preferences,
        is_system_generated: false,
        is_user_editable: true,
        is_searchable: true,
        is_encrypted: false,
        effective_from: new Date().toISOString(),
        is_active: true,
        version: 1,
        created_by: customerId,
        updated_at: new Date().toISOString()
      });

    if (metaError) throw metaError;
    console.log('✅ Metadata created');

    console.log(`\n🎉 Customer created successfully!`);
    console.log(`   ID: ${customerId}`);
    console.log(`   Code: ${customerCode}`);
    console.log(`   Name: John Doe`);
    console.log(`   Email: john.doe@example.com`);

  } catch (error) {
    console.error('❌ Create customer failed:', error);
    throw error;
  }
}

// ============================================================================
// TEST 2: READ CUSTOMER
// ============================================================================
async function testReadCustomer() {
  console.log('\n🧪 TEST 2: READ CUSTOMER');
  console.log('=' .repeat(50));
  
  if (!testCustomerId) {
    console.log('⚠️  No test customer ID, skipping read test');
    return;
  }

  try {
    // Step 1: Get entity
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

    // Step 2: Get dynamic data
    console.log('📖 Reading dynamic data...');
    const { data: dynamicData, error: dynamicError } = await supabaseAdmin
      .from('core_dynamic_data')
      .select('field_name, field_value, field_type')
      .eq('entity_id', testCustomerId);

    if (dynamicError) throw dynamicError;
    
    const fields = {};
    dynamicData.forEach(item => {
      fields[item.field_name] = item.field_type === 'number' 
        ? Number(item.field_value) 
        : item.field_value;
    });
    
    console.log('✅ Dynamic data fields:', Object.keys(fields).length);

    // Step 3: Get metadata
    console.log('📖 Reading metadata...');
    const { data: metadata, error: metaError } = await supabaseAdmin
      .from('core_metadata')
      .select('metadata_key, metadata_value')
      .eq('entity_id', testCustomerId)
      .eq('organization_id', TEST_ORG_ID);

    if (metaError) throw metaError;
    
    const preferences = metadata.find(m => m.metadata_key === 'taste_preferences');
    const parsedPrefs = preferences ? preferences.metadata_value : null;
    
    console.log('✅ Metadata found');

    // Display customer data
    console.log(`\n📋 Customer Details:`);
    console.log(`   Name: ${entity.entity_name}`);
    console.log(`   Code: ${entity.entity_code}`);
    console.log(`   Email: ${fields.email}`);
    console.log(`   Phone: ${fields.phone}`);
    console.log(`   Type: ${fields.customer_type}`);
    console.log(`   Loyalty Tier: ${fields.loyalty_tier}`);
    console.log(`   Preferred Name: ${fields.preferred_name}`);
    console.log(`   Notes: ${fields.notes}`);
    
    if (parsedPrefs) {
      console.log(`   Favorite Teas: ${parsedPrefs.favorite_teas.join(', ')}`);
      console.log(`   Caffeine Preference: ${parsedPrefs.caffeine_preference}`);
    }

  } catch (error) {
    console.error('❌ Read customer failed:', error);
  }
}

// ============================================================================
// TEST 3: LIST CUSTOMERS
// ============================================================================
async function testListCustomers() {
  console.log('\n🧪 TEST 3: LIST CUSTOMERS');
  console.log('=' .repeat(50));
  
  try {
    // Step 1: Get entities with pagination
    console.log('📋 Listing customers (page 1, limit 10)...');
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

    // Step 2: Get dynamic data for all
    const entityIds = entities.map(e => e.id);
    const { data: dynamicData, error: dynamicError } = await supabaseAdmin
      .from('core_dynamic_data')
      .select('entity_id, field_name, field_value, field_type')
      .in('entity_id', entityIds);

    if (dynamicError) throw dynamicError;

    // Build lookup map
    const dataMap = new Map();
    dynamicData.forEach(item => {
      if (!dataMap.has(item.entity_id)) {
        dataMap.set(item.entity_id, {});
      }
      dataMap.get(item.entity_id)[item.field_name] = item.field_value;
    });

    // Display customer list
    console.log('\n📋 Customer List:');
    console.log('-'.repeat(80));
    console.log('Name'.padEnd(25) + 'Email'.padEnd(30) + 'Type'.padEnd(15) + 'Loyalty');
    console.log('-'.repeat(80));
    
    entities.forEach(entity => {
      const data = dataMap.get(entity.id) || {};
      console.log(
        entity.entity_name.padEnd(25) +
        (data.email || 'N/A').padEnd(30) +
        (data.customer_type || 'N/A').padEnd(15) +
        (data.loyalty_tier || 'N/A')
      );
    });

  } catch (error) {
    console.error('❌ List customers failed:', error);
  }
}

// ============================================================================
// TEST 4: UPDATE CUSTOMER
// ============================================================================
async function testUpdateCustomer() {
  console.log('\n🧪 TEST 4: UPDATE CUSTOMER');
  console.log('=' .repeat(50));
  
  if (!testCustomerId) {
    console.log('⚠️  No test customer ID, skipping update test');
    return;
  }

  try {
    // Step 1: Update entity
    console.log('📝 Updating customer entity...');
    const { error: entityError } = await supabaseAdmin
      .from('core_entities')
      .update({
        entity_name: 'John Smith',
        updated_at: new Date().toISOString()
      })
      .eq('id', testCustomerId)
      .eq('organization_id', TEST_ORG_ID);

    if (entityError) throw entityError;
    console.log('✅ Entity updated');

    // Step 2: Update dynamic data
    console.log('📝 Updating dynamic data...');
    const updates = [
      { field_name: 'email', field_value: 'john.smith@example.com' },
      { field_name: 'phone', field_value: '+1-555-5678' },
      { field_name: 'last_name', field_value: 'Smith' },
      { field_name: 'customer_type', field_value: 'vip' },
      { field_name: 'loyalty_tier', field_value: 'gold' },
      { field_name: 'loyalty_points', field_value: '250' }
    ];

    for (const update of updates) {
      const { error } = await supabaseAdmin
        .from('core_dynamic_data')
        .upsert({
          entity_id: testCustomerId,
          field_name: update.field_name,
          field_value: update.field_value,
          field_type: update.field_name === 'loyalty_points' ? 'number' : 'text'
        }, {
          onConflict: 'entity_id,field_name'
        });

      if (error) throw error;
    }
    console.log('✅ Dynamic data updated');

    // Step 3: Update preferences
    console.log('📝 Updating preferences...');
    const updatedPreferences = {
      favorite_teas: ['earl_grey', 'jasmine_green', 'oolong'],
      caffeine_preference: 'high',
      temperature_preference: 'both',
      dietary_restrictions: ['gluten_free', 'dairy_free'],
      allergies: ['nuts']
    };

    const { error: metaError } = await supabaseAdmin
      .from('core_metadata')
      .upsert({
        organization_id: TEST_ORG_ID,
        entity_type: 'customer',
        entity_id: testCustomerId,
        metadata_type: 'customer_preferences',
        metadata_category: 'preferences',
        metadata_key: 'taste_preferences',
        metadata_value: updatedPreferences,
        is_system_generated: false,
        is_user_editable: true,
        is_searchable: true,
        is_encrypted: false,
        effective_from: new Date().toISOString(),
        is_active: true,
        version: 1,
        updated_at: new Date().toISOString(),
        updated_by: testCustomerId
      }, {
        onConflict: 'entity_id,metadata_key'
      });

    if (metaError) throw metaError;
    console.log('✅ Preferences updated');

    console.log('\n🎉 Customer updated successfully!');
    console.log('   Name: John Doe → John Smith');
    console.log('   Email: john.doe@example.com → john.smith@example.com');
    console.log('   Type: individual → vip');
    console.log('   Loyalty: bronze → gold (250 points)');

  } catch (error) {
    console.error('❌ Update customer failed:', error);
  }
}

// ============================================================================
// TEST 5: UPDATE BUSINESS INTELLIGENCE
// ============================================================================
async function testUpdateBusinessIntelligence() {
  console.log('\n🧪 TEST 5: UPDATE BUSINESS INTELLIGENCE');
  console.log('=' .repeat(50));
  
  if (!testCustomerId) {
    console.log('⚠️  No test customer ID, skipping BI test');
    return;
  }

  try {
    console.log('📊 Simulating customer order...');
    
    // Get current stats
    const { data: currentData, error: getError } = await supabaseAdmin
      .from('core_dynamic_data')
      .select('field_name, field_value')
      .eq('entity_id', testCustomerId)
      .in('field_name', ['total_visits', 'lifetime_value', 'average_order_value']);

    if (getError) throw getError;

    const currentStats = {};
    currentData.forEach(item => {
      currentStats[item.field_name] = Number(item.field_value) || 0;
    });

    console.log('Current stats:', currentStats);

    // Simulate order
    const orderAmount = 35.50;
    const newVisits = (currentStats.total_visits || 0) + 1;
    const newLifetimeValue = (currentStats.lifetime_value || 0) + orderAmount;
    const newAverage = newLifetimeValue / newVisits;

    // Update stats
    const updates = [
      { field_name: 'total_visits', field_value: newVisits.toString() },
      { field_name: 'lifetime_value', field_value: newLifetimeValue.toFixed(2) },
      { field_name: 'average_order_value', field_value: newAverage.toFixed(2) },
      { field_name: 'last_visit_date', field_value: new Date().toISOString().split('T')[0] }
    ];

    for (const update of updates) {
      const { error } = await supabaseAdmin
        .from('core_dynamic_data')
        .upsert({
          entity_id: testCustomerId,
          field_name: update.field_name,
          field_value: update.field_value,
          field_type: 'number'
        }, {
          onConflict: 'entity_id,field_name'
        });

      if (error) throw error;
    }

    console.log('✅ Business intelligence updated');
    console.log(`   Total Visits: ${currentStats.total_visits || 0} → ${newVisits}`);
    console.log(`   Lifetime Value: $${(currentStats.lifetime_value || 0).toFixed(2)} → $${newLifetimeValue.toFixed(2)}`);
    console.log(`   Average Order: $${(currentStats.average_order_value || 0).toFixed(2)} → $${newAverage.toFixed(2)}`);

  } catch (error) {
    console.error('❌ Update BI failed:', error);
  }
}

// ============================================================================
// TEST 6: DELETE CUSTOMER
// ============================================================================
async function testDeleteCustomer() {
  console.log('\n🧪 TEST 6: DELETE CUSTOMER');
  console.log('=' .repeat(50));
  
  if (!testCustomerId) {
    console.log('⚠️  No test customer ID, skipping delete test');
    return;
  }

  try {
    // Step 1: Delete metadata
    console.log('🗑️  Deleting metadata...');
    const { error: metaError } = await supabaseAdmin
      .from('core_metadata')
      .delete()
      .eq('entity_id', testCustomerId)
      .eq('organization_id', TEST_ORG_ID);

    if (metaError) throw metaError;
    console.log('✅ Metadata deleted');

    // Step 2: Delete dynamic data
    console.log('🗑️  Deleting dynamic data...');
    const { error: dataError } = await supabaseAdmin
      .from('core_dynamic_data')
      .delete()
      .eq('entity_id', testCustomerId);

    if (dataError) throw dataError;
    console.log('✅ Dynamic data deleted');

    // Step 3: Delete entity
    console.log('🗑️  Deleting entity...');
    const { error: entityError } = await supabaseAdmin
      .from('core_entities')
      .delete()
      .eq('id', testCustomerId)
      .eq('organization_id', TEST_ORG_ID);

    if (entityError) throw entityError;
    console.log('✅ Entity deleted');

    console.log('\n🎉 Customer deleted successfully!');

  } catch (error) {
    console.error('❌ Delete customer failed:', error);
  }
}

// ============================================================================
// MAIN TEST RUNNER
// ============================================================================
async function runAllTests() {
  console.log('🚀 HERA CUSTOMER CRUD TEST SUITE');
  console.log('================================');
  console.log('Organization ID:', TEST_ORG_ID);
  console.log('Time:', new Date().toISOString());
  
  try {
    await testCreateCustomer();
    await testReadCustomer();
    await testListCustomers();
    await testUpdateCustomer();
    await testUpdateBusinessIntelligence();
    await testDeleteCustomer();
    
    console.log('\n✅ ALL TESTS COMPLETED!');
    console.log('=' .repeat(50));
    
  } catch (error) {
    console.error('\n🚨 TEST SUITE FAILED:', error);
    process.exit(1);
  }
}

// Run tests
runAllTests();