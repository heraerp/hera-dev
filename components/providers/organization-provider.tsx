/**
 * HERA Universal ERP - Organization Provider
 * Global provider for organization context throughout the application
 */

"use client"

import React, { createContext, useContext, ReactNode } from 'react'
import { useUserOrganization } from '@/hooks/useUserOrganization'
import type { 
  OrganizationContext,
  Solution,
  Module,
  SolutionAccess,
  ModuleAccess
} from '@/lib/services/userOrganizationService'

interface OrganizationProviderContextType {
  // Current context
  currentContext: OrganizationContext | null
  currentSolution: Solution | null
  currentModule: Module | null
  
  // Organization management
  switchOrganization: (organizationId: string) => Promise<any>
  switchSolution: (solutionId: string) => Promise<any>
  switchModule: (moduleId: string) => Promise<void>
  
  // Access management
  userSolutions: SolutionAccess[]
  userModules: ModuleAccess[]
  hasAccessToSolution: (solutionId: string) => boolean
  hasAccessToModule: (moduleId: string) => boolean
  
  // State
  loading: boolean
  error: string | null
}

const OrganizationProviderContext = createContext<OrganizationProviderContextType | undefined>(undefined)

interface OrganizationProviderProps {
  children: ReactNode
}

export function OrganizationProvider({ children }: OrganizationProviderProps) {
  const organizationData = useUserOrganization()

  const value: OrganizationProviderContextType = {
    currentContext: organizationData.currentOrganization,
    currentSolution: organizationData.currentSolution,
    currentModule: organizationData.currentModule,
    switchOrganization: organizationData.switchOrganization,
    switchSolution: organizationData.switchSolution,
    switchModule: organizationData.switchModule,
    userSolutions: organizationData.userSolutions,
    userModules: organizationData.userModules,
    hasAccessToSolution: organizationData.hasAccessToSolution,
    hasAccessToModule: organizationData.hasAccessToModule,
    loading: organizationData.loading,
    error: organizationData.error
  }

  return (
    <OrganizationProviderContext.Provider value={value}>
      {children}
    </OrganizationProviderContext.Provider>
  )
}

export function useOrganizationContext() {
  const context = useContext(OrganizationProviderContext)
  if (context === undefined) {
    throw new Error('useOrganizationContext must be used within an OrganizationProvider')
  }
  return context
}

// Convenience hooks for common use cases
export function useCurrentOrganization() {
  const { currentContext } = useOrganizationContext()
  return currentContext?.organization || null
}

export function useCurrentSolution() {
  const { currentSolution } = useOrganizationContext()
  return currentSolution
}

export function useOrganizationPermissions() {
  const { currentContext } = useOrganizationContext()
  return currentContext?.permissions || null
}

export function useSolutionAccess(solutionId: string) {
  const { hasAccessToSolution } = useOrganizationContext()
  return hasAccessToSolution(solutionId)
}

export function useModuleAccess(moduleId: string) {
  const { hasAccessToModule } = useOrganizationContext()
  return hasAccessToModule(moduleId)
}