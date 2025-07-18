const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY
);

async function debugMenuData() {
  console.log('🍕 Debugging Menu Data in Database...\n');

  try {
    // 1. Check all menu categories
    console.log('📂 1. Checking Menu Categories:');
    const { data: categories, error: catError } = await supabase
      .from('core_entities')
      .select('*')
      .eq('entity_type', 'menu_category')
      .order('created_at', { ascending: false });

    if (catError) {
      console.error('❌ Error fetching categories:', catError);
    } else {
      console.log(`✅ Found ${categories?.length || 0} menu categories`);
      if (categories && categories.length > 0) {
        categories.forEach(cat => {
          console.log(`   - ${cat.entity_name} (ID: ${cat.id}, Org: ${cat.organization_id})`);
        });
      }
    }

    // 2. Check all menu items
    console.log('\n🍔 2. Checking Menu Items:');
    const { data: items, error: itemError } = await supabase
      .from('core_entities')
      .select('*')
      .eq('entity_type', 'menu_item')
      .order('created_at', { ascending: false });

    if (itemError) {
      console.error('❌ Error fetching items:', itemError);
    } else {
      console.log(`✅ Found ${items?.length || 0} menu items`);
      if (items && items.length > 0) {
        items.forEach(item => {
          console.log(`   - ${item.entity_name} (ID: ${item.id}, Org: ${item.organization_id})`);
        });
      }
    }

    // 3. Check menu item dynamic data
    if (items && items.length > 0) {
      console.log('\n📊 3. Checking Menu Item Dynamic Data:');
      const itemIds = items.map(i => i.id);
      
      const { data: dynamicData, error: dynError } = await supabase
        .from('core_dynamic_data')
        .select('*')
        .in('entity_id', itemIds)
        .limit(10);

      if (dynError) {
        console.error('❌ Error fetching dynamic data:', dynError);
      } else {
        console.log(`✅ Found ${dynamicData?.length || 0} dynamic data records`);
        if (dynamicData && dynamicData.length > 0) {
          // Group by entity
          const groupedData = {};
          dynamicData.forEach(d => {
            if (!groupedData[d.entity_id]) {
              groupedData[d.entity_id] = {};
            }
            groupedData[d.entity_id][d.field_name] = d.field_value;
          });

          // Show first item's complete data
          const firstItemId = Object.keys(groupedData)[0];
          if (firstItemId) {
            const firstItem = items.find(i => i.id === firstItemId);
            console.log(`\n   Sample Menu Item: ${firstItem?.entity_name}`);
            console.log('   Dynamic Fields:');
            Object.entries(groupedData[firstItemId]).forEach(([key, value]) => {
              console.log(`     - ${key}: ${value}`);
            });
          }
        }
      }
    }

    // 4. Check organizations
    console.log('\n🏢 4. Checking Organizations:');
    const { data: orgs, error: orgError } = await supabase
      .from('core_organizations')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    if (orgError) {
      console.error('❌ Error fetching organizations:', orgError);
    } else {
      console.log(`✅ Found ${orgs?.length || 0} organizations`);
      orgs?.forEach(org => {
        console.log(`   - ${org.org_name} (ID: ${org.id})`);
      });
    }

    // 5. Check if any menu data exists for each organization
    if (orgs && orgs.length > 0) {
      console.log('\n📊 5. Menu Data per Organization:');
      for (const org of orgs) {
        const { data: orgMenuItems } = await supabase
          .from('core_entities')
          .select('entity_type')
          .eq('organization_id', org.id)
          .in('entity_type', ['menu_category', 'menu_item']);

        const categoryCount = orgMenuItems?.filter(i => i.entity_type === 'menu_category').length || 0;
        const itemCount = orgMenuItems?.filter(i => i.entity_type === 'menu_item').length || 0;

        console.log(`   - ${org.org_name}: ${categoryCount} categories, ${itemCount} items`);
      }
    }

    // 6. Check for any products (alternative entity type)
    console.log('\n📦 6. Checking Products (alternative to menu items):');
    const { data: products, error: prodError } = await supabase
      .from('core_entities')
      .select('*')
      .eq('entity_type', 'product')
      .limit(5);

    if (prodError) {
      console.error('❌ Error fetching products:', prodError);
    } else {
      console.log(`✅ Found ${products?.length || 0} products`);
      products?.forEach(prod => {
        console.log(`   - ${prod.entity_name} (Org: ${prod.organization_id})`);
      });
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the debug
debugMenuData();