/**
 * Add more test products to ensure comprehensive testing of the products page
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

const TEST_EMAIL = 'santhoshlal@gmail.com'
const ORGANIZATION_ID = '6fc73a3d-fe0a-45fa-9029-62a52df142e2'

async function addMoreTestProducts() {
  console.log('🍃 Adding more test products for comprehensive testing')
  console.log('=' .repeat(50))

  try {
    // Get core user ID for created_by field
    const { data: coreUser, error: coreUserError } = await supabaseAdmin
      .from('core_users')
      .select('id')
      .eq('email', TEST_EMAIL)
      .single()
    
    if (coreUserError || !coreUser) {
      console.error('❌ Could not find core user for created_by field')
      return
    }
    
    const coreUserId = coreUser.id
    console.log('✅ Using core user ID for created_by:', coreUserId)

    // Additional test products for different categories and statuses
    const moreProducts = [
      {
        id: crypto.randomUUID(),
        entity_name: 'English Breakfast Tea',
        entity_code: 'TEA-005',
        metadata: {
          category: 'tea',
          description: 'Rich and malty blend perfect for morning',
          product_type: 'finished_good',
          price: 4.25,
          cost_per_unit: 1.05,
          inventory_count: 90,
          minimum_stock: 20,
          unit_type: 'servings',
          preparation_time_minutes: 4,
          serving_temperature: 'Hot (85-90°C)',
          caffeine_level: 'High',
          calories: 2,
          allergens: 'None',
          origin: 'Sri Lanka',
          supplier_name: 'Ceylon Tea Imports',
          storage_requirements: 'Airtight container',
          shelf_life_days: 1095,
          status: 'in_stock',
          is_draft: false,
          created_by: 'system',
          updated_by: 'system'
        }
      },
      {
        id: crypto.randomUUID(),
        entity_name: 'Lemon Tart',
        entity_code: 'PASTRY-003',
        metadata: {
          category: 'pastries',
          description: 'Tangy lemon curd in buttery pastry shell',
          product_type: 'finished_good',
          price: 4.50,
          cost_per_unit: 1.20,
          inventory_count: 12,
          minimum_stock: 8,
          unit_type: 'pieces',
          preparation_time_minutes: 1,
          serving_temperature: 'Room temperature',
          caffeine_level: 'None',
          calories: 320,
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
        id: crypto.randomUUID(),
        entity_name: 'Chocolate Chip Muffin',
        entity_code: 'PASTRY-004',
        metadata: {
          category: 'pastries',
          description: 'Moist vanilla muffin with chocolate chips',
          product_type: 'finished_good',
          price: 2.95,
          cost_per_unit: 0.75,
          inventory_count: 3,
          minimum_stock: 10,
          unit_type: 'pieces',
          preparation_time_minutes: 1,
          serving_temperature: 'Room temperature',
          caffeine_level: 'None',
          calories: 280,
          allergens: 'Gluten, Dairy, Eggs',
          origin: 'Local bakery',
          supplier_name: 'Artisan Bakehouse',
          storage_requirements: 'Room temperature display',
          shelf_life_days: 2,
          status: 'low_stock',
          is_draft: false,
          created_by: 'system',
          updated_by: 'system'
        }
      },
      {
        id: crypto.randomUUID(),
        entity_name: 'Oolong Tea',
        entity_code: 'TEA-006',
        metadata: {
          category: 'tea',
          description: 'Traditional Chinese semi-fermented tea',
          product_type: 'finished_good',
          price: 5.50,
          cost_per_unit: 1.45,
          inventory_count: 0,
          minimum_stock: 15,
          unit_type: 'servings',
          preparation_time_minutes: 4,
          serving_temperature: 'Hot (85°C)',
          caffeine_level: 'Medium',
          calories: 3,
          allergens: 'None',
          origin: 'Fujian Province, China',
          supplier_name: 'Golden Mountain Tea Co.',
          storage_requirements: 'Cool, dry place',
          shelf_life_days: 730,
          status: 'out_of_stock',
          is_draft: false,
          created_by: 'system',
          updated_by: 'system'
        }
      },
      {
        id: crypto.randomUUID(),
        entity_name: 'Disposable Napkins',
        entity_code: 'SUP-001',
        metadata: {
          category: 'supplies',
          description: 'Eco-friendly disposable napkins',
          product_type: 'packaging',
          price: 0.05,
          cost_per_unit: 0.02,
          inventory_count: 500,
          minimum_stock: 100,
          unit_type: 'pieces',
          preparation_time_minutes: 0,
          serving_temperature: 'Ambient',
          caffeine_level: 'None',
          calories: 0,
          allergens: 'None',
          origin: 'Sustainable Packaging Solutions',
          supplier_name: 'Green Pack Co.',
          storage_requirements: 'Dry storage',
          shelf_life_days: 1825,
          status: 'in_stock',
          is_draft: false,
          created_by: 'system',
          updated_by: 'system'
        }
      },
      {
        id: crypto.randomUUID(),
        entity_name: 'Seasonal Pumpkin Spice Tea',
        entity_code: 'TEA-007',
        metadata: {
          category: 'tea',
          description: 'Limited time autumn blend with pumpkin spice',
          product_type: 'finished_good',
          price: 4.95,
          cost_per_unit: 1.25,
          inventory_count: 25,
          minimum_stock: 10,
          unit_type: 'servings',
          preparation_time_minutes: 4,
          serving_temperature: 'Hot (85°C)',
          caffeine_level: 'Low',
          calories: 8,
          allergens: 'None',
          origin: 'Seasonal Blend',
          supplier_name: 'Herbal Wellness Co.',
          storage_requirements: 'Cool, dry place',
          shelf_life_days: 365,
          status: 'in_stock',
          is_draft: true, // Draft for testing
          created_by: 'system',
          updated_by: 'system'
        }
      }
    ]

    let createdCount = 0
    
    for (const product of moreProducts) {
      try {
        console.log(`🏗️ Creating product: ${product.entity_name}`)
        
        // Create product entity
        const { error: entityError } = await supabaseAdmin
          .from('core_entities')
          .insert({
            id: product.id,
            organization_id: ORGANIZATION_ID,
            entity_type: 'product',
            entity_name: product.entity_name,
            entity_code: product.entity_code,
            is_active: !product.metadata.is_draft, // inactive if draft
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })

        if (entityError) {
          console.error(`❌ Error creating entity for ${product.entity_name}:`, entityError)
          continue
        }

        // Create product metadata
        const { error: metadataError } = await supabaseAdmin
          .from('core_metadata')
          .insert({
            organization_id: ORGANIZATION_ID,
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

        if (metadataError) {
          console.error(`❌ Error creating metadata for ${product.entity_name}:`, metadataError)
          continue
        }

        console.log(`✅ Created product: ${product.entity_name}`)
        createdCount++
        
      } catch (error) {
        console.error(`❌ Error creating product ${product.entity_name}:`, error)
      }
    }

    console.log('\\n🎉 Additional products creation complete!')
    console.log(`✅ Created ${createdCount} additional products`)
    
    // Show final summary
    const { data: allProducts, error: summaryError } = await supabaseAdmin
      .from('core_entities')
      .select('id, entity_name, is_active')
      .eq('organization_id', ORGANIZATION_ID)
      .eq('entity_type', 'product')
      .order('entity_name')
    
    if (!summaryError && allProducts) {
      console.log('\\n📊 Final Product Summary:')
      console.log(`   - Total Products: ${allProducts.length}`)
      console.log(`   - Active Products: ${allProducts.filter(p => p.is_active).length}`)
      console.log(`   - Inactive Products: ${allProducts.filter(p => !p.is_active).length}`)
      
      console.log('\\n📋 All Products:')
      allProducts.forEach((product, index) => {
        const status = product.is_active ? '✅' : '❌'
        console.log(`   ${index + 1}. ${status} ${product.entity_name}`)
      })
    }
    
    console.log('\\n🌐 You can now test the products page at:')
    console.log('   http://localhost:3000/restaurant/products')
    
  } catch (error) {
    console.error('❌ Error adding more test products:', error)
  }
}

// Run the script
addMoreTestProducts()