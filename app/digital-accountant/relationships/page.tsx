'use client'

import React from 'react'
import RelationshipDashboard from '@/components/digital-accountant/RelationshipDashboard'
import { AppNavbar } from '@/components/ui/AppNavbar'
import DynamicSidebar from '@/components/ui/DynamicSidebar'

export default function RelationshipsPage() {
  const handleLogout = () => {
    window.location.href = '/auth/login'
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <DynamicSidebar />
      
      <div className="ml-16 transition-all duration-300">
        <AppNavbar 
          user={{
            name: "Mario Rossi",
            email: "mario@mariosrestaurant.com",
            role: "Restaurant Manager"
          }}
          onLogout={handleLogout}
        />
        
        <RelationshipDashboard />
      </div>
    </div>
  )
}