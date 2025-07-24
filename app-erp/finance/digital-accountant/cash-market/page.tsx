/**
 * HERA Universal - Cash Market Management Page
 * 
 * Next.js 15 App Router Client Component
 * Professional dark/light theme with depth hierarchy
 */

'use client';

import { Suspense } from 'react';
import MobileReceiptCapture from '@/components/digital-accountant/MobileReceiptCapture';
import PettyCashDashboard from '@/components/digital-accountant/PettyCashDashboard';
import MarketVendorManager from '@/components/digital-accountant/MarketVendorManager';
import BulkReceiptProcessor from '@/components/digital-accountant/BulkReceiptProcessor';
import { LoadingSkeletons } from '@/components/ui/LoadingSkeletons';
import { AppNavbar } from '@/components/ui/AppNavbar';
import DynamicSidebar from '@/components/ui/DynamicSidebar';
import { OrganizationProvider, useOrganization } from '@/contexts/OrganizationContext';

function CashMarketContent() {
  const { user, organization, logout, isAuthenticated, loading } = useOrganization();

  const handleLogout = () => {
    logout();
    // In production, redirect to login page
    window.location.href = '/auth/login';
  };

  const handleReceiptCaptured = (receipt: any) => {
    console.log('Receipt captured:', receipt)
    // In real app, this would send to the processing pipeline
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Authentication Required</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">Please log in to access the cash market system.</p>
          <button
            onClick={() => window.location.href = '/auth/login'}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            Go to Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Dynamic Sidebar */}
      <DynamicSidebar />

      {/* Main Content Area */}
      <div className="ml-16 transition-all duration-300">
        {/* Navigation Bar */}
        <AppNavbar 
          user={{
            name: user?.name || 'Unknown User',
            email: user?.email || 'unknown@example.com',
            role: user?.role || 'User'
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
                    Cash Market Management
                  </h1>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {organization?.name} - Handle cash purchases from fish markets, meat vendors, produce stands, and other suppliers
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-3 py-1 rounded-full text-sm font-medium">
                    Mobile Ready
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Suspense fallback={<LoadingSkeletons type="dashboard" />}>
          <div className="space-y-6">
      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mobile Receipt Capture */}
        <MobileReceiptCapture 
          onReceiptCaptured={handleReceiptCaptured}
          className="h-fit"
        />
        
        {/* Petty Cash Overview */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 transition-colors duration-200">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Quick Cash Overview
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 transition-colors duration-200">
              <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Current Balance</p>
              <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">$847.25</p>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 transition-colors duration-200">
              <p className="text-sm font-medium text-red-600 dark:text-red-400">Today's Expenses</p>
              <p className="text-2xl font-bold text-red-900 dark:text-red-100">$287.50</p>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 transition-colors duration-200">
              <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400">Pending Review</p>
              <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">$89.45</p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 transition-colors duration-200">
              <p className="text-sm font-medium text-green-600 dark:text-green-400">AI Confidence</p>
              <p className="text-2xl font-bold text-green-900 dark:text-green-100">91%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Processing Section */}
      <BulkReceiptProcessor />

      {/* Detailed Management Sections */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Petty Cash Dashboard */}
        <PettyCashDashboard />
        
        {/* Market Vendor Management */}
        <MarketVendorManager />
      </div>

        {/* Business Intelligence Insights */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 transition-colors duration-200">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Market Purchase Insights
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white">
              <h4 className="font-medium mb-2">Today's Top Vendor</h4>
              <p className="text-lg font-bold">Fresh Fish Market</p>
              <p className="text-sm opacity-90">3 transactions • $145.80</p>
            </div>
            
            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 text-white">
              <h4 className="font-medium mb-2">Best Price Category</h4>
              <p className="text-lg font-bold">Organic Produce</p>
              <p className="text-sm opacity-90">15% below market average</p>
            </div>
            
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-4 text-white">
              <h4 className="font-medium mb-2">AI Processing Rate</h4>
              <p className="text-lg font-bold">94% Automated</p>
              <p className="text-sm opacity-90">Only 6% need manual review</p>
            </div>
          </div>
        </div>

        {/* Recent Activity Feed */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 transition-colors duration-200">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Recent Market Activity
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg transition-colors duration-200">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">Fresh Fish Market</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Red Snapper, Salmon • $145.80</p>
                </div>
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">2 minutes ago</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg transition-colors duration-200">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">Koopa Meat Co.</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Prime Ribeye • $89.45 • Needs Review</p>
                </div>
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">15 minutes ago</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg transition-colors duration-200">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">Yoshi Produce Farm</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Organic vegetables, herbs • $67.20</p>
                </div>
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">1 hour ago</span>
            </div>
          </div>
        </div>
          </div>
        </Suspense>
        </div>
      </div>
    </div>
  )
}

export default function CashMarketPage() {
  return (
    <OrganizationProvider>
      <CashMarketContent />
    </OrganizationProvider>
  )
}