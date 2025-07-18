import { test, expect } from '@playwright/test';
import { login, ensureLoggedIn } from './helpers/login';

test.describe('Dashboard Tests', () => {
  // Login once before all tests in this suite
  test.beforeEach(async ({ page }) => {
    await ensureLoggedIn(page);
  });

  test('should display dashboard content', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Should not be redirected to login
    await expect(page).not.toHaveURL(/.*\/login.*/);
    
    // Look for dashboard-specific content
    const dashboardElements = [
      'text=Dashboard',
      'text=Welcome',
      '[data-testid="dashboard-content"]',
      'h1:has-text("Dashboard")'
    ];

    let found = false;
    for (const selector of dashboardElements) {
      const element = await page.$(selector);
      if (element) {
        found = true;
        console.log(`✅ Found dashboard element: ${selector}`);
        break;
      }
    }
    
    expect(found).toBeTruthy();
  });

  test('should navigate to different sections', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Test navigation to different sections
    const sections = [
      { link: 'a[href="/transactions"]', url: '/transactions' },
      { link: 'a[href="/clients"]', url: '/clients' },
      { link: 'a[href="/restaurant"]', url: '/restaurant' }
    ];

    for (const section of sections) {
      const link = await page.$(section.link);
      if (link) {
        await link.click();
        await page.waitForLoadState('networkidle');
        expect(page.url()).toContain(section.url);
        console.log(`✅ Successfully navigated to ${section.url}`);
        
        // Go back to dashboard for next test
        await page.goto('/dashboard');
      }
    }
  });
});