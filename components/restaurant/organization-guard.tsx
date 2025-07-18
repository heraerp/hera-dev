"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useRestaurantManagement } from '@/hooks/useRestaurantManagement';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Building2, 
  AlertTriangle, 
  Loader2, 
  Plus,
  ArrowRight,
  Settings
} from 'lucide-react';
import Link from 'next/link';

interface OrganizationGuardProps {
  children: React.ReactNode;
  requiredRole?: 'owner' | 'admin' | 'manager' | 'staff';
  fallbackComponent?: React.ReactNode;
}

/**
 * OrganizationGuard - Ensures user has access to restaurant organization
 * 
 * This component:
 * 1. Checks if user is authenticated
 * 2. Verifies user has an organization (restaurant) 
 * 3. Validates user's role in the organization
 * 4. Redirects to setup if no organization found
 * 5. Shows loading states and error handling
 */
export function OrganizationGuard({ 
  children, 
  requiredRole = 'staff',
  fallbackComponent 
}: OrganizationGuardProps) {
  const router = useRouter();
  const { restaurantData, loading, error, user } = useRestaurantManagement();

  useEffect(() => {
    // If not loading and no user, redirect to restaurant signin
    if (!loading && !user) {
      router.push('/restaurant/signin');
      return;
    }

    // If user exists but no restaurant data, redirect to setup
    if (!loading && user && !restaurantData) {
      router.push('/setup/restaurant');
      return;
    }
  }, [loading, user, restaurantData, router]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-green-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Loading Restaurant...
            </h3>
            <p className="text-gray-600">
              Verifying your restaurant access and organization permissions
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-green-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="w-8 h-8 mx-auto mb-4 text-red-600" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Access Error
            </h3>
            <p className="text-gray-600 mb-4">
              {error}
            </p>
            <div className="space-y-2">
              <Button 
                onClick={() => router.push('/setup/restaurant')}
                className="w-full"
              >
                <Settings className="w-4 h-4 mr-2" />
                Setup Restaurant
              </Button>
              <Button 
                variant="outline"
                onClick={() => router.push('/dashboard')}
                className="w-full"
              >
                Go to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // No user - will redirect via useEffect
  if (!user) {
    return null;
  }

  // No restaurant data - show setup prompt
  if (!restaurantData) {
    return fallbackComponent || (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-green-50 flex items-center justify-center">
        <Card className="w-full max-w-lg">
          <CardContent className="p-8 text-center">
            <Building2 className="w-12 h-12 mx-auto mb-4 text-blue-600" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Restaurant Found
            </h3>
            <p className="text-gray-600 mb-6">
              You need to set up a restaurant organization to access restaurant features. 
              This ensures your data is properly isolated and secure.
            </p>
            
            <Alert className="mb-6 text-left">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Multi-Tenant Architecture:</strong> Each user can belong to multiple organizations. 
                You need to set up or be invited to a restaurant organization to access restaurant pages.
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              <Button 
                onClick={() => router.push('/setup/restaurant')}
                className="w-full"
                size="lg"
              >
                <Plus className="w-4 h-4 mr-2" />
                Set Up Restaurant
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => router.push('/dashboard')}
                className="w-full"
              >
                <ArrowRight className="w-4 h-4 mr-2" />
                Go to Main Dashboard
              </Button>
            </div>
            
            <div className="mt-6 pt-6 border-t">
              <p className="text-sm text-gray-500">
                Need help? Check our{' '}
                <Link href="/docs" className="text-blue-600 hover:underline">
                  setup guide
                </Link>
                {' '}or{' '}
                <Link href="/support" className="text-blue-600 hover:underline">
                  contact support
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check role permissions
  if (requiredRole !== 'staff') {
    const userRole = restaurantData.userRole;
    const roleHierarchy = ['staff', 'manager', 'admin', 'owner'];
    const userRoleLevel = roleHierarchy.indexOf(userRole);
    const requiredRoleLevel = roleHierarchy.indexOf(requiredRole);
    
    console.log('🔐 OrganizationGuard Role Check:', {
      requiredRole,
      userRole,
      userRoleLevel,
      requiredRoleLevel,
      hasPermission: userRoleLevel >= requiredRoleLevel
    });
    
    if (userRoleLevel < requiredRoleLevel) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-green-50 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardContent className="p-8 text-center">
              <AlertTriangle className="w-8 h-8 mx-auto mb-4 text-orange-600" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Insufficient Permissions
              </h3>
              <p className="text-gray-600 mb-4">
                You need {requiredRole} level access to view this page. 
                Your current role: {userRole}
              </p>
              <Button 
                variant="outline"
                onClick={() => router.push('/restaurant/dashboard')}
                className="w-full"
              >
                Back to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }
  }

  // All checks passed - render children
  console.log('✅ OrganizationGuard: All checks passed, rendering children');
  return (
    <>
      {children}
    </>
  );
}

/**
 * Hook to get current organization context
 * Use this in pages that need organization info
 */
export function useOrganizationContext() {
  const { restaurantData, loading, error } = useRestaurantManagement();
  
  return {
    organizationId: restaurantData?.organizationId || null,
    organizationName: restaurantData?.name || null,
    userRole: restaurantData?.userRole || null,
    loading,
    error,
    hasAccess: !!restaurantData?.organizationId
  };
}

export default OrganizationGuard;