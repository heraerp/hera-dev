const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const debugGetProductCatalog = async () => {
  console.log('🔍 Debugging ProductCatalogService.getProductCatalog Logic\n');
  
  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY
    );

    const organizationId = '6fc73a3d-fe0a-45fa-9029-62a52df142e2';

    console.log('✅ Step 1: Get Categories (like getProductCatalog does)');
    
    // Step 1: Get categories
    const { data: categoryEntities, error: categoryError } = await supabaseAdmin
      .from('core_entities')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('entity_type', 'product_category')
      .eq('is_active', true);

    console.log(`📊 Categories found: ${categoryEntities?.length || 0}`);
    if (categoryError) {
      console.error('❌ Category error:', categoryError);
    }

    console.log('\n✅ Step 2: Get Product Entities (like getProductCatalog does)');
    
    // Step 2: Get product entities  
    const { data: productEntities, error: productError } = await supabaseAdmin
      .from('core_entities')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('entity_type', 'product')
      .eq('is_active', true);

    console.log(`📊 Product entities found: ${productEntities?.length || 0}`);
    if (productError) {
      console.error('❌ Product error:', productError);
    }

    if (productEntities?.length > 0) {
      console.log('First few products:');
      productEntities.slice(0, 3).forEach(p => {
        console.log(`   - ${p.entity_name} (${p.id})`);
      });
    }

    console.log('\n✅ Step 3: Get Dynamic Data (like getProductCatalog does)');
    
    if (productEntities?.length > 0) {
      const entityIds = productEntities.map(p => p.id);
      
      const { data: dynamicData, error: dynamicError } = await supabaseAdmin
        .from('core_dynamic_data')
        .select('*')
        .in('entity_id', entityIds);

      console.log(`📊 Dynamic data records found: ${dynamicData?.length || 0}`);
      if (dynamicError) {
        console.error('❌ Dynamic data error:', dynamicError);
      }

      console.log('\n✅ Step 4: Get Metadata (like getProductCatalog does)');
      
      const { data: metadata, error: metadataError } = await supabaseAdmin
        .from('core_metadata')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('entity_type', 'product')
        .in('entity_id', entityIds);

      console.log(`📊 Metadata records found: ${metadata?.length || 0}`);
      if (metadataError) {
        console.error('❌ Metadata error:', metadataError);
      }

      console.log('\n✅ Step 5: Manual data processing simulation');
      
      // Create dynamic data map
      const dynamicDataMap = new Map();
      dynamicData?.forEach(item => {
        if (!dynamicDataMap.has(item.entity_id)) {
          dynamicDataMap.set(item.entity_id, {});
        }
        dynamicDataMap.get(item.entity_id)[item.field_name] = {
          value: item.field_value,
          type: item.field_type
        };
      });

      // Create metadata map
      const metadataMap = new Map();
      metadata?.forEach(item => {
        if (!metadataMap.has(item.entity_id)) {
          metadataMap.set(item.entity_id, {});
        }
        metadataMap.get(item.entity_id)[item.metadata_key] = item.metadata_value;
      });

      console.log('🔄 Processing first product:');
      const firstProduct = productEntities[0];
      const firstDynamicData = dynamicDataMap.get(firstProduct.id) || {};
      const firstMetadata = metadataMap.get(firstProduct.id) || {};
      
      console.log('   Entity:', firstProduct.entity_name);
      console.log('   Dynamic data keys:', Object.keys(firstDynamicData));
      console.log('   Metadata keys:', Object.keys(firstMetadata));
      
      // Build enriched product like getProductCatalog does
      const enrichedProduct = {
        ...firstProduct,
        dynamicData: firstDynamicData,
        metadata: firstMetadata,
        category: null // Will be set based on category lookup
      };

      console.log('   Enriched product sample:', {
        id: enrichedProduct.id,
        name: enrichedProduct.entity_name,
        dynamicDataCount: Object.keys(enrichedProduct.dynamicData).length,
        metadataCount: Object.keys(enrichedProduct.metadata).length
      });

      console.log(`\n🎉 CONCLUSION: getProductCatalog should return ${productEntities.length} products`);
      console.log('   If it\'s returning 0, there\'s a bug in the getProductCatalog method itself.');
    }

  } catch (error) {
    console.error('🚨 Script error:', error);
  }
};

debugGetProductCatalog();