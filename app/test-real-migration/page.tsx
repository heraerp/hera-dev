"use client"

import { useState } from "react"
import { useOrganization } from "@/utils/organization-context"

export default function TestRealMigrationPage() {
  const { organizationId } = useOrganization()
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<'upload' | 'processing' | 'complete'>('upload')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      console.log('📁 File selected:', file.name, `(${(file.size / 1024 / 1024).toFixed(2)} MB)`)
    }
  }

  const testRealFile = async () => {
    if (!selectedFile) return

    setLoading(true)
    setStep('processing')
    setResult(null)
    
    try {
      console.log('🧪 Testing Real CSV Migration with:', selectedFile.name)
      
      // Step 1: Read and parse the CSV file
      const fileContent = await selectedFile.text()
      console.log('📊 File size:', (fileContent.length / 1024).toFixed(2), 'KB')
      
      // Step 2: Import CSV
      console.log('📤 Step 1: Importing CSV...')
      const importResponse = await fetch('/api/finance/chart-of-accounts/import-csv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationId: organizationId || '123e4567-e89b-12d3-a456-426614174000',
          fileContent: fileContent,
          fileFormat: 'auto_detect',
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

      console.log('✅ Import successful:', importResult.parsedAccounts, 'accounts parsed')

      // Step 3: Test migration with hybrid AI (sample of accounts for faster testing)
      const sampleSize = 20 // Test with first 20 accounts for speed
      const sampleAccounts = importResult.accounts.slice(0, sampleSize)
      
      console.log('🧠 Step 2: Testing Hybrid AI Migration on', sampleSize, 'sample accounts...')
      
      const migrationResponse = await fetch('/api/finance/chart-of-accounts/migrate-legacy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationId: organizationId || '123e4567-e89b-12d3-a456-426614174000',
          accounts: sampleAccounts,
          migrationMode: 'preview',
          mappingStrategy: 'ai_smart',
          conflictResolution: 'rename',
          preserveStructure: true
        })
      })

      const migrationResult = await migrationResponse.json()
      
      setResult({
        fileInfo: {
          name: selectedFile.name,
          size: selectedFile.size,
          totalAccounts: importResult.parsedAccounts
        },
        import: importResult,
        migration: migrationResult,
        sampleSize: sampleSize
      })
      
      setStep('complete')
      console.log('✅ Migration test complete!')
      
    } catch (error) {
      setResult({ error: error.message })
      console.error('❌ Migration test failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const analyzeAccountTypes = (accounts: any[]) => {
    const types = accounts.reduce((acc, account) => {
      const type = account.primarygroup || 'Unknown'
      acc[type] = (acc[type] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    return Object.entries(types)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10) // Top 10 types
  }

  return (
    <div className="min-h-screen bg-gray-800 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">🧪 Test Real CSV Migration</h1>
          <p className="text-gray-300">
            Upload your real CSV file to test HERA's hybrid AI migration system with actual business data.
          </p>
        </div>

        {step === 'upload' && (
          <div className="bg-gray-900 p-6 rounded-lg mb-6">
            <h2 className="text-xl font-bold mb-4">📁 Upload CSV File</h2>
            
            <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center mb-4">
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileSelect}
                className="hidden"
                id="csvFile"
              />
              <label htmlFor="csvFile" className="cursor-pointer">
                <div className="text-4xl mb-4">📄</div>
                <div className="text-lg mb-2">Click to select CSV file</div>
                <div className="text-sm text-gray-400">Supports CSV, Excel formats</div>
              </label>
            </div>

            {selectedFile && (
              <div className="bg-gray-800 p-4 rounded-lg mb-4">
                <h3 className="font-semibold mb-2">Selected File:</h3>
                <div className="text-sm space-y-1">
                  <div>📄 <strong>{selectedFile.name}</strong></div>
                  <div>📊 Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB</div>
                  <div>📅 Modified: {new Date(selectedFile.lastModified).toLocaleDateString()}</div>
                </div>
              </div>
            )}

            <button
              onClick={testRealFile}
              disabled={!selectedFile || loading}
              className="bg-teal-500 hover:bg-teal-600 px-6 py-3 rounded disabled:opacity-50 w-full text-lg font-semibold"
            >
              {loading ? 'Processing...' : 'Test Migration'}
            </button>
          </div>
        )}

        {step === 'processing' && (
          <div className="bg-gray-900 p-6 rounded-lg mb-6">
            <h2 className="text-xl font-bold mb-4">⚡ Processing Migration</h2>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-400"></div>
                <span>Parsing CSV file...</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="animate-pulse rounded-full h-6 w-6 bg-teal-400"></div>
                <span>Running hybrid AI analysis...</span>
              </div>
              <div className="text-sm text-gray-400 mt-4">
                This may take a few seconds for large files. Complex accounts will trigger Claude AI.
              </div>
            </div>
          </div>
        )}

        {result && step === 'complete' && (
          <div className="space-y-6">
            {/* File Summary */}
            <div className="bg-gray-900 p-6 rounded-lg">
              <h2 className="text-xl font-bold mb-4">📊 File Analysis</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-800 p-4 rounded">
                  <div className="text-2xl font-bold text-teal-400">{result.fileInfo?.totalAccounts || 0}</div>
                  <div className="text-sm text-gray-400">Total Accounts</div>
                </div>
                <div className="bg-gray-800 p-4 rounded">
                  <div className="text-2xl font-bold text-purple-400">{result.sampleSize || 0}</div>
                  <div className="text-sm text-gray-400">Tested Sample</div>
                </div>
                <div className="bg-gray-800 p-4 rounded">
                  <div className="text-2xl font-bold text-green-400">
                    {result.fileInfo?.size ? `${(result.fileInfo.size / 1024 / 1024).toFixed(1)}MB` : '0MB'}
                  </div>
                  <div className="text-sm text-gray-400">File Size</div>
                </div>
              </div>
            </div>

            {/* Import Results */}
            {result.import && (
              <div className="bg-gray-900 p-6 rounded-lg">
                <h2 className="text-xl font-bold mb-4 text-teal-400">📤 Import Results</h2>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="text-sm text-gray-400">Parsed Successfully</div>
                    <div className="text-lg font-semibold text-green-400">
                      {result.import.parsedAccounts || 0} / {result.import.totalRows || 0}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Parse Errors</div>
                    <div className="text-lg font-semibold text-red-400">
                      {result.import.errors?.length || 0}
                    </div>
                  </div>
                </div>

                {/* Account Types Distribution */}
                {result.import.accounts && (
                  <div className="mt-4">
                    <h3 className="font-semibold mb-2">Account Types Found:</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                      {analyzeAccountTypes(result.import.accounts).map(([type, count], i) => (
                        <div key={i} className="bg-gray-800 p-2 rounded">
                          <div className="font-medium">{type}</div>
                          <div className="text-gray-400">{count} accounts</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Migration Results */}
            {result.migration && (
              <div className="bg-gray-900 p-6 rounded-lg">
                <h2 className="text-xl font-bold mb-4 text-purple-400">🧠 Hybrid AI Results</h2>
                
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-gray-800 p-4 rounded text-center">
                    <div className="text-lg font-semibold text-green-400">
                      {result.migration.mappedAccounts?.filter((a: any) => a.suggestedMapping.confidence > 0.8).length || 0}
                    </div>
                    <div className="text-sm text-gray-400">High Confidence</div>
                  </div>
                  <div className="bg-gray-800 p-4 rounded text-center">
                    <div className="text-lg font-semibold text-teal-400">
                      {result.migration.mappedAccounts?.filter((a: any) => 
                        a.suggestedMapping.description?.includes('AI Enhanced')).length || 0}
                    </div>
                    <div className="text-sm text-gray-400">AI Enhanced</div>
                  </div>
                  <div className="bg-gray-800 p-4 rounded text-center">
                    <div className="text-lg font-semibold text-yellow-400">
                      {result.migration.mappedAccounts?.filter((a: any) => a.status === 'manual_review').length || 0}
                    </div>
                    <div className="text-sm text-gray-400">Needs Review</div>
                  </div>
                </div>

                {/* Sample Mappings */}
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {result.migration.mappedAccounts?.map((account: any, i: number) => (
                    <div key={i} className="bg-gray-800 p-3 rounded">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="font-semibold">{account.originalAccount.originalName}</div>
                          <div className="text-xs text-gray-400">
                            Original: {account.originalAccount.originalCode} • 
                            Group: {account.originalAccount.primarygroup || 'Unknown'}
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <span className={`px-2 py-1 rounded text-xs ${
                            account.suggestedMapping.confidence > 0.8 ? 'bg-green-600' : 
                            account.suggestedMapping.confidence > 0.6 ? 'bg-yellow-600' : 'bg-red-600'
                          }`}>
                            {Math.round(account.suggestedMapping.confidence * 100)}%
                          </span>
                          {account.suggestedMapping.description?.includes('AI Enhanced') && (
                            <span className="px-2 py-1 bg-teal-600 text-xs rounded">🧠 AI</span>
                          )}
                        </div>
                      </div>
                      <div className="text-sm text-gray-300">
                        <div>→ <strong>{account.suggestedMapping.accountName}</strong></div>
                        <div className="text-teal-400">
                          {account.suggestedMapping.accountCode} • {account.suggestedMapping.accountType}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {account.suggestedMapping.reasoning}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Error Display */}
            {result.error && (
              <div className="bg-red-900/30 border border-red-600 p-6 rounded-lg">
                <h2 className="text-xl font-bold mb-4 text-red-400">❌ Error</h2>
                <p>{result.error}</p>
              </div>
            )}

            {/* Raw Data */}
            <details className="bg-gray-900 p-6 rounded-lg">
              <summary className="cursor-pointer text-lg font-semibold mb-4">
                🔍 View Raw Results
              </summary>
              <pre className="bg-gray-800 p-4 rounded text-xs overflow-auto max-h-96">
                {JSON.stringify(result, null, 2)}
              </pre>
            </details>

            {/* Actions */}
            <div className="flex space-x-4">
              <button
                onClick={() => {
                  setStep('upload')
                  setResult(null)
                  setSelectedFile(null)
                }}
                className="bg-gray-600 hover:bg-gray-700 px-6 py-2 rounded"
              >
                Test Another File
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}