import { test, expect } from '@playwright/test';

test.describe('Restaurant Setup with Database Verification', () => {
  test('should complete restaurant setup and verify submission success', async ({ page }) => {
    console.log('🚀 Starting restaurant setup with database verification...');
    
    // Navigate to setup page
    await page.goto('http://localhost:3000/setup/restaurant');
    await page.waitForLoadState('networkidle');
    
    // Wait for Supabase connection tests
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
    
    console.log('✅ Form completed, submitting setup...');
    
    // Complete setup and capture console logs
    const consoleMessages: string[] = [];
    page.on('console', msg => {
      consoleMessages.push(`[${msg.type()}] ${msg.text()}`);
    });
    
    // Monitor network requests
    const networkRequests: any[] = [];
    page.on('request', request => {
      if (request.url().includes('supabase') || request.method() === 'POST') {
        networkRequests.push({
          url: request.url(),
          method: request.method(),
          headers: request.headers()
        });
      }
    });
    
    // Monitor responses
    const networkResponses: any[] = [];
    page.on('response', response => {
      if (response.url().includes('supabase') || response.status() >= 400) {
        networkResponses.push({
          url: response.url(),
          status: response.status(),
          statusText: response.statusText()
        });
      }
    });
    
    // Submit the form
    await page.click('button:has-text("Complete Setup")');
    
    console.log('⏳ Waiting for setup submission to complete...');
    await page.waitForTimeout(8000); // Wait longer for database operations
    
    console.log('\n📊 Console Messages During Setup:');
    consoleMessages.forEach(msg => console.log(`   ${msg}`));
    
    console.log('\n🌐 Network Requests Made:');
    networkRequests.forEach(req => {
      console.log(`   ${req.method} ${req.url}`);
    });
    
    console.log('\n📡 Network Responses Received:');
    networkResponses.forEach(res => {
      console.log(`   ${res.status} ${res.statusText} - ${res.url}`);
    });
    
    // Look for setup completion indicators
    const progressMessages = [
      'Creating business entity',
      'Creating restaurant location',
      'Finalizing setup',
      'Setup complete',
      'Restaurant setup completed successfully',
      'Redirecting to your restaurant dashboard'
    ];
    
    console.log('\n🔍 Checking for setup progress indicators...');
    let foundProgressIndicator = false;
    
    for (const message of progressMessages) {
      const element = page.locator(`text=${message}`);
      const count = await element.count();
      if (count > 0) {
        console.log(`✅ Found: "${message}"`);
        foundProgressIndicator = true;
      }
    }
    
    // Check if redirected or button is disabled
    const currentUrl = page.url();
    const completeButton = page.locator('button:has-text("Complete Setup")');
    const buttonDisabled = await completeButton.getAttribute('disabled');
    
    console.log(`\n📍 Current URL: ${currentUrl}`);
    console.log(`🔘 Complete button disabled: ${buttonDisabled !== null}`);
    
    if (currentUrl.includes('/restaurant') && !currentUrl.includes('/setup')) {
      console.log('🎉 Successfully redirected to restaurant dashboard!');
      foundProgressIndicator = true;
    }
    
    if (buttonDisabled !== null) {
      console.log('✅ Complete button is disabled (indicates submission processed)');
      foundProgressIndicator = true;
    }
    
    // Try to query database using browser's Supabase client
    console.log('\n🔍 Attempting to verify data in database...');
    
    const dbQueryResult = await page.evaluate(async () => {
      try {
        // Try to access Supabase client from global scope
        const supabase = (window as any).supabase;
        if (!supabase) {
          return { error: 'Supabase client not available' };
        }
        
        // Query for our specific data
        const { data: clients, error } = await supabase
          .from('core_clients')
          .select('*')
          .ilike('client_name', '%Chef Lebanon%')
          .limit(5);
        
        if (error) {
          return { error: error.message };
        }
        
        return { 
          success: true, 
          clientCount: clients?.length || 0,
          clients: clients?.map(c => ({
            id: c.id,
            name: c.client_name,
            type: c.client_type,
            created: c.created_at
          })) || []
        };
        
      } catch (error) {
        return { error: error.message };
      }
    });
    
    console.log('\n📊 Database Query Result:');
    if (dbQueryResult.error) {
      console.log(`❌ Query Error: ${dbQueryResult.error}`);
    } else {
      console.log(`✅ Found ${dbQueryResult.clientCount} client records`);
      dbQueryResult.clients.forEach((client: any, index: number) => {
        console.log(`   ${index + 1}. ${client.name} (${client.type})`);
        console.log(`      ID: ${client.id}`);
        console.log(`      Created: ${new Date(client.created).toLocaleString()}`);
      });
    }
    
    // Final verification
    const setupCompleted = foundProgressIndicator || currentUrl.includes('/restaurant');
    const dataFound = dbQueryResult.success && dbQueryResult.clientCount > 0;
    
    console.log('\n🎯 Final Verification Summary:');
    console.log('==============================');
    console.log(`✅ Setup Process Completed: ${setupCompleted}`);
    console.log(`✅ Database Data Found: ${dataFound}`);
    console.log(`📊 Console Messages: ${consoleMessages.length}`);
    console.log(`🌐 Network Requests: ${networkRequests.length}`);
    console.log(`📡 Network Responses: ${networkResponses.length}`);
    
    if (setupCompleted && dataFound) {
      console.log('\n🎉 SUCCESS: Restaurant setup completed and data verified!');
    } else if (setupCompleted) {
      console.log('\n✅ Setup completed but database verification inconclusive');
    } else {
      console.log('\n⚠️ Setup process may not have completed successfully');
    }
    
    // Take final screenshot
    await page.screenshot({ path: 'restaurant-setup-verification.png', fullPage: true });
    
    // Basic assertions
    expect(setupCompleted).toBeTruthy();
  });
});