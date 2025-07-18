/**
 * React Hooks for Restaurant API Integration
 * Provides real-time data management and optimistic updates
 */

import { useState, useEffect, useCallback } from 'react';
import { useRestaurantAuth } from '@/hooks/useRestaurantAuth';
import RestaurantAPI, { 
  MenuItem, 
  RestaurantTransaction, 
  RestaurantTable,
  CreateOrderRequest,
  UpdateOrderStatusRequest,
  ProcessPaymentRequest,
  InventoryUpdateRequest
} from '@/services/restaurant/restaurantAPI';

// Default organization ID (should come from auth context)
const DEFAULT_ORGANIZATION_ID = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';

// ===================================================================
// BASE HOOK
// ===================================================================

export const useRestaurantAPI = () => {
  const { staff } = useRestaurantAuth();
  const organizationId = staff?.restaurant_id || DEFAULT_ORGANIZATION_ID;
  
  const api = new RestaurantAPI(organizationId);
  
  return api;
};

// ===================================================================
// MENU HOOKS
// ===================================================================

export const useMenuItems = (categoryId?: string) => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const api = useRestaurantAPI();

  const fetchMenuItems = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const items = await api.menu.getMenuItems(categoryId);
      setMenuItems(items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch menu items');
    } finally {
      setLoading(false);
    }
  }, [api, categoryId]);

  useEffect(() => {
    fetchMenuItems();
  }, [fetchMenuItems]);

  return {
    menuItems,
    loading,
    error,
    refetch: fetchMenuItems
  };
};

export const usePopularItems = (limit: number = 10) => {
  const [popularItems, setPopularItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const api = useRestaurantAPI();

  const fetchPopularItems = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const items = await api.menu.getPopularItems(limit);
      setPopularItems(items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch popular items');
    } finally {
      setLoading(false);
    }
  }, [api, limit]);

  useEffect(() => {
    fetchPopularItems();
  }, [fetchPopularItems]);

  return {
    popularItems,
    loading,
    error,
    refetch: fetchPopularItems
  };
};

// ===================================================================
// ORDER HOOKS
// ===================================================================

export const useOrders = () => {
  const [orders, setOrders] = useState<RestaurantTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const api = useRestaurantAPI();

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const activeOrders = await api.orders.getActiveOrders();
      setOrders(activeOrders);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  }, [api]);

  const createOrder = useCallback(async (orderData: CreateOrderRequest) => {
    try {
      const { staff } = useRestaurantAuth();
      const userId = staff?.email || 'unknown';
      
      const newOrder = await api.orders.createOrder(orderData, userId);
      
      // Optimistic update
      setOrders(prev => [newOrder, ...prev]);
      
      return newOrder;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create order';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [api]);

  const updateOrderStatus = useCallback(async (request: UpdateOrderStatusRequest) => {
    try {
      const { staff } = useRestaurantAuth();
      const userId = staff?.email || 'unknown';
      
      await api.orders.updateOrderStatus(request, userId);
      
      // Optimistic update
      setOrders(prev => prev.map(order => 
        order.id === request.order_id
          ? {
              ...order,
              procurement_metadata: {
                ...order.procurement_metadata,
                ...(request.kitchen_status && { kitchen_status: request.kitchen_status }),
                ...(request.payment_status && { payment_status: request.payment_status })
              }
            }
          : order
      ));
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update order status';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [api]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Real-time subscription
  useEffect(() => {
    const subscription = api.subscribeToOrders((payload) => {
      const { eventType, new: newRecord, old: oldRecord } = payload;
      
      setOrders(prev => {
        switch (eventType) {
          case 'INSERT':
            return [newRecord, ...prev];
          case 'UPDATE':
            return prev.map(order => 
              order.id === newRecord.id ? newRecord : order
            );
          case 'DELETE':
            return prev.filter(order => order.id !== oldRecord.id);
          default:
            return prev;
        }
      });
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [api]);

  return {
    orders,
    loading,
    error,
    createOrder,
    updateOrderStatus,
    refetch: fetchOrders
  };
};

export const useChefHatOrders = () => {
  const [kitchenOrders, setChefHatOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const api = useRestaurantAPI();

  const fetchChefHatOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get orders that need kitchen attention
      const orders = await api.orders.getActiveOrders();
      const kitchenOrders = orders.filter(order => 
        order.procurement_metadata?.kitchen_status !== 'completed' &&
        order.procurement_metadata?.kitchen_status !== 'served'
      );
      
      setChefHatOrders(kitchenOrders);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch kitchen orders');
    } finally {
      setLoading(false);
    }
  }, [api]);

  const updateChefHatStatus = useCallback(async (orderId: string, status: string) => {
    try {
      const { staff } = useRestaurantAuth();
      const userId = staff?.email || 'unknown';
      
      await api.orders.updateOrderStatus({
        order_id: orderId,
        kitchen_status: status as any
      }, userId);
      
      // Optimistic update
      setChefHatOrders(prev => prev.map(order => 
        order.id === orderId
          ? {
              ...order,
              procurement_metadata: {
                ...order.procurement_metadata,
                kitchen_status: status
              }
            }
          : order
      ));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update kitchen status';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [api]);

  useEffect(() => {
    fetchChefHatOrders();
  }, [fetchChefHatOrders]);

  return {
    kitchenOrders,
    loading,
    error,
    updateChefHatStatus,
    refetch: fetchChefHatOrders
  };
};

// ===================================================================
// TABLE HOOKS
// ===================================================================

export const useTables = () => {
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const api = useRestaurantAPI();

  const fetchTables = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const tablesData = await api.tables.getTables();
      setTables(tablesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tables');
    } finally {
      setLoading(false);
    }
  }, [api]);

  const getTableStatus = useCallback(async (tableId: string) => {
    try {
      return await api.tables.getTableStatus(tableId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get table status';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [api]);

  useEffect(() => {
    fetchTables();
  }, [fetchTables]);

  return {
    tables,
    loading,
    error,
    getTableStatus,
    refetch: fetchTables
  };
};

// ===================================================================
// PAYMENT HOOKS
// ===================================================================

export const usePayments = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const api = useRestaurantAPI();

  const processPayment = useCallback(async (paymentData: ProcessPaymentRequest) => {
    try {
      setLoading(true);
      setError(null);
      
      const { staff } = useRestaurantAuth();
      const userId = staff?.email || 'unknown';
      
      const payment = await api.payments.processPayment(paymentData, userId);
      
      return payment;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to process payment';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [api]);

  return {
    processPayment,
    loading,
    error
  };
};

// ===================================================================
// INVENTORY HOOKS
// ===================================================================

export const useInventory = () => {
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const api = useRestaurantAPI();

  const fetchInventory = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const inventoryData = await api.inventory.getInventoryStatus();
      setInventory(inventoryData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch inventory');
    } finally {
      setLoading(false);
    }
  }, [api]);

  const updateInventoryStock = useCallback(async (request: InventoryUpdateRequest) => {
    try {
      const { staff } = useRestaurantAuth();
      const userId = staff?.email || 'unknown';
      
      await api.inventory.updateInventoryStock(request, userId);
      
      // Optimistic update
      setInventory(prev => prev.map(item => 
        item.item_id === request.item_id
          ? {
              ...item,
              current_stock: item.current_stock + request.quantity_change
            }
          : item
      ));
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update inventory';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [api]);

  const getCriticalStockItems = useCallback(async () => {
    try {
      return await api.inventory.getCriticalStockItems();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get critical stock items';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [api]);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  // Real-time inventory alerts
  useEffect(() => {
    const subscription = api.subscribeToInventoryAlerts((payload) => {
      // Handle inventory alerts
      console.log('Inventory alert:', payload);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [api]);

  return {
    inventory,
    loading,
    error,
    updateInventoryStock,
    getCriticalStockItems,
    refetch: fetchInventory
  };
};

// ===================================================================
// ANALYTICS HOOKS
// ===================================================================

export const useAnalytics = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const api = useRestaurantAPI();

  const getDailySales = useCallback(async (date?: string) => {
    try {
      setLoading(true);
      setError(null);
      const sales = await api.analytics.getDailySales(date);
      return sales;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get daily sales';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [api]);

  const getPopularItems = useCallback(async (days: number = 30) => {
    try {
      setLoading(true);
      setError(null);
      const items = await api.analytics.getPopularItems(days);
      return items;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get popular items';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [api]);

  return {
    getDailySales,
    getPopularItems,
    loading,
    error
  };
};

// ===================================================================
// COMPOSITE HOOKS
// ===================================================================

export const useRestaurantDashboard = () => {
  const { orders, loading: ordersLoading } = useOrders();
  const { inventory, loading: inventoryLoading } = useInventory();
  const { tables, loading: tablesLoading } = useTables();
  const { getDailySales } = useAnalytics();

  const [dailySales, setDailySales] = useState<any>(null);
  const [dashboardLoading, setDashboardLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const sales = await getDailySales();
        setDailySales(sales);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setDashboardLoading(false);
      }
    };

    fetchDashboardData();
  }, [getDailySales]);

  const loading = ordersLoading || inventoryLoading || tablesLoading || dashboardLoading;

  // Calculate dashboard metrics
  const activeOrders = orders?.filter(order => 
    order.procurement_metadata?.kitchen_status !== 'completed'
  ) || [];

  const criticalInventory = inventory?.filter(item => 
    item.stock_status === 'critical'
  ) || [];

  const occupiedTables = tables?.filter(table => 
    table.current_status === 'occupied'
  ) || [];

  return {
    activeOrders,
    criticalInventory,
    occupiedTables,
    dailySales,
    loading,
    totalTables: tables?.length || 0,
    totalRevenue: dailySales?.total_revenue || 0,
    totalOrders: dailySales?.total_orders || 0
  };
};

// ===================================================================
// REAL-TIME NOTIFICATION HOOKS
// ===================================================================

export const useRestaurantNotifications = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const api = useRestaurantAPI();

  useEffect(() => {
    // Subscribe to various real-time events
    const orderSubscription = api.subscribeToOrders((payload) => {
      if (payload.eventType === 'INSERT') {
        setNotifications(prev => [...prev, {
          id: Date.now(),
          type: 'order',
          message: `New order received: ${payload.new.transaction_number}`,
          timestamp: new Date(),
          data: payload.new
        }]);
      }
    });

    const inventorySubscription = api.subscribeToInventoryAlerts((payload) => {
      setNotifications(prev => [...prev, {
        id: Date.now(),
        type: 'inventory',
        message: `Low stock alert: ${payload.item_name}`,
        timestamp: new Date(),
        data: payload
      }]);
    });

    return () => {
      orderSubscription.unsubscribe();
      inventorySubscription.unsubscribe();
    };
  }, [api]);

  const clearNotification = useCallback((id: number) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  return {
    notifications,
    clearNotification,
    clearAllNotifications
  };
};

export default useRestaurantAPI;