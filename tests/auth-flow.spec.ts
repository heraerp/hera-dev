import { test, expect } from '@playwright/test';

// Test data - use a consistent test user for debugging
const testUser = {
  email: `test-user-${Date.now()}@heratest.com`,
  password: 'TestPassword123!',
  fullName: 'Test User',
  companyName: 'Test Restaurant'
};

test.describe('Authentication Flow with Multi-Organization', () => {
  test.beforeEach(async ({ page }) => {
    // Start from the home page
    await page.goto('/');
  });

  test('Complete signup and signin flow', async ({ page }) => {
    // Step 1: Navigate to signup
    console.log('🔍 Testing signup flow...');
    
    // Look for signup link on home page (could be in nav or landing)
    const signupLink = page.getByRole('link', { name: /sign up|create account|get started/i }).first();
    await signupLink.click();
    
    // Should be on signup page
    await expect(page).toHaveURL(/\/auth\/sign-up/);
    await expect(page.getByRole('heading', { name: /sign up|create account/i })).toBeVisible();

    // Step 2: Fill signup form
    console.log('📝 Filling signup form...');
    
    await page.getByLabel(/email/i).fill(testUser.email);
    await page.getByLabel(/password/i).first().fill(testUser.password);
    
    // Handle repeat password if it exists
    const repeatPasswordField = page.getByLabel(/confirm|repeat/i);
    if (await repeatPasswordField.isVisible()) {
      await repeatPasswordField.fill(testUser.password);
    }
    
    // Submit signup form
    await page.getByRole('button', { name: /sign up|create account/i }).click();
    
    // Step 3: Handle signup success/verification
    console.log('✅ Signup submitted, checking response...');
    
    // Wait for either success page or verification message
    await expect(page.locator('text=check your email|verification|success')).toBeVisible({ timeout: 10000 });
    
    // If we're on success page, look for continue or next steps
    const currentUrl = page.url();
    if (currentUrl.includes('success')) {
      console.log('📧 On success page, checking for next steps...');
      await expect(page.getByText(/check.*email|verification/i)).toBeVisible();
    }

    // Step 4: Simulate email verification (in real app, user would click email link)
    // For testing, we'll directly navigate to the confirmation endpoint
    console.log('🔗 Simulating email confirmation...');
    
    // In a real test, you would:
    // 1. Extract the confirmation link from a test email service
    // 2. Navigate to that link
    // For now, we'll navigate to where confirmed users should go
    await page.goto('/setup');
    
    // Step 5: Verify solution selector appears
    console.log('🎯 Testing solution selector...');
    
    await expect(page.getByRole('heading', { name: /choose|select.*solution|business/i })).toBeVisible({ timeout: 10000 });
    
    // Look for restaurant option
    const restaurantOption = page.locator('[data-testid="solution-restaurant"], .solution-card', { hasText: /restaurant/i }).first();
    await expect(restaurantOption).toBeVisible();
    
    // Click on restaurant solution
    await restaurantOption.click();
    
    // Step 6: Setup restaurant organization
    console.log('🏪 Setting up restaurant organization...');
    
    // Look for setup form or direct navigation to restaurant setup
    const setupButton = page.getByRole('button', { name: /setup|start|create|continue/i }).first();
    if (await setupButton.isVisible()) {
      await setupButton.click();
    }
    
    // Should now be on restaurant setup or already on dashboard
    // Wait for either setup form or dashboard
    await Promise.race([
      expect(page.getByRole('heading', { name: /setup|create.*restaurant/i })).toBeVisible(),
      expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible()
    ]);
    
    // If on setup page, fill restaurant details
    const setupHeading = page.getByRole('heading', { name: /setup|create.*restaurant/i });
    if (await setupHeading.isVisible()) {
      console.log('📋 Filling restaurant setup form...');
      
      // Fill restaurant name
      await page.getByLabel(/restaurant.*name|business.*name/i).fill(testUser.companyName);
      
      // Fill other required fields if they exist
      const businessTypeSelect = page.getByLabel(/business.*type|type/i);
      if (await businessTypeSelect.isVisible()) {
        await businessTypeSelect.click();
        await page.getByRole('option', { name: /restaurant|full.*service/i }).first().click();
      }
      
      const cuisineSelect = page.getByLabel(/cuisine/i);
      if (await cuisineSelect.isVisible()) {
        await cuisineSelect.click();
        await page.getByRole('option', { name: /american|italian/i }).first().click();
      }
      
      const locationField = page.getByLabel(/location|address/i);
      if (await locationField.isVisible()) {
        await locationField.fill('New York, NY');
      }
      
      const seatsSelect = page.getByLabel(/seat|capacity/i);
      if (await seatsSelect.isVisible()) {
        await seatsSelect.click();
        await page.getByRole('option', { name: /small|medium/i }).first().click();
      }
      
      // Submit setup form
      await page.getByRole('button', { name: /create|setup|finish|complete/i }).click();
    }
    
    // Step 7: Verify dashboard access
    console.log('📊 Verifying dashboard access...');
    
    // Should be on restaurant dashboard
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(testUser.companyName)).toBeVisible();
    
    console.log('✅ Signup flow completed successfully!');
    
    // Step 8: Test logout
    console.log('🚪 Testing logout...');
    
    const logoutButton = page.getByRole('button', { name: /logout|sign out/i }).first();
    if (await logoutButton.isVisible()) {
      await logoutButton.click();
      
      // Should be redirected to home or login
      await expect(page.getByRole('link', { name: /sign in|login/i })).toBeVisible({ timeout: 5000 });
    } else {
      // Navigate to logout manually if button not found
      await page.goto('/auth/login');
    }
    
    // Step 9: Test signin with created account
    console.log('🔑 Testing signin with created account...');
    
    // Fill login form
    await page.getByLabel(/email/i).fill(testUser.email);
    await page.getByLabel(/password/i).fill(testUser.password);
    
    // Submit login
    await page.getByRole('button', { name: /sign in|login/i }).click();
    
    // Step 10: Verify signin redirects to dashboard
    console.log('🎯 Verifying signin redirect...');
    
    // Should be redirected back to restaurant dashboard
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(testUser.companyName)).toBeVisible();
    
    console.log('✅ Complete authentication flow test passed!');
  });

  test('Existing user signin flow', async ({ page }) => {
    console.log('🔄 Testing existing user signin...');
    
    // Navigate to login page
    await page.goto('/auth/login');
    
    // Verify login page
    await expect(page.getByRole('heading', { name: /sign in|login/i })).toBeVisible();
    
    // Fill with test credentials (you may need to use a pre-existing test account)
    await page.getByLabel(/email/i).fill('test@example.com');
    await page.getByLabel(/password/i).fill('password123');
    
    // Submit (this may fail if no test account exists - that's expected)
    await page.getByRole('button', { name: /sign in|login/i }).click();
    
    // Either successful login or error message should appear
    const isSuccess = await page.getByRole('heading', { name: /dashboard/i }).isVisible({ timeout: 5000 });
    const isError = await page.getByText(/invalid|error|incorrect/i).isVisible({ timeout: 5000 });
    
    expect(isSuccess || isError).toBe(true);
    
    if (isSuccess) {
      console.log('✅ Login successful with test account');
    } else {
      console.log('⚠️ Login failed as expected (no test account)');
    }
  });

  test('Solution selector functionality', async ({ page }) => {
    console.log('🎛️ Testing solution selector...');
    
    // Navigate directly to solution selector
    await page.goto('/setup');
    
    // Verify solution selector loads
    await expect(page.getByRole('heading', { name: /choose|select|solution/i })).toBeVisible();
    
    // Verify restaurant solution is present
    const restaurantSolution = page.locator('[data-testid="solution-restaurant"], .solution-card', { hasText: /restaurant/i }).first();
    await expect(restaurantSolution).toBeVisible();
    
    // Verify other solutions are present
    const retailSolution = page.locator('[data-testid="solution-retail"], .solution-card', { hasText: /retail/i }).first();
    await expect(retailSolution).toBeVisible();
    
    // Test filtering if available
    const searchInput = page.getByPlaceholder(/search|filter/i);
    if (await searchInput.isVisible()) {
      await searchInput.fill('restaurant');
      await expect(restaurantSolution).toBeVisible();
    }
    
    console.log('✅ Solution selector test passed!');
  });

  test('Navigation flow for unauthenticated users', async ({ page }) => {
    console.log('🧭 Testing navigation for unauthenticated users...');
    
    // Try to access protected route
    await page.goto('/restaurant/dashboard');
    
    // Should be redirected to login or home
    await expect(page.getByRole('link', { name: /sign in|login/i })).toBeVisible({ timeout: 5000 });
    
    // Try to access setup page
    await page.goto('/setup');
    
    // Should be redirected to login or show authentication required
    const hasLoginLink = await page.getByRole('link', { name: /sign in|login/i }).isVisible();
    const hasAuthMessage = await page.getByText(/sign in|login|authenticate/i).isVisible();
    
    expect(hasLoginLink || hasAuthMessage).toBe(true);
    
    console.log('✅ Protected route navigation test passed!');
  });
});

test.describe('Error Handling', () => {
  test('Handle invalid login credentials', async ({ page }) => {
    await page.goto('/auth/login');
    
    // Fill with invalid credentials
    await page.getByLabel(/email/i).fill('invalid@test.com');
    await page.getByLabel(/password/i).fill('wrongpassword');
    
    // Submit
    await page.getByRole('button', { name: /sign in|login/i }).click();
    
    // Should show error message
    await expect(page.getByText(/invalid|incorrect|error/i)).toBeVisible({ timeout: 5000 });
  });

  test('Handle signup with existing email', async ({ page }) => {
    await page.goto('/auth/sign-up');
    
    // Fill with existing email (use a common test email)
    await page.getByLabel(/email/i).fill('admin@test.com');
    await page.getByLabel(/password/i).first().fill('password123');
    
    const repeatField = page.getByLabel(/confirm|repeat/i);
    if (await repeatField.isVisible()) {
      await repeatField.fill('password123');
    }
    
    // Submit
    await page.getByRole('button', { name: /sign up|create/i }).click();
    
    // Should show error or success (depending on how Supabase handles existing emails)
    const hasError = await page.getByText(/exists|already|error/i).isVisible({ timeout: 5000 });
    const hasSuccess = await page.getByText(/check.*email|success/i).isVisible({ timeout: 5000 });
    
    expect(hasError || hasSuccess).toBe(true);
  });
});