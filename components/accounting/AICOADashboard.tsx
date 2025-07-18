'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Activity, 
  TrendingUp, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  BarChart3,
  Zap,
  Brain,
  RefreshCw,
  Eye,
  Play,
  Pause,
  Users,
  Calendar,
  Target,
  PieChart,
  LineChart,
  Settings,
  Plus,
  Merge,
  Shield,
  AlertCircle,
  ThumbsUp,
  ThumbsDown,
  ArrowRight,
  FileText,
  Sparkles
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRestaurantManagement } from '@/hooks/useRestaurantManagement'

// Types
interface AIMetrics {
  total_accounts: number
  ai_generated_accounts: number
  active_accounts: number
  recently_used_accounts: number
  avg_ai_confidence: number
  max_hierarchy_depth: number
  account_types_count: number
  total_usage: number
  avg_usage_per_account: number
  total_transaction_volume: number
}

interface AISuggestion {
  id: string
  suggestion_type: string
  suggested_account_name: string
  suggested_account_type: string
  confidence_score: number
  reasoning: string
  auto_approve: boolean
  status: string
  created_at: string
  evidence: any
}

interface AIPerformance {
  automation_rate: number
  avg_confidence: number
  avg_accuracy: number
  suggestions_generated: number
  auto_applied: number
  manually_approved: number
  rejected: number
  avg_processing_time: number
}

interface ComplianceMetrics {
  gaap_compliance_rate: number
  ifrs_compliance_rate: number
  total_accounts: number
  needs_revalidation: number
  avg_days_since_validation: number
}

const AICOADashboard: React.FC = () => {
  const { restaurantData, loading: restaurantLoading } = useRestaurantManagement()
  const [loading, setLoading] = useState(false)
  const [aiMetrics, setAIMetrics] = useState<AIMetrics | null>(null)
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([])
  const [performance, setPerformance] = useState<AIPerformance | null>(null)
  const [compliance, setCompliance] = useState<ComplianceMetrics | null>(null)
  const [systemStatus, setSystemStatus] = useState<'operational' | 'warning' | 'error'>('operational')
  const [refreshing, setRefreshing] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    if (restaurantData?.organizationId) {
      loadDashboardData()
    }
  }, [restaurantData])

  const loadDashboardData = async () => {
    if (!restaurantData?.organizationId) return

    setLoading(true)
    try {
      // Load AI dashboard metrics
      const { data: metricsData, error: metricsError } = await supabase
        .rpc('get_ai_coa_dashboard_metrics', {
          p_organization_id: restaurantData.organizationId
        })

      if (metricsError) {
        console.error('Error loading AI metrics:', metricsError)
        setSystemStatus('error')
      } else {
        setAIMetrics(metricsData?.account_stats)
        setPerformance(metricsData?.ai_performance)
        setCompliance(metricsData?.compliance_stats)
        setSystemStatus('operational')
      }

      // Load AI suggestions
      const { data: suggestionsData, error: suggestionsError } = await supabase
        .from('ai_account_suggestions')
        .select('*')
        .eq('organization_id', restaurantData.organizationId)
        .order('created_at', { ascending: false })
        .limit(10)

      if (suggestionsError) {
        console.error('Error loading suggestions:', suggestionsError)
      } else {
        setSuggestions(suggestionsData || [])
      }

    } catch (error) {
      console.error('Error loading dashboard data:', error)
      setSystemStatus('error')
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadDashboardData()
    setRefreshing(false)
  }

  const processSuggestion = async (suggestionId: string, action: string) => {
    try {
      const { data, error } = await supabase
        .rpc('process_ai_suggestion', {
          p_suggestion_id: suggestionId,
          p_action: action
        })

      if (error) {
        console.error('Error processing suggestion:', error)
        return
      }

      console.log('Suggestion processed:', data)
      
      // Refresh suggestions after processing
      await loadDashboardData()
    } catch (error) {
      console.error('Error processing suggestion:', error)
    }
  }

  const generateSuggestions = async () => {
    if (!restaurantData?.organizationId) return

    try {
      const { data, error } = await supabase
        .rpc('ai_analyze_transaction_patterns', {
          p_organization_id: restaurantData.organizationId,
          p_days_back: 30
        })

      if (error) {
        console.error('Error generating suggestions:', error)
        return
      }

      // Insert new suggestions
      if (data && data.length > 0) {
        const newSuggestions = data.map((suggestion: any) => ({
          organization_id: restaurantData.organizationId,
          suggestion_type: 'NEW_ACCOUNT',
          suggested_account_name: suggestion.suggested_account_name,
          suggested_account_type: suggestion.suggested_account_type,
          confidence_score: suggestion.confidence_score,
          reasoning: suggestion.reasoning,
          auto_approve: suggestion.auto_approve,
          evidence: suggestion.supporting_evidence
        }))

        const { error: insertError } = await supabase
          .from('ai_account_suggestions')
          .insert(newSuggestions)

        if (insertError) {
          console.error('Error inserting suggestions:', insertError)
        } else {
          await loadDashboardData()
        }
      }
    } catch (error) {
      console.error('Error generating suggestions:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational': return 'bg-green-500'
      case 'warning': return 'bg-yellow-500'
      case 'error': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getSuggestionTypeIcon = (type: string) => {
    switch (type) {
      case 'NEW_ACCOUNT': return <Plus className="h-4 w-4" />
      case 'MERGE': return <Merge className="h-4 w-4" />
      case 'RECLASSIFY': return <RefreshCw className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <Badge variant="outline">Pending</Badge>
      case 'auto_applied': return <Badge variant="default" className="bg-green-500">Auto Applied</Badge>
      case 'approved': return <Badge variant="default" className="bg-blue-500">Approved</Badge>
      case 'rejected': return <Badge variant="destructive">Rejected</Badge>
      default: return <Badge variant="outline">{status}</Badge>
    }
  }

  if (restaurantLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!restaurantData?.organizationId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Alert className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Please set up your restaurant profile first to access the AI Chart of Accounts dashboard.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Chart of Accounts</h1>
          <p className="text-muted-foreground">
            Revolutionary AI-powered account management with minimal human intervention
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2">
            <div className={`h-3 w-3 rounded-full ${getStatusColor(systemStatus)}`}></div>
            <span className="text-sm font-medium capitalize">{systemStatus}</span>
          </div>
          <Button
            onClick={handleRefresh}
            disabled={refreshing}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Accounts</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{aiMetrics?.total_accounts || 0}</div>
            <p className="text-xs text-muted-foreground">
              {aiMetrics?.ai_generated_accounts || 0} AI-generated
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Confidence</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {aiMetrics?.avg_ai_confidence ? `${(aiMetrics.avg_ai_confidence * 100).toFixed(1)}%` : '0%'}
            </div>
            <p className="text-xs text-muted-foreground">
              Average AI confidence score
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Suggestions</CardTitle>
            <Sparkles className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {suggestions.filter(s => s.status === 'pending').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Awaiting review or auto-processing
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Automation Rate</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {performance?.automation_rate ? `${performance.automation_rate.toFixed(1)}%` : '0%'}
            </div>
            <p className="text-xs text-muted-foreground">
              Automated processing rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="dashboard" className="space-y-4">
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="suggestions">AI Suggestions</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          {/* System Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                System Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {aiMetrics?.active_accounts || 0}
                  </div>
                  <p className="text-sm text-muted-foreground">Active Accounts</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {aiMetrics?.recently_used_accounts || 0}
                  </div>
                  <p className="text-sm text-muted-foreground">Recently Used</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {aiMetrics?.max_hierarchy_depth || 0}
                  </div>
                  <p className="text-sm text-muted-foreground">Hierarchy Depth</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Brain className="h-5 w-5 mr-2" />
                AI Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Automation Rate</span>
                      <span className="text-sm text-muted-foreground">
                        {performance?.automation_rate ? `${performance.automation_rate.toFixed(1)}%` : '0%'}
                      </span>
                    </div>
                    <Progress value={performance?.automation_rate || 0} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Average Confidence</span>
                      <span className="text-sm text-muted-foreground">
                        {performance?.avg_confidence ? `${(performance.avg_confidence * 100).toFixed(1)}%` : '0%'}
                      </span>
                    </div>
                    <Progress value={(performance?.avg_confidence || 0) * 100} className="h-2" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-lg font-bold text-green-600">
                      {performance?.auto_applied || 0}
                    </div>
                    <p className="text-sm text-muted-foreground">Auto Applied</p>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-blue-600">
                      {performance?.manually_approved || 0}
                    </div>
                    <p className="text-sm text-muted-foreground">Manual Approval</p>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-red-600">
                      {performance?.rejected || 0}
                    </div>
                    <p className="text-sm text-muted-foreground">Rejected</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="suggestions" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">AI Suggestions</h3>
            <Button onClick={generateSuggestions} variant="outline" size="sm">
              <Sparkles className="h-4 w-4 mr-2" />
              Generate New Suggestions
            </Button>
          </div>

          {suggestions.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Brain className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-medium">No AI suggestions available</p>
                <p className="text-muted-foreground">
                  Click "Generate New Suggestions" to analyze your transaction patterns
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {suggestions.map((suggestion) => (
                <Card key={suggestion.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {getSuggestionTypeIcon(suggestion.suggestion_type)}
                        <CardTitle className="text-base">
                          {suggestion.suggested_account_name}
                        </CardTitle>
                        <Badge variant="outline">{suggestion.suggested_account_type}</Badge>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="bg-blue-50">
                          {(suggestion.confidence_score * 100).toFixed(1)}% confidence
                        </Badge>
                        {getStatusBadge(suggestion.status)}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      {suggestion.reasoning}
                    </p>
                    
                    {suggestion.evidence && (
                      <div className="bg-muted p-3 rounded-lg mb-4">
                        <p className="text-sm font-medium mb-2">Supporting Evidence:</p>
                        <div className="text-sm text-muted-foreground">
                          {suggestion.evidence.frequency && (
                            <p>• Transaction frequency: {suggestion.evidence.frequency}</p>
                          )}
                          {suggestion.evidence.avg_amount && (
                            <p>• Average amount: ${suggestion.evidence.avg_amount}</p>
                          )}
                          {suggestion.evidence.transaction_types && (
                            <p>• Transaction types: {suggestion.evidence.transaction_types.join(', ')}</p>
                          )}
                        </div>
                      </div>
                    )}

                    {suggestion.status === 'pending' && (
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => processSuggestion(suggestion.id, 'approve')}
                          size="sm"
                          variant="default"
                        >
                          <ThumbsUp className="h-4 w-4 mr-2" />
                          Approve
                        </Button>
                        <Button
                          onClick={() => processSuggestion(suggestion.id, 'reject')}
                          size="sm"
                          variant="outline"
                        >
                          <ThumbsDown className="h-4 w-4 mr-2" />
                          Reject
                        </Button>
                        {suggestion.auto_approve && (
                          <Button
                            onClick={() => processSuggestion(suggestion.id, 'auto_process')}
                            size="sm"
                            variant="outline"
                          >
                            <Zap className="h-4 w-4 mr-2" />
                            Auto Process
                          </Button>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Performance Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3">Processing Statistics</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Total Suggestions</span>
                      <span className="text-sm font-medium">
                        {performance?.suggestions_generated || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Average Processing Time</span>
                      <span className="text-sm font-medium">
                        {performance?.avg_processing_time ? 
                          `${(performance.avg_processing_time / 1000).toFixed(1)}s` : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Accuracy Rate</span>
                      <span className="text-sm font-medium">
                        {performance?.avg_accuracy ? 
                          `${(performance.avg_accuracy * 100).toFixed(1)}%` : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-3">System Performance</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Account Types</span>
                      <span className="text-sm font-medium">
                        {aiMetrics?.account_types_count || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Total Usage</span>
                      <span className="text-sm font-medium">
                        {aiMetrics?.total_usage || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Transaction Volume</span>
                      <span className="text-sm font-medium">
                        ${aiMetrics?.total_transaction_volume?.toLocaleString() || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Compliance Monitoring
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">GAAP Compliance</span>
                      <span className="text-sm text-muted-foreground">
                        {compliance?.gaap_compliance_rate?.toFixed(1) || 0}%
                      </span>
                    </div>
                    <Progress value={compliance?.gaap_compliance_rate || 0} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">IFRS Compliance</span>
                      <span className="text-sm text-muted-foreground">
                        {compliance?.ifrs_compliance_rate?.toFixed(1) || 0}%
                      </span>
                    </div>
                    <Progress value={compliance?.ifrs_compliance_rate || 0} className="h-2" />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-lg font-bold">
                      {compliance?.total_accounts || 0}
                    </div>
                    <p className="text-sm text-muted-foreground">Total Accounts</p>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-yellow-600">
                      {compliance?.needs_revalidation || 0}
                    </div>
                    <p className="text-sm text-muted-foreground">Needs Revalidation</p>
                  </div>
                  <div>
                    <div className="text-lg font-bold">
                      {compliance?.avg_days_since_validation?.toFixed(0) || 0}
                    </div>
                    <p className="text-sm text-muted-foreground">Avg Days Since Validation</p>
                  </div>
                </div>

                {compliance?.needs_revalidation && compliance.needs_revalidation > 0 && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      {compliance.needs_revalidation} accounts need revalidation for continued compliance.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default AICOADashboard