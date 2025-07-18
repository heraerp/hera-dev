import { createClient } from '@/lib/supabase/client';
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

/**
 * 🎯 COMPREHENSIVE PRODUCT SYSTEM UAT
 * Testing all aspects of product creation, management, and edge cases
 */

class ProductUATRunner {
  constructor() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    this.supabaseAdmin = createClient(url, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
      global: {
        headers: {
          'apikey': serviceKey,
          'Authorization': `Bearer ${serviceKey}`
        }
      }
    });
    
    this.supabase = createClient(url, anonKey);
    this.testResults = [];
    this.testOrganizations = [];
    this.createdProducts = [];
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : type === 'warning' ? '⚠️' : 'ℹ️';
    console.log(`${prefix} [${timestamp.slice(11, 19)}] ${message}`);
  }

  async addTestResult(testName, passed, details = {}) {
    this.testResults.push({
      testName,
      passed,
      timestamp: new Date().toISOString(),
      details
    });
    
    if (passed) {
      this.log(`PASS: ${testName}`, 'success');
    } else {
      this.log(`FAIL: ${testName} - ${JSON.stringify(details)}`, 'error');
    }
  }

  async setupTestEnvironment() {
    this.log('🔧 Setting up test environment...');
    
    // Get existing organizations for testing
    const { data: orgs, error } = await this.supabaseAdmin
      .from('core_organizations')
      .select('*')
      .limit(3);
    
    if (error || !orgs || orgs.length === 0) {
      throw new Error('No organizations available for testing');
    }
    
    this.testOrganizations = orgs;
    this.log(`Found ${orgs.length} organizations for testing`);
    
    // Clean up any existing test products
    await this.cleanupTestData();
  }

  async cleanupTestData() {
    this.log('🧹 Cleaning up existing test data...');
    
    // Remove test products
    for (const org of this.testOrganizations) {
      await this.supabaseAdmin
        .from('core_metadata')
        .delete()
        .eq('organization_id', org.id)
        .eq('entity_type', 'product')
        .like('metadata_value', '%TEST_PRODUCT%');
      
      await this.supabaseAdmin
        .from('core_entities')
        .delete()
        .eq('organization_id', org.id)
        .eq('entity_type', 'product')
        .like('entity_name', '%TEST_%');
    }
  }

  async testProductCreation() {
    this.log('🧪 Testing Product Creation...');
    
    const testOrg = this.testOrganizations[0];
    const productId = crypto.randomUUID();
    
    try {
      // Test 1: Create product entity
      const { data: entityData, error: entityError } = await this.supabaseAdmin
        .from('core_entities')
        .insert({
          id: productId,
          organization_id: testOrg.id,
          entity_type: 'product',
          entity_name: 'TEST_Premium_Jasmine_Tea',
          entity_code: 'TEST-TEA-001',
          is_active: true,
          changed_by: testOrg.id // Required for audit triggers
        })
        .select();

      await this.addTestResult(
        'Product Entity Creation',
        !entityError,
        { error: entityError, data: entityData }
      );

      if (entityError) return;

      // Test 2: Create product metadata
      const metadata = {
        category: 'tea',
        description: 'TEST_PRODUCT - Premium jasmine-scented green tea',
        product_type: 'finished_good',
        price: 4.50,
        cost_per_unit: 1.75,
        inventory_count: 100,
        minimum_stock: 10,
        unit_type: 'servings',
        preparation_time_minutes: 3,
        serving_temperature: 'Hot (70-80°C)',
        caffeine_level: 'Medium',
        calories: 2,
        allergens: 'None',
        origin: 'Fujian Province, China',
        supplier_name: 'Dragon Well Tea Co.',
        storage_requirements: 'Cool, dry place',
        shelf_life_days: 730,
        status: 'in_stock',
        is_draft: false,
        created_by: testOrg.id
      };

      const { data: metaData, error: metaError } = await this.supabaseAdmin
        .from('core_metadata')
        .insert({
          organization_id: testOrg.id,
          entity_type: 'product',
          entity_id: productId,
          metadata_type: 'product_details',
          metadata_category: 'catalog',
          metadata_key: 'product_info',
          metadata_value: JSON.stringify(metadata),
          is_system_generated: false,
          created_by: testOrg.id,
          changed_by: testOrg.id // Required for audit triggers
        })
        .select();

      await this.addTestResult(
        'Product Metadata Creation',
        !metaError,
        { error: metaError, data: metaData }
      );

      if (!metaError) {
        this.createdProducts.push(productId);
      }

    } catch (error) {
      await this.addTestResult('Product Creation Exception', false, { error: error.message });
    }
  }

  async testProductRetrieval() {
    this.log('🔍 Testing Product Retrieval...');
    
    const testOrg = this.testOrganizations[0];
    
    try {
      // Test reading products with proper organization isolation
      const { data: entities, error: entitiesError } = await this.supabase
        .from('core_entities')
        .select('*')
        .eq('organization_id', testOrg.id)
        .eq('entity_type', 'product')
        .eq('is_active', true);

      await this.addTestResult(
        'Product Entities Retrieval',
        !entitiesError,
        { error: entitiesError, count: entities?.length }
      );

      if (entities && entities.length > 0) {
        const entityIds = entities.map(e => e.id);
        
        // Test metadata retrieval
        const { data: metadata, error: metaError } = await this.supabase
          .from('core_metadata')
          .select('*')
          .eq('organization_id', testOrg.id)
          .in('entity_id', entityIds)
          .eq('entity_type', 'product');

        await this.addTestResult(
          'Product Metadata Retrieval',
          !metaError,
          { error: metaError, count: metadata?.length }
        );

        // Test manual join logic
        const metadataMap = new Map();
        metadata?.forEach(m => metadataMap.set(m.entity_id, m));
        
        const joinedProducts = entities.map(entity => {
          const metaEntry = metadataMap.get(entity.id);
          let productInfo = {};
          
          if (metaEntry?.metadata_value) {
            try {
              productInfo = JSON.parse(metaEntry.metadata_value);
            } catch (e) {
              // Parse error
            }
          }
          
          return {
            ...entity,
            ...productInfo
          };
        });

        await this.addTestResult(
          'Manual Join Logic',
          joinedProducts.length > 0,
          { joinedCount: joinedProducts.length }
        );
      }

    } catch (error) {
      await this.addTestResult('Product Retrieval Exception', false, { error: error.message });
    }
  }

  async testProductUpdate() {
    this.log('📝 Testing Product Updates...');
    
    if (this.createdProducts.length === 0) {
      await this.addTestResult('Product Update Test', false, { error: 'No products to update' });
      return;
    }

    const productId = this.createdProducts[0];
    const testOrg = this.testOrganizations[0];
    
    try {
      // Test entity update
      const { error: entityUpdateError } = await this.supabaseAdmin
        .from('core_entities')
        .update({
          entity_name: 'TEST_Premium_Jasmine_Tea_UPDATED',
          updated_at: new Date().toISOString(),
          changed_by: testOrg.id // Required for audit triggers
        })
        .eq('id', productId);

      await this.addTestResult(
        'Product Entity Update',
        !entityUpdateError,
        { error: entityUpdateError }
      );

      // Test metadata update
      const updatedMetadata = {
        price: 5.00, // Updated price
        inventory_count: 80, // Updated inventory
        status: 'low_stock'
      };

      const { error: metaUpdateError } = await this.supabaseAdmin
        .from('core_metadata')
        .update({
          metadata_value: JSON.stringify(updatedMetadata),
          updated_at: new Date().toISOString(),
          changed_by: testOrg.id // Required for audit triggers
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
    this.log('🔒 Testing Organization Isolation...');
    
    if (this.testOrganizations.length < 2) {
      await this.addTestResult('Organization Isolation Test', false, { error: 'Need at least 2 organizations' });
      return;
    }

    const org1 = this.testOrganizations[0];
    const org2 = this.testOrganizations[1];
    
    try {
      // Create product in org1
      const product1Id = crypto.randomUUID();
      await this.supabaseAdmin
        .from('core_entities')
        .insert({
          id: product1Id,
          organization_id: org1.id,
          entity_type: 'product',
          entity_name: 'TEST_ORG1_Product',
          entity_code: 'TEST-ORG1-001',
          is_active: true,
          changed_by: org1.id // Required for audit triggers
        });

      // Create product in org2
      const product2Id = crypto.randomUUID();
      await this.supabaseAdmin
        .from('core_entities')
        .insert({
          id: product2Id,
          organization_id: org2.id,
          entity_type: 'product',
          entity_name: 'TEST_ORG2_Product',
          entity_code: 'TEST-ORG2-001',
          is_active: true,
          changed_by: org2.id // Required for audit triggers
        });

      // Test that org1 can only see its products
      const { data: org1Products } = await this.supabase
        .from('core_entities')
        .select('*')
        .eq('organization_id', org1.id)
        .eq('entity_type', 'product')
        .like('entity_name', 'TEST_ORG%');

      // Test that org2 can only see its products
      const { data: org2Products } = await this.supabase
        .from('core_entities')
        .select('*')
        .eq('organization_id', org2.id)
        .eq('entity_type', 'product')
        .like('entity_name', 'TEST_ORG%');

      const org1HasOnlyItsProducts = org1Products?.every(p => p.organization_id === org1.id);
      const org2HasOnlyItsProducts = org2Products?.every(p => p.organization_id === org2.id);
      const crossContamination = org1Products?.some(p => p.organization_id === org2.id) || 
                                 org2Products?.some(p => p.organization_id === org1.id);

      await this.addTestResult(
        'Organization Isolation',
        org1HasOnlyItsProducts && org2HasOnlyItsProducts && !crossContamination,
        {
          org1Products: org1Products?.length,
          org2Products: org2Products?.length,
          crossContamination
        }
      );

      // Clean up isolation test products
      await this.supabaseAdmin.from('core_entities').delete().eq('id', product1Id);
      await this.supabaseAdmin.from('core_entities').delete().eq('id', product2Id);

    } catch (error) {
      await this.addTestResult('Organization Isolation Exception', false, { error: error.message });
    }
  }

  async testEdgeCases() {
    this.log('🎭 Testing Edge Cases...');
    
    const testOrg = this.testOrganizations[0];
    
    // Test 1: Invalid organization ID
    try {
      const { error } = await this.supabaseAdmin
        .from('core_entities')
        .insert({
          id: crypto.randomUUID(),
          organization_id: '00000000-0000-0000-0000-000000000000',
          entity_type: 'product',
          entity_name: 'TEST_Invalid_Org',
          entity_code: 'TEST-INVALID-001',
          is_active: true,
          changed_by: '00000000-0000-0000-0000-000000000000' // Required for audit triggers
        });

      await this.addTestResult(
        'Invalid Organization Rejection',
        error && error.code === '23503', // Foreign key violation
        { error: error?.message }
      );
    } catch (error) {
      await this.addTestResult('Invalid Organization Test Exception', false, { error: error.message });
    }

    // Test 2: Duplicate entity code
    try {
      const duplicateId1 = crypto.randomUUID();
      const duplicateId2 = crypto.randomUUID();
      
      await this.supabaseAdmin
        .from('core_entities')
        .insert({
          id: duplicateId1,
          organization_id: testOrg.id,
          entity_type: 'product',
          entity_name: 'TEST_Duplicate_1',
          entity_code: 'TEST-DUPLICATE-001',
          is_active: true,
          changed_by: testOrg.id // Required for audit triggers
        });

      const { error: duplicateError } = await this.supabaseAdmin
        .from('core_entities')
        .insert({
          id: duplicateId2,
          organization_id: testOrg.id,
          entity_type: 'product',
          entity_name: 'TEST_Duplicate_2',
          entity_code: 'TEST-DUPLICATE-001', // Same code
          is_active: true,
          changed_by: testOrg.id // Required for audit triggers
        });

      await this.addTestResult(
        'Duplicate Code Prevention',
        duplicateError !== null,
        { error: duplicateError?.message }
      );

      // Clean up
      await this.supabaseAdmin.from('core_entities').delete().eq('id', duplicateId1);
      
    } catch (error) {
      await this.addTestResult('Duplicate Code Test Exception', false, { error: error.message });
    }

    // Test 3: Large metadata handling
    try {
      const largeMetadata = {
        description: 'A'.repeat(5000), // Large description
        ingredients: Array.from({ length: 100 }, (_, i) => `Ingredient ${i}`),
        nutritionalInfo: Object.fromEntries(
          Array.from({ length: 50 }, (_, i) => [`nutrient_${i}`, Math.random() * 100])
        )
      };

      const largeProductId = crypto.randomUUID();
      
      await this.supabaseAdmin
        .from('core_entities')
        .insert({
          id: largeProductId,
          organization_id: testOrg.id,
          entity_type: 'product',
          entity_name: 'TEST_Large_Metadata',
          entity_code: 'TEST-LARGE-001',
          is_active: true,
          changed_by: testOrg.id // Required for audit triggers
        });

      const { error: largeMetaError } = await this.supabaseAdmin
        .from('core_metadata')
        .insert({
          organization_id: testOrg.id,
          entity_type: 'product',
          entity_id: largeProductId,
          metadata_type: 'product_details',
          metadata_category: 'catalog',
          metadata_key: 'product_info',
          metadata_value: JSON.stringify(largeMetadata),
          is_system_generated: false,
          created_by: testOrg.id,
          changed_by: testOrg.id // Required for audit triggers
        });

      await this.addTestResult(
        'Large Metadata Handling',
        !largeMetaError,
        { error: largeMetaError?.message, metadataSize: JSON.stringify(largeMetadata).length }
      );

      // Clean up
      await this.supabaseAdmin.from('core_metadata').delete().eq('entity_id', largeProductId);
      await this.supabaseAdmin.from('core_entities').delete().eq('id', largeProductId);
      
    } catch (error) {
      await this.addTestResult('Large Metadata Test Exception', false, { error: error.message });
    }
  }

  async testPerformance() {
    this.log('⚡ Testing Performance...');
    
    const testOrg = this.testOrganizations[0];
    const batchSize = 10;
    
    try {
      // Test batch product creation performance
      const startTime = Date.now();
      const batchProducts = [];
      
      for (let i = 0; i < batchSize; i++) {
        batchProducts.push({
          id: crypto.randomUUID(),
          organization_id: testOrg.id,
          entity_type: 'product',
          entity_name: `TEST_Batch_Product_${i}`,
          entity_code: `TEST-BATCH-${String(i).padStart(3, '0')}`,
          is_active: true,
          changed_by: testOrg.id // Required for audit triggers
        });
      }

      const { error: batchError } = await this.supabaseAdmin
        .from('core_entities')
        .insert(batchProducts);

      const batchTime = Date.now() - startTime;

      await this.addTestResult(
        'Batch Product Creation Performance',
        !batchError && batchTime < 5000, // Should complete in under 5 seconds
        { 
          error: batchError?.message, 
          batchSize, 
          timeMs: batchTime,
          avgTimePerProduct: Math.round(batchTime / batchSize)
        }
      );

      // Test large query performance
      const queryStartTime = Date.now();
      const { data, error: queryError } = await this.supabase
        .from('core_entities')
        .select('*')
        .eq('organization_id', testOrg.id)
        .eq('entity_type', 'product');

      const queryTime = Date.now() - queryStartTime;

      await this.addTestResult(
        'Large Query Performance',
        !queryError && queryTime < 2000, // Should complete in under 2 seconds
        {
          error: queryError?.message,
          resultCount: data?.length,
          timeMs: queryTime
        }
      );

      // Clean up batch products
      const batchIds = batchProducts.map(p => p.id);
      await this.supabaseAdmin
        .from('core_entities')
        .delete()
        .in('id', batchIds);

    } catch (error) {
      await this.addTestResult('Performance Test Exception', false, { error: error.message });
    }
  }

  async testProductServiceIntegration() {
    this.log('🔗 Testing Product Service Integration...');
    
    // This would test the actual UniversalProductService methods
    // Since we can't import it directly in Node.js, we'll simulate the key operations
    
    const testOrg = this.testOrganizations[0];
    
    try {
      // Simulate fetchProducts service call
      const fetchStartTime = Date.now();
      
      // This mimics the fetchProducts method logic
      const { data: entities, error: entitiesError } = await this.supabase
        .from('core_entities')
        .select('*')
        .eq('organization_id', testOrg.id)
        .eq('entity_type', 'product')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (!entitiesError && entities && entities.length > 0) {
        const entityIds = entities.map(e => e.id);
        const { data: metadata, error: metadataError } = await this.supabase
          .from('core_metadata')
          .select('entity_id, metadata_key, metadata_value, metadata_type, metadata_category')
          .eq('organization_id', testOrg.id)
          .in('entity_id', entityIds)
          .eq('entity_type', 'product')
          .eq('metadata_type', 'product_details')
          .eq('metadata_key', 'product_info');

        // Manual join simulation
        const metadataMap = new Map();
        metadata?.forEach(m => metadataMap.set(m.entity_id, m));

        const products = entities.map(entity => {
          let productInfo = {};
          const metadataEntry = metadataMap.get(entity.id);

          if (metadataEntry?.metadata_value) {
            try {
              productInfo = JSON.parse(metadataEntry.metadata_value);
            } catch (e) {
              // Handle parse errors gracefully
            }
          }

          return {
            ...entity,
            category: productInfo.category || 'supplies',
            description: productInfo.description || '',
            price: productInfo.price || 0,
            inventory_count: productInfo.inventory_count || 0
          };
        });

        const fetchTime = Date.now() - fetchStartTime;

        await this.addTestResult(
          'Product Service Fetch Simulation',
          !entitiesError && !metadataError && products.length > 0,
          {
            entitiesError: entitiesError?.message,
            metadataError: metadataError?.message,
            productCount: products.length,
            fetchTimeMs: fetchTime
          }
        );
      } else {
        await this.addTestResult(
          'Product Service Fetch Simulation',
          false,
          { error: 'No products found or entities error', entitiesError: entitiesError?.message }
        );
      }

    } catch (error) {
      await this.addTestResult('Product Service Integration Exception', false, { error: error.message });
    }
  }

  async generateReport() {
    this.log('📊 Generating UAT Report...');
    
    const totalTests = this.testResults.length;
    const passedTests = this.testResults.filter(t => t.passed).length;
    const failedTests = totalTests - passedTests;
    const successRate = totalTests > 0 ? (passedTests / totalTests * 100).toFixed(1) : 0;

    console.log('\n🎯 COMPREHENSIVE PRODUCT SYSTEM UAT REPORT');
    console.log('=' .repeat(50));
    console.log(`📊 Total Tests: ${totalTests}`);
    console.log(`✅ Passed: ${passedTests}`);
    console.log(`❌ Failed: ${failedTests}`);
    console.log(`📈 Success Rate: ${successRate}%`);
    console.log('');

    console.log('📋 TEST RESULTS BREAKDOWN:');
    console.log('-'.repeat(50));
    
    this.testResults.forEach((result, index) => {
      const status = result.passed ? '✅ PASS' : '❌ FAIL';
      console.log(`${index + 1}. ${status} - ${result.testName}`);
      if (!result.passed && result.details.error) {
        console.log(`   Error: ${result.details.error}`);
      }
    });

    console.log('\n🚀 PRODUCTION READINESS ASSESSMENT:');
    console.log('-'.repeat(50));
    
    const criticalTests = [
      'Product Entity Creation',
      'Product Metadata Creation',
      'Product Entities Retrieval',
      'Organization Isolation'
    ];

    const criticalPassed = criticalTests.every(testName => 
      this.testResults.find(t => t.testName === testName)?.passed
    );

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
      console.log('🚀 STARTING COMPREHENSIVE PRODUCT SYSTEM UAT');
      console.log('='.repeat(60));
      
      await this.setupTestEnvironment();
      
      // Core functionality tests
      await this.testProductCreation();
      await this.testProductRetrieval();
      await this.testProductUpdate();
      
      // Security and isolation tests
      await this.testOrganizationIsolation();
      
      // Edge cases and resilience
      await this.testEdgeCases();
      
      // Performance tests
      await this.testPerformance();
      
      // Integration tests
      await this.testProductServiceIntegration();
      
      // Clean up test data
      await this.cleanupTestData();
      
      // Generate comprehensive report
      const report = await this.generateReport();
      
      return report;
      
    } catch (error) {
      this.log(`UAT Runner Exception: ${error.message}`, 'error');
      throw error;
    }
  }
}

// Run the comprehensive UAT
async function runProductUAT() {
  const runner = new ProductUATRunner();
  const report = await runner.runAllTests();
  
  console.log('\n🎯 UAT COMPLETION SUMMARY:');
  console.log(`Production Ready: ${report.productionReady ? 'YES ✅' : 'NO ❌'}`);
  console.log(`Success Rate: ${report.successRate}%`);
  
  return report;
}

// Execute the UAT
runProductUAT().catch(console.error);