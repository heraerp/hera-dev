// new comment added

"use client"

import { Breadcrumbs } from "@/components/navigation/breadcrumbs"
import { CommandPalette } from "@/components/navigation/command-palette"
import { ContextualPanel } from "@/components/navigation/contextual-panel"
import { Sidebar } from "@/components/navigation/sidebar"
import { NavigationProvider } from "@/components/providers/navigation-provider"
import { Button } from "@/components/ui/revolutionary-button"
import { Card } from "@/components/ui/revolutionary-card"
import { useAdaptiveColor } from "@/hooks/use-adaptive-color"
import { useGestures } from "@/hooks/use-gestures"
import motionConfig from "@/lib/motion"
import { cn } from "@/lib/utils"
import { safeWindow } from "@/lib/utils/client"
import { motion } from "framer-motion"
import {
  Activity,
  AlertTriangle,
  ArrowUp,
  BarChart3,
  Bell,
  ChefHat,
  Command,
  CreditCard,
  DollarSign,
  FileText,
  Package,
  PieChart,
  Plus,
  Search,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
  Users
} from "lucide-react"
import * as React from "react"

// Force dynamic rendering to avoid SSR issues
export const dynamic = 'force-dynamic'

// Sample navigation items for demonstration
const navigationItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    href: "/dashboard",
    icon: BarChart3,
    description: "Overview of your business performance",
    keywords: ["overview", "summary", "kpi", "metrics"],
    category: "main"
  },
  {
    id: "ai-assistant",
    label: "AI Assistant",
    href: "/ai-assistant",
    icon: Sparkles,
    description: "World's first conversational ERP assistant - ChatGPT for business",
    keywords: ["ai", "assistant", "chat", "conversation", "help", "automation"],
    badge: "NEW",
    badgeVariant: "success" as const,
    category: "main"
  },
  {
    id: "transactions",
    label: "Transactions",
    href: "/transactions",
    icon: CreditCard,
    description: "Manage all financial transactions",
    keywords: ["payments", "invoices", "receipts"],
    badge: "23",
    badgeVariant: "warning" as const,
    category: "financial"
  },
  {
    id: "chart-of-accounts",
    label: "Chart of Accounts",
    href: "/finance/chart-of-accounts",
    icon: FileText,
    description: "Manage your chart of accounts",
    keywords: ["accounts", "ledger", "finance", "structure"],
    category: "financial"
  },
  {
    id: "journal-entries",
    label: "Journal Entries",
    href: "/finance/journal-entries",
    icon: FileText,
    description: "Create and manage journal entries with full ERP compliance",
    keywords: ["journal", "entries", "accounting", "debits", "credits", "posting"],
    category: "financial"
  },
  {
    id: "restaurant-order",
    label: "Restaurant Orders",
    href: "/restaurant/order",
    icon: ChefHat,
    description: "AI-powered restaurant order taking system with universal schema",
    keywords: ["restaurant", "menu", "orders", "food", "ai", "recommendations"],
    category: "hospitality"
  },
  {
    id: "clients",
    label: "Clients",
    href: "/clients",
    icon: Users,
    description: "Client relationship management with AI-powered insights",
    keywords: ["clients", "customers", "contacts", "crm", "business"],
    category: "sales"
  },
  {
    id: "inventory",
    label: "Inventory",
    href: "/inventory",
    icon: Package,
    description: "Stock and inventory management",
    keywords: ["stock", "products", "warehouse"],
    category: "operations"
  },
  {
    id: "reports",
    label: "Reports",
    href: "/reports",
    icon: FileText,
    description: "Financial and business reports",
    keywords: ["analytics", "statements", "analysis"],
    category: "analytics"
  },
  {
    id: "admin",
    label: "Admin Panel",
    href: "/admin",
    icon: Command,
    description: "System administration and UAT testing",
    keywords: ["admin", "system", "testing", "uat", "users", "management"],
    badge: "ADMIN",
    badgeVariant: "destructive" as const,
    category: "admin"
  }
]

const navigationCategories = [
  {
    id: "financial",
    label: "Financial",
    icon: DollarSign,
    items: navigationItems.filter(item => item.category === "financial")
  },
  {
    id: "sales",
    label: "Sales & CRM",
    icon: Target,
    items: navigationItems.filter(item => item.category === "sales")
  },
  {
    id: "operations",
    label: "Operations",
    icon: Activity,
    items: navigationItems.filter(item => item.category === "operations")
  },
  {
    id: "analytics",
    label: "Analytics",
    icon: PieChart,
    items: navigationItems.filter(item => item.category === "analytics")
  },
  {
    id: "hospitality",
    label: "Hospitality",
    icon: ChefHat,
    items: navigationItems.filter(item => item.category === "hospitality")
  },
  {
    id: "admin",
    label: "Administration",
    icon: Command,
    items: navigationItems.filter(item => item.category === "admin")
  }
]

// Sample data for demonstration
const dashboardData = {
  kpis: [
    {
      id: "revenue",
      title: "Revenue",
      value: "$47,392",
      change: "+12%",
      trend: "up" as const,
      description: "Monthly recurring revenue"
    },
    {
      id: "profit",
      title: "Profit Margin",
      value: "23.5%",
      change: "+2.1%",
      trend: "up" as const,
      description: "Net profit margin"
    },
    {
      id: "cashflow",
      title: "Cash Flow",
      value: "$12,847",
      change: "+5%",
      trend: "up" as const,
      description: "Operating cash flow"
    },
    {
      id: "outstanding",
      title: "Outstanding",
      value: "$8,245",
      change: "-3%",
      trend: "down" as const,
      description: "Accounts receivable"
    }
  ],
  
  recentTransactions: [
    {
      id: 1,
      type: "sale",
      customer: "Coffee Corner Cafe",
      amount: "$29.49",
      status: "completed",
      date: "2 hours ago"
    },
    {
      id: 2,
      type: "payment",
      customer: "Acme Consulting",
      amount: "$2,400.00",
      status: "completed",
      date: "4 hours ago"
    },
    {
      id: 3,
      type: "expense",
      customer: "Office Supplies Inc",
      amount: "$156.78",
      status: "pending",
      date: "6 hours ago"
    },
    {
      id: 4,
      type: "invoice",
      customer: "Tech Solutions Ltd",
      amount: "$850.00",
      status: "sent",
      date: "1 day ago"
    }
  ],

  pendingApprovals: [
    {
      id: 1,
      type: "expense",
      description: "Marketing campaign budget",
      amount: "$5,000",
      requestor: "Marketing Team",
      priority: "high"
    },
    {
      id: 2,
      type: "purchase",
      description: "New equipment purchase",
      amount: "$12,500",
      requestor: "Operations",
      priority: "medium"
    },
    {
      id: 3,
      type: "contract",
      description: "Vendor contract renewal",
      amount: "$3,200",
      requestor: "Procurement",
      priority: "low"
    }
  ],

  aiInsights: [
    {
      type: "opportunity",
      title: "Cash Flow Optimization",
      message: "Customer payment patterns suggest offering 2% early payment discount could improve cash flow by $2,300/month",
      confidence: 0.94
    },
    {
      type: "alert",
      title: "Expense Anomaly",
      message: "Unusual spike in office expenses detected - 340% above normal",
      confidence: 0.89
    },
    {
      type: "recommendation",
      title: "Inventory Planning",
      message: "Based on seasonal trends, increase inventory for top 3 products by 15%",
      confidence: 0.87
    }
  ]
}

// KPI Card Component
interface KPICardProps {
  kpi: typeof dashboardData.kpis[0]
  onClick?: () => void
}

function KPICard({ kpi, onClick }: KPICardProps) {
  const { getAdaptedColor } = useAdaptiveColor()
  const trendColor = kpi.trend === "up" ? getAdaptedColor("success") : getAdaptedColor("destructive")
  const TrendIcon = kpi.trend === "up" ? TrendingUp : TrendingDown

  return (
    <Card
      variant="glass"
      interaction="hover"
      className="p-6 cursor-pointer"
      onClick={onClick}
    >
      <motion.div
        className="space-y-4"
        whileHover={{ y: -2 }}
        transition={motionConfig.spring.swift}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-muted-foreground">{kpi.title}</h3>
          <motion.div
            className="flex items-center gap-1 text-sm"
            style={{ color: trendColor }}
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <TrendIcon className="w-4 h-4" />
            <span>{kpi.change}</span>
          </motion.div>
        </div>
        
        <div>
          <motion.div
            className="text-3xl font-bold text-foreground"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={motionConfig.spring.bounce}
          >
            {kpi.value}
          </motion.div>
          <p className="text-xs text-muted-foreground mt-1">{kpi.description}</p>
        </div>
      </motion.div>
    </Card>
  )
}

// Dashboard Header Component
function DashboardHeader() {
  const { getAdaptedColor } = useAdaptiveColor()
  const [commandPaletteOpen, setCommandPaletteOpen] = React.useState(false)
  const currentHour = new Date().getHours()
  const greeting = currentHour < 12 ? "Good morning" : currentHour < 18 ? "Good afternoon" : "Good evening"

  return (
    <motion.header
      className="flex items-center justify-between p-6 border-b border-border/50"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={motionConfig.spring.swift}
    >
      {/* Welcome Section */}
      <div className="space-y-2">
        <motion.h1
          className="text-2xl font-bold text-foreground"
          animate={{ opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          {greeting}, Sarah
        </motion.h1>
        <div className="flex items-center gap-2">
          <motion.p
            className="text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Your business is performing 12% above target
          </motion.p>
          <motion.div
            className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs flex items-center gap-1"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ ...motionConfig.spring.bounce, delay: 0.5 }}
          >
            <Sparkles className="w-3 h-3" />
            AI Insight
          </motion.div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex items-center gap-4">
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            interaction="magnetic"
          >
            Create Invoice
          </Button>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<CreditCard className="w-4 h-4" />}
            interaction="magnetic"
          >
            Record Payment
          </Button>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Users className="w-4 h-4" />}
            interaction="magnetic"
          >
            Add Customer
          </Button>
        </div>

        {/* Command Palette Trigger */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCommandPaletteOpen(true)}
          className="gap-2"
          leftIcon={<Command className="w-4 h-4" />}
        >
          <span className="hidden sm:inline">Command</span>
          <kbd className="px-2 py-1 bg-muted rounded text-xs">⌘K</kbd>
        </Button>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <motion.input
            type="text"
            placeholder="Search anything..."
            className="pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
            whileFocus={{ scale: 1.02 }}
            transition={motionConfig.spring.swift}
          />
        </div>

        {/* Notifications */}
        <motion.div
          className="relative"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="w-4 h-4" />
            <motion.span
              className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          </Button>
        </motion.div>
      </div>
    </motion.header>
  )
}

// Recent Transactions Component
function RecentTransactions() {
  return (
    <Card variant="glass" className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Recent Transactions</h3>
          <Button variant="ghost" size="sm" rightIcon={<ArrowUp className="w-4 h-4" />}>
            View All
          </Button>
        </div>
        
        <div className="space-y-3">
          {dashboardData.recentTransactions.map((transaction, index) => (
            <motion.div
              key={transaction.id}
              className="flex items-center justify-between p-3 hover:bg-muted/50 rounded-lg transition-colors"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ ...motionConfig.spring.swift, delay: index * 0.1 }}
              whileHover={{ x: 4 }}
            >
              <div className="flex items-center gap-3">
                <motion.div
                  className={cn(
                    "w-2 h-2 rounded-full",
                    transaction.status === "completed" && "bg-green-500",
                    transaction.status === "pending" && "bg-yellow-500",
                    transaction.status === "sent" && "bg-blue-500"
                  )}
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
                />
                <div>
                  <p className="font-medium text-sm">{transaction.customer}</p>
                  <p className="text-xs text-muted-foreground capitalize">{transaction.type} • {transaction.date}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold">{transaction.amount}</p>
                <p className="text-xs text-muted-foreground capitalize">{transaction.status}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </Card>
  )
}

// Pending Approvals Component
function PendingApprovals() {
  return (
    <Card variant="glass" className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Pending Approvals</h3>
          <div className="flex items-center gap-1 text-yellow-600">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-sm font-medium">{dashboardData.pendingApprovals.length}</span>
          </div>
        </div>
        
        <div className="space-y-3">
          {dashboardData.pendingApprovals.map((approval, index) => (
            <motion.div
              key={approval.id}
              className="p-3 border border-border/50 rounded-lg hover:border-primary/30 transition-colors"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...motionConfig.spring.swift, delay: index * 0.1 }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-sm">{approval.description}</span>
                <span className={cn(
                  "px-2 py-1 rounded-full text-xs",
                  approval.priority === "high" && "bg-red-100 text-red-800",
                  approval.priority === "medium" && "bg-yellow-100 text-yellow-800",
                  approval.priority === "low" && "bg-blue-100 text-blue-800"
                )}>
                  {approval.priority}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{approval.requestor}</span>
                <span className="font-semibold">{approval.amount}</span>
              </div>
              <div className="flex gap-2 mt-3">
                <Button variant="outline" size="sm" className="flex-1">
                  Review
                </Button>
                <Button variant="default" size="sm" className="flex-1">
                  Approve
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </Card>
  )
}

// AI Insights Component
function AIInsightsPanel() {
  return (
    <Card variant="glass" className="p-6">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          >
            <Sparkles className="w-5 h-5 text-yellow-500" />
          </motion.div>
          <h3 className="text-lg font-semibold">AI Insights</h3>
        </div>
        
        <div className="space-y-3">
          {dashboardData.aiInsights.map((insight, index) => (
            <motion.div
              key={index}
              className={cn(
                "p-3 rounded-lg border",
                insight.type === "opportunity" && "bg-blue-50 border-blue-200 text-blue-900",
                insight.type === "alert" && "bg-yellow-50 border-yellow-200 text-yellow-900",
                insight.type === "recommendation" && "bg-green-50 border-green-200 text-green-900"
              )}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ ...motionConfig.spring.bounce, delay: index * 0.2 }}
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium text-sm">{insight.title}</h4>
                <span className="text-xs bg-white/50 px-2 py-1 rounded">
                  {Math.round(insight.confidence * 100)}% confident
                </span>
              </div>
              <p className="text-sm leading-relaxed">{insight.message}</p>
              <Button variant="ghost" size="sm" className="mt-2 text-xs">
                Learn More
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </Card>
  )
}

// Main Dashboard Component
export default function DashboardPage() {
  const [commandPaletteOpen, setCommandPaletteOpen] = React.useState(false)
  const dashboardRef = React.useRef<HTMLDivElement>(null)

  // Keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setCommandPaletteOpen(true)
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [])

  // Gesture handlers
  const gestureHandlers = React.useMemo(() => ({
    onSwipeUp: () => {
      // Show command palette
      setCommandPaletteOpen(true)
    },
    onSwipeDown: () => {
      // Refresh dashboard
      safeWindow.location.reload()
    },
    onDoubleTap: () => {
      // Quick action
      console.log("Quick action triggered")
    }
  }), [])

  useGestures(dashboardRef, gestureHandlers, {
    enabledGestures: ["swipeUp", "swipeDown", "doubleTap"]
  })

  return (
    <NavigationProvider
      initialItems={navigationItems}
      initialCategories={navigationCategories}
      enableAI={true}
      enableAnalytics={true}
    >
      <div ref={dashboardRef} className="min-h-screen bg-background flex">
        {/* Revolutionary Sidebar */}
        <Sidebar
          enableGestures={true}
          enableAI={true}
          showLogo={true}
        />

        {/* Main Content Area */}
        <main className="flex-1 overflow-hidden">
          {/* Dashboard Header */}
          <DashboardHeader />

          {/* Breadcrumbs */}
          <div className="px-6 py-3 border-b border-border/50">
            <Breadcrumbs
              showHome={true}
              showBack={false}
              enableAI={true}
              showContextualInfo={true}
            />
          </div>

          {/* Dashboard Content */}
          <div className="p-6 space-y-6 overflow-y-auto h-[calc(100vh-180px)]">
            {/* KPI Cards Grid */}
            <motion.section
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={motionConfig.spring.swift}
            >
              {dashboardData.kpis.map((kpi, index) => (
                <motion.div
                  key={kpi.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ ...motionConfig.spring.swift, delay: index * 0.1 }}
                >
                  <KPICard kpi={kpi} />
                </motion.div>
              ))}
            </motion.section>

            {/* Charts Section */}
            <motion.section
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...motionConfig.spring.swift, delay: 0.5 }}
            >
              <Card variant="glass" className="p-6">
                <h3 className="text-lg font-semibold mb-4">Revenue Trend</h3>
                <div className="h-64 flex items-center justify-center bg-muted/20 rounded-lg">
                  <div className="text-center">
                    <BarChart3 className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">Revenue chart will be rendered here</p>
                  </div>
                </div>
              </Card>

              <Card variant="glass" className="p-6">
                <h3 className="text-lg font-semibold mb-4">Expense Breakdown</h3>
                <div className="h-64 flex items-center justify-center bg-muted/20 rounded-lg">
                  <div className="text-center">
                    <PieChart className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">Expense chart will be rendered here</p>
                  </div>
                </div>
              </Card>
            </motion.section>

            {/* Activity Section */}
            <motion.section
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...motionConfig.spring.swift, delay: 0.7 }}
            >
              <RecentTransactions />
              <PendingApprovals />
              <AIInsightsPanel />
            </motion.section>
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
    </NavigationProvider>
  )
}