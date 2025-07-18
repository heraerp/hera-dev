'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Users, 
  CreditCard,
  Sparkles,
  Bell,
  Eye,
  DollarSign,
  Utensils,
  Timer,
  RefreshCw
} from 'lucide-react';
import { useRealtimeOrders } from '@/hooks/useRealtimeOrders';
import { useRestaurantAuth } from '@/hooks/useRestaurantAuth';
import { Card } from '@/components/ui/revolutionary-card';
import { Button } from '@/components/ui/revolutionary-button';
import { Badge } from '@/components/ui/badge';

interface Table {
  id: number;
  status: 'empty' | 'seated' | 'ordering' | 'ordered' | 'eating' | 'ready_to_pay' | 'cleaning';
  customers: number;
  orders: any[];
  seatedAt?: Date;
  lastOrderAt?: Date;
  totalAmount?: number;
  waitTime?: number;
  needsAttention?: boolean;
  server?: string;
}

interface WaiterDashboardProps {
  restaurantId: string;
  waiterId: string;
}

const WaiterDashboard: React.FC<WaiterDashboardProps> = ({ restaurantId, waiterId }) => {
  const { staff } = useRestaurantAuth();
  const { orders, isConnected } = useRealtimeOrders({ restaurantId, orderType: 'all' });
  
  const [tables, setTables] = useState<Table[]>([]);
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Mock table data - in real app, this would come from API
  useEffect(() => {
    const mockTables: Table[] = Array.from({ length: 20 }, (_, i) => {
      const tableNumber = i + 1;
      const statuses: Table['status'][] = ['empty', 'seated', 'ordering', 'ordered', 'eating', 'ready_to_pay'];
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
      
      return {
        id: tableNumber,
        status: randomStatus,
        customers: randomStatus === 'empty' ? 0 : Math.floor(Math.random() * 6) + 1,
        orders: orders.filter(order => order.tableNumber === tableNumber),
        seatedAt: randomStatus !== 'empty' ? new Date(Date.now() - Math.random() * 2 * 60 * 60 * 1000) : undefined,
        lastOrderAt: randomStatus !== 'empty' && randomStatus !== 'seated' ? new Date(Date.now() - Math.random() * 60 * 60 * 1000) : undefined,
        totalAmount: randomStatus !== 'empty' && randomStatus !== 'seated' ? Math.random() * 100 + 20 : undefined,
        waitTime: randomStatus !== 'empty' ? Math.floor(Math.random() * 45) + 5 : undefined,
        needsAttention: Math.random() > 0.8,
        server: randomStatus !== 'empty' ? (Math.random() > 0.5 ? staff?.firstName : 'Other Server') : undefined
      };
    });
    setTables(mockTables);
  }, [orders, staff]);

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Steve Krug: Color coding that everyone understands
  const getTableStatusColor = (table: Table) => {
    if (table.needsAttention) return 'bg-red-500'; // Emergency red
    
    switch (table.status) {
      case 'empty': return 'bg-slate-200';
      case 'seated': return 'bg-yellow-400'; // Needs attention - yellow
      case 'ordering': return 'bg-blue-400'; // In progress - blue  
      case 'ordered': return 'bg-orange-400'; // Waiting - orange
      case 'eating': return 'bg-green-400'; // Good - green
      case 'ready_to_pay': return 'bg-purple-400'; // Payment - purple
      case 'cleaning': return 'bg-slate-400'; // Cleaning - gray
      default: return 'bg-slate-200';
    }
  };

  const getTableStatusText = (table: Table) => {
    if (table.needsAttention) return 'HELP NEEDED';
    
    switch (table.status) {
      case 'empty': return 'Available';
      case 'seated': return 'Just Seated';
      case 'ordering': return 'Taking Order';
      case 'ordered': return `Order Sent`;
      case 'eating': return 'Enjoying Meal';
      case 'ready_to_pay': return 'Ready to Pay';
      case 'cleaning': return 'Being Cleaned';
      default: return 'Unknown';
    }
  };

  const getTableIcon = (table: Table) => {
    if (table.needsAttention) return <Bell className="w-4 h-4" />;
    
    switch (table.status) {
      case 'empty': return <Sparkles className="w-4 h-4" />;
      case 'seated': return <Users className="w-4 h-4" />;
      case 'ordering': return <Utensils className="w-4 h-4" />;
      case 'ordered': return <Timer className="w-4 h-4" />;
      case 'eating': return <Utensils className="w-4 h-4" />;
      case 'ready_to_pay': return <CreditCard className="w-4 h-4" />;
      case 'cleaning': return <Sparkles className="w-4 h-4" />;
      default: return <Users className="w-4 h-4" />;
    }
  };

  // Steve Krug: Group tables by urgency/priority
  const urgentTables = tables.filter(t => t.needsAttention || t.status === 'seated' || t.status === 'ready_to_pay');
  const activeTables = tables.filter(t => !t.needsAttention && ['ordering', 'ordered', 'eating'].includes(t.status));
  const availableTables = tables.filter(t => t.status === 'empty');

  const myTables = tables.filter(t => t.server === staff?.firstName);
  const otherTables = tables.filter(t => t.server !== staff?.firstName);

  return (
    <div className="min-h-screen bg-slate-50 p-4">
      {/* Steve Krug: Essential info only in header */}
      <div className="max-w-7xl mx-auto">
        <header className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-800">
                  Welcome, {staff?.firstName}!
                </h1>
                <p className="text-slate-600">{currentTime.toLocaleString()}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Connection status */}
              <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
                isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-sm font-medium">{isConnected ? 'Online' : 'Offline'}</span>
              </div>
              
              <Button
                leftIcon={<RefreshCw className="w-4 h-4" />}
                variant="outline"
              >
                Refresh
              </Button>
            </div>
          </div>
        </header>

        {/* Steve Krug: Most urgent things first */}
        {urgentTables.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center space-x-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <h2 className="text-xl font-bold text-red-600">NEEDS IMMEDIATE ATTENTION</h2>
              <Badge className="bg-red-100 text-red-800">{urgentTables.length}</Badge>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {urgentTables.map(table => (
                <TableCard 
                  key={table.id} 
                  table={table} 
                  onSelect={setSelectedTable}
                  urgent={true}
                />
              ))}
            </div>
          </div>
        )}

        {/* My Tables */}
        <div className="mb-8">
          <div className="flex items-center space-x-2 mb-4">
            <Users className="w-5 h-5 text-blue-500" />
            <h2 className="text-xl font-bold text-slate-800">My Tables</h2>
            <Badge className="bg-blue-100 text-blue-800">{myTables.length}</Badge>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {myTables.map(table => (
              <TableCard 
                key={table.id} 
                table={table} 
                onSelect={setSelectedTable}
              />
            ))}
          </div>
        </div>

        {/* Available Tables */}
        <div className="mb-8">
          <div className="flex items-center space-x-2 mb-4">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <h2 className="text-xl font-bold text-slate-800">Available Tables</h2>
            <Badge className="bg-green-100 text-green-800">{availableTables.length}</Badge>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {availableTables.map(table => (
              <TableCard 
                key={table.id} 
                table={table} 
                onSelect={setSelectedTable}
              />
            ))}
          </div>
        </div>

        {/* Quick Actions - Steve Krug: Obvious, big buttons for common tasks */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Button
            size="lg"
            className="h-20 bg-green-500 hover:bg-green-600 text-white flex flex-col items-center space-y-2"
            leftIcon={<Plus className="w-6 h-6" />}
          >
            <span className="text-lg font-semibold">New Order</span>
            <span className="text-sm opacity-90">Seat & Take Order</span>
          </Button>
          
          <Button
            size="lg"
            variant="outline"
            className="h-20 flex flex-col items-center space-y-2"
            leftIcon={<Eye className="w-6 h-6" />}
          >
            <span className="text-lg font-semibold">Check Orders</span>
            <span className="text-sm opacity-70">ChefHat Status</span>
          </Button>
          
          <Button
            size="lg"
            variant="outline"
            className="h-20 flex flex-col items-center space-y-2"
            leftIcon={<CreditCard className="w-6 h-6" />}
          >
            <span className="text-lg font-semibold">Process Payment</span>
            <span className="text-sm opacity-70">Checkout Customer</span>
          </Button>
          
          <Button
            size="lg"
            variant="outline"
            className="h-20 flex flex-col items-center space-y-2"
            leftIcon={<Sparkles className="w-6 h-6" />}
          >
            <span className="text-lg font-semibold">Clean Table</span>
            <span className="text-sm opacity-70">Ready for Next Guest</span>
          </Button>
        </div>

        {/* All Other Tables */}
        <div>
          <div className="flex items-center space-x-2 mb-4">
            <Users className="w-5 h-5 text-slate-500" />
            <h2 className="text-xl font-bold text-slate-800">All Tables</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-10 gap-3">
            {Array.from({ length: 50 }, (_, i) => i + 1).map(tableNum => {
              const table = tables.find(t => t.id === tableNum) || {
                id: tableNum,
                status: 'empty' as const,
                customers: 0,
                orders: []
              };
              return (
                <TableCard 
                  key={tableNum} 
                  table={table} 
                  onSelect={setSelectedTable}
                  compact={true}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

// Steve Krug: Each table card shows status at a glance
const TableCard: React.FC<{ 
  table: Table; 
  onSelect: (id: number) => void; 
  urgent?: boolean;
  compact?: boolean;
}> = ({ table, onSelect, urgent = false, compact = false }) => {
  const getTableStatusColor = (table: Table) => {
    if (table.needsAttention) return 'bg-red-500 text-white';
    
    switch (table.status) {
      case 'empty': return 'bg-slate-100 text-slate-600 border-2 border-dashed border-slate-300';
      case 'seated': return 'bg-yellow-400 text-yellow-900';
      case 'ordering': return 'bg-blue-400 text-blue-900';
      case 'ordered': return 'bg-orange-400 text-orange-900';
      case 'eating': return 'bg-green-400 text-green-900';
      case 'ready_to_pay': return 'bg-purple-400 text-purple-900';
      case 'cleaning': return 'bg-slate-400 text-slate-900';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  const getTableStatusText = (table: Table) => {
    if (table.needsAttention) return 'HELP!';
    
    switch (table.status) {
      case 'empty': return 'Empty';
      case 'seated': return 'Seated';
      case 'ordering': return 'Ordering';
      case 'ordered': return 'Cooking';
      case 'eating': return 'Eating';
      case 'ready_to_pay': return 'Pay';
      case 'cleaning': return 'Clean';
      default: return '';
    }
  };

  if (compact) {
    return (
      <motion.button
        onClick={() => onSelect(table.id)}
        className={`aspect-square rounded-lg p-2 text-center transition-all hover:scale-105 ${getTableStatusColor(table)}`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <div className="text-lg font-bold">{table.id}</div>
        {table.customers > 0 && (
          <div className="text-xs">{table.customers} 👥</div>
        )}
      </motion.button>
    );
  }

  return (
    <motion.button
      onClick={() => onSelect(table.id)}
      className={`p-4 rounded-xl transition-all hover:scale-105 ${getTableStatusColor(table)} ${
        urgent ? 'ring-2 ring-red-500 ring-opacity-50' : ''
      }`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <div className="text-center space-y-2">
        <div className="text-2xl font-bold">Table {table.id}</div>
        <div className="text-sm font-medium">{getTableStatusText(table)}</div>
        
        {table.customers > 0 && (
          <div className="flex items-center justify-center space-x-1">
            <Users className="w-3 h-3" />
            <span className="text-xs">{table.customers}</span>
          </div>
        )}
        
        {table.totalAmount && (
          <div className="flex items-center justify-center space-x-1">
            <DollarSign className="w-3 h-3" />
            <span className="text-xs">${table.totalAmount.toFixed(0)}</span>
          </div>
        )}
        
        {table.waitTime && (
          <div className="flex items-center justify-center space-x-1">
            <Clock className="w-3 h-3" />
            <span className="text-xs">{table.waitTime}m</span>
          </div>
        )}
      </div>
    </motion.button>
  );
};

export default WaiterDashboard;