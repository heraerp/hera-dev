/**
 * HERA AI Assistant Page
 * World's First ChatGPT-Style Business Operations Assistant
 */

"use client"

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Brain, Sparkles, MessageSquare, TrendingUp, Zap, 
  Settings, Maximize2, Minimize2, Volume2, VolumeX,
  BarChart3, FileText, DollarSign, Users, Package,
  Activity, Clock, Star, Filter, Download, Share2
} from 'lucide-react'
import { ConversationInterface } from '@/components/conversation/ConversationInterface'
import { useConversationStore, useConversationAnalytics, useConversationNotifications } from '@/stores/conversationStore'
import { ClientOnlyConversation } from '@/components/ClientOnlyConversation'
import { Card } from '@/components/ui/revolutionary-card'
import { Button } from '@/components/ui/revolutionary-button'
import { cn } from '@/lib/utils'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

// ================================================================================================
// MAIN AI ASSISTANT PAGE
// ================================================================================================

export default function AIAssistantPage() {
  return (
    <ClientOnlyConversation>
      <AIAssistantContent />
    </ClientOnlyConversation>
  )
}

function AIAssistantContent() {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showSidebar, setShowSidebar] = useState(true)
  const [soundEnabled, setSoundEnabled] = useState(true)
  
  const analytics = useConversationAnalytics()
  const { notifications, removeNotification } = useConversationNotifications()

  // Handle fullscreen toggle
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
    if (!isFullscreen) {
      setShowSidebar(false)
    } else {
      setShowSidebar(true)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-blue-950 dark:to-indigo-950">
      {/* Header */}
      <AIAssistantHeader 
        isFullscreen={isFullscreen}
        toggleFullscreen={toggleFullscreen}
        showSidebar={showSidebar}
        setShowSidebar={setShowSidebar}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
      />

      {/* Main Content */}
      <div className="flex h-[calc(100vh-80px)]">
        {/* Sidebar */}
        <AnimatePresence>
          {showSidebar && !isFullscreen && (
            <motion.aside
              className="w-80 glass-moderate border-r border-border"
              initial={{ opacity: 0, x: -320 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -320 }}
              transition={{ duration: 0.3 }}
            >
              <ConversationSidebar analytics={analytics} />
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main Chat Interface */}
        <main className="flex-1 flex flex-col">
          <ConversationInterface 
            className="flex-1"
            compactMode={isFullscreen}
            enableVoice={true}
            enableFileUpload={true}
            enableCamera={true}
          />
        </main>

        {/* Right Panel - Business Insights */}
        <AnimatePresence>
          {showSidebar && !isFullscreen && (
            <motion.aside
              className="w-80 glass-moderate border-l border-border"
              initial={{ opacity: 0, x: 320 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 320 }}
              transition={{ duration: 0.3 }}
            >
              <BusinessInsightsPanel />
            </motion.aside>
          )}
        </AnimatePresence>
      </div>

      {/* Notifications */}
      <NotificationContainer 
        notifications={notifications}
        onRemove={removeNotification}
      />
    </div>
  )
}

// ================================================================================================
// AI ASSISTANT HEADER
// ================================================================================================

interface AIAssistantHeaderProps {
  isFullscreen: boolean
  toggleFullscreen: () => void
  showSidebar: boolean
  setShowSidebar: (show: boolean) => void
  soundEnabled: boolean
  setSoundEnabled: (enabled: boolean) => void
}

function AIAssistantHeader({
  isFullscreen,
  toggleFullscreen,
  showSidebar,
  setShowSidebar,
  soundEnabled,
  setSoundEnabled
}: AIAssistantHeaderProps) {
  return (
    <motion.header
      className="h-20 glass-subtle border-b border-border px-6 flex items-center justify-between"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Logo and Title */}
      <div className="flex items-center space-x-4">
        <motion.div
          className="w-12 h-12 bg-gradient-to-r from-blue-500 via-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg"
          animate={{
            boxShadow: [
              '0 0 20px rgba(59, 130, 246, 0.3)',
              '0 0 30px rgba(147, 51, 234, 0.4)',
              '0 0 20px rgba(59, 130, 246, 0.3)'
            ]
          }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <Brain className="w-7 h-7 text-white" />
        </motion.div>
        
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            HERA AI Assistant
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            World's First Conversational ERP
          </p>
        </div>
      </div>

      {/* Status Indicators */}
      <div className="flex items-center space-x-2">
        <motion.div
          className="px-3 py-1 bg-success/10 text-success rounded-full text-sm font-medium border border-success/20"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 status-online rounded-full" />
            <span>AI Online</span>
          </div>
        </motion.div>

        <div className="px-3 py-1 bg-info/10 text-info rounded-full text-sm font-medium border border-info/20">
          Voice Ready
        </div>
      </div>

      {/* Header Actions */}
      <div className="flex items-center space-x-2">
        <Button
          variant="ghost"
          size="sm"
          className="btn-enhanced focus-ring"
          onClick={() => setSoundEnabled(!soundEnabled)}
          leftIcon={soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        >
          {soundEnabled ? 'Sound On' : 'Sound Off'}
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="btn-enhanced focus-ring"
          onClick={() => setShowSidebar(!showSidebar)}
          leftIcon={<Settings className="w-4 h-4" />}
        >
          Panels
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="btn-enhanced focus-ring"
          onClick={toggleFullscreen}
          leftIcon={isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        >
          {isFullscreen ? 'Exit' : 'Focus'}
        </Button>
      </div>
    </motion.header>
  )
}

// ================================================================================================
// CONVERSATION SIDEBAR
// ================================================================================================

function ConversationSidebar({ analytics }: { analytics: any }) {
  const conversations = useConversationStore(state => state.conversations)
  const currentConversationId = useConversationStore(state => state.currentConversationId)
  const startConversation = useConversationStore(state => state.startConversation)
  const clearConversation = useConversationStore(state => state.clearConversation)

  return (
    <div className="h-full flex flex-col p-6">
      {/* New Conversation */}
      <Button
        variant="default"
        className="w-full mb-6 btn-enhanced focus-ring"
        leftIcon={<MessageSquare className="w-4 h-4" />}
        onClick={startConversation}
      >
        New Conversation
      </Button>

      {/* Analytics Overview */}
      <Card variant="glass" className="p-4 mb-6">
        <h3 className="font-semibold mb-3 flex items-center">
          <Activity className="w-4 h-4 mr-2" />
          Your Activity
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-slate-600 dark:text-slate-400">Conversations</span>
            <span className="text-sm font-medium">{analytics.totalConversations}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-slate-600 dark:text-slate-400">Messages</span>
            <span className="text-sm font-medium">{analytics.totalMessages}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-slate-600 dark:text-slate-400">Avg per Chat</span>
            <span className="text-sm font-medium">{Math.round(analytics.averageMessagesPerConversation)}</span>
          </div>
        </div>
      </Card>

      {/* Quick Actions */}
      <Card variant="glass" className="p-4 mb-6">
        <h3 className="font-semibold mb-3 flex items-center">
          <Zap className="w-4 h-4 mr-2" />
          Quick Actions
        </h3>
        <div className="space-y-2">
          {[
            { icon: DollarSign, label: "Check Cash Flow", action: "What's my current cash position?" },
            { icon: FileText, label: "Create Invoice", action: "I need to create a new invoice" },
            { icon: Users, label: "Add Customer", action: "Help me add a new customer" },
            { icon: BarChart3, label: "Sales Report", action: "Show me this month's sales report" }
          ].map((item, index) => (
            <motion.button
              key={index}
              className="w-full p-2 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg flex items-center space-x-2"
              whileHover={{ x: 4 }}
              transition={{ duration: 0.2 }}
              onClick={() => {
                // TODO: Implement quick action
                console.log('Quick action:', item.action)
              }}
            >
              <item.icon className="w-4 h-4 text-slate-500" />
              <span>{item.label}</span>
            </motion.button>
          ))}
        </div>
      </Card>

      {/* Recent Conversations */}
      <Card variant="glass" className="flex-1 p-4">
        <h3 className="font-semibold mb-3 flex items-center">
          <Clock className="w-4 h-4 mr-2" />
          Recent Chats
        </h3>
        <div className="space-y-2">
          {Array.from(conversations.entries()).slice(0, 5).map(([id, messages]) => (
            <motion.div
              key={id}
              className={cn(
                "p-2 rounded-lg cursor-pointer transition-colors",
                id === currentConversationId 
                  ? "bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800"
                  : "hover:bg-slate-100 dark:hover:bg-slate-700"
              )}
              whileHover={{ x: 2 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {messages.length} messages
                  </p>
                  <p className="text-sm truncate">
                    {messages[messages.length - 1]?.content || 'New conversation'}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    clearConversation(id)
                  }}
                  className="p-1 text-slate-400 hover:text-red-500"
                >
                  ×
                </button>
              </div>
            </motion.div>
          ))}
          
          {conversations.size === 0 && (
            <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">
              No conversations yet
            </p>
          )}
        </div>
      </Card>
    </div>
  )
}

// ================================================================================================
// BUSINESS INSIGHTS PANEL
// ================================================================================================

function BusinessInsightsPanel() {
  return (
    <div className="h-full flex flex-col p-6">
      {/* Real-time Business Metrics */}
      <Card variant="glass" className="p-4 mb-6">
        <h3 className="font-semibold mb-3 flex items-center">
          <TrendingUp className="w-4 h-4 mr-2" />
          Live Business Metrics
        </h3>
        <div className="space-y-4">
          {[
            { label: "Today's Revenue", value: "$8,247", change: "+12%", positive: true },
            { label: "Pending Invoices", value: "23", change: "-3", positive: true },
            { label: "Cash Position", value: "$156,750", change: "+$21K", positive: true },
            { label: "Active Customers", value: "1,247", change: "+8", positive: true }
          ].map((metric, index) => (
            <motion.div
              key={index}
              className="flex justify-between items-center"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">{metric.label}</p>
                <p className="font-semibold">{metric.value}</p>
              </div>
              <div className={cn(
                "text-sm font-medium",
                metric.positive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
              )}>
                {metric.change}
              </div>
            </motion.div>
          ))}
        </div>
      </Card>

      {/* AI Insights */}
      <Card variant="glass" className="p-4 mb-6">
        <h3 className="font-semibold mb-3 flex items-center">
          <Sparkles className="w-4 h-4 mr-2" />
          AI Insights
        </h3>
        <div className="space-y-3">
          {[
            {
              type: 'opportunity',
              title: 'Payment Optimization',
              description: 'Offering 2% early payment discount could improve cash flow by $2,300/month',
              confidence: 94
            },
            {
              type: 'alert',
              title: 'Expense Anomaly',
              description: 'Office expenses 340% above normal this month',
              confidence: 89
            },
            {
              type: 'prediction',
              title: 'Revenue Forecast',
              description: 'Next month projected to exceed target by 15%',
              confidence: 87
            }
          ].map((insight, index) => (
            <motion.div
              key={index}
              className={cn(
                "p-3 rounded-lg border",
                insight.type === 'opportunity' && "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800",
                insight.type === 'alert' && "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800",
                insight.type === 'prediction' && "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
              )}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <div className="flex justify-between items-start mb-1">
                <h4 className="font-medium text-sm">{insight.title}</h4>
                <span className="text-xs bg-white/50 px-2 py-1 rounded">
                  {insight.confidence}%
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {insight.description}
              </p>
            </motion.div>
          ))}
        </div>
      </Card>

      {/* Trending Topics */}
      <Card variant="glass" className="flex-1 p-4">
        <h3 className="font-semibold mb-3 flex items-center">
          <Star className="w-4 h-4 mr-2" />
          Trending in Your Business
        </h3>
        <div className="space-y-2">
          {[
            { topic: "Invoice Automation", mentions: 12, trend: "up" },
            { topic: "Cash Flow Analysis", mentions: 8, trend: "up" },
            { topic: "Customer Onboarding", mentions: 6, trend: "stable" },
            { topic: "Expense Tracking", mentions: 4, trend: "down" }
          ].map((item, index) => (
            <motion.div
              key={index}
              className="flex justify-between items-center p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <span className="text-sm">{item.topic}</span>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-slate-500">{item.mentions}</span>
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  item.trend === 'up' && "bg-green-500",
                  item.trend === 'stable' && "bg-yellow-500",
                  item.trend === 'down' && "bg-red-500"
                )} />
              </div>
            </motion.div>
          ))}
        </div>
      </Card>
    </div>
  )
}

// ================================================================================================
// NOTIFICATION CONTAINER
// ================================================================================================

interface NotificationContainerProps {
  notifications: any[]
  onRemove: (id: string) => void
}

function NotificationContainer({ notifications, onRemove }: NotificationContainerProps) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            className={cn(
              "p-4 rounded-lg shadow-lg border max-w-sm",
              notification.type === 'success' && "bg-green-50 border-green-200 text-green-800",
              notification.type === 'error' && "bg-red-50 border-red-200 text-red-800",
              notification.type === 'warning' && "bg-yellow-50 border-yellow-200 text-yellow-800",
              notification.type === 'info' && "bg-blue-50 border-blue-200 text-blue-800",
              notification.type === 'achievement' && "bg-purple-50 border-purple-200 text-purple-800"
            )}
            initial={{ opacity: 0, x: 300, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 300, scale: 0.9 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h4 className="font-medium text-sm">{notification.title}</h4>
                <p className="text-sm mt-1">{notification.message}</p>
              </div>
              <button
                onClick={() => onRemove(notification.id)}
                className="ml-2 text-slate-400 hover:text-slate-600"
              >
                ×
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}