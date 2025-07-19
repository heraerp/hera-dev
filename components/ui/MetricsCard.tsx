/**
 * HERA Universal - Metrics Card Component
 * 
 * Professional metrics card with theme-aware design and depth hierarchy
 */

'use client';

import { LucideIcon } from 'lucide-react';

interface MetricsCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  trend?: string;
  color?: 'blue' | 'green' | 'orange' | 'red' | 'purple';
  onClick?: () => void;
}

const colorClasses = {
  blue: {
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    icon: 'text-blue-600 dark:text-blue-400',
    trend: 'text-blue-600 dark:text-blue-400'
  },
  green: {
    bg: 'bg-green-50 dark:bg-green-900/20',
    icon: 'text-green-600 dark:text-green-400',
    trend: 'text-green-600 dark:text-green-400'
  },
  orange: {
    bg: 'bg-orange-50 dark:bg-orange-900/20',
    icon: 'text-orange-600 dark:text-orange-400',
    trend: 'text-orange-600 dark:text-orange-400'
  },
  red: {
    bg: 'bg-red-50 dark:bg-red-900/20',
    icon: 'text-red-600 dark:text-red-400',
    trend: 'text-red-600 dark:text-red-400'
  },
  purple: {
    bg: 'bg-purple-50 dark:bg-purple-900/20',
    icon: 'text-purple-600 dark:text-purple-400',
    trend: 'text-purple-600 dark:text-purple-400'
  }
};

export function MetricsCard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  color = 'blue',
  onClick 
}: MetricsCardProps) {
  const colors = colorClasses[color];
  
  return (
    <div 
      className={`
        bg-white dark:bg-gray-800 
        border border-gray-200 dark:border-gray-700 
        rounded-lg p-6 
        transition-all duration-200 
        hover:shadow-md dark:hover:shadow-gray-900/20
        ${onClick ? 'cursor-pointer hover:border-gray-300 dark:hover:border-gray-600' : ''}
      `}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
            {title}
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
            {value}
          </p>
          {trend && (
            <p className={`text-xs font-medium ${colors.trend}`}>
              {trend}
            </p>
          )}
        </div>
        
        <div className={`${colors.bg} p-3 rounded-lg flex-shrink-0 ml-4`}>
          <Icon className={`w-6 h-6 ${colors.icon}`} />
        </div>
      </div>
    </div>
  );
}