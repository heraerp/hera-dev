/**
 * HERA Universal - Update Notification Component
 * 
 * Shows user-friendly notifications for app updates, offline status, etc.
 * Compatible with Tailwind UI and supports both light/dark themes
 */

'use client';

import React, { useState, useEffect } from 'react';
import { X, Download, Wifi, WifiOff, RefreshCw, AlertCircle } from 'lucide-react';
import { getSWUpdateManager, UpdateNotification, VersionInfo } from '@/lib/sw-update-manager';

interface UpdateNotificationProps {
  position?: 'top' | 'bottom';
  className?: string;
}

export const UpdateNotificationComponent: React.FC<UpdateNotificationProps> = ({
  position = 'top',
  className = ''
}) => {
  const [notification, setNotification] = useState<UpdateNotification | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [versionInfo, setVersionInfo] = useState<VersionInfo | null>(null);
  const [isApplyingUpdate, setIsApplyingUpdate] = useState(false);

  useEffect(() => {
    const swManager = getSWUpdateManager();

    // Subscribe to update notifications
    const unsubscribe = swManager.onUpdate((notification) => {
      console.log('📱 Update notification:', notification);
      setNotification(notification);
      setIsVisible(true);

      // Auto-hide certain notifications
      if (notification.type === 'online' || notification.type === 'update-installed') {
        setTimeout(() => {
          setIsVisible(false);
        }, notification.type === 'update-installed' ? 5000 : 3000);
      }
    });

    // Get initial version info
    swManager.getVersionInfo().then(setVersionInfo);

    return unsubscribe;
  }, []);

  const handleApplyUpdate = async () => {
    if (!notification || notification.type !== 'update-available') return;

    setIsApplyingUpdate(true);
    try {
      const swManager = getSWUpdateManager();
      await swManager.applyUpdate();
    } catch (error) {
      console.error('❌ Failed to apply update:', error);
      setIsApplyingUpdate(false);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  const getNotificationConfig = (type: UpdateNotification['type']) => {
    switch (type) {
      case 'update-available':
        return {
          icon: Download,
          bgColor: 'bg-blue-50 dark:bg-blue-900/20',
          borderColor: 'border-blue-200 dark:border-blue-700',
          textColor: 'text-blue-900 dark:text-blue-100',
          iconColor: 'text-blue-600 dark:text-blue-400',
          buttonColor: 'bg-blue-600 hover:bg-blue-700 text-white',
          showAction: true,
          actionText: 'Update Now',
          persistent: true
        };
      case 'update-installed':
        return {
          icon: RefreshCw,
          bgColor: 'bg-green-50 dark:bg-green-900/20',
          borderColor: 'border-green-200 dark:border-green-700',
          textColor: 'text-green-900 dark:text-green-100',
          iconColor: 'text-green-600 dark:text-green-400',
          buttonColor: 'bg-green-600 hover:bg-green-700 text-white',
          showAction: false,
          persistent: false
        };
      case 'update-failed':
        return {
          icon: AlertCircle,
          bgColor: 'bg-red-50 dark:bg-red-900/20',
          borderColor: 'border-red-200 dark:border-red-700',
          textColor: 'text-red-900 dark:text-red-100',
          iconColor: 'text-red-600 dark:text-red-400',
          buttonColor: 'bg-red-600 hover:bg-red-700 text-white',
          showAction: true,
          actionText: 'Refresh',
          persistent: true
        };
      case 'offline':
        return {
          icon: WifiOff,
          bgColor: 'bg-gray-50 dark:bg-gray-900/20',
          borderColor: 'border-gray-200 dark:border-gray-700',
          textColor: 'text-gray-900 dark:text-gray-100',
          iconColor: 'text-gray-600 dark:text-gray-400',
          buttonColor: 'bg-gray-600 hover:bg-gray-700 text-white',
          showAction: false,
          persistent: true
        };
      case 'online':
        return {
          icon: Wifi,
          bgColor: 'bg-green-50 dark:bg-green-900/20',
          borderColor: 'border-green-200 dark:border-green-700',
          textColor: 'text-green-900 dark:text-green-100',
          iconColor: 'text-green-600 dark:text-green-400',
          buttonColor: 'bg-green-600 hover:bg-green-700 text-white',
          showAction: false,
          persistent: false
        };
      default:
        return {
          icon: AlertCircle,
          bgColor: 'bg-blue-50 dark:bg-blue-900/20',
          borderColor: 'border-blue-200 dark:border-blue-700',
          textColor: 'text-blue-900 dark:text-blue-100',
          iconColor: 'text-blue-600 dark:text-blue-400',
          buttonColor: 'bg-blue-600 hover:bg-blue-700 text-white',
          showAction: false,
          persistent: false
        };
    }
  };

  if (!notification || !isVisible) {
    return null;
  }

  const config = getNotificationConfig(notification.type);
  const Icon = config.icon;

  const positionClasses = position === 'top' 
    ? 'top-4 animate-in slide-in-from-top-2' 
    : 'bottom-4 animate-in slide-in-from-bottom-2';

  return (
    <div className={`fixed left-4 right-4 z-50 ${positionClasses} ${className}`}>
      <div className="mx-auto max-w-sm">
        <div className={`
          ${config.bgColor} ${config.borderColor} ${config.textColor}
          border rounded-lg shadow-lg p-4 flex items-start space-x-3
          transition-all duration-300 ease-in-out
        `}>
          <div className={`flex-shrink-0 ${config.iconColor}`}>
            <Icon className="h-5 w-5" />
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">
              {notification.message}
            </p>
            
            {notification.type === 'update-available' && versionInfo && (
              <p className="text-xs opacity-75 mt-1">
                Version {versionInfo.packageVersion} available
              </p>
            )}
            
            {config.showAction && (
              <div className="mt-3 flex space-x-2">
                <button
                  onClick={notification.type === 'update-failed' ? handleRefresh : handleApplyUpdate}
                  disabled={isApplyingUpdate}
                  className={`
                    ${config.buttonColor}
                    px-3 py-1.5 text-xs font-medium rounded-md
                    transition-colors duration-200
                    disabled:opacity-50 disabled:cursor-not-allowed
                    flex items-center space-x-1
                  `}
                >
                  {isApplyingUpdate ? (
                    <>
                      <RefreshCw className="h-3 w-3 animate-spin" />
                      <span>Updating...</span>
                    </>
                  ) : (
                    <span>{config.actionText}</span>
                  )}
                </button>
                
                {config.persistent && (
                  <button
                    onClick={handleDismiss}
                    className="text-xs px-2 py-1.5 opacity-75 hover:opacity-100 transition-opacity"
                  >
                    Later
                  </button>
                )}
              </div>
            )}
          </div>
          
          {!config.showAction && (
            <button
              onClick={handleDismiss}
              className="flex-shrink-0 opacity-75 hover:opacity-100 transition-opacity"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Hook for using update notifications
export const useUpdateNotifications = () => {
  const [updateStatus, setUpdateStatus] = useState({
    isUpdateAvailable: false,
    isInstalling: false,
    currentVersion: null as string | null,
    isOnline: true
  });

  useEffect(() => {
    const swManager = getSWUpdateManager();
    
    // Get initial status
    setUpdateStatus(swManager.getUpdateStatus());
    
    // Subscribe to updates
    const unsubscribe = swManager.onUpdate(() => {
      setUpdateStatus(swManager.getUpdateStatus());
    });

    return unsubscribe;
  }, []);

  const checkForUpdates = async () => {
    const swManager = getSWUpdateManager();
    return swManager.checkForUpdates();
  };

  const applyUpdate = async () => {
    const swManager = getSWUpdateManager();
    return swManager.applyUpdate();
  };

  const getVersionInfo = async () => {
    const swManager = getSWUpdateManager();
    return swManager.getVersionInfo();
  };

  return {
    updateStatus,
    checkForUpdates,
    applyUpdate,
    getVersionInfo
  };
};

export default UpdateNotificationComponent;