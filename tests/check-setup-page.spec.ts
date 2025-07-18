import { test, expect } from '@playwright/test';

test('should check if restaurant setup page loads correctly', async ({ page }) => {
  console.log('🔍 Checking restaurant setup page status...');
  
  // Monitor console messages
  const consoleMessages: string[] = [];
  page.on('console', msg => {
    const text = msg.text();
    consoleMessages.push(`[${msg.type()}] ${text}`);
    if (msg.type() === 'error' || text.includes('Error') || text.includes('❌')) {
      console.log(`❌ Error: ${text}`);
    } else if (text.includes('✅') || text.includes('Service Role')) {
      console.log(`✅ Success: ${text}`);
    }
  });
  
  // Navigate to restaurant setup page
  await page.goto('http://localhost:3000/setup/restaurant');
  await page.waitForLoadState('networkidle');
  
  // Wait for page initialization
  await page.waitForTimeout(3000);
  
  // Check if page loaded correctly
  const pageTitle = await page.title();
  console.log(`📄 Page Title: ${pageTitle}`);
  
  // Check for key elements
  const h1Count = await page.locator('h1').count();
  const inputCount = await page.locator('input').count();
  const buttonCount = await page.locator('button').count();
  
  console.log(`📊 Page Elements:`);
  console.log(`   H1 elements: ${h1Count}`);
  console.log(`   Input fields: ${inputCount}`);
  console.log(`   Buttons: ${buttonCount}`);
  
  // Check if form fields are accessible
  const businessNameField = page.locator('#businessName');
  const isBusinessNameVisible = await businessNameField.isVisible().catch(() => false);
  
  console.log(`📝 Business Name Field Visible: ${isBusinessNameVisible}`);
  
  if (isBusinessNameVisible) {
    console.log('✅ Form fields are accessible - page loaded correctly');
    
    // Try a quick form test
    await businessNameField.fill('Test Restaurant');
    const fieldValue = await businessNameField.inputValue();
    console.log(`📝 Test input successful: "${fieldValue}"`);
    
  } else {
    console.log('❌ Form fields not accessible - page may have errors');
    
    // Take screenshot for debugging
    await page.screenshot({ path: 'setup-page-error.png', fullPage: true });
  }
  
  // Log console messages summary
  const errorMessages = consoleMessages.filter(msg => 
    msg.includes('[error]') || msg.includes('Error') || msg.includes('❌')
  );
  
  const successMessages = consoleMessages.filter(msg => 
    msg.includes('✅') || msg.includes('Service Role') || msg.includes('success')
  );
  
  console.log(`\n📊 Console Summary:`);
  console.log(`   Total messages: ${consoleMessages.length}`);
  console.log(`   Error messages: ${errorMessages.length}`);
  console.log(`   Success messages: ${successMessages.length}`);
  
  if (errorMessages.length > 0) {
    console.log('\n❌ Error Messages:');
    errorMessages.forEach(msg => console.log(`   ${msg}`));
  }
  
  if (successMessages.length > 0) {
    console.log('\n✅ Success Messages:');
    successMessages.forEach(msg => console.log(`   ${msg}`));
  }
  
  // Final assessment
  expect(h1Count).toBeGreaterThan(0);
  expect(inputCount).toBeGreaterThan(0);
  expect(isBusinessNameVisible).toBeTruthy();
});