// 🧪 Entity Validation Test Page Component
// File: app/test/entity-validation/page.tsx

'use client';

import { HybridEntityValidationService, ValidationResult } from '@/lib/services/entity-validation.service';
import { useEffect, useState } from 'react';

interface TestResult {
  input: string;
  result: ValidationResult | null;
  responseTime: number;
  success: boolean;
  error?: string;
}

export default function EntityValidationTestPage() {
  const [validator, setValidator] = useState<HybridEntityValidationService | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [testInput, setTestInput] = useState('customers');
  const [industry, setIndustry] = useState('restaurant');
  const [singleResult, setSingleResult] = useState<ValidationResult | null>(null);
  const [batchResults, setBatchResults] = useState<TestResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [healthStatus, setHealthStatus] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);

  // Initialize service
  useEffect(() => {
    const initService = async () => {
      try {
        console.log('🚀 Initializing Entity Validation Service...');
        
        // Check environment variables first
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY;
        
        if (!supabaseUrl) {
          throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
        }
        
        if (!supabaseKey) {
          throw new Error('Missing NEXT_PUBLIC_SUPABASE_SERVICE_KEY environment variable');
        }
        
        console.log('✅ Environment variables found');
        console.log('📡 Supabase URL:', supabaseUrl);
        console.log('🔑 Service key:', supabaseKey.substring(0, 20) + '...');
        
        const service = new HybridEntityValidationService(supabaseUrl, supabaseKey);
        
        // Wait for initialization
        console.log('⏳ Waiting for service initialization...');
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        setValidator(service);
        setIsInitializing(false);
        
        // Load initial health status
        console.log('🏥 Checking service health...');
        try {
          const health = await service.healthCheck();
          setHealthStatus(health);
          console.log('✅ Health check completed:', health);
        } catch (healthError) {
          console.warn('⚠️ Health check failed:', healthError);
          setHealthStatus({
            status: 'unhealthy',
            database: false,
            cache: false,
            registrySize: 0,
            cacheSize: 0
          });
        }
        
        // Load initial stats
        try {
          const serviceStats = service.getCostStats();
          setStats(serviceStats);
          console.log('📊 Stats loaded:', serviceStats);
        } catch (statsError) {
          console.warn('⚠️ Stats loading failed:', statsError);
        }
        
        console.log('✅ Service initialized successfully');
        
      } catch (error) {
        console.error('❌ Failed to initialize service:', error);
        setIsInitializing(false);
        
        // Show detailed error information
        if (error instanceof Error) {
          if (error.message.includes('NEXT_PUBLIC_SUPABASE_URL')) {
            console.error('🔧 Fix: Add NEXT_PUBLIC_SUPABASE_URL to your .env.local file');
          } else if (error.message.includes('NEXT_PUBLIC_SUPABASE_SERVICE_KEY')) {
            console.error('🔧 Fix: Add NEXT_PUBLIC_SUPABASE_SERVICE_KEY to your .env.local file');
          } else {
            console.error('🔧 Check your Supabase configuration and database connection');
          }
        }
      }
    };

    initService();
  }, []);

  // Test single validation
  const testSingleValidation = async () => {
    if (!validator || !testInput.trim()) return;
    
    setIsLoading(true);
    setSingleResult(null);
    
    try {
      const startTime = Date.now();
      const result = await validator.validateEntityType(testInput.trim(), undefined, industry);
      const endTime = Date.now();
      
      setSingleResult({
        ...result,
        responseTime: endTime - startTime
      } as any);
      
      // Update stats
      const newStats = validator.getCostStats();
      setStats(newStats);
      
    } catch (error) {
      console.error('Validation failed:', error);
      setSingleResult({
        isValid: false,
        normalizedType: '',
        confidence: 0,
        reasoning: `Error: ${error}`,
        suggestions: [],
        validationMethod: 'ai',
        cost: 0,
        responseTime: 0
      } as any);
    } finally {
      setIsLoading(false);
    }
  };

  // Test batch validation
  const testBatchValidation = async () => {
    if (!validator) return;
    
    setIsLoading(true);
    setBatchResults([]);
    
    const testCases = [
      'customers',
      'menu items',
      'staff members',
      'tables',
      'orders',
      'reservations',
      'suppliers',
      'ingredients'
    ];
    
    try {
      const results: TestResult[] = [];
      
      for (const testCase of testCases) {
        try {
          const startTime = Date.now();
          const result = await validator.validateEntityType(testCase, undefined, industry);
          const endTime = Date.now();
          
          results.push({
            input: testCase,
            result,
            responseTime: endTime - startTime,
            success: true
          });
          
          // Update UI progressively
          setBatchResults([...results]);
          
        } catch (error) {
          results.push({
            input: testCase,
            result: null,
            responseTime: 0,
            success: false,
            error: String(error)
          });
        }
      }
      
      // Update stats
      const newStats = validator.getCostStats();
      setStats(newStats);
      
    } catch (error) {
      console.error('Batch validation failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh health status
  const refreshHealth = async () => {
    if (!validator) return;
    
    try {
      const health = await validator.healthCheck();
      setHealthStatus(health);
    } catch (error) {
      console.error('Health check failed:', error);
    }
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Initializing Entity Validation Service...</p>
          <p className="text-sm text-gray-500">This may take a few seconds</p>
        </div>
      </div>
    );
  }

  if (!validator) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">❌ Service Initialization Failed</div>
          <p className="text-gray-600">Please check your environment variables and try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🧪 Entity Validation Service Test
          </h1>
          <p className="text-gray-600">
            Test the HERA Universal Entity Validation Service with real-time results
          </p>
        </div>

        {/* Health Status */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">🏥 Service Health</h2>
            <button
              onClick={refreshHealth}
              className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
              aria-label="Refresh service health status"
              title="Click to refresh the service health check"
            >
              Refresh
            </button>
          </div>
          
          {healthStatus && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className={`text-2xl font-bold ${
                  healthStatus.status === 'healthy' ? 'text-green-600' : 
                  healthStatus.status === 'degraded' ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {healthStatus.status === 'healthy' ? '✅' : 
                   healthStatus.status === 'degraded' ? '⚠️' : '❌'}
                </div>
                <div className="text-sm text-gray-600">Status</div>
                <div className="font-medium capitalize">{healthStatus.status}</div>
              </div>
              
              <div className="text-center">
                <div className={`text-2xl font-bold ${healthStatus.database ? 'text-green-600' : 'text-red-600'}`}>
                  {healthStatus.database ? '✅' : '❌'}
                </div>
                <div className="text-sm text-gray-600">Database</div>
                <div className="font-medium">{healthStatus.database ? 'Connected' : 'Failed'}</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{healthStatus.registrySize}</div>
                <div className="text-sm text-gray-600">Registry Size</div>
                <div className="font-medium">Entity Types</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{healthStatus.cacheSize}</div>
                <div className="text-sm text-gray-600">Cache Size</div>
                <div className="font-medium">Cached Items</div>
              </div>
            </div>
          )}
        </div>

        {/* Performance Stats */}
        {stats && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">📊 Performance Statistics</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">${stats.totalApiCost.toFixed(3)}</div>
                <div className="text-sm text-gray-600">Total AI Cost</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.cacheHitRate.toFixed(1)}</div>
                <div className="text-sm text-gray-600">Cache Hit Rate</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{stats.cacheSize}</div>
                <div className="text-sm text-gray-600">Cache Size</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{stats.dailyBudgetUsed.toFixed(1)}%</div>
                <div className="text-sm text-gray-600">Budget Used</div>
              </div>
            </div>
            
            {stats.recommendations.length > 0 && (
              <div>
                <h3 className="font-medium mb-2">💡 Recommendations:</h3>
                <ul className="text-sm text-gray-600">
                  {stats.recommendations.map((rec: string, index: number) => (
                    <li key={index} className="flex items-center">
                      <span className="mr-2">•</span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Single Validation Test */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">🎯 Single Entity Validation</h2>
          
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <label htmlFor="entity-input" className="block text-sm font-medium text-gray-700 mb-1">
                Entity Type
              </label>
              <input
                id="entity-input"
                type="text"
                value={testInput}
                onChange={(e) => setTestInput(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter entity type (e.g., customers, menu items)"
                aria-label="Enter entity type to validate"
                title="Type the entity name you want to validate"
              />
            </div>
            
            <div className="w-32">
              <label htmlFor="industry-select" className="block text-sm font-medium text-gray-700 mb-1">
                Industry
              </label>
              <select
                id="industry-select"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Select industry context for validation"
                title="Choose the industry context for entity validation"
              >
                <option value="restaurant">Restaurant</option>
                <option value="retail">Retail</option>
                <option value="healthcare">Healthcare</option>
                <option value="manufacturing">Manufacturing</option>
              </select>
            </div>
            
            <div className="flex items-end">
              <button
                onClick={testSingleValidation}
                disabled={isLoading || !testInput.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                aria-label="Test single entity validation"
                title="Click to validate the entered entity type"
              >
                {isLoading ? 'Testing...' : 'Test'}
              </button>
            </div>
          </div>
          
          {singleResult && (
            <div className="bg-gray-50 rounded-md p-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                <div>
                  <div className="text-sm text-gray-600">Result</div>
                  <div className="font-medium">{singleResult.normalizedType}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Confidence</div>
                  <div className="font-medium">{(singleResult.confidence * 100).toFixed(1)}%</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Method</div>
                  <div className="font-medium capitalize">{singleResult.validationMethod}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Response Time</div>
                  <div className="font-medium">{(singleResult as any).responseTime}ms</div>
                </div>
              </div>
              
              <div className="mb-3">
                <div className="text-sm text-gray-600">Reasoning</div>
                <div className="text-sm">{singleResult.reasoning}</div>
              </div>
              
              {singleResult.suggestions.length > 0 && (
                <div>
                  <div className="text-sm text-gray-600">Suggestions</div>
                  <div className="text-sm">{singleResult.suggestions.join(', ')}</div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Batch Validation Test */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">🔄 Batch Validation Test</h2>
            <button
              onClick={testBatchValidation}
              disabled={isLoading}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400"
              aria-label="Run batch validation test"
              title="Click to test validation of multiple entity types at once"
            >
              {isLoading ? 'Testing...' : 'Run Batch Test'}
            </button>
          </div>
          
          {batchResults.length > 0 && (
            <div className="space-y-2">
              {batchResults.map((result, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div className="flex-1">
                    <span className="font-medium">{result.input}</span>
                    {result.success && result.result && (
                      <span className="ml-2 text-gray-600">
                        → {result.result.normalizedType} ({(result.result.confidence * 100).toFixed(1)}%)
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm">
                    <span>{result.responseTime}ms</span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {result.success ? '✅ Success' : '❌ Failed'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}