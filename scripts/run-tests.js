import { createClient } from '@/lib/supabase/client';
#!/usr/bin/env node

/**
 * HERA Universal Testing Framework - Test Automation Script
 * Comprehensive test runner that executes all database tests
 * Following universal schema principles
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

// Configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const TEST_ORG_ID = '11111111-1111-1111-1111-111111111111';

class HERATestRunner {
  constructor() {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      throw new Error('Missing Supabase configuration. Please check your environment variables.');
    }
    
    this.supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    this.results = {
      total: 0,
      passed: 0,
      failed: 0,
      warnings: 0,
      startTime: new Date(),
      endTime: null,
      details: []
    };
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const colors = {
      info: chalk.blue,
      success: chalk.green,
      error: chalk.red,
      warning: chalk.yellow
    };
    
    console.log(`[${timestamp}] ${colors[type](message)}`);
  }

  async runTest(testFunction, testName, category = 'general') {
    try {
      this.log(`Running ${testName}...`, 'info');
      
      const startTime = process.hrtime();
      const result = await testFunction();
      const [seconds, nanoseconds] = process.hrtime(startTime);
      const executionTime = seconds * 1000 + nanoseconds / 1000000;
      
      if (Array.isArray(result)) {
        // Handle multiple test results
        for (const testResult of result) {
          this.results.total++;
          
          const testDetail = {
            testName: testResult.test_name || testName,
            status: testResult.test_status || testResult.status,
            message: testResult.test_message || testResult.message,
            category: category,
            executionTime: executionTime,
            violationCount: testResult.violation_count || 0
          };
          
          this.results.details.push(testDetail);
          
          if (testDetail.status === 'PASSED') {
            this.results.passed++;
            this.log(`✅ ${testDetail.testName} - ${testDetail.message}`, 'success');
          } else if (testDetail.status === 'WARNING') {
            this.results.warnings++;
            this.log(`⚠️  ${testDetail.testName} - ${testDetail.message}`, 'warning');
          } else {
            this.results.failed++;
            this.log(`❌ ${testDetail.testName} - ${testDetail.message}`, 'error');
          }
        }
      } else {
        // Handle single test result
        this.results.total++;
        
        const testDetail = {
          testName: testName,
          status: result ? 'PASSED' : 'FAILED',
          message: result ? 'Test completed successfully' : 'Test failed',
          category: category,
          executionTime: executionTime
        };
        
        this.results.details.push(testDetail);
        
        if (testDetail.status === 'PASSED') {
          this.results.passed++;
          this.log(`✅ ${testName} completed successfully`, 'success');
        } else {
          this.results.failed++;
          this.log(`❌ ${testName} failed`, 'error');
        }
      }
      
    } catch (error) {
      this.results.total++;
      this.results.failed++;
      
      const testDetail = {
        testName: testName,
        status: 'FAILED',
        message: error.message,
        category: category,
        executionTime: 0,
        error: error.stack
      };
      
      this.results.details.push(testDetail);
      this.log(`❌ ${testName} failed: ${error.message}`, 'error');
    }
  }

  async testSchemaStructure() {
    const { data, error } = await this.supabase.rpc('test_core_schema_structure');
    if (error) throw error;
    return data;
  }

  async testForeignKeyConstraints() {
    const { data, error } = await this.supabase.rpc('test_foreign_key_constraints');
    if (error) throw error;
    return data;
  }

  async testEntityLifecycle() {
    const { data, error } = await this.supabase.rpc('test_entity_lifecycle');
    if (error) throw error;
    return data;
  }

  async testQueryPerformance() {
    const { data, error } = await this.supabase.rpc('test_query_performance');
    if (error) throw error;
    return data.map(result => ({
      test_name: result.test_name,
      test_status: result.performance_status === 'GOOD' ? 'PASSED' : 
                   result.performance_status === 'ACCEPTABLE' ? 'WARNING' : 'FAILED',
      test_message: `${result.execution_time_ms}ms (${result.row_count} rows) - ${result.performance_status}`,
      execution_time_ms: result.execution_time_ms,
      row_count: result.row_count
    }));
  }

  async testDataIntegrity() {
    const { data, error } = await this.supabase.rpc('test_data_integrity');
    if (error) throw error;
    return data;
  }

  async testDatabaseConnectivity() {
    const { data, error } = await this.supabase
      .from('core_organizations')
      .select('count')
      .limit(1);
    
    if (error) throw error;
    return true;
  }

  async testUniversalSchemaCompliance() {
    // Test that all entities follow universal schema pattern
    const { data: entities, error } = await this.supabase
      .from('core_entities')
      .select('id, entity_type, entity_name, entity_code, organization_id')
      .eq('organization_id', TEST_ORG_ID)
      .limit(100);
    
    if (error) throw error;
    
    const results = [];
    
    // Check entity code format
    const invalidCodes = entities.filter(entity => 
      !entity.entity_code || entity.entity_code.length < 3
    );
    
    results.push({
      test_name: 'entity_code_format',
      test_status: invalidCodes.length === 0 ? 'PASSED' : 'FAILED',
      test_message: `Entity codes validation - ${invalidCodes.length} invalid codes found`,
      violation_count: invalidCodes.length
    });
    
    // Check entity name format
    const invalidNames = entities.filter(entity => 
      !entity.entity_name || entity.entity_name.length < 3
    );
    
    results.push({
      test_name: 'entity_name_format',
      test_status: invalidNames.length === 0 ? 'PASSED' : 'FAILED',
      test_message: `Entity names validation - ${invalidNames.length} invalid names found`,
      violation_count: invalidNames.length
    });
    
    return results;
  }

  async runAllTests() {
    this.log('🚀 Starting HERA Universal Testing Framework', 'info');
    this.log(`📊 Test Organization: ${TEST_ORG_ID}`, 'info');
    this.log('=' * 60, 'info');
    
    // Test categories to run
    const testCategories = [
      {
        name: 'Database Connectivity',
        tests: [
          { fn: () => this.testDatabaseConnectivity(), name: 'Database Connection Test' }
        ]
      },
      {
        name: 'Schema Structure',
        tests: [
          { fn: () => this.testSchemaStructure(), name: 'Core Schema Structure' }
        ]
      },
      {
        name: 'Data Constraints',
        tests: [
          { fn: () => this.testForeignKeyConstraints(), name: 'Foreign Key Constraints' }
        ]
      },
      {
        name: 'Business Logic',
        tests: [
          { fn: () => this.testEntityLifecycle(), name: 'Entity Lifecycle' }
        ]
      },
      {
        name: 'Performance',
        tests: [
          { fn: () => this.testQueryPerformance(), name: 'Query Performance' }
        ]
      },
      {
        name: 'Data Integrity',
        tests: [
          { fn: () => this.testDataIntegrity(), name: 'Data Integrity' }
        ]
      },
      {
        name: 'Universal Schema Compliance',
        tests: [
          { fn: () => this.testUniversalSchemaCompliance(), name: 'Universal Schema Compliance' }
        ]
      }
    ];
    
    // Run all test categories
    for (const category of testCategories) {
      this.log(`\n📋 Running ${category.name} Tests`, 'info');
      this.log('-' * 40, 'info');
      
      for (const test of category.tests) {
        await this.runTest(test.fn, test.name, category.name.toLowerCase().replace(/\s+/g, '_'));
      }
    }
    
    this.results.endTime = new Date();
    this.generateReport();
  }

  generateReport() {
    const duration = this.results.endTime - this.results.startTime;
    const successRate = this.results.total > 0 ? 
      ((this.results.passed / this.results.total) * 100).toFixed(1) : 0;
    
    this.log('\n' + '=' * 60, 'info');
    this.log('📊 TEST EXECUTION SUMMARY', 'info');
    this.log('=' * 60, 'info');
    
    this.log(`⏱️  Total Execution Time: ${duration}ms`, 'info');
    this.log(`📈 Success Rate: ${successRate}%`, 'info');
    this.log(`✅ Passed: ${this.results.passed}`, 'success');
    this.log(`❌ Failed: ${this.results.failed}`, 'error');
    this.log(`⚠️  Warnings: ${this.results.warnings}`, 'warning');
    this.log(`📊 Total Tests: ${this.results.total}`, 'info');
    
    // Category breakdown
    const categoryStats = this.results.details.reduce((acc, test) => {
      const category = test.category;
      if (!acc[category]) {
        acc[category] = { passed: 0, failed: 0, warnings: 0, total: 0 };
      }
      acc[category].total++;
      if (test.status === 'PASSED') acc[category].passed++;
      else if (test.status === 'WARNING') acc[category].warnings++;
      else acc[category].failed++;
      return acc;
    }, {});
    
    this.log('\n📋 CATEGORY BREAKDOWN', 'info');
    this.log('-' * 40, 'info');
    
    for (const [category, stats] of Object.entries(categoryStats)) {
      const categorySuccessRate = ((stats.passed / stats.total) * 100).toFixed(1);
      this.log(`${category}: ${stats.passed}/${stats.total} (${categorySuccessRate}%)`, 'info');
    }
    
    // Failed tests detail
    if (this.results.failed > 0) {
      this.log('\n❌ FAILED TESTS DETAIL', 'error');
      this.log('-' * 40, 'error');
      
      const failedTests = this.results.details.filter(test => test.status === 'FAILED');
      for (const test of failedTests) {
        this.log(`• ${test.testName}: ${test.message}`, 'error');
        if (test.violationCount > 0) {
          this.log(`  Violations: ${test.violationCount}`, 'error');
        }
      }
    }
    
    // Generate JSON report
    const reportData = {
      summary: {
        total: this.results.total,
        passed: this.results.passed,
        failed: this.results.failed,
        warnings: this.results.warnings,
        successRate: parseFloat(successRate),
        duration: duration,
        startTime: this.results.startTime.toISOString(),
        endTime: this.results.endTime.toISOString()
      },
      categoryStats,
      testDetails: this.results.details
    };
    
    // Save report to file
    const reportPath = path.join(__dirname, '..', 'test-reports', `test-report-${Date.now()}.json`);
    const reportsDir = path.dirname(reportPath);
    
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }
    
    fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
    this.log(`\n📄 Test report saved to: ${reportPath}`, 'info');
    
    // Exit with appropriate code
    process.exit(this.results.failed > 0 ? 1 : 0);
  }
}

// Main execution
async function main() {
  try {
    const runner = new HERATestRunner();
    await runner.runAllTests();
  } catch (error) {
    console.error(chalk.red('❌ Test runner failed:'), error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = HERATestRunner;