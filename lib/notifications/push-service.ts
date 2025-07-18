/**
 * HERA Universal ERP - Push Notification Service
 * Client-side push notification management
 */

import { supabase } from '@/lib/supabase/client';

export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  data?: Record<string, any>;
  tag?: string;
  requireInteraction?: boolean;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
  url?: string;
  timestamp?: number;
}

export interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  userId: string;
  deviceType: 'desktop' | 'mobile' | 'tablet';
  userAgent: string;
  createdAt: number;
}

export class PushNotificationService {
  private vapidPublicKey: string;
  private registration: ServiceWorkerRegistration | null = null;
  private subscription: PushSubscription | null = null;
  private userId: string | null = null;

  constructor(vapidPublicKey: string) {
    this.vapidPublicKey = vapidPublicKey;
  }

  /**
   * Initialize push notifications
   */
  async initialize(): Promise<void> {
    try {
      // Check if push notifications are supported
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        throw new Error('Push notifications not supported');
      }

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }
      this.userId = user.id;

      // Get service worker registration
      this.registration = await navigator.serviceWorker.ready;
      
      // Check current subscription
      this.subscription = await this.registration.pushManager.getSubscription();
      
      console.log('📱 HERA: Push notification service initialized');
      
      if (this.subscription) {
        console.log('📱 HERA: Existing push subscription found');
        await this.updateSubscription();
      }
    } catch (error) {
      console.error('❌ HERA: Failed to initialize push notifications:', error);
      throw error;
    }
  }

  /**
   * Request permission and subscribe to push notifications
   */
  async requestPermission(): Promise<boolean> {
    try {
      if (!('Notification' in window)) {
        throw new Error('Notifications not supported');
      }

      let permission = Notification.permission;
      
      if (permission === 'default') {
        permission = await Notification.requestPermission();
      }

      if (permission === 'granted') {
        await this.subscribe();
        return true;
      }

      console.log('📱 HERA: Push notification permission denied');
      return false;
    } catch (error) {
      console.error('❌ HERA: Failed to request push permission:', error);
      return false;
    }
  }

  /**
   * Subscribe to push notifications
   */
  async subscribe(): Promise<PushSubscription | null> {
    try {
      if (!this.registration) {
        throw new Error('Service worker not registered');
      }

      // Convert VAPID key to Uint8Array
      const vapidKeyUint8Array = this.urlBase64ToUint8Array(this.vapidPublicKey);
      
      // Subscribe to push notifications
      this.subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidKeyUint8Array
      });

      console.log('📱 HERA: Push subscription created');
      
      // Store subscription on server
      await this.storeSubscription();
      
      return this.subscription;
    } catch (error) {
      console.error('❌ HERA: Failed to subscribe to push notifications:', error);
      throw error;
    }
  }

  /**
   * Unsubscribe from push notifications
   */
  async unsubscribe(): Promise<boolean> {
    try {
      if (!this.subscription) {
        return true;
      }

      // Unsubscribe from push notifications
      const success = await this.subscription.unsubscribe();
      
      if (success) {
        // Remove subscription from server
        await this.removeSubscription();
        this.subscription = null;
        console.log('📱 HERA: Push subscription removed');
      }

      return success;
    } catch (error) {
      console.error('❌ HERA: Failed to unsubscribe from push notifications:', error);
      return false;
    }
  }

  /**
   * Check if push notifications are supported and permitted
   */
  isSupported(): boolean {
    return 'serviceWorker' in navigator && 
           'PushManager' in window && 
           'Notification' in window;
  }

  /**
   * Check if user has granted permission
   */
  hasPermission(): boolean {
    return Notification.permission === 'granted';
  }

  /**
   * Check if currently subscribed
   */
  isSubscribed(): boolean {
    return this.subscription !== null;
  }

  /**
   * Get current subscription details
   */
  getSubscription(): PushSubscription | null {
    return this.subscription;
  }

  /**
   * Show local notification (fallback)
   */
  async showLocalNotification(payload: PushNotificationPayload): Promise<void> {
    try {
      if (!this.hasPermission()) {
        throw new Error('Notification permission not granted');
      }

      const options: NotificationOptions = {
        body: payload.body,
        icon: payload.icon || '/icons/icon-192x192.png',
        badge: payload.badge || '/icons/badge-96x96.png',
        image: payload.image,
        data: payload.data,
        tag: payload.tag,
        requireInteraction: payload.requireInteraction,
        actions: payload.actions,
        timestamp: payload.timestamp || Date.now()
      };

      if (this.registration) {
        // Show via service worker
        await this.registration.showNotification(payload.title, options);
      } else {
        // Show directly
        new Notification(payload.title, options);
      }
    } catch (error) {
      console.error('❌ HERA: Failed to show local notification:', error);
      throw error;
    }
  }

  /**
   * Send push notification via server
   */
  async sendPushNotification(payload: PushNotificationPayload, targetUsers?: string[]): Promise<void> {
    try {
      const { error } = await supabase.functions.invoke('send-push-notification', {
        body: {
          payload,
          targetUsers: targetUsers || (this.userId ? [this.userId] : [])
        }
      });

      if (error) {
        throw error;
      }

      console.log('📱 HERA: Push notification sent');
    } catch (error) {
      console.error('❌ HERA: Failed to send push notification:', error);
      throw error;
    }
  }

  /**
   * Store subscription on server
   */
  private async storeSubscription(): Promise<void> {
    try {
      if (!this.subscription || !this.userId) {
        throw new Error('No subscription or user ID');
      }

      const subscriptionData: PushSubscriptionData = {
        endpoint: this.subscription.endpoint,
        keys: {
          p256dh: this.arrayBufferToBase64(this.subscription.getKey('p256dh')!),
          auth: this.arrayBufferToBase64(this.subscription.getKey('auth')!)
        },
        userId: this.userId,
        deviceType: this.getDeviceType(),
        userAgent: navigator.userAgent,
        createdAt: Date.now()
      };

      const { error } = await supabase
        .from('push_subscriptions')
        .upsert(subscriptionData, {
          onConflict: 'endpoint'
        });

      if (error) {
        throw error;
      }

      console.log('📱 HERA: Push subscription stored on server');
    } catch (error) {
      console.error('❌ HERA: Failed to store push subscription:', error);
      throw error;
    }
  }

  /**
   * Update existing subscription
   */
  private async updateSubscription(): Promise<void> {
    try {
      if (!this.subscription || !this.userId) {
        return;
      }

      const { error } = await supabase
        .from('push_subscriptions')
        .update({
          userId: this.userId,
          userAgent: navigator.userAgent,
          updatedAt: Date.now()
        })
        .eq('endpoint', this.subscription.endpoint);

      if (error) {
        throw error;
      }

      console.log('📱 HERA: Push subscription updated');
    } catch (error) {
      console.error('❌ HERA: Failed to update push subscription:', error);
    }
  }

  /**
   * Remove subscription from server
   */
  private async removeSubscription(): Promise<void> {
    try {
      if (!this.subscription) {
        return;
      }

      const { error } = await supabase
        .from('push_subscriptions')
        .delete()
        .eq('endpoint', this.subscription.endpoint);

      if (error) {
        throw error;
      }

      console.log('📱 HERA: Push subscription removed from server');
    } catch (error) {
      console.error('❌ HERA: Failed to remove push subscription:', error);
      throw error;
    }
  }

  /**
   * Convert VAPID key to Uint8Array
   */
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }

    return outputArray;
  }

  /**
   * Convert ArrayBuffer to base64
   */
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  /**
   * Get device type
   */
  private getDeviceType(): 'desktop' | 'mobile' | 'tablet' {
    const userAgent = navigator.userAgent;
    
    if (/tablet|ipad|playbook|silk/i.test(userAgent)) {
      return 'tablet';
    }
    
    if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(userAgent)) {
      return 'mobile';
    }
    
    return 'desktop';
  }
}

// Notification templates for common use cases
export const NotificationTemplates = {
  transactionApproval: (amount: string, type: string): PushNotificationPayload => ({
    title: 'Transaction Approval Required',
    body: `${type} of ${amount} needs your approval`,
    icon: '/icons/notification-approval.png',
    tag: 'transaction-approval',
    requireInteraction: true,
    actions: [
      { action: 'approve', title: '✅ Approve' },
      { action: 'reject', title: '❌ Reject' },
      { action: 'view', title: '👀 View Details' }
    ],
    data: { type: 'transaction_approval', amount, transactionType: type }
  }),

  inventoryAlert: (item: string, level: number): PushNotificationPayload => ({
    title: 'Low Inventory Alert',
    body: `${item} is running low (${level} remaining)`,
    icon: '/icons/notification-inventory.png',
    tag: 'inventory-alert',
    actions: [
      { action: 'reorder', title: '🛒 Reorder' },
      { action: 'view', title: '👀 View Inventory' }
    ],
    data: { type: 'inventory_alert', item, level }
  }),

  systemUpdate: (version: string): PushNotificationPayload => ({
    title: 'HERA System Update',
    body: `New version ${version} is available`,
    icon: '/icons/notification-update.png',
    tag: 'system-update',
    actions: [
      { action: 'update', title: '🔄 Update Now' },
      { action: 'later', title: '⏰ Later' }
    ],
    data: { type: 'system_update', version }
  }),

  syncComplete: (itemCount: number): PushNotificationPayload => ({
    title: 'Sync Complete',
    body: `Successfully synced ${itemCount} items`,
    icon: '/icons/notification-sync.png',
    tag: 'sync-complete',
    data: { type: 'sync_complete', itemCount }
  }),

  conflictDetected: (entityType: string): PushNotificationPayload => ({
    title: 'Data Conflict Detected',
    body: `${entityType} has conflicting changes that need resolution`,
    icon: '/icons/notification-conflict.png',
    tag: 'conflict-detected',
    requireInteraction: true,
    actions: [
      { action: 'resolve', title: '🔧 Resolve' },
      { action: 'view', title: '👀 View Details' }
    ],
    data: { type: 'conflict_detected', entityType }
  })
};

// Factory function for easy initialization
export function createPushNotificationService(vapidPublicKey: string): PushNotificationService {
  return new PushNotificationService(vapidPublicKey);
}

// Default instance
export const pushNotificationService = createPushNotificationService(
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''
);