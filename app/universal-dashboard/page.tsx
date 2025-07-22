"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Activity, AlertTriangle, Database, TrendingUp, Zap, Brain, Shield, Users, CheckCircle, XCircle, AlertCircle, ChevronDown, ChevronRight, ExternalLink, Filter, Search } from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'

// HERA Universal Dashboard - Architecture Monitoring
export default function UniversalDashboardPage() {
  const [architectureMetrics, setArchitectureMetrics] = useState<any>(null)
  const [schemaMetrics, setSchemaMetrics] = useState<any>(null)
  const [qualityMetrics, setQualityMetrics] = useState<any>(null)
  const [orgMetrics, setOrgMetrics] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedTable, setSelectedTable] = useState<string | null>(null)
  
  // Drill-down state
  const [expandedValidations, setExpandedValidations] = useState(false)
  const [expandedFieldQuality, setExpandedFieldQuality] = useState(false)
  const [expandedOrganizations, setExpandedOrganizations] = useState(false)
  const [expandedSchemaIssues, setExpandedSchemaIssues] = useState(false)
  const [selectedOrganization, setSelectedOrganization] = useState<string | null>(null)
  const [severityFilter, setSeverityFilter] = useState<string>('all')
  const [searchFilter, setSearchFilter] = useState('')

  useEffect(() => {
    fetchAllMetrics()
    const interval = setInterval(fetchAllMetrics, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const fetchAllMetrics = async () => {
    try {
      const [archResponse, schemaResponse, qualityResponse, orgResponse] = await Promise.all([
        fetch('/api/dashboard/architecture'),
        fetch('/api/dashboard/schema'),
        fetch('/api/dashboard/quality'),
        fetch('/api/dashboard/organizations')
      ])
      
      // Check if all responses are ok
      if (!archResponse.ok || !schemaResponse.ok || !qualityResponse.ok || !orgResponse.ok) {
        throw new Error('One or more API endpoints failed')
      }
      
      const [archData, schemaData, qualityData, orgData] = await Promise.all([
        archResponse.json(),
        schemaResponse.json(),
        qualityResponse.json(),
        orgResponse.json()
      ])
      
      setArchitectureMetrics(archData)
      setSchemaMetrics(schemaData)
      setQualityMetrics(qualityData)
      setOrgMetrics(orgData)
      setLoading(false)
    } catch (error) {
      console.error('Failed to fetch dashboard metrics:', error)
      setError('Failed to load dashboard data. Please check API connectivity.')
      setLoading(false)
    }
  }


  const getHealthColor = (score: number) => {
    if (score >= 90) return 'text-green-500'
    if (score >= 70) return 'text-yellow-500'
    return 'text-red-500'
  }

  const getHealthBadge = (score: number) => {
    if (score >= 90) return <Badge className="bg-green-500">Healthy</Badge>
    if (score >= 70) return <Badge className="bg-yellow-500">Warning</Badge>
    return <Badge className="bg-red-500">Critical</Badge>
  }

  const coreTablesList = [
    { 
      name: 'core_organizations', 
      icon: Users, 
      description: 'Business entities & tenants',
      color: 'bg-blue-500'
    },
    { 
      name: 'core_entities', 
      icon: Database, 
      description: 'All business objects',
      color: 'bg-purple-500'
    },
    { 
      name: 'core_dynamic_data', 
      icon: Zap, 
      description: 'Dynamic fields & properties',
      color: 'bg-green-500'
    },
    { 
      name: 'core_relationships', 
      icon: Activity, 
      description: 'Entity connections',
      color: 'bg-orange-500'
    },
    { 
      name: 'universal_transactions', 
      icon: TrendingUp, 
      description: 'Business transactions',
      color: 'bg-pink-500'
    }
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-12 bg-gray-800 rounded w-1/3 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-800 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4 text-red-400">Dashboard Error</h1>
            <p className="text-gray-400 mb-8">{error}</p>
            <Button onClick={fetchAllMetrics} className="bg-blue-600 hover:bg-blue-700">
              Retry Loading
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            HERA Universal Control Center
          </h1>
          <p className="text-gray-400">Real-time monitoring of the 5-table universal architecture</p>
        </div>

        {/* System Health Overview */}
        <div className="mb-8">
          <Alert className="bg-gray-800 border-gray-700">
            <Shield className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>System Health Score: {architectureMetrics?.systemMetrics?.overallHealth || 95}%</span>
              {getHealthBadge(architectureMetrics?.systemMetrics?.overallHealth || 95)}
            </AlertDescription>
          </Alert>
        </div>

        {/* Core Tables Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {coreTablesList.map((table, index) => {
            const TableIcon = table.icon
            const tableHealth = architectureMetrics?.tableHealth?.[table.name] || {}
            
            return (
              <Card 
                key={table.name} 
                className="bg-gray-800 border-gray-700 hover:bg-gray-750 transition-all cursor-pointer transform hover:scale-105"
                onClick={() => setSelectedTable(table.name)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className={`p-2 rounded-lg ${table.color} bg-opacity-20`}>
                      <TableIcon className={`h-5 w-5 ${table.color.replace('bg-', 'text-')}`} />
                    </div>
                    <span className={`text-2xl font-bold ${getHealthColor(tableHealth.integrityScore || 100)}`}>
                      {tableHealth.integrityScore || 100}%
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <h3 className="font-semibold text-sm mb-1">{table.name}</h3>
                  <p className="text-xs text-gray-400 mb-3">{table.description}</p>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">Records</span>
                      <span className="font-mono">{tableHealth.recordCount?.toLocaleString() || 0}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">Growth (24h)</span>
                      <span className="text-green-400">+{tableHealth.growthRate || 0}</span>
                    </div>
                    {tableHealth.warningCount > 0 && (
                      <div className="flex items-center gap-1 text-xs text-yellow-400">
                        <AlertTriangle className="h-3 w-3" />
                        <span>{tableHealth.warningCount} warnings</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Detailed Tabs */}
        <Tabs defaultValue="architecture" className="space-y-4">
          <TabsList className="bg-gray-800">
            <TabsTrigger value="architecture">Architecture</TabsTrigger>
            <TabsTrigger value="schema">Schema Governance</TabsTrigger>
            <TabsTrigger value="quality">Data Quality</TabsTrigger>
            <TabsTrigger value="organizations">Organizations</TabsTrigger>
            <TabsTrigger value="ai">AI & Automation</TabsTrigger>
          </TabsList>

          <TabsContent value="architecture" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Real-time Metrics */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-blue-400" />
                    Real-time System Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-400">Total Organizations</span>
                      <span className="font-mono">{architectureMetrics?.systemMetrics?.totalOrganizations || 0}</span>
                    </div>
                    <Progress value={20} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-400">Total Entities</span>
                      <span className="font-mono">{architectureMetrics?.systemMetrics?.totalEntities || 0}</span>
                    </div>
                    <Progress value={45} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-400">Total Transactions</span>
                      <span className="font-mono">{architectureMetrics?.systemMetrics?.totalTransactions || 0}</span>
                    </div>
                    <Progress value={65} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              {/* Growth Patterns */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-400" />
                    Growth Patterns
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-gray-900 rounded-lg">
                    <p className="text-gray-500">Growth chart visualization</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Supabase Functions */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-purple-400" />
                  Supabase Functions & Validation Rules
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Functions List */}
                  <div>
                    <h4 className="text-sm font-semibold mb-3 text-gray-300">Database Functions</h4>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {architectureMetrics?.supabaseFunctions?.map((func: any, idx: number) => (
                        <div key={idx} className="bg-gray-900 p-3 rounded-lg">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-mono text-sm text-blue-400">{func.name}</span>
                            <Badge className={`text-xs ${
                              func.validation_status === 'valid' ? 'bg-green-600' :
                              func.validation_status === 'warning' ? 'bg-yellow-600' :
                              'bg-red-600'
                            }`}>
                              {func.validation_status}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-400">{func.description}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs">
                            <span className="text-gray-500">Type: {func.return_type}</span>
                            <span className="text-gray-500">Lang: {func.language}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Validation Rules */}
                  <div>
                    <h4 className="text-sm font-semibold mb-3 text-gray-300">Active Validation Rules</h4>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {architectureMetrics?.validationRules?.map((rule: any, idx: number) => (
                        <div key={idx} className="bg-gray-900 p-3 rounded-lg">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold text-sm">{rule.name}</span>
                            {rule.violations_count > 0 ? (
                              <Badge className="bg-red-600 text-xs">
                                {rule.violations_count} violations
                              </Badge>
                            ) : (
                              <Badge className="bg-green-600 text-xs">Clean</Badge>
                            )}
                          </div>
                          <p className="text-xs text-gray-400 mb-2">{rule.description}</p>
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            <span>Table: {rule.table}</span>
                            {rule.field && <span>Field: {rule.field}</span>}
                            <span>Type: {rule.rule_type}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="schema" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Naming Compliance Summary */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-sm">Naming Compliance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-400 mb-2">
                    {schemaMetrics?.namingCompliance?.complianceScore || 94}%
                  </div>
                  <p className="text-xs text-gray-400 mb-4">Fields following conventions</p>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span>Compliant Fields</span>
                      <span className="text-green-400">{schemaMetrics?.namingCompliance?.compliantFields || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Violations</span>
                      <span className="text-red-400">{schemaMetrics?.namingCompliance?.nonCompliantFields?.length || 0}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Entity Types Registry */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-sm">Entity Types Registry</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-400 mb-2">
                    {(schemaMetrics?.entityRegistry?.systemTypes?.length || 0) + (schemaMetrics?.entityRegistry?.userTypes?.length || 0)}
                  </div>
                  <p className="text-xs text-gray-400 mb-4">Total entity types</p>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span>System Types</span>
                      <span className="text-purple-400">{schemaMetrics?.entityRegistry?.systemTypes?.length || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>User Types</span>
                      <span className="text-blue-400">{schemaMetrics?.entityRegistry?.userTypes?.length || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Unused Types</span>
                      <span className="text-yellow-400">{schemaMetrics?.entityRegistry?.unusedTypes?.length || 0}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Duplication Risks */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-sm">Duplication Prevention</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-yellow-400 mb-2">
                    {schemaMetrics?.duplicationRisks?.length || 0}
                  </div>
                  <p className="text-xs text-gray-400 mb-4">Potential duplications</p>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span>High Risk</span>
                      <span className="text-red-400">
                        {schemaMetrics?.duplicationRisks?.filter((r: any) => r.riskLevel === 'high')?.length || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Medium Risk</span>
                      <span className="text-yellow-400">
                        {schemaMetrics?.duplicationRisks?.filter((r: any) => r.riskLevel === 'medium')?.length || 0}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Field Usage Analysis */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-sm">Field Usage Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    <h5 className="text-xs font-semibold text-gray-300">Most Used Fields</h5>
                    {schemaMetrics?.fieldAnalysis?.mostUsedFields?.slice(0, 8).map((field: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between text-xs">
                        <span className="font-mono text-blue-400">{field.fieldName}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400">{field.usageCount}</span>
                          {field.isStandard && <Badge className="bg-green-600 text-xs">Standard</Badge>}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Enhanced Naming Violations */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">Naming Violations</CardTitle>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setExpandedSchemaIssues(!expandedSchemaIssues)}
                      className="text-xs h-6 px-2"
                    >
                      {expandedSchemaIssues ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                      {expandedSchemaIssues ? 'Collapse' : 'Expand'}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Violation Type Summary */}
                  <div className="grid grid-cols-4 gap-2 mb-4 text-xs">
                    <div className="bg-red-900/30 p-2 rounded text-center">
                      <div className="font-semibold text-red-400">Reserved</div>
                      <div className="text-lg font-bold">
                        {schemaMetrics?.namingCompliance?.suggestedFixes?.filter((v: any) => v.violationType === 'reserved_word').length || 0}
                      </div>
                    </div>
                    <div className="bg-yellow-900/30 p-2 rounded text-center">
                      <div className="font-semibold text-yellow-400">Ambiguous</div>
                      <div className="text-lg font-bold">
                        {schemaMetrics?.namingCompliance?.suggestedFixes?.filter((v: any) => v.violationType === 'ambiguous').length || 0}
                      </div>
                    </div>
                    <div className="bg-orange-900/30 p-2 rounded text-center">
                      <div className="font-semibold text-orange-400">Non-Semantic</div>
                      <div className="text-lg font-bold">
                        {schemaMetrics?.namingCompliance?.suggestedFixes?.filter((v: any) => v.violationType === 'non-semantic').length || 0}
                      </div>
                    </div>
                    <div className="bg-purple-900/30 p-2 rounded text-center">
                      <div className="font-semibold text-purple-400">Inconsistent</div>
                      <div className="text-lg font-bold">
                        {schemaMetrics?.namingCompliance?.suggestedFixes?.filter((v: any) => v.violationType === 'inconsistent').length || 0}
                      </div>
                    </div>
                  </div>

                  <div className={`space-y-3 ${expandedSchemaIssues ? 'max-h-96' : 'max-h-64'} overflow-y-auto`}>
                    {schemaMetrics?.namingCompliance?.suggestedFixes
                      ?.slice(0, expandedSchemaIssues ? 30 : 8)
                      ?.map((violation: any, idx: number) => (
                      <div key={idx} className="p-3 bg-gray-900 rounded text-xs border-l-2 border-orange-500 hover:bg-gray-850 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-red-400">{violation.fieldName}</span>
                            <span className="text-gray-500">→</span>
                            <span className="font-mono text-green-400">{violation.suggestedName}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={`text-xs ${
                              violation.violationType === 'reserved_word' ? 'bg-red-600' :
                              violation.violationType === 'ambiguous' ? 'bg-yellow-600' :
                              violation.violationType === 'non-semantic' ? 'bg-orange-600' :
                              'bg-purple-600'
                            }`}>
                              {violation.violationType.replace('_', ' ')}
                            </Badge>
                            <Button size="sm" variant="outline" className="h-5 px-2 text-xs">
                              <ExternalLink size={10} className="mr-1" />
                              Rename
                            </Button>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-gray-400 mb-2">
                          <div>
                            <div className="font-semibold text-gray-300">Entity Type</div>
                            <div className="text-blue-400">{violation.entityType}</div>
                          </div>
                          <div>
                            <div className="font-semibold text-gray-300">Confidence</div>
                            <div className={`${
                              violation.confidence >= 0.8 ? 'text-green-400' :
                              violation.confidence >= 0.6 ? 'text-yellow-400' :
                              'text-red-400'
                            }`}>
                              {Math.round(violation.confidence * 100)}%
                            </div>
                          </div>
                        </div>
                        
                        {violation.examples && violation.examples.length > 0 && (
                          <div className="bg-blue-900/30 p-2 rounded">
                            <div className="text-blue-400 text-xs font-semibold mb-1">Better Examples:</div>
                            <div className="text-blue-300 text-xs">
                              {violation.examples.slice(0, 3).join(', ')}
                            </div>
                          </div>
                        )}
                        
                        <div className="mt-2 text-xs text-gray-500">
                          Organization: {violation.organizationId || 'Multiple'}
                        </div>
                      </div>
                    ))}
                    
                    {schemaMetrics?.namingCompliance?.suggestedFixes?.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <CheckCircle className="mx-auto mb-2" size={24} />
                        <div>Perfect naming compliance!</div>
                        <div className="text-xs">All field names follow conventions.</div>
                      </div>
                    )}
                  </div>
                  
                  {/* Show More Button */}
                  {schemaMetrics?.namingCompliance?.suggestedFixes?.length > 8 && !expandedSchemaIssues && (
                    <div className="mt-4 text-center">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setExpandedSchemaIssues(true)}
                        className="text-xs"
                      >
                        Show {schemaMetrics.namingCompliance.suggestedFixes.length - 8} More Violations
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Naming Patterns */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-sm">Naming Patterns Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <h5 className="text-xs font-semibold text-gray-300 mb-2">Case Styles</h5>
                    <div className="space-y-1 text-xs">
                      {Object.entries(schemaMetrics?.namingPatterns?.caseStyles || {}).map(([style, count]: [string, any]) => (
                        <div key={style} className="flex justify-between">
                          <span>{style}</span>
                          <span className="text-blue-400">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="text-xs font-semibold text-gray-300 mb-2">Common Prefixes</h5>
                    <div className="space-y-1 text-xs">
                      {schemaMetrics?.namingPatterns?.commonPrefixes?.slice(0, 5).map(([prefix, count]: [string, any]) => (
                        <div key={prefix} className="flex justify-between">
                          <span className="font-mono">{prefix}</span>
                          <span className="text-purple-400">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="text-xs font-semibold text-gray-300 mb-2">Common Suffixes</h5>
                    <div className="space-y-1 text-xs">
                      {schemaMetrics?.namingPatterns?.commonSuffixes?.slice(0, 5).map(([suffix, count]: [string, any]) => (
                        <div key={suffix} className="flex justify-between">
                          <span className="font-mono">{suffix}</span>
                          <span className="text-orange-400">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="text-xs font-semibold text-gray-300 mb-2">Reserved Word Violations</h5>
                    <div className="space-y-1 text-xs">
                      {schemaMetrics?.reservedWordViolations?.slice(0, 5).map((violation: any, idx: number) => (
                        <div key={idx} className="text-red-400">
                          {violation.fieldName}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="quality" className="space-y-4">
            {/* Quality Metrics Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-sm">Overall Quality</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-400 mb-2">
                    {qualityMetrics?.qualityMetrics?.overallQualityScore || 95}%
                  </div>
                  <p className="text-xs text-gray-400">System-wide quality score</p>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-sm">Data Completeness</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-400 mb-2">
                    {qualityMetrics?.qualityMetrics?.dataCompleteness || 98}%
                  </div>
                  <p className="text-xs text-gray-400">Required fields filled</p>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-sm">Data Accuracy</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-400 mb-2">
                    {qualityMetrics?.qualityMetrics?.dataAccuracy || 95}%
                  </div>
                  <p className="text-xs text-gray-400">Passes validation</p>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-sm">Data Consistency</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-400 mb-2">
                    {qualityMetrics?.qualityMetrics?.dataConsistency || 97}%
                  </div>
                  <p className="text-xs text-gray-400">No conflicts/duplicates</p>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-sm">Data Timeliness</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-400 mb-2">
                    {qualityMetrics?.qualityMetrics?.dataTimeliness || 92}%
                  </div>
                  <p className="text-xs text-gray-400">Current/up-to-date</p>
                </CardContent>
              </Card>
            </div>

            {/* Validation Results & Issues */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Validation Summary */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-sm">Validation Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-900 rounded">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-400" />
                        <span className="text-sm">Passed Validations</span>
                      </div>
                      <span className="font-bold text-green-400">
                        {qualityMetrics?.validationResults?.passedValidations || 0}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-gray-900 rounded">
                      <div className="flex items-center gap-2">
                        <XCircle className="h-4 w-4 text-red-400" />
                        <span className="text-sm">Failed Validations</span>
                      </div>
                      <span className="font-bold text-red-400">
                        {qualityMetrics?.validationResults?.failedValidations?.length || 0}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-gray-900 rounded">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-yellow-400" />
                        <span className="text-sm">Warnings</span>
                      </div>
                      <span className="font-bold text-yellow-400">
                        {qualityMetrics?.validationResults?.warningValidations?.length || 0}
                      </span>
                    </div>
                    
                    <div className="mt-4">
                      <div className="flex justify-between text-xs mb-1">
                        <span>Validation Coverage</span>
                        <span>{qualityMetrics?.validationResults?.validationCoverage || 0}%</span>
                      </div>
                      <Progress value={qualityMetrics?.validationResults?.validationCoverage || 0} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Data Integrity Issues */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-sm">Data Integrity Issues</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-900 rounded">
                      <span className="text-sm">Orphaned Records</span>
                      <Badge className="bg-red-600">
                        {qualityMetrics?.integrityChecks?.orphanedRecords?.length || 0}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-gray-900 rounded">
                      <span className="text-sm">Broken References</span>
                      <Badge className="bg-orange-600">
                        {qualityMetrics?.integrityChecks?.brokenReferences?.length || 0}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-gray-900 rounded">
                      <span className="text-sm">Duplicate Entities</span>
                      <Badge className="bg-yellow-600">
                        {qualityMetrics?.integrityChecks?.duplicateEntities?.length || 0}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-gray-900 rounded">
                      <span className="text-sm">Inconsistent Data</span>
                      <Badge className="bg-purple-600">
                        {qualityMetrics?.integrityChecks?.inconsistentData?.length || 0}
                      </Badge>
                    </div>
                    
                    <div className="mt-4 p-3 bg-green-900 rounded">
                      <div className="text-sm font-semibold text-green-300">Integrity Score</div>
                      <div className="text-2xl font-bold text-green-400">
                        {qualityMetrics?.integrityChecks?.integrityScore || 100}%
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Issues with Drill-Down */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Enhanced Validation Failures */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">Validation Failures</CardTitle>
                    <div className="flex items-center gap-2">
                      {/* Severity Filter */}
                      <select 
                        value={severityFilter}
                        onChange={(e) => setSeverityFilter(e.target.value)}
                        className="bg-gray-700 text-xs px-2 py-1 rounded border border-gray-600"
                      >
                        <option value="all">All Severity</option>
                        <option value="critical">Critical</option>
                        <option value="major">Major</option>
                        <option value="minor">Minor</option>
                      </select>
                      
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setExpandedValidations(!expandedValidations)}
                        className="text-xs h-6 px-2"
                      >
                        {expandedValidations ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                        {expandedValidations ? 'Collapse' : 'Expand'}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Quick Summary */}
                  <div className="grid grid-cols-3 gap-2 mb-4 text-xs">
                    <div className="bg-red-900/30 p-2 rounded">
                      <div className="font-semibold text-red-400">Critical</div>
                      <div className="text-xl font-bold">
                        {qualityMetrics?.validationResults?.failedValidations?.filter((f: any) => f.severity === 'critical').length || 0}
                      </div>
                    </div>
                    <div className="bg-orange-900/30 p-2 rounded">
                      <div className="font-semibold text-orange-400">Major</div>
                      <div className="text-xl font-bold">
                        {qualityMetrics?.validationResults?.failedValidations?.filter((f: any) => f.severity === 'major').length || 0}
                      </div>
                    </div>
                    <div className="bg-yellow-900/30 p-2 rounded">
                      <div className="font-semibold text-yellow-400">Minor</div>
                      <div className="text-xl font-bold">
                        {qualityMetrics?.validationResults?.failedValidations?.filter((f: any) => f.severity === 'minor').length || 0}
                      </div>
                    </div>
                  </div>

                  {/* Detailed Issues List */}
                  <div className={`space-y-3 ${expandedValidations ? 'max-h-96' : 'max-h-64'} overflow-y-auto`}>
                    {qualityMetrics?.validationResults?.failedValidations
                      ?.filter((failure: any) => severityFilter === 'all' || failure.severity === severityFilter)
                      ?.slice(0, expandedValidations ? 50 : 8)
                      ?.map((failure: any, idx: number) => (
                      <div key={idx} className="p-3 bg-gray-900 rounded text-xs border-l-2 border-red-500 hover:bg-gray-850 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-red-400">{failure.fieldName}</span>
                            <span className="text-gray-500">in</span>
                            <span className="text-blue-400">{failure.entityType}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={`text-xs ${
                              failure.severity === 'critical' ? 'bg-red-600' :
                              failure.severity === 'major' ? 'bg-orange-600' :
                              'bg-yellow-600'
                            }`}>
                              {failure.severity}
                            </Badge>
                            <Button size="sm" variant="outline" className="h-5 px-2 text-xs">
                              <ExternalLink size={10} className="mr-1" />
                              Fix
                            </Button>
                          </div>
                        </div>
                        
                        <div className="text-gray-400 mb-2 leading-relaxed">{failure.errorMessage}</div>
                        
                        <div className="bg-green-900/30 p-2 rounded mb-2">
                          <div className="text-green-400 text-xs font-semibold mb-1">Suggested Fix:</div>
                          <div className="text-green-300 text-xs">{failure.suggestedFix}</div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-gray-500 text-xs">
                          <div>
                            <span className="font-semibold">Entity ID:</span> 
                            <br />
                            <code className="bg-gray-800 px-1 rounded text-xs">{failure.entityId}</code>
                          </div>
                          <div>
                            <span className="font-semibold">Validation Type:</span> 
                            <br />
                            <span className="capitalize">{failure.validationType}</span>
                          </div>
                        </div>
                        
                        {failure.organizationId && (
                          <div className="mt-2 text-gray-500 text-xs">
                            <span className="font-semibold">Organization:</span> {failure.organizationId}
                          </div>
                        )}
                        
                        <div className="mt-2 text-gray-600 text-xs">
                          Detected: {new Date(failure.occurredAt).toLocaleString()}
                        </div>
                      </div>
                    ))}
                    
                    {qualityMetrics?.validationResults?.failedValidations?.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <CheckCircle className="mx-auto mb-2" size={24} />
                        <div>No validation failures found!</div>
                        <div className="text-xs">All data validation checks are passing.</div>
                      </div>
                    )}
                  </div>
                  
                  {/* Show More Button */}
                  {qualityMetrics?.validationResults?.failedValidations?.length > 8 && !expandedValidations && (
                    <div className="mt-4 text-center">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setExpandedValidations(true)}
                        className="text-xs"
                      >
                        Show {qualityMetrics.validationResults.failedValidations.length - 8} More Issues
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Enhanced Field Quality Analysis */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">Field Quality Analysis</CardTitle>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setExpandedFieldQuality(!expandedFieldQuality)}
                      className="text-xs h-6 px-2"
                    >
                      {expandedFieldQuality ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                      {expandedFieldQuality ? 'Collapse' : 'Expand'}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Quality Overview */}
                  <div className="grid grid-cols-3 gap-2 mb-4 text-xs">
                    <div className="bg-red-900/30 p-2 rounded">
                      <div className="font-semibold text-red-400">Poor Quality</div>
                      <div className="text-xl font-bold">
                        {qualityMetrics?.fieldQuality?.filter((f: any) => f.qualityScore < 60).length || 0}
                      </div>
                      <div className="text-gray-400 text-xs">&lt; 60% score</div>
                    </div>
                    <div className="bg-yellow-900/30 p-2 rounded">
                      <div className="font-semibold text-yellow-400">Needs Work</div>
                      <div className="text-xl font-bold">
                        {qualityMetrics?.fieldQuality?.filter((f: any) => f.qualityScore >= 60 && f.qualityScore < 80).length || 0}
                      </div>
                      <div className="text-gray-400 text-xs">60-80% score</div>
                    </div>
                    <div className="bg-green-900/30 p-2 rounded">
                      <div className="font-semibold text-green-400">Good Quality</div>
                      <div className="text-xl font-bold">
                        {qualityMetrics?.fieldQuality?.filter((f: any) => f.qualityScore >= 80).length || 0}
                      </div>
                      <div className="text-gray-400 text-xs">&gt;= 80% score</div>
                    </div>
                  </div>

                  <div className={`space-y-3 ${expandedFieldQuality ? 'max-h-96' : 'max-h-64'} overflow-y-auto`}>
                    <h5 className="text-xs font-semibold text-gray-300">Fields Needing Attention</h5>
                    {qualityMetrics?.fieldQuality
                      ?.slice(0, expandedFieldQuality ? 20 : 8)
                      ?.map((field: any, idx: number) => (
                      <div key={idx} className="p-3 bg-gray-900 rounded text-xs border-l-2 border-yellow-500 hover:bg-gray-850 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-blue-400">{field.fieldName}</span>
                            <Badge className={`text-xs ${
                              field.qualityScore >= 80 ? 'bg-green-600' :
                              field.qualityScore >= 60 ? 'bg-yellow-600' :
                              'bg-red-600'
                            }`}>
                              {field.qualityScore}% Quality
                            </Badge>
                          </div>
                          <Button size="sm" variant="outline" className="h-5 px-2 text-xs">
                            <ExternalLink size={10} className="mr-1" />
                            Clean
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-4 gap-3 text-gray-400 mb-2">
                          <div>
                            <div className="font-semibold text-gray-300">Total Records</div>
                            <div className="text-white">{field.totalRecords}</div>
                          </div>
                          <div>
                            <div className="font-semibold text-gray-300">Null Values</div>
                            <div className={`${field.nullPercentage > 20 ? 'text-red-400' : 'text-green-400'}`}>
                              {field.nullCount} ({field.nullPercentage}%)
                            </div>
                          </div>
                          <div>
                            <div className="font-semibold text-gray-300">Data Type</div>
                            <div className="text-blue-400 capitalize">{field.fieldType}</div>
                          </div>
                          <div>
                            <div className="font-semibold text-gray-300">Unique Values</div>
                            <div className="text-purple-400">{field.uniqueValues || 'N/A'}</div>
                          </div>
                        </div>
                        
                        {/* Quality Issues and Recommendations */}
                        <div className="bg-blue-900/30 p-2 rounded">
                          <div className="text-blue-400 text-xs font-semibold mb-1">Quality Issues:</div>
                          <div className="text-blue-300 text-xs">
                            {field.nullPercentage > 50 && '• High null rate (>50%) - consider making optional or adding defaults'}
                            {field.nullPercentage > 20 && field.nullPercentage <= 50 && '• Moderate null rate - review data collection process'}
                            {field.nullPercentage <= 20 && '• Good data completeness'}
                          </div>
                          {field.qualityScore < 60 && (
                            <div className="text-orange-300 text-xs mt-1">
                              • Priority: Immediate attention required for data quality
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    {qualityMetrics?.fieldQuality?.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <CheckCircle className="mx-auto mb-2" size={24} />
                        <div>All fields have good quality!</div>
                        <div className="text-xs">No fields require immediate attention.</div>
                      </div>
                    )}
                  </div>
                  
                  {/* Show More Button */}
                  {qualityMetrics?.fieldQuality?.length > 8 && !expandedFieldQuality && (
                    <div className="mt-4 text-center">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setExpandedFieldQuality(true)}
                        className="text-xs"
                      >
                        Show {qualityMetrics.fieldQuality.length - 8} More Fields
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Data Anomalies */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-sm">Data Anomalies & Outliers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {qualityMetrics?.anomalies?.map((anomaly: any, idx: number) => (
                    <div key={idx} className="p-3 bg-gray-900 rounded">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold">{anomaly.type}</span>
                        <Badge className={`text-xs ${
                          anomaly.severity === 'critical' ? 'bg-red-600' :
                          anomaly.severity === 'warning' ? 'bg-yellow-600' :
                          'bg-blue-600'
                        }`}>
                          {anomaly.severity}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-400 mb-2">{anomaly.description}</p>
                      {anomaly.expectedRange && (
                        <p className="text-xs text-gray-500 mb-2">
                          Expected: {anomaly.expectedRange}
                        </p>
                      )}
                      <p className="text-xs text-green-400">{anomaly.suggestedAction}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="organizations" className="space-y-4">
            {/* Organizations Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Users className="h-8 w-8 text-blue-400" />
                    <div>
                      <div className="text-sm font-semibold text-gray-300">Total Organizations</div>
                      <div className="text-2xl font-bold">{orgMetrics?.organizations?.length || 0}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Activity className="h-8 w-8 text-green-400" />
                    <div>
                      <div className="text-sm font-semibold text-gray-300">Active Organizations</div>
                      <div className="text-2xl font-bold text-green-400">
                        {orgMetrics?.healthMetrics?.activeOrganizations || 0}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-8 w-8 text-yellow-400" />
                    <div>
                      <div className="text-sm font-semibold text-gray-300">Compliance Issues</div>
                      <div className="text-2xl font-bold text-yellow-400">
                        {orgMetrics?.complianceIssues?.totalIssues || 0}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Database className="h-8 w-8 text-purple-400" />
                    <div>
                      <div className="text-sm font-semibold text-gray-300">Total Records</div>
                      <div className="text-2xl font-bold text-purple-400">
                        {orgMetrics?.resourceUsage?.totalRecords?.toLocaleString() || 0}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Organization Drill-Down */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-400" />
                    Organizations Detail View
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    {/* Organization Filter */}
                    <select 
                      value={selectedOrganization || 'all'}
                      onChange={(e) => setSelectedOrganization(e.target.value === 'all' ? null : e.target.value)}
                      className="bg-gray-700 text-xs px-2 py-1 rounded border border-gray-600"
                    >
                      <option value="all">All Organizations</option>
                      {orgMetrics?.organizations?.slice(0, 10).map((org: any) => (
                        <option key={org.id} value={org.id}>
                          {org.name}
                        </option>
                      ))}
                    </select>
                    
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setExpandedOrganizations(!expandedOrganizations)}
                      className="text-xs h-6 px-2"
                    >
                      {expandedOrganizations ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                      {expandedOrganizations ? 'Collapse' : 'Expand'}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className={`space-y-4 ${expandedOrganizations ? 'max-h-96' : 'max-h-64'} overflow-y-auto`}>
                  {orgMetrics?.organizations
                    ?.filter((org: any) => !selectedOrganization || org.id === selectedOrganization)
                    ?.slice(0, expandedOrganizations ? 50 : 10)
                    ?.map((org: any, idx: number) => (
                    <div key={idx} className="p-4 bg-gray-900 rounded border-l-4 border-blue-500 hover:bg-gray-850 transition-colors">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div>
                            <h4 className="font-semibold text-white">{org.name}</h4>
                            <div className="text-xs text-gray-400 capitalize">{org.industry} • Created {new Date(org.createdAt).toLocaleDateString()}</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Badge className={`${
                            org.complianceStatus === 'compliant' ? 'bg-green-600' :
                            org.complianceStatus === 'warning' ? 'bg-yellow-600' :
                            'bg-red-600'
                          }`}>
                            {org.complianceStatus}
                          </Badge>
                          
                          <Badge className={`${
                            org.healthScore >= 80 ? 'bg-green-600' :
                            org.healthScore >= 60 ? 'bg-yellow-600' :
                            'bg-red-600'
                          }`}>
                            {org.healthScore}% Health
                          </Badge>
                          
                          <Button size="sm" variant="outline" className="h-6 px-2 text-xs">
                            <ExternalLink size={10} className="mr-1" />
                            Manage
                          </Button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                        <div className="bg-gray-800 p-2 rounded">
                          <div className="text-xs text-gray-400">Entities</div>
                          <div className="text-lg font-bold text-blue-400">{org.entityCount}</div>
                        </div>
                        <div className="bg-gray-800 p-2 rounded">
                          <div className="text-xs text-gray-400">Transactions</div>
                          <div className="text-lg font-bold text-green-400">{org.transactionCount}</div>
                        </div>
                        <div className="bg-gray-800 p-2 rounded">
                          <div className="text-xs text-gray-400">Users</div>
                          <div className="text-lg font-bold text-purple-400">{org.userCount}</div>
                        </div>
                        <div className="bg-gray-800 p-2 rounded">
                          <div className="text-xs text-gray-400">Storage</div>
                          <div className="text-lg font-bold text-yellow-400">{org.storageUsed}MB</div>
                        </div>
                      </div>
                      
                      {/* Features and Activity */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <div className="text-xs font-semibold text-gray-300 mb-1">Active Features</div>
                          <div className="flex flex-wrap gap-1">
                            {org.features?.map((feature: string, fIdx: number) => (
                              <Badge key={fIdx} variant="outline" className="text-xs">
                                {feature}
                              </Badge>
                            ))}
                            {org.features?.length === 0 && (
                              <span className="text-xs text-gray-500">No active features</span>
                            )}
                          </div>
                        </div>
                        
                        <div>
                          <div className="text-xs font-semibold text-gray-300 mb-1">Last Activity</div>
                          <div className="text-xs text-gray-400">
                            {new Date(org.lastActivity).toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            API Calls Today: {org.apiCallsToday?.toLocaleString()}
                          </div>
                        </div>
                      </div>
                      
                      {/* Health Issues */}
                      {org.healthScore < 80 && (
                        <div className="mt-3 p-2 bg-yellow-900/30 rounded border border-yellow-700">
                          <div className="text-xs font-semibold text-yellow-400 mb-1">⚠️ Health Issues Detected</div>
                          <div className="text-xs text-yellow-300">
                            {org.entityCount === 0 && '• No entities created yet'}
                            {org.transactionCount === 0 && '• No transactions recorded'}
                            {org.userCount === 0 && '• No users assigned'}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {orgMetrics?.organizations?.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Users className="mx-auto mb-2" size={24} />
                      <div>No organizations found</div>
                    </div>
                  )}
                </div>
                
                {/* Show More Button */}
                {orgMetrics?.organizations?.length > 10 && !expandedOrganizations && (
                  <div className="mt-4 text-center">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setExpandedOrganizations(true)}
                      className="text-xs"
                    >
                      Show {orgMetrics.organizations.length - 10} More Organizations
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Compliance Issues Drill-Down */}
            {orgMetrics?.complianceIssues?.issues?.length > 0 && (
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-400" />
                    Compliance Issues Requiring Attention
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {orgMetrics.complianceIssues.issues.slice(0, 10).map((issue: any, idx: number) => (
                      <div key={idx} className="p-3 bg-gray-900 rounded border-l-2 border-yellow-500">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-yellow-400">{issue.issueType.replace(/_/g, ' ')}</span>
                            <Badge className={`text-xs ${
                              issue.severity === 'critical' ? 'bg-red-600' :
                              issue.severity === 'high' ? 'bg-orange-600' :
                              'bg-yellow-600'
                            }`}>
                              {issue.severity}
                            </Badge>
                          </div>
                          <Button size="sm" variant="outline" className="h-5 px-2 text-xs">
                            <ExternalLink size={10} className="mr-1" />
                            Fix
                          </Button>
                        </div>
                        
                        <div className="text-sm text-gray-300 mb-2">{issue.description}</div>
                        
                        <div className="bg-green-900/30 p-2 rounded">
                          <div className="text-green-400 text-xs font-semibold mb-1">Suggested Fix:</div>
                          <div className="text-green-300 text-xs">{issue.suggestedFix}</div>
                        </div>
                        
                        <div className="mt-2 text-xs text-gray-500">
                          Organization: {issue.organizationId}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="ai" className="space-y-4">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-400" />
                  AI & Automation Dashboard
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-900 p-4 rounded-lg">
                    <h4 className="text-sm font-semibold mb-2">Schema Generation Model</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span>Accuracy</span>
                        <span className="text-green-400">96.2%</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span>Schemas Generated</span>
                        <span>1,247</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-900 p-4 rounded-lg">
                    <h4 className="text-sm font-semibold mb-2">Automation Status</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span>Automated Tasks</span>
                        <span className="text-blue-400">89%</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span>Time Saved</span>
                        <span>247 hrs/week</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}