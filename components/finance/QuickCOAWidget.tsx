/**
 * HERA Finance - Quick COA Widget
 * 
 * Primary entry point widget for Chart of Accounts maintenance
 * Provides immediate access to AI suggestions and account management
 * Revolutionary "front door" to sophisticated COA intelligence
 */

'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain, BarChart3, Plus, Zap, Target, Sparkles,
  DollarSign, Clock, CheckCircle2, ArrowRight,
  TrendingUp, Activity, AlertCircle, User, 
  Building, PieChart, Search, Settings
} from 'lucide-react';

interface COAStats {
  totalAccounts: number;
  aiConfidence: number;
  suggestionsToday: number;
  timeSaved: string;
}

interface AISuggestion {
  id: number;
  type: 'CREATE' | 'MERGE' | 'RENAME' | 'RECLASSIFY';
  title: string;
  description: string;
  confidence: number;
  impact: 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'pending' | 'auto-approved' | 'needs-review';
}

interface RecentActivity {
  id: number;
  action: string;
  account: string;
  time: string;
  status: 'completed' | 'pending' | 'auto-applied';
  confidence?: number;
}

export default function QuickCOAWidget() {
  const [showEnhancedManagement, setShowEnhancedManagement] = useState(false);
  const [quickStats, setQuickStats] = useState<COAStats>({
    totalAccounts: 220, // Updated for new structure
    aiConfidence: 94,
    suggestionsToday: 8,
    timeSaved: '2.1 hours'
  });

  const [aiSuggestions, setAISuggestions] = useState<AISuggestion[]>([
    {
      id: 1,
      type: 'MERGE',
      title: 'Consolidate Office Expense Accounts',
      description: 'Merge "Office Supplies" and "Office Materials" for better tracking',
      confidence: 92,
      impact: 'MEDIUM',
      status: 'pending'
    },
    {
      id: 2,
      type: 'CREATE',
      title: 'Add Online Delivery Fees Account',
      description: 'Create dedicated account for growing delivery expenses',
      confidence: 88,
      impact: 'HIGH',
      status: 'auto-approved'
    },
    {
      id: 3,
      type: 'RENAME',
      title: 'Rename "Misc Expense" Account',
      description: 'Suggest "Marketing & Promotional Expenses" for better categorization',
      confidence: 85,
      impact: 'MEDIUM',
      status: 'needs-review'
    }
  ]);

  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([
    {
      id: 1,
      action: 'AI Created Account',
      account: 'Equipment Depreciation',
      time: '5 min ago',
      status: 'auto-applied',
      confidence: 95
    },
    {
      id: 2,
      action: 'Account Merged',
      account: 'Office Supplies + Materials',
      time: '23 min ago', 
      status: 'completed',
      confidence: 92
    },
    {
      id: 3,
      action: 'Classification Updated',
      account: 'Marketing Expenses',
      time: '1 hour ago',
      status: 'completed',
      confidence: 89
    }
  ]);

  const handleSuggestionAction = useCallback((suggestionId: number, action: 'accept' | 'reject') => {
    console.log('Widget: Suggestion action:', { suggestionId, action });
    
    // Update suggestions list
    setAISuggestions(prev => prev.filter(s => s.id !== suggestionId));
    
    // Add to recent activity if accepted
    if (action === 'accept') {
      const suggestion = aiSuggestions.find(s => s.id === suggestionId);
      if (suggestion) {
        setRecentActivity(prev => [{
          id: Date.now(),
          action: `AI ${suggestion.type.toLowerCase()}d Account`,
          account: suggestion.title.split(' ').slice(0, 3).join(' '),
          time: 'Just now',
          status: 'completed',
          confidence: suggestion.confidence
        }, ...prev.slice(0, 2)]);
        
        // Update stats
        setQuickStats(prev => ({
          ...prev,
          suggestionsToday: prev.suggestionsToday + 1
        }));
      }
    }
  }, [aiSuggestions]);

  const quickActionButtons = [
    {
      icon: Brain,
      label: 'AI Suggestions',
      description: '8 recommendations',
      color: 'from-blue-600 to-blue-700',
      mode: 'suggestions' as const
    },
    {
      icon: Plus,
      label: 'Smart Add',
      description: 'Create account',
      color: 'from-green-600 to-green-700',
      mode: 'add' as const
    },
    {
      icon: Search,
      label: 'Account Search',
      description: 'Find & manage',
      color: 'from-purple-600 to-purple-700', 
      mode: 'search' as const
    }
  ];

  return (
    <>
      {/* Main Widget */}
      <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  Chart of Accounts Intelligence
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  AI-powered account optimization
                </p>
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <div className="flex items-center text-green-600 dark:text-green-400 mb-1">
              <Activity className="w-4 h-4 mr-1" />
              <span className="font-semibold">Live</span>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {quickStats.aiConfidence}% confidence
            </div>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {quickActionButtons.map((action) => (
            <motion.button
              key={action.mode}
              onClick={() => action.mode === 'suggestions' ? setShowEnhancedManagement(true) : null}
              className={`bg-gradient-to-r ${action.color} hover:scale-105 text-white p-4 rounded-lg shadow-md transition-all`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <action.icon className="w-6 h-6 mx-auto mb-2" />
              <div className="text-sm font-semibold">{action.label}</div>
              <div className="text-xs opacity-90">{action.description}</div>
            </motion.button>
          ))}
        </div>

        {/* Today's Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="text-center p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
            <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              {quickStats.totalAccounts}
            </div>
            <div className="text-xs text-indigo-700 dark:text-indigo-300">Total Accounts</div>
          </div>
          
          <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {quickStats.suggestionsToday}
            </div>
            <div className="text-xs text-green-700 dark:text-green-300">AI Actions</div>
          </div>
          
          <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {quickStats.aiConfidence}%
            </div>
            <div className="text-xs text-blue-700 dark:text-blue-300">AI Accuracy</div>
          </div>
          
          <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {quickStats.timeSaved}
            </div>
            <div className="text-xs text-orange-700 dark:text-orange-300">Time Saved</div>
          </div>
        </div>

        {/* AI Suggestions Preview */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center">
              <Brain className="w-4 h-4 mr-2 text-indigo-600" />
              AI Recommendations
            </h3>
            <button 
              onClick={() => setShowEnhancedManagement(true)}
              className="text-indigo-600 dark:text-indigo-400 text-sm hover:text-indigo-800 dark:hover:text-indigo-300 flex items-center"
            >
              View All
              <ArrowRight className="w-3 h-3 ml-1" />
            </button>
          </div>
          
          <div className="space-y-2">
            {aiSuggestions.slice(0, 2).map((suggestion) => (
              <motion.div
                key={suggestion.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center flex-1">
                  <div className={`w-2 h-2 rounded-full mr-3 ${
                    suggestion.status === 'auto-approved' ? 'bg-green-500' : 
                    suggestion.status === 'pending' ? 'bg-blue-500' : 'bg-yellow-500'
                  }`} />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                      {suggestion.title}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {suggestion.confidence}% confidence • {suggestion.impact} impact
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {suggestion.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleSuggestionAction(suggestion.id, 'accept')}
                        className="text-green-600 hover:text-green-800 p-1"
                        title="Accept suggestion"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleSuggestionAction(suggestion.id, 'reject')}
                        className="text-red-600 hover:text-red-800 p-1"
                        title="Reject suggestion"
                      >
                        <AlertCircle className="w-4 h-4" />
                      </button>
                    </>
                  )}
                  {suggestion.status === 'auto-approved' && (
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Recent Activity</h3>
            <button className="text-indigo-600 dark:text-indigo-400 text-sm hover:text-indigo-800 dark:hover:text-indigo-300 flex items-center">
              View History
              <ArrowRight className="w-3 h-3 ml-1" />
            </button>
          </div>
          
          <div className="space-y-3">
            {recentActivity.map((activity) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center">
                  <div className={`w-2 h-2 rounded-full mr-3 ${
                    activity.status === 'completed' ? 'bg-green-500' : 
                    activity.status === 'auto-applied' ? 'bg-blue-500' : 'bg-yellow-500'
                  }`} />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                      {activity.action}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {activity.account} • {activity.time}
                      {activity.confidence && ` • ${activity.confidence}% confidence`}
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-xs">
                    {activity.status === 'completed' ? (
                      <span className="text-green-600 dark:text-green-400 flex items-center">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Done
                      </span>
                    ) : activity.status === 'auto-applied' ? (
                      <span className="text-blue-600 dark:text-blue-400 flex items-center">
                        <Zap className="w-3 h-3 mr-1" />
                        Auto
                      </span>
                    ) : (
                      <span className="text-yellow-600 dark:text-yellow-400 flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        Pending
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* AI Intelligence Showcase */}
        <div className="mt-6 p-4 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
          <div className="flex items-center mb-2">
            <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mr-2" />
            <span className="font-semibold text-indigo-800 dark:text-indigo-200">AI Intelligence</span>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center">
              <Target className="w-4 h-4 text-indigo-500 mr-2" />
              <span className="text-indigo-700 dark:text-indigo-300">Pattern recognition</span>
            </div>
            <div className="flex items-center">
              <PieChart className="w-4 h-4 text-indigo-500 mr-2" />
              <span className="text-indigo-700 dark:text-indigo-300">Account optimization</span>
            </div>
            <div className="flex items-center">
              <TrendingUp className="w-4 h-4 text-indigo-500 mr-2" />
              <span className="text-indigo-700 dark:text-indigo-300">Usage analytics</span>
            </div>
            <div className="flex items-center">
              <Settings className="w-4 h-4 text-indigo-500 mr-2" />
              <span className="text-indigo-700 dark:text-indigo-300">Smart automation</span>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <motion.button
          onClick={() => setShowEnhancedManagement(true)}
          className="w-full mt-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-3 px-4 rounded-lg font-semibold flex items-center justify-center shadow-lg"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Open Account Intelligence Dashboard
          <ArrowRight className="w-5 h-5 ml-2" />
        </motion.button>
      </div>

      {/* Enhanced Management Modal Placeholder */}
      <AnimatePresence>
        {showEnhancedManagement && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowEnhancedManagement(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-4xl bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center py-12">
                <BarChart3 className="w-16 h-16 text-indigo-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                  Enhanced COA Management
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Advanced Chart of Accounts intelligence dashboard coming soon...
                </p>
                <div className="flex items-center justify-center gap-4">
                  <button
                    onClick={() => setShowEnhancedManagement(false)}
                    className="px-6 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => window.location.href = '/finance/chart-of-accounts'}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    Go to Full COA
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}