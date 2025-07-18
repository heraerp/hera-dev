/**
 * HERA Universal - Product Service Adapter
 * Bridges ProductCatalogService with CRUDServiceInterface for template integration
 * Maintains all existing business logic while adding CRUD template capabilities
 */

import { 
  CRUDServiceInterface, 
  ServiceResult, 
  ListOptions, 
  SearchOptions,
  CRUDOperation 
} from '@/templates/crud/types/crud-types'
import { ProductCatalogService, ProductData, CategoryData } from '@/lib/services/productCatalogService'

// ============================================================================
// TYPE MAPPINGS
// ============================================================================

// Convert ProductData to CRUD entity format
export interface ProductCRUDEntity {
  id?: string
  // Core fields
  name: string
  description: string
  categoryId: string
  productType: 'tea' | 'pastry' | 'beverage' | 'food'
  basePrice: number
  sku?: string
  preparationTimeMinutes?: number
  isActive: boolean
  seasonalAvailability?: boolean
  originStory?: string
  popularPairings?: string
  
  // Nested objects flattened for CRUD
  'brewingInstructions.temperature'?: string
  'brewingInstructions.steepingTime'?: string
  'brewingInstructions.teaAmount'?: string
  'nutritionalInfo.caffeineContent'?: string
  'nutritionalInfo.caloriesPerServing'?: number
  'nutritionalInfo.allergens'?: string[]
  
  // Metadata from universal schema
  categoryName?: string
  metadata?: any
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Converts ProductData to ProductCRUDEntity format
 */
function convertProductToCRUDEntity(product: any, categoryName?: string): ProductCRUDEntity {
  return {
    id: product.id,
    name: product.name || product.entity_name,
    description: product.description,
    categoryId: product.categoryId,
    productType: product.productType,
    basePrice: product.basePrice,
    sku: product.sku,
    preparationTimeMinutes: product.preparationTimeMinutes,
    isActive: product.isActive ?? true,
    seasonalAvailability: product.seasonalAvailability ?? false,
    originStory: product.originStory,
    popularPairings: Array.isArray(product.popularPairings) 
      ? product.popularPairings.join(', ')
      : product.popularPairings,
    
    // Flatten brewing instructions
    'brewingInstructions.temperature': product.brewingInstructions?.temperature,
    'brewingInstructions.steepingTime': product.brewingInstructions?.steepingTime,
    'brewingInstructions.teaAmount': product.brewingInstructions?.teaAmount,
    
    // Flatten nutritional info
    'nutritionalInfo.caffeineContent': product.nutritionalInfo?.caffeineContent,
    'nutritionalInfo.caloriesPerServing': product.nutritionalInfo?.caloriesPerServing,
    'nutritionalInfo.allergens': product.nutritionalInfo?.allergens,
    
    // Additional metadata
    categoryName,
    metadata: product.metadata,
    createdAt: product.createdAt || product.created_at,
    updatedAt: product.updatedAt || product.updated_at
  }
}

/**
 * Converts ProductCRUDEntity back to ProductData format
 */
function convertCRUDEntityToProduct(entity: Partial<ProductCRUDEntity>): ProductData {
  return {
    name: entity.name!,
    description: entity.description!,
    categoryId: entity.categoryId!,
    productType: entity.productType!,
    basePrice: entity.basePrice!,
    sku: entity.sku,
    preparationTimeMinutes: entity.preparationTimeMinutes,
    isActive: entity.isActive ?? true,
    seasonalAvailability: entity.seasonalAvailability ?? false,
    originStory: entity.originStory,
    popularPairings: entity.popularPairings 
      ? entity.popularPairings.split(',').map(s => s.trim())
      : undefined,
    
    // Reconstruct brewing instructions
    brewingInstructions: {
      temperature: entity['brewingInstructions.temperature'],
      steepingTime: entity['brewingInstructions.steepingTime'],
      teaAmount: entity['brewingInstructions.teaAmount']
    },
    
    // Reconstruct nutritional info
    nutritionalInfo: {
      caffeineContent: entity['nutritionalInfo.caffeineContent'],
      caloriesPerServing: entity['nutritionalInfo.caloriesPerServing'],
      allergens: entity['nutritionalInfo.allergens']
    }
  }
}

// ============================================================================
// PRODUCT SERVICE ADAPTER
// ============================================================================

export class ProductServiceAdapter implements CRUDServiceInterface {
  private categories: Map<string, string> = new Map() // categoryId -> categoryName mapping

  constructor() {
    // No need to store organizationId as it comes with each call
  }

  /**
   * Initialize categories mapping for display
   */
  private async ensureCategoriesLoaded(organizationId: string): Promise<void> {
    if (this.categories.size === 0) {
      try {
        console.log('🔍 Loading categories for organization:', organizationId)
        
        // Use getProductCatalog to get categories since getProductCategories doesn't exist
        const catalogResult = await ProductCatalogService.getProductCatalog(organizationId)
        if (catalogResult.success && catalogResult.data?.categories) {
          catalogResult.data.categories.forEach((category: any) => {
            this.categories.set(category.id, category.entity_name || category.name)
            console.log('📊 Loaded category:', category.entity_name || category.name, '(ID:', category.id + ')')
          })
        }
        
        // Add default category mappings if no categories loaded
        if (this.categories.size === 0) {
          console.log('⚠️ No categories found, using defaults')
          this.categories.set('tea', 'Tea')
          this.categories.set('pastry', 'Pastry')
          this.categories.set('beverage', 'Beverage')
          this.categories.set('food', 'Food')
          this.categories.set('other', 'Other')
        }
      } catch (error) {
        console.error('❌ Error loading categories:', error)
        // Silently add default categories if loading fails
        this.categories.set('tea', 'Tea')
        this.categories.set('pastry', 'Pastry')
        this.categories.set('beverage', 'Beverage')
        this.categories.set('food', 'Food')
        this.categories.set('other', 'Other')
      }
    }
  }

  /**
   * Create new product
   */
  async create(organizationId: string, data: any): Promise<ServiceResult> {
    try {
      console.log('🔍 ProductServiceAdapter.create called with:', { organizationId, data })
      
      const productData = convertCRUDEntityToProduct(data)
      console.log('🔄 Converted product data:', productData)
      
      const result = await ProductCatalogService.createProduct(organizationId, productData)
      console.log('📊 ProductCatalogService.createProduct result:', result)
      
      if (!result.success) {
        console.error('❌ Product creation failed:', result.error, result.details)
        return {
          success: false,
          error: result.error || 'Failed to create product'
        }
      }

      if (!result.data?.id) {
        console.error('❌ Product creation succeeded but no ID returned:', result)
        return {
          success: false,
          error: 'Product created but no ID returned'
        }
      }

      console.log('✅ Product created successfully with ID:', result.data.id)
      
      // Return success with the basic product data (we can't fetch individual products)
      return {
        success: true,
        data: {
          id: result.data.id,
          ...productData,
          code: result.data.code
        }
      }

    } catch (error) {
      console.error('❌ ProductServiceAdapter.create error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  /**
   * Get single product by ID
   */
  async read(organizationId: string, id: string): Promise<ServiceResult> {
    try {
      await this.ensureCategoriesLoaded(organizationId)

      // Since there's no getProduct method, we'll get all products and find the one we need
      const result = await ProductCatalogService.getProductCatalog(organizationId)
      
      if (!result.success || !result.data?.products) {
        return {
          success: false,
          error: result.error || 'Failed to fetch products'
        }
      }

      // Find the specific product by ID
      const product = result.data.products.find((p: any) => p.id === id)
      
      if (!product) {
        return {
          success: false,
          error: 'Product not found'
        }
      }

      const entity = convertProductToCRUDEntity(
        product, 
        this.categories.get(product.categoryId || product.dynamicData?.category_id?.value)
      )

      return {
        success: true,
        data: entity
      }

    } catch (error) {
      console.error('ProductServiceAdapter.read error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  /**
   * Update existing product
   */
  async update(organizationId: string, id: string, data: any): Promise<ServiceResult> {
    try {
      const productData = convertCRUDEntityToProduct(data)
      
      const result = await ProductCatalogService.updateProduct(organizationId, id, productData)
      
      if (!result.success) {
        return {
          success: false,
          error: result.error || 'Failed to update product'
        }
      }

      // Fetch the updated product to return complete data
      const getResult = await this.read(organizationId, id)
      
      return getResult

    } catch (error) {
      console.error('ProductServiceAdapter.update error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  /**
   * Delete product
   */
  async delete(organizationId: string, id: string): Promise<ServiceResult> {
    try {
      const result = await ProductCatalogService.deleteProduct(organizationId, id)
      
      if (!result.success) {
        return {
          success: false,
          error: result.error || 'Failed to delete product'
        }
      }

      return {
        success: true,
        data: null
      }

    } catch (error) {
      console.error('ProductServiceAdapter.delete error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  /**
   * List products with filtering, sorting, and pagination
   */
  async list(organizationId: string, options: ListOptions = {}): Promise<ServiceResult> {
    try {
      console.log('🔍 ProductServiceAdapter.list called with:', { organizationId, options })
      
      await this.ensureCategoriesLoaded(organizationId)

      const result = await ProductCatalogService.getProductCatalog(organizationId)
      console.log('📊 ProductCatalogService.getProductCatalog result:', result)
      
      if (!result.success) {
        console.error('❌ Failed to get product catalog:', result.error)
        return {
          success: false,
          error: result.error || 'Failed to fetch products'
        }
      }

      let products = result.data?.products || []
      console.log('🔄 Raw products from catalog:', products)

      // Apply search filter
      if (options.search) {
        const searchLower = options.search.toLowerCase()
        products = products.filter((product: any) => 
          product.name?.toLowerCase().includes(searchLower) ||
          product.description?.toLowerCase().includes(searchLower) ||
          product.sku?.toLowerCase().includes(searchLower)
        )
      }

      // Apply field filters
      if (options.filters) {
        products = products.filter((product: any) => {
          return Object.entries(options.filters!).every(([field, value]) => {
            if (value === null || value === undefined || value === '') return true
            
            const productValue = product[field]
            
            if (Array.isArray(value)) {
              return value.includes(productValue)
            }
            
            if (typeof value === 'string') {
              return String(productValue).toLowerCase().includes(value.toLowerCase())
            }
            
            return productValue === value
          })
        })
      }

      // Apply sorting
      if (options.sort) {
        products.sort((a: any, b: any) => {
          const aValue = a[options.sort!.key]
          const bValue = b[options.sort!.key]
          
          if (aValue < bValue) return options.sort!.direction === 'desc' ? 1 : -1
          if (aValue > bValue) return options.sort!.direction === 'desc' ? -1 : 1
          return 0
        })
      }

      // Apply pagination
      const total = products.length
      const pageSize = options.pageSize || 50
      const page = options.page || 1
      const offset = (page - 1) * pageSize
      const paginatedProducts = products.slice(offset, offset + pageSize)

      // Convert to CRUD entities
      const entities = paginatedProducts.map((product: any) => 
        convertProductToCRUDEntity(product, this.categories.get(product.categoryId))
      )

      console.log('✅ Final entities to return:', entities)
      console.log('📊 Metadata:', {
        total,
        page,
        pageSize,
        hasMore: offset + pageSize < total
      })

      return {
        success: true,
        data: entities,
        metadata: {
          total,
          page,
          pageSize,
          hasMore: offset + pageSize < total
        }
      }

    } catch (error) {
      console.error('ProductServiceAdapter.list error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  /**
   * Search products with query
   */
  async search(organizationId: string, query: string, options: SearchOptions = {}): Promise<ServiceResult> {
    // Use the list method with search query
    return this.list(organizationId, { ...options, search: query })
  }

  /**
   * Bulk delete products
   */
  async bulkDelete(organizationId: string, ids: string[]): Promise<ServiceResult> {
    try {
      const results = await Promise.allSettled(
        ids.map(id => this.delete(organizationId, id))
      )

      const failures = results.filter(result => 
        result.status === 'rejected' || 
        (result.status === 'fulfilled' && !result.value.success)
      )

      if (failures.length > 0) {
        return {
          success: false,
          error: `Failed to delete ${failures.length} of ${ids.length} products`
        }
      }

      return {
        success: true,
        data: null
      }

    } catch (error) {
      console.error('ProductServiceAdapter.bulkDelete error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }
}

// ============================================================================
// FACTORY FUNCTION
// ============================================================================

/**
 * Creates a ProductServiceAdapter instance
 */
export function createProductServiceAdapter(): ProductServiceAdapter {
  return new ProductServiceAdapter()
}