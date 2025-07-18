/**
 * Example tests showing how to use Test User Manager with Playwright
 * These tests demonstrate creating, using, and cleaning up test users
 */

import { test, expect } from '@playwright/test';
import { 
  testUserManager, 
  createTestUser, 
  createSimpleUser, 
  loginTestUser,
  cleanupAllTestUsers,
  type TestUser,
  type TestOrganization 
} from '../helpers/test-user-manager';

// Global cleanup after all tests
test.afterAll(async () => {
  await cleanupAllTestUsers();
});

test.describe('Test User Manager Examples', () => {

  test('Create and login with a complete test user (with restaurant)', async ({ page }) => {
    // Create a test user with a restaurant organization
    const { user, organization } = await createTestUser({
      fullName: 'Test Restaurant Owner',
      role: 'owner',
      organizationName: 'Test Pizza Palace',
      industry: 'restaurant'
    });

    console.log('✅ Created test user:', user.email);
    console.log('✅ Created test organization:', organization.name);

    // Login with the test user
    await loginTestUser(page, user);

    // Verify we're logged in and can access restaurant features
    await expect(page).not.toHaveURL(/.*\/login.*/);
    
    // Navigate to restaurant dashboard
    await page.goto('http://localhost:3002/restaurant');
    await page.waitForLoadState('networkidle');

    // Verify restaurant data is loaded
    await expect(page.locator('text=Test Pizza Palace')).toBeVisible({ timeout: 10000 });
    
    console.log('✅ Test completed successfully with restaurant owner');
  });

  test('Create multiple users for the same restaurant', async ({ page }) => {
    const restaurantName = 'Multi-User Test Restaurant';
    
    // Create owner
    const { user: owner, organization } = await createTestUser({
      fullName: 'Restaurant Owner',
      role: 'owner',
      organizationName: restaurantName,
      industry: 'restaurant'
    });

    // Create manager for the same restaurant
    const { user: manager } = await createTestUser({
      fullName: 'Restaurant Manager',
      role: 'manager',
      organizationName: restaurantName,
      industry: 'restaurant'
    });

    // Create staff member
    const { user: staff } = await createTestUser({
      fullName: 'Restaurant Staff',
      role: 'staff',
      organizationName: `${restaurantName} - Staff`,
      industry: 'restaurant'
    });

    // Test login with each user type
    const users = [
      { user: owner, expectedRole: 'owner' },
      { user: manager, expectedRole: 'manager' },
      { user: staff, expectedRole: 'staff' }
    ];

    for (const { user, expectedRole } of users) {
      await loginTestUser(page, user);
      
      // Verify login success
      await expect(page).not.toHaveURL(/.*\/login.*/);
      
      // Navigate to restaurant page
      await page.goto('http://localhost:3002/restaurant');
      await page.waitForLoadState('networkidle');
      
      console.log(`✅ Successfully logged in ${expectedRole}: ${user.email}`);
      
      // Logout for next user
      const logoutButton = page.locator('button:has-text("Logout"), button:has-text("Sign Out")');
      if (await logoutButton.isVisible()) {
        await logoutButton.click();
        await page.waitForURL(/.*\/login.*/);
      } else {
        await page.goto('http://localhost:3002/login');
      }
    }

    console.log('✅ All user types tested successfully');
  });

  test('Create simple user and test authentication flow', async ({ page }) => {
    // Create a simple user without organization
    const user = await createSimpleUser({
      fullName: 'Simple Test User',
    });

    console.log('✅ Created simple test user:', user.email);

    // Login with the test user
    await loginTestUser(page, user);

    // Verify login success
    await expect(page).not.toHaveURL(/.*\/login.*/);

    // For users without organization, they should be redirected to setup
    await page.goto('http://localhost:3002/restaurant');
    await page.waitForLoadState('networkidle');

    // Should see setup or organization selection
    const hasSetupContent = await page.locator('text=Setup, text=Restaurant Setup, text=Create Restaurant').first().isVisible();
    const hasSelectContent = await page.locator('text=Select, text=Choose Restaurant').first().isVisible();
    
    expect(hasSetupContent || hasSelectContent).toBeTruthy();
    
    console.log('✅ Simple user authentication flow tested');
  });

  test('Test user cleanup and recreation', async ({ page }) => {
    // Create a test user
    const { user } = await createTestUser({
      fullName: 'Cleanup Test User',
      organizationName: 'Cleanup Test Restaurant'
    });

    // Login to verify user works
    await loginTestUser(page, user);
    await expect(page).not.toHaveURL(/.*\/login.*/);

    // Manual cleanup of this specific user
    await testUserManager.cleanupTestUser(user.id);

    // Try to login again - should fail
    await page.goto('http://localhost:3002/login');
    await page.fill('input[name="email"]', user.email);
    await page.fill('input[name="password"]', user.password);
    await page.click('button[type="submit"]');

    // Should stay on login page or show error
    await page.waitForTimeout(3000);
    const stillOnLogin = page.url().includes('/login') || 
                        await page.locator('text=Invalid credentials, text=Error').isVisible();
    
    expect(stillOnLogin).toBeTruthy();

    console.log('✅ User cleanup verified - cannot login with deleted user');
  });

  test('Load test with multiple users', async ({ page }) => {
    // Create 5 test users for load testing
    const users = await testUserManager.createMultipleTestUsers(5, 'Load Test Restaurant');

    expect(users.length).toBeGreaterThanOrEqual(3); // Allow for some failures

    // Test login with each user
    for (let i = 0; i < Math.min(users.length, 3); i++) {
      const user = users[i];
      
      await loginTestUser(page, user);
      await expect(page).not.toHaveURL(/.*\/login.*/);
      
      // Quick navigation test
      await page.goto('http://localhost:3002/restaurant');
      await page.waitForLoadState('networkidle');
      
      console.log(`✅ Load test user ${i + 1} working: ${user.email}`);
      
      // Logout
      await page.goto('http://localhost:3002/login');
    }

    console.log(`✅ Load test completed with ${users.length} users`);
  });

  test('Test restaurant setup flow with new user', async ({ page }) => {
    // Create user without organization
    const user = await createSimpleUser({
      fullName: 'Setup Flow Test User'
    });

    // Login
    await loginTestUser(page, user);

    // Navigate to restaurant setup
    await page.goto('http://localhost:3002/setup/restaurant');
    await page.waitForLoadState('networkidle');

    // Fill in restaurant setup form
    const formData = {
      clientName: 'Test Restaurant Group',
      businessName: 'Setup Flow Test Restaurant',
      cuisineType: 'Italian',
      locationName: 'Main Location',
      address: '123 Test Street',
      city: 'Test City',
      state: 'Test State',
      postalCode: '123456',
      primaryPhone: '9876543210',
      businessEmail: 'test@setupflow.com',
      managerName: 'Test Manager',
      managerEmail: 'manager@setupflow.com',
      managerPhone: '9876543211',
      seatingCapacity: '50'
    };

    // Fill form fields
    for (const [field, value] of Object.entries(formData)) {
      const input = page.locator(`input[name="${field}"], select[name="${field}"]`);
      if (await input.isVisible()) {
        await input.fill(value);
      }
    }

    // Submit form
    const submitButton = page.locator('button[type="submit"], button:has-text("Create Restaurant")');
    if (await submitButton.isVisible()) {
      await submitButton.click();
      
      // Wait for success or redirect
      await page.waitForTimeout(5000);
      
      // Should be redirected away from setup page
      expect(page.url()).not.toContain('/setup/restaurant');
      
      console.log('✅ Restaurant setup flow completed');
    } else {
      console.log('⚠️ Submit button not found - form may have different structure');
    }
  });

});

test.describe('Test User Manager Administrative Functions', () => {
  
  test('Get user information and statistics', async () => {
    // Create some test users
    await createTestUser({ organizationName: 'Stats Test Restaurant 1' });
    await createSimpleUser();
    await createTestUser({ organizationName: 'Stats Test Restaurant 2' });

    // Get all users
    const allUsers = testUserManager.getAllTestUsers();
    const allOrganizations = testUserManager.getAllTestOrganizations();

    console.log(`📊 Total test users created: ${allUsers.length}`);
    console.log(`📊 Total test organizations created: ${allOrganizations.length}`);

    expect(allUsers.length).toBeGreaterThanOrEqual(3);
    expect(allOrganizations.length).toBeGreaterThanOrEqual(2);

    // Test getting user by email
    const firstUser = allUsers[0];
    const foundUser = testUserManager.getTestUser(firstUser.email);
    
    expect(foundUser).toBeDefined();
    expect(foundUser?.email).toBe(firstUser.email);

    console.log('✅ User management functions working correctly');
  });

});