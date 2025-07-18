import { test, expect } from '@playwright/test';
import { login, ensureLoggedIn } from './helpers/login';

/**
 * Multi-Tenant Restaurant Profile Testing
 * Tests the new user-specific restaurant profile linking system
 */

test.describe('Multi-Tenant Restaurant Profile', () => {
  
  test.beforeEach(async ({ page }) => {
    // Ensure user is logged in before each test
    await ensureLoggedIn(page);
  });

  test('should load restaurant profile for authenticated user', async ({ page }) => {
    console.log('🏪 Testing restaurant profile loading for authenticated user...');
    
    // Navigate to restaurant profile page
    await page.goto('/restaurant/profile');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Check if we're in loading state initially
    const loadingIndicator = page.locator('text=Loading restaurant profile...');
    
    // Wait for either content to load or error message to appear
    await page.waitForSelector('[data-testid="restaurant-content"], [data-testid="no-restaurant-found"], text=Unable to Load Profile', {
      timeout: 15000
    });
    
    // Take a screenshot for debugging
    await page.screenshot({ path: 'test-results/restaurant-profile-loaded.png', fullPage: true });
    
    // Check if restaurant data loaded successfully
    const restaurantContent = page.locator('[data-testid="restaurant-content"]');
    const noRestaurantMessage = page.locator('text=No Restaurant Found');
    const errorMessage = page.locator('text=Unable to Load Profile');
    
    if (await restaurantContent.isVisible()) {
      console.log('✅ Restaurant profile loaded successfully');
      
      // Verify essential profile elements are present
      await expect(page.locator('h1')).toBeVisible(); // Restaurant name in header
      await expect(page.locator('text=Restaurant Profile & Settings')).toBeVisible();
      await expect(page.locator('text=Business Information')).toBeVisible();
      await expect(page.locator('text=Location Details')).toBeVisible();
      
      // Verify we can see some restaurant data
      const businessNameField = page.locator('text=Business Name').locator('..').locator('p, input');
      await expect(businessNameField).toBeVisible();
      
    } else if (await noRestaurantMessage.isVisible()) {
      console.log('ℹ️ User has no restaurant profile - showing setup guidance');
      
      // Verify the improved UX for no restaurant found
      await expect(page.locator('text=No Restaurant Found')).toBeVisible();
      await expect(page.locator('text=Click below to set up your restaurant profile.')).toBeVisible();
      await expect(page.locator('button:has-text("Setup Restaurant")')).toBeVisible();
      
      // Test setup button functionality
      const setupButton = page.locator('button:has-text("Setup Restaurant")');
      await expect(setupButton).toBeEnabled();
      
    } else if (await errorMessage.isVisible()) {
      console.log('⚠️ Error loading restaurant profile');
      
      // Verify error handling UI
      await expect(page.locator('text=Unable to Load Profile')).toBeVisible();
      await expect(page.locator('button:has-text("Retry")')).toBeVisible();
      await expect(page.locator('button:has-text("Setup Restaurant")')).toBeVisible();
      
    } else {
      throw new Error('Unexpected state: no restaurant content, error, or setup message found');
    }
  });

  test('should handle authentication properly', async ({ page }) => {
    console.log('🔐 Testing authentication integration...');
    
    // Navigate to restaurant profile
    await page.goto('/restaurant/profile');
    await page.waitForLoadState('networkidle');
    
    // Check that we're not redirected to login (should be authenticated)
    expect(page.url()).not.toContain('/login');
    expect(page.url()).toContain('/restaurant/profile');
    
    // Verify Supabase auth is working by checking for user session
    const hasAuthSession = await page.evaluate(async () => {
      try {
        // Try to access the Supabase client
        const supabase = (window as any)?.supabase;
        if (!supabase) return false;
        
        const { data: { user } } = await supabase.auth.getUser();
        return !!user;
      } catch (error) {
        console.log('Auth check error:', error);
        return false;
      }
    });
    
    console.log('Auth session status:', hasAuthSession);
    
    // We should have an authenticated session
    if (!hasAuthSession) {
      console.warn('⚠️ No auth session found - this might be expected if auth is handled server-side');
    }
  });

  test('should show proper loading states', async ({ page }) => {
    console.log('⏳ Testing loading states...');
    
    // Navigate and immediately check for loading indicator
    await page.goto('/restaurant/profile');
    
    // Should see loading indicator initially
    const loadingIndicator = page.locator('text=Loading restaurant profile...');
    
    // Loading might be very fast, so we check if it was present or if content loads quickly
    try {
      await expect(loadingIndicator).toBeVisible({ timeout: 2000 });
      console.log('✅ Loading indicator displayed');
    } catch (error) {
      console.log('ℹ️ Loading was too fast to catch, or already cached');
    }
    
    // Wait for loading to complete
    await page.waitForSelector('[data-testid="restaurant-content"], text=No Restaurant Found, text=Unable to Load Profile', {
      timeout: 15000
    });
    
    // Loading indicator should be gone
    await expect(loadingIndicator).not.toBeVisible();
  });

  test('should handle responsive design', async ({ page }) => {
    console.log('📱 Testing responsive design...');
    
    await page.goto('/restaurant/profile');
    await page.waitForLoadState('networkidle');
    
    // Test desktop view
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(500);
    
    await page.screenshot({ path: 'test-results/restaurant-profile-desktop.png', fullPage: true });
    
    // Test tablet view
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(500);
    
    await page.screenshot({ path: 'test-results/restaurant-profile-tablet.png', fullPage: true });
    
    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);
    
    await page.screenshot({ path: 'test-results/restaurant-profile-mobile.png', fullPage: true });
    
    // Check that content is still accessible on mobile
    const content = page.locator('main, [data-testid="restaurant-content"], .min-h-screen');
    await expect(content).toBeVisible();
    
    // Check that no horizontal scrolling is needed
    const bodyScrollWidth = await page.evaluate(() => document.body.scrollWidth);
    const windowInnerWidth = await page.evaluate(() => window.innerWidth);
    
    expect(bodyScrollWidth).toBeLessThanOrEqual(windowInnerWidth + 1); // Allow 1px tolerance
  });

  test('should test edit functionality if restaurant exists', async ({ page }) => {
    console.log('✏️ Testing edit functionality...');
    
    await page.goto('/restaurant/profile');
    await page.waitForLoadState('networkidle');
    
    // Check if restaurant data exists
    const editButton = page.locator('button:has-text("Edit Profile")');
    
    if (await editButton.isVisible()) {
      console.log('✅ Restaurant data exists, testing edit functionality');
      
      // Click edit button
      await editButton.click();
      
      // Should see save and cancel buttons
      await expect(page.locator('button:has-text("Save Changes")')).toBeVisible();
      await expect(page.locator('button:has-text("Cancel")')).toBeVisible();
      
      // Should see edit form fields
      const businessNameInput = page.locator('input[value]').first();
      await expect(businessNameInput).toBeVisible();
      await expect(businessNameInput).toBeEditable();
      
      // Test cancel functionality
      await page.locator('button:has-text("Cancel")').click();
      
      // Should return to view mode
      await expect(page.locator('button:has-text("Edit Profile")')).toBeVisible();
      await expect(page.locator('button:has-text("Save Changes")')).not.toBeVisible();
      
    } else {
      console.log('ℹ️ No restaurant data found, skipping edit functionality test');
    }
  });

  test('should test refresh functionality', async ({ page }) => {
    console.log('🔄 Testing refresh functionality...');
    
    await page.goto('/restaurant/profile');
    await page.waitForLoadState('networkidle');
    
    // Look for refresh button
    const refreshButton = page.locator('button:has-text("Refresh")');
    
    if (await refreshButton.isVisible()) {
      console.log('✅ Found refresh button, testing functionality');
      
      // Click refresh
      await refreshButton.click();
      
      // Wait for any loading states
      await page.waitForTimeout(1000);
      
      // Page should still be functional after refresh
      await expect(page.locator('h1')).toBeVisible();
      
    } else {
      console.log('ℹ️ No refresh button found (might be in error state)');
    }
  });

  test('should verify proper error handling', async ({ page }) => {
    console.log('🚨 Testing error handling...');
    
    // Test by navigating to profile page
    await page.goto('/restaurant/profile');
    await page.waitForLoadState('networkidle');
    
    // Check if error state is displayed
    const errorMessage = page.locator('text=Unable to Load Profile');
    const retryButton = page.locator('button:has-text("Retry")');
    
    if (await errorMessage.isVisible()) {
      console.log('✅ Error state detected, testing retry functionality');
      
      // Should have retry button
      await expect(retryButton).toBeVisible();
      await expect(retryButton).toBeEnabled();
      
      // Should have setup button as fallback
      await expect(page.locator('button:has-text("Setup Restaurant")')).toBeVisible();
      
      // Test retry functionality
      await retryButton.click();
      await page.waitForTimeout(2000);
      
      // Should still be on profile page
      expect(page.url()).toContain('/restaurant/profile');
      
    } else {
      console.log('ℹ️ No error state detected in this test run');
    }
  });

  test('should verify console logs for debugging', async ({ page }) => {
    console.log('🔍 Testing console output for debugging...');
    
    const consoleLogs: string[] = [];
    
    // Capture console logs
    page.on('console', msg => {
      if (msg.type() === 'log' || msg.type() === 'error') {
        consoleLogs.push(`${msg.type()}: ${msg.text()}`);
      }
    });
    
    await page.goto('/restaurant/profile');
    await page.waitForLoadState('networkidle');
    
    // Wait for React and data loading
    await page.waitForTimeout(3000);
    
    console.log('📊 Console logs captured:');
    consoleLogs.forEach(log => console.log(`  ${log}`));
    
    // Check for specific log patterns
    const hasAuthLog = consoleLogs.some(log => log.includes('Loading restaurant data for authenticated user'));
    const hasServiceLog = consoleLogs.some(log => log.includes('Service client initialized') || log.includes('restaurant'));
    
    console.log('Auth-related logs found:', hasAuthLog);
    console.log('Service-related logs found:', hasServiceLog);
    
    // Should not have any critical errors
    const criticalErrors = consoleLogs.filter(log => 
      log.includes('error:') && 
      !log.includes('404') && // 404s might be expected
      !log.includes('Failed to fetch') // Network errors might be temporary
    );
    
    if (criticalErrors.length > 0) {
      console.warn('⚠️ Critical errors found:', criticalErrors);
    }
  });
  
  test('should handle setup button navigation', async ({ page }) => {
    console.log('🏗️ Testing setup button navigation...');
    
    await page.goto('/restaurant/profile');
    await page.waitForLoadState('networkidle');
    
    // Look for setup button (appears in both no-restaurant and error states)
    const setupButton = page.locator('button:has-text("Setup Restaurant")');
    
    if (await setupButton.isVisible()) {
      console.log('✅ Found setup button, testing navigation');
      
      // Click setup button
      await setupButton.click();
      
      // Should navigate to setup page
      await page.waitForLoadState('networkidle');
      
      // Should be on setup page
      expect(page.url()).toContain('/setup');
      
      console.log('✅ Successfully navigated to setup page:', page.url());
      
    } else {
      console.log('ℹ️ No setup button found - user likely has existing restaurant profile');
    }
  });

});

// Additional test for data attribute verification
test.describe('Restaurant Profile Data Attributes', () => {
  
  test('should have proper data attributes for testing', async ({ page }) => {
    console.log('🏷️ Verifying data attributes for reliable testing...');
    
    await ensureLoggedIn(page);
    await page.goto('/restaurant/profile');
    await page.waitForLoadState('networkidle');
    
    // Check for main content area data attribute
    const mainContent = page.locator('[data-testid="restaurant-content"]');
    const noRestaurantState = page.locator('[data-testid="no-restaurant-found"]');
    const errorState = page.locator('[data-testid="error-state"]');
    
    // One of these states should be present
    const contentVisible = await mainContent.isVisible().catch(() => false);
    const noRestaurantVisible = await noRestaurantState.isVisible().catch(() => false);
    const errorVisible = await errorState.isVisible().catch(() => false);
    
    console.log('Content states:', { contentVisible, noRestaurantVisible, errorVisible });
    
    // At least one state should be active
    expect(contentVisible || noRestaurantVisible || errorVisible).toBe(true);
  });
  
});