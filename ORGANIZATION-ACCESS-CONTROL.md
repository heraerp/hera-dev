# 🛡️ HERA Universal - Organization Access Control Implementation Guide

## Overview

HERA Universal implements a comprehensive multi-tenant organization access control system that ensures every restaurant page belongs to an organization and displays data based on the user's access permissions. If a user doesn't have any organization, they are automatically redirected to the setup page.

## 🏗️ Architecture

### Core Components

#### 1. OrganizationGuard Component
**Location**: `/components/restaurant/organization-guard.tsx`

The OrganizationGuard is the foundation of our access control system. It wraps all restaurant pages and provides:

- Authentication verification
- Organization membership validation  
- Role-based access control
- Automatic redirects to setup page
- Loading and error states

```typescript
// Usage Pattern
<OrganizationGuard requiredRole="staff">
  <YourPageContent />
</OrganizationGuard>
```

#### 2. useOrganizationContext Hook
**Location**: `/components/restaurant/organization-guard.tsx`

Provides organization context to components:

```typescript
const { 
  organizationId, 
  organizationName, 
  userRole, 
  loading, 
  error, 
  hasAccess 
} = useOrganizationContext();
```

### Role Hierarchy

```typescript
const roleHierarchy = ['staff', 'manager', 'admin', 'owner'];
```

- **staff**: Basic access to operational features
- **manager**: Access to reports and staff management
- **admin**: Full administrative access
- **owner**: Complete organization control

## 🔧 Implementation Pattern

### Standard Page Structure

Every restaurant page follows this exact pattern:

```typescript
"use client";

import React, { useState, useEffect } from 'react';
// ... other imports
import { OrganizationGuard, useOrganizationContext } from '@/components/restaurant/organization-guard';

// Main content component (internal)
function PageContent() {
  const { organizationId } = useOrganizationContext();
  
  // Use organizationId! (with non-null assertion since OrganizationGuard ensures it exists)
  const {
    data,
    loading,
    error
  } = useYourService(organizationId!);
  
  // Your page content
  return (
    <div>
      {/* Page content */}
    </div>
  );
}

// Main exported component with access control
export default function YourPage() {
  return (
    <OrganizationGuard requiredRole="staff">
      <PageContent />
    </OrganizationGuard>
  );
}
```

### Critical Rules

1. **Always wrap with OrganizationGuard**: Every restaurant page must be wrapped
2. **Use organizationId from context**: Never hardcode organization IDs
3. **Split into content component**: Separate the wrapped content from the guard
4. **Set appropriate role**: Choose the minimum required role for the page
5. **Use non-null assertion**: `organizationId!` is safe inside OrganizationGuard

## 📁 Updated Pages

### Inventory Management
**File**: `/app/restaurant/inventory/page.tsx`
- **Role Required**: `staff`
- **Features**: Stock management, inventory tracking
- **Organization Scope**: Product catalog, stock levels

### Customer Management  
**File**: `/app/restaurant/customers/page.tsx`
- **Role Required**: `staff`
- **Features**: Customer database, order history
- **Organization Scope**: Customer relationships, preferences

### Staff Management
**File**: `/app/restaurant/staff-universal/page.tsx`
- **Role Required**: `manager`
- **Features**: Employee management, scheduling
- **Organization Scope**: Staff members, roles, permissions

### Kitchen Display
**File**: `/app/restaurant/kitchen/page.tsx`
- **Role Required**: `staff`
- **Features**: Order processing, kitchen workflow
- **Organization Scope**: Active orders, preparation status

### Reports Dashboard
**File**: `/app/restaurant/reports-universal/page.tsx`
- **Role Required**: `manager`
- **Features**: Analytics, business intelligence
- **Organization Scope**: Financial data, performance metrics

### AI Dashboard
**File**: `/app/restaurant/ai-dashboard/page.tsx`
- **Role Required**: `manager`
- **Features**: AI insights, automated recommendations
- **Organization Scope**: Intelligent analysis, predictions

## 🎯 User Experience Flow

### Authenticated User with Organization
1. User navigates to restaurant page
2. OrganizationGuard verifies authentication
3. Checks organization membership
4. Validates role permissions
5. Page renders with organization-scoped data

### User Without Organization
1. User navigates to restaurant page
2. OrganizationGuard detects missing organization
3. Beautiful setup prompt displayed
4. Auto-redirect to `/setup/restaurant`
5. User completes organization setup
6. Returns to original page with access

### Insufficient Permissions
1. User accesses page requiring higher role
2. OrganizationGuard checks role hierarchy
3. Permission denied screen shown
4. Option to return to dashboard

## 🔒 Security Features

### Data Isolation
- All database queries filtered by `organizationId`
- No cross-organization data leakage
- Automatic scope enforcement

### Access Control
- Role-based page access
- Permission validation
- Automatic redirects for unauthorized access

### Audit Trail
- All access attempts logged
- Organization membership changes tracked
- Role modifications recorded

## 🚀 Adding New Restaurant Pages

### Step 1: Create Page Structure
```typescript
"use client";

import { OrganizationGuard, useOrganizationContext } from '@/components/restaurant/organization-guard';

function NewPageContent() {
  const { organizationId } = useOrganizationContext();
  
  // Your implementation
  
  return <div>Page Content</div>;
}

export default function NewPage() {
  return (
    <OrganizationGuard requiredRole="staff"> {/* Choose appropriate role */}
      <NewPageContent />
    </OrganizationGuard>
  );
}
```

### Step 2: Update Services
Ensure all services accept `organizationId` parameter:

```typescript
const fetchData = async (organizationId: string) => {
  const { data } = await supabase
    .from('your_table')
    .select('*')
    .eq('organization_id', organizationId); // CRITICAL: Always filter by organization
    
  return data;
};
```

### Step 3: Test Access Control
- Test with user having organization
- Test with user without organization  
- Test with insufficient role permissions
- Verify data isolation

## 🛠️ Troubleshooting

### Common Issues

#### 1. "No organization found" Error
**Solution**: User needs to complete restaurant setup
```typescript
// Check if user has completed setup
const { restaurantData } = useRestaurantManagement();
if (!restaurantData) {
  // User will be redirected to setup automatically
}
```

#### 2. Permission Denied
**Solution**: Check required role vs user role
```typescript
// Verify role hierarchy
const userRole = 'staff';
const requiredRole = 'manager';
const roleHierarchy = ['staff', 'manager', 'admin', 'owner'];
const hasAccess = roleHierarchy.indexOf(userRole) >= roleHierarchy.indexOf(requiredRole);
```

#### 3. Data Not Loading
**Solution**: Verify organization context
```typescript
const { organizationId, hasAccess } = useOrganizationContext();
console.log('Organization ID:', organizationId);
console.log('Has Access:', hasAccess);
```

### Debug Commands

```bash
# Check organization relationships
grep -r "useOrganizationContext" app/restaurant/

# Verify no hardcoded organization IDs
grep -r "f47ac10b-58cc-4372-a567-0e02b2c3d479" app/restaurant/

# Check OrganizationGuard usage
grep -r "OrganizationGuard" app/restaurant/
```

## 📊 Monitoring

### Access Metrics
- Page access attempts by role
- Organization setup completion rate
- Permission denial frequency
- User flow through access control

### Security Monitoring
- Cross-organization access attempts
- Role escalation attempts
- Unusual access patterns
- Failed authentication rates

## 🔄 Migration Checklist

When adding access control to existing pages:

- [ ] Import OrganizationGuard and useOrganizationContext
- [ ] Split component into content and wrapper
- [ ] Replace hardcoded organizationId with context
- [ ] Set appropriate required role
- [ ] Update service calls to use context organizationId
- [ ] Test all access scenarios
- [ ] Verify data isolation
- [ ] Update documentation

## 🎯 Best Practices

### Do's
✅ Always wrap restaurant pages with OrganizationGuard
✅ Use organizationId from context, never hardcode
✅ Set minimum required role for each page
✅ Test all access control scenarios
✅ Filter all queries by organizationId
✅ Provide clear error messages

### Don'ts
❌ Never hardcode organization IDs
❌ Don't bypass OrganizationGuard for "quick fixes"
❌ Don't assume user has organization access
❌ Don't mix organization data
❌ Don't skip role validation
❌ Don't ignore loading states

## 🔮 Future Enhancements

### Planned Features
- Multi-organization switching UI
- Granular permission system
- Organization invitation system
- Advanced audit logging
- Real-time access monitoring

### Extensibility
The access control system is designed to support:
- Custom role definitions
- Page-level permissions
- Feature flags per organization
- Dynamic role assignment
- Organization hierarchies

---

This documentation provides everything needed to implement, maintain, and extend the organization access control system in HERA Universal. The pattern is reusable across all restaurant pages and ensures consistent multi-tenant security.