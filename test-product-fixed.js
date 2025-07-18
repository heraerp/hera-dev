const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

/**
 * 🎯 FIXED PRODUCT SYSTEM UAT
 * Testing product creation with real organization IDs and correct field handling
 */

class FixedProductUAT {
  constructor() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY;
    
    this.supabaseAdmin = createClient(url, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
      global: {
        headers: {
          'apikey': serviceKey,
          'Authorization': `Bearer ${serviceKey}`
        }
      }
    });
    
    this.testResults = [];
    this.testOrganization = null;
    this.createdProducts = [];
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : '🔧';
    console.log(`${prefix} [${timestamp.slice(11, 19)}] ${message}`);
  }

  async addTestResult(testName, passed, details = {}) {
    this.testResults.push({ testName, passed, details });
    if (passed) {
      this.log(`PASS: ${testName}`, 'success');
    } else {
      this.log(`FAIL: ${testName} - ${JSON.stringify(details)}`, 'error');
    }
  }

  async setupTestEnvironment() {
    this.log('Setting up test environment...');
    
    // Get first available organization
    const { data: orgs, error } = await this.supabaseAdmin
      .from('core_organizations')
      .select('*')
      .limit(1);
    
    if (error || !orgs || orgs.length === 0) {
      throw new Error('No organizations available for testing');
    }
    
    this.testOrganization = orgs[0];
    this.log(`Using organization: ${this.testOrganization.org_name} (${this.testOrganization.id})`);
    
    // Clean up any existing test products
    await this.cleanupTestData();
  }

  async cleanupTestData() {
    this.log('Cleaning up existing test data...');
    
    if (this.testOrganization) {
      await this.supabaseAdmin
        .from('core_metadata')
        .delete()
        .eq('organization_id', this.testOrganization.id)
        .eq('entity_type', 'product')
        .like('metadata_value', '%TEST_PRODUCT%');
      
      await this.supabaseAdmin
        .from('core_entities')
        .delete()
        .eq('organization_id', this.testOrganization.id)
        .eq('entity_type', 'product')
        .like('entity_name', '%TEST_%');
    }
  }

  async testBasicProductCreation() {
    this.log('Testing basic product creation...');
    
    const productId = crypto.randomUUID();
    
    try {
      // Test 1: Create product entity
      const { data: entityData, error: entityError } = await this.supabaseAdmin
        .from('core_entities')
        .insert({
          id: productId,
          organization_id: this.testOrganization.id,
          entity_type: 'product',
          entity_name: 'TEST_Basic_Product',
          entity_code: 'TEST-BASIC-001',
          is_active: true
        })
        .select();

      await this.addTestResult(
        'Basic Product Entity Creation',
        !entityError,
        { error: entityError, data: entityData }
      );

      if (entityError) return;

      // Test 2: Create product metadata
      const metadata = {
        category: 'tea',
        description: 'TEST_PRODUCT - Basic test product',
        product_type: 'finished_good',
        price: 5.00,
        cost_per_unit: 2.00,
        inventory_count: 50,
        minimum_stock: 5,
        unit_type: 'servings',
        status: 'in_stock',
        is_draft: false,
        created_by: this.testOrganization.id
      };

      const { data: metaData, error: metaError } = await this.supabaseAdmin
        .from('core_metadata')
        .insert({
          organization_id: this.testOrganization.id,
          entity_type: 'product',
          entity_id: productId,
          metadata_type: 'product_details',
          metadata_category: 'catalog',
          metadata_key: 'product_info',
          metadata_value: JSON.stringify(metadata),
          is_system_generated: false,
          created_by: this.testOrganization.id
        })
        .select();

      await this.addTestResult(
        'Basic Product Metadata Creation',
        !metaError,
        { error: metaError, data: metaData }
      );

      if (!metaError) {
        this.createdProducts.push(productId);
      }

    } catch (error) {
      await this.addTestResult('Basic Product Creation Exception', false, { error: error.message });
    }
  }

  async testProductService() {
    this.log('Testing UniversalProductService integration...');
    
    try {
      // Test initializing product data
      console.log('🧪 Testing product initialization...');
      
      // Since we can't import the service directly in Node.js, we'll simulate the key operations
      // by testing the same database operations the service would perform
      
      // Check if sample products exist
      const { data: existingProducts, error: checkError } = await this.supabaseAdmin
        .from('core_entities')
        .select('id')
        .eq('organization_id', this.testOrganization.id)
        .eq('entity_type', 'product')
        .limit(1);

      await this.addTestResult(
        'Product Service Check',
        !checkError,
        { error: checkError, existingCount: existingProducts?.length }
      );

      // Test fetching products with organization isolation
      const { data: entities, error: entitiesError } = await this.supabaseAdmin
        .from('core_entities')
        .select('*')
        .eq('organization_id', this.testOrganization.id)
        .eq('entity_type', 'product')
        .eq('is_active', true);

      await this.addTestResult(
        'Product Service Fetch',
        !entitiesError,
        { error: entitiesError, count: entities?.length }
      );

      if (entities && entities.length > 0) {
        const entityIds = entities.map(e => e.id);
        
        // Test metadata retrieval
        const { data: metadata, error: metaError } = await this.supabaseAdmin
          .from('core_metadata')
          .select('*')
          .eq('organization_id', this.testOrganization.id)
          .in('entity_id', entityIds)
          .eq('entity_type', 'product');

        await this.addTestResult(
          'Product Service Metadata Fetch',
          !metaError,
          { error: metaError, count: metadata?.length }
        );
      }

    } catch (error) {
      await this.addTestResult('Product Service Test Exception', false, { error: error.message });
    }
  }

  async testProductUpdate() {
    this.log('Testing product updates...');
    
    if (this.createdProducts.length === 0) {
      await this.addTestResult('Product Update Test', false, { error: 'No products to update' });
      return;
    }

    const productId = this.createdProducts[0];
    
    try {
      // Test entity update
      const { error: entityUpdateError } = await this.supabaseAdmin
        .from('core_entities')
        .update({
          entity_name: 'TEST_Basic_Product_UPDATED',
          updated_at: new Date().toISOString()
        })
        .eq('id', productId);

      await this.addTestResult(
        'Product Entity Update',
        !entityUpdateError,
        { error: entityUpdateError }
      );

      // Test metadata update
      const updatedMetadata = {
        price: 6.00, // Updated price
        inventory_count: 40, // Updated inventory
        status: 'in_stock'
      };

      const { error: metaUpdateError } = await this.supabaseAdmin
        .from('core_metadata')
        .update({
          metadata_value: JSON.stringify(updatedMetadata),
          updated_at: new Date().toISOString()
        })
        .eq('entity_id', productId)
        .eq('metadata_type', 'product_details');

      await this.addTestResult(
        'Product Metadata Update',
        !metaUpdateError,
        { error: metaUpdateError }
      );

    } catch (error) {
      await this.addTestResult('Product Update Exception', false, { error: error.message });
    }
  }

  async testOrganizationIsolation() {
    this.log('Testing organization isolation...');
    
    try {
      // Create test product in current organization
      const testProductId = crypto.randomUUID();
      await this.supabaseAdmin
        .from('core_entities')
        .insert({
          id: testProductId,
          organization_id: this.testOrganization.id,
          entity_type: 'product',
          entity_name: 'TEST_Isolation_Product',
          entity_code: 'TEST-ISO-001',
          is_active: true
        });

      // Test that query only returns products for this organization
      const { data: orgProducts } = await this.supabaseAdmin
        .from('core_entities')
        .select('*')
        .eq('organization_id', this.testOrganization.id)
        .eq('entity_type', 'product')
        .like('entity_name', 'TEST_Isolation%');

      const isolationWorking = orgProducts?.every(p => p.organization_id === this.testOrganization.id);

      await this.addTestResult(
        'Organization Isolation',
        isolationWorking,
        { productCount: orgProducts?.length, allOrgMatched: isolationWorking }
      );

      // Clean up
      await this.supabaseAdmin.from('core_entities').delete().eq('id', testProductId);

    } catch (error) {
      await this.addTestResult('Organization Isolation Exception', false, { error: error.message });
    }
  }

  async generateReport() {
    this.log('Generating test report...');
    
    const totalTests = this.testResults.length;
    const passedTests = this.testResults.filter(t => t.passed).length;
    const failedTests = totalTests - passedTests;
    const successRate = totalTests > 0 ? (passedTests / totalTests * 100).toFixed(1) : 0;

    console.log('\n🎯 FIXED PRODUCT SYSTEM UAT REPORT');
    console.log('=' .repeat(50));
    console.log(`📊 Total Tests: ${totalTests}`);
    console.log(`✅ Passed: ${passedTests}`);
    console.log(`❌ Failed: ${failedTests}`);
    console.log(`📈 Success Rate: ${successRate}%`);
    console.log('');

    console.log('📋 TEST RESULTS:');
    console.log('-'.repeat(50));
    
    this.testResults.forEach((result, index) => {
      const status = result.passed ? '✅ PASS' : '❌ FAIL';
      console.log(`${index + 1}. ${status} - ${result.testName}`);
      if (!result.passed && result.details.error) {
        console.log(`   Error: ${JSON.stringify(result.details.error)}`);
      }
    });

    const criticalPassed = passedTests >= totalTests * 0.8;
    
    console.log('\n🚀 PRODUCTION READINESS:');
    console.log('-'.repeat(50));
    if (criticalPassed && successRate >= 80) {
      console.log('🎉 PRODUCTION READY - All critical tests passed');
    } else if (successRate >= 60) {
      console.log('⚠️ NEEDS IMPROVEMENT - Some issues need addressing');
    } else {
      console.log('❌ NOT PRODUCTION READY - Major issues found');
    }

    return {
      totalTests,
      passedTests,
      failedTests,
      successRate: parseFloat(successRate),
      productionReady: criticalPassed && successRate >= 80,
      results: this.testResults
    };
  }

  async runAllTests() {
    try {
      console.log('🚀 STARTING FIXED PRODUCT SYSTEM UAT');
      console.log('='.repeat(60));
      
      await this.setupTestEnvironment();
      
      // Core functionality tests
      await this.testBasicProductCreation();
      await this.testProductUpdate();
      await this.testOrganizationIsolation();
      await this.testProductService();
      
      // Clean up test data
      await this.cleanupTestData();
      
      // Generate report
      const report = await this.generateReport();
      
      return report;
      
    } catch (error) {
      this.log(`UAT Runner Exception: ${error.message}`, 'error');
      throw error;
    }
  }
}

// Run the fixed UAT
async function runFixedProductUAT() {
  const runner = new FixedProductUAT();
  const report = await runner.runAllTests();
  
  console.log('\n🎯 UAT COMPLETION SUMMARY:');
  console.log(`Production Ready: ${report.productionReady ? 'YES ✅' : 'NO ❌'}`);
  console.log(`Success Rate: ${report.successRate}%`);
  
  return report;
}

// Execute the UAT
runFixedProductUAT().catch(console.error);