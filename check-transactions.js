const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY
);

async function checkTransactions() {
  try {
    console.log('🔍 Checking all transactions in database...');
    
    // Get all transactions
    const { data: allTransactions, error } = await supabase
      .from('universal_transactions')
      .select('organization_id, transaction_type, transaction_number, created_at')
      .limit(10);
    
    if (error) {
      console.error('❌ Error querying transactions:', error);
      return;
    }
    
    console.log(`📊 Found ${allTransactions?.length || 0} total transactions`);
    
    if (allTransactions && allTransactions.length > 0) {
      console.log('\n📋 Sample transactions:');
      allTransactions.forEach((tx, i) => {
        console.log(`${i + 1}. Org: ${tx.organization_id?.substring(0, 8)}... Type: ${tx.transaction_type} Number: ${tx.transaction_number} Date: ${tx.created_at?.split('T')[0]}`);
      });
      
      // Get unique organization IDs
      const uniqueOrgs = [...new Set(allTransactions.map(tx => tx.organization_id))];
      console.log('\n🏢 Unique organizations:', uniqueOrgs.length);
      uniqueOrgs.forEach((orgId, i) => {
        const orgTransactions = allTransactions.filter(tx => tx.organization_id === orgId);
        console.log(`${i + 1}. ${orgId} - ${orgTransactions.length} transactions`);
      });
      
      // Get transaction types
      const transactionTypes = [...new Set(allTransactions.map(tx => tx.transaction_type))];
      console.log('\n📝 Transaction types:', transactionTypes);
    }
    
    // Check specifically for Mario's restaurant transactions
    console.log('\n🍝 Checking Mario\'s restaurant transactions...');
    const { data: marioTransactions } = await supabase
      .from('universal_transactions')
      .select('*')
      .eq('organization_id', '123e4567-e89b-12d3-a456-426614174000')
      .limit(5);
    
    console.log(`Found ${marioTransactions?.length || 0} transactions for Mario's restaurant`);
    
    if (marioTransactions && marioTransactions.length > 0) {
      console.log('📋 Mario\'s transactions:');
      marioTransactions.forEach((tx, i) => {
        console.log(`${i + 1}. ${tx.transaction_type} - ${tx.transaction_number} - $${tx.total_amount} - ${tx.posting_status || 'no status'}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkTransactions();