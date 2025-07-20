'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { 
  CheckSquare, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Clock,
  Eye,
  RefreshCw,
  FileText,
  Search,
  Filter,
  TrendingUp,
  AlertCircle,
  ShieldCheck,
  BarChart3,
  DollarSign,
  Calendar,
  User,
  Settings
} from 'lucide-react'
import ConfidenceIndicator from './ConfidenceIndicator'
import Link from 'next/link'

interface ThreeWayMatch {
  id: string
  invoiceId: string
  invoiceNumber: string
  invoiceAmount: number
  invoiceDate: string
  vendor: string
  
  purchaseOrder?: {
    id: string
    number: string
    amount: number
    date: string
  }
  
  goodsReceipt?: {
    id: string
    number: string
    amount: number
    date: string
    receivedQuantity: number
    orderedQuantity: number
  }
  
  validationResult: {
    status: 'passed' | 'warning' | 'failed' | 'pending' | 'overridden'
    confidence: number
    variance: {
      amount: number
      percentage: number
      acceptable: boolean
    }
    quantityVariance?: {
      variance: number
      percentage: number
      acceptable: boolean
    }
    issues: string[]
    recommendations: string[]
  }
  
  complianceChecks: {
    poExists: boolean
    grExists: boolean
    amountMatch: boolean
    quantityMatch: boolean
    vendorMatch: boolean
    dateSequence: boolean
  }
  
  auditTrail: Array<{
    action: string
    timestamp: string
    user: string
    details: string
  }>
  
  lastValidated: string
  nextReview?: string
  priority: 'high' | 'medium' | 'low'
  overrideReason?: string
  overriddenBy?: string
  overriddenAt?: string
}

interface ValidationStats {
  totalValidations: number
  passedValidations: number
  warningValidations: number
  failedValidations: number
  overriddenValidations: number
  averageVariance: number
  complianceRate: number
  pendingReview: number
}

export default function ThreeWayMatchCenter() {
  const [matches, setMatches] = useState<ThreeWayMatch[]>([])
  const [stats, setStats] = useState<ValidationStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterPriority, setFilterPriority] = useState<string>('all')
  const [selectedTab, setSelectedTab] = useState('pending')

  // Mock data - replace with real API calls
  useEffect(() => {
    const loadValidations = async () => {
      setLoading(true)
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setStats({
        totalValidations: 156,
        passedValidations: 142,
        warningValidations: 8,
        failedValidations: 4,
        overriddenValidations: 2,
        averageVariance: 1.2,
        complianceRate: 0.96,
        pendingReview: 12
      })

      setMatches([
        {
          id: '1',
          invoiceId: 'inv-2024-0847',
          invoiceNumber: 'INV-2024-0847',
          invoiceAmount: 1250.00,
          invoiceDate: '2024-01-18',
          vendor: 'ACME Corporation',
          purchaseOrder: {
            id: 'po-2024-0234',
            number: 'PO-2024-0234',
            amount: 1250.00,
            date: '2024-01-15'
          },
          goodsReceipt: {
            id: 'gr-2024-0456',
            number: 'GR-2024-0456',
            amount: 1250.00,
            date: '2024-01-16',
            receivedQuantity: 10,
            orderedQuantity: 10
          },
          validationResult: {
            status: 'passed',
            confidence: 0.98,
            variance: {
              amount: 0,
              percentage: 0,
              acceptable: true
            },
            quantityVariance: {
              variance: 0,
              percentage: 0,
              acceptable: true
            },
            issues: [],
            recommendations: ['Ready for payment processing', 'All validations passed']
          },
          complianceChecks: {
            poExists: true,
            grExists: true,
            amountMatch: true,
            quantityMatch: true,
            vendorMatch: true,
            dateSequence: true
          },
          auditTrail: [
            {
              action: 'Three-way match initiated',
              timestamp: '2024-01-18T10:32:30Z',
              user: 'system',
              details: 'Automatic validation triggered by invoice processing'
            },
            {
              action: 'Validation completed',
              timestamp: '2024-01-18T10:32:45Z',
              user: 'system',
              details: 'All checks passed with 98% confidence'
            }
          ],
          lastValidated: '2024-01-18T10:32:45Z',
          priority: 'low'
        },
        {
          id: '2',
          invoiceId: 'inv-2024-0851',
          invoiceNumber: 'INV-2024-0851',
          invoiceAmount: 875.50,
          invoiceDate: '2024-01-18',
          vendor: 'Supplier XYZ',
          purchaseOrder: {
            id: 'po-2024-0345',
            number: 'PO-2024-0345',
            amount: 852.30,
            date: '2024-01-17'
          },
          goodsReceipt: {
            id: 'gr-2024-0567',
            number: 'GR-2024-0567',
            amount: 852.30,
            date: '2024-01-18',
            receivedQuantity: 8,
            orderedQuantity: 10
          },
          validationResult: {
            status: 'warning',
            confidence: 0.76,
            variance: {
              amount: 23.20,
              percentage: 2.72,
              acceptable: false
            },
            quantityVariance: {
              variance: 2,
              percentage: 20,
              acceptable: false
            },
            issues: [
              'Amount variance exceeds 2% threshold: $23.20 (2.72%)',
              'Quantity variance: 2 units not received (20%)'
            ],
            recommendations: [
              'Review delivery documentation',
              'Verify partial delivery acceptance',
              'Consider manual approval for variance'
            ]
          },
          complianceChecks: {
            poExists: true,
            grExists: true,
            amountMatch: false,
            quantityMatch: false,
            vendorMatch: true,
            dateSequence: true
          },
          auditTrail: [
            {
              action: 'Three-way match initiated',
              timestamp: '2024-01-18T14:15:00Z',
              user: 'system',
              details: 'Automatic validation triggered'
            },
            {
              action: 'Validation warning',
              timestamp: '2024-01-18T14:15:15Z',
              user: 'system',
              details: 'Amount and quantity variances detected'
            }
          ],
          lastValidated: '2024-01-18T14:15:15Z',
          nextReview: '2024-01-19T14:15:15Z',
          priority: 'high'
        },
        {
          id: '3',
          invoiceId: 'inv-2024-0865',
          invoiceNumber: 'INV-2024-0865',
          invoiceAmount: 2100.00,
          invoiceDate: '2024-01-18',
          vendor: 'Tech Solutions Inc',
          purchaseOrder: {
            id: 'po-2024-0456',
            number: 'PO-2024-0456',
            amount: 2100.00,
            date: '2024-01-16'
          },
          validationResult: {
            status: 'failed',
            confidence: 0.45,
            variance: {
              amount: 0,
              percentage: 0,
              acceptable: true
            },
            issues: [
              'Goods receipt not found',
              'Cannot validate delivery completion',
              'Missing delivery documentation'
            ],
            recommendations: [
              'Locate and process goods receipt',
              'Verify delivery status with vendor',
              'Contact receiving department'
            ]
          },
          complianceChecks: {
            poExists: true,
            grExists: false,
            amountMatch: true,
            quantityMatch: false,
            vendorMatch: true,
            dateSequence: false
          },
          auditTrail: [
            {
              action: 'Three-way match initiated',
              timestamp: '2024-01-18T16:20:00Z',
              user: 'system',
              details: 'Automatic validation triggered'
            },
            {
              action: 'Validation failed',
              timestamp: '2024-01-18T16:20:10Z',
              user: 'system',
              details: 'Goods receipt not found in system'
            }
          ],
          lastValidated: '2024-01-18T16:20:10Z',
          nextReview: '2024-01-19T08:00:00Z',
          priority: 'high'
        },
        {
          id: '4',
          invoiceId: 'inv-2024-0823',
          invoiceNumber: 'INV-2024-0823',
          invoiceAmount: 450.75,
          invoiceDate: '2024-01-17',
          vendor: 'Office Supplies Co',
          purchaseOrder: {
            id: 'po-2024-0289',
            number: 'PO-2024-0289',
            amount: 567.89,
            date: '2024-01-16'
          },
          goodsReceipt: {
            id: 'gr-2024-0445',
            number: 'GR-2024-0445',
            amount: 567.89,
            date: '2024-01-17',
            receivedQuantity: 15,
            orderedQuantity: 15
          },
          validationResult: {
            status: 'overridden',
            confidence: 0.67,
            variance: {
              amount: 117.14,
              percentage: 20.6,
              acceptable: false
            },
            issues: [
              'Significant amount variance: $117.14 (20.6%)',
              'Invoice amount lower than PO/GR'
            ],
            recommendations: [
              'Override approved due to partial delivery acceptance',
              'Vendor credit applied for undelivered items'
            ]
          },
          complianceChecks: {
            poExists: true,
            grExists: true,
            amountMatch: false,
            quantityMatch: true,
            vendorMatch: true,
            dateSequence: true
          },
          auditTrail: [
            {
              action: 'Three-way match initiated',
              timestamp: '2024-01-17T11:30:00Z',
              user: 'system',
              details: 'Automatic validation triggered'
            },
            {
              action: 'Validation failed',
              timestamp: '2024-01-17T11:30:15Z',
              user: 'system',
              details: 'Amount variance exceeds threshold'
            },
            {
              action: 'Manual override approved',
              timestamp: '2024-01-17T14:45:00Z',
              user: 'jane.smith@company.com',
              details: 'Override approved - partial delivery with vendor credit'
            }
          ],
          lastValidated: '2024-01-17T14:45:00Z',
          priority: 'medium',
          overrideReason: 'Partial delivery with vendor credit applied',
          overriddenBy: 'jane.smith@company.com',
          overriddenAt: '2024-01-17T14:45:00Z'
        }
      ])
      
      setLoading(false)
    }

    loadValidations()
  }, [])

  const filteredMatches = matches.filter(match => {
    const matchesSearch = match.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         match.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         match.purchaseOrder?.number.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = filterStatus === 'all' || match.validationResult.status === filterStatus
    const matchesPriority = filterPriority === 'all' || match.priority === filterPriority
    
    return matchesSearch && matchesStatus && matchesPriority
  })

  const getStatusBadge = (status: ThreeWayMatch['validationResult']['status']) => {
    switch (status) {
      case 'passed':
        return <Badge className="bg-green-100 text-green-800 border-green-300">
          <CheckCircle className="w-3 h-3 mr-1" />
          Passed
        </Badge>
      case 'warning':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
          <AlertTriangle className="w-3 h-3 mr-1" />
          Warning
        </Badge>
      case 'failed':
        return <Badge className="bg-red-100 text-red-800 border-red-300">
          <XCircle className="w-3 h-3 mr-1" />
          Failed
        </Badge>
      case 'pending':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-300">
          <Clock className="w-3 h-3 mr-1" />
          Pending
        </Badge>
      case 'overridden':
        return <Badge className="bg-purple-100 text-purple-800 border-purple-300">
          <ShieldCheck className="w-3 h-3 mr-1" />
          Overridden
        </Badge>
    }
  }

  const getPriorityBadge = (priority: ThreeWayMatch['priority']) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive" className="text-xs">High</Badge>
      case 'medium':
        return <Badge variant="secondary" className="text-xs">Medium</Badge>
      case 'low':
        return <Badge variant="outline" className="text-xs">Low</Badge>
    }
  }

  const getComplianceScore = (checks: ThreeWayMatch['complianceChecks']) => {
    const totalChecks = Object.keys(checks).length
    const passedChecks = Object.values(checks).filter(Boolean).length
    return (passedChecks / totalChecks) * 100
  }

  const handleOverride = async (matchId: string, reason: string) => {
    setMatches(prev => prev.map(match => 
      match.id === matchId ? {
        ...match,
        validationResult: { ...match.validationResult, status: 'overridden' as const },
        overrideReason: reason,
        overriddenBy: 'current.user@company.com',
        overriddenAt: new Date().toISOString()
      } : match
    ))
  }

  const handleRevalidate = async (matchId: string) => {
    // Trigger revalidation
    console.log('Revalidating match:', matchId)
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
              <CheckSquare className="h-8 w-8 text-white" />
            </div>
            Three-Way Match Validation
          </h1>
          <p className="text-gray-600">
            Automated validation of Purchase Order → Goods Receipt → Invoice chains
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
            <RefreshCw className="w-4 h-4 mr-1" />
            Auto-Validation Active
          </Badge>
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Configure Thresholds
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Validations</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalValidations}</div>
            <p className="text-xs text-muted-foreground">
              All time validations
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pass Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(((stats?.passedValidations || 0) / (stats?.totalValidations || 1)) * 100)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Successful validations
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
              Require attention
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Variance</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.averageVariance}%</div>
            <p className="text-xs text-muted-foreground">
              Amount variance
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
                  placeholder="Search by invoice, PO number, or vendor..."
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
                <option value="passed">Passed</option>
                <option value="warning">Warning</option>
                <option value="failed">Failed</option>
                <option value="pending">Pending</option>
                <option value="overridden">Overridden</option>
              </select>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">All Priority</option>
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">
            Pending Validation
            {stats?.pendingReview && stats.pendingReview > 0 && (
              <Badge variant="secondary" className="ml-2 h-5 px-1">
                {stats.pendingReview}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="warnings">Warnings</TabsTrigger>
          <TabsTrigger value="failures">Failures</TabsTrigger>
          <TabsTrigger value="overrides">Overrides</TabsTrigger>
          <TabsTrigger value="all">All Validations</TabsTrigger>
        </TabsList>

        {/* Pending Validation Tab */}
        <TabsContent value="pending">
          <div className="space-y-4">
            {filteredMatches
              .filter(match => match.validationResult.status === 'warning' || match.validationResult.status === 'failed')
              .map((match) => (
              <Card key={match.id} className="border-l-4 border-l-yellow-500">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{match.invoiceNumber}</CardTitle>
                      <CardDescription className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          ${match.invoiceAmount.toLocaleString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {match.invoiceDate}
                        </span>
                        <span>{match.vendor}</span>
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {getPriorityBadge(match.priority)}
                      {getStatusBadge(match.validationResult.status)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Validation Chain */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="h-4 w-4 text-blue-600" />
                        <span className="font-medium text-sm">Purchase Order</span>
                      </div>
                      {match.purchaseOrder ? (
                        <div className="space-y-1">
                          <div className="font-medium">{match.purchaseOrder.number}</div>
                          <div className="text-sm text-gray-600">${match.purchaseOrder.amount.toLocaleString()}</div>
                          <div className="text-xs text-gray-500">{match.purchaseOrder.date}</div>
                        </div>
                      ) : (
                        <div className="text-sm text-red-600">Not found</div>
                      )}
                    </div>
                    
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="font-medium text-sm">Goods Receipt</span>
                      </div>
                      {match.goodsReceipt ? (
                        <div className="space-y-1">
                          <div className="font-medium">{match.goodsReceipt.number}</div>
                          <div className="text-sm text-gray-600">${match.goodsReceipt.amount.toLocaleString()}</div>
                          <div className="text-xs text-gray-500">{match.goodsReceipt.date}</div>
                          <div className="text-xs text-gray-500">
                            Qty: {match.goodsReceipt.receivedQuantity}/{match.goodsReceipt.orderedQuantity}
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm text-red-600">Not found</div>
                      )}
                    </div>
                    
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="h-4 w-4 text-purple-600" />
                        <span className="font-medium text-sm">Invoice</span>
                      </div>
                      <div className="space-y-1">
                        <div className="font-medium">{match.invoiceNumber}</div>
                        <div className="text-sm text-gray-600">${match.invoiceAmount.toLocaleString()}</div>
                        <div className="text-xs text-gray-500">{match.invoiceDate}</div>
                      </div>
                    </div>
                  </div>

                  {/* Variance Information */}
                  {match.validationResult.variance && !match.validationResult.variance.acceptable && (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <div className="space-y-1">
                          <div className="font-medium">Amount Variance Detected</div>
                          <div className="text-sm">
                            Variance: ${Math.abs(match.validationResult.variance.amount).toFixed(2)} 
                            ({Math.abs(match.validationResult.variance.percentage).toFixed(1)}%)
                          </div>
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Compliance Checks */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Compliance Score</span>
                      <span className="text-sm font-bold">{getComplianceScore(match.complianceChecks).toFixed(0)}%</span>
                    </div>
                    <Progress value={getComplianceScore(match.complianceChecks)} className="h-2" />
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                      <div className={`flex items-center gap-1 ${match.complianceChecks.poExists ? 'text-green-600' : 'text-red-600'}`}>
                        {match.complianceChecks.poExists ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                        PO Exists
                      </div>
                      <div className={`flex items-center gap-1 ${match.complianceChecks.grExists ? 'text-green-600' : 'text-red-600'}`}>
                        {match.complianceChecks.grExists ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                        GR Exists
                      </div>
                      <div className={`flex items-center gap-1 ${match.complianceChecks.amountMatch ? 'text-green-600' : 'text-red-600'}`}>
                        {match.complianceChecks.amountMatch ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                        Amount Match
                      </div>
                      <div className={`flex items-center gap-1 ${match.complianceChecks.quantityMatch ? 'text-green-600' : 'text-red-600'}`}>
                        {match.complianceChecks.quantityMatch ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                        Quantity Match
                      </div>
                      <div className={`flex items-center gap-1 ${match.complianceChecks.vendorMatch ? 'text-green-600' : 'text-red-600'}`}>
                        {match.complianceChecks.vendorMatch ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                        Vendor Match
                      </div>
                      <div className={`flex items-center gap-1 ${match.complianceChecks.dateSequence ? 'text-green-600' : 'text-red-600'}`}>
                        {match.complianceChecks.dateSequence ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                        Date Sequence
                      </div>
                    </div>
                  </div>

                  {/* Issues */}
                  {match.validationResult.issues.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-red-600">Issues Detected:</div>
                      <div className="space-y-1">
                        {match.validationResult.issues.map((issue, index) => (
                          <div key={index} className="text-sm bg-red-50 border border-red-200 rounded p-2 flex items-start gap-2">
                            <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                            {issue}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recommendations */}
                  {match.validationResult.recommendations.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-blue-600">Recommendations:</div>
                      <div className="space-y-1">
                        {match.validationResult.recommendations.map((recommendation, index) => (
                          <div key={index} className="text-sm bg-blue-50 border border-blue-200 rounded p-2 flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                            {recommendation}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center gap-2">
                      <ConfidenceIndicator confidence={match.validationResult.confidence} size="sm" />
                      <span className="text-xs text-gray-500">
                        Last validated: {new Date(match.lastValidated).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleRevalidate(match.id)}>
                        <RefreshCw className="h-4 w-4 mr-1" />
                        Revalidate
                      </Button>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                      {match.validationResult.status === 'warning' && (
                        <Button 
                          size="sm"
                          onClick={() => handleOverride(match.id, 'Manual approval for variance')}
                        >
                          <ShieldCheck className="h-4 w-4 mr-1" />
                          Override
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Other tabs would have similar structure with different filters */}
        <TabsContent value="warnings">
          <Card>
            <CardHeader>
              <CardTitle>Validation Warnings</CardTitle>
              <CardDescription>
                Validations with warnings that may require attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-yellow-500" />
                <p>Filter content for warnings would be displayed here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="failures">
          <Card>
            <CardHeader>
              <CardTitle>Validation Failures</CardTitle>
              <CardDescription>
                Validations that failed and require immediate attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <XCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
                <p>Filter content for failures would be displayed here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="overrides">
          <Card>
            <CardHeader>
              <CardTitle>Manual Overrides</CardTitle>
              <CardDescription>
                Validations that have been manually overridden
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <ShieldCheck className="h-12 w-12 mx-auto mb-4 text-purple-500" />
                <p>Filter content for overrides would be displayed here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>All Validations</CardTitle>
              <CardDescription>
                Complete list of three-way match validations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <CheckSquare className="h-12 w-12 mx-auto mb-4" />
                <p>All validations would be displayed here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}