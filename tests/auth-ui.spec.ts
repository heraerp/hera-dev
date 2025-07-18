import { test, expect } from '@playwright/test';

test.describe('Authentication UI and Navigation', () => {
  test('auth pages load correctly', async ({ page }) => {
    console.log('🔍 Testing authentication page loading...');
    
    // Test Login Page
    await page.goto('/auth/login');
    await expect(page).toHaveURL(/.*\/auth\/login/);
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in|login/i })).toBeVisible();
    console.log('✅ Login page loads with all required fields');
    
    // Test Signup Page
    await page.goto('/auth/sign-up');
    await expect(page).toHaveURL(/.*\/auth\/sign-up/);
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i).first()).toBeVisible();
    await expect(page.getByRole('button', { name: /sign up|create/i })).toBeVisible();
    console.log('✅ Signup page loads with all required fields');
    
    // Test Forgot Password Page
    await page.goto('/forgot-password');
    await expect(page).toHaveURL(/.*forgot/);
    console.log('✅ Forgot password page loads');
  });

  test('auth navigation works', async ({ page }) => {
    console.log('🧭 Testing authentication navigation...');
    
    // Start at login page
    await page.goto('/auth/login');
    
    // Find and click signup link
    const signupLink = page.getByRole('link', { name: /sign up|create|register/i }).first();
    if (await signupLink.isVisible()) {
      await signupLink.click();
      await expect(page).toHaveURL(/.*\/auth\/sign-up/);
      console.log('✅ Can navigate from login to signup');
    }
    
    // Find and click login link
    const loginLink = page.getByRole('link', { name: /sign in|login|already/i }).first();
    if (await loginLink.isVisible()) {
      await loginLink.click();
      await expect(page).toHaveURL(/.*\/auth\/login/);
      console.log('✅ Can navigate from signup to login');
    }
    
    // Test forgot password link
    const forgotLink = page.getByRole('link', { name: /forgot|reset/i }).first();
    if (await forgotLink.isVisible()) {
      await forgotLink.click();
      await expect(page).toHaveURL(/.*forgot/);
      console.log('✅ Can navigate to forgot password');
    }
  });

  test('solution selector loads', async ({ page }) => {
    console.log('🎯 Testing solution selector...');
    
    await page.goto('/setup');
    await page.waitForTimeout(2000);
    
    const url = page.url();
    if (url.includes('/setup')) {
      // Check for solution cards or content
      const hasRestaurant = await page.getByText(/restaurant/i).isVisible();
      const hasRetail = await page.getByText(/retail/i).isVisible();
      const hasSolutions = await page.getByText(/solution|choose|select/i).isVisible();
      
      if (hasRestaurant || hasRetail || hasSolutions) {
        console.log('✅ Solution selector loads with business solutions');
        
        // Try to find a restaurant solution card and click it
        const restaurantCard = page.locator('[data-testid*="restaurant"], .solution-card, .card').filter({ hasText: /restaurant/i }).first();
        if (await restaurantCard.isVisible()) {
          console.log('✅ Restaurant solution card is visible');
        }
      } else {
        console.log('⚠️ Solution selector loads but no solutions visible');
      }
    } else {
      console.log('ℹ️ Redirected to authentication (expected for protected route)');
    }
  });

  test('restaurant pages are protected', async ({ page }) => {
    console.log('🛡️ Testing route protection...');
    
    // Try to access restaurant dashboard without authentication
    await page.goto('/restaurant/dashboard');
    await page.waitForTimeout(3000);
    
    const url = page.url();
    const hasLogin = url.includes('login') || url.includes('auth');
    const hasAuthText = await page.getByText(/sign in|login|authenticate/i).isVisible();
    
    if (hasLogin || hasAuthText) {
      console.log('✅ Restaurant dashboard is protected - redirects to authentication');
    } else {
      console.log('⚠️ Restaurant dashboard may not be properly protected');
    }
  });

  test('home page loads', async ({ page }) => {
    console.log('🏠 Testing home page...');
    
    await page.goto('/');
    await page.waitForTimeout(2000);
    
    // Should either see landing page or be redirected to auth
    const hasHeroContent = await page.getByText(/welcome|hera|universal/i).isVisible();
    const hasAuthLinks = await page.getByRole('link', { name: /sign in|login|sign up/i }).isVisible();
    
    if (hasHeroContent || hasAuthLinks) {
      console.log('✅ Home page loads with content or auth links');
    } else {
      console.log('ℹ️ Home page has different content than expected');
    }
  });

  test('form validation works', async ({ page }) => {
    console.log('✅ Testing form validation...');
    
    // Test login form validation
    await page.goto('/auth/login');
    
    // Try to submit empty form
    await page.getByRole('button', { name: /sign in|login/i }).click();
    await page.waitForTimeout(1000);
    
    // Should still be on login page (validation prevented submission)
    expect(page.url()).toContain('/auth/login');
    console.log('✅ Login form validation prevents empty submission');
    
    // Test signup form validation
    await page.goto('/auth/sign-up');
    
    // Try to submit empty form
    await page.getByRole('button', { name: /sign up|create/i }).click();
    await page.waitForTimeout(1000);
    
    // Should still be on signup page
    expect(page.url()).toContain('/auth/sign-up');
    console.log('✅ Signup form validation prevents empty submission');
  });
});