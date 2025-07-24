/**
 * HERA Universal - PO Approval Dashboard Page
 * 
 * Mario's Restaurant PO Approval & Workflow Management
 * Professional dashboard integrating approval workflow and goods receipt
 */

'use client';

import { useEffect, useState } from 'react';
import { ApprovalDashboard } from '@/components/purchasing/ApprovalDashboard';

export default function PurchaseOrderApprovalsPage() {
  const [organizationId, setOrganizationId] = useState<string>('');

  useEffect(() => {
    // In a real app, get this from auth context or session
    setOrganizationId('123e4567-e89b-12d3-a456-426614174000'); // Mario's Restaurant ID
  }, []);

  if (!organizationId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="p-6 max-w-7xl mx-auto">
        <ApprovalDashboard organizationId={organizationId} />
      </div>
    </div>
  );
}