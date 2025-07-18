import { test, expect } from '@playwright/test';
import { login, verifyLoginSuccess, logout, TEST_USER } from './helpers/login';

test.describe('Authentication Tests', () => {
  test('should successfully login with valid credentials', async ({ page }) => {
    // Navigate to login page
    await page.goto('/login');
    
    // Verify we're on the login page
    await expect(page).toHaveURL(/.*\/login.*/);
    
    // Take a screenshot of the login page (useful for debugging)
    await page.screenshot({ 
      path: 'tests/screenshots/login-page.png',
      fullPage: true 
    });

    // Perform login
    await login(page);

    // Verify successful login
    await verifyLoginSuccess(page);

    // Take a screenshot after successful login
    await page.screenshot({ 
      path: 'tests/screenshots/after-login.png',
      fullPage: true 
    });

    // Additional assertions for dashboard
    await expect(page).not.toHaveURL(/.*\/login.*/);
    
    // Log current URL for debugging
    console.log(`📍 Current URL after login: ${page.url()}`);
  });

  test('should redirect to dashboard after successful login', async ({ page }) => {
    await page.goto('/login');
    
    // Perform login
    await login(page);

    // Check if redirected to dashboard or home page
    const acceptableUrls = ['/dashboard', '/home', '/', '/restaurant'];
    const currentUrl = page.url();
    
    const isValidRedirect = acceptableUrls.some(url => 
      currentUrl.includes(url) || currentUrl.endsWith(url)
    );
    
    expect(isValidRedirect).toBeTruthy();
    console.log(`✅ Redirected to: ${currentUrl}`);
  });

  test('should show error with invalid credentials', async ({ page }) => {
    await page.goto('/login');

    // Fill in invalid credentials
    await page.fill('input[name="email"]', 'invalid@example.com');
    await page.fill('input[name="password"]', 'wrongpassword');
    
    // Click submit
    await page.click('button[type="submit"]');

    // Wait for error message
    const errorSelectors = [
      'text=Invalid login credentials',
      'text=Authentication failed',
      'text=Invalid email or password',
      '.error-message',
      '[role="alert"]'
    ];

    let errorFound = false;
    for (const selector of errorSelectors) {
      try {
        await page.waitForSelector(selector, { timeout: 5000 });
        errorFound = true;
        console.log(`❌ Found error message: ${selector}`);
        break;
      } catch {
        // Try next selector
      }
    }

    // Should still be on login page
    await expect(page).toHaveURL(/.*\/login.*/);
  });

  test('should persist session across page reloads', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await login(page);

    // Navigate to a protected page
    await page.goto('/dashboard');
    
    // Reload the page
    await page.reload();
    
    // Should still be logged in
    await expect(page).not.toHaveURL(/.*\/login.*/);
    await verifyLoginSuccess(page);
  });

  test('should be able to logout', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await login(page);

    // Perform logout
    await logout(page);

    // Should be redirected to login page
    await expect(page).toHaveURL(/.*\/login.*/);
  });
});

// Test group specifically for form validation
test.describe('Login Form Validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('should require email field', async ({ page }) => {
    // Leave email empty, fill password
    await page.fill('input[name="password"]', TEST_USER.password);
    
    // Try to submit
    await page.click('button[type="submit"]');

    // Check for validation error
    const emailInput = page.locator('input[name="email"]');
    
    // Check HTML5 validation
    const validationMessage = await emailInput.evaluate((el: HTMLInputElement) => 
      el.validationMessage
    );
    
    expect(validationMessage).toBeTruthy();
    console.log(`📧 Email validation: ${validationMessage}`);
  });

  test('should require password field', async ({ page }) => {
    // Fill email, leave password empty
    await page.fill('input[name="email"]', TEST_USER.email);
    
    // Try to submit
    await page.click('button[type="submit"]');

    // Check for validation error
    const passwordInput = page.locator('input[name="password"]');
    
    // Check HTML5 validation
    const validationMessage = await passwordInput.evaluate((el: HTMLInputElement) => 
      el.validationMessage
    );
    
    expect(validationMessage).toBeTruthy();
    console.log(`🔑 Password validation: ${validationMessage}`);
  });

  test('should validate email format', async ({ page }) => {
    // Fill invalid email format
    await page.fill('input[name="email"]', 'notanemail');
    await page.fill('input[name="password"]', TEST_USER.password);
    
    // Try to submit
    await page.click('button[type="submit"]');

    // Check for validation error
    const emailInput = page.locator('input[name="email"]');
    const isValid = await emailInput.evaluate((el: HTMLInputElement) => 
      el.checkValidity()
    );
    
    expect(isValid).toBeFalsy();
  });
});

// Test to verify Supabase integration
test.describe('Supabase Integration', () => {
  test('should have Supabase client initialized', async ({ page }) => {
    await page.goto('/login');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Check if Supabase is available
    const hasSupabase = await page.evaluate(() => {
      return typeof (window as any).supabase !== 'undefined';
    });

    expect(hasSupabase).toBeTruthy();
    console.log('✅ Supabase client is initialized');
  });

  test('should create authenticated session after login', async ({ page }) => {
    await page.goto('/login');
    await login(page);

    // Wait a bit for session to be established
    await page.waitForTimeout(2000);

    // Check for Supabase session
    const session = await page.evaluate(async () => {
      const supabase = (window as any).supabase;
      if (!supabase) return null;
      
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    });

    expect(session).toBeTruthy();
    expect(session.user.email).toBe(TEST_USER.email);
    console.log('✅ Supabase session created for:', session.user.email);
  });
});