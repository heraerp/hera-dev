/**
 * HERA Universal CRUD Template System - Main Export
 * Complete CRUD template system for rapid enterprise application development
 */

// Main Components
export { HERAUniversalCRUD } from './components/HERAUniversalCRUD'
export { CRUDTable } from './components/CRUDTable'
export { CRUDModals } from './components/CRUDModals'
export { CRUDToolbar } from './components/CRUDToolbar'
export { CRUDFilters } from './components/CRUDFilters'

// Status Components
export {
  StatusBadge,
  ActiveStatus,
  InactiveStatus,
  PendingStatus,
  ApprovedStatus,
  RejectedStatus,
  NewOrderStatus,
  ProcessingStatus,
  ReadyStatus,
  CompletedStatus,
  CancelledStatus,
  PaidStatus,
  UnpaidStatus,
  BooleanStatus,
  CustomStatusBadge
} from './components/StatusBadge'

// Hooks
export { useCRUDState } from './hooks/useCRUDState'
export { useTableFeatures } from './hooks/useTableFeatures'
export { useRealTimeSync, useUniversalTransactionsSync, useMetadataSync } from './hooks/useRealTimeSync'
export { useBulkActions, createDefaultBulkOperations } from './hooks/useBulkActions'
export { useDebounce } from './hooks/useDebounce'

// Types - Core
export type {
  CRUDOperation,
  CRUDViewMode,
  CRUDModalType,
  FieldType,
  FieldAlignment,
  FieldVariant
} from './types/crud-types'

// Types - Field Configuration
export type {
  SelectOption,
  FieldValidation,
  CRUDField,
  FieldRenderProps,
  FilterRenderProps
} from './types/crud-types'

// Types - Actions and Operations
export type {
  ActionVariant,
  ActionSize,
  ActionPosition,
  CRUDAction,
  BulkOperation
} from './types/crud-types'

// Types - Filters and Sorting
export type {
  FilterType,
  CRUDFilter,
  SortConfig,
  SortOption
} from './types/crud-types'

// Types - Configuration
export type {
  PaginationConfig,
  ExportConfig,
  RealTimeConfig,
  CRUDConfig
} from './types/crud-types'

// Types - Service Interface
export type {
  CRUDServiceInterface,
  ServiceResult,
  ValidationResult,
  ListOptions,
  SearchOptions
} from './types/crud-types'

// Types - State Management
export type {
  CRUDState,
  CRUDActions,
  CRUDContextValue
} from './types/crud-types'

// Types - Component Props
export type {
  HERAUniversalCRUDProps,
  CRUDTableProps,
  CRUDModalsProps,
  CRUDToolbarProps
} from './types/crud-types'

// Types - Hook Options
export type {
  UseCRUDStateOptions,
  UseTableFeaturesOptions,
  UseBulkActionsOptions
} from './types/crud-types'

// Utility Types
export type {
  FieldHelper,
  ValidationHelper,
  ExportHelper
} from './types/crud-types'

// Default configurations and utilities
export { createDefaultBulkOperations } from './hooks/useBulkActions'

/**
 * HERA Universal CRUD Template System
 * 
 * Features:
 * - ✅ Complete CRUD operations (Create, Read, Update, Delete)
 * - ✅ Advanced data table with sorting, filtering, pagination
 * - ✅ Multi-step modal forms with validation
 * - ✅ Real-time data synchronization
 * - ✅ Bulk operations and selection
 * - ✅ Export functionality (CSV, Excel, PDF, JSON)
 * - ✅ Search and advanced filtering
 * - ✅ Responsive design with mobile optimization
 * - ✅ Accessibility compliance (WCAG 2.1 AA)
 * - ✅ HERA Universal Architecture integration
 * - ✅ Organization-first multi-tenant design
 * - ✅ Universal naming convention compliance
 * - ✅ TypeScript support with comprehensive types
 * - ✅ Customizable components and styling
 * - ✅ Performance optimizations (virtual scrolling, debouncing)
 * - ✅ Error handling and validation
 * - ✅ Extensible action system
 * - ✅ Field-driven configuration
 * - ✅ Custom render functions
 * - ✅ Status badge system
 * - ✅ Animation and micro-interactions
 * 
 * Architecture Compliance:
 * - ✅ Organization isolation (organization_id always required)
 * - ✅ Universal schema (core_entities + core_metadata)
 * - ✅ Manual joins (no foreign key dependencies)
 * - ✅ Naming convention validation
 * - ✅ Multi-tenant security
 * - ✅ Real-time capabilities
 * - ✅ Performance optimization
 * - ✅ Error handling and recovery
 * 
 * Usage:
 * ```typescript
 * import { HERAUniversalCRUD } from '@/templates/crud'
 * 
 * <HERAUniversalCRUD
 *   entityType="product"
 *   entityTypeLabel="Products"
 *   entitySingular="product"
 *   entitySingularLabel="Product"
 *   service={productService}
 *   fields={productFields}
 *   enableRealTime={true}
 * />
 * ```
 */
export default HERAUniversalCRUD