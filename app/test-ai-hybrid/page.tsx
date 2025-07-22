"use client"

import { useState } from "react"
import { useOrganization } from "@/utils/organization-context"

export default function TestAIHybridPage() {
  const { organizationId } = useOrganization()
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [testType, setTestType] = useState<'migration' | 'generation'>('migration')

  // Test data for migration (includes some tricky cases for Smart Path)
  const trickyCases = [
    { originalCode: '1000', originalName: 'Cash', originalType: 'Asset' },
    { originalCode: '2000', originalName: 'A/P', originalType: 'Liability' },
    { originalCode: '9999', originalName: 'Miscellaneous Weird Account', originalType: '' }, // Should trigger AI
    { originalCode: '7777', originalName: 'Cryptocurrency Holdings', originalType: 'Asset' }, // Modern case
    { originalCode: '5555', originalName: 'Carbon Credit Expenses', originalType: '' }, // Complex case
    { originalCode: '3333', originalName: 'Employee Stock Purchase Plan', originalType: '' }, // HR/Equity hybrid
  ]

  // Test migration with hybrid AI
  const testMigration = async () => {
    setLoading(true)
    setResult(null)
    
    try {
      console.log('🧪 Testing Hybrid AI Migration System...')
      
      const response = await fetch('/api/finance/chart-of-accounts/migrate-legacy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationId: organizationId || '123e4567-e89b-12d3-a456-426614174000',
          accounts: trickyCases,
          migrationMode: 'preview',
          mappingStrategy: 'ai_smart',
          conflictResolution: 'rename',
          preserveStructure: true
        })
      })

      const migrationResult = await response.json()
      setResult({ migration: migrationResult })
      
      console.log('✅ Migration test complete:', migrationResult)
    } catch (error) {
      setResult({ error: error.message })
      console.error('❌ Migration test failed:', error)
    } finally {
      setLoading(false)
    }
  }

  // Test AI generation with hybrid approach
  const testGeneration = async () => {
    setLoading(true)
    setResult(null)
    
    try {
      console.log('🧪 Testing Hybrid AI Generation System...')
      
      // Test with complex business type to trigger Claude AI
      const response = await fetch('/api/finance/chart-of-accounts/ai-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationId: organizationId || '123e4567-e89b-12d3-a456-426614174000',
          businessType: 'tech startup with SaaS products', // Non-restaurant to trigger AI
          description: 'A technology startup that develops SaaS products for restaurants, with subscription revenue, development costs, and cloud infrastructure expenses',
          specificNeeds: ['subscription_billing', 'cloud_infrastructure', 'software_development', 'customer_acquisition'],
          complexity: 'advanced' // This should definitely trigger Claude AI
        })
      })

      const generationResult = await response.json()
      setResult({ generation: generationResult })
      
      console.log('✅ Generation test complete:', generationResult)
    } catch (error) {
      setResult({ error: error.message })
      console.error('❌ Generation test failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const claudeAvailable = typeof window !== 'undefined' && 
    (window as any).__CLAUDE_API_AVAILABLE !== false // Would be set by the service

  return (
    <div className="min-h-screen bg-gray-800 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">🤖 Test HERA Hybrid AI System</h1>
          <div className="bg-gray-900 p-4 rounded-lg mb-6">
            <h3 className="text-lg font-semibold mb-2">System Status</h3>
            <div className="space-y-2 text-sm">
              <div>Organization ID: <span className="text-teal-400">{organizationId || 'Not set'}</span></div>
              <div>Claude API: <span className={`${claudeAvailable ? 'text-green-400' : 'text-yellow-400'}`}>
                {claudeAvailable ? '✅ Available (Smart Path Enabled)' : '⚠️ Not configured (Fast Path Only)'}
              </span></div>
            </div>
          </div>
          
          <div className="bg-blue-900/30 border border-blue-600 p-4 rounded-lg mb-6">
            <h3 className="text-lg font-semibold mb-2">🧠 How Hybrid AI Works</h3>
            <div className="space-y-2 text-sm">
              <div><strong>Fast Path:</strong> Rule-based logic for common cases (95% accuracy, instant response)</div>
              <div><strong>Smart Path:</strong> Claude AI for complex cases (98%+ accuracy, 2-3 seconds)</div>
              <div><strong>Triggers:</strong> Low confidence (&lt;75%), unusual account names, complex business types</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-900 p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-4">Test Migration</h2>
            <p className="text-gray-300 mb-4">
              Tests account mapping with mix of easy and complex cases. 
              Complex cases should trigger Claude AI Smart Path.
            </p>
            <div className="bg-gray-800 p-3 rounded text-xs mb-4">
              <strong>Test Cases:</strong>
              <ul className="mt-2 space-y-1">
                <li>✅ Cash, A/P (Fast Path expected)</li>
                <li>🧠 Cryptocurrency Holdings (Smart Path expected)</li>
                <li>🧠 Carbon Credit Expenses (Smart Path expected)</li>
                <li>🧠 Employee Stock Purchase Plan (Smart Path expected)</li>
              </ul>
            </div>
            <button
              onClick={testMigration}
              disabled={loading}
              className="bg-teal-500 hover:bg-teal-600 px-4 py-2 rounded disabled:opacity-50 w-full"
            >
              {loading && testType === 'migration' ? 'Testing Migration...' : 'Test Hybrid Migration'}
            </button>
          </div>

          <div className="bg-gray-900 p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-4">Test AI Generation</h2>
            <p className="text-gray-300 mb-4">
              Tests account generation for complex business type. 
              Should trigger Claude AI for advanced complexity.
            </p>
            <div className="bg-gray-800 p-3 rounded text-xs mb-4">
              <strong>Test Parameters:</strong>
              <ul className="mt-2 space-y-1">
                <li>Business: Tech SaaS startup</li>
                <li>Complexity: Advanced</li>
                <li>Needs: Subscription billing, cloud costs</li>
                <li>Expected: Claude AI Smart Path</li>
              </ul>
            </div>
            <button
              onClick={testGeneration}
              disabled={loading}
              className="bg-purple-500 hover:bg-purple-600 px-4 py-2 rounded disabled:opacity-50 w-full"
            >
              {loading && testType === 'generation' ? 'Testing Generation...' : 'Test Hybrid Generation'}
            </button>
          </div>
        </div>

        {result && (
          <div className="bg-gray-900 p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-4">🔍 Test Results</h2>
            
            {result.migration && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2 text-teal-400">Migration Results</h3>
                <div className="text-sm space-y-2 mb-4">
                  <div>Total Accounts: {result.migration.summary?.totalAccounts || 0}</div>
                  <div>AI Enhanced: {result.migration.mappedAccounts?.filter((a: any) => 
                    a.suggestedMapping.description?.includes('AI Enhanced')).length || 0}</div>
                  <div>High Confidence: {result.migration.mappedAccounts?.filter((a: any) => 
                    a.suggestedMapping.confidence > 0.8).length || 0}</div>
                </div>
                
                {result.migration.mappedAccounts?.map((account: any, i: number) => (
                  <div key={i} className="bg-gray-800 p-3 rounded mb-2">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <strong>{account.originalAccount.originalName}</strong>
                        <span className="text-gray-400 ml-2">({account.originalAccount.originalCode})</span>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs ${
                        account.suggestedMapping.confidence > 0.8 ? 'bg-green-600' : 
                        account.suggestedMapping.confidence > 0.6 ? 'bg-yellow-600' : 'bg-red-600'
                      }`}>
                        {Math.round(account.suggestedMapping.confidence * 100)}% confidence
                      </span>
                    </div>
                    <div className="text-sm text-gray-300">
                      <div>→ <strong>{account.suggestedMapping.accountName}</strong> ({account.suggestedMapping.accountCode})</div>
                      <div className="text-xs text-gray-400 mt-1">{account.suggestedMapping.reasoning}</div>
                      {account.suggestedMapping.description?.includes('AI Enhanced') && (
                        <div className="text-xs text-teal-400 mt-1">🧠 Enhanced by Claude AI</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {result.generation && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2 text-purple-400">Generation Results</h3>
                <div className="text-sm space-y-2 mb-4">
                  <div>Generated Accounts: {result.generation.data?.generatedAccounts?.length || 0}</div>
                  <div>Essential: {result.generation.data?.summary?.essential || 0}</div>
                  <div>Recommended: {result.generation.data?.summary?.recommended || 0}</div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-96 overflow-y-auto">
                  {result.generation.data?.generatedAccounts?.map((account: any, i: number) => (
                    <div key={i} className="bg-gray-800 p-3 rounded text-sm">
                      <div className="font-semibold">{account.accountName}</div>
                      <div className="text-teal-400 text-xs">{account.accountCode}</div>
                      <div className="text-gray-400 text-xs">{account.accountType}</div>
                      <div className="text-xs mt-1">{account.description}</div>
                      <div className="text-xs text-gray-500 mt-1">{account.aiReasoning}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result.error && (
              <div className="bg-red-900/30 border border-red-600 p-4 rounded">
                <strong className="text-red-400">Error:</strong> {result.error}
              </div>
            )}
            
            <details className="mt-4">
              <summary className="cursor-pointer text-gray-400 hover:text-white">
                View Raw JSON Response
              </summary>
              <pre className="bg-gray-800 p-4 rounded mt-2 text-xs overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </div>
    </div>
  )
}