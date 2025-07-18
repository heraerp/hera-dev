/**
 * HERA Document Processing Component
 * AI-powered OCR and document analysis for conversational interface
 */

"use client"

import React, { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Upload, Camera, FileText, Image as ImageIcon, Check, 
  AlertCircle, Brain, Scan, Zap, Eye, Download,
  X, ChevronRight, DollarSign, Calendar, User,
  Hash, MapPin, Phone, Mail, Building
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { documentProcessing } from '@/services/conversationEngine'
import type { 
  OCRResult, 
  DocumentClassification, 
  DocumentAnalysis,
  ExtractedData,
  ValidationResult,
  MessageAttachment
} from '@/types/conversation'

// ================================================================================================
// DOCUMENT PROCESSOR COMPONENT
// ================================================================================================

interface DocumentProcessorProps {
  className?: string
  onDocumentProcessed?: (result: ProcessedDocument) => void
  onError?: (error: string) => void
  maxFileSize?: number
  acceptedTypes?: string[]
  showPreview?: boolean
}

interface ProcessedDocument {
  file: File
  ocrResult: OCRResult
  classification: DocumentClassification
  analysis: DocumentAnalysis
  validation: ValidationResult
  attachment: MessageAttachment
}

export function DocumentProcessor({
  className,
  onDocumentProcessed,
  onError,
  maxFileSize = 10 * 1024 * 1024, // 10MB
  acceptedTypes = ['image/*', '.pdf', '.doc', '.docx'],
  showPreview = true
}: DocumentProcessorProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [currentFile, setCurrentFile] = useState<File | null>(null)
  const [processingStage, setProcessingStage] = useState<string>('')
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<ProcessedDocument | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  const processDocument = useCallback(async (file: File) => {
    if (!file) return

    setIsProcessing(true)
    setError(null)
    setCurrentFile(file)
    setProgress(0)

    try {
      // Validate file
      if (file.size > maxFileSize) {
        throw new Error(`File too large. Maximum size is ${maxFileSize / 1024 / 1024}MB`)
      }

      // Stage 1: OCR Extraction
      setProcessingStage('Extracting text with OCR...')
      setProgress(20)
      const ocrResult = await documentProcessing.ocrExtract(file)

      // Stage 2: Document Classification
      setProcessingStage('Classifying document type...')
      setProgress(40)
      const classification = await documentProcessing.classification(ocrResult)

      // Stage 3: AI Analysis
      setProcessingStage('Analyzing business context...')
      setProgress(60)
      const analysis = await documentProcessing.aiAnalysis(ocrResult)

      // Stage 4: Data Validation
      setProcessingStage('Validating extracted data...')
      setProgress(80)
      const validation = await documentProcessing.validation(ocrResult.extractedData)

      // Stage 5: Create attachment
      setProcessingStage('Finalizing document...')
      setProgress(90)
      const attachment: MessageAttachment = {
        id: `doc_${Date.now()}`,
        type: file.type.startsWith('image/') ? 'image' : 'document',
        url: URL.createObjectURL(file),
        name: file.name,
        size: file.size,
        mimeType: file.type,
        processing: {
          status: 'completed',
          results: {
            extracted: ocrResult.extractedData,
            classification,
            analysis,
            confidence: ocrResult.confidence
          }
        }
      }

      const processedDoc: ProcessedDocument = {
        file,
        ocrResult,
        classification,
        analysis,
        validation,
        attachment
      }

      setProgress(100)
      setResult(processedDoc)
      onDocumentProcessed?.(processedDoc)

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Document processing failed'
      setError(errorMessage)
      onError?.(errorMessage)
    } finally {
      setIsProcessing(false)
      setProcessingStage('')
    }
  }, [maxFileSize, onDocumentProcessed, onError])

  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return

    const file = files[0]
    processDocument(file)
  }, [processDocument])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    handleFileSelect(e.dataTransfer.files)
  }, [handleFileSelect])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  const openCameraDialog = () => {
    cameraInputRef.current?.click()
  }

  const clearResult = () => {
    setResult(null)
    setCurrentFile(null)
    setError(null)
    setProgress(0)
  }

  return (
    <div className={cn("w-full max-w-2xl mx-auto", className)}>
      {/* File Input Elements */}
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes.join(',')}
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
      />

      {/* Main Processing Area */}
      <AnimatePresence mode="wait">
        {!result && !isProcessing && (
          <motion.div
            key="upload"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={cn(
              "border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300",
              isDragging 
                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" 
                : "border-slate-300 dark:border-slate-600 hover:border-blue-400 dark:hover:border-blue-500"
            )}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <div className="space-y-6">
              {/* Upload Icon */}
              <motion.div
                className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center"
                animate={{
                  rotate: isDragging ? [0, 10, -10, 0] : 0,
                  scale: isDragging ? 1.1 : 1
                }}
                transition={{ duration: 0.3 }}
              >
                <Upload className="w-8 h-8 text-white" />
              </motion.div>

              {/* Instructions */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                  Upload Document for AI Analysis
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  Drag and drop your document here, or click to browse
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-500">
                  Supports: Images, PDFs, Word documents • Max size: {maxFileSize / 1024 / 1024}MB
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-center space-x-4">
                <motion.button
                  onClick={openFileDialog}
                  className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center space-x-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FileText className="w-5 h-5" />
                  <span>Browse Files</span>
                </motion.button>

                <motion.button
                  onClick={openCameraDialog}
                  className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 flex items-center space-x-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Camera className="w-5 h-5" />
                  <span>Take Photo</span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Processing State */}
        {isProcessing && (
          <motion.div
            key="processing"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700"
          >
            <ProcessingView
              fileName={currentFile?.name || ''}
              stage={processingStage}
              progress={progress}
            />
          </motion.div>
        )}

        {/* Results State */}
        {result && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <DocumentResultsView
              result={result}
              onClear={clearResult}
              showPreview={showPreview}
            />
          </motion.div>
        )}

        {/* Error State */}
        {error && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6"
          >
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-red-900 dark:text-red-100 mb-1">
                  Processing Failed
                </h3>
                <p className="text-red-700 dark:text-red-300 mb-4">{error}</p>
                <button
                  onClick={clearResult}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                >
                  Try Again
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ================================================================================================
// PROCESSING VIEW COMPONENT
// ================================================================================================

interface ProcessingViewProps {
  fileName: string
  stage: string
  progress: number
}

function ProcessingView({ fileName, stage, progress }: ProcessingViewProps) {
  return (
    <div className="text-center space-y-6">
      {/* Processing Animation */}
      <motion.div
        className="mx-auto w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center"
        animate={{
          rotate: [0, 360],
          scale: [1, 1.1, 1]
        }}
        transition={{
          rotate: { duration: 2, repeat: Infinity, ease: "linear" },
          scale: { duration: 1, repeat: Infinity, ease: "easeInOut" }
        }}
      >
        <Brain className="w-10 h-10 text-white" />
      </motion.div>

      {/* File Info */}
      <div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Processing Document
        </h3>
        <p className="text-slate-600 dark:text-slate-400 mt-1">{fileName}</p>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
          <motion.div
            className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400">{stage}</p>
      </div>

      {/* Processing Stages */}
      <div className="flex justify-center space-x-4 text-xs">
        {[
          { icon: Scan, label: 'OCR', active: progress >= 20 },
          { icon: Brain, label: 'Classify', active: progress >= 40 },
          { icon: Eye, label: 'Analyze', active: progress >= 60 },
          { icon: Check, label: 'Validate', active: progress >= 80 }
        ].map((step, index) => (
          <motion.div
            key={index}
            className={cn(
              "flex flex-col items-center space-y-1",
              step.active ? "text-blue-500" : "text-slate-400"
            )}
            animate={{
              scale: step.active ? [1, 1.1, 1] : 1
            }}
            transition={{ duration: 0.5, repeat: step.active ? Infinity : 0 }}
          >
            <step.icon className="w-5 h-5" />
            <span>{step.label}</span>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// ================================================================================================
// DOCUMENT RESULTS VIEW
// ================================================================================================

interface DocumentResultsViewProps {
  result: ProcessedDocument
  onClear: () => void
  showPreview: boolean
}

function DocumentResultsView({ result, onClear, showPreview }: DocumentResultsViewProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'data' | 'analysis'>('overview')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
            <Check className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Document Processed Successfully
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              {result.file.name} • {Math.round(result.ocrResult.confidence * 100)}% confidence
            </p>
          </div>
        </div>
        
        <button
          onClick={onClear}
          className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Classification Badge */}
      <div className="flex items-center space-x-2">
        <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium">
          {result.classification.type}
        </span>
        {result.classification.subtype && (
          <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm">
            {result.classification.subtype}
          </span>
        )}
        <span className="text-sm text-slate-500">
          {Math.round(result.classification.confidence * 100)}% confident
        </span>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 dark:border-slate-700">
        <nav className="flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: Eye },
            { id: 'data', label: 'Extracted Data', icon: FileText },
            { id: 'analysis', label: 'AI Analysis', icon: Brain }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex items-center space-x-2 py-3 border-b-2 font-medium text-sm transition-colors",
                activeTab === tab.id
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
              )}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <DocumentOverview result={result} showPreview={showPreview} />
          </motion.div>
        )}

        {activeTab === 'data' && (
          <motion.div
            key="data"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <ExtractedDataView data={result.ocrResult.extractedData} />
          </motion.div>
        )}

        {activeTab === 'analysis' && (
          <motion.div
            key="analysis"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <AnalysisView analysis={result.analysis} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ================================================================================================
// DOCUMENT OVERVIEW
// ================================================================================================

function DocumentOverview({ result, showPreview }: { result: ProcessedDocument, showPreview: boolean }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Document Preview */}
      {showPreview && result.attachment.type === 'image' && (
        <div className="space-y-3">
          <h4 className="font-medium text-slate-900 dark:text-slate-100">Document Preview</h4>
          <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
            <img
              src={result.attachment.url}
              alt="Document preview"
              className="w-full h-auto max-h-64 object-contain"
            />
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="space-y-3">
        <h4 className="font-medium text-slate-900 dark:text-slate-100">Processing Results</h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <p className="text-sm text-slate-600 dark:text-slate-400">OCR Confidence</p>
            <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {Math.round(result.ocrResult.confidence * 100)}%
            </p>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <p className="text-sm text-slate-600 dark:text-slate-400">Processing Time</p>
            <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {result.ocrResult.processingTime}ms
            </p>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <p className="text-sm text-slate-600 dark:text-slate-400">Document Type</p>
            <p className="text-lg font-semibold text-slate-900 dark:text-slate-100 capitalize">
              {result.classification.type}
            </p>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <p className="text-sm text-slate-600 dark:text-slate-400">Validation</p>
            <p className={cn(
              "text-lg font-semibold",
              result.validation.isValid ? "text-green-600" : "text-red-600"
            )}>
              {result.validation.isValid ? 'Valid' : 'Invalid'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ================================================================================================
// EXTRACTED DATA VIEW
// ================================================================================================

function ExtractedDataView({ data }: { data: ExtractedData }) {
  const dataFields = [
    { key: 'vendor', icon: Building, label: 'Vendor' },
    { key: 'amount', icon: DollarSign, label: 'Amount' },
    { key: 'date', icon: Calendar, label: 'Date' },
    { key: 'invoiceNumber', icon: Hash, label: 'Invoice Number' }
  ]

  return (
    <div className="space-y-4">
      <h4 className="font-medium text-slate-900 dark:text-slate-100">Extracted Information</h4>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {dataFields.map((field) => {
          const value = data[field.key as keyof ExtractedData]
          if (!value) return null

          return (
            <motion.div
              key={field.key}
              className="flex items-center space-x-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <field.icon className="w-5 h-5 text-slate-500" />
              <div className="flex-1">
                <p className="text-sm text-slate-600 dark:text-slate-400">{field.label}</p>
                <p className="font-medium text-slate-900 dark:text-slate-100">
                  {typeof value === 'number' && field.key === 'amount' 
                    ? `$${value.toFixed(2)}` 
                    : String(value)}
                </p>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Line Items */}
      {data.items && data.items.length > 0 && (
        <div className="space-y-3">
          <h5 className="font-medium text-slate-900 dark:text-slate-100">Line Items</h5>
          <div className="space-y-2">
            {data.items.map((item, index) => (
              <div
                key={index}
                className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg"
              >
                <div className="flex-1">
                  <p className="font-medium text-slate-900 dark:text-slate-100">
                    {item.description}
                  </p>
                  {item.quantity && item.unitPrice && (
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {item.quantity} × ${item.unitPrice}
                    </p>
                  )}
                </div>
                {item.total && (
                  <p className="font-semibold text-slate-900 dark:text-slate-100">
                    ${item.total.toFixed(2)}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ================================================================================================
// ANALYSIS VIEW
// ================================================================================================

function AnalysisView({ analysis }: { analysis: DocumentAnalysis }) {
  return (
    <div className="space-y-6">
      {/* Recommendations */}
      {analysis.recommendations && analysis.recommendations.length > 0 && (
        <div>
          <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-3">
            AI Recommendations
          </h4>
          <div className="space-y-2">
            {analysis.recommendations.map((recommendation, index) => (
              <motion.div
                key={index}
                className="flex items-start space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Zap className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <p className="text-slate-700 dark:text-slate-300">{recommendation}</p>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Business Impact */}
      {analysis.businessImpact && (
        <div>
          <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-3">
            Business Impact
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {analysis.businessImpact.financialImpact && (
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <h5 className="font-medium text-green-900 dark:text-green-100 mb-2">
                  Financial Impact
                </h5>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {analysis.businessImpact.financialImpact.currency} {analysis.businessImpact.financialImpact.amount}
                </p>
                <div className="mt-2 space-y-1">
                  {analysis.businessImpact.financialImpact.accounts.map((account, index) => (
                    <p key={index} className="text-sm text-green-700 dark:text-green-300">
                      {account}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default DocumentProcessor