"use client";

import { useState, useEffect } from 'react';
import { 
  BanknotesIcon, 
  ChartBarIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon 
} from '@heroicons/react/24/outline';

interface FinanceMetricsProps {
  organizationId: string;
}

export function FinanceMetrics({ organizationId }: FinanceMetricsProps) {
  const [metrics, setMetrics] = useState({
    cashBalance: 8500,
    accountsCount: 6,
    intelligenceLevel: 89.5,
    alertsCount: 2,
    daysOfCash: 3,
    loading: false
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Cash Balance */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
              <BanknotesIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <div className="ml-4 flex-1">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              ${metrics.cashBalance.toLocaleString()}
            </div>
            <div className="text-sm text-gray-500">Cash Balance</div>
            <div className="text-xs text-red-600 dark:text-red-400 mt-1">
              {metrics.daysOfCash} days remaining
            </div>
          </div>
        </div>
      </div>

      {/* GL Accounts */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
              <ChartBarIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="ml-4 flex-1">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {metrics.accountsCount}
            </div>
            <div className="text-sm text-gray-500">GL Accounts</div>
            <div className="text-xs text-green-600 dark:text-green-400 mt-1">
              Active & operational
            </div>
          </div>
        </div>
      </div>

      {/* AI Intelligence Level */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-teal-100 dark:bg-teal-900/20 rounded-lg flex items-center justify-center">
              <CheckCircleIcon className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            </div>
          </div>
          <div className="ml-4 flex-1">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {metrics.intelligenceLevel}%
            </div>
            <div className="text-sm text-gray-500">AI Intelligence</div>
            <div className="text-xs text-teal-600 dark:text-teal-400 mt-1">
              Excellent health
            </div>
          </div>
        </div>
      </div>

      {/* Active Alerts */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
              <ExclamationTriangleIcon className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <div className="ml-4 flex-1">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {metrics.alertsCount}
            </div>
            <div className="text-sm text-gray-500">Active Alerts</div>
            <div className="text-xs text-red-600 dark:text-red-400 mt-1">
              {metrics.alertsCount === 1 ? '1 critical' : `${metrics.alertsCount} critical`}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}