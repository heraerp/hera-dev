/**
 * Page-Level Error Boundary
 * Specialized error boundary for full page errors with enhanced fallback UI
 */

"use client";

import React, { ReactNode } from 'react';
import ErrorBoundary from './ErrorBoundary';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface PageErrorBoundaryProps {
  children: ReactNode;
  pageName?: string;
  fallbackComponent?: ReactNode;
}

function PageErrorFallback({ pageName }: { pageName?: string }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-6">
      <Card className="max-w-2xl mx-auto bg-white shadow-xl border-0">
        <CardHeader className="text-center pb-6">
          <div className="flex items-center justify-center mb-6">
            <div className="p-4 bg-red-100 rounded-full">
              <AlertTriangle className="h-12 w-12 text-red-600" />
            </div>
          </div>
          <CardTitle className="text-3xl text-gray-900 mb-2">
            Oops! Something went wrong
          </CardTitle>
          <p className="text-gray-600 text-lg">
            {pageName ? `The ${pageName} page` : 'This page'} encountered an unexpected error and couldn't load properly.
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">What happened?</h4>
            <p className="text-blue-800 text-sm">
              A technical error occurred while loading this page. Our team has been automatically notified
              and is working to resolve the issue.
            </p>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-semibold text-green-900 mb-2">What can you do?</h4>
            <ul className="text-green-800 text-sm space-y-1">
              <li>• Try refreshing the page</li>
              <li>• Check your internet connection</li>
              <li>• Return to the home page and try again</li>
              <li>• Contact support if the problem persists</li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
            <Button 
              onClick={() => window.location.reload()} 
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Page
            </Button>
            <Button 
              variant="outline" 
              onClick={() => window.location.href = '/'}
              className="flex-1"
            >
              <Home className="h-4 w-4 mr-2" />
              Go to Home
            </Button>
          </div>

          <div className="text-center text-sm text-gray-500 pt-4 border-t border-gray-200">
            <p>
              Need help? Contact support at{' '}
              <a href="mailto:support@hera-universal.com" className="text-blue-600 hover:underline">
                support@hera-universal.com
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function PageErrorBoundary({ 
  children, 
  pageName, 
  fallbackComponent 
}: PageErrorBoundaryProps) {
  return (
    <ErrorBoundary
      level="page"
      name={pageName || 'Page'}
      enableRetry={true}
      showDetails={true}
      fallback={fallbackComponent || <PageErrorFallback pageName={pageName} />}
      onError={(error, errorInfo) => {
        // Enhanced logging for page-level errors
        console.error(`Page Error in ${pageName || 'Unknown Page'}:`, {
          error: error.message,
          stack: error.stack,
          componentStack: errorInfo.componentStack,
          url: typeof window !== 'undefined' ? window.location.href : undefined,
          userAgent: typeof window !== 'undefined' ? navigator.userAgent : undefined,
          timestamp: new Date().toISOString()
        });

        // Send critical page error to monitoring service
        if (typeof window !== 'undefined' && window.gtag) {
          window.gtag('event', 'exception', {
            description: `Page Error: ${error.message}`,
            fatal: true,
            page_title: pageName
          });
        }
      }}
    >
      {children}
    </ErrorBoundary>
  );
}