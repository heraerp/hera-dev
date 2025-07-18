/**
 * Error Boundary Provider
 * Global error boundary setup for the entire application
 */

"use client";

import React, { ReactNode } from 'react';
import ErrorBoundary from './ErrorBoundary';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ErrorBoundaryProviderProps {
  children: ReactNode;
}

function GlobalErrorFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-6">
      <Card className="max-w-lg mx-auto bg-white shadow-2xl border-0">
        <CardHeader className="text-center pb-6">
          <div className="flex items-center justify-center mb-6">
            <div className="p-4 bg-red-100 rounded-full">
              <AlertTriangle className="h-16 w-16 text-red-600" />
            </div>
          </div>
          <CardTitle className="text-2xl text-gray-900 mb-2">
            Application Error
          </CardTitle>
          <p className="text-gray-600">
            HERA Universal encountered a critical error and needs to restart.
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h4 className="font-semibold text-red-900 mb-2">What happened?</h4>
            <p className="text-red-800 text-sm">
              A critical system error occurred that prevented the application from functioning properly.
              Our development team has been automatically notified.
            </p>
          </div>

          <div className="flex flex-col space-y-3">
            <Button 
              onClick={() => window.location.reload()} 
              className="w-full bg-red-600 hover:bg-red-700"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Restart Application
            </Button>
            <Button 
              variant="outline" 
              onClick={() => window.location.href = '/'}
              className="w-full"
            >
              <Home className="h-4 w-4 mr-2" />
              Go to Home Page
            </Button>
          </div>

          <div className="text-center text-sm text-gray-500 pt-4 border-t border-gray-200">
            <p>
              If this problem persists, please contact support at{' '}
              <a href="mailto:support@hera-universal.com" className="text-red-600 hover:underline">
                support@hera-universal.com
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ErrorBoundaryProvider({ children }: ErrorBoundaryProviderProps) {
  return (
    <ErrorBoundary
      level="page"
      name="Application Root"
      enableRetry={false}
      showDetails={true}
      fallback={<GlobalErrorFallback />}
      onError={(error, errorInfo) => {
        // Critical application error logging
        console.error('CRITICAL APPLICATION ERROR:', {
          error: error.message,
          stack: error.stack,
          componentStack: errorInfo.componentStack,
          url: typeof window !== 'undefined' ? window.location.href : undefined,
          userAgent: typeof window !== 'undefined' ? navigator.userAgent : undefined,
          timestamp: new Date().toISOString(),
          buildVersion: process.env.NEXT_PUBLIC_APP_VERSION || 'unknown'
        });

        // Send critical error to monitoring services
        if (typeof window !== 'undefined') {
          // Google Analytics
          if (window.gtag) {
            window.gtag('event', 'exception', {
              description: `Critical App Error: ${error.message}`,
              fatal: true
            });
          }

          // Analytics disabled - skip all error tracking
          console.log('📊 Analytics disabled - skipping error tracking');
          return;

          // Send to error tracking service
          fetch('/api/analytics/track', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              event: 'critical_application_error',
              sessionId: sessionStorage.getItem('hera_session_id') || 'unknown',
              properties: {
                errorMessage: error.message,
                errorStack: error.stack,
                componentStack: errorInfo.componentStack,
                url: window.location.href,
                userAgent: navigator.userAgent,
                timestamp: new Date().toISOString(),
                level: 'critical'
              }
            })
          }).catch(analyticsError => {
            console.warn('Failed to send critical error to analytics:', analyticsError);
          });
        }
      }}
    >
      {children}
    </ErrorBoundary>
  );
}