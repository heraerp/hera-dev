import UniversalCrudService from '@/lib/services/universalCrudService';

const supabase = createClient();

// Test Supabase connection and table existence
export async function testSupabaseConnection() {
  console.log('🔍 Testing Supabase connection...');
  
  try {
    // Test 1: Check if universal_transactions table exists
    console.log('📊 Checking universal_transactions table...');
    const { data: universalTransactions, error: universalError } = await supabase
      .from('universal_transactions')
      .select('*')
      .limit(1);
    
    if (universalError) {
      console.error('❌ universal_transactions table error:', universalError);
      console.log('📝 Need to create universal_transactions table');
    } else {
      console.log('✅ universal_transactions table exists, records:', universalTransactions?.length || 0);
    }

    // Test 2: Check if universal_transaction_lines table exists
    console.log('📊 Checking universal_transaction_lines table...');
    const { data: universalLines, error: linesError } = await supabase
      .from('universal_transaction_lines')
      .select('*')
      .limit(1);
    
    if (linesError) {
      console.error('❌ universal_transaction_lines table error:', linesError);
      console.log('📝 Need to create universal_transaction_lines table');
    } else {
      console.log('✅ universal_transaction_lines table exists, records:', universalLines?.length || 0);
    }

    // Test 3: Check if core_metadata table exists
    console.log('📊 Checking core_metadata table...');
    const { data: metadata, error: metadataError } = await supabase
      .from('core_metadata')
      .select('*')
      .limit(1);
    
    if (metadataError) {
      console.error('❌ core_metadata table error:', metadataError);
      console.log('📝 Need to create core_metadata table');
    } else {
      console.log('✅ core_metadata table exists, records:', metadata?.length || 0);
    }

    // Test 4: Check if core_entities table exists (fallback)
    console.log('📊 Checking core_entities table...');
    const { data: entities, error: entitiesError } = await supabase
      .from('core_entities')
      .select('*')
      .limit(1);
    
    if (entitiesError) {
      console.error('❌ core_entities table error:', entitiesError);
      console.log('📝 Need to create core_entities table');
    } else {
      console.log('✅ core_entities table exists, records:', entities?.length || 0);
    }

    // Test 5: Try to create a test order
    console.log('📊 Testing order creation...');
    const testOrderId = crypto.randomUUID();
    const testOrderNumber = `TEST-${Date.now()}`;
    
    const { data: testOrder, error: testOrderError } = await supabase
      .from('universal_transactions')
      .insert({
        id: testOrderId,
        organization_id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
        transaction_type: 'SALES_ORDER',
        transaction_number: testOrderNumber,
        transaction_date: new Date().toISOString().split('T')[0],
        total_amount: 10.00,
        currency: 'USD',
        status: 'PENDING'
      })
      .select()
      .single();

    if (testOrderError) {
      console.error('❌ Test order creation failed:', testOrderError);
      return { success: false, error: testOrderError };
    } else {
      console.log('✅ Test order created successfully:', testOrder.transaction_number);
      
      // Clean up test order
      await supabase
        .from('universal_transactions')
        .delete()
        .eq('id', testOrderId);
      
      console.log('🧹 Test order cleaned up');
    }

    return { success: true };

  } catch (error) {
    console.error('🚨 Supabase connection test failed:', error);
    return { success: false, error };
  }
}

// Quick test function that can be called from browser console
export function runSupabaseTest() {
  testSupabaseConnection().then(result => {
    console.log('Test result:', result);
  });
}