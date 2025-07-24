const { createClient } = require('@supabase/supabase-js');

// Read environment variables
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY
);

async function testComboCreation() {
  console.log('🧪 Testing combo creation manually...');
  
  const organizationId = '123e4567-e89b-12d3-a456-426614174000';
  const comboName = 'Test Manual Combo';
  
  // Create the combo item
  const { data: menuItem, error: itemError } = await supabase
    .from('core_entities')
    .insert({
      organization_id: organizationId,
      entity_type: 'composite_menu_item',
      entity_name: comboName,
      entity_code: 'TEST-MANUAL-COMBO',
      is_active: true
    })
    .select()
    .single();

  if (itemError) {
    console.error('❌ Error creating combo:', itemError);
    return;
  }

  console.log('✅ Combo created:', menuItem.id);

  // Add basic properties
  await supabase
    .from('core_dynamic_data')
    .insert([
      { entity_id: menuItem.id, field_name: 'base_price', field_value: '29.99', field_type: 'decimal' },
      { entity_id: menuItem.id, field_name: 'cost_price', field_value: '10.50', field_type: 'decimal' },
      { entity_id: menuItem.id, field_name: 'description', field_value: 'Test combo description', field_type: 'text' }
    ]);

  // Test adding components
  const components = [
    {
      itemId: '66cafb55-3df3-4b83-a3ae-51972feec4d8', // Margherita Pizza
      portionSize: 1.0,
      quantity: 1,
      sequenceOrder: 1,
      isMandatory: true
    },
    {
      itemId: 'd7cecbfa-0137-43f0-bca0-0af55a913985', // Caesar Salad
      portionSize: 1.0,
      quantity: 1,
      sequenceOrder: 2,
      isMandatory: false
    }
  ];

  const componentRelationships = components.map(component => ({
    organization_id: organizationId,
    relationship_type: 'composite_item',
    parent_entity_id: menuItem.id,
    child_entity_id: component.itemId,
    relationship_data: {
      portion_size: component.portionSize.toString(),
      quantity: component.quantity.toString(),
      sequence_order: component.sequenceOrder.toString(),
      is_mandatory: component.isMandatory
    },
    is_active: true
  }));

  console.log('🔗 Creating relationships:', componentRelationships.length);

  const { data: relationshipsResult, error: componentsError } = await supabase
    .from('core_relationships')
    .insert(componentRelationships)
    .select();

  if (componentsError) {
    console.error('❌ Error adding combo components:', componentsError);
  } else {
    console.log('✅ Relationships created:', relationshipsResult?.length);
  }

  // Test retrieving components
  const { data: componentRels, error: retrieveError } = await supabase
    .from('core_relationships')
    .select(`
      child_entity_id,
      relationship_data,
      core_entities!core_relationships_child_entity_id_fkey(entity_name)
    `)
    .eq('parent_entity_id', menuItem.id)
    .eq('relationship_type', 'composite_item')
    .eq('is_active', true)
    .order('relationship_data->>sequence_order');

  if (retrieveError) {
    console.error('❌ Error retrieving components:', retrieveError);
  } else {
    console.log('✅ Components retrieved:', componentRels?.length);
    componentRels?.forEach((rel, index) => {
      console.log(`  ${index + 1}. ${rel.core_entities?.entity_name} - ${JSON.stringify(rel.relationship_data)}`);
    });
  }
}

testComboCreation().catch(console.error);