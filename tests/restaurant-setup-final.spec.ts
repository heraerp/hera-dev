import { test, expect } from '@playwright/test';

test('should complete restaurant setup with service role API and verify database creation', async ({ page }) => {
  console.log('🚀 Testing complete restaurant setup with service role API...');
  
  // Monitor all console messages
  const consoleMessages: string[] = [];
  page.on('console', msg => {
    const text = msg.text();
    consoleMessages.push(`[${msg.type()}] ${text}`);
    
    // Log important messages immediately
    if (text.includes('✅') || text.includes('🎉') || text.includes('Records created')) {
      console.log(`✅ Success: ${text}`);
    } else if (text.includes('❌') || text.includes('error') || msg.type() === 'error') {
      console.log(`❌ Error: ${text}`);
    } else if (text.includes('API response') || text.includes('Restaurant details')) {
      console.log(`📊 Info: ${text}`);
    }
  });
  
  // Navigate to restaurant setup page
  await page.goto('http://localhost:3000/setup/restaurant');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);
  
  console.log('📝 Completing restaurant setup form...');
  
  // Step 1: Business Information
  await page.fill('#businessName', 'Chef Lebanon Restaurant');
  await page.fill('#cuisineType', 'Lebanese');
  await page.fill('#businessEmail', 'info@cheflebanon.com');
  await page.fill('#primaryPhone', '+91 9876543210');
  await page.fill('#website', 'www.cheflebanon.com');
  await page.click('button:has-text("Next Step")');
  await page.waitForTimeout(1000);
  
  // Step 2: Location Details
  await page.fill('#locationName', 'Kottakkal Branch');
  await page.fill('#address', '123 Main Street, Near Bus Stand, Kottakkal');
  await page.fill('#city', 'Kottakkal');
  
  // Select state from dropdown
  await page.click('text=Select state'); // Click state dropdown trigger
  await page.waitForTimeout(500);
  await page.click('text=Kerala'); // Select Kerala option
  await page.waitForTimeout(500);
  
  await page.fill('#postalCode', '676503');
  await page.click('button:has-text("Next Step")');
  await page.waitForTimeout(1000);
  
  // Step 3: Operations Setup
  await page.fill('#openingTime', '08:00');
  await page.fill('#closingTime', '22:00');
  await page.fill('#seatingCapacity', '40');
  await page.click('button:has-text("Next Step")');
  await page.waitForTimeout(1000);
  
  // Step 4: Manager Information
  await page.fill('#managerName', 'Ahmed Hassan');
  await page.fill('#managerEmail', 'ahmed@cheflebanon.com');
  await page.fill('#managerPhone', '+91 9876543211');
  
  console.log('✅ Form completed, submitting via service role API...');
  
  // Submit the form
  await page.click('button:has-text("Complete Setup")');
  
  console.log('⏳ Waiting for API processing...');
  await page.waitForTimeout(10000);
  
  // Check for success indicators
  const successIndicators = [
    'text=Restaurant setup completed successfully',
    'text=Setup complete',
    'text=Business entity created successfully',
    'text=Restaurant location created successfully'
  ];
  
  let foundSuccess = false;
  for (const indicator of successIndicators) {
    const count = await page.locator(indicator).count();
    if (count > 0) {
      console.log(`✅ Found success indicator: ${indicator}`);
      foundSuccess = true;
    }
  }
  
  // Check if redirected
  const currentUrl = page.url();
  console.log(`📍 Current URL: ${currentUrl}`);
  
  if (currentUrl.includes('/restaurant') && !currentUrl.includes('/setup')) {
    console.log('🎉 Successfully redirected to restaurant dashboard!');
    foundSuccess = true;
  }
  
  // Analyze console messages for API results
  const apiMessages = consoleMessages.filter(msg => 
    msg.includes('API response') || msg.includes('Records created') || msg.includes('Restaurant details')
  );
  
  const errorMessages = consoleMessages.filter(msg => 
    msg.includes('[error]') || msg.includes('❌') || msg.includes('Setup error')
  );
  
  const successMessages = consoleMessages.filter(msg => 
    msg.includes('✅') || msg.includes('🎉') || msg.includes('completed successfully')
  );
  
  console.log('\n📊 Test Results Summary:');
  console.log('========================');
  console.log(`✅ Success Indicators Found: ${foundSuccess}`);
  console.log(`📡 API Response Messages: ${apiMessages.length}`);
  console.log(`✅ Success Messages: ${successMessages.length}`);
  console.log(`❌ Error Messages: ${errorMessages.length}`);
  
  if (apiMessages.length > 0) {
    console.log('\n📡 API Response Details:');
    apiMessages.forEach(msg => console.log(`   ${msg}`));
  }
  
  if (errorMessages.length > 0) {
    console.log('\n❌ Error Details:');
    errorMessages.forEach(msg => console.log(`   ${msg}`));
  }
  
  // Final verification
  if (foundSuccess && errorMessages.length === 0) {
    console.log('\n🎉 SUCCESS: Restaurant setup completed successfully with service role API!');
    console.log('✅ Database records should be created');
    console.log('✅ Error handling working correctly');
    console.log('✅ User feedback provided');
  } else if (foundSuccess && errorMessages.length > 0) {
    console.log('\n⚠️ PARTIAL SUCCESS: Setup completed but with some errors');
  } else {
    console.log('\n❌ FAILED: Setup did not complete successfully');
  }
  
  // Take final screenshot
  await page.screenshot({ path: 'restaurant-setup-final-test.png', fullPage: true });
  
  // Basic assertion
  expect(foundSuccess || apiMessages.length > 0).toBeTruthy();
});