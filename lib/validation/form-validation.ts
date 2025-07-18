/**
 * HERA Universal ERP - Form Validation System
 * Real-time form validation with business rules and user feedback
 */

// ==================== TYPES ====================

export interface ValidationRule {
  id: string
  field: string
  message: string
  validator: (value: any, allData?: any) => boolean
  severity: 'error' | 'warning' | 'info'
  required?: boolean
}

export interface ValidationResult {
  field: string
  isValid: boolean
  message: string
  severity: 'error' | 'warning' | 'info'
}

export interface FormValidationState {
  isValid: boolean
  errors: Record<string, ValidationResult>
  warnings: Record<string, ValidationResult>
  info: Record<string, ValidationResult>
  hasErrors: boolean
  hasWarnings: boolean
  touchedFields: Set<string>
}

export interface ValidationSchema {
  [fieldName: string]: ValidationRule[]
}

// ==================== VALIDATORS ====================

export const validators = {
  required: (value: any): boolean => {
    if (value === null || value === undefined) return false
    if (typeof value === 'string') return value.trim().length > 0
    if (Array.isArray(value)) return value.length > 0
    return true
  },

  email: (value: string): boolean => {
    if (!value) return true // Allow empty if not required
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(value)
  },

  phone: (value: string): boolean => {
    if (!value) return true // Allow empty if not required
    const phoneRegex = /^[\+]?[1-9][\d\s\-\(\)]{8,}$/
    return phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''))
  },

  minLength: (min: number) => (value: string): boolean => {
    if (!value) return true // Allow empty if not required
    return value.length >= min
  },

  maxLength: (max: number) => (value: string): boolean => {
    if (!value) return true // Allow empty if not required
    return value.length <= max
  },

  minValue: (min: number) => (value: number | string): boolean => {
    if (!value) return true // Allow empty if not required
    const numValue = typeof value === 'string' ? parseFloat(value) : value
    return !isNaN(numValue) && numValue >= min
  },

  maxValue: (max: number) => (value: number | string): boolean => {
    if (!value) return true // Allow empty if not required
    const numValue = typeof value === 'string' ? parseFloat(value) : value
    return !isNaN(numValue) && numValue <= max
  },

  number: (value: string | number): boolean => {
    if (!value) return true // Allow empty if not required
    const numValue = typeof value === 'string' ? parseFloat(value) : value
    return !isNaN(numValue) && isFinite(numValue)
  },

  positiveNumber: (value: string | number): boolean => {
    if (!value) return true // Allow empty if not required
    const numValue = typeof value === 'string' ? parseFloat(value) : value
    return !isNaN(numValue) && numValue > 0
  },

  url: (value: string): boolean => {
    if (!value) return true // Allow empty if not required
    try {
      new URL(value.startsWith('http') ? value : `https://${value}`)
      return true
    } catch {
      return false
    }
  },

  date: (value: string): boolean => {
    if (!value) return true // Allow empty if not required
    const date = new Date(value)
    return !isNaN(date.getTime()) && date.getFullYear() >= 1900 && date.getFullYear() <= 2100
  },

  time: (value: string): boolean => {
    if (!value) return true // Allow empty if not required
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
    return timeRegex.test(value)
  },

  postalCode: (value: string): boolean => {
    if (!value) return true // Allow empty if not required
    // Support multiple formats: US (12345), UK (SW1A 1AA), CA (K1A 0A6), India (123456)
    const postalRegex = /^[A-Z0-9]{3,10}(\s[A-Z0-9]{3})?$/i
    return postalRegex.test(value.replace(/\s+/g, ' ').trim())
  },

  noSpecialChars: (value: string): boolean => {
    if (!value) return true // Allow empty if not required
    const specialCharsRegex = /^[a-zA-Z0-9\s\-.,()&']+$/
    return specialCharsRegex.test(value)
  },

  businessHours: (openTime: string, closeTime: string): boolean => {
    if (!openTime || !closeTime) return true
    const open = new Date(`2000-01-01T${openTime}:00`)
    const close = new Date(`2000-01-01T${closeTime}:00`)
    return open < close
  }
}

// ==================== RESTAURANT VALIDATION SCHEMA ====================

export const restaurantValidationSchema: ValidationSchema = {
  // Step 1: Business Information
  businessName: [
    {
      id: 'businessName_required',
      field: 'businessName',
      message: 'Restaurant name is required',
      validator: validators.required,
      severity: 'error',
      required: true
    },
    {
      id: 'businessName_length',
      field: 'businessName',
      message: 'Restaurant name must be at least 2 characters',
      validator: validators.minLength(2),
      severity: 'error'
    },
    {
      id: 'businessName_chars',
      field: 'businessName',
      message: 'Restaurant name contains invalid characters',
      validator: validators.noSpecialChars,
      severity: 'warning'
    }
  ],

  cuisineType: [
    {
      id: 'cuisineType_required',
      field: 'cuisineType',
      message: 'Cuisine type is required',
      validator: validators.required,
      severity: 'error',
      required: true
    },
    {
      id: 'cuisineType_length',
      field: 'cuisineType',
      message: 'Cuisine type must be at least 2 characters',
      validator: validators.minLength(2),
      severity: 'error'
    }
  ],

  businessEmail: [
    {
      id: 'businessEmail_required',
      field: 'businessEmail',
      message: 'Business email is required',
      validator: validators.required,
      severity: 'error',
      required: true
    },
    {
      id: 'businessEmail_format',
      field: 'businessEmail',
      message: 'Please enter a valid email address',
      validator: validators.email,
      severity: 'error'
    }
  ],

  primaryPhone: [
    {
      id: 'primaryPhone_required',
      field: 'primaryPhone',
      message: 'Phone number is required',
      validator: validators.required,
      severity: 'error',
      required: true
    },
    {
      id: 'primaryPhone_format',
      field: 'primaryPhone',
      message: 'Please enter a valid phone number',
      validator: validators.phone,
      severity: 'error'
    }
  ],

  website: [
    {
      id: 'website_format',
      field: 'website',
      message: 'Please enter a valid website URL',
      validator: validators.url,
      severity: 'warning'
    }
  ],

  // Step 2: Location Details
  locationName: [
    {
      id: 'locationName_required',
      field: 'locationName',
      message: 'Branch name is required',
      validator: validators.required,
      severity: 'error',
      required: true
    },
    {
      id: 'locationName_length',
      field: 'locationName',
      message: 'Branch name must be at least 2 characters',
      validator: validators.minLength(2),
      severity: 'error'
    }
  ],

  address: [
    {
      id: 'address_required',
      field: 'address',
      message: 'Full address is required',
      validator: validators.required,
      severity: 'error',
      required: true
    },
    {
      id: 'address_length',
      field: 'address',
      message: 'Address must be at least 10 characters',
      validator: validators.minLength(10),
      severity: 'error'
    }
  ],

  city: [
    {
      id: 'city_required',
      field: 'city',
      message: 'City is required',
      validator: validators.required,
      severity: 'error',
      required: true
    },
    {
      id: 'city_length',
      field: 'city',
      message: 'City name must be at least 2 characters',
      validator: validators.minLength(2),
      severity: 'error'
    }
  ],

  state: [
    {
      id: 'state_required',
      field: 'state',
      message: 'State is required',
      validator: validators.required,
      severity: 'error',
      required: true
    }
  ],

  postalCode: [
    {
      id: 'postalCode_required',
      field: 'postalCode',
      message: 'Postal code is required',
      validator: validators.required,
      severity: 'error',
      required: true
    },
    {
      id: 'postalCode_format',
      field: 'postalCode',
      message: 'Please enter a valid postal code',
      validator: validators.postalCode,
      severity: 'error'
    }
  ],

  // Step 3: Operations Setup
  openingTime: [
    {
      id: 'openingTime_format',
      field: 'openingTime',
      message: 'Please enter a valid time',
      validator: validators.time,
      severity: 'error'
    }
  ],

  closingTime: [
    {
      id: 'closingTime_format',
      field: 'closingTime',
      message: 'Please enter a valid time',
      validator: validators.time,
      severity: 'error'
    },
    {
      id: 'closingTime_logic',
      field: 'closingTime',
      message: 'Closing time must be after opening time',
      validator: (value: string, allData?: any) => {
        if (!value || !allData?.openingTime) return true
        return validators.businessHours(allData.openingTime, value)
      },
      severity: 'error'
    }
  ],

  seatingCapacity: [
    {
      id: 'seatingCapacity_required',
      field: 'seatingCapacity',
      message: 'Seating capacity is required',
      validator: validators.required,
      severity: 'error',
      required: true
    },
    {
      id: 'seatingCapacity_number',
      field: 'seatingCapacity',
      message: 'Seating capacity must be a number',
      validator: validators.number,
      severity: 'error'
    },
    {
      id: 'seatingCapacity_positive',
      field: 'seatingCapacity',
      message: 'Seating capacity must be greater than 0',
      validator: validators.positiveNumber,
      severity: 'error'
    },
    {
      id: 'seatingCapacity_reasonable',
      field: 'seatingCapacity',
      message: 'Seating capacity seems unusually high. Please verify.',
      validator: validators.maxValue(1000),
      severity: 'warning'
    }
  ],

  // Step 4: Manager Information
  managerName: [
    {
      id: 'managerName_required',
      field: 'managerName',
      message: 'Manager name is required',
      validator: validators.required,
      severity: 'error',
      required: true
    },
    {
      id: 'managerName_length',
      field: 'managerName',
      message: 'Manager name must be at least 2 characters',
      validator: validators.minLength(2),
      severity: 'error'
    }
  ],

  managerEmail: [
    {
      id: 'managerEmail_required',
      field: 'managerEmail',
      message: 'Manager email is required',
      validator: validators.required,
      severity: 'error',
      required: true
    },
    {
      id: 'managerEmail_format',
      field: 'managerEmail',
      message: 'Please enter a valid email address',
      validator: validators.email,
      severity: 'error'
    }
  ],

  managerPhone: [
    {
      id: 'managerPhone_required',
      field: 'managerPhone',
      message: 'Manager phone number is required',
      validator: validators.required,
      severity: 'error',
      required: true
    },
    {
      id: 'managerPhone_format',
      field: 'managerPhone',
      message: 'Please enter a valid phone number',
      validator: validators.phone,
      severity: 'error'
    }
  ]
}

// ==================== FORM VALIDATION ENGINE ====================

export class FormValidator {
  private schema: ValidationSchema
  private state: FormValidationState

  constructor(schema: ValidationSchema) {
    this.schema = schema
    this.state = {
      isValid: false,
      errors: {},
      warnings: {},
      info: {},
      hasErrors: false,
      hasWarnings: false,
      touchedFields: new Set()
    }
  }

  // Validate a single field
  validateField(fieldName: string, value: any, allData?: any): ValidationResult[] {
    const rules = this.schema[fieldName] || []
    const results: ValidationResult[] = []

    for (const rule of rules) {
      const isValid = rule.validator(value, allData)
      
      if (!isValid) {
        results.push({
          field: fieldName,
          isValid: false,
          message: rule.message,
          severity: rule.severity
        })
      }
    }

    // If no failures, field is valid
    if (results.length === 0) {
      results.push({
        field: fieldName,
        isValid: true,
        message: '',
        severity: 'info'
      })
    }

    return results
  }

  // Validate entire form
  validateForm(data: any): FormValidationState {
    const newState: FormValidationState = {
      isValid: true,
      errors: {},
      warnings: {},
      info: {},
      hasErrors: false,
      hasWarnings: false,
      touchedFields: new Set(Object.keys(data))
    }

    // Validate each field
    for (const [fieldName, value] of Object.entries(data)) {
      const results = this.validateField(fieldName, value, data)
      
      for (const result of results) {
        if (result.severity === 'error' && !result.isValid) {
          newState.errors[fieldName] = result
          newState.hasErrors = true
          newState.isValid = false
        } else if (result.severity === 'warning' && !result.isValid) {
          newState.warnings[fieldName] = result
          newState.hasWarnings = true
        } else if (result.severity === 'info') {
          newState.info[fieldName] = result
        }
      }
    }

    this.state = newState
    return newState
  }

  // Update field validation state
  updateFieldValidation(fieldName: string, value: any, allData?: any): FormValidationState {
    this.state.touchedFields.add(fieldName)
    
    const results = this.validateField(fieldName, value, allData)
    
    // Clear previous results for this field
    delete this.state.errors[fieldName]
    delete this.state.warnings[fieldName]
    delete this.state.info[fieldName]

    // Add new results
    for (const result of results) {
      if (result.severity === 'error' && !result.isValid) {
        this.state.errors[fieldName] = result
      } else if (result.severity === 'warning' && !result.isValid) {
        this.state.warnings[fieldName] = result
      } else if (result.severity === 'info') {
        this.state.info[fieldName] = result
      }
    }

    // Update state flags
    this.state.hasErrors = Object.keys(this.state.errors).length > 0
    this.state.hasWarnings = Object.keys(this.state.warnings).length > 0
    this.state.isValid = !this.state.hasErrors

    return this.state
  }

  // Get current validation state
  getValidationState(): FormValidationState {
    return { ...this.state }
  }

  // Check if field has been touched
  isFieldTouched(fieldName: string): boolean {
    return this.state.touchedFields.has(fieldName)
  }

  // Get field error message
  getFieldError(fieldName: string): string | null {
    return this.state.errors[fieldName]?.message || null
  }

  // Get field warning message
  getFieldWarning(fieldName: string): string | null {
    return this.state.warnings[fieldName]?.message || null
  }

  // Check if field has error
  hasFieldError(fieldName: string): boolean {
    return fieldName in this.state.errors
  }

  // Check if field has warning
  hasFieldWarning(fieldName: string): boolean {
    return fieldName in this.state.warnings
  }

  // Check if step is valid
  isStepValid(stepFields: string[]): boolean {
    return stepFields.every(field => !this.hasFieldError(field))
  }

  // Get step validation summary
  getStepValidation(stepFields: string[]): {
    isValid: boolean
    errorCount: number
    warningCount: number
    errors: string[]
    warnings: string[]
  } {
    const errors = stepFields
      .filter(field => this.hasFieldError(field))
      .map(field => this.getFieldError(field)!)
      .filter(Boolean)

    const warnings = stepFields
      .filter(field => this.hasFieldWarning(field))
      .map(field => this.getFieldWarning(field)!)
      .filter(Boolean)

    return {
      isValid: errors.length === 0,
      errorCount: errors.length,
      warningCount: warnings.length,
      errors,
      warnings
    }
  }

  // Reset validation state
  reset(): void {
    this.state = {
      isValid: false,
      errors: {},
      warnings: {},
      info: {},
      hasErrors: false,
      hasWarnings: false,
      touchedFields: new Set()
    }
  }
}

// ==================== UTILITY FUNCTIONS ====================

export function createRestaurantValidator(): FormValidator {
  return new FormValidator(restaurantValidationSchema)
}

export function getStepFields(): Record<number, string[]> {
  return {
    1: ['businessName', 'cuisineType', 'businessEmail', 'primaryPhone', 'website'],
    2: ['locationName', 'address', 'city', 'state', 'postalCode'],
    3: ['openingTime', 'closingTime', 'seatingCapacity'],
    4: ['managerName', 'managerEmail', 'managerPhone']
  }
}

export function validateStep(stepNumber: number, data: any, validator: FormValidator): {
  isValid: boolean
  canProceed: boolean
  summary: ReturnType<FormValidator['getStepValidation']>
} {
  const stepFields = getStepFields()[stepNumber] || []
  const summary = validator.getStepValidation(stepFields)
  
  return {
    isValid: summary.isValid,
    canProceed: summary.errorCount === 0, // Can proceed if no errors (warnings are ok)
    summary
  }
}

export default FormValidator