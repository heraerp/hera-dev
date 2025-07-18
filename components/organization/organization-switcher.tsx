/**
 * HERA Universal ERP - Organization Switcher Component
 * Advanced organization and solution switching interface
 */

"use client"

import React, { useState } from 'react'
import { ChevronDown, Building2, Package, Users, Settings, Check, LogOut, Plus } from 'lucide-react'
import { useUserOrganization } from '@/hooks/useUserOrganization'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

interface OrganizationSwitcherProps {
  className?: string
  showSolutionSelector?: boolean
  compact?: boolean
}

export function OrganizationSwitcher({
  className,
  showSolutionSelector = true,
  compact = false
}: OrganizationSwitcherProps) {
  const {
    organizations,
    currentOrganization,
    currentSolution,
    availableSolutions,
    loading,
    error,
    switchOrganization,
    switchSolution,
    hasAccessToSolution,
    canGrantAccess
  } = useUserOrganization()

  const [isSwitching, setIsSwitching] = useState(false)

  const handleOrganizationSwitch = async (orgId: string) => {
    if (orgId === currentOrganization?.organization.id || isSwitching) return
    
    setIsSwitching(true)
    try {
      await switchOrganization(orgId)
    } finally {
      setIsSwitching(false)
    }
  }

  const handleSolutionSwitch = async (solutionId: string) => {
    if (solutionId === currentSolution?.id || isSwitching) return
    
    setIsSwitching(true)
    try {
      await switchSolution(solutionId)
    } finally {
      setIsSwitching(false)
    }
  }

  if (loading) {
    return (
      <div className={cn("flex items-center space-x-2", className)}>
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-4 w-32" />
      </div>
    )
  }

  if (error) {
    return (
      <div className={cn("text-sm text-destructive", className)}>
        Error: {error}
      </div>
    )
  }

  if (!currentOrganization) {
    return (
      <div className={cn("text-sm text-muted-foreground", className)}>
        No organization selected
      </div>
    )
  }

  const { organization, userOrganization, permissions } = currentOrganization

  if (compact) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={cn("justify-between", className)}
            disabled={isSwitching}
          >
            <Building2 className="h-4 w-4" />
            <ChevronDown className="ml-1 h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <OrganizationMenuContent
            organizations={organizations}
            currentOrganization={currentOrganization}
            currentSolution={currentSolution}
            availableSolutions={availableSolutions}
            showSolutionSelector={showSolutionSelector}
            hasAccessToSolution={hasAccessToSolution}
            canGrantAccess={canGrantAccess}
            onOrganizationSwitch={handleOrganizationSwitch}
            onSolutionSwitch={handleSolutionSwitch}
            isSwitching={isSwitching}
          />
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "flex items-center justify-between space-x-2",
            className
          )}
          disabled={isSwitching}
        >
          <div className="flex items-center space-x-2">
            <Building2 className="h-4 w-4" />
            <div className="text-left">
              <div className="text-sm font-medium">{organization.name}</div>
              {currentSolution && showSolutionSelector && (
                <div className="text-xs text-muted-foreground">
                  {currentSolution.name}
                </div>
              )}
            </div>
          </div>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-80">
        <OrganizationMenuContent
          organizations={organizations}
          currentOrganization={currentOrganization}
          currentSolution={currentSolution}
          availableSolutions={availableSolutions}
          showSolutionSelector={showSolutionSelector}
          hasAccessToSolution={hasAccessToSolution}
          canGrantAccess={canGrantAccess}
          onOrganizationSwitch={handleOrganizationSwitch}
          onSolutionSwitch={handleSolutionSwitch}
          isSwitching={isSwitching}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

interface OrganizationMenuContentProps {
  organizations: any[]
  currentOrganization: any
  currentSolution: any
  availableSolutions: any[]
  showSolutionSelector: boolean
  hasAccessToSolution: (id: string) => boolean
  canGrantAccess: boolean
  onOrganizationSwitch: (id: string) => void
  onSolutionSwitch: (id: string) => void
  isSwitching: boolean
}

function OrganizationMenuContent({
  organizations,
  currentOrganization,
  currentSolution,
  availableSolutions,
  showSolutionSelector,
  hasAccessToSolution,
  canGrantAccess,
  onOrganizationSwitch,
  onSolutionSwitch,
  isSwitching
}: OrganizationMenuContentProps) {
  const { organization, userOrganization, permissions } = currentOrganization

  return (
    <>
      {/* Current Organization Info */}
      <DropdownMenuLabel className="pb-2">
        <div className="flex flex-col space-y-1">
          <div className="flex items-center space-x-2">
            <Building2 className="h-4 w-4" />
            <span className="text-sm font-medium">{organization.name}</span>
          </div>
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <Badge variant="secondary" className="text-xs">
              {userOrganization.role}
            </Badge>
            {organization.industry && (
              <span>{organization.industry}</span>
            )}
          </div>
        </div>
      </DropdownMenuLabel>
      
      <DropdownMenuSeparator />

      {/* Solution Selector */}
      {showSolutionSelector && availableSolutions.length > 0 && (
        <>
          <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
            Active Solution
          </DropdownMenuLabel>
          {availableSolutions.map((solution) => {
            const hasAccess = hasAccessToSolution(solution.id)
            const isActive = currentSolution?.id === solution.id
            
            return (
              <DropdownMenuItem
                key={solution.id}
                onClick={() => hasAccess && onSolutionSwitch(solution.id)}
                disabled={!hasAccess || isSwitching}
                className={cn(
                  "cursor-pointer",
                  isActive && "bg-accent"
                )}
              >
                <Package className="mr-2 h-4 w-4" />
                <span className="flex-1">{solution.name}</span>
                {isActive && <Check className="ml-2 h-4 w-4" />}
                {!hasAccess && (
                  <Badge variant="outline" className="ml-2 text-xs">
                    No Access
                  </Badge>
                )}
              </DropdownMenuItem>
            )
          })}
          <DropdownMenuSeparator />
        </>
      )}

      {/* Organization List */}
      <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
        Organizations
      </DropdownMenuLabel>
      {organizations.map((org) => {
        const isActive = org.organization_id === organization.id
        
        return (
          <DropdownMenuItem
            key={org.organization_id}
            onClick={() => onOrganizationSwitch(org.organization_id)}
            disabled={isActive || isSwitching}
            className={cn(
              "cursor-pointer",
              isActive && "bg-accent"
            )}
          >
            <Building2 className="mr-2 h-4 w-4" />
            <div className="flex-1">
              <div className="text-sm">{org.core_organizations?.name || 'Unknown'}</div>
              <div className="text-xs text-muted-foreground">
                {org.role} • {org.solutions?.length || 0} solutions
              </div>
            </div>
            {isActive && <Check className="ml-2 h-4 w-4" />}
          </DropdownMenuItem>
        )
      })}

      <DropdownMenuSeparator />

      {/* Additional Options */}
      <DropdownMenuSub>
        <DropdownMenuSubTrigger>
          <Settings className="mr-2 h-4 w-4" />
          <span>Organization Settings</span>
        </DropdownMenuSubTrigger>
        <DropdownMenuSubContent>
          <DropdownMenuItem disabled={!permissions.can_admin}>
            <Users className="mr-2 h-4 w-4" />
            <span>Manage Users</span>
          </DropdownMenuItem>
          <DropdownMenuItem disabled={!permissions.can_admin}>
            <Package className="mr-2 h-4 w-4" />
            <span>Manage Solutions</span>
          </DropdownMenuItem>
          <DropdownMenuItem disabled={!permissions.can_admin}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </DropdownMenuItem>
        </DropdownMenuSubContent>
      </DropdownMenuSub>

      {canGrantAccess && (
        <DropdownMenuItem>
          <Plus className="mr-2 h-4 w-4" />
          <span>Create Organization</span>
        </DropdownMenuItem>
      )}

      <DropdownMenuSeparator />

      <DropdownMenuItem className="text-destructive">
        <LogOut className="mr-2 h-4 w-4" />
        <span>Sign Out</span>
      </DropdownMenuItem>
    </>
  )
}