"use client"

import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/revolutionary-card';
import { Button } from '@/components/ui/revolutionary-button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import motionConfig from '@/lib/motion';
import { 
  Edit,
  Copy,
  Archive,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Package,
  Clock,
  DollarSign,
  Package2
} from 'lucide-react';

interface ProductCardProps {
  product: {
    id: string;
    entity_name: string;
    entity_code: string;
    category: string;
    price: number;
    inventory_count: number;
    minimum_stock: number;
    cost_per_unit: number;
    preparation_time_minutes: number;
    description: string;
    product_type: string;
    unit_type: string;
    allergens: string;
    calories: number;
    is_active: boolean;
    status: 'in_stock' | 'low_stock' | 'out_of_stock';
  };
  onEdit: (product: any) => void;
  onDuplicate: (product: any) => void;
  onArchive: (productId: string) => void;
  index?: number;
}

export default function ProductCard({ 
  product, 
  onEdit, 
  onDuplicate, 
  onArchive, 
  index = 0 
}: ProductCardProps) {
  
  // Get status color and icon
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'in_stock':
        return { 
          color: 'bg-green-100 text-green-800 border-green-200', 
          icon: CheckCircle, 
          label: 'In Stock',
          textColor: 'text-green-600'
        };
      case 'low_stock':
        return { 
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200', 
          icon: AlertTriangle, 
          label: 'Low Stock',
          textColor: 'text-yellow-600'
        };
      case 'out_of_stock':
        return { 
          color: 'bg-red-100 text-red-800 border-red-200', 
          icon: XCircle, 
          label: 'Out of Stock',
          textColor: 'text-red-600'
        };
      default:
        return { 
          color: 'bg-gray-100 text-gray-800 border-gray-200', 
          icon: Package, 
          label: 'Unknown',
          textColor: 'text-gray-600'
        };
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Get category color
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'tea':
        return 'bg-green-100 text-green-800';
      case 'pastries':
        return 'bg-orange-100 text-orange-800';
      case 'packaging':
        return 'bg-purple-100 text-purple-800';
      case 'supplies':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  // Calculate stock percentage
  const stockPercentage = product.minimum_stock > 0 
    ? Math.min(100, (product.inventory_count / product.minimum_stock) * 100)
    : 100;

  const statusInfo = getStatusInfo(product.status);
  const StatusIcon = statusInfo.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ ...motionConfig.spring.bounce, delay: index * 0.05 }}
      whileHover={{ scale: 1.02 }}
      className="h-full"
    >
      <Card className="p-6 hover:shadow-lg transition-all duration-300 h-full flex flex-col">
        <div className="space-y-4 flex-1">
          {/* Product Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-bold text-lg text-gray-800 mb-1 line-clamp-2">
                {product.entity_name}
              </h3>
              <p className="text-sm text-gray-600 mb-2 font-mono">{product.entity_code}</p>
              <div className="flex items-center space-x-2">
                <Badge className={cn("text-xs", statusInfo.color)}>
                  <StatusIcon className="w-3 h-3 mr-1" />
                  {statusInfo.label}
                </Badge>
                <Badge variant="outline" className={cn("text-xs", getCategoryColor(product.category))}>
                  {product.category}
                </Badge>
              </div>
            </div>
            <div className="text-right ml-4">
              {product.price > 0 && (
                <div className="text-lg font-bold text-gray-800">{formatCurrency(product.price)}</div>
              )}
              <div className="text-sm text-gray-600">Cost: {formatCurrency(product.cost_per_unit)}</div>
            </div>
          </div>

          {/* Product Image Placeholder */}
          <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center">
            <Package2 className="w-8 h-8 text-gray-400" />
          </div>

          {/* Product Description */}
          <div className="space-y-2">
            <p className="text-sm text-gray-700 line-clamp-2">{product.description}</p>
            
            {/* Stock Level Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Stock Level</span>
                <span className={cn("font-medium", statusInfo.textColor)}>
                  {product.inventory_count} {product.unit_type}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={cn(
                    "h-2 rounded-full transition-all duration-300",
                    product.status === 'in_stock' ? 'bg-green-500' :
                    product.status === 'low_stock' ? 'bg-yellow-500' : 'bg-red-500'
                  )}
                  style={{ width: `${Math.max(5, Math.min(100, stockPercentage))}%` }}
                />
              </div>
              <div className="text-xs text-gray-500">
                Minimum: {product.minimum_stock} {product.unit_type}
              </div>
            </div>
          </div>

          {/* Product Details Grid */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            {product.preparation_time_minutes > 0 && (
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600">Prep: {product.preparation_time_minutes}m</span>
              </div>
            )}
            {product.calories > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-gray-600">Calories: {product.calories}</span>
              </div>
            )}
            {product.allergens && product.allergens !== 'None' && (
              <div className="col-span-2">
                <span className="text-gray-600">Allergens: </span>
                <span className="text-sm text-orange-600 font-medium">{product.allergens}</span>
              </div>
            )}
          </div>

          {/* Product Type & Unit */}
          <div className="flex items-center justify-between text-sm">
            <Badge variant="outline" className="text-xs">
              {product.product_type.replace('_', ' ')}
            </Badge>
            <span className="text-gray-600">Unit: {product.unit_type}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2 pt-4 border-t border-gray-200 mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(product)}
            className="flex-1 hover:bg-blue-50 min-h-[36px] text-xs md:text-sm"
          >
            <Edit className="w-3 h-3 md:w-4 md:h-4 mr-1" />
            <span className="hidden sm:inline">Edit</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDuplicate(product)}
            className="flex-1 hover:bg-green-50 min-h-[36px] text-xs md:text-sm"
          >
            <Copy className="w-3 h-3 md:w-4 md:h-4 mr-1" />
            <span className="hidden sm:inline">Duplicate</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onArchive(product.id)}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 min-h-[36px] min-w-[36px] px-2"
          >
            <Archive className="w-3 h-3 md:w-4 md:h-4" />
          </Button>
        </div>

        {/* Quick Stock Update */}
        <div className="mt-2 pt-2 border-t border-gray-100">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                // Handle quick stock decrease
                console.log('Decrease stock for', product.id);
              }}
              className="text-sm font-semibold px-3 py-2 h-8 min-w-[32px] hover:bg-red-50 hover:text-red-600"
            >
              -
            </Button>
            <span className="text-xs text-gray-600 flex-1 text-center">
              Quick Stock Update
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                // Handle quick stock increase
                console.log('Increase stock for', product.id);
              }}
              className="text-sm font-semibold px-3 py-2 h-8 min-w-[32px] hover:bg-green-50 hover:text-green-600"
            >
              +
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}