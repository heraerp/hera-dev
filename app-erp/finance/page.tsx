"use client";

import { useState, useEffect } from 'react';
import { ModuleCard } from '@/components/erp/module-card';
import { FinanceMetrics } from '@/components/finance/finance-metrics';
import { BookOpenIcon, ArrowDownCircleIcon, ArrowUpCircleIcon, ViewfinderCircleIcon, BanknotesIcon, CpuChipIcon } from '@heroicons/react/24/outline';

export default function FinancePage() {
  const financeModules = [
    {
      code: 'SYS-GL-CORE',
      name: 'General Ledger',
      description: 'Chart of accounts, transactions, and AI intelligence with 4-phase autonomous platform',
      href: '/app-erp/finance/gl',
      status: 'active',
      icon: BookOpenIcon,
      features: ['7-digit COA', '4-phase AI intelligence', 'Real-time monitoring', 'Autonomous validation'],
      metrics: { accounts: 6, transactions: 25, intelligence: '89.5%' }
    },
    {
      code: 'SYS-AR-MGMT', 
      name: 'Accounts Receivable',
      description: 'Customer invoices, payments, and aging analysis',
      href: '/app-erp/finance/ar',
      status: 'development',
      icon: ArrowDownCircleIcon,
      features: ['Invoice management', 'Payment processing', 'Aging reports', 'Customer analytics'],
      metrics: { invoices: 0, payments: 0, aging: '0 days' }
    },
    {
      code: 'SYS-AP-MGMT',
      name: 'Accounts Payable', 
      description: 'Vendor bills, payments, and approval workflows',
      href: '/app-erp/finance/ap',
      status: 'development',
      icon: ArrowUpCircleIcon,
      features: ['Vendor bill management', 'Payment automation', 'Approval workflows', 'Three-way matching'],
      metrics: { bills: 0, payments: 0, vendors: 3 }
    },
    {
      code: 'SYS-BUDGET-CTRL',
      name: 'Budget Control',
      description: 'Budget planning, variance analysis, and controls',
      href: '/app-erp/finance/budget',
      status: 'template',
      icon: ViewfinderCircleIcon,
      features: ['Budget planning', 'Variance analysis', 'Approval controls', 'Forecasting'],
      metrics: { budgets: 0, variance: '0%', controls: 0 }
    },
    {
      code: 'SYS-CASH-MGMT',
      name: 'Cash Management',
      description: 'Cash flow forecasting and bank reconciliation',
      href: '/app-erp/finance/cash',
      status: 'template', 
      icon: BanknotesIcon,
      features: ['Cash flow forecasting', 'Bank reconciliation', 'Liquidity management', 'Position tracking'],
      metrics: { accounts: 0, balance: '$0', forecast: '0 days' }
    },
    {
      code: 'SYS-DIGITAL-ACCOUNTANT',
      name: 'Digital Accountant',
      description: 'AI-powered financial assistant and automation',
      href: '/app-erp/finance/digital-accountant',
      status: 'active',
      icon: CpuChipIcon,
      features: ['Document processing', 'Three-way matching', 'AI analytics', 'Process automation'],
      metrics: { documents: 15, matches: 8, automation: '75%' }
    }
  ];

  const [organizationId, setOrganizationId] = useState<string>('123e4567-e89b-12d3-a456-426614174000');

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Financial Management
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            HERA Universal Finance Domain - Complete financial management suite
          </p>
        </div>
        <div className="text-sm text-gray-500 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-lg">
          6 Finance Modules
        </div>
      </div>

      {/* Finance Metrics Dashboard */}
      <FinanceMetrics organizationId={organizationId} />

      {/* Modules Grid */}
      <div>
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Finance Modules
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {financeModules.map((module) => (
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
              <BookOpenIcon className="w-6 h-6 text-teal-600 mb-2" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">Create Account</span>
            </button>
            <button className="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
              <ArrowDownCircleIcon className="w-6 h-6 text-blue-600 mb-2" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">New Invoice</span>
            </button>
            <button className="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
              <ArrowUpCircleIcon className="w-6 h-6 text-red-600 mb-2" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">Pay Bill</span>
            </button>
            <button className="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
              <CpuChipIcon className="w-6 h-6 text-purple-600 mb-2" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">AI Analysis</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}