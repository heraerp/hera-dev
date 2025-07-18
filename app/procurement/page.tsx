"use client"

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/revolutionary-card';
import { Button } from '@/components/ui/revolutionary-button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import motionConfig from '@/lib/motion';

// Procurement Dashboard - AI-Powered Enterprise Procurement
export default function ProcurementDashboard() {
  const [procurementData, setProcurementData] = useState({
    activeRequests: 12,
    pendingApprovals: 5,
    totalSpent: 247580,
    suppliers: 34,
    avgProcessingTime: 2.3,
    autoApprovalRate: 78,
    lastUpdate: new Date().toLocaleTimeString()
  });

  const [alerts, setAlerts] = useState([
    { id: 1, type: 'urgent', message: '3 requests require director approval', emoji: '⚠️', count: 3 },
    { id: 2, type: 'info', message: 'Budget utilization at 67% for Q1', emoji: '📊', count: null },
    { id: 3, type: 'success', message: '5 requests auto-approved today', emoji: '✅', count: 5 }
  ]);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setProcurementData(prev => ({
        ...prev,
        lastUpdate: new Date().toLocaleTimeString(),
        activeRequests: prev.activeRequests + Math.floor(Math.random() * 3) - 1
      }));
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const mainActions = [
    {
      id: 'new-request',
      title: 'NEW REQUEST',
      subtitle: 'AI-powered procurement',
      emoji: '🤖',
      href: '/procurement/request',
      color: 'bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
      textColor: 'text-white',
      badge: 'Smart AI',
      badgeColor: 'bg-white/90 text-blue-600 backdrop-blur-sm',
      shadow: 'shadow-blue-500/25',
      description: 'Natural language procurement requests'
    },
    {
      id: 'my-requests',
      title: 'MY REQUESTS',
      subtitle: 'Track your submissions',
      emoji: '📋',
      href: '/procurement/my-requests',
      color: 'bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700',
      textColor: 'text-white',
      badge: procurementData.activeRequests,
      badgeColor: 'bg-white/90 text-green-600 backdrop-blur-sm',
      shadow: 'shadow-green-500/25',
      description: 'View and manage your requests'
    },
    {
      id: 'approvals',
      title: 'APPROVALS',
      subtitle: 'Pending your review',
      emoji: '✅',
      href: '/procurement/approvals',
      color: procurementData.pendingApprovals > 0 
        ? 'bg-gradient-to-br from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700'
        : 'bg-gradient-to-br from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700',
      textColor: 'text-white',
      badge: procurementData.pendingApprovals,
      badgeColor: procurementData.pendingApprovals > 0 
        ? 'bg-red-100/90 text-red-800 backdrop-blur-sm border border-red-200'
        : 'bg-white/90 text-gray-600 backdrop-blur-sm',
      shadow: procurementData.pendingApprovals > 0 ? 'shadow-amber-500/25' : 'shadow-gray-500/25',
      description: 'Review and approve requests'
    },
    {
      id: 'suppliers',
      title: 'SUPPLIERS',
      subtitle: 'Supplier intelligence',
      emoji: '🏢',
      href: '/procurement/suppliers',
      color: 'bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700',
      textColor: 'text-white',
      badge: `${procurementData.suppliers} active`,
      badgeColor: 'bg-white/90 text-purple-600 backdrop-blur-sm',
      shadow: 'shadow-purple-500/25',
      description: 'AI-powered supplier matching'
    },
    {
      id: 'analytics',
      title: 'ANALYTICS',
      subtitle: 'Insights & reporting',
      emoji: '📊',
      href: '/procurement/analytics',
      color: 'bg-gradient-to-br from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700',
      textColor: 'text-white',
      badge: 'Live Data',
      badgeColor: 'bg-white/90 text-indigo-600 backdrop-blur-sm',
      shadow: 'shadow-indigo-500/25',
      description: 'Real-time procurement insights'
    },
    {
      id: 'budget',
      title: 'BUDGET',
      subtitle: 'Financial control',
      emoji: '💰',
      href: '/procurement/budget',
      color: 'bg-gradient-to-br from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700',
      textColor: 'text-white',
      badge: formatCurrency(procurementData.totalSpent),
      badgeColor: 'bg-white/90 text-emerald-600 backdrop-blur-sm',
      shadow: 'shadow-emerald-500/25',
      description: 'Budget tracking and validation'
    }
  ];

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'urgent':
        return 'border-l-red-500 bg-red-50 text-red-800';
      case 'warning':
        return 'border-l-amber-500 bg-amber-50 text-amber-800';
      case 'info':
        return 'border-l-blue-500 bg-blue-50 text-blue-800';
      case 'success':
        return 'border-l-green-500 bg-green-50 text-green-800';
      default:
        return 'border-l-gray-500 bg-gray-50 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <motion.header
        className="bg-white shadow-sm sticky top-0 z-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={motionConfig.spring.swift}
      >
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center shadow-sm">
                <span className="text-2xl">🤖</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800 tracking-tight">🚀 HERA Procurement</h1>
                <p className="text-sm text-gray-600">⚡ AI-Powered Enterprise Procurement • Last update: {procurementData.lastUpdate}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden md:grid grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-xl font-bold text-blue-600">{procurementData.activeRequests}</div>
                  <div className="text-gray-600">Active</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-green-600">{procurementData.autoApprovalRate}%</div>
                  <div className="text-gray-600">Auto-Approved</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-purple-600">{procurementData.avgProcessingTime}h</div>
                  <div className="text-gray-600">Avg Time</div>
                </div>
              </div>
              
              <Button variant="ghost" size="sm" className="flex items-center space-x-1">
                <span className="text-lg">🔔</span>
                {alerts.length > 0 && (
                  <Badge className="ml-1 bg-red-500 text-white text-xs">
                    {alerts.length}
                  </Badge>
                )}
              </Button>
              
              <Button variant="ghost" size="sm">
                <span className="text-lg">⚙️</span>
              </Button>
            </div>
          </div>
        </div>
      </motion.header>

      <div className="p-4 space-y-6">
        {/* Alert Banner */}
        {alerts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={motionConfig.spring.swift}
            className="space-y-2"
          >
            {alerts.slice(0, 3).map((alert, index) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ ...motionConfig.spring.swift, delay: index * 0.1 }}
                className={cn(
                  "border-l-4 p-4 rounded-r-xl backdrop-blur-sm",
                  getAlertColor(alert.type)
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-lg flex-shrink-0">{alert.emoji}</span>
                    <span className="text-sm font-medium">{alert.message}</span>
                  </div>
                  {alert.count && (
                    <Badge className="bg-white/90 text-gray-800 border">
                      {alert.count}
                    </Badge>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Quick Stats */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...motionConfig.spring.swift, delay: 0.2 }}
        >
          <QuickStat title="Active Requests" value={procurementData.activeRequests} color="blue" emoji="📋" />
          <QuickStat title="Total Spent" value={formatCurrency(procurementData.totalSpent)} color="green" emoji="💰" />
          <QuickStat title="Pending Approvals" value={procurementData.pendingApprovals} color={procurementData.pendingApprovals > 0 ? "amber" : "gray"} emoji="⏳" />
          <QuickStat title="Active Suppliers" value={procurementData.suppliers} color="purple" emoji="🏢" />
        </motion.div>

        {/* Main Action Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...motionConfig.spring.swift, delay: 0.4 }}
        >
          {mainActions.map((action, index) => (
            <motion.div
              key={action.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ ...motionConfig.spring.bounce, delay: index * 0.1 }}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <div
                className={cn(
                  "p-6 cursor-pointer transition-all duration-300 h-40 rounded-2xl shadow-lg group relative overflow-hidden",
                  action.color,
                  action.shadow
                )}
                onClick={() => window.location.href = action.href}
              >
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity">
                  <div className="absolute -top-4 -right-4 w-20 h-20 bg-white rounded-full"></div>
                  <div className="absolute -bottom-6 -left-6 w-28 h-28 bg-white/50 rounded-full"></div>
                </div>
                
                <div className="relative z-10 flex flex-col justify-between h-full">
                  <div className="flex items-start justify-between">
                    <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center group-hover:bg-white/30 transition-all duration-300 group-hover:scale-110">
                      <span className="text-2xl">{action.emoji}</span>
                    </div>
                    
                    <div className={cn(
                      "px-3 py-1 rounded-xl text-sm font-bold transition-all duration-300 group-hover:scale-105",
                      action.badgeColor
                    )}>
                      {action.badge}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className={cn("text-xl font-bold mb-1 tracking-tight", action.textColor)}>
                      {action.title}
                    </h3>
                    <p className={cn("text-sm opacity-90 mb-1", action.textColor)}>
                      {action.subtitle}
                    </p>
                    <p className={cn("text-xs opacity-75", action.textColor)}>
                      {action.description}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...motionConfig.spring.swift, delay: 0.6 }}
        >
          <Card variant="glass" className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">🕒 Recent Activity</h3>
            <div className="space-y-3">
              <ActivityItem 
                time="5 min ago"
                action="New procurement request"
                details="Engineering Team • 10 laptops • AI processed"
                type="info"
                emoji="🆕"
              />
              <ActivityItem 
                time="12 min ago"
                action="Auto-approved request"
                details="Office Supplies • $2,450 • Budget validated"
                type="success"
                emoji="✅"
              />
              <ActivityItem 
                time="18 min ago"
                action="Supplier recommendation"
                details="TechSupply Corp • 95% match score"
                type="info"
                emoji="🤖"
              />
              <ActivityItem 
                time="25 min ago"
                action="Budget alert"
                details="Marketing Department • 85% utilization"
                type="warning"
                emoji="⚠️"
              />
              <ActivityItem 
                time="32 min ago"
                action="Approval completed"
                details="Director approved • $15,500 equipment purchase"
                type="success"
                emoji="📋"
              />
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

// Quick Stat Component
interface QuickStatProps {
  title: string;
  value: string | number;
  color: string;
  emoji: string;
}

function QuickStat({ title, value, color, emoji }: QuickStatProps) {
  const colorClasses = {
    blue: 'bg-gradient-to-br from-blue-50 to-blue-100 text-blue-800 border-blue-200 shadow-blue-500/10',
    green: 'bg-gradient-to-br from-green-50 to-green-100 text-green-800 border-green-200 shadow-green-500/10',
    amber: 'bg-gradient-to-br from-amber-50 to-orange-100 text-amber-800 border-amber-200 shadow-amber-500/10',
    purple: 'bg-gradient-to-br from-purple-50 to-purple-100 text-purple-800 border-purple-200 shadow-purple-500/10',
    gray: 'bg-gradient-to-br from-gray-50 to-gray-100 text-gray-800 border-gray-200 shadow-gray-500/10'
  };

  return (
    <Card variant="glass" className={cn("p-4 border shadow-lg transition-all duration-300 hover:scale-105", colorClasses[color as keyof typeof colorClasses])}>
      <div className="text-center space-y-2">
        <div className="text-xl mb-1">{emoji}</div>
        <div className="text-xl font-bold tracking-tight">{value}</div>
        <div className="text-sm font-medium opacity-75">{title}</div>
      </div>
    </Card>
  );
}

// Activity Item Component
interface ActivityItemProps {
  time: string;
  action: string;
  details: string;
  type: 'success' | 'warning' | 'info';
  emoji: string;
}

function ActivityItem({ time, action, details, type, emoji }: ActivityItemProps) {
  const typeColors = {
    success: 'text-green-700',
    warning: 'text-amber-700',
    info: 'text-blue-700'
  };

  const bgColors = {
    success: 'bg-green-50',
    warning: 'bg-amber-50',
    info: 'bg-blue-50'
  };

  return (
    <div className={cn("flex items-start space-x-4 p-3 rounded-lg transition-all duration-200 hover:scale-[1.02]", bgColors[type])}>
      <div className="flex items-center space-x-3">
        <span className="text-lg">{emoji}</span>
        <div className="text-xs text-gray-500 w-16 flex-shrink-0">{time}</div>
      </div>
      <div className="flex-1">
        <div className={cn("font-semibold text-sm", typeColors[type])}>{action}</div>
        <div className="text-xs text-gray-600 mt-1">{details}</div>
      </div>
    </div>
  );
}