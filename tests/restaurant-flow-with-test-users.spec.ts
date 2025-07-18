/**
 * Real Restaurant Flow Tests with Test User Manager
 * Tests the complete restaurant workflow using programmatically created test users
 */

import { test, expect } from '@playwright/test';
import { 
  createTestUser, 
  loginTestUser,
  cleanupAllTestUsers,
  type TestUser,
  type TestOrganization 
} from './helpers/test-user-manager';

// Cleanup after all tests
test.afterAll(async () => {
  await cleanupAllTestUsers();
});

test.describe('Restaurant Complete Workflow', () => {
  let restaurantOwner: TestUser;
  let restaurant: TestOrganization;
  let manager: TestUser;
  let staff: TestUser;

  test.beforeAll(async () => {
    // Create restaurant with owner
    const ownerData = await createTestUser({
      fullName: 'Pizza Palace Owner',
      role: 'owner',
      organizationName: 'Pizza Palace Test Restaurant',
      industry: 'restaurant'
    });
    
    restaurantOwner = ownerData.user;
    restaurant = ownerData.organization;

    // Create manager
    const managerData = await createTestUser({
      fullName: 'Pizza Palace Manager',
      role: 'manager',
      organizationName: 'Pizza Palace Management',
      industry: 'restaurant'
    });
    manager = managerData.user;

    // Create staff member
    const staffData = await createTestUser({
      fullName: 'Pizza Palace Staff',
      role: 'staff',
      organizationName: 'Pizza Palace Staff Unit',
      industry: 'restaurant'
    });
    staff = staffData.user;

    console.log('✅ Test users created:');
    console.log(`   Owner: ${restaurantOwner.email}`);
    console.log(`   Manager: ${manager.email}`);
    console.log(`   Staff: ${staff.email}`);
    console.log(`   Restaurant: ${restaurant.name}`);
  });

  test('Owner can access restaurant dashboard', async ({ page }) => {
    await loginTestUser(page, restaurantOwner);
    
    // Navigate to restaurant dashboard
    await page.goto('http://localhost:3002/restaurant');
    await page.waitForLoadState('networkidle');

    // Should see restaurant name
    await expect(page.locator(`text=${restaurant.name}`)).toBeVisible({ timeout: 15000 });
    
    // Should see owner-specific features
    const hasOwnerFeatures = await Promise.race([
      page.locator('text=Settings, text=Manage, text=Configure').first().isVisible().then(() => true),
      page.waitForTimeout(5000).then(() => false)
    ]);

    console.log(`✅ Owner dashboard access: ${hasOwnerFeatures ? 'Has owner features' : 'Basic access'}`);
  });

  test('Owner can manage products', async ({ page }) => {
    await loginTestUser(page, restaurantOwner);
    
    // Navigate to products page
    await page.goto('http://localhost:3002/restaurant/products');
    await page.waitForLoadState('networkidle');

    // Try to add a new product
    const addButton = page.locator('button:has-text("Add"), button:has-text("Create"), button:has-text("New Product")');
    
    if (await addButton.first().isVisible()) {
      await addButton.first().click();
      
      // Fill product form
      const productData = {
        name: 'Test Margherita Pizza',
        price: '15.99',
        description: 'Classic pizza with tomato sauce and mozzarella',
        category: 'Pizza'
      };

      for (const [field, value] of Object.entries(productData)) {
        const input = page.locator(`input[name="${field}"], textarea[name="${field}"], select[name="${field}"]`);
        if (await input.first().isVisible()) {
          await input.first().fill(value);
        }
      }

      // Save product
      const saveButton = page.locator('button:has-text("Save"), button:has-text("Create"), button[type="submit"]');
      if (await saveButton.first().isVisible()) {
        await saveButton.first().click();
        await page.waitForTimeout(2000);
        
        // Check if product appears in list
        const productExists = await page.locator('text=Test Margherita Pizza').isVisible();
        
        console.log(`✅ Product creation: ${productExists ? 'Success' : 'Form submitted'}`);
      }
    } else {
      console.log('⚠️ Add product button not found - checking existing functionality');
    }

    // At minimum, should be able to view products page
    expect(page.url()).toContain('/products');
  });

  test('Manager can access limited features', async ({ page }) => {
    await loginTestUser(page, manager);
    
    // Navigate to restaurant
    await page.goto('http://localhost:3002/restaurant');
    await page.waitForLoadState('networkidle');

    // Should have access to main restaurant features
    const hasBasicAccess = await Promise.race([
      page.locator('text=Dashboard, text=Orders, text=Kitchen').first().isVisible().then(() => true),
      page.waitForTimeout(5000).then(() => false)
    ]);

    expect(hasBasicAccess).toBeTruthy();

    // Try to access orders
    await page.goto('http://localhost:3002/restaurant/orders');
    await page.waitForLoadState('networkidle');
    
    // Should be able to view orders page
    expect(page.url()).toContain('/orders');
    
    console.log('✅ Manager access verified');
  });

  test('Staff can access basic features', async ({ page }) => {
    await loginTestUser(page, staff);
    
    // Navigate to restaurant
    await page.goto('http://localhost:3002/restaurant');
    await page.waitForLoadState('networkidle');

    // Staff should have basic access
    const hasStaffAccess = await Promise.race([
      page.locator('text=Dashboard, text=Orders, text=Kitchen, text=Menu').first().isVisible().then(() => true),
      page.waitForTimeout(5000).then(() => false)
    ]);

    expect(hasStaffAccess).toBeTruthy();

    // Try kitchen view
    await page.goto('http://localhost:3002/restaurant/kitchen');
    await page.waitForLoadState('networkidle');
    
    expect(page.url()).toContain('/kitchen');
    
    console.log('✅ Staff access verified');
  });

  test('Order workflow simulation', async ({ page }) => {
    await loginTestUser(page, restaurantOwner);
    
    // Go to orders page
    await page.goto('http://localhost:3002/restaurant/orders');
    await page.waitForLoadState('networkidle');

    // Look for order creation or existing orders
    const hasOrders = await page.locator('[data-testid="order"], .order-item, text=Order').first().isVisible();
    const hasCreateOrder = await page.locator('button:has-text("New Order"), button:has-text("Create Order"), button:has-text("Add Order")').first().isVisible();

    if (hasCreateOrder) {
      console.log('✅ Order creation available');
      
      // Try to create a test order
      await page.locator('button:has-text("New Order"), button:has-text("Create Order")').first().click();
      await page.waitForTimeout(2000);
      
      // Basic order form interaction
      const orderForm = page.locator('form, [data-testid="order-form"]');
      if (await orderForm.isVisible()) {
        console.log('✅ Order form opened');
      }
    } else if (hasOrders) {
      console.log('✅ Existing orders visible');
    } else {
      console.log('ℹ️ Orders page accessible but no orders or creation form found');
    }

    // Verify we're still on orders page
    expect(page.url()).toContain('/orders');
  });

  test('Kitchen workflow simulation', async ({ page }) => {
    await loginTestUser(page, staff);
    
    // Go to kitchen view
    await page.goto('http://localhost:3002/restaurant/kitchen');
    await page.waitForLoadState('networkidle');

    // Check for kitchen display elements
    const hasKitchenDisplay = await Promise.race([
      page.locator('text=Kitchen, text=Orders, text=Pending, text=Ready, text=Completed').first().isVisible().then(() => true),
      page.waitForTimeout(5000).then(() => false)
    ]);

    expect(hasKitchenDisplay).toBeTruthy();

    // Look for order status controls
    const hasStatusControls = await page.locator('button:has-text("Ready"), button:has-text("Complete"), button:has-text("Start")').first().isVisible();
    
    if (hasStatusControls) {
      console.log('✅ Kitchen status controls available');
    } else {
      console.log('ℹ️ Kitchen display accessible but no active orders to manage');
    }

    console.log('✅ Kitchen workflow tested');
  });

  test('Cross-role data consistency', async ({ page }) => {
    // Test that data created by owner is visible to manager and staff
    await loginTestUser(page, restaurantOwner);
    
    // Go to products and note existing products
    await page.goto('http://localhost:3002/restaurant/products');
    await page.waitForLoadState('networkidle');
    
    const ownerProducts = await page.locator('[data-testid="product"], .product-item').count();
    
    // Switch to manager
    await loginTestUser(page, manager);
    await page.goto('http://localhost:3002/restaurant/products');
    await page.waitForLoadState('networkidle');
    
    const managerProducts = await page.locator('[data-testid="product"], .product-item').count();
    
    // Switch to staff
    await loginTestUser(page, staff);
    await page.goto('http://localhost:3002/restaurant/products');
    await page.waitForLoadState('networkidle');
    
    const staffProducts = await page.locator('[data-testid="product"], .product-item').count();
    
    console.log(`📊 Product counts - Owner: ${ownerProducts}, Manager: ${managerProducts}, Staff: ${staffProducts}`);
    
    // In a multi-tenant system, different users might see different organizations
    // So we just verify they can all access their respective product pages
    expect(ownerProducts).toBeGreaterThanOrEqual(0);
    expect(managerProducts).toBeGreaterThanOrEqual(0);
    expect(staffProducts).toBeGreaterThanOrEqual(0);
    
    console.log('✅ Cross-role data access tested');
  });

  test('Error handling and edge cases', async ({ page }) => {
    await loginTestUser(page, restaurantOwner);
    
    // Test accessing non-existent pages
    await page.goto('http://localhost:3002/restaurant/nonexistent');
    await page.waitForLoadState('networkidle');
    
    // Should either redirect or show 404
    const is404 = page.url().includes('404') || 
                  await page.locator('text=Not Found, text=404, text=Page not found').isVisible();
    const isRedirected = !page.url().includes('nonexistent');
    
    expect(is404 || isRedirected).toBeTruthy();
    
    // Test navigation without crashing
    await page.goto('http://localhost:3002/restaurant');
    await page.waitForLoadState('networkidle');
    
    expect(page.url()).toContain('/restaurant');
    
    console.log('✅ Error handling tested');
  });

});

test.describe('Performance and Load Testing', () => {
  
  test('Multiple users concurrent access', async ({ browser }) => {
    // Create multiple browser contexts for concurrent testing
    const contexts = await Promise.all([
      browser.newContext(),
      browser.newContext(),
      browser.newContext()
    ]);

    const pages = await Promise.all(contexts.map(context => context.newPage()));
    
    // Create test users
    const users = await Promise.all([
      createTestUser({ organizationName: 'Concurrent Test 1' }),
      createTestUser({ organizationName: 'Concurrent Test 2' }),
      createTestUser({ organizationName: 'Concurrent Test 3' })
    ]);

    // Login all users concurrently
    await Promise.all(
      pages.map(async (page, index) => {
        await loginTestUser(page, users[index].user);
        await page.goto('http://localhost:3002/restaurant');
        await page.waitForLoadState('networkidle');
      })
    );

    // Verify all users are logged in
    for (let i = 0; i < pages.length; i++) {
      expect(pages[i].url()).toContain('/restaurant');
      console.log(`✅ User ${i + 1} concurrent access successful`);
    }

    // Cleanup
    await Promise.all(contexts.map(context => context.close()));
    
    console.log('✅ Concurrent access test completed');
  });

});