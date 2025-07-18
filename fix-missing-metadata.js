/**
 * Fix missing metadata for products that were created without it
 */

import { createClient } from '@/lib/supabase/client';
const { createClient } = require('@supabase/supabase-js')

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

const ORGANIZATION_ID = '6fc73a3d-fe0a-45fa-9029-62a52df142e2'
const CORE_USER_ID = '97c87eca-24c9-4539-a542-acf65bc9b9c7'

async function fixMissingMetadata() {
  console.log('🔧 Fixing missing metadata for products')
  console.log('=' .repeat(50))

  try {
    // Get all products
    const { data: entities, error: entitiesError } = await supabaseAdmin
      .from('core_entities')
      .select('*')
      .eq('organization_id', ORGANIZATION_ID)
      .eq('entity_type', 'product')
      .eq('is_active', true)

    if (entitiesError) {
      console.error('❌ Error loading entities:', entitiesError)
      return
    }

    console.log(`✅ Found ${entities?.length || 0} product entities`)

    // Get existing metadata
    const { data: existingMetadata, error: metadataError } = await supabaseAdmin
      .from('core_metadata')
      .select('entity_id')
      .eq('organization_id', ORGANIZATION_ID)
      .eq('entity_type', 'product')
      .eq('metadata_type', 'product_details')
      .eq('metadata_key', 'product_info')

    if (metadataError) {
      console.error('❌ Error loading metadata:', metadataError)
      return
    }

    const existingEntityIds = new Set(existingMetadata?.map(m => m.entity_id) || [])
    const productsNeedingMetadata = entities?.filter(e => !existingEntityIds.has(e.id)) || []

    console.log(`✅ Found ${productsNeedingMetadata.length} products needing metadata`)

    // Default metadata for products based on name patterns
    const getDefaultMetadata = (productName, entityCode) => {
      const name = productName.toLowerCase()
      
      if (name.includes('tea')) {
        return {
          category: 'tea',
          description: `Premium ${productName} with authentic flavor`,
          product_type: 'finished_good',
          price: 4.50,
          cost_per_unit: 1.20,
          inventory_count: 100,
          minimum_stock: 20,
          unit_type: 'servings',
          preparation_time_minutes: 4,
          serving_temperature: 'Hot (85°C)',
          caffeine_level: 'Medium',
          calories: 3,
          allergens: 'None',
          origin: 'Premium Tea Gardens',
          supplier_name: 'Tea Imports Co.',
          storage_requirements: 'Cool, dry place',
          shelf_life_days: 730,
          status: 'in_stock',
          is_draft: false,
          created_by: 'system',
          updated_by: 'system'
        }
      }
      
      if (name.includes('scone') || name.includes('croissant') || name.includes('muffin') || name.includes('tart')) {
        return {
          category: 'pastries',
          description: `Fresh baked ${productName}`,
          product_type: 'finished_good',
          price: 3.50,
          cost_per_unit: 0.95,
          inventory_count: 20,
          minimum_stock: 5,
          unit_type: 'pieces',
          preparation_time_minutes: 2,
          serving_temperature: 'Room temperature',
          caffeine_level: 'None',
          calories: 300,
          allergens: 'Gluten, Dairy, Eggs',
          origin: 'Local bakery',
          supplier_name: 'Artisan Bakehouse',
          storage_requirements: 'Refrigerated display',
          shelf_life_days: 3,
          status: 'in_stock',
          is_draft: false,
          created_by: 'system',
          updated_by: 'system'
        }
      }
      
      if (name.includes('cup') || name.includes('napkin') || name.includes('supply')) {
        return {
          category: 'supplies',
          description: `${productName} for restaurant operations`,
          product_type: 'packaging',
          price: 0.15,
          cost_per_unit: 0.08,
          inventory_count: 100,
          minimum_stock: 50,
          unit_type: 'pieces',
          preparation_time_minutes: 0,
          serving_temperature: 'Ambient',
          caffeine_level: 'None',
          calories: 0,
          allergens: 'None',
          origin: 'Packaging Solutions',
          supplier_name: 'Restaurant Supply Co.',
          storage_requirements: 'Dry storage',
          shelf_life_days: 1825,
          status: 'in_stock',
          is_draft: false,
          created_by: 'system',
          updated_by: 'system'
        }
      }
      
      // Default fallback
      return {
        category: 'supplies',
        description: `${productName} - restaurant item`,
        product_type: 'finished_good',
        price: 5.00,
        cost_per_unit: 1.50,
        inventory_count: 50,
        minimum_stock: 10,
        unit_type: 'pieces',
        preparation_time_minutes: 5,
        serving_temperature: 'Room temperature',
        caffeine_level: 'None',
        calories: 0,
        allergens: 'None',
        origin: 'Local supplier',
        supplier_name: 'General Supplier',
        storage_requirements: 'Cool, dry place',
        shelf_life_days: 365,
        status: 'in_stock',
        is_draft: false,
        created_by: 'system',
        updated_by: 'system'
      }
    }

    // Add metadata for products that don't have it
    let fixedCount = 0
    for (const product of productsNeedingMetadata) {
      try {
        console.log(`🔧 Adding metadata for: ${product.entity_name}`)
        
        const metadata = getDefaultMetadata(product.entity_name, product.entity_code)
        
        const { error: insertError } = await supabaseAdmin
          .from('core_metadata')
          .insert({
            organization_id: ORGANIZATION_ID,
            entity_type: 'product',
            entity_id: product.id,
            metadata_type: 'product_details',
            metadata_category: 'catalog',
            metadata_key: 'product_info',
            metadata_value: JSON.stringify(metadata),
            is_system_generated: false,
            created_by: CORE_USER_ID,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })

        if (insertError) {
          console.error(`❌ Error adding metadata for ${product.entity_name}:`, insertError)
          continue
        }

        console.log(`✅ Added metadata for: ${product.entity_name}`)
        fixedCount++
        
      } catch (error) {
        console.error(`❌ Error processing ${product.entity_name}:`, error)
      }
    }

    console.log(`\\n🎉 Fixed metadata for ${fixedCount} products`)
    console.log('\\n🧪 Running verification test...')

    // Verify the fix
    const { data: allMetadata, error: verifyError } = await supabaseAdmin
      .from('core_metadata')
      .select('entity_id')
      .eq('organization_id', ORGANIZATION_ID)
      .eq('entity_type', 'product')
      .eq('metadata_type', 'product_details')
      .eq('metadata_key', 'product_info')

    if (verifyError) {
      console.error('❌ Verification failed:', verifyError)
      return
    }

    console.log(`✅ Verification passed: ${allMetadata?.length || 0} products now have metadata`)
    
    if (allMetadata?.length === entities?.length) {
      console.log('\\n🎉 All products now have complete metadata!')
      console.log('\\n🌐 The products page should now work properly at:')
      console.log('   http://localhost:3000/restaurant/products')
    } else {
      console.log(`\\n⚠️  Still missing metadata for ${(entities?.length || 0) - (allMetadata?.length || 0)} products`)
    }

  } catch (error) {
    console.error('❌ Fix failed:', error)
  }
}

// Run the fix
fixMissingMetadata()