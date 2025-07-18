/**
 * Toyota Method: Simplified Order Service
 * Uses ONLY UniversalCrudService - NO custom implementations
 * Following Jidoka, Standardized Work, and Poka-Yoke principles
 */

import UniversalCrudService from '@/lib/services/universalCrudService'

export class OrderServiceSimplified {
  
  /**
   * Create Order (Toyota Method: Standardized Work)
   * Orders are stored as universal_transactions
   */
  static async createOrder(orderData: {
    organizationId: string
    customerName?: string
    tableNumber?: string
    orderType?: string
    items: Array<{
      productId: string
      productName: string
      quantity: number
      unitPrice: number
    }>
  }) {
    console.log('🏭 Toyota Method: Creating order using UniversalCrudService...')
    
    try {
      // Step 1: Create order as universal_transaction
      const orderResult = await UniversalCrudService.createEntity({
        name: `Order ${new Date().toISOString()}`,
        organizationId: orderData.organizationId,
        fields: {
          transaction_type: 'SALES_ORDER',
          transaction_number: `ORD-${Date.now()}`,
          transaction_date: new Date().toISOString(),
          transaction_status: 'PENDING',
          customer_name: orderData.customerName || 'Walk-in',
          table_number: orderData.tableNumber,
          order_type: orderData.orderType || 'dine_in',
          total_amount: orderData.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)
        }
      }, 'transaction')
      
      if (!orderResult.success) {
        throw new Error('Failed to create order transaction')
      }
      
      // Step 2: Create order items
      const itemPromises = orderData.items.map((item, index) => 
        UniversalCrudService.createEntity({
          name: `Order Item ${item.productName}`,
          organizationId: orderData.organizationId,
          fields: {
            transaction_id: orderResult.data,
            product_id: item.productId,
            product_name: item.productName,
            quantity: item.quantity,
            unit_price: item.unitPrice,
            line_amount: item.quantity * item.unitPrice,
            line_order: index + 1
          }
        }, 'transaction_line')
      )
      
      await Promise.all(itemPromises)
      
      console.log('✅ Toyota Method: Order created successfully')
      return { success: true, orderId: orderResult.data }
      
    } catch (error) {
      console.error('❌ Toyota Method: Order creation failed:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }
  
  /**
   * Get Orders (Toyota Method: Standardized Read)
   */
  static async getOrders(organizationId: string) {
    console.log('🏭 Toyota Method: Fetching orders using UniversalCrudService...')
    
    try {
      const orders = await UniversalCrudService.listEntities(
        organizationId, 
        'transaction',
        {
          filters: { transaction_type: 'SALES_ORDER' },
          orderBy: { field: 'created_at', direction: 'desc' }
        }
      )
      
      console.log('✅ Toyota Method: Orders fetched successfully')
      return orders
      
    } catch (error) {
      console.error('❌ Toyota Method: Fetch orders failed:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        data: []
      }
    }
  }
  
  /**
   * Update Order Status (Toyota Method: Standardized Update)
   */
  static async updateOrderStatus(organizationId: string, orderId: string, newStatus: string) {
    console.log('🏭 Toyota Method: Updating order status using UniversalCrudService...')
    
    try {
      const result = await UniversalCrudService.updateEntity(
        organizationId,
        orderId,
        {
          transaction_status: newStatus,
          updated_at: new Date().toISOString()
        }
      )
      
      console.log('✅ Toyota Method: Order status updated successfully')
      return result
      
    } catch (error) {
      console.error('❌ Toyota Method: Update order status failed:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }
  
  /**
   * Get Products (Toyota Method: Standardized Product Listing)
   */
  static async getProducts(organizationId: string) {
    console.log('🏭 Toyota Method: Fetching products using UniversalCrudService...')
    
    try {
      const products = await UniversalCrudService.listEntities(
        organizationId, 
        'product',
        {
          filters: { available: true },
          orderBy: { field: 'entity_name', direction: 'asc' }
        }
      )
      
      console.log('✅ Toyota Method: Products fetched successfully')
      return products
      
    } catch (error) {
      console.error('❌ Toyota Method: Fetch products failed:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        data: []
      }
    }
  }

  /**
   * Get Order Details (Toyota Method: Standardized Read with Items)
   */
  static async getOrderDetails(organizationId: string, orderId: string) {
    console.log('🏭 Toyota Method: Fetching order details using UniversalCrudService...')
    
    try {
      // Get order
      const order = await UniversalCrudService.readEntity(organizationId, orderId)
      
      if (!order.success) {
        throw new Error('Order not found')
      }
      
      // Get order items
      const items = await UniversalCrudService.listEntities(
        organizationId,
        'transaction_line',
        {
          filters: { transaction_id: orderId },
          orderBy: { field: 'line_order', direction: 'asc' }
        }
      )
      
      console.log('✅ Toyota Method: Order details fetched successfully')
      return {
        success: true,
        data: {
          order: order.data,
          items: items.data || []
        }
      }
      
    } catch (error) {
      console.error('❌ Toyota Method: Fetch order details failed:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }
}

export default OrderServiceSimplified