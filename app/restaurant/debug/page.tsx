'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/revolutionary-card'
import { Badge } from '@/components/ui/badge'
import { Loader2, CheckCircle, AlertCircle, Database, User } from 'lucide-react'
import UniversalCrudService from '@/lib/services/universalCrudService'
import { createClient } from '@/lib/supabase/client'

export default function RestaurantDebugPage() {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any>({})
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  const runDiagnostics = async () => {
    setLoading(true)
    setError(null)
    const diagnostics: any = {}

    try {
      console.log('🔍 Starting restaurant data diagnostics...')

      // Test 1: Check Supabase connection
      console.log('1. Testing Supabase connection...')
      try {
        const { data: testData, error: testError } = await supabase
          .from('core_clients')
          .select('*')
          .limit(1)

        if (testError) {
          diagnostics.connection = { status: 'error', message: testError.message }
        } else {
          diagnostics.connection = { status: 'success', message: 'Connected to Supabase' }
        }
      } catch (err: any) {
        diagnostics.connection = { status: 'error', message: err.message || 'Connection failed' }
      }

      // Test 2: Check for Chef Lebanon Restaurant clients
      console.log('2. Searching for Chef Lebanon Restaurant clients...')
      try {
        const { data: clients, error: clientError } = await supabase
          .from('core_clients')
          .select('*')
          .ilike('client_name', '%Chef Lebanon%')
          .eq('is_active', true)

        if (clientError) {
          diagnostics.clients = { status: 'error', message: clientError.message }
        } else {
          diagnostics.clients = { 
            status: 'success', 
            count: clients?.length || 0,
            data: clients?.map(c => ({ id: c.id, name: c.client_name, code: c.client_code }))
          }
        }
      } catch (err: any) {
        diagnostics.clients = { status: 'error', message: err.message || 'Failed to fetch clients' }
      }

      // Test 3: Check organizations
      if (diagnostics.clients?.data?.length > 0) {
        console.log('3. Searching for organizations...')
        const clientId = diagnostics.clients.data[0].id

        try {
          const { data: orgs, error: orgError } = await supabase
            .from('core_organizations')
            .select('*')
            .eq('client_id', clientId)
            .eq('is_active', true)

          if (orgError) {
            diagnostics.organizations = { status: 'error', message: orgError.message }
          } else {
            diagnostics.organizations = { 
              status: 'success', 
              count: orgs?.length || 0,
              data: orgs?.map(o => ({ id: o.id, name: o.name, code: o.org_code }))
            }
          }
        } catch (err: any) {
          diagnostics.organizations = { status: 'error', message: err.message || 'Failed to fetch organizations' }
        }

        // Test 4: Check dynamic data
        if (diagnostics.organizations?.data?.length > 0) {
          console.log('4. Searching for dynamic data...')
          const orgId = diagnostics.organizations.data[0].id

          try {
            const { data: dynamicData, error: dynamicError } = await supabase
              .from('core_dynamic_data')
              .select('*')
              .in('entity_id', [clientId, orgId])

            if (dynamicError) {
              diagnostics.dynamicData = { status: 'error', message: dynamicError.message }
            } else {
              diagnostics.dynamicData = { 
                status: 'success', 
                count: dynamicData?.length || 0,
                data: dynamicData?.reduce((acc: any, item) => {
                  acc[item.field_name] = item.field_value
                  return acc
                }, {})
              }
            }
          } catch (err: any) {
            diagnostics.dynamicData = { status: 'error', message: err.message || 'Failed to fetch dynamic data' }
          }
        }
      }

      // Test 5: Test restaurant management service
      console.log('5. Testing restaurant management service...')
      try {
        const { restaurantManagementService } = await import('@/lib/services/restaurantManagementService')
        const restaurantData = await restaurantManagementService.getRestaurantByUserId('test-user')
        
        if (restaurantData) {
          diagnostics.service = { 
            status: 'success', 
            message: 'Service working correctly',
            data: {
              businessName: restaurantData.businessName,
              locationName: restaurantData.locationName,
              city: restaurantData.city,
              isActive: restaurantData.isActive
            }
          }
        } else {
          diagnostics.service = { status: 'warning', message: 'Service returned null data' }
        }
      } catch (err: any) {
        diagnostics.service = { status: 'error', message: err.message || 'Service test failed' }
      }

      setResults(diagnostics)
      console.log('✅ Diagnostics completed:', diagnostics)

    } catch (error: any) {
      console.error('❌ Diagnostics failed:', error)
      setError(error.message || 'Unknown error occurred')
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'warning': return <AlertCircle className="h-5 w-5 text-yellow-600" />
      case 'error': return <AlertCircle className="h-5 w-5 text-red-600" />
      default: return <Database className="h-5 w-5 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-50 border-green-200'
      case 'warning': return 'bg-yellow-50 border-yellow-200'
      case 'error': return 'bg-red-50 border-red-200'
      default: return 'bg-gray-50 border-gray-200'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Restaurant Data Diagnostics
          </h1>
          <p className="text-slate-600">
            Debug restaurant profile page data loading issues
          </p>
        </div>

        <Card className="p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Run Diagnostics</h2>
            <Button 
              onClick={runDiagnostics}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Database className="h-4 w-4 mr-2" />
              )}
              {loading ? 'Running Tests...' : 'Run Diagnostics'}
            </Button>
          </div>
          
          <p className="text-slate-600">
            This will test database connections, data retrieval, and service functionality.
          </p>
        </Card>

        {error && (
          <Card className="p-6 mb-6 bg-red-50 border-red-200">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <h3 className="font-semibold text-red-900">Error</h3>
            </div>
            <p className="text-red-700">{error}</p>
          </Card>
        )}

        {Object.keys(results).length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900">Diagnostic Results</h2>
            
            {Object.entries(results).map(([test, result]: [string, any]) => (
              <Card key={test} className={`p-4 ${getStatusColor(result.status)}`}>
                <div className="flex items-start gap-3">
                  {getStatusIcon(result.status)}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold capitalize">{test.replace(/([A-Z])/g, ' $1')}</h3>
                      <Badge variant={result.status === 'success' ? 'default' : 'destructive'}>
                        {result.status}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-slate-600 mb-2">{result.message}</p>
                    
                    {result.count !== undefined && (
                      <p className="text-sm font-medium">Records found: {result.count}</p>
                    )}
                    
                    {result.data && (
                      <details className="mt-2">
                        <summary className="text-sm font-medium cursor-pointer text-blue-600">
                          View Data
                        </summary>
                        <pre className="mt-2 p-2 bg-slate-100 rounded text-xs overflow-auto">
                          {JSON.stringify(result.data, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        <Card className="p-6 mt-8">
          <h3 className="font-semibold mb-4">Quick Actions</h3>
          <div className="flex gap-4 flex-wrap">
            <Button 
              variant="outline"
              onClick={() => window.location.href = '/restaurant/profile'}
            >
              <User className="h-4 w-4 mr-2" />
              Go to Profile Page
            </Button>
            <Button 
              variant="outline"
              onClick={() => window.location.href = '/restaurant/manage'}
            >
              <Database className="h-4 w-4 mr-2" />
              Go to Management Page
            </Button>
            <Button 
              variant="outline"
              onClick={() => window.location.href = '/setup/restaurant'}
            >
              <Database className="h-4 w-4 mr-2" />
              Setup Restaurant
            </Button>
          </div>
        </Card>

        <Card className="p-6 mt-6">
          <h3 className="font-semibold mb-4">Manual Data Check</h3>
          <p className="text-sm text-slate-600 mb-4">
            Current server: http://localhost:3002 (you mentioned port 3002)
          </p>
          <div className="space-y-2 text-sm">
            <div><strong>Profile Page:</strong> <a href="http://localhost:3002/restaurant/profile" className="text-blue-600" target="_blank">http://localhost:3002/restaurant/profile</a></div>
            <div><strong>Debug Page:</strong> <a href="http://localhost:3002/restaurant/debug" className="text-blue-600" target="_blank">http://localhost:3002/restaurant/debug</a></div>
            <div><strong>Management Page:</strong> <a href="http://localhost:3002/restaurant/manage" className="text-blue-600" target="_blank">http://localhost:3002/restaurant/manage</a></div>
          </div>
        </Card>
      </div>
    </div>
  )
}