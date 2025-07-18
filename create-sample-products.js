/**
 * Create sample products for testing the products page
 * Uses the existing ProductCatalogService to create test data
 */

import { createClient } from '@/lib/supabase/client';
const { createClient } = require('@supabase/supabase-js')
const crypto = require('crypto')

// Environment variables
const SUPABASE_URL = 'https://yslviohidtyqjmyslekz.supabase.co'
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlzbHZpb2hpZHR5cWpteXNsZWt6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTg5MzUyMSwiZXhwIjoyMDY3NDY5NTIxfQ.VQtaWocR7DBq4mMI0eqhd1caB3HU0pGbSB1rbkB0iUI'

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

// Regular client for read operations
const supabase = createClient(SUPABASE_URL, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlzbHZpb2hpZHR5cWpteXNsZWt6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4OTM1MjEsImV4cCI6MjA2NzQ2OTUyMX0.j7W2RpnpaNpvJReLeJpUMUUg3tbpSacvSsu3m9tcNmE')

// Product entity types
const PRODUCT_ENTITY_TYPES = {
  PRODUCT_CATEGORY: 'product_category',
  PRODUCT: 'product'
}

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

async function createProductCategory(organizationId, categoryData) {
  try {
    const categoryId = crypto.randomUUID()
    const categoryCode = generateEntityCode(categoryData.name, 'CAT')

    console.log(`🏗️ Creating category: ${categoryData.name}`)

    // Create category entity
    const { error: entityError } = await supabaseAdmin
      .from('core_entities')
      .insert({
        id: categoryId,
        organization_id: organizationId,
        entity_type: PRODUCT_ENTITY_TYPES.PRODUCT_CATEGORY,
        entity_name: categoryData.name,
        entity_code: categoryCode,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })

    if (entityError) throw entityError

    // Create category dynamic data
    const dynamicData = [
      { entity_id: categoryId, field_name: 'description', field_value: categoryData.description || '', field_type: 'text' },
      { entity_id: categoryId, field_name: 'sort_order', field_value: (categoryData.sortOrder || 0).toString(), field_type: 'number' },
      { entity_id: categoryId, field_name: 'category_type', field_value: categoryData.categoryType || 'other', field_type: 'text' }
    ]

    const { error: dataError } = await supabaseAdmin
      .from('core_dynamic_data')
      .insert(dynamicData.map(item => ({
        ...item,
        organization_id: organizationId
      })))

    if (dataError) throw dataError

    console.log(`✅ Category created: ${categoryData.name} (${categoryId})`)
    return { id: categoryId, name: categoryData.name }

  } catch (error) {
    console.error(`❌ Error creating category ${categoryData.name}:`, error)
    return null
  }
}

async function createProduct(organizationId, productData) {
  try {
    const productId = crypto.randomUUID()
    const productCode = generateEntityCode(productData.name, 'PRD')

    console.log(`🏗️ Creating product: ${productData.name}`)

    // Create product entity
    const { error: entityError } = await supabaseAdmin
      .from('core_entities')
      .insert({
        id: productId,
        organization_id: organizationId,
        entity_type: PRODUCT_ENTITY_TYPES.PRODUCT,
        entity_name: productData.name,
        entity_code: productCode,
        is_active: productData.is_available !== false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })

    if (entityError) throw entityError

    // Create product dynamic data
    const dynamicData = [
      { entity_id: productId, field_name: 'category_id', field_value: productData.categoryId, field_type: 'uuid' },
      { entity_id: productId, field_name: 'description', field_value: productData.description, field_type: 'text' },
      { entity_id: productId, field_name: 'base_price', field_value: productData.price.toString(), field_type: 'number' },
      { entity_id: productId, field_name: 'sku', field_value: productCode, field_type: 'text' },
      { entity_id: productId, field_name: 'preparation_time_minutes', field_value: (productData.preparation_time_minutes || 0).toString(), field_type: 'number' },
      { entity_id: productId, field_name: 'product_type', field_value: productData.product_type || 'other', field_type: 'text' },
      { entity_id: productId, field_name: 'category', field_value: productData.category || 'Other', field_type: 'text' }
    ]

    const { error: dataError } = await supabaseAdmin
      .from('core_dynamic_data')
      .insert(dynamicData.map(item => ({
        ...item,
        organization_id: organizationId
      })))

    if (dataError) throw dataError

    // Create product metadata
    const { error: metadataError } = await supabaseAdmin
      .from('core_metadata')
      .insert({
        organization_id: organizationId,
        entity_type: PRODUCT_ENTITY_TYPES.PRODUCT,
        entity_id: productId,
        metadata_type: 'product_details',
        metadata_category: 'product_specifications',
        metadata_key: 'detailed_info',
        metadata_value: JSON.stringify({
          category: productData.category,
          product_type: productData.product_type,
          preparation_time: productData.preparation_time_minutes,
          is_available: productData.is_available !== false,
          brewing_instructions: productData.brewing_instructions || {},
          nutritional_info: productData.nutritional_info || {},
          origin_story: productData.origin_story || ''
        })
      })

    if (metadataError) throw metadataError

    console.log(`✅ Product created: ${productData.name} (${productId})`)
    return { id: productId, name: productData.name }

  } catch (error) {
    console.error(`❌ Error creating product ${productData.name}:`, error)
    return null
  }
}

function generateEntityCode(name, type) {
  const baseCode = name.replace(/[^A-Z0-9]/gi, '').toUpperCase().slice(0, 8)
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  const typeCode = type.slice(0, 3)
  return `${baseCode}-${random}-${typeCode}`
}

async function createSampleProducts() {
  console.log('🚀 Creating sample products for testing')
  console.log('=' .repeat(50))

  try {
    // Find organization for the test user
    const organizationId = await findOrganizationForUser(TEST_EMAIL)
    if (!organizationId) {
      console.log('❌ Could not find organization for user. Please ensure the user has set up a restaurant.')
      return
    }

    // Create categories
    const categories = [
      {
        name: 'Hot Beverages',
        description: 'Hot tea and coffee beverages',
        categoryType: 'beverage',
        sortOrder: 1
      },
      {
        name: 'Cold Beverages',
        description: 'Iced teas and cold drinks',
        categoryType: 'beverage',
        sortOrder: 2
      },
      {
        name: 'Pastries & Desserts',
        description: 'Fresh baked pastries and sweet treats',
        categoryType: 'pastry',
        sortOrder: 3
      },
      {
        name: 'Light Meals',
        description: 'Sandwiches and light meal options',
        categoryType: 'food',
        sortOrder: 4
      }
    ]

    console.log('\\n📂 Creating categories...')
    const createdCategories = {}
    for (const categoryData of categories) {
      const category = await createProductCategory(organizationId, categoryData)
      if (category) {
        createdCategories[category.name] = category.id
      }
    }

    // Create products
    const products = [
      // Hot Beverages
      {
        name: 'Premium Jasmine Green Tea',
        description: 'Delicate green tea scented with jasmine flowers, offering a floral and refreshing taste',
        price: 4.50,
        category: 'Hot Beverages',
        preparation_time_minutes: 3,
        is_available: true,
        product_type: 'tea',
        categoryId: createdCategories['Hot Beverages'],
        brewing_instructions: {
          temperature: '80°C',
          steeping_time: '2-3 minutes',
          tea_amount: '1 tsp per cup'
        },
        nutritional_info: {
          caffeine_content: '30mg',
          calories_per_serving: 2
        }
      },
      {
        name: 'Earl Grey Supreme',
        description: 'Classic Earl Grey with bergamot oil and cornflower petals for a refined taste',
        price: 4.75,
        category: 'Hot Beverages',
        preparation_time_minutes: 4,
        is_available: true,
        product_type: 'tea',
        categoryId: createdCategories['Hot Beverages'],
        brewing_instructions: {
          temperature: '95°C',
          steeping_time: '3-5 minutes',
          tea_amount: '1 tsp per cup'
        }
      },
      {
        name: 'Dragon Well Green Tea',
        description: 'Premium Chinese green tea with a delicate, sweet flavor and beautiful flat leaves',
        price: 5.25,
        category: 'Hot Beverages',
        preparation_time_minutes: 3,
        is_available: true,
        product_type: 'tea',
        categoryId: createdCategories['Hot Beverages'],
        brewing_instructions: {
          temperature: '80°C',
          steeping_time: '2-3 minutes',
          tea_amount: '1 tsp per cup'
        }
      },
      {
        name: 'English Breakfast Tea',
        description: 'Rich and malty blend perfect for morning, pairs excellently with milk and sugar',
        price: 4.25,
        category: 'Hot Beverages',
        preparation_time_minutes: 4,
        is_available: true,
        product_type: 'tea',
        categoryId: createdCategories['Hot Beverages']
      },
      {
        name: 'Chamomile Herbal Tea',
        description: 'Soothing caffeine-free herbal tea with calming properties, perfect for evening',
        price: 4.00,
        category: 'Hot Beverages',
        preparation_time_minutes: 5,
        is_available: true,
        product_type: 'tea',
        categoryId: createdCategories['Hot Beverages'],
        nutritional_info: {
          caffeine_content: '0mg',
          calories_per_serving: 1
        }
      },
      // Cold Beverages
      {
        name: 'Iced Jasmine Green Tea',
        description: 'Refreshing cold brew jasmine tea served over ice with optional honey',
        price: 4.75,
        category: 'Cold Beverages',
        preparation_time_minutes: 2,
        is_available: true,
        product_type: 'beverage',
        categoryId: createdCategories['Cold Beverages']
      },
      {
        name: 'Iced Earl Grey Latte',
        description: 'Creamy iced latte made with Earl Grey tea and steamed milk',
        price: 5.50,
        category: 'Cold Beverages',
        preparation_time_minutes: 3,
        is_available: true,
        product_type: 'beverage',
        categoryId: createdCategories['Cold Beverages']
      },
      // Pastries & Desserts
      {
        name: 'Fresh Blueberry Scone',
        description: 'Traditional English scone with fresh blueberries, served with clotted cream and jam',
        price: 3.25,
        category: 'Pastries & Desserts',
        preparation_time_minutes: 2,
        is_available: true,
        product_type: 'pastry',
        categoryId: createdCategories['Pastries & Desserts'],
        nutritional_info: {
          calories_per_serving: 320,
          allergens: ['Gluten', 'Dairy', 'Eggs']
        }
      },
      {
        name: 'Almond Croissant',
        description: 'Buttery, flaky croissant filled with almond cream and topped with sliced almonds',
        price: 3.75,
        category: 'Pastries & Desserts',
        preparation_time_minutes: 2,
        is_available: true,
        product_type: 'pastry',
        categoryId: createdCategories['Pastries & Desserts'],
        nutritional_info: {
          calories_per_serving: 380,
          allergens: ['Gluten', 'Dairy', 'Eggs', 'Nuts']
        }
      },
      {
        name: 'Chocolate Chip Muffin',
        description: 'Moist vanilla muffin studded with premium chocolate chips',
        price: 2.95,
        category: 'Pastries & Desserts',
        preparation_time_minutes: 1,
        is_available: true,
        product_type: 'pastry',
        categoryId: createdCategories['Pastries & Desserts']
      },
      {
        name: 'Lemon Tart',
        description: 'Tangy lemon curd in a buttery pastry shell, topped with meringue',
        price: 4.50,
        category: 'Pastries & Desserts',
        preparation_time_minutes: 1,
        is_available: true,
        product_type: 'pastry',
        categoryId: createdCategories['Pastries & Desserts']
      },
      // Light Meals
      {
        name: 'Smoked Salmon Bagel',
        description: 'Everything bagel with cream cheese, smoked salmon, capers, and red onion',
        price: 8.95,
        category: 'Light Meals',
        preparation_time_minutes: 5,
        is_available: true,
        product_type: 'food',
        categoryId: createdCategories['Light Meals']
      },
      {
        name: 'Avocado Toast',
        description: 'Sourdough toast topped with mashed avocado, cherry tomatoes, and hemp seeds',
        price: 7.25,
        category: 'Light Meals',
        preparation_time_minutes: 4,
        is_available: true,
        product_type: 'food',
        categoryId: createdCategories['Light Meals']
      },
      {
        name: 'Quinoa Salad Bowl',
        description: 'Fresh quinoa salad with roasted vegetables, feta cheese, and lemon vinaigrette',
        price: 9.50,
        category: 'Light Meals',
        preparation_time_minutes: 3,
        is_available: true,
        product_type: 'food',
        categoryId: createdCategories['Light Meals']
      },
      // Some inactive products for testing
      {
        name: 'Seasonal Pumpkin Spice Tea',
        description: 'Limited time autumn blend with pumpkin and warming spices',
        price: 4.95,
        category: 'Hot Beverages',
        preparation_time_minutes: 4,
        is_available: false, // Inactive for testing
        product_type: 'tea',
        categoryId: createdCategories['Hot Beverages']
      }
    ]

    console.log('\\n🛍️ Creating products...')
    let createdCount = 0
    for (const productData of products) {
      if (productData.categoryId) {
        const product = await createProduct(organizationId, productData)
        if (product) {
          createdCount++
        }
      }
    }

    console.log('\\n🎉 Sample products creation complete!')
    console.log(`✅ Created ${createdCount} products across ${Object.keys(createdCategories).length} categories`)
    console.log('\\n📊 Summary:')
    console.log(`   - Categories: ${Object.keys(createdCategories).length}`)
    console.log(`   - Products: ${createdCount}`)
    console.log(`   - Organization: ${organizationId}`)
    console.log('\\n🌐 You can now test the products page at:')
    console.log('   http://localhost:3000/restaurant/products')

  } catch (error) {
    console.error('❌ Error creating sample products:', error)
  }
}

// Run the script
createSampleProducts()