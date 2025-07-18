# HERA Universal Transaction Services

This directory contains the service layer for HERA Universal's transaction processing system, implementing a revolutionary Universal Transaction Architecture that consolidates all business operations into a unified schema.

## 🚀 **Architecture Overview**

### **Universal Transaction Schema**
All business transactions in HERA Universal flow through a unified schema consisting of:
- **`universal_transactions`** - Transaction headers (orders, invoices, payments, etc.)
- **`universal_transaction_lines`** - Line items for each transaction  
- **`core_metadata`** - Rich context and business intelligence data

### **Dual Schema Support**
- **Primary**: Universal Transaction Schema (preferred)
- **Fallback**: Entity-based Schema (`core_entities` + `core_metadata`)

## 📁 **Service Files**

### **✅ universalTransactionService.ts**
**Primary transaction processing service using universal_transactions schema**

#### Features:
- Complete restaurant order lifecycle management
- Real-time transaction processing with Supabase
- Automatic tax calculation and totals
- Rich metadata storage for customer context
- Status management (PENDING → READY → COMPLETED)
- Real-time subscriptions for live updates

#### Example Usage:
```typescript
import { UniversalTransactionService } from '@/lib/services/universalTransactionService';

// Create a new order
const result = await UniversalTransactionService.createOrder({
  organizationId: 'org-123',
  customerName: 'John Smith',
  tableNumber: 'Table 5',
  orderType: 'dine_in',
  items: [{
    productId: 'prod-456',
    productName: 'Jasmine Tea',
    quantity: 1,
    unitPrice: 4.50
  }]
});

// Load all orders
const orders = await UniversalTransactionService.fetchOrders('org-123');

// Update order status
await UniversalTransactionService.updateOrderStatus(orderId, 'READY');

// Real-time subscriptions
const subscription = UniversalTransactionService.subscribeToOrderChanges(
  organizationId,
  (payload) => handleOrderUpdate(payload)
);
```

### **✅ orderService.ts**
**Legacy order service using core_entities + core_metadata (fallback)**

#### Features:
- Entity-based order management
- Metadata-driven field storage
- Type conversion and validation
- Search and filtering capabilities
- Customer management integration

#### Example Usage:
```typescript
import { OrderService } from '@/lib/services/orderService';

// Create order using entity schema
const order = await OrderService.createOrder({
  organizationId: 'org-123',
  entity_name: 'Table 5 Order',
  entity_code: 'ORD-001',
  fields: {
    customer_name: 'John Smith',
    total_amount: 7.75,
    status: 'pending',
    items: JSON.stringify([...])
  }
});

// Fetch orders
const orders = await OrderService.fetchOrders('org-123');
```

### **✅ productService.ts**
**Product catalog management using core_entities + core_metadata**

#### Features:
- Complete product lifecycle management
- Category-based organization
- Stock level tracking
- Price and cost management
- Search and filtering

#### Example Usage:
```typescript
import { ProductService } from '@/lib/services/productService';

// Create product
const product = await ProductService.createProduct({
  organizationId: 'org-123',
  entity_name: 'Premium Jasmine Tea',
  entity_code: 'TEA-001',
  fields: {
    category: 'tea',
    price: 4.50,
    inventory_count: 100,
    description: 'Premium jasmine green tea'
  }
});
```

## 🔄 **Transaction Flow**

### **Order Creation Process**
1. **Universal Transaction Creation**
   ```sql
   INSERT INTO universal_transactions (
     transaction_type: 'SALES_ORDER',
     transaction_number: 'ORD-20240115-001',
     status: 'PENDING',
     total_amount: 7.75
   )
   ```

2. **Line Items Creation**
   ```sql
   INSERT INTO universal_transaction_lines (
     transaction_id: '...',
     entity_id: 'product-id',
     line_description: 'Jasmine Tea',
     quantity: 1,
     unit_price: 4.50,
     line_amount: 4.50
   )
   ```

3. **Metadata Storage**
   ```sql
   INSERT INTO core_metadata (
     entity_type: 'transaction',
     metadata_type: 'order_context',
     metadata_value: '{
       "table_number": "Table 5",
       "special_instructions": "Extra hot"
     }'
   )
   ```

### **Status Updates**
Orders progress through defined states:
- **PENDING** - Order received, awaiting preparation
- **READY** - Order prepared, ready for pickup/delivery
- **COMPLETED** - Order delivered to customer
- **CANCELLED** - Order cancelled

## 🎯 **Implementation Priority**

### **Primary (Universal Transactions)**
1. **UniversalTransactionService.createOrder()** - Always try first
2. **UniversalTransactionService.fetchOrders()** - Primary data source
3. **UniversalTransactionService.updateOrderStatus()** - Real-time updates

### **Fallback (Entity Schema)**
1. **OrderService.createOrder()** - If universal transactions fail
2. **OrderService.fetchOrders()** - If no universal data found
3. **OrderService.updateOrderStatus()** - Legacy status updates

### **Support Systems**
- **ProductService** - Product catalog for order line items
- **Real-time subscriptions** - Live updates across all clients
- **Error handling** - Graceful degradation between systems

## 🌐 **Real-Time Features**

### **Live Transaction Updates**
```typescript
// Subscribe to all transaction changes
const subscription = UniversalTransactionService.subscribeToOrderChanges(
  organizationId,
  (payload) => {
    console.log('Transaction updated:', payload);
    // Update UI in real-time
    refreshOrderDisplay();
  }
);
```

### **Kitchen Display Integration**
Real-time order status updates automatically notify:
- Kitchen staff when new orders arrive
- Servers when orders are ready
- Customers via mobile app notifications

## 📊 **Data Structure**

### **Universal Transaction**
```typescript
interface UniversalTransaction {
  id: string;
  organization_id: string;
  transaction_type: 'SALES_ORDER' | 'PURCHASE_ORDER' | 'PAYMENT';
  transaction_number: string;  // 'ORD-20240115-001'
  transaction_date: string;
  total_amount: number;
  currency: string;
  status: 'PENDING' | 'READY' | 'COMPLETED' | 'CANCELLED';
}
```

### **Transaction Line Item**
```typescript
interface UniversalTransactionLine {
  id: string;
  transaction_id: string;
  entity_id: string;         // Product ID
  line_description: string;  // Product name
  quantity: number;
  unit_price: number;
  line_amount: number;       // quantity * unit_price
  line_order: number;        // Display order
}
```

## 🛠️ **Development Guidelines**

### **Service Layer Pattern**
1. **Static Methods** - All service methods are static for easy import
2. **Error Handling** - Comprehensive try/catch with fallback strategies
3. **Type Safety** - Full TypeScript integration with proper interfaces
4. **Performance** - Optimized queries with selective field loading

### **Adding New Transaction Types**
```typescript
// 1. Add to UniversalTransactionService
static async createInvoice(invoiceInput: InvoiceInput) {
  // Create with transaction_type: 'VENDOR_INVOICE'
}

// 2. Add real-time subscription
static subscribeToInvoiceChanges(orgId: string, callback: Function) {
  // Subscribe to transaction_type: 'VENDOR_INVOICE'
}

// 3. Add to orders page integration
const invoiceResult = await UniversalTransactionService.createInvoice({...});
```

## 🔧 **Testing**

### **Service Testing**
```typescript
// Test order creation
const result = await UniversalTransactionService.createOrder({
  organizationId: 'test-org',
  customerName: 'Test Customer',
  items: [{ productId: 'test-product', quantity: 1, unitPrice: 10 }]
});

expect(result.success).toBe(true);
expect(result.orderNumber).toMatch(/^ORD-\d{8}-\d{3}$/);
```

### **Integration Testing**
- Orders page at `/restaurant/orders`
- Create new order through UI
- Verify data persists in Supabase
- Test real-time updates across browser tabs

## 🚀 **Performance Optimizations**

### **Query Optimization**
- Selective field loading with explicit `select()` clauses
- Indexed queries on `organization_id` and `transaction_type`
- Batch operations for multiple line items

### **Real-Time Efficiency**
- Targeted subscriptions to specific transaction types
- Payload filtering to reduce unnecessary updates
- Automatic subscription cleanup on unmount

### **Caching Strategy**
- Order lists cached in React state
- Real-time updates merge with cached data
- Optimistic updates for better UX

This service layer provides the foundation for HERA Universal's revolutionary transaction processing system, enabling real-time, scalable, and intelligent business operations.