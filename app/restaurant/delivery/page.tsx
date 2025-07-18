"use client"

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/revolutionary-card';
import { Button } from '@/components/ui/revolutionary-button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import motionConfig from '@/lib/motion';

// Delivery Management System - Track and manage deliveries
export default function DeliveryManagementPage() {
  const [deliveryData, setDeliveryData] = useState({
    lastUpdate: new Date().toLocaleTimeString(),
    readyOrders: [
      {
        id: 'ORD-105',
        customer: 'Sharma Family',
        address: '123 MG Road, Sector 15, Gurgaon',
        phone: '+91 98765 43210',
        orderValue: 850,
        items: 3,
        preparedAt: '1:20 PM',
        estimatedDelivery: '1:50 PM',
        priority: 'normal',
        paymentStatus: 'paid',
        emoji: '🏠'
      },
      {
        id: 'ORD-106',
        customer: 'Office Complex',
        address: 'DLF Cyber City, Tower A, Floor 8',
        phone: '+91 98765 43211',
        orderValue: 1240,
        items: 6,
        preparedAt: '1:25 PM',
        estimatedDelivery: '1:55 PM',
        priority: 'high',
        paymentStatus: 'pending',
        emoji: '🏢'
      }
    ],
    activeDeliveries: [
      {
        id: 'ORD-103',
        driverId: 'DRV-001',
        driverName: 'Raj Kumar',
        driverPhone: '+91 98765 43200',
        customer: 'Patel Residence',
        address: '456 Golf Course Road, Gurgaon',
        phone: '+91 98765 43212',
        orderValue: 720,
        items: 4,
        status: 'en_route',
        departedAt: '1:10 PM',
        estimatedArrival: '1:40 PM',
        actualLocation: 'Near DLF Mall',
        distanceRemaining: '2.3 km',
        emoji: '🏠',
        driverEmoji: '🛵'
      },
      {
        id: 'ORD-104',
        driverId: 'DRV-002',
        driverName: 'Amit Singh',
        driverPhone: '+91 98765 43201',
        customer: 'Tech Park Cafeteria',
        address: 'Unitech Cyber Park, Sector 39',
        phone: '+91 98765 43213',
        orderValue: 2100,
        items: 12,
        status: 'delivered',
        departedAt: '12:45 PM',
        deliveredAt: '1:15 PM',
        actualLocation: 'Returning to restaurant',
        distanceRemaining: '1.8 km',
        emoji: '🏢',
        driverEmoji: '🛵'
      }
    ],
    drivers: [
      {
        id: 'DRV-001',
        name: 'Raj Kumar',
        phone: '+91 98765 43200',
        status: 'on_delivery',
        currentOrder: 'ORD-103',
        totalDeliveries: 8,
        rating: 4.8,
        location: 'Near DLF Mall',
        emoji: '🛵',
        vehicle: 'Bike - HR 26 DX 1234'
      },
      {
        id: 'DRV-002',
        name: 'Amit Singh',
        phone: '+91 98765 43201',
        status: 'returning',
        currentOrder: null,
        totalDeliveries: 12,
        rating: 4.9,
        location: 'Golf Course Road',
        emoji: '🛵',
        vehicle: 'Bike - HR 26 DX 5678'
      },
      {
        id: 'DRV-003',
        name: 'Suresh Yadav',
        phone: '+91 98765 43202',
        status: 'available',
        currentOrder: null,
        totalDeliveries: 6,
        rating: 4.7,
        location: 'At Restaurant',
        emoji: '🛵',
        vehicle: 'Bike - HR 26 DX 9012'
      }
    ],
    stats: {
      totalDeliveries: 26,
      averageDeliveryTime: 28,
      onTimeRate: 94.2,
      customerSatisfaction: 4.6
    }
  });

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setDeliveryData(prev => ({
        ...prev,
        lastUpdate: new Date().toLocaleTimeString()
      }));
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const assignDriver = (orderId: string, driverId: string) => {
    // Move order from ready to active deliveries
    setDeliveryData(prev => {
      const order = prev.readyOrders.find(o => o.id === orderId);
      const driver = prev.drivers.find(d => d.id === driverId);
      
      if (!order || !driver) return prev;

      return {
        ...prev,
        readyOrders: prev.readyOrders.filter(o => o.id !== orderId),
        activeDeliveries: [
          ...prev.activeDeliveries,
          {
            ...order,
            driverId,
            driverName: driver.name,
            driverPhone: driver.phone,
            status: 'assigned',
            departedAt: new Date().toLocaleTimeString(),
            actualLocation: 'Restaurant',
            distanceRemaining: 'Calculating...',
            driverEmoji: driver.emoji
          }
        ],
        drivers: prev.drivers.map(d => 
          d.id === driverId 
            ? { ...d, status: 'on_delivery', currentOrder: orderId }
            : d
        )
      };
    });
  };

  const updateDeliveryStatus = (orderId: string, newStatus: string) => {
    setDeliveryData(prev => ({
      ...prev,
      activeDeliveries: prev.activeDeliveries.map(delivery =>
        delivery.id === orderId 
          ? { 
              ...delivery, 
              status: newStatus,
              deliveredAt: newStatus === 'delivered' ? new Date().toLocaleTimeString() : undefined
            }
          : delivery
      )
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'assigned':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'en_route':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'delayed':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getDriverStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'on_delivery':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'returning':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'break':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500 text-white';
      case 'normal':
        return 'bg-blue-500 text-white';
      case 'low':
        return 'bg-gray-500 text-white';
      default:
        return 'bg-gray-400 text-white';
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
                  <span className="text-2xl">🚚</span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Delivery Management</h1>
                  <p className="text-sm text-gray-600">📍 Live Tracking & Assignment • Last update: {deliveryData.lastUpdate}</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden md:grid grid-cols-4 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-xl font-bold text-green-600">{deliveryData.stats.totalDeliveries}</div>
                  <div className="text-gray-600">Today</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-blue-600">{deliveryData.stats.averageDeliveryTime}m</div>
                  <div className="text-gray-600">Avg Time</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-amber-600">{deliveryData.stats.onTimeRate}%</div>
                  <div className="text-gray-600">On Time</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-purple-600">{deliveryData.stats.customerSatisfaction}</div>
                  <div className="text-gray-600">Rating</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.header>

      <div className="p-4 space-y-6">
        {/* Ready for Delivery */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={motionConfig.spring.swift}
        >
          <Card variant="glass" className="shadow-lg">
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">📦</span>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">READY FOR DELIVERY</h2>
                    <p className="text-sm text-gray-600">Orders prepared and waiting for pickup</p>
                  </div>
                </div>
                <Badge variant="outline" className="bg-white">
                  {deliveryData.readyOrders.length} orders
                </Badge>
              </div>
            </div>
            
            <div className="divide-y divide-gray-100">
              {deliveryData.readyOrders.map((order, index) => (
                <motion.div 
                  key={order.id} 
                  className="p-5 hover:bg-gray-50 transition-colors"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ ...motionConfig.spring.swift, delay: index * 0.1 }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                        <span className="text-2xl">{order.emoji}</span>
                      </div>
                      
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-bold text-lg text-gray-800">{order.customer}</h3>
                          <Badge className={cn("text-xs", getPriorityColor(order.priority))}>
                            {order.priority.toUpperCase()}
                          </Badge>
                          <Badge variant={order.paymentStatus === 'paid' ? 'default' : 'destructive'} className="text-xs">
                            {order.paymentStatus.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <div>📍 {order.address}</div>
                          <div>📞 {order.phone}</div>
                          <div className="flex items-center space-x-4">
                            <span>📦 {order.items} items</span>
                            <span>💰 ₹{order.orderValue}</span>
                            <span>⏰ Ready: {order.preparedAt}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <select 
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        onChange={(e) => assignDriver(order.id, e.target.value)}
                        defaultValue=""
                      >
                        <option value="">Assign Driver</option>
                        {deliveryData.drivers
                          .filter(driver => driver.status === 'available')
                          .map(driver => (
                            <option key={driver.id} value={driver.id}>
                              {driver.name} ({driver.rating}⭐)
                            </option>
                          ))
                        }
                      </select>
                      <Button size="sm" className="bg-blue-500 hover:bg-blue-600">
                        📞 Call Customer
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Active Deliveries */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...motionConfig.spring.swift, delay: 0.1 }}
        >
          <Card variant="glass" className="shadow-lg">
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">🛵</span>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">ACTIVE DELIVERIES</h2>
                    <p className="text-sm text-gray-600">Orders currently being delivered</p>
                  </div>
                </div>
                <Badge variant="outline" className="bg-white">
                  {deliveryData.activeDeliveries.length} active
                </Badge>
              </div>
            </div>
            
            <div className="divide-y divide-gray-100">
              {deliveryData.activeDeliveries.map((delivery, index) => (
                <motion.div 
                  key={delivery.id} 
                  className="p-5 hover:bg-gray-50 transition-colors"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ ...motionConfig.spring.swift, delay: 0.1 + index * 0.1 }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                          <span className="text-2xl">{delivery.emoji}</span>
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center border-2 border-blue-200">
                          <span className="text-sm">{delivery.driverEmoji}</span>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-bold text-lg text-gray-800">{delivery.customer}</h3>
                          <Badge className={cn("text-xs", getStatusColor(delivery.status))}>
                            {delivery.status.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <div>🚴‍♂️ {delivery.driverName} • 📞 {delivery.driverPhone}</div>
                          <div>📍 {delivery.address}</div>
                          <div className="flex items-center space-x-4">
                            <span>📦 {delivery.items} items</span>
                            <span>💰 ₹{delivery.orderValue}</span>
                            <span>⏰ {delivery.departedAt}</span>
                            {delivery.status !== 'delivered' && (
                              <span>📍 {delivery.actualLocation} ({delivery.distanceRemaining})</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {delivery.status !== 'delivered' ? (
                        <>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => updateDeliveryStatus(delivery.id, 'en_route')}
                            className="bg-amber-50 border-amber-200 text-amber-700"
                          >
                            🚚 En Route
                          </Button>
                          <Button 
                            size="sm"
                            onClick={() => updateDeliveryStatus(delivery.id, 'delivered')}
                            className="bg-green-500 hover:bg-green-600"
                          >
                            ✅ Delivered
                          </Button>
                        </>
                      ) : (
                        <div className="text-green-600 font-medium">
                          ✅ Delivered at {delivery.deliveredAt}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Driver Management */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...motionConfig.spring.swift, delay: 0.2 }}
        >
          <Card variant="glass" className="shadow-lg">
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">👨‍💼</span>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">DRIVER STATUS</h2>
                  <p className="text-sm text-gray-600">Real-time driver tracking and management</p>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {deliveryData.drivers.map((driver) => (
                  <Card key={driver.id} variant="glass" className={cn("p-4 border transition-all duration-300 hover:scale-105", getDriverStatusColor(driver.status))}>
                    <div className="text-center space-y-3">
                      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto">
                        <span className="text-3xl">{driver.emoji}</span>
                      </div>
                      <div>
                        <div className="font-bold text-lg">{driver.name}</div>
                        <div className="text-sm text-gray-600">{driver.phone}</div>
                        <div className="text-sm text-gray-600">{driver.vehicle}</div>
                      </div>
                      <div className="space-y-2">
                        <Badge className={cn("text-xs", getDriverStatusColor(driver.status))}>
                          {driver.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                        <div className="text-sm">
                          <div>📍 {driver.location}</div>
                          <div>🚚 {driver.totalDeliveries} deliveries</div>
                          <div>⭐ {driver.rating} rating</div>
                        </div>
                      </div>
                      {driver.currentOrder && (
                        <Badge variant="outline" className="text-xs">
                          {driver.currentOrder}
                        </Badge>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}