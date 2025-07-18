// Order Types for HERA Universal Schema
// Following the universal schema pattern with core_entities and core_metadata

export interface OrderEntity {
  id: string;
  organization_id: string;
  entity_type: 'order';
  entity_name: string;
  entity_code: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface OrderWithDetails extends OrderEntity {
  // Order Information
  customer_id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  
  // Order Details
  order_type: 'dine_in' | 'takeaway' | 'delivery' | 'online';
  table_number: string;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  
  // Timing
  order_time: string;
  estimated_ready_time: string;
  actual_ready_time: string;
  delivery_time: string;
  
  // Financial
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  delivery_fee: number;
  total_amount: number;
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  payment_method: 'cash' | 'card' | 'upi' | 'online' | 'wallet';
  
  // Order Items
  items: OrderItem[];
  
  // Additional Info
  special_instructions: string;
  discount_code: string;
  delivery_address: string;
  staff_notes: string;
  
  // Metadata
  source: 'pos' | 'online' | 'phone' | 'app' | 'walk_in';
  created_by: string;
  updated_by: string;
}

export interface OrderItem {
  id: string;
  product_id: string;
  product_name: string;
  product_code: string;
  category: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  special_instructions: string;
  preparation_time: number;
  status: 'pending' | 'preparing' | 'ready' | 'served';
  customizations: OrderItemCustomization[];
}

export interface OrderItemCustomization {
  id: string;
  name: string;
  value: string;
  price_adjustment: number;
}

export interface OrderInput {
  organizationId: string;
  entity_name: string;
  entity_code: string;
  fields: {
    // Customer Information
    customer_id?: string;
    customer_name?: string;
    customer_phone?: string;
    customer_email?: string;
    
    // Order Details
    order_type?: string;
    table_number?: string;
    status?: string;
    priority?: string;
    
    // Timing
    order_time?: string;
    estimated_ready_time?: string;
    actual_ready_time?: string;
    delivery_time?: string;
    
    // Financial
    subtotal?: number;
    tax_amount?: number;
    discount_amount?: number;
    delivery_fee?: number;
    total_amount?: number;
    payment_status?: string;
    payment_method?: string;
    
    // Order Items (JSON)
    items?: string;
    
    // Additional Info
    special_instructions?: string;
    discount_code?: string;
    delivery_address?: string;
    staff_notes?: string;
    
    // Metadata
    source?: string;
    created_by?: string;
    updated_by?: string;
  };
}

export interface OrderSearchFilters {
  status?: string;
  order_type?: string;
  payment_status?: string;
  date_from?: string;
  date_to?: string;
  customer_name?: string;
  table_number?: string;
  priority?: string;
  source?: string;
}

export interface OrderStats {
  totalOrders: number;
  pendingOrders: number;
  preparingOrders: number;
  readyOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  todayRevenue: number;
  averageOrderValue: number;
  averagePreparationTime: number;
}

export interface OrderAnalytics extends OrderStats {
  ordersByHour: Array<{
    hour: number;
    count: number;
    revenue: number;
  }>;
  ordersByType: Array<{
    type: string;
    count: number;
    percentage: number;
  }>;
  topItems: Array<{
    product_name: string;
    quantity: number;
    revenue: number;
  }>;
  customerAnalytics: {
    newCustomers: number;
    returningCustomers: number;
    averageOrdersPerCustomer: number;
  };
}

export interface OrderFormData {
  // Customer Information
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  
  // Order Details
  order_type: 'dine_in' | 'takeaway' | 'delivery' | 'online';
  table_number: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  
  // Items
  items: OrderItem[];
  
  // Additional Info
  special_instructions: string;
  discount_code: string;
  delivery_address: string;
  
  // Payment
  payment_method: 'cash' | 'card' | 'upi' | 'online' | 'wallet';
}

export interface OrderStatusUpdate {
  order_id: string;
  new_status: OrderWithDetails['status'];
  updated_by: string;
  notes?: string;
  timestamp: string;
}

export interface OrderChefHatDisplay {
  id: string;
  order_code: string;
  table_number: string;
  order_type: string;
  priority: string;
  status: string;
  order_time: string;
  estimated_ready_time: string;
  items: Array<{
    product_name: string;
    quantity: number;
    special_instructions: string;
    status: string;
    preparation_time: number;
  }>;
  elapsed_time: number;
  is_delayed: boolean;
}

export interface OrderRealtimeEvent {
  event_type: 'INSERT' | 'UPDATE' | 'DELETE';
  table: 'core_entities' | 'core_metadata';
  old_record?: any;
  new_record?: any;
  order_id?: string;
  organization_id: string;
  timestamp: string;
}

export interface OrderValidationError {
  field: string;
  message: string;
  code: string;
}

export interface OrderValidationResult {
  isValid: boolean;
  errors: OrderValidationError[];
  warnings: OrderValidationError[];
}

// Customer Types for Order Management
export interface CustomerEntity {
  id: string;
  organization_id: string;
  entity_type: 'customer';
  entity_name: string;
  entity_code: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CustomerWithDetails extends CustomerEntity {
  // Basic Information
  email: string;
  phone: string;
  preferred_name: string;
  
  // Preferences
  dietary_preferences: string;
  favorite_tea_type: string;
  
  // Loyalty
  loyalty_points: number;
  visit_count: number;
  customer_since: string;
  
  // Order History
  total_orders: number;
  total_spent: number;
  average_order_value: number;
  last_order_date: string;
  
  // Contact
  address: string;
  delivery_instructions: string;
  
  // Metadata
  customer_type: 'regular' | 'vip' | 'new' | 'inactive';
  marketing_consent: boolean;
  created_by: string;
  updated_by: string;
}

export interface CustomerInput {
  organizationId: string;
  entity_name: string;
  entity_code: string;
  fields: {
    email?: string;
    phone?: string;
    preferred_name?: string;
    dietary_preferences?: string;
    favorite_tea_type?: string;
    loyalty_points?: number;
    visit_count?: number;
    customer_since?: string;
    address?: string;
    delivery_instructions?: string;
    customer_type?: string;
    marketing_consent?: boolean;
    created_by?: string;
    updated_by?: string;
  };
}

// Order Notification Types
export interface OrderNotification {
  id: string;
  type: 'new_order' | 'status_update' | 'payment_received' | 'order_delayed' | 'order_ready';
  order_id: string;
  order_code: string;
  message: string;
  severity: 'info' | 'warning' | 'error' | 'success';
  read: boolean;
  created_at: string;
  recipient_type: 'kitchen' | 'cashier' | 'manager' | 'delivery';
}

// Order Export Types
export interface OrderExportOptions {
  format: 'csv' | 'excel' | 'json';
  filters?: OrderSearchFilters;
  fields?: string[];
  include_items?: boolean;
  date_range?: {
    start: string;
    end: string;
  };
}

export interface OrderReport {
  period: string;
  summary: OrderStats;
  trends: {
    order_growth: number;
    revenue_growth: number;
    avg_order_value_change: number;
  };
  insights: string[];
  recommendations: string[];
}

// ChefHat Display Types
export interface ChefHatQueueItem {
  order_id: string;
  order_code: string;
  table_number: string;
  order_type: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  status: 'pending' | 'preparing' | 'ready';
  order_time: string;
  estimated_ready_time: string;
  elapsed_time: number;
  items: OrderItem[];
  is_delayed: boolean;
  special_instructions: string;
}

export interface ChefHatDisplaySettings {
  show_ready_orders: boolean;
  auto_refresh_interval: number;
  sound_alerts: boolean;
  highlight_delayed_orders: boolean;
  group_by_table: boolean;
  show_preparation_times: boolean;
}

// Order Timeline Types
export interface OrderTimelineEvent {
  id: string;
  order_id: string;
  event_type: 'created' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled' | 'payment_received';
  timestamp: string;
  user_id: string;
  user_name: string;
  description: string;
  metadata?: Record<string, any>;
}

export interface OrderTimeline {
  order_id: string;
  events: OrderTimelineEvent[];
  total_duration: number;
  average_step_time: number;
  delays: Array<{
    step: string;
    expected_time: number;
    actual_time: number;
    delay_reason: string;
  }>;
}