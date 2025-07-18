/**
 * HERA Universal ERP - Authentication Utilities
 * Utilities to handle authentication and RLS policy compliance
 */

import { supabase } from '@/lib/supabase/client'

export class AuthUtils {
  /**
   * Ensure user is authenticated, sign in anonymously if needed
   */
  static async ensureAuthenticated(): Promise<{ user: any; isAnonymous: boolean }> {
    try {
      // Check current auth status
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error) {
        console.warn('Auth check failed:', error.message)
      }
      
      // If user exists, return it
      if (user) {
        return { user, isAnonymous: user.is_anonymous || false }
      }
      
      // If no user, sign in anonymously
      console.log('No authenticated user found, signing in anonymously...')
      const { data: authData, error: authError } = await supabase.auth.signInAnonymously()
      
      if (authError) {
        throw new Error(`Failed to authenticate: ${authError.message}`)
      }
      
      return { user: authData.user, isAnonymous: true }
    } catch (error: any) {
      console.error('Authentication failed:', error)
      throw error
    }
  }

  /**
   * Execute operation with authentication guaranteed
   */
  static async withAuth<T>(operation: () => Promise<T>): Promise<T> {
    await this.ensureAuthenticated()
    return operation()
  }

  /**
   * Check if user has access to organization
   */
  static async checkOrganizationAccess(organizationId: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        // Allow anonymous access for testing
        return true
      }
      
      // Check if user is in user_organizations table
      const { data, error } = await supabase
        .from('user_organizations')
        .select('id')
        .eq('user_id', user.id)
        .eq('organization_id', organizationId)
        .eq('is_active', true)
        .single()
      
      if (error && error.code !== 'PGRST116') {
        console.warn('Organization access check failed:', error.message)
        return true // Allow access if check fails
      }
      
      return !!data
    } catch (error: any) {
      console.warn('Organization access check error:', error.message)
      return true // Allow access if check fails
    }
  }

  /**
   * Add current user to organization
   */
  static async addCurrentUserToOrganization(organizationId: string, role: string = 'user'): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        console.warn('No user found to add to organization')
        return
      }
      
      const { error } = await supabase
        .from('user_organizations')
        .insert({
          user_id: user.id,
          organization_id: organizationId,
          role: role,
          is_active: true
        })
      
      if (error && error.code !== '23505') { // Ignore duplicate key errors
        console.warn('Failed to add user to organization:', error.message)
      }
    } catch (error: any) {
      console.warn('Add user to organization error:', error.message)
    }
  }

  /**
   * Create user profile if it doesn't exist
   */
  static async ensureUserProfile(): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) return
      
      // Check if profile exists
      const { data: profile, error: profileError } = await supabase
        .from('core_users')
        .select('id')
        .eq('auth_user_id', user.id)
        .single()
      
      if (profileError && profileError.code === 'PGRST116') {
        // Profile doesn't exist, create it
        const { error: createError } = await supabase
          .from('core_users')
          .insert({
            auth_user_id: user.id,
            email: user.email || `anonymous-${user.id}@example.com`,
            full_name: user.user_metadata?.full_name || 'Anonymous User',
            is_active: true
          })
        
        if (createError) {
          console.warn('Failed to create user profile:', createError.message)
        }
      }
    } catch (error: any) {
      console.warn('Ensure user profile error:', error.message)
    }
  }

  /**
   * Get current user with enhanced info
   */
  static async getCurrentUser(): Promise<{
    auth_user: any
    profile: any
    organizations: any[]
  } | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) return null
      
      // Get user profile
      const { data: profile } = await supabase
        .from('core_users')
        .select('*')
        .eq('auth_user_id', user.id)
        .single()
      
      // Get user organizations
      const { data: organizations } = await supabase
        .from('user_organizations')
        .select(`
          organization_id,
          role,
          is_active,
          core_organizations (
            id,
            name,
            org_code,
            industry,
            country,
            currency
          )
        `)
        .eq('user_id', user.id)
        .eq('is_active', true)
      
      return {
        auth_user: user,
        profile: profile || null,
        organizations: organizations || []
      }
    } catch (error: any) {
      console.warn('Get current user error:', error.message)
      return null
    }
  }

  /**
   * Check if user has any existing organizations
   */
  static async hasExistingOrganizations(userId?: string): Promise<boolean> {
    try {
      let userIdToCheck = userId
      
      if (!userIdToCheck) {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return false
        userIdToCheck = user.id
      }
      
      const { data: organizations, error } = await supabase
        .from('user_organizations')
        .select('organization_id')
        .eq('user_id', userIdToCheck)
        .eq('is_active', true)
        .limit(1)
      
      if (error) {
        console.warn('Error checking existing organizations:', error.message)
        return false
      }
      
      return (organizations && organizations.length > 0)
    } catch (error: any) {
      console.warn('Has existing organizations error:', error.message)
      return false
    }
  }

  /**
   * Get redirect path based on user's organizations
   */
  static async getPostAuthRedirectPath(userId?: string): Promise<string> {
    try {
      const hasOrgs = await this.hasExistingOrganizations(userId)
      
      if (hasOrgs) {
        // User has organizations, get the current user info to determine redirect
        const currentUser = await this.getCurrentUser()
        if (currentUser && currentUser.organizations.length > 0) {
          // For now, default to restaurant for existing organizations
          // In the future, this could be more intelligent based on the organization type
          return '/restaurant'
        }
      }
      
      // No organizations, redirect to solution selector
      return '/setup'
    } catch (error: any) {
      console.warn('Get post auth redirect path error:', error.message)
      return '/setup' // Default to setup on error
    }
  }

  /**
   * Setup development user for testing
   */
  static async setupDevelopmentUser(): Promise<void> {
    try {
      // Sign in anonymously
      const { data: { user }, error } = await supabase.auth.signInAnonymously()
      
      if (error) {
        console.warn('Failed to setup development user:', error.message)
        return
      }
      
      // Create user profile
      await this.ensureUserProfile()
      
      console.log('Development user setup completed:', user.id)
    } catch (error: any) {
      console.warn('Setup development user error:', error.message)
    }
  }

  /**
   * Sign out current user
   */
  static async signOut(): Promise<void> {
    try {
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        console.warn('Sign out error:', error.message)
      }
    } catch (error: any) {
      console.warn('Sign out error:', error.message)
    }
  }

  /**
   * Check if RLS policies are configured correctly
   */
  static async checkRLSPolicies(): Promise<{
    canReadOrganizations: boolean
    canCreateOrganizations: boolean
    canReadEntities: boolean
    canCreateEntities: boolean
  }> {
    try {
      // Test read access to organizations
      const { data: orgs, error: readError } = await supabase
        .from('core_organizations')
        .select('id')
        .limit(1)
      
      const canReadOrganizations = !readError
      
      // Test create access (without actually creating)
      const { data: createTest, error: createError } = await supabase
        .from('core_organizations')
        .insert({
          client_id: 'test-client-id',
          name: 'Test Organization',
          org_code: 'TEST-ORG-123',
          industry: 'technology',
          country: 'US',
          currency: 'USD',
          is_active: false // Use false to avoid creating actual data
        })
        .select()
        .single()
      
      const canCreateOrganizations = !createError
      
      // If we accidentally created a test org, delete it
      if (createTest?.id) {
        await supabase
          .from('core_organizations')
          .delete()
          .eq('id', createTest.id)
      }
      
      // Test entity access
      const { data: entities, error: entityError } = await supabase
        .from('core_entities')
        .select('id')
        .limit(1)
      
      const canReadEntities = !entityError
      
      // Test entity creation
      const { data: entityTest, error: entityCreateError } = await supabase
        .from('core_entities')
        .insert({
          organization_id: 'test-org-id',
          entity_type: 'test',
          entity_name: 'Test Entity',
          entity_code: 'TEST-ENT-123',
          is_active: false
        })
        .select()
        .single()
      
      const canCreateEntities = !entityCreateError
      
      // Clean up test entity
      if (entityTest?.id) {
        await supabase
          .from('core_entities')
          .delete()
          .eq('id', entityTest.id)
      }
      
      return {
        canReadOrganizations,
        canCreateOrganizations,
        canReadEntities,
        canCreateEntities
      }
    } catch (error: any) {
      console.warn('RLS policy check error:', error.message)
      return {
        canReadOrganizations: false,
        canCreateOrganizations: false,
        canReadEntities: false,
        canCreateEntities: false
      }
    }
  }
}

export default AuthUtils