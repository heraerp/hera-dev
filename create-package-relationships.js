#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY
);

const SYSTEM_ORG_ID = '00000000-0000-0000-0000-000000000001';

async function createPackageModuleRelationships() {
  console.log('🔧 Creating package-module relationships for testing...');
  
  // Get all industry packages first to see what's available
  const { data: allPackages } = await supabase
    .from('core_entities')
    .select('id, entity_name, entity_code')
    .eq('organization_id', SYSTEM_ORG_ID)
    .eq('entity_type', 'erp_industry_template');
    
  console.log('📋 Available packages:', allPackages?.map(p => p.entity_name) || []);
  
  // Get the first available package
  const packages = allPackages?.[0];
    
  if (!packages) {
    console.log('❌ No industry packages found');
    return;
  }
  
  console.log('📦 Found package:', packages.entity_name);
  
  // Get some core ERP modules to include in the package
  const { data: modules } = await supabase
    .from('core_entities')
    .select('id, entity_name, entity_code')
    .eq('organization_id', SYSTEM_ORG_ID)
    .eq('entity_type', 'erp_module_template')
    .in('entity_code', ['SYS-GL-CORE', 'SYS-PROCURE', 'SYS-INVENTORY', 'SYS-POS-CORE', 'SYS-CRM-CORE'])
    .eq('is_active', true)
    .limit(5);
    
  console.log('🛠️ Found modules:', modules?.length || 0);
  
  if (!modules || modules.length === 0) {
    console.log('❌ No modules found for relationship');
    return;
  }
  
  // First, check if we have a relationship type for template_includes_module
  let { data: relType } = await supabase
    .from('core_relationships')
    .select('relationship_type_id')
    .eq('relationship_type', 'template_includes_module')
    .limit(1)
    .single();
    
  let relationshipTypeId;
  
  if (!relType) {
    // Create a new relationship type entry 
    relationshipTypeId = '00000000-0000-0000-0001-000000000003'; // Use a specific ID for template relationships
  } else {
    relationshipTypeId = relType.relationship_type_id;
  }
  
  console.log('🔗 Using relationship_type_id:', relationshipTypeId);
  
  // Remove existing relationships first (without foreign key issues)
  const { data: existingRels } = await supabase
    .from('core_relationships')
    .select('id')
    .eq('parent_entity_id', packages.id)
    .eq('relationship_type', 'template_includes_module');
    
  if (existingRels && existingRels.length > 0) {
    console.log('🗑️ Found', existingRels.length, 'existing relationships to remove');
    // For now, skip deletion to avoid foreign key issues
  }
  
  // Create relationships with proper relationship_type_id
  const relationships = modules.map((module, index) => ({
    organization_id: SYSTEM_ORG_ID,
    relationship_type_id: relationshipTypeId,
    relationship_type: 'template_includes_module',
    relationship_name: `${packages.entity_name} includes ${module.entity_name}`,
    parent_entity_id: packages.id,
    child_entity_id: module.id,
    relationship_data: { order: index + 1, module_category: 'core' },
    relationship_metadata: { created_for_testing: true },
    relationship_score: 1.0,
    relationship_priority: 100,
    is_bidirectional: false,
    is_hierarchical: false,
    is_active: true,
    effective_from: new Date().toISOString(),
    created_by: SYSTEM_ORG_ID,
    version: 1
  }));
  
  console.log('🚀 Creating', relationships.length, 'relationships...');
  
  const { data: createdRels, error } = await supabase
    .from('core_relationships')
    .insert(relationships)
    .select();
    
  if (error) {
    console.log('❌ Error creating relationships:', error);
    return;
  }
  
  console.log('✅ Created', createdRels.length, 'package-module relationships');
  
  // Also update the package metadata with module count
  await supabase
    .from('core_dynamic_data')
    .upsert([
      {
        entity_id: packages.id,
        field_name: 'total_modules',
        field_value: modules.length.toString(),
        field_type: 'number'
      }
    ], { onConflict: 'entity_id,field_name' });
    
  console.log('✅ Updated package metadata with module count');
  
  console.log('\n📋 Package-Module Relationships Created:');
  modules.forEach((module, index) => {
    console.log(`   ${index + 1}. ${module.entity_name} (${module.entity_code})`);
  });
}

createPackageModuleRelationships().catch(console.error);