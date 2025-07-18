'use client';

import React, { ReactNode } from 'react';
import { useRestaurantAuth } from '@/hooks/useRestaurantAuth';
import { RestaurantRole } from '@/types/restaurant-auth';
import { Lock, AlertTriangle, UserX } from 'lucide-react';
import { Card } from '@/components/ui/revolutionary-card';
import { Button } from '@/components/ui/revolutionary-button';

interface PermissionGuardProps {
  children: ReactNode;
  permission?: string;
  role?: RestaurantRole;
  roles?: RestaurantRole[];
  permissions?: string[];
  requireAll?: boolean; // For multiple permissions/roles
  fallback?: ReactNode;
  showFallback?: boolean;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  permission,
  role,
  roles,
  permissions,
  requireAll = false,
  fallback,
  showFallback = true
}) => {
  const { hasPermission, hasRole, staff, isAuthenticated, isLoading } = useRestaurantAuth();

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 border-2 border-slate-300 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated || !staff) {
    if (!showFallback) return null;
    
    return fallback || (
      <Card className="p-6 text-center bg-red-50 border-red-200">
        <UserX className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-red-800 mb-2">Authentication Required</h3>
        <p className="text-red-600 mb-4">You must be logged in to access this feature.</p>
        <Button 
          onClick={() => window.location.href = '/restaurant/login'}
          className="bg-red-600 hover:bg-red-700 text-white"
        >
          Go to Login
        </Button>
      </Card>
    );
  }

  // Check single permission
  if (permission && !hasPermission(permission)) {
    if (!showFallback) return null;
    
    return fallback || (
      <Card className="p-6 text-center bg-yellow-50 border-yellow-200">
        <Lock className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">Access Restricted</h3>
        <p className="text-yellow-600 mb-2">
          You don't have permission to access this feature.
        </p>
        <p className="text-sm text-yellow-500">
          Required permission: <code className="bg-yellow-100 px-1 rounded">{permission}</code>
        </p>
        <p className="text-sm text-yellow-500 mt-2">
          Your role: <span className="font-semibold capitalize">{staff.role}</span>
        </p>
      </Card>
    );
  }

  // Check multiple permissions
  if (permissions && permissions.length > 0) {
    const hasAccess = requireAll
      ? permissions.every(p => hasPermission(p))
      : permissions.some(p => hasPermission(p));

    if (!hasAccess) {
      if (!showFallback) return null;
      
      return fallback || (
        <Card className="p-6 text-center bg-yellow-50 border-yellow-200">
          <Lock className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">Access Restricted</h3>
          <p className="text-yellow-600 mb-2">
            You don't have the required permissions to access this feature.
          </p>
          <div className="text-sm text-yellow-500">
            <p className="mb-1">
              Required permissions ({requireAll ? 'all' : 'any'}):
            </p>
            <ul className="list-disc list-inside">
              {permissions.map(p => (
                <li key={p}>
                  <code className="bg-yellow-100 px-1 rounded">{p}</code>
                  {hasPermission(p) && <span className="text-green-600 ml-1">✓</span>}
                </li>
              ))}
            </ul>
          </div>
        </Card>
      );
    }
  }

  // Check single role
  if (role && !hasRole(role)) {
    if (!showFallback) return null;
    
    return fallback || (
      <Card className="p-6 text-center bg-orange-50 border-orange-200">
        <AlertTriangle className="w-12 h-12 text-orange-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-orange-800 mb-2">Role Required</h3>
        <p className="text-orange-600 mb-2">
          This feature is only available to specific roles.
        </p>
        <p className="text-sm text-orange-500">
          Required role: <span className="font-semibold capitalize">{role}</span>
        </p>
        <p className="text-sm text-orange-500">
          Your role: <span className="font-semibold capitalize">{staff.role}</span>
        </p>
      </Card>
    );
  }

  // Check multiple roles
  if (roles && roles.length > 0) {
    const hasAccess = requireAll
      ? roles.every(r => hasRole(r))
      : roles.some(r => hasRole(r));

    if (!hasAccess) {
      if (!showFallback) return null;
      
      return fallback || (
        <Card className="p-6 text-center bg-orange-50 border-orange-200">
          <AlertTriangle className="w-12 h-12 text-orange-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-orange-800 mb-2">Role Required</h3>
          <p className="text-orange-600 mb-2">
            This feature is only available to specific roles.
          </p>
          <div className="text-sm text-orange-500">
            <p className="mb-1">
              Required roles ({requireAll ? 'all' : 'any'}):
            </p>
            <p className="font-semibold">
              {roles.map(r => r.charAt(0).toUpperCase() + r.slice(1)).join(', ')}
            </p>
            <p className="mt-1">
              Your role: <span className="font-semibold capitalize">{staff.role}</span>
            </p>
          </div>
        </Card>
      );
    }
  }

  // All checks passed, render children
  return <>{children}</>;
};

// Convenience components for common use cases
export const AdminOnly: React.FC<{ children: ReactNode; fallback?: ReactNode }> = ({ 
  children, 
  fallback 
}) => (
  <PermissionGuard role="admin" fallback={fallback}>
    {children}
  </PermissionGuard>
);

export const ManagerOrAdmin: React.FC<{ children: ReactNode; fallback?: ReactNode }> = ({ 
  children, 
  fallback 
}) => (
  <PermissionGuard roles={['admin', 'manager']} fallback={fallback}>
    {children}
  </PermissionGuard>
);

export const ChefHatStaff: React.FC<{ children: ReactNode; fallback?: ReactNode }> = ({ 
  children, 
  fallback 
}) => (
  <PermissionGuard roles={['admin', 'manager', 'chef']} fallback={fallback}>
    {children}
  </PermissionGuard>
);

export const POSAccess: React.FC<{ children: ReactNode; fallback?: ReactNode }> = ({ 
  children, 
  fallback 
}) => (
  <PermissionGuard 
    permissions={['orders.create', 'payments.process']} 
    fallback={fallback}
  >
    {children}
  </PermissionGuard>
);

// Hook for conditional rendering
export const usePermissionCheck = () => {
  const { hasPermission, hasRole } = useRestaurantAuth();

  return {
    hasPermission,
    hasRole,
    canCreateOrders: hasPermission('orders.create'),
    canProcessPayments: hasPermission('payments.process'),
    canAccessChefHat: hasPermission('kitchen.view'),
    canManageStaff: hasPermission('staff.manage'),
    canViewReports: hasPermission('reports.view'),
    canManageInventory: hasPermission('inventory.update'),
    isAdmin: hasRole('admin'),
    isManager: hasRole('manager'),
    isChefHatStaff: hasRole('chef'),
    isCashier: hasRole('cashier')
  };
};