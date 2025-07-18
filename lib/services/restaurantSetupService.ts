import UniversalCrudService from '@/lib/services/universalCrudService'
import { v4 as uuidv4 } from 'uuid'

// Types for setup data
export interface RestaurantSetupData {
  // Client Information
  businessName: string
  businessType: string
  cuisineType: string
  establishedYear: string
  
  // Organization Information
  locationName: string
  address: string
  city: string
  state: string
  postalCode: string
  country: string
  currency: string
  
  // Contact Information
  primaryPhone: string
  businessEmail: string
  website?: string
  
  // Operations
  openingTime: string
  closingTime: string
  seatingCapacity: string
  
  // Manager Information
  managerName: string
  managerEmail: string
  managerPhone: string
}

export interface SetupProgress {
  step: string
  status: 'pending' | 'processing' | 'completed' | 'error'
  message: string
  error?: string
}

export class RestaurantSetupService {
  private supabase = createClient()
  
  // Generate consistent IDs
  private generateIds(businessName: string) {
    const timestamp = Date.now()
    const baseCode = businessName.replace(/[^A-Z0-9]/gi, '').toUpperCase().slice(0, 8)
    
    return {
      clientId: `client-${baseCode.toLowerCase()}-${timestamp}`,
      clientCode: `${baseCode}-GROUP`,
      orgId: `org-${baseCode.toLowerCase()}-${timestamp}`,
      orgCode: `${baseCode}-001`,
      userId: `user-${timestamp}`,
      authUserId: `auth-${timestamp}`
    }
  }
  
  // Main setup method
  async setupRestaurant(
    data: RestaurantSetupData,
    onProgress?: (progress: SetupProgress) => void
  ): Promise<{ success: boolean; error?: string; clientId?: string; orgId?: string }> {
    const ids = this.generateIds(data.businessName)
    
    try {
      // Step 1: Create Client
      onProgress?.({ step: 'Creating business entity', status: 'processing', message: 'Setting up your restaurant group...' })
      await this.createClient(ids, data)
      onProgress?.({ step: 'Creating business entity', status: 'completed', message: 'Business entity created successfully' })
      
      // Step 2: Create Organization
      onProgress?.({ step: 'Creating restaurant location', status: 'processing', message: 'Setting up your restaurant location...' })
      await this.createOrganization(ids, data)
      onProgress?.({ step: 'Creating restaurant location', status: 'completed', message: 'Restaurant location created successfully' })
      
      // Step 3: Create Manager User
      onProgress?.({ step: 'Creating manager account', status: 'processing', message: 'Setting up manager account...' })
      await this.createManagerUser(ids, data)
      onProgress?.({ step: 'Creating manager account', status: 'completed', message: 'Manager account created successfully' })
      
      // Step 4: Create Basic Restaurant Entities
      onProgress?.({ step: 'Setting up restaurant data', status: 'processing', message: 'Creating initial restaurant setup...' })
      await this.createBasicEntities(ids.orgId)
      onProgress?.({ step: 'Setting up restaurant data', status: 'completed', message: 'Restaurant setup completed!' })
      
      return { success: true, clientId: ids.clientId, orgId: ids.orgId }
    } catch (error) {
      console.error('Setup error:', error)
      onProgress?.({ 
        step: 'Setup failed', 
        status: 'error', 
        message: 'Failed to complete setup', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      })
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }
  
  // Step 1: Create Client
  private async createClient(ids: any, data: RestaurantSetupData) {
    // Create in core_clients table
    const { error: clientError } = await this.supabase
      .from('core_clients')
      .insert({
        id: ids.clientId,
        client_name: data.businessName,
        client_code: ids.clientCode,
        client_type: data.businessType,
        is_active: true
      })
    
    if (clientError) throw clientError
    
    // Create client as entity in core_entities
    const { error: entityError } = await this.supabase
      .from('core_entities')
      .insert({
        id: ids.clientId,
        organization_id: null,
        entity_type: 'client',
        entity_name: data.businessName,
        entity_code: ids.clientCode,
        is_active: true
      })
    
    if (entityError) throw entityError
    
    // Insert client business information into core_dynamic_data
    const clientData = [
      { entity_id: ids.clientId, field_name: 'business_name', field_value: data.businessName, field_type: 'text' },
      { entity_id: ids.clientId, field_name: 'business_type', field_value: data.businessType, field_type: 'text' },
      { entity_id: ids.clientId, field_name: 'cuisine_specialization', field_value: data.cuisineType, field_type: 'text' },
      { entity_id: ids.clientId, field_name: 'established_year', field_value: data.establishedYear, field_type: 'number' },
      { entity_id: ids.clientId, field_name: 'primary_contact', field_value: data.primaryPhone, field_type: 'text' },
      { entity_id: ids.clientId, field_name: 'business_email', field_value: data.businessEmail, field_type: 'text' }
    ]
    
    if (data.website) {
      clientData.push({ entity_id: ids.clientId, field_name: 'website', field_value: data.website, field_type: 'text' })
    }
    
    const { error: dataError } = await this.supabase
      .from('core_dynamic_data')
      .insert(clientData)
    
    if (dataError) throw dataError
  }
  
  // Step 2: Create Organization
  private async createOrganization(ids: any, data: RestaurantSetupData) {
    // Create in core_organizations table
    const { error: orgError } = await this.supabase
      .from('core_organizations')
      .insert({
        id: ids.orgId,
        client_id: ids.clientId,
        name: `${data.businessName} - ${data.locationName}`,
        org_code: ids.orgCode,
        industry: 'Food & Beverage',
        country: data.country,
        currency: data.currency,
        is_active: true
      })
    
    if (orgError) throw orgError
    
    // Create organization as entity
    const { error: entityError } = await this.supabase
      .from('core_entities')
      .insert({
        id: ids.orgId,
        organization_id: ids.orgId,
        entity_type: 'organization',
        entity_name: `${data.businessName} - ${data.locationName}`,
        entity_code: ids.orgCode,
        is_active: true
      })
    
    if (entityError) throw entityError
    
    // Insert organization details into core_dynamic_data
    const orgData = [
      { entity_id: ids.orgId, field_name: 'location_name', field_value: data.locationName, field_type: 'text' },
      { entity_id: ids.orgId, field_name: 'full_address', field_value: data.address, field_type: 'text' },
      { entity_id: ids.orgId, field_name: 'city', field_value: data.city, field_type: 'text' },
      { entity_id: ids.orgId, field_name: 'state', field_value: data.state, field_type: 'text' },
      { entity_id: ids.orgId, field_name: 'country', field_value: data.country, field_type: 'text' },
      { entity_id: ids.orgId, field_name: 'postal_code', field_value: data.postalCode, field_type: 'text' },
      { entity_id: ids.orgId, field_name: 'opening_hours', field_value: `${data.openingTime}-${data.closingTime}`, field_type: 'text' },
      { entity_id: ids.orgId, field_name: 'seating_capacity', field_value: data.seatingCapacity, field_type: 'number' },
      { entity_id: ids.orgId, field_name: 'phone_primary', field_value: data.primaryPhone, field_type: 'text' },
      { entity_id: ids.orgId, field_name: 'email_location', field_value: data.businessEmail, field_type: 'text' },
      { entity_id: ids.orgId, field_name: 'manager_name', field_value: data.managerName, field_type: 'text' },
      { entity_id: ids.orgId, field_name: 'manager_phone', field_value: data.managerPhone, field_type: 'text' },
      { entity_id: ids.orgId, field_name: 'manager_email', field_value: data.managerEmail, field_type: 'text' },
      { entity_id: ids.orgId, field_name: 'cuisine_focus', field_value: data.cuisineType, field_type: 'text' },
      { entity_id: ids.orgId, field_name: 'restaurant_type', field_value: 'Fast Casual Dining', field_type: 'text' },
      { entity_id: ids.orgId, field_name: 'service_types', field_value: 'Dine-in, Takeout, Delivery', field_type: 'text' }
    ]
    
    const { error: dataError } = await this.supabase
      .from('core_dynamic_data')
      .insert(orgData)
    
    if (dataError) throw dataError
  }
  
  // Step 3: Create Manager User
  private async createManagerUser(ids: any, data: RestaurantSetupData) {
    // First, create auth user in Supabase Auth
    const { data: authData, error: authError } = await this.supabase.auth.signUp({
      email: data.managerEmail,
      password: this.generateTempPassword(),
      options: {
        data: {
          full_name: data.managerName,
          phone: data.managerPhone
        }
      }
    })
    
    if (authError) throw authError
    
    const actualAuthUserId = authData.user?.id || ids.authUserId
    
    // Create user in core_users
    const { error: userError } = await this.supabase
      .from('core_users')
      .insert({
        id: ids.userId,
        email: data.managerEmail,
        full_name: data.managerName,
        is_active: true,
        role: 'restaurant_manager',
        auth_user_id: actualAuthUserId
      })
    
    if (userError) throw userError
    
    // Link user to client
    const { error: clientLinkError } = await this.supabase
      .from('user_clients')
      .insert({
        id: `uc-${ids.userId}`,
        user_id: ids.userId,
        client_id: ids.clientId,
        role: 'restaurant_manager',
        is_active: true
      })
    
    if (clientLinkError) throw clientLinkError
    
    // Link user to organization
    const { error: orgLinkError } = await this.supabase
      .from('user_organizations')
      .insert({
        id: `uo-${ids.userId}`,
        user_id: ids.userId,
        organization_id: ids.orgId,
        role: 'restaurant_manager',
        is_active: true
      })
    
    if (orgLinkError) throw orgLinkError
  }
  
  // Step 4: Create Basic Restaurant Entities
  private async createBasicEntities(orgId: string) {
    // Create default menu categories
    const categories = [
      { id: `cat-starters-${Date.now()}`, name: 'Starters', code: 'CAT-STARTERS' },
      { id: `cat-mains-${Date.now() + 1}`, name: 'Main Courses', code: 'CAT-MAINS' },
      { id: `cat-beverages-${Date.now() + 2}`, name: 'Beverages', code: 'CAT-BEVERAGES' },
      { id: `cat-desserts-${Date.now() + 3}`, name: 'Desserts', code: 'CAT-DESSERTS' }
    ]
    
    const categoryEntities = categories.map(cat => ({
      id: cat.id,
      organization_id: orgId,
      entity_type: 'menu_category',
      entity_name: cat.name,
      entity_code: cat.code,
      is_active: true
    }))
    
    const { error: catError } = await this.supabase
      .from('core_entities')
      .insert(categoryEntities)
    
    if (catError) throw catError
    
    // Create default tables
    const tables = Array.from({ length: 5 }, (_, i) => ({
      id: `table-${i + 1}-${Date.now()}`,
      organization_id: orgId,
      entity_type: 'table',
      entity_name: `Table ${i + 1}`,
      entity_code: `TBL-${String(i + 1).padStart(3, '0')}`,
      is_active: true
    }))
    
    const { error: tableError } = await this.supabase
      .from('core_entities')
      .insert(tables)
    
    if (tableError) throw tableError
    
    // Add table details
    const tableData = tables.flatMap(table => [
      { entity_id: table.id, field_name: 'seating_capacity', field_value: '4', field_type: 'number' },
      { entity_id: table.id, field_name: 'location', field_value: 'main_hall', field_type: 'text' },
      { entity_id: table.id, field_name: 'table_type', field_value: 'regular', field_type: 'text' },
      { entity_id: table.id, field_name: 'status', field_value: 'available', field_type: 'text' }
    ])
    
    const { error: tableDataError } = await this.supabase
      .from('core_dynamic_data')
      .insert(tableData)
    
    if (tableDataError) throw tableDataError
  }
  
  // Helper: Generate temporary password
  private generateTempPassword(): string {
    return `Welcome${Math.random().toString(36).slice(-8)}!`
  }
  
  // Subscribe to real-time updates for an organization
  subscribeToOrganization(orgId: string, callback: (payload: any) => void) {
    return this.supabase
      .channel(`org-${orgId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'core_entities',
          filter: `organization_id=eq.${orgId}`
        },
        callback
      )
      .subscribe()
  }
}