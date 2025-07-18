/**
 * HERA Universal - Product CRUD Field Definitions
 * Complete field configurations for product management using CRUD templates
 * Integrates existing ProductCatalogService with HERAUniversalCRUD
 */

import { CRUDField, SelectOption } from '@/templates/crud/types/crud-types'
import { 
  Package, 
  DollarSign, 
  Clock, 
  Thermometer, 
  Coffee, 
  Leaf,
  AlertTriangle,
  Star,
  Info,
  Calendar,
  Users,
  ShoppingCart
} from 'lucide-react'

// ============================================================================
// PRODUCT CATEGORIES
// ============================================================================

export const PRODUCT_CATEGORIES: SelectOption[] = [
  { value: 'tea', label: 'Tea', icon: Leaf, description: 'All types of tea beverages' },
  { value: 'pastry', label: 'Pastry', icon: Coffee, description: 'Baked goods and desserts' },
  { value: 'beverage', label: 'Beverage', icon: Coffee, description: 'Non-tea beverages' },
  { value: 'food', label: 'Food', icon: Package, description: 'Main dishes and snacks' },
  { value: 'other', label: 'Other', icon: Package, description: 'Miscellaneous items' }
]

export const PRODUCT_TYPES = PRODUCT_CATEGORIES // Same as categories for now

export const SIZE_OPTIONS: SelectOption[] = [
  { value: 'small', label: 'Small (8oz)', description: '8 fluid ounces' },
  { value: 'medium', label: 'Medium (12oz)', description: '12 fluid ounces' },
  { value: 'large', label: 'Large (16oz)', description: '16 fluid ounces' },
  { value: 'extra_large', label: 'Extra Large (20oz)', description: '20 fluid ounces' }
]

export const TEMPERATURE_OPTIONS: SelectOption[] = [
  { value: 'hot', label: 'Hot', icon: Thermometer },
  { value: 'iced', label: 'Iced', icon: Thermometer },
  { value: 'room_temp', label: 'Room Temperature', icon: Thermometer }
]

export const ALLERGEN_OPTIONS: SelectOption[] = [
  { value: 'milk', label: 'Milk/Dairy' },
  { value: 'eggs', label: 'Eggs' },
  { value: 'fish', label: 'Fish' },
  { value: 'shellfish', label: 'Shellfish' },
  { value: 'tree_nuts', label: 'Tree Nuts' },
  { value: 'peanuts', label: 'Peanuts' },
  { value: 'wheat', label: 'Wheat/Gluten' },
  { value: 'soy', label: 'Soy' }
]

// ============================================================================
// CORE PRODUCT FIELDS
// ============================================================================

export const PRODUCT_FIELDS: CRUDField[] = [
  // Basic Information
  {
    key: 'name',
    label: 'Product Name',
    type: 'text',
    required: true,
    placeholder: 'Enter product name...',
    helpText: 'The display name for this product',
    icon: Package,
    showInList: true,
    showInCreate: true,
    showInEdit: true,
    showInView: true,
    showInFilter: true,
    sortable: true,
    searchable: true,
    filterable: true,
    width: 200,
    validation: {
      required: true,
      minLength: 2,
      maxLength: 100
    }
  },
  
  {
    key: 'description',
    label: 'Description',
    type: 'textarea',
    required: true,
    placeholder: 'Describe this product...',
    helpText: 'Detailed description of the product',
    icon: Info,
    showInList: false,
    showInCreate: true,
    showInEdit: true,
    showInView: true,
    showInFilter: false,
    searchable: true,
    validation: {
      required: true,
      minLength: 10,
      maxLength: 500
    }
  },
  
  {
    key: 'categoryId',
    label: 'Category',
    type: 'select',
    required: true,
    helpText: 'Product category classification',
    icon: Package,
    showInList: true,
    showInCreate: true,
    showInEdit: true,
    showInView: true,
    showInFilter: true,
    sortable: true,
    filterable: true,
    width: 120,
    options: PRODUCT_CATEGORIES,
    validation: {
      required: true
    }
  },
  
  {
    key: 'productType',
    label: 'Product Type',
    type: 'select',
    required: true,
    helpText: 'Specific product type',
    icon: Star,
    showInList: true,
    showInCreate: true,
    showInEdit: true,
    showInView: true,
    showInFilter: true,
    sortable: true,
    filterable: true,
    width: 120,
    options: PRODUCT_TYPES,
    validation: {
      required: true
    }
  },

  // Pricing Information
  {
    key: 'basePrice',
    label: 'Base Price',
    type: 'currency',
    required: true,
    placeholder: '0.00',
    helpText: 'Base price before modifiers',
    icon: DollarSign,
    showInList: true,
    showInCreate: true,
    showInEdit: true,
    showInView: true,
    showInFilter: true,
    sortable: true,
    filterable: true,
    width: 100,
    align: 'right',
    validation: {
      required: true,
      min: 0,
      max: 1000
    }
  },

  {
    key: 'sku',
    label: 'SKU',
    type: 'text',
    required: false,
    placeholder: 'AUTO-GENERATED',
    helpText: 'Stock Keeping Unit (leave blank for auto-generation)',
    icon: Package,
    showInList: true,
    showInCreate: true,
    showInEdit: true,
    showInView: true,
    showInFilter: true,
    sortable: true,
    searchable: true,
    filterable: true,
    width: 120,
    validation: {
      maxLength: 50
    }
  },

  // Operational Information
  {
    key: 'preparationTimeMinutes',
    label: 'Prep Time',
    type: 'number',
    required: false,
    placeholder: '5',
    helpText: 'Preparation time in minutes',
    icon: Clock,
    showInList: true,
    showInCreate: true,
    showInEdit: true,
    showInView: true,
    showInFilter: true,
    sortable: true,
    filterable: true,
    width: 100,
    align: 'center',
    validation: {
      min: 0,
      max: 120,
      step: 1
    },
    formatDisplay: (value: number) => value ? `${value}m` : 'N/A'
  },

  {
    key: 'isActive',
    label: 'Active',
    type: 'boolean',
    required: false,
    helpText: 'Whether this product is available for sale',
    showInList: true,
    showInCreate: true,
    showInEdit: true,
    showInView: true,
    showInFilter: true,
    sortable: true,
    filterable: true,
    width: 80,
    align: 'center',
    defaultValue: true
  },

  {
    key: 'seasonalAvailability',
    label: 'Seasonal',
    type: 'boolean',
    required: false,
    helpText: 'Whether this product has seasonal availability',
    icon: Calendar,
    showInList: true,
    showInCreate: true,
    showInEdit: true,
    showInView: true,
    showInFilter: true,
    sortable: true,
    filterable: true,
    width: 100,
    align: 'center',
    defaultValue: false
  },

  // Advanced Information (for detailed view/edit)
  {
    key: 'originStory',
    label: 'Origin Story',
    type: 'richtext',
    required: false,
    placeholder: 'Tell the story of this product...',
    helpText: 'Background story and origin information',
    showInList: false,
    showInCreate: true,
    showInEdit: true,
    showInView: true,
    showInFilter: false,
    searchable: true,
    validation: {
      maxLength: 1000
    }
  }
]

// ============================================================================
// BREWING INSTRUCTIONS FIELDS (for tea products)
// ============================================================================

export const BREWING_FIELDS: CRUDField[] = [
  {
    key: 'brewingInstructions.temperature',
    label: 'Brewing Temperature',
    type: 'text',
    required: false,
    placeholder: '185°F (85°C)',
    helpText: 'Optimal brewing temperature',
    icon: Thermometer,
    showInList: false,
    showInCreate: true,
    showInEdit: true,
    showInView: true,
    showInFilter: false,
    validation: {
      maxLength: 50
    }
  },

  {
    key: 'brewingInstructions.steepingTime',
    label: 'Steeping Time',
    type: 'text',
    required: false,
    placeholder: '3-5 minutes',
    helpText: 'Recommended steeping duration',
    icon: Clock,
    showInList: false,
    showInCreate: true,
    showInEdit: true,
    showInView: true,
    showInFilter: false,
    validation: {
      maxLength: 50
    }
  },

  {
    key: 'brewingInstructions.teaAmount',
    label: 'Tea Amount',
    type: 'text',
    required: false,
    placeholder: '1 tsp per cup',
    helpText: 'Amount of tea to use',
    icon: Coffee,
    showInList: false,
    showInCreate: true,
    showInEdit: true,
    showInView: true,
    showInFilter: false,
    validation: {
      maxLength: 50
    }
  }
]

// ============================================================================
// NUTRITIONAL INFORMATION FIELDS
// ============================================================================

export const NUTRITIONAL_FIELDS: CRUDField[] = [
  {
    key: 'nutritionalInfo.caffeineContent',
    label: 'Caffeine Content',
    type: 'text',
    required: false,
    placeholder: 'Low, Medium, High, or None',
    helpText: 'Caffeine level description',
    showInList: false,
    showInCreate: true,
    showInEdit: true,
    showInView: true,
    showInFilter: true,
    filterable: true,
    validation: {
      maxLength: 50
    }
  },

  {
    key: 'nutritionalInfo.caloriesPerServing',
    label: 'Calories per Serving',
    type: 'number',
    required: false,
    placeholder: '0',
    helpText: 'Calories per standard serving',
    showInList: false,
    showInCreate: true,
    showInEdit: true,
    showInView: true,
    showInFilter: true,
    filterable: true,
    validation: {
      min: 0,
      max: 2000
    }
  },

  {
    key: 'nutritionalInfo.allergens',
    label: 'Allergens',
    type: 'multiselect',
    required: false,
    helpText: 'Select all applicable allergens',
    icon: AlertTriangle,
    showInList: false,
    showInCreate: true,
    showInEdit: true,
    showInView: true,
    showInFilter: true,
    filterable: true,
    options: ALLERGEN_OPTIONS
  }
]

// ============================================================================
// POPULAR PAIRINGS FIELD
// ============================================================================

export const PAIRING_FIELDS: CRUDField[] = [
  {
    key: 'popularPairings',
    label: 'Popular Pairings',
    type: 'text',
    required: false,
    placeholder: 'Scones, cookies, pastries...',
    helpText: 'Comma-separated list of items that pair well',
    icon: Users,
    showInList: false,
    showInCreate: true,
    showInEdit: true,
    showInView: true,
    showInFilter: false,
    searchable: true,
    validation: {
      maxLength: 200
    }
  }
]

// ============================================================================
// COMBINED FIELD SETS
// ============================================================================

// All product fields for comprehensive management
export const ALL_PRODUCT_FIELDS: CRUDField[] = [
  ...PRODUCT_FIELDS,
  ...BREWING_FIELDS,
  ...NUTRITIONAL_FIELDS,
  ...PAIRING_FIELDS
]

// Essential fields for list view
export const ESSENTIAL_PRODUCT_FIELDS: CRUDField[] = PRODUCT_FIELDS.filter(field => 
  field.showInList
)

// Fields for quick create modal
export const QUICK_CREATE_FIELDS: CRUDField[] = [
  ...PRODUCT_FIELDS.filter(field => field.required),
  ...PRODUCT_FIELDS.filter(field => field.key === 'preparationTimeMinutes')
]

// ============================================================================
// FIELD GROUPS FOR ORGANIZED FORMS
// ============================================================================

export const PRODUCT_FIELD_GROUPS = {
  basic: {
    title: 'Basic Information',
    description: 'Essential product details',
    fields: PRODUCT_FIELDS.filter(f => 
      ['name', 'description', 'categoryId', 'productType'].includes(f.key)
    )
  },
  pricing: {
    title: 'Pricing & SKU',
    description: 'Price and inventory codes',
    fields: PRODUCT_FIELDS.filter(f => 
      ['basePrice', 'sku'].includes(f.key)
    )
  },
  operations: {
    title: 'Operations',
    description: 'Preparation and availability',
    fields: PRODUCT_FIELDS.filter(f => 
      ['preparationTimeMinutes', 'isActive', 'seasonalAvailability'].includes(f.key)
    )
  },
  brewing: {
    title: 'Brewing Instructions',
    description: 'For tea and beverage products',
    fields: BREWING_FIELDS
  },
  nutrition: {
    title: 'Nutritional Information',
    description: 'Health and dietary information',
    fields: NUTRITIONAL_FIELDS
  },
  marketing: {
    title: 'Marketing & Story',
    description: 'Customer-facing content',
    fields: [
      ...PRODUCT_FIELDS.filter(f => f.key === 'originStory'),
      ...PAIRING_FIELDS
    ]
  }
} as const

export type ProductFieldGroup = keyof typeof PRODUCT_FIELD_GROUPS