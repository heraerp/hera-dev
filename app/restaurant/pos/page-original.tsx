/**
 * HERA Universal Point of Sale System
 * "Don't Make Me Think" Design - Intuitive ordering for waiters and customers
 */

"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { useRestaurantManagement } from '@/hooks/useRestaurantManagement';
import { MenuManagementService, MenuCategory, MenuItem } from '@/lib/services/menuManagementService';
import { UniversalTransactionService } from '@/lib/services/universalTransactionService';
import { usePOSAccountingIntegration } from '@/hooks/usePOSAccountingIntegration';
import InvoicePrint, { InvoiceData } from '@/components/pos/InvoicePrint';
import TaxCalculator, { useTaxCalculation } from '@/components/tax/TaxCalculator';
import { indianTaxCalculator } from '@/lib/tax/IndianTaxConfig';
import {
  ShoppingCart,
  Plus,
  Minus,
  X,
  CreditCard,
  User,
  Clock,
  DollarSign,
  CheckCircle,
  AlertTriangle,
  Utensils,
  ChefHat,
  Eye,
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
  Receipt
} from 'lucide-react';

// Cart item interface
interface CartItem {
  id: string;
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  specialInstructions?: string;
  categoryName?: string;
  image_url?: string;
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

export default function POSPage() {
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
  
  // Tax configuration
  const [countryCode] = useState('IN'); // India as default
  const [isInterState] = useState(false); // Intra-state transactions for restaurants

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
        service.getCategories(false), // Only active categories
        service.getMenuItems(undefined, false) // Only active items
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
  const filteredMenuItems = menuItems.filter(item => {
    const itemName = item.entity_name || item.name || '';
    const itemDescription = item.description || '';
    const matchesSearch = itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         itemDescription.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category_id === selectedCategory;
    return matchesSearch && matchesCategory && item.is_active;
  });

  // Cart operations
  const addToCart = (menuItem: MenuItem) => {
    const existingItem = cart.find(item => item.menuItemId === menuItem.id);
    const categoryName = categories.find(cat => cat.id === menuItem.category_id)?.entity_name || 
                        categories.find(cat => cat.id === menuItem.category_id)?.name || '';

    if (existingItem) {
      setCart(cart.map(item =>
        item.menuItemId === menuItem.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      const newItem: CartItem = {
        id: `cart-${Date.now()}-${Math.random()}`,
        menuItemId: menuItem.id!,
        name: menuItem.entity_name || menuItem.name || '',
        price: menuItem.base_price,
        quantity: 1,
        categoryName,
        image_url: menuItem.image_url
      };
      setCart([...cart, newItem]);
    }
  };

  const updateQuantity = (cartItemId: string, newQuantity: number) => {
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

  const clearCart = () => {
    setCart([]);
    setCurrentOrder({
      customerName: '',
      tableNumber: '',
      orderType: 'dine_in',
      waiterName: '',
      specialInstructions: ''
    });
  };

  // Calculate totals using Indian tax system
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const taxBreakdown = useTaxCalculation(subtotal, countryCode, isInterState, 'restaurant_service');
  const total = taxBreakdown.total;

  // Process order with complete accounting integration
  const processOrder = async () => {
    if (cart.length === 0) {
      setError('Please add items to cart before placing order');
      return;
    }

    if (!currentOrder.customerName?.trim()) {
      setError('Please enter customer name');
      return;
    }

    if (!accountingInitialized) {
      setError('Accounting system not initialized. Please wait...');
      return;
    }

    setIsProcessingOrder(true);
    setError(null);

    try {
      console.log('🛒 Processing POS order with accounting integration:', {
        cart,
        orderDetails: currentOrder,
        totals: { subtotal, tax, total }
      });

      // Create order data for accounting integration
      const orderData = {
        id: crypto.randomUUID(),
        orderNumber: `ORD-${Date.now()}`,
        organizationId: organizationId!,
        customerName: currentOrder.customerName!,
        tableNumber: currentOrder.tableNumber || 'POS',
        items: cart.map(item => ({
          id: item.menuItemId,
          name: item.name,
          category: item.categoryName?.toLowerCase() || 'food',
          quantity: item.quantity,
          unitPrice: item.price,
          totalPrice: item.price * item.quantity
        })),
        subtotal,
        taxes: taxBreakdown.totalTax,
        discounts: 0,
        serviceCharges: 0,
        totalAmount: total,
        payment: {
          method: 'cash', // Default to cash, could be made configurable
          provider: 'cash',
          amount: total,
          reference: `CASH-${Date.now()}`,
          timestamp: new Date().toISOString()
        },
        status: 'completed' as const,
        createdAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        staffMember: {
          id: restaurantData?.userId || crypto.randomUUID(),
          name: orderMode === 'waiter' ? (currentOrder.waiterName || 'Staff') : 'Self-Service'
        },
        restaurant: {
          id: organizationId!,
          name: restaurantData?.restaurantName || 'Restaurant',
          location: 'Main Branch'
        }
      };

      // Process through POS → Accounting Integration
      const accountingResult = await processOrderCompletion(orderData);

      if (accountingResult.success) {
        // Also create order in Universal Transaction Service for backwards compatibility
        const orderResult = await UniversalTransactionService.createOrder({
          organizationId: organizationId!,
          customerName: currentOrder.customerName!,
          tableNumber: currentOrder.tableNumber || 'POS',
          orderType: currentOrder.orderType!,
          specialInstructions: currentOrder.specialInstructions,
          waiterName: orderMode === 'waiter' ? currentOrder.waiterName : 'Self-Service',
          items: cart.map(item => ({
            productId: item.menuItemId,
            productName: item.name,
            quantity: item.quantity,
            unitPrice: item.price,
            specialInstructions: item.specialInstructions
          }))
        });

        const orderNumber = orderResult.data?.transactionNumber || orderData.orderNumber;
        
        // Generate invoice data
        const invoiceData: InvoiceData = {
          orderNumber,
          date: new Date().toLocaleDateString(),
          time: new Date().toLocaleTimeString(),
          customer: {
            name: currentOrder.customerName!,
            phone: '',
            email: '',
            address: ''
          },
          restaurant: {
            name: restaurantData?.restaurantName || 'Restaurant',
            address: '123 Main Street, City, State 12345',
            phone: '(555) 123-4567',
            email: 'info@restaurant.com',
            gst: 'GST123456789'
          },
          order: {
            type: currentOrder.orderType!,
            tableNumber: currentOrder.tableNumber,
            waiterName: orderMode === 'waiter' ? currentOrder.waiterName : undefined,
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
              cgst: taxBreakdown.components.find(c => c.code === 'CGST') ? subtotal * taxBreakdown.components.find(c => c.code === 'CGST')!.rate : undefined,
              sgst: taxBreakdown.components.find(c => c.code === 'SGST') ? subtotal * taxBreakdown.components.find(c => c.code === 'SGST')!.rate : undefined,
              igst: taxBreakdown.components.find(c => c.code === 'IGST') ? subtotal * taxBreakdown.components.find(c => c.code === 'IGST')!.rate : undefined,
              rate: taxBreakdown.totalTax / subtotal
            }
          },
          payment: {
            method: 'cash',
            amount: total,
            reference: `CASH-${Date.now()}`
          },
          footer: {
            message: 'Thank you for dining with us!',
            returnPolicy: 'All sales are final. Please check your order before leaving.',
            website: 'www.restaurant.com'
          }
        };

        setLastInvoiceData(invoiceData);
        setOrderSuccess(`Order #${orderNumber} placed successfully! 📊 Journal entry created automatically.`);
        console.log('✅ Order created with complete accounting integration');
        console.log('📊 Accounting Result:', accountingResult);
        
        // Clear cart after successful order
        setTimeout(() => {
          clearCart();
          setOrderSuccess(null);
        }, 5000); // Show success message longer to highlight accounting integration
      } else {
        throw new Error(accountingResult.error || 'Failed to process order through accounting system');
      }

    } catch (error) {
      console.error('❌ Order processing failed:', error);
      setError(error instanceof Error ? error.message : 'Failed to process order');
    } finally {
      setIsProcessingOrder(false);
    }
  };

  // Get category icon (reuse from menu management)
  const getCategoryIcon = (category: MenuCategory) => {
    const iconMapping: Record<string, any> = {
      coffee: Coffee, pizza: Pizza, wine: Coffee, utensils: Utensils, star: Star
    };
    
    if (category.icon && iconMapping[category.icon.toLowerCase()]) {
      return iconMapping[category.icon.toLowerCase()];
    }
    
    const name = (category.entity_name || category.name || '').toLowerCase();
    if (name.includes('coffee') || name.includes('drink')) return Coffee;
    if (name.includes('pizza')) return Pizza;
    return Utensils;
  };

  // Loading state
  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-xl font-semibold text-gray-700">Loading POS System...</p>
          <p className="text-gray-500">Preparing your ordering experience</p>
        </div>
      </div>
    );
  }

  // Error state
  if (!organizationId) {
    return (
      <Alert className="m-6 border-red-200 bg-red-50">
        <AlertTriangle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          Restaurant setup required. Please complete restaurant setup first.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Title */}
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <ChefHat className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Point of Sale</h1>
                <p className="text-sm text-gray-500">{restaurantData?.restaurantName || 'Restaurant'}</p>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center space-x-4">
              {/* Accounting Integration Status */}
              <div className="flex items-center space-x-2">
                <Badge 
                  variant={accountingInitialized ? "default" : "secondary"}
                  className={accountingInitialized ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}
                >
                  <CalculatorIcon className="w-3 h-3 mr-1" />
                  {accountingInitialized ? 'Accounting Ready' : 'Initializing...'}
                </Badge>
                
                {/* Quick Access Buttons */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open('/test-journal-viewer', '_blank')}
                  className="hidden sm:flex"
                >
                  <FileText className="w-4 h-4 mr-1" />
                  Journal
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open('/test-trial-balance', '_blank')}
                  className="hidden sm:flex"
                >
                  <CalculatorIcon className="w-4 h-4 mr-1" />
                  Trial Balance
                </Button>
                
                {/* Reprint Last Invoice Button */}
                {lastInvoiceData && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowInvoicePrint(true)}
                    className="hidden sm:flex"
                  >
                    <Printer className="w-4 h-4 mr-1" />
                    Reprint
                  </Button>
                )}
              </div>

              {/* Order Mode Toggle */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setOrderMode('waiter')}
                  className={`px-4 py-2 rounded-md font-medium transition-all ${
                    orderMode === 'waiter'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <User className="w-4 h-4 mr-2 inline" />
                  Waiter
                </button>
                <button
                  onClick={() => setOrderMode('customer')}
                  className={`px-4 py-2 rounded-md font-medium transition-all ${
                    orderMode === 'customer'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Users className="w-4 h-4 mr-2 inline" />
                  Customer
                </button>
              </div>

              {/* Cart Badge */}
              <div className="relative">
                <ShoppingCart className="w-6 h-6 text-gray-600" />
                {cart.length > 0 && (
                  <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs min-w-[20px] h-5 rounded-full flex items-center justify-center">
                    {cart.reduce((sum, item) => sum + item.quantity, 0)}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Menu Section - 2/3 width */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Search and Categories */}
            <Card>
              <CardContent className="p-6">
                {/* Search */}
                <div className="relative mb-6">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    type="text"
                    placeholder="Search menu items..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 text-lg h-12"
                  />
                </div>

                {/* Category Buttons */}
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      selectedCategory === 'all'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    All Items
                  </button>
                  {categories.map((category) => {
                    const IconComponent = getCategoryIcon(category);
                    const itemCount = menuItems.filter(item => item.category_id === category.id).length;
                    
                    return (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id!)}
                        className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center space-x-2 ${
                          selectedCategory === category.id
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        <IconComponent className="w-4 h-4" />
                        <span>{category.entity_name || category.name}</span>
                        <Badge variant="secondary" className="ml-1 text-xs">
                          {itemCount}
                        </Badge>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Menu Items Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredMenuItems.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-all cursor-pointer"
                  onClick={() => addToCart(item)}
                >
                  {/* Item Image */}
                  <div className="h-32 bg-gray-100 flex items-center justify-center">
                    {item.image_url ? (
                      <img 
                        src={item.image_url} 
                        alt={item.entity_name || item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Utensils className="w-8 h-8 text-gray-400" />
                    )}
                  </div>
                  
                  {/* Item Content */}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900 text-sm">
                        {item.entity_name || item.name}
                      </h3>
                      {item.is_featured && (
                        <Star className="w-4 h-4 text-yellow-500 fill-current flex-shrink-0" />
                      )}
                    </div>
                    
                    <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                      {item.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg font-bold text-green-600">
                          ₹{item.base_price.toFixed(2)}
                        </span>
                        <div className="flex items-center text-xs text-gray-500">
                          <Clock className="w-3 h-3 mr-1" />
                          {item.preparation_time}m
                        </div>
                      </div>
                      
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    {/* Dietary badges */}
                    <div className="flex flex-wrap gap-1 mt-2">
                      {item.is_vegetarian && (
                        <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                          Vegetarian
                        </Badge>
                      )}
                      {item.is_vegan && (
                        <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200">
                          Vegan
                        </Badge>
                      )}
                      {item.is_gluten_free && (
                        <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                          Gluten-Free
                        </Badge>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {filteredMenuItems.length === 0 && (
              <Card>
                <CardContent className="text-center py-12">
                  <Utensils className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-500 text-lg">No menu items found</p>
                  <p className="text-gray-400 text-sm">Try adjusting your search or category filter</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Cart and Order Section - 1/3 width */}
          <div className="space-y-6">
            
            {/* Order Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Tag className="w-5 h-5 mr-2" />
                  Order Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                
                {/* Customer Name */}
                <div>
                  <Label htmlFor="customerName">Customer Name *</Label>
                  <Input
                    id="customerName"
                    value={currentOrder.customerName || ''}
                    onChange={(e) => setCurrentOrder(prev => ({ ...prev, customerName: e.target.value }))}
                    placeholder="Enter customer name"
                    className="mt-1"
                  />
                </div>

                {/* Table Number */}
                <div>
                  <Label htmlFor="tableNumber">Table Number</Label>
                  <Input
                    id="tableNumber"
                    value={currentOrder.tableNumber || ''}
                    onChange={(e) => setCurrentOrder(prev => ({ ...prev, tableNumber: e.target.value }))}
                    placeholder="e.g., Table 5"
                    className="mt-1"
                  />
                </div>

                {/* Order Type */}
                <div>
                  <Label>Order Type</Label>
                  <div className="flex space-x-2 mt-1">
                    {['dine_in', 'takeout', 'delivery'].map((type) => (
                      <button
                        key={type}
                        onClick={() => setCurrentOrder(prev => ({ ...prev, orderType: type as any }))}
                        className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                          currentOrder.orderType === type
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Waiter Name (only show in waiter mode) */}
                {orderMode === 'waiter' && (
                  <div>
                    <Label htmlFor="waiterName">Waiter Name</Label>
                    <Input
                      id="waiterName"
                      value={currentOrder.waiterName || ''}
                      onChange={(e) => setCurrentOrder(prev => ({ ...prev, waiterName: e.target.value }))}
                      placeholder="Enter waiter name"
                      className="mt-1"
                    />
                  </div>
                )}

                {/* Special Instructions */}
                <div>
                  <Label htmlFor="specialInstructions">Special Instructions</Label>
                  <Input
                    id="specialInstructions"
                    value={currentOrder.specialInstructions || ''}
                    onChange={(e) => setCurrentOrder(prev => ({ ...prev, specialInstructions: e.target.value }))}
                    placeholder="Any special requests..."
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Cart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Cart ({cart.length} items)
                  </div>
                  {cart.length > 0 && (
                    <Button variant="outline" size="sm" onClick={clearCart}>
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                
                {/* Cart Items */}
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{item.name}</h4>
                        <p className="text-xs text-gray-500">{item.categoryName}</p>
                        <p className="text-sm font-semibold text-green-600">
                          ₹{item.price.toFixed(2)} each
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {cart.length === 0 && (
                  <div className="text-center py-8">
                    <ShoppingCart className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-gray-500">Cart is empty</p>
                    <p className="text-gray-400 text-sm">Add items from the menu</p>
                  </div>
                )}

                {cart.length > 0 && (
                  <>
                    <Separator />
                    
                    {/* Tax Calculator */}
                    <TaxCalculator
                      subtotal={subtotal}
                      countryCode={countryCode}
                      isInterState={isInterState}
                      compactMode={true}
                    />

                    {/* Place Order Button */}
                    <Button
                      onClick={processOrder}
                      disabled={isProcessingOrder || cart.length === 0 || !currentOrder.customerName?.trim()}
                      className="w-full bg-green-600 hover:bg-green-700 text-white h-12 text-lg font-semibold"
                    >
                      {isProcessingOrder ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Processing Order...
                        </>
                      ) : (
                        <>
                          <CreditCard className="w-5 h-5 mr-2" />
                          Place Order - ₹{total.toFixed(2)}
                        </>
                      )}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Accounting Integration Stats */}
            {accountingInitialized && integrationStats && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center">
                    <CalculatorIcon className="w-4 h-4 mr-2" />
                    Today's Accounting
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <div className="font-semibold">{integrationStats.totalProcessed}</div>
                      <div className="text-gray-500">Orders Processed</div>
                    </div>
                    <div>
                      <div className="font-semibold">{integrationStats.successfullyPosted}</div>
                      <div className="text-gray-500">Journal Entries</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span>Success Rate:</span>
                    <Badge variant="outline" className="text-xs">
                      {integrationHealth?.successRate.toFixed(1) || 0}%
                    </Badge>
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open('/test-journal-viewer', '_blank')}
                      className="flex-1 text-xs"
                    >
                      View Journals
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open('/test-trial-balance', '_blank')}
                      className="flex-1 text-xs"
                    >
                      Trial Balance
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Status Messages */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <Alert className="border-red-200 bg-red-50">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800">{error}</AlertDescription>
                  </Alert>
                </motion.div>
              )}

              {orderSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      <div className="flex items-center justify-between">
                        <span>{orderSuccess}</span>
                        {lastInvoiceData && (
                          <Button
                            size="sm"
                            onClick={() => setShowInvoicePrint(true)}
                            className="bg-green-600 hover:bg-green-700 text-white ml-2"
                          >
                            <Printer className="w-4 h-4 mr-1" />
                            Print Invoice
                          </Button>
                        )}
                      </div>
                    </AlertDescription>
                  </Alert>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Invoice Print Modal */}
      {lastInvoiceData && (
        <InvoicePrint
          invoice={lastInvoiceData}
          isOpen={showInvoicePrint}
          onClose={() => setShowInvoicePrint(false)}
          printFormat="standard"
        />
      )}
    </div>
  );
}