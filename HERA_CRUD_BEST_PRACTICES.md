# HERA Universal CRUD Best Practices
## Lessons Learned from Enhanced Products Implementation

This document captures critical patterns and pitfalls discovered during the Enhanced Products Management implementation. **Follow these patterns to avoid the same issues in all future CRUD implementations.**

## 🚨 **CRITICAL ERRORS TO AVOID**

### **Error 1: Missing Import Dependencies**
```typescript
// ❌ WRONG - Missing imports cause runtime errors
import { useEffect, useRef } from 'react'
import type { RealtimeChannel } from '@supabase/supabase-js'
// Missing: import { createClient } from '@/lib/supabase/client'

// ✅ CORRECT - Always include all required imports
import { useEffect, useRef } from 'react'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
```

**Prevention Rule**: Before implementing any CRUD template component, verify all imports are present and test the basic loading.

### **Error 2: RLS Client vs Admin Client Confusion**
```typescript
// ❌ WRONG - Using regular client for data reads (blocked by RLS)
const { data: entities } = await supabase
  .from('core_entities')
  .select('*')
  .eq('organization_id', organizationId)

// ✅ CORRECT - Use admin client for service layer operations
const { data: entities } = await supabaseAdmin
  .from('core_entities')
  .select('*')
  .eq('organization_id', organizationId)
```

**Prevention Rule**: **ALL** service layer methods that read/write data MUST use `supabaseAdmin` client to bypass RLS.

### **Error 3: Calling Non-Existent Service Methods**
```typescript
// ❌ WRONG - Calling methods that don't exist
const result = await ProductCatalogService.getProduct(id) // Method doesn't exist
const categories = await ProductCatalogService.getProductCategories(orgId) // Method doesn't exist

// ✅ CORRECT - Use existing methods or create proper fallbacks
const catalogResult = await ProductCatalogService.getProductCatalog(orgId)
const product = catalogResult.data?.products.find(p => p.id === id)
const categories = catalogResult.data?.categories
```

**Prevention Rule**: Before calling service methods, verify they exist. Create adapters that use existing methods.

### **Error 4: Service Result Data Structure Mismatches**
```typescript
// ❌ WRONG - Assuming return data structure without checking
return {
  success: true,
  data: {
    id: result.data.id,
    code: result.data.code  // ❌ Assuming 'code' exists
  }
}

// ✅ CORRECT - Defensive data access with fallbacks
return {
  success: true,
  data: {
    id: result.data.id,
    ...productData,
    code: result.data?.code || result.data?.sku || generateCode(productData.name)
  }
}
```

**Prevention Rule**: Always use optional chaining and provide fallbacks for data that might not exist.

## 🎯 **MANDATORY PATTERNS FOR ALL CRUD IMPLEMENTATIONS**

### **Pattern 1: Service Layer Configuration**
```typescript
// Required setup for ALL service classes
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'

// Regular client for minimal read operations (if needed)
const supabase = createClient()

// Admin client for ALL service operations (MANDATORY)
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
```

### **Pattern 2: Service Adapter Interface Compliance**
```typescript
// MANDATORY interface implementation for ALL adapters
export class EntityServiceAdapter implements CRUDServiceInterface {
  private cache: Map<string, string> = new Map()

  // ✅ REQUIRED: Handle organization context first
  async create(organizationId: string, data: any): Promise<ServiceResult> {
    try {
      console.log('🔍 EntityServiceAdapter.create called with:', { organizationId, data })
      
      // Convert CRUD entity to service format
      const entityData = this.convertCRUDToEntity(data)
      
      // Call underlying service with admin privileges
      const result = await EntityService.createEntity(organizationId, entityData)
      
      if (!result.success) {
        return { success: false, error: result.error || 'Creation failed' }
      }

      // Return success with enriched data including code/ID
      return {
        success: true,
        data: {
          id: result.data.id,
          ...entityData,
          code: result.data.code || result.data.entity_code || this.generateCode(entityData.name)
        }
      }
    } catch (error) {
      console.error('❌ EntityServiceAdapter.create error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  // ✅ REQUIRED: Proper list implementation with filtering
  async list(organizationId: string, options: ListOptions = {}): Promise<ServiceResult> {
    try {
      console.log('🔍 EntityServiceAdapter.list called with:', { organizationId, options })
      
      // Load any required cache/reference data
      await this.ensureReferenceDataLoaded(organizationId)

      // Get data from underlying service
      const result = await EntityService.getEntityCatalog(organizationId)
      
      if (!result.success || !result.data?.entities) {
        return { success: false, error: result.error || 'Failed to fetch entities' }
      }

      let entities = result.data.entities

      // Apply search, filtering, sorting, pagination
      entities = this.applyFilters(entities, options)
      entities = this.applySorting(entities, options)
      const paginatedResult = this.applyPagination(entities, options)

      // Convert to CRUD format
      const crudEntities = paginatedResult.data.map(entity => 
        this.convertEntityToCRUD(entity, this.getReferenceData(entity))
      )

      console.log('✅ Final entities to return:', crudEntities)
      return {
        success: true,
        data: crudEntities,
        metadata: paginatedResult.metadata
      }
    } catch (error) {
      console.error('❌ EntityServiceAdapter.list error:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error occurred' }
    }
  }

  // ✅ REQUIRED: Reference data loading with fallbacks
  private async ensureReferenceDataLoaded(organizationId: string): Promise<void> {
    if (this.cache.size === 0) {
      try {
        console.log('🔍 Loading reference data for organization:', organizationId)
        
        // Use main catalog method to get reference data
        const catalogResult = await EntityService.getEntityCatalog(organizationId)
        if (catalogResult.success && catalogResult.data?.referenceData) {
          catalogResult.data.referenceData.forEach((item: any) => {
            this.cache.set(item.id, item.name || item.entity_name)
          })
        }
        
        // Provide fallbacks if no reference data loaded
        if (this.cache.size === 0) {
          console.log('⚠️ No reference data found, using defaults')
          this.addDefaultReferenceData()
        }
      } catch (error) {
        console.error('❌ Error loading reference data:', error)
        this.addDefaultReferenceData()
      }
    }
  }
}
```

### **Pattern 3: CRUD Component Integration**
```typescript
// MANDATORY patterns for CRUD component usage
export default function EntityManagementPage() {
  // ✅ REQUIRED: Use restaurant management hook for organization context
  const { restaurantData, loading, error } = useRestaurantManagement()
  
  // ✅ REQUIRED: Handle loading states properly
  if (loading) return <LoadingRestaurant />
  if (!restaurantData) return <SetupRequired />
  
  const organizationId = restaurantData.organizationId

  // ✅ REQUIRED: Create service adapter instance
  const serviceAdapter = useMemo(() => createEntityServiceAdapter(), [])

  // ✅ REQUIRED: Success/error handlers with proper messaging
  const handleSuccess = (message: string, operation: string) => {
    toast.success(message)
    console.log(`✅ ${operation} successful:`, message)
  }

  const handleError = (error: string) => {
    toast.error(error)
    console.error('❌ CRUD operation failed:', error)
  }

  return (
    <HERAUniversalCRUD
      entityType="entity"
      entityTypeLabel="Entities"
      entitySingular="entity"
      entitySingularLabel="Entity"
      service={serviceAdapter}
      fields={EntityCRUDFields}
      organizationId={organizationId}
      onSuccess={handleSuccess}
      onError={handleError}
      enableRealTime={true}
      enableSearch={true}
      enableFilters={true}
    />
  )
}
```

### **Pattern 4: Field Definitions with Validation**
```typescript
// MANDATORY field definition structure
export const EntityCRUDFields: CRUDField[] = [
  {
    key: 'name',
    label: 'Entity Name',
    type: 'text',
    required: true,
    sortable: true,
    searchable: true,
    validation: {
      required: 'Entity name is required',
      minLength: { value: 2, message: 'Name must be at least 2 characters' }
    }
  },
  {
    key: 'description',
    label: 'Description',
    type: 'textarea',
    required: true,
    searchable: true,
    validation: {
      required: 'Description is required'
    }
  },
  {
    key: 'entityType',
    label: 'Type',
    type: 'select',
    required: true,
    filterable: true,
    options: [
      { value: 'type1', label: 'Type 1' },
      { value: 'type2', label: 'Type 2' }
    ],
    validation: {
      required: 'Type is required'
    }
  },
  {
    key: 'isActive',
    label: 'Active',
    type: 'boolean',
    defaultValue: true,
    filterable: true
  }
]
```

## 🔧 **DEBUGGING PATTERNS**

### **Debug Script Template**
```javascript
// Use this template for debugging any CRUD service
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const debugCRUDService = async () => {
  console.log('🔍 Debugging [ENTITY] CRUD Service\n');
  
  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY
    );

    const organizationId = '6fc73a3d-fe0a-45fa-9029-62a52df142e2'; // Your test org

    // Test 1: Check entities exist
    console.log('✅ Step 1: Check core_entities for [entity_type]');
    const { data: entities, error: entitiesError } = await supabaseAdmin
      .from('core_entities')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('entity_type', '[ENTITY_TYPE]');

    console.log(`📊 Found ${entities?.length || 0} entities`);
    if (entitiesError) console.error('❌ Error:', entitiesError);

    // Test 2: Check service method
    console.log('\n✅ Step 2: Test service method directly');
    // const result = await EntityService.getEntityCatalog(organizationId);
    // console.log('Service result:', result);

    // Test 3: Check adapter
    console.log('\n✅ Step 3: Test service adapter');
    // const adapter = new EntityServiceAdapter();
    // const adapterResult = await adapter.list(organizationId);
    // console.log('Adapter result:', adapterResult);

  } catch (error) {
    console.error('🚨 Debug error:', error);
  }
};

debugCRUDService();
```

## 📋 **IMPLEMENTATION CHECKLIST**

Before deploying any CRUD implementation, verify:

### **Service Layer Checklist**
- [ ] All database operations use `supabaseAdmin` client
- [ ] All methods handle organization_id parameter first
- [ ] Error handling includes detailed logging
- [ ] Success results include ID and generated codes
- [ ] Methods exist before being called in adapters

### **Service Adapter Checklist**
- [ ] Implements complete `CRUDServiceInterface`
- [ ] Converts between CRUD format and service format
- [ ] Loads reference data with fallbacks
- [ ] Handles organization context properly
- [ ] Includes comprehensive error handling
- [ ] Provides detailed console logging

### **Component Integration Checklist**
- [ ] Uses `useRestaurantManagement()` for organization context
- [ ] Handles loading and error states
- [ ] Implements proper success/error callbacks
- [ ] Provides all required imports
- [ ] Defines complete field configurations
- [ ] Enables appropriate CRUD features

### **Testing Checklist**
- [ ] Create debug script to verify data exists
- [ ] Test service methods independently
- [ ] Test adapter methods independently
- [ ] Test full CRUD component integration
- [ ] Verify real-time updates work
- [ ] Check success messages include codes/IDs

## 🎯 **REUSABLE COMPONENTS**

### **Service Adapter Factory**
```typescript
// Create this utility for generating service adapters
export function createCRUDServiceAdapter<TEntity, TCRUDEntity>(config: {
  serviceName: string
  entityType: string
  catalogMethod: string
  createMethod: string
  updateMethod: string
  deleteMethod: string
  converter: {
    toCRUD: (entity: TEntity, referenceData?: any) => TCRUDEntity
    fromCRUD: (crudEntity: Partial<TCRUDEntity>) => TEntity
  }
  referenceDataLoader?: (catalogData: any) => Map<string, string>
}) {
  return class extends BaseCRUDServiceAdapter<TEntity, TCRUDEntity> {
    // Implementation using config
  }
}
```

### **Common Debug Utilities**
```typescript
// Add to /templates/crud/utils/debug.ts
export function createDebugScript(entityType: string, organizationId: string) {
  return `
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const debug = async () => {
  const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY);
  const { data } = await supabaseAdmin.from('core_entities').select('*').eq('organization_id', '${organizationId}').eq('entity_type', '${entityType}');
  console.log('Found', data?.length || 0, '${entityType} entities');
};
debug();
  `
}
```

## 🎉 **SUCCESS PATTERNS**

When following these patterns, you should achieve:
- ✅ **Zero runtime import errors** - All dependencies properly imported
- ✅ **Complete data loading** - All entities visible in UI immediately  
- ✅ **Proper success messaging** - Messages include generated codes/IDs
- ✅ **Real-time functionality** - Live updates work out of the box
- ✅ **Error resilience** - Graceful handling of missing data/methods
- ✅ **Debugging capability** - Easy troubleshooting with provided scripts

Following these patterns will ensure every CRUD implementation works correctly on the first deployment and provides a consistent, enterprise-grade user experience across all HERA Universal modules.