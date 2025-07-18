/**
 * Base CRUD Service Adapter
 * Reusable foundation for all HERA Universal CRUD implementations
 * Learned from Enhanced Products Management implementation
 */

import { 
  CRUDServiceInterface, 
  ServiceResult, 
  ListOptions, 
  SearchOptions 
} from '../types/crud-types'

export interface CRUDAdapterConfig<TEntity, TCRUDEntity> {
  serviceName: string
  entityType: string
  
  // Service method names
  catalogMethod: string // e.g., 'getProductCatalog'
  createMethod: string  // e.g., 'createProduct'
  updateMethod: string  // e.g., 'updateProduct'
  deleteMethod: string  // e.g., 'deleteProduct'
  
  // Data converters
  toCRUD: (entity: TEntity, referenceData?: Map<string, string>) => TCRUDEntity
  fromCRUD: (crudEntity: Partial<TCRUDEntity>) => TEntity
  
  // Reference data extraction
  extractReferenceData?: (catalogData: any) => { id: string, name: string }[]
  
  // Default reference data for fallbacks
  defaultReferenceData?: { [key: string]: string }
  
  // Code generation
  generateCode?: (name: string, data: any) => string
}

/**
 * Base implementation that follows all HERA Universal patterns
 */
export abstract class BaseCRUDServiceAdapter<TEntity, TCRUDEntity> implements CRUDServiceInterface {
  protected referenceDataCache: Map<string, string> = new Map()
  protected config: CRUDAdapterConfig<TEntity, TCRUDEntity>
  protected service: any

  constructor(service: any, config: CRUDAdapterConfig<TEntity, TCRUDEntity>) {
    this.service = service
    this.config = config
  }

  /**
   * ✅ PATTERN: Reference data loading with fallbacks
   */
  protected async ensureReferenceDataLoaded(organizationId: string): Promise<void> {
    if (this.referenceDataCache.size === 0) {
      try {
        console.log(`🔍 Loading ${this.config.serviceName} reference data for organization:`, organizationId)
        
        // Use catalog method to get reference data
        const catalogResult = await this.service[this.config.catalogMethod](organizationId)
        
        if (catalogResult.success && this.config.extractReferenceData) {
          const referenceItems = this.config.extractReferenceData(catalogResult.data)
          referenceItems.forEach(item => {
            this.referenceDataCache.set(item.id, item.name)
            console.log(`📊 Loaded reference:`, item.name, `(ID: ${item.id})`)
          })
        }
        
        // Add default reference data if none loaded
        if (this.referenceDataCache.size === 0 && this.config.defaultReferenceData) {
          console.log('⚠️ No reference data found, using defaults')
          Object.entries(this.config.defaultReferenceData).forEach(([key, value]) => {
            this.referenceDataCache.set(key, value)
          })
        }
      } catch (error) {
        console.error(`❌ Error loading ${this.config.serviceName} reference data:`, error)
        
        // Always provide fallbacks
        if (this.config.defaultReferenceData) {
          Object.entries(this.config.defaultReferenceData).forEach(([key, value]) => {
            this.referenceDataCache.set(key, value)
          })
        }
      }
    }
  }

  /**
   * ✅ PATTERN: Defensive create with proper success data
   */
  async create(organizationId: string, data: any): Promise<ServiceResult> {
    try {
      console.log(`🔍 ${this.config.serviceName}Adapter.create called with:`, { organizationId, data })
      
      const entityData = this.config.fromCRUD(data)
      console.log('🔄 Converted entity data:', entityData)
      
      const result = await this.service[this.config.createMethod](organizationId, entityData)
      console.log(`📊 ${this.config.serviceName}.${this.config.createMethod} result:`, result)
      
      if (!result.success) {
        console.error(`❌ ${this.config.serviceName} creation failed:`, result.error, result.details)
        return {
          success: false,
          error: result.error || `Failed to create ${this.config.entityType}`
        }
      }

      if (!result.data?.id) {
        console.error(`❌ ${this.config.serviceName} creation succeeded but no ID returned:`, result)
        return {
          success: false,
          error: `${this.config.entityType} created but no ID returned`
        }
      }

      console.log(`✅ ${this.config.serviceName} created successfully with ID:`, result.data.id)
      
      // Generate code if needed
      const code = result.data.code || 
                   result.data.entity_code || 
                   (this.config.generateCode ? this.config.generateCode(data.name, result.data) : undefined)
      
      return {
        success: true,
        data: {
          id: result.data.id,
          ...entityData,
          code
        }
      }

    } catch (error) {
      console.error(`❌ ${this.config.serviceName}Adapter.create error:`, error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  /**
   * ✅ PATTERN: Read with fallback to catalog search
   */
  async read(organizationId: string, id: string): Promise<ServiceResult> {
    try {
      await this.ensureReferenceDataLoaded(organizationId)

      // Get from catalog since individual read might not exist
      const catalogResult = await this.service[this.config.catalogMethod](organizationId)
      
      if (!catalogResult.success || !catalogResult.data) {
        return {
          success: false,
          error: catalogResult.error || `Failed to fetch ${this.config.entityType}s`
        }
      }

      // Find specific entity by ID
      const entities = this.extractEntitiesFromCatalog(catalogResult.data)
      const entity = entities.find((e: any) => e.id === id)
      
      if (!entity) {
        return {
          success: false,
          error: `${this.config.entityType} not found`
        }
      }

      const crudEntity = this.config.toCRUD(entity, this.referenceDataCache)

      return {
        success: true,
        data: crudEntity
      }

    } catch (error) {
      console.error(`${this.config.serviceName}Adapter.read error:`, error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  /**
   * ✅ PATTERN: Update with proper result handling
   */
  async update(organizationId: string, id: string, data: any): Promise<ServiceResult> {
    try {
      const entityData = this.config.fromCRUD(data)
      
      const result = await this.service[this.config.updateMethod](organizationId, id, entityData)
      
      if (!result.success) {
        return {
          success: false,
          error: result.error || `Failed to update ${this.config.entityType}`
        }
      }

      // Return updated entity
      const getResult = await this.read(organizationId, id)
      return getResult

    } catch (error) {
      console.error(`${this.config.serviceName}Adapter.update error:`, error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  /**
   * ✅ PATTERN: Delete with proper cleanup
   */
  async delete(organizationId: string, id: string): Promise<ServiceResult> {
    try {
      const result = await this.service[this.config.deleteMethod](organizationId, id)
      
      if (!result.success) {
        return {
          success: false,
          error: result.error || `Failed to delete ${this.config.entityType}`
        }
      }

      return {
        success: true,
        data: null
      }

    } catch (error) {
      console.error(`${this.config.serviceName}Adapter.delete error:`, error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  /**
   * ✅ PATTERN: List with filtering, sorting, pagination
   */
  async list(organizationId: string, options: ListOptions = {}): Promise<ServiceResult> {
    try {
      console.log(`🔍 ${this.config.serviceName}Adapter.list called with:`, { organizationId, options })
      
      await this.ensureReferenceDataLoaded(organizationId)

      const catalogResult = await this.service[this.config.catalogMethod](organizationId)
      console.log(`📊 ${this.config.serviceName}.${this.config.catalogMethod} result:`, catalogResult)
      
      if (!catalogResult.success) {
        console.error(`❌ Failed to get ${this.config.serviceName} catalog:`, catalogResult.error)
        return {
          success: false,
          error: catalogResult.error || `Failed to fetch ${this.config.entityType}s`
        }
      }

      let entities = this.extractEntitiesFromCatalog(catalogResult.data)
      console.log(`🔄 Raw entities from catalog:`, entities.length)

      // Apply filters
      entities = this.applyFilters(entities, options)
      entities = this.applySorting(entities, options)
      const paginatedResult = this.applyPagination(entities, options)

      // Convert to CRUD entities
      const crudEntities = paginatedResult.data.map((entity: any) => 
        this.config.toCRUD(entity, this.referenceDataCache)
      )

      console.log(`✅ Final entities to return:`, crudEntities.length)
      
      return {
        success: true,
        data: crudEntities,
        metadata: paginatedResult.metadata
      }

    } catch (error) {
      console.error(`${this.config.serviceName}Adapter.list error:`, error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  /**
   * ✅ PATTERN: Search using list with query
   */
  async search(organizationId: string, query: string, options: SearchOptions = {}): Promise<ServiceResult> {
    return this.list(organizationId, { ...options, search: query })
  }

  /**
   * ✅ PATTERN: Bulk delete with error aggregation
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
          error: `Failed to delete ${failures.length} of ${ids.length} ${this.config.entityType}s`
        }
      }

      return {
        success: true,
        data: null
      }

    } catch (error) {
      console.error(`${this.config.serviceName}Adapter.bulkDelete error:`, error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  // ============================================================================
  // ABSTRACT METHODS - Implement in subclasses
  // ============================================================================

  /**
   * Extract entities array from catalog result
   * Override based on your service's data structure
   */
  protected abstract extractEntitiesFromCatalog(catalogData: any): any[]

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  protected applyFilters(entities: any[], options: ListOptions): any[] {
    let filtered = entities

    // Apply search filter
    if (options.search) {
      const searchLower = options.search.toLowerCase()
      filtered = filtered.filter((entity: any) => 
        entity.name?.toLowerCase().includes(searchLower) ||
        entity.entity_name?.toLowerCase().includes(searchLower) ||
        entity.description?.toLowerCase().includes(searchLower) ||
        entity.sku?.toLowerCase().includes(searchLower)
      )
    }

    // Apply field filters
    if (options.filters) {
      filtered = filtered.filter((entity: any) => {
        return Object.entries(options.filters!).every(([field, value]) => {
          if (value === null || value === undefined || value === '') return true
          
          const entityValue = entity[field]
          
          if (Array.isArray(value)) {
            return value.includes(entityValue)
          }
          
          if (typeof value === 'string') {
            return String(entityValue).toLowerCase().includes(value.toLowerCase())
          }
          
          return entityValue === value
        })
      })
    }

    return filtered
  }

  protected applySorting(entities: any[], options: ListOptions): any[] {
    if (!options.sort) return entities

    return [...entities].sort((a: any, b: any) => {
      const aValue = a[options.sort!.key]
      const bValue = b[options.sort!.key]
      
      if (aValue < bValue) return options.sort!.direction === 'desc' ? 1 : -1
      if (aValue > bValue) return options.sort!.direction === 'desc' ? -1 : 1
      return 0
    })
  }

  protected applyPagination(entities: any[], options: ListOptions) {
    const total = entities.length
    const pageSize = options.pageSize || 50
    const page = options.page || 1
    const offset = (page - 1) * pageSize
    const paginatedEntities = entities.slice(offset, offset + pageSize)

    return {
      data: paginatedEntities,
      metadata: {
        total,
        page,
        pageSize,
        hasMore: offset + pageSize < total
      }
    }
  }
}