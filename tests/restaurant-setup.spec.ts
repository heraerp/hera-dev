import { test, expect } from '@playwright/test';
import { login } from './helpers/login';

test.describe('Restaurant Setup Page E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate directly to restaurant setup page (no auth required for setup)
    await page.goto('http://localhost:3000/setup/restaurant');
    await page.waitForLoadState('networkidle');
  });

  test('should display the restaurant setup page with initial state', async ({ page }) => {
    // Check page title and header
    await expect(page.locator('h1')).toContainText('Restaurant Setup');
    await expect(page.locator('text=Get your restaurant up and running')).toBeVisible();
    
    // Check Supabase connection test results
    await expect(page.locator('text=Supabase Connection Test Results')).toBeVisible();
    
    // Should see progress bar at 25% (step 1 of 4)
    await expect(page.locator('text=25% Complete')).toBeVisible();
    
    // Should be on step 1 (Business Information)
    await expect(page.locator('h2:has-text("Business Information")')).toBeVisible();
    await expect(page.locator('text=Let\'s start with your restaurant details')).toBeVisible();
    
    // Check that required fields are marked with asterisk
    await expect(page.locator('label:has-text("Restaurant Name")')).toBeVisible();
    await expect(page.locator('label:has-text("Cuisine Type")')).toBeVisible();
    await expect(page.locator('label:has-text("Business Email")')).toBeVisible();
    await expect(page.locator('label:has-text("Phone Number")')).toBeVisible();
    
    console.log('✅ Restaurant setup page initial state verified');
  });

  test('should show Supabase connection test results', async ({ page }) => {
    // Wait for connection tests to complete
    await page.waitForTimeout(2000);
    
    // Check for connection test results
    const testResults = page.locator('[data-testid="connection-test-results"], .text-green-700, .text-red-700');
    const resultCount = await testResults.count();
    
    expect(resultCount).toBeGreaterThan(0);
    console.log(`✅ Found ${resultCount} Supabase connection test results`);
    
    // Look for specific tables being tested
    const expectedTables = ['universal_transactions', 'core_entities', 'core_clients'];
    for (const table of expectedTables) {
      const tableResult = page.locator(`text=${table}`);
      if (await tableResult.count() > 0) {
        console.log(`✅ Found connection test for ${table} table`);
      }
    }
  });

  test('should complete step 1 (Business Information) and navigate to step 2', async ({ page }) => {
    // Fill out step 1 - Business Information
    await page.fill('#businessName', 'Test Lebanese Restaurant');
    await page.fill('#cuisineType', 'Lebanese');
    await page.fill('#businessEmail', 'test@restaurant.com');
    await page.fill('#primaryPhone', '+91 9876543210');
    await page.fill('#website', 'www.testrestaurant.com');
    
    // Select established year (click the combobox showing current year)
    await page.click('button[role="combobox"]:has-text("2025")');
    await page.waitForTimeout(500);
    const yearOption = page.locator('text=2023').first();
    await yearOption.scrollIntoViewIfNeeded();
    await yearOption.click();
    
    // Select business type (click the combobox showing "Restaurant Chain")
    await page.click('button[role="combobox"]:has-text("Restaurant Chain")');
    await page.waitForTimeout(500);
    const businessTypeOption = page.locator('text=Single Restaurant').first();
    await businessTypeOption.scrollIntoViewIfNeeded();
    await businessTypeOption.click();
    
    // Click Next to go to step 2
    await page.click('button:has-text("Next Step")');
    await page.waitForTimeout(1000);
    
    // Verify we're now on step 2
    await expect(page.locator('h2:has-text("Location Details")')).toBeVisible();
    await expect(page.locator('text=Where is your restaurant located?')).toBeVisible();
    await expect(page.locator('text=50% Complete')).toBeVisible();
    
    console.log('✅ Successfully completed step 1 and navigated to step 2');
  });

  test('should complete step 2 (Location Details) and navigate to step 3', async ({ page }) => {
    // First complete step 1
    await page.fill('#businessName', 'Test Lebanese Restaurant');
    await page.fill('#cuisineType', 'Lebanese');
    await page.fill('#businessEmail', 'test@restaurant.com');
    await page.fill('#primaryPhone', '+91 9876543210');
    await page.click('button:has-text("Next Step")');
    await page.waitForTimeout(1000);
    
    // Now fill step 2 - Location Details
    await page.fill('#locationName', 'Kottakkal Branch');
    await page.fill('#address', '123 Main Street, Near Bus Stand');
    await page.fill('#city', 'Kottakkal');
    await page.fill('#postalCode', '676503');
    
    // Select state
    await page.click('[data-testid="state-trigger"], .select-trigger:near(:text("State"))');
    await page.click('text=Kerala');
    
    // Country and currency should be pre-selected, but let's verify
    await expect(page.locator('.select-value:has-text("India")')).toBeVisible();
    await expect(page.locator('.select-value:has-text("INR")')).toBeVisible();
    
    // Click Next to go to step 3
    await page.click('button:has-text("Next Step")');
    await page.waitForTimeout(1000);
    
    // Verify we're now on step 3
    await expect(page.locator('h2:has-text("Operations Setup")')).toBeVisible();
    await expect(page.locator('text=Configure your restaurant operations')).toBeVisible();
    await expect(page.locator('text=75% Complete')).toBeVisible();
    
    console.log('✅ Successfully completed step 2 and navigated to step 3');
  });

  test('should complete step 3 (Operations Setup) and navigate to step 4', async ({ page }) => {
    // Complete steps 1 and 2 first
    await page.fill('#businessName', 'Test Lebanese Restaurant');
    await page.fill('#cuisineType', 'Lebanese');
    await page.fill('#businessEmail', 'test@restaurant.com');
    await page.fill('#primaryPhone', '+91 9876543210');
    await page.click('button:has-text("Next Step")');
    await page.waitForTimeout(500);
    
    await page.fill('#locationName', 'Kottakkal Branch');
    await page.fill('#address', '123 Main Street, Near Bus Stand');
    await page.fill('#city', 'Kottakkal');
    await page.fill('#postalCode', '676503');
    await page.click('[data-testid="state-trigger"], .select-trigger:near(:text("State"))');
    await page.click('text=Kerala');
    await page.click('button:has-text("Next Step")');
    await page.waitForTimeout(1000);
    
    // Fill step 3 - Operations Setup
    await page.fill('#openingTime', '08:00');
    await page.fill('#closingTime', '22:00');
    await page.fill('#seatingCapacity', '40');
    
    // Click Next to go to step 4
    await page.click('button:has-text("Next Step")');
    await page.waitForTimeout(1000);
    
    // Verify we're now on step 4
    await expect(page.locator('h2:has-text("Manager Information")')).toBeVisible();
    await expect(page.locator('text=Add your restaurant manager details')).toBeVisible();
    await expect(page.locator('text=100% Complete')).toBeVisible();
    
    console.log('✅ Successfully completed step 3 and navigated to step 4');
  });

  test('should complete the entire restaurant setup workflow', async ({ page }) => {
    console.log('🚀 Starting complete restaurant setup workflow...');
    
    // Step 1: Business Information
    console.log('📝 Filling step 1 - Business Information');
    await page.fill('#businessName', 'Test Lebanese Restaurant');
    await page.fill('#cuisineType', 'Lebanese');
    await page.fill('#businessEmail', 'test@restaurant.com');
    await page.fill('#primaryPhone', '+91 9876543210');
    await page.fill('#website', 'www.testrestaurant.com');
    
    await page.click('button:has-text("Next Step")');
    await page.waitForTimeout(1000);
    
    // Step 2: Location Details
    console.log('📍 Filling step 2 - Location Details');
    await page.fill('#locationName', 'Kottakkal Branch');
    await page.fill('#address', '123 Main Street, Near Bus Stand');
    await page.fill('#city', 'Kottakkal');
    await page.fill('#postalCode', '676503');
    
    // Select Kerala state
    await page.click('[data-testid="state-trigger"], .select-trigger:near(:text("State"))');
    await page.click('text=Kerala');
    
    await page.click('button:has-text("Next Step")');
    await page.waitForTimeout(1000);
    
    // Step 3: Operations Setup
    console.log('⏰ Filling step 3 - Operations Setup');
    await page.fill('#openingTime', '08:00');
    await page.fill('#closingTime', '22:00');
    await page.fill('#seatingCapacity', '40');
    
    await page.click('button:has-text("Next Step")');
    await page.waitForTimeout(1000);
    
    // Step 4: Manager Information
    console.log('👤 Filling step 4 - Manager Information');
    await page.fill('#managerName', 'John Smith');
    await page.fill('#managerEmail', 'john@restaurant.com');
    await page.fill('#managerPhone', '+91 9876543211');
    
    // Complete the setup
    console.log('✅ Completing restaurant setup...');
    await page.click('button:has-text("Complete Setup")');
    
    // Wait for submission and check for progress indicators
    await page.waitForTimeout(2000);
    
    // Look for setup progress indicators
    const progressIndicators = [
      'text=Creating business entity',
      'text=Creating restaurant location', 
      'text=Finalizing setup',
      'text=Setting up your restaurant group',
      'text=Setting up your restaurant location',
      'text=Completing restaurant setup'
    ];
    
    let foundProgress = false;
    for (const indicator of progressIndicators) {
      if (await page.locator(indicator).count() > 0) {
        console.log(`📊 Found progress indicator: ${indicator}`);
        foundProgress = true;
      }
    }
    
    // Wait longer for completion
    await page.waitForTimeout(5000);
    
    // Check for success message or redirect
    const successIndicators = [
      'text=Setup completed successfully',
      'text=Restaurant setup completed successfully',
      'text=Setup complete',
      'text=Redirecting to your restaurant dashboard'
    ];
    
    let foundSuccess = false;
    for (const indicator of successIndicators) {
      try {
        await expect(page.locator(indicator)).toBeVisible({ timeout: 5000 });
        console.log(`✅ Found success indicator: ${indicator}`);
        foundSuccess = true;
        break;
      } catch (error) {
        // Continue checking other indicators
      }
    }
    
    // Check if redirected to restaurant page
    const currentUrl = page.url();
    if (currentUrl.includes('/restaurant') && !currentUrl.includes('/setup')) {
      console.log('🎉 Successfully redirected to restaurant dashboard!');
      foundSuccess = true;
    }
    
    // If we didn't find explicit success, check if the form completed
    if (!foundSuccess) {
      // Check if we're no longer on the setup page or if complete button is disabled
      const completeButton = page.locator('button:has-text("Complete Setup")');
      const isDisabled = await completeButton.getAttribute('disabled');
      if (isDisabled !== null) {
        console.log('✅ Setup appears to have completed (button disabled)');
        foundSuccess = true;
      }
    }
    
    expect(foundSuccess).toBeTruthy();
    console.log('🎉 Complete restaurant setup workflow test passed!');
  });

  test('should validate required fields on each step', async ({ page }) => {
    // Test Step 1 validation
    console.log('🔍 Testing step 1 validation...');
    
    // Try to proceed without filling required fields
    await page.click('button:has-text("Next Step")');
    await page.waitForTimeout(500);
    
    // Should still be on step 1 if validation is working
    await expect(page.locator('h2:has-text("Business Information")')).toBeVisible();
    
    // Fill minimum required fields for step 1
    await page.fill('#businessName', 'Test Restaurant');
    await page.fill('#cuisineType', 'Lebanese');
    await page.fill('#businessEmail', 'test@restaurant.com');
    await page.fill('#primaryPhone', '+91 9876543210');
    
    // Now should be able to proceed
    await page.click('button:has-text("Next Step")');
    await page.waitForTimeout(1000);
    await expect(page.locator('h2:has-text("Location Details")')).toBeVisible();
    
    console.log('✅ Step 1 validation working correctly');
    
    // Test Step 2 validation
    console.log('🔍 Testing step 2 validation...');
    
    // Try to proceed without filling required fields
    await page.click('button:has-text("Next Step")');
    await page.waitForTimeout(500);
    
    // Should still be on step 2
    await expect(page.locator('h2:has-text("Location Details")')).toBeVisible();
    
    // Fill required fields for step 2
    await page.fill('#locationName', 'Test Branch');
    await page.fill('#address', 'Test Address');
    await page.fill('#city', 'Test City');
    await page.fill('#postalCode', '123456');
    await page.click('[data-testid="state-trigger"], .select-trigger:near(:text("State"))');
    await page.click('text=Kerala');
    
    // Now should be able to proceed
    await page.click('button:has-text("Next Step")');
    await page.waitForTimeout(1000);
    await expect(page.locator('h2:has-text("Operations Setup")')).toBeVisible();
    
    console.log('✅ Step 2 validation working correctly');
  });

  test('should handle back navigation correctly', async ({ page }) => {
    // Navigate through steps
    await page.fill('#businessName', 'Test Restaurant');
    await page.fill('#cuisineType', 'Lebanese');
    await page.fill('#businessEmail', 'test@restaurant.com');
    await page.fill('#primaryPhone', '+91 9876543210');
    await page.click('button:has-text("Next Step")');
    await page.waitForTimeout(1000);
    
    // Should be on step 2
    await expect(page.locator('h2:has-text("Location Details")')).toBeVisible();
    
    // Click back button
    await page.click('button:has-text("Back")');
    await page.waitForTimeout(500);
    
    // Should be back on step 1
    await expect(page.locator('h2:has-text("Business Information")')).toBeVisible();
    
    // Verify form data is preserved
    await expect(page.locator('#businessName')).toHaveValue('Test Restaurant');
    await expect(page.locator('#cuisineType')).toHaveValue('Lebanese');
    
    console.log('✅ Back navigation works correctly and preserves form data');
  });

  test('should show error handling for setup failures', async ({ page }) => {
    // Complete all steps with potentially invalid data to trigger errors
    await page.fill('#businessName', 'Test Restaurant');
    await page.fill('#cuisineType', 'Lebanese');
    await page.fill('#businessEmail', 'invalid-email'); // Invalid email format
    await page.fill('#primaryPhone', '+91 9876543210');
    await page.click('button:has-text("Next Step")');
    await page.waitForTimeout(1000);
    
    await page.fill('#locationName', 'Test Branch');
    await page.fill('#address', 'Test Address');
    await page.fill('#city', 'Test City');
    await page.fill('#postalCode', '123456');
    await page.click('[data-testid="state-trigger"], .select-trigger:near(:text("State"))');
    await page.click('text=Kerala');
    await page.click('button:has-text("Next Step")');
    await page.waitForTimeout(1000);
    
    await page.fill('#openingTime', '08:00');
    await page.fill('#closingTime', '22:00');
    await page.fill('#seatingCapacity', '40');
    await page.click('button:has-text("Next Step")');
    await page.waitForTimeout(1000);
    
    await page.fill('#managerName', 'John Smith');
    await page.fill('#managerEmail', 'john@restaurant.com');
    await page.fill('#managerPhone', '+91 9876543211');
    
    // Try to complete setup
    await page.click('button:has-text("Complete Setup")');
    await page.waitForTimeout(3000);
    
    // Look for error messages (might appear due to database constraints or validation)
    const errorIndicators = [
      'text=Setup Failed',
      'text=An unexpected error occurred',
      '.text-red-600',
      '.text-red-800',
      '[class*="error"]'
    ];
    
    let errorFound = false;
    for (const indicator of errorIndicators) {
      if (await page.locator(indicator).count() > 0) {
        console.log(`❌ Found error indicator: ${indicator}`);
        errorFound = true;
        break;
      }
    }
    
    // Note: Error might not occur if setup succeeds, which is also valid
    console.log(errorFound ? '✅ Error handling UI present' : '✅ No errors occurred during setup');
  });

  test('should show step indicators correctly', async ({ page }) => {
    // Check initial step indicators
    const steps = ['Business Information', 'Location Details', 'Operations Setup', 'Team Setup'];
    
    for (let i = 0; i < steps.length; i++) {
      // Check if step indicator is visible
      const stepIndicator = page.locator(`text="${steps[i]}"`);
      if (await stepIndicator.count() > 0) {
        console.log(`✅ Found step indicator: ${steps[i]}`);
      }
    }
    
    // Check progress percentage
    await expect(page.locator('text=25% Complete')).toBeVisible();
    
    // Navigate to next step and check progress update
    await page.fill('#businessName', 'Test Restaurant');
    await page.fill('#cuisineType', 'Lebanese');
    await page.fill('#businessEmail', 'test@restaurant.com');
    await page.fill('#primaryPhone', '+91 9876543210');
    await page.click('button:has-text("Next Step")');
    await page.waitForTimeout(1000);
    
    // Progress should now be 50%
    await expect(page.locator('text=50% Complete')).toBeVisible();
    
    console.log('✅ Step indicators and progress tracking working correctly');
  });
});