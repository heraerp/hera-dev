'use client'

import { ReactNode } from 'react'
import RestaurantNavigation from './RestaurantNavigation'

interface RestaurantLayoutProps {
  children: ReactNode
  title?: string
  showSidebar?: boolean
  showBackButton?: boolean
  backUrl?: string
}

export default function RestaurantLayout({
  children,
  title,
  showSidebar = true,
  showBackButton = true,
  backUrl = '/restaurant'
}: RestaurantLayoutProps) {
  if (!showSidebar) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
        <div className="sticky top-0 z-50">
          <RestaurantNavigation 
            compact={true} 
            title={title}
            showBackButton={showBackButton}
            backUrl={backUrl}
          />
        </div>
        {children}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <div className="flex">
        {/* Sidebar Navigation */}
        <div className="hidden lg:block w-80 p-6">
          <div className="sticky top-6">
            <RestaurantNavigation 
              title={title}
              showBackButton={showBackButton}
              backUrl={backUrl}
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Mobile Navigation */}
          <div className="lg:hidden sticky top-0 z-50">
            <RestaurantNavigation 
              compact={true} 
              title={title}
              showBackButton={showBackButton}
              backUrl={backUrl}
            />
          </div>
          
          {/* Content */}
          <div className="lg:pr-6 lg:py-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}