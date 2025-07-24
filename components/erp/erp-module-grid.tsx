"use client";

import { useState } from 'react';
import { ModuleCard } from './module-card';

interface Module {
  code: string;
  name: string;
  domain: string;
  status: 'active' | 'development' | 'template';
  icon: any;
}

interface ERPModuleGridProps {
  modules: Module[];
}

export function ERPModuleGrid({ modules }: ERPModuleGridProps) {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [domainFilter, setDomainFilter] = useState<string>('all');

  const filteredModules = modules.filter(module => {
    const statusMatch = statusFilter === 'all' || module.status === statusFilter;
    const domainMatch = domainFilter === 'all' || module.domain === domainFilter;
    return statusMatch && domainMatch;
  });

  const uniqueDomains = [...new Set(modules.map(m => m.domain))];
  const domainDisplayNames = {
    'finance': 'Finance',
    'operations': 'Operations', 
    'sales-marketing': 'Sales & Marketing',
    'human-resources': 'Human Resources',
    'projects': 'Projects',
    'analytics': 'Analytics'
  } as Record<string, string>;

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Filter by Status
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="development">Development</option>
            <option value="template">Template</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Filter by Domain
          </label>
          <select
            value={domainFilter}
            onChange={(e) => setDomainFilter(e.target.value)}
            className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="all">All Domains</option>
            {uniqueDomains.map(domain => (
              <option key={domain} value={domain}>
                {domainDisplayNames[domain] || domain}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-end">
          <button
            onClick={() => {
              setStatusFilter('all');
              setDomainFilter('all');
            }}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Showing {filteredModules.length} of {modules.length} modules
        </p>
        <div className="text-sm text-gray-500">
          {statusFilter !== 'all' && (
            <span className="mr-2 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-md">
              Status: {statusFilter}
            </span>
          )}
          {domainFilter !== 'all' && (
            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-md">
              Domain: {domainDisplayNames[domainFilter] || domainFilter}
            </span>
          )}
        </div>
      </div>

      {/* Module Grid */}
      {filteredModules.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredModules.map((module) => (
            <ModuleCard
              key={module.code}
              module={{
                ...module,
                description: `${module.name} module for ${domainDisplayNames[module.domain] || module.domain} domain`,
                href: `/${module.domain}`,
                features: ['Universal architecture', 'AI-powered', 'Real-time data'],
              }}
              showMetrics={false}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">No modules found</h3>
          <p className="mt-2 text-sm text-gray-500">
            Try adjusting your filters to see more modules.
          </p>
        </div>
      )}
    </div>
  );
}