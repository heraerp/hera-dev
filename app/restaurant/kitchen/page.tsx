/**
 * HERA Universal Kitchen Display System - PO Gold Standard Theme
 * Real-time order tracking and preparation management with modern sidebar
 */

"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { AppLayoutWithSidebar } from '@/components/layouts/AppLayoutWithSidebar';
import { useRestaurantManagement } from '@/hooks/useRestaurantManagement';
import { UniversalTransactionService } from '@/lib/services/universalTransactionService';
import {
  ChefHat,
  Clock,
  CheckCircle,
  AlertTriangle,
  Users,
  DollarSign,
  Play,
  Check,
  RotateCcw,
  Bell,
  Utensils,
  Timer,
  Loader2,
  User,
  MapPin,
  FileText,
  Calendar,
  Flame,
  Eye,
  Star,
  TrendingUp,
  Package,
  X
} from 'lucide-react';

// Order interface for kitchen display
interface KitchenOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  tableNumber: string;
  orderType: 'dine_in' | 'takeout' | 'delivery';
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
    specialInstructions?: string;
  }>;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed';
  waiterName?: string;
  specialInstructions?: string;
  orderTime: string;
  estimatedPrepTime: number; // in minutes
  actualPrepTime?: number;
  priority: 'low' | 'normal' | 'high' | 'urgent';
}

export default function KitchenPage() {
  const { restaurantData, loading: authLoading } = useRestaurantManagement();
  const organizationId = restaurantData?.organizationId;

  // State management
  const [orders, setOrders] = useState<KitchenOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'preparing' | 'ready'>('all');
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null);

  // Load orders from Universal Transaction Service
  useEffect(() => {
    if (organizationId) {
      loadOrders();
      // Set up real-time subscription for new orders
      const subscription = UniversalTransactionService.subscribeToOrderChanges(
        organizationId,
        handleOrderUpdate
      );
      
      // Refresh orders every 30 seconds
      const interval = setInterval(loadOrders, 30000);
      
      return () => {
        if (subscription && typeof subscription.unsubscribe === 'function') {
          subscription.unsubscribe();
        }
        clearInterval(interval);
      };
    }
  }, [organizationId]);

  const loadOrders = async () => {
    if (!organizationId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      console.log('🍳 Loading kitchen orders for organization:', organizationId);
      
      // Get orders from Universal Transaction Service (including completed orders from today)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const ordersResult = await UniversalTransactionService.getOrders(organizationId, {
        status: ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'COMPLETED', 'pending', 'confirmed', 'preparing', 'ready', 'completed'],
        orderBy: { field: 'created_at', direction: 'desc' },
        limit: 100, // Increased limit to include completed orders
        fromDate: today.toISOString() // Only get orders from today
      });
      
      console.log('🍳 Kitchen orders result:', ordersResult);
      
      if (ordersResult.success && ordersResult.data) {
        const kitchenOrders: KitchenOrder[] = ordersResult.data.map(order => {
          // Handle metadata that might be empty or missing
          const metadata = order.metadata || {};
          const lineItems = order.line_items || [];
          
          console.log(`🍳 Processing order ${order.transaction_number}:`, {
            metadata,
            lineItemsCount: lineItems.length,
            status: order.transaction_status
          });
          
          return {
            id: order.id,
            orderNumber: order.transaction_number || `ORD-${order.id.slice(-6)}`,
            customerName: metadata.customer_name || 'Walk-in Customer',
            tableNumber: metadata.table_number || 'Counter',
            orderType: metadata.order_type || 'dine_in',
            items: lineItems.map(item => ({
              id: item.id,
              name: item.name || 'Unknown Item',
              quantity: item.quantity || 1,
              price: item.price || 0,
              specialInstructions: item.special_instructions
            })),
            totalAmount: order.total_amount || 0,
            status: order.transaction_status?.toLowerCase() || 'pending',
            waiterName: metadata.waiter_name || 'Self-Service',
            specialInstructions: metadata.special_instructions || '',
            orderTime: order.created_at,
            estimatedPrepTime: calculateEstimatedPrepTime(lineItems),
            priority: calculateOrderPriority(order)
          };
        });
        
        setOrders(kitchenOrders);
        console.log('✅ Kitchen orders loaded:', kitchenOrders.length);
      }
    } catch (error) {
      console.error('❌ Failed to load kitchen orders:', error);
      setError('Failed to load orders. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  // Handle real-time order updates
  const handleOrderUpdate = (payload: any) => {
    console.log('🔄 Real-time order update received:', payload);
    
    if (payload.eventType === 'INSERT') {
      // New order - play notification sound and add to list
      playNotificationSound();
      loadOrders(); // Refresh to get complete order data
    } else if (payload.eventType === 'UPDATE') {
      // Order status changed - update the specific order
      setOrders(prev => prev.map(order => 
        order.id === payload.new.id 
          ? { ...order, status: payload.new.transaction_status?.toLowerCase() || payload.new.status }
          : order
      ));
    }
  };

  // Calculate estimated prep time based on menu items
  const calculateEstimatedPrepTime = (items: any[]): number => {
    // Simple calculation: 3-8 minutes per item, depending on complexity
    const baseTime = items.reduce((total, item) => {
      const quantity = item.quantity || 1;
      const itemTime = 5; // Default 5 minutes per item
      return total + (itemTime * quantity);
    }, 0);
    
    return Math.max(5, Math.min(baseTime, 45)); // Between 5-45 minutes
  };

  // Calculate order priority
  const calculateOrderPriority = (order: any): 'low' | 'normal' | 'high' | 'urgent' => {
    const orderTime = new Date(order.created_at);
    const now = new Date();
    const ageMinutes = (now.getTime() - orderTime.getTime()) / (1000 * 60);
    
    // Priority based on age and order type
    if (ageMinutes > 30) return 'urgent';
    if (order.metadata?.order_type === 'delivery') return 'high';
    if (ageMinutes > 15) return 'high';
    if (ageMinutes > 10) return 'normal';
    return 'low';
  };

  // Play notification sound for new orders
  const playNotificationSound = () => {
    // In a real app, you'd play an actual sound file
    console.log('🔔 New order notification!');
  };

  // Update order status
  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    setUpdatingOrder(orderId);
    
    try {
      console.log(`🍳 Updating order ${orderId} to status: ${newStatus}`);
      
      const result = await UniversalTransactionService.updateOrderStatus(orderId, newStatus);
      
      if (result.success) {
        // Update local state
        setOrders(prev => prev.map(order => 
          order.id === orderId 
            ? { ...order, status: newStatus as any }
            : order
        ));
        
        console.log('✅ Order status updated successfully');
      } else {
        throw new Error(result.error || 'Failed to update order status');
      }
    } catch (error) {
      console.error('❌ Failed to update order status:', error);
      setError(`Failed to update order status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setUpdatingOrder(null);
    }
  };

  // Filter orders based on selected filter
  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    return order.status === filter;
  });

  // Sort orders by priority and time
  const sortedOrders = filteredOrders.sort((a, b) => {
    const priorityOrder = { urgent: 4, high: 3, normal: 2, low: 1 };
    const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
    if (priorityDiff !== 0) return priorityDiff;
    
    // If same priority, sort by order time (oldest first)
    return new Date(a.orderTime).getTime() - new Date(b.orderTime).getTime();
  });

  // Get today's completed orders
  const todaysCompletedOrders = orders.filter(order => {
    const orderDate = new Date(order.orderTime);
    const today = new Date();
    return order.status === 'completed' && 
           orderDate.toDateString() === today.toDateString();
  }).sort((a, b) => new Date(b.orderTime).getTime() - new Date(a.orderTime).getTime());

  // Get status color - PO Gold Standard
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700';
      case 'confirmed': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-700';
      case 'preparing': return 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 border-orange-200 dark:border-orange-700';
      case 'ready': return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-700';
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-600';
    }
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'normal': return 'bg-blue-500';
      case 'low': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  // Format order time
  const formatOrderTime = (timeStr: string) => {
    const time = new Date(timeStr);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    return `${diffHours}h ${diffMinutes % 60}m ago`;
  };

  // Loading state
  if (authLoading || loading) {
    return (
      <AppLayoutWithSidebar variant="pos">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <ChefHat className="w-16 h-16 mx-auto mb-4 text-orange-600" />
            </motion.div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Preparing Kitchen Display
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Loading order management system...
            </p>
          </div>
        </div>
      </AppLayoutWithSidebar>
    );
  }

  // Error state
  if (!organizationId) {
    return (
      <AppLayoutWithSidebar variant="pos">
        <Alert className="m-6 border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            Restaurant setup required. Please complete restaurant setup first.
          </AlertDescription>
        </Alert>
      </AppLayoutWithSidebar>
    );
  }

  return (
    <AppLayoutWithSidebar variant="pos">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <ChefHat className="w-6 h-6 mr-3 text-orange-600" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  Kitchen Display System
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Real-time order tracking and preparation
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Live Status */}
              <Badge className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-0">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                Live Kitchen
              </Badge>
              
              {/* Refresh Button */}
              <Button 
                variant="outline" 
                size="sm"
                onClick={loadOrders}
                disabled={loading}
              >
                <RotateCcw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Success/Error Messages */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50"
          >
            <div className="bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              {error}
              <button onClick={() => setError(null)} className="ml-2">
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Kitchen Status Bar */}
      <div className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Status Summary */}
            <div className="flex items-center space-x-3 overflow-x-auto">
              <Badge className={`${getStatusColor('pending')} border-0 flex-shrink-0`}>
                <Clock className="w-3 h-3 mr-1" />
                {orders.filter(o => o.status === 'pending').length} Pending
              </Badge>
              <Badge className={`${getStatusColor('preparing')} border-0 flex-shrink-0`}>
                <Flame className="w-3 h-3 mr-1" />
                {orders.filter(o => o.status === 'preparing').length} Preparing
              </Badge>
              <Badge className={`${getStatusColor('ready')} border-0 flex-shrink-0`}>
                <CheckCircle className="w-3 h-3 mr-1" />
                {orders.filter(o => o.status === 'ready').length} Ready
              </Badge>
              <Badge className={`${getStatusColor('ready')} border-0 flex-shrink-0`}>
                <Star className="w-3 h-3 mr-1" />
                {todaysCompletedOrders.length} Completed Today
              </Badge>
            </div>

            {/* Filter Tabs */}
            <div className="flex rounded-lg p-1 bg-gray-200 dark:bg-gray-700">
              {[
                { key: 'all', label: 'All', count: orders.length },
                { key: 'pending', label: 'Pending', count: orders.filter(o => o.status === 'pending').length },
                { key: 'preparing', label: 'Preparing', count: orders.filter(o => o.status === 'preparing').length },
                { key: 'ready', label: 'Ready', count: orders.filter(o => o.status === 'ready').length }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key as any)}
                  className={`
                    px-3 py-1 rounded-md text-sm font-medium transition-all
                    ${filter === tab.key 
                      ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm' 
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
                    }
                  `}
                >
                  {tab.label} {tab.count > 0 && (
                    <Badge variant="secondary" className="ml-1 text-xs">
                      {tab.count}
                    </Badge>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="px-6 lg:px-8 py-8">
        {/* Orders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence>
            {sortedOrders.map((order) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                layout
              >
                <Card 
                  className={`
                    bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 
                    hover:shadow-lg transition-all cursor-pointer
                    ${selectedOrder === order.id ? 'ring-2 ring-blue-500' : ''}
                    ${order.priority === 'urgent' ? 'border-l-4 border-l-red-500' : ''}
                    ${order.priority === 'high' ? 'border-l-4 border-l-orange-500' : ''}
                  `}
                  onClick={() => setSelectedOrder(selectedOrder === order.id ? null : order.id)}
                >
                  <div className="p-4 space-y-4">
                    {/* Order Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${getPriorityColor(order.priority)}`} />
                        <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100">
                          {order.orderNumber}
                        </h3>
                      </div>
                      <Badge className={`${getStatusColor(order.status)} border-0`}>
                        {order.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                    
                    {/* Customer Info */}
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <User className="w-4 h-4 mr-2" />
                        {order.customerName}
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          {order.tableNumber}
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {formatOrderTime(order.orderTime)}
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-500">
                        <span>Est. {order.estimatedPrepTime}min</span>
                        <span className="capitalize">{order.orderType.replace('_', ' ')}</span>
                      </div>
                    </div>

                    <Separator className="border-gray-200 dark:border-gray-700" />

                    {/* Order Items */}
                    <div className="space-y-2">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex justify-between items-start text-sm">
                          <div className="flex-1">
                            <span className="font-medium text-gray-900 dark:text-gray-100">
                              {item.quantity}x {item.name}
                            </span>
                            {item.specialInstructions && (
                              <p className="text-xs mt-1 text-orange-600 dark:text-orange-400">
                                ⚠️ {item.specialInstructions}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Special Instructions */}
                    {order.specialInstructions && (
                      <div className="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700">
                        <div className="flex items-start space-x-2">
                          <FileText className="w-4 h-4 mt-0.5 text-yellow-600 dark:text-yellow-400" />
                          <p className="text-sm text-yellow-800 dark:text-yellow-300">
                            {order.specialInstructions}
                          </p>
                        </div>
                      </div>
                    )}

                    <Separator className="border-gray-200 dark:border-gray-700" />

                    {/* Action Buttons */}
                    <div className="space-y-2">
                      {order.status === 'pending' && (
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            updateOrderStatus(order.id, 'preparing');
                          }}
                          disabled={updatingOrder === order.id}
                          className="w-full bg-blue-600 hover:bg-blue-700"
                          size="sm"
                        >
                          {updatingOrder === order.id ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Play className="w-4 h-4 mr-2" />
                          )}
                          {updatingOrder === order.id ? 'Starting...' : 'Start Preparing'}
                        </Button>
                      )}

                      {order.status === 'preparing' && (
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            updateOrderStatus(order.id, 'ready');
                          }}
                          disabled={updatingOrder === order.id}
                          className="w-full bg-green-600 hover:bg-green-700"
                          size="sm"
                        >
                          {updatingOrder === order.id ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Check className="w-4 h-4 mr-2" />
                          )}
                          {updatingOrder === order.id ? 'Updating...' : 'Mark Ready'}
                        </Button>
                      )}

                      {order.status === 'ready' && (
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            updateOrderStatus(order.id, 'completed');
                          }}
                          disabled={updatingOrder === order.id}
                          variant="outline"
                          className="w-full"
                          size="sm"
                        >
                          {updatingOrder === order.id ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <CheckCircle className="w-4 h-4 mr-2" />
                          )}
                          {updatingOrder === order.id ? 'Completing...' : 'Complete Order'}
                        </Button>
                      )}

                      {/* Order Details */}
                      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-500">
                        <span>Total: ₹{order.totalAmount.toFixed(2)}</span>
                        {order.waiterName && <span>Waiter: {order.waiterName}</span>}
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Empty State */}
        {sortedOrders.length === 0 && !loading && (
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <div className="p-12 text-center">
              <ChefHat className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                No orders found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {filter === 'all' ? 'No orders in the system' : `No ${filter} orders`}
              </p>
              <Button 
                variant="outline" 
                onClick={() => window.open('/restaurant/pos', '_blank')}
              >
                <Utensils className="w-4 h-4 mr-2" />
                Open POS System
              </Button>
            </div>
          </Card>
        )}

        {/* Today's Summary */}
        {todaysCompletedOrders.length > 0 && (
          <div className="mt-8">
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      Today's Performance
                    </h3>
                  </div>
                  <Badge className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-0">
                    {todaysCompletedOrders.length} Completed
                  </Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 rounded-lg bg-gray-50 dark:bg-gray-700">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {todaysCompletedOrders.length}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Orders Completed</div>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-gray-50 dark:bg-gray-700">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      ₹{todaysCompletedOrders.reduce((sum, order) => sum + order.totalAmount, 0).toFixed(0)}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Revenue Generated</div>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-gray-50 dark:bg-gray-700">
                    <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                      {Math.round(todaysCompletedOrders.reduce((sum, order) => sum + (order.actualPrepTime || order.estimatedPrepTime), 0) / todaysCompletedOrders.length) || 0}m
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Avg Prep Time</div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}
      </main>
    </AppLayoutWithSidebar>
  );
}