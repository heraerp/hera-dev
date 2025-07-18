# HERA Universal Multi-Organization Architecture Functions

This document explains the PostgreSQL RPC functions that support HERA Universal's multi-organization architecture, following the Universal Architecture principles.

## Overview

The multi-organization architecture enables:
- **Multi-tenant support** - Single database, multiple organizations
- **Granular access control** - Role-based permissions per organization
- **Organization switching** - Users can switch between organizations
- **Solution management** - Different modules/features per organization
- **Audit tracking** - Complete activity logging

## Core Functions

### 1. `get_user_organizations_with_solutions(p_auth_user_id UUID)`

Returns all organizations a user has access to with their solutions and permissions.

**Parameters:**
- `p_auth_user_id` - The authenticated user's UUID from auth.users

**Returns:**
- `organization_id` - Organization UUID
- `organization_name` - Organization display name
- `organization_code` - Unique organization code
- `client_id` - Parent client UUID
- `client_name` - Parent client name
- `industry` - Organization industry
- `country` - Organization country
- `currency` - Organization currency
- `user_role` - User's role in this organization
- `is_active` - Whether the relationship is active
- `solutions` - Available solutions/modules (JSONB)
- `permissions` - User permissions (JSONB)
- `created_at` - When user joined organization
- `last_accessed` - Last time user accessed this organization

**Example:**
```sql
SELECT * FROM public.get_user_organizations_with_solutions(
    (SELECT id FROM auth.users WHERE email = 'user@example.com')
);
```

### 2. `check_organization_access(p_auth_user_id UUID, p_organization_id UUID, p_required_permission TEXT)`

Validates if a user can access a specific organization with the required permission level.

**Parameters:**
- `p_auth_user_id` - User UUID
- `p_organization_id` - Organization UUID
- `p_required_permission` - Required permission ('read', 'write', 'delete', 'admin', 'owner')

**Returns:**
- `has_access` - Whether user has required access
- `user_role` - User's role in organization
- `permission_level` - Numeric permission level (1-5)
- `organization_name` - Organization name
- `access_reason` - Reason for access decision

**Example:**
```sql
SELECT * FROM public.check_organization_access(
    auth.uid(), 
    'org-uuid-here', 
    'write'
);
```

### 3. `switch_organization_context(p_auth_user_id UUID, p_organization_id UUID, p_session_info JSONB)`

Updates user's current organization context and logs the switch.

**Parameters:**
- `p_auth_user_id` - User UUID
- `p_organization_id` - Target organization UUID
- `p_session_info` - Optional session metadata (JSONB)

**Returns:**
- `success` - Whether switch was successful
- `message` - Success/error message
- `organization_id` - Organization UUID
- `organization_name` - Organization name
- `client_name` - Parent client name
- `user_role` - User's role
- `permissions` - User permissions (JSONB)
- `context_data` - Full context data (JSONB)

**Example:**
```sql
SELECT * FROM public.switch_organization_context(
    auth.uid(),
    'target-org-uuid',
    '{"source": "frontend", "timestamp": "2024-01-15T10:00:00Z"}'::jsonb
);
```

### 4. `get_current_organization_context(p_auth_user_id UUID)`

Retrieves the user's current organization context (last accessed organization).

**Parameters:**
- `p_auth_user_id` - User UUID

**Returns:**
- `organization_id` - Current organization UUID
- `organization_name` - Organization name
- `client_name` - Parent client name
- `user_role` - User's role
- `permissions` - User permissions (JSONB)
- `last_accessed` - Last access timestamp
- `context_data` - Full context data (JSONB)

**Example:**
```sql
SELECT * FROM public.get_current_organization_context(auth.uid());
```

### 5. `add_user_to_organization(p_requesting_user_id UUID, p_target_user_email TEXT, p_organization_id UUID, p_role TEXT)`

Adds a user to an organization with a specified role.

**Parameters:**
- `p_requesting_user_id` - Admin user making the request
- `p_target_user_email` - Email of user to add
- `p_organization_id` - Organization UUID
- `p_role` - Role to assign ('user', 'manager', 'admin', 'owner')

**Returns:**
- `success` - Whether addition was successful
- `message` - Success/error message
- `user_id` - Target user UUID
- `organization_id` - Organization UUID
- `role` - Assigned role

**Example:**
```sql
SELECT * FROM public.add_user_to_organization(
    auth.uid(),
    'newuser@example.com',
    'org-uuid-here',
    'user'
);
```

### 6. `remove_user_from_organization(p_requesting_user_id UUID, p_target_user_email TEXT, p_organization_id UUID)`

Removes a user from an organization (sets relationship to inactive).

**Parameters:**
- `p_requesting_user_id` - Admin user making the request
- `p_target_user_email` - Email of user to remove
- `p_organization_id` - Organization UUID

**Returns:**
- `success` - Whether removal was successful
- `message` - Success/error message
- `user_id` - Target user UUID
- `organization_id` - Organization UUID

**Example:**
```sql
SELECT * FROM public.remove_user_from_organization(
    auth.uid(),
    'user@example.com',
    'org-uuid-here'
);
```

### 7. `get_organization_members(p_requesting_user_id UUID, p_organization_id UUID)`

Returns all members of an organization with their roles and permissions.

**Parameters:**
- `p_requesting_user_id` - User making the request
- `p_organization_id` - Organization UUID

**Returns:**
- `user_id` - Member user UUID
- `user_email` - Member email
- `user_name` - Member full name
- `role` - Member role
- `permission_level` - Numeric permission level
- `is_active` - Whether member is active
- `joined_at` - When member joined
- `last_accessed` - Last access timestamp

**Example:**
```sql
SELECT * FROM public.get_organization_members(
    auth.uid(),
    'org-uuid-here'
);
```

### 8. `initialize_organization_solutions(p_requesting_user_id UUID, p_organization_id UUID, p_solutions JSONB)`

Sets up available solutions/modules for an organization.

**Parameters:**
- `p_requesting_user_id` - Admin user making the request
- `p_organization_id` - Organization UUID
- `p_solutions` - Solutions configuration (JSONB array)

**Returns:**
- `success` - Whether initialization was successful
- `message` - Success/error message
- `solutions_configured` - Number of solutions configured

**Example:**
```sql
SELECT * FROM public.initialize_organization_solutions(
    auth.uid(),
    'org-uuid-here',
    '[
        {"name": "restaurant_pos", "status": "active", "config": {"features": ["orders", "payments"]}},
        {"name": "inventory_management", "status": "active", "config": {"features": ["stock_tracking"]}}
    ]'::jsonb
);
```

## Permission Levels

The system uses a numeric permission level system:

- **1** - Basic access
- **2** - User (read/write own data)
- **3** - Manager (read/write team data)
- **4** - Admin (read/write/delete organization data)
- **5** - Owner (full control)

## Row Level Security (RLS)

The system includes comprehensive RLS policies that automatically enforce multi-organization access control:

### Helper Functions

- `get_current_user_id()` - Returns current authenticated user UUID
- `user_has_org_access(org_id, permission)` - Checks if user has organization access
- `get_user_organization_ids()` - Returns array of user's organization IDs

### RLS Policies

All tables have RLS policies that:
- Restrict access to data within user's organizations
- Enforce permission levels for write/delete operations
- Allow admins to manage users within their organizations
- Prevent unauthorized cross-organization access

## Usage in Frontend

### TypeScript Service Integration

```typescript
import { supabase } from '@/lib/supabase/client';

// Get user organizations
const { data: organizations } = await supabase
  .rpc('get_user_organizations_with_solutions', {
    p_auth_user_id: user.id
  });

// Check organization access
const { data: access } = await supabase
  .rpc('check_organization_access', {
    p_auth_user_id: user.id,
    p_organization_id: orgId,
    p_required_permission: 'write'
  });

// Switch organization context
const { data: context } = await supabase
  .rpc('switch_organization_context', {
    p_auth_user_id: user.id,
    p_organization_id: newOrgId,
    p_session_info: { source: 'frontend', timestamp: new Date().toISOString() }
  });
```

### React Hook Example

```typescript
import { useUser } from '@supabase/auth-helpers-react';
import { useQuery } from '@tanstack/react-query';

export function useUserOrganizations() {
  const user = useUser();
  
  return useQuery({
    queryKey: ['user-organizations', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data } = await supabase
        .rpc('get_user_organizations_with_solutions', {
          p_auth_user_id: user.id
        });
      
      return data || [];
    },
    enabled: !!user
  });
}
```

## Testing

### Test Functions

- `test_multi_organization_functions()` - Comprehensive test suite
- `create_test_multi_org_data()` - Create test data
- `cleanup_test_multi_org_data()` - Clean up test data

### Running Tests

```sql
-- Create test data
SELECT * FROM public.create_test_multi_org_data();

-- Run all tests
SELECT * FROM public.test_multi_organization_functions();

-- Clean up
SELECT * FROM public.cleanup_test_multi_org_data();
```

## Security Considerations

1. **Authentication Required** - All functions require authenticated user
2. **Permission Validation** - Access is validated at function level
3. **RLS Enforcement** - Database-level access control
4. **Audit Logging** - All access is logged in core_metadata
5. **Principle of Least Privilege** - Users only access what they need

## Error Handling

Functions return detailed error messages and status codes:
- **Access Denied** - User lacks required permissions
- **User Not Found** - Target user doesn't exist
- **Organization Not Found** - Organization doesn't exist or inactive
- **Invalid Parameters** - Required parameters missing or invalid

## Performance Considerations

- Functions use efficient queries with proper indexing
- RLS policies are optimized for performance
- Metadata is cached using JSONB for fast access
- Audit logging is asynchronous where possible

## Migration and Deployment

1. **Run setup-hera-structure.sql** - Creates base tables
2. **Run multi_organization_functions.sql** - Creates RPC functions
3. **Run multi_organization_rls_policies.sql** - Creates RLS policies
4. **Run test_multi_organization_functions.sql** - Creates test functions
5. **Test with sample data** - Validate functionality

This multi-organization architecture provides a robust, scalable foundation for HERA Universal's enterprise-grade multi-tenant system while maintaining the simplicity and elegance of the Universal Architecture principles.