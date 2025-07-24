"use client";

import Link from 'next/link';
import { ArrowRightIcon } from '@heroicons/react/24/outline';

interface DomainOverviewProps {
  domain: {
    name: string;
    href: string;
    icon: any;
    description: string;
    modules: number;
    activeModules: number;
    color: string;
    bgColor: string;
  };
}

export function DomainOverview({ domain }: DomainOverviewProps) {
  const completionPercentage = Math.round((domain.activeModules / domain.modules) * 100);
  const DomainIcon = domain.icon;

  return (
    <Link
      href={domain.href}
      className={`block p-6 ${domain.bgColor} rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200 group`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg bg-white dark:bg-gray-800 shadow-sm`}>
            <DomainIcon className={`w-6 h-6 ${domain.color}`} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {domain.name}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {domain.modules} modules
            </p>
          </div>
        </div>
        <ArrowRightIcon className="w-5 h-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" />
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
        {domain.description}
      </p>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Progress
          </span>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {domain.activeModules}/{domain.modules} active
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              completionPercentage >= 50 
                ? 'bg-green-500' 
                : completionPercentage >= 25 
                ? 'bg-yellow-500' 
                : 'bg-red-500'
            }`}
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
        <div className="text-right mt-1">
          <span className={`text-xs font-medium ${
            completionPercentage >= 50 
              ? 'text-green-600 dark:text-green-400' 
              : completionPercentage >= 25 
              ? 'text-yellow-600 dark:text-yellow-400' 
              : 'text-red-600 dark:text-red-400'
          }`}>
            {completionPercentage}% complete
          </span>
        </div>
      </div>

      {/* Status Indicators */}
      <div className="flex items-center space-x-4 text-sm">
        {domain.activeModules > 0 && (
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-green-600 dark:text-green-400 font-medium">
              {domain.activeModules} active
            </span>
          </div>
        )}
        {domain.modules - domain.activeModules > 0 && (
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
            <span className="text-gray-500">
              {domain.modules - domain.activeModules} pending
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}