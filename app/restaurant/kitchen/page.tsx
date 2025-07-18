/**
 * HERA Universal Kitchen Display System
 * Real-time order tracking and preparation management
 * Integrates with POS system for complete order workflow
 */

"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UniversalCard, UniversalCardContent, UniversalCardHeader, UniversalCardTitle } from '@/components/theme/UniversalCard';
import { UniversalThemeButton, ThemeToggleButton } from '@/components/theme/UniversalThemeButton';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { useRestaurantManagement } from '@/hooks/useRestaurantManagement';
import { useMobileTheme } from '@/hooks/useMobileTheme';
import { UniversalTransactionService } from '@/lib/services/universalTransactionService';
import { RestaurantNavbar } from '@/components/restaurant/RestaurantNavbar';
import {
  ChefHat,
  Clock,
  CheckCircle,
  AlertTriangle,
  Users,
  Hash,
  DollarSign,
  Eye,
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
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';

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
  const { colors, isDark } = useMobileTheme();

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

  // Get status color with improved contrast
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return {
        backgroundColor: isDark ? 'rgba(255, 193, 7, 0.2)' : 'rgba(234, 179, 8, 0.12)',
        color: isDark ? '#FFD54F' : '#92400e',
        borderColor: isDark ? 'rgba(255, 193, 7, 0.4)' : 'rgba(234, 179, 8, 0.25)'
      };
      case 'confirmed': return {
        backgroundColor: isDark ? 'rgba(66, 165, 245, 0.2)' : 'rgba(59, 130, 246, 0.12)',
        color: isDark ? '#64B5F6' : '#1e40af',
        borderColor: isDark ? 'rgba(66, 165, 245, 0.4)' : 'rgba(59, 130, 246, 0.25)'
      };
      case 'preparing': return {
        backgroundColor: isDark ? 'rgba(255, 87, 34, 0.2)' : 'rgba(255, 71, 1, 0.12)',
        color: isDark ? colors.orange : '#c2410c',
        borderColor: isDark ? 'rgba(255, 87, 34, 0.4)' : 'rgba(255, 71, 1, 0.25)'
      };
      case 'ready': return {
        backgroundColor: isDark ? 'rgba(102, 187, 106, 0.2)' : 'rgba(34, 197, 94, 0.12)',
        color: isDark ? colors.success : '#166534',
        borderColor: isDark ? 'rgba(102, 187, 106, 0.4)' : 'rgba(34, 197, 94, 0.25)'
      };
      default: return {
        backgroundColor: isDark ? 'rgba(189, 189, 189, 0.2)' : 'rgba(156, 163, 175, 0.12)',
        color: isDark ? colors.textMuted : '#374151',
        borderColor: isDark ? colors.border : 'rgba(156, 163, 175, 0.25)'
      };
    }
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return colors.error;
      case 'high': return colors.orange;
      case 'normal': return colors.info;
      case 'low': return colors.textMuted;
      default: return colors.textMuted;
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
      <div 
        className="flex items-center justify-center min-h-screen"
        style={{ backgroundColor: colors.background }}
      >
        <div className="text-center">
          <Loader2 
            className="w-12 h-12 animate-spin mx-auto mb-4" 
            style={{ color: colors.orange }}
          />
          <p className="text-xl font-semibold mb-2" style={{ color: colors.textPrimary }}>
            Loading Kitchen Display...
          </p>
          <p style={{ color: colors.textSecondary }}>
            Preparing order management system
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

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.background }}>
      {/* Restaurant Navbar */}
      <RestaurantNavbar 
        currentSection="Kitchen Display System"
        sectionIcon={<ChefHat className="w-5 h-5" />}
      />

      {/* Kitchen Status Bar */}
      <div 
        className="border-b"
        style={{ 
          backgroundColor: isDark ? colors.gray800 : colors.surface,
          borderColor: isDark ? colors.gray700 : colors.border
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-3">
            {/* Status Summary */}
            <div className="flex items-center space-x-2 text-sm overflow-x-auto">
              <Badge 
                variant="outline" 
                className="border flex-shrink-0"
                style={getStatusColor('pending')}
              >
                <Clock className="w-3 h-3 mr-1" />
                {orders.filter(o => o.status === 'pending').length} Pending
              </Badge>
              <Badge 
                variant="outline" 
                className="border flex-shrink-0"
                style={getStatusColor('preparing')}
              >
                <Timer className="w-3 h-3 mr-1" />
                {orders.filter(o => o.status === 'preparing').length} Preparing
              </Badge>
              <Badge 
                variant="outline" 
                className="border flex-shrink-0"
                style={getStatusColor('ready')}
              >
                <CheckCircle className="w-3 h-3 mr-1" />
                {orders.filter(o => o.status === 'ready').length} Ready
              </Badge>
              <Badge 
                variant="outline" 
                className="border flex-shrink-0"
                style={{
                  backgroundColor: isDark ? 'rgba(102, 187, 106, 0.2)' : 'rgba(34, 197, 94, 0.12)',
                  color: isDark ? colors.success : '#166534',
                  borderColor: isDark ? 'rgba(102, 187, 106, 0.4)' : 'rgba(34, 197, 94, 0.25)'
                }}
              >
                <CheckCircle className="w-3 h-3 mr-1" />
                {todaysCompletedOrders.length} Today
              </Badge>
            </div>

            {/* Refresh Button */}
            <UniversalThemeButton 
              variant="secondary" 
              onClick={loadOrders} 
              disabled={loading}
              icon={<RotateCcw className="w-4 h-4" />}
              size="sm"
            >
              <span className="hidden sm:inline">Refresh</span>
            </UniversalThemeButton>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Filter Tabs */}
        <div 
          className="flex space-x-1 rounded-lg p-1 mb-6"
          style={{ 
            backgroundColor: isDark ? colors.gray700 : colors.surfaceElevated,
            border: `1px solid ${isDark ? colors.gray600 : 'transparent'}`
          }}
        >
          {[
            { key: 'all', label: 'All Orders', count: orders.length },
            { key: 'pending', label: 'Pending', count: orders.filter(o => o.status === 'pending').length },
            { key: 'preparing', label: 'Preparing', count: orders.filter(o => o.status === 'preparing').length },
            { key: 'ready', label: 'Ready', count: orders.filter(o => o.status === 'ready').length }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as any)}
              className="flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-all"
              style={{
                backgroundColor: filter === tab.key 
                  ? (isDark ? colors.gray800 : colors.surface) 
                  : 'transparent',
                color: filter === tab.key ? colors.orange : colors.textSecondary,
                boxShadow: filter === tab.key 
                  ? (isDark ? `0 2px 4px ${colors.shadow}` : `0 1px 3px ${colors.shadow}`) 
                  : 'none',
                border: filter === tab.key 
                  ? `1px solid ${isDark ? colors.gray500 : colors.border}` 
                  : '1px solid transparent'
              }}
              onMouseEnter={(e) => {
                if (filter !== tab.key) {
                  e.currentTarget.style.color = colors.textPrimary;
                  e.currentTarget.style.backgroundColor = isDark ? colors.gray800 : colors.surface;
                }
              }}
              onMouseLeave={(e) => {
                if (filter !== tab.key) {
                  e.currentTarget.style.color = colors.textSecondary;
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              <span>{tab.label}</span>
              <Badge 
                variant="secondary" 
                className="text-xs border-0"
                style={{
                  backgroundColor: filter === tab.key 
                    ? (isDark ? 'rgba(255, 87, 34, 0.2)' : colors.orangeShadow) 
                    : (isDark ? colors.gray700 : colors.surface),
                  color: filter === tab.key ? colors.orange : colors.textMuted,
                  border: `1px solid ${filter === tab.key 
                    ? (isDark ? 'rgba(255, 87, 34, 0.3)' : 'transparent') 
                    : (isDark ? colors.gray600 : 'transparent')}`
                }}
              >
                {tab.count}
              </Badge>
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

        {/* Orders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <AnimatePresence>
            {sortedOrders.map((order) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                layout
              >
                <UniversalCard 
                  variant="interactive"
                  className={`cursor-pointer transition-all ${
                    selectedOrder === order.id ? 'ring-2' : ''
                  } ${order.priority === 'urgent' ? '' : ''}`}
                  style={{
                    ...(selectedOrder === order.id ? { 
                      borderColor: colors.orange,
                      boxShadow: `0 0 0 2px ${colors.orange}33`
                    } : {}),
                    ...(order.priority === 'urgent' ? { 
                      backgroundColor: isDark ? 'rgba(239, 83, 80, 0.15)' : 'rgba(239, 68, 68, 0.05)',
                      borderColor: isDark ? 'rgba(239, 83, 80, 0.4)' : 'rgba(239, 68, 68, 0.2)'
                    } : {})
                  }}
                  onClick={() => setSelectedOrder(selectedOrder === order.id ? null : order.id)}
                >
                  <UniversalCardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-2 h-2 rounded-full" 
                          style={{ backgroundColor: getPriorityColor(order.priority) }}
                        />
                        <h3 className="font-bold text-lg" style={{ color: colors.textPrimary }}>
                          {order.orderNumber}
                        </h3>
                      </div>
                      <Badge className="border-0" style={getStatusColor(order.status)}>
                        {order.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm">
                      <div className="flex items-center" style={{ color: colors.textSecondary }}>
                        <User className="w-4 h-4 mr-1" />
                        {order.customerName}
                      </div>
                      <div className="flex items-center" style={{ color: colors.textSecondary }}>
                        <MapPin className="w-4 h-4 mr-1" />
                        {order.tableNumber}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs" style={{ color: colors.textMuted }}>
                      <span>{formatOrderTime(order.orderTime)}</span>
                      <span>Est. {order.estimatedPrepTime}min</span>
                    </div>
                  </UniversalCardHeader>

                  <UniversalCardContent className="space-y-3">
                    {/* Order Items */}
                    <div className="space-y-2">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex justify-between items-start text-sm">
                          <div className="flex-1">
                            <span className="font-medium" style={{ color: colors.textPrimary }}>
                              {item.quantity}x {item.name}
                            </span>
                            {item.specialInstructions && (
                              <p className="text-xs mt-1" style={{ color: colors.orange }}>
                                Note: {item.specialInstructions}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Special Instructions */}
                    {order.specialInstructions && (
                      <div 
                        className="p-2 border rounded-md"
                        style={{
                          backgroundColor: isDark ? 'rgba(255, 193, 7, 0.15)' : 'rgba(234, 179, 8, 0.1)',
                          borderColor: isDark ? 'rgba(255, 193, 7, 0.3)' : 'rgba(234, 179, 8, 0.25)'
                        }}
                      >
                        <div className="flex items-start space-x-2">
                          <FileText 
                            className="w-4 h-4 mt-0.5 flex-shrink-0" 
                            style={{ color: isDark ? '#FFD54F' : '#92400e' }}
                          />
                          <p className="text-xs" style={{ color: isDark ? '#FFD54F' : '#92400e' }}>
                            {order.specialInstructions}
                          </p>
                        </div>
                      </div>
                    )}

                    <Separator />

                    {/* Action Buttons */}
                    <div className="space-y-2">
                      {order.status === 'pending' && (
                        <UniversalThemeButton
                          onClick={(e) => {
                            e.stopPropagation();
                            updateOrderStatus(order.id, 'preparing');
                          }}
                          disabled={updatingOrder === order.id}
                          variant="primary"
                          size="sm"
                          fullWidth
                          loading={updatingOrder === order.id}
                          icon={updatingOrder === order.id ? undefined : <Play className="w-4 h-4" />}
                        >
                          {updatingOrder === order.id ? 'Starting...' : 'Start Preparing'}
                        </UniversalThemeButton>
                      )}

                      {order.status === 'preparing' && (
                        <UniversalThemeButton
                          onClick={(e) => {
                            e.stopPropagation();
                            updateOrderStatus(order.id, 'ready');
                          }}
                          disabled={updatingOrder === order.id}
                          variant="primary"
                          size="sm"
                          fullWidth
                          loading={updatingOrder === order.id}
                          icon={updatingOrder === order.id ? undefined : <Check className="w-4 h-4" />}
                          style={{
                            backgroundColor: colors.success,
                            borderColor: colors.success
                          }}
                        >
                          {updatingOrder === order.id ? 'Updating...' : 'Mark Ready'}
                        </UniversalThemeButton>
                      )}

                      {order.status === 'ready' && (
                        <UniversalThemeButton
                          onClick={(e) => {
                            e.stopPropagation();
                            updateOrderStatus(order.id, 'completed');
                          }}
                          disabled={updatingOrder === order.id}
                          variant="secondary"
                          size="sm"
                          fullWidth
                          loading={updatingOrder === order.id}
                          icon={updatingOrder === order.id ? undefined : <CheckCircle className="w-4 h-4" />}
                        >
                          {updatingOrder === order.id ? 'Completing...' : 'Complete Order'}
                        </UniversalThemeButton>
                      )}

                      {/* Order Details */}
                      <div className="flex items-center justify-between text-xs" style={{ color: colors.textMuted }}>
                        <span>Total: ${order.totalAmount.toFixed(2)}</span>
                        {order.waiterName && <span>Waiter: {order.waiterName}</span>}
                      </div>
                    </div>
                  </UniversalCardContent>
                </UniversalCard>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Empty State */}
        {sortedOrders.length === 0 && !loading && (
          <UniversalCard className="text-center py-12">
            <UniversalCardContent>
              <ChefHat className="w-16 h-16 mx-auto mb-4" style={{ color: colors.textMuted }} />
              <p className="text-lg" style={{ color: colors.textSecondary }}>No orders found</p>
              <p className="text-sm" style={{ color: colors.textMuted }}>
                {filter === 'all' ? 'No orders in the system' : `No ${filter} orders`}
              </p>
              <div className="mt-4">
                <UniversalThemeButton 
                  variant="secondary" 
                  onClick={() => window.open('/restaurant/pos', '_blank')}
                  icon={<Utensils className="w-4 h-4" />}
                >
                  Open POS System
                </UniversalThemeButton>
              </div>
            </UniversalCardContent>
          </UniversalCard>
        )}

        {/* Today's Completed Orders Section */}
        {todaysCompletedOrders.length > 0 && (
          <div className="mt-8">
            <UniversalCard variant="elevated">
              <UniversalCardHeader>
                <UniversalCardTitle className="flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2" style={{ color: colors.success }} />
                  Today's Completed Orders ({todaysCompletedOrders.length})
                </UniversalCardTitle>
              </UniversalCardHeader>
              <UniversalCardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {todaysCompletedOrders.map((order) => (
                    <div 
                      key={order.id} 
                      className="flex items-center justify-between p-3 rounded-lg border"
                      style={{
                        backgroundColor: isDark ? 'rgba(102, 187, 106, 0.15)' : 'rgba(34, 197, 94, 0.08)',
                        borderColor: isDark ? 'rgba(102, 187, 106, 0.3)' : 'rgba(34, 197, 94, 0.2)'
                      }}
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: colors.success }} />
                          <div>
                            <h4 className="font-medium" style={{ color: colors.success }}>
                              {order.orderNumber}
                            </h4>
                            <p className="text-sm" style={{ color: colors.success }}>
                              {order.customerName} • {order.tableNumber}
                            </p>
                          </div>
                        </div>
                        
                        <div className="mt-2">
                          <div className="flex flex-wrap gap-1">
                            {order.items.map((item, index) => (
                              <span 
                                key={index} 
                                className="text-xs px-2 py-1 rounded"
                                style={{
                                  backgroundColor: isDark ? 'rgba(102, 187, 106, 0.2)' : 'rgba(34, 197, 94, 0.12)',
                                  color: colors.success
                                }}
                              >
                                {item.quantity}x {item.name}
                              </span>
                            ))}
                          </div>
                          
                          {order.specialInstructions && (
                            <p className="text-xs mt-1" style={{ color: colors.success }}>
                              Note: {order.specialInstructions}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-sm font-medium" style={{ color: colors.success }}>
                          ${order.totalAmount.toFixed(2)}
                        </p>
                        <p className="text-xs" style={{ color: colors.success }}>
                          {formatOrderTime(order.orderTime)}
                        </p>
                        {order.waiterName && (
                          <p className="text-xs" style={{ color: colors.success }}>
                            {order.waiterName}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Daily Summary */}
                <div className="mt-4 pt-4 border-t" style={{ borderColor: colors.border }}>
                  <div className="flex justify-between items-center text-sm">
                    <span style={{ color: colors.textSecondary }}>Total completed today:</span>
                    <span className="font-medium" style={{ color: colors.textPrimary }}>
                      {todaysCompletedOrders.length} orders • $
                      {todaysCompletedOrders.reduce((sum, order) => sum + order.totalAmount, 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              </UniversalCardContent>
            </UniversalCard>
          </div>
        )}
      </div>
    </div>
  );
}