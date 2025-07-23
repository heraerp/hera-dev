const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY
);

async function checkRelationshipTypes() {
  try {
    console.log('🔍 Checking existing relationship types...\n');
    
    // Get all entities that might be relationship types
    const { data: relationshipTypes, error } = await supabase
      .from('core_entities')
      .select('*')
      .or('entity_type.eq.relationship_type,entity_type.eq.relationship_template,entity_type.ilike.%relationship%')
      .order('entity_name');
    
    if (error) {
      console.error('❌ Error querying relationship types:', error);
      return;
    }
    
    console.log('📊 Found relationship type entities:');
    if (relationshipTypes && relationshipTypes.length > 0) {
      relationshipTypes.forEach((type, index) => {
        console.log(`   ${index + 1}. ${type.entity_name} (${type.entity_type})`);
        console.log(`      ID: ${type.id}`);
        console.log(`      Code: ${type.entity_code}`);
        console.log(`      Org: ${type.organization_id}`);
        console.log('');
      });
    } else {
      console.log('   No relationship type entities found');
    }
    
    // Check if we need to create one for GL intelligence
    console.log('🔍 Checking for transaction_has_gl_intelligence relationship type...');
    const { data: glRelType } = await supabase
      .from('core_entities')
      .select('*')
      .eq('entity_code', 'transaction_has_gl_intelligence')
      .single();
      
    if (glRelType) {
      console.log('✅ Found existing GL intelligence relationship type:', glRelType.id);
    } else {
      console.log('❌ Need to create GL intelligence relationship type');
      
      // Create the relationship type entity
      const relationshipTypeId = crypto.randomUUID();
      const { data: newRelType, error: createError } = await supabase
        .from('core_entities')
        .insert({
          id: relationshipTypeId,
          organization_id: '00000000-0000-0000-0000-000000000001', // System level
          entity_type: 'relationship_type',
          entity_name: 'Transaction Has GL Intelligence',
          entity_code: 'transaction_has_gl_intelligence',
          is_active: true
        })
        .select()
        .single();
        
      if (createError) {
        console.error('❌ Error creating relationship type:', createError);
      } else {
        console.log('✅ Created GL intelligence relationship type:', relationshipTypeId);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkRelationshipTypes();