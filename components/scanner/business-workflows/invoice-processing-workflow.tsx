/**
 * HERA Universal ERP - Invoice Processing Workflow
 * Complete end-to-end invoice processing with AI automation
 */

'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  DollarSign, 
  Calendar, 
  Building, 
  User, 
  Edit3, 
  Send, 
  ArrowRight,
  Zap,
  Eye,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';
import { UniversalCameraInterface } from '../universal-camera-interface';
import { Button } from '@/components/ui/revolutionary-button';
import { Card } from '@/components/ui/revolutionary-card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// ==================== TYPES ====================

interface InvoiceData {
  invoice_number: string;
  vendor: {
    vendor_name: string;
    vendor_id?: string;
    address?: string;
    tax_id?: string;
  };
  amount: {
    subtotal: number;
    tax: number;
    total: number;
    currency: string;
  };
  dates: {
    invoice_date: string;
    due_date: string;
  };
  line_items: Array<{
    description: string;
    quantity: number;
    unit_price: number;
    total: number;
    account_code?: string;
  }>;
  payment_terms?: string;
  reference?: string;
  confidence: number;
}

interface WorkflowStep {
  id: string;
  title: string;
  status: 'pending' | 'in_progress' | 'completed' | 'error';
  description: string;
  data?: any;
  confidence?: number;
  requires_review?: boolean;
}

interface InvoiceProcessingWorkflowProps {
  onComplete?: (invoiceData: InvoiceData) => void;
  onError?: (error: Error) => void;
  enableApprovalWorkflow?: boolean;
  autoPostToGL?: boolean;
  className?: string;
}

// ==================== MAIN COMPONENT ====================

export function InvoiceProcessingWorkflow({
  onComplete,
  onError,
  enableApprovalWorkflow = true,
  autoPostToGL = false,
  className = ''
}: InvoiceProcessingWorkflowProps) {
  const [currentStep, setCurrentStep] = useState<'scan' | 'review' | 'approve' | 'post' | 'complete'>('scan');
  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [approvalNotes, setApprovalNotes] = useState('');
  
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>([
    {
      id: 'capture',
      title: 'Capture Invoice',
      status: 'pending',
      description: 'Scan invoice with camera'
    },
    {
      id: 'extract',
      title: 'Extract Data',
      status: 'pending',
      description: 'AI processing of invoice data'
    },
    {
      id: 'validate',
      title: 'Validate Information',
      status: 'pending',
      description: 'Verify extracted data accuracy'
    },
    {
      id: 'approve',
      title: 'Approval',
      status: 'pending',
      description: 'Review and approve for payment'
    },
    {
      id: 'post',
      title: 'Post to GL',
      status: 'pending',
      description: 'Create journal entries'
    }
  ]);

  // ==================== SCANNING HANDLERS ====================

  const handleInvoiceCapture = useCallback((result: any) => {
    console.log('📄 HERA: Invoice captured:', result);
    
    updateWorkflowStep('capture', 'completed');
    updateWorkflowStep('extract', 'in_progress');
    
    // Extract invoice data from AI result
    const extractedData: InvoiceData = {
      invoice_number: result.invoice_number || `INV-${Date.now()}`,
      vendor: {
        vendor_name: result.vendor?.vendor_name || 'Unknown Vendor',
        vendor_id: result.vendor?.vendor_id,
        address: result.vendor?.address,
        tax_id: result.vendor?.tax_id
      },
      amount: {
        subtotal: result.amounts?.subtotal || 0,
        tax: result.amounts?.tax || 0,
        total: result.amounts?.total || 0,
        currency: result.amounts?.currency || 'USD'
      },
      dates: {
        invoice_date: result.dates?.invoice_date || new Date().toISOString().split('T')[0],
        due_date: result.dates?.due_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      },
      line_items: result.line_items || [
        {
          description: 'Services',
          quantity: 1,
          unit_price: result.amounts?.total || 0,
          total: result.amounts?.total || 0
        }
      ],
      payment_terms: result.payment_terms,
      reference: result.reference,
      confidence: result.confidence || 0.85
    };

    setInvoiceData(extractedData);
    updateWorkflowStep('extract', 'completed', extractedData);
    updateWorkflowStep('validate', 'in_progress');
    setCurrentStep('review');
  }, []);

  const handleScanError = useCallback((error: Error) => {
    console.error('❌ HERA: Invoice scan failed:', error);
    updateWorkflowStep('capture', 'error');
    onError?.(error);
  }, [onError]);

  // ==================== WORKFLOW MANAGEMENT ====================

  const updateWorkflowStep = useCallback((stepId: string, status: WorkflowStep['status'], data?: any) => {
    setWorkflowSteps(prev => prev.map(step => 
      step.id === stepId 
        ? { ...step, status, data, requires_review: status === 'completed' && data?.confidence < 0.9 }
        : step
    ));
  }, []);

  const proceedToApproval = useCallback(() => {
    updateWorkflowStep('validate', 'completed');
    updateWorkflowStep('approve', 'in_progress');
    setCurrentStep('approve');
  }, []);

  const handleApproval = useCallback((approved: boolean) => {
    if (approved) {
      updateWorkflowStep('approve', 'completed');
      if (autoPostToGL) {
        updateWorkflowStep('post', 'in_progress');
        setCurrentStep('post');
        // Simulate GL posting
        setTimeout(() => {
          updateWorkflowStep('post', 'completed');
          setCurrentStep('complete');
          onComplete?.(invoiceData!);
        }, 2000);
      } else {
        setCurrentStep('complete');
        onComplete?.(invoiceData!);
      }
    } else {
      updateWorkflowStep('approve', 'error');
      setCurrentStep('review');
    }
  }, [invoiceData, autoPostToGL, onComplete]);

  // ==================== RENDER METHODS ====================

  const renderScanningStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Scan Invoice</h2>
        <p className="text-muted-foreground">Position the invoice within the camera frame</p>
      </div>
      
      <div className="h-96 rounded-2xl overflow-hidden">
        <UniversalCameraInterface
          mode="invoice"
          onProcessed={handleInvoiceCapture}
          onError={handleScanError}
          autoProcess={true}
          enableAI={true}
        />
      </div>
    </div>
  );

  const renderReviewStep = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">Review Invoice Data</h2>
          <p className="text-muted-foreground">Verify extracted information is correct</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge 
            variant={invoiceData?.confidence && invoiceData.confidence > 0.9 ? "default" : "secondary"}
            className="flex items-center gap-1"
          >
            <Zap className="w-3 h-3" />
            {Math.round((invoiceData?.confidence || 0) * 100)}% Confidence
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEditMode(!editMode)}
          >
            <Edit3 className="w-4 h-4 mr-1" />
            {editMode ? 'View' : 'Edit'}
          </Button>
        </div>
      </div>

      {invoiceData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Vendor Information */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Building className="w-4 h-4" />
              Vendor Information
            </h3>
            <div className="space-y-3">
              {editMode ? (
                <>
                  <Input
                    label="Vendor Name"
                    value={invoiceData.vendor.vendor_name}
                    onChange={(e) => setInvoiceData(prev => prev ? {
                      ...prev,
                      vendor: { ...prev.vendor, vendor_name: e.target.value }
                    } : null)}
                  />
                  <Input
                    label="Tax ID"
                    value={invoiceData.vendor.tax_id || ''}
                    onChange={(e) => setInvoiceData(prev => prev ? {
                      ...prev,
                      vendor: { ...prev.vendor, tax_id: e.target.value }
                    } : null)}
                  />
                </>
              ) : (
                <>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Vendor Name</label>
                    <p className="font-medium">{invoiceData.vendor.vendor_name}</p>
                  </div>
                  {invoiceData.vendor.tax_id && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Tax ID</label>
                      <p className="font-medium">{invoiceData.vendor.tax_id}</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </Card>

          {/* Invoice Details */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Invoice Details
            </h3>
            <div className="space-y-3">
              {editMode ? (
                <>
                  <Input
                    label="Invoice Number"
                    value={invoiceData.invoice_number}
                    onChange={(e) => setInvoiceData(prev => prev ? {
                      ...prev,
                      invoice_number: e.target.value
                    } : null)}
                  />
                  <Input
                    label="Invoice Date"
                    type="date"
                    value={invoiceData.dates.invoice_date}
                    onChange={(e) => setInvoiceData(prev => prev ? {
                      ...prev,
                      dates: { ...prev.dates, invoice_date: e.target.value }
                    } : null)}
                  />
                  <Input
                    label="Due Date"
                    type="date"
                    value={invoiceData.dates.due_date}
                    onChange={(e) => setInvoiceData(prev => prev ? {
                      ...prev,
                      dates: { ...prev.dates, due_date: e.target.value }
                    } : null)}
                  />
                </>
              ) : (
                <>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Invoice Number</label>
                    <p className="font-medium">{invoiceData.invoice_number}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Invoice Date</label>
                    <p className="font-medium">{new Date(invoiceData.dates.invoice_date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Due Date</label>
                    <p className="font-medium">{new Date(invoiceData.dates.due_date).toLocaleDateString()}</p>
                  </div>
                </>
              )}
            </div>
          </Card>

          {/* Amount Information */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Amount Information
            </h3>
            <div className="space-y-3">
              {editMode ? (
                <>
                  <Input
                    label="Subtotal"
                    type="number"
                    step="0.01"
                    value={invoiceData.amount.subtotal}
                    onChange={(e) => setInvoiceData(prev => prev ? {
                      ...prev,
                      amount: { ...prev.amount, subtotal: parseFloat(e.target.value) || 0 }
                    } : null)}
                  />
                  <Input
                    label="Tax"
                    type="number"
                    step="0.01"
                    value={invoiceData.amount.tax}
                    onChange={(e) => setInvoiceData(prev => prev ? {
                      ...prev,
                      amount: { ...prev.amount, tax: parseFloat(e.target.value) || 0 }
                    } : null)}
                  />
                  <Input
                    label="Total"
                    type="number"
                    step="0.01"
                    value={invoiceData.amount.total}
                    onChange={(e) => setInvoiceData(prev => prev ? {
                      ...prev,
                      amount: { ...prev.amount, total: parseFloat(e.target.value) || 0 }
                    } : null)}
                  />
                </>
              ) : (
                <>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Subtotal</label>
                    <p className="font-medium">{invoiceData.amount.currency} {invoiceData.amount.subtotal.toFixed(2)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Tax</label>
                    <p className="font-medium">{invoiceData.amount.currency} {invoiceData.amount.tax.toFixed(2)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Total</label>
                    <p className="text-xl font-bold">{invoiceData.amount.currency} {invoiceData.amount.total.toFixed(2)}</p>
                  </div>
                </>
              )}
            </div>
          </Card>

          {/* Line Items */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Line Items</h3>
            <div className="space-y-2">
              {invoiceData.line_items.map((item, index) => (
                <div key={index} className="flex justify-between items-center p-2 bg-muted/50 rounded">
                  <div>
                    <p className="font-medium">{item.description}</p>
                    <p className="text-sm text-muted-foreground">Qty: {item.quantity} × {invoiceData.amount.currency}{item.unit_price.toFixed(2)}</p>
                  </div>
                  <p className="font-medium">{invoiceData.amount.currency}{item.total.toFixed(2)}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => setCurrentStep('scan')}>
          Back to Scan
        </Button>
        <Button onClick={proceedToApproval}>
          Continue to Approval
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );

  const renderApprovalStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Approve Invoice</h2>
        <p className="text-muted-foreground">Review and approve invoice for payment processing</p>
      </div>

      {invoiceData && (
        <Card className="p-6">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <h3 className="font-semibold mb-2">Invoice Summary</h3>
              <p><strong>Vendor:</strong> {invoiceData.vendor.vendor_name}</p>
              <p><strong>Invoice #:</strong> {invoiceData.invoice_number}</p>
              <p><strong>Amount:</strong> {invoiceData.amount.currency} {invoiceData.amount.total.toFixed(2)}</p>
              <p><strong>Due Date:</strong> {new Date(invoiceData.dates.due_date).toLocaleDateString()}</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Processing Details</h3>
              <p><strong>Confidence:</strong> {Math.round(invoiceData.confidence * 100)}%</p>
              <p><strong>Payment Terms:</strong> {invoiceData.payment_terms || 'Net 30'}</p>
              <p><strong>Status:</strong> Pending Approval</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Approval Notes</label>
              <Textarea
                placeholder="Add any notes or comments..."
                value={approvalNotes}
                onChange={(e) => setApprovalNotes(e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex justify-center gap-4">
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => handleApproval(false)}
                className="flex items-center gap-2"
              >
                <ThumbsDown className="w-4 h-4" />
                Reject
              </Button>
              <Button 
                variant="gradient" 
                size="lg"
                onClick={() => handleApproval(true)}
                className="flex items-center gap-2"
              >
                <ThumbsUp className="w-4 h-4" />
                Approve & Process
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );

  const renderCompletionStep = () => (
    <motion.div
      className="text-center space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto">
        <CheckCircle className="w-12 h-12 text-green-600" />
      </div>
      
      <div>
        <h2 className="text-3xl font-bold text-green-700 mb-2">Invoice Processed Successfully!</h2>
        <p className="text-muted-foreground">
          Invoice {invoiceData?.invoice_number} has been approved and is ready for payment
        </p>
      </div>

      {invoiceData && (
        <Card className="p-6 max-w-md mx-auto">
          <div className="space-y-2">
            <p><strong>Vendor:</strong> {invoiceData.vendor.vendor_name}</p>
            <p><strong>Amount:</strong> {invoiceData.amount.currency} {invoiceData.amount.total.toFixed(2)}</p>
            <p><strong>Due Date:</strong> {new Date(invoiceData.dates.due_date).toLocaleDateString()}</p>
          </div>
        </Card>
      )}

      <Button onClick={() => window.location.reload()}>
        Process Another Invoice
      </Button>
    </motion.div>
  );

  const renderWorkflowProgress = () => (
    <Card className="p-4 mb-6">
      <h3 className="font-semibold mb-4">Processing Progress</h3>
      <div className="space-y-3">
        {workflowSteps.map((step, index) => (
          <div key={step.id} className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step.status === 'completed' ? 'bg-green-100 text-green-600' :
              step.status === 'in_progress' ? 'bg-blue-100 text-blue-600' :
              step.status === 'error' ? 'bg-red-100 text-red-600' :
              'bg-gray-100 text-gray-400'
            }`}>
              {step.status === 'completed' ? <CheckCircle className="w-4 h-4" /> :
               step.status === 'in_progress' ? <Clock className="w-4 h-4" /> :
               step.status === 'error' ? <AlertTriangle className="w-4 h-4" /> :
               <span className="text-xs">{index + 1}</span>}
            </div>
            <div className="flex-1">
              <p className="font-medium">{step.title}</p>
              <p className="text-sm text-muted-foreground">{step.description}</p>
            </div>
            {step.requires_review && (
              <Badge variant="secondary" className="text-xs">
                Review Required
              </Badge>
            )}
          </div>
        ))}
      </div>
    </Card>
  );

  // ==================== MAIN RENDER ====================

  return (
    <div className={`max-w-4xl mx-auto space-y-6 ${className}`}>
      {renderWorkflowProgress()}
      
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {currentStep === 'scan' && renderScanningStep()}
          {currentStep === 'review' && renderReviewStep()}
          {currentStep === 'approve' && renderApprovalStep()}
          {currentStep === 'complete' && renderCompletionStep()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default InvoiceProcessingWorkflow;