'use client'

/**
 * HERA Universal Frontend Template - Form Page
 * Clean, intuitive form layout for create/edit operations
 * Follows "Don't Make Me Think" principles with clear visual flow
 */

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Save, X, ArrowLeft, ArrowRight, Check, AlertCircle, 
  Eye, EyeOff, Plus, Minus, Upload, FileText, Loader2
} from 'lucide-react'
import { DashboardLayout } from '../layouts/DashboardLayout'
import { CenteredLayout } from '../layouts/CenteredLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card } from '@/components/ui/revolutionary-card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import type { CRUDField, FieldValidation } from '@/templates/crud/types/crud-types'

interface FormStep {
  id: string
  title: string
  description?: string
  fields: string[] // Field keys for this step
  optional?: boolean
}

interface FormPageProps {
  // Page metadata
  title: string
  subtitle?: string
  description?: string
  
  // Form configuration
  fields: CRUDField[]
  initialData?: Record<string, any>
  mode?: 'create' | 'edit' | 'view'
  
  // Multi-step configuration
  steps?: FormStep[]
  showProgress?: boolean
  allowStepJumping?: boolean
  
  // Layout options
  layout?: 'dashboard' | 'centered' | 'fullscreen'
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl'
  columns?: 1 | 2 | 3
  
  // Form behavior
  autoSave?: boolean
  autoSaveInterval?: number // seconds
  enableDirtyCheck?: boolean
  showFieldHelp?: boolean
  compactMode?: boolean
  
  // Actions
  onSubmit: (data: Record<string, any>) => Promise<void>
  onCancel?: () => void
  onSave?: (data: Record<string, any>) => Promise<void> // For auto-save
  onFieldChange?: (field: string, value: any, allData: Record<string, any>) => void
  
  // Customization
  submitLabel?: string
  cancelLabel?: string
  saveLabel?: string
  showCancel?: boolean
  showSave?: boolean
  actions?: React.ReactNode
  
  // State
  loading?: boolean
  disabled?: boolean
  className?: string
  
  // Callbacks
  onSuccess?: (data: Record<string, any>) => void
  onError?: (error: string) => void
}

// Default validation functions
const validateField = (field: CRUDField, value: any): string | null => {
  const validation = field.validation || {}

  // Required validation
  if (field.required && (!value || (Array.isArray(value) && value.length === 0))) {
    return `${field.label} is required`
  }

  if (!value) return null

  // Type-specific validation
  switch (field.type) {
    case 'email':
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailPattern.test(value)) {
        return 'Please enter a valid email address'
      }
      break

    case 'tel':
      const phonePattern = /^[\+]?[1-9][\d]{0,15}$/
      if (!phonePattern.test(value.replace(/\s/g, ''))) {
        return 'Please enter a valid phone number'
      }
      break

    case 'url':
      try {
        new URL(value)
      } catch {
        return 'Please enter a valid URL'
      }
      break

    case 'number':
    case 'currency':
    case 'percentage':
      const numValue = parseFloat(value)
      if (isNaN(numValue)) {
        return 'Please enter a valid number'
      }
      if (validation.min !== undefined && numValue < validation.min) {
        return `Value must be at least ${validation.min}`
      }
      if (validation.max !== undefined && numValue > validation.max) {
        return `Value must be no more than ${validation.max}`
      }
      break
  }

  // String validations
  if (typeof value === 'string') {
    if (validation.minLength && value.length < validation.minLength) {
      return `Must be at least ${validation.minLength} characters`
    }
    if (validation.maxLength && value.length > validation.maxLength) {
      return `Must be no more than ${validation.maxLength} characters`
    }
    if (validation.pattern && !validation.pattern.test(value)) {
      return 'Invalid format'
    }
  }

  // Custom validation
  if (validation.custom) {
    return validation.custom(value, {})
  }

  return null
}

export const FormPage: React.FC<FormPageProps> = ({
  title,
  subtitle,
  description,
  fields,
  initialData = {},
  mode = 'create',
  steps = [],
  showProgress = false,
  allowStepJumping = false,
  layout = 'dashboard',
  maxWidth = 'lg',
  columns = 1,
  autoSave = false,
  autoSaveInterval = 30,
  enableDirtyCheck = true,
  showFieldHelp = true,
  compactMode = false,
  onSubmit,
  onCancel,
  onSave,
  onFieldChange,
  submitLabel,
  cancelLabel = 'Cancel',
  saveLabel = 'Save Draft',
  showCancel = true,
  showSave = false,
  actions,
  loading = false,
  disabled = false,
  className = '',
  onSuccess,
  onError
}) => {
  const [formData, setFormData] = useState<Record<string, any>>(initialData)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isDirty, setIsDirty] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  const isMultiStep = steps.length > 0
  const totalSteps = steps.length || 1
  const isLastStep = currentStep === totalSteps - 1
  const isViewMode = mode === 'view'

  // Get fields for current step
  const getCurrentStepFields = () => {
    if (!isMultiStep) return fields
    const step = steps[currentStep]
    return fields.filter(field => step.fields.includes(field.key))
  }

  // Auto-save functionality
  useEffect(() => {
    if (!autoSave || !onSave || !isDirty) return

    const interval = setInterval(async () => {
      if (isDirty) {
        setIsSaving(true)
        try {
          await onSave(formData)
          setIsDirty(false)
          setLastSaved(new Date())
        } catch (error) {
          onError?.('Auto-save failed')
        } finally {
          setIsSaving(false)
        }
      }
    }, autoSaveInterval * 1000)

    return () => clearInterval(interval)
  }, [autoSave, onSave, isDirty, formData, autoSaveInterval])

  // Handle field changes
  const handleFieldChange = (fieldKey: string, value: any) => {
    const newData = { ...formData, [fieldKey]: value }
    setFormData(newData)
    setIsDirty(true)
    
    // Clear error for this field
    if (errors[fieldKey]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[fieldKey]
        return newErrors
      })
    }

    onFieldChange?.(fieldKey, value, newData)
  }

  // Validate current step
  const validateCurrentStep = () => {
    const stepFields = getCurrentStepFields()
    const stepErrors: Record<string, string> = {}
    
    stepFields.forEach(field => {
      const error = validateField(field, formData[field.key])
      if (error) {
        stepErrors[field.key] = error
      }
    })

    setErrors(prev => ({ ...prev, ...stepErrors }))
    return Object.keys(stepErrors).length === 0
  }

  // Handle next step
  const handleNextStep = () => {
    if (validateCurrentStep()) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps - 1))
    }
  }

  // Handle previous step
  const handlePreviousStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0))
  }

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateCurrentStep()) return

    setIsSubmitting(true)
    try {
      await onSubmit(formData)
      setIsDirty(false)
      onSuccess?.(formData)
    } catch (error) {
      onError?.(error instanceof Error ? error.message : 'Submission failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle save draft
  const handleSave = async () => {
    if (!onSave) return

    setIsSaving(true)
    try {
      await onSave(formData)
      setIsDirty(false)
      setLastSaved(new Date())
    } catch (error) {
      onError?.(error instanceof Error ? error.message : 'Save failed')
    } finally {
      setIsSaving(false)
    }
  }

  // Render form field
  const renderFormField = (field: CRUDField) => {
    const value = formData[field.key]
    const error = errors[field.key]
    const fieldDisabled = disabled || field.disabled || isViewMode

    const fieldProps = {
      id: field.key,
      disabled: fieldDisabled,
      className: error ? 'border-red-300' : ''
    }

    let input: React.ReactNode

    switch (field.type) {
      case 'textarea':
        input = (
          <Textarea
            {...fieldProps}
            value={value || ''}
            onChange={(e) => handleFieldChange(field.key, e.target.value)}
            placeholder={field.placeholder}
            rows={compactMode ? 3 : 4}
          />
        )
        break

      case 'select':
        input = (
          <Select
            value={value || ''}
            onValueChange={(newValue) => handleFieldChange(field.key, newValue)}
            disabled={fieldDisabled}
          >
            <SelectTrigger className={error ? 'border-red-300' : ''}>
              <SelectValue placeholder={field.placeholder || `Select ${field.label}`} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option.value} value={option.value.toString()}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )
        break

      case 'boolean':
      case 'switch':
        input = (
          <div className="flex items-center space-x-2">
            <Switch
              id={field.key}
              checked={value || false}
              onCheckedChange={(checked) => handleFieldChange(field.key, checked)}
              disabled={fieldDisabled}
            />
            <Label htmlFor={field.key} className="text-sm">
              {field.label}
            </Label>
          </div>
        )
        break

      case 'currency':
        input = (
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
            <Input
              {...fieldProps}
              type="number"
              step="0.01"
              value={value || ''}
              onChange={(e) => handleFieldChange(field.key, parseFloat(e.target.value) || 0)}
              placeholder={field.placeholder}
              className={`pl-8 ${error ? 'border-red-300' : ''}`}
            />
          </div>
        )
        break

      case 'percentage':
        input = (
          <div className="relative">
            <Input
              {...fieldProps}
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={value || ''}
              onChange={(e) => handleFieldChange(field.key, parseFloat(e.target.value) || 0)}
              placeholder={field.placeholder}
            />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
          </div>
        )
        break

      default:
        input = (
          <Input
            {...fieldProps}
            type={field.type}
            value={value || ''}
            onChange={(e) => handleFieldChange(field.key, e.target.value)}
            placeholder={field.placeholder}
          />
        )
    }

    if (isViewMode && field.type !== 'boolean' && field.type !== 'switch') {
      return (
        <div className={`${field.type === 'textarea' || columns === 1 ? 'col-span-full' : ''}`}>
          <Label className="text-sm font-medium text-gray-500 mb-1">
            {field.label}
          </Label>
          <div className="text-sm text-gray-900 p-3 bg-gray-50 rounded-md">
            {field.render ? field.render(value, formData, field) : (value || '-')}
          </div>
        </div>
      )
    }

    return (
      <div className={`${field.type === 'textarea' || columns === 1 ? 'col-span-full' : ''}`}>
        <Label htmlFor={field.key} className="text-sm font-medium text-gray-700 mb-2">
          {field.label}
          {field.required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        {input}
        {field.helpText && showFieldHelp && (
          <p className="mt-1 text-xs text-gray-500">{field.helpText}</p>
        )}
        {error && (
          <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {error}
          </p>
        )}
      </div>
    )
  }

  // Render progress indicator
  const renderProgress = () => {
    if (!showProgress || !isMultiStep) return null

    const progress = ((currentStep + 1) / totalSteps) * 100

    return (
      <div className="mb-6">
        <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
          <span>Step {currentStep + 1} of {totalSteps}</span>
          <span>{Math.round(progress)}% Complete</span>
        </div>
        <Progress value={progress} className="h-2" />
        {steps[currentStep] && (
          <div className="mt-3">
            <h3 className="font-medium text-gray-900">{steps[currentStep].title}</h3>
            {steps[currentStep].description && (
              <p className="text-sm text-gray-600 mt-1">{steps[currentStep].description}</p>
            )}
          </div>
        )}
      </div>
    )
  }

  // Render auto-save status
  const renderAutoSaveStatus = () => {
    if (!autoSave) return null

    return (
      <div className="text-xs text-gray-500 flex items-center gap-2">
        {isSaving && (
          <>
            <Loader2 className="w-3 h-3 animate-spin" />
            Saving...
          </>
        )}
        {lastSaved && !isSaving && (
          <>
            <Check className="w-3 h-3 text-green-500" />
            Saved {lastSaved.toLocaleTimeString()}
          </>
        )}
        {isDirty && !isSaving && (
          <>
            <div className="w-2 h-2 bg-yellow-500 rounded-full" />
            Unsaved changes
          </>
        )}
      </div>
    )
  }

  // Render form actions
  const renderActions = () => (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        {isMultiStep && currentStep > 0 && (
          <Button
            variant="outline"
            onClick={handlePreviousStep}
            disabled={isSubmitting || isSaving}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
        )}
      </div>

      <div className="flex items-center gap-3">
        {renderAutoSaveStatus()}
        
        {showCancel && onCancel && (
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting || isSaving}
          >
            {cancelLabel}
          </Button>
        )}

        {showSave && onSave && !isViewMode && (
          <Button
            variant="outline"
            onClick={handleSave}
            disabled={isSubmitting || isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {saveLabel}
              </>
            )}
          </Button>
        )}

        {!isViewMode && (
          <>
            {isMultiStep && !isLastStep ? (
              <Button
                onClick={handleNextStep}
                disabled={isSubmitting || isSaving}
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || isSaving}
                className="gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {mode === 'create' ? 'Creating...' : 'Updating...'}
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    {submitLabel || (mode === 'create' ? 'Create' : 'Update')}
                  </>
                )}
              </Button>
            )}
          </>
        )}

        {actions}
      </div>
    </div>
  )

  // Render form content
  const renderFormContent = () => (
    <div className="space-y-6">
      {renderProgress()}
      
      <div className={`grid gap-6 ${
        columns === 1 ? 'grid-cols-1' :
        columns === 2 ? 'grid-cols-1 md:grid-cols-2' :
        'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
      }`}>
        {getCurrentStepFields().map(field => (
          <React.Fragment key={field.key}>
            {renderFormField(field)}
          </React.Fragment>
        ))}
      </div>
      
      <Separator />
      {renderActions()}
    </div>
  )

  // Layout-specific rendering
  if (layout === 'centered') {
    return (
      <CenteredLayout
        title={title}
        subtitle={subtitle}
        description={description}
        maxWidth={maxWidth as any}
        showBackButton={showCancel}
        className={className}
      >
        {renderFormContent()}
      </CenteredLayout>
    )
  }

  return (
    <DashboardLayout title={title} subtitle={subtitle} className={className}>
      <div className={`max-w-${maxWidth} mx-auto p-6`}>
        <Card className="p-8">
          {renderFormContent()}
        </Card>
      </div>
    </DashboardLayout>
  )
}

export default FormPage