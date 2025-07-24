"use client";

import { useState } from 'react';
import { ModuleStatusChart } from '@/components/erp/module-status-chart';
import { ERPModuleGrid } from '@/components/erp/erp-module-grid';
import { DomainOverview } from '@/components/erp/domain-overview';
import { 
  DollarSignIcon, CogIcon, TrendingUpIcon, UsersIcon, FolderIcon, 
  ChartBarIcon, BookOpenIcon, CubeIcon, ShoppingCartIcon 
} from '@heroicons/react/24/outline';

export default function ERPOverviewPage() {
  const domains = [
    {
      name: 'Finance',
      href: '/finance',
      icon: DollarSignIcon,
      description: 'Financial management and accounting',
      modules: 6,
      activeModules: 2,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20'
    },
    {
      name: 'Operations',
      href: '/operations',
      icon: CogIcon,
      description: 'Operations and supply chain management',
      modules: 5,
      activeModules: 2,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20'
    },
    {
      name: 'Sales & Marketing',
      href: '/sales-marketing',
      icon: TrendingUpIcon,
      description: 'Customer relationship and sales management',
      modules: 4,
      activeModules: 0,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20'
    },
    {
      name: 'Human Resources',
      href: '/human-resources',
      icon: UsersIcon,
      description: 'Employee and human resource management',
      modules: 4,
      activeModules: 0,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20'
    },
    {
      name: 'Projects',
      href: '/projects',
      icon: FolderIcon,
      description: 'Project and resource management',
      modules: 3,
      activeModules: 0,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50 dark:bg-indigo-900/20'
    },
    {
      name: 'Analytics',
      href: '/analytics',
      icon: ChartBarIcon,
      description: 'Business intelligence and reporting',
      modules: 3,
      activeModules: 1,
      color: 'text-teal-600',
      bgColor: 'bg-teal-50 dark:bg-teal-900/20'
    }
  ];

  const allModules = [
    // Finance Domain (6 modules) - 2 active
    { code: 'SYS-GL-CORE', name: 'General Ledger', domain: 'finance', status: 'active', icon: BookOpenIcon },
    { code: 'SYS-DIGITAL-ACCOUNTANT', name: 'Digital Accountant', domain: 'finance', status: 'active', icon: BookOpenIcon },
    { code: 'SYS-AR-MGMT', name: 'Accounts Receivable', domain: 'finance', status: 'development', icon: BookOpenIcon },
    { code: 'SYS-AP-MGMT', name: 'Accounts Payable', domain: 'finance', status: 'development', icon: BookOpenIcon },
    { code: 'SYS-BUDGET-CTRL', name: 'Budget Control', domain: 'finance', status: 'template', icon: BookOpenIcon },
    { code: 'SYS-CASH-MGMT', name: 'Cash Management', domain: 'finance', status: 'template', icon: BookOpenIcon },
    
    // Operations Domain (5 modules) - 2 active
    { code: 'SYS-INVENTORY', name: 'Inventory Management', domain: 'operations', status: 'active', icon: CubeIcon },
    { code: 'SYS-PROCURE', name: 'Procurement', domain: 'operations', status: 'active', icon: ShoppingCartIcon },
    { code: 'SYS-MFG-PLAN', name: 'Manufacturing Planning', domain: 'operations', status: 'development', icon: CogIcon },
    { code: 'SYS-QUALITY', name: 'Quality Management', domain: 'operations', status: 'development', icon: CogIcon },
    { code: 'SYS-WAREHOUSE', name: 'Warehouse Management', domain: 'operations', status: 'template', icon: CogIcon },
    
    // Sales & Marketing Domain (4 modules) - 0 active
    { code: 'SYS-CRM-CORE', name: 'Customer Relationship Management', domain: 'sales-marketing', status: 'development', icon: TrendingUpIcon },
    { code: 'SYS-SALES', name: 'Sales Force Automation', domain: 'sales-marketing', status: 'template', icon: TrendingUpIcon },
    { code: 'SYS-MARKETING', name: 'Marketing Automation', domain: 'sales-marketing', status: 'template', icon: TrendingUpIcon },
    { code: 'SYS-SERVICE', name: 'Service Management', domain: 'sales-marketing', status: 'template', icon: TrendingUpIcon },
    
    // Human Resources Domain (4 modules) - 0 active
    { code: 'SYS-HR-CORE', name: 'Human Resources', domain: 'human-resources', status: 'development', icon: UsersIcon },
    { code: 'SYS-PAYROLL', name: 'Payroll Management', domain: 'human-resources', status: 'template', icon: UsersIcon },
    { code: 'SYS-PERFORMANCE', name: 'Performance Management', domain: 'human-resources', status: 'template', icon: UsersIcon },
    { code: 'SYS-RECRUITMENT', name: 'Recruitment Management', domain: 'human-resources', status: 'template', icon: UsersIcon },
    
    // Projects Domain (3 modules) - 0 active
    { code: 'SYS-PROJECT', name: 'Project Management', domain: 'projects', status: 'template', icon: FolderIcon },
    { code: 'SYS-RESOURCE', name: 'Resource Management', domain: 'projects', status: 'template', icon: FolderIcon },
    { code: 'SYS-TIME', name: 'Time Tracking', domain: 'projects', status: 'template', icon: FolderIcon },
    
    // Analytics Domain (3 modules) - 1 active
    { code: 'SYS-ANALYTICS', name: 'Business Analytics', domain: 'analytics', status: 'active', icon: ChartBarIcon },
    { code: 'SYS-REPORTING', name: 'Advanced Reporting', domain: 'analytics', status: 'template', icon: ChartBarIcon },
    { code: 'SYS-AI-ENGINE', name: 'AI & Machine Learning', domain: 'analytics', status: 'template', icon: ChartBarIcon }
  ];

  const activeModules = allModules.filter(m => m.status === 'active').length;
  const developmentModules = allModules.filter(m => m.status === 'development').length;
  const templateModules = allModules.filter(m => m.status === 'template').length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            HERA ERP System Overview
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Complete business management platform with {allModules.length} universal ERP modules across 6 business domains
          </p>
        </div>
        <div className="text-sm text-gray-500 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-lg">
          {allModules.length} Total Modules
        </div>
      </div>

      {/* System Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                <div className="w-3 h-3 bg-green-600 rounded-full"></div>
              </div>
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{activeModules}</div>
              <div className="text-sm text-gray-500">Active Modules</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center">
                <div className="w-3 h-3 bg-yellow-600 rounded-full"></div>
              </div>
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{developmentModules}</div>
              <div className="text-sm text-gray-500">In Development</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                <div className="w-3 h-3 bg-gray-600 rounded-full"></div>
              </div>
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{templateModules}</div>
              <div className="text-sm text-gray-500">Templates</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-teal-100 dark:bg-teal-900/20 rounded-lg flex items-center justify-center">
                <div className="w-3 h-3 bg-teal-600 rounded-full"></div>
              </div>
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {Math.round((activeModules / allModules.length) * 100)}%
              </div>
              <div className="text-sm text-gray-500">Completion</div>
            </div>
          </div>
        </div>
      </div>

      {/* Module Status Chart */}
      <ModuleStatusChart modules={allModules} />

      {/* Business Domains Overview */}
      <div>
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Business Domains
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {domains.map((domain) => (
            <DomainOverview key={domain.name} domain={domain} />
          ))}
        </div>
      </div>

      {/* All ERP Modules */}
      <div>
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          All ERP Modules
        </h2>
        <ERPModuleGrid modules={allModules} />
      </div>

      {/* HERA Advantages */}
      <div className="bg-gradient-to-r from-teal-50 to-blue-50 dark:from-teal-900/20 dark:to-blue-900/20 rounded-lg p-6 border border-teal-200 dark:border-teal-700">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          🏆 HERA Universal Advantages
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">⚡ Speed</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              2-minute ERP deployment vs 18-month traditional implementations
            </p>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">🏗️ Architecture</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              5 universal tables handle all business complexity - no schema changes ever
            </p>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">🧠 Intelligence</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              AI-native design with autonomous decision support and continuous learning
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}