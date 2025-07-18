/**
 * Async Error Boundary
 * Specialized error boundary for handling async operations and data loading errors
 */

"use client";

import React, { ReactNode, useState, useEffect } from 'react';
import ErrorBoundary from './ErrorBoundary';
import { Loader2, AlertTriangle, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';

interface AsyncErrorBoundaryProps {
  children: ReactNode;
  isLoading?: boolean;
  error?: Error | null;
  onRetry?: () => void;
  loadingComponent?: ReactNode;
  emptyComponent?: ReactNode;
  isEmpty?: boolean;
  operationName?: string;
}

function AsyncErrorFallback({ 
  error, 
  onRetry, 
  operationName = 'operation',
  isNetworkError = false
}: { 
  error: Error;
  onRetry?: () => void;
  operationName?: string;
  isNetworkError?: boolean;
}) {
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = async () => {
    if (!onRetry) return;
    
    setIsRetrying(true);
    try {
      await onRetry();
    } finally {
      setIsRetrying(false);
    }
  };

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <div className="p-2 bg-orange-100 rounded-full">
            {isNetworkError ? (
              <WifiOff className="h-5 w-5 text-orange-600" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-orange-600" />
            )}
          </div>
          
          <div className="flex-1 space-y-3">
            <div>
              <h4 className="font-semibold text-orange-900">
                {isNetworkError ? 'Connection Error' : 'Loading Error'}
              </h4>
              <p className="text-orange-800 text-sm mt-1">
                {isNetworkError 
                  ? `Unable to connect to the server while loading ${operationName}.`
                  : `An error occurred while loading ${operationName}.`
                }
              </p>
            </div>

            <Alert className="border-orange-200 bg-orange-50">
              <AlertDescription className="text-orange-800">
                <strong>Error:</strong> {error.message}
              </AlertDescription>
            </Alert>

            {onRetry && (
              <div className="flex space-x-2">
                <Button 
                  size="sm" 
                  onClick={handleRetry}
                  disabled={isRetrying}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  {isRetrying ? (
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  ) : (
                    <RefreshCw className="h-3 w-3 mr-1" />
                  )}
                  {isRetrying ? 'Retrying...' : 'Try Again'}
                </Button>

                {isNetworkError && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => window.location.reload()}
                  >
                    Refresh Page
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function LoadingFallback({ operationName = 'data' }: { operationName?: string }) {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="text-center space-y-3">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
        <p className="text-gray-600">Loading {operationName}...</p>
      </div>
    </div>
  );
}

function EmptyFallback({ operationName = 'data' }: { operationName?: string }) {
  return (
    <div className="text-center p-8 text-gray-500">
      <div className="space-y-2">
        <div className="text-lg font-medium">No {operationName} found</div>
        <p className="text-sm">There's nothing to display at the moment.</p>
      </div>
    </div>
  );
}

export default function AsyncErrorBoundary({
  children,
  isLoading = false,
  error = null,
  onRetry,
  loadingComponent,
  emptyComponent,
  isEmpty = false,
  operationName = 'data'
}: AsyncErrorBoundaryProps) {
  const [networkStatus, setNetworkStatus] = useState<'online' | 'offline'>('online');

  useEffect(() => {
    const handleOnline = () => setNetworkStatus('online');
    const handleOffline = () => setNetworkStatus('offline');

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Handle loading state
  if (isLoading) {
    return loadingComponent || <LoadingFallback operationName={operationName} />;
  }

  // Handle async errors (not caught by React error boundaries)
  if (error) {
    const isNetworkError = error.message.includes('fetch') || 
                          error.message.includes('network') || 
                          error.message.includes('Failed to fetch') ||
                          networkStatus === 'offline';

    return (
      <AsyncErrorFallback 
        error={error}
        onRetry={onRetry}
        operationName={operationName}
        isNetworkError={isNetworkError}
      />
    );
  }

  // Handle empty state
  if (isEmpty) {
    return emptyComponent || <EmptyFallback operationName={operationName} />;
  }

  // Wrap children in error boundary for render errors
  return (
    <ErrorBoundary
      level="section"
      name={`Async ${operationName}`}
      enableRetry={true}
      showDetails={true}
      onError={(renderError, errorInfo) => {
        console.error(`Async render error in ${operationName}:`, {
          error: renderError.message,
          stack: renderError.stack,
          componentStack: errorInfo.componentStack,
          networkStatus,
          timestamp: new Date().toISOString()
        });
      }}
      fallback={
        <AsyncErrorFallback 
          error={new Error(`Render error in ${operationName} component`)}
          onRetry={onRetry}
          operationName={operationName}
        />
      }
    >
      {children}
    </ErrorBoundary>
  );
}