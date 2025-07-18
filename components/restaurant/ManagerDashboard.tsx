'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Clock,
  Star,
  Activity,
  Bell,
  CheckCircle,
  XCircle,
  Target,
  Utensils,
  Timer,
  ThumbsUp,
  ThumbsDown,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { Card } from '@/components/ui/revolutionary-card';
import { Button } from '@/components/ui/revolutionary-button';
import { Badge } from '@/components/ui/badge';

interface ManagerDashboardProps {
  restaurantId: string;
  managerId: string;
}

interface Alert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  action?: string;
  actionUrl?: string;
}

interface MetricCard {
  title: string;
  value: string | number;
  change: number;
  target?: number;
  status: 'good' | 'warning' | 'critical';
  icon: React.ReactNode;
  action?: string;
}

const ManagerDashboard: React.FC<ManagerDashboardProps> = ({ restaurantId, managerId }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedTimeframe, setSelectedTimeframe] = useState<'today' | 'week' | 'month'>('today');

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Steve Krug: Critical alerts first - impossible to miss
  const criticalAlerts: Alert[] = [
    {
      id: '1',
      type: 'critical',
      title: 'ChefHat Behind Schedule',
      message: '3 orders over 20 minutes late. Customer complaints increasing.',
      timestamp: new Date(Date.now() - 5 * 60000),
      action: 'Check ChefHat',
      actionUrl: '/restaurant/kitchen'
    },
    {
      id: '2',
      type: 'critical',
      title: 'Staff Shortage',
      message: '2 waiters called in sick. Tables 15-20 unassigned.',
      timestamp: new Date(Date.now() - 10 * 60000),
      action: 'Assign Staff',
      actionUrl: '/restaurant/staff'
    }
  ];

  const warnings: Alert[] = [
    {
      id: '3',
      type: 'warning',
      title: 'Low Inventory',
      message: 'Paneer and rice running low. May run out by dinner rush.',
      timestamp: new Date(Date.now() - 30 * 60000),
      action: 'Order Supplies',
      actionUrl: '/restaurant/inventory'
    },
    {
      id: '4',
      type: 'warning',
      title: 'Payment System Slow',
      message: 'Card transactions taking 30+ seconds. 4 customer complaints.',
      timestamp: new Date(Date.now() - 45 * 60000),
      action: 'Check POS',
      actionUrl: '/restaurant/pos'
    }
  ];

  // Steve Krug: Key metrics with instant visual status
  const keyMetrics: MetricCard[] = [
    {
      title: 'Revenue Today',
      value: '$8,420',
      change: 12.5,
      target: 10000,
      status: 'warning', // Below target
      icon: <DollarSign className="w-6 h-6" />,
      action: 'Boost sales'
    },
    {
      title: 'Average Wait Time',
      value: '18 min',
      change: -5.2,
      target: 15,
      status: 'warning', // Above target
      icon: <Clock className="w-6 h-6" />,
      action: 'Speed up service'
    },
    {
      title: 'Customer Satisfaction',
      value: '4.2/5',
      change: -0.3,
      target: 4.5,
      status: 'critical', // Below acceptable
      icon: <Star className="w-6 h-6" />,
      action: 'Address complaints'
    },
    {
      title: 'Orders Completed',
      value: 127,
      change: 8.3,
      target: 120,
      status: 'good',
      icon: <CheckCircle className="w-6 h-6" />
    },
    {
      title: 'Table Turnover',
      value: '2.3x',
      change: 0.2,
      target: 2.5,
      status: 'warning',
      icon: <Activity className="w-6 h-6" />,
      action: 'Improve efficiency'
    },
    {
      title: 'Staff Efficiency',
      value: '87%',
      change: -2.1,
      target: 90,
      status: 'warning',
      icon: <Users className="w-6 h-6" />,
      action: 'Staff training'
    }
  ];

  const getStatusColor = (status: 'good' | 'warning' | 'critical') => {
    switch (status) {
      case 'good': return 'text-green-600 bg-green-50 border-green-200';
      case 'warning': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
    }
  };

  const getAlertColor = (type: 'critical' | 'warning' | 'info') => {
    switch (type) {
      case 'critical': return 'bg-red-500 text-white border-red-600';
      case 'warning': return 'bg-orange-500 text-white border-orange-600';
      case 'info': return 'bg-blue-500 text-white border-blue-600';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Manager Dashboard</h1>
            <p className="text-slate-600">{currentTime.toLocaleDateString()} • {currentTime.toLocaleTimeString()}</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex bg-white rounded-lg border p-1">
              {(['today', 'week', 'month'] as const).map((period) => (
                <button
                  key={period}
                  onClick={() => setSelectedTimeframe(period)}
                  className={`px-4 py-2 rounded capitalize transition-colors ${
                    selectedTimeframe === period 
                      ? 'bg-blue-500 text-white' 
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>
            
            <Button leftIcon={<RefreshCw className="w-4 h-4" />} variant="outline">
              Refresh
            </Button>
          </div>
        </header>

        {/* Steve Krug: CRITICAL ALERTS - Impossible to miss */}
        {criticalAlerts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl p-6 text-white"
          >
            <div className="flex items-center space-x-3 mb-4">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1 }}
              >
                <AlertTriangle className="w-8 h-8" />
              </motion.div>
              <div>
                <h2 className="text-2xl font-bold">🚨 URGENT ATTENTION REQUIRED</h2>
                <p className="text-red-100">Critical issues affecting restaurant operations</p>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              {criticalAlerts.map(alert => (
                <AlertCard key={alert.id} alert={alert} critical={true} />
              ))}
            </div>
          </motion.div>
        )}

        {/* Steve Krug: Key metrics with visual status indicators */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {keyMetrics.map((metric, index) => (
            <MetricCard key={index} metric={metric} />
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Performance Overview */}
          <div className="lg:col-span-2 space-y-6">
            {/* Today's Performance */}
            <Card className="p-6">
              <h3 className="text-xl font-bold text-slate-800 mb-4">Today's Performance</h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <PerformanceIndicator
                  title="Orders On Time"
                  value={85}
                  target={95}
                  unit="%"
                  trend="down"
                  status="warning"
                />
                <PerformanceIndicator
                  title="Revenue Target"
                  value={84}
                  target={100}
                  unit="%"
                  trend="up"
                  status="warning"
                />
                <PerformanceIndicator
                  title="Customer Complaints"
                  value={7}
                  target={3}
                  unit=""
                  trend="up"
                  status="critical"
                />
                <PerformanceIndicator
                  title="Staff Utilization"
                  value={92}
                  target={85}
                  unit="%"
                  trend="up"
                  status="good"
                />
              </div>
            </Card>

            {/* Staff Performance */}
            <Card className="p-6">
              <h3 className="text-xl font-bold text-slate-800 mb-4">Staff Performance</h3>
              
              <div className="space-y-4">
                {[
                  { name: 'Priya Sharma', role: 'Head Waiter', score: 95, tables: 8, tips: 420, status: 'good' },
                  { name: 'Raj Kumar', role: 'Chef', score: 88, orders: 45, timing: '16m avg', status: 'good' },
                  { name: 'Anita Singh', role: 'Waiter', score: 72, tables: 6, complaints: 2, status: 'warning' },
                  { name: 'Dev Patel', role: 'Cashier', score: 91, transactions: 127, errors: 1, status: 'good' }
                ].map((staff, index) => (
                  <StaffPerformanceCard key={index} staff={staff} />
                ))}
              </div>
            </Card>
          </div>

          {/* Action Center */}
          <div className="space-y-6">
            {/* Warnings */}
            {warnings.length > 0 && (
              <Card className="p-6 border-l-4 border-orange-500">
                <h3 className="text-lg font-bold text-orange-800 mb-4">⚠️ Warnings</h3>
                <div className="space-y-3">
                  {warnings.map(alert => (
                    <AlertCard key={alert.id} alert={alert} />
                  ))}
                </div>
              </Card>
            )}

            {/* Quick Actions */}
            <Card className="p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-4">Quick Actions</h3>
              
              <div className="space-y-3">
                <QuickActionButton
                  icon={<Users className="w-5 h-5" />}
                  title="Manage Staff"
                  subtitle="Schedules & Performance"
                  urgent={criticalAlerts.some(a => a.title.includes('Staff'))}
                />
                <QuickActionButton
                  icon={<Utensils className="w-5 h-5" />}
                  title="ChefHat Status"
                  subtitle="Orders & Timing"
                  urgent={criticalAlerts.some(a => a.title.includes('ChefHat'))}
                />
                <QuickActionButton
                  icon={<DollarSign className="w-5 h-5" />}
                  title="Financial Report"
                  subtitle="Revenue & Costs"
                />
                <QuickActionButton
                  icon={<Star className="w-5 h-5" />}
                  title="Customer Feedback"
                  subtitle="Reviews & Complaints"
                  urgent={keyMetrics.find(m => m.title.includes('Satisfaction'))?.status === 'critical'}
                />
              </div>
            </Card>

            {/* Goals Progress */}
            <Card className="p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-4">Daily Goals</h3>
              
              <div className="space-y-4">
                <GoalProgress title="Revenue Target" current={8420} target={10000} unit="$" />
                <GoalProgress title="Orders Target" current={127} target={150} unit="" />
                <GoalProgress title="Customer Rating" current={4.2} target={4.5} unit="/5" />
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

// Steve Krug: Each metric card shows status at a glance
const MetricCard: React.FC<{ metric: MetricCard }> = ({ metric }) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    className={`p-4 rounded-lg border-2 ${getStatusColor(metric.status)}`}
  >
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center space-x-2">
        {metric.icon}
        <h3 className="font-medium text-sm">{metric.title}</h3>
      </div>
      {metric.status !== 'good' && (
        <AlertCircle className="w-4 h-4" />
      )}
    </div>
    
    <div className="space-y-1">
      <div className="text-2xl font-bold">{metric.value}</div>
      <div className="flex items-center space-x-2 text-xs">
        {metric.change > 0 ? (
          <TrendingUp className="w-3 h-3 text-green-500" />
        ) : (
          <TrendingDown className="w-3 h-3 text-red-500" />
        )}
        <span>{metric.change > 0 ? '+' : ''}{metric.change}%</span>
      </div>
      {metric.action && (
        <div className="text-xs font-medium opacity-75">
          Action: {metric.action}
        </div>
      )}
    </div>
  </motion.div>
);

// Steve Krug: Alert cards with obvious action buttons
const AlertCard: React.FC<{ alert: Alert; critical?: boolean }> = ({ alert, critical = false }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    className={`p-4 rounded-lg ${critical ? 'bg-red-600 text-white' : 'bg-white border'}`}
  >
    <div className="flex items-start justify-between space-x-3">
      <div className="flex-1">
        <h4 className="font-bold text-sm">{alert.title}</h4>
        <p className="text-sm opacity-90 mt-1">{alert.message}</p>
        <p className="text-xs opacity-75 mt-2">
          {alert.timestamp.toLocaleTimeString()}
        </p>
      </div>
      {alert.action && (
        <Button
          size="sm"
          className={critical ? 'bg-white text-red-600 hover:bg-red-50' : ''}
        >
          {alert.action}
        </Button>
      )}
    </div>
  </motion.div>
);

const PerformanceIndicator: React.FC<{
  title: string;
  value: number;
  target: number;
  unit: string;
  trend: 'up' | 'down';
  status: 'good' | 'warning' | 'critical';
}> = ({ title, value, target, unit, trend, status }) => (
  <div className="p-4 bg-slate-50 rounded-lg">
    <div className="flex items-center justify-between mb-2">
      <h4 className="font-medium text-sm text-slate-700">{title}</h4>
      {trend === 'up' ? (
        <TrendingUp className={`w-4 h-4 ${status === 'good' ? 'text-green-500' : 'text-red-500'}`} />
      ) : (
        <TrendingDown className={`w-4 h-4 ${status === 'good' ? 'text-green-500' : 'text-red-500'}`} />
      )}
    </div>
    <div className="text-2xl font-bold text-slate-800">{value}{unit}</div>
    <div className="text-xs text-slate-500">Target: {target}{unit}</div>
  </div>
);

const StaffPerformanceCard: React.FC<{ staff: any }> = ({ staff }) => (
  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
    <div className="flex items-center space-x-3">
      <div className={`w-2 h-2 rounded-full ${
        staff.status === 'good' ? 'bg-green-500' : 'bg-orange-500'
      }`}></div>
      <div>
        <h4 className="font-medium text-slate-800">{staff.name}</h4>
        <p className="text-sm text-slate-500">{staff.role}</p>
      </div>
    </div>
    <div className="text-right">
      <div className="font-bold text-slate-800">{staff.score}%</div>
      <div className="text-xs text-slate-500">Performance</div>
    </div>
  </div>
);

const QuickActionButton: React.FC<{
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  urgent?: boolean;
}> = ({ icon, title, subtitle, urgent = false }) => (
  <motion.button
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    className={`w-full p-3 rounded-lg border-2 text-left transition-colors ${
      urgent 
        ? 'border-red-200 bg-red-50 hover:bg-red-100' 
        : 'border-slate-200 bg-white hover:bg-slate-50'
    }`}
  >
    <div className="flex items-center space-x-3">
      <div className={urgent ? 'text-red-600' : 'text-slate-600'}>
        {icon}
      </div>
      <div className="flex-1">
        <h4 className={`font-medium ${urgent ? 'text-red-800' : 'text-slate-800'}`}>
          {title}
          {urgent && <Bell className="w-4 h-4 inline ml-2 text-red-500" />}
        </h4>
        <p className={`text-sm ${urgent ? 'text-red-600' : 'text-slate-500'}`}>{subtitle}</p>
      </div>
    </div>
  </motion.button>
);

const GoalProgress: React.FC<{
  title: string;
  current: number;
  target: number;
  unit: string;
}> = ({ title, current, target, unit }) => {
  const percentage = Math.min(100, (current / target) * 100);
  const status = percentage >= 100 ? 'good' : percentage >= 80 ? 'warning' : 'critical';
  
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="font-medium text-slate-700">{title}</span>
        <span className="text-slate-600">{current}{unit} / {target}{unit}</span>
      </div>
      <div className="w-full bg-slate-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all ${
            status === 'good' ? 'bg-green-500' : 
            status === 'warning' ? 'bg-orange-500' : 'bg-red-500'
          }`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

function getStatusColor(status: 'good' | 'warning' | 'critical') {
  switch (status) {
    case 'good': return 'text-green-600 bg-green-50 border-green-200';
    case 'warning': return 'text-orange-600 bg-orange-50 border-orange-200';
    case 'critical': return 'text-red-600 bg-red-50 border-red-200';
  }
}

export default ManagerDashboard;