/**
 * HERA Universal Error Boundaries
 * Comprehensive error handling system for React components
 */

export { default as ErrorBoundary } from './ErrorBoundary';
export { default as PageErrorBoundary } from './PageErrorBoundary';
export { default as ComponentErrorBoundary } from './ComponentErrorBoundary';
export { default as AsyncErrorBoundary } from './AsyncErrorBoundary';

export { 
  useAsyncError, 
  useMultipleAsyncError, 
  throwAsyncError, 
  withAsyncError 
} from './useAsyncError';

// Re-export for convenience
export type {
  // Add any types you want to export here
} from './useAsyncError';