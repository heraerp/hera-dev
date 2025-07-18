'use client';

import { useState, useCallback } from 'react';
import UniversalCrudService from '@/lib/services/universalCrudService';
import { createClient } from '@/lib/supabase/client';

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
  status: 'draft' | 'submitted' | 'confirmed' | 'preparing' | 'ready' | 'served';
}

interface CustomerInfo {
  name: string;
  dietary_preferences: string[];
  allergies: string[];
  table_number: number;
  special_requests: string;
  phone?: string;
  email?: string;
}

interface SubmitOrderData {
  customer_info: CustomerInfo;
  table_number: number;
  waiter_id: string;
  order_type: string;
  special_instructions: string;
}

export const useRestaurantOrder = (restaurantId: string) => {
  const [currentOrder, setCurrentOrder] = useState<Order>({
    items: [],
    subtotal: 0,
    tax: 0,
    total: 0,
    estimated_time: 0,
    status: 'draft'
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderStatus, setOrderStatus] = useState<string | null>(null);

  const supabase = createClient();

  const calculateTotals = useCallback((items: OrderItem[]) => {
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.08; // 8% tax rate
    const total = subtotal + tax;
    const estimated_time = Math.max(...items.map(item => item.preparation_time), 15);
    
    return { subtotal, tax, total, estimated_time };
  }, []);

  const addItem = useCallback((item: any, quantity: number = 1) => {
    setCurrentOrder(prev => {
      const existingItemIndex = prev.items.findIndex(orderItem => orderItem.id === item.id);
      let updatedItems;
      
      if (existingItemIndex >= 0) {
        // Update existing item quantity
        updatedItems = prev.items.map((orderItem, index) =>
          index === existingItemIndex
            ? { ...orderItem, quantity: orderItem.quantity + quantity }
            : orderItem
        );
      } else {
        // Add new item
        const newItem: OrderItem = {
          id: item.id,
          name: item.name,
          price: item.price,
          quantity,
          preparation_time: item.preparation_time || 15,
          dietary_options: item.dietary_options || [],
          allergens: item.allergens || []
        };
        updatedItems = [...prev.items, newItem];
      }
      
      const totals = calculateTotals(updatedItems);
      
      return {
        ...prev,
        items: updatedItems,
        ...totals
      };
    });
  }, [calculateTotals]);

  const updateItem = useCallback((itemId: string, quantity: number, instructions?: string) => {
    setCurrentOrder(prev => {
      const updatedItems = prev.items.map(item =>
        item.id === itemId
          ? { ...item, quantity, special_instructions: instructions }
          : item
      );
      
      const totals = calculateTotals(updatedItems);
      
      return {
        ...prev,
        items: updatedItems,
        ...totals
      };
    });
  }, [calculateTotals]);

  const removeItem = useCallback((itemId: string) => {
    setCurrentOrder(prev => {
      const updatedItems = prev.items.filter(item => item.id !== itemId);
      const totals = calculateTotals(updatedItems);
      
      return {
        ...prev,
        items: updatedItems,
        ...totals
      };
    });
  }, [calculateTotals]);

  const clearOrder = useCallback(() => {
    setCurrentOrder({
      items: [],
      subtotal: 0,
      tax: 0,
      total: 0,
      estimated_time: 0,
      status: 'draft'
    });
    setOrderStatus(null);
  }, []);

  const submitOrder = useCallback(async (orderData: SubmitOrderData) => {
    if (currentOrder.items.length === 0) {
      throw new Error('Cannot submit empty order');
    }

    setIsSubmitting(true);
    try {
      // Generate order number
      const orderNumber = `ORD-${Date.now()}`;
      
      // Create order entity in universal schema
      const { data: orderEntity, error: orderError } = await supabase
        .from('core_entities')
        .insert({
          organization_id: restaurantId,
          entity_type: 'customer_order',
          name: orderNumber,
          status: 'pending',
          metadata: {
            table_number: orderData.table_number,
            waiter_id: orderData.waiter_id,
            order_type: orderData.order_type
          }
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create dynamic data for order details
      const orderDynamicData = [
        {
          entity_id: orderEntity.id,
          field_name: 'customer_name',
          field_value: orderData.customer_info.name,
          field_type: 'text'
        },
        {
          entity_id: orderEntity.id,
          field_name: 'table_number',
          field_value: orderData.table_number.toString(),
          field_type: 'number'
        },
        {
          entity_id: orderEntity.id,
          field_name: 'order_items',
          field_value: JSON.stringify(currentOrder.items),
          field_type: 'json'
        },
        {
          entity_id: orderEntity.id,
          field_name: 'special_instructions',
          field_value: orderData.special_instructions,
          field_type: 'text'
        },
        {
          entity_id: orderEntity.id,
          field_name: 'order_total',
          field_value: currentOrder.total.toString(),
          field_type: 'currency'
        },
        {
          entity_id: orderEntity.id,
          field_name: 'order_type',
          field_value: orderData.order_type,
          field_type: 'text'
        },
        {
          entity_id: orderEntity.id,
          field_name: 'waiter_id',
          field_value: orderData.waiter_id,
          field_type: 'reference'
        },
        {
          entity_id: orderEntity.id,
          field_name: 'order_time',
          field_value: new Date().toISOString(),
          field_type: 'timestamp'
        },
        {
          entity_id: orderEntity.id,
          field_name: 'dietary_preferences',
          field_value: JSON.stringify(orderData.customer_info.dietary_preferences),
          field_type: 'array'
        },
        {
          entity_id: orderEntity.id,
          field_name: 'allergies',
          field_value: JSON.stringify(orderData.customer_info.allergies),
          field_type: 'array'
        }
      ];

      const { error: dynamicDataError } = await supabase
        .from('core_dynamic_data')
        .insert(orderDynamicData);

      if (dynamicDataError) throw dynamicDataError;

      // Create universal transaction
      const { data: transaction, error: transactionError } = await supabase
        .from('universal_transactions')
        .insert({
          organization_id: restaurantId,
          transaction_type: 'RESTAURANT_ORDER',
          transaction_subtype: 'DINE_IN_ORDER',
          transaction_number: orderNumber,
          business_date: new Date().toISOString().split('T')[0],
          transaction_data: {
            order_entity_id: orderEntity.id,
            customer_info: orderData.customer_info,
            order_summary: {
              items: currentOrder.items,
              subtotal: currentOrder.subtotal,
              tax: currentOrder.tax,
              total: currentOrder.total,
              estimated_time: currentOrder.estimated_time
            }
          },
          workflow_status: 'PENDING',
          ai_generated: false,
          fraud_risk_score: 0,
          data_quality_score: 100
        })
        .select()
        .single();

      if (transactionError) throw transactionError;

      // Create transaction lines for each order item
      const transactionLines = currentOrder.items.map((item, index) => ({
        transaction_id: transaction.id,
        line_number: index + 1,
        line_type: 'MENU_ITEM',
        line_data: {
          item_id: item.id,
          item_name: item.name,
          quantity: item.quantity,
          unit_price: item.price,
          special_instructions: item.special_instructions,
          dietary_options: item.dietary_options,
          allergens: item.allergens
        },
        debit_amount: item.price * item.quantity,
        reference_id: item.id
      }));

      const { error: linesError } = await supabase
        .from('universal_transaction_lines')
        .insert(transactionLines);

      if (linesError) throw linesError;

      // Update order status
      setCurrentOrder(prev => ({
        ...prev,
        id: orderEntity.id,
        status: 'submitted'
      }));
      
      setOrderStatus('submitted');
      
      return {
        order_id: orderEntity.id,
        transaction_id: transaction.id,
        order_number: orderNumber
      };

    } catch (error) {
      console.error('Error submitting order:', error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, [currentOrder, restaurantId, supabase]);

  const orderTotal = currentOrder.total;

  return {
    currentOrder,
    addItem,
    updateItem,
    removeItem,
    clearOrder,
    orderTotal,
    submitOrder,
    isSubmitting,
    orderStatus
  };
};