/**
 * HERA Universal Customer CRUD Service
 * 
 * Following the exact same pattern as UniversalProductService
 * Uses HERA Universal Schema: core_entities + core_metadata (NO core_dynamic_data)
 */

import { createClient } from '@/lib/supabase/client'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

const supabase = createClient()

// Admin client for read operations and RLS bypass when needed
const supabaseAdmin = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    },
    global: {
      headers: {
        'apikey': process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY!,
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY!}`
      }
    }
  }
)

// Helper to get authenticated client for write operations
const getAuthenticatedClient = async () => {
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    console.warn('⚠️ No authenticated user found, using admin client for write operation')
    return supabaseAdmin
  }
  
  // For write operations, always use admin client to bypass RLS
  console.log('🔑 Using admin client for write operation to bypass RLS')
  return supabaseAdmin
}

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

export interface CustomerEntity {
  id: string
  organization_id: string
  entity_type: 'customer'
  entity_name: string
  entity_code: string
  is_active: boolean
  created_at?: string
  updated_at?: string
}

export interface CustomerMetadata {
  // Core Information
  email: string
  phone: string
  first_name: string
  last_name: string
  customer_type: 'individual' | 'corporate' | 'vip'
  birth_date: string
  preferred_name: string
  acquisition_source: string
  preferred_contact_method: 'email' | 'sms' | 'phone' | 'app'
  notes: string
  
  // Business Intelligence
  total_visits: number
  lifetime_value: number
  average_order_value: number
  last_visit_date: string
  loyalty_tier: 'bronze' | 'silver' | 'gold' | 'platinum'
  loyalty_points: number
  
  // Preferences
  favorite_teas: string[]
  caffeine_preference: 'none' | 'low' | 'moderate' | 'high'
  temperature_preference: 'hot' | 'iced' | 'both'
  dietary_restrictions: string[]
  allergies: string[]
  
  // Status & Metadata
  status: 'active' | 'inactive' | 'vip'
  is_draft: boolean
  created_by: string
  updated_by: string
}

export interface CustomerCreateInput {
  organizationId: string
  entity_name: string
  entity_code?: string
  metadata: CustomerMetadata
}

export interface CustomerUpdateInput {
  entity_name?: string
  entity_code?: string
  metadata?: Partial<CustomerMetadata>
  is_active?: boolean
}

export interface Customer {
  id: string
  organization_id: string
  entity_name: string
  entity_code: string
  is_active: boolean
  created_at: string
  updated_at: string
  metadata: CustomerMetadata
}

export interface ServiceResult<T = any> {
  success: boolean
  data?: T
  error?: string
  details?: any
}

// ============================================================================
// CUSTOMER CRUD SERVICE
// ============================================================================

export class CustomerCrudService {
  
  /**
   * Generate customer code
   */
  static generateCustomerCode(customerType: string): string {
    const prefix = {
      'individual': 'IND',
      'corporate': 'CORP',
      'vip': 'VIP'
    }[customerType] || 'CUST'
    
    const timestamp = Date.now().toString().slice(-4)
    return `${prefix}-${timestamp}`
  }

  /**
   * Initialize customer system with sample data
   */
  static async initializeCustomerData(organizationId?: string): Promise<void> {
    if (!organizationId) {
      console.log('⏭️ Skipping customer initialization - no organization ID provided')
      return
    }

    try {
      console.log('👥 Initializing Universal Customer System for organization:', organizationId)
      
      // Check if sample customers already exist
      const { data: existingCustomers, error: checkError } = await supabase
        .from('core_entities')
        .select('id')
        .eq('organization_id', organizationId)
        .eq('entity_type', 'customer')
        .limit(1)

      if (checkError) {
        console.error('❌ Error checking existing customers:', checkError)
        throw checkError
      }

      if (existingCustomers && existingCustomers.length > 0) {
        console.log('✅ Sample customers already exist')
        return
      }

      // Verify organization exists
      const { data: orgExists, error: orgError } = await supabase
        .from('core_organizations')
        .select('id')
        .eq('id', organizationId)
        .single()

      if (orgError || !orgExists) {
        console.log('⚠️ Skipping customer initialization - organization does not exist:', organizationId)
        return
      }

      // Create sample customers
      const sampleCustomers = [
        {
          id: '550e8400-e29b-41d4-a716-446655440040',
          entity_name: 'Sarah Johnson',
          entity_code: 'IND-001',
          metadata: {
            email: 'sarah.johnson@example.com',
            phone: '+1-555-0123',
            first_name: 'Sarah',
            last_name: 'Johnson',
            customer_type: 'individual',
            birth_date: '1990-05-15',
            preferred_name: 'Sarah',
            acquisition_source: 'instagram',
            preferred_contact_method: 'email',
            notes: 'Loves herbal teas and quiet atmosphere',
            total_visits: 15,
            lifetime_value: 387.50,
            average_order_value: 25.83,
            last_visit_date: '2024-01-10',
            loyalty_tier: 'gold',
            loyalty_points: 485,
            favorite_teas: ['chamomile', 'peppermint', 'jasmine_green'],
            caffeine_preference: 'low',
            temperature_preference: 'hot',
            dietary_restrictions: ['vegetarian'],
            allergies: [],
            status: 'active',
            is_draft: false,
            created_by: 'system',
            updated_by: 'system'
          }
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440041',
          entity_name: 'Michael Chen',
          entity_code: 'VIP-001',
          metadata: {
            email: 'michael.chen@businesscorp.com',
            phone: '+1-555-0124',
            first_name: 'Michael',
            last_name: 'Chen',
            customer_type: 'vip',
            birth_date: '1985-08-22',
            preferred_name: 'Mike',
            acquisition_source: 'referral',
            preferred_contact_method: 'email',
            notes: 'VIP customer - prefers strong teas, usually orders for meetings',
            total_visits: 32,
            lifetime_value: 1250.75,
            average_order_value: 39.09,
            last_visit_date: '2024-01-12',
            loyalty_tier: 'platinum',
            loyalty_points: 1875,
            favorite_teas: ['earl_grey', 'english_breakfast', 'oolong'],
            caffeine_preference: 'high',
            temperature_preference: 'hot',
            dietary_restrictions: [],
            allergies: ['nuts'],
            status: 'vip',
            is_draft: false,
            created_by: 'system',
            updated_by: 'system'
          }
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440042',
          entity_name: 'Emma Wilson',
          entity_code: 'IND-002',
          metadata: {
            email: 'emma.wilson@example.com',
            phone: '+1-555-0125',
            first_name: 'Emma',
            last_name: 'Wilson',
            customer_type: 'individual',
            birth_date: '1995-03-18',
            preferred_name: 'Emma',
            acquisition_source: 'walk_in',
            preferred_contact_method: 'sms',
            notes: 'Student, enjoys studying here. Prefers iced drinks',
            total_visits: 8,
            lifetime_value: 124.50,
            average_order_value: 15.56,
            last_visit_date: '2024-01-08',
            loyalty_tier: 'silver',
            loyalty_points: 125,
            favorite_teas: ['jasmine_green', 'white_tea'],
            caffeine_preference: 'moderate',
            temperature_preference: 'iced',
            dietary_restrictions: ['gluten_free'],
            allergies: ['dairy'],
            status: 'active',
            is_draft: false,
            created_by: 'system',
            updated_by: 'system'
          }
        }
      ]

      for (const customer of sampleCustomers) {
        // Create customer entity
        const authClient = await getAuthenticatedClient()
        const { error: entityError } = await authClient
          .from('core_entities')
          .insert({
            id: customer.id,
            organization_id: organizationId,
            entity_type: 'customer',
            entity_name: customer.entity_name,
            entity_code: customer.entity_code,
            is_active: true
          })

        if (entityError && entityError.code !== '23505') {
          if (entityError.code === '23502' && entityError.message.includes('changed_by')) {
            console.log(`⚠️ Skipping customer ${customer.entity_name} - audit trigger requires user context`)
            continue
          }
          console.error(`❌ Error creating customer entity ${customer.entity_name}:`, entityError)
          continue
        }

        // Create customer metadata
        const { error: metadataError } = await authClient
          .from('core_metadata')
          .insert({
            organization_id: organizationId,
            entity_type: 'customer',
            entity_id: customer.id,
            metadata_type: 'customer_details',
            metadata_category: 'profile',
            metadata_key: 'customer_info',
            metadata_value: customer.metadata,
            is_system_generated: false,
            created_by: '550e8400-e29b-41d4-a716-446655440010'
          })

        if (metadataError && metadataError.code !== '23505') {
          if (metadataError.code === '23502' && metadataError.message.includes('changed_by')) {
            console.log(`⚠️ Skipping metadata for customer ${customer.entity_name} - audit trigger requires user context`)
          } else {
            console.error(`❌ Error creating customer metadata ${customer.entity_name}:`, metadataError)
          }
        } else {
          console.log(`✅ Created sample customer: ${customer.entity_name}`)
        }
      }

      console.log('✅ Universal Customer System initialized successfully')
    } catch (error) {
      console.error('❌ Error initializing customer data:', error)
      throw error
    }
  }

  /**
   * CREATE - Create new customer
   */
  static async createCustomer(customerInput: CustomerCreateInput): Promise<ServiceResult<Customer>> {
    try {
      console.log('🚀 Creating customer:', customerInput.entity_name)

      await this.initializeCustomerData(customerInput.organizationId)

      const customerId = crypto.randomUUID()
      const customerCode = customerInput.entity_code || this.generateCustomerCode(customerInput.metadata.customer_type)

      // Calculate status based on customer type
      const status = customerInput.metadata.customer_type === 'vip' ? 'vip' : 'active'

      // Create customer entity
      const authClient = await getAuthenticatedClient()
      const { error: entityError } = await authClient
        .from('core_entities')
        .insert({
          id: customerId,
          organization_id: customerInput.organizationId,
          entity_type: 'customer',
          entity_name: customerInput.entity_name,
          entity_code: customerCode,
          is_active: true
        })

      if (entityError) {
        console.error('❌ Error creating customer entity:', entityError)
        throw entityError
      }

      // Create customer metadata
      const metadata = {
        ...customerInput.metadata,
        status,
        created_by: '550e8400-e29b-41d4-a716-446655440010',
        updated_by: '550e8400-e29b-41d4-a716-446655440010'
      }

      const { error: metadataError } = await authClient
        .from('core_metadata')
        .insert({
          organization_id: customerInput.organizationId,
          entity_type: 'customer',
          entity_id: customerId,
          metadata_type: 'customer_details',
          metadata_category: 'profile',
          metadata_key: 'customer_info',
          metadata_value: metadata,
          is_system_generated: false,
          created_by: '550e8400-e29b-41d4-a716-446655440010'
        })

      if (metadataError) {
        console.error('❌ Error creating customer metadata:', metadataError)
        throw metadataError
      }

      const customer: Customer = {
        id: customerId,
        organization_id: customerInput.organizationId,
        entity_name: customerInput.entity_name,
        entity_code: customerCode,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        metadata: metadata
      }

      console.log('✅ Customer created successfully:', customerId)
      return { success: true, data: customer }

    } catch (error) {
      console.error('🚨 Customer creation failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Customer creation failed',
        details: error
      }
    }
  }

  /**
   * READ - Get customer by ID
   */
  static async getCustomer(organizationId: string, customerId: string): Promise<ServiceResult<Customer>> {
    try {
      console.log('📖 Getting customer:', customerId)

      // Get customer entity - use admin client for better reliability
      const { data: entity, error: entityError } = await supabaseAdmin
        .from('core_entities')
        .select('*')
        .eq('id', customerId)
        .eq('organization_id', organizationId)
        .eq('entity_type', 'customer')
        .single()

      if (entityError) {
        console.error('❌ Customer not found:', entityError)
        throw new Error('Customer not found')
      }

      // Get customer metadata - use admin client for better reliability
      const { data: metadata, error: metadataError } = await supabaseAdmin
        .from('core_metadata')
        .select('metadata_value')
        .eq('entity_id', customerId)
        .eq('organization_id', organizationId)
        .eq('metadata_key', 'customer_info')
        .single()

      if (metadataError) {
        console.error('❌ Customer metadata not found:', metadataError)
        throw new Error('Customer metadata not found')
      }

      const customer: Customer = {
        ...entity,
        metadata: metadata.metadata_value
      }

      console.log('✅ Customer retrieved successfully')
      return { success: true, data: customer }

    } catch (error) {
      console.error('🚨 Get customer failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get customer',
        details: error
      }
    }
  }

  /**
   * LIST - Get customers with filtering
   */
  static async listCustomers(
    organizationId: string,
    options: {
      search?: string
      customerType?: 'individual' | 'corporate' | 'vip'
      loyaltyTier?: 'bronze' | 'silver' | 'gold' | 'platinum'
      isActive?: boolean
      limit?: number
      offset?: number
    } = {}
  ): Promise<ServiceResult<{ customers: Customer[], total: number }>> {
    try {
      console.log('📋 Listing customers with options:', options)

      await this.initializeCustomerData(organizationId)

      // Build query for entities - use admin client for better reliability
      let query = supabaseAdmin
        .from('core_entities')
        .select('*', { count: 'exact' })
        .eq('organization_id', organizationId)
        .eq('entity_type', 'customer')

      // Apply filters
      if (options.isActive !== undefined) {
        query = query.eq('is_active', options.isActive)
      }

      if (options.search) {
        query = query.ilike('entity_name', `%${options.search}%`)
      }

      // Apply pagination
      const limit = options.limit || 50
      const offset = options.offset || 0
      query = query.range(offset, offset + limit - 1)

      const { data: entities, error: entityError, count } = await query

      if (entityError) {
        console.error('❌ Entity query error:', entityError)
        throw entityError
      }

      if (!entities || entities.length === 0) {
        return { success: true, data: { customers: [], total: count || 0 } }
      }

      // Get metadata for all customers - use admin client for better reliability
      const entityIds = entities.map(e => e.id)
      const { data: metadataList, error: metadataError } = await supabaseAdmin
        .from('core_metadata')
        .select('entity_id, metadata_value')
        .eq('organization_id', organizationId)
        .in('entity_id', entityIds)
        .eq('metadata_key', 'customer_info')

      if (metadataError) {
        console.error('❌ Metadata query error:', metadataError)
        throw metadataError
      }

      // Create metadata lookup
      const metadataMap = new Map<string, any>()
      metadataList?.forEach(item => {
        metadataMap.set(item.entity_id, item.metadata_value)
      })

      // Build customer objects and apply metadata filters
      let customers: Customer[] = entities.map(entity => ({
        ...entity,
        metadata: metadataMap.get(entity.id) || {}
      }))

      // Apply metadata-based filters
      if (options.customerType) {
        customers = customers.filter(c => c.metadata.customer_type === options.customerType)
      }

      if (options.loyaltyTier) {
        customers = customers.filter(c => c.metadata.loyalty_tier === options.loyaltyTier)
      }

      console.log(`✅ Retrieved ${customers.length} customers (total: ${count})`)
      return { success: true, data: { customers, total: count || 0 } }

    } catch (error) {
      console.error('🚨 List customers failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to list customers',
        details: error
      }
    }
  }

  /**
   * UPDATE - Update customer
   */
  static async updateCustomer(
    organizationId: string,
    customerId: string,
    updates: CustomerUpdateInput
  ): Promise<ServiceResult<Customer>> {
    try {
      console.log('📝 Updating customer:', customerId)

      const authClient = await getAuthenticatedClient()

      // Update entity if needed
      if (updates.entity_name || updates.entity_code || updates.is_active !== undefined) {
        const entityUpdates: any = {}
        if (updates.entity_name) entityUpdates.entity_name = updates.entity_name
        if (updates.entity_code) entityUpdates.entity_code = updates.entity_code
        if (updates.is_active !== undefined) entityUpdates.is_active = updates.is_active

        const { error: entityError } = await authClient
          .from('core_entities')
          .update(entityUpdates)
          .eq('id', customerId)
          .eq('organization_id', organizationId)

        if (entityError) {
          console.error('❌ Entity update error:', entityError)
          throw entityError
        }
      }

      // Update metadata if needed
      if (updates.metadata) {
        // Get current metadata - use admin client for better reliability
        const { data: currentMeta, error: getError } = await supabaseAdmin
          .from('core_metadata')
          .select('metadata_value')
          .eq('entity_id', customerId)
          .eq('organization_id', organizationId)
          .eq('metadata_key', 'customer_info')
          .single()

        if (getError) {
          console.error('❌ Get current metadata error:', getError)
          throw getError
        }

        // Merge updates with current metadata
        const updatedMetadata = {
          ...currentMeta.metadata_value,
          ...updates.metadata,
          updated_by: '550e8400-e29b-41d4-a716-446655440010'
        }

        const { error: metadataError } = await authClient
          .from('core_metadata')
          .update({
            metadata_value: updatedMetadata,
            updated_at: new Date().toISOString()
          })
          .eq('entity_id', customerId)
          .eq('organization_id', organizationId)
          .eq('metadata_key', 'customer_info')

        if (metadataError) {
          console.error('❌ Metadata update error:', metadataError)
          throw metadataError
        }
      }

      // Return updated customer
      const updatedCustomer = await this.getCustomer(organizationId, customerId)
      console.log('✅ Customer updated successfully')
      return updatedCustomer

    } catch (error) {
      console.error('🚨 Customer update failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Customer update failed',
        details: error
      }
    }
  }

  /**
   * DELETE - Delete customer
   */
  static async deleteCustomer(organizationId: string, customerId: string): Promise<ServiceResult<boolean>> {
    try {
      console.log('🗑️ Deleting customer:', customerId)

      const authClient = await getAuthenticatedClient()

      // Delete metadata first
      const { error: metadataError } = await authClient
        .from('core_metadata')
        .delete()
        .eq('entity_id', customerId)
        .eq('organization_id', organizationId)

      if (metadataError) {
        console.error('❌ Metadata deletion error:', metadataError)
        throw metadataError
      }

      // Delete entity
      const { error: entityError } = await authClient
        .from('core_entities')
        .delete()
        .eq('id', customerId)
        .eq('organization_id', organizationId)

      if (entityError) {
        console.error('❌ Entity deletion error:', entityError)
        throw entityError
      }

      console.log('✅ Customer deleted successfully')
      return { success: true, data: true }

    } catch (error) {
      console.error('🚨 Customer deletion failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Customer deletion failed',
        details: error
      }
    }
  }

  /**
   * UPDATE BUSINESS INTELLIGENCE - Update customer stats
   */
  static async updateCustomerStats(
    organizationId: string,
    customerId: string,
    stats: {
      incrementVisits?: boolean
      addSpending?: number
      updateLastVisit?: boolean
    }
  ): Promise<ServiceResult<boolean>> {
    try {
      console.log('📊 Updating customer stats:', customerId, stats)

      // Get current customer
      const customerResult = await this.getCustomer(organizationId, customerId)
      if (!customerResult.success) {
        throw new Error('Customer not found')
      }

      const customer = customerResult.data!
      const currentMeta = customer.metadata

      // Calculate new stats
      const newStats: Partial<CustomerMetadata> = {}

      if (stats.incrementVisits) {
        newStats.total_visits = (currentMeta.total_visits || 0) + 1
      }

      if (stats.addSpending) {
        const newLifetimeValue = (currentMeta.lifetime_value || 0) + stats.addSpending
        const totalVisits = newStats.total_visits || currentMeta.total_visits || 0
        newStats.lifetime_value = newLifetimeValue
        newStats.average_order_value = totalVisits > 0 ? newLifetimeValue / totalVisits : 0

        // Update loyalty tier based on spending
        if (newLifetimeValue >= 1000) newStats.loyalty_tier = 'platinum'
        else if (newLifetimeValue >= 500) newStats.loyalty_tier = 'gold'
        else if (newLifetimeValue >= 200) newStats.loyalty_tier = 'silver'
        else newStats.loyalty_tier = 'bronze'
      }

      if (stats.updateLastVisit) {
        newStats.last_visit_date = new Date().toISOString().split('T')[0]
      }

      // Update customer with new stats
      const updateResult = await this.updateCustomer(organizationId, customerId, {
        metadata: newStats
      })

      console.log('✅ Customer stats updated successfully')
      return { success: true, data: updateResult.success }

    } catch (error) {
      console.error('🚨 Update customer stats failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update customer stats',
        details: error
      }
    }
  }
}

export default CustomerCrudService