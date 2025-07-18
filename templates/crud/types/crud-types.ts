/**
 * HERA Universal CRUD Template - Type Definitions
 * Comprehensive TypeScript interfaces for the CRUD template system
 */

import { ReactNode } from 'react'
import { LucideIcon } from 'lucide-react'

// ============================================================================
// CORE CRUD TYPES
// ============================================================================

export type CRUDOperation = 'create' | 'read' | 'update' | 'delete'
export type CRUDViewMode = 'list' | 'create' | 'edit' | 'view' | 'delete'
export type CRUDModalType = 'create' | 'edit' | 'view' | 'delete' | null

// ============================================================================
// FIELD TYPES
// ============================================================================

export type FieldType = 
  // Text inputs
  | 'text' | 'email' | 'tel' | 'url' | 'password'
  // Number inputs
  | 'number' | 'currency' | 'percentage'
  // Date/Time inputs
  | 'date' | 'datetime' | 'time'
  // Selection inputs
  | 'select' | 'multiselect' | 'autocomplete' | 'radio' | 'checkbox'
  // Boolean inputs
  | 'boolean' | 'switch'
  // Text areas
  | 'textarea' | 'richtext' | 'markdown'
  // File inputs
  | 'file' | 'image' | 'avatar'
  // Special inputs
  | 'json' | 'code' | 'color' | 'range' | 'rating'
  // Custom
  | 'custom'

export type FieldAlignment = 'left' | 'center' | 'right'
export type FieldVariant = 'default' | 'outline' | 'ghost' | 'subtle'

// ============================================================================
// FIELD CONFIGURATION
// ============================================================================

export interface SelectOption {
  value: string | number
  label: string
  description?: string
  icon?: LucideIcon
  color?: string
  disabled?: boolean
  group?: string
}

export interface FieldValidation {
  required?: boolean
  minLength?: number
  maxLength?: number
  min?: number
  max?: number
  step?: number
  pattern?: RegExp
  custom?: (value: any, formData?: any) => string | null
  asyncValidation?: (value: any, formData?: any) => Promise<string | null>
}

export interface CRUDField {
  // Basic configuration
  key: string
  label: string
  type: FieldType
  description?: string
  placeholder?: string
  helpText?: string
  icon?: LucideIcon

  // Validation
  required?: boolean
  validation?: FieldValidation

  // Display configuration
  showInList?: boolean
  showInCreate?: boolean
  showInEdit?: boolean
  showInView?: boolean
  showInFilter?: boolean
  
  // Table configuration
  sortable?: boolean
  searchable?: boolean
  filterable?: boolean
  width?: number | string
  minWidth?: number
  maxWidth?: number
  align?: FieldAlignment
  sticky?: boolean
  resizable?: boolean

  // Form configuration
  disabled?: boolean
  readonly?: boolean
  autoFocus?: boolean
  tabIndex?: number
  defaultValue?: any
  variant?: FieldVariant

  // Options for select/multi-select fields
  options?: SelectOption[]
  loadOptions?: (organizationId: string, searchTerm?: string) => Promise<SelectOption[]>
  multiple?: boolean
  clearable?: boolean
  searchable?: boolean

  // Custom rendering
  render?: (value: any, item: any, field: CRUDField) => ReactNode
  renderForm?: (props: FieldRenderProps) => ReactNode
  renderFilter?: (props: FilterRenderProps) => ReactNode
  
  // Data transformation
  formatDisplay?: (value: any) => string
  formatForm?: (value: any) => any
  parseValue?: (value: string | any) => any
  
  // Conditional logic
  dependsOn?: string[]
  conditional?: (formData: any) => boolean
  
  // Styling
  className?: string
  style?: React.CSSProperties
  
  // Metadata
  metadata?: Record<string, any>
}

// ============================================================================
// RENDER PROPS
// ============================================================================

export interface FieldRenderProps {
  field: CRUDField
  value: any
  onChange: (value: any) => void
  error?: string
  disabled?: boolean
  required?: boolean
  placeholder?: string
}

export interface FilterRenderProps {
  field: CRUDField
  value: any
  onChange: (value: any) => void
  onClear: () => void
}

// ============================================================================
// ACTIONS
// ============================================================================

export type ActionVariant = 'default' | 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive'
export type ActionSize = 'xs' | 'sm' | 'md' | 'lg'
export type ActionPosition = 'row' | 'bulk' | 'toolbar' | 'header'

export interface CRUDAction {
  key: string
  label: string
  description?: string
  icon?: LucideIcon
  variant?: ActionVariant
  size?: ActionSize
  position?: ActionPosition[]
  
  // Behavior
  onClick: (item?: any, selectedItems?: any[]) => void | Promise<void>
  href?: string
  target?: string
  
  // Conditional display
  visible?: (item?: any, selectedItems?: any[]) => boolean
  disabled?: (item?: any, selectedItems?: any[]) => boolean
  
  // Confirmation
  confirm?: string | ((item?: any) => string)
  confirmTitle?: string
  confirmVariant?: 'destructive' | 'warning' | 'info'
  
  // Loading state
  loading?: boolean
  loadingText?: string
  
  // Styling
  className?: string
  tooltip?: string
  
  // Permissions
  permission?: string
  roles?: string[]
}

// ============================================================================
// FILTERS
// ============================================================================

export type FilterType = 'text' | 'select' | 'multiselect' | 'date' | 'daterange' | 'number' | 'numberrange' | 'boolean'

export interface CRUDFilter {
  key: string
  label: string
  type: FilterType
  placeholder?: string
  options?: SelectOption[]
  loadOptions?: (organizationId: string) => Promise<SelectOption[]>
  defaultValue?: any
  apply: (items: any[], value: any) => any[]
  serialize?: (value: any) => string
  deserialize?: (value: string) => any
}

// ============================================================================
// SORTING
// ============================================================================

export interface SortConfig {
  key: string | null
  direction: 'asc' | 'desc'
  type?: 'string' | 'number' | 'date'
}

export interface SortOption {
  key: string
  label: string
  direction?: 'asc' | 'desc'
  type?: 'string' | 'number' | 'date'
}

// ============================================================================
// PAGINATION
// ============================================================================

export interface PaginationConfig {
  page: number
  pageSize: number
  total: number
  pageSizeOptions?: number[]
  showPageSizeSelector?: boolean
  showQuickJumper?: boolean
  showTotal?: boolean
}

// ============================================================================
// BULK OPERATIONS
// ============================================================================

export interface BulkOperation {
  key: string
  label: string
  description?: string
  icon?: LucideIcon
  variant?: ActionVariant
  execute: (selectedIds: string[], items: any[]) => Promise<void>
  confirm?: string
  visible?: (selectedItems: any[]) => boolean
  disabled?: (selectedItems: any[]) => boolean
}

// ============================================================================
// EXPORT CONFIGURATION
// ============================================================================

export type ExportFormat = 'csv' | 'excel' | 'pdf' | 'json'

export interface ExportConfig {
  enabled: boolean
  formats: ExportFormat[]
  filename?: string
  includeFilters?: boolean
  customExporter?: (data: any[], format: ExportFormat) => Promise<void>
}

// ============================================================================
// REAL-TIME CONFIGURATION
// ============================================================================

export interface RealTimeConfig {
  enabled: boolean
  table: string
  filter?: string
  events: ('INSERT' | 'UPDATE' | 'DELETE')[]
  onUpdate?: (payload: any) => void
  debounceMs?: number
}

// ============================================================================
// SERVICE INTERFACE
// ============================================================================

export interface CRUDServiceInterface {
  // Basic CRUD operations
  create: (organizationId: string, data: any) => Promise<ServiceResult>
  read: (organizationId: string, id: string) => Promise<ServiceResult>
  update: (organizationId: string, id: string, data: any) => Promise<ServiceResult>
  delete: (organizationId: string, id: string) => Promise<ServiceResult>
  
  // List operations
  list: (organizationId: string, options?: ListOptions) => Promise<ServiceResult>
  search: (organizationId: string, query: string, options?: SearchOptions) => Promise<ServiceResult>
  
  // Bulk operations
  bulkCreate?: (organizationId: string, items: any[]) => Promise<ServiceResult>
  bulkUpdate?: (organizationId: string, items: any[]) => Promise<ServiceResult>
  bulkDelete?: (organizationId: string, ids: string[]) => Promise<ServiceResult>
  
  // Validation
  validate?: (organizationId: string, data: any, operation: CRUDOperation) => Promise<ValidationResult>
}

export interface ServiceResult<T = any> {
  success: boolean
  data?: T
  error?: string
  errors?: Record<string, string>
  metadata?: {
    total?: number
    page?: number
    pageSize?: number
    hasMore?: boolean
  }
}

export interface ValidationResult {
  valid: boolean
  errors: Record<string, string>
}

export interface ListOptions {
  page?: number
  pageSize?: number
  sort?: SortConfig
  filters?: Record<string, any>
  search?: string
}

export interface SearchOptions extends ListOptions {
  searchFields?: string[]
}

// ============================================================================
// MAIN CRUD CONFIGURATION
// ============================================================================

export interface CRUDConfig {
  // Entity configuration
  entityType: string
  entityTypeLabel: string
  entitySingular: string
  entitySingularLabel: string
  
  // Service
  service: CRUDServiceInterface
  
  // Fields and actions
  fields: CRUDField[]
  actions?: CRUDAction[]
  bulkOperations?: BulkOperation[]
  filters?: CRUDFilter[]
  
  // Features
  enableSearch?: boolean
  enableFilters?: boolean
  enableSorting?: boolean
  enablePagination?: boolean
  enableBulkActions?: boolean
  enableExport?: boolean
  enableRealTime?: boolean
  enableVirtualScrolling?: boolean
  
  // Configuration
  pagination?: Partial<PaginationConfig>
  export?: Partial<ExportConfig>
  realTime?: Partial<RealTimeConfig>
  
  // Customization
  customComponents?: {
    Header?: React.ComponentType<any>
    Toolbar?: React.ComponentType<any>
    Table?: React.ComponentType<any>
    EmptyState?: React.ComponentType<any>
    LoadingState?: React.ComponentType<any>
    ErrorState?: React.ComponentType<any>
  }
  
  // Styling
  className?: string
  tableClassName?: string
  
  // Permissions
  permissions?: {
    create?: boolean
    read?: boolean
    update?: boolean
    delete?: boolean
    export?: boolean
  }
  
  // Callbacks
  onSelectionChange?: (selectedItems: any[]) => void
  onItemClick?: (item: any) => void
  onItemDoubleClick?: (item: any) => void
  onError?: (error: string) => void
  onSuccess?: (message: string, operation: CRUDOperation) => void
}

// ============================================================================
// STATE MANAGEMENT
// ============================================================================

export interface CRUDState {
  // Data
  items: any[]
  selectedItems: Set<string>
  currentItem: any | null
  
  // UI State
  loading: boolean
  saving: boolean
  deleting: boolean
  error: string | null
  viewMode: CRUDViewMode
  modalType: CRUDModalType
  
  // Table state
  searchQuery: string
  filters: Record<string, any>
  sortConfig: SortConfig
  pagination: PaginationConfig
  
  // Selection
  selectAll: boolean
  
  // Real-time
  realTimeEnabled: boolean
}

export interface CRUDActions {
  // Data actions
  setItems: (items: any[]) => void
  addItem: (item: any) => void
  updateItem: (id: string, item: any) => void
  removeItem: (id: string) => void
  
  // Selection actions
  selectItem: (id: string) => void
  selectAll: () => void
  clearSelection: () => void
  setSelectedItems: (ids: string[]) => void
  
  // View actions
  setViewMode: (mode: CRUDViewMode) => void
  setModalType: (type: CRUDModalType) => void
  setCurrentItem: (item: any | null) => void
  
  // Filter/Search actions
  setSearchQuery: (query: string) => void
  setFilters: (filters: Record<string, any>) => void
  setSortConfig: (config: SortConfig) => void
  setPagination: (pagination: Partial<PaginationConfig>) => void
  
  // State actions
  setLoading: (loading: boolean) => void
  setSaving: (saving: boolean) => void
  setDeleting: (deleting: boolean) => void
  setError: (error: string | null) => void
  
  // Operations
  refresh: () => Promise<void>
  create: (data: any) => Promise<void>
  update: (id: string, data: any) => Promise<void>
  delete: (id: string) => Promise<void>
  bulkDelete: (ids: string[]) => Promise<void>
}

// ============================================================================
// CONTEXT
// ============================================================================

export interface CRUDContextValue {
  config: CRUDConfig
  state: CRUDState
  actions: CRUDActions
  organizationId: string
}

// ============================================================================
// COMPONENT PROPS
// ============================================================================

export interface HERAUniversalCRUDProps extends Omit<CRUDConfig, 'service'> {
  service: CRUDServiceInterface
  organizationId?: string
  defaultFilters?: Record<string, any>
  defaultSort?: SortConfig
  onReady?: () => void
}

export interface CRUDTableProps {
  fields: CRUDField[]
  items: any[]
  loading?: boolean
  selectedItems?: Set<string>
  sortConfig?: SortConfig
  onSort?: (field: string) => void
  onSelect?: (id: string) => void
  onSelectAll?: () => void
  onItemClick?: (item: any) => void
  onAction?: (action: string, item: any) => void
  actions?: CRUDAction[]
  enableVirtualScrolling?: boolean
  className?: string
}

export interface CRUDModalsProps {
  fields: CRUDField[]
  modalType: CRUDModalType
  currentItem: any | null
  loading?: boolean
  onClose: () => void
  onSave: (data: any) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

export interface CRUDToolbarProps {
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
}

// ============================================================================
// HOOKS
// ============================================================================

export interface UseCRUDStateOptions {
  initialData?: any[]
  initialFilters?: Record<string, any>
  initialSort?: SortConfig
  pageSize?: number
}

export interface UseTableFeaturesOptions {
  fields: CRUDField[]
  enableSearch?: boolean
  enableFilters?: boolean
  enableSorting?: boolean
  debounceMs?: number
}

export interface UseBulkActionsOptions {
  operations: BulkOperation[]
  onSuccess?: (operation: string, count: number) => void
  onError?: (operation: string, error: string) => void
}

// ============================================================================
// UTILITIES
// ============================================================================

export interface FieldHelper {
  generateField: (config: Partial<CRUDField>) => CRUDField
  validateField: (field: CRUDField) => string[]
  getDefaultValue: (field: CRUDField) => any
  formatValue: (value: any, field: CRUDField) => string
  parseValue: (value: string, field: CRUDField) => any
}

export interface ValidationHelper {
  validateRequired: (value: any) => string | null
  validateLength: (value: string, min?: number, max?: number) => string | null
  validateRange: (value: number, min?: number, max?: number) => string | null
  validatePattern: (value: string, pattern: RegExp) => string | null
  validateEmail: (value: string) => string | null
  validateUrl: (value: string) => string | null
  validatePhone: (value: string) => string | null
}

export interface ExportHelper {
  exportToCsv: (data: any[], filename: string, fields?: CRUDField[]) => void
  exportToExcel: (data: any[], filename: string, fields?: CRUDField[]) => void
  exportToPdf: (data: any[], filename: string, fields?: CRUDField[]) => void
  exportToJson: (data: any[], filename: string) => void
}