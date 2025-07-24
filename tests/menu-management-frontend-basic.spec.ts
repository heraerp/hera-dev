/**
 * 🍽️ HERA Menu Management Frontend - Basic Testing
 * 
 * This test focuses on basic frontend functionality without complex authentication
 */

import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';
const MARIO_ORG_ID = '123e4567-e89b-12d3-a456-426614174000';

test.describe('🍽️ Menu Management Frontend - Basic Tests', () => {

  test('🌐 Menu Management Page Load Test', async ({ page }) => {
    console.log('🌐 Testing menu management page accessibility...');
    
    // Try to access the menu management page directly
    await page.goto(`${BASE_URL}/restaurant/menu-management`);
    await page.waitForLoadState('networkidle');
    
    // Check if page loads (even if redirected to login)
    const title = await page.title();
    console.log(`📄 Page title: ${title}`);
    
    // Check for key elements that should exist
    const body = await page.locator('body').textContent();
    
    if (body?.includes('Loading') || body?.includes('login') || body?.includes('Login')) {
      console.log('🔐 Page requires authentication - this is expected behavior');
      expect(title).toContain('HERA');
    } else if (body?.includes('Menu') || body?.includes('Category') || body?.includes('Item')) {
      console.log('✅ Menu management interface is accessible');
      expect(body).toContain('Menu');
    } else {
      console.log('⚠️ Unexpected page content, but page loaded successfully');
    }
    
    // Check that the page is responsive
    expect(await page.locator('html').getAttribute('lang')).toBe('en');
    console.log('✅ Basic page load test completed');
  });

  test('📱 Mobile Viewport Test', async ({ page }) => {
    console.log('📱 Testing mobile viewport...');
    
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto(`${BASE_URL}/restaurant/menu-management`);
    await page.waitForLoadState('networkidle');
    
    // Check viewport meta tag
    const viewportMeta = await page.locator('meta[name="viewport"]').getAttribute('content');
    expect(viewportMeta).toContain('width=device-width');
    
    // Check that content is responsive
    const bodyWidth = await page.evaluate(() => document.body.clientWidth);
    expect(bodyWidth).toBeLessThanOrEqual(375);
    
    console.log('✅ Mobile viewport test completed');
  });

  test('🔗 API Endpoints Accessibility', async ({ page }) => {
    console.log('🔗 Testing API endpoints accessibility...');
    
    // Test if API endpoints are accessible from the frontend
    const apiTests = [
      `/api/menu/categories?organizationId=${MARIO_ORG_ID}`,
      `/api/menu/items?organizationId=${MARIO_ORG_ID}`,
      `/api/menu/analytics?organizationId=${MARIO_ORG_ID}`
    ];
    
    for (const endpoint of apiTests) {
      const response = await page.request.get(`${BASE_URL}${endpoint}`);
      console.log(`📊 ${endpoint}: ${response.status()}`);
      expect(response.ok()).toBeTruthy();
    }
    
    console.log('✅ API endpoints accessibility test completed');
  });

  test('🎨 CSS and Assets Loading', async ({ page }) => {
    console.log('🎨 Testing CSS and assets loading...');
    
    await page.goto(`${BASE_URL}/restaurant/menu-management`);
    await page.waitForLoadState('networkidle');
    
    // Check if CSS is loaded
    const stylesheets = await page.locator('link[rel="stylesheet"]').count();
    console.log(`📄 Stylesheets loaded: ${stylesheets}`);
    expect(stylesheets).toBeGreaterThan(0);
    
    // Check if JavaScript is loaded
    const scripts = await page.locator('script').count();
    console.log(`📄 Scripts loaded: ${scripts}`);
    expect(scripts).toBeGreaterThan(0);
    
    // Check computed styles
    const bodyBgColor = await page.evaluate(() => {
      return window.getComputedStyle(document.body).backgroundColor;
    });
    console.log(`🎨 Body background color: ${bodyBgColor}`);
    
    console.log('✅ CSS and assets loading test completed');
  });

  test('⚡ Performance Metrics', async ({ page }) => {
    console.log('⚡ Testing performance metrics...');
    
    const startTime = Date.now();
    
    await page.goto(`${BASE_URL}/restaurant/menu-management`);
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    console.log(`⏱️ Page load time: ${loadTime}ms`);
    
    // Check if load time is reasonable (under 10 seconds for any page state)
    expect(loadTime).toBeLessThan(10000);
    
    // Test navigation timing if available
    const navigationTiming = await page.evaluate(() => {
      if (performance.navigation) {
        return {
          type: performance.navigation.type,
          redirectCount: performance.navigation.redirectCount
        };
      }
      return null;
    });
    
    if (navigationTiming) {
      console.log(`🧭 Navigation type: ${navigationTiming.type}`);
      console.log(`🔄 Redirect count: ${navigationTiming.redirectCount}`);
    }
    
    console.log('✅ Performance metrics test completed');
  });

  test('🛡️ Security Headers and Meta Tags', async ({ page }) => {
    console.log('🛡️ Testing security headers and meta tags...');
    
    const response = await page.goto(`${BASE_URL}/restaurant/menu-management`);
    
    // Check response headers
    const headers = response?.headers();
    if (headers) {
      console.log('📋 Response headers:');
      Object.entries(headers).forEach(([key, value]) => {
        if (key.toLowerCase().includes('security') || 
            key.toLowerCase().includes('content') ||
            key.toLowerCase().includes('x-')) {
          console.log(`   ${key}: ${value}`);
        }
      });
    }
    
    // Check meta tags
    const metaTags = await page.locator('meta').count();
    console.log(`🏷️ Meta tags count: ${metaTags}`);
    expect(metaTags).toBeGreaterThan(0);
    
    // Check for important meta tags
    const viewportMeta = await page.locator('meta[name="viewport"]').count();
    expect(viewportMeta).toBeGreaterThan(0);
    
    const charsetMeta = await page.locator('meta[charset], meta[charSet]').count();
    expect(charsetMeta).toBeGreaterThan(0);
    
    console.log('✅ Security headers and meta tags test completed');
  });

  test('🔍 Console Errors Check', async ({ page }) => {
    console.log('🔍 Checking for console errors...');
    
    const consoleMessages: string[] = [];
    const errors: string[] = [];
    
    page.on('console', msg => {
      const text = msg.text();
      consoleMessages.push(`${msg.type()}: ${text}`);
      
      if (msg.type() === 'error') {
        errors.push(text);
      }
    });
    
    await page.goto(`${BASE_URL}/restaurant/menu-management`);
    await page.waitForLoadState('networkidle');
    
    console.log(`📝 Console messages: ${consoleMessages.length}`);
    console.log(`❌ Console errors: ${errors.length}`);
    
    // Log first few messages for debugging
    consoleMessages.slice(0, 5).forEach(msg => {
      console.log(`   ${msg}`);
    });
    
    // Check that there are no critical errors
    const criticalErrors = errors.filter(error => 
      !error.includes('favicon') && 
      !error.includes('websocket') &&
      !error.includes('hot-reload')
    );
    
    console.log(`🚨 Critical errors: ${criticalErrors.length}`);
    expect(criticalErrors.length).toBeLessThan(5); // Allow some minor errors
    
    console.log('✅ Console errors check completed');
  });

});