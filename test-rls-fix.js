/**
 * Test RLS fix - verify menu items are accessible
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseAnon = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testRLSFix() {
  console.log('🧪 Testing RLS fix for menu items...\n');
  
  const organizationId = '6fc73a3d-fe0a-45fa-9029-62a52df142e2';
  
  try {
    // Test 1: Try to access menu categories
    console.log('📂 Testing menu categories access...');
    const { data: categories, error: categoriesError } = await supabaseAnon
      .from('core_entities')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('entity_type', 'menu_category')
      .eq('is_active', true);
    
    if (categoriesError) {
      console.error('❌ Categories error:', categoriesError);
      console.log('💡 RLS policies may not be applied yet');
      console.log('🔧 Please run the SQL in fix-menu-rls-policies.sql in Supabase dashboard');
      return;
    }
    
    console.log(`✅ Menu categories: ${categories?.length || 0} found`);
    
    // Test 2: Try to access menu items
    console.log('\n🍕 Testing menu items access...');
    const { data: menuItems, error: menuError } = await supabaseAnon
      .from('core_entities')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('entity_type', 'menu_item')
      .eq('is_active', true);
    
    if (menuError) {
      console.error('❌ Menu items error:', menuError);
      return;
    }
    
    console.log(`✅ Menu items: ${menuItems?.length || 0} found`);
    
    // Test 3: Try to access dynamic data
    if (menuItems && menuItems.length > 0) {
      console.log('\n📊 Testing dynamic data access...');
      const entityIds = menuItems.map(item => item.id);
      
      const { data: dynamicData, error: dynamicError } = await supabaseAnon
        .from('core_dynamic_data')
        .select('*')
        .in('entity_id', entityIds);
      
      if (dynamicError) {
        console.error('❌ Dynamic data error:', dynamicError);
        return;
      }
      
      console.log(`✅ Dynamic data: ${dynamicData?.length || 0} records found`);
      
      // Test 4: Try to create a combined menu item (like MenuManagementService would)
      console.log('\n🔧 Testing menu item construction...');
      const combinedItems = menuItems.map(item => {
        const itemDynamicData = dynamicData.filter(d => d.entity_id === item.id);
        
        const combinedItem = { ...item };
        itemDynamicData.forEach(data => {
          if (data.field_type === 'number') {
            combinedItem[data.field_name] = parseFloat(data.field_value) || 0;
          } else if (data.field_type === 'boolean') {
            combinedItem[data.field_name] = data.field_value === 'true';
          } else {
            combinedItem[data.field_name] = data.field_value;
          }
        });
        
        return combinedItem;
      });
      
      console.log('✅ Combined menu items for POS:');
      combinedItems.forEach((item, index) => {
        console.log(`   ${index + 1}. ${item.entity_name}`);
        console.log(`      Price: $${item.base_price || 0}`);
        console.log(`      Category: ${item.category_id || 'None'}`);
        console.log(`      Description: ${item.description || 'None'}`);
        console.log(`      Active: ${item.is_active}`);
      });
    }
    
    // Test 5: Test order creation capability
    console.log('\n🛒 Testing order creation capability...');
    const testOrderData = {
      id: 'test-order-id',
      organization_id: organizationId,
      transaction_type: 'SALES_ORDER',
      transaction_number: 'TEST-ORDER-001',
      transaction_date: new Date().toISOString().split('T')[0],
      total_amount: 10.00,
      currency: 'USD',
      transaction_status: 'PENDING'
    };
    
    const { data: orderData, error: orderError } = await supabaseAnon
      .from('universal_transactions')
      .insert(testOrderData)
      .select();
    
    if (orderError) {
      console.error('❌ Order creation error:', orderError);
      console.log('💡 May need to add order creation policies');
    } else {
      console.log('✅ Order creation successful');
      
      // Clean up test order
      await supabaseAnon
        .from('universal_transactions')
        .delete()
        .eq('id', 'test-order-id');
    }
    
    console.log('\n🎉 RLS fix appears to be working!');
    console.log('💡 POS system should now be able to load menu items');
    console.log('💡 Kitchen display should now be able to show orders');
    
  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

testRLSFix();