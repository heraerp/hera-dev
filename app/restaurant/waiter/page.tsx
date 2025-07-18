'use client';

import React from 'react';
import WaiterDashboard from '@/components/restaurant/WaiterDashboard';
import { RestaurantAuthProvider } from '@/components/restaurant/RestaurantAuthProvider';
import { PermissionGuard } from '@/components/restaurant/PermissionGuard';

export default function WaiterPage() {
  const restaurantId = 'demo-restaurant-123';
  const waiterId = 'demo-waiter-456';

  return (
    <RestaurantAuthProvider>
      <PermissionGuard 
        permissions={['orders.create', 'orders.view']}
        fallback={
          <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-slate-800 mb-4">Access Required</h2>
              <p className="text-slate-600">You need waiter permissions to access this page.</p>
            </div>
          </div>
        }
      >
        <WaiterDashboard 
          restaurantId={restaurantId}
          waiterId={waiterId}
        />
      </PermissionGuard>
    </RestaurantAuthProvider>
  );
}