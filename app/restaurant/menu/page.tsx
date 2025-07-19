'use client';

import React, { Suspense } from 'react';
import { AppNavbar } from '@/components/ui/AppNavbar';
import { MenuManagementDashboard } from '@/components/restaurant/MenuManagementDashboard';
import { LoadingSkeletons } from '@/components/ui/LoadingSkeletons';

/**
 * Mario's Italian Restaurant - Menu Management Page
 * 
 * GOLD STANDARD TEMPLATE - Following Purchase Orders Design Pattern
 * This page serves as the template for all future HERA UI implementations
 * 
 * Uses HERA's Universal Schema with complete menu management:
 * - Menu Categories (appetizers, mains, desserts, beverages)
 * - Menu Items (individual and composite/combo items)
 * - Combo Meal Calculator (Italian Thali-style)
 * - Menu Analytics & Performance Insights
 */

const MenuManagementPage = () => {
  // Fixed organization ID for demo (in production, get from auth context)
  const organizationId = "123e4567-e89b-12d3-a456-426614174000";

  const handleLogout = () => {
    // In production, implement proper logout
    window.location.href = '/auth/login';
  };

  // Mock user data (in production, get from auth context)
  const user = {
    name: "Mario Rossi",
    email: "mario@mariosrestaurant.com",
    role: "Restaurant Manager",
    avatar: "/avatars/mario.jpg"
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navigation Header - Following Purchase Orders Gold Standard */}
      <AppNavbar user={user} onLogout={handleLogout} />
      
      {/* Main Content - Suspense for Loading States */}
      <Suspense fallback={<LoadingSkeletons type="table" />}>
        <MenuManagementDashboard organizationId={organizationId} />
      </Suspense>
    </div>
  );
};

export default MenuManagementPage;