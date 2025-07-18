'use client';

import { RestaurantOrderSystem } from '@/components/restaurant/RestaurantOrderSystem';

export default function RestaurantOrderPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <RestaurantOrderSystem />
    </div>
  );
}