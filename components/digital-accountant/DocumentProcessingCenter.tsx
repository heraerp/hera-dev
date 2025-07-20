'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Upload, 
  FileText, 
  Image,
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Brain,
  Eye,
  Download,
  Filter,
  Search,
  RefreshCw,
  Trash2,
  MoreVertical,
  Play
} from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import DocumentUploader from './DocumentUploader'
import ConfidenceIndicator from './ConfidenceIndicator'
import Link from 'next/link'

interface Document {
  id: string
  filename: string
  type: 'invoice' | 'purchase_order' | 'receipt' | 'contract' | 'other'
  size: number
  status: 'uploading' | 'processing' | 'completed' | 'failed' | 'pending_review'
  confidence?: number
  uploadedAt: string
  processedAt?: string
  extractedData?: {
    amount?: number
    vendor?: string
    date?: string
    invoiceNumber?: string
    poNumber?: string
  }
  aiAnalysis?: {
    documentType: string
    confidence: number
    suggestions: string[]
    issues?: string[]
  }
}

interface ProcessingQueue {
  totalFiles: number
  processed: number
  currentFile?: string
  estimatedTimeRemaining: number
}

export default function DocumentProcessingCenter() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [processingQueue, setProcessingQueue] = useState<ProcessingQueue | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterType, setFilterType] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)

  // Mock data - replace with real API calls
  useEffect(() => {
    const loadDocuments = async () => {
      setLoading(true)
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setDocuments([
        {
          id: '1',
          filename: 'invoice_acme_corp_001.pdf',
          type: 'invoice',
          size: 245760,
          status: 'completed',
          confidence: 0.96,
          uploadedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          processedAt: new Date(Date.now() - 1000 * 60 * 28).toISOString(),
          extractedData: {
            amount: 1250.00,
            vendor: 'ACME Corporation',
            date: '2024-01-15',
            invoiceNumber: 'INV-2024-0847'
          },
          aiAnalysis: {
            documentType: 'Vendor Invoice',
            confidence: 0.96,
            suggestions: ['Ready for three-way match validation', 'Vendor found in system'],
            issues: []
          }
        },
        {
          id: '2',
          filename: 'po_supplier_xyz_456.pdf',
          type: 'purchase_order',
          size: 189440,
          status: 'completed',
          confidence: 0.89,
          uploadedAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
          processedAt: new Date(Date.now() - 1000 * 60 * 42).toISOString(),
          extractedData: {
            amount: 850.00,
            vendor: 'Supplier XYZ',
            date: '2024-01-14',
            poNumber: 'PO-2024-0234'
          },
          aiAnalysis: {
            documentType: 'Purchase Order',
            confidence: 0.89,
            suggestions: ['Link to goods receipt when available'],
            issues: ['Minor formatting variations detected']
          }
        },
        {
          id: '3',
          filename: 'receipt_office_supplies.jpg',
          type: 'receipt',
          size: 98304,
          status: 'pending_review',
          confidence: 0.72,
          uploadedAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
          processedAt: new Date(Date.now() - 1000 * 60 * 14).toISOString(),
          extractedData: {
            amount: 67.45,
            vendor: 'Office Depot',
            date: '2024-01-18'
          },
          aiAnalysis: {
            documentType: 'Receipt',
            confidence: 0.72,
            suggestions: ['Manual review recommended'],
            issues: ['Low image quality', 'Partial text recognition']
          }
        },
        {
          id: '4',
          filename: 'contract_legal_services.pdf',
          type: 'contract',
          size: 512000,
          status: 'processing',
          uploadedAt: new Date(Date.now() - 1000 * 60 * 5).toISOString()
        },
        {
          id: '5',
          filename: 'expense_report_travel.pdf',
          type: 'other',
          size: 156789,
          status: 'failed',
          uploadedAt: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
          aiAnalysis: {
            documentType: 'Unknown',
            confidence: 0.23,
            suggestions: [],
            issues: ['Document format not supported', 'Unable to extract text']
          }
        }
      ])
      
      // Also save initial processed documents to localStorage
      const initialProcessedDocs = [
        {
          id: '1',
          filename: 'invoice_acme_123.pdf',
          type: 'invoice',
          size: 245760,
          status: 'completed',
          confidence: 0.96,
          uploadedAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
          processedAt: new Date(Date.now() - 1000 * 60 * 58).toISOString(),
          extractedData: {
            amount: 1234.56,
            vendor: 'ACME Corporation',
            date: '2024-01-15',
            invoiceNumber: 'INV-2024-0847'
          },
          aiAnalysis: {
            documentType: 'Vendor Invoice',
            confidence: 0.96,
            suggestions: ['Ready for three-way match validation', 'Vendor found in system'],
            issues: []
          }
        },
        {
          id: '2',
          filename: 'po_supplier_xyz_456.pdf',
          type: 'purchase_order',
          size: 189440,
          status: 'completed',
          confidence: 0.89,
          uploadedAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
          processedAt: new Date(Date.now() - 1000 * 60 * 42).toISOString(),
          extractedData: {
            amount: 850.00,
            vendor: 'Supplier XYZ',
            date: '2024-01-14',
            poNumber: 'PO-2024-0234'
          },
          aiAnalysis: {
            documentType: 'Purchase Order',
            confidence: 0.89,
            suggestions: ['Link to goods receipt when available'],
            issues: ['Minor formatting variations detected']
          }
        }
      ]
      
      // Get existing processed documents from localStorage
      const existingProcessed = localStorage.getItem('processedDocuments')
      const existingDocs = existingProcessed ? JSON.parse(existingProcessed) : []
      
      // Merge with initial docs (avoiding duplicates)
      const allProcessedDocs = [...initialProcessedDocs, ...existingDocs.filter((doc: any) => 
        !initialProcessedDocs.find(initial => initial.id === doc.id)
      )]
      
      localStorage.setItem('processedDocuments', JSON.stringify(allProcessedDocs))
      
      setLoading(false)
    }

    loadDocuments()
  }, [])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setIsUploading(true)
    
    // Simulate upload and processing
    acceptedFiles.forEach((file) => {
      const newDoc: Document = {
        id: `temp-${Date.now()}-${Math.random()}`,
        filename: file.name,
        type: detectDocumentType(file.name),
        size: file.size,
        status: 'uploading',
        uploadedAt: new Date().toISOString()
      }
      
      setDocuments(prev => [newDoc, ...prev])
      
      // Simulate upload progress
      setTimeout(() => {
        setDocuments(prev => prev.map(doc => 
          doc.id === newDoc.id ? { ...doc, status: 'pending_review' } : doc
        ))
      }, 1000)
    })
    
    setIsUploading(false)
  }, [])

  const detectDocumentType = (filename: string): Document['type'] => {
    const lower = filename.toLowerCase()
    if (lower.includes('invoice') || lower.includes('inv-')) return 'invoice'
    if (lower.includes('purchase') || lower.includes('po-')) return 'purchase_order'
    if (lower.includes('receipt')) return 'receipt'
    if (lower.includes('contract')) return 'contract'
    return 'other'
  }

  const processDocument = useCallback((docId: string) => {
    setDocuments(prev => prev.map(doc => 
      doc.id === docId ? { ...doc, status: 'processing' } : doc
    ))
    
    // Simulate AI processing
    setTimeout(() => {
      setDocuments(prev => {
        const updatedDocs = prev.map(doc => 
          doc.id === docId ? {
            ...doc,
            status: 'completed',
            confidence: 0.85 + Math.random() * 0.15,
            processedAt: new Date().toISOString(),
            extractedData: generateMockExtractedData(doc.type),
            aiAnalysis: {
              documentType: getDocumentTypeLabel(doc.type),
              confidence: 0.85 + Math.random() * 0.15,
              suggestions: generateSuggestions(doc.type),
              issues: []
            }
          } : doc
        )
        
        // Save processed documents to localStorage for journal entry creation
        const processedDocs = updatedDocs.filter(doc => doc.status === 'completed')
        localStorage.setItem('processedDocuments', JSON.stringify(processedDocs))
        
        return updatedDocs
      })
    }, 2000)
  }, [])

  const generateMockExtractedData = (type: Document['type']) => {
    switch (type) {
      case 'invoice':
        return {
          amount: Math.floor(Math.random() * 5000) + 100,
          vendor: ['ACME Corp', 'Global Supplies Inc', 'Tech Solutions Ltd'][Math.floor(Math.random() * 3)],
          date: new Date().toISOString().split('T')[0],
          invoiceNumber: `INV-${Date.now()}`
        }
      case 'purchase_order':
        return {
          amount: Math.floor(Math.random() * 10000) + 500,
          vendor: ['Supplier A', 'Vendor B', 'Partner C'][Math.floor(Math.random() * 3)],
          date: new Date().toISOString().split('T')[0],
          poNumber: `PO-${Date.now()}`
        }
      default:
        return {
          amount: Math.floor(Math.random() * 1000) + 50
        }
    }
  }

  const getDocumentTypeLabel = (type: Document['type']) => {
    switch (type) {
      case 'invoice': return 'Vendor Invoice'
      case 'purchase_order': return 'Purchase Order'
      case 'receipt': return 'Receipt'
      case 'contract': return 'Contract'
      default: return 'Document'
    }
  }

  const generateSuggestions = (type: Document['type']) => {
    switch (type) {
      case 'invoice':
        return ['Ready for three-way match validation', 'Vendor found in system', 'Amount within normal range']
      case 'purchase_order':
        return ['Link to goods receipt when available', 'Approval workflow completed']
      default:
        return ['Review extracted data', 'Verify classification']
    }
  }

  const filteredDocuments = (documents || []).filter(doc => {
    const matchesSearch = doc.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.extractedData?.vendor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.extractedData?.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = filterStatus === 'all' || doc.status === filterStatus
    const matchesType = filterType === 'all' || doc.type === filterType
    
    return matchesSearch && matchesStatus && matchesType
  })

  const getStatusBadge = (status: Document['status']) => {
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
      case 'uploading':
        return <Badge className="bg-purple-100 text-purple-800 border-purple-300">
          <Upload className="w-3 h-3 mr-1" />
          Uploading
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
    }
  }

  const getTypeIcon = (type: Document['type']) => {
    switch (type) {
      case 'invoice':
        return <FileText className="h-4 w-4 text-blue-600" />
      case 'purchase_order':
        return <FileText className="h-4 w-4 text-green-600" />
      case 'receipt':
        return <Image className="h-4 w-4 text-purple-600" />
      case 'contract':
        return <FileText className="h-4 w-4 text-orange-600" />
      default:
        return <FileText className="h-4 w-4 text-gray-600" />
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg">
              <FileText className="h-8 w-8 text-white" />
            </div>
            Document Processing Center
          </h1>
          <p className="text-gray-600">
            AI-powered document upload, processing, and intelligent data extraction
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
            <Brain className="w-4 h-4 mr-1" />
            AI Processing Active
          </Badge>
        </div>
      </div>

      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Documents
          </CardTitle>
          <CardDescription>
            Drag and drop files or click to select. Supports PDF, JPG, PNG, and Excel files.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DocumentUploader onDrop={onDrop} isUploading={isUploading} />
        </CardContent>
      </Card>

      {/* Processing Queue */}
      {processingQueue && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5 animate-spin" />
              Processing Queue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>Processing: {processingQueue.currentFile}</span>
                <span>{processingQueue.processed} of {processingQueue.totalFiles}</span>
              </div>
              <Progress 
                value={(processingQueue.processed / processingQueue.totalFiles) * 100}
                className="w-full"
              />
              <div className="text-xs text-gray-500">
                Estimated time remaining: {processingQueue.estimatedTimeRemaining}s
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search documents, vendors, or invoice numbers..."
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
                <option value="completed">Completed</option>
                <option value="processing">Processing</option>
                <option value="pending_review">Pending Review</option>
                <option value="failed">Failed</option>
              </select>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">All Types</option>
                <option value="invoice">Invoices</option>
                <option value="purchase_order">Purchase Orders</option>
                <option value="receipt">Receipts</option>
                <option value="contract">Contracts</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documents List */}
      <Tabs defaultValue="grid" className="space-y-4">
        <TabsList>
          <TabsTrigger value="grid">Grid View</TabsTrigger>
          <TabsTrigger value="list">List View</TabsTrigger>
        </TabsList>

        <TabsContent value="grid">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDocuments.map((doc) => (
              <Card key={doc.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(doc.type)}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm truncate">{doc.filename}</h3>
                        <p className="text-xs text-gray-500">{formatFileSize(doc.size)}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    {getStatusBadge(doc.status)}
                    {doc.confidence && <ConfidenceIndicator confidence={doc.confidence} />}
                  </div>
                  
                  {doc.extractedData && (
                    <div className="space-y-1 text-sm">
                      {doc.extractedData.vendor && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Vendor:</span>
                          <span className="font-medium">{doc.extractedData.vendor}</span>
                        </div>
                      )}
                      {doc.extractedData.amount && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Amount:</span>
                          <span className="font-medium">${doc.extractedData.amount.toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {doc.aiAnalysis?.issues && Array.isArray(doc.aiAnalysis.issues) && doc.aiAnalysis.issues.length > 0 && (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription className="text-xs">
                        {doc.aiAnalysis.issues[0]}
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="flex gap-2">
                    {doc.status === 'pending_review' && (
                      <Button 
                        variant="default" 
                        size="sm" 
                        className="flex-1 bg-blue-600 hover:bg-blue-700"
                        onClick={() => processDocument(doc.id)}
                      >
                        <Play className="h-4 w-4 mr-1" />
                        Process
                      </Button>
                    )}
                    {doc.status === 'completed' && (
                      <Button variant="outline" size="sm" className="flex-1" asChild>
                        <Link href={`/digital-accountant/documents/${doc.id}`}>
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Link>
                      </Button>
                    )}
                    {doc.status === 'failed' && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => processDocument(doc.id)}
                      >
                        <Play className="h-4 w-4 mr-1" />
                        Retry
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="list">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b">
                    <tr>
                      <th className="text-left p-4 font-medium">Document</th>
                      <th className="text-left p-4 font-medium">Type</th>
                      <th className="text-left p-4 font-medium">Status</th>
                      <th className="text-left p-4 font-medium">Confidence</th>
                      <th className="text-left p-4 font-medium">Vendor</th>
                      <th className="text-left p-4 font-medium">Amount</th>
                      <th className="text-left p-4 font-medium">Uploaded</th>
                      <th className="text-left p-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDocuments.map((doc) => (
                      <tr key={doc.id} className="border-b hover:bg-gray-50">
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            {getTypeIcon(doc.type)}
                            <div>
                              <div className="font-medium text-sm">{doc.filename}</div>
                              <div className="text-xs text-gray-500">{formatFileSize(doc.size)}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge variant="outline" className="capitalize">
                            {doc.type.replace('_', ' ')}
                          </Badge>
                        </td>
                        <td className="p-4">{getStatusBadge(doc.status)}</td>
                        <td className="p-4">
                          {doc.confidence && <ConfidenceIndicator confidence={doc.confidence} />}
                        </td>
                        <td className="p-4 text-sm">{doc.extractedData?.vendor || '-'}</td>
                        <td className="p-4 text-sm">
                          {doc.extractedData?.amount ? `$${doc.extractedData.amount.toLocaleString()}` : '-'}
                        </td>
                        <td className="p-4 text-xs text-gray-500">
                          {new Date(doc.uploadedAt).toLocaleString()}
                        </td>
                        <td className="p-4">
                          <div className="flex gap-1">
                            {doc.status === 'pending_review' && (
                              <Button 
                                variant="default" 
                                size="sm"
                                className="bg-blue-600 hover:bg-blue-700"
                                onClick={() => processDocument(doc.id)}
                              >
                                <Play className="h-4 w-4" />
                              </Button>
                            )}
                            {doc.status === 'completed' && (
                              <Button variant="ghost" size="sm" asChild>
                                <Link href={`/digital-accountant/documents/${doc.id}`}>
                                  <Eye className="h-4 w-4" />
                                </Link>
                              </Button>
                            )}
                            {doc.status === 'failed' && (
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => processDocument(doc.id)}
                              >
                                <Play className="h-4 w-4" />
                              </Button>
                            )}
                            <Button variant="ghost" size="sm">
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {filteredDocuments.length === 0 && !loading && (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No documents found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || filterStatus !== 'all' || filterType !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'Upload your first document to get started'
              }
            </p>
            {!searchTerm && filterStatus === 'all' && filterType === 'all' && (
              <Button>
                <Upload className="h-4 w-4 mr-2" />
                Upload Document
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}