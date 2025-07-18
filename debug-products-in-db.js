const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const debugProductsInDB = async () => {
  console.log('🔍 Debugging Products in Database\n');
  
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY
    );

    const organizationId = '6fc73a3d-fe0a-45fa-9029-62a52df142e2'; // Zen - Main Branch

    console.log('✅ Step 1: Check core_entities for products');
    const { data: entities, error: entitiesError } = await supabase
      .from('core_entities')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('entity_type', 'product');

    if (entitiesError) {
      console.error('❌ Error fetching entities:', entitiesError);
      return;
    }

    console.log(`📊 Found ${entities.length} product entities:`);
    entities.forEach((entity, index) => {
      console.log(`   ${index + 1}. ${entity.entity_name} (${entity.id})`);
      console.log(`      Code: ${entity.entity_code}`);
      console.log(`      Active: ${entity.is_active}`);
      console.log(`      Created: ${entity.created_at}`);
    });

    if (entities.length > 0) {
      console.log('\n✅ Step 2: Check core_dynamic_data for product details');
      const entityIds = entities.map(e => e.id);
      
      const { data: dynamicData, error: dynamicError } = await supabase
        .from('core_dynamic_data')
        .select('*')
        .in('entity_id', entityIds);

      if (dynamicError) {
        console.error('❌ Error fetching dynamic data:', dynamicError);
      } else {
        console.log(`📊 Found ${dynamicData.length} dynamic data records:`);
        dynamicData.forEach(record => {
          console.log(`   ${record.field_name}: ${record.field_value} (${record.entity_id})`);
        });
      }

      console.log('\n✅ Step 3: Check core_metadata for product metadata');
      const { data: metadata, error: metadataError } = await supabase
        .from('core_metadata')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('entity_type', 'product')
        .in('entity_id', entityIds);

      if (metadataError) {
        console.error('❌ Error fetching metadata:', metadataError);
      } else {
        console.log(`📊 Found ${metadata.length} metadata records:`);
        metadata.forEach(record => {
          console.log(`   ${record.metadata_key}: ${JSON.stringify(record.metadata_value)} (${record.entity_id})`);
        });
      }
    }

    console.log('\n✅ Step 4: Test ProductCatalogService.getProductCatalog equivalent query');
    
    // Simulate what getProductCatalog does
    console.log('🔍 Querying categories...');
    const { data: categoryEntities, error: catError } = await supabase
      .from('core_entities')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('entity_type', 'product_category')
      .eq('is_active', true);

    console.log(`📊 Found ${categoryEntities?.length || 0} categories`);
    
    console.log('🔍 Querying products again with full logic...');
    const { data: productEntities, error: prodError } = await supabase
      .from('core_entities')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('entity_type', 'product')
      .eq('is_active', true);

    console.log(`📊 Product entities query result: ${productEntities?.length || 0} products`);
    
    if (prodError) {
      console.error('❌ Products query error:', prodError);
    }

  } catch (error) {
    console.error('🚨 Script error:', error);
  }
};

debugProductsInDB();