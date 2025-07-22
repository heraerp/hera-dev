"use client"

import { useState, useEffect } from "react"

export default function TestApprovalDebugPage() {
  const [pos, setPOs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [testResult, setTestResult] = useState<any>(null)
  const organizationId = '123e4567-e89b-12d3-a456-426614174000'

  // Fetch POs on load
  useEffect(() => {
    fetchPOs()
  }, [])

  const fetchPOs = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/purchasing/purchase-orders/approve?organizationId=${organizationId}&status=all`)
      const data = await response.json()
      
      setPOs(data.data || [])
      console.log('📊 Fetched POs:', data.data)
    } catch (error) {
      console.error('❌ Error fetching POs:', error)
    } finally {
      setLoading(false)
    }
  }

  const testApproval = async (poId: string, poNumber: string) => {
    try {
      console.log(`🧪 Testing approval for ${poNumber}...`)
      setTestResult({ loading: true, poNumber })
      
      const requestData = {
        poId,
        organizationId,
        action: 'approve',
        approverId: '00000001-0000-0000-0000-000000000002',
        approverName: 'Chef Mario',
        notes: 'Test approval from debug page'
      }

      console.log('📝 Request:', requestData)

      const response = await fetch('/api/purchasing/purchase-orders/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      })

      const result = await response.json()
      console.log('📊 Response:', result)

      setTestResult({
        success: response.ok,
        status: response.status,
        data: result,
        poNumber
      })

      if (response.ok) {
        // Refresh POs
        setTimeout(fetchPOs, 1000)
      }
    } catch (error) {
      console.error('❌ Approval test failed:', error)
      setTestResult({
        success: false,
        error: error.message,
        poNumber
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-400"></div>
          <span className="ml-3">Loading purchase orders...</span>
        </div>
      </div>
    )
  }

  const pendingPOs = pos.filter(po => po.status === 'pending_approval')

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">🧪 Approval Debug Test Page</h1>
        
        <div className="bg-gray-800 p-6 rounded-lg mb-6">
          <h2 className="text-xl font-semibold mb-4">System Status</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="text-gray-400">Total POs</div>
              <div className="text-2xl font-bold text-blue-400">{pos.length}</div>
            </div>
            <div>
              <div className="text-gray-400">Pending Approval</div>
              <div className="text-2xl font-bold text-yellow-400">{pendingPOs.length}</div>
            </div>
            <div>
              <div className="text-gray-400">Organization ID</div>
              <div className="text-xs text-gray-300 break-all">{organizationId}</div>
            </div>
            <div>
              <div className="text-gray-400">API Status</div>
              <div className="text-green-400">✅ Connected</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pending Approvals */}
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">🕐 Pending Approvals ({pendingPOs.length})</h3>
            
            {pendingPOs.length === 0 ? (
              <div className="text-gray-400 text-center py-8">
                No pending approvals found
              </div>
            ) : (
              <div className="space-y-4">
                {pendingPOs.map((po) => (
                  <div key={po.id} className="bg-gray-700 p-4 rounded border">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-semibold">{po.poNumber}</div>
                        <div className="text-sm text-gray-400">{po.supplierInfo?.supplierName}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">${po.amount.toLocaleString()}</div>
                        <div className="text-xs text-gray-400">{po.approvalLevel}</div>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => testApproval(po.id, po.poNumber)}
                      disabled={testResult?.loading && testResult.poNumber === po.poNumber}
                      className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-sm disabled:opacity-50 w-full"
                    >
                      {testResult?.loading && testResult.poNumber === po.poNumber 
                        ? 'Testing Approval...' 
                        : 'Test Approve'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Test Results */}
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">🧪 Test Results</h3>
            
            {!testResult ? (
              <div className="text-gray-400 text-center py-8">
                Click "Test Approve" on a pending PO to see results
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-gray-700 p-4 rounded">
                  <div className="flex items-center mb-2">
                    <span className={`inline-block w-3 h-3 rounded-full mr-2 ${
                      testResult.success ? 'bg-green-400' : 'bg-red-400'
                    }`}></span>
                    <span className="font-semibold">
                      {testResult.success ? '✅ Success' : '❌ Failed'}
                    </span>
                  </div>
                  
                  <div className="text-sm space-y-2">
                    <div>
                      <strong>PO:</strong> {testResult.poNumber}
                    </div>
                    {testResult.status && (
                      <div>
                        <strong>HTTP Status:</strong> {testResult.status}
                      </div>
                    )}
                    {testResult.error && (
                      <div className="text-red-400">
                        <strong>Error:</strong> {testResult.error}
                      </div>
                    )}
                  </div>
                </div>

                {testResult.data && (
                  <div className="bg-gray-700 p-4 rounded">
                    <h4 className="font-semibold mb-2">Response Data:</h4>
                    <pre className="text-xs bg-gray-800 p-2 rounded overflow-auto max-h-40">
                      {JSON.stringify(testResult.data, null, 2)}
                    </pre>
                  </div>
                )}

                <button
                  onClick={() => setTestResult(null)}
                  className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded text-sm w-full"
                >
                  Clear Results
                </button>
              </div>
            )}
          </div>
        </div>

        {/* All POs */}
        <div className="bg-gray-800 p-6 rounded-lg mt-6">
          <h3 className="text-lg font-semibold mb-4">📋 All Purchase Orders ({pos.length})</h3>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-2">PO Number</th>
                  <th className="text-left py-2">Supplier</th>
                  <th className="text-left py-2">Amount</th>
                  <th className="text-left py-2">Status</th>
                  <th className="text-left py-2">Level</th>
                </tr>
              </thead>
              <tbody>
                {pos.map((po) => (
                  <tr key={po.id} className="border-b border-gray-700">
                    <td className="py-2">{po.poNumber}</td>
                    <td className="py-2">{po.supplierInfo?.supplierName || 'Unknown'}</td>
                    <td className="py-2">${po.amount.toLocaleString()}</td>
                    <td className="py-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        po.status === 'pending_approval' ? 'bg-yellow-600' :
                        po.status === 'approved' ? 'bg-green-600' :
                        po.status === 'rejected' ? 'bg-red-600' :
                        'bg-gray-600'
                      }`}>
                        {po.status}
                      </span>
                    </td>
                    <td className="py-2">{po.approvalLevel}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={fetchPOs}
            className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded"
          >
            🔄 Refresh Data
          </button>
        </div>
      </div>
    </div>
  )
}