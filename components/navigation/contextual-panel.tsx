"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Lightbulb, TrendingUp, Clock, Star, AlertTriangle, Info, 
  CheckCircle, X, Pin, PinOff, ExternalLink, ChevronRight,
  Sparkles, Brain, Zap, BarChart3, Users, FileText, Settings,
  ArrowUp, ArrowDown, Minus, Eye, EyeOff
} from "lucide-react"
import { useNavigationAI, useNavigation } from "@/components/providers/navigation-provider"
import { useTheme } from "@/components/providers/theme-provider"
import { useAdaptiveColor } from "@/hooks/use-adaptive-color"
import { Button } from "@/components/ui/revolutionary-button"
import { Card } from "@/components/ui/revolutionary-card"
import { cn } from "@/lib/utils"
import motionConfig from "@/lib/motion"
import { NavigationInsight, NavigationPrediction } from "@/lib/navigation/types"

interface ContextualPanelProps {
  className?: string
  position?: "left" | "right" | "top" | "bottom"
  enablePersistence?: boolean
  maxInsights?: number
  maxPredictions?: number
  enableAnalytics?: boolean
  showQuickActions?: boolean
}

interface PanelSection {
  id: string
  title: string
  icon: React.ElementType
  items: (NavigationInsight | NavigationPrediction | any)[]
  type: "insights" | "predictions" | "analytics" | "actions"
  priority?: number
}

export function ContextualPanel({
  className,
  position = "right",
  enablePersistence = true,
  maxInsights = 5,
  maxPredictions = 3,
  enableAnalytics = true,
  showQuickActions = true
}: ContextualPanelProps) {
  const { predictions, insights, dismissInsight, trackInteraction } = useNavigationAI()
  const { 
    currentPath, 
    recentItems, 
    pinnedItems, 
    userPreferences,
    navigate,
    pinItem,
    unpinItem
  } = useNavigation()
  const { getAdaptedColor, getColorForContext } = useAdaptiveColor()
  const { context: themeContext } = useTheme()

  // Local state
  const [isExpanded, setIsExpanded] = React.useState(true)
  const [isPinned, setIsPinned] = React.useState(enablePersistence)
  const [collapsedSections, setCollapsedSections] = React.useState<Set<string>>(new Set())
  const [contextualData, setContextualData] = React.useState<any>(null)
  const [analyticsData, setAnalyticsData] = React.useState<any>(null)

  // Generate contextual sections
  const sections = React.useMemo((): PanelSection[] => {
    const sectionList: PanelSection[] = []

    // AI Insights Section
    if (insights.length > 0) {
      sectionList.push({
        id: "insights",
        title: "AI Insights",
        icon: Lightbulb,
        items: insights.slice(0, maxInsights),
        type: "insights",
        priority: 1
      })
    }

    // AI Predictions Section
    if (predictions.length > 0) {
      sectionList.push({
        id: "predictions",
        title: "Recommended Actions",
        icon: TrendingUp,
        items: predictions.slice(0, maxPredictions),
        type: "predictions",
        priority: 2
      })
    }

    // Analytics Section
    if (enableAnalytics && analyticsData) {
      sectionList.push({
        id: "analytics",
        title: "Quick Stats",
        icon: BarChart3,
        items: analyticsData.metrics || [],
        type: "analytics",
        priority: 3
      })
    }

    // Quick Actions Section
    if (showQuickActions) {
      const quickActions = generateQuickActions(currentPath, recentItems)
      if (quickActions.length > 0) {
        sectionList.push({
          id: "actions",
          title: "Quick Actions",
          icon: Zap,
          items: quickActions,
          type: "actions",
          priority: 4
        })
      }
    }

    return sectionList.sort((a, b) => (a.priority || 0) - (b.priority || 0))
  }, [insights, predictions, analyticsData, currentPath, recentItems, maxInsights, maxPredictions, enableAnalytics, showQuickActions])

  // Load contextual data based on current path
  React.useEffect(() => {
    const loadContextualData = async () => {
      // Simulate loading contextual data
      const data = await generateContextualData(currentPath, themeContext)
      setContextualData(data)
    }

    loadContextualData()
  }, [currentPath, themeContext])

  // Load analytics data
  React.useEffect(() => {
    if (!enableAnalytics) return

    const loadAnalytics = async () => {
      // Simulate analytics data loading
      const data = await generateAnalyticsData(currentPath)
      setAnalyticsData(data)
    }

    loadAnalytics()
  }, [currentPath, enableAnalytics])

  // Toggle section collapse
  const toggleSection = React.useCallback((sectionId: string) => {
    setCollapsedSections(prev => {
      const newSet = new Set(prev)
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId)
      } else {
        newSet.add(sectionId)
      }
      return newSet
    })
  }, [])

  // Handle insight action
  const handleInsightAction = React.useCallback((insight: NavigationInsight) => {
    if (insight.action?.href) {
      navigate(insight.action.href)
    } else if (insight.action?.onClick) {
      insight.action.onClick()
    }

    trackInteraction({
      itemId: insight.id,
      action: "click",
      context: themeContext as any
    })
  }, [navigate, trackInteraction, themeContext])

  // Handle prediction action
  const handlePredictionAction = React.useCallback((prediction: NavigationPrediction) => {
    navigate(prediction.itemId)
    
    trackInteraction({
      itemId: prediction.itemId,
      action: "click",
      context: themeContext as any
    })
  }, [navigate, trackInteraction, themeContext])

  // Get contextual colors
  const contextualColor = React.useMemo(() => 
    getColorForContext(getAdaptedColor("primary"), themeContext)
  , [getAdaptedColor, getColorForContext, themeContext])

  // Render insight item
  const renderInsightItem = React.useCallback((insight: NavigationInsight, index: number) => {
    const IconComponent = getInsightIcon(insight.type)
    const colorClass = getInsightColor(insight.type)

    return (
      <motion.div
        key={insight.id}
        className={cn(
          "p-3 rounded-lg border transition-all cursor-pointer",
          colorClass,
          "hover:shadow-md hover:scale-[1.02]"
        )}
        onClick={() => handleInsightAction(insight)}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ ...motionConfig.spring.swift, delay: index * 0.1 }}
        layout
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <motion.div
              className="flex-shrink-0 mt-0.5"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: index * 0.5 }}
            >
              <IconComponent className="w-4 h-4" />
            </motion.div>
            
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm mb-1">{insight.title}</h4>
              <p className="text-xs text-muted-foreground line-clamp-2">
                {insight.description}
              </p>
              
              {insight.action && (
                <motion.div
                  className="mt-2 flex items-center gap-1 text-xs font-medium opacity-70"
                  whileHover={{ opacity: 1, x: 2 }}
                >
                  <span>{insight.action.label}</span>
                  <ChevronRight className="w-3 h-3" />
                </motion.div>
              )}
            </div>
          </div>

          <motion.button
            onClick={(e) => {
              e.stopPropagation()
              dismissInsight(insight.id)
            }}
            className="p-1 hover:bg-background/80 rounded opacity-0 group-hover:opacity-100 transition-opacity"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <X className="w-3 h-3" />
          </motion.button>
        </div>
      </motion.div>
    )
  }, [handleInsightAction, dismissInsight])

  // Render prediction item
  const renderPredictionItem = React.useCallback((prediction: NavigationPrediction, index: number) => {
    const confidenceWidth = Math.round(prediction.confidence * 100)

    return (
      <motion.div
        key={prediction.itemId}
        className="p-3 rounded-lg border border-border/50 hover:border-primary/30 transition-all cursor-pointer group"
        onClick={() => handlePredictionAction(prediction)}
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -10 }}
        transition={{ ...motionConfig.spring.swift, delay: index * 0.1 }}
        layout
      >
        <div className="flex items-center justify-between mb-2">
          <span className="font-medium text-sm truncate">{prediction.itemId}</span>
          <div className="flex items-center gap-2">
            <motion.div
              className="w-2 h-2 bg-yellow-400 rounded-full"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity, delay: index * 0.3 }}
            />
            <span className="text-xs text-muted-foreground">
              {Math.round(prediction.score * 100)}%
            </span>
          </div>
        </div>

        <p className="text-xs text-muted-foreground mb-2">{prediction.reason}</p>

        {/* Confidence Bar */}
        <div className="w-full bg-muted rounded-full h-1 mb-2">
          <motion.div
            className="h-1 rounded-full bg-gradient-to-r from-yellow-400 to-green-500"
            initial={{ width: 0 }}
            animate={{ width: `${confidenceWidth}%` }}
            transition={motionConfig.spring.smooth}
          />
        </div>

        {/* Context Factors */}
        {prediction.contextFactors.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {prediction.contextFactors.slice(0, 2).map(factor => (
              <span
                key={factor}
                className="px-2 py-0.5 bg-muted text-muted-foreground rounded-full text-xs"
              >
                {formatContextFactor(factor)}
              </span>
            ))}
          </div>
        )}
      </motion.div>
    )
  }, [handlePredictionAction])

  // Render section
  const renderSection = React.useCallback((section: PanelSection) => {
    const isCollapsed = collapsedSections.has(section.id)
    const IconComponent = section.icon

    return (
      <motion.div
        key={section.id}
        className="space-y-3"
        layout
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Section Header */}
        <motion.button
          onClick={() => toggleSection(section.id)}
          className="w-full flex items-center justify-between p-2 hover:bg-muted/50 rounded-lg transition-colors"
          whileHover={{ x: 2 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center gap-2">
            <IconComponent className="w-4 h-4" style={{ color: contextualColor }} />
            <span className="font-medium text-sm">{section.title}</span>
            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              {section.items.length}
            </span>
          </div>
          
          <motion.div
            animate={{ rotate: isCollapsed ? 0 : 90 }}
            transition={motionConfig.spring.swift}
          >
            <ChevronRight className="w-4 h-4" />
          </motion.div>
        </motion.button>

        {/* Section Content */}
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              className="space-y-2 pl-2"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={motionConfig.spring.smooth}
            >
              {section.type === "insights" && section.items.map((item, index) => 
                renderInsightItem(item as NavigationInsight, index)
              )}
              
              {section.type === "predictions" && section.items.map((item, index) => 
                renderPredictionItem(item as NavigationPrediction, index)
              )}
              
              {section.type === "analytics" && (
                <div className="grid grid-cols-2 gap-2">
                  {section.items.map((metric: any, index) => (
                    <Card
                      key={metric.id}
                      variant="outline"
                      size="sm"
                      className="p-3 text-center"
                    >
                      <div className="text-lg font-bold" style={{ color: contextualColor }}>
                        {metric.value}
                      </div>
                      <div className="text-xs text-muted-foreground">{metric.label}</div>
                    </Card>
                  ))}
                </div>
              )}
              
              {section.type === "actions" && (
                <div className="space-y-1">
                  {section.items.map((action: any, index) => (
                    <Button
                      key={action.id}
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start"
                      leftIcon={<action.icon className="w-4 h-4" />}
                      onClick={action.onClick}
                    >
                      {action.label}
                    </Button>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    )
  }, [collapsedSections, toggleSection, contextualColor, renderInsightItem, renderPredictionItem])

  if (!isExpanded && !isPinned) return null

  return (
    <motion.aside
      className={cn(
        "fixed z-40 bg-background/95 backdrop-blur-xl border border-border/50 rounded-lg shadow-lg",
        position === "right" && "top-20 right-4 w-80",
        position === "left" && "top-20 left-4 w-80",
        position === "top" && "top-4 left-1/2 -translate-x-1/2 w-96",
        position === "bottom" && "bottom-4 left-1/2 -translate-x-1/2 w-96",
        className
      )}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={motionConfig.spring.swift}
      layout
    >
      {/* Header */}
      <div className="p-4 border-b border-border/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          >
            <Brain className="w-5 h-5" style={{ color: contextualColor }} />
          </motion.div>
          <h3 className="font-semibold">AI Assistant</h3>
        </div>
        
        <div className="flex items-center gap-2">
          <motion.button
            onClick={() => setIsPinned(!isPinned)}
            className={cn(
              "p-1 rounded hover:bg-muted transition-colors",
              isPinned && "text-primary"
            )}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {isPinned ? <Pin className="w-4 h-4" /> : <PinOff className="w-4 h-4" />}
          </motion.button>
          
          <motion.button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded hover:bg-muted transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {isExpanded ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </motion.button>
        </div>
      </div>

      {/* Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className="p-4 space-y-6 max-h-[60vh] overflow-y-auto"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={motionConfig.spring.smooth}
          >
            {sections.length > 0 ? (
              sections.map(section => renderSection(section))
            ) : (
              <motion.div
                className="text-center py-8 text-muted-foreground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <Sparkles className="w-8 h-8 mx-auto mb-4 opacity-50" />
                <p>No insights available</p>
                <p className="text-sm mt-1">Continue using HERA to get AI-powered suggestions</p>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.aside>
  )
}

// Helper functions
function getInsightIcon(type: NavigationInsight["type"]) {
  const icons = {
    suggestion: Lightbulb,
    warning: AlertTriangle,
    info: Info,
    success: CheckCircle
  }
  return icons[type] || Info
}

function getInsightColor(type: NavigationInsight["type"]) {
  const colors = {
    suggestion: "bg-blue-50 border-blue-200 text-blue-900",
    warning: "bg-yellow-50 border-yellow-200 text-yellow-900",
    info: "bg-gray-50 border-gray-200 text-gray-900",
    success: "bg-green-50 border-green-200 text-green-900"
  }
  return colors[type] || colors.info
}

function formatContextFactor(factor: string): string {
  return factor
    .replace(/_/g, " ")
    .replace(/\b\w/g, l => l.toUpperCase())
}

async function generateContextualData(currentPath: string, context: string) {
  // Simulate contextual data generation
  return {
    pageType: currentPath.includes("dashboard") ? "dashboard" : "page",
    context,
    lastUpdated: new Date(),
    relevantFeatures: ["ai-insights", "quick-actions", "analytics"]
  }
}

async function generateAnalyticsData(currentPath: string) {
  // Simulate analytics data
  return {
    metrics: [
      { id: "visits", label: "Page Visits", value: "1.2k" },
      { id: "time", label: "Avg. Time", value: "3m 45s" },
      { id: "actions", label: "Actions", value: "28" },
      { id: "efficiency", label: "Efficiency", value: "94%" }
    ]
  }
}

function generateQuickActions(currentPath: string, recentItems: any[]) {
  const actions = []

  // Context-specific actions
  if (currentPath.includes("dashboard")) {
    actions.push(
      { id: "refresh", label: "Refresh Data", icon: TrendingUp, onClick: () => console.log("Refresh") },
      { id: "export", label: "Export Report", icon: FileText, onClick: () => console.log("Export") }
    )
  }

  if (currentPath.includes("settings")) {
    actions.push(
      { id: "backup", label: "Backup Settings", icon: Settings, onClick: () => console.log("Backup") },
      { id: "reset", label: "Reset to Default", icon: Minus, onClick: () => console.log("Reset") }
    )
  }

  // Always include
  actions.push(
    { id: "help", label: "Get Help", icon: Info, onClick: () => console.log("Help") },
    { id: "feedback", label: "Send Feedback", icon: ExternalLink, onClick: () => console.log("Feedback") }
  )

  return actions
}