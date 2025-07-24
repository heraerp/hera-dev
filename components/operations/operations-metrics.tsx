"use client";

import { useState, useEffect } from 'react';
import { 
  CubeIcon, 
  ShoppingCartIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon 
} from '@heroicons/react/24/outline';

interface OperationsMetricsProps {
  organizationId: string;
}

export function OperationsMetrics({ organizationId }: OperationsMetricsProps) {
  const [metrics, setMetrics] = useState({
    inventoryItems: 5,
    purchaseOrders: 3,
    stockAlerts: 2,
    suppliers: 3,
    inventoryTurnover: 8.2,
    loading: false
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Inventory Items */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
              <CubeIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="ml-4 flex-1">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {metrics.inventoryItems}
            </div>
            <div className="text-sm text-gray-500">Inventory Items</div>
            <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
              All tracked
            </div>
          </div>
        </div>
      </div>

      {/* Purchase Orders */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
              <ShoppingCartIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <div className="ml-4 flex-1">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {metrics.purchaseOrders}
            </div>
            <div className="text-sm text-gray-500">Purchase Orders</div>
            <div className="text-xs text-green-600 dark:text-green-400 mt-1">
              1 pending approval
            </div>
          </div>
        </div>
      </div>

      {/* Inventory Turnover */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-teal-100 dark:bg-teal-900/20 rounded-lg flex items-center justify-center">
              <CheckCircleIcon className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            </div>
          </div>
          <div className="ml-4 flex-1">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {metrics.inventoryTurnover}x
            </div>
            <div className="text-sm text-gray-500">Turnover Rate</div>
            <div className="text-xs text-teal-600 dark:text-teal-400 mt-1">
              Excellent performance
            </div>
          </div>
        </div>
      </div>

      {/* Stock Alerts */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center">
              <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
          <div className="ml-4 flex-1">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {metrics.stockAlerts}
            </div>
            <div className="text-sm text-gray-500">Stock Alerts</div>
            <div className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
              Low stock warnings
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}