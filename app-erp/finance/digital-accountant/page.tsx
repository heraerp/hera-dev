/**
 * HERA Universal - Digital Accountant Main Page
 * 
 * Next.js 15 App Router Client Component
 * Professional dark/light theme with depth hierarchy
 */

'use client';

import { Suspense } from 'react';
import DigitalAccountantMainDashboard from '@/components/digital-accountant/DigitalAccountantMainDashboard';
import { LoadingSkeletons } from '@/components/ui/LoadingSkeletons';
import { AppNavbar } from '@/components/ui/AppNavbar';
import DynamicSidebar from '@/components/ui/DynamicSidebar';
import CaptureFloatingButton from '@/components/ui/CaptureFloatingButton';

export default function DigitalAccountantPage() {
  const handleLogout = () => {
    // Handle logout logic here
    window.location.href = '/auth/login';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Dynamic Sidebar */}
      <DynamicSidebar />

      {/* Main Content Area */}
      <div className="ml-16 transition-all duration-300">
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
                    Digital Accountant
                  </h1>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    AI-powered document processing and financial automation
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-3 py-1 rounded-full text-sm font-medium">
                    AI Active
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Suspense fallback={<LoadingSkeletons type="dashboard" />}>
            <DigitalAccountantMainDashboard />
          </Suspense>
        </div>
      </div>

      {/* Global Floating Action Button for Receipt Capture */}
      <CaptureFloatingButton 
        position="bottom-right"
        showOnMobile={true}
        showOnDesktop={true}
      />
    </div>
  );
}

