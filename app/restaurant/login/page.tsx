'use client';

import React from 'react';
import StaffLogin from '@/components/restaurant/StaffLogin';
import { RestaurantAuthProvider } from '@/components/restaurant/RestaurantAuthProvider';

export default function RestaurantLoginPage() {
  return (
    <RestaurantAuthProvider>
      <StaffLogin 
        onLoginSuccess={() => {
          // Redirect to restaurant dashboard after successful login
          window.location.href = '/restaurant/dashboard';
        }}
      />
    </RestaurantAuthProvider>
  );
}