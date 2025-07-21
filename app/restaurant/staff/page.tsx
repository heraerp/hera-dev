/**
 * HERA Universal - Restaurant Staff Management Page
 * 
 * Next.js 15 App Router Client Component
 * Professional dark/light theme with depth hierarchy
 * Following PO Gold Standard theme pattern
 */

'use client';

import { Suspense } from 'react';
import { StaffDashboard } from '@/components/restaurant/StaffDashboard';
import { LoadingSkeletons } from '@/components/ui/LoadingSkeletons';
import { AppLayoutWithSidebar } from '@/components/layouts/AppLayoutWithSidebar';
import { Users } from 'lucide-react';


export default function RestaurantStaffPage() {
  return (
    <AppLayoutWithSidebar variant="pos">
      {/* Page Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Users className="w-6 h-6 mr-3 text-blue-600" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  Restaurant Staff Management
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Manage your team members and their schedules
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-3 py-1 rounded-full text-sm font-medium">
                System Active
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="px-6 lg:px-8 py-8">
        <Suspense fallback={<LoadingSkeletons type="table" />}>
          <StaffDashboard organizationId="123e4567-e89b-12d3-a456-426614174000" />
        </Suspense>
      </main>
    </AppLayoutWithSidebar>
  );
}