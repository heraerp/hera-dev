"use client"

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/revolutionary-card';
import { Button } from '@/components/ui/revolutionary-button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import motionConfig from '@/lib/motion';

// Need to Buy Screen - Smart Shopping List
export default function ShoppingPage() {
  const [shoppingData, setShoppingData] = useState({
    lastUpdate: new Date().toLocaleTimeString(),
    aiSuggestions: [
      { 
        id: 1, 
        name: 'Mozzarella Cheese', 
        quantity: 20, 
        unit: 'kg', 
        price: 1200, 
        urgent: true, 
        reason: 'Running out tomorrow',
        emoji: '🧀',
        supplier: 'Dairy Fresh Co',
        daysLeft: 0.8
      },
      { 
        id: 2, 
        name: 'Fresh Tomatoes', 
        quantity: 15, 
        unit: 'kg', 
        price: 480, 
        urgent: true, 
        reason: 'Critical stock level',
        emoji: '🍅',
        supplier: 'Green Gardens',
        daysLeft: 0.6
      },
      { 
        id: 3, 
        name: 'Basmati Rice', 
        quantity: 25, 
        unit: 'kg', 
        price: 2200, 
        urgent: true, 
        reason: 'Below minimum threshold',
        emoji: '🍚',
        supplier: 'Rice Traders Ltd',
        daysLeft: 1.2
      },
      { 
        id: 4, 
        name: 'Chicken Breast', 
        quantity: 10, 
        unit: 'kg', 
        price: 1890, 
        urgent: false, 
        reason: 'Stock running low',
        emoji: '🐔',
        supplier: 'Fresh Meat Supply',
        daysLeft: 2.1
      }
    ],
    manualList: [
      { 
        id: 5, 
        name: 'Paper Towels', 
        quantity: 12, 
        unit: 'rolls', 
        price: 360, 
        added: 'manual',
        emoji: '🧻',
        supplier: 'Office Supplies Co'
      },
      { 
        id: 6, 
        name: 'Dish Soap', 
        quantity: 5, 
        unit: 'bottles', 
        price: 425, 
        added: 'manual',
        emoji: '🧽',
        supplier: 'Cleaning Supplies Ltd'
      },
      { 
        id: 7, 
        name: 'Gas Cylinder', 
        quantity: 2, 
        unit: 'units', 
        price: 1600, 
        added: 'manual',
        emoji: '🔥',
        supplier: 'City Gas Service'
      }
    ],
    pendingOrders: [
      { 
        id: 8, 
        supplier: 'Fresh Produce Co', 
        items: 8, 
        total: 3450, 
        orderDate: '2025-01-15', 
        expectedDelivery: '2025-01-18', 
        status: 'pending',
        emoji: '🥬'
      },
      { 
        id: 9, 
        supplier: 'Spice World Ltd', 
        items: 12, 
        total: 2890, 
        orderDate: '2025-01-14', 
        expectedDelivery: '2025-01-17', 
        status: 'shipped',
        emoji: '🌶️'
      },
      { 
        id: 10, 
        supplier: 'Dairy Fresh Co', 
        items: 5, 
        total: 1560, 
        orderDate: '2025-01-16', 
        expectedDelivery: '2025-01-19', 
        status: 'confirmed',
        emoji: '🥛'
      }
    ]
  });

  const [selectedItems, setSelectedItems] = useState(new Set<number>());

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const toggleItemSelection = (itemId: number) => {
    const newSelection = new Set(selectedItems);
    if (newSelection.has(itemId)) {
      newSelection.delete(itemId);
    } else {
      newSelection.add(itemId);
    }
    setSelectedItems(newSelection);
  };

  const addAllAISuggestions = () => {
    const aiIds = shoppingData.aiSuggestions.map(item => item.id);
    setSelectedItems(new Set([...selectedItems, ...aiIds]));
  };

  const getTotalCost = () => {
    const allItems = [...shoppingData.aiSuggestions, ...shoppingData.manualList];
    return allItems
      .filter(item => selectedItems.has(item.id))
      .reduce((sum, item) => sum + item.price, 0);
  };

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'shipped':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'delivered':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getOrderStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return '⏳';
      case 'shipped':
        return '🚚';
      case 'confirmed':
        return '✅';
      case 'delivered':
        return '📦';
      default:
        return '❓';
    }
  };

  const formatDaysLeft = (days: number) => {
    if (days < 1) {
      const hours = Math.floor(days * 24);
      return `${hours}h left`;
    } else {
      return `${Math.floor(days)}d left`;
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
                <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-red-100 rounded-xl flex items-center justify-center shadow-sm">
                  <span className="text-2xl">🛒</span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Need to Buy</h1>
                  <p className="text-sm text-gray-600">🤖 Smart Shopping List • Last update: {shoppingData.lastUpdate}</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center space-x-2"
              >
                <span className="text-lg">+</span>
                <span>Add Item</span>
              </Button>
              
              <Button
                variant="default"
                size="sm"
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 flex items-center space-x-2"
              >
                <span className="text-lg">✈️</span>
                <span>📧 Email List</span>
              </Button>
            </div>
          </div>
        </div>
      </motion.header>

      <div className="p-4 space-y-6">
        {/* AI Suggestions Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={motionConfig.spring.swift}
        >
          <Card variant="glass" className="shadow-lg">
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">🤖</span>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">AI SUGGESTIONS</h2>
                    <p className="text-sm text-gray-600">Automatically generated based on usage patterns</p>
                  </div>
                </div>
                <Button 
                  onClick={addAllAISuggestions}
                  variant="outline"
                  size="sm"
                  className="bg-white hover:bg-blue-50 border-blue-200 text-blue-700"
                >
                  ✅ Add All ({shoppingData.aiSuggestions.length})
                </Button>
              </div>
            </div>
            
            <div className="divide-y divide-gray-100">
              {shoppingData.aiSuggestions.map((item, index) => (
                <motion.div 
                  key={item.id} 
                  className="p-5 hover:bg-gray-50 transition-colors"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ ...motionConfig.spring.swift, delay: index * 0.1 }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => toggleItemSelection(item.id)}
                        className={cn(
                          "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-200",
                          selectedItems.has(item.id) 
                            ? 'bg-blue-500 border-blue-500 shadow-blue-500/25 shadow-lg' 
                            : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                        )}
                      >
                        {selectedItems.has(item.id) && (
                          <span className="text-white text-sm">✓</span>
                        )}
                      </button>
                      
                      <div className="flex items-center space-x-4">
                        {item.urgent && (
                          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                        )}
                        
                        <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                          <span className="text-2xl">{item.emoji}</span>
                        </div>
                        
                        <div>
                          <h3 className="font-bold text-lg text-gray-800 flex items-center space-x-2">
                            <span>{item.name}</span>
                            {item.urgent && (
                              <Badge variant="destructive" className="text-xs">
                                URGENT
                              </Badge>
                            )}
                          </h3>
                          <div className="flex items-center space-x-3 text-sm text-gray-600">
                            <span>📦 {item.quantity} {item.unit}</span>
                            <span>•</span>
                            <span>⏰ {formatDaysLeft(item.daysLeft)}</span>
                            <span>•</span>
                            <span>🏪 {item.supplier}</span>
                          </div>
                          <p className="text-sm text-red-600 font-medium mt-1">{item.reason}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-800">
                        {formatCurrency(item.price)}
                      </div>
                      <div className="text-sm text-gray-600">
                        {formatCurrency(item.price / item.quantity)}/{item.unit}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
              
              <div className="p-5 bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="flex items-center justify-between">
                  <div className="text-blue-700 font-medium">
                    🤖 Total AI Suggestions: {formatCurrency(shoppingData.aiSuggestions.reduce((sum, item) => sum + item.price, 0))}
                  </div>
                  <Button 
                    onClick={addAllAISuggestions}
                    size="sm"
                    className="bg-blue-500 hover:bg-blue-600"
                  >
                    ✅ Add All to Cart
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Manual Shopping List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...motionConfig.spring.swift, delay: 0.1 }}
        >
          <Card variant="glass" className="shadow-lg">
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">📝</span>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">MANUAL SHOPPING LIST</h2>
                    <p className="text-sm text-gray-600">Items added by staff members</p>
                  </div>
                </div>
                <Button 
                  variant="outline"
                  size="sm"
                  className="bg-white hover:bg-green-50 border-green-200 text-green-700"
                >
                  + Add Item
                </Button>
              </div>
            </div>
            
            <div className="divide-y divide-gray-100">
              {shoppingData.manualList.map((item, index) => (
                <motion.div 
                  key={item.id} 
                  className="p-5 hover:bg-gray-50 transition-colors"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ ...motionConfig.spring.swift, delay: 0.1 + index * 0.1 }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => toggleItemSelection(item.id)}
                        className={cn(
                          "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-200",
                          selectedItems.has(item.id) 
                            ? 'bg-green-500 border-green-500 shadow-green-500/25 shadow-lg' 
                            : 'border-gray-300 hover:border-green-400 hover:bg-green-50'
                        )}
                      >
                        {selectedItems.has(item.id) && (
                          <span className="text-white text-sm">✓</span>
                        )}
                      </button>
                      
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                          <span className="text-2xl">{item.emoji}</span>
                        </div>
                        
                        <div>
                          <h3 className="font-bold text-lg text-gray-800">{item.name}</h3>
                          <div className="flex items-center space-x-3 text-sm text-gray-600">
                            <span>📦 {item.quantity} {item.unit}</span>
                            <span>•</span>
                            <span>🏪 {item.supplier}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-800">
                          {formatCurrency(item.price)}
                        </div>
                        <div className="text-sm text-gray-600">
                          {formatCurrency(item.price / item.quantity)}/{item.unit}
                        </div>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2"
                      >
                        <span className="text-lg">×</span>
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Pending Orders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...motionConfig.spring.swift, delay: 0.2 }}
        >
          <Card variant="glass" className="shadow-lg">
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-amber-50 to-orange-50">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">🚚</span>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">PENDING ORDERS</h2>
                  <p className="text-sm text-gray-600">Track your supplier orders and deliveries</p>
                </div>
              </div>
            </div>
            
            <div className="divide-y divide-gray-100">
              {shoppingData.pendingOrders.map((order, index) => (
                <motion.div 
                  key={order.id} 
                  className="p-5 hover:bg-gray-50 transition-colors"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ ...motionConfig.spring.swift, delay: 0.2 + index * 0.1 }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                        <span className="text-2xl">{order.emoji}</span>
                      </div>
                      
                      <div>
                        <h3 className="font-bold text-lg text-gray-800">{order.supplier}</h3>
                        <div className="flex items-center space-x-3 text-sm text-gray-600">
                          <span>📦 {order.items} items</span>
                          <span>•</span>
                          <span>📅 Expected: {new Date(order.expectedDelivery).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-lg">{getOrderStatusIcon(order.status)}</span>
                          <Badge className={cn("text-xs", getOrderStatusColor(order.status))}>
                            {order.status.toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-800">
                        {formatCurrency(order.total)}
                      </div>
                      <div className="text-sm text-gray-600">
                        Ordered: {new Date(order.orderDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Order Summary */}
        {selectedItems.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={motionConfig.spring.bounce}
            className="sticky bottom-4 z-10"
          >
            <Card variant="glass" className="shadow-xl border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">🛒 Selected Items</h3>
                    <p className="text-sm text-gray-600">
                      {selectedItems.size} items selected
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-blue-800">
                      {formatCurrency(getTotalCost())}
                    </div>
                    <div className="text-sm text-blue-600">Total Cost</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button 
                    size="lg"
                    className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 flex items-center justify-center space-x-2 py-4"
                  >
                    <span className="text-lg">✈️</span>
                    <span>📧 EMAIL LIST TO SUPPLIER</span>
                  </Button>
                  <Button 
                    size="lg"
                    className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 flex items-center justify-center space-x-2 py-4"
                  >
                    <span className="text-lg">✓</span>
                    <span>🛒 PLACE ORDER</span>
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}