'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Users, 
  ChefHat,
  Timer,
  Bell,
  Wifi,
  WifiOff,
  RefreshCw,
  Eye,
  EyeOff
} from 'lucide-react';
import { useRealtimeOrders } from '@/hooks/useRealtimeOrders';
import { Card } from '@/components/ui/revolutionary-card';
import { Button } from '@/components/ui/revolutionary-button';

interface ChefHatDisplayProps {
  restaurantId: string;
  staffId?: string;
  displayMode?: 'kitchen' | 'service' | 'all';
}

const ChefHatDisplay: React.FC<ChefHatDisplayProps> = ({
  restaurantId,
  staffId,
  displayMode = 'kitchen'
}) => {
  const {
    orders,
    isConnected,
    connectionError,
    lastUpdate,
    updateOrderStatus,
    reconnect
  } = useRealtimeOrders({ 
    restaurantId, 
    orderType: displayMode,
    userId: staffId 
  });

  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Play notification sound for new orders
  useEffect(() => {
    if (soundEnabled && orders.length > 0) {
      const newOrders = orders.filter(order => 
        order.status === 'confirmed' && 
        new Date(order.timestamp).getTime() > Date.now() - 10000 // Last 10 seconds
      );
      
      if (newOrders.length > 0) {
        // Play notification sound
        const audio = new Audio('/sounds/order-notification.mp3');
        audio.volume = 0.5;
        audio.play().catch(console.error);
      }
    }
  }, [orders, soundEnabled]);

  const getOrderPriority = (order: any) => {
    const orderTime = new Date(order.timestamp);
    const timePassed = (currentTime.getTime() - orderTime.getTime()) / 1000 / 60; // minutes
    
    if (timePassed > order.estimatedTime + 10) return 'urgent';
    if (timePassed > order.estimatedTime) return 'high';
    if (order.priority === 'high') return 'high';
    return order.priority || 'normal';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'from-red-500 to-red-600';
      case 'high': return 'from-orange-500 to-orange-600';
      case 'normal': return 'from-blue-500 to-blue-600';
      default: return 'from-slate-500 to-slate-600';
    }
  };

  const getTimeElapsed = (orderTime: string) => {
    const elapsed = (currentTime.getTime() - new Date(orderTime).getTime()) / 1000 / 60;
    return Math.floor(elapsed);
  };

  const getTimeRemaining = (orderTime: string, estimatedTime: number) => {
    const elapsed = getTimeElapsed(orderTime);
    const remaining = estimatedTime - elapsed;
    return Math.max(0, remaining);
  };

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    const success = await updateOrderStatus(orderId, newStatus as any);
    if (success) {
      setSelectedOrder(null);
    }
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
    setIsFullscreen(!isFullscreen);
  };

  const groupedOrders = {
    confirmed: orders.filter(order => order.status === 'confirmed'),
    preparing: orders.filter(order => order.status === 'preparing'),
    ready: orders.filter(order => order.status === 'ready')
  };

  return (
    <div className={`min-h-screen bg-slate-900 text-white p-4 ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <ChefHat className="w-8 h-8 text-orange-400" />
          <div>
            <h1 className="text-2xl font-bold">ChefHat Display</h1>
            <p className="text-slate-400 text-sm">
              {currentTime.toLocaleTimeString()} • {orders.length} active orders
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Connection Status */}
          <div className="flex items-center space-x-2">
            {isConnected ? (
              <div className="flex items-center space-x-1 text-green-400">
                <Wifi className="w-4 h-4" />
                <span className="text-sm">Connected</span>
              </div>
            ) : (
              <div className="flex items-center space-x-1 text-red-400">
                <WifiOff className="w-4 h-4" />
                <span className="text-sm">Disconnected</span>
              </div>
            )}
            {connectionError && (
              <Button
                size="sm"
                variant="outline"
                onClick={reconnect}
                leftIcon={<RefreshCw className="w-4 h-4" />}
              >
                Reconnect
              </Button>
            )}
          </div>

          {/* Controls */}
          <Button
            size="sm"
            variant="outline"
            onClick={() => setSoundEnabled(!soundEnabled)}
            leftIcon={soundEnabled ? <Bell className="w-4 h-4" /> : <Bell className="w-4 h-4 opacity-50" />}
          >
            Sound
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={toggleFullscreen}
            leftIcon={isFullscreen ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          >
            {isFullscreen ? 'Exit' : 'Fullscreen'}
          </Button>
        </div>
      </div>

      {/* Order Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-120px)]">
        {/* New Orders */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2 mb-4">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <h2 className="text-lg font-semibold">New Orders ({groupedOrders.confirmed.length})</h2>
          </div>
          <div className="space-y-3 overflow-y-auto max-h-full">
            <AnimatePresence>
              {groupedOrders.confirmed.map(order => (
                <OrderCard
                  key={order.id}
                  order={order}
                  priority={getOrderPriority(order)}
                  timeElapsed={getTimeElapsed(order.timestamp)}
                  timeRemaining={getTimeRemaining(order.timestamp, order.estimatedTime)}
                  onStatusUpdate={handleStatusUpdate}
                  onSelect={() => setSelectedOrder(order.id)}
                  isSelected={selectedOrder === order.id}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* In Progress */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2 mb-4">
            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
            <h2 className="text-lg font-semibold">In Progress ({groupedOrders.preparing.length})</h2>
          </div>
          <div className="space-y-3 overflow-y-auto max-h-full">
            <AnimatePresence>
              {groupedOrders.preparing.map(order => (
                <OrderCard
                  key={order.id}
                  order={order}
                  priority={getOrderPriority(order)}
                  timeElapsed={getTimeElapsed(order.timestamp)}
                  timeRemaining={getTimeRemaining(order.timestamp, order.estimatedTime)}
                  onStatusUpdate={handleStatusUpdate}
                  onSelect={() => setSelectedOrder(order.id)}
                  isSelected={selectedOrder === order.id}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Ready */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2 mb-4">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <h2 className="text-lg font-semibold">Ready ({groupedOrders.ready.length})</h2>
          </div>
          <div className="space-y-3 overflow-y-auto max-h-full">
            <AnimatePresence>
              {groupedOrders.ready.map(order => (
                <OrderCard
                  key={order.id}
                  order={order}
                  priority={getOrderPriority(order)}
                  timeElapsed={getTimeElapsed(order.timestamp)}
                  timeRemaining={getTimeRemaining(order.timestamp, order.estimatedTime)}
                  onStatusUpdate={handleStatusUpdate}
                  onSelect={() => setSelectedOrder(order.id)}
                  isSelected={selectedOrder === order.id}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Last Update Indicator */}
      {lastUpdate && (
        <div className="fixed bottom-4 right-4 bg-slate-800 px-3 py-1 rounded-lg text-sm text-slate-400">
          Last update: {lastUpdate.toLocaleTimeString()}
        </div>
      )}
    </div>
  );
};

interface OrderCardProps {
  order: any;
  priority: string;
  timeElapsed: number;
  timeRemaining: number;
  onStatusUpdate: (orderId: string, status: string) => void;
  onSelect: () => void;
  isSelected: boolean;
}

const OrderCard: React.FC<OrderCardProps> = ({
  order,
  priority,
  timeElapsed,
  timeRemaining,
  onStatusUpdate,
  onSelect,
  isSelected
}) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'border-red-500 bg-red-500/10';
      case 'high': return 'border-orange-500 bg-orange-500/10';
      case 'normal': return 'border-blue-500 bg-blue-500/10';
      default: return 'border-slate-500 bg-slate-500/10';
    }
  };

  const getStatusActions = (status: string) => {
    switch (status) {
      case 'confirmed':
        return [
          { label: 'Start Cooking', status: 'preparing', color: 'bg-orange-600 hover:bg-orange-700' }
        ];
      case 'preparing':
        return [
          { label: 'Mark Ready', status: 'ready', color: 'bg-green-600 hover:bg-green-700' }
        ];
      case 'ready':
        return [
          { label: 'Served', status: 'served', color: 'bg-blue-600 hover:bg-blue-700' }
        ];
      default:
        return [];
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ scale: 1.02 }}
      className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${getPriorityColor(priority)} ${
        isSelected ? 'ring-2 ring-white/50' : ''
      }`}
      onClick={onSelect}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <span className="font-bold text-lg">{order.orderNumber}</span>
          {order.tableNumber && (
            <div className="flex items-center space-x-1 text-sm bg-slate-700 px-2 py-1 rounded">
              <Users className="w-3 h-3" />
              <span>Table {order.tableNumber}</span>
            </div>
          )}
        </div>
        <div className="text-right">
          <div className="text-sm text-slate-400">${order.total.toFixed(2)}</div>
          {priority === 'urgent' && (
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 1 }}
              className="flex items-center space-x-1 text-red-400"
            >
              <AlertTriangle className="w-4 h-4" />
              <span className="text-xs font-bold">URGENT</span>
            </motion.div>
          )}
        </div>
      </div>

      {/* Customer Info */}
      {order.customerName && (
        <div className="text-sm text-slate-300 mb-2">
          Customer: {order.customerName}
        </div>
      )}

      {/* Items */}
      <div className="space-y-1 mb-3">
        {order.items.slice(0, 3).map((item: any, index: number) => (
          <div key={index} className="flex justify-between text-sm">
            <span className="text-slate-200">
              {item.quantity}x {item.name}
            </span>
            {item.special_instructions && (
              <span className="text-orange-300 text-xs">*</span>
            )}
          </div>
        ))}
        {order.items.length > 3 && (
          <div className="text-xs text-slate-400">
            +{order.items.length - 3} more items
          </div>
        )}
      </div>

      {/* Special Instructions */}
      {order.specialInstructions && (
        <div className="bg-yellow-500/20 border border-yellow-500/30 rounded p-2 mb-3">
          <div className="text-xs text-yellow-300 font-semibold mb-1">Special Instructions:</div>
          <div className="text-xs text-yellow-100">{order.specialInstructions}</div>
        </div>
      )}

      {/* Timing */}
      <div className="flex items-center justify-between mb-3 text-sm">
        <div className="flex items-center space-x-1">
          <Clock className="w-4 h-4" />
          <span>Elapsed: {timeElapsed}m</span>
        </div>
        <div className="flex items-center space-x-1">
          <Timer className="w-4 h-4" />
          <span className={timeRemaining <= 0 ? 'text-red-400' : 'text-slate-300'}>
            {timeRemaining > 0 ? `${timeRemaining}m left` : 'Overdue'}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-2">
        {getStatusActions(order.status).map((action, index) => (
          <Button
            key={index}
            size="sm"
            className={`w-full ${action.color}`}
            onClick={(e) => {
              e.stopPropagation();
              onStatusUpdate(order.id, action.status);
            }}
          >
            {action.label}
          </Button>
        ))}
      </div>
    </motion.div>
  );
};

export default ChefHatDisplay;