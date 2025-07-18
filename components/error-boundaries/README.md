# HERA Universal Error Boundary System

A comprehensive error handling system for React components that provides graceful error recovery, detailed error reporting, and excellent user experience during failures.

## Features

- 🛡️ **Multi-Level Protection**: Page, section, and component-level error boundaries
- 🔄 **Automatic Recovery**: Smart retry mechanisms with exponential backoff
- 📊 **Analytics Integration**: Automatic error tracking and reporting
- 🎨 **Beautiful Fallbacks**: User-friendly error UI with actionable solutions
- ⚡ **Async Error Handling**: Special handling for async operations and data loading
- 🔍 **Development Tools**: Detailed error information and stack traces
- 📱 **Mobile Optimized**: Responsive error handling for all devices

## Components

### ErrorBoundary (Base)
The core error boundary component with comprehensive error handling features.

```tsx
import { ErrorBoundary } from '@/components/error-boundaries';

<ErrorBoundary
  level="component"
  name="My Component"
  enableRetry={true}
  showDetails={true}
  onError={(error, errorInfo) => console.log('Custom error handling')}
>
  <MyComponent />
</ErrorBoundary>
```

### PageErrorBoundary
Specialized error boundary for full page errors with enhanced fallback UI.

```tsx
import { PageErrorBoundary } from '@/components/error-boundaries';

<PageErrorBoundary pageName="Dashboard">
  <DashboardPage />
</PageErrorBoundary>
```

### ComponentErrorBoundary
Lightweight error boundary for individual components with minimal fallback UI.

```tsx
import { ComponentErrorBoundary } from '@/components/error-boundaries';

<ComponentErrorBoundary componentName="User Profile" minimal={true}>
  <UserProfile />
</ComponentErrorBoundary>
```

### AsyncErrorBoundary
Specialized error boundary for handling async operations and data loading errors.

```tsx
import { AsyncErrorBoundary } from '@/components/error-boundaries';

<AsyncErrorBoundary
  isLoading={loading}
  error={error}
  onRetry={refetch}
  operationName="user data"
  isEmpty={data?.length === 0}
>
  <UserList data={data} />
</AsyncErrorBoundary>
```

### ErrorBoundaryProvider
Global error boundary for the entire application.

```tsx
// In your root layout
import ErrorBoundaryProvider from '@/components/error-boundaries/ErrorBoundaryProvider';

<ErrorBoundaryProvider>
  <App />
</ErrorBoundaryProvider>
```

## Hooks

### useAsyncError
Custom hook for handling async operations with error boundary integration.

```tsx
import { useAsyncError } from '@/components/error-boundaries';

function UserProfile() {
  const [state, actions] = useAsyncError({
    onSuccess: (data) => console.log('Success!', data),
    onError: (error) => console.error('Error:', error),
    retryCount: 3,
    retryDelay: 1000
  });

  const loadUser = async () => {
    await actions.execute(async () => {
      const response = await fetch('/api/user');
      return response.json();
    });
  };

  return (
    <AsyncErrorBoundary
      isLoading={state.isLoading}
      error={state.error}
      onRetry={loadUser}
      isEmpty={state.isEmpty}
    >
      {state.data && <UserDetails user={state.data} />}
    </AsyncErrorBoundary>
  );
}
```

## Usage Patterns

### 1. Page-Level Protection
Wrap entire pages to catch critical errors:

```tsx
export default function MyPage() {
  return (
    <PageErrorBoundary pageName="My Page">
      <MyPageContent />
    </PageErrorBoundary>
  );
}
```

### 2. Component-Level Protection
Protect individual components:

```tsx
function Dashboard() {
  return (
    <div>
      <ComponentErrorBoundary componentName="Statistics">
        <StatisticsWidget />
      </ComponentErrorBoundary>
      
      <ComponentErrorBoundary componentName="Charts">
        <ChartsWidget />
      </ComponentErrorBoundary>
    </div>
  );
}
```

### 3. Async Operations
Handle data loading and async errors:

```tsx
function DataTable() {
  const [state, actions] = useAsyncError();

  useEffect(() => {
    actions.execute(() => fetchTableData());
  }, []);

  return (
    <AsyncErrorBoundary
      isLoading={state.isLoading}
      error={state.error}
      onRetry={() => actions.execute(() => fetchTableData())}
      operationName="table data"
    >
      <Table data={state.data} />
    </AsyncErrorBoundary>
  );
}
```

### 4. Nested Error Boundaries
Combine multiple error boundaries for granular control:

```tsx
function ComplexPage() {
  return (
    <PageErrorBoundary pageName="Complex Page">
      <div>
        <ComponentErrorBoundary componentName="Header">
          <Header />
        </ComponentErrorBoundary>
        
        <AsyncErrorBoundary operationName="main content">
          <MainContent />
        </AsyncErrorBoundary>
        
        <ComponentErrorBoundary componentName="Footer">
          <Footer />
        </ComponentErrorBoundary>
      </div>
    </PageErrorBoundary>
  );
}
```

## Error Levels

### High Severity (Page Level)
- Complete page failures
- Critical JavaScript errors
- Navigation-breaking errors

### Medium Severity (Section Level)
- Section/feature failures
- Network/loading errors
- Non-critical functionality issues

### Low Severity (Component Level)
- Individual component failures
- UI rendering issues
- Optional feature failures

## Features

### Automatic Analytics
All errors are automatically tracked and sent to analytics:

```typescript
// Automatic error tracking includes:
{
  errorMessage: string;
  errorStack: string;
  componentStack: string;
  errorId: string;
  level: 'page' | 'section' | 'component';
  componentName: string;
  retryCount: number;
  userAgent: string;
  url: string;
  timestamp: string;
}
```

### Smart Retry Logic
- Exponential backoff for retries
- Maximum retry limits
- Non-retryable error detection
- User-controlled retry options

### Responsive Error UI
- Mobile-optimized error displays
- Contextual error messages
- Actionable error resolution steps
- Professional error aesthetics

### Development Support
- Detailed error information in development
- Stack trace viewing
- Component stack analysis
- Console logging with structured data

## Best Practices

### 1. Use Appropriate Error Boundary Levels
```tsx
// ✅ Good: Page-level for critical pages
<PageErrorBoundary pageName="Checkout">
  <CheckoutProcess />
</PageErrorBoundary>

// ✅ Good: Component-level for widgets
<ComponentErrorBoundary componentName="Weather Widget" minimal={true}>
  <WeatherWidget />
</ComponentErrorBoundary>

// ❌ Avoid: Component-level for entire pages
<ComponentErrorBoundary>
  <EntirePage />
</ComponentErrorBoundary>
```

### 2. Provide Meaningful Names
```tsx
// ✅ Good: Descriptive names
<ComponentErrorBoundary componentName="User Profile Card">
  <UserProfile />
</ComponentErrorBoundary>

// ❌ Avoid: Generic names
<ComponentErrorBoundary componentName="Component">
  <UserProfile />
</ComponentErrorBoundary>
```

### 3. Handle Async Operations Properly
```tsx
// ✅ Good: Use AsyncErrorBoundary for data loading
<AsyncErrorBoundary
  isLoading={loading}
  error={error}
  onRetry={refetch}
  operationName="user dashboard data"
>
  <UserDashboard />
</AsyncErrorBoundary>

// ❌ Avoid: Using regular ErrorBoundary for async errors
<ErrorBoundary>
  <AsyncComponent />
</ErrorBoundary>
```

### 4. Implement Custom Error Handlers
```tsx
// ✅ Good: Custom error handling
<ErrorBoundary
  onError={(error, errorInfo) => {
    // Send to monitoring service
    monitoringService.captureException(error, {
      extra: errorInfo
    });
  }}
>
  <MyComponent />
</ErrorBoundary>
```

## Implementation in HERA Universal

The error boundary system is integrated throughout HERA Universal:

- **Root Layout**: Global error boundary for critical failures
- **Page Components**: Page-level boundaries for major sections
- **Restaurant Management**: Component boundaries for individual features
- **Analytics Dashboard**: Async boundaries for data loading
- **Setup Wizards**: Enhanced error handling for complex workflows

This provides comprehensive error protection while maintaining excellent user experience across the entire application.