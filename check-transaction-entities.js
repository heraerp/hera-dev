const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY
);

async function checkTransactionEntities() {
  try {
    console.log('🔍 Checking transaction entities relationship...\n');
    
    const organizationId = '123e4567-e89b-12d3-a456-426614174000';
    
    // Get sample transaction
    const { data: transactions } = await supabase
      .from('universal_transactions')
      .select('*')
      .eq('organization_id', organizationId)
      .limit(1);
    
    if (!transactions || transactions.length === 0) {
      console.log('❌ No transactions found');
      return;
    }
    
    const transaction = transactions[0];
    console.log('📊 Sample transaction:');
    console.log(`   ID: ${transaction.id}`);
    console.log(`   Number: ${transaction.transaction_number}`);
    console.log(`   Type: ${transaction.transaction_type}`);
    
    // Check if transaction exists as an entity
    const { data: transactionEntity } = await supabase
      .from('core_entities')
      .select('*')
      .eq('id', transaction.id);
    
    if (transactionEntity && transactionEntity.length > 0) {
      console.log('\n✅ Transaction exists as core_entity:');
      console.log(`   Entity Type: ${transactionEntity[0].entity_type}`);
      console.log(`   Entity Name: ${transactionEntity[0].entity_name}`);
    } else {
      console.log('\n❌ Transaction does NOT exist as core_entity');
      console.log('   This explains the FK constraint error');
      
      // Check if we need to create transaction entities
      console.log('\n🔍 Checking for transaction-type entities...');
      const { data: txEntities } = await supabase
        .from('core_entities')
        .select('*')
        .eq('organization_id', organizationId)
        .or('entity_type.eq.transaction,entity_type.eq.purchase_order,entity_type.eq.sales_order')
        .limit(5);
        
      if (txEntities && txEntities.length > 0) {
        console.log(`✅ Found ${txEntities.length} transaction-type entities:`);
        txEntities.forEach(entity => {
          console.log(`   - ${entity.entity_name} (${entity.entity_type}): ${entity.id}`);
        });
      } else {
        console.log('❌ No transaction-type entities found');
      }
    }
    
    // Check purchase order entities specifically
    console.log('\n🔍 Checking purchase order entities...');
    const { data: poEntities } = await supabase
      .from('core_entities')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('entity_type', 'purchase_order');
      
    if (poEntities && poEntities.length > 0) {
      console.log(`✅ Found ${poEntities.length} purchase order entities:`);
      poEntities.forEach(entity => {
        console.log(`   - ${entity.entity_name}: ${entity.id}`);
      });
      
      // Use first PO entity for relationship test
      const poEntity = poEntities[0];
      console.log(`\n✅ Can use PO entity ${poEntity.id} for relationship testing`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkTransactionEntities();