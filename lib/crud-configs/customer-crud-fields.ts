/**
 * Customer CRUD Fields Configuration
 * Demonstrates complex field mapping for contact info, preferences, and business intelligence
 * Shows how to handle nested data structures in CRUD forms
 */

import { CRUDField } from '@/templates/crud/types/crud-types'
import { User, Edit, Star, Mail, Download, Tag } from 'lucide-react'

export const CustomerCRUDFields: CRUDField[] = [
  // ============================================================================
  // CORE CUSTOMER INFORMATION
  // ============================================================================
  {
    key: 'name',
    label: 'Full Name',
    type: 'text',
    required: true,
    sortable: true,
    searchable: true,
    validation: {
      required: 'Customer name is required',
      minLength: 2
    },
    placeholder: 'Enter customer full name'
  },
  
  {
    key: 'firstName',
    label: 'First Name',
    type: 'text',
    sortable: true,
    searchable: true,
    validation: {
      minLength: 1
    },
    placeholder: 'First name'
  },
  
  {
    key: 'lastName',
    label: 'Last Name',
    type: 'text',
    sortable: true,
    searchable: true,
    validation: {
      minLength: 1
    },
    placeholder: 'Last name'
  },

  // ============================================================================
  // CONTACT INFORMATION
  // ============================================================================
  {
    key: 'email',
    label: 'Email',
    type: 'email',
    required: true,
    sortable: true,
    searchable: true,
    validation: {
      required: 'Email is required',
      pattern: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i
    },
    placeholder: 'customer@example.com'
  },
  
  {
    key: 'phone',
    label: 'Phone',
    type: 'tel',
    sortable: true,
    searchable: true,
    validation: {
      pattern: /^[\+]?[\d\s\-\(\)]{10,}$/
    },
    placeholder: '+1 (555) 123-4567'
  },
  
  {
    key: 'preferredContactMethod',
    label: 'Preferred Contact',
    type: 'select',
    filterable: true,
    options: [
      { value: 'email', label: 'Email' },
      { value: 'phone', label: 'Phone' },
      { value: 'sms', label: 'SMS' },
      { value: 'app', label: 'App Notification' }
    ],
    defaultValue: 'email',
    validation: {
      required: 'Please select preferred contact method'
    }
  },

  // ============================================================================
  // CUSTOMER CLASSIFICATION
  // ============================================================================
  {
    key: 'customerType',
    label: 'Customer Type',
    type: 'select',
    required: true,
    filterable: true,
    sortable: true,
    options: [
      { value: 'individual', label: 'Individual' },
      { value: 'corporate', label: 'Corporate' },
      { value: 'vip', label: 'VIP' }
    ],
    defaultValue: 'individual',
    validation: {
      required: 'Customer type is required'
    }
  },
  
  {
    key: 'loyaltyTier',
    label: 'Loyalty Tier',
    type: 'select',
    readonly: true,
    filterable: true,
    sortable: true,
    options: [
      { value: 'bronze', label: 'Bronze', color: '#CD7F32' },
      { value: 'silver', label: 'Silver', color: '#C0C0C0' },
      { value: 'gold', label: 'Gold', color: '#FFD700' },
      { value: 'platinum', label: 'Platinum', color: '#E5E4E2' }
    ],
    defaultValue: 'bronze'
  },

  // ============================================================================
  // BUSINESS INTELLIGENCE (READ-ONLY)
  // ============================================================================
  {
    key: 'totalOrders',
    label: 'Total Orders',
    type: 'number',
    readonly: true,
    sortable: true,
    format: 'number',
    displayHint: 'Total number of orders placed'
  },
  
  {
    key: 'totalSpent',
    label: 'Total Spent',
    type: 'number',
    readonly: true,
    sortable: true,
    format: 'currency',
    displayHint: 'Lifetime customer value'
  },
  
  {
    key: 'loyaltyPoints',
    label: 'Loyalty Points',
    type: 'number',
    readonly: true,
    sortable: true,
    format: 'number',
    displayHint: 'Current loyalty points balance'
  },
  
  {
    key: 'lastOrderDate',
    label: 'Last Order',
    type: 'date',
    readonly: true,
    sortable: true,
    format: 'date',
    displayHint: 'Date of most recent order'
  },
  
  {
    key: 'engagementScore',
    label: 'Engagement Score',
    type: 'number',
    readonly: true,
    sortable: true,
    format: 'percentage',
    displayHint: 'Customer engagement level (0-100%)'
  },
  
  {
    key: 'nextVisitProbability',
    label: 'Return Probability',
    type: 'number',
    readonly: true,
    format: 'percentage',
    displayHint: 'Likelihood of returning within 30 days'
  },

  // ============================================================================
  // CUSTOMER PREFERENCES (FLATTENED NESTED DATA)
  // ============================================================================
  {
    key: 'preferences.favoriteTeas',
    label: 'Favorite Teas',
    type: 'text',
    placeholder: 'Earl Grey, Chamomile, Green Tea',
    displayHint: 'Comma-separated list of preferred teas',
    validation: {
      maxLength: 200
    }
  },
  
  {
    key: 'preferences.caffeinePreference',
    label: 'Caffeine Preference',
    type: 'select',
    filterable: true,
    options: [
      { value: 'none', label: 'No Caffeine' },
      { value: 'low', label: 'Low Caffeine' },
      { value: 'moderate', label: 'Moderate Caffeine' },
      { value: 'high', label: 'High Caffeine' }
    ],
    defaultValue: 'moderate'
  },
  
  {
    key: 'preferences.temperaturePreference',
    label: 'Temperature Preference',
    type: 'select',
    filterable: true,
    options: [
      { value: 'hot', label: 'Hot Beverages' },
      { value: 'iced', label: 'Iced Beverages' },
      { value: 'both', label: 'Both Hot & Iced' }
    ],
    defaultValue: 'both'
  },
  
  {
    key: 'preferences.dietaryRestrictions',
    label: 'Dietary Restrictions',
    type: 'text',
    placeholder: 'Vegetarian, Gluten-free, Dairy-free',
    displayHint: 'Comma-separated list of dietary restrictions',
    validation: {
      maxLength: 200
    }
  },
  
  {
    key: 'preferences.allergies',
    label: 'Allergies',
    type: 'text',
    placeholder: 'Nuts, Dairy, Gluten',
    displayHint: 'Comma-separated list of allergies',
    validation: {
      maxLength: 200
    }
  },

  // ============================================================================
  // ADDITIONAL INFORMATION
  // ============================================================================
  {
    key: 'preferredName',
    label: 'Preferred Name',
    type: 'text',
    placeholder: 'Name to use in communication',
    displayHint: 'How the customer prefers to be addressed'
  },
  
  {
    key: 'birthDate',
    label: 'Birth Date',
    type: 'date',
    validation: {
      validate: (value: string) => {
        if (value && new Date(value) > new Date()) {
          return 'Birth date cannot be in the future'
        }
        return true
      }
    },
    displayHint: 'For birthday promotions and age-appropriate recommendations'
  },
  
  {
    key: 'acquisitionSource',
    label: 'How They Found Us',
    type: 'select',
    filterable: true,
    options: [
      { value: 'walk_in', label: 'Walk-in' },
      { value: 'referral', label: 'Referral' },
      { value: 'google', label: 'Google Search' },
      { value: 'instagram', label: 'Instagram' },
      { value: 'facebook', label: 'Facebook' },
      { value: 'yelp', label: 'Yelp' },
      { value: 'other', label: 'Other' }
    ],
    defaultValue: 'walk_in'
  },
  
  {
    key: 'notes',
    label: 'Notes',
    type: 'textarea',
    placeholder: 'Special notes about this customer...',
    displayHint: 'Internal notes for staff reference',
    validation: {
      maxLength: 1000
    }
  },
  
  {
    key: 'isActive',
    label: 'Active',
    type: 'boolean',
    defaultValue: true,
    filterable: true,
    displayHint: 'Inactive customers will not receive communications'
  },

  // ============================================================================
  // METADATA FIELDS (READ-ONLY)
  // ============================================================================
  {
    key: 'createdAt',
    label: 'Created',
    type: 'date',
    readonly: true,
    sortable: true,
    format: 'datetime',
    displayHint: 'When the customer was first added'
  },
  
  {
    key: 'updatedAt',
    label: 'Last Updated',
    type: 'date',
    readonly: true,
    sortable: true,
    format: 'datetime',
    displayHint: 'When the customer record was last modified'
  }
]

// ============================================================================
// FILTER DEFINITIONS
// ============================================================================

export const CustomerCRUDFilters = [
  {
    key: 'customerType',
    label: 'Customer Type',
    type: 'select',
    options: [
      { value: 'individual', label: 'Individual' },
      { value: 'corporate', label: 'Corporate' },
      { value: 'vip', label: 'VIP' }
    ]
  },
  
  {
    key: 'loyaltyTier',
    label: 'Loyalty Tier',
    type: 'select',
    options: [
      { value: 'bronze', label: 'Bronze' },
      { value: 'silver', label: 'Silver' },
      { value: 'gold', label: 'Gold' },
      { value: 'platinum', label: 'Platinum' }
    ]
  },
  
  {
    key: 'totalSpent',
    label: 'Total Spent',
    type: 'number-range',
    min: 0,
    max: 10000,
    step: 50,
    format: 'currency'
  },
  
  {
    key: 'preferences.caffeinePreference',
    label: 'Caffeine Preference',
    type: 'select',
    options: [
      { value: 'none', label: 'No Caffeine' },
      { value: 'low', label: 'Low Caffeine' },
      { value: 'moderate', label: 'Moderate Caffeine' },
      { value: 'high', label: 'High Caffeine' }
    ]
  },
  
  {
    key: 'acquisitionSource',
    label: 'Acquisition Source',
    type: 'select',
    options: [
      { value: 'walk_in', label: 'Walk-in' },
      { value: 'referral', label: 'Referral' },
      { value: 'google', label: 'Google Search' },
      { value: 'instagram', label: 'Instagram' },
      { value: 'facebook', label: 'Facebook' },
      { value: 'yelp', label: 'Yelp' },
      { value: 'other', label: 'Other' }
    ]
  },
  
  {
    key: 'isActive',
    label: 'Status',
    type: 'select',
    options: [
      { value: true, label: 'Active' },
      { value: false, label: 'Inactive' }
    ]
  }
]

// ============================================================================
// ACTIONS DEFINITIONS
// ============================================================================

export const CustomerCRUDActions = [
  {
    key: 'view-profile',
    label: 'View Profile',
    icon: User,
    type: 'primary',
    onClick: (customer: any) => {
      // Navigate to detailed customer profile
      window.location.href = `/customers/${customer.id}/profile`
    }
  },
  
  {
    key: 'add-note',
    label: 'Add Note',
    icon: Edit,
    type: 'secondary',
    onClick: (customer: any) => {
      // Open add note modal
      console.log('Adding note for customer:', customer.id)
    }
  },
  
  {
    key: 'loyalty-points',
    label: 'Manage Points',
    icon: Star,
    type: 'secondary',
    onClick: (customer: any) => {
      // Open loyalty points management
      console.log('Managing loyalty points for:', customer.id)
    }
  },
  
  {
    key: 'send-email',
    label: 'Send Email',
    icon: Mail,
    type: 'secondary',
    onClick: (customer: any) => {
      // Open email composition
      if (customer.email) {
        window.location.href = `mailto:${customer.email}`
      }
    }
  }
]

// ============================================================================
// BULK OPERATIONS
// ============================================================================

export const CustomerBulkOperations = [
  {
    key: 'bulk-email',
    label: 'Send Bulk Email',
    icon: Mail,
    type: 'primary',
    onClick: (selectedCustomers: any[]) => {
      const emails = selectedCustomers.map(c => c.email).filter(Boolean)
      console.log('Sending bulk email to:', emails)
    }
  },
  
  {
    key: 'export-customers',
    label: 'Export Selected',
    icon: Download,
    type: 'secondary',
    onClick: (selectedCustomers: any[]) => {
      // Export selected customers to CSV
      console.log('Exporting customers:', selectedCustomers.length)
    }
  },
  
  {
    key: 'bulk-tag',
    label: 'Add Tags',
    icon: Tag,
    type: 'secondary',
    onClick: (selectedCustomers: any[]) => {
      // Open bulk tag management
      console.log('Adding tags to:', selectedCustomers.length, 'customers')
    }
  }
]