/**
 * Initialize products for testing the products page
 * Uses the existing UniversalProductService.initializeProductData method
 */

import { createClient } from '@/lib/supabase/client';
const { createClient } = require('@supabase/supabase-js')

// Environment variables
const SUPABASE_URL = 'https://yslviohidtyqjmyslekz.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlzbHZpb2hpZHR5cWpteXNsZWt6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4OTM1MjEsImV4cCI6MjA2NzQ2OTUyMX0.j7W2RpnpaNpvJReLeJpUMUUg3tbpSacvSsu3m9tcNmE'
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlzbHZpb2hpZHR5cWpteXNsZWt6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTg5MzUyMSwiZXhwIjoyMDY3NDY5NTIxfQ.VQtaWocR7DBq4mMI0eqhd1caB3HU0pGbSB1rbkB0iUI'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Service client for admin operations
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
  global: {
    headers: {
      'apikey': SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
    }
  }
})

// Test email to find organization for
const TEST_EMAIL = 'santhoshlal@gmail.com'

async function findOrganizationForUser(email) {
  console.log(`🔍 Finding organization for user: ${email}`)
  
  try {
    // Get auth user
    const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers()
    if (authError) throw authError
    
    const authUser = authUsers.users.find(u => u.email === email)
    if (!authUser) {
      console.log(`❌ Auth user not found for email: ${email}`)
      return null
    }
    
    console.log(`✅ Auth user found: ${authUser.id}`)
    
    // Get core user
    const { data: coreUser, error: coreError } = await supabaseAdmin
      .from('core_users')
      .select('id')
      .eq('auth_user_id', authUser.id)
      .single()
    
    if (coreError || !coreUser) {
      console.log(`❌ Core user not found for auth user: ${authUser.id}`)
      return null
    }
    
    console.log(`✅ Core user found: ${coreUser.id}`)
    
    // Get user organizations
    const { data: userOrgs, error: userOrgsError } = await supabaseAdmin
      .from('user_organizations')
      .select('organization_id, role, is_active')
      .eq('user_id', coreUser.id)
      .eq('is_active', true)
    
    if (userOrgsError || !userOrgs || userOrgs.length === 0) {
      console.log(`❌ No active organizations found for user: ${coreUser.id}`)
      return null
    }
    
    console.log(`✅ Found ${userOrgs.length} organization(s)`)
    
    // Get organization details
    const orgIds = userOrgs.map(uo => uo.organization_id)
    const { data: organizations, error: orgsError } = await supabaseAdmin
      .from('core_organizations')
      .select('id, org_name, industry, is_active')
      .in('id', orgIds)
      .eq('is_active', true)
    
    if (orgsError || !organizations || organizations.length === 0) {
      console.log(`❌ No active organizations found`)
      return null
    }
    
    // Find restaurant organization
    const restaurant = organizations.find(org => org.industry === 'restaurant')
    if (!restaurant) {
      console.log(`❌ No restaurant organization found`)
      return null
    }
    
    console.log(`✅ Restaurant found: ${restaurant.org_name} (${restaurant.id})`)
    return restaurant.id
    
  } catch (error) {
    console.error('❌ Error finding organization:', error)
    return null
  }
}

async function createProductsUsingService(organizationId) {
  console.log('🍃 Creating products using UniversalProductService pattern')
  
  // Get core user ID for created_by field
  const { data: coreUser, error: coreUserError } = await supabaseAdmin
    .from('core_users')
    .select('id')
    .eq('email', TEST_EMAIL)
    .single()
  
  if (coreUserError || !coreUser) {
    console.error('❌ Could not find core user for created_by field')
    return 0
  }
  
  const coreUserId = coreUser.id
  console.log('✅ Using core user ID for created_by:', coreUserId)
  
  // Sample products in the format expected by the service
  const sampleProducts = [
    {
      id: '550e8400-e29b-41d4-a716-446655440040',
      entity_name: 'Premium Jasmine Green Tea',
      entity_code: 'TEA-001',
      metadata: {
        category: 'tea',
        description: 'Authentic Chinese jasmine green tea with delicate floral aroma',
        product_type: 'finished_good',
        price: 4.50,
        cost_per_unit: 1.20,
        inventory_count: 150,
        minimum_stock: 20,
        unit_type: 'servings',
        preparation_time_minutes: 5,
        serving_temperature: 'Hot (70-80°C)',
        caffeine_level: 'Medium',
        calories: 5,
        allergens: 'None',
        origin: 'Fujian Province, China',
        supplier_name: 'Golden Mountain Tea Co.',
        storage_requirements: 'Cool, dry place away from light',
        shelf_life_days: 730,
        status: 'in_stock',
        is_draft: false,
        created_by: 'system',
        updated_by: 'system'
      }
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440041',
      entity_name: 'Earl Grey Supreme',
      entity_code: 'TEA-002',
      metadata: {
        category: 'tea',
        description: 'Classic Earl Grey with bergamot oil and cornflower petals',
        product_type: 'finished_good',
        price: 4.75,
        cost_per_unit: 1.15,
        inventory_count: 120,
        minimum_stock: 15,
        unit_type: 'servings',
        preparation_time_minutes: 4,
        serving_temperature: 'Hot (85-90°C)',
        caffeine_level: 'High',
        calories: 2,
        allergens: 'None',
        origin: 'Sri Lanka',
        supplier_name: 'Ceylon Tea Imports',
        storage_requirements: 'Airtight container, cool place',
        shelf_life_days: 1095,
        status: 'in_stock',
        is_draft: false,
        created_by: 'system',
        updated_by: 'system'
      }
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440042',
      entity_name: 'Dragon Well Green Tea',
      entity_code: 'TEA-003',
      metadata: {
        category: 'tea',
        description: 'Premium Chinese green tea with delicate, sweet flavor',
        product_type: 'finished_good',
        price: 5.25,
        cost_per_unit: 1.35,
        inventory_count: 80,
        minimum_stock: 10,
        unit_type: 'servings',
        preparation_time_minutes: 3,
        serving_temperature: 'Hot (80°C)',
        caffeine_level: 'Medium',
        calories: 3,
        allergens: 'None',
        origin: 'Hangzhou, China',
        supplier_name: 'West Lake Tea Gardens',
        storage_requirements: 'Cool, dry place',
        shelf_life_days: 730,
        status: 'in_stock',
        is_draft: false,
        created_by: 'system',
        updated_by: 'system'
      }
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440043',
      entity_name: 'Fresh Blueberry Scone',
      entity_code: 'PASTRY-001',
      metadata: {
        category: 'pastries',
        description: 'Traditional English scone with fresh blueberries',
        product_type: 'finished_good',
        price: 3.25,
        cost_per_unit: 0.85,
        inventory_count: 24,
        minimum_stock: 5,
        unit_type: 'pieces',
        preparation_time_minutes: 2,
        serving_temperature: 'Room temperature',
        caffeine_level: 'None',
        calories: 280,
        allergens: 'Gluten, Dairy, Eggs',
        origin: 'Local bakery',
        supplier_name: 'Artisan Bakehouse',
        storage_requirements: 'Refrigerated display case',
        shelf_life_days: 3,
        status: 'in_stock',
        is_draft: false,
        created_by: 'system',
        updated_by: 'system'
      }
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440044',
      entity_name: 'Almond Croissant',
      entity_code: 'PASTRY-002',
      metadata: {
        category: 'pastries',
        description: 'Buttery croissant filled with almond cream',
        product_type: 'finished_good',
        price: 3.75,
        cost_per_unit: 0.95,
        inventory_count: 18,
        minimum_stock: 6,
        unit_type: 'pieces',
        preparation_time_minutes: 2,
        serving_temperature: 'Room temperature',
        caffeine_level: 'None',
        calories: 380,
        allergens: 'Gluten, Dairy, Eggs, Nuts',
        origin: 'Local bakery',
        supplier_name: 'Artisan Bakehouse',
        storage_requirements: 'Refrigerated display case',
        shelf_life_days: 2,
        status: 'in_stock',
        is_draft: false,
        created_by: 'system',
        updated_by: 'system'
      }
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440045',
      entity_name: 'Chamomile Herbal Tea',
      entity_code: 'TEA-004',
      metadata: {
        category: 'tea',
        description: 'Soothing caffeine-free herbal tea with calming properties',
        product_type: 'finished_good',
        price: 4.00,
        cost_per_unit: 1.00,
        inventory_count: 5,
        minimum_stock: 15,
        unit_type: 'servings',
        preparation_time_minutes: 5,
        serving_temperature: 'Hot (95°C)',
        caffeine_level: 'None',
        calories: 1,
        allergens: 'None',
        origin: 'European Herb Gardens',
        supplier_name: 'Herbal Wellness Co.',
        storage_requirements: 'Dry, airtight container',
        shelf_life_days: 1095,
        status: 'low_stock',
        is_draft: false,
        created_by: 'system',
        updated_by: 'system'
      }
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440046',
      entity_name: 'Eco-Friendly Tea Cups',
      entity_code: 'PKG-001',
      metadata: {
        category: 'packaging',
        description: 'Biodegradable paper cups for hot beverages',
        product_type: 'packaging',
        price: 0.15,
        cost_per_unit: 0.08,
        inventory_count: 0,
        minimum_stock: 200,
        unit_type: 'pieces',
        preparation_time_minutes: 0,
        serving_temperature: 'Ambient',
        caffeine_level: 'None',
        calories: 0,
        allergens: 'None',
        origin: 'Sustainable Packaging Solutions',
        supplier_name: 'Green Pack Co.',
        storage_requirements: 'Dry storage area',
        shelf_life_days: 1825,
        status: 'out_of_stock',
        is_draft: false,
        created_by: 'system',
        updated_by: 'system'
      }
    }
  ]

  let createdCount = 0
  
  for (const product of sampleProducts) {
    try {
      console.log(`🏗️ Creating product: ${product.entity_name}`)
      
      // Create product entity
      const { error: entityError } = await supabaseAdmin
        .from('core_entities')
        .insert({
          id: product.id,
          organization_id: organizationId,
          entity_type: 'product',
          entity_name: product.entity_name,
          entity_code: product.entity_code,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })

      if (entityError && entityError.code !== '23505') {
        console.error(`❌ Error creating entity for ${product.entity_name}:`, entityError)
        continue
      }

      // Create product metadata
      const { error: metadataError } = await supabaseAdmin
        .from('core_metadata')
        .insert({
          organization_id: organizationId,
          entity_type: 'product',
          entity_id: product.id,
          metadata_type: 'product_details',
          metadata_category: 'catalog',
          metadata_key: 'product_info',
          metadata_value: JSON.stringify(product.metadata),
          is_system_generated: false,
          created_by: coreUserId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })

      if (metadataError && metadataError.code !== '23505') {
        console.error(`❌ Error creating metadata for ${product.entity_name}:`, metadataError)
        continue
      }

      console.log(`✅ Created product: ${product.entity_name}`)
      createdCount++
      
    } catch (error) {
      console.error(`❌ Error creating product ${product.entity_name}:`, error)
    }
  }

  return createdCount
}

async function initializeTestProducts() {
  console.log('🚀 Initializing test products for products page')
  console.log('=' .repeat(50))

  try {
    // Find organization for the test user
    const organizationId = await findOrganizationForUser(TEST_EMAIL)
    if (!organizationId) {
      console.log('❌ Could not find organization for user. Please ensure the user has set up a restaurant.')
      return
    }

    // Check if products already exist
    const { data: existingProducts, error: checkError } = await supabaseAdmin
      .from('core_entities')
      .select('id, entity_name')
      .eq('organization_id', organizationId)
      .eq('entity_type', 'product')
      .eq('is_active', true)
    
    if (checkError) {
      console.error('❌ Error checking existing products:', checkError)
      return
    }

    if (existingProducts && existingProducts.length > 0) {
      console.log(`✅ Found ${existingProducts.length} existing products:`)
      existingProducts.forEach((product, index) => {
        console.log(`   ${index + 1}. ${product.entity_name} (${product.id})`)
      })
      console.log('\\n🌐 You can test the products page at:')
      console.log('   http://localhost:3000/restaurant/products')
      return
    }

    // Create sample products
    console.log('\\n🍃 Creating sample products...')
    const createdCount = await createProductsUsingService(organizationId)

    console.log('\\n🎉 Product initialization complete!')
    console.log(`✅ Created ${createdCount} products`)
    console.log(`📊 Organization: ${organizationId}`)
    console.log('\\n🌐 You can now test the products page at:')
    console.log('   http://localhost:3000/restaurant/products')
    
  } catch (error) {
    console.error('❌ Error initializing test products:', error)
  }
}

// Run the script
initializeTestProducts()