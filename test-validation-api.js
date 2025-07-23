const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY
);

async function testValidationLogic() {
  try {
    const organizationId = '123e4567-e89b-12d3-a456-426614174000';
    
    console.log('🔍 Testing validation query logic...');
    
    // Test the exact query from the API
    let transactionQuery = supabase
      .from('universal_transactions')
      .select('*')
      .eq('organization_id', organizationId)
      .in('transaction_type', ['SALES_ORDER', 'PURCHASE_ORDER', 'JOURNAL_ENTRY', 'AI_JOURNAL_ENTRY', 'purchase_order', 'goods_receipt']);

    console.log('📊 Testing base query...');
    const { data: baseTransactions, error: baseError } = await transactionQuery;
    
    if (baseError) {
      console.error('❌ Base query error:', baseError);
      return;
    }
    
    console.log(`Found ${baseTransactions?.length || 0} transactions with base query`);
    
    if (baseTransactions && baseTransactions.length > 0) {
      console.log('📋 Base transactions:');
      baseTransactions.forEach((tx, i) => {
        console.log(`${i + 1}. ${tx.transaction_type} - ${tx.transaction_number} - Status: ${tx.posting_status || 'null'}`);
      });
      
      // Test the pending filter
      console.log('\n🔍 Testing pending filter...');
      const pendingTransactions = baseTransactions.filter(tx => 
        !tx.posting_status || tx.posting_status === 'pending'
      );
      console.log(`Found ${pendingTransactions.length} pending transactions`);
      
      // Test the specific query from validation API with pending scope
      console.log('\n🔍 Testing API query with pending scope...');
      const { data: pendingAPITransactions, error: pendingError } = await supabase
        .from('universal_transactions')
        .select('*')
        .eq('organization_id', organizationId)
        .in('transaction_type', ['SALES_ORDER', 'PURCHASE_ORDER', 'JOURNAL_ENTRY', 'AI_JOURNAL_ENTRY', 'purchase_order', 'goods_receipt'])
        .or('posting_status.is.null,posting_status.eq.pending')
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (pendingError) {
        console.error('❌ Pending query error:', pendingError);
      } else {
        console.log(`API pending query found ${pendingAPITransactions?.length || 0} transactions`);
      }
      
      // Test without the OR filter
      console.log('\n🔍 Testing without posting_status filter...');
      const { data: allAPITransactions, error: allError } = await supabase
        .from('universal_transactions')
        .select('*')
        .eq('organization_id', organizationId)
        .in('transaction_type', ['SALES_ORDER', 'PURCHASE_ORDER', 'JOURNAL_ENTRY', 'AI_JOURNAL_ENTRY', 'purchase_order', 'goods_receipt'])
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (allError) {
        console.error('❌ All query error:', allError);
      } else {
        console.log(`API all query found ${allAPITransactions?.length || 0} transactions`);
        if (allAPITransactions && allAPITransactions.length > 0) {
          console.log('📋 All API transactions:');
          allAPITransactions.forEach((tx, i) => {
            console.log(`${i + 1}. ${tx.transaction_type} - ${tx.posting_status || 'null'} - ${tx.transaction_number}`);
          });
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testValidationLogic();