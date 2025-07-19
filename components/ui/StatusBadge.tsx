/**
 * HERA Universal - Status Badge Component
 * 
 * Professional status badges with theme-aware design
 */

'use client';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md' | 'lg';
}

const statusConfig: Record<string, { label: string; classes: string }> = {
  pending: {
    label: 'Pending',
    classes: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800'
  },
  approved: {
    label: 'Approved',
    classes: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800'
  },
  rejected: {
    label: 'Rejected',
    classes: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800'
  },
  auto_approved: {
    label: 'Auto Approved',
    classes: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800'
  },
  pending_approval: {
    label: 'Pending Approval',
    classes: 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 border-orange-200 dark:border-orange-800'
  },
  in_stock: {
    label: 'In Stock',
    classes: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800'
  },
  low_stock: {
    label: 'Low Stock',
    classes: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800'
  },
  out_of_stock: {
    label: 'Out of Stock',
    classes: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800'
  },
  overstock: {
    label: 'Overstock',
    classes: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-800'
  },
  // Additional status values that might come from API
  draft: {
    label: 'Draft',
    classes: 'bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-800'
  },
  cancelled: {
    label: 'Cancelled',
    classes: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800'
  },
  delivered: {
    label: 'Delivered',
    classes: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800'
  },
  partial: {
    label: 'Partial',
    classes: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800'
  }
};

const sizeClasses = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-xs',
  lg: 'px-3 py-1.5 text-sm'
};

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  // Handle null/undefined status values
  const safeStatus = status || '';
  const config = statusConfig[safeStatus.toLowerCase()];
  
  // Fallback config for unknown status values
  const fallbackConfig = {
    label: safeStatus ? 
      safeStatus.charAt(0).toUpperCase() + safeStatus.slice(1).replace(/_/g, ' ') : 
      'Unknown',
    classes: 'bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-800'
  };
  
  const displayConfig = config || fallbackConfig;
  
  return (
    <span className={`
      inline-flex items-center font-medium rounded-full border
      transition-colors duration-200
      ${displayConfig.classes}
      ${sizeClasses[size]}
    `}>
      {displayConfig.label}
    </span>
  );
}