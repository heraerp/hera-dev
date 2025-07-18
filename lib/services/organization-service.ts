/**
 * HERA Universal ERP - Organization Management Service
 * Core Organizations as Main Multi-Tenancy Key
 * Example: Microsoft (client) -> Azure, Office365, Xbox (organizations)
 */

import { supabase } from '@/lib/supabase/client'

// Organization interface based on core_organizations schema
export interface Organization {
  id: string // This is the main organization_id used across ALL tables
  client_id: string // Links to core_clients (e.g., Microsoft)
  name: string // Organization name (e.g., "Microsoft Azure", "Microsoft Office")
  org_code: string // Unique organization code
  industry: string // Industry sector
  country: string // Country code
  currency: string // Default currency
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CreateOrganizationData {
  client_id: string
  name: string
  org_code?: string
  industry?: string
  country?: string
  currency?: string
}

export interface OrganizationStats {
  totalEntities: number
  totalTransactions: number
  totalUsers: number
  totalMetadata: number
  recentActivity: any[]
}

export class OrganizationService {
  /**
   * Get all organizations for a client
   * Example: Get all Microsoft organizations (Azure, Office, Xbox, etc.)
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
   * Get single organization by ID
   * This organization_id is used as tenant key across all tables
   */
  static async getOrganization(organizationId: string): Promise<Organization> {
    const { data, error } = await supabase
      .from('core_organizations')
      .select('*')
      .eq('id', organizationId)
      .single()
    
    if (error) throw error
    return data
  }

  /**
   * Create new organization under a client
   * Example: Create "Microsoft Teams" under Microsoft client
   */
  static async createOrganization(orgData: CreateOrganizationData): Promise<Organization> {
    // Check authentication first
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError) {
      console.warn('Authentication check failed, proceeding with anonymous access:', authError.message)
    }
    
    // Generate org_code if not provided
    const orgCode = orgData.org_code || `${orgData.name.replace(/\s+/g, '-').toUpperCase()}-${Date.now()}`
    
    const { data, error } = await supabase
      .from('core_organizations')
      .insert({
        client_id: orgData.client_id,
        name: orgData.name,
        org_code: orgCode,
        industry: orgData.industry || 'technology',
        country: orgData.country || 'US',
        currency: orgData.currency || 'USD',
        is_active: true
      })
      .select()
      .single()
    
    if (error) {
      // Enhanced error handling for RLS issues
      if (error.code === '42501' || error.message.includes('row-level security')) {
        throw new Error(`Authentication required: ${error.message}. Please sign in or check RLS policies.`)
      }
      throw error
    }
    
    // Create initial transaction record for organization creation
    await this.createOrganizationTransaction(data.id, 'organization_creation', {
      action: 'create_organization',
      organization_name: orgData.name,
      client_id: orgData.client_id
    })
    
    return data
  }

  /**
   * Update organization
   */
  static async updateOrganization(organizationId: string, updates: Partial<CreateOrganizationData>): Promise<Organization> {
    const { data, error } = await supabase
      .from('core_organizations')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', organizationId)
      .select()
      .single()
    
    if (error) throw error
    
    // Create transaction record for update
    await this.createOrganizationTransaction(organizationId, 'organization_update', {
      action: 'update_organization',
      updates: updates
    })
    
    return data
  }

  /**
   * Delete organization (soft delete)
   */
  static async deleteOrganization(organizationId: string): Promise<void> {
    const { error } = await supabase
      .from('core_organizations')
      .update({ is_active: false })
      .eq('id', organizationId)
    
    if (error) throw error
    
    // Create transaction record for deletion
    await this.createOrganizationTransaction(organizationId, 'organization_deletion', {
      action: 'delete_organization'
    })
  }

  /**
   * Get organization statistics using organization_id as tenant key
   */
  static async getOrganizationStats(organizationId: string): Promise<OrganizationStats> {
    // All these queries use organization_id as the main tenant filter
    const [entitiesCount, transactionsCount, usersCount, metadataCount, recentTransactions] = await Promise.all([
      // Count entities in this organization
      supabase
        .from('core_entities')
        .select('id', { count: 'exact' })
        .eq('organization_id', organizationId)
        .eq('is_active', true),
      
      // Count transactions in this organization
      supabase
        .from('universal_transactions')
        .select('id', { count: 'exact' })
        .eq('organization_id', organizationId),
      
      // Count users in this organization
      supabase
        .from('user_organizations')
        .select('id', { count: 'exact' })
        .eq('organization_id', organizationId)
        .eq('is_active', true),
      
      // Count metadata in this organization
      supabase
        .from('core_metadata')
        .select('id', { count: 'exact' })
        .eq('organization_id', organizationId)
        .eq('is_active', true),
      
      // Get recent transactions
      supabase
        .from('universal_transactions')
        .select('*')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false })
        .limit(10)
    ])

    return {
      totalEntities: entitiesCount.count || 0,
      totalTransactions: transactionsCount.count || 0,
      totalUsers: usersCount.count || 0,
      totalMetadata: metadataCount.count || 0,
      recentActivity: recentTransactions.data || []
    }
  }

  /**
   * Get all entities within an organization
   * Uses organization_id as tenant filter
   */
  static async getOrganizationEntities(organizationId: string, entityType?: string): Promise<any[]> {
    let query = supabase
      .from('core_entities')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (entityType) {
      query = query.eq('entity_type', entityType)
    }

    const { data, error } = await query
    if (error) throw error
    return data || []
  }

  /**
   * Get organization metadata
   */
  static async getOrganizationMetadata(organizationId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('core_metadata')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('entity_type', 'organization')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  }

  /**
   * Add metadata to organization
   */
  static async addOrganizationMetadata(organizationId: string, metadata: Record<string, any>): Promise<void> {
    const metadataEntries = Object.entries(metadata).map(([key, value]) => ({
      organization_id: organizationId,
      entity_id: organizationId, // For organization, entity_id = organization_id
      entity_type: 'organization',
      metadata_type: 'organization_data',
      metadata_category: 'settings',
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
   * Get organization users
   */
  static async getOrganizationUsers(organizationId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('user_organizations')
      .select(`
        id,
        user_id,
        role,
        is_active,
        created_at,
        core_users (
          id,
          email,
          full_name,
          is_active
        )
      `)
      .eq('organization_id', organizationId)
      .eq('is_active', true)
    
    if (error) throw error
    return data || []
  }

  /**
   * Add user to organization
   */
  static async addUserToOrganization(organizationId: string, userId: string, role: string = 'user'): Promise<void> {
    const { error } = await supabase
      .from('user_organizations')
      .insert({
        user_id: userId,
        organization_id: organizationId,
        role: role,
        is_active: true
      })
    
    if (error) throw error
    
    // Create transaction record
    await this.createOrganizationTransaction(organizationId, 'user_added', {
      action: 'add_user',
      user_id: userId,
      role: role
    })
  }

  /**
   * Search organizations across all clients (with proper tenant filtering)
   */
  static async searchOrganizations(query: string, clientId?: string): Promise<Organization[]> {
    let searchQuery = supabase
      .from('core_organizations')
      .select('*')
      .or(`name.ilike.%${query}%,org_code.ilike.%${query}%`)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(50)

    if (clientId) {
      searchQuery = searchQuery.eq('client_id', clientId)
    }

    const { data, error } = await searchQuery
    if (error) throw error
    return data || []
  }

  /**
   * Get organization hierarchy (client -> organizations)
   */
  static async getOrganizationHierarchy(organizationId: string): Promise<{
    client: any
    organization: Organization
    siblings: Organization[]
  }> {
    // Get the organization
    const organization = await this.getOrganization(organizationId)
    
    // Get the parent client
    const { data: client, error: clientError } = await supabase
      .from('core_clients')
      .select('*')
      .eq('id', organization.client_id)
      .single()
    
    if (clientError) throw clientError
    
    // Get sibling organizations
    const siblings = await this.getClientOrganizations(organization.client_id)
    
    return {
      client,
      organization,
      siblings: siblings.filter(org => org.id !== organizationId)
    }
  }

  /**
   * Switch user context to different organization (multi-tenancy)
   */
  static async switchOrganizationContext(userId: string, organizationId: string): Promise<{
    organization: Organization
    userRole: string
    permissions: string[]
  }> {
    // Verify user has access to this organization
    const { data: userOrg, error } = await supabase
      .from('user_organizations')
      .select('role')
      .eq('user_id', userId)
      .eq('organization_id', organizationId)
      .eq('is_active', true)
      .single()
    
    if (error) throw new Error('User does not have access to this organization')
    
    // Get organization details
    const organization = await this.getOrganization(organizationId)
    
    // Define permissions based on role (this would be more complex in real implementation)
    const permissions = this.getRolePermissions(userOrg.role)
    
    // Create context switch transaction
    await this.createOrganizationTransaction(organizationId, 'context_switch', {
      action: 'switch_context',
      user_id: userId,
      role: userOrg.role
    })
    
    return {
      organization,
      userRole: userOrg.role,
      permissions
    }
  }

  /**
   * Create transaction record for organization operations
   */
  private static async createOrganizationTransaction(
    organizationId: string,
    transactionType: string,
    data: any
  ): Promise<void> {
    const { error } = await supabase
      .from('universal_transactions')
      .insert({
        organization_id: organizationId, // This is the key field for multi-tenancy
        transaction_type: transactionType,
        transaction_number: `ORG-${Date.now()}`,
        transaction_date: new Date().toISOString().split('T')[0],
        total_amount: 0,
        currency: 'USD',
        status: 'completed',
        procurement_metadata: data
      })
    
    if (error) throw error
  }

  /**
   * Get role permissions (simplified for demo)
   */
  private static getRolePermissions(role: string): string[] {
    const rolePermissions: Record<string, string[]> = {
      'admin': ['read', 'write', 'delete', 'manage_users', 'manage_settings'],
      'manager': ['read', 'write', 'manage_team'],
      'user': ['read', 'write'],
      'viewer': ['read']
    }
    
    return rolePermissions[role] || ['read']
  }

  /**
   * Real-time subscription for organization changes
   */
  static subscribeToOrganizationChanges(organizationId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`organization-${organizationId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'core_organizations', filter: `id=eq.${organizationId}` },
        callback
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'core_entities', filter: `organization_id=eq.${organizationId}` },
        callback
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'universal_transactions', filter: `organization_id=eq.${organizationId}` },
        callback
      )
      .subscribe()
  }

  /**
   * Unsubscribe from organization changes
   */
  static unsubscribe(subscription: any) {
    if (subscription) {
      supabase.removeChannel(subscription)
    }
  }
}

export default OrganizationService