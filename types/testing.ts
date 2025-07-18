/**
 * HERA Universal Testing Framework - TypeScript Types
 * Complete type definitions for the testing system
 */

export interface TestSuite {
  id: string;
  name: string;
  code: string;
  type: string;
  status: 'active' | 'inactive' | 'archived';
  configuration: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface TestCase {
  id: string;
  suiteId: string;
  name: string;
  code: string;
  type: string;
  status: 'active' | 'inactive' | 'pending';
  configuration: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface TestExecution {
  id: string;
  suiteId: string;
  type: string;
  status: 'running' | 'passed' | 'failed' | 'cancelled';
  executedBy: string;
  startTime: Date;
  endTime: Date | null;
  results: TestExecutionResults | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface TestExecutionResults {
  passed: number;
  failed: number;
  total: number;
  duration: number;
  test_details: TestResult[];
}

export interface TestResult {
  testName: string;
  status: 'PASSED' | 'FAILED' | 'WARNING' | 'SKIPPED';
  message: string;
  category: string;
  violationCount?: number;
  executionTimeMs?: number;
  details?: Record<string, any>;
}

export interface TestExecutionReport {
  executionId: string;
  suiteName: string;
  executionStatus: string;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  executionTimeMs: number;
  testDetails: TestResult[];
}

export interface UATSession {
  id: string;
  name: string;
  code: string;
  testSuiteId: string;
  createdBy: string;
  status: 'active' | 'completed' | 'cancelled';
  startTime: Date;
  endTime: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface TestAnalytics {
  totalExecutions: number;
  totalPassed: number;
  totalFailed: number;
  averageDuration: number;
  successRate: number;
}

export interface PerformanceTestResult {
  testName: string;
  executionTimeMs: number;
  rowCount: number;
  performanceStatus: 'GOOD' | 'ACCEPTABLE' | 'SLOW';
}

export interface DataIntegrityTestResult {
  testName: string;
  testStatus: 'PASSED' | 'FAILED' | 'WARNING';
  testMessage: string;
  violationCount: number;
}

export interface SchemaTestResult {
  testName: string;
  testStatus: 'PASSED' | 'FAILED';
  testMessage: string;
}

export interface ConstraintTestResult {
  testName: string;
  testStatus: 'PASSED' | 'FAILED';
  testMessage: string;
}

export interface BusinessLogicTestResult {
  testName: string;
  testStatus: 'PASSED' | 'FAILED';
  testMessage: string;
}

// Test Configuration Types
export interface TestSuiteConfig {
  testCategories?: string[];
  autoCleanup?: boolean;
  autoRun?: boolean;
  frequency?: 'daily' | 'weekly' | 'monthly';
  notifications?: {
    email?: string[];
    webhook?: string;
  };
  retryConfig?: {
    maxRetries: number;
    retryDelay: number;
  };
}

export interface TestCaseConfig {
  timeout?: number;
  retries?: number;
  preconditions?: string[];
  postconditions?: string[];
  testData?: Record<string, any>;
  environment?: 'development' | 'staging' | 'production';
  tags?: string[];
}

export interface TestExecutionConfig {
  parallel?: boolean;
  maxConcurrency?: number;
  failFast?: boolean;
  generateReport?: boolean;
  cleanup?: boolean;
}

// Entity Types for Testing Framework
export const TEST_ENTITY_TYPES = {
  TEST_SUITE: 'test_suite',
  TEST_CASE: 'test_case',
  TEST_EXECUTION: 'test_execution',
  UAT_SESSION: 'uat_session',
  TEST_RESULT: 'test_result',
  TEST_ARTIFACT: 'test_artifact',
  TEST_ENVIRONMENT: 'test_environment',
  TEST_DATA: 'test_data'
} as const;

// Test Categories
export const TEST_CATEGORIES = {
  SCHEMA_STRUCTURE: 'schema_structure',
  CONSTRAINTS: 'constraints',
  BUSINESS_LOGIC: 'business_logic',
  PERFORMANCE: 'performance',
  DATA_INTEGRITY: 'data_integrity',
  SECURITY: 'security',
  API: 'api',
  UI: 'ui',
  INTEGRATION: 'integration',
  REGRESSION: 'regression'
} as const;

// Test Types
export const TEST_TYPES = {
  UNIT: 'unit',
  INTEGRATION: 'integration',
  SYSTEM: 'system',
  ACCEPTANCE: 'acceptance',
  PERFORMANCE: 'performance',
  SECURITY: 'security',
  REGRESSION: 'regression',
  SMOKE: 'smoke',
  SANITY: 'sanity',
  DATABASE: 'database'
} as const;

// Test Statuses
export const TEST_STATUSES = {
  PENDING: 'pending',
  RUNNING: 'running',
  PASSED: 'passed',
  FAILED: 'failed',
  SKIPPED: 'skipped',
  CANCELLED: 'cancelled',
  WARNING: 'warning'
} as const;

// Test Priorities
export const TEST_PRIORITIES = {
  CRITICAL: 'critical',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low'
} as const;

// Test Environments
export const TEST_ENVIRONMENTS = {
  DEVELOPMENT: 'development',
  STAGING: 'staging',
  PRODUCTION: 'production',
  LOCAL: 'local'
} as const;

// Universal Schema Testing Metadata Types
export const TESTING_METADATA_TYPES = {
  TEST_CONFIGURATION: 'test_configuration',
  TEST_RESULTS: 'test_results',
  TEST_COVERAGE: 'test_coverage',
  TEST_METRICS: 'test_metrics',
  TEST_ARTIFACTS: 'test_artifacts',
  TEST_REPORTS: 'test_reports',
  TEST_SCHEDULES: 'test_schedules',
  TEST_DEPENDENCIES: 'test_dependencies'
} as const;

// Test Execution Context
export interface TestExecutionContext {
  organizationId: string;
  userId: string;
  environment: string;
  startTime: Date;
  configuration: TestExecutionConfig;
  metadata: Record<string, any>;
}

// Test Validation Rules
export interface TestValidationRule {
  name: string;
  description: string;
  rule: (data: any) => boolean;
  errorMessage: string;
  category: string;
}

// Test Metrics
export interface TestMetrics {
  totalTests: number;
  passedTests: number;
  failedTests: number;
  skippedTests: number;
  executionTime: number;
  successRate: number;
  failureRate: number;
  coverage: number;
  performance: {
    averageExecutionTime: number;
    slowestTest: string;
    fastestTest: string;
  };
}

// Test Dashboard Data
export interface TestDashboardData {
  summary: TestMetrics;
  recentExecutions: TestExecution[];
  analytics: TestAnalytics;
  alerts: TestAlert[];
  trends: TestTrend[];
}

export interface TestAlert {
  id: string;
  type: 'error' | 'warning' | 'info';
  message: string;
  testId?: string;
  executionId?: string;
  timestamp: Date;
}

export interface TestTrend {
  date: Date;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  successRate: number;
  averageExecutionTime: number;
}

// Test Automation Types
export interface TestAutomation {
  id: string;
  name: string;
  schedule: string; // Cron expression
  testSuiteId: string;
  enabled: boolean;
  lastRun?: Date;
  nextRun?: Date;
  configuration: Record<string, any>;
}

// Test Reporting Types
export interface TestReport {
  id: string;
  executionId: string;
  reportType: 'summary' | 'detailed' | 'coverage' | 'performance';
  format: 'html' | 'pdf' | 'json' | 'xml';
  content: string;
  generatedAt: Date;
  generatedBy: string;
}

// Test Data Management
export interface TestDataSet {
  id: string;
  name: string;
  description: string;
  data: Record<string, any>;
  testSuiteId: string;
  version: string;
  createdAt: Date;
  updatedAt: Date;
}

// Test Environment Configuration
export interface TestEnvironmentConfig {
  id: string;
  name: string;
  type: string;
  configuration: {
    database: {
      host: string;
      port: number;
      database: string;
      username: string;
      password: string;
    };
    api: {
      baseUrl: string;
      timeout: number;
      retries: number;
    };
    ui: {
      baseUrl: string;
      browser: string;
      headless: boolean;
    };
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type TestEntityType = keyof typeof TEST_ENTITY_TYPES;
export type TestCategory = keyof typeof TEST_CATEGORIES;
export type TestType = keyof typeof TEST_TYPES;
export type TestStatus = keyof typeof TEST_STATUSES;
export type TestPriority = keyof typeof TEST_PRIORITIES;
export type TestEnvironment = keyof typeof TEST_ENVIRONMENTS;
export type TestingMetadataType = keyof typeof TESTING_METADATA_TYPES;