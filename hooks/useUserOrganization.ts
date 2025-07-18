/**
 * HERA Universal ERP - User Organization Hook
 * Enhanced hook for managing multi-organization access with solution switching
 * Builds upon existing useHeraOrganization with additional capabilities
 */

"use client"

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useHeraOrganization } from './useHeraOrganization'
import UserOrganizationService, {
  type OrganizationContext,
  type Solution,
  type Module,
  type SolutionAccess,
  type ModuleAccess,
  type UserOrganizationAccess,
  type OrganizationSwitchResult,
  type SolutionSwitchResult
} from '@/lib/services/userOrganizationService'
import { supabase } from '@/lib/supabase/client'

interface UseUserOrganizationReturn {
  // From base hook
  organizations: UserOrganizationAccess[]
  currentOrganization: OrganizationContext | null
  loading: boolean
  error: string | null
  
  // Organization management
  switchOrganization: (organizationId: string) => Promise<OrganizationSwitchResult | null>
  refreshOrganizations: () => Promise<void>
  
  // Solution management
  currentSolution: Solution | null
  availableSolutions: Solution[]
  switchSolution: (solutionId: string) => Promise<SolutionSwitchResult | null>
  refreshSolutions: () => Promise<void>
  
  // Module management
  currentModule: Module | null
  availableModules: Module[]
  switchModule: (moduleId: string) => Promise<void>
  
  // Access management
  userSolutions: SolutionAccess[]
  userModules: ModuleAccess[]
  grantSolutionAccess: (solutionId: string, userId?: string, expiresAt?: string) => Promise<void>
  revokeSolutionAccess: (solutionId: string, userId?: string, reason?: string) => Promise<void>
  
  // Permission checks
  hasAccessToSolution: (solutionId: string) => boolean
  hasAccessToModule: (moduleId: string) => boolean
  canGrantAccess: boolean
  canRevokeAccess: boolean
  
  // Context
  fullContext: OrganizationContext | null
}

export function useUserOrganization(): UseUserOrganizationReturn {
  // Use base hook for core functionality
  const baseHook = useHeraOrganization()
  
  // Extended state
  const [userOrganizations, setUserOrganizations] = useState<UserOrganizationAccess[]>([])
  const [currentContext, setCurrentContext] = useState<OrganizationContext | null>(null)
  const [currentSolution, setCurrentSolution] = useState<Solution | null>(null)
  const [currentModule, setCurrentModule] = useState<Module | null>(null)
  const [availableSolutions, setAvailableSolutions] = useState<Solution[]>([])
  const [availableModules, setAvailableModules] = useState<Module[]>([])
  const [userSolutions, setUserSolutions] = useState<SolutionAccess[]>([])
  const [userModules, setUserModules] = useState<ModuleAccess[]>([])
  const [extendedLoading, setExtendedLoading] = useState(true)
  const [extendedError, setExtendedError] = useState<string | null>(null)

  // Get current user ID
  const [userId, setUserId] = useState<string | null>(null)
  
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUserId(user?.id || null)
    }
    getUser()
  }, [])

  // Load extended organization data
  const loadExtendedData = useCallback(async () => {
    if (!userId || !baseHook.currentOrganization) {
      setExtendedLoading(false)
      return
    }

    try {
      setExtendedLoading(true)
      setExtendedError(null)

      // Get full user organizations with access details
      const orgsResult = await UserOrganizationService.getUserOrganizations(userId)
      if (orgsResult.success && orgsResult.data) {
        setUserOrganizations(orgsResult.data)
      }

      // Build full context for current organization
      const contextResult = await UserOrganizationService.buildOrganizationContext(
        userId,
        baseHook.currentOrganization.id
      )
      
      if (contextResult.success && contextResult.data) {
        setCurrentContext(contextResult.data)
        setAvailableSolutions(contextResult.data.availableSolutions)
        setAvailableModules(contextResult.data.availableModules)
        
        // Set current solution if available
        if (contextResult.data.activeSolution) {
          setCurrentSolution(contextResult.data.activeSolution)
        }
        
        // Extract user's solution and module access
        const currentUserOrg = contextResult.data.userOrganization
        setUserSolutions(currentUserOrg.solutions || [])
        setUserModules(currentUserOrg.modules || [])
      }
    } catch (error) {
      console.error('Error loading extended organization data:', error)
      setExtendedError(error instanceof Error ? error.message : 'Failed to load extended data')
    } finally {
      setExtendedLoading(false)
    }
  }, [userId, baseHook.currentOrganization])

  // Load extended data when base data changes
  useEffect(() => {
    loadExtendedData()
  }, [loadExtendedData])

  // Enhanced organization switch
  const switchOrganization = useCallback(async (organizationId: string) => {
    if (!userId) {
      setExtendedError('User not authenticated')
      return null
    }

    try {
      setExtendedLoading(true)
      setExtendedError(null)

      // Use service to switch organization
      const result = await UserOrganizationService.switchOrganization(userId, organizationId)
      
      if (result.success && result.data) {
        // Update base hook
        await baseHook.switchOrganization(organizationId)
        
        // Update extended state
        setCurrentContext(result.data.context)
        setAvailableSolutions(result.data.context.availableSolutions)
        setAvailableModules(result.data.context.availableModules)
        
        if (result.data.context.activeSolution) {
          setCurrentSolution(result.data.context.activeSolution)
        }
        
        const userOrg = result.data.context.userOrganization
        setUserSolutions(userOrg.solutions || [])
        setUserModules(userOrg.modules || [])
        
        return result.data
      } else {
        throw new Error(result.error || 'Failed to switch organization')
      }
    } catch (error) {
      console.error('Error switching organization:', error)
      setExtendedError(error instanceof Error ? error.message : 'Failed to switch organization')
      return null
    } finally {
      setExtendedLoading(false)
    }
  }, [userId, baseHook])

  // Switch solution
  const switchSolution = useCallback(async (solutionId: string) => {
    if (!userId || !baseHook.currentOrganization) {
      setExtendedError('Organization context not available')
      return null
    }

    try {
      setExtendedLoading(true)
      setExtendedError(null)

      const result = await UserOrganizationService.switchSolution(
        userId,
        baseHook.currentOrganization.id,
        solutionId
      )
      
      if (result.success && result.data) {
        setCurrentSolution(result.data.newSolution)
        setAvailableModules(result.data.availableModules)
        return result.data
      } else {
        throw new Error(result.error || 'Failed to switch solution')
      }
    } catch (error) {
      console.error('Error switching solution:', error)
      setExtendedError(error instanceof Error ? error.message : 'Failed to switch solution')
      return null
    } finally {
      setExtendedLoading(false)
    }
  }, [userId, baseHook.currentOrganization])

  // Switch module
  const switchModule = useCallback(async (moduleId: string) => {
    const module = availableModules.find(m => m.id === moduleId)
    if (module) {
      setCurrentModule(module)
      localStorage.setItem('hera_current_module', moduleId)
    }
  }, [availableModules])

  // Grant solution access
  const grantSolutionAccess = useCallback(async (
    solutionId: string,
    targetUserId?: string,
    expiresAt?: string
  ) => {
    if (!userId || !baseHook.currentOrganization) {
      setExtendedError('Organization context not available')
      return
    }

    try {
      const result = await UserOrganizationService.grantSolutionAccess(
        targetUserId || userId,
        baseHook.currentOrganization.id,
        solutionId,
        userId, // granted by current user
        expiresAt
      )
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to grant solution access')
      }
      
      // Refresh data
      await loadExtendedData()
    } catch (error) {
      console.error('Error granting solution access:', error)
      setExtendedError(error instanceof Error ? error.message : 'Failed to grant solution access')
    }
  }, [userId, baseHook.currentOrganization, loadExtendedData])

  // Revoke solution access
  const revokeSolutionAccess = useCallback(async (
    solutionId: string,
    targetUserId?: string,
    reason?: string
  ) => {
    if (!userId || !baseHook.currentOrganization) {
      setExtendedError('Organization context not available')
      return
    }

    try {
      const result = await UserOrganizationService.revokeSolutionAccess(
        targetUserId || userId,
        baseHook.currentOrganization.id,
        solutionId,
        userId, // revoked by current user
        reason
      )
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to revoke solution access')
      }
      
      // Refresh data
      await loadExtendedData()
    } catch (error) {
      console.error('Error revoking solution access:', error)
      setExtendedError(error instanceof Error ? error.message : 'Failed to revoke solution access')
    }
  }, [userId, baseHook.currentOrganization, loadExtendedData])

  // Refresh organizations
  const refreshOrganizations = useCallback(async () => {
    await baseHook.refreshOrganizations()
    await loadExtendedData()
  }, [baseHook, loadExtendedData])

  // Refresh solutions
  const refreshSolutions = useCallback(async () => {
    await loadExtendedData()
  }, [loadExtendedData])

  // Permission checks
  const hasAccessToSolution = useCallback((solutionId: string) => {
    return userSolutions.some(s => s.solution_id === solutionId && s.is_enabled)
  }, [userSolutions])

  const hasAccessToModule = useCallback((moduleId: string) => {
    return userModules.some(m => m.module_id === moduleId && m.is_enabled)
  }, [userModules])

  // Real-time subscriptions
  useEffect(() => {
    if (!baseHook.currentOrganization) return

    const subscription = UserOrganizationService.subscribeToOrganizationChanges(
      baseHook.currentOrganization.id,
      (payload) => {
        console.log('Organization change detected:', payload)
        // Refresh data on changes
        loadExtendedData()
      }
    )

    return () => {
      UserOrganizationService.unsubscribe(subscription)
    }
  }, [baseHook.currentOrganization, loadExtendedData])

  return {
    // Base data
    organizations: userOrganizations,
    currentOrganization: currentContext,
    loading: baseHook.loading || extendedLoading,
    error: baseHook.error || extendedError,
    
    // Organization management
    switchOrganization,
    refreshOrganizations,
    
    // Solution management
    currentSolution,
    availableSolutions,
    switchSolution,
    refreshSolutions,
    
    // Module management
    currentModule,
    availableModules,
    switchModule,
    
    // Access management
    userSolutions,
    userModules,
    grantSolutionAccess,
    revokeSolutionAccess,
    
    // Permission checks
    hasAccessToSolution,
    hasAccessToModule,
    canGrantAccess: baseHook.canAdmin,
    canRevokeAccess: baseHook.canAdmin,
    
    // Full context
    fullContext: currentContext
  }
}