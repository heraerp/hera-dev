import { useState, useCallback, useEffect } from 'react';
import { ProductFormData, ProductValidationError, ProductWithDetails } from '@/types/product';

export interface UseProductFormReturn {
  formData: ProductFormData;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isDirty: boolean;
  isValid: boolean;
  currentStep: number;
  totalSteps: number;
  updateField: (field: keyof ProductFormData, value: any) => void;
  validateField: (field: keyof ProductFormData) => boolean;
  validateForm: () => boolean;
  setFieldTouched: (field: keyof ProductFormData, touched?: boolean) => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  reset: (product?: ProductWithDetails) => void;
  getFormData: () => ProductFormData;
  clearErrors: () => void;
}

const initialFormData: ProductFormData = {
  entity_name: '',
  entity_code: '',
  category: 'tea',
  product_type: 'finished_good',
  description: '',
  price: 0,
  cost_per_unit: 0,
  inventory_count: 0,
  minimum_stock: 10,
  unit_type: 'pieces',
  preparation_time_minutes: 0,
  calories: 0,
  allergens: 'None',
  serving_temperature: '',
  caffeine_level: '',
  origin: '',
  supplier_name: '',
  storage_requirements: '',
  shelf_life_days: 0
};

const validationRules = {
  entity_name: {
    required: true,
    minLength: 2,
    maxLength: 100
  },
  entity_code: {
    required: true,
    pattern: /^[A-Z0-9-]+$/,
    minLength: 3,
    maxLength: 20
  },
  cost_per_unit: {
    required: true,
    min: 0.01
  },
  minimum_stock: {
    required: true,
    min: 0
  },
  inventory_count: {
    required: true,
    min: 0
  },
  price: {
    min: 0
  },
  preparation_time_minutes: {
    min: 0,
    max: 1440 // 24 hours
  },
  calories: {
    min: 0,
    max: 9999
  },
  shelf_life_days: {
    min: 0,
    max: 3650 // 10 years
  }
};

export function useProductForm(initialProduct?: ProductWithDetails): UseProductFormReturn {
  const [formData, setFormData] = useState<ProductFormData>(
    initialProduct ? productToFormData(initialProduct) : initialFormData
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isDirty, setIsDirty] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;

  // Check if form is valid
  const isValid = Object.keys(errors).length === 0 && 
                  formData.entity_name.trim() !== '' &&
                  formData.entity_code.trim() !== '' &&
                  formData.cost_per_unit > 0;

  // Convert ProductWithDetails to ProductFormData
  function productToFormData(product: ProductWithDetails): ProductFormData {
    return {
      entity_name: product.entity_name,
      entity_code: product.entity_code,
      category: product.category,
      product_type: product.product_type,
      description: product.description,
      price: product.price,
      cost_per_unit: product.cost_per_unit,
      inventory_count: product.inventory_count,
      minimum_stock: product.minimum_stock,
      unit_type: product.unit_type,
      preparation_time_minutes: product.preparation_time_minutes,
      calories: product.calories,
      allergens: product.allergens,
      serving_temperature: product.serving_temperature,
      caffeine_level: product.caffeine_level,
      origin: product.origin,
      supplier_name: product.supplier_name,
      storage_requirements: product.storage_requirements,
      shelf_life_days: product.shelf_life_days
    };
  }

  // Validate a single field
  const validateField = useCallback((field: keyof ProductFormData): boolean => {
    const value = formData[field];
    const rules = validationRules[field];
    
    if (!rules) return true;

    let error = '';

    // Required validation
    if (rules.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
      error = `${field.replace('_', ' ')} is required`;
    }

    // Type-specific validations
    if (value && typeof value === 'string') {
      // String validations
      if (rules.minLength && value.length < rules.minLength) {
        error = `${field.replace('_', ' ')} must be at least ${rules.minLength} characters`;
      }
      if (rules.maxLength && value.length > rules.maxLength) {
        error = `${field.replace('_', ' ')} must be no more than ${rules.maxLength} characters`;
      }
      if (rules.pattern && !rules.pattern.test(value)) {
        error = `${field.replace('_', ' ')} format is invalid`;
      }
    }

    if (value && typeof value === 'number') {
      // Number validations
      if (rules.min !== undefined && value < rules.min) {
        error = `${field.replace('_', ' ')} must be at least ${rules.min}`;
      }
      if (rules.max !== undefined && value > rules.max) {
        error = `${field.replace('_', ' ')} must be no more than ${rules.max}`;
      }
    }

    // Custom validations
    if (field === 'entity_code' && value) {
      if (!/^[A-Z0-9-]+$/.test(value.toString())) {
        error = 'Product code must contain only uppercase letters, numbers, and hyphens';
      }
    }

    // Update errors
    setErrors(prev => {
      const newErrors = { ...prev };
      if (error) {
        newErrors[field] = error;
      } else {
        delete newErrors[field];
      }
      return newErrors;
    });

    return !error;
  }, [formData]);

  // Validate entire form
  const validateForm = useCallback((): boolean => {
    const fields = Object.keys(formData) as (keyof ProductFormData)[];
    const results = fields.map(field => validateField(field));
    return results.every(result => result);
  }, [formData, validateField]);

  // Update a field value
  const updateField = useCallback((field: keyof ProductFormData, value: any) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // Auto-generate product code if entity_name changes and entity_code is empty
      if (field === 'entity_name' && !prev.entity_code && value) {
        const categoryCode = prev.category.toUpperCase().slice(0, 3);
        const nameCode = value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
        const timestamp = Date.now().toString().slice(-4);
        newData.entity_code = `${categoryCode}-${nameCode}-${timestamp}`;
      }
      
      // Auto-update category-specific defaults
      if (field === 'category') {
        switch (value) {
          case 'tea':
            newData.unit_type = 'servings';
            newData.preparation_time_minutes = 3;
            break;
          case 'pastries':
            newData.unit_type = 'pieces';
            newData.preparation_time_minutes = 15;
            break;
          case 'packaging':
            newData.unit_type = 'pieces';
            newData.preparation_time_minutes = 0;
            newData.price = 0;
            break;
          case 'supplies':
            newData.unit_type = 'kg';
            newData.preparation_time_minutes = 0;
            newData.price = 0;
            break;
        }
      }
      
      return newData;
    });
    
    setIsDirty(true);
    
    // Clear error for this field
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
    
    // Validate field after a short delay
    setTimeout(() => validateField(field), 100);
  }, [validateField]);

  // Mark field as touched
  const setFieldTouched = useCallback((field: keyof ProductFormData, touchedValue = true) => {
    setTouched(prev => ({ ...prev, [field]: touchedValue }));
  }, []);

  // Navigation functions
  const nextStep = useCallback(() => {
    setCurrentStep(prev => Math.min(totalSteps, prev + 1));
  }, []);

  const prevStep = useCallback(() => {
    setCurrentStep(prev => Math.max(1, prev - 1));
  }, []);

  const goToStep = useCallback((step: number) => {
    setCurrentStep(Math.max(1, Math.min(totalSteps, step)));
  }, []);

  // Reset form
  const reset = useCallback((product?: ProductWithDetails) => {
    const newFormData = product ? productToFormData(product) : initialFormData;
    setFormData(newFormData);
    setErrors({});
    setTouched({});
    setIsDirty(false);
    setCurrentStep(1);
  }, []);

  // Get form data for submission
  const getFormData = useCallback((): ProductFormData => {
    return { ...formData };
  }, [formData]);

  // Clear all errors
  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  // Auto-save to localStorage
  useEffect(() => {
    if (isDirty) {
      localStorage.setItem('productFormDraft', JSON.stringify(formData));
    }
  }, [formData, isDirty]);

  // Load draft from localStorage on mount
  useEffect(() => {
    if (!initialProduct) {
      const draft = localStorage.getItem('productFormDraft');
      if (draft) {
        try {
          const parsedDraft = JSON.parse(draft);
          setFormData(parsedDraft);
          setIsDirty(true);
        } catch (error) {
          console.error('Failed to parse product form draft:', error);
        }
      }
    }
  }, [initialProduct]);

  return {
    formData,
    errors,
    touched,
    isDirty,
    isValid,
    currentStep,
    totalSteps,
    updateField,
    validateField,
    validateForm,
    setFieldTouched,
    nextStep,
    prevStep,
    goToStep,
    reset,
    getFormData,
    clearErrors
  };
}