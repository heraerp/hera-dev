/**
 * HERA Universal Menu Management Service
 * Toyota Production Technology: Standardized Work + Jidoka + Just-in-Time
 * 
 * Menu Management follows Toyota principles:
 * - Standardized Work: Consistent entity patterns
 * - Jidoka: Built-in quality and validation
 * - Just-in-Time: Dynamic loading and pricing
 * - Poka-yoke: Error prevention through validation
 */

import UniversalCrudService from './universalCrudService'
import { HeraNamingConventionAI } from '@/lib/naming/heraNamingConvention'

// ===========================================
// TOYOTA PRINCIPLE: STANDARDIZED WORK
// Standard entity types for menu management
// ===========================================

export const MENU_ENTITY_TYPES = {
  MENU_CATEGORY: 'menu_category',
  MENU_ITEM: 'menu_item',
  MENU_ITEM_VARIANT: 'menu_item_variant',
  MENU_MODIFIER_GROUP: 'menu_modifier_group',
  MENU_MODIFIER: 'menu_modifier',
  MENU_RECIPE: 'menu_recipe',
  MENU_INGREDIENT: 'menu_ingredient',
  MENU_PRICING_RULE: 'menu_pricing_rule'
} as const

export const MENU_METADATA_TYPES = {
  DISPLAY_CONFIG: 'display_config',
  NUTRITIONAL_INFO: 'nutritional_info',
  ALLERGEN_INFO: 'allergen_info',
  AVAILABILITY_RULES: 'availability_rules',
  PRICING_TIERS: 'pricing_tiers',
  PREPARATION_DETAILS: 'preparation_details',
  INVENTORY_IMPACT: 'inventory_impact',
  CHEF_NOTES: 'chef_notes',
  SUPPLIER_INFO: 'supplier_info',
  SEASONAL_AVAILABILITY: 'seasonal_availability',
  CUSTOMER_REVIEWS: 'customer_reviews',
  INGREDIENT_SOURCING: 'ingredient_sourcing',
  COOKING_METHODS: 'cooking_methods',
  DIETARY_CERTIFICATIONS: 'dietary_certifications',
  STORAGE_REQUIREMENTS: 'storage_requirements'
} as const

// ===========================================
// METADATA INTERFACES FOR RICH MENU DATA
// ===========================================

export interface NutritionalInfo {
  calories: number
  protein: number // grams
  carbohydrates: number // grams
  fat: number // grams
  fiber: number // grams
  sugar: number // grams
  sodium: number // milligrams
  saturated_fat?: number // grams
  trans_fat?: number // grams
  cholesterol?: number // milligrams
  vitamin_a?: number // %DV
  vitamin_c?: number // %DV
  calcium?: number // %DV
  iron?: number // %DV
  serving_size?: string
  calories_per_serving?: number
}

export interface AllergenInfo {
  contains_dairy: boolean
  contains_eggs: boolean
  contains_fish: boolean
  contains_shellfish: boolean
  contains_tree_nuts: boolean
  contains_peanuts: boolean
  contains_wheat: boolean
  contains_soy: boolean
  contains_sesame: boolean
  contains_gluten: boolean
  contains_alcohol: boolean
  may_contain?: string[] // Cross-contamination warnings
  allergen_free_certifications?: string[]
  preparation_warnings?: string[]
}

export interface PreparationDetails {
  cooking_methods: string[] // ['grilled', 'steamed', 'sautéed']
  equipment_required: string[] // ['grill', 'steamer', 'wok']
  skill_level: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  prep_time_minutes: number
  cook_time_minutes: number
  rest_time_minutes?: number
  total_time_minutes: number
  temperature_requirements?: {
    prep_temp?: string
    cook_temp?: string
    serve_temp?: string
  }
  special_instructions?: string[]
  quality_checkpoints?: string[]
  plating_instructions?: string
  garnish_requirements?: string[]
}

export interface AvailabilityRules {
  available_days: string[] // ['monday', 'tuesday', etc.]
  available_times: {
    breakfast?: { start: string; end: string }
    lunch?: { start: string; end: string }
    dinner?: { start: string; end: string }
    all_day?: boolean
  }
  seasonal_availability?: {
    available_months: number[] // [1, 2, 3] for Jan-Mar
    seasonal_notes?: string
  }
  special_occasions?: string[] // ['valentines', 'christmas']
  weather_dependent?: boolean
  inventory_dependent?: boolean
  minimum_notice_hours?: number
  maximum_daily_quantity?: number
}

export interface PricingTiers {
  regular_price: number
  happy_hour_price?: number
  lunch_special_price?: number
  bulk_order_discounts?: {
    quantity_threshold: number
    discount_percentage: number
  }[]
  member_discount_percentage?: number
  seasonal_pricing?: {
    season: string
    price_adjustment: number
    adjustment_type: 'percentage' | 'fixed'
  }[]
  dynamic_pricing_rules?: {
    demand_multiplier?: number
    time_based_adjustments?: Record<string, number>
  }
}

export interface ChefNotes {
  created_by: string
  created_at: string
  recipe_secrets?: string[]
  ingredient_substitutions?: Record<string, string>
  cooking_tips?: string[]
  presentation_notes?: string
  customer_feedback_integration?: string
  recipe_history?: string
  improvement_suggestions?: string[]
}

export interface SupplierInfo {
  primary_suppliers: {
    supplier_name: string
    contact_info: string
    ingredient_categories: string[]
    reliability_rating: number
    cost_rating: number
    quality_rating: number
  }[]
  backup_suppliers?: {
    supplier_name: string
    contact_info: string
    ingredient_categories: string[]
  }[]
  sourcing_requirements?: string[]
  organic_certifications?: string[]
  local_sourcing_percentage?: number
  sustainability_score?: number
}

export interface MenuItemMetadata {
  nutritional_info?: NutritionalInfo
  allergen_info?: AllergenInfo
  preparation_details?: PreparationDetails
  availability_rules?: AvailabilityRules
  pricing_tiers?: PricingTiers
  chef_notes?: ChefNotes
  supplier_info?: SupplierInfo
  dietary_certifications?: string[]
  storage_requirements?: string[]
  ingredient_sourcing?: Record<string, string>
  customer_reviews?: {
    average_rating: number
    review_count: number
    recent_feedback: string[]
  }
}

// ===========================================
// TOYOTA PRINCIPLE: JIDOKA (BUILT-IN QUALITY)
// Type definitions with validation
// ===========================================

export interface MenuCategory {
  id?: string
  name?: string
  entity_name?: string | null  // From core_entities table
  entity_code?: string | null  // From core_entities table
  description?: string
  display_order?: number
  is_active?: boolean
  icon?: string
  image_url?: string
  available_times?: string[] // ['breakfast', 'lunch', 'dinner']
  parent_category_id?: string // For sub-categories
  // Additional fields from core_entities
  organization_id?: string
  entity_type?: string
  created_at?: string
  updated_at?: string
}

export interface MenuItem {
  id?: string
  name?: string
  entity_name?: string | null  // From core_entities table
  entity_code?: string | null  // From core_entities table
  category_id: string
  description: string
  base_price: number
  image_url?: string
  preparation_time: number // minutes
  display_order: number
  is_active: boolean
  is_featured: boolean
  is_vegetarian: boolean
  is_vegan: boolean
  is_gluten_free: boolean
  spice_level?: 'mild' | 'medium' | 'hot' | 'extra_hot'
  calories?: number
  tags?: string[]
  available_times?: string[]
  recipe_id?: string
  // Additional fields from core_entities
  organization_id?: string
  entity_type?: string
  created_at?: string
  updated_at?: string
  // Rich metadata from core_metadata table
  metadata?: MenuItemMetadata
}

export interface MenuItemVariant {
  id?: string
  menu_item_id: string
  variant_name: string
  price_adjustment: number // Added to base price
  serving_size?: string
  is_default: boolean
  is_active: boolean
}

export interface MenuModifierGroup {
  id?: string
  name: string
  description?: string
  modifier_type: 'single_choice' | 'multiple_choice'
  is_required: boolean
  min_selections?: number
  max_selections?: number
  display_order: number
  is_active: boolean
}

export interface MenuModifier {
  id?: string
  modifier_group_id: string
  name: string
  description?: string
  price_adjustment: number
  is_default: boolean
  is_active: boolean
  display_order: number
  inventory_impact?: { product_id: string; quantity: number; unit: string }[]
}

export interface MenuRecipe {
  id?: string
  menu_item_id: string
  ingredients: {
    product_id: string
    quantity: number
    unit: string
    is_optional: boolean
  }[]
  instructions: string
  prep_time: number
  cook_time: number
  difficulty_level: 'easy' | 'medium' | 'hard'
  yield_quantity: number
  cost_per_serving?: number
}

export interface MenuPricingRule {
  id?: string
  name: string
  rule_type: 'time_based' | 'quantity_based' | 'customer_tier' | 'seasonal'
  conditions: Record<string, any>
  price_adjustment: number
  adjustment_type: 'percentage' | 'fixed_amount'
  is_active: boolean
  valid_from: string
  valid_until: string
}

// ===========================================
// TOYOTA PRINCIPLE: JUST-IN-TIME
// Menu Management Service with dynamic loading
// ===========================================

export class MenuManagementService {
  private static instance: MenuManagementService
  private organizationId: string

  private constructor(organizationId: string) {
    this.organizationId = organizationId
  }

  public static getInstance(organizationId: string): MenuManagementService {
    if (!MenuManagementService.instance) {
      MenuManagementService.instance = new MenuManagementService(organizationId)
    }
    return MenuManagementService.instance
  }

  // ===========================================
  // CATEGORY MANAGEMENT
  // ===========================================

  async createCategory(categoryData: MenuCategory) {
    console.log('🏭 Toyota Method: Creating menu category with standardized work...')
    
    try {
      // Apply Jidoka: Built-in quality checks
      this.validateCategoryData(categoryData)

      // Check for duplicate category names
      await this.checkDuplicateCategoryName(categoryData.name)

      // Call the API directly for better error handling
      const response = await fetch('/api/menu/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          organizationId: this.organizationId,
          name: categoryData.name,
          description: categoryData.description,
          displayOrder: categoryData.display_order,
          color: categoryData.icon, // Map icon to color for backwards compatibility
          icon: categoryData.icon,
          imageUrl: categoryData.image_url,
          availableTimes: categoryData.available_times,
          parentCategoryId: categoryData.parent_category_id
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create category')
      }

      console.log('✅ Toyota Method: Category created successfully')
      return { success: true, data: result.data }
    } catch (error) {
      console.error('❌ Toyota Method: Category creation failed:', error)
      throw error
    }
  }

  async updateCategory(categoryId: string, updates: Partial<MenuCategory>) {
    console.log('🏭 Toyota Method: Updating category with standardized work...')
    
    try {
      // Apply Jidoka: Validate updates
      if (updates.name) {
        this.validateCategoryData(updates as MenuCategory)
        // Check for duplicate name when updating
        await this.checkDuplicateCategoryName(updates.name, categoryId)
      }

      // Call the API directly for better error handling
      const response = await fetch(`/api/menu/categories/${categoryId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: updates.name,
          description: updates.description,
          displayOrder: updates.display_order,
          color: updates.icon, // Map icon to color for backwards compatibility
          icon: updates.icon,
          imageUrl: updates.image_url,
          availableTimes: updates.available_times,
          parentCategoryId: updates.parent_category_id
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update category')
      }

      console.log('✅ Toyota Method: Category updated successfully')
      return { success: true, data: result.data }
    } catch (error) {
      console.error('❌ Toyota Method: Category update failed:', error)
      throw error
    }
  }

  async getCategories(includeInactive = false) {
    console.log('🏭 Toyota Method: Fetching categories with Just-in-Time loading...')
    
    try {
      console.log('🍕 Menu Service: Organization ID:', this.organizationId)
      
      // Call the API directly for consistent results
      const response = await fetch(`/api/menu/categories?organizationId=${this.organizationId}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch categories')
      }

      const result = await response.json()

      // Filter inactive categories if needed
      if (result.success && result.data && !includeInactive) {
        result.data = result.data.filter((category: any) => category.isActive !== false)
      }

      // Sort by display_order on client side
      if (result.success && result.data) {
        result.data.sort((a: any, b: any) => (a.displayOrder || 0) - (b.displayOrder || 0))
      }

      console.log('✅ Toyota Method: Categories loaded successfully')
      return result
    } catch (error) {
      console.error('❌ Toyota Method: Categories loading failed:', error)
      throw error
    }
  }

  async deleteCategory(categoryId: string) {
    console.log('🏭 Toyota Method: Deleting category with dependency checks...')
    
    try {
      // Call the API directly for better error handling and dependency checks
      const response = await fetch(`/api/menu/categories/${categoryId}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (!response.ok) {
        // The API will return a detailed error message about items in the category
        throw new Error(result.error || 'Failed to delete category')
      }

      console.log('✅ Toyota Method: Category deleted successfully')
      return { success: true, message: result.message }
    } catch (error) {
      console.error('❌ Toyota Method: Category deletion failed:', error)
      throw error
    }
  }

  // ===========================================
  // MENU ITEM MANAGEMENT
  // ===========================================

  async createMenuItem(itemData: MenuItem) {
    console.log('🏭 Toyota Method: Creating menu item with standardized work...')
    
    try {
      // Apply Jidoka: Built-in quality checks
      this.validateMenuItemData(itemData)

      const result = await UniversalCrudService.createEntity({
        name: itemData.name || '',
        organizationId: this.organizationId,
        fields: {
          category_id: itemData.category_id,
          description: itemData.description,
          base_price: itemData.base_price,
          image_url: itemData.image_url,
          preparation_time: itemData.preparation_time,
          display_order: itemData.display_order,
          is_active: itemData.is_active,
          is_featured: itemData.is_featured,
          is_vegetarian: itemData.is_vegetarian,
          is_vegan: itemData.is_vegan,
          is_gluten_free: itemData.is_gluten_free,
          spice_level: itemData.spice_level,
          calories: itemData.calories,
          tags: JSON.stringify(itemData.tags || []),
          available_times: JSON.stringify(itemData.available_times || []),
          recipe_id: itemData.recipe_id
        }
      }, MENU_ENTITY_TYPES.MENU_ITEM)

      console.log('✅ Toyota Method: Menu item created successfully')
      return result
    } catch (error) {
      console.error('❌ Toyota Method: Menu item creation failed:', error)
      throw error
    }
  }

  async updateMenuItem(itemId: string, updates: Partial<MenuItem>) {
    console.log('🏭 Toyota Method: Updating menu item with standardized work...')
    
    try {
      // Apply Jidoka: Validate updates
      if (updates.base_price && updates.base_price < 0) {
        throw new Error('Base price cannot be negative')
      }

      const updateFields: Record<string, any> = {}
      
      if (updates.name) updateFields.name = updates.name
      if (updates.category_id) updateFields.category_id = updates.category_id
      if (updates.description) updateFields.description = updates.description
      if (updates.base_price !== undefined) updateFields.base_price = updates.base_price
      if (updates.image_url) updateFields.image_url = updates.image_url
      if (updates.preparation_time !== undefined) updateFields.preparation_time = updates.preparation_time
      if (updates.display_order !== undefined) updateFields.display_order = updates.display_order
      if (updates.is_active !== undefined) updateFields.is_active = updates.is_active
      if (updates.is_featured !== undefined) updateFields.is_featured = updates.is_featured
      if (updates.is_vegetarian !== undefined) updateFields.is_vegetarian = updates.is_vegetarian
      if (updates.is_vegan !== undefined) updateFields.is_vegan = updates.is_vegan
      if (updates.is_gluten_free !== undefined) updateFields.is_gluten_free = updates.is_gluten_free
      if (updates.spice_level) updateFields.spice_level = updates.spice_level
      if (updates.calories !== undefined) updateFields.calories = updates.calories
      if (updates.tags) updateFields.tags = JSON.stringify(updates.tags)
      if (updates.available_times) updateFields.available_times = JSON.stringify(updates.available_times)
      if (updates.recipe_id) updateFields.recipe_id = updates.recipe_id

      const result = await UniversalCrudService.updateEntity(
        this.organizationId,
        itemId,
        updateFields
      )

      console.log('✅ Toyota Method: Menu item updated successfully')
      return result
    } catch (error) {
      console.error('❌ Toyota Method: Menu item update failed:', error)
      throw error
    }
  }

  async getMenuItems(categoryId?: string, includeInactive = false) {
    console.log('🏭 Toyota Method: Fetching menu items with Just-in-Time loading...')
    
    try {
      const filters: Record<string, any> = {}
      
      if (categoryId) filters.category_id = categoryId
      if (!includeInactive) filters.is_active = true
      
      const result = await UniversalCrudService.listEntities(
        this.organizationId,
        MENU_ENTITY_TYPES.MENU_ITEM,
        {
          filters
        }
      )

      // Sort by display_order on client side
      if (result.success && result.data) {
        result.data.sort((a: any, b: any) => (a.display_order || 0) - (b.display_order || 0))
      }

      console.log('✅ Toyota Method: Menu items loaded successfully')
      return result
    } catch (error) {
      console.error('❌ Toyota Method: Menu items loading failed:', error)
      throw error
    }
  }

  async toggleMenuItemAvailability(itemId: string, available: boolean) {
    console.log('🏭 Toyota Method: Toggling item availability with Just-in-Time update...')
    
    try {
      const result = await UniversalCrudService.updateEntity(
        this.organizationId,
        itemId,
        { is_active: available }
      )

      console.log('✅ Toyota Method: Item availability updated successfully')
      return result
    } catch (error) {
      console.error('❌ Toyota Method: Item availability update failed:', error)
      throw error
    }
  }

  // ===========================================
  // MODIFIER GROUP MANAGEMENT
  // ===========================================

  async createModifierGroup(groupData: MenuModifierGroup) {
    console.log('🏭 Toyota Method: Creating modifier group with standardized work...')
    
    try {
      // Apply Jidoka: Built-in quality checks
      this.validateModifierGroupData(groupData)

      const result = await UniversalCrudService.createEntity({
        name: groupData.name,
        organizationId: this.organizationId,
        fields: {
          description: groupData.description,
          modifier_type: groupData.modifier_type,
          is_required: groupData.is_required,
          min_selections: groupData.min_selections,
          max_selections: groupData.max_selections,
          display_order: groupData.display_order,
          is_active: groupData.is_active
        }
      }, MENU_ENTITY_TYPES.MENU_MODIFIER_GROUP)

      console.log('✅ Toyota Method: Modifier group created successfully')
      return result
    } catch (error) {
      console.error('❌ Toyota Method: Modifier group creation failed:', error)
      throw error
    }
  }

  async createModifier(modifierData: MenuModifier) {
    console.log('🏭 Toyota Method: Creating modifier with standardized work...')
    
    try {
      // Apply Jidoka: Built-in quality checks
      this.validateModifierData(modifierData)

      const result = await UniversalCrudService.createEntity({
        name: modifierData.name,
        organizationId: this.organizationId,
        fields: {
          modifier_group_id: modifierData.modifier_group_id,
          description: modifierData.description,
          price_adjustment: modifierData.price_adjustment,
          is_default: modifierData.is_default,
          is_active: modifierData.is_active,
          display_order: modifierData.display_order,
          inventory_impact: JSON.stringify(modifierData.inventory_impact || [])
        }
      }, MENU_ENTITY_TYPES.MENU_MODIFIER)

      console.log('✅ Toyota Method: Modifier created successfully')
      return result
    } catch (error) {
      console.error('❌ Toyota Method: Modifier creation failed:', error)
      throw error
    }
  }

  async getModifierGroups(includeInactive = false) {
    console.log('🏭 Toyota Method: Fetching modifier groups with Just-in-Time loading...')
    
    try {
      const filters = includeInactive ? {} : { is_active: true }
      
      const result = await UniversalCrudService.listEntities(
        this.organizationId,
        MENU_ENTITY_TYPES.MENU_MODIFIER_GROUP,
        {
          filters
        }
      )

      console.log('✅ Toyota Method: Modifier groups loaded successfully')
      return result
    } catch (error) {
      console.error('❌ Toyota Method: Modifier groups loading failed:', error)
      throw error
    }
  }

  async getCombos(includeInactive = false) {
    console.log('🏭 Toyota Method: Fetching combo meals with Just-in-Time loading...')
    
    try {
      const filters = includeInactive ? {} : { is_active: true }
      
      const result = await UniversalCrudService.listEntities(
        this.organizationId,
        'combo_meal',
        {
          filters
        }
      )

      // Enhance each combo with component information
      if (result.success && result.data) {
        const enhancedCombos = await Promise.all(
          result.data.map(async (combo) => {
            const analysis = await this.getComboAnalysis(combo.id)
            return {
              ...combo,
              analysis: analysis.success ? analysis.data : null
            }
          })
        )
        
        result.data = enhancedCombos
      }

      console.log('✅ Toyota Method: Combo meals loaded successfully')
      return result
    } catch (error) {
      console.error('❌ Toyota Method: Combo meals loading failed:', error)
      throw error
    }
  }

  async getModifiers(groupId: string, includeInactive = false) {
    console.log('🏭 Toyota Method: Fetching modifiers with Just-in-Time loading...')
    
    try {
      const filters: Record<string, any> = { modifier_group_id: groupId }
      if (!includeInactive) filters.is_active = true
      
      const result = await UniversalCrudService.listEntities(
        this.organizationId,
        MENU_ENTITY_TYPES.MENU_MODIFIER,
        {
          filters
        }
      )

      console.log('✅ Toyota Method: Modifiers loaded successfully')
      return result
    } catch (error) {
      console.error('❌ Toyota Method: Modifiers loading failed:', error)
      throw error
    }
  }

  // ===========================================
  // PRICING MANAGEMENT
  // ===========================================

  async createPricingRule(ruleData: MenuPricingRule) {
    console.log('🏭 Toyota Method: Creating pricing rule with standardized work...')
    
    try {
      // Apply Jidoka: Built-in quality checks
      this.validatePricingRuleData(ruleData)

      const result = await UniversalCrudService.createEntity({
        name: ruleData.name,
        organizationId: this.organizationId,
        fields: {
          rule_type: ruleData.rule_type,
          conditions: JSON.stringify(ruleData.conditions),
          price_adjustment: ruleData.price_adjustment,
          adjustment_type: ruleData.adjustment_type,
          is_active: ruleData.is_active,
          valid_from: ruleData.valid_from,
          valid_until: ruleData.valid_until
        }
      }, MENU_ENTITY_TYPES.MENU_PRICING_RULE)

      console.log('✅ Toyota Method: Pricing rule created successfully')
      return result
    } catch (error) {
      console.error('❌ Toyota Method: Pricing rule creation failed:', error)
      throw error
    }
  }

  async calculateDynamicPrice(itemId: string, variantId?: string, modifiers: string[] = []) {
    console.log('🏭 Toyota Method: Calculating dynamic price with Just-in-Time processing...')
    
    try {
      // Get base item
      const item = await UniversalCrudService.readEntity(this.organizationId, itemId)
      if (!item.success || !item.data) {
        throw new Error('Menu item not found')
      }

      let totalPrice = parseFloat(item.data.base_price) || 0

      // Add variant price adjustment
      if (variantId) {
        const variant = await UniversalCrudService.readEntity(this.organizationId, variantId)
        if (variant.success && variant.data) {
          totalPrice += parseFloat(variant.data.price_adjustment) || 0
        }
      }

      // Add modifier price adjustments
      for (const modifierId of modifiers) {
        const modifier = await UniversalCrudService.readEntity(this.organizationId, modifierId)
        if (modifier.success && modifier.data) {
          totalPrice += parseFloat(modifier.data.price_adjustment) || 0
        }
      }

      // Apply pricing rules (time-based, quantity-based, etc.)
      const applicableRules = await this.getApplicablePricingRules(itemId)
      for (const rule of applicableRules) {
        if (rule.adjustment_type === 'percentage') {
          totalPrice = totalPrice * (1 + rule.price_adjustment / 100)
        } else {
          totalPrice += rule.price_adjustment
        }
      }

      console.log('✅ Toyota Method: Dynamic price calculated successfully')
      return {
        success: true,
        price: Math.round(totalPrice * 100) / 100, // Round to 2 decimal places
        breakdown: {
          base_price: parseFloat(item.data.base_price) || 0,
          variant_adjustment: variantId ? 'calculated' : 0,
          modifier_adjustments: modifiers.length,
          pricing_rules_applied: applicableRules.length
        }
      }
    } catch (error) {
      console.error('❌ Toyota Method: Dynamic price calculation failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  // ===========================================
  // COMBO MEAL CALCULATION SYSTEM
  // ===========================================

  /**
   * Calculate combo meal pricing with full component analysis
   * Matches your demo structure exactly
   */
  async calculateComboMealPrice(comboId: string, customizations?: Record<string, any>) {
    console.log('🏭 Toyota Method: Calculating combo meal price with complete analysis...')
    
    try {
      // Get combo meal entity
      const combo = await UniversalCrudService.readEntity(this.organizationId, comboId)
      if (!combo.success || !combo.data) {
        throw new Error('Combo meal not found')
      }

      // Get all component relationships
      const relationships = await this.getMenuRelationships(comboId, 'combo_component')
      if (!relationships.success || !relationships.data) {
        throw new Error('Combo components not found')
      }

      // Initialize calculation structure
      const calculation = {
        combo_name: combo.data.entity_name,
        combo_code: combo.data.entity_code,
        combo_price: parseFloat(combo.data.combo_price) || 0,
        components: [],
        individual_total: 0,
        savings: 0,
        savings_percentage: 0,
        nutritional_total: {
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0
        },
        ai_insights: null,
        customization_impact: 0
      }

      // Calculate each component
      for (const relationship of relationships.data) {
        const component = await UniversalCrudService.readEntity(this.organizationId, relationship.child_entity_id)
        if (!component.success || !component.data) continue

        const componentPrice = parseFloat(component.data.price) || 0
        const quantity = parseInt(relationship.relationship_data?.quantity) || 1
        const componentTotal = componentPrice * quantity

        // Get nutritional data if available
        const nutritionalData = await this.getMenuItemMetadata(component.data.id, 'nutritional_info')
        const nutrition = nutritionalData.success ? nutritionalData.data.nutritional_info : null

        const componentInfo = {
          id: component.data.id,
          name: component.data.entity_name,
          individual_price: componentPrice,
          quantity: quantity,
          total_price: componentTotal,
          role: this.getComponentRole(relationship.relationship_data),
          customizable: relationship.relationship_data?.customizable || false,
          nutrition: nutrition ? {
            calories: nutrition.calories * quantity,
            protein: nutrition.protein * quantity,
            carbs: nutrition.carbohydrates * quantity,
            fat: nutrition.fat * quantity
          } : null
        }

        calculation.components.push(componentInfo)
        calculation.individual_total += componentTotal

        // Add to nutritional totals
        if (nutrition) {
          calculation.nutritional_total.calories += nutrition.calories * quantity
          calculation.nutritional_total.protein += nutrition.protein * quantity
          calculation.nutritional_total.carbs += nutrition.carbohydrates * quantity
          calculation.nutritional_total.fat += nutrition.fat * quantity
        }
      }

      // Calculate savings
      calculation.savings = calculation.individual_total - calculation.combo_price
      calculation.savings_percentage = calculation.individual_total > 0 
        ? Math.round((calculation.savings / calculation.individual_total) * 100 * 100) / 100 
        : 0

      // Apply customizations if provided
      if (customizations) {
        const customizationResult = await this.applyComboCustomizations(calculation, customizations)
        calculation.customization_impact = customizationResult.price_impact
        calculation.combo_price += customizationResult.price_impact
      }

      // Get AI insights
      const aiInsights = await this.getMenuItemMetadata(comboId)
      if (aiInsights.success && aiInsights.data) {
        calculation.ai_insights = {
          performance: aiInsights.data.performance_analysis,
          customer_behavior: aiInsights.data.customer_behavior,
          health_data: aiInsights.data.nutrition_analysis
        }
      }

      console.log('✅ Toyota Method: Combo meal price calculated successfully')
      console.log('📊 Combo Analysis:', {
        combo: calculation.combo_name,
        components: calculation.components.length,
        individual_total: calculation.individual_total,
        combo_price: calculation.combo_price,
        savings: calculation.savings,
        savings_percentage: `${calculation.savings_percentage}%`
      })

      return {
        success: true,
        data: calculation
      }
    } catch (error) {
      console.error('❌ Toyota Method: Combo meal price calculation failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Get combo analysis with all component details
   */
  async getComboAnalysis(comboId: string) {
    console.log('🏭 Toyota Method: Getting combo analysis...')
    
    try {
      const calculation = await this.calculateComboMealPrice(comboId)
      
      if (!calculation.success || !calculation.data) {
        throw new Error('Failed to calculate combo price')
      }

      // Get organization settings for currency
      const orgSettings = await UniversalCrudService.readEntity(this.organizationId, this.organizationId)

      const analysis = {
        // Basic combo information
        combo_info: {
          name: calculation.data.combo_name,
          code: calculation.data.combo_code,
          restaurant: orgSettings.data?.org_name || 'Unknown',
          currency: orgSettings.data?.currency || 'USD'
        },

        // Pricing analysis
        pricing_analysis: {
          combo_price: calculation.data.combo_price,
          individual_total: calculation.data.individual_total,
          savings: calculation.data.savings,
          savings_percentage: calculation.data.savings_percentage
        },

        // Components breakdown
        components: calculation.data.components.map((comp: any) => ({
          id: comp.id,
          item: comp.name,
          individual_price: comp.individual_price,
          quantity: comp.quantity,
          role: comp.role,
          customizable: comp.customizable
        })),

        // Business intelligence
        business_intelligence: {
          value_proposition: calculation.data.savings_percentage > 15 ? 'Excellent' : 'Good',
          component_count: calculation.data.components.length
        }
      }

      return {
        success: true,
        data: analysis
      }
    } catch (error) {
      console.error('❌ Toyota Method: Combo analysis failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Get component role from relationship data
   */
  private getComponentRole(relationshipData: any) {
    if (relationshipData?.is_main) return 'main'
    if (relationshipData?.is_side) return 'side'
    if (relationshipData?.is_beverage) return 'beverage'
    return 'component'
  }

  /**
   * Apply customizations to combo calculation
   */
  private async applyComboCustomizations(calculation: any, customizations: Record<string, any>) {
    let priceImpact = 0

    // Process size changes
    if (customizations.size_upgrades) {
      for (const upgrade of customizations.size_upgrades) {
        priceImpact += upgrade.price_adjustment || 0
      }
    }

    // Process add-ons
    if (customizations.add_ons) {
      for (const addon of customizations.add_ons) {
        priceImpact += addon.price || 0
      }
    }

    // Process substitutions
    if (customizations.substitutions) {
      for (const substitution of customizations.substitutions) {
        priceImpact += substitution.price_difference || 0
      }
    }

    return {
      price_impact: priceImpact,
      applied_customizations: customizations
    }
  }

  /**
   * Create a new combo meal with automatic pricing calculation
   */
  async createComboMeal(comboData: {
    name: string
    description: string
    components: Array<{
      item_id: string
      quantity: number
      role: 'main' | 'side' | 'beverage'
      customizable?: boolean
    }>
    discount_percentage?: number
    image_url?: string
  }) {
    console.log('🏭 Toyota Method: Creating combo meal with automatic pricing...')
    
    try {
      // Step 1: Calculate individual component total
      let individualTotal = 0
      const componentDetails = []

      for (const component of comboData.components) {
        const item = await UniversalCrudService.readEntity(this.organizationId, component.item_id)
        if (!item.success || !item.data) continue

        const itemPrice = parseFloat(item.data.price) || 0
        const componentTotal = itemPrice * component.quantity

        individualTotal += componentTotal
        componentDetails.push({
          ...component,
          name: item.data.entity_name,
          individual_price: itemPrice,
          total_price: componentTotal
        })
      }

      // Step 2: Calculate combo price (apply discount)
      const discountPercentage = comboData.discount_percentage || 15 // Default 15% discount
      const comboPrice = individualTotal * (1 - discountPercentage / 100)
      const savings = individualTotal - comboPrice

      // Step 3: Create combo meal entity
      const comboResult = await UniversalCrudService.createEntity({
        name: comboData.name,
        organizationId: this.organizationId,
        fields: {
          description: comboData.description,
          combo_price: comboPrice,
          individual_total: individualTotal,
          savings: savings,
          savings_percentage: discountPercentage,
          discount_percentage: discountPercentage,
          image_url: comboData.image_url,
          is_active: true,
          is_combo: true,
          component_count: comboData.components.length
        }
      }, 'combo_meal')

      if (!comboResult.success || !comboResult.data) {
        throw new Error('Failed to create combo meal')
      }

      const comboId = comboResult.data

      // Step 4: Create component relationships
      for (const component of comboData.components) {
        await this.createMenuRelationship(
          comboId,
          component.item_id,
          'combo_contains',
          {
            quantity: component.quantity,
            role: component.role,
            customizable: component.customizable,
            [`is_${component.role}`]: true
          }
        )
      }

      // Step 5: Create AI metadata for business intelligence
      await this.createMenuItemMetadata(comboId, 'performance_analysis', {
        popularity: 0.75, // Default values
        profit_margin: discountPercentage / 100,
        customer_satisfaction: 4.2,
        reorder_rate: 0.65,
        peak_hours: ['12:00-14:00', '18:00-20:00'],
        component_count: comboData.components.length,
        savings_appeal: savings > 3 ? 'high' : 'moderate'
      })

      console.log('✅ Toyota Method: Combo meal created successfully')
      console.log('📊 Combo Details:', {
        name: comboData.name,
        components: componentDetails.length,
        individual_total: individualTotal,
        combo_price: comboPrice,
        savings: savings,
        discount: `${discountPercentage}%`
      })

      return {
        success: true,
        data: {
          combo_id: comboId,
          combo_price: comboPrice,
          individual_total: individualTotal,
          savings: savings,
          savings_percentage: discountPercentage,
          components: componentDetails
        }
      }
    } catch (error) {
      console.error('❌ Toyota Method: Combo meal creation failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Get comprehensive combo analysis (matches your demo queries)
   */
  async getComboAnalysis(comboId: string) {
    console.log('🏭 Toyota Method: Generating comprehensive combo analysis...')
    
    try {
      // Get combo calculation
      const calculation = await this.calculateComboMealPrice(comboId)
      if (!calculation.success) {
        throw new Error('Failed to calculate combo price')
      }

      // Get organization settings
      const orgSettings = await this.getOrganizationMenuSettings()
      
      // Build comprehensive analysis
      const analysis = {
        // Basic combo information
        combo_info: {
          name: calculation.data.combo_name,
          code: calculation.data.combo_code,
          restaurant: orgSettings.data?.org_name || 'Unknown',
          currency: orgSettings.data?.currency || 'USD'
        },

        // Pricing analysis (matches your demo structure)
        pricing_analysis: {
          combo_price: calculation.data.combo_price,
          individual_total: calculation.data.individual_total,
          savings: calculation.data.savings,
          savings_percentage: calculation.data.savings_percentage
        },

        // Components breakdown
        components: calculation.data.components.map(comp => ({
          item: comp.name,
          individual_price: comp.individual_price,
          quantity: comp.quantity,
          role: comp.role,
          customizable: comp.customizable
        })),

        // Nutritional analysis
        nutrition_analysis: {
          total_calories: calculation.data.nutritional_total.calories,
          protein: calculation.data.nutritional_total.protein,
          carbs: calculation.data.nutritional_total.carbs,
          fat: calculation.data.nutritional_total.fat,
          health_score: this.calculateHealthScore(calculation.data.nutritional_total)
        },

        // AI insights
        ai_insights: calculation.data.ai_insights,

        // Business intelligence
        business_intelligence: {
          value_proposition: calculation.data.savings_percentage > 15 ? 'Excellent' : 'Good',
          profit_margin: calculation.data.combo_price > 0 ? (calculation.data.savings / calculation.data.combo_price) : 0,
          component_balance: this.analyzeComponentBalance(calculation.data.components),
          upsell_potential: this.calculateUpsellPotential(calculation.data.components)
        }
      }

      console.log('✅ Toyota Method: Comprehensive combo analysis generated')
      return {
        success: true,
        data: analysis
      }
    } catch (error) {
      console.error('❌ Toyota Method: Combo analysis failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Calculate health score based on nutritional data
   */
  private calculateHealthScore(nutrition: any) {
    // Simple health score algorithm (can be enhanced)
    const calories = nutrition.calories || 0
    const protein = nutrition.protein || 0
    const carbs = nutrition.carbs || 0
    const fat = nutrition.fat || 0

    let score = 10 // Start with perfect score

    // Adjust based on calories (target: 500-800 for a meal)
    if (calories > 1000) score -= 2
    else if (calories > 1200) score -= 3

    // Adjust based on protein (target: 20-40g)
    if (protein < 15) score -= 1
    else if (protein > 45) score -= 1

    // Adjust based on fat (target: <30% of calories)
    const fatPercentage = (fat * 9) / calories * 100
    if (fatPercentage > 35) score -= 2

    return Math.max(0, Math.min(10, score))
  }

  /**
   * Analyze component balance (main, side, beverage)
   */
  private analyzeComponentBalance(components: any[]) {
    const roles = components.map(c => c.role)
    const hasMain = roles.includes('main')
    const hasSide = roles.includes('side')
    const hasBeverage = roles.includes('beverage')

    if (hasMain && hasSide && hasBeverage) return 'Perfect Balance'
    if (hasMain && (hasSide || hasBeverage)) return 'Good Balance'
    return 'Needs Improvement'
  }

  /**
   * Calculate upsell potential based on components
   */
  private calculateUpsellPotential(components: any[]) {
    const customizableItems = components.filter(c => c.customizable).length
    const averagePrice = components.reduce((sum, c) => sum + c.individual_price, 0) / components.length

    if (customizableItems > 2 && averagePrice > 8) return 'High'
    if (customizableItems > 1 || averagePrice > 5) return 'Medium'
    return 'Low'
  }

  private async getApplicablePricingRules(itemId: string) {
    // Get all active pricing rules
    const rules = await UniversalCrudService.listEntities(
      this.organizationId,
      MENU_ENTITY_TYPES.MENU_PRICING_RULE,
      {
        filters: { is_active: true }
      }
    )

    const currentTime = new Date().toISOString()
    const applicableRules: any[] = []

    if (rules.success && rules.data) {
      for (const rule of rules.data) {
        // Check if rule is currently valid
        if (rule.valid_from <= currentTime && rule.valid_until >= currentTime) {
          // Additional logic to check if rule applies to this item
          // (time-based, customer-tier, etc.)
          applicableRules.push(rule)
        }
      }
    }

    return applicableRules
  }

  // ===========================================
  // RELATIONSHIP MANAGEMENT
  // ===========================================

  /**
   * Create a relationship between menu entities
   */
  async createMenuRelationship(
    parentEntityId: string,
    childEntityId: string,
    relationshipType: string,
    relationshipData: any = {}
  ) {
    console.log('🏭 Toyota Method: Creating menu relationship...')
    
    try {
      const result = await UniversalCrudService.createEntity({
        name: `${relationshipType}_relationship`,
        organizationId: this.organizationId,
        fields: {
          parent_entity_id: parentEntityId,
          child_entity_id: childEntityId,
          relationship_type: relationshipType,
          relationship_data: JSON.stringify(relationshipData),
          relationship_score: 1.0,
          is_active: true,
          depth_level: 2,
          is_terminal_node: false
        }
      }, 'relationship')

      console.log('✅ Toyota Method: Menu relationship created successfully')
      return result
    } catch (error) {
      console.error('❌ Toyota Method: Menu relationship creation failed:', error)
      throw error
    }
  }

  /**
   * Get relationships for a menu entity
   */
  async getMenuRelationships(entityId: string, relationshipType?: string) {
    console.log('🏭 Toyota Method: Fetching menu relationships...')
    
    try {
      const filters: Record<string, any> = { 
        parent_entity_id: entityId,
        is_active: true
      }
      
      if (relationshipType) {
        filters.relationship_type = relationshipType
      }

      const result = await UniversalCrudService.listEntities(
        this.organizationId,
        'relationship',
        { filters }
      )

      if (result.success && result.data) {
        // Parse relationship data
        result.data = result.data.map((rel: any) => ({
          ...rel,
          relationship_data: typeof rel.relationship_data === 'string' 
            ? JSON.parse(rel.relationship_data) 
            : rel.relationship_data
        }))
      }

      console.log('✅ Toyota Method: Menu relationships fetched successfully')
      return result
    } catch (error) {
      console.error('❌ Toyota Method: Menu relationships fetch failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  // ===========================================
  // METADATA MANAGEMENT
  // ===========================================

  /**
   * Create metadata for a menu item
   */
  async createMenuItemMetadata(
    entityId: string, 
    metadataType: string, 
    metadataValue: any
  ) {
    console.log('🏭 Toyota Method: Creating menu item metadata...')
    
    try {
      // Validate metadata type
      if (!Object.values(MENU_METADATA_TYPES).includes(metadataType as any)) {
        throw new Error(`Invalid metadata type: ${metadataType}`)
      }

      const result = await UniversalCrudService.createEntity({
        name: `${metadataType}_${entityId}`,
        organizationId: this.organizationId,
        fields: {
          entity_type: 'metadata',
          entity_id: entityId,
          metadata_type: metadataType,
          metadata_key: metadataType,
          metadata_value: JSON.stringify(metadataValue),
          ai_generated: false,
          ai_confidence_score: null,
          is_active: true
        }
      }, 'metadata')

      console.log('✅ Toyota Method: Menu item metadata created successfully')
      return result
    } catch (error) {
      console.error('❌ Toyota Method: Menu item metadata creation failed:', error)
      throw error
    }
  }

  /**
   * Update metadata for a menu item
   */
  async updateMenuItemMetadata(
    entityId: string, 
    metadataType: string, 
    metadataValue: any
  ) {
    console.log('🏭 Toyota Method: Updating menu item metadata...')
    
    try {
      // Find existing metadata
      const existingMetadata = await UniversalCrudService.listEntities(
        this.organizationId,
        'metadata',
        {
          filters: { 
            entity_id: entityId,
            metadata_type: metadataType
          }
        }
      )

      if (existingMetadata.success && existingMetadata.data && existingMetadata.data.length > 0) {
        // Update existing metadata
        const metadataId = existingMetadata.data[0].id
        const result = await UniversalCrudService.updateEntity(
          this.organizationId,
          metadataId,
          {
            metadata_value: JSON.stringify(metadataValue)
          }
        )
        
        console.log('✅ Toyota Method: Menu item metadata updated successfully')
        return result
      } else {
        // Create new metadata if it doesn't exist
        return await this.createMenuItemMetadata(entityId, metadataType, metadataValue)
      }
    } catch (error) {
      console.error('❌ Toyota Method: Menu item metadata update failed:', error)
      throw error
    }
  }

  /**
   * Get metadata for a menu item
   */
  async getMenuItemMetadata(entityId: string, metadataType?: string) {
    console.log('🏭 Toyota Method: Fetching menu item metadata...')
    
    try {
      const filters: Record<string, any> = { entity_id: entityId }
      if (metadataType) {
        filters.metadata_type = metadataType
      }

      const result = await UniversalCrudService.listEntities(
        this.organizationId,
        'metadata',
        { filters }
      )

      if (result.success && result.data) {
        const metadata: Record<string, any> = {}
        
        result.data.forEach(item => {
          try {
            metadata[item.metadata_type] = JSON.parse(item.metadata_value)
          } catch (error) {
            console.warn(`Failed to parse metadata for ${item.metadata_type}:`, error)
            metadata[item.metadata_type] = item.metadata_value
          }
        })

        console.log('✅ Toyota Method: Menu item metadata fetched successfully')
        return {
          success: true,
          data: metadata
        }
      }

      return { success: true, data: {} }
    } catch (error) {
      console.error('❌ Toyota Method: Menu item metadata fetch failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Delete metadata for a menu item
   */
  async deleteMenuItemMetadata(entityId: string, metadataType: string) {
    console.log('🏭 Toyota Method: Deleting menu item metadata...')
    
    try {
      const existingMetadata = await UniversalCrudService.listEntities(
        this.organizationId,
        'metadata',
        {
          filters: { 
            entity_id: entityId,
            metadata_type: metadataType
          }
        }
      )

      if (existingMetadata.success && existingMetadata.data && existingMetadata.data.length > 0) {
        const metadataId = existingMetadata.data[0].id
        const result = await UniversalCrudService.deleteEntity(metadataId)
        
        console.log('✅ Toyota Method: Menu item metadata deleted successfully')
        return result
      }

      return { success: true, data: 'No metadata found to delete' }
    } catch (error) {
      console.error('❌ Toyota Method: Menu item metadata deletion failed:', error)
      throw error
    }
  }

  /**
   * Enhanced menu item creation with metadata
   */
  async createMenuItemWithMetadata(itemData: MenuItem, metadata?: MenuItemMetadata) {
    console.log('🏭 Toyota Method: Creating menu item with metadata...')
    
    try {
      // Step 1: Create the menu item entity
      const itemResult = await this.createMenuItem(itemData)
      
      if (!itemResult.success || !itemResult.data) {
        throw new Error('Failed to create menu item')
      }

      const entityId = itemResult.data

      // Step 2: Create metadata if provided
      if (metadata) {
        const metadataPromises = []

        // Create nutritional info metadata
        if (metadata.nutritional_info) {
          metadataPromises.push(
            this.createMenuItemMetadata(entityId, MENU_METADATA_TYPES.NUTRITIONAL_INFO, metadata.nutritional_info)
          )
        }

        // Create allergen info metadata
        if (metadata.allergen_info) {
          metadataPromises.push(
            this.createMenuItemMetadata(entityId, MENU_METADATA_TYPES.ALLERGEN_INFO, metadata.allergen_info)
          )
        }

        // Create preparation details metadata
        if (metadata.preparation_details) {
          metadataPromises.push(
            this.createMenuItemMetadata(entityId, MENU_METADATA_TYPES.PREPARATION_DETAILS, metadata.preparation_details)
          )
        }

        // Create availability rules metadata
        if (metadata.availability_rules) {
          metadataPromises.push(
            this.createMenuItemMetadata(entityId, MENU_METADATA_TYPES.AVAILABILITY_RULES, metadata.availability_rules)
          )
        }

        // Create pricing tiers metadata
        if (metadata.pricing_tiers) {
          metadataPromises.push(
            this.createMenuItemMetadata(entityId, MENU_METADATA_TYPES.PRICING_TIERS, metadata.pricing_tiers)
          )
        }

        // Create chef notes metadata
        if (metadata.chef_notes) {
          metadataPromises.push(
            this.createMenuItemMetadata(entityId, MENU_METADATA_TYPES.CHEF_NOTES, metadata.chef_notes)
          )
        }

        // Create supplier info metadata
        if (metadata.supplier_info) {
          metadataPromises.push(
            this.createMenuItemMetadata(entityId, MENU_METADATA_TYPES.SUPPLIER_INFO, metadata.supplier_info)
          )
        }

        // Create dietary certifications metadata
        if (metadata.dietary_certifications) {
          metadataPromises.push(
            this.createMenuItemMetadata(entityId, MENU_METADATA_TYPES.DIETARY_CERTIFICATIONS, metadata.dietary_certifications)
          )
        }

        // Create storage requirements metadata
        if (metadata.storage_requirements) {
          metadataPromises.push(
            this.createMenuItemMetadata(entityId, MENU_METADATA_TYPES.STORAGE_REQUIREMENTS, metadata.storage_requirements)
          )
        }

        // Create ingredient sourcing metadata
        if (metadata.ingredient_sourcing) {
          metadataPromises.push(
            this.createMenuItemMetadata(entityId, MENU_METADATA_TYPES.INGREDIENT_SOURCING, metadata.ingredient_sourcing)
          )
        }

        // Create customer reviews metadata
        if (metadata.customer_reviews) {
          metadataPromises.push(
            this.createMenuItemMetadata(entityId, MENU_METADATA_TYPES.CUSTOMER_REVIEWS, metadata.customer_reviews)
          )
        }

        // Execute all metadata creation in parallel
        await Promise.all(metadataPromises)
      }

      console.log('✅ Toyota Method: Menu item with metadata created successfully')
      return itemResult
    } catch (error) {
      console.error('❌ Toyota Method: Menu item with metadata creation failed:', error)
      throw error
    }
  }

  /**
   * Enhanced menu item retrieval with metadata
   */
  async getMenuItemWithMetadata(itemId: string) {
    console.log('🏭 Toyota Method: Fetching menu item with metadata...')
    
    try {
      // Get the menu item
      const itemResult = await UniversalCrudService.readEntity(this.organizationId, itemId)
      
      if (!itemResult.success || !itemResult.data) {
        throw new Error('Menu item not found')
      }

      // Get metadata
      const metadataResult = await this.getMenuItemMetadata(itemId)
      
      const menuItem: MenuItem = {
        ...itemResult.data,
        metadata: metadataResult.success ? metadataResult.data : {}
      }

      console.log('✅ Toyota Method: Menu item with metadata fetched successfully')
      return {
        success: true,
        data: menuItem
      }
    } catch (error) {
      console.error('❌ Toyota Method: Menu item with metadata fetch failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Enhanced menu items listing with metadata
   */
  async getMenuItemsWithMetadata(categoryId?: string, includeInactive = false) {
    console.log('🏭 Toyota Method: Fetching menu items with metadata...')
    
    try {
      // Get menu items
      const itemsResult = await this.getMenuItems(categoryId, includeInactive)
      
      if (!itemsResult.success || !itemsResult.data) {
        return itemsResult
      }

      // Get metadata for all items
      const itemsWithMetadata = await Promise.all(
        itemsResult.data.map(async (item) => {
          const metadataResult = await this.getMenuItemMetadata(item.id!)
          return {
            ...item,
            metadata: metadataResult.success ? metadataResult.data : {}
          }
        })
      )

      console.log('✅ Toyota Method: Menu items with metadata fetched successfully')
      return {
        success: true,
        data: itemsWithMetadata
      }
    } catch (error) {
      console.error('❌ Toyota Method: Menu items with metadata fetch failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  // ===========================================
  // POKA-YOKE: VALIDATION METHODS
  // ===========================================

  private validateCategoryData(data: MenuCategory) {
    if (!data.name || data.name.trim().length === 0) {
      throw new Error('Category name is required')
    }
    if (data.display_order < 0) {
      throw new Error('Display order must be non-negative')
    }
  }

  private async checkDuplicateCategoryName(categoryName: string, excludeId?: string) {
    const existingCategories = await UniversalCrudService.listEntities(
      this.organizationId,
      MENU_ENTITY_TYPES.MENU_CATEGORY,
      {
        filters: { is_active: true }
      }
    )

    if (existingCategories.success && existingCategories.data) {
      const duplicate = existingCategories.data.find(category => {
        const name = category.entity_name || category.name
        return name && 
               name.toLowerCase().trim() === categoryName.toLowerCase().trim() && 
               category.id !== excludeId
      })

      if (duplicate) {
        throw new Error(`A category named "${categoryName}" already exists. Please choose a different name.`)
      }
    }
  }

  private validateMenuItemData(data: MenuItem) {
    if (!data.name || data.name.trim().length === 0) {
      throw new Error('Menu item name is required')
    }
    if (!data.category_id) {
      throw new Error('Category ID is required')
    }
    if (data.base_price < 0) {
      throw new Error('Base price cannot be negative')
    }
    if (data.preparation_time < 0) {
      throw new Error('Preparation time cannot be negative')
    }
    if (!data.description || data.description.trim().length === 0) {
      throw new Error('Menu item description is required')
    }
  }

  private validateModifierGroupData(data: MenuModifierGroup) {
    if (!data.name || data.name.trim().length === 0) {
      throw new Error('Modifier group name is required')
    }
    if (!['single_choice', 'multiple_choice'].includes(data.modifier_type)) {
      throw new Error('Invalid modifier type')
    }
    if (data.modifier_type === 'multiple_choice') {
      if (data.min_selections && data.max_selections && data.min_selections > data.max_selections) {
        throw new Error('Minimum selections cannot exceed maximum selections')
      }
    }
  }

  private validateModifierData(data: MenuModifier) {
    if (!data.name || data.name.trim().length === 0) {
      throw new Error('Modifier name is required')
    }
    if (!data.modifier_group_id) {
      throw new Error('Modifier group ID is required')
    }
  }

  private validatePricingRuleData(data: MenuPricingRule) {
    if (!data.name || data.name.trim().length === 0) {
      throw new Error('Pricing rule name is required')
    }
    if (!['time_based', 'quantity_based', 'customer_tier', 'seasonal'].includes(data.rule_type)) {
      throw new Error('Invalid rule type')
    }
    if (!['percentage', 'fixed_amount'].includes(data.adjustment_type)) {
      throw new Error('Invalid adjustment type')
    }
    if (new Date(data.valid_from) >= new Date(data.valid_until)) {
      throw new Error('Valid from date must be before valid until date')
    }
  }

  // ===========================================
  // RELATIONSHIPS MANAGEMENT (CORE_RELATIONSHIPS)
  // ===========================================

  /**
   * Create relationship between menu entities
   */
  async createMenuRelationship(
    parentEntityId: string,
    childEntityId: string,
    relationshipType: string,
    relationshipData?: Record<string, any>
  ) {
    console.log('🏭 Toyota Method: Creating menu relationship...')
    
    try {
      const result = await UniversalCrudService.createEntity({
        name: `${relationshipType}_${parentEntityId}_${childEntityId}`,
        organizationId: this.organizationId,
        fields: {
          parent_entity_id: parentEntityId,
          child_entity_id: childEntityId,
          relationship_type: relationshipType,
          relationship_data: JSON.stringify(relationshipData || {}),
          is_active: true
        }
      }, 'relationship')

      console.log('✅ Toyota Method: Menu relationship created successfully')
      return result
    } catch (error) {
      console.error('❌ Toyota Method: Menu relationship creation failed:', error)
      throw error
    }
  }

  /**
   * Get relationships for a menu entity
   */
  async getMenuRelationships(entityId: string, relationshipType?: string) {
    console.log('🏭 Toyota Method: Fetching menu relationships...')
    
    try {
      const filters: Record<string, any> = { 
        parent_entity_id: entityId,
        is_active: true
      }
      
      if (relationshipType) {
        filters.relationship_type = relationshipType
      }

      const result = await UniversalCrudService.listEntities(
        this.organizationId,
        'relationship',
        { filters }
      )

      console.log('✅ Toyota Method: Menu relationships fetched successfully')
      return result
    } catch (error) {
      console.error('❌ Toyota Method: Menu relationships fetch failed:', error)
      throw error
    }
  }

  /**
   * Create menu category hierarchy
   */
  async createCategoryHierarchy(parentCategoryId: string, childCategoryId: string) {
    return await this.createMenuRelationship(
      parentCategoryId,
      childCategoryId,
      'category_hierarchy',
      { hierarchy_level: 1 }
    )
  }

  /**
   * Create combo meal relationships
   */
  async createComboMealRelationship(comboItemId: string, componentItemId: string, quantity: number = 1) {
    return await this.createMenuRelationship(
      comboItemId,
      componentItemId,
      'combo_component',
      { quantity, component_type: 'menu_item' }
    )
  }

  /**
   * Create modifier group associations
   */
  async createModifierAssociation(menuItemId: string, modifierGroupId: string, isRequired: boolean = false) {
    return await this.createMenuRelationship(
      menuItemId,
      modifierGroupId,
      'modifier_association',
      { is_required: isRequired }
    )
  }

  // ===========================================
  // ORGANIZATION MANAGEMENT (CORE_ORGANIZATIONS)
  // ===========================================

  /**
   * Get organization-specific menu settings
   */
  async getOrganizationMenuSettings() {
    console.log('🏭 Toyota Method: Fetching organization menu settings...')
    
    try {
      const result = await UniversalCrudService.readEntity(this.organizationId)
      
      if (result.success && result.data) {
        // Extract menu-specific settings from organization data
        const menuSettings = {
          currency: result.data.currency || 'USD',
          timezone: result.data.timezone || 'UTC',
          menu_display_mode: result.data.menu_display_mode || 'grid',
          default_prep_time: result.data.default_prep_time || 15,
          tax_rate: result.data.tax_rate || 0.08,
          service_charge: result.data.service_charge || 0,
          menu_categories_per_page: result.data.menu_categories_per_page || 20,
          menu_items_per_page: result.data.menu_items_per_page || 50,
          allow_item_customization: result.data.allow_item_customization || true,
          show_calories: result.data.show_calories || true,
          show_allergen_info: result.data.show_allergen_info || true,
          ...result.data.fields // Include any dynamic fields
        }
        
        console.log('✅ Toyota Method: Organization menu settings fetched successfully')
        return {
          success: true,
          data: menuSettings
        }
      }
      
      return { success: false, error: 'Organization not found' }
    } catch (error) {
      console.error('❌ Toyota Method: Organization menu settings fetch failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Update organization menu settings
   */
  async updateOrganizationMenuSettings(settings: Record<string, any>) {
    console.log('🏭 Toyota Method: Updating organization menu settings...')
    
    try {
      const result = await UniversalCrudService.updateEntity(
        this.organizationId,
        settings
      )

      console.log('✅ Toyota Method: Organization menu settings updated successfully')
      return result
    } catch (error) {
      console.error('❌ Toyota Method: Organization menu settings update failed:', error)
      throw error
    }
  }

  // ===========================================
  // UTILITY METHODS
  // ===========================================

  async getFullMenuStructure() {
    console.log('🏭 Toyota Method: Loading full menu structure with ALL 5 CORE TABLES...')
    
    try {
      // Load data from all 5 core tables
      const [
        categories,
        menuItems,
        modifierGroups,
        organizationSettings,
        relationships
      ] = await Promise.all([
        this.getCategories(),
        this.getMenuItemsWithMetadata(), // Uses core_metadata
        this.getModifierGroups(),
        this.getOrganizationMenuSettings(), // Uses core_organizations
        this.getAllMenuRelationships() // Uses core_relationships
      ])

      // Build comprehensive menu structure using all 5 tables
      const menuStructure: any = {
        // 1. CORE_ENTITIES data
        categories: categories.data || [],
        items_by_category: {},
        modifier_groups: modifierGroups.data || [],
        
        // 2. CORE_DYNAMIC_DATA (included in entities via fields)
        // Already included in above entities
        
        // 3. CORE_METADATA (rich menu item data)
        items_with_metadata: menuItems.data || [],
        
        // 4. CORE_RELATIONSHIPS (hierarchical structures)
        relationships: {
          category_hierarchies: [],
          combo_components: [],
          modifier_associations: []
        },
        
        // 5. CORE_ORGANIZATIONS (organization-specific settings)
        organization_settings: organizationSettings.data || {},
        
        // Enhanced structure with relationships
        menu_hierarchy: {},
        combo_meals: {},
        modifier_mapping: {}
      }

      // Process relationships data
      if (relationships.success && relationships.data) {
        for (const relationship of relationships.data) {
          const relType = relationship.relationship_type
          
          if (relType === 'category_hierarchy') {
            menuStructure.relationships.category_hierarchies.push(relationship)
          } else if (relType === 'combo_component') {
            menuStructure.relationships.combo_components.push(relationship)
          } else if (relType === 'modifier_association') {
            menuStructure.relationships.modifier_associations.push(relationship)
          }
        }
      }

      // Group items by category with metadata
      if (menuItems.success && menuItems.data) {
        for (const item of menuItems.data) {
          const categoryId = item.category_id
          if (!menuStructure.items_by_category[categoryId]) {
            menuStructure.items_by_category[categoryId] = []
          }
          menuStructure.items_by_category[categoryId].push(item)
        }
      }

      console.log('✅ Toyota Method: Full menu structure with ALL 5 CORE TABLES loaded successfully')
      console.log('📊 Structure includes:')
      console.log(`   - Categories: ${menuStructure.categories.length}`)
      console.log(`   - Items with metadata: ${menuStructure.items_with_metadata.length}`)
      console.log(`   - Relationships: ${relationships.data?.length || 0}`)
      console.log(`   - Organization settings: ${Object.keys(menuStructure.organization_settings).length} settings`)
      
      return {
        success: true,
        data: menuStructure
      }
    } catch (error) {
      console.error('❌ Toyota Method: Full menu structure loading failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Get all menu relationships for comprehensive structure
   */
  private async getAllMenuRelationships() {
    console.log('🏭 Toyota Method: Fetching all menu relationships...')
    
    try {
      const result = await UniversalCrudService.listEntities(
        this.organizationId,
        'relationship',
        {
          filters: { is_active: true }
        }
      )

      console.log('✅ Toyota Method: All menu relationships fetched successfully')
      return result
    } catch (error) {
      console.error('❌ Toyota Method: All menu relationships fetch failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }
}

export default MenuManagementService
