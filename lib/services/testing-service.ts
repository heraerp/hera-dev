/**
 * HERA Universal Testing Framework - TypeScript Service Layer
 * Provides complete testing functionality following universal schema principles
 */

import { supabase } from '@/lib/supabase/client';
import { 
  TestSuite, 
  TestCase, 
  TestExecution, 
  TestResult, 
  UATSession,
  TestAnalytics,
  TestExecutionReport
} from '@/types/testing';

export class HERATestingService {
  private static instance: HERATestingService;
  private organizationId: string;

  constructor(organizationId: string = '11111111-1111-1111-1111-111111111111') {
    this.organizationId = organizationId;
  }

  public static getInstance(organizationId?: string): HERATestingService {
    if (!HERATestingService.instance) {
      HERATestingService.instance = new HERATestingService(organizationId);
    }
    return HERATestingService.instance;
  }

  // ============================================================================
  // Test Suite Management
  // ============================================================================

  /**
   * Create a new test suite
   */
  async createTestSuite(
    suiteName: string,
    suiteType: string,
    config: Record<string, any> = {}
  ): Promise<TestSuite> {
    const { data, error } = await supabase.rpc('create_test_suite', {
      p_organization_id: this.organizationId,
      p_suite_name: suiteName,
      p_suite_type: suiteType,
      p_suite_config: config
    });

    if (error) {
      throw new Error(`Failed to create test suite: ${error.message}`);
    }

    return await this.getTestSuite(data);
  }

  /**
   * Get test suite by ID
   */
  async getTestSuite(suiteId: string): Promise<TestSuite> {
    const { data: entity, error: entityError } = await supabase
      .from('core_entities')
      .select('*')
      .eq('id', suiteId)
      .eq('entity_type', 'test_suite')
      .single();

    if (entityError) {
      throw new Error(`Failed to get test suite: ${entityError.message}`);
    }

    // Get dynamic data
    const { data: dynamicData, error: dynamicError } = await supabase
      .from('core_dynamic_data')
      .select('*')
      .eq('entity_id', suiteId);

    if (dynamicError) {
      throw new Error(`Failed to get suite dynamic data: ${dynamicError.message}`);
    }

    // Convert dynamic data to object
    const fields = dynamicData.reduce((acc, field) => {
      acc[field.field_name] = field.field_value;
      return acc;
    }, {} as Record<string, any>);

    return {
      id: entity.id,
      name: entity.entity_name,
      code: entity.entity_code,
      type: fields.suite_type || 'unknown',
      status: fields.suite_status || 'active',
      configuration: fields.configuration ? JSON.parse(fields.configuration) : {},
      createdAt: entity.created_at,
      updatedAt: entity.updated_at
    };
  }

  /**
   * List all test suites
   */
  async listTestSuites(): Promise<TestSuite[]> {
    const { data: entities, error } = await supabase
      .from('core_entities')
      .select('*')
      .eq('entity_type', 'test_suite')
      .eq('organization_id', this.organizationId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to list test suites: ${error.message}`);
    }

    const suites: TestSuite[] = [];
    for (const entity of entities) {
      suites.push(await this.getTestSuite(entity.id));
    }

    return suites;
  }

  // ============================================================================
  // Test Case Management
  // ============================================================================

  /**
   * Create a new test case
   */
  async createTestCase(
    suiteId: string,
    testName: string,
    testType: string,
    config: Record<string, any> = {}
  ): Promise<TestCase> {
    const { data, error } = await supabase.rpc('create_test_case', {
      p_organization_id: this.organizationId,
      p_suite_id: suiteId,
      p_test_name: testName,
      p_test_type: testType,
      p_test_config: config
    });

    if (error) {
      throw new Error(`Failed to create test case: ${error.message}`);
    }

    return await this.getTestCase(data);
  }

  /**
   * Get test case by ID
   */
  async getTestCase(testId: string): Promise<TestCase> {
    const { data: entity, error: entityError } = await supabase
      .from('core_entities')
      .select('*')
      .eq('id', testId)
      .eq('entity_type', 'test_case')
      .single();

    if (entityError) {
      throw new Error(`Failed to get test case: ${entityError.message}`);
    }

    // Get dynamic data
    const { data: dynamicData, error: dynamicError } = await supabase
      .from('core_dynamic_data')
      .select('*')
      .eq('entity_id', testId);

    if (dynamicError) {
      throw new Error(`Failed to get test case dynamic data: ${dynamicError.message}`);
    }

    // Convert dynamic data to object
    const fields = dynamicData.reduce((acc, field) => {
      acc[field.field_name] = field.field_value;
      return acc;
    }, {} as Record<string, any>);

    return {
      id: entity.id,
      suiteId: entity.parent_entity_id || '',
      name: entity.entity_name,
      code: entity.entity_code,
      type: fields.test_type || 'unknown',
      status: fields.test_status || 'active',
      configuration: fields.configuration ? JSON.parse(fields.configuration) : {},
      createdAt: entity.created_at,
      updatedAt: entity.updated_at
    };
  }

  /**
   * List test cases for a suite
   */
  async listTestCases(suiteId: string): Promise<TestCase[]> {
    const { data: entities, error } = await supabase
      .from('core_entities')
      .select('*')
      .eq('entity_type', 'test_case')
      .eq('parent_entity_id', suiteId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to list test cases: ${error.message}`);
    }

    const testCases: TestCase[] = [];
    for (const entity of entities) {
      testCases.push(await this.getTestCase(entity.id));
    }

    return testCases;
  }

  // ============================================================================
  // Test Execution Management
  // ============================================================================

  /**
   * Create a new test execution
   */
  async createTestExecution(
    suiteId: string,
    executionType: string,
    executedBy: string
  ): Promise<TestExecution> {
    const { data, error } = await supabase.rpc('create_test_execution', {
      p_organization_id: this.organizationId,
      p_suite_id: suiteId,
      p_execution_type: executionType,
      p_executed_by: executedBy
    });

    if (error) {
      throw new Error(`Failed to create test execution: ${error.message}`);
    }

    return await this.getTestExecution(data);
  }

  /**
   * Get test execution by ID
   */
  async getTestExecution(executionId: string): Promise<TestExecution> {
    const { data: entity, error: entityError } = await supabase
      .from('core_entities')
      .select('*')
      .eq('id', executionId)
      .eq('entity_type', 'test_execution')
      .single();

    if (entityError) {
      throw new Error(`Failed to get test execution: ${entityError.message}`);
    }

    // Get dynamic data
    const { data: dynamicData, error: dynamicError } = await supabase
      .from('core_dynamic_data')
      .select('*')
      .eq('entity_id', executionId);

    if (dynamicError) {
      throw new Error(`Failed to get execution dynamic data: ${dynamicError.message}`);
    }

    // Convert dynamic data to object
    const fields = dynamicData.reduce((acc, field) => {
      acc[field.field_name] = field.field_value;
      return acc;
    }, {} as Record<string, any>);

    return {
      id: entity.id,
      suiteId: fields.suite_id || '',
      type: fields.execution_type || 'unknown',
      status: fields.execution_status || 'unknown',
      executedBy: fields.executed_by || '',
      startTime: fields.start_time ? new Date(fields.start_time) : entity.created_at,
      endTime: fields.end_time ? new Date(fields.end_time) : null,
      results: fields.test_results ? JSON.parse(fields.test_results) : null,
      createdAt: entity.created_at,
      updatedAt: entity.updated_at
    };
  }

  /**
   * Update test execution results
   */
  async updateTestExecutionResult(
    executionId: string,
    status: string,
    results: Record<string, any>
  ): Promise<void> {
    const { error } = await supabase.rpc('update_test_execution_result', {
      p_execution_id: executionId,
      p_status: status,
      p_results: results
    });

    if (error) {
      throw new Error(`Failed to update test execution result: ${error.message}`);
    }
  }

  /**
   * List test executions for a suite
   */
  async listTestExecutions(suiteId: string): Promise<TestExecution[]> {
    // Get executions through relationships
    const { data: relationships, error: relError } = await supabase
      .from('core_relationships')
      .select('to_entity_id')
      .eq('from_entity_id', suiteId)
      .eq('relationship_type', 'executed');

    if (relError) {
      throw new Error(`Failed to get test executions: ${relError.message}`);
    }

    const executions: TestExecution[] = [];
    for (const rel of relationships) {
      executions.push(await this.getTestExecution(rel.to_entity_id));
    }

    return executions.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  // ============================================================================
  // Database Testing Functions
  // ============================================================================

  /**
   * Run universal schema tests
   */
  async runUniversalSchemaTests(executedBy?: string): Promise<string> {
    const { data, error } = await supabase.rpc('run_universal_schema_tests', {
      p_organization_id: this.organizationId,
      p_executed_by: executedBy || null
    });

    if (error) {
      throw new Error(`Failed to run universal schema tests: ${error.message}`);
    }

    return data;
  }

  /**
   * Get test execution report
   */
  async getTestExecutionReport(executionId: string): Promise<TestExecutionReport> {
    const { data, error } = await supabase.rpc('get_test_execution_report', {
      p_execution_id: executionId
    });

    if (error) {
      throw new Error(`Failed to get test execution report: ${error.message}`);
    }

    if (!data || data.length === 0) {
      throw new Error('No test execution report found');
    }

    const report = data[0];
    return {
      executionId: report.execution_id,
      suiteName: report.suite_name,
      executionStatus: report.execution_status,
      totalTests: report.total_tests,
      passedTests: report.passed_tests,
      failedTests: report.failed_tests,
      executionTimeMs: report.execution_time_ms,
      testDetails: report.test_details
    };
  }

  /**
   * Test core schema structure
   */
  async testCoreSchemaStructure(): Promise<TestResult[]> {
    const { data, error } = await supabase.rpc('test_core_schema_structure');

    if (error) {
      throw new Error(`Failed to test core schema structure: ${error.message}`);
    }

    return data.map((result: any) => ({
      testName: result.test_name,
      status: result.test_status,
      message: result.test_message,
      category: 'schema_structure'
    }));
  }

  /**
   * Test foreign key constraints
   */
  async testForeignKeyConstraints(): Promise<TestResult[]> {
    const { data, error } = await supabase.rpc('test_foreign_key_constraints');

    if (error) {
      throw new Error(`Failed to test foreign key constraints: ${error.message}`);
    }

    return data.map((result: any) => ({
      testName: result.test_name,
      status: result.test_status,
      message: result.test_message,
      category: 'constraints'
    }));
  }

  /**
   * Test entity lifecycle
   */
  async testEntityLifecycle(): Promise<TestResult[]> {
    const { data, error } = await supabase.rpc('test_entity_lifecycle');

    if (error) {
      throw new Error(`Failed to test entity lifecycle: ${error.message}`);
    }

    return data.map((result: any) => ({
      testName: result.test_name,
      status: result.test_status,
      message: result.test_message,
      category: 'business_logic'
    }));
  }

  /**
   * Test query performance
   */
  async testQueryPerformance(): Promise<any[]> {
    const { data, error } = await supabase.rpc('test_query_performance');

    if (error) {
      throw new Error(`Failed to test query performance: ${error.message}`);
    }

    return data;
  }

  /**
   * Test data integrity
   */
  async testDataIntegrity(): Promise<TestResult[]> {
    const { data, error } = await supabase.rpc('test_data_integrity');

    if (error) {
      throw new Error(`Failed to test data integrity: ${error.message}`);
    }

    return data.map((result: any) => ({
      testName: result.test_name,
      status: result.test_status,
      message: result.test_message,
      category: 'data_integrity',
      violationCount: result.violation_count
    }));
  }

  // ============================================================================
  // UAT Session Management
  // ============================================================================

  /**
   * Create a new UAT session
   */
  async createUATSession(
    sessionName: string,
    testSuiteId: string,
    createdBy: string
  ): Promise<UATSession> {
    const { data, error } = await supabase.rpc('create_uat_session', {
      p_organization_id: this.organizationId,
      p_session_name: sessionName,
      p_test_suite_id: testSuiteId,
      p_created_by: createdBy
    });

    if (error) {
      throw new Error(`Failed to create UAT session: ${error.message}`);
    }

    return await this.getUATSession(data);
  }

  /**
   * Get UAT session by ID
   */
  async getUATSession(sessionId: string): Promise<UATSession> {
    const { data: entity, error: entityError } = await supabase
      .from('core_entities')
      .select('*')
      .eq('id', sessionId)
      .eq('entity_type', 'uat_session')
      .single();

    if (entityError) {
      throw new Error(`Failed to get UAT session: ${entityError.message}`);
    }

    // Get dynamic data
    const { data: dynamicData, error: dynamicError } = await supabase
      .from('core_dynamic_data')
      .select('*')
      .eq('entity_id', sessionId);

    if (dynamicError) {
      throw new Error(`Failed to get UAT session dynamic data: ${dynamicError.message}`);
    }

    // Convert dynamic data to object
    const fields = dynamicData.reduce((acc, field) => {
      acc[field.field_name] = field.field_value;
      return acc;
    }, {} as Record<string, any>);

    return {
      id: entity.id,
      name: entity.entity_name,
      code: entity.entity_code,
      testSuiteId: fields.test_suite_id || '',
      createdBy: fields.created_by || '',
      status: fields.session_status || 'active',
      startTime: fields.start_time ? new Date(fields.start_time) : entity.created_at,
      endTime: fields.end_time ? new Date(fields.end_time) : null,
      createdAt: entity.created_at,
      updatedAt: entity.updated_at
    };
  }

  // ============================================================================
  // Analytics and Reporting
  // ============================================================================

  /**
   * Get test analytics
   */
  async getTestAnalytics(
    dateFrom?: Date,
    dateTo?: Date
  ): Promise<TestAnalytics> {
    const { data, error } = await supabase.rpc('get_test_analytics', {
      p_organization_id: this.organizationId,
      p_date_from: dateFrom?.toISOString().split('T')[0] || null,
      p_date_to: dateTo?.toISOString().split('T')[0] || null
    });

    if (error) {
      throw new Error(`Failed to get test analytics: ${error.message}`);
    }

    if (!data || data.length === 0) {
      return {
        totalExecutions: 0,
        totalPassed: 0,
        totalFailed: 0,
        averageDuration: 0,
        successRate: 0
      };
    }

    const analytics = data[0];
    return {
      totalExecutions: analytics.total_executions || 0,
      totalPassed: analytics.total_passed || 0,
      totalFailed: analytics.total_failed || 0,
      averageDuration: analytics.average_duration || 0,
      successRate: analytics.success_rate || 0
    };
  }

  /**
   * Cleanup orphaned test data
   */
  async cleanupOrphanedTestData(daysOld: number = 7): Promise<any> {
    const { data, error } = await supabase.rpc('cleanup_orphaned_test_data', {
      p_days_old: daysOld
    });

    if (error) {
      throw new Error(`Failed to cleanup orphaned test data: ${error.message}`);
    }

    return data[0];
  }

  // ============================================================================
  // Validation Functions
  // ============================================================================

  /**
   * Check for entity duplicates
   */
  async checkEntityDuplicates(
    entityType: string,
    entityCode: string
  ) {
    const { data, error } = await supabase.rpc('check_entity_duplicates', {
      p_entity_type: entityType,
      p_entity_code: entityCode,
      p_organization_id: this.organizationId
    });

    if (error) {
      throw new Error(`Failed to check entity duplicates: ${error.message}`);
    }

    return data;
  }

  /**
   * Validate entity description
   */
  async validateEntityDescription(
    entityType: string,
    name: string,
    description?: string
  ): Promise<boolean> {
    const { data, error } = await supabase.rpc('validate_entity_description', {
      p_entity_type: entityType,
      p_entity_name: entityName,
      p_description: description || null
    });

    if (error) {
      throw new Error(`Failed to validate entity description: ${error.message}`);
    }

    return data;
  }

  /**
   * Validate dynamic data integrity
   */
  async validateDynamicDataIntegrity(
    entityId: string,
    fieldName: string,
    fieldValue: string,
    fieldType: string
  ): Promise<boolean> {
    const { data, error } = await supabase.rpc('validate_dynamic_data_integrity', {
      p_entity_id: entityId,
      p_field_name: fieldName,
      p_field_value: fieldValue,
      p_field_type: fieldType
    });

    if (error) {
      throw new Error(`Failed to validate dynamic data integrity: ${error.message}`);
    }

    return data;
  }
}

export default HERATestingService;