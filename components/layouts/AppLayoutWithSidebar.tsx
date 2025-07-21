/**
 * App Layout with Modern Sidebar - PO Gold Standard Theme
 * Responsive layout wrapper with navigation
 */

"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { ModernSidebar, SidebarVariant } from '@/components/navigation/ModernSidebar';

interface AppLayoutWithSidebarProps {
  children: React.ReactNode;
  user?: {
    name: string;
    email: string;
    avatar?: string;
    role: string;
  };
  className?: string;
  variant?: SidebarVariant;
}

export function AppLayoutWithSidebar({ 
  children, 
  user = {
    name: "Mario Rossi",
    email: "mario@mariosrestaurant.com", 
    role: "Restaurant Manager"
  },
  className = "",
  variant = "default"
}: AppLayoutWithSidebarProps) {
  const router = useRouter();

  const handleNavigate = (href: string) => {
    router.push(href);
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
      {/* Modern Sidebar */}
      <ModernSidebar 
        user={user}
        onNavigate={handleNavigate}
        variant={variant}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Content */}
        <main className={`flex-1 overflow-auto ${className}`}>
          {children}
        </main>
      </div>
    </div>
  );
}

export default AppLayoutWithSidebar;