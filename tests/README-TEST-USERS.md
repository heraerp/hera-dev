# Test User Management System for HERA Universal

A comprehensive system for creating, managing, and testing with programmatically generated users in Supabase + Playwright.

## ✨ Features

- **🚀 Programmatic User Creation**: Create test users directly in Supabase Auth + core_users
- **🏢 Organization Management**: Create complete restaurant organizations with users
- **🔐 Seamless Login**: Automatic Playwright login with test users
- **🧹 Automatic Cleanup**: Clean up all test data after tests complete
- **👥 Multi-Role Support**: Owner, Manager, Staff role testing
- **⚡ Load Testing**: Create multiple users for concurrent testing
- **🎯 Role-Based Testing**: Test different permission levels

## 🏗️ Architecture

```
tests/
├── helpers/
│   ├── test-user-manager.ts          # Core test user management
│   └── login.ts                      # Enhanced login helpers
├── examples/
│   └── test-user-examples.spec.ts    # Example usage patterns
├── config/
│   └── test-users.config.ts          # Configuration settings
├── restaurant-flow-with-test-users.spec.ts  # Real workflow tests
└── README-TEST-USERS.md              # This documentation
```

## 🚀 Quick Start

### 1. Environment Setup

Ensure your `.env.local` file has Supabase credentials:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_SUPABASE_SERVICE_KEY=your_service_role_key  # Required for user creation
```

### 2. Run Example Tests

```bash
# Quick demo - create and login with test user
npm run test:users:quick

# Full examples suite
npm run test:users:examples

# Complete restaurant workflow
npm run test:users:restaurant

# Load testing with multiple users
npm run test:users:load

# Test cleanup functionality
npm run test:users:cleanup
```

### 3. Interactive Demo

```bash
# Show all available commands
npm run test:users help

# Run specific demo
npm run test:users quick-demo
npm run test:users restaurant-flow
npm run test:users load-test
```

## 📖 Usage Examples

### Basic Test User Creation

```typescript
import { createTestUser, loginTestUser, cleanupAllTestUsers } from './helpers/test-user-manager';

test('My test with restaurant owner', async ({ page }) => {
  // Create a complete test user with restaurant
  const { user, organization } = await createTestUser({
    fullName: 'Pizza Palace Owner',
    role: 'owner',
    organizationName: 'Test Pizza Palace',
    industry: 'restaurant'
  });

  // Login with the test user
  await loginTestUser(page, user);

  // Test your application
  await page.goto('http://localhost:3002/restaurant');
  await expect(page.locator(`text=${organization.name}`)).toBeVisible();

  // Cleanup happens automatically in afterAll hook
});
```

### Multiple Role Testing

```typescript
test('Multi-role restaurant workflow', async ({ page }) => {
  // Create different user types
  const { user: owner } = await createTestUser({
    role: 'owner',
    organizationName: 'Multi-Role Restaurant'
  });
  
  const { user: manager } = await createTestUser({
    role: 'manager',
    organizationName: 'Multi-Role Restaurant - Management'
  });

  const { user: staff } = await createTestUser({
    role: 'staff',
    organizationName: 'Multi-Role Restaurant - Staff'
  });

  // Test each role
  for (const { user, expectedRole } of [
    { user: owner, expectedRole: 'owner' },
    { user: manager, expectedRole: 'manager' },
    { user: staff, expectedRole: 'staff' }
  ]) {
    await loginTestUser(page, user);
    
    // Test role-specific functionality
    await page.goto('http://localhost:3002/restaurant');
    
    // Verify role-appropriate access
    // ... role-specific assertions
    
    // Logout for next user
    await page.goto('http://localhost:3002/login');
  }
});
```

### Load Testing

```typescript
test('Concurrent user access', async ({ browser }) => {
  // Create multiple users
  const users = await testUserManager.createMultipleTestUsers(5, 'Load Test Restaurant');

  // Create multiple browser contexts
  const contexts = await Promise.all([
    browser.newContext(),
    browser.newContext(),
    browser.newContext()
  ]);

  const pages = await Promise.all(contexts.map(ctx => ctx.newPage()));

  // Login all users concurrently
  await Promise.all(
    pages.map(async (page, index) => {
      await loginTestUser(page, users[index]);
      await page.goto('http://localhost:3002/restaurant');
    })
  );

  // Verify concurrent access works
  for (const page of pages) {
    expect(page.url()).toContain('/restaurant');
  }

  // Cleanup
  await Promise.all(contexts.map(ctx => ctx.close()));
});
```

## 🔧 Advanced Features

### Custom User Configuration

```typescript
// Create user with specific configuration
const { user, organization } = await createTestUser({
  email: 'custom@test.com',           // Optional: Custom email
  password: 'CustomPassword123!',     // Optional: Custom password
  fullName: 'Custom Test User',       // Optional: Custom name
  role: 'manager',                    // Optional: Role (owner/manager/staff)
  organizationName: 'Custom Restaurant', // Optional: Organization name
  industry: 'restaurant'              // Optional: Industry type
});
```

### Manual User Management

```typescript
import { testUserManager } from './helpers/test-user-manager';

// Get user information
const allUsers = testUserManager.getAllTestUsers();
const allOrganizations = testUserManager.getAllTestOrganizations();

// Find specific user
const user = testUserManager.getTestUser('test@example.com');

// Manual cleanup of specific user
await testUserManager.cleanupTestUser(userId);

// Cleanup all at once
await testUserManager.cleanupAll();
```

### Simple Users (No Organization)

```typescript
// Create user without organization (for setup flow testing)
const user = await createSimpleUser({
  fullName: 'Setup Flow Test User'
});

await loginTestUser(page, user);

// User will need to create/join organization
await page.goto('http://localhost:3002/setup/restaurant');
// Test restaurant setup flow...
```

## 🎯 Testing Patterns

### 1. Complete Workflow Testing

Test entire business processes with real users:

```typescript
test('Complete order workflow', async ({ page }) => {
  const { user } = await createTestUser({ role: 'owner' });
  await loginTestUser(page, user);
  
  // Test: Create product → Place order → Process in kitchen → Complete
  // Each step uses real database operations
});
```

### 2. Permission Testing

Verify role-based access controls:

```typescript
test('Permission boundaries', async ({ page }) => {
  const { user: staff } = await createTestUser({ role: 'staff' });
  await loginTestUser(page, staff);
  
  // Verify staff cannot access admin features
  await page.goto('http://localhost:3002/restaurant/settings');
  // Should redirect or show access denied
});
```

### 3. Data Consistency Testing

Ensure multi-tenant data isolation:

```typescript
test('Tenant data isolation', async ({ page }) => {
  const { user: user1 } = await createTestUser({ organizationName: 'Restaurant A' });
  const { user: user2 } = await createTestUser({ organizationName: 'Restaurant B' });
  
  // Verify users only see their own restaurant's data
});
```

## 🧹 Cleanup and Best Practices

### Automatic Cleanup

Tests automatically clean up after themselves:

```typescript
// In your test file
test.afterAll(async () => {
  await cleanupAllTestUsers(); // Cleans up all test data
});
```

### Manual Cleanup

For debugging or custom scenarios:

```bash
# Run cleanup test to verify cleanup works
npm run test:users:cleanup

# Or manually in test code
await testUserManager.cleanupAll();
```

### Best Practices

1. **Always use unique names**: Test users/organizations get random IDs
2. **Set up cleanup hooks**: Use `test.afterAll()` for cleanup
3. **Use descriptive names**: Make test data easily identifiable
4. **Test in isolation**: Each test should create its own users
5. **Handle concurrent tests**: Use different organization names for parallel tests

## 🔍 Debugging

### Enable Detailed Logging

The test user manager provides detailed console logging:

```
🚀 Creating test user and organization: test.user.1234567890.abc123@hera-test.com
✅ Auth user created: 12345678-1234-1234-1234-123456789012
✅ Client created: 87654321-4321-4321-4321-210987654321
✅ Organization created: 11111111-2222-3333-4444-555555555555
✅ Core user created: 99999999-8888-7777-6666-555555555555
✅ User linked to organization
🎉 Test user and organization created successfully!
```

### Common Issues

1. **Missing environment variables**: Check `.env.local` file
2. **Service role permissions**: Ensure service role key has admin access
3. **Database constraints**: Verify Supabase schema matches expectations
4. **Test timeouts**: Increase timeouts for slow operations

### Debug Mode

```bash
# Run tests with debug mode
npm run test:users:examples -- --debug

# Run with visible browser
npm run test:users:examples -- --headed
```

## 📊 Performance

The system is optimized for:

- **Fast user creation**: ~2-3 seconds per complete user+organization
- **Parallel operations**: Create multiple users concurrently
- **Efficient cleanup**: Batch deletion operations
- **Memory management**: Minimal memory footprint

## 🎯 Integration with Existing Tests

You can integrate this system with your existing test suite:

```typescript
// Replace manual user creation
// OLD:
// await page.fill('#email', 'hardcoded@test.com');

// NEW:
const { user } = await createTestUser();
await loginTestUser(page, user);
```

This provides:
- **Dynamic test data**: No conflicts between test runs
- **Real database state**: Tests against actual Supabase data
- **Automatic cleanup**: No manual test data management
- **Consistent patterns**: Standardized across all tests

---

🎉 **Ready to test!** Start with `npm run test:users:quick` to see the system in action.