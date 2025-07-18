/**
 * HERA Universal ERP - Test Authentication Helper
 * For development and testing purposes
 */

import { supabase } from '@/lib/supabase/client'

export class TestAuth {
  /**
   * Sign in anonymously for testing
   */
  static async signInAnonymously() {
    try {
      const { data, error } = await supabase.auth.signInAnonymously()
      
      if (error) {
        console.error('Anonymous sign in error:', error)
        throw error
      }
      
      console.log('✅ Signed in anonymously:', data.user?.id)
      return data
    } catch (error) {
      console.error('Failed to sign in anonymously:', error)
      throw error
    }
  }

  /**
   * Sign in with email (for testing)
   */
  static async signInWithEmail(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) {
        console.error('Email sign in error:', error)
        throw error
      }
      
      console.log('✅ Signed in with email:', data.user?.email)
      return data
    } catch (error) {
      console.error('Failed to sign in with email:', error)
      throw error
    }
  }

  /**
   * Check current authentication status
   */
  static async checkAuthStatus() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error) {
        console.error('Auth check error:', error)
        return { authenticated: false, user: null }
      }
      
      console.log('Auth status:', user ? 'Authenticated' : 'Not authenticated')
      console.log('User:', user)
      
      return { authenticated: !!user, user }
    } catch (error) {
      console.error('Failed to check auth status:', error)
      return { authenticated: false, user: null }
    }
  }

  /**
   * Sign out
   */
  static async signOut() {
    try {
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        console.error('Sign out error:', error)
        throw error
      }
      
      console.log('✅ Signed out successfully')
    } catch (error) {
      console.error('Failed to sign out:', error)
      throw error
    }
  }

  /**
   * Create a test user (requires service role key)
   */
  static async createTestUser(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      })
      
      if (error) {
        console.error('User creation error:', error)
        throw error
      }
      
      console.log('✅ Test user created:', data.user?.email)
      return data
    } catch (error) {
      console.error('Failed to create test user:', error)
      throw error
    }
  }
}

// Export for browser console testing
if (typeof window !== 'undefined') {
  (window as any).TestAuth = TestAuth
}

export default TestAuth