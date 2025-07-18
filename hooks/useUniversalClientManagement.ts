/**
 * HERA Universal ERP - Universal Client Management Hook
 * Advanced client management with Universal Master Data integration
 */

import { useState, useEffect, useCallback } from 'react'
import { UniversalClientService } from '@/lib/services/universal-client-service'
import type { UniversalClient } from '@/lib/services/universal-client-service'

export interface UseUniversalClientManagement {
  clients: UniversalClient[]
  isLoading: boolean
  error: string | null
  createClient: (clientData: any) => Promise<UniversalClient>
  updateClient: (clientId: string, updates: any) => Promise<UniversalClient>
  deleteClient: (clientId: string) => Promise<void>
  refreshClients: () => Promise<void>
  getClientAnalytics: (clientId: string) => Promise<any>
  searchClients: (query: string) => Promise<UniversalClient[]>
  getUniversalClient: (clientId: string) => Promise<UniversalClient>
}

export function useUniversalClientManagement(): UseUniversalClientManagement {
  const [clients, setClients] = useState<UniversalClient[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load clients with universal data
  const loadClients = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const universalClients = await UniversalClientService.getUniversalClients()
      setClients(universalClients)
    } catch (err) {
      console.error('Error loading clients:', err)
      setError(err instanceof Error ? err.message : 'Failed to load clients')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Create client with universal architecture
  const createClient = useCallback(async (clientData: {
    client_name: string
    client_code: string
    client_type: string
    metadata?: Record<string, any>
    dynamic_fields?: Record<string, any>
  }): Promise<UniversalClient> => {
    try {
      const newClient = await UniversalClientService.createUniversalClient(clientData)
      
      // Refresh clients list
      await loadClients()
      
      return newClient
    } catch (err) {
      console.error('Error creating client:', err)
      throw err
    }
  }, [loadClients])

  // Update client with universal architecture
  const updateClient = useCallback(async (clientId: string, updates: {
    client_name?: string
    client_code?: string
    client_type?: string
    metadata?: Record<string, any>
    dynamic_fields?: Record<string, any>
  }): Promise<UniversalClient> => {
    try {
      const updatedClient = await UniversalClientService.updateUniversalClient(clientId, updates)
      
      // Update local state
      setClients(prev => 
        prev.map(client => 
          client.id === clientId ? updatedClient : client
        )
      )
      
      return updatedClient
    } catch (err) {
      console.error('Error updating client:', err)
      throw err
    }
  }, [])

  // Delete client (soft delete)
  const deleteClient = useCallback(async (clientId: string): Promise<void> => {
    try {
      // For now, we'll do a soft delete by setting is_active to false
      await updateClient(clientId, { is_active: false })
      
      // Remove from local state
      setClients(prev => prev.filter(client => client.id !== clientId))
    } catch (err) {
      console.error('Error deleting client:', err)
      throw err
    }
  }, [updateClient])

  // Refresh clients
  const refreshClients = useCallback(async (): Promise<void> => {
    await loadClients()
  }, [loadClients])

  // Get client analytics
  const getClientAnalytics = useCallback(async (clientId: string) => {
    try {
      return await UniversalClientService.getClientAnalytics(clientId)
    } catch (err) {
      console.error('Error getting client analytics:', err)
      throw err
    }
  }, [])

  // Search clients
  const searchClients = useCallback(async (query: string): Promise<UniversalClient[]> => {
    try {
      return await UniversalClientService.searchUniversalClients(query)
    } catch (err) {
      console.error('Error searching clients:', err)
      throw err
    }
  }, [])

  // Get single client with full universal data
  const getUniversalClient = useCallback(async (clientId: string): Promise<UniversalClient> => {
    try {
      return await UniversalClientService.getUniversalClient(clientId)
    } catch (err) {
      console.error('Error getting universal client:', err)
      throw err
    }
  }, [])

  // Load clients on mount
  useEffect(() => {
    loadClients()
  }, [loadClients])

  // Set up real-time subscriptions
  useEffect(() => {
    const subscription = UniversalClientService.subscribeToUniversalClients((payload) => {
      console.log('Universal client change:', payload)
      
      // Handle real-time updates
      if (payload.eventType === 'INSERT') {
        loadClients() // Refresh to get full universal data
      } else if (payload.eventType === 'UPDATE') {
        loadClients() // Refresh to get updated universal data
      } else if (payload.eventType === 'DELETE') {
        setClients(prev => prev.filter(client => client.id !== payload.old.id))
      }
    })

    return () => {
      if (subscription) {
        UniversalClientService.unsubscribe(subscription)
      }
    }
  }, [loadClients])

  return {
    clients,
    isLoading,
    error,
    createClient,
    updateClient,
    deleteClient,
    refreshClients,
    getClientAnalytics,
    searchClients,
    getUniversalClient
  }
}

export default useUniversalClientManagement