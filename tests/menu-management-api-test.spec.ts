/**
 * 🍽️ HERA Menu Management API Testing
 * 
 * This test focuses on the backend API functionality for Mario's Restaurant
 * menu management without UI dependencies.
 */

import { test, expect } from '@playwright/test';

const MARIO_ORG_ID = '123e4567-e89b-12d3-a456-426614174000';
const BASE_URL = 'http://localhost:3000';

// Test data
const TEST_CATEGORY = {
  organizationId: MARIO_ORG_ID,
  name: 'Playwright Test Category',
  description: 'Test category created by Playwright',
  color: '#4CAF50',
  icon: 'coffee'
};

const TEST_MENU_ITEM = {
  organizationId: MARIO_ORG_ID,
  name: 'Playwright Test Item',
  description: 'Test menu item created by Playwright',
  basePrice: 15.99,
  costPrice: 5.50,
  prepTimeMinutes: 12,
  isAvailable: true,
  allergens: ['gluten', 'dairy']
};

let testCategoryId: string;
let testItemId: string;

test.describe('🍽️ Menu Management API Tests', () => {

  test('📂 Menu Categories API - Full CRUD Cycle', async ({ request }) => {
    console.log('🧪 Testing Menu Categories API...');

    // 1. GET categories - initial state
    console.log('📋 Getting initial categories...');
    const initialResponse = await request.get(`${BASE_URL}/api/menu/categories?organizationId=${MARIO_ORG_ID}`);
    expect(initialResponse.ok()).toBeTruthy();
    
    const initialData = await initialResponse.json();
    console.log(`📊 Initial categories count: ${initialData.total}`);

    // 2. POST - Create new category
    console.log('➕ Creating new category...');
    const createResponse = await request.post(`${BASE_URL}/api/menu/categories`, {
      data: TEST_CATEGORY
    });
    
    expect(createResponse.ok()).toBeTruthy();
    const createData = await createResponse.json();
    expect(createData.success).toBe(true);
    expect(createData.data.name).toBe(TEST_CATEGORY.name);
    
    testCategoryId = createData.data.id;
    console.log(`✅ Category created with ID: ${testCategoryId}`);

    // 3. GET categories - verify creation
    console.log('🔍 Verifying category was created...');
    const verifyResponse = await request.get(`${BASE_URL}/api/menu/categories?organizationId=${MARIO_ORG_ID}`);
    expect(verifyResponse.ok()).toBeTruthy();
    
    const verifyData = await verifyResponse.json();
    expect(verifyData.total).toBe(initialData.total + 1);
    
    const createdCategory = verifyData.data.find((cat: any) => cat.id === testCategoryId);
    expect(createdCategory).toBeDefined();
    expect(createdCategory.name).toBe(TEST_CATEGORY.name);
    expect(createdCategory.description).toBe(TEST_CATEGORY.description);
    console.log('✅ Category creation verified');

    // 4. PUT - Update category
    console.log('✏️ Updating category...');
    const updatedName = 'Updated Playwright Category';
    const updateResponse = await request.put(`${BASE_URL}/api/menu/categories`, {
      data: {
        id: testCategoryId,
        name: updatedName,
        description: 'Updated description'
      }
    });
    
    expect(updateResponse.ok()).toBeTruthy();
    const updateData = await updateResponse.json();
    expect(updateData.success).toBe(true);
    console.log('✅ Category updated successfully');

    // 5. Verify update
    console.log('🔍 Verifying category update...');
    const verifyUpdateResponse = await request.get(`${BASE_URL}/api/menu/categories?organizationId=${MARIO_ORG_ID}`);
    const verifyUpdateData = await verifyUpdateResponse.json();
    
    const updatedCategory = verifyUpdateData.data.find((cat: any) => cat.id === testCategoryId);
    expect(updatedCategory.name).toBe(updatedName);
    console.log('✅ Category update verified');

    console.log('🎉 Menu Categories API test completed successfully');
  });

  test('🍽️ Menu Items API - Full CRUD Cycle', async ({ request }) => {
    console.log('🧪 Testing Menu Items API...');

    // Ensure we have a category for the item
    if (!testCategoryId) {
      const categoryResponse = await request.post(`${BASE_URL}/api/menu/categories`, {
        data: TEST_CATEGORY
      });
      const categoryData = await categoryResponse.json();
      testCategoryId = categoryData.data.id;
    }

    // Add category ID to test item
    const testItem = { ...TEST_MENU_ITEM, categoryId: testCategoryId };

    // 1. GET items - initial state
    console.log('📋 Getting initial menu items...');
    const initialResponse = await request.get(`${BASE_URL}/api/menu/items?organizationId=${MARIO_ORG_ID}`);
    expect(initialResponse.ok()).toBeTruthy();
    
    const initialData = await initialResponse.json();
    console.log(`📊 Initial items count: ${initialData.total}`);
    console.log(`📊 Average margin: ${initialData.summary.average_margin}%`);

    // 2. POST - Create new item
    console.log('➕ Creating new menu item...');
    const createResponse = await request.post(`${BASE_URL}/api/menu/items`, {
      data: testItem
    });
    
    expect(createResponse.ok()).toBeTruthy();
    const createData = await createResponse.json();
    expect(createData.success).toBe(true);
    expect(createData.data.name).toBe(TEST_MENU_ITEM.name);
    expect(createData.data.profitMargin).toBeGreaterThan(0);
    
    testItemId = createData.data.id;
    console.log(`✅ Menu item created with ID: ${testItemId}`);
    console.log(`💰 Profit margin: ${createData.data.profitMargin}%`);

    // 3. GET items - verify creation
    console.log('🔍 Verifying menu item was created...');
    const verifyResponse = await request.get(`${BASE_URL}/api/menu/items?organizationId=${MARIO_ORG_ID}`);
    expect(verifyResponse.ok()).toBeTruthy();
    
    const verifyData = await verifyResponse.json();
    expect(verifyData.total).toBe(initialData.total + 1);
    
    const createdItem = verifyData.data.find((item: any) => item.id === testItemId);
    expect(createdItem).toBeDefined();
    expect(createdItem.name).toBe(TEST_MENU_ITEM.name);
    expect(createdItem.basePrice).toBe(TEST_MENU_ITEM.basePrice);
    expect(createdItem.costPrice).toBe(TEST_MENU_ITEM.costPrice);
    expect(createdItem.profitMargin).toBeGreaterThan(60); // Should be ~65.6%
    console.log('✅ Menu item creation verified');

    // 4. PUT - Update item
    console.log('✏️ Updating menu item...');
    const updatedPrice = 17.99;
    const updateResponse = await request.put(`${BASE_URL}/api/menu/items`, {
      data: {
        id: testItemId,
        name: 'Updated Playwright Item',
        basePrice: updatedPrice,
        organizationId: MARIO_ORG_ID
      }
    });
    
    expect(updateResponse.ok()).toBeTruthy();
    const updateData = await updateResponse.json();
    expect(updateData.success).toBe(true);
    console.log('✅ Menu item updated successfully');

    // 5. Verify update
    console.log('🔍 Verifying menu item update...');
    const verifyUpdateResponse = await request.get(`${BASE_URL}/api/menu/items?organizationId=${MARIO_ORG_ID}`);
    const verifyUpdateData = await verifyUpdateResponse.json();
    
    const updatedItem = verifyUpdateData.data.find((item: any) => item.id === testItemId);
    expect(updatedItem.name).toBe('Updated Playwright Item');
    expect(updatedItem.basePrice).toBe(updatedPrice);
    console.log('✅ Menu item update verified');

    console.log('🎉 Menu Items API test completed successfully');
  });

  test('🍽️🍽️ Composite Menu Items (Combos)', async ({ request }) => {
    console.log('🧪 Testing Composite Menu Items...');

    // Ensure we have items to use as components
    const pizza = await request.post(`${BASE_URL}/api/menu/items`, {
      data: {
        organizationId: MARIO_ORG_ID,
        name: 'Test Pizza Component',
        description: 'Pizza for combo',
        basePrice: 18.99,
        costPrice: 6.50,
        categoryId: testCategoryId || 'default',
        prepTimeMinutes: 15
      }
    });
    const pizzaData = await pizza.json();
    const pizzaId = pizzaData.data.id;

    const salad = await request.post(`${BASE_URL}/api/menu/items`, {
      data: {
        organizationId: MARIO_ORG_ID,
        name: 'Test Salad Component',
        description: 'Salad for combo',
        basePrice: 12.99,
        costPrice: 4.25,
        categoryId: testCategoryId || 'default',
        prepTimeMinutes: 8
      }
    });
    const saladData = await salad.json();
    const saladId = saladData.data.id;

    // Create combo meal
    console.log('🍽️🍽️ Creating combo meal...');
    const comboResponse = await request.post(`${BASE_URL}/api/menu/items`, {
      data: {
        organizationId: MARIO_ORG_ID,
        name: 'Playwright Test Combo',
        description: 'Test combo meal with multiple components',
        basePrice: 24.99,
        costPrice: 8.75,
        categoryId: testCategoryId || 'default',
        prepTimeMinutes: 20,
        itemType: 'composite',
        components: [
          {
            itemId: pizzaId,
            itemName: 'Test Pizza Component',
            portionSize: 1.0,
            quantity: 1,
            sequenceOrder: 1,
            isMandatory: true
          },
          {
            itemId: saladId,
            itemName: 'Test Salad Component',
            portionSize: 0.5,
            quantity: 1,
            sequenceOrder: 2,
            isMandatory: false
          }
        ]
      }
    });

    expect(comboResponse.ok()).toBeTruthy();
    const comboData = await comboResponse.json();
    expect(comboData.success).toBe(true);
    expect(comboData.data.type).toBe('composite_menu_item');
    
    console.log(`✅ Combo meal created: ${comboData.data.name}`);
    console.log(`💰 Combo profit margin: ${comboData.data.profitMargin}%`);

    // Verify combo appears in composite items list
    console.log('🔍 Verifying combo in composite items list...');
    const comboListResponse = await request.get(`${BASE_URL}/api/menu/items?organizationId=${MARIO_ORG_ID}&itemType=composite&includeComponents=true`);
    expect(comboListResponse.ok()).toBeTruthy();
    
    const comboListData = await comboListResponse.json();
    const createdCombo = comboListData.data.find((item: any) => item.id === comboData.data.id);
    expect(createdCombo).toBeDefined();
    expect(createdCombo.itemType).toBe('composite');
    
    console.log('✅ Combo meal verification completed');
  });

  test('📊 Menu Analytics API', async ({ request }) => {
    console.log('🧪 Testing Menu Analytics...');

    const analyticsResponse = await request.get(`${BASE_URL}/api/menu/analytics?organizationId=${MARIO_ORG_ID}`);
    expect(analyticsResponse.ok()).toBeTruthy();
    
    const analyticsData = await analyticsResponse.json();
    expect(analyticsData.success).toBe(true);
    expect(analyticsData.data.summary).toBeDefined();
    
    const summary = analyticsData.data.summary;
    
    // Verify analytics structure
    expect(summary.totalItems).toBeGreaterThan(0);
    expect(summary.totalCategories).toBeGreaterThan(0);
    expect(summary.averageItemPrice).toBeGreaterThan(0);
    expect(summary.averageProfitMargin).toBeGreaterThan(0);
    
    console.log(`📊 Analytics Summary:`);
    console.log(`   Total Items: ${summary.totalItems}`);
    console.log(`   Total Categories: ${summary.totalCategories}`);
    console.log(`   Average Price: $${summary.averageItemPrice}`);
    console.log(`   Average Margin: ${summary.averageProfitMargin}%`);
    console.log(`   Total Menu Value: $${summary.totalMenuValue}`);

    // Verify category performance data
    expect(analyticsData.data.categoryPerformance).toBeDefined();
    expect(analyticsData.data.topItems).toBeDefined();
    expect(analyticsData.data.profitabilityAnalysis).toBeDefined();
    expect(analyticsData.data.recommendations).toBeDefined();

    console.log(`📈 Categories analyzed: ${analyticsData.data.categoryPerformance.length}`);
    console.log(`💡 Recommendations provided: ${analyticsData.data.recommendations.length}`);

    console.log('✅ Menu Analytics test completed successfully');
  });

  test('⚡ API Performance Testing', async ({ request }) => {
    console.log('🧪 Testing API Performance...');

    // Test categories endpoint performance
    const categoryStartTime = Date.now();
    const categoryResponse = await request.get(`${BASE_URL}/api/menu/categories?organizationId=${MARIO_ORG_ID}`);
    const categoryEndTime = Date.now();
    
    expect(categoryResponse.ok()).toBeTruthy();
    const categoryTime = categoryEndTime - categoryStartTime;
    console.log(`⏱️ Categories API: ${categoryTime}ms`);
    expect(categoryTime).toBeLessThan(2000); // Should be under 2 seconds

    // Test items endpoint performance
    const itemsStartTime = Date.now();
    const itemsResponse = await request.get(`${BASE_URL}/api/menu/items?organizationId=${MARIO_ORG_ID}`);
    const itemsEndTime = Date.now();
    
    expect(itemsResponse.ok()).toBeTruthy();
    const itemsTime = itemsEndTime - itemsStartTime;
    console.log(`⏱️ Items API: ${itemsTime}ms`);
    expect(itemsTime).toBeLessThan(3000); // Should be under 3 seconds

    // Test analytics endpoint performance
    const analyticsStartTime = Date.now();
    const analyticsResponse = await request.get(`${BASE_URL}/api/menu/analytics?organizationId=${MARIO_ORG_ID}`);
    const analyticsEndTime = Date.now();
    
    expect(analyticsResponse.ok()).toBeTruthy();
    const analyticsTime = analyticsEndTime - analyticsStartTime;
    console.log(`⏱️ Analytics API: ${analyticsTime}ms`);
    expect(analyticsTime).toBeLessThan(5000); // Should be under 5 seconds

    console.log('✅ Performance testing completed - all APIs within acceptable limits');
  });

  test('🛡️ Error Handling and Validation', async ({ request }) => {
    console.log('🧪 Testing Error Handling...');

    // Test missing required fields
    console.log('🚫 Testing missing required fields...');
    const invalidCategoryResponse = await request.post(`${BASE_URL}/api/menu/categories`, {
      data: {
        organizationId: MARIO_ORG_ID
        // Missing name field
      }
    });
    
    expect(invalidCategoryResponse.status()).toBe(400);
    const invalidCategoryData = await invalidCategoryResponse.json();
    expect(invalidCategoryData.error).toContain('required');

    // Test invalid organization ID
    console.log('🚫 Testing invalid organization ID...');
    const invalidOrgResponse = await request.get(`${BASE_URL}/api/menu/categories?organizationId=invalid-id`);
    expect(invalidOrgResponse.ok()).toBeTruthy(); // Should still return (empty results)
    
    const invalidOrgData = await invalidOrgResponse.json();
    expect(invalidOrgData.total).toBe(0);

    // Test missing organization ID
    console.log('🚫 Testing missing organization ID...');
    const missingOrgResponse = await request.get(`${BASE_URL}/api/menu/categories`);
    expect(missingOrgResponse.status()).toBe(400);
    
    const missingOrgData = await missingOrgResponse.json();
    expect(missingOrgData.error).toContain('organizationId is required');

    // Test invalid item data
    console.log('🚫 Testing invalid menu item data...');
    const invalidItemResponse = await request.post(`${BASE_URL}/api/menu/items`, {
      data: {
        organizationId: MARIO_ORG_ID,
        name: 'Test Item'
        // Missing required categoryId, basePrice, costPrice
      }
    });
    
    expect(invalidItemResponse.status()).toBe(400);

    console.log('✅ Error handling tests completed successfully');
  });

  // Cleanup test
  test('🧹 Cleanup Test Data', async ({ request }) => {
    console.log('🧹 Cleaning up test data...');

    const cleanupItems = [
      'Playwright Test Item',
      'Updated Playwright Item',
      'Test Pizza Component',
      'Test Salad Component',
      'Playwright Test Combo'
    ];

    // Get all items
    const itemsResponse = await request.get(`${BASE_URL}/api/menu/items?organizationId=${MARIO_ORG_ID}`);
    if (itemsResponse.ok()) {
      const itemsData = await itemsResponse.json();
      
      // Delete test items
      for (const item of itemsData.data) {
        if (cleanupItems.includes(item.name)) {
          try {
            await request.delete(`${BASE_URL}/api/menu/items?id=${item.id}`);
            console.log(`🗑️ Deleted item: ${item.name}`);
          } catch (error) {
            console.log(`⚠️ Could not delete item: ${item.name}`);
          }
        }
      }
    }

    // Delete test categories
    const categoriesResponse = await request.get(`${BASE_URL}/api/menu/categories?organizationId=${MARIO_ORG_ID}`);
    if (categoriesResponse.ok()) {
      const categoriesData = await categoriesResponse.json();
      
      for (const category of categoriesData.data) {
        if (category.name.includes('Playwright') || category.name.includes('Test')) {
          try {
            await request.delete(`${BASE_URL}/api/menu/categories?id=${category.id}`);
            console.log(`🗑️ Deleted category: ${category.name}`);
          } catch (error) {
            console.log(`⚠️ Could not delete category: ${category.name}`);
          }
        }
      }
    }

    console.log('✅ Cleanup completed');
  });

});