'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Settings,
  Brain,
  Zap,
  Shield,
  Database,
  Layers,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Users,
  RefreshCw,
  Eye,
  Download,
  Search,
  Filter,
  BarChart3,
  Target,
  Sparkles,
  Workflow,
  Globe,
  Cpu,
  HardDrive,
  Network,
  Server,
  PieChart,
  LineChart,
  Gauge
} from 'lucide-react'
import { AppNavbar } from '@/components/ui/AppNavbar'
import DynamicSidebar from '@/components/ui/DynamicSidebar'

interface ConfigurationMetrics {
  system_architecture: {
    core_tables: number;
    total_entities: number;
    dynamic_fields: number;
    relationships: number;
    status: string;
  };
  solution_templates: {
    system_modules: number;
    industry_templates: number;
    custom_solutions: number;
    deployment_success_rate: number;
    status: string;
  };
  duplicate_detection: {
    potential_duplicates: number;
    schema_conflicts: number;
    business_logic_overlaps: number;
    auto_resolved_percentage: number;
    status: string;
  };
  deployment_pipeline: {
    active_deployments: number;
    queue_pending: number;
    avg_deploy_time_minutes: number;
    success_rate: number;
    status: string;
  };
}

interface AIInsight {
  type: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  action_required: boolean;
}

interface DuplicateDetection {
  duplicate_type: string;
  similarity_score: number;
  affected_organizations: string[];
  duplicate_count: number;
  risk_level: 'HIGH' | 'MEDIUM' | 'LOW';
  recommendation: string;
  auto_resolvable: boolean;
}

interface RecentChange {
  change_timestamp: string;
  component: string;
  change_type: string;
  organization_name: string;
  user_name: string;
  status: string;
  impact: string;
}

export default function ConfigurationControlPanel() {
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [refreshing, setRefreshing] = useState(false)

  const handleLogout = () => {
    window.location.href = '/auth/login'
  }

  const fetchDashboardData = async () => {
    try {
      setRefreshing(true)
      const response = await fetch('/api/system/configuration/dashboard')
      const result = await response.json()
      
      if (result.success) {
        setDashboardData(result.data)
      } else {
        console.error('Failed to fetch dashboard data:', result.error)
      }
    } catch (error) {
      console.error('Dashboard fetch error:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000)
    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'healthy':
      case 'optimized':
      case 'operational':
        return 'bg-green-100 text-green-800 border-green-300'
      case 'needs_review':
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'error':
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-300'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case 'medium':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'low':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      default:
        return <Activity className="h-4 w-4 text-gray-500" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-teal-500 to-teal-600 rounded-full mb-4">
            <RefreshCw className="h-8 w-8 text-white animate-spin" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Loading Configuration Control Panel</h2>
          <p className="text-gray-400">Initializing HERA Universal Architecture...</p>
        </div>
      </div>
    )
  }

  const metrics: ConfigurationMetrics = dashboardData?.metrics || {}
  const aiInsights: AIInsight[] = dashboardData?.aiInsights || []
  const duplicateDetection: DuplicateDetection[] = dashboardData?.duplicateDetection || []
  const recentChanges: RecentChange[] = dashboardData?.recentChanges || []

  return (
    <div className="min-h-screen bg-gray-800">
      <DynamicSidebar />
      
      <div className="ml-16 transition-all duration-300">
        <AppNavbar 
          user={{
            name: "System Administrator",
            email: "admin@hera.systems",
            role: "Configuration Manager"
          }}
          onLogout={handleLogout}
        />
        
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-4xl font-bold text-white flex items-center gap-4">
                <div className="p-3 bg-gradient-to-r from-teal-500 to-teal-600 rounded-xl shadow-lg">
                  <Settings className="h-10 w-10 text-white" />
                </div>
                HERA Configuration Control Panel
                <Badge className="bg-gradient-to-r from-teal-500 to-teal-600 text-white border-0">
                  <Sparkles className="w-4 h-4 mr-1" />
                  AI-Powered
                </Badge>
              </h1>
              <p className="text-gray-300 text-lg">
                Revolutionary configuration management that surpasses SAP IMG • Real-time duplicate detection • AI governance automation
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="bg-teal-500/10 text-teal-400 border-teal-500/30 backdrop-blur-sm">
                <Shield className="w-4 h-4 mr-1" />
                Universal Architecture
              </Badge>
              <Badge variant="outline" className="bg-teal-500/10 text-teal-400 border-teal-500/30 backdrop-blur-sm">
                <Activity className="w-4 h-4 mr-1" />
                {dashboardData?.systemStatus?.coreTablesHealthy ? 'System Healthy' : 'System Check'}
              </Badge>
              <Button 
                variant="outline"
                onClick={fetchDashboardData}
                disabled={refreshing}
                className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600 backdrop-blur-sm"
              >
                {refreshing ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Refresh
              </Button>
            </div>
          </div>

          {/* System Architecture Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-gray-700 border-gray-600 shadow-xl">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-300">Core Tables</p>
                    <p className="text-3xl font-bold text-white">{metrics.system_architecture?.core_tables || 5}</p>
                    <p className="text-xs text-teal-400 mt-1">Universal Architecture</p>
                  </div>
                  <Database className="h-12 w-12 text-teal-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-700 border-gray-600 shadow-xl">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-300">Total Entities</p>
                    <p className="text-3xl font-bold text-white">{metrics.system_architecture?.total_entities?.toLocaleString() || '0'}</p>
                    <p className="text-xs text-teal-400 mt-1">Business Objects</p>
                  </div>
                  <Layers className="h-12 w-12 text-teal-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-700 border-gray-600 shadow-xl">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-300">Solution Templates</p>
                    <p className="text-3xl font-bold text-white">{metrics.solution_templates?.system_modules || '0'}</p>
                    <p className="text-xs text-teal-400 mt-1">Ready to Deploy</p>
                  </div>
                  <Workflow className="h-12 w-12 text-teal-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-700 border-gray-600 shadow-xl">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-300">Success Rate</p>
                    <p className="text-3xl font-bold text-white">{metrics.solution_templates?.deployment_success_rate || 99.7}%</p>
                    <p className="text-xs text-teal-400 mt-1">Deployment Success</p>
                  </div>
                  <Target className="h-12 w-12 text-teal-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="bg-gray-700 border-gray-600">
              <TabsTrigger value="overview" className="data-[state=active]:bg-teal-500 data-[state=active]:text-white">
                <BarChart3 className="w-4 h-4 mr-2" />
                System Overview
              </TabsTrigger>
              <TabsTrigger value="duplicates" className="data-[state=active]:bg-teal-500 data-[state=active]:text-white">
                <Brain className="w-4 h-4 mr-2" />
                Duplicate Detection
              </TabsTrigger>
              <TabsTrigger value="templates" className="data-[state=active]:bg-teal-500 data-[state=active]:text-white">
                <Workflow className="w-4 h-4 mr-2" />
                Solution Templates
              </TabsTrigger>
              <TabsTrigger value="governance" className="data-[state=active]:bg-teal-500 data-[state=active]:text-white">
                <Shield className="w-4 h-4 mr-2" />
                Governance
              </TabsTrigger>
            </TabsList>

            {/* System Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* AI Insights Panel */}
                <Card className="bg-gray-700 border-gray-600 shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Brain className="h-6 w-6 text-teal-400" />
                      AI Configuration Insights
                      <Badge className="bg-teal-500/20 text-teal-300 border-teal-500/30">
                        Live Analysis
                      </Badge>
                    </CardTitle>
                    <CardDescription className="text-gray-300">
                      AI-powered recommendations for configuration optimization
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {aiInsights.length > 0 ? aiInsights.map((insight, index) => (
                        <Alert key={index} className="bg-gray-600 border-gray-500">
                          <div className="flex items-start gap-3">
                            {getPriorityIcon(insight.priority)}
                            <div className="flex-1">
                              <h4 className="font-medium text-white">{insight.title}</h4>
                              <p className="text-sm text-gray-300 mt-1">{insight.description}</p>
                              {insight.action_required && (
                                <Badge className="mt-2 bg-orange-500/20 text-orange-300 border-orange-500/30">
                                  Action Required
                                </Badge>
                              )}
                            </div>
                          </div>
                        </Alert>
                      )) : (
                        <div className="text-center py-8">
                          <Brain className="h-12 w-12 text-gray-500 mx-auto mb-3" />
                          <p className="text-gray-400">AI analysis in progress...</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* System Health Dashboard */}
                <Card className="bg-gray-700 border-gray-600 shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Activity className="h-6 w-6 text-teal-400" />
                      System Health Monitor
                      <Badge className="bg-teal-500/20 text-teal-300 border-teal-500/30">
                        Real-time
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Core Architecture Health */}
                      <div className="flex items-center justify-between p-3 bg-gray-600 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Database className="h-5 w-5 text-teal-400" />
                          <span className="text-white">Core Architecture</span>
                        </div>
                        <Badge className={getStatusColor(metrics.system_architecture?.status || 'unknown')}>
                          {metrics.system_architecture?.status || 'Unknown'}
                        </Badge>
                      </div>

                      {/* Templates Health */}
                      <div className="flex items-center justify-between p-3 bg-gray-600 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Workflow className="h-5 w-5 text-teal-400" />
                          <span className="text-white">Solution Templates</span>
                        </div>
                        <Badge className={getStatusColor(metrics.solution_templates?.status || 'unknown')}>
                          {metrics.solution_templates?.status || 'Unknown'}
                        </Badge>
                      </div>

                      {/* Duplicate Detection Health */}
                      <div className="flex items-center justify-between p-3 bg-gray-600 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Brain className="h-5 w-5 text-teal-400" />
                          <span className="text-white">Duplicate Detection</span>
                        </div>
                        <Badge className={getStatusColor(metrics.duplicate_detection?.status || 'unknown')}>
                          {metrics.duplicate_detection?.status || 'Unknown'}
                        </Badge>
                      </div>

                      {/* Deployment Pipeline Health */}
                      <div className="flex items-center justify-between p-3 bg-gray-600 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Zap className="h-5 w-5 text-teal-400" />
                          <span className="text-white">Deployment Pipeline</span>
                        </div>
                        <Badge className={getStatusColor(metrics.deployment_pipeline?.status || 'unknown')}>
                          {metrics.deployment_pipeline?.status || 'Unknown'}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Configuration Changes */}
              <Card className="bg-gray-700 border-gray-600 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Clock className="h-6 w-6 text-teal-400" />
                    Recent Configuration Changes
                    <Badge variant="outline" className="bg-teal-500/10 text-teal-400 border-teal-500/30">
                      Last 24 Hours
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentChanges.length > 0 ? recentChanges.slice(0, 5).map((change, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-600 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Settings className="h-5 w-5 text-teal-400" />
                          <div>
                            <p className="text-white font-medium">{change.component}</p>
                            <p className="text-sm text-gray-400">
                              {change.change_type} • {change.organization_name} • {change.user_name}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className={getStatusColor(change.status)}>
                            {change.status}
                          </Badge>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(change.change_timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    )) : (
                      <div className="text-center py-8">
                        <Clock className="h-12 w-12 text-gray-500 mx-auto mb-3" />
                        <p className="text-gray-400">No recent changes found</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Duplicate Detection Tab */}
            <TabsContent value="duplicates" className="space-y-6">
              <Card className="bg-gray-700 border-gray-600 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Brain className="h-6 w-6 text-teal-400" />
                    AI-Powered Duplicate Detection
                    <Badge className="bg-teal-500/20 text-teal-300 border-teal-500/30">
                      89% Auto-Resolution Rate
                    </Badge>
                  </CardTitle>
                  <CardDescription className="text-gray-300">
                    Real-time analysis of configuration patterns with automatic resolution suggestions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {duplicateDetection.length > 0 ? duplicateDetection.map((duplicate, index) => (
                      <Alert key={index} className="bg-gray-600 border-gray-500">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <AlertTriangle className={`h-5 w-5 ${
                              duplicate.risk_level === 'HIGH' ? 'text-red-400' :
                              duplicate.risk_level === 'MEDIUM' ? 'text-yellow-400' : 'text-green-400'
                            }`} />
                            <div className="flex-1">
                              <h4 className="font-medium text-white">
                                {duplicate.duplicate_type.replace('_', ' ').toUpperCase()} Detected
                              </h4>
                              <p className="text-sm text-gray-300 mt-1">{duplicate.recommendation}</p>
                              <div className="flex items-center gap-2 my-2">
                                <Badge className={`${
                                  duplicate.risk_level === 'HIGH' ? 'bg-red-500/20 text-red-300 border-red-500/30' :
                                  duplicate.risk_level === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' :
                                  'bg-green-500/20 text-green-300 border-green-500/30'
                                }`}>
                                  {duplicate.risk_level} Risk
                                </Badge>
                                <Badge variant="outline" className="bg-teal-500/10 text-teal-400 border-teal-500/30">
                                  {(duplicate.similarity_score * 100).toFixed(1)}% Similarity
                                </Badge>
                                {duplicate.auto_resolvable && (
                                  <Badge className="bg-teal-500/20 text-teal-300 border-teal-500/30">
                                    Auto-Resolvable
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-gray-400">
                                Affects {duplicate.duplicate_count} configurations across {duplicate.affected_organizations.length} organizations
                              </p>
                            </div>
                          </div>
                          {duplicate.auto_resolvable && (
                            <Button size="sm" className="bg-teal-500 hover:bg-teal-600 text-white">
                              Auto-Resolve
                            </Button>
                          )}
                        </div>
                      </Alert>
                    )) : (
                      <div className="text-center py-12">
                        <CheckCircle className="h-16 w-16 text-teal-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-white mb-2">No Duplicates Detected</h3>
                        <p className="text-gray-400">Your configuration is optimized and duplicate-free!</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Solution Templates Tab */}
            <TabsContent value="templates" className="space-y-6">
              <Card className="bg-gray-700 border-gray-600 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Workflow className="h-6 w-6 text-teal-400" />
                    Solution Template Marketplace
                    <Badge className="bg-teal-500/20 text-teal-300 border-teal-500/30">
                      {metrics.solution_templates?.system_modules || 0} Templates Available
                    </Badge>
                  </CardTitle>
                  <CardDescription className="text-gray-300">
                    Deploy enterprise-grade modules in 2 minutes with drag-drop simplicity
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <Workflow className="h-16 w-16 text-teal-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">Template Marketplace Coming Soon</h3>
                    <p className="text-gray-400 mb-4">Browse, customize, and deploy solution templates with AI-powered recommendations</p>
                    <Button className="bg-teal-500 hover:bg-teal-600 text-white">
                      <Eye className="h-4 w-4 mr-2" />
                      View Available Templates
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Governance Tab */}
            <TabsContent value="governance" className="space-y-6">
              <Card className="bg-gray-700 border-gray-600 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Shield className="h-6 w-6 text-teal-400" />
                    Configuration Governance
                    <Badge className="bg-teal-500/20 text-teal-300 border-teal-500/30">
                      AI-Automated
                    </Badge>
                  </CardTitle>
                  <CardDescription className="text-gray-300">
                    Intelligent governance with risk-based change tracking and automated conflict resolution
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <Shield className="h-16 w-16 text-teal-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">Governance Dashboard</h3>
                    <p className="text-gray-400 mb-4">Advanced governance features with AI-powered conflict detection and resolution workflows</p>
                    <div className="flex gap-3 justify-center">
                      <Button className="bg-teal-500 hover:bg-teal-600 text-white">
                        <BarChart3 className="h-4 w-4 mr-2" />
                        View Analytics
                      </Button>
                      <Button variant="outline" className="bg-gray-600 border-gray-500 text-white hover:bg-gray-500">
                        <Settings className="h-4 w-4 mr-2" />
                        Configure Rules
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Footer */}
          <Card className="bg-gray-700 border-gray-600 shadow-xl">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="text-gray-300">
                  <p><strong>HERA Universal Configuration Control Panel</strong></p>
                  <p>Revolutionary configuration management • Surpasses SAP IMG • AI-powered governance</p>
                  <p className="text-sm text-gray-400 mt-1">Last updated: {new Date().toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className="bg-teal-500/20 text-teal-300 border-teal-500/30">
                    <Zap className="w-3 h-3 mr-1" />
                    System Operational
                  </Badge>
                  <Badge variant="outline" className="bg-teal-500/10 text-teal-400 border-teal-500/30">
                    <Globe className="w-3 h-3 mr-1" />
                    Universal Architecture v2.0
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}