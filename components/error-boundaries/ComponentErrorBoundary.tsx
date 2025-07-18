/**
 * Component-Level Error Boundary
 * Lightweight error boundary for individual components with minimal fallback UI
 */

"use client";

import React, { ReactNode } from 'react';
import ErrorBoundary from './ErrorBoundary';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ComponentErrorBoundaryProps {
  children: ReactNode;
  componentName?: string;
  fallback?: ReactNode;
  minimal?: boolean;
  onError?: (error: Error) => void;
}

function ComponentErrorFallback({ 
  componentName, 
  minimal = false 
}: { 
  componentName?: string; 
  minimal?: boolean;
}) {
  if (minimal) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-center space-x-2 text-red-800">
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm font-medium">
            {componentName ? `${componentName} unavailable` : 'Component error'}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {componentName ? `The ${componentName} component` : 'This component'} 
          encountered an error and couldn't load properly.
        </AlertDescription>
      </Alert>
      
      <div className="mt-4 flex space-x-2">
        <Button 
          size="sm" 
          variant="outline" 
          onClick={() => window.location.reload()}
        >
          <RefreshCw className="h-3 w-3 mr-1" />
          Retry
        </Button>
      </div>
    </div>
  );
}

export default function ComponentErrorBoundary({ 
  children, 
  componentName, 
  fallback,
  minimal = false,
  onError 
}: ComponentErrorBoundaryProps) {
  return (
    <ErrorBoundary
      level="component"
      name={componentName || 'Component'}
      enableRetry={true}
      showDetails={false}
      fallback={fallback || <ComponentErrorFallback componentName={componentName} minimal={minimal} />}
      onError={(error, errorInfo) => {
        // Component-level error logging
        console.warn(`Component Error in ${componentName || 'Unknown Component'}:`, {
          error: error.message,
          componentStack: errorInfo.componentStack,
          timestamp: new Date().toISOString()
        });

        // Call custom error handler if provided
        if (onError) {
          onError(error);
        }
      }}
    >
      {children}
    </ErrorBoundary>
  );
}