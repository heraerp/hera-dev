"use client"

import { useState } from "react"
import { useOrganization } from "@/utils/organization-context"

export default function TestTemplateGenerationPage() {
  const { organizationId } = useOrganization()
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [testType, setTestType] = useState<'generate' | 'load' | 'list'>('generate')

  // Test template generation
  const testTemplateGeneration = async () => {
    setLoading(true)
    setTestType('generate')
    setResult(null)
    
    try {
      console.log('🧠 Testing Claude COA Template Generation...')
      
      const response = await fetch('/api/finance/chart-of-accounts/generate-template', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessType: 'restaurant',
          businessDetails: {
            cuisineType: ['italian', 'american'],
            services: ['dine-in', 'takeout', 'delivery', 'catering'],
            size: 'medium',
            locations: 2,
            specialRequirements: ['bar', 'bakery']
          },
          regenerate: false // Use cached if available
        })
      })

      const templateResult = await response.json()
      setResult({ generation: templateResult })
      
      console.log('✅ Template generation test complete:', templateResult)
    } catch (error) {
      setResult({ error: error.message })
      console.error('❌ Template generation test failed:', error)
    } finally {
      setLoading(false)
    }
  }

  // Test template loading
  const testTemplateLoading = async () => {
    setLoading(true)
    setTestType('load')
    setResult(null)
    
    try {
      console.log('📚 Testing Template Loading...')
      
      const response = await fetch('/api/finance/chart-of-accounts/generate-template?businessType=restaurant')

      const templateResult = await response.json()
      setResult({ loading: templateResult })
      
      console.log('✅ Template loading test complete:', templateResult)
    } catch (error) {
      setResult({ error: error.message })
      console.error('❌ Template loading test failed:', error)
    } finally {
      setLoading(false)
    }
  }

  // Test template listing
  const testTemplateListing = async () => {
    setLoading(true)
    setTestType('list')
    setResult(null)
    
    try {
      console.log('📋 Testing Template Listing...')
      
      const response = await fetch('/api/finance/chart-of-accounts/generate-template')

      const templateResult = await response.json()
      setResult({ listing: templateResult })
      
      console.log('✅ Template listing test complete:', templateResult)
    } catch (error) {
      setResult({ error: error.message })
      console.error('❌ Template listing test failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const claudeAvailable = typeof window !== 'undefined' && 
    (window as any).__CLAUDE_API_AVAILABLE !== false

  return (
    <div className="min-h-screen bg-gray-800 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">🧠 Test Claude COA Template Generation</h1>
          <div className="bg-gray-900 p-4 rounded-lg mb-6">
            <h3 className="text-lg font-semibold mb-2">System Status</h3>
            <div className="space-y-2 text-sm">
              <div>Organization ID: <span className="text-teal-400">{organizationId || 'Not set'}</span></div>
              <div>Claude API: <span className={`${claudeAvailable ? 'text-green-400' : 'text-yellow-400'}`}>
                {claudeAvailable ? '✅ Available (Template Generation Enabled)' : '⚠️ Not configured (Template Generation Disabled)'}
              </span></div>
            </div>
          </div>
          
          <div className="bg-blue-900/30 border border-blue-600 p-4 rounded-lg mb-6">
            <h3 className="text-lg font-semibold mb-2">🏗️ How Template Generation Works</h3>
            <div className="space-y-2 text-sm">
              <div><strong>Generate:</strong> Claude AI creates comprehensive 100+ account templates for specific business types</div>
              <div><strong>Store:</strong> Templates saved to HERA universal database using core_entities + core_dynamic_data</div>
              <div><strong>Reference:</strong> Future account creation and migration use templates for intelligent matching</div>
              <div><strong>Benefits:</strong> Consistency, industry best practices, AI-powered intelligence, fast operations</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-900 p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-4">🧠 Generate Template</h2>
            <p className="text-gray-300 mb-4">
              Use Claude AI to generate a comprehensive restaurant COA template
              with 100+ accounts, industry best practices, and metadata.
            </p>
            <div className="bg-gray-800 p-3 rounded text-xs mb-4">
              <strong>Test Parameters:</strong>
              <ul className="mt-2 space-y-1">
                <li>Business: Italian/American restaurant</li>
                <li>Services: Dine-in, takeout, delivery, catering</li>
                <li>Special: Bar, bakery operations</li>
                <li>Size: Medium (2 locations)</li>
              </ul>
            </div>
            <button
              onClick={testTemplateGeneration}
              disabled={loading}
              className="bg-teal-500 hover:bg-teal-600 px-4 py-2 rounded disabled:opacity-50 w-full"
            >
              {loading && testType === 'generate' ? 'Generating Template...' : 'Generate New Template'}
            </button>
          </div>

          <div className="bg-gray-900 p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-4">📚 Load Template</h2>
            <p className="text-gray-300 mb-4">
              Load existing restaurant template from database.
              Shows cached template if available, otherwise suggests generation.
            </p>
            <div className="bg-gray-800 p-3 rounded text-xs mb-4">
              <strong>Test Functionality:</strong>
              <ul className="mt-2 space-y-1">
                <li>Template existence check</li>
                <li>Database retrieval via universal tables</li>
                <li>Template reconstruction from dynamic data</li>
                <li>Metadata parsing and validation</li>
              </ul>
            </div>
            <button
              onClick={testTemplateLoading}
              disabled={loading}
              className="bg-purple-500 hover:bg-purple-600 px-4 py-2 rounded disabled:opacity-50 w-full"
            >
              {loading && testType === 'load' ? 'Loading Template...' : 'Load Restaurant Template'}
            </button>
          </div>

          <div className="bg-gray-900 p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-4">📋 List Templates</h2>
            <p className="text-gray-300 mb-4">
              List all available templates in the system.
              Shows template IDs, business types, and creation dates.
            </p>
            <div className="bg-gray-800 p-3 rounded text-xs mb-4">
              <strong>Template Registry:</strong>
              <ul className="mt-2 space-y-1">
                <li>System organization templates</li>
                <li>Version management</li>
                <li>Template metadata overview</li>
                <li>Usage statistics</li>
              </ul>
            </div>
            <button
              onClick={testTemplateListing}
              disabled={loading}
              className="bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded disabled:opacity-50 w-full"
            >
              {loading && testType === 'list' ? 'Loading Templates...' : 'List All Templates'}
            </button>
          </div>
        </div>

        {result && (
          <div className="bg-gray-900 p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-4">🔍 Test Results</h2>
            
            {result.generation && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2 text-teal-400">Template Generation Results</h3>
                
                {result.generation.success && result.generation.data?.template && (
                  <div>
                    <div className="text-sm space-y-2 mb-4">
                      <div>Template ID: <span className="text-teal-400">{result.generation.data.template.templateId}</span></div>
                      <div>Source: <span className="text-yellow-400">{result.generation.data.source}</span></div>
                      <div>Total Accounts: <span className="text-green-400">{result.generation.data.template.accounts?.length || 0}</span></div>
                      <div>Business Type: {result.generation.data.template.businessType}</div>
                      <div>Version: {result.generation.data.template.version}</div>
                    </div>
                    
                    {result.generation.data.template.metadata?.categories && (
                      <div className="mb-4">
                        <h4 className="font-semibold mb-2">Account Categories:</h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                          {Object.entries(result.generation.data.template.metadata.categories).map(([category, count]) => (
                            <div key={category} className="bg-gray-800 p-2 rounded">
                              <div className="font-semibold text-teal-400">{category}</div>
                              <div>{count} accounts</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="max-h-96 overflow-y-auto">
                      <h4 className="font-semibold mb-2">Sample Accounts (first 10):</h4>
                      <div className="space-y-2">
                        {result.generation.data.template.accounts?.slice(0, 10).map((account: any, i: number) => (
                          <div key={i} className="bg-gray-800 p-3 rounded text-sm">
                            <div className="flex justify-between items-start mb-1">
                              <div className="font-semibold">{account.accountName}</div>
                              <div className="text-teal-400 text-xs">{account.accountCode}</div>
                            </div>
                            <div className="text-orange-400 text-xs mb-1">{account.accountType}</div>
                            <div className="text-gray-400 text-xs mb-2">{account.description}</div>
                            {account.keywords && (
                              <div className="text-xs text-gray-500">
                                Keywords: {account.keywords.join(', ')}
                              </div>
                            )}
                            {account.aiMetadata && (
                              <div className="text-xs text-gray-500 mt-1">
                                Priority: {account.aiMetadata.priority} | 
                                Confidence: {(account.aiMetadata.confidence * 100).toFixed(0)}% |
                                Usage: {account.aiMetadata.usageFrequency}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                
                {result.generation.error && (
                  <div className="bg-red-900/30 border border-red-600 p-4 rounded">
                    <strong className="text-red-400">Error:</strong> {result.generation.error}
                  </div>
                )}
              </div>
            )}

            {result.loading && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2 text-purple-400">Template Loading Results</h3>
                
                {result.loading.success && result.loading.data?.template && (
                  <div className="text-sm space-y-2">
                    <div>Template ID: <span className="text-teal-400">{result.loading.data.template.templateId}</span></div>
                    <div>Total Accounts: <span className="text-green-400">{result.loading.data.template.accounts?.length || 0}</span></div>
                    <div>Created: {new Date(result.loading.data.template.generatedAt).toLocaleDateString()}</div>
                    <div>Status: <span className="text-green-400">Successfully loaded from database</span></div>
                  </div>
                )}
                
                {result.loading.error && (
                  <div className="bg-red-900/30 border border-red-600 p-4 rounded">
                    <strong className="text-red-400">Error:</strong> {result.loading.error}
                  </div>
                )}
              </div>
            )}

            {result.listing && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2 text-orange-400">Template Listing Results</h3>
                
                {result.listing.success && (
                  <div>
                    <div className="text-sm mb-4">
                      Found {result.listing.data.templates?.length || 0} templates in system
                    </div>
                    
                    {result.listing.data.templates?.length > 0 && (
                      <div className="space-y-2">
                        {result.listing.data.templates.map((template: any, i: number) => (
                          <div key={i} className="bg-gray-800 p-3 rounded text-sm">
                            <div className="font-semibold text-teal-400">{template.entity_code}</div>
                            <div className="text-gray-300">{template.entity_name}</div>
                            <div className="text-xs text-gray-500">Created: {new Date(template.created_at).toLocaleString()}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                
                {result.listing.error && (
                  <div className="bg-red-900/30 border border-red-600 p-4 rounded">
                    <strong className="text-red-400">Error:</strong> {result.listing.error}
                  </div>
                )}
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
              <pre className="bg-gray-800 p-4 rounded mt-2 text-xs overflow-auto max-h-96">
                {JSON.stringify(result, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </div>
    </div>
  )
}