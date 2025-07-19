/**
 * HERA Universal - Inventory Management Page
 * 
 * Next.js 15 App Router Client Component
 * Professional dark/light theme with depth hierarchy
 */

'use client';

import { Suspense } from 'react';
import { InventoryDashboard } from '@/components/inventory/InventoryDashboard';
import { LoadingSkeletons } from '@/components/ui/LoadingSkeletons';
import { AppNavbar } from '@/components/ui/AppNavbar';

export default function InventoryItemsPage() {
  const handleLogout = () => {
    // Handle logout logic here
    window.location.href = '/auth/login';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Navigation Bar */}
      <AppNavbar 
        user={{
          name: "Mario Rossi",
          email: "mario@mariosrestaurant.com",
          role: "Restaurant Manager"
        }}
        onLogout={handleLogout}
      />

      {/* Page Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  Inventory Management
                </h1>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Track stock levels, manage alerts, and analyze usage patterns
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-3 py-1 rounded-full text-sm font-medium">
                  Real-time Tracking
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Suspense fallback={<LoadingSkeletons type="inventory" />}>
          <InventoryDashboard organizationId="123e4567-e89b-12d3-a456-426614174000" />
        </Suspense>
      </div>
    </div>
  );
}