/**
 * HERA Universal Waiter System
 * Complete waiter interface for managing tables, orders, and customer service
 * Uses universal tables and universal CRUD patterns
 */

"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UniversalCard, UniversalCardContent, UniversalCardHeader, UniversalCardTitle } from '@/components/theme/UniversalCard';
import { UniversalThemeButton } from '@/components/theme/UniversalThemeButton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useMobileTheme } from '@/hooks/useMobileTheme';
import { useRestaurantManagement } from '@/hooks/useRestaurantManagement';
import { RestaurantNavbar } from '@/components/restaurant/RestaurantNavbar';
import {
  Users,
  Clock,
  CheckCircle,
  AlertTriangle,
  Plus,
  Edit3,
  Trash2,
  Eye,
  Coffee,
  Utensils,
  DollarSign,
  User,
  MapPin,
  Timer,
  Bell,
  Receipt,
  CreditCard,
  RefreshCw,
  ChefHat,
  Star,
  MessageSquare,
  Phone,
  Calendar,
  Hash,
  UserCheck,
  Loader2
} from 'lucide-react';

// Waiter system interfaces
interface Table {
  id: string;
  number: string;
  seats: number;
  status: 'available' | 'occupied' | 'reserved' | 'cleaning';
  waiter?: string;
  currentOrder?: string;
  lastActivity?: string;
  section?: string;
  type?: 'indoor' | 'outdoor' | 'bar' | 'private';
}

interface Order {
  id: string;
  orderNumber: string;
  tableId: string;
  tableNumber: string;
  customerName?: string;
  customerPhone?: string;
  items: OrderItem[];
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'served' | 'completed';
  totalAmount: number;
  waiterName: string;
  orderTime: string;
  notes?: string;
  paymentStatus?: 'pending' | 'paid' | 'partial';
  estimatedTime?: number;
}

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  category: string;
  notes?: string;
  status?: 'pending' | 'preparing' | 'ready' | 'served';
}

interface Customer {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  preferences?: string[];
  allergies?: string[];
  visitCount: number;
  totalSpent: number;
  lastVisit?: string;
  notes?: string;
}

interface WaiterStats {
  tablesServed: number;
  ordersCompleted: number;
  totalSales: number;
  averageOrderValue: number;
  customerSatisfaction: number;
  activeOrders: number;
}

type WaiterView = 'tables' | 'orders' | 'customers' | 'stats';

export default function WaiterSystem() {
  const { colors, isDark } = useMobileTheme();
  const { restaurantData, loading: authLoading } = useRestaurantManagement();
  const organizationId = restaurantData?.organizationId;

  // Waiter system state
  const [currentView, setCurrentView] = useState<WaiterView>('tables');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [showNewOrderModal, setShowNewOrderModal] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  
  // Data state
  const [tables, setTables] = useState<Table[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [waiterStats, setWaiterStats] = useState<WaiterStats>({
    tablesServed: 0,
    ordersCompleted: 0,
    totalSales: 0,
    averageOrderValue: 0,
    customerSatisfaction: 0,
    activeOrders: 0
  });

  // Current waiter info
  const waiterName = 'John Doe'; // In real app, get from auth
  const waiterSection = 'Section A';

  // Load initial data
  useEffect(() => {
    if (organizationId) {
      loadTables();
      loadOrders();
      loadCustomers();
      loadWaiterStats();
      
      // Set up real-time updates
      const interval = setInterval(() => {
        loadOrders();
        loadWaiterStats();
      }, 30000); // Update every 30 seconds
      
      return () => clearInterval(interval);
    }
  }, [organizationId]);

  // Mock data loading functions (in real app, these would call universal CRUD services)
  const loadTables = async () => {
    // Mock table data
    const mockTables: Table[] = [
      { id: '1', number: '1', seats: 4, status: 'available', section: 'Indoor', type: 'indoor' },
      { id: '2', number: '2', seats: 2, status: 'occupied', waiter: waiterName, currentOrder: 'ORD-001', section: 'Indoor', type: 'indoor' },
      { id: '3', number: '3', seats: 6, status: 'reserved', section: 'Indoor', type: 'indoor' },
      { id: '4', number: '4', seats: 4, status: 'cleaning', section: 'Indoor', type: 'indoor' },
      { id: '5', number: '5', seats: 8, status: 'available', section: 'Outdoor', type: 'outdoor' },
      { id: '6', number: '6', seats: 4, status: 'occupied', waiter: waiterName, currentOrder: 'ORD-002', section: 'Outdoor', type: 'outdoor' },
      { id: '7', number: 'B1', seats: 2, status: 'available', section: 'Bar', type: 'bar' },
      { id: '8', number: 'B2', seats: 2, status: 'occupied', waiter: waiterName, currentOrder: 'ORD-003', section: 'Bar', type: 'bar' },
    ];
    setTables(mockTables);
  };

  const loadOrders = async () => {
    // Mock order data
    const mockOrders: Order[] = [
      {
        id: '1',
        orderNumber: 'ORD-001',
        tableId: '2',
        tableNumber: '2',
        customerName: 'Sarah Johnson',
        customerPhone: '+1-555-0123',
        items: [
          { id: '1', name: 'Caesar Salad', quantity: 1, price: 12.99, category: 'Salads' },
          { id: '2', name: 'Grilled Salmon', quantity: 1, price: 24.99, category: 'Main Course' },
          { id: '3', name: 'Red Wine', quantity: 2, price: 8.99, category: 'Beverages' }
        ],
        status: 'preparing',
        totalAmount: 55.96,
        waiterName: waiterName,
        orderTime: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
        notes: 'No onions in salad',
        paymentStatus: 'pending',
        estimatedTime: 15
      },
      {
        id: '2',
        orderNumber: 'ORD-002',
        tableId: '6',
        tableNumber: '6',
        customerName: 'Mike Chen',
        items: [
          { id: '4', name: 'Margherita Pizza', quantity: 1, price: 18.99, category: 'Pizza' },
          { id: '5', name: 'Garlic Bread', quantity: 1, price: 6.99, category: 'Appetizers' },
          { id: '6', name: 'Coca Cola', quantity: 2, price: 3.99, category: 'Beverages' }
        ],
        status: 'ready',
        totalAmount: 32.96,
        waiterName: waiterName,
        orderTime: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
        paymentStatus: 'pending',
        estimatedTime: 5
      },
      {
        id: '3',
        orderNumber: 'ORD-003',
        tableId: '8',
        tableNumber: 'B2',
        customerName: 'Lisa Davis',
        items: [
          { id: '7', name: 'Craft Beer', quantity: 3, price: 6.99, category: 'Beverages' },
          { id: '8', name: 'Wings', quantity: 1, price: 14.99, category: 'Appetizers' }
        ],
        status: 'served',
        totalAmount: 35.96,
        waiterName: waiterName,
        orderTime: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
        paymentStatus: 'pending',
        estimatedTime: 0
      }
    ];
    setOrders(mockOrders);
  };

  const loadCustomers = async () => {
    // Mock customer data
    const mockCustomers: Customer[] = [
      {
        id: '1',
        name: 'Sarah Johnson',
        phone: '+1-555-0123',
        email: 'sarah.j@email.com',
        preferences: ['No onions', 'Extra sauce'],
        allergies: ['Nuts'],
        visitCount: 5,
        totalSpent: 247.89,
        lastVisit: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        notes: 'Regular customer, likes table by window'
      },
      {
        id: '2',
        name: 'Mike Chen',
        phone: '+1-555-0456',
        preferences: ['Spicy food'],
        visitCount: 3,
        totalSpent: 89.47,
        lastVisit: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '3',
        name: 'Lisa Davis',
        phone: '+1-555-0789',
        preferences: ['Vegetarian'],
        allergies: ['Dairy'],
        visitCount: 8,
        totalSpent: 456.23,
        lastVisit: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        notes: 'VIP customer, always orders wine'
      }
    ];
    setCustomers(mockCustomers);
  };

  const loadWaiterStats = async () => {
    // Mock waiter stats
    const mockStats: WaiterStats = {
      tablesServed: 12,
      ordersCompleted: 8,
      totalSales: 456.78,
      averageOrderValue: 57.10,
      customerSatisfaction: 4.8,
      activeOrders: 3
    };
    setWaiterStats(mockStats);
  };

  // Helper functions
  const getTableStatusColor = (status: string) => {
    switch (status) {
      case 'available': return colors.success;
      case 'occupied': return colors.orange;
      case 'reserved': return colors.info;
      case 'cleaning': return colors.textMuted;
      default: return colors.textMuted;
    }
  };

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return colors.orange;
      case 'confirmed': return colors.info;
      case 'preparing': return colors.warning;
      case 'ready': return colors.success;
      case 'served': return colors.success;
      case 'completed': return colors.textMuted;
      default: return colors.textMuted;
    }
  };

  const formatTime = (timeStr: string) => {
    const time = new Date(timeStr);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    return `${diffHours}h ${diffMinutes % 60}m ago`;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Action handlers
  const handleTableSelect = (tableId: string) => {
    setSelectedTable(selectedTable === tableId ? null : tableId);
  };

  const handleOrderSelect = (orderId: string) => {
    setSelectedOrder(selectedOrder === orderId ? null : orderId);
  };

  const handleNewOrder = () => {
    setShowNewOrderModal(true);
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    setLoading(true);
    try {
      // In real app, this would call universal CRUD service
      setOrders(prev => prev.map(order => 
        order.id === orderId ? { ...order, status: newStatus as any } : order
      ));
      console.log(`Order ${orderId} updated to ${newStatus}`);
    } catch (error) {
      setError('Failed to update order status');
    } finally {
      setLoading(false);
    }
  };

  const handleTableStatusChange = async (tableId: string, newStatus: string) => {
    setLoading(true);
    try {
      // In real app, this would call universal CRUD service
      setTables(prev => prev.map(table => 
        table.id === tableId ? { ...table, status: newStatus as any } : table
      ));
      console.log(`Table ${tableId} updated to ${newStatus}`);
    } catch (error) {
      setError('Failed to update table status');
    } finally {
      setLoading(false);
    }
  };

  const refreshData = () => {
    loadOrders();
    loadWaiterStats();
  };

  // Get filtered data based on current view
  const myTables = tables.filter(table => table.waiter === waiterName || table.status === 'available');
  const myOrders = orders.filter(order => order.waiterName === waiterName);
  const activeOrders = myOrders.filter(order => ['pending', 'confirmed', 'preparing', 'ready', 'served'].includes(order.status));
  const completedOrders = myOrders.filter(order => order.status === 'completed');

  // Loading state
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: colors.background }}>
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" style={{ color: colors.orange }} />
          <p className="text-xl font-semibold mb-2" style={{ color: colors.textPrimary }}>
            Loading Waiter System...
          </p>
          <p style={{ color: colors.textSecondary }}>
            Preparing your workspace
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (!organizationId) {
    return (
      <Alert className="m-6 border-red-200 bg-red-50">
        <AlertTriangle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          Restaurant setup required. Please complete restaurant setup first.
        </AlertDescription>
      </Alert>
    );
  }

  // Render view components
  const renderTablesView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {myTables.map((table) => (
        <motion.div
          key={table.id}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          <UniversalCard 
            variant="interactive"
            className={`cursor-pointer transition-all ${
              selectedTable === table.id ? 'ring-2' : ''
            }`}
            style={{
              ...(selectedTable === table.id ? { 
                borderColor: colors.orange,
                boxShadow: `0 0 0 2px ${colors.orange}33`
              } : {})
            }}
            onClick={() => handleTableSelect(table.id)}
          >
            <UniversalCardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: getTableStatusColor(table.status) }}
                  />
                  <h3 className="font-bold text-lg" style={{ color: colors.textPrimary }}>
                    Table {table.number}
                  </h3>
                </div>
                <Badge 
                  style={{
                    backgroundColor: getTableStatusColor(table.status),
                    color: colors.surface
                  }}
                >
                  {table.status.toUpperCase()}
                </Badge>
              </div>
              
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center" style={{ color: colors.textSecondary }}>
                  <Users className="w-4 h-4 mr-1" />
                  {table.seats} seats
                </div>
                <div className="flex items-center" style={{ color: colors.textSecondary }}>
                  <MapPin className="w-4 h-4 mr-1" />
                  {table.section}
                </div>
              </div>
            </UniversalCardHeader>

            <UniversalCardContent className="space-y-3">
              {table.currentOrder && (
                <div className="p-2 rounded border" style={{ 
                  backgroundColor: colors.surfaceElevated,
                  borderColor: colors.border
                }}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium" style={{ color: colors.textPrimary }}>
                      {table.currentOrder}
                    </span>
                    <div className="flex items-center" style={{ color: colors.textSecondary }}>
                      <Clock className="w-3 h-3 mr-1" />
                      <span className="text-xs">25m ago</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex space-x-2">
                {table.status === 'available' && (
                  <UniversalThemeButton
                    variant="primary"
                    size="sm"
                    fullWidth
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNewOrder();
                    }}
                    icon={<Plus className="w-4 h-4" />}
                  >
                    New Order
                  </UniversalThemeButton>
                )}
                
                {table.status === 'occupied' && (
                  <>
                    <UniversalThemeButton
                      variant="secondary"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTableStatusChange(table.id, 'available');
                      }}
                      icon={<CheckCircle className="w-4 h-4" />}
                    >
                      Clear
                    </UniversalThemeButton>
                    <UniversalThemeButton
                      variant="primary"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentView('orders');
                      }}
                      icon={<Eye className="w-4 h-4" />}
                    >
                      View Order
                    </UniversalThemeButton>
                  </>
                )}
                
                {table.status === 'cleaning' && (
                  <UniversalThemeButton
                    variant="secondary"
                    size="sm"
                    fullWidth
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTableStatusChange(table.id, 'available');
                    }}
                    icon={<CheckCircle className="w-4 h-4" />}
                  >
                    Cleaning Done
                  </UniversalThemeButton>
                )}
              </div>
            </UniversalCardContent>
          </UniversalCard>
        </motion.div>
      ))}
    </div>
  );

  const renderOrdersView = () => (
    <div className="space-y-4">
      {/* Active Orders */}
      <div>
        <h3 className="text-lg font-semibold mb-3" style={{ color: colors.textPrimary }}>
          Active Orders ({activeOrders.length})
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activeOrders.map((order) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <UniversalCard 
                variant="interactive"
                className={`cursor-pointer transition-all ${
                  selectedOrder === order.id ? 'ring-2' : ''
                }`}
                style={{
                  ...(selectedOrder === order.id ? { 
                    borderColor: colors.orange,
                    boxShadow: `0 0 0 2px ${colors.orange}33`
                  } : {})
                }}
                onClick={() => handleOrderSelect(order.id)}
              >
                <UniversalCardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: getOrderStatusColor(order.status) }}
                      />
                      <h3 className="font-bold text-lg" style={{ color: colors.textPrimary }}>
                        {order.orderNumber}
                      </h3>
                    </div>
                    <Badge style={{
                      backgroundColor: getOrderStatusColor(order.status),
                      color: colors.surface
                    }}>
                      {order.status.toUpperCase()}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center" style={{ color: colors.textSecondary }}>
                      <MapPin className="w-4 h-4 mr-1" />
                      Table {order.tableNumber}
                    </div>
                    <div className="flex items-center" style={{ color: colors.textSecondary }}>
                      <User className="w-4 h-4 mr-1" />
                      {order.customerName}
                    </div>
                    <div className="flex items-center" style={{ color: colors.textSecondary }}>
                      <Clock className="w-4 h-4 mr-1" />
                      {formatTime(order.orderTime)}
                    </div>
                  </div>
                </UniversalCardHeader>

                <UniversalCardContent className="space-y-3">
                  {/* Order Items */}
                  <div className="space-y-2">
                    {order.items.slice(0, 3).map((item, index) => (
                      <div key={index} className="flex justify-between items-center text-sm">
                        <span style={{ color: colors.textPrimary }}>
                          {item.quantity}x {item.name}
                        </span>
                        <span style={{ color: colors.textSecondary }}>
                          {formatCurrency(item.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                    {order.items.length > 3 && (
                      <div className="text-xs" style={{ color: colors.textMuted }}>
                        +{order.items.length - 3} more items
                      </div>
                    )}
                  </div>

                  {order.notes && (
                    <div className="p-2 rounded border text-sm" style={{ 
                      backgroundColor: colors.surfaceElevated,
                      borderColor: colors.border,
                      color: colors.textSecondary
                    }}>
                      <MessageSquare className="w-4 h-4 inline mr-1" />
                      {order.notes}
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="w-4 h-4" style={{ color: colors.textSecondary }} />
                      <span className="font-semibold" style={{ color: colors.textPrimary }}>
                        {formatCurrency(order.totalAmount)}
                      </span>
                    </div>
                    {order.estimatedTime && order.estimatedTime > 0 && (
                      <div className="flex items-center space-x-1">
                        <Timer className="w-4 h-4" style={{ color: colors.orange }} />
                        <span className="text-sm" style={{ color: colors.orange }}>
                          {order.estimatedTime}min
                        </span>
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    {order.status === 'pending' && (
                      <UniversalThemeButton
                        variant="primary"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUpdateOrderStatus(order.id, 'confirmed');
                        }}
                        icon={<CheckCircle className="w-4 h-4" />}
                      >
                        Confirm
                      </UniversalThemeButton>
                    )}
                    
                    {order.status === 'ready' && (
                      <UniversalThemeButton
                        variant="primary"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUpdateOrderStatus(order.id, 'served');
                        }}
                        icon={<Utensils className="w-4 h-4" />}
                      >
                        Serve
                      </UniversalThemeButton>
                    )}
                    
                    {order.status === 'served' && (
                      <UniversalThemeButton
                        variant="secondary"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUpdateOrderStatus(order.id, 'completed');
                        }}
                        icon={<Receipt className="w-4 h-4" />}
                      >
                        Complete
                      </UniversalThemeButton>
                    )}
                    
                    <UniversalThemeButton
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        // In real app, open order details modal
                      }}
                      icon={<Eye className="w-4 h-4" />}
                    >
                      Details
                    </UniversalThemeButton>
                  </div>
                </UniversalCardContent>
              </UniversalCard>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStatsView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <UniversalCard variant="elevated">
        <UniversalCardHeader>
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5" style={{ color: colors.orange }} />
            <UniversalCardTitle>Tables Served</UniversalCardTitle>
          </div>
        </UniversalCardHeader>
        <UniversalCardContent>
          <div className="text-3xl font-bold mb-2" style={{ color: colors.textPrimary }}>
            {waiterStats.tablesServed}
          </div>
          <p className="text-sm" style={{ color: colors.textSecondary }}>
            Today's total
          </p>
        </UniversalCardContent>
      </UniversalCard>

      <UniversalCard variant="elevated">
        <UniversalCardHeader>
          <div className="flex items-center space-x-2">
            <Receipt className="w-5 h-5" style={{ color: colors.success }} />
            <UniversalCardTitle>Orders Completed</UniversalCardTitle>
          </div>
        </UniversalCardHeader>
        <UniversalCardContent>
          <div className="text-3xl font-bold mb-2" style={{ color: colors.textPrimary }}>
            {waiterStats.ordersCompleted}
          </div>
          <p className="text-sm" style={{ color: colors.textSecondary }}>
            Successfully completed
          </p>
        </UniversalCardContent>
      </UniversalCard>

      <UniversalCard variant="elevated">
        <UniversalCardHeader>
          <div className="flex items-center space-x-2">
            <DollarSign className="w-5 h-5" style={{ color: colors.info }} />
            <UniversalCardTitle>Total Sales</UniversalCardTitle>
          </div>
        </UniversalCardHeader>
        <UniversalCardContent>
          <div className="text-3xl font-bold mb-2" style={{ color: colors.textPrimary }}>
            {formatCurrency(waiterStats.totalSales)}
          </div>
          <p className="text-sm" style={{ color: colors.textSecondary }}>
            Today's revenue
          </p>
        </UniversalCardContent>
      </UniversalCard>

      <UniversalCard variant="elevated">
        <UniversalCardHeader>
          <div className="flex items-center space-x-2">
            <Hash className="w-5 h-5" style={{ color: colors.warning }} />
            <UniversalCardTitle>Avg Order Value</UniversalCardTitle>
          </div>
        </UniversalCardHeader>
        <UniversalCardContent>
          <div className="text-3xl font-bold mb-2" style={{ color: colors.textPrimary }}>
            {formatCurrency(waiterStats.averageOrderValue)}
          </div>
          <p className="text-sm" style={{ color: colors.textSecondary }}>
            Per order average
          </p>
        </UniversalCardContent>
      </UniversalCard>

      <UniversalCard variant="elevated">
        <UniversalCardHeader>
          <div className="flex items-center space-x-2">
            <Star className="w-5 h-5" style={{ color: colors.orange }} />
            <UniversalCardTitle>Customer Rating</UniversalCardTitle>
          </div>
        </UniversalCardHeader>
        <UniversalCardContent>
          <div className="text-3xl font-bold mb-2" style={{ color: colors.textPrimary }}>
            {waiterStats.customerSatisfaction}/5
          </div>
          <p className="text-sm" style={{ color: colors.textSecondary }}>
            Average satisfaction
          </p>
        </UniversalCardContent>
      </UniversalCard>

      <UniversalCard variant="elevated">
        <UniversalCardHeader>
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5" style={{ color: colors.error }} />
            <UniversalCardTitle>Active Orders</UniversalCardTitle>
          </div>
        </UniversalCardHeader>
        <UniversalCardContent>
          <div className="text-3xl font-bold mb-2" style={{ color: colors.textPrimary }}>
            {waiterStats.activeOrders}
          </div>
          <p className="text-sm" style={{ color: colors.textSecondary }}>
            Currently active
          </p>
        </UniversalCardContent>
      </UniversalCard>
    </div>
  );

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.background }}>
      {/* Restaurant Navbar */}
      <RestaurantNavbar 
        currentSection="Waiter System"
        sectionIcon={<Users className="w-5 h-5" />}
      />

      {/* Waiter Status Bar */}
      <div 
        className="border-b"
        style={{ 
          backgroundColor: isDark ? colors.gray800 : colors.surface,
          borderColor: isDark ? colors.gray700 : colors.border
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            {/* Waiter Info */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <UserCheck className="w-5 h-5" style={{ color: colors.success }} />
                <div>
                  <h2 className="font-semibold" style={{ color: colors.textPrimary }}>
                    {waiterName}
                  </h2>
                  <p className="text-sm" style={{ color: colors.textSecondary }}>
                    {waiterSection}
                  </p>
                </div>
              </div>
              
              {/* Quick Stats */}
              <div className="hidden md:flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-1">
                  <Receipt className="w-4 h-4" style={{ color: colors.textMuted }} />
                  <span style={{ color: colors.textSecondary }}>
                    {activeOrders.length} active
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <DollarSign className="w-4 h-4" style={{ color: colors.textMuted }} />
                  <span style={{ color: colors.textSecondary }}>
                    {formatCurrency(waiterStats.totalSales)}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              <UniversalThemeButton 
                variant="secondary" 
                onClick={refreshData}
                icon={<RefreshCw className="w-4 h-4" />}
                size="sm"
              >
                <span className="hidden sm:inline">Refresh</span>
              </UniversalThemeButton>
              
              <UniversalThemeButton 
                variant="primary" 
                onClick={handleNewOrder}
                icon={<Plus className="w-4 h-4" />}
                size="sm"
              >
                New Order
              </UniversalThemeButton>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Navigation Tabs */}
        <div 
          className="flex space-x-1 rounded-lg p-1 mb-6"
          style={{ 
            backgroundColor: isDark ? colors.gray700 : colors.surfaceElevated,
            border: `1px solid ${isDark ? colors.gray600 : 'transparent'}`
          }}
        >
          {[
            { key: 'tables', label: 'Tables', icon: <MapPin className="w-4 h-4" />, count: myTables.length },
            { key: 'orders', label: 'Orders', icon: <Receipt className="w-4 h-4" />, count: activeOrders.length },
            { key: 'stats', label: 'Statistics', icon: <Star className="w-4 h-4" />, count: null }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setCurrentView(tab.key as WaiterView)}
              className="flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-all"
              style={{
                backgroundColor: currentView === tab.key 
                  ? (isDark ? colors.gray800 : colors.surface) 
                  : 'transparent',
                color: currentView === tab.key ? colors.orange : colors.textSecondary,
                boxShadow: currentView === tab.key 
                  ? (isDark ? `0 2px 4px ${colors.shadow}` : `0 1px 3px ${colors.shadow}`) 
                  : 'none',
                border: currentView === tab.key 
                  ? `1px solid ${isDark ? colors.gray500 : colors.border}` 
                  : '1px solid transparent'
              }}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.count !== null && (
                <Badge 
                  variant="secondary" 
                  className="text-xs border-0"
                  style={{
                    backgroundColor: currentView === tab.key 
                      ? (isDark ? 'rgba(255, 87, 34, 0.2)' : colors.orangeShadow) 
                      : (isDark ? colors.gray700 : colors.surface),
                    color: currentView === tab.key ? colors.orange : colors.textMuted
                  }}
                >
                  {tab.count}
                </Badge>
              )}
            </button>
          ))}
        </div>

        {/* Error Display */}
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        {/* View Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {currentView === 'tables' && renderTablesView()}
            {currentView === 'orders' && renderOrdersView()}
            {currentView === 'stats' && renderStatsView()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}