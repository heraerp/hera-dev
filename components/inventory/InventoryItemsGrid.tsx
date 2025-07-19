/**
 * HERA Universal - Inventory Items Grid
 * 
 * Professional grid layout with theme-aware design
 */

'use client';

import { Package, Edit, MoreHorizontal, TrendingUp, TrendingDown } from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/button';

interface InventoryItem {
  id: string;
  name: string;
  code: string;
  category: string;
  unitPrice: number;
  currentStock: number;
  reorderPoint: number;
  maxStockLevel: number;
  unitOfMeasure: string;
  stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock' | 'overstock';
  lastUpdated: string;
}

interface InventoryItemsGridProps {
  items: InventoryItem[];
  onRefresh: () => void;
}

export function InventoryItemsGrid({ items, onRefresh }: InventoryItemsGridProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getStockIcon = (status: string) => {
    switch (status) {
      case 'out_of_stock':
      case 'low_stock':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      case 'overstock':
        return <TrendingUp className="w-4 h-4 text-purple-500" />;
      default:
        return <TrendingUp className="w-4 h-4 text-green-500" />;
    }
  };

  const getStockPercentage = (current: number, max: number) => {
    if (max === 0) return 0;
    return Math.min((current / max) * 100, 100);
  };

  const getStockBarColor = (status: string) => {
    switch (status) {
      case 'out_of_stock':
        return 'bg-red-500';
      case 'low_stock':
        return 'bg-yellow-500';
      case 'overstock':
        return 'bg-purple-500';
      default:
        return 'bg-green-500';
    }
  };

  if (items.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-12 text-center">
        <Package className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          No inventory items found
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          Try adjusting your search or filters, or add your first inventory item.
        </p>
        <Button>
          <Package className="w-4 h-4 mr-2" />
          Add First Item
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
          Inventory Items ({items.length})
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg p-6 hover:shadow-md dark:hover:shadow-gray-900/20 transition-all duration-200"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {item.name}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {item.code} • {item.category}
                  </p>
                </div>
                <div className="flex items-center space-x-1 ml-2">
                  {getStockIcon(item.stockStatus)}
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Status Badge */}
              <div className="mb-4">
                <StatusBadge status={item.stockStatus} size="sm" />
              </div>

              {/* Stock Level */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Current Stock</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {item.currentStock} {item.unitOfMeasure}
                  </span>
                </div>
                
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${getStockBarColor(item.stockStatus)}`}
                    style={{
                      width: `${getStockPercentage(item.currentStock, item.maxStockLevel)}%`
                    }}
                  ></div>
                </div>
                
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>Reorder: {item.reorderPoint}</span>
                  <span>Max: {item.maxStockLevel}</span>
                </div>
              </div>

              {/* Price and Value */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Unit Price</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {formatCurrency(item.unitPrice)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Stock Value</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {formatCurrency(item.currentStock * item.unitPrice)}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-600">
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  Updated {new Date(item.lastUpdated).toLocaleDateString()}
                </span>
                <Button variant="outline" size="sm">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}