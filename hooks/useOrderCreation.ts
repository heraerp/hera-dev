// Custom hook for order creation using HERA Universal Schema
import { useState } from 'react';
import { createOrder } from '@/lib/database/hera-order-creation';

export function useOrderCreation() {
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createNewOrder = async (orderData: {
    customerId: string;
    items: Array<{
      productId: string;
      quantity: number;
      unitPrice: number;
    }>;
    specialInstructions?: string;
    tableNumber?: string;
    orderType?: string;
  }) => {
    setIsCreating(true);
    setError(null);

    try {
      // Validate order data
      if (!orderData.customerId || !orderData.items || orderData.items.length === 0) {
        throw new Error('Invalid order data: missing customer or items');
      }

      // Calculate total amount
      const totalAmount = orderData.items.reduce((sum, item) => 
        sum + (item.quantity * item.unitPrice), 0
      );

      // Create the order
      const result = await createOrder({
        ...orderData,
        totalAmount
      });

      if (!result.success) {
        throw new Error(result.error);
      }

      return result;

    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsCreating(false);
    }
  };

  return {
    createNewOrder,
    isCreating,
    error,
    clearError: () => setError(null)
  };
}