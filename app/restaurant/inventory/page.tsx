"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/ui/navbar'
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { useUniversalInventory } from '@/hooks/useUniversalInventory';
import { OrganizationGuard, useOrganizationContext } from '@/components/restaurant/organization-guard';
import UniversalBulkUpload from '@/components/ui/universal-bulk-upload';
import Link from 'next/link';
import { 
  Package, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Mic,
  Scan,
  DollarSign,
  Truck,
  Thermometer,
  BarChart3,
  MessageSquare,
  Camera,
  Pizza,
  ChefHat,
  Users,
  Calendar,
  Zap,
  Brain,
  Shield,
  Leaf,
  Timer,
  Eye,
  MicIcon,
  Volume2,
  ArrowLeft,
  Home,
  Plus,
  Minus,
  RefreshCw,
  Search,
  Filter,
  Download,
  MapPin,
  Box,
  Activity,
  Warehouse,
  ShoppingCart,
  Upload
} from 'lucide-react';

// Universal Inventory Management with Real-time Integration
function RestaurantInventoryContent() {
  const { organizationId } = useOrganizationContext();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [stockUpdateModal, setStockUpdateModal] = useState<{
    open: boolean;
    item?: any;
    type: 'add' | 'remove' | 'adjust';
  }>({ open: false, type: 'add' });
  const [voiceInput, setVoiceInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [voiceAnimationActive, setVoiceAnimationActive] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  
  // Use Universal Inventory Service with organization context
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

  // Demo AI alerts based on real inventory data
  const [alerts, setAlerts] = useState([
    { 
      id: 1, 
      type: 'critical', 
      emoji: '🍅',
      message: 'Fresh tomatoes expire in 18 hours - use for tonight\'s dinner rush', 
      priority: 'high',
      action: 'Create prep task',
      aiConfidence: 0.94
    },
    { 
      id: 2, 
      type: 'success', 
      emoji: '🚚',
      message: 'Auto-ordered 50 lbs mozzarella from Dairy Fresh Co - arrives Thursday 8 AM', 
      priority: 'medium',
      aiConfidence: 0.89
    },
    { 
      id: 3, 
      type: 'info', 
      emoji: '💰',
      message: 'Food cost optimization: Switch to Supplier B for olive oil - save $180/month', 
      priority: 'low',
      action: 'Review proposal',
      aiConfidence: 0.87
    },
    { 
      id: 4, 
      type: 'warning', 
      emoji: '🌡️',
      message: 'Walk-in cooler temperature trending up - 39°F (target: 38°F)', 
      priority: 'high',
      action: 'Check equipment',
      aiConfidence: 0.96
    }
  ]);

  const voiceCommands = [
    "How much chicken do we have?",
    "Order more tomatoes for Thursday",
    "What's expiring today?",
    "Show me today's food cost",
    "Create prep list for dinner rush",
    "Check walk-in cooler temperature",
    "How many pizzas can we make?",
    "What needs to be ordered this week?"
  ];

  const aiResponses: { [key: string]: string } = {
    "How much chicken do we have?": "You have 12 lbs of chicken breast in Freezer #1. That's enough for approximately 48 servings or 3 days of normal usage. The chicken is fresh and expires on January 10th.",
    "Order more tomatoes for Thursday": "Perfect timing! I've placed an order for 50 lbs of fresh tomatoes from Local Farm Co for Thursday 8 AM delivery. Cost: $120. This will give you 6 days of coverage plus safety stock.",
    "What's expiring today?": "Today you have fresh tomatoes (14.5 lbs) and pizza dough (120 portions) expiring. I recommend using all tomatoes in tonight's dinner prep and the dough is perfect for today's orders.",
    "Show me today's food cost": "Today's food cost is $312 (22% of revenue). That's 3% below your target and $45 better than last Tuesday. Your best-performing items are pizza margherita with 68% margin.",
    "Create prep list for dinner rush": "Dinner prep list created: Use 14.5 lbs expiring tomatoes for sauce, prep 80 pizza portions, portion 6 lbs chicken for specials, and pick fresh basil. Estimated prep time: 2.5 hours.",
    "Check walk-in cooler temperature": "Walk-in cooler is at 39°F, which is 1 degree above optimal. I've detected a slight upward trend over the past 2 hours. I recommend checking the door seals and calling maintenance if it hits 40°F.",
    "How many pizzas can we make?": "With current inventory, you can make 165 pizzas: 120 with fresh dough today, plus ingredients for 45 more if you make additional dough. Mozzarella is your limiting factor after that.",
    "What needs to be ordered this week?": "This week's AI recommendations: 50 lbs mozzarella (Thursday), 6 bottles olive oil (Tuesday), 20 lbs flour (Wednesday), and 15 lbs chicken (Friday). Total estimated cost: $485."
  };

  const startVoiceInput = () => {
    setIsListening(true);
    setVoiceAnimationActive(true);
    setVoiceInput('');
    setAiResponse('');
    
    // Simulate voice recognition delay
    setTimeout(() => {
      const randomCommand = voiceCommands[Math.floor(Math.random() * voiceCommands.length)];
      setVoiceInput(randomCommand);
      setIsListening(false);
      
      // Simulate AI processing delay
      setTimeout(() => {
        setAiResponse(aiResponses[randomCommand] || "I can help you with inventory management. Try asking about stock levels, ordering, or costs.");
        setVoiceAnimationActive(false);
      }, 1500);
    }, 2000);
  };

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

  const getStatusEmoji = (status: string) => {
    switch (status) {
      case 'critical': return '🚨';
      case 'low': return '⚠️';
      case 'good': return '✅';
      case 'optimal': return '🎯';
      default: return '📦';
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'receipt': return <Truck className="h-4 w-4 text-green-600" />;
      case 'usage': return <ChefHat className="h-4 w-4 text-blue-600" />;
      case 'waste': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'transfer': return <Package className="h-4 w-4 text-purple-600" />;
      default: return <Package className="h-4 w-4" />;
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

  const handleBulkUploadComplete = () => {
    setShowBulkUpload(false);
    refetch(); // Refresh inventory data
  };

  const renderDashboard = () => (
    <motion.div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
      </div>

      {/* AI Voice Assistant */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-600" />
            AI Inventory Assistant
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <Button
                onClick={startVoiceInput}
                disabled={isListening}
                className={`flex items-center space-x-2 ${
                  isListening ? 'bg-red-500 hover:bg-red-600' : 'bg-purple-600 hover:bg-purple-700'
                } text-white transition-all`}
              >
                {isListening ? (
                  <>
                    <div className="w-4 h-4 bg-white rounded-full animate-pulse" />
                    <span>Listening...</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4" />
                    <span>Ask AI Assistant</span>
                  </>
                )}
              </Button>
              
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Volume2 className="w-4 h-4" />
                <span>Voice AI powered by HERA Universal</span>
              </div>
            </div>
            
            {voiceInput && (
              <div className="p-3 bg-white/60 rounded-lg border-l-4 border-purple-500">
                <p className="text-sm font-medium text-gray-700">You asked:</p>
                <p className="text-purple-800">{voiceInput}</p>
              </div>
            )}
            
            {aiResponse && (
              <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                <div className="flex items-start space-x-2">
                  <Brain className="w-4 h-4 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-700">AI Response:</p>
                    <p className="text-blue-800 text-sm">{aiResponse}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* AI Alerts */}
      <Card className="bg-white/80 backdrop-blur border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Brain className="w-5 h-5 text-blue-600" />
            Smart Inventory Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div key={alert.id} className="p-3 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{alert.emoji}</span>
                    <div>
                      <p className="font-medium text-gray-900">{alert.message}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge className={`${{
                          critical: 'bg-red-100 text-red-800',
                          warning: 'bg-yellow-100 text-yellow-800',
                          info: 'bg-blue-100 text-blue-800',
                          success: 'bg-green-100 text-green-800'
                        }[alert.type]}`}>
                          {alert.priority.toUpperCase()}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          AI Confidence: {(alert.aiConfidence * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  </div>
                  {alert.action && (
                    <Button size="sm" variant="outline">{alert.action}</Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Reorder Alerts */}
      {reorderAlerts.length > 0 && (
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
      )}
    </motion.div>
  );

  const renderInventoryItems = () => (
    <motion.div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex items-center space-x-4">
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

        <Button
          onClick={() => setShowBulkUpload(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-2"
        >
          <Upload className="w-4 h-4" />
          <span>Bulk Upload</span>
        </Button>
      </div>

      {/* Inventory Items */}
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
  );

  const renderTransactions = () => (
    <motion.div className="space-y-6">
      <Card className="bg-white/80 backdrop-blur border-gray-200">
        <CardHeader>
          <CardTitle className="text-xl">Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg">No transactions found</p>
              <p className="text-sm">Transaction history will appear here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.slice(0, 10).map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getTransactionIcon(transaction.transactionType)}
                    <div>
                      <p className="font-medium text-gray-900">{transaction.productName}</p>
                      <p className="text-sm text-gray-600">
                        {transaction.transactionType.toUpperCase()}: {transaction.quantity} units
                        {transaction.reason && ` - ${transaction.reason}`}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      {transaction.totalCost ? formatCurrency(transaction.totalCost) : '-'}
                    </p>
                    <p className="text-sm text-gray-600">
                      {new Date(transaction.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-green-50 p-6">
      
      {/* Navigation Bar with User Info */}
      <Navbar />
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
                Smart Inventory
              </h1>
              <p className="text-gray-600 mt-1">AI-powered inventory management with Universal Schema integration</p>
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

        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-white/80 backdrop-blur rounded-lg p-1 mb-6">
          {[
            { key: 'dashboard', label: 'Dashboard', icon: BarChart3 },
            { key: 'inventory', label: 'Inventory Items', icon: Package },
            { key: 'transactions', label: 'Transactions', icon: Activity }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-all ${
                activeTab === tab.key
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'inventory' && renderInventoryItems()}
          {activeTab === 'transactions' && renderTransactions()}
        </AnimatePresence>

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

      {/* Bulk Upload Modal */}
      <UniversalBulkUpload
        isOpen={showBulkUpload}
        onClose={() => setShowBulkUpload(false)}
        organizationId={organizationId!}
        onUploadComplete={handleBulkUploadComplete}
        entityTypes={['inventory']}
        defaultEntityType="inventory"
        title="Bulk Upload Inventory Items"
        description="Upload multiple inventory items from Excel files. Download the template to get started."
      />
    </div>
  );
}

// Main component with organization access control
export default function RestaurantInventoryPage() {
  return (
    <OrganizationGuard requiredRole="staff">
      <RestaurantInventoryContent />
    </OrganizationGuard>
  );
}