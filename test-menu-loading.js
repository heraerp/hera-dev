/**
 * Test menu loading process like POS system does
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Simulate UniversalCrudService.listEntities
async function listEntities(organizationId, entityType, options = {}) {
  try {
    console.log(`🔍 Listing entities: ${entityType} for org: ${organizationId}`);
    console.log('   Options:', options);
    
    // Step 1: Get entities from core_entities
    let query = supabase
      .from('core_entities')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('entity_type', entityType)
      .eq('is_active', true);

    // Apply filters if provided
    if (options.filters) {
      Object.entries(options.filters).forEach(([key, value]) => {
        if (key !== 'is_active') { // is_active already applied
          query = query.eq(key, value);
        }
      });
    }

    const { data: entities, error: entitiesError } = await query;
    
    if (entitiesError) {
      console.error('❌ Error fetching entities:', entitiesError);
      return { success: false, error: entitiesError };
    }

    console.log(`✅ Found ${entities?.length || 0} entities`);
    
    if (!entities || entities.length === 0) {
      return { success: true, data: [] };
    }

    // Step 2: Get dynamic data for these entities
    const entityIds = entities.map(e => e.id);
    const { data: dynamicData, error: dynamicError } = await supabase
      .from('core_dynamic_data')
      .select('*')
      .in('entity_id', entityIds);

    if (dynamicError) {
      console.error('❌ Error fetching dynamic data:', dynamicError);
      return { success: false, error: dynamicError };
    }

    console.log(`✅ Found ${dynamicData?.length || 0} dynamic data records`);

    // Step 3: Combine entity and dynamic data
    const enrichedEntities = entities.map(entity => {
      const entityDynamicData = dynamicData?.filter(d => d.entity_id === entity.id) || [];
      
      // Add dynamic fields to entity
      const enrichedEntity = { ...entity };
      
      entityDynamicData.forEach(data => {
        if (data.field_type === 'number') {
          enrichedEntity[data.field_name] = parseFloat(data.field_value) || 0;
        } else if (data.field_type === 'boolean') {
          enrichedEntity[data.field_name] = data.field_value === 'true';
        } else if (data.field_name === 'tags' || data.field_name === 'available_times') {
          try {
            enrichedEntity[data.field_name] = JSON.parse(data.field_value);
          } catch (e) {
            enrichedEntity[data.field_name] = [];
          }
        } else {
          enrichedEntity[data.field_name] = data.field_value;
        }
      });

      return enrichedEntity;
    });

    // Step 4: Sort if needed
    if (options.orderBy) {
      enrichedEntities.sort((a, b) => {
        const aVal = a[options.orderBy.field] || 0;
        const bVal = b[options.orderBy.field] || 0;
        return options.orderBy.direction === 'desc' ? bVal - aVal : aVal - bVal;
      });
    }

    return { success: true, data: enrichedEntities };
    
  } catch (error) {
    console.error('❌ Error in listEntities:', error);
    return { success: false, error: error.message };
  }
}

async function testMenuLoading() {
  console.log('🧪 Testing menu loading like POS system...\n');
  
  const organizationId = '6fc73a3d-fe0a-45fa-9029-62a52df142e2';
  
  try {
    // Test 1: Load menu categories
    console.log('📂 Loading menu categories...');
    const categoriesResult = await listEntities(organizationId, 'menu_category', {
      filters: { is_active: true }
    });
    
    if (categoriesResult.success) {
      console.log(`✅ Categories loaded: ${categoriesResult.data.length}`);
      categoriesResult.data.forEach((cat, index) => {
        console.log(`   ${index + 1}. ${cat.entity_name} (${cat.id})`);
      });
    } else {
      console.error('❌ Failed to load categories:', categoriesResult.error);
    }
    
    // Test 2: Load menu items
    console.log('\n🍕 Loading menu items...');
    const itemsResult = await listEntities(organizationId, 'menu_item', {
      filters: { is_active: true }
    });
    
    if (itemsResult.success) {
      console.log(`✅ Menu items loaded: ${itemsResult.data.length}`);
      itemsResult.data.forEach((item, index) => {
        console.log(`   ${index + 1}. ${item.entity_name}:`);
        console.log(`      Category ID: ${item.category_id}`);
        console.log(`      Price: $${item.base_price}`);
        console.log(`      Description: ${item.description}`);
        console.log(`      Prep Time: ${item.preparation_time}min`);
        console.log(`      Featured: ${item.is_featured}`);
        console.log(`      Vegetarian: ${item.is_vegetarian}`);
        console.log(`      Vegan: ${item.is_vegan}`);
        console.log(`      Gluten Free: ${item.is_gluten_free}`);
      });
    } else {
      console.error('❌ Failed to load menu items:', itemsResult.error);
    }
    
    // Test 3: Filter menu items by category
    if (categoriesResult.success && itemsResult.success) {
      console.log('\n🔍 Testing menu item filtering...');
      
      const breadCategoryId = '29e5c5b2-e4be-4f8b-909d-9701e3000201';
      const filteredItems = itemsResult.data.filter(item => item.category_id === breadCategoryId);
      
      console.log(`✅ Items in "bread" category: ${filteredItems.length}`);
      filteredItems.forEach((item, index) => {
        console.log(`   ${index + 1}. ${item.entity_name} - $${item.base_price}`);
      });
    }
    
    // Test 4: Check if POS would show these items
    console.log('\n🛒 POS Display Test:');
    if (itemsResult.success && itemsResult.data.length > 0) {
      console.log('✅ POS should show these menu items:');
      itemsResult.data.forEach((item, index) => {
        console.log(`   ${index + 1}. ${item.entity_name || item.name} - $${item.base_price}`);
        console.log(`      Category: ${item.category_id}`);
        console.log(`      Active: ${item.is_active}`);
        console.log(`      Ready for POS: ${item.entity_name && item.base_price > 0 ? 'YES' : 'NO'}`);
      });
    } else {
      console.log('❌ No menu items found - POS will show empty menu');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testMenuLoading();