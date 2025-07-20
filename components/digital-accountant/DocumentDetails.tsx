'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  FileText, 
  Download, 
  Eye, 
  Edit,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Brain,
  GitBranch,
  Clock,
  User,
  Calendar,
  DollarSign,
  Building,
  Hash,
  ArrowLeft,
  Play,
  Trash2
} from 'lucide-react'
import Link from 'next/link'
import ConfidenceIndicator from './ConfidenceIndicator'

interface DocumentDetailsProps {
  documentId: string
}

interface DocumentDetail {
  id: string
  filename: string
  type: 'invoice' | 'purchase_order' | 'receipt' | 'contract' | 'other'
  size: number
  status: 'uploading' | 'processing' | 'completed' | 'failed' | 'pending_review'
  confidence?: number
  uploadedAt: string
  processedAt?: string
  uploadedBy?: string
  extractedData?: {
    amount?: number
    vendor?: string
    vendorAddress?: string
    date?: string
    dueDate?: string
    invoiceNumber?: string
    poNumber?: string
    lineItems?: Array<{
      description: string
      quantity: number
      unitPrice: number
      total: number
    }>
  }
  aiAnalysis?: {
    documentType: string
    confidence: number
    suggestions: string[]
    issues?: string[]
    processingTime: number
    modelVersion: string
  }
  relationships?: Array<{
    id: string
    type: 'linked_po' | 'linked_gr' | 'linked_invoice' | 'linked_payment'
    targetId: string
    targetName: string
    confidence: number
    createdAt: string
  }>
  auditTrail?: Array<{
    action: string
    timestamp: string
    user: string
    details: string
  }>
}

export default function DocumentDetails({ documentId }: DocumentDetailsProps) {
  const [document, setDocument] = useState<DocumentDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [isReprocessing, setIsReprocessing] = useState(false)

  // Mock data - replace with real API calls
  useEffect(() => {
    const loadDocument = async () => {
      setLoading(true)
      await new Promise(resolve => setTimeout(resolve, 800))
      
      setDocument({
        id: documentId,
        filename: 'invoice_acme_corp_001.pdf',
        type: 'invoice',
        size: 245760,
        status: 'completed',
        confidence: 0.96,
        uploadedAt: '2024-01-18T10:30:00Z',
        processedAt: '2024-01-18T10:32:15Z',
        uploadedBy: 'john.doe@company.com',
        extractedData: {
          amount: 1250.00,
          vendor: 'ACME Corporation',
          vendorAddress: '123 Business St, City, ST 12345',
          date: '2024-01-15',
          dueDate: '2024-02-14',
          invoiceNumber: 'INV-2024-0847',
          poNumber: 'PO-2024-0234',
          lineItems: [
            {
              description: 'Professional Services - Q1 2024',
              quantity: 1,
              unitPrice: 1000.00,
              total: 1000.00
            },
            {
              description: 'Consulting Hours',
              quantity: 10,
              unitPrice: 25.00,
              total: 250.00
            }
          ]
        },
        aiAnalysis: {
          documentType: 'Vendor Invoice',
          confidence: 0.96,
          suggestions: [
            'Ready for three-way match validation',
            'Vendor found in system',
            'PO number detected and verified'
          ],
          issues: [],
          processingTime: 2.3,
          modelVersion: 'v2.1.5'
        },
        relationships: [
          {
            id: '1',
            type: 'linked_po',
            targetId: 'po-2024-0234',
            targetName: 'PO-2024-0234',
            confidence: 0.98,
            createdAt: '2024-01-18T10:32:20Z'
          },
          {
            id: '2',
            type: 'linked_gr',
            targetId: 'gr-2024-0456',
            targetName: 'GR-2024-0456',
            confidence: 0.92,
            createdAt: '2024-01-18T10:32:25Z'
          }
        ],
        auditTrail: [
          {
            action: 'Document uploaded',
            timestamp: '2024-01-18T10:30:00Z',
            user: 'john.doe@company.com',
            details: 'File uploaded via web interface'
          },
          {
            action: 'AI processing started',
            timestamp: '2024-01-18T10:30:05Z',
            user: 'system',
            details: 'Document queued for AI analysis'
          },
          {
            action: 'Text extraction completed',
            timestamp: '2024-01-18T10:31:30Z',
            user: 'system',
            details: 'OCR and text recognition completed with 98% confidence'
          },
          {
            action: 'Data classification completed',
            timestamp: '2024-01-18T10:32:15Z',
            user: 'system',
            details: 'Document classified as vendor invoice with 96% confidence'
          },
          {
            action: 'Relationships detected',
            timestamp: '2024-01-18T10:32:25Z',
            user: 'system',
            details: 'Auto-linked to PO-2024-0234 and GR-2024-0456'
          }
        ]
      })
      
      setLoading(false)
    }

    loadDocument()
  }, [documentId])

  const handleReprocess = async () => {
    setIsReprocessing(true)
    await new Promise(resolve => setTimeout(resolve, 3000))
    setIsReprocessing(false)
    // Reload document data
  }

  const getStatusBadge = (status: DocumentDetail['status']) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 border-green-300">
          <CheckCircle className="w-3 h-3 mr-1" />
          Completed
        </Badge>
      case 'processing':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-300">
          <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
          Processing
        </Badge>
      case 'pending_review':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
          <Clock className="w-3 h-3 mr-1" />
          Pending Review
        </Badge>
      case 'failed':
        return <Badge className="bg-red-100 text-red-800 border-red-300">
          <AlertTriangle className="w-3 h-3 mr-1" />
          Failed
        </Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getRelationshipIcon = (type: string) => {
    switch (type) {
      case 'linked_po':
        return <FileText className="h-4 w-4 text-blue-600" />
      case 'linked_gr':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'linked_invoice':
        return <FileText className="h-4 w-4 text-purple-600" />
      case 'linked_payment':
        return <DollarSign className="h-4 w-4 text-orange-600" />
      default:
        return <GitBranch className="h-4 w-4 text-gray-600" />
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
          <div className="h-48 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!document) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="text-center py-12">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-red-500" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Document not found</h3>
            <p className="text-gray-600 mb-4">The requested document could not be found.</p>
            <Button asChild>
              <Link href="/digital-accountant/documents">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Documents
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/digital-accountant/documents">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Documents
              </Link>
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg">
              <FileText className="h-8 w-8 text-white" />
            </div>
            {document.filename}
          </h1>
          <p className="text-gray-600">
            Document details and AI analysis results
          </p>
        </div>
        <div className="flex items-center gap-2">
          {getStatusBadge(document.status)}
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          <Button variant="outline" size="sm">
            <Eye className="h-4 w-4 mr-2" />
            View
          </Button>
        </div>
      </div>

      {/* Document Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Document Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <div className="text-sm text-gray-600">File Size</div>
              <div className="font-medium">{formatFileSize(document.size)}</div>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-gray-600">Document Type</div>
              <Badge variant="outline" className="capitalize">
                {document.type.replace('_', ' ')}
              </Badge>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-gray-600">Uploaded By</div>
              <div className="font-medium flex items-center gap-1">
                <User className="h-4 w-4 text-gray-500" />
                {document.uploadedBy}
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-gray-600">Upload Date</div>
              <div className="font-medium flex items-center gap-1">
                <Calendar className="h-4 w-4 text-gray-500" />
                {new Date(document.uploadedAt).toLocaleString()}
              </div>
            </div>
          </div>

          {document.confidence && (
            <div className="mt-6 pt-6 border-t">
              <ConfidenceIndicator 
                confidence={document.confidence} 
                variant="detailed" 
                size="lg"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="extracted-data" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="extracted-data">Extracted Data</TabsTrigger>
          <TabsTrigger value="ai-analysis">AI Analysis</TabsTrigger>
          <TabsTrigger value="relationships">Relationships</TabsTrigger>
          <TabsTrigger value="audit-trail">Audit Trail</TabsTrigger>
          <TabsTrigger value="actions">Actions</TabsTrigger>
        </TabsList>

        {/* Extracted Data Tab */}
        <TabsContent value="extracted-data">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Document Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {document.extractedData?.invoiceNumber && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 flex items-center gap-2">
                      <Hash className="h-4 w-4" />
                      Invoice Number
                    </span>
                    <span className="font-medium">{document.extractedData.invoiceNumber}</span>
                  </div>
                )}
                {document.extractedData?.poNumber && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">PO Number</span>
                    <span className="font-medium">{document.extractedData.poNumber}</span>
                  </div>
                )}
                {document.extractedData?.date && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Document Date</span>
                    <span className="font-medium">{document.extractedData.date}</span>
                  </div>
                )}
                {document.extractedData?.dueDate && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Due Date</span>
                    <span className="font-medium">{document.extractedData.dueDate}</span>
                  </div>
                )}
                {document.extractedData?.amount && (
                  <div className="flex items-center justify-between border-t pt-4">
                    <span className="text-gray-600 flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Total Amount
                    </span>
                    <span className="font-bold text-lg text-green-600">
                      ${document.extractedData.amount.toLocaleString()}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Vendor Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {document.extractedData?.vendor && (
                  <div>
                    <div className="text-gray-600 flex items-center gap-2 mb-1">
                      <Building className="h-4 w-4" />
                      Vendor Name
                    </div>
                    <div className="font-medium">{document.extractedData.vendor}</div>
                  </div>
                )}
                {document.extractedData?.vendorAddress && (
                  <div>
                    <div className="text-gray-600 mb-1">Address</div>
                    <div className="font-medium text-sm">{document.extractedData.vendorAddress}</div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Line Items */}
          {document.extractedData?.lineItems && document.extractedData.lineItems.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Line Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead className="border-b">
                      <tr>
                        <th className="text-left p-3 font-medium">Description</th>
                        <th className="text-right p-3 font-medium">Quantity</th>
                        <th className="text-right p-3 font-medium">Unit Price</th>
                        <th className="text-right p-3 font-medium">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {document.extractedData.lineItems.map((item, index) => (
                        <tr key={index} className="border-b">
                          <td className="p-3">{item.description}</td>
                          <td className="p-3 text-right">{item.quantity}</td>
                          <td className="p-3 text-right">${item.unitPrice.toFixed(2)}</td>
                          <td className="p-3 text-right font-medium">${item.total.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* AI Analysis Tab */}
        <TabsContent value="ai-analysis">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  AI Processing Results
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <div className="text-gray-600 mb-1">Document Classification</div>
                      <div className="font-medium">{document.aiAnalysis?.documentType}</div>
                    </div>
                    <div>
                      <div className="text-gray-600 mb-1">Processing Time</div>
                      <div className="font-medium">{document.aiAnalysis?.processingTime}s</div>
                    </div>
                    <div>
                      <div className="text-gray-600 mb-1">Model Version</div>
                      <div className="font-medium">{document.aiAnalysis?.modelVersion}</div>
                    </div>
                  </div>
                  <div>
                    {document.confidence && (
                      <ConfidenceIndicator 
                        confidence={document.confidence} 
                        variant="detailed"
                      />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* AI Suggestions */}
            {document.aiAnalysis?.suggestions && document.aiAnalysis.suggestions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>AI Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {document.aiAnalysis.suggestions.map((suggestion, index) => (
                      <div key={index} className="flex items-start gap-2 p-2 bg-green-50 border border-green-200 rounded">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-green-800">{suggestion}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* AI Issues */}
            {document.aiAnalysis?.issues && document.aiAnalysis.issues.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Identified Issues</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {document.aiAnalysis.issues.map((issue, index) => (
                      <Alert key={index}>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>{issue}</AlertDescription>
                      </Alert>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Relationships Tab */}
        <TabsContent value="relationships">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GitBranch className="h-5 w-5" />
                Related Transactions
              </CardTitle>
              <CardDescription>
                Automatically detected relationships with other documents and transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {document.relationships && document.relationships.length > 0 ? (
                <div className="space-y-4">
                  {document.relationships.map((relationship) => (
                    <div key={relationship.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        {getRelationshipIcon(relationship.type)}
                        <div>
                          <div className="font-medium">{relationship.targetName}</div>
                          <div className="text-sm text-gray-600 capitalize">
                            {relationship.type.replace('_', ' ').replace('linked ', '')}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <ConfidenceIndicator confidence={relationship.confidence} size="sm" />
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <GitBranch className="h-12 w-12 mx-auto mb-4" />
                  <p>No relationships detected</p>
                  <p className="text-sm">This document has not been linked to other transactions</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audit Trail Tab */}
        <TabsContent value="audit-trail">
          <Card>
            <CardHeader>
              <CardTitle>Processing History</CardTitle>
              <CardDescription>
                Complete audit trail of document processing steps
              </CardDescription>
            </CardHeader>
            <CardContent>
              {document.auditTrail && (
                <div className="space-y-4">
                  {document.auditTrail.map((entry, index) => (
                    <div key={index} className="flex items-start gap-3 pb-4 last:pb-0 border-b last:border-b-0">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <div className="font-medium">{entry.action}</div>
                          <div className="text-xs text-gray-500">
                            {new Date(entry.timestamp).toLocaleString()}
                          </div>
                        </div>
                        <div className="text-sm text-gray-600 mb-1">{entry.details}</div>
                        <div className="text-xs text-gray-500">by {entry.user}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Actions Tab */}
        <TabsContent value="actions">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Document Actions</CardTitle>
                <CardDescription>
                  Available actions for this document
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Button variant="outline" className="justify-start">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Reprocess Document
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Extracted Data
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <GitBranch className="h-4 w-4 mr-2" />
                    Link to Transaction
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve for Processing
                  </Button>
                </div>
              </CardContent>
            </Card>

            {document.status === 'failed' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-600">
                    <AlertTriangle className="h-5 w-5" />
                    Processing Failed
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-600">
                    The document processing failed. You can try reprocessing or contact support for assistance.
                  </p>
                  <div className="flex gap-2">
                    <Button 
                      onClick={handleReprocess}
                      disabled={isReprocessing}
                      className="flex items-center gap-2"
                    >
                      {isReprocessing ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                      {isReprocessing ? 'Reprocessing...' : 'Retry Processing'}
                    </Button>
                    <Button variant="destructive" className="flex items-center gap-2">
                      <Trash2 className="h-4 w-4" />
                      Delete Document
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}