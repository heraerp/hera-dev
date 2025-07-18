import { UniversalTransaction } from './posAccountingBridge'
import { Order } from './posEventPublisher'

export interface TransactionClassification {
  transactionType: string
  confidence: number
  accountMapping: AccountMapping
  suggestedJournalEntries: JournalEntry[]
  riskFactors: RiskFactor[]
  reviewRequired: boolean
  classificationReasons: string[]
}

export interface AccountMapping {
  revenueAccount: string
  cashAccount: string
  taxAccount: string
  discountAccount?: string
  serviceChargeAccount?: string
}

export interface JournalEntry {
  accountCode: string
  accountName: string
  debit: number
  credit: number
  description: string
}

export interface RiskFactor {
  type: 'amount' | 'time' | 'frequency' | 'pattern' | 'customer'
  severity: 'low' | 'medium' | 'high'
  description: string
  score: number
}

export interface TransactionFeatures {
  amount: number
  paymentMethod: string
  itemCategories: string[]
  timeOfDay: number
  dayOfWeek: number
  customerType: string
  location: string
  staffMember?: string
  itemCount: number
  averageItemPrice: number
  hasDiscounts: boolean
  hasServiceCharges: boolean
  taxAmount: number
  taxRate: number
}

export class TransactionClassificationAI {
  private organizationId: string
  private isInitialized = false
  private patterns: any[] = []
  private accountMappings: Record<string, string> = {}

  async initialize(organizationId: string): Promise<void> {
    this.organizationId = organizationId
    await this.loadPatterns()
    await this.loadAccountMappings()
    this.isInitialized = true
    console.log('✅ Transaction Classification AI initialized')
  }

  async classifyTransaction(transaction: UniversalTransaction): Promise<TransactionClassification> {
    if (!this.isInitialized) {
      throw new Error('Transaction Classification AI not initialized')
    }

    console.log('🧠 Classifying transaction:', transaction.transaction_number)

    try {
      // Extract features from transaction
      const features = this.extractFeatures(transaction)
      
      // Perform AI analysis
      const analysis = await this.analyzeTransaction(features)
      
      // Generate account mapping
      const accountMapping = this.generateAccountMapping(features, analysis)
      
      // Create suggested journal entries
      const journalEntries = this.generateJournalEntries(transaction, accountMapping)
      
      // Identify risk factors
      const riskFactors = this.identifyRiskFactors(features, analysis)
      
      // Calculate confidence score
      const confidence = this.calculateConfidence(features, analysis, riskFactors)
      
      // Determine if review is required
      const reviewRequired = confidence < 0.85 || riskFactors.some(rf => rf.severity === 'high')
      
      return {
        transactionType: analysis.primaryType,
        confidence,
        accountMapping,
        suggestedJournalEntries: journalEntries,
        riskFactors,
        reviewRequired,
        classificationReasons: analysis.reasons
      }

    } catch (error) {
      console.error('❌ Error classifying transaction:', error)
      
      // Return default classification with low confidence
      return {
        transactionType: 'SALES_ORDER',
        confidence: 0.60,
        accountMapping: this.getDefaultAccountMapping(),
        suggestedJournalEntries: [],
        riskFactors: [{
          type: 'pattern',
          severity: 'medium',
          description: 'Classification AI error - requires manual review',
          score: 0.5
        }],
        reviewRequired: true,
        classificationReasons: ['AI classification failed - using defaults']
      }
    }
  }

  private extractFeatures(transaction: UniversalTransaction): TransactionFeatures {
    const transactionData = transaction.transaction_data
    
    return {
      amount: transaction.total_amount,
      paymentMethod: transactionData.payment?.method || 'cash',
      itemCategories: transactionData.items?.map((item: any) => item.category) || [],
      timeOfDay: new Date(transaction.transaction_date).getHours(),
      dayOfWeek: new Date(transaction.transaction_date).getDay(),
      customerType: transactionData.customer_name ? 'regular' : 'walk_in',
      location: transactionData.restaurant?.location || 'main',
      staffMember: transactionData.staff_member?.id,
      itemCount: transactionData.items?.length || 0,
      averageItemPrice: transactionData.items?.length > 0 
        ? transactionData.subtotal / transactionData.items.length 
        : 0,
      hasDiscounts: (transactionData.discounts || 0) > 0,
      hasServiceCharges: (transactionData.service_charges || 0) > 0,
      taxAmount: transactionData.taxes || 0,
      taxRate: transactionData.taxes ? (transactionData.taxes / transactionData.subtotal) * 100 : 0
    }
  }

  private async analyzeTransaction(features: TransactionFeatures): Promise<any> {
    // Simulate AI analysis based on features
    const analysis = {
      primaryType: 'SALES_ORDER',
      subType: this.determineSubType(features),
      confidence: 0.85,
      reasons: []
    }

    // Analysis based on amount
    if (features.amount > 1000) {
      analysis.reasons.push('Large transaction amount detected')
      analysis.confidence *= 0.95
    }

    // Analysis based on payment method
    if (features.paymentMethod === 'cash' && features.amount > 500) {
      analysis.reasons.push('Large cash payment - higher scrutiny')
      analysis.confidence *= 0.90
    }

    // Analysis based on time
    if (features.timeOfDay < 6 || features.timeOfDay > 23) {
      analysis.reasons.push('Unusual transaction time')
      analysis.confidence *= 0.85
    }

    // Analysis based on items
    if (features.itemCount > 20) {
      analysis.reasons.push('Large order - catering or group')
      analysis.confidence *= 0.95
    }

    // Analysis based on discounts
    if (features.hasDiscounts) {
      analysis.reasons.push('Discount applied - verify authorization')
      analysis.confidence *= 0.90
    }

    // Pattern matching against historical data
    const patternMatch = this.matchPatterns(features)
    if (patternMatch.confidence > 0.8) {
      analysis.reasons.push(`Pattern matched: ${patternMatch.description}`)
      analysis.confidence = Math.max(analysis.confidence, patternMatch.confidence)
    }

    return analysis
  }

  private determineSubType(features: TransactionFeatures): string {
    if (features.itemCategories.includes('delivery')) {
      return 'DELIVERY_ORDER'
    }
    
    if (features.itemCount > 15) {
      return 'CATERING_ORDER'
    }
    
    if (features.itemCategories.includes('takeaway')) {
      return 'TAKEAWAY_ORDER'
    }
    
    return 'DINE_IN_ORDER'
  }

  private generateAccountMapping(features: TransactionFeatures, analysis: any): AccountMapping {
    const mapping: AccountMapping = {
      revenueAccount: this.getRevenueAccount(features),
      cashAccount: this.getCashAccount(features.paymentMethod),
      taxAccount: this.getTaxAccount(features.taxRate),
    }

    if (features.hasDiscounts) {
      mapping.discountAccount = this.accountMappings.discount_account || '5110000'
    }

    if (features.hasServiceCharges) {
      mapping.serviceChargeAccount = this.accountMappings.service_charge_account || '4140000'
    }

    return mapping
  }

  private generateJournalEntries(transaction: UniversalTransaction, mapping: AccountMapping): JournalEntry[] {
    const entries: JournalEntry[] = []
    const data = transaction.transaction_data

    // Cash/Payment Method (Debit)
    entries.push({
      accountCode: mapping.cashAccount,
      accountName: this.getCashAccountName(data.payment?.method || 'cash'),
      debit: transaction.total_amount,
      credit: 0,
      description: `Payment via ${data.payment?.method || 'cash'}`
    })

    // Revenue (Credit)
    entries.push({
      accountCode: mapping.revenueAccount,
      accountName: 'Food & Beverage Sales',
      debit: 0,
      credit: data.subtotal,
      description: 'Sale of food and beverages'
    })

    // Tax (Credit)
    if (data.taxes > 0) {
      entries.push({
        accountCode: mapping.taxAccount,
        accountName: 'Sales Tax Payable',
        debit: 0,
        credit: data.taxes,
        description: 'Sales tax collected'
      })
    }

    // Discounts (Debit)
    if (data.discounts > 0 && mapping.discountAccount) {
      entries.push({
        accountCode: mapping.discountAccount,
        accountName: 'Sales Discounts',
        debit: data.discounts,
        credit: 0,
        description: 'Discount given to customer'
      })
    }

    // Service Charges (Credit)
    if (data.service_charges > 0 && mapping.serviceChargeAccount) {
      entries.push({
        accountCode: mapping.serviceChargeAccount,
        accountName: 'Service Charges',
        debit: 0,
        credit: data.service_charges,
        description: 'Service charge collected'
      })
    }

    return entries
  }

  private identifyRiskFactors(features: TransactionFeatures, analysis: any): RiskFactor[] {
    const risks: RiskFactor[] = []

    // Large amount risk
    if (features.amount > 5000) {
      risks.push({
        type: 'amount',
        severity: 'high',
        description: 'Very large transaction amount',
        score: 0.8
      })
    } else if (features.amount > 1000) {
      risks.push({
        type: 'amount',
        severity: 'medium',
        description: 'Large transaction amount',
        score: 0.5
      })
    }

    // Time-based risk
    if (features.timeOfDay < 6 || features.timeOfDay > 23) {
      risks.push({
        type: 'time',
        severity: 'medium',
        description: 'Transaction outside normal hours',
        score: 0.6
      })
    }

    // Large cash payment risk
    if (features.paymentMethod === 'cash' && features.amount > 500) {
      risks.push({
        type: 'pattern',
        severity: 'medium',
        description: 'Large cash payment',
        score: 0.5
      })
    }

    // Unusual discount risk
    if (features.hasDiscounts && (features.amount * 0.2) < (features.amount - (features.amount * 0.8))) {
      risks.push({
        type: 'pattern',
        severity: 'high',
        description: 'Unusually large discount percentage',
        score: 0.7
      })
    }

    return risks
  }

  private calculateConfidence(features: TransactionFeatures, analysis: any, risks: RiskFactor[]): number {
    let confidence = analysis.confidence

    // Reduce confidence based on risk factors
    for (const risk of risks) {
      if (risk.severity === 'high') {
        confidence *= 0.85
      } else if (risk.severity === 'medium') {
        confidence *= 0.95
      }
    }

    // Increase confidence for common patterns
    if (features.amount < 100 && features.paymentMethod === 'cash') {
      confidence *= 1.05
    }

    if (features.timeOfDay >= 11 && features.timeOfDay <= 22) {
      confidence *= 1.02
    }

    return Math.max(0.6, Math.min(0.99, confidence))
  }

  private matchPatterns(features: TransactionFeatures): { confidence: number; description: string } {
    // Simple pattern matching - in production, this would use ML models
    for (const pattern of this.patterns) {
      if (this.featuresMatchPattern(features, pattern)) {
        return {
          confidence: pattern.confidence || 0.85,
          description: pattern.description || 'Historical pattern match'
        }
      }
    }

    return { confidence: 0.7, description: 'No specific pattern matched' }
  }

  private featuresMatchPattern(features: TransactionFeatures, pattern: any): boolean {
    // Simple pattern matching logic
    if (pattern.amount_range) {
      if (features.amount < pattern.amount_range.min || features.amount > pattern.amount_range.max) {
        return false
      }
    }

    if (pattern.time_range) {
      if (features.timeOfDay < pattern.time_range.start || features.timeOfDay > pattern.time_range.end) {
        return false
      }
    }

    if (pattern.payment_method && pattern.payment_method !== features.paymentMethod) {
      return false
    }

    return true
  }

  private async loadPatterns(): Promise<void> {
    // Load patterns from database or configuration
    this.patterns = [
      {
        description: 'Lunch hour regular order',
        amount_range: { min: 20, max: 200 },
        time_range: { start: 11, end: 14 },
        confidence: 0.95
      },
      {
        description: 'Dinner order',
        amount_range: { min: 50, max: 500 },
        time_range: { start: 18, end: 22 },
        confidence: 0.92
      },
      {
        description: 'Large group/catering order',
        amount_range: { min: 500, max: 5000 },
        confidence: 0.88
      }
    ]
  }

  private async loadAccountMappings(): Promise<void> {
    // Load account mappings from configuration
    this.accountMappings = {
      cash_account: '1110000',
      revenue_account: '4110000',
      tax_account: '2110001',
      discount_account: '5110000',
      service_charge_account: '4140000',
      credit_card_account: '1120000',
      upi_account: '1121000'
    }
  }

  private getRevenueAccount(features: TransactionFeatures): string {
    // Determine revenue account based on item categories
    if (features.itemCategories.includes('beverage')) {
      return '4120000' // Beverage Sales
    }
    
    return this.accountMappings.revenue_account || '4110000' // Food Sales
  }

  private getCashAccount(paymentMethod: string): string {
    const mapping = {
      'cash': '1110000',
      'credit_card': '1120000',
      'debit_card': '1120001',
      'upi': '1121000',
      'digital_wallet': '1122000'
    }

    return mapping[paymentMethod] || '1110000'
  }

  private getCashAccountName(paymentMethod: string): string {
    const mapping = {
      'cash': 'Cash in Hand',
      'credit_card': 'Credit Card Receivable',
      'debit_card': 'Debit Card Receivable',
      'upi': 'UPI Collections',
      'digital_wallet': 'Digital Wallet'
    }

    return mapping[paymentMethod] || 'Cash in Hand'
  }

  private getTaxAccount(taxRate: number): string {
    if (taxRate > 15) {
      return '2110001' // CGST + SGST
    }
    
    return '2110003' // IGST
  }

  private getDefaultAccountMapping(): AccountMapping {
    return {
      revenueAccount: '4110000',
      cashAccount: '1110000',
      taxAccount: '2110001'
    }
  }
}

export default TransactionClassificationAI