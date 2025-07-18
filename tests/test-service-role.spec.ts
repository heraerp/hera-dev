import { test, expect } from '@playwright/test';

test('should test restaurant setup with service role client', async ({ page }) => {
  console.log('🔐 Testing restaurant setup with service role client...');
  
  // Navigate to restaurant setup page
  await page.goto('http://localhost:3000/setup/restaurant');
  await page.waitForLoadState('networkidle');
  
  // Wait for service client initialization
  await page.waitForTimeout(2000);
  
  // Monitor console messages to see service role initialization
  const consoleMessages: string[] = [];
  page.on('console', msg => {
    const text = msg.text();
    consoleMessages.push(`[${msg.type()}] ${text}`);
    console.log(`🔍 Console: [${msg.type()}] ${text}`);
  });
  
  // Complete restaurant setup form quickly
  console.log('📝 Completing restaurant setup form...');
  
  // Step 1: Business Information
  await page.fill('#businessName', 'Chef Lebanon Restaurant Test');
  await page.fill('#cuisineType', 'Lebanese');
  await page.fill('#businessEmail', 'test@cheflebanon.com');
  await page.fill('#primaryPhone', '+91 9876543210');
  await page.click('button:has-text("Next Step")');
  await page.waitForTimeout(500);
  
  // Step 2: Location Details
  await page.fill('#locationName', 'Kottakkal Branch Test');
  await page.fill('#address', '123 Test Street');
  await page.fill('#city', 'Kottakkal');
  await page.fill('#postalCode', '676503');
  await page.click('button:has-text("Next Step")');
  await page.waitForTimeout(500);
  
  // Step 3: Operations Setup
  await page.fill('#openingTime', '08:00');
  await page.fill('#closingTime', '22:00');
  await page.fill('#seatingCapacity', '40');
  await page.click('button:has-text("Next Step")');
  await page.waitForTimeout(500);
  
  // Step 4: Manager Information
  await page.fill('#managerName', 'Ahmed Hassan Test');
  await page.fill('#managerEmail', 'ahmed.test@cheflebanon.com');
  await page.fill('#managerPhone', '+91 9876543211');
  
  console.log('✅ Form completed, submitting with service role...');
  
  // Submit the form
  await page.click('button:has-text("Complete Setup")');
  
  // Wait longer for database operations
  console.log('⏳ Waiting for setup completion...');
  await page.waitForTimeout(10000);
  
  // Analyze console messages
  console.log('\n📊 Console Message Analysis:');
  console.log('============================');
  
  const serviceRoleMessages = consoleMessages.filter(msg => 
    msg.includes('Service Role') || msg.includes('service role') || msg.includes('Service role')
  );
  
  const successMessages = consoleMessages.filter(msg => 
    msg.includes('✅') || msg.includes('created successfully') || msg.includes('Setup complete')
  );
  
  const errorMessages = consoleMessages.filter(msg => 
    msg.includes('❌') || msg.includes('error') || msg.includes('Error') || msg.includes('failed')
  );
  
  console.log(`🔐 Service Role Messages: ${serviceRoleMessages.length}`);
  serviceRoleMessages.forEach(msg => console.log(`   ${msg}`));
  
  console.log(`\n✅ Success Messages: ${successMessages.length}`);
  successMessages.forEach(msg => console.log(`   ${msg}`));
  
  console.log(`\n❌ Error Messages: ${errorMessages.length}`);
  errorMessages.forEach(msg => console.log(`   ${msg}`));
  
  // Check for setup completion indicators
  const completionIndicators = [
    'text=Restaurant setup completed successfully',
    'text=Setup complete',
    'text=Business entity created successfully',
    'text=Restaurant location created successfully'
  ];
  
  let foundCompletion = false;
  for (const indicator of completionIndicators) {
    const count = await page.locator(indicator).count();
    if (count > 0) {
      console.log(`✅ Found completion indicator: ${indicator}`);
      foundCompletion = true;
    }
  }
  
  // Check current URL
  const currentUrl = page.url();
  console.log(`📍 Final URL: ${currentUrl}`);
  
  // Check if redirected to restaurant dashboard
  if (currentUrl.includes('/restaurant') && !currentUrl.includes('/setup')) {
    console.log('🎉 Successfully redirected to restaurant dashboard!');
    foundCompletion = true;
  }
  
  // Final assessment
  console.log('\n🎯 Final Assessment:');
  console.log('====================');
  console.log(`✅ Setup Completion Found: ${foundCompletion}`);
  console.log(`🔐 Service Role Detected: ${serviceRoleMessages.length > 0}`);
  console.log(`✅ Success Operations: ${successMessages.length}`);
  console.log(`❌ Error Count: ${errorMessages.length}`);
  
  if (foundCompletion && errorMessages.length === 0) {
    console.log('\n🎉 SUCCESS: Restaurant setup with service role working perfectly!');
  } else if (foundCompletion && errorMessages.length > 0) {
    console.log('\n⚠️ PARTIAL SUCCESS: Setup completed but with some errors');
  } else {
    console.log('\n❌ FAILED: Setup did not complete successfully');
  }
  
  // Take final screenshot
  await page.screenshot({ path: 'service-role-test.png', fullPage: true });
});