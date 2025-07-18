/**
 * Combo Calculation Demo Page
 * Demonstrates the comprehensive combo meal calculation system
 */

"use client";

import React from 'react';
import { Navbar } from '@/components/ui/navbar';
import { OrganizationGuard, useOrganizationContext } from '@/components/restaurant/organization-guard';
import ComboCalculationDemo from '@/components/restaurant/ComboCalculationDemo';

function ComboCalculationDemoContent() {
  const { organizationId } = useOrganizationContext();

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
      {/* Navigation Bar */}
      <Navbar />
      
      {/* Main Content */}
      <div className="container mx-auto p-6">
        <ComboCalculationDemo organizationId={organizationId} />
      </div>
    </div>
  );
}

export default function ComboCalculationDemoPage() {
  return (
    <OrganizationGuard requiredRole="staff">
      <ComboCalculationDemoContent />
    </OrganizationGuard>
  );
}