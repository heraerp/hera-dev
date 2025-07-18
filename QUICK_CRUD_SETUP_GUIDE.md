# Quick CRUD Setup Guide
## From Zero to Full CRUD in 15 Minutes

This guide shows how to create a complete CRUD system for any entity using the patterns learned from Enhanced Products Management.

## 🚀 **Step 1: Create Your Service (5 minutes)**

```typescript
// /lib/services/myEntityService.ts
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// ✅ MANDATORY: Use admin client for ALL operations
const supabaseAdmin = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY!,
  {
    auth: { autoRefreshToken: false, persistSession: false },
    global: {
      headers: {
        'apikey': process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY!,
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY!}`
      }
    }
  }
)

export class MyEntityService {
  // ✅ PATTERN: Main catalog method that returns all data
  static async getMyEntityCatalog(organizationId: string) {
    try {
      console.log('🔍 MyEntityService.getMyEntityCatalog called for:', organizationId)
      
      // Get entities using admin client
      const { data: entities, error } = await supabaseAdmin
        .from('core_entities')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('entity_type', 'my_entity')
        .eq('is_active', true)

      if (error) throw error
      console.log('📊 Entities found:', entities?.length || 0)

      return {
        success: true,
        data: { entities }
      }
    } catch (error) {
      console.error('❌ Get catalog error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get catalog'
      }
    }
  }

  // ✅ PATTERN: Create method with proper ID return
  static async createMyEntity(organizationId: string, entityData: any) {
    try {
      const entityId = crypto.randomUUID()
      const entityCode = `${entityData.name.slice(0, 3).toUpperCase()}-${Date.now()}`

      const { error } = await supabaseAdmin
        .from('core_entities')
        .insert({
          id: entityId,
          organization_id: organizationId,
          entity_type: 'my_entity',
          entity_name: entityData.name,
          entity_code: entityCode,
          is_active: true
        })

      if (error) throw error

      return { 
        success: true, 
        data: { id: entityId, code: entityCode } 
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Create failed'
      }
    }
  }

  // Add update and delete methods following the same pattern...
}
```

## 🔧 **Step 2: Create Service Adapter (3 minutes)**

```typescript
// /lib/crud-configs/my-entity-service-adapter.ts
import { createCRUDServiceAdapter } from '@/templates/crud/factories/createCRUDServiceAdapter'
import { MyEntityService } from '@/lib/services/myEntityService'

export const MyEntityServiceAdapter = createCRUDServiceAdapter(
  MyEntityService,
  {
    serviceName: 'MyEntityService',
    entityType: 'my_entity',
    catalogMethod: 'getMyEntityCatalog',
    createMethod: 'createMyEntity',
    updateMethod: 'updateMyEntity',
    deleteMethod: 'deleteMyEntity',
    
    // Convert between service format and CRUD format
    toCRUD: (entity: any) => ({
      id: entity.id,
      name: entity.entity_name,
      code: entity.entity_code,
      isActive: entity.is_active,
      createdAt: entity.created_at
    }),
    
    fromCRUD: (crudEntity: any) => ({
      name: crudEntity.name,
      isActive: crudEntity.isActive ?? true
    }),
    
    generateCode: (name: string) => 
      name.slice(0, 3).toUpperCase() + '-' + Date.now()
  },
  (catalogData) => catalogData.entities || []
)

export function createMyEntityServiceAdapter() {
  return new MyEntityServiceAdapter()
}
```

## 📝 **Step 3: Define CRUD Fields (2 minutes)**

```typescript
// /lib/crud-configs/my-entity-crud-fields.ts
import { CRUDField } from '@/templates/crud/types/crud-types'

export const MyEntityCRUDFields: CRUDField[] = [
  {
    key: 'name',
    label: 'Entity Name',
    type: 'text',
    required: true,
    sortable: true,
    searchable: true,
    validation: {
      required: 'Name is required',
      minLength: { value: 2, message: 'Name must be at least 2 characters' }
    }
  },
  {
    key: 'code',
    label: 'Code',
    type: 'text',
    readonly: true,
    sortable: true
  },
  {
    key: 'isActive',
    label: 'Active',
    type: 'boolean',
    defaultValue: true,
    filterable: true
  },
  {
    key: 'createdAt',
    label: 'Created',
    type: 'date',
    readonly: true,
    sortable: true
  }
]
```

## 🎨 **Step 4: Create Page Component (5 minutes)**

```typescript
// /app/my-entities/page.tsx
'use client'

import React, { useMemo } from 'react'
import { toast } from 'sonner'
import { useRestaurantManagement } from '@/hooks/useRestaurantManagement'
import { HERAUniversalCRUD } from '@/templates/crud/components/HERAUniversalCRUD'
import { createMyEntityServiceAdapter } from '@/lib/crud-configs/my-entity-service-adapter'
import { MyEntityCRUDFields } from '@/lib/crud-configs/my-entity-crud-fields'

export default function MyEntitiesPage() {
  // ✅ REQUIRED: Get organization context
  const { restaurantData, loading, error } = useRestaurantManagement()
  
  // ✅ REQUIRED: Handle loading states
  if (loading) return <div>Loading...</div>
  if (!restaurantData) return <div>Setup required</div>
  
  const organizationId = restaurantData.organizationId

  // ✅ REQUIRED: Create service adapter
  const serviceAdapter = useMemo(() => createMyEntityServiceAdapter(), [])

  // ✅ REQUIRED: Success/error handlers
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
      entityType="my_entity"
      entityTypeLabel="My Entities"
      entitySingular="my_entity"
      entitySingularLabel="My Entity"
      service={serviceAdapter}
      fields={MyEntityCRUDFields}
      organizationId={organizationId}
      onSuccess={handleSuccess}
      onError={handleError}
      enableRealTime={true}
      enableSearch={true}
      enableFilters={true}
      enableSorting={true}
      enablePagination={true}
      enableBulkActions={true}
    />
  )
}
```

## 🧪 **Step 5: Debug Script (Optional)**

```javascript
// debug-my-entity.js
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const debug = async () => {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY
  );

  const organizationId = 'your-org-id-here';
  
  const { data, error } = await supabaseAdmin
    .from('core_entities')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('entity_type', 'my_entity');

  console.log('Found', data?.length || 0, 'entities');
  if (error) console.error('Error:', error);
};

debug();
```

## ✅ **What You Get**

After following these 5 steps, you'll have:

- ✅ **Complete CRUD Interface** - Create, read, update, delete with beautiful UI
- ✅ **Search & Filtering** - Real-time search and advanced filters
- ✅ **Sorting & Pagination** - Enterprise-grade data handling
- ✅ **Success Messages** - Proper feedback with entity codes
- ✅ **Error Handling** - Graceful error management
- ✅ **Real-time Updates** - Live data synchronization
- ✅ **Organization Isolation** - Multi-tenant data separation
- ✅ **Mobile Responsive** - Works perfectly on all devices

## 🔧 **Customization Options**

### Add Custom Actions
```typescript
const customActions = [
  {
    key: 'activate',
    label: 'Activate',
    icon: 'power',
    onClick: (item) => handleActivate(item.id)
  }
]

<HERAUniversalCRUD
  actions={customActions}
  // ... other props
/>
```

### Add Filters
```typescript
const filters = [
  {
    key: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' }
    ]
  }
]

<HERAUniversalCRUD
  filters={filters}
  // ... other props
/>
```

### Add Bulk Operations
```typescript
const bulkOperations = [
  {
    key: 'bulk-activate',
    label: 'Activate Selected',
    icon: 'power',
    onClick: (selectedItems) => handleBulkActivate(selectedItems)
  }
]

<HERAUniversalCRUD
  bulkOperations={bulkOperations}
  // ... other props
/>
```

## 🎯 **Pro Tips**

1. **Always use `supabaseAdmin`** for service methods
2. **Test with debug script first** before building UI
3. **Add logging** to track data flow during development
4. **Use factories** for simple adapters to reduce boilerplate
5. **Follow naming conventions** to prevent schema mismatches
6. **Handle organization context properly** for multi-tenancy

This pattern ensures consistent, enterprise-grade CRUD implementations across all HERA Universal modules.