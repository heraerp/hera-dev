'use client';

import React, { useEffect, useState } from 'react';
import CustomerMenu from '@/components/restaurant/CustomerMenu';

export default function CustomerOrderPage() {
  // In a real app, this would come from QR code scan or URL params
  const restaurantId = 'demo-restaurant-123';
  const [tableNumber, setTableNumber] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const table = parseInt(params.get('table') || '0') || undefined;
      setTableNumber(table);
    }
  }, []);

  return (
    <CustomerMenu 
      restaurantId={restaurantId}
      tableNumber={tableNumber}
      onOrderComplete={(orderData) => {
        console.log('Order completed:', orderData);
        // In real app, redirect to confirmation page
      }}
    />
  );
}