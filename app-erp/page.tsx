"use client";

import { useState } from 'react';
import Link from 'next/link';
import { 
  DollarSignIcon, CogIcon, TrendingUpIcon, UsersIcon, FolderIcon, 
  ChartBarIcon, ShieldCheckIcon, ArrowRightIcon, SparklesIcon 
} from '@heroicons/react/24/outline';

export default function ERPHomePage() {
  const domains = [
    {
      name: 'Finance',
      href: '/app-erp/finance',
      icon: DollarSignIcon,
      description: 'Complete financial management with AI-powered GL intelligence, real-time monitoring, and autonomous decision support',
      modules: 6,
      activeModules: 2,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      borderColor: 'border-green-200 dark:border-green-700',
      features: ['4-Phase GL Intelligence', 'Real-time Cash Flow', 'Autonomous Validation', 'ML Anomaly Detection']
    },
    {
      name: 'Operations',  
      href: '/app-erp/operations',
      icon: CogIcon,
      description: 'End-to-end operations management including inventory, procurement, manufacturing, and quality control',
      modules: 5,
      activeModules: 2,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      borderColor: 'border-blue-200 dark:border-blue-700',
      features: ['Smart Inventory', 'Procurement Workflows', 'Quality Management', 'Real-time Tracking']
    },
    {
      name: 'Sales & Marketing',
      href: '/app-erp/sales-marketing',
      icon: TrendingUpIcon,
      description: 'Customer relationship management, sales automation, marketing campaigns, and service management',
      modules: 4,
      activeModules: 0,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      borderColor: 'border-purple-200 dark:border-purple-700',
      features: ['360° CRM', 'Sales Pipeline', 'Marketing Automation', 'Service Tickets']
    },
    {
      name: 'Human Resources',
      href: '/app-erp/human-resources',
      icon: UsersIcon,
      description: 'Complete HR management including employee lifecycle, payroll, performance, and recruitment',
      modules: 4,
      activeModules: 0,
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      borderColor: 'border-orange-200 dark:border-orange-700',
      features: ['Employee Portal', 'PayrollAutomation', 'Performance Reviews', 'Talent Acquisition']
    },
    {
      name: 'Projects',
      href: '/app-erp/projects',
      icon: FolderIcon,
      description: 'Project planning, resource management, time tracking, and milestone monitoring',
      modules: 3,
      activeModules: 0,
      color: 'text-indigo-600 dark:text-indigo-400',
      bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
      borderColor: 'border-indigo-200 dark:border-indigo-700',
      features: ['Project Planning', 'Resource Allocation', 'Time Tracking', 'Milestone Management']
    },
    {
      name: 'Analytics',
      href: '/app-erp/analytics',
      icon: ChartBarIcon,
      description: 'Business intelligence, advanced reporting, AI insights, and data exploration',
      modules: 3,
      activeModules: 1,
      color: 'text-teal-600 dark:text-teal-400',
      bgColor: 'bg-teal-50 dark:bg-teal-900/20',
      borderColor: 'border-teal-200 dark:border-teal-700',
      features: ['Executive Dashboards', 'Custom Reports', 'AI Predictions', 'Data Visualization']
    },
    {
      name: 'Administration',
      href: '/app-erp/admin',
      icon: ShieldCheckIcon,
      description: 'System administration, user management, compliance, and integrations',
      modules: 2,
      activeModules: 0,
      color: 'text-gray-600 dark:text-gray-400',
      bgColor: 'bg-gray-50 dark:bg-gray-800',
      borderColor: 'border-gray-200 dark:border-gray-700',
      features: ['User Management', 'Compliance Tools', 'System Settings', 'API Management']
    }
  ];

  const totalModules = domains.reduce((sum, domain) => sum + domain.modules, 0);
  const totalActiveModules = domains.reduce((sum, domain) => sum + domain.activeModules, 0);
  const completionPercentage = Math.round((totalActiveModules / totalModules) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-teal-500/10 to-blue-500/10 dark:from-teal-500/5 dark:to-blue-500/5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <SparklesIcon className="w-12 h-12 text-teal-600 dark:text-teal-400 mr-4" />
              <h1 className="text-4xl md:text-6xl font-bold">
                <span className="text-gray-900 dark:text-white">HERA</span>
                <span className="text-teal-600 dark:text-teal-400 ml-2">ERP</span>
              </h1>
            </div>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 mb-8 max-w-3xl mx-auto">
              Revolutionary Universal Business Management Platform
            </p>
            <div className="flex flex-wrap justify-center gap-8 mb-12">
              <div className="text-center">
                <div className="text-3xl font-bold text-teal-600 dark:text-teal-400">
                  {totalModules}
                </div>
                <div className="text-sm text-gray-500">Total Modules</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {totalActiveModules}
                </div>
                <div className="text-sm text-gray-500">Active</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {completionPercentage}%
                </div>
                <div className="text-sm text-gray-500">Complete</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                  5
                </div>
                <div className="text-sm text-gray-500">Core Tables</div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/app-erp/overview"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-teal-600 hover:bg-teal-700 transition-colors duration-200"
              >
                <ChartBarIcon className="w-5 h-5 mr-2" />
                System Overview
              </Link>
              <Link
                href="/app-erp/finance"
                className="inline-flex items-center px-6 py-3 border border-gray-300 dark:border-gray-600 text-base font-medium rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
              >
                <DollarSignIcon className="w-5 h-5 mr-2" />
                Start with Finance
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Business Domains */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Business Domains
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Complete business management across all domains with HERA's universal 5-table architecture
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {domains.map((domain) => {
            const DomainIcon = domain.icon;
            const completionRate = Math.round((domain.activeModules / domain.modules) * 100);
            
            return (
              <Link
                key={domain.name}
                href={domain.href}
                className={`block p-6 ${domain.bgColor} rounded-xl border ${domain.borderColor} hover:shadow-lg transition-all duration-200 group`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                      <DomainIcon className={`w-6 h-6 ${domain.color}`} />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {domain.name}
                    </h3>
                  </div>
                  <ArrowRightIcon className="w-5 h-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" />
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                  {domain.description}
                </p>

                {/* Features */}
                <div className="mb-4">
                  <div className="flex flex-wrap gap-1">
                    {domain.features.slice(0, 2).map((feature, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-white/50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300"
                      >
                        {feature}
                      </span>
                    ))}
                    {domain.features.length > 2 && (
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-white/50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400">
                        +{domain.features.length - 2} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Progress */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Progress
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {domain.activeModules}/{domain.modules} modules
                    </span>
                  </div>
                  <div className="w-full bg-white/60 dark:bg-gray-700/60 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        completionRate >= 50 
                          ? 'bg-green-500' 
                          : completionRate >= 25 
                          ? 'bg-yellow-500' 
                          : 'bg-gray-400'
                      }`}
                      style={{ width: `${completionRate}%` }}
                    />
                  </div>
                  <div className="text-right mt-1">
                    <span className={`text-xs font-medium ${domain.color}`}>
                      {completionRate}% complete
                    </span>
                  </div>
                </div>

                {/* Status */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {domain.activeModules > 0 && (
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                          {domain.activeModules} active
                        </span>
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-gray-500 font-mono">
                    {domain.modules} modules
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* HERA Advantages */}
      <div className="bg-gradient-to-r from-teal-50 to-blue-50 dark:from-teal-900/20 dark:to-blue-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              🏆 Revolutionary Advantages
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Why HERA is transforming business management
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-teal-100 dark:bg-teal-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <SparklesIcon className="w-8 h-8 text-teal-600 dark:text-teal-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                ⚡ 2-Minute Deployment
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Complete ERP deployment in 2 minutes vs 18-month traditional implementations
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <CogIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                🏗️ Universal Architecture
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                5 universal tables handle all business complexity - no schema changes ever
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <ChartBarIcon className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                🧠 AI-Native Intelligence
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Built-in AI with autonomous decision support and continuous learning
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}