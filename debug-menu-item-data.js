/**
 * Debug menu item data and structure
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY
);

async function debugMenuItemData() {
  console.log('🔍 Debugging menu item data structure...\n');
  
  const organizationId = '6fc73a3d-fe0a-45fa-9029-62a52df142e2';
  
  try {
    // 1. Get the menu item
    const { data: menuItem, error: itemError } = await supabase
      .from('core_entities')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('entity_type', 'menu_item')
      .single();
    
    if (itemError) {
      console.error('❌ Error fetching menu item:', itemError);
      return;
    }
    
    console.log('📋 Menu item found:', menuItem.entity_name);
    console.log('   ID:', menuItem.id);
    console.log('   Created:', menuItem.created_at);
    console.log('   Active:', menuItem.is_active);
    
    // 2. Get menu item metadata from core_dynamic_data
    const { data: dynamicData, error: dynamicError } = await supabase
      .from('core_dynamic_data')
      .select('*')
      .eq('entity_id', menuItem.id);
    
    if (dynamicError) {
      console.error('❌ Error fetching dynamic data:', dynamicError);
    } else {
      console.log('\n📊 Menu item dynamic data:');
      if (dynamicData && dynamicData.length > 0) {
        dynamicData.forEach(data => {
          console.log(`   ${data.field_name}: ${data.field_value} (${data.field_type})`);
        });
      } else {
        console.log('   No dynamic data found');
      }
    }
    
    // 3. Get menu item metadata from core_metadata
    const { data: metadata, error: metaError } = await supabase
      .from('core_metadata')
      .select('*')
      .eq('entity_id', menuItem.id);
    
    if (metaError) {
      console.error('❌ Error fetching metadata:', metaError);
    } else {
      console.log('\n📝 Menu item metadata:');
      if (metadata && metadata.length > 0) {
        metadata.forEach(meta => {
          console.log(`   ${meta.metadata_key}: ${meta.metadata_value}`);
        });
      } else {
        console.log('   No metadata found');
      }
    }
    
    // 4. Check required fields for POS system
    console.log('\n🔍 Checking required fields for POS:');
    
    // Build menu item object as POS would
    const menuItemForPOS = {
      id: menuItem.id,
      entity_name: menuItem.entity_name,
      name: menuItem.entity_name,
      is_active: menuItem.is_active,
      category_id: null,
      base_price: 0,
      description: '',
      preparation_time: 0,
      is_featured: false,
      is_vegetarian: false,
      is_vegan: false,
      is_gluten_free: false
    };
    
    // Add dynamic data fields
    if (dynamicData) {
      dynamicData.forEach(data => {
        if (data.field_name === 'category_id') {
          menuItemForPOS.category_id = data.field_value;
        } else if (data.field_name === 'base_price') {
          menuItemForPOS.base_price = parseFloat(data.field_value) || 0;
        } else if (data.field_name === 'description') {
          menuItemForPOS.description = data.field_value;
        } else if (data.field_name === 'preparation_time') {
          menuItemForPOS.preparation_time = parseInt(data.field_value) || 0;
        } else if (data.field_name === 'is_featured') {
          menuItemForPOS.is_featured = data.field_value === 'true';
        } else if (data.field_name === 'is_vegetarian') {
          menuItemForPOS.is_vegetarian = data.field_value === 'true';
        } else if (data.field_name === 'is_vegan') {
          menuItemForPOS.is_vegan = data.field_value === 'true';
        } else if (data.field_name === 'is_gluten_free') {
          menuItemForPOS.is_gluten_free = data.field_value === 'true';
        }
      });
    }
    
    console.log('\n🍽️ Menu item as POS would see it:');
    console.log(JSON.stringify(menuItemForPOS, null, 2));
    
    // 5. Check if category exists
    if (menuItemForPOS.category_id) {
      const { data: category, error: catError } = await supabase
        .from('core_entities')
        .select('*')
        .eq('id', menuItemForPOS.category_id)
        .single();
      
      if (catError) {
        console.log('❌ Category not found:', catError);
      } else {
        console.log(`✅ Category found: ${category.entity_name}`);
      }
    } else {
      console.log('❌ No category_id set for menu item');
    }
    
    // 6. Suggest creating more menu items from products
    console.log('\n💡 Suggestion: Create menu items from existing products');
    console.log('   Products like "Earl Grey Supreme", "Dragon Well Green Tea", etc.');
    console.log('   already have prices and descriptions in their metadata');
    
  } catch (error) {
    console.error('❌ Debug error:', error);
  }
}

debugMenuItemData();