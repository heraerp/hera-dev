'use client'

/**
 * HERA Universal CRUD Template - Modal Components
 * Create, Edit, View, and Delete modals with form validation
 */

import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { modalOverlay, modalContent, mobileSlideUp } from '@/lib/animations/smooth-animations'
import { X, Save, Edit, Eye, Trash2, Loader2, AlertCircle, CheckCircle, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card } from '@/components/ui/revolutionary-card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { StatusBadge } from './StatusBadge'
import type { CRUDField, CRUDModalType, FieldValidation } from '../types/crud-types'

interface CRUDModalsProps {
  fields: CRUDField[]
  modalType: CRUDModalType
  currentItem: any | null
  loading?: boolean
  entitySingular?: string
  entitySingularLabel?: string
  onClose: () => void
  onSave: (data: any) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

export const CRUDModals: React.FC<CRUDModalsProps> = ({
  fields,
  modalType,
  currentItem,
  loading = false,
  entitySingular = 'item',
  entitySingularLabel = 'Item',
  onClose,
  onSave,
  onDelete
}) => {
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [step, setStep] = useState(1)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const modalRef = React.useRef<HTMLDivElement>(null)
  const [showScrollIndicator, setShowScrollIndicator] = useState(false)

  // Check if mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Focus management and keyboard navigation
  useEffect(() => {
    if (modalType && modalRef.current) {
      // Focus the modal container for better accessibility
      modalRef.current.focus()
    }

    // Handle keyboard navigation
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
      
      // Improve scrolling with arrow keys
      if (modalRef.current) {
        const scrollContainer = modalRef.current.querySelector('.modal-content')
        if (scrollContainer) {
          if (e.key === 'PageDown') {
            e.preventDefault()
            scrollContainer.scrollTop += scrollContainer.clientHeight * 0.8
          } else if (e.key === 'PageUp') {
            e.preventDefault()
            scrollContainer.scrollTop -= scrollContainer.clientHeight * 0.8
          }
        }
      }
    }

    if (modalType) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [modalType, onClose])

  // Form fields based on modal type
  const formFields = useMemo(() => {
    switch (modalType) {
      case 'create':
        return fields.filter(field => field.showInCreate !== false)
      case 'edit':
        return fields.filter(field => field.showInEdit !== false)
      case 'view':
        return fields.filter(field => field.showInView !== false)
      default:
        return fields
    }
  }, [fields, modalType])

  // Check if content is scrollable
  useEffect(() => {
    const checkScrollable = () => {
      if (modalRef.current) {
        const scrollContainer = modalRef.current.querySelector('.modal-content')
        if (scrollContainer) {
          const isScrollable = scrollContainer.scrollHeight > scrollContainer.clientHeight
          setShowScrollIndicator(isScrollable)
        }
      }
    }

    if (modalType) {
      // Check after content is rendered
      const timeoutId = setTimeout(checkScrollable, 100)
      // Also check when window resizes
      window.addEventListener('resize', checkScrollable)
      return () => {
        clearTimeout(timeoutId)
        window.removeEventListener('resize', checkScrollable)
      }
    }
  }, [modalType, formFields, step])

  // Multi-step form configuration
  const steps = useMemo(() => {
    if (modalType === 'view' || modalType === 'delete') return [formFields]
    
    // Group fields by step (you can customize this logic)
    const basicFields = formFields.filter(field => 
      ['text', 'email', 'tel', 'number', 'currency', 'select'].includes(field.type) && field.required
    )
    const advancedFields = formFields.filter(field => 
      !basicFields.includes(field) && !['textarea', 'richtext'].includes(field.type)
    )
    const detailFields = formFields.filter(field => 
      ['textarea', 'richtext', 'json'].includes(field.type)
    )

    const stepGroups = []
    if (basicFields.length > 0) stepGroups.push(basicFields)
    if (advancedFields.length > 0) stepGroups.push(advancedFields)
    if (detailFields.length > 0) stepGroups.push(detailFields)

    return stepGroups.length > 1 ? stepGroups : [formFields]
  }, [formFields, modalType])

  const totalSteps = steps.length
  const currentStepFields = steps[step - 1] || []

  // Initialize form data and scroll to top
  useEffect(() => {
    if (modalType === 'create') {
      const initialData: Record<string, any> = {}
      formFields.forEach(field => {
        initialData[field.key] = field.defaultValue || getDefaultValueForType(field.type)
      })
      setFormData(initialData)
    } else if (modalType === 'edit' && currentItem) {
      setFormData({ ...currentItem })
    }
    setErrors({})
    setStep(1)
    setSuccess(false)
    
    // Scroll to top when modal opens
    if (modalType) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      // Also prevent body scroll when modal is open
      document.body.style.overflow = 'hidden'
    }
    
    // Cleanup function to restore body scroll
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [modalType, currentItem, formFields])

  // Get default value based on field type
  const getDefaultValueForType = (type: string) => {
    switch (type) {
      case 'boolean':
      case 'switch':
        return false
      case 'number':
      case 'currency':
      case 'percentage':
        return 0
      case 'multiselect':
        return []
      default:
        return ''
    }
  }

  // Validate field
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
      return validation.custom(value, formData)
    }

    return null
  }

  // Validate current step
  const validateStep = (stepFields: CRUDField[]): boolean => {
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

  // Handle form field change
  const handleFieldChange = (fieldKey: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldKey]: value }))
    
    // Clear error for this field
    if (errors[fieldKey]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[fieldKey]
        return newErrors
      })
    }
  }

  // Auto-scroll to next field when Tab is pressed
  const handleFieldKeyDown = (e: React.KeyboardEvent, fieldKey: string) => {
    if (e.key === 'Tab' && !e.shiftKey) {
      // Find the next field
      const currentIndex = currentStepFields.findIndex(f => f.key === fieldKey)
      const nextField = currentStepFields[currentIndex + 1]
      
      if (nextField) {
        // Small delay to allow tab to complete
        setTimeout(() => {
          const nextElement = document.getElementById(nextField.key)
          if (nextElement) {
            nextElement.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'center',
              inline: 'nearest'
            })
          }
        }, 100)
      }
    }
  }

  // Handle next step
  const handleNextStep = () => {
    if (validateStep(currentStepFields)) {
      setStep(prev => Math.min(prev + 1, totalSteps))
    }
  }

  // Handle form submit
  const handleSubmit = async () => {
    if (!validateStep(currentStepFields)) return

    setSaving(true)
    try {
      await onSave(formData)
      setSuccess(true)
      setTimeout(() => {
        onClose()
      }, 1500)
    } catch (error) {
      console.error('Save error:', error)
    } finally {
      setSaving(false)
    }
  }

  // Handle delete
  const handleDelete = async () => {
    if (!currentItem?.id) return

    setSaving(true)
    try {
      await onDelete(currentItem.id)
      setSuccess(true)
      setTimeout(() => {
        onClose()
      }, 1500)
    } catch (error) {
      console.error('Delete error:', error)
    } finally {
      setSaving(false)
    }
  }

  // Render form field
  const renderFormField = (field: CRUDField, isViewMode = false) => {
    const value = formData[field.key]
    const error = errors[field.key]
    const disabled = isViewMode || field.disabled || saving

    const fieldProps = {
      id: field.key,
      disabled,
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
            onKeyDown={(e) => handleFieldKeyDown(e, field.key)}
            placeholder={field.placeholder}
            rows={4}
          />
        )
        break

      case 'select':
        input = (
          <Select
            value={value || ''}
            onValueChange={(newValue) => handleFieldChange(field.key, newValue)}
            disabled={disabled}
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
              disabled={disabled}
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
              onKeyDown={(e) => handleFieldKeyDown(e, field.key)}
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
              onKeyDown={(e) => handleFieldKeyDown(e, field.key)}
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
            onKeyDown={(e) => handleFieldKeyDown(e, field.key)}
            placeholder={field.placeholder}
          />
        )
    }

    if (isViewMode && field.type !== 'boolean' && field.type !== 'switch') {
      return (
        <div>
          <Label className="text-sm font-medium text-gray-500 mb-1">
            {field.label}
          </Label>
          <div className="text-sm text-gray-900">
            {field.render ? field.render(value, currentItem, field) : (value || '-')}
          </div>
        </div>
      )
    }

    return (
      <div className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
        <Label htmlFor={field.key} className="text-sm font-medium text-gray-700 mb-2">
          {field.label}
          {field.required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        {input}
        {field.helpText && (
          <p className="mt-1 text-xs text-gray-500">{field.helpText}</p>
        )}
        {error && (
          <p className="mt-1 text-xs text-red-600">{error}</p>
        )}
      </div>
    )
  }

  if (!modalType) return null

  return (
    <AnimatePresence>
      <motion.div
        variants={modalOverlay}
        initial="initial"
        animate="animate"
        exit="exit"
        className={`fixed inset-0 z-50 bg-black/50 backdrop-blur-sm ${
          isMobile 
            ? 'flex items-end justify-center' 
            : 'flex items-start justify-center p-4 overflow-y-auto'
        }`}
        onClick={(e) => e.target === e.currentTarget && onClose()}
        style={isMobile ? {} : { paddingTop: '2rem' }}
      >
        <motion.div
          ref={modalRef}
          variants={isMobile ? mobileSlideUp : modalContent}
          initial="initial"
          animate="animate"
          exit="exit"
          className={`w-full overflow-hidden ${
            isMobile 
              ? 'max-h-[90vh] rounded-t-2xl' 
              : 'max-w-4xl max-h-[85vh] mb-8 rounded-xl'
          }`}
          tabIndex={-1}
        >
          <Card className="bg-white border-0 shadow-2xl">
            {/* Mobile drag handle */}
            {isMobile && (
              <div className="flex justify-center p-2 bg-gray-100">
                <div className="w-8 h-1 bg-gray-300 rounded-full"></div>
              </div>
            )}
            
            {/* Header */}
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                    {modalType === 'create' && <Plus className="w-5 h-5 text-white" />}
                    {modalType === 'edit' && <Edit className="w-5 h-5 text-white" />}
                    {modalType === 'view' && <Eye className="w-5 h-5 text-white" />}
                    {modalType === 'delete' && <Trash2 className="w-5 h-5 text-white" />}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {modalType === 'create' && `Create ${entitySingularLabel}`}
                      {modalType === 'edit' && `Edit ${entitySingularLabel}`}
                      {modalType === 'view' && `${entitySingularLabel} Details`}
                      {modalType === 'delete' && `Delete ${entitySingularLabel}`}
                    </h2>
                    <p className="text-sm text-gray-600">
                      {modalType === 'create' && `Add a new ${entitySingularLabel.toLowerCase()} to your system`}
                      {modalType === 'edit' && `Update ${entitySingularLabel.toLowerCase()} information`}
                      {modalType === 'view' && `View ${entitySingularLabel.toLowerCase()} details and specifications`}
                      {modalType === 'delete' && `Permanently remove this ${entitySingularLabel.toLowerCase()}`}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={onClose}>
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Progress indicator for multi-step forms */}
              {(modalType === 'create' || modalType === 'edit') && totalSteps > 1 && (
                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                    <span>Step {step} of {totalSteps}</span>
                    <span>{Math.round((step / totalSteps) * 100)}% Complete</span>
                  </div>
                  <Progress value={(step / totalSteps) * 100} className="h-2" />
                </div>
              )}
            </div>

            {/* Scroll indicator */}
            {showScrollIndicator && (
              <div className="px-6 py-2 bg-blue-50 border-b border-blue-200">
                <div className="flex items-center gap-2 text-sm text-blue-600">
                  <div className="w-4 h-4 flex items-center justify-center">
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                  </div>
                  <span>Scroll down to see more fields</span>
                </div>
              </div>
            )}

            {/* Content */}
            <div 
              className="modal-scrollbar modal-content overflow-y-auto overflow-x-hidden" 
              style={{ 
                maxHeight: isMobile ? 'calc(90vh - 200px)' : 'calc(85vh - 200px)',
                minHeight: '300px'
              }}
            >
              {/* Success State */}
              {success && (
                <div className="p-8 text-center">
                  <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-600" />
                  <h3 className="text-lg font-semibold text-green-800 mb-2">
                    {modalType === 'delete' ? 'Deleted Successfully!' : 'Success!'}
                  </h3>
                  <p className="text-green-600">
                    {modalType === 'create' && `${entitySingularLabel} has been created successfully`}
                    {modalType === 'edit' && `${entitySingularLabel} has been updated successfully`}
                    {modalType === 'delete' && `${entitySingularLabel} has been removed from your system`}
                  </p>
                </div>
              )}

              {/* Delete Confirmation */}
              {modalType === 'delete' && !success && (
                <div className="p-8 text-center">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Trash2 className="w-8 h-8 text-red-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Delete {entitySingularLabel}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Are you sure you want to delete <strong>{currentItem?.name || 'this item'}</strong>?
                    This action cannot be undone.
                  </p>
                  <div className="flex gap-3 justify-center">
                    <Button variant="outline" onClick={onClose}>
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleDelete}
                      disabled={saving}
                    >
                      {saving ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          Deleting...
                        </>
                      ) : (
                        `Delete ${entitySingularLabel}`
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {/* Form Content */}
              {(modalType === 'create' || modalType === 'edit' || modalType === 'view') && !success && (
                <div className="p-6 space-y-6 pb-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {currentStepFields.map((field) => (
                      <React.Fragment key={field.key}>
                        {renderFormField(field, modalType === 'view')}
                      </React.Fragment>
                    ))}
                  </div>
                  {/* Add extra padding at bottom for better scrolling */}
                  <div className="h-4"></div>
                </div>
              )}
            </div>

            {/* Footer */}
            {!success && modalType !== 'delete' && (
              <div className="p-6 border-t border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    {step > 1 && modalType !== 'view' && (
                      <Button variant="outline" onClick={() => setStep(step - 1)}>
                        Previous
                      </Button>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" onClick={onClose}>
                      {modalType === 'view' ? 'Close' : 'Cancel'}
                    </Button>

                    {modalType !== 'view' && (
                      <>
                        {step < totalSteps ? (
                          <Button onClick={handleNextStep}>
                            Next
                          </Button>
                        ) : (
                          <Button
                            onClick={handleSubmit}
                            disabled={saving}
                            className="gap-2"
                          >
                            {saving ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                {modalType === 'create' ? 'Creating...' : 'Updating...'}
                              </>
                            ) : (
                              <>
                                <Save className="w-4 h-4" />
                                {modalType === 'create' ? `Create ${entitySingularLabel}` : `Update ${entitySingularLabel}`}
                              </>
                            )}
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default CRUDModals