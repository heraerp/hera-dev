// TypeScript types for HERA Universal Transaction System
// Based on existing schema.json structure

export type TransactionType = 
  | 'journal_entry'
  | 'sales'
  | 'purchase'
  | 'payment'
  | 'master_data'
  | 'inventory'
  | 'payroll'
  | 'reconciliation'

export type TransactionStatus = 
  | 'PENDING'
  | 'APPROVED'
  | 'POSTED'
  | 'REJECTED'
  | 'CANCELLED'
  | 'DRAFT'

export type UserRole = 
  | 'admin'
  | 'manager'
  | 'editor'
  | 'user'
  | 'viewer'

export type FraudValidationStatus = 
  | 'CLEAN'
  | 'FLAGGED'
  | 'UNDER_REVIEW'
  | 'CLEARED'
  | 'BLOCKED'

export type SecurityClassification = 
  | 'PUBLIC'
  | 'INTERNAL'
  | 'CONFIDENTIAL'
  | 'RESTRICTED'

// Core Universal Transaction Interface (from schema)
export interface UniversalTransaction {
  id: string
  organization_id: string
  transaction_type: TransactionType
  transaction_subtype?: string
  transaction_number: string
  business_date: string
  processing_date?: string
  transaction_data: Record<string, any>
  related_transactions?: string[]
  
  // AI Fields
  ai_generated?: boolean
  ai_confidence_score?: number
  ai_classification?: Record<string, any>
  ai_decision_trail?: Record<string, any>
  ai_model_version?: string
  ai_explainability_report?: Record<string, any>
  
  // Control Fields
  control_validations?: Record<string, any>
  control_exceptions?: Record<string, any>
  control_overrides?: Record<string, any>
  
  // Fraud Detection
  fraud_risk_score?: number
  fraud_indicators?: Record<string, any>
  fraud_validation_status?: FraudValidationStatus
  
  // Data Quality
  data_quality_score?: number
  data_quality_issues?: Record<string, any>
  data_quality_remediation?: Record<string, any>
  
  // Workflow
  workflow_status?: TransactionStatus
  approval_chain?: Record<string, any>
  current_approver?: string
  approval_deadline?: string
  
  // Audit & Compliance
  audit_trail?: Record<string, any>
  compliance_validations?: Record<string, any>
  regulatory_requirements?: Record<string, any>
  
  // Security
  security_classification?: SecurityClassification
  data_encryption_status?: string
  
  // Additional fields from schema
  change_log?: Record<string, any>
  integration_metadata?: Record<string, any>
  custom_fields?: Record<string, any>
  tags?: string[]
  priority_level?: string
  business_unit?: string
  department?: string
  cost_center?: string
  project_code?: string
  
  // Timestamps
  created_at?: string
  updated_at?: string
  created_by?: string
  updated_by?: string
}

// Transaction Lines Interface (from schema)
export interface UniversalTransactionLine {
  id: string
  transaction_id: string
  organization_id: string
  line_number: number
  line_type: string
  line_subtype?: string
  line_data: Record<string, any>
  debit_amount?: number
  credit_amount?: number
  net_amount?: number
  currency_code?: string
  exchange_rate?: number
  base_currency_amount?: number
  account_code?: string
  account_name?: string
  cost_center?: string
  department?: string
  project_code?: string
  description?: string
  reference_number?: string
  external_reference?: string
  ai_generated?: boolean
  ai_confidence_score?: number
  created_at?: string
  updated_at?: string
}

// Organization Interface (from schema)
export interface Organization {
  id: string
  name: string
  slug?: string
  description?: string
  organization_type?: string
  industry?: string
  country?: string
  currency?: string
  tax_number?: string
  registration_number?: string
  address?: Record<string, any>
  contact_info?: Record<string, any>
  settings?: Record<string, any>
  is_active?: boolean
  created_at?: string
  updated_at?: string
}

// User Organization Relationship (from schema)
export interface UserOrganization {
  id: string
  user_id: string
  organization_id: string
  role: UserRole
  permissions?: Record<string, any>
  access_level?: string
  department?: string
  cost_center?: string
  is_active?: boolean
  joined_at?: string
  created_at?: string
  updated_at?: string
}

// Filter and Search Interfaces
export interface TransactionFilters {
  organization_id?: string
  transaction_type?: TransactionType[]
  transaction_status?: TransactionStatus[]
  date_from?: string
  date_to?: string
  search_query?: string
  ai_generated?: boolean
  fraud_risk_min?: number
  fraud_risk_max?: number
  amount_min?: number
  amount_max?: number
  created_by?: string
  department?: string
  cost_center?: string
  project_code?: string
  tags?: string[]
  page?: number
  limit?: number
  sort_by?: string
  sort_order?: 'asc' | 'desc'
}

export interface TransactionSearchResult {
  transactions: UniversalTransaction[]
  total_count: number
  page: number
  limit: number
  has_more: boolean
  facets?: SearchFacet[]
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

// Statistics and Analytics
export interface TransactionStats {
  total_transactions: number
  pending_transactions: number
  approved_transactions: number
  posted_transactions: number
  rejected_transactions: number
  total_amount: number
  ai_generated_percentage: number
  average_processing_time: number
  fraud_flagged_count: number
  data_quality_average: number
  trends: {
    period: string
    transaction_count: number
    total_amount: number
    growth_rate: number
  }[]
  by_type: {
    type: TransactionType
    count: number
    amount: number
    percentage: number
  }[]
  by_status: {
    status: TransactionStatus
    count: number
    percentage: number
  }[]
}

// AI Analysis Results
export interface AIAnalysisResult {
  confidence_score: number
  classification: Record<string, any>
  decision_trail: string[]
  explainability: {
    factors: AIFactor[]
    reasoning: string
    confidence_breakdown: Record<string, number>
  }
  fraud_assessment: {
    risk_score: number
    indicators: string[]
    recommendation: string
  }
  data_quality: {
    score: number
    issues: string[]
    suggestions: string[]
  }
}

export interface AIFactor {
  factor: string
  weight: number
  impact: number
  description: string
}

// Transaction Creation and Updates
export interface CreateTransactionRequest {
  organization_id: string
  transaction_type: TransactionType
  transaction_subtype?: string
  business_date: string
  transaction_data: Record<string, any>
  lines?: Omit<UniversalTransactionLine, 'id' | 'transaction_id' | 'created_at' | 'updated_at'>[]
  description?: string
  reference_number?: string
  tags?: string[]
  priority_level?: string
  department?: string
  cost_center?: string
  project_code?: string
}

export interface UpdateTransactionRequest {
  transaction_data?: Record<string, any>
  workflow_status?: TransactionStatus
  approval_notes?: string
  tags?: string[]
  priority_level?: string
}

// Real-time Subscription Types
export interface TransactionSubscriptionPayload {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE'
  new?: UniversalTransaction
  old?: UniversalTransaction
  errors?: string[]
}

// Error and Response Types
export interface APIResponse<T> {
  data?: T
  error?: string
  message?: string
  success: boolean
  timestamp: string
}

export interface TransactionError {
  code: string
  message: string
  field?: string
  details?: Record<string, any>
}

// Template Types (from schema reference)
export interface TransactionTemplate {
  id: string
  organization_id: string
  template_name: string
  template_type: TransactionType
  template_data: Record<string, any>
  default_lines?: Partial<UniversalTransactionLine>[]
  is_active: boolean
  usage_count: number
  created_by: string
  created_at: string
  updated_at: string
}

// Permission Types
export interface TransactionPermissions {
  can_view: boolean
  can_create: boolean
  can_edit: boolean
  can_approve: boolean
  can_delete: boolean
  can_admin: boolean
  can_export: boolean
  can_override_controls: boolean
  max_transaction_amount?: number
  allowed_transaction_types: TransactionType[]
}

// Workflow Types
export interface ApprovalChain {
  steps: ApprovalStep[]
  current_step: number
  can_auto_approve: boolean
  escalation_rules: EscalationRule[]
}

export interface ApprovalStep {
  step_number: number
  approver_role: UserRole
  approver_id?: string
  required: boolean
  approval_limit?: number
  deadline_hours?: number
  status: 'pending' | 'approved' | 'rejected' | 'skipped'
  approved_at?: string
  approved_by?: string
  notes?: string
}

export interface EscalationRule {
  trigger_condition: string
  escalate_to_role: UserRole
  escalate_after_hours: number
  notification_template: string
}

// Export Types for Service Layer
export type TransactionServiceResponse<T> = Promise<APIResponse<T>>
export type TransactionQueryResult = TransactionSearchResult
export type TransactionCreateResult = UniversalTransaction
export type TransactionUpdateResult = UniversalTransaction
export type TransactionStatsResult = TransactionStats