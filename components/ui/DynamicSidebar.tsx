/**
 * HERA Universal - Dynamic Sidebar
 * 
 * Collapsible sidebar with icons that expands on hover
 * Follows "don't make me think" principles
 */

'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Home,
  FileText, 
  GitBranch, 
  CheckSquare, 
  BookOpen,
  BarChart3,
  Receipt,
  TrendingUp,
  Settings,
  Brain,
  Zap,
  Clock,
  DollarSign
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface SidebarItem {
  href: string
  icon: React.ComponentType<{ className?: string }>
  label: string
  description: string
}

const sidebarItems: SidebarItem[] = [
  {
    href: '/digital-accountant',
    icon: Home,
    label: 'Dashboard',
    description: 'Main dashboard overview'
  },
  {
    href: '/digital-accountant/documents',
    icon: FileText,
    label: 'Documents',
    description: 'Upload and process documents'
  },
  {
    href: '/digital-accountant/relationships',
    icon: GitBranch,
    label: 'Relationships',
    description: 'Link transactions automatically'
  },
  {
    href: '/digital-accountant/three-way-match',
    icon: CheckSquare,
    label: 'Three-Way Match',
    description: 'Validate PO, GR, and Invoice'
  },
  {
    href: '/digital-accountant/journal-entries',
    icon: BookOpen,
    label: 'Journal Entries',
    description: 'AI-generated accounting entries'
  },
  {
    href: '/digital-accountant/cash-market',
    icon: DollarSign,
    label: 'Cash Market',
    description: 'Handle cash purchases'
  },
  {
    href: '/digital-accountant/analytics',
    icon: BarChart3,
    label: 'Analytics',
    description: 'Performance insights'
  }
]

export default function DynamicSidebar() {
  const [isHovered, setIsHovered] = useState(false)
  const pathname = usePathname()

  return (
    <div
      className={cn(
        "fixed left-0 top-0 h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ease-in-out z-40",
        isHovered ? "w-64" : "w-16"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Logo/Brand Area */}
      <div className="h-16 flex items-center justify-center border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          {isHovered && (
            <div className="animate-fade-in">
              <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100">
                Digital Accountant
              </h2>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="mt-4 space-y-1 px-2">
        {sidebarItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200",
                isActive
                  ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-gray-100"
              )}
            >
              <Icon className={cn(
                "flex-shrink-0 w-5 h-5 transition-colors duration-200",
                isActive
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300"
              )} />
              
              {isHovered && (
                <div className="ml-3 animate-fade-in">
                  <div className="font-medium">
                    {item.label}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {item.description}
                  </div>
                </div>
              )}
              
              {/* Active indicator */}
              {isActive && (
                <div className="absolute left-0 w-1 h-8 bg-blue-600 dark:bg-blue-400 rounded-r-full" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Bottom Section - System Status */}
      <div className="absolute bottom-4 left-0 right-0 px-2">
        <div className={cn(
          "flex items-center px-3 py-2 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800",
          !isHovered && "justify-center"
        )}>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            {isHovered && (
              <div className="ml-2 animate-fade-in">
                <div className="text-xs font-medium text-green-700 dark:text-green-300">
                  AI System Active
                </div>
                <div className="text-xs text-green-600 dark:text-green-400">
                  94% confidence
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/* Add this CSS to your global styles or create a separate CSS file */