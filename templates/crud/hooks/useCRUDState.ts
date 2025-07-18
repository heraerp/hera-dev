/**
 * HERA Universal CRUD Template - State Management Hook
 * Centralized state management for CRUD operations
 */

import { useState, useCallback, useMemo } from 'react'
import type { 
  CRUDState, 
  CRUDActions, 
  CRUDViewMode, 
  CRUDModalType,
  SortConfig,
  PaginationConfig,
  UseCRUDStateOptions
} from '../types/crud-types'

export const useCRUDState = (options: UseCRUDStateOptions = {}) => {
  const {
    initialData = [],
    initialFilters = {},
    initialSort = { key: null, direction: 'asc' },
    pageSize = 25
  } = options

  // Core state
  const [items, setItems] = useState<any[]>(initialData)
  const [selectedItems, setSelectedItemsState] = useState<Set<string>>(new Set())
  const [currentItem, setCurrentItem] = useState<any | null>(null)

  // UI state
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<CRUDViewMode>('list')
  const [modalType, setModalType] = useState<CRUDModalType>(null)

  // Table state
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<Record<string, any>>(initialFilters)
  const [sortConfig, setSortConfig] = useState<SortConfig>(initialSort)
  const [pagination, setPaginationState] = useState<PaginationConfig>({
    page: 1,
    pageSize,
    total: 0,
    pageSizeOptions: [10, 25, 50, 100],
    showPageSizeSelector: true,
    showQuickJumper: true,
    showTotal: true
  })

  // Real-time state
  const [realTimeEnabled, setRealTimeEnabled] = useState(false)

  // Actions
  const addItem = useCallback((item: any) => {
    setItems(prev => [item, ...prev])
  }, [])

  const updateItem = useCallback((id: string, updatedItem: any) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, ...updatedItem } : item
    ))
  }, [])

  const removeItem = useCallback((id: string) => {
    setItems(prev => prev.filter(item => item.id !== id))
    setSelectedItemsState(prev => {
      const newSet = new Set(prev)
      newSet.delete(id)
      return newSet
    })
  }, [])

  // Selection actions
  const selectItem = useCallback((id: string) => {
    setSelectedItemsState(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }, [])

  const selectAll = useCallback(() => {
    const allIds = items.map(item => item.id)
    setSelectedItemsState(prev => 
      prev.size === allIds.length ? new Set() : new Set(allIds)
    )
  }, [items])

  const clearSelection = useCallback(() => {
    setSelectedItemsState(new Set())
  }, [])

  const setSelectedItems = useCallback((ids: string[]) => {
    setSelectedItemsState(new Set(ids))
  }, [])

  // Pagination actions
  const setPagination = useCallback((updates: Partial<PaginationConfig>) => {
    setPaginationState(prev => ({ ...prev, ...updates }))
  }, [])

  // Reset to first page when filters change
  const setFiltersWithReset = useCallback((newFilters: Record<string, any>) => {
    setFilters(newFilters)
    setPaginationState(prev => ({ ...prev, page: 1 }))
  }, [])

  // Reset to first page when search changes
  const setSearchQueryWithReset = useCallback((query: string) => {
    setSearchQuery(query)
    setPaginationState(prev => ({ ...prev, page: 1 }))
  }, [])

  // Sort with reset to first page
  const setSortConfigWithReset = useCallback((config: SortConfig) => {
    setSortConfig(config)
    setPaginationState(prev => ({ ...prev, page: 1 }))
  }, [])

  // Async operations placeholder (to be implemented by service layer)
  const refresh = useCallback(async () => {
    // This will be implemented by the service layer
    console.log('Refresh operation - to be implemented by service')
  }, [])

  const create = useCallback(async (data: any) => {
    // This will be implemented by the service layer
    console.log('Create operation - to be implemented by service', data)
  }, [])

  const update = useCallback(async (id: string, data: any) => {
    // This will be implemented by the service layer
    console.log('Update operation - to be implemented by service', id, data)
  }, [])

  const deleteItem = useCallback(async (id: string) => {
    // This will be implemented by the service layer
    console.log('Delete operation - to be implemented by service', id)
  }, [])

  const bulkDelete = useCallback(async (ids: string[]) => {
    // This will be implemented by the service layer
    console.log('Bulk delete operation - to be implemented by service', ids)
  }, [])

  // Derived state
  const state: CRUDState = useMemo(() => ({
    // Data
    items,
    selectedItems,
    currentItem,
    
    // UI State
    loading,
    saving,
    deleting,
    error,
    viewMode,
    modalType,
    
    // Table state
    searchQuery,
    filters,
    sortConfig,
    pagination,
    
    // Selection
    selectAll: selectedItems.size > 0 && selectedItems.size === items.length,
    
    // Real-time
    realTimeEnabled
  }), [
    items, selectedItems, currentItem, loading, saving, deleting, error,
    viewMode, modalType, searchQuery, filters, sortConfig, pagination,
    realTimeEnabled
  ])

  const actions: CRUDActions = useMemo(() => ({
    // Data actions
    setItems,
    addItem,
    updateItem,
    removeItem,
    
    // Selection actions
    selectItem,
    selectAll,
    clearSelection,
    setSelectedItems,
    
    // View actions
    setViewMode,
    setModalType,
    setCurrentItem,
    
    // Filter/Search actions with reset
    setSearchQuery: setSearchQueryWithReset,
    setFilters: setFiltersWithReset,
    setSortConfig: setSortConfigWithReset,
    setPagination,
    
    // State actions
    setLoading,
    setSaving,
    setDeleting,
    setError,
    
    // Operations (implemented by service layer)
    refresh,
    create,
    update,
    delete: deleteItem,
    bulkDelete
  }), [
    addItem, updateItem, removeItem, selectItem, selectAll, clearSelection,
    setSelectedItems, setSearchQueryWithReset, setFiltersWithReset,
    setSortConfigWithReset, setPagination, refresh, create, update,
    deleteItem, bulkDelete
  ])

  return {
    state,
    actions
  }
}

export default useCRUDState