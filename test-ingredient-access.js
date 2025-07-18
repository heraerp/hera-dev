/**
 * Test ingredient access after RLS policies
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const organizationId = '6fc73a3d-fe0a-45fa-9029-62a52df142e2';

async function testIngredientAccess() {
  console.log('🧪 Testing ingredient access...\n');
  
  try {
    // Test 1: Check ingredient entities access
    console.log('1️⃣ Testing ingredient entities access...');
    const { data: ingredients, error: ingredientsError } = await supabase
      .from('core_entities')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('entity_type', 'ingredient')
      .eq('is_active', true);
    
    if (ingredientsError) {
      console.error('❌ Error accessing ingredients:', ingredientsError);
      console.log('💡 Please apply the RLS policies from add-ingredient-rls-policies.sql');
      return;
    }
    
    console.log(`✅ Successfully accessed ${ingredients?.length || 0} ingredients`);
    
    if (ingredients && ingredients.length > 0) {
      // Test 2: Check metadata access
      console.log('\n2️⃣ Testing metadata access...');
      const entityIds = ingredients.map(i => i.id);
      
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
      
      console.log(`✅ Successfully accessed ${metadata?.length || 0} metadata records`);
      
      // Test 3: Show combined ingredient data
      console.log('\n3️⃣ Testing combined ingredient data...');
      const combinedIngredients = ingredients.map(ingredient => {
        const ingredientMetadata = metadata?.filter(m => m.entity_id === ingredient.id) || [];
        
        const ingredientDetails = ingredientMetadata.find(m => m.metadata_type === 'ingredient_details');
        const inventoryInfo = ingredientMetadata.find(m => m.metadata_type === 'inventory_info');
        
        let details = {};
        let inventory = {};
        
        if (ingredientDetails) {
          try {
            details = JSON.parse(ingredientDetails.metadata_value);
          } catch (e) {
            console.warn('Failed to parse ingredient details:', e);
          }
        }
        
        if (inventoryInfo) {
          try {
            inventory = JSON.parse(inventoryInfo.metadata_value);
          } catch (e) {
            console.warn('Failed to parse inventory info:', e);
          }
        }
        
        return {
          id: ingredient.id,
          name: ingredient.entity_name,
          unit: details.unit || '',
          cost_per_unit: details.cost_per_unit || 0,
          supplier: details.supplier || '',
          category: details.category || '',
          stock_level: inventory.stock_level || 0,
          min_stock_level: inventory.min_stock_level || 0
        };
      });
      
      console.log('✅ Combined ingredient data:');
      combinedIngredients.forEach((ingredient, index) => {
        console.log(`   ${index + 1}. ${ingredient.name} - $${ingredient.cost_per_unit}/${ingredient.unit}`);
        console.log(`      Stock: ${ingredient.stock_level} ${ingredient.unit}, Category: ${ingredient.category}`);
      });
      
      console.log('\n🎉 Ingredient access test completed successfully!');
      console.log('💡 The recipe management system should now work properly.');
      
    } else {
      console.log('❌ No ingredients found');
      console.log('💡 Please run cleanup-and-create-ingredients.js first');
    }
    
  } catch (error) {
    console.error('❌ Error testing ingredient access:', error);
  }
}

testIngredientAccess();