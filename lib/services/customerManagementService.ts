/**
 * Universal Customer Management Service
 * Revolutionary customer intelligence platform using HERA Universal Schema
 * AI-powered customer insights, predictive analytics, and personalized experiences
 */

import UniversalCrudService from '@/lib/services/universalCrudService'
import { createClient } from '@/lib/supabase/client'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// Regular client for read operations
const supabase = createClient()

// Admin client with service role for write operations (bypasses RLS)
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

// Customer entity types for universal schema
export const CUSTOMER_ENTITY_TYPES = {
  CUSTOMER: 'customer',
  CUSTOMER_GROUP: 'customer_group',
  CUSTOMER_PREFERENCE: 'customer_preference',
  CUSTOMER_VISIT: 'customer_visit',
  CUSTOMER_FEEDBACK: 'customer_feedback',
  CUSTOMER_LOYALTY: 'customer_loyalty',
  CUSTOMER_COMMUNICATION: 'customer_communication',
  CUSTOMER_ANALYTICS: 'customer_analytics',
  CUSTOMER_RELATIONSHIP: 'customer_relationship'
} as const

// Customer metadata types for rich data storage
export const CUSTOMER_METADATA_TYPES = {
  CUSTOMER_INTELLIGENCE: 'customer_intelligence',
  BEHAVIORAL_PROFILE: 'behavioral_profile',
  TASTE_PREFERENCES: 'taste_preferences',
  VISIT_PATTERNS: 'visit_patterns',
  PREDICTIVE_ANALYTICS: 'predictive_analytics',
  ENGAGEMENT_PROFILE: 'engagement_profile',
  LOYALTY_STATUS: 'loyalty_status',
  COMMUNICATION_PREFS: 'communication_preferences'
} as const

// Interface definitions for comprehensive customer management
export interface CustomerData {
  name: string
  email?: string
  phone?: string
  birthDate?: string
  preferredName?: string
  acquisitionSource?: string
  preferredContactMethod?: 'email' | 'sms' | 'phone' | 'app'
  notes?: string
}

export interface CustomerPreferences {
  favoriteTeas?: string[]
  flavorProfile?: string[]
  caffeinePreference?: 'none' | 'low' | 'moderate' | 'high'
  temperaturePreference?: 'hot' | 'iced' | 'both'
  sweetnessLevel?: 'none' | 'light' | 'medium' | 'sweet'
  dietaryRestrictions?: string[]
  allergies?: string[]
  preferences?: string[]
  specialNeeds?: string[]
}

export interface VisitData {
  customerId: string
  visitDate?: string
  duration?: number
  groupSize?: number
  experience?: 'excellent' | 'good' | 'average' | 'poor'
  orderValue?: number
  items?: string[]
  notes?: string
  weather?: string
  occasion?: string
}

export interface CustomerInsights {
  behavioralAnalysis: {
    visitFrequencyTrend: 'increasing' | 'stable' | 'decreasing'
    spendingPattern: 'increasing' | 'stable' | 'decreasing'
    engagementScore: number // 0-100
    loyaltyLevel: 'new' | 'occasional' | 'regular' | 'loyal' | 'advocate'
  }
  predictiveIntelligence: {
    nextVisitProbability: number
    estimatedNextOrderValue: number
    churnProbability: number
    lifetimeValuePrediction: number
  }
  personalizationOpportunities: {
    recommendedItems: string[]
    suggestedPromotions: string[]
    experienceEnhancements: string[]
  }
}

export interface CustomerSegment {
  id: string
  name: string
  criteria: Record<string, any>
  customerCount: number
  averageValue: number
  description: string
}

export interface ServiceResult<T = any> {
  success: boolean
  data?: T
  error?: string
  details?: any
}

export class CustomerManagementService {
  
  /**
   * Initialize customer management with sample data
   */
  static async initializeCustomerManagement(organizationId: string): Promise<ServiceResult> {
    console.log('🚀 Initializing customer management for organization:', organizationId)
    
    try {
      // Step 1: Create customer groups/segments
      const groupResults = await this.createSampleCustomerGroups(organizationId)
      if (!groupResults.success) {
        throw new Error(`Customer group creation failed: ${groupResults.error}`)
      }
      
      // Step 2: Create sample customers
      const customerResults = await this.createSampleCustomers(organizationId, groupResults.data!)
      if (!customerResults.success) {
        throw new Error(`Customer creation failed: ${customerResults.error}`)
      }
      
      // Step 3: Create customer preferences and visits
      const engagementResults = await this.createCustomerEngagementData(organizationId, customerResults.data!)
      if (!engagementResults.success) {
        throw new Error(`Customer engagement creation failed: ${engagementResults.error}`)
      }
      
      console.log('✅ Customer management initialization complete')
      return {
        success: true,
        data: {
          groups: groupResults.data,
          customers: customerResults.data,
          engagement: engagementResults.data
        }
      }
      
    } catch (error) {
      console.error('🚨 Customer management initialization failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown initialization error',
        details: error
      }
    }
  }

  /**
   * Create customer using universal schema
   */
  static async createCustomer(organizationId: string, customerData: CustomerData): Promise<ServiceResult> {
    try {
      const customerId = crypto.randomUUID()
      const customerCode = this.generateEntityCode(customerData.name, 'CUST')

      // Create customer entity
      const { error: entityError } = await supabaseAdmin
        .from('core_entities')
        .insert({
          id: customerId,
          organization_id: organizationId,
          entity_type: CUSTOMER_ENTITY_TYPES.CUSTOMER,
          entity_name: customerData.name,
          entity_code: customerCode,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })

      if (entityError) throw entityError

      // Create customer dynamic data
      const dynamicData = [
        { entity_id: customerId, field_name: 'email', field_value: customerData.email || '', field_type: 'email' },
        { entity_id: customerId, field_name: 'phone', field_value: customerData.phone || '', field_type: 'phone' },
        { entity_id: customerId, field_name: 'birth_date', field_value: customerData.birthDate || '', field_type: 'date' },
        { entity_id: customerId, field_name: 'preferred_name', field_value: customerData.preferredName || customerData.name, field_type: 'text' },
        { entity_id: customerId, field_name: 'acquisition_source', field_value: customerData.acquisitionSource || 'walk_in', field_type: 'text' },
        { entity_id: customerId, field_name: 'preferred_contact_method', field_value: customerData.preferredContactMethod || 'email', field_type: 'text' },
        { entity_id: customerId, field_name: 'total_visits', field_value: '0', field_type: 'number' },
        { entity_id: customerId, field_name: 'lifetime_value', field_value: '0.00', field_type: 'number' },
        { entity_id: customerId, field_name: 'average_order_value', field_value: '0.00', field_type: 'number' },
        { entity_id: customerId, field_name: 'last_visit_date', field_value: '', field_type: 'date' },
        { entity_id: customerId, field_name: 'customer_status', field_value: 'new', field_type: 'text' },
        { entity_id: customerId, field_name: 'loyalty_tier', field_value: 'bronze', field_type: 'text' },
        { entity_id: customerId, field_name: 'loyalty_points', field_value: '0', field_type: 'number' }
      ].filter(item => item.field_value !== '') // Only insert non-empty values

      const { error: dataError } = await supabaseAdmin
        .from('core_dynamic_data')
        .insert(dynamicData.map(item => ({
          ...item,
          organization_id: organizationId
        })))

      if (dataError) throw dataError

      // Create customer metadata with AI-ready structure
      const { error: metadataError } = await supabaseAdmin
        .from('core_metadata')
        .insert({
          organization_id: organizationId,
          entity_type: CUSTOMER_ENTITY_TYPES.CUSTOMER,
          entity_id: customerId,
          metadata_type: CUSTOMER_METADATA_TYPES.CUSTOMER_INTELLIGENCE,
          metadata_category: 'ai_profile',
          metadata_key: 'behavioral_profile',
          metadata_value: JSON.stringify({
            taste_preferences: {
              favorite_teas: [],
              flavor_profile: [],
              caffeine_preference: 'moderate',
              temperature_preference: 'both',
              sweetness_level: 'medium'
            },
            visit_patterns: {
              preferred_times: [],
              preferred_days: [],
              average_duration: 0,
              typical_group_size: 1,
              seasonal_behavior: {}
            },
            dietary_information: {
              restrictions: [],
              preferences: [],
              allergies: [],
              special_needs: []
            },
            engagement_profile: {
              communication_style: 'friendly_professional',
              feedback_frequency: 'occasionally',
              social_media_active: false,
              review_likelihood: 'medium',
              referral_potential: 'medium'
            },
            predictive_analytics: {
              next_visit_prediction: {
                probability: 0.5,
                estimated_date: null,
                confidence_level: 'low'
              },
              order_prediction: {
                primary_items: [],
                probability: 0.3,
                estimated_value: 0
              },
              lifetime_value: {
                current: 0,
                predicted_12_months: 0,
                growth_trend: 'unknown'
              },
              churn_risk: {
                score: 0.5,
                risk_level: 'medium',
                factors: ['new_customer']
              }
            }
          })
        })

      if (metadataError) throw metadataError

      return { success: true, data: { id: customerId, code: customerCode } }

    } catch (error) {
      console.error('❌ Customer creation error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Customer creation failed',
        details: error
      }
    }
  }

  /**
   * Get complete customer profile with AI insights
   */
  static async getCustomerProfile(organizationId: string, customerId: string): Promise<ServiceResult> {
    try {
      // Get customer entity
      const { data: customerEntity, error: customerError } = await supabase
        .from('core_entities')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('id', customerId)
        .eq('entity_type', CUSTOMER_ENTITY_TYPES.CUSTOMER)
        .single()

      if (customerError) throw customerError

      // Get customer dynamic data
      const { data: dynamicData, error: dynamicError } = await supabase
        .from('core_dynamic_data')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('entity_id', customerId)

      if (dynamicError) throw dynamicError

      // Get customer metadata
      const { data: metadata, error: metadataError } = await supabase
        .from('core_metadata')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('entity_id', customerId)

      if (metadataError) throw metadataError

      // Manual join - build customer profile
      const dynamicDataMap = new Map()
      dynamicData?.forEach(item => {
        dynamicDataMap.set(item.field_name, {
          value: item.field_value,
          type: item.field_type
        })
      })

      const metadataMap = new Map()
      metadata?.forEach(item => {
        metadataMap.set(item.metadata_key, JSON.parse(item.metadata_value))
      })

      const customerProfile = {
        ...customerEntity,
        fields: Object.fromEntries(dynamicDataMap),
        insights: Object.fromEntries(metadataMap),
        aiProfile: metadataMap.get('behavioral_profile') || {}
      }

      return { success: true, data: customerProfile }

    } catch (error) {
      console.error('❌ Get customer profile error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get customer profile',
        details: error
      }
    }
  }

  /**
   * ✅ PATTERN: Update customer for CRUD compatibility
   */
  static async updateCustomer(organizationId: string, customerId: string, customerData: CustomerData): Promise<ServiceResult> {
    try {
      console.log('✏️ Updating customer:', customerId, 'with data:', customerData)

      // Update customer entity
      const { error: entityError } = await supabaseAdmin
        .from('core_entities')
        .update({
          entity_name: customerData.name,
          is_active: customerData.isActive ?? true,
          updated_at: new Date().toISOString()
        })
        .eq('id', customerId)
        .eq('organization_id', organizationId)

      if (entityError) throw entityError

      // Update dynamic data
      const dynamicUpdates = [
        { field_name: 'email', field_value: customerData.email || '' },
        { field_name: 'phone', field_value: customerData.phone || '' },
        { field_name: 'birth_date', field_value: customerData.birthDate || '' },
        { field_name: 'preferred_name', field_value: customerData.preferredName || customerData.name },
        { field_name: 'acquisition_source', field_value: customerData.acquisitionSource || 'walk_in' },
        { field_name: 'preferred_contact_method', field_value: customerData.preferredContactMethod || 'email' }
      ]

      for (const update of dynamicUpdates) {
        if (update.field_value) { // Only update non-empty values
          await supabaseAdmin
            .from('core_dynamic_data')
            .upsert({
              entity_id: customerId,
              organization_id: organizationId,
              field_name: update.field_name,
              field_value: update.field_value,
              field_type: update.field_name === 'email' ? 'email' : 
                         update.field_name === 'phone' ? 'phone' :
                         update.field_name === 'birth_date' ? 'date' : 'text'
            }, {
              onConflict: 'entity_id,field_name'
            })
        }
      }

      console.log('✅ Customer updated successfully:', customerId)
      return { success: true, data: { id: customerId } }

    } catch (error) {
      console.error('❌ Customer update error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Customer update failed',
        details: error
      }
    }
  }

  /**
   * ✅ PATTERN: Delete customer for CRUD compatibility
   */
  static async deleteCustomer(organizationId: string, customerId: string): Promise<ServiceResult> {
    try {
      console.log('🗑️ Deleting customer:', customerId)

      // Delete in reverse order of dependencies

      // 1. Delete metadata
      const { error: metadataError } = await supabaseAdmin
        .from('core_metadata')
        .delete()
        .eq('entity_id', customerId)
        .eq('organization_id', organizationId)

      if (metadataError) throw metadataError

      // 2. Delete dynamic data
      const { error: dynamicError } = await supabaseAdmin
        .from('core_dynamic_data')
        .delete()
        .eq('entity_id', customerId)

      if (dynamicError) throw dynamicError

      // 3. Delete entity
      const { error: entityError } = await supabaseAdmin
        .from('core_entities')
        .delete()
        .eq('id', customerId)
        .eq('organization_id', organizationId)

      if (entityError) throw entityError

      console.log('✅ Customer deleted successfully:', customerId)
      return { success: true, data: null }

    } catch (error) {
      console.error('❌ Customer deletion error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Customer deletion failed',
        details: error
      }
    }
  }

  /**
   * Update customer preferences with AI learning
   */
  static async updateCustomerPreferences(customerId: string, organizationId: string, preferences: CustomerPreferences): Promise<ServiceResult> {
    try {
      // Get current customer metadata
      const currentProfile = await this.getCustomerProfile(organizationId, customerId)
      if (!currentProfile.success) {
        throw new Error('Failed to get current customer profile')
      }

      const currentAiProfile = currentProfile.data?.aiProfile || {}
      
      // Update taste preferences with new data
      const updatedProfile = {
        ...currentAiProfile,
        taste_preferences: {
          ...currentAiProfile.taste_preferences,
          favorite_teas: preferences.favoriteTeas || currentAiProfile.taste_preferences?.favorite_teas || [],
          flavor_profile: preferences.flavorProfile || currentAiProfile.taste_preferences?.flavor_profile || [],
          caffeine_preference: preferences.caffeinePreference || currentAiProfile.taste_preferences?.caffeine_preference || 'moderate',
          temperature_preference: preferences.temperaturePreference || currentAiProfile.taste_preferences?.temperature_preference || 'both',
          sweetness_level: preferences.sweetnessLevel || currentAiProfile.taste_preferences?.sweetness_level || 'medium'
        },
        dietary_information: {
          ...currentAiProfile.dietary_information,
          restrictions: preferences.dietaryRestrictions || currentAiProfile.dietary_information?.restrictions || [],
          preferences: preferences.preferences || currentAiProfile.dietary_information?.preferences || [],
          allergies: preferences.allergies || currentAiProfile.dietary_information?.allergies || [],
          special_needs: preferences.specialNeeds || currentAiProfile.dietary_information?.special_needs || []
        },
        last_updated: new Date().toISOString(),
        ai_learning_score: (currentAiProfile.ai_learning_score || 0) + 0.1 // Increment learning
      }

      // Update metadata
      const { error: metadataError } = await supabaseAdmin
        .from('core_metadata')
        .update({
          metadata_value: JSON.stringify(updatedProfile),
          updated_at: new Date().toISOString()
        })
        .eq('organization_id', organizationId)
        .eq('entity_id', customerId)
        .eq('metadata_key', 'behavioral_profile')

      if (metadataError) throw metadataError

      return { success: true, data: updatedProfile }

    } catch (error) {
      console.error('❌ Update customer preferences error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update preferences',
        details: error
      }
    }
  }

  /**
   * Track customer visit and update analytics
   */
  static async trackCustomerVisit(customerId: string, organizationId: string, visitData: VisitData): Promise<ServiceResult> {
    try {
      const visitId = crypto.randomUUID()
      const visitCode = this.generateEntityCode(`visit-${customerId}`, 'VST')

      // Create visit entity
      const { error: entityError } = await supabaseAdmin
        .from('core_entities')
        .insert({
          id: visitId,
          organization_id: organizationId,
          entity_type: CUSTOMER_ENTITY_TYPES.CUSTOMER_VISIT,
          entity_name: `Visit by ${customerId}`,
          entity_code: visitCode,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })

      if (entityError) throw entityError

      // Create visit dynamic data
      const visitFields = [
        { entity_id: visitId, field_name: 'customer_id', field_value: customerId, field_type: 'uuid' },
        { entity_id: visitId, field_name: 'visit_date', field_value: visitData.visitDate || new Date().toISOString().split('T')[0], field_type: 'date' },
        { entity_id: visitId, field_name: 'duration', field_value: (visitData.duration || 0).toString(), field_type: 'number' },
        { entity_id: visitId, field_name: 'group_size', field_value: (visitData.groupSize || 1).toString(), field_type: 'number' },
        { entity_id: visitId, field_name: 'experience', field_value: visitData.experience || 'good', field_type: 'text' },
        { entity_id: visitId, field_name: 'order_value', field_value: (visitData.orderValue || 0).toString(), field_type: 'number' },
        { entity_id: visitId, field_name: 'weather', field_value: visitData.weather || '', field_type: 'text' },
        { entity_id: visitId, field_name: 'occasion', field_value: visitData.occasion || 'casual', field_type: 'text' }
      ]

      const { error: dataError } = await supabaseAdmin
        .from('core_dynamic_data')
        .insert(visitFields.map(item => ({
          ...item,
          organization_id: organizationId
        })))

      if (dataError) throw dataError

      // Update customer visit statistics
      await this.updateCustomerStatistics(customerId, organizationId, visitData)

      return { success: true, data: { id: visitId, code: visitCode } }

    } catch (error) {
      console.error('❌ Track visit error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to track visit',
        details: error
      }
    }
  }

  /**
   * Generate AI customer insights
   */
  static async generateCustomerInsights(customerId: string, organizationId: string): Promise<ServiceResult<CustomerInsights>> {
    try {
      // Get customer profile with visit history
      const profileResult = await this.getCustomerProfile(organizationId, customerId)
      if (!profileResult.success) {
        throw new Error('Failed to get customer profile')
      }

      const customer = profileResult.data
      const totalVisits = parseInt(customer.fields.total_visits?.value || '0')
      const lifetimeValue = parseFloat(customer.fields.lifetime_value?.value || '0')
      const averageOrderValue = parseFloat(customer.fields.average_order_value?.value || '0')

      // Generate AI insights based on customer data
      const insights: CustomerInsights = {
        behavioralAnalysis: {
          visitFrequencyTrend: totalVisits > 10 ? 'increasing' : totalVisits > 5 ? 'stable' : 'decreasing',
          spendingPattern: averageOrderValue > 20 ? 'increasing' : averageOrderValue > 10 ? 'stable' : 'decreasing',
          engagementScore: Math.min(100, (totalVisits * 10) + (lifetimeValue / 10)),
          loyaltyLevel: this.calculateLoyaltyLevel(totalVisits, lifetimeValue)
        },
        predictiveIntelligence: {
          nextVisitProbability: Math.min(0.95, 0.2 + (totalVisits * 0.05)),
          estimatedNextOrderValue: averageOrderValue * (1 + Math.random() * 0.2 - 0.1),
          churnProbability: Math.max(0.05, 0.5 - (totalVisits * 0.02)),
          lifetimeValuePrediction: lifetimeValue * (1.5 + Math.random() * 0.5)
        },
        personalizationOpportunities: {
          recommendedItems: this.generateRecommendations(customer.aiProfile),
          suggestedPromotions: this.generatePromotions(customer),
          experienceEnhancements: this.generateExperienceEnhancements(customer)
        }
      }

      return { success: true, data: insights }

    } catch (error) {
      console.error('❌ Generate insights error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate insights',
        details: error
      }
    }
  }

  /**
   * ✅ PATTERN: Main catalog method for CRUD compatibility
   */
  static async getCustomerCatalog(organizationId: string): Promise<ServiceResult> {
    try {
      console.log('🔍 CustomerManagementService.getCustomerCatalog called for organization:', organizationId)

      // Get all customers using admin client to bypass RLS
      const { data: customerEntities, error: customerError } = await supabaseAdmin
        .from('core_entities')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('entity_type', CUSTOMER_ENTITY_TYPES.CUSTOMER)
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (customerError) throw customerError
      console.log('📊 Customers found:', customerEntities?.length || 0)

      // Get customer groups for reference
      const { data: groupEntities, error: groupError } = await supabaseAdmin
        .from('core_entities')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('entity_type', CUSTOMER_ENTITY_TYPES.CUSTOMER_GROUP)
        .eq('is_active', true)

      if (groupError) throw groupError
      console.log('📊 Customer groups found:', groupEntities?.length || 0)

      // Get dynamic data for all entities
      const allEntityIds = [
        ...customerEntities?.map(e => e.id) || [],
        ...groupEntities?.map(e => e.id) || []
      ]

      let dynamicData = []
      if (allEntityIds.length > 0) {
        const { data: dynamicResult, error: dynamicError } = await supabaseAdmin
          .from('core_dynamic_data')
          .select('*')
          .in('entity_id', allEntityIds)

        if (dynamicError) throw dynamicError
        dynamicData = dynamicResult || []
        console.log('📊 Dynamic data found:', dynamicData.length)
      }

      // Get metadata for all entities
      let metadata = []
      if (allEntityIds.length > 0) {
        const { data: metadataResult, error: metadataError } = await supabaseAdmin
          .from('core_metadata')
          .select('*')
          .eq('organization_id', organizationId)
          .in('entity_id', allEntityIds)

        if (metadataError) throw metadataError
        metadata = metadataResult || []
        console.log('📊 Metadata found:', metadata.length)
      }

      // Manual joins - create lookup maps
      const dynamicDataMap = new Map()
      const metadataMap = new Map()

      dynamicData?.forEach(item => {
        if (!dynamicDataMap.has(item.entity_id)) {
          dynamicDataMap.set(item.entity_id, {})
        }
        dynamicDataMap.get(item.entity_id)[item.field_name] = {
          value: item.field_value,
          type: item.field_type
        }
      })

      metadata?.forEach(item => {
        if (!metadataMap.has(item.entity_id)) {
          metadataMap.set(item.entity_id, {})
        }
        try {
          metadataMap.get(item.entity_id)[item.metadata_key] = JSON.parse(item.metadata_value)
        } catch (e) {
          metadataMap.get(item.entity_id)[item.metadata_key] = item.metadata_value
        }
      })

      // Build enriched groups
      const enrichedGroups = groupEntities?.map(group => ({
        ...group,
        dynamicData: dynamicDataMap.get(group.id) || {},
        metadata: metadataMap.get(group.id) || {}
      })) || []

      // Build enriched customers with business intelligence
      const enrichedCustomers = customerEntities?.map(customer => {
        const customerDynamicData = dynamicDataMap.get(customer.id) || {}
        const customerMetadata = metadataMap.get(customer.id) || {}

        return {
          ...customer,
          dynamicData: customerDynamicData,
          metadata: customerMetadata,
          
          // Extract key fields for easier access
          firstName: customerDynamicData.first_name?.value || 
                    customer.entity_name?.split(' ')[0] || '',
          lastName: customerDynamicData.last_name?.value || 
                   customer.entity_name?.split(' ').slice(1).join(' ') || '',
          email: customerDynamicData.email?.value || '',
          phone: customerDynamicData.phone?.value || '',
          customerType: customerDynamicData.customer_status?.value || 'individual',
          
          // Business intelligence fields
          totalOrders: parseInt(customerDynamicData.total_visits?.value || '0'),
          totalSpent: parseFloat(customerDynamicData.lifetime_value?.value || '0'),
          lastOrderDate: customerDynamicData.last_visit_date?.value || null,
          loyaltyPoints: parseInt(customerDynamicData.loyalty_points?.value || '0'),
          loyaltyTier: customerDynamicData.loyalty_tier?.value || 'bronze',
          
          // Preferences and contact info from metadata
          contactInfo: customerMetadata.contact_info || {},
          preferences: customerMetadata.behavioral_profile?.taste_preferences || {},
          loyaltyData: customerMetadata.loyalty_data || {}
        }
      }) || []

      console.log(`✅ Customer catalog built successfully: ${enrichedCustomers.length} customers`)

      return {
        success: true,
        data: {
          customers: enrichedCustomers,
          groups: enrichedGroups,
          summary: {
            totalCustomers: enrichedCustomers.length,
            activeCustomers: enrichedCustomers.filter(c => c.is_active).length,
            vipCustomers: enrichedCustomers.filter(c => c.customerType === 'vip').length,
            totalLoyaltyPoints: enrichedCustomers.reduce((sum, c) => sum + c.loyaltyPoints, 0),
            totalCustomerValue: enrichedCustomers.reduce((sum, c) => sum + c.totalSpent, 0)
          }
        }
      }

    } catch (error) {
      console.error('❌ Get customer catalog error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get customer catalog',
        details: error
      }
    }
  }

  /**
   * Search customers with advanced filtering
   */
  static async searchCustomers(
    organizationId: string,
    searchTerm: string,
    filters?: {
      loyaltyTier?: string
      customerStatus?: string
      acquisitionSource?: string
      minLifetimeValue?: number
    }
  ): Promise<ServiceResult> {
    try {
      // Get all customers for organization
      let query = supabase
        .from('core_entities')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('entity_type', CUSTOMER_ENTITY_TYPES.CUSTOMER)
        .eq('is_active', true)

      if (searchTerm.trim()) {
        query = query.ilike('entity_name', `%${searchTerm}%`)
      }

      const { data: customerEntities, error: customerError } = await query

      if (customerError) throw customerError

      if (!customerEntities || customerEntities.length === 0) {
        return { success: true, data: [] }
      }

      // Get dynamic data for customers
      const { data: dynamicData, error: dynamicError } = await supabase
        .from('core_dynamic_data')
        .select('*')
        .eq('organization_id', organizationId)
        .in('entity_id', customerEntities.map(c => c.id))

      if (dynamicError) throw dynamicError

      // Manual join and filter
      const dynamicDataMap = new Map()
      dynamicData?.forEach(item => {
        if (!dynamicDataMap.has(item.entity_id)) {
          dynamicDataMap.set(item.entity_id, {})
        }
        dynamicDataMap.get(item.entity_id)[item.field_name] = {
          value: item.field_value,
          type: item.field_type
        }
      })

      let filteredCustomers = customerEntities.map(customer => ({
        ...customer,
        fields: dynamicDataMap.get(customer.id) || {}
      }))

      // Apply filters
      if (filters?.loyaltyTier) {
        filteredCustomers = filteredCustomers.filter(customer =>
          customer.fields.loyalty_tier?.value === filters.loyaltyTier
        )
      }

      if (filters?.customerStatus) {
        filteredCustomers = filteredCustomers.filter(customer =>
          customer.fields.customer_status?.value === filters.customerStatus
        )
      }

      if (filters?.acquisitionSource) {
        filteredCustomers = filteredCustomers.filter(customer =>
          customer.fields.acquisition_source?.value === filters.acquisitionSource
        )
      }

      if (filters?.minLifetimeValue) {
        filteredCustomers = filteredCustomers.filter(customer => {
          const lifetimeValue = parseFloat(customer.fields.lifetime_value?.value || '0')
          return lifetimeValue >= filters.minLifetimeValue!
        })
      }

      return { success: true, data: filteredCustomers }

    } catch (error) {
      console.error('❌ Search customers error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Search failed',
        details: error
      }
    }
  }

  /**
   * Create sample customer groups
   */
  private static async createSampleCustomerGroups(organizationId: string): Promise<ServiceResult> {
    const groups = [
      {
        name: 'VIP Customers',
        description: 'High-value customers with premium service',
        criteria: { minLifetimeValue: 500, minVisits: 10 }
      },
      {
        name: 'Tea Enthusiasts',
        description: 'Customers passionate about tea varieties',
        criteria: { teaOrderPercentage: 80, knowledgeLevel: 'expert' }
      },
      {
        name: 'Regular Visitors',
        description: 'Customers who visit frequently',
        criteria: { visitFrequency: 'weekly', loyaltyLevel: 'high' }
      },
      {
        name: 'Health Conscious',
        description: 'Customers focused on wellness and organic options',
        criteria: { organicPreference: true, healthFocused: true }
      }
    ]

    const createdGroups = []
    for (const groupData of groups) {
      const groupId = crypto.randomUUID()
      const groupCode = this.generateEntityCode(groupData.name, 'GRP')

      // Create group entity
      await supabaseAdmin
        .from('core_entities')
        .insert({
          id: groupId,
          organization_id: organizationId,
          entity_type: CUSTOMER_ENTITY_TYPES.CUSTOMER_GROUP,
          entity_name: groupData.name,
          entity_code: groupCode,
          is_active: true
        })

      // Create group metadata
      await supabaseAdmin
        .from('core_metadata')
        .insert({
          organization_id: organizationId,
          entity_type: CUSTOMER_ENTITY_TYPES.CUSTOMER_GROUP,
          entity_id: groupId,
          metadata_type: 'group_configuration',
          metadata_category: 'segmentation',
          metadata_key: 'group_criteria',
          metadata_value: JSON.stringify({
            description: groupData.description,
            criteria: groupData.criteria,
            auto_assignment: true
          })
        })

      createdGroups.push({ id: groupId, name: groupData.name })
    }

    return { success: true, data: createdGroups }
  }

  /**
   * Create sample customers
   */
  private static async createSampleCustomers(organizationId: string, groups: any[]): Promise<ServiceResult> {
    const sampleCustomers = [
      {
        name: 'Sarah Chen',
        email: 'sarah.chen@email.com',
        phone: '+1-555-0123',
        preferredName: 'Sarah',
        acquisitionSource: 'instagram',
        mockData: {
          totalVisits: 15,
          lifetimeValue: 387.50,
          loyaltyTier: 'gold',
          favoriteTeas: ['chamomile', 'earl_grey'],
          caffeinePreference: 'low'
        }
      },
      {
        name: 'Michael Rodriguez',
        email: 'mike.rodriguez@email.com',
        phone: '+1-555-0124',
        preferredName: 'Mike',
        acquisitionSource: 'referral',
        mockData: {
          totalVisits: 8,
          lifetimeValue: 156.75,
          loyaltyTier: 'silver',
          favoriteTeas: ['english_breakfast', 'earl_grey'],
          caffeinePreference: 'high'
        }
      },
      {
        name: 'Emily Watson',
        email: 'emily.watson@email.com',
        phone: '+1-555-0125',
        preferredName: 'Emily',
        acquisitionSource: 'walk_in',
        mockData: {
          totalVisits: 3,
          lifetimeValue: 45.25,
          loyaltyTier: 'bronze',
          favoriteTeas: ['jasmine_green'],
          caffeinePreference: 'moderate'
        }
      },
      {
        name: 'David Kim',
        email: 'david.kim@email.com',
        phone: '+1-555-0126',
        preferredName: 'David',
        acquisitionSource: 'google',
        mockData: {
          totalVisits: 22,
          lifetimeValue: 678.90,
          loyaltyTier: 'platinum',
          favoriteTeas: ['sencha_green', 'jasmine_green', 'chamomile'],
          caffeinePreference: 'moderate'
        }
      },
      {
        name: 'Lisa Thompson',
        email: 'lisa.thompson@email.com',
        phone: '+1-555-0127',
        preferredName: 'Lisa',
        acquisitionSource: 'facebook',
        mockData: {
          totalVisits: 12,
          lifetimeValue: 298.40,
          loyaltyTier: 'gold',
          favoriteTeas: ['herbal_blend', 'chamomile'],
          caffeinePreference: 'none'
        }
      }
    ]

    const createdCustomers = []
    for (const customerData of sampleCustomers) {
      const result = await this.createCustomer(organizationId, customerData)
      if (result.success) {
        // Update with mock data for realistic testing
        await this.updateCustomerMockData(result.data!.id, organizationId, customerData.mockData)
        createdCustomers.push({
          ...result.data,
          name: customerData.name
        })
      }
    }

    return { success: true, data: createdCustomers }
  }

  /**
   * Create engagement data for customers
   */
  private static async createCustomerEngagementData(organizationId: string, customers: any[]): Promise<ServiceResult> {
    // Create sample visits for each customer
    for (const customer of customers) {
      const visitCount = Math.floor(Math.random() * 10) + 1
      for (let i = 0; i < visitCount; i++) {
        const daysAgo = Math.floor(Math.random() * 90)
        const visitDate = new Date()
        visitDate.setDate(visitDate.getDate() - daysAgo)

        await this.trackCustomerVisit(customer.id, organizationId, {
          customerId: customer.id,
          visitDate: visitDate.toISOString().split('T')[0],
          duration: 15 + Math.floor(Math.random() * 45),
          groupSize: Math.floor(Math.random() * 4) + 1,
          experience: ['excellent', 'good', 'average'][Math.floor(Math.random() * 3)] as any,
          orderValue: 8 + Math.random() * 25,
          occasion: ['casual', 'business', 'celebration', 'date'][Math.floor(Math.random() * 4)]
        })
      }
    }

    return { success: true, data: { message: 'Engagement data created successfully' } }
  }

  /**
   * Update customer statistics after visit
   */
  private static async updateCustomerStatistics(customerId: string, organizationId: string, visitData: VisitData): Promise<void> {
    try {
      // Get current customer data
      const profile = await this.getCustomerProfile(organizationId, customerId)
      if (!profile.success) return

      const currentVisits = parseInt(profile.data.fields.total_visits?.value || '0')
      const currentValue = parseFloat(profile.data.fields.lifetime_value?.value || '0')
      
      const newTotalVisits = currentVisits + 1
      const newLifetimeValue = currentValue + (visitData.orderValue || 0)
      const newAverageOrderValue = newLifetimeValue / newTotalVisits

      // Update customer statistics
      const updates = [
        { field_name: 'total_visits', field_value: newTotalVisits.toString() },
        { field_name: 'lifetime_value', field_value: newLifetimeValue.toFixed(2) },
        { field_name: 'average_order_value', field_value: newAverageOrderValue.toFixed(2) },
        { field_name: 'last_visit_date', field_value: visitData.visitDate || new Date().toISOString().split('T')[0] },
        { field_name: 'customer_status', field_value: this.getCustomerStatus(newTotalVisits) },
        { field_name: 'loyalty_tier', field_value: this.getLoyaltyTier(newLifetimeValue) }
      ]

      for (const update of updates) {
        await supabaseAdmin
          .from('core_dynamic_data')
          .update({
            field_value: update.field_value,
            updated_at: new Date().toISOString()
          })
          .eq('organization_id', organizationId)
          .eq('entity_id', customerId)
          .eq('field_name', update.field_name)
      }

    } catch (error) {
      console.error('Failed to update customer statistics:', error)
    }
  }

  /**
   * Update customer with mock data for testing
   */
  private static async updateCustomerMockData(customerId: string, organizationId: string, mockData: any): Promise<void> {
    try {
      const updates = [
        { field_name: 'total_visits', field_value: mockData.totalVisits.toString() },
        { field_name: 'lifetime_value', field_value: mockData.lifetimeValue.toString() },
        { field_name: 'average_order_value', field_value: (mockData.lifetimeValue / mockData.totalVisits).toFixed(2) },
        { field_name: 'loyalty_tier', field_value: mockData.loyaltyTier },
        { field_name: 'customer_status', field_value: 'regular' }
      ]

      for (const update of updates) {
        await supabaseAdmin
          .from('core_dynamic_data')
          .update({
            field_value: update.field_value
          })
          .eq('organization_id', organizationId)
          .eq('entity_id', customerId)
          .eq('field_name', update.field_name)
      }

      // Update preferences in metadata
      const profileResult = await this.getCustomerProfile(organizationId, customerId)
      if (profileResult.success) {
        const currentProfile = profileResult.data.aiProfile
        const updatedProfile = {
          ...currentProfile,
          taste_preferences: {
            ...currentProfile.taste_preferences,
            favorite_teas: mockData.favoriteTeas,
            caffeine_preference: mockData.caffeinePreference
          }
        }

        await supabaseAdmin
          .from('core_metadata')
          .update({
            metadata_value: JSON.stringify(updatedProfile)
          })
          .eq('organization_id', organizationId)
          .eq('entity_id', customerId)
          .eq('metadata_key', 'behavioral_profile')
      }

    } catch (error) {
      console.error('Failed to update mock data:', error)
    }
  }

  /**
   * Helper functions for customer intelligence
   */
  private static calculateLoyaltyLevel(visits: number, value: number): 'new' | 'occasional' | 'regular' | 'loyal' | 'advocate' {
    if (visits >= 20 && value >= 500) return 'advocate'
    if (visits >= 10 && value >= 200) return 'loyal'
    if (visits >= 5 && value >= 100) return 'regular'
    if (visits >= 2) return 'occasional'
    return 'new'
  }

  private static getCustomerStatus(visits: number): string {
    if (visits >= 10) return 'vip'
    if (visits >= 5) return 'regular'
    if (visits >= 2) return 'returning'
    return 'new'
  }

  private static getLoyaltyTier(lifetimeValue: number): string {
    if (lifetimeValue >= 500) return 'platinum'
    if (lifetimeValue >= 200) return 'gold'
    if (lifetimeValue >= 50) return 'silver'
    return 'bronze'
  }

  private static generateRecommendations(aiProfile: any): string[] {
    const favoriteTeas = aiProfile.taste_preferences?.favorite_teas || []
    const recommendations = ['chamomile_tea', 'earl_grey_tea', 'jasmine_green_tea', 'blueberry_muffin']
    
    // Simple recommendation logic based on preferences
    if (favoriteTeas.includes('chamomile')) {
      recommendations.unshift('herbal_tea_blend', 'lavender_tea')
    }
    if (favoriteTeas.includes('earl_grey')) {
      recommendations.unshift('english_breakfast', 'lady_grey')
    }
    
    return recommendations.slice(0, 3)
  }

  private static generatePromotions(customer: any): string[] {
    const tier = customer.fields.loyalty_tier?.value || 'bronze'
    const promotions = []
    
    if (tier === 'platinum') promotions.push('20% off premium teas')
    if (tier === 'gold') promotions.push('15% off any purchase')
    if (tier === 'silver') promotions.push('10% off pastries')
    
    promotions.push('Free pastry with tea purchase', 'Loyalty points double weekend')
    
    return promotions.slice(0, 2)
  }

  private static generateExperienceEnhancements(customer: any): string[] {
    return [
      'Reserved seating area',
      'Personalized tea recommendations',
      'Priority during busy hours',
      'Birthday celebration tea'
    ]
  }

  /**
   * Utility: Generate consistent entity codes
   */
  private static generateEntityCode(name: string, type: string): string {
    const baseCode = name.replace(/[^A-Z0-9]/gi, '').toUpperCase().slice(0, 8)
    const random = Math.random().toString(36).substring(2, 6).toUpperCase()
    const typeCode = type.slice(0, 4)
    return `${baseCode}-${random}-${typeCode}`
  }
}

export default CustomerManagementService