/**
 * Test Authentication Page - Debug RLS Issue
 */

"use client"

import { useState } from "react"
import { Button } from "@/components/ui/revolutionary-button"
import { Card } from "@/components/ui/revolutionary-card"
import { TestAuth } from "@/lib/auth/test-auth"
import { AuthUtils } from "@/lib/auth/auth-utils"
import { OrganizationService } from "@/lib/services/organization-service"

export default function TestAuthPage() {
  const [authStatus, setAuthStatus] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [rlsStatus, setRlsStatus] = useState<any>(null)

  const checkAuth = async () => {
    setIsLoading(true)
    try {
      const status = await TestAuth.checkAuthStatus()
      setAuthStatus(status)
      setResult({ success: true, message: "Auth check completed" })
    } catch (error: any) {
      setResult({ success: false, error: error.message })
    } finally {
      setIsLoading(false)
    }
  }

  const signInAnonymously = async () => {
    setIsLoading(true)
    try {
      await TestAuth.signInAnonymously()
      const status = await TestAuth.checkAuthStatus()
      setAuthStatus(status)
      setResult({ success: true, message: "Signed in anonymously" })
    } catch (error: any) {
      setResult({ success: false, error: error.message })
    } finally {
      setIsLoading(false)
    }
  }

  const testCreateOrganization = async () => {
    setIsLoading(true)
    try {
      const org = await OrganizationService.createOrganization({
        client_id: "2cd7c116-58fd-4860-b548-40cd0960cb4d",
        name: "Test Organization",
        org_code: "TEST-ORG",
        industry: "technology",
        country: "US",
        currency: "USD"
      })
      setResult({ success: true, organization: org })
    } catch (error: any) {
      setResult({ success: false, error: error.message })
    } finally {
      setIsLoading(false)
    }
  }

  const testCreateOrganizationWithAuth = async () => {
    setIsLoading(true)
    try {
      const org = await AuthUtils.withAuth(async () => {
        return await OrganizationService.createOrganization({
          client_id: "2cd7c116-58fd-4860-b548-40cd0960cb4d",
          name: "Test Organization (With Auth)",
          org_code: "TEST-ORG-AUTH",
          industry: "technology",
          country: "US",
          currency: "USD"
        })
      })
      setResult({ success: true, organization: org })
    } catch (error: any) {
      setResult({ success: false, error: error.message })
    } finally {
      setIsLoading(false)
    }
  }

  const checkRLSPolicies = async () => {
    setIsLoading(true)
    try {
      const status = await AuthUtils.checkRLSPolicies()
      setRlsStatus(status)
      setResult({ success: true, message: "RLS policies checked", rls: status })
    } catch (error: any) {
      setResult({ success: false, error: error.message })
    } finally {
      setIsLoading(false)
    }
  }

  const setupDevelopmentUser = async () => {
    setIsLoading(true)
    try {
      await AuthUtils.setupDevelopmentUser()
      const status = await TestAuth.checkAuthStatus()
      setAuthStatus(status)
      setResult({ success: true, message: "Development user setup completed" })
    } catch (error: any) {
      setResult({ success: false, error: error.message })
    } finally {
      setIsLoading(false)
    }
  }

  const signOut = async () => {
    setIsLoading(true)
    try {
      await TestAuth.signOut()
      setAuthStatus(null)
      setResult({ success: true, message: "Signed out successfully" })
    } catch (error: any) {
      setResult({ success: false, error: error.message })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Authentication Test & RLS Debug</h1>
      
      <div className="grid gap-6">
        {/* Authentication Status */}
        <Card variant="glass" className="p-6">
          <h2 className="text-lg font-semibold mb-4">Authentication Status</h2>
          <div className="space-y-4">
            <div className="flex gap-2 flex-wrap">
              <Button onClick={checkAuth} disabled={isLoading}>
                Check Auth Status
              </Button>
              <Button onClick={signInAnonymously} disabled={isLoading}>
                Sign In Anonymously
              </Button>
              <Button onClick={setupDevelopmentUser} disabled={isLoading}>
                Setup Dev User
              </Button>
              <Button onClick={signOut} disabled={isLoading} variant="outline">
                Sign Out
              </Button>
            </div>
            
            {authStatus && (
              <div className="p-4 bg-muted rounded">
                <p><strong>Authenticated:</strong> {authStatus.authenticated ? 'Yes' : 'No'}</p>
                {authStatus.user && (
                  <div className="mt-2">
                    <p><strong>User ID:</strong> {authStatus.user.id}</p>
                    <p><strong>Email:</strong> {authStatus.user.email || 'N/A'}</p>
                    <p><strong>Role:</strong> {authStatus.user.role || 'anonymous'}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>

        {/* RLS Policy Check */}
        <Card variant="glass" className="p-6">
          <h2 className="text-lg font-semibold mb-4">RLS Policy Check</h2>
          <div className="space-y-4">
            <Button onClick={checkRLSPolicies} disabled={isLoading}>
              Check RLS Policies
            </Button>
            
            {rlsStatus && (
              <div className="p-4 bg-muted rounded">
                <p><strong>Can Read Organizations:</strong> {rlsStatus.canReadOrganizations ? '✅' : '❌'}</p>
                <p><strong>Can Create Organizations:</strong> {rlsStatus.canCreateOrganizations ? '✅' : '❌'}</p>
                <p><strong>Can Read Entities:</strong> {rlsStatus.canReadEntities ? '✅' : '❌'}</p>
                <p><strong>Can Create Entities:</strong> {rlsStatus.canCreateEntities ? '✅' : '❌'}</p>
              </div>
            )}
          </div>
        </Card>

        {/* Test Organization Creation */}
        <Card variant="glass" className="p-6">
          <h2 className="text-lg font-semibold mb-4">Test Organization Creation</h2>
          <div className="space-y-4">
            <div className="flex gap-2 flex-wrap">
              <Button onClick={testCreateOrganization} disabled={isLoading}>
                Test Create Organization
              </Button>
              <Button onClick={testCreateOrganizationWithAuth} disabled={isLoading}>
                Test Create (With Auth)
              </Button>
            </div>
            
            {result && (
              <div className={`p-4 rounded ${result.success ? 'bg-green-100' : 'bg-red-100'}`}>
                {result.success ? (
                  <div>
                    <p className="text-green-800 font-medium">Success!</p>
                    <pre className="text-sm mt-2 text-green-700">
                      {JSON.stringify(result, null, 2)}
                    </pre>
                  </div>
                ) : (
                  <div>
                    <p className="text-red-800 font-medium">Error:</p>
                    <p className="text-red-700 mt-1">{result.error}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>

        {/* Debug Information */}
        <Card variant="glass" className="p-6">
          <h2 className="text-lg font-semibold mb-4">Debug Information</h2>
          <div className="space-y-2 text-sm">
            <p><strong>Current URL:</strong> {typeof window !== 'undefined' ? window.location.href : 'N/A'}</p>
            <p><strong>Environment:</strong> {process.env.NODE_ENV}</p>
            <p><strong>Supabase URL:</strong> {process.env.NEXT_PUBLIC_SUPABASE_URL}</p>
            <p><strong>Supabase Key:</strong> {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Not set'}</p>
          </div>
        </Card>
      </div>
    </div>
  )
}