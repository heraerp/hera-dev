/**
 * HERA Digital Accountant - Quick Capture Dashboard Widget
 * 
 * Primary entry point widget for the main dashboard
 * Provides immediate access to all capture methods
 * Revolutionary "front door" to the sophisticated backend
 */

'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera, Mic, Upload, Zap, Brain, Target, Sparkles,
  Receipt, DollarSign, Clock, CheckCircle2, ArrowRight,
  TrendingUp, Activity, FileText, AlertCircle
} from 'lucide-react';
import EnhancedMobileCapture from './EnhancedMobileCapture';

interface QuickStats {
  todayProcessed: number;
  avgConfidence: number;
  autoPosted: number;
  totalSaved: string;
}

export default function QuickCaptureWidget() {
  const [showFullCapture, setShowFullCapture] = useState(false);
  const [quickStats, setQuickStats] = useState<QuickStats>({
    todayProcessed: 12,
    avgConfidence: 94,
    autoPosted: 11,
    totalSaved: '2.5 hours'
  });
  const [recentCaptures, setRecentCaptures] = useState<any[]>([
    {
      id: 1,
      vendor: 'Mario\'s Coffee',
      amount: '$4.50',
      time: '2 min ago',
      status: 'auto-posted',
      confidence: 98
    },
    {
      id: 2,
      vendor: 'Office Supplies Plus',
      amount: '$23.75',
      time: '15 min ago', 
      status: 'needs-review',
      confidence: 75
    },
    {
      id: 3,
      vendor: 'Fresh Market Co',
      amount: '$67.20',
      time: '1 hour ago',
      status: 'auto-posted', 
      confidence: 95
    }
  ]);

  const handleReceiptCaptured = useCallback((receipt: any) => {
    console.log('Widget: Receipt captured:', receipt);
    
    // Add to recent captures
    const newCapture = {
      id: Date.now(),
      vendor: receipt.vendor || 'Unknown Vendor',
      amount: receipt.amount || '$0.00',
      time: 'Just now',
      status: receipt.autoPosted ? 'auto-posted' : 'needs-review',
      confidence: Math.round((receipt.confidence || 0) * 100)
    };
    
    setRecentCaptures(prev => [newCapture, ...prev.slice(0, 2)]);
    
    // Update stats
    setQuickStats(prev => ({
      ...prev,
      todayProcessed: prev.todayProcessed + 1,
      autoPosted: receipt.autoPosted ? prev.autoPosted + 1 : prev.autoPosted,
      avgConfidence: Math.round((prev.avgConfidence + (receipt.confidence * 100)) / 2)
    }));
  }, []);

  const handleTransactionCreated = useCallback((transaction: any) => {
    console.log('Widget: Transaction created:', transaction);
  }, []);

  const quickActionButtons = [
    {
      icon: Camera,
      label: 'Camera',
      description: 'Snap a photo',
      color: 'from-blue-600 to-blue-700',
      mode: 'camera' as const
    },
    {
      icon: Mic,
      label: 'Voice',
      description: 'Say "Post $15 coffee"',
      color: 'from-green-600 to-green-700',
      mode: 'voice' as const
    },
    {
      icon: Upload,
      label: 'Upload',
      description: 'Choose file',
      color: 'from-purple-600 to-purple-700', 
      mode: 'upload' as const
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
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center mr-3">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  Quick Capture
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  AI-powered instant processing
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
              {quickStats.avgConfidence}% avg confidence
            </div>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {quickActionButtons.map((action) => (
            <motion.button
              key={action.mode}
              onClick={() => setShowFullCapture(true)}
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
          <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {quickStats.todayProcessed}
            </div>
            <div className="text-xs text-blue-700 dark:text-blue-300">Processed</div>
          </div>
          
          <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {quickStats.autoPosted}
            </div>
            <div className="text-xs text-green-700 dark:text-green-300">Auto-Posted</div>
          </div>
          
          <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {quickStats.avgConfidence}%
            </div>
            <div className="text-xs text-purple-700 dark:text-purple-300">Confidence</div>
          </div>
          
          <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {quickStats.totalSaved}
            </div>
            <div className="text-xs text-orange-700 dark:text-orange-300">Time Saved</div>
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Recent Activity</h3>
            <button className="text-blue-600 dark:text-blue-400 text-sm hover:text-blue-800 dark:hover:text-blue-300 flex items-center">
              View All
              <ArrowRight className="w-3 h-3 ml-1" />
            </button>
          </div>
          
          <div className="space-y-3">
            {recentCaptures.map((capture) => (
              <motion.div
                key={capture.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center">
                  <div className={`w-2 h-2 rounded-full mr-3 ${
                    capture.status === 'auto-posted' ? 'bg-green-500' : 'bg-yellow-500'
                  }`} />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                      {capture.vendor}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {capture.time} • {capture.confidence}% confidence
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="font-bold text-gray-900 dark:text-gray-100">
                    {capture.amount}
                  </div>
                  <div className="text-xs">
                    {capture.status === 'auto-posted' ? (
                      <span className="text-green-600 dark:text-green-400 flex items-center">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Posted
                      </span>
                    ) : (
                      <span className="text-yellow-600 dark:text-yellow-400 flex items-center">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Review
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
            <Brain className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mr-2" />
            <span className="font-semibold text-indigo-800 dark:text-indigo-200">AI Intelligence</span>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center">
              <Target className="w-4 h-4 text-indigo-500 mr-2" />
              <span className="text-indigo-700 dark:text-indigo-300">Real-time preview</span>
            </div>
            <div className="flex items-center">
              <Sparkles className="w-4 h-4 text-indigo-500 mr-2" />
              <span className="text-indigo-700 dark:text-indigo-300">Auto-categorization</span>
            </div>
            <div className="flex items-center">
              <TrendingUp className="w-4 h-4 text-indigo-500 mr-2" />
              <span className="text-indigo-700 dark:text-indigo-300">Pattern learning</span>
            </div>
            <div className="flex items-center">
              <FileText className="w-4 h-4 text-indigo-500 mr-2" />
              <span className="text-indigo-700 dark:text-indigo-300">Smart routing</span>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <motion.button
          onClick={() => setShowFullCapture(true)}
          className="w-full mt-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 px-4 rounded-lg font-semibold flex items-center justify-center shadow-lg"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Start Processing Receipts
          <ArrowRight className="w-5 h-5 ml-2" />
        </motion.button>
      </div>

      {/* Full Capture Modal */}
      <AnimatePresence>
        {showFullCapture && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowFullCapture(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <EnhancedMobileCapture
                onReceiptCaptured={handleReceiptCaptured}
                onTransactionCreated={handleTransactionCreated}
                className="shadow-2xl"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}