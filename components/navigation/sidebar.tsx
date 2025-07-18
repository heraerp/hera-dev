"use client"

import * as React from "react"
import { motion, AnimatePresence, useSpring, useTransform } from "framer-motion"
import { 
  ChevronLeft, ChevronRight, Pin, PinOff, Search, Sparkles, 
  Menu, X, Lightbulb, TrendingUp, Clock, Star, MoreHorizontal,
  Home, Settings, Users, FileText, BarChart3, Zap
} from "lucide-react"
import { useNavigation, useNavigationAI } from "@/components/providers/navigation-provider"
import { useTheme } from "@/components/providers/theme-provider"
import { useAdaptiveColor } from "@/hooks/use-adaptive-color"
import { useGestures } from "@/hooks/use-gestures"
import { Button } from "@/components/ui/revolutionary-button"
import { Card } from "@/components/ui/revolutionary-card"
import { cn } from "@/lib/utils"
import motionConfig from "@/lib/motion"
import { NavigationItem, NavigationCategory } from "@/lib/navigation/types"

interface SidebarProps {
  className?: string
  showLogo?: boolean
  enableGestures?: boolean
  enableAI?: boolean
  customWidth?: number
}

export function Sidebar({
  className,
  showLogo = true,
  enableGestures = true,
  enableAI = true,
  customWidth = 280
}: SidebarProps) {
  const {
    items,
    categories,
    isCollapsed,
    isMobileOpen,
    mode,
    position,
    pinnedItems,
    recentItems,
    searchQuery,
    toggleCollapse,
    toggleMobile,
    navigate,
    search,
    pinItem,
    unpinItem,
    userPreferences
  } = useNavigation()

  const { predictions, insights, getRecommendations, dismissInsight } = useNavigationAI()
  const { getAdaptedColor, getColorForContext } = useAdaptiveColor()
  const { context: themeContext } = useTheme()

  // Local state
  const [hoveredItem, setHoveredItem] = React.useState<string | null>(null)
  const [expandedCategories, setExpandedCategories] = React.useState<Set<string>>(new Set())
  const [searchFocused, setSearchFocused] = React.useState(false)
  const [aiPanelOpen, setAiPanelOpen] = React.useState(false)
  
  // Refs
  const sidebarRef = React.useRef<HTMLDivElement>(null)
  const searchInputRef = React.useRef<HTMLInputElement>(null)

  // Animation values
  const sidebarWidth = useSpring(isCollapsed ? 64 : customWidth, motionConfig.spring.smooth)
  const contentOpacity = useTransform(sidebarWidth, [64, customWidth], [0, 1])

  // Gesture handlers
  const gestureHandlers = React.useMemo(() => ({
    onSwipeRight: () => {
      if (isCollapsed) toggleCollapse()
    },
    onSwipeLeft: () => {
      if (!isCollapsed) toggleCollapse()
    },
    onDoubleTap: () => {
      if (!isCollapsed && searchInputRef.current) {
        searchInputRef.current.focus()
      }
    },
    onLongPress: () => {
      setAiPanelOpen(!aiPanelOpen)
    }
  }), [isCollapsed, toggleCollapse, aiPanelOpen])

  useGestures(sidebarRef, gestureHandlers, {
    enabledGestures: enableGestures ? ["swipeLeft", "swipeRight", "doubleTap", "longPress"] : []
  })

  // Category expansion handler
  const toggleCategory = React.useCallback((categoryId: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev)
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId)
      } else {
        newSet.add(categoryId)
      }
      return newSet
    })
  }, [])

  // Get contextual color
  const contextualColor = React.useMemo(() => 
    getColorForContext(getAdaptedColor("primary"), themeContext)
  , [getAdaptedColor, getColorForContext, themeContext])

  // Render navigation item
  const renderNavigationItem = React.useCallback((item: NavigationItem, level = 0) => {
    const isActive = typeof window !== 'undefined' ? window.location.pathname === item.href : false
    const isPinned = pinnedItems.some(pinned => pinned.id === item.id)
    const prediction = predictions.find(p => p.itemId === item.id)
    const aiScore = prediction?.score || item.aiScore || 0

    return (
      <motion.div
        key={item.id}
        className={cn(
          "relative group",
          level > 0 && "ml-4"
        )}
        onHoverStart={() => setHoveredItem(item.id)}
        onHoverEnd={() => setHoveredItem(null)}
        whileHover={{ x: level === 0 ? 4 : 2 }}
        transition={motionConfig.spring.swift}
      >
        {/* Active indicator */}
        <AnimatePresence>
          {isActive && (
            <motion.div
              className="absolute left-0 top-0 bottom-0 w-1 rounded-r-full"
              style={{ backgroundColor: contextualColor }}
              initial={{ opacity: 0, scaleY: 0 }}
              animate={{ opacity: 1, scaleY: 1 }}
              exit={{ opacity: 0, scaleY: 0 }}
              transition={motionConfig.spring.bounce}
            />
          )}
        </AnimatePresence>

        {/* AI Prediction Glow */}
        <AnimatePresence>
          {enableAI && aiScore > 0.5 && !isCollapsed && (
            <motion.div
              className="absolute inset-0 rounded-lg bg-gradient-to-r from-transparent via-primary/10 to-transparent"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.5, 0] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          )}
        </AnimatePresence>

        <motion.button
          onClick={() => navigate(item.id)}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all relative",
            "hover:bg-background/50 focus:outline-none focus:ring-2 focus:ring-primary/20",
            isActive && "bg-primary/10 text-primary",
            !isActive && "text-foreground/80 hover:text-foreground",
            isCollapsed && "justify-center px-2"
          )}
          whileTap={{ scale: 0.98 }}
          transition={motionConfig.spring.swift}
        >
          {/* Icon */}
          {item.icon && (
            <motion.div
              className={cn(
                "flex-shrink-0 relative",
                isActive && "text-primary",
                aiScore > 0.7 && "text-yellow-500"
              )}
              animate={{
                scale: hoveredItem === item.id ? 1.1 : 1,
                rotate: aiScore > 0.8 ? [0, 5, -5, 0] : 0
              }}
              transition={motionConfig.spring.gentle}
            >
              <item.icon className="w-5 h-5" />
              
              {/* AI Prediction Indicator */}
              {enableAI && aiScore > 0.6 && (
                <motion.div
                  className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
              )}
            </motion.div>
          )}

          {/* Label and Details */}
          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <motion.div
                className="flex-1 min-w-0"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={motionConfig.spring.swift}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium truncate">{item.label}</span>
                  
                  {/* Badges and Actions */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {/* Badge */}
                    {item.badge && (
                      <motion.span
                        className={cn(
                          "px-2 py-0.5 text-xs rounded-full",
                          item.badgeVariant === "success" && "bg-green-100 text-green-800",
                          item.badgeVariant === "warning" && "bg-yellow-100 text-yellow-800",
                          item.badgeVariant === "error" && "bg-red-100 text-red-800",
                          !item.badgeVariant && "bg-muted text-muted-foreground"
                        )}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={motionConfig.spring.bounce}
                      >
                        {item.badge}
                      </motion.span>
                    )}

                    {/* Pin/Unpin */}
                    <motion.button
                      onClick={(e) => {
                        e.stopPropagation()
                        isPinned ? unpinItem(item.id) : pinItem(item.id)
                      }}
                      className="p-1 hover:bg-background/80 rounded"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      {isPinned ? (
                        <PinOff className="w-3 h-3" />
                      ) : (
                        <Pin className="w-3 h-3" />
                      )}
                    </motion.button>
                  </div>
                </div>

                {/* Description */}
                {item.description && hoveredItem === item.id && (
                  <motion.p
                    className="text-xs text-muted-foreground mt-1"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    {item.description}
                  </motion.p>
                )}

                {/* Keyboard Shortcut */}
                {item.shortcut && userPreferences.showShortcuts && (
                  <motion.div
                    className="flex items-center gap-1 mt-1 opacity-50"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.5 }}
                  >
                    {item.shortcut.map((key, index) => (
                      <React.Fragment key={key}>
                        {index > 0 && <span className="text-xs">+</span>}
                        <kbd className="px-1 py-0.5 text-xs bg-muted rounded">
                          {key}
                        </kbd>
                      </React.Fragment>
                    ))}
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>

        {/* Tooltip for collapsed state */}
        <AnimatePresence>
          {isCollapsed && hoveredItem === item.id && (
            <motion.div
              className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-3 py-2 bg-popover text-popover-foreground rounded-lg shadow-lg border z-50"
              initial={{ opacity: 0, x: -10, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -10, scale: 0.9 }}
              transition={motionConfig.spring.swift}
            >
              <div className="flex items-center gap-2">
                <span className="font-medium">{item.label}</span>
                {item.shortcut && (
                  <div className="flex items-center gap-1">
                    {item.shortcut.map((key, index) => (
                      <React.Fragment key={key}>
                        {index > 0 && <span className="text-xs">+</span>}
                        <kbd className="px-1 py-0.5 text-xs bg-muted rounded">
                          {key}
                        </kbd>
                      </React.Fragment>
                    ))}
                  </div>
                )}
              </div>
              {item.description && (
                <p className="text-xs text-muted-foreground mt-1">
                  {item.description}
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Children */}
        {item.children && item.children.length > 0 && !isCollapsed && (
          <AnimatePresence>
            <motion.div
              className="mt-1 space-y-1"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              {item.children.map(child => renderNavigationItem(child, level + 1))}
            </motion.div>
          </AnimatePresence>
        )}
      </motion.div>
    )
  }, [
    isCollapsed, pinnedItems, predictions, contextualColor, hoveredItem, 
    navigate, pinItem, unpinItem, userPreferences.showShortcuts, enableAI
  ])

  // Render category
  const renderCategory = React.useCallback((category: NavigationCategory) => {
    const isExpanded = expandedCategories.has(category.id)

    return (
      <motion.div
        key={category.id}
        className="space-y-2"
        layout
      >
        {/* Category Header */}
        <motion.button
          onClick={() => toggleCategory(category.id)}
          className={cn(
            "w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors",
            isCollapsed && "justify-center"
          )}
          whileHover={{ x: 2 }}
          transition={motionConfig.spring.swift}
        >
          <div className="flex items-center gap-2">
            {category.icon && <category.icon className="w-4 h-4" />}
            {!isCollapsed && <span>{category.label}</span>}
          </div>
          
          {!isCollapsed && (
            <motion.div
              animate={{ rotate: isExpanded ? 90 : 0 }}
              transition={motionConfig.spring.swift}
            >
              <ChevronRight className="w-4 h-4" />
            </motion.div>
          )}
        </motion.button>

        {/* Category Items */}
        <AnimatePresence>
          {(isExpanded || isCollapsed) && (
            <motion.div
              className="space-y-1"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              {category.items.map(item => renderNavigationItem(item))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    )
  }, [expandedCategories, isCollapsed, toggleCategory, renderNavigationItem])

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleMobile}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        ref={sidebarRef}
        className={cn(
          "fixed top-0 left-0 h-full bg-background/95 backdrop-blur-xl border-r border-border/50 z-50",
          "lg:relative lg:translate-x-0",
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          className
        )}
        style={{ width: sidebarWidth }}
        layout
      >
        {/* Header */}
        <div className="p-4 border-b border-border/50">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <AnimatePresence mode="wait">
              {showLogo && !isCollapsed && (
                <motion.div
                  className="flex items-center gap-3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={motionConfig.spring.swift}
                >
                  <motion.div
                    className="w-8 h-8 flex items-center justify-center"
                    animate={{
                      scale: [1, 1.05, 1]
                    }}
                    transition={{
                      scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                    }}
                  >
                    <img 
                      src="/icons/hera-logo.png" 
                      alt="HERA Logo" 
                      className="w-8 h-8 object-contain"
                    />
                  </motion.div>
                  <div>
                    <h1 className="text-lg font-bold">HERA</h1>
                    <p className="text-xs text-muted-foreground">Universal ERP</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Mobile Close / Desktop Collapse */}
            <div className="flex items-center gap-2">
              {/* AI Insights Toggle */}
              {enableAI && insights.length > 0 && !isCollapsed && (
                <motion.button
                  onClick={() => setAiPanelOpen(!aiPanelOpen)}
                  className={cn(
                    "p-2 rounded-lg transition-colors relative",
                    aiPanelOpen ? "bg-primary/20 text-primary" : "hover:bg-muted"
                  )}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Lightbulb className="w-4 h-4" />
                  <motion.span
                    className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                </motion.button>
              )}

              {/* Collapse Toggle */}
              <motion.button
                onClick={toggleCollapse}
                className="p-2 hover:bg-muted rounded-lg hidden lg:flex"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  animate={{ rotate: isCollapsed ? 180 : 0 }}
                  transition={motionConfig.spring.swift}
                >
                  <ChevronLeft className="w-4 h-4" />
                </motion.div>
              </motion.button>

              {/* Mobile Close */}
              <motion.button
                onClick={toggleMobile}
                className="p-2 hover:bg-muted rounded-lg lg:hidden"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <X className="w-4 h-4" />
              </motion.button>
            </div>
          </div>

          {/* Search */}
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                className="mt-4 relative"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <motion.input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search navigation..."
                  value={searchQuery}
                  onChange={(e) => search(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  className={cn(
                    "w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg",
                    "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50",
                    "placeholder:text-muted-foreground"
                  )}
                  whileFocus={{ scale: 1.02 }}
                  transition={motionConfig.spring.swift}
                />
                
                {/* Search Focus Glow */}
                <AnimatePresence>
                  {searchFocused && (
                    <motion.div
                      className="absolute inset-0 rounded-lg"
                      style={{
                        background: `linear-gradient(90deg, transparent, ${contextualColor}20, transparent)`
                      }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: [0, 1, 0] }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* AI Insights Panel */}
        <AnimatePresence>
          {enableAI && aiPanelOpen && !isCollapsed && insights.length > 0 && (
            <motion.div
              className="p-4 border-b border-border/50 bg-gradient-to-r from-primary/5 to-transparent"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-yellow-500" />
                AI Insights
              </h3>
              <div className="space-y-2">
                {insights.slice(0, 2).map(insight => (
                  <Card
                    key={insight.id}
                    variant="outline"
                    size="sm"
                    className="p-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="text-xs font-medium">{insight.title}</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          {insight.description}
                        </p>
                      </div>
                      <motion.button
                        onClick={() => dismissInsight(insight.id)}
                        className="p-1 hover:bg-muted rounded"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <X className="w-3 h-3" />
                      </motion.button>
                    </div>
                  </Card>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Pinned Items */}
          <AnimatePresence>
            {pinnedItems.length > 0 && !isCollapsed && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                <h3 className="text-xs font-medium text-muted-foreground mb-3 flex items-center gap-2">
                  <Star className="w-3 h-3" />
                  Pinned
                </h3>
                <div className="space-y-1">
                  {pinnedItems.map(item => renderNavigationItem(item))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* AI Recommendations */}
          <AnimatePresence>
            {enableAI && predictions.length > 0 && !isCollapsed && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                <h3 className="text-xs font-medium text-muted-foreground mb-3 flex items-center gap-2">
                  <TrendingUp className="w-3 h-3" />
                  Recommended
                </h3>
                <div className="space-y-1">
                  {getRecommendations().slice(0, 3).map(prediction => {
                    const item = items.find(item => item.id === prediction.itemId)
                    return item ? renderNavigationItem(item) : null
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Recent Items */}
          <AnimatePresence>
            {recentItems.length > 0 && !isCollapsed && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                <h3 className="text-xs font-medium text-muted-foreground mb-3 flex items-center gap-2">
                  <Clock className="w-3 h-3" />
                  Recent
                </h3>
                <div className="space-y-1">
                  {recentItems.slice(0, 3).map(item => renderNavigationItem(item))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Categories */}
          <div className="space-y-6">
            {categories.map(category => renderCategory(category))}
          </div>

          {/* Individual Items (not in categories) */}
          <div className="space-y-1">
            {items
              .filter(item => !categories.some(cat => cat.items.some(catItem => catItem.id === item.id)))
              .map(item => renderNavigationItem(item))
            }
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border/50">
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                className="space-y-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {/* Quick Actions */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1"
                    leftIcon={<Settings className="w-4 h-4" />}
                  >
                    Settings
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1"
                    leftIcon={<Zap className="w-4 h-4" />}
                  >
                    Shortcuts
                  </Button>
                </div>

                {/* Status */}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>HERA Universal v2.1</span>
                  <motion.div
                    className="w-2 h-2 bg-green-500 rounded-full"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.aside>
    </>
  )
}