# HERA Universal ERP - User Organization Service

## Overview

The User Organization Service provides comprehensive multi-organization access management, solution switching, and role-based permissions for HERA Universal ERP. It follows Universal Architecture principles and integrates seamlessly with the existing organization service.

## Key Features

### 🏢 Multi-Organization Management
- **Organization Switching**: Seamless switching between organizations with context preservation
- **Role-Based Access**: Different roles (admin, manager, editor, user, viewer) with appropriate permissions
- **Real-Time Sync**: Live updates when organization data changes
- **Audit Trail**: Complete tracking of all organization switches and access changes

### 🚀 Solution & Module Access Control
- **Solution Management**: Grant/revoke access to specific solutions (Finance, Inventory, HR, CRM)
- **Module-Level Control**: Fine-grained access to individual modules within solutions
- **Permission Overrides**: Temporary or permanent permission modifications
- **Expiration Management**: Time-based access with automatic expiration

### 🔐 Advanced Security
- **Row-Level Security**: Database-enforced access controls
- **Permission Inheritance**: Role-based permissions with custom overrides
- **Access Validation**: Real-time validation of user permissions
- **Secure Context Switching**: Verified organization access before switching

## Architecture

### Service Layer
```typescript
UserOrganizationService
├── getUserOrganizations()      # Get all user organizations with full access details
├── switchOrganization()        # Switch active organization with context building
├── switchSolution()            # Switch active solution within organization
├── grantSolutionAccess()       # Grant solution access to users
├── revokeSolutionAccess()      # Revoke solution access from users
├── buildOrganizationContext()  # Build complete organization context
└── calculateEffectivePermissions() # Calculate final permissions with overrides
```

### Hook Layer
```typescript
useUserOrganization()
├── organizations              # All accessible organizations
├── currentOrganization        # Current organization context
├── currentSolution           # Active solution
├── switchOrganization()      # Organization switching
├── switchSolution()          # Solution switching
├── hasAccessToSolution()     # Permission checking
└── grantSolutionAccess()     # Access management
```

### Component Layer
```typescript
<OrganizationSwitcher />      # Main organization/solution switcher
<OrganizationProvider />      # Global context provider
useOrganizationContext()      # Context hook
```

## Installation & Setup

### 1. Database Schema
The service uses HERA's Universal Architecture with these entity types:
```sql
-- Core organization relationships
user_organizations              # User-organization relationships
core_organizations             # Organization master data
core_entities                  # Universal entity storage
core_metadata                  # Rich metadata and context

-- Entity types used
USER_ORGANIZATION              # User org relationships
SOLUTION_ACCESS               # Solution access grants
MODULE_ACCESS                 # Module access grants
USER_PERMISSION               # Permission overrides
```

### 2. Service Integration
```typescript
// Import the service
import UserOrganizationService from '@/lib/services/userOrganizationService'

// Get user's organizations
const orgsResult = await UserOrganizationService.getUserOrganizations(userId)

// Switch organization
const switchResult = await UserOrganizationService.switchOrganization(userId, orgId)

// Grant solution access
await UserOrganizationService.grantSolutionAccess(userId, orgId, solutionId, grantedBy)
```

### 3. Hook Usage
```typescript
// Use the enhanced hook
import { useUserOrganization } from '@/hooks/useUserOrganization'

function MyComponent() {
  const {
    organizations,
    currentOrganization,
    currentSolution,
    switchOrganization,
    switchSolution,
    hasAccessToSolution,
    canGrantAccess
  } = useUserOrganization()

  // Switch organization
  const handleOrgSwitch = async (orgId: string) => {
    await switchOrganization(orgId)
  }

  // Check access
  const hasFinanceAccess = hasAccessToSolution('finance-solution-id')
  
  return (
    <div>
      <h2>{currentOrganization?.organization.name}</h2>
      <p>Solution: {currentSolution?.name}</p>
      {hasFinanceAccess && <FinanceModule />}
    </div>
  )
}
```

### 4. Provider Setup
```typescript
// Wrap your app with the organization provider
import { OrganizationProvider } from '@/components/providers/organization-provider'

function App() {
  return (
    <OrganizationProvider>
      <YourApp />
    </OrganizationProvider>
  )
}

// Use context in components
import { useOrganizationContext } from '@/components/providers/organization-provider'

function SomeComponent() {
  const { currentContext, switchSolution } = useOrganizationContext()
  
  return (
    <div>
      <h3>{currentContext?.organization.name}</h3>
      <button onClick={() => switchSolution('finance-001')}>
        Switch to Finance
      </button>
    </div>
  )
}
```

## Usage Examples

### Basic Organization Management
```typescript
// Get all organizations for current user
const { data: organizations } = await UserOrganizationService.getUserOrganizations(userId)

// Switch to different organization
const switchResult = await UserOrganizationService.switchOrganization(userId, targetOrgId)

if (switchResult.success) {
  const { context, newOrganization } = switchResult.data
  console.log('Switched to:', newOrganization.name)
  console.log('Available solutions:', context.availableSolutions)
}
```

### Solution Access Management
```typescript
// Grant access to Finance solution
await UserOrganizationService.grantSolutionAccess(
  userId,
  organizationId,
  'finance-solution-id',
  grantedByUserId,
  '2024-12-31' // expires at
)

// Revoke access
await UserOrganizationService.revokeSolutionAccess(
  userId,
  organizationId,
  'finance-solution-id',
  revokedByUserId,
  'Access no longer needed'
)

// Check access
const solutionAccess = await UserOrganizationService.getUserSolutionAccess(userId, organizationId)
const hasAccess = solutionAccess.data?.some(s => s.solution_id === 'finance-solution-id' && s.is_enabled)
```

### Permission Calculations
```typescript
// Get effective permissions for user
const { data: context } = await UserOrganizationService.buildOrganizationContext(userId, organizationId)

const permissions = context.permissions
if (permissions.can_approve && permissions.max_transaction_amount > 10000) {
  // User can approve large transactions
}

// Check specific transaction type access
const canCreateJournalEntry = permissions.allowed_transaction_types.includes('journal_entry')
```

### Real-Time Updates
```typescript
// Subscribe to organization changes
const subscription = UserOrganizationService.subscribeToOrganizationChanges(
  organizationId,
  (payload) => {
    console.log('Organization changed:', payload)
    // Refresh data or update UI
  }
)

// Cleanup subscription
UserOrganizationService.unsubscribe(subscription)
```

## Component Integration

### Organization Switcher
```typescript
import { OrganizationSwitcher } from '@/components/organization/organization-switcher'

function Header() {
  return (
    <header>
      <h1>HERA Universal ERP</h1>
      <OrganizationSwitcher />
    </header>
  )
}
```

### Access-Controlled Components
```typescript
import { useSolutionAccess } from '@/components/providers/organization-provider'

function FinanceSection() {
  const hasFinanceAccess = useSolutionAccess('finance-solution-id')
  
  if (!hasFinanceAccess) {
    return <div>Access denied to Finance module</div>
  }
  
  return <FinanceModule />
}
```

### Permission-Based UI
```typescript
import { useOrganizationPermissions } from '@/components/providers/organization-provider'

function ActionButtons() {
  const permissions = useOrganizationPermissions()
  
  return (
    <div>
      {permissions?.can_create && <CreateButton />}
      {permissions?.can_edit && <EditButton />}
      {permissions?.can_approve && <ApproveButton />}
      {permissions?.can_admin && <AdminButton />}
    </div>
  )
}
```

## Advanced Features

### Custom Permission Overrides
```typescript
// Create permission override
const override = {
  permission_key: 'can_approve',
  original_value: false,
  override_value: true,
  reason: 'Temporary approval authority for Q4 close',
  approved_by: 'manager-user-id',
  valid_from: '2024-01-01',
  valid_until: '2024-01-31'
}

// Apply override through metadata
await UserOrganizationService.updateUserMetadata(userId, organizationId, {
  permission_overrides: [override]
})
```

### Solution Module Management
```typescript
// Get available modules for a solution
const { data: modules } = await UserOrganizationService.getSolutionModules(
  solutionId,
  userId,
  organizationId
)

// Grant module access
await UserOrganizationService.grantModuleAccess(
  userId,
  organizationId,
  moduleId,
  permissions: ['view', 'create', 'edit']
)
```

### Audit Trail Integration
```typescript
// All service operations automatically create audit trails
// Access audit data through universal transactions
const auditTrail = await supabase
  .from('universal_transactions')
  .select('*')
  .eq('organization_id', organizationId)
  .eq('transaction_type', 'audit_trail')
  .order('created_at', { ascending: false })
```

## Demo Page

A complete demo is available at `/demo/organization-management` showing:
- Organization switching
- Solution access management
- Permission visualization
- Real-time updates
- Access control examples

## Security Considerations

1. **Row-Level Security**: All queries are filtered by organization_id
2. **Permission Validation**: Real-time permission checking before operations
3. **Audit Logging**: Complete audit trail for all access changes
4. **Session Management**: Secure context switching with session validation
5. **Access Expiration**: Time-based access control with automatic cleanup

## Performance Optimizations

1. **Efficient Queries**: Optimized database queries with proper indexing
2. **Caching**: Local storage for frequently accessed data
3. **Lazy Loading**: Load organization context only when needed
4. **Batch Operations**: Bulk permission updates for better performance
5. **Real-Time Sync**: Efficient real-time updates using Supabase subscriptions

## Error Handling

The service includes comprehensive error handling:
- Authentication errors
- Authorization failures
- Database connection issues
- Invalid organization access
- Permission validation failures

All operations return structured responses with success/error status and detailed error messages.

## Testing

The service includes comprehensive testing for:
- Organization switching scenarios
- Permission calculations
- Access control validation
- Real-time sync functionality
- Error conditions

## Migration Guide

If migrating from the basic organization service:

1. Install the new service files
2. Update imports to use `useUserOrganization` instead of `useHeraOrganization`
3. Add the `OrganizationProvider` wrapper
4. Update components to use the new context system
5. Configure solution and module access as needed

The service is backward-compatible and extends the existing functionality without breaking changes.