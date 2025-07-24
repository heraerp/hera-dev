"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Search, Filter, Plus, Download, Upload, RefreshCw, 
  TrendingUp, TrendingDown, AlertTriangle, CheckCircle,
  Eye, Edit, Trash2, Archive, MoreHorizontal, Sparkles,
  BarChart3, PieChart, Target, Activity, DollarSign,
  Building, Users, Calendar, Clock, ArrowUp, ArrowDown,
  SortAsc, SortDesc, Grid, List, Zap, Shield, Brain,
  ChevronRight, ChevronDown, FileText, Settings
} from "lucide-react"
import { NavigationProvider } from "@/components/providers/navigation-provider"
import { Sidebar } from "@/components/navigation/sidebar"
import { Breadcrumbs } from "@/components/navigation/breadcrumbs"
import { ContextualPanel } from "@/components/navigation/contextual-panel"
import { CommandPalette } from "@/components/navigation/command-palette"
import { useTheme } from "@/components/providers/theme-provider"
import { useAdaptiveColor } from "@/hooks/use-adaptive-color"
import { Button } from "@/components/ui/revolutionary-button"
import { Card } from "@/components/ui/revolutionary-card"
import { cn } from "@/lib/utils"
import { safeDocument } from "@/lib/utils/client"
import motionConfig from "@/lib/motion"
import { 
  ChartOfAccountsEntry, 
  AccountType, 
  RiskLevel,
  AccountSearchRequest,
  AccountSearchResponse 
} from "@/lib/types/chart-of-accounts"
import QuickCOAWidget from "@/components/finance/QuickCOAWidget"
import COAFloatingButton from "@/components/ui/COAFloatingButton"

// Sample navigation items for demonstration
const navigationItems = [
  {
    id: "finance",
    label: "Finance",
    href: "/finance",
    icon: DollarSign,
    category: "main"
  },
  {
    id: "chart-of-accounts",
    label: "Chart of Accounts",
    href: "/finance/chart-of-accounts",
    icon: BarChart3,
    category: "finance"
  }
]

// Account Type Color Mapping - Updated for New 7-Category Structure
const accountTypeColors: Record<AccountType, string> = {
  'ASSET': 'text-blue-600 bg-blue-50 border-blue-200',
  'LIABILITY': 'text-red-600 bg-red-50 border-red-200',
  'EQUITY': 'text-purple-600 bg-purple-50 border-purple-200',
  'REVENUE': 'text-green-600 bg-green-50 border-green-200',
  'COST_OF_SALES': 'text-orange-600 bg-orange-50 border-orange-200',
  'DIRECT_EXPENSE': 'text-yellow-600 bg-yellow-50 border-yellow-200',
  'INDIRECT_EXPENSE': 'text-amber-600 bg-amber-50 border-amber-200',
  'TAX_EXPENSE': 'text-rose-600 bg-rose-50 border-rose-200',
  'EXTRAORDINARY_EXPENSE': 'text-gray-600 bg-gray-50 border-gray-200'
}

// Risk Level Color Mapping
const riskLevelColors: Record<RiskLevel, string> = {
  'LOW': 'text-green-600 bg-green-50',
  'MEDIUM': 'text-yellow-600 bg-yellow-50',
  'HIGH': 'text-orange-600 bg-orange-50',
  'CRITICAL': 'text-red-600 bg-red-50'
}

// AI Insights Panel Component
function AIInsightsPanel({ insights, onRefresh }: { insights: any[], onRefresh: () => void }) {
  const [isExpanded, setIsExpanded] = React.useState(true)

  return (
    <Card variant="glass" className="border-l-4 border-l-financial-primary">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            >
              <Brain className="w-5 h-5 text-financial-primary" />
            </motion.div>
            <h3 className="text-lg font-semibold">AI Insights</h3>
            <span className="text-sm text-muted-foreground">({insights.length})</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onRefresh}
              leftIcon={<RefreshCw className="w-4 h-4" />}
            >
              Refresh
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              leftIcon={isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            >
              {isExpanded ? 'Collapse' : 'Expand'}
            </Button>
          </div>
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="space-y-3"
            >
              {insights.map((insight, index) => (
                <motion.div
                  key={index}
                  className={cn(
                    "p-3 rounded-lg border",
                    insight.type === "opportunity" && "bg-green-50 border-green-200 text-green-900",
                    insight.type === "risk" && "bg-red-50 border-red-200 text-red-900",
                    insight.type === "optimization" && "bg-blue-50 border-blue-200 text-blue-900"
                  )}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-sm">{insight.title}</h4>
                    <div className="flex items-center gap-1 text-xs">
                      <Sparkles className="w-3 h-3" />
                      <span>{Math.round(insight.confidence * 100)}%</span>
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed mb-2">{insight.description}</p>
                  <div className="flex items-center justify-between">
                    <span className={cn(
                      "text-xs px-2 py-1 rounded-full",
                      insight.impact === "HIGH" && "bg-red-100 text-red-800",
                      insight.impact === "MEDIUM" && "bg-yellow-100 text-yellow-800",
                      insight.impact === "LOW" && "bg-green-100 text-green-800"
                    )}>
                      {insight.impact} Impact
                    </span>
                    <Button variant="ghost" size="sm" className="text-xs">
                      Learn More
                    </Button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Card>
  )
}

// Account List Item Component
function AccountListItem({ 
  account, 
  isSelected, 
  onSelect, 
  onEdit, 
  onView,
  viewMode = "list"
}: {
  account: ChartOfAccountsEntry
  isSelected: boolean
  onSelect: (accountId: string) => void
  onEdit: (account: ChartOfAccountsEntry) => void
  onView: (account: ChartOfAccountsEntry) => void
  viewMode?: "list" | "grid"
}) {
  const { getAdaptedColor } = useAdaptiveColor()
  const [showActions, setShowActions] = React.useState(false)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: account.currency || 'USD'
    }).format(amount)
  }

  const getStatusIcon = () => {
    if (!account.isActive) return <Archive className="w-4 h-4 text-muted-foreground" />
    if (account.complianceFlags.length > 0) return <AlertTriangle className="w-4 h-4 text-yellow-600" />
    return <CheckCircle className="w-4 h-4 text-green-600" />
  }

  const getTrendIcon = () => {
    if (account.monthlyActivity && account.monthlyActivity.length > 0) {
      const lastActivity = account.monthlyActivity[account.monthlyActivity.length - 1]
      return lastActivity.netChange > 0 ? 
        <TrendingUp className="w-4 h-4 text-green-600" /> : 
        <TrendingDown className="w-4 h-4 text-red-600" />
    }
    return null
  }

  if (viewMode === "grid") {
    return (
      <motion.div
        className={cn(
          "p-4 rounded-lg border transition-all cursor-pointer",
          isSelected ? "border-financial-primary bg-financial-primary/5" : "border-border hover:border-financial-primary/50",
          !account.isActive && "opacity-60"
        )}
        onClick={() => onSelect(account.id)}
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
        whileHover={{ y: -2 }}
        transition={motionConfig.spring.swift}
      >
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-sm font-medium text-financial-primary">{account.accountCode}</span>
                {getStatusIcon()}
              </div>
              <h4 className="font-semibold text-foreground line-clamp-2">{account.accountName}</h4>
            </div>
            <AnimatePresence>
              {showActions && (
                <motion.div
                  className="flex gap-1"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                >
                  <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onView(account) }}>
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onEdit(account) }}>
                    <Edit className="w-4 h-4" />
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Account Type & Balance */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className={cn(
                "text-xs px-2 py-1 rounded-full border",
                accountTypeColors[account.accountType]
              )}>
                {account.accountType}
              </span>
              <div className="flex items-center gap-1">
                {getTrendIcon()}
                <span className="font-semibold text-foreground">{formatCurrency(account.balance)}</span>
              </div>
            </div>
          </div>

          {/* Risk Level */}
          <div className="flex items-center justify-between">
            <span className={cn(
              "text-xs px-2 py-1 rounded",
              riskLevelColors[account.riskLevel]
            )}>
              {account.riskLevel} Risk
            </span>
            {account.aiSuggestions && account.aiSuggestions.length > 0 && (
              <div className="flex items-center gap-1 text-xs text-financial-primary">
                <Sparkles className="w-3 h-3" />
                <span>{account.aiSuggestions.length} AI Insights</span>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      className={cn(
        "p-4 border-b border-border hover:bg-muted/30 transition-all cursor-pointer",
        isSelected && "bg-financial-primary/5 border-l-4 border-l-financial-primary",
        !account.isActive && "opacity-60"
      )}
      onClick={() => onSelect(account.id)}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      whileHover={{ x: 4 }}
      transition={motionConfig.spring.swift}
    >
      <div className="flex items-center justify-between">
        {/* Account Info */}
        <div className="flex items-center gap-4 flex-1">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <span className="font-mono text-sm font-medium text-financial-primary min-w-[80px]">{account.accountCode}</span>
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-foreground">{account.accountName}</h4>
              {account.level > 0 && (
                <span className="text-xs text-muted-foreground">Level {account.level}</span>
              )}
            </div>
            {account.description && (
              <p className="text-sm text-muted-foreground line-clamp-1">{account.description}</p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className={cn(
              "text-xs px-2 py-1 rounded-full border",
              accountTypeColors[account.accountType]
            )}>
              {account.accountType}
            </span>
            
            <span className={cn(
              "text-xs px-2 py-1 rounded",
              riskLevelColors[account.riskLevel]
            )}>
              {account.riskLevel}
            </span>
          </div>
        </div>

        {/* Balance & Actions */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="flex items-center gap-1">
              {getTrendIcon()}
              <span className="font-semibold text-foreground">{formatCurrency(account.balance)}</span>
            </div>
            <span className="text-xs text-muted-foreground">{account.currency}</span>
          </div>

          {account.aiSuggestions && account.aiSuggestions.length > 0 && (
            <div className="flex items-center gap-1 text-financial-primary">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">{account.aiSuggestions.length}</span>
            </div>
          )}

          <AnimatePresence>
            {showActions && (
              <motion.div
                className="flex gap-1"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onView(account) }}>
                  <Eye className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onEdit(account) }}>
                  <Edit className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  )
}

// Quick Stats Component
function QuickStats({ accounts }: { accounts: ChartOfAccountsEntry[] }) {
  const stats = React.useMemo(() => {
    const totalAccounts = accounts.length
    const activeAccounts = accounts.filter(acc => acc.isActive).length
    const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0)
    const riskDistribution = accounts.reduce((acc, account) => {
      acc[account.riskLevel] = (acc[account.riskLevel] || 0) + 1
      return acc
    }, {} as Record<RiskLevel, number>)

    return {
      totalAccounts,
      activeAccounts,
      totalBalance,
      riskDistribution
    }
  }, [accounts])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact'
    }).format(amount)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card variant="glass" className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-financial-primary/10 rounded-lg flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-financial-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Accounts</p>
            <p className="text-2xl font-bold">{stats.totalAccounts}</p>
          </div>
        </div>
      </Card>

      <Card variant="glass" className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Active Accounts</p>
            <p className="text-2xl font-bold">{stats.activeAccounts}</p>
          </div>
        </div>
      </Card>

      <Card variant="glass" className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Balance</p>
            <p className="text-2xl font-bold">{formatCurrency(stats.totalBalance)}</p>
          </div>
        </div>
      </Card>

      <Card variant="glass" className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
            <Shield className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">High Risk</p>
            <p className="text-2xl font-bold">{(stats.riskDistribution.HIGH || 0) + (stats.riskDistribution.CRITICAL || 0)}</p>
          </div>
        </div>
      </Card>
    </div>
  )
}

// Main Chart of Accounts Page
export default function ChartOfAccountsPage() {
  const { setContext } = useTheme()
  const { getAdaptedColor } = useAdaptiveColor()
  const [mounted, setMounted] = React.useState(false)
  const [showWelcome, setShowWelcome] = React.useState(false)

  // State management
  const [accounts, setAccounts] = React.useState<ChartOfAccountsEntry[]>([])
  const [loading, setLoading] = React.useState(true)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedAccounts, setSelectedAccounts] = React.useState<string[]>([])
  const [viewMode, setViewMode] = React.useState<"list" | "grid">("list")
  const [sortBy, setSortBy] = React.useState<"accountCode" | "accountName" | "balance">("accountCode")
  const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">("asc")
  const [filterType, setFilterType] = React.useState<AccountType | "ALL">("ALL")
  const [filterRisk, setFilterRisk] = React.useState<RiskLevel | "ALL">("ALL")
  const [showFilters, setShowFilters] = React.useState(false)
  const [aiInsights, setAIInsights] = React.useState<any[]>([
    {
      type: "opportunity",
      title: "Cash Flow Optimization",
      description: "Consider implementing automated cash sweeping to optimize interest earnings across 3 accounts",
      confidence: 0.87,
      impact: "MEDIUM"
    },
    {
      type: "risk",
      title: "Vendor Concentration Risk",
      description: "65% of payments concentrated in top 3 vendors - diversification recommended",
      confidence: 0.92,
      impact: "HIGH"
    },
    {
      type: "optimization",
      title: "Reconciliation Automation",
      description: "87% of transactions follow predictable patterns suitable for automation",
      confidence: 0.89,
      impact: "MEDIUM"
    }
  ])

  // Check for onboarding completion
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      if (urlParams.get('onboarded') === 'true') {
        setShowWelcome(true)
        // Remove the parameter from URL without page refresh
        window.history.replaceState({}, document.title, window.location.pathname)
        // Auto-hide welcome after 5 seconds
        setTimeout(() => setShowWelcome(false), 5000)
      }
    }
  }, [])

  // Handle client-side mounting
  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Set financial context for theme
  React.useEffect(() => {
    if (mounted) {
      setContext("financial")
    }
  }, [setContext, mounted])

  // Fetch accounts data
  React.useEffect(() => {
    if (!mounted) return

    const fetchAccounts = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/finance/chart-of-accounts')
        const data: AccountSearchResponse = await response.json()
        setAccounts(data.accounts)
      } catch (error) {
        console.error('Error fetching accounts:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAccounts()
  }, [mounted])

  // Filter and sort accounts
  const filteredAccounts = React.useMemo(() => {
    if (!accounts || !Array.isArray(accounts)) {
      return [];
    }
    
    const filtered = accounts.filter(account => {
      const matchesSearch = !searchQuery || 
        account.accountName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        account.accountCode.includes(searchQuery) ||
        account.description?.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesType = filterType === "ALL" || account.accountType === filterType
      const matchesRisk = filterRisk === "ALL" || account.riskLevel === filterRisk

      return matchesSearch && matchesType && matchesRisk
    })

    // Sort accounts
    filtered.sort((a, b) => {
      let comparison = 0
      switch (sortBy) {
        case 'accountCode':
          comparison = a.accountCode.localeCompare(b.accountCode)
          break
        case 'accountName':
          comparison = a.accountName.localeCompare(b.accountName)
          break
        case 'balance':
          comparison = a.balance - b.balance
          break
      }
      return sortOrder === 'desc' ? -comparison : comparison
    })

    return filtered
  }, [accounts, searchQuery, filterType, filterRisk, sortBy, sortOrder])

  // Handle account selection
  const handleSelectAccount = (accountId: string) => {
    setSelectedAccounts(prev => 
      prev.includes(accountId) 
        ? prev.filter(id => id !== accountId)
        : [...prev, accountId]
    )
  }

  // Handle bulk selection
  const handleSelectAll = () => {
    setSelectedAccounts(
      selectedAccounts.length === filteredAccounts.length 
        ? [] 
        : filteredAccounts.map(acc => acc.id)
    )
  }

  // Handle account actions
  const handleViewAccount = (account: ChartOfAccountsEntry) => {
    window.location.href = `/finance/chart-of-accounts/${account.id}`
  }

  const handleEditAccount = (account: ChartOfAccountsEntry) => {
    window.location.href = `/finance/chart-of-accounts/${account.id}?mode=edit`
  }

  const handleCreateAccount = () => {
    window.location.href = '/finance/chart-of-accounts/create'
  }

  const handleViewHierarchy = () => {
    window.location.href = '/finance/chart-of-accounts/hierarchy'
  }

  const handleRefreshAI = () => {
    // Simulate AI refresh
    setAIInsights(prev => [...prev])
  }

  // Prevent hydration issues by not rendering until mounted
  if (!mounted) {
    return null
  }

  return (
    <NavigationProvider
      initialItems={navigationItems}
      enableAI={true}
      enableAnalytics={true}
    >
      <div className="min-h-screen bg-background flex">
        {/* Sidebar */}
        <Sidebar enableGestures={true} enableAI={true} showLogo={true} />

        {/* Main Content */}
        <main className="flex-1 overflow-hidden">
          {/* Welcome Banner for New Users */}
          {showWelcome && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-b border-green-200 dark:border-green-800 p-4">
              <div className="flex items-center justify-between max-w-7xl mx-auto">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mr-4">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-green-800 dark:text-green-200">
                      🎉 Welcome to your AI-powered Chart of Accounts!
                    </h3>
                    <p className="text-green-700 dark:text-green-300">
                      You're all set! Your account intelligence is now active and learning from your business patterns.
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowWelcome(false)}
                  className="border-green-300 dark:border-green-700"
                >
                  <ArrowDown className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
          
          {/* Header */}
          <div className="border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="p-6">
              <Breadcrumbs showHome={true} enableAI={true} />
              
              <div className="mt-4 flex items-center justify-between">
                <div>
                  <motion.h1 
                    className="text-3xl font-bold text-foreground"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    Chart of Accounts
                  </motion.h1>
                  <motion.p 
                    className="text-muted-foreground mt-1"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    AI-powered account structure management with real-time insights
                  </motion.p>
                </div>

                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    leftIcon={<BarChart3 className="w-4 h-4" />}
                    onClick={handleViewHierarchy}
                  >
                    Hierarchy View
                  </Button>
                  <Button
                    variant="outline"
                    leftIcon={<Download className="w-4 h-4" />}
                  >
                    Export
                  </Button>
                  <Button
                    variant="gradient"
                    leftIcon={<Plus className="w-4 h-4" />}
                    onClick={handleCreateAccount}
                    className="bg-gradient-to-r from-financial-primary to-financial-success"
                  >
                    Create Account
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6 overflow-y-auto h-[calc(100vh-180px)]">
            {/* Hero Section - Primary Entry Point */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Quick COA Widget - Takes 2/3 space */}
              <div className="lg:col-span-2">
                <QuickCOAWidget />
              </div>
              
              {/* Welcome Panel - Takes 1/3 space */}
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-200 dark:border-indigo-800 rounded-xl p-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Brain className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    Welcome to AI COA
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                    First time? Take our quick tour to see the intelligence in action.
                  </p>
                  <Button 
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white" 
                    onClick={() => window.location.href = '/finance/chart-of-accounts/onboarding'}
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Start COA Tour
                  </Button>
                  
                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-indigo-200 dark:border-indigo-700">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">94%</div>
                      <div className="text-xs text-indigo-700 dark:text-indigo-300">AI Accuracy</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">2.1h</div>
                      <div className="text-xs text-purple-700 dark:text-purple-300">Weekly Savings</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <QuickStats accounts={accounts} />

            {/* AI Insights Panel */}
            <AIInsightsPanel insights={aiInsights} onRefresh={handleRefreshAI} />

            {/* Search and Filters */}
            <Card variant="glass" className="p-4">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search accounts by name, code, or description..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-financial-primary/20"
                  />
                </div>

                <Button
                  variant="outline"
                  leftIcon={<Filter className="w-4 h-4" />}
                  onClick={() => setShowFilters(!showFilters)}
                  className={showFilters ? "bg-financial-primary/10" : ""}
                >
                  Filters
                </Button>

                <div className="flex items-center gap-1 border border-border rounded-lg">
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                  >
                    <Grid className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Advanced Filters */}
              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-border pt-4"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Account Type</label>
                        <select
                          value={filterType}
                          onChange={(e) => setFilterType(e.target.value as AccountType | "ALL")}
                          className="w-full p-2 border border-border rounded-lg bg-background"
                        >
                          <option value="ALL">All Types</option>
                          <option value="ASSET">Asset</option>
                          <option value="LIABILITY">Liability</option>
                          <option value="EQUITY">Equity</option>
                          <option value="REVENUE">Revenue</option>
                          <option value="EXPENSE">Expense</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Risk Level</label>
                        <select
                          value={filterRisk}
                          onChange={(e) => setFilterRisk(e.target.value as RiskLevel | "ALL")}
                          className="w-full p-2 border border-border rounded-lg bg-background"
                        >
                          <option value="ALL">All Levels</option>
                          <option value="LOW">Low Risk</option>
                          <option value="MEDIUM">Medium Risk</option>
                          <option value="HIGH">High Risk</option>
                          <option value="CRITICAL">Critical Risk</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Sort By</label>
                        <select
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value as any)}
                          className="w-full p-2 border border-border rounded-lg bg-background"
                        >
                          <option value="accountCode">Account Code</option>
                          <option value="accountName">Account Name</option>
                          <option value="balance">Balance</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Sort Order</label>
                        <Button
                          variant="outline"
                          onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                          leftIcon={sortOrder === "asc" ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
                          className="w-full justify-start"
                        >
                          {sortOrder === "asc" ? "Ascending" : "Descending"}
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>

            {/* Bulk Actions */}
            {selectedAccounts.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-4 p-4 bg-financial-primary/10 rounded-lg border border-financial-primary/20"
              >
                <span className="text-sm font-medium">
                  {selectedAccounts.length} account{selectedAccounts.length > 1 ? 's' : ''} selected
                </span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" leftIcon={<Edit className="w-4 h-4" />}>
                    Bulk Edit
                  </Button>
                  <Button variant="outline" size="sm" leftIcon={<Archive className="w-4 h-4" />}>
                    Archive
                  </Button>
                  <Button variant="outline" size="sm" leftIcon={<Download className="w-4 h-4" />}>
                    Export Selected
                  </Button>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setSelectedAccounts([])}
                >
                  Clear Selection
                </Button>
              </motion.div>
            )}

            {/* Accounts List/Grid */}
            <Card variant="glass" className="overflow-hidden">
              {/* List Header */}
              {viewMode === "list" && (
                <div className="p-4 border-b border-border bg-muted/20">
                  <div className="flex items-center gap-4">
                    <input
                      type="checkbox"
                      checked={selectedAccounts.length === filteredAccounts.length && filteredAccounts.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-border"
                    />
                    <span className="text-sm font-medium">
                      {filteredAccounts.length} account{filteredAccounts.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              )}

              {/* Loading State */}
              {loading && (
                <div className="p-12 text-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-8 h-8 border-2 border-financial-primary border-t-transparent rounded-full mx-auto mb-4"
                  />
                  <p className="text-muted-foreground">Loading accounts...</p>
                </div>
              )}

              {/* Empty State */}
              {!loading && filteredAccounts.length === 0 && (
                <div className="p-12 text-center">
                  <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No accounts found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery || filterType !== "ALL" || filterRisk !== "ALL" 
                      ? "Try adjusting your search or filters" 
                      : "Get started by creating your first account"
                    }
                  </p>
                  <Button onClick={handleCreateAccount} leftIcon={<Plus className="w-4 h-4" />}>
                    Create Account
                  </Button>
                </div>
              )}

              {/* Accounts Content */}
              {!loading && filteredAccounts.length > 0 && (
                <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4" : ""}>
                  {filteredAccounts.map((account, index) => (
                    <motion.div
                      key={account.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <AccountListItem
                        account={account}
                        isSelected={selectedAccounts.includes(account.id)}
                        onSelect={handleSelectAccount}
                        onEdit={handleEditAccount}
                        onView={handleViewAccount}
                        viewMode={viewMode}
                      />
                    </motion.div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </main>

        {/* Contextual Panel */}
        <ContextualPanel
          position="right"
          enablePersistence={true}
          enableAnalytics={true}
          showQuickActions={true}
        />

        {/* Command Palette */}
        <CommandPalette
          enableVoice={true}
          enableNLP={true}
          showRecentCommands={true}
          showKeyboardShortcuts={true}
        />
      </div>
      
      {/* Global Floating Action Button */}
      <COAFloatingButton 
        position="bottom-right"
        showOnMobile={true}
        showOnDesktop={true}
      />
    </NavigationProvider>
  )
}