"use client"

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/revolutionary-card';
import { Button } from '@/components/ui/revolutionary-button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import motionConfig from '@/lib/motion';

// Sales & Money Dashboard - Simple Financial Overview
export default function SalesMoneyPage() {
  const [salesData, setSalesData] = useState({
    lastUpdate: new Date().toLocaleTimeString(),
    today: {
      revenue: 28470,
      orders: 127,
      avgOrderValue: 224.17,
      profit: 8541,
      expenses: 19929
    },
    yesterday: {
      revenue: 25630,
      orders: 118,
      avgOrderValue: 217.20,
      profit: 7689,
      expenses: 17941
    },
    thisWeek: {
      revenue: 156780,
      orders: 731,
      profit: 47034,
      expenses: 109746
    },
    lastWeek: {
      revenue: 142350,
      orders: 682,
      profit: 42705,
      expenses: 99645
    },
    upcomingBills: [
      { id: 1, name: 'Rent Payment', amount: 45000, due: '2 days', type: 'fixed', emoji: '🏠' },
      { id: 2, name: 'Electricity Bill', amount: 8500, due: '5 days', type: 'utility', emoji: '⚡' },
      { id: 3, name: 'Staff Salaries', amount: 125000, due: '12 days', type: 'payroll', emoji: '👥' },
      { id: 4, name: 'Insurance Premium', amount: 15000, due: '18 days', type: 'insurance', emoji: '🛡️' }
    ],
    recentTransactions: [
      { id: 1, type: 'income', description: 'Table 12 - Dinner Order', amount: 890, time: '5 min ago', method: 'card', emoji: '💳' },
      { id: 2, type: 'income', description: 'Table 8 - Lunch Order', amount: 650, time: '12 min ago', method: 'cash', emoji: '💵' },
      { id: 3, type: 'expense', description: 'Fresh Vegetables - Market', amount: -1200, time: '1 hour ago', method: 'cash', emoji: '🥬' },
      { id: 4, type: 'income', description: 'Table 15 - Family Dinner', amount: 1340, time: '1.5 hours ago', method: 'upi', emoji: '📱' },
      { id: 5, type: 'expense', description: 'Gas Cylinder Refill', amount: -850, time: '2 hours ago', method: 'cash', emoji: '🔥' },
      { id: 6, type: 'income', description: 'Table 3 - Business Lunch', amount: 2100, time: '3 hours ago', method: 'card', emoji: '💼' }
    ]
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const calculateChange = (current: number, previous: number) => {
    const change = ((current - previous) / previous) * 100;
    return {
      percentage: Math.abs(change).toFixed(1),
      isPositive: change >= 0,
      isSignificant: Math.abs(change) >= 5
    };
  };

  const todayVsYesterday = {
    revenue: calculateChange(salesData.today.revenue, salesData.yesterday.revenue),
    orders: calculateChange(salesData.today.orders, salesData.yesterday.orders),
    profit: calculateChange(salesData.today.profit, salesData.yesterday.profit)
  };

  const weekComparison = {
    revenue: calculateChange(salesData.thisWeek.revenue, salesData.lastWeek.revenue),
    orders: calculateChange(salesData.thisWeek.orders, salesData.lastWeek.orders),
    profit: calculateChange(salesData.thisWeek.profit, salesData.lastWeek.profit)
  };

  const addExpense = () => {
    // This would open an expense form
    alert('Add Expense form would open here');
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
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.history.back()}
                className="p-2"
              >
                <span className="text-xl">←</span>
              </Button>
              
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center shadow-sm">
                  <span className="text-2xl">💰</span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Sales & Money</h1>
                  <p className="text-sm text-gray-600">📊 Financial Overview • Last update: {salesData.lastUpdate}</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={addExpense}
                className="flex items-center space-x-2"
              >
                <span className="text-lg">+</span>
                <span>Add Expense</span>
              </Button>
            </div>
          </div>
        </div>
      </motion.header>

      <div className="p-4 space-y-6">
        {/* Today's Big Numbers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={motionConfig.spring.swift}
          className="space-y-4"
        >
          <h2 className="text-xl font-bold text-gray-800 flex items-center space-x-2">
            <span>📈</span>
            <span>TODAY'S PERFORMANCE</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Revenue */}
            <Card variant="glass" className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 shadow-lg">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-2xl">💵</span>
                  <TrendBadge 
                    change={todayVsYesterday.revenue.percentage} 
                    isPositive={todayVsYesterday.revenue.isPositive} 
                  />
                </div>
                <div>
                  <div className="text-3xl font-bold text-green-800">
                    {formatCurrency(salesData.today.revenue)}
                  </div>
                  <div className="text-sm text-green-600 font-medium">Total Revenue</div>
                </div>
                <div className="text-xs text-green-700">
                  Yesterday: {formatCurrency(salesData.yesterday.revenue)}
                </div>
              </div>
            </Card>

            {/* Profit */}
            <Card variant="glass" className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-lg">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-2xl">💎</span>
                  <TrendBadge 
                    change={todayVsYesterday.profit.percentage} 
                    isPositive={todayVsYesterday.profit.isPositive} 
                  />
                </div>
                <div>
                  <div className="text-3xl font-bold text-blue-800">
                    {formatCurrency(salesData.today.profit)}
                  </div>
                  <div className="text-sm text-blue-600 font-medium">Net Profit</div>
                </div>
                <div className="text-xs text-blue-700">
                  Margin: {((salesData.today.profit / salesData.today.revenue) * 100).toFixed(1)}%
                </div>
              </div>
            </Card>

            {/* Orders */}
            <Card variant="glass" className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 shadow-lg">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-2xl">🍽️</span>
                  <TrendBadge 
                    change={todayVsYesterday.orders.percentage} 
                    isPositive={todayVsYesterday.orders.isPositive} 
                  />
                </div>
                <div>
                  <div className="text-3xl font-bold text-purple-800">
                    {salesData.today.orders}
                  </div>
                  <div className="text-sm text-purple-600 font-medium">Total Orders</div>
                </div>
                <div className="text-xs text-purple-700">
                  Avg: {formatCurrency(salesData.today.avgOrderValue)}
                </div>
              </div>
            </Card>
          </div>
        </motion.div>

        {/* Week Comparison */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...motionConfig.spring.swift, delay: 0.1 }}
        >
          <Card variant="glass" className="p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center space-x-2">
              <span>📊</span>
              <span>THIS WEEK vs LAST WEEK</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <WeekComparisonItem
                title="Revenue"
                thisWeek={formatCurrency(salesData.thisWeek.revenue)}
                lastWeek={formatCurrency(salesData.lastWeek.revenue)}
                change={weekComparison.revenue}
                emoji="💰"
              />
              <WeekComparisonItem
                title="Orders"
                thisWeek={salesData.thisWeek.orders.toString()}
                lastWeek={salesData.lastWeek.orders.toString()}
                change={weekComparison.orders}
                emoji="📋"
              />
              <WeekComparisonItem
                title="Profit"
                thisWeek={formatCurrency(salesData.thisWeek.profit)}
                lastWeek={formatCurrency(salesData.lastWeek.profit)}
                change={weekComparison.profit}
                emoji="📈"
              />
            </div>
          </Card>
        </motion.div>

        {/* Upcoming Bills & Recent Transactions */}
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...motionConfig.spring.swift, delay: 0.2 }}
        >
          {/* Upcoming Bills */}
          <Card variant="glass" className="p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center space-x-2">
              <span>⏰</span>
              <span>UPCOMING BILLS</span>
            </h3>
            
            <div className="space-y-3">
              {salesData.upcomingBills.map((bill) => (
                <motion.div
                  key={bill.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">{bill.emoji}</span>
                    <div>
                      <div className="font-medium text-gray-800">{bill.name}</div>
                      <div className="text-sm text-gray-600">Due in {bill.due}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-gray-800">{formatCurrency(bill.amount)}</div>
                    <Badge variant="outline" className="text-xs">
                      {bill.type}
                    </Badge>
                  </div>
                </motion.div>
              ))}
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center text-sm">
                <span className="font-medium text-gray-600">Total Due (30 days):</span>
                <span className="font-bold text-lg text-red-600">
                  {formatCurrency(salesData.upcomingBills.reduce((sum, bill) => sum + bill.amount, 0))}
                </span>
              </div>
            </div>
          </Card>

          {/* Recent Transactions */}
          <Card variant="glass" className="p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center space-x-2">
              <span>💳</span>
              <span>RECENT TRANSACTIONS</span>
            </h3>
            
            <div className="space-y-3">
              {salesData.recentTransactions.map((transaction) => (
                <motion.div
                  key={transaction.id}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-lg transition-colors",
                    transaction.type === 'income' 
                      ? "bg-green-50 hover:bg-green-100" 
                      : "bg-red-50 hover:bg-red-100"
                  )}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">{transaction.emoji}</span>
                    <div>
                      <div className="font-medium text-gray-800 text-sm">
                        {transaction.description}
                      </div>
                      <div className="text-xs text-gray-600">
                        {transaction.time} • {transaction.method}
                      </div>
                    </div>
                  </div>
                  <div className={cn(
                    "font-bold",
                    transaction.type === 'income' ? "text-green-600" : "text-red-600"
                  )}>
                    {transaction.type === 'income' ? '+' : ''}{formatCurrency(Math.abs(transaction.amount))}
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...motionConfig.spring.swift, delay: 0.3 }}
        >
          <Card variant="glass" className="p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center space-x-2">
              <span>⚡</span>
              <span>QUICK ACTIONS</span>
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <QuickActionButton emoji="💰" label="Add Expense" color="red" />
              <QuickActionButton emoji="📊" label="View Reports" color="blue" />
              <QuickActionButton emoji="🧾" label="Generate Bill" color="green" />
              <QuickActionButton emoji="📱" label="Send Payment Link" color="purple" />
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

// Trend Badge Component
interface TrendBadgeProps {
  change: string;
  isPositive: boolean;
}

function TrendBadge({ change, isPositive }: TrendBadgeProps) {
  return (
    <div className={cn(
      "flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-bold",
      isPositive 
        ? "bg-green-100 text-green-700" 
        : "bg-red-100 text-red-700"
    )}>
      <span className="text-xs">{isPositive ? '↑' : '↓'}</span>
      <span>{change}%</span>
    </div>
  );
}

// Week Comparison Item Component
interface WeekComparisonItemProps {
  title: string;
  thisWeek: string;
  lastWeek: string;
  change: { percentage: string; isPositive: boolean };
  emoji: string;
}

function WeekComparisonItem({ title, thisWeek, lastWeek, change, emoji }: WeekComparisonItemProps) {
  return (
    <div className="text-center p-4 border border-gray-200 rounded-lg bg-gray-50">
      <div className="text-2xl mb-2">{emoji}</div>
      <div className="text-sm font-medium text-gray-600 mb-1">{title}</div>
      <div className="text-xl font-bold text-gray-800 mb-1">{thisWeek}</div>
      <div className="text-xs text-gray-500 mb-2">vs {lastWeek}</div>
      <TrendBadge change={change.percentage} isPositive={change.isPositive} />
    </div>
  );
}

// Quick Action Button Component
interface QuickActionButtonProps {
  emoji: string;
  label: string;
  color: 'red' | 'blue' | 'green' | 'purple';
}

function QuickActionButton({ emoji, label, color }: QuickActionButtonProps) {
  const colorClasses = {
    red: 'bg-red-50 hover:bg-red-100 text-red-700 border-red-200',
    blue: 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200',
    green: 'bg-green-50 hover:bg-green-100 text-green-700 border-green-200',
    purple: 'bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200'
  };

  return (
    <motion.button
      className={cn(
        "flex flex-col items-center p-4 rounded-lg border transition-all duration-200",
        colorClasses[color]
      )}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <span className="text-2xl mb-2">{emoji}</span>
      <span className="text-sm font-medium">{label}</span>
    </motion.button>
  );
}