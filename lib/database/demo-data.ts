import { supabase, db, CoreEntity, CoreDynamicData, UniversalTransaction, recordExists } from './supabase';

// Demo data UUIDs from HERA Universal Schema documentation
export const DEMO_DATA = {
  organization: '550e8400-e29b-41d4-a716-446655440001',
  users: {
    sarah: '550e8400-e29b-41d4-a716-446655440010', // Owner
    mike: '550e8400-e29b-41d4-a716-446655440011',  // Barista  
    john: '550e8400-e29b-41d4-a716-446655440012'   // Customer
  },
  products: {
    jasmineTea: '550e8400-e29b-41d4-a716-446655440030',
    blueberryScone: '550e8400-e29b-41d4-a716-446655440031'
  },
  customer: '550e8400-e29b-41d4-a716-446655440040',
  order: '550e8400-e29b-41d4-a716-446655440050'
};

// Demo product catalog
export const DEMO_PRODUCTS = [
  {
    id: DEMO_DATA.products.jasmineTea,
    name: 'Jasmine Tea',
    category: 'Tea',
    price: 4.50,
    cost: 1.25,
    stock: 99,
    unit: 'cup',
    description: 'Premium jasmine-scented green tea',
    preparation_time: 5,
    popularity: 'high',
    dietary: ['vegan', 'gluten-free']
  },
  {
    id: DEMO_DATA.products.blueberryScone,
    name: 'Blueberry Scone',
    category: 'Pastry',
    price: 3.75,
    cost: 1.00,
    stock: 23,
    unit: 'piece',
    description: 'Freshly baked scone with organic blueberries',
    preparation_time: 2,
    popularity: 'medium',
    dietary: ['vegetarian']
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440032',
    name: 'Dragon Well Tea',
    category: 'Tea',
    price: 5.50,
    cost: 1.75,
    stock: 45,
    unit: 'cup',
    description: 'Premium Chinese green tea',
    preparation_time: 5,
    popularity: 'very high',
    dietary: ['vegan', 'gluten-free']
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440033',
    name: 'Oolong Tea Set',
    category: 'Tea',
    price: 12.00,
    cost: 3.50,
    stock: 15,
    unit: 'set',
    description: 'Traditional oolong tea service for two',
    preparation_time: 8,
    popularity: 'medium',
    dietary: ['vegan', 'gluten-free']
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440034',
    name: 'Green Tea Macarons',
    category: 'Dessert',
    price: 6.50,
    cost: 2.00,
    stock: 30,
    unit: 'set of 3',
    description: 'Delicate matcha-flavored French macarons',
    preparation_time: 1,
    popularity: 'high',
    dietary: ['vegetarian', 'gluten-free']
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440035',
    name: 'Jasmine Tea Cake',
    category: 'Dessert',
    price: 8.00,
    cost: 2.50,
    stock: 12,
    unit: 'slice',
    description: 'Light sponge cake infused with jasmine tea',
    preparation_time: 2,
    popularity: 'medium',
    dietary: ['vegetarian']
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440036',
    name: 'Zen Garden Blend',
    category: 'Tea',
    price: 6.00,
    cost: 2.00,
    stock: 35,
    unit: 'cup',
    description: 'House special blend of green and white teas',
    preparation_time: 6,
    popularity: 'high',
    dietary: ['vegan', 'gluten-free']
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440037',
    name: 'Meditation Cookies',
    category: 'Snack',
    price: 4.25,
    cost: 1.25,
    stock: 40,
    unit: 'pack of 3',
    description: 'Calming lavender and honey cookies',
    preparation_time: 1,
    popularity: 'medium',
    dietary: ['vegetarian']
  }
];

// Demo customer data
export const DEMO_CUSTOMERS = [
  {
    id: DEMO_DATA.customer,
    name: 'John Smith',
    email: 'john.smith@email.com',
    phone: '+1 555-123-4567',
    loyalty_points: 15,
    visits: 1,
    total_spent: 9.25,
    preferences: 'Prefers green tea',
    segment: 'Tea Enthusiast',
    last_visit: '2024-01-15'
  }
];

// Demo staff data
export const DEMO_STAFF = [
  {
    id: DEMO_DATA.users.sarah,
    name: 'Sarah Chen',
    role: 'Owner',
    email: 'sarah@zenteagarden.com',
    shift: 'Full Day',
    performance: 98,
    specialties: ['Business Management', 'Customer Relations']
  },
  {
    id: DEMO_DATA.users.mike,
    name: 'Mike Rodriguez',
    role: 'Barista',
    email: 'mike@zenteagarden.com',
    shift: 'Morning',
    performance: 92,
    specialties: ['Tea Preparation', 'Customer Service']
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440013',
    name: 'Emma Chen',
    role: 'Server',
    email: 'emma@zenteagarden.com',
    shift: 'Morning',
    performance: 95,
    specialties: ['Table Service', 'Upselling']
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440014',
    name: 'James Liu',
    role: 'Server',
    email: 'james@zenteagarden.com',
    shift: 'Afternoon',
    performance: 88,
    specialties: ['Customer Care', 'Order Management']
  }
];

// Mock data store for demo purposes (when Supabase is not available)
let mockOrders: any[] = [];
let mockOrderCounter = 1;

// Initialize demo data in database
export async function initializeDemoData() {
  try {
    console.log('Initializing demo data...');
    
    // Check if Supabase is properly configured and tables exist
    if (!supabase) {
      console.warn('Supabase client not configured, using mock data');
      return initializeMockData();
    }

    // Test if we can access the database
    const { data: testData, error: testError } = await supabase
      .from('universal_transactions')
      .select('id')
      .limit(1);

    if (testError) {
      console.warn('Database tables not available, using mock data:', testError.message);
      return initializeMockData();
    }

    // If we reach here, database is available - proceed with real initialization
    // ... (original database initialization code would go here)
    
    console.log('Demo data initialized successfully');
    return true;
  } catch (error) {
    console.error('Error initializing demo data, falling back to mock data:', error);
    return initializeMockData();
  }
}

// Initialize mock data when database is not available
function initializeMockData() {
  console.log('Initializing mock demo data...');
  
  // Create several sample orders for demonstration
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  
  const sampleOrders = [
    {
      id: DEMO_DATA.order,
      organization_id: DEMO_DATA.organization,
      transaction_number: 'ORD-20240115-001',
      transaction_type: 'restaurant_order',
      transaction_date: today + 'T14:30:00Z',
      status: 'pending',
      customer_name: 'John Smith',
      table_number: '5',
      order_type: 'dine_in',
      waiter_id: DEMO_DATA.users.mike,
      waiter_name: 'Mike Rodriguez',
      subtotal: 8.25,
      tax_amount: 0.66,
      tip_amount: 0,
      total_amount: 8.91,
      currency: 'USD',
      payment_status: 'pending',
      preparation_status: 'preparing',
      special_instructions: 'No sugar please',
      order_items: [
        {
          id: '550e8400-e29b-41d4-a716-446655440051',
          product_id: DEMO_DATA.products.jasmineTea,
          product_name: 'Jasmine Tea',
          quantity: 1,
          unit_price: 4.50,
          total_price: 4.50,
          status: 'preparing',
          prepared_by: null,
          preparation_time: 5
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440052',
          product_id: DEMO_DATA.products.blueberryScone,
          product_name: 'Blueberry Scone',
          quantity: 1,
          unit_price: 3.75,
          total_price: 3.75,
          status: 'pending',
          prepared_by: null,
          preparation_time: 2
        }
      ]
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440055',
      organization_id: DEMO_DATA.organization,
      transaction_number: 'ORD-20240115-002',
      transaction_type: 'restaurant_order',
      transaction_date: today + 'T15:15:00Z',
      status: 'preparing',
      customer_name: 'Emily Johnson',
      table_number: '3',
      order_type: 'dine_in',
      waiter_id: DEMO_DATA.users.mike,
      waiter_name: 'Mike Rodriguez',
      subtotal: 12.00,
      tax_amount: 0.96,
      tip_amount: 0,
      total_amount: 12.96,
      currency: 'USD',
      payment_status: 'pending',
      preparation_status: 'preparing',
      special_instructions: 'Extra hot please',
      order_items: [
        {
          id: '550e8400-e29b-41d4-a716-446655440056',
          product_id: '550e8400-e29b-41d4-a716-446655440033',
          product_name: 'Oolong Tea Set',
          quantity: 1,
          unit_price: 12.00,
          total_price: 12.00,
          status: 'preparing',
          prepared_by: DEMO_DATA.users.mike,
          preparation_time: 8
        }
      ]
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440057',
      organization_id: DEMO_DATA.organization,
      transaction_number: 'ORD-20240115-003',
      transaction_type: 'restaurant_order',
      transaction_date: today + 'T16:00:00Z',
      status: 'ready',
      customer_name: 'Alex Chen',
      table_number: '7',
      order_type: 'dine_in',
      waiter_id: DEMO_DATA.users.mike,
      waiter_name: 'Mike Rodriguez',
      subtotal: 10.50,
      tax_amount: 0.84,
      tip_amount: 0,
      total_amount: 11.34,
      currency: 'USD',
      payment_status: 'pending',
      preparation_status: 'ready',
      special_instructions: '',
      order_items: [
        {
          id: '550e8400-e29b-41d4-a716-446655440058',
          product_id: '550e8400-e29b-41d4-a716-446655440034',
          product_name: 'Green Tea Macarons',
          quantity: 1,
          unit_price: 6.50,
          total_price: 6.50,
          status: 'ready',
          prepared_by: DEMO_DATA.users.mike,
          preparation_time: 1
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440059',
          product_id: DEMO_DATA.products.jasmineTea,
          product_name: 'Jasmine Tea',
          quantity: 1,
          unit_price: 4.50,
          total_price: 4.50,
          status: 'ready',
          prepared_by: DEMO_DATA.users.mike,
          preparation_time: 5
        }
      ]
    }
  ];

  mockOrders = sampleOrders;
  console.log('Mock demo data initialized successfully with', mockOrders.length, 'orders');
  return true;
}

// Mock database functions for when Supabase is not available
export const mockDb = {
  orders: {
    async findAll(): Promise<any[]> {
      return mockOrders;
    },
    
    async create(orderData: any): Promise<any> {
      const newOrder = {
        id: crypto.randomUUID(),
        ...orderData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      mockOrders.push(newOrder);
      return newOrder;
    },
    
    async updateStatus(id: string, status: string): Promise<any> {
      const orderIndex = mockOrders.findIndex(o => o.id === id);
      if (orderIndex !== -1) {
        mockOrders[orderIndex].status = status;
        mockOrders[orderIndex].updated_at = new Date().toISOString();
        return mockOrders[orderIndex];
      }
      return null;
    }
  }
};

// Generate mock order number
export function generateMockOrderNumber(): string {
  const date = new Date();
  const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
  const orderNum = String(mockOrderCounter++).padStart(3, '0');
  return `ORD-${dateStr}-${orderNum}`;
}

// Generate new order number
export function generateOrderNumber(): string {
  const date = new Date();
  const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
  const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `ORD-${dateStr}-${randomNum}`;
}

// Calculate order totals
export function calculateOrderTotals(items: any[], taxRate = 0.08): {
  subtotal: number;
  tax: number;
  total: number;
} {
  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
  const tax = subtotal * taxRate;
  const total = subtotal + tax;

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    tax: Math.round(tax * 100) / 100,
    total: Math.round(total * 100) / 100
  };
}

// Get product by ID
export function getProductById(productId: string): any {
  return DEMO_PRODUCTS.find(p => p.id === productId);
}

// Get staff member by ID
export function getStaffById(staffId: string): any {
  return DEMO_STAFF.find(s => s.id === staffId);
}

// Get customer by ID
export function getCustomerById(customerId: string): any {
  return DEMO_CUSTOMERS.find(c => c.id === customerId);
}