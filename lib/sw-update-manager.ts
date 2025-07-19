/**
 * HERA Universal - Service Worker Update Manager
 * 
 * Handles service worker registration, updates, and version checking
 * Compatible with Next.js 15 App Router and Vercel deployments
 */

'use client';

import { Workbox } from 'workbox-window';

export interface VersionInfo {
  version: string;
  packageVersion: string;
  buildHash: string;
  buildTimestamp: number;
  environment: string;
  deploymentUrl: string;
  gitCommit?: string;
  gitBranch?: string;
  buildTime: string;
}

export interface UpdateNotification {
  type: 'update-available' | 'update-installed' | 'update-failed' | 'offline' | 'online';
  version?: string;
  message: string;
  timestamp: number;
}

export type UpdateCallback = (notification: UpdateNotification) => void;

class ServiceWorkerUpdateManager {
  private wb: Workbox | null = null;
  private currentVersion: string | null = null;
  private updateCallbacks: Set<UpdateCallback> = new Set();
  private checkInterval: NodeJS.Timeout | null = null;
  private isUpdateAvailable = false;
  private isInstalling = false;

  constructor() {
    this.init();
  }

  private async init() {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      console.log('🚫 Service Worker not supported');
      return;
    }

    try {
      // Initialize Workbox
      this.wb = new Workbox('/sw.js', {
        scope: '/',
        updateViaCache: 'none' // Always check for updates
      });

      this.setupEventListeners();
      await this.register();
      await this.checkCurrentVersion();
      this.startPeriodicUpdateCheck();

    } catch (error) {
      console.error('❌ SW Manager initialization failed:', error);
      this.notifyCallbacks({
        type: 'update-failed',
        message: 'Failed to initialize service worker',
        timestamp: Date.now()
      });
    }
  }

  private setupEventListeners() {
    if (!this.wb) return;

    // Service worker waiting (update available)
    this.wb.addEventListener('waiting', (event) => {
      console.log('⏳ SW Update available, waiting to activate');
      this.isUpdateAvailable = true;
      this.notifyCallbacks({
        type: 'update-available',
        message: 'New version available! Click to refresh.',
        timestamp: Date.now()
      });
    });

    // Service worker updated and ready
    this.wb.addEventListener('controlling', (event) => {
      console.log('🎉 SW Update activated');
      this.isUpdateAvailable = false;
      this.isInstalling = false;
      this.notifyCallbacks({
        type: 'update-installed',
        message: 'App updated successfully! Refreshing...',
        timestamp: Date.now()
      });
      
      // Auto-reload after successful update
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    });

    // Service worker activated for the first time
    this.wb.addEventListener('activated', (event) => {
      console.log('✅ SW Activated');
      if (!event.isUpdate) {
        console.log('📱 First time activation - PWA ready');
      }
    });

    // Network status changes
    window.addEventListener('online', () => {
      console.log('🌐 App is online');
      this.notifyCallbacks({
        type: 'online',
        message: 'You are back online!',
        timestamp: Date.now()
      });
      this.checkForUpdates(); // Check for updates when coming online
    });

    window.addEventListener('offline', () => {
      console.log('📱 App is offline');
      this.notifyCallbacks({
        type: 'offline',
        message: 'You are offline. Some features may be limited.',
        timestamp: Date.now()
      });
    });
  }

  private async register(): Promise<void> {
    if (!this.wb) return;

    try {
      const registration = await this.wb.register();
      console.log('✅ SW registered:', registration.scope);

      // Force update check on registration
      if (registration.waiting) {
        console.log('⏳ SW waiting, update available');
        this.isUpdateAvailable = true;
      }

      // Check for updates immediately after registration
      setTimeout(() => this.checkForUpdates(), 1000);

    } catch (error) {
      console.error('❌ SW registration failed:', error);
      throw error;
    }
  }

  private async checkCurrentVersion(): Promise<void> {
    try {
      const response = await fetch('/api/version', {
        cache: 'no-cache',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        this.currentVersion = data.data.version;
        console.log('📦 Current app version:', this.currentVersion);
      }
    } catch (error) {
      console.warn('⚠️ Could not fetch current version:', error);
    }
  }

  public async checkForUpdates(): Promise<boolean> {
    if (!this.wb || this.isInstalling) {
      return false;
    }

    try {
      console.log('🔍 Checking for updates...');

      // Check version endpoint first
      const versionResponse = await fetch('/api/version', {
        cache: 'no-cache',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });

      if (versionResponse.ok) {
        const data = await versionResponse.json();
        const latestVersion = data.data.version;

        if (this.currentVersion && this.currentVersion !== latestVersion) {
          console.log(`🆕 Version mismatch: ${this.currentVersion} → ${latestVersion}`);
          
          // Force service worker update
          const registration = await navigator.serviceWorker.getRegistration();
          if (registration) {
            await registration.update();
            console.log('🔄 SW update triggered');
            return true;
          }
        }
      }

      // Also check workbox for updates
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        await registration.update();
        
        if (registration.waiting) {
          console.log('⏳ SW update found');
          this.isUpdateAvailable = true;
          return true;
        }
      }

      return false;

    } catch (error) {
      console.error('❌ Update check failed:', error);
      return false;
    }
  }

  public async applyUpdate(): Promise<void> {
    if (!this.wb || !this.isUpdateAvailable || this.isInstalling) {
      return;
    }

    try {
      this.isInstalling = true;
      console.log('🔄 Applying update...');

      // Get the waiting service worker
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration?.waiting) {
        // Skip waiting and take control
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        
        // Also use workbox method
        if (this.wb) {
          this.wb.messageSkipWaiting();
        }
      }

    } catch (error) {
      console.error('❌ Failed to apply update:', error);
      this.isInstalling = false;
      this.notifyCallbacks({
        type: 'update-failed',
        message: 'Failed to install update. Please refresh manually.',
        timestamp: Date.now()
      });
    }
  }

  private startPeriodicUpdateCheck(): void {
    // Check for updates every 5 minutes
    this.checkInterval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        this.checkForUpdates();
      }
    }, 5 * 60 * 1000);

    // Also check when page becomes visible
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        setTimeout(() => this.checkForUpdates(), 1000);
      }
    });
  }

  public onUpdate(callback: UpdateCallback): () => void {
    this.updateCallbacks.add(callback);
    return () => this.updateCallbacks.delete(callback);
  }

  private notifyCallbacks(notification: UpdateNotification): void {
    this.updateCallbacks.forEach(callback => {
      try {
        callback(notification);
      } catch (error) {
        console.error('❌ Update callback error:', error);
      }
    });
  }

  public getUpdateStatus() {
    return {
      isUpdateAvailable: this.isUpdateAvailable,
      isInstalling: this.isInstalling,
      currentVersion: this.currentVersion,
      isOnline: navigator.onLine
    };
  }

  public async getVersionInfo(): Promise<VersionInfo | null> {
    try {
      const response = await fetch('/api/version', {
        cache: 'no-cache'
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.data;
      }
      return null;
    } catch (error) {
      console.error('❌ Failed to get version info:', error);
      return null;
    }
  }

  public destroy(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    this.updateCallbacks.clear();
  }
}

// Singleton instance
let swManager: ServiceWorkerUpdateManager | null = null;

export function getSWUpdateManager(): ServiceWorkerUpdateManager {
  if (!swManager) {
    swManager = new ServiceWorkerUpdateManager();
  }
  return swManager;
}

export default ServiceWorkerUpdateManager;