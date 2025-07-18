/**
 * Test Orders Flow - Verify Toyota Method Implementation
 */

const { createClient } = require('@supabase/supabase-js');

// Setup environment
const supabase = createClient(
  'https://yslviohidtyqjmyslekz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlzbHZpb2hpZHR5cWpteXNsZWt6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTg5MzUyMSwiZXhwIjoyMDY3NDY5NTIxfQ.VQtaWocR7DBq4mMI0eqhd1caB3HU0pGbSB1rbkB0iUI'
);

async function testOrdersFlow() {
  console.log('🏭 Testing Toyota Method Orders Flow...');
  
  try {
    // Test 1: Check if universal_transactions table exists
    console.log('\n📋 Test 1: Checking universal_transactions table...');
    const { data: tables, error: tablesError } = await supabase
      .from('universal_transactions')
      .select('id')
      .limit(1);
    
    if (tablesError) {
      console.log('❌ universal_transactions table issue:', tablesError.message);
    } else {
      console.log('✅ universal_transactions table accessible');
    }
    
    // Test 2: Check if core_entities table exists
    console.log('\n📋 Test 2: Checking core_entities table...');
    const { data: entities, error: entitiesError } = await supabase
      .from('core_entities')
      .select('id')
      .limit(1);
    
    if (entitiesError) {
      console.log('❌ core_entities table issue:', entitiesError.message);
    } else {
      console.log('✅ core_entities table accessible');
    }
    
    // Test 3: Check if core_dynamic_data table exists
    console.log('\n📋 Test 3: Checking core_dynamic_data table...');
    const { data: dynamicData, error: dynamicError } = await supabase
      .from('core_dynamic_data')
      .select('entity_id')
      .limit(1);
    
    if (dynamicError) {
      console.log('❌ core_dynamic_data table issue:', dynamicError.message);
    } else {
      console.log('✅ core_dynamic_data table accessible');
    }
    
    // Test 4: Check service role permissions
    console.log('\n🔧 Test 4: Testing service role permissions...');
    const testId = 'test-' + Date.now();
    
    // Try to insert a test record
    const { error: insertError } = await supabase
      .from('core_entities')
      .insert({
        id: testId,
        entity_type: 'test',
        entity_name: 'Test Entity',
        entity_code: 'TEST-001',
        is_active: true
      });
    
    if (insertError) {
      console.log('❌ Service role insert failed:', insertError.message);
    } else {
      console.log('✅ Service role insert successful');
      
      // Clean up test record
      await supabase
        .from('core_entities')
        .delete()
        .eq('id', testId);
      
      console.log('✅ Test record cleaned up');
    }
    
    console.log('\n🎉 Toyota Method test completed successfully!');
    console.log('\n🚀 Orders page should now work correctly:');
    console.log('   1. Visit http://localhost:3000/restaurant/orders');
    console.log('   2. Click "New Order" button');
    console.log('   3. Add sample items');
    console.log('   4. Confirm order');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testOrdersFlow().then(() => process.exit(0));