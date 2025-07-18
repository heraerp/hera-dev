/**
 * HERA Universal ERP - Client Test Page
 * Test client creation with direct Supabase API
 */

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ClientService } from '@/lib/services/client-service'
import { supabase } from '@/lib/supabase/client'
import type { CreateClientData } from '@/lib/supabase/client'

export default function ClientTestPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [clientData, setClientData] = useState<CreateClientData>({
    client_name: 'Test Client Company',
    client_code: 'TEST001',
    client_type: 'enterprise'
  })

  const handleCreateClient = async () => {
    setLoading(true)
    setResult(null)
    
    try {
      console.log('Creating client with data:', clientData)
      
      // Test direct Supabase call
      const { data, error } = await supabase
        .from('core_clients')
        .insert([{
          client_name: clientData.client_name,
          client_code: clientData.client_code,
          client_type: clientData.client_type
        }])
        .select()
      
      console.log('Direct Supabase result:', { data, error })
      
      if (error) {
        throw new Error(`Supabase error: ${error.message}`)
      }
      
      // Get all clients to verify
      const allClients = await ClientService.getClients()
      console.log('All clients:', allClients)
      
      setResult({
        success: true,
        client: data?.[0],
        allClients: allClients,
        supabaseResponse: { data, error }
      })
      
    } catch (error) {
      console.error('Error creating client:', error)
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        fullError: error
      })
    } finally {
      setLoading(false)
    }
  }

  const handleGetClients = async () => {
    setLoading(true)
    setResult(null)
    
    try {
      const clients = await ClientService.getClients()
      console.log('Fetched clients:', clients)
      
      setResult({
        success: true,
        clients: clients
      })
      
    } catch (error) {
      console.error('Error fetching clients:', error)
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>🧪 HERA Client Service Test</CardTitle>
          <CardDescription>
            Test client creation and management with direct Supabase API
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Client Creation Form */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Create New Client</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="client_name">Client Name</Label>
                <Input
                  id="client_name"
                  value={clientData.client_name}
                  onChange={(e) => setClientData(prev => ({ ...prev, client_name: e.target.value }))}
                  placeholder="Enter client name"
                />
              </div>
              
              <div>
                <Label htmlFor="client_code">Client Code</Label>
                <Input
                  id="client_code"
                  value={clientData.client_code}
                  onChange={(e) => setClientData(prev => ({ ...prev, client_code: e.target.value }))}
                  placeholder="Enter client code"
                />
              </div>
              
              <div>
                <Label htmlFor="client_type">Client Type</Label>
                <Input
                  id="client_type"
                  value={clientData.client_type}
                  onChange={(e) => setClientData(prev => ({ ...prev, client_type: e.target.value }))}
                  placeholder="enterprise, small_business, etc."
                />
              </div>
            </div>
            
            <div className="flex gap-4">
              <Button 
                onClick={handleCreateClient} 
                disabled={loading}
                className="flex-1"
              >
                {loading ? 'Creating...' : 'Create Client'}
              </Button>
              
              <Button 
                onClick={handleGetClients} 
                disabled={loading}
                variant="outline"
                className="flex-1"
              >
                {loading ? 'Loading...' : 'Get All Clients'}
              </Button>
            </div>
          </div>

          {/* Results */}
          {result && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Results</h3>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="mb-2">
                  <span className={`inline-block px-2 py-1 rounded text-sm ${
                    result.success 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {result.success ? '✅ Success' : '❌ Error'}
                  </span>
                </div>
                
                <pre className="text-sm overflow-auto max-h-96 bg-white p-3 rounded border">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {/* API Info */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">📡 API Information</h4>
            <p className="text-sm text-blue-800">
              This test uses direct Supabase API calls instead of the Node.js backend server.
              <br />
              <strong>Supabase URL:</strong> {process.env.NEXT_PUBLIC_SUPABASE_URL}
              <br />
              <strong>Table:</strong> core_clients
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}