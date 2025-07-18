'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ShoppingCart, 
  Users, 
  Clock, 
  Star,
  Plus,
  Minus,
  ChefHat,
  Utensils,
  Sparkles,
  Filter,
  Search,
  MapPin,
  Timer,
  AlertCircle,
  Check,
  Loader2
} from 'lucide-react';
import { MenuDisplay } from './MenuDisplay';
import { OrderCart } from './OrderCart';
import { CustomerInfo } from './CustomerInfo';
import { AIRecommendations } from './AIRecommendations';
import { useRestaurantOrder } from '@/hooks/useRestaurantOrder';
import { useMenu } from '@/hooks/useMenu';
import { useAI } from '@/hooks/useAI';

interface RestaurantOrderSystemProps {
  restaurantId?: string;
  tableNumber?: number;
  waiterId?: string;
}

export const RestaurantOrderSystem: React.FC<RestaurantOrderSystemProps> = ({
  restaurantId = 'first-floor-restaurant',
  tableNumber = 5,
  waiterId = 'staff-001'
}) => {
  // Core state management
  const { 
    currentOrder, 
    addItem, 
    updateItem, 
    removeItem, 
    clearOrder,
    orderTotal,
    submitOrder,
    isSubmitting,
    orderStatus
  } = useRestaurantOrder(restaurantId);

  const { 
    menuItems, 
    categories, 
    isLoading: menuLoading,
    filterByCategory,
    searchMenu,
    getPopularItems
  } = useMenu(restaurantId);

  const {
    recommendations,
    getRecommendations,
    getDietaryAlternatives,
    getUpsellSuggestions,
    isProcessing: aiProcessing
  } = useAI();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    dietary_preferences: [] as string[],
    allergies: [] as string[],
    table_number: tableNumber,
    special_requests: ''
  });
  const [activeTab, setActiveTab] = useState('menu');

  // Restaurant info
  const [restaurantInfo] = useState({
    name: 'Bella Italia',
    type: 'Italian Restaurant',
    location: 'Downtown',
    cuisine_type: 'Italian',
    hours: '11:00 AM - 11:00 PM',
    rating: 4.8,
    prep_time_avg: 15
  });

  // Load AI recommendations when order changes
  useEffect(() => {
    if (currentOrder.items.length > 0) {
      getRecommendations({
        current_order: currentOrder.items,
        customer_preferences: customerInfo.dietary_preferences,
        restaurant_id: restaurantId
      });
    }
  }, [currentOrder.items, customerInfo.dietary_preferences, restaurantId, getRecommendations]);

  // Filter menu based on selected category and search
  const filteredMenu = React.useMemo(() => {
    let filtered = menuItems;
    
    if (selectedCategory !== 'all') {
      filtered = filterByCategory(selectedCategory);
    }
    
    if (searchQuery) {
      filtered = searchMenu(searchQuery, filtered);
    }
    
    return filtered;
  }, [menuItems, selectedCategory, searchQuery, filterByCategory, searchMenu]);

  const handleSubmitOrder = async () => {
    if (currentOrder.items.length === 0) return;
    
    try {
      await submitOrder({
        customer_info: customerInfo,
        table_number: tableNumber,
        waiter_id: waiterId,
        order_type: 'dine_in',
        special_instructions: customerInfo.special_requests
      });
      
      // Reset form after successful submission
      setCustomerInfo({
        name: '',
        dietary_preferences: [],
        allergies: [],
        table_number: tableNumber,
        special_requests: ''
      });
      setActiveTab('menu');
    } catch (error) {
      console.error('Error submitting order:', error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <ChefHat className="w-8 h-8 text-orange-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{restaurantInfo.name}</h1>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span className="flex items-center space-x-1">
                  <MapPin className="w-4 h-4" />
                  <span>{restaurantInfo.location}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span>{restaurantInfo.rating}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Timer className="w-4 h-4" />
                  <span>~{restaurantInfo.prep_time_avg} min</span>
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <Badge variant="outline" className="text-green-700 border-green-300 bg-green-50">
            Table {tableNumber}
          </Badge>
          <Badge variant="outline">
            {currentOrder.items.length} items • ${orderTotal.toFixed(2)}
          </Badge>
        </div>
      </div>

      {/* Order Status */}
      {orderStatus && orderStatus !== 'draft' && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-4">
            <div className="flex items-center space-x-2">
              <Check className="w-5 h-5 text-green-600" />
              <span className="font-medium text-green-800">
                Order submitted successfully! 
              </span>
              <Badge variant="outline" className="text-green-700 border-green-300">
                Status: {orderStatus.toUpperCase()}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="menu" className="flex items-center space-x-2">
            <Utensils className="w-4 h-4" />
            <span>Menu</span>
          </TabsTrigger>
          <TabsTrigger value="cart" className="flex items-center space-x-2">
            <ShoppingCart className="w-4 h-4" />
            <span>Order ({currentOrder.items.length})</span>
          </TabsTrigger>
          <TabsTrigger value="customer" className="flex items-center space-x-2">
            <Users className="w-4 h-4" />
            <span>Customer</span>
          </TabsTrigger>
          <TabsTrigger value="ai" className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4" />
            <span>AI Suggestions</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="menu" className="space-y-6">
          <MenuDisplay
            menuItems={filteredMenu}
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onAddItem={addItem}
            isLoading={menuLoading}
            popularItems={getPopularItems()}
          />
        </TabsContent>

        <TabsContent value="cart" className="space-y-6">
          <OrderCart
            order={currentOrder}
            onUpdateItem={updateItem}
            onRemoveItem={removeItem}
            onClearOrder={clearOrder}
            orderTotal={orderTotal}
            isSubmitting={isSubmitting}
            onSubmitOrder={handleSubmitOrder}
            recommendations={recommendations}
            restaurantInfo={restaurantInfo}
          />
        </TabsContent>

        <TabsContent value="customer" className="space-y-6">
          <CustomerInfo
            customerInfo={customerInfo}
            onUpdateCustomerInfo={setCustomerInfo}
            tableNumber={tableNumber}
          />
        </TabsContent>

        <TabsContent value="ai" className="space-y-6">
          <AIRecommendations
            recommendations={recommendations}
            currentOrder={currentOrder}
            customerPreferences={customerInfo.dietary_preferences}
            onAddRecommendation={addItem}
            isProcessing={aiProcessing}
            onGetDietaryAlternatives={getDietaryAlternatives}
            onGetUpsellSuggestions={getUpsellSuggestions}
          />
        </TabsContent>
      </Tabs>

      {/* Floating Action Button for Cart */}
      {currentOrder.items.length > 0 && activeTab !== 'cart' && (
        <div className="fixed bottom-6 right-6">
          <Button
            onClick={() => setActiveTab('cart')}
            size="lg"
            className="rounded-full w-16 h-16 shadow-lg hover:shadow-xl transition-all"
          >
            <div className="relative">
              <ShoppingCart className="w-6 h-6" />
              <Badge 
                variant="destructive" 
                className="absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center text-xs"
              >
                {currentOrder.items.length}
              </Badge>
            </div>
          </Button>
        </div>
      )}

      {/* Quick Submit for Mobile */}
      {currentOrder.items.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t shadow-lg md:hidden">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold">${orderTotal.toFixed(2)}</div>
              <div className="text-sm text-gray-600">{currentOrder.items.length} items</div>
            </div>
            <Button 
              onClick={handleSubmitOrder}
              disabled={isSubmitting || currentOrder.items.length === 0}
              className="px-8"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Order'
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};