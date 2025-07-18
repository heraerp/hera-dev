/**
 * HERA Universal ERP - Conditional Organization Provider
 * Only loads organization context for authenticated pages, not for setup/landing pages
 */

"use client"

import React, { ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { OrganizationProvider } from './organization-provider'

interface ConditionalOrganizationProviderProps {
  children: ReactNode
}

// Pages that don't need organization context
const NO_ORG_PAGES = [
  '/',
  '/setup',
  '/auth',
  '/login',
  '/signup',
  '/forgot-password',
  '/reset-password'
]

export function ConditionalOrganizationProvider({ children }: ConditionalOrganizationProviderProps) {
  const pathname = usePathname()
  
  // Check if current page needs organization context
  const needsOrgContext = !NO_ORG_PAGES.some(page => 
    pathname === page || pathname.startsWith(page + '/')
  )
  
  // For setup and landing pages, render children without organization context
  if (!needsOrgContext) {
    return <>{children}</>
  }
  
  // For authenticated pages, wrap with organization provider
  return (
    <OrganizationProvider>
      {children}
    </OrganizationProvider>
  )
}