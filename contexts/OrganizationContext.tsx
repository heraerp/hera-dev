/**
 * HERA Universal - Organization Context
 * 
 * Provides organization isolation and user authentication context
 * Uses Mario's Restaurant as demo organization
 */

'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

// Mario's Restaurant Organization ID (from CLAUDE.md)
const DEMO_ORGANIZATION_ID = '123e4567-e89b-12d3-a456-426614174000'

interface User {
  id: string
  email: string
  name: string
  role: string
}

interface Organization {
  id: string
  name: string
  type: string
  industry: string
}

interface OrganizationContextType {
  user: User | null
  organization: Organization | null
  isAuthenticated: boolean
  loading: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  setUser: (user: User) => void
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined)

// Demo user data
const DEMO_USER: User = {
  id: 'user-mario-001',
  email: 'mario@mariosrestaurant.com',
  name: 'Mario Rossi',
  role: 'Restaurant Manager'
}

const DEMO_ORGANIZATION: Organization = {
  id: DEMO_ORGANIZATION_ID,
  name: "Mario's Italian Restaurant",
  type: 'restaurant',
  industry: 'Food & Beverage'
}

export function OrganizationProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<User | null>(null)
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Auto-login with demo user for development
    // In production, this would check for stored auth tokens
    const initAuth = async () => {
      try {
        // Simulate auth check delay
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Auto-login with Mario for demo purposes
        setUserState(DEMO_USER)
        setOrganization(DEMO_ORGANIZATION)
      } catch (error) {
        console.error('Auth initialization error:', error)
      } finally {
        setLoading(false)
      }
    }

    initAuth()
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true)
    try {
      // Simulate login API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // For demo, accept any credentials and login as Mario
      if (email && password) {
        setUserState(DEMO_USER)
        setOrganization(DEMO_ORGANIZATION)
        return true
      }
      
      return false
    } catch (error) {
      console.error('Login error:', error)
      return false
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    setUserState(null)
    setOrganization(null)
    // In production, clear auth tokens and redirect to login
  }

  const setUser = (newUser: User) => {
    setUserState(newUser)
  }

  const value: OrganizationContextType = {
    user,
    organization,
    isAuthenticated: !!user && !!organization,
    loading,
    login,
    logout,
    setUser
  }

  return (
    <OrganizationContext.Provider value={value}>
      {children}
    </OrganizationContext.Provider>
  )
}

export function useOrganization() {
  const context = useContext(OrganizationContext)
  if (context === undefined) {
    throw new Error('useOrganization must be used within an OrganizationProvider')
  }
  return context
}

// Export demo constants for use in other components
export { DEMO_ORGANIZATION_ID, DEMO_USER, DEMO_ORGANIZATION }