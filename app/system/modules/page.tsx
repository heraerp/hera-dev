'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Package, 
  Search, 
  Filter,
  Calendar,
  CheckCircle,
  Activity,
  BarChart3,
  CreditCard,
  Users,
  Calculator,
  DollarSign,
  TrendingUp,
  Brain,
  Zap,
  Settings,
  Eye,
  Download,
  RefreshCw,
  Shield,
  Layers,
  Database,
  Globe
} from 'lucide-react'
import { AppNavbar } from '@/components/ui/AppNavbar'
import DynamicSidebar from '@/components/ui/DynamicSidebar'
import ModuleStatusCard from '@/components/system/ModuleStatusCard'

interface DeployedModule {
  title: string
  module_code: string
  module_name: string
  created_at: string
}

// Mock data based on the provided modules
const deployedModules: DeployedModule[] = [
  {
    title: "📦 DEPLOYED ERP MODULES",
    module_code: "SYS-ANALYTICS-ORG-123e4567",
    module_name: "Business Analytics Core - Deployed",
    created_at: "2025-07-23 11:16:53.718379"
  },
  {
    title: "📦 DEPLOYED ERP MODULES",
    module_code: "SYS-AP-MGMT-ORG-123e4567",
    module_name: "Accounts Payable Management - Deployed",
    created_at: "2025-07-23 11:16:53.718379"
  },
  {
    title: "📦 DEPLOYED ERP MODULES",
    module_code: "SYS-AR-MGMT-ORG-123e4567",
    module_name: "Accounts Receivable Management - Deployed",
    created_at: "2025-07-23 11:16:53.718379"
  },
  {
    title: "📦 DEPLOYED ERP MODULES",
    module_code: "SYS-ASSET-MGMT-ORG-123e4567",
    module_name: "Fixed Asset Management - Deployed",
    created_at: "2025-07-23 11:16:53.718379"
  },
  {
    title: "📦 DEPLOYED ERP MODULES",
    module_code: "SYS-BUDGET-CTRL-ORG-123e4567",
    module_name: "Budget Control System - Deployed",
    created_at: "2025-07-23 11:16:53.718379"
  },
  {
    title: "📦 DEPLOYED ERP MODULES",
    module_code: "SYS-CASH-MGMT-ORG-123e4567",
    module_name: "Cash Management System - Deployed",
    created_at: "2025-07-23 11:16:53.718379"
  },
  {
    title: "📦 DEPLOYED ERP MODULES",
    module_code: "SYS-CRM-CORE-ORG-123e4567",
    module_name: "Customer Management Core - Deployed",
    created_at: "2025-07-23 11:16:53.718379"
  },
  {
    title: "📦 DEPLOYED ERP MODULES",
    module_code: "SYS-GL-CORE-ORG-123e4567",
    module_name: "General Ledger Core System - Deployed",
    created_at: "2025-07-23 11:16:53.718379"
  },
  {
    title: "📦 DEPLOYED ERP MODULES",
    module_code: "SYS-GL-SUBLEDGER-ORG-123e4567",
    module_name: "GL Sub-ledger Integration System - Deployed",
    created_at: "2025-07-23 11:16:53.718379"
  },
  {
    title: "📦 DEPLOYED ERP MODULES",
    module_code: "SYS-AI-INSIGHTS-ORG-123e4567",
    module_name: "AI Intelligence System - Deployed",
    created_at: "2025-07-23 11:16:53.718379"
  }
]

// Module metadata for enhanced display
const moduleMetadata = {
  'SYS-ANALYTICS-ORG-123e4567': {
    icon: BarChart3,
    color: 'bg-purple-100 text-purple-800 border-purple-300',
    category: 'Analytics',
    description: 'Real-time business intelligence and reporting capabilities',
    features: ['Dashboard Analytics', 'Custom Reports', 'KPI Tracking', 'Data Visualization', 'Predictive Analytics', 'Export Tools'],
    status: 'healthy' as const,
    usage: {
      activeUsers: 8,
      dailyTransactions: 1247,
      lastAccessed: '2 min ago'
    },
    performance: {
      uptime: 99.8,
      responseTime: 87,
      errorRate: 0.1
    }
  },
  'SYS-AP-MGMT-ORG-123e4567': {
    icon: CreditCard,
    color: 'bg-red-100 text-red-800 border-red-300',
    category: 'Finance',
    description: 'Comprehensive accounts payable management and vendor relations',
    features: ['Invoice Processing', 'Vendor Management', 'Payment Scheduling', 'Three-Way Matching', 'Auto-Approval Workflows'],
    status: 'healthy' as const,
    usage: {
      activeUsers: 5,
      dailyTransactions: 342,
      lastAccessed: '5 min ago'
    },
    performance: {
      uptime: 99.9,
      responseTime: 124,
      errorRate: 0.05
    }
  },
  'SYS-AR-MGMT-ORG-123e4567': {
    icon: DollarSign,
    color: 'bg-green-100 text-green-800 border-green-300',
    category: 'Finance',
    description: 'Accounts receivable management and customer billing',
    features: ['Customer Invoicing', 'Payment Tracking', 'Credit Management', 'Collection Workflow', 'Aging Reports'],
    status: 'healthy' as const,
    usage: {
      activeUsers: 6,
      dailyTransactions: 156,
      lastAccessed: '1 min ago'
    },
    performance: {
      uptime: 99.7,
      responseTime: 98,
      errorRate: 0.2
    }
  },
  'SYS-ASSET-MGMT-ORG-123e4567': {
    icon: Package,
    color: 'bg-orange-100 text-orange-800 border-orange-300',
    category: 'Operations',
    description: 'Fixed asset tracking, depreciation, and lifecycle management',
    features: ['Asset Registry', 'Depreciation Calculation', 'Maintenance Tracking', 'Disposal Management', 'Location Tracking'],
    status: 'healthy' as const,
    usage: {
      activeUsers: 3,
      dailyTransactions: 45,
      lastAccessed: '15 min ago'
    },
    performance: {
      uptime: 99.5,
      responseTime: 156,
      errorRate: 0.3
    }
  },
  'SYS-BUDGET-CTRL-ORG-123e4567': {
    icon: TrendingUp,
    color: 'bg-indigo-100 text-indigo-800 border-indigo-300',
    category: 'Planning',
    description: 'Budget planning, control, and variance analysis',
    features: ['Budget Creation', 'Approval Workflows', 'Variance Analysis', 'Forecasting', 'Multi-period Planning'],
    status: 'warning' as const,
    usage: {
      activeUsers: 4,
      dailyTransactions: 89,
      lastAccessed: '3 min ago'
    },
    performance: {
      uptime: 98.2,
      responseTime: 234,
      errorRate: 1.2
    }
  },
  'SYS-CASH-MGMT-ORG-123e4567': {
    icon: Calculator,
    color: 'bg-teal-100 text-teal-800 border-teal-300',
    category: 'Finance',
    description: 'Cash flow management and treasury operations',
    features: ['Cash Flow Forecasting', 'Bank Reconciliation', 'Treasury Management', 'Liquidity Planning', 'Multi-currency Support'],
    status: 'healthy' as const,
    usage: {
      activeUsers: 4,
      dailyTransactions: 234,
      lastAccessed: '8 min ago'
    },
    performance: {
      uptime: 99.6,
      responseTime: 142,
      errorRate: 0.15
    }
  },
  'SYS-CRM-CORE-ORG-123e4567': {
    icon: Users,
    color: 'bg-pink-100 text-pink-800 border-pink-300',
    category: 'Customer',
    description: 'Customer relationship management and engagement',
    features: ['Customer Database', 'Sales Pipeline', 'Marketing Campaigns', 'Service Management', 'Loyalty Programs'],
    status: 'healthy' as const,
    usage: {
      activeUsers: 12,
      dailyTransactions: 567,
      lastAccessed: '30 sec ago'
    },
    performance: {
      uptime: 99.4,
      responseTime: 176,
      errorRate: 0.4
    }
  },
  'SYS-GL-CORE-ORG-123e4567': {
    icon: Database,
    color: 'bg-blue-100 text-blue-800 border-blue-300',
    category: 'Finance',
    description: 'Core general ledger with chart of accounts and journal entries',
    features: ['Chart of Accounts', 'Journal Entries', 'Financial Statements', 'Period Close', 'Multi-entity Consolidation'],
    status: 'healthy' as const,
    usage: {
      activeUsers: 7,
      dailyTransactions: 892,
      lastAccessed: '1 min ago'
    },
    performance: {
      uptime: 99.9,
      responseTime: 67,
      errorRate: 0.02
    }
  },
  'SYS-GL-SUBLEDGER-ORG-123e4567': {
    icon: Layers,
    color: 'bg-cyan-100 text-cyan-800 border-cyan-300',
    category: 'Finance',
    description: 'Sub-ledger integration with HERA GL Intelligence',
    features: ['Real-time Posting', 'GL Intelligence', 'Auto-validation', 'Sub-ledger Integration', 'Smart Reconciliation'],
    status: 'healthy' as const,
    usage: {
      activeUsers: 9,
      dailyTransactions: 1456,
      lastAccessed: '30 sec ago'
    },
    performance: {
      uptime: 99.8,
      responseTime: 89,
      errorRate: 0.08
    }
  },
  'SYS-AI-INSIGHTS-ORG-123e4567': {
    icon: Brain,
    color: 'bg-violet-100 text-violet-800 border-violet-300',
    category: 'AI/ML',
    description: 'AI-powered insights and automated decision making',
    features: ['Predictive Analytics', 'Auto-categorization', 'Anomaly Detection', 'Smart Recommendations', 'Pattern Recognition'],
    status: 'healthy' as const,
    usage: {
      activeUsers: 15,
      dailyTransactions: 2341,
      lastAccessed: '10 sec ago'
    },
    performance: {
      uptime: 99.6,
      responseTime: 245,
      errorRate: 0.25
    }
  }
}

export default function DeployedModulesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<string>('grid')

  const handleLogout = () => {
    window.location.href = '/auth/login'
  }

  const filteredModules = deployedModules.filter(module => {
    const metadata = moduleMetadata[module.module_code as keyof typeof moduleMetadata]
    const matchesSearch = module.module_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         module.module_code.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = filterCategory === 'all' || metadata?.category === filterCategory
    
    return matchesSearch && matchesCategory
  })

  const getModuleMetadata = (moduleCode: string) => {
    return moduleMetadata[moduleCode as keyof typeof moduleMetadata] || {
      icon: Package,
      color: 'bg-gray-100 text-gray-800 border-gray-300',
      category: 'System',
      description: 'System module',
      features: []
    }
  }

  const categories = ['all', ...Array.from(new Set(Object.values(moduleMetadata).map(m => m.category)))]
  
  const getStatusBadge = () => (
    <Badge className="bg-green-100 text-green-800 border-green-300">
      <CheckCircle className="w-3 h-3 mr-1" />
      Active
    </Badge>
  )

  const refreshModules = async () => {
    setLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setLoading(false)
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
        
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg">
                  <Package className="h-8 w-8 text-white" />
                </div>
                Deployed ERP Modules
              </h1>
              <p className="text-gray-600">
                Mario's Italian Restaurant - HERA Universal Business Management System
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                <Activity className="w-4 h-4 mr-1" />
                {deployedModules.length} Modules Active
              </Badge>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
                <Shield className="w-4 h-4 mr-1" />
                HERA Universal Architecture
              </Badge>
              <Button 
                variant="outline"
                onClick={refreshModules}
                disabled={loading}
              >
                {loading ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Refresh
              </Button>
            </div>
          </div>

          {/* System Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Modules</p>
                    <p className="text-2xl font-bold text-gray-900">{deployedModules.length}</p>
                  </div>
                  <Package className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Categories</p>
                    <p className="text-2xl font-bold text-gray-900">{categories.length - 1}</p>
                  </div>
                  <Layers className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">System Status</p>
                    <p className="text-2xl font-bold text-green-600">Healthy</p>
                  </div>
                  <Activity className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Organization</p>
                    <p className="text-2xl font-bold text-blue-600">Mario's</p>
                  </div>
                  <Globe className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Search */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search modules..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category === 'all' ? 'All Categories' : category}
                    </option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Main Content */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList>
              <TabsTrigger value="grid">
                <Package className="w-4 h-4 mr-2" />
                Grid View
              </TabsTrigger>
              <TabsTrigger value="list">
                <Filter className="w-4 h-4 mr-2" />
                List View
              </TabsTrigger>
              <TabsTrigger value="categories">
                <Layers className="w-4 h-4 mr-2" />
                By Category
              </TabsTrigger>
            </TabsList>

            {/* Grid View */}
            <TabsContent value="grid">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredModules.map((module) => {
                  const metadata = getModuleMetadata(module.module_code)
                  const IconComponent = metadata.icon
                  
                  return (
                    <Card key={module.module_code} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${metadata.color.replace('text-', 'bg-').replace('border-', '').split(' ')[0]}`}>
                              <IconComponent className="h-6 w-6 text-white" />
                            </div>
                            <div>
                              <CardTitle className="text-lg">{module.module_name.replace(' - Deployed', '')}</CardTitle>
                              <CardDescription className="text-sm text-gray-500">
                                {module.module_code.split('-').slice(0, -2).join('-')}
                              </CardDescription>
                            </div>
                          </div>
                          {getStatusBadge()}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <Badge variant="outline" className={metadata.color}>
                              {metadata.category}
                            </Badge>
                          </div>
                          
                          <p className="text-sm text-gray-600">{metadata.description}</p>
                          
                          <div>
                            <p className="text-sm font-medium text-gray-900 mb-2">Key Features:</p>
                            <ul className="text-xs text-gray-600 space-y-1">
                              {metadata.features.map((feature, idx) => (
                                <li key={idx} className="flex items-center gap-1">
                                  <CheckCircle className="h-3 w-3 text-green-500" />
                                  {feature}
                                </li>
                              ))}
                            </ul>
                          </div>
                          
                          <div className="flex items-center justify-between pt-2 border-t">
                            <div className="text-xs text-gray-500">
                              <Calendar className="h-3 w-3 inline mr-1" />
                              Deployed: {new Date(module.created_at).toLocaleDateString()}
                            </div>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm">
                                <Eye className="h-3 w-3 mr-1" />
                                View
                              </Button>
                              <Button variant="outline" size="sm">
                                <Settings className="h-3 w-3 mr-1" />
                                Configure
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </TabsContent>

            {/* List View */}
            <TabsContent value="list">
              <Card>
                <CardHeader>
                  <CardTitle>Module List</CardTitle>
                  <CardDescription>All deployed modules in Mario's Restaurant</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {filteredModules.map((module) => {
                      const metadata = getModuleMetadata(module.module_code)
                      const IconComponent = metadata.icon
                      
                      return (
                        <div key={module.module_code} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                          <div className="flex items-center gap-4">
                            <div className={`p-2 rounded-lg ${metadata.color.replace('text-', 'bg-').replace('border-', '').split(' ')[0]}`}>
                              <IconComponent className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <h3 className="font-medium">{module.module_name.replace(' - Deployed', '')}</h3>
                              <p className="text-sm text-gray-500">{metadata.description}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className={metadata.color} size="sm">
                                  {metadata.category}
                                </Badge>
                                <span className="text-xs text-gray-400">
                                  {module.module_code}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {getStatusBadge()}
                            <Button variant="outline" size="sm">
                              <Eye className="h-3 w-3 mr-1" />
                              Details
                            </Button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Categories View */}
            <TabsContent value="categories">
              <div className="space-y-6">
                {categories.filter(cat => cat !== 'all').map(category => {
                  const categoryModules = filteredModules.filter(module => {
                    const metadata = getModuleMetadata(module.module_code)
                    return metadata.category === category
                  })
                  
                  if (categoryModules.length === 0) return null
                  
                  return (
                    <Card key={category}>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Layers className="h-5 w-5" />
                          {category} Modules
                          <Badge variant="outline">{categoryModules.length}</Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {categoryModules.map((module) => {
                            const metadata = getModuleMetadata(module.module_code)
                            const IconComponent = metadata.icon
                            
                            return (
                              <div key={module.module_code} className="flex items-center gap-3 p-3 border rounded-lg">
                                <div className={`p-2 rounded-lg ${metadata.color.replace('text-', 'bg-').replace('border-', '').split(' ')[0]}`}>
                                  <IconComponent className="h-4 w-4 text-white" />
                                </div>
                                <div className="flex-1">
                                  <h4 className="font-medium text-sm">{module.module_name.replace(' - Deployed', '')}</h4>
                                  <p className="text-xs text-gray-500">{metadata.description}</p>
                                </div>
                                {getStatusBadge()}
                              </div>
                            )
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </TabsContent>
          </Tabs>

          {/* Footer */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  <p><strong>Organization:</strong> Mario's Italian Restaurant (123e4567-e89b-12d3-a456-426614174000)</p>
                  <p><strong>HERA Version:</strong> Universal Architecture v2.0</p>
                  <p><strong>Last Updated:</strong> {new Date().toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                    <Zap className="w-3 h-3 mr-1" />
                    System Healthy
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}