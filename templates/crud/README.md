# HERA Universal CRUD Template System

## 🚀 **Quick Start Guide**

The HERA Universal CRUD Template System provides a standardized, reusable approach to building CRUD interfaces that integrate seamlessly with HERA's Universal Architecture.

### **30-Second Implementation**
```typescript
import { HERAUniversalCRUD } from '@/templates/crud'
import { ProductCatalogService } from '@/lib/services/productCatalogService'

const ProductsPage = () => (
  <HERAUniversalCRUD
    entityType="products"
    entityTypeLabel="Products"
    entitySingular="product"
    entitySingularLabel="Product"
    service={ProductCatalogService}
    fields={productFields}
  />
)
```

## 📋 **Features**

### **Core CRUD Operations**
- ✅ **Create** - Multi-step forms with validation
- ✅ **Read** - Advanced table with search, sort, filter
- ✅ **Update** - Pre-populated edit forms
- ✅ **Delete** - Confirmation dialogs with safety checks

### **Enterprise Features**
- 🔍 **Advanced Search** - Real-time search across multiple fields
- 🔽 **Smart Filtering** - Multi-criteria filtering with date ranges
- 📊 **Bulk Operations** - Multi-select with bulk actions
- 📄 **Export** - CSV, Excel, PDF export capabilities
- 📱 **Responsive Design** - Mobile-first responsive layout
- ⚡ **Performance** - Virtual scrolling and optimistic updates

### **HERA Integration**
- 🏢 **Organization-First** - Automatic organization scoping
- 🔐 **Authentication** - Integrated with HERA auth system
- 🎨 **Design System** - Uses HERA revolutionary design components
- 🔄 **Real-Time** - Supabase real-time subscriptions
- 📊 **Universal Schema** - Works with core_entities/core_metadata

## 🏗️ **Architecture**

```
templates/crud/
├── README.md                    # This documentation
├── components/                  # Core components
│   ├── HERAUniversalCRUD.tsx   # Main wrapper component
│   ├── CRUDTable.tsx           # Advanced data table
│   ├── CRUDModals.tsx          # Create/Edit/View/Delete modals
│   ├── CRUDToolbar.tsx         # Search, filters, actions
│   ├── CRUDFilters.tsx         # Advanced filtering
│   └── StatusBadge.tsx         # Status display component
├── hooks/                       # Reusable hooks
│   ├── useCRUDState.ts         # State management
│   ├── useTableFeatures.ts     # Table functionality
│   ├── useBulkActions.ts       # Bulk operations
│   └── useRealTimeSync.ts      # Real-time updates
├── services/                    # Service integration
│   ├── CRUDServiceAdapter.ts   # Service layer adapter
│   └── UniversalCRUDService.ts # HERA universal service
├── types/                       # TypeScript definitions
│   ├── crud-types.ts           # Core CRUD interfaces
│   ├── field-types.ts          # Field configuration
│   └── service-types.ts        # Service interfaces
├── examples/                    # Working examples
│   ├── ProductsCRUD.tsx        # Products implementation
│   ├── CustomersCRUD.tsx       # Customers implementation
│   ├── InvoicesCRUD.tsx        # Invoices implementation
│   └── UsersCRUD.tsx          # Users implementation
├── utils/                       # Utility functions
│   ├── field-helpers.ts        # Field configuration helpers
│   ├── validation.ts           # Form validation utilities
│   └── export-helpers.ts       # Data export utilities
└── index.ts                     # Main exports
```

## 🎯 **Quick Implementation Guide**

### **Step 1: Define Your Fields**
```typescript
// fields/product-fields.ts
export const productFields: CRUDField[] = [
  {
    key: 'name',
    label: 'Product Name',
    type: 'text',
    required: true,
    searchable: true,
    sortable: true,
    showInList: true,
    showInCreate: true,
    showInEdit: true,
    validation: {
      minLength: 2,
      maxLength: 100
    }
  },
  {
    key: 'basePrice',
    label: 'Base Price',
    type: 'currency',
    required: true,
    sortable: true,
    showInList: true,
    showInCreate: true,
    showInEdit: true,
    validation: {
      min: 0,
      step: 0.01
    }
  },
  {
    key: 'category',
    label: 'Category',
    type: 'select',
    required: true,
    searchable: true,
    sortable: true,
    showInList: true,
    showInCreate: true,
    showInEdit: true,
    loadOptions: async (organizationId) => {
      // Load categories from API
      return categoryOptions
    }
  }
]
```

### **Step 2: Create Service Adapter**
```typescript
// services/product-crud-service.ts
import { ProductCatalogService } from '@/lib/services/productCatalogService'
import { CRUDServiceAdapter } from '@/templates/crud/services/CRUDServiceAdapter'

export const productCRUDService = new CRUDServiceAdapter({
  create: ProductCatalogService.createProduct,
  read: ProductCatalogService.getProductCatalog,
  update: ProductCatalogService.updateProduct,
  delete: ProductCatalogService.deleteProduct,
  search: ProductCatalogService.searchProducts
})
```

### **Step 3: Implement CRUD Component**
```typescript
// pages/products.tsx
import { HERAUniversalCRUD } from '@/templates/crud'
import { productFields } from './fields/product-fields'
import { productCRUDService } from './services/product-crud-service'

export default function ProductsPage() {
  return (
    <HERAUniversalCRUD
      entityType="products"
      entityTypeLabel="Products"
      entitySingular="product"
      entitySingularLabel="Product"
      service={productCRUDService}
      fields={productFields}
      enableAdvancedFilters={true}
      enableBulkActions={true}
      enableExport={true}
      enableRealTime={true}
    />
  )
}
```

## 🔧 **Field Configuration**

### **Field Types**
```typescript
type FieldType = 
  | 'text' | 'email' | 'tel' | 'url' | 'password'
  | 'number' | 'currency' | 'percentage'
  | 'date' | 'datetime' | 'time'
  | 'select' | 'multiselect' | 'autocomplete'
  | 'boolean' | 'switch'
  | 'textarea' | 'richtext'
  | 'file' | 'image'
  | 'json' | 'code'
  | 'color' | 'range'
```

### **Field Configuration Options**
```typescript
interface CRUDField {
  key: string                    // Field identifier
  label: string                  // Display label
  type: FieldType               // Field type
  required?: boolean            // Required validation
  searchable?: boolean          // Include in search
  sortable?: boolean            // Enable sorting
  filterable?: boolean          // Include in filters
  showInList?: boolean          // Show in table
  showInCreate?: boolean        // Show in create form
  showInEdit?: boolean          // Show in edit form
  showInView?: boolean          // Show in details view
  placeholder?: string          // Input placeholder
  helpText?: string            // Help text
  validation?: FieldValidation  // Validation rules
  options?: SelectOption[]      // For select fields
  loadOptions?: (organizationId: string) => Promise<SelectOption[]>
  formatDisplay?: (value: any) => string
  parseValue?: (value: string) => any
  width?: number               // Column width
  align?: 'left' | 'center' | 'right'
  render?: (value: any, item: any) => React.ReactNode
}
```

### **Validation Configuration**
```typescript
interface FieldValidation {
  required?: boolean
  minLength?: number
  maxLength?: number
  min?: number
  max?: number
  step?: number
  pattern?: RegExp
  custom?: (value: any) => string | null
}
```

## 🎨 **Customization**

### **Custom Renderers**
```typescript
const customFields: CRUDField[] = [
  {
    key: 'avatar',
    label: 'Avatar',
    type: 'image',
    showInList: true,
    render: (value, item) => (
      <div className="flex items-center">
        <img src={value} className="w-8 h-8 rounded-full" />
        <span className="ml-2">{item.name}</span>
      </div>
    )
  },
  {
    key: 'status',
    label: 'Status',
    type: 'select',
    showInList: true,
    render: (value) => <StatusBadge status={value} />
  }
]
```

### **Custom Actions**
```typescript
const customActions: CRUDAction[] = [
  {
    key: 'duplicate',
    label: 'Duplicate',
    icon: Copy,
    variant: 'outline',
    onClick: (item) => handleDuplicate(item)
  },
  {
    key: 'archive',
    label: 'Archive',
    icon: Archive,
    variant: 'outline',
    onClick: (item) => handleArchive(item),
    confirm: 'Archive this item?'
  }
]
```

### **Custom Filters**
```typescript
const customFilters: CRUDFilter[] = [
  {
    key: 'dateRange',
    label: 'Date Range',
    type: 'daterange',
    apply: (items, value) => {
      return items.filter(item => 
        new Date(item.createdAt) >= value.start &&
        new Date(item.createdAt) <= value.end
      )
    }
  },
  {
    key: 'priceRange',
    label: 'Price Range',
    type: 'numberrange',
    apply: (items, value) => {
      return items.filter(item => 
        item.price >= value.min && item.price <= value.max
      )
    }
  }
]
```

## 📱 **Mobile Optimization**

The template automatically adapts to mobile devices:
- **Responsive Table** - Horizontal scroll on mobile
- **Mobile-First Forms** - Touch-optimized form controls
- **Swipe Actions** - Swipe to reveal actions on mobile
- **Bottom Sheets** - Mobile-friendly modals

## ⚡ **Performance Features**

- **Virtual Scrolling** - Handle large datasets (10,000+ rows)
- **Debounced Search** - Optimized search performance
- **Memoization** - React.memo and useMemo optimizations
- **Lazy Loading** - Load data on demand
- **Optimistic Updates** - Immediate UI feedback

## 🔄 **Real-Time Integration**

```typescript
// Enable real-time updates
<HERAUniversalCRUD
  // ... other props
  enableRealTime={true}
  realTimeConfig={{
    table: 'core_entities',
    filter: `organization_id=eq.${organizationId}`,
    events: ['INSERT', 'UPDATE', 'DELETE']
  }}
/>
```

## 🎯 **Best Practices**

### **Do's**
- ✅ Use semantic field keys that match your data structure
- ✅ Provide clear, descriptive labels
- ✅ Include proper validation rules
- ✅ Use appropriate field types for data
- ✅ Test with large datasets
- ✅ Include loading and error states

### **Don'ts**
- ❌ Don't skip validation on required fields
- ❌ Don't use generic field keys like 'field1', 'data'
- ❌ Don't forget to handle edge cases
- ❌ Don't ignore mobile responsiveness
- ❌ Don't skip accessibility features

## 🚨 **Common Issues & Solutions**

### **Performance Issues**
```typescript
// Problem: Slow rendering with large datasets
// Solution: Enable virtual scrolling
<HERAUniversalCRUD
  enableVirtualScrolling={true}
  virtualScrollingThreshold={100}
/>
```

### **Field Validation**
```typescript
// Problem: Custom validation not working
// Solution: Use proper validation format
{
  key: 'email',
  validation: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    custom: (value) => {
      if (!value.includes('@company.com')) {
        return 'Must be a company email'
      }
      return null
    }
  }
}
```

### **Real-Time Updates**
```typescript
// Problem: Real-time not working
// Solution: Check Supabase RLS policies
// Ensure proper organization_id filtering
```

## 📚 **Examples**

See the `/examples` directory for complete implementations:
- **Products** - E-commerce product catalog
- **Customers** - CRM customer management
- **Invoices** - Billing and invoicing
- **Users** - User management system

## 🤝 **Contributing**

When extending the CRUD template:
1. Follow HERA Universal Architecture patterns
2. Maintain backward compatibility
3. Add proper TypeScript types
4. Include examples and documentation
5. Test with multiple screen sizes

## 📞 **Support**

For questions about the CRUD template system:
1. Check the examples in `/templates/crud/examples`
2. Review field configuration options
3. Check common issues section
4. Refer to HERA Universal documentation

---

*This template system is designed to accelerate development while maintaining consistency across the HERA Universal platform. Happy coding! 🚀*