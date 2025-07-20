'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  TrendingUp, 
  Brain, 
  BarChart3, 
  Target,
  Zap,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Download,
  Settings,
  Users,
  Clock,
  DollarSign,
  FileText,
  GitBranch,
  BookOpen,
  Activity,
  Award,
  Lightbulb
} from 'lucide-react'
import ConfidenceIndicator from './ConfidenceIndicator'

interface AIPerformanceMetrics {
  overview: {
    totalDocumentsProcessed: number
    averageConfidenceScore: number
    automationRate: number
    manualInterventionRate: number
    accuracyRate: number
    timeSavedHours: number
  }
  confidenceTrends: {
    daily: Array<{
      date: string
      averageConfidence: number
      documentsProcessed: number
      autoProcessed: number
    }>
    byDocumentType: Record<string, {
      averageConfidence: number
      totalProcessed: number
      automationRate: number
    }>
  }
  relationshipDetection: {
    totalRelationshipsDetected: number
    averageConfidence: number
    accuracyRate: number
    manualOverrides: number
    byRelationshipType: Record<string, {
      detected: number
      averageConfidence: number
      manualOverrides: number
    }>
  }
  threeWayMatchValidation: {
    totalValidations: number
    passRate: number
    warningRate: number
    failureRate: number
    overrideRate: number
    averageVariance: number
  }
  journalEntryAutomation: {
    totalJournalEntries: number
    aiGeneratedRate: number
    autoPostedRate: number
    averageConfidence: number
    manualCorrections: number
  }
  recommendations: string[]
}

interface FeedbackSummary {
  totalFeedback: number
  averageRating: number
  accuracyDistribution: {
    correct: number
    partiallyCorrect: number
    incorrect: number
  }
  byType: Record<string, {
    count: number
    averageRating: number
    accuracyRate: number
  }>
  recentFeedback: Array<{
    id: string
    type: string
    rating: number
    feedback: string
    submittedAt: string
  }>
}

export default function AIAnalyticsDashboard() {
  const [metrics, setMetrics] = useState<AIPerformanceMetrics | null>(null)
  const [feedbackSummary, setFeedbackSummary] = useState<FeedbackSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState('30')
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Mock data - replace with real API calls
  useEffect(() => {
    const loadAnalytics = async () => {
      setLoading(true)
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setMetrics({
        overview: {
          totalDocumentsProcessed: 1247,
          averageConfidenceScore: 0.94,
          automationRate: 0.87,
          manualInterventionRate: 0.13,
          accuracyRate: 0.96,
          timeSavedHours: 156.5
        },
        confidenceTrends: {
          daily: [
            { date: '2024-01-12', averageConfidence: 0.91, documentsProcessed: 45, autoProcessed: 38 },
            { date: '2024-01-13', averageConfidence: 0.93, documentsProcessed: 52, autoProcessed: 47 },
            { date: '2024-01-14', averageConfidence: 0.89, documentsProcessed: 38, autoProcessed: 31 },
            { date: '2024-01-15', averageConfidence: 0.95, documentsProcessed: 67, autoProcessed: 63 },
            { date: '2024-01-16', averageConfidence: 0.92, documentsProcessed: 41, autoProcessed: 36 },
            { date: '2024-01-17', averageConfidence: 0.97, documentsProcessed: 58, autoProcessed: 55 },
            { date: '2024-01-18', averageConfidence: 0.94, documentsProcessed: 49, autoProcessed: 44 }
          ],
          byDocumentType: {
            invoice: { averageConfidence: 0.96, totalProcessed: 567, automationRate: 0.92 },
            purchase_order: { averageConfidence: 0.94, totalProcessed: 234, automationRate: 0.89 },
            receipt: { averageConfidence: 0.85, totalProcessed: 189, automationRate: 0.71 },
            contract: { averageConfidence: 0.91, totalProcessed: 156, automationRate: 0.84 },
            other: { averageConfidence: 0.78, totalProcessed: 101, automationRate: 0.65 }
          }
        },
        relationshipDetection: {
          totalRelationshipsDetected: 892,
          averageConfidence: 0.89,
          accuracyRate: 0.91,
          manualOverrides: 78,
          byRelationshipType: {
            'po_to_gr': { detected: 345, averageConfidence: 0.93, manualOverrides: 23 },
            'gr_to_invoice': { detected: 298, averageConfidence: 0.87, manualOverrides: 31 },
            'invoice_to_payment': { detected: 156, averageConfidence: 0.91, manualOverrides: 12 },
            'manual_link': { detected: 93, averageConfidence: 1.0, manualOverrides: 12 }
          }
        },
        threeWayMatchValidation: {
          totalValidations: 567,
          passRate: 0.84,
          warningRate: 0.11,
          failureRate: 0.03,
          overrideRate: 0.02,
          averageVariance: 1.8
        },
        journalEntryAutomation: {
          totalJournalEntries: 432,
          aiGeneratedRate: 0.67,
          autoPostedRate: 0.78,
          averageConfidence: 0.92,
          manualCorrections: 34
        },
        recommendations: [
          'Document preprocessing quality has improved - consider lowering manual review threshold',
          'Invoice processing shows consistently high confidence - increase automation rate',
          'Receipt recognition accuracy could benefit from additional training data',
          'Three-way match variance tolerance may be too strict for current supplier base',
          'Journal entry templates are performing well - expand to more transaction types'
        ]
      })

      setFeedbackSummary({
        totalFeedback: 234,
        averageRating: 4.2,
        accuracyDistribution: {
          correct: 189,
          partiallyCorrect: 32,
          incorrect: 13
        },
        byType: {
          document_processing: { count: 145, averageRating: 4.4, accuracyRate: 0.89 },
          relationship_detection: { count: 56, averageRating: 4.1, accuracyRate: 0.85 },
          three_way_match: { count: 23, averageRating: 3.9, accuracyRate: 0.87 },
          journal_entry: { count: 10, averageRating: 4.6, accuracyRate: 0.92 }
        },
        recentFeedback: [
          {
            id: '1',
            type: 'document_processing',
            rating: 5,
            feedback: 'Perfect extraction of invoice data',
            submittedAt: '2024-01-18T14:30:00Z'
          },
          {
            id: '2',
            type: 'relationship_detection',
            rating: 4,
            feedback: 'Good match but needed minor adjustment',
            submittedAt: '2024-01-18T12:15:00Z'
          },
          {
            id: '3',
            type: 'three_way_match',
            rating: 3,
            feedback: 'Variance calculation was too strict',
            submittedAt: '2024-01-18T10:45:00Z'
          }
        ]
      })
      
      setLoading(false)
    }

    loadAnalytics()
  }, [selectedPeriod])

  const refreshData = async () => {
    setIsRefreshing(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsRefreshing(false)
  }

  const getPerformanceColor = (value: number, type: 'percentage' | 'rating' = 'percentage') => {
    if (type === 'rating') {
      if (value >= 4.5) return 'text-green-600'
      if (value >= 3.5) return 'text-yellow-600'
      return 'text-red-600'
    }
    
    if (value >= 0.9) return 'text-green-600'
    if (value >= 0.7) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getPerformanceBadge = (value: number, type: 'percentage' | 'rating' = 'percentage') => {
    const displayValue = type === 'rating' ? value.toFixed(1) : `${Math.round(value * 100)}%`
    const colorClass = getPerformanceColor(value, type)
    
    return (
      <span className={`font-bold text-lg ${colorClass}`}>
        {displayValue}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg">
              <TrendingUp className="h-8 w-8 text-white" />
            </div>
            AI Analytics Dashboard
          </h1>
          <p className="text-gray-600">
            Comprehensive AI performance monitoring, optimization insights, and system analytics
          </p>
        </div>
        <div className="flex items-center gap-4">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>
          <Button 
            onClick={refreshData} 
            disabled={isRefreshing}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Documents Processed</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.overview.totalDocumentsProcessed.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {getPerformanceBadge(metrics?.overview.automationRate || 0)} automation rate
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Confidence</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round((metrics?.overview.averageConfidenceScore || 0) * 100)}%</div>
            <p className="text-xs text-muted-foreground">
              Average system confidence
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Accuracy Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round((metrics?.overview.accuracyRate || 0) * 100)}%</div>
            <p className="text-xs text-muted-foreground">
              User-validated accuracy
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Time Saved</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.overview.timeSavedHours.toFixed(1)}h</div>
            <p className="text-xs text-muted-foreground">
              Through automation this month
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Manual Intervention</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round((metrics?.overview.manualInterventionRate || 0) * 100)}%</div>
            <p className="text-xs text-muted-foreground">
              Requires human review
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-indigo-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">User Satisfaction</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{feedbackSummary?.averageRating.toFixed(1)}/5</div>
            <p className="text-xs text-muted-foreground">
              Based on {feedbackSummary?.totalFeedback} reviews
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="confidence">Confidence Trends</TabsTrigger>
          <TabsTrigger value="relationships">Relationships</TabsTrigger>
          <TabsTrigger value="validation">Validation</TabsTrigger>
          <TabsTrigger value="feedback">User Feedback</TabsTrigger>
        </TabsList>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Processing Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Document Processing</span>
                      <span className="font-medium">{Math.round((metrics?.overview.automationRate || 0) * 100)}%</span>
                    </div>
                    <Progress value={(metrics?.overview.automationRate || 0) * 100} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Relationship Detection</span>
                      <span className="font-medium">{Math.round((metrics?.relationshipDetection.accuracyRate || 0) * 100)}%</span>
                    </div>
                    <Progress value={(metrics?.relationshipDetection.accuracyRate || 0) * 100} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Three-Way Match</span>
                      <span className="font-medium">{Math.round((metrics?.threeWayMatchValidation.passRate || 0) * 100)}%</span>
                    </div>
                    <Progress value={(metrics?.threeWayMatchValidation.passRate || 0) * 100} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Journal Entry Automation</span>
                      <span className="font-medium">{Math.round((metrics?.journalEntryAutomation.aiGeneratedRate || 0) * 100)}%</span>
                    </div>
                    <Progress value={(metrics?.journalEntryAutomation.aiGeneratedRate || 0) * 100} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Daily Processing Volume
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
                  <div className="text-center text-gray-500">
                    <BarChart3 className="h-16 w-16 mx-auto mb-4" />
                    <p className="text-sm">Daily processing chart would be displayed here</p>
                    <p className="text-xs">Showing document processing trends over time</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                AI Recommendations
              </CardTitle>
              <CardDescription>
                System-generated insights and optimization suggestions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {metrics?.recommendations.map((recommendation, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <Lightbulb className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm text-blue-800">{recommendation}</p>
                    </div>
                    <Button variant="outline" size="sm" className="text-blue-600 border-blue-300">
                      Implement
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Confidence Trends Tab */}
        <TabsContent value="confidence">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Confidence by Document Type</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(metrics?.confidenceTrends.byDocumentType || {}).map(([type, data]) => (
                  <div key={type} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium capitalize">{type.replace('_', ' ')}</span>
                      <div className="flex items-center gap-2">
                        <ConfidenceIndicator confidence={data.averageConfidence} size="sm" />
                        <span className="text-xs text-gray-500">{data.totalProcessed} docs</span>
                      </div>
                    </div>
                    <Progress value={data.averageConfidence * 100} className="h-2" />
                    <div className="text-xs text-gray-500">
                      Automation rate: {Math.round(data.automationRate * 100)}%
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Weekly Confidence Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
                  <div className="text-center text-gray-500">
                    <TrendingUp className="h-16 w-16 mx-auto mb-4" />
                    <p className="text-sm">Confidence trend chart would be displayed here</p>
                    <p className="text-xs">Showing AI confidence levels over time</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Relationships Tab */}
        <TabsContent value="relationships">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GitBranch className="h-5 w-5" />
                  Relationship Detection Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{metrics?.relationshipDetection.totalRelationshipsDetected}</div>
                    <div className="text-sm text-green-700">Total Detected</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{Math.round((metrics?.relationshipDetection.averageConfidence || 0) * 100)}%</div>
                    <div className="text-sm text-blue-700">Avg Confidence</div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {Object.entries(metrics?.relationshipDetection.byRelationshipType || {}).map(([type, data]) => (
                    <div key={type} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm font-medium">{type.replace('_', ' → ').toUpperCase()}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{data.detected} detected</span>
                        <ConfidenceIndicator confidence={data.averageConfidence} size="sm" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Manual Override Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center p-8">
                  <div className="text-3xl font-bold text-orange-600 mb-2">{metrics?.relationshipDetection.manualOverrides}</div>
                  <div className="text-sm text-gray-600 mb-4">Manual overrides this period</div>
                  <div className="text-xs text-gray-500">
                    {Math.round(((metrics?.relationshipDetection.manualOverrides || 0) / (metrics?.relationshipDetection.totalRelationshipsDetected || 1)) * 100)}% override rate
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Validation Tab */}
        <TabsContent value="validation">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Three-Way Match Results</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-xl font-bold text-green-600">{Math.round((metrics?.threeWayMatchValidation.passRate || 0) * 100)}%</div>
                    <div className="text-xs text-green-700">Pass Rate</div>
                  </div>
                  <div className="text-center p-3 bg-yellow-50 rounded-lg">
                    <div className="text-xl font-bold text-yellow-600">{Math.round((metrics?.threeWayMatchValidation.warningRate || 0) * 100)}%</div>
                    <div className="text-xs text-yellow-700">Warnings</div>
                  </div>
                  <div className="text-center p-3 bg-red-50 rounded-lg">
                    <div className="text-xl font-bold text-red-600">{Math.round((metrics?.threeWayMatchValidation.failureRate || 0) * 100)}%</div>
                    <div className="text-xs text-red-700">Failures</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <div className="text-xl font-bold text-purple-600">{Math.round((metrics?.threeWayMatchValidation.overrideRate || 0) * 100)}%</div>
                    <div className="text-xs text-purple-700">Overrides</div>
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Average Variance</span>
                    <span className="font-bold">{metrics?.threeWayMatchValidation.averageVariance.toFixed(1)}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Journal Entry Automation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>AI Generated Entries</span>
                      <span className="font-medium">{Math.round((metrics?.journalEntryAutomation.aiGeneratedRate || 0) * 100)}%</span>
                    </div>
                    <Progress value={(metrics?.journalEntryAutomation.aiGeneratedRate || 0) * 100} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Auto Posted Rate</span>
                      <span className="font-medium">{Math.round((metrics?.journalEntryAutomation.autoPostedRate || 0) * 100)}%</span>
                    </div>
                    <Progress value={(metrics?.journalEntryAutomation.autoPostedRate || 0) * 100} className="h-2" />
                  </div>
                </div>
                
                <div className="pt-4 border-t space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Entries</span>
                    <span className="font-medium">{metrics?.journalEntryAutomation.totalJournalEntries}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Manual Corrections</span>
                    <span className="font-medium">{metrics?.journalEntryAutomation.manualCorrections}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Avg Confidence</span>
                    <ConfidenceIndicator confidence={metrics?.journalEntryAutomation.averageConfidence || 0} size="sm" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* User Feedback Tab */}
        <TabsContent value="feedback">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Feedback Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-3xl font-bold text-blue-600">{feedbackSummary?.averageRating.toFixed(1)}/5</div>
                  <div className="text-sm text-blue-700">Average Rating</div>
                  <div className="text-xs text-gray-500">{feedbackSummary?.totalFeedback} total reviews</div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Correct Classifications</span>
                    <span className="font-medium">{feedbackSummary?.accuracyDistribution.correct}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Partially Correct</span>
                    <span className="font-medium">{feedbackSummary?.accuracyDistribution.partiallyCorrect}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Incorrect</span>
                    <span className="font-medium">{feedbackSummary?.accuracyDistribution.incorrect}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Feedback by Category</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {Object.entries(feedbackSummary?.byType || {}).map(([type, data]) => (
                  <div key={type} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium capitalize">{type.replace('_', ' ')}</span>
                      <span className={`text-sm font-bold ${getPerformanceColor(data.averageRating, 'rating')}`}>
                        {data.averageRating.toFixed(1)}/5
                      </span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>{data.count} reviews</span>
                      <span>{Math.round(data.accuracyRate * 100)}% accuracy</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Feedback</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {feedbackSummary?.recentFeedback.map((feedback) => (
                  <div key={feedback.id} className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <div key={star} className={`w-3 h-3 ${star <= feedback.rating ? 'text-yellow-400' : 'text-gray-300'}`}>
                          ⭐
                        </div>
                      ))}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium capitalize mb-1">{feedback.type.replace('_', ' ')}</div>
                      <div className="text-sm text-gray-600">{feedback.feedback}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(feedback.submittedAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* System Health Alert */}
      <Alert>
        <CheckCircle className="h-4 w-4" />
        <AlertDescription>
          AI systems are performing optimally. Average confidence: {Math.round((metrics?.overview.averageConfidenceScore || 0) * 100)}%, 
          Automation rate: {Math.round((metrics?.overview.automationRate || 0) * 100)}%, 
          User satisfaction: {feedbackSummary?.averageRating.toFixed(1)}/5
        </AlertDescription>
      </Alert>
    </div>
  )
}