"use client";

import { useState } from 'react';
import { ModuleCard } from '@/components/erp/module-card';
import { OperationsMetrics } from '@/components/operations/operations-metrics';
import { CubeIcon, ShoppingCartIcon, WrenchScrewdriverIcon, ShieldCheckIcon, BuildingStorefrontIcon } from '@heroicons/react/24/outline';

export default function OperationsPage() {
  const operationsModules = [
    {
      code: 'SYS-INVENTORY',
      name: 'Inventory Management', 
      description: 'Real-time stock tracking, alerts, and analytics with AI forecasting',
      href: '/operations/inventory',
      status: 'active',
      icon: CubeIcon,
      features: ['Real-time tracking', 'Smart alerts', 'Usage analytics', 'Stock adjustments'],
      metrics: { items: 5, alerts: 2, turnover: '8.2x' }
    },
    {
      code: 'SYS-PROCURE',
      name: 'Procurement',
      description: 'Purchase orders, supplier management, and approval workflows', 
      href: '/operations/procurement',
      status: 'active',
      icon: ShoppingCartIcon,
      features: ['PO management', 'Supplier portal', 'Approval workflows', 'Goods receiving'],
      metrics: { orders: 3, suppliers: 3, pending: 1 }
    },
    {
      code: 'SYS-MFG-PLAN', 
      name: 'Manufacturing Planning',
      description: 'Production planning, BOM management, and work orders',
      href: '/operations/manufacturing',
      status: 'development',
      icon: WrenchScrewdriverIcon,
      features: ['Production planning', 'BOM management', 'Work orders', 'Capacity planning'],
      metrics: { boms: 0, orders: 0, capacity: '0%' }
    },
    {
      code: 'SYS-QUALITY',
      name: 'Quality Management',
      description: 'Quality inspections, defect tracking, and compliance standards', 
      href: '/operations/quality',
      status: 'development',
      icon: ShieldCheckIcon,
      features: ['Quality inspections', 'Defect tracking', 'Compliance standards', 'Audit trails'],
      metrics: { inspections: 0, defects: 0, compliance: '0%' }
    },
    {
      code: 'SYS-WAREHOUSE',
      name: 'Warehouse Management',
      description: 'Location management, picking operations, and cycle counting',
      href: '/operations/warehouse', 
      status: 'template',
      icon: BuildingStorefrontIcon,
      features: ['Location management', 'Pick/pack operations', 'Cycle counting', 'Space optimization'],
      metrics: { locations: 0, picks: 0, accuracy: '0%' }
    }
  ];

  const [organizationId, setOrganizationId] = useState<string>('123e4567-e89b-12d3-a456-426614174000');

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Operations Management
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            HERA Universal Operations Domain - Complete supply chain and operations suite
          </p>
        </div>
        <div className="text-sm text-gray-500 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-lg">
          5 Operations Modules
        </div>
      </div>

      {/* Operations Metrics Dashboard */}
      <OperationsMetrics organizationId={organizationId} />

      {/* Modules Grid */}
      <div>
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Operations Modules
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {operationsModules.map((module) => (
            <ModuleCard
              key={module.code}
              module={module}
              showMetrics={true}
            />
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Quick Actions
          </h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
              <CubeIcon className="w-6 h-6 text-blue-600 mb-2" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">Add Item</span>
            </button>
            <button className="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
              <ShoppingCartIcon className="w-6 h-6 text-green-600 mb-2" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">Create PO</span>
            </button>
            <button className="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
              <WrenchScrewdriverIcon className="w-6 h-6 text-orange-600 mb-2" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">Work Order</span>
            </button>
            <button className="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
              <ShieldCheckIcon className="w-6 h-6 text-purple-600 mb-2" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">Quality Check</span>
            </button>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Recent Operations Activity
          </h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <CubeIcon className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  Low stock alert: Organic Tomatoes
                </p>
                <p className="text-sm text-gray-500">Current: 25 kg, Reorder point: 50 kg</p>
              </div>
              <div className="text-sm text-gray-500">2h ago</div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <ShoppingCartIcon className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  PO-003 approved by Manager Sofia
                </p>
                <p className="text-sm text-gray-500">Premium Meats Co - $2,850.00</p>
              </div>
              <div className="text-sm text-gray-500">4h ago</div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <BuildingStorefrontIcon className="w-5 h-5 text-purple-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  Goods received: Fresh Basil delivery
                </p>
                <p className="text-sm text-gray-500">50 bunches received, quality approved</p>
              </div>
              <div className="text-sm text-gray-500">6h ago</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}