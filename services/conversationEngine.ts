/**
 * HERA Conversational AI Engine
 * World's First ChatGPT-Style Business Operations Assistant
 */

import { createClient } from '@supabase/supabase-js'
import type {
  ConversationEngine,
  UserInput,
  AIResponse,
  BusinessIntent,
  ExtractedEntity,
  ConversationContext,
  BusinessAction,
  ActionResult,
  BusinessIntentCategory,
  EntityType,
  BusinessActionType,
  MessageMetadata,
  ConversationSentiment,
  UserProfile,
  BusinessContext,
  ValidationResult,
  DocumentProcessing,
  OCRResult,
  VoiceCapabilities,
  SpeechResult,
  TTSOptions
} from '@/types/conversation'
import type { UniversalTransaction } from '@/types/transactions'
import { HeraTransactionService } from './heraTransactions'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase not configured, using demo mode for conversation engine')
}

const supabase = createClient(supabaseUrl || '', supabaseKey || '')

/**
 * HERA Conversational AI Engine Implementation
 * Transforms natural language into business actions
 */
export class HeraConversationEngine implements ConversationEngine {
  private aiProvider: 'openai' | 'anthropic' | 'local' = 'local' // Default to demo mode
  private conversationContexts = new Map<string, ConversationContext>()
  private businessIntentPatterns = this.initializeIntentPatterns()
  private entityPatterns = this.initializeEntityPatterns()

  constructor(options?: { aiProvider?: 'openai' | 'anthropic' | 'local' }) {
    this.aiProvider = options?.aiProvider || 'local'
    this.setupRealtimeSubscriptions()
  }

  /**
   * Process incoming user message and generate AI response
   */
  async processMessage(input: UserInput): Promise<AIResponse> {
    const startTime = Date.now()

    try {
      // 1. Parse business intent and extract entities
      const intent = await this.parseBusinessIntent(input.message)
      const entities = await this.extractEntities(input.message, input.context?.businessContext || {} as BusinessContext)

      // 2. Maintain conversation context
      const context = await this.maintainContext(input.conversationId)
      context.conversationState.intent = intent
      context.lastActivity = new Date().toISOString()
      context.messageCount++

      // 3. Analyze sentiment and urgency
      const sentiment = this.analyzeSentiment(input.message)

      // 4. Execute business actions if intent is clear
      let actionResults: ActionResult[] = []
      let businessActions: BusinessAction[] = []

      if (intent.confidence > 0.7) {
        const actions = this.generateBusinessActions(intent, entities, context)
        businessActions = actions

        // Execute high-confidence actions automatically for trusted users
        if (intent.confidence > 0.9 && this.canAutoExecute(intent, context)) {
          for (const action of actions) {
            const result = await this.executeBusinessAction(intent)
            actionResults.push(result)
          }
        }
      }

      // 5. Generate personalized response
      const response = await this.generateResponse({
        actionId: intent.category,
        success: actionResults.length === 0 || actionResults.every(r => r.success),
        message: this.generateResponseMessage(intent, entities, actionResults),
        data: actionResults,
        transactionId: actionResults[0]?.transactionId
      }, context)

      // 6. Add suggestions and follow-up questions
      response.suggestions = this.generateActionSuggestions(intent, entities, context)
      response.followUpQuestions = this.generateFollowUpQuestions(intent, context)

      // 7. Update context
      await this.updateContext(context, { 
        lastIntent: intent, 
        lastEntities: entities,
        sentiment 
      })

      response.processingTime = Date.now() - startTime
      response.confidence = intent.confidence

      return response

    } catch (error) {
      console.error('Conversation processing error:', error)
      
      return {
        messageId: this.generateId(),
        content: "I'm having trouble processing that request right now. Could you try rephrasing it?",
        confidence: 0,
        processingTime: Date.now() - startTime,
        businessActions: [],
        suggestions: [{
          id: this.generateId(),
          title: "Try a simpler request",
          description: "Break down your request into smaller parts",
          action: {
            id: this.generateId(),
            type: 'send_notification',
            description: 'Simplify request',
            parameters: {},
            validation: { isValid: true },
            riskLevel: 'low'
          },
          confidence: 1,
          impact: 'low',
          category: 'system_configuration'
        }]
      }
    }
  }

  /**
   * Parse business intent from natural language
   */
  async parseBusinessIntent(message: string): Promise<BusinessIntent> {
    const normalizedMessage = message.toLowerCase().trim()
    
    // Demo mode: Use pattern matching for intent recognition
    for (const [category, patterns] of this.businessIntentPatterns.entries()) {
      for (const pattern of patterns) {
        if (pattern.regex.test(normalizedMessage)) {
          return {
            category: category as BusinessIntentCategory,
            action: pattern.action,
            confidence: pattern.confidence,
            entities: [],
            context: {} as BusinessContext,
            priority: this.determinePriority(normalizedMessage)
          }
        }
      }
    }

    // Default intent for unrecognized patterns
    return {
      category: 'system_configuration',
      action: 'clarify_intent',
      confidence: 0.3,
      entities: [],
      context: {} as BusinessContext,
      priority: 'medium'
    }
  }

  /**
   * Extract business entities from message
   */
  async extractEntities(message: string, context: BusinessContext): Promise<ExtractedEntity[]> {
    const entities: ExtractedEntity[] = []
    const normalizedMessage = message.toLowerCase()

    // Extract amounts
    const amountPattern = /\$?([\d,]+\.?\d*)/g
    let match
    while ((match = amountPattern.exec(message)) !== null) {
      entities.push({
        type: 'amount',
        value: parseFloat(match[1].replace(/,/g, '')),
        confidence: 0.9,
        startIndex: match.index,
        endIndex: match.index + match[0].length,
        normalized: parseFloat(match[1].replace(/,/g, ''))
      })
    }

    // Extract dates
    const datePatterns = [
      /\b(\d{1,2}\/\d{1,2}\/\d{4})\b/g,
      /\b(\d{4}-\d{2}-\d{2})\b/g,
      /\b(today|tomorrow|yesterday)\b/gi,
      /\b(next|last)\s+(week|month|year)\b/gi
    ]

    for (const pattern of datePatterns) {
      while ((match = pattern.exec(message)) !== null) {
        entities.push({
          type: 'date',
          value: match[1],
          confidence: 0.8,
          startIndex: match.index,
          endIndex: match.index + match[0].length,
          normalized: this.normalizeDate(match[1])
        })
      }
    }

    // Extract invoice numbers
    const invoicePattern = /\b(invoice|inv|#)\s*([a-zA-Z0-9-]+)\b/gi
    while ((match = invoicePattern.exec(message)) !== null) {
      entities.push({
        type: 'invoice_number',
        value: match[2],
        confidence: 0.85,
        startIndex: match.index,
        endIndex: match.index + match[0].length
      })
    }

    // Extract company/customer names (simplified pattern)
    const companyPattern = /\b([A-Z][a-zA-Z\s&\.]+(?:Inc|LLC|Corp|Ltd|Company))\b/g
    while ((match = companyPattern.exec(message)) !== null) {
      entities.push({
        type: 'customer_name',
        value: match[1],
        confidence: 0.7,
        startIndex: match.index,
        endIndex: match.index + match[0].length
      })
    }

    return entities
  }

  /**
   * Maintain conversation context
   */
  async maintainContext(conversationId: string): Promise<ConversationContext> {
    if (this.conversationContexts.has(conversationId)) {
      return this.conversationContexts.get(conversationId)!
    }

    // Create new context
    const context: ConversationContext = {
      conversationId,
      userId: 'demo-user',
      organizationId: '550e8400-e29b-41d4-a716-446655440000',
      startedAt: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      messageCount: 0,
      businessContext: {
        organizationId: '550e8400-e29b-41d4-a716-446655440000',
        userId: 'demo-user',
        userRole: 'admin'
      },
      conversationState: {
        phase: 'greeting'
      }
    }

    this.conversationContexts.set(conversationId, context)
    return context
  }

  /**
   * Update conversation context
   */
  async updateContext(context: ConversationContext, newInfo: any): Promise<void> {
    Object.assign(context, newInfo)
    this.conversationContexts.set(context.conversationId, context)

    // In production, persist to database
    if (supabaseUrl && supabaseKey) {
      try {
        await supabase
          .from('conversation_contexts')
          .upsert({
            id: context.conversationId,
            user_id: context.userId,
            organization_id: context.organizationId,
            context_data: context,
            last_activity: context.lastActivity
          })
      } catch (error) {
        console.warn('Failed to persist conversation context:', error)
      }
    }
  }

  /**
   * Execute business action
   */
  async executeBusinessAction(intent: BusinessIntent): Promise<ActionResult> {
    try {
      switch (intent.category) {
        case 'financial_transaction':
          return await this.executeFinancialTransaction(intent)
        
        case 'invoice_processing':
          return await this.executeInvoiceProcessing(intent)
        
        case 'customer_management':
          return await this.executeCustomerManagement(intent)
        
        case 'inventory_management':
          return await this.executeInventoryManagement(intent)
        
        case 'reporting_analytics':
          return await this.executeReportingAnalytics(intent)
        
        default:
          return {
            actionId: intent.category,
            success: false,
            message: `Action type '${intent.category}' is not yet implemented`,
            errors: ['Unsupported action type']
          }
      }
    } catch (error) {
      console.error('Business action execution error:', error)
      return {
        actionId: intent.category,
        success: false,
        message: 'Failed to execute business action',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      }
    }
  }

  /**
   * Create universal transaction from business action
   */
  async createUniversalTransaction(action: BusinessAction): Promise<UniversalTransaction> {
    // Map business action to transaction type
    const transactionTypeMap: Record<BusinessActionType, string> = {
      'create_invoice': 'sales',
      'record_payment': 'payment',
      'add_customer': 'master_data',
      'update_inventory': 'inventory',
      'create_purchase_order': 'purchase',
      'process_expense': 'purchase',
      'generate_report': 'journal_entry',
      'assign_workflow': 'master_data',
      'approve_transaction': 'journal_entry',
      'send_notification': 'master_data'
    }

    const transactionData = {
      organizationId: '550e8400-e29b-41d4-a716-446655440000',
      transactionType: transactionTypeMap[action.type] || 'journal_entry',
      transactionData: {
        conversationAction: action,
        aiGenerated: true,
        confidence: action.validation.isValid ? 0.9 : 0.6,
        ...action.parameters
      }
    }

    // Use existing transaction service
    return await HeraTransactionService.createTransaction(transactionData)
  }

  /**
   * Generate AI response
   */
  async generateResponse(actionResult: ActionResult, context: ConversationContext): Promise<AIResponse> {
    return {
      messageId: this.generateId(),
      content: this.generateResponseMessage(context.conversationState.intent!, [], [actionResult]),
      businessActions: [],
      confidence: 0.8,
      processingTime: 0
    }
  }

  /**
   * Personalize response based on user profile
   */
  async personalizeResponse(response: AIResponse, userProfile: UserProfile): Promise<AIResponse> {
    // Adjust response style based on user preferences
    if (userProfile.preferences.conversationStyle === 'formal') {
      response.content = this.formalizeLanguage(response.content)
    } else if (userProfile.preferences.conversationStyle === 'casual') {
      response.content = this.casualizeLanguage(response.content)
    }

    // Adjust response length
    if (userProfile.preferences.responseLength === 'brief') {
      response.content = this.shortenResponse(response.content)
    }

    return response
  }

  // ================================================================================================
  // PRIVATE HELPER METHODS
  // ================================================================================================

  private setupRealtimeSubscriptions(): void {
    if (!supabaseUrl || !supabaseKey) return

    // Subscribe to conversation updates
    supabase
      .channel('conversations')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'conversations'
      }, (payload) => {
        console.log('Conversation update:', payload)
      })
      .subscribe()
  }

  private initializeIntentPatterns(): Map<string, Array<{regex: RegExp, action: string, confidence: number}>> {
    return new Map([
      ['financial_transaction', [
        { regex: /record.*payment|payment.*from|receive.*payment/i, action: 'record_payment', confidence: 0.9 },
        { regex: /create.*transaction|new.*transaction|post.*transaction/i, action: 'create_transaction', confidence: 0.8 },
        { regex: /transfer.*money|transfer.*funds|move.*money/i, action: 'transfer_funds', confidence: 0.85 }
      ]],
      ['invoice_processing', [
        { regex: /process.*invoice|upload.*invoice|invoice.*from/i, action: 'process_invoice', confidence: 0.9 },
        { regex: /create.*invoice|new.*invoice|send.*invoice/i, action: 'create_invoice', confidence: 0.85 },
        { regex: /pay.*invoice|approve.*invoice/i, action: 'approve_invoice', confidence: 0.8 }
      ]],
      ['customer_management', [
        { regex: /add.*customer|new.*customer|create.*customer/i, action: 'add_customer', confidence: 0.9 },
        { regex: /update.*customer|edit.*customer|modify.*customer/i, action: 'update_customer', confidence: 0.85 },
        { regex: /find.*customer|search.*customer|look.*customer/i, action: 'find_customer', confidence: 0.8 }
      ]],
      ['inventory_management', [
        { regex: /update.*inventory|stock.*level|inventory.*count/i, action: 'update_inventory', confidence: 0.9 },
        { regex: /add.*product|new.*product|create.*product/i, action: 'add_product', confidence: 0.85 },
        { regex: /low.*stock|reorder.*point|stock.*alert/i, action: 'stock_alert', confidence: 0.8 }
      ]],
      ['reporting_analytics', [
        { regex: /cash.*flow|cash.*position|show.*cash/i, action: 'cash_flow_report', confidence: 0.9 },
        { regex: /profit.*loss|income.*statement|p&l/i, action: 'profit_loss_report', confidence: 0.9 },
        { regex: /expense.*report|spending.*analysis|expense.*breakdown/i, action: 'expense_analysis', confidence: 0.85 },
        { regex: /sales.*report|revenue.*analysis|sales.*performance/i, action: 'sales_report', confidence: 0.85 }
      ]]
    ])
  }

  private initializeEntityPatterns(): Map<EntityType, RegExp[]> {
    return new Map([
      ['amount', [/\$[\d,]+\.?\d*/g, /[\d,]+\.?\d*\s*dollars?/gi]],
      ['date', [/\d{1,2}\/\d{1,2}\/\d{4}/g, /\d{4}-\d{2}-\d{2}/g]],
      ['invoice_number', [/invoice\s*#?\s*([a-zA-Z0-9-]+)/gi, /inv\s*#?\s*([a-zA-Z0-9-]+)/gi]],
      ['customer_name', [/customer\s+([A-Z][a-zA-Z\s]+)/gi, /from\s+([A-Z][a-zA-Z\s&\.]+)/gi]]
    ])
  }

  private determinePriority(message: string): 'low' | 'medium' | 'high' | 'urgent' {
    const urgentWords = ['urgent', 'asap', 'immediate', 'emergency', 'critical']
    const highWords = ['important', 'priority', 'quickly', 'soon']
    
    const lowerMessage = message.toLowerCase()
    
    if (urgentWords.some(word => lowerMessage.includes(word))) {
      return 'urgent'
    }
    if (highWords.some(word => lowerMessage.includes(word))) {
      return 'high'
    }
    return 'medium'
  }

  private analyzeSentiment(message: string): ConversationSentiment {
    const positiveWords = ['great', 'good', 'excellent', 'perfect', 'thanks', 'please']
    const negativeWords = ['problem', 'issue', 'error', 'wrong', 'failed', 'broken']
    const frustratedWords = ['frustrated', 'annoyed', 'why', 'not working', 'still']

    const lowerMessage = message.toLowerCase()
    
    const positiveScore = positiveWords.filter(word => lowerMessage.includes(word)).length
    const negativeScore = negativeWords.filter(word => lowerMessage.includes(word)).length
    const frustratedScore = frustratedWords.filter(word => lowerMessage.includes(word)).length

    if (frustratedScore > 0) {
      return { overall: 'frustrated', confidence: 0.8, emotions: [], urgency: 'high' }
    }
    if (negativeScore > positiveScore) {
      return { overall: 'negative', confidence: 0.7, emotions: [], urgency: 'medium' }
    }
    if (positiveScore > 0) {
      return { overall: 'positive', confidence: 0.7, emotions: [], urgency: 'low' }
    }
    
    return { overall: 'neutral', confidence: 0.6, emotions: [], urgency: 'medium' }
  }

  private generateBusinessActions(intent: BusinessIntent, entities: ExtractedEntity[], context: ConversationContext): BusinessAction[] {
    const actions: BusinessAction[] = []

    switch (intent.category) {
      case 'financial_transaction':
        if (intent.action === 'record_payment') {
          const amount = entities.find(e => e.type === 'amount')?.value as number
          const customer = entities.find(e => e.type === 'customer_name')?.value as string
          
          if (amount && customer) {
            actions.push({
              id: this.generateId(),
              type: 'record_payment',
              description: `Record payment of $${amount} from ${customer}`,
              parameters: { amount, customer },
              validation: { isValid: true },
              riskLevel: 'medium'
            })
          }
        }
        break

      case 'invoice_processing':
        if (intent.action === 'create_invoice') {
          const customer = entities.find(e => e.type === 'customer_name')?.value as string
          const amount = entities.find(e => e.type === 'amount')?.value as number
          
          if (customer) {
            actions.push({
              id: this.generateId(),
              type: 'create_invoice',
              description: `Create invoice for ${customer}${amount ? ` for $${amount}` : ''}`,
              parameters: { customer, amount },
              validation: { isValid: true },
              riskLevel: 'low'
            })
          }
        }
        break
    }

    return actions
  }

  private generateActionSuggestions(intent: BusinessIntent, entities: ExtractedEntity[], context: ConversationContext) {
    // Generate contextual suggestions based on intent and entities
    const suggestions = []

    if (intent.category === 'financial_transaction') {
      suggestions.push({
        id: this.generateId(),
        title: "View Recent Transactions",
        description: "See your latest financial transactions",
        action: {
          id: this.generateId(),
          type: 'generate_report' as BusinessActionType,
          description: 'Generate recent transactions report',
          parameters: { reportType: 'recent_transactions' },
          validation: { isValid: true },
          riskLevel: 'low' as const
        },
        confidence: 0.8,
        impact: 'medium' as const,
        category: 'reporting_analytics' as BusinessIntentCategory
      })
    }

    return suggestions
  }

  private generateFollowUpQuestions(intent: BusinessIntent, context: ConversationContext): string[] {
    const questions = []

    switch (intent.category) {
      case 'financial_transaction':
        questions.push("Would you like me to set up automatic payment reminders?")
        questions.push("Should I create a recurring transaction for this?")
        break
      
      case 'invoice_processing':
        questions.push("Would you like me to send this invoice automatically?")
        questions.push("Should I set up payment terms for this customer?")
        break
    }

    return questions
  }

  private canAutoExecute(intent: BusinessIntent, context: ConversationContext): boolean {
    // Define rules for when actions can be auto-executed
    const autoExecutableActions = ['generate_report', 'send_notification']
    const userRole = context.businessContext.userRole
    
    return userRole === 'admin' && intent.confidence > 0.95 && 
           autoExecutableActions.some(action => intent.action.includes(action))
  }

  private generateResponseMessage(intent: BusinessIntent, entities: ExtractedEntity[], actionResults: ActionResult[]): string {
    if (actionResults.length === 0) {
      // No actions executed - provide helpful response
      switch (intent.category) {
        case 'financial_transaction':
          return "I understand you want to work with financial transactions. To help you better, could you provide more specific details like amounts, dates, or customer names?"
        
        case 'invoice_processing':
          return "I'm ready to help with invoice processing! You can upload an invoice image, or tell me the details to create a new invoice."
        
        case 'reporting_analytics':
          return "I can generate various reports for you. What specific financial data would you like to see?"
        
        default:
          return "I'm here to help with your business operations. Could you provide more details about what you'd like to accomplish?"
      }
    }

    // Actions were executed - provide confirmation
    const successfulActions = actionResults.filter(r => r.success)
    const failedActions = actionResults.filter(r => !r.success)

    let message = ""
    
    if (successfulActions.length > 0) {
      message += `✅ Successfully completed ${successfulActions.length} action${successfulActions.length > 1 ? 's' : ''}:\n`
      successfulActions.forEach(action => {
        message += `• ${action.message}\n`
      })
    }

    if (failedActions.length > 0) {
      message += `❌ ${failedActions.length} action${failedActions.length > 1 ? 's' : ''} failed:\n`
      failedActions.forEach(action => {
        message += `• ${action.message}\n`
      })
    }

    return message.trim()
  }

  private async executeFinancialTransaction(intent: BusinessIntent): Promise<ActionResult> {
    // Demo implementation
    return {
      actionId: intent.category,
      success: true,
      message: "Financial transaction recorded successfully",
      transactionId: this.generateId()
    }
  }

  private async executeInvoiceProcessing(intent: BusinessIntent): Promise<ActionResult> {
    // Demo implementation
    return {
      actionId: intent.category,
      success: true,
      message: "Invoice processed successfully",
      transactionId: this.generateId()
    }
  }

  private async executeCustomerManagement(intent: BusinessIntent): Promise<ActionResult> {
    // Demo implementation
    return {
      actionId: intent.category,
      success: true,
      message: "Customer information updated successfully"
    }
  }

  private async executeInventoryManagement(intent: BusinessIntent): Promise<ActionResult> {
    // Demo implementation
    return {
      actionId: intent.category,
      success: true,
      message: "Inventory updated successfully"
    }
  }

  private async executeReportingAnalytics(intent: BusinessIntent): Promise<ActionResult> {
    // Demo implementation for cash flow report
    if (intent.action === 'cash_flow_report') {
      return {
        actionId: intent.category,
        success: true,
        message: "Cash flow report generated",
        data: {
          currentCash: 156750,
          monthlyChange: 21750,
          upcomingPayments: 25000,
          forecastNext30Days: 67000
        }
      }
    }

    return {
      actionId: intent.category,
      success: true,
      message: "Report generated successfully"
    }
  }

  private normalizeDate(dateStr: string): string {
    // Simple date normalization
    const now = new Date()
    
    switch (dateStr.toLowerCase()) {
      case 'today':
        return now.toISOString().split('T')[0]
      case 'tomorrow':
        const tomorrow = new Date(now)
        tomorrow.setDate(now.getDate() + 1)
        return tomorrow.toISOString().split('T')[0]
      case 'yesterday':
        const yesterday = new Date(now)
        yesterday.setDate(now.getDate() - 1)
        return yesterday.toISOString().split('T')[0]
      default:
        return dateStr
    }
  }

  private formalizeLanguage(content: string): string {
    return content
      .replace(/I'll/g, 'I will')
      .replace(/you're/g, 'you are')
      .replace(/can't/g, 'cannot')
      .replace(/won't/g, 'will not')
  }

  private casualizeLanguage(content: string): string {
    return content
      .replace(/I will/g, "I'll")
      .replace(/you are/g, "you're")
      .replace(/cannot/g, "can't")
  }

  private shortenResponse(content: string): string {
    const sentences = content.split('. ')
    return sentences.slice(0, 2).join('. ') + (sentences.length > 2 ? '.' : '')
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9)
  }
}

/**
 * Voice Capabilities Implementation
 */
export class HeraVoiceCapabilities implements VoiceCapabilities {
  private recognition: SpeechRecognition | null = null
  private synthesis: SpeechSynthesis | null = null
  public conversationMode = false

  constructor() {
    this.initializeSpeechRecognition()
    this.initializeSpeechSynthesis()
  }

  async speechToText(audio: Blob): Promise<SpeechResult> {
    return new Promise((resolve, reject) => {
      if (!this.recognition) {
        reject(new Error('Speech recognition not available'))
        return
      }

      this.recognition.onresult = (event) => {
        const result = event.results[0]
        resolve({
          transcript: result[0].transcript,
          confidence: result[0].confidence,
          language: 'en-US',
          duration: 0,
          isFinal: result.isFinal,
          alternatives: Array.from(result).map(alt => alt.transcript)
        })
      }

      this.recognition.onerror = (event) => {
        reject(new Error(`Speech recognition error: ${event.error}`))
      }

      this.recognition.start()
    })
  }

  async textToSpeech(text: string, options?: TTSOptions): Promise<AudioBuffer> {
    return new Promise((resolve, reject) => {
      if (!this.synthesis) {
        reject(new Error('Speech synthesis not available'))
        return
      }

      const utterance = new SpeechSynthesisUtterance(text)
      
      if (options) {
        utterance.rate = options.rate || 1
        utterance.pitch = options.pitch || 1
        utterance.volume = options.volume || 1
        utterance.lang = options.language || 'en-US'
      }

      utterance.onend = () => {
        // Return empty AudioBuffer for demo
        resolve(new AudioBuffer({ length: 0, numberOfChannels: 1, sampleRate: 44100 }))
      }

      utterance.onerror = (event) => {
        reject(new Error(`Speech synthesis error: ${event.error}`))
      }

      this.synthesis.speak(utterance)
    })
  }

  async voiceCommands(audio: Blob) {
    const speechResult = await this.speechToText(audio)
    
    // Simple command parsing
    const commands = {
      'show dashboard': { command: 'navigate', intent: { category: 'system_configuration', action: 'show_dashboard' } },
      'create invoice': { command: 'action', intent: { category: 'invoice_processing', action: 'create_invoice' } },
      'check cash flow': { command: 'report', intent: { category: 'reporting_analytics', action: 'cash_flow_report' } }
    }

    const matchedCommand = Object.entries(commands).find(([phrase]) => 
      speechResult.transcript.toLowerCase().includes(phrase)
    )

    if (matchedCommand) {
      return {
        command: matchedCommand[1].command,
        intent: matchedCommand[1].intent as any,
        confidence: speechResult.confidence,
        parameters: {}
      }
    }

    return {
      command: 'unknown',
      intent: { category: 'system_configuration', action: 'clarify_intent' } as any,
      confidence: 0.3,
      parameters: { originalTranscript: speechResult.transcript }
    }
  }

  private initializeSpeechRecognition(): void {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      this.recognition = new (window as any).webkitSpeechRecognition()
      this.recognition.continuous = false
      this.recognition.interimResults = false
      this.recognition.lang = 'en-US'
    } else if (typeof window !== 'undefined' && 'SpeechRecognition' in window) {
      this.recognition = new SpeechRecognition()
      this.recognition.continuous = false
      this.recognition.interimResults = false
      this.recognition.lang = 'en-US'
    }
  }

  private initializeSpeechSynthesis(): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synthesis = window.speechSynthesis
    }
  }
}

/**
 * Document Processing Implementation
 */
export class HeraDocumentProcessing implements DocumentProcessing {
  async ocrExtract(image: File): Promise<OCRResult> {
    // Demo implementation - in production, integrate with OCR service
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          text: "INVOICE\nABC Company\nAmount: $347.82\nDate: 2025-01-08\nInvoice #: INV-2025-001",
          confidence: 0.95,
          layout: {
            pages: 1,
            regions: [
              {
                type: 'header',
                bounds: { x: 0, y: 0, width: 100, height: 20 },
                confidence: 0.98,
                text: 'INVOICE'
              }
            ]
          },
          extractedData: {
            vendor: 'ABC Company',
            amount: 347.82,
            date: '2025-01-08',
            invoiceNumber: 'INV-2025-001'
          },
          processingTime: 1500
        })
      }, 1500)
    })
  }

  async aiAnalysis(document: any) {
    // Demo implementation
    return {
      businessImpact: {
        financialImpact: {
          amount: 347.82,
          currency: 'USD',
          accounts: ['Accounts Payable', 'Office Expenses']
        }
      },
      recommendations: [
        'Verify vendor information in master data',
        'Check if this expense requires approval',
        'Consider setting up automated processing for this vendor'
      ],
      extractedActions: [],
      risks: [],
      compliance: []
    }
  }

  async classification(document: any) {
    // Demo implementation
    return {
      type: 'invoice' as const,
      confidence: 0.95,
      subtype: 'vendor_invoice',
      properties: {
        hasLineItems: true,
        hasTaxInfo: true,
        requiresApproval: false
      }
    }
  }

  async validation(extracted: any): Promise<ValidationResult> {
    // Demo implementation
    return {
      isValid: true,
      score: 0.95,
      errors: [],
      warnings: [],
      suggestions: ['Consider adding expense category']
    }
  }
}

// Export singleton instances
export const conversationEngine = new HeraConversationEngine()
export const voiceCapabilities = new HeraVoiceCapabilities()
export const documentProcessing = new HeraDocumentProcessing()