"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronRight, Home, MoreHorizontal, ArrowLeft, Sparkles, TrendingUp } from "lucide-react"
import { useNavigation, useNavigationAI } from "@/components/providers/navigation-provider"
import { useTheme } from "@/components/providers/theme-provider"
import { useAdaptiveColor } from "@/hooks/use-adaptive-color"
import { Button } from "@/components/ui/revolutionary-button"
import { cn } from "@/lib/utils"
import motionConfig from "@/lib/motion"
import { BreadcrumbItem } from "@/lib/navigation/types"

interface BreadcrumbsProps {
  className?: string
  showHome?: boolean
  showBack?: boolean
  maxItems?: number
  enableAI?: boolean
  enableGestures?: boolean
  showContextualInfo?: boolean
}

export function Breadcrumbs({
  className,
  showHome = true,
  showBack = true,
  maxItems = 4,
  enableAI = true,
  enableGestures = true,
  showContextualInfo = true
}: BreadcrumbsProps) {
  const { currentPath, navigate, items } = useNavigation()
  const { predictions, insights } = useNavigationAI()
  const { getAdaptedColor, getColorForContext } = useAdaptiveColor()
  const { context: themeContext } = useTheme()

  // Local state
  const [breadcrumbItems, setBreadcrumbItems] = React.useState<BreadcrumbItem[]>([])
  const [hoveredItem, setHoveredItem] = React.useState<string | null>(null)
  const [showCollapsed, setShowCollapsed] = React.useState(false)

  // Generate breadcrumb items from current path
  React.useEffect(() => {
    const pathSegments = currentPath.split("/").filter(Boolean)
    const breadcrumbs: BreadcrumbItem[] = []

    // Add home if enabled
    if (showHome) {
      breadcrumbs.push({
        id: "home",
        label: "Home",
        href: "/",
        icon: Home,
        isActive: currentPath === "/"
      })
    }

    // Generate breadcrumbs from path segments
    pathSegments.forEach((segment, index) => {
      const href = "/" + pathSegments.slice(0, index + 1).join("/")
      const isActive = index === pathSegments.length - 1
      
      // Find matching navigation item for better labeling
      const navItem = items.find(item => item.href === href)
      
      // Generate contextual info based on AI insights
      let contextualInfo: string | undefined
      if (enableAI && showContextualInfo) {
        const prediction = predictions.find(p => p.itemId === (navItem?.id || segment))
        if (prediction && prediction.score > 0.5) {
          contextualInfo = "AI: Recommended"
        }
        
        const insight = insights.find(i => i.relatedItemIds?.includes(navItem?.id || segment))
        if (insight) {
          contextualInfo = insight.type === "suggestion" ? "New feature!" : contextualInfo
        }
      }

      breadcrumbs.push({
        id: segment,
        label: navItem?.label || formatSegmentLabel(segment),
        href: isActive ? undefined : href,
        icon: navItem?.icon,
        isActive,
        isDynamic: Boolean(navItem?.contextualData),
        contextualInfo
      })
    })

    // Handle collapsed state if too many items
    if (breadcrumbs.length > maxItems) {
      setShowCollapsed(true)
      const visibleItems = [
        breadcrumbs[0], // First item (usually Home)
        ...breadcrumbs.slice(-2) // Last 2 items
      ]
      setBreadcrumbItems(visibleItems)
    } else {
      setShowCollapsed(false)
      setBreadcrumbItems(breadcrumbs)
    }
  }, [currentPath, items, maxItems, showHome, predictions, insights, enableAI, showContextualInfo])

  // Handle navigation
  const handleNavigate = React.useCallback((item: BreadcrumbItem) => {
    if (item.href) {
      navigate(item.id)
    }
  }, [navigate])

  // Handle back navigation
  const handleBack = React.useCallback(() => {
    if (typeof window !== "undefined") {
      window.history.back()
    }
  }, [])

  // Get contextual color
  const contextualColor = React.useMemo(() => 
    getColorForContext(getAdaptedColor("primary"), themeContext)
  , [getAdaptedColor, getColorForContext, themeContext])

  // Render breadcrumb item
  const renderBreadcrumbItem = React.useCallback((item: BreadcrumbItem, index: number) => {
    const isLast = index === breadcrumbItems.length - 1
    const isHovered = hoveredItem === item.id

    return (
      <React.Fragment key={item.id}>
        <motion.div
          className="flex items-center gap-2"
          onHoverStart={() => setHoveredItem(item.id)}
          onHoverEnd={() => setHoveredItem(null)}
        >
          {/* Breadcrumb Item */}
          <motion.div
            className={cn(
              "relative flex items-center gap-2 rounded-lg transition-all",
              item.isActive 
                ? "text-foreground font-medium" 
                : "text-muted-foreground hover:text-foreground",
              item.href && "cursor-pointer",
              !item.href && "cursor-default"
            )}
            onClick={() => item.href && handleNavigate(item)}
            whileHover={item.href ? { x: 2, scale: 1.02 } : {}}
            whileTap={item.href ? { scale: 0.98 } : {}}
            transition={motionConfig.spring.swift}
          >
            {/* AI Glow Effect */}
            <AnimatePresence>
              {enableAI && item.contextualInfo?.includes("AI") && (
                <motion.div
                  className="absolute inset-0 rounded-lg bg-gradient-to-r from-transparent via-yellow-400/20 to-transparent"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 0.5, 0] }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}
            </AnimatePresence>

            {/* Icon */}
            {item.icon && (
              <motion.div
                className={cn(
                  "flex-shrink-0",
                  item.isActive && "text-primary"
                )}
                animate={{
                  scale: isHovered ? 1.1 : 1,
                  rotate: item.isDynamic ? [0, 5, -5, 0] : 0
                }}
                transition={motionConfig.spring.gentle}
              >
                <item.icon className="w-4 h-4" />
              </motion.div>
            )}

            {/* Label */}
            <motion.span
              className="relative"
              animate={{ color: item.isActive ? contextualColor : undefined }}
            >
              {item.label}
              
              {/* Active Indicator */}
              <AnimatePresence>
                {item.isActive && (
                  <motion.div
                    className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full"
                    style={{ backgroundColor: contextualColor }}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    exit={{ scaleX: 0 }}
                    transition={motionConfig.spring.bounce}
                  />
                )}
              </AnimatePresence>
            </motion.span>

            {/* Contextual Info Badge */}
            <AnimatePresence>
              {item.contextualInfo && isHovered && (
                <motion.div
                  className={cn(
                    "absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 rounded text-xs whitespace-nowrap z-10",
                    item.contextualInfo.includes("AI") 
                      ? "bg-yellow-100 text-yellow-800" 
                      : item.contextualInfo.includes("New")
                      ? "bg-blue-100 text-blue-800"
                      : "bg-muted text-muted-foreground"
                  )}
                  initial={{ opacity: 0, y: 5, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 5, scale: 0.9 }}
                  transition={motionConfig.spring.swift}
                >
                  {item.contextualInfo}
                  {item.contextualInfo.includes("AI") && (
                    <Sparkles className="w-3 h-3 inline ml-1" />
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Separator */}
          {!isLast && (
            <motion.div
              className="text-muted-foreground"
              animate={{ 
                x: isHovered ? 2 : 0,
                opacity: isHovered ? 0.8 : 0.5
              }}
              transition={motionConfig.spring.swift}
            >
              <ChevronRight className="w-4 h-4" />
            </motion.div>
          )}
        </motion.div>
      </React.Fragment>
    )
  }, [breadcrumbItems.length, hoveredItem, handleNavigate, contextualColor, enableAI])

  // Render collapsed indicator
  const renderCollapsedIndicator = React.useCallback(() => {
    if (!showCollapsed) return null

    return (
      <motion.div
        className="flex items-center gap-2"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={motionConfig.spring.swift}
      >
        <motion.button
          className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          onClick={() => setShowCollapsed(false)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          title="Show all breadcrumbs"
        >
          <MoreHorizontal className="w-4 h-4" />
        </motion.button>
        
        <ChevronRight className="w-4 h-4 text-muted-foreground opacity-50" />
      </motion.div>
    )
  }, [showCollapsed])

  return (
    <nav className={cn("flex items-center gap-2", className)} aria-label="Breadcrumb">
      {/* Back Button */}
      <AnimatePresence>
        {showBack && breadcrumbItems.length > 1 && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={motionConfig.spring.swift}
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="p-2 hover:bg-muted"
              leftIcon={<ArrowLeft className="w-4 h-4" />}
            >
              <span className="sr-only">Go back</span>
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Breadcrumb Items */}
      <motion.ol 
        className="flex items-center gap-2"
        layout
        transition={motionConfig.spring.smooth}
      >
        {/* Render first item if collapsed */}
        {showCollapsed && breadcrumbItems[0] && (
          <motion.li layout>
            {renderBreadcrumbItem(breadcrumbItems[0], 0)}
            <ChevronRight className="w-4 h-4 text-muted-foreground opacity-50 ml-2" />
          </motion.li>
        )}

        {/* Collapsed indicator */}
        {showCollapsed && (
          <motion.li layout>
            {renderCollapsedIndicator()}
          </motion.li>
        )}

        {/* Render remaining items */}
        <AnimatePresence mode="wait">
          {breadcrumbItems
            .slice(showCollapsed ? 1 : 0)
            .map((item, index) => (
              <motion.li
                key={item.id}
                layout
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={motionConfig.spring.swift}
              >
                {renderBreadcrumbItem(item, (showCollapsed ? 1 : 0) + index)}
              </motion.li>
            ))}
        </AnimatePresence>
      </motion.ol>

      {/* AI Insights Badge */}
      <AnimatePresence>
        {enableAI && predictions.length > 0 && (
          <motion.div
            className="ml-4 flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={motionConfig.spring.bounce}
          >
            <TrendingUp className="w-3 h-3" />
            <span>{predictions.length} AI suggestions</span>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}

// Helper functions
function formatSegmentLabel(segment: string): string {
  return segment
    .split("-")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

// Hook for breadcrumb functionality
export function useBreadcrumbs() {
  const { currentPath, navigate, items } = useNavigation()

  const getBreadcrumbItems = React.useCallback((): BreadcrumbItem[] => {
    const pathSegments = currentPath.split("/").filter(Boolean)
    const breadcrumbs: BreadcrumbItem[] = []

    // Add home
    breadcrumbs.push({
      id: "home",
      label: "Home",
      href: "/",
      icon: Home,
      isActive: currentPath === "/"
    })

    // Generate from path
    pathSegments.forEach((segment, index) => {
      const href = "/" + pathSegments.slice(0, index + 1).join("/")
      const isActive = index === pathSegments.length - 1
      const navItem = items.find(item => item.href === href)

      breadcrumbs.push({
        id: segment,
        label: navItem?.label || formatSegmentLabel(segment),
        href: isActive ? undefined : href,
        icon: navItem?.icon,
        isActive,
        isDynamic: Boolean(navItem?.contextualData)
      })
    })

    return breadcrumbs
  }, [currentPath, items])

  return {
    items: getBreadcrumbItems(),
    navigate: (itemId: string) => {
      const item = getBreadcrumbItems().find(b => b.id === itemId)
      if (item?.href) {
        navigate(itemId)
      }
    }
  }
}