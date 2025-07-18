'use client'

/**
 * HERA Universal CRUD Template - Filters Component
 * Advanced filtering interface with multiple filter types
 */

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Filter, X, Calendar, Search, ChevronDown, 
  CheckCircle, Circle, Plus, Minus
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Card } from '@/components/ui/revolutionary-card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import type { CRUDFilter, SelectOption } from '../types/crud-types'

interface CRUDFiltersProps {
  filters: CRUDFilter[]
  values: Record<string, any>
  onChange: (filters: Record<string, any>) => void
  onClear: () => void
  organizationId: string
  className?: string
}

export const CRUDFilters: React.FC<CRUDFiltersProps> = ({
  filters,
  values,
  onChange,
  onClear,
  organizationId,
  className = ''
}) => {
  const [localValues, setLocalValues] = useState<Record<string, any>>(values)
  const [loadedOptions, setLoadedOptions] = useState<Record<string, SelectOption[]>>({})
  const [loadingOptions, setLoadingOptions] = useState<Record<string, boolean>>({})

  // Sync local values with parent
  useEffect(() => {
    setLocalValues(values)
  }, [values])

  // Load dynamic options for filters
  useEffect(() => {
    const loadOptions = async () => {
      const filtersWithDynamicOptions = filters.filter(filter => filter.loadOptions)
      
      for (const filter of filtersWithDynamicOptions) {
        if (!loadedOptions[filter.key] && !loadingOptions[filter.key]) {
          setLoadingOptions(prev => ({ ...prev, [filter.key]: true }))
          
          try {
            const options = await filter.loadOptions!(organizationId)
            setLoadedOptions(prev => ({ ...prev, [filter.key]: options }))
          } catch (error) {
            console.error(`Failed to load options for filter ${filter.key}:`, error)
          } finally {
            setLoadingOptions(prev => ({ ...prev, [filter.key]: false }))
          }
        }
      }
    }

    if (organizationId) {
      loadOptions()
    }
  }, [filters, organizationId, loadedOptions, loadingOptions])

  // Handle filter value change
  const handleFilterChange = (filterKey: string, value: any) => {
    const newValues = { ...localValues, [filterKey]: value }
    setLocalValues(newValues)
    onChange(newValues)
  }

  // Clear specific filter
  const clearFilter = (filterKey: string) => {
    const newValues = { ...localValues }
    delete newValues[filterKey]
    setLocalValues(newValues)
    onChange(newValues)
  }

  // Get filter options (static or loaded)
  const getFilterOptions = (filter: CRUDFilter): SelectOption[] => {
    return loadedOptions[filter.key] || filter.options || []
  }

  // Render individual filter
  const renderFilter = (filter: CRUDFilter) => {
    const value = localValues[filter.key]
    const hasValue = value !== undefined && value !== null && value !== ''

    switch (filter.type) {
      case 'text':
        return (
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">
              {filter.label}
            </Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder={filter.placeholder}
                value={value || ''}
                onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                className="pl-10 pr-8"
              />
              {hasValue && (
                <button
                  onClick={() => clearFilter(filter.key)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )

      case 'select':
        const options = getFilterOptions(filter)
        return (
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">
              {filter.label}
            </Label>
            <Select
              value={value || ''}
              onValueChange={(newValue) => handleFilterChange(filter.key, newValue)}
            >
              <SelectTrigger>
                <SelectValue placeholder={filter.placeholder || `Select ${filter.label}`} />
              </SelectTrigger>
              <SelectContent>
                {options.map((option) => (
                  <SelectItem key={option.value} value={option.value.toString()}>
                    <div className="flex items-center gap-2">
                      {option.icon && <option.icon className="w-4 h-4" />}
                      <span>{option.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )

      case 'multiselect':
        const multiselectOptions = getFilterOptions(filter)
        const selectedValues = Array.isArray(value) ? value : []
        
        return (
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">
              {filter.label}
            </Label>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {multiselectOptions.map((option) => {
                const isSelected = selectedValues.includes(option.value)
                return (
                  <div key={option.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`${filter.key}-${option.value}`}
                      checked={isSelected}
                      onCheckedChange={(checked) => {
                        const newValues = checked
                          ? [...selectedValues, option.value]
                          : selectedValues.filter(v => v !== option.value)
                        handleFilterChange(filter.key, newValues)
                      }}
                    />
                    <Label 
                      htmlFor={`${filter.key}-${option.value}`}
                      className="text-sm flex items-center gap-2 cursor-pointer"
                    >
                      {option.icon && <option.icon className="w-4 h-4" />}
                      {option.label}
                    </Label>
                  </div>
                )
              })}
            </div>
            {selectedValues.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-2">
                {selectedValues.map((selectedValue) => {
                  const option = multiselectOptions.find(opt => opt.value === selectedValue)
                  return (
                    <Badge
                      key={selectedValue}
                      variant="secondary"
                      className="gap-1 text-xs"
                    >
                      {option?.label}
                      <button
                        onClick={() => {
                          const newValues = selectedValues.filter(v => v !== selectedValue)
                          handleFilterChange(filter.key, newValues)
                        }}
                        className="hover:bg-gray-300 rounded-full p-0.5"
                      >
                        <X className="w-2 h-2" />
                      </button>
                    </Badge>
                  )
                })}
              </div>
            )}
          </div>
        )

      case 'date':
        return (
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">
              {filter.label}
            </Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="date"
                value={value || ''}
                onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                className="pl-10 pr-8"
              />
              {hasValue && (
                <button
                  onClick={() => clearFilter(filter.key)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )

      case 'daterange':
        const dateRange = value || { start: '', end: '' }
        return (
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">
              {filter.label}
            </Label>
            <div className="grid grid-cols-2 gap-2">
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="date"
                  placeholder="Start date"
                  value={dateRange.start || ''}
                  onChange={(e) => handleFilterChange(filter.key, { ...dateRange, start: e.target.value })}
                  className="pl-10"
                />
              </div>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="date"
                  placeholder="End date"
                  value={dateRange.end || ''}
                  onChange={(e) => handleFilterChange(filter.key, { ...dateRange, end: e.target.value })}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        )

      case 'number':
        return (
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">
              {filter.label}
            </Label>
            <Input
              type="number"
              placeholder={filter.placeholder}
              value={value || ''}
              onChange={(e) => handleFilterChange(filter.key, parseFloat(e.target.value) || '')}
            />
          </div>
        )

      case 'numberrange':
        const numberRange = value || { min: '', max: '' }
        return (
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">
              {filter.label}
            </Label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="number"
                placeholder="Min"
                value={numberRange.min || ''}
                onChange={(e) => handleFilterChange(filter.key, { ...numberRange, min: parseFloat(e.target.value) || '' })}
              />
              <Input
                type="number"
                placeholder="Max"
                value={numberRange.max || ''}
                onChange={(e) => handleFilterChange(filter.key, { ...numberRange, max: parseFloat(e.target.value) || '' })}
              />
            </div>
          </div>
        )

      case 'boolean':
        return (
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">
              {filter.label}
            </Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`${filter.key}-true`}
                  checked={value === true}
                  onCheckedChange={(checked) => handleFilterChange(filter.key, checked ? true : undefined)}
                />
                <Label htmlFor={`${filter.key}-true`} className="text-sm cursor-pointer">
                  Yes
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`${filter.key}-false`}
                  checked={value === false}
                  onCheckedChange={(checked) => handleFilterChange(filter.key, checked ? false : undefined)}
                />
                <Label htmlFor={`${filter.key}-false`} className="text-sm cursor-pointer">
                  No
                </Label>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  // Active filters count
  const activeFiltersCount = Object.keys(localValues).filter(key => {
    const value = localValues[key]
    return value !== undefined && value !== null && value !== '' && 
           (!Array.isArray(value) || value.length > 0)
  }).length

  if (filters.length === 0) {
    return null
  }

  return (
    <div className={`p-6 space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
          {activeFiltersCount > 0 && (
            <Badge className="bg-blue-600 text-white">
              {activeFiltersCount} active
            </Badge>
          )}
        </div>
        
        {activeFiltersCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={onClear}
            className="text-gray-600 hover:text-gray-800"
          >
            <X className="w-4 h-4 mr-2" />
            Clear All
          </Button>
        )}
      </div>

      <Separator />

      {/* Filter Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filters.map((filter) => (
          <motion.div
            key={filter.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2"
          >
            {renderFilter(filter)}
          </motion.div>
        ))}
      </div>

      {/* Active Filters Summary */}
      {activeFiltersCount > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="pt-4 border-t border-gray-200"
        >
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-gray-600">Active filters:</span>
            {Object.entries(localValues).map(([key, value]) => {
              if (!value || (Array.isArray(value) && value.length === 0)) return null
              
              const filter = filters.find(f => f.key === key)
              if (!filter) return null

              let displayValue: string
              if (Array.isArray(value)) {
                displayValue = `${value.length} selected`
              } else if (typeof value === 'object' && value.start && value.end) {
                displayValue = `${value.start} - ${value.end}`
              } else if (typeof value === 'boolean') {
                displayValue = value ? 'Yes' : 'No'
              } else {
                const options = getFilterOptions(filter)
                const option = options.find(opt => opt.value === value)
                displayValue = option?.label || String(value)
              }

              return (
                <Badge
                  key={key}
                  variant="secondary"
                  className="gap-1 bg-blue-100 text-blue-800 border-blue-200"
                >
                  <span className="font-medium">{filter.label}:</span>
                  <span>{displayValue}</span>
                  <button
                    onClick={() => clearFilter(key)}
                    className="hover:bg-blue-200 rounded-full p-0.5 ml-1"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )
            })}
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default CRUDFilters