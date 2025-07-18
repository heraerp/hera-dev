/**
 * HERA Universal ERP - Organization Management Hook
 * Multi-tenancy management using core_organizations as main tenant key
 */

import { useState, useEffect, useCallback } from 'react'
import { OrganizationService } from '@/lib/services/organization-service'
import type { Organization, CreateOrganizationData, OrganizationStats } from '@/lib/services/organization-service'

export interface UseOrganizationManagement {
  organizations: Organization[]
  currentOrganization: Organization | null
  isLoading: boolean
  error: string | null
  createOrganization: (orgData: CreateOrganizationData) => Promise<Organization>
  updateOrganization: (organizationId: string, updates: Partial<CreateOrganizationData>) => Promise<Organization>
  deleteOrganization: (organizationId: string) => Promise<void>
  switchOrganization: (organizationId: string) => Promise<void>
  getOrganizationStats: (organizationId: string) => Promise<OrganizationStats>
  searchOrganizations: (query: string) => Promise<Organization[]>
  refreshOrganizations: () => Promise<void>
  loadClientOrganizations: (clientId: string) => Promise<void>
}

export function useOrganizationManagement(clientId?: string): UseOrganizationManagement {
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load organizations for a client
  const loadClientOrganizations = useCallback(async (targetClientId: string) => {
    try {
      setIsLoading(true)
      setError(null)
      
      const orgs = await OrganizationService.getClientOrganizations(targetClientId)
      setOrganizations(orgs)
      
      // Set first organization as current if none selected
      if (orgs.length > 0 && !currentOrganization) {
        setCurrentOrganization(orgs[0])
      }
    } catch (err) {
      console.error('Error loading organizations:', err)
      setError(err instanceof Error ? err.message : 'Failed to load organizations')
    } finally {
      setIsLoading(false)
    }
  }, [currentOrganization])

  // Create new organization
  const createOrganization = useCallback(async (orgData: CreateOrganizationData): Promise<Organization> => {
    try {
      const newOrg = await OrganizationService.createOrganization(orgData)
      
      // Add to local state
      setOrganizations(prev => [newOrg, ...prev])
      
      return newOrg
    } catch (err) {
      console.error('Error creating organization:', err)
      throw err
    }
  }, [])

  // Update organization
  const updateOrganization = useCallback(async (
    organizationId: string, 
    updates: Partial<CreateOrganizationData>
  ): Promise<Organization> => {
    try {
      const updatedOrg = await OrganizationService.updateOrganization(organizationId, updates)
      
      // Update local state
      setOrganizations(prev => 
        prev.map(org => org.id === organizationId ? updatedOrg : org)
      )
      
      // Update current organization if it's the one being updated
      if (currentOrganization?.id === organizationId) {
        setCurrentOrganization(updatedOrg)
      }
      
      return updatedOrg
    } catch (err) {
      console.error('Error updating organization:', err)
      throw err
    }
  }, [currentOrganization])

  // Delete organization
  const deleteOrganization = useCallback(async (organizationId: string): Promise<void> => {
    try {
      await OrganizationService.deleteOrganization(organizationId)
      
      // Remove from local state
      setOrganizations(prev => prev.filter(org => org.id !== organizationId))
      
      // Clear current organization if it's the one being deleted
      if (currentOrganization?.id === organizationId) {
        const remaining = organizations.filter(org => org.id !== organizationId)
        setCurrentOrganization(remaining.length > 0 ? remaining[0] : null)
      }
    } catch (err) {
      console.error('Error deleting organization:', err)
      throw err
    }
  }, [currentOrganization, organizations])

  // Switch to different organization (multi-tenancy context switch)
  const switchOrganization = useCallback(async (organizationId: string): Promise<void> => {
    try {
      const org = organizations.find(o => o.id === organizationId)
      if (!org) {
        throw new Error('Organization not found')
      }
      
      setCurrentOrganization(org)
      
      // Store in localStorage for persistence
      localStorage.setItem('currentOrganizationId', organizationId)
      
      // You could also call the backend to log the context switch
      // await OrganizationService.switchOrganizationContext(userId, organizationId)
      
    } catch (err) {
      console.error('Error switching organization:', err)
      throw err
    }
  }, [organizations])

  // Get organization statistics
  const getOrganizationStats = useCallback(async (organizationId: string): Promise<OrganizationStats> => {
    try {
      return await OrganizationService.getOrganizationStats(organizationId)
    } catch (err) {
      console.error('Error getting organization stats:', err)
      throw err
    }
  }, [])

  // Search organizations
  const searchOrganizations = useCallback(async (query: string): Promise<Organization[]> => {
    try {
      return await OrganizationService.searchOrganizations(query, clientId)
    } catch (err) {
      console.error('Error searching organizations:', err)
      throw err
    }
  }, [clientId])

  // Refresh organizations
  const refreshOrganizations = useCallback(async (): Promise<void> => {
    if (clientId) {
      await loadClientOrganizations(clientId)
    }
  }, [clientId, loadClientOrganizations])

  // Load organizations on mount
  useEffect(() => {
    if (clientId) {
      loadClientOrganizations(clientId)
    }
  }, [clientId, loadClientOrganizations])

  // Restore current organization from localStorage
  useEffect(() => {
    const savedOrgId = localStorage.getItem('currentOrganizationId')
    if (savedOrgId && organizations.length > 0 && !currentOrganization) {
      const savedOrg = organizations.find(org => org.id === savedOrgId)
      if (savedOrg) {
        setCurrentOrganization(savedOrg)
      }
    }
  }, [organizations, currentOrganization])

  // Set up real-time subscriptions for current organization
  useEffect(() => {
    if (!currentOrganization) return

    const subscription = OrganizationService.subscribeToOrganizationChanges(
      currentOrganization.id,
      (payload) => {
        console.log('Organization change:', payload)
        
        // Handle real-time updates
        if (payload.table === 'core_organizations') {
          if (payload.eventType === 'UPDATE') {
            setOrganizations(prev => 
              prev.map(org => 
                org.id === payload.new.id ? payload.new : org
              )
            )
            
            if (currentOrganization.id === payload.new.id) {
              setCurrentOrganization(payload.new)
            }
          }
        }
        
        // You could handle other table changes here (entities, transactions, etc.)
      }
    )

    return () => {
      if (subscription) {
        OrganizationService.unsubscribe(subscription)
      }
    }
  }, [currentOrganization])

  return {
    organizations,
    currentOrganization,
    isLoading,
    error,
    createOrganization,
    updateOrganization,
    deleteOrganization,
    switchOrganization,
    getOrganizationStats,
    searchOrganizations,
    refreshOrganizations,
    loadClientOrganizations
  }
}

export default useOrganizationManagement