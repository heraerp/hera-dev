/**
 * HERA Universal ERP - Receipt & Expense Processing Workflow
 * Complete expense management with AI automation and policy compliance
 */

'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Receipt, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  DollarSign, 
  Calendar, 
  MapPin, 
  User, 
  Edit3, 
  Send, 
  ArrowRight,
  Zap,
  CreditCard,
  Plane,
  Car,
  Utensils,
  Hotel,
  Fuel,
  ShoppingBag,
  FileCheck,
  AlertCircle
} from 'lucide-react';
import { UniversalCameraInterface } from '../universal-camera-interface';
import { Button } from '@/components/ui/revolutionary-button';
import { Card } from '@/components/ui/revolutionary-card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// ==================== TYPES ====================

interface ReceiptData {
  receipt_id: string;
  merchant: {
    name: string;
    address?: string;
    phone?: string;
    category: string;
  };
  transaction: {
    date: string;
    time?: string;
    amount: number;
    currency: string;
    tax_amount?: number;
    tip_amount?: number;
    payment_method: 'cash' | 'card' | 'digital';
  };
  expense: {
    category: string;
    subcategory?: string;
    business_purpose: string;
    attendees?: string[];
    project_code?: string;
    client_code?: string;
    is_billable: boolean;
    mileage?: number;
  };
  policy_compliance: {
    is_compliant: boolean;
    violations?: string[];
    requires_justification: boolean;
    spending_limit_exceeded: boolean;
  };
  employee_id: string;
  confidence: number;
}

interface ExpenseCategory {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  subcategories: string[];
  spending_limit?: number;
  requires_receipt: boolean;
  requires_justification: boolean;
}

interface ReceiptExpenseWorkflowProps {
  employeeId: string;
  onComplete?: (receiptData: ReceiptData) => void;
  onError?: (error: Error) => void;
  enablePolicyCheck?: boolean;
  autoSubmit?: boolean;
  className?: string;
}

// ==================== EXPENSE CATEGORIES ====================

const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  {
    id: 'travel',
    name: 'Travel',
    icon: Plane,
    subcategories: ['Airfare', 'Hotels', 'Car Rental', 'Taxi/Uber', 'Parking', 'Tolls'],
    spending_limit: 5000,
    requires_receipt: true,
    requires_justification: false
  },
  {
    id: 'meals',
    name: 'Meals & Entertainment',
    icon: Utensils,
    subcategories: ['Business Meals', 'Client Entertainment', 'Team Meals', 'Conference Meals'],
    spending_limit: 100,
    requires_receipt: true,
    requires_justification: true
  },
  {
    id: 'fuel',
    name: 'Fuel & Mileage',
    icon: Fuel,
    subcategories: ['Fuel', 'Mileage Reimbursement', 'Vehicle Maintenance'],
    spending_limit: 500,
    requires_receipt: true,
    requires_justification: false
  },
  {
    id: 'office',
    name: 'Office Supplies',
    icon: ShoppingBag,
    subcategories: ['Stationery', 'Equipment', 'Software', 'Subscriptions'],
    spending_limit: 200,
    requires_receipt: true,
    requires_justification: false
  },
  {
    id: 'lodging',
    name: 'Lodging',
    icon: Hotel,
    subcategories: ['Hotels', 'Vacation Rentals', 'Extended Stay'],
    spending_limit: 300,
    requires_receipt: true,
    requires_justification: false
  }
];

// ==================== MAIN COMPONENT ====================

export function ReceiptExpenseWorkflow({
  employeeId,
  onComplete,
  onError,
  enablePolicyCheck = true,
  autoSubmit = false,
  className = ''
}: ReceiptExpenseWorkflowProps) {
  const [currentStep, setCurrentStep] = useState<'scan' | 'categorize' | 'details' | 'review' | 'submit' | 'complete'>('scan');
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ExpenseCategory | null>(null);

  // ==================== SCANNING HANDLERS ====================

  const handleReceiptCapture = useCallback((result: any) => {
    console.log('🧾 HERA: Receipt captured:', result);
    
    // Extract receipt data from AI result
    const extractedData: ReceiptData = {
      receipt_id: `RCP-${Date.now()}`,
      merchant: {
        name: result.merchant?.name || 'Unknown Merchant',
        address: result.merchant?.address,
        phone: result.merchant?.phone,
        category: result.merchant?.category || 'general'
      },
      transaction: {
        date: result.transaction?.date || new Date().toISOString().split('T')[0],
        time: result.transaction?.time,
        amount: result.transaction?.amount || 0,
        currency: result.transaction?.currency || 'USD',
        tax_amount: result.transaction?.tax_amount,
        tip_amount: result.transaction?.tip_amount,
        payment_method: result.transaction?.payment_method || 'card'
      },
      expense: {
        category: result.expense?.category || '',
        business_purpose: '',
        is_billable: false
      },
      policy_compliance: {
        is_compliant: true,
        requires_justification: false,
        spending_limit_exceeded: false
      },
      employee_id: employeeId,
      confidence: result.confidence || 0.85
    };

    // Auto-categorize based on merchant
    const autoCategory = autoCategorizeMerchant(extractedData.merchant.name);
    if (autoCategory) {
      extractedData.expense.category = autoCategory.id;
      setSelectedCategory(autoCategory);
    }

    setReceiptData(extractedData);
    setCurrentStep('categorize');
  }, [employeeId]);

  const handleScanError = useCallback((error: Error) => {
    console.error('❌ HERA: Receipt scan failed:', error);
    onError?.(error);
  }, [onError]);

  // ==================== CATEGORIZATION LOGIC ====================

  const autoCategorizeMerchant = (merchantName: string): ExpenseCategory | null => {
    const name = merchantName.toLowerCase();
    
    if (name.includes('restaurant') || name.includes('cafe') || name.includes('bar')) {
      return EXPENSE_CATEGORIES.find(cat => cat.id === 'meals') || null;
    }
    if (name.includes('hotel') || name.includes('inn') || name.includes('resort')) {
      return EXPENSE_CATEGORIES.find(cat => cat.id === 'lodging') || null;
    }
    if (name.includes('gas') || name.includes('fuel') || name.includes('shell') || name.includes('exxon')) {
      return EXPENSE_CATEGORIES.find(cat => cat.id === 'fuel') || null;
    }
    if (name.includes('airline') || name.includes('airways') || name.includes('air')) {
      return EXPENSE_CATEGORIES.find(cat => cat.id === 'travel') || null;
    }
    if (name.includes('office') || name.includes('supply') || name.includes('staples')) {
      return EXPENSE_CATEGORIES.find(cat => cat.id === 'office') || null;
    }
    
    return null;
  };

  const checkPolicyCompliance = useCallback((data: ReceiptData): ReceiptData => {
    if (!enablePolicyCheck || !selectedCategory) return data;

    const violations: string[] = [];
    let requiresJustification = false;
    let spendingLimitExceeded = false;

    // Check spending limits
    if (selectedCategory.spending_limit && data.transaction.amount > selectedCategory.spending_limit) {
      violations.push(`Amount exceeds ${selectedCategory.name} limit of $${selectedCategory.spending_limit}`);
      spendingLimitExceeded = true;
    }

    // Check if justification is required
    if (selectedCategory.requires_justification) {
      requiresJustification = true;
    }

    // Check receipt requirement
    if (selectedCategory.requires_receipt && !data.receipt_id) {
      violations.push('Receipt required for this expense category');
    }

    // Specific category rules
    if (selectedCategory.id === 'meals' && data.transaction.amount > 50 && !data.expense.attendees?.length) {
      violations.push('Attendee information required for meals over $50');
      requiresJustification = true;
    }

    return {
      ...data,
      policy_compliance: {
        is_compliant: violations.length === 0,
        violations,
        requires_justification: requiresJustification,
        spending_limit_exceeded: spendingLimitExceeded
      }
    };
  }, [enablePolicyCheck, selectedCategory]);

  // ==================== WORKFLOW HANDLERS ====================

  const handleCategorySelection = useCallback((category: ExpenseCategory) => {
    setSelectedCategory(category);
    if (receiptData) {
      const updatedData = {
        ...receiptData,
        expense: {
          ...receiptData.expense,
          category: category.id
        }
      };
      setReceiptData(checkPolicyCompliance(updatedData));
    }
    setCurrentStep('details');
  }, [receiptData, checkPolicyCompliance]);

  const handleDetailsComplete = useCallback(() => {
    if (receiptData) {
      setReceiptData(checkPolicyCompliance(receiptData));
    }
    setCurrentStep('review');
  }, [receiptData, checkPolicyCompliance]);

  const handleSubmit = useCallback(() => {
    if (receiptData) {
      setCurrentStep('complete');
      onComplete?.(receiptData);
    }
  }, [receiptData, onComplete]);

  // ==================== RENDER METHODS ====================

  const renderScanningStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Scan Receipt</h2>
        <p className="text-muted-foreground">Position the receipt within the camera frame</p>
      </div>
      
      <div className="h-96 rounded-2xl overflow-hidden">
        <UniversalCameraInterface
          mode="receipt"
          onProcessed={handleReceiptCapture}
          onError={handleScanError}
          autoProcess={true}
          enableAI={true}
        />
      </div>
    </div>
  );

  const renderCategorizationStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Categorize Expense</h2>
        <p className="text-muted-foreground">Select the appropriate expense category</p>
      </div>

      {receiptData && (
        <Card className="p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">{receiptData.merchant.name}</h3>
              <p className="text-sm text-muted-foreground">
                {receiptData.transaction.currency} {receiptData.transaction.amount.toFixed(2)} • {new Date(receiptData.transaction.date).toLocaleDateString()}
              </p>
            </div>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Zap className="w-3 h-3" />
              {Math.round(receiptData.confidence * 100)}% Confidence
            </Badge>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {EXPENSE_CATEGORIES.map((category) => {
          const IconComponent = category.icon;
          return (
            <motion.div
              key={category.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card 
                className="p-6 cursor-pointer hover:shadow-lg transition-all border-2 border-transparent hover:border-primary/20"
                onClick={() => handleCategorySelection(category)}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <IconComponent className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{category.name}</h3>
                    {category.spending_limit && (
                      <p className="text-xs text-muted-foreground">Limit: ${category.spending_limit}</p>
                    )}
                  </div>
                </div>
                <div className="space-y-1">
                  {category.subcategories.slice(0, 3).map((sub) => (
                    <p key={sub} className="text-sm text-muted-foreground">• {sub}</p>
                  ))}
                  {category.subcategories.length > 3 && (
                    <p className="text-sm text-muted-foreground">• +{category.subcategories.length - 3} more</p>
                  )}
                </div>
                {(category.requires_receipt || category.requires_justification) && (
                  <div className="mt-3 pt-3 border-t">
                    <div className="flex gap-2">
                      {category.requires_receipt && (
                        <Badge variant="outline" className="text-xs">Receipt Required</Badge>
                      )}
                      {category.requires_justification && (
                        <Badge variant="outline" className="text-xs">Justification Required</Badge>
                      )}
                    </div>
                  </div>
                )}
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );

  const renderDetailsStep = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">Expense Details</h2>
          <p className="text-muted-foreground">Provide additional information for this expense</p>
        </div>
        {selectedCategory && (
          <Badge variant="default" className="flex items-center gap-2">
            <selectedCategory.icon className="w-4 h-4" />
            {selectedCategory.name}
          </Badge>
        )}
      </div>

      {receiptData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Information */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Basic Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Business Purpose *</label>
                <Textarea
                  placeholder="Describe the business purpose of this expense..."
                  value={receiptData.expense.business_purpose}
                  onChange={(e) => setReceiptData(prev => prev ? {
                    ...prev,
                    expense: { ...prev.expense, business_purpose: e.target.value }
                  } : null)}
                  rows={3}
                />
              </div>

              {selectedCategory && (
                <div>
                  <label className="block text-sm font-medium mb-2">Subcategory</label>
                  <Select
                    value={receiptData.expense.subcategory || ''}
                    onValueChange={(value) => setReceiptData(prev => prev ? {
                      ...prev,
                      expense: { ...prev.expense, subcategory: value }
                    } : null)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select subcategory" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedCategory.subcategories.map((sub) => (
                        <SelectItem key={sub} value={sub}>{sub}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="billable"
                  checked={receiptData.expense.is_billable}
                  onChange={(e) => setReceiptData(prev => prev ? {
                    ...prev,
                    expense: { ...prev.expense, is_billable: e.target.checked }
                  } : null)}
                  className="rounded"
                />
                <label htmlFor="billable" className="text-sm font-medium">
                  This expense is billable to a client
                </label>
              </div>
            </div>
          </Card>

          {/* Additional Details */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Additional Details</h3>
            <div className="space-y-4">
              {receiptData.expense.is_billable && (
                <div>
                  <label className="block text-sm font-medium mb-2">Client Code</label>
                  <Input
                    placeholder="Enter client code"
                    value={receiptData.expense.client_code || ''}
                    onChange={(e) => setReceiptData(prev => prev ? {
                      ...prev,
                      expense: { ...prev.expense, client_code: e.target.value }
                    } : null)}
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2">Project Code</label>
                <Input
                  placeholder="Enter project code (optional)"
                  value={receiptData.expense.project_code || ''}
                  onChange={(e) => setReceiptData(prev => prev ? {
                    ...prev,
                    expense: { ...prev.expense, project_code: e.target.value }
                  } : null)}
                />
              </div>

              {selectedCategory?.id === 'meals' && (
                <div>
                  <label className="block text-sm font-medium mb-2">Attendees</label>
                  <Textarea
                    placeholder="List attendees (one per line)..."
                    value={receiptData.expense.attendees?.join('\n') || ''}
                    onChange={(e) => setReceiptData(prev => prev ? {
                      ...prev,
                      expense: { ...prev.expense, attendees: e.target.value.split('\n').filter(Boolean) }
                    } : null)}
                    rows={3}
                  />
                </div>
              )}

              {selectedCategory?.id === 'fuel' && (
                <div>
                  <label className="block text-sm font-medium mb-2">Mileage</label>
                  <Input
                    type="number"
                    placeholder="Enter miles driven"
                    value={receiptData.expense.mileage || ''}
                    onChange={(e) => setReceiptData(prev => prev ? {
                      ...prev,
                      expense: { ...prev.expense, mileage: parseInt(e.target.value) || undefined }
                    } : null)}
                  />
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => setCurrentStep('categorize')}>
          Back
        </Button>
        <Button 
          onClick={handleDetailsComplete}
          disabled={!receiptData?.expense.business_purpose}
        >
          Continue to Review
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );

  const renderReviewStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Review Expense</h2>
        <p className="text-muted-foreground">Verify all information before submitting</p>
      </div>

      {receiptData && (
        <>
          {/* Policy Compliance Check */}
          {enablePolicyCheck && (
            <Card className={`p-4 border-2 ${
              receiptData.policy_compliance.is_compliant 
                ? 'border-green-200 bg-green-50' 
                : 'border-yellow-200 bg-yellow-50'
            }`}>
              <div className="flex items-center gap-3">
                {receiptData.policy_compliance.is_compliant ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-yellow-600" />
                )}
                <div>
                  <h3 className="font-semibold">
                    {receiptData.policy_compliance.is_compliant 
                      ? 'Policy Compliant' 
                      : 'Policy Issues Detected'}
                  </h3>
                  {receiptData.policy_compliance.violations && receiptData.policy_compliance.violations.length > 0 && (
                    <ul className="text-sm mt-1">
                      {receiptData.policy_compliance.violations.map((violation, index) => (
                        <li key={index} className="text-yellow-700">• {violation}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </Card>
          )}

          {/* Expense Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Expense Summary</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Category</label>
                  <p className="font-medium">{selectedCategory?.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Amount</label>
                  <p className="text-2xl font-bold">{receiptData.transaction.currency} {receiptData.transaction.amount.toFixed(2)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Date</label>
                  <p className="font-medium">{new Date(receiptData.transaction.date).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Merchant</label>
                  <p className="font-medium">{receiptData.merchant.name}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">Business Information</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Business Purpose</label>
                  <p className="font-medium">{receiptData.expense.business_purpose}</p>
                </div>
                {receiptData.expense.subcategory && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Subcategory</label>
                    <p className="font-medium">{receiptData.expense.subcategory}</p>
                  </div>
                )}
                {receiptData.expense.is_billable && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Billable</label>
                    <Badge variant="default">Client Billable</Badge>
                  </div>
                )}
                {receiptData.expense.attendees && receiptData.expense.attendees.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Attendees</label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {receiptData.expense.attendees.map((attendee, index) => (
                        <Badge key={index} variant="outline" className="text-xs">{attendee}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </>
      )}

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => setCurrentStep('details')}>
          Back to Details
        </Button>
        <Button 
          onClick={handleSubmit}
          disabled={!receiptData?.policy_compliance.is_compliant && enablePolicyCheck}
        >
          <Send className="w-4 h-4 mr-2" />
          Submit Expense
        </Button>
      </div>
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
        <h2 className="text-3xl font-bold text-green-700 mb-2">Expense Submitted Successfully!</h2>
        <p className="text-muted-foreground">
          Your expense report has been submitted for approval and reimbursement
        </p>
      </div>

      {receiptData && (
        <Card className="p-6 max-w-md mx-auto">
          <div className="space-y-2">
            <p><strong>Receipt ID:</strong> {receiptData.receipt_id}</p>
            <p><strong>Amount:</strong> {receiptData.transaction.currency} {receiptData.transaction.amount.toFixed(2)}</p>
            <p><strong>Category:</strong> {selectedCategory?.name}</p>
            <p><strong>Status:</strong> Pending Approval</p>
          </div>
        </Card>
      )}

      <Button onClick={() => window.location.reload()}>
        Process Another Receipt
      </Button>
    </motion.div>
  );

  // ==================== MAIN RENDER ====================

  return (
    <div className={`max-w-4xl mx-auto space-y-6 ${className}`}>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {currentStep === 'scan' && renderScanningStep()}
          {currentStep === 'categorize' && renderCategorizationStep()}
          {currentStep === 'details' && renderDetailsStep()}
          {currentStep === 'review' && renderReviewStep()}
          {currentStep === 'complete' && renderCompletionStep()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default ReceiptExpenseWorkflow;