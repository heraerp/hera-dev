const { createClient } = require('@supabase/supabase-js');

// Read environment variables
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY
);

async function debugComboRelationships() {
  console.log('🔍 Debugging combo relationships...');
  
  const comboId = '1eaf68dc-5037-4e75-bbcd-7e609fd719de';
  
  // Check if relationships were created
  const { data: relationships, error } = await supabase
    .from('core_relationships')
    .select('*')
    .eq('parent_entity_id', comboId)
    .eq('relationship_type', 'composite_item');
    
  console.log('📊 Relationships found:', relationships?.length || 0);
  
  if (relationships && relationships.length > 0) {
    console.log('🔍 Relationship details:');
    relationships.forEach((rel, index) => {
      console.log(`  ${index + 1}. Child ID: ${rel.child_entity_id}`);
      console.log(`     Data: ${JSON.stringify(rel.relationship_data)}`);
      console.log(`     Active: ${rel.is_active}`);
    });
    
    // Try the same query as the API
    const { data: componentRels, error: componentError } = await supabase
      .from('core_relationships')
      .select(`
        child_entity_id,
        relationship_data,
        relationship_metadata,
        core_entities!core_relationships_child_entity_id_fkey(entity_name)
      `)
      .eq('parent_entity_id', comboId)
      .eq('relationship_type', 'composite_item')
      .eq('is_active', true)
      .order('relationship_data->>sequence_order');
    
    console.log('🔍 API Query result:', componentRels?.length || 0, 'components');
    if (componentError) {
      console.error('❌ API Query error:', componentError);
    }
    
    if (componentRels && componentRels.length > 0) {
      componentRels.forEach((rel, index) => {
        console.log(`  Component ${index + 1}:`);
        console.log(`    Item ID: ${rel.child_entity_id}`);
        console.log(`    Item Name: ${rel.core_entities?.entity_name}`);
        console.log(`    Data: ${JSON.stringify(rel.relationship_data)}`);
      });
    }
  } else {
    console.log('❌ No relationships found for combo');
    
    // Check if combo exists
    const { data: combo } = await supabase
      .from('core_entities')
      .select('*')
      .eq('id', comboId);
      
    console.log('🔍 Combo exists:', combo?.length > 0);
  }
}

debugComboRelationships().catch(console.error);