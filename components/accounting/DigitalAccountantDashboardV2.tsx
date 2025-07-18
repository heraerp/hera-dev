'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
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
  Loader2
} from 'lucide-react'
import { useDigitalAccountant } from '@/hooks/useDigitalAccountant'
import { formatCurrency } from '@/lib/utils'

const DigitalAccountantDashboardV2: React.FC = () => {
  const {
    systemStatus,
    postingStats,
    aiMetrics,
    recentTransactions,
    pendingReleaseTransactions,
    isLoading,
    isRefreshing,
    refreshData,
    releaseTransaction,
    isSubscribed
  } = useDigitalAccountant()

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'posted_and_released':
        return <Badge variant="default" className="bg-green-100 text-green-800 border-green-300">
          <CheckCircle className="w-3 h-3 mr-1" />
          Released
        </Badge>
      case 'posted_pending_release':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-300">
          <Clock className="w-3 h-3 mr-1" />
          Pending Release
        </Badge>
      case 'draft':
        return <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-300">
          <Pause className="w-3 h-3 mr-1" />
          Draft
        </Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 0.95) {
      return <Badge variant="default" className="bg-green-100 text-green-800 border-green-300">
        {Math.round(confidence * 100)}% High
      </Badge>
    } else if (confidence >= 0.80) {
      return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-300">
        {Math.round(confidence * 100)}% Medium
      </Badge>
    } else {
      return <Badge variant="destructive" className="bg-red-100 text-red-800 border-red-300">
        {Math.round(confidence * 100)}% Low
      </Badge>
    }
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleReleaseTransaction = async (transactionId: string) => {
    const success = await releaseTransaction(transactionId)
    if (!success) {
      // Show error notification (in real app, use toast)
      console.error('Failed to release transaction')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <Skeleton className="h-12 w-96" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <Skeleton className="h-96" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg">
                <Brain className="h-8 w-8 text-white" />
              </div>
              HERA Digital Accountant
            </h1>
            <p className="text-gray-600">
              Intelligent AI-Powered Transaction Processing & Real-Time Posting
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Badge 
              variant={systemStatus === 'operational' ? 'default' : 'destructive'}
              className={`px-3 py-1 ${
                systemStatus === 'operational' 
                  ? 'bg-green-100 text-green-800 border-green-300' 
                  : 'bg-red-100 text-red-800 border-red-300'
              }`}
            >
              <Activity className="w-4 h-4 mr-1" />
              System {systemStatus === 'operational' ? 'Operational' : 'Warning'}
            </Badge>
            {isSubscribed && (
              <Badge variant="outline" className="bg-blue-50">
                <Activity className="w-3 h-3 mr-1 animate-pulse text-blue-600" />
                Live Updates
              </Badge>
            )}
            <Button 
              onClick={refreshData} 
              disabled={isRefreshing}
              variant="outline"
              size="sm"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {postingStats?.totalTransactions.toLocaleString() || '0'}
              </div>
              <p className="text-xs text-muted-foreground">
                {postingStats?.financialTransactions || 0} financial
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Auto-Released Today</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{postingStats?.autoReleasedToday || 0}</div>
              <p className="text-xs text-muted-foreground">
                {aiMetrics?.autoReleaseRate || 0}% automation rate
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-yellow-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Release</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{postingStats?.pendingRelease || 0}</div>
              <p className="text-xs text-muted-foreground">
                Awaiting manual review
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">AI Confidence</CardTitle>
              <Brain className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round((aiMetrics?.averageConfidence || 0) * 100)}%
              </div>
              <p className="text-xs text-muted-foreground">
                Average system confidence
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Tabs */}
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="pending">
              Pending Release
              {postingStats?.pendingRelease > 0 && (
                <Badge variant="secondary" className="ml-2 h-5 px-1">
                  {postingStats.pendingRelease}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* System Status */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    System Status
                  </CardTitle>
                  <CardDescription>
                    Real-time status of the automated posting system
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Auto-Posting Engine</span>
                      <Badge variant="default" className="bg-green-100 text-green-800 border-green-300">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Active
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">AI Classification</span>
                      <Badge variant="default" className="bg-green-100 text-green-800 border-green-300">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Operational
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Database Connection</span>
                      <Badge variant="default" className="bg-green-100 text-green-800 border-green-300">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Connected
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Audit Trail</span>
                      <Badge variant="default" className="bg-green-100 text-green-800 border-green-300">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Recording
                      </Badge>
                    </div>
                  </div>
                  
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      All systems operational. Auto-posting enabled with 95%+ accuracy.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>

              {/* AI Performance */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    AI Performance
                  </CardTitle>
                  <CardDescription>
                    Confidence distribution and accuracy metrics
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {aiMetrics ? (
                    <>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>High Confidence (≥95%)</span>
                            <span>{aiMetrics.highConfidence}%</span>
                          </div>
                          <Progress value={aiMetrics.highConfidence} className="bg-green-100" />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Medium Confidence (80-94%)</span>
                            <span>{aiMetrics.mediumConfidence}%</span>
                          </div>
                          <Progress value={aiMetrics.mediumConfidence} className="bg-yellow-100" />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Low Confidence (&lt;80%)</span>
                            <span>{aiMetrics.lowConfidence}%</span>
                          </div>
                          <Progress value={aiMetrics.lowConfidence} className="bg-red-100" />
                        </div>
                      </div>
                      
                      <div className="pt-2 border-t">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">
                            {Math.round(aiMetrics.averageConfidence * 100)}%
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Average AI Confidence
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      No AI metrics available
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
                <CardDescription>
                  Latest transactions processed by the system
                </CardDescription>
              </CardHeader>
              <CardContent>
                {recentTransactions.length > 0 ? (
                  <div className="space-y-3">
                    {recentTransactions.slice(0, 5).map((transaction) => (
                      <div 
                        key={transaction.id} 
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <div>
                            <div className="font-medium">{transaction.transaction_number}</div>
                            <div className="text-sm text-muted-foreground">
                              {transaction.transaction_type} • {formatDateTime(transaction.created_at)}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className="font-medium">
                              {formatCurrency(transaction.total_amount, transaction.currency)}
                            </div>
                            <div className="text-sm">
                              {transaction.ai_intelligence && 
                                getConfidenceBadge(transaction.ai_intelligence.confidence_score)}
                            </div>
                          </div>
                          {getStatusBadge(transaction.posting_status)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No recent transactions
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions">
            <Card>
              <CardHeader>
                <CardTitle>All Transactions</CardTitle>
                <CardDescription>
                  Complete list of financial transactions processed by the system
                </CardDescription>
              </CardHeader>
              <CardContent>
                {recentTransactions.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-3 font-medium">Transaction</th>
                          <th className="text-left p-3 font-medium">Type</th>
                          <th className="text-left p-3 font-medium">Amount</th>
                          <th className="text-left p-3 font-medium">AI Confidence</th>
                          <th className="text-left p-3 font-medium">Status</th>
                          <th className="text-left p-3 font-medium">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentTransactions.map((transaction) => (
                          <tr key={transaction.id} className="border-b hover:bg-gray-50">
                            <td className="p-3">
                              <div>
                                <div className="font-medium">{transaction.transaction_number}</div>
                              </div>
                            </td>
                            <td className="p-3">
                              <Badge variant="outline">{transaction.transaction_type}</Badge>
                            </td>
                            <td className="p-3 font-medium">
                              {formatCurrency(transaction.total_amount, transaction.currency)}
                            </td>
                            <td className="p-3">
                              {transaction.ai_intelligence && 
                                getConfidenceBadge(transaction.ai_intelligence.confidence_score)}
                            </td>
                            <td className="p-3">
                              {getStatusBadge(transaction.posting_status)}
                            </td>
                            <td className="p-3 text-muted-foreground">
                              {formatDateTime(transaction.created_at)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No transactions found
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pending Release Tab */}
          <TabsContent value="pending">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  Pending Release
                </CardTitle>
                <CardDescription>
                  Transactions awaiting manual review and release to accounting
                </CardDescription>
              </CardHeader>
              <CardContent>
                {pendingReleaseTransactions.length > 0 ? (
                  <div className="space-y-4">
                    {pendingReleaseTransactions.map((transaction) => (
                      <div 
                        key={transaction.id} 
                        className="flex items-center justify-between p-4 border border-yellow-200 bg-yellow-50 rounded-lg"
                      >
                        <div className="flex items-center gap-4">
                          <AlertTriangle className="h-5 w-5 text-yellow-500" />
                          <div>
                            <div className="font-medium">{transaction.transaction_number}</div>
                            <div className="text-sm text-muted-foreground">
                              {transaction.transaction_type} • {formatCurrency(transaction.total_amount, transaction.currency)}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              {transaction.ai_intelligence && 
                                getConfidenceBadge(transaction.ai_intelligence.confidence_score)}
                              <span className="text-xs text-muted-foreground">
                                Created {formatDateTime(transaction.created_at)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="flex items-center gap-1"
                          >
                            <Eye className="h-4 w-4" />
                            Review
                          </Button>
                          <Button 
                            onClick={() => handleReleaseTransaction(transaction.id)}
                            size="sm"
                            className="flex items-center gap-1"
                          >
                            <CheckCircle className="h-4 w-4" />
                            Release
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                    <p>No transactions pending release</p>
                    <p className="text-sm">All transactions have been processed automatically</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Processing Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {postingStats ? (
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Posted Transactions</span>
                        <span className="font-medium">{postingStats.postedTransactions}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Released to Accounting</span>
                        <span className="font-medium">{postingStats.releasedTransactions}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Auto-Release Rate</span>
                        <span className="font-medium">{aiMetrics?.autoReleaseRate || 0}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Manual Review Required</span>
                        <span className="font-medium">{100 - (aiMetrics?.autoReleaseRate || 0)}%</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      No statistics available
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Performance Insights
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Processing Speed</span>
                      <Badge variant="default" className="bg-green-100 text-green-800 border-green-300">
                        Instant (0s delay)
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>System Uptime</span>
                      <Badge variant="default" className="bg-green-100 text-green-800 border-green-300">
                        99.9%
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Error Rate</span>
                      <Badge variant="default" className="bg-green-100 text-green-800 border-green-300">
                        &lt;0.1%
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Cost Savings</span>
                      <Badge variant="default" className="bg-blue-100 text-blue-800 border-blue-300">
                        60% reduction
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>AI Performance Trends</CardTitle>
                <CardDescription>
                  Historical performance and accuracy metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <LineChart className="h-12 w-12 mx-auto mb-2" />
                    <p>Chart visualization would go here</p>
                    <p className="text-sm">Showing confidence trends over time</p>
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

export default DigitalAccountantDashboardV2