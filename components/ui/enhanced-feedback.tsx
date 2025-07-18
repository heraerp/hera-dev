'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  X,
  Lightbulb,
  Zap,
  Clock,
  TrendingUp
} from 'lucide-react';

type FeedbackType = 'success' | 'error' | 'warning' | 'info' | 'loading';

interface FeedbackMessage {
  id: string;
  type: FeedbackType;
  title: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  autoHide?: boolean;
  duration?: number;
}

interface FeedbackContextType {
  messages: FeedbackMessage[];
  addMessage: (message: Omit<FeedbackMessage, 'id'>) => void;
  removeMessage: (id: string) => void;
  clearAll: () => void;
}

const FeedbackContext = React.createContext<FeedbackContextType | null>(null);

export function FeedbackProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<FeedbackMessage[]>([]);

  const addMessage = (message: Omit<FeedbackMessage, 'id'>) => {
    const id = crypto.randomUUID();
    const newMessage = { ...message, id };
    
    setMessages(prev => [...prev, newMessage]);

    // Auto-hide if specified
    if (message.autoHide !== false) {
      const duration = message.duration || (message.type === 'success' ? 3000 : 5000);
      setTimeout(() => {
        removeMessage(id);
      }, duration);
    }
  };

  const removeMessage = (id: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== id));
  };

  const clearAll = () => {
    setMessages([]);
  };

  return (
    <FeedbackContext.Provider value={{ messages, addMessage, removeMessage, clearAll }}>
      {children}
      <FeedbackContainer />
    </FeedbackContext.Provider>
  );
}

function FeedbackContainer() {
  const context = React.useContext(FeedbackContext);
  if (!context) return null;

  const { messages, removeMessage } = context;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      <AnimatePresence>
        {messages.map(message => (
          <FeedbackCard
            key={message.id}
            message={message}
            onClose={() => removeMessage(message.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

interface FeedbackCardProps {
  message: FeedbackMessage;
  onClose: () => void;
}

function FeedbackCard({ message, onClose }: FeedbackCardProps) {
  const getIcon = () => {
    switch (message.type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'info':
        return <Info className="h-5 w-5 text-blue-600" />;
      case 'loading':
        return <div className="h-5 w-5 border-2 border-orange-600 border-t-transparent rounded-full animate-spin" />;
    }
  };

  const getColorClasses = () => {
    switch (message.type) {
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'error':
        return 'border-red-200 bg-red-50';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50';
      case 'info':
        return 'border-blue-200 bg-blue-50';
      case 'loading':
        return 'border-orange-200 bg-orange-50';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 100, scale: 0.8 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.8 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <Card className={cn('shadow-lg border-l-4', getColorClasses())}>
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 mt-0.5">
              {getIcon()}
            </div>
            
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-gray-900 mb-1">
                {message.title}
              </h4>
              <p className="text-sm text-gray-700">
                {message.message}
              </p>
              
              {message.action && (
                <div className="mt-3">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={message.action.onClick}
                    className="h-8 px-3 text-xs"
                  >
                    {message.action.label}
                  </Button>
                </div>
              )}
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-6 w-6 p-0 flex-shrink-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Hook to use feedback
export function useFeedback() {
  const context = React.useContext(FeedbackContext);
  if (!context) {
    throw new Error('useFeedback must be used within FeedbackProvider');
  }
  
  return {
    ...context,
    success: (title: string, message: string, action?: FeedbackMessage['action']) => {
      context.addMessage({ type: 'success', title, message, action });
    },
    error: (title: string, message: string, action?: FeedbackMessage['action']) => {
      context.addMessage({ type: 'error', title, message, action, autoHide: false });
    },
    warning: (title: string, message: string, action?: FeedbackMessage['action']) => {
      context.addMessage({ type: 'warning', title, message, action });
    },
    info: (title: string, message: string, action?: FeedbackMessage['action']) => {
      context.addMessage({ type: 'info', title, message, action });
    },
    loading: (title: string, message: string) => {
      return context.addMessage({ type: 'loading', title, message, autoHide: false });
    }
  };
}

// Progress feedback component
interface ProgressFeedbackProps {
  steps: string[];
  currentStep: number;
  isLoading?: boolean;
  error?: string;
  className?: string;
}

export function ProgressFeedback({ 
  steps, 
  currentStep, 
  isLoading = false, 
  error,
  className 
}: ProgressFeedbackProps) {
  return (
    <Card className={cn('p-6', className)}>
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          {isLoading ? (
            <div className="h-5 w-5 border-2 border-orange-600 border-t-transparent rounded-full animate-spin" />
          ) : error ? (
            <XCircle className="h-5 w-5 text-red-600" />
          ) : currentStep >= steps.length ? (
            <CheckCircle className="h-5 w-5 text-green-600" />
          ) : (
            <Clock className="h-5 w-5 text-orange-600" />
          )}
          
          <h3 className="font-semibold">
            {error ? 'Process Failed' : 
             currentStep >= steps.length ? 'Complete' : 
             `Step ${currentStep + 1} of ${steps.length}`}
          </h3>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <div className="space-y-2">
          {steps.map((step, index) => (
            <div key={index} className="flex items-center space-x-3">
              <div className={cn(
                'h-2 w-2 rounded-full',
                index < currentStep ? 'bg-green-500' :
                index === currentStep ? 'bg-orange-500 animate-pulse' :
                'bg-gray-200'
              )} />
              <span className={cn(
                'text-sm',
                index < currentStep ? 'text-green-700 font-medium' :
                index === currentStep ? 'text-orange-700 font-medium' :
                'text-gray-500'
              )}>
                {step}
              </span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

// Smart suggestions component
interface SmartSuggestionProps {
  suggestions: Array<{
    icon: React.ReactNode;
    title: string;
    description: string;
    action: () => void;
  }>;
  className?: string;
}

export function SmartSuggestions({ suggestions, className }: SmartSuggestionProps) {
  return (
    <Card className={cn('p-4', className)}>
      <div className="flex items-center space-x-2 mb-4">
        <Lightbulb className="h-5 w-5 text-yellow-600" />
        <h3 className="font-semibold text-gray-800">Smart Suggestions</h3>
      </div>
      
      <div className="space-y-3">
        {suggestions.map((suggestion, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-gray-50 cursor-pointer transition-colors"
            onClick={suggestion.action}
          >
            <div className="flex-shrink-0 mt-0.5">
              {suggestion.icon}
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-medium text-gray-900 mb-1">
                {suggestion.title}
              </h4>
              <p className="text-xs text-gray-600">
                {suggestion.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </Card>
  );
}

// Performance indicator
interface PerformanceIndicatorProps {
  metrics: Array<{
    label: string;
    value: number;
    target: number;
    unit?: string;
  }>;
  className?: string;
}

export function PerformanceIndicator({ metrics, className }: PerformanceIndicatorProps) {
  return (
    <Card className={cn('p-4', className)}>
      <div className="flex items-center space-x-2 mb-4">
        <TrendingUp className="h-5 w-5 text-blue-600" />
        <h3 className="font-semibold text-gray-800">Performance</h3>
      </div>
      
      <div className="space-y-3">
        {metrics.map((metric, index) => {
          const percentage = (metric.value / metric.target) * 100;
          const isGood = percentage >= 80;
          
          return (
            <div key={index} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-700">{metric.label}</span>
                <span className={cn(
                  'font-medium',
                  isGood ? 'text-green-600' : 'text-orange-600'
                )}>
                  {metric.value}{metric.unit} / {metric.target}{metric.unit}
                </span>
              </div>
              
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, percentage)}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className={cn(
                    'h-full rounded-full',
                    isGood ? 'bg-green-500' : 'bg-orange-500'
                  )}
                />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}