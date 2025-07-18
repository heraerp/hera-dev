import { POSEvent, Order, PaymentInfo } from './posEventPublisher'
import { TransactionClassificationAI } from './transactionClassificationAI'
import { JournalCreationService } from './journalCreationService'
// import { digitalAccountantService } from './digitalAccountantService'
import { getRestaurantAccountingConfig } from '@/lib/config/restaurantAccountingConfig'
import { createClient } from '@/lib/supabase/client'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export interface UniversalTransaction {
  id: string
  organization_id: string
  transaction_type: string
  transaction_subtype: string
  transaction_number: string
  transaction_date: string
  total_amount: number
  currency: string
  is_financial: boolean
  posting_status: string
  mapped_accounts: any
  transaction_data: any
  created_by?: string
  requires_approval: boolean
}

export interface AccountingResult {
  success: boolean
  transactionId?: string
  journalEntryId?: string
  postingStatus?: string
  message: string
  error?: string
}

export class POSAccountingBridge {
  private classificationAI: TransactionClassificationAI
  private journalCreationService: JournalCreationService
  private config: any
  private supabase = createClient()
  private supabaseAdmin = createSupabaseClient(
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
  private isInitialized = false

  constructor() {
    this.classificationAI = new TransactionClassificationAI()
    this.journalCreationService = new JournalCreationService()
  }

  async initialize(organizationId: string): Promise<void> {
    try {
      // Clean up previous initialization if exists
      if (this.isInitialized) {
        await this.cleanup()
      }

      // Load restaurant accounting configuration
      this.config = await getRestaurantAccountingConfig(organizationId)
      
      // Initialize services
      await this.classificationAI.initialize(organizationId)
      await this.journalCreationService.initialize(organizationId, this.config)
      
      this.isInitialized = true
      console.log('✅ POS Accounting Bridge initialized')
    } catch (error) {
      console.error('❌ Failed to initialize POS Accounting Bridge:', error)
      this.isInitialized = false
      throw error
    }
  }

  async handlePOSEvent(event: POSEvent): Promise<AccountingResult> {
    if (!this.isInitialized) {
      throw new Error('POS Accounting Bridge not initialized')
    }

    console.log('🔄 Processing POS event:', event.type)

    try {
      switch (event.type) {
        case 'order.completed':
          return await this.processOrderCompletion(event.data as Order)
        case 'payment.received':
          return await this.processPaymentReceived(event.data as PaymentInfo & { orderId: string })
        case 'refund.processed':
          return await this.processRefund(event.data)
        case 'order.voided':
          return await this.processOrderVoid(event.data)
        default:
          throw new Error(`Unknown POS event type: ${event.type}`)
      }
    } catch (error) {
      console.error('❌ Error processing POS event:', error)
      return {
        success: false,
        message: `Failed to process ${event.type}`,
        error: error.message
      }
    }
  }

  private async processOrderCompletion(order: Order): Promise<AccountingResult> {
    console.log('📊 Processing order completion:', order.orderNumber)

    try {
      // Step 1: Convert to universal transaction format
      const universalTransaction = await this.convertToUniversalTransaction(order)
      
      // Step 2: Classify transaction with AI
      const classification = await this.classificationAI.classifyTransaction(universalTransaction)
      
      // Step 3: Create journal entry
      const journalEntry = await this.journalCreationService.createFromPOSOrder(order, classification)
      
      // Step 4: Save universal transaction using HERA Universal Entity pattern
      const transactionEntityId = universalTransaction.id
      
      // Save transaction entity
      const { error: entityError } = await this.supabaseAdmin
        .from('core_entities')
        .insert({
          id: transactionEntityId,
          organization_id: universalTransaction.organization_id,
          entity_type: 'universal_transaction',
          entity_name: `${universalTransaction.transaction_type} - ${universalTransaction.transaction_number}`,
          entity_code: universalTransaction.transaction_number,
          is_active: true
        })

      if (entityError) throw entityError

      // Save transaction data
      const transactionData = {
        ...universalTransaction,
        mapped_accounts: journalEntry.accounts,
        posting_status: 'draft',
        requires_approval: classification.confidence < 0.85
      }

      const { error: dataError } = await this.supabaseAdmin
        .from('core_metadata')
        .insert({
          organization_id: universalTransaction.organization_id,
          entity_type: 'universal_transaction',
          entity_id: transactionEntityId,
          metadata_type: 'transaction_data',
          metadata_category: 'financial',
          metadata_key: 'transaction_details',
          metadata_value: transactionData
        })

      if (dataError) throw dataError

      // Step 5: Save AI intelligence using core_metadata
      await this.supabaseAdmin
        .from('core_metadata')
        .insert({
          organization_id: order.organizationId,
          entity_type: 'universal_transaction',
          entity_id: transactionEntityId,
          metadata_type: 'ai_intelligence',
          metadata_category: 'classification',
          metadata_key: 'ai_decision',
          metadata_value: {
            confidence_score: classification.confidence,
            classification_data: classification,
            decision_timestamp: new Date().toISOString()
          }
        })

      const savedTransaction = { id: transactionEntityId, ...transactionData }

      // Step 6: Auto-post to accounting (temporarily disabled)
      const postingResult = { success: true, message: 'Auto-posting disabled for now' }
      // const postingResult = await digitalAccountantService.forceAutoPost(
      //   savedTransaction.id,
      //   order.organizationId
      // )

      if (!postingResult.success) {
        console.warn('⚠️ Auto-posting failed, transaction saved as draft')
      }

      return {
        success: true,
        transactionId: savedTransaction.id,
        journalEntryId: journalEntry.id,
        postingStatus: postingResult.success ? 'posted' : 'draft',
        message: `Order ${order.orderNumber} processed successfully`
      }

    } catch (error) {
      console.error('❌ Error processing order completion:', error)
      return {
        success: false,
        message: `Failed to process order ${order.orderNumber}`,
        error: error.message
      }
    }
  }

  private async processPaymentReceived(payment: PaymentInfo & { orderId: string }): Promise<AccountingResult> {
    console.log('💳 Processing payment received:', payment.reference)

    try {
      // Find the associated order transaction using core_entities
      const { data: orderEntity, error: findError } = await this.supabase
        .from('core_entities')
        .select('*')
        .eq('organization_id', payment.organizationId)
        .eq('entity_type', 'universal_transaction')
        .eq('entity_code', payment.orderId)
        .single()

      if (findError) throw findError

      // Get current transaction data
      const { data: currentMetadata, error: metadataError } = await this.supabase
        .from('core_metadata')
        .select('metadata_value')
        .eq('entity_id', orderEntity.id)
        .eq('metadata_key', 'transaction_details')
        .single()

      if (metadataError) throw metadataError

      // Update payment information
      const currentTransactionData = currentMetadata.metadata_value
      const updatedTransactionData = {
        ...currentTransactionData,
        payment: payment,
        payment_confirmed: true,
        payment_timestamp: payment.timestamp
      }

      const { error: updateError } = await this.supabaseAdmin
        .from('core_metadata')
        .update({
          metadata_value: updatedTransactionData,
          updated_at: new Date().toISOString()
        })
        .eq('entity_id', orderEntity.id)
        .eq('metadata_key', 'transaction_details')

      if (updateError) throw updateError

      return {
        success: true,
        transactionId: orderEntity.id,
        message: `Payment confirmed for order ${payment.orderId}`
      }

    } catch (error) {
      console.error('❌ Error processing payment received:', error)
      return {
        success: false,
        message: `Failed to process payment for order ${payment.orderId}`,
        error: error.message
      }
    }
  }

  private async processRefund(refund: any): Promise<AccountingResult> {
    console.log('🔄 Processing refund:', refund.orderId)

    try {
      // Create refund transaction
      const refundTransaction = {
        id: crypto.randomUUID(),
        organization_id: refund.organizationId,
        transaction_type: 'REFUND',
        transaction_subtype: 'CUSTOMER_REFUND',
        transaction_number: `REF-${Date.now()}`,
        transaction_date: new Date().toISOString().split('T')[0],
        total_amount: -refund.refundAmount, // Negative amount for refund
        currency: 'USD',
        is_financial: true,
        posting_status: 'draft',
        mapped_accounts: {},
        transaction_data: {
          original_order_id: refund.orderId,
          refund_reason: refund.reason,
          refund_amount: refund.refundAmount,
          source: 'pos_refund'
        },
        created_by: refund.userId || null,
        requires_approval: refund.refundAmount > 1000 // Require approval for refunds > $1000
      }

      // Save refund transaction using HERA Universal Entity pattern
      const refundEntityId = refundTransaction.id
      
      // Save refund entity
      const { error: entityError } = await this.supabaseAdmin
        .from('core_entities')
        .insert({
          id: refundEntityId,
          organization_id: refundTransaction.organization_id,
          entity_type: 'universal_transaction',
          entity_name: `${refundTransaction.transaction_type} - ${refundTransaction.transaction_number}`,
          entity_code: refundTransaction.transaction_number,
          is_active: true
        })

      if (entityError) throw entityError

      // Save refund data
      const { error: dataError } = await this.supabaseAdmin
        .from('core_metadata')
        .insert({
          organization_id: refundTransaction.organization_id,
          entity_type: 'universal_transaction',
          entity_id: refundEntityId,
          metadata_type: 'transaction_data',
          metadata_category: 'financial',
          metadata_key: 'transaction_details',
          metadata_value: refundTransaction
        })

      if (dataError) throw dataError

      const savedRefund = { id: refundEntityId, ...refundTransaction }

      // Process through accounting system (temporarily disabled)
      const postingResult = { success: true, message: 'Auto-posting disabled for now' }
      // const postingResult = await digitalAccountantService.forceAutoPost(
      //   savedRefund.id,
      //   refund.organizationId
      // )

      return {
        success: true,
        transactionId: savedRefund.id,
        postingStatus: postingResult.success ? 'posted' : 'draft',
        message: `Refund processed for order ${refund.orderId}`
      }

    } catch (error) {
      console.error('❌ Error processing refund:', error)
      return {
        success: false,
        message: `Failed to process refund for order ${refund.orderId}`,
        error: error.message
      }
    }
  }

  private async processOrderVoid(voidInfo: any): Promise<AccountingResult> {
    console.log('❌ Processing order void:', voidInfo.orderId)

    try {
      // Find the original transaction using core_entities
      const { data: originalEntity, error: findError } = await this.supabase
        .from('core_entities')
        .select('*')
        .eq('organization_id', voidInfo.organizationId)
        .eq('entity_type', 'universal_transaction')
        .eq('entity_code', voidInfo.orderId)
        .single()

      if (findError) throw findError

      // Get current transaction data
      const { data: currentMetadata, error: metadataError } = await this.supabase
        .from('core_metadata')
        .select('metadata_value')
        .eq('entity_id', originalEntity.id)
        .eq('metadata_key', 'transaction_details')
        .single()

      if (metadataError) throw metadataError

      // Update transaction to voided status using service role
      const currentTransactionData = currentMetadata.metadata_value
      const voidedTransactionData = {
        ...currentTransactionData,
        posting_status: 'voided',
        void_reason: voidInfo.reason,
        voided_at: new Date().toISOString(),
        voided_by: voidInfo.userId || null
      }

      const { error: updateError } = await this.supabaseAdmin
        .from('core_metadata')
        .update({
          metadata_value: voidedTransactionData,
          updated_at: new Date().toISOString()
        })
        .eq('entity_id', originalEntity.id)
        .eq('metadata_key', 'transaction_details')

      if (updateError) throw updateError

      return {
        success: true,
        transactionId: originalEntity.id,
        postingStatus: 'voided',
        message: `Order ${voidInfo.orderId} voided successfully`
      }

    } catch (error) {
      console.error('❌ Error processing order void:', error)
      return {
        success: false,
        message: `Failed to void order ${voidInfo.orderId}`,
        error: error.message
      }
    }
  }

  private async convertToUniversalTransaction(order: Order): Promise<UniversalTransaction> {
    const transactionId = crypto.randomUUID()
    
    return {
      id: transactionId,
      organization_id: order.organizationId,
      transaction_type: 'SALES_ORDER',
      transaction_subtype: this.determineTransactionSubtype(order),
      transaction_number: order.orderNumber,
      transaction_date: new Date(order.completedAt || order.createdAt).toISOString().split('T')[0],
      total_amount: order.totalAmount,
      currency: 'USD', // TODO: Get from restaurant config
      is_financial: true,
      posting_status: 'draft',
      mapped_accounts: {},
      transaction_data: {
        pos_order_id: order.id,
        customer_name: order.customerName,
        table_number: order.tableNumber,
        items: order.items,
        subtotal: order.subtotal,
        taxes: order.taxes,
        discounts: order.discounts,
        service_charges: order.serviceCharges,
        payment: order.payment,
        staff_member: order.staffMember,
        restaurant: order.restaurant,
        source: 'restaurant_pos'
      },
      created_by: order.staffMember?.id || null,
      requires_approval: false
    }
  }

  private determineTransactionSubtype(order: Order): string {
    // Determine subtype based on order characteristics
    if (order.customerName?.toLowerCase().includes('delivery')) {
      return 'DELIVERY_ORDER'
    }
    
    if (order.tableNumber) {
      return 'DINE_IN_ORDER'
    }
    
    if (order.items.some(item => item.category === 'takeaway')) {
      return 'TAKEAWAY_ORDER'
    }
    
    return 'POS_SALE'
  }

  async cleanup(): Promise<void> {
    this.isInitialized = false
    console.log('✅ POS Accounting Bridge cleaned up')
  }
}

export default POSAccountingBridge