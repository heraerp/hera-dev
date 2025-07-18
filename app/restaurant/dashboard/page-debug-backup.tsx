"use client";

import React, { useState, useEffect } from 'react';
// Test basic imports first
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// Test if these hooks are causing the issue
import { useRestaurantManagement } from '@/hooks/useRestaurantManagement';
import { useUniversalAnalytics } from '@/hooks/useUniversalAnalytics';

const DebugDashboard = () => {
  console.log('🚀 Dashboard component starting...');
  
  // Test restaurant management hook
  const { 
    restaurantData, 
    loading: restaurantLoading, 
    error: restaurantError 
  } = useRestaurantManagement();
  
  console.log('📊 Restaurant data:', { restaurantData, restaurantLoading, restaurantError });
  
  const organizationId = restaurantData?.organizationId;
  console.log('🏢 Organization ID:', organizationId);

  // Test analytics hook with organization ID
  const {
    metrics,
    loading: analyticsLoading,
    error: analyticsError
  } = useUniversalAnalytics(organizationId || '', {
    autoRefresh: false, // Disable auto-refresh for debugging
    enableRealTime: false // Disable real-time for debugging
  });
  
  console.log('📈 Analytics data:', { metrics, analyticsLoading, analyticsError });

  if (restaurantLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Loading Restaurant Data...</h1>
          <p>Debug: Restaurant management hook is loading</p>
        </div>
      </div>
    );
  }

  if (restaurantError) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Restaurant Error</h1>
          <p>Error: {restaurantError}</p>
        </div>
      </div>
    );
  }

  if (!restaurantData) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">No Restaurant Found</h1>
          <p>Debug: No restaurant data available</p>
          <Button onClick={() => window.location.href = '/setup/restaurant'} className="mt-4">
            Setup Restaurant
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Debug Dashboard - {restaurantData.businessName}
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Restaurant Data</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-sm bg-gray-100 p-4 rounded overflow-auto">
                {JSON.stringify(restaurantData, null, 2)}
              </pre>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Analytics Data</CardTitle>
            </CardHeader>
            <CardContent>
              <p><strong>Loading:</strong> {analyticsLoading ? 'Yes' : 'No'}</p>
              <p><strong>Error:</strong> {analyticsError || 'None'}</p>
              <p><strong>Metrics:</strong> {metrics ? 'Loaded' : 'None'}</p>
              {metrics && (
                <pre className="text-sm bg-gray-100 p-4 rounded overflow-auto mt-2">
                  {JSON.stringify(metrics, null, 2)}
                </pre>
              )}
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Console Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Check browser console (F12) for detailed logs about hook execution.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DebugDashboard;