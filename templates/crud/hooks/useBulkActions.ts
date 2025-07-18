/**
 * HERA Universal CRUD Template - Bulk Actions Hook
 * Management of bulk operations on selected items
 */

import { useState, useCallback, useMemo } from 'react'
import type { BulkOperation, UseBulkActionsOptions } from '../types/crud-types'

export const useBulkActions = (options: UseBulkActionsOptions) => {
  const {
    operations,
    onSuccess,
    onError
  } = options

  const [executing, setExecuting] = useState<Record<string, boolean>>({})
  const [lastExecuted, setLastExecuted] = useState<string | null>(null)

  // Execute bulk operation
  const executeBulkOperation = useCallback(async (
    operationKey: string,
    selectedIds: string[],
    selectedItems: any[]
  ) => {
    const operation = operations.find(op => op.key === operationKey)
    if (!operation) {
      onError?.(operationKey, 'Operation not found')
      return false
    }

    // Check if operation is disabled
    if (operation.disabled?.(selectedItems)) {
      onError?.(operationKey, 'Operation is disabled for current selection')
      return false
    }

    // Check if operation is visible
    if (operation.visible && !operation.visible(selectedItems)) {
      onError?.(operationKey, 'Operation is not available for current selection')
      return false
    }

    setExecuting(prev => ({ ...prev, [operationKey]: true }))

    try {
      // Execute the operation
      await operation.execute(selectedIds, selectedItems)
      
      setLastExecuted(operationKey)
      onSuccess?.(operationKey, selectedIds.length)
      return true
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      onError?.(operationKey, errorMessage)
      return false
    } finally {
      setExecuting(prev => ({ ...prev, [operationKey]: false }))
    }
  }, [operations, onSuccess, onError])

  // Execute with confirmation
  const executeBulkOperationWithConfirmation = useCallback(async (
    operationKey: string,
    selectedIds: string[],
    selectedItems: any[]
  ) => {
    const operation = operations.find(op => op.key === operationKey)
    if (!operation) return false

    // Handle confirmation
    if (operation.confirm) {
      const confirmed = window.confirm(operation.confirm)
      if (!confirmed) return false
    }

    return executeBulkOperation(operationKey, selectedIds, selectedItems)
  }, [operations, executeBulkOperation])

  // Get available operations for current selection
  const getAvailableOperations = useCallback((selectedItems: any[]) => {
    return operations.filter(operation => {
      // Check visibility
      if (operation.visible && !operation.visible(selectedItems)) {
        return false
      }
      
      // Check if not disabled
      if (operation.disabled?.(selectedItems)) {
        return false
      }
      
      return true
    })
  }, [operations])

  // Get operation status
  const getOperationStatus = useCallback((operationKey: string) => {
    return {
      executing: executing[operationKey] || false,
      lastExecuted: lastExecuted === operationKey
    }
  }, [executing, lastExecuted])

  // Bulk operation helpers
  const bulkDelete = useCallback(async (selectedIds: string[], selectedItems: any[]) => {
    return executeBulkOperationWithConfirmation('bulk-delete', selectedIds, selectedItems)
  }, [executeBulkOperationWithConfirmation])

  const bulkUpdate = useCallback(async (
    selectedIds: string[], 
    selectedItems: any[], 
    updateData: any
  ) => {
    const operation = operations.find(op => op.key === 'bulk-update')
    if (!operation) return false

    // Create a custom execute function with update data
    const customOperation = {
      ...operation,
      execute: async (ids: string[], items: any[]) => {
        return operation.execute(ids, items.map(item => ({ ...item, ...updateData })))
      }
    }

    return executeBulkOperation('bulk-update', selectedIds, selectedItems)
  }, [operations, executeBulkOperation])

  const bulkExport = useCallback(async (selectedIds: string[], selectedItems: any[]) => {
    return executeBulkOperation('bulk-export', selectedIds, selectedItems)
  }, [executeBulkOperation])

  const bulkArchive = useCallback(async (selectedIds: string[], selectedItems: any[]) => {
    return executeBulkOperationWithConfirmation('bulk-archive', selectedIds, selectedItems)
  }, [executeBulkOperationWithConfirmation])

  const bulkActivate = useCallback(async (selectedIds: string[], selectedItems: any[]) => {
    return executeBulkOperation('bulk-activate', selectedIds, selectedItems)
  }, [executeBulkOperation])

  const bulkDeactivate = useCallback(async (selectedIds: string[], selectedItems: any[]) => {
    return executeBulkOperationWithConfirmation('bulk-deactivate', selectedIds, selectedItems)
  }, [executeBulkOperationWithConfirmation])

  // Statistics
  const stats = useMemo(() => ({
    totalOperations: operations.length,
    executingCount: Object.values(executing).filter(Boolean).length,
    isAnyExecuting: Object.values(executing).some(Boolean),
    lastExecuted
  }), [operations.length, executing, lastExecuted])

  return {
    // Core functions
    executeBulkOperation,
    executeBulkOperationWithConfirmation,
    getAvailableOperations,
    getOperationStatus,
    
    // Common bulk operations
    bulkDelete,
    bulkUpdate,
    bulkExport,
    bulkArchive,
    bulkActivate,
    bulkDeactivate,
    
    // State
    executing,
    stats
  }
}

// Default bulk operations factory
export const createDefaultBulkOperations = (
  entitySingular: string,
  entityPlural: string
): BulkOperation[] => [
  {
    key: 'bulk-delete',
    label: 'Delete Selected',
    description: `Delete selected ${entityPlural.toLowerCase()}`,
    icon: 'Trash2' as any,
    variant: 'destructive',
    confirm: `Are you sure you want to delete the selected ${entityPlural.toLowerCase()}? This action cannot be undone.`,
    execute: async (selectedIds: string[], items: any[]) => {
      throw new Error('Delete operation must be implemented by the service layer')
    }
  },
  {
    key: 'bulk-export',
    label: 'Export Selected',
    description: `Export selected ${entityPlural.toLowerCase()} to CSV`,
    icon: 'Download' as any,
    variant: 'outline',
    execute: async (selectedIds: string[], items: any[]) => {
      throw new Error('Export operation must be implemented')
    }
  },
  {
    key: 'bulk-activate',
    label: 'Activate Selected',
    description: `Activate selected ${entityPlural.toLowerCase()}`,
    icon: 'Play' as any,
    variant: 'default',
    visible: (items: any[]) => items.some(item => !item.is_active),
    execute: async (selectedIds: string[], items: any[]) => {
      throw new Error('Activate operation must be implemented by the service layer')
    }
  },
  {
    key: 'bulk-deactivate',
    label: 'Deactivate Selected',
    description: `Deactivate selected ${entityPlural.toLowerCase()}`,
    icon: 'Pause' as any,
    variant: 'outline',
    visible: (items: any[]) => items.some(item => item.is_active),
    confirm: `Are you sure you want to deactivate the selected ${entityPlural.toLowerCase()}?`,
    execute: async (selectedIds: string[], items: any[]) => {
      throw new Error('Deactivate operation must be implemented by the service layer')
    }
  }
]

export default useBulkActions