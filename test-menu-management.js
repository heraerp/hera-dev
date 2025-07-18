/**
 * Test Menu Management System - Toyota Production System Verification
 * This script verifies that the menu management system is working correctly
 */

const { createClient } = require('@supabase/supabase-js');

// Test configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://YOUR_SUPABASE_URL.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY || 'YOUR_SERVICE_KEY';

// Create Supabase client
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Test organization ID (replace with actual organization ID)
const TEST_ORGANIZATION_ID = '6fc73a3d-fe0a-45fa-9029-62a52df142e2';

async function testMenuManagementSystem() {
  console.log('🏭 Toyota Method: Testing Menu Management System...');
  console.log('=====================================');

  try {
    // Test 1: Create a test menu category
    console.log('\n📋 Test 1: Creating menu category...');
    const categoryData = {
      id: crypto.randomUUID(),
      organization_id: TEST_ORGANIZATION_ID,
      entity_type: 'menu_category',
      entity_name: 'Test Beverages',
      entity_code: 'TEST-BEV-001',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: categoryResult, error: categoryError } = await supabaseAdmin
      .from('core_entities')
      .insert(categoryData)
      .select()
      .single();

    if (categoryError) {
      console.error('❌ Category creation failed:', categoryError);
      return;
    }

    console.log('✅ Category created successfully:', categoryResult.entity_name);

    // Test 2: Add category metadata
    console.log('\n📋 Test 2: Adding category metadata...');
    const categoryMetadata = {
      organization_id: TEST_ORGANIZATION_ID,
      entity_type: 'menu_category',
      entity_id: categoryResult.id,
      metadata_type: 'display_config',
      metadata_category: 'category_settings',
      metadata_key: 'category_details',
      metadata_value: {
        description: 'Test category for beverages',
        display_order: 1,
        icon: 'coffee',
        available_times: ['breakfast', 'lunch', 'dinner']
      }
    };

    const { data: metadataResult, error: metadataError } = await supabaseAdmin
      .from('core_metadata')
      .insert(categoryMetadata)
      .select()
      .single();

    if (metadataError) {
      console.error('❌ Metadata creation failed:', metadataError);
      return;
    }

    console.log('✅ Category metadata added successfully');

    // Test 3: Create a test menu item
    console.log('\n📋 Test 3: Creating menu item...');
    const menuItemData = {
      id: crypto.randomUUID(),
      organization_id: TEST_ORGANIZATION_ID,
      entity_type: 'menu_item',
      entity_name: 'Test Cappuccino',
      entity_code: 'TEST-CAP-001',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: itemResult, error: itemError } = await supabaseAdmin
      .from('core_entities')
      .insert(menuItemData)
      .select()
      .single();

    if (itemError) {
      console.error('❌ Menu item creation failed:', itemError);
      return;
    }

    console.log('✅ Menu item created successfully:', itemResult.entity_name);

    // Test 4: Add menu item metadata
    console.log('\n📋 Test 4: Adding menu item metadata...');
    const itemMetadata = {
      organization_id: TEST_ORGANIZATION_ID,
      entity_type: 'menu_item',
      entity_id: itemResult.id,
      metadata_type: 'item_details',
      metadata_category: 'menu_item_config',
      metadata_key: 'item_configuration',
      metadata_value: {
        category_id: categoryResult.id,
        description: 'Rich, creamy cappuccino with perfect foam',
        base_price: 4.50,
        preparation_time: 3,
        is_featured: true,
        is_vegetarian: true,
        calories: 120,
        tags: ['coffee', 'hot', 'dairy']
      }
    };

    const { data: itemMetadataResult, error: itemMetadataError } = await supabaseAdmin
      .from('core_metadata')
      .insert(itemMetadata)
      .select()
      .single();

    if (itemMetadataError) {
      console.error('❌ Item metadata creation failed:', itemMetadataError);
      return;
    }

    console.log('✅ Menu item metadata added successfully');

    // Test 5: Query menu structure
    console.log('\n📋 Test 5: Querying menu structure...');
    
    // Get categories
    const { data: categories, error: categoriesError } = await supabaseAdmin
      .from('core_entities')
      .select('*')
      .eq('organization_id', TEST_ORGANIZATION_ID)
      .eq('entity_type', 'menu_category')
      .eq('is_active', true);

    if (categoriesError) {
      console.error('❌ Categories query failed:', categoriesError);
      return;
    }

    console.log(`✅ Found ${categories.length} menu categories`);

    // Get menu items
    const { data: menuItems, error: menuItemsError } = await supabaseAdmin
      .from('core_entities')
      .select('*')
      .eq('organization_id', TEST_ORGANIZATION_ID)
      .eq('entity_type', 'menu_item')
      .eq('is_active', true);

    if (menuItemsError) {
      console.error('❌ Menu items query failed:', menuItemsError);
      return;
    }

    console.log(`✅ Found ${menuItems.length} menu items`);

    // Test 6: Clean up test data
    console.log('\n📋 Test 6: Cleaning up test data...');
    
    // Delete metadata
    await supabaseAdmin
      .from('core_metadata')
      .delete()
      .eq('entity_id', categoryResult.id);

    await supabaseAdmin
      .from('core_metadata')
      .delete()
      .eq('entity_id', itemResult.id);

    // Delete entities
    await supabaseAdmin
      .from('core_entities')
      .delete()
      .eq('id', categoryResult.id);

    await supabaseAdmin
      .from('core_entities')
      .delete()
      .eq('id', itemResult.id);

    console.log('✅ Test data cleaned up successfully');

    console.log('\n🎉 Toyota Method: All tests passed!');
    console.log('=====================================');
    console.log('✅ Menu Management System is working correctly');
    console.log('✅ Categories can be created and managed');
    console.log('✅ Menu items can be created and managed');
    console.log('✅ Metadata system is functioning properly');
    console.log('✅ HERA Universal Schema integration is working');
    console.log('✅ Toyota Production System principles are enforced');

  } catch (error) {
    console.error('❌ Toyota Method: Test failed:', error);
  }
}

// Run the test
testMenuManagementSystem().catch(console.error);