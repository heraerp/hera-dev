'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Timer,
  Play,
  CheckCircle,
  AlertTriangle,
  Clock,
  Bell,
  Flame,
  Users,
  Wifi,
  WifiOff,
  Volume2,
  VolumeX,
  Maximize,
  Minimize
} from 'lucide-react';
import { useRealtimeOrders } from '@/hooks/useRealtimeOrders';

interface OptimizedChefHatDisplayProps {
  restaurantId: string;
  stationId?: string; // For specialized kitchen stations
  staffId?: string;
}

// Steve Krug: Zero thinking - instant visual recognition
const OptimizedChefHatDisplay: React.FC<OptimizedChefHatDisplayProps> = ({
  restaurantId,
  stationId,
  staffId
}) => {
  const { orders, isConnected, updateOrderStatus } = useRealtimeOrders({
    restaurantId,
    orderType: 'kitchen'
  });

  const [currentTime, setCurrentTime] = useState(new Date());
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);

  // Update time every second for precise timing
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Steve Krug: Categorize by urgency - no thinking required
  const emergencyOrders = orders.filter(order => {
    const elapsed = getTimeElapsed(order.timestamp);
    return elapsed > order.estimatedTime + 5; // 5+ minutes overdue
  });

  const urgentOrders = orders.filter(order => {
    const elapsed = getTimeElapsed(order.timestamp);
    return elapsed > order.estimatedTime && elapsed <= order.estimatedTime + 5;
  });

  const normalOrders = orders.filter(order => {
    const elapsed = getTimeElapsed(order.timestamp);
    return elapsed <= order.estimatedTime;
  });

  const getTimeElapsed = (orderTime: string) => {
    return Math.floor((currentTime.getTime() - new Date(orderTime).getTime()) / 60000);
  };

  const getTimeStatus = (orderTime: string, estimatedTime: number) => {
    const elapsed = getTimeElapsed(orderTime);
    if (elapsed > estimatedTime + 5) return 'emergency';
    if (elapsed > estimatedTime) return 'urgent';
    if (elapsed > estimatedTime * 0.8) return 'warning';
    return 'normal';
  };

  // Steve Krug: One-tap status change with audio feedback
  const handleStatusChange = async (orderId: string, newStatus: string) => {
    const success = await updateOrderStatus(orderId, newStatus as any);
    
    if (success && soundEnabled) {
      // Audio feedback for actions
      const audio = new Audio('/sounds/kitchen-action.mp3');
      audio.volume = 0.3;
      audio.play().catch(() => {}); // Fail silently
    }
    
    setSelectedOrder(null);
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div className={`bg-slate-900 text-white ${isFullscreen ? 'fixed inset-0 z-50' : 'min-h-screen'}`}>
      {/* Steve Krug: Essential info only - no clutter */}
      <header className="bg-slate-800 p-4 border-b border-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="text-3xl">👨‍🍳</div>
            <div>
              <h1 className="text-2xl font-bold">KITCHEN</h1>
              <div className="text-slate-300">{currentTime.toLocaleTimeString()}</div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Connection status - critical for kitchen */}
            <div className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
              isConnected ? 'bg-green-600' : 'bg-red-600'
            }`}>
              {isConnected ? <Wifi className="w-5 h-5" /> : <WifiOff className="w-5 h-5" />}
              <span className="font-bold">{isConnected ? 'ONLINE' : 'OFFLINE'}</span>
            </div>

            {/* Sound toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-3 bg-slate-700 rounded-lg hover:bg-slate-600"
            >
              {soundEnabled ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
            </button>

            {/* Fullscreen toggle */}
            <button
              onClick={toggleFullscreen}
              className="p-3 bg-slate-700 rounded-lg hover:bg-slate-600"
            >
              {isFullscreen ? <Minimize className="w-6 h-6" /> : <Maximize className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      <div className="p-6 space-y-6">
        {/* Steve Krug: EMERGENCY FIRST - impossible to miss */}
        {emergencyOrders.length > 0 && (
          <EmergencySection 
            orders={emergencyOrders}
            onStatusChange={handleStatusChange}
            getTimeElapsed={getTimeElapsed}
          />
        )}

        {/* URGENT ORDERS */}
        {urgentOrders.length > 0 && (
          <UrgentSection 
            orders={urgentOrders}
            onStatusChange={handleStatusChange}
            getTimeElapsed={getTimeElapsed}
          />
        )}

        {/* NORMAL ORDERS */}
        <NormalSection 
          orders={normalOrders}
          onStatusChange={handleStatusChange}
          getTimeElapsed={getTimeElapsed}
        />

        {/* No orders message */}
        {orders.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-3xl font-bold text-green-400">ALL CAUGHT UP!</h2>
            <p className="text-slate-400 text-xl mt-2">No orders pending</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Steve Krug: Emergency orders - RED EVERYWHERE, impossible to miss
const EmergencySection: React.FC<{
  orders: any[];
  onStatusChange: (id: string, status: string) => void;
  getTimeElapsed: (time: string) => number;
}> = ({ orders, onStatusChange, getTimeElapsed }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="bg-red-600 rounded-xl p-6 border-4 border-red-400"
  >
    <div className="flex items-center space-x-3 mb-6">
      <motion.div
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ repeat: Infinity, duration: 1 }}
      >
        <AlertTriangle className="w-10 h-10 text-red-100" />
      </motion.div>
      <div>
        <h2 className="text-3xl font-bold text-red-100">🚨 EMERGENCY ORDERS</h2>
        <p className="text-red-200">OVERDUE - COOK IMMEDIATELY</p>
      </div>
    </div>

    <div className="grid lg:grid-cols-2 gap-4">
      {orders.map(order => (
        <EmergencyOrderCard 
          key={order.id}
          order={order}
          onStatusChange={onStatusChange}
          timeElapsed={getTimeElapsed(order.timestamp)}
        />
      ))}
    </div>
  </motion.div>
);

// Steve Krug: Urgent orders - YELLOW/ORANGE, clearly needs attention
const UrgentSection: React.FC<{
  orders: any[];
  onStatusChange: (id: string, status: string) => void;
  getTimeElapsed: (time: string) => number;
}> = ({ orders, onStatusChange, getTimeElapsed }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-orange-600 rounded-xl p-6"
  >
    <div className="flex items-center space-x-3 mb-6">
      <Timer className="w-8 h-8 text-orange-100" />
      <div>
        <h2 className="text-2xl font-bold text-orange-100">⏰ URGENT ORDERS</h2>
        <p className="text-orange-200">Over time limit</p>
      </div>
      <div className="bg-orange-500 text-orange-100 px-4 py-2 rounded-lg font-bold">
        {orders.length}
      </div>
    </div>

    <div className="grid lg:grid-cols-3 gap-4">
      {orders.map(order => (
        <UrgentOrderCard 
          key={order.id}
          order={order}
          onStatusChange={onStatusChange}
          timeElapsed={getTimeElapsed(order.timestamp)}
        />
      ))}
    </div>
  </motion.div>
);

// Steve Krug: Normal orders - Clean, organized, easy to scan
const NormalSection: React.FC<{
  orders: any[];
  onStatusChange: (id: string, status: string) => void;
  getTimeElapsed: (time: string) => number;
}> = ({ orders, onStatusChange, getTimeElapsed }) => (
  <div className="space-y-4">
    <div className="flex items-center space-x-3">
      <CheckCircle className="w-6 h-6 text-green-400" />
      <h2 className="text-xl font-bold text-slate-200">ON TIME ORDERS</h2>
      <div className="bg-green-600 text-green-100 px-3 py-1 rounded font-bold">
        {orders.length}
      </div>
    </div>

    <div className="grid lg:grid-cols-4 gap-4">
      {orders.map(order => (
        <NormalOrderCard 
          key={order.id}
          order={order}
          onStatusChange={onStatusChange}
          timeElapsed={getTimeElapsed(order.timestamp)}
        />
      ))}
    </div>
  </div>
);

// Steve Krug: Emergency card - MASSIVE, RED, OBVIOUS
const EmergencyOrderCard: React.FC<{
  order: any;
  onStatusChange: (id: string, status: string) => void;
  timeElapsed: number;
}> = ({ order, onStatusChange, timeElapsed }) => (
  <motion.div
    animate={{ 
      borderColor: ['#dc2626', '#ef4444', '#dc2626'],
      boxShadow: ['0 0 20px rgba(220, 38, 38, 0.5)', '0 0 30px rgba(220, 38, 38, 0.8)', '0 0 20px rgba(220, 38, 38, 0.5)']
    }}
    transition={{ repeat: Infinity, duration: 2 }}
    className="bg-red-700 rounded-xl p-6 border-4 border-red-500"
  >
    <div className="text-center space-y-4">
      <div className="text-4xl font-bold text-red-100">#{order.orderNumber}</div>
      <div className="text-2xl text-red-100">Table {order.tableNumber}</div>
      
      <div className="bg-red-800 rounded-lg p-3">
        <div className="text-red-100 text-lg font-bold">
          OVERDUE: {timeElapsed - order.estimatedTime} MIN
        </div>
      </div>

      {/* Steve Krug: GIANT action button - impossible to miss */}
      <motion.button
        onClick={() => onStatusChange(order.id, 'preparing')}
        className="w-full bg-white text-red-600 py-6 rounded-xl text-2xl font-bold hover:bg-red-50"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        🔥 START COOKING NOW
      </motion.button>

      <motion.button
        onClick={() => onStatusChange(order.id, 'ready')}
        className="w-full bg-green-500 text-white py-4 rounded-xl text-xl font-bold hover:bg-green-400"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        ✅ MARK READY
      </motion.button>
    </div>
  </motion.div>
);

// Steve Krug: Urgent card - ORANGE, clear action needed
const UrgentOrderCard: React.FC<{
  order: any;
  onStatusChange: (id: string, status: string) => void;
  timeElapsed: number;
}> = ({ order, onStatusChange, timeElapsed }) => (
  <div className="bg-orange-700 rounded-xl p-4 border-2 border-orange-500">
    <div className="text-center space-y-3">
      <div className="text-2xl font-bold text-orange-100">#{order.orderNumber}</div>
      <div className="text-lg text-orange-100">Table {order.tableNumber}</div>
      
      <div className="bg-orange-800 rounded p-2">
        <div className="text-orange-100 font-bold">
          +{timeElapsed - order.estimatedTime} MIN LATE
        </div>
      </div>

      <div className="space-y-2">
        <button
          onClick={() => onStatusChange(order.id, 'preparing')}
          className="w-full bg-orange-500 text-white py-3 rounded-lg font-bold hover:bg-orange-400"
        >
          🍳 COOK NOW
        </button>
        
        <button
          onClick={() => onStatusChange(order.id, 'ready')}
          className="w-full bg-green-500 text-white py-3 rounded-lg font-bold hover:bg-green-400"
        >
          ✅ READY
        </button>
      </div>
    </div>
  </div>
);

// Steve Krug: Normal card - Clean, simple, organized
const NormalOrderCard: React.FC<{
  order: any;
  onStatusChange: (id: string, status: string) => void;
  timeElapsed: number;
}> = ({ order, onStatusChange, timeElapsed }) => {
  const timeRemaining = Math.max(0, order.estimatedTime - timeElapsed);
  
  return (
    <div className="bg-slate-700 rounded-xl p-4 border border-slate-600">
      <div className="text-center space-y-3">
        <div className="text-xl font-bold text-slate-100">#{order.orderNumber}</div>
        <div className="text-slate-200">Table {order.tableNumber}</div>
        
        <div className={`rounded p-2 ${timeRemaining <= 3 ? 'bg-yellow-600' : 'bg-slate-600'}`}>
          <div className="text-slate-100 font-bold">
            {timeRemaining}m left
          </div>
        </div>

        <div className="space-y-2">
          {order.status === 'confirmed' && (
            <button
              onClick={() => onStatusChange(order.id, 'preparing')}
              className="w-full bg-blue-500 text-white py-2 rounded font-bold hover:bg-blue-400"
            >
              ▶️ START
            </button>
          )}
          
          {order.status === 'preparing' && (
            <button
              onClick={() => onStatusChange(order.id, 'ready')}
              className="w-full bg-green-500 text-white py-2 rounded font-bold hover:bg-green-400"
            >
              ✅ DONE
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OptimizedChefHatDisplay;