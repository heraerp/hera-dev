# HERA Universal Architecture Enforcement

## 🚨 **MANDATORY ARCHITECTURE RULES**

### **Rule 1: ALWAYS Use UniversalCrudService**
```typescript
// ✅ CORRECT - Only way to interact with database
import UniversalCrudService from '@/lib/services/universalCrudService'

// ❌ FORBIDDEN - Never use direct Supabase client in business logic
import { createClient } from '@/lib/supabase/client'
```

### **Rule 2: ALWAYS Check Templates First**
Before writing ANY code:
1. Check `/frontend/templates/crud/` for patterns
2. Check `/frontend/templates/architecture/universal-constraints.md` for rules
3. Use existing interfaces, don't invent new ones

### **Rule 3: ALWAYS Follow EntityData Interface**
```typescript
// ✅ CORRECT - Use exact interface
interface EntityData {
  name: string                    // REQUIRED
  organizationId?: string | null  // OPTIONAL
  fields?: Record<string, any>    // OPTIONAL
  mainFields?: Record<string, any> // OPTIONAL
}
```

### **Rule 4: NO Backend Services in Frontend**
```typescript
// ❌ FORBIDDEN - Backend service pattern
import { WorkflowOrchestrator } from '@/lib/services/backend-service'

// ✅ CORRECT - Direct Universal CRUD
import UniversalCrudService from '@/lib/services/universalCrudService'
```

### **Rule 5: API Routes = Simple Wrappers Only**
```typescript
// ✅ CORRECT - API route pattern
export async function POST(request: NextRequest) {
  const data = await request.json()
  
  // Validate with naming convention
  const validation = await HeraNamingConventionAI.validateFieldName('table', 'field')
  
  // Use Universal CRUD
  const result = await UniversalCrudService.createEntity(data, entityType)
  
  return NextResponse.json(result)
}
```

## 🔧 **ENFORCEMENT MECHANISMS**

### **1. Pre-commit Hooks**
```bash
# Block commits that violate architecture rules
- Check for direct Supabase imports outside allowed files
- Verify UniversalCrudService usage
- Validate interface compliance
```

### **2. ESLint Rules**
```javascript
// .eslintrc.js additions
rules: {
  "hera/no-direct-supabase": "error",
  "hera/require-universal-crud": "error", 
  "hera/validate-entity-data": "error"
}
```

### **3. TypeScript Strict Mode**
```typescript
// Enforce interface compliance
interface StrictEntityData extends EntityData {
  // Force exact interface match
}
```

## 📊 **ARCHITECTURE COMPLIANCE CHECKLIST**

Before ANY code changes:
- [ ] Did I check templates first?
- [ ] Am I using UniversalCrudService?
- [ ] Do I follow EntityData interface exactly?
- [ ] Did I validate naming convention?
- [ ] Am I avoiding backend service patterns?
- [ ] Is this organization-first (organizationId param)?

## 🚨 **FORBIDDEN PATTERNS**

### **1. Direct Supabase Client**
```typescript
// ❌ NEVER DO THIS
const supabase = createClient()
const result = await supabase.from('table').insert(data)
```

### **2. Custom Interfaces**
```typescript
// ❌ NEVER INVENT NEW INTERFACES
interface MyCustomEntity {
  entityName: string  // Wrong!
  entityCode: string  // Wrong!
}
```

### **3. Backend Service Imports**
```typescript
// ❌ NEVER IMPORT BACKEND SERVICES
import { WorkflowService } from './backend-services'
```

### **4. Mixed Architecture**
```typescript
// ❌ NEVER MIX PATTERNS
const crud = UniversalCrudService  // CRUD pattern
const workflow = WorkflowService   // Backend pattern (WRONG!)
```

## ✅ **APPROVED PATTERNS**

### **1. Entity Creation**
```typescript
const entityData: EntityData = {
  name: "Product Name",
  organizationId: "org-123", 
  fields: { price: 9.99 }
}
const result = await UniversalCrudService.createEntity(entityData, 'product')
```

### **2. Entity Reading**
```typescript
const entity = await UniversalCrudService.readEntity(organizationId, entityId)
```

### **3. Entity Listing**
```typescript
const entities = await UniversalCrudService.listEntities(organizationId, 'product', {
  page: 1,
  pageSize: 25,
  search: 'query'
})
```

This document MUST be consulted before ANY architectural decisions.