// Product Types for HERA Universal Schema
// Following the universal schema pattern with core_entities and core_dynamic_data

export interface ProductEntity {
  id: string;
  organization_id: string;
  entity_type: 'product';
  entity_name: string;
  entity_code: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductDynamicData {
  id?: string;
  entity_id: string;
  field_name: string;
  field_value: string;
  field_type: 'text' | 'number' | 'boolean' | 'date' | 'json';
  created_at?: string;
  updated_at?: string;
}

export interface ProductWithDetails extends ProductEntity {
  // Pricing & Costs
  price: number;
  cost_per_unit: number;
  
  // Basic Information
  category: 'tea' | 'pastries' | 'packaging' | 'supplies';
  description: string;
  product_type: 'finished_good' | 'ingredient' | 'packaging';
  unit_type: 'pieces' | 'servings' | 'grams' | 'kg' | 'ml' | 'liters';
  
  // Inventory Management
  inventory_count: number;
  minimum_stock: number;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
  
  // Preparation & Service
  preparation_time_minutes: number;
  serving_temperature: string;
  caffeine_level: string;
  
  // Nutritional Information
  calories: number;
  allergens: string;
  
  // Sourcing & Origin
  origin: string;
  supplier_name: string;
  
  // Storage & Shelf Life
  storage_requirements: string;
  shelf_life_days: number;
  
  // Metadata
  is_draft: boolean;
  created_by: string;
  updated_by: string;
}

export interface ProductInput {
  organizationId: string;
  entity_name: string;
  entity_code: string;
  fields: {
    // Pricing & Costs
    price?: number;
    cost_per_unit?: number;
    
    // Basic Information
    category?: string;
    description?: string;
    product_type?: string;
    unit_type?: string;
    
    // Inventory Management
    inventory_count?: number;
    minimum_stock?: number;
    status?: string;
    
    // Preparation & Service
    preparation_time_minutes?: number;
    serving_temperature?: string;
    caffeine_level?: string;
    
    // Nutritional Information
    calories?: number;
    allergens?: string;
    
    // Sourcing & Origin
    origin?: string;
    supplier_name?: string;
    
    // Storage & Shelf Life
    storage_requirements?: string;
    shelf_life_days?: number;
    
    // Metadata
    is_draft?: boolean;
    created_by?: string;
    updated_by?: string;
  };
}

export interface ProductFormData {
  // Basic Information
  entity_name: string;
  entity_code: string;
  category: 'tea' | 'pastries' | 'packaging' | 'supplies';
  product_type: 'finished_good' | 'ingredient' | 'packaging';
  description: string;
  
  // Pricing & Costs
  price: number;
  cost_per_unit: number;
  
  // Inventory
  inventory_count: number;
  minimum_stock: number;
  unit_type: 'pieces' | 'servings' | 'grams' | 'kg' | 'ml' | 'liters';
  
  // Details
  preparation_time_minutes: number;
  calories: number;
  allergens: string;
  serving_temperature: string;
  caffeine_level: string;
  origin: string;
  
  // Advanced
  supplier_name: string;
  storage_requirements: string;
  shelf_life_days: number;
}

export interface ProductSearchFilters {
  category?: string;
  status?: string;
  product_type?: string;
  price_min?: number;
  price_max?: number;
  in_stock_only?: boolean;
}

export interface ProductStats {
  totalProducts: number;
  inStock: number;
  lowStock: number;
  outOfStock: number;
  totalValue: number;
  averagePrice: number;
  averageCost: number;
}

export interface ProductAnalytics extends ProductStats {
  topCategories: Array<{
    category: string;
    count: number;
    percentage: number;
  }>;
  lowStockItems: ProductWithDetails[];
  highValueItems: ProductWithDetails[];
  recentlyAdded: ProductWithDetails[];
  mostPopular: ProductWithDetails[];
}

export interface ProductCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  product_count: number;
  total_value: number;
}

export interface ProductSupplier {
  id: string;
  name: string;
  contact_info: string;
  products: ProductWithDetails[];
  total_value: number;
  reliability_rating: number;
}

export interface InventoryAdjustment {
  id: string;
  product_id: string;
  adjustment_type: 'increase' | 'decrease' | 'set';
  old_quantity: number;
  new_quantity: number;
  adjustment_amount: number;
  reason: string;
  adjusted_by: string;
  adjusted_at: string;
}

export interface ProductValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ProductValidationResult {
  isValid: boolean;
  errors: ProductValidationError[];
  warnings: ProductValidationError[];
}

// AI Suggestion Types
export interface AIProductSuggestion {
  type: 'description' | 'pricing' | 'category' | 'supplier' | 'allergens';
  title: string;
  value: string;
  confidence: number;
  reasoning: string;
}

export interface AIProductAnalysis {
  suggestions: AIProductSuggestion[];
  similar_products: ProductWithDetails[];
  market_insights: {
    average_price: number;
    price_range: [number, number];
    competition_level: 'low' | 'medium' | 'high';
  };
  optimization_tips: string[];
}

// Bulk Operations
export interface BulkProductOperation {
  operation: 'update' | 'delete' | 'archive' | 'inventory_adjust';
  product_ids: string[];
  data?: any;
  options?: {
    dry_run?: boolean;
    continue_on_error?: boolean;
  };
}

export interface BulkOperationResult {
  success_count: number;
  error_count: number;
  errors: Array<{
    product_id: string;
    error: string;
  }>;
  results: Array<{
    product_id: string;
    success: boolean;
    data?: any;
  }>;
}

// Import/Export Types
export interface ProductImportRow {
  entity_name: string;
  entity_code: string;
  category: string;
  product_type: string;
  description: string;
  price: number;
  cost_per_unit: number;
  inventory_count: number;
  minimum_stock: number;
  unit_type: string;
  preparation_time_minutes: number;
  calories: number;
  allergens: string;
  serving_temperature: string;
  caffeine_level: string;
  origin: string;
  supplier_name: string;
  storage_requirements: string;
  shelf_life_days: number;
}

export interface ProductImportResult {
  total_rows: number;
  successful_imports: number;
  failed_imports: number;
  errors: Array<{
    row: number;
    product_name: string;
    error: string;
  }>;
  imported_products: ProductWithDetails[];
}

export interface ProductExportOptions {
  format: 'csv' | 'excel' | 'json';
  filters?: ProductSearchFilters;
  fields?: string[];
  include_inactive?: boolean;
}

// Real-time Updates
export interface ProductRealtimeEvent {
  event_type: 'INSERT' | 'UPDATE' | 'DELETE';
  table: 'core_entities' | 'core_dynamic_data';
  old_record?: any;
  new_record?: any;
  product_id?: string;
  organization_id: string;
  timestamp: string;
}

export interface ProductSubscriptionOptions {
  organization_id: string;
  product_ids?: string[];
  event_types?: ProductRealtimeEvent['event_type'][];
  debounce_ms?: number;
}

// Form States
export interface ProductFormState {
  data: ProductFormData;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isDirty: boolean;
  isSubmitting: boolean;
  currentStep: number;
  maxSteps: number;
}

export interface ProductFormStep {
  id: number;
  name: string;
  icon: string;
  required: boolean;
  fields: string[];
  validation: (data: ProductFormData) => ProductValidationResult;
}

// Search and Filtering
export interface ProductSearchOptions {
  query?: string;
  filters?: ProductSearchFilters;
  sort_by?: 'name' | 'code' | 'price' | 'cost' | 'inventory' | 'created_at' | 'updated_at';
  sort_order?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface ProductSearchResult {
  products: ProductWithDetails[];
  total_count: number;
  has_more: boolean;
  facets: {
    categories: Array<{ name: string; count: number }>;
    statuses: Array<{ name: string; count: number }>;
    price_ranges: Array<{ range: string; count: number }>;
  };
}

// Audit Trail
export interface ProductAuditLog {
  id: string;
  product_id: string;
  action: 'create' | 'update' | 'delete' | 'inventory_adjust';
  changes: Record<string, { old_value: any; new_value: any }>;
  performed_by: string;
  performed_at: string;
  reason?: string;
  metadata?: Record<string, any>;
}

export interface ProductAuditQuery {
  product_id?: string;
  action?: ProductAuditLog['action'];
  performed_by?: string;
  date_from?: string;
  date_to?: string;
  limit?: number;
  offset?: number;
}

// Notifications
export interface ProductNotification {
  id: string;
  type: 'low_stock' | 'out_of_stock' | 'price_change' | 'supplier_issue';
  product_id: string;
  product_name: string;
  message: string;
  severity: 'info' | 'warning' | 'error';
  read: boolean;
  created_at: string;
  action_required: boolean;
  action_url?: string;
}