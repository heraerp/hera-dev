'use client'

import React, { use } from 'react'
import DocumentDetails from '@/components/digital-accountant/DocumentDetails'
import { AppNavbar } from '@/components/ui/AppNavbar'
import DynamicSidebar from '@/components/ui/DynamicSidebar'

export default function DocumentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  
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
        
        <DocumentDetails documentId={id} />
      </div>
    </div>
  )
}