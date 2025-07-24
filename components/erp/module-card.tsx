"use client";

import { ComponentType } from 'react';
import Link from 'next/link';
import { 
  CheckCircleIcon, 
  ClockIcon, 
  DocumentTextIcon,
  ArrowRightIcon 
} from '@heroicons/react/24/outline';

interface ModuleCardProps {
  module: {
    code: string;
    name: string;
    description: string;
    href: string;
    status: 'active' | 'development' | 'template';
    icon: ComponentType<{ className?: string }>;
    features?: string[];
    metrics?: Record<string, any>;
  };
  showMetrics?: boolean;
}

const statusConfig = {
  active: {
    icon: CheckCircleIcon,
    text: 'Active',
    textColor: 'text-green-700 dark:text-green-400',
    bgColor: 'bg-green-100 dark:bg-green-900/30',
    borderColor: 'border-green-200 dark:border-green-800',
  },
  development: {
    icon: ClockIcon,
    text: 'Development',
    textColor: 'text-yellow-700 dark:text-yellow-400',
    bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
    borderColor: 'border-yellow-200 dark:border-yellow-800',
  },
  template: {
    icon: DocumentTextIcon,
    text: 'Template',
    textColor: 'text-gray-700 dark:text-gray-400',
    bgColor: 'bg-gray-100 dark:bg-gray-800',
    borderColor: 'border-gray-200 dark:border-gray-700',
  },
};

export function ModuleCard({ module, showMetrics = false }: ModuleCardProps) {
  const config = statusConfig[module.status];
  const StatusIcon = config.icon;
  const ModuleIcon = module.icon;

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg border ${config.borderColor} shadow-sm hover:shadow-md transition-shadow duration-200`}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${config.bgColor}`}>
              <ModuleIcon className={`w-6 h-6 ${config.textColor}`} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {module.name}
              </h3>
              <p className="text-sm text-gray-500 font-mono">
                {module.code}
              </p>
            </div>
          </div>
          <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${config.bgColor} ${config.textColor}`}>
            <StatusIcon className="w-3 h-3" />
            <span>{config.text}</span>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
          {module.description}
        </p>

        {/* Features */}
        {module.features && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-1">
              {module.features.slice(0, 3).map((feature, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                >
                  {feature}
                </span>
              ))}
              {module.features.length > 3 && (
                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
                  +{module.features.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Metrics */}
        {showMetrics && module.metrics && (
          <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div className="grid grid-cols-3 gap-2 text-center">
              {Object.entries(module.metrics).slice(0, 3).map(([key, value]) => (
                <div key={key} className="text-center">
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {value}
                  </div>
                  <div className="text-xs text-gray-500 capitalize">
                    {key}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action */}
        <div className="flex justify-between items-center">
          <Link
            href={module.href}
            className={`
              inline-flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200
              ${module.status === 'active' 
                ? 'bg-teal-600 hover:bg-teal-700 text-white' 
                : module.status === 'development'
                ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
              }
            `}
          >
            <span>
              {module.status === 'active' ? 'Open' : module.status === 'development' ? 'Preview' : 'View Template'}
            </span>
            <ArrowRightIcon className="w-4 h-4" />
          </Link>
          
          {module.status === 'active' && (
            <div className="flex items-center space-x-1 text-green-600 dark:text-green-400">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium">Live</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}