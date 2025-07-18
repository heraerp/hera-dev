import { test, expect } from '@playwright/test';
import { login } from './helpers/login';

test.describe('Restaurant Module Tests', () => {
  // Use a fresh login for this test suite
  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage();
    await login(page);
    await page.close();
  });

  test('should access restaurant dashboard', async ({ page }) => {
    // Login for this specific test
    await login(page);
    
    // Navigate to restaurant module
    await page.goto('/restaurant');
    
    // Should not be redirected to login
    await expect(page).not.toHaveURL(/.*\/login.*/);
    
    // Check for restaurant-specific content
    const restaurantElements = [
      'text=Restaurant',
      'a[href="/restaurant/orders"]',
      'a[href="/restaurant/products"]',
      '[data-testid="restaurant-dashboard"]'
    ];

    let found = false;
    for (const selector of restaurantElements) {
      try {
        await page.waitForSelector(selector, { timeout: 5000 });
        found = true;
        console.log(`✅ Found restaurant element: ${selector}`);
        break;
      } catch {
        // Try next selector
      }
    }
    
    expect(found).toBeTruthy();
  });

  test('should manage products', async ({ page }) => {
    await login(page);
    await page.goto('/restaurant/products');
    
    // Should see products page
    await expect(page).toHaveURL(/.*\/restaurant\/products.*/);
    
    // Look for product management elements
    const productElements = [
      'text=Products',
      'button:has-text("Add Product")',
      'button:has-text("New Product")',
      '[data-testid="products-list"]'
    ];

    let found = false;
    for (const selector of productElements) {
      const element = await page.$(selector);
      if (element && await element.isVisible()) {
        found = true;
        console.log(`✅ Found product element: ${selector}`);
        break;
      }
    }
    
    expect(found).toBeTruthy();
  });

  test('should view orders', async ({ page }) => {
    await login(page);
    await page.goto('/restaurant/orders');
    
    // Should see orders page
    await expect(page).toHaveURL(/.*\/restaurant\/orders.*/);
    
    // Look for order management elements
    const orderElements = [
      'text=Orders',
      '[data-testid="orders-list"]',
      'table',
      'text=Order'
    ];

    let found = false;
    for (const selector of orderElements) {
      const element = await page.$(selector);
      if (element && await element.isVisible()) {
        found = true;
        console.log(`✅ Found order element: ${selector}`);
        break;
      }
    }
    
    expect(found).toBeTruthy();
  });
});