/**
 * HERA Universal CRUD Template - Table Features Hook
 * Search, filter, sort, and pagination functionality
 */

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useDebounce } from './useDebounce'
import type { 
  CRUDField, 
  SortConfig, 
  UseTableFeaturesOptions 
} from '../types/crud-types'

export const useTableFeatures = (options: UseTableFeaturesOptions & { items: any[] }) => {
  const {
    items,
    fields,
    enableSearch = true,
    enableFilters = true,
    enableSorting = true,
    debounceMs = 300
  } = options

  // State
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<Record<string, any>>({})
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: 'asc' })

  // Debounced search query
  const debouncedSearchQuery = useDebounce(searchQuery, debounceMs)

  // Get searchable fields
  const searchableFields = useMemo(() => 
    fields.filter(field => field.searchable !== false && 
      ['text', 'email', 'tel', 'url', 'textarea'].includes(field.type)
    ),
    [fields]
  )

  // Search function
  const searchItems = useCallback((items: any[], query: string) => {
    if (!enableSearch || !query.trim()) return items

    const normalizedQuery = query.toLowerCase().trim()
    
    return items.filter(item => {
      // Search in searchable fields
      const searchableMatches = searchableFields.some(field => {
        const value = item[field.key]
        if (value == null) return false
        
        const normalizedValue = String(value).toLowerCase()
        return normalizedValue.includes(normalizedQuery)
      })

      // Also search in common fields even if not explicitly marked as searchable
      const commonFields = ['name', 'title', 'label', 'description', 'code', 'id']
      const commonMatches = commonFields.some(fieldKey => {
        const value = item[fieldKey]
        if (value == null) return false
        
        const normalizedValue = String(value).toLowerCase()
        return normalizedValue.includes(normalizedQuery)
      })

      return searchableMatches || commonMatches
    })
  }, [enableSearch, searchableFields])

  // Filter function
  const filterItems = useCallback((items: any[], filters: Record<string, any>) => {
    if (!enableFilters) return items

    return items.filter(item => {
      return Object.entries(filters).every(([filterKey, filterValue]) => {
        // Skip empty filters
        if (filterValue == null || filterValue === '' || 
           (Array.isArray(filterValue) && filterValue.length === 0)) {
          return true
        }

        const itemValue = item[filterKey]

        // Handle different filter types
        if (Array.isArray(filterValue)) {
          // Multi-select filter
          return filterValue.includes(itemValue)
        }

        if (typeof filterValue === 'object' && filterValue.start && filterValue.end) {
          // Date range filter
          const itemDate = new Date(itemValue)
          const startDate = new Date(filterValue.start)
          const endDate = new Date(filterValue.end)
          return itemDate >= startDate && itemDate <= endDate
        }

        if (typeof filterValue === 'object' && (filterValue.min !== undefined || filterValue.max !== undefined)) {
          // Number range filter
          const numValue = parseFloat(itemValue)
          if (isNaN(numValue)) return false
          
          const minValid = filterValue.min === undefined || numValue >= filterValue.min
          const maxValid = filterValue.max === undefined || numValue <= filterValue.max
          return minValid && maxValid
        }

        if (typeof filterValue === 'boolean') {
          // Boolean filter
          return Boolean(itemValue) === filterValue
        }

        if (typeof filterValue === 'string') {
          // Text filter (case-insensitive partial match)
          const normalizedItemValue = String(itemValue || '').toLowerCase()
          const normalizedFilterValue = filterValue.toLowerCase()
          return normalizedItemValue.includes(normalizedFilterValue)
        }

        // Exact match for other types
        return itemValue === filterValue
      })
    })
  }, [enableFilters])

  // Sort function
  const sortItems = useCallback((items: any[], sortConfig: SortConfig) => {
    if (!enableSorting || !sortConfig.key) return items

    const { key, direction, type = 'string' } = sortConfig

    return [...items].sort((a, b) => {
      let aValue = a[key]
      let bValue = b[key]

      // Handle null/undefined values
      if (aValue == null && bValue == null) return 0
      if (aValue == null) return direction === 'asc' ? 1 : -1
      if (bValue == null) return direction === 'asc' ? -1 : 1

      // Type-specific sorting
      switch (type) {
        case 'number':
          aValue = parseFloat(aValue) || 0
          bValue = parseFloat(bValue) || 0
          break

        case 'date':
          aValue = new Date(aValue).getTime()
          bValue = new Date(bValue).getTime()
          break

        case 'string':
        default:
          aValue = String(aValue).toLowerCase()
          bValue = String(bValue).toLowerCase()
          break
      }

      let comparison = 0
      if (aValue > bValue) comparison = 1
      if (aValue < bValue) comparison = -1

      return direction === 'desc' ? comparison * -1 : comparison
    })
  }, [enableSorting])

  // Handle search change
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query)
  }, [])

  // Handle filter change
  const handleFilter = useCallback((filterUpdates: Record<string, any>) => {
    setFilters(prev => ({ ...prev, ...filterUpdates }))
  }, [])

  // Handle sort change
  const handleSort = useCallback((fieldKey: string) => {
    setSortConfig(prev => {
      if (prev.key === fieldKey) {
        // Toggle direction
        return {
          ...prev,
          direction: prev.direction === 'asc' ? 'desc' : 'asc'
        }
      } else {
        // New field
        const field = fields.find(f => f.key === fieldKey)
        return {
          key: fieldKey,
          direction: 'asc',
          type: field?.type === 'number' || field?.type === 'currency' || field?.type === 'percentage' 
            ? 'number' 
            : field?.type === 'date' || field?.type === 'datetime'
            ? 'date'
            : 'string'
        }
      }
    })
  }, [fields])

  // Clear all filters
  const handleClearFilters = useCallback(() => {
    setFilters({})
  }, [])

  // Clear search
  const handleClearSearch = useCallback(() => {
    setSearchQuery('')
  }, [])

  // Apply all transformations
  const filteredItems = useMemo(() => {
    let result = items

    // Apply search
    result = searchItems(result, debouncedSearchQuery)

    // Apply filters
    result = filterItems(result, filters)

    // Apply sorting
    result = sortItems(result, sortConfig)

    return result
  }, [items, debouncedSearchQuery, filters, sortConfig, searchItems, filterItems, sortItems])

  // Applied filters (non-empty filters)
  const appliedFilters = useMemo(() => {
    return Object.entries(filters).reduce((acc, [key, value]) => {
      if (value != null && value !== '' && 
          (!Array.isArray(value) || value.length > 0)) {
        acc[key] = value
      }
      return acc
    }, {} as Record<string, any>)
  }, [filters])

  // Statistics
  const stats = useMemo(() => ({
    total: items.length,
    filtered: filteredItems.length,
    selected: 0, // This will be set by parent component
    searchActive: !!debouncedSearchQuery,
    filtersActive: Object.keys(appliedFilters).length > 0,
    sortActive: !!sortConfig.key
  }), [items.length, filteredItems.length, debouncedSearchQuery, appliedFilters, sortConfig.key])

  return {
    // Processed data
    filteredItems,
    
    // Current state
    searchQuery,
    filters,
    appliedFilters,
    sortConfig,
    
    // Handlers
    handleSearch,
    handleFilter,
    handleSort,
    handleClearFilters,
    handleClearSearch,
    
    // Statistics
    stats,
    
    // Utilities
    searchableFields
  }
}

export default useTableFeatures