/**
 * Test recipe management service
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const organizationId = '6fc73a3d-fe0a-45fa-9029-62a52df142e2';

async function testRecipeService() {
  console.log('🧪 Testing recipe service...\n');
  
  try {
    // Test 1: Get ingredients using the service pattern
    console.log('1️⃣ Testing ingredient retrieval...');
    
    // Get ingredient entities
    const { data: ingredientEntities, error: entitiesError } = await supabase
      .from('core_entities')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('entity_type', 'ingredient')
      .eq('is_active', true);
    
    if (entitiesError) {
      console.error('❌ Error fetching entities:', entitiesError);
      return;
    }
    
    console.log(`✅ Found ${ingredientEntities?.length || 0} ingredient entities`);
    
    if (ingredientEntities && ingredientEntities.length > 0) {
      // Get metadata
      const entityIds = ingredientEntities.map(e => e.id);
      const { data: metadata, error: metadataError } = await supabase
        .from('core_metadata')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('entity_type', 'ingredient')
        .in('entity_id', entityIds);
      
      if (metadataError) {
        console.error('❌ Error fetching metadata:', metadataError);
        return;
      }
      
      console.log(`✅ Found ${metadata?.length || 0} metadata records`);
      
      // Transform to ingredients
      const ingredients = ingredientEntities.map(entity => {
        const entityMetadata = metadata?.filter(m => m.entity_id === entity.id) || [];
        
        // Find ingredient details
        const ingredientDetails = entityMetadata.find(m => m.metadata_type === 'ingredient_details');
        const inventoryInfo = entityMetadata.find(m => m.metadata_type === 'inventory_info');
        
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
          id: entity.id,
          name: entity.entity_name,
          unit: details.unit || '',
          cost_per_unit: details.cost_per_unit || 0,
          supplier: details.supplier || '',
          category: details.category || '',
          stock_level: inventory.stock_level || 0,
          min_stock_level: inventory.min_stock_level || 0,
          is_active: entity.is_active,
          created_at: entity.created_at,
          updated_at: entity.updated_at
        };
      });
      
      console.log('\n📋 Available ingredients:');
      ingredients.forEach((ingredient, index) => {
        console.log(`   ${index + 1}. ${ingredient.name}`);
        console.log(`      Unit: ${ingredient.unit}`);
        console.log(`      Cost: $${ingredient.cost_per_unit}/${ingredient.unit}`);
        console.log(`      Stock: ${ingredient.stock_level} ${ingredient.unit}`);
        console.log(`      Supplier: ${ingredient.supplier}`);
        console.log(`      Category: ${ingredient.category}`);
        console.log('');
      });
      
      console.log('🎉 Recipe service test completed successfully!');
      console.log('💡 You can now use these ingredients in the recipe management system.');
      
    } else {
      console.log('❌ No ingredient entities found');
    }
    
  } catch (error) {
    console.error('❌ Error testing recipe service:', error);
  }
}

testRecipeService();