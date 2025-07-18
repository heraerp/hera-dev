'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Package,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Truck,
  Scan,
  Plus,
  Minus,
  Calendar,
  BarChart3,
  Filter,
  Search,
  Download,
  Upload,
  Clock,
  Eye,
  ShoppingCart
} from 'lucide-react';
import { Card } from '@/components/ui/revolutionary-card';
import { Button } from '@/components/ui/revolutionary-button';
import { Badge } from '@/components/ui/badge';

interface InventoryWorkflowProps {
  restaurantId: string;
  storeKeeperId: string;
}

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  unit: string;
  costPerUnit: number;
  supplier: string;
  lastUpdated: Date;
  expiryDate?: Date;
  location: string;
  status: 'critical' | 'low' | 'normal' | 'overstocked';
}

interface PurchaseOrderDraft {
  supplierId: string;
  supplierName: string;
  items: { itemId: string; name: string; quantity: number; unitCost: number }[];
  total: number;
}

const InventoryWorkflow: React.FC<InventoryWorkflowProps> = ({ restaurantId, storeKeeperId }) => {
  const [activeView, setActiveView] = useState<'dashboard' | 'inventory' | 'receiving' | 'ordering'>('dashboard');
  const [scanMode, setScanMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Mock inventory data
  const inventoryItems: InventoryItem[] = [
    {
      id: 'RICE-001',
      name: 'Basmati Rice',
      category: 'Grains',
      currentStock: 5,
      minStock: 20,
      maxStock: 100,
      unit: 'kg',
      costPerUnit: 4.50,
      supplier: 'ABC Suppliers',
      lastUpdated: new Date(),
      location: 'A1-1',
      status: 'critical'
    },
    {
      id: 'PNEER-001',
      name: 'Fresh Paneer',
      category: 'Dairy',
      currentStock: 3,
      minStock: 10,
      maxStock: 25,
      unit: 'kg',
      costPerUnit: 8.00,
      supplier: 'Dairy Fresh',
      lastUpdated: new Date(),
      expiryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      location: 'C1-2',
      status: 'critical'
    },
    {
      id: 'TOM-001',
      name: 'Tomatoes',
      category: 'Vegetables',
      currentStock: 8,
      minStock: 15,
      maxStock: 50,
      unit: 'kg',
      costPerUnit: 2.50,
      supplier: 'Farm Fresh',
      lastUpdated: new Date(),
      expiryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      location: 'B2-1',
      status: 'low'
    },
    {
      id: 'CHK-001',
      name: 'Chicken',
      category: 'Meat',
      currentStock: 22,
      minStock: 15,
      maxStock: 40,
      unit: 'kg',
      costPerUnit: 12.00,
      supplier: 'Premium Meats',
      lastUpdated: new Date(),
      expiryDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      location: 'D1-1',
      status: 'normal'
    }
  ];

  const categories = ['all', ...new Set(inventoryItems.map(item => item.category))];

  const summary = {
    critical_items: inventoryItems.filter(item => item.status === 'critical').length,
    low_stock: inventoryItems.filter(item => item.status === 'low').length,
    expiring_soon: inventoryItems.filter(item => 
      item.expiryDate && item.expiryDate.getTime() < Date.now() + 3 * 24 * 60 * 60 * 1000
    ).length,
    total_value: inventoryItems.reduce((sum, item) => sum + (item.currentStock * item.costPerUnit), 0)
  };

  const getStatusColor = (status: InventoryItem['status']) => {
    switch (status) {
      case 'critical': return 'bg-red-500 text-white';
      case 'low': return 'bg-orange-500 text-white';
      case 'normal': return 'bg-green-500 text-white';
      case 'overstocked': return 'bg-blue-500 text-white';
    }
  };

  const getStatusIcon = (status: InventoryItem['status']) => {
    switch (status) {
      case 'critical': return <XCircle className="w-4 h-4" />;
      case 'low': return <AlertTriangle className="w-4 h-4" />;
      case 'normal': return <CheckCircle className="w-4 h-4" />;
      case 'overstocked': return <Package className="w-4 h-4" />;
    }
  };

  const filteredItems = inventoryItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const updateStock = (itemId: string, change: number) => {
    console.log('Update stock:', itemId, change);
    // Update stock logic here
  };

  const generatePurchaseOrders = () => {
    const criticalAndLowItems = inventoryItems.filter(item => 
      item.status === 'critical' || item.status === 'low'
    );
    
    const ordersBySupplier = criticalAndLowItems.reduce((acc, item) => {
      if (!acc[item.supplier]) {
        acc[item.supplier] = [];
      }
      
      const orderQuantity = item.maxStock - item.currentStock;
      acc[item.supplier].push({
        itemId: item.id,
        name: item.name,
        quantity: orderQuantity,
        unitCost: item.costPerUnit
      });
      
      return acc;
    }, {} as Record<string, any[]>);

    return Object.entries(ordersBySupplier).map(([supplier, items]) => ({
      supplierId: supplier.toLowerCase().replace(/\s+/g, '-'),
      supplierName: supplier,
      items,
      total: items.reduce((sum, item) => sum + (item.quantity * item.unitCost), 0)
    }));
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Inventory Management</h1>
            <p className="text-slate-600">Store Keeper Dashboard</p>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button
              onClick={() => setScanMode(!scanMode)}
              className={scanMode ? 'bg-green-600 text-white' : 'bg-white border border-slate-300'}
            >
              <Scan className="w-4 h-4 mr-2" />
              {scanMode ? 'Exit Scan' : 'Scan Mode'}
            </Button>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </header>

        {/* Steve Krug: Critical alerts first - impossible to miss */}
        {summary.critical_items > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-red-600 text-white rounded-xl p-6"
          >
            <div className="flex items-center space-x-3">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1 }}
              >
                <AlertTriangle className="w-8 h-8" />
              </motion.div>
              <div className="flex-1">
                <h2 className="text-xl font-bold">🚨 CRITICAL STOCK SHORTAGE</h2>
                <p>{summary.critical_items} items are critically low. Order immediately!</p>
              </div>
              <Button className="bg-white text-red-600 hover:bg-red-50">
                Generate Orders
              </Button>
            </div>
          </motion.div>
        )}

        {/* Dashboard Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <SummaryCard
            title="Critical Items"
            value={summary.critical_items}
            icon={<XCircle className="w-6 h-6" />}
            color="red"
            urgent={summary.critical_items > 0}
          />
          <SummaryCard
            title="Low Stock"
            value={summary.low_stock}
            icon={<AlertTriangle className="w-6 h-6" />}
            color="orange"
            urgent={summary.low_stock > 0}
          />
          <SummaryCard
            title="Expiring Soon"
            value={summary.expiring_soon}
            icon={<Clock className="w-6 h-6" />}
            color="yellow"
            urgent={summary.expiring_soon > 0}
          />
          <SummaryCard
            title="Total Value"
            value={`$${summary.total_value.toFixed(0)}`}
            icon={<BarChart3 className="w-6 h-6" />}
            color="blue"
          />
        </div>

        {/* Navigation */}
        <div className="bg-white rounded-lg border p-1">
          <div className="flex space-x-1">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: <BarChart3 className="w-4 h-4" /> },
              { id: 'inventory', label: 'Stock Levels', icon: <Package className="w-4 h-4" /> },
              { id: 'receiving', label: 'Receive Stock', icon: <Truck className="w-4 h-4" /> },
              { id: 'ordering', label: 'Purchase Orders', icon: <ShoppingCart className="w-4 h-4" /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveView(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-colors ${
                  activeView === tab.id
                    ? 'bg-blue-500 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {tab.icon}
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {activeView === 'inventory' && (
          <div className="space-y-6">
            {/* Search and Filters */}
            <Card className="p-4">
              <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search items by name or ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category === 'all' ? 'All Categories' : category}
                    </option>
                  ))}
                </select>
              </div>
            </Card>

            {/* Inventory Items */}
            <div className="grid gap-4">
              {filteredItems.map(item => (
                <InventoryItemCard 
                  key={item.id} 
                  item={item} 
                  onUpdateStock={updateStock}
                  scanMode={scanMode}
                />
              ))}
            </div>
          </div>
        )}

        {activeView === 'ordering' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800">Purchase Orders</h2>
              <Button className="bg-green-600 hover:bg-green-700 text-white">
                <Plus className="w-4 h-4 mr-2" />
                New Order
              </Button>
            </div>

            {/* Auto-generated orders */}
            <Card className="p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-4">🤖 Auto-Generated Orders</h3>
              <p className="text-slate-600 mb-4">Based on critical and low stock items</p>
              
              <div className="space-y-4">
                {generatePurchaseOrders().map((order, index) => (
                  <PurchaseOrderCard key={index} order={order} />
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* Quick Actions for mobile */}
        <div className="fixed bottom-6 right-6 md:hidden">
          <div className="flex flex-col space-y-3">
            <Button 
              className="w-14 h-14 rounded-full bg-green-600 hover:bg-green-700 text-white shadow-lg"
              onClick={() => setScanMode(!scanMode)}
            >
              <Scan className="w-6 h-6" />
            </Button>
            <Button 
              className="w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
            >
              <Plus className="w-6 h-6" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Steve Krug: Each inventory item shows status at a glance
const InventoryItemCard: React.FC<{ 
  item: InventoryItem; 
  onUpdateStock: (id: string, change: number) => void;
  scanMode: boolean;
}> = ({ item, onUpdateStock, scanMode }) => {
  const isExpiringSoon = item.expiryDate && item.expiryDate.getTime() < Date.now() + 3 * 24 * 60 * 60 * 1000;
  const stockPercentage = (item.currentStock / item.maxStock) * 100;

  return (
    <motion.div
      layout
      className={`p-4 rounded-lg border-2 transition-all ${
        scanMode ? 'border-green-500 bg-green-50' : 
        item.status === 'critical' ? 'border-red-500 bg-red-50' :
        item.status === 'low' ? 'border-orange-500 bg-orange-50' :
        'border-slate-200 bg-white'
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${getStatusColor(item.status)}`}>
            {getStatusIcon(item.status)}
          </div>
          <div>
            <h3 className="font-bold text-slate-800">{item.name}</h3>
            <p className="text-sm text-slate-600">{item.id} • {item.location}</p>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-xl font-bold text-slate-800">
            {item.currentStock} {item.unit}
          </div>
          <div className="text-sm text-slate-500">
            Min: {item.minStock} | Max: {item.maxStock}
          </div>
        </div>
      </div>

      {/* Stock Level Bar */}
      <div className="mb-3">
        <div className="w-full bg-slate-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${
              stockPercentage < 20 ? 'bg-red-500' :
              stockPercentage < 40 ? 'bg-orange-500' : 'bg-green-500'
            }`}
            style={{ width: `${Math.min(100, stockPercentage)}%` }}
          ></div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-3">
        <div>
          <h4 className="text-sm font-medium text-slate-700">Details</h4>
          <div className="text-xs text-slate-600 space-y-1">
            <div>Category: {item.category}</div>
            <div>Cost: ${item.costPerUnit}/{item.unit}</div>
            <div>Supplier: {item.supplier}</div>
          </div>
        </div>
        
        <div>
          <h4 className="text-sm font-medium text-slate-700">Status</h4>
          <div className="text-xs text-slate-600 space-y-1">
            <div>Updated: {item.lastUpdated.toLocaleDateString()}</div>
            {item.expiryDate && (
              <div className={isExpiringSoon ? 'text-red-600 font-bold' : ''}>
                Expires: {item.expiryDate.toLocaleDateString()}
                {isExpiringSoon && ' ⚠️'}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onUpdateStock(item.id, -1)}
            className="w-8 h-8 p-0"
          >
            <Minus className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onUpdateStock(item.id, 1)}
            className="w-8 h-8 p-0"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="flex space-x-2">
          <Button size="sm" variant="outline">
            <Eye className="w-4 h-4 mr-1" />
            Details
          </Button>
          {(item.status === 'critical' || item.status === 'low') && (
            <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
              <ShoppingCart className="w-4 h-4 mr-1" />
              Order
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const SummaryCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: 'red' | 'orange' | 'yellow' | 'blue';
  urgent?: boolean;
}> = ({ title, value, icon, color, urgent }) => {
  const colors = {
    red: urgent ? 'border-red-500 bg-red-50 text-red-800' : 'border-red-200 text-red-600',
    orange: urgent ? 'border-orange-500 bg-orange-50 text-orange-800' : 'border-orange-200 text-orange-600',
    yellow: urgent ? 'border-yellow-500 bg-yellow-50 text-yellow-800' : 'border-yellow-200 text-yellow-600',
    blue: 'border-blue-200 text-blue-600'
  };

  return (
    <Card className={`p-4 border-l-4 ${colors[color]}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm opacity-80">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
        <div className="opacity-80">
          {icon}
        </div>
      </div>
    </Card>
  );
};

const PurchaseOrderCard: React.FC<{ order: PurchaseOrderDraft }> = ({ order }) => (
  <Card className="p-4 border-l-4 border-blue-500">
    <div className="flex items-center justify-between mb-3">
      <h4 className="font-bold text-slate-800">{order.supplierName}</h4>
      <div className="text-xl font-bold text-blue-600">${order.total.toFixed(2)}</div>
    </div>
    
    <div className="text-sm text-slate-600 mb-3">
      {order.items.length} items to order
    </div>
    
    <div className="flex space-x-2">
      <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
        <Truck className="w-4 h-4 mr-1" />
        Send Order
      </Button>
      <Button size="sm" variant="outline">
        <Eye className="w-4 h-4 mr-1" />
        Review
      </Button>
    </div>
  </Card>
);

function getStatusColor(status: InventoryItem['status']) {
  switch (status) {
    case 'critical': return 'bg-red-500 text-white';
    case 'low': return 'bg-orange-500 text-white';
    case 'normal': return 'bg-green-500 text-white';
    case 'overstocked': return 'bg-blue-500 text-white';
  }
}

function getStatusIcon(status: InventoryItem['status']) {
  switch (status) {
    case 'critical': return <XCircle className="w-4 h-4" />;
    case 'low': return <AlertTriangle className="w-4 h-4" />;
    case 'normal': return <CheckCircle className="w-4 h-4" />;
    case 'overstocked': return <Package className="w-4 h-4" />;
  }
}

export default InventoryWorkflow;