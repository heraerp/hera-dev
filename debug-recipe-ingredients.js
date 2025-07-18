/**
 * Debug recipe ingredients and create sample data
 */

import { createClient } from '@supabase/supabase-js';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

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

async function debugRecipeIngredients() {
  console.log('🧪 Debugging recipe ingredients...\n');
  
  try {
    // Test 1: Check if we can access core_entities for ingredients
    console.log('1️⃣ Testing core_entities access for ingredients...');
    const { data: ingredientEntities, error: entitiesError } = await supabase
      .from('core_entities')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('entity_type', 'ingredient')
      .eq('is_active', true);
    
    if (entitiesError) {
      console.error('❌ Error accessing ingredient entities:', entitiesError);
      return;
    }
    
    console.log(`✅ Found ${ingredientEntities?.length || 0} ingredient entities`);
    
    // Test 2: Check metadata access
    if (ingredientEntities && ingredientEntities.length > 0) {
      console.log('\n2️⃣ Testing metadata access...');
      const entityIds = ingredientEntities.map(e => e.id);
      
      const { data: metadata, error: metadataError } = await supabase
        .from('core_metadata')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('entity_type', 'ingredient')
        .in('entity_id', entityIds);
      
      if (metadataError) {
        console.error('❌ Error accessing metadata:', metadataError);
        return;
      }
      
      console.log(`✅ Found ${metadata?.length || 0} metadata records`);
    }
    
    // Test 3: If no ingredients, create sample ingredients
    if (!ingredientEntities || ingredientEntities.length === 0) {
      console.log('\n3️⃣ No ingredients found, creating sample ingredients...');
      
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
              created_by: 'system' // Add required created_by field
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
              created_by: 'system' // Add required created_by field
            });
          
          if (inventoryError) {
            console.error(`❌ Error creating inventory for ${ingredient.name}:`, inventoryError);
            continue;
          }
          
          console.log(`✅ Created ingredient: ${ingredient.name} (${ingredientId})`);
          
        } catch (error) {
          console.error(`❌ Error creating ingredient ${ingredient.name}:`, error);
        }
      }
      
      console.log('\n🎉 Sample ingredients created successfully!');
    }
    
    // Test 4: Test the RecipeManagementService
    console.log('\n4️⃣ Testing RecipeManagementService...');
    
    // Import and test the service
    const { RecipeManagementService } = await import('./lib/services/recipeManagementService.ts');
    
    const ingredientsResult = await RecipeManagementService.getIngredients(organizationId);
    
    if (ingredientsResult.success) {
      console.log(`✅ RecipeManagementService returned ${ingredientsResult.ingredients?.length || 0} ingredients`);
      
      if (ingredientsResult.ingredients && ingredientsResult.ingredients.length > 0) {
        console.log('\n📋 Sample ingredients:');
        ingredientsResult.ingredients.slice(0, 3).forEach((ingredient, index) => {
          console.log(`   ${index + 1}. ${ingredient.name} - $${ingredient.cost_per_unit}/${ingredient.unit}`);
          console.log(`      Stock: ${ingredient.stock_level || 0} ${ingredient.unit}`);
          console.log(`      Supplier: ${ingredient.supplier}`);
          console.log(`      Category: ${ingredient.category}`);
        });
      }
    } else {
      console.error('❌ RecipeManagementService error:', ingredientsResult.error);
    }
    
    console.log('\n🎉 Debug complete! Recipe ingredients should now be available.');
    
  } catch (error) {
    console.error('❌ Debug error:', error);
  }
}

debugRecipeIngredients();