/**
 * HERA Universal - Inventory Alerts Panel
 * 
 * Professional alerts panel with theme-aware design
 */

'use client';

import { AlertTriangle, Package, Clock, TrendingUp, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface InventoryAlert {
  id: string;
  name: string;
  alertType: 'out_of_stock' | 'low_stock' | 'overstock' | 'slow_moving' | 'fast_moving' | 'expiring_soon';
  urgency: 'high' | 'medium' | 'low';
  currentStock: number;
  suggestedAction: string;
}

interface InventoryAlertsPanelProps {
  alerts: InventoryAlert[];
}

const alertConfig = {
  out_of_stock: {
    icon: Package,
    color: 'text-red-500',
    bgColor: 'bg-red-50 dark:bg-red-900/20',
    borderColor: 'border-red-200 dark:border-red-800'
  },
  low_stock: {
    icon: TrendingDown,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
    borderColor: 'border-yellow-200 dark:border-yellow-800'
  },
  overstock: {
    icon: TrendingUp,
    color: 'text-purple-500',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    borderColor: 'border-purple-200 dark:border-purple-800'
  },
  slow_moving: {
    icon: Clock,
    color: 'text-blue-500',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    borderColor: 'border-blue-200 dark:border-blue-800'
  },
  fast_moving: {
    icon: TrendingUp,
    color: 'text-green-500',
    bgColor: 'bg-green-50 dark:bg-green-900/20',
    borderColor: 'border-green-200 dark:border-green-800'
  },
  expiring_soon: {
    icon: AlertTriangle,
    color: 'text-orange-500',
    bgColor: 'bg-orange-50 dark:bg-orange-900/20',
    borderColor: 'border-orange-200 dark:border-orange-800'
  }
};

const urgencyConfig = {
  high: {
    dot: 'bg-red-500',
    text: 'text-red-700 dark:text-red-300'
  },
  medium: {
    dot: 'bg-yellow-500',
    text: 'text-yellow-700 dark:text-yellow-300'
  },
  low: {
    dot: 'bg-blue-500',
    text: 'text-blue-700 dark:text-blue-300'
  }
};

export function InventoryAlertsPanel({ alerts }: InventoryAlertsPanelProps) {
  // Sort alerts by urgency (high first)
  const sortedAlerts = [...alerts].sort((a, b) => {
    const urgencyOrder = { high: 0, medium: 1, low: 2 };
    return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
  });

  const highUrgencyCount = alerts.filter(alert => alert.urgency === 'high').length;
  const mediumUrgencyCount = alerts.filter(alert => alert.urgency === 'medium').length;

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            Inventory Alerts
          </h3>
          <div className="flex items-center space-x-2">
            {highUrgencyCount > 0 && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300">
                {highUrgencyCount} urgent
              </span>
            )}
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {alerts.length} total
            </span>
          </div>
        </div>
      </div>

      {/* Alerts List */}
      <div className="max-h-96 overflow-y-auto">
        {alerts.length === 0 ? (
          <div className="p-6 text-center">
            <Package className="w-8 h-8 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No alerts at this time
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              All inventory levels are within normal ranges
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {sortedAlerts.map((alert) => {
              const config = alertConfig[alert.alertType];
              const urgency = urgencyConfig[alert.urgency];
              const Icon = config.icon;

              return (
                <div key={alert.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200">
                  <div className="flex items-start space-x-3">
                    {/* Icon */}
                    <div className={`flex-shrink-0 p-2 rounded-lg ${config.bgColor} border ${config.borderColor}`}>
                      <Icon className={`w-4 h-4 ${config.color}`} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                          {alert.name}
                        </h4>
                        <div className="flex items-center space-x-1">
                          <div className={`w-2 h-2 rounded-full ${urgency.dot}`}></div>
                          <span className={`text-xs font-medium capitalize ${urgency.text}`}>
                            {alert.urgency}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                        {alert.alertType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        {alert.currentStock !== undefined && (
                          <span className="ml-2">• {alert.currentStock} in stock</span>
                        )}
                      </p>

                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                        {alert.suggestedAction}
                      </p>

                      {/* Quick Actions */}
                      {(alert.alertType === 'out_of_stock' || alert.alertType === 'low_stock') && (
                        <Button variant="outline" size="sm" className="text-xs">
                          Create PO
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      {alerts.length > 0 && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
          <Button variant="outline" size="sm" fullWidth>
            View All Alerts
          </Button>
        </div>
      )}
    </div>
  );
}