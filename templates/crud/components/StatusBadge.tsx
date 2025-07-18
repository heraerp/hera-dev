'use client'

/**
 * HERA Universal CRUD Template - Status Badge Component
 * Flexible status indicators with color coding and animations
 */

import React from 'react'
import { Badge } from '@/components/ui/badge'
import { 
  CheckCircle, XCircle, AlertCircle, Clock, 
  Zap, Star, Pause, Play, Square
} from 'lucide-react'

interface StatusBadgeProps {
  status: string | number
  color?: string
  label?: string
  icon?: boolean
  animate?: boolean
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'outline' | 'secondary'
  className?: string
}

// Default status configurations
const DEFAULT_STATUS_CONFIG: Record<string, {
  color: string
  icon: React.ComponentType<any>
  label?: string
}> = {
  // Common statuses
  'active': { color: 'green', icon: CheckCircle, label: 'Active' },
  'inactive': { color: 'gray', icon: Pause, label: 'Inactive' },
  'pending': { color: 'yellow', icon: Clock, label: 'Pending' },
  'approved': { color: 'green', icon: CheckCircle, label: 'Approved' },
  'rejected': { color: 'red', icon: XCircle, label: 'Rejected' },
  'draft': { color: 'gray', icon: Square, label: 'Draft' },
  'published': { color: 'green', icon: Play, label: 'Published' },
  'archived': { color: 'gray', icon: Square, label: 'Archived' },
  
  // Order statuses
  'new': { color: 'blue', icon: Star, label: 'New' },
  'processing': { color: 'yellow', icon: Zap, label: 'Processing' },
  'ready': { color: 'green', icon: CheckCircle, label: 'Ready' },
  'completed': { color: 'green', icon: CheckCircle, label: 'Completed' },
  'cancelled': { color: 'red', icon: XCircle, label: 'Cancelled' },
  
  // Payment statuses
  'paid': { color: 'green', icon: CheckCircle, label: 'Paid' },
  'unpaid': { color: 'red', icon: XCircle, label: 'Unpaid' },
  'partial': { color: 'yellow', icon: AlertCircle, label: 'Partial' },
  'refunded': { color: 'blue', icon: AlertCircle, label: 'Refunded' },
  
  // General states
  'enabled': { color: 'green', icon: CheckCircle, label: 'Enabled' },
  'disabled': { color: 'gray', icon: Pause, label: 'Disabled' },
  'online': { color: 'green', icon: CheckCircle, label: 'Online' },
  'offline': { color: 'gray', icon: Pause, label: 'Offline' },
  'error': { color: 'red', icon: XCircle, label: 'Error' },
  'warning': { color: 'yellow', icon: AlertCircle, label: 'Warning' },
  'success': { color: 'green', icon: CheckCircle, label: 'Success' },
  'info': { color: 'blue', icon: AlertCircle, label: 'Info' },
  
  // Boolean values
  'true': { color: 'green', icon: CheckCircle, label: 'Yes' },
  'false': { color: 'gray', icon: XCircle, label: 'No' },
  '1': { color: 'green', icon: CheckCircle, label: 'Yes' },
  '0': { color: 'gray', icon: XCircle, label: 'No' }
}

// Color configurations
const COLOR_VARIANTS = {
  green: {
    default: 'bg-green-100 text-green-800 border-green-200',
    outline: 'border-green-500 text-green-700',
    secondary: 'bg-green-50 text-green-700 border-green-100'
  },
  red: {
    default: 'bg-red-100 text-red-800 border-red-200',
    outline: 'border-red-500 text-red-700',
    secondary: 'bg-red-50 text-red-700 border-red-100'
  },
  yellow: {
    default: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    outline: 'border-yellow-500 text-yellow-700',
    secondary: 'bg-yellow-50 text-yellow-700 border-yellow-100'
  },
  blue: {
    default: 'bg-blue-100 text-blue-800 border-blue-200',
    outline: 'border-blue-500 text-blue-700',
    secondary: 'bg-blue-50 text-blue-700 border-blue-100'
  },
  purple: {
    default: 'bg-purple-100 text-purple-800 border-purple-200',
    outline: 'border-purple-500 text-purple-700',
    secondary: 'bg-purple-50 text-purple-700 border-purple-100'
  },
  indigo: {
    default: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    outline: 'border-indigo-500 text-indigo-700',
    secondary: 'bg-indigo-50 text-indigo-700 border-indigo-100'
  },
  pink: {
    default: 'bg-pink-100 text-pink-800 border-pink-200',
    outline: 'border-pink-500 text-pink-700',
    secondary: 'bg-pink-50 text-pink-700 border-pink-100'
  },
  gray: {
    default: 'bg-gray-100 text-gray-800 border-gray-200',
    outline: 'border-gray-500 text-gray-700',
    secondary: 'bg-gray-50 text-gray-700 border-gray-100'
  },
  orange: {
    default: 'bg-orange-100 text-orange-800 border-orange-200',
    outline: 'border-orange-500 text-orange-700',
    secondary: 'bg-orange-50 text-orange-700 border-orange-100'
  }
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  color,
  label,
  icon = true,
  animate = false,
  size = 'md',
  variant = 'default',
  className = ''
}) => {
  // Normalize status to string
  const statusKey = String(status).toLowerCase()
  
  // Get configuration
  const config = DEFAULT_STATUS_CONFIG[statusKey] || {
    color: color || 'gray',
    icon: AlertCircle,
    label: label || String(status)
  }
  
  const statusColor = color || config.color
  const statusLabel = label || config.label || String(status)
  const IconComponent = config.icon

  // Get color classes
  const colorClasses = COLOR_VARIANTS[statusColor as keyof typeof COLOR_VARIANTS]?.default || 
                      COLOR_VARIANTS.gray.default

  // Size classes
  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-2.5 py-1.5', 
    lg: 'text-base px-3 py-2'
  }

  // Icon sizes
  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  }

  return (
    <Badge
      className={`
        inline-flex items-center gap-1.5 font-medium border
        ${colorClasses}
        ${sizeClasses[size]}
        ${animate ? 'transition-all duration-200 hover:scale-105' : ''}
        ${className}
      `}
    >
      {icon && IconComponent && (
        <IconComponent 
          className={`
            ${iconSizes[size]} 
            ${animate ? 'transition-transform duration-200' : ''}
          `}
        />
      )}
      <span>{statusLabel}</span>
    </Badge>
  )
}

// Preset status components for common use cases
export const ActiveStatus = ({ animate = false }: { animate?: boolean }) => (
  <StatusBadge status="active" animate={animate} />
)

export const InactiveStatus = ({ animate = false }: { animate?: boolean }) => (
  <StatusBadge status="inactive" animate={animate} />
)

export const PendingStatus = ({ animate = false }: { animate?: boolean }) => (
  <StatusBadge status="pending" animate={animate} />
)

export const ApprovedStatus = ({ animate = false }: { animate?: boolean }) => (
  <StatusBadge status="approved" animate={animate} />
)

export const RejectedStatus = ({ animate = false }: { animate?: boolean }) => (
  <StatusBadge status="rejected" animate={animate} />
)

export const NewOrderStatus = ({ animate = false }: { animate?: boolean }) => (
  <StatusBadge status="new" animate={animate} />
)

export const ProcessingStatus = ({ animate = false }: { animate?: boolean }) => (
  <StatusBadge status="processing" animate={animate} />
)

export const ReadyStatus = ({ animate = false }: { animate?: boolean }) => (
  <StatusBadge status="ready" animate={animate} />
)

export const CompletedStatus = ({ animate = false }: { animate?: boolean }) => (
  <StatusBadge status="completed" animate={animate} />
)

export const CancelledStatus = ({ animate = false }: { animate?: boolean }) => (
  <StatusBadge status="cancelled" animate={animate} />
)

export const PaidStatus = ({ animate = false }: { animate?: boolean }) => (
  <StatusBadge status="paid" animate={animate} />
)

export const UnpaidStatus = ({ animate = false }: { animate?: boolean }) => (
  <StatusBadge status="unpaid" animate={animate} />
)

export const BooleanStatus = ({ value, animate = false }: { value: boolean, animate?: boolean }) => (
  <StatusBadge status={value ? 'true' : 'false'} animate={animate} />
)

// Status badge with custom configuration
export const CustomStatusBadge: React.FC<{
  status: string
  config: {
    color: string
    icon?: React.ComponentType<any>
    label?: string
  }
  size?: 'sm' | 'md' | 'lg'
  animate?: boolean
  className?: string
}> = ({ status, config, size = 'md', animate = false, className = '' }) => {
  return (
    <StatusBadge
      status={status}
      color={config.color}
      label={config.label}
      icon={!!config.icon}
      size={size}
      animate={animate}
      className={className}
    />
  )
}

export default StatusBadge