/**
 * HERA Universal - Digital Accountant Main Dashboard
 * 
 * Professional dark/light theme with depth hierarchy
 * Matches purchasing dashboard styling exactly
 */

'use client'

import React, { useState, useEffect } from 'react'
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { MetricsCard } from '@/components/ui/MetricsCard'
import { 
  Activity, 
  FileText, 
  GitBranch, 
  CheckSquare, 
  BookOpen,
  Brain,
  Zap,
  Clock,
  AlertTriangle,
  CheckCircle,
  Upload,
  RefreshCw,
  Eye,
  Plus,
  ArrowRight
} from 'lucide-react'
import Link from 'next/link'

interface DashboardMetrics {
  documentsProcessed: number
  aiConfidenceAverage: number
  relationshipsDetected: number
  threeWayMatchSuccess: number
  journalEntriesPosted: number
  automationSavingsHours: number
}

interface ActivityItem {
  id: string
  type: 'document' | 'relationship' | 'validation' | 'journal'
  title: string
  description: string
  status: 'completed' | 'processing' | 'pending' | 'failed'
  confidence?: number
  timestamp: string
}

interface PendingItem {
  id: string
  type: 'review' | 'validation' | 'approval'
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  dueDate?: string
}

export default function DigitalAccountantMainDashboard() {
  const [loading, setLoading] = useState(true)
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([])
  const [pendingReview, setPendingReview] = useState<PendingItem[]>([])
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Mock data - replace with real API calls
  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true)
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setMetrics({
        documentsProcessed: 247,
        aiConfidenceAverage: 0.94,
        relationshipsDetected: 189,
        threeWayMatchSuccess: 0.96,
        journalEntriesPosted: 156,
        automationSavingsHours: 32.5
      })

      setRecentActivity([
        {
          id: '1',
          type: 'document',
          title: 'Invoice INV-2024-0847',
          description: 'AI processing completed with high confidence',
          status: 'completed',
          confidence: 0.97,
          timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString()
        },
        {
          id: '2',
          type: 'relationship',
          title: 'PO-2024-0234 → GR-2024-0456',
          description: 'Automatic relationship detected',
          status: 'completed',
          confidence: 0.92,
          timestamp: new Date(Date.now() - 1000 * 60 * 32).toISOString()
        },
        {
          id: '3',
          type: 'validation',
          title: 'Three-way match validation',
          description: 'Invoice INV-2024-0843 validation passed',
          status: 'completed',
          timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString()
        },
        {
          id: '4',
          type: 'journal',
          title: 'Journal Entry JE-20240118-001',
          description: 'AI-generated entry posted successfully',
          status: 'completed',
          confidence: 0.89,
          timestamp: new Date(Date.now() - 1000 * 60 * 67).toISOString()
        },
        {
          id: '5',
          type: 'document',
          title: 'Purchase Order PO-2024-0889',
          description: 'Processing with medium confidence',
          status: 'processing',
          confidence: 0.78,
          timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString()
        }
      ])

      setPendingReview([
        {
          id: '1',
          type: 'review',
          title: 'Invoice INV-2024-0851',
          description: 'Low confidence score - manual review required',
          priority: 'high',
          dueDate: new Date(Date.now() + 1000 * 60 * 60 * 4).toISOString()
        },
        {
          id: '2',
          type: 'validation',
          title: 'Three-way match exception',
          description: 'Amount variance detected: $127.50',
          priority: 'medium',
          dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString()
        },
        {
          id: '3',
          type: 'approval',
          title: 'Journal Entry JE-20240118-008',
          description: 'Awaiting final approval for posting',
          priority: 'medium'
        }
      ])

      setLoading(false)
    }

    loadDashboardData()
  }, [])

  const refreshData = async () => {
    setIsRefreshing(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsRefreshing(false)
  }

  const getStatusBadge = (status: ActivityItem['status']) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-100 text-green-800 border-green-300">
          <CheckCircle className="w-3 h-3 mr-1" />
          Completed
        </Badge>
      case 'processing':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-300">
          <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
          Processing
        </Badge>
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
          <Clock className="w-3 h-3 mr-1" />
          Pending
        </Badge>
      case 'failed':
        return <Badge variant="destructive" className="bg-red-100 text-red-800 border-red-300">
          <AlertTriangle className="w-3 h-3 mr-1" />
          Failed
        </Badge>
    }
  }

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 0.95) {
      return <Badge className="bg-green-100 text-green-800 border-green-300">
        {Math.round(confidence * 100)}% High
      </Badge>
    } else if (confidence >= 0.80) {
      return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
        {Math.round(confidence * 100)}% Medium
      </Badge>
    } else {
      return <Badge className="bg-red-100 text-red-800 border-red-300">
        {Math.round(confidence * 100)}% Low
      </Badge>
    }
  }

  const getPriorityBadge = (priority: PendingItem['priority']) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive">High Priority</Badge>
      case 'medium':
        return <Badge variant="secondary">Medium</Badge>
      case 'low':
        return <Badge variant="outline">Low</Badge>
    }
  }

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60))
    
    if (diffMinutes < 1) return 'Just now'
    if (diffMinutes < 60) return `${diffMinutes}m ago`
    const diffHours = Math.floor(diffMinutes / 60)
    if (diffHours < 24) return `${diffHours}h ago`
    const diffDays = Math.floor(diffHours / 24)
    return `${diffDays}d ago`
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-12 w-96" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Skeleton for metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <Skeleton className="h-4 w-20 mb-3" />
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-24" />
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <Skeleton className="h-6 w-40 mb-4" />
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, j) => (
                  <div key={j} className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-3/4" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* System Status & Refresh */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700">
            <Activity className="w-4 h-4 mr-1" />
            System Operational
          </Badge>
        </div>
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

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <MetricsCard
          title="Documents Processed"
          value={metrics?.documentsProcessed?.toString() || '0'}
          icon={FileText}
          trend="+23 from yesterday"
          color="blue"
        />

        <MetricsCard
          title="AI Confidence"
          value={`${Math.round((metrics?.aiConfidenceAverage || 0) * 100)}%`}
          icon={Brain}
          trend="Average system confidence"
          color="green"
        />

        <MetricsCard
          title="Relationships Detected"
          value={metrics?.relationshipsDetected?.toString() || '0'}
          icon={GitBranch}
          trend="Auto-linked transactions"
          color="purple"
        />

        <MetricsCard
          title="Three-Way Match"
          value={`${Math.round((metrics?.threeWayMatchSuccess || 0) * 100)}%`}
          icon={CheckSquare}
          trend="Validation success rate"
          color="orange"
        />

        <MetricsCard
          title="Journal Entries"
          value={metrics?.journalEntriesPosted?.toString() || '0'}
          icon={BookOpen}
          trend="AI-assisted entries posted"
          color="blue"
        />

        <MetricsCard
          title="Time Saved"
          value={`${metrics?.automationSavingsHours || 0}h`}
          icon={Zap}
          trend="Through automation this week"
          color="green"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg transition-colors duration-200">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Recent Activity</h3>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Latest AI processing and automation results
            </p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentActivity.slice(0, 5).map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg transition-colors duration-200">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <div className="font-medium text-sm text-gray-900 dark:text-gray-100">{activity.title}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{formatTimeAgo(activity.timestamp)}</div>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">{activity.description}</div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(activity.status)}
                      {activity.confidence && getConfidenceBadge(activity.confidence)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button variant="outline" size="sm" className="w-full" asChild>
                <Link href="/digital-accountant/analytics">
                  View All Activity
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Pending Review */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg transition-colors duration-200">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Pending Review</h3>
              {pendingReview.length > 0 && (
                <Badge variant="secondary" className="ml-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                  {pendingReview.length}
                </Badge>
              )}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Items requiring manual attention or approval
            </p>
          </div>
          <div className="p-6">
            {pendingReview.length > 0 ? (
              <div className="space-y-4">
                {pendingReview.map((item) => (
                  <div key={item.id} className="flex items-start gap-3 p-3 border border-yellow-200 dark:border-yellow-800/50 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg transition-colors duration-200">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <div className="font-medium text-sm text-gray-900 dark:text-gray-100">{item.title}</div>
                        {getPriorityBadge(item.priority)}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">{item.description}</div>
                      {item.dueDate && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Due: {new Date(item.dueDate).toLocaleString()}
                        </div>
                      )}
                    </div>
                    <Button size="sm" variant="outline" className="border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700">
                      <Eye className="h-4 w-4 mr-1" />
                      Review
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500 dark:text-green-400" />
                <p>No items pending review</p>
                <p className="text-sm">All items processed successfully</p>
              </div>
            )}
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button variant="outline" size="sm" className="w-full border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700" asChild>
                <Link href="/digital-accountant/documents">
                  View All Pending Items
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg transition-colors duration-200">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Quick Actions</h3>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Start common tasks and workflows
          </p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex-col gap-2 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700" asChild>
              <Link href="/digital-accountant/documents">
                <Upload className="h-5 w-5" />
                Upload Document
              </Link>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700" asChild>
              <Link href="/digital-accountant/relationships">
                <GitBranch className="h-5 w-5" />
                Link Transactions
              </Link>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700" asChild>
              <Link href="/digital-accountant/three-way-match">
                <CheckSquare className="h-5 w-5" />
                Validate Match
              </Link>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700" asChild>
              <Link href="/digital-accountant/journal-entries">
                <Plus className="h-5 w-5" />
                Create Journal Entry
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* System Health Alert */}
      <Alert className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <CheckCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        <AlertDescription className="text-blue-800 dark:text-blue-200">
          All AI systems operational. Processing at 94% average confidence with 96% automation rate.
          <Button variant="link" className="p-0 ml-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300" asChild>
            <Link href="/digital-accountant/analytics">View detailed analytics →</Link>
          </Button>
        </AlertDescription>
      </Alert>
    </div>
  )
}