/**
 * Test Product Creation for santhoshlal@gmail.com
 * Creates sample products to test the products page functionality
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { createClient } from '@/lib/supabase/client';

// Load environment variables
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
dotenv.config({ path: join(__dirname, '.env.local') })

console.log('🧪 Testing Product Creation for santhoshlal@gmail.com...')

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY

console.log('Environment check:', {
  hasUrl: !!url,
  hasServiceKey: !!serviceKey,
  urlStart: url?.substring(0, 20) + '...',
  keyStart: serviceKey?.substring(0, 10) + '...'
})

if (!url || !serviceKey) {
  console.error('❌ Missing environment variables')
  console.error('Make sure .env.local has NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_SERVICE_KEY')
  process.exit(1)
}

// Create service client with proper headers
const supabaseAdmin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
  global: {
    headers: {
      'apikey': serviceKey,
      'Authorization': `Bearer ${serviceKey}`
    }
  }
})

// Sample tea products to create
const sampleProducts = [
  {
    name: "Premium Jasmine Green Tea",
    description: "Delicate jasmine-scented green tea with floral notes and refreshing taste",
    basePrice: 4.50,
    productType: 'tea',
    preparationTimeMinutes: 5,
    brewingInstructions: {
      temperature: "80°C",
      steepingTime: "3-4 minutes",
      teaAmount: "1 tsp per cup"
    },
    nutritionalInfo: {
      caffeineContent: "25mg per cup",
      caloriesPerServing: 2,
      allergens: []
    },
    originStory: "Sourced from the hills of Fujian province, where jasmine flowers are layered with green tea leaves",
    seasonalAvailability: false,
    popularPairings: ["Light pastries", "Steamed dumplings", "Fresh fruit"]
  },
  {
    name: "Earl Grey Supreme",
    description: "Classic Earl Grey with bergamot oil, lavender, and cornflower petals",
    basePrice: 5.25,
    productType: 'tea',
    preparationTimeMinutes: 5,
    brewingInstructions: {
      temperature: "95°C",
      steepingTime: "4-5 minutes", 
      teaAmount: "1 tsp per cup"
    },
    nutritionalInfo: {
      caffeineContent: "40mg per cup",
      caloriesPerServing: 2,
      allergens: []
    },
    originStory: "A premium blend inspired by the 2nd Earl Grey, enhanced with lavender flowers",
    seasonalAvailability: false,
    popularPairings: ["Scones", "Shortbread", "Lemon cakes"]
  },
  {
    name: "Dragon Well Green Tea",
    description: "Traditional Chinese green tea with a delicate, sweet flavor and beautiful flat leaves",
    basePrice: 6.00,
    productType: 'tea',
    preparationTimeMinutes: 4,
    brewingInstructions: {
      temperature: "75°C",
      steepingTime: "2-3 minutes",
      teaAmount: "1 tsp per cup"
    },
    nutritionalInfo: {
      caffeineContent: "30mg per cup",
      caloriesPerServing: 2,
      allergens: []
    },
    originStory: "Hand-picked from the hills around West Lake in Hangzhou, following ancient traditions",
    seasonalAvailability: true,
    popularPairings: ["Sushi", "Light salads", "Steamed vegetables"]
  },
  {
    name: "Chamomile Dreams",
    description: "Caffeine-free herbal blend with chamomile flowers, lavender, and honey notes",
    basePrice: 4.75,
    productType: 'tea',
    preparationTimeMinutes: 6,
    brewingInstructions: {
      temperature: "100°C",
      steepingTime: "5-7 minutes",
      teaAmount: "1 tsp per cup"
    },
    nutritionalInfo: {
      caffeineContent: "Caffeine-free",
      caloriesPerServing: 0,
      allergens: []
    },
    originStory: "A soothing blend perfect for evening relaxation, crafted with organic flowers",
    seasonalAvailability: false,
    popularPairings: ["Honey cakes", "Vanilla cookies", "Meditation"]
  },
  {
    name: "Fresh Blueberry Scone",
    description: "Buttery scone loaded with fresh blueberries and a hint of lemon zest",
    basePrice: 3.25,
    productType: 'pastry',
    preparationTimeMinutes: 2,
    nutritionalInfo: {
      caloriesPerServing: 280,
      allergens: ["Gluten", "Dairy", "Eggs"]
    },
    originStory: "Made fresh daily with locally sourced blueberries",
    seasonalAvailability: true,
    popularPairings: ["Earl Grey", "English Breakfast", "Coffee"]
  },
  {
    name: "Almond Croissant",
    description: "Flaky pastry filled with sweet almond cream and topped with sliced almonds",
    basePrice: 4.00,
    productType: 'pastry',
    preparationTimeMinutes: 3,
    nutritionalInfo: {
      caloriesPerServing: 320,
      allergens: ["Gluten", "Dairy", "Eggs", "Nuts"]
    },
    originStory: "Traditional French recipe with premium almond paste",
    seasonalAvailability: false,
    popularPairings: ["Coffee", "Black tea", "Hot chocolate"]
  }
]

async function findOrganizationForUser() {
  try {
    console.log('🔍 Finding organization for santhoshlal@gmail.com...')
    
    // Step 1: Find the user in core_users
    const { data: coreUser, error: userError } = await supabaseAdmin
      .from('core_users')
      .select('id')
      .eq('email', 'santhoshlal@gmail.com')
      .single()

    if (userError || !coreUser) {
      console.error('❌ User not found:', userError)
      return null
    }

    console.log('✅ Found core user:', coreUser.id)

    // Step 2: Find user's organization
    const { data: userOrg, error: orgError } = await supabaseAdmin
      .from('user_organizations')
      .select(`
        organization_id,
        core_organizations!inner (
          id,
          org_name,
          org_code
        )
      `)
      .eq('user_id', coreUser.id)
      .eq('is_active', true)
      .single()

    if (orgError || !userOrg) {
      console.error('❌ Organization not found:', orgError)
      return null
    }

    console.log('✅ Found organization:', userOrg.core_organizations)
    return userOrg.organization_id

  } catch (error) {
    console.error('❌ Error finding organization:', error)
    return null
  }
}

async function findOrCreateCategory(organizationId, categoryName, categoryType) {
  try {
    // Check if category already exists
    const { data: existingCategory } = await supabaseAdmin
      .from('core_entities')
      .select('id')
      .eq('organization_id', organizationId)
      .eq('entity_type', 'product_category')
      .eq('entity_name', categoryName)
      .single()

    if (existingCategory) {
      console.log(`✅ Using existing category: ${categoryName}`)
      return existingCategory.id
    }

    // Create new category
    console.log(`📋 Creating category: ${categoryName}`)
    const categoryId = crypto.randomUUID()
    const categoryCode = generateEntityCode(categoryName, 'CAT')

    // Create category entity
    const { error: entityError } = await supabaseAdmin
      .from('core_entities')
      .insert({
        id: categoryId,
        organization_id: organizationId,
        entity_type: 'product_category',
        entity_name: categoryName,
        entity_code: categoryCode,
        is_active: true
      })

    if (entityError) {
      throw new Error(`Category entity creation failed: ${entityError.message}`)
    }

    // Create category metadata
    const { error: metadataError } = await supabaseAdmin
      .from('core_metadata')
      .insert({
        organization_id: organizationId,
        entity_type: 'product_category',
        entity_id: categoryId,
        metadata_type: 'category_details',
        metadata_category: 'menu',
        metadata_key: 'category_info',
        metadata_value: {
          description: `${categoryName} category`,
          category_type: categoryType,
          sort_order: categoryType === 'tea' ? 1 : 2
        },
        is_system_generated: false
      })

    if (metadataError) {
      console.error('⚠️ Category metadata creation failed:', metadataError)
    }

    console.log(`✅ Created category: ${categoryName}`)
    return categoryId

  } catch (error) {
    console.error(`❌ Error creating category ${categoryName}:`, error)
    throw error
  }
}

async function createProduct(organizationId, productData, categoryId) {
  try {
    console.log(`📋 Creating product: ${productData.name}`)
    const productId = crypto.randomUUID()
    const productCode = generateEntityCode(productData.name, 'PRD')

    // Create product entity
    const { error: entityError } = await supabaseAdmin
      .from('core_entities')
      .insert({
        id: productId,
        organization_id: organizationId,
        entity_type: 'product',
        entity_name: productData.name,
        entity_code: productCode,
        is_active: true
      })

    if (entityError) {
      throw new Error(`Product entity creation failed: ${entityError.message}`)
    }

    // Create product metadata
    const { error: metadataError } = await supabaseAdmin
      .from('core_metadata')
      .insert({
        organization_id: organizationId,
        entity_type: 'product',
        entity_id: productId,
        metadata_type: 'product_details',
        metadata_category: 'menu',
        metadata_key: 'product_info',
        metadata_value: {
          description: productData.description,
          category_id: categoryId,
          base_price: productData.basePrice,
          product_type: productData.productType,
          preparation_time_minutes: productData.preparationTimeMinutes,
          brewing_instructions: productData.brewingInstructions,
          nutritional_info: productData.nutritionalInfo,
          origin_story: productData.originStory,
          seasonal_availability: productData.seasonalAvailability,
          popular_pairings: productData.popularPairings,
          created_date: new Date().toISOString()
        },
        is_system_generated: false
      })

    if (metadataError) {
      console.error('⚠️ Product metadata creation failed:', metadataError)
    }

    console.log(`✅ Created product: ${productData.name}`)
    return productId

  } catch (error) {
    console.error(`❌ Error creating product ${productData.name}:`, error)
    throw error
  }
}

function generateEntityCode(name, type) {
  const baseCode = name.replace(/[^A-Z0-9]/gi, '').toUpperCase().slice(0, 8)
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `${baseCode}-${random}-${type}`
}

async function createTestProducts() {
  try {
    // Find organization
    const organizationId = await findOrganizationForUser()
    if (!organizationId) {
      console.error('❌ Cannot proceed without organization ID')
      return
    }

    console.log('🚀 Starting product creation for organization:', organizationId)

    // Create categories
    const teaCategoryId = await findOrCreateCategory(organizationId, 'Hot Beverages', 'tea')
    const pastryCategoryId = await findOrCreateCategory(organizationId, 'Pastries & Desserts', 'pastry')

    // Create products
    let createdCount = 0
    for (const productData of sampleProducts) {
      try {
        const categoryId = productData.productType === 'tea' ? teaCategoryId : pastryCategoryId
        await createProduct(organizationId, productData, categoryId)
        createdCount++
      } catch (error) {
        console.error(`Failed to create ${productData.name}:`, error.message)
      }
    }

    console.log(`\n🎉 Product creation complete!`)
    console.log(`✅ Created ${createdCount} out of ${sampleProducts.length} products`)
    console.log(`🔗 Test the products page: http://localhost:3000/restaurant/products`)
    
  } catch (error) {
    console.error('❌ Product creation failed:', error)
  }
}

// Run the test
createTestProducts().catch(console.error)