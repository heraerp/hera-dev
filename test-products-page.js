/**
 * Test the products page data loading
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

const ORGANIZATION_ID = '6fc73a3d-fe0a-45fa-9029-62a52df142e2'

async function testProductsPageData() {
  console.log('🧪 Testing products page data loading')
  console.log('=' .repeat(50))

  try {
    // Test 1: Get products using the same query as UniversalProductService
    console.log('\\n📦 Test 1: Loading products (core_entities)')
    const { data: entities, error: entitiesError } = await supabaseAdmin
      .from('core_entities')
      .select('*')
      .eq('organization_id', ORGANIZATION_ID)
      .eq('entity_type', 'product')
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (entitiesError) {
      console.error('❌ Error loading entities:', entitiesError)
      return
    }

    console.log(`✅ Found ${entities?.length || 0} product entities`)
    entities?.forEach((entity, index) => {
      console.log(`   ${index + 1}. ${entity.entity_name} (${entity.entity_code})`)
    })

    if (!entities || entities.length === 0) {
      console.log('❌ No products found!')
      return
    }

    // Test 2: Get metadata for products
    console.log('\\n📋 Test 2: Loading product metadata')
    const entityIds = entities.map(e => e.id)
    const { data: metadata, error: metadataError } = await supabaseAdmin
      .from('core_metadata')
      .select('entity_id, metadata_key, metadata_value, metadata_type, metadata_category')
      .eq('organization_id', ORGANIZATION_ID)
      .in('entity_id', entityIds)
      .eq('entity_type', 'product')
      .eq('metadata_type', 'product_details')
      .eq('metadata_key', 'product_info')

    if (metadataError) {
      console.error('❌ Error loading metadata:', metadataError)
      return
    }

    console.log(`✅ Found ${metadata?.length || 0} metadata records`)

    // Test 3: Simulate the UniversalProductService transformation
    console.log('\\n🔄 Test 3: Data transformation simulation')
    const metadataMap = new Map()
    metadata?.forEach(m => {
      metadataMap.set(m.entity_id, m)
    })

    const transformedProducts = entities.map(entity => {
      // Parse metadata
      let productInfo = {}
      const metadataEntry = metadataMap.get(entity.id)

      if (metadataEntry?.metadata_value) {
        try {
          productInfo = JSON.parse(metadataEntry.metadata_value)
        } catch (e) {
          console.warn('Failed to parse metadata for:', entity.entity_name)
        }
      }

      return {
        // Entity fields
        id: entity.id,
        entity_name: entity.entity_name,
        entity_code: entity.entity_code,
        is_active: entity.is_active,
        created_at: entity.created_at,
        updated_at: entity.updated_at,

        // Metadata fields
        category: productInfo.category || 'supplies',
        description: productInfo.description || '',
        price: productInfo.price || 0,
        preparation_time_minutes: productInfo.preparation_time_minutes || 0,
        status: productInfo.status || 'in_stock',
        inventory_count: productInfo.inventory_count || 0,
        minimum_stock: productInfo.minimum_stock || 0
      }
    })

    console.log(`✅ Transformed ${transformedProducts.length} products`)
    
    // Test 4: Show detailed product information
    console.log('\\n📋 Test 4: Product details')
    transformedProducts.forEach((product, index) => {
      console.log(`\\n   ${index + 1}. ${product.entity_name}`)
      console.log(`      - Price: ₹${product.price}`)
      console.log(`      - Category: ${product.category}`)
      console.log(`      - Status: ${product.status}`)
      console.log(`      - Description: ${product.description}`)
      console.log(`      - Prep Time: ${product.preparation_time_minutes}m`)
      console.log(`      - Stock: ${product.inventory_count}`)
    })

    // Test 5: Statistics
    console.log('\\n📊 Test 5: Catalog statistics')
    const stats = {
      totalProducts: transformedProducts.length,
      categories: [...new Set(transformedProducts.map(p => p.category))],
      averagePrice: transformedProducts.reduce((sum, p) => sum + p.price, 0) / transformedProducts.length,
      averagePrepTime: transformedProducts.reduce((sum, p) => sum + p.preparation_time_minutes, 0) / transformedProducts.length,
      stockStatus: {
        in_stock: transformedProducts.filter(p => p.status === 'in_stock').length,
        low_stock: transformedProducts.filter(p => p.status === 'low_stock').length,
        out_of_stock: transformedProducts.filter(p => p.status === 'out_of_stock').length
      }
    }

    console.log(`   - Total Products: ${stats.totalProducts}`)
    console.log(`   - Categories: ${stats.categories.length} (${stats.categories.join(', ')})`)
    console.log(`   - Average Price: ₹${stats.averagePrice.toFixed(2)}`)
    console.log(`   - Average Prep Time: ${stats.averagePrepTime.toFixed(1)}m`)
    console.log(`   - Stock Status:`)
    console.log(`     * In Stock: ${stats.stockStatus.in_stock}`)
    console.log(`     * Low Stock: ${stats.stockStatus.low_stock}`)
    console.log(`     * Out of Stock: ${stats.stockStatus.out_of_stock}`)

    console.log('\\n🎉 Products page data test completed successfully!')
    console.log('\\n🌐 You can now visit the products page at:')
    console.log('   http://localhost:3000/restaurant/products')
    console.log('\\n✅ Expected functionality:')
    console.log('   - View all products in grid/list view')
    console.log('   - Search products by name')
    console.log('   - Filter products by category')
    console.log('   - View product details')
    console.log('   - Edit and delete products')
    console.log('   - Create new products')
    console.log('   - View catalog statistics')

  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

// Run the test
testProductsPageData()