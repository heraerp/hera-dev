"use client"

import { useState, useEffect, useCallback, useMemo } from 'react'
import UniversalCrudService from '@/lib/services/universalCrudService'
import type { Organization, UserOrganization, UserRole, TransactionPermissions } from '@/types/transactions'
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

interface UseHeraOrganizationReturn {
  organizations: Organization[]
  currentOrganization: Organization | null
  userRole: UserRole | null
  userOrganizationData: UserOrganization | null
  permissions: TransactionPermissions
  loading: boolean
  error: string | null
  switchOrganization: (organizationId: string) => Promise<void>
  refreshOrganizations: () => Promise<void>
  canCreate: boolean
  canEdit: boolean
  canApprove: boolean
  canAdmin: boolean
  canDelete: boolean
  canExport: boolean
  canOverrideControls: boolean
}

const STORAGE_KEY = 'hera_current_organization'

const DEFAULT_PERMISSIONS: TransactionPermissions = {
  can_view: false,
  can_create: false,
  can_edit: false,
  can_approve: false,
  can_delete: false,
  can_admin: false,
  can_export: false,
  can_override_controls: false,
  allowed_transaction_types: []
}

export function useHeraOrganization(): UseHeraOrganizationReturn {
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null)
  const [userOrganizationData, setUserOrganizationData] = useState<UserOrganization | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Get current user's organizations
  const fetchUserOrganizations = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Check if Supabase is properly configured
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        throw new Error('Supabase is not properly configured. Please check your environment variables.')
      }

      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError) {
        // In demo mode, don't throw errors for auth issues
        console.info('Running in demo mode - no authentication required')
      }

      if (!user) {
        // For demo purposes, create a mock organization when no user is authenticated
        console.info('Running in demo mode with mock organization')
        const demoOrg: Organization = {
          id: '550e8400-e29b-41d4-a716-446655440000',
          name: 'Demo Organization',
          slug: 'demo-org',
          description: 'Demo organization for testing',
          organization_type: 'company',
          industry: 'technology',
          country: 'US',
          currency: 'USD',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        
        const demoUserOrg: UserOrganization = {
          id: '550e8400-e29b-41d4-a716-446655440001',
          user_id: '550e8400-e29b-41d4-a716-446655440002',
          organization_id: '550e8400-e29b-41d4-a716-446655440000',
          role: 'admin',
          is_active: true,
          joined_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }

        setOrganizations([demoOrg])
        setCurrentOrganization(demoOrg)
        setUserOrganizationData(demoUserOrg)
        localStorage.setItem(STORAGE_KEY, demoOrg.id)
        return
      }

      // Get user's organizations with role information
      const { data: userOrgs, error: userOrgsError } = await supabase
        .from('user_organizations')
        .select(`
          *,
          core_organizations!inner(*)
        `)
        .eq('user_id', user.id)
        .eq('is_active', true)
        .eq('core_organizations.is_active', true)

      if (userOrgsError) {
        throw new Error(`Failed to fetch organizations: ${userOrgsError.message}`)
      }

      // Transform the data to separate organizations and user-org relationships
      const orgs: Organization[] = userOrgs?.map(uo => uo.core_organizations).filter(Boolean) || []
      const userOrgRelations: UserOrganization[] = userOrgs?.map(uo => ({
        id: uo.id,
        user_id: uo.user_id,
        organization_id: uo.organization_id,
        role: uo.role,
        permissions: uo.permissions,
        access_level: uo.access_level,
        department: uo.department,
        cost_center: uo.cost_center,
        is_active: uo.is_active,
        joined_at: uo.joined_at,
        created_at: uo.created_at,
        updated_at: uo.updated_at
      })) || []

      setOrganizations(orgs)

      // Set current organization from localStorage or default to first org
      const storedOrgId = localStorage.getItem(STORAGE_KEY)
      let selectedOrg: Organization | null = null
      let selectedUserOrg: UserOrganization | null = null

      if (storedOrgId) {
        selectedOrg = orgs.find(org => org.id === storedOrgId) || null
        selectedUserOrg = userOrgRelations.find(uo => uo.organization_id === storedOrgId) || null
      }

      // If no stored org or stored org not found, use first available
      if (!selectedOrg && orgs.length > 0) {
        selectedOrg = orgs[0]
        selectedUserOrg = userOrgRelations[0]
        localStorage.setItem(STORAGE_KEY, selectedOrg.id)
      }

      setCurrentOrganization(selectedOrg)
      setUserOrganizationData(selectedUserOrg)

    } catch (err) {
      console.error('Error fetching organizations:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch organizations')
    } finally {
      setLoading(false)
    }
  }, [])

  // Switch to a different organization
  const switchOrganization = useCallback(async (organizationId: string) => {
    try {
      setLoading(true)
      setError(null)

      const targetOrg = organizations.find(org => org.id === organizationId)
      if (!targetOrg) {
        throw new Error('Organization not found')
      }

      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        throw new Error('Authentication required')
      }

      // Get user's relationship with this organization
      const { data: userOrgData, error: userOrgError } = await supabase
        .from('user_organizations')
        .select('*')
        .eq('user_id', user.id)
        .eq('organization_id', organizationId)
        .eq('is_active', true)
        .single()

      if (userOrgError) {
        throw new Error('You do not have access to this organization')
      }

      // Update state and localStorage
      setCurrentOrganization(targetOrg)
      setUserOrganizationData(userOrgData)
      localStorage.setItem(STORAGE_KEY, organizationId)

    } catch (err) {
      console.error('Error switching organization:', err)
      setError(err instanceof Error ? err.message : 'Failed to switch organization')
    } finally {
      setLoading(false)
    }
  }, [organizations])

  // Calculate permissions based on user role
  const permissions: TransactionPermissions = useMemo(() => {
    if (!userOrganizationData?.role) {
      return DEFAULT_PERMISSIONS
    }

    const role = userOrganizationData.role
    const customPermissions = userOrganizationData.permissions as Partial<TransactionPermissions> || {}

    // Default permissions by role
    const rolePermissions: Record<UserRole, TransactionPermissions> = {
      admin: {
        can_view: true,
        can_create: true,
        can_edit: true,
        can_approve: true,
        can_delete: true,
        can_admin: true,
        can_export: true,
        can_override_controls: true,
        allowed_transaction_types: ['journal_entry', 'sales', 'purchase', 'payment', 'master_data', 'inventory', 'payroll', 'reconciliation']
      },
      manager: {
        can_view: true,
        can_create: true,
        can_edit: true,
        can_approve: true,
        can_delete: false,
        can_admin: false,
        can_export: true,
        can_override_controls: false,
        max_transaction_amount: 100000,
        allowed_transaction_types: ['journal_entry', 'sales', 'purchase', 'payment', 'inventory']
      },
      editor: {
        can_view: true,
        can_create: true,
        can_edit: true,
        can_approve: false,
        can_delete: false,
        can_admin: false,
        can_export: true,
        can_override_controls: false,
        max_transaction_amount: 10000,
        allowed_transaction_types: ['journal_entry', 'sales', 'purchase', 'payment']
      },
      user: {
        can_view: true,
        can_create: true,
        can_edit: false,
        can_approve: false,
        can_delete: false,
        can_admin: false,
        can_export: false,
        can_override_controls: false,
        max_transaction_amount: 1000,
        allowed_transaction_types: ['journal_entry', 'sales', 'purchase']
      },
      viewer: {
        can_view: true,
        can_create: false,
        can_edit: false,
        can_approve: false,
        can_delete: false,
        can_admin: false,
        can_export: false,
        can_override_controls: false,
        allowed_transaction_types: []
      }
    }

    // Merge role permissions with custom permissions
    return {
      ...rolePermissions[role],
      ...customPermissions
    }
  }, [userOrganizationData])

  // Initialize on mount
  useEffect(() => {
    fetchUserOrganizations()
  }, [fetchUserOrganizations])

  // Listen for auth changes
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return // Skip auth listener if Supabase is not configured
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        fetchUserOrganizations()
      } else if (event === 'SIGNED_OUT') {
        setOrganizations([])
        setCurrentOrganization(null)
        setUserOrganizationData(null)
        localStorage.removeItem(STORAGE_KEY)
      }
    })

    return () => subscription.unsubscribe()
  }, [fetchUserOrganizations])

  return {
    organizations,
    currentOrganization,
    userRole: userOrganizationData?.role || null,
    userOrganizationData,
    permissions,
    loading,
    error,
    switchOrganization,
    refreshOrganizations: fetchUserOrganizations,
    canCreate: permissions.can_create,
    canEdit: permissions.can_edit,
    canApprove: permissions.can_approve,
    canAdmin: permissions.can_admin,
    canDelete: permissions.can_delete,
    canExport: permissions.can_export,
    canOverrideControls: permissions.can_override_controls
  }
}