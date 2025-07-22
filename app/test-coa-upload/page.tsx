"use client"

import { useState } from "react"
import { useOrganization } from "@/utils/organization-context"

export default function TestCOAUploadPage() {
  const { organizationId } = useOrganization()
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testCSV = `Account Code,Account Name,Account Type,Description
1000,Cash,Asset,Operating cash accounts
1100,Accounts Receivable,Asset,Customer receivables
2000,Accounts Payable,Liability,Vendor payables
3000,Owner's Equity,Equity,Owner capital accounts
4000,Sales Revenue,Revenue,Restaurant sales
5000,Food Cost,Cost of Sales,Direct food costs
6000,Labor Cost,Direct Expense,Kitchen staff wages
7000,Rent Expense,Indirect Expense,Monthly rent
8000,Sales Tax Payable,Tax Expense,Sales tax collected`

  const testImport = async () => {
    setLoading(true)
    try {
      // Test CSV Import
      const importResponse = await fetch('/api/finance/chart-of-accounts/import-csv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationId: organizationId || '123e4567-e89b-12d3-a456-426614174000',
          fileContent: testCSV,
          fileFormat: 'csv',
          hasHeaders: true,
          skipRows: 0,
          previewMode: true
        })
      })

      const importResult = await importResponse.json()
      
      if (!importResponse.ok) {
        setResult({ error: importResult.error || 'Import failed' })
        return
      }

      console.log('Import result:', importResult)
      console.log('Accounts to migrate:', importResult.accounts?.length || 0)
      
      // Test Migration
      const migrationResponse = await fetch('/api/finance/chart-of-accounts/migrate-legacy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationId: organizationId || '123e4567-e89b-12d3-a456-426614174000',
          accounts: importResult.accounts,
          migrationMode: 'preview',
          mappingStrategy: 'ai_smart',
          conflictResolution: 'rename',
          preserveStructure: true,
          options: {
            preserveCodes: true,
            suggestMissing: true,
            validateCompliance: true
          }
        })
      })

      const migrationResult = await migrationResponse.json()
      
      setResult({
        import: importResult,
        migration: migrationResult
      })
    } catch (error) {
      setResult({ error: error.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-800 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Test COA Upload</h1>
        <p className="mb-4">Organization ID: {organizationId || 'Not set'}</p>
        
        <button
          onClick={testImport}
          disabled={loading}
          className="bg-teal-500 hover:bg-teal-600 px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test CSV Import'}
        </button>

        {result && (
          <div className="mt-8">
            <h2 className="text-xl font-bold mb-4">Result:</h2>
            <pre className="bg-gray-900 p-4 rounded overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}

        <div className="mt-8">
          <h3 className="text-lg font-bold mb-2">Test CSV Data:</h3>
          <pre className="bg-gray-900 p-4 rounded text-sm">
{testCSV}
          </pre>
        </div>
      </div>
    </div>
  )
}