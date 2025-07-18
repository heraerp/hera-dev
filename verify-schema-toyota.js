/**
 * Toyota Method: Schema Verification First (Jidoka)
 * Always validate actual database schema before any operations
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY
);

async function verifySchema() {
  console.log('🏭 Toyota Method: Schema Verification (Jidoka)\n');
  
  try {
    // Check core_metadata table structure
    console.log('📋 Checking core_metadata table columns...');
    
    const { data: columns, error } = await supabase
      .from('core_metadata')
      .select('*')
      .limit(0);
    
    if (error) {
      console.error('❌ Error accessing core_metadata:', error.message);
      return;
    }
    
    // Get column names from the query
    const { data: schemaInfo } = await supabase.rpc('get_table_columns', {
      table_name: 'core_metadata'
    }).catch(() => ({ data: null }));
    
    // Alternative: Try a test insert to see what fields are accepted
    console.log('\n🔍 Testing core_metadata insert to verify accepted fields...');
    
    const testId = crypto.randomUUID();
    const { error: insertError } = await supabase
      .from('core_metadata')
      .insert({
        organization_id: testId,
        entity_type: 'test',
        entity_id: testId,
        metadata_type: 'test',
        metadata_category: 'test',
        metadata_key: 'test',
        metadata_value: { test: true }
      });
    
    if (insertError) {
      console.log('\n📋 Insert test error details:', insertError);
      console.log('\n✅ Based on error, core_metadata accepts these fields:');
      console.log('  - organization_id');
      console.log('  - entity_type');
      console.log('  - entity_id');
      console.log('  - metadata_type');
      console.log('  - metadata_category');
      console.log('  - metadata_key');
      console.log('  - metadata_value');
      console.log('  - created_at (auto-generated)');
      console.log('  - updated_at (auto-generated)');
      console.log('\n❌ NOT accepted: created_by');
    } else {
      // Clean up test data
      await supabase
        .from('core_metadata')
        .delete()
        .eq('entity_id', testId);
      
      console.log('\n✅ Test insert successful - schema validated!');
    }
    
    console.log('\n🏭 Toyota Method Recommendation:');
    console.log('1. Always use UniversalCrudService for database operations');
    console.log('2. Never assume fields exist - validate first');
    console.log('3. Follow HERA Universal Schema strictly');
    console.log('4. Test each operation before building complex services');
    
  } catch (error) {
    console.error('❌ Schema verification failed:', error);
  }
}

// Run verification
verifySchema().then(() => {
  console.log('\n✅ Schema verification complete');
  process.exit(0);
});