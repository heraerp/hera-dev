/**
 * HERA Conversational AI Types
 * World's First ChatGPT-Style Business Operations Assistant
 */

// ================================================================================================
// CORE CONVERSATION TYPES
// ================================================================================================

export interface ConversationMessage {
  id: string
  conversationId: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: string
  messageType: MessageType
  metadata?: MessageMetadata
  status: MessageStatus
  businessActions?: BusinessAction[]
  attachments?: MessageAttachment[]
}

export type MessageType = 
  | 'text'
  | 'voice'
  | 'image'
  | 'document'
  | 'business_action'
  | 'workflow_trigger'
  | 'system_notification'

export type MessageStatus = 
  | 'sending'
  | 'sent'
  | 'processing'
  | 'completed'
  | 'error'
  | 'cancelled'

export interface MessageMetadata {
  confidence?: number
  processingTime?: number
  aiModel?: string
  businessContext?: BusinessContext
  extractedEntities?: ExtractedEntity[]
  intent?: BusinessIntent
  sentiment?: ConversationSentiment
}

export interface MessageAttachment {
  id: string
  type: 'image' | 'document' | 'audio' | 'video'
  url: string
  name: string
  size: number
  mimeType: string
  processing?: {
    status: 'pending' | 'processing' | 'completed' | 'error'
    results?: AttachmentProcessingResult
  }
}

// ================================================================================================
// BUSINESS INTENT & ENTITY EXTRACTION
// ================================================================================================

export interface BusinessIntent {
  category: BusinessIntentCategory
  action: string
  confidence: number
  entities: ExtractedEntity[]
  context: BusinessContext
  workflow?: WorkflowTrigger
  priority: 'low' | 'medium' | 'high' | 'urgent'
}

export type BusinessIntentCategory = 
  | 'financial_transaction'
  | 'invoice_processing'
  | 'customer_management'
  | 'inventory_management'
  | 'reporting_analytics'
  | 'workflow_automation'
  | 'team_collaboration'
  | 'document_processing'
  | 'compliance_audit'
  | 'system_configuration'

export interface ExtractedEntity {
  type: EntityType
  value: string | number | Date
  confidence: number
  startIndex?: number
  endIndex?: number
  normalized?: any
  validation?: EntityValidation
}

export type EntityType = 
  | 'amount'
  | 'date'
  | 'customer_name'
  | 'vendor_name'
  | 'invoice_number'
  | 'product_sku'
  | 'account_code'
  | 'employee_name'
  | 'department'
  | 'category'
  | 'description'
  | 'reference_number'
  | 'email'
  | 'phone'
  | 'address'

export interface EntityValidation {
  isValid: boolean
  suggestion?: string
  source?: 'database' | 'ai_inference' | 'user_input'
  alternatives?: string[]
}

export interface BusinessContext {
  organizationId: string
  userId: string
  userRole: string
  department?: string
  currentWorkflow?: string
  recentTransactions?: string[]
  preferences?: UserPreferences
  businessRules?: BusinessRule[]
}

// ================================================================================================
// CONVERSATION ENGINE
// ================================================================================================

export interface ConversationEngine {
  // Core conversation processing
  processMessage: (input: UserInput) => Promise<AIResponse>
  
  // Intent recognition and entity extraction
  parseBusinessIntent: (message: string) => Promise<BusinessIntent>
  extractEntities: (message: string, context: BusinessContext) => Promise<ExtractedEntity[]>
  
  // Context management
  maintainContext: (conversationId: string) => Promise<ConversationContext>
  updateContext: (context: ConversationContext, newInfo: any) => Promise<void>
  
  // Business action execution
  executeBusinessAction: (intent: BusinessIntent) => Promise<ActionResult>
  createUniversalTransaction: (action: BusinessAction) => Promise<UniversalTransaction>
  
  // Response generation
  generateResponse: (actionResult: ActionResult, context: ConversationContext) => Promise<AIResponse>
  personalizeResponse: (response: AIResponse, userProfile: UserProfile) => Promise<AIResponse>
}

export interface UserInput {
  conversationId: string
  userId: string
  message: string
  messageType: MessageType
  attachments?: MessageAttachment[]
  voice?: VoiceInput
  context?: ConversationContext
  timestamp: string
}

export interface VoiceInput {
  audioBlob?: Blob
  transcript?: string
  confidence?: number
  language?: string
  duration?: number
}

export interface AIResponse {
  messageId: string
  content: string
  businessActions?: BusinessAction[]
  suggestions?: ActionSuggestion[]
  followUpQuestions?: string[]
  confidence: number
  processingTime: number
  attachments?: ResponseAttachment[]
  visualizations?: DataVisualization[]
  notifications?: SystemNotification[]
}

export interface ActionSuggestion {
  id: string
  title: string
  description: string
  action: BusinessAction
  confidence: number
  impact: 'low' | 'medium' | 'high'
  category: BusinessIntentCategory
}

export interface ResponseAttachment {
  type: 'report' | 'chart' | 'document' | 'invoice' | 'receipt'
  title: string
  url?: string
  data?: any
  format: 'pdf' | 'excel' | 'csv' | 'json' | 'image'
}

// ================================================================================================
// BUSINESS ACTIONS & WORKFLOW
// ================================================================================================

export interface BusinessAction {
  id: string
  type: BusinessActionType
  description: string
  parameters: Record<string, any>
  validation: ActionValidation
  workflow?: WorkflowTrigger
  dependencies?: string[]
  estimatedTime?: number
  riskLevel: 'low' | 'medium' | 'high'
}

export type BusinessActionType = 
  | 'create_invoice'
  | 'record_payment'
  | 'add_customer'
  | 'update_inventory'
  | 'create_purchase_order'
  | 'process_expense'
  | 'generate_report'
  | 'assign_workflow'
  | 'approve_transaction'
  | 'send_notification'

export interface ActionValidation {
  isValid: boolean
  errors?: ValidationError[]
  warnings?: ValidationWarning[]
  requiresApproval?: boolean
  missingData?: string[]
}

export interface ValidationError {
  field: string
  message: string
  severity: 'error' | 'warning' | 'info'
  suggestion?: string
}

export interface ValidationWarning {
  field: string
  message: string
  canProceed: boolean
  recommendation?: string
}

export interface ActionResult {
  actionId: string
  success: boolean
  message: string
  data?: any
  errors?: string[]
  warnings?: string[]
  transactionId?: string
  workflowInstanceId?: string
  nextSteps?: string[]
  impact?: BusinessImpact
}

export interface BusinessImpact {
  financialImpact?: {
    amount: number
    currency: string
    accounts: string[]
  }
  operationalImpact?: {
    processes: string[]
    teams: string[]
    timeline: string
  }
  complianceImpact?: {
    regulations: string[]
    auditTrail: boolean
    approvals: string[]
  }
}

// ================================================================================================
// WORKFLOW & AUTOMATION
// ================================================================================================

export interface WorkflowTrigger {
  workflowId: string
  triggerType: 'conversation' | 'business_action' | 'schedule' | 'event'
  parameters: Record<string, any>
  conditions?: WorkflowCondition[]
  priority: 'low' | 'medium' | 'high' | 'urgent'
}

export interface WorkflowCondition {
  field: string
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'matches'
  value: any
  required: boolean
}

export interface ConversationWorkflow {
  id: string
  name: string
  description: string
  triggers: WorkflowTrigger[]
  steps: WorkflowStep[]
  automationLevel: 'manual' | 'semi_automatic' | 'automatic'
  permissions: string[]
}

export interface WorkflowStep {
  id: string
  name: string
  type: 'business_action' | 'approval' | 'notification' | 'condition' | 'ai_analysis'
  parameters: Record<string, any>
  dependencies?: string[]
  timeout?: number
  retryPolicy?: RetryPolicy
}

export interface RetryPolicy {
  maxAttempts: number
  backoffStrategy: 'linear' | 'exponential'
  baseDelay: number
}

// ================================================================================================
// CONVERSATION STATE & CONTEXT
// ================================================================================================

export interface ConversationContext {
  conversationId: string
  userId: string
  organizationId: string
  startedAt: string
  lastActivity: string
  messageCount: number
  businessContext: BusinessContext
  conversationState: ConversationState
  activeWorkflows?: string[]
  pendingActions?: BusinessAction[]
  conversationSummary?: ConversationSummary
}

export interface ConversationState {
  phase: ConversationPhase
  topic?: string
  intent?: BusinessIntent
  collectingData?: DataCollection
  awaitingConfirmation?: BusinessAction[]
  errors?: ConversationError[]
}

export type ConversationPhase = 
  | 'greeting'
  | 'understanding'
  | 'data_collection'
  | 'validation'
  | 'execution'
  | 'confirmation'
  | 'follow_up'
  | 'completed'

export interface DataCollection {
  required: string[]
  collected: Record<string, any>
  missing: string[]
  suggestions: Record<string, string[]>
}

export interface ConversationError {
  type: 'intent_unclear' | 'missing_data' | 'validation_failed' | 'action_failed' | 'permission_denied'
  message: string
  recovery?: RecoveryAction
  timestamp: string
}

export interface RecoveryAction {
  type: 'clarify_intent' | 'collect_data' | 'alternative_action' | 'escalate'
  parameters: Record<string, any>
  suggestedMessage?: string
}

export interface ConversationSummary {
  topic: string
  keyActions: BusinessAction[]
  decisions: string[]
  outcomes: ActionResult[]
  nextSteps: string[]
  participants: string[]
  tags: string[]
}

// ================================================================================================
// USER PREFERENCES & PERSONALIZATION
// ================================================================================================

export interface UserPreferences {
  conversationStyle: 'formal' | 'casual' | 'technical' | 'simplified'
  responseLength: 'brief' | 'detailed' | 'comprehensive'
  notificationLevel: 'minimal' | 'standard' | 'verbose'
  confirmationRequired: boolean
  autoExecute: string[]
  favoriteActions: string[]
  shortcuts: Record<string, BusinessAction>
  language: string
  timezone: string
  currency: string
}

export interface UserProfile {
  id: string
  name: string
  role: string
  department: string
  permissions: string[]
  preferences: UserPreferences
  conversationHistory: ConversationStats
  expertise: ExpertiseLevel[]
}

export interface ConversationStats {
  totalConversations: number
  averageLength: number
  commonIntents: string[]
  successRate: number
  lastActivity: string
  preferredTimes: string[]
}

export interface ExpertiseLevel {
  domain: BusinessIntentCategory
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  confidence: number
  lastUpdated: string
}

// ================================================================================================
// VOICE & MULTI-MODAL
// ================================================================================================

export interface VoiceCapabilities {
  speechToText: (audio: Blob) => Promise<SpeechResult>
  textToSpeech: (text: string, options?: TTSOptions) => Promise<AudioBuffer>
  voiceCommands: (audio: Blob) => Promise<VoiceCommand>
  conversationMode: boolean
  wakeWord?: string
}

export interface SpeechResult {
  transcript: string
  confidence: number
  language: string
  alternatives?: string[]
  duration: number
  isFinal: boolean
}

export interface TTSOptions {
  voice?: string
  rate?: number
  pitch?: number
  volume?: number
  language?: string
  emphasis?: string[]
}

export interface VoiceCommand {
  command: string
  intent: BusinessIntent
  confidence: number
  parameters?: Record<string, any>
}

export interface DocumentProcessing {
  ocrExtract: (image: File) => Promise<OCRResult>
  aiAnalysis: (document: ProcessedDocument) => Promise<DocumentAnalysis>
  classification: (document: ProcessedDocument) => Promise<DocumentClassification>
  validation: (extracted: ExtractedData) => Promise<ValidationResult>
}

export interface OCRResult {
  text: string
  confidence: number
  layout: DocumentLayout
  extractedData: ExtractedData
  processingTime: number
}

export interface DocumentLayout {
  pages: number
  regions: DocumentRegion[]
  tables?: TableData[]
  signatures?: SignatureData[]
}

export interface DocumentRegion {
  type: 'header' | 'body' | 'footer' | 'table' | 'signature' | 'logo'
  bounds: BoundingBox
  confidence: number
  text: string
}

export interface BoundingBox {
  x: number
  y: number
  width: number
  height: number
}

export interface ExtractedData {
  vendor?: string
  amount?: number
  date?: string
  invoiceNumber?: string
  items?: LineItem[]
  totals?: DocumentTotals
  metadata?: Record<string, any>
}

export interface LineItem {
  description: string
  quantity?: number
  unitPrice?: number
  total?: number
  category?: string
}

export interface DocumentTotals {
  subtotal?: number
  tax?: number
  total?: number
  currency?: string
}

// ================================================================================================
// REAL-TIME & COLLABORATION
// ================================================================================================

export interface CollaborationFeatures {
  sharedConversations: boolean
  teamNotifications: boolean
  mentionSupport: boolean
  conversationThreads: boolean
  workspaceIntegration: boolean
}

export interface TeamConversation {
  conversationId: string
  teamId: string
  participants: string[]
  sharedContext: BusinessContext
  collaborativeActions: CollaborativeAction[]
  permissions: ConversationPermissions
}

export interface CollaborativeAction {
  actionId: string
  initiator: string
  approvers: string[]
  status: 'pending' | 'approved' | 'rejected' | 'executed'
  votes: ActionVote[]
  deadline?: string
}

export interface ActionVote {
  userId: string
  vote: 'approve' | 'reject' | 'abstain'
  comment?: string
  timestamp: string
}

export interface ConversationPermissions {
  canRead: string[]
  canWrite: string[]
  canExecuteActions: string[]
  canInviteParticipants: string[]
}

// ================================================================================================
// GAMIFICATION & ACHIEVEMENTS
// ================================================================================================

export interface ConversationGamification {
  achievements: Achievement[]
  streaks: ConversationStreak[]
  points: number
  level: number
  badges: Badge[]
  milestones: Milestone[]
}

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  condition: AchievementCondition
  points: number
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  unlockedAt?: string
}

export interface AchievementCondition {
  type: 'conversation_count' | 'action_success' | 'time_saved' | 'accuracy' | 'collaboration'
  target: number
  timeframe?: string
  category?: BusinessIntentCategory
}

export interface ConversationStreak {
  type: 'daily_usage' | 'successful_actions' | 'collaboration' | 'learning'
  current: number
  best: number
  lastActivity: string
}

export interface Badge {
  id: string
  name: string
  icon: string
  description: string
  category: 'expertise' | 'collaboration' | 'efficiency' | 'innovation'
  earnedAt: string
}

export interface Milestone {
  id: string
  name: string
  description: string
  progress: number
  target: number
  reward?: Achievement
  category: BusinessIntentCategory
}

// ================================================================================================
// ANALYTICS & INSIGHTS
// ================================================================================================

export interface ConversationAnalytics {
  metrics: ConversationMetrics
  insights: BusinessInsight[]
  patterns: UsagePattern[]
  recommendations: PerformanceRecommendation[]
}

export interface ConversationMetrics {
  totalConversations: number
  averageLength: number
  successRate: number
  responseTime: number
  userSatisfaction: number
  actionAccuracy: number
  timeToResolution: number
}

export interface BusinessInsight {
  type: 'trend' | 'anomaly' | 'opportunity' | 'risk'
  title: string
  description: string
  impact: 'low' | 'medium' | 'high'
  confidence: number
  actionable: boolean
  suggestedActions?: string[]
}

export interface UsagePattern {
  pattern: string
  frequency: number
  timeOfDay?: string[]
  daysOfWeek?: string[]
  businessContext?: string[]
  efficiency: number
}

export interface PerformanceRecommendation {
  type: 'workflow_optimization' | 'training' | 'automation' | 'integration'
  title: string
  description: string
  expectedBenefit: string
  effort: 'low' | 'medium' | 'high'
  priority: 'low' | 'medium' | 'high'
}

// ================================================================================================
// SYSTEM TYPES
// ================================================================================================

export interface ConversationSentiment {
  overall: 'positive' | 'neutral' | 'negative' | 'frustrated' | 'satisfied'
  confidence: number
  emotions: Emotion[]
  urgency: 'low' | 'medium' | 'high' | 'urgent'
}

export interface Emotion {
  type: string
  intensity: number
  confidence: number
}

export interface SystemNotification {
  id: string
  type: 'success' | 'warning' | 'error' | 'info' | 'achievement'
  title: string
  message: string
  actions?: NotificationAction[]
  priority: 'low' | 'medium' | 'high'
  expiresAt?: string
}

export interface NotificationAction {
  label: string
  action: string
  style: 'primary' | 'secondary' | 'danger'
}

export interface DataVisualization {
  type: 'chart' | 'table' | 'kpi' | 'timeline' | 'map'
  title: string
  data: any
  config: VisualizationConfig
  interactive: boolean
}

export interface VisualizationConfig {
  chartType?: 'line' | 'bar' | 'pie' | 'scatter' | 'area'
  colors?: string[]
  dimensions?: string[]
  metrics?: string[]
  filters?: Record<string, any>
}

export interface AttachmentProcessingResult {
  extracted?: ExtractedData
  classification?: DocumentClassification
  analysis?: DocumentAnalysis
  errors?: string[]
  confidence: number
}

export interface DocumentClassification {
  type: 'invoice' | 'receipt' | 'contract' | 'report' | 'statement' | 'other'
  confidence: number
  subtype?: string
  properties?: Record<string, any>
}

export interface DocumentAnalysis {
  businessImpact: BusinessImpact
  recommendations: string[]
  extractedActions: BusinessAction[]
  risks: DocumentRisk[]
  compliance: ComplianceCheck[]
}

export interface DocumentRisk {
  type: 'financial' | 'operational' | 'compliance' | 'security'
  level: 'low' | 'medium' | 'high' | 'critical'
  description: string
  mitigation?: string[]
}

export interface ComplianceCheck {
  regulation: string
  status: 'compliant' | 'non_compliant' | 'requires_review'
  details: string
  actions?: string[]
}

export interface ValidationResult {
  isValid: boolean
  score: number
  errors: ValidationError[]
  warnings: ValidationWarning[]
  suggestions: string[]
}

export interface BusinessRule {
  id: string
  name: string
  description: string
  conditions: RuleCondition[]
  actions: RuleAction[]
  priority: number
  active: boolean
}

export interface RuleCondition {
  field: string
  operator: string
  value: any
  logic?: 'and' | 'or'
}

export interface RuleAction {
  type: string
  parameters: Record<string, any>
  message?: string
}

export interface TableData {
  headers: string[]
  rows: string[][]
  confidence: number
  bounds: BoundingBox
}

export interface SignatureData {
  bounds: BoundingBox
  confidence: number
  type: 'handwritten' | 'digital'
  verified?: boolean
}

// Re-export transaction types for integration
export type { UniversalTransaction } from './transactions'