'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Smartphone,
  Wifi,
  WifiOff,
  Camera,
  Download,
  Upload,
  Battery,
  Signal,
  Users,
  Activity,
  CheckCircle,
  AlertCircle,
  Clock,
  Zap,
  Shield,
  Globe,
  RefreshCw,
  Eye,
  Target,
  Heart,
  Cpu
} from 'lucide-react';

interface MobileFirstDashboardProps {
  organizationId: string;
}

interface MobileMetrics {
  total_mobile_users: number;
  active_mobile_sessions: number;
  offline_operations_today: number;
  sync_success_rate: number;
  avg_offline_duration: number;
  camera_scans_today: number;
  mobile_performance_score: number;
  offline_storage_usage: number;
}

interface OfflineCapability {
  feature_name: string;
  offline_ready: boolean;
  sync_status: 'synced' | 'pending' | 'conflict' | 'failed';
  last_sync: string;
  operations_count: number;
  data_size_mb: number;
}

interface MobileUser {
  user_id: string;
  device_type: string;
  connection_status: 'online' | 'offline' | 'syncing';
  last_activity: string;
  offline_operations: number;
  sync_pending: number;
  performance_score: number;
}

export function MobileFirstDashboard({ organizationId }: MobileFirstDashboardProps) {
  const [isOnline, setIsOnline] = useState(true);
  const [metrics, setMetrics] = useState<MobileMetrics>({
    total_mobile_users: 156,
    active_mobile_sessions: 47,
    offline_operations_today: 2847,
    sync_success_rate: 98.7,
    avg_offline_duration: 12.5,
    camera_scans_today: 387,
    mobile_performance_score: 94.2,
    offline_storage_usage: 67.3
  });

  const [offlineCapabilities, setOfflineCapabilities] = useState<OfflineCapability[]>([
    {
      feature_name: 'Order Management',
      offline_ready: true,
      sync_status: 'synced',
      last_sync: '2 minutes ago',
      operations_count: 145,
      data_size_mb: 12.4
    },
    {
      feature_name: 'Inventory Tracking',
      offline_ready: true,
      sync_status: 'pending',
      last_sync: '15 minutes ago',
      operations_count: 89,
      data_size_mb: 8.7
    },
    {
      feature_name: 'Menu Management',
      offline_ready: true,
      sync_status: 'synced',
      last_sync: '5 minutes ago',
      operations_count: 23,
      data_size_mb: 15.2
    },
    {
      feature_name: 'Payment Processing',
      offline_ready: false,
      sync_status: 'synced',
      last_sync: 'Real-time only',
      operations_count: 0,
      data_size_mb: 0
    },
    {
      feature_name: 'Document Scanning',
      offline_ready: true,
      sync_status: 'synced',
      last_sync: '1 minute ago',
      operations_count: 67,
      data_size_mb: 45.8
    },
    {
      feature_name: 'Employee Scheduling',
      offline_ready: true,
      sync_status: 'conflict',
      last_sync: '1 hour ago',
      operations_count: 12,
      data_size_mb: 3.1
    }
  ]);

  const [mobileUsers, setMobileUsers] = useState<MobileUser[]>([
    {
      user_id: 'user-001',
      device_type: 'iPhone 15',
      connection_status: 'online',
      last_activity: '30 seconds ago',
      offline_operations: 15,
      sync_pending: 0,
      performance_score: 97.2
    },
    {
      user_id: 'user-042',
      device_type: 'Samsung Galaxy',
      connection_status: 'offline',
      last_activity: '5 minutes ago',
      offline_operations: 23,
      sync_pending: 8,
      performance_score: 91.5
    },
    {
      user_id: 'user-078',
      device_type: 'iPad Pro',
      connection_status: 'syncing',
      last_activity: '1 minute ago',
      offline_operations: 7,
      sync_pending: 3,
      performance_score: 95.8
    }
  ]);

  // Simulate network status changes
  useEffect(() => {
    const interval = setInterval(() => {
      // Randomly toggle online status to demonstrate offline capabilities
      if (Math.random() < 0.1) { // 10% chance to change status
        setIsOnline(prev => !prev);
      }

      // Update metrics to show real-time activity
      setMetrics(prev => ({
        ...prev,
        active_mobile_sessions: prev.active_mobile_sessions + Math.floor(Math.random() * 3) - 1,
        offline_operations_today: prev.offline_operations_today + Math.floor(Math.random() * 5),
        camera_scans_today: prev.camera_scans_today + Math.floor(Math.random() * 2)
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const simulateOfflineOperation = async () => {
    try {
      // Simulate offline operation using HERA Universal patterns
      const offlineTransaction = {
        id: crypto.randomUUID(),
        organization_id: organizationId,
        transaction_type: 'offline_operation',
        transaction_status: 'pending_sync',
        offline_timestamp: new Date().toISOString(),
        sync_required: true,
        device_info: navigator.userAgent.substring(0, 50)
      };

      console.log('Offline operation created:', offlineTransaction);
      alert('✅ Offline operation completed successfully!\nWill sync automatically when connection is restored.');
      
      // Update offline capabilities
      setOfflineCapabilities(prev => 
        prev.map(cap => 
          cap.feature_name === 'Order Management' 
            ? { ...cap, operations_count: cap.operations_count + 1, sync_status: 'pending' as const }
            : cap
        )
      );
    } catch (error) {
      console.error('Offline operation failed:', error);
    }
  };

  const simulateCameraScan = async () => {
    try {
      // Simulate camera scanning with TensorFlow.js processing
      console.log('Camera scan initiated with AI processing...');
      
      const scanResult = {
        id: crypto.randomUUID(),
        organization_id: organizationId,
        scan_type: 'document_processing',
        ai_confidence: Math.random() * 0.3 + 0.7, // 70-100% confidence
        offline_capable: true,
        processing_time_ms: Math.floor(Math.random() * 1000) + 500
      };

      alert(`📸 Document scanned successfully!\nAI Confidence: ${Math.round(scanResult.ai_confidence * 100)}%\nProcessing Time: ${scanResult.processing_time_ms}ms`);
      
      setMetrics(prev => ({
        ...prev,
        camera_scans_today: prev.camera_scans_today + 1
      }));
    } catch (error) {
      console.error('Camera scan failed:', error);
    }
  };

  const getConnectionIcon = () => {
    return isOnline ? (
      <Wifi className="w-5 h-5 text-green-500" />
    ) : (
      <WifiOff className="w-5 h-5 text-red-500" />
    );
  };

  const getConnectionStatus = () => {
    return isOnline ? (
      <Badge className="bg-green-100 text-green-800">Online</Badge>
    ) : (
      <Badge className="bg-red-100 text-red-800">Offline</Badge>
    );
  };

  const getSyncStatusIcon = (status: string) => {
    switch (status) {
      case 'synced': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'conflict': return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'failed': return <AlertCircle className="w-4 h-4 text-red-500" />;
      default: return <RefreshCw className="w-4 h-4 text-gray-500" />;
    }
  };

  const getUserStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return <Globe className="w-4 h-4 text-green-500" />;
      case 'offline': return <WifiOff className="w-4 h-4 text-red-500" />;
      case 'syncing': return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
      default: return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Mobile Connection Status Header */}
      <Card className={`${isOnline ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} transition-all duration-500`}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              {getConnectionIcon()}
              <span className="ml-2">Mobile Connection Status</span>
              {getConnectionStatus()}
            </div>
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-1">
                <Signal className="w-4 h-4" />
                <span>Strong</span>
              </div>
              <div className="flex items-center space-x-1">
                <Battery className="w-4 h-4" />
                <span>87%</span>
              </div>
              <div className="flex items-center space-x-1">
                <Cpu className="w-4 h-4" />
                <span>Good</span>
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{metrics.offline_operations_today.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Offline Operations Today</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{metrics.sync_success_rate}%</div>
              <div className="text-sm text-gray-600">Sync Success Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{metrics.avg_offline_duration}min</div>
              <div className="text-sm text-gray-600">Avg Offline Duration</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{metrics.camera_scans_today}</div>
              <div className="text-sm text-gray-600">Camera Scans Today</div>
            </div>
          </div>
          
          {!isOnline && (
            <div className="mt-4 p-4 bg-red-100 border border-red-200 rounded-lg">
              <div className="flex items-center space-x-2 text-red-800">
                <WifiOff className="w-5 h-5" />
                <span className="font-semibold">Offline Mode Active</span>
              </div>
              <p className="text-sm text-red-700 mt-1">
                All operations continue normally. Data will sync automatically when connection is restored.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Mobile Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Smartphone className="w-5 h-5 mr-2 text-blue-500" />
              Mobile-First Operations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={simulateOfflineOperation}
              className="w-full bg-gradient-to-r from-blue-500 to-cyan-500"
            >
              <Zap className="w-4 h-4 mr-2" />
              Create Offline Order
            </Button>
            
            <Button 
              onClick={simulateCameraScan}
              className="w-full bg-gradient-to-r from-green-500 to-blue-500"
            >
              <Camera className="w-4 h-4 mr-2" />
              Scan Document with AI
            </Button>
            
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" className="flex items-center">
                <Download className="w-3 h-3 mr-1" />
                Sync Down
              </Button>
              <Button variant="outline" size="sm" className="flex items-center">
                <Upload className="w-3 h-3 mr-1" />
                Sync Up
              </Button>
            </div>
            
            <div className="text-center p-3 bg-white/50 dark:bg-slate-800/50 rounded-lg">
              <div className="text-lg font-bold text-blue-600">100%</div>
              <div className="text-sm text-gray-600">Offline Capability</div>
              <Progress value={100} className="mt-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="w-5 h-5 mr-2 text-purple-500" />
              Active Mobile Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mobileUsers.map((user) => (
                <div key={user.user_id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getUserStatusIcon(user.connection_status)}
                    <div>
                      <div className="font-medium">{user.device_type}</div>
                      <div className="text-sm text-gray-600">{user.last_activity}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{user.performance_score}%</div>
                    <div className="text-xs text-gray-600">
                      {user.sync_pending > 0 ? `${user.sync_pending} pending` : 'synced'}
                    </div>
                  </div>
                </div>
              ))}
              
              <div className="text-center text-sm text-gray-600 pt-2">
                {metrics.active_mobile_sessions} active sessions • {metrics.total_mobile_users} total users
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Offline Capabilities */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="w-5 h-5 mr-2 text-green-500" />
            Offline-Ready Features
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {offlineCapabilities.map((capability) => (
              <div key={capability.feature_name} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium">{capability.feature_name}</h4>
                  <div className="flex items-center space-x-2">
                    {getSyncStatusIcon(capability.sync_status)}
                    <Badge variant={capability.offline_ready ? "default" : "secondary"}>
                      {capability.offline_ready ? 'Offline Ready' : 'Online Only'}
                    </Badge>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Operations:</span>
                    <span className="font-medium">{capability.operations_count}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Data Size:</span>
                    <span className="font-medium">{capability.data_size_mb.toFixed(1)} MB</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Last Sync:</span>
                    <span className="font-medium">{capability.last_sync}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className={`font-medium capitalize ${
                      capability.sync_status === 'synced' ? 'text-green-600' : 
                      capability.sync_status === 'pending' ? 'text-yellow-600' : 
                      'text-red-600'
                    }`}>
                      {capability.sync_status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Mobile Performance Metrics */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="w-5 h-5 mr-2 text-purple-500" />
            Mobile Performance & Storage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <div className="text-2xl font-bold text-purple-600">{metrics.mobile_performance_score}%</div>
              <div className="text-sm text-gray-600">Performance Score</div>
              <Progress value={metrics.mobile_performance_score} className="mt-2" />
            </div>
            
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto">
                <Eye className="w-8 h-8 text-white" />
              </div>
              <div className="text-2xl font-bold text-blue-600">{metrics.offline_storage_usage.toFixed(1)}%</div>
              <div className="text-sm text-gray-600">Storage Usage</div>
              <Progress value={metrics.offline_storage_usage} className="mt-2" />
            </div>
            
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <div className="text-2xl font-bold text-green-600">60fps</div>
              <div className="text-sm text-gray-600">UI Performance</div>
              <div className="text-xs text-green-600 font-medium">Smooth animations</div>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-white/50 dark:bg-slate-800/50 rounded-lg">
            <div className="text-center">
              <div className="text-lg font-bold text-purple-700 dark:text-purple-300">
                📱 Complete Mobile-First Architecture
              </div>
              <div className="text-sm text-gray-600 mt-1">
                100% offline-capable • TensorFlow.js AI processing • Real-time sync • Universal camera service
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="text-center text-xs text-gray-500">
        Mobile-First HERA Universal • Organization: {organizationId} • 
        {isOnline ? 'Connected' : 'Offline Mode'} • 
        All operations continue seamlessly
      </div>
    </div>
  );
}