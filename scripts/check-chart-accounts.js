const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY
);

async function checkChartOfAccounts() {
  console.log('🔍 Checking Chart of Accounts in HERA database...\n');

  try {
    // First, let's look for any account-related entities
    const { data: accountEntities, error: entitiesError } = await supabase
      .from('core_entities')
      .select('*')
      .or('entity_type.ilike.%account%,entity_name.ilike.%account%,entity_code.ilike.%acc%')
      .order('entity_code');

    if (entitiesError) {
      console.error('Error fetching account entities:', entitiesError);
      return;
    }

    console.log(`📊 Found ${accountEntities?.length || 0} account-related entities:`);
    if (accountEntities && accountEntities.length > 0) {
      accountEntities.forEach(entity => {
        console.log(`  - ${entity.entity_code}: ${entity.entity_name} (${entity.entity_type})`);
      });
    } else {
      console.log('  No account-related entities found.');
    }

    // Get dynamic data for these entities
    if (accountEntities && accountEntities.length > 0) {
      const entityIds = accountEntities.map(e => e.id);
      const { data: dynamicData, error: dynamicError } = await supabase
        .from('core_dynamic_data')
        .select('*')
        .in('entity_id', entityIds);

      if (!dynamicError && dynamicData) {
        console.log('\n📋 Account Details:');
        accountEntities.forEach(entity => {
          const entityData = dynamicData.filter(d => d.entity_id === entity.id);
          console.log(`\n  ${entity.entity_code} - ${entity.entity_name}:`);
          entityData.forEach(field => {
            console.log(`    ${field.field_name}: ${field.field_value}`);
          });
        });
      }
    }

    // Let's also check for any transactions that might indicate account usage
    console.log('\n💰 Checking universal_transactions for account references...');
    const { data: transactions, error: txError } = await supabase
      .from('universal_transactions')
      .select('mapped_accounts, transaction_data')
      .not('mapped_accounts', 'is', null)
      .limit(5);

    if (!txError && transactions && transactions.length > 0) {
      console.log('\n📊 Sample Account Mappings from Transactions:');
      transactions.forEach((tx, index) => {
        console.log(`  Transaction ${index + 1}:`);
        if (tx.mapped_accounts) {
          console.log(`    Mapped Accounts: ${JSON.stringify(tx.mapped_accounts, null, 2)}`);
        }
      });
    } else {
      console.log('  No account mappings found in transactions.');
    }

    // Check for any relationships that might indicate account hierarchy
    console.log('\n🔗 Checking for account relationships...');
    const { data: relationships, error: relError } = await supabase
      .from('core_relationships')
      .select('*')
      .or('relationship_type.ilike.%account%,relationship_name.ilike.%account%')
      .limit(10);

    if (!relError && relationships && relationships.length > 0) {
      console.log('\n🏗️ Account Relationships:');
      relationships.forEach(rel => {
        console.log(`  ${rel.relationship_type}: ${rel.relationship_name || 'N/A'}`);
      });
    } else {
      console.log('  No account relationships found.');
    }

  } catch (error) {
    console.error('Error checking chart of accounts:', error);
  }
}

checkChartOfAccounts();