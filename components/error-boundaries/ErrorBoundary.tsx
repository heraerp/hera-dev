/**
 * HERA Universal - Comprehensive Error Boundary System
 * Provides graceful error handling and fallback UI for React components
 */

"use client";

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Bug, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  level?: 'page' | 'section' | 'component';
  name?: string;
  showDetails?: boolean;
  enableRetry?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
  retryCount: number;
  showErrorDetails: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  private retryTimeouts: NodeJS.Timeout[] = [];

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
      retryCount: 0,
      showErrorDetails: false
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Generate unique error ID for tracking
    const errorId = `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      hasError: true,
      error,
      errorId
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error details
    console.error('ErrorBoundary caught an error:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorId: this.state.errorId,
      level: this.props.level || 'component',
      name: this.props.name || 'Unknown'
    });

    // Update state with error info
    this.setState({ errorInfo });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Send error to analytics
    this.sendErrorToAnalytics(error, errorInfo);
  }

  componentWillUnmount() {
    // Clean up any pending retry timeouts
    this.retryTimeouts.forEach(timeout => clearTimeout(timeout));
  }

  private sendErrorToAnalytics = async (error: Error, errorInfo: ErrorInfo) => {
    try {
      // Analytics disabled - skip all error tracking
      console.log('📊 Analytics disabled - skipping error tracking');
      return;

      // Send error to analytics endpoint
      await fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'error_boundary_triggered',
          sessionId: this.getSessionId(),
          properties: {
            errorMessage: error.message,
            errorStack: error.stack,
            componentStack: errorInfo.componentStack,
            errorId: this.state.errorId,
            level: this.props.level || 'component',
            componentName: this.props.name || 'Unknown',
            retryCount: this.state.retryCount,
            userAgent: typeof window !== 'undefined' ? navigator.userAgent : undefined,
            url: typeof window !== 'undefined' ? window.location.href : undefined,
            timestamp: new Date().toISOString()
          }
        })
      });
    } catch (analyticsError) {
      console.warn('Failed to send error to analytics:', analyticsError);
    }
  };

  private getSessionId = (): string => {
    if (typeof window === 'undefined') return 'ssr_session';
    
    let sessionId = sessionStorage.getItem('hera_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('hera_session_id', sessionId);
    }
    return sessionId;
  };

  private handleRetry = () => {
    const { retryCount } = this.state;
    const maxRetries = 3;
    
    if (retryCount >= maxRetries) {
      console.warn('Maximum retry attempts reached');
      return;
    }

    // Exponential backoff for retries
    const retryDelay = Math.min(1000 * Math.pow(2, retryCount), 8000);
    
    const timeout = setTimeout(() => {
      console.log(`Retrying component render (attempt ${retryCount + 1}/${maxRetries})`);
      
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: retryCount + 1,
        showErrorDetails: false
      });
    }, retryDelay);

    this.retryTimeouts.push(timeout);
  };

  private handleRefreshPage = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  private handleGoHome = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  private toggleErrorDetails = () => {
    this.setState(prev => ({ showErrorDetails: !prev.showErrorDetails }));
  };

  private getErrorSeverity = (): 'low' | 'medium' | 'high' => {
    const { level } = this.props;
    const { error } = this.state;

    if (level === 'page') return 'high';
    if (level === 'section') return 'medium';
    
    // Check error type for severity
    if (error?.message.includes('ChunkLoadError') || error?.message.includes('Loading chunk')) {
      return 'medium'; // Network/loading issues
    }
    
    if (error?.name === 'TypeError' || error?.name === 'ReferenceError') {
      return 'high'; // Critical JavaScript errors
    }
    
    return 'low'; // Component-level errors
  };

  private renderErrorFallback = () => {
    const { error, errorInfo, errorId, retryCount, showErrorDetails } = this.state;
    const { level = 'component', name, enableRetry = true, showDetails = true } = this.props;
    const severity = this.getErrorSeverity();
    const maxRetries = 3;

    // Determine fallback size based on level
    const isPageLevel = level === 'page';
    const isSectionLevel = level === 'section';

    const severityColors = {
      low: 'from-yellow-50 to-orange-50 border-yellow-200',
      medium: 'from-orange-50 to-red-50 border-orange-200',
      high: 'from-red-50 to-red-100 border-red-200'
    };

    const severityBadgeColors = {
      low: 'bg-yellow-100 text-yellow-800',
      medium: 'bg-orange-100 text-orange-800',
      high: 'bg-red-100 text-red-800'
    };

    return (
      <div className={`${isPageLevel ? 'min-h-screen flex items-center justify-center p-6' : isSectionLevel ? 'p-6' : 'p-4'}`}>
        <Card className={`max-w-2xl mx-auto bg-gradient-to-br ${severityColors[severity]} shadow-lg`}>
          <CardHeader className="text-center pb-4">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className={`p-3 rounded-full ${severity === 'high' ? 'bg-red-100' : severity === 'medium' ? 'bg-orange-100' : 'bg-yellow-100'}`}>
                <AlertTriangle className={`h-8 w-8 ${severity === 'high' ? 'text-red-600' : severity === 'medium' ? 'text-orange-600' : 'text-yellow-600'}`} />
              </div>
              <div>
                <CardTitle className="text-xl text-gray-900">
                  {isPageLevel ? 'Page Error' : isSectionLevel ? 'Section Error' : 'Component Error'}
                </CardTitle>
                <div className="flex items-center space-x-2 mt-2">
                  <Badge className={severityBadgeColors[severity]}>
                    {severity.toUpperCase()} SEVERITY
                  </Badge>
                  {name && <Badge variant="outline">{name}</Badge>}
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {isPageLevel 
                  ? "This page encountered an unexpected error and couldn't load properly."
                  : isSectionLevel
                  ? "This section encountered an error and is temporarily unavailable."
                  : "This component encountered an error and couldn't render properly."
                }
                {enableRetry && retryCount < maxRetries && " You can try refreshing or the system will automatically retry."}
              </AlertDescription>
            </Alert>

            {/* Error Summary */}
            <div className="bg-white/80 rounded-lg p-4 border border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-2">Error Details</h4>
              <div className="space-y-2 text-sm">
                <div><span className="font-medium">Error ID:</span> <code className="bg-gray-100 px-1 rounded">{errorId}</code></div>
                <div><span className="font-medium">Time:</span> {new Date().toLocaleString()}</div>
                {error && <div><span className="font-medium">Message:</span> {error.message}</div>}
                {retryCount > 0 && <div><span className="font-medium">Retry Attempts:</span> {retryCount}/{maxRetries}</div>}
              </div>
            </div>

            {/* Technical Details (Collapsible) */}
            {showDetails && (error || errorInfo) && (
              <div className="bg-white/80 rounded-lg border border-gray-200">
                <button
                  onClick={this.toggleErrorDetails}
                  className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <span className="font-semibold text-gray-900">Technical Details</span>
                  {showErrorDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
                
                {showErrorDetails && (
                  <div className="px-4 pb-4 space-y-3">
                    {error?.stack && (
                      <div>
                        <h5 className="font-medium text-gray-700 mb-1">Stack Trace:</h5>
                        <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto text-gray-600">
                          {error.stack}
                        </pre>
                      </div>
                    )}
                    
                    {errorInfo?.componentStack && (
                      <div>
                        <h5 className="font-medium text-gray-700 mb-1">Component Stack:</h5>
                        <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto text-gray-600">
                          {errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
              {enableRetry && retryCount < maxRetries && (
                <Button onClick={this.handleRetry} className="flex-1">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
              )}
              
              {isPageLevel ? (
                <>
                  <Button variant="outline" onClick={this.handleRefreshPage} className="flex-1">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh Page
                  </Button>
                  <Button variant="outline" onClick={this.handleGoHome} className="flex-1">
                    <Home className="h-4 w-4 mr-2" />
                    Go Home
                  </Button>
                </>
              ) : (
                <Button variant="outline" onClick={this.handleRefreshPage} className="flex-1">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Page
                </Button>
              )}
            </div>

            {/* Support Information */}
            <div className="text-center text-sm text-gray-600 pt-4 border-t border-gray-200">
              <p>If this problem persists, please contact support with Error ID: <code className="bg-gray-100 px-1 rounded">{errorId}</code></p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided, otherwise use default
      return this.props.fallback || this.renderErrorFallback();
    }

    return this.props.children;
  }
}

export default ErrorBoundary;