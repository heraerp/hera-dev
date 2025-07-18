/**
 * HERA Universal ERP - PWA Configuration
 * Centralized PWA settings and feature flags
 */

export interface PWAConfig {
  // Core PWA Settings
  appName: string;
  appShortName: string;
  appDescription: string;
  appVersion: string;
  
  // Installation
  enableInstallPrompt: boolean;
  installPromptDelay: number;
  installPromptPosition: 'bottom' | 'top' | 'center';
  
  // Offline & Sync
  enableOfflineMode: boolean;
  autoSync: boolean;
  syncInterval: number;
  maxRetries: number;
  conflictResolution: 'client' | 'server' | 'manual';
  defaultTTL: number;
  
  // Storage
  maxStorageSize: number;
  cleanupInterval: number;
  storageWarningThreshold: number;
  
  // Notifications
  enablePushNotifications: boolean;
  vapidPublicKey: string;
  vapidPrivateKey: string;
  webPushEmail: string;
  notificationIcon: string;
  notificationBadge: string;
  
  // Service Worker
  swPath: string;
  swScope: string;
  enableBackgroundSync: boolean;
  enablePeriodicSync: boolean;
  periodicSyncInterval: number;
  
  // Caching
  cacheStrategies: {
    documents: 'NetworkFirst' | 'CacheFirst' | 'StaleWhileRevalidate';
    api: 'NetworkFirst' | 'CacheFirst' | 'StaleWhileRevalidate';
    assets: 'NetworkFirst' | 'CacheFirst' | 'StaleWhileRevalidate';
    images: 'NetworkFirst' | 'CacheFirst' | 'StaleWhileRevalidate';
    fonts: 'NetworkFirst' | 'CacheFirst' | 'StaleWhileRevalidate';
  };
  
  cacheExpiration: {
    documents: number;
    api: number;
    assets: number;
    images: number;
    fonts: number;
  };
  
  // UI Components
  showOfflineIndicator: boolean;
  offlineIndicatorPosition: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  showSyncProgress: boolean;
  enableVibration: boolean;
  
  // Development
  enableDebugLogging: boolean;
  enablePerformanceMonitoring: boolean;
  enableErrorReporting: boolean;
  
  // Feature Flags
  features: {
    offlineTransactions: boolean;
    offlineReports: boolean;
    offlineInventory: boolean;
    offlineApprovals: boolean;
    backgroundDataSync: boolean;
    pushNotifications: boolean;
    webShare: boolean;
    fileHandling: boolean;
    protocolHandling: boolean;
  };
  
  // Business Rules
  businessRules: {
    maxOfflineTransactions: number;
    maxOfflineReports: number;
    criticalDataSyncPriority: string[];
    approvalWorkflowOffline: boolean;
    inventoryThresholdOffline: boolean;
  };
}

// Default PWA Configuration
export const defaultPWAConfig: PWAConfig = {
  // Core PWA Settings
  appName: 'HERA Universal ERP',
  appShortName: 'HERA',
  appDescription: "The world's first Universal Transaction System - AI-powered enterprise platform",
  appVersion: '1.0.0',
  
  // Installation
  enableInstallPrompt: true,
  installPromptDelay: 30000, // 30 seconds
  installPromptPosition: 'bottom',
  
  // Offline & Sync
  enableOfflineMode: true,
  autoSync: true,
  syncInterval: 30000, // 30 seconds
  maxRetries: 3,
  conflictResolution: 'manual',
  defaultTTL: 60, // 1 hour in minutes
  
  // Storage
  maxStorageSize: 500 * 1024 * 1024, // 500MB
  cleanupInterval: 5 * 60 * 1000, // 5 minutes
  storageWarningThreshold: 80, // 80% of quota
  
  // Notifications
  enablePushNotifications: true,
  vapidPublicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '',
  vapidPrivateKey: process.env.VAPID_PRIVATE_KEY || '',
  webPushEmail: process.env.WEB_PUSH_EMAIL || 'mailto:noreply@hera-erp.com',
  notificationIcon: '/icons/icon-192x192.png',
  notificationBadge: '/icons/badge-96x96.png',
  
  // Service Worker
  swPath: '/sw.js',
  swScope: '/',
  enableBackgroundSync: true,
  enablePeriodicSync: true,
  periodicSyncInterval: 24 * 60 * 60 * 1000, // 24 hours
  
  // Caching
  cacheStrategies: {
    documents: 'NetworkFirst',
    api: 'NetworkFirst',
    assets: 'CacheFirst',
    images: 'CacheFirst',
    fonts: 'CacheFirst'
  },
  
  cacheExpiration: {
    documents: 7 * 24 * 60 * 60, // 7 days in seconds
    api: 1 * 60 * 60, // 1 hour
    assets: 30 * 24 * 60 * 60, // 30 days
    images: 60 * 24 * 60 * 60, // 60 days
    fonts: 365 * 24 * 60 * 60 // 1 year
  },
  
  // UI Components
  showOfflineIndicator: true,
  offlineIndicatorPosition: 'top-right',
  showSyncProgress: true,
  enableVibration: true,
  
  // Development
  enableDebugLogging: process.env.NODE_ENV === 'development',
  enablePerformanceMonitoring: true,
  enableErrorReporting: true,
  
  // Feature Flags
  features: {
    offlineTransactions: true,
    offlineReports: true,
    offlineInventory: true,
    offlineApprovals: true,
    backgroundDataSync: true,
    pushNotifications: true,
    webShare: true,
    fileHandling: true,
    protocolHandling: true
  },
  
  // Business Rules
  businessRules: {
    maxOfflineTransactions: 1000,
    maxOfflineReports: 100,
    criticalDataSyncPriority: [
      'transactions',
      'approvals',
      'inventory_updates',
      'financial_data',
      'master_data'
    ],
    approvalWorkflowOffline: true,
    inventoryThresholdOffline: true
  }
};

// Environment-specific configurations
export const pwaConfigs = {
  development: {
    ...defaultPWAConfig,
    enableDebugLogging: true,
    syncInterval: 10000, // 10 seconds for faster testing
    installPromptDelay: 5000, // 5 seconds for faster testing
    enablePerformanceMonitoring: false
  },
  
  staging: {
    ...defaultPWAConfig,
    enableDebugLogging: true,
    syncInterval: 15000, // 15 seconds
    enableErrorReporting: true
  },
  
  production: {
    ...defaultPWAConfig,
    enableDebugLogging: false,
    enablePerformanceMonitoring: true,
    enableErrorReporting: true
  }
};

// Get current PWA configuration based on environment
export function getPWAConfig(): PWAConfig {
  const env = process.env.NODE_ENV || 'development';
  return pwaConfigs[env as keyof typeof pwaConfigs] || defaultPWAConfig;
}

// PWA Capability Detection
export interface PWACapabilities {
  serviceWorker: boolean;
  pushManager: boolean;
  notifications: boolean;
  backgroundSync: boolean;
  periodicSync: boolean;
  webShare: boolean;
  fileSystem: boolean;
  vibration: boolean;
  beforeInstallPrompt: boolean;
  standalone: boolean;
  displayMode: string;
}

export function detectPWACapabilities(): PWACapabilities {
  const capabilities: PWACapabilities = {
    serviceWorker: typeof window !== 'undefined' && 'serviceWorker' in navigator,
    pushManager: typeof window !== 'undefined' && 'PushManager' in window,
    notifications: typeof window !== 'undefined' && 'Notification' in window,
    backgroundSync: typeof window !== 'undefined' && 'serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype,
    periodicSync: typeof window !== 'undefined' && 'serviceWorker' in navigator && 'periodicSync' in window.ServiceWorkerRegistration.prototype,
    webShare: typeof window !== 'undefined' && 'share' in navigator,
    fileSystem: typeof window !== 'undefined' && 'showOpenFilePicker' in window,
    vibration: typeof window !== 'undefined' && 'vibrate' in navigator,
    beforeInstallPrompt: typeof window !== 'undefined',
    standalone: typeof window !== 'undefined' && (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true),
    displayMode: typeof window !== 'undefined' ? window.matchMedia('(display-mode: standalone)').matches ? 'standalone' : 'browser' : 'unknown'
  };

  return capabilities;
}

// PWA Feature Check Functions
export const PWAFeatures = {
  isInstalled: (): boolean => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(display-mode: standalone)').matches || 
           (window.navigator as any).standalone === true;
  },
  
  isOnline: (): boolean => {
    if (typeof window === 'undefined') return true;
    return navigator.onLine;
  },
  
  hasNotificationPermission: (): boolean => {
    if (typeof window === 'undefined') return false;
    return 'Notification' in window && Notification.permission === 'granted';
  },
  
  supportsPushNotifications: (): boolean => {
    if (typeof window === 'undefined') return false;
    return 'serviceWorker' in navigator && 
           'PushManager' in window && 
           'Notification' in window;
  },
  
  supportsBackgroundSync: (): boolean => {
    if (typeof window === 'undefined') return false;
    return 'serviceWorker' in navigator && 
           'sync' in window.ServiceWorkerRegistration.prototype;
  },
  
  supportsPeriodicSync: (): boolean => {
    if (typeof window === 'undefined') return false;
    return 'serviceWorker' in navigator && 
           'periodicSync' in window.ServiceWorkerRegistration.prototype;
  },
  
  supportsWebShare: (): boolean => {
    if (typeof window === 'undefined') return false;
    return 'share' in navigator;
  },
  
  supportsFileHandling: (): boolean => {
    if (typeof window === 'undefined') return false;
    return 'showOpenFilePicker' in window;
  }
};

// Performance Metrics Configuration
export interface PWAPerformanceConfig {
  enableMetrics: boolean;
  metricsEndpoint: string;
  sampleRate: number;
  trackUserTiming: boolean;
  trackResourceTiming: boolean;
  trackNavigationTiming: boolean;
  trackLongTasks: boolean;
  trackFirstPaint: boolean;
  trackFirstContentfulPaint: boolean;
  trackLargestContentfulPaint: boolean;
  trackCumulativeLayoutShift: boolean;
  trackFirstInputDelay: boolean;
}

export const defaultPerformanceConfig: PWAPerformanceConfig = {
  enableMetrics: getPWAConfig().enablePerformanceMonitoring,
  metricsEndpoint: '/api/metrics',
  sampleRate: 0.1, // 10% sampling
  trackUserTiming: true,
  trackResourceTiming: true,
  trackNavigationTiming: true,
  trackLongTasks: true,
  trackFirstPaint: true,
  trackFirstContentfulPaint: true,
  trackLargestContentfulPaint: true,
  trackCumulativeLayoutShift: true,
  trackFirstInputDelay: true
};

// Security Configuration
export interface PWASecurityConfig {
  enableCSP: boolean;
  enableSRI: boolean;
  enableHSTS: boolean;
  enableXFrameOptions: boolean;
  enableXContentTypeOptions: boolean;
  enableReferrerPolicy: boolean;
  trustedDomains: string[];
  allowedProtocols: string[];
}

export const defaultSecurityConfig: PWASecurityConfig = {
  enableCSP: true,
  enableSRI: true,
  enableHSTS: true,
  enableXFrameOptions: true,
  enableXContentTypeOptions: true,
  enableReferrerPolicy: true,
  trustedDomains: [
    'hera-erp.com',
    '*.supabase.co',
    'fonts.googleapis.com',
    'fonts.gstatic.com'
  ],
  allowedProtocols: ['https:', 'wss:', 'hera:']
};