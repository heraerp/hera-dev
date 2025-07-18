'use client'

/**
 * HERA Universal CRUD Template - Table Component
 * Advanced data table with sorting, selection, actions, and virtual scrolling
 */

import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  staggerContainer, 
  staggerItem, 
  floatingCard, 
  magneticButton, 
  fadeInOut,
  createOptimizedStagger,
  createResponsiveAnimation,
  isMobile 
} from '@/lib/animations/smooth-animations'
import { 
  Eye, Edit, Trash2, MoreHorizontal, ChevronUp, ChevronDown,
  Package, AlertCircle, Loader2, Plus, CheckCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { StatusBadge } from './StatusBadge'
import type { CRUDField, CRUDAction, SortConfig } from '../types/crud-types'

interface CRUDTableProps {
  fields: CRUDField[]
  items: any[]
  loading?: boolean
  selectedItems?: Set<string>
  sortConfig?: SortConfig
  onSort?: (field: string) => void
  onSelect?: (id: string) => void
  onSelectAll?: () => void
  onItemClick?: (item: any) => void
  onItemDoubleClick?: (item: any) => void
  onAction?: (action: string, item: any) => void
  actions?: CRUDAction[]
  enableVirtualScrolling?: boolean
  enableBulkActions?: boolean
  entityTypeLabel?: string
  entitySingularLabel?: string
  className?: string
}

export const CRUDTable: React.FC<CRUDTableProps> = ({
  fields,
  items,
  loading = false,
  selectedItems = new Set(),
  sortConfig,
  onSort,
  onSelect,
  onSelectAll,
  onItemClick,
  onItemDoubleClick,
  onAction,
  actions = [],
  enableVirtualScrolling = false,
  enableBulkActions = true,
  entityTypeLabel = 'Items',
  entitySingularLabel = 'Item',
  className = ''
}) => {
  const [hoveredRow, setHoveredRow] = useState<string | null>(null)

  // Filter fields for display in table
  const displayFields = useMemo(() => 
    fields.filter(field => field.showInList !== false),
    [fields]
  )

  // Default actions if none provided
  const defaultActions: CRUDAction[] = [
    {
      key: 'view',
      label: 'View',
      icon: Eye,
      variant: 'ghost',
      position: ['row'],
      onClick: (item) => onAction?.('view', item)
    },
    {
      key: 'edit',
      label: 'Edit',
      icon: Edit,
      variant: 'ghost',
      position: ['row'],
      onClick: (item) => onAction?.('edit', item)
    },
    {
      key: 'delete',
      label: 'Delete',
      icon: Trash2,
      variant: 'ghost',
      position: ['row'],
      onClick: (item) => onAction?.('delete', item),
      confirm: 'Are you sure you want to delete this item?'
    }
  ]

  const finalActions = actions.length > 0 ? actions : defaultActions
  const rowActions = finalActions.filter(action => 
    action.position?.includes('row') || !action.position
  )

  // Handle sort click
  const handleSort = (fieldKey: string) => {
    const field = fields.find(f => f.key === fieldKey)
    if (field?.sortable && onSort) {
      onSort(fieldKey)
    }
  }

  // Handle action click with confirmation
  const handleActionClick = (action: CRUDAction, item: any, event: React.MouseEvent) => {
    event.stopPropagation()
    
    if (action.confirm) {
      const confirmMessage = typeof action.confirm === 'function' 
        ? action.confirm(item) 
        : action.confirm
      
      if (window.confirm(confirmMessage)) {
        action.onClick(item)
      }
    } else {
      action.onClick(item)
    }
  }

  // Render cell value
  const renderCellValue = (value: any, field: CRUDField, item: any) => {
    // Custom render function
    if (field.render) {
      return field.render(value, item, field)
    }

    // Handle different field types
    switch (field.type) {
      case 'boolean':
      case 'switch':
        return value ? (
          <CheckCircle className="w-4 h-4 text-green-600" />
        ) : (
          <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
        )

      case 'select':
        if (field.options) {
          const option = field.options.find(opt => opt.value === value)
          if (option?.color) {
            return <StatusBadge status={value} color={option.color} label={option.label} />
          }
          return <span>{option?.label || value}</span>
        }
        return <span>{value}</span>

      case 'currency':
        return (
          <span className="font-medium text-green-600">
            ${typeof value === 'number' ? value.toFixed(2) : value}
          </span>
        )

      case 'percentage':
        return <span>{value}%</span>

      case 'date':
        return value ? new Date(value).toLocaleDateString() : '-'

      case 'datetime':
        return value ? new Date(value).toLocaleString() : '-'

      case 'email':
        return value ? (
          <a href={`mailto:${value}`} className="text-blue-600 hover:underline">
            {value}
          </a>
        ) : '-'

      case 'tel':
        return value ? (
          <a href={`tel:${value}`} className="text-blue-600 hover:underline">
            {value}
          </a>
        ) : '-'

      case 'url':
        return value ? (
          <a href={value} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
            {value}
          </a>
        ) : '-'

      case 'image':
      case 'avatar':
        return value ? (
          <img 
            src={value} 
            alt={field.label}
            className="w-8 h-8 rounded-full object-cover"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
            <Package className="w-4 h-4 text-gray-400" />
          </div>
        )

      default:
        // Format display if function provided
        if (field.formatDisplay) {
          return field.formatDisplay(value)
        }
        
        // Truncate long text
        if (typeof value === 'string' && value.length > 50) {
          return (
            <span title={value}>
              {value.substring(0, 47)}...
            </span>
          )
        }
        
        return value || '-'
    }
  }

  // Loading state
  if (loading && items.length === 0) {
    return (
      <div className="text-center py-12">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
        <p className="text-gray-600">Loading {entityTypeLabel.toLowerCase()}...</p>
      </div>
    )
  }

  // Empty state
  if (!loading && items.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <Package className="w-12 h-12 mx-auto" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No {entityTypeLabel.toLowerCase()} found
        </h3>
        <p className="text-gray-500 mb-6">
          Get started by creating your first {entitySingularLabel.toLowerCase()}.
        </p>
        <Button onClick={() => onAction?.('create', null)}>
          <Plus className="w-4 h-4 mr-2" />
          Create {entitySingularLabel}
        </Button>
      </div>
    )
  }

  return (
    <div className={`overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          {/* Table Header */}
          <thead className="bg-gray-50">
            <tr>
              {/* Bulk selection checkbox */}
              {enableBulkActions && (
                <th scope="col" className="relative px-6 py-3">
                  <Checkbox
                    checked={selectedItems.size > 0 && selectedItems.size === items.length}
                    onCheckedChange={onSelectAll}
                    aria-label="Select all"
                  />
                </th>
              )}

              {/* Field headers */}
              {displayFields.map((field) => (
                <th
                  key={field.key}
                  scope="col"
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    field.sortable ? 'cursor-pointer hover:text-gray-700 select-none' : ''
                  }`}
                  style={{ 
                    width: field.width,
                    minWidth: field.minWidth,
                    maxWidth: field.maxWidth,
                    textAlign: field.align || 'left'
                  }}
                  onClick={() => field.sortable && handleSort(field.key)}
                >
                  <div className="flex items-center space-x-1">
                    <span>{field.label}</span>
                    {field.sortable && (
                      <div className="flex flex-col">
                        <ChevronUp 
                          className={`w-3 h-3 ${
                            sortConfig?.key === field.key && sortConfig.direction === 'asc'
                              ? 'text-blue-500' 
                              : 'text-gray-300'
                          }`}
                        />
                        <ChevronDown 
                          className={`w-3 h-3 -mt-1 ${
                            sortConfig?.key === field.key && sortConfig.direction === 'desc'
                              ? 'text-blue-500' 
                              : 'text-gray-300'
                          }`}
                        />
                      </div>
                    )}
                  </div>
                </th>
              ))}

              {/* Actions header */}
              {rowActions.length > 0 && (
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              )}
            </tr>
          </thead>

          {/* Table Body */}
          <motion.tbody 
            className="bg-white divide-y divide-gray-200"
            variants={createOptimizedStagger(items.length)}
            initial="initial"
            animate="animate"
          >
            <AnimatePresence>
              {items.map((item, index) => (
                <motion.tr
                  key={item.id || index}
                  variants={createResponsiveAnimation(
                    staggerItem,
                    { 
                      initial: { opacity: 0, y: 10 },
                      animate: { opacity: 1, y: 0 }
                    }
                  )}
                  className="hover:bg-gray-50 transition-colors cursor-pointer group"
                  onMouseEnter={() => setHoveredRow(item.id)}
                  onMouseLeave={() => setHoveredRow(null)}
                  onClick={() => onItemClick?.(item)}
                  onDoubleClick={() => onItemDoubleClick?.(item)}
                  whileHover={{ 
                    backgroundColor: isMobile() ? undefined : "rgba(249, 250, 251, 1)",
                    transition: { duration: 0.2 }
                  }}
                >
                  {/* Bulk selection checkbox */}
                  {enableBulkActions && (
                    <td className="relative px-6 py-4">
                      <Checkbox
                        checked={selectedItems.has(item.id)}
                        onCheckedChange={() => onSelect?.(item.id)}
                        onClick={(e) => e.stopPropagation()}
                        aria-label={`Select ${item.name || 'item'}`}
                      />
                    </td>
                  )}

                  {/* Data cells */}
                  {displayFields.map((field) => (
                    <td
                      key={field.key}
                      className="px-6 py-4 whitespace-nowrap"
                      style={{ textAlign: field.align || 'left' }}
                    >
                      <div className="text-sm text-gray-900">
                        {renderCellValue(item[field.key], field, item)}
                      </div>
                    </td>
                  ))}

                  {/* Actions cell */}
                  {rowActions.length > 0 && (
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div 
                        className={`flex items-center justify-end space-x-2 transition-opacity ${
                          hoveredRow === item.id ? 'opacity-100' : 'opacity-0'
                        }`}
                      >
                        {rowActions.slice(0, 3).map((action) => (
                          <motion.div key={action.key} variants={magneticButton}>
                            <Button
                              variant={action.variant || 'ghost'}
                              size="sm"
                              onClick={(e) => handleActionClick(action, item, e)}
                              disabled={action.disabled?.(item)}
                              title={action.label}
                              className="h-8 w-8 p-0"
                            >
                              {action.icon && <action.icon className="w-4 h-4" />}
                            </Button>
                          </motion.div>
                        ))}

                        {/* More actions dropdown */}
                        {rowActions.length > 3 && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {rowActions.slice(3).map((action) => (
                                <DropdownMenuItem
                                  key={action.key}
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleActionClick(action, item, e)
                                  }}
                                  disabled={action.disabled?.(item)}
                                  className="flex items-center gap-2"
                                >
                                  {action.icon && <action.icon className="w-4 h-4" />}
                                  {action.label}
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </td>
                  )}
                </motion.tr>
              ))}
            </AnimatePresence>
          </motion.tbody>
        </table>
      </div>

      {/* Loading overlay for refresh */}
      {loading && items.length > 0 && (
        <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg p-4 flex items-center gap-3">
            <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
            <span className="text-sm text-gray-600">Updating...</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default CRUDTable