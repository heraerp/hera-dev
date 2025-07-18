/**
 * Cleanup and create ingredients properly
 */

import { createClient } from '@supabase/supabase-js';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

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

const organizationId = '6fc73a3d-fe0a-45fa-9029-62a52df142e2';
const validUserId = '16848910-d8cf-462b-a4d2-f94ac253d698'; // Valid user ID from core_users

async function cleanupAndCreateIngredients() {
  console.log('🧹 Cleaning up and creating ingredients...\n');
  
  try {
    // Clean up existing ingredient entities
    console.log('1️⃣ Cleaning up existing ingredient entities...');
    const { error: cleanupError } = await supabaseAdmin
      .from('core_entities')
      .delete()
      .eq('organization_id', organizationId)
      .eq('entity_type', 'ingredient');
    
    if (cleanupError) {
      console.error('Error during cleanup:', cleanupError);
    } else {
      console.log('✅ Existing ingredient entities cleaned up');
    }
    
    // Create sample ingredients
    console.log('\n2️⃣ Creating sample ingredients...');
    
    const sampleIngredients = [
      {
        name: 'Wheat Flour',
        unit: 'kg',
        cost_per_unit: 2.50,
        supplier: 'Grain Mill Co',
        category: 'Flour & Grains',
        stock_level: 50,
        min_stock_level: 10
      },
      {
        name: 'Olive Oil',
        unit: 'L',
        cost_per_unit: 8.00,
        supplier: 'Mediterranean Foods',
        category: 'Cooking Oils',
        stock_level: 20,
        min_stock_level: 5
      },
      {
        name: 'Mozzarella Cheese',
        unit: 'kg',
        cost_per_unit: 12.00,
        supplier: 'Dairy Direct',
        category: 'Dairy',
        stock_level: 10,
        min_stock_level: 2
      },
      {
        name: 'Tomatoes',
        unit: 'kg',
        cost_per_unit: 3.50,
        supplier: 'Fresh Produce',
        category: 'Vegetables',
        stock_level: 25,
        min_stock_level: 5
      },
      {
        name: 'Salt',
        unit: 'kg',
        cost_per_unit: 1.00,
        supplier: 'Spice Wholesale',
        category: 'Herbs & Spices',
        stock_level: 5,
        min_stock_level: 1
      },
      {
        name: 'Black Pepper',
        unit: 'kg',
        cost_per_unit: 25.00,
        supplier: 'Spice Wholesale',
        category: 'Herbs & Spices',
        stock_level: 2,
        min_stock_level: 0.5
      },
      {
        name: 'Fresh Basil',
        unit: 'bunch',
        cost_per_unit: 2.00,
        supplier: 'Herb Garden',
        category: 'Herbs & Spices',
        stock_level: 15,
        min_stock_level: 3
      },
      {
        name: 'Garlic',
        unit: 'kg',
        cost_per_unit: 4.00,
        supplier: 'Fresh Produce',
        category: 'Vegetables',
        stock_level: 8,
        min_stock_level: 2
      },
      {
        name: 'Onions',
        unit: 'kg',
        cost_per_unit: 2.00,
        supplier: 'Fresh Produce',
        category: 'Vegetables',
        stock_level: 30,
        min_stock_level: 10
      },
      {
        name: 'Chicken Breast',
        unit: 'kg',
        cost_per_unit: 8.50,
        supplier: 'Meat Supply Co',
        category: 'Meat',
        stock_level: 15,
        min_stock_level: 5
      }
    ];
    
    for (const ingredient of sampleIngredients) {
      try {
        const ingredientId = crypto.randomUUID();
        const ingredientCode = `ING-${ingredient.name.replace(/[^A-Z0-9]/gi, '').toUpperCase().slice(0, 6)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
        
        // Create ingredient entity
        const { error: entityError } = await supabaseAdmin
          .from('core_entities')
          .insert({
            id: ingredientId,
            organization_id: organizationId,
            entity_type: 'ingredient',
            entity_name: ingredient.name,
            entity_code: ingredientCode,
            is_active: true
          });
        
        if (entityError) {
          console.error(`❌ Error creating entity for ${ingredient.name}:`, entityError);
          continue;
        }
        
        // Create ingredient details metadata
        const ingredientDetails = {
          unit: ingredient.unit,
          cost_per_unit: ingredient.cost_per_unit,
          supplier: ingredient.supplier,
          category: ingredient.category
        };
        
        const { error: metadataError } = await supabaseAdmin
          .from('core_metadata')
          .insert({
            organization_id: organizationId,
            entity_type: 'ingredient',
            entity_id: ingredientId,
            metadata_type: 'ingredient_details',
            metadata_category: 'ingredient_information',
            metadata_key: 'ingredient_details',
            metadata_value: JSON.stringify(ingredientDetails),
            created_by: validUserId
          });
        
        if (metadataError) {
          console.error(`❌ Error creating metadata for ${ingredient.name}:`, metadataError);
          continue;
        }
        
        // Create inventory information
        const inventoryInfo = {
          stock_level: ingredient.stock_level,
          min_stock_level: ingredient.min_stock_level,
          max_stock_level: ingredient.stock_level * 2,
          reorder_point: ingredient.min_stock_level,
          last_stock_update: new Date().toISOString()
        };
        
        const { error: inventoryError } = await supabaseAdmin
          .from('core_metadata')
          .insert({
            organization_id: organizationId,
            entity_type: 'ingredient',
            entity_id: ingredientId,
            metadata_type: 'inventory_info',
            metadata_category: 'inventory',
            metadata_key: 'inventory_info',
            metadata_value: JSON.stringify(inventoryInfo),
            created_by: validUserId
          });
        
        if (inventoryError) {
          console.error(`❌ Error creating inventory for ${ingredient.name}:`, inventoryError);
          continue;
        }
        
        console.log(`✅ Created ingredient: ${ingredient.name}`);
        
      } catch (error) {
        console.error(`❌ Error creating ingredient ${ingredient.name}:`, error);
      }
    }
    
    console.log('\n🎉 Sample ingredients created successfully!');
    
    // Verify creation
    console.log('\n3️⃣ Verifying ingredient creation...');
    const { data: entities, error: verifyError } = await supabaseAdmin
      .from('core_entities')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('entity_type', 'ingredient');
    
    if (verifyError) {
      console.error('❌ Error verifying ingredients:', verifyError);
    } else {
      console.log(`✅ Successfully created ${entities?.length || 0} ingredients`);
      
      if (entities && entities.length > 0) {
        console.log('\n📋 Created ingredients:');
        entities.forEach((entity, index) => {
          console.log(`   ${index + 1}. ${entity.entity_name} (${entity.entity_code})`);
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

cleanupAndCreateIngredients();