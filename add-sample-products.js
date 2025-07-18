/**
 * Add Sample Products for Restaurant Orders
 * Toyota Method: Use UniversalCrudService to add products
 */

const { createClient } = require('@supabase/supabase-js');
const { randomUUID } = require('crypto');

// Setup environment
const supabase = createClient(
  'https://yslviohidtyqjmyslekz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlzbHZpb2hpZHR5cWpteXNsZWt6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTg5MzUyMSwiZXhwIjoyMDY3NDY5NTIxfQ.VQtaWocR7DBq4mMI0eqhd1caB3HU0pGbSB1rbkB0iUI'
);

const sampleProducts = [
  {
    name: 'Premium Jasmine Green Tea',
    category: 'Beverages',
    price: 4.50,
    description: 'Aromatic jasmine green tea with delicate floral notes',
    available: true,
    preparation_time: 3
  },
  {
    name: 'Fresh Blueberry Scone',
    category: 'Pastries',
    price: 3.25,
    description: 'Freshly baked scone with organic blueberries',
    available: true,
    preparation_time: 5
  },
  {
    name: 'Artisan Coffee Blend',
    category: 'Beverages',
    price: 5.00,
    description: 'House blend coffee with rich, full-bodied flavor',
    available: true,
    preparation_time: 4
  },
  {
    name: 'Chocolate Croissant',
    category: 'Pastries',
    price: 4.75,
    description: 'Buttery croissant filled with premium dark chocolate',
    available: true,
    preparation_time: 8
  },
  {
    name: 'Seasonal Fruit Smoothie',
    category: 'Beverages',
    price: 6.50,
    description: 'Refreshing smoothie made with seasonal fruits',
    available: true,
    preparation_time: 6
  }
];

async function addSampleProducts() {
  console.log('🏭 Toyota Method: Adding Sample Products...');
  
  try {
    // Get organization ID (you might need to update this)
    const organizationId = '7cc09b11-34c5-4299-b392-01a54ff84092'; // Demo Bakery
    
    console.log(`\n📦 Adding products for organization: ${organizationId}`);
    
    for (const product of sampleProducts) {
      const productId = randomUUID();
      
      console.log(`\n🔨 Creating product: ${product.name}...`);
      
      // Step 1: Create entity in core_entities
      const { error: entityError } = await supabase
        .from('core_entities')
        .insert({
          id: productId,
          organization_id: organizationId,
          entity_type: 'product',
          entity_name: product.name,
          entity_code: `PROD-${Date.now()}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`,
          is_active: true
        });
      
      if (entityError) {
        console.error(`❌ Failed to create entity for ${product.name}:`, entityError.message);
        continue;
      }
      
      // Step 2: Create dynamic data
      const dynamicData = [
        { entity_id: productId, field_name: 'category', field_value: product.category, field_type: 'text' },
        { entity_id: productId, field_name: 'price', field_value: product.price.toString(), field_type: 'number' },
        { entity_id: productId, field_name: 'description', field_value: product.description, field_type: 'text' },
        { entity_id: productId, field_name: 'available', field_value: product.available.toString(), field_type: 'boolean' },
        { entity_id: productId, field_name: 'preparation_time', field_value: product.preparation_time.toString(), field_type: 'number' }
      ];
      
      const { error: dataError } = await supabase
        .from('core_dynamic_data')
        .insert(dynamicData);
      
      if (dataError) {
        console.error(`❌ Failed to create dynamic data for ${product.name}:`, dataError.message);
        continue;
      }
      
      console.log(`✅ ${product.name} added successfully (ID: ${productId})`);
    }
    
    console.log('\n🎉 Sample products added successfully!');
    console.log('\n📍 Next steps:');
    console.log('1. Go to http://localhost:3000/restaurant/products to view products');
    console.log('2. Go to http://localhost:3000/restaurant/orders to create orders');
    console.log('3. Products should now be available for selection in orders');
    
    // Test: Query products to verify
    console.log('\n🔍 Verifying products...');
    const { data: products, error: queryError } = await supabase
      .from('core_entities')
      .select('id, entity_name, entity_code')
      .eq('organization_id', organizationId)
      .eq('entity_type', 'product')
      .eq('is_active', true);
    
    if (queryError) {
      console.error('❌ Failed to query products:', queryError.message);
    } else {
      console.log(`✅ Found ${products.length} products in database:`);
      products.forEach(p => console.log(`   - ${p.entity_name} (${p.entity_code})`));
    }
    
  } catch (error) {
    console.error('❌ Failed to add sample products:', error.message);
  }
}

addSampleProducts().then(() => process.exit(0));