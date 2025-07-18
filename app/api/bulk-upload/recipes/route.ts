/**
 * Bulk Upload Recipes API Route
 * Handles bulk creation of recipes from Excel data
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Service key client for bypassing RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    },
    global: {
      headers: {
        'apikey': process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY!,
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY!}`
      }
    }
  }
);

export async function POST(request: NextRequest) {
  try {
    const { organizationId, recipes, recipeIngredients } = await request.json();
    
    if (!organizationId || !recipes || !Array.isArray(recipes) || !recipeIngredients || !Array.isArray(recipeIngredients)) {
      return NextResponse.json(
        { error: 'Organization ID, recipes array, and recipeIngredients array are required' },
        { status: 400 }
      );
    }

    console.log('📤 Bulk uploading', recipes.length, 'recipes for organization:', organizationId);

    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[],
      createdIds: [] as string[]
    };

    // First, get existing ingredients to validate recipe ingredients
    const { data: ingredientEntities, error: ingredientError } = await supabaseAdmin
      .from('core_entities')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('entity_type', 'ingredient')
      .eq('is_active', true);

    if (ingredientError) {
      throw new Error(`Failed to fetch ingredients: ${ingredientError.message}`);
    }

    // Get ingredient metadata
    const ingredientIds = ingredientEntities?.map(entity => entity.id) || [];
    const { data: ingredientMetadata, error: metadataError } = await supabaseAdmin
      .from('core_metadata')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('entity_type', 'ingredient')
      .in('entity_id', ingredientIds);

    if (metadataError) {
      throw new Error(`Failed to fetch ingredient metadata: ${metadataError.message}`);
    }

    // Build ingredient map
    const ingredientMap = new Map();
    ingredientEntities?.forEach(entity => {
      const entityMetadata = ingredientMetadata?.filter(m => m.entity_id === entity.id) || [];
      const ingredientDetails = entityMetadata.find(m => m.metadata_type === 'ingredient_details');
      
      let details = {};
      if (ingredientDetails) {
        try {
          details = JSON.parse(ingredientDetails.metadata_value);
        } catch (e) {
          console.warn('Failed to parse ingredient details:', e);
        }
      }

      ingredientMap.set(entity.entity_name.toLowerCase(), {
        id: entity.id,
        name: entity.entity_name,
        ...details
      });
    });

    // Process each recipe
    for (let i = 0; i < recipes.length; i++) {
      const recipe = recipes[i];
      
      try {
        // Validate required fields
        if (!recipe.name || !recipe.category || !recipe.serving_size || !recipe.prep_time_minutes || !recipe.cook_time_minutes) {
          throw new Error(`Row ${i + 1}: Missing required fields`);
        }

        // Get ingredients for this recipe
        const recipeIngredientsData = recipeIngredients.filter(ing => 
          ing.recipe_name.toLowerCase() === recipe.name.toLowerCase()
        );

        if (recipeIngredientsData.length === 0) {
          throw new Error(`Row ${i + 1}: No ingredients found for recipe ${recipe.name}`);
        }

        // Validate and prepare ingredients
        const processedIngredients = [];
        
        for (const recipeIngredient of recipeIngredientsData) {
          const existingIngredient = ingredientMap.get(recipeIngredient.ingredient_name.toLowerCase());
          
          if (!existingIngredient) {
            throw new Error(`Ingredient "${recipeIngredient.ingredient_name}" not found in inventory. Please add it first.`);
          }

          processedIngredients.push({
            ingredient_id: existingIngredient.id,
            ingredient_name: existingIngredient.name,
            quantity: parseFloat(recipeIngredient.quantity),
            unit: recipeIngredient.unit,
            cost_per_unit: existingIngredient.cost_per_unit,
            preparation_notes: recipeIngredient.preparation_notes,
            is_optional: recipeIngredient.is_optional || false,
            substitutes: recipeIngredient.substitutes ? recipeIngredient.substitutes.split(',').map(s => s.trim()) : []
          });
        }

        // Prepare recipe data
        const recipeData = {
          name: recipe.name,
          description: recipe.description || '',
          category: recipe.category,
          serving_size: parseInt(recipe.serving_size),
          prep_time_minutes: parseInt(recipe.prep_time_minutes),
          cook_time_minutes: parseInt(recipe.cook_time_minutes),
          difficulty_level: (recipe.difficulty_level || 'easy') as 'easy' | 'medium' | 'hard',
          ingredients: processedIngredients,
          instructions: recipe.instructions ? recipe.instructions.split('|').map(s => s.trim()) : [],
          notes: recipe.notes,
          allergen_info: recipe.allergen_info ? recipe.allergen_info.split(',').map(s => s.trim()) : [],
          dietary_info: recipe.dietary_info ? recipe.dietary_info.split(',').map(s => s.trim()) : [],
          equipment_needed: recipe.equipment_needed ? recipe.equipment_needed.split(',').map(s => s.trim()) : []
        };

        // Create recipe directly
        const recipeId = crypto.randomUUID();
        const recipeCode = `RCP-${recipe.name.replace(/[^A-Z0-9]/gi, '').toUpperCase().slice(0, 6)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

        // Calculate recipe costs
        const totalIngredientCost = processedIngredients.reduce((total, ingredient) => {
          return total + (ingredient.quantity * ingredient.cost_per_unit);
        }, 0);

        const costPerServing = totalIngredientCost / recipeData.serving_size;
        const laborCostPerServing = costPerServing * 0.3; // 30% labor cost
        const totalCostPerServing = costPerServing + laborCostPerServing;
        const suggestedPrice = totalCostPerServing * 2.5; // 2.5x markup
        const profitMargin = ((suggestedPrice - totalCostPerServing) / suggestedPrice) * 100;

        const costAnalysis = {
          total_ingredient_cost: totalIngredientCost,
          cost_per_serving: costPerServing,
          labor_cost_per_serving: laborCostPerServing,
          total_cost_per_serving: totalCostPerServing,
          suggested_price: suggestedPrice,
          profit_margin: profitMargin,
          markup_percentage: 150 // 2.5x = 150% markup
        };

        // Create recipe entity
        const { error: entityError } = await supabaseAdmin
          .from('core_entities')
          .insert({
            id: recipeId,
            organization_id: organizationId,
            entity_type: 'recipe',
            entity_name: recipeData.name,
            entity_code: recipeCode,
            is_active: true
          });

        if (entityError) {
          throw new Error(`Recipe entity creation failed: ${entityError.message}`);
        }

        // Create recipe details metadata
        const recipeDetails = {
          description: recipeData.description,
          category: recipeData.category,
          serving_size: recipeData.serving_size,
          prep_time_minutes: recipeData.prep_time_minutes,
          cook_time_minutes: recipeData.cook_time_minutes,
          total_time_minutes: recipeData.prep_time_minutes + recipeData.cook_time_minutes,
          difficulty_level: recipeData.difficulty_level,
          instructions: recipeData.instructions,
          notes: recipeData.notes,
          allergen_info: recipeData.allergen_info,
          dietary_info: recipeData.dietary_info,
          equipment_needed: recipeData.equipment_needed,
          version: '1.0',
          is_published: false
        };

        const { error: metadataError } = await supabaseAdmin
          .from('core_metadata')
          .insert({
            organization_id: organizationId,
            entity_type: 'recipe',
            entity_id: recipeId,
            metadata_type: 'recipe_details',
            metadata_category: 'recipe_information',
            metadata_key: 'recipe_details',
            metadata_value: JSON.stringify(recipeDetails),
            created_by: '16848910-d8cf-462b-a4d2-f94ac253d698' // Valid user ID
          });

        if (metadataError) {
          throw new Error(`Recipe metadata creation failed: ${metadataError.message}`);
        }

        // Create cost analysis metadata
        const { error: costError } = await supabaseAdmin
          .from('core_metadata')
          .insert({
            organization_id: organizationId,
            entity_type: 'recipe',
            entity_id: recipeId,
            metadata_type: 'cost_analysis',
            metadata_category: 'financial',
            metadata_key: 'cost_analysis',
            metadata_value: JSON.stringify(costAnalysis),
            created_by: '16848910-d8cf-462b-a4d2-f94ac253d698' // Valid user ID
          });

        if (costError) {
          throw new Error(`Cost analysis creation failed: ${costError.message}`);
        }

        // Create recipe ingredients
        for (const ingredient of processedIngredients) {
          const ingredientEntityId = crypto.randomUUID();
          
          // Create recipe ingredient entity
          const { error: ingredientEntityError } = await supabaseAdmin
            .from('core_entities')
            .insert({
              id: ingredientEntityId,
              organization_id: organizationId,
              entity_type: 'recipe_ingredient',
              entity_name: `${recipeData.name} - ${ingredient.ingredient_name}`,
              entity_code: `${recipeCode}-${ingredient.ingredient_name.substring(0, 3).toUpperCase()}`,
              is_active: true
            });

          if (ingredientEntityError) {
            throw new Error(`Recipe ingredient entity creation failed: ${ingredientEntityError.message}`);
          }

          // Create ingredient details metadata
          const ingredientDetails = {
            recipe_id: recipeId,
            ingredient_id: ingredient.ingredient_id,
            ingredient_name: ingredient.ingredient_name,
            quantity: ingredient.quantity,
            unit: ingredient.unit,
            cost_per_unit: ingredient.cost_per_unit,
            total_cost: ingredient.quantity * ingredient.cost_per_unit,
            preparation_notes: ingredient.preparation_notes,
            is_optional: ingredient.is_optional || false,
            substitutes: ingredient.substitutes || []
          };

          const { error: ingredientMetadataError } = await supabaseAdmin
            .from('core_metadata')
            .insert({
              organization_id: organizationId,
              entity_type: 'recipe_ingredient',
              entity_id: ingredientEntityId,
              metadata_type: 'ingredient_details',
              metadata_category: 'ingredient_information',
              metadata_key: 'ingredient_details',
              metadata_value: JSON.stringify(ingredientDetails),
              created_by: '16848910-d8cf-462b-a4d2-f94ac253d698' // Valid user ID
            });

          if (ingredientMetadataError) {
            throw new Error(`Recipe ingredient metadata creation failed: ${ingredientMetadataError.message}`);
          }
        }

        results.success++;
        results.createdIds.push(recipeId);
        console.log(`✅ Created recipe ${i + 1}/${recipes.length}: ${recipe.name}`);

      } catch (error) {
        results.failed++;
        results.errors.push(`Row ${i + 1} (${recipe.name || 'Unknown'}): ${error.message}`);
        console.error(`❌ Error processing recipe ${i + 1}:`, error);
      }
    }

    console.log(`📊 Bulk upload complete: ${results.success} success, ${results.failed} failed`);

    return NextResponse.json({
      success: true,
      message: `Bulk upload completed: ${results.success} recipes created, ${results.failed} failed`,
      results
    });

  } catch (error) {
    console.error('❌ Bulk upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error during bulk upload' },
      { status: 500 }
    );
  }
}

// GET - Check bulk upload status or get template
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'template') {
      // Return template information
      return NextResponse.json({
        template: {
          name: 'Recipe Template',
          sheets: [
            {
              name: 'Recipes',
              fields: [
                { name: 'name', required: true, type: 'string', description: 'Recipe name' },
                { name: 'description', required: false, type: 'string', description: 'Recipe description' },
                { name: 'category', required: true, type: 'string', description: 'Recipe category' },
                { name: 'serving_size', required: true, type: 'number', description: 'Number of servings' },
                { name: 'prep_time_minutes', required: true, type: 'number', description: 'Preparation time in minutes' },
                { name: 'cook_time_minutes', required: true, type: 'number', description: 'Cooking time in minutes' },
                { name: 'difficulty_level', required: false, type: 'string', description: 'easy, medium, or hard' },
                { name: 'instructions', required: false, type: 'string', description: 'Instructions separated by |' },
                { name: 'notes', required: false, type: 'string', description: 'Additional notes' },
                { name: 'allergen_info', required: false, type: 'string', description: 'Allergens separated by comma' },
                { name: 'dietary_info', required: false, type: 'string', description: 'Dietary info separated by comma' },
                { name: 'equipment_needed', required: false, type: 'string', description: 'Equipment separated by comma' }
              ]
            },
            {
              name: 'Recipe Ingredients',
              fields: [
                { name: 'recipe_name', required: true, type: 'string', description: 'Recipe name (must match Recipes sheet)' },
                { name: 'ingredient_name', required: true, type: 'string', description: 'Ingredient name (must exist in inventory)' },
                { name: 'quantity', required: true, type: 'number', description: 'Quantity needed' },
                { name: 'unit', required: true, type: 'string', description: 'Unit of measurement' },
                { name: 'preparation_notes', required: false, type: 'string', description: 'Preparation notes' },
                { name: 'is_optional', required: false, type: 'boolean', description: 'Whether ingredient is optional' },
                { name: 'substitutes', required: false, type: 'string', description: 'Substitutes separated by comma' }
              ]
            }
          ]
        }
      });
    }

    return NextResponse.json({
      message: 'Bulk upload API for recipes',
      endpoints: {
        POST: 'Upload recipes data',
        GET: 'Get template information'
      }
    });

  } catch (error) {
    console.error('❌ Error in bulk upload GET:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}