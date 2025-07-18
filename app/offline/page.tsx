/**
 * HERA Universal - Offline Page
 * Displayed when user is offline and tries to access uncached content
 */

'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { WifiOff, RefreshCw, Home, CloudOff } from 'lucide-react';
import { Button } from '@/components/ui/revolutionary-button';
import { Card } from '@/components/ui/revolutionary-card';

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    setIsOnline(navigator.onLine);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (isOnline) {
      // Reload the page when connection is restored
      window.location.reload();
    }
  }, [isOnline]);

  const handleRetry = () => {
    window.location.reload();
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="max-w-md w-full p-8 text-center">
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              opacity: [0.8, 1, 0.8]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="mb-6"
          >
            <CloudOff className="w-24 h-24 mx-auto text-muted-foreground" />
          </motion.div>
          
          <h1 className="text-2xl font-bold mb-2">You're Offline</h1>
          <p className="text-muted-foreground mb-6">
            It looks like you've lost your internet connection. 
            Some features may not be available until you're back online.
          </p>

          <div className="space-y-3">
            <Button
              variant="gradient"
              onClick={handleRetry}
              className="w-full"
              size="lg"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            
            <Button
              variant="outline"
              onClick={handleGoHome}
              className="w-full"
              size="lg"
            >
              <Home className="w-4 h-4 mr-2" />
              Go to Home
            </Button>
          </div>

          <div className="mt-8 p-4 bg-muted rounded-lg">
            <h3 className="font-semibold mb-2 flex items-center justify-center gap-2">
              <WifiOff className="w-4 h-4" />
              Offline Capabilities
            </h3>
            <p className="text-sm text-muted-foreground">
              HERA Universal supports offline operations. You can continue scanning documents, 
              processing invoices, and managing inventory. Your data will sync automatically 
              when you're back online.
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}