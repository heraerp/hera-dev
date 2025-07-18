"use client"

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/revolutionary-card';
import { Button } from '@/components/ui/revolutionary-button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import motionConfig from '@/lib/motion';

// Stock Check Screen - "Do I have enough?" Focus
export default function StockCheckPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  const [stockData, setStockData] = useState({
    lastUpdate: new Date().toLocaleTimeString(),
    totalItems: 48,
    lowStockItems: 5,
    criticalItems: 2,
    categories: [
      { id: 'all', name: 'All Items', count: 48, emoji: '📋' },
      { id: 'vegetables', name: 'Vegetables', count: 12, emoji: '🥬' },
      { id: 'meat', name: 'Meat & Fish', count: 8, emoji: '🥩' },
      { id: 'dairy', name: 'Dairy', count: 6, emoji: '🧀' },
      { id: 'spices', name: 'Spices', count: 15, emoji: '🌶️' },
      { id: 'grains', name: 'Rice & Grains', count: 7, emoji: '🌾' }
    ],
    items: [
      // Critical (Red) - 0-1 days left
      { 
        id: 1, 
        name: 'Mozzarella Cheese', 
        currentStock: 2, 
        unit: 'kg', 
        minStock: 5, 
        dailyUsage: 3.2, 
        daysLeft: 0.6, 
        status: 'critical', 
        category: 'dairy',
        price: 12.50,
        supplier: 'Dairy Fresh Co',
        emoji: '🧀',
        lastUpdated: '2 min ago'
      },
      { 
        id: 2, 
        name: 'Fresh Tomatoes', 
        currentStock: 3, 
        unit: 'kg', 
        minStock: 8, 
        dailyUsage: 5.1, 
        daysLeft: 0.8, 
        status: 'critical', 
        category: 'vegetables',
        price: 3.20,
        supplier: 'Green Gardens',
        emoji: '🍅',
        lastUpdated: '5 min ago'
      },
      
      // Low (Amber) - 1-3 days left
      { 
        id: 3, 
        name: 'Chicken Breast', 
        currentStock: 8, 
        unit: 'kg', 
        minStock: 10, 
        dailyUsage: 4.2, 
        daysLeft: 1.9, 
        status: 'low', 
        category: 'meat',
        price: 18.90,
        supplier: 'Fresh Meat Supply',
        emoji: '🐔',
        lastUpdated: '10 min ago'
      },
      { 
        id: 4, 
        name: 'Basmati Rice', 
        currentStock: 12, 
        unit: 'kg', 
        minStock: 15, 
        dailyUsage: 6.8, 
        daysLeft: 2.4, 
        status: 'low', 
        category: 'grains',
        price: 8.75,
        supplier: 'Rice Traders Ltd',
        emoji: '🍚',
        lastUpdated: '15 min ago'
      },
      { 
        id: 5, 
        name: 'Onions', 
        currentStock: 15, 
        unit: 'kg', 
        minStock: 20, 
        dailyUsage: 7.2, 
        daysLeft: 2.8, 
        status: 'low', 
        category: 'vegetables',
        price: 2.40,
        supplier: 'Vegetable Market',
        emoji: '🧅',
        lastUpdated: '18 min ago'
      },
      
      // Good (Green) - 3+ days left
      { 
        id: 6, 
        name: 'Cooking Oil', 
        currentStock: 25, 
        unit: 'L', 
        minStock: 10, 
        dailyUsage: 4.5, 
        daysLeft: 5.6, 
        status: 'good', 
        category: 'cooking',
        price: 45.20,
        supplier: 'Oil Distributors',
        emoji: '🛢️',
        lastUpdated: '1 hour ago'
      },
      { 
        id: 7, 
        name: 'Garam Masala', 
        currentStock: 2.5, 
        unit: 'kg', 
        minStock: 1, 
        dailyUsage: 0.3, 
        daysLeft: 8.3, 
        status: 'good', 
        category: 'spices',
        price: 24.80,
        supplier: 'Spice World',
        emoji: '🌶️',
        lastUpdated: '2 hours ago'
      },
      { 
        id: 8, 
        name: 'Yogurt', 
        currentStock: 12, 
        unit: 'kg', 
        minStock: 5, 
        dailyUsage: 2.1, 
        daysLeft: 5.7, 
        status: 'good', 
        category: 'dairy',
        price: 6.90,
        supplier: 'Dairy Fresh Co',
        emoji: '🥛',
        lastUpdated: '3 hours ago'
      }
    ]
  });

  // Filter items based on search and category
  const filteredItems = stockData.items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const updateStock = (itemId: number, change: number) => {
    setStockData(prev => ({
      ...prev,
      items: prev.items.map(item => {
        if (item.id === itemId) {
          const newStock = Math.max(0, item.currentStock + change);
          const newDaysLeft = newStock / item.dailyUsage;
          let newStatus = 'good';
          if (newDaysLeft < 1) newStatus = 'critical';
          else if (newDaysLeft < 3) newStatus = 'low';
          
          return {
            ...item,
            currentStock: newStock,
            daysLeft: newDaysLeft,
            status: newStatus,
            lastUpdated: 'Just now'
          };
        }
        return item;
      })
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical':
        return {
          bg: 'bg-gradient-to-br from-red-500 to-red-600',
          text: 'text-white',
          badge: 'bg-white/90 text-red-600',
          border: 'border-red-300'
        };
      case 'low':
        return {
          bg: 'bg-gradient-to-br from-amber-500 to-orange-600',
          text: 'text-white',
          badge: 'bg-white/90 text-amber-700',
          border: 'border-amber-300'
        };
      case 'good':
        return {
          bg: 'bg-gradient-to-br from-green-500 to-green-600',
          text: 'text-white',
          badge: 'bg-white/90 text-green-700',
          border: 'border-green-300'
        };
      default:
        return {
          bg: 'bg-gradient-to-br from-gray-500 to-gray-600',
          text: 'text-white',
          badge: 'bg-white/90 text-gray-700',
          border: 'border-gray-300'
        };
    }
  };

  const formatDaysLeft = (days: number) => {
    if (days < 1) {
      const hours = Math.floor(days * 24);
      return `${hours}h left`;
    } else if (days < 7) {
      return `${Math.floor(days)}d left`;
    } else {
      const weeks = Math.floor(days / 7);
      return `${weeks}w left`;
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
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.history.back()}
                className="p-2"
              >
                <span className="text-xl">←</span>
              </Button>
              
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center shadow-sm">
                  <span className="text-2xl">📦</span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Stock Check</h1>
                  <p className="text-sm text-gray-600">📊 "Do I have enough?" • Last update: {stockData.lastUpdate}</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="hidden md:flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span>Critical: {stockData.criticalItems}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                  <span>Low: {stockData.lowStockItems}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.header>

      <div className="p-4 space-y-6">
        {/* Quick Status Overview */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={motionConfig.spring.swift}
        >
          <StatusCard title="Total Items" value={stockData.totalItems} emoji="📋" color="blue" />
          <StatusCard title="Critical" value={stockData.criticalItems} emoji="🚨" color="red" />
          <StatusCard title="Low Stock" value={stockData.lowStockItems} emoji="⚠️" color="amber" />
          <StatusCard title="Good Stock" value={stockData.totalItems - stockData.lowStockItems - stockData.criticalItems} emoji="✅" color="green" />
        </motion.div>

        {/* Search and Categories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...motionConfig.spring.swift, delay: 0.1 }}
          className="space-y-4"
        >
          {/* Search */}
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
            <Input
              type="text"
              placeholder="🔍 Search ingredients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 py-3 text-base"
            />
          </div>

          {/* Category Filter */}
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {stockData.categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className="flex items-center space-x-2 whitespace-nowrap"
              >
                <span>{category.emoji}</span>
                <span>{category.name}</span>
                <Badge variant="secondary" className="ml-1">
                  {category.count}
                </Badge>
              </Button>
            ))}
          </div>
        </motion.div>

        {/* Stock Items */}
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...motionConfig.spring.swift, delay: 0.2 }}
        >
          {filteredItems.map((item, index) => {
            const statusStyle = getStatusColor(item.status);
            
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ ...motionConfig.spring.swift, delay: index * 0.05 }}
              >
                <Card variant="glass" className={cn("p-5 border-l-4 shadow-lg", statusStyle.border)}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                      {/* Item Icon & Info */}
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                          <span className="text-2xl">{item.emoji}</span>
                        </div>
                        
                        <div>
                          <h3 className="font-bold text-lg text-gray-800">{item.name}</h3>
                          <div className="flex items-center space-x-3 text-sm text-gray-600">
                            <span>📦 {item.currentStock} {item.unit}</span>
                            <span>•</span>
                            <span>📈 {item.dailyUsage} {item.unit}/day</span>
                            <span>•</span>
                            <span className="text-xs">{item.lastUpdated}</span>
                          </div>
                        </div>
                      </div>

                      {/* Days Left - The Main Focus */}
                      <div className="text-right">
                        <div className={cn(
                          "px-4 py-2 rounded-xl font-bold text-lg shadow-sm",
                          statusStyle.bg,
                          statusStyle.text
                        )}>
                          {formatDaysLeft(item.daysLeft)}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Min: {item.minStock} {item.unit}
                        </div>
                      </div>
                    </div>

                    {/* Stock Controls */}
                    <div className="flex items-center space-x-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateStock(item.id, -1)}
                        className="w-10 h-10 p-0 rounded-full"
                        disabled={item.currentStock <= 0}
                      >
                        <span className="text-lg">−</span>
                      </Button>
                      
                      <div className="text-center min-w-[60px]">
                        <div className="font-bold text-xl">{item.currentStock}</div>
                        <div className="text-xs text-gray-500">{item.unit}</div>
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateStock(item.id, 1)}
                        className="w-10 h-10 p-0 rounded-full"
                      >
                        <span className="text-lg">+</span>
                      </Button>
                    </div>
                  </div>

                  {/* Additional Info (expandable) */}
                  <div className="mt-4 pt-4 border-t border-gray-200 text-sm text-gray-600">
                    <div className="flex justify-between items-center">
                      <span>💰 ₹{item.price}/{item.unit} • 🏪 {item.supplier}</span>
                      <span className="text-xs">Est. value: ₹{(item.currentStock * item.price).toFixed(2)}</span>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        {filteredItems.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-lg font-medium text-gray-600 mb-2">No items found</h3>
            <p className="text-gray-500">Try adjusting your search or category filter</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}

// Status Card Component
interface StatusCardProps {
  title: string;
  value: number;
  emoji: string;
  color: 'blue' | 'red' | 'amber' | 'green';
}

function StatusCard({ title, value, emoji, color }: StatusCardProps) {
  const colorClasses = {
    blue: 'bg-gradient-to-br from-blue-50 to-blue-100 text-blue-800 border-blue-200',
    red: 'bg-gradient-to-br from-red-50 to-red-100 text-red-800 border-red-200',
    amber: 'bg-gradient-to-br from-amber-50 to-orange-100 text-amber-800 border-amber-200',
    green: 'bg-gradient-to-br from-green-50 to-green-100 text-green-800 border-green-200'
  };

  return (
    <Card variant="glass" className={cn("p-4 border shadow-lg transition-all duration-300 hover:scale-105", colorClasses[color])}>
      <div className="text-center space-y-2">
        <div className="text-2xl">{emoji}</div>
        <div className="text-2xl font-bold tracking-tight">{value}</div>
        <div className="text-sm font-medium opacity-75">{title}</div>
      </div>
    </Card>
  );
}