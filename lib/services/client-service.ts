/**
 * HERA Universal ERP - Client Management Service
 * Direct Supabase API integration for client operations
 */

import { supabase } from '@/lib/supabase/client'
import type { Client, Organization, CreateClientData, CreateOrganizationData } from '@/lib/supabase/client'

export class ClientService {
  /**
   * Get all active clients
   */
  static async getClients(): Promise<Client[]> {
    const { data, error } = await supabase
      .from('core_clients')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching clients:', error)
      throw error
    }
    
    return data || []
  }

  /**
   * Get client by ID
   */
  static async getClient(clientId: string): Promise<Client> {
    const { data, error } = await supabase
      .from('core_clients')
      .select('*')
      .eq('id', clientId)
      .single()
    
    if (error) {
      console.error('Error fetching client:', error)
      throw error
    }
    
    return data
  }

  /**
   * Create a new client
   */
  static async createClient(clientData: CreateClientData): Promise<Client> {
    const { data, error } = await supabase
      .from('core_clients')
      .insert({
        client_name: clientData.client_name,
        client_code: clientData.client_code,
        client_type: clientData.client_type || 'enterprise'
      })
      .select()
      .single()
    
    if (error) {
      console.error('Error creating client:', error)
      throw error
    }
    
    return data
  }

  /**
   * Update client
   */
  static async updateClient(clientId: string, updates: Partial<CreateClientData>): Promise<Client> {
    const { data, error } = await supabase
      .from('core_clients')
      .update(updates)
      .eq('id', clientId)
      .select()
      .single()
    
    if (error) {
      console.error('Error updating client:', error)
      throw error
    }
    
    return data
  }

  /**
   * Delete client (soft delete)
   */
  static async deleteClient(clientId: string): Promise<void> {
    const { error } = await supabase
      .from('core_clients')
      .update({ is_active: false })
      .eq('id', clientId)
    
    if (error) {
      console.error('Error deleting client:', error)
      throw error
    }
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
    
    if (error) {
      console.error('Error fetching organizations:', error)
      throw error
    }
    
    return data || []
  }

  /**
   * Create organization for client
   */
  static async createOrganization(clientId: string, orgData: CreateOrganizationData): Promise<Organization> {
    const { data, error } = await supabase
      .from('core_organizations')
      .insert({
        client_id: clientId,
        name: orgData.name,
        org_code: orgData.org_code || `${orgData.name.replace(/\s+/g, '-').toUpperCase()}-${Date.now()}`,
        industry: orgData.industry || 'general',
        country: orgData.country || 'US',
        currency: orgData.currency || 'USD'
      })
      .select()
      .single()
    
    if (error) {
      console.error('Error creating organization:', error)
      throw error
    }
    
    return data
  }

  /**
   * Update organization
   */
  static async updateOrganization(orgId: string, updates: Partial<CreateOrganizationData>): Promise<Organization> {
    const { data, error } = await supabase
      .from('core_organizations')
      .update(updates)
      .eq('id', orgId)
      .select()
      .single()
    
    if (error) {
      console.error('Error updating organization:', error)
      throw error
    }
    
    return data
  }

  /**
   * Delete organization (soft delete)
   */
  static async deleteOrganization(orgId: string): Promise<void> {
    const { error } = await supabase
      .from('core_organizations')
      .update({ is_active: false })
      .eq('id', orgId)
    
    if (error) {
      console.error('Error deleting organization:', error)
      throw error
    }
  }

  /**
   * Search clients by name or code
   */
  static async searchClients(query: string): Promise<Client[]> {
    const { data, error } = await supabase
      .from('core_clients')
      .select('*')
      .or(`client_name.ilike.%${query}%,client_code.ilike.%${query}%`)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(50)
    
    if (error) {
      console.error('Error searching clients:', error)
      throw error
    }
    
    return data || []
  }

  /**
   * Get client statistics
   */
  static async getClientStats(clientId: string): Promise<{
    totalOrganizations: number
    totalUsers: number
    totalTransactions: number
    lastActivity: string | null
  }> {
    const [orgCount, userCount, transactionCount] = await Promise.all([
      supabase
        .from('core_organizations')
        .select('id', { count: 'exact' })
        .eq('client_id', clientId)
        .eq('is_active', true),
      
      supabase
        .from('core_users')
        .select('id', { count: 'exact' })
        .eq('client_id', clientId)
        .eq('is_active', true),
      
      supabase
        .from('core_transactions')
        .select('id', { count: 'exact' })
        .eq('client_id', clientId)
    ])

    // Get last activity
    const { data: lastActivity } = await supabase
      .from('core_transactions')
      .select('created_at')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    return {
      totalOrganizations: orgCount.count || 0,
      totalUsers: userCount.count || 0,
      totalTransactions: transactionCount.count || 0,
      lastActivity: lastActivity?.created_at || null
    }
  }

  /**
   * Subscribe to client changes (real-time)
   */
  static subscribeToClients(callback: (payload: any) => void) {
    return supabase
      .channel('clients-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'core_clients' }, 
        callback
      )
      .subscribe()
  }

  /**
   * Subscribe to organization changes (real-time)
   */
  static subscribeToOrganizations(callback: (payload: any) => void) {
    return supabase
      .channel('organizations-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'core_organizations' }, 
        callback
      )
      .subscribe()
  }

  /**
   * Unsubscribe from changes
   */
  static unsubscribe(subscription: any) {
    if (subscription) {
      supabase.removeChannel(subscription)
    }
  }
}

export default ClientService