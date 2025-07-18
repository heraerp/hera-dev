/**
 * Toyota Method: Order Service - The Right Way
 * Following Jidoka, Poka-Yoke, and Standardized Work principles
 */

import UniversalCrudService from '@/lib/services/universalCrudService'
import { HeraNamingConventionAI } from '@/lib/naming/heraNamingConvention'

export class OrderServiceToyota {
  
  /**
   * Toyota Method: Schema Validation First (Jidoka)
   */
  private static async validateSchema(): Promise<void> {
    console.log('🔍 Toyota Method: Validating schema before operations...')
    
    // Validate core_metadata table structure
    const metadataValidation = await HeraNamingConventionAI.validateTableName('core_metadata')
    if (!metadataValidation.isValid) {
      throw new Error(`Schema validation failed: ${metadataValidation.error}`)
    }
    
    // Validate required fields exist
    const requiredFields = [
      'organization_id', 'entity_type', 'entity_id', 
      'metadata_type', 'metadata_category', 'metadata_key', 'metadata_value'
    ]
    
    for (const field of requiredFields) {
      const fieldValidation = await HeraNamingConventionAI.validateFieldName('core_metadata', field)
      if (!fieldValidation.isValid) {
        throw new Error(`Required field validation failed: ${field} - ${fieldValidation.error}`)
      }
    }
    
    console.log('✅ Toyota Method: Schema validation passed')
  }
  
  /**
   * Toyota Method: Standardized Work Pattern (One-Piece Flow)
   */
  static async createOrderSession(organizationId: string, sessionData: any): Promise<any> {
    try {
      // Step 1: Validate schema (Jidoka)
      await this.validateSchema()
      
      // Step 2: Use standardized UniversalCrudService (Standardized Work)
      console.log('🚀 Toyota Method: Creating order session using standardized pattern...')
      
      const sessionEntity = await UniversalCrudService.createEntity({
        name: `Order Session ${new Date().toISOString()}`,
        organizationId,
        fields: {
          session_status: 'active',
          order_source: sessionData.orderSource || 'in_store',
          service_type: sessionData.serviceType || 'dine_in',
          table_number: sessionData.tableNumber,
          staff_member_id: sessionData.staffMemberId,
          customer_id: sessionData.customerId
        }
      }, 'order_session')
      
      // Step 3: Add metadata using validated schema (Poka-Yoke)
      if (sessionEntity.success) {
        const metadataResult = await UniversalCrudService.createEntity({
          name: `Order Session Metadata ${sessionEntity.data}`,
          organizationId,
          fields: {
            entity_type: 'order_session',
            entity_id: sessionEntity.data,
            metadata_type: 'session_intelligence',
            metadata_category: 'ai_optimization',
            metadata_key: 'session_context',
            metadata_value: JSON.stringify({
              session_start_time: new Date().toISOString(),
              ai_recommendations_enabled: true,
              personalization_active: true
            })
          }
        }, 'metadata')
        
        if (metadataResult.success) {
          console.log('✅ Toyota Method: Order session created successfully')
          return { 
            success: true, 
            data: {
              sessionId: sessionEntity.data,
              metadataId: metadataResult.data
            }
          }
        }
      }
      
      throw new Error('Failed to create order session')
      
    } catch (error) {
      console.error('❌ Toyota Method: Order session creation failed:', error)
      
      // Jidoka: Stop the line, fix the problem
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        rootCause: 'Schema validation or standardized service failure'
      }
    }
  }
  
  /**
   * Toyota Method: Add Order Item (Continuous Flow)
   */
  static async addOrderItem(sessionId: string, organizationId: string, itemData: any): Promise<any> {
    try {
      // Always validate schema first
      await this.validateSchema()
      
      console.log('🚀 Toyota Method: Adding order item using standardized pattern...')
      
      // Use standardized service
      const itemEntity = await UniversalCrudService.createEntity({
        name: `Order Item ${itemData.productName}`,
        organizationId,
        fields: {
          session_id: sessionId,
          product_id: itemData.productId,
          product_name: itemData.productName,
          quantity: itemData.quantity,
          unit_price: itemData.unitPrice,
          line_amount: itemData.quantity * itemData.unitPrice,
          special_instructions: itemData.specialInstructions
        }
      }, 'order_item')
      
      if (itemEntity.success) {
        console.log('✅ Toyota Method: Order item added successfully')
        return { success: true, data: itemEntity.data }
      }
      
      throw new Error('Failed to add order item')
      
    } catch (error) {
      console.error('❌ Toyota Method: Add order item failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }
  
  /**
   * Toyota Method: Get Order Session (Standardized Read)
   */
  static async getOrderSession(sessionId: string, organizationId: string): Promise<any> {
    try {
      console.log('🔍 Toyota Method: Retrieving order session...')
      
      // Use standardized service
      const sessionEntity = await UniversalCrudService.readEntity(organizationId, sessionId)
      
      if (sessionEntity.success) {
        console.log('✅ Toyota Method: Order session retrieved successfully')
        return { success: true, data: sessionEntity.data }
      }
      
      throw new Error('Order session not found')
      
    } catch (error) {
      console.error('❌ Toyota Method: Get order session failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }
}

export default OrderServiceToyota