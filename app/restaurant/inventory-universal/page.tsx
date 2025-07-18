"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { useUniversalInventory } from '@/hooks/useUniversalInventory';
import { OrganizationGuard, useOrganizationContext } from '@/components/restaurant/organization-guard';
import Link from 'next/link';
import { 
  Package, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  DollarSign,
  Truck,
  Thermometer,
  BarChart3,
  Camera,
  ChefHat,
  Users,
  Zap,
  Brain,
  Shield,
  Leaf,
  Timer,
  Eye,
  ArrowLeft,
  Plus,
  Minus,
  RefreshCw,
  Search,
  Filter,
  Download,
  Calendar,
  MapPin,
  Box,
  Activity,
  Warehouse,
  ShoppingCart
} from 'lucide-react';

// Universal Inventory Management with Real-time Integration
function UniversalInventoryContent() {
  const { organizationId } = useOrganizationContext();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [stockUpdateModal, setStockUpdateModal] = useState<{
    open: boolean;
    item?: any;
    type: 'add' | 'remove' | 'adjust';
  }>({ open: false, type: 'add' });
  
  // Use Universal Inventory Service
  const {
    inventoryItems,
    transactions,
    reorderAlerts,
    analytics,
    loading,
    creating,
    updating,
    error,
    stats,
    updateStock,
    refetch
  } = useUniversalInventory(organizationId!);
  
  // Filter items based on search and category
  const filteredItems = inventoryItems.filter(item => {
    const matchesSearch = item.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });
  
  // Get unique categories
  const categories = ['all', ...Array.from(new Set(inventoryItems.map(item => item.category)))];
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'low': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'good': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'optimal': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'critical': return <AlertTriangle className="w-4 h-4" />;
      case 'low': return <Clock className="w-4 h-4" />;
      case 'good': return <CheckCircle className="w-4 h-4" />;
      case 'optimal': return <TrendingUp className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
    }
  };
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };
  
  const handleStockUpdate = async (quantity: number, reason: string) => {
    if (!stockUpdateModal.item) return;
    
    const stockChange = stockUpdateModal.type === 'remove' ? -quantity : quantity;
    const transactionType = stockUpdateModal.type === 'remove' ? 'usage' : 
                           stockUpdateModal.type === 'add' ? 'receipt' : 'adjustment';
    
    const success = await updateStock(
      stockUpdateModal.item.id,
      stockChange,
      transactionType,
      { reason, notes: `Manual ${stockUpdateModal.type}: ${reason}` }
    );
    
    if (success) {
      setStockUpdateModal({ open: false, type: 'add' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-green-50 p-6">
      <div className="container mx-auto max-w-7xl">
        
        {/* Header */}
        <motion.div
          className="flex items-center justify-between mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center space-x-4">
            <Link href="/restaurant/dashboard" className="p-2 rounded-xl bg-white/80 hover:bg-white transition-colors">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Warehouse className="w-6 h-6 text-white" />
                </div>
                Universal Inventory
              </h1>
              <p className="text-gray-600 mt-1">Real-time inventory management with Universal Schema integration</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
              <Activity className="w-4 h-4 mr-1" />
              {stats.totalItems} Items
            </Badge>
            <Button variant="outline" size="sm" onClick={refetch} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </motion.div>

        {/* Error Display */}
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-white/80 backdrop-blur border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Total Value</p>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalValue)}</p>
                    <p className="text-green-600 text-sm mt-1">{stats.totalItems} items</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-gray-400" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-white/80 backdrop-blur border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Low Stock</p>
                    <p className="text-2xl font-bold text-yellow-600">{stats.lowStockItems}</p>
                    <p className="text-gray-600 text-sm mt-1">Need attention</p>
                  </div>
                  <Clock className="w-8 h-8 text-gray-400" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-white/80 backdrop-blur border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Critical Items</p>
                    <p className="text-2xl font-bold text-red-600">{stats.criticalItems}</p>
                    <p className="text-gray-600 text-sm mt-1">Urgent action</p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-gray-400" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="bg-white/80 backdrop-blur border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Reorder Alerts</p>
                    <p className="text-2xl font-bold text-orange-600">{stats.reorderAlerts}</p>
                    <p className="text-gray-600 text-sm mt-1">Auto-ordering</p>
                  </div>
                  <ShoppingCart className="w-8 h-8 text-gray-400" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="bg-white/80 backdrop-blur border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Turnover Rate</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.averageTurnover.toFixed(1)}x</p>
                    <p className="text-gray-600 text-sm mt-1">Per month</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-gray-400" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center space-x-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search inventory items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-white/80"
            />
          </div>
          
          <select 
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg bg-white/80"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === 'all' ? 'All Categories' : category}
              </option>
            ))}
          </select>
        </div>

        {/* Reorder Alerts */}
        {reorderAlerts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mb-8"
          >
            <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-orange-600" />
                  Reorder Alerts ({reorderAlerts.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {reorderAlerts.slice(0, 3).map((alert) => (
                    <div key={alert.id} className="flex items-center justify-between p-3 bg-white/60 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Badge className={`${
                          alert.priority === 'critical' ? 'bg-red-100 text-red-800' :
                          alert.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {alert.priority.toUpperCase()}
                        </Badge>
                        <div>
                          <p className="font-medium text-gray-900">{alert.productName}</p>
                          <p className="text-sm text-gray-600">
                            Current: {alert.currentStock} | Reorder at: {alert.reorderPoint} | 
                            Suggested: {alert.suggestedQuantity} units
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">{formatCurrency(alert.estimatedCost)}</p>
                        <Button size="sm" className="mt-1">Order Now</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Inventory Items Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="bg-white/80 backdrop-blur border-gray-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">Inventory Items</CardTitle>
                <Badge variant="outline">{filteredItems.length} items</Badge>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="p-4 border border-gray-200 rounded-lg animate-pulse">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg">No inventory items found</p>
                  <p className="text-sm">Try adjusting your search or filters</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredItems.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * index }}
                      className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                            <Box className="w-6 h-6 text-blue-600" />
                          </div>
                          
                          <div>
                            <h3 className="font-semibold text-gray-900">{item.productName}</h3>
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <span>SKU: {item.sku}</span>
                              <span>•</span>
                              <span>{item.category}</span>
                              <span>•</span>
                              <MapPin className="w-3 h-3" />
                              <span>{item.location}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-6">
                          <div className="text-center">
                            <p className="text-2xl font-bold text-gray-900">{item.currentStock}</p>
                            <p className="text-sm text-gray-600">{item.unit}</p>
                          </div>
                          
                          <div className="text-center">
                            <p className="text-lg font-semibold text-green-600">{formatCurrency(item.totalValue)}</p>
                            <p className="text-sm text-gray-600">{formatCurrency(item.avgCost)}/{item.unit}</p>
                          </div>
                          
                          <div className="text-center">
                            <Badge className={getStatusColor(item.status)}>
                              {getStatusIcon(item.status)}
                              <span className="ml-1">{item.status.toUpperCase()}</span>
                            </Badge>
                            <p className="text-sm text-gray-600 mt-1">{item.daysRemaining} days left</p>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => setStockUpdateModal({ 
                                open: true, 
                                item, 
                                type: 'add' 
                              })}
                              disabled={updating}
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => setStockUpdateModal({ 
                                open: true, 
                                item, 
                                type: 'remove' 
                              })}
                              disabled={updating}
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                      
                      {item.aiRecommendation && (
                        <div className="mt-3 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                          <div className="flex items-start space-x-2">
                            <Brain className="w-4 h-4 text-blue-600 mt-0.5" />
                            <p className="text-sm text-blue-800">{item.aiRecommendation}</p>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Stock Update Modal */}
        {stockUpdateModal.open && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">
                {stockUpdateModal.type === 'add' ? 'Add Stock' : 
                 stockUpdateModal.type === 'remove' ? 'Remove Stock' : 'Adjust Stock'}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product
                  </label>
                  <p className="text-gray-900">{stockUpdateModal.item?.productName}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Stock
                  </label>
                  <p className="text-gray-900">{stockUpdateModal.item?.currentStock} {stockUpdateModal.item?.unit}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity
                  </label>
                  <Input
                    type="number"
                    placeholder="Enter quantity"
                    id="quantity"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reason
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter reason"
                    id="reason"
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-3 mt-6">
                <Button 
                  onClick={() => {
                    const quantity = parseFloat((document.getElementById('quantity') as HTMLInputElement)?.value || '0');
                    const reason = (document.getElementById('reason') as HTMLInputElement)?.value || '';
                    if (quantity > 0) {
                      handleStockUpdate(quantity, reason);
                    }
                  }}
                  disabled={updating}
                >
                  {updating ? 'Updating...' : 'Update Stock'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setStockUpdateModal({ open: false, type: 'add' })}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Main component with organization access control
export default function UniversalInventoryPage() {
  return (
    <OrganizationGuard requiredRole="staff">
      <UniversalInventoryContent />
    </OrganizationGuard>
  );
}