"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  X, 
  Plus, 
  ArrowRight, 
  ArrowLeft,
  Save,
  Sparkles,
  AlertCircle,
  CheckCircle,
  Calendar,
  DollarSign,
  FileText,
  Building2,
  Tag,
  Loader2
} from "lucide-react"
import { Button } from "@/components/ui/revolutionary-button"
import { Card } from "@/components/ui/revolutionary-card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { HeraTransactionService } from "@/services/heraTransactions"
import { useHeraOrganization } from "@/hooks/useHeraOrganization"
import type { 
  TransactionType, 
  CreateTransactionRequest,
  UniversalTransaction,
  UniversalTransactionLine
} from "@/types/transactions"
import motionConfig from "@/lib/motion"

interface CreateTransactionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onTransactionCreated?: (transaction: UniversalTransaction) => void
  initialType?: TransactionType
  className?: string
}

interface TransactionLineInput {
  line_type: string
  description: string
  debit_amount?: number
  credit_amount?: number
  account_code?: string
  account_name?: string
  cost_center?: string
  department?: string
  project_code?: string
}

const TRANSACTION_TYPES: Array<{ value: TransactionType; label: string; icon: string; description: string }> = [
  { 
    value: 'journal_entry', 
    label: 'Journal Entry', 
    icon: '📝', 
    description: 'Manual accounting entries for adjustments and corrections'
  },
  { 
    value: 'sales', 
    label: 'Sales Transaction', 
    icon: '💰', 
    description: 'Revenue transactions from sales activities'
  },
  { 
    value: 'purchase', 
    label: 'Purchase Transaction', 
    icon: '🛒', 
    description: 'Expense transactions for purchases and procurement'
  },
  { 
    value: 'payment', 
    label: 'Payment Transaction', 
    icon: '💳', 
    description: 'Money movements including payments and receipts'
  },
  { 
    value: 'master_data', 
    label: 'Master Data', 
    icon: '🗂️', 
    description: 'Reference data changes and master data updates'
  },
  { 
    value: 'inventory', 
    label: 'Inventory Transaction', 
    icon: '📦', 
    description: 'Stock movements and inventory adjustments'
  },
  { 
    value: 'payroll', 
    label: 'Payroll Transaction', 
    icon: '👥', 
    description: 'Payroll processing and employee compensation'
  },
  { 
    value: 'reconciliation', 
    label: 'Reconciliation', 
    icon: '🔄', 
    description: 'Bank reconciliations and account matching'
  }
]

const INITIAL_FORM_DATA: CreateTransactionRequest = {
  organization_id: "",
  transaction_type: "journal_entry",
  business_date: new Date().toISOString().split('T')[0],
  transaction_data: {
    description: "",
    reference: "",
    amount: 0
  },
  lines: [],
  tags: [],
  priority_level: "NORMAL"
}

export function CreateTransactionModal({
  open,
  onOpenChange,
  onTransactionCreated,
  initialType,
  className
}: CreateTransactionModalProps) {
  const { currentOrganization, canCreate } = useHeraOrganization()
  
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState<CreateTransactionRequest>(INITIAL_FORM_DATA)
  const [lines, setLines] = useState<TransactionLineInput[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Initialize form when modal opens
  useEffect(() => {
    if (open && currentOrganization) {
      setFormData({
        ...INITIAL_FORM_DATA,
        organization_id: currentOrganization.id,
        transaction_type: initialType || "journal_entry"
      })
      setLines([])
      setStep(1)
      setError(null)
      setSuccess(false)
    }
  }, [open, currentOrganization, initialType])

  const updateFormData = (field: keyof CreateTransactionRequest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const updateTransactionData = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      transaction_data: {
        ...prev.transaction_data,
        [field]: value
      }
    }))
  }

  const addLine = () => {
    setLines(prev => [...prev, {
      line_type: "general",
      description: "",
      debit_amount: 0,
      credit_amount: 0,
      account_code: "",
      account_name: ""
    }])
  }

  const updateLine = (index: number, field: keyof TransactionLineInput, value: any) => {
    setLines(prev => prev.map((line, i) => 
      i === index ? { ...line, [field]: value } : line
    ))
  }

  const removeLine = (index: number) => {
    setLines(prev => prev.filter((_, i) => i !== index))
  }

  const validateStep1 = () => {
    return formData.transaction_type && formData.business_date && formData.transaction_data.description
  }

  const validateStep2 = () => {
    if (lines.length === 0) return true // Lines are optional
    
    // Validate that lines have required fields
    return lines.every(line => 
      line.description && 
      (line.debit_amount || line.credit_amount) &&
      line.account_code
    )
  }

  const validateStep3 = () => {
    // Final validation - all required fields must be present
    return validateStep1() && validateStep2()
  }

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2)
    } else if (step === 2 && validateStep2()) {
      setStep(3)
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const handleSubmit = async () => {
    if (!validateStep3() || !currentOrganization) return

    try {
      setLoading(true)
      setError(null)

      // Prepare the transaction data
      const transactionRequest: CreateTransactionRequest = {
        ...formData,
        lines: lines.length > 0 ? lines.map((line, index) => ({
          line_number: index + 1,
          line_type: line.line_type,
          line_data: {
            description: line.description,
            account_code: line.account_code,
            account_name: line.account_name
          },
          debit_amount: line.debit_amount || 0,
          credit_amount: line.credit_amount || 0,
          description: line.description,
          account_code: line.account_code,
          account_name: line.account_name,
          cost_center: line.cost_center,
          department: line.department,
          project_code: line.project_code
        })) : undefined
      }

      const createdTransaction = await HeraTransactionService.createTransaction(transactionRequest)
      
      setSuccess(true)
      onTransactionCreated?.(createdTransaction)
      
      // Close modal after short delay
      setTimeout(() => {
        onOpenChange(false)
      }, 1500)

    } catch (err) {
      console.error('Error creating transaction:', err)
      setError(err instanceof Error ? err.message : 'Failed to create transaction')
    } finally {
      setLoading(false)
    }
  }

  if (!canCreate) {
    return null
  }

  const selectedType = TRANSACTION_TYPES.find(t => t.value === formData.transaction_type)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`max-w-4xl max-h-[90vh] overflow-hidden ${className}`}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Create Transaction
            {selectedType && (
              <Badge variant="secondary" className="ml-2">
                <span className="mr-1">{selectedType.icon}</span>
                {selectedType.label}
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          {/* Progress Indicator */}
          <div className="flex items-center justify-between mb-6 px-1">
            {[1, 2, 3].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div className={`
                  flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors
                  ${step >= stepNumber 
                    ? 'bg-primary border-primary text-primary-foreground' 
                    : 'border-muted-foreground text-muted-foreground'
                  }
                `}>
                  {success && stepNumber === 3 ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    stepNumber
                  )}
                </div>
                {stepNumber < 3 && (
                  <div className={`
                    w-16 h-0.5 mx-2 transition-colors
                    ${step > stepNumber ? 'bg-primary' : 'bg-muted'}
                  `} />
                )}
              </div>
            ))}
          </div>

          {/* Step Content */}
          <div className="overflow-y-auto max-h-[60vh]">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={motionConfig.spring.smooth}
                  className="space-y-6"
                >
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Transaction Type & Basic Info</h3>
                    
                    {/* Transaction Type Selection */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                      {TRANSACTION_TYPES.map(type => (
                        <motion.div
                          key={type.value}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Card 
                            className={`p-4 cursor-pointer transition-all ${
                              formData.transaction_type === type.value
                                ? 'border-primary bg-primary/5'
                                : 'hover:border-primary/50'
                            }`}
                            onClick={() => updateFormData('transaction_type', type.value)}
                          >
                            <div className="flex items-start gap-3">
                              <span className="text-2xl">{type.icon}</span>
                              <div>
                                <h4 className="font-medium">{type.label}</h4>
                                <p className="text-sm text-muted-foreground">{type.description}</p>
                              </div>
                            </div>
                          </Card>
                        </motion.div>
                      ))}
                    </div>

                    {/* Basic Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="business_date">Business Date</Label>
                        <Input
                          id="business_date"
                          type="date"
                          value={formData.business_date}
                          onChange={(e) => updateFormData('business_date', e.target.value)}
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label htmlFor="priority">Priority Level</Label>
                        <Select
                          value={formData.priority_level}
                          onValueChange={(value) => updateFormData('priority_level', value)}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="LOW">Low</SelectItem>
                            <SelectItem value="NORMAL">Normal</SelectItem>
                            <SelectItem value="HIGH">High</SelectItem>
                            <SelectItem value="URGENT">Urgent</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="description">Description *</Label>
                      <Textarea
                        id="description"
                        placeholder="Enter transaction description..."
                        value={formData.transaction_data.description}
                        onChange={(e) => updateTransactionData('description', e.target.value)}
                        className="mt-1"
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label htmlFor="reference">Reference Number</Label>
                      <Input
                        id="reference"
                        placeholder="External reference number"
                        value={formData.transaction_data.reference || ""}
                        onChange={(e) => updateTransactionData('reference', e.target.value)}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="amount">Total Amount</Label>
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={formData.transaction_data.amount || ""}
                        onChange={(e) => updateTransactionData('amount', parseFloat(e.target.value) || 0)}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={motionConfig.spring.smooth}
                  className="space-y-6"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">Transaction Lines (Optional)</h3>
                      <Button onClick={addLine} size="sm" variant="outline">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Line
                      </Button>
                    </div>

                    {lines.length === 0 ? (
                      <Card className="p-8 text-center">
                        <div className="text-4xl mb-3">📋</div>
                        <h4 className="font-medium mb-2">No transaction lines added</h4>
                        <p className="text-sm text-muted-foreground mb-4">
                          Transaction lines are optional. You can add them for detailed accounting entries.
                        </p>
                        <Button onClick={addLine} variant="outline">
                          Add First Line
                        </Button>
                      </Card>
                    ) : (
                      <div className="space-y-4">
                        {lines.map((line, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="border rounded-lg p-4"
                          >
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-medium">Line {index + 1}</h4>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeLine(index)}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <Label>Description *</Label>
                                <Input
                                  placeholder="Line description"
                                  value={line.description}
                                  onChange={(e) => updateLine(index, 'description', e.target.value)}
                                  className="mt-1"
                                />
                              </div>

                              <div>
                                <Label>Account Code *</Label>
                                <Input
                                  placeholder="Account code"
                                  value={line.account_code || ""}
                                  onChange={(e) => updateLine(index, 'account_code', e.target.value)}
                                  className="mt-1"
                                />
                              </div>

                              <div>
                                <Label>Debit Amount</Label>
                                <Input
                                  type="number"
                                  step="0.01"
                                  placeholder="0.00"
                                  value={line.debit_amount || ""}
                                  onChange={(e) => updateLine(index, 'debit_amount', parseFloat(e.target.value) || 0)}
                                  className="mt-1"
                                />
                              </div>

                              <div>
                                <Label>Credit Amount</Label>
                                <Input
                                  type="number"
                                  step="0.01"
                                  placeholder="0.00"
                                  value={line.credit_amount || ""}
                                  onChange={(e) => updateLine(index, 'credit_amount', parseFloat(e.target.value) || 0)}
                                  className="mt-1"
                                />
                              </div>

                              <div>
                                <Label>Department</Label>
                                <Input
                                  placeholder="Department"
                                  value={line.department || ""}
                                  onChange={(e) => updateLine(index, 'department', e.target.value)}
                                  className="mt-1"
                                />
                              </div>

                              <div>
                                <Label>Cost Center</Label>
                                <Input
                                  placeholder="Cost center"
                                  value={line.cost_center || ""}
                                  onChange={(e) => updateLine(index, 'cost_center', e.target.value)}
                                  className="mt-1"
                                />
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={motionConfig.spring.smooth}
                  className="space-y-6"
                >
                  {success ? (
                    <div className="text-center py-8">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
                      >
                        <CheckCircle className="w-8 h-8 text-green-600" />
                      </motion.div>
                      <h3 className="text-lg font-semibold mb-2">Transaction Created Successfully!</h3>
                      <p className="text-muted-foreground">
                        Your transaction has been created and is pending review.
                      </p>
                    </div>
                  ) : (
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Review & Submit</h3>
                      
                      {/* Summary */}
                      <Card className="p-4 mb-6">
                        <h4 className="font-medium mb-3">Transaction Summary</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Type:</span>
                            <span>{selectedType?.label}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Date:</span>
                            <span>{new Date(formData.business_date).toLocaleDateString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Description:</span>
                            <span className="text-right max-w-xs truncate">{formData.transaction_data.description}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Amount:</span>
                            <span>${formData.transaction_data.amount?.toFixed(2) || '0.00'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Lines:</span>
                            <span>{lines.length} lines</span>
                          </div>
                        </div>
                      </Card>

                      {/* Additional Fields */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="department">Department</Label>
                          <Input
                            id="department"
                            placeholder="Department"
                            value={formData.department || ""}
                            onChange={(e) => updateFormData('department', e.target.value)}
                            className="mt-1"
                          />
                        </div>

                        <div>
                          <Label htmlFor="cost_center">Cost Center</Label>
                          <Input
                            id="cost_center"
                            placeholder="Cost center"
                            value={formData.cost_center || ""}
                            onChange={(e) => updateFormData('cost_center', e.target.value)}
                            className="mt-1"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <Label htmlFor="project_code">Project Code</Label>
                          <Input
                            id="project_code"
                            placeholder="Project code"
                            value={formData.project_code || ""}
                            onChange={(e) => updateFormData('project_code', e.target.value)}
                            className="mt-1"
                          />
                        </div>
                      </div>

                      {error && (
                        <Card className="p-4 border-destructive/20 bg-destructive/5">
                          <div className="flex items-center gap-3">
                            <AlertCircle className="w-5 h-5 text-destructive" />
                            <p className="text-destructive">{error}</p>
                          </div>
                        </Card>
                      )}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Actions */}
          {!success && (
            <div className="flex items-center justify-between pt-6 border-t">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={step === 1 || loading}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>

              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  onClick={() => onOpenChange(false)}
                  disabled={loading}
                >
                  Cancel
                </Button>

                {step < 3 ? (
                  <Button
                    onClick={handleNext}
                    disabled={
                      (step === 1 && !validateStep1()) ||
                      (step === 2 && !validateStep2())
                    }
                  >
                    Next
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={!validateStep3() || loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Create Transaction
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}