/**
 * HERA Universal - Floating Action Button for Receipt Capture
 * 
 * Mobile-first floating button that appears on all pages
 * Provides instant access to receipt capture functionality
 * Revolutionary user experience - always available
 */

'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera, Mic, Upload, Plus, X, Sparkles, Zap, 
  Receipt, DollarSign, FileText, Clock
} from 'lucide-react';
import EnhancedMobileCapture from '@/components/digital-accountant/EnhancedMobileCapture';

interface CaptureFloatingButtonProps {
  className?: string;
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center';
  showOnMobile?: boolean;
  showOnDesktop?: boolean;
}

export default function CaptureFloatingButton({
  className = '',
  position = 'bottom-right',
  showOnMobile = true,
  showOnDesktop = true
}: CaptureFloatingButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showCapture, setShowCapture] = useState(false);
  const [captureMode, setCaptureMode] = useState<'camera' | 'voice' | 'upload'>('camera');
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6', 
    'bottom-center': 'bottom-6 left-1/2 transform -translate-x-1/2'
  };

  const responsiveClasses = `
    ${showOnMobile ? 'block' : 'hidden'} 
    ${showOnDesktop ? 'lg:block' : 'lg:hidden'}
  `;

  const handleReceiptCaptured = useCallback((receipt: any) => {
    console.log('FAB: Receipt captured:', receipt);
    
    // Add to recent activity
    setRecentActivity(prev => [{
      id: Date.now(),
      type: 'receipt',
      vendor: receipt.vendor,
      amount: receipt.amount,
      timestamp: receipt.timestamp,
      confidence: receipt.confidence
    }, ...prev.slice(0, 4)]);

    // Auto-close after successful capture
    setTimeout(() => {
      setShowCapture(false);
      setIsOpen(false);
    }, 2000);
  }, []);

  const handleTransactionCreated = useCallback((transaction: any) => {
    console.log('FAB: Transaction created:', transaction);
    
    // Add to recent activity  
    setRecentActivity(prev => [{
      id: Date.now(),
      type: 'transaction',
      description: transaction.description,
      amount: transaction.amount,
      timestamp: new Date(),
      status: transaction.status
    }, ...prev.slice(0, 4)]);
  }, []);

  const quickActions = [
    {
      icon: Camera,
      label: 'Camera',
      color: 'bg-blue-600 hover:bg-blue-700',
      mode: 'camera' as const
    },
    {
      icon: Mic,
      label: 'Voice',
      color: 'bg-green-600 hover:bg-green-700',
      mode: 'voice' as const
    },
    {
      icon: Upload,
      label: 'Upload',
      color: 'bg-purple-600 hover:bg-purple-700',
      mode: 'upload' as const
    }
  ];

  return (
    <>
      {/* Main Floating Button */}
      <div className={`fixed ${positionClasses[position]} z-50 ${responsiveClasses} ${className}`}>
        <AnimatePresence>
          {!showCapture && (
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
                    className="absolute bottom-16 right-0 space-y-3 mb-2"
                  >
                    {quickActions.map((action, index) => (
                      <motion.button
                        key={action.mode}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: index * 0.1 }}
                        onClick={() => {
                          setCaptureMode(action.mode);
                          setShowCapture(true);
                          setIsOpen(false);
                        }}
                        className={`w-12 h-12 ${action.color} text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110`}
                        title={`${action.label} Capture`}
                      >
                        <action.icon className="w-5 h-5" />
                      </motion.button>
                    ))}
                    
                    {/* Recent Activity Indicator */}
                    {recentActivity.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: 0.3 }}
                        className="w-12 h-12 bg-gray-800 text-white rounded-full shadow-lg flex items-center justify-center relative group"
                      >
                        <Clock className="w-5 h-5" />
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                          {recentActivity.length}
                        </div>
                        
                        {/* Recent Activity Tooltip */}
                        <div className="absolute bottom-full right-0 mb-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-xl p-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 text-sm">Recent Activity</h4>
                          <div className="space-y-2">
                            {recentActivity.slice(0, 3).map((activity) => (
                              <div key={activity.id} className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                                <Receipt className="w-3 h-3 mr-2 text-blue-500" />
                                <span className="truncate">
                                  {activity.type === 'receipt' ? activity.vendor : activity.description}
                                </span>
                                <span className="ml-auto text-green-600 font-medium">
                                  {activity.amount}
                                </span>
                              </div>
                            ))}
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
                className={`w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 ${
                  isOpen ? 'rotate-45' : 'rotate-0'
                }`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                {isOpen ? (
                  <X className="w-8 h-8" />
                ) : (
                  <div className="relative">
                    <Plus className="w-8 h-8" />
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
                  Quick Capture
                  <div className="absolute top-1/2 -right-1 transform -translate-y-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                </motion.div>
              )}

              {/* Pulse Animation for New Users */}
              <div className="absolute inset-0 rounded-full bg-blue-400 opacity-30 animate-ping"></div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Full Screen Capture Modal */}
      <AnimatePresence>
        {showCapture && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
            onClick={() => setShowCapture(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative">
                {/* Close Button */}
                <button
                  onClick={() => setShowCapture(false)}
                  className="absolute -top-12 right-0 w-10 h-10 bg-white/20 hover:bg-white/30 text-white rounded-full flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Enhanced Capture Component */}
                <EnhancedMobileCapture
                  onReceiptCaptured={handleReceiptCaptured}
                  onTransactionCreated={handleTransactionCreated}
                  mode={captureMode}
                  className="shadow-2xl"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Toast */}
      <AnimatePresence>
        {recentActivity.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-24 right-6 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-medium z-40"
          >
            <div className="flex items-center">
              <Zap className="w-4 h-4 mr-2" />
              Receipt processed successfully!
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}