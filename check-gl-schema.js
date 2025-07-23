const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY
);

async function checkAndUpdateGLSchema() {
  try {
    console.log('🔍 Checking universal_transactions schema...');
    
    // First, let's see what columns exist
    const { data: sampleTransaction, error: sampleError } = await supabase
      .from('universal_transactions')
      .select('*')
      .limit(1);
    
    if (sampleError) {
      console.error('❌ Error querying universal_transactions:', sampleError);
      return;
    }
    
    if (sampleTransaction && sampleTransaction.length > 0) {
      console.log('📊 Sample transaction structure:');
      console.log(Object.keys(sampleTransaction[0]));
      
      const transaction = sampleTransaction[0];
      
      // Check if GL fields exist
      const glFields = [
        'gl_account_id',
        'posting_status', 
        'posted_at',
        'journal_entry_id',
        'gl_posting_metadata',
        'gl_validation_status',
        'gl_validation_errors',
        'gl_auto_fix_applied',
        'gl_confidence_score'
      ];
      
      const missingFields = glFields.filter(field => !(field in transaction));
      
      if (missingFields.length > 0) {
        console.log('⚠️ Missing GL intelligence fields:', missingFields);
        console.log('📝 Creating SQL to add missing fields...');
        
        const alterStatements = missingFields.map(field => {
          switch (field) {
            case 'gl_account_id':
              return 'ALTER TABLE universal_transactions ADD COLUMN gl_account_id UUID;';
            case 'posting_status':
              return "ALTER TABLE universal_transactions ADD COLUMN posting_status VARCHAR(20) DEFAULT 'pending';";
            case 'posted_at':
              return 'ALTER TABLE universal_transactions ADD COLUMN posted_at TIMESTAMP;';
            case 'journal_entry_id':
              return 'ALTER TABLE universal_transactions ADD COLUMN journal_entry_id UUID;';
            case 'gl_posting_metadata':
              return 'ALTER TABLE universal_transactions ADD COLUMN gl_posting_metadata JSONB;';
            case 'gl_validation_status':
              return "ALTER TABLE universal_transactions ADD COLUMN gl_validation_status VARCHAR(20) DEFAULT 'pending';";
            case 'gl_validation_errors':
              return 'ALTER TABLE universal_transactions ADD COLUMN gl_validation_errors JSONB;';
            case 'gl_auto_fix_applied':
              return 'ALTER TABLE universal_transactions ADD COLUMN gl_auto_fix_applied BOOLEAN DEFAULT FALSE;';
            case 'gl_confidence_score':
              return 'ALTER TABLE universal_transactions ADD COLUMN gl_confidence_score DECIMAL(3,2) DEFAULT 0.50;';
            default:
              return `-- Unknown field: ${field}`;
          }
        });
        
        console.log('\n📝 SQL Commands to run in Supabase SQL Editor:');
        console.log('=====================================');
        alterStatements.forEach(stmt => console.log(stmt));
        console.log('=====================================\n');
        
        // Try to execute the alterations (if we have the right permissions)
        for (const statement of alterStatements) {
          if (!statement.startsWith('--')) {
            try {
              console.log('🔧 Executing:', statement);
              const { error } = await supabase.rpc('exec_sql', { sql: statement });
              if (error) {
                console.log('⚠️ Could not execute via RPC (expected):', error.message);
                console.log('👉 Please run this SQL manually in Supabase SQL Editor');
              } else {
                console.log('✅ Successfully executed');
              }
            } catch (err) {
              console.log('⚠️ RPC method not available, please run SQL manually');
            }
          }
        }
      } else {
        console.log('✅ All GL intelligence fields are present!');
      }
    } else {
      console.log('📝 No transactions found - checking with Mario\'s organization...');
      
      // Check Mario's organization specifically
      const { data: marioTransactions, error: marioError } = await supabase
        .from('universal_transactions')
        .select('*')
        .eq('organization_id', '123e4567-e89b-12d3-a456-426614174000')
        .limit(5);
      
      if (marioError) {
        console.error('❌ Error querying Mario\'s transactions:', marioError);
      } else {
        console.log(`📊 Found ${marioTransactions?.length || 0} transactions for Mario's restaurant`);
        if (marioTransactions && marioTransactions.length > 0) {
          console.log('📋 Transaction types:', [...new Set(marioTransactions.map(t => t.transaction_type))]);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkAndUpdateGLSchema();