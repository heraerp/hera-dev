/**
 * Universal Restaurant Setup Service
 * Implements HERA Universal Architecture for complete restaurant setup
 * Follows organization_id isolation and core_entities + core_metadata pattern
 */

import { createClient } from '@supabase/supabase-js';

// Check if we're on the server side
const isServer = typeof window === 'undefined'

// Service role client for RLS bypass
const createServiceClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY
  
  if (!url || !serviceKey) {
    console.error('⚠️ Supabase credentials missing:', { url: !!url, serviceKey: !!serviceKey })
    throw new Error('Supabase service credentials not configured')
  }
  
  return createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    },
    global: {
      headers: {
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`
      }
    }
  })
}

// Regular client for read operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export interface RestaurantSetupData {
  // Client-level information (Parent Company)
  clientName: string
  clientType: string
  
  // Restaurant-level information (Specific Location)
  businessName: string
  businessType: string
  cuisineType: string
  establishedYear: string
  locationName: string
  address: string
  city: string
  state: string
  postalCode: string
  country: string
  currency: string
  primaryPhone: string
  businessEmail: string
  website: string
  openingTime: string
  closingTime: string
  seatingCapacity: string
  managerName: string
  managerEmail: string
  managerPhone: string
}

export interface SetupResult {
  success: boolean
  data?: {
    clientId: string
    organizationId: string
    coreUserId: string
    userOrganizationId: string
  }
  error?: string
  details?: any
}

class UniversalRestaurantSetupService {
  /**
   * Complete restaurant setup following Universal Architecture
   * Sequential entity creation: Client → Organization → User → User-Organization link
   */
  static async setupRestaurant(
    setupData: RestaurantSetupData,
    authUserId: string,
    existingClientId?: string
  ): Promise<SetupResult> {
    console.log('🚀 Starting Universal Restaurant Setup Service')
    console.log('📝 Setup data validation:', {
      clientName: setupData.clientName || 'MISSING',
      businessName: setupData.businessName || 'MISSING',
      managerName: setupData.managerName || 'MISSING',
      managerEmail: setupData.managerEmail || 'MISSING'
    })
    console.log('👤 Auth user ID:', authUserId)

    // Validate critical fields
    if (!setupData.clientName || setupData.clientName.trim() === '') {
      return {
        success: false,
        error: 'Client name is required but missing or empty'
      }
    }
    
    if (!setupData.businessName || setupData.businessName.trim() === '') {
      return {
        success: false,
        error: 'Business name is required but missing or empty'
      }
    }

    // Create service client when needed
    const supabaseAdmin = createServiceClient()

    try {
      let clientId: string
      
      if (existingClientId) {
        // Use existing client
        console.log('📋 Step 1: Using existing client:', existingClientId)
        clientId = existingClientId
        console.log('✅ Step 1 Complete - Using existing client:', clientId)
      } else {
        // Create new client (fallback for direct access)
        console.log('📋 Step 1: Creating client entity...')
        console.log('📝 Client data being passed:', {
          clientName: setupData.clientName,
          clientType: setupData.clientType || 'restaurant_group'
        })
        
        const clientResult = await this.createClientEntity(setupData, false, supabaseAdmin)
        if (!clientResult.success) {
          console.error('🚨 Client creation failed with result:', clientResult)
          throw new Error(`Client creation failed: ${clientResult.error}`)
        }
        clientId = clientResult.data!.id
        console.log('✅ Step 1 Complete - Client created:', clientId)
      }

      // Step 2: Create Organization (Child of Client)
      console.log('📋 Step 2: Creating organization entity...')
      const organizationResult = await this.createOrganizationEntity(setupData, clientId, supabaseAdmin)
      if (!organizationResult.success) {
        throw new Error(`Organization creation failed: ${organizationResult.error}`)
      }
      const organizationId = organizationResult.data!.id
      console.log('✅ Step 2 Complete - Organization created:', organizationId)

      // Step 3: Create Core User
      console.log('📋 Step 3: Creating core user...')
      const coreUserResult = await this.createCoreUser(setupData, authUserId, supabaseAdmin)
      if (!coreUserResult.success) {
        throw new Error(`Core user creation failed: ${coreUserResult.error}`)
      }
      const coreUserId = coreUserResult.data!.id
      console.log('✅ Step 3 Complete - Core user created:', coreUserId)

      // Step 4: Create User-Organization Link
      console.log('📋 Step 4: Creating user-organization link...')
      const linkResult = await this.createUserOrganizationLink(coreUserId, organizationId, supabaseAdmin)
      if (!linkResult.success) {
        throw new Error(`User-organization link failed: ${linkResult.error}`)
      }
      const userOrganizationId = linkResult.data!.id
      console.log('✅ Step 4 Complete - User-organization link created:', userOrganizationId)

      // Step 5: Create Client Metadata with Organization Context
      console.log('📋 Step 5: Creating client metadata with organization context...')
      const metadataResult = await this.createClientMetadata(clientId, organizationId, setupData, coreUserId, supabaseAdmin)
      if (!metadataResult.success) {
        console.error('⚠️ Client metadata creation failed (non-critical):', metadataResult.error)
        // Don't fail the entire setup for metadata
      } else {
        console.log('✅ Step 5 Complete - Client metadata created')
      }

      // Step 6: Initialize Restaurant Data
      console.log('📋 Step 6: Initializing restaurant data...')
      await this.initializeRestaurantData(organizationId, setupData, supabaseAdmin)
      console.log('✅ Step 6 Complete - Restaurant data initialized')

      // Setup complete!
      return {
        success: true,
        data: {
          clientId,
          organizationId,
          coreUserId,
          userOrganizationId
        }
      }

    } catch (error) {
      console.error('🚨 Restaurant setup failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown setup error',
        details: error
      }
    }
  }

  /**
   * Step 1: Create Client Entity
   * Creates the parent client entity that represents the business owner
   */
  private static async createClientEntity(setupData: RestaurantSetupData, includeMetadata: boolean = false, supabaseAdmin: any) {
    try {
      // Test service role capabilities first
      const serviceTest = await this.testServiceRole(supabaseAdmin)
      if (!serviceTest.success) {
        throw new Error(`Service role verification failed: ${serviceTest.message}`)
      }
      console.log('✅ Service role verification passed')

      const clientId = crypto.randomUUID()
      const clientCode = this.generateEntityCode(setupData.clientName, 'CLIENT')
      
      console.log('🔧 Creating client with data:', {
        id: clientId,
        client_name: setupData.clientName,
        client_code: clientCode,
        client_type: setupData.clientType || 'restaurant_group'
      })

      // Create client in core_clients table
      console.log('📝 Step 1: Inserting into core_clients...')
      const { data: clientData, error: clientError } = await supabaseAdmin
        .from('core_clients')
        .insert({
          id: clientId,
          client_name: setupData.clientName,          // ✅ Use clientName
          client_code: clientCode,
          client_type: setupData.clientType || 'restaurant_group',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()

      if (clientError) {
        console.error('❌ core_clients insert failed:', clientError)
        throw new Error(`Failed to create client record: ${clientError.message}`)
      }
      console.log('✅ core_clients insert successful:', clientData)

      // Create client entity in core_entities for universal schema
      console.log('📝 Step 2: Inserting into core_entities...')
      const { data: entityData, error: entityError } = await supabaseAdmin
        .from('core_entities')
        .insert({
          id: clientId,
          organization_id: null, // Client has no parent organization
          entity_type: 'client',
          entity_name: setupData.clientName,          // ✅ Use clientName
          entity_code: clientCode,
          is_active: true
        })
        .select()

      if (entityError) {
        console.error('❌ core_entities insert failed:', entityError)
        throw new Error(`Failed to create client entity: ${entityError.message}`)
      }
      console.log('✅ core_entities insert successful:', entityData)

      return { success: true, data: { id: clientId } }

    } catch (error) {
      console.error('❌ Client creation error:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Client creation failed',
        details: error
      }
    }
  }

  /**
   * Step 2: Create Organization Entity
   * Creates the organization that represents the restaurant location
   */
  private static async createOrganizationEntity(setupData: RestaurantSetupData, clientId: string, supabaseAdmin: any) {
    try {
      const organizationId = crypto.randomUUID()
      const orgCode = this.generateEntityCode(
        `${setupData.businessName}-${setupData.locationName}`,
        'ORG'
      )

      // Create organization in core_organizations table
      const { error: orgError } = await supabaseAdmin
        .from('core_organizations')
        .insert({
          id: organizationId,
          client_id: clientId,
          org_name: `${setupData.businessName} - ${setupData.locationName}`,
          org_code: orgCode,
          industry: 'restaurant',
          country: setupData.country || 'US',
          currency: setupData.currency || 'USD',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })

      if (orgError) throw orgError

      // Create organization entity in core_entities
      const { error: entityError } = await supabaseAdmin
        .from('core_entities')
        .insert({
          id: organizationId,
          organization_id: organizationId, // Self-reference for organizations
          entity_type: 'organization',
          entity_name: `${setupData.businessName} - ${setupData.locationName}`,
          entity_code: orgCode,
          is_active: true
        })

      if (entityError) throw entityError

      // Create organization metadata
      const organizationMetadata = [
        {
          organization_id: organizationId,
          entity_type: 'organization',
          entity_id: organizationId,
          metadata_type: 'location_details',
          metadata_category: 'address',
          metadata_key: 'physical_address',
          metadata_value: {
            address: setupData.address,
            city: setupData.city,
            state: setupData.state,
            postal_code: setupData.postalCode,
            country: setupData.country || 'US'
          },
          is_system_generated: false
        },
        {
          organization_id: organizationId,
          entity_type: 'organization',
          entity_id: organizationId,
          metadata_type: 'operational_details',
          metadata_category: 'hours',
          metadata_key: 'business_hours',
          metadata_value: {
            opening_time: setupData.openingTime,
            closing_time: setupData.closingTime,
            seating_capacity: parseInt(setupData.seatingCapacity),
            days_of_operation: 'Monday - Sunday'
          },
          is_system_generated: false
        }
      ]

      for (const metadata of organizationMetadata) {
        const { error: metadataError } = await supabaseAdmin
          .from('core_metadata')
          .insert(metadata)

        if (metadataError) {
          console.error('⚠️ Organization metadata creation failed (non-critical):', metadataError)
          // Don't fail the setup for metadata issues
        }
      }

      return { success: true, data: { id: organizationId } }

    } catch (error) {
      console.error('❌ Organization creation error:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Organization creation failed',
        details: error
      }
    }
  }

  /**
   * Step 3: Create Core User
   * Creates the user profile linked to auth user
   */
  private static async createCoreUser(setupData: RestaurantSetupData, authUserId: string, supabaseAdmin: any) {
    try {
      const coreUserId = crypto.randomUUID()
      const userCode = this.generateEntityCode(setupData.managerName, 'USER')

      // Check if user already exists
      const { data: existingUser } = await supabase
        .from('core_users')
        .select('id')
        .eq('auth_user_id', authUserId)
        .single()

      if (existingUser) {
        console.log('✅ User already exists, using existing:', existingUser.id)
        return { success: true, data: { id: existingUser.id } }
      }

      // Create new core user
      const { error: userError } = await supabaseAdmin
        .from('core_users')
        .insert({
          id: coreUserId,
          email: setupData.managerEmail,
          full_name: setupData.managerName,
          auth_user_id: authUserId,
          user_role: 'restaurant_owner',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })

      if (userError) throw userError

      // Create user entity in core_entities
      const { error: entityError } = await supabaseAdmin
        .from('core_entities')
        .insert({
          id: coreUserId,
          organization_id: null, // Users are global, not org-specific
          entity_type: 'user',
          entity_name: setupData.managerName,
          entity_code: userCode,
          is_active: true
        })

      if (entityError) {
        console.error('⚠️ User entity creation failed (non-critical):', entityError)
        // Don't fail for entity creation
      }

      // Create user metadata
      const userMetadata = {
        organization_id: null, // User metadata is global
        entity_type: 'user',
        entity_id: coreUserId,
        metadata_type: 'contact_info',
        metadata_category: 'phone',
        metadata_key: 'primary_phone',
        metadata_value: {
          phone: setupData.managerPhone,
          user_code: userCode
        },
        is_system_generated: false
      }

      const { error: metadataError } = await supabaseAdmin
        .from('core_metadata')
        .insert(userMetadata)

      if (metadataError) {
        console.error('⚠️ User metadata creation failed (non-critical):', metadataError)
        // Don't fail the setup for metadata issues
      }

      return { success: true, data: { id: coreUserId } }

    } catch (error) {
      console.error('❌ Core user creation error:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Core user creation failed',
        details: error
      }
    }
  }

  /**
   * Step 4: Create User-Organization Link
   * Establishes user's role in the organization
   */
  private static async createUserOrganizationLink(coreUserId: string, organizationId: string, supabaseAdmin: any) {
    try {
      const linkId = crypto.randomUUID()

      // Create user-organization relationship
      const { error: linkError } = await supabaseAdmin
        .from('user_organizations')
        .insert({
          id: linkId,
          user_id: coreUserId,
          organization_id: organizationId,
          role: 'owner',
          is_active: true,
          created_at: new Date().toISOString()
          // Note: updated_at not available in schema
        })

      if (linkError) throw linkError

      return { success: true, data: { id: linkId } }

    } catch (error) {
      console.error('❌ User-organization link error:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'User-organization link failed',
        details: error
      }
    }
  }

  /**
   * Step 5: Create Client Metadata with Organization Context
   * Creates client metadata with proper organization_id for multi-tenancy
   */
  private static async createClientMetadata(
    clientId: string, 
    organizationId: string, 
    setupData: RestaurantSetupData, 
    coreUserId: string,
    supabaseAdmin: any
  ) {
    try {
      console.log('🔄 Creating client metadata with organization context...')
      const clientCode = this.generateEntityCode(setupData.businessName, 'CLIENT')
      
      const clientMetadata = {
        organization_id: organizationId, // Use organization_id for multi-tenancy
        entity_type: 'client',
        entity_id: clientId,
        metadata_type: 'business_info',
        metadata_category: 'contact',
        metadata_key: 'business_details',
        metadata_value: {
          business_type: setupData.businessType,
          cuisine_type: setupData.cuisineType,
          established_year: setupData.establishedYear,
          primary_phone: setupData.primaryPhone,
          business_email: setupData.businessEmail,
          website: setupData.website || null,
          registration_number: `REG-${clientCode}`,
          tax_number: `TAX-${clientCode}`
        },
        is_system_generated: false,
        created_by: coreUserId
      }
      
      console.log('📝 Client metadata with organization:', clientMetadata)
      
      const { error: metadataError, data: metadataData } = await supabaseAdmin
        .from('core_metadata')
        .insert(clientMetadata)
        .select()
      
      if (metadataError) {
        console.error('❌ Client metadata creation error:', metadataError)
        throw new Error(`Client metadata failed: ${metadataError.message}`)
      }
      
      console.log('✅ Client metadata created successfully:', metadataData)
      return { success: true }
      
    } catch (error) {
      console.error('❌ Client metadata creation failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Client metadata creation failed'
      }
    }
  }

  /**
   * Step 6: Initialize Restaurant Data
   * Create initial menu categories and sample products
   */
  private static async initializeRestaurantData(organizationId: string, setupData: RestaurantSetupData, supabaseAdmin: any) {
    try {
      // Create menu categories as entities
      const categories = [
        { name: 'Hot Beverages', description: 'Fresh brewed teas and coffees', sort_order: 1 },
        { name: 'Cold Beverages', description: 'Refreshing cold drinks', sort_order: 2 },
        { name: 'Pastries & Desserts', description: 'Sweet treats and baked goods', sort_order: 3 },
        { name: 'Light Meals', description: 'Sandwiches and light bites', sort_order: 4 }
      ]

      for (const category of categories) {
        const categoryId = crypto.randomUUID()
        const categoryCode = this.generateEntityCode(category.name, 'CAT')

        // Create category entity
        await supabaseAdmin
          .from('core_entities')
          .insert({
            id: categoryId,
            organization_id: organizationId,
            entity_type: 'menu_category',
            entity_name: category.name,
            entity_code: categoryCode,
            is_active: true
          })

        // Create category metadata
        await supabaseAdmin
          .from('core_metadata')
          .insert({
            organization_id: organizationId,
            entity_type: 'menu_category',
            entity_id: categoryId,
            metadata_type: 'category_details',
            metadata_category: 'menu',
            metadata_key: 'category_info',
            metadata_value: {
              description: category.description,
              sort_order: category.sort_order
            },
            is_system_generated: false
          })
      }

      return { success: true }

    } catch (error) {
      console.error('⚠️ Restaurant data initialization failed (non-critical):', error)
      // Don't fail the setup for initial data
      return { success: true }
    }
  }

  /**
   * Test service role capabilities
   */
  static async testServiceRole(supabaseAdmin?: any): Promise<{ success: boolean; message: string; error?: any }> {
    try {
      // Use provided client or create new one
      const client = supabaseAdmin || createServiceClient()
      
      // Start with the simplest test - core_clients table (no foreign key dependencies)
      const clientTestId = crypto.randomUUID()
      const { error: clientError } = await client
        .from('core_clients')
        .insert({
          id: clientTestId,
          client_name: 'Service Role Test Client',
          client_code: 'TEST-SERVICE-001',
          client_type: 'test',
          is_active: true
        })

      if (!clientError) {
        // Clean up the test record
        await client.from('core_clients').delete().eq('id', clientTestId)
        return { success: true, message: 'Service role working correctly' }
      }

      // If core_clients fails, log the error and return failure
      console.error('❌ Service role test failed on core_clients:', clientError)
      return { 
        success: false, 
        message: `Service role test failed: ${clientError.message || 'Unknown error'}`,
        error: clientError 
      }
      
    } catch (error) {
      console.error('❌ Service role test error:', error)
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Service role test failed',
        error 
      }
    }
  }

  /**
   * Generate entity code with pattern
   */
  private static generateEntityCode(name: string, type: string): string {
    const baseCode = name.replace(/[^A-Z0-9]/gi, '').toUpperCase().slice(0, 8)
    const random = Math.random().toString(36).substring(2, 6).toUpperCase()
    return `${baseCode}-${random}-${type}`
  }
}

export default UniversalRestaurantSetupService