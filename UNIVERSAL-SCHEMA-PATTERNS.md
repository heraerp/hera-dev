# 🌌 HERA Universal Schema Patterns - Complete Implementation Guide

## Overview

HERA Universal uses a revolutionary Universal Schema Architecture that handles ANY business type through a single, unified data model. This document provides complete patterns for implementing features without amnesia - everything needed to build consistently.

## 🏗️ Core Architecture Principles

### The Four Sacred Principles

#### 1. ORGANIZATION_ID IS SACRED 🛡️
```sql
-- ❌ NEVER write queries like this:
SELECT * FROM core_entities WHERE entity_type = 'customer';

-- ✅ ALWAYS include organization_id:
SELECT * FROM core_entities 
WHERE organization_id = ? AND entity_type = 'customer';
```

#### 2. USERS = GLOBAL, DATA = TENANT-ISOLATED 👥
```sql
-- Users exist globally and can belong to multiple organizations
-- John Smith can be:
-- - Admin at Pizza Restaurant (org-restaurant-123)
-- - Consultant at Law Firm (org-law-456)  
-- - Advisor at Medical Clinic (org-medical-789)

-- ALWAYS check user's access to specific organization:
SELECT role FROM user_organizations 
WHERE user_id = ? AND organization_id = ? AND is_active = true;
```

#### 3. UNIVERSAL SCHEMA = INFINITE FLEXIBILITY 🌌
```sql
-- Don't think "I need a customers table"
-- Think "I need customer entities with custom fields"

-- Same pattern works for ANY business:
core_entities (what it is) + core_metadata (what makes it unique)

-- Restaurant: entity_type = 'menu_item'
-- Law Firm: entity_type = 'legal_case'
-- Hospital: entity_type = 'patient'
-- ALL use the same tables!
```

#### 4. NO NEW TABLES EVER 🚫
```sql
-- ❌ WRONG - Creating separate tables breaks universal architecture
CREATE TABLE restaurant_menu_items (...);
CREATE TABLE law_firm_cases (...);

-- ✅ RIGHT - Use universal pattern
-- Menu items = entities with entity_type = 'menu_item'
-- Legal cases = entities with entity_type = 'legal_case'
```

## 🗄️ Universal Schema Structure

### Core Tables

```sql
-- Main entity registry
core_entities (
  id uuid PRIMARY KEY,
  organization_id uuid,              -- SACRED: Always filter by this
  entity_type text,                  -- 'product', 'customer', 'order', etc.
  entity_name text,                  -- Human readable name
  entity_code text,                  -- Business identifier
  is_active boolean DEFAULT true,
  created_at timestamp,
  updated_at timestamp
);

-- Rich metadata and custom fields
core_metadata (
  id uuid PRIMARY KEY,
  organization_id uuid,              -- SACRED: Double isolation
  entity_type text,                  -- 'product', 'customer', etc.
  entity_id uuid,                    -- References core_entities.id
  metadata_type text,                -- 'product_details', 'customer_preferences'
  metadata_category text,            -- 'inventory', 'pricing', 'personal'
  metadata_key text,                 -- 'color', 'size', 'favorite_tea'
  metadata_value jsonb               -- Flexible JSON data
);

-- Dynamic fields for form-like data
core_dynamic_data (
  id uuid PRIMARY KEY,
  entity_id uuid,                    -- References core_entities.id
  field_name text,                   -- 'price', 'phone', 'notes'
  field_value text,                  -- String representation
  field_type text                    -- 'text', 'number', 'date', 'json'
);

-- User-organization relationships
user_organizations (
  id uuid PRIMARY KEY,
  user_id uuid,                      -- References core_users.id
  organization_id uuid,              -- References core_organizations.id
  role text,                         -- 'owner', 'admin', 'manager', 'staff'
  is_active boolean DEFAULT true
);
```

### Universal Transaction System

```sql
-- All business transactions unified
universal_transactions (
  id uuid PRIMARY KEY,
  organization_id uuid,              -- SACRED: Always required
  transaction_type text,             -- 'SALES_ORDER', 'PURCHASE_ORDER', etc.
  transaction_number text,           -- 'ORD-20240115-001'
  transaction_date date,
  total_amount decimal,
  currency text DEFAULT 'USD',
  status text,                       -- 'PENDING', 'READY', 'COMPLETED'
  metadata jsonb                     -- Rich transaction context
);

-- Transaction line items
universal_transaction_lines (
  id uuid PRIMARY KEY,
  transaction_id uuid,               -- References universal_transactions.id
  entity_id uuid,                    -- Product/Service ID from core_entities
  line_description text,             -- Product name, service description
  quantity decimal,
  unit_price decimal,
  line_amount decimal,
  line_order integer,
  metadata jsonb                     -- Line-specific data
);
```

## 🔧 Implementation Patterns

### Pattern 1: Entity Creation with Metadata

```typescript
import { OrganizationGuard, useOrganizationContext } from '@/components/restaurant/organization-guard';

function CreateEntityContent() {
  const { organizationId } = useOrganizationContext();
  
  const createEntity = async (entityData: any, entityType: string) => {
    const entityId = crypto.randomUUID();
    const entityCode = generateEntityCode(entityData.name, entityType);
    
    // Step 1: Create main entity
    const { error: entityError } = await supabaseAdmin
      .from('core_entities')
      .insert({
        id: entityId,
        organization_id: organizationId, // SACRED
        entity_type: entityType,
        entity_name: entityData.name,
        entity_code: entityCode,
        is_active: true
      });
    
    if (entityError) throw entityError;
    
    // Step 2: Add metadata
    if (entityData.metadata) {
      const metadataEntries = Object.entries(entityData.metadata).map(([key, value]) => ({
        id: crypto.randomUUID(),
        organization_id: organizationId, // SACRED DOUBLE CHECK
        entity_type: entityType,
        entity_id: entityId,
        metadata_type: 'entity_details',
        metadata_category: 'general',
        metadata_key: key,
        metadata_value: JSON.stringify(value)
      }));
      
      const { error: metadataError } = await supabaseAdmin
        .from('core_metadata')
        .insert(metadataEntries);
        
      if (metadataError) throw metadataError;
    }
    
    // Step 3: Add dynamic fields
    if (entityData.fields) {
      const dynamicData = Object.entries(entityData.fields).map(([fieldName, fieldValue]) => ({
        id: crypto.randomUUID(),
        entity_id: entityId,
        field_name: fieldName,
        field_value: String(fieldValue),
        field_type: typeof fieldValue === 'number' ? 'number' : 'text'
      }));
      
      const { error: dynamicError } = await supabaseAdmin
        .from('core_dynamic_data')
        .insert(dynamicData);
        
      if (dynamicError) throw dynamicError;
    }
    
    return entityId;
  };
  
  return <div>Creation UI</div>;
}

export default function CreateEntityPage() {
  return (
    <OrganizationGuard requiredRole="staff">
      <CreateEntityContent />
    </OrganizationGuard>
  );
}
```

### Pattern 2: Reading Entities with Metadata

```typescript
const readEntitiesWithMetadata = async (organizationId: string, entityType: string) => {
  // Step 1: Get base entities
  const { data: entities, error: entityError } = await supabase
    .from('core_entities')
    .select('*')
    .eq('organization_id', organizationId) // SACRED
    .eq('entity_type', entityType)
    .eq('is_active', true);
    
  if (entityError) throw entityError;
  
  if (!entities?.length) return [];
  
  const entityIds = entities.map(e => e.id);
  
  // Step 2: Get metadata
  const { data: metadata, error: metadataError } = await supabase
    .from('core_metadata')
    .select('entity_id, metadata_key, metadata_value, metadata_category')
    .eq('organization_id', organizationId) // SACRED DOUBLE CHECK
    .in('entity_id', entityIds);
    
  // Step 3: Get dynamic data
  const { data: dynamicData, error: dynamicError } = await supabase
    .from('core_dynamic_data')
    .select('entity_id, field_name, field_value, field_type')
    .in('entity_id', entityIds);
    
  // Step 4: Manual join (no foreign keys needed)
  const metadataMap = new Map();
  metadata?.forEach(m => {
    if (!metadataMap.has(m.entity_id)) {
      metadataMap.set(m.entity_id, {});
    }
    metadataMap.get(m.entity_id)[m.metadata_key] = JSON.parse(m.metadata_value);
  });
  
  const dynamicMap = new Map();
  dynamicData?.forEach(d => {
    if (!dynamicMap.has(d.entity_id)) {
      dynamicMap.set(d.entity_id, {});
    }
    dynamicMap.get(d.entity_id)[d.field_name] = 
      d.field_type === 'number' ? Number(d.field_value) : d.field_value;
  });
  
  // Step 5: Combine data
  return entities.map(entity => ({
    ...entity,
    metadata: metadataMap.get(entity.id) || {},
    fields: dynamicMap.get(entity.id) || {}
  }));
};
```

### Pattern 3: Universal Transaction Processing

```typescript
const createUniversalTransaction = async (transactionData: {
  organizationId: string;
  transactionType: string;
  items: Array<{
    entityId: string;
    quantity: number;
    unitPrice: number;
    description: string;
  }>;
  metadata?: any;
}) => {
  const transactionId = crypto.randomUUID();
  const transactionNumber = generateTransactionNumber(transactionData.transactionType);
  const totalAmount = transactionData.items.reduce(
    (sum, item) => sum + (item.quantity * item.unitPrice), 0
  );
  
  // Step 1: Create transaction header
  const { error: transactionError } = await supabaseAdmin
    .from('universal_transactions')
    .insert({
      id: transactionId,
      organization_id: transactionData.organizationId, // SACRED
      transaction_type: transactionData.transactionType,
      transaction_number: transactionNumber,
      transaction_date: new Date().toISOString().split('T')[0],
      total_amount: totalAmount,
      status: 'PENDING',
      metadata: transactionData.metadata || {}
    });
    
  if (transactionError) throw transactionError;
  
  // Step 2: Create line items
  const lineItems = transactionData.items.map((item, index) => ({
    id: crypto.randomUUID(),
    transaction_id: transactionId,
    entity_id: item.entityId,
    line_description: item.description,
    quantity: item.quantity,
    unit_price: item.unitPrice,
    line_amount: item.quantity * item.unitPrice,
    line_order: index + 1
  }));
  
  const { error: linesError } = await supabaseAdmin
    .from('universal_transaction_lines')
    .insert(lineItems);
    
  if (linesError) throw linesError;
  
  return transactionId;
};
```

## 🚀 Service Layer Patterns

### Universal CRUD Service Template

```typescript
class UniversalEntityService {
  private supabase: SupabaseClient;
  private supabaseAdmin: SupabaseClient;
  
  constructor() {
    this.supabase = createClient();
    this.supabaseAdmin = createSupabaseAdmin();
  }
  
  // Create entity with universal pattern
  async create(data: {
    organizationId: string;
    entityType: string;
    name: string;
    metadata?: Record<string, any>;
    fields?: Record<string, any>;
  }) {
    const entityId = crypto.randomUUID();
    
    // Main entity
    await this.supabaseAdmin
      .from('core_entities')
      .insert({
        id: entityId,
        organization_id: data.organizationId,
        entity_type: data.entityType,
        entity_name: data.name,
        entity_code: this.generateCode(data.name, data.entityType),
        is_active: true
      });
    
    // Add metadata and fields...
    return entityId;
  }
  
  // Read with organization isolation
  async findAll(organizationId: string, entityType: string) {
    const { data: entities } = await this.supabase
      .from('core_entities')
      .select('*')
      .eq('organization_id', organizationId) // SACRED
      .eq('entity_type', entityType)
      .eq('is_active', true);
      
    // Join metadata and return...
    return this.enrichWithMetadata(entities, organizationId);
  }
  
  // Update with organization validation
  async update(entityId: string, updates: any, organizationId: string) {
    // Verify entity belongs to organization
    const { data: entity } = await this.supabase
      .from('core_entities')
      .select('organization_id')
      .eq('id', entityId)
      .eq('organization_id', organizationId) // SACRED
      .single();
      
    if (!entity) throw new Error('Entity not found or access denied');
    
    // Perform update...
  }
  
  // Delete with organization validation
  async delete(entityId: string, organizationId: string) {
    // Soft delete with organization check
    await this.supabaseAdmin
      .from('core_entities')
      .update({ is_active: false })
      .eq('id', entityId)
      .eq('organization_id', organizationId); // SACRED
  }
}
```

### Hook Pattern for Components

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function useUniversalEntity(organizationId: string, entityType: string) {
  const queryClient = useQueryClient();
  const service = new UniversalEntityService();
  
  // Read entities
  const {
    data: entities = [],
    isLoading: loading,
    error
  } = useQuery({
    queryKey: ['entities', organizationId, entityType],
    queryFn: () => service.findAll(organizationId, entityType),
    enabled: !!organizationId // Only run if we have organization
  });
  
  // Create entity
  const createMutation = useMutation({
    mutationFn: (data: any) => service.create({
      ...data,
      organizationId,
      entityType
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['entities', organizationId, entityType]);
    }
  });
  
  // Update entity
  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) => 
      service.update(id, updates, organizationId),
    onSuccess: () => {
      queryClient.invalidateQueries(['entities', organizationId, entityType]);
    }
  });
  
  return {
    entities,
    loading,
    error,
    createEntity: createMutation.mutateAsync,
    updateEntity: updateMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending
  };
}
```

## 🎯 Complete Page Implementation Example

```typescript
"use client";

import React, { useState } from 'react';
import { OrganizationGuard, useOrganizationContext } from '@/components/restaurant/organization-guard';
import { useUniversalEntity } from '@/hooks/useUniversalEntity';

function ProductManagementContent() {
  const { organizationId } = useOrganizationContext();
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  const {
    entities: products,
    loading,
    error,
    createEntity: createProduct,
    isCreating
  } = useUniversalEntity(organizationId!, 'product');
  
  const handleCreateProduct = async (productData: any) => {
    await createProduct({
      name: productData.name,
      metadata: {
        category: productData.category,
        description: productData.description
      },
      fields: {
        price: productData.price,
        sku: productData.sku,
        stock_quantity: productData.quantity
      }
    });
    setShowCreateForm(false);
  };
  
  if (loading) return <div>Loading products...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Product Management</h1>
        <button 
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Add Product
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map(product => (
          <div key={product.id} className="border rounded-lg p-4">
            <h3 className="font-semibold">{product.entity_name}</h3>
            <p className="text-gray-600">{product.metadata.description}</p>
            <div className="mt-2">
              <span className="font-bold">${product.fields.price}</span>
              <span className="ml-2 text-sm text-gray-500">
                Stock: {product.fields.stock_quantity}
              </span>
            </div>
          </div>
        ))}
      </div>
      
      {showCreateForm && (
        <CreateProductForm 
          onSubmit={handleCreateProduct}
          onCancel={() => setShowCreateForm(false)}
          isCreating={isCreating}
        />
      )}
    </div>
  );
}

export default function ProductManagementPage() {
  return (
    <OrganizationGuard requiredRole="staff">
      <ProductManagementContent />
    </OrganizationGuard>
  );
}
```

## 🛡️ Security Patterns

### Supabase Service Role Setup

```typescript
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Admin client for bypassing RLS
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
);
```

### Row Level Security Policies

```sql
-- Core entities RLS
CREATE POLICY "Users can only see their organization's entities"
ON core_entities FOR SELECT
USING (
  organization_id IN (
    SELECT organization_id 
    FROM user_organizations 
    WHERE user_id = auth.uid() AND is_active = true
  )
);

-- Metadata RLS  
CREATE POLICY "Users can only see their organization's metadata"
ON core_metadata FOR SELECT
USING (
  organization_id IN (
    SELECT organization_id 
    FROM user_organizations 
    WHERE user_id = auth.uid() AND is_active = true
  )
);

-- Universal transactions RLS
CREATE POLICY "Users can only see their organization's transactions"
ON universal_transactions FOR SELECT
USING (
  organization_id IN (
    SELECT organization_id 
    FROM user_organizations 
    WHERE user_id = auth.uid() AND is_active = true
  )
);
```

## 📊 Common Entity Types

### Restaurant Entities
```typescript
const RESTAURANT_ENTITIES = {
  PRODUCT: 'product',           // Menu items, inventory
  CUSTOMER: 'customer',         // Customer database
  ORDER: 'order',              // Sales orders
  SUPPLIER: 'supplier',        // Vendor management
  RECIPE: 'recipe',            // Recipe management
  STAFF: 'staff',              // Employee records
  TABLE: 'table',              // Table management
  RESERVATION: 'reservation'    // Booking system
};
```

### Universal Business Entities
```typescript
const UNIVERSAL_ENTITIES = {
  // Finance
  ACCOUNT: 'account',          // Chart of accounts
  TRANSACTION: 'transaction',   // Financial transactions
  INVOICE: 'invoice',          // Billing
  PAYMENT: 'payment',          // Payment processing
  
  // Operations
  PROJECT: 'project',          // Project management
  TASK: 'task',               // Task tracking
  ASSET: 'asset',             // Asset management
  DOCUMENT: 'document',        // Document storage
  
  // CRM
  LEAD: 'lead',               // Sales leads
  OPPORTUNITY: 'opportunity',  // Sales pipeline
  CONTACT: 'contact',         // Contact management
  COMPANY: 'company'          // Company records
};
```

## 🔄 Migration Patterns

### Adding New Entity Type

```typescript
// 1. Define entity type constant
const ENTITY_TYPE = 'new_entity_type';

// 2. Create service class
class NewEntityService extends UniversalEntityService {
  async create(data: NewEntityData) {
    return super.create({
      ...data,
      entityType: ENTITY_TYPE
    });
  }
  
  async findAll(organizationId: string) {
    return super.findAll(organizationId, ENTITY_TYPE);
  }
}

// 3. Create hook
export function useNewEntity(organizationId: string) {
  return useUniversalEntity(organizationId, ENTITY_TYPE);
}

// 4. Create page following standard pattern
// (Use the complete page implementation example above)
```

## 📈 Performance Optimization

### Indexing Strategy
```sql
-- Essential indexes for universal schema
CREATE INDEX idx_entities_org_type ON core_entities(organization_id, entity_type);
CREATE INDEX idx_metadata_org_entity ON core_metadata(organization_id, entity_id);
CREATE INDEX idx_dynamic_entity ON core_dynamic_data(entity_id);
CREATE INDEX idx_transactions_org ON universal_transactions(organization_id);
CREATE INDEX idx_user_orgs ON user_organizations(user_id, organization_id);
```

### Query Optimization
```typescript
// Batch metadata queries
const getEntitiesWithMetadata = async (organizationId: string, entityIds: string[]) => {
  // Single query for all metadata instead of N+1
  const [entities, metadata, dynamicData] = await Promise.all([
    getEntities(organizationId, entityIds),
    getMetadata(organizationId, entityIds),
    getDynamicData(entityIds)
  ]);
  
  return combineData(entities, metadata, dynamicData);
};
```

## 🧪 Testing Patterns

### Unit Tests
```typescript
describe('UniversalEntityService', () => {
  it('should filter by organization', async () => {
    const service = new UniversalEntityService();
    const entities = await service.findAll('org-123', 'product');
    
    // Verify all entities belong to organization
    entities.forEach(entity => {
      expect(entity.organization_id).toBe('org-123');
    });
  });
  
  it('should prevent cross-organization access', async () => {
    const service = new UniversalEntityService();
    
    await expect(
      service.update('entity-from-other-org', {}, 'org-123')
    ).rejects.toThrow('Entity not found or access denied');
  });
});
```

### Integration Tests
```typescript
describe('Organization Isolation', () => {
  it('should isolate data between organizations', async () => {
    // Create entities in different organizations
    const org1Entity = await createEntity('org-1', 'product', 'Product 1');
    const org2Entity = await createEntity('org-2', 'product', 'Product 2');
    
    // Verify isolation
    const org1Products = await getProducts('org-1');
    const org2Products = await getProducts('org-2');
    
    expect(org1Products).toContain(org1Entity);
    expect(org1Products).not.toContain(org2Entity);
    expect(org2Products).toContain(org2Entity);
    expect(org2Products).not.toContain(org1Entity);
  });
});
```

---

This documentation provides complete patterns for implementing any feature in HERA Universal without requiring specific knowledge. The universal schema handles infinite business scenarios while maintaining perfect data isolation and security.