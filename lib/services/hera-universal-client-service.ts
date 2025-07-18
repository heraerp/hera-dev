/**
 * HERA Universal ERP - Universal Client Service (CORRECT IMPLEMENTATION)
 * Following HERA Universal Architecture Constraints
 * Uses ONLY: core_entities + core_dynamic_data + core_relationships + core_metadata
 */

import { supabase } from '@/lib/supabase/client'

// Universal Entity Types for HERA
export const ENTITY_TYPES = {
  CLIENT: 'client',
  ORGANIZATION: 'organization',
  CONTACT: 'contact',
  ADDRESS: 'address',
  BUSINESS_UNIT: 'business_unit'
} as const

export const RELATIONSHIP_TYPES = {
  CLIENT_ORGANIZATION: 'client_organization',
  CLIENT_CONTACT: 'client_contact',
  CLIENT_ADDRESS: 'client_address',
  ORGANIZATION_CONTACT: 'organization_contact',
  ORGANIZATION_ADDRESS: 'organization_address'
} as const

export interface UniversalEntity {
  id: string
  organization_id: string
  entity_type: string
  entity_name: string
  entity_code: string
  is_active: boolean
  created_at: string
  updated_at: string
  // Enhanced with dynamic data
  dynamic_fields?: Record<string, any>
  metadata?: Record<string, any>
  relationships?: EntityRelationship[]
}

export interface EntityRelationship {
  id: string
  source_entity_id: string
  target_entity_id: string
  relationship_type: string
  relationship_data?: any
  is_active: boolean
  created_at: string
}

export interface DynamicField {
  id: string
  entity_id: string
  field_name: string
  field_value: string
  field_type: string
  created_at: string
  updated_at: string
}

export interface EntityMetadata {
  id: string
  organization_id: string
  entity_type: string
  entity_id: string
  metadata_type: string
  metadata_category: string
  metadata_key: string
  metadata_value: any
  is_active: boolean
  created_at: string
}

export class HERAUniversalClientService {
  /**
   * Create Client Entity using Universal Pattern
   * Client = core_entities record with entity_type = 'client'
   */
  static async createClient(data: {
    entity_name: string
    entity_code: string
    organization_id: string
    dynamic_fields?: Record<string, any>
    metadata?: Record<string, any>
  }): Promise<UniversalEntity> {
    
    // 1. Create main client entity in core_entities
    const { data: clientEntity, error: entityError } = await supabase
      .from('core_entities')
      .insert({
        organization_id: data.organization_id,
        entity_type: ENTITY_TYPES.CLIENT,
        entity_name: data.entity_name,
        entity_code: data.entity_code,
        is_active: true
      })
      .select()
      .single()

    if (entityError) throw entityError

    // 2. Add dynamic fields to core_dynamic_data
    if (data.dynamic_fields) {
      await this.addDynamicFields(clientEntity.id, data.dynamic_fields)
    }

    // 3. Add metadata to core_metadata
    if (data.metadata) {
      await this.addMetadata(clientEntity.id, ENTITY_TYPES.CLIENT, data.metadata)
    }

    // 4. Create transaction record
    await this.createEntityTransaction(clientEntity.id, 'entity_create', {
      entity_type: ENTITY_TYPES.CLIENT,
      entity_name: data.entity_name,
      entity_code: data.entity_code
    })

    return this.getEntityWithEnhancedData(clientEntity.id)
  }

  /**
   * Get All Client Entities
   */
  static async getClients(organizationId: string): Promise<UniversalEntity[]> {
    const { data: entities, error } = await supabase
      .from('core_entities')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('entity_type', ENTITY_TYPES.CLIENT)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) throw error

    // Enhance each entity with dynamic data and metadata
    const enhancedEntities = await Promise.all(
      entities.map(entity => this.getEntityWithEnhancedData(entity.id))
    )

    return enhancedEntities
  }

  /**
   * Get Single Client Entity with Full Data
   */
  static async getClient(entityId: string): Promise<UniversalEntity> {
    return this.getEntityWithEnhancedData(entityId)
  }

  /**
   * Update Client Entity
   */
  static async updateClient(entityId: string, updates: {
    entity_name?: string
    entity_code?: string
    dynamic_fields?: Record<string, any>
    metadata?: Record<string, any>
  }): Promise<UniversalEntity> {
    
    // 1. Update main entity
    const { data: entity, error: entityError } = await supabase
      .from('core_entities')
      .update({
        entity_name: updates.entity_name,
        entity_code: updates.entity_code,
        updated_at: new Date().toISOString()
      })
      .eq('id', entityId)
      .select()
      .single()

    if (entityError) throw entityError

    // 2. Update dynamic fields
    if (updates.dynamic_fields) {
      await this.updateDynamicFields(entityId, updates.dynamic_fields)
    }

    // 3. Update metadata
    if (updates.metadata) {
      await this.updateMetadata(entityId, ENTITY_TYPES.CLIENT, updates.metadata)
    }

    // 4. Create transaction record
    await this.createEntityTransaction(entityId, 'entity_update', {
      updates: updates
    })

    return this.getEntityWithEnhancedData(entityId)
  }

  /**
   * Delete Client Entity (Soft Delete)
   */
  static async deleteClient(entityId: string): Promise<void> {
    // Soft delete by setting is_active = false
    const { error } = await supabase
      .from('core_entities')
      .update({ is_active: false })
      .eq('id', entityId)

    if (error) throw error

    // Create transaction record
    await this.createEntityTransaction(entityId, 'entity_delete', {
      action: 'soft_delete'
    })
  }

  /**
   * Create Organization Entity and Link to Client
   */
  static async createOrganization(clientId: string, data: {
    entity_name: string
    entity_code: string
    organization_id: string
    dynamic_fields?: Record<string, any>
  }): Promise<UniversalEntity> {
    
    // 1. Create organization entity
    const { data: orgEntity, error: entityError } = await supabase
      .from('core_entities')
      .insert({
        organization_id: data.organization_id,
        entity_type: ENTITY_TYPES.ORGANIZATION,
        entity_name: data.entity_name,
        entity_code: data.entity_code,
        is_active: true
      })
      .select()
      .single()

    if (entityError) throw entityError

    // 2. Create relationship between client and organization
    await this.createRelationship(
      clientId,
      orgEntity.id,
      RELATIONSHIP_TYPES.CLIENT_ORGANIZATION
    )

    // 3. Add dynamic fields
    if (data.dynamic_fields) {
      await this.addDynamicFields(orgEntity.id, data.dynamic_fields)
    }

    return this.getEntityWithEnhancedData(orgEntity.id)
  }

  /**
   * Get Client Organizations through Relationships
   */
  static async getClientOrganizations(clientId: string): Promise<UniversalEntity[]> {
    // Get relationships to find organization IDs
    const { data: relationships, error: relError } = await supabase
      .from('core_relationships')
      .select('target_entity_id')
      .eq('source_entity_id', clientId)
      .eq('relationship_type', RELATIONSHIP_TYPES.CLIENT_ORGANIZATION)
      .eq('is_active', true)

    if (relError) throw relError

    if (!relationships || relationships.length === 0) return []

    const orgIds = relationships.map(rel => rel.target_entity_id)

    // Get organization entities
    const { data: orgEntities, error: orgError } = await supabase
      .from('core_entities')
      .select('*')
      .in('id', orgIds)
      .eq('entity_type', ENTITY_TYPES.ORGANIZATION)
      .eq('is_active', true)

    if (orgError) throw orgError

    // Enhance with dynamic data
    const enhancedOrgs = await Promise.all(
      orgEntities.map(org => this.getEntityWithEnhancedData(org.id))
    )

    return enhancedOrgs
  }

  /**
   * Search Client Entities
   */
  static async searchClients(organizationId: string, query: string): Promise<UniversalEntity[]> {
    const { data: entities, error } = await supabase
      .from('core_entities')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('entity_type', ENTITY_TYPES.CLIENT)
      .eq('is_active', true)
      .or(`entity_name.ilike.%${query}%,entity_code.ilike.%${query}%`)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) throw error

    const enhancedEntities = await Promise.all(
      entities.map(entity => this.getEntityWithEnhancedData(entity.id))
    )

    return enhancedEntities
  }

  /**
   * Get Entity with Enhanced Data (Dynamic Fields + Metadata + Relationships)
   */
  private static async getEntityWithEnhancedData(entityId: string): Promise<UniversalEntity> {
    // Get main entity
    const { data: entity, error: entityError } = await supabase
      .from('core_entities')
      .select('*')
      .eq('id', entityId)
      .single()

    if (entityError) throw entityError

    // Get dynamic fields
    const { data: dynamicFields, error: dynamicError } = await supabase
      .from('core_dynamic_data')
      .select('*')
      .eq('entity_id', entityId)

    if (dynamicError) console.error('Dynamic fields error:', dynamicError)

    // Get metadata
    const { data: metadata, error: metadataError } = await supabase
      .from('core_metadata')
      .select('*')
      .eq('entity_id', entityId)
      .eq('is_active', true)

    if (metadataError) console.error('Metadata error:', metadataError)

    // Get relationships
    const { data: relationships, error: relationshipError } = await supabase
      .from('core_relationships')
      .select('*')
      .eq('source_entity_id', entityId)
      .eq('is_active', true)

    if (relationshipError) console.error('Relationships error:', relationshipError)

    // Transform dynamic fields to object
    const dynamicFieldsObj = dynamicFields?.reduce((acc, field) => {
      acc[field.field_name] = field.field_value
      return acc
    }, {} as Record<string, any>) || {}

    // Transform metadata to object
    const metadataObj = metadata?.reduce((acc, meta) => {
      acc[meta.metadata_key] = meta.metadata_value
      return acc
    }, {} as Record<string, any>) || {}

    return {
      ...entity,
      dynamic_fields: dynamicFieldsObj,
      metadata: metadataObj,
      relationships: relationships || []
    }
  }

  /**
   * Add Dynamic Fields to Entity
   */
  private static async addDynamicFields(entityId: string, fields: Record<string, any>): Promise<void> {
    const dynamicEntries = Object.entries(fields).map(([key, value]) => ({
      entity_id: entityId,
      field_name: key,
      field_value: String(value),
      field_type: typeof value
    }))

    const { error } = await supabase
      .from('core_dynamic_data')
      .insert(dynamicEntries)

    if (error) throw error
  }

  /**
   * Update Dynamic Fields
   */
  private static async updateDynamicFields(entityId: string, fields: Record<string, any>): Promise<void> {
    // Delete existing dynamic fields
    await supabase
      .from('core_dynamic_data')
      .delete()
      .eq('entity_id', entityId)

    // Add new dynamic fields
    await this.addDynamicFields(entityId, fields)
  }

  /**
   * Add Metadata to Entity
   */
  private static async addMetadata(entityId: string, entityType: string, metadata: Record<string, any>): Promise<void> {
    const metadataEntries = Object.entries(metadata).map(([key, value]) => ({
      entity_id: entityId,
      entity_type: entityType,
      metadata_type: 'client_data',
      metadata_category: 'general',
      metadata_key: key,
      metadata_value: value,
      metadata_value_type: typeof value,
      is_system_generated: false,
      is_user_editable: true,
      is_searchable: true,
      is_active: true,
      ai_generated: false,
      ai_confidence_score: 1.0
    }))

    const { error } = await supabase
      .from('core_metadata')
      .insert(metadataEntries)

    if (error) throw error
  }

  /**
   * Update Metadata
   */
  private static async updateMetadata(entityId: string, entityType: string, metadata: Record<string, any>): Promise<void> {
    // Deactivate existing metadata
    await supabase
      .from('core_metadata')
      .update({ is_active: false })
      .eq('entity_id', entityId)
      .eq('entity_type', entityType)

    // Add new metadata
    await this.addMetadata(entityId, entityType, metadata)
  }

  /**
   * Create Relationship between Entities
   */
  private static async createRelationship(
    sourceEntityId: string,
    targetEntityId: string,
    relationshipType: string
  ): Promise<void> {
    const { error } = await supabase
      .from('core_relationships')
      .insert({
        source_entity_id: sourceEntityId,
        target_entity_id: targetEntityId,
        relationship_type: relationshipType,
        is_active: true
      })

    if (error) throw error
  }

  /**
   * Create Transaction Record using Universal Transactions
   */
  private static async createEntityTransaction(
    entityId: string,
    transactionType: string,
    data: any
  ): Promise<void> {
    // Get entity to find organization
    const { data: entity, error: entityError } = await supabase
      .from('core_entities')
      .select('organization_id')
      .eq('id', entityId)
      .single()

    if (entityError) throw entityError

    // Create universal transaction
    const { error } = await supabase
      .from('universal_transactions')
      .insert({
        organization_id: entity.organization_id,
        transaction_type: transactionType,
        transaction_number: `TXN-${Date.now()}`,
        transaction_date: new Date().toISOString().split('T')[0],
        total_amount: 0,
        currency: 'USD',
        status: 'completed',
        procurement_metadata: {
          entity_id: entityId,
          ...data
        }
      })

    if (error) throw error
  }

  /**
   * Get Client Analytics using Universal Pattern
   */
  static async getClientAnalytics(clientId: string): Promise<any> {
    const [organizations, transactions, metadata, dynamicFields] = await Promise.all([
      this.getClientOrganizations(clientId),
      this.getClientTransactions(clientId),
      this.getClientMetadata(clientId),
      this.getClientDynamicFields(clientId)
    ])

    const totalTransactionAmount = transactions.reduce((sum, txn) => sum + (Number(txn.total_amount) || 0), 0)

    return {
      totalOrganizations: organizations.length,
      totalTransactions: transactions.length,
      totalTransactionAmount,
      metadataCount: metadata.length,
      dynamicFieldsCount: dynamicFields.length,
      organizations,
      recentTransactions: transactions.slice(0, 10)
    }
  }

  /**
   * Get Client Transactions
   */
  private static async getClientTransactions(clientId: string): Promise<any[]> {
    const { data: entity, error: entityError } = await supabase
      .from('core_entities')
      .select('organization_id')
      .eq('id', clientId)
      .single()

    if (entityError) throw entityError

    const { data: transactions, error } = await supabase
      .from('universal_transactions')
      .select('*')
      .eq('organization_id', entity.organization_id)
      .order('created_at', { ascending: false })

    if (error) throw error
    return transactions || []
  }

  /**
   * Get Client Metadata
   */
  private static async getClientMetadata(clientId: string): Promise<any[]> {
    const { data: metadata, error } = await supabase
      .from('core_metadata')
      .select('*')
      .eq('entity_id', clientId)
      .eq('is_active', true)

    if (error) throw error
    return metadata || []
  }

  /**
   * Get Client Dynamic Fields
   */
  private static async getClientDynamicFields(clientId: string): Promise<any[]> {
    const { data: fields, error } = await supabase
      .from('core_dynamic_data')
      .select('*')
      .eq('entity_id', clientId)

    if (error) throw error
    return fields || []
  }

  /**
   * Real-time Subscription for Universal Client Changes
   */
  static subscribeToClientChanges(callback: (payload: any) => void) {
    return supabase
      .channel('universal-client-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'core_entities' }, callback)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'core_dynamic_data' }, callback)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'core_metadata' }, callback)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'core_relationships' }, callback)
      .subscribe()
  }
}

export default HERAUniversalClientService