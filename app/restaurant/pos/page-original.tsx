/**
 * HERA Universal Point of Sale System - PO Gold Standard Theme
 * Professional dark/light theme with depth hierarchy
 */

"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { MetricsCard } from '@/components/ui/MetricsCard';
import { SearchInput } from '@/components/ui/SearchInput';
import { useRestaurantManagement } from '@/hooks/useRestaurantManagement';
import { MenuManagementService, MenuCategory, MenuItem } from '@/lib/services/menuManagementService';
import { UniversalTransactionService } from '@/lib/services/universalTransactionService';
import { usePOSAccountingIntegration } from '@/hooks/usePOSAccountingIntegration';
import InvoicePrint, { InvoiceData } from '@/components/pos/InvoicePrint';
import { useTaxCalculation } from '@/components/tax/TaxCalculator';
import {
  ShoppingCart,
  Plus,
  Minus,
  X,
  CreditCard,
  User,
  Clock,
  CheckCircle,
  AlertTriangle,
  Utensils,
  ChefHat,
  Coffee,
  Pizza,
  Search,
  Tag,
  Star,
  Users,
  Loader2,
  CalculatorIcon,
  FileText,
  Printer,
  Receipt,
  Bell,
  Settings,
  Info,
  Package,
  DollarSign
} from 'lucide-react';

// Cart Item interface
interface CartItem {
  id: string;
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  specialInstructions?: string;
  categoryName?: string;
  image_url?: string;
  category?: string;
}

// Order interface
interface Order {
  id?: string;
  customerName?: string;
  tableNumber?: string;
  orderType: 'dine_in' | 'takeout' | 'delivery';
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed';
  waiterName?: string;
  specialInstructions?: string;
}

export default function POSGoldStandardPage() {
  const { restaurantData, loading: authLoading } = useRestaurantManagement();
  const organizationId = restaurantData?.organizationId;

  // POS Accounting Integration
  const {
    isInitialized: accountingInitialized,
    processOrderCompletion,
    integrationStats,
    integrationHealth
  } = usePOSAccountingIntegration();

  // Services
  const [menuService, setMenuService] = useState<MenuManagementService | null>(null);
  
  // Data states
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // POS states
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orderMode, setOrderMode] = useState<'waiter' | 'customer'>('waiter');

  // Order states
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null);
  const [currentOrder, setCurrentOrder] = useState<Partial<Order>>({
    customerName: '',
    tableNumber: '',
    orderType: 'dine_in',
    waiterName: '',
    specialInstructions: ''
  });

  // Invoice printing states
  const [showInvoicePrint, setShowInvoicePrint] = useState(false);
  const [lastInvoiceData, setLastInvoiceData] = useState<InvoiceData | null>(null);
  
  // Tax configuration for India
  const [countryCode] = useState('IN');
  const [isInterState] = useState(false);

  // Initialize services and load data
  useEffect(() => {
    if (organizationId) {
      const service = MenuManagementService.getInstance(organizationId);
      setMenuService(service);
      loadMenuData(service);
    }
  }, [organizationId]);

  const loadMenuData = async (service: MenuManagementService) => {
    try {
      setLoading(true);
      setError(null);

      const [categoriesResult, itemsResult] = await Promise.all([
        service.getCategories(false),
        service.getMenuItems(undefined, false)
      ]);

      if (categoriesResult.success && categoriesResult.data) {
        setCategories(categoriesResult.data);
      }

      if (itemsResult.success && itemsResult.data) {
        setMenuItems(itemsResult.data);
      }

    } catch (error) {
      console.error('❌ Failed to load menu data:', error);
      setError('Failed to load menu. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  // Filter menu items
  const filteredMenuItems = menuItems
    .filter(item => {
      const itemName = item.entity_name || item.name || '';
      const itemDescription = item.description || '';
      const matchesSearch = itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           itemDescription.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || item.category_id === selectedCategory;
      return matchesSearch && matchesCategory && item.is_active;
    });

  // Cart operations
  const addToCart = (item: MenuItem) => {
    const existingItem = cart.find(cartItem => cartItem.menuItemId === item.id!);
    const categoryName = categories.find(cat => cat.id === item.category_id)?.entity_name || '';

    if (existingItem) {
      setCart(cart.map(cartItem =>
        cartItem.menuItemId === item.id
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      ));
    } else {
      const newItem: CartItem = {
        id: `cart-${Date.now()}-${Math.random()}`,
        menuItemId: item.id!,
        name: item.entity_name || item.name || '',
        price: item.base_price,
        quantity: 1,
        categoryName,
        image_url: item.image_url
      };
      setCart([...cart, newItem]);
    }
  };

  const updateCartQuantity = (cartItemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      setCart(cart.filter(item => item.id !== cartItemId));
    } else {
      setCart(cart.map(item =>
        item.id === cartItemId ? { ...item, quantity: newQuantity } : item
      ));
    }
  };

  const removeFromCart = (cartItemId: string) => {
    setCart(cart.filter(item => item.id !== cartItemId));
  };

  // Calculate totals with Indian GST
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const taxBreakdown = useTaxCalculation(subtotal, countryCode, isInterState, 'restaurant_service');
  const total = subtotal + taxBreakdown.totalTax;

  // Process checkout
  const handleCheckout = async () => {
    if (cart.length === 0) return;

    try {
      setIsProcessingOrder(true);

      // Create order using Universal Transaction Service
      const orderData = {
        organizationId: organizationId!,
        customerName: currentOrder.customerName || 'Walk-in Customer',
        tableNumber: currentOrder.tableNumber,
        orderType: currentOrder.orderType || 'dine_in',
        specialInstructions: currentOrder.specialInstructions,
        items: cart.map(item => ({
          productId: item.menuItemId,
          productName: item.name,
          quantity: item.quantity,
          unitPrice: item.price
        }))
      };

      const orderResult = await UniversalTransactionService.createOrder(orderData);

      if (orderResult.success && orderResult.data) {
        // Process through accounting integration
        const accountingResult = await processOrderCompletion({
          id: orderResult.data.transaction_id,
          orderNumber: orderResult.data.transaction_number,
          organizationId: organizationId!,
          items: cart.map(item => ({
            name: item.name,
            category: item.category || 'restaurant_service',
            quantity: item.quantity,
            unitPrice: item.price,
            totalPrice: item.price * item.quantity
          })),
          subtotal,
          taxes: taxBreakdown.totalTax,
          totalAmount: total,
          payment: { method: 'cash', amount: total },
          gstBreakdown: {
            cgst: taxBreakdown.components.find(c => c.name === 'CGST')?.amount || taxBreakdown.totalTax / 2,
            sgst: taxBreakdown.components.find(c => c.name === 'SGST')?.amount || taxBreakdown.totalTax / 2,
            rate: 0.05
          }
        });

        // Prepare invoice data
        const invoiceData: InvoiceData = {
          orderNumber: orderResult.data.transaction_number,
          date: new Date().toLocaleDateString('en-IN'),
          time: new Date().toLocaleTimeString('en-IN'),
          customer: {
            name: currentOrder.customerName || 'Walk-in Customer',
            phone: '',
            email: '',
            address: ''
          },
          restaurant: {
            name: restaurantData?.restaurantName || 'Restaurant',
            address: '123 Restaurant Street, City, State',
            phone: '+91 98765 43210',
            email: 'contact@restaurant.com',
            gst: '22AAAAA0000A1Z5'
          },
          order: {
            type: currentOrder.orderType || 'dine_in',
            tableNumber: currentOrder.tableNumber,
            waiterName: currentOrder.waiterName,
            specialInstructions: currentOrder.specialInstructions
          },
          items: cart.map(item => ({
            name: item.name,
            quantity: item.quantity,
            unitPrice: item.price,
            totalPrice: item.price * item.quantity,
            category: item.categoryName,
            notes: item.specialInstructions
          })),
          totals: {
            subtotal,
            tax: taxBreakdown.totalTax,
            total,
            gstBreakdown: {
              cgst: taxBreakdown.components.find(c => c.name === 'CGST')?.amount || taxBreakdown.totalTax / 2,
              sgst: taxBreakdown.components.find(c => c.name === 'SGST')?.amount || taxBreakdown.totalTax / 2,
              rate: 0.05
            }
          },
          payment: {
            method: 'cash',
            amount: total
          },
          footer: {
            message: 'Thank you for dining with us!',
            returnPolicy: 'All sales are final. No returns or exchanges.',
            website: 'www.restaurant.com'
          }
        };

        setLastInvoiceData(invoiceData);
        setShowInvoicePrint(true);

        // Clear cart and show success
        setCart([]);
        setOrderSuccess(`Order ${orderResult.data.transaction_number} placed successfully!`);
        
        // Clear success message after 5 seconds
        setTimeout(() => setOrderSuccess(null), 5000);
      }

    } catch (error) {
      console.error('❌ Checkout failed:', error);
      setError('Checkout failed. Please try again.');
    } finally {
      setIsProcessingOrder(false);
    }
  };

  // Loading state
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <ChefHat className="w-16 h-16 mx-auto mb-4 text-orange-600" />
          </motion.div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Preparing Your Kitchen
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Setting up the perfect ordering experience...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Restaurant POS
              </h1>
            </div>
            
            <div className="flex items-center gap-4">
              <Badge className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-0">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Online
              </Badge>
              
              <Button variant="outline" size="sm">
                <Clock className="w-4 h-4 mr-2" />
                Orders
              </Button>
              <Button variant="outline" size="sm">
                <Users className="w-4 h-4 mr-2" />
                Tables
              </Button>
              <Button variant="outline" size="sm">
                <Receipt className="w-4 h-4 mr-2" />
                Reports
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Success/Error Messages */}
      <AnimatePresence>
        {orderSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50"
          >
            <div className="bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              {orderSuccess}
            </div>
          </motion.div>
        )}
        
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50"
          >
            <div className="bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              {error}
              <button onClick={() => setError(null)} className="ml-2">
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Menu Section - 2/3 width */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Search and Order Mode */}
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <div className="p-6">
                {/* Search */}
                <div className="mb-6">
                  <SearchInput
                    placeholder="Search delicious items..."
                    value={searchQuery}
                    onChange={setSearchQuery}
                    className="w-full"
                  />
                </div>

                {/* Order Mode Toggle */}
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Order Mode
                  </h3>
                  <div className="flex rounded-lg p-1 bg-gray-100 dark:bg-gray-700">
                    <Button
                      variant={orderMode === 'waiter' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setOrderMode('waiter')}
                      className={orderMode === 'waiter' ? 'bg-blue-600 hover:bg-blue-700 text-white' : ''}
                    >
                      <User className="w-4 h-4 mr-2" />
                      Waiter
                    </Button>
                    <Button
                      variant={orderMode === 'customer' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setOrderMode('customer')}
                      className={orderMode === 'customer' ? 'bg-blue-600 hover:bg-blue-700 text-white' : ''}
                    >
                      <Users className="w-4 h-4 mr-2" />
                      Customer
                    </Button>
                  </div>
                </div>

                {/* Integration Status */}
                <div className="flex items-center gap-2">
                  <Badge 
                    className={accountingInitialized 
                      ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-0"
                      : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border-0"}
                  >
                    <CalculatorIcon className="w-3 h-3 mr-1" />
                    {accountingInitialized ? 'Accounting Ready' : 'Initializing...'}
                  </Badge>
                  
                  {lastInvoiceData && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowInvoicePrint(true)}
                    >
                      <Printer className="w-4 h-4 mr-2" />
                      Reprint
                    </Button>
                  )}
                </div>
              </div>
            </Card>

            {/* Category Filter */}
            <div className="flex space-x-2 overflow-x-auto pb-2">
              <Button
                variant={selectedCategory === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory('all')}
                className={selectedCategory === 'all' ? 'bg-blue-600 hover:bg-blue-700' : ''}
              >
                <Utensils className="w-4 h-4 mr-2" />
                All Items
                <Badge variant="secondary" className="ml-2">
                  {menuItems.filter(item => item.is_active).length}
                </Badge>
              </Button>
              
              {categories.map((category) => {
                const itemCount = menuItems.filter(item => item.category_id === category.id && item.is_active).length;
                const getCategoryIcon = () => {
                  const name = (category.entity_name || category.name || '').toLowerCase();
                  if (name.includes('coffee') || name.includes('drink') || name.includes('beverage')) {
                    return <Coffee className="w-4 h-4" />;
                  }
                  if (name.includes('pizza')) return <Pizza className="w-4 h-4" />;
                  if (name.includes('dessert') || name.includes('sweet')) return <Star className="w-4 h-4" />;
                  if (name.includes('special')) return <ChefHat className="w-4 h-4" />;
                  return <Utensils className="w-4 h-4" />;
                };
                
                return (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory(category.id!)}
                    className={selectedCategory === category.id ? 'bg-blue-600 hover:bg-blue-700' : ''}
                  >
                    {getCategoryIcon()}
                    <span className="ml-2">{category.entity_name || category.name}</span>
                    <Badge variant="secondary" className="ml-2">
                      {itemCount}
                    </Badge>
                  </Button>
                );
              })}
            </div>

            {/* Menu Items Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              <AnimatePresence>
                {filteredMenuItems.map((item, index) => {
                  const cartItem = cart.find(ci => ci.menuItemId === item.id);
                  const quantity = cartItem?.quantity || 0;
                  
                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <Card 
                        className={`bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:shadow-md transition-all cursor-pointer ${
                          quantity > 0 ? 'ring-2 ring-blue-500' : ''
                        }`}
                        onClick={() => addToCart(item)}
                      >
                        <div className="p-4">
                          {/* Item Image */}
                          {item.image_url && (
                            <div className="w-full h-32 bg-gray-100 dark:bg-gray-700 rounded-lg mb-3 overflow-hidden">
                              <img
                                src={item.image_url}
                                alt={item.entity_name || item.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}

                          {/* Item Details */}
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                                {item.entity_name || item.name}
                              </h3>
                              {item.description && (
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                                  {item.description}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Price and Action */}
                          <div className="flex items-center justify-between mt-3">
                            <span className="text-xl font-bold text-gray-900 dark:text-gray-100">
                              ₹{item.base_price.toFixed(2)}
                            </span>
                            <div className="flex items-center gap-2">
                              {quantity > 0 && (
                                <Badge className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-0">
                                  {quantity} in cart
                                </Badge>
                              )}
                              <Button
                                size="sm"
                                disabled={!item.is_active}
                                className="bg-blue-600 hover:bg-blue-700"
                              >
                                <Plus className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {filteredMenuItems.length === 0 && (
              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <div className="p-12 text-center">
                  <Search className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    No items found
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Try adjusting your search or category filter
                  </p>
                </div>
              </Card>
            )}
          </div>

          {/* Cart Section - 1/3 width */}
          <div className="lg:col-span-1">
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 sticky top-4 max-h-[calc(100vh-120px)] overflow-y-auto">
              <div className="p-6 space-y-4">
                {/* Cart Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      Order Summary
                    </h3>
                  </div>
                  <Badge className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-0">
                    {cart.length} items
                  </Badge>
                </div>

                {/* Order Details Section - Always Show when cart has items */}
                {cart.length > 0 && (
                  <>
                    <Separator className="border-gray-200 dark:border-gray-700" />
                    <div className="space-y-3">
                      <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100">Order Details</h4>
                      
                      {/* Customer Name */}
                      <div>
                        <Label htmlFor="customerName" className="text-xs text-gray-600 dark:text-gray-400">
                          Customer Name *
                        </Label>
                        <Input
                          id="customerName"
                          value={currentOrder.customerName || ''}
                          onChange={(e) => setCurrentOrder({ ...currentOrder, customerName: e.target.value })}
                          placeholder="Enter customer name"
                          className="mt-1 h-8 text-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                        />
                      </div>

                      {/* Table Number and Order Type Row */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor="tableNumber" className="text-xs text-gray-600 dark:text-gray-400">
                            Table Number
                          </Label>
                          <Input
                            id="tableNumber"
                            value={currentOrder.tableNumber || ''}
                            onChange={(e) => setCurrentOrder({ ...currentOrder, tableNumber: e.target.value })}
                            placeholder="Table #"
                            className="mt-1 h-8 text-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                          />
                        </div>
                        
                        {/* Order Type */}
                        <div>
                          <Label className="text-xs text-gray-600 dark:text-gray-400">Order Type</Label>
                          <select
                            value={currentOrder.orderType || 'dine_in'}
                            onChange={(e) => setCurrentOrder({ ...currentOrder, orderType: e.target.value as any })}
                            className="mt-1 h-8 w-full text-sm rounded-md px-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                          >
                            <option value="dine_in">Dine In</option>
                            <option value="takeout">Takeout</option>
                            <option value="delivery">Delivery</option>
                          </select>
                        </div>
                      </div>

                      {/* Waiter Name (only show in waiter mode) */}
                      {orderMode === 'waiter' && (
                        <div>
                          <Label htmlFor="waiterName" className="text-xs text-gray-600 dark:text-gray-400">
                            Waiter Name
                          </Label>
                          <Input
                            id="waiterName"
                            value={currentOrder.waiterName || ''}
                            onChange={(e) => setCurrentOrder({ ...currentOrder, waiterName: e.target.value })}
                            placeholder="Enter waiter name"
                            className="mt-1 h-8 text-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                          />
                        </div>
                      )}
                    </div>
                  </>
                )}

                {/* Cart Items */}
                {cart.length > 0 && (
                  <>
                    <Separator className="border-gray-200 dark:border-gray-700" />
                    <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100">Items</h4>
                  </>
                )}
                
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {cart.map((item) => (
                    <motion.div
                      key={item.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                    >
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 dark:text-gray-100">{item.name}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          ₹{item.price.toFixed(2)} each
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            updateCartQuantity(item.id, item.quantity - 1);
                          }}
                          className="w-8 h-8 p-0"
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <span className="w-8 text-center font-semibold text-gray-900 dark:text-gray-100">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            updateCartQuantity(item.id, item.quantity + 1);
                          }}
                          className="w-8 h-8 p-0"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {cart.length > 0 && (
                  <>
                    <Separator className="border-gray-200 dark:border-gray-700" />
                    
                    {/* Totals */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-gray-600 dark:text-gray-400">
                        <span>Subtotal:</span>
                        <span className="font-mono">₹{subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-gray-600 dark:text-gray-400">
                        <span>GST (5%):</span>
                        <span className="font-mono">₹{taxBreakdown.totalTax.toFixed(2)}</span>
                      </div>
                      <Separator className="border-gray-200 dark:border-gray-700" />
                      <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-gray-100">
                        <span>Total:</span>
                        <span className="font-mono text-blue-600 dark:text-blue-400">
                          ₹{total.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Checkout Button */}
                    <Button
                      onClick={handleCheckout}
                      disabled={isProcessingOrder}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      {isProcessingOrder ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <CreditCard className="w-4 h-4 mr-2" />
                          Proceed to Checkout
                        </>
                      )}
                    </Button>
                  </>
                )}

                {cart.length === 0 && (
                  <div className="text-center py-8">
                    <ShoppingCart className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                    <p className="text-gray-600 dark:text-gray-400">Your cart is empty</p>
                    <p className="text-sm text-gray-500 dark:text-gray-500">Add items to get started</p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </main>

      {/* Invoice Print Modal */}
      {lastInvoiceData && (
        <InvoicePrint
          invoice={lastInvoiceData}
          isOpen={showInvoicePrint}
          onClose={() => setShowInvoicePrint(false)}
          printFormat="both"
        />
      )}
    </div>
  );
}