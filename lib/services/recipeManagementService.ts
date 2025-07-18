/**
 * Recipe Management Service - HERA Universal
 * Handles recipes, ingredients, costing, and inventory integration
 */

import { createClient } from '@/lib/supabase/client';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { HeraNamingConventionAI } from '@/lib/naming/heraNamingConvention';

const supabase = createClient();

// Admin client for RLS bypass on write operations
const supabaseAdmin = createSupabaseClient(
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

// Recipe Management Types
export interface Ingredient {
  id: string;
  name: string;
  unit: string;
  cost_per_unit: number;
  supplier: string;
  category: string;
  nutritional_info?: {
    calories_per_unit: number;
    protein_g: number;
    carbs_g: number;
    fat_g: number;
    fiber_g: number;
    sodium_mg: number;
  };
  stock_level?: number;
  min_stock_level?: number;
  max_stock_level?: number;
  reorder_point?: number;
  supplier_sku?: string;
  storage_location?: string;
  expiry_days?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface RecipeIngredient {
  id: string;
  ingredient_id: string;
  ingredient_name: string;
  quantity: number;
  unit: string;
  cost_per_unit: number;
  total_cost: number;
  preparation_notes?: string;
  is_optional?: boolean;
  substitutes?: string[];
}

export interface Recipe {
  id: string;
  name: string;
  description: string;
  category: string;
  menu_item_id?: string;
  serving_size: number;
  yield_servings?: number;
  prep_time_minutes: number;
  cook_time_minutes: number;
  total_time_minutes: number;
  difficulty_level: 'easy' | 'medium' | 'hard';
  skill_level_required?: string;
  equipment_needed?: string[];
  ingredients: RecipeIngredient[];
  instructions: string[];
  notes: string;
  chef_notes?: string;
  allergen_info?: string[];
  dietary_info?: string[];
  nutritional_info?: {
    calories_per_serving: number;
    protein_g: number;
    carbs_g: number;
    fat_g: number;
    fiber_g: number;
    sodium_mg: number;
    sugar_g: number;
    cholesterol_mg: number;
  };
  cost_analysis: {
    total_ingredient_cost: number;
    cost_per_serving: number;
    labor_cost_per_serving?: number;
    total_cost_per_serving: number;
    suggested_price: number;
    profit_margin: number;
    markup_percentage: number;
  };
  recipe_yield: {
    base_yield: number;
    scaling_factor: number;
    batch_size: number;
  };
  version: string;
  created_by: string;
  approved_by?: string;
  approval_date?: string;
  last_modified_by?: string;
  is_active: boolean;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface RecipeCreateInput {
  name: string;
  description: string;
  category: string;
  menu_item_id?: string;
  serving_size: number;
  prep_time_minutes: number;
  cook_time_minutes: number;
  difficulty_level: 'easy' | 'medium' | 'hard';
  ingredients: Omit<RecipeIngredient, 'id' | 'total_cost'>[];
  instructions: string[];
  notes?: string;
  allergen_info?: string[];
  dietary_info?: string[];
  equipment_needed?: string[];
}

export interface IngredientCreateInput {
  name: string;
  unit: string;
  cost_per_unit: number;
  supplier: string;
  category: string;
  nutritional_info?: {
    calories_per_unit: number;
    protein_g: number;
    carbs_g: number;
    fat_g: number;
    fiber_g: number;
    sodium_mg: number;
  };
  stock_level?: number;
  min_stock_level?: number;
  max_stock_level?: number;
  supplier_sku?: string;
  storage_location?: string;
  expiry_days?: number;
}

export interface RecipeScalingInput {
  recipe_id: string;
  target_servings: number;
  batch_multiplier?: number;
}

export interface PrepListInput {
  date: string;
  expected_orders: { recipe_id: string; quantity: number }[];
  prep_ahead_days?: number;
}

export class RecipeManagementService {
  /**
   * Entity types for recipe management
   */
  private static readonly ENTITY_TYPES = {
    RECIPE: 'recipe',
    INGREDIENT: 'ingredient',
    RECIPE_INGREDIENT: 'recipe_ingredient',
    PREP_LIST: 'prep_list',
    NUTRITION_DATA: 'nutrition_data',
    SUPPLIER: 'supplier',
    RECIPE_VERSION: 'recipe_version'
  };

  /**
   * Metadata types for recipe management
   */
  private static readonly METADATA_TYPES = {
    RECIPE_DETAILS: 'recipe_details',
    INGREDIENT_DETAILS: 'ingredient_details',
    COST_ANALYSIS: 'cost_analysis',
    NUTRITIONAL_INFO: 'nutritional_info',
    SCALING_INFO: 'scaling_info',
    SUPPLIER_INFO: 'supplier_info',
    INVENTORY_INFO: 'inventory_info',
    PREP_INSTRUCTIONS: 'prep_instructions'
  };

  /**
   * Create a new recipe
   */
  static async createRecipe(organizationId: string, recipeData: RecipeCreateInput): Promise<{
    success: boolean;
    recipeId?: string;
    error?: string;
  }> {
    try {
      console.log('🍳 Creating new recipe:', recipeData.name);

      // Validate naming convention
      const nameValidation = await HeraNamingConventionAI.validateFieldName('core_entities', 'entity_name');
      if (!nameValidation.isValid) {
        throw new Error(`Naming violation: ${nameValidation.error}`);
      }

      // Use API route instead of direct Supabase access
      const response = await fetch('/api/recipes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          organizationId,
          recipeData
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create recipe');
      }

      const { recipeId } = await response.json();

      console.log('✅ Recipe created successfully via API:', recipeId);
      return {
        success: true,
        recipeId
      };

    } catch (error) {
      console.error('Error creating recipe:', error);
      return {
        success: false,
        error: error.message || 'Failed to create recipe'
      };
    }
  }

  /**
   * Create a new ingredient
   */
  static async createIngredient(organizationId: string, ingredientData: IngredientCreateInput): Promise<{
    success: boolean;
    ingredientId?: string;
    error?: string;
  }> {
    try {
      console.log('🥕 Creating new ingredient:', ingredientData.name);

      // Validate naming convention
      const nameValidation = await HeraNamingConventionAI.validateFieldName('core_entities', 'entity_name');
      if (!nameValidation.isValid) {
        throw new Error(`Naming violation: ${nameValidation.error}`);
      }

      // Use API route instead of direct Supabase access
      const response = await fetch('/api/ingredients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          organizationId,
          ingredientData
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create ingredient');
      }

      const { ingredientId } = await response.json();

      console.log('✅ Ingredient created successfully via API:', ingredientId);
      return {
        success: true,
        ingredientId
      };

    } catch (error) {
      console.error('Error creating ingredient:', error);
      return {
        success: false,
        error: error.message || 'Failed to create ingredient'
      };
    }
  }

  /**
   * Get all recipes for an organization
   */
  static async getRecipes(organizationId: string): Promise<{
    success: boolean;
    recipes?: Recipe[];
    error?: string;
  }> {
    try {
      console.log('📖 Fetching recipes for organization:', organizationId);

      // Use API route instead of direct Supabase access
      const response = await fetch(`/api/recipes?organizationId=${organizationId}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch recipes');
      }

      const { recipes } = await response.json();
      
      console.log('✅ Recipes fetched successfully via API:', recipes.length);
      return {
        success: true,
        recipes: recipes || []
      };

    } catch (error) {
      console.error('Error fetching recipes:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch recipes'
      };
    }
  }

  /**
   * Get all ingredients for an organization
   */
  static async getIngredients(organizationId: string): Promise<{
    success: boolean;
    ingredients?: Ingredient[];
    error?: string;
  }> {
    try {
      console.log('🥕 Fetching ingredients for organization:', organizationId);

      // Use API route instead of direct Supabase access
      const response = await fetch(`/api/ingredients?organizationId=${organizationId}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch ingredients');
      }

      const { ingredients } = await response.json();
      
      console.log('✅ Ingredients fetched successfully via API:', ingredients.length);
      return {
        success: true,
        ingredients: ingredients || []
      };

    } catch (error) {
      console.error('Error fetching ingredients:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch ingredients'
      };
    }
  }

  /**
   * Calculate recipe cost analysis
   */
  static async calculateRecipeCost(ingredients: Omit<RecipeIngredient, 'id' | 'total_cost'>[]): Promise<any> {
    const totalIngredientCost = ingredients.reduce((total, ingredient) => {
      return total + (ingredient.quantity * ingredient.cost_per_unit);
    }, 0);

    const costPerServing = totalIngredientCost / (ingredients.length > 0 ? 1 : 1); // Assume 1 serving for now
    const laborCostPerServing = costPerServing * 0.3; // 30% labor cost
    const totalCostPerServing = costPerServing + laborCostPerServing;
    const suggestedPrice = totalCostPerServing * 2.5; // 2.5x markup
    const profitMargin = ((suggestedPrice - totalCostPerServing) / suggestedPrice) * 100;

    return {
      total_ingredient_cost: totalIngredientCost,
      cost_per_serving: costPerServing,
      labor_cost_per_serving: laborCostPerServing,
      total_cost_per_serving: totalCostPerServing,
      suggested_price: suggestedPrice,
      profit_margin: profitMargin,
      markup_percentage: 150 // 2.5x = 150% markup
    };
  }

  /**
   * Scale recipe for different serving sizes
   */
  static async scaleRecipe(recipeId: string, scalingInput: RecipeScalingInput): Promise<{
    success: boolean;
    scaledRecipe?: Recipe;
    error?: string;
  }> {
    try {
      console.log('📏 Scaling recipe:', recipeId, 'to', scalingInput.target_servings, 'servings');

      // Get original recipe
      const { data: recipe, error: recipeError } = await supabase
        .from('core_entities')
        .select('*')
        .eq('id', recipeId)
        .single();

      if (recipeError || !recipe) {
        throw new Error('Recipe not found');
      }

      // Get recipe metadata
      const { data: metadata, error: metadataError } = await supabase
        .from('core_metadata')
        .select('*')
        .eq('entity_id', recipeId)
        .eq('entity_type', this.ENTITY_TYPES.RECIPE);

      if (metadataError) {
        throw metadataError;
      }

      const recipeDetails = this.parseMetadata(metadata || [], this.METADATA_TYPES.RECIPE_DETAILS);
      const originalServings = recipeDetails?.serving_size || 1;
      const scalingFactor = scalingInput.target_servings / originalServings;

      // Get recipe ingredients
      const { data: ingredientEntities, error: ingredientError } = await supabase
        .from('core_entities')
        .select('*')
        .eq('organization_id', recipe.organization_id)
        .eq('entity_type', this.ENTITY_TYPES.RECIPE_INGREDIENT);

      if (ingredientError) {
        throw ingredientError;
      }

      // Get ingredient metadata
      const ingredientIds = ingredientEntities?.map(entity => entity.id) || [];
      const { data: ingredientMetadata, error: ingredientMetadataError } = await supabase
        .from('core_metadata')
        .select('*')
        .eq('entity_type', this.ENTITY_TYPES.RECIPE_INGREDIENT)
        .in('entity_id', ingredientIds);

      if (ingredientMetadataError) {
        throw ingredientMetadataError;
      }

      // Scale ingredients
      const scaledIngredients = ingredientMetadata
        ?.filter(m => {
          const details = this.parseMetadata([m], this.METADATA_TYPES.INGREDIENT_DETAILS);
          return details?.recipe_id === recipeId;
        })
        .map(m => {
          const details = this.parseMetadata([m], this.METADATA_TYPES.INGREDIENT_DETAILS);
          return {
            id: m.entity_id,
            ingredient_id: details?.ingredient_id || '',
            ingredient_name: details?.ingredient_name || '',
            quantity: (details?.quantity || 0) * scalingFactor,
            unit: details?.unit || '',
            cost_per_unit: details?.cost_per_unit || 0,
            total_cost: ((details?.quantity || 0) * scalingFactor) * (details?.cost_per_unit || 0),
            preparation_notes: details?.preparation_notes,
            is_optional: details?.is_optional || false,
            substitutes: details?.substitutes || []
          };
        }) || [];

      // Calculate new cost analysis
      const costAnalysis = await this.calculateRecipeCost(scaledIngredients);

      // Create scaled recipe object
      const scaledRecipe: Recipe = {
        id: recipe.id,
        name: recipe.entity_name,
        description: recipeDetails?.description || '',
        category: recipeDetails?.category || '',
        menu_item_id: recipeDetails?.menu_item_id,
        serving_size: scalingInput.target_servings,
        yield_servings: scalingInput.target_servings,
        prep_time_minutes: recipeDetails?.prep_time_minutes || 0,
        cook_time_minutes: recipeDetails?.cook_time_minutes || 0,
        total_time_minutes: recipeDetails?.total_time_minutes || 0,
        difficulty_level: recipeDetails?.difficulty_level || 'easy',
        skill_level_required: recipeDetails?.skill_level_required,
        equipment_needed: recipeDetails?.equipment_needed || [],
        ingredients: scaledIngredients,
        instructions: recipeDetails?.instructions || [],
        notes: recipeDetails?.notes || '',
        chef_notes: recipeDetails?.chef_notes,
        allergen_info: recipeDetails?.allergen_info || [],
        dietary_info: recipeDetails?.dietary_info || [],
        nutritional_info: recipeDetails?.nutritional_info,
        cost_analysis: costAnalysis,
        recipe_yield: {
          base_yield: originalServings,
          scaling_factor: scalingFactor,
          batch_size: scalingInput.target_servings
        },
        version: recipeDetails?.version || '1.0',
        created_by: recipeDetails?.created_by || 'system',
        approved_by: recipeDetails?.approved_by,
        approval_date: recipeDetails?.approval_date,
        last_modified_by: recipeDetails?.last_modified_by,
        is_active: recipe.is_active,
        is_published: recipeDetails?.is_published || false,
        created_at: recipe.created_at,
        updated_at: recipe.updated_at
      };

      console.log('✅ Recipe scaled successfully');
      return {
        success: true,
        scaledRecipe
      };

    } catch (error) {
      console.error('Error scaling recipe:', error);
      return {
        success: false,
        error: error.message || 'Failed to scale recipe'
      };
    }
  }

  /**
   * Generate prep list for a given date
   */
  static async generatePrepList(organizationId: string, prepInput: PrepListInput): Promise<{
    success: boolean;
    prepList?: any;
    error?: string;
  }> {
    try {
      console.log('📋 Generating prep list for:', prepInput.date);

      const prepList = {
        date: prepInput.date,
        prep_items: [],
        total_recipes: prepInput.expected_orders.length,
        prep_time_estimate: 0,
        shopping_list: []
      };

      // Process each expected order
      for (const order of prepInput.expected_orders) {
        // Get recipe details
        const recipeResult = await this.getRecipes(organizationId);
        if (!recipeResult.success) continue;

        const recipe = recipeResult.recipes?.find(r => r.id === order.recipe_id);
        if (!recipe) continue;

        // Scale recipe for required quantity
        const scaledRecipe = await this.scaleRecipe(order.recipe_id, {
          recipe_id: order.recipe_id,
          target_servings: order.quantity
        });

        if (scaledRecipe.success && scaledRecipe.scaledRecipe) {
          prepList.prep_items.push({
            recipe_id: order.recipe_id,
            recipe_name: recipe.name,
            quantity: order.quantity,
            ingredients: scaledRecipe.scaledRecipe.ingredients,
            prep_time: recipe.prep_time_minutes,
            instructions: recipe.instructions
          });

          prepList.prep_time_estimate += recipe.prep_time_minutes;
        }
      }

      console.log('✅ Prep list generated successfully');
      return {
        success: true,
        prepList
      };

    } catch (error) {
      console.error('Error generating prep list:', error);
      return {
        success: false,
        error: error.message || 'Failed to generate prep list'
      };
    }
  }

  /**
   * Helper functions
   */
  private static generateRecipeCode(name: string): string {
    const baseCode = name.replace(/[^A-Z0-9]/gi, '').toUpperCase().slice(0, 6);
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `RCP-${baseCode}-${random}`;
  }

  private static generateIngredientCode(name: string): string {
    const baseCode = name.replace(/[^A-Z0-9]/gi, '').toUpperCase().slice(0, 6);
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `ING-${baseCode}-${random}`;
  }

  private static parseMetadata(metadata: any[], metadataType: string): any {
    const meta = metadata.find(m => m.metadata_type === metadataType);
    if (!meta) return null;

    try {
      return typeof meta.metadata_value === 'string' 
        ? JSON.parse(meta.metadata_value) 
        : meta.metadata_value;
    } catch (error) {
      console.warn('Failed to parse metadata:', error);
      return null;
    }
  }
}