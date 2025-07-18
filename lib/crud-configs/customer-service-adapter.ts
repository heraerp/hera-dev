/**
 * HERA Universal - Customer Service Adapter
 * Bridges CustomerCrudService with CRUDServiceInterface for template integration
 * Uses HERA Universal Schema (core_entities + core_metadata) pattern
 */

import { 
  CRUDServiceInterface, 
  ServiceResult, 
  ListOptions, 
  SearchOptions 
} from '@/templates/crud/types/crud-types'
import { CustomerCrudService, CustomerCreateInput, CustomerUpdateInput } from '@/lib/services/customerCrudService'

// ============================================================================
// TYPE MAPPINGS
// ============================================================================

// Convert CustomerData to CRUD entity format with flattened complex fields
export interface CustomerCRUDEntity {
  id?: string
  
  // Core customer info
  name: string
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  customerType: 'individual' | 'corporate' | 'vip'
  
  // Business intelligence fields (read-only in forms)
  totalOrders?: number
  totalSpent?: number
  lastOrderDate?: string
  loyaltyPoints?: number
  loyaltyTier?: 'bronze' | 'silver' | 'gold' | 'platinum'
  
  // Contact preferences
  preferredContactMethod?: 'email' | 'sms' | 'phone' | 'app'
  acquisitionSource?: string
  preferredName?: string
  birthDate?: string
  
  // Status and metadata
  isActive?: boolean
  createdAt?: string
  updatedAt?: string
  
  // Rich data from preferences (flattened for form display)
  'preferences.favoriteTeas'?: string
  'preferences.caffeinePreference'?: 'none' | 'low' | 'moderate' | 'high'
  'preferences.temperaturePreference'?: 'hot' | 'iced' | 'both'
  'preferences.dietaryRestrictions'?: string
  'preferences.allergies'?: string
  
  // Business insights (display only)
  engagementScore?: number
  churnRisk?: 'low' | 'medium' | 'high'
  nextVisitProbability?: number
  
  // Notes and tags
  notes?: string
  tags?: string[]
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Converts customer service data to CRUD entity format
 * Updated for HERA Universal Schema (core_entities + core_metadata)
 */
function convertCustomerToCRUDEntity(customer: any): CustomerCRUDEntity {
  // Extract metadata safely (from core_metadata.metadata_value)
  const metadata = customer.metadata || {}
  
  return {
    id: customer.id,
    name: customer.entity_name || `${metadata.first_name || ''} ${metadata.last_name || ''}`.trim(),
    firstName: metadata.first_name || customer.entity_name?.split(' ')[0] || '',
    lastName: metadata.last_name || customer.entity_name?.split(' ').slice(1).join(' ') || '',
    email: metadata.email || '',
    phone: metadata.phone || '',
    customerType: metadata.customer_type || 'individual',
    
    // Business intelligence from metadata
    totalOrders: metadata.total_visits || 0,
    totalSpent: metadata.lifetime_value || 0,
    lastOrderDate: metadata.last_visit_date || null,
    loyaltyPoints: metadata.loyalty_points || 0,
    loyaltyTier: metadata.loyalty_tier || 'bronze',
    
    // Contact preferences from metadata
    preferredContactMethod: metadata.preferred_contact_method || 'email',
    acquisitionSource: metadata.acquisition_source || 'walk_in',
    preferredName: metadata.preferred_name || metadata.first_name || '',
    birthDate: metadata.birth_date || '',
    
    // Status
    isActive: customer.is_active ?? true,
    createdAt: customer.created_at,
    updatedAt: customer.updated_at,
    
    // Flattened preferences for form display
    'preferences.favoriteTeas': Array.isArray(metadata.favorite_teas) 
      ? metadata.favorite_teas.join(', ') 
      : metadata.favorite_teas || '',
    'preferences.caffeinePreference': metadata.caffeine_preference || 'moderate',
    'preferences.temperaturePreference': metadata.temperature_preference || 'both',
    'preferences.dietaryRestrictions': Array.isArray(metadata.dietary_restrictions)
      ? metadata.dietary_restrictions.join(', ')
      : metadata.dietary_restrictions || '',
    'preferences.allergies': Array.isArray(metadata.allergies)
      ? metadata.allergies.join(', ')
      : metadata.allergies || '',
    
    // Business insights (calculated)
    engagementScore: Math.min(100, (metadata.total_visits || 0) * 8 + (metadata.lifetime_value || 0) / 5),
    churnRisk: (metadata.total_visits || 0) < 2 ? 'high' : 
               (metadata.total_visits || 0) < 5 ? 'medium' : 'low',
    nextVisitProbability: Math.min(95, 20 + (metadata.total_visits || 0) * 5),
    
    // Additional data
    notes: metadata.notes || '',
    tags: metadata.tags || []
  }
}

/**
 * Converts CRUD entity back to service format
 * Updated for HERA Universal Schema
 */
function convertCRUDEntityToCustomer(entity: Partial<CustomerCRUDEntity>): CustomerCreateInput {
  return {
    organizationId: '', // Will be set by adapter
    entity_name: entity.name!,
    metadata: {
      email: entity.email || '',
      phone: entity.phone || '',
      first_name: entity.firstName || '',
      last_name: entity.lastName || '',
      customer_type: entity.customerType || 'individual',
      birth_date: entity.birthDate || '',
      preferred_name: entity.preferredName || '',
      acquisition_source: entity.acquisitionSource || 'walk_in',
      preferred_contact_method: entity.preferredContactMethod || 'email',
      notes: entity.notes || '',
      
      // Business intelligence fields
      total_visits: entity.totalOrders || 0,
      lifetime_value: entity.totalSpent || 0,
      average_order_value: entity.totalSpent && entity.totalOrders ? (entity.totalSpent / entity.totalOrders) : 0,
      last_visit_date: entity.lastOrderDate || new Date().toISOString().split('T')[0],
      loyalty_tier: entity.loyaltyTier || 'bronze',
      loyalty_points: entity.loyaltyPoints || 0,
      
      // Preferences - parse from flattened format
      favorite_teas: entity['preferences.favoriteTeas'] 
        ? entity['preferences.favoriteTeas'].split(',').map(s => s.trim()) 
        : [],
      caffeine_preference: entity['preferences.caffeinePreference'] || 'moderate',
      temperature_preference: entity['preferences.temperaturePreference'] || 'both',
      dietary_restrictions: entity['preferences.dietaryRestrictions']
        ? entity['preferences.dietaryRestrictions'].split(',').map(s => s.trim())
        : [],
      allergies: entity['preferences.allergies']
        ? entity['preferences.allergies'].split(',').map(s => s.trim())
        : [],
      
      // Status
      status: 'active',
      is_draft: false,
      created_by: 'system',
      updated_by: 'system'
    }
  }
}

// ============================================================================
// CUSTOMER SERVICE ADAPTER
// ============================================================================

export class CustomerServiceAdapter implements CRUDServiceInterface {
  private groupsCache: Map<string, string> = new Map() // groupId -> groupName mapping

  constructor() {
    // No organization ID stored - comes with each call
  }

  /**
   * ✅ PATTERN: Load reference data (customer groups) with fallbacks
   * Updated for HERA Universal Schema
   */
  private async ensureGroupsLoaded(organizationId: string): Promise<void> {
    if (this.groupsCache.size === 0) {
      try {
        console.log('🔍 Loading customer groups for organization:', organizationId)
        
        // Initialize customer data to ensure sample customers exist
        await CustomerCrudService.initializeCustomerData(organizationId)
        
        // Add default groups (can be expanded to load from database)
        this.groupsCache.set('individual', 'Individual Customers')
        this.groupsCache.set('corporate', 'Corporate Customers')
        this.groupsCache.set('vip', 'VIP Customers')
        this.groupsCache.set('new', 'New Customers')
        
        console.log('✅ Customer groups loaded successfully')
      } catch (error) {
        console.error('❌ Error loading customer groups:', error)
        // Always provide fallbacks
        this.groupsCache.set('individual', 'Individual Customers')
        this.groupsCache.set('corporate', 'Corporate Customers')
        this.groupsCache.set('vip', 'VIP Customers')
        this.groupsCache.set('new', 'New Customers')
      }
    }
  }

  /**
   * ✅ PATTERN: Create customer with proper success data
   * Updated for HERA Universal Schema
   */
  async create(organizationId: string, data: any): Promise<ServiceResult> {
    try {
      console.log('🔍 CustomerServiceAdapter.create called with:', { organizationId, data })
      
      const customerData = convertCRUDEntityToCustomer(data)
      customerData.organizationId = organizationId // Set organization ID
      console.log('🔄 Converted customer data:', customerData)
      
      const result = await CustomerCrudService.createCustomer(customerData)
      console.log('📊 CustomerCrudService.createCustomer result:', result)
      
      if (!result.success) {
        console.error('❌ Customer creation failed:', result.error, result.details)
        return {
          success: false,
          error: result.error || 'Failed to create customer'
        }
      }

      if (!result.data?.id) {
        console.error('❌ Customer creation succeeded but no ID returned:', result)
        return {
          success: false,
          error: 'Customer created but no ID returned'
        }
      }

      console.log('✅ Customer created successfully with ID:', result.data.id)
      
      return {
        success: true,
        data: {
          id: result.data.id,
          name: result.data.entity_name,
          entity_name: result.data.entity_name,
          entity_code: result.data.entity_code,
          ...data
        }
      }

    } catch (error) {
      console.error('❌ CustomerServiceAdapter.create error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  /**
   * ✅ PATTERN: Read customer by ID
   * Updated for HERA Universal Schema
   */
  async read(organizationId: string, id: string): Promise<ServiceResult> {
    try {
      await this.ensureGroupsLoaded(organizationId)

      const result = await CustomerCrudService.getCustomer(organizationId, id)
      
      if (!result.success) {
        return {
          success: false,
          error: result.error || 'Failed to fetch customer'
        }
      }

      const crudEntity = convertCustomerToCRUDEntity(result.data!)

      return {
        success: true,
        data: crudEntity
      }

    } catch (error) {
      console.error('CustomerServiceAdapter.read error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  /**
   * ✅ PATTERN: Update customer with proper result handling
   * Updated for HERA Universal Schema
   */
  async update(organizationId: string, id: string, data: any): Promise<ServiceResult> {
    try {
      // Convert to update format
      const updateData: CustomerUpdateInput = {
        entity_name: data.name,
        metadata: {
          email: data.email,
          phone: data.phone,
          first_name: data.firstName,
          last_name: data.lastName,
          customer_type: data.customerType,
          birth_date: data.birthDate,
          preferred_name: data.preferredName,
          acquisition_source: data.acquisitionSource,
          preferred_contact_method: data.preferredContactMethod,
          notes: data.notes,
          
          // Parse preferences from flattened format
          favorite_teas: data['preferences.favoriteTeas'] 
            ? data['preferences.favoriteTeas'].split(',').map((s: string) => s.trim()) 
            : [],
          caffeine_preference: data['preferences.caffeinePreference'],
          temperature_preference: data['preferences.temperaturePreference'],
          dietary_restrictions: data['preferences.dietaryRestrictions']
            ? data['preferences.dietaryRestrictions'].split(',').map((s: string) => s.trim())
            : [],
          allergies: data['preferences.allergies']
            ? data['preferences.allergies'].split(',').map((s: string) => s.trim())
            : []
        }
      }
      
      const result = await CustomerCrudService.updateCustomer(organizationId, id, updateData)
      
      if (!result.success) {
        return {
          success: false,
          error: result.error || 'Failed to update customer'
        }
      }

      // Return updated customer
      const getResult = await this.read(organizationId, id)
      return getResult

    } catch (error) {
      console.error('CustomerServiceAdapter.update error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  /**
   * ✅ PATTERN: Delete customer with proper cleanup
   * Updated for HERA Universal Schema
   */
  async delete(organizationId: string, id: string): Promise<ServiceResult> {
    try {
      const result = await CustomerCrudService.deleteCustomer(organizationId, id)
      
      if (!result.success) {
        return {
          success: false,
          error: result.error || 'Failed to delete customer'
        }
      }

      return {
        success: true,
        data: null
      }

    } catch (error) {
      console.error('CustomerServiceAdapter.delete error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  /**
   * ✅ PATTERN: List customers with filtering, sorting, pagination
   * Updated for HERA Universal Schema
   */
  async list(organizationId: string, options: ListOptions = {}): Promise<ServiceResult> {
    try {
      console.log('🔍 CustomerServiceAdapter.list called with:', { organizationId, options })
      
      await this.ensureGroupsLoaded(organizationId)

      // Build search and filter options for CustomerCrudService
      const listOptions = {
        search: options.search || '',
        customerType: options.filters?.customerType as any,
        loyaltyTier: options.filters?.loyaltyTier as any,
        isActive: options.filters?.isActive !== undefined ? options.filters.isActive : true,
        limit: options.pageSize || 50,
        offset: ((options.page || 1) - 1) * (options.pageSize || 50)
      }

      const result = await CustomerCrudService.listCustomers(organizationId, listOptions)
      console.log('📊 CustomerCrudService.listCustomers result:', result)
      
      if (!result.success) {
        console.error('❌ Failed to get customers:', result.error)
        return {
          success: false,
          error: result.error || 'Failed to fetch customers'
        }
      }

      let customers = result.data?.customers || []
      console.log('🔄 Raw customers from service:', customers.length)

      // Apply additional filters that aren't handled by the service
      if (options.filters) {
        customers = customers.filter((customer: any) => {
          return Object.entries(options.filters!).every(([field, value]) => {
            if (value === null || value === undefined || value === '') return true
            
            let customerValue
            
            // Handle special field mappings
            if (field === 'totalSpent') {
              customerValue = customer.metadata?.lifetime_value || 0
              // For number fields, handle range filtering
              if (typeof value === 'object' && value.min !== undefined) {
                return customerValue >= value.min && (value.max === undefined || customerValue <= value.max)
              }
            } else if (field === 'totalOrders') {
              customerValue = customer.metadata?.total_visits || 0
            } else {
              customerValue = customer.metadata?.[field] || customer[field]
            }
            
            if (Array.isArray(value)) {
              return value.includes(customerValue)
            }
            
            if (typeof value === 'string') {
              return String(customerValue).toLowerCase().includes(value.toLowerCase())
            }
            
            return customerValue === value
          })
        })
      }

      // Apply sorting
      if (options.sort) {
        customers.sort((a: any, b: any) => {
          let aValue, bValue
          
          // Handle special field mappings for sorting
          if (options.sort!.key === 'totalSpent') {
            aValue = a.metadata?.lifetime_value || 0
            bValue = b.metadata?.lifetime_value || 0
          } else if (options.sort!.key === 'totalOrders') {
            aValue = a.metadata?.total_visits || 0
            bValue = b.metadata?.total_visits || 0
          } else {
            aValue = a.metadata?.[options.sort!.key] || a[options.sort!.key]
            bValue = b.metadata?.[options.sort!.key] || b[options.sort!.key]
          }
          
          if (aValue < bValue) return options.sort!.direction === 'desc' ? 1 : -1
          if (aValue > bValue) return options.sort!.direction === 'desc' ? -1 : 1
          return 0
        })
      }

      // Convert to CRUD entities
      const crudEntities = customers.map((customer: any) => 
        convertCustomerToCRUDEntity(customer)
      )

      console.log('✅ Final customer entities to return:', crudEntities.length)
      console.log('📊 Metadata:', {
        total: result.data?.total || 0,
        page: options.page || 1,
        pageSize: options.pageSize || 50,
        hasMore: (result.data?.total || 0) > ((options.page || 1) * (options.pageSize || 50))
      })

      return {
        success: true,
        data: crudEntities,
        metadata: {
          total: result.data?.total || 0,
          page: options.page || 1,
          pageSize: options.pageSize || 50,
          hasMore: (result.data?.total || 0) > ((options.page || 1) * (options.pageSize || 50))
        }
      }

    } catch (error) {
      console.error('CustomerServiceAdapter.list error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  /**
   * ✅ PATTERN: Search customers using list with query
   */
  async search(organizationId: string, query: string, options: SearchOptions = {}): Promise<ServiceResult> {
    return this.list(organizationId, { ...options, search: query })
  }

  /**
   * ✅ PATTERN: Bulk delete customers with error aggregation
   * Updated for HERA Universal Schema
   */
  async bulkDelete(organizationId: string, ids: string[]): Promise<ServiceResult> {
    try {
      const results = await Promise.allSettled(
        ids.map(id => this.delete(organizationId, id))
      )

      const failures = results.filter(result => 
        result.status === 'rejected' || 
        (result.status === 'fulfilled' && !result.value.success)
      )

      if (failures.length > 0) {
        return {
          success: false,
          error: `Failed to delete ${failures.length} of ${ids.length} customers`
        }
      }

      return {
        success: true,
        data: {
          deleted: ids.length - failures.length,
          failed: failures.length
        }
      }

    } catch (error) {
      console.error('CustomerServiceAdapter.bulkDelete error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }
}

// ============================================================================
// FACTORY FUNCTION
// ============================================================================

/**
 * Creates a CustomerServiceAdapter instance
 */
export function createCustomerServiceAdapter(): CustomerServiceAdapter {
  return new CustomerServiceAdapter()
}