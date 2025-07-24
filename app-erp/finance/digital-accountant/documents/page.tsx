'use client'

import React from 'react'
import dynamic from 'next/dynamic'
import { AppNavbar } from '@/components/ui/AppNavbar'
import DynamicSidebar from '@/components/ui/DynamicSidebar'

const DocumentProcessingCenter = dynamic(
  () => import('@/components/digital-accountant/DocumentProcessingCenter'),
  { ssr: false }
)

export default function DocumentsPage() {
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
        
        <DocumentProcessingCenter />
      </div>
    </div>
  )
}

