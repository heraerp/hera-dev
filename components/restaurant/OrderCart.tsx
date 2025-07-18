'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  Trash2, 
  Plus, 
  Minus, 
  Clock, 
  ShoppingCart,
  Receipt,
  Sparkles,
  AlertCircle,
  Check,
  Loader2,
  ChefHat,
  Timer,
  CreditCard,
  DollarSign,
  Users,
  Calculator
} from 'lucide-react';

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  preparation_time: number;
  special_instructions?: string;
  dietary_options: string[];
  allergens: string[];
}

interface Order {
  id?: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  estimated_time: number;
}

interface Recommendation {
  id: string;
  name: string;
  reason: string;
  price: number;
  confidence: number;
}

interface RestaurantInfo {
  name: string;
  prep_time_avg: number;
}

interface OrderCartProps {
  order: Order;
  onUpdateItem: (itemId: string, quantity: number, instructions?: string) => void;
  onRemoveItem: (itemId: string) => void;
  onClearOrder: () => void;
  orderTotal: number;
  isSubmitting: boolean;
  onSubmitOrder: () => void;
  recommendations: Recommendation[];
  restaurantInfo: RestaurantInfo;
}

export const OrderCart: React.FC<OrderCartProps> = ({
  order,
  onUpdateItem,
  onRemoveItem,
  onClearOrder,
  orderTotal,
  isSubmitting,
  onSubmitOrder,
  recommendations,
  restaurantInfo
}) => {
  const [itemInstructions, setItemInstructions] = useState<{ [itemId: string]: string }>({});
  const [showRecommendations, setShowRecommendations] = useState(true);

  const handleInstructionsChange = (itemId: string, instructions: string) => {
    setItemInstructions(prev => ({ ...prev, [itemId]: instructions }));
    onUpdateItem(itemId, order.items.find(item => item.id === itemId)?.quantity || 1, instructions);
  };

  const calculateTotals = () => {
    const subtotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.08; // 8% tax rate
    const total = subtotal + tax;
    const estimatedTime = Math.max(...order.items.map(item => item.preparation_time), restaurantInfo.prep_time_avg);
    
    return { subtotal, tax, total, estimatedTime };
  };

  const { subtotal, tax, total, estimatedTime } = calculateTotals();

  const OrderItemComponent: React.FC<{ item: OrderItem }> = ({ item }) => (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="font-medium text-gray-900">{item.name}</h3>
              <Badge variant="outline" className="text-xs">
                <Clock className="w-3 h-3 mr-1" />
                {item.preparation_time} min
              </Badge>
            </div>
            
            {/* Dietary & Allergen Info */}
            <div className="flex flex-wrap gap-1 mb-2">
              {item.dietary_options.map((option, index) => (
                <Badge key={index} variant="outline" className="text-xs bg-green-50 text-green-700">
                  {option}
                </Badge>
              ))}
              {item.allergens.length > 0 && (
                <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  {item.allergens.join(', ')}
                </Badge>
              )}
            </div>

            {/* Special Instructions */}
            <Textarea
              placeholder="Special instructions (optional)"
              value={itemInstructions[item.id] || item.special_instructions || ''}
              onChange={(e) => handleInstructionsChange(item.id, e.target.value)}
              className="mt-2 text-sm"
              rows={2}
            />
          </div>
          
          <div className="ml-4 text-right">
            <div className="font-semibold text-gray-900 mb-2">
              ${(item.price * item.quantity).toFixed(2)}
            </div>
            <div className="text-sm text-gray-600 mb-2">
              ${item.price.toFixed(2)} each
            </div>
            
            {/* Quantity Controls */}
            <div className="flex items-center space-x-2 mb-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onUpdateItem(item.id, Math.max(1, item.quantity - 1))}
                className="h-8 w-8 p-0"
              >
                <Minus className="w-4 h-4" />
              </Button>
              <span className="px-2 font-medium w-8 text-center">{item.quantity}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onUpdateItem(item.id, item.quantity + 1)}
                className="h-8 w-8 p-0"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            
            {/* Remove Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRemoveItem(item.id)}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (order.items.length === 0) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Your cart is empty</h3>
              <p className="text-gray-600">Add some delicious items from the menu to get started!</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Order Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Receipt className="w-5 h-5" />
            <span>Your Order</span>
            <Badge variant="outline">{order.items.length} items</Badge>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Order Items */}
      <div className="space-y-4">
        {order.items.map((item) => (
          <OrderItemComponent key={item.id} item={item} />
        ))}
      </div>

      {/* AI Recommendations */}
      {recommendations.length > 0 && showRecommendations && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-blue-600" />
                <span className="text-blue-900">AI Recommendations</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowRecommendations(false)}
                className="text-blue-600"
              >
                Dismiss
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recommendations.slice(0, 3).map((rec) => (
                <div key={rec.id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{rec.name}</div>
                    <div className="text-sm text-gray-600">{rec.reason}</div>
                    <div className="text-sm text-blue-600">
                      {Math.round(rec.confidence * 100)}% confidence
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">${rec.price.toFixed(2)}</div>
                    <Button size="sm" variant="outline" className="mt-1">
                      <Plus className="w-4 h-4 mr-1" />
                      Add
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Order Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calculator className="w-5 h-5" />
            <span>Order Summary</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Timing Information */}
          <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <Timer className="w-5 h-5 text-orange-600" />
              <span className="font-medium text-orange-900">Estimated Preparation Time</span>
            </div>
            <span className="font-bold text-orange-900">{estimatedTime} minutes</span>
          </div>

          {/* Cost Breakdown */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Tax (8%)</span>
              <span className="font-medium">${tax.toFixed(2)}</span>
            </div>
            <div className="border-t pt-2">
              <div className="flex justify-between text-lg">
                <span className="font-semibold">Total</span>
                <span className="font-bold">${total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-4">
            <Button
              onClick={onSubmitOrder}
              disabled={isSubmitting || order.items.length === 0}
              className="w-full h-12 text-lg"
              size="lg"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Submitting Order...
                </>
              ) : (
                <>
                  <Check className="w-5 h-5 mr-2" />
                  Submit Order - ${total.toFixed(2)}
                </>
              )}
            </Button>
            
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={onClearOrder}
                className="flex-1"
                disabled={isSubmitting}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear Order
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                disabled={isSubmitting}
              >
                <Users className="w-4 h-4 mr-2" />
                Save for Later
              </Button>
            </div>
          </div>

          {/* Payment Info */}
          <div className="pt-4 border-t">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <CreditCard className="w-4 h-4" />
              <span>Payment will be processed at the table</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Restaurant Info */}
      <Card className="bg-gray-50">
        <CardContent className="pt-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <ChefHat className="w-4 h-4" />
            <span>Order will be prepared at {restaurantInfo.name}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600 mt-1">
            <Clock className="w-4 h-4" />
            <span>Average preparation time: {restaurantInfo.prep_time_avg} minutes</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};