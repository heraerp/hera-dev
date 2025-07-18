/**
 * Debug POS menu loading issue
 * Check if menu items exist and are being loaded properly
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY
);

async function debugPOSMenu() {
  console.log('🍽️ Debugging POS menu loading...\n');
  
  const organizationId = '6fc73a3d-fe0a-45fa-9029-62a52df142e2';
  
  try {
    // 1. Check if menu categories exist
    console.log('📂 Checking menu categories...');
    const { data: categories, error: categoriesError } = await supabase
      .from('core_entities')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('entity_type', 'menu_category')
      .eq('is_active', true);
    
    if (categoriesError) {
      console.error('❌ Error fetching categories:', categoriesError);
    } else {
      console.log(`✅ Found ${categories?.length || 0} menu categories:`);
      categories?.forEach((cat, index) => {
        console.log(`   ${index + 1}. ${cat.entity_name} (${cat.id})`);
      });
    }
    
    // 2. Check if menu items exist
    console.log('\n🍕 Checking menu items...');
    const { data: menuItems, error: itemsError } = await supabase
      .from('core_entities')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('entity_type', 'menu_item')
      .eq('is_active', true);
    
    if (itemsError) {
      console.error('❌ Error fetching menu items:', itemsError);
    } else {
      console.log(`✅ Found ${menuItems?.length || 0} menu items:`);
      menuItems?.forEach((item, index) => {
        console.log(`   ${index + 1}. ${item.entity_name} (${item.id})`);
      });
    }
    
    // 3. Check if we have any entities at all for this organization
    console.log('\n🔍 Checking all entities for this organization...');
    const { data: allEntities, error: allError } = await supabase
      .from('core_entities')
      .select('entity_type, entity_name, is_active')
      .eq('organization_id', organizationId)
      .order('entity_type', { ascending: true });
    
    if (allError) {
      console.error('❌ Error fetching all entities:', allError);
    } else {
      console.log(`✅ Found ${allEntities?.length || 0} total entities:`);
      
      // Group by entity type
      const entityGroups = {};
      allEntities?.forEach(entity => {
        if (!entityGroups[entity.entity_type]) {
          entityGroups[entity.entity_type] = [];
        }
        entityGroups[entity.entity_type].push(entity);
      });
      
      Object.entries(entityGroups).forEach(([type, entities]) => {
        console.log(`   ${type}: ${entities.length} entities`);
        entities.forEach((entity, index) => {
          console.log(`     ${index + 1}. ${entity.entity_name} (${entity.is_active ? 'Active' : 'Inactive'})`);
        });
      });
    }
    
    // 4. Check if we have any basic products we can use as menu items
    console.log('\n🛍️ Checking for product entities...');
    const { data: products, error: productsError } = await supabase
      .from('core_entities')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('entity_type', 'product')
      .eq('is_active', true);
    
    if (productsError) {
      console.error('❌ Error fetching products:', productsError);
    } else {
      console.log(`✅ Found ${products?.length || 0} product entities:`);
      products?.forEach((product, index) => {
        console.log(`   ${index + 1}. ${product.entity_name} (${product.id})`);
      });
      
      // Get metadata for products to see if they have prices
      if (products && products.length > 0) {
        const productIds = products.map(p => p.id);
        const { data: metadata, error: metaError } = await supabase
          .from('core_metadata')
          .select('entity_id, metadata_key, metadata_value')
          .eq('organization_id', organizationId)
          .in('entity_id', productIds);
        
        if (metadata && metadata.length > 0) {
          console.log('\n📊 Product metadata:');
          const metadataByEntity = {};
          metadata.forEach(meta => {
            if (!metadataByEntity[meta.entity_id]) {
              metadataByEntity[meta.entity_id] = {};
            }
            metadataByEntity[meta.entity_id][meta.metadata_key] = meta.metadata_value;
          });
          
          Object.entries(metadataByEntity).forEach(([entityId, data]) => {
            const product = products.find(p => p.id === entityId);
            console.log(`   ${product.entity_name}:`);
            Object.entries(data).forEach(([key, value]) => {
              console.log(`     ${key}: ${value}`);
            });
          });
        }
      }
    }
    
    // 5. Suggest next steps
    console.log('\n💡 Recommendations:');
    if (!categories || categories.length === 0) {
      console.log('   - Create menu categories first');
    }
    if (!menuItems || menuItems.length === 0) {
      console.log('   - Create menu items or convert existing products to menu items');
    }
    if (products && products.length > 0) {
      console.log('   - Consider using existing products as menu items');
    }
    
    console.log('\n📋 To create a simple menu:');
    console.log('   1. Go to http://localhost:3000/restaurant/menu-management');
    console.log('   2. Create a category (e.g., "Main Dishes")');
    console.log('   3. Create menu items in that category');
    console.log('   4. Then test the POS system again');
    
  } catch (error) {
    console.error('❌ Debug error:', error);
  }
}

debugPOSMenu();