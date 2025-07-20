'use client'

import { ReactNode } from 'react'
import DigitalAccountantNavigation from './DigitalAccountantNavigation'

interface DigitalAccountantLayoutProps {
  children: ReactNode
  title?: string
  showSidebar?: boolean
  showBackButton?: boolean
  backUrl?: string
}

export default function DigitalAccountantLayout({
  children,
  title,
  showSidebar = true,
  showBackButton = true,
  backUrl = '/dashboard'
}: DigitalAccountantLayoutProps) {
  if (!showSidebar) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="sticky top-0 z-50">
          <DigitalAccountantNavigation 
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="flex">
        {/* Sidebar Navigation */}
        <div className="hidden lg:block w-80 p-6">
          <div className="sticky top-6">
            <DigitalAccountantNavigation 
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
            <DigitalAccountantNavigation 
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