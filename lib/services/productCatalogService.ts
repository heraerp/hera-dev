/**
 * Universal Product Catalog Service
 * Complete product management using HERA Universal Schema Architecture
 * Handles products, categories, variants, pricing, and inventory through universal entities
 */

import UniversalCrudService from '@/lib/services/universalCrudService'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client';

// Regular client for read operations
const supabase = createClient()

// Admin client with service role for write operations (bypasses RLS)
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
)

// Product entity types for universal schema
export const PRODUCT_ENTITY_TYPES = {
  PRODUCT_CATEGORY: 'product_category',
  PRODUCT: 'product',
  PRODUCT_VARIANT: 'product_variant',
  PRODUCT_PRICING: 'product_pricing',
  PRODUCT_INGREDIENT: 'product_ingredient',
  SUPPLIER: 'supplier',
  INVENTORY_ITEM: 'inventory_item'
} as const

// Product metadata types
export const PRODUCT_METADATA_TYPES = {
  PRODUCT_DETAILS: 'product_details',
  BREWING_INSTRUCTIONS: 'brewing_instructions',
  NUTRITIONAL_INFO: 'nutritional_info',
  PRICING_RULES: 'pricing_rules',
  INVENTORY_CONFIG: 'inventory_config',
  SUPPLIER_INFO: 'supplier_info'
} as const

// Interface definitions
export interface CategoryData {
  name: string
  description?: string
  parentCategoryId?: string
  sortOrder?: number
  isActive?: boolean
  categoryType?: 'tea' | 'pastry' | 'beverage' | 'food' | 'other'
}

export interface ProductData {
  name: string
  description: string
  categoryId: string
  basePrice: number
  sku?: string
  preparationTimeMinutes?: number
  isActive?: boolean
  productType?: 'tea' | 'pastry' | 'beverage' | 'food'
  brewingInstructions?: {
    temperature?: string
    steepingTime?: string
    teaAmount?: string
  }
  nutritionalInfo?: {
    caffeineContent?: string
    caloriesPerServing?: number
    allergens?: string[]
  }
  originStory?: string
  seasonalAvailability?: boolean
  popularPairings?: string[]
}

export interface VariantData {
  productId: string
  variantType: 'size' | 'temperature' | 'dietary' | 'add_on'
  variantName: string
  variantValue: string
  priceModifier: number
  isDefault?: boolean
  isActive?: boolean
}

export interface PricingData {
  productId: string
  priceType: 'base' | 'variant' | 'bundle' | 'seasonal'
  price: number
  currency: string
  validFrom?: string
  validTo?: string
  minQuantity?: number
  maxQuantity?: number
}

export interface InventoryData {
  productId: string
  currentStock: number
  minimumStock: number
  maximumStock: number
  reorderPoint: number
  costPerUnit: number
  lastRestockDate?: string
  expirationDate?: string
}

export interface ServiceResult<T = any> {
  success: boolean
  data?: T
  error?: string
  details?: any
}

export class ProductCatalogService {
  
  /**
   * Initialize product catalog with sample tea shop data
   */
  static async initializeProductCatalog(organizationId: string): Promise<ServiceResult> {
    console.log('🚀 Initializing product catalog for organization:', organizationId)
    
    try {
      // Step 1: Create base categories
      const categoryResults = await this.createBaseCategories(organizationId)
      if (!categoryResults.success) {
        throw new Error(`Category creation failed: ${categoryResults.error}`)
      }
      
      // Step 2: Create sample products
      const productResults = await this.createSampleProducts(organizationId, categoryResults.data!)
      if (!productResults.success) {
        throw new Error(`Product creation failed: ${productResults.error}`)
      }
      
      // Step 3: Create product variants
      const variantResults = await this.createProductVariants(organizationId, productResults.data!)
      if (!variantResults.success) {
        throw new Error(`Variant creation failed: ${variantResults.error}`)
      }
      
      console.log('✅ Product catalog initialization complete')
      return {
        success: true,
        data: {
          categories: categoryResults.data,
          products: productResults.data,
          variants: variantResults.data
        }
      }
      
    } catch (error) {
      console.error('🚨 Product catalog initialization failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown initialization error',
        details: error
      }
    }
  }

  /**
   * Create product category using universal schema
   */
  static async createProductCategory(organizationId: string, categoryData: CategoryData): Promise<ServiceResult> {
    try {
      const categoryId = crypto.randomUUID()
      const categoryCode = this.generateEntityCode(categoryData.name, 'CAT')

      // Create category entity
      const { error: entityError } = await supabaseAdmin
        .from('core_entities')
        .insert({
          id: categoryId,
          organization_id: organizationId,
          entity_type: PRODUCT_ENTITY_TYPES.PRODUCT_CATEGORY,
          entity_name: categoryData.name,
          entity_code: categoryCode,
          is_active: categoryData.isActive ?? true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })

      if (entityError) throw entityError

      // Create category dynamic data
      const dynamicData = [
        { entity_id: categoryId, field_name: 'description', field_value: categoryData.description || '', field_type: 'text' },
        { entity_id: categoryId, field_name: 'parent_category_id', field_value: categoryData.parentCategoryId || '', field_type: 'uuid' },
        { entity_id: categoryId, field_name: 'sort_order', field_value: (categoryData.sortOrder || 0).toString(), field_type: 'number' },
        { entity_id: categoryId, field_name: 'category_type', field_value: categoryData.categoryType || 'other', field_type: 'text' }
      ]

      const { error: dataError } = await supabaseAdmin
        .from('core_dynamic_data')
        .insert(dynamicData)

      if (dataError) throw dataError

      // Create category metadata
      const { error: metadataError } = await supabaseAdmin
        .from('core_metadata')
        .insert({
          organization_id: organizationId,
          entity_type: PRODUCT_ENTITY_TYPES.PRODUCT_CATEGORY,
          entity_id: categoryId,
          metadata_type: PRODUCT_METADATA_TYPES.PRODUCT_DETAILS,
          metadata_category: 'category_info',
          metadata_key: 'category_configuration',
          metadata_value: JSON.stringify({
            display_settings: {
              show_in_menu: true,
              featured_category: false,
              display_order: categoryData.sortOrder || 0
            },
            business_rules: {
              allow_variants: true,
              require_inventory: false,
              auto_calculate_pricing: true
            }
          }),
          // Additional columns for extended schema
          metadata_scope: null,
          metadata_value_type: 'json',
          is_system_generated: false,
          is_user_editable: true,
          is_searchable: true,
          is_encrypted: false,
          effective_from: new Date().toISOString(),
          effective_to: null,
          is_active: true,
          version: 1,
          previous_version_id: null,
          change_reason: null,
          ai_generated: false,
          ai_confidence_score: null,
          ai_model_version: null,
          ai_last_updated: null,
          created_by: await this.getSystemUserId(),
          updated_by: null
        })

      if (metadataError) throw metadataError

      return { success: true, data: { id: categoryId, code: categoryCode } }

    } catch (error) {
      console.error('❌ Category creation error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Category creation failed',
        details: error
      }
    }
  }

  /**
   * Create product using universal schema
   */
  static async createProduct(organizationId: string, productData: ProductData): Promise<ServiceResult> {
    try {
      const productId = crypto.randomUUID()
      const productCode = this.generateEntityCode(productData.name, 'PRD')

      // Create product entity
      const { error: entityError } = await supabaseAdmin
        .from('core_entities')
        .insert({
          id: productId,
          organization_id: organizationId,
          entity_type: PRODUCT_ENTITY_TYPES.PRODUCT,
          entity_name: productData.name,
          entity_code: productCode,
          is_active: productData.isActive ?? true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })

      if (entityError) throw entityError

      // Create product dynamic data
      const dynamicData = [
        { entity_id: productId, field_name: 'category_id', field_value: productData.categoryId, field_type: 'uuid' },
        { entity_id: productId, field_name: 'description', field_value: productData.description, field_type: 'text' },
        { entity_id: productId, field_name: 'base_price', field_value: productData.basePrice.toString(), field_type: 'number' },
        { entity_id: productId, field_name: 'sku', field_value: productData.sku || productCode, field_type: 'text' },
        { entity_id: productId, field_name: 'preparation_time_minutes', field_value: (productData.preparationTimeMinutes || 0).toString(), field_type: 'number' },
        { entity_id: productId, field_name: 'product_type', field_value: productData.productType || 'other', field_type: 'text' }
      ]

      const { error: dataError } = await supabaseAdmin
        .from('core_dynamic_data')
        .insert(dynamicData)

      if (dataError) throw dataError

      // Create product metadata (rich JSON)
      const { error: metadataError } = await supabaseAdmin
        .from('core_metadata')
        .insert({
          organization_id: organizationId,
          entity_type: PRODUCT_ENTITY_TYPES.PRODUCT,
          entity_id: productId,
          metadata_type: PRODUCT_METADATA_TYPES.PRODUCT_DETAILS,
          metadata_category: 'product_specifications',
          metadata_key: 'detailed_info',
          metadata_value: JSON.stringify({
            brewing_instructions: productData.brewingInstructions || {},
            nutritional_info: productData.nutritionalInfo || {},
            origin_story: productData.originStory || '',
            seasonal_availability: productData.seasonalAvailability ?? true,
            popular_pairings: productData.popularPairings || [],
            preparation_notes: `Preparation time: ${productData.preparationTimeMinutes || 0} minutes`,
            quality_indicators: {
              premium_grade: false,
              organic_certified: false,
              fair_trade: false
            }
          }),
          // Additional columns for extended schema
          metadata_scope: null,
          metadata_value_type: 'json',
          is_system_generated: false,
          is_user_editable: true,
          is_searchable: true,
          is_encrypted: false,
          effective_from: new Date().toISOString(),
          effective_to: null,
          is_active: true,
          version: 1,
          previous_version_id: null,
          change_reason: null,
          ai_generated: false,
          ai_confidence_score: null,
          ai_model_version: null,
          ai_last_updated: null,
          created_by: await this.getSystemUserId(),
          updated_by: null
        })

      if (metadataError) throw metadataError

      return { success: true, data: { id: productId, code: productCode } }

    } catch (error) {
      console.error('❌ Product creation error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Product creation failed',
        details: error
      }
    }
  }

  /**
   * Create product variant using universal schema
   */
  static async createProductVariant(organizationId: string, variantData: VariantData): Promise<ServiceResult> {
    try {
      const variantId = crypto.randomUUID()
      const variantCode = this.generateEntityCode(`${variantData.variantName}-${variantData.variantValue}`, 'VAR')

      // Create variant entity
      const { error: entityError } = await supabaseAdmin
        .from('core_entities')
        .insert({
          id: variantId,
          organization_id: organizationId,
          entity_type: PRODUCT_ENTITY_TYPES.PRODUCT_VARIANT,
          entity_name: `${variantData.variantName} - ${variantData.variantValue}`,
          entity_code: variantCode,
          is_active: variantData.isActive ?? true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })

      if (entityError) throw entityError

      // Create variant dynamic data
      const dynamicData = [
        { entity_id: variantId, field_name: 'product_id', field_value: variantData.productId, field_type: 'uuid' },
        { entity_id: variantId, field_name: 'variant_type', field_value: variantData.variantType, field_type: 'text' },
        { entity_id: variantId, field_name: 'variant_name', field_value: variantData.variantName, field_type: 'text' },
        { entity_id: variantId, field_name: 'variant_value', field_value: variantData.variantValue, field_type: 'text' },
        { entity_id: variantId, field_name: 'price_modifier', field_value: variantData.priceModifier.toString(), field_type: 'number' },
        { entity_id: variantId, field_name: 'is_default', field_value: (variantData.isDefault || false).toString(), field_type: 'boolean' }
      ]

      const { error: dataError } = await supabaseAdmin
        .from('core_dynamic_data')
        .insert(dynamicData)

      if (dataError) throw dataError

      return { success: true, data: { id: variantId, code: variantCode } }

    } catch (error) {
      console.error('❌ Variant creation error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Variant creation failed',
        details: error
      }
    }
  }

  /**
   * Get complete product catalog with manual joins
   */
  static async getProductCatalog(organizationId: string): Promise<ServiceResult> {
    try {
      console.log('🔍 ProductCatalogService.getProductCatalog called for organization:', organizationId)
      
      // Get all categories using admin client to bypass RLS
      const { data: categoryEntities, error: categoryError } = await supabaseAdmin
        .from('core_entities')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('entity_type', PRODUCT_ENTITY_TYPES.PRODUCT_CATEGORY)
        .eq('is_active', true)

      if (categoryError) throw categoryError
      console.log('📊 Categories found:', categoryEntities?.length || 0)

      // Get all products using admin client to bypass RLS
      const { data: productEntities, error: productError } = await supabaseAdmin
        .from('core_entities')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('entity_type', PRODUCT_ENTITY_TYPES.PRODUCT)
        .eq('is_active', true)

      if (productError) throw productError
      console.log('📊 Products found:', productEntities?.length || 0)

      // Get dynamic data for all entities
      const allEntityIds = [
        ...categoryEntities?.map(e => e.id) || [],
        ...productEntities?.map(e => e.id) || []
      ]

      let dynamicData = []
      if (allEntityIds.length > 0) {
        const { data: dynamicResult, error: dynamicError } = await supabaseAdmin
          .from('core_dynamic_data')
          .select('*')
          .in('entity_id', allEntityIds)

        if (dynamicError) throw dynamicError
        dynamicData = dynamicResult || []
        console.log('📊 Dynamic data found:', dynamicData.length)
      }

      // Get metadata for all entities
      let metadata = []
      if (allEntityIds.length > 0) {
        const { data: metadataResult, error: metadataError } = await supabaseAdmin
          .from('core_metadata')
          .select('*')
          .eq('organization_id', organizationId)
          .in('entity_id', allEntityIds)

        if (metadataError) throw metadataError
        metadata = metadataResult || []
        console.log('📊 Metadata found:', metadata.length)
      }

      // Manual joins - create lookup maps
      const dynamicDataMap = new Map()
      const metadataMap = new Map()

      dynamicData?.forEach(item => {
        if (!dynamicDataMap.has(item.entity_id)) {
          dynamicDataMap.set(item.entity_id, {})
        }
        dynamicDataMap.get(item.entity_id)[item.field_name] = {
          value: item.field_value,
          type: item.field_type
        }
      })

      metadata?.forEach(item => {
        if (!metadataMap.has(item.entity_id)) {
          metadataMap.set(item.entity_id, {})
        }
        metadataMap.get(item.entity_id)[item.metadata_key] = JSON.parse(item.metadata_value)
      })

      // Build enriched categories
      const enrichedCategories = categoryEntities?.map(category => ({
        ...category,
        dynamicData: dynamicDataMap.get(category.id) || {},
        metadata: metadataMap.get(category.id) || {}
      })) || []

      // Build enriched products with category information
      const enrichedProducts = productEntities?.map(product => {
        const productDynamicData = dynamicDataMap.get(product.id) || {}
        const categoryId = productDynamicData.category_id?.value
        
        const category = categoryId ? 
          enrichedCategories.find(cat => cat.id === categoryId) : null

        return {
          ...product,
          dynamicData: productDynamicData,
          metadata: metadataMap.get(product.id) || {},
          category: category ? {
            id: category.id,
            name: category.entity_name,
            type: category.dynamicData.category_type?.value || 'other'
          } : null
        }
      }) || []

      // Group products by category
      const categorizedProducts = enrichedCategories.map(category => ({
        ...category,
        products: enrichedProducts.filter(product => 
          product.dynamicData.category_id?.value === category.id
        )
      }))

      return {
        success: true,
        data: {
          categories: enrichedCategories,
          products: enrichedProducts,
          categorizedProducts
        }
      }

    } catch (error) {
      console.error('❌ Get catalog error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get catalog',
        details: error
      }
    }
  }

  /**
   * Update product using universal schema
   */
  static async updateProduct(organizationId: string, productId: string, productData: ProductData): Promise<ServiceResult> {
    try {
      console.log('✏️ Updating product:', productId, 'with data:', productData)

      // Update product entity
      const { error: entityError } = await supabaseAdmin
        .from('core_entities')
        .update({
          entity_name: productData.name,
          is_active: productData.isActive ?? true,
          updated_at: new Date().toISOString()
        })
        .eq('id', productId)
        .eq('organization_id', organizationId)

      if (entityError) throw entityError

      // Delete existing dynamic data for this product
      const { error: deleteError } = await supabaseAdmin
        .from('core_dynamic_data')
        .delete()
        .eq('entity_id', productId)

      if (deleteError) throw deleteError

      // Create updated dynamic data
      const dynamicData = [
        { entity_id: productId, field_name: 'category_id', field_value: productData.categoryId, field_type: 'uuid' },
        { entity_id: productId, field_name: 'description', field_value: productData.description, field_type: 'text' },
        { entity_id: productId, field_name: 'base_price', field_value: productData.basePrice.toString(), field_type: 'number' },
        { entity_id: productId, field_name: 'sku', field_value: productData.sku || `SKU-${productId.slice(-8)}`, field_type: 'text' },
        { entity_id: productId, field_name: 'preparation_time_minutes', field_value: (productData.preparationTimeMinutes || 0).toString(), field_type: 'number' },
        { entity_id: productId, field_name: 'product_type', field_value: productData.productType || 'other', field_type: 'text' }
      ]

      // Add brewing instructions to dynamic data if provided
      if (productData.brewingInstructions) {
        if (productData.brewingInstructions.temperature) {
          dynamicData.push({ entity_id: productId, field_name: 'brewing_temperature', field_value: productData.brewingInstructions.temperature, field_type: 'text' })
        }
        if (productData.brewingInstructions.steepingTime) {
          dynamicData.push({ entity_id: productId, field_name: 'steeping_time', field_value: productData.brewingInstructions.steepingTime, field_type: 'text' })
        }
        if (productData.brewingInstructions.teaAmount) {
          dynamicData.push({ entity_id: productId, field_name: 'tea_amount', field_value: productData.brewingInstructions.teaAmount, field_type: 'text' })
        }
      }

      // Add nutritional info to dynamic data if provided
      if (productData.nutritionalInfo) {
        if (productData.nutritionalInfo.caffeineContent) {
          dynamicData.push({ entity_id: productId, field_name: 'caffeine_content', field_value: productData.nutritionalInfo.caffeineContent, field_type: 'text' })
        }
        if (productData.nutritionalInfo.caloriesPerServing) {
          dynamicData.push({ entity_id: productId, field_name: 'calories_per_serving', field_value: productData.nutritionalInfo.caloriesPerServing.toString(), field_type: 'number' })
        }
        if (productData.nutritionalInfo.allergens && productData.nutritionalInfo.allergens.length > 0) {
          dynamicData.push({ entity_id: productId, field_name: 'allergens', field_value: JSON.stringify(productData.nutritionalInfo.allergens), field_type: 'json' })
        }
      }

      // Add additional fields
      if (productData.originStory) {
        dynamicData.push({ entity_id: productId, field_name: 'origin_story', field_value: productData.originStory, field_type: 'text' })
      }
      if (productData.seasonalAvailability !== undefined) {
        dynamicData.push({ entity_id: productId, field_name: 'seasonal_availability', field_value: productData.seasonalAvailability.toString(), field_type: 'boolean' })
      }
      if (productData.popularPairings && productData.popularPairings.length > 0) {
        dynamicData.push({ entity_id: productId, field_name: 'popular_pairings', field_value: JSON.stringify(productData.popularPairings), field_type: 'json' })
      }

      const { error: dataError } = await supabaseAdmin
        .from('core_dynamic_data')
        .insert(dynamicData.map(item => ({
          ...item,
          organization_id: organizationId
        })))

      if (dataError) throw dataError

      // Update product metadata
      const { error: deleteMetadataError } = await supabaseAdmin
        .from('core_metadata')
        .delete()
        .eq('entity_id', productId)
        .eq('organization_id', organizationId)

      if (deleteMetadataError) throw deleteMetadataError

      const { error: metadataError } = await supabaseAdmin
        .from('core_metadata')
        .insert({
          organization_id: organizationId,
          entity_type: PRODUCT_ENTITY_TYPES.PRODUCT,
          entity_id: productId,
          metadata_type: PRODUCT_METADATA_TYPES.PRODUCT_DETAILS,
          metadata_category: 'product_specifications',
          metadata_key: 'detailed_info',
          metadata_value: JSON.stringify({
            brewing_instructions: productData.brewingInstructions || {},
            nutritional_info: productData.nutritionalInfo || {},
            origin_story: productData.originStory || '',
            seasonal_availability: productData.seasonalAvailability ?? true,
            popular_pairings: productData.popularPairings || [],
            preparation_notes: `Preparation time: ${productData.preparationTimeMinutes || 0} minutes`,
            quality_indicators: {
              premium_grade: false,
              organic_certified: false,
              fair_trade: false
            }
          })
        })

      if (metadataError) throw metadataError

      console.log('✅ Product updated successfully:', productId)
      return { success: true, data: { id: productId } }

    } catch (error) {
      console.error('❌ Product update error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Product update failed',
        details: error
      }
    }
  }

  /**
   * Delete product using universal schema
   */
  static async deleteProduct(organizationId: string, productId: string): Promise<ServiceResult> {
    try {
      console.log('🗑️ Deleting product:', productId)

      // Delete in reverse order of dependencies

      // 1. Delete metadata
      const { error: metadataError } = await supabaseAdmin
        .from('core_metadata')
        .delete()
        .eq('entity_id', productId)
        .eq('organization_id', organizationId)

      if (metadataError) throw metadataError

      // 2. Delete dynamic data
      const { error: dynamicError } = await supabaseAdmin
        .from('core_dynamic_data')
        .delete()
        .eq('entity_id', productId)

      if (dynamicError) throw dynamicError

      // 3. Delete product variants (if any)
      const { data: variants } = await supabaseAdmin
        .from('core_dynamic_data')
        .select('entity_id')
        .eq('field_name', 'product_id')
        .eq('field_value', productId)

      if (variants && variants.length > 0) {
        const variantIds = variants.map(v => v.entity_id)
        
        // Delete variant metadata
        const { error: variantMetadataError } = await supabaseAdmin
          .from('core_metadata')
          .delete()
          .in('entity_id', variantIds)
          .eq('organization_id', organizationId)

        if (variantMetadataError) console.warn('Variant metadata deletion error:', variantMetadataError)

        // Delete variant dynamic data
        const { error: variantDynamicError } = await supabaseAdmin
          .from('core_dynamic_data')
          .delete()
          .in('entity_id', variantIds)

        if (variantDynamicError) console.warn('Variant dynamic data deletion error:', variantDynamicError)

        // Delete variant entities
        const { error: variantEntityError } = await supabaseAdmin
          .from('core_entities')
          .delete()
          .in('id', variantIds)
          .eq('organization_id', organizationId)
          .eq('entity_type', PRODUCT_ENTITY_TYPES.PRODUCT_VARIANT)

        if (variantEntityError) console.warn('Variant entity deletion error:', variantEntityError)
      }

      // 4. Finally, delete the product entity
      const { error: entityError } = await supabaseAdmin
        .from('core_entities')
        .delete()
        .eq('id', productId)
        .eq('organization_id', organizationId)
        .eq('entity_type', PRODUCT_ENTITY_TYPES.PRODUCT)

      if (entityError) throw entityError

      console.log('✅ Product deleted successfully:', productId)
      return { success: true, data: { id: productId } }

    } catch (error) {
      console.error('❌ Product deletion error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Product deletion failed',
        details: error
      }
    }
  }

  /**
   * Search products with advanced filtering
   */
  static async searchProducts(
    organizationId: string, 
    searchTerm: string, 
    filters?: {
      categoryId?: string
      productType?: string
      priceRange?: { min: number; max: number }
    }
  ): Promise<ServiceResult> {
    try {
      // Get all products
      const { data: productEntities, error: productError } = await supabase
        .from('core_entities')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('entity_type', PRODUCT_ENTITY_TYPES.PRODUCT)
        .eq('is_active', true)
        .ilike('entity_name', `%${searchTerm}%`)

      if (productError) throw productError

      if (!productEntities || productEntities.length === 0) {
        return { success: true, data: [] }
      }

      // Get dynamic data for products
      const { data: dynamicData, error: dynamicError } = await supabase
        .from('core_dynamic_data')
        .select('*')
        .in('entity_id', productEntities.map(p => p.id))

      if (dynamicError) throw dynamicError

      // Manual join and filter
      const dynamicDataMap = new Map()
      dynamicData?.forEach(item => {
        if (!dynamicDataMap.has(item.entity_id)) {
          dynamicDataMap.set(item.entity_id, {})
        }
        dynamicDataMap.get(item.entity_id)[item.field_name] = {
          value: item.field_value,
          type: item.field_type
        }
      })

      let filteredProducts = productEntities.map(product => ({
        ...product,
        dynamicData: dynamicDataMap.get(product.id) || {}
      }))

      // Apply filters
      if (filters?.categoryId) {
        filteredProducts = filteredProducts.filter(product =>
          product.dynamicData.category_id?.value === filters.categoryId
        )
      }

      if (filters?.productType) {
        filteredProducts = filteredProducts.filter(product =>
          product.dynamicData.product_type?.value === filters.productType
        )
      }

      if (filters?.priceRange) {
        filteredProducts = filteredProducts.filter(product => {
          const price = parseFloat(product.dynamicData.base_price?.value || '0')
          return price >= filters.priceRange!.min && price <= filters.priceRange!.max
        })
      }

      return { success: true, data: filteredProducts }

    } catch (error) {
      console.error('❌ Search error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Search failed',
        details: error
      }
    }
  }

  /**
   * Create base categories for tea shop
   */
  private static async createBaseCategories(organizationId: string): Promise<ServiceResult> {
    const categories: CategoryData[] = [
      {
        name: 'Green Tea',
        description: 'Fresh and healthy green tea varieties',
        categoryType: 'tea',
        sortOrder: 1
      },
      {
        name: 'Black Tea',
        description: 'Bold and rich black tea selections',
        categoryType: 'tea',
        sortOrder: 2
      },
      {
        name: 'Herbal Tea',
        description: 'Caffeine-free herbal and wellness teas',
        categoryType: 'tea',
        sortOrder: 3
      },
      {
        name: 'Iced Tea',
        description: 'Refreshing cold tea beverages',
        categoryType: 'beverage',
        sortOrder: 4
      },
      {
        name: 'Pastries',
        description: 'Fresh baked pastries and sweet treats',
        categoryType: 'pastry',
        sortOrder: 5
      },
      {
        name: 'Light Meals',
        description: 'Sandwiches and light meal options',
        categoryType: 'food',
        sortOrder: 6
      }
    ]

    const createdCategories = []
    for (const categoryData of categories) {
      const result = await this.createProductCategory(organizationId, categoryData)
      if (result.success) {
        createdCategories.push({
          ...result.data,
          name: categoryData.name,
          type: categoryData.categoryType
        })
      }
    }

    return { success: true, data: createdCategories }
  }

  /**
   * Create sample products for tea shop
   */
  private static async createSampleProducts(organizationId: string, categories: any[]): Promise<ServiceResult> {
    const greenTeaCategory = categories.find(c => c.name === 'Green Tea')
    const blackTeaCategory = categories.find(c => c.name === 'Black Tea')
    const herbalTeaCategory = categories.find(c => c.name === 'Herbal Tea')
    const pastriesCategory = categories.find(c => c.name === 'Pastries')

    const products: ProductData[] = [
      // Green Teas
      {
        name: 'Sencha Green Tea',
        description: 'Premium Japanese sencha with fresh grassy notes',
        categoryId: greenTeaCategory?.id || '',
        basePrice: 4.50,
        preparationTimeMinutes: 3,
        productType: 'tea',
        brewingInstructions: {
          temperature: '80°C',
          steepingTime: '2-3 minutes',
          teaAmount: '1 tsp per cup'
        },
        nutritionalInfo: {
          caffeineContent: '25mg',
          caloriesPerServing: 2,
          allergens: []
        },
        originStory: 'Sourced from premium Japanese tea gardens',
        popularPairings: ['Honey', 'Lemon']
      },
      {
        name: 'Jasmine Green Tea',
        description: 'Delicate green tea scented with jasmine flowers',
        categoryId: greenTeaCategory?.id || '',
        basePrice: 5.00,
        preparationTimeMinutes: 3,
        productType: 'tea',
        brewingInstructions: {
          temperature: '80°C',
          steepingTime: '2-3 minutes',
          teaAmount: '1 tsp per cup'
        },
        nutritionalInfo: {
          caffeineContent: '30mg',
          caloriesPerServing: 2,
          allergens: []
        },
        popularPairings: ['Honey', 'Fresh mint']
      },
      // Black Teas
      {
        name: 'Earl Grey Tea',
        description: 'Classic Earl Grey with bergamot oil',
        categoryId: blackTeaCategory?.id || '',
        basePrice: 4.75,
        preparationTimeMinutes: 4,
        productType: 'tea',
        brewingInstructions: {
          temperature: '95°C',
          steepingTime: '3-5 minutes',
          teaAmount: '1 tsp per cup'
        },
        nutritionalInfo: {
          caffeineContent: '40mg',
          caloriesPerServing: 2,
          allergens: []
        },
        popularPairings: ['Milk', 'Honey', 'Lemon']
      },
      {
        name: 'English Breakfast',
        description: 'Rich and malty blend perfect for morning',
        categoryId: blackTeaCategory?.id || '',
        basePrice: 4.25,
        preparationTimeMinutes: 4,
        productType: 'tea',
        brewingInstructions: {
          temperature: '95°C',
          steepingTime: '3-5 minutes',
          teaAmount: '1 tsp per cup'
        },
        nutritionalInfo: {
          caffeineContent: '45mg',
          caloriesPerServing: 2,
          allergens: []
        },
        popularPairings: ['Milk', 'Sugar', 'Honey']
      },
      // Herbal Teas
      {
        name: 'Chamomile Tea',
        description: 'Soothing caffeine-free herbal tea',
        categoryId: herbalTeaCategory?.id || '',
        basePrice: 4.00,
        preparationTimeMinutes: 5,
        productType: 'tea',
        brewingInstructions: {
          temperature: '95°C',
          steepingTime: '5-7 minutes',
          teaAmount: '1 tbsp per cup'
        },
        nutritionalInfo: {
          caffeineContent: '0mg',
          caloriesPerServing: 1,
          allergens: []
        },
        popularPairings: ['Honey', 'Lemon']
      },
      // Pastries
      {
        name: 'Butter Croissant',
        description: 'Flaky, buttery French croissant',
        categoryId: pastriesCategory?.id || '',
        basePrice: 3.25,
        preparationTimeMinutes: 2,
        productType: 'pastry',
        nutritionalInfo: {
          caloriesPerServing: 250,
          allergens: ['Gluten', 'Dairy']
        },
        popularPairings: ['Coffee', 'Tea', 'Jam']
      },
      {
        name: 'Blueberry Muffin',
        description: 'Fresh baked muffin with wild blueberries',
        categoryId: pastriesCategory?.id || '',
        basePrice: 2.75,
        preparationTimeMinutes: 1,
        productType: 'pastry',
        nutritionalInfo: {
          caloriesPerServing: 320,
          allergens: ['Gluten', 'Dairy', 'Eggs']
        },
        popularPairings: ['Coffee', 'Tea']
      }
    ]

    const createdProducts = []
    for (const productData of products) {
      if (productData.categoryId) {
        const result = await this.createProduct(organizationId, productData)
        if (result.success) {
          createdProducts.push({
            ...result.data,
            name: productData.name,
            type: productData.productType
          })
        }
      }
    }

    return { success: true, data: createdProducts }
  }

  /**
   * Create product variants for tea shop products
   */
  private static async createProductVariants(organizationId: string, products: any[]): Promise<ServiceResult> {
    const variants: VariantData[] = []

    // Create size variants for all tea products
    const teaProducts = products.filter(p => p.type === 'tea')
    teaProducts.forEach(product => {
      variants.push(
        {
          productId: product.id,
          variantType: 'size',
          variantName: 'Size',
          variantValue: 'Small (8oz)',
          priceModifier: -0.50,
          isDefault: false
        },
        {
          productId: product.id,
          variantType: 'size',
          variantName: 'Size',
          variantValue: 'Medium (12oz)',
          priceModifier: 0.00,
          isDefault: true
        },
        {
          productId: product.id,
          variantType: 'size',
          variantName: 'Size',
          variantValue: 'Large (16oz)',
          priceModifier: 0.75
        },
        {
          productId: product.id,
          variantType: 'temperature',
          variantName: 'Temperature',
          variantValue: 'Hot',
          priceModifier: 0.00,
          isDefault: true
        },
        {
          productId: product.id,
          variantType: 'temperature',
          variantName: 'Temperature',
          variantValue: 'Iced',
          priceModifier: 0.25
        }
      )
    })

    // Create variants for pastries
    const pastryProducts = products.filter(p => p.type === 'pastry')
    pastryProducts.forEach(product => {
      variants.push(
        {
          productId: product.id,
          variantType: 'size',
          variantName: 'Size',
          variantValue: 'Regular',
          priceModifier: 0.00,
          isDefault: true
        },
        {
          productId: product.id,
          variantType: 'dietary',
          variantName: 'Dietary',
          variantValue: 'Regular',
          priceModifier: 0.00,
          isDefault: true
        },
        {
          productId: product.id,
          variantType: 'dietary',
          variantName: 'Dietary',
          variantValue: 'Gluten-Free',
          priceModifier: 1.00
        }
      )
    })

    const createdVariants = []
    for (const variantData of variants) {
      const result = await this.createProductVariant(organizationId, variantData)
      if (result.success) {
        createdVariants.push(result.data)
      }
    }

    return { success: true, data: createdVariants }
  }

  /**
   * Utility: Get a system user ID for created_by field
   * This handles the NOT NULL constraint on core_metadata.created_by
   */
  private static async getSystemUserId(): Promise<string> {
    try {
      // Try to get an existing user
      const { data: users, error } = await supabase
        .from('core_users')
        .select('id')
        .limit(1);

      if (!error && users && users.length > 0) {
        return users[0].id;
      }

      // If no users exist, return a default system UUID
      // This should not happen in production, but provides fallback
      return '00000000-0000-0000-0000-000000000000';
    } catch (error) {
      console.warn('Could not get system user ID, using default:', error);
      return '00000000-0000-0000-0000-000000000000';
    }
  }

  /**
   * Utility: Generate consistent entity codes
   */
  private static generateEntityCode(name: string, type: string): string {
    const baseCode = name.replace(/[^A-Z0-9]/gi, '').toUpperCase().slice(0, 8)
    const random = Math.random().toString(36).substring(2, 6).toUpperCase()
    const typeCode = type.slice(0, 3)
    return `${baseCode}-${random}-${typeCode}`
  }
}

export default ProductCatalogService