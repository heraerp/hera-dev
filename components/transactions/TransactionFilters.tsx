"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Filter, 
  X, 
  Calendar, 
  Search,
  Tag,
  Building2,
  DollarSign,
  AlertTriangle,
  Zap,
  RefreshCw,
  Save,
  ChevronDown
} from "lucide-react"
import { Button } from "@/components/ui/revolutionary-button"
import { Card } from "@/components/ui/revolutionary-card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import type { 
  TransactionFilters as Filters, 
  TransactionType, 
  TransactionStatus 
} from "@/types/transactions"
import motionConfig from "@/lib/motion"

interface TransactionFiltersProps {
  filters: Filters
  onFiltersChange: (filters: Filters) => void
  onClearFilters: () => void
  onSaveFilter?: (name: string, filters: Filters) => void
  savedFilters?: Array<{ name: string; filters: Filters }>
  onLoadFilter?: (filters: Filters) => void
  className?: string
  compact?: boolean
}

interface FilterChipProps {
  label: string
  value: string
  onRemove: () => void
}

function FilterChip({ label, value, onRemove }: FilterChipProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-full text-xs"
    >
      <span>{label}: {value}</span>
      <button
        onClick={onRemove}
        className="hover:bg-primary/20 rounded-full p-0.5"
      >
        <X className="w-3 h-3" />
      </button>
    </motion.div>
  )
}

const TRANSACTION_TYPES: Array<{ value: TransactionType; label: string; icon: string }> = [
  { value: 'journal_entry', label: 'Journal Entry', icon: '📝' },
  { value: 'sales', label: 'Sales', icon: '💰' },
  { value: 'purchase', label: 'Purchase', icon: '🛒' },
  { value: 'payment', label: 'Payment', icon: '💳' },
  { value: 'master_data', label: 'Master Data', icon: '🗂️' },
  { value: 'inventory', label: 'Inventory', icon: '📦' },
  { value: 'payroll', label: 'Payroll', icon: '👥' },
  { value: 'reconciliation', label: 'Reconciliation', icon: '🔄' }
]

const TRANSACTION_STATUSES: Array<{ value: TransactionStatus; label: string; color: string }> = [
  { value: 'DRAFT', label: 'Draft', color: 'bg-gray-100 text-gray-800' },
  { value: 'PENDING', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'APPROVED', label: 'Approved', color: 'bg-blue-100 text-blue-800' },
  { value: 'POSTED', label: 'Posted', color: 'bg-green-100 text-green-800' },
  { value: 'REJECTED', label: 'Rejected', color: 'bg-red-100 text-red-800' },
  { value: 'CANCELLED', label: 'Cancelled', color: 'bg-gray-100 text-gray-800' }
]

export function TransactionFilters({
  filters,
  onFiltersChange,
  onClearFilters,
  onSaveFilter,
  savedFilters = [],
  onLoadFilter,
  className,
  compact = false
}: TransactionFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState(filters.search_query || "")
  const [saveFilterName, setSaveFilterName] = useState("")
  const [showAdvanced, setShowAdvanced] = useState(false)

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      onFiltersChange({ ...filters, search_query: searchQuery || undefined })
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // Update local search when filters change externally
  useEffect(() => {
    setSearchQuery(filters.search_query || "")
  }, [filters.search_query])

  const updateFilter = (key: keyof Filters, value: any) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const toggleArrayFilter = (key: 'transaction_type' | 'transaction_status', value: string) => {
    const currentArray = filters[key] || []
    const newArray = currentArray.includes(value as any)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value as any]
    
    updateFilter(key, newArray.length > 0 ? newArray : undefined)
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (filters.search_query) count++
    if (filters.transaction_type?.length) count++
    if (filters.transaction_status?.length) count++
    if (filters.date_from || filters.date_to) count++
    if (filters.ai_generated !== undefined) count++
    if (filters.fraud_risk_min !== undefined || filters.fraud_risk_max !== undefined) count++
    if (filters.amount_min !== undefined || filters.amount_max !== undefined) count++
    if (filters.department) count++
    if (filters.cost_center) count++
    if (filters.project_code) count++
    if (filters.tags?.length) count++
    if (filters.created_by) count++
    return count
  }

  const activeFiltersCount = getActiveFiltersCount()

  if (compact) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search transactions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filter Popover */}
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="relative">
              <Filter className="w-4 h-4 mr-2" />
              Filters
              {activeFiltersCount > 0 && (
                <Badge className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="end">
            <FilterContent />
          </PopoverContent>
        </Popover>

        {activeFiltersCount > 0 && (
          <Button variant="ghost" size="sm" onClick={onClearFilters}>
            Clear
          </Button>
        )}
      </div>
    )
  }

  function FilterContent() {
    return (
      <div className="p-4 space-y-4">
        {/* Quick Filters */}
        <div>
          <Label className="text-sm font-medium">Transaction Types</Label>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {TRANSACTION_TYPES.map(type => (
              <Button
                key={type.value}
                variant={filters.transaction_type?.includes(type.value) ? "default" : "outline"}
                size="sm"
                onClick={() => toggleArrayFilter('transaction_type', type.value)}
                className="justify-start"
              >
                <span className="mr-2">{type.icon}</span>
                {type.label}
              </Button>
            ))}
          </div>
        </div>

        <Separator />

        {/* Status Filters */}
        <div>
          <Label className="text-sm font-medium">Status</Label>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {TRANSACTION_STATUSES.map(status => (
              <Button
                key={status.value}
                variant={filters.transaction_status?.includes(status.value) ? "default" : "outline"}
                size="sm"
                onClick={() => toggleArrayFilter('transaction_status', status.value)}
                className="justify-start"
              >
                {status.label}
              </Button>
            ))}
          </div>
        </div>

        <Separator />

        {/* Date Range */}
        <div>
          <Label className="text-sm font-medium">Date Range</Label>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div>
              <Label className="text-xs text-muted-foreground">From</Label>
              <Input
                type="date"
                value={filters.date_from || ""}
                onChange={(e) => updateFilter('date_from', e.target.value || undefined)}
                className="text-xs"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">To</Label>
              <Input
                type="date"
                value={filters.date_to || ""}
                onChange={(e) => updateFilter('date_to', e.target.value || undefined)}
                className="text-xs"
              />
            </div>
          </div>
        </div>

        {/* Advanced Filters */}
        <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="w-full justify-between">
              Advanced Filters
              <ChevronDown className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 pt-2">
            {/* AI Generated Toggle */}
            <div className="flex items-center justify-between">
              <Label className="text-sm">AI Generated Only</Label>
              <Switch
                checked={filters.ai_generated === true}
                onCheckedChange={(checked) => updateFilter('ai_generated', checked ? true : undefined)}
              />
            </div>

            {/* Fraud Risk Range */}
            <div>
              <Label className="text-sm font-medium">Fraud Risk Score</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div>
                  <Label className="text-xs text-muted-foreground">Min</Label>
                  <Input
                    type="number"
                    min="0"
                    max="1"
                    step="0.1"
                    placeholder="0.0"
                    value={filters.fraud_risk_min || ""}
                    onChange={(e) => updateFilter('fraud_risk_min', e.target.value ? parseFloat(e.target.value) : undefined)}
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Max</Label>
                  <Input
                    type="number"
                    min="0"
                    max="1"
                    step="0.1"
                    placeholder="1.0"
                    value={filters.fraud_risk_max || ""}
                    onChange={(e) => updateFilter('fraud_risk_max', e.target.value ? parseFloat(e.target.value) : undefined)}
                  />
                </div>
              </div>
            </div>

            {/* Amount Range */}
            <div>
              <Label className="text-sm font-medium">Amount Range</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div>
                  <Label className="text-xs text-muted-foreground">Min</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={filters.amount_min || ""}
                    onChange={(e) => updateFilter('amount_min', e.target.value ? parseFloat(e.target.value) : undefined)}
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Max</Label>
                  <Input
                    type="number"
                    placeholder="No limit"
                    value={filters.amount_max || ""}
                    onChange={(e) => updateFilter('amount_max', e.target.value ? parseFloat(e.target.value) : undefined)}
                  />
                </div>
              </div>
            </div>

            {/* Department */}
            <div>
              <Label className="text-sm font-medium">Department</Label>
              <Input
                placeholder="Department name"
                value={filters.department || ""}
                onChange={(e) => updateFilter('department', e.target.value || undefined)}
                className="mt-1"
              />
            </div>

            {/* Cost Center */}
            <div>
              <Label className="text-sm font-medium">Cost Center</Label>
              <Input
                placeholder="Cost center code"
                value={filters.cost_center || ""}
                onChange={(e) => updateFilter('cost_center', e.target.value || undefined)}
                className="mt-1"
              />
            </div>

            {/* Project Code */}
            <div>
              <Label className="text-sm font-medium">Project Code</Label>
              <Input
                placeholder="Project code"
                value={filters.project_code || ""}
                onChange={(e) => updateFilter('project_code', e.target.value || undefined)}
                className="mt-1"
              />
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onClearFilters}
            className="flex-1"
          >
            Clear All
          </Button>
          
          {onSaveFilter && (
            <Popover>
              <PopoverTrigger asChild>
                <Button size="sm" variant="outline">
                  <Save className="w-4 h-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-3">
                <div className="space-y-2">
                  <Label className="text-sm">Save Filter</Label>
                  <Input
                    placeholder="Filter name"
                    value={saveFilterName}
                    onChange={(e) => setSaveFilterName(e.target.value)}
                  />
                  <Button
                    size="sm"
                    onClick={() => {
                      if (saveFilterName.trim()) {
                        onSaveFilter(saveFilterName.trim(), filters)
                        setSaveFilterName("")
                      }
                    }}
                    disabled={!saveFilterName.trim()}
                    className="w-full"
                  >
                    Save
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          )}
        </div>

        {/* Saved Filters */}
        {savedFilters.length > 0 && (
          <div className="pt-2 border-t">
            <Label className="text-sm font-medium">Saved Filters</Label>
            <div className="space-y-1 mt-2">
              {savedFilters.map((saved, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  size="sm"
                  onClick={() => onLoadFilter?.(saved.filters)}
                  className="w-full justify-start"
                >
                  {saved.name}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <Card className={className}>
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            <h3 className="font-semibold">Filters</h3>
            {activeFiltersCount > 0 && (
              <Badge variant="secondary">{activeFiltersCount} active</Badge>
            )}
          </div>
          
          {activeFiltersCount > 0 && (
            <Button variant="ghost" size="sm" onClick={onClearFilters}>
              Clear All
            </Button>
          )}
        </div>

        {/* Active Filter Chips */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            <AnimatePresence>
              {filters.search_query && (
                <FilterChip
                  label="Search"
                  value={filters.search_query}
                  onRemove={() => updateFilter('search_query', undefined)}
                />
              )}
              
              {filters.transaction_type?.map(type => (
                <FilterChip
                  key={type}
                  label="Type"
                  value={TRANSACTION_TYPES.find(t => t.value === type)?.label || type}
                  onRemove={() => toggleArrayFilter('transaction_type', type)}
                />
              ))}
              
              {filters.transaction_status?.map(status => (
                <FilterChip
                  key={status}
                  label="Status"
                  value={status}
                  onRemove={() => toggleArrayFilter('transaction_status', status)}
                />
              ))}
              
              {(filters.date_from || filters.date_to) && (
                <FilterChip
                  label="Date"
                  value={`${filters.date_from || 'Any'} - ${filters.date_to || 'Any'}`}
                  onRemove={() => {
                    updateFilter('date_from', undefined)
                    updateFilter('date_to', undefined)
                  }}
                />
              )}
            </AnimatePresence>
          </div>
        )}

        <FilterContent />
      </div>
    </Card>
  )
}