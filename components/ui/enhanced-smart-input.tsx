/**
 * Enhanced Smart Input Component
 * Advanced input with real-time validation, suggestions, and business logic
 */

'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  AlertTriangle, 
  CheckCircle, 
  Loader2, 
  Eye, 
  EyeOff, 
  Info,
  Lightbulb,
  Search,
  X
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface Suggestion {
  value: string
  label: string
  description?: string
  category?: string
  confidence?: number
}

interface ValidationRule {
  name: string
  test: (value: string) => boolean | Promise<boolean>
  message: string
  type: 'error' | 'warning' | 'info'
}

interface EnhancedSmartInputProps {
  label: string
  name: string
  type?: string
  placeholder?: string
  icon?: React.ReactNode
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  onFocus?: () => void
  error?: string
  warning?: string
  isValidating?: boolean
  isValid?: boolean
  suggestions?: Suggestion[]
  onSuggestionClick?: (suggestion: Suggestion) => void
  disabled?: boolean
  required?: boolean
  
  // Enhanced features
  helperText?: string
  maxLength?: number
  showCharCount?: boolean
  validationRules?: ValidationRule[]
  autoSuggestions?: boolean
  showPassword?: boolean
  clearable?: boolean
  autoComplete?: string
  pattern?: string
  
  // Real-time features
  debounceMs?: number
  validateOnChange?: boolean
  showValidationStatus?: boolean
  smartFormat?: boolean
  
  // Accessibility
  ariaLabel?: string
  ariaDescribedBy?: string
  
  // Styling
  variant?: 'default' | 'success' | 'warning' | 'error'
  size?: 'sm' | 'md' | 'lg'
}

export const EnhancedSmartInput: React.FC<EnhancedSmartInputProps> = ({
  label,
  name,
  type = 'text',
  placeholder,
  icon,
  value,
  onChange,
  onBlur,
  onFocus,
  error,
  warning,
  isValidating,
  isValid,
  suggestions = [],
  onSuggestionClick,
  disabled,
  required,
  helperText,
  maxLength,
  showCharCount = false,
  validationRules = [],
  autoSuggestions = false,
  showPassword = false,
  clearable = false,
  autoComplete,
  pattern,
  debounceMs = 300,
  validateOnChange = true,
  showValidationStatus = true,
  smartFormat = false,
  ariaLabel,
  ariaDescribedBy,
  variant = 'default',
  size = 'md'
}) => {
  const [isFocused, setIsFocused] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [internalValidating, setInternalValidating] = useState(false)
  const [validationResults, setValidationResults] = useState<{ [key: string]: boolean }>({})
  const [showPasswordText, setShowPasswordText] = useState(false)
  const [filteredSuggestions, setFilteredSuggestions] = useState<Suggestion[]>([])
  
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<NodeJS.Timeout>()

  // Debounced validation
  const debouncedValidation = useCallback(async (inputValue: string) => {
    if (!validateOnChange || validationRules.length === 0) return

    setInternalValidating(true)
    const results: { [key: string]: boolean } = {}

    for (const rule of validationRules) {
      try {
        const result = await rule.test(inputValue)
        results[rule.name] = result
      } catch (error) {
        console.warn(`Validation rule "${rule.name}" failed:`, error)
        results[rule.name] = false
      }
    }

    setValidationResults(results)
    setInternalValidating(false)
  }, [validateOnChange, validationRules])

  // Handle input change with debouncing
  const handleChange = useCallback((newValue: string) => {
    // Smart formatting
    let formattedValue = newValue
    if (smartFormat) {
      if (type === 'tel') {
        // Format phone numbers
        formattedValue = newValue.replace(/\D/g, '').replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3')
      } else if (type === 'email') {
        // Lowercase email
        formattedValue = newValue.toLowerCase()
      }
    }

    // Apply max length
    if (maxLength && formattedValue.length > maxLength) {
      formattedValue = formattedValue.slice(0, maxLength)
    }

    onChange(formattedValue)

    // Debounced validation
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }
    debounceRef.current = setTimeout(() => {
      debouncedValidation(formattedValue)
    }, debounceMs)

    // Filter suggestions
    if (autoSuggestions && suggestions.length > 0) {
      const filtered = suggestions.filter(suggestion =>
        suggestion.label.toLowerCase().includes(formattedValue.toLowerCase()) ||
        suggestion.value.toLowerCase().includes(formattedValue.toLowerCase())
      ).slice(0, 5) // Limit to 5 suggestions
      setFilteredSuggestions(filtered)
      setShowSuggestions(filtered.length > 0 && formattedValue.length > 0)
    }
  }, [onChange, smartFormat, type, maxLength, debounceMs, debouncedValidation, autoSuggestions, suggestions])

  // Handle focus
  const handleFocus = useCallback(() => {
    setIsFocused(true)
    if (suggestions.length > 0) {
      setShowSuggestions(true)
    }
    onFocus?.()
  }, [suggestions.length, onFocus])

  // Handle blur
  const handleBlur = useCallback(() => {
    setIsFocused(false)
    setTimeout(() => setShowSuggestions(false), 200) // Delay to allow suggestion clicks
    onBlur?.()
  }, [onBlur])

  // Handle suggestion click
  const handleSuggestionClick = useCallback((suggestion: Suggestion) => {
    onChange(suggestion.value)
    onSuggestionClick?.(suggestion)
    setShowSuggestions(false)
    inputRef.current?.focus()
  }, [onChange, onSuggestionClick])

  // Clear input
  const handleClear = useCallback(() => {
    onChange('')
    inputRef.current?.focus()
  }, [onChange])

  // Get validation status
  const getValidationStatus = () => {
    const failedRules = validationRules.filter(rule => 
      validationResults[rule.name] === false
    )
    const passedRules = validationRules.filter(rule => 
      validationResults[rule.name] === true
    )

    return {
      errors: failedRules.filter(rule => rule.type === 'error'),
      warnings: failedRules.filter(rule => rule.type === 'warning'),
      passed: passedRules.length,
      total: validationRules.length
    }
  }

  const validationStatus = getValidationStatus()
  const hasErrors = error || validationStatus.errors.length > 0
  const hasWarnings = warning || validationStatus.warnings.length > 0
  const isCurrentlyValid = isValid || (validationStatus.total > 0 && validationStatus.errors.length === 0)

  // Dynamic styling
  const getInputClasses = () => {
    const baseClasses = "w-full transition-all duration-200 focus:outline-none focus:ring-2"
    
    const sizeClasses = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-3 py-2",
      lg: "px-4 py-3 text-lg"
    }

    const variantClasses = {
      default: "border-gray-300 focus:ring-blue-500 focus:border-blue-500",
      success: "border-green-500 focus:ring-green-500 focus:border-green-500",
      warning: "border-yellow-500 focus:ring-yellow-500 focus:border-yellow-500",
      error: "border-red-500 focus:ring-red-500 focus:border-red-500"
    }

    const statusClasses = hasErrors ? 'border-red-500 focus:ring-red-500' :
                         hasWarnings ? 'border-yellow-500 focus:ring-yellow-500' :
                         isCurrentlyValid ? 'border-green-500 focus:ring-green-500' :
                         'border-gray-300 focus:ring-blue-500'

    return cn(
      baseClasses,
      sizeClasses[size],
      variant === 'default' ? statusClasses : variantClasses[variant],
      icon && "pl-10",
      (clearable && value) && "pr-10",
      disabled && "bg-gray-100 cursor-not-allowed"
    )
  }

  const currentInputType = type === 'password' && showPasswordText ? 'text' : type

  return (
    <div className="space-y-2">
      {/* Label */}
      <div className="flex items-center justify-between">
        <Label 
          htmlFor={name} 
          className="text-sm font-medium text-gray-700 flex items-center gap-1"
        >
          {label}
          {required && <span className="text-red-500">*</span>}
        </Label>
        
        {showCharCount && maxLength && (
          <span className={cn(
            "text-xs",
            value.length > maxLength * 0.9 ? "text-yellow-600" : "text-gray-400"
          )}>
            {value.length}/{maxLength}
          </span>
        )}
      </div>

      {/* Input Container */}
      <div className="relative">
        {/* Left Icon */}
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10">
            {icon}
          </div>
        )}

        {/* Input Field */}
        <Input
          ref={inputRef}
          id={name}
          name={name}
          type={currentInputType}
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          className={getInputClasses()}
          autoComplete={autoComplete}
          pattern={pattern}
          maxLength={maxLength}
          aria-label={ariaLabel || label}
          aria-describedby={ariaDescribedBy}
          aria-invalid={hasErrors}
        />

        {/* Right Side Controls */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
          {/* Validation Status */}
          {showValidationStatus && (
            <div className="flex items-center">
              {(isValidating || internalValidating) && (
                <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
              )}
              {!isValidating && !internalValidating && isCurrentlyValid && value && (
                <CheckCircle className="w-4 h-4 text-green-500" />
              )}
              {!isValidating && !internalValidating && hasErrors && (
                <AlertTriangle className="w-4 h-4 text-red-500" />
              )}
              {!isValidating && !internalValidating && hasWarnings && !hasErrors && (
                <AlertTriangle className="w-4 h-4 text-yellow-500" />
              )}
            </div>
          )}

          {/* Password Toggle */}
          {type === 'password' && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-auto p-1"
              onClick={() => setShowPasswordText(!showPasswordText)}
            >
              {showPasswordText ? 
                <EyeOff className="w-4 h-4" /> : 
                <Eye className="w-4 h-4" />
              }
            </Button>
          )}

          {/* Clear Button */}
          {clearable && value && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-auto p-1"
              onClick={handleClear}
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Suggestions Dropdown */}
        <AnimatePresence>
          {showSuggestions && (filteredSuggestions.length > 0 || suggestions.length > 0) && (
            <motion.div
              ref={suggestionsRef}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
            >
              {(autoSuggestions ? filteredSuggestions : suggestions).map((suggestion, index) => (
                <button
                  key={index}
                  type="button"
                  className="w-full px-3 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 flex items-center gap-2 border-b border-gray-100 last:border-b-0"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  <div className="flex-1">
                    <div className="font-medium text-sm">{suggestion.label}</div>
                    {suggestion.description && (
                      <div className="text-xs text-gray-500">{suggestion.description}</div>
                    )}
                  </div>
                  {suggestion.confidence && (
                    <Badge variant="secondary" className="text-xs">
                      {Math.round(suggestion.confidence * 100)}%
                    </Badge>
                  )}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Validation Messages */}
      <AnimatePresence>
        {validationStatus.errors.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-1"
          >
            {validationStatus.errors.map((rule, index) => (
              <p key={index} className="text-sm text-red-600 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                {rule.message}
              </p>
            ))}
          </motion.div>
        )}

        {validationStatus.warnings.length > 0 && !hasErrors && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-1"
          >
            {validationStatus.warnings.map((rule, index) => (
              <p key={index} className="text-sm text-yellow-600 flex items-center gap-1">
                <Info className="w-3 h-3" />
                {rule.message}
              </p>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Message */}
      {error && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm text-red-600 flex items-center gap-1"
        >
          <AlertTriangle className="w-3 h-3" />
          {error}
        </motion.p>
      )}

      {/* Warning Message */}
      {warning && !error && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm text-yellow-600 flex items-center gap-1"
        >
          <Info className="w-3 h-3" />
          {warning}
        </motion.p>
      )}

      {/* Helper Text */}
      {helperText && !error && !warning && (
        <p className="text-xs text-gray-500 flex items-center gap-1">
          <Lightbulb className="w-3 h-3" />
          {helperText}
        </p>
      )}

      {/* Validation Progress */}
      {showValidationStatus && validationRules.length > 0 && (
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <div className="flex-1 bg-gray-200 rounded-full h-1">
            <div 
              className={cn(
                "h-1 rounded-full transition-all duration-300",
                hasErrors ? "bg-red-500" : 
                hasWarnings ? "bg-yellow-500" : 
                "bg-green-500"
              )}
              style={{ 
                width: `${(validationStatus.passed / validationStatus.total) * 100}%` 
              }}
            />
          </div>
          <span>{validationStatus.passed}/{validationStatus.total} checks passed</span>
        </div>
      )}
    </div>
  )
}

export default EnhancedSmartInput