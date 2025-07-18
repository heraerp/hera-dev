/**
 * CRUD Service Adapter Factory
 * Rapidly create service adapters following HERA Universal patterns
 */

import { BaseCRUDServiceAdapter, CRUDAdapterConfig } from '../base/BaseCRUDServiceAdapter'

/**
 * Factory function to create CRUD service adapters
 * Reduces boilerplate and ensures consistency
 */
export function createCRUDServiceAdapter<TEntity, TCRUDEntity>(
  service: any,
  config: CRUDAdapterConfig<TEntity, TCRUDEntity>,
  customExtractEntities?: (catalogData: any) => any[]
) {
  return class extends BaseCRUDServiceAdapter<TEntity, TCRUDEntity> {
    constructor() {
      super(service, config)
    }

    protected extractEntitiesFromCatalog(catalogData: any): any[] {
      if (customExtractEntities) {
        return customExtractEntities(catalogData)
      }

      // Default extraction patterns
      if (catalogData.products) return catalogData.products
      if (catalogData.entities) return catalogData.entities
      if (catalogData.items) return catalogData.items
      if (Array.isArray(catalogData)) return catalogData
      
      console.warn(`⚠️ Could not extract entities from catalog data:`, catalogData)
      return []
    }
  }
}

/**
 * Quick adapter creation for simple cases
 */
export function createSimpleCRUDAdapter<T>(config: {
  service: any
  serviceName: string
  entityType: string
  catalogMethod: string
  createMethod?: string
  updateMethod?: string
  deleteMethod?: string
  entityArrayPath?: string // e.g., 'products', 'data.items'
}) {
  const adapterConfig: CRUDAdapterConfig<T, T> = {
    serviceName: config.serviceName,
    entityType: config.entityType,
    catalogMethod: config.catalogMethod,
    createMethod: config.createMethod || 'create' + config.entityType,
    updateMethod: config.updateMethod || 'update' + config.entityType,
    deleteMethod: config.deleteMethod || 'delete' + config.entityType,
    
    // Identity converters for simple cases
    toCRUD: (entity: T) => entity,
    fromCRUD: (crudEntity: Partial<T>) => crudEntity as T,
    
    // Extract entities based on path
    extractReferenceData: config.entityArrayPath ? (catalogData: any) => {
      const path = config.entityArrayPath!.split('.')
      let data = catalogData
      for (const segment of path) {
        data = data?.[segment]
      }
      return Array.isArray(data) ? data.map((item: any) => ({
        id: item.id,
        name: item.name || item.entity_name
      })) : []
    } : undefined
  }

  return createCRUDServiceAdapter(config.service, adapterConfig, (catalogData) => {
    if (!config.entityArrayPath) return []
    
    const path = config.entityArrayPath.split('.')
    let data = catalogData
    for (const segment of path) {
      data = data?.[segment]
    }
    return Array.isArray(data) ? data : []
  })
}

// ============================================================================
// EXAMPLE IMPLEMENTATIONS
// ============================================================================

/**
 * Example: Product Service Adapter using factory
 */
export function createProductServiceAdapter() {
  const ProductServiceAdapter = createCRUDServiceAdapter(
    ProductCatalogService,
    {
      serviceName: 'ProductCatalogService',
      entityType: 'product',
      catalogMethod: 'getProductCatalog',
      createMethod: 'createProduct',
      updateMethod: 'updateProduct',
      deleteMethod: 'deleteProduct',
      
      toCRUD: (product: any, categoryMap?: Map<string, string>) => ({
        id: product.id,
        name: product.name || product.entity_name,
        description: product.description,
        categoryId: product.categoryId,
        productType: product.productType,
        basePrice: product.basePrice,
        sku: product.sku,
        isActive: product.isActive ?? true,
        categoryName: categoryMap?.get(product.categoryId)
      }),
      
      fromCRUD: (crudEntity: any) => ({
        name: crudEntity.name,
        description: crudEntity.description,
        categoryId: crudEntity.categoryId,
        productType: crudEntity.productType,
        basePrice: crudEntity.basePrice,
        sku: crudEntity.sku,
        isActive: crudEntity.isActive ?? true
      }),
      
      extractReferenceData: (catalogData: any) => 
        catalogData.categories?.map((cat: any) => ({
          id: cat.id,
          name: cat.entity_name || cat.name
        })) || [],
      
      defaultReferenceData: {
        'tea': 'Tea',
        'pastry': 'Pastry', 
        'beverage': 'Beverage',
        'food': 'Food',
        'other': 'Other'
      },
      
      generateCode: (name: string, data: any) => 
        name.replace(/[^A-Z0-9]/gi, '').toUpperCase().slice(0, 8) + '-' + 
        Math.random().toString(36).substring(2, 6).toUpperCase() + '-PRD'
    },
    (catalogData) => catalogData.products || []
  )

  return new ProductServiceAdapter()
}

/**
 * Example: Customer Service Adapter using simple factory
 */
export function createCustomerServiceAdapter() {
  const CustomerServiceAdapter = createSimpleCRUDAdapter({
    service: CustomerService,
    serviceName: 'CustomerService',
    entityType: 'customer',
    catalogMethod: 'getCustomerCatalog',
    entityArrayPath: 'customers'
  })

  return new CustomerServiceAdapter()
}

/**
 * Example: Order Service Adapter with complex mapping
 */
export function createOrderServiceAdapter() {
  const OrderServiceAdapter = createCRUDServiceAdapter(
    OrderService,
    {
      serviceName: 'OrderService',
      entityType: 'order',
      catalogMethod: 'getOrderCatalog',
      createMethod: 'createOrder',
      updateMethod: 'updateOrder',
      deleteMethod: 'deleteOrder',
      
      toCRUD: (order: any, referenceData?: Map<string, string>) => ({
        id: order.id,
        orderNumber: order.transaction_number || order.orderNumber,
        customerName: order.customerName,
        status: order.transaction_status || order.status,
        totalAmount: order.total_amount || order.totalAmount,
        orderDate: order.transaction_date || order.orderDate,
        items: order.items || []
      }),
      
      fromCRUD: (crudEntity: any) => ({
        customerName: crudEntity.customerName,
        status: crudEntity.status,
        totalAmount: crudEntity.totalAmount,
        orderDate: crudEntity.orderDate,
        items: crudEntity.items || []
      }),
      
      generateCode: (customerName: string) => 
        'ORD-' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + '-' +
        Math.random().toString(36).substring(2, 5).toUpperCase()
    },
    (catalogData) => catalogData.orders || catalogData.transactions || []
  )

  return new OrderServiceAdapter()
}