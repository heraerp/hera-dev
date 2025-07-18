'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import UniversalCrudService from '@/lib/services/universalCrudService';
import { RealtimeChannel } from '@supabase/supabase-js';

interface OrderUpdate {
  id: string;
  status: 'draft' | 'submitted' | 'confirmed' | 'preparing' | 'ready' | 'served' | 'paid';
  orderNumber: string;
  tableNumber?: number;
  items: any[];
  total: number;
  estimatedTime: number;
  timestamp: string;
  customerName?: string;
  specialInstructions?: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
}

interface ChefHatUpdate {
  orderId: string;
  status: string;
  estimatedTime?: number;
  notes?: string;
  staffId?: string;
  timestamp: string;
}

interface UseRealtimeOrdersProps {
  restaurantId: string;
  orderType?: 'all' | 'kitchen' | 'pos' | 'service';
  userId?: string;
}

export const useRealtimeOrders = ({ 
  restaurantId, 
  orderType = 'all', 
  userId 
}: UseRealtimeOrdersProps) => {
  const [orders, setOrders] = useState<OrderUpdate[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  
  const supabase = createClient();
  const channelRef = useRef<RealtimeChannel | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);

  // Load initial orders
  const loadInitialOrders = useCallback(async () => {
    try {
      const { data: entities, error } = await supabase
        .from('core_entities')
        .select(`
          *,
          core_dynamic_data!inner(field_name, field_value)
        `)
        .eq('organization_id', restaurantId)
        .eq('entity_type', 'customer_order')
        .in('status', ['submitted', 'confirmed', 'preparing', 'ready'])
        .order('created_at', { ascending: false });

      if (error) throw error;

      const transformedOrders: OrderUpdate[] = entities?.map(entity => {
        const dynamicData = entity.core_dynamic_data || [];
        const dataMap = dynamicData.reduce((acc: any, item: any) => {
          acc[item.field_name] = item.field_value;
          return acc;
        }, {});

        return {
          id: entity.id,
          status: entity.status,
          orderNumber: entity.name,
          tableNumber: parseInt(dataMap.table_number || '0'),
          items: dataMap.order_items ? JSON.parse(dataMap.order_items) : [],
          total: parseFloat(dataMap.order_total || '0'),
          estimatedTime: parseInt(dataMap.estimated_time || '15'),
          timestamp: entity.created_at,
          customerName: dataMap.customer_name,
          specialInstructions: dataMap.special_instructions,
          priority: dataMap.priority || 'normal'
        };
      }) || [];

      setOrders(transformedOrders);
    } catch (error) {
      console.error('Error loading initial orders:', error);
      setConnectionError('Failed to load initial orders');
    }
  }, [restaurantId, supabase]);

  // Transform database row to OrderUpdate
  const transformOrder = useCallback((row: any): OrderUpdate => {
    const metadata = row.metadata || {};
    
    return {
      id: row.id,
      status: row.status,
      orderNumber: row.name,
      tableNumber: metadata.table_number,
      items: metadata.items || [],
      total: metadata.total || 0,
      estimatedTime: metadata.estimated_time || 15,
      timestamp: row.created_at,
      customerName: metadata.customer_name,
      specialInstructions: metadata.special_instructions,
      priority: metadata.priority || 'normal'
    };
  }, []);

  // Handle real-time order updates
  const handleOrderUpdate = useCallback((payload: any) => {
    const { eventType, new: newRow, old: oldRow } = payload;
    
    setLastUpdate(new Date());
    
    switch (eventType) {
      case 'INSERT':
        if (newRow.entity_type === 'customer_order') {
          const newOrder = transformOrder(newRow);
          setOrders(prev => [newOrder, ...prev]);
          
          // Send browser notification for new orders
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(`New Order: ${newOrder.orderNumber}`, {
              body: `Table ${newOrder.tableNumber} - $${newOrder.total}`,
              icon: '/icons/hera-logo.png',
              tag: newOrder.id
            });
          }
        }
        break;
        
      case 'UPDATE':
        if (newRow.entity_type === 'customer_order') {
          const updatedOrder = transformOrder(newRow);
          setOrders(prev => 
            prev.map(order => 
              order.id === updatedOrder.id ? updatedOrder : order
            )
          );
          
          // Notify on status changes
          if (oldRow.status !== newRow.status) {
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification(`Order Update: ${updatedOrder.orderNumber}`, {
                body: `Status changed to ${updatedOrder.status}`,
                icon: '/icons/hera-logo.png',
                tag: updatedOrder.id
              });
            }
          }
        }
        break;
        
      case 'DELETE':
        setOrders(prev => prev.filter(order => order.id !== oldRow.id));
        break;
    }
  }, [transformOrder]);

  // Setup real-time subscription
  const setupRealtimeSubscription = useCallback(() => {
    try {
      // Close existing channel
      if (channelRef.current) {
        channelRef.current.unsubscribe();
      }

      // Create new channel
      const channel = supabase
        .channel(`restaurant-orders-${restaurantId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'core_entities',
            filter: `organization_id=eq.${restaurantId}`
          },
          handleOrderUpdate
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'core_dynamic_data'
          },
          (payload) => {
            // Reload orders when dynamic data changes
            loadInitialOrders();
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            setIsConnected(true);
            setConnectionError(null);
            reconnectAttemptsRef.current = 0;
          } else if (status === 'CHANNEL_ERROR') {
            setIsConnected(false);
            setConnectionError('Real-time connection error');
            attemptReconnect();
          } else if (status === 'TIMED_OUT') {
            setIsConnected(false);
            setConnectionError('Connection timed out');
            attemptReconnect();
          } else if (status === 'CLOSED') {
            setIsConnected(false);
          }
        });

      channelRef.current = channel;
    } catch (error) {
      console.error('Error setting up real-time subscription:', error);
      setConnectionError('Failed to setup real-time connection');
      attemptReconnect();
    }
  }, [restaurantId, supabase, handleOrderUpdate, loadInitialOrders]);

  // Attempt to reconnect with exponential backoff
  const attemptReconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    const maxAttempts = 5;
    const baseDelay = 1000;
    
    if (reconnectAttemptsRef.current < maxAttempts) {
      const delay = baseDelay * Math.pow(2, reconnectAttemptsRef.current);
      
      reconnectTimeoutRef.current = setTimeout(() => {
        reconnectAttemptsRef.current++;
        setupRealtimeSubscription();
      }, delay);
    } else {
      setConnectionError('Max reconnection attempts reached');
    }
  }, [setupRealtimeSubscription]);

  // Manual reconnect function
  const reconnect = useCallback(() => {
    reconnectAttemptsRef.current = 0;
    setConnectionError(null);
    setupRealtimeSubscription();
  }, [setupRealtimeSubscription]);

  // Update order status
  const updateOrderStatus = useCallback(async (
    orderId: string, 
    newStatus: OrderUpdate['status'],
    estimatedTime?: number,
    notes?: string
  ) => {
    try {
      const { error } = await supabase
        .from('core_entities')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) throw error;

      // Update estimated time if provided
      if (estimatedTime !== undefined) {
        await supabase
          .from('core_dynamic_data')
          .upsert({
            entity_id: orderId,
            field_name: 'estimated_time',
            field_value: estimatedTime.toString(),
            field_type: 'number'
          });
      }

      // Add notes if provided
      if (notes) {
        await supabase
          .from('core_dynamic_data')
          .upsert({
            entity_id: orderId,
            field_name: 'kitchen_notes',
            field_value: notes,
            field_type: 'text'
          });
      }

      return true;
    } catch (error) {
      console.error('Error updating order status:', error);
      return false;
    }
  }, [supabase]);

  // Send kitchen update
  const sendChefHatUpdate = useCallback(async (update: ChefHatUpdate) => {
    try {
      const { error } = await supabase
        .from('core_entities')
        .insert({
          organization_id: restaurantId,
          entity_type: 'kitchen_update',
          name: `ChefHat Update ${Date.now()}`,
          status: 'active',
          metadata: {
            order_id: update.orderId,
            status: update.status,
            estimated_time: update.estimatedTime,
            notes: update.notes,
            staff_id: update.staffId,
            timestamp: update.timestamp
          }
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error sending kitchen update:', error);
      return false;
    }
  }, [restaurantId, supabase]);

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Initialize
  useEffect(() => {
    loadInitialOrders();
    setupRealtimeSubscription();

    return () => {
      if (channelRef.current) {
        channelRef.current.unsubscribe();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [loadInitialOrders, setupRealtimeSubscription]);

  // Filter orders based on type
  const filteredOrders = orders.filter(order => {
    switch (orderType) {
      case 'kitchen':
        return ['confirmed', 'preparing'].includes(order.status);
      case 'pos':
        return ['submitted', 'paid'].includes(order.status);
      case 'service':
        return ['ready', 'served'].includes(order.status);
      default:
        return true;
    }
  });

  return {
    orders: filteredOrders,
    allOrders: orders,
    isConnected,
    connectionError,
    lastUpdate,
    updateOrderStatus,
    sendChefHatUpdate,
    reconnect,
    refreshOrders: loadInitialOrders
  };
};