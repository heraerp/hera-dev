/**
 * HERA Universal CRUD Service
 * 
 * Universal service for all CRUD operations in HERA Universal.
 * Uses direct Supabase integration with service role for RLS bypass.
 * 
 * CRITICAL: Use this service for ALL entity operations to ensure:
 * - Proper sequential data creation
 * - RLS bypass when needed
 * - Consistent data integrity
 * - Complete audit trails
 */

import { createClient } from '@/lib/supabase/client'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// Function to get regular client for read operations
const getSupabaseClient = () => {
  if (typeof window === 'undefined') {
    // Server-side: use service role
    return createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY!
    )
  }
  // Client-side: use regular client
  return createClient()
}

// Function to get admin client with service role for write operations (bypasses RLS)
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

// Types
export interface EntityData {
  name: string
  organizationId?: string | null
  fields?: Record<string, any>
  mainFields?: Record<string, any>
}

export interface UpdateData {
  mainFields?: Record<string, any>
  entityFields?: Record<string, any>
  dynamicFields?: Record<string, any>
}

export interface CrudResult<T = any> {
  success: boolean
  data?: T
  error?: string
  details?: any
}

// Entity type to table mapping
const ENTITY_TABLES: Record<string, string> = {
  'client': 'core_clients',
  'organization': 'core_organizations',
  'user': 'core_users',
  'product': 'core_products',
  'order': 'core_orders'
}

/**
 * Universal CRUD Service Class
 */
export class UniversalCrudService {
  
  /**
   * Generate consistent entity codes
   */
  static generateEntityCode(name: string, type: string): string {
    const baseCode = name.replace(/[^A-Z0-9]/gi, '').toUpperCase().slice(0, 8)
    const random = Math.random().toString(36).substring(2, 6).toUpperCase()
    const typeCode = type.toUpperCase().slice(0, 3)
    return `${baseCode}-${random}-${typeCode}`
  }

  /**
   * Get entity type from ID
   */
  static async getEntityType(entityId: string): Promise<string | null> {
    try {
      const { data, error } = await getSupabaseAdminClient()
        .from('core_entities')
        .select('entity_type')
        .eq('id', entityId)
        .single()
      
      if (error) {
        console.error('Error getting entity type:', error)
        return null
      }
      
      return data?.entity_type || null
    } catch (error) {
      console.error('Exception getting entity type:', error)
      return null
    }
  }

  /**
   * Test service role capabilities
   */
  static async testServiceRole(): Promise<CrudResult> {
    try {
      const testId = crypto.randomUUID()
      const { error: insertError } = await getSupabaseAdminClient()
        .from('core_entities')
        .insert({
          id: testId,
          entity_type: 'test',
          entity_name: 'Service Role Test',
          entity_code: 'TEST-001',
          is_active: true
        })
      
      if (!insertError) {
        // Clean up test record
        await getSupabaseAdminClient().from('core_entities').delete().eq('id', testId)
        return { 
          success: true, 
          data: { message: 'Service role working correctly' }
        }
      }
      
      return { 
        success: false, 
        error: 'Service role test failed',
        details: insertError 
      }
    } catch (error) {
      return { 
        success: false, 
        error: 'Service role test exception',
        details: error 
      }
    }
  }

  /**
   * CREATE - Universal entity creation with sequential pattern
   */
  static async createEntity(entityData: EntityData, entityType: string): Promise<CrudResult<string>> {
    try {
      // Step 1: Generate proper UUIDs
      const entityId = crypto.randomUUID()
      const entityCode = this.generateEntityCode(entityData.name, entityType)
      
      console.log(`🚀 Creating ${entityType} entity:`, entityId)
      
      // Step 2: Create main entity record (if applicable)
      const mainTable = ENTITY_TABLES[entityType]
      if (mainTable && entityData.mainFields) {
        const mainData = {
          id: entityId,
          [`${entityType}_name`]: entityData.name,
          [`${entityType}_code`]: entityCode,
          ...entityData.mainFields,
          is_active: true
        }
        
        const { error: mainError } = await getSupabaseAdminClient()
          .from(mainTable)
          .insert(mainData)
        
        if (mainError) {
          console.error(`❌ ${mainTable} creation error:`, mainError)
          throw mainError
        }
        
        console.log(`✅ ${mainTable} record created`)
      }
      
      // Step 3: Create entity in core_entities table
      const { error: entityError } = await getSupabaseAdminClient()
        .from('core_entities')
        .insert({
          id: entityId,
          organization_id: entityData.organizationId || null,
          entity_type: entityType,
          entity_name: entityData.name,
          entity_code: entityCode,
          is_active: true
        })
      
      if (entityError) {
        console.error('❌ core_entities creation error:', entityError)
        throw entityError
      }
      
      console.log('✅ core_entities record created')
      
      // Step 4: Create dynamic data
      if (entityData.fields && Object.keys(entityData.fields).length > 0) {
        const dynamicData = Object.entries(entityData.fields).map(([key, value]) => ({
          entity_id: entityId,
          field_name: key,
          field_value: String(value),
          field_type: typeof value === 'number' ? 'number' : 'text'
        }))
        
        const { error: dataError } = await getSupabaseAdminClient()
          .from('core_dynamic_data')
          .insert(dynamicData)
        
        if (dataError) {
          console.error('❌ core_dynamic_data creation error:', dataError)
          throw dataError
        }
        
        console.log('✅ core_dynamic_data records created')
      }
      
      console.log(`🎉 ${entityType} entity created successfully:`, entityId)
      return { success: true, data: entityId }
      
    } catch (error) {
      console.error(`🚨 ${entityType} entity creation failed:`, error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error 
      }
    }
  }

  /**
   * READ - Universal entity reading with joined data
   */
  static async readEntity(organizationId: string, entityId: string): Promise<CrudResult>
  static async readEntity(entityId: string): Promise<CrudResult>
  static async readEntity(organizationIdOrEntityId: string, entityIdOrUndefined?: string): Promise<CrudResult> {
    try {
      // Handle method overloads
      const entityId = entityIdOrUndefined || organizationIdOrEntityId
      
      console.log('📖 Reading entity:', entityId)
      
      // Step 1: Get main entity data
      const { data: entity, error: entityError } = await getSupabaseAdminClient()
        .from('core_entities')
        .select('*')
        .eq('id', entityId)
        .single()
      
      if (entityError) {
        console.error('❌ core_entities read error:', entityError)
        throw entityError
      }
      
      // Step 2: Get type-specific data (if applicable)
      let mainData = {}
      const mainTable = ENTITY_TABLES[entity.entity_type]
      if (mainTable) {
        const { data: typeData, error: typeError } = await getSupabaseAdminClient()
          .from(mainTable)
          .select('*')
          .eq('id', entityId)
          .single()
        
        if (!typeError && typeData) {
          mainData = typeData
        }
      }
      
      // Step 3: Get dynamic data
      const { data: dynamicData, error: dynamicError } = await getSupabaseAdminClient()
        .from('core_dynamic_data')
        .select('field_name, field_value, field_type')
        .eq('entity_id', entityId)
      
      const fields = {}
      if (!dynamicError && dynamicData) {
        dynamicData.forEach(row => {
          fields[row.field_name] = row.field_type === 'number' 
            ? Number(row.field_value) 
            : row.field_value
        })
      }
      
      const result = {
        ...entity,
        ...mainData,
        fields
      }
      
      console.log('✅ Entity read successfully')
      return { success: true, data: result }
      
    } catch (error) {
      console.error('🚨 Entity read failed:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error 
      }
    }
  }

  /**
   * UPDATE - Universal entity updating with upsert pattern
   */
  static async updateEntity(
    organizationId: string,
    entityId: string,
    updates: Record<string, any>
  ): Promise<CrudResult>
  static async updateEntity(entityId: string, updates: UpdateData): Promise<CrudResult>
  static async updateEntity(
    organizationIdOrEntityId: string,
    entityIdOrUpdates: string | UpdateData | Record<string, any>,
    updatesOrUndefined?: Record<string, any>
  ): Promise<CrudResult> {
    try {
      // Handle method overloads
      let entityId: string
      let updates: Record<string, any>
      
      if (typeof entityIdOrUpdates === 'string' && updatesOrUndefined) {
        // New signature: updateEntity(organizationId, entityId, updates)
        entityId = entityIdOrUpdates
        updates = updatesOrUndefined
      } else if (typeof entityIdOrUpdates === 'object') {
        // Old signature: updateEntity(entityId, updates)
        entityId = organizationIdOrEntityId
        updates = entityIdOrUpdates as UpdateData
      } else {
        throw new Error('Invalid method signature')
      }
      
      console.log('📝 Updating entity:', entityId)
      
      // For new signature, use simplified approach
      if (updatesOrUndefined) {
        // Update fields in core_dynamic_data
        for (const [fieldName, fieldValue] of Object.entries(updates)) {
          const { error: dataError } = await getSupabaseAdminClient()
            .from('core_dynamic_data')
            .upsert({
              entity_id: entityId,
              field_name: fieldName,
              field_value: String(fieldValue),
              field_type: typeof fieldValue === 'number' ? 'number' : 'text'
            }, {
              onConflict: 'entity_id,field_name'
            })
          
          if (dataError) {
            console.error('❌ core_dynamic_data upsert error:', dataError)
            throw dataError
          }
        }
        
        console.log('✅ Entity updated successfully')
        return { success: true, data: { entityId } }
      }
      
      // Original complex logic for old signature
      const entityType = await this.getEntityType(entityId)
      if (!entityType) {
        throw new Error('Entity not found or invalid entity type')
      }
      
      const updateData = updates as UpdateData
      
      // Step 2: Update main entity table (if applicable)
      const mainTable = ENTITY_TABLES[entityType]
      if (mainTable && updateData.mainFields) {
        const { error: mainError } = await getSupabaseAdminClient()
          .from(mainTable)
          .update(updateData.mainFields)
          .eq('id', entityId)
        
        if (mainError) {
          console.error(`❌ ${mainTable} update error:`, mainError)
          throw mainError
        }
        
        console.log(`✅ ${mainTable} updated`)
      }
      
      // Step 3: Update core_entities table
      if (updateData.entityFields) {
        const { error: entityError } = await getSupabaseAdminClient()
          .from('core_entities')
          .update(updateData.entityFields)
          .eq('id', entityId)
        
        if (entityError) {
          console.error('❌ core_entities update error:', entityError)
          throw entityError
        }
        
        console.log('✅ core_entities updated')
      }
      
      // Step 4: Update dynamic data (upsert pattern)
      if (updateData.dynamicFields) {
        for (const [fieldName, fieldValue] of Object.entries(updateData.dynamicFields)) {
          const { error: dataError } = await getSupabaseAdminClient()
            .from('core_dynamic_data')
            .upsert({
              entity_id: entityId,
              field_name: fieldName,
              field_value: String(fieldValue),
              field_type: typeof fieldValue === 'number' ? 'number' : 'text'
            }, {
              onConflict: 'entity_id,field_name'
            })
          
          if (dataError) {
            console.error('❌ core_dynamic_data upsert error:', dataError)
            throw dataError
          }
        }
        
        console.log('✅ core_dynamic_data updated')
      }
      
      console.log('🎉 Entity updated successfully')
      return { success: true, data: true }
      
    } catch (error) {
      console.error('🚨 Entity update failed:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error 
      }
    }
  }

  /**
   * DELETE - Universal entity deletion with proper cleanup
   */
  static async deleteEntity(entityId: string): Promise<CrudResult> {
    try {
      console.log('🗑️ Deleting entity:', entityId)
      
      // Step 1: Get entity type (optional - entity might already be partially deleted)
      let entityType: string | null = null
      try {
        entityType = await this.getEntityType(entityId)
      } catch (error) {
        console.log('⚠️ Entity type not found, proceeding with cleanup anyway:', error)
      }
      
      // Step 2: Delete dynamic data first (foreign key dependency)
      const { error: dataError } = await getSupabaseAdminClient()
        .from('core_dynamic_data')
        .delete()
        .eq('entity_id', entityId)
      
      if (dataError) {
        console.error('❌ core_dynamic_data deletion error:', dataError)
        throw dataError
      }
      
      console.log('✅ core_dynamic_data deleted')
      
      // Step 3: Delete from core_entities
      const { error: entityError } = await getSupabaseAdminClient()
        .from('core_entities')
        .delete()
        .eq('id', entityId)
      
      if (entityError) {
        console.error('❌ core_entities deletion error:', entityError)
        throw entityError
      }
      
      console.log('✅ core_entities deleted')
      
      // Step 4: Delete from main table (if applicable and entity type known)
      if (entityType) {
        const mainTable = ENTITY_TABLES[entityType]
        if (mainTable) {
          const { error: mainError } = await getSupabaseAdminClient()
            .from(mainTable)
            .delete()
            .eq('id', entityId)
          
          if (mainError) {
            console.error(`❌ ${mainTable} deletion error:`, mainError)
            // Don't throw error here - continue with cleanup
            console.log(`⚠️ Continuing with deletion despite ${mainTable} error`)
          } else {
            console.log(`✅ ${mainTable} deleted`)
          }
        }
      } else {
        console.log('⚠️ Entity type unknown, skipping main table cleanup')
      }
      
      console.log('🎉 Entity deleted successfully')
      return { success: true, data: true }
      
    } catch (error) {
      console.error('🚨 Entity deletion failed:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error 
      }
    }
  }

  /**
   * LIST ENTITIES - Get multiple entities with filtering and pagination
   */
  static async listEntities(
    organizationId: string,
    entityType: string,
    options: {
      filters?: Record<string, any>
      orderBy?: { field: string; direction: 'asc' | 'desc' }
      limit?: number
      offset?: number
    } = {}
  ): Promise<CrudResult<any[]>> {
    try {
      console.log('📋 Listing entities:', { organizationId, entityType, options })
      
      // Step 1: Get entities from core_entities
      let query = getSupabaseAdminClient()
        .from('core_entities')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('entity_type', entityType)
        .eq('is_active', true)
      
      console.log('🔍 Raw query filters:', {
        organization_id: organizationId,
        entity_type: entityType,
        is_active: true
      })
      
      // Apply ordering
      if (options.orderBy) {
        query = query.order(options.orderBy.field, { ascending: options.orderBy.direction === 'asc' })
      } else {
        query = query.order('created_at', { ascending: false })
      }
      
      // Apply pagination
      if (options.limit) {
        query = query.limit(options.limit)
      }
      if (options.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
      }
      
      const { data: entities, error: entitiesError } = await query
      
      console.log('🔍 Raw database result:', {
        entities: entities,
        error: entitiesError,
        count: entities?.length || 0
      })
      
      if (entitiesError) {
        console.error('❌ Database query error:', entitiesError)
        throw entitiesError
      }
      
      if (!entities || entities.length === 0) {
        console.log('⚠️ No entities found in database')
        return { success: true, data: [] }
      }
      
      // Step 2: Get dynamic data for all entities
      const entityIds = entities.map(e => e.id)
      const { data: dynamicData, error: dynamicError } = await getSupabaseAdminClient()
        .from('core_dynamic_data')
        .select('entity_id, field_name, field_value, field_type')
        .in('entity_id', entityIds)
      
      if (dynamicError) {
        console.warn('Warning: Could not load dynamic data:', dynamicError)
      }
      
      // Step 3: Build dynamic data map
      const dynamicDataMap = new Map<string, Record<string, any>>()
      dynamicData?.forEach(row => {
        if (!dynamicDataMap.has(row.entity_id)) {
          dynamicDataMap.set(row.entity_id, {})
        }
        const fields = dynamicDataMap.get(row.entity_id)!
        
        // Convert field values to appropriate types
        let fieldValue: any = row.field_value
        if (row.field_type === 'number') {
          fieldValue = Number(row.field_value)
        } else if (row.field_value === 'true') {
          fieldValue = true
        } else if (row.field_value === 'false') {
          fieldValue = false
        }
        
        fields[row.field_name] = fieldValue
      })
      
      // Step 4: Combine entities with their dynamic data
      const result = entities.map(entity => {
        const dynamicData = dynamicDataMap.get(entity.id) || {}
        const combinedEntity = {
          ...entity,
          ...dynamicData
        }
        console.log(`🔍 Entity ${entity.entity_name} combined data:`, {
          originalEntity: entity,
          dynamicData: dynamicData,
          combinedEntity: combinedEntity
        })
        return combinedEntity
      })
      
      // Step 5: Apply filters to combined data
      let filteredResult = result
      if (options.filters) {
        console.log('🔍 Applying filters:', options.filters)
        filteredResult = result.filter(entity => {
          const passesFilter = Object.entries(options.filters!).every(([key, value]) => {
            if (value === undefined || value === null) return true
            const entityValue = entity[key]
            const passes = entityValue === value
            console.log(`🔍 Filter check - ${key}: ${entityValue} === ${value} = ${passes}`)
            return passes
          })
          console.log(`🔍 Entity ${entity.entity_name} passes filter: ${passesFilter}`)
          return passesFilter
        })
      }
      
      console.log('✅ Entities listed successfully:', filteredResult.length)
      console.log('🔍 Entity listing details:', {
        entityType,
        organizationId,
        totalEntities: entities.length,
        totalDynamicData: dynamicData?.length || 0,
        combinedResults: result.length,
        filteredResults: filteredResult.length,
        sampleEntity: entities[0],
        sampleDynamicData: dynamicData?.[0],
        finalResults: filteredResult
      })
      return { success: true, data: filteredResult }
      
    } catch (error) {
      console.error('❌ Failed to list entities:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to list entities',
        data: []
      }
    }
  }

  /**
   * SEQUENTIAL OPERATIONS - For dependent entity creation
   */
  static async sequentialOperation(
    operations: Array<{
      type: 'create' | 'update' | 'delete'
      entityType?: string
      entityData?: EntityData
      entityId?: string
      updates?: UpdateData
      dependsOn?: number // Index of operation this depends on
    }>
  ): Promise<CrudResult<any[]>> {
    try {
      console.log('🔄 Starting sequential operations:', operations.length)
      
      const results: any[] = []
      
      for (let i = 0; i < operations.length; i++) {
        const operation = operations[i]
        
        // Handle dependencies
        if (operation.dependsOn !== undefined) {
          const dependentResult = results[operation.dependsOn]
          if (!dependentResult || !dependentResult.success) {
            throw new Error(`Operation ${i} depends on failed operation ${operation.dependsOn}`)
          }
          
          // Inject dependency ID into current operation
          if (operation.entityData) {
            operation.entityData.organizationId = dependentResult.data
          }
        }
        
        let result: CrudResult
        
        switch (operation.type) {
          case 'create':
            if (!operation.entityType || !operation.entityData) {
              throw new Error(`Create operation ${i} missing required data`)
            }
            result = await this.createEntity(operation.entityData, operation.entityType)
            break
            
          case 'update':
            if (!operation.entityId || !operation.updates) {
              throw new Error(`Update operation ${i} missing required data`)
            }
            result = await this.updateEntity(operation.entityId, operation.updates)
            break
            
          case 'delete':
            if (!operation.entityId) {
              throw new Error(`Delete operation ${i} missing required data`)
            }
            result = await this.deleteEntity(operation.entityId)
            break
            
          default:
            throw new Error(`Unknown operation type: ${operation.type}`)
        }
        
        if (!result.success) {
          throw new Error(`Operation ${i} failed: ${result.error}`)
        }
        
        results.push(result)
        console.log(`✅ Operation ${i} complete:`, result.data)
      }
      
      console.log('🎉 All sequential operations completed successfully')
      return { success: true, data: results }
      
    } catch (error) {
      console.error('🚨 Sequential operations failed:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error 
      }
    }
  }

  /**
   * SAFE WRAPPER - Wraps any operation with error handling
   */
  static async safeOperation<T>(
    operation: () => Promise<T>,
    operationName: string = 'operation'
  ): Promise<CrudResult<T>> {
    try {
      console.log(`🛡️ Starting safe ${operationName}`)
      const result = await operation()
      console.log(`✅ Safe ${operationName} completed`)
      return { success: true, data: result }
    } catch (error) {
      console.error(`🚨 Safe ${operationName} failed:`, error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error 
      }
    }
  }
}

// Export default instance
export default UniversalCrudService

// Export helper functions for standalone use
export const {
  createEntity,
  readEntity,
  updateEntity,
  deleteEntity,
  sequentialOperation,
  safeOperation,
  testServiceRole,
  generateEntityCode,
  getEntityType
} = UniversalCrudService