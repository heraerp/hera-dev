export type RestaurantRole = 'admin' | 'manager' | 'waiter' | 'chef' | 'cashier' | 'host';

export interface RestaurantPermission {
  id: string;
  name: string;
  description: string;
  category: 'orders' | 'payments' | 'kitchen' | 'inventory' | 'reports' | 'settings' | 'staff';
}

export interface RestaurantStaff {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: RestaurantRole;
  permissions: string[];
  restaurantId: string;
  employeeId?: string;
  phone?: string;
  shiftSchedule?: ShiftSchedule[];
  isActive: boolean;
  hourlyRate?: number;
  department?: string;
  hireDate: string;
  lastLogin?: string;
  preferences?: StaffPreferences;
}

export interface ShiftSchedule {
  dayOfWeek: number; // 0-6, Sunday to Saturday
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  isActive: boolean;
}

export interface StaffPreferences {
  language: string;
  notifications: {
    newOrders: boolean;
    orderReady: boolean;
    lowInventory: boolean;
    shiftReminders: boolean;
  };
  theme: 'light' | 'dark' | 'auto';
  defaultView: string;
}

export interface RestaurantSession {
  user: RestaurantStaff;
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  permissions: string[];
  restaurant: {
    id: string;
    name: string;
    type: string;
    timezone: string;
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
  restaurantId?: string;
}

export interface AuthError {
  code: string;
  message: string;
  details?: any;
}

// Permission definitions
export const RESTAURANT_PERMISSIONS: { [key: string]: RestaurantPermission } = {
  // Orders
  'orders.view': {
    id: 'orders.view',
    name: 'View Orders',
    description: 'Can view all orders',
    category: 'orders'
  },
  'orders.create': {
    id: 'orders.create',
    name: 'Create Orders',
    description: 'Can create new orders',
    category: 'orders'
  },
  'orders.edit': {
    id: 'orders.edit',
    name: 'Edit Orders',
    description: 'Can modify existing orders',
    category: 'orders'
  },
  'orders.cancel': {
    id: 'orders.cancel',
    name: 'Cancel Orders',
    description: 'Can cancel orders',
    category: 'orders'
  },
  'orders.refund': {
    id: 'orders.refund',
    name: 'Process Refunds',
    description: 'Can process order refunds',
    category: 'orders'
  },
  
  // Payments
  'payments.process': {
    id: 'payments.process',
    name: 'Process Payments',
    description: 'Can process customer payments',
    category: 'payments'
  },
  'payments.refund': {
    id: 'payments.refund',
    name: 'Process Refunds',
    description: 'Can process payment refunds',
    category: 'payments'
  },
  'payments.void': {
    id: 'payments.void',
    name: 'Void Payments',
    description: 'Can void payments',
    category: 'payments'
  },
  'payments.cash_drawer': {
    id: 'payments.cash_drawer',
    name: 'Access Cash Drawer',
    description: 'Can open and access cash drawer',
    category: 'payments'
  },
  
  // ChefHat
  'kitchen.view': {
    id: 'kitchen.view',
    name: 'View ChefHat Display',
    description: 'Can view kitchen display system',
    category: 'kitchen'
  },
  'kitchen.update_status': {
    id: 'kitchen.update_status',
    name: 'Update Order Status',
    description: 'Can update order preparation status',
    category: 'kitchen'
  },
  'kitchen.manage_queue': {
    id: 'kitchen.manage_queue',
    name: 'Manage ChefHat Queue',
    description: 'Can reorder and prioritize kitchen queue',
    category: 'kitchen'
  },
  
  // Inventory
  'inventory.view': {
    id: 'inventory.view',
    name: 'View Inventory',
    description: 'Can view inventory levels',
    category: 'inventory'
  },
  'inventory.update': {
    id: 'inventory.update',
    name: 'Update Inventory',
    description: 'Can update inventory quantities',
    category: 'inventory'
  },
  'inventory.receive': {
    id: 'inventory.receive',
    name: 'Receive Inventory',
    description: 'Can receive and process incoming inventory',
    category: 'inventory'
  },
  
  // Reports
  'reports.view': {
    id: 'reports.view',
    name: 'View Reports',
    description: 'Can view business reports',
    category: 'reports'
  },
  'reports.export': {
    id: 'reports.export',
    name: 'Export Reports',
    description: 'Can export reports to files',
    category: 'reports'
  },
  'reports.financial': {
    id: 'reports.financial',
    name: 'View Financial Reports',
    description: 'Can view financial and sales reports',
    category: 'reports'
  },
  
  // Settings
  'settings.menu': {
    id: 'settings.menu',
    name: 'Manage Menu',
    description: 'Can modify menu items and pricing',
    category: 'settings'
  },
  'settings.restaurant': {
    id: 'settings.restaurant',
    name: 'Restaurant Settings',
    description: 'Can modify restaurant settings',
    category: 'settings'
  },
  'settings.integrations': {
    id: 'settings.integrations',
    name: 'Manage Integrations',
    description: 'Can manage third-party integrations',
    category: 'settings'
  },
  
  // Staff
  'staff.view': {
    id: 'staff.view',
    name: 'View Staff',
    description: 'Can view staff information',
    category: 'staff'
  },
  'staff.manage': {
    id: 'staff.manage',
    name: 'Manage Staff',
    description: 'Can add, edit, and remove staff',
    category: 'staff'
  },
  'staff.schedules': {
    id: 'staff.schedules',
    name: 'Manage Schedules',
    description: 'Can manage staff schedules',
    category: 'staff'
  },
  'staff.payroll': {
    id: 'staff.payroll',
    name: 'Access Payroll',
    description: 'Can access payroll information',
    category: 'staff'
  }
};

// Role-based permission defaults
export const ROLE_PERMISSIONS: { [key in RestaurantRole]: string[] } = {
  admin: Object.keys(RESTAURANT_PERMISSIONS), // All permissions
  
  manager: [
    'orders.view', 'orders.create', 'orders.edit', 'orders.cancel', 'orders.refund',
    'payments.process', 'payments.refund', 'payments.void', 'payments.cash_drawer',
    'kitchen.view', 'kitchen.update_status', 'kitchen.manage_queue',
    'inventory.view', 'inventory.update', 'inventory.receive',
    'reports.view', 'reports.export', 'reports.financial',
    'settings.menu', 'settings.restaurant',
    'staff.view', 'staff.manage', 'staff.schedules'
  ],
  
  waiter: [
    'orders.view', 'orders.create', 'orders.edit',
    'payments.process',
    'kitchen.view',
    'inventory.view'
  ],
  
  chef: [
    'orders.view',
    'kitchen.view', 'kitchen.update_status', 'kitchen.manage_queue',
    'inventory.view', 'inventory.update'
  ],
  
  cashier: [
    'orders.view', 'orders.create',
    'payments.process', 'payments.refund', 'payments.cash_drawer',
    'reports.view'
  ],
  
  host: [
    'orders.view', 'orders.create',
    'reports.view'
  ]
};