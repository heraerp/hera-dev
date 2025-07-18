'use client';

import React from 'react';
import { Navbar } from '@/components/ui/navbar'
import ManagerDashboard from '@/components/restaurant/ManagerDashboard';
import { RestaurantAuthProvider } from '@/components/restaurant/RestaurantAuthProvider';
import { ManagerOrAdmin } from '@/components/restaurant/PermissionGuard';

export default function ManagerPage() {
  const restaurantId = 'demo-restaurant-123';
  const managerId = 'demo-manager-456';

  return (
    <RestaurantAuthProvider>
      <ManagerOrAdmin
        fallback={
          <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-slate-800 mb-4">Manager Access Required</h2>
              <p className="text-slate-600">You need manager or admin permissions to access this dashboard.</p>
            </div>
          </div>
        }
      >
        <ManagerDashboard 
          restaurantId={restaurantId}
          managerId={managerId}
        />
      </ManagerOrAdmin>
    </RestaurantAuthProvider>
  );
}