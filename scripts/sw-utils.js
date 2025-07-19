#!/usr/bin/env node

/**
 * HERA Universal - Service Worker Development Utilities
 * 
 * Command-line utilities for managing service worker during development
 * Usage: node scripts/sw-utils.js [command]
 */

const fs = require('fs');
const path = require('path');

const commands = {
  unregister: unregisterServiceWorker,
  status: checkServiceWorkerStatus,
  clear: clearAllCaches,
  version: showVersionInfo,
  help: showHelp
};

function showHelp() {
  console.log(`
🔧 HERA Service Worker Development Utilities

Usage: node scripts/sw-utils.js [command]

Commands:
  unregister    Generate script to unregister service worker
  status        Show current service worker registration status  
  clear         Generate script to clear all caches
  version       Show version information
  help          Show this help message

Examples:
  node scripts/sw-utils.js unregister
  node scripts/sw-utils.js clear
  node scripts/sw-utils.js status

Note: Some commands generate JavaScript code that you need to run in the browser console.
  `);
}

function unregisterServiceWorker() {
  console.log(`
🗑️  Service Worker Unregistration Script

Copy and paste this code into your browser's developer console:

\`\`\`javascript
(async function unregisterServiceWorker() {
  try {
    console.log('🔍 Checking for service worker registrations...');
    
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      
      if (registrations.length === 0) {
        console.log('✅ No service worker registrations found');
        return;
      }
      
      console.log(\`📋 Found \${registrations.length} registration(s)\`);
      
      for (const registration of registrations) {
        console.log(\`🗑️  Unregistering: \${registration.scope}\`);
        await registration.unregister();
        console.log('✅ Unregistered successfully');
      }
      
      // Clear all caches
      console.log('🧹 Clearing all caches...');
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => {
          console.log(\`🗑️  Deleting cache: \${cacheName}\`);
          return caches.delete(cacheName);
        })
      );
      
      console.log('✅ All service workers unregistered and caches cleared!');
      console.log('🔄 Refresh the page to complete the process');
      
    } else {
      console.log('❌ Service Worker not supported in this browser');
    }
  } catch (error) {
    console.error('❌ Error unregistering service worker:', error);
  }
})();
\`\`\`

After running this script in the console, refresh the page.
  `);
}

function checkServiceWorkerStatus() {
  console.log(`
📊 Service Worker Status Check Script

Copy and paste this code into your browser's developer console:

\`\`\`javascript
(async function checkServiceWorkerStatus() {
  try {
    if (!('serviceWorker' in navigator)) {
      console.log('❌ Service Worker not supported');
      return;
    }
    
    console.log('🔍 Checking service worker status...');
    
    // Check registrations
    const registrations = await navigator.serviceWorker.getRegistrations();
    console.log(\`📋 Active registrations: \${registrations.length}\`);
    
    registrations.forEach((reg, index) => {
      console.log(\`\n📦 Registration \${index + 1}:\`);
      console.log(\`  Scope: \${reg.scope}\`);
      console.log(\`  Active: \${reg.active ? '✅ Yes' : '❌ No'}\`);
      console.log(\`  Installing: \${reg.installing ? '⏳ Yes' : '❌ No'}\`);
      console.log(\`  Waiting: \${reg.waiting ? '⏳ Yes' : '❌ No'}\`);
      
      if (reg.active) {
        console.log(\`  Script URL: \${reg.active.scriptURL}\`);
        console.log(\`  State: \${reg.active.state}\`);
      }
    });
    
    // Check caches
    const cacheNames = await caches.keys();
    console.log(\`\n💾 Caches: \${cacheNames.length}\`);
    cacheNames.forEach((name, index) => {
      console.log(\`  \${index + 1}. \${name}\`);
    });
    
    // Check network status
    console.log(\`\n🌐 Network: \${navigator.onLine ? '✅ Online' : '❌ Offline'}\`);
    
    // Try to get version info
    try {
      const response = await fetch('/api/version', { cache: 'no-cache' });
      if (response.ok) {
        const data = await response.json();
        console.log(\`\n📦 App Version: \${data.data.version}\`);
        console.log(\`   Build Hash: \${data.data.buildHash}\`);
        console.log(\`   Environment: \${data.data.environment}\`);
      }
    } catch (error) {
      console.log('⚠️  Could not fetch version info:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Error checking status:', error);
  }
})();
\`\`\`
  `);
}

function clearAllCaches() {
  console.log(`
🧹 Clear All Caches Script

Copy and paste this code into your browser's developer console:

\`\`\`javascript
(async function clearAllCaches() {
  try {
    console.log('🧹 Clearing all caches...');
    
    const cacheNames = await caches.keys();
    console.log(\`📋 Found \${cacheNames.length} cache(s)\`);
    
    if (cacheNames.length === 0) {
      console.log('✅ No caches to clear');
      return;
    }
    
    const deletePromises = cacheNames.map(cacheName => {
      console.log(\`🗑️  Deleting cache: \${cacheName}\`);
      return caches.delete(cacheName);
    });
    
    await Promise.all(deletePromises);
    console.log('✅ All caches cleared successfully!');
    console.log('🔄 Consider refreshing the page');
    
  } catch (error) {
    console.error('❌ Error clearing caches:', error);
  }
})();
\`\`\`
  `);
}

function showVersionInfo() {
  try {
    const packageJsonPath = path.join(__dirname, '..', 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const nextConfigPath = path.join(__dirname, '..', 'next.config.js');
    
    console.log(`
📦 HERA Universal - Version Information

Package Version: ${packageJson.version || '1.0.0'}
Next.js Version: ${packageJson.dependencies?.next || 'Unknown'}
PWA Plugin: ${packageJson.dependencies?.['next-pwa'] || 'Unknown'}
Workbox: ${packageJson.dependencies?.['workbox-window'] || 'Unknown'}

Configuration:
- PWA Enabled: ${fs.existsSync(nextConfigPath) ? '✅ Yes' : '❌ No'}
- Custom Worker: ${fs.existsSync(path.join(__dirname, '..', 'worker', 'index.js')) ? '✅ Yes' : '❌ No'}
- Manifest: ${fs.existsSync(path.join(__dirname, '..', 'public', 'manifest.json')) ? '✅ Yes' : '❌ No'}

Build Timestamp: ${Date.now()}
Node Environment: ${process.env.NODE_ENV || 'development'}
    `);
    
  } catch (error) {
    console.error('❌ Error reading version info:', error.message);
  }
}

// Main execution
const command = process.argv[2] || 'help';

if (commands[command]) {
  console.log('🚀 HERA Universal - Service Worker Utilities\n');
  commands[command]();
} else {
  console.error(`❌ Unknown command: ${command}`);
  console.log('Run "node scripts/sw-utils.js help" for available commands');
  process.exit(1);
}