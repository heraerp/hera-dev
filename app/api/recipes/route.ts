/**
 * Recipes API Route
 * Handles recipe CRUD operations using service key to bypass RLS
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

// GET - Fetch all recipes for an organization
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');
    
    if (!organizationId) {
      return NextResponse.json(
        { error: 'Organization ID is required' },
        { status: 400 }
      );
    }

    console.log('🍳 API: Fetching recipes for organization:', organizationId);

    // Get recipe entities using service key
    const { data: recipeEntities, error: entitiesError } = await supabaseAdmin
      .from('core_entities')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('entity_type', 'recipe')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (entitiesError) {
      console.error('❌ Error fetching recipe entities:', entitiesError);
      return NextResponse.json(
        { error: 'Failed to fetch recipes' },
        { status: 500 }
      );
    }

    if (!recipeEntities || recipeEntities.length === 0) {
      return NextResponse.json({ recipes: [] });
    }

    // Get recipe metadata
    const entityIds = recipeEntities.map(entity => entity.id);
    const { data: metadata, error: metadataError } = await supabaseAdmin
      .from('core_metadata')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('entity_type', 'recipe')
      .in('entity_id', entityIds);

    if (metadataError) {
      console.error('❌ Error fetching recipe metadata:', metadataError);
      return NextResponse.json(
        { error: 'Failed to fetch recipe metadata' },
        { status: 500 }
      );
    }

    // Get recipe ingredients
    const { data: ingredientEntities, error: ingredientError } = await supabaseAdmin
      .from('core_entities')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('entity_type', 'recipe_ingredient')
      .eq('is_active', true);

    if (ingredientError) {
      console.error('❌ Error fetching recipe ingredients:', ingredientError);
      return NextResponse.json(
        { error: 'Failed to fetch recipe ingredients' },
        { status: 500 }
      );
    }

    // Get ingredient metadata
    const ingredientIds = ingredientEntities?.map(entity => entity.id) || [];
    const { data: ingredientMetadata, error: ingredientMetadataError } = await supabaseAdmin
      .from('core_metadata')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('entity_type', 'recipe_ingredient')
      .in('entity_id', ingredientIds);

    if (ingredientMetadataError) {
      console.error('❌ Error fetching ingredient metadata:', ingredientMetadataError);
      return NextResponse.json(
        { error: 'Failed to fetch ingredient metadata' },
        { status: 500 }
      );
    }

    // Transform to recipe objects
    const recipes = recipeEntities.map(entity => {
      const entityMetadata = metadata?.filter(m => m.entity_id === entity.id) || [];
      
      // Parse recipe details
      const recipeDetails = entityMetadata.find(m => m.metadata_type === 'recipe_details');
      const costAnalysis = entityMetadata.find(m => m.metadata_type === 'cost_analysis');
      const nutritionalInfo = entityMetadata.find(m => m.metadata_type === 'nutritional_info');
      
      let details = {};
      let costs = {};
      let nutrition = {};
      
      if (recipeDetails) {
        try {
          details = JSON.parse(recipeDetails.metadata_value);
        } catch (e) {
          console.warn('Failed to parse recipe details:', e);
        }
      }
      
      if (costAnalysis) {
        try {
          costs = JSON.parse(costAnalysis.metadata_value);
        } catch (e) {
          console.warn('Failed to parse cost analysis:', e);
        }
      }
      
      if (nutritionalInfo) {
        try {
          nutrition = JSON.parse(nutritionalInfo.metadata_value);
        } catch (e) {
          console.warn('Failed to parse nutritional info:', e);
        }
      }
      
      // Get ingredients for this recipe
      const recipeIngredients = ingredientMetadata
        ?.filter(m => {
          try {
            const ingredientDetails = JSON.parse(m.metadata_value);
            return ingredientDetails?.recipe_id === entity.id;
          } catch (e) {
            return false;
          }
        })
        .map(m => {
          try {
            const ingredientDetails = JSON.parse(m.metadata_value);
            return {
              id: m.entity_id,
              ingredient_id: ingredientDetails?.ingredient_id || '',
              ingredient_name: ingredientDetails?.ingredient_name || '',
              quantity: ingredientDetails?.quantity || 0,
              unit: ingredientDetails?.unit || '',
              cost_per_unit: ingredientDetails?.cost_per_unit || 0,
              total_cost: ingredientDetails?.total_cost || 0,
              preparation_notes: ingredientDetails?.preparation_notes,
              is_optional: ingredientDetails?.is_optional || false,
              substitutes: ingredientDetails?.substitutes || []
            };
          } catch (e) {
            console.warn('Failed to parse ingredient details:', e);
            return null;
          }
        })
        .filter(Boolean) || [];
      
      return {
        id: entity.id,
        name: entity.entity_name,
        description: details.description || '',
        category: details.category || '',
        menu_item_id: details.menu_item_id,
        serving_size: details.serving_size || 1,
        yield_servings: details.yield_servings,
        prep_time_minutes: details.prep_time_minutes || 0,
        cook_time_minutes: details.cook_time_minutes || 0,
        total_time_minutes: details.total_time_minutes || 0,
        difficulty_level: details.difficulty_level || 'easy',
        skill_level_required: details.skill_level_required,
        equipment_needed: details.equipment_needed || [],
        ingredients: recipeIngredients,
        instructions: details.instructions || [],
        notes: details.notes || '',
        chef_notes: details.chef_notes,
        allergen_info: details.allergen_info || [],
        dietary_info: details.dietary_info || [],
        nutritional_info: nutrition,
        cost_analysis: costs || {
          total_ingredient_cost: 0,
          cost_per_serving: 0,
          labor_cost_per_serving: 0,
          total_cost_per_serving: 0,
          suggested_price: 0,
          profit_margin: 0,
          markup_percentage: 0
        },
        recipe_yield: {
          base_yield: details.serving_size || 1,
          scaling_factor: 1,
          batch_size: 1
        },
        version: details.version || '1.0',
        created_by: details.created_by || 'system',
        approved_by: details.approved_by,
        approval_date: details.approval_date,
        last_modified_by: details.last_modified_by,
        is_active: entity.is_active,
        is_published: details.is_published || false,
        created_at: entity.created_at,
        updated_at: entity.updated_at
      };
    });

    console.log('✅ API: Successfully fetched', recipes.length, 'recipes');
    return NextResponse.json({ recipes });

  } catch (error) {
    console.error('❌ API: Error in GET /api/recipes:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create a new recipe
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { organizationId, recipeData } = body;
    
    if (!organizationId || !recipeData) {
      return NextResponse.json(
        { error: 'Organization ID and recipe data are required' },
        { status: 400 }
      );
    }

    console.log('🍳 API: Creating recipe:', recipeData.name);

    const recipeId = crypto.randomUUID();
    const recipeCode = `RCP-${recipeData.name.replace(/[^A-Z0-9]/gi, '').toUpperCase().slice(0, 6)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    // Calculate recipe costs
    const totalIngredientCost = recipeData.ingredients.reduce((total, ingredient) => {
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
      console.error('❌ Error creating recipe entity:', entityError);
      return NextResponse.json(
        { error: 'Failed to create recipe' },
        { status: 500 }
      );
    }

    // Create recipe details metadata
    const recipeDetails = {
      description: recipeData.description,
      category: recipeData.category,
      menu_item_id: recipeData.menu_item_id,
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
      console.error('❌ Error creating recipe metadata:', metadataError);
      return NextResponse.json(
        { error: 'Failed to create recipe metadata' },
        { status: 500 }
      );
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
      console.error('❌ Error creating cost analysis:', costError);
      return NextResponse.json(
        { error: 'Failed to create cost analysis' },
        { status: 500 }
      );
    }

    // Create recipe ingredients
    for (const ingredient of recipeData.ingredients) {
      const ingredientId = crypto.randomUUID();
      
      // Create recipe ingredient entity
      const { error: ingredientEntityError } = await supabaseAdmin
        .from('core_entities')
        .insert({
          id: ingredientId,
          organization_id: organizationId,
          entity_type: 'recipe_ingredient',
          entity_name: `${recipeData.name} - ${ingredient.ingredient_name}`,
          entity_code: `${recipeCode}-${ingredient.ingredient_name.substring(0, 3).toUpperCase()}`,
          is_active: true
        });

      if (ingredientEntityError) {
        console.error('❌ Error creating recipe ingredient entity:', ingredientEntityError);
        continue;
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
          entity_id: ingredientId,
          metadata_type: 'ingredient_details',
          metadata_category: 'ingredient_information',
          metadata_key: 'ingredient_details',
          metadata_value: JSON.stringify(ingredientDetails),
          created_by: '16848910-d8cf-462b-a4d2-f94ac253d698' // Valid user ID
        });

      if (ingredientMetadataError) {
        console.error('❌ Error creating ingredient metadata:', ingredientMetadataError);
        continue;
      }
    }

    console.log('✅ API: Successfully created recipe:', recipeId);
    return NextResponse.json({ 
      success: true, 
      recipeId,
      message: 'Recipe created successfully'
    });

  } catch (error) {
    console.error('❌ API: Error in POST /api/recipes:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}