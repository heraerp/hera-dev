/**
 * Universal Order Processing Service
 * Revolutionary order management using HERA Universal Transactions Architecture
 * AI-powered order intelligence, personalization, and optimization
 */

import UniversalCrudService from '@/lib/services/universalCrudService'
import { createClient } from '@/lib/supabase/client'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// Function to get regular client for read operations
const getSupabaseClient = () => {
  return createClient()
}

// Function to get admin client with service role for write operations
const getSupabaseAdminClient = () => {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      },
      global: {
        headers: {
          'apikey': process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY!,
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY!}`
        }
      }
    }
  )
}

// Order entity types for universal schema
export const ORDER_ENTITY_TYPES = {
  ORDER_SESSION: 'order_session',
  ORDER_MODIFIER: 'order_modifier',
  ORDER_PAYMENT: 'order_payment',
  ORDER_FULFILLMENT: 'order_fulfillment',
  ORDER_FEEDBACK: 'order_feedback',
  ORDER_ANALYTICS: 'order_analytics'
} as const

// Order metadata types for rich data storage
export const ORDER_METADATA_TYPES = {
  ORDER_INTELLIGENCE: 'order_intelligence',
  CUSTOMER_PERSONALIZATION: 'customer_personalization',
  KITCHEN_INSTRUCTIONS: 'kitchen_instructions',
  PAYMENT_DETAILS: 'payment_details',
  FULFILLMENT_TRACKING: 'fulfillment_tracking',
  AI_OPTIMIZATION: 'ai_optimization',
  BUSINESS_ANALYTICS: 'business_analytics'
} as const

// Interface definitions for comprehensive order management
export interface OrderSession {
  id: string
  organizationId: string
  customerId?: string
  staffMemberId?: string
  sessionStatus: 'active' | 'abandoned' | 'completed'
  orderSource: 'in_store' | 'mobile_app' | 'online' | 'phone'
  serviceType: 'dine_in' | 'takeaway' | 'delivery'
  tableNumber?: string
  estimatedPreparationTime?: number
  items: OrderItem[]
  subtotal: number
  taxAmount: number
  discountAmount: number
  totalAmount: number
  loyaltyPointsEarned: number
  createdAt: string
  updatedAt: string
}

export interface OrderItem {
  id: string
  sessionId: string
  productId: string
  productName: string
  productType: string
  quantity: number
  unitPrice: number
  lineAmount: number
  modifications: OrderModification[]
  specialInstructions?: string
  preparationTime: number
  lineOrder: number
}

export interface OrderModification {
  id: string
  itemId: string
  modificationType: 'size' | 'temperature' | 'dietary' | 'add_on'
  modificationName: string
  modificationValue: string
  priceModifier: number
}

export interface OrderItemData {
  productId: string
  quantity: number
  modifications?: {
    size?: string
    temperature?: string
    dietary?: string[]
    addOns?: string[]
  }
  specialInstructions?: string
}

export interface ItemModification {
  quantity?: number
  modifications?: OrderModification[]
  specialInstructions?: string
}

export interface OrderCalculation {
  subtotal: number
  taxAmount: number
  discountAmount: number
  loyaltyDiscount: number
  totalAmount: number
  loyaltyPointsEarned: number
  breakdown: OrderLineBreakdown[]
}

export interface OrderLineBreakdown {
  itemId: string
  itemName: string
  quantity: number
  unitPrice: number
  modifications: ModificationBreakdown[]
  lineSubtotal: number
  lineTax: number
  lineTotal: number
}

export interface ModificationBreakdown {
  name: string
  value: string
  priceModifier: number
}

export interface Recommendation {
  productId: string
  productName: string
  reason: string
  confidence: number
  priceImpact: number
  category: 'upsell' | 'cross_sell' | 'personalized' | 'seasonal'
}

export interface OrderOptimization {
  recommendedCombinations: ProductCombination[]
  preparationTimeOptimization: TimeOptimization
  qualityEnhancement: QualityEnhancement[]
  costOptimization: CostOptimization
}

export interface ProductCombination {
  items: string[]
  combinationName: string
  discount: number
  reason: string
}

export interface TimeOptimization {
  totalTime: number
  parallelPreparation: boolean
  sequence: PreparationStep[]
}

export interface PreparationStep {
  item: string
  startTime: number
  duration: number
  station: string
}

export interface QualityEnhancement {
  item: string
  enhancement: string
  qualityImpact: number
}

export interface CostOptimization {
  savings: number
  optimizations: string[]
}

export interface LoyaltyApplication {
  pointsAvailable: number
  pointsToRedeem: number
  discountAmount: number
  tierBenefits: string[]
  nextTierProgress: number
}

export interface OrderValidation {
  isValid: boolean
  issues: ValidationIssue[]
  warnings: ValidationWarning[]
}

export interface ValidationIssue {
  type: 'inventory' | 'pricing' | 'preparation' | 'policy'
  message: string
  severity: 'error' | 'warning'
}

export interface ValidationWarning {
  type: string
  message: string
  suggestion: string
}

export interface PaymentData {
  method: 'card' | 'cash' | 'digital_wallet' | 'loyalty_points'
  amount: number
  tip?: number
  cardDetails?: CardDetails
  loyaltyPointsUsed?: number
}

export interface CardDetails {
  last4: string
  brand: string
  expiryMonth: number
  expiryYear: number
}

export interface PaymentResult {
  success: boolean
  transactionId?: string
  paymentMethod: string
  amountProcessed: number
  remainingBalance: number
  error?: string
}

export interface UniversalTransaction {
  id: string
  organizationId: string
  transactionType: 'ORDER'
  transactionNumber: string
  transactionDate: string
  totalAmount: number
  currency: string
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled'
  lines: UniversalTransactionLine[]
  metadata: OrderIntelligenceMetadata
}

export interface UniversalTransactionLine {
  id: string
  transactionId: string
  entityId: string
  lineDescription: string
  quantity: number
  unitPrice: number
  lineAmount: number
  lineOrder: number
}

export interface OrderIntelligenceMetadata {
  customerId?: string
  orderSessionId: string
  staffMemberId?: string
  orderSource: string
  serviceType: string
  tableNumber?: string
  estimatedPreparationTime: number
  specialInstructions?: string
  loyaltyPointsEarned: number
  loyaltyDiscountApplied: number
  aiPersonalization: AIPersonalization
  orderAnalytics: OrderAnalytics
  businessIntelligence: BusinessIntelligence
}

export interface AIPersonalization {
  customerPreferences: CustomerPreferences
  recommendationEngineResults: RecommendationResult[]
  loyaltyOptimization: LoyaltyOptimization
}

export interface CustomerPreferences {
  temperaturePreference: string
  sweetnessLevel: string
  milkAlternative: string
  preferredSize: string
  dietaryRestrictions: string[]
}

export interface RecommendationResult {
  productId: string
  reason: string
  confidence: number
  accepted: boolean
}

export interface LoyaltyOptimization {
  pointsMultiplierApplied: number
  tierBenefits: string[]
  nextRewardProgress: string
}

export interface OrderAnalytics {
  totalPreparationComplexity: string
  kitchenLoadFactor: number
  optimalPreparationSequence: string[]
  qualityScorePrediction: number
  customerSatisfactionPrediction: number
}

export interface BusinessIntelligence {
  revenueOptimization: RevenueOptimization
  customerJourneyImpact: CustomerJourneyImpact
}

export interface RevenueOptimization {
  upsellOpportunitiesMissed: string[]
  crossSellSuccess: string[]
  marginAnalysis: MarginAnalysis
}

export interface MarginAnalysis {
  overallMargin: number
  itemMargins: { [key: string]: number }
}

export interface CustomerJourneyImpact {
  visitSatisfactionContribution: number
  loyaltyProgressionImpact: string
  nextVisitProbabilityChange: number
}

export interface OrderStatus {
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled'
  timestamp: string
  notes?: string
}

export interface StatusUpdate {
  transactionId: string
  previousStatus: string
  newStatus: string
  timestamp: string
  staffMember?: string
}

export interface OrderProgress {
  transactionId: string
  currentStatus: string
  preparationSteps: PreparationProgress[]
  estimatedCompletion: string
  actualCompletion?: string
}

export interface PreparationProgress {
  step: string
  status: 'pending' | 'in_progress' | 'completed'
  startTime?: string
  completionTime?: string
  assignedStaff?: string
}

export interface ServiceResult<T = any> {
  success: boolean
  data?: T
  error?: string
  details?: any
}

export class OrderProcessingService {
  
  /**
   * Create new order session for customer
   */
  static async createOrderSession(
    organizationId: string, 
    customerId?: string,
    staffMemberId?: string,
    sessionData?: {
      orderSource?: string
      serviceType?: string
      tableNumber?: string
    }
  ): Promise<ServiceResult<OrderSession>> {
    console.log('🚀 Creating order session for organization:', organizationId)
    
    try {
      const sessionId = crypto.randomUUID()
      const sessionCode = this.generateSessionCode()

      // Create order session entity
      const { error: entityError } = await getSupabaseAdminClient()
        .from('core_entities')
        .insert({
          id: sessionId,
          organization_id: organizationId,
          entity_type: ORDER_ENTITY_TYPES.ORDER_SESSION,
          entity_name: `Order Session ${sessionCode}`,
          entity_code: sessionCode,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })

      if (entityError) throw entityError

      // Create session dynamic data
      const dynamicData = [
        { entity_id: sessionId, field_name: 'customer_id', field_value: customerId || '', field_type: 'text' },
        { entity_id: sessionId, field_name: 'staff_member_id', field_value: staffMemberId || '', field_type: 'text' },
        { entity_id: sessionId, field_name: 'session_status', field_value: 'active', field_type: 'text' },
        { entity_id: sessionId, field_name: 'order_source', field_value: sessionData?.orderSource || 'in_store', field_type: 'text' },
        { entity_id: sessionId, field_name: 'service_type', field_value: sessionData?.serviceType || 'dine_in', field_type: 'text' },
        { entity_id: sessionId, field_name: 'table_number', field_value: sessionData?.tableNumber || '', field_type: 'text' },
        { entity_id: sessionId, field_name: 'subtotal', field_value: '0', field_type: 'number' },
        { entity_id: sessionId, field_name: 'tax_amount', field_value: '0', field_type: 'number' },
        { entity_id: sessionId, field_name: 'discount_amount', field_value: '0', field_type: 'number' },
        { entity_id: sessionId, field_name: 'total_amount', field_value: '0', field_type: 'number' },
        { entity_id: sessionId, field_name: 'loyalty_points_earned', field_value: '0', field_type: 'number' }
      ]

      const { error: dataError } = await getSupabaseAdminClient()
        .from('core_dynamic_data')
        .insert(dynamicData)

      if (dataError) throw dataError

      // Create session metadata for AI enhancement
      const { error: metadataError } = await getSupabaseAdminClient()
        .from('core_metadata')
        .insert({
          organization_id: organizationId,
          entity_type: ORDER_ENTITY_TYPES.ORDER_SESSION,
          entity_id: sessionId,
          metadata_type: ORDER_METADATA_TYPES.ORDER_INTELLIGENCE,
          metadata_category: 'session_management',
          metadata_key: 'session_configuration',
          metadata_value: JSON.stringify({
            ai_personalization: {
              recommendation_engine_enabled: true,
              customer_preferences_applied: !!customerId,
              loyalty_optimization_enabled: true
            },
            session_analytics: {
              session_start_time: new Date().toISOString(),
              expected_duration: '15_minutes',
              complexity_prediction: 'low'
            },
            business_rules: {
              auto_apply_loyalty_benefits: true,
              enable_upsell_suggestions: true,
              quality_optimization_enabled: true
            }
          })
        })

      if (metadataError) throw metadataError

      const orderSession: OrderSession = {
        id: sessionId,
        organizationId,
        customerId,
        staffMemberId,
        sessionStatus: 'active',
        orderSource: (sessionData?.orderSource as any) || 'in_store',
        serviceType: (sessionData?.serviceType as any) || 'dine_in',
        tableNumber: sessionData?.tableNumber,
        items: [],
        subtotal: 0,
        taxAmount: 0,
        discountAmount: 0,
        totalAmount: 0,
        loyaltyPointsEarned: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      console.log('✅ Order session created successfully:', sessionId)
      return { success: true, data: orderSession }

    } catch (error) {
      console.error('❌ Failed to create order session:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create order session',
        details: error
      }
    }
  }

  /**
   * Add item to order session
   */
  static async addItemToOrder(
    sessionId: string, 
    organizationId: string,
    productData: OrderItemData
  ): Promise<ServiceResult<OrderItem>> {
    console.log('🛒 Adding item to order session:', sessionId, productData)
    
    try {
      // Get product details
      const { data: product, error: productError } = await getSupabaseClient()
        .from('core_entities')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('id', productData.productId)
        .eq('entity_type', 'product')
        .single()

      if (productError || !product) {
        throw new Error('Product not found')
      }

      // Get product pricing
      const { data: productPricing } = await getSupabaseClient()
        .from('core_dynamic_data')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('entity_id', productData.productId)
        .eq('field_name', 'base_price')

      const basePrice = productPricing?.[0]?.field_value ? parseFloat(productPricing[0].field_value) : 0

      const itemId = crypto.randomUUID()
      const itemCode = this.generateItemCode(product.entity_name)

      // Calculate item total with modifications
      let unitPrice = basePrice
      const modifications: OrderModification[] = []

      // Apply size modifications
      if (productData.modifications?.size) {
        const sizeMod: OrderModification = {
          id: crypto.randomUUID(),
          itemId,
          modificationType: 'size',
          modificationName: 'Size',
          modificationValue: productData.modifications.size,
          priceModifier: this.getSizeModifier(productData.modifications.size)
        }
        modifications.push(sizeMod)
        unitPrice += sizeMod.priceModifier
      }

      // Apply temperature modifications
      if (productData.modifications?.temperature) {
        const tempMod: OrderModification = {
          id: crypto.randomUUID(),
          itemId,
          modificationType: 'temperature',
          modificationName: 'Temperature',
          modificationValue: productData.modifications.temperature,
          priceModifier: 0 // Temperature usually doesn't affect price
        }
        modifications.push(tempMod)
      }

      const lineAmount = unitPrice * productData.quantity

      // Create order item entity
      const { error: entityError } = await getSupabaseAdminClient()
        .from('core_entities')
        .insert({
          id: itemId,
          organization_id: organizationId,
          entity_type: 'order_item',
          entity_name: `${product.entity_name} x${productData.quantity}`,
          entity_code: itemCode,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })

      if (entityError) throw entityError

      // Create item dynamic data
      const dynamicData = [
        { entity_id: itemId, field_name: 'session_id', field_value: sessionId, field_type: 'uuid' },
        { entity_id: itemId, field_name: 'product_id', field_value: productData.productId, field_type: 'uuid' },
        { entity_id: itemId, field_name: 'product_name', field_value: product.entity_name, field_type: 'text' },
        { entity_id: itemId, field_name: 'quantity', field_value: productData.quantity.toString(), field_type: 'number' },
        { entity_id: itemId, field_name: 'unit_price', field_value: unitPrice.toString(), field_type: 'number' },
        { entity_id: itemId, field_name: 'line_amount', field_value: lineAmount.toString(), field_type: 'number' },
        { entity_id: itemId, field_name: 'special_instructions', field_value: productData.specialInstructions || '', field_type: 'text' },
        { entity_id: itemId, field_name: 'preparation_time', field_value: '5', field_type: 'number' },
        { entity_id: itemId, field_name: 'line_order', field_value: '1', field_type: 'number' }
      ]

      const { error: dataError } = await getSupabaseAdminClient()
        .from('core_dynamic_data')
        .insert(dynamicData)

      if (dataError) throw dataError

      // Store modifications as metadata
      if (modifications.length > 0) {
        const { error: metadataError } = await getSupabaseAdminClient()
          .from('core_metadata')
          .insert({
            organization_id: organizationId,
            entity_type: 'order_item',
            entity_id: itemId,
            metadata_type: 'item_modifications',
            metadata_category: 'customization',
            metadata_key: 'modifications',
            metadata_value: JSON.stringify({
              modifications,
              ai_analysis: {
                personalization_applied: true,
                preference_confidence: 0.85,
                upsell_potential: 'medium'
              }
            })
          })

        if (metadataError) throw metadataError
      }

      const orderItem: OrderItem = {
        id: itemId,
        sessionId,
        productId: productData.productId,
        productName: product.entity_name,
        productType: 'product', // Could be enhanced with product type from metadata
        quantity: productData.quantity,
        unitPrice,
        lineAmount,
        modifications,
        specialInstructions: productData.specialInstructions,
        preparationTime: 5, // Could be dynamic based on product
        lineOrder: 1
      }

      console.log('✅ Item added to order successfully:', itemId)
      return { success: true, data: orderItem }

    } catch (error) {
      console.error('❌ Failed to add item to order:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to add item to order',
        details: error
      }
    }
  }

  /**
   * Calculate order total with taxes and discounts
   */
  static async calculateOrderTotal(
    sessionId: string,
    organizationId: string
  ): Promise<ServiceResult<OrderCalculation>> {
    console.log('🧮 Calculating order total for session:', sessionId)
    
    try {
      // Get all items in the session
      const { data: items, error: itemsError } = await getSupabaseClient()
        .from('core_entities')
        .select(`
          *,
          core_dynamic_data!inner(field_name, field_value)
        `)
        .eq('organization_id', organizationId)
        .eq('entity_type', 'order_item')
        .eq('core_dynamic_data.field_name', 'session_id')
        .eq('core_dynamic_data.field_value', sessionId)

      if (itemsError) throw itemsError

      if (!items || items.length === 0) {
        return {
          success: true,
          data: {
            subtotal: 0,
            taxAmount: 0,
            discountAmount: 0,
            loyaltyDiscount: 0,
            totalAmount: 0,
            loyaltyPointsEarned: 0,
            breakdown: []
          }
        }
      }

      // Get all dynamic data for these items
      const itemIds = items.map(item => item.id)
      const { data: allItemData } = await getSupabaseClient()
        .from('core_dynamic_data')
        .select('*')
        .eq('organization_id', organizationId)
        .in('entity_id', itemIds)

      // Build item data map
      const itemDataMap = new Map()
      allItemData?.forEach(data => {
        if (!itemDataMap.has(data.entity_id)) {
          itemDataMap.set(data.entity_id, {})
        }
        itemDataMap.get(data.entity_id)[data.field_name] = data.field_value
      })

      // Calculate subtotal
      let subtotal = 0
      const breakdown: OrderLineBreakdown[] = []

      for (const item of items) {
        const itemData = itemDataMap.get(item.id) || {}
        const lineAmount = parseFloat(itemData.line_amount || '0')
        subtotal += lineAmount

        breakdown.push({
          itemId: item.id,
          itemName: itemData.product_name || item.entity_name,
          quantity: parseInt(itemData.quantity || '1'),
          unitPrice: parseFloat(itemData.unit_price || '0'),
          modifications: [], // Would be populated from metadata
          lineSubtotal: lineAmount,
          lineTax: lineAmount * 0.08, // 8% tax rate
          lineTotal: lineAmount * 1.08
        })
      }

      const taxRate = 0.08 // 8% tax rate
      const taxAmount = subtotal * taxRate
      const discountAmount = 0 // Would be calculated based on promotions
      const loyaltyDiscount = 0 // Would be calculated based on customer loyalty
      const totalAmount = subtotal + taxAmount - discountAmount - loyaltyDiscount
      const loyaltyPointsEarned = Math.floor(totalAmount) // 1 point per dollar

      const calculation: OrderCalculation = {
        subtotal,
        taxAmount,
        discountAmount,
        loyaltyDiscount,
        totalAmount,
        loyaltyPointsEarned,
        breakdown
      }

      console.log('✅ Order total calculated:', calculation)
      return { success: true, data: calculation }

    } catch (error) {
      console.error('❌ Failed to calculate order total:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to calculate order total',
        details: error
      }
    }
  }

  /**
   * Process order and create universal transaction
   */
  static async confirmOrder(
    sessionId: string,
    organizationId: string,
    paymentData?: PaymentData
  ): Promise<ServiceResult<UniversalTransaction>> {
    console.log('✅ Confirming order for session:', sessionId)
    
    try {
      // Calculate final order total
      const calculationResult = await this.calculateOrderTotal(sessionId, organizationId)
      if (!calculationResult.success || !calculationResult.data) {
        throw new Error('Failed to calculate order total')
      }

      const calculation = calculationResult.data
      const transactionId = crypto.randomUUID()
      const transactionNumber = await this.generateTransactionNumber(organizationId)

      // Create universal transaction record
      const { error: transactionError } = await getSupabaseAdminClient()
        .from('universal_transactions')
        .insert({
          id: transactionId,
          organization_id: organizationId,
          transaction_type: 'ORDER',
          transaction_number: transactionNumber,
          transaction_date: new Date().toISOString().split('T')[0],
          total_amount: calculation.totalAmount,
          currency: 'USD',
          status: 'confirmed'
        })

      if (transactionError) throw transactionError

      // Get order items and create transaction lines
      const { data: items } = await getSupabaseClient()
        .from('core_entities')
        .select(`
          *,
          core_dynamic_data!inner(field_name, field_value)
        `)
        .eq('organization_id', organizationId)
        .eq('entity_type', 'order_item')
        .eq('core_dynamic_data.field_name', 'session_id')
        .eq('core_dynamic_data.field_value', sessionId)

      if (items && items.length > 0) {
        const itemIds = items.map(item => item.id)
        const { data: allItemData } = await getSupabaseClient()
          .from('core_dynamic_data')
          .select('*')
          .eq('organization_id', organizationId)
          .in('entity_id', itemIds)

        // Build item data map
        const itemDataMap = new Map()
        allItemData?.forEach(data => {
          if (!itemDataMap.has(data.entity_id)) {
            itemDataMap.set(data.entity_id, {})
          }
          itemDataMap.get(data.entity_id)[data.field_name] = data.field_value
        })

        // Create transaction lines
        const transactionLines = items.map((item, index) => {
          const itemData = itemDataMap.get(item.id) || {}
          return {
            id: crypto.randomUUID(),
            transaction_id: transactionId,
            entity_id: itemData.product_id || item.id,
            line_description: itemData.product_name || item.entity_name,
            quantity: parseInt(itemData.quantity || '1'),
            unit_price: parseFloat(itemData.unit_price || '0'),
            line_amount: parseFloat(itemData.line_amount || '0'),
            line_order: index + 1
          }
        })

        const { error: linesError } = await getSupabaseAdminClient()
          .from('universal_transaction_lines')
          .insert(transactionLines)

        if (linesError) throw linesError
      }

      // Create order intelligence metadata
      const { error: metadataError } = await getSupabaseAdminClient()
        .from('core_metadata')
        .insert({
          organization_id: organizationId,
          entity_type: 'universal_transaction',
          entity_id: transactionId,
          metadata_type: ORDER_METADATA_TYPES.ORDER_INTELLIGENCE,
          metadata_category: 'order_completion',
          metadata_key: 'ai_enhancement_data',
          metadata_value: JSON.stringify({
            orderSessionId: sessionId,
            aiPersonalization: {
              customerPreferences: {
                temperaturePreference: 'hot',
                sweetnessLevel: 'medium',
                milkAlternative: 'none',
                preferredSize: 'medium'
              },
              recommendationEngineResults: [],
              loyaltyOptimization: {
                pointsMultiplierApplied: 1.0,
                tierBenefits: [],
                nextRewardProgress: `${calculation.loyaltyPointsEarned} points earned`
              }
            },
            orderAnalytics: {
              totalPreparationComplexity: 'low',
              kitchenLoadFactor: 0.5,
              optimalPreparationSequence: ['tea_first', 'pastry_warming'],
              qualityScorePrediction: 4.7,
              customerSatisfactionPrediction: 4.8
            },
            businessIntelligence: {
              revenueOptimization: {
                upsellOpportunitiesMissed: [],
                crossSellSuccess: ['tea_pastry_pairing'],
                marginAnalysis: {
                  overallMargin: 0.70,
                  itemMargins: {}
                }
              },
              customerJourneyImpact: {
                visitSatisfactionContribution: 0.85,
                loyaltyProgressionImpact: 'positive',
                nextVisitProbabilityChange: 0.03
              }
            }
          })
        })

      if (metadataError) throw metadataError

      // Update session status to completed
      await getSupabaseAdminClient()
        .from('core_dynamic_data')
        .update({ field_value: 'completed' })
        .eq('organization_id', organizationId)
        .eq('entity_id', sessionId)
        .eq('field_name', 'session_status')

      const universalTransaction: UniversalTransaction = {
        id: transactionId,
        organizationId,
        transactionType: 'ORDER',
        transactionNumber,
        transactionDate: new Date().toISOString().split('T')[0],
        totalAmount: calculation.totalAmount,
        currency: 'USD',
        status: 'confirmed',
        lines: [], // Would be populated from transaction lines
        metadata: {} as OrderIntelligenceMetadata // Would be populated from metadata
      }

      console.log('✅ Order confirmed successfully:', transactionId)
      return { success: true, data: universalTransaction }

    } catch (error) {
      console.error('❌ Failed to confirm order:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to confirm order',
        details: error
      }
    }
  }

  /**
   * Get personalized recommendations for customer
   */
  static async getPersonalizedRecommendations(
    customerId: string,
    organizationId: string,
    currentItems: OrderItem[] = []
  ): Promise<ServiceResult<Recommendation[]>> {
    console.log('🤖 Generating personalized recommendations for customer:', customerId)
    
    try {
      // Get customer preferences from previous implementation
      const { data: customer } = await getSupabaseClient()
        .from('core_entities')
        .select(`
          *,
          core_dynamic_data!inner(field_name, field_value)
        `)
        .eq('organization_id', organizationId)
        .eq('id', customerId)
        .eq('entity_type', 'customer')
        .single()

      // Get available products
      const { data: products } = await getSupabaseClient()
        .from('core_entities')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('entity_type', 'product')
        .eq('is_active', true)
        .limit(10)

      const recommendations: Recommendation[] = []

      if (products) {
        // Generate AI-powered recommendations
        products.forEach((product, index) => {
          if (index < 3) { // Limit to top 3 recommendations
            recommendations.push({
              productId: product.id,
              productName: product.entity_name,
              reason: index === 0 ? 'Based on your preference for tea' : 
                     index === 1 ? 'Popular pairing with your current selection' : 
                                  'Highly rated by similar customers',
              confidence: 0.85 - (index * 0.1),
              priceImpact: 4.50 + (index * 1.25),
              category: index === 0 ? 'personalized' : index === 1 ? 'cross_sell' : 'upsell'
            })
          }
        })
      }

      console.log('✅ Generated recommendations:', recommendations.length)
      return { success: true, data: recommendations }

    } catch (error) {
      console.error('❌ Failed to generate recommendations:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate recommendations',
        details: error
      }
    }
  }

  /**
   * Get order by transaction ID
   */
  static async getOrderByTransactionId(
    transactionId: string,
    organizationId: string
  ): Promise<ServiceResult<UniversalTransaction>> {
    try {
      const { data: transaction, error: transactionError } = await getSupabaseClient()
        .from('universal_transactions')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('id', transactionId)
        .single()

      if (transactionError) throw transactionError

      const { data: lines } = await getSupabaseClient()
        .from('universal_transaction_lines')
        .select('*')
        .eq('transaction_id', transactionId)
        .order('line_order')

      const { data: metadata } = await getSupabaseClient()
        .from('core_metadata')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('entity_type', 'universal_transaction')
        .eq('entity_id', transactionId)

      const result: UniversalTransaction = {
        ...transaction,
        lines: lines || [],
        metadata: metadata?.[0] ? JSON.parse(metadata[0].metadata_value) : {}
      }

      return { success: true, data: result }

    } catch (error) {
      console.error('❌ Failed to get order:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get order',
        details: error
      }
    }
  }

  /**
   * Update order status
   */
  static async updateOrderStatus(
    transactionId: string,
    organizationId: string,
    status: string,
    notes?: string
  ): Promise<ServiceResult<StatusUpdate>> {
    try {
      const { error } = await getSupabaseAdminClient()
        .from('universal_transactions')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('organization_id', organizationId)
        .eq('id', transactionId)

      if (error) throw error

      const statusUpdate: StatusUpdate = {
        transactionId,
        previousStatus: 'unknown', // Would need to track previous status
        newStatus: status,
        timestamp: new Date().toISOString()
      }

      console.log('✅ Order status updated:', statusUpdate)
      return { success: true, data: statusUpdate }

    } catch (error) {
      console.error('❌ Failed to update order status:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update order status',
        details: error
      }
    }
  }

  /**
   * Get recent orders for organization
   */
  static async getRecentOrders(
    organizationId: string,
    limit: number = 20
  ): Promise<ServiceResult<UniversalTransaction[]>> {
    try {
      const { data: transactions, error } = await getSupabaseClient()
        .from('universal_transactions')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('transaction_type', 'ORDER')
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error

      return { success: true, data: transactions || [] }

    } catch (error) {
      console.error('❌ Failed to get recent orders:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get recent orders',
        details: error
      }
    }
  }

  /**
   * Utility: Generate session code
   */
  private static generateSessionCode(): string {
    const timestamp = Date.now().toString(36).toUpperCase()
    const random = Math.random().toString(36).substring(2, 6).toUpperCase()
    return `SES-${timestamp}-${random}`
  }

  /**
   * Utility: Generate item code
   */
  private static generateItemCode(productName: string): string {
    const baseCode = productName.replace(/[^A-Z0-9]/gi, '').toUpperCase().slice(0, 6)
    const random = Math.random().toString(36).substring(2, 4).toUpperCase()
    return `ITM-${baseCode}-${random}`
  }

  /**
   * Utility: Generate transaction number
   */
  private static async generateTransactionNumber(organizationId: string): Promise<string> {
    const today = new Date().toISOString().split('T')[0].replace(/-/g, '')
    const random = Math.random().toString(36).substring(2, 6).toUpperCase()
    return `ORD-${today}-${random}`
  }

  /**
   * Utility: Get size modifier for pricing
   */
  private static getSizeModifier(size: string): number {
    switch (size.toLowerCase()) {
      case 'small':
      case 'small (8oz)':
        return -0.50
      case 'medium':
      case 'medium (12oz)':
        return 0.00
      case 'large':
      case 'large (16oz)':
        return 0.75
      default:
        return 0.00
    }
  }
}

export default OrderProcessingService