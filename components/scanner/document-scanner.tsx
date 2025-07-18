/**
 * HERA Universal ERP - Document Scanner Component
 * Specialized document scanning with AI-powered extraction
 * Optimized for invoices, receipts, contracts, and business documents
 */

'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  Receipt, 
  FileContract, 
  CreditCard, 
  Building2,
  CheckCircle2,
  AlertTriangle,
  Eye,
  Edit3,
  Save,
  X,
  Download,
  Share2,
  MoreHorizontal,
  Loader2
} from 'lucide-react';
import { UniversalCameraInterface } from './universal-camera-interface';
import { CapturedPhoto, DocumentType, ProcessedDocument } from '@/lib/camera/universal-camera-service';
import { InvoiceData, ReceiptData } from '@/lib/ai/document-processing-pipeline';
import { Button } from '@/components/ui/revolutionary-button';
import { Card } from '@/components/ui/revolutionary-card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import motionConfig from '@/lib/motion';

// ==================== COMPONENT INTERFACES ====================

interface DocumentScannerProps {
  documentType?: DocumentType;
  onDocumentProcessed?: (result: ProcessingResult) => void;
  onError?: (error: Error) => void;
  showProcessingSteps?: boolean;
  allowEditing?: boolean;
  autoSave?: boolean;
  workflowMode?: 'manual' | 'automatic' | 'assisted';
  className?: string;
}

interface ProcessingResult {
  document: ProcessedDocument;
  extractedData: InvoiceData | ReceiptData | any;
  confidence: number;
  validationResults: ValidationResult[];
  suggestedActions: SuggestedAction[];
  previewImage: string;
}

interface ValidationResult {
  field: string;
  isValid: boolean;
  confidence: number;
  message: string;
  severity: 'error' | 'warning' | 'info';
  suggestedFix?: string;
}

interface SuggestedAction {
  action: string;
  description: string;
  confidence: number;
  category: 'correction' | 'enhancement' | 'workflow' | 'compliance';
  autoExecutable: boolean;
}

interface ProcessingStep {
  id: string;
  name: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress: number;
  message: string;
  duration?: number;
  result?: any;
}

// ==================== DOCUMENT SCANNER COMPONENT ====================

export function DocumentScanner({
  documentType = 'invoice',
  onDocumentProcessed,
  onError,
  showProcessingSteps = true,
  allowEditing = true,
  autoSave = false,
  workflowMode = 'automatic',
  className = ''
}: DocumentScannerProps) {
  
  // ==================== STATE MANAGEMENT ====================
  
  const [scanningPhase, setScanningPhase] = useState<'scanning' | 'processing' | 'reviewing' | 'completed'>('scanning');
  const [capturedPhoto, setCapturedPhoto] = useState<CapturedPhoto | null>(null);
  const [processingResult, setProcessingResult] = useState<ProcessingResult | null>(null);
  const [processingSteps, setProcessingSteps] = useState<ProcessingStep[]>([]);
  const [editingData, setEditingData] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationResult[]>([]);

  // ==================== PROCESSING STEPS CONFIGURATION ====================

  const getProcessingSteps = (docType: DocumentType): ProcessingStep[] => {
    const baseSteps = [
      { id: 'capture', name: 'Image Capture', status: 'pending' as const, progress: 0, message: 'Waiting for document scan...' },
      { id: 'enhance', name: 'Image Enhancement', status: 'pending' as const, progress: 0, message: 'Optimizing image quality...' },
      { id: 'classify', name: 'Document Classification', status: 'pending' as const, progress: 0, message: 'Identifying document type...' },
      { id: 'extract', name: 'Data Extraction', status: 'pending' as const, progress: 0, message: 'Extracting text and data...' },
      { id: 'validate', name: 'Data Validation', status: 'pending' as const, progress: 0, message: 'Validating extracted data...' },
      { id: 'structure', name: 'Data Structuring', status: 'pending' as const, progress: 0, message: 'Organizing business data...' }
    ];

    // Add document-specific steps
    switch (docType) {
      case 'invoice':
        return [
          ...baseSteps,
          { id: 'vendor', name: 'Vendor Lookup', status: 'pending' as const, progress: 0, message: 'Finding vendor information...' },
          { id: 'accounting', name: 'Accounting Integration', status: 'pending' as const, progress: 0, message: 'Creating journal entries...' },
          { id: 'approval', name: 'Approval Workflow', status: 'pending' as const, progress: 0, message: 'Setting up approvals...' }
        ];
      case 'receipt':
        return [
          ...baseSteps,
          { id: 'expense', name: 'Expense Categorization', status: 'pending' as const, progress: 0, message: 'Categorizing expense...' },
          { id: 'policy', name: 'Policy Compliance', status: 'pending' as const, progress: 0, message: 'Checking expense policies...' },
          { id: 'reimbursement', name: 'Reimbursement Setup', status: 'pending' as const, progress: 0, message: 'Creating reimbursement request...' }
        ];
      default:
        return baseSteps;
    }
  };

  // ==================== EVENT HANDLERS ====================

  const handlePhotoCapture = useCallback(async (photo: CapturedPhoto) => {
    try {
      console.log('📸 HERA: Photo captured, starting processing...');
      
      setCapturedPhoto(photo);
      setScanningPhase('processing');
      
      const steps = getProcessingSteps(documentType);
      setProcessingSteps(steps);
      
      // Start processing simulation
      await simulateProcessing(photo, steps);
      
    } catch (error) {
      console.error('❌ HERA: Photo capture handling failed:', error);
      onError?.(error instanceof Error ? error : new Error('Photo capture failed'));
    }
  }, [documentType, onError]);

  const handleProcessingComplete = useCallback(async (result: any) => {
    try {
      console.log('✅ HERA: Processing completed:', result);
      
      // Create processing result
      const processingResult: ProcessingResult = {
        document: result.document || result,
        extractedData: result.extractedData || result.data || result,
        confidence: result.confidence || 0.9,
        validationResults: result.validationResults || [],
        suggestedActions: result.suggestedActions || [],
        previewImage: capturedPhoto?.dataUrl || ''
      };
      
      setProcessingResult(processingResult);
      setEditingData(processingResult.extractedData);
      setValidationErrors(processingResult.validationResults.filter(r => !r.isValid));
      
      setScanningPhase('reviewing');
      
      onDocumentProcessed?.(processingResult);
      
    } catch (error) {
      console.error('❌ HERA: Processing completion handling failed:', error);
      onError?.(error instanceof Error ? error : new Error('Processing completion failed'));
    }
  }, [capturedPhoto, onDocumentProcessed, onError]);

  const handleApproveDocument = useCallback(async () => {
    try {
      if (!processingResult) return;
      
      console.log('✅ HERA: Document approved');
      
      // Save the document
      if (autoSave) {
        await saveDocument();
      }
      
      setScanningPhase('completed');
      
    } catch (error) {
      console.error('❌ HERA: Document approval failed:', error);
      onError?.(error instanceof Error ? error : new Error('Document approval failed'));
    }
  }, [processingResult, autoSave, onError]);

  const handleRejectDocument = useCallback(() => {
    console.log('❌ HERA: Document rejected, restarting...');
    
    // Reset to scanning phase
    setScanningPhase('scanning');
    setCapturedPhoto(null);
    setProcessingResult(null);
    setProcessingSteps([]);
    setEditingData(null);
    setIsEditing(false);
    setValidationErrors([]);
  }, []);

  const saveDocument = useCallback(async () => {
    try {
      if (!processingResult) return;
      
      console.log('💾 HERA: Saving document...');
      
      // Implementation would save to database
      // For now, just simulate success
      
      console.log('✅ HERA: Document saved successfully');
      
    } catch (error) {
      console.error('❌ HERA: Document save failed:', error);
      throw error;
    }
  }, [processingResult]);

  // ==================== PROCESSING SIMULATION ====================

  const simulateProcessing = async (photo: CapturedPhoto, steps: ProcessingStep[]) => {
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      
      // Update step to processing
      setProcessingSteps(prev => prev.map(s => 
        s.id === step.id 
          ? { ...s, status: 'processing', progress: 0 }
          : s
      ));
      
      // Simulate processing time with progress updates
      const duration = Math.random() * 2000 + 1000; // 1-3 seconds
      const startTime = Date.now();
      
      const progressInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min((elapsed / duration) * 100, 100);
        
        setProcessingSteps(prev => prev.map(s => 
          s.id === step.id 
            ? { ...s, progress }
            : s
        ));
      }, 100);
      
      // Wait for step completion
      await new Promise(resolve => setTimeout(resolve, duration));
      
      clearInterval(progressInterval);
      
      // Mark step as completed
      setProcessingSteps(prev => prev.map(s => 
        s.id === step.id 
          ? { 
              ...s, 
              status: 'completed', 
              progress: 100, 
              duration: Date.now() - startTime,
              message: `${step.name} completed successfully`
            }
          : s
      ));
    }
    
    // Simulate final result
    const mockResult = generateMockResult(documentType, photo);
    await handleProcessingComplete(mockResult);
  };

  // ==================== RENDER METHODS ====================

  const renderScanningPhase = () => (
    <div className="h-full">
      <UniversalCameraInterface
        mode={documentType === 'business_card' ? 'business_card' : 'document'}
        onCapture={handlePhotoCapture}
        onProcessed={handleProcessingComplete}
        onError={onError}
        autoProcess={workflowMode === 'automatic'}
        className="h-full"
      />
    </div>
  );

  const renderProcessingPhase = () => (
    <div className="h-full flex flex-col">
      {/* Image Preview */}
      <div className="flex-1 relative">
        {capturedPhoto && (
          <img
            src={capturedPhoto.dataUrl}
            alt="Captured document"
            className="w-full h-full object-contain bg-gray-100 dark:bg-gray-800"
          />
        )}
        
        {/* Processing overlay */}
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <Card variant="glass" className="p-6 max-w-md w-full mx-4">
            <div className="text-center mb-6">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"
              />
              <h3 className="text-lg font-semibold text-white mb-2">Processing Document</h3>
              <p className="text-gray-300 text-sm">AI is analyzing your document...</p>
            </div>

            {/* Processing steps */}
            {showProcessingSteps && (
              <div className="space-y-3">
                {processingSteps.map((step, index) => (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <div className="flex-shrink-0">
                      {step.status === 'completed' ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      ) : step.status === 'processing' ? (
                        <Loader2 className="w-5 h-5 text-primary animate-spin" />
                      ) : step.status === 'error' ? (
                        <AlertTriangle className="w-5 h-5 text-red-500" />
                      ) : (
                        <div className="w-5 h-5 border-2 border-gray-600 rounded-full" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className={`text-sm font-medium ${
                          step.status === 'completed' ? 'text-green-400' :
                          step.status === 'processing' ? 'text-primary' :
                          step.status === 'error' ? 'text-red-400' :
                          'text-gray-400'
                        }`}>
                          {step.name}
                        </span>
                        {step.duration && (
                          <span className="text-xs text-gray-500">
                            {Math.round(step.duration)}ms
                          </span>
                        )}
                      </div>
                      
                      {step.status === 'processing' && (
                        <Progress value={step.progress} className="h-1 mt-1" />
                      )}
                      
                      <p className="text-xs text-gray-400 mt-1">{step.message}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );

  const renderReviewingPhase = () => (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Document Review</h2>
            <p className="text-muted-foreground">
              Review and edit extracted data before saving
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant={processingResult?.confidence && processingResult.confidence > 0.8 ? 'default' : 'secondary'}>
              {processingResult?.confidence ? `${Math.round(processingResult.confidence * 100)}% confidence` : 'Unknown confidence'}
            </Badge>
            
            {validationErrors.length > 0 && (
              <Badge variant="destructive">
                {validationErrors.length} issue{validationErrors.length !== 1 ? 's' : ''}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <Tabs defaultValue="extracted" className="h-full flex flex-col">
          <TabsList className="mx-4 mt-4">
            <TabsTrigger value="extracted" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Extracted Data
            </TabsTrigger>
            <TabsTrigger value="preview" className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Preview
            </TabsTrigger>
            <TabsTrigger value="validation" className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Validation
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-auto p-4">
            <TabsContent value="extracted" className="mt-0">
              {renderExtractedDataEditor()}
            </TabsContent>

            <TabsContent value="preview" className="mt-0">
              {renderDocumentPreview()}
            </TabsContent>

            <TabsContent value="validation" className="mt-0">
              {renderValidationResults()}
            </TabsContent>
          </div>
        </Tabs>
      </div>

      {/* Actions */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleRejectDocument}
              className="flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Reject & Rescan
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center gap-2"
            >
              <Edit3 className="w-4 h-4" />
              {isEditing ? 'Cancel Edit' : 'Edit Data'}
            </Button>

            <Button
              variant="gradient"
              onClick={handleApproveDocument}
              disabled={validationErrors.some(e => e.severity === 'error')}
              className="flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              Approve & Save
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCompletedPhase = () => (
    <div className="h-full flex items-center justify-center">
      <Card className="p-8 max-w-md w-full mx-4 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', duration: 0.5 }}
        >
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
        </motion.div>
        
        <h3 className="text-xl font-bold mb-2">Document Processed</h3>
        <p className="text-muted-foreground mb-6">
          Your {documentType} has been successfully processed and saved.
        </p>

        <div className="flex flex-col gap-2">
          <Button
            variant="gradient"
            onClick={() => setScanningPhase('scanning')}
            className="w-full"
          >
            Scan Another Document
          </Button>
          
          <Button
            variant="outline"
            onClick={() => {/* Navigate to document list */}}
            className="w-full"
          >
            View All Documents
          </Button>
        </div>
      </Card>
    </div>
  );

  const renderExtractedDataEditor = () => {
    if (!editingData) return null;

    return (
      <div className="space-y-6">
        {documentType === 'invoice' && renderInvoiceDataEditor()}
        {documentType === 'receipt' && renderReceiptDataEditor()}
        {/* Add other document type editors */}
      </div>
    );
  };

  const renderInvoiceDataEditor = () => {
    const invoice = editingData as InvoiceData;
    
    return (
      <div className="space-y-6">
        {/* Basic Information */}
        <Card className="p-4">
          <h4 className="font-semibold mb-4">Basic Information</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="invoiceNumber">Invoice Number</Label>
              <Input
                id="invoiceNumber"
                value={invoice.invoiceNumber || ''}
                onChange={(e) => setEditingData({...invoice, invoiceNumber: e.target.value})}
                disabled={!isEditing}
              />
            </div>
            <div>
              <Label htmlFor="issueDate">Issue Date</Label>
              <Input
                id="issueDate"
                type="date"
                value={invoice.issueDate || ''}
                onChange={(e) => setEditingData({...invoice, issueDate: e.target.value})}
                disabled={!isEditing}
              />
            </div>
          </div>
        </Card>

        {/* Vendor Information */}
        <Card className="p-4">
          <h4 className="font-semibold mb-4">Vendor Information</h4>
          <div className="space-y-4">
            <div>
              <Label htmlFor="vendorName">Vendor Name</Label>
              <Input
                id="vendorName"
                value={invoice.vendor?.name || ''}
                onChange={(e) => setEditingData({
                  ...invoice, 
                  vendor: {...invoice.vendor, name: e.target.value}
                })}
                disabled={!isEditing}
              />
            </div>
          </div>
        </Card>

        {/* Totals */}
        <Card className="p-4">
          <h4 className="font-semibold mb-4">Totals</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="subtotal">Subtotal</Label>
              <Input
                id="subtotal"
                type="number"
                step="0.01"
                value={invoice.totals?.subtotal || 0}
                onChange={(e) => setEditingData({
                  ...invoice,
                  totals: {...invoice.totals, subtotal: parseFloat(e.target.value)}
                })}
                disabled={!isEditing}
              />
            </div>
            <div>
              <Label htmlFor="totalAmount">Total Amount</Label>
              <Input
                id="totalAmount"
                type="number"
                step="0.01"
                value={invoice.totals?.totalAmount || 0}
                onChange={(e) => setEditingData({
                  ...invoice,
                  totals: {...invoice.totals, totalAmount: parseFloat(e.target.value)}
                })}
                disabled={!isEditing}
              />
            </div>
          </div>
        </Card>
      </div>
    );
  };

  const renderReceiptDataEditor = () => {
    const receipt = editingData as ReceiptData;
    
    return (
      <div className="space-y-6">
        {/* Basic Information */}
        <Card className="p-4">
          <h4 className="font-semibold mb-4">Receipt Information</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="merchantName">Merchant</Label>
              <Input
                id="merchantName"
                value={receipt.merchant?.name || ''}
                onChange={(e) => setEditingData({
                  ...receipt, 
                  merchant: {...receipt.merchant, name: e.target.value}
                })}
                disabled={!isEditing}
              />
            </div>
            <div>
              <Label htmlFor="transactionDate">Date</Label>
              <Input
                id="transactionDate"
                type="date"
                value={receipt.transactionDate || ''}
                onChange={(e) => setEditingData({...receipt, transactionDate: e.target.value})}
                disabled={!isEditing}
              />
            </div>
          </div>
        </Card>

        {/* Amount Information */}
        <Card className="p-4">
          <h4 className="font-semibold mb-4">Amount Details</h4>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="subtotal">Subtotal</Label>
              <Input
                id="subtotal"
                type="number"
                step="0.01"
                value={receipt.totals?.subtotal || 0}
                disabled={!isEditing}
              />
            </div>
            <div>
              <Label htmlFor="tax">Tax</Label>
              <Input
                id="tax"
                type="number"
                step="0.01"
                value={receipt.totals?.tax || 0}
                disabled={!isEditing}
              />
            </div>
            <div>
              <Label htmlFor="total">Total</Label>
              <Input
                id="total"
                type="number"
                step="0.01"
                value={receipt.totals?.total || 0}
                disabled={!isEditing}
              />
            </div>
          </div>
        </Card>
      </div>
    );
  };

  const renderDocumentPreview = () => (
    <div className="space-y-4">
      {capturedPhoto && (
        <Card className="p-4">
          <h4 className="font-semibold mb-4">Scanned Image</h4>
          <img
            src={capturedPhoto.dataUrl}
            alt="Scanned document"
            className="w-full h-auto rounded-lg border"
          />
        </Card>
      )}
    </div>
  );

  const renderValidationResults = () => (
    <div className="space-y-4">
      {validationErrors.length === 0 ? (
        <Card className="p-6 text-center">
          <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <h4 className="font-semibold text-green-700 dark:text-green-400">
            All validations passed!
          </h4>
          <p className="text-muted-foreground">
            The extracted data looks good and is ready for processing.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {validationErrors.map((error, index) => (
            <Card key={index} className="p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className={`w-5 h-5 mt-0.5 ${
                  error.severity === 'error' ? 'text-red-500' :
                  error.severity === 'warning' ? 'text-amber-500' :
                  'text-blue-500'
                }`} />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h5 className="font-medium">{error.field}</h5>
                    <Badge variant={
                      error.severity === 'error' ? 'destructive' :
                      error.severity === 'warning' ? 'secondary' :
                      'default'
                    }>
                      {error.severity}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{error.message}</p>
                  {error.suggestedFix && (
                    <p className="text-sm text-primary mt-2">
                      Suggestion: {error.suggestedFix}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  // ==================== MAIN RENDER ====================

  return (
    <div className={`h-full flex flex-col bg-background ${className}`}>
      <AnimatePresence mode="wait">
        {scanningPhase === 'scanning' && (
          <motion.div
            key="scanning"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="h-full"
          >
            {renderScanningPhase()}
          </motion.div>
        )}

        {scanningPhase === 'processing' && (
          <motion.div
            key="processing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="h-full"
          >
            {renderProcessingPhase()}
          </motion.div>
        )}

        {scanningPhase === 'reviewing' && (
          <motion.div
            key="reviewing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="h-full"
          >
            {renderReviewingPhase()}
          </motion.div>
        )}

        {scanningPhase === 'completed' && (
          <motion.div
            key="completed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="h-full"
          >
            {renderCompletedPhase()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ==================== HELPER FUNCTIONS ====================

function generateMockResult(documentType: DocumentType, photo: CapturedPhoto): any {
  const baseResult = {
    confidence: 0.92,
    validationResults: [
      {
        field: 'document_type',
        isValid: true,
        confidence: 0.95,
        message: 'Document type identified correctly',
        severity: 'info' as const
      }
    ],
    suggestedActions: []
  };

  switch (documentType) {
    case 'invoice':
      return {
        ...baseResult,
        document: { id: 'doc_' + Date.now(), documentType },
        extractedData: {
          invoiceNumber: 'INV-2024-001',
          issueDate: '2024-01-15',
          vendor: { name: 'Acme Corporation' },
          totals: { subtotal: 1000, totalAmount: 1080, totalTax: 80 }
        } as InvoiceData
      };
    case 'receipt':
      return {
        ...baseResult,
        document: { id: 'doc_' + Date.now(), documentType },
        extractedData: {
          transactionDate: '2024-01-15',
          merchant: { name: 'Coffee Shop', category: 'Restaurant' },
          totals: { subtotal: 15.50, tax: 1.24, total: 16.74 }
        } as ReceiptData
      };
    default:
      return baseResult;
  }
}

export default DocumentScanner;