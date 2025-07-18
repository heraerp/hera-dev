# 🎯 HERA Universal Architecture Quick Reference

## 🚨 **BEFORE WRITING ANY CODE:**

### **Step 1: Check Templates**
```bash
ls templates/crud/          # Check CRUD patterns
cat templates/architecture/universal-constraints.md
```

### **Step 2: Use Only These Imports**
```typescript
// ✅ ALWAYS USE
import UniversalCrudService from '@/lib/services/universalCrudService'
import { HeraNamingConventionAI } from '@/lib/naming/heraNamingConvention'

// ❌ NEVER USE  
import { createClient } from '@/lib/supabase/client'  // FORBIDDEN
import { workflowOrchestrator } from '@/lib/scanner'  // FORBIDDEN
```

### **Step 3: Use Exact EntityData Interface**
```typescript
// ✅ CORRECT PATTERN
const entityData: EntityData = {
  name: "Entity Name",        // REQUIRED - not entityName!
  organizationId: "org-123",  // OPTIONAL
  fields: { /* data */ }      // OPTIONAL
}

const result = await UniversalCrudService.createEntity(entityData, 'entity_type')
```

## 🔧 **API Route Template**
```typescript
import { NextRequest, NextResponse } from 'next/server'
import UniversalCrudService from '@/lib/services/universalCrudService'

export async function POST(request: NextRequest) {
  const data = await request.json()
  
  // Validate if needed
  const validation = await HeraNamingConventionAI.validateFieldName('table', 'field')
  
  // Use Universal CRUD
  const result = await UniversalCrudService.createEntity(data, 'entity_type')
  
  return NextResponse.json(result)
}
```

## ⚡ **Quick Commands**
```bash
# Setup enforcement
npm run setup:hooks

# Validate architecture  
npm run validate:architecture

# Check before commit
node scripts/validate-architecture.js
```

## 🚨 **Common Mistakes to Avoid**
1. Using `entityName` instead of `name`
2. Direct Supabase imports in business logic
3. Backend service patterns (workflow orchestrator)
4. Custom interfaces instead of EntityData
5. Not checking templates first

**Remember: When in doubt, check templates/crud/ first!**