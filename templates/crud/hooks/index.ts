/**
 * HERA Universal CRUD Template - Hooks Index
 * Centralized exports for all CRUD hooks
 */

export { useCRUDState } from './useCRUDState'
export { useTableFeatures } from './useTableFeatures'
export { useRealTimeSync, useUniversalTransactionsSync, useMetadataSync } from './useRealTimeSync'
export { useBulkActions, createDefaultBulkOperations } from './useBulkActions'
export { useDebounce } from './useDebounce'

export type {
  UseCRUDStateOptions,
  UseTableFeaturesOptions,
  UseBulkActionsOptions
} from '../types/crud-types'