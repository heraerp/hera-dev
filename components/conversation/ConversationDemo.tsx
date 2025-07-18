/**
 * HERA Conversational AI Demo Showcase
 * Demonstrates the power of conversational business operations
 */

"use client"

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Sparkles, Brain, MessageSquare, Zap, CheckCircle,
  Play, Pause, RotateCcw, Volume2, VolumeX,
  DollarSign, FileText, Users, TrendingUp, Package
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useConversationStore } from '@/stores/conversationStore'
import { Button } from '@/components/ui/revolutionary-button'
import { Card } from '@/components/ui/revolutionary-card'

// ================================================================================================
// DEMO SCENARIOS
// ================================================================================================

const demoScenarios = [
  {
    id: 'invoice-processing',
    title: 'Invoice Processing',
    description: 'Upload and process invoices with AI',
    icon: FileText,
    color: 'blue',
    messages: [
      {
        role: 'user' as const,
        content: 'I have an invoice from Office Depot for $347.82',
        delay: 0
      },
      {
        role: 'assistant' as const,
        content: "I'll help you process that invoice! Please upload the invoice image or take a photo.",
        delay: 1000
      },
      {
        role: 'user' as const,
        content: '[Uploads invoice image]',
        delay: 2000
      },
      {
        role: 'assistant' as const,
        content: `✅ Invoice processed successfully! 
📄 Details: Office Depot, $347.82, Invoice #OD-789456
📊 Actions completed:
• OCR extraction (98% confidence)
• Vendor matched in system  
• Classified as Office Supplies expense
• Journal entry created automatically
• Routed to manager for approval
The invoice is now in your approval queue!`,
        delay: 4000
      }
    ]
  },
  {
    id: 'cash-flow',
    title: 'Cash Flow Analysis',
    description: 'Get instant financial insights',
    icon: DollarSign,
    color: 'green',
    messages: [
      {
        role: 'user' as const,
        content: "What's our cash position?",
        delay: 0
      },
      {
        role: 'assistant' as const,
        content: `Here's your current cash position:
💰 Current Cash: $156,750
📈 This Month: +$21,750 net flow
⚠️ Upcoming: $25K rent due tomorrow
🔮 30-Day Forecast: Healthy (+$67K projected)
Would you like me to generate a detailed cash flow report or set up alerts?`,
        delay: 1500
      }
    ]
  },
  {
    id: 'expense-analysis',
    title: 'Expense Analysis',
    description: 'AI-powered expense insights',
    icon: TrendingUp,
    color: 'purple',
    messages: [
      {
        role: 'user' as const,
        content: 'Why did our expenses go up last month?',
        delay: 0
      },
      {
        role: 'assistant' as const,
        content: `I analyzed your expense increase of $15,000 (12% above normal):
📊 Primary drivers:
• Office supplies: +$8,000 (new employee onboarding)
• Travel: +$4,000 (Q4 client meetings)  
• Software: +$3,000 (new CRM subscription)
💡 Recommendations:
• Consider bulk purchasing for supplies
• Evaluate travel ROI for Q1 planning
• Review software licenses for optimization
Would you like me to create an expense optimization plan?`,
        delay: 2000
      }
    ]
  },
  {
    id: 'customer-management',
    title: 'Customer Management',
    description: 'Add and manage customers effortlessly',
    icon: Users,
    color: 'orange',
    messages: [
      {
        role: 'user' as const,
        content: 'Add new customer Tech Solutions Inc',
        delay: 0
      },
      {
        role: 'assistant' as const,
        content: `✅ Customer "Tech Solutions Inc" added successfully!
📝 I've created:
• Customer record in master data
• Default payment terms (Net 30)
• Credit limit assessment ($50K approved)
• Contact templates ready
• Invoice templates configured
Would you like me to set up their first project or send a welcome email?`,
        delay: 1500
      }
    ]
  }
]

// ================================================================================================
// DEMO SHOWCASE COMPONENT
// ================================================================================================

interface ConversationDemoProps {
  className?: string
  autoPlay?: boolean
  showControls?: boolean
}

export function ConversationDemo({
  className,
  autoPlay = false,
  showControls = true
}: ConversationDemoProps) {
  const [selectedScenario, setSelectedScenario] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0)
  const [playedMessages, setPlayedMessages] = useState<any[]>([])
  const [soundEnabled, setSoundEnabled] = useState(true)

  const currentScenario = demoScenarios[selectedScenario]

  const startDemo = () => {
    setIsPlaying(true)
    setCurrentMessageIndex(0)
    setPlayedMessages([])
    playNextMessage(0)
  }

  const stopDemo = () => {
    setIsPlaying(false)
  }

  const resetDemo = () => {
    setIsPlaying(false)
    setCurrentMessageIndex(0)
    setPlayedMessages([])
  }

  const playNextMessage = (messageIndex: number) => {
    if (messageIndex >= currentScenario.messages.length) {
      setIsPlaying(false)
      return
    }

    const message = currentScenario.messages[messageIndex]
    
    setTimeout(() => {
      setPlayedMessages(prev => [...prev, message])
      setCurrentMessageIndex(messageIndex + 1)
      
      // Play next message
      if (messageIndex + 1 < currentScenario.messages.length) {
        playNextMessage(messageIndex + 1)
      } else {
        setIsPlaying(false)
      }
    }, message.delay)
  }

  return (
    <div className={cn("max-w-6xl mx-auto", className)}>
      {/* Header */}
      <motion.div
        className="text-center mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex justify-center mb-4">
          <motion.div
            className="w-16 h-16 bg-gradient-to-r from-blue-500 via-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg"
            animate={{
              rotate: [0, 360],
              scale: [1, 1.1, 1]
            }}
            transition={{
              rotate: { duration: 20, repeat: Infinity, ease: "linear" },
              scale: { duration: 3, repeat: Infinity, ease: "easeInOut" }
            }}
          >
            <Brain className="w-8 h-8 text-white" />
          </motion.div>
        </div>
        
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
          HERA Conversational AI
        </h2>
        <p className="text-lg text-slate-600 dark:text-slate-400">
          Experience the world's first ChatGPT-style business operations assistant
        </p>
      </motion.div>

      {/* Scenario Selector */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {demoScenarios.map((scenario, index) => (
          <motion.button
            key={scenario.id}
            onClick={() => {
              setSelectedScenario(index)
              resetDemo()
            }}
            className={cn(
              "p-4 rounded-xl border-2 transition-all duration-300 text-left",
              selectedScenario === index
                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                : "border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600"
            )}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <div className="flex items-center space-x-3 mb-2">
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center",
                scenario.color === 'blue' && "bg-blue-100 dark:bg-blue-900/30",
                scenario.color === 'green' && "bg-green-100 dark:bg-green-900/30",
                scenario.color === 'purple' && "bg-purple-100 dark:bg-purple-900/30",
                scenario.color === 'orange' && "bg-orange-100 dark:bg-orange-900/30"
              )}>
                <scenario.icon className={cn(
                  "w-5 h-5",
                  scenario.color === 'blue' && "text-blue-600 dark:text-blue-400",
                  scenario.color === 'green' && "text-green-600 dark:text-green-400",
                  scenario.color === 'purple' && "text-purple-600 dark:text-purple-400",
                  scenario.color === 'orange' && "text-orange-600 dark:text-orange-400"
                )} />
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                {scenario.title}
              </h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {scenario.description}
            </p>
          </motion.button>
        ))}
      </div>

      {/* Demo Container */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chat Interface */}
        <div className="lg:col-span-2">
          <Card variant="glass" className="h-96 flex flex-col">
            {/* Chat Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-slate-100">
                    HERA AI Assistant
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Demo: {currentScenario.title}
                  </p>
                </div>
              </div>
              
              {showControls && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  >
                    {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  </button>
                </div>
              )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <AnimatePresence>
                {playedMessages.map((message, index) => (
                  <motion.div
                    key={index}
                    className={cn(
                      "flex",
                      message.role === 'user' ? "justify-end" : "justify-start"
                    )}
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className={cn(
                      "max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-sm",
                      message.role === 'user'
                        ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                        : "bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700"
                    )}>
                      <div className="prose prose-sm max-w-none">
                        <MessageContent 
                          content={message.content} 
                          isUser={message.role === 'user'}
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Typing Indicator */}
              {isPlaying && currentMessageIndex < currentScenario.messages.length && (
                <motion.div
                  className="flex justify-start"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div className="bg-white dark:bg-slate-800 rounded-2xl px-4 py-3 shadow-sm border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center space-x-1">
                      <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex space-x-1">
                        {[0, 1, 2].map((i) => (
                          <motion.div
                            key={i}
                            className="w-2 h-2 bg-slate-400 rounded-full"
                            animate={{
                              scale: [1, 1.2, 1],
                              opacity: [0.5, 1, 0.5]
                            }}
                            transition={{
                              duration: 1,
                              repeat: Infinity,
                              delay: i * 0.2
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </Card>
        </div>

        {/* Controls & Info */}
        <div className="space-y-6">
          {/* Demo Controls */}
          {showControls && (
            <Card variant="glass" className="p-6">
              <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">
                Demo Controls
              </h4>
              
              <div className="space-y-3">
                <Button
                  onClick={isPlaying ? stopDemo : startDemo}
                  className="w-full"
                  leftIcon={isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  disabled={playedMessages.length === currentScenario.messages.length && !isPlaying}
                >
                  {isPlaying ? 'Pause Demo' : 'Start Demo'}
                </Button>
                
                <Button
                  onClick={resetDemo}
                  variant="outline"
                  className="w-full"
                  leftIcon={<RotateCcw className="w-4 h-4" />}
                >
                  Reset
                </Button>
              </div>

              {/* Progress */}
              <div className="mt-4">
                <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                  <span>Progress</span>
                  <span>{playedMessages.length}/{currentScenario.messages.length}</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1">
                  <motion.div
                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-1 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ 
                      width: `${(playedMessages.length / currentScenario.messages.length) * 100}%` 
                    }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>
            </Card>
          )}

          {/* Key Features */}
          <Card variant="glass" className="p-6">
            <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">
              Key Features
            </h4>
            
            <div className="space-y-3">
              {[
                { icon: Brain, label: 'AI-Powered Intent Recognition' },
                { icon: MessageSquare, label: 'Natural Language Processing' },
                { icon: Zap, label: 'Instant Business Actions' },
                { icon: CheckCircle, label: 'Automated Workflows' }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  className="flex items-center space-x-3"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <feature.icon className="w-5 h-5 text-blue-500" />
                  <span className="text-sm text-slate-700 dark:text-slate-300">
                    {feature.label}
                  </span>
                </motion.div>
              ))}
            </div>
          </Card>

          {/* Live Demo CTA */}
          <Card variant="glass" className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
            <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
              Try It Live!
            </h4>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              Experience the full power of HERA's conversational AI assistant
            </p>
            <Button
              className="w-full"
              onClick={() => window.open('/ai-assistant', '_blank')}
              leftIcon={<Sparkles className="w-4 h-4" />}
            >
              Open AI Assistant
            </Button>
          </Card>
        </div>
      </div>
    </div>
  )
}

// ================================================================================================
// MESSAGE CONTENT RENDERER
// ================================================================================================

function MessageContent({ content, isUser }: { content: string, isUser: boolean }) {
  // Enhanced message rendering with icons and formatting
  const renderContent = (text: string) => {
    // Handle bullet points
    text = text.replace(/^• (.+)$/gm, '<div class="flex items-start space-x-2 my-1"><span class="text-blue-400 mt-1">•</span><span>$1</span></div>')
    
    // Handle bold text
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    
    // Handle emojis and make them larger
    text = text.replace(/✅/g, '<span class="text-green-500 text-lg">✅</span>')
    text = text.replace(/❌/g, '<span class="text-red-500 text-lg">❌</span>')
    text = text.replace(/💰/g, '<span class="text-yellow-500 text-lg">💰</span>')
    text = text.replace(/📊/g, '<span class="text-blue-500 text-lg">📊</span>')
    text = text.replace(/📈/g, '<span class="text-green-500 text-lg">📈</span>')
    text = text.replace(/⚠️/g, '<span class="text-yellow-500 text-lg">⚠️</span>')
    text = text.replace(/🔮/g, '<span class="text-purple-500 text-lg">🔮</span>')
    text = text.replace(/💡/g, '<span class="text-yellow-400 text-lg">💡</span>')
    text = text.replace(/📄/g, '<span class="text-blue-500 text-lg">📄</span>')
    text = text.replace(/📝/g, '<span class="text-green-500 text-lg">📝</span>')
    
    return text
  }

  return (
    <div 
      className={cn(
        "leading-relaxed",
        isUser && "text-white"
      )}
      dangerouslySetInnerHTML={{ 
        __html: renderContent(content).replace(/\n/g, '<br />') 
      }} 
    />
  )
}

export default ConversationDemo