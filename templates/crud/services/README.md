# HERA Universal CRUD Services

This directory contains service implementations that follow the HERA Universal Architecture patterns for consistent data management across all business entities.

## Service Architecture

### Universal CRUD Service Interface

All CRUD services must implement the `CRUDServiceInterface` for consistent behavior:

```typescript
interface CRUDServiceInterface {
  // Basic CRUD operations
  create: (organizationId: string, data: any) => Promise<ServiceResult>
  read: (organizationId: string, id: string) => Promise<ServiceResult>
  update: (organizationId: string, id: string, data: any) => Promise<ServiceResult>
  delete: (organizationId: string, id: string) => Promise<ServiceResult>
  
  // List operations
  list: (organizationId: string, options?: ListOptions) => Promise<ServiceResult>
  search: (organizationId: string, query: string, options?: SearchOptions) => Promise<ServiceResult>
  
  // Bulk operations (optional)
  bulkCreate?: (organizationId: string, items: any[]) => Promise<ServiceResult>
  bulkUpdate?: (organizationId: string, items: any[]) => Promise<ServiceResult>
  bulkDelete?: (organizationId: string, ids: string[]) => Promise<ServiceResult>
  
  // Validation (optional)
  validate?: (organizationId: string, data: any, operation: CRUDOperation) => Promise<ValidationResult>
}
```

## Implementation Examples

### 1. Product Catalog Service

```typescript
import { CRUDServiceInterface, ServiceResult } from '../types/crud-types'
import UniversalCrudService from '@/lib/services/universalCrudService'
import { HeraNamingConventionAI } from '@/lib/naming/heraNamingConvention'

export class ProductCatalogCrudService implements CRUDServiceInterface {
  private entityType = 'product'

  async create(organizationId: string, data: any): Promise<ServiceResult> {
    try {
      // Validate naming convention
      const validation = await HeraNamingConventionAI.validateEntityType(this.entityType)
      if (!validation.isValid) {
        return { success: false, error: validation.error }
      }

      // Use Universal CRUD Service
      const result = await UniversalCrudService.createEntity({
        organizationId,
        entityType: this.entityType,
        entityName: data.name,
        entityCode: data.code,
        fields: {
          description: data.description,
          price: data.price,
          category: data.category,
          is_available: data.isAvailable ?? true
        },
        metadata: {
          product_details: {
            ingredients: data.ingredients,
            allergens: data.allergens,
            nutritional_info: data.nutritionalInfo
          }
        }
      }, this.entityType)

      return result
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create product' 
      }
    }
  }

  async read(organizationId: string, id: string): Promise<ServiceResult> {
    return UniversalCrudService.readEntity(organizationId, id)
  }

  async update(organizationId: string, id: string, data: any): Promise<ServiceResult> {
    try {
      const result = await UniversalCrudService.updateEntity(organizationId, id, {
        entityFields: {
          entity_name: data.name,
          entity_code: data.code
        },
        dynamicFields: {
          description: data.description,
          price: data.price,
          category: data.category,
          is_available: data.isAvailable
        },
        metadata: {
          product_details: {
            ingredients: data.ingredients,
            allergens: data.allergens,
            nutritional_info: data.nutritionalInfo
          }
        }
      })

      return result
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update product' 
      }
    }
  }

  async delete(organizationId: string, id: string): Promise<ServiceResult> {
    return UniversalCrudService.deleteEntity(organizationId, id)
  }

  async list(organizationId: string, options: any = {}): Promise<ServiceResult> {
    try {
      const result = await UniversalCrudService.listEntities(organizationId, this.entityType, {
        page: options.page || 1,
        pageSize: options.pageSize || 25,
        sortBy: options.sort?.key,
        sortDirection: options.sort?.direction,
        filters: options.filters,
        search: options.search
      })

      return result
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to list products' 
      }
    }
  }

  async search(organizationId: string, query: string, options: any = {}): Promise<ServiceResult> {
    return this.list(organizationId, { ...options, search: query })
  }

  async bulkDelete(organizationId: string, ids: string[]): Promise<ServiceResult> {
    try {
      const results = await Promise.all(
        ids.map(id => this.delete(organizationId, id))
      )

      const failed = results.filter(r => !r.success)
      if (failed.length > 0) {
        return { 
          success: false, 
          error: `Failed to delete ${failed.length} of ${ids.length} products` 
        }
      }

      return { success: true, data: { deleted: ids.length } }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Bulk delete failed' 
      }
    }
  }

  async validate(organizationId: string, data: any): Promise<any> {
    const errors: Record<string, string> = {}

    // Required fields
    if (!data.name?.trim()) {
      errors.name = 'Product name is required'
    }

    if (!data.code?.trim()) {
      errors.code = 'Product code is required'
    }

    if (typeof data.price !== 'number' || data.price < 0) {
      errors.price = 'Valid price is required'
    }

    // Business logic validation
    if (data.code && !/^[A-Z0-9-]+$/.test(data.code)) {
      errors.code = 'Product code must contain only uppercase letters, numbers, and hyphens'
    }

    return {
      valid: Object.keys(errors).length === 0,
      errors
    }
  }
}

export const productCatalogService = new ProductCatalogCrudService()
```

### 2. Customer Management Service

```typescript
export class CustomerCrudService implements CRUDServiceInterface {
  private entityType = 'customer'

  async create(organizationId: string, data: any): Promise<ServiceResult> {
    // Similar implementation following HERA patterns
    // Focus on customer-specific fields and validation
  }

  // ... other methods
}
```

## Service Guidelines

### 1. Organization-First Pattern

**Always** include `organizationId` as the first parameter in all methods:

```typescript
// ✅ Correct
async create(organizationId: string, data: any): Promise<ServiceResult>

// ❌ Wrong
async create(data: any): Promise<ServiceResult>
```

### 2. Use Universal CRUD Service

Leverage the `UniversalCrudService` for all database operations:

```typescript
import UniversalCrudService from '@/lib/services/universalCrudService'

// Use the universal patterns
const result = await UniversalCrudService.createEntity(entityData, entityType)
```

### 3. Naming Convention Validation

Always validate field names using the naming convention AI:

```typescript
import { HeraNamingConventionAI } from '@/lib/naming/heraNamingConvention'

const validation = await HeraNamingConventionAI.validateEntityType(entityType)
if (!validation.isValid) {
  return { success: false, error: validation.error }
}
```

### 4. Error Handling

Consistent error handling with detailed messages:

```typescript
try {
  // Operation
  return { success: true, data: result }
} catch (error) {
  return { 
    success: false, 
    error: error instanceof Error ? error.message : 'Operation failed' 
  }
}
```

### 5. Validation Implementation

Implement business logic validation:

```typescript
async validate(organizationId: string, data: any): Promise<ValidationResult> {
  const errors: Record<string, string> = {}
  
  // Required field validation
  if (!data.requiredField) {
    errors.requiredField = 'This field is required'
  }
  
  // Business rule validation
  if (data.email && !isValidEmail(data.email)) {
    errors.email = 'Please enter a valid email address'
  }
  
  return {
    valid: Object.keys(errors).length === 0,
    errors
  }
}
```

## Testing Services

### Unit Testing

```typescript
import { ProductCatalogCrudService } from './productCatalogService'

describe('ProductCatalogCrudService', () => {
  const service = new ProductCatalogCrudService()
  const organizationId = 'test-org-id'

  it('should create a product', async () => {
    const productData = {
      name: 'Test Product',
      code: 'TEST-001',
      price: 9.99,
      description: 'A test product'
    }

    const result = await service.create(organizationId, productData)
    
    expect(result.success).toBe(true)
    expect(result.data).toBeDefined()
  })

  it('should validate required fields', async () => {
    const invalidData = { name: '' }
    
    const validation = await service.validate(organizationId, invalidData)
    
    expect(validation.valid).toBe(false)
    expect(validation.errors.name).toBeDefined()
  })
})
```

### Integration Testing

```typescript
describe('ProductCatalogCrudService Integration', () => {
  it('should perform full CRUD cycle', async () => {
    const service = new ProductCatalogCrudService()
    const organizationId = 'test-org-id'
    
    // Create
    const createResult = await service.create(organizationId, productData)
    expect(createResult.success).toBe(true)
    
    const productId = createResult.data.id
    
    // Read
    const readResult = await service.read(organizationId, productId)
    expect(readResult.success).toBe(true)
    
    // Update
    const updateResult = await service.update(organizationId, productId, updatedData)
    expect(updateResult.success).toBe(true)
    
    // Delete
    const deleteResult = await service.delete(organizationId, productId)
    expect(deleteResult.success).toBe(true)
  })
})
```

## Best Practices

1. **Consistent Interface**: Always implement the full `CRUDServiceInterface`
2. **Organization Isolation**: Never access data across organizations
3. **Universal Architecture**: Use the universal schema patterns
4. **Naming Convention**: Validate all field names with AI
5. **Error Handling**: Provide clear, actionable error messages
6. **Validation**: Implement comprehensive business rule validation
7. **Testing**: Write both unit and integration tests
8. **Performance**: Implement proper pagination and filtering
9. **Security**: Validate all inputs and sanitize data
10. **Documentation**: Document business rules and validation logic

This service architecture ensures consistent, scalable, and maintainable CRUD operations across the entire HERA Universal platform.