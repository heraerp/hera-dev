/**
 * Fix Recipe Service Key Usage
 * Ensure service key is properly configured for ingredient creation
 */

import { createClient } from '@supabase/supabase-js';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

// Service key client for admin operations
const supabaseAdmin = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    },
    global: {
      headers: {
        'apikey': process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY}`
      }
    }
  }
);

// Regular client for read operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const organizationId = '6fc73a3d-fe0a-45fa-9029-62a52df142e2';
const validUserId = '16848910-d8cf-462b-a4d2-f94ac253d698';

async function testServiceKeyAccess() {
  console.log('🔑 Testing service key access...\n');
  
  try {
    // Test 1: Verify service key configuration
    console.log('1️⃣ Verifying service key configuration...');
    console.log('   Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log('   Service Key:', process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY ? 'Configured ✅' : 'Missing ❌');
    console.log('   Anon Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Configured ✅' : 'Missing ❌');
    
    // Test 2: Test service key access to ingredients
    console.log('\n2️⃣ Testing service key access to ingredients...');
    const { data: adminIngredients, error: adminError } = await supabaseAdmin
      .from('core_entities')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('entity_type', 'ingredient');
    
    if (adminError) {
      console.error('❌ Service key access failed:', adminError);
      return;
    }
    
    console.log(`✅ Service key can access ${adminIngredients?.length || 0} ingredients`);
    
    // Test 3: Test anon key access
    console.log('\n3️⃣ Testing anon key access...');
    const { data: anonIngredients, error: anonError } = await supabase
      .from('core_entities')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('entity_type', 'ingredient');
    
    if (anonError) {
      console.error('❌ Anon key access failed:', anonError);
      console.log('💡 This is expected if RLS policies are not applied');
    } else {
      console.log(`✅ Anon key can access ${anonIngredients?.length || 0} ingredients`);
    }
    
    // Test 4: Create a test ingredient using service key
    console.log('\n4️⃣ Testing ingredient creation with service key...');
    const testIngredientId = crypto.randomUUID();
    const testIngredientCode = 'TEST-ING-001';
    
    // Create test ingredient
    const { error: createError } = await supabaseAdmin
      .from('core_entities')
      .insert({
        id: testIngredientId,
        organization_id: organizationId,
        entity_type: 'ingredient',
        entity_name: 'Test Ingredient',
        entity_code: testIngredientCode,
        is_active: true
      });
    
    if (createError) {
      console.error('❌ Failed to create test ingredient:', createError);
      return;
    }
    
    console.log('✅ Test ingredient created successfully');
    
    // Create test ingredient metadata
    const { error: metadataError } = await supabaseAdmin
      .from('core_metadata')
      .insert({
        organization_id: organizationId,
        entity_type: 'ingredient',
        entity_id: testIngredientId,
        metadata_type: 'ingredient_details',
        metadata_category: 'ingredient_information',
        metadata_key: 'ingredient_details',
        metadata_value: JSON.stringify({
          unit: 'kg',
          cost_per_unit: 5.00,
          supplier: 'Test Supplier',
          category: 'Test Category'
        }),
        created_by: validUserId
      });
    
    if (metadataError) {
      console.error('❌ Failed to create test metadata:', metadataError);
    } else {
      console.log('✅ Test metadata created successfully');
    }
    
    // Clean up test ingredient
    await supabaseAdmin
      .from('core_entities')
      .delete()
      .eq('id', testIngredientId);
    
    console.log('✅ Test ingredient cleaned up');
    
    // Test 5: Test the recipe management service pattern
    console.log('\n5️⃣ Testing recipe management service pattern...');
    
    // This is how the service should work
    const sampleIngredient = {
      name: 'Service Key Test Ingredient',
      unit: 'kg',
      cost_per_unit: 3.50,
      supplier: 'Test Supplier',
      category: 'Test Category',
      stock_level: 100,
      min_stock_level: 10
    };
    
    const ingredientId = crypto.randomUUID();
    const ingredientCode = `ING-${sampleIngredient.name.replace(/[^A-Z0-9]/gi, '').toUpperCase().slice(0, 6)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    
    try {
      // Create ingredient entity
      const { error: entityError } = await supabaseAdmin
        .from('core_entities')
        .insert({
          id: ingredientId,
          organization_id: organizationId,
          entity_type: 'ingredient',
          entity_name: sampleIngredient.name,
          entity_code: ingredientCode,
          is_active: true
        });
      
      if (entityError) {
        console.error('❌ Entity creation failed:', entityError);
        return;
      }
      
      // Create ingredient metadata
      const { error: detailsError } = await supabaseAdmin
        .from('core_metadata')
        .insert({
          organization_id: organizationId,
          entity_type: 'ingredient',
          entity_id: ingredientId,
          metadata_type: 'ingredient_details',
          metadata_category: 'ingredient_information',
          metadata_key: 'ingredient_details',
          metadata_value: JSON.stringify({
            unit: sampleIngredient.unit,
            cost_per_unit: sampleIngredient.cost_per_unit,
            supplier: sampleIngredient.supplier,
            category: sampleIngredient.category
          }),
          created_by: validUserId
        });
      
      if (detailsError) {
        console.error('❌ Details metadata creation failed:', detailsError);
        return;
      }
      
      // Create inventory metadata
      const { error: inventoryError } = await supabaseAdmin
        .from('core_metadata')
        .insert({
          organization_id: organizationId,
          entity_type: 'ingredient',
          entity_id: ingredientId,
          metadata_type: 'inventory_info',
          metadata_category: 'inventory',
          metadata_key: 'inventory_info',
          metadata_value: JSON.stringify({
            stock_level: sampleIngredient.stock_level,
            min_stock_level: sampleIngredient.min_stock_level,
            max_stock_level: sampleIngredient.stock_level * 2,
            reorder_point: sampleIngredient.min_stock_level,
            last_stock_update: new Date().toISOString()
          }),
          created_by: validUserId
        });
      
      if (inventoryError) {
        console.error('❌ Inventory metadata creation failed:', inventoryError);
        return;
      }
      
      console.log('✅ Full ingredient creation successful');
      
      // Clean up
      await supabaseAdmin
        .from('core_entities')
        .delete()
        .eq('id', ingredientId);
      
      console.log('✅ Test ingredient cleaned up');
      
    } catch (error) {
      console.error('❌ Service pattern test failed:', error);
    }
    
    console.log('\n🎉 Service key testing complete!');
    console.log('💡 Service key is properly configured and working.');
    console.log('💡 The recipe management system can create ingredients using the service key.');
    console.log('💡 Frontend access requires RLS policies for read operations.');
    
  } catch (error) {
    console.error('❌ Service key test failed:', error);
  }
}

testServiceKeyAccess();