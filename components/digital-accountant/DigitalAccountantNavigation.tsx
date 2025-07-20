'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft, 
  Brain, 
  BarChart3, 
  FileText, 
  GitBranch, 
  CheckSquare, 
  BookOpen, 
  TrendingUp,
  Activity,
  Zap,
  Users,
  Settings,
  Home
} from 'lucide-react'

interface NavigationProps {
  title?: string
  compact?: boolean
  showBackButton?: boolean
  backUrl?: string
}

export default function DigitalAccountantNavigation({
  title,
  compact = false,
  showBackButton = true,
  backUrl = '/dashboard'
}: NavigationProps) {
  const pathname = usePathname()

  const navigationItems = [
    {
      href: '/digital-accountant',
      label: 'Dashboard',
      icon: Home,
      description: 'AI system overview and metrics',
      badge: null
    },
    {
      href: '/digital-accountant/documents',
      label: 'Documents',
      icon: FileText,
      description: 'Upload and AI processing',
      badge: 'AI Powered'
    },
    {
      href: '/digital-accountant/relationships',
      label: 'Relationships',
      icon: GitBranch,
      description: 'Transaction linking',
      badge: 'Auto-Detect'
    },
    {
      href: '/digital-accountant/three-way-match',
      label: 'Three-Way Match',
      icon: CheckSquare,
      description: 'PO → GR → Invoice validation',
      badge: 'Validation'
    },
    {
      href: '/digital-accountant/journal-entries',
      label: 'Journal Entries',
      icon: BookOpen,
      description: 'AI-assisted creation',
      badge: 'Smart Entry'
    },
    {
      href: '/digital-accountant/analytics',
      label: 'AI Analytics',
      icon: TrendingUp,
      description: 'Performance monitoring',
      badge: 'Insights'
    }
  ]

  const isActive = (href: string) => {
    if (href === '/digital-accountant') {
      return pathname === href
    }
    return pathname?.startsWith(href)
  }

  if (compact) {
    return (
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {showBackButton && (
                <Button variant="ghost" size="sm" asChild>
                  <Link href={backUrl}>
                    <ArrowLeft className="h-4 w-4" />
                  </Link>
                </Button>
              )}
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg">
                  <Brain className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-gray-900">
                    {title || 'Digital Accountant'}
                  </h1>
                  <p className="text-sm text-gray-600">AI-Powered Accounting</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                <Activity className="w-3 h-3 mr-1" />
                Active
              </Badge>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <Card className="border-gray-200 shadow-lg">
      <CardContent className="p-6">
        {/* Header */}
        <div className="mb-8">
          {showBackButton && (
            <Button variant="ghost" size="sm" className="mb-4" asChild>
              <Link href={backUrl}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
          )}
          
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl">
              <Brain className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Digital Accountant</h1>
              <p className="text-sm text-gray-600">AI-Powered Automation</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
              <Activity className="w-3 h-3 mr-1" />
              System Active
            </Badge>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
              <Zap className="w-3 h-3 mr-1" />
              AI Ready
            </Badge>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  block p-3 rounded-lg transition-all duration-200
                  ${active 
                    ? 'bg-blue-50 border-l-4 border-l-blue-500 text-blue-700' 
                    : 'hover:bg-gray-50 text-gray-700'
                  }
                `}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Icon className={`h-5 w-5 ${active ? 'text-blue-600' : 'text-gray-500'}`} />
                    <div>
                      <div className="font-medium">{item.label}</div>
                      <div className="text-xs text-gray-500">{item.description}</div>
                    </div>
                  </div>
                  {item.badge && (
                    <Badge 
                      variant="secondary" 
                      className={`text-xs ${
                        active ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {item.badge}
                    </Badge>
                  )}
                </div>
              </Link>
            )
          })}
        </nav>

        {/* Quick Stats */}
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Today's Activity</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Documents Processed</span>
              <span className="font-medium text-green-600">47</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">AI Confidence Avg</span>
              <span className="font-medium text-blue-600">94%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Auto-Posted</span>
              <span className="font-medium text-purple-600">38</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Quick Actions</h3>
          <div className="space-y-2">
            <Button variant="outline" size="sm" className="w-full justify-start" asChild>
              <Link href="/digital-accountant/documents">
                <FileText className="h-4 w-4 mr-2" />
                Upload Document
              </Link>
            </Button>
            <Button variant="outline" size="sm" className="w-full justify-start" asChild>
              <Link href="/digital-accountant/journal-entries">
                <BookOpen className="h-4 w-4 mr-2" />
                Create Journal Entry
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}