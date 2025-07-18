/**
 * HERA Conversation State Management
 * Zustand store for conversational AI interface
 */

import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { persist } from 'zustand/middleware'
import type {
  ConversationMessage,
  ConversationContext,
  UserInput,
  AIResponse,
  BusinessAction,
  ActionResult,
  UserPreferences,
  ConversationSentiment,
  MessageAttachment,
  VoiceInput,
  SystemNotification
} from '@/types/conversation'
import { conversationEngine, voiceCapabilities, documentProcessing } from '@/services/conversationEngine'

// ================================================================================================
// CONVERSATION STORE INTERFACE
// ================================================================================================

interface ConversationState {
  // Current conversation state
  currentConversationId: string | null
  conversations: Map<string, ConversationMessage[]>
  contexts: Map<string, ConversationContext>
  
  // UI state
  isLoading: boolean
  isListening: boolean
  isProcessingVoice: boolean
  isProcessingDocument: boolean
  isSending: boolean
  
  // Input state
  currentInput: string
  attachments: MessageAttachment[]
  voiceInput: VoiceInput | null
  
  // User preferences
  preferences: UserPreferences
  
  // Notifications and feedback
  notifications: SystemNotification[]
  lastSentiment: ConversationSentiment | null
  
  // Conversation flow
  pendingActions: BusinessAction[]
  suggestedResponses: string[]
  followUpQuestions: string[]
  
  // Voice capabilities
  voiceEnabled: boolean
  continuousListening: boolean
  voiceLanguage: string
  
  // Actions
  startConversation: () => string
  sendMessage: (message: string, attachments?: MessageAttachment[]) => Promise<void>
  sendVoiceMessage: (audioBlob: Blob) => Promise<void>
  uploadDocument: (file: File) => Promise<void>
  executeAction: (action: BusinessAction) => Promise<void>
  clearConversation: (conversationId?: string) => void
  setPreferences: (preferences: Partial<UserPreferences>) => void
  
  // Voice controls
  startListening: () => Promise<void>
  stopListening: () => void
  toggleVoice: () => void
  
  // Notification management
  addNotification: (notification: SystemNotification) => void
  removeNotification: (notificationId: string) => void
  clearNotifications: () => void
  
  // Utility
  getCurrentConversation: () => ConversationMessage[]
  getCurrentContext: () => ConversationContext | null
  getConversationHistory: (conversationId: string) => ConversationMessage[]
}

// ================================================================================================
// DEFAULT STATE VALUES
// ================================================================================================

const defaultPreferences: UserPreferences = {
  conversationStyle: 'casual',
  responseLength: 'detailed',
  notificationLevel: 'standard',
  confirmationRequired: false,
  autoExecute: [],
  favoriteActions: [],
  shortcuts: {},
  language: 'en',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  currency: 'USD'
}

// ================================================================================================
// ZUSTAND STORE IMPLEMENTATION
// ================================================================================================

const conversationStore = create<ConversationState>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        // Initial state
        currentConversationId: null,
        conversations: new Map(),
        contexts: new Map(),
        
        isLoading: false,
        isListening: false,
        isProcessingVoice: false,
        isProcessingDocument: false,
        isSending: false,
        
        currentInput: '',
        attachments: [],
        voiceInput: null,
        
        preferences: defaultPreferences,
        
        notifications: [],
        lastSentiment: null,
        
        pendingActions: [],
        suggestedResponses: [],
        followUpQuestions: [],
        
        voiceEnabled: typeof window !== 'undefined' && 'webkitSpeechRecognition' in window,
        continuousListening: false,
        voiceLanguage: 'en-US',

        // ================================================================================================
        // CONVERSATION ACTIONS
        // ================================================================================================

        startConversation: () => {
          const conversationId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
          
          set(state => ({
            currentConversationId: conversationId,
            conversations: new Map(state.conversations).set(conversationId, []),
            contexts: new Map(state.contexts),
            currentInput: '',
            attachments: [],
            pendingActions: [],
            suggestedResponses: [],
            followUpQuestions: []
          }))

          // Add welcome message
          const welcomeMessage: ConversationMessage = {
            id: `msg_${Date.now()}`,
            conversationId,
            role: 'assistant',
            content: "👋 Hi! I'm HERA, your AI business assistant. I can help you with invoices, payments, reports, customer management, and much more. What would you like to work on today?",
            timestamp: new Date().toISOString(),
            messageType: 'text',
            status: 'completed',
            metadata: {
              confidence: 1,
              aiModel: 'hera-v1'
            }
          }

          set(state => {
            const newConversations = new Map(state.conversations)
            newConversations.set(conversationId, [welcomeMessage])
            return { conversations: newConversations }
          })

          return conversationId
        },

        sendMessage: async (message: string, attachments?: MessageAttachment[]) => {
          const { currentConversationId, conversations, contexts } = get()
          
          if (!currentConversationId) {
            console.error('No active conversation')
            return
          }

          set({ isSending: true, currentInput: '' })

          try {
            // Create user message
            const userMessage: ConversationMessage = {
              id: `msg_${Date.now()}_user`,
              conversationId: currentConversationId,
              role: 'user',
              content: message,
              timestamp: new Date().toISOString(),
              messageType: 'text',
              status: 'sent',
              attachments: attachments || []
            }

            // Add user message to conversation
            set(state => {
              const newConversations = new Map(state.conversations)
              const currentMessages = newConversations.get(currentConversationId) || []
              newConversations.set(currentConversationId, [...currentMessages, userMessage])
              return { conversations: newConversations }
            })

            // Prepare input for AI
            const userInput: UserInput = {
              conversationId: currentConversationId,
              userId: 'demo-user',
              message,
              messageType: 'text',
              attachments: attachments || [],
              context: contexts.get(currentConversationId),
              timestamp: new Date().toISOString()
            }

            // Process with AI engine
            const aiResponse = await conversationEngine.processMessage(userInput)

            // Create AI response message
            const aiMessage: ConversationMessage = {
              id: `msg_${Date.now()}_ai`,
              conversationId: currentConversationId,
              role: 'assistant',
              content: aiResponse.content,
              timestamp: new Date().toISOString(),
              messageType: 'text',
              status: 'completed',
              businessActions: aiResponse.businessActions,
              metadata: {
                confidence: aiResponse.confidence,
                processingTime: aiResponse.processingTime,
                aiModel: 'hera-v1'
              }
            }

            // Update conversation with AI response
            set(state => {
              const newConversations = new Map(state.conversations)
              const currentMessages = newConversations.get(currentConversationId) || []
              newConversations.set(currentConversationId, [...currentMessages, aiMessage])
              
              return {
                conversations: newConversations,
                suggestedResponses: aiResponse.suggestions?.map(s => s.title) || [],
                followUpQuestions: aiResponse.followUpQuestions || [],
                pendingActions: aiResponse.businessActions || []
              }
            })

            // Add notifications if any
            if (aiResponse.notifications) {
              aiResponse.notifications.forEach(notification => {
                get().addNotification(notification)
              })
            }

          } catch (error) {
            console.error('Failed to send message:', error)
            
            // Add error message
            const errorMessage: ConversationMessage = {
              id: `msg_${Date.now()}_error`,
              conversationId: currentConversationId,
              role: 'assistant',
              content: "I'm sorry, I encountered an error processing your request. Please try again.",
              timestamp: new Date().toISOString(),
              messageType: 'text',
              status: 'error'
            }

            set(state => {
              const newConversations = new Map(state.conversations)
              const currentMessages = newConversations.get(currentConversationId) || []
              newConversations.set(currentConversationId, [...currentMessages, errorMessage])
              return { conversations: newConversations }
            })
          } finally {
            set({ isSending: false })
          }
        },

        sendVoiceMessage: async (audioBlob: Blob) => {
          set({ isProcessingVoice: true })

          try {
            // Convert speech to text
            const speechResult = await voiceCapabilities.speechToText(audioBlob)
            
            // Send as regular message
            await get().sendMessage(speechResult.transcript)
            
          } catch (error) {
            console.error('Voice processing error:', error)
            get().addNotification({
              id: `notif_${Date.now()}`,
              type: 'error',
              title: 'Voice Processing Failed',
              message: 'Could not process voice input. Please try again.',
              priority: 'medium'
            })
          } finally {
            set({ isProcessingVoice: false })
          }
        },

        uploadDocument: async (file: File) => {
          const { currentConversationId } = get()
          
          if (!currentConversationId) {
            console.error('No active conversation for document upload')
            return
          }

          set({ isProcessingDocument: true })

          try {
            // Process document with OCR
            const ocrResult = await documentProcessing.ocrExtract(file)
            
            // Create attachment
            const attachment: MessageAttachment = {
              id: `attach_${Date.now()}`,
              type: 'document',
              url: URL.createObjectURL(file),
              name: file.name,
              size: file.size,
              mimeType: file.type,
              processing: {
                status: 'completed',
                results: {
                  extracted: ocrResult.extractedData,
                  confidence: ocrResult.confidence
                }
              }
            }

            // Send message with document context
            const message = `I've uploaded a document: ${file.name}. Here's what I extracted: ${ocrResult.text.substring(0, 200)}...`
            await get().sendMessage(message, [attachment])

          } catch (error) {
            console.error('Document processing error:', error)
            get().addNotification({
              id: `notif_${Date.now()}`,
              type: 'error',
              title: 'Document Processing Failed',
              message: 'Could not process the uploaded document. Please try again.',
              priority: 'medium'
            })
          } finally {
            set({ isProcessingDocument: false })
          }
        },

        executeAction: async (action: BusinessAction) => {
          set({ isLoading: true })

          try {
            // Execute business action through conversation engine
            const result = await conversationEngine.executeBusinessAction({
              category: 'financial_transaction',
              action: action.type,
              confidence: 0.9,
              entities: [],
              context: {} as any,
              priority: 'medium'
            })

            // Create confirmation message
            const { currentConversationId } = get()
            if (currentConversationId) {
              const confirmationMessage: ConversationMessage = {
                id: `msg_${Date.now()}_action`,
                conversationId: currentConversationId,
                role: 'assistant',
                content: result.success 
                  ? `✅ ${action.description} completed successfully!`
                  : `❌ Failed to ${action.description}: ${result.message}`,
                timestamp: new Date().toISOString(),
                messageType: 'business_action',
                status: 'completed',
                businessActions: [action]
              }

              set(state => {
                const newConversations = new Map(state.conversations)
                const currentMessages = newConversations.get(currentConversationId) || []
                newConversations.set(currentConversationId, [...currentMessages, confirmationMessage])
                return { conversations: newConversations }
              })
            }

            // Remove from pending actions
            set(state => ({
              pendingActions: state.pendingActions.filter(a => a.id !== action.id)
            }))

          } catch (error) {
            console.error('Action execution error:', error)
            get().addNotification({
              id: `notif_${Date.now()}`,
              type: 'error',
              title: 'Action Failed',
              message: `Failed to execute ${action.description}`,
              priority: 'high'
            })
          } finally {
            set({ isLoading: false })
          }
        },

        clearConversation: (conversationId?: string) => {
          const targetId = conversationId || get().currentConversationId
          
          if (!targetId) return

          set(state => {
            const newConversations = new Map(state.conversations)
            const newContexts = new Map(state.contexts)
            
            newConversations.delete(targetId)
            newContexts.delete(targetId)
            
            return {
              conversations: newConversations,
              contexts: newContexts,
              currentConversationId: targetId === state.currentConversationId ? null : state.currentConversationId,
              pendingActions: [],
              suggestedResponses: [],
              followUpQuestions: []
            }
          })
        },

        setPreferences: (newPreferences: Partial<UserPreferences>) => {
          set(state => ({
            preferences: { ...state.preferences, ...newPreferences }
          }))
        },

        // ================================================================================================
        // VOICE CONTROLS
        // ================================================================================================

        startListening: async () => {
          if (!get().voiceEnabled) {
            get().addNotification({
              id: `notif_${Date.now()}`,
              type: 'warning',
              title: 'Voice Not Available',
              message: 'Voice input is not supported on this device',
              priority: 'low'
            })
            return
          }

          set({ isListening: true })
          voiceCapabilities.conversationMode = true
        },

        stopListening: () => {
          set({ isListening: false })
          voiceCapabilities.conversationMode = false
        },

        toggleVoice: () => {
          const { isListening } = get()
          if (isListening) {
            get().stopListening()
          } else {
            get().startListening()
          }
        },

        // ================================================================================================
        // NOTIFICATION MANAGEMENT
        // ================================================================================================

        addNotification: (notification: SystemNotification) => {
          set(state => ({
            notifications: [...state.notifications, notification]
          }))

          // Auto-remove notifications after timeout
          if (notification.expiresAt) {
            const timeout = new Date(notification.expiresAt).getTime() - Date.now()
            setTimeout(() => {
              get().removeNotification(notification.id)
            }, timeout)
          } else {
            // Default 5 second timeout for non-persistent notifications
            setTimeout(() => {
              get().removeNotification(notification.id)
            }, 5000)
          }
        },

        removeNotification: (notificationId: string) => {
          set(state => ({
            notifications: state.notifications.filter(n => n.id !== notificationId)
          }))
        },

        clearNotifications: () => {
          set({ notifications: [] })
        },

        // ================================================================================================
        // UTILITY METHODS
        // ================================================================================================

        getCurrentConversation: () => {
          const { currentConversationId, conversations } = get()
          if (!currentConversationId) return []
          return conversations.get(currentConversationId) || []
        },

        getCurrentContext: () => {
          const { currentConversationId, contexts } = get()
          if (!currentConversationId) return null
          return contexts.get(currentConversationId) || null
        },

        getConversationHistory: (conversationId: string) => {
          const { conversations } = get()
          return conversations.get(conversationId) || []
        }
      }),
      {
        name: 'hera-conversation-store',
        partialize: (state) => ({
          // Only persist preferences and conversation history
          preferences: state.preferences,
          conversations: Array.from(state.conversations.entries()),
          voiceEnabled: state.voiceEnabled,
          voiceLanguage: state.voiceLanguage
        }),
        onRehydrateStorage: () => (state) => {
          if (state) {
            // Convert persisted arrays back to Maps
            state.conversations = new Map(state.conversations as any)
            state.contexts = new Map()
          }
        }
      }
    )
  )
)

// Client-side store initialization
if (typeof window !== 'undefined') {
  // Initialize store on client side
  conversationStore.persist.rehydrate()
}

// Export store with SSR handling
export const useConversationStore = typeof window !== 'undefined' 
  ? conversationStore 
  : () => ({
      // Default values for SSR
      currentConversationId: null,
      conversations: new Map(),
      contexts: new Map(),
      isLoading: false,
      isListening: false,
      isProcessingVoice: false,
      isProcessingDocument: false,
      isSending: false,
      currentInput: '',
      attachments: [],
      voiceInput: null,
      preferences: defaultPreferences,
      notifications: [],
      lastSentiment: null,
      pendingActions: [],
      suggestedResponses: [],
      followUpQuestions: [],
      voiceEnabled: false,
      continuousListening: false,
      voiceLanguage: 'en-US',
      // Mock functions for SSR
      startConversation: () => '',
      sendMessage: async () => {},
      sendVoiceMessage: async () => {},
      uploadDocument: async () => {},
      executeAction: async () => {},
      clearConversation: () => {},
      setPreferences: () => {},
      startListening: async () => {},
      stopListening: () => {},
      toggleVoice: () => {},
      addNotification: () => {},
      removeNotification: () => {},
      clearNotifications: () => {},
      getCurrentConversation: () => [],
      getCurrentContext: () => null,
      getConversationHistory: () => []
    } as ConversationState)

// ================================================================================================
// SSR-SAFE STORE HOOKS
// ================================================================================================

// Individual hooks to avoid SSR hydration issues
export const useCurrentConversation = () => {
  const conversationId = useConversationStore(state => state.currentConversationId)
  const messages = useConversationStore(state => state.getCurrentConversation())
  const isLoading = useConversationStore(state => state.isLoading)
  const isSending = useConversationStore(state => state.isSending)
  
  return { conversationId, messages, isLoading, isSending }
}

export const useConversationInput = () => {
  const currentInput = useConversationStore(state => state.currentInput)
  const attachments = useConversationStore(state => state.attachments)
  const isListening = useConversationStore(state => state.isListening)
  const voiceEnabled = useConversationStore(state => state.voiceEnabled)
  const sendMessage = useConversationStore(state => state.sendMessage)
  const sendVoiceMessage = useConversationStore(state => state.sendVoiceMessage)
  const uploadDocument = useConversationStore(state => state.uploadDocument)
  const startListening = useConversationStore(state => state.startListening)
  const stopListening = useConversationStore(state => state.stopListening)
  
  return {
    currentInput,
    attachments,
    isListening,
    voiceEnabled,
    sendMessage,
    sendVoiceMessage,
    uploadDocument,
    startListening,
    stopListening
  }
}

export const useConversationActions = () => {
  const pendingActions = useConversationStore(state => state.pendingActions)
  const suggestedResponses = useConversationStore(state => state.suggestedResponses)
  const followUpQuestions = useConversationStore(state => state.followUpQuestions)
  const executeAction = useConversationStore(state => state.executeAction)
  
  return { pendingActions, suggestedResponses, followUpQuestions, executeAction }
}

export const useConversationNotifications = () => {
  const notifications = useConversationStore(state => state.notifications)
  const addNotification = useConversationStore(state => state.addNotification)
  const removeNotification = useConversationStore(state => state.removeNotification)
  const clearNotifications = useConversationStore(state => state.clearNotifications)
  
  return { notifications, addNotification, removeNotification, clearNotifications }
}

export const useConversationPreferences = () => {
  const preferences = useConversationStore(state => state.preferences)
  const setPreferences = useConversationStore(state => state.setPreferences)
  
  return { preferences, setPreferences }
}

// ================================================================================================
// CONVERSATION ANALYTICS
// ================================================================================================

export const useConversationAnalytics = () => {
  const conversations = useConversationStore(state => state.conversations)
  
  // SSR-safe calculations
  if (typeof window === 'undefined' || !conversations) {
    return {
      totalConversations: 0,
      totalMessages: 0,
      averageMessagesPerConversation: 0,
      lastActivity: null
    }
  }
  
  return {
    totalConversations: conversations.size,
    totalMessages: Array.from(conversations.values()).reduce((total, messages) => total + messages.length, 0),
    averageMessagesPerConversation: conversations.size > 0 
      ? Array.from(conversations.values()).reduce((total, messages) => total + messages.length, 0) / conversations.size 
      : 0,
    lastActivity: Array.from(conversations.values())
      .flat()
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0]?.timestamp || null
  }
}