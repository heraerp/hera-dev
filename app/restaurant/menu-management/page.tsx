/**
 * Menu Management Page - Toyota Production System Implementation
 * Complete menu management with categories, items, modifiers, and pricing
 */

"use client";

import React from 'react';
import { Navbar } from '@/components/ui/navbar';
import { OrganizationGuard, useOrganizationContext } from '@/components/restaurant/organization-guard';
import MenuManagementDashboard from '@/components/restaurant/menu-management/MenuManagementDashboard';

function MenuManagementContent() {
  const { organizationId } = useOrganizationContext();

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
      {/* Navigation Bar with User Info */}
      <Navbar />
      
      {/* Main Content */}
      <div className="container mx-auto p-6">
        <MenuManagementDashboard organizationId={organizationId} />
      </div>
    </div>
  );
}

// Main component with organization access control
export default function MenuManagementPage() {
  return (
    <OrganizationGuard requiredRole="staff">
      <MenuManagementContent />
    </OrganizationGuard>
  );
}