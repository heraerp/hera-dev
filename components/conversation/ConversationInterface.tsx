/**
 * HERA Conversational AI Interface
 * World's First ChatGPT-Style Business Operations Assistant
 */

"use client"

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Send, Mic, MicOff, Paperclip, Camera, FileText, 
  Sparkles, Brain, TrendingUp, CheckCircle, AlertCircle,
  Play, Pause, Volume2, VolumeX, MessageSquare, Zap,
  Upload, Image as ImageIcon, File, Bot, User,
  ThumbsUp, ThumbsDown, Copy, MoreHorizontal
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useConversationStore, useCurrentConversation, useConversationInput, useConversationActions } from '@/stores/conversationStore'
import type { ConversationMessage, BusinessAction, MessageAttachment } from '@/types/conversation'

// ================================================================================================
// MAIN CONVERSATION INTERFACE
// ================================================================================================

interface ConversationInterfaceProps {
  className?: string
  showWelcome?: boolean
  enableVoice?: boolean
  enableFileUpload?: boolean
  enableCamera?: boolean
  compactMode?: boolean
}

export function ConversationInterface({
  className,
  showWelcome = true,
  enableVoice = true,
  enableFileUpload = true,
  enableCamera = true,
  compactMode = false
}: ConversationInterfaceProps) {
  const startConversation = useConversationStore(state => state.startConversation)
  const { conversationId, messages, isLoading, isSending } = useCurrentConversation()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Initialize conversation if none exists
  useEffect(() => {
    if (!conversationId && showWelcome) {
      startConversation()
    }
  }, [conversationId, showWelcome, startConversation])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className={cn(
      "flex flex-col h-full bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-900",
      compactMode ? "max-w-md" : "max-w-4xl mx-auto",
      className
    )}>
      {/* Header */}
      <ConversationHeader compactMode={compactMode} />
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence initial={false}>
          {messages.map((message, index) => (
            <MessageBubble 
              key={message.id} 
              message={message} 
              index={index}
              compactMode={compactMode}
            />
          ))}
        </AnimatePresence>
        
        {/* Loading indicator */}
        {(isLoading || isSending) && <TypingIndicator />}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      <QuickActions />

      {/* Input Area */}
      <ConversationInput 
        enableVoice={enableVoice}
        enableFileUpload={enableFileUpload}
        enableCamera={enableCamera}
        compactMode={compactMode}
      />
    </div>
  )
}

// ================================================================================================
// CONVERSATION HEADER
// ================================================================================================

function ConversationHeader({ compactMode }: { compactMode: boolean }) {
  const { conversationId } = useCurrentConversation()
  const [aiStatus, setAiStatus] = useState<'thinking' | 'ready' | 'processing'>('ready')

  return (
    <motion.header
      className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-700/50 p-4"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {/* AI Avatar */}
          <motion.div
            className="relative w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center"
            animate={{
              scale: aiStatus === 'processing' ? [1, 1.1, 1] : 1,
              rotate: aiStatus === 'thinking' ? [0, 360] : 0
            }}
            transition={{
              scale: { duration: 1, repeat: Infinity },
              rotate: { duration: 2, repeat: Infinity, ease: "linear" }
            }}
          >
            <Bot className="w-6 h-6 text-white" />
            
            {/* Status indicator */}
            <motion.div
              className={cn(
                "absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white",
                aiStatus === 'ready' && "bg-green-500",
                aiStatus === 'thinking' && "bg-yellow-500",
                aiStatus === 'processing' && "bg-blue-500"
              )}
              animate={{
                scale: aiStatus === 'processing' ? [1, 1.2, 1] : 1
              }}
              transition={{ duration: 0.5, repeat: Infinity }}
            />
          </motion.div>

          <div>
            <h1 className={cn(
              "font-semibold text-slate-900 dark:text-slate-100",
              compactMode ? "text-sm" : "text-lg"
            )}>
              HERA AI Assistant
            </h1>
            <p className={cn(
              "text-slate-500 dark:text-slate-400",
              compactMode ? "text-xs" : "text-sm"
            )}>
              {aiStatus === 'ready' && "Ready to help with your business"}
              {aiStatus === 'thinking' && "Processing your request..."}
              {aiStatus === 'processing' && "Executing business action..."}
            </p>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center space-x-2">
          <motion.button
            className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <MoreHorizontal className="w-5 h-5" />
          </motion.button>
        </div>
      </div>
    </motion.header>
  )
}

// ================================================================================================
// MESSAGE BUBBLE
// ================================================================================================

interface MessageBubbleProps {
  message: ConversationMessage
  index: number
  compactMode: boolean
}

function MessageBubble({ message, index, compactMode }: MessageBubbleProps) {
  const isUser = message.role === 'user'
  const isSystem = message.role === 'system'

  return (
    <motion.div
      className={cn(
        "flex",
        isUser ? "justify-end" : "justify-start"
      )}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      <div className={cn(
        "max-w-xs lg:max-w-md xl:max-w-lg",
        compactMode && "max-w-[280px]"
      )}>
        {/* Message Header */}
        <div className={cn(
          "flex items-center space-x-2 mb-1",
          isUser ? "justify-end" : "justify-start"
        )}>
          {!isUser && (
            <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
          )}
          
          <span className={cn(
            "text-xs text-slate-500 dark:text-slate-400",
            compactMode && "text-[10px]"
          )}>
            {isUser ? 'You' : 'HERA'}
          </span>
          
          {isUser && (
            <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
          )}
        </div>

        {/* Message Content */}
        <motion.div
          className={cn(
            "relative px-4 py-3 rounded-2xl shadow-sm",
            isUser 
              ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white" 
              : "bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700",
            isSystem && "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800"
          )}
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          {/* Message Text */}
          <div className={cn(
            "prose prose-sm max-w-none",
            isUser && "prose-invert",
            compactMode && "text-sm"
          )}>
            <MessageContent content={message.content} />
          </div>

          {/* Attachments */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="mt-3 space-y-2">
              {message.attachments.map(attachment => (
                <AttachmentPreview key={attachment.id} attachment={attachment} />
              ))}
            </div>
          )}

          {/* Business Actions */}
          {message.businessActions && message.businessActions.length > 0 && (
            <div className="mt-3 space-y-2">
              {message.businessActions.map(action => (
                <BusinessActionCard key={action.id} action={action} />
              ))}
            </div>
          )}

          {/* Message Metadata */}
          {message.metadata && (
            <div className="mt-2 flex items-center justify-between text-xs opacity-70">
              <span>
                {new Date(message.timestamp).toLocaleTimeString()}
              </span>
              {message.metadata.confidence && (
                <span>
                  {Math.round(message.metadata.confidence * 100)}% confident
                </span>
              )}
            </div>
          )}

          {/* Message Actions */}
          {!isUser && (
            <MessageActions message={message} />
          )}
        </motion.div>
      </div>
    </motion.div>
  )
}

// ================================================================================================
// MESSAGE CONTENT RENDERER
// ================================================================================================

function MessageContent({ content }: { content: string }) {
  // Simple markdown-like rendering
  const renderContent = (text: string) => {
    // Handle bullet points
    text = text.replace(/^- (.+)$/gm, '• $1')
    
    // Handle bold text
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    
    // Handle checkmarks and icons
    text = text.replace(/✅/g, '<span class="text-green-500">✅</span>')
    text = text.replace(/❌/g, '<span class="text-red-500">❌</span>')
    text = text.replace(/💰/g, '<span class="text-yellow-500">💰</span>')
    text = text.replace(/📊/g, '<span class="text-blue-500">📊</span>')
    text = text.replace(/📈/g, '<span class="text-green-500">📈</span>')
    text = text.replace(/⚠️/g, '<span class="text-yellow-500">⚠️</span>')
    text = text.replace(/🔮/g, '<span class="text-purple-500">🔮</span>')
    text = text.replace(/💡/g, '<span class="text-yellow-400">💡</span>')
    
    return text
  }

  return (
    <div 
      dangerouslySetInnerHTML={{ 
        __html: renderContent(content).replace(/\n/g, '<br />') 
      }} 
    />
  )
}

// ================================================================================================
// MESSAGE ACTIONS
// ================================================================================================

function MessageActions({ message }: { message: ConversationMessage }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex items-center justify-end mt-2 space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
      <motion.button
        className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded"
        onClick={handleCopy}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        {copied ? <CheckCircle className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
      </motion.button>
      
      <motion.button
        className="p-1 text-slate-400 hover:text-green-600 dark:hover:text-green-400 rounded"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <ThumbsUp className="w-3 h-3" />
      </motion.button>
      
      <motion.button
        className="p-1 text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <ThumbsDown className="w-3 h-3" />
      </motion.button>
    </div>
  )
}

// ================================================================================================
// ATTACHMENT PREVIEW
// ================================================================================================

function AttachmentPreview({ attachment }: { attachment: MessageAttachment }) {
  const getIcon = () => {
    switch (attachment.type) {
      case 'image': return <ImageIcon className="w-4 h-4" />
      case 'document': return <FileText className="w-4 h-4" />
      case 'audio': return <Volume2 className="w-4 h-4" />
      case 'video': return <Play className="w-4 h-4" />
      default: return <File className="w-4 h-4" />
    }
  }

  return (
    <motion.div
      className="flex items-center space-x-2 p-2 bg-slate-100 dark:bg-slate-700 rounded-lg"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
    >
      {getIcon()}
      <span className="text-sm flex-1 truncate">{attachment.name}</span>
      {attachment.processing?.status === 'processing' && (
        <motion.div
          className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      )}
      {attachment.processing?.status === 'completed' && (
        <CheckCircle className="w-4 h-4 text-green-500" />
      )}
    </motion.div>
  )
}

// ================================================================================================
// BUSINESS ACTION CARD
// ================================================================================================

function BusinessActionCard({ action }: { action: BusinessAction }) {
  const { executeAction } = useConversationActions()
  const [isExecuting, setIsExecuting] = useState(false)

  const handleExecute = async () => {
    setIsExecuting(true)
    try {
      await executeAction(action)
    } finally {
      setIsExecuting(false)
    }
  }

  const getRiskColor = () => {
    switch (action.riskLevel) {
      case 'low': return 'border-green-200 bg-green-50 dark:bg-green-900/20'
      case 'medium': return 'border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20'
      case 'high': return 'border-red-200 bg-red-50 dark:bg-red-900/20'
      default: return 'border-slate-200 bg-slate-50 dark:bg-slate-800'
    }
  }

  return (
    <motion.div
      className={cn(
        "p-3 rounded-lg border",
        getRiskColor()
      )}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h4 className="font-medium text-sm">{action.description}</h4>
          {action.estimatedTime && (
            <p className="text-xs text-slate-500 mt-1">
              Estimated time: {action.estimatedTime}s
            </p>
          )}
        </div>
        
        <motion.button
          className={cn(
            "px-3 py-1 text-xs font-medium rounded-full",
            action.validation.isValid
              ? "bg-blue-500 text-white hover:bg-blue-600"
              : "bg-slate-300 text-slate-600 cursor-not-allowed"
          )}
          onClick={handleExecute}
          disabled={!action.validation.isValid || isExecuting}
          whileHover={action.validation.isValid ? { scale: 1.05 } : {}}
          whileTap={action.validation.isValid ? { scale: 0.95 } : {}}
        >
          {isExecuting ? (
            <motion.div
              className="w-3 h-3 border border-white border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
          ) : action.validation.isValid ? (
            'Execute'
          ) : (
            'Invalid'
          )}
        </motion.button>
      </div>
      
      {action.validation.errors && action.validation.errors.length > 0 && (
        <div className="mt-2 space-y-1">
          {action.validation.errors.map((error, index) => (
            <p key={index} className="text-xs text-red-600 dark:text-red-400">
              {error.message}
            </p>
          ))}
        </div>
      )}
    </motion.div>
  )
}

// ================================================================================================
// TYPING INDICATOR
// ================================================================================================

function TypingIndicator() {
  return (
    <motion.div
      className="flex justify-start"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="bg-white dark:bg-slate-800 rounded-2xl px-4 py-3 shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="flex items-center space-x-1">
          <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <Bot className="w-4 h-4 text-white" />
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
  )
}

// ================================================================================================
// QUICK ACTIONS
// ================================================================================================

function QuickActions() {
  const { suggestedResponses, followUpQuestions } = useConversationActions()
  const { sendMessage } = useConversationInput()

  if (suggestedResponses.length === 0 && followUpQuestions.length === 0) {
    return null
  }

  const handleQuickAction = (text: string) => {
    sendMessage(text)
  }

  return (
    <motion.div
      className="px-4 py-2"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex flex-wrap gap-2">
        {suggestedResponses.map((suggestion, index) => (
          <motion.button
            key={index}
            className="px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
            onClick={() => handleQuickAction(suggestion)}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2, delay: index * 0.1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {suggestion}
          </motion.button>
        ))}
        
        {followUpQuestions.map((question, index) => (
          <motion.button
            key={`q-${index}`}
            className="px-3 py-1 text-sm bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
            onClick={() => handleQuickAction(question)}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2, delay: (suggestedResponses.length + index) * 0.1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {question}
          </motion.button>
        ))}
      </div>
    </motion.div>
  )
}

// ================================================================================================
// CONVERSATION INPUT
// ================================================================================================

interface ConversationInputProps {
  enableVoice: boolean
  enableFileUpload: boolean
  enableCamera: boolean
  compactMode: boolean
}

function ConversationInput({ enableVoice, enableFileUpload, enableCamera, compactMode }: ConversationInputProps) {
  const {
    currentInput,
    isListening,
    voiceEnabled,
    sendMessage,
    sendVoiceMessage,
    uploadDocument,
    startListening,
    stopListening
  } = useConversationInput()

  const [input, setInput] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSend = useCallback(() => {
    if (input.trim()) {
      sendMessage(input.trim())
      setInput('')
    }
  }, [input, sendMessage])

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }, [handleSend])

  const handleVoiceToggle = useCallback(async () => {
    if (isListening) {
      stopListening()
    } else {
      await startListening()
    }
  }, [isListening, startListening, stopListening])

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      Array.from(files).forEach(file => {
        uploadDocument(file)
      })
    }
  }, [uploadDocument])

  return (
    <motion.div
      className="p-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-t border-slate-200/50 dark:border-slate-700/50"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative">
        {/* Input Field */}
        <div className="relative bg-white dark:bg-slate-700 rounded-2xl border border-slate-200 dark:border-slate-600 shadow-sm">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything about your business..."
            className={cn(
              "w-full px-4 py-3 pr-20 bg-transparent border-none outline-none resize-none text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400",
              compactMode ? "text-sm" : "text-base"
            )}
            rows={1}
            style={{ minHeight: '48px', maxHeight: '120px' }}
          />
          
          {/* Input Actions */}
          <div className="absolute right-2 bottom-2 flex items-center space-x-1">
            {/* File Upload */}
            {enableFileUpload && (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*,.pdf,.doc,.docx,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <motion.button
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600"
                  onClick={() => fileInputRef.current?.click()}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Paperclip className="w-4 h-4" />
                </motion.button>
              </>
            )}

            {/* Voice Input */}
            {enableVoice && voiceEnabled && (
              <motion.button
                className={cn(
                  "p-2 rounded-lg",
                  isListening 
                    ? "text-red-500 bg-red-100 dark:bg-red-900/30" 
                    : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600"
                )}
                onClick={handleVoiceToggle}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                animate={{
                  scale: isListening ? [1, 1.1, 1] : 1
                }}
                transition={{
                  scale: { duration: 1, repeat: Infinity }
                }}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </motion.button>
            )}

            {/* Send Button */}
            <motion.button
              className={cn(
                "p-2 rounded-lg",
                input.trim() 
                  ? "text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700" 
                  : "text-slate-400 bg-slate-100 dark:bg-slate-600 cursor-not-allowed"
              )}
              onClick={handleSend}
              disabled={!input.trim()}
              whileHover={input.trim() ? { scale: 1.05 } : {}}
              whileTap={input.trim() ? { scale: 0.95 } : {}}
            >
              <Send className="w-4 h-4" />
            </motion.button>
          </div>
        </div>

        {/* Voice Recording Indicator */}
        <AnimatePresence>
          {isListening && (
            <motion.div
              className="absolute -top-12 left-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
            >
              <div className="flex items-center justify-center space-x-2">
                <motion.div
                  className="w-2 h-2 bg-white rounded-full"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
                <span className="text-sm font-medium">Listening...</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

export default ConversationInterface