'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  GitBranch, 
  Eye, 
  Link2, 
  CheckCircle, 
  AlertTriangle,
  RefreshCw,
  Search,
  Filter,
  ArrowRight,
  FileText,
  DollarSign,
  Clock,
  Users,
  TrendingUp,
  Plus,
  Unlink
} from 'lucide-react'
import ConfidenceIndicator from './ConfidenceIndicator'
import Link from 'next/link'

interface Relationship {
  id: string
  type: 'po_to_gr' | 'gr_to_invoice' | 'invoice_to_payment' | 'manual_link'
  parentEntity: {
    id: string
    type: string
    name: string
    amount: number
    date: string
  }
  childEntity: {
    id: string
    type: string
    name: string
    amount: number
    date: string
  }
  confidence: number
  status: 'auto_detected' | 'manual_created' | 'pending_review' | 'approved' | 'rejected'
  detectionMethod: 'ai_automatic' | 'user_manual' | 'system_rule'
  createdAt: string
  createdBy?: string
  variance?: {
    amount: number
    percentage: number
    acceptable: boolean
  }
  metadata?: {
    matchingFields: string[]
    matchingScore: number
    suggestions?: string[]
    issues?: string[]
  }
}

interface RelationshipStats {
  totalDetected: number
  autoDetectedToday: number
  pendingReview: number
  averageConfidence: number
  successRate: number
  manualOverrides: number
}

export default function RelationshipDashboard() {
  const [relationships, setRelationships] = useState<Relationship[]>([])
  const [stats, setStats] = useState<RelationshipStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterType, setFilterType] = useState<string>('all')
  const [selectedTab, setSelectedTab] = useState('auto-detected')

  // Mock data - replace with real API calls
  useEffect(() => {
    const loadRelationships = async () => {
      setLoading(true)
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setStats({
        totalDetected: 234,
        autoDetectedToday: 18,
        pendingReview: 5,
        averageConfidence: 0.89,
        successRate: 0.94,
        manualOverrides: 12
      })

      setRelationships([
        {
          id: '1',
          type: 'po_to_gr',
          parentEntity: {
            id: 'po-2024-0234',
            type: 'purchase_order',
            name: 'PO-2024-0234',
            amount: 1250.00,
            date: '2024-01-15'
          },
          childEntity: {
            id: 'gr-2024-0456',
            type: 'goods_receipt',
            name: 'GR-2024-0456',
            amount: 1250.00,
            date: '2024-01-16'
          },
          confidence: 0.98,
          status: 'approved',
          detectionMethod: 'ai_automatic',
          createdAt: '2024-01-16T14:30:00Z',
          variance: {
            amount: 0,
            percentage: 0,
            acceptable: true
          },
          metadata: {
            matchingFields: ['po_number', 'vendor', 'amount'],
            matchingScore: 0.98,
            suggestions: ['Perfect match detected', 'Ready for three-way validation']
          }
        },
        {
          id: '2',
          type: 'gr_to_invoice',
          parentEntity: {
            id: 'gr-2024-0456',
            type: 'goods_receipt',
            name: 'GR-2024-0456',
            amount: 1250.00,
            date: '2024-01-16'
          },
          childEntity: {
            id: 'inv-2024-0847',
            type: 'invoice',
            name: 'INV-2024-0847',
            amount: 1250.00,
            date: '2024-01-18'
          },
          confidence: 0.92,
          status: 'approved',
          detectionMethod: 'ai_automatic',
          createdAt: '2024-01-18T10:32:25Z',
          variance: {
            amount: 0,
            percentage: 0,
            acceptable: true
          },
          metadata: {
            matchingFields: ['po_number', 'amount', 'vendor'],
            matchingScore: 0.92,
            suggestions: ['Three-way match complete', 'Ready for payment processing']
          }
        },
        {
          id: '3',
          type: 'po_to_gr',
          parentEntity: {
            id: 'po-2024-0345',
            type: 'purchase_order',
            name: 'PO-2024-0345',
            amount: 875.50,
            date: '2024-01-17'
          },
          childEntity: {
            id: 'gr-2024-0567',
            type: 'goods_receipt',
            name: 'GR-2024-0567',
            amount: 852.30,
            date: '2024-01-18'
          },
          confidence: 0.76,
          status: 'pending_review',
          detectionMethod: 'ai_automatic',
          createdAt: '2024-01-18T09:15:00Z',
          variance: {
            amount: 23.20,
            percentage: 2.65,
            acceptable: false
          },
          metadata: {
            matchingFields: ['po_number', 'vendor'],
            matchingScore: 0.76,
            suggestions: ['Amount variance detected', 'Manual review recommended'],
            issues: ['Amount difference: $23.20 (2.65%)']
          }
        },
        {
          id: '4',
          type: 'manual_link',
          parentEntity: {
            id: 'misc-2024-0012',
            type: 'miscellaneous',
            name: 'Office Supplies Receipt',
            amount: 67.45,
            date: '2024-01-18'
          },
          childEntity: {
            id: 'exp-2024-0089',
            type: 'expense_claim',
            name: 'EXP-2024-0089',
            amount: 67.45,
            date: '2024-01-18'
          },
          confidence: 1.0,
          status: 'approved',
          detectionMethod: 'user_manual',
          createdAt: '2024-01-18T15:20:00Z',
          createdBy: 'jane.smith@company.com',
          metadata: {
            matchingFields: ['amount', 'date', 'description'],
            matchingScore: 1.0,
            suggestions: ['Manual link verified', 'Expense claim matched']
          }
        },
        {
          id: '5',
          type: 'invoice_to_payment',
          parentEntity: {
            id: 'inv-2024-0823',
            type: 'invoice',
            name: 'INV-2024-0823',
            amount: 2100.00,
            date: '2024-01-10'
          },
          childEntity: {
            id: 'pay-2024-0156',
            type: 'payment',
            name: 'PAY-2024-0156',
            amount: 2100.00,
            date: '2024-01-17'
          },
          confidence: 0.95,
          status: 'approved',
          detectionMethod: 'ai_automatic',
          createdAt: '2024-01-17T11:45:00Z',
          metadata: {
            matchingFields: ['invoice_number', 'amount', 'vendor'],
            matchingScore: 0.95,
            suggestions: ['Payment matched to invoice', 'Transaction complete']
          }
        }
      ])
      
      setLoading(false)
    }

    loadRelationships()
  }, [])

  const filteredRelationships = relationships.filter(rel => {
    const matchesSearch = rel.parentEntity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         rel.childEntity.name.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = filterStatus === 'all' || rel.status === filterStatus
    const matchesType = filterType === 'all' || rel.type === filterType
    
    return matchesSearch && matchesStatus && matchesType
  })

  const getStatusBadge = (status: Relationship['status']) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 border-green-300">
          <CheckCircle className="w-3 h-3 mr-1" />
          Approved
        </Badge>
      case 'pending_review':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
          <Clock className="w-3 h-3 mr-1" />
          Pending Review
        </Badge>
      case 'auto_detected':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-300">
          <RefreshCw className="w-3 h-3 mr-1" />
          Auto-Detected
        </Badge>
      case 'manual_created':
        return <Badge className="bg-purple-100 text-purple-800 border-purple-300">
          <Users className="w-3 h-3 mr-1" />
          Manual
        </Badge>
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 border-red-300">
          <AlertTriangle className="w-3 h-3 mr-1" />
          Rejected
        </Badge>
    }
  }

  const getRelationshipTypeLabel = (type: Relationship['type']) => {
    switch (type) {
      case 'po_to_gr':
        return 'PO → Goods Receipt'
      case 'gr_to_invoice':
        return 'Goods Receipt → Invoice'
      case 'invoice_to_payment':
        return 'Invoice → Payment'
      case 'manual_link':
        return 'Manual Link'
    }
  }

  const getEntityIcon = (type: string) => {
    switch (type) {
      case 'purchase_order':
        return <FileText className="h-4 w-4 text-blue-600" />
      case 'goods_receipt':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'invoice':
        return <FileText className="h-4 w-4 text-purple-600" />
      case 'payment':
        return <DollarSign className="h-4 w-4 text-orange-600" />
      default:
        return <FileText className="h-4 w-4 text-gray-600" />
    }
  }

  const handleApproveRelationship = async (relationshipId: string) => {
    setRelationships(prev => prev.map(rel => 
      rel.id === relationshipId ? { ...rel, status: 'approved' as const } : rel
    ))
  }

  const handleRejectRelationship = async (relationshipId: string) => {
    setRelationships(prev => prev.map(rel => 
      rel.id === relationshipId ? { ...rel, status: 'rejected' as const } : rel
    ))
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
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
              <GitBranch className="h-8 w-8 text-white" />
            </div>
            Transaction Relationships
          </h1>
          <p className="text-gray-600">
            AI-powered transaction linking and relationship management
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
            <RefreshCw className="w-4 h-4 mr-1" />
            Auto-Detection Active
          </Badge>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Manual Link
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Relationships</CardTitle>
            <GitBranch className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalDetected}</div>
            <p className="text-xs text-muted-foreground">
              All time detected links
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Auto-Detected Today</CardTitle>
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.autoDetectedToday}</div>
            <p className="text-xs text-muted-foreground">
              AI automatic detection
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.pendingReview}</div>
            <p className="text-xs text-muted-foreground">
              Require manual review
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round((stats?.successRate || 0) * 100)}%</div>
            <p className="text-xs text-muted-foreground">
              Detection accuracy
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by transaction names or numbers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">All Status</option>
                <option value="approved">Approved</option>
                <option value="pending_review">Pending Review</option>
                <option value="auto_detected">Auto-Detected</option>
                <option value="manual_created">Manual</option>
                <option value="rejected">Rejected</option>
              </select>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">All Types</option>
                <option value="po_to_gr">PO → GR</option>
                <option value="gr_to_invoice">GR → Invoice</option>
                <option value="invoice_to_payment">Invoice → Payment</option>
                <option value="manual_link">Manual Link</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="auto-detected">Auto-Detected</TabsTrigger>
          <TabsTrigger value="pending-review">
            Pending Review
            {stats?.pendingReview && stats.pendingReview > 0 && (
              <Badge variant="secondary" className="ml-2 h-5 px-1">
                {stats.pendingReview}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="manual-links">Manual Links</TabsTrigger>
          <TabsTrigger value="visual-map">Visual Map</TabsTrigger>
        </TabsList>

        {/* Auto-Detected Tab */}
        <TabsContent value="auto-detected">
          <Card>
            <CardHeader>
              <CardTitle>Auto-Detected Relationships</CardTitle>
              <CardDescription>
                Relationships automatically detected by AI analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredRelationships
                  .filter(rel => rel.detectionMethod === 'ai_automatic' && rel.status === 'approved')
                  .map((relationship) => (
                  <div key={relationship.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {getRelationshipTypeLabel(relationship.type)}
                        </Badge>
                        {getStatusBadge(relationship.status)}
                      </div>
                      <ConfidenceIndicator confidence={relationship.confidence} size="sm" />
                    </div>
                    
                    <div className="flex items-center gap-4">
                      {/* Parent Entity */}
                      <div className="flex items-center gap-2 flex-1">
                        {getEntityIcon(relationship.parentEntity.type)}
                        <div>
                          <div className="font-medium text-sm">{relationship.parentEntity.name}</div>
                          <div className="text-xs text-gray-500">
                            ${relationship.parentEntity.amount.toLocaleString()} • {relationship.parentEntity.date}
                          </div>
                        </div>
                      </div>
                      
                      {/* Arrow */}
                      <ArrowRight className="h-4 w-4 text-gray-400" />
                      
                      {/* Child Entity */}
                      <div className="flex items-center gap-2 flex-1">
                        {getEntityIcon(relationship.childEntity.type)}
                        <div>
                          <div className="font-medium text-sm">{relationship.childEntity.name}</div>
                          <div className="text-xs text-gray-500">
                            ${relationship.childEntity.amount.toLocaleString()} • {relationship.childEntity.date}
                          </div>
                        </div>
                      </div>
                      
                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </div>
                    </div>
                    
                    {/* Variance Alert */}
                    {relationship.variance && !relationship.variance.acceptable && (
                      <Alert className="mt-3">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription className="text-xs">
                          Amount variance: ${relationship.variance.amount.toFixed(2)} ({relationship.variance.percentage.toFixed(1)}%)
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    {/* Metadata */}
                    {relationship.metadata?.suggestions && (
                      <div className="mt-3 text-xs text-gray-600">
                        <strong>Matching fields:</strong> {relationship.metadata.matchingFields?.join(', ')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pending Review Tab */}
        <TabsContent value="pending-review">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Pending Review
              </CardTitle>
              <CardDescription>
                Relationships requiring manual review and approval
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredRelationships.filter(rel => rel.status === 'pending_review').length > 0 ? (
                <div className="space-y-4">
                  {filteredRelationships
                    .filter(rel => rel.status === 'pending_review')
                    .map((relationship) => (
                    <div key={relationship.id} className="border-2 border-yellow-200 bg-yellow-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {getRelationshipTypeLabel(relationship.type)}
                          </Badge>
                          {getStatusBadge(relationship.status)}
                        </div>
                        <ConfidenceIndicator confidence={relationship.confidence} size="sm" />
                      </div>
                      
                      <div className="flex items-center gap-4 mb-3">
                        {/* Parent Entity */}
                        <div className="flex items-center gap-2 flex-1">
                          {getEntityIcon(relationship.parentEntity.type)}
                          <div>
                            <div className="font-medium text-sm">{relationship.parentEntity.name}</div>
                            <div className="text-xs text-gray-500">
                              ${relationship.parentEntity.amount.toLocaleString()} • {relationship.parentEntity.date}
                            </div>
                          </div>
                        </div>
                        
                        {/* Arrow */}
                        <ArrowRight className="h-4 w-4 text-gray-400" />
                        
                        {/* Child Entity */}
                        <div className="flex items-center gap-2 flex-1">
                          {getEntityIcon(relationship.childEntity.type)}
                          <div>
                            <div className="font-medium text-sm">{relationship.childEntity.name}</div>
                            <div className="text-xs text-gray-500">
                              ${relationship.childEntity.amount.toLocaleString()} • {relationship.childEntity.date}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Issues */}
                      {relationship.metadata?.issues && relationship.metadata.issues.length > 0 && (
                        <Alert className="mb-3">
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription className="text-xs">
                            {relationship.metadata.issues[0]}
                          </AlertDescription>
                        </Alert>
                      )}
                      
                      {/* Actions */}
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-gray-600">
                          Detected: {new Date(relationship.createdAt).toLocaleString()}
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleRejectRelationship(relationship.id)}
                          >
                            <Unlink className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                          <Button 
                            size="sm"
                            onClick={() => handleApproveRelationship(relationship.id)}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                  <p>No relationships pending review</p>
                  <p className="text-sm">All detected relationships have been processed</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Manual Links Tab */}
        <TabsContent value="manual-links">
          <Card>
            <CardHeader>
              <CardTitle>Manual Relationships</CardTitle>
              <CardDescription>
                User-created manual links between transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredRelationships
                  .filter(rel => rel.detectionMethod === 'user_manual')
                  .map((relationship) => (
                  <div key={relationship.id} className="border border-purple-200 bg-purple-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs bg-purple-100 text-purple-800">
                          {getRelationshipTypeLabel(relationship.type)}
                        </Badge>
                        {getStatusBadge(relationship.status)}
                      </div>
                      <div className="text-xs text-gray-600">
                        by {relationship.createdBy}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      {/* Parent Entity */}
                      <div className="flex items-center gap-2 flex-1">
                        {getEntityIcon(relationship.parentEntity.type)}
                        <div>
                          <div className="font-medium text-sm">{relationship.parentEntity.name}</div>
                          <div className="text-xs text-gray-500">
                            ${relationship.parentEntity.amount.toLocaleString()} • {relationship.parentEntity.date}
                          </div>
                        </div>
                      </div>
                      
                      {/* Arrow */}
                      <div className="flex items-center gap-1">
                        <Link2 className="h-4 w-4 text-purple-600" />
                        <ArrowRight className="h-4 w-4 text-gray-400" />
                      </div>
                      
                      {/* Child Entity */}
                      <div className="flex items-center gap-2 flex-1">
                        {getEntityIcon(relationship.childEntity.type)}
                        <div>
                          <div className="font-medium text-sm">{relationship.childEntity.name}</div>
                          <div className="text-xs text-gray-500">
                            ${relationship.childEntity.amount.toLocaleString()} • {relationship.childEntity.date}
                          </div>
                        </div>
                      </div>
                      
                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button variant="outline" size="sm">
                          <Unlink className="h-4 w-4 mr-1" />
                          Unlink
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {filteredRelationships.filter(rel => rel.detectionMethod === 'user_manual').length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Link2 className="h-12 w-12 mx-auto mb-4" />
                    <p>No manual relationships created</p>
                    <p className="text-sm">Create manual links between related transactions</p>
                    <Button className="mt-4">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Manual Link
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Visual Map Tab */}
        <TabsContent value="visual-map">
          <Card>
            <CardHeader>
              <CardTitle>Relationship Visual Map</CardTitle>
              <CardDescription>
                Interactive visualization of transaction relationships
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96 flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center text-gray-500">
                  <GitBranch className="h-16 w-16 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Visual Relationship Map</h3>
                  <p className="text-sm mb-4">
                    Interactive graph visualization would be implemented here
                  </p>
                  <p className="text-xs">
                    Showing connections between POs, GRs, Invoices, and Payments
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}