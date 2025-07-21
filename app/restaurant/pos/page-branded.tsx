/**
 * HERA Universal Point of Sale System - Premium Branded Edition
 * Sophisticated hospitality design inspired by Pentagram's approach
 */

"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useRestaurantManagement } from '@/hooks/useRestaurantManagement';
import { MenuManagementService, MenuCategory, MenuItem } from '@/lib/services/menuManagementService';
import { UniversalTransactionService } from '@/lib/services/universalTransactionService';
import { usePOSAccountingIntegration } from '@/hooks/usePOSAccountingIntegration';
import InvoicePrint, { InvoiceData } from '@/components/pos/InvoicePrint';
import { useTaxCalculation } from '@/components/tax/TaxCalculator';
import { 
  RestaurantPOSLayout, 
  BrandedCard, 
  BrandedButton, 
  MenuItemCard, 
  CategoryFilter, 
  CartSummary 
} from '@/components/pos/RestaurantPOSLayout';
import { RESTAURANT_TYPOGRAPHY } from '@/lib/design/RestaurantBrandSystem';
import { useTheme } from '@/components/providers/theme-provider';
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
  Info
} from 'lucide-react';

// Enhanced Cart Item interface for branded experience
interface BrandedCartItem {
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

// Enhanced Order interface
interface BrandedOrder {
  id?: string;
  customerName?: string;
  tableNumber?: string;
  orderType: 'dine_in' | 'takeout' | 'delivery';
  items: BrandedCartItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed';
  waiterName?: string;
  specialInstructions?: string;
}

export default function BrandedPOSPage() {
  const { restaurantData, loading: authLoading } = useRestaurantManagement();
  const organizationId = restaurantData?.organizationId;
  const { getModernThemeColors } = useTheme();
  const modernColors = getModernThemeColors();
  const isDark = modernColors.background === '#1a1a1a';

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
  const [cart, setCart] = useState<BrandedCartItem[]>([]);
  const [orderMode, setOrderMode] = useState<'waiter' | 'customer'>('waiter');

  // Order states
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null);
  const [currentOrder, setCurrentOrder] = useState<Partial<BrandedOrder>>({
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

  // Transform data for branded components
  const transformedCategories = [
    {
      id: 'all',
      name: 'All Items',
      icon: <Utensils className="w-4 h-4" />,
      count: menuItems.filter(item => item.is_active).length
    },
    ...categories.map(category => {
      const getCategoryIcon = (category: MenuCategory) => {
        const name = (category.entity_name || category.name || '').toLowerCase();
        if (name.includes('coffee') || name.includes('drink') || name.includes('beverage')) {
          return <Coffee className="w-4 h-4" />;
        }
        if (name.includes('pizza')) return <Pizza className="w-4 h-4" />;
        if (name.includes('dessert') || name.includes('sweet')) return <Star className="w-4 h-4" />;
        if (name.includes('appetizer') || name.includes('starter')) return <Coffee className="w-4 h-4" />;
        if (name.includes('special')) return <ChefHat className="w-4 h-4" />;
        return <Utensils className="w-4 h-4" />;
      };

      return {
        id: category.id!,
        name: category.entity_name || category.name || '',
        icon: getCategoryIcon(category),
        count: menuItems.filter(item => item.category_id === category.id && item.is_active).length
      };
    })
  ];

  // Transform menu items for branded cards
  const transformedMenuItems = menuItems
    .filter(item => {
      const itemName = item.entity_name || item.name || '';
      const itemDescription = item.description || '';
      const matchesSearch = itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           itemDescription.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || item.category_id === selectedCategory;
      return matchesSearch && matchesCategory && item.is_active;
    })
    .map(item => {
      const categoryName = categories.find(cat => cat.id === item.category_id)?.entity_name || 
                          categories.find(cat => cat.id === item.category_id)?.name || '';
      
      // Map category names to standard categories for styling
      const getCategoryType = (categoryName: string) => {
        const name = categoryName.toLowerCase();
        if (name.includes('appetizer') || name.includes('starter')) return 'appetizer';
        if (name.includes('main') || name.includes('entree')) return 'main_course';
        if (name.includes('dessert')) return 'dessert';
        if (name.includes('beverage') || name.includes('drink')) return 'beverage';
        if (name.includes('special')) return 'special';
        return 'main_course'; // default
      };

      return {
        id: item.id!,
        name: item.entity_name || item.name || '',
        price: item.base_price,
        category: getCategoryType(categoryName),
        description: item.description,
        image_url: item.image_url,
        isAvailable: item.is_active
      };
    });

  // Cart operations
  const addToCart = (item: any) => {
    const existingItem = cart.find(cartItem => cartItem.menuItemId === item.id);
    const categoryName = categories.find(cat => cat.id === menuItems.find(mi => mi.id === item.id)?.category_id)?.entity_name || '';

    if (existingItem) {
      setCart(cart.map(cartItem =>
        cartItem.menuItemId === item.id
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      ));
    } else {
      const newItem: BrandedCartItem = {
        id: `cart-${Date.now()}-${Math.random()}`,
        menuItemId: item.id,
        name: item.name,
        price: item.price,
        quantity: 1,
        categoryName,
        category: item.category,
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

  // Transform cart for CartSummary component
  const transformedCart = cart.map(item => ({
    id: item.id,
    name: item.name,
    price: item.price,
    quantity: item.quantity,
    category: item.category
  }));

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
      <RestaurantPOSLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <ChefHat className="w-16 h-16 mx-auto mb-4 text-orange-600" />
            </motion.div>
            <h2 className={`text-2xl font-bold mb-2`}
               style={{ 
                 fontFamily: RESTAURANT_TYPOGRAPHY.fontFamilies.display,
                 color: isDark ? modernColors.text : '#1f2937'
               }}>
              Preparing Your Kitchen
            </h2>
            <p style={{ color: isDark ? modernColors.textSecondary : '#64748b' }}>
              Setting up the perfect ordering experience...
            </p>
          </div>
        </div>
      </RestaurantPOSLayout>
    );
  }

  // Error state
  if (!organizationId) {
    return (
      <RestaurantPOSLayout>
        <BrandedCard variant="elevated" className="max-w-md mx-auto mt-12">
          <div className="text-center p-6">
            <AlertTriangle className="w-12 h-12 text-orange-600 mx-auto mb-4" />
            <h2 className={`text-xl font-bold mb-2`}
               style={{ 
                 fontFamily: RESTAURANT_TYPOGRAPHY.fontFamilies.display,
                 color: isDark ? modernColors.text : '#1f2937'
               }}>
              Restaurant Setup Required
            </h2>
            <p className="mb-4" style={{ color: isDark ? modernColors.textSecondary : '#64748b' }}>
              Please complete your restaurant setup to access the POS system.
            </p>
            <BrandedButton variant="primary" className="bg-orange-600 hover:bg-orange-700">
              Complete Setup
            </BrandedButton>
          </div>
        </BrandedCard>
      </RestaurantPOSLayout>
    );
  }

  return (
    <RestaurantPOSLayout>
      {/* Success Message */}
      <AnimatePresence>
        {orderSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50"
          >
            <div className="bg-orange-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              {orderSuccess}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Message */}
      <AnimatePresence>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Menu Section - 2/3 width */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Search and Order Mode */}
          <BrandedCard>
            <div className="p-6">
              {/* Search */}
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 z-10" 
                       style={{ color: isDark ? modernColors.textMuted : '#9ca3af' }} />
                <Input
                  type="text"
                  placeholder="Search delicious items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 text-lg h-12 rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-0"
                  style={{
                    backgroundColor: isDark ? modernColors.surface : '#ffffff',
                    borderColor: isDark ? modernColors.border : '#e5e7eb',
                    color: isDark ? modernColors.text : '#1f2937',
                    boxShadow: isDark ? `0 1px 3px ${modernColors.shadow}` : '0 1px 3px rgba(0, 0, 0, 0.1)'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#ea580c'; // orange-600
                    e.target.style.boxShadow = isDark 
                      ? `0 0 0 3px rgba(234, 88, 12, 0.2), 0 2px 8px ${modernColors.shadow}`
                      : `0 0 0 3px rgba(234, 88, 12, 0.2), 0 2px 8px rgba(0, 0, 0, 0.1)`;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = isDark ? modernColors.border : '#e5e7eb';
                    e.target.style.boxShadow = isDark 
                      ? `0 1px 3px ${modernColors.shadow}`
                      : '0 1px 3px rgba(0, 0, 0, 0.1)';
                  }}
                />
                <style jsx>{`
                  input::placeholder {
                    color: ${isDark ? modernColors.textMuted : '#9ca3af'} !important;
                    opacity: ${isDark ? '0.7' : '0.6'};
                  }
                  input:focus::placeholder {
                    opacity: 0.5;
                  }
                `}</style>
              </div>

              {/* Order Mode Toggle */}
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-lg font-semibold`}
                   style={{ 
                     fontFamily: RESTAURANT_TYPOGRAPHY.fontFamilies.sans,
                     color: isDark ? modernColors.text : '#1f2937'
                   }}>
                  Order Mode
                </h3>
                <div className="flex rounded-lg p-1 shadow-sm" 
                     style={{ 
                       backgroundColor: isDark ? modernColors.gray800 : modernColors.gray800,
                       border: isDark ? `1px solid ${modernColors.gray700}` : `1px solid ${modernColors.gray700}`
                     }}>
                  <BrandedButton
                    variant={orderMode === 'waiter' ? 'primary' : 'ghost'}
                    onClick={() => {
                      console.log('Setting order mode to waiter');
                      setOrderMode('waiter');
                    }}
                    icon={<User className="w-4 h-4" />}
                    className={`px-4 py-2 ${orderMode === 'waiter' ? 'bg-orange-600 hover:bg-orange-700' : ''}`}
                  >
                    Waiter
                  </BrandedButton>
                  <BrandedButton
                    variant={orderMode === 'customer' ? 'primary' : 'ghost'}
                    onClick={() => {
                      console.log('Setting order mode to customer');
                      setOrderMode('customer');
                    }}
                    icon={<Users className="w-4 h-4" />}
                    className={`px-4 py-2 ${orderMode === 'customer' ? 'bg-orange-600 hover:bg-orange-700' : ''}`}
                  >
                    Customer
                  </BrandedButton>
                </div>
              </div>

              {/* Integration Status */}
              <div className="flex items-center gap-2">
                <Badge 
                  className="border font-medium"
                  style={{
                    backgroundColor: accountingInitialized 
                      ? (isDark ? 'rgba(34, 197, 94, 0.15)' : 'rgba(34, 197, 94, 0.08)')
                      : (isDark ? 'rgba(234, 179, 8, 0.15)' : 'rgba(234, 179, 8, 0.08)'),
                    color: accountingInitialized 
                      ? (isDark ? '#4ade80' : '#16a34a')
                      : (isDark ? '#fbbf24' : '#ca8a04'),
                    borderColor: accountingInitialized 
                      ? (isDark ? 'rgba(34, 197, 94, 0.25)' : 'rgba(34, 197, 94, 0.15)')
                      : (isDark ? 'rgba(234, 179, 8, 0.25)' : 'rgba(234, 179, 8, 0.15)')
                  }}
                >
                  <CalculatorIcon className="w-3 h-3 mr-1" />
                  {accountingInitialized ? 'Accounting Ready' : 'Initializing...'}
                </Badge>
                
                {lastInvoiceData && (
                  <BrandedButton
                    variant="ghost"
                    onClick={() => setShowInvoicePrint(true)}
                    icon={<Printer className="w-4 h-4" />}
                    className="text-sm"
                  >
                    Reprint
                  </BrandedButton>
                )}
              </div>
            </div>
          </BrandedCard>

          {/* Category Filter */}
          <CategoryFilter
            categories={transformedCategories}
            selectedCategory={selectedCategory}
            onCategorySelect={setSelectedCategory}
          />

          {/* Menu Items Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <AnimatePresence>
              {transformedMenuItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <MenuItemCard
                    item={item}
                    isSelected={cart.some(cartItem => cartItem.menuItemId === item.id)}
                    onAdd={() => addToCart(item)}
                    quantity={cart.find(cartItem => cartItem.menuItemId === item.id)?.quantity || 0}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {transformedMenuItems.length === 0 && (
            <BrandedCard className="text-center py-12">
              <Search className="w-12 h-12 mx-auto mb-4" 
                     style={{ color: isDark ? modernColors.textMuted : '#9ca3af' }} />
              <h3 className={`text-lg font-semibold mb-2`}
                 style={{ 
                   fontFamily: RESTAURANT_TYPOGRAPHY.fontFamilies.display,
                   color: isDark ? modernColors.textSecondary : '#64748b'
                 }}>
                No items found
              </h3>
              <p style={{ color: isDark ? modernColors.textMuted : '#9ca3af' }}>
                Try adjusting your search or category filter
              </p>
            </BrandedCard>
          )}
        </div>

        {/* Cart Section - 1/3 width */}
        <div className="lg:col-span-1">
          <CartSummary
            items={transformedCart}
            subtotal={subtotal}
            tax={taxBreakdown.totalTax}
            total={total}
            onCheckout={handleCheckout}
            onItemRemove={removeFromCart}
            onItemQuantityChange={updateCartQuantity}
            orderMode={orderMode}
            orderDetails={currentOrder}
            onOrderDetailsChange={setCurrentOrder}
          />
        </div>
      </div>

      {/* Invoice Print Modal */}
      {lastInvoiceData && (
        <InvoicePrint
          invoice={lastInvoiceData}
          isOpen={showInvoicePrint}
          onClose={() => setShowInvoicePrint(false)}
          printFormat="both"
        />
      )}
    </RestaurantPOSLayout>
  );
}