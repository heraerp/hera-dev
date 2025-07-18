/**
 * HERA Universal ERP - PWA Install Prompt
 * Smart installation prompt with user-friendly messaging
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Download, 
  Smartphone, 
  Monitor, 
  X, 
  Star, 
  Zap, 
  Shield,
  Wifi,
  Bell
} from 'lucide-react';

interface InstallPromptProps {
  className?: string;
  autoShow?: boolean;
  showDelay?: number;
  position?: 'bottom' | 'top' | 'center';
}

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function InstallPrompt({ 
  className = '', 
  autoShow = true,
  showDelay = 30000, // 30 seconds
  position = 'bottom'
}: InstallPromptProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [userDismissed, setUserDismissed] = useState(false);

  useEffect(() => {
    // Check if already installed
    const checkInstalled = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isWebApp = (window.navigator as any).standalone === true;
      const isInstalled = isStandalone || isWebApp;
      
      setIsInstalled(isInstalled);
      
      if (isInstalled) {
        console.log('🎉 HERA: PWA is installed');
      }
    };

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const event = e as BeforeInstallPromptEvent;
      setDeferredPrompt(event);
      
      console.log('📱 HERA: Install prompt available');
      
      // Show prompt after delay if autoShow is enabled
      if (autoShow && !userDismissed) {
        setTimeout(() => {
          setShowPrompt(true);
        }, showDelay);
      }
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      console.log('✅ HERA: PWA was installed');
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
    };

    // Check initial state
    checkInstalled();

    // Add event listeners
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Cleanup
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [autoShow, showDelay, userDismissed]);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    setIsInstalling(true);
    
    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      console.log(`📱 HERA: User ${outcome} the install prompt`);
      
      if (outcome === 'accepted') {
        setIsInstalled(true);
      }
      
      setDeferredPrompt(null);
      setShowPrompt(false);
    } catch (error) {
      console.error('❌ HERA: Install prompt failed:', error);
    } finally {
      setIsInstalling(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setUserDismissed(true);
    
    // Remember dismissal for 24 hours
    localStorage.setItem('hera-install-dismissed', Date.now().toString());
  };

  const handleShowManual = () => {
    setShowPrompt(true);
  };

  // Check if user dismissed recently
  useEffect(() => {
    const dismissed = localStorage.getItem('hera-install-dismissed');
    if (dismissed) {
      const dismissTime = parseInt(dismissed);
      const dayInMs = 24 * 60 * 60 * 1000;
      
      if (Date.now() - dismissTime < dayInMs) {
        setUserDismissed(true);
      }
    }
  }, []);

  const getPositionClasses = () => {
    switch (position) {
      case 'top':
        return 'top-0 left-0 right-0';
      case 'center':
        return 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2';
      default:
        return 'bottom-0 left-0 right-0';
    }
  };

  const features = [
    {
      icon: <Zap className="w-5 h-5" />,
      title: 'Lightning Fast',
      description: 'Instant loading and smooth performance'
    },
    {
      icon: <Wifi className="w-5 h-5" />,
      title: 'Works Offline',
      description: 'Full functionality without internet'
    },
    {
      icon: <Bell className="w-5 h-5" />,
      title: 'Push Notifications',
      description: 'Stay updated with real-time alerts'
    },
    {
      icon: <Shield className="w-5 h-5" />,
      title: 'Secure & Private',
      description: 'Enterprise-grade security'
    }
  ];

  // Don't show if already installed
  if (isInstalled) {
    return null;
  }

  return (
    <>
      {/* Manual Install Button (always available) */}
      {!showPrompt && deferredPrompt && (
        <motion.button
          onClick={handleShowManual}
          className={`fixed bottom-4 right-4 z-40 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-all duration-200 ${className}`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Download className="w-6 h-6" />
        </motion.button>
      )}

      {/* Install Prompt Modal */}
      <AnimatePresence>
        {showPrompt && deferredPrompt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 relative">
                <button
                  onClick={handleDismiss}
                  className="absolute top-4 right-4 p-1 rounded-full hover:bg-white hover:bg-opacity-20 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
                
                <div className="flex items-center gap-3">
                  <div className="bg-white bg-opacity-20 p-3 rounded-full">
                    <Smartphone className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Install HERA ERP</h2>
                    <p className="text-blue-100">Get the full app experience</p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="text-center mb-6">
                  <div className="flex justify-center mb-4">
                    <div className="bg-blue-100 dark:bg-blue-900 p-4 rounded-full">
                      <Monitor className="w-8 h-8 text-blue-600 dark:text-blue-300" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Transform your workflow
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    Install HERA ERP as a native app for the best experience. No app store required!
                  </p>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {features.map((feature, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      <div className="flex justify-center mb-2 text-blue-600 dark:text-blue-300">
                        {feature.icon}
                      </div>
                      <h4 className="font-medium text-sm text-gray-900 dark:text-white">
                        {feature.title}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {feature.description}
                      </p>
                    </motion.div>
                  ))}
                </div>

                {/* Benefits */}
                <div className="bg-green-50 dark:bg-green-900 dark:bg-opacity-20 rounded-lg p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <Star className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-green-900 dark:text-green-100 text-sm">
                        Why install?
                      </h4>
                      <ul className="text-xs text-green-700 dark:text-green-200 mt-1 space-y-1">
                        <li>• Faster loading and smoother performance</li>
                        <li>• Works completely offline</li>
                        <li>• Desktop shortcut and taskbar integration</li>
                        <li>• Push notifications for important updates</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={handleDismiss}
                    className="flex-1 px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors"
                  >
                    Maybe Later
                  </button>
                  <button
                    onClick={handleInstall}
                    disabled={isInstalling}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isInstalling ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Installing...
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        Install Now
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Banner (Alternative Layout) */}
      <AnimatePresence>
        {showPrompt && deferredPrompt && position === 'bottom' && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 shadow-2xl border-t border-gray-200 dark:border-gray-700"
          >
            <div className="p-4">
              <div className="flex items-center gap-4">
                <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-lg">
                  <Smartphone className="w-6 h-6 text-blue-600 dark:text-blue-300" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Install HERA ERP
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Get the full app experience with offline support
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleDismiss}
                    className="px-3 py-1 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors"
                  >
                    Not now
                  </button>
                  <button
                    onClick={handleInstall}
                    disabled={isInstalling}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isInstalling ? (
                      <>
                        <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Installing...
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        Install
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}