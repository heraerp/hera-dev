'use client'

/**
 * HERA Universal CRUD Template - Toolbar Component
 * Search, filters, bulk actions, and toolbar controls
 */

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Filter, Download, RefreshCw, Plus, Trash2,
  X, Settings, MoreHorizontal, ChevronDown, Eye, Edit
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { CRUDAction, BulkOperation } from '../types/crud-types'

interface CRUDToolbarProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  filters: Record<string, any>
  onFiltersChange: (filters: Record<string, any>) => void
  selectedCount: number
  onBulkAction: (action: string) => void
  actions?: CRUDAction[]
  bulkOperations?: BulkOperation[]
  enableSearch?: boolean
  enableFilters?: boolean
  enableExport?: boolean
  entityTypeLabel: string
  entitySingularLabel: string
  onRefresh: () => void
  loading?: boolean
}

export const CRUDToolbar: React.FC<CRUDToolbarProps> = ({
  searchQuery,
  onSearchChange,
  filters,
  onFiltersChange,
  selectedCount,
  onBulkAction,
  actions = [],
  bulkOperations = [],
  enableSearch = true,
  enableFilters = true,
  enableExport = true,
  entityTypeLabel,
  entitySingularLabel,
  onRefresh,
  loading = false
}) => {
  const [showFilters, setShowFilters] = useState(false)

  // Filter active filters
  const activeFilters = Object.entries(filters).filter(([_, value]) => 
    value !== '' && value !== null && value !== undefined
  )

  // Toolbar actions (create, export, etc.)
  const toolbarActions = actions.filter(action =>
    action.position?.includes('toolbar') || !action.position
  )

  // Default bulk operations
  const defaultBulkOperations: BulkOperation[] = [
    {
      key: 'bulk-delete',
      label: 'Delete Selected',
      description: `Delete ${selectedCount} selected ${selectedCount === 1 ? entitySingularLabel.toLowerCase() : entityTypeLabel.toLowerCase()}`,
      icon: Trash2,
      variant: 'destructive',
      execute: async () => onBulkAction('bulk-delete'),
      confirm: `Are you sure you want to delete ${selectedCount} selected ${selectedCount === 1 ? 'item' : 'items'}?`
    }
  ]

  const finalBulkOperations = bulkOperations.length > 0 ? bulkOperations : defaultBulkOperations

  // Handle bulk operation click
  const handleBulkOperation = (operation: BulkOperation) => {
    if (operation.confirm) {
      const confirmMessage = typeof operation.confirm === 'function'
        ? operation.confirm
        : operation.confirm
      
      if (window.confirm(confirmMessage)) {
        operation.execute([], []) // We'll pass proper data in the parent component
      }
    } else {
      operation.execute([], [])
    }
  }

  // Clear all filters
  const clearAllFilters = () => {
    onFiltersChange({})
    setShowFilters(false)
  }

  return (
    <div className="p-6 space-y-4">
      {/* Main toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        {/* Search */}
        {enableSearch && (
          <div className="flex-1 max-w-lg">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder={`Search ${entityTypeLabel.toLowerCase()}...`}
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10 pr-4"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center space-x-3">
          {/* Filters toggle */}
          {enableFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className={showFilters ? 'bg-blue-50 border-blue-300 text-blue-700' : ''}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
              {activeFilters.length > 0 && (
                <Badge className="ml-2 bg-blue-600 text-white text-xs px-1.5 py-0.5">
                  {activeFilters.length}
                </Badge>
              )}
            </Button>
          )}

          {/* Export */}
          {enableExport && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onBulkAction('export')}
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          )}

          {/* Refresh */}
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          {/* Custom toolbar actions */}
          {toolbarActions.map((action) => (
            <Button
              key={action.key}
              variant={action.variant || 'outline'}
              size={action.size || 'sm'}
              onClick={() => action.onClick()}
              disabled={action.disabled?.()}
              title={action.description}
            >
              {action.icon && <action.icon className="w-4 h-4 mr-2" />}
              {action.label}
            </Button>
          ))}

          {/* More actions dropdown */}
          {toolbarActions.length > 2 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {toolbarActions.slice(2).map((action) => (
                  <DropdownMenuItem
                    key={action.key}
                    onClick={() => action.onClick()}
                    disabled={action.disabled?.()}
                    className="flex items-center gap-2"
                  >
                    {action.icon && <action.icon className="w-4 h-4" />}
                    {action.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Create button */}
          <Button
            onClick={() => onBulkAction('create')}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Create {entitySingularLabel}
          </Button>
        </div>
      </div>

      {/* Active filters display */}
      {activeFilters.length > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="flex flex-wrap items-center gap-2"
        >
          <span className="text-sm text-gray-600">Active filters:</span>
          {activeFilters.map(([key, value]) => (
            <Badge
              key={key}
              variant="secondary"
              className="gap-1 bg-blue-100 text-blue-800 border-blue-200"
            >
              {key}: {String(value)}
              <button
                onClick={() => onFiltersChange({ ...filters, [key]: '' })}
                className="hover:bg-blue-200 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-blue-600 hover:text-blue-800 h-6 px-2"
          >
            Clear all
          </Button>
        </motion.div>
      )}

      {/* Bulk actions */}
      <AnimatePresence>
        {selectedCount > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4 bg-blue-50 border border-blue-200 rounded-lg"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="text-sm text-blue-800 font-medium">
                  {selectedCount} {selectedCount === 1 ? 'item' : 'items'} selected
                </div>
                <div className="h-4 w-px bg-blue-300" />
                <div className="flex items-center gap-2">
                  {finalBulkOperations.slice(0, 3).map((operation) => (
                    <Button
                      key={operation.key}
                      variant={operation.variant || 'outline'}
                      size="sm"
                      onClick={() => handleBulkOperation(operation)}
                      disabled={operation.disabled?.([])}
                      className="h-8"
                    >
                      {operation.icon && <operation.icon className="w-4 h-4 mr-1" />}
                      {operation.label}
                    </Button>
                  ))}

                  {/* More bulk actions */}
                  {finalBulkOperations.length > 3 && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="h-8">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {finalBulkOperations.slice(3).map((operation) => (
                          <DropdownMenuItem
                            key={operation.key}
                            onClick={() => handleBulkOperation(operation)}
                            disabled={operation.disabled?.([])}
                            className="flex items-center gap-2"
                          >
                            {operation.icon && <operation.icon className="w-4 h-4" />}
                            {operation.label}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => onBulkAction('clear-selection')}
                className="text-blue-600 hover:text-blue-800"
              >
                <X className="w-4 h-4 mr-1" />
                Clear selection
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Extended filters panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4 bg-gray-50 border border-gray-200 rounded-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-900">Advanced Filters</h3>
              <div className="flex items-center gap-2">
                {activeFilters.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllFilters}
                    className="text-gray-600 hover:text-gray-800"
                  >
                    Clear all
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFilters(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Filter controls would go here */}
            <div className="text-sm text-gray-600">
              Advanced filter controls will be implemented based on field types
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default CRUDToolbar