"use client";

import { useState } from 'react';
import { Sidebar } from '@/components/ui/sidebar';
import { CogIcon, CubeIcon, ShoppingCartIcon, WrenchScrewdriverIcon, ShieldCheckIcon, BuildingStorefrontIcon } from '@heroicons/react/24/outline';

const operationsNavigation = [
  {
    name: 'Operations Overview',
    href: '/app-erp/operations',
    icon: CogIcon,
    current: false,
  },
  {
    name: 'Inventory Management',
    href: '/app-erp/operations/inventory',
    icon: CubeIcon,
    current: false,
    children: [
      { name: 'Items', href: '/app-erp/operations/inventory/items' },
      { name: 'Stock Alerts', href: '/app-erp/operations/inventory/alerts' },
      { name: 'Analytics', href: '/app-erp/operations/inventory/analytics' },
      { name: 'Adjustments', href: '/app-erp/operations/inventory/adjustments' },
    ],
  },
  {
    name: 'Procurement',
    href: '/app-erp/operations/procurement',
    icon: ShoppingCartIcon,
    current: false,
    children: [
      { name: 'Purchase Orders', href: '/app-erp/operations/procurement/purchase-orders' },
      { name: 'Suppliers', href: '/app-erp/operations/procurement/suppliers' },
      { name: 'Approvals', href: '/app-erp/operations/procurement/approvals' },
      { name: 'Receiving', href: '/app-erp/operations/procurement/receiving' },
    ],
  },
  {
    name: 'Manufacturing',
    href: '/app-erp/operations/manufacturing',
    icon: WrenchScrewdriverIcon,
    current: false,
  },
  {
    name: 'Quality Management',
    href: '/app-erp/operations/quality',
    icon: ShieldCheckIcon,
    current: false,
  },
  {
    name: 'Warehouse',
    href: '/app-erp/operations/warehouse',
    icon: BuildingStorefrontIcon,
    current: false,
  },
];

export default function OperationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar
        navigation={operationsNavigation}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        title="Operations Management"
        domain="operations"
      />
      
      <div className="flex flex-1 flex-col overflow-hidden">
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}