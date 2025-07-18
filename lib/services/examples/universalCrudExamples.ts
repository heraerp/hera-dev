/**
 * HERA Universal CRUD Service - Usage Examples
 * 
 * Comprehensive examples showing how to use the Universal CRUD Service
 * for all common operations in HERA Universal.
 * 
 * Copy and adapt these patterns for your specific use cases.
 */

import UniversalCrudService, { EntityData, UpdateData } from '../universalCrudService'

// =============================================================================
// EXAMPLE 1: Simple Entity Creation
// =============================================================================

export async function createSimpleClient() {
  const clientData: EntityData = {
    name: 'TechCorp Solutions',
    mainFields: {
      client_type: 'enterprise',
      industry: 'Technology'
    },
    fields: {
      website: 'https://techcorp.com',
      headquarters: 'San Francisco, CA',
      employee_count: 500,
      established_year: 2010
    }
  }
  
  const result = await UniversalCrudService.createEntity(clientData, 'client')
  
  if (result.success) {
    console.log('✅ Client created with ID:', result.data)
    return result.data // Returns the client ID
  } else {
    console.error('❌ Client creation failed:', result.error)
    throw new Error(result.error)
  }
}

// =============================================================================
// EXAMPLE 2: Sequential Entity Creation (Restaurant Setup Pattern)
// =============================================================================

export async function createRestaurantHierarchy() {
  // Step 1: Create parent client
  const clientData: EntityData = {
    name: 'Delicious Dining Group',
    mainFields: {
      client_type: 'restaurant_chain'
    },
    fields: {
      cuisine_specialization: 'Italian',
      established_year: 2015,
      corporate_email: 'info@deliciousdining.com'
    }
  }
  
  const clientResult = await UniversalCrudService.createEntity(clientData, 'client')
  if (!clientResult.success) throw new Error('Failed to create client')
  
  const clientId = clientResult.data
  
  // Step 2: Create organization using client ID
  const orgData: EntityData = {
    name: 'Delicious Dining - Downtown',
    organizationId: null, // Organizations don't have parent orgs, they reference clients
    mainFields: {
      client_id: clientId,
      industry: 'Food & Beverage',
      country: 'USA',
      currency: 'USD'
    },
    fields: {
      branch_name: 'Downtown Location',
      full_address: '123 Main St, Downtown',
      city: 'San Francisco',
      state: 'CA',
      postal_code: '94102',
      opening_hours: '10:00-22:00',
      seating_capacity: 80,
      manager_name: 'John Smith',
      manager_email: 'john@deliciousdining.com'
    }
  }
  
  const orgResult = await UniversalCrudService.createEntity(orgData, 'organization')
  if (!orgResult.success) throw new Error('Failed to create organization')
  
  const orgId = orgResult.data
  
  // Step 3: Create menu categories for the restaurant
  const categories = [
    { name: 'Appetizers', code: 'APP' },
    { name: 'Main Courses', code: 'MAIN' },
    { name: 'Desserts', code: 'DESS' },
    { name: 'Beverages', code: 'BEV' }
  ]
  
  const categoryIds = []
  for (const category of categories) {
    const categoryData: EntityData = {
      name: category.name,
      organizationId: orgId,
      fields: {
        category_code: category.code,
        display_order: categories.indexOf(category) + 1,
        is_active: true
      }
    }
    
    const categoryResult = await UniversalCrudService.createEntity(categoryData, 'menu_category')
    if (categoryResult.success) {
      categoryIds.push(categoryResult.data)
    }
  }
  
  return {
    clientId,
    organizationId: orgId,
    categoryIds
  }
}

// =============================================================================
// EXAMPLE 3: Using Sequential Operations Helper
// =============================================================================

export async function createRestaurantWithSequentialHelper() {
  const operations = [
    // Operation 0: Create client
    {
      type: 'create' as const,
      entityType: 'client',
      entityData: {
        name: 'QuickBite Franchise',
        mainFields: {
          client_type: 'franchise'
        },
        fields: {
          franchise_fee: 50000,
          royalty_percentage: 8
        }
      }
    },
    
    // Operation 1: Create organization (depends on operation 0)
    {
      type: 'create' as const,
      entityType: 'organization',
      entityData: {
        name: 'QuickBite - Mall Location',
        mainFields: {
          industry: 'Fast Food',
          country: 'USA',
          currency: 'USD'
        },
        fields: {
          location_type: 'mall',
          lease_expiry: '2025-12-31'
        }
      },
      dependsOn: 0 // This operation depends on operation 0 (client creation)
    },
    
    // Operation 2: Create menu category (depends on operation 1)
    {
      type: 'create' as const,
      entityType: 'menu_category',
      entityData: {
        name: 'Quick Meals',
        fields: {
          category_type: 'fast_food',
          prep_time_minutes: 5
        }
      },
      dependsOn: 1 // This operation depends on operation 1 (organization creation)
    }
  ]
  
  const result = await UniversalCrudService.sequentialOperation(operations)
  
  if (result.success) {
    console.log('✅ All operations completed:', result.data)
    return {
      clientId: result.data[0].data,
      organizationId: result.data[1].data,
      categoryId: result.data[2].data
    }
  } else {
    console.error('❌ Sequential operations failed:', result.error)
    throw new Error(result.error)
  }
}

// =============================================================================
// EXAMPLE 4: Entity Reading with Full Data
// =============================================================================

export async function readCompleteEntity(entityId: string) {
  const result = await UniversalCrudService.readEntity(entityId)
  
  if (result.success) {
    const entity = result.data
    console.log('📖 Entity Details:')
    console.log('  - ID:', entity.id)
    console.log('  - Name:', entity.entity_name)
    console.log('  - Type:', entity.entity_type)
    console.log('  - Organization:', entity.organization_id)
    console.log('  - Dynamic Fields:', entity.fields)
    
    return entity
  } else {
    console.error('❌ Failed to read entity:', result.error)
    throw new Error(result.error)
  }
}

// =============================================================================
// EXAMPLE 5: Entity Updating
// =============================================================================

export async function updateRestaurantInfo(restaurantId: string) {
  const updates: UpdateData = {
    // Update main organization table
    mainFields: {
      currency: 'EUR', // Changed from USD to EUR
      updated_at: new Date().toISOString()
    },
    
    // Update core_entities table
    entityFields: {
      entity_name: 'Delicious Dining - Downtown (Updated)',
      is_active: true
    },
    
    // Update/add dynamic data
    dynamicFields: {
      seating_capacity: 100, // Increased from 80
      delivery_available: true,
      phone_number: '+1-555-0123',
      email_updated: new Date().toISOString()
    }
  }
  
  const result = await UniversalCrudService.updateEntity(restaurantId, updates)
  
  if (result.success) {
    console.log('✅ Restaurant updated successfully')
    return true
  } else {
    console.error('❌ Restaurant update failed:', result.error)
    throw new Error(result.error)
  }
}

// =============================================================================
// EXAMPLE 6: Safe Operation Pattern
// =============================================================================

export async function safeCreateProduct(productData: any) {
  return await UniversalCrudService.safeOperation(async () => {
    // Complex product creation logic
    const productEntity: EntityData = {
      name: productData.name,
      organizationId: productData.organizationId,
      fields: {
        price: productData.price,
        category: productData.category,
        description: productData.description,
        sku: productData.sku,
        stock_quantity: productData.stock || 0
      }
    }
    
    const result = await UniversalCrudService.createEntity(productEntity, 'product')
    
    if (!result.success) {
      throw new Error(result.error)
    }
    
    // Additional logic after product creation
    console.log('🎉 Product created with additional processing')
    
    return result.data
  }, 'product creation')
}

// =============================================================================
// EXAMPLE 7: Bulk Operations
// =============================================================================

export async function createMultipleMenuItems(organizationId: string) {
  const menuItems = [
    { name: 'Margherita Pizza', price: 12.99, category: 'Main Course' },
    { name: 'Caesar Salad', price: 8.99, category: 'Appetizer' },
    { name: 'Tiramisu', price: 6.99, category: 'Dessert' },
    { name: 'House Wine', price: 4.99, category: 'Beverage' }
  ]
  
  const createdItems = []
  
  for (const item of menuItems) {
    const itemData: EntityData = {
      name: item.name,
      organizationId: organizationId,
      fields: {
        price: item.price,
        category: item.category,
        is_available: true,
        created_date: new Date().toISOString()
      }
    }
    
    const result = await UniversalCrudService.createEntity(itemData, 'menu_item')
    
    if (result.success) {
      createdItems.push({
        id: result.data,
        name: item.name,
        price: item.price
      })
    } else {
      console.error(`Failed to create ${item.name}:`, result.error)
    }
  }
  
  console.log(`✅ Created ${createdItems.length} menu items`)
  return createdItems
}

// =============================================================================
// EXAMPLE 8: Testing Service Role
// =============================================================================

export async function testSystemCapabilities() {
  console.log('🧪 Testing service role capabilities...')
  
  const testResult = await UniversalCrudService.testServiceRole()
  
  if (testResult.success) {
    console.log('✅ Service role test passed')
    return true
  } else {
    console.error('❌ Service role test failed:', testResult.error)
    console.error('Details:', testResult.details)
    return false
  }
}

// =============================================================================
// EXAMPLE 9: Error Handling Pattern
// =============================================================================

export async function robustEntityCreation(entityData: EntityData, entityType: string) {
  try {
    // Test service role first
    const canProceed = await testSystemCapabilities()
    if (!canProceed) {
      throw new Error('Service role not properly configured')
    }
    
    // Validate required data
    if (!entityData.name || !entityType) {
      throw new Error('Missing required entity data')
    }
    
    // Create entity
    const result = await UniversalCrudService.createEntity(entityData, entityType)
    
    if (!result.success) {
      throw new Error(`Entity creation failed: ${result.error}`)
    }
    
    // Verify creation by reading back
    const verification = await UniversalCrudService.readEntity(result.data)
    if (!verification.success) {
      console.warn('⚠️ Entity created but verification failed')
    }
    
    return {
      success: true,
      entityId: result.data,
      verified: verification.success
    }
    
  } catch (error) {
    console.error('🚨 Robust entity creation failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// =============================================================================
// Export all examples for easy access
// =============================================================================

export const examples = {
  createSimpleClient,
  createRestaurantHierarchy,
  createRestaurantWithSequentialHelper,
  readCompleteEntity,
  updateRestaurantInfo,
  safeCreateProduct,
  createMultipleMenuItems,
  testSystemCapabilities,
  robustEntityCreation
}

export default examples