/**
 * Auth Debugger Component
 * Helps debug authentication issues
 */

"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useRestaurantManagement } from '@/hooks/useRestaurantManagement';
import { createClient } from '@/lib/supabase/client';
import { 
  User, 
  Shield, 
  Database, 
  Building2, 
  CheckCircle, 
  AlertTriangle,
  Info
} from 'lucide-react';

export default function AuthDebugger() {
  const [authState, setAuthState] = useState<any>(null);
  const [debugInfo, setDebugInfo] = useState<any>({});
  const { restaurantData, loading, error, user } = useRestaurantManagement();
  
  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      const supabase = createClient();
      
      // Check auth state
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
      
      setAuthState({
        user: authUser,
        error: authError
      });
      
      // Check localStorage
      const supabaseUrl = typeof window !== 'undefined' ? window.location.origin : '';
      const projectId = supabaseUrl.includes('localhost') ? 'localhost' : 'default';
      const authTokens = localStorage.getItem('sb-' + projectId + '-auth-token');
      const restaurantPreference = localStorage.getItem('selectedRestaurant');
      
      setDebugInfo({
        hasAuthTokens: !!authTokens,
        hasRestaurantPreference: !!restaurantPreference,
        currentPath: window.location.pathname,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Debug check failed:', error);
    }
  };

  const getStatusIcon = (condition: boolean) => {
    return condition ? (
      <CheckCircle className="w-4 h-4 text-green-600" />
    ) : (
      <AlertTriangle className="w-4 h-4 text-red-600" />
    );
  };

  const getStatusColor = (condition: boolean) => {
    return condition ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800";
  };

  return (
    <Card className="w-full max-w-4xl mx-auto mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Authentication Debug Panel
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Auth State */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <User className="w-4 h-4" />
                Auth State
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Supabase Auth User</span>
                <Badge className={getStatusColor(!!authState?.user)}>
                  {authState?.user ? 'Present' : 'Missing'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Hook User</span>
                <Badge className={getStatusColor(!!user)}>
                  {user ? 'Present' : 'Missing'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Auth Tokens</span>
                <Badge className={getStatusColor(debugInfo.hasAuthTokens)}>
                  {debugInfo.hasAuthTokens ? 'Present' : 'Missing'}
                </Badge>
              </div>
              {authState?.user && (
                <div className="text-xs text-gray-600 mt-2">
                  <p>Email: {authState.user.email}</p>
                  <p>ID: {authState.user.id}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Restaurant Data
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Restaurant Data</span>
                <Badge className={getStatusColor(!!restaurantData)}>
                  {restaurantData ? 'Present' : 'Missing'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Loading State</span>
                <Badge className={loading ? "bg-yellow-100 text-yellow-800" : "bg-gray-100 text-gray-800"}>
                  {loading ? 'Loading' : 'Idle'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Error State</span>
                <Badge className={getStatusColor(!error)}>
                  {error ? 'Error' : 'OK'}
                </Badge>
              </div>
              {restaurantData && (
                <div className="text-xs text-gray-600 mt-2">
                  <p>Name: {restaurantData.businessName}</p>
                  <p>ID: {restaurantData.organizationId}</p>
                  <p>Role: {restaurantData.userRole || 'No role found'}</p>
                </div>
              )}
              {error && (
                <div className="text-xs text-red-600 mt-2">
                  <p>Error: {error}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Debug Actions */}
        <div className="flex items-center gap-2 pt-4 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={checkAuthState}
          >
            Refresh Debug Info
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.reload()}
          >
            Reload Page
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.href = '/restaurant/signin'}
          >
            Go to Sign In
          </Button>
        </div>

        {/* Debug Info */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
            <Info className="w-4 h-4" />
            Debug Information
          </h4>
          <div className="text-xs text-gray-600 space-y-1">
            <p>Current Path: {debugInfo.currentPath}</p>
            <p>Last Updated: {debugInfo.timestamp}</p>
            <p>Has Restaurant Preference: {debugInfo.hasRestaurantPreference ? 'Yes' : 'No'}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}