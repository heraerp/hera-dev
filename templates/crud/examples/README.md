# HERA Universal CRUD Template - Usage Examples

This directory contains comprehensive examples demonstrating how to use the HERA Universal CRUD Template System across different business scenarios.

## Quick Start Examples

### 1. Basic Product Catalog

The simplest implementation using default configurations:

```typescript
import { HERAUniversalCRUD } from '@/templates/crud/components'
import { productCatalogService } from '@/templates/crud/services/productCatalogService'
import { productFields } from './productFields'

export default function ProductCatalogPage() {
  return (
    <HERAUniversalCRUD
      entityType="product"
      entityTypeLabel="Products"
      entitySingular="product"
      entitySingularLabel="Product"
      service={productCatalogService}
      fields={productFields}
      enableSearch={true}
      enableFilters={true}
      enableBulkActions={true}
      enableRealTime={true}
    />
  )
}
```

### 2. Customer Management

Enhanced implementation with custom actions and filters:

```typescript
import { HERAUniversalCRUD } from '@/templates/crud/components'
import { customerService } from '@/templates/crud/services/customerService'
import { customerFields, customerFilters, customerActions } from './customerConfig'

export default function CustomerManagementPage() {
  return (
    <HERAUniversalCRUD
      entityType="customer"
      entityTypeLabel="Customers"
      entitySingular="customer"
      entitySingularLabel="Customer"
      service={customerService}
      fields={customerFields}
      actions={customerActions}
      filters={customerFilters}
      enableExport={true}
      enableRealTime={true}
      pagination={{ pageSize: 50 }}
      permissions={{
        create: true,
        update: true,
        delete: false, // Soft delete only
        export: true
      }}
    />
  )
}
```

## Field Configuration Examples

### Basic Field Types

```typescript
import { CRUDField } from '@/templates/crud/types/crud-types'

export const basicFields: CRUDField[] = [
  {
    key: 'name',
    label: 'Name',
    type: 'text',
    required: true,
    sortable: true,
    searchable: true,
    showInList: true,
    showInCreate: true,
    showInEdit: true,
    showInView: true,
    validation: {
      minLength: 2,
      maxLength: 100
    }
  },
  {
    key: 'email',
    label: 'Email',
    type: 'email',
    required: true,
    sortable: true,
    searchable: true,
    validation: {
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    }
  },
  {
    key: 'price',
    label: 'Price',
    type: 'currency',
    required: true,
    sortable: true,
    align: 'right',
    validation: {
      min: 0,
      max: 999999.99
    }
  },
  {
    key: 'is_active',
    label: 'Active',
    type: 'boolean',
    defaultValue: true,
    sortable: true,
    render: (value) => <BooleanStatus value={value} animate={true} />
  }
]
```

### Advanced Field Types

```typescript
export const advancedFields: CRUDField[] = [
  {
    key: 'category',
    label: 'Category',
    type: 'select',
    required: true,
    options: [
      { value: 'electronics', label: 'Electronics', color: 'blue' },
      { value: 'clothing', label: 'Clothing', color: 'purple' },
      { value: 'books', label: 'Books', color: 'green' }
    ],
    render: (value, item, field) => {
      const option = field.options?.find(opt => opt.value === value)
      return <StatusBadge status={value} color={option?.color} label={option?.label} />
    }
  },
  {
    key: 'tags',
    label: 'Tags',
    type: 'multiselect',
    multiple: true,
    clearable: true,
    searchable: true,
    loadOptions: async (organizationId: string) => {
      // Load dynamic options from API
      const response = await fetch(`/api/tags?organizationId=${organizationId}`)
      return response.json()
    }
  },
  {
    key: 'description',
    label: 'Description',
    type: 'textarea',
    showInList: false,
    validation: {
      maxLength: 1000
    }
  },
  {
    key: 'created_at',
    label: 'Created',
    type: 'datetime',
    readonly: true,
    sortable: true,
    showInCreate: false,
    showInEdit: false,
    formatDisplay: (value) => new Date(value).toLocaleDateString()
  }
]
```

### Custom Field Rendering

```typescript
export const customRenderFields: CRUDField[] = [
  {
    key: 'avatar',
    label: 'Avatar',
    type: 'image',
    showInList: true,
    showInCreate: true,
    showInEdit: true,
    render: (value, item) => (
      <div className="flex items-center gap-3">
        <img
          src={value || '/default-avatar.png'}
          alt={item.name}
          className="w-10 h-10 rounded-full object-cover"
        />
        <div>
          <div className="font-medium">{item.name}</div>
          <div className="text-sm text-gray-500">{item.email}</div>
        </div>
      </div>
    )
  },
  {
    key: 'rating',
    label: 'Rating',
    type: 'rating',
    sortable: true,
    render: (value) => (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map(star => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= value ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-2 text-sm text-gray-600">({value})</span>
      </div>
    )
  },
  {
    key: 'progress',
    label: 'Progress',
    type: 'percentage',
    render: (value) => (
      <div className="w-full">
        <div className="flex justify-between text-sm mb-1">
          <span>Progress</span>
          <span>{value}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${value}%` }}
          />
        </div>
      </div>
    )
  }
]
```

## Action Configuration Examples

### Basic Actions

```typescript
import { CRUDAction } from '@/templates/crud/types/crud-types'
import { Eye, Edit, Trash2, Copy, Send } from 'lucide-react'

export const basicActions: CRUDAction[] = [
  {
    key: 'view',
    label: 'View',
    icon: Eye,
    variant: 'ghost',
    position: ['row'],
    onClick: (item) => console.log('View item:', item)
  },
  {
    key: 'edit',
    label: 'Edit',
    icon: Edit,
    variant: 'ghost',
    position: ['row'],
    onClick: (item) => console.log('Edit item:', item)
  },
  {
    key: 'delete',
    label: 'Delete',
    icon: Trash2,
    variant: 'ghost',
    position: ['row'],
    confirm: 'Are you sure you want to delete this item?',
    onClick: (item) => console.log('Delete item:', item)
  }
]
```

### Advanced Actions

```typescript
export const advancedActions: CRUDAction[] = [
  {
    key: 'duplicate',
    label: 'Duplicate',
    icon: Copy,
    variant: 'outline',
    position: ['row', 'toolbar'],
    onClick: async (item) => {
      const duplicatedItem = { ...item, name: `${item.name} (Copy)` }
      await service.create(organizationId, duplicatedItem)
    }
  },
  {
    key: 'send-email',
    label: 'Send Email',
    icon: Send,
    variant: 'default',
    position: ['row'],
    visible: (item) => item.email && item.is_active,
    disabled: (item) => !item.email_verified,
    onClick: (item) => {
      window.location.href = `mailto:${item.email}`
    }
  },
  {
    key: 'export-pdf',
    label: 'Export PDF',
    icon: 'Download' as any,
    variant: 'outline',
    position: ['toolbar'],
    onClick: async (item, selectedItems) => {
      const items = selectedItems || [item]
      await exportToPDF(items)
    }
  }
]
```

### Conditional Actions

```typescript
export const conditionalActions: CRUDAction[] = [
  {
    key: 'activate',
    label: 'Activate',
    icon: 'Play' as any,
    variant: 'default',
    position: ['row'],
    visible: (item) => !item.is_active,
    onClick: async (item) => {
      await service.update(organizationId, item.id, { is_active: true })
    }
  },
  {
    key: 'deactivate',
    label: 'Deactivate',
    icon: 'Pause' as any,
    variant: 'outline',
    position: ['row'],
    visible: (item) => item.is_active,
    confirm: 'Are you sure you want to deactivate this item?',
    onClick: async (item) => {
      await service.update(organizationId, item.id, { is_active: false })
    }
  },
  {
    key: 'approve',
    label: 'Approve',
    icon: 'CheckCircle' as any,
    variant: 'default',
    position: ['row'],
    visible: (item) => item.status === 'pending',
    disabled: (item) => !item.ready_for_approval,
    onClick: async (item) => {
      await service.update(organizationId, item.id, { status: 'approved' })
    }
  }
]
```

## Filter Configuration Examples

### Basic Filters

```typescript
import { CRUDFilter } from '@/templates/crud/types/crud-types'

export const basicFilters: CRUDFilter[] = [
  {
    key: 'name',
    label: 'Name',
    type: 'text',
    placeholder: 'Search by name...',
    apply: (items, value) => 
      items.filter(item => 
        item.name.toLowerCase().includes(value.toLowerCase())
      )
  },
  {
    key: 'is_active',
    label: 'Status',
    type: 'select',
    options: [
      { value: 'true', label: 'Active' },
      { value: 'false', label: 'Inactive' }
    ],
    apply: (items, value) => 
      items.filter(item => String(item.is_active) === value)
  },
  {
    key: 'created_at',
    label: 'Created Date',
    type: 'daterange',
    apply: (items, value) => {
      if (!value.start && !value.end) return items
      return items.filter(item => {
        const itemDate = new Date(item.created_at)
        const start = value.start ? new Date(value.start) : null
        const end = value.end ? new Date(value.end) : null
        
        if (start && itemDate < start) return false
        if (end && itemDate > end) return false
        return true
      })
    }
  }
]
```

### Advanced Filters

```typescript
export const advancedFilters: CRUDFilter[] = [
  {
    key: 'price_range',
    label: 'Price Range',
    type: 'numberrange',
    apply: (items, value) => {
      return items.filter(item => {
        if (value.min !== undefined && item.price < value.min) return false
        if (value.max !== undefined && item.price > value.max) return false
        return true
      })
    }
  },
  {
    key: 'categories',
    label: 'Categories',
    type: 'multiselect',
    loadOptions: async (organizationId) => {
      const response = await fetch(`/api/categories?organizationId=${organizationId}`)
      return response.json()
    },
    apply: (items, selectedCategories) => {
      if (selectedCategories.length === 0) return items
      return items.filter(item => 
        selectedCategories.includes(item.category)
      )
    }
  },
  {
    key: 'rating',
    label: 'Minimum Rating',
    type: 'number',
    defaultValue: 0,
    apply: (items, minRating) => 
      items.filter(item => item.rating >= minRating)
  }
]
```

## Bulk Operations Examples

### Basic Bulk Operations

```typescript
import { BulkOperation } from '@/templates/crud/types/crud-types'

export const basicBulkOperations: BulkOperation[] = [
  {
    key: 'bulk-delete',
    label: 'Delete Selected',
    description: 'Permanently delete selected items',
    icon: 'Trash2' as any,
    variant: 'destructive',
    confirm: 'Are you sure you want to delete the selected items?',
    execute: async (selectedIds, items) => {
      await Promise.all(
        selectedIds.map(id => service.delete(organizationId, id))
      )
    }
  },
  {
    key: 'bulk-export',
    label: 'Export Selected',
    description: 'Export selected items to CSV',
    icon: 'Download' as any,
    variant: 'outline',
    execute: async (selectedIds, items) => {
      const csvData = items.map(item => ({
        name: item.name,
        email: item.email,
        created: item.created_at
      }))
      downloadCSV(csvData, 'export.csv')
    }
  }
]
```

### Advanced Bulk Operations

```typescript
export const advancedBulkOperations: BulkOperation[] = [
  {
    key: 'bulk-update-category',
    label: 'Update Category',
    description: 'Change category for selected items',
    icon: 'Edit' as any,
    variant: 'default',
    execute: async (selectedIds, items) => {
      const newCategory = prompt('Enter new category:')
      if (newCategory) {
        await Promise.all(
          selectedIds.map(id => 
            service.update(organizationId, id, { category: newCategory })
          )
        )
      }
    }
  },
  {
    key: 'bulk-send-email',
    label: 'Send Email',
    description: 'Send email to selected customers',
    icon: 'Send' as any,
    variant: 'default',
    visible: (items) => items.every(item => item.email),
    disabled: (items) => items.some(item => !item.email_verified),
    execute: async (selectedIds, items) => {
      const emails = items.map(item => item.email).join(',')
      window.location.href = `mailto:${emails}`
    }
  },
  {
    key: 'bulk-archive',
    label: 'Archive Selected',
    description: 'Move selected items to archive',
    icon: 'Archive' as any,
    variant: 'outline',
    confirm: 'Archive selected items? They can be restored later.',
    execute: async (selectedIds, items) => {
      await Promise.all(
        selectedIds.map(id => 
          service.update(organizationId, id, { archived: true })
        )
      )
    }
  }
]
```

## Real-Time Configuration Examples

### Basic Real-Time Setup

```typescript
export default function ProductsWithRealTime() {
  return (
    <HERAUniversalCRUD
      entityType="product"
      entityTypeLabel="Products"
      entitySingular="product"
      entitySingularLabel="Product"
      service={productService}
      fields={productFields}
      enableRealTime={true}
      realTime={{
        enabled: true,
        table: 'core_entities',
        events: ['INSERT', 'UPDATE', 'DELETE'],
        debounceMs: 500
      }}
    />
  )
}
```

### Advanced Real-Time with Custom Handlers

```typescript
export default function OrdersWithRealTime() {
  const handleRealTimeUpdate = useCallback(() => {
    console.log('Orders updated in real-time')
    // Custom logic for real-time updates
  }, [])

  return (
    <HERAUniversalCRUD
      entityType="order"
      entityTypeLabel="Orders"
      entitySingular="order"
      entitySingularLabel="Order"
      service={orderService}
      fields={orderFields}
      enableRealTime={true}
      realTime={{
        enabled: true,
        table: 'universal_transactions',
        filter: `transaction_type=eq.SALES_ORDER`,
        events: ['INSERT', 'UPDATE'],
        onUpdate: handleRealTimeUpdate,
        debounceMs: 1000
      }}
    />
  )
}
```

## Complete Implementation Examples

### Restaurant Product Management

```typescript
// pages/restaurant/products.tsx
import { HERAUniversalCRUD } from '@/templates/crud/components'
import { productCatalogService } from '@/lib/services/productCatalogService'

const productFields: CRUDField[] = [
  {
    key: 'entity_name',
    label: 'Product Name',
    type: 'text',
    required: true,
    sortable: true,
    searchable: true
  },
  {
    key: 'entity_code',
    label: 'Code',
    type: 'text',
    required: true,
    sortable: true
  },
  {
    key: 'price',
    label: 'Price',
    type: 'currency',
    required: true,
    sortable: true,
    align: 'right'
  },
  {
    key: 'category',
    label: 'Category',
    type: 'select',
    options: [
      { value: 'appetizers', label: 'Appetizers', color: 'blue' },
      { value: 'mains', label: 'Main Courses', color: 'green' },
      { value: 'desserts', label: 'Desserts', color: 'purple' },
      { value: 'beverages', label: 'Beverages', color: 'orange' }
    ]
  },
  {
    key: 'is_available',
    label: 'Available',
    type: 'boolean',
    defaultValue: true,
    render: (value) => <BooleanStatus value={value} />
  }
]

export default function RestaurantProducts() {
  return (
    <div className="p-6">
      <HERAUniversalCRUD
        entityType="product"
        entityTypeLabel="Menu Items"
        entitySingular="product"
        entitySingularLabel="Menu Item"
        service={productCatalogService}
        fields={productFields}
        enableSearch={true}
        enableFilters={true}
        enableBulkActions={true}
        enableExport={true}
        enableRealTime={true}
        pagination={{ pageSize: 25 }}
        onSuccess={(message, operation) => {
          console.log(`${operation} successful: ${message}`)
        }}
        onError={(error) => {
          console.error('Operation failed:', error)
        }}
      />
    </div>
  )
}
```

This comprehensive example system demonstrates the flexibility and power of the HERA Universal CRUD Template System while maintaining consistency with HERA Universal Architecture principles.