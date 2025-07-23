import { useState, useEffect, useCallback } from 'react'
import UniversalCrudService from '@/lib/services/universalCrudService'
import { createClient } from '@/lib/supabase/client'
import { createServiceClient } from '@/lib/supabase/service'
import { restaurantManagementService, RestaurantData, RestaurantUpdateData } from '@/lib/services/restaurantManagementService'
import { UniversalTransactionService } from '@/lib/services/universalTransactionService'

export interface RestaurantOption {
  id: string
  name: string
  location?: string
  role: string
  industry: string
  isActive: boolean
  createdAt: string
  clientId: string
}

export interface UseRestaurantManagementReturn {
  restaurantData: RestaurantData | null
  allRestaurants: RestaurantOption[]
  selectedRestaurant: RestaurantOption | null
  hasMultipleRestaurants: boolean
  loading: boolean
  error: string | null
  user: any | null
  refreshData: () => Promise<void>
  updateRestaurant: (updates: RestaurantUpdateData) => Promise<boolean>
  selectRestaurant: (restaurant: RestaurantOption) => void
  isUpdating: boolean
}

export function useRestaurantManagement(): UseRestaurantManagementReturn {
  const [restaurantData, setRestaurantData] = useState<RestaurantData | null>(null)
  const [allRestaurants, setAllRestaurants] = useState<RestaurantOption[]>([])
  const [selectedRestaurant, setSelectedRestaurant] = useState<RestaurantOption | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<any | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const supabase = createClient() // For user queries (auth, user_organizations)
  const supabaseAdmin = createServiceClient() // For RLS-protected queries (core_organizations)

  const selectRestaurantData = useCallback(async (restaurant: RestaurantOption) => {
    try {
      setSelectedRestaurant(restaurant)
      
      // Convert to RestaurantData format
      const restaurantData: RestaurantData = {
        clientId: restaurant.clientId,
        organizationId: restaurant.id,
        businessName: restaurant.name,
        businessType: 'restaurant',
        cuisineType: 'restaurant',
        establishedYear: new Date(restaurant.createdAt).getFullYear().toString(),
        primaryPhone: '',
        businessEmail: '',
        website: '',
        locationName: restaurant.location || '',
        address: restaurant.location || '',
        city: '',
        state: '',
        postalCode: '',
        country: '',
        currency: 'USD',
        openingTime: '09:00',
        closingTime: '22:00',
        seatingCapacity: '50',
        managerName: '',
        managerEmail: '',
        managerPhone: '',
        userRole: restaurant.role || 'staff',
        clientCode: '',
        orgCode: '',
        industry: restaurant.industry || 'restaurant',
        isActive: restaurant.isActive,
        createdAt: restaurant.createdAt,
        updatedAt: new Date().toISOString()
      }
      
      setRestaurantData(restaurantData)
      
      // Save user's preference
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        localStorage.setItem(`preferred-restaurant-${user.id}`, restaurant.id)
      }
      
      console.log('✅ Selected restaurant:', restaurant.name)
    } catch (err) {
      console.error('❌ Error selecting restaurant:', err)
    }
  }, [supabase])

  const loadRestaurantData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Get current authenticated user
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        setUser(null)
        setError('User not authenticated')
        UniversalTransactionService.clearCurrentUser() // Clear user context on auth error
        return
      }
      
      setUser(user)

      console.log('🔐 Loading restaurant data for authenticated user:', user.id)
      
      // Step 1: Get user's organizations (using HERA Universal Architecture - manual joins)
      const { data: coreUser, error: coreUserError } = await supabase
        .from('core_users')
        .select('id, email, full_name')
        .eq('auth_user_id', user.id)
        .single()

      if (coreUserError) {
        console.error('❌ Core user query error:', coreUserError)
        setError(`Database error: ${coreUserError.message}`)
        UniversalTransactionService.clearCurrentUser() // Clear user context on error
        return
      }

      if (!coreUser) {
        console.log('⚠️ No core_users record found for user')
        setError('User account not properly set up. Please contact support.')
        UniversalTransactionService.clearCurrentUser() // Clear user context on error
        return
      }

      console.log('✅ Core user found:', coreUser.id)
      
      // Set user context for UniversalTransactionService metadata creation
      UniversalTransactionService.setCurrentUser({
        id: coreUser.id,
        email: coreUser.email || user.email || 'unknown@example.com',
        fullName: coreUser.full_name || 'Unknown User'
      })

      // Step 2: Get user_organizations links
      console.log(`🔍 Step 2: Querying user_organizations for core user ID: ${coreUser.id}`)
      const { data: userOrgLinks, error: userOrgError } = await supabase
        .from('user_organizations')
        .select('organization_id, role, is_active, created_at')
        .eq('user_id', coreUser.id)

      console.log('🔍 Step 2 Results:')
      console.log('   Query Error:', userOrgError)
      console.log('   Data Returned:', userOrgLinks)
      console.log('   Length:', userOrgLinks?.length || 0)

      if (userOrgError) {
        console.error('❌ User organizations query error:', userOrgError)
        setError(`Database error: ${userOrgError.message}`)
        return
      }

      if (!userOrgLinks || userOrgLinks.length === 0) {
        console.log('⚠️ No organization links found for user')
        
        // Enhanced debugging: Check if there are ANY user_organizations records
        console.log('🔍 Debugging: Checking ALL user_organizations records...')
        const { data: allUserOrgs } = await supabase
          .from('user_organizations')
          .select('user_id, organization_id, role, is_active')
          .limit(10)
        
        console.log('📊 Sample user_organizations records:', allUserOrgs?.length || 0)
        allUserOrgs?.forEach((record, i) => {
          console.log(`   ${i + 1}. User: ${record.user_id}, Org: ${record.organization_id}, Active: ${record.is_active}`)
        })
        
        // Check if this specific user exists in ANY records
        const { data: userMatches } = await supabase
          .from('user_organizations')
          .select('user_id, organization_id, role, is_active')
          .eq('user_id', coreUser.id)
        
        console.log('🔍 Direct user matches:', userMatches?.length || 0)
        
        setError('No organizations found for this user')
        return
      }

      console.log(`📊 Found ${userOrgLinks.length} organization link(s)`)

      // Step 3: Get organization details (manual join) - Use service role to bypass RLS
      const organizationIds = userOrgLinks.map(link => link.organization_id)
      console.log(`🔍 Step 3: Querying core_organizations for IDs:`, organizationIds)
      
      if (!supabaseAdmin) {
        console.error('❌ Service role client not available')
        setError('Service configuration error. Please contact support.')
        return
      }
      
      console.log(`🔑 Using service role to bypass RLS policies`)
      
      const { data: organizations, error: orgsError } = await supabaseAdmin
        .from('core_organizations')
        .select('id, org_name, org_code, industry, client_id, country, currency, is_active, created_at, updated_at')
        .in('id', organizationIds)

      console.log('🔍 Step 3 Results:')
      console.log('   Query Error:', orgsError)
      console.log('   Data Returned:', organizations)
      console.log('   Length:', organizations?.length || 0)

      if (orgsError) {
        console.error('❌ Organizations query error:', orgsError)
        setError(`Database error: ${orgsError.message}`)
        return
      }

      // Enhanced debugging: Check if core_organizations table has ANY records
      if (!organizations || organizations.length === 0) {
        console.log('🔍 Debugging: Checking ALL core_organizations records with service role...')
        const { data: allOrgs } = await supabaseAdmin
          .from('core_organizations')
          .select('id, org_name, industry')
          .limit(10)
        
        console.log('📊 Sample core_organizations records:', allOrgs?.length || 0)
        allOrgs?.forEach((record, i) => {
          console.log(`   ${i + 1}. ID: ${record.id}, Name: ${record.org_name}, Industry: ${record.industry}`)
        })
        
        // Check if the specific IDs exist at all
        console.log('🔍 Checking if requested organization IDs exist with service role:')
        for (const orgId of organizationIds) {
          const { data: specificOrg } = await supabaseAdmin
            .from('core_organizations')
            .select('id, org_name, industry')
            .eq('id', orgId)
            .single()
          
          console.log(`   ${orgId}: ${specificOrg ? `Found - ${specificOrg.org_name}` : 'NOT FOUND'}`)
        }
      }

      console.log(`✅ Found ${organizations?.length || 0} organization record(s)`)

      // Step 4: Manual join - combine user_organizations with core_organizations
      const organizationMap = new Map()
      organizations?.forEach(org => organizationMap.set(org.id, org))

      const combinedLinks = userOrgLinks.map(link => ({
        ...link,
        core_organizations: organizationMap.get(link.organization_id)
      }))

      // Log all organizations for debugging
      console.log(`📊 Combined data - ${combinedLinks.length} total organization(s):`)
      combinedLinks.forEach((link: any, index: number) => {
        console.log(`   ${index + 1}. ${link.core_organizations?.org_name || 'Not Found'}`)
        console.log(`      - Industry: ${link.core_organizations?.industry || 'Not Found'}`)
        console.log(`      - Active: ${link.is_active}`)
        console.log(`      - Role: ${link.role}`)
      })

      // Filter for restaurant organizations
      const restaurantLinks = combinedLinks.filter((link: any) => 
        link.core_organizations?.industry === 'restaurant' && link.is_active
      )

      console.log(`🍽️ Filtered to ${restaurantLinks.length} restaurant organization(s)`)

      if (restaurantLinks.length === 0) {
        // Provide more specific error messages
        const hasInactiveRestaurants = combinedLinks.some((link: any) => 
          link.core_organizations?.industry === 'restaurant' && !link.is_active
        )
        
        if (hasInactiveRestaurants) {
          setError('Your restaurant account is inactive. Please contact support.')
        } else {
          setError('No restaurant found for this user. Please set up a restaurant first.')
        }
        return
      }

      // Convert to RestaurantOption format
      const restaurantOptions: RestaurantOption[] = restaurantLinks.map((link: any) => {
        const org = link.core_organizations
        return {
          id: org.id,
          name: org.org_name || 'Restaurant',
          location: `${org.country || 'Unknown Location'}`,
          role: link.role || 'staff',
          industry: org.industry,
          isActive: org.is_active && link.is_active,
          createdAt: org.created_at || new Date().toISOString(),
          clientId: org.client_id
        }
      })

      setAllRestaurants(restaurantOptions)
      console.log(`✅ Found ${restaurantOptions.length} restaurant(s) for user`)
      
      // Debug: Log all available restaurants with their creation dates
      restaurantOptions.forEach((restaurant, index) => {
        console.log(`   ${index + 1}. Restaurant: ${restaurant.name}`)
        console.log(`      - Organization ID: ${restaurant.id}`)
        console.log(`      - Created: ${restaurant.createdAt}`)
        console.log(`      - Role: ${restaurant.role}`)
      })

      // Check if user has a preferred restaurant in localStorage
      const savedRestaurantId = localStorage.getItem(`preferred-restaurant-${user.id}`)
      console.log('🔍 Checking localStorage for saved restaurant:', savedRestaurantId)
      let targetRestaurant = restaurantOptions.find(r => r.id === savedRestaurantId)

      if (targetRestaurant) {
        console.log('✅ Found saved restaurant preference:', targetRestaurant.name, targetRestaurant.id)
      } else {
        console.log('⚠️ No saved preference found or restaurant not available')
        
        // Sort by creation date (newest first) to prioritize recently assigned restaurants
        const sortedRestaurants = [...restaurantOptions].sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        targetRestaurant = sortedRestaurants[0]
        console.log('🔄 Selecting most recent restaurant:', targetRestaurant?.name, targetRestaurant?.id)
      }

      // If there's only one restaurant, auto-select it
      if (restaurantOptions.length === 1) {
        targetRestaurant = restaurantOptions[0]
        console.log('🏢 Only one restaurant available, auto-selecting:', targetRestaurant?.name, targetRestaurant?.id)
      }

      if (targetRestaurant) {
        console.log('🎯 Final selected restaurant:', targetRestaurant.name, 'ID:', targetRestaurant.id)
        await selectRestaurantData(targetRestaurant)
      } else {
        console.log('❌ No restaurant available to select')
      }

    } catch (err) {
      console.error('❌ Error loading restaurant data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load restaurant data')
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [supabase, selectRestaurantData])

  const selectRestaurant = useCallback((restaurant: RestaurantOption) => {
    selectRestaurantData(restaurant)
  }, [selectRestaurantData])

  const updateRestaurant = useCallback(async (updates: RestaurantUpdateData): Promise<boolean> => {
    if (!restaurantData) {
      setError('No restaurant data available to update')
      return false
    }

    try {
      setIsUpdating(true)
      setError(null)
      
      const success = await restaurantManagementService.updateRestaurant(restaurantData, updates)
      
      if (success) {
        // Reload data to get updated values
        await loadRestaurantData()
        console.log('✅ Restaurant updated successfully via hook')
        return true
      } else {
        setError('Failed to update restaurant')
        return false
      }
    } catch (err) {
      console.error('❌ Error updating restaurant:', err)
      setError(err instanceof Error ? err.message : 'Failed to update restaurant')
      return false
    } finally {
      setIsUpdating(false)
    }
  }, [restaurantData, loadRestaurantData])

  const refreshData = useCallback(async () => {
    await loadRestaurantData()
  }, [loadRestaurantData])

  // Load data on mount
  useEffect(() => {
    loadRestaurantData()
  }, [loadRestaurantData])

  // Set up real-time subscriptions when restaurant data is available
  useEffect(() => {
    if (!restaurantData) return

    console.log('🔄 Setting up real-time subscriptions for restaurant:', restaurantData.clientId)
    
    const subscription = restaurantManagementService.subscribeToRestaurantUpdates(
      restaurantData.clientId,
      (payload) => {
        console.log('📡 Real-time update received:', payload)
        // Refresh data when changes are detected
        loadRestaurantData()
      }
    )

    return () => {
      console.log('🔄 Cleaning up real-time subscriptions')
      subscription.unsubscribe()
      UniversalTransactionService.clearCurrentUser() // Clear user context on cleanup
    }
  }, [restaurantData, loadRestaurantData])

  return {
    restaurantData,
    allRestaurants,
    selectedRestaurant,
    hasMultipleRestaurants: allRestaurants.length > 1,
    loading,
    error,
    user,
    refreshData,
    updateRestaurant,
    selectRestaurant,
    isUpdating
  }
}

export default useRestaurantManagement