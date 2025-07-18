/**
 * HERA Universal ERP - Universal Client Management Service
 * Leverages Universal Master Data & Universal Transactions Architecture
 */

import { supabase } from '@/lib/supabase/client'

// Enhanced types for Universal Architecture
export interface UniversalClient {
  id: string
  client_name: string
  client_code: string
  client_type: string
  is_active: boolean
  created_at: string
  updated_at: string
  // Enhanced fields from universal architecture
  organizations?: Organization[]
  entities?: CoreEntity[]
  metadata?: ClientMetadata[]
  transactions?: TransactionSummary
  dynamic_data?: DynamicData[]
}

export interface Organization {
  id: string
  client_id: string
  name: string
  org_code: string
  industry: string
  country: string
  currency: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CoreEntity {
  id: string
  organization_id: string
  entity_type: string
  entity_name: string
  entity_code: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ClientMetadata {
  id: string
  entity_id: string
  entity_type: string
  metadata_type: string
  metadata_category: string
  metadata_key: string
  metadata_value: any
  is_active: boolean
  ai_generated: boolean
  ai_confidence_score: number
  created_at: string
}

export interface DynamicData {
  id: string
  entity_id: string
  field_name: string
  field_value: string
  field_type: string
  created_at: string
}

export interface TransactionSummary {
  total_transactions: number
  total_amount: number
  recent_transactions: UniversalTransaction[]
}

export interface UniversalTransaction {
  id: string
  organization_id: string
  transaction_type: string
  transaction_number: string
  transaction_date: string
  total_amount: number
  currency: string
  status: string
  created_at: string
}

export class UniversalClientService {
  /**
   * Get all clients with enhanced universal data
   */
  static async getUniversalClients(): Promise<UniversalClient[]> {
    // Get basic client data
    const { data: clients, error } = await supabase
      .from('core_clients')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    
    // Enhance with universal data
    const enhancedClients = await Promise.all(
      clients.map(async (client) => {
        const [organizations, entities, metadata, transactions] = await Promise.all([
          this.getClientOrganizations(client.id),
          this.getClientEntities(client.id),
          this.getClientMetadata(client.id),
          this.getClientTransactionSummary(client.id)
        ])
        
        return {
          ...client,
          organizations,
          entities,
          metadata,
          transactions
        }
      })
    )
    
    return enhancedClients
  }

  /**
   * Get client organizations
   */
  static async getClientOrganizations(clientId: string): Promise<Organization[]> {
    const { data, error } = await supabase
      .from('core_organizations')
      .select('*')
      .eq('client_id', clientId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  }

  /**
   * Get client entities from universal entity system
   */
  static async getClientEntities(clientId: string): Promise<CoreEntity[]> {
    // Get organizations first
    const organizations = await this.getClientOrganizations(clientId)
    const orgIds = organizations.map(org => org.id)
    
    if (orgIds.length === 0) return []
    
    const { data, error } = await supabase
      .from('core_entities')
      .select('*')
      .in('organization_id', orgIds)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  }

  /**
   * Get client metadata from universal metadata system
   */
  static async getClientMetadata(clientId: string): Promise<ClientMetadata[]> {
    const { data, error } = await supabase
      .from('core_metadata')
      .select('*')
      .eq('entity_id', clientId)
      .eq('entity_type', 'client')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  }

  /**
   * Get client transaction summary from universal transactions
   */
  static async getClientTransactionSummary(clientId: string): Promise<TransactionSummary> {
    // Get client organizations
    const organizations = await this.getClientOrganizations(clientId)
    const orgIds = organizations.map(org => org.id)
    
    if (orgIds.length === 0) {
      return { total_transactions: 0, total_amount: 0, recent_transactions: [] }
    }
    
    // Get transaction summary
    const { data: transactions, error } = await supabase
      .from('universal_transactions')
      .select('*')
      .in('organization_id', orgIds)
      .order('created_at', { ascending: false })
      .limit(10)
    
    if (error) throw error
    
    const totalAmount = transactions?.reduce((sum, t) => sum + (Number(t.total_amount) || 0), 0) || 0
    
    return {
      total_transactions: transactions?.length || 0,
      total_amount: totalAmount,
      recent_transactions: transactions || []
    }
  }

  /**
   * Create client with universal architecture integration
   */
  static async createUniversalClient(clientData: {
    client_name: string
    client_code: string
    client_type: string
    metadata?: Record<string, any>
    dynamic_fields?: Record<string, any>
  }): Promise<UniversalClient> {
    
    // Create basic client
    const { data: client, error: clientError } = await supabase
      .from('core_clients')
      .insert({
        client_name: clientData.client_name,
        client_code: clientData.client_code,
        client_type: clientData.client_type
      })
      .select()
      .single()
    
    if (clientError) throw clientError
    
    // Add metadata if provided
    if (clientData.metadata) {
      await this.addClientMetadata(client.id, clientData.metadata)
    }
    
    // Add dynamic fields if provided
    if (clientData.dynamic_fields) {
      await this.addClientDynamicData(client.id, clientData.dynamic_fields)
    }
    
    // Create universal transaction record for client creation
    await this.createClientTransaction(client.id, 'client_creation', {
      action: 'create_client',
      client_name: clientData.client_name,
      client_code: clientData.client_code
    })
    
    return client
  }

  /**
   * Add metadata to client using universal metadata system
   */
  static async addClientMetadata(clientId: string, metadata: Record<string, any>): Promise<void> {
    const metadataEntries = Object.entries(metadata).map(([key, value]) => ({
      entity_id: clientId,
      entity_type: 'client',
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
   * Add dynamic data to client
   */
  static async addClientDynamicData(clientId: string, dynamicData: Record<string, any>): Promise<void> {
    const dynamicEntries = Object.entries(dynamicData).map(([key, value]) => ({
      entity_id: clientId,
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
   * Create transaction record for client operations
   */
  static async createClientTransaction(clientId: string, transactionType: string, data: any): Promise<void> {
    // Get client's first organization or create a system org
    const organizations = await this.getClientOrganizations(clientId)
    let orgId = organizations[0]?.id
    
    if (!orgId) {
      // Create system organization for client
      const { data: org, error: orgError } = await supabase
        .from('core_organizations')
        .insert({
          client_id: clientId,
          name: 'System Organization',
          org_code: `SYS-${Date.now()}`,
          industry: 'system',
          country: 'US',
          currency: 'USD'
        })
        .select()
        .single()
      
      if (orgError) throw orgError
      orgId = org.id
    }
    
    // Create universal transaction
    const { error } = await supabase
      .from('universal_transactions')
      .insert({
        organization_id: orgId,
        transaction_type: transactionType,
        transaction_number: `TXN-${Date.now()}`,
        transaction_date: new Date().toISOString().split('T')[0],
        total_amount: 0,
        currency: 'USD',
        status: 'completed',
        procurement_metadata: data
      })
    
    if (error) throw error
  }

  /**
   * Get client with full universal data
   */
  static async getUniversalClient(clientId: string): Promise<UniversalClient> {
    const { data: client, error } = await supabase
      .from('core_clients')
      .select('*')
      .eq('id', clientId)
      .single()
    
    if (error) throw error
    
    // Get all related data
    const [organizations, entities, metadata, transactions, dynamicData] = await Promise.all([
      this.getClientOrganizations(clientId),
      this.getClientEntities(clientId),
      this.getClientMetadata(clientId),
      this.getClientTransactionSummary(clientId),
      this.getClientDynamicData(clientId)
    ])
    
    return {
      ...client,
      organizations,
      entities,
      metadata,
      transactions,
      dynamic_data: dynamicData
    }
  }

  /**
   * Get client dynamic data
   */
  static async getClientDynamicData(clientId: string): Promise<DynamicData[]> {
    const { data, error } = await supabase
      .from('core_dynamic_data')
      .select('*')
      .eq('entity_id', clientId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  }

  /**
   * Update client with universal architecture
   */
  static async updateUniversalClient(clientId: string, updates: {
    client_name?: string
    client_code?: string
    client_type?: string
    metadata?: Record<string, any>
    dynamic_fields?: Record<string, any>
  }): Promise<UniversalClient> {
    
    // Update basic client data
    const { data: client, error: clientError } = await supabase
      .from('core_clients')
      .update({
        client_name: updates.client_name,
        client_code: updates.client_code,
        client_type: updates.client_type,
        updated_at: new Date().toISOString()
      })
      .eq('id', clientId)
      .select()
      .single()
    
    if (clientError) throw clientError
    
    // Update metadata if provided
    if (updates.metadata) {
      await this.updateClientMetadata(clientId, updates.metadata)
    }
    
    // Update dynamic fields if provided
    if (updates.dynamic_fields) {
      await this.updateClientDynamicData(clientId, updates.dynamic_fields)
    }
    
    // Create transaction record for update
    await this.createClientTransaction(clientId, 'client_update', {
      action: 'update_client',
      updates: updates
    })
    
    return this.getUniversalClient(clientId)
  }

  /**
   * Update client metadata
   */
  static async updateClientMetadata(clientId: string, metadata: Record<string, any>): Promise<void> {
    // First, deactivate existing metadata
    await supabase
      .from('core_metadata')
      .update({ is_active: false })
      .eq('entity_id', clientId)
      .eq('entity_type', 'client')
    
    // Then add new metadata
    await this.addClientMetadata(clientId, metadata)
  }

  /**
   * Update client dynamic data
   */
  static async updateClientDynamicData(clientId: string, dynamicData: Record<string, any>): Promise<void> {
    // Delete existing dynamic data
    await supabase
      .from('core_dynamic_data')
      .delete()
      .eq('entity_id', clientId)
    
    // Add new dynamic data
    await this.addClientDynamicData(clientId, dynamicData)
  }

  /**
   * Search clients with universal data
   */
  static async searchUniversalClients(query: string): Promise<UniversalClient[]> {
    const { data: clients, error } = await supabase
      .from('core_clients')
      .select('*')
      .or(`client_name.ilike.%${query}%,client_code.ilike.%${query}%`)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(50)
    
    if (error) throw error
    
    // Enhance with universal data
    const enhancedClients = await Promise.all(
      clients.map(async (client) => {
        const [organizations, metadata, transactions] = await Promise.all([
          this.getClientOrganizations(client.id),
          this.getClientMetadata(client.id),
          this.getClientTransactionSummary(client.id)
        ])
        
        return {
          ...client,
          organizations,
          metadata,
          transactions
        }
      })
    )
    
    return enhancedClients
  }

  /**
   * Get client analytics using universal data
   */
  static async getClientAnalytics(clientId: string): Promise<{
    totalOrganizations: number
    totalEntities: number
    totalTransactions: number
    totalTransactionAmount: number
    metadataCount: number
    dynamicFieldsCount: number
    activityTimeline: any[]
  }> {
    const [organizations, entities, transactions, metadata, dynamicData] = await Promise.all([
      this.getClientOrganizations(clientId),
      this.getClientEntities(clientId),
      this.getClientTransactionSummary(clientId),
      this.getClientMetadata(clientId),
      this.getClientDynamicData(clientId)
    ])
    
    // Get activity timeline from events
    const { data: events, error: eventsError } = await supabase
      .from('core_events_timeseries')
      .select('*')
      .eq('entity_id', clientId)
      .order('timestamp', { ascending: false })
      .limit(20)
    
    if (eventsError) console.error('Error fetching events:', eventsError)
    
    return {
      totalOrganizations: organizations.length,
      totalEntities: entities.length,
      totalTransactions: transactions.total_transactions,
      totalTransactionAmount: transactions.total_amount,
      metadataCount: metadata.length,
      dynamicFieldsCount: dynamicData.length,
      activityTimeline: events || []
    }
  }

  /**
   * Real-time subscription for client changes
   */
  static subscribeToUniversalClients(callback: (payload: any) => void) {
    return supabase
      .channel('universal-clients')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'core_clients' }, callback)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'core_organizations' }, callback)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'core_metadata' }, callback)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'universal_transactions' }, callback)
      .subscribe()
  }
}

export default UniversalClientService