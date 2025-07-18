import UniversalCrudService from '@/lib/services/universalCrudService'
import { createClient } from '@/lib/supabase/client'
import { createServiceClient } from '@/lib/supabase/service'

// Types for restaurant data
export interface RestaurantData {
  // Client Information
  clientId: string
  businessName: string
  businessType: string
  cuisineType: string
  establishedYear: string
  primaryPhone: string
  businessEmail: string
  website?: string
  
  // Organization Information
  organizationId: string
  locationName: string
  address: string
  city: string
  state: string
  postalCode: string
  country: string
  currency: string
  
  // Operations
  openingTime: string
  closingTime: string
  seatingCapacity: string
  
  // Manager Information
  managerName: string
  managerEmail: string
  managerPhone: string
  
  // User Role
  userRole: string
  
  // Metadata
  clientCode: string
  orgCode: string
  industry: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface RestaurantUpdateData {
  businessName?: string
  cuisineType?: string
  businessEmail?: string
  primaryPhone?: string
  website?: string
  locationName?: string
  address?: string
  city?: string
  state?: string
  postalCode?: string
  openingTime?: string
  closingTime?: string
  seatingCapacity?: string
  managerName?: string
  managerEmail?: string
  managerPhone?: string
}

class RestaurantManagementService {
  private static instance: RestaurantManagementService
  private supabase: any = null
  private serviceSupabase: any = null

  // Singleton pattern to prevent multiple instances
  static getInstance(): RestaurantManagementService {
    if (!RestaurantManagementService.instance) {
      RestaurantManagementService.instance = new RestaurantManagementService()
    }
    return RestaurantManagementService.instance
  }

  private getClient() {
    if (!this.supabase) {
      this.supabase = createClient()
    }
    return this.supabase
  }

  private getServiceClient() {
    if (!this.serviceSupabase) {
      try {
        this.serviceSupabase = createServiceClient()
        console.log('✅ Service client initialized for restaurant management')
      } catch (error) {
        console.warn('⚠️ Service client not available, using regular client for updates:', error)
        this.serviceSupabase = this.getClient()
      }
    }
    return this.serviceSupabase
  }

  /**
   * Get restaurant data by user ID (finds their associated restaurant)
   */
  async getRestaurantByUserId(userId: string): Promise<RestaurantData | null> {
    try {
      console.log('🔍 Fetching restaurant data for user:', userId)

      // Use the proper function to get user's restaurant profile
      const { data: profileData, error: profileError } = await this.getClient()
        .rpc('get_user_restaurant_profile', { p_auth_user_id: userId })

      if (profileError) {
        console.error('❌ Error fetching user restaurant profile:', profileError)
        return null
      }

      if (!profileData || profileData.length === 0) {
        console.log('❌ No restaurant found for user')
        return null
      }

      const profile = profileData[0]
      console.log('✅ Found restaurant profile:', profile.restaurant_name)

      // If no restaurant entity exists, user hasn't completed setup
      if (!profile.restaurant_entity_id) {
        console.log('❌ User has organization but no restaurant entity - setup incomplete')
        return null
      }

      // Get additional dynamic data from the restaurant entity
      const { data: dynamicData, error: dynamicError } = await this.getClient()
        .from('core_dynamic_data')
        .select('*')
        .eq('entity_id', profile.restaurant_entity_id)

      if (dynamicError) {
        console.error('❌ Error fetching dynamic data:', dynamicError)
        // Continue without dynamic data
      }

      // Build dynamic data map
      const dataMap: { [key: string]: string } = {}
      dynamicData?.forEach(record => {
        dataMap[record.field_name] = record.field_value
      })

      // Parse opening hours if available
      const openingHours = dataMap['opening_hours'] || '08:00-22:00'
      const [openingTime, closingTime] = openingHours.split('-')

      const restaurantData: RestaurantData = {
        // Client Information
        clientId: profile.client_id,
        businessName: profile.restaurant_name || profile.client_name || '',
        businessType: profile.business_type || 'restaurant',
        cuisineType: profile.cuisine_type || '',
        establishedYear: dataMap['established_year'] || new Date().getFullYear().toString(),
        primaryPhone: dataMap['primary_contact'] || dataMap['owner_phone'] || '',
        businessEmail: dataMap['business_email'] || dataMap['owner_email'] || profile.user_email || '',
        website: dataMap['website'] || '',
        
        // Organization Information
        organizationId: profile.organization_id,
        locationName: profile.location || dataMap['location_name'] || '',
        address: dataMap['full_address'] || dataMap['address'] || '',
        city: dataMap['city'] || '',
        state: dataMap['state'] || '',
        postalCode: dataMap['postal_code'] || '',
        country: dataMap['country'] || 'US',
        currency: dataMap['currency'] || 'USD',
        
        // Operations
        openingTime: openingTime?.trim() || '08:00',
        closingTime: closingTime?.trim() || '22:00',
        seatingCapacity: profile.seating_capacity || '',
        
        // Manager Information (defaulting to owner)
        managerName: dataMap['manager_name'] || dataMap['owner_name'] || profile.user_name || '',
        managerEmail: dataMap['manager_email'] || dataMap['owner_email'] || profile.user_email || '',
        managerPhone: dataMap['manager_phone'] || dataMap['owner_phone'] || '',
        
        // Metadata
        clientCode: dataMap['client_code'] || '',
        orgCode: dataMap['org_code'] || '',
        industry: 'Food & Beverage',
        isActive: true, // Active if we found the profile
        createdAt: dataMap['registration_date'] || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      console.log('✅ Restaurant data compiled successfully from user profile')
      return restaurantData

    } catch (error) {
      console.error('❌ Error in getRestaurantByUserId:', error)
      return null
    }
  }

  /**
   * Update restaurant data
   */
  async updateRestaurant(restaurantData: RestaurantData, updates: RestaurantUpdateData): Promise<boolean> {
    try {
      console.log('📝 Updating restaurant data:', updates)

      // Update client record if needed
      const clientUpdates: any = {}
      if (updates.businessName) clientUpdates.client_name = updates.businessName
      
      if (Object.keys(clientUpdates).length > 0) {
        const { error: clientError } = await this.getServiceClient()
          .from('core_clients')
          .update(clientUpdates)
          .eq('id', restaurantData.clientId)

        if (clientError) {
          console.error('❌ Error updating client:', clientError)
          return false
        }
        console.log('✅ Client updated successfully')
      }

      // Update organization record if needed
      const orgUpdates: any = {}
      if (updates.locationName) {
        orgUpdates.name = `${updates.businessName || restaurantData.businessName} - ${updates.locationName}`
      }
      
      if (Object.keys(orgUpdates).length > 0) {
        const { error: orgError } = await this.getServiceClient()
          .from('core_organizations')
          .update(orgUpdates)
          .eq('id', restaurantData.organizationId)

        if (orgError) {
          console.error('❌ Error updating organization:', orgError)
          return false
        }
        console.log('✅ Organization updated successfully')
      }

      // Update dynamic data
      const dynamicUpdates = [
        // Client data updates
        ...(updates.businessName ? [{ entity_id: restaurantData.clientId, field_name: 'business_name', field_value: updates.businessName }] : []),
        ...(updates.cuisineType ? [{ entity_id: restaurantData.clientId, field_name: 'cuisine_specialization', field_value: updates.cuisineType }] : []),
        ...(updates.businessEmail ? [{ entity_id: restaurantData.clientId, field_name: 'business_email', field_value: updates.businessEmail }] : []),
        ...(updates.primaryPhone ? [{ entity_id: restaurantData.clientId, field_name: 'primary_contact', field_value: updates.primaryPhone }] : []),
        ...(updates.website ? [{ entity_id: restaurantData.clientId, field_name: 'website', field_value: updates.website }] : []),
        
        // Organization data updates
        ...(updates.locationName ? [{ entity_id: restaurantData.organizationId, field_name: 'location_name', field_value: updates.locationName }] : []),
        ...(updates.address ? [{ entity_id: restaurantData.organizationId, field_name: 'full_address', field_value: updates.address }] : []),
        ...(updates.city ? [{ entity_id: restaurantData.organizationId, field_name: 'city', field_value: updates.city }] : []),
        ...(updates.state ? [{ entity_id: restaurantData.organizationId, field_name: 'state', field_value: updates.state }] : []),
        ...(updates.postalCode ? [{ entity_id: restaurantData.organizationId, field_name: 'postal_code', field_value: updates.postalCode }] : []),
        ...(updates.seatingCapacity ? [{ entity_id: restaurantData.organizationId, field_name: 'seating_capacity', field_value: updates.seatingCapacity }] : []),
        ...(updates.managerName ? [{ entity_id: restaurantData.organizationId, field_name: 'manager_name', field_value: updates.managerName }] : []),
        ...(updates.managerEmail ? [{ entity_id: restaurantData.organizationId, field_name: 'manager_email', field_value: updates.managerEmail }] : []),
        ...(updates.managerPhone ? [{ entity_id: restaurantData.organizationId, field_name: 'manager_phone', field_value: updates.managerPhone }] : []),
        
        // Combined opening hours update
        ...((updates.openingTime || updates.closingTime) ? [{
          entity_id: restaurantData.organizationId,
          field_name: 'opening_hours',
          field_value: `${updates.openingTime || restaurantData.openingTime}-${updates.closingTime || restaurantData.closingTime}`
        }] : [])
      ]

      // Process each dynamic data update
      for (const update of dynamicUpdates) {
        const { error: dynamicError } = await this.getServiceClient()
          .from('core_dynamic_data')
          .update({ field_value: update.field_value })
          .eq('entity_id', update.entity_id)
          .eq('field_name', update.field_name)

        if (dynamicError) {
          console.error(`❌ Error updating ${update.field_name}:`, dynamicError)
          return false
        }
      }

      console.log(`✅ Updated ${dynamicUpdates.length} dynamic data fields`)
      console.log('🎉 Restaurant data updated successfully!')
      return true

    } catch (error) {
      console.error('❌ Error in updateRestaurant:', error)
      return false
    }
  }

  /**
   * Get restaurant statistics and analytics
   */
  async getRestaurantAnalytics(restaurantId: string): Promise<any> {
    try {
      // This would integrate with your transaction system
      // For now, return mock data
      return {
        totalOrders: 0,
        totalRevenue: 0,
        averageOrderValue: 0,
        topDishes: [],
        recentActivity: []
      }
    } catch (error) {
      console.error('❌ Error fetching analytics:', error)
      return null
    }
  }

  /**
   * Subscribe to real-time updates for restaurant data
   */
  subscribeToRestaurantUpdates(restaurantId: string, callback: (payload: any) => void) {
    return this.getClient()
      .channel('restaurant-updates')
      .on('postgres_changes', 
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'core_clients',
          filter: `id=eq.${restaurantId}`
        }, 
        callback
      )
      .on('postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public', 
          table: 'core_organizations',
          filter: `client_id=eq.${restaurantId}`
        },
        callback
      )
      .subscribe()
  }
}

export const restaurantManagementService = RestaurantManagementService.getInstance()
export default restaurantManagementService