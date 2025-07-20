"use client";

import React from 'react';
import { Suspense } from 'react';
import { PageErrorBoundary, ComponentErrorBoundary } from '@/components/error-boundaries';
import { OrganizationGuard, useOrganizationContext } from '@/components/restaurant/organization-guard';
import { GoodsReceivingDashboard } from '@/components/receiving/GoodsReceivingDashboard';
import { LoadingSkeletons } from '@/components/ui/LoadingSkeletons';
import { Navbar } from '@/components/ui/navbar';

function GoodsReceivingPageContent() {
  const { organizationId } = useOrganizationContext();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Navigation Bar */}
      <Navbar />
      
      {/* Page Header - Matching Purchase Order Pattern */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  Goods Receiving
                </h1>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Manage goods receipts and supplier quality analytics
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-3 py-1 rounded-full text-sm font-medium">
                  System Active
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Matching Purchase Order Pattern */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Suspense fallback={<LoadingSkeletons type="purchaseOrders" />}>
          <GoodsReceivingDashboard organizationId={organizationId!} />
        </Suspense>
      </div>
    </div>
  );
}

function GoodsReceivingPageWithGuard() {
  return (
    <OrganizationGuard>
      <GoodsReceivingPageContent />
    </OrganizationGuard>
  );
}

function GoodsReceivingPageWithErrorBoundary() {
  return (
    <PageErrorBoundary pageName="Goods Receiving">
      <ComponentErrorBoundary componentName="Goods Receiving Dashboard">
        <GoodsReceivingPageWithGuard />
      </ComponentErrorBoundary>
    </PageErrorBoundary>
  );
}

export default GoodsReceivingPageWithErrorBoundary;