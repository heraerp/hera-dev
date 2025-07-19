/**
 * HERA Universal ERP - Enhanced Service Worker
 * Advanced PWA capabilities with offline-first architecture
 */

import { precacheAndRoute, cleanupOutdatedCaches, createHandlerBoundToURL } from 'workbox-precaching';
import { NavigationRoute, registerRoute } from 'workbox-routing';
import { NetworkFirst, CacheFirst, StaleWhileRevalidate, NetworkOnly } from 'workbox-strategies';
import { BackgroundSync } from 'workbox-background-sync';
import { ExpirationPlugin } from 'workbox-expiration';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { Queue } from 'workbox-background-sync';

// Service Worker version for cache busting - update this for new deployments
const SW_VERSION = `${process.env.npm_package_version || '1.0.0'}-${Date.now()}`;
const CACHE_PREFIX = 'hera-erp';
const BUILD_TIMESTAMP = Date.now();

// Initialize Workbox - force immediate activation
self.skipWaiting();

// Handle messages from clients
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('🚀 HERA: Skipping waiting, activating new SW');
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ 
      version: SW_VERSION,
      buildTimestamp: BUILD_TIMESTAMP
    });
  }
});

// Precache static assets
precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();

// App Shell - Cache First Strategy
registerRoute(
  ({ request, url }) => {
    return request.destination === 'document' && url.pathname.startsWith('/');
  },
  new NetworkFirst({
    cacheName: `${CACHE_PREFIX}-app-shell-${SW_VERSION}`,
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200]
      }),
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 24 * 60 * 60 * 7 // 7 days
      })
    ]
  })
);

// API Routes - Network First with Background Sync
const apiQueue = new Queue('hera-api-queue', {
  onSync: async ({ queue }) => {
    console.log('🔄 HERA: Background sync started');
    let entry;
    while ((entry = await queue.shiftRequest())) {
      try {
        const response = await fetch(entry.request);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        console.log('✅ HERA: Synced request:', entry.request.url);
        
        // Notify clients of successful sync
        self.clients.matchAll().then(clients => {
          clients.forEach(client => {
            client.postMessage({
              type: 'SYNC_SUCCESS',
              url: entry.request.url,
              timestamp: Date.now()
            });
          });
        });
      } catch (error) {
        console.error('❌ HERA: Sync failed for:', entry.request.url, error);
        
        // Re-queue failed requests (with retry limit)
        const retryCount = (entry.metadata?.retryCount || 0) + 1;
        if (retryCount <= 3) {
          await queue.unshiftRequest({
            ...entry,
            metadata: { ...entry.metadata, retryCount }
          });
        } else {
          // Notify clients of permanent failure
          self.clients.matchAll().then(clients => {
            clients.forEach(client => {
              client.postMessage({
                type: 'SYNC_FAILED',
                url: entry.request.url,
                error: error.message,
                timestamp: Date.now()
              });
            });
          });
        }
        throw error;
      }
    }
  }
});

// Supabase API - Network First with offline queue
registerRoute(
  ({ url }) => url.hostname.includes('supabase'),
  new NetworkFirst({
    cacheName: `${CACHE_PREFIX}-supabase-api-${SW_VERSION}`,
    networkTimeoutSeconds: 10,
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200]
      }),
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 60 * 60 // 1 hour
      }),
      {
        requestWillFetch: async ({ request }) => {
          // Add offline indicator to requests
          const headers = new Headers(request.headers);
          headers.set('X-Offline-Capable', 'true');
          return new Request(request, { headers });
        },
        fetchDidFail: async ({ originalRequest, request, error }) => {
          console.log('🔄 HERA: Adding failed request to queue:', request.url);
          // Only queue POST, PUT, PATCH, DELETE requests
          if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) {
            await apiQueue.pushRequest({ request: originalRequest });
          }
        }
      }
    ]
  })
);

// Static Assets - Cache First
registerRoute(
  ({ request }) => request.destination === 'style' || 
                  request.destination === 'script' ||
                  request.destination === 'worker',
  new CacheFirst({
    cacheName: `${CACHE_PREFIX}-static-assets-${SW_VERSION}`,
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200]
      }),
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days
      })
    ]
  })
);

// Images - Cache First with long expiration
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: `${CACHE_PREFIX}-images-${SW_VERSION}`,
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200]
      }),
      new ExpirationPlugin({
        maxEntries: 200,
        maxAgeSeconds: 60 * 24 * 60 * 60 // 60 days
      })
    ]
  })
);

// Fonts - Cache First with very long expiration
registerRoute(
  ({ request }) => request.destination === 'font',
  new CacheFirst({
    cacheName: `${CACHE_PREFIX}-fonts-${SW_VERSION}`,
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200]
      }),
      new ExpirationPlugin({
        maxEntries: 30,
        maxAgeSeconds: 365 * 24 * 60 * 60 // 1 year
      })
    ]
  })
);

// App Navigation - SPA routing
const navigationHandler = createHandlerBoundToURL('/');
const navigationRoute = new NavigationRoute(navigationHandler, {
  denylist: [/^\/_/, /\/[^/?]+\.[^/]+$/]
});
registerRoute(navigationRoute);

// Push Notification Handling
self.addEventListener('push', (event) => {
  console.log('📱 HERA: Push notification received');
  
  const options = {
    badge: '/icons/badge-96x96.png',
    icon: '/icons/icon-192x192.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'approve',
        title: '✅ Approve',
        icon: '/icons/action-approve.png'
      },
      {
        action: 'view',
        title: '👀 View Details',
        icon: '/icons/action-view.png'
      },
      {
        action: 'dismiss',
        title: '❌ Dismiss',
        icon: '/icons/action-dismiss.png'
      }
    ],
    requireInteraction: true,
    silent: false,
    renotify: true,
    tag: 'hera-notification'
  };

  let notificationData = {
    title: 'HERA Notification',
    body: 'You have a new notification',
    ...options
  };

  if (event.data) {
    try {
      const pushData = event.data.json();
      notificationData = {
        title: pushData.title || 'HERA Universal ERP',
        body: pushData.body || 'New notification',
        ...options,
        data: {
          ...options.data,
          ...pushData.data
        }
      };
    } catch (error) {
      console.error('❌ HERA: Error parsing push data:', error);
    }
  }

  const promiseChain = self.registration.showNotification(
    notificationData.title,
    notificationData
  );

  event.waitUntil(promiseChain);
});

// Notification Click Handling
self.addEventListener('notificationclick', (event) => {
  console.log('🔔 HERA: Notification clicked:', event.action);
  
  event.notification.close();
  
  const notificationData = event.notification.data;
  let targetUrl = '/';
  
  switch (event.action) {
    case 'approve':
      targetUrl = `/approvals/${notificationData.approvalId || ''}`;
      break;
    case 'view':
      targetUrl = notificationData.url || '/dashboard';
      break;
    case 'dismiss':
      // Just close the notification
      return;
    default:
      targetUrl = notificationData.url || '/dashboard';
      break;
  }
  
  const promiseChain = clients.openWindow(targetUrl);
  event.waitUntil(promiseChain);
});

// Background Sync
self.addEventListener('sync', (event) => {
  console.log('🔄 HERA: Background sync triggered:', event.tag);
  
  if (event.tag === 'hera-background-sync') {
    event.waitUntil(
      syncOfflineData()
        .then(() => {
          console.log('✅ HERA: Background sync completed');
          return self.clients.matchAll();
        })
        .then(clients => {
          clients.forEach(client => {
            client.postMessage({
              type: 'BACKGROUND_SYNC_COMPLETE',
              timestamp: Date.now()
            });
          });
        })
        .catch(error => {
          console.error('❌ HERA: Background sync failed:', error);
        })
    );
  }
});

// Periodic Background Sync (when supported)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'hera-periodic-sync') {
    console.log('⏰ HERA: Periodic sync triggered');
    event.waitUntil(syncOfflineData());
  }
});

// Custom offline data sync function
async function syncOfflineData() {
  try {
    // Open IndexedDB and sync offline transactions
    const db = await openDB();
    const offlineTransactions = await getOfflineTransactions(db);
    
    for (const transaction of offlineTransactions) {
      try {
        const response = await fetch(transaction.url, {
          method: transaction.method,
          headers: transaction.headers,
          body: transaction.body
        });
        
        if (response.ok) {
          // Remove synced transaction from offline storage
          await removeOfflineTransaction(db, transaction.id);
          console.log('✅ HERA: Synced offline transaction:', transaction.id);
        }
      } catch (error) {
        console.error('❌ HERA: Failed to sync transaction:', transaction.id, error);
      }
    }
  } catch (error) {
    console.error('❌ HERA: Sync error:', error);
    throw error;
  }
}

// IndexedDB helpers
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('hera-offline-db', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      // Create offline transactions store
      if (!db.objectStoreNames.contains('offlineTransactions')) {
        const store = db.createObjectStore('offlineTransactions', { keyPath: 'id', autoIncrement: true });
        store.createIndex('timestamp', 'timestamp', { unique: false });
        store.createIndex('type', 'type', { unique: false });
      }
      
      // Create offline data store
      if (!db.objectStoreNames.contains('offlineData')) {
        const store = db.createObjectStore('offlineData', { keyPath: 'key' });
        store.createIndex('timestamp', 'timestamp', { unique: false });
        store.createIndex('type', 'type', { unique: false });
      }
    };
  });
}

function getOfflineTransactions(db) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['offlineTransactions'], 'readonly');
    const store = transaction.objectStore('offlineTransactions');
    const request = store.getAll();
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

function removeOfflineTransaction(db, id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['offlineTransactions'], 'readwrite');
    const store = transaction.objectStore('offlineTransactions');
    const request = store.delete(id);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

// App Update Handling
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: SW_VERSION });
  }
  
  if (event.data && event.data.type === 'CHECK_UPDATE') {
    event.waitUntil(
      checkForUpdates().then(hasUpdate => {
        event.ports[0].postMessage({ hasUpdate });
      })
    );
  }
});

async function checkForUpdates() {
  try {
    const response = await fetch('/api/version');
    const { version } = await response.json();
    return version !== SW_VERSION;
  } catch (error) {
    console.error('❌ HERA: Update check failed:', error);
    return false;
  }
}

// Install and Activate Events
self.addEventListener('install', (event) => {
  console.log('📦 HERA: Service Worker installing, version:', SW_VERSION);
  // Force immediate activation
  self.skipWaiting();
  
  event.waitUntil(
    Promise.resolve().then(() => {
      console.log('✅ HERA: Installation complete');
      
      // Notify clients about new version
      return self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({
            type: 'SW_INSTALLED',
            version: SW_VERSION,
            timestamp: Date.now()
          });
        });
      });
    })
  );
});

self.addEventListener('activate', (event) => {
  console.log('🚀 HERA: Service Worker activated, version:', SW_VERSION);
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches aggressively
      caches.keys().then(cacheNames => {
        const currentCachePattern = new RegExp(`${CACHE_PREFIX}.*${SW_VERSION.split('-')[0]}`);
        
        return Promise.all(
          cacheNames
            .filter(cacheName => {
              // Delete all HERA caches that don't match current version pattern
              return cacheName.startsWith(CACHE_PREFIX) && 
                     !currentCachePattern.test(cacheName);
            })
            .map(cacheName => {
              console.log('🗑️ HERA: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      }),
      // Take control of all clients immediately
      self.clients.claim()
    ]).then(() => {
      console.log('✅ HERA: Activation complete, clients claimed');
      
      // Notify all clients about activation
      return self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({
            type: 'SW_ACTIVATED',
            version: SW_VERSION,
            timestamp: Date.now()
          });
        });
      });
    })
  );
});

// Error Handling
self.addEventListener('error', (event) => {
  console.error('❌ HERA: Service Worker error:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('❌ HERA: Service Worker unhandled promise rejection:', event.reason);
  event.preventDefault();
});

console.log('🎉 HERA: Service Worker loaded successfully, version:', SW_VERSION);