const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY
);

async function checkRelationshipsSchema() {
  try {
    console.log('🔍 Checking core_relationships requirements...\n');
    
    // Get a sample relationship to see required fields
    const { data: sampleRel, error } = await supabase
      .from('core_relationships')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ Error querying relationships:', error);
      return;
    }
    
    if (sampleRel && sampleRel.length > 0) {
      console.log('📊 Sample relationship structure:');
      const rel = sampleRel[0];
      Object.keys(rel).forEach(key => {
        console.log(`   ${key}: ${typeof rel[key]} (${rel[key] === null ? 'null' : 'has value'})`);
      });
      
      console.log('\n📊 Specific values:');
      console.log(`   relationship_type_id: ${rel.relationship_type_id}`);
      console.log(`   relationship_type: ${rel.relationship_type}`);
      console.log(`   organization_id: ${rel.organization_id}`);
    }
    
    // Check if we need to use relationship_type_id
    console.log('\n🔍 Checking if relationship_type_id is required...');
    console.log('   Based on the error, it seems relationship_type_id is NOT NULL');
    console.log('   We might need to create or find relationship type entities first');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkRelationshipsSchema();