import { EventEmitter } from 'events'
import { POSAccountingBridge } from './posAccountingBridge'

export interface POSEvent {
  type: 'order.completed' | 'payment.received' | 'refund.processed' | 'order.voided'
  data: any
  timestamp: string
  source: 'restaurant_pos'
  organizationId: string
  userId?: string
}

export interface Order {
  id: string
  orderNumber: string
  organizationId: string
  customerId?: string
  customerName?: string
  tableNumber?: string
  items: OrderItem[]
  subtotal: number
  taxes: number
  discounts: number
  serviceCharges: number
  totalAmount: number
  payment: PaymentInfo
  status: 'pending' | 'completed' | 'cancelled' | 'refunded'
  createdAt: string
  completedAt?: string
  staffMember?: {
    id: string
    name: string
  }
  restaurant: {
    id: string
    name: string
    location: string
  }
}

export interface OrderItem {
  id: string
  name: string
  category: string
  quantity: number
  unitPrice: number
  totalPrice: number
  taxes?: number
  discounts?: number
  modifiers?: string[]
}

export interface PaymentInfo {
  method: 'cash' | 'credit_card' | 'debit_card' | 'upi' | 'digital_wallet'
  provider?: string // 'gpay', 'phonepe', 'paytm', 'visa', 'mastercard', etc.
  amount: number
  reference?: string
  timestamp: string
}

class POSEventPublisher extends EventEmitter {
  private bridge: POSAccountingBridge
  private isInitialized = false

  constructor() {
    super()
    this.bridge = new POSAccountingBridge()
  }

  async initialize(organizationId: string) {
    try {
      // Clean up previous initialization if exists
      if (this.isInitialized) {
        await this.cleanup()
      }

      await this.bridge.initialize(organizationId)
      this.isInitialized = true
      console.log('✅ POS Event Publisher initialized for organization:', organizationId)
    } catch (error) {
      console.error('❌ Failed to initialize POS Event Publisher:', error)
      this.isInitialized = false
      throw error
    }
  }

  /**
   * Publish order completion event
   */
  async publishOrderCompletion(order: Order): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('POS Event Publisher not initialized')
    }

    const event: POSEvent = {
      type: 'order.completed',
      data: order,
      timestamp: new Date().toISOString(),
      source: 'restaurant_pos',
      organizationId: order.organizationId,
      userId: order.staffMember?.id
    }

    console.log('📤 Publishing order completion event:', event)

    try {
      // Process through accounting bridge
      await this.bridge.handlePOSEvent(event)
      
      // Emit for real-time listeners
      this.emit('pos:order:completed', event)
      
      console.log('✅ Order completion event published successfully')
    } catch (error) {
      console.error('❌ Failed to publish order completion event:', error)
      
      // Emit error event
      this.emit('pos:error', {
        event,
        error: error.message,
        timestamp: new Date().toISOString()
      })
      
      throw error
    }
  }

  /**
   * Publish payment received event
   */
  async publishPaymentReceived(payment: PaymentInfo & { orderId: string; organizationId: string }): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('POS Event Publisher not initialized')
    }

    const event: POSEvent = {
      type: 'payment.received',
      data: payment,
      timestamp: new Date().toISOString(),
      source: 'restaurant_pos',
      organizationId: payment.organizationId
    }

    console.log('📤 Publishing payment received event:', event)

    try {
      await this.bridge.handlePOSEvent(event)
      this.emit('pos:payment:received', event)
      console.log('✅ Payment received event published successfully')
    } catch (error) {
      console.error('❌ Failed to publish payment received event:', error)
      this.emit('pos:error', { event, error: error.message, timestamp: new Date().toISOString() })
      throw error
    }
  }

  /**
   * Publish refund processed event
   */
  async publishRefundProcessed(refund: {
    orderId: string
    refundAmount: number
    reason: string
    organizationId: string
    userId?: string
  }): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('POS Event Publisher not initialized')
    }

    const event: POSEvent = {
      type: 'refund.processed',
      data: refund,
      timestamp: new Date().toISOString(),
      source: 'restaurant_pos',
      organizationId: refund.organizationId,
      userId: refund.userId
    }

    console.log('📤 Publishing refund processed event:', event)

    try {
      await this.bridge.handlePOSEvent(event)
      this.emit('pos:refund:processed', event)
      console.log('✅ Refund processed event published successfully')
    } catch (error) {
      console.error('❌ Failed to publish refund processed event:', error)
      this.emit('pos:error', { event, error: error.message, timestamp: new Date().toISOString() })
      throw error
    }
  }

  /**
   * Publish order voided event
   */
  async publishOrderVoided(void_info: {
    orderId: string
    reason: string
    organizationId: string
    userId?: string
  }): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('POS Event Publisher not initialized')
    }

    const event: POSEvent = {
      type: 'order.voided',
      data: void_info,
      timestamp: new Date().toISOString(),
      source: 'restaurant_pos',
      organizationId: void_info.organizationId,
      userId: void_info.userId
    }

    console.log('📤 Publishing order voided event:', event)

    try {
      await this.bridge.handlePOSEvent(event)
      this.emit('pos:order:voided', event)
      console.log('✅ Order voided event published successfully')
    } catch (error) {
      console.error('❌ Failed to publish order voided event:', error)
      this.emit('pos:error', { event, error: error.message, timestamp: new Date().toISOString() })
      throw error
    }
  }

  /**
   * Get event statistics
   */
  getEventStats(): {
    totalEvents: number
    eventsByType: Record<string, number>
    lastEventTime?: string
  } {
    const stats = {
      totalEvents: this.listenerCount('pos:order:completed') + 
                  this.listenerCount('pos:payment:received') + 
                  this.listenerCount('pos:refund:processed') + 
                  this.listenerCount('pos:order:voided'),
      eventsByType: {
        'order.completed': this.listenerCount('pos:order:completed'),
        'payment.received': this.listenerCount('pos:payment:received'),
        'refund.processed': this.listenerCount('pos:refund:processed'),
        'order.voided': this.listenerCount('pos:order:voided')
      },
      lastEventTime: new Date().toISOString()
    }

    return stats
  }

  /**
   * Clean up resources
   */
  async cleanup(): Promise<void> {
    this.removeAllListeners()
    await this.bridge.cleanup()
    this.isInitialized = false
    console.log('✅ POS Event Publisher cleaned up')
  }
}

// Export singleton instance
export const posEventPublisher = new POSEventPublisher()
export default posEventPublisher