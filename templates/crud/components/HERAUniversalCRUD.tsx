'use client'

/**
 * HERA Universal CRUD Template - Main Component
 * Enterprise-grade CRUD interface with HERA Universal Architecture integration
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRestaurantManagement } from '@/hooks/useRestaurantManagement'
import { CRUDTable } from './CRUDTable'
import { CRUDModals } from './CRUDModals'
import { CRUDToolbar } from './CRUDToolbar'
import { CRUDFilters } from './CRUDFilters'
import { useCRUDState } from '../hooks/useCRUDState'
import { useTableFeatures } from '../hooks/useTableFeatures'
import { useRealTimeSync } from '../hooks/useRealTimeSync'
import { Card } from '@/components/ui/revolutionary-card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { AlertCircle, Loader2, RefreshCw, Plus, Activity, Target } from 'lucide-react'
import type { 
  HERAUniversalCRUDProps, 
  CRUDModalType, 
  CRUDField,
  SortConfig 
} from '../types/crud-types'

export const HERAUniversalCRUD: React.FC<HERAUniversalCRUDProps> = ({
  entityType,
  entityTypeLabel,
  entitySingular,
  entitySingularLabel,
  service,
  fields,
  actions = [],
  bulkOperations = [],
  filters = [],
  enableSearch = true,
  enableFilters = true,
  enableSorting = true,
  enablePagination = true,
  enableBulkActions = true,
  enableExport = true,
  enableRealTime = false,
  enableVirtualScrolling = false,
  pagination = {},
  export: exportConfig = {},
  realTime = {},
  customComponents = {},
  className = '',
  tableClassName = '',
  permissions = {},
  onSelectionChange,
  onItemClick,
  onItemDoubleClick,
  onError,
  onSuccess,
  organizationId: propOrganizationId,
  defaultFilters = {},
  defaultSort,
  onReady
}) => {
  // HERA Universal Architecture: Get organization context
  const { restaurantData, loading: restaurantLoading } = useRestaurantManagement()
  const organizationId = propOrganizationId || restaurantData?.organizationId

  // CRUD State Management
  const {
    state,
    actions: crudActions
  } = useCRUDState({
    initialFilters: defaultFilters,
    initialSort: defaultSort,
    pageSize: pagination.pageSize || 25
  })

  // Table Features (search, filter, sort)
  const {
    filteredItems,
    appliedFilters,
    searchQuery,
    sortConfig,
    handleSearch,
    handleFilter,
    handleSort,
    handleClearFilters
  } = useTableFeatures({
    items: state.items,
    fields,
    enableSearch,
    enableFilters,
    enableSorting,
    debounceMs: 300
  })

  // Real-time sync
  useRealTimeSync({
    enabled: enableRealTime && !!organizationId,
    organizationId: organizationId || '',
    entityType,
    onUpdate: crudActions.refresh,
    ...realTime
  })

  // Modal state
  const [modalType, setModalType] = useState<CRUDModalType>(null)
  const [currentItem, setCurrentItem] = useState<any>(null)

  // Load data on mount and organization change
  const loadData = useCallback(async () => {
    if (!organizationId) return

    console.log('🔄 HERAUniversalCRUD.loadData called for organization:', organizationId)
    crudActions.setLoading(true)
    crudActions.setError(null)

    try {
      const listOptions = {
        page: state.pagination.page,
        pageSize: state.pagination.pageSize,
        sort: sortConfig,
        filters: appliedFilters,
        search: searchQuery
      }
      console.log('📊 List options:', listOptions)
      
      const result = await service.list(organizationId, listOptions)
      console.log('📊 Service.list result:', result)

      if (result.success) {
        console.log('✅ Setting items:', result.data || [])
        console.log('📊 Items count:', (result.data || []).length)
        crudActions.setItems(result.data || [])
        
        if (result.metadata) {
          console.log('📊 Setting pagination metadata:', result.metadata)
          crudActions.setPagination({
            total: result.metadata.total || 0,
            page: result.metadata.page || 1,
            pageSize: result.metadata.pageSize || state.pagination.pageSize
          })
        }

        onReady?.()
      } else {
        console.error('❌ Load data failed:', result.error)
        crudActions.setError(result.error || 'Failed to load data')
        onError?.(result.error || 'Failed to load data')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
      crudActions.setError(errorMessage)
      onError?.(errorMessage)
    } finally {
      crudActions.setLoading(false)
    }
  }, [organizationId, state.pagination.page, state.pagination.pageSize, sortConfig, appliedFilters, searchQuery])

  useEffect(() => {
    loadData()
  }, [loadData])

  // CRUD Operations
  const handleCreate = async (data: any) => {
    if (!organizationId) return

    console.log('🔍 HERAUniversalCRUD.handleCreate called with:', { organizationId, data })

    crudActions.setSaving(true)
    try {
      console.log('🔄 Calling service.create...')
      const result = await service.create(organizationId, data)
      console.log('📊 Service.create result:', result)
      
      if (result.success) {
        console.log('✅ Create successful, reloading data...')
        await loadData()
        setModalType(null)
        setCurrentItem(null)
        
        // Show success message with product details if available
        const productName = result.data?.name || data?.name || 'Item'
        const productCode = result.data?.code || result.data?.sku || ''
        const successMessage = productCode 
          ? `${productName} created successfully (${productCode})`
          : `${productName} created successfully`
        
        onSuccess?.(successMessage, 'create')
      } else {
        console.error('❌ Create failed:', result.error)
        throw new Error(result.error || 'Failed to create item')
      }
    } catch (error) {
      console.error('❌ Exception in handleCreate:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to create item'
      onError?.(errorMessage)
      throw error
    } finally {
      crudActions.setSaving(false)
    }
  }

  const handleUpdate = async (data: any) => {
    if (!organizationId || !currentItem) return

    crudActions.setSaving(true)
    try {
      const result = await service.update(organizationId, currentItem.id, data)
      
      if (result.success) {
        await loadData()
        setModalType(null)
        setCurrentItem(null)
        onSuccess?.('Item updated successfully', 'update')
      } else {
        throw new Error(result.error || 'Failed to update item')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update item'
      onError?.(errorMessage)
      throw error
    } finally {
      crudActions.setSaving(false)
    }
  }

  const handleDelete = async (id?: string) => {
    if (!organizationId) return
    
    const itemId = id || currentItem?.id
    if (!itemId) return

    crudActions.setDeleting(true)
    try {
      const result = await service.delete(organizationId, itemId)
      
      if (result.success) {
        await loadData()
        setModalType(null)
        setCurrentItem(null)
        crudActions.clearSelection()
        onSuccess?.('Item deleted successfully', 'delete')
      } else {
        throw new Error(result.error || 'Failed to delete item')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete item'
      onError?.(errorMessage)
      throw error
    } finally {
      crudActions.setDeleting(false)
    }
  }

  const handleBulkDelete = async () => {
    if (!organizationId || state.selectedItems.size === 0) return
    if (!service.bulkDelete) return

    crudActions.setDeleting(true)
    try {
      const selectedIds = Array.from(state.selectedItems)
      const result = await service.bulkDelete(organizationId, selectedIds)
      
      if (result.success) {
        await loadData()
        crudActions.clearSelection()
        onSuccess?.(`${selectedIds.length} items deleted successfully`, 'delete')
      } else {
        throw new Error(result.error || 'Failed to delete items')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete items'
      onError?.(errorMessage)
      throw error
    } finally {
      crudActions.setDeleting(false)
    }
  }

  // Action handlers
  const handleRowAction = (action: string, item: any) => {
    switch (action) {
      case 'view':
        setCurrentItem(item)
        setModalType('view')
        break
      case 'edit':
        setCurrentItem(item)
        setModalType('edit')
        break
      case 'delete':
        setCurrentItem(item)
        setModalType('delete')
        break
      default:
        // Handle custom actions
        const customAction = actions.find(a => a.key === action)
        if (customAction) {
          customAction.onClick(item)
        }
    }
  }

  const handleToolbarAction = (action: string) => {
    switch (action) {
      case 'create':
        setCurrentItem(null)
        setModalType('create')
        break
      case 'refresh':
        loadData()
        break
      case 'export':
        // Handle export
        console.log('Export functionality to be implemented')
        break
      case 'bulk-delete':
        handleBulkDelete()
        break
      default:
        // Handle custom toolbar actions
        const customAction = actions.find(a => a.key === action)
        if (customAction) {
          customAction.onClick(undefined, Array.from(state.selectedItems))
        }
    }
  }

  // Selection handlers
  const handleSelectionChange = (selectedIds: Set<string>) => {
    crudActions.setSelectedItems(Array.from(selectedIds))
    onSelectionChange?.(selectedIds.size > 0 ? filteredItems.filter(item => selectedIds.has(item.id)) : [])
  }

  // Loading state for organization
  if (restaurantLoading) {
    return (
      <Card className="p-8 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
        <p className="text-gray-600">Loading organization context...</p>
      </Card>
    )
  }

  // No organization state
  if (!organizationId) {
    return (
      <Card className="p-8 text-center">
        <AlertCircle className="w-12 h-12 mx-auto mb-4 text-amber-500" />
        <h3 className="text-lg font-semibold mb-2">Organization Setup Required</h3>
        <p className="text-gray-600 mb-4">
          Please complete your organization setup to access {entityTypeLabel.toLowerCase()}.
        </p>
        <Button onClick={() => window.location.href = '/setup/restaurant'}>
          Complete Setup
        </Button>
      </Card>
    )
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <Target className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">{entityTypeLabel}</h1>
                  <p className="text-blue-100">
                    Manage your {entityTypeLabel.toLowerCase()} with HERA Universal Architecture
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {enableRealTime && (
                <Badge className="gap-1 bg-green-500/20 text-green-100 border-green-400/30">
                  <Activity className="w-3 h-3" />
                  Live System
                </Badge>
              )}
              
              {permissions.create !== false && (
                <Button
                  onClick={() => handleToolbarAction('create')}
                  className="gap-2 bg-white/20 hover:bg-white/30 text-white border-white/30"
                  variant="outline"
                >
                  <Plus className="w-4 h-4" />
                  Create {entitySingularLabel}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 -mt-4 relative z-10">
        {/* Toolbar */}
        <Card className="mb-6 bg-white/90 backdrop-blur-sm border-0 shadow-xl">
          <CRUDToolbar
            searchQuery={searchQuery}
            onSearchChange={handleSearch}
            filters={appliedFilters}
            onFiltersChange={handleFilter}
            selectedCount={state.selectedItems.size}
            onBulkAction={handleToolbarAction}
            actions={actions}
            bulkOperations={bulkOperations}
            enableSearch={enableSearch}
            enableFilters={enableFilters}
            enableExport={enableExport}
            entityTypeLabel={entityTypeLabel}
            entitySingularLabel={entitySingularLabel}
            onRefresh={() => handleToolbarAction('refresh')}
            loading={state.loading}
          />
        </Card>

        {/* Filters */}
        {enableFilters && filters.length > 0 && (
          <Card className="mb-6 bg-white/90 backdrop-blur-sm border-0 shadow-xl">
            <CRUDFilters
              filters={filters}
              values={appliedFilters}
              onChange={handleFilter}
              onClear={handleClearFilters}
              organizationId={organizationId}
            />
          </Card>
        )}

        {/* Error State */}
        {state.error && (
          <Card className="mb-6 p-4 bg-red-50 border-red-200">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-red-800">Error</p>
                <p className="text-sm text-red-600">{state.error}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => loadData()}
                className="text-red-600 border-red-300 hover:bg-red-50"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry
              </Button>
            </div>
          </Card>
        )}

        {/* Main Table */}
        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-2xl overflow-hidden">
          <CRUDTable
            fields={fields}
            items={filteredItems}
            loading={state.loading}
            selectedItems={state.selectedItems}
            sortConfig={sortConfig}
            onSort={handleSort}
            onSelect={(id) => {
              const newSelection = new Set(state.selectedItems)
              if (newSelection.has(id)) {
                newSelection.delete(id)
              } else {
                newSelection.add(id)
              }
              handleSelectionChange(newSelection)
            }}
            onSelectAll={() => {
              const allIds = filteredItems.map(item => item.id)
              const newSelection = state.selectedItems.size === allIds.length 
                ? new Set<string>() 
                : new Set(allIds)
              handleSelectionChange(newSelection)
            }}
            onItemClick={onItemClick}
            onItemDoubleClick={onItemDoubleClick}
            onAction={handleRowAction}
            actions={actions}
            enableVirtualScrolling={enableVirtualScrolling}
            enableBulkActions={enableBulkActions}
            entityTypeLabel={entityTypeLabel}
            entitySingularLabel={entitySingularLabel}
            className={tableClassName}
          />
        </Card>

        {/* Architecture Showcase */}
        <Card className="mt-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <div className="text-center mb-4">
            <Badge className="gap-1 bg-green-500 text-white mb-3">
              <Activity className="w-3 h-3" />
              HERA Universal Architecture
            </Badge>
            <h3 className="text-lg font-semibold text-green-800">
              Powered by Universal CRUD Template System
            </h3>
          </div>
          
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="text-center p-3">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <Target className="w-4 h-4 text-white" />
              </div>
              <div className="font-medium text-green-800">Universal Schema</div>
              <div className="text-green-600">Data stored using HERA universal patterns</div>
            </div>
            
            <div className="text-center p-3">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <Activity className="w-4 h-4 text-white" />
              </div>
              <div className="font-medium text-green-800">Organization Isolation</div>
              <div className="text-green-600">Complete multi-tenant data separation</div>
            </div>
            
            <div className="text-center p-3">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <RefreshCw className="w-4 h-4 text-white" />
              </div>
              <div className="font-medium text-green-800">Real-Time Updates</div>
              <div className="text-green-600">Live data synchronization across clients</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Modals */}
      <CRUDModals
        fields={fields}
        modalType={modalType}
        currentItem={currentItem}
        loading={state.saving || state.deleting}
        entitySingular={entitySingular}
        entitySingularLabel={entitySingularLabel}
        onClose={() => {
          setModalType(null)
          setCurrentItem(null)
        }}
        onSave={modalType === 'create' ? handleCreate : handleUpdate}
        onDelete={() => handleDelete()}
      />
    </div>
  )
}

export default HERAUniversalCRUD