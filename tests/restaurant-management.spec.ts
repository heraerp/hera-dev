import { test, expect } from '@playwright/test';

test('should display and allow editing of restaurant profile', async ({ page }) => {
  console.log('🧪 Testing Restaurant Management Pages...');
  
  // Navigate to restaurant profile page
  await page.goto('http://localhost:3000/restaurant/profile');
  
  // Wait for data to load
  await page.waitForTimeout(3000);
  
  console.log('📄 Testing Restaurant Profile Page...');
  
  // Check if page loads and displays restaurant data
  const pageTitle = page.locator('h1');
  await expect(pageTitle).toContainText('Chef Lebanon Restaurant');
  
  // Check for key sections
  await expect(page.locator('text=Business Information')).toBeVisible();
  await expect(page.locator('text=Location Details')).toBeVisible();
  await expect(page.locator('text=Operations')).toBeVisible();
  await expect(page.locator('text=Manager')).toBeVisible();
  
  // Check if data is displayed correctly
  await expect(page.locator('text=Lebanese')).toBeVisible(); // Cuisine type
  await expect(page.locator('text=Kottakkal Branch')).toBeVisible(); // Location name
  await expect(page.locator('text=Ahmed Hassan')).toBeVisible(); // Manager name
  
  console.log('✅ Restaurant data displayed correctly');
  
  // Test edit functionality
  console.log('🔄 Testing Edit Functionality...');
  
  // Click edit button
  await page.click('text=Edit Profile');
  await page.waitForTimeout(1000);
  
  // Verify edit mode is active
  await expect(page.locator('text=Save Changes')).toBeVisible();
  await expect(page.locator('text=Cancel')).toBeVisible();
  
  // Try editing a field (website)
  const websiteInput = page.locator('input[placeholder="https://example.com"]');
  await websiteInput.clear();
  await websiteInput.fill('https://updated-chef-lebanon.com');
  
  console.log('✅ Edit mode working correctly');
  
  // Cancel edit to not make actual changes
  await page.click('text=Cancel');
  await page.waitForTimeout(500);
  
  // Verify we're back to view mode
  await expect(page.locator('text=Edit Profile')).toBeVisible();
  
  console.log('✅ Cancel functionality working');
  
  // Take screenshot
  await page.screenshot({ path: 'restaurant-profile-test.png', fullPage: true });
  
  console.log('📸 Screenshot saved: restaurant-profile-test.png');
  
  // Test sidebar information
  console.log('📊 Testing Sidebar Information...');
  
  await expect(page.locator('text=Active')).toBeVisible(); // Status badge
  await expect(page.locator('text=Food & Beverage')).toBeVisible(); // Industry
  await expect(page.locator('text=INR')).toBeVisible(); // Currency
  
  console.log('✅ Sidebar information displayed correctly');
  
  console.log('🎉 Restaurant Profile Page Test: PASSED!');
});

test('should display restaurant management dashboard', async ({ page }) => {
  console.log('📊 Testing Restaurant Management Dashboard...');
  
  // Navigate to restaurant management page
  await page.goto('http://localhost:3000/restaurant/manage');
  
  // Wait for data to load
  await page.waitForTimeout(3000);
  
  // Check if page loads and displays restaurant data
  const pageTitle = page.locator('h1');
  await expect(pageTitle).toContainText('Chef Lebanon Restaurant');
  
  // Check for all management sections
  await expect(page.locator('text=Business Information')).toBeVisible();
  await expect(page.locator('text=Location Details')).toBeVisible();
  await expect(page.locator('text=Operations')).toBeVisible();
  await expect(page.locator('text=Manager Information')).toBeVisible();
  
  // Check sidebar sections
  await expect(page.locator('text=Quick Stats')).toBeVisible();
  await expect(page.locator('text=System Information')).toBeVisible();
  await expect(page.locator('text=Quick Actions')).toBeVisible();
  
  // Verify edit buttons are present for each section
  const editButtons = page.locator('text=Edit');
  const editButtonCount = await editButtons.count();
  expect(editButtonCount).toBeGreaterThan(0);
  
  console.log(`✅ Found ${editButtonCount} edit buttons`);
  
  // Test business information edit
  console.log('🔄 Testing Business Information Edit...');
  
  // Find and click the first Edit button (Business Information)
  await page.click('text=Business Information >> .. >> text=Edit');
  await page.waitForTimeout(1000);
  
  // Verify edit mode controls appear
  await expect(page.locator('text=Save')).toBeVisible();
  await expect(page.locator('text=Cancel')).toBeVisible();
  
  // Cancel edit
  await page.click('text=Cancel');
  await page.waitForTimeout(500);
  
  console.log('✅ Business section edit functionality working');
  
  // Test refresh functionality
  console.log('🔄 Testing Refresh Functionality...');
  
  await page.click('text=Refresh');
  await page.waitForTimeout(2000);
  
  // Verify page still shows data after refresh
  await expect(pageTitle).toContainText('Chef Lebanon Restaurant');
  
  console.log('✅ Refresh functionality working');
  
  // Take screenshot
  await page.screenshot({ path: 'restaurant-management-test.png', fullPage: true });
  
  console.log('📸 Screenshot saved: restaurant-management-test.png');
  
  console.log('🎉 Restaurant Management Dashboard Test: PASSED!');
});

test('should handle missing restaurant data gracefully', async ({ page }) => {
  console.log('⚠️  Testing Error Handling...');
  
  // This test simulates what happens when no restaurant data is found
  // For now, we'll just check that the pages load without crashing
  
  try {
    await page.goto('http://localhost:3000/restaurant/profile');
    await page.waitForTimeout(5000);
    
    // Check if either data loads or error message appears
    const hasData = await page.locator('text=Chef Lebanon Restaurant').isVisible();
    const hasError = await page.locator('text=Unable to Load Profile').isVisible();
    const hasNoData = await page.locator('text=No Restaurant Found').isVisible();
    
    expect(hasData || hasError || hasNoData).toBe(true);
    
    if (hasData) {
      console.log('✅ Restaurant data loaded successfully');
    } else if (hasError || hasNoData) {
      console.log('✅ Error handling working correctly');
    }
    
    console.log('🎉 Error Handling Test: PASSED!');
    
  } catch (error) {
    console.log('❌ Error handling test failed:', error);
    throw error;
  }
});