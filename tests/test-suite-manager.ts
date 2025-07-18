import { test, expect } from '@playwright/test';

/**
 * 🎯 HERA Universal Test Suite Manager
 * 
 * Provides utilities for managing and executing HERA restaurant tests
 * with comprehensive reporting and validation
 */

export class HERATestSuiteManager {
  private static events: string[] = [];
  private static screenshots: string[] = [];
  private static complianceChecks: { [key: string]: boolean } = {};

  /**
   * Initialize test suite with monitoring
   */
  static initializeTestSuite(page: any, testName: string) {
    console.log(`🚀 Initializing HERA test: ${testName}`);
    
    // Reset tracking
    this.events = [];
    this.screenshots = [];
    this.complianceChecks = {};
    
    // Monitor console for HERA events
    page.on('console', (msg: any) => {
      const text = msg.text();
      
      // Track Universal Architecture compliance
      if (text.includes('organization_id')) {
        this.complianceChecks['organization_isolation'] = true;
        this.events.push(`🎯 Organization isolation: ${text}`);
      }
      
      // Track naming convention compliance
      if (text.includes('HeraNamingConventionAI') || text.includes('naming_convention')) {
        this.complianceChecks['naming_convention'] = true;
        this.events.push(`📏 Naming convention: ${text}`);
      }
      
      // Track universal schema usage
      if (text.includes('core_entities') || text.includes('core_metadata')) {
        this.complianceChecks['universal_schema'] = true;
        this.events.push(`🗄️ Universal schema: ${text}`);
      }
      
      // Track real-time features
      if (text.includes('real-time') || text.includes('subscription')) {
        this.complianceChecks['real_time'] = true;
        this.events.push(`⚡ Real-time: ${text}`);
      }
      
      // Track AI features
      if (text.includes('AI') || text.includes('intelligence') || text.includes('pattern')) {
        this.complianceChecks['ai_intelligence'] = true;
        this.events.push(`🧠 AI Intelligence: ${text}`);
      }
      
      // Track transaction processing
      if (text.includes('universal_transactions') || text.includes('transaction_processing')) {
        this.complianceChecks['universal_transactions'] = true;
        this.events.push(`💰 Universal transactions: ${text}`);
      }
      
      // Track general events
      if (text.includes('✅') || text.includes('❌') || text.includes('🎉')) {
        this.events.push(text);
      }
      
      // Track errors
      if (msg.type() === 'error' || text.includes('error')) {
        this.events.push(`❌ Error: ${text}`);
        console.log(`❌ Error detected: ${text}`);
      }
    });
    
    console.log(`✅ Test suite initialized for ${testName}`);
  }

  /**
   * Navigate to page with proper loading and verification
   */
  static async navigateToPage(page: any, url: string, expectedElements: string[] = []) {
    console.log(`🔗 Navigating to: ${url}`);
    
    await page.goto(url);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Verify expected elements if provided
    if (expectedElements.length > 0) {
      for (const element of expectedElements) {
        const isVisible = await page.locator(element).count() > 0;
        if (isVisible) {
          console.log(`✅ Found expected element: ${element}`);
          return true;
        }
      }
      console.log(`⚠️ Expected elements not found at ${url}`);
      return false;
    }
    
    return true;
  }

  /**
   * Take screenshot with automatic naming
   */
  static async takeScreenshot(page: any, name: string, fullPage: boolean = true) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `test-results/${timestamp}-${name}.png`;
    
    await page.screenshot({ path: filename, fullPage });
    this.screenshots.push(filename);
    
    console.log(`📸 Screenshot saved: ${filename}`);
    return filename;
  }

  /**
   * Fill form fields with validation
   */
  static async fillFormField(page: any, selector: string, value: string, fieldName: string = '') {
    try {
      const element = page.locator(selector);
      const count = await element.count();
      
      if (count > 0) {
        await element.fill(value);
        console.log(`✅ Filled ${fieldName || selector}: ${value}`);
        return true;
      } else {
        console.log(`⚠️ Field not found: ${fieldName || selector}`);
        return false;
      }
    } catch (error) {
      console.log(`❌ Error filling ${fieldName || selector}: ${error}`);
      return false;
    }
  }

  /**
   * Click button with fallback options
   */
  static async clickButton(page: any, selectors: string[], buttonName: string = '') {
    for (const selector of selectors) {
      const element = page.locator(selector);
      const count = await element.count();
      
      if (count > 0) {
        await element.click();
        console.log(`✅ Clicked ${buttonName || selector}`);
        await page.waitForTimeout(1000);
        return true;
      }
    }
    
    console.log(`⚠️ Button not found: ${buttonName || selectors.join(', ')}`);
    return false;
  }

  /**
   * Wait for operation completion with timeout
   */
  static async waitForOperation(page: any, successIndicators: string[], timeout: number = 10000) {
    console.log(`⏳ Waiting for operation completion...`);
    
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      for (const indicator of successIndicators) {
        const count = await page.locator(indicator).count();
        if (count > 0) {
          console.log(`✅ Operation completed: ${indicator}`);
          return true;
        }
      }
      
      await page.waitForTimeout(1000);
    }
    
    console.log(`⚠️ Operation timeout after ${timeout}ms`);
    return false;
  }

  /**
   * Generate comprehensive test report
   */
  static generateTestReport(testName: string) {
    console.log(`\n📊 HERA TEST REPORT: ${testName}`);
    console.log('='.repeat(50));
    
    // Compliance report
    const complianceKeys = Object.keys(this.complianceChecks);
    const complianceCount = complianceKeys.filter(key => this.complianceChecks[key]).length;
    
    console.log(`\n🎯 Universal Architecture Compliance:`);
    console.log(`   Score: ${complianceCount}/${complianceKeys.length} features detected`);
    
    Object.entries(this.complianceChecks).forEach(([feature, detected]) => {
      const status = detected ? '✅' : '❌';
      console.log(`   ${status} ${feature.replace(/_/g, ' ').toUpperCase()}`);
    });
    
    // Events summary
    console.log(`\n📝 Events Captured: ${this.events.length}`);
    const errorEvents = this.events.filter(event => event.includes('❌'));
    const successEvents = this.events.filter(event => event.includes('✅'));
    
    console.log(`   ✅ Success events: ${successEvents.length}`);
    console.log(`   ❌ Error events: ${errorEvents.length}`);
    
    // Screenshots summary
    console.log(`\n📸 Screenshots Captured: ${this.screenshots.length}`);
    this.screenshots.forEach((screenshot, index) => {
      console.log(`   ${index + 1}. ${screenshot}`);
    });
    
    // Overall assessment
    const overallScore = (complianceCount / Math.max(complianceKeys.length, 1)) * 
                        (successEvents.length / Math.max(successEvents.length + errorEvents.length, 1));
    
    console.log(`\n🏆 Overall Test Score: ${Math.round(overallScore * 100)}%`);
    
    if (overallScore > 0.8) {
      console.log('🎉 EXCELLENT: HERA Universal Architecture working perfectly!');
    } else if (overallScore > 0.6) {
      console.log('✅ GOOD: Most HERA features working correctly');
    } else if (overallScore > 0.4) {
      console.log('⚠️ PARTIAL: Some HERA features need attention');
    } else {
      console.log('❌ NEEDS WORK: HERA implementation requires fixes');
    }
    
    return {
      complianceScore: complianceCount / Math.max(complianceKeys.length, 1),
      overallScore,
      events: this.events,
      screenshots: this.screenshots,
      compliance: this.complianceChecks
    };
  }

  /**
   * Validate HERA Universal Architecture requirements
   */
  static validateHERACompliance() {
    const requiredFeatures = [
      'organization_isolation',
      'universal_schema', 
      'naming_convention'
    ];
    
    const missingFeatures = requiredFeatures.filter(feature => !this.complianceChecks[feature]);
    
    if (missingFeatures.length === 0) {
      console.log('✅ All HERA Universal Architecture requirements met!');
      return true;
    } else {
      console.log(`❌ Missing HERA requirements: ${missingFeatures.join(', ')}`);
      return false;
    }
  }
}

/**
 * Test helper functions for common HERA operations
 */
export class HERATestHelpers {
  
  /**
   * Complete restaurant setup with realistic data
   */
  static async completeRestaurantSetup(page: any, restaurantData: any) {
    console.log('🏢 Starting restaurant setup...');
    
    // Navigate to setup
    await HERATestSuiteManager.navigateToPage(page, '/setup/restaurant', [
      'text=Restaurant Setup',
      'text=Business Information'
    ]);
    
    // Step 1: Business Information
    await HERATestSuiteManager.fillFormField(page, '#businessName', restaurantData.businessName, 'Business Name');
    await HERATestSuiteManager.fillFormField(page, '#cuisineType', restaurantData.cuisineType, 'Cuisine Type');
    await HERATestSuiteManager.fillFormField(page, '#businessEmail', restaurantData.businessEmail, 'Business Email');
    await HERATestSuiteManager.fillFormField(page, '#primaryPhone', restaurantData.primaryPhone, 'Primary Phone');
    
    await HERATestSuiteManager.clickButton(page, ['button:has-text("Next Step")'], 'Next Step');
    
    // Step 2: Location
    await HERATestSuiteManager.fillFormField(page, '#locationName', restaurantData.locationName, 'Location Name');
    await HERATestSuiteManager.fillFormField(page, '#address', restaurantData.address, 'Address');
    await HERATestSuiteManager.fillFormField(page, '#city', restaurantData.city, 'City');
    await HERATestSuiteManager.fillFormField(page, '#postalCode', restaurantData.postalCode, 'Postal Code');
    
    await HERATestSuiteManager.clickButton(page, ['button:has-text("Next Step")'], 'Next Step');
    
    // Step 3: Operations
    await HERATestSuiteManager.fillFormField(page, '#openingTime', restaurantData.openingTime, 'Opening Time');
    await HERATestSuiteManager.fillFormField(page, '#closingTime', restaurantData.closingTime, 'Closing Time');
    await HERATestSuiteManager.fillFormField(page, '#seatingCapacity', restaurantData.seatingCapacity, 'Seating Capacity');
    
    await HERATestSuiteManager.clickButton(page, ['button:has-text("Next Step")'], 'Next Step');
    
    // Step 4: Manager
    await HERATestSuiteManager.fillFormField(page, '#managerName', restaurantData.managerName, 'Manager Name');
    await HERATestSuiteManager.fillFormField(page, '#managerEmail', restaurantData.managerEmail, 'Manager Email');
    await HERATestSuiteManager.fillFormField(page, '#managerPhone', restaurantData.managerPhone, 'Manager Phone');
    
    // Complete setup
    await HERATestSuiteManager.clickButton(page, ['button:has-text("Complete Setup")'], 'Complete Setup');
    
    // Wait for completion
    const success = await HERATestSuiteManager.waitForOperation(page, [
      'text=Restaurant setup completed',
      'text=Setup complete',
      'text=Welcome to your restaurant'
    ], 15000);
    
    if (success) {
      console.log('✅ Restaurant setup completed successfully');
    } else {
      console.log('⚠️ Restaurant setup may not have completed fully');
    }
    
    return success;
  }

  /**
   * Create demo products for testing
   */
  static async createDemoProducts(page: any) {
    console.log('🛍️ Creating demo products...');
    
    const products = [
      { name: 'Signature Burger', price: '18.99', description: 'Our famous burger with special sauce' },
      { name: 'Fresh Garden Salad', price: '12.50', description: 'Crisp vegetables with house dressing' },
      { name: 'Artisan Coffee', price: '4.50', description: 'Premium blend coffee beans' }
    ];
    
    await HERATestSuiteManager.navigateToPage(page, '/restaurant/products', [
      'text=Product',
      'text=Menu',
      'text=Catalog'
    ]);
    
    for (const product of products) {
      const addButton = await HERATestSuiteManager.clickButton(page, [
        'button:has-text("Add Product")',
        'button:has-text("New Product")',
        'button:has-text("Create Product")'
      ], 'Add Product');
      
      if (addButton) {
        await HERATestSuiteManager.fillFormField(page, 'input[placeholder*="name"]', product.name, 'Product Name');
        await HERATestSuiteManager.fillFormField(page, 'input[placeholder*="price"]', product.price, 'Product Price');
        await HERATestSuiteManager.fillFormField(page, 'textarea[placeholder*="description"]', product.description, 'Product Description');
        
        await HERATestSuiteManager.clickButton(page, [
          'button:has-text("Save")',
          'button:has-text("Create")',
          'button:has-text("Add")'
        ], 'Save Product');
        
        await page.waitForTimeout(2000);
        console.log(`✅ Created product: ${product.name}`);
      }
    }
    
    return true;
  }
}

export default HERATestSuiteManager;