/**
 * HERA Universal - Floating Action Button for Chart of Accounts
 * 
 * Mobile-first floating button that appears on all pages
 * Provides instant access to COA management functionality
 * Revolutionary user experience - always available
 */

'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3, Brain, Plus, X, Search, Settings, Zap, 
  Clock, Sparkles, TrendingUp, DollarSign, Target
} from 'lucide-react';

interface COAFloatingButtonProps {
  className?: string;
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center';
  showOnMobile?: boolean;
  showOnDesktop?: boolean;
}

export default function COAFloatingButton({
  className = '',
  position = 'bottom-right',
  showOnMobile = true,
  showOnDesktop = true
}: COAFloatingButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [recentActivity, setRecentActivity] = useState<any[]>([
    {
      id: 1,
      type: 'ai_suggestion',
      title: 'Merge Office Accounts',
      confidence: 94,
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
      status: 'pending'
    },
    {
      id: 2,
      type: 'account_created', 
      title: 'Equipment Depreciation',
      confidence: 96,
      timestamp: new Date(Date.now() - 1000 * 60 * 15),
      status: 'completed'
    },
    {
      id: 3,
      type: 'optimization',
      title: 'Account Classification',
      confidence: 88,
      timestamp: new Date(Date.now() - 1000 * 60 * 45),
      status: 'completed'
    }
  ]);

  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6', 
    'bottom-center': 'bottom-6 left-1/2 transform -translate-x-1/2'
  };

  const responsiveClasses = `
    ${showOnMobile ? 'block' : 'hidden'} 
    ${showOnDesktop ? 'lg:block' : 'lg:hidden'}
  `;

  const quickActions = [
    {
      icon: Brain,
      label: 'AI Suggestions',
      color: 'bg-blue-600 hover:bg-blue-700',
      action: () => window.location.href = '/finance/chart-of-accounts?view=suggestions'
    },
    {
      icon: Plus,
      label: 'Add Account',
      color: 'bg-green-600 hover:bg-green-700',
      action: () => window.location.href = '/finance/chart-of-accounts/create'
    },
    {
      icon: Search,
      label: 'Search COA',
      color: 'bg-purple-600 hover:bg-purple-700',
      action: () => window.location.href = '/finance/chart-of-accounts?focus=search'
    },
    {
      icon: TrendingUp,
      label: 'Analytics',
      color: 'bg-orange-600 hover:bg-orange-700',
      action: () => window.location.href = '/finance/chart-of-accounts/analytics'
    }
  ];

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return 'Yesterday';
  };

  return (
    <>
      {/* Main Floating Button */}
      <div className={`fixed ${positionClasses[position]} z-50 ${responsiveClasses} ${className}`}>
        <AnimatePresence>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="relative"
          >
            {/* Quick Action Buttons */}
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="absolute bottom-20 right-0 space-y-3 mb-2"
                >
                  {quickActions.map((action, index) => (
                    <motion.button
                      key={action.label}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => {
                        action.action();
                        setIsOpen(false);
                      }}
                      className={`w-12 h-12 ${action.color} text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 group relative`}
                      title={action.label}
                    >
                      <action.icon className="w-5 h-5" />
                      
                      {/* Action Label */}
                      <div className="absolute right-full mr-3 bg-gray-900 text-white px-3 py-1 rounded-lg text-sm font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        {action.label}
                        <div className="absolute top-1/2 -right-1 transform -translate-y-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                      </div>
                    </motion.button>
                  ))}
                  
                  {/* Recent Activity Indicator */}
                  {recentActivity.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: 0.4 }}
                      className="w-12 h-12 bg-gray-800 text-white rounded-full shadow-lg flex items-center justify-center relative group"
                    >
                      <Clock className="w-5 h-5" />
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                        {recentActivity.filter(a => a.status === 'pending').length || recentActivity.length}
                      </div>
                      
                      {/* Recent Activity Tooltip */}
                      <div className="absolute bottom-full right-0 mb-2 w-72 bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 text-sm flex items-center">
                          <Clock className="w-4 h-4 mr-2" />
                          Recent COA Activity
                        </h4>
                        <div className="space-y-3">
                          {recentActivity.slice(0, 3).map((activity) => (
                            <div key={activity.id} className="flex items-start text-xs">
                              <div className={`w-2 h-2 rounded-full mr-3 mt-1.5 ${
                                activity.status === 'pending' ? 'bg-orange-500' :
                                activity.status === 'completed' ? 'bg-green-500' : 'bg-blue-500'
                              }`} />
                              <div className="flex-1">
                                <div className="font-medium text-gray-900 dark:text-gray-100">
                                  {activity.title}
                                </div>
                                <div className="text-gray-500 dark:text-gray-400 flex items-center gap-2">
                                  <span>{formatTimeAgo(activity.timestamp)}</span>
                                  <span>•</span>
                                  <span>{activity.confidence}% confidence</span>
                                </div>
                              </div>
                              <div className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                activity.status === 'pending' ? 'bg-orange-100 text-orange-800' :
                                activity.status === 'completed' ? 'bg-green-100 text-green-800' : 
                                'bg-blue-100 text-blue-800'
                              }`}>
                                {activity.status === 'pending' ? 'Pending' : 
                                 activity.status === 'completed' ? 'Done' : 'Active'}
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                          <button
                            onClick={() => window.location.href = '/finance/chart-of-accounts?view=activity'}
                            className="text-indigo-600 dark:text-indigo-400 text-sm font-medium hover:text-indigo-800 dark:hover:text-indigo-300"
                          >
                            View All Activity →
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Main FAB Button */}
            <motion.button
              onClick={() => setIsOpen(!isOpen)}
              className={`w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 ${
                isOpen ? 'rotate-45' : 'rotate-0'
              }`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              {isOpen ? (
                <X className="w-8 h-8" />
              ) : (
                <div className="relative">
                  <BarChart3 className="w-8 h-8" />
                  <Sparkles className="w-4 h-4 absolute -top-1 -right-1 text-yellow-300" />
                </div>
              )}
            </motion.button>

            {/* Floating Label */}
            {!isOpen && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className="absolute right-full top-1/2 transform -translate-y-1/2 mr-4 bg-gray-900 text-white px-3 py-1 rounded-lg text-sm font-medium whitespace-nowrap opacity-0 hover:opacity-100 transition-opacity pointer-events-none"
              >
                Chart of Accounts
                <div className="absolute top-1/2 -right-1 transform -translate-y-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
              </motion.div>
            )}

            {/* Pulse Animation for New Activity */}
            {recentActivity.some(a => a.status === 'pending') && (
              <div className="absolute inset-0 rounded-full bg-orange-400 opacity-30 animate-ping"></div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Success Toast for Actions */}
      <AnimatePresence>
        {recentActivity.some(a => a.timestamp > new Date(Date.now() - 5000)) && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-24 right-6 bg-indigo-600 text-white px-4 py-3 rounded-lg shadow-lg text-sm font-medium z-40 max-w-xs"
          >
            <div className="flex items-center">
              <Brain className="w-4 h-4 mr-2 flex-shrink-0" />
              <div>
                <div className="font-semibold">COA Updated!</div>
                <div className="text-indigo-200 text-xs">AI suggestion applied successfully</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global Quick Actions Shortcuts */}
      <div className="hidden">
        {/* Hidden for keyboard shortcuts - could be implemented later */}
        <div data-shortcut="alt+c" data-action="open-coa"></div>
        <div data-shortcut="alt+a" data-action="ai-suggestions"></div>
        <div data-shortcut="alt+plus" data-action="add-account"></div>
      </div>
    </>
  );
}