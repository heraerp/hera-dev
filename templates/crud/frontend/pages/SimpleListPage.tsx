'use client'

/**
 * HERA Universal Frontend Template - Simple List Page
 * The most common page template for data management
 * Follows "Don't Make Me Think" principles with intuitive layout
 */

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Download, Filter, MoreHorizontal, TrendingUp } from 'lucide-react'
import { DashboardLayout } from '../layouts/DashboardLayout'
import { HERAUniversalCRUD } from '@/templates/crud/components'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/revolutionary-card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { 
  CRUDServiceInterface, 
  CRUDField, 
  CRUDAction, 
  CRUDFilter 
} from '@/templates/crud/types/crud-types'

interface QuickStat {
  label: string
  value: string | number
  change?: string
  trend?: 'up' | 'down' | 'neutral'
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple'
}

interface QuickAction {
  label: string
  icon: React.ComponentType<any>
  onClick: () => void
  variant?: 'default' | 'outline' | 'ghost'
  primary?: boolean
}

interface TabView {
  id: string
  label: string
  filters?: Record<string, any>
  badge?: string | number
}

interface SimpleListPageProps {
  // Page metadata
  title: string
  subtitle?: string
  description?: string
  
  // CRUD configuration
  entityType: string
  entityTypeLabel: string
  entitySingular: string
  entitySingularLabel: string
  service: CRUDServiceInterface
  fields: CRUDField[]
  
  // Optional features
  actions?: CRUDAction[]
  filters?: CRUDFilter[]
  quickStats?: QuickStat[]
  quickActions?: QuickAction[]
  tabViews?: TabView[]
  
  // Search and filters
  enableSearch?: boolean
  enableFilters?: boolean
  enableBulkActions?: boolean
  enableExport?: boolean
  enableRealTime?: boolean
  searchPlaceholder?: string
  
  // Customization
  headerActions?: React.ReactNode
  showQuickActions?: boolean
  showStats?: boolean
  showTabs?: boolean
  defaultTab?: string
  
  // Layout
  maxWidth?: 'full' | '7xl' | '6xl' | '5xl'
  className?: string
  
  // Callbacks
  onItemClick?: (item: any) => void
  onItemDoubleClick?: (item: any) => void
  onSuccess?: (message: string, operation: string) => void
  onError?: (error: string) => void
}

// Default quick actions
const createDefaultQuickActions = (entitySingularLabel: string): QuickAction[] => [
  {
    label: `Add ${entitySingularLabel}`,
    icon: Plus,
    onClick: () => console.log('Add item'),
    primary: true
  },
  {
    label: 'Export',
    icon: Download,
    onClick: () => console.log('Export'),
    variant: 'outline'
  },
  {
    label: 'More',
    icon: MoreHorizontal,
    onClick: () => console.log('More actions'),
    variant: 'ghost'
  }
]

// Stat color configurations
const statColors = {
  blue: { bg: 'bg-blue-50', text: 'text-blue-700', icon: 'text-blue-600' },
  green: { bg: 'bg-green-50', text: 'text-green-700', icon: 'text-green-600' },
  red: { bg: 'bg-red-50', text: 'text-red-700', icon: 'text-red-600' },
  yellow: { bg: 'bg-yellow-50', text: 'text-yellow-700', icon: 'text-yellow-600' },
  purple: { bg: 'bg-purple-50', text: 'text-purple-700', icon: 'text-purple-600' }
}

export const SimpleListPage: React.FC<SimpleListPageProps> = ({
  title,
  subtitle,
  description,
  entityType,
  entityTypeLabel,
  entitySingular,
  entitySingularLabel,
  service,
  fields,
  actions = [],
  filters = [],
  quickStats = [],
  quickActions,
  tabViews = [],
  enableSearch = true,
  enableFilters = true,
  enableBulkActions = true,
  enableExport = true,
  enableRealTime = false,
  searchPlaceholder,
  headerActions,
  showQuickActions = true,
  showStats = true,
  showTabs = false,
  defaultTab,
  maxWidth = '7xl',
  className = '',
  onItemClick,
  onItemDoubleClick,
  onSuccess,
  onError
}) => {
  const [activeTab, setActiveTab] = useState(defaultTab || tabViews[0]?.id || 'all')
  const [currentFilters, setCurrentFilters] = useState<Record<string, any>>({})

  // Use provided quick actions or create defaults
  const finalQuickActions = quickActions || createDefaultQuickActions(entitySingularLabel)

  // Get current tab configuration
  const currentTab = tabViews.find(tab => tab.id === activeTab)
  const tabFilters = currentTab?.filters || {}

  // Combine tab filters with current filters
  const effectiveFilters = { ...currentFilters, ...tabFilters }

  // Handle tab change
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId)
    setCurrentFilters({}) // Reset filters when changing tabs
  }

  // Render quick stats
  const renderQuickStats = () => {
    if (!showStats || quickStats.length === 0) return null

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {quickStats.map((stat, index) => {
          const colors = statColors[stat.color || 'blue']
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`p-4 ${colors.bg} border-0`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium ${colors.text}`}>
                      {stat.label}
                    </p>
                    <p className={`text-2xl font-bold ${colors.text} mt-1`}>
                      {stat.value}
                    </p>
                    {stat.change && (
                      <div className="flex items-center mt-2">
                        <TrendingUp className={`w-4 h-4 mr-1 ${
                          stat.trend === 'up' ? 'text-green-500' : 
                          stat.trend === 'down' ? 'text-red-500' : 
                          'text-gray-500'
                        }`} />
                        <span className={`text-sm ${
                          stat.trend === 'up' ? 'text-green-600' : 
                          stat.trend === 'down' ? 'text-red-600' : 
                          'text-gray-600'
                        }`}>
                          {stat.change}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className={`w-12 h-12 ${colors.bg} rounded-full flex items-center justify-center`}>
                    <TrendingUp className={`w-6 h-6 ${colors.icon}`} />
                  </div>
                </div>
              </Card>
            </motion.div>
          )
        })}
      </div>
    )
  }

  // Render quick actions
  const renderQuickActions = () => {
    if (!showQuickActions || finalQuickActions.length === 0) return null

    return (
      <div className="flex flex-wrap items-center gap-3">
        {finalQuickActions.map((action, index) => (
          <Button
            key={action.label}
            variant={action.variant || (action.primary ? 'default' : 'outline')}
            onClick={action.onClick}
            className={`gap-2 ${action.primary ? 'shadow-lg' : ''}`}
          >
            <action.icon className="w-4 h-4" />
            {action.label}
          </Button>
        ))}
      </div>
    )
  }

  // Render tab navigation
  const renderTabs = () => {
    if (!showTabs || tabViews.length === 0) return null

    return (
      <Tabs value={activeTab} onValueChange={handleTabChange} className="mb-6">
        <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${tabViews.length}, 1fr)` }}>
          {tabViews.map(tab => (
            <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-2">
              {tab.label}
              {tab.badge && (
                <Badge className="ml-1 bg-blue-600 text-white text-xs px-1.5 py-0.5">
                  {tab.badge}
                </Badge>
              )}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    )
  }

  const maxWidthClasses = {
    'full': 'max-w-full',
    '7xl': 'max-w-7xl',
    '6xl': 'max-w-6xl',
    '5xl': 'max-w-5xl'
  }

  return (
    <DashboardLayout
      title={title}
      subtitle={subtitle || description}
      actions={headerActions}
      className={className}
    >
      <div className={`${maxWidthClasses[maxWidth]} mx-auto p-6 space-y-6`}>
        {/* Page Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            {(subtitle || description) && (
              <p className="text-gray-600 mt-1">{subtitle || description}</p>
            )}
          </div>
          
          {renderQuickActions()}
        </div>

        {/* Quick Stats */}
        {renderQuickStats()}

        {/* Tab Navigation */}
        {renderTabs()}

        {/* Main CRUD Interface */}
        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
          <HERAUniversalCRUD
            entityType={entityType}
            entityTypeLabel={entityTypeLabel}
            entitySingular={entitySingular}
            entitySingularLabel={entitySingularLabel}
            service={service}
            fields={fields}
            actions={actions}
            filters={filters}
            enableSearch={enableSearch}
            enableFilters={enableFilters}
            enableBulkActions={enableBulkActions}
            enableExport={enableExport}
            enableRealTime={enableRealTime}
            defaultFilters={effectiveFilters}
            onItemClick={onItemClick}
            onItemDoubleClick={onItemDoubleClick}
            onSuccess={onSuccess}
            onError={onError}
            className="border-0 shadow-none"
          />
        </Card>
      </div>
    </DashboardLayout>
  )
}

// Preset page variations for common use cases
export const ProductListPage: React.FC<Omit<SimpleListPageProps, 'entityType' | 'entityTypeLabel' | 'entitySingular' | 'entitySingularLabel'>> = (props) => (
  <SimpleListPage
    entityType="product"
    entityTypeLabel="Products"
    entitySingular="product"
    entitySingularLabel="Product"
    quickStats={[
      { label: 'Total Products', value: 247, change: '+12', trend: 'up', color: 'blue' },
      { label: 'Active Items', value: 198, change: '+5', trend: 'up', color: 'green' },
      { label: 'Low Stock', value: 8, change: '-3', trend: 'down', color: 'yellow' },
      { label: 'Out of Stock', value: 3, change: '+1', trend: 'up', color: 'red' }
    ]}
    tabViews={[
      { id: 'all', label: 'All Products' },
      { id: 'active', label: 'Active', filters: { is_active: true } },
      { id: 'inactive', label: 'Inactive', filters: { is_active: false } },
      { id: 'low_stock', label: 'Low Stock', badge: 8 }
    ]}
    {...props}
  />
)

export const CustomerListPage: React.FC<Omit<SimpleListPageProps, 'entityType' | 'entityTypeLabel' | 'entitySingular' | 'entitySingularLabel'>> = (props) => (
  <SimpleListPage
    entityType="customer"
    entityTypeLabel="Customers"
    entitySingular="customer"
    entitySingularLabel="Customer"
    quickStats={[
      { label: 'Total Customers', value: 1247, change: '+23', trend: 'up', color: 'blue' },
      { label: 'Active This Month', value: 342, change: '+18%', trend: 'up', color: 'green' },
      { label: 'New This Week', value: 12, change: '+4', trend: 'up', color: 'purple' },
      { label: 'VIP Members', value: 89, change: '+2', trend: 'up', color: 'yellow' }
    ]}
    tabViews={[
      { id: 'all', label: 'All Customers' },
      { id: 'vip', label: 'VIP', badge: 89 },
      { id: 'new', label: 'New', badge: 12 },
      { id: 'inactive', label: 'Inactive' }
    ]}
    {...props}
  />
)

export const OrderListPage: React.FC<Omit<SimpleListPageProps, 'entityType' | 'entityTypeLabel' | 'entitySingular' | 'entitySingularLabel'>> = (props) => (
  <SimpleListPage
    entityType="order"
    entityTypeLabel="Orders"
    entitySingular="order"
    entitySingularLabel="Order"
    enableRealTime={true}
    quickStats={[
      { label: "Today's Orders", value: 156, change: '+23', trend: 'up', color: 'blue' },
      { label: 'Pending', value: 8, change: '-2', trend: 'down', color: 'yellow' },
      { label: 'In Progress', value: 12, change: '+4', trend: 'up', color: 'purple' },
      { label: 'Completed', value: 136, change: '+21', trend: 'up', color: 'green' }
    ]}
    tabViews={[
      { id: 'all', label: 'All Orders' },
      { id: 'pending', label: 'Pending', badge: 8, filters: { status: 'pending' } },
      { id: 'preparing', label: 'Preparing', badge: 12, filters: { status: 'preparing' } },
      { id: 'ready', label: 'Ready', filters: { status: 'ready' } },
      { id: 'completed', label: 'Completed', filters: { status: 'completed' } }
    ]}
    {...props}
  />
)

export default SimpleListPage