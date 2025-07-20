'use client'

import React, { useState, useCallback } from 'react'
import { Upload, FileText, Check, X, AlertTriangle, Download, RefreshCw, Trash2, Eye } from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import ConfidenceIndicator from './ConfidenceIndicator'

interface ProcessedReceipt {
  id: string
  filename: string
  status: 'processing' | 'completed' | 'error' | 'needs_review'
  confidence?: number
  extractedData?: {
    vendor?: string
    amount?: number
    date?: string
    items?: string[]
  }
  errors?: string[]
  warnings?: string[]
  previewUrl?: string
}

interface BulkReceiptProcessorProps {
  className?: string
}

export default function BulkReceiptProcessor({ className = '' }: BulkReceiptProcessorProps) {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [processedReceipts, setProcessedReceipts] = useState<ProcessedReceipt[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingProgress, setProcessingProgress] = useState(0)
  const [selectedReceipt, setSelectedReceipt] = useState<string | null>(null)

  // Handle file drop
  const onDrop = useCallback((acceptedFiles: File[]) => {
    setUploadedFiles(prev => [...prev, ...acceptedFiles])
    
    // Create initial processed receipt entries
    const newReceipts: ProcessedReceipt[] = acceptedFiles.map(file => ({
      id: `receipt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      filename: file.name,
      status: 'processing' as const,
      previewUrl: URL.createObjectURL(file)
    }))
    
    setProcessedReceipts(prev => [...prev, ...newReceipts])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg'],
      'application/pdf': ['.pdf']
    },
    multiple: true
  })

  // Simulate AI processing for all receipts
  const processAllReceipts = useCallback(async () => {
    if (processedReceipts.length === 0) return
    
    setIsProcessing(true)
    setProcessingProgress(0)
    
    const total = processedReceipts.length
    
    for (let i = 0; i < total; i++) {
      const receipt = processedReceipts[i]
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Mock AI processing results
      const confidence = Math.random() * 0.4 + 0.6 // 60-100%
      const hasError = Math.random() < 0.1 // 10% error rate
      const needsReview = confidence < 0.8
      
      let status: ProcessedReceipt['status'] = 'completed'
      if (hasError) status = 'error'
      else if (needsReview) status = 'needs_review'
      
      const mockVendors = ['Fresh Fish Market', 'Koopa Meat Co.', 'Yoshi Produce Farm', 'Toad Spice Shop', 'Bob-omb Emergency Supply']
      const mockItems = ['Fresh Salmon', 'Prime Beef', 'Organic Tomatoes', 'Rare Spices', 'Emergency Supplies']
      
      const updatedReceipt: ProcessedReceipt = {
        ...receipt,
        status,
        confidence: hasError ? undefined : confidence,
        extractedData: hasError ? undefined : {
          vendor: mockVendors[Math.floor(Math.random() * mockVendors.length)],
          amount: Math.random() * 200 + 20,
          date: new Date().toISOString().split('T')[0],
          items: [mockItems[Math.floor(Math.random() * mockItems.length)]]
        },
        errors: hasError ? ['Failed to extract vendor information', 'Poor image quality'] : undefined,
        warnings: needsReview ? ['Low confidence in amount extraction'] : undefined
      }
      
      setProcessedReceipts(prev => 
        prev.map(r => r.id === receipt.id ? updatedReceipt : r)
      )
      
      setProcessingProgress(((i + 1) / total) * 100)
    }
    
    setIsProcessing(false)
  }, [processedReceipts])

  // Remove receipt
  const removeReceipt = useCallback((receiptId: string) => {
    setProcessedReceipts(prev => prev.filter(r => r.id !== receiptId))
    setUploadedFiles(prev => {
      const receiptIndex = processedReceipts.findIndex(r => r.id === receiptId)
      if (receiptIndex >= 0) {
        return prev.filter((_, index) => index !== receiptIndex)
      }
      return prev
    })
    if (selectedReceipt === receiptId) {
      setSelectedReceipt(null)
    }
  }, [processedReceipts, selectedReceipt])

  // Clear all receipts
  const clearAllReceipts = useCallback(() => {
    setProcessedReceipts([])
    setUploadedFiles([])
    setSelectedReceipt(null)
    setProcessingProgress(0)
  }, [])

  // Export results
  const exportResults = useCallback(() => {
    const results = processedReceipts.map(receipt => ({
      filename: receipt.filename,
      status: receipt.status,
      confidence: receipt.confidence,
      vendor: receipt.extractedData?.vendor,
      amount: receipt.extractedData?.amount,
      date: receipt.extractedData?.date,
      items: receipt.extractedData?.items?.join(', '),
      errors: receipt.errors?.join(', '),
      warnings: receipt.warnings?.join(', ')
    }))
    
    const csv = [
      ['Filename', 'Status', 'Confidence', 'Vendor', 'Amount', 'Date', 'Items', 'Errors', 'Warnings'],
      ...results.map(r => [
        r.filename,
        r.status,
        r.confidence?.toFixed(2) || '',
        r.vendor || '',
        r.amount?.toFixed(2) || '',
        r.date || '',
        r.items || '',
        r.errors || '',
        r.warnings || ''
      ])
    ].map(row => row.join(',')).join('\n')
    
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `bulk-receipt-processing-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }, [processedReceipts])

  const getStatusIcon = (status: ProcessedReceipt['status']) => {
    switch (status) {
      case 'processing':
        return <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />
      case 'completed':
        return <Check className="w-4 h-4 text-green-600" />
      case 'error':
        return <X className="w-4 h-4 text-red-600" />
      case 'needs_review':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />
      default:
        return null
    }
  }

  const getStatusColor = (status: ProcessedReceipt['status']) => {
    switch (status) {
      case 'processing': return 'bg-blue-50 border-blue-200'
      case 'completed': return 'bg-green-50 border-green-200'
      case 'error': return 'bg-red-50 border-red-200'
      case 'needs_review': return 'bg-yellow-50 border-yellow-200'
      default: return 'bg-gray-50 border-gray-200'
    }
  }

  const summaryStats = {
    total: processedReceipts.length,
    completed: processedReceipts.filter(r => r.status === 'completed').length,
    needsReview: processedReceipts.filter(r => r.status === 'needs_review').length,
    errors: processedReceipts.filter(r => r.status === 'error').length,
    processing: processedReceipts.filter(r => r.status === 'processing').length
  }

  const selectedReceiptData = selectedReceipt 
    ? processedReceipts.find(r => r.id === selectedReceipt)
    : null

  return (
    <div className={`bg-white rounded-lg shadow-lg ${className}`}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Bulk Receipt Processing</h2>
          <div className="flex gap-2">
            {processedReceipts.length > 0 && (
              <>
                <button
                  onClick={exportResults}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center text-sm"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export Results
                </button>
                <button
                  onClick={clearAllReceipts}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center text-sm"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear All
                </button>
              </>
            )}
          </div>
        </div>

        {/* Upload Area */}
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          {isDragActive ? (
            <p className="text-blue-600">Drop the receipt files here...</p>
          ) : (
            <div>
              <p className="text-gray-900 font-medium mb-2">
                Drag & drop receipt files here, or click to select
              </p>
              <p className="text-gray-500 text-sm">
                Supports PDF, PNG, JPG files. Upload multiple receipts at once.
              </p>
            </div>
          )}
        </div>

        {/* Summary Stats */}
        {processedReceipts.length > 0 && (
          <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{summaryStats.total}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-3">
              <p className="text-sm text-green-600">Completed</p>
              <p className="text-2xl font-bold text-green-900">{summaryStats.completed}</p>
            </div>
            <div className="bg-yellow-50 rounded-lg p-3">
              <p className="text-sm text-yellow-600">Needs Review</p>
              <p className="text-2xl font-bold text-yellow-900">{summaryStats.needsReview}</p>
            </div>
            <div className="bg-red-50 rounded-lg p-3">
              <p className="text-sm text-red-600">Errors</p>
              <p className="text-2xl font-bold text-red-900">{summaryStats.errors}</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-3">
              <p className="text-sm text-blue-600">Processing</p>
              <p className="text-2xl font-bold text-blue-900">{summaryStats.processing}</p>
            </div>
          </div>
        )}

        {/* Processing Controls */}
        {processedReceipts.length > 0 && (
          <div className="mt-6 flex items-center justify-between">
            <button
              onClick={processAllReceipts}
              disabled={isProcessing}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg flex items-center"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4 mr-2" />
                  Process All Receipts
                </>
              )}
            </button>
            
            {isProcessing && (
              <div className="flex items-center">
                <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${processingProgress}%` }}
                  />
                </div>
                <span className="text-sm text-gray-600">{Math.round(processingProgress)}%</span>
              </div>
            )}
          </div>
        )}

        {/* Receipt List and Detail View */}
        {processedReceipts.length > 0 && (
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Receipt List */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Processing Queue ({processedReceipts.length})
              </h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {processedReceipts.map((receipt) => (
                  <div
                    key={receipt.id}
                    onClick={() => setSelectedReceipt(receipt.id)}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedReceipt === receipt.id
                        ? 'border-blue-500 bg-blue-50'
                        : `hover:border-gray-300 ${getStatusColor(receipt.status)}`
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          {getStatusIcon(receipt.status)}
                          <span className="ml-2 font-medium text-gray-900 truncate">
                            {receipt.filename}
                          </span>
                        </div>
                        
                        {receipt.extractedData && (
                          <div className="text-sm text-gray-600">
                            <p>{receipt.extractedData.vendor}</p>
                            {receipt.extractedData.amount && (
                              <p className="font-medium">${receipt.extractedData.amount.toFixed(2)}</p>
                            )}
                          </div>
                        )}
                        
                        {receipt.confidence && (
                          <div className="mt-2">
                            <ConfidenceIndicator 
                              confidence={receipt.confidence} 
                              variant="badge" 
                            />
                          </div>
                        )}
                        
                        {receipt.errors && receipt.errors.length > 0 && (
                          <p className="text-xs text-red-600 mt-1">
                            {receipt.errors[0]}
                          </p>
                        )}
                      </div>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          removeReceipt(receipt.id)
                        }}
                        className="ml-2 text-gray-400 hover:text-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Receipt Detail */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Receipt Details</h3>
              {selectedReceiptData ? (
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-gray-900 truncate">{selectedReceiptData.filename}</h4>
                    <div className="flex items-center">
                      {getStatusIcon(selectedReceiptData.status)}
                      <span className="ml-2 text-sm capitalize">{selectedReceiptData.status.replace('_', ' ')}</span>
                    </div>
                  </div>

                  {/* Receipt Preview */}
                  {selectedReceiptData.previewUrl && (
                    <div className="mb-4">
                      <img
                        src={selectedReceiptData.previewUrl}
                        alt={selectedReceiptData.filename}
                        className="w-full h-48 object-contain border rounded"
                      />
                    </div>
                  )}

                  {/* Extracted Data */}
                  {selectedReceiptData.extractedData && (
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Vendor</label>
                        <p className="text-gray-900">{selectedReceiptData.extractedData.vendor}</p>
                      </div>
                      
                      {selectedReceiptData.extractedData.amount && (
                        <div>
                          <label className="text-sm font-medium text-gray-700">Amount</label>
                          <p className="text-gray-900 font-semibold">
                            ${selectedReceiptData.extractedData.amount.toFixed(2)}
                          </p>
                        </div>
                      )}
                      
                      {selectedReceiptData.extractedData.date && (
                        <div>
                          <label className="text-sm font-medium text-gray-700">Date</label>
                          <p className="text-gray-900">{selectedReceiptData.extractedData.date}</p>
                        </div>
                      )}
                      
                      {selectedReceiptData.extractedData.items && selectedReceiptData.extractedData.items.length > 0 && (
                        <div>
                          <label className="text-sm font-medium text-gray-700">Items</label>
                          <ul className="text-gray-900 text-sm">
                            {selectedReceiptData.extractedData.items.map((item, index) => (
                              <li key={index}>• {item}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Confidence Score */}
                  {selectedReceiptData.confidence && (
                    <div className="mt-4">
                      <label className="text-sm font-medium text-gray-700">AI Confidence</label>
                      <div className="mt-1">
                        <ConfidenceIndicator 
                          confidence={selectedReceiptData.confidence} 
                          variant="detailed" 
                        />
                      </div>
                    </div>
                  )}

                  {/* Errors */}
                  {selectedReceiptData.errors && selectedReceiptData.errors.length > 0 && (
                    <div className="mt-4">
                      <label className="text-sm font-medium text-red-700">Errors</label>
                      <ul className="mt-1 text-sm text-red-600">
                        {selectedReceiptData.errors.map((error, index) => (
                          <li key={index}>• {error}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Warnings */}
                  {selectedReceiptData.warnings && selectedReceiptData.warnings.length > 0 && (
                    <div className="mt-4">
                      <label className="text-sm font-medium text-yellow-700">Warnings</label>
                      <ul className="mt-1 text-sm text-yellow-600">
                        {selectedReceiptData.warnings.map((warning, index) => (
                          <li key={index}>• {warning}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Actions */}
                  {selectedReceiptData.status === 'needs_review' && (
                    <div className="flex gap-2 mt-4 pt-4 border-t">
                      <button className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md text-sm">
                        Approve
                      </button>
                      <button className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white py-2 px-4 rounded-md text-sm">
                        Edit
                      </button>
                      <button className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md text-sm">
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="border border-gray-200 rounded-lg p-8 text-center text-gray-500">
                  <Eye className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>Select a receipt to view details</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}