'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Minus, 
  ShoppingCart, 
  Star, 
  Clock, 
  Flame,
  Leaf,
  ArrowRight,
  Check,
  AlertCircle
} from 'lucide-react';
import { useMenu } from '@/hooks/useMenu';
import { useRestaurantOrder } from '@/hooks/useRestaurantOrder';
import { Card } from '@/components/ui/revolutionary-card';
import { Button } from '@/components/ui/revolutionary-button';
import { Badge } from '@/components/ui/badge';

interface CustomerMenuProps {
  restaurantId: string;
  tableNumber?: number;
  onOrderComplete?: (orderData: any) => void;
}

// Steve Krug Principle: Don't make me think - immediate visual recognition
const CustomerMenu: React.FC<CustomerMenuProps> = ({
  restaurantId,
  tableNumber,
  onOrderComplete
}) => {
  const { menuItems, categories, isLoading } = useMenu(restaurantId);
  const { currentOrder, addItem, updateItem, removeItem, orderTotal } = useRestaurantOrder(restaurantId);
  
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [cartVisible, setCartVisible] = useState(false);
  const [orderStep, setOrderStep] = useState<'menu' | 'cart' | 'customer' | 'payment'>('menu');

  // Auto-select first category when menu loads
  useEffect(() => {
    if (categories.length > 0 && !selectedCategory) {
      setSelectedCategory(categories[0]);
    }
  }, [categories, selectedCategory]);

  // Show cart when items added
  useEffect(() => {
    if (currentOrder.items.length > 0 && !cartVisible) {
      setCartVisible(true);
    }
  }, [currentOrder.items.length, cartVisible]);

  // Steve Krug: One primary action per screen
  const filteredItems = selectedCategory 
    ? menuItems.filter(item => item.category === selectedCategory)
    : menuItems;

  // Steve Krug: Put most important things first
  const popularItems = filteredItems
    .filter(item => item.ai_recommended || (item.popularity_score && item.popularity_score > 0.8))
    .slice(0, 3);

  const regularItems = filteredItems
    .filter(item => !item.ai_recommended && (!item.popularity_score || item.popularity_score <= 0.8));

  const getSpiceIndicator = (level: number) => {
    return Array.from({ length: level }, (_, i) => (
      <Flame key={i} className="w-3 h-3 text-red-500" />
    ));
  };

  const getDietaryBadges = (options: string[]) => {
    const badges = [];
    if (options.includes('vegetarian')) badges.push({ icon: <Leaf className="w-3 h-3" />, text: 'Veg', color: 'bg-green-100 text-green-800' });
    if (options.includes('vegan')) badges.push({ icon: <Leaf className="w-3 h-3" />, text: 'Vegan', color: 'bg-green-200 text-green-900' });
    if (options.includes('gluten_free')) badges.push({ text: 'GF', color: 'bg-blue-100 text-blue-800' });
    
    return badges.map((badge, index) => (
      <Badge key={index} className={`text-xs ${badge.color}`}>
        {badge.icon && badge.icon}
        {badge.text}
      </Badge>
    ));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-slate-200 border-t-orange-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading delicious menu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Steve Krug: Clear, obvious header with essential info only */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img 
                src="/icons/hera-logo.png" 
                alt="Restaurant Logo" 
                className="w-10 h-10 object-contain"
              />
              <div>
                <h1 className="text-xl font-bold text-slate-800">First Floor Restaurant</h1>
                {tableNumber && (
                  <p className="text-sm text-slate-500">Table {tableNumber}</p>
                )}
              </div>
            </div>
            
            {/* Steve Krug: Always visible cart with clear state */}
            <motion.button
              onClick={() => setCartVisible(!cartVisible)}
              className={`relative p-3 rounded-xl transition-colors ${
                currentOrder.items.length > 0 
                  ? 'bg-orange-500 text-white shadow-lg' 
                  : 'bg-slate-100 text-slate-600'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ShoppingCart className="w-6 h-6" />
              {currentOrder.items.length > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold"
                >
                  {currentOrder.items.reduce((sum, item) => sum + item.quantity, 0)}
                </motion.span>
              )}
            </motion.button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Steve Krug: Horizontal scrolling categories - mobile pattern users expect */}
        <div className="mb-6">
          <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`flex-shrink-0 px-6 py-3 rounded-full font-medium transition-all ${
                  selectedCategory === category
                    ? 'bg-orange-500 text-white shadow-md'
                    : 'bg-white text-slate-600 hover:bg-slate-100'
                }`}
              >
                {category.charAt(0).toUpperCase() + category.slice(1).replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Steve Krug: Popular items first - reduce decision fatigue */}
        {popularItems.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center space-x-2 mb-4">
              <Star className="w-5 h-5 text-orange-500" />
              <h2 className="text-lg font-bold text-slate-800">Most Popular</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              {popularItems.map((item) => (
                <MenuItem key={item.id} item={item} onAdd={addItem} />
              ))}
            </div>
          </div>
        )}

        {/* All items in category */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {regularItems.map((item) => (
            <MenuItem key={item.id} item={item} onAdd={addItem} />
          ))}
        </div>
      </div>

      {/* Steve Krug: Persistent, obvious cart */}
      <AnimatePresence>
        {cartVisible && currentOrder.items.length > 0 && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50"
          >
            <div className="max-w-4xl mx-auto p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-800">Your Order</h3>
                <button
                  onClick={() => setCartVisible(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  ×
                </button>
              </div>
              
              <div className="max-h-48 overflow-y-auto space-y-3 mb-4">
                {currentOrder.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between bg-slate-50 p-3 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-slate-800">{item.name}</h4>
                      <p className="text-sm text-slate-500">${item.price.toFixed(2)} each</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateItem(item.id, Math.max(1, item.quantity - 1))}
                          className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center hover:bg-slate-300"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateItem(item.id, item.quantity + 1)}
                          className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center hover:bg-orange-600"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="border-t border-slate-200 pt-4">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-lg font-bold text-slate-800">Total</span>
                  <span className="text-2xl font-bold text-orange-500">${orderTotal.toFixed(2)}</span>
                </div>
                
                {/* Steve Krug: One giant, obvious next step */}
                <Button
                  onClick={() => setOrderStep('customer')}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 text-lg font-semibold"
                  rightIcon={<ArrowRight className="w-5 h-5" />}
                >
                  Place Order
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Steve Krug: Each item card follows familiar e-commerce patterns
const MenuItem: React.FC<{ item: any; onAdd: (item: any) => void }> = ({ item, onAdd }) => {
  const [justAdded, setJustAdded] = useState(false);

  const handleAdd = () => {
    onAdd(item);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  };

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
    >
      <Card className="p-0 overflow-hidden">
        {/* Image placeholder - would use item.image_url in real app */}
        <div className="h-32 bg-gradient-to-r from-orange-100 to-red-100 flex items-center justify-center relative">
          <span className="text-4xl">🍽️</span>
          {item.ai_recommended && (
            <Badge className="absolute top-2 right-2 bg-orange-500 text-white">
              <Star className="w-3 h-3 mr-1" />
              Popular
            </Badge>
          )}
        </div>
        
        <div className="p-4">
          <div className="mb-2">
            <h3 className="font-bold text-slate-800 text-lg">{item.name}</h3>
            <p className="text-sm text-slate-600 line-clamp-2">{item.description}</p>
          </div>
          
          <div className="flex items-center space-x-2 mb-3">
            {item.spice_level > 0 && (
              <div className="flex items-center space-x-1">
                {Array.from({ length: item.spice_level }, (_, i) => (
                  <Flame key={i} className="w-3 h-3 text-red-500" />
                ))}
              </div>
            )}
            <div className="flex items-center space-x-1 text-slate-500 text-xs">
              <Clock className="w-3 h-3" />
              <span>{item.preparation_time}m</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 mb-3">
            {item.dietary_options.includes('vegetarian') && (
              <Badge className="text-xs bg-green-100 text-green-800">
                <Leaf className="w-3 h-3 mr-1" />
                Veg
              </Badge>
            )}
            {item.dietary_options.includes('gluten_free') && (
              <Badge className="text-xs bg-blue-100 text-blue-800">GF</Badge>
            )}
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-orange-500">${item.price.toFixed(2)}</span>
            
            {/* Steve Krug: Big, obvious add button */}
            <motion.button
              onClick={handleAdd}
              disabled={justAdded}
              className={`px-6 py-2 rounded-full font-semibold transition-all ${
                justAdded
                  ? 'bg-green-500 text-white'
                  : 'bg-orange-500 hover:bg-orange-600 text-white'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {justAdded ? (
                <Check className="w-5 h-5" />
              ) : (
                <Plus className="w-5 h-5" />
              )}
            </motion.button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default CustomerMenu;