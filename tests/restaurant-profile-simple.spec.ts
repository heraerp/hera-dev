import { test, expect } from '@playwright/test';

/**
 * Simple Restaurant Profile Testing
 * Tests basic functionality without complex authentication
 */

test.describe('Restaurant Profile Basic Tests', () => {
  
  test('should load restaurant profile page', async ({ page }) => {
    console.log('🏪 Testing basic restaurant profile page load...');
    
    // Navigate directly to restaurant profile page
    await page.goto('/restaurant/profile');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Take a screenshot for debugging
    await page.screenshot({ path: 'test-results/restaurant-profile-basic.png', fullPage: true });
    
    // Check that we're on the restaurant profile page
    expect(page.url()).toContain('/restaurant/profile');
    
    // Check if we get redirected to login (expected for unauthenticated user)
    if (page.url().includes('/login')) {
      console.log('✅ Unauthenticated user correctly redirected to login');
      
      // Verify login page elements
      await expect(page.locator('input#email')).toBeVisible();
      await expect(page.locator('input#password')).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toBeVisible();
      
    } else {
      console.log('✅ User may be authenticated or page allows anonymous access');
      
      // Check for one of the expected states
      const loadingIndicator = page.locator('text=Loading restaurant profile...');
      const noRestaurantMessage = page.locator('text=No Restaurant Found');
      const errorMessage = page.locator('text=Unable to Load Profile');
      const restaurantContent = page.locator('[data-testid="restaurant-content"]');
      
      // Wait for one of these states to appear
      await page.waitForSelector(
        'text=Loading restaurant profile..., text=No Restaurant Found, text=Unable to Load Profile, [data-testid="restaurant-content"]',
        { timeout: 10000 }
      );
      
      // Check which state we're in
      if (await loadingIndicator.isVisible()) {
        console.log('ℹ️ Page is in loading state');
        
        // Wait for loading to complete
        await page.waitForSelector(
          'text=No Restaurant Found, text=Unable to Load Profile, [data-testid="restaurant-content"]',
          { timeout: 15000 }
        );
      }
      
      if (await restaurantContent.isVisible()) {
        console.log('✅ Restaurant content loaded successfully');
        await expect(page.locator('h1')).toBeVisible();
        
      } else if (await noRestaurantMessage.isVisible()) {
        console.log('ℹ️ No restaurant found - showing setup guidance');
        await expect(page.locator('button:has-text("Setup Restaurant")')).toBeVisible();
        
      } else if (await errorMessage.isVisible()) {
        console.log('⚠️ Error loading restaurant profile');
        await expect(page.locator('button:has-text("Retry")')).toBeVisible();
      }
    }
  });

  test('should handle responsive design on restaurant profile', async ({ page }) => {
    console.log('📱 Testing responsive design...');
    
    await page.goto('/restaurant/profile');
    await page.waitForLoadState('networkidle');
    
    // Test different viewport sizes
    const viewports = [
      { width: 1920, height: 1080, name: 'desktop' },
      { width: 1024, height: 768, name: 'tablet' },
      { width: 375, height: 667, name: 'mobile' }
    ];
    
    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.waitForTimeout(500);
      
      await page.screenshot({ 
        path: `test-results/restaurant-profile-${viewport.name}.png`, 
        fullPage: true 
      });
      
      // Check that content is accessible
      const bodyScrollWidth = await page.evaluate(() => document.body.scrollWidth);
      const windowInnerWidth = await page.evaluate(() => window.innerWidth);
      
      // Should not have horizontal scrolling
      expect(bodyScrollWidth).toBeLessThanOrEqual(windowInnerWidth + 1);
      
      console.log(`✅ ${viewport.name} viewport (${viewport.width}x${viewport.height}) - no horizontal scroll`);
    }
  });

  test('should test setup button if present', async ({ page }) => {
    console.log('🏗️ Testing setup button functionality...');
    
    await page.goto('/restaurant/profile');
    await page.waitForLoadState('networkidle');
    
    // Look for setup button
    const setupButton = page.locator('button:has-text("Setup Restaurant")');
    
    // Wait a bit for any dynamic content to load
    await page.waitForTimeout(2000);
    
    if (await setupButton.isVisible({ timeout: 5000 })) {
      console.log('✅ Found setup button, testing click behavior');
      
      // Test that button is clickable
      await expect(setupButton).toBeEnabled();
      
      // Click the button and check navigation
      await setupButton.click();
      await page.waitForLoadState('networkidle');
      
      // Should navigate to setup page
      expect(page.url()).toContain('/setup');
      console.log('✅ Setup button navigation successful:', page.url());
      
    } else {
      console.log('ℹ️ No setup button found - this could indicate:');
      console.log('  - User is authenticated and has a restaurant profile');
      console.log('  - User is redirected to login page');
      console.log('  - Different state is displayed');
    }
  });

  test('should verify page structure and elements', async ({ page }) => {
    console.log('🔍 Testing page structure and elements...');
    
    await page.goto('/restaurant/profile');
    await page.waitForLoadState('networkidle');
    
    // Check basic page structure
    const htmlElement = page.locator('html');
    const bodyElement = page.locator('body');
    
    await expect(htmlElement).toBeVisible();
    await expect(bodyElement).toBeVisible();
    
    // Check for proper meta tags
    const viewport = page.locator('meta[name="viewport"]');
    await expect(viewport).toHaveCount(1);
    
    // Check that CSS is loaded
    const styles = page.locator('link[rel="stylesheet"], style');
    await expect(styles).toHaveCount({ min: 1 });
    
    // Capture any console errors
    const consoleLogs: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleLogs.push(`ERROR: ${msg.text()}`);
      }
    });
    
    // Wait for any JS to execute
    await page.waitForTimeout(3000);
    
    // Log any errors found
    if (consoleLogs.length > 0) {
      console.log('⚠️ Console errors found:');
      consoleLogs.forEach(log => console.log(`  ${log}`));
    } else {
      console.log('✅ No console errors detected');
    }
    
    console.log('✅ Page structure verification complete');
  });

  test('should test page accessibility basics', async ({ page }) => {
    console.log('♿ Testing basic accessibility...');
    
    await page.goto('/restaurant/profile');
    await page.waitForLoadState('networkidle');
    
    // Check for proper heading structure
    const headings = page.locator('h1, h2, h3, h4, h5, h6');
    const headingCount = await headings.count();
    
    if (headingCount > 0) {
      console.log(`✅ Found ${headingCount} headings on the page`);
      
      // Check that h1 exists (should be main page title)
      const h1Elements = page.locator('h1');
      const h1Count = await h1Elements.count();
      
      if (h1Count > 0) {
        console.log('✅ Page has proper h1 heading');
      } else {
        console.log('⚠️ No h1 heading found');
      }
    }
    
    // Check for proper form labels if forms exist
    const inputs = page.locator('input');
    const inputCount = await inputs.count();
    
    if (inputCount > 0) {
      console.log(`Found ${inputCount} input elements`);
      
      // Check for associated labels
      for (let i = 0; i < inputCount; i++) {
        const input = inputs.nth(i);
        const inputId = await input.getAttribute('id');
        
        if (inputId) {
          const associatedLabel = page.locator(`label[for="${inputId}"]`);
          const hasLabel = await associatedLabel.count() > 0;
          
          if (hasLabel) {
            console.log(`✅ Input #${inputId} has proper label`);
          } else {
            console.log(`⚠️ Input #${inputId} missing label`);
          }
        }
      }
    }
    
    // Check for proper button text
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    
    console.log(`Found ${buttonCount} buttons on the page`);
    
    for (let i = 0; i < buttonCount; i++) {
      const button = buttons.nth(i);
      const buttonText = await button.textContent();
      
      if (buttonText && buttonText.trim().length > 0) {
        console.log(`✅ Button has text: "${buttonText.trim()}"`);
      } else {
        console.log('⚠️ Button found without visible text');
      }
    }
    
    console.log('✅ Basic accessibility check complete');
  });

});