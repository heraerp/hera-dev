export interface ChartOfAccountsEntry {
  id: string
  accountCode: string
  accountName: string
  accountType: AccountType
  parentAccountId?: string
  description?: string
  isActive: boolean
  balance: number
  currency: string
  
  // Classification
  classification: AccountClassification
  subClassification?: string
  reportingCategory: ReportingCategory
  
  // Metadata
  createdAt: Date
  updatedAt: Date
  createdBy: string
  lastModifiedBy: string
  
  // AI Intelligence
  aiSuggestions?: AIAccountSuggestion[]
  riskLevel: RiskLevel
  complianceFlags: ComplianceFlag[]
  
  // Hierarchy
  level: number
  pathToRoot: string[]
  children?: ChartOfAccountsEntry[]
  
  // Analytics
  monthlyActivity: MonthlyActivityData[]
  yearToDateBalance: number
  budgetVariance?: number
  forecastData?: ForecastData
  
  // Workflow
  approvalStatus: ApprovalStatus
  workflowStage?: WorkflowStage
  pendingChanges?: PendingChange[]
  
  // Integration
  externalSystemMappings: ExternalMapping[]
  taxMappings: TaxMapping[]
  auditTrail: AuditEntry[]
}

export type AccountType = 
  | 'ASSET' 
  | 'LIABILITY' 
  | 'EQUITY' 
  | 'REVENUE' 
  | 'EXPENSE'

export type AccountClassification =
  | 'CURRENT_ASSET'
  | 'NON_CURRENT_ASSET'
  | 'CURRENT_LIABILITY' 
  | 'NON_CURRENT_LIABILITY'
  | 'OWNERS_EQUITY'
  | 'OPERATING_REVENUE'
  | 'NON_OPERATING_REVENUE'
  | 'OPERATING_EXPENSE'
  | 'NON_OPERATING_EXPENSE'
  | 'COST_OF_GOODS_SOLD'

export type ReportingCategory =
  | 'BALANCE_SHEET'
  | 'INCOME_STATEMENT'
  | 'CASH_FLOW'
  | 'EQUITY_STATEMENT'

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

export type ApprovalStatus = 
  | 'DRAFT'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'REJECTED'
  | 'ARCHIVED'

export interface AIAccountSuggestion {
  id: string
  type: SuggestionType
  title: string
  description: string
  confidence: number
  impact: 'LOW' | 'MEDIUM' | 'HIGH'
  category: 'OPTIMIZATION' | 'COMPLIANCE' | 'RISK' | 'EFFICIENCY'
  actionRequired: boolean
  estimatedBenefit?: string
  implementationComplexity: 'SIMPLE' | 'MODERATE' | 'COMPLEX'
  suggestedActions: SuggestedAction[]
  relatedAccounts: string[]
  aiReasoningPath: string[]
  confidenceFactors: ConfidenceFactor[]
}

export type SuggestionType =
  | 'ACCOUNT_RESTRUCTURE'
  | 'CLASSIFICATION_CHANGE'
  | 'CONSOLIDATION_OPPORTUNITY'
  | 'COMPLIANCE_ISSUE'
  | 'RISK_MITIGATION'
  | 'EFFICIENCY_IMPROVEMENT'
  | 'AUTOMATION_OPPORTUNITY'

export interface SuggestedAction {
  id: string
  title: string
  description: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH'
  estimatedTimeToComplete: string
  prerequisites: string[]
  expectedOutcome: string
}

export interface ConfidenceFactor {
  factor: string
  weight: number
  contribution: number
  explanation: string
}

export interface ComplianceFlag {
  id: string
  type: ComplianceType
  severity: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL'
  title: string
  description: string
  regulation: string
  recommendedAction: string
  deadline?: Date
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'WAIVED'
}

export type ComplianceType =
  | 'GAAP_VIOLATION'
  | 'IFRS_VIOLATION'
  | 'TAX_REGULATION'
  | 'AUDIT_REQUIREMENT'
  | 'INTERNAL_POLICY'
  | 'REGULATORY_FILING'

export interface MonthlyActivityData {
  month: string
  year: number
  debits: number
  credits: number
  netChange: number
  transactionCount: number
  averageTransactionSize: number
  volatility: number
}

export interface ForecastData {
  nextQuarterProjection: number
  yearEndProjection: number
  confidenceInterval: {
    lower: number
    upper: number
  }
  forecastMethod: 'AI_PREDICTION' | 'TREND_ANALYSIS' | 'MANUAL_INPUT'
  lastUpdated: Date
  factors: ForecastFactor[]
}

export interface ForecastFactor {
  factor: string
  impact: number
  confidence: number
  description: string
}

export type WorkflowStage =
  | 'INITIAL_REVIEW'
  | 'ACCOUNTING_REVIEW'
  | 'COMPLIANCE_CHECK'
  | 'MANAGER_APPROVAL'
  | 'FINAL_APPROVAL'

export interface PendingChange {
  id: string
  field: string
  currentValue: any
  proposedValue: any
  reason: string
  requestedBy: string
  requestedAt: Date
  approverComments?: string
}

export interface ExternalMapping {
  systemName: string
  externalAccountCode: string
  mappingType: 'DIRECT' | 'CALCULATED' | 'SPLIT'
  mappingRules?: MappingRule[]
  lastSyncedAt: Date
  syncStatus: 'SUCCESS' | 'FAILED' | 'PENDING'
}

export interface MappingRule {
  condition: string
  action: string
  weight?: number
}

export interface TaxMapping {
  taxJurisdiction: string
  taxCategory: string
  taxCode: string
  taxRate: number
  effectiveDate: Date
  expiryDate?: Date
}

export interface AuditEntry {
  id: string
  timestamp: Date
  userId: string
  userName: string
  action: AuditAction
  fieldChanged?: string
  oldValue?: any
  newValue?: any
  reason?: string
  ipAddress: string
  userAgent: string
}

export type AuditAction =
  | 'CREATED'
  | 'UPDATED'
  | 'DELETED'
  | 'APPROVED'
  | 'REJECTED'
  | 'EXPORTED'
  | 'IMPORTED'
  | 'ARCHIVED'
  | 'RESTORED'

// API Request/Response Types
export interface CreateAccountRequest {
  accountCode?: string // AI will suggest if not provided
  accountName: string
  accountType: AccountType
  parentAccountId?: string
  description?: string
  classification: AccountClassification
  reportingCategory: ReportingCategory
  currency: string
  initialBalance?: number
  externalMappings?: Partial<ExternalMapping>[]
  taxMappings?: Partial<TaxMapping>[]
}

export interface UpdateAccountRequest {
  accountName?: string
  description?: string
  parentAccountId?: string
  isActive?: boolean
  classification?: AccountClassification
  reportingCategory?: ReportingCategory
  reason: string // Required for audit trail
}

export interface AccountSearchRequest {
  query?: string
  accountType?: AccountType[]
  classification?: AccountClassification[]
  isActive?: boolean
  hasBalance?: boolean
  riskLevel?: RiskLevel[]
  parentAccountId?: string
  level?: number
  includeChildren?: boolean
  sortBy?: 'accountCode' | 'accountName' | 'balance' | 'lastActivity'
  sortOrder?: 'asc' | 'desc'
  limit?: number
  offset?: number
}

export interface AccountSearchResponse {
  accounts: ChartOfAccountsEntry[]
  totalCount: number
  hasMore: boolean
  facets: SearchFacet[]
  suggestions: string[]
  searchTime: number
}

export interface SearchFacet {
  field: string
  values: FacetValue[]
}

export interface FacetValue {
  value: string
  count: number
  selected: boolean
}

export interface BulkOperationRequest {
  operation: 'UPDATE' | 'DELETE' | 'ARCHIVE' | 'ACTIVATE'
  accountIds: string[]
  parameters?: Record<string, any>
  reason: string
}

export interface BulkOperationResponse {
  totalRequested: number
  successful: number
  failed: number
  errors: BulkOperationError[]
  jobId: string
  estimatedCompletionTime: Date
}

export interface BulkOperationError {
  accountId: string
  accountCode: string
  error: string
  canRetry: boolean
}

// AI Intelligence Types
export interface AIIntelligenceRequest {
  accountId?: string
  analysisType: AIAnalysisType[]
  timeframe?: {
    start: Date
    end: Date
  }
  includeForecasting?: boolean
  includeBenchmarking?: boolean
  includeRiskAssessment?: boolean
}

export type AIAnalysisType =
  | 'PERFORMANCE_ANALYSIS'
  | 'ANOMALY_DETECTION'
  | 'OPTIMIZATION_SUGGESTIONS'
  | 'COMPLIANCE_CHECK'
  | 'FORECASTING'
  | 'BENCHMARKING'
  | 'RISK_ASSESSMENT'

export interface AIIntelligenceResponse {
  accountId: string
  analysisResults: AIAnalysisResult[]
  overallScore: number
  keyInsights: string[]
  actionableRecommendations: AIAccountSuggestion[]
  riskAssessment: RiskAssessment
  complianceStatus: ComplianceStatus
  generatedAt: Date
  nextAnalysisScheduled: Date
}

export interface AIAnalysisResult {
  type: AIAnalysisType
  score: number
  confidence: number
  findings: string[]
  recommendations: string[]
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  details: Record<string, any>
}

export interface RiskAssessment {
  overallRisk: RiskLevel
  riskFactors: RiskFactor[]
  mitigationStrategies: string[]
  monitoringRecommendations: string[]
  riskTrends: RiskTrend[]
}

export interface RiskFactor {
  factor: string
  severity: RiskLevel
  probability: number
  impact: number
  description: string
  mitigationActions: string[]
}

export interface RiskTrend {
  period: string
  riskLevel: RiskLevel
  changeFromPrevious: 'INCREASED' | 'DECREASED' | 'STABLE'
  keyDrivers: string[]
}

export interface ComplianceStatus {
  overallStatus: 'COMPLIANT' | 'NON_COMPLIANT' | 'NEEDS_REVIEW'
  complianceScore: number
  violations: ComplianceFlag[]
  upcomingRequirements: UpcomingRequirement[]
  lastAuditDate: Date
  nextAuditDue: Date
}

export interface UpcomingRequirement {
  requirement: string
  deadline: Date
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  description: string
  preparationSteps: string[]
}

// Hierarchy and Visualization Types
export interface AccountHierarchy {
  rootAccounts: HierarchyNode[]
  totalAccounts: number
  maxDepth: number
  lastUpdated: Date
}

export interface HierarchyNode {
  account: ChartOfAccountsEntry
  children: HierarchyNode[]
  depth: number
  totalBalance: number
  childrenBalance: number
  percentageOfParent: number
  isExpanded?: boolean
}

export interface VisualizationData {
  type: 'SUNBURST' | 'TREEMAP' | 'TREE' | 'SANKEY'
  data: VisualizationNode[]
  metadata: VisualizationMetadata
}

export interface VisualizationNode {
  id: string
  name: string
  value: number
  children?: VisualizationNode[]
  color?: string
  depth: number
  path: string[]
  metadata: Record<string, any>
}

export interface VisualizationMetadata {
  title: string
  description: string
  totalValue: number
  currency: string
  asOfDate: Date
  filters: VisualizationFilter[]
  colorScheme: string
  interactionOptions: string[]
}

export interface VisualizationFilter {
  field: string
  operator: 'eq' | 'ne' | 'gt' | 'lt' | 'gte' | 'lte' | 'in' | 'nin'
  value: any
  displayName: string
}

// Export and Import Types
export interface ExportRequest {
  format: 'EXCEL' | 'CSV' | 'PDF' | 'JSON'
  accountIds?: string[]
  includeHierarchy: boolean
  includeBalances: boolean
  includeAIInsights: boolean
  includeAuditTrail: boolean
  dateRange?: {
    start: Date
    end: Date
  }
  customFields?: string[]
}

export interface ExportResponse {
  fileUrl: string
  fileName: string
  fileSize: number
  format: string
  expiresAt: Date
  downloadCount: number
  maxDownloads: number
}

export interface ImportRequest {
  fileUrl: string
  format: 'EXCEL' | 'CSV' | 'JSON'
  mappingConfiguration: ImportMapping
  validationRules: ValidationRule[]
  conflictResolution: 'SKIP' | 'OVERWRITE' | 'MERGE'
  dryRun: boolean
}

export interface ImportMapping {
  fieldMappings: Record<string, string>
  defaultValues: Record<string, any>
  transformationRules: TransformationRule[]
}

export interface TransformationRule {
  field: string
  type: 'UPPERCASE' | 'LOWERCASE' | 'TRIM' | 'REGEX' | 'CUSTOM'
  parameters: Record<string, any>
}

export interface ValidationRule {
  field: string
  type: 'REQUIRED' | 'UNIQUE' | 'FORMAT' | 'RANGE' | 'CUSTOM'
  parameters: Record<string, any>
  errorMessage: string
}

export interface ImportResponse {
  jobId: string
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED'
  totalRecords: number
  processedRecords: number
  successfulRecords: number
  failedRecords: number
  errors: ImportError[]
  warnings: ImportWarning[]
  estimatedCompletionTime?: Date
  resultSummary?: ImportSummary
}

export interface ImportError {
  rowNumber: number
  field: string
  value: any
  error: string
  suggestion?: string
}

export interface ImportWarning {
  rowNumber: number
  field: string
  value: any
  warning: string
  severity: 'LOW' | 'MEDIUM' | 'HIGH'
}

export interface ImportSummary {
  created: number
  updated: number
  skipped: number
  failed: number
  duplicatesHandled: number
  validationErrors: number
  performanceMetrics: PerformanceMetrics
}

export interface PerformanceMetrics {
  totalProcessingTime: number
  averageRecordProcessingTime: number
  databaseOperations: number
  memoryUsage: number
  cpuUsage: number
}